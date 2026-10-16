"""Monta o v19: quadros renderizados (build/azul/v19/f%05d.jpg) + trecho original mantido (119,1–128,1 s do v18)
+ áudio do v18 intacto. Saídas: build/azul/Projeto-do-Ano-AM-TOTVS-v19.mp4 (alta) e -v19-leve.mp4 (< 30 MB).

Uso: python3 producao/v19_montar.py [--crf 20] [--leve 25]
"""
import argparse, os, subprocess

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AZ = os.path.join(RAIZ, 'build', 'azul')
ORIG = os.path.join(AZ, 'v18.m4v')
A, B = 119.1, 128.1   # trecho original mantido (Quintão & Antonialli; equipe no palco)


def montar(saida, crf):
    fc = (f"[0:v]trim=0:{A},setpts=PTS-STARTPTS,format=yuv420p[v0];"
          f"[1:v]trim={A}:{B},setpts=PTS-STARTPTS,fps=30,scale=1920:1080,format=yuv420p[v1];"
          f"[0:v]trim={B},setpts=PTS-STARTPTS,format=yuv420p[v2];"
          f"[v0][v1][v2]concat=n=3:v=1:a=0[v]")
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
