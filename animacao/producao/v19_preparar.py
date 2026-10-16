"""Prepara os insumos do filme v19 (src/azul/*) em build/azul:

- img/<id>.png            retratos 3D do time (assets/personagens/animation-3d), altura máx. 900 px, aparados
- img/<id>_rosto.png      recorte do rosto (220×220, fundo transparente) para os avatares
- img/{totvs_boy,am_boy,antonialli_lider,...}.png  mascotes e variantes (assets/personagens/novos-9-personagens-3d)
- img/{alvarez-marsal,totvs}-branco.png            logos em branco para o fundo azul
- img/meta.json           tamanhos e centro do rosto de cada imagem (lido por src/azul/base.js)
- v19.json                falas, tempos e palavras da narração do v18 (cópia de producao/dados/v19_falas.json)

Uso: python3 producao/v19_preparar.py [--out build/azul]
Os recortes ficam fora do git (build/ é ignorado); só este script e os JSONs de tempo são versionados.
"""
import argparse, glob, json, os, shutil, unicodedata

import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))          # animacao/
REPO = os.path.dirname(RAIZ)
PESSOAS = os.path.join(REPO, 'assets', 'personagens')
LOGOS = os.path.join(RAIZ, 'assets', 'logos')

# nome do arquivo (sem .png) → id usado no código
IDS = {'Bruno Moraes': 'bruno', 'Giovanna Brandão': 'giovanna', 'Guilherme Antonialli': 'antonialli',
       'Jaqueline Valdevino': 'jaqueline', 'José Aires': 'jose', 'João Lopes': 'joao', 'Marcos Massao': 'massao',
       'Marcus Mancini': 'mancini', 'Monica Audrey': 'monica', 'Nara Martins': 'nara', 'Pedro Lanzetta': 'pedro',
       'Thauany Moreira': 'thauany', 'Vinicius de Sousa': 'vinicius'}
# mascotes e variantes de corpo inteiro (altura máx. 1100 px)
PRINCIPAIS = [('mascote-totvs-positivo.png', 'totvs_boy'), ('mascote-am-positivo.png', 'am_boy'),
              ('guilherme-antonialli-lider.png', 'antonialli_lider'), ('giovanna-expressiva.png', 'giovanna_exp'),
              ('bruno-moraes-apresentando.png', 'bruno_apres'), ('jaqueline-valdevino-apresentando.png', 'jaqueline_apres'),
              ('jose-aires-positivo.png', 'jose_pos'), ('monica-audrey-confianca.png', 'monica_conf')]


def aparar(im, limiar=20):
    a = np.array(im)[..., 3]
    ys, xs = np.where(a > limiar)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def limitar(im, hmax):
    if im.height > hmax:
        im = im.resize((int(im.width * hmax / im.height), hmax), Image.LANCZOS)
    return im


def rosto(im):
    """Quadrado centrado no rosto: centro x = mediana dos pixels opacos do topo; lado = 46 % da altura."""
    a = np.array(im)[..., 3]
    H = a.shape[0]
    ys, xs = np.where(a[:int(H * 0.2)] > 128)
    cx, top = int(np.median(xs)), ys.min()
    s = int(0.46 * H)
    cy = top + int(0.21 * H)
    f = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    f.alpha_composite(im.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2)))
    return f.resize((220, 220), Image.LANCZOS), cx


def main(out):
    img = os.path.join(out, 'img')
    os.makedirs(img, exist_ok=True)
    meta = {}
    for f in sorted(glob.glob(os.path.join(PESSOAS, 'animation-3d', '*.png'))):
        nome = unicodedata.normalize('NFC', os.path.basename(f)[:-4])
        i = IDS[nome]
        im = aparar(Image.open(f).convert('RGBA'))
        face, cx = rosto(im)
        k = 900 / im.height if im.height > 900 else 1
        im2 = limitar(im, 900)
        im2.save(os.path.join(img, f'{i}.png'), optimize=True)
        face.save(os.path.join(img, f'{i}_rosto.png'))
        meta[i] = {'nome': nome, 'w': im2.width, 'h': im2.height, 'cx': round(cx * k)}
    for arq, i in PRINCIPAIS:
        im = limitar(aparar(Image.open(os.path.join(PESSOAS, 'novos-9-personagens-3d', arq)).convert('RGBA'), 12), 1100)
        im.save(os.path.join(img, f'{i}.png'), optimize=True)
        meta[i] = {'nome': i + '.png', 'w': im.width, 'h': im.height, 'cx': im.width // 2}
    # Vinicius: busto recortado da imagem nova (acima da antena que ele segura), base esmaecida
    vin = Image.open(os.path.join(PESSOAS, 'novos-9-personagens-3d', 'vinicius-de-sousa-antena.png')).convert('RGBA').crop((40, 0, 720, 600))
    arr = np.array(vin); H, W = arr.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]; arr[..., 3] = np.where((yy > 525) & (xx > 500), 0, arr[..., 3])   # tira a antena
    fade = np.ones(H); fade[H - 64:] = np.linspace(1, 0, 64)
    arr[..., 3] = (arr[..., 3] * fade[:, None]).astype('uint8')
    Image.fromarray(arr).save(os.path.join(img, 'vinicius.png'), optimize=True)
    meta['vinicius'] = {'nome': 'Vinicius de Sousa', 'w': arr.shape[1], 'h': H, 'cx': arr.shape[1] // 2}
    for n in ['alvarez-marsal', 'totvs']:
        arr = np.array(Image.open(os.path.join(LOGOS, n + '.png')).convert('RGBA'))
        arr[..., :3] = 255
        Image.fromarray(arr).save(os.path.join(img, f'{n}-branco.png'))
    json.dump(meta, open(os.path.join(img, 'meta.json'), 'w'), ensure_ascii=False, indent=1)
    shutil.copy(os.path.join(RAIZ, 'producao', 'dados', 'v19_falas.json'), os.path.join(out, 'v19.json'))
    print(f'{len(meta)} imagens em {img}; v19.json copiado')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(RAIZ, 'build', 'azul'))
    main(os.path.abspath(ap.parse_args().out))
