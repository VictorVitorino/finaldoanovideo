"""Curta DTS de 60 s ("Minha trajetória na Alvarez & Marsal em 60 segundos"): narração, trilha e efeitos.

  python3 producao/dts60_audio.py [--take doug1]

Entrada:  audio/dts60/<take>.mp3         narração do ElevenLabs (voz "Doug - Warm", eleven_v4)
          audio/dts60/<take>.words.json  tempo de cada palavra (alinhamento eleven_scribe_v1)
Saídas:   build/dts60/trilha.wav  -> narração + música + efeitos, mixados
          src/dts60/tempos.json   -> palavras no tempo final, início de cada cena, legendas e deixas

A fala NÃO é acelerada. Cada frase é recortada no silêncio natural e recolocada com um respiro
planejado entre as frases, para o vídeo fechar em ~60 s com espaço para as animações.
"""
import json
import os
import sys
import subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
ALVO = 60.0

# Roteiro em frases: (cena que a frase abre, nº de palavras). Total = 103 palavras.
FRASES = [
    ('capa', 9),        # Minha trajetória na Alvarez and Marsal… em sessenta segundos.
    ('chegada', 14),    # Cheguei na Alvarez and Marsal, dentro de DTS: um mundo de inovação e tecnologia!
    ('papel', 7),       # Meu papel? Gestão de Mudanças em Tecnologia.
    (None, 11),         # E fui recebido por gente que ensina, provoca e abre portas.
    ('ia', 7),          # Aqui, IA não é moda. É MÉTODO.
    ('aprender', 8),    # Estou aprendendo, testando… e entregando qualidade aos clientes.
    ('entregas', 14),   # Dashboards, propostas, sistemas, produtos de engajamento… tudo saindo do computador, direto para o cliente!
    ('lideranca', 10),  # E com a liderança sempre por perto: direcionando, acompanhando, trocando.
    ('foco', 14),       # Foco em entrega, performance, collection… e o melhor de tudo: aprendendo com os melhores.
    ('final', 9),       # Isso é DTS. Isso é Performance Alvarez and Marsal.
]
# respiro planejado DEPOIS de cada frase (s), antes do ajuste fino para fechar em ALVO
RESPIRO = [1.15, 1.25, 0.32, 0.85, 0.6, 0.55, 1.5, 0.8, 0.85]
ABERTURA = 1.4    # música antes da primeira palavra (capa)
FINAL = 3.2       # segura o quadro final depois da última palavra
DTS_PALAVRA = 16  # índice de "DTS:" na frase 2 (abre a cena 'dts')

# Texto exibido na legenda (mesma ordem das 103 palavras faladas)
EXIBE = {'and': '&', 'sessenta': '60'}
# Blocos da legenda (índices de palavra, inclusive)
LEGENDAS = [(0, 8), (9, 16), (17, 22), (23, 29), (30, 40), (41, 47), (48, 55), (56, 61), (62, 69),
            (70, 76), (77, 79), (80, 84), (85, 93), (94, 96), (97, 102)]
DESTAQUE = [3, 4, 5, 7, 8, 11, 12, 13, 16, 20, 22, 25, 26, 27, 29, 36, 37, 39, 40, 42, 47, 49, 50, 52, 53,
            56, 57, 58, 59, 61, 65, 69, 73, 76, 77, 78, 79, 82, 83, 84, 87, 90, 93, 96, 99, 100, 101, 102]

# Produtos que saem do computador na cena 'entregas': (rótulo, ícone, palavra que dispara, deslocamento s)
PRODUTOS = [
    ('Dashboard', 'dash', 56, 0.0),
    ('Apresentação', 'deck', 56, 0.42),
    ('Proposta', 'doc', 57, 0.0),
    ('Mapa de adoção', 'map', 57, 0.4),
    ('Sistema', 'app', 58, 0.0),
    ('Ferramenta', 'tool', 58, 0.36),
    ('Engajamento', 'game', 59, 0.0),
    ('Gamificação', 'trophy', 61, 0.05),
    ('Trilha de IA', 'sparkle', 62, 0.1),
    ('Agente', 'chat', 64, 0.0),
]


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def encode_wav(x, path):
    x = np.clip(x, -1, 1)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-i', '-', path],
                   input=x.astype(np.float32).tobytes(), check=True)


def rms_db(x, hop):
    n = len(x) // hop
    r = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(r)


def ponto_de_corte(x, a, b):
    """Silêncio mais longo entre os tempos a e b (s). Devolve (início, fim) do trecho quieto."""
    hop = SR // 200  # 5 ms
    i0, i1 = max(0, int(a * 200)), min(len(x) // hop, int(b * 200) + 1)
    db = rms_db(x, hop)[i0:i1]
    if len(db) == 0:
        return a, b
    lim = min(-38, np.percentile(db, 20) + 6)
    quiet = db < lim
    best, cur, s0 = (0, i0, i0), 0, None
    for k, q in enumerate(quiet):
        if q:
            if s0 is None:
                s0 = k
            cur = k - s0 + 1
            if cur > best[0]:
                best = (cur, i0 + s0, i0 + k + 1)
        else:
            s0 = None
    if best[0] == 0:
        m = (a + b) / 2
        return m, m
    return best[1] / 200, best[2] / 200


# ---------------- síntese ----------------
def env(n, a=0.01, r=0.2):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def nota(f, dur, kind='pad', amp=0.1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if kind == 'pad':
        s = sum(np.sin(2 * np.pi * f * d * t + d) for d in (0.996, 1.0, 1.005)) / 3
        s += 0.25 * np.sin(2 * np.pi * f * 2 * t) + 0.1 * np.sin(2 * np.pi * f * 3 * t)
        e = env(n, 0.5, 0.8)
    elif kind == 'piano':
        s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3) + 0.2 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 5)
        e = np.exp(-t * 2.6) * env(n, 0.003, 0.05)
    elif kind == 'pluck':
        s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2 * t) + 0.12 * np.sin(2 * np.pi * f * 3 * t)
        e = np.exp(-t * 7) * env(n, 0.004, 0.03)
    elif kind == 'bass':
        s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
        e = np.exp(-t * 1.8) * env(n, 0.01, 0.08)
    else:
        s, e = np.zeros(n), np.zeros(n)
    return amp * s * e


def add(buf, x, t):
    i = int(round(t * SR))
    if i >= len(buf) or i + len(x) <= 0:
        return
    if i < 0:
        x, i = x[-i:], 0
    j = min(len(buf), i + len(x))
    buf[i:j] += x[:j - i]


def kick(amp=0.22):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (48 + 110 * np.exp(-t * 28)) * t) * np.exp(-t * 14) * amp


def hat(seed, amp=0.03):
    x = np.random.default_rng(seed).standard_normal(int(0.05 * SR))
    return np.diff(x, prepend=0) * np.exp(-np.arange(len(x)) / SR * 80) * amp


def clap(seed, amp=0.07):
    x = np.random.default_rng(seed).standard_normal(int(0.16 * SR))
    t = np.arange(len(x)) / SR
    e = np.exp(-t * 26) + 0.5 * np.exp(-np.maximum(0, t - 0.012) * 30) * (t > 0.012)
    return np.diff(x, prepend=0) * e * amp


def riser(d=1.2, amp=0.09, seed=5):
    n = int(d * SR)
    t = np.arange(n) / SR
    x = np.random.default_rng(seed).standard_normal(n)
    out = np.zeros(n)
    y = 0.0
    for i in range(0, n):
        a = 0.01 + 0.35 * (i / n) ** 2
        y += a * (x[i] - y)
        out[i] = y
    tone = np.sin(2 * np.pi * np.cumsum(300 + 900 * (t / d) ** 2) / SR) * 0.25
    return amp * (out * 3 + tone) * (t / d) ** 2


def whoosh(d=0.5, amp=0.11, seed=1):
    n = int(d * SR)
    x = np.random.default_rng(seed).standard_normal(n)
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        a = 0.02 + 0.25 * np.sin(np.pi * i / n) ** 2
        y += a * (x[i] - y)
        out[i] = y
    return amp * out * np.sin(np.pi * np.arange(n) / n) ** 1.5 * 3


def impacto(amp=0.32):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 70 * np.exp(-t * 9)) * t) * np.exp(-t * 3.2)
    x = np.random.default_rng(9).standard_normal(n)
    crack = np.diff(x, prepend=0) * np.exp(-t * 18) * 0.5
    return amp * (boom + crack)


def pop(f0=880, amp=0.15):
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.8 * np.exp(-t * 40))
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22)


def tecla(seed):
    n = int(0.03 * SR)
    x = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR * 260)
    return 0.05 * np.diff(x, prepend=0)


def tique(amp=0.06):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return amp * np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120)


def carimbo(amp=0.28):
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    x = np.random.default_rng(3).standard_normal(n)
    return amp * (np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 16) + np.diff(x, prepend=0) * np.exp(-t * 40) * 0.4)


def sino(amp=0.12, base=86):
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    s = 0
    for m, a in ((base, 1), (base + 4, 0.6), (base + 7, 0.5), (base + 12, 0.35)):
        s = s + a * np.sin(2 * np.pi * mtof(m) * t)
    return amp * s * np.exp(-t * 1.9) * env(n, 0.005, 0.1)


def musica(T, M):
    """Trilha em Ré maior, 108 bpm. M: marcos de tempo (capa, drop, fim)."""
    buf = np.zeros(int(T * SR) + SR)
    bpm = 108
    beat = 60 / bpm
    comp = 4 * beat
    acordes = [(62, 66, 69), (69, 73, 76), (71, 74, 78), (67, 71, 74)]  # I V vi IV
    baixos = [38, 45, 47, 43]
    t, k = 0.0, 0
    while t < T:
        ac = acordes[k % 4]
        intro = t < M['drop'] - 0.01
        for m in ac:
            add(buf, nota(mtof(m), comp + 0.6, 'pad', 0.03 if intro else 0.026), t)
        # piano em semínimas desde o início
        seq = [ac[0] + 12, ac[2] + 12, ac[1] + 12, ac[2] + 12]
        for i in range(4):
            add(buf, nota(mtof(seq[i]), 1.2, 'piano', 0.05 if intro else 0.035), t + i * beat)
        if not intro:
            add(buf, nota(mtof(baixos[k % 4]), comp, 'bass', 0.09), t)
            for i in range(8):
                arp = [ac[0] + 24, ac[1] + 24, ac[2] + 24, ac[1] + 24]
                add(buf, nota(mtof(arp[i % 4]), 0.3, 'pluck', 0.03), t + i * beat / 2)
            for i in range(4):
                tb = t + i * beat
                add(buf, kick(0.2), tb)
                add(buf, hat(int(tb * 997)), tb + beat / 2)
                if i % 2 == 1:
                    add(buf, clap(int(tb * 991)), tb)
        t += comp
        k += 1
    return buf[:int(T * SR)]


def main():
    take = 'doug1'
    if '--take' in sys.argv:
        take = sys.argv[sys.argv.index('--take') + 1]
    pal = json.load(open(os.path.join(ROOT, f'audio/dts60/{take}.words.json')))['words']
    pal = [w for w in pal if w['type'] == 'word' and not w['text'].startswith('[')]
    total_palavras = sum(n for _, n in FRASES)
    assert len(pal) == total_palavras, f'esperava {total_palavras} palavras, veio {len(pal)}'
    voz = decode(os.path.join(ROOT, f'audio/dts60/{take}.mp3'))
    dur_voz = len(voz) / SR
    # normaliza a voz: RMS dos trechos falados em -18 dBFS (a take vem baixa, com pico em -9 dB)
    hop = SR // 50
    nfr = len(voz) // hop
    fr = np.sqrt(np.mean(voz[:nfr * hop].reshape(nfr, hop) ** 2, axis=1))
    falado = fr[fr > np.max(fr) * 0.08]
    voz *= 10 ** (-18 / 20) / max(1e-6, float(np.sqrt(np.mean(falado ** 2))))
    voz = np.tanh(voz * 1.1) / 1.1  # limita picos com suavidade

    # limites das frases (índices de palavra)
    lim, i = [], 0
    for _, n in FRASES:
        lim.append((i, i + n - 1))
        i += n
    # pontos de corte no silêncio natural entre frases
    cortes = []  # (fim da frase k, início da frase k+1) no áudio original
    for k in range(len(FRASES) - 1):
        a = pal[lim[k][1]]['end'] - 0.05
        b = pal[lim[k + 1][0]]['start'] + 0.05
        q0, q1 = ponto_de_corte(voz, a, max(b, a + 0.05))
        cortes.append((min(q0 + 0.07, q1), max(q1 - 0.05, q0)))
    seg_ini = [max(0.0, pal[0]['start'] - 0.06)] + [c[1] for c in cortes]
    seg_fim = [c[0] for c in cortes] + [min(dur_voz, pal[-1]['end'] + 0.25)]
    fala = sum(b - a for a, b in zip(seg_ini, seg_fim))

    # ajuste fino dos respiros para fechar perto de ALVO
    resp = list(RESPIRO)
    base = fala + ABERTURA + FINAL + sum(resp)
    falta = ALVO - base
    if falta > 0:
        fator = 1 + falta / sum(resp)
        resp = [min(r * fator, 2.4) for r in resp]
    final = ALVO - (fala + ABERTURA + sum(resp))
    final = float(np.clip(final, 2.6, 4.5))
    T = round(fala + ABERTURA + sum(resp) + final, 2)

    # monta a voz na nova linha do tempo
    buf_voz = np.zeros(int((T + 1) * SR))
    novo_ini = []
    pos = ABERTURA
    fade = int(0.012 * SR)
    for k, (a, b) in enumerate(zip(seg_ini, seg_fim)):
        seg = voz[int(a * SR):int(b * SR)].copy()
        seg[:fade] *= np.linspace(0, 1, fade)
        seg[-fade:] *= np.linspace(1, 0, fade)
        novo_ini.append(pos)
        add(buf_voz, seg, pos)
        pos += (b - a) + (resp[k] if k < len(resp) else 0)

    def mapa(tw, k):
        return round(novo_ini[k] + (tw - seg_ini[k]), 3)

    palavras = []
    for k, (i0, i1) in enumerate(lim):
        for i in range(i0, i1 + 1):
            w = pal[i]
            txt = w['text']
            limpo = txt.strip('.,!?:;…').lower()
            if limpo in EXIBE:
                txt = EXIBE[limpo] + txt[len(txt.rstrip('.,!?:;…')):]
            palavras.append({'w': txt, 'a': mapa(w['start'], k), 'b': mapa(w['end'], k), 'frase': k})

    def wa(i):
        return palavras[i]['a']

    def wb(i):
        return palavras[i]['b']

    # cenas
    cenas = {'capa': 0.0}
    for k, (cid, _) in enumerate(FRASES):
        if k == 0 or cid is None:
            continue
        fim_ant = wb(lim[k - 1][1])
        cenas[cid] = round(fim_ant + resp[k - 1] * (0.55 if cid == 'lideranca' else 0.42), 3)
    cenas['dts'] = round(wa(DTS_PALAVRA) - 0.32, 3)
    ordem = ['capa', 'chegada', 'dts', 'papel', 'ia', 'aprender', 'entregas', 'lideranca', 'foco', 'final']
    cenas = {c: cenas[c] for c in ordem}
    produtos = [{'rotulo': r, 'icone': ic, 't': round(wa(wi) + dt, 3)} for r, ic, wi, dt in PRODUTOS]

    # ---- mix ----
    M = {'drop': wa(DTS_PALAVRA) - 0.02}
    mus = musica(T, M)
    buf = np.zeros(int(T * SR))
    vz = buf_voz[:len(buf)]
    hop = SR // 50
    n = len(buf) // hop
    env_v = np.sqrt(np.mean(vz[:n * hop].reshape(n, hop) ** 2, axis=1))
    duck = np.interp(np.arange(len(buf)), np.arange(n) * hop + hop / 2, np.where(env_v > 0.02, 0.32, 0.8))
    kk = int(0.15 * SR)
    duck = np.convolve(duck, np.ones(kk) / kk, mode='same')
    fade_out = np.clip((T - np.arange(len(buf)) / SR) / 1.4, 0, 1)
    fade_in = np.clip(np.arange(len(buf)) / SR / 0.4, 0, 1)
    buf += mus * duck * fade_out * fade_in
    buf += vz * 1.0

    sfx = []
    # capa: tique-taque do cronômetro
    for i in range(6):
        add(buf, tique(), 0.35 + i * 0.25)
    # cortes entre cenas (menos o corte para 'dts', que é impacto)
    for i, cid in enumerate(ordem[1:]):
        if cid == 'dts':
            continue
        add(buf, whoosh(seed=i + 3), cenas[cid] - 0.25)
        sfx.append({'t': round(cenas[cid] - 0.25, 3), 's': 'whoosh'})
    # riser + impacto no DTS
    add(buf, riser(1.3), wa(DTS_PALAVRA) - 1.3)
    add(buf, impacto(), wa(DTS_PALAVRA) - 0.02)
    sfx.append({'t': round(wa(DTS_PALAVRA), 3), 's': 'impacto'})
    # carimbo do MÉTODO
    add(buf, carimbo(), wa(47) + 0.05)
    # produtos
    for i, p in enumerate(produtos):
        add(buf, pop(720 + 80 * (i % 5)), p['t'])
    for i in range(16):
        add(buf, tecla(i), cenas['entregas'] + 0.15 + i * 0.07 + (i % 3) * 0.011)
    # final: riser, impacto no "DTS" e sino no "Performance"
    add(buf, riser(1.0, 0.07, 8), wa(96) - 1.0)
    add(buf, impacto(0.24), wa(96) - 0.02)
    add(buf, sino(0.11), wa(99) - 0.05)
    add(buf, sino(0.08, 93), wb(102) + 0.2)

    pico = np.max(np.abs(buf))
    buf *= 0.89 / pico
    os.makedirs(os.path.join(ROOT, 'build/dts60'), exist_ok=True)
    encode_wav(buf, os.path.join(ROOT, 'build/dts60/trilha.wav'))

    out = {
        'duracao': T, 'take': take, 'cenas': cenas, 'ordem': ordem, 'palavras': palavras,
        'frases': [{'de': a, 'ate': b} for a, b in lim], 'legendas': [{'de': a, 'ate': b} for a, b in LEGENDAS],
        'destaque': DESTAQUE, 'produtos': produtos, 'sfx': sfx,
    }
    os.makedirs(os.path.join(ROOT, 'src/dts60'), exist_ok=True)
    with open(os.path.join(ROOT, 'src/dts60/tempos.json'), 'w') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print(f'{take}: fala {fala:.2f} s · total {T:.2f} s · respiros', [round(r, 2) for r in resp], f'final {final:.2f}')
    print('cenas:', {k: round(v, 2) for k, v in cenas.items()})


if __name__ == '__main__':
    main()
