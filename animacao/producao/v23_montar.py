"""v23 = v22 (vídeo final do usuário já editado: build/azul/vf_video.mp4) com a narração inteira nova (ElevenLabs, voz do
narrador original — build/azul/v23/falas/<fala>.wav, escolhidas por producao/v23_voz.py).

Como a nova narração tem outro ritmo, o vídeo é "esticado" por trechos: cada fala é ancorada no ponto do vídeo em que a
sua legenda gravada aparece (onde a voz antiga começava no v22 + 0,5 s: no vídeo final o vídeo está em +14,70 s e o áudio
em +14,20 s do v18; a conversão para o v22 usa os cortes de áudio de vf_editar.AUDIO).
Entre duas âncoras o vídeo roda em velocidade normal se a fala nova couber; se não couber, o trecho é desacelerado só o
necessário (quadros repetidos, nunca pulados). Antes disso, falas mais lentas que a original são aceleradas com Rubber Band
(pedalboard, sem mudar o tom) até no máximo TETO vezes; o resto da diferença vai para o vídeo.
Áudio: carrinho (abertura e encerramento) intacto do v22; no filme, a trilha instrumental do vídeo final (UVR) esticada
pelos mesmos fatores do vídeo, com ducking leve sob a voz nova, e a voz no nível da narração original.

Uso: python3 producao/v23_montar.py            → build/azul/Projeto-Totvs-Final-do-ano-v23(.mp4|-leve.mp4)
     python3 producao/v23_montar.py --plano    → só imprime âncoras, fatores e duração final
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vf_editar as VE                                    # mapa de tempo do v22 (cortes da mandala) e constantes do vídeo final

AZ = os.path.join(RAIZ, 'build', 'azul'); V23 = os.path.join(AZ, 'v23')
V22 = os.path.join(AZ, 'vf_video.mp4')                   # vídeo do v22 (206,27 s, 30 fps, sem áudio)
V22_AUDIO = os.path.join(AZ, 'vf_audio.wav')             # áudio do v22 (abertura/encerramento do carrinho e trilha+voz antiga)
INSTR = next(os.path.join(AZ, 'videofinal', f) for f in os.listdir(os.path.join(AZ, 'videofinal')) if 'Instrumental' in f)
W, H, FPS, SR = 1920, 1080, 30, 48000
DESLOC_V = VE.DESLOC_V                                    # vídeo final = v18 + 14,70 s (vídeo)
TETO = 1.30                                               # aceleração máxima da voz (Rubber Band); acima disso o vídeo estica
GAP = 0.40                                                # silêncio mínimo entre o fim de uma fala e a âncora da próxima
INTRO_FIM = 15.0                                          # até aqui (v22) áudio original do carrinho
FADE_V22 = 183.0 - VE.CORTE                               # fade do filme para o preto (v22); daí em diante nada muda
DUCK_DB, VOZ_PICO = -5.0, 0.80

FALAS = json.load(open(os.path.join(RAIZ, 'producao', 'dados', 'v19_falas.json')))['falas']


def v22_de_vf_audio(t):
    """Tempo no v22 do instante t do áudio do vídeo final (cortes de áudio de vf_editar.AUDIO)."""
    n0 = 0.0
    for a, b in VE.AUDIO:
        if b is None or t < b: return n0 + max(0.0, t - a)
        n0 += b - a
    return n0


def plano():
    # âncora = onde a voz antiga começava no v22 + 0,5 s (no vídeo final o vídeo está em +14,70 s e o áudio em +14,20 s do v18:
    # a legenda gravada aparece 0,3 s antes desse ponto, como no desenho original)
    anc = [v22_de_vf_audio(VE.DESLOC_V - 0.5 + f['de']) + 0.5 for f in FALAS] + [FADE_V22]
    falas = []
    for i, f in enumerate(FALAS):
        x, sr = sf.read(os.path.join(V23, 'falas', f['id'] + '.wav'), dtype='float32'); assert sr == 44100
        dur = len(x) / sr; slot = anc[i + 1] - anc[i] - GAP
        s = float(np.clip(dur / slot, 1.0, TETO))          # aceleração da voz
        d = dur / s
        falas.append({'id': f['id'], 'a': anc[i], 'dur': dur, 's': s, 'd': d})
    # saída: trechos [anc_i, anc_i+1) esticados por k_i = max(1, (d_i + GAP) / (anc_i+1 - anc_i))
    segs = []; O = anc[0]
    for i, fl in enumerate(falas):
        L = anc[i + 1] - anc[i]; k = max(1.0, (fl['d'] + GAP) / L)
        fl['O'] = O; segs.append((anc[i], anc[i + 1], O, O + L * k, k)); O += L * k
    return anc, falas, segs, O


def mapa_saida(segs, total_v22):
    """Funções: tempo de saída → tempo do v22 (inversa do esticamento) e tempo do v22 → saída."""
    a0, _, O0, _, _ = segs[0]; aN = segs[-1][1]; ON = segs[-1][3]
    def inv(t):
        if t < O0: return t
        for a, b, Oa, Ob, k in segs:
            if t < Ob: return a + (t - Oa) / k
        return aN + (t - ON)
    def dir_(n):
        if n < a0: return n
        for a, b, Oa, Ob, k in segs:
            if n < b: return Oa + (n - a) * k
        return ON + (n - aN)
    return inv, dir_, ON + (total_v22 - aN)


def estica_voz(x, sr, s):
    if abs(s - 1.0) < 1e-3: return x
    import pedalboard
    return pedalboard.time_stretch(x.reshape(1, -1), sr, stretch_factor=s)[0]


def estica_musica(x, sr, k):
    """Trilha mais lenta por k (k ≥ 1): Rubber Band preserva o tom."""
    if abs(k - 1.0) < 1e-3: return x
    import pedalboard
    return pedalboard.time_stretch(np.ascontiguousarray(x.T), sr, stretch_factor=1.0 / k).T


def main(so_plano=False):
    anc, falas, segs, fim_filme = plano()
    dur22 = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', V22], capture_output=True, text=True).stdout)
    inv, dir_, total = mapa_saida(segs, dur22)
    extra = total - dur22
    print(f'v22 {dur22:.2f} s → v23 {total:.2f} s (+{extra:.2f} s); fade do filme em {dir_(FADE_V22):.2f} s')
    for fl, sg in zip(falas, segs):
        print(f"{fl['id']} âncora v22 {fl['a']:7.2f} → saída {fl['O']:7.2f}  voz {fl['dur']:5.2f}s ÷{fl['s']:.2f} = {fl['d']:5.2f}s  trecho ×{sg[4]:.3f}")
    if so_plano: return
    os.makedirs(V23, exist_ok=True)
    # ---- vídeo: quadros do v22 repetidos conforme o mapa (nunca pulados)
    n_out = round(total * FPS)
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', V22, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    vid = os.path.join(V23, 'video.mp4')
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', vid], stdin=subprocess.PIPE)
    atual, quadro = -1, None
    for N in range(n_out):
        alvo = min(int(round(inv(N / FPS) * FPS)), round(dur22 * FPS) - 1)
        while atual < alvo:
            b = dec.stdout.read(W * H * 3)
            if len(b) < W * H * 3: break
            quadro = b; atual += 1
        enc.stdin.write(quadro)
    enc.stdin.close(); enc.wait(); dec.kill()
    # ---- áudio
    A22, sr = sf.read(V22_AUDIO, dtype='float32'); assert sr == SR
    M, srm = sf.read(INSTR, dtype='float32'); M = resample_poly(M, SR, srm, axis=0).astype(np.float32) if srm != SR else M
    # instrumental do vídeo final no tempo do v22 (mesmos cortes de áudio do v22), depois esticado por trecho
    Mv22 = np.concatenate([M[int(a * SR):(int(b * SR) if b is not None else len(M))] for a, b in VE.AUDIO])
    out = np.zeros((int(total * SR) + SR, 2), np.float32)
    out[:int(anc[0] * SR)] = A22[:int(anc[0] * SR)]                                   # abertura do carrinho + capa, intactos
    cursor = anc[0]
    for a, b, Oa, Ob, k in segs:
        seg = estica_musica(Mv22[int(a * SR):int(b * SR)], SR, k)
        i0 = int(Oa * SR); seg = seg[:int(Ob * SR) - i0]; out[i0:i0 + len(seg)] = seg
    aN, ON = segs[-1][1], segs[-1][3]
    resto = A22[int(aN * SR):]; out[int(ON * SR):int(ON * SR) + len(resto)] = resto      # fade + encerramento do carrinho, intactos
    # ducking sob a voz e a voz nova no nível da narração original (pico 0,80 como no mix do vídeo final)
    env = np.zeros(len(out), np.float32); vozes = np.zeros_like(out)
    for fl in falas:
        x, srx = sf.read(os.path.join(V23, 'falas', fl['id'] + '.wav'), dtype='float32')
        x = estica_voz(x, srx, fl['s']); x = resample_poly(x, SR, srx).astype(np.float32)
        x *= VOZ_PICO / max(1e-6, np.abs(x).max()) * 0.9
        i0 = int(fl['O'] * SR); vozes[i0:i0 + len(x)] += x[:, None]; env[max(0, i0 - int(0.15 * SR)):i0 + len(x) + int(0.25 * SR)] = 1
    # suaviza o envelope (120 ms) e aplica só na faixa do filme
    ker = np.ones(int(0.12 * SR), np.float32) / int(0.12 * SR); env = np.convolve(env, ker, 'same')
    g = 10 ** (DUCK_DB / 20); i_a, i_b = int(anc[0] * SR), int(ON * SR)
    out[i_a:i_b] *= (1 - env[i_a:i_b] * (1 - g))[:, None]
    out += vozes; out = out[:int(total * SR)]
    pico = np.abs(out).max();
    if pico > 0.98: out *= 0.98 / pico
    aud = os.path.join(V23, 'audio.wav'); sf.write(aud, out, SR)
    for nome, crf in [('Projeto-Totvs-Final-do-ano-v23.mp4', None), ('Projeto-Totvs-Final-do-ano-v23-leve.mp4', 27)]:
        v = ['-c:v', 'copy'] if crf is None else ['-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p']
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', vid, '-i', aud, '-map', '0:v', '-map', '1:a', *v, '-c:a', 'aac', '-b:a', '192k',
                        '-shortest', '-movflags', '+faststart', os.path.join(AZ, nome)], check=True)
        print(nome, round(os.path.getsize(os.path.join(AZ, nome)) / 1e6, 1), 'MB')
    json.dump({'total': total, 'falas': falas, 'segs': segs}, open(os.path.join(V23, 'plano.json'), 'w'), indent=1)


if __name__ == '__main__':
    main('--plano' in sys.argv)
