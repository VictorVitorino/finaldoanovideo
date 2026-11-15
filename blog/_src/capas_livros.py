"""Capas dos livros da estante (blog/_src/content/estante.json), guardadas em blog/assets/img/livros/.

Dois usos:
  python3 blog/_src/capas_livros.py
      Baixa a capa de cada livro pelo ISBN: Google Books e, se faltar, Open Library (precisa de acesso a
      books.google.com e covers.openlibrary.org). Livros com "capa_manual": true ficam como estão.
  python3 blog/_src/capas_livros.py --manual "HCMBOK" caminho/da/capa.png [--base N]
      Usa uma imagem sua como capa do livro cujo título começa com o texto dado: tira a margem branca,
      apara cantos arredondados, ajusta para 480 px de largura e marca o item com "capa_manual": true.
      --base N corta N pixels da base (para tirar uma faixa que não faz parte da capa).

Grava em cada item "capa" (arquivo), "capa_l" e "capa_a" (medidas) e "fonte" (página do livro).
"""
import io, json, os, re, sys, unicodedata, urllib.request
from PIL import Image, ImageFilter, ImageStat

AQUI = os.path.dirname(os.path.abspath(__file__))
ARQ = os.path.join(AQUI, 'content', 'estante.json')
SAIDA = os.path.join(AQUI, '..', 'assets', 'img', 'livros')
AGENTE = {'User-Agent': 'change-management-world-blog/1.0 (capas da estante)'}
LARGURA = 480


def baixa(url, limite=6_000_000):
    with urllib.request.urlopen(urllib.request.Request(url, headers=AGENTE), timeout=40) as r:
        return r.read(limite), r.headers.get('Content-Type', '')


def slug(t):
    t = unicodedata.normalize('NFD', t).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def sem_capa(img):
    """O Google devolve um cartão cinza quando não tem a capa. Ele quase não tem cor nem contraste."""
    p = img.convert('RGB').resize((48, 72))
    cor = ImageStat.Stat(p.convert('HSV')).mean[1]          # saturação média, de 0 a 255
    contraste = max(ImageStat.Stat(p).stddev)
    return cor < 40 and contraste < 24


def do_google(item):
    """Capa pelo ISBN, direto no Google Books (sem a API de busca, que limita consultas sem chave)."""
    if not item.get('isbn'): return None
    base = 'https://books.google.com/books/content?vid=ISBN%s&printsec=frontcover&img=1' % item['isbn']
    for u in (base + '&zoom=1&fife=w480-h720', base + '&zoom=3', base + '&zoom=2'):
        try: corpo, tipo = baixa(u)
        except Exception as e: print('   Google Books falhou:', e); continue
        if not tipo.startswith('image/'): continue
        try: img = Image.open(io.BytesIO(corpo))
        except Exception: continue
        if img.width >= 250 and not sem_capa(img): return corpo, 'https://books.google.com/books?vid=ISBN' + item['isbn']
    return None


def da_openlibrary(item):
    if not item.get('isbn'): return None
    try: corpo, tipo = baixa('https://covers.openlibrary.org/b/isbn/%s-L.jpg?default=false' % item['isbn'])
    except Exception as e: print('   Open Library falhou:', e); return None
    return (corpo, 'https://openlibrary.org/isbn/' + item['isbn']) if tipo.startswith('image/') and len(corpo) > 6000 else None


def grava(est):
    json.dump(est, open(ARQ, 'w', encoding='utf-8'), ensure_ascii=False, indent=2); open(ARQ, 'a').write('\n')


def salva(img, item):
    nome = slug(item['titulo'].split(':')[0]) + '.jpg'
    img.save(os.path.join(SAIDA, nome), 'JPEG', quality=86, optimize=True)
    item['capa'] = 'assets/img/livros/' + nome; item['capa_l'], item['capa_a'] = img.width, img.height
    return nome


# ---------- capa enviada à mão ----------
def claro(p, lim=238):
    return p[0] >= lim and p[1] >= lim and p[2] >= lim


def recorta(img, base=0):
    """Tira a margem branca em volta da capa e apara o que sobra de branco nos cantos arredondados."""
    img = img.convert('RGBA'); fundo = Image.new('RGBA', img.size, (255, 255, 255, 255)); fundo.alpha_composite(img); img = fundo.convert('RGB')
    px = img.load(); L, A = img.size
    cheia = lambda vals: sum(0 if claro(v) else 1 for v in vals) / max(1, len(vals)) > .5      # linha ou coluna que já é capa
    x0 = next(x for x in range(L) if cheia([px[x, y] for y in range(A)]))
    x1 = next(x for x in range(L - 1, -1, -1) if cheia([px[x, y] for y in range(A)]))
    y0 = next(y for y in range(A) if cheia([px[x, y] for x in range(L)]))
    y1 = next(y for y in range(A - 1, -1, -1) if cheia([px[x, y] for x in range(L)])) - base
    # cantos arredondados: anda na diagonal de cada canto até achar a capa; o maior recuo vale para os quatro lados
    recuo = 0
    for cx, cy, dx, dy in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        d = 0
        while d < 24 and claro(px[cx + dx * d, cy + dy * d]): d += 1
        recuo = max(recuo, d + 1 if d else 0)
    return img.crop((x0 + recuo, y0 + recuo, x1 + 1 - recuo, y1 + 1 - recuo)), recuo


def manual(inicio, caminho, base=0):
    est = json.load(open(ARQ, encoding='utf-8')); os.makedirs(SAIDA, exist_ok=True)
    alvo = slug(inicio)
    item = next((it for it in est['itens'] if slug(it['titulo']).startswith(alvo)), None)
    if not item: print('Nenhum livro da estante começa com:', inicio); return 1
    img, recuo = recorta(Image.open(caminho), base)
    if img.width != LARGURA:
        maior = img.width < LARGURA
        img = img.resize((LARGURA, round(img.height * LARGURA / img.width)), Image.LANCZOS)
        if maior: img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))      # ampliada: devolve um pouco de nitidez
    nome = salva(img, item); item['capa_manual'] = True
    grava(est)
    print('ok  %-34s %dx%d  (recuo dos cantos: %d px)  %s' % (nome, img.width, img.height, recuo, item['titulo'][:44]))
    return 0


def main():
    est = json.load(open(ARQ, encoding='utf-8')); os.makedirs(SAIDA, exist_ok=True); falhas = 0
    for it in est['itens']:
        if it.get('capa_manual'): print('--  capa enviada à mão, mantida:', it['titulo'][:50]); continue
        achado = do_google(it) or da_openlibrary(it)
        if not achado: print('SEM CAPA:', it['titulo']); falhas += 1; continue
        corpo, fonte = achado
        img = Image.open(io.BytesIO(corpo)).convert('RGB')
        if img.width > LARGURA: img = img.resize((LARGURA, round(img.height * LARGURA / img.width)), Image.LANCZOS)
        nome = salva(img, it); it['fonte'] = fonte
        print('ok  %-34s %dx%d  %s' % (nome, img.width, img.height, fonte))
    grava(est)
    return 1 if falhas else 0


if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == '--manual':
        if len(a) < 3: print(__doc__); sys.exit(2)
        sys.exit(manual(a[1], a[2], int(a[a.index('--base') + 1]) if '--base' in a else 0))
    sys.exit(main())
