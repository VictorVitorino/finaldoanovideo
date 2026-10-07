"""Gera a trilha sonora (música + efeitos) a partir de build/cues.json.

    python3 audio/gerar_trilha.py            -> build/trilha.wav

Tudo é sintetizado aqui (sem samples externos): pizzicato (Karplus-Strong),
celesta, baixo, metais suaves, percussão leve e os efeitos do roteiro.
A narração e as falas não estão na trilha: entram como legendas e servem
de guia para a gravação da locução.
"""
import json
import os
import sys
import wave

import numpy as np

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'build')
BPM = 112
BEAT = 60 / BPM
BAR = 4 * BEAT
RNG = np.random.default_rng(7)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tvec(dur):
    return np.arange(int(dur * SR)) / SR


def env_exp(n, tau, attack=0.003):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    a = int(attack * SR)
    if a > 0:
        e[:a] *= np.linspace(0, 1, a)
    return e


def lowpass(x, k):
    """Média móvel simples (passa-baixa barato)."""
    if k <= 1:
        return x
    c = np.cumsum(np.concatenate([[0.0], x]))
    y = (c[k:] - c[:-k]) / k
    return np.concatenate([y, np.zeros(len(x) - len(y))])


def highpass(x, k):
    return x - lowpass(x, k)


# ---------------- instrumentos ----------------
_ks_cache = {}


def pluck(m, dur, t60=1.2, bright=0.6, seed=0):
    key = (m, round(dur, 3), t60, bright, seed)
    if key in _ks_cache:
        return _ks_cache[key]
    f = mtof(m)
    N = max(2, int(round(SR / f)))
    L = int(dur * SR)
    rng = np.random.default_rng(int(m * 100 + seed))
    noise = rng.uniform(-1, 1, N)
    if bright < 1:
        noise = lowpass(np.concatenate([noise, noise]), max(1, int((1 - bright) * 6)))[:N]
    decay = 10 ** (-3 * (N / SR) / t60)
    out = np.zeros(L + N + 1)
    out[1:N + 1] = noise
    i = N + 1
    while i < L + 1:
        j = min(i + N, L + 1)
        out[i:j] = decay * 0.5 * (out[i - N:j - N] + out[i - N - 1:j - N - 1])
        i = j
    y = out[1:L + 1]
    fade = min(len(y), int(0.02 * SR))
    y[-fade:] *= np.linspace(1, 0, fade)
    _ks_cache[key] = y
    return y


def celesta(m, dur, tau=0.7):
    t = tvec(dur)
    f = mtof(m)
    y = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.25)
    y += 0.12 * np.sin(2 * np.pi * 4.07 * f * t) * np.exp(-t / 0.06)
    return y * env_exp(len(t), tau, 0.002)


def marimba(m, dur):
    t = tvec(dur)
    f = mtof(m)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.3 * np.sin(2 * np.pi * 3.9 * f * t) * np.exp(-t / 0.05)
    a = int(0.002 * SR)
    y[:a] *= np.linspace(0, 1, a)
    return y


def pad(ms, dur, attack=0.35, release=0.5, harm=7):
    t = tvec(dur)
    y = np.zeros(len(t))
    for m in ms:
        for det in (-0.06, 0.0, 0.07):
            f = mtof(m + det)
            for k in range(1, harm + 1):
                y += np.sin(2 * np.pi * f * k * t + k) / (k ** 1.3)
    e = np.ones(len(t))
    a, r = int(attack * SR), int(release * SR)
    e[:a] = np.linspace(0, 1, a) ** 2
    if r < len(e):
        e[-r:] *= np.linspace(1, 0, r)
    return y * e / (len(ms) * 3 * 2.2)


def brass(ms, dur, attack=0.07):
    t = tvec(dur)
    y = np.zeros(len(t))
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1)
    bright = np.clip(t / 0.15, 0.3, 1)
    for m in ms:
        f = mtof(m)
        ph = 2 * np.pi * f * np.cumsum(vib) / SR
        for k in range(1, 11):
            y += np.sin(k * ph) * (bright ** (k * 0.3)) / (k ** 0.95)
    e = np.ones(len(t))
    a, r = int(attack * SR), int(0.12 * SR)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    return y * e / (len(ms) * 3.2)


def flute(m, dur):
    t = tvec(dur)
    f = mtof(m)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.1) / 0.3, 0, 1)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    y = np.sin(ph) + 0.15 * np.sin(2 * ph) + 0.04 * RNG.standard_normal(len(t)) * np.exp(-t / 0.1)
    e = np.ones(len(t))
    a, r = int(0.03 * SR), int(0.06 * SR)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    return y * e


def bass(m, dur):
    y = pluck(m, dur, t60=0.9, bright=0.35)
    t = tvec(dur)
    y = y + 0.5 * np.sin(2 * np.pi * mtof(m) * t) * np.exp(-t / 0.35)
    return y


def kick(dur=0.32):
    t = tvec(dur)
    f = 45 + 75 * np.exp(-t / 0.035)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)
    return y + 0.25 * RNG.standard_normal(len(t)) * np.exp(-t / 0.004)


def snap(dur=0.14):
    t = tvec(dur)
    n = highpass(RNG.standard_normal(len(t)), 6)
    return n * np.exp(-t / 0.035) * 0.8


def shaker(dur=0.07):
    t = tvec(dur)
    n = highpass(RNG.standard_normal(len(t)), 3)
    e = np.minimum(t / 0.012, 1) * np.exp(-t / 0.02)
    return n * e * 0.35


def timpani(m=41, dur=1.6):
    t = tvec(dur)
    f = mtof(m) * (1 + 0.04 * np.exp(-t / 0.05))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * np.exp(-t / 0.25)
    y += 0.3 * lowpass(RNG.standard_normal(len(t)), 8) * np.exp(-t / 0.03)
    return y


# ---------------- efeitos ----------------
def put(y, s, o):
    """Soma s em y a partir da amostra o, cortando o que passar do fim."""
    if o >= len(y):
        return
    m = min(len(s), len(y) - o)
    y[o:o + m] += s[:m]


def sweep(f0, f1, dur, tau=None, shape='sin'):
    t = tvec(dur)
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) if shape == 'sin' else np.sign(np.sin(ph)) * 0.5
    return y * (np.exp(-t / tau) if tau else np.hanning(len(t)))


def fx_ping():
    return np.concatenate([celesta(88, 0.09, 0.05) * 0.8, celesta(93, 0.25, 0.12)])


def fx_ring():
    dur = 1.6
    t = tvec(dur)
    y = np.zeros(len(t))
    strike = np.zeros(len(t))
    for k in range(int(1.1 / 0.045)):
        strike[int(k * 0.045 * SR)] = 1.0 if k % 2 == 0 else 0.8
    bell = np.zeros(int(0.12 * SR))
    tb = np.arange(len(bell)) / SR
    for fr, a in ((980, 1), (2650, 0.5), (5200, 0.25)):
        bell += a * np.sin(2 * np.pi * fr * tb) * np.exp(-tb / 0.05)
    y = np.convolve(strike, bell)[:len(t)]
    return y * 0.35


def fx_alarm():
    out = []
    for i in range(4):
        out.append(sweep(880 if i % 2 == 0 else 660, 880 if i % 2 == 0 else 660, 0.16, shape='sq') * 0.35)
    return np.concatenate(out)


def fx_whoosh(dur=0.45):
    t = tvec(dur)
    n = RNG.standard_normal(len(t))
    y = lowpass(n, 4) - lowpass(n, 30)
    return y * np.sin(np.pi * t / dur) ** 2 * 0.9


def fx_slam():
    boom = sweep(80, 38, 0.7, tau=0.25) * 1.2
    hit = lowpass(RNG.standard_normal(int(0.25 * SR)), 6) * np.exp(-tvec(0.25) / 0.05)
    w = fx_whoosh(0.2) * 0.6
    y = np.zeros(int(0.9 * SR))
    y[:len(w)] += w
    o = len(w) - int(0.05 * SR)
    y[o:o + len(boom)] += boom[:len(y) - o]
    put(y, hit, o)
    return y


def fx_thud():
    return sweep(110, 50, 0.3, tau=0.09) * 1.1 + np.concatenate([lowpass(RNG.standard_normal(int(0.05 * SR)), 4) * 0.3, np.zeros(int(0.25 * SR))])


def fx_stamp():
    y = fx_thud() * 1.2
    clap = highpass(RNG.standard_normal(int(0.08 * SR)), 4) * np.exp(-tvec(0.08) / 0.015) * 0.7
    y[:len(clap)] += clap
    return y


def fx_paper():
    t = tvec(0.5)
    n = highpass(RNG.standard_normal(len(t)), 3)
    return n * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t)) * np.sin(np.pi * t / 0.5) * 0.25


def fx_pop():
    return sweep(320, 1100, 0.07, tau=0.03) * 0.8


def fx_sparkle(n=9, dur=0.6, seed=1):
    r = np.random.default_rng(seed)
    y = np.zeros(int(dur * SR))
    for i in range(n):
        m = r.integers(88, 100)
        s = celesta(int(m), 0.25, 0.08) * 0.35
        o = int(r.uniform(0, dur - 0.25) * SR)
        put(y, s, o)
    return y


def fx_shine():
    y = np.zeros(int(1.0 * SR))
    for i, m in enumerate((77, 81, 84, 89, 93)):
        s = celesta(m, 0.6, 0.3) * 0.5
        o = int(i * 0.06 * SR)
        put(y, s, o)
    return y + np.concatenate([fx_sparkle(6, 0.6, 3), np.zeros(int(0.4 * SR))])


def fx_fix():
    y = np.zeros(int(1.2 * SR))
    poof = lowpass(RNG.standard_normal(int(0.3 * SR)), 10) * np.sin(np.pi * tvec(0.3) / 0.3) * 0.6
    y[:len(poof)] += poof
    for i, m in enumerate((77, 81, 84, 89)):
        s = celesta(m, 0.7, 0.35) * 0.55
        o = int((0.08 + i * 0.07) * SR)
        put(y, s, o)
    return y


def fx_clap():
    y = np.zeros(int(0.5 * SR))
    for o in (0.0, 0.012, 0.03):
        c = snap(0.12) * 1.1
        i = int(o * SR)
        put(y, c, i)
    return y


def fx_record_stop():
    t = tvec(0.5)
    f = 300 * (1 - t / 0.5) ** 2 + 30
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.4 * np.sin(2 * ph)) * (1 - t / 0.5) * 0.5


def fx_drawer():
    slide = lowpass(RNG.standard_normal(int(0.25 * SR)), 12) * np.linspace(0.2, 1, int(0.25 * SR)) * 0.5
    return np.concatenate([slide, fx_thud()])


def fx_robots():
    out = []
    r = np.random.default_rng(5)
    for i in range(8):
        f = float(r.uniform(600, 1500))
        out.append(sweep(f, f * (1.3 if i % 2 else 0.8), 0.08, shape='sq') * 0.25)
        out.append(np.zeros(int(0.04 * SR)))
    return np.concatenate(out)


def fx_coins():
    y = np.zeros(int(1.6 * SR))
    r = np.random.default_rng(9)
    for i in range(22):
        f = float(r.uniform(2600, 5200))
        t = tvec(0.18)
        s = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t / 0.05) * 0.2
        o = int(r.uniform(0, 1.4) * SR)
        put(y, s, o)
    return y


def fx_typewriter():
    y = np.zeros(int(1.3 * SR))
    for i in range(19):
        c = highpass(RNG.standard_normal(int(0.02 * SR)), 2) * np.exp(-tvec(0.02) / 0.004) * 0.6
        o = int(i * 0.045 * SR)
        put(y, c, o)
    d = celesta(96, 0.45, 0.2) * 0.4
    o = int(0.9 * SR)
    put(y, d, o)
    return y


def fx_steps(n=4, gap=0.33, vol=0.5):
    y = np.zeros(int((n * gap + 0.2) * SR))
    for i in range(n):
        s = sweep(140, 70, 0.08, tau=0.025) * vol + highpass(RNG.standard_normal(int(0.08 * SR)), 5) * np.exp(-tvec(0.08) / 0.01) * 0.15
        o = int(i * gap * SR)
        put(y, s, o)
    return y


def fx_startle():
    t = tvec(0.6)
    f = 260 + 120 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.3)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.25) * 0.6


def fx_scratch():
    t = tvec(0.5)
    f = 180 + 1100 * np.abs(np.sin(2 * np.pi * 4.2 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    y = saw * 0.5 + highpass(RNG.standard_normal(len(t)), 3) * 0.3
    return lowpass(y, 3) * np.sin(np.pi * np.clip(t / 0.5, 0, 1)) * 0.9


def fx_dial():
    out = []
    for f1, f2 in ((697, 1209), (770, 1336), (852, 1477), (941, 1336), (697, 1477), (770, 1209)):
        t = tvec(0.09)
        out.append((np.sin(2 * np.pi * f1 * t) + np.sin(2 * np.pi * f2 * t)) * 0.18 * np.hanning(len(t)))
        out.append(np.zeros(int(0.04 * SR)))
    return np.concatenate(out)


def fx_confetti():
    pop = highpass(RNG.standard_normal(int(0.05 * SR)), 2) * np.exp(-tvec(0.05) / 0.008)
    return np.concatenate([pop * 0.9, fx_sparkle(10, 0.8, 4)])


def fx_ting():
    t = tvec(0.9)
    return (np.sin(2 * np.pi * 2637 * t) + 0.5 * np.sin(2 * np.pi * 5274 * t) + 0.3 * np.sin(2 * np.pi * 3951 * t)) * np.exp(-t / 0.25) * 0.3


def fx_rise():
    t = tvec(1.2)
    y = sweep(300, 1200, 1.2) * 0.25 + (lowpass(RNG.standard_normal(len(t)), 6)) * (t / 1.2) * 0.2
    put(y, fx_sparkle(6, 0.5, 8), int(0.7 * SR))
    return y


def fx_button():
    a = pluck(72, 0.25, 0.4, 0.8) * 0.8
    b = pluck(65, 0.6, 0.6, 0.8) * 0.8
    return np.concatenate([a, np.zeros(int(0.12 * SR)), b])


def fx_pickup():
    return np.concatenate([highpass(RNG.standard_normal(int(0.02 * SR)), 2) * 0.5, np.zeros(int(0.03 * SR)), fx_thud() * 0.4])


def fx_pings_seq():
    y = np.zeros(int(8.5 * SR))
    times = [0.05, 0.25, 0.42, 0.56, 0.66, 0.74, 0.81, 0.87, 0.92]
    t = 1.0
    gap = 0.5
    while t < 8.2:
        times.append(t)
        gap = max(0.09, gap * 0.9)
        t += gap
    r = np.random.default_rng(11)
    for tt in times:
        s = fx_ping() * (0.25 + 0.1 * r.random())
        o = int(tt * SR)
        if o + len(s) < len(y):
            put(y, s, o)
    return y


FX = {
    'pings': fx_pings_seq, 'ring': fx_ring, 'alarm': fx_alarm, 'slam': fx_slam, 'stamp': fx_stamp, 'paper': fx_paper,
    'pickup': fx_pickup, 'sparkle': fx_sparkle, 'clap': fx_clap, 'whoosh': fx_whoosh, 'thud': fx_thud, 'shine': fx_shine,
    'fix': fx_fix, 'pop': fx_pop, 'record_stop': fx_record_stop, 'drawer': fx_drawer, 'robots': fx_robots, 'timpani': lambda: timpani(41, 1.6),
    'coins': fx_coins, 'typewriter': fx_typewriter, 'steps_fast': lambda: fx_steps(15, 0.17, 0.35), 'startle': fx_startle,
    'scratch': fx_scratch, 'dial': fx_dial, 'confetti': fx_confetti, 'ting': fx_ting, 'steps': lambda: fx_steps(3, 0.3, 0.4),
    'rise': fx_rise, 'button': fx_button,
}
FX_GAIN = {'pings': 0.9, 'ring': 0.8, 'slam': 0.9, 'whoosh': 0.5, 'pop': 0.5, 'thud': 0.7, 'timpani': 0.9, 'steps_fast': 0.6, 'ting': 1.0, 'scratch': 1.0}

# ---------------- música ----------------
CH = {'F': ([53, 57, 60], 41), 'Dm': ([50, 53, 57], 38), 'Bb': ([50, 53, 58], 34), 'C': ([52, 55, 60], 36),
      'Gm': ([50, 55, 58], 43), 'A': ([49, 52, 57], 45), 'C/E': ([52, 55, 60], 40), 'Am': ([52, 57, 60], 45)}
THEME = [
    [(0, 72, 1), (1, 69, .5), (1.5, 72, .5), (2, 77, 1.5), (3.5, 76, .5)],
    [(0, 74, 1), (1, 69, .5), (1.5, 74, .5), (2, 77, 1), (3, 76, .5), (3.5, 74, .5)],
    [(0, 74, .5), (.5, 72, .5), (1, 70, .5), (1.5, 74, .5), (2, 77, 1), (3, 74, 1)],
    [(0, 76, .5), (.5, 77, .5), (1, 79, 1), (2, 76, 1), (3, 72, 1)],
    [(0, 81, 1), (1, 79, .5), (1.5, 77, .5), (2, 72, 1), (3, 69, 1)],
    [(0, 77, 1), (1, 76, .5), (1.5, 74, .5), (2, 69, 1), (3, 74, 1)],
    [(0, 70, .5), (.5, 74, .5), (1, 77, .5), (1.5, 82, 1), (2.5, 81, .5), (3, 79, 1)],
    [(0, 76, .5), (.5, 79, .5), (1, 84, 1), (2, 82, .5), (2.5, 79, .5), (3, 76, 1)],
]
THEME_CH = ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C']


class Mix:
    def __init__(self, dur):
        self.n = int((dur + 3) * SR)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)

    def add(self, sig, t, gain=1.0, pan=0.0, until=None):
        o = int(t * SR)
        if o >= self.n or o < 0:
            return
        s = sig * gain
        if until is not None:
            m = int((until - t) * SR)
            if m <= 0:
                return
            if m < len(s):
                s = s[:m].copy()
                f = min(len(s), int(0.015 * SR))
                s[-f:] *= np.linspace(1, 0, f)
        s = s[:self.n - o]
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.L[o:o + len(s)] += s * gl * 1.414
        self.R[o:o + len(s)] += s * gr * 1.414


def theme_section(mx, t0, t1, full=True, brassy=False, start_bar=0, drums=True, mel_gain=0.32):
    bar = start_bar
    t = t0
    while t < t1 - 0.05:
        ch = THEME_CH[bar % 8]
        notes, root = CH[ch]
        # baixo (tempos 1 e 3) e acordes em pizzicato (2 e 4)
        mx.add(bass(root, BEAT * 1.4), t, 0.55, -0.1, until=t1)
        mx.add(bass(root + 7, BEAT * 1.2), t + 2 * BEAT, 0.45, -0.1, until=t1)
        if full:
            mx.add(bass(root + 12, BEAT * 0.5), t + 3.5 * BEAT, 0.3, -0.1, until=t1)
        for b in (1, 3):
            for k, m in enumerate(notes):
                mx.add(pluck(m + 12, 0.35, 0.5, 0.75, k), t + b * BEAT + k * 0.008, 0.16, 0.25, until=t1)
        if brassy:
            mx.add(brass(notes, BAR * 0.98), t, 0.22, -0.3, until=t1)
        else:
            mx.add(pad(notes, BAR * 1.02, 0.4, 0.4), t, 0.10, -0.3, until=t1)
        # melodia
        for (b, m, d) in THEME[bar % 8]:
            mx.add(celesta(m, d * BEAT + 0.5, 0.55), t + b * BEAT, mel_gain, 0.15, until=t1)
            mx.add(pluck(m - 12, d * BEAT + 0.3, 0.6, 0.7), t + b * BEAT, mel_gain * 0.35, -0.15, until=t1)
            if brassy:
                mx.add(brass([m - 12], d * BEAT * 0.95), t + b * BEAT, 0.12, 0.2, until=t1)
        if drums and full:
            mx.add(kick(), t, 0.5, 0, until=t1)
            mx.add(kick(), t + 2 * BEAT, 0.42, 0, until=t1)
            mx.add(snap(), t + BEAT, 0.28, 0.1, until=t1)
            mx.add(snap(), t + 3 * BEAT, 0.28, 0.1, until=t1)
            for e in range(8):
                mx.add(shaker(), t + e * BEAT / 2, 0.22 if e % 2 else 0.12, 0.35, until=t1)
        t += BAR
        bar += 1


def music(mx, cues):
    for sec in cues['musica']:
        a, b, st = sec['de'], sec['ate'], sec['estilo']
        if st == 'tensao':
            t = tvec(b - a)
            f = 55 * (1 + 0.06 * t / (b - a))
            drone = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)) * (0.3 + 0.7 * t / (b - a)) * (0.8 + 0.2 * np.sin(2 * np.pi * 6 * t))
            mx.add(drone * 0.22, a, until=b)
            tt, gap = a + 1.0, 0.45
            while tt < b:
                mx.add(highpass(RNG.standard_normal(int(0.012 * SR)), 2) * 0.5, tt, 0.5, 0.3)
                gap = max(0.12, gap * 0.93)
                tt += gap
        elif st == 'esperanca':
            prog = ['F', 'C/E', 'Dm', 'Bb', 'C']
            t = a
            i = 0
            while t < b - 0.1:
                notes, root = CH[prog[i % len(prog)]]
                mx.add(pad(notes, BAR * 1.05, 0.6, 0.6), t, 0.10 + 0.04 * i, -0.2, until=b)
                arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 24]
                for k in range(8):
                    mx.add(celesta(arp[k % 4], 0.9, 0.6), t + k * BEAT / 2, 0.18 + 0.02 * i, 0.2 * (1 if k % 2 else -1), until=b)
                if i >= 2:
                    mx.add(bass(root, BAR), t, 0.35, until=b)
                t += BAR
                i += 1
        elif st == 'tema':
            # primeira volta mais leve, depois completa
            mid = a + 4 * BAR
            theme_section(mx, a, mid, full=False)
            theme_section(mx, mid, b, full=True, start_bar=4)
        elif st == 'metodo':
            prog = ['Dm', 'Bb', 'F', 'C']
            t, i = a, 0
            while t < b - 0.05:
                notes, root = CH[prog[i % 4]]
                mx.add(bass(root, BEAT * 1.5), t, 0.5, until=b)
                mx.add(bass(root + 7, BEAT * 1.2), t + 2 * BEAT, 0.4, until=b)
                mx.add(pad(notes, BAR, 0.3, 0.3), t, 0.09, until=b)
                arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12]
                for k in range(16):
                    mx.add(marimba(arp[k % 4] + (12 if k % 8 >= 4 else 0), 0.4), t + k * BEAT / 4, 0.17, 0.3 * (1 if k % 2 else -1), until=b)
                mx.add(kick(), t, 0.35, until=b)
                mx.add(snap(), t + 2 * BEAT, 0.18, until=b)
                for e in range(8):
                    mx.add(shaker(), t + e * BEAT / 2, 0.12, 0.35, until=b)
                t += BAR
                i += 1
        elif st == 'triunfo':
            prog = ['Bb', 'C', 'Dm', 'C', 'Bb', 'C', 'F']
            t, i = a, 0
            while t < b - 0.05:
                notes, root = CH[prog[min(i, len(prog) - 1)]]
                mx.add(brass(notes, BAR * 0.98, 0.12), t, 0.3, -0.2, until=b)
                mx.add(bass(root, BAR), t, 0.5, until=b)
                for (bb, m, d) in THEME[(4 + i) % 8]:
                    mx.add(celesta(m, d * BEAT + 0.5), t + bb * BEAT, 0.28, 0.2, until=b)
                mx.add(kick(), t, 0.45, until=b)
                mx.add(kick(), t + 2 * BEAT, 0.4, until=b)
                mx.add(snap(), t + BEAT, 0.25, until=b)
                mx.add(snap(), t + 3 * BEAT, 0.25, until=b)
                for e in range(8):
                    mx.add(shaker(), t + e * BEAT / 2, 0.18 if e % 2 else 0.1, 0.35, until=b)
                t += BAR
                i += 1
        elif st == 'furtivo':
            pat = [50, None, 53, None, 57, 56, 57, None, 50, None, 53, None, 57, None, 60, 59]
            t = a
            while t < b - 0.05:
                for k, m in enumerate(pat):
                    if m is not None:
                        mx.add(pluck(m, 0.18, 0.15, 0.6), t + k * BEAT / 4 * 1.0, 0.45, -0.1, until=b)
                for e in range(4):
                    mx.add(shaker(0.05), t + e * BEAT, 0.12, 0.4, until=b)
                mx.add(bass(38, BEAT * 0.5), t, 0.35, until=b)
                mx.add(bass(38, BEAT * 0.5), t + 2 * BEAT, 0.3, until=b)
                t += BAR
        elif st == 'comico':
            mel = [(0, 72, .5), (.5, 74, .5), (1, 76, .5), (1.5, 77, .5), (2, 79, 1), (3, 77, .5), (3.5, 76, .5),
                   (4, 74, .5), (4.5, 76, .5), (5, 77, .5), (5.5, 76, .5), (6, 74, 1), (7, 72, 1)]
            t, i = a, 0
            while t < b - 0.05:
                notes, root = CH['F' if i % 2 == 0 else 'C']
                mx.add(bass(root, BEAT * 0.6), t, 0.5, until=b)
                mx.add(bass(root + 7, BEAT * 0.6), t + 2 * BEAT, 0.45, until=b)
                for bb in (1, 3):
                    for k, m in enumerate(notes):
                        mx.add(pluck(m + 12, 0.25, 0.3, 0.8, k), t + bb * BEAT, 0.16, 0.2, until=b)
                for (bb, m, d) in mel:
                    if bb >= 4 * (i % 2) and bb < 4 * (i % 2) + 4:
                        mx.add(flute(m, d * BEAT * 0.9), t + (bb - 4 * (i % 2)) * BEAT, 0.16, 0.15, until=b)
                mx.add(snap(), t + BEAT, 0.18, until=b)
                mx.add(snap(), t + 3 * BEAT, 0.18, until=b)
                t += BAR
                i += 1
        elif st == 'espiao':
            t = a
            riff = [(0, 40), (0.75, 40), (1.5, 43), (2.0, 40), (2.75, 46), (3.25, 45)]
            while t < b - 0.05:
                for bb, m in riff:
                    mx.add(pluck(m, 0.4, 0.5, 0.9) * (1 + 0.3 * np.sin(2 * np.pi * 8 * tvec(0.4))), t + bb * BEAT, 0.6, -0.1, until=b)
                for e in range(8):
                    mx.add(shaker(0.05), t + e * BEAT / 2, 0.14, 0.4, until=b)
                mx.add(pad([52, 55, 59], BAR, 0.3, 0.3), t, 0.06, until=b)
                t += BAR
        elif st == 'final':
            end = b - BAR * 1.5
            theme_section(mx, a, end, full=True, brassy=True, mel_gain=0.36)
            # acorde final com rufar
            notes, root = CH['F']
            mx.add(brass(notes + [65], BAR * 2.2, 0.05), end, 0.38)
            mx.add(pad(notes + [65, 69], BAR * 2.6, 0.05, 1.5), end, 0.18)
            mx.add(bass(root, BAR * 2), end, 0.6)
            mx.add(celesta(89, 2.5, 1.2), end, 0.3)
            roll = 0.0
            while roll < BAR * 1.2:
                mx.add(timpani(41, 0.4), end - BAR * 1.2 + roll, 0.25 + 0.4 * roll / (BAR * 1.2))
                roll += max(0.05, 0.16 - roll * 0.05)
            mx.add(timpani(41, 2.0), end, 0.9)


def reverb(x, secs=1.6, wet=0.2, seed=3):
    r = np.random.default_rng(seed)
    n = int(secs * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR / (secs / 6.9))
    ir = lowpass(ir, 3)
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:len(x)]
    return x * (1 - wet) + y * wet


def main():
    cues = json.load(open(os.path.join(BUILD, 'cues.json')))
    total = cues['total']
    mus = Mix(total)
    music(mus, cues)
    mus.L = reverb(mus.L, wet=0.22, seed=3)
    mus.R = reverb(mus.R, wet=0.22, seed=4)
    fx = Mix(total)
    for c in cues['sfx']:
        fn = FX.get(c['s'])
        if not fn:
            print('efeito desconhecido:', c['s'], file=sys.stderr)
            continue
        sig = fn()
        pan = float(np.clip(np.sin(c['t'] * 1.7) * 0.3, -0.3, 0.3))
        fx.add(sig, c['t'], FX_GAIN.get(c['s'], 0.7), pan)
    fx.L = reverb(fx.L, 0.8, 0.1, 5)
    fx.R = reverb(fx.R, 0.8, 0.1, 6)
    L = mus.L * 0.55 + fx.L * 0.75
    R = mus.R * 0.55 + fx.R * 0.75
    n = int(total * SR)
    L, R = L[:n], R[:n]
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-9)
    L, R = np.tanh(L / peak * 1.15) / np.tanh(1.15) * 0.89, np.tanh(R / peak * 1.15) / np.tanh(1.15) * 0.89
    f = int(0.05 * SR)
    for ch in (L, R):
        ch[:f] *= np.linspace(0, 1, f)
        ch[-f:] *= np.linspace(1, 0, f)
    data = (np.stack([L, R], axis=1) * 32767).astype('<i2')
    out = os.path.join(BUILD, 'trilha.wav')
    with wave.open(out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f'{out}: {total:.2f} s')


if __name__ == '__main__':
    main()
