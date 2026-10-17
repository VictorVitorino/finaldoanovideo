"""Trilha do vídeo do carrossel "Gestão de Mudanças em adoção de IA" (A&M · DTS · Performance).

  python3 producao/carrossel_audio.py            -> build/carrossel/trilha.wav

Sem narração: o vídeo funciona sem som (o LinkedIn abre mudo) e a trilha só acompanha.
Os instantes vêm de src/carrossel/tempos.json, a mesma fonte do desenho (src/carrossel/video.js):
cada beat de página dispara um efeito e a música muda de seção nas mesmas marcas.
Os instrumentos são os do curta de 60 s (producao/dts60_audio.py).
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dts60_audio import SR, add, nota, mtof, kick, hat, clap, riser, whoosh, impacto, pop, tique, carimbo, sino, encode_wav  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'build', 'carrossel')


def tempos():
    T = json.load(open(os.path.join(ROOT, 'src', 'carrossel', 'tempos.json')))
    acc = 0.0
    for p in T['paginas']:
        p['ini'] = acc
        acc += p['dur']
    T['total'] = acc
    return T


def drone(f, dur, amp=0.05):
    """Pad grave com batimento lento (tensão do gancho)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * d * t) for d in (0.997, 1.0, 1.004)) / 3 + 0.3 * np.sin(2 * np.pi * f * 2 * t)
    e = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 0.6)
    return amp * s * e * (0.75 + 0.25 * np.sin(2 * np.pi * 0.5 * t))


def musica(T, buf):
    """Ré maior, 104 bpm. Seções: gancho (drone + pulso), groove (página 1), cheio (2 e 3),
    respiro sob o foco da matriz e acorde final."""
    p1, p2, p3 = T['paginas']
    B1, B2, B3 = p1['beats'], p2['beats'], p3['beats']
    drop = p1['ini'] + B1['sobe']
    foco0, foco1 = p2['ini'] + B2['foco'], p2['ini'] + B2['focoFim']
    fim = p3['ini'] + B3['final']
    total = T['total']
    bpm = 104
    beat = 60 / bpm
    comp = 4 * beat
    acordes = [(62, 66, 69), (69, 73, 76), (71, 74, 78), (67, 71, 74)]  # I V vi IV
    baixos = [38, 45, 47, 43]

    # gancho: drone em Ré + pulso de coração que acelera até o drop
    add(buf, drone(mtof(38), drop + 0.4, 0.07), 0)
    add(buf, drone(mtof(45), drop + 0.4, 0.035), 0)
    tb = 0.35
    while tb < drop - 0.1:
        add(buf, kick(0.16), tb)
        add(buf, kick(0.1), tb + 0.18)
        tb += max(0.5, 0.95 - tb * 0.12)

    # progressão a partir do drop, alinhada ao compasso
    t, k = drop, 0
    while t < total:
        ac = acordes[k % 4]
        sob_foco = foco0 - 0.1 <= t < foco1
        cheio = t >= p2['ini'] - 0.2 and not sob_foco
        final = t >= fim - 0.05
        if final:
            break
        for m in ac:
            add(buf, nota(mtof(m), comp + 0.6, 'pad', 0.026 if not sob_foco else 0.034), t)
        seq = [ac[0] + 12, ac[2] + 12, ac[1] + 12, ac[2] + 12]
        for i in range(4):
            add(buf, nota(mtof(seq[i]), 1.2, 'piano', 0.04 if not sob_foco else 0.025), t + i * beat)
        if not sob_foco:
            add(buf, nota(mtof(baixos[k % 4]), comp, 'bass', 0.085), t)
            for i in range(4):
                tq = t + i * beat
                if tq >= foco0 - 0.05 and tq < foco1:
                    continue
                add(buf, kick(0.17 if cheio else 0.12), tq)
                add(buf, hat(int(tq * 997), 0.025 if cheio else 0.018), tq + beat / 2)
                if cheio and i % 2 == 1:
                    add(buf, clap(int(tq * 991), 0.055), tq)
            if cheio:
                arp = [ac[0] + 24, ac[1] + 24, ac[2] + 24, ac[1] + 24]
                for i in range(8):
                    add(buf, nota(mtof(arp[i % 4]), 0.3, 'pluck', 0.026), t + i * beat / 2)
        t += comp
        k += 1

    # acorde final (Ré maior aberto) + sino, segurando até o fim
    resto = total - fim + 0.8
    for m in (50, 57, 62, 66, 69, 74):
        add(buf, nota(mtof(m), resto, 'pad', 0.03), fim)
    add(buf, nota(mtof(38), resto, 'bass', 0.1), fim)
    add(buf, nota(mtof(74), 2.4, 'piano', 0.05), fim)
    add(buf, nota(mtof(78), 2.4, 'piano', 0.04), fim + 0.12)
    add(buf, nota(mtof(81), 2.6, 'piano', 0.04), fim + 0.24)


def efeitos(T, buf):
    p1, p2, p3 = T['paginas']
    a, B = p1['ini'], p1['beats']
    add(buf, impacto(0.2), a + B['hook1'])
    add(buf, pop(660, 0.1), a + B['hook2'])
    add(buf, impacto(0.24), a + B['hook3'])
    add(buf, sino(0.07, 86), a + B['hook3'] + 0.05)
    add(buf, whoosh(0.6, 0.12, 3), a + B['sobe'] - 0.1)
    add(buf, tique(0.05), a + B['titulo'])
    add(buf, tique(0.05), a + B['titulo'] + 0.16)
    add(buf, riser(2.2, 0.035, 7), a + B['grafico'])              # a linha sendo desenhada
    add(buf, pop(990, 0.12), a + B['grafico'] + 2.2)               # rótulo 88%
    add(buf, pop(880, 0.1), a + B['grafico'] + 1.3 + 2.2)          # rótulo da IA generativa
    for i, f0 in enumerate((740, 620, 520)):                       # funil: o tom desce com o valor
        add(buf, pop(f0, 0.12), a + B['funil'] + i * 0.8)
    add(buf, sino(0.05, 81), a + B['conclusao'] + 0.2)

    dc = T['cortina']
    for p in (p2, p3):
        add(buf, whoosh(dc * 0.95, 0.14, int(p['ini'] * 10)), p['ini'] - dc / 2)

    a, B = p2['ini'], p2['beats']
    add(buf, tique(0.05), a + B['titulo'])
    add(buf, tique(0.05), a + B['titulo'] + 0.16)
    for i, f0 in enumerate((520, 620, 880)):
        add(buf, pop(f0, 0.11), a + B['barra'] + i * 0.35)
    for d in range(9):                                             # células da matriz em onda
        add(buf, tique(0.025), a + B['matriz'] + d * 0.06)
    add(buf, riser(0.8, 0.03, 11), a + B['matriz'] + 0.8)          # contorno da zona crítica
    for idx in range(7):                                           # bolhas dos desafios
        add(buf, pop(560 + idx * 45, 0.09), a + B['matriz'] + 1.2 + idx * 0.42)
    add(buf, impacto(0.18), a + B['foco'])
    add(buf, sino(0.05, 81), a + B['conclusao'] + 0.2)

    a, B = p3['ini'], p3['beats']
    add(buf, tique(0.05), a + B['titulo'])
    add(buf, tique(0.05), a + B['titulo'] + 0.16)
    for i, f0 in enumerate((620, 740, 990)):
        add(buf, pop(f0, 0.12), a + B['equacao'] + i * 0.45)
    for i in range(5):
        add(buf, tique(0.045), a + B['etapas'] + i * 0.42)
    for i in range(4):
        add(buf, pop(700 + i * 60, 0.08), a + B['kpis'] + i * 0.18)
    add(buf, carimbo(0.22), a + B['selo'] + 0.3)
    add(buf, whoosh(0.5, 0.1, 21), a + B['cta'] - 0.1)
    add(buf, sino(0.08, 86), a + B['final'])


def main():
    os.makedirs(OUT, exist_ok=True)
    T = tempos()
    total = T['total']
    buf = np.zeros(int((total + 1.5) * SR))
    musica(T, buf)
    efeitos(T, buf)
    buf = buf[:int(total * SR)]
    # fade de saída
    nf = int(1.4 * SR)
    buf[-nf:] *= np.linspace(1, 0, nf) ** 1.5
    buf = np.tanh(buf * 1.6) / 1.6
    pico = float(np.max(np.abs(buf)))
    buf *= 0.89 / max(pico, 1e-6)
    out = os.path.join(OUT, 'trilha.wav')
    encode_wav(buf, out)
    print(f'{out}: {total:.2f} s')


if __name__ == '__main__':
    main()
