"""Monta o v19: quadros renderizados (build/azul/v19/f%05d.jpg) + trecho original mantido (119,2–128,1 s do v18)
+ áudio do v18 intacto. Saídas: build/azul/Projeto-do-Ano-AM-TOTVS-v19.mp4 (alta) e -v19-leve.mp4 (< 30 MB).

Uso: python3 producao/v19_montar.py [--crf 20] [--leve 25]
"""
import argparse, os, subprocess

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AZ = os.path.join(RAIZ, 'build', 'azul')
ORIG = os.path.join(AZ, 'v18.m4v')
A, B, X, Y = 119.2, 128.1, 0.5, 0.8   # trecho original mantido; X = dissolve TMO → original; Y = dissolve original → linha do tempo
# O v18 tem o seu próprio dissolve (slide do TMO → líderes) entre 119,0 e 119,5 s; para não aparecer o slide antigo por
# baixo, os quadros do TMO refeito seguem até A + X e são dissolvidos (xfade) sobre o trecho original a partir de A.


def montar(saida, crf):
    fc = (f"[0:v]trim=0:{A + X},setpts=PTS-STARTPTS,format=yuv420p[v0];"
          f"[1:v]trim={A}:{B},setpts=PTS-STARTPTS,fps=30,scale=1920:1080,format=yuv420p[v1];"
          f"[0:v]trim={B - Y},setpts=PTS-STARTPTS,format=yuv420p[v2];"
          f"[v0][v1]xfade=transition=fade:duration={X}:offset={A}[v01];"
          f"[v01][v2]xfade=transition=fade:duration={Y}:offset={B - Y}[v]")
    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(AZ, 'v19', 'f%05d.jpg'), '-i', ORIG,
           '-filter_complex', fc, '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf),
           '-c:a', 'copy', '-movflags', '+faststart', '-shortest', saida]
    subprocess.run(cmd, check=True)
    print(saida, round(os.path.getsize(saida) / 1e6, 1), 'MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--crf', type=int, default=20)
    ap.add_argument('--leve', type=int, default=25)
    a = ap.parse_args()
    montar(os.path.join(AZ, 'Projeto-do-Ano-AM-TOTVS-v19.mp4'), a.crf)
    montar(os.path.join(AZ, 'Projeto-do-Ano-AM-TOTVS-v19-leve.mp4'), a.leve)
