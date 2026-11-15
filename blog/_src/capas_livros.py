"""Baixa as capas dos livros da estante (blog/_src/content/estante.json) e guarda em blog/assets/img/livros/.
Fonte: Google Books (capa pelo ISBN) e, se faltar, Open Library. Grava em cada item "capa" (arquivo) e "fonte" (página do livro).
Uso: python3 blog/_src/capas_livros.py   (precisa de acesso a books.google.com e covers.openlibrary.org)
"""
import io, json, os, re, sys, unicodedata, urllib.parse, urllib.request
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
ARQ = os.path.join(AQUI, 'content', 'estante.json')
SAIDA = os.path.join(AQUI, '..', 'assets', 'img', 'livros')
AGENTE = {'User-Agent': 'change-management-world-blog/1.0 (capas da estante)'}


def baixa(url, limite=6_000_000):
    with urllib.request.urlopen(urllib.request.Request(url, headers=AGENTE), timeout=40) as r:
        return r.read(limite), r.headers.get('Content-Type', '')


def slug(t):
    t = unicodedata.normalize('NFD', t).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def do_google(item):
    """Capa pelo ISBN, direto no Google Books (sem a API de busca, que limita consultas sem chave)."""
    if not item.get('isbn'): return None
    base = 'https://books.google.com/books/content?vid=ISBN%s&printsec=frontcover&img=1' % item['isbn']
    for u in (base + '&zoom=1&fife=w480-h720', base + '&zoom=3', base + '&zoom=2'):
        try: corpo, tipo = baixa(u)
        except Exception as e: print('   Google Books falhou:', e); continue
        if not tipo.startswith('image/'): continue
        try: larg = Image.open(io.BytesIO(corpo)).width
        except Exception: continue
        if larg >= 250: return corpo, 'https://books.google.com/books?vid=ISBN' + item['isbn'], ''
    return None


def da_openlibrary(item):
    if not item.get('isbn'): return None
    try: corpo, tipo = baixa('https://covers.openlibrary.org/b/isbn/%s-L.jpg?default=false' % item['isbn'])
    except Exception as e: print('   Open Library falhou:', e); return None
    return (corpo, 'https://openlibrary.org/isbn/' + item['isbn'], '') if tipo.startswith('image/') and len(corpo) > 6000 else None


def main():
    est = json.load(open(ARQ, encoding='utf-8')); os.makedirs(SAIDA, exist_ok=True); falhas = 0
    for it in est['itens']:
        nome = slug(it['titulo'].split(':')[0]) + '.jpg'
        achado = do_google(it) or da_openlibrary(it)
        if not achado: print('SEM CAPA:', it['titulo']); falhas += 1; continue
        corpo, fonte, titulo = achado
        img = Image.open(io.BytesIO(corpo)).convert('RGB')
        if img.width > 480: img = img.resize((480, round(img.height * 480 / img.width)), Image.LANCZOS)
        img.save(os.path.join(SAIDA, nome), 'JPEG', quality=84, optimize=True)
        it['capa'] = 'assets/img/livros/' + nome; it['capa_l'], it['capa_a'] = img.width, img.height; it['fonte'] = fonte
        print('ok  %-32s %dx%d  %s  (%s)' % (nome, img.width, img.height, fonte, titulo[:40]))
    json.dump(est, open(ARQ, 'w', encoding='utf-8'), ensure_ascii=False, indent=2); open(ARQ, 'a').write('\n')
    return 1 if falhas else 0


if __name__ == '__main__': sys.exit(main())
