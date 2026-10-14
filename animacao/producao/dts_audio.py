"""Curta DTS (~29 s): prepara a narração do ElevenLabs, a trilha e os efeitos.

  python3 producao/dts_audio.py

Entrada:  audio/dts/narracao-take3.mp3 (voz "Enzo", eleven_v4) e audio/dts/palavras-take3.json
          (transcrição eleven_scribe_v1 com tempo de cada palavra).
Saídas:   build/dts/trilha.wav  -> narração + música + efeitos, já mixados
          src/dts/tempos.json   -> palavras no tempo final, início de cada cena e deixas
                                   (o desenho em src/dts/curta.js lê este arquivo)

A take original tem 33,5 s. Para caber em 30 s, as pausas longas viram 0,2 s e a fala
ganha 9% de velocidade (atempo, sem mudar o tom).
"""
import json
import os
import subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TEMPO = 1.09          # aceleração da fala
PAUSA = 0.2           # pausa máxima que sobra entre frases (s)
LEAD = 0.45           # respiro antes da primeira palavra
TAIL = 1.15           # segura o quadro final depois da última palavra

# cenas: (id, índice da palavra que abre a cena)
CENAS = [
    ('chegada', 0),      # Julho de 2026. Cheguei à Alvarez and Marsal, no DTS...
    ('aula', 17),        # Aqui, IA não é moda: é método. Aprendi,
    ('descoberta', 25),  # testei, me descobri...
    ('criacao', 28),     # e comecei a criar! Dashboards, propostas, sistemas, produtos de engajamento.
    ('lideranca', 38),   # E sempre com a liderança por perto: direcionando, acompanhando, trocando.
    ('jornada', 48),     # Quatro meses. Foco em entrega, performance e collection.
    ('final', 56),       # Isso é DTS. Isso é Alvarez and Marsal.
]

# produtos que saem da tela: (rótulo, ícone, palavra que dispara ou None, deslocamento em s)
PRODUTOS = [
    ('Dashboard', 'dash', 32, 0.0),
    ('Apresentação', 'deck', 32, 0.42),
    ('Proposta', 'doc', 33, 0.0),
    ('Mapa de adoção', 'map', 33, 0.42),
    ('Sistema', 'app', 34, 0.0),
    ('Ferramenta', 'tool', 34, 0.38),
    ('Engajamento', 'game', 35, 0.0),
    ('Gamificação', 'trophy', 37, 0.1),
]


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def encode_wav(x, path):
    x = np.clip(x, -1, 1)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-i', '-', path],
                   input=x.astype(np.float32).tobytes(), check=True)


def silences(x, thr_db=-38, min_d=0.25):
    hop = SR // 100
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    quiet = 20 * np.log10(rms) < thr_db
    out, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) / 100 >= min_d and i > 0 and j < n:
                out.append((i / 100, j / 100))
            i = j
        else:
            i += 1
    return out


def encurtar_pausas(x):
    """Corta o meio das pausas longas. Devolve o áudio e os nós (t_original, t_novo)."""
    keep = PAUSA / 2
    parts, knots, pos, novo = [], [(0.0, 0.0)], 0.0, 0.0
    fade = int(0.01 * SR)
    for a, b in silences(x):
        if b - a <= PAUSA + 0.02:
            continue
        cut0, cut1 = a + keep, b - keep
        seg = x[int(pos * SR):int(cut0 * SR)].copy()
        if parts:
            seg[:fade] *= np.linspace(0, 1, fade)
        seg[-fade:] *= np.linspace(1, 0, fade)
        parts.append(seg)
        novo += cut0 - pos
        knots += [(cut0, novo), (cut1, novo)]
        pos = cut1
    tail = x[int(pos * SR):].copy()
    tail[:fade] *= np.linspace(0, 1, fade)
    parts.append(tail)
    novo += len(x) / SR - pos
    knots.append((len(x) / SR, novo))
    return np.concatenate(parts), knots


def mapear(t, knots):
    ts, ns = zip(*knots)
    return float(np.interp(t, ts, ns)) / TEMPO + LEAD


# ---------------- síntese ----------------
def env_adsr(n, a=0.01, r=0.2):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def nota(f, dur, kind='pad', amp=0.1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if kind == 'pad':
        s = sum(np.sin(2 * np.pi * f * d * t) for d in (0.997, 1.0, 1.004)) / 3
        s += 0.3 * np.sin(2 * np.pi * f * 2 * t)
        e = env_adsr(n, 0.35, 0.6)
    elif kind == 'pluck':
        s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2 * t) + 0.12 * np.sin(2 * np.pi * f * 3 * t)
        e = np.exp(-t * 7) * env_adsr(n, 0.004, 0.03)
    elif kind == 'bass':
        s = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * f * 2 * t)
        e = np.exp(-t * 2.2) * env_adsr(n, 0.01, 0.08)
    return amp * s * e


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def add(buf, x, t):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) < 0:
        return
    j = min(len(buf), i + len(x))
    if i < 0:
        x, i = x[-i:], 0
    buf[i:j] += x[:j - i]


def musica(T, inicio_beat, cenas):
    buf = np.zeros(int(T * SR))
    bpm = 112
    beat = 60 / bpm
    # I – V – vi – IV em Ré maior (otimista, corporativo)
    acordes = [(62, 66, 69), (69, 73, 76), (71, 74, 78), (67, 71, 74)]
    baixos = [38, 45, 47, 43]
    compasso = 4 * beat
    k = 0
    t = 0.0
    while t < T:
        ac = acordes[k % 4]
        for m in ac:
            add(buf, nota(mtof(m), compasso + 0.5, 'pad', 0.035), t)
        if t >= inicio_beat - 0.01:
            add(buf, nota(mtof(baixos[k % 4]), compasso, 'bass', 0.09), t)
        # arpejo em colcheias depois da primeira cena
        if t >= cenas['aula'] - 0.5:
            seq = [ac[0] + 12, ac[1] + 12, ac[2] + 12, ac[1] + 12]
            for i in range(8):
                add(buf, nota(mtof(seq[i % 4]), 0.35, 'pluck', 0.045), t + i * beat / 2)
        # bumbo suave + chimbal a partir da criação
        if t >= inicio_beat - 0.01:
            for i in range(4):
                tb = t + i * beat
                n = int(0.18 * SR)
                tt = np.arange(n) / SR
                kick = np.sin(2 * np.pi * (52 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 18) * 0.22
                add(buf, kick, tb)
                hh = np.random.default_rng(int(tb * 1000)).standard_normal(int(0.04 * SR))
                hh = np.diff(hh, prepend=0) * np.exp(-np.arange(len(hh)) / SR * 90) * 0.025
                add(buf, hh, tb + beat / 2)
        t += compasso
        k += 1
    return buf


def whoosh(d=0.45, amp=0.12, seed=1):
    n = int(d * SR)
    rng = np.random.default_rng(seed)
    x = rng.standard_normal(n)
    # passa-baixa móvel simples (média exponencial com coeficiente variável)
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        a = 0.02 + 0.25 * np.sin(np.pi * i / n) ** 2
        y += a * (x[i] - y)
        out[i] = y
    return amp * out * np.sin(np.pi * np.arange(n) / n) ** 1.5 * 3


def pop(f0=880, amp=0.16):
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.8 * np.exp(-t * 40))
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22)


def tecla(seed):
    n = int(0.03 * SR)
    rng = np.random.default_rng(seed)
    x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 260)
    return 0.05 * np.diff(x, prepend=0)


def sino(amp=0.12):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    s = 0
    for m, a in ((86, 1), (90, 0.6), (93, 0.5), (98, 0.35)):
        s = s + a * np.sin(2 * np.pi * mtof(m) * t)
    return amp * s * np.exp(-t * 2.4) * env_adsr(n, 0.005, 0.1)


def main():
    pal = json.load(open(os.path.join(ROOT, 'audio/dts/palavras-take3.json')))['words']
    pal = [w for w in pal if w['type'] == 'word']
    voz = decode(os.path.join(ROOT, 'audio/dts/narracao-take3.mp3'))
    voz, knots = encurtar_pausas(voz)
    os.makedirs(os.path.join(ROOT, 'build/dts'), exist_ok=True)
    tmp = os.path.join(ROOT, 'build/dts/_voz_cortada.wav')
    encode_wav(voz, tmp)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', tmp, '-af', f'atempo={TEMPO}', '-f', 'f32le', '-ac', '1',
                          '-ar', str(SR), '-'], check=True, capture_output=True).stdout
    voz = np.frombuffer(raw, dtype=np.float32).copy()

    palavras = [{'w': w['text'], 'a': round(mapear(w['start'], knots), 3), 'b': round(mapear(w['end'], knots), 3)}
                for w in pal]
    T = round(palavras[-1]['b'] + TAIL, 2)
    cenas = {}
    for i, (cid, wi) in enumerate(CENAS):
        cenas[cid] = 0.0 if i == 0 else round(palavras[wi]['a'] - 0.12, 3)
    produtos = [{'rotulo': r, 'icone': ic, 't': round(palavras[wi]['a'] + dt, 3)} for r, ic, wi, dt in PRODUTOS]

    # ---- mix ----
    buf = np.zeros(int(T * SR))
    add(buf, voz * 0.95, LEAD)
    mus = musica(T, cenas['criacao'], cenas)
    # ducking: a música baixa quando há voz
    hop = SR // 50
    n = len(buf) // hop
    vz = np.sqrt(np.mean(buf[:n * hop].reshape(n, hop) ** 2, axis=1))
    duck = np.interp(np.arange(len(buf)), np.arange(n) * hop + hop / 2, np.where(vz > 0.01, 0.55, 1.0))
    k = int(0.12 * SR)
    duck = np.convolve(duck, np.ones(k) / k, mode='same')
    fade_out = np.clip((T - np.arange(len(buf)) / SR) / 0.9, 0, 1)
    fade_in = np.clip(np.arange(len(buf)) / SR / 0.6, 0, 1)
    buf += mus[:len(buf)] * duck * fade_out * fade_in

    cortes = [cenas[c] for c, _ in CENAS[1:]]
    for i, tc in enumerate(cortes):
        add(buf, whoosh(seed=i + 3), tc - 0.22)
    for i, p in enumerate(produtos):
        add(buf, pop(760 + 90 * (i % 4)), p['t'])
    # digitação no começo da criação
    for i in range(14):
        add(buf, tecla(i), cenas['criacao'] + 0.1 + i * 0.075 + (i % 3) * 0.012)
    add(buf, sino(), cenas['final'] + 0.15)

    pico = np.max(np.abs(buf))
    buf *= 0.89 / pico
    encode_wav(buf, os.path.join(ROOT, 'build/dts/trilha.wav'))
    os.remove(tmp)

    out = {'duracao': T, 'cenas': cenas, 'ordem': [c for c, _ in CENAS], 'palavras': palavras, 'produtos': produtos}
    with open(os.path.join(ROOT, 'src/dts/tempos.json'), 'w') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f'trilha.wav: {T:.2f} s · cenas:', {k: round(v, 2) for k, v in cenas.items()})


if __name__ == '__main__':
    main()
