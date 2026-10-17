"""Monta o v20 corrigido: decodifica o original (build/azul/v20in/v20.mp4) quadro a quadro, substitui os quadros tratados
(build/azul/v20in/fix/nNNNNNN.png) e recodifica; áudio copiado sem alteração. Master (crf 18) e versão leve (crf 26)
numa só passada.

Uso: python3 producao/v20_montar.py [--crf 18] [--leve 26]
"""
import argparse, os, re, subprocess, sys
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(RAIZ, 'build', 'azul', 'v20in')
FIX, ORIG = os.path.join(BASE, 'fix'), os.path.join(BASE, 'v20.mp4')
W, H, FPS = 1920, 1080, 30


def montar(crf, leve):
    fixos = {int(m.group(1)) for f in os.listdir(FIX) if (m := re.match(r'n(\d{6})\.png$', f))}
    print(len(fixos), 'quadros tratados')
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', ORIG, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, bufsize=10 ** 8)
    saida = os.path.join(RAIZ, 'build', 'azul', 'Projeto-Totvs-Final-do-ano-v20-pernas')
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', ORIG,
                            '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', saida + '.mp4',
                            '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(leve), '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', saida + '-leve.mp4'],
                           stdin=subprocess.PIPE, bufsize=10 ** 8)
    n, tam, usados = 0, W * H * 3, 0
    while True:
        buf = dec.stdout.read(tam)
        if len(buf) < tam: break
        if n in fixos:
            buf = np.array(Image.open(os.path.join(FIX, f'n{n:06d}.png')).convert('RGB'), dtype=np.uint8).tobytes(); usados += 1
        enc.stdin.write(buf); n += 1
        if n % 600 == 0: print(f'  {n} quadros', file=sys.stderr)
    enc.stdin.close(); enc.wait(); dec.wait()
    print(n, 'quadros;', usados, 'substituídos')
    for s in (saida + '.mp4', saida + '-leve.mp4'): print(s, round(os.path.getsize(s) / 1e6, 1), 'MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--crf', type=int, default=18)
    ap.add_argument('--leve', type=int, default=26)
    a = ap.parse_args()
    montar(a.crf, a.leve)
