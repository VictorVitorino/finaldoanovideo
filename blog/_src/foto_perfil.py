"""Prepara a foto do autor para o site: corrige a orientação, recorta em retrato 4:5 (preservando o alto da imagem,
onde costuma ficar o rosto), reduz para 960 × 1200 e grava em blog/assets/img/victor-vitorino.jpg sem os metadados
da câmera (local, aparelho). Depois é só rodar o build: a foto aparece em Serviços ("Quem conduz" e contato),
em Sobre (cartão de contato) e na página inicial ("Quem escreve").

Uso: python3 blog/_src/foto_perfil.py <arquivo-da-foto> [--topo 0.10]
     --topo: quanto do excesso de altura sai de cima (0 = mantém o topo, 0.5 = centraliza). Padrão 0.10.
"""
import json, os, sys
from PIL import Image, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__))
PERFIL = os.path.join(AQUI, 'content', 'perfil.json')
LARG, ALT = 960, 1200


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args: print(__doc__); return 2
    topo = float(sys.argv[sys.argv.index('--topo') + 1]) if '--topo' in sys.argv else 0.10
    destino = os.path.join(AQUI, '..', json.load(open(PERFIL, encoding='utf-8'))['foto'])
    im = ImageOps.exif_transpose(Image.open(args[0])).convert('RGB')
    w, h = im.size; alvo = LARG / ALT
    if w / h > alvo:                                   # larga demais: corta as laterais por igual
        nw = round(h * alvo); x = (w - nw) // 2; im = im.crop((x, 0, x + nw, h))
    else:                                              # alta demais: tira pouco de cima e o resto de baixo
        nh = round(w / alvo); y = round((h - nh) * topo); im = im.crop((0, y, w, y + nh))
    if im.width > LARG: im = im.resize((LARG, ALT), Image.LANCZOS)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    im.save(destino, 'JPEG', quality=86, optimize=True, progressive=True)
    aviso = '' if min(w, h) >= 600 else '  (atenção: a imagem original é pequena e pode ficar sem nitidez)'
    print('foto gravada em %s · %d × %d · %d KB%s' % (os.path.relpath(destino), im.width, im.height, os.path.getsize(destino) // 1024, aviso))
    print('agora rode: node blog/_src/build.mjs')
    return 0


if __name__ == '__main__': sys.exit(main())
