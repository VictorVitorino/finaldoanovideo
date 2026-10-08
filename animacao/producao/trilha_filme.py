"""Trilha do filme: música por estilo de trecho, efeitos e vozes, com a música abaixando sob as falas.

    python3 producao/trilha_filme.py     # lê build/filme/timeline.json -> build/filme/mix.wav

Reaproveita os instrumentos e estilos de audio/gerar_trilha.py (sintetizados em numpy).
"""
import json
import os
import sys
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BF = os.path.join(ROOT, 'build', 'filme')
sys.path.insert(0, os.path.join(ROOT, 'audio'))
import gerar_trilha as T  # noqa: E402

SR = T.SR
# estilos da timeline -> estilos de gerar_trilha.music
ESTILO = {'tensao': 'tensao', 'suave': 'esperanca', 'tema': 'tema', 'metodo': 'metodo', 'triunfo': 'triunfo',
          'suspense': 'furtivo', 'alegria': 'comico', 'espiao': 'espiao', 'final': 'final'}
PENTA = [65, 67, 69, 72, 74, 77]  # Fá pentatônica: um acento por cliente


def fx_tick():
    t = T.tvec(0.06)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.012) * 0.6 + T.highpass(T.RNG.standard_normal(len(t)), 3) * np.exp(-t / 0.006) * 0.3


def fx_riser(dur=1.0):
    t = T.tvec(dur)
    ruido = T.highpass(T.RNG.standard_normal(len(t)), 2) * (t / dur) ** 2 * 0.35
    sw = T.sweep(200, 1400, dur)[:len(t)]
    return ruido[:len(sw)] + sw * (t[:len(sw)] / dur) ** 1.5 * 0.25


def fx_hit():
    notes, root = T.CH['F']
    partes = [T.brass(notes + [65], 1.4, 0.02) * 0.7, T.timpani(41, 1.6) * 0.8, T.bass(root, 1.2) * 0.5]
    n = max(len(x) for x in partes)
    return sum(np.pad(x, (0, n - len(x))) for x in partes)


def fx_pluck(k):
    m = PENTA[k % len(PENTA)]
    a, b = T.pluck(m, 0.9, 1.0, 0.75) * 0.8, T.celesta(m + 12, 0.8) * 0.5
    n = max(len(a), len(b))
    return np.pad(a, (0, n - len(a))) + np.pad(b, (0, n - len(b)))


FX = dict(T.FX)
FX.update({'tick': fx_tick, 'riser': fx_riser, 'hit': fx_hit, 'ping': T.fx_ping})
for k in range(6):
    FX[f'pluck{k + 1}'] = (lambda k=k: fx_pluck(k))


def ler(caminho):
    with wave.open(caminho) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32767
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(1)
    return x


def main():
    tl = json.load(open(os.path.join(BF, 'timeline.json')))
    dur = tl['dur']
    mus = tl['musica']
    secs = []
    for k, m in enumerate(mus):
        ate = mus[k + 1]['de'] if k + 1 < len(mus) else dur
        if m['estilo'] != 'silencio' and ate - m['de'] > 0.2:
            secs.append({'estilo': ESTILO[m['estilo']], 'de': m['de'], 'ate': ate})
    musica = T.Mix(dur)
    T.music(musica, {'musica': secs})
    musica.L, musica.R = T.reverb(musica.L, wet=0.2, seed=3), T.reverb(musica.R, wet=0.2, seed=4)
    # ducking: −9 dB sob as falas, com rampas suaves
    n = musica.n
    alvo = np.ones(n)
    for f in tl['falas']:
        a, b = int((f['de'] - 0.12) * SR), int((f['ate'] + 0.25) * SR)
        alvo[max(0, a):min(n, b)] = 0.355
    k = int(0.12 * SR)
    duck = np.convolve(alvo, np.ones(k) / k, mode='same')
    musica.L *= duck
    musica.R *= duck
    efeitos = T.Mix(dur)
    for e in tl['sfx']:
        fn = FX.get(e['s'])
        if fn is None:
            print('efeito desconhecido:', e['s'], file=sys.stderr)
            continue
        pan = float(np.clip(np.sin(e['t'] * 1.7) * 0.3, -0.3, 0.3))
        efeitos.add(fn(), e['t'], e.get('ganho', T.FX_GAIN.get(e['s'], 0.6)), pan)
    efeitos.L, efeitos.R = T.reverb(efeitos.L, 0.8, 0.1, 5), T.reverb(efeitos.R, 0.8, 0.1, 6)
    vozes = T.Mix(dur)
    for f in tl['falas']:
        x = ler(os.path.join(BF, 'vozes', f['id'] + '.wav'))
        vozes.add(x, f['de'], 1.0, 0.0)
    vozes.L, vozes.R = T.reverb(vozes.L, 0.5, 0.06, 7), T.reverb(vozes.R, 0.5, 0.06, 8)
    m = int(dur * SR)
    L = musica.L[:m] * 0.5 + efeitos.L[:m] * 0.55 + vozes.L[:m] * 0.95
    R = musica.R[:m] * 0.5 + efeitos.R[:m] * 0.55 + vozes.R[:m] * 0.95
    pico = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-9)
    L, R = [np.tanh(c / pico * 1.1) / np.tanh(1.1) * 0.89 for c in (L, R)]
    f0, f1 = int(0.03 * SR), int(0.4 * SR)
    for c in (L, R):
        c[:f0] *= np.linspace(0, 1, f0)
        c[-f1:] *= np.linspace(1, 0, f1)
    with wave.open(os.path.join(BF, 'mix.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.stack([L, R], axis=1) * 32767).astype('<i2').tobytes())
    print(os.path.join(BF, 'mix.wav'), f'{dur:.1f} s')


if __name__ == '__main__':
    main()
