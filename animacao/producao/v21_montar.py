"""Monta o v21 = abertura do carrinho (v20 0–15,0 s) + filme azul novo (quadros build/azul/v21/f%05d.jpg, trecho original
do v18 encaixado no slot da cena 'original', áudio build/azul/v21/mix.wav) + encerramento do carrinho (v20 a partir de 187,53 s).
Áudio da abertura e do encerramento vem do próprio v20 (a abertura some em 0,25 s antes do corte, para não vazar a voz antiga);
cada bloco de áudio tem exatamente a duração do bloco de vídeo, então a sincronia não escorrega nas junções. O trecho do palco
é desacelerado de forma uniforme até caber no slot, com interpolação de movimento (minterpolate) para não engasgar.

Saídas: build/azul/Projeto-do-Ano-AM-TOTVS-v21.mp4 (crf 18) e ...-v21-leve.mp4 (crf 26, < 30 MB).
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
    ins = ['-framerate', '30', '-i', FR, '-i', palco, '-i', MIX]
    if so_filme:
        fc += f"[2:a]apad,atrim=0:{total:.4f}[af]"; vl, al = 'filme', 'af'
    else:
        fc += (f"[3:v]trim=0:{INTRO_FIM},setpts=PTS-STARTPTS,fps=30,scale=1920:1080,format=yuv420p[vi];"
               f"[3:v]trim={OUTRO_INI}:{OUTRO_FIM},setpts=PTS-STARTPTS,fps=30,scale=1920:1080,format=yuv420p[vo];"
               f"[3:a]atrim=0:{INTRO_FIM},asetpts=PTS-STARTPTS,afade=t=out:st={INTRO_FIM - 0.42}:d=0.25,aformat=sample_rates=48000:channel_layouts=stereo[ai];"
               f"[2:a]aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=0:{total:.4f}[af];"
               f"[3:a]atrim={OUTRO_INI}:{OUTRO_FIM},asetpts=PTS-STARTPTS,afade=t=in:d=0.05,aformat=sample_rates=48000:channel_layouts=stereo[ao];"
               f"[vi][ai][filme][af][vo][ao]concat=n=3:v=1:a=1[v][a]")
        ins += ['-i', V20]; vl, al = 'v', 'a'
    n = len(saidas)                                       # cada rótulo do grafo só pode ir para uma saída: split por saída
    fc += f";[{vl}]split={n}" + ''.join(f'[v{i}]' for i in range(n)) + f";[{al}]asplit={n}" + ''.join(f'[a{i}]' for i in range(n))
    cmd = ['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', fc]
    for i, (saida, crf) in enumerate(saidas):
        cmd += ['-map', f'[v{i}]', '-map', f'[a{i}]'] + ['-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', saida]
    print('filme', round(total, 2), 's; original', round(A, 2), '-', round(B, 2), 'fator', round(k, 3))
    subprocess.run(cmd, check=True)
    for saida, _ in saidas: print(saida, round(os.path.getsize(saida) / 1e6, 1), 'MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--so-filme', action='store_true'); ap.add_argument('--crf', type=int, default=18); ap.add_argument('--leve', type=int, default=26)
    a = ap.parse_args(); suf = '-so-filme' if a.so_filme else ''
    montar([(os.path.join(AZ, f'Projeto-do-Ano-AM-TOTVS-v21{suf}.mp4'), a.crf), (os.path.join(AZ, f'Projeto-do-Ano-AM-TOTVS-v21{suf}-leve.mp4'), a.leve)], a.so_filme)
