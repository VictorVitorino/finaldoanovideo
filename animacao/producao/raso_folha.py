"""Folhas de contato do vídeo "Além do raso": junta quadros já renderizados (um por segundo) em grades, para revisar o filme de ponta a ponta.

  node render.mjs stills --page raso.html --w 1920 --h 1080 --test filme --t 0,1,2,...,87 --out build/raso/folha
  python3 producao/raso_folha.py [colunas=5] [linhas=4]

Saída: build/raso/folha/folha-<n>.jpg
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(ROOT, 'build/raso/folha')
COLS = int(sys.argv[1]) if len(sys.argv) > 1 else 5
LINS = int(sys.argv[2]) if len(sys.argv) > 2 else 4


def tempo(nome):
    a, b = nome[len('filme_'):-len('.jpg')].split('_')
    return int(a) + int(b) / 100


quadros = sorted((f for f in os.listdir(PASTA) if f.startswith('filme_') and f.endswith('.jpg')), key=tempo)
por = COLS * LINS
for k in range(0, len(quadros), por):
    lote = quadros[k:k + por]
    lista = os.path.join(PASTA, 'lista.txt')
    with open(lista, 'w') as fh:
        for q in lote:
            fh.write(f"file '{os.path.join(PASTA, q)}'\nduration 1\n")
    saida = os.path.join(PASTA, f'folha-{k // por + 1}.jpg')
    # carimbo do tempo no canto de cada quadro
    filtro = f"scale=480:270,tile={COLS}x{LINS}:padding=6:margin=6:color=0x04102E"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-vf', filtro, '-frames:v', '1', '-q:v', '3', saida], check=True)
    print(saida, f'({tempo(lote[0]):.0f} a {tempo(lote[-1]):.0f} s)')
os.remove(os.path.join(PASTA, 'lista.txt'))
