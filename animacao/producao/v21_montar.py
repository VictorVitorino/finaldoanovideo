"""Monta o v21 = abertura do carrinho (v20 0–15,0 s) + filme azul novo (quadros build/azul/v21/f%05d.jpg, trecho original
do v18 encaixado no slot da cena 'original', áudio build/azul/v21/mix.wav) + encerramento do carrinho (v20 a partir de 185,1 s).
Áudio da abertura e do encerramento vem do próprio v20 (a abertura some em 0,25 s antes do corte, para não vazar a voz antiga);
cada bloco de áudio tem exatamente a duração do bloco de vídeo, então a sincronia não escorrega nas junções. O trecho do palco
é desacelerado de forma uniforme até caber no slot, com interpolação de movimento (minterpolate) para não engasgar.

Saídas: build/azul/Projeto-do-Ano-AM-TOTVS-v21.mp4 (crf 18) e ...-v21-leve.mp4 (crf 27, < 30 MB).
Uso: python3 producao/v21_montar.py [--so-filme]
"""
import argparse, json, os, subprocess

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AZ = os.path.join(RAIZ, 'build', 'azul')
V20, V18, MIX, FR = os.path.join(AZ, 'v20in', 'v20.mp4'), os.path.join(AZ, 'v18.m4v'), os.path.join(AZ, 'v21', 'mix.wav'), os.path.join(AZ, 'v21', 'f%05d.jpg')
INTRO_FIM, OUTRO_INI, OUTRO_FIM = 15.0, 185.1, 210.1      # cortes no v20 (o encerramento entra do preto em 185,1 s)
ORIG_A, ORIG_B = 119.4, 128.1                             # trecho do v18 mantido (Quintão & Antonialli; equipe no palco)
X, Y = 0.5, 0.8                                           # dissolves TMO → original e original → linha do tempo


def montar(saidas, so_filme):
    J = json.load(open(os.path.join(AZ, 'v19.json')))
    total = len([f for f in os.listdir(os.path.dirname(FR)) if f.endswith('.jpg')]) / 30   # duração real do filme em quadros
    org = next(c for c in J['cenas'] if c['id'] == 'original')
    A, B = org['de'] - X, org['ate'] + Y                  # slot do original no filme (com os dissolves)
    k = (B - A) / (ORIG_B - ORIG_A)                       # fator de tempo do clipe original para caber no slot
    palco = os.path.join(AZ, 'v21', f'palco_{k:.4f}.mp4')    # a interpolação é lenta (~9 min): fica em cache por fator
    if not os.path.exists(palco):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', V18, '-filter_complex',
                        f"[0:v]trim={ORIG_A}:{ORIG_B},setpts=(PTS-STARTPTS)*{k:.6f},minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1920:1080,format=yuv420p[v]",
                        '-map', '[v]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', palco], check=True)
    fc = (f"[0:v]trim=0:{A + X},setpts=PTS-STARTPTS,format=yuv420p[f0];"
          f"[1:v]setpts=PTS-STARTPTS,fps=30,format=yuv420p[f1];"
          f"[0:v]trim={B - Y},setpts=PTS-STARTPTS,format=yuv420p[f2];"
          f"[f0][f1]xfade=transition=fade:duration={X}:offset={A}[f01];"
          f"[f01][f2]xfade=transition=fade:duration={Y}:offset={B - Y}[filme];")
    # por partes (um grafo único com o v20 usado duas vezes enfileira quadros demais e estoura a memória):
    # abertura, filme e encerramento codificados com os mesmos parâmetros e concatenados sem recodificar
    partes = os.path.join(AZ, 'v21', 'partes'); os.makedirs(partes, exist_ok=True)
    cod = ['-c:v', 'libx264', '-preset', 'slow', '-crf', str(saidas[0][1]), '-pix_fmt', 'yuv420p', '-r', '30', '-video_track_timescale', '15360',
           '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2']
    ff = lambda *a: subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)
    print('filme', round(total, 2), 's; original', round(A, 2), '-', round(B, 2), 'fator', round(k, 3))
    filme = os.path.join(partes, 'filme.mp4')
    ff('-framerate', '30', '-i', FR, '-i', palco, '-i', MIX, '-filter_complex', fc + f"[2:a]apad,atrim=0:{total:.4f}[af]",
       '-map', '[filme]', '-map', '[af]', *cod, filme)
    if so_filme:
        lista = [filme]
    else:
        intro, outro = os.path.join(partes, 'abertura.mp4'), os.path.join(partes, 'encerramento.mp4')
        ff('-i', V20, '-vf', 'fps=30,scale=1920:1080,format=yuv420p', '-af', f'afade=t=out:st={INTRO_FIM - 0.42}:d=0.25',
           '-t', str(INTRO_FIM), '-frames:v', str(round(INTRO_FIM * 30)), *cod, intro)
        ff('-ss', str(OUTRO_INI), '-i', V20, '-vf', 'fps=30,scale=1920:1080,format=yuv420p', '-af', 'afade=t=in:d=0.05',
           '-t', str(OUTRO_FIM - OUTRO_INI), *cod, outro)
        lista = [intro, filme, outro]
    txt = os.path.join(partes, 'lista.txt'); open(txt, 'w').write(''.join(f"file '{x}'\n" for x in lista))
    mestre, crf0 = saidas[0]
    ff('-f', 'concat', '-safe', '0', '-i', txt, '-c', 'copy', '-movflags', '+faststart', mestre)
    for saida, crf in saidas[1:]:
        ff('-i', mestre, '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', saida)
    for saida, _ in saidas: print(saida, round(os.path.getsize(saida) / 1e6, 1), 'MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--so-filme', action='store_true'); ap.add_argument('--crf', type=int, default=18); ap.add_argument('--leve', type=int, default=27)
    a = ap.parse_args(); suf = '-so-filme' if a.so_filme else ''
    montar([(os.path.join(AZ, f'Projeto-do-Ano-AM-TOTVS-v21{suf}.mp4'), a.crf), (os.path.join(AZ, f'Projeto-do-Ano-AM-TOTVS-v21{suf}-leve.mp4'), a.leve)], a.so_filme)
