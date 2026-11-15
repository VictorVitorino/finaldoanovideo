"""Prepara a foto do autor para o site e grava em blog/assets/img/victor-vitorino.jpg, quadrada, sem os metadados
da câmera (local, aparelho). O site sempre mostra a foto em círculo, então o arquivo é um quadrado com o rosto no centro.
Depois é só rodar o build: a foto aparece em Serviços ("Quem conduz" e contato), em Sobre (cartão de contato)
e na página inicial ("Quem escreve").

Uso: python3 blog/_src/foto_perfil.py <arquivo-da-foto> [--topo 0.10] [--circulo]
     foto comum: corrige a orientação e recorta um quadrado (--topo: quanto do excesso de altura sai de cima;
                 0 mantém o topo, 0.5 centraliza; padrão 0.10).
     --circulo:  para um print em que a foto aparece dentro de um círculo sobre fundo liso (o visualizador de
                 "Foto do perfil" do LinkedIn, por exemplo): acha o círculo sozinho e recorta só ele.
"""
import json, os, sys
from PIL import Image, ImageFilter, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__))
PERFIL = os.path.join(AQUI, 'content', 'perfil.json')
LADO = 720


def circulo(im):
    """Caixa do círculo da foto num print de fundo liso: o que difere do fundo, fora das bordas do print."""
    w, h = im.size; px = im.load(); fundo = px[w - 12, h // 2]
    dif = lambda c: max(abs(c[i] - fundo[i]) for i in range(3))
    xs, ys = [], []
    for y in range(int(h * .1), h - 4):
        linha = [x for x in range(int(w * .18), int(w * .85)) if dif(px[x, y]) > 28]
        if len(linha) > 6: ys.append(y); xs += [min(linha), max(linha)]
    if not ys: raise SystemExit('não achei um círculo de foto neste arquivo')
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys); lado = min(x1 - x0, y1 - y0) + 1
    if abs((x1 - x0) - (y1 - y0)) > lado * .06: raise SystemExit('a área encontrada não é um círculo (%d × %d)' % (x1 - x0 + 1, y1 - y0 + 1))
    cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, lado / 2 - 3          # 3 px para dentro: nada do fundo entra no recorte
    return tuple(round(v) for v in (cx - r, cy - r, cx + r, cy + r))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args: print(__doc__); return 2
    args = [a for a in args if not a.replace('.', '').isdigit()]
    topo = float(sys.argv[sys.argv.index('--topo') + 1]) if '--topo' in sys.argv else 0.10
    destino = os.path.join(AQUI, '..', json.load(open(PERFIL, encoding='utf-8'))['foto'])
    im = ImageOps.exif_transpose(Image.open(args[0])).convert('RGB')
    if '--circulo' in sys.argv: im = im.crop(circulo(im))
    else:
        w, h = im.size
        if w > h: x = (w - h) // 2; im = im.crop((x, 0, x + h, h))                    # larga: corta as laterais por igual
        elif h > w: y = round((h - w) * topo); im = im.crop((0, y, w, y + w))        # alta: tira pouco de cima e o resto de baixo
    origem = im.width
    if im.width != LADO: im = im.resize((LADO, LADO), Image.LANCZOS)
    if origem < LADO: im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))   # ampliada: um pouco de nitidez
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    im.save(destino, 'JPEG', quality=88, optimize=True, progressive=True)
    aviso = '' if origem >= 480 else '  (atenção: o original tem só %d px de lado; fica bem em tamanhos pequenos e médios)' % origem
    print('foto gravada em %s · %d × %d · %d KB%s' % (os.path.relpath(destino), im.width, im.height, os.path.getsize(destino) // 1024, aviso))
    print('agora rode: node blog/_src/build.mjs')
    return 0


if __name__ == '__main__': sys.exit(main())
