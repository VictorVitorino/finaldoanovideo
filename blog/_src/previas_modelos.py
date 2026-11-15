"""Gera as prévias reais dos modelos para baixar (PowerPoint e Excel): converte cada arquivo de blog/assets/modelos/
em PDF com o LibreOffice, tira as primeiras páginas como imagem e grava em blog/assets/img/modelos/.
Também conta slides e abas. O resultado vai para blog/_src/content/modelos-previas.json, que o build junta ao catálogo.
Uso: python3 blog/_src/previas_modelos.py   (precisa de libreoffice, pdftoppm e Pillow)
"""
import glob, json, os, shutil, subprocess, sys, tempfile
from PIL import Image, ImageStat

AQUI = os.path.dirname(os.path.abspath(__file__))
MODELOS = os.path.join(AQUI, '..', 'assets', 'modelos')
SAIDA = os.path.join(AQUI, '..', 'assets', 'img', 'modelos')
CATALOGO = os.path.join(AQUI, 'content', 'modelos.json')
DESTINO = os.path.join(AQUI, 'content', 'modelos-previas.json')
LARGURA, MAX_PAGINAS = 960, 4


def fatos(caminho):
    """Quantos slides ou quais abas o arquivo tem."""
    if caminho.endswith('.pptx'):
        from pptx import Presentation
        n = len(Presentation(caminho).slides)
        return {'n': n, 'texto': '%d slides editáveis' % n}
    from openpyxl import load_workbook
    abas = load_workbook(caminho, read_only=True).sheetnames
    return {'n': len(abas), 'texto': '%d abas: %s' % (len(abas), ', '.join(abas[:4]) + ('…' if len(abas) > 4 else '')), 'abas': abas}


def main():
    catalogo = json.load(open(CATALOGO, encoding='utf-8')); os.makedirs(SAIDA, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='previas-'); perfil = 'file://' + os.path.join(tmp, 'perfil'); saida = {}; falhas = 0
    for m in catalogo:
        origem = os.path.join(MODELOS, m['arquivo'])
        if not os.path.exists(origem): print('FALTA', m['arquivo']); falhas += 1; continue
        pasta = os.path.join(tmp, m['id']); os.makedirs(pasta)
        subprocess.run(['soffice', '-env:UserInstallation=' + perfil, '--headless', '--convert-to', 'pdf', '--outdir', pasta, origem], capture_output=True, timeout=240)
        pdfs = glob.glob(os.path.join(pasta, '*.pdf'))
        if not pdfs: print('SEM PDF', m['arquivo']); falhas += 1; continue
        subprocess.run(['pdftoppm', '-r', '80', '-png', '-l', str(MAX_PAGINAS), pdfs[0], os.path.join(pasta, 'p')], capture_output=True, timeout=120)
        for velho in glob.glob(os.path.join(SAIDA, m['id'] + '-*.webp')): os.remove(velho)
        imagens, tinta = [], []
        for i, png in enumerate(sorted(glob.glob(os.path.join(pasta, 'p-*.png'))), 1):
            im = Image.open(png).convert('RGB')
            if im.width > LARGURA: im = im.resize((LARGURA, round(im.height * LARGURA / im.width)), Image.LANCZOS)
            nome = '%s-%d.webp' % (m['id'], i); im.save(os.path.join(SAIDA, nome), 'WEBP', quality=80, method=6)
            imagens.append({'src': 'assets/img/modelos/' + nome, 'l': im.width, 'a': im.height})
            tinta.append(255 - ImageStat.Stat(im.convert('L')).mean[0])
        f = fatos(origem)
        capa = 0 if origem.endswith('.pptx') or not tinta else tinta.index(max(tinta))
        saida[m['id']] = {'previas': imagens, 'capa': capa, 'fatos': f['texto'], 'n': f['n']}
        print('ok  %-40s %d imagens · %s' % (m['arquivo'], len(imagens), f['texto']))
    json.dump(saida, open(DESTINO, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); open(DESTINO, 'a').write('\n')
    shutil.rmtree(tmp, ignore_errors=True)
    return 1 if falhas else 0


if __name__ == '__main__': sys.exit(main())
