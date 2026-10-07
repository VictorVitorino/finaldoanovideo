"""Monta o filme final a partir dos clipes gerados por IA.

Para cada plano do roteiro:
  - se existir clipe em producao/clipes/<id>.mp4 (ou <id>_a.mp4, <id>_b.mp4, ...),
    usa o clipe (reenquadrado para 1920x1080, ajustado à duração do plano);
  - senão, usa a camada base da animação provisória (build/frames_base).
Depois aplica por cima a camada de sobreposição (legendas, textos, logos, cartões,
transições), as etiquetas de "quem é quem" (só sobre os clipes gerados) e a trilha.

    python3 producao/montar.py [--saida build/projeto-do-ano-final.mp4]

Antes, gere as camadas (uma vez, ou depois de mudar textos):
    node render.mjs cues
    python3 audio/gerar_trilha.py
    node render.mjs frames --layer base
    node render.mjs frames --layer overlay
    node render.mjs frames --layer etiquetas
"""
import argparse
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'build')
CLIPES = os.path.join(ROOT, 'producao', 'clipes')
EXTS = ('.mp4', '.mov', '.webm', '.mkv')


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if r.returncode != 0:
        print(' '.join(cmd), file=sys.stderr)
        print(r.stderr[-3000:], file=sys.stderr)
        raise SystemExit(r.returncode)
    return r.stdout


def clipes_do_plano(pid):
    if not os.path.isdir(CLIPES):
        return []
    achados = []
    for nome in sorted(os.listdir(CLIPES)):
        base, ext = os.path.splitext(nome)
        if ext.lower() not in EXTS:
            continue
        if base == pid or (base.startswith(pid + '_') and len(base) == len(pid) + 2):
            achados.append(os.path.join(CLIPES, nome))
    return achados


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--saida', default=os.path.join(BUILD, 'projeto-do-ano-final.mp4'))
    ap.add_argument('--crf', default='18')
    a = ap.parse_args()

    cues = json.load(open(os.path.join(BUILD, 'cues.json')))
    fps = cues['fps']
    planos = cues['planos']
    seg_dir = os.path.join(BUILD, 'segmentos')
    shutil.rmtree(seg_dir, ignore_errors=True)
    os.makedirs(seg_dir)
    base_dir = os.path.join(BUILD, 'frames_base')
    over_dir = os.path.join(BUILD, 'frames_overlay')
    etq_dir = os.path.join(BUILD, 'frames_etiquetas')
    for d in (base_dir, over_dir):
        if not os.path.isdir(d):
            raise SystemExit(f'falta {d}: rode "node render.mjs frames --layer {os.path.basename(d)[7:]}"')

    lista, com_clipe = [], []
    for i, p in enumerate(planos):
        f0, f1 = round(p['de'] * fps), round(p['ate'] * fps)
        n = f1 - f0
        out = os.path.join(seg_dir, f'{i:02d}_{p["id"]}.mp4')
        cl = clipes_do_plano(p['id'])
        vf = f'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps={fps},setsar=1'
        if cl:
            com_clipe.append((p['de'], p['ate'], p['id']))
            entradas = []
            for c in cl:
                entradas += ['-i', c]
            filtro = ''.join(f'[{k}:v]{vf}[v{k}];' for k in range(len(cl)))
            filtro += ''.join(f'[v{k}]' for k in range(len(cl))) + f'concat=n={len(cl)}:v=1:a=0[c];[c]tpad=stop_mode=clone:stop_duration=30[o]'
            run(['ffmpeg', '-v', 'error', '-y', *entradas, '-filter_complex', filtro, '-map', '[o]', '-frames:v', str(n),
                 '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', out])
            print(f'{p["id"]:14s} clipe ({len(cl)} arquivo(s))')
        else:
            run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(fps), '-start_number', str(f0), '-i', os.path.join(base_dir, 'f%05d.jpg'),
                 '-frames:v', str(n), '-vf', f'fps={fps},setsar=1', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', out])
            print(f'{p["id"]:14s} animação provisória')
        lista.append(out)

    concat_txt = os.path.join(seg_dir, 'lista.txt')
    with open(concat_txt, 'w') as fh:
        for s in lista:
            fh.write(f"file '{s}'\n")
    base_mp4 = os.path.join(BUILD, 'base_montada.mp4')
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', concat_txt, '-c', 'copy', base_mp4])

    entradas = ['-i', base_mp4, '-framerate', str(fps), '-i', os.path.join(over_dir, 'f%05d.png')]
    filtro = '[0:v][1:v]overlay=format=auto[v1]'
    ultimo = 'v1'
    if com_clipe and os.path.isdir(etq_dir):
        entradas += ['-framerate', str(fps), '-i', os.path.join(etq_dir, 'f%05d.png')]
        en = '+'.join(f'between(t,{de:.3f},{ate:.3f})' for de, ate, _ in com_clipe)
        filtro += f";[v1][2:v]overlay=format=auto:enable='{en}'[v2]"
        ultimo = 'v2'
    trilha = os.path.join(BUILD, 'trilha.wav')
    k_audio = len([x for x in entradas if x == '-i'])
    if os.path.exists(trilha):
        entradas += ['-i', trilha]
    cmd = ['ffmpeg', '-v', 'error', '-y', *entradas, '-filter_complex', filtro, '-map', f'[{ultimo}]']
    if os.path.exists(trilha):
        cmd += ['-map', f'{k_audio}:a', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k']
    cmd += ['-c:v', 'libx264', '-preset', 'medium', '-crf', a.crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-shortest', a.saida]
    run(cmd)
    print(f'\n{a.saida}\n{len(com_clipe)} de {len(planos)} planos com clipe gerado.')


if __name__ == '__main__':
    main()
