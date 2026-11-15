"""Vídeo "Além do raso" (página inicial do blog, 1920x1080, até 1:30): narração, trilha e efeitos.

  python3 producao/raso_audio.py [--take dani1]

Entrada:  audio/raso/<take>.mp3         narração do ElevenLabs (voz "Dani", carioca, eleven_v4)
          audio/raso/<take>.words.json  tempo de cada palavra (eleven_scribe_v1)
Saídas:   build/raso/trilha.wav   -> narração + música + ambiente + efeitos, mixados
          src/raso/tempos.json    -> palavras no tempo final, cenas, marcas, eventos, legendas e capítulos

A fala não é acelerada. Cada frase é recortada no silêncio natural e recolocada com um respiro planejado,
para a imagem ter tempo de mergulhar, mapear e quebrar o gelo. O total fica abaixo de 90 s.
"""
import json
import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dts60_audio import (SR, decode, encode_wav, ponto_de_corte, add, nota, mtof, kick, hat, whoosh, pop, sino,  # noqa: E402
                         riser, impacto, tique, carimbo)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALVO = 88.0     # duração desejada (s); o teto do pedido é 1:30
TETO = 89.6

# Roteiro em unidades de fala: (cena que a unidade abre, primeira palavra, última palavra). 168 palavras.
UNIDADES = [
    ('sala', 0, 16),        # Todo projeto de mudança tem uma parte que cabe no slide: o prazo, o sistema, o treinamento.
    (None, 17, 21),         # É a ponta do iceberg.
    (None, 22, 28),         # E muita reunião termina aqui, na superfície.
    ('mergulho', 29, 39),   # Só que a mudança de verdade acontece abaixo da linha d'água.
    ('fatores', 40, 44),    # No que cada pessoa entende.
    (None, 45, 48),         # No que ela acredita.
    (None, 49, 54),         # No que tem medo de perder.
    (None, 55, 58),         # Nos hábitos de anos.
    (None, 59, 63),         # Na confiança em quem lidera.
    ('choque', 64, 71),     # É nesse gelo invisível que os projetos batem.
    (None, 72, 83),         # O sistema entra no ar, e as pessoas voltam para a planilha.
    ('mapear', 84, 88),     # Gestão da mudança é mergulhar.
    (None, 89, 107),        # Primeiro, a gente mapeia o gelo: quem é impactado, o que muda para cada um, onde está a resistência.
    ('quebrar', 108, 113),  # Depois, quebra esse gelo em partes.
    (None, 114, 122),       # Com sentido: o porquê, na voz de quem lidera.
    (None, 123, 130),       # Com prática: as pessoas aprendendo no trabalho real.
    (None, 131, 140),       # E com medida: o uso de verdade, semana a semana.
    ('caminho', 141, 150),  # Pedaço por pedaço, o que travava o projeto vira caminho.
    (None, 151, 159),       # E a adoção deixa de ser promessa: vira rotina.
    ('fecho', 160, 167),    # Isso é gestão da mudança além do raso.
]
# respiro planejado DEPOIS de cada unidade (s), antes do ajuste fino para fechar em ALVO
RESPIRO = [0.7, 0.6, 1.25, 1.7, 0.5, 0.5, 0.5, 0.5, 1.5, 0.5, 1.6, 0.7, 1.3, 1.5, 0.8, 0.8, 1.6, 0.9, 1.6]
FIXOS = {4, 5, 6, 7, 9}   # respiros curtos que não entram no ajuste (ritmo da lista de fatores e do choque)
ABERTURA = 1.6   # antes da primeira palavra: a sala se acende
FINAL = 4.2      # segura o quadro final depois da última palavra (é onde a tela de escolha aparece no site)
ORDEM = ['sala', 'mergulho', 'fatores', 'choque', 'mapear', 'quebrar', 'caminho', 'fecho']
# quanto antes da primeira palavra da unidade a cena começa (s)
ANTECIPA = {'mergulho': 0.9, 'fatores': 0.45, 'choque': 0.75, 'mapear': 0.6, 'quebrar': 0.5, 'caminho': 0.65, 'fecho': 0.7}

# Blocos da legenda (índices de palavra, inclusive)
LEGENDAS = [(0, 10), (11, 16), (17, 21), (22, 28), (29, 39), (40, 44), (45, 48), (49, 54), (55, 58), (59, 63),
            (64, 71), (72, 76), (77, 83), (84, 88), (89, 94), (95, 97), (98, 103), (104, 107), (108, 113),
            (114, 117), (118, 122), (123, 124), (125, 130), (131, 133), (134, 140), (141, 143), (144, 150),
            (151, 157), (158, 159), (160, 167)]

# Marcas: índice da palavra que dispara cada evento da animação
MARCAS = {
    'slide': 10, 'prazo': 12, 'sistema': 14, 'treinamento': 16, 'ponta': 19, 'iceberg': 21, 'reuniao': 24, 'superficie': 28,
    'so_que': 29, 'verdade': 34, 'abaixo': 36, 'linha': 38, 'dagua': 39,
    'entende': 44, 'acredita': 48, 'medo': 52, 'perder': 54, 'habitos': 56, 'confianca': 60, 'lidera': 63,
    'nesse': 65, 'invisivel': 67, 'batem': 71, 'sistema2': 73, 'no_ar': 76, 'pessoas': 79, 'voltam': 80, 'planilha': 83,
    'gestao': 84, 'mergulhar': 88, 'primeiro': 89, 'mapeia': 92, 'quem': 95, 'impactado': 97, 'muda': 100, 'cada_um': 103,
    'onde': 104, 'resistencia': 107,
    'depois': 108, 'quebra': 109, 'partes': 113,
    'sentido': 115, 'porque': 117, 'voz': 119, 'lidera2': 122, 'pratica': 124, 'aprendendo': 127, 'real': 130,
    'medida': 133, 'uso': 135, 'semana': 138, 'semana2': 140,
    'pedaco': 141, 'pedaco2': 143, 'travava': 146, 'vira': 149, 'caminho': 150, 'adocao': 153, 'promessa': 157, 'rotina': 159,
    'isso': 160, 'gestao2': 162, 'alem': 165, 'raso': 167,
}
# capítulos do player (nome, cena em que começa)
CAPITULOS = [('A ponta', 'sala'), ('Abaixo da linha', 'mergulho'), ('Onde o projeto bate', 'choque'),
             ('Como a gente trabalha', 'mapear'), ('O gelo vira caminho', 'caminho')]


# ---------------- efeitos próprios deste filme ----------------
def passa_baixa(x, a):
    """Um polo. a pode ser número ou vetor (0..1: quanto menor, mais abafado)."""
    y = np.zeros(len(x))
    acc = 0.0
    av = a if hasattr(a, '__len__') else None
    for i in range(len(x)):
        k = av[i] if av is not None else a
        acc += k * (x[i] - acc)
        y[i] = acc
    return y


def mergulho(d=2.2, amp=0.2, seed=11):
    """Entrada na água: estouro curto de ruído e um corpo grave que vai abafando."""
    n = int(d * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(seed).standard_normal(n)
    corte = 0.5 * np.exp(-t * 3.2) + 0.012
    corpo = passa_baixa(r, corte) * np.exp(-t * 1.5) * 2.4
    estouro = np.diff(r, prepend=0) * np.exp(-t * 26) * 0.35
    grave = np.sin(2 * np.pi * (58 - 18 * t / d) * t) * np.exp(-t * 1.9) * 0.6
    return amp * (corpo + estouro + grave) * np.minimum(1, t / 0.01)


def bolhas(d=1.6, n=14, amp=0.05, seed=3):
    """Bolhas: pios curtos que sobem de tom, espalhados no tempo."""
    rg = np.random.default_rng(seed)
    buf = np.zeros(int(d * SR) + SR // 4)
    for _ in range(n):
        t0 = rg.uniform(0, d)
        dur = rg.uniform(0.035, 0.08)
        m = int(dur * SR)
        t = np.arange(m) / SR
        f0 = rg.uniform(380, 900)
        f = f0 * (1 + 1.3 * t / dur)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 2
        add(buf, x * amp * rg.uniform(0.4, 1), t0)
    return buf


def sonar(amp=0.11, f0=1244.5):
    """Pulso de sonar: nota limpa com cauda longa e dois ecos mais abafados."""
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    tom = (np.sin(2 * np.pi * f0 * t) + 0.22 * np.sin(2 * np.pi * f0 * 2 * t)) * np.exp(-t * 3.4) * np.minimum(1, t / 0.004)
    buf = np.zeros(n + SR)
    add(buf, tom, 0)
    add(buf, passa_baixa(tom, 0.25) * 0.42, 0.31)
    add(buf, passa_baixa(tom, 0.12) * 0.22, 0.62)
    return amp * buf


def rachadura(seed=1, amp=0.22, d=0.9):
    """Gelo que racha: estalos agudos que se aceleram, um baque grave e uma ressonância curta."""
    rg = np.random.default_rng(seed)
    n = int((d + 0.9) * SR)
    buf = np.zeros(n)
    t0, k = 0.0, 0
    while t0 < d:
        m = int(0.02 * SR)
        x = rg.standard_normal(m)
        x = np.diff(x, prepend=0) * np.exp(-np.arange(m) / SR * 420)
        add(buf, x * (0.5 + 0.5 * rg.random()) * (1.0 if k else 1.6), t0)
        t0 += rg.uniform(0.02, 0.16) * (1 - 0.6 * t0 / d)
        k += 1
    t = np.arange(int(0.9 * SR)) / SR
    baque = np.sin(2 * np.pi * (62 + 60 * np.exp(-t * 14)) * t) * np.exp(-t * 5.5) * 1.3
    add(buf, baque, 0.0)
    f = rg.uniform(2300, 3100)
    add(buf, np.sin(2 * np.pi * f * t) * np.exp(-t * 16) * 0.22, 0.03)
    return amp * buf


def batida(amp=0.3):
    """Casco de papel batendo no gelo: baque seco e um rangido curto."""
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(5).standard_normal(n)
    return amp * (np.sin(2 * np.pi * (74 + 90 * np.exp(-t * 22)) * t) * np.exp(-t * 7)
                  + passa_baixa(r, 0.08) * np.exp(-t * 9) * 1.4 + np.diff(r, prepend=0) * np.exp(-t * 34) * 0.18)


def ambiente(T, nivel):
    """Fundo do mar: ruído grave que respira devagar. nivel = vetor 0..1 por amostra."""
    n = int(T * SR)
    r = np.random.default_rng(21).standard_normal(n)
    x = passa_baixa(r, 0.006)
    x = x / (np.max(np.abs(x)) + 1e-9)
    t = np.arange(n) / SR
    resp = 0.75 + 0.25 * np.sin(2 * np.pi * t / 7.3) * np.sin(2 * np.pi * t / 3.1 + 1.2)
    return 0.06 * x * resp * nivel


# ---------------- música ----------------
def musica(T, c):
    """Trilha em Lá menor que abre em Dó maior quando o gelo vira caminho. 80 bpm, compasso de 3 s.
    Seções: sala (piano), mar (pad e sinos), choque (tensão), mapear (pulso leve), quebrar (baixo e arpejo), caminho (maior), fecho."""
    buf = np.zeros(int(T * SR) + 4 * SR)
    beat = 60 / 80
    comp = 4 * beat
    menor = [(57, 60, 64, 71), (53, 57, 60, 64), (48, 55, 64, 67), (55, 59, 62, 67)]   # Am9 Fmaj7 C G
    maior = [(48, 55, 64, 67), (55, 59, 62, 67), (57, 60, 64, 67), (53, 57, 60, 65)]   # C G Am F
    baixo_menor, baixo_maior = [33, 29, 36, 31], [36, 31, 33, 29]
    na_barra = lambda t: int(np.ceil(t / comp - 1e-6)) * comp
    t_mar, t_choque, t_map, t_queb, t_cam, t_fecho = (na_barra(c[k]) for k in ('mergulho', 'choque', 'mapear', 'quebrar', 'caminho', 'fecho'))
    t_mar = c['mergulho']            # o pad do mar entra junto com a câmera, fora da barra
    t, k = 0.0, 0
    while t < T + 0.5:
        sala = t < t_mar - 0.01
        mar = t_mar - 0.01 <= t < t_choque - 0.01
        tenso = t_choque - 0.01 <= t < t_map - 0.01
        mapa = t_map - 0.01 <= t < t_queb - 0.01
        quebra = t_queb - 0.01 <= t < t_cam - 0.01
        caminho = t_cam - 0.01 <= t < t_fecho - 0.01
        fim = t >= t_fecho - 0.01
        ac = (maior if caminho or fim else menor)[k % 4]
        bx = (baixo_maior if caminho or fim else baixo_menor)[k % 4]
        # pad: sempre, mais grave no mar
        for m in ac[:3]:
            add(buf, nota(mtof(m + (0 if mar or tenso else 12)), comp + 0.9, 'pad', 0.03 if mar or tenso else 0.024), t)
        if sala:
            seq = [ac[0] + 12, ac[2] + 12, ac[3] + 12, ac[1] + 12]
            for i in (0, 2):
                add(buf, nota(mtof(seq[i] + 12), 1.8, 'piano', 0.05), t + i * beat)
            add(buf, nota(mtof(seq[3] + 12), 1.4, 'piano', 0.032), t + 3 * beat)
        if mar or tenso:
            add(buf, nota(mtof(bx), comp + 0.6, 'pad', 0.05), t)                        # grave contínuo
            if mar:
                for i, m in ((0.5, ac[3] + 24), (2.5, ac[2] + 24)):                        # sinos esparsos com eco
                    for e, g in ((0, 1), (0.42, 0.42), (0.84, 0.2)):
                        add(buf, nota(mtof(m), 1.6, 'piano', 0.03 * g), t + i * beat + e)
            if tenso:
                add(buf, nota(mtof(ac[0] + 13), comp, 'pad', 0.012), t)                    # segunda menor: desconforto leve
        if mapa or quebra:
            add(buf, nota(mtof(bx + 12), comp, 'bass', 0.07 if quebra else 0.05), t)
            arp = [ac[0] + 24, ac[1] + 24, ac[2] + 24, ac[3] + 24, ac[2] + 24, ac[1] + 24, ac[0] + 24, ac[1] + 24]
            for i in range(8):
                if mapa and i % 2:
                    continue
                add(buf, nota(mtof(arp[i]), 0.34, 'pluck', 0.02 if mapa else 0.026), t + i * beat / 2)
            for i in range(4):
                tb = t + i * beat
                if quebra and i % 2 == 0:
                    add(buf, kick(0.13), tb)
                add(buf, hat(int(tb * 997), 0.009 if mapa else 0.014), tb + beat / 2)
        if caminho or fim:
            add(buf, nota(mtof(bx + 12), comp, 'bass', 0.08 if caminho else 0.05), t)
            arp = [ac[0] + 24, ac[2] + 24, ac[3] + 24, ac[1] + 36, ac[3] + 24, ac[2] + 24, ac[1] + 24, ac[2] + 24]
            for i in range(8):
                add(buf, nota(mtof(arp[i]), 0.4, 'pluck', 0.03 if caminho else 0.016), t + i * beat / 2)
            if caminho:
                for i in range(4):
                    tb = t + i * beat
                    add(buf, kick(0.12 if i % 2 == 0 else 0.07), tb)
                    add(buf, hat(int(tb * 991), 0.016), tb + beat / 2)
            else:
                mel = [ac[2] + 24, ac[3] + 24]
                for i, m in enumerate(mel):
                    add(buf, nota(mtof(m), 2.2, 'piano', 0.05), t + i * 2 * beat)
        t += comp
        k += 1
    return buf[:int(T * SR)]


def main():
    take = 'dani1'
    if '--take' in sys.argv:
        take = sys.argv[sys.argv.index('--take') + 1]
    pal = json.load(open(os.path.join(ROOT, f'audio/raso/{take}.words.json')))['words']
    pal = [w for w in pal if w['type'] == 'word' and not w['text'].startswith('[')]
    total_palavras = UNIDADES[-1][2] + 1
    assert len(pal) == total_palavras, f'esperava {total_palavras} palavras, veio {len(pal)}'
    voz = decode(os.path.join(ROOT, f'audio/raso/{take}.mp3'))
    dur_voz = len(voz) / SR
    # normaliza a voz: RMS dos trechos falados em -18 dBFS
    hop = SR // 50
    nfr = len(voz) // hop
    fr = np.sqrt(np.mean(voz[:nfr * hop].reshape(nfr, hop) ** 2, axis=1))
    falado = fr[fr > np.max(fr) * 0.08]
    voz *= 10 ** (-18 / 20) / max(1e-6, float(np.sqrt(np.mean(falado ** 2))))
    voz = np.tanh(voz * 1.1) / 1.1

    lim = [(a, b) for _, a, b in UNIDADES]
    cortes = []
    for k in range(len(lim) - 1):
        a = pal[lim[k][1]]['end'] - 0.04
        b = pal[lim[k + 1][0]]['start'] + 0.04
        q0, q1 = ponto_de_corte(voz, a, max(b, a + 0.05))
        cortes.append((min(q0 + 0.06, q1), max(q1 - 0.04, q0)))
    seg_ini = [max(0.0, pal[0]['start'] - 0.06)] + [c[1] for c in cortes]
    seg_fim = [c[0] for c in cortes] + [min(dur_voz, pal[-1]['end'] + 0.25)]
    fala = sum(b - a for a, b in zip(seg_ini, seg_fim))

    # ajuste fino dos respiros (menos os fixos) para fechar em ALVO, sem passar do TETO
    resp = list(RESPIRO)
    fixo = sum(r for i, r in enumerate(resp) if i in FIXOS)
    livre = sum(r for i, r in enumerate(resp) if i not in FIXOS)
    fator = (ALVO - fala - ABERTURA - FINAL - fixo) / livre
    resp = [r if i in FIXOS else float(np.clip(r * fator, 0.45, 2.4)) for i, r in enumerate(resp)]
    T = round(fala + ABERTURA + sum(resp) + FINAL, 2)
    assert T <= TETO, f'vídeo com {T:.1f} s passa do teto de {TETO} s: corte texto ou respiros'

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
            palavras.append({'w': w['text'], 'a': mapa(w['start'], k), 'b': mapa(w['end'], k), 'u': k})

    def wa(i):
        return palavras[i]['a']

    def wb(i):
        return palavras[i]['b']

    def m(nome):
        return wa(MARCAS[nome])

    def mb(nome):
        return wb(MARCAS[nome])

    cenas = {'sala': 0.0}
    for cid, i0, _ in UNIDADES:
        if cid and cid != 'sala':
            cenas[cid] = round(wa(i0) - ANTECIPA[cid], 3)
    cenas = {c: cenas[c] for c in ORDEM}
    marcas = {k: {'i': i, 'a': wa(i), 'b': wb(i)} for k, i in MARCAS.items()}

    # ---- eventos da imagem (o filme e a trilha leem os mesmos instantes) ----
    ev = {
        'luzes': 0.25,                                   # as luzes da sala se acendem
        'tela': 0.75,                                    # a tela da sala liga
        'travessia': round(cenas['mergulho'] + 1.25, 3),  # a câmera cruza a mesa e entra na água
        'recuo': round(mb('dagua') + 0.15, 3),            # a câmera se afasta e mostra o iceberg inteiro
        'batida': round(m('batem') + 0.12, 3),            # o barco de papel bate no gelo
        'no_ar': round(m('no_ar') + 0.05, 3),             # a bandeira "no ar" sobe
        'pulo': round(m('voltam') - 0.05, 3),             # as pessoas voltam para a planilha
        'descida': round(cenas['mapear'] + 0.25, 3),      # segundo mergulho: a sonda desce
        'pausa': round(mb('partes') + 0.4, 3),            # ponto em que o player do site para e pede um toque
        'racha1': round(m('sentido') + 0.18, 3),
        'racha2': round(m('pratica') + 0.18, 3),
        'racha3': round(m('medida') + 0.18, 3),
        'subida': round(cenas['caminho'] + 0.3, 3),       # os pedaços começam a subir
        'encaixe': round(m('vira') - 0.15, 3),            # os pedaços se alinham na superfície
        'travessia2': round(m('adocao') - 0.1, 3),        # as pessoas atravessam
        'chegada': round(m('rotina') + 0.1, 3),
        'assinatura': round(m('alem') - 0.1, 3),          # a frase final entra
        'final': round(mb('raso') + 0.35, 3),             # quadro final parado (tela de escolha no site)
    }

    # ---- mix ----
    n_total = int(T * SR)
    tt = np.arange(n_total) / SR
    mus = musica(T, cenas)
    vz = buf_voz[:n_total]
    n = n_total // hop
    env_v = np.sqrt(np.mean(vz[:n * hop].reshape(n, hop) ** 2, axis=1))
    duck = np.interp(np.arange(n_total), np.arange(n) * hop + hop / 2, np.where(env_v > 0.02, 0.36, 0.86))
    kk = int(0.18 * SR)
    duck = np.convolve(duck, np.ones(kk) / kk, mode='same')
    # debaixo d'água a música fica abafada: cruza a versão aberta com a filtrada
    fundo = np.clip((tt - ev['travessia']) / 0.8, 0, 1) * np.clip((ev['subida'] + 2.2 - tt) / 1.6, 0, 1)
    tona = np.clip(1 - np.abs(tt - (ev['batida'] + 1.2)) / 3.4, 0, 1) * 0.55      # no choque a câmera volta à superfície
    fundo = np.clip(fundo - tona, 0, 1)
    mus_abafada = passa_baixa(mus, 0.07) * 1.5
    mus = mus * (1 - 0.8 * fundo) + mus_abafada * 0.8 * fundo
    fade_out = np.clip((T - tt) / 2.4, 0, 1)
    fade_in = np.clip(tt / 0.8, 0, 1)
    buf = mus * duck * fade_out * fade_in
    recuo_fx = np.interp(np.arange(n_total), np.arange(n) * hop + hop / 2, np.where(env_v > 0.02, 0.42, 1.0))
    recuo_fx = np.convolve(recuo_fx, np.ones(kk // 2) / (kk // 2), mode='same')      # efeitos e ambiente recuam sob a voz
    buf += ambiente(T, fundo) * fade_out * recuo_fx
    buf_fx = np.zeros(n_total)

    sfx = []

    def fx(x, t, nome):
        add(buf_fx, x, t)
        sfx.append({'t': round(t, 3), 's': nome})

    # sala: luzes, tela e as três linhas do slide
    fx(tique(0.035), ev['luzes'], 'tique')
    fx(tique(0.03), ev['luzes'] + 0.16, 'tique')
    fx(pop(520, 0.04), ev['tela'], 'pop')
    for j, nome in enumerate(('prazo', 'sistema', 'treinamento')):
        fx(pop(700 + 90 * j, 0.05), m(nome) - 0.02, 'pop')
    fx(sino(0.035, 93), m('ponta') + 0.05, 'sino')
    # mergulho: travessia da linha d'água e recuo
    fx(whoosh(0.9, 0.04, seed=4), ev['travessia'] - 0.7, 'whoosh')
    fx(mergulho(2.2, 0.12), ev['travessia'] - 0.05, 'mergulho')
    fx(bolhas(1.8, 16, 0.035, seed=3), ev['travessia'] + 0.1, 'bolhas')
    fx(whoosh(1.5, 0.045, seed=8), ev['recuo'] - 0.1, 'whoosh')
    fx(impacto(0.06), ev['recuo'] + 1.05, 'impacto')
    # fatores: cada um acende com uma nota mais grave
    for j, nome in enumerate(('entende', 'acredita', 'medo', 'habitos', 'confianca')):
        fx(sonar(0.045, mtof(88 - 3 * j)), m(nome) - 0.04, 'sonar')
    # choque
    fx(whoosh(0.7, 0.045, seed=6), cenas['choque'] - 0.1, 'whoosh')
    fx(batida(0.3), ev['batida'], 'batida')
    fx(impacto(0.1), ev['batida'], 'impacto')
    fx(pop(880, 0.05), ev['no_ar'], 'pop')
    fx(pop(1175, 0.05), ev['no_ar'] + 0.12, 'pop')
    for j in range(5):
        fx(pop(640 - 55 * j, 0.045), ev['pulo'] + 0.16 * j, 'pop')
    # mapear: segundo mergulho e os pulsos do sonar
    fx(mergulho(1.6, 0.1, seed=17), ev['descida'], 'mergulho')
    fx(bolhas(1.2, 9, 0.035, seed=9), ev['descida'] + 0.1, 'bolhas')
    for j, nome in enumerate(('mapeia', 'quem', 'muda', 'onde')):
        fx(sonar(0.1 if j == 0 else 0.075, mtof(87 if j < 3 else 82)), m(nome) - 0.05, 'sonar')
    # quebrar
    fx(riser(1.3, 0.035, 7), m('quebra') - 0.2, 'riser')
    for j, nome in enumerate(('racha1', 'racha2', 'racha3')):
        fx(rachadura(seed=31 + j, amp=0.15 + 0.02 * j), ev[nome], 'rachadura')
        fx(impacto(0.07), ev[nome], 'impacto')
        fx(bolhas(1.0, 7, 0.025, seed=40 + j), ev[nome] + 0.15, 'bolhas')
    # caminho: os pedaços sobem e se encaixam em escala ascendente
    fx(whoosh(1.6, 0.05, seed=12), ev['subida'], 'whoosh')
    fx(bolhas(2.2, 18, 0.035, seed=14), ev['subida'] + 0.1, 'bolhas')
    escala = [72, 74, 76, 79, 81, 84, 86, 88]
    for j, nota_m in enumerate(escala):
        fx(pop(mtof(nota_m), 0.07), ev['encaixe'] + 0.11 * j, 'encaixe')
    for j in range(6):
        fx(pop(mtof(84 + (j % 3) * 2), 0.03), ev['travessia2'] + 0.22 * j, 'pop')
    fx(sino(0.07, 84), ev['chegada'], 'sino')
    # fecho
    fx(sino(0.06, 79), ev['assinatura'], 'sino')
    fx(sino(0.08, 84), ev['final'], 'sino')

    buf += buf_fx * recuo_fx
    # conferência: quanto a voz fica acima do fundo (música, ambiente e efeitos) em cada unidade de fala, em dB
    fundo_mix = buf.copy()
    buf += vz
    sobra = []
    for k, (i0, i1) in enumerate(lim):
        a, b = int(wa(i0) * SR), int(wb(i1) * SR)
        rv = float(np.sqrt(np.mean(vz[a:b] ** 2)) + 1e-9)
        rf = float(np.sqrt(np.mean(fundo_mix[a:b] ** 2)) + 1e-9)
        sobra.append(round(20 * np.log10(rv / rf), 1))

    pico = np.max(np.abs(buf))
    buf *= 0.89 / pico
    os.makedirs(os.path.join(ROOT, 'build/raso'), exist_ok=True)
    encode_wav(buf, os.path.join(ROOT, 'build/raso/trilha.wav'))

    legendas = [{'de': a, 'ate': b, 'a': wa(a), 'b': wb(b), 'texto': ' '.join(palavras[i]['w'] for i in range(a, b + 1))} for a, b in LEGENDAS]
    capitulos = [{'nome': nome, 'cena': cid, 't': cenas[cid]} for nome, cid in CAPITULOS]
    out = {
        'duracao': T, 'take': take, 'cenas': cenas, 'ordem': ORDEM, 'palavras': palavras, 'marcas': marcas, 'eventos': ev,
        'unidades': [{'de': a, 'ate': b, 'a': wa(a), 'b': wb(b)} for a, b in lim], 'legendas': legendas,
        'capitulos': capitulos, 'sfx': sfx,
    }
    os.makedirs(os.path.join(ROOT, 'src/raso'), exist_ok=True)
    with open(os.path.join(ROOT, 'src/raso/tempos.json'), 'w') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print(f'{take}: fala {fala:.2f} s · total {T:.2f} s · respiros', [round(r, 2) for r in resp])
    print('cenas:', {k: round(v, 2) for k, v in cenas.items()})
    print('eventos:', {k: round(v, 2) for k, v in ev.items()})
    print('voz acima do fundo, por unidade de fala (dB):', [float(v) for v in sobra], '· mínimo', float(min(sobra)), 'dB')


if __name__ == '__main__':
    main()
