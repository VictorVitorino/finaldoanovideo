"""Monta o v20 corrigido: o vídeo original (build/azul/v20in/v20.mp4) com os quadros tratados (build/azul/v20in/fix/
nNNNNNN.png) sobrepostos nos seus intervalos; áudio copiado sem alteração.

Saídas: build/azul/Projeto-Totvs-Final-do-ano-v20-pernas.mp4 (master, crf 18) e ...-leve.mp4 (crf 26, < 30 MB).
Uso: python3 producao/v20_montar.py [--crf 18] [--leve 26]
"""
import argparse, os, re, subprocess

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(RAIZ, 'build', 'azul', 'v20in')
FIX, ORIG = os.path.join(BASE, 'fix'), os.path.join(BASE, 'v20.mp4')
FPS = 30


def intervalos():
    """faixas contíguas de quadros tratados"""
    ns = sorted(int(m.group(1)) for f in os.listdir(FIX) if (m := re.match(r'n(\d{6})\.png$', f)))
    out, a, p = [], ns[0], ns[0]
    for n in ns[1:]:
        if n != p + 1: out.append((a, p)); a = n
        p = n
    out.append((a, p))
    return out


def montar(saida, crf, faixas):
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', ORIG]
    fc, atual = '', '[0:v]'
    for i, (a, b) in enumerate(faixas, start=1):
        cmd += ['-framerate', str(FPS), '-start_number', str(a), '-i', os.path.join(FIX, 'n%06d.png')]
        fc += f"[{i}:v]setpts=PTS-STARTPTS+{a}/{FPS}/TB,format=yuv420p[f{i}];"
        fc += f"{atual}[f{i}]overlay=eof_action=pass:enable='between(n,{a},{b})'[v{i}];"
        atual = f'[v{i}]'
    fc = fc.rstrip(';')
    cmd += ['-filter_complex', fc, '-map', atual, '-map', '0:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf),
            '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', saida]
    subprocess.run(cmd, check=True)
    print(saida, round(os.path.getsize(saida) / 1e6, 1), 'MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--crf', type=int, default=18)
    ap.add_argument('--leve', type=int, default=26)
    ap.add_argument('--so-leve', action='store_true')
    a = ap.parse_args()
    faixas = intervalos()
    print('faixas:', faixas)
    if not a.so_leve: montar(os.path.join(RAIZ, 'build', 'azul', 'Projeto-Totvs-Final-do-ano-v20-pernas.mp4'), a.crf, faixas)
    montar(os.path.join(RAIZ, 'build', 'azul', 'Projeto-Totvs-Final-do-ano-v20-pernas-leve.mp4'), a.leve, faixas)
