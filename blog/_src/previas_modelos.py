"""Gera as prévias reais dos modelos para baixar (PowerPoint e Excel): converte cada arquivo de blog/assets/modelos/
em PDF com o LibreOffice, tira as primeiras páginas como imagem e grava em blog/assets/img/modelos/.
Também conta slides e abas e lê o texto da capa de cada apresentação (olho e título do primeiro slide), que o site
usa para mostrar a mesma capa do arquivo, animada. O resultado vai para blog/_src/content/modelos-previas.json,
que o build junta ao catálogo.
Uso: python3 blog/_src/previas_modelos.py            (precisa de libreoffice, pdftoppm e Pillow)
     python3 blog/_src/previas_modelos.py --textos   (só relê slides, abas e capas; não refaz as imagens)
     python3 blog/_src/previas_modelos.py --so pptx  (refaz só as apresentações; ou --so xlsx)
"""
import glob, json, os, re, shutil, subprocess, sys, tempfile
from PIL import Image, ImageStat

AQUI = os.path.dirname(os.path.abspath(__file__))
MODELOS = os.path.join(AQUI, '..', 'assets', 'modelos')
SAIDA = os.path.join(AQUI, '..', 'assets', 'img', 'modelos')
CATALOGO = os.path.join(AQUI, 'content', 'modelos.json')
DESTINO = os.path.join(AQUI, 'content', 'modelos-previas.json')
LARGURA, MAX_PAGINAS = 960, 4


def capa_do_deck(prs):
    """Olho e título da capa (primeiro slide), com as quebras de linha e os trechos em itálico como estão no arquivo."""
    from pptx.oxml.ns import qn
    saida = {}
    for ph in prs.slides[0].placeholders:
        idx = ph.placeholder_format.idx
        if idx == 13: saida['olho'] = ph.text_frame.text.strip()
        elif idx == 0:
            linhas, atual = [], []
            for par in ph.text_frame._txBody.iterchildren(qn('a:p')):
                for el in par:
                    if el.tag == qn('a:br'): linhas.append(atual); atual = []
                    elif el.tag == qn('a:r'):
                        rpr, t = el.find(qn('a:rPr')), el.findtext(qn('a:t')) or ''
                        if t: atual.append({'t': t, 'i': bool(rpr is not None and rpr.get('i') == '1')})
                linhas.append(atual); atual = []
            saida['titulo'] = [l for l in linhas if l]
    return saida if saida.get('titulo') else None


def fatos(caminho):
    """Quantos slides ou quais abas o arquivo tem (e, nas apresentações, o texto da capa)."""
    if caminho.endswith('.pptx'):
        from pptx import Presentation
        prs = Presentation(caminho); n = len(prs.slides)
        return {'n': n, 'texto': '%d slides editáveis' % n, 'capa_txt': capa_do_deck(prs)}
    from openpyxl import load_workbook
    abas = load_workbook(caminho, read_only=True).sheetnames
    return {'n': len(abas), 'texto': '%d abas: %s' % (len(abas), ', '.join(abas[:4]) + ('…' if len(abas) > 4 else '')), 'abas': abas}


def registro(imagens, capa, f):
    r = {'previas': imagens, 'capa': capa, 'fatos': f['texto'], 'n': f['n']}
    if f.get('capa_txt'): r['capa_txt'] = f['capa_txt']
    return r


def so_textos(catalogo):
    """Relê slides, abas e capas dos arquivos e mantém as imagens que já existem."""
    atual = json.load(open(DESTINO, encoding='utf-8')) if os.path.exists(DESTINO) else {}; falhas = 0
    for m in catalogo:
        origem = os.path.join(MODELOS, m['arquivo'])
        if not os.path.exists(origem): print('FALTA', m['arquivo']); falhas += 1; continue
        velho = atual.get(m['id'], {}); f = fatos(origem)
        atual[m['id']] = registro(velho.get('previas', []), velho.get('capa', 0), f)
        print('ok  %-40s %s%s' % (m['arquivo'], f['texto'], ' · capa lida' if f.get('capa_txt') else ''))
    json.dump(atual, open(DESTINO, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); open(DESTINO, 'a').write('\n')
    return 1 if falhas else 0


def main():
    catalogo = json.load(open(CATALOGO, encoding='utf-8')); os.makedirs(SAIDA, exist_ok=True)
    if '--textos' in sys.argv: return so_textos(catalogo)
    tmp = tempfile.mkdtemp(prefix='previas-'); perfil = 'file://' + os.path.join(tmp, 'perfil'); falhas = 0
    so = sys.argv[sys.argv.index('--so') + 1].lower() if '--so' in sys.argv else ''
    saida = json.load(open(DESTINO, encoding='utf-8')) if so and os.path.exists(DESTINO) else {}      # com --so, os demais ficam como estão
    for m in catalogo:
        if so and not m['arquivo'].lower().endswith('.' + so): continue
        origem = os.path.join(MODELOS, m['arquivo'])
        if not os.path.exists(origem): print('FALTA', m['arquivo']); falhas += 1; continue
        pasta = os.path.join(tmp, m['id']); os.makedirs(pasta)
        subprocess.run(['soffice', '-env:UserInstallation=' + perfil, '--headless', '--convert-to', 'pdf', '--outdir', pasta, origem], capture_output=True, timeout=240)
        pdfs = glob.glob(os.path.join(pasta, '*.pdf'))
        if not pdfs: print('SEM PDF', m['arquivo']); falhas += 1; continue
        subprocess.run(['pdftoppm', '-r', '80', '-png', '-l', str(MAX_PAGINAS), pdfs[0], os.path.join(pasta, 'p')], capture_output=True, timeout=120)
        for velho in glob.glob(os.path.join(SAIDA, m['id'] + '-*.webp')):      # só as páginas deste modelo (um id pode ser o começo de outro)
            if re.fullmatch(re.escape(m['id']) + r'-\d+\.webp', os.path.basename(velho)): os.remove(velho)
        imagens, tinta = [], []
        for i, png in enumerate(sorted(glob.glob(os.path.join(pasta, 'p-*.png'))), 1):
            im = Image.open(png).convert('RGB')
            if im.width > LARGURA: im = im.resize((LARGURA, round(im.height * LARGURA / im.width)), Image.LANCZOS)
            nome = '%s-%d.webp' % (m['id'], i); im.save(os.path.join(SAIDA, nome), 'WEBP', quality=80, method=6)
            imagens.append({'src': 'assets/img/modelos/' + nome, 'l': im.width, 'a': im.height})
            tinta.append(255 - ImageStat.Stat(im.convert('L')).mean[0])
        f = fatos(origem)
        capa = 0 if origem.endswith('.pptx') or not tinta else tinta.index(max(tinta))
        saida[m['id']] = registro(imagens, capa, f)
        print('ok  %-40s %d imagens · %s' % (m['arquivo'], len(imagens), f['texto']))
    json.dump(saida, open(DESTINO, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); open(DESTINO, 'a').write('\n')
    shutil.rmtree(tmp, ignore_errors=True)
    return 1 if falhas else 0


if __name__ == '__main__': sys.exit(main())
