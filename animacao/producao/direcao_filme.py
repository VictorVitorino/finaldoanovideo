"""Direção dos personagens do filme, plano a plano: quem entra, onde fica, como pula, acena e reage.

Cada função de plano recebe o tempo absoluto t e devolve um Quadro (câmera + atores). Os papéis
com nome (antonialli, giovanna...) viram a foto indicada em producao/elenco_filme.json; sem foto
confirmada, viram uma silhueta com as iniciais. Mascotes e fotos (foto1..foto13) entram direto.
"""
import json
import math
import os
import random

import motor30 as M

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAO = 840
NOMES = {
    'antonialli': 'Guilherme Antonialli', 'bruno': 'Bruno Moraes', 'jose': 'José Aires', 'nara': 'Nara Martins',
    'marcos': 'Marcos Massao Iwata', 'thauany': 'Thauany Moreira', 'joao': 'João Lopes', 'mancini': 'Marcus Mancini',
    'jaqueline': 'Jaqueline Valdevino', 'giovanna': 'Giovanna Brandão', 'pedro': 'Pedro Lanzetta', 'monica': 'Monica Audrey',
    'vinicius': 'Vinicius de Sousa', 'paladini': 'Paladini', 'quintao': 'Fabio Quintão', 'sampaio': 'Sampaio',
}
CORES = {'antonialli': 'azul', 'bruno': 'teal', 'jose': 'verde', 'nara': 'rosa', 'marcos': 'lilas', 'thauany': 'amarelo', 'joao': 'verde',
         'mancini': 'azul', 'jaqueline': 'pessego', 'giovanna': 'rosa', 'pedro': 'teal', 'monica': 'lilas', 'vinicius': 'amarelo',
         'paladini': 'pessego', 'quintao': 'teal', 'sampaio': 'amarelo'}
MASC = ['modulo', 'cronos', 'cuidado', 'frasco', 'acelerado', 'campo', 'conectado', 'obrinha']
FOTOS = [f'foto{i}' for i in range(1, 14)]

TL = None
ELENCO = {}
MARCAS_SPR = {}


def carregar(tl):
    global TL
    TL = tl
    e = json.load(open(os.path.join(ROOT, 'producao', 'elenco_filme.json')))
    inv = {v: k for k, v in NOMES.items()}
    for nome, foto in e.items():
        if nome in inv and foto:
            ELENCO[inv[nome]] = foto


def sprite_de(papel):
    """Papel → (id do sprite, rótulo). Silhueta quando o nome ainda não tem foto confirmada."""
    if papel in NOMES:
        foto = ELENCO.get(papel)
        return (foto, NOMES[papel]) if foto else ('silhueta', NOMES[papel])
    return papel, None


def idle(i, t):
    r = random.Random(i)
    ph = r.uniform(0, 6.28)
    resp = math.sin(2 * math.pi * t / r.uniform(3.0, 3.8) + ph)
    cab = 2.0 * math.sin(2 * math.pi * r.uniform(0.22, 0.32) * t + ph) + 0.7 * math.sin(2 * math.pi * r.uniform(0.5, 0.7) * t + 2 * ph)
    t0, per = r.uniform(0.4, 2.2), r.uniform(2.8, 4.4)
    n = math.floor((t - t0) / per)
    pk = max(M.piscada(t, t0 + n * per), M.piscada(t, t0 + (n + 1) * per)) if t > t0 else 0.0
    return {'sx': 1 - 0.006 * resp, 'sy': 1 + 0.012 * resp, 'cabeca': cab, 'piscar': pk, 'dy': 0.0, 'rot': 0.0}


def junta(st, dy=0.0, sx=1.0, sy=1.0, rot=0.0):
    st.update(dy=st['dy'] + dy, sx=st['sx'] * sx, sy=st['sy'] * sy, rot=st['rot'] + rot)
    return st


class Quadro:
    def __init__(self, plano, cam=(960, 540, 1.0)):
        self.plano, self.cam = plano, cam
        self.atores = []

    def tela(self, x, y):
        cx, cy, z = self.cam
        return (x - cx) * z + 960, (y - cy) * z + 540

    def ator(self, papel, x, y, alt, st, blob=None, painel=None, **extra):
        spr, rotulo = sprite_de(papel)
        m = MARCAS_SPR.get(spr)
        if m is None:
            return
        z = self.cam[2]
        sx_, sy_ = self.tela(x, y)
        k = alt * z / (m['pes_y'] - m['topo'][1])
        dy = st.get('dy', 0.0) * z
        topo = (sx_ + (m['topo'][0] - m['centro_x']) * k, sy_ + dy + (m['topo'][1] - m['pes_y']) * k * st.get('sy', 1.0))
        a = {'papel': papel, 'spr': spr, 'x': round(sx_, 2), 'y': round(sy_ + dy, 2), 'chao': round(sy_, 2), 'k': round(k, 5),
             'topo': [round(topo[0], 1), round(topo[1], 1)], 'alt': round(alt * z, 1),
             'st': {c: round(v, 4) for c, v in st.items() if c in ('sx', 'sy', 'rot', 'cabeca', 'piscar', 'braco')}}
        if rotulo:
            a['rotulo'] = rotulo
        if blob:
            a['blob'] = blob
        if painel:
            a['painel'] = painel  # recorte retangular (split-screen): [x0, y0, x1, y1]
        a.update(extra)
        self.atores.append(a)

    def dict(self):
        return {'plano': self.plano['id'], 'cam': [round(v, 3) for v in self.cam], 'atores': self.atores}


# ---------------------------------------------------------------- ajudantes de movimento
def chega_pulando(papel, t, t0, xa, xb, dur=0.9):
    x, dy, sx, sy, rot = M.caminhada_pulos(t, t0, t0 + dur, xa, xb, passo=0.27, altura=28)
    return x, junta(idle(papel, t), dy, sx, sy, rot)


def cai(papel, t, t0, altura=560):
    e = M.entrada_queda(t, t0, altura=altura)
    if e is None:
        return None
    return junta(idle(papel, t), *e)


def aceno(st, m_braco, t, t0, amp=9.0):
    if m_braco and t > t0:
        v = t - t0
        st['braco'] = amp * math.sin(2 * math.pi * 1.5 * v) * math.exp(-v * 0.6)
    return st


def push(p, t, z0=1.0, z1=1.05, cy=540, cx=960):
    u = M.ease_io((t - p['de']) / (p['ate'] - p['de']))
    return (cx, cy, z0 + (z1 - z0) * u)


def fila(n, x0, x1):
    return [x0 + (x1 - x0) * (k + 0.5) / n for k in range(n)]


def braco(papel):
    return (MARCAS_SPR.get(sprite_de(papel)[0]) or {}).get('braco')


# ---------------------------------------------------------------- planos
def p_2a(p, t):
    mk = p['marcas']
    q = Quadro(p, push(p, t, 1.0, 1.04))
    for i, t0, xa, xb, cor in (('modulo', mk['modulo'], -280, 600, 'teal'), ('cronos', mk['cronos'], 2200, 1320, 'azul')):
        if t < t0:
            continue
        x, st = chega_pulando(i, t, t0, xa, xb)
        junta(st, *M.pulo(t, mk['encontro'] + (0.0 if i == 'modulo' else 0.1), 0.42, 80))
        aceno(st, braco(i), t, t0 + 0.9)
        q.ator(i, x, CHAO, 440, st, blob={'cor': cor, 'r': 280})
    return q


def time13(q, t, t_in, y_tras=760, y_frente=880, alt_t=250, alt_f=290, x0=200, x1=1720, pulos=()):
    """Os 13 do time em duas fileiras; com o elenco confirmado, o Antonialli fica no centro da frente."""
    ordem = list(FOTOS)
    if ELENCO.get('antonialli') in ordem:
        ordem.remove(ELENCO['antonialli'])
        ordem.insert(9, ELENCO['antonialli'])  # meio da fileira da frente
    tras, frente = ordem[:7], ordem[7:]
    for fil, ys, alt, xs in ((tras, y_tras, alt_t, fila(7, x0, x1)), (frente, y_frente, alt_f, fila(6, x0 + 60, x1 - 60))):
        for n, i in enumerate(fil):
            st = cai(i, t, t_in + 0.09 * (FOTOS.index(i)), 520)
            if st is None:
                continue
            for k, tp in enumerate(pulos):
                junta(st, *M.pulo(t, tp + 0.04 * n + 0.02 * k, 0.36, 40))
            q.ator(i, xs[n], ys, alt, st)


def p_2b(p, t):
    mk = p['marcas']
    q = Quadro(p, push(p, t, 1.0, 1.05, cy=560))
    time13(q, t, p['de'] + 0.35, pulos=(mk['fazedora'], mk['adaptavel'], mk['jogo']))
    return q


def p_2e(p, t):
    q = Quadro(p, push(p, t, 1.0, 1.04))
    st = cai('cuidado', t, p['de'] + 0.25)
    if st:
        aceno(st, braco('cuidado'), t, p['de'] + 0.7)
        q.ator('cuidado', 1180, CHAO, 440, st, blob={'cor': 'verde', 'r': 280})
    return q


def p_projeto(p, t):
    pj = TL['projetos'][p['projeto']]
    q = Quadro(p, push(p, t, 1.0, 1.03))
    st = cai(pj['mascote'], t, p['de'] + 0.3)
    if st:
        aceno(st, braco(pj['mascote']), t, p['de'] + 0.8)
        q.ator(pj['mascote'], 880, CHAO, 400, st, blob={'cor': CORES.get(pj['time'][0], 'teal'), 'r': 250})
    xs = {1: [560], 2: [420, 640], 3: [300, 480, 660]}[len(pj['time'])]
    for n, papel in enumerate(pj['time']):
        t0 = p['de'] + 0.55 + 0.18 * n
        if t < t0:
            continue
        x, st = chega_pulando(papel, t, t0, -200 - 150 * n, xs[n], 0.85)
        q.ator(papel, x, CHAO, 330, st, nome=True)
    return q


def p_3h(p, t):
    q = Quadro(p)
    for n, (i, x) in enumerate(zip(FOTOS, fila(13, 140, 1780))):
        st = cai(i, t, p['de'] + 2.6 + 0.06 * n, 400)
        if st:
            q.ator(i, x, 960, 190, st)
    return q


def p_4s1(p, t):
    q = Quadro(p)
    for i, x, cor in (('modulo', 210, 'teal'), ('cronos', 1710, 'azul')):
        st = cai(i, t, p['de'] + 0.5 + (0.15 if i == 'cronos' else 0), 450)
        if st:
            q.ator(i, x, 960, 300, st, blob={'cor': cor, 'r': 190})
    return q


def p_4f(p, t):
    q = Quadro(p, push(p, t, 1.0, 1.03))
    x, st = chega_pulando('vinicius', t, p['de'] + 0.1, -200, 330, 0.8)
    q.ator('vinicius', x, CHAO + 40, 380, st, nome=True, blob={'cor': 'amarelo', 'r': 240})
    return q


def p_5a(p, t):
    q = Quadro(p)
    tn = p['marcas']['numero']
    for i, x, cor in (('modulo', 250, 'teal'), ('cronos', 1670, 'azul')):
        st = cai(i, t, p['de'] + 0.2 + (0.12 if i == 'cronos' else 0), 450)
        if st:
            junta(st, *M.pulo(t, tn + 1.6 + (0.1 if i == 'cronos' else 0), 0.42, 80))
            q.ator(i, x, CHAO + 40, 360, st, blob={'cor': cor, 'r': 230})
    return q


def p_5c(p, t):
    q = Quadro(p)
    cl = ['cuidado', 'frasco', 'acelerado', 'campo', 'conectado', 'obrinha']
    for n, (i, x) in enumerate(zip(cl, fila(6, 70, 900))):
        st = cai(i, t, p['de'] + 0.3 + 0.08 * n, 450)
        if st:
            q.ator(i, x, CHAO + 30, 250, st)
    for n, (i, x) in enumerate((('modulo', 1260), ('cronos', 1560))):
        st = cai(i, t, p['marcas']['cresce'] + 0.1 * n, 450)
        if st:
            junta(st, *M.pulo(t, p['marcas']['cresce'] + 0.9 + 0.1 * n, 0.4, 60))
            q.ator(i, x, CHAO + 30, 330, st)
    return q


def p_5e(p, t):
    """Giovanna atravessa o escritório depressa, celular na mão."""
    q = Quadro(p)
    x, dy, sx, sy, rot = M.caminhada_pulos(t, p['de'] + 0.05, p['ate'] - 0.25, 2150, 1180, passo=0.19, altura=22)
    st = junta(idle('giovanna', t), dy, sx, sy, rot * 1.4)
    q.ator('giovanna', x, CHAO, 380, st, nome=True, celular=True, blob={'cor': 'rosa', 'r': 240})
    return q


def p_5f(p, t):
    """Paladini olha assustada."""
    q = Quadro(p, push(p, t, 1.05, 1.12, cy=500))
    st = junta(idle('paladini', t), *M.pulo(t, p['de'] + 0.15, 0.3, 70))
    st['cabeca'] += M.mola(t - p['de'] - 0.15, 6, 14, 5)
    q.ator('paladini', 760, CHAO, 420, st, nome=True, reacao='!', blob={'cor': 'pessego', 'r': 260})
    x = 1350
    q.ator('giovanna', x, CHAO, 400, idle('giovanna', t), nome=True, celular=True, blob={'cor': 'rosa', 'r': 250})
    return q


def p_5g(p, t):
    """Pagou. → risco de disco → os três felizes em close."""
    q = Quadro(p)
    ts = p['marcas']['scratch']
    if t < ts:
        q.ator('paladini', 760, CHAO, 420, idle('paladini', t), nome=True, blob={'cor': 'pessego', 'r': 260})
        q.ator('giovanna', 1350, CHAO, 400, idle('giovanna', t), nome=True, celular=True, blob={'cor': 'rosa', 'r': 250})
        return q
    q.cam = (960, 540, 1.04)
    for n, (i, x) in enumerate((('quintao', 460), ('antonialli', 960), ('sampaio', 1460))):
        st = cai(i, t, ts + 0.15 + 0.12 * n, 300)
        if st:
            junta(st, *M.pulo(t, ts + 0.9 + 0.12 * n, 0.4, 50))
            q.ator(i, x, 930, 470, st, nome=True, blob={'cor': CORES[i], 'r': 280})
    return q


def p_5h(p, t):
    q = Quadro(p, push(p, t, 1.0, 1.06, cy=520))
    st = idle('antonialli', t)
    q.ator('antonialli', 760, CHAO + 30, 470, st, nome=True, blob={'cor': 'azul', 'r': 300})
    return q


def p_5i(p, t):
    """Telefonema em tela dividida e a comemoração dos dois."""
    q = Quadro(p)
    tc = p['marcas']['comemora']
    for i, x, pain in (('giovanna', 520, [0, 0, 960, 1080]), ('bruno', 1400, [960, 0, 1920, 1080])):
        st = idle(i, t)
        if t > tc:
            for k in range(3):
                junta(st, *M.pulo(t, tc + 0.05 + 0.55 * k + (0.12 if i == 'bruno' else 0), 0.4, 70))
        q.ator(i, x, CHAO + 20, 430, st, nome=True, celular=t < tc, painel=pain if t < tc else None)
    return q


def p_5j(p, t):
    q = Quadro(p, push(p, t, 1.0, 1.08, cy=560))
    st = idle('antonialli', t)
    tc = p['marcas']['cabelo']
    if t > tc - 0.4:  # ajeita o cabelo: cabeça inclina, assenta
        st['cabeca'] += 6 * M.ease((t - tc + 0.4) / 0.3) - 6 * M.ease((t - tc - 0.5) / 0.4)
    q.ator('antonialli', 960, CHAO + 40, 480, st, nome=True, brilho=tc, blob={'cor': 'azul', 'r': 300})
    return q


def p_6a(p, t):
    q = Quadro(p)
    cl = ['cuidado', 'frasco', 'acelerado', 'campo', 'conectado', 'obrinha']
    for n, (i, x) in enumerate(zip(cl, fila(6, 120, 1800))):
        st = cai(i, t, p['marcas']['logos'][n] - 0.15, 450)
        if st:
            aceno(st, braco(i), t, p['marcas']['logos'][n] + 0.3)
            q.ator(i, x, CHAO, 330, st, logo=True)
    return q


def p_6c(p, t):
    q = Quadro(p, push(p, t, 1.0, 1.08, cy=520, cx=900))
    q.ator('antonialli', 560, CHAO + 40, 500, idle('antonialli', t), nome=True, blob={'cor': 'azul', 'r': 320})
    return q


def p_6d(p, t):
    q = Quadro(p, push(p, t, 1.06, 1.0, cy=560))
    time13(q, t, p['de'] + 0.2, y_tras=770, y_frente=900, alt_t=240, alt_f=280, x0=300, x1=1620,
           pulos=(p['marcas']['frase'],))
    for i, x in (('modulo', 150), ('cronos', 1770)):
        st = cai(i, t, p['de'] + 1.2 + (0.1 if i == 'cronos' else 0), 450)
        if st:
            q.ator(i, x, 900, 300, st, logo=True)
    return q


def p_6e(p, t):
    q = Quadro(p)
    time13(q, t, p['de'] - 10, y_tras=900, y_frente=990, alt_t=190, alt_f=215, x0=260, x1=1660)
    return q


def p_6f(p, t):
    q = Quadro(p)
    tc = p['marcas']['corte']
    if t < tc:
        x, st = chega_pulando('giovanna', t, p['de'] + 0.1, 2150, 1300, 0.7)
        q.ator('giovanna', x, CHAO, 400, st, nome=True)
    else:
        q.cam = (960, 470, 1.25)
        st = idle('antonialli', t)
        st['cabeca'] += 6 * M.ease((t - tc - 0.2) / 0.3) - 6 * M.ease((t - tc - 1.0) / 0.4)
        q.ator('antonialli', 960, CHAO + 60, 480, st, nome=True, brilho=tc + 0.45)
    return q


PLANOS = {'2a': p_2a, '2b': p_2b, '2e': p_2e, '3h': p_3h, '4s1': p_4s1, '4f': p_4f, '5a': p_5a, '5c': p_5c,
          '5e': p_5e, '5f': p_5f, '5g': p_5g, '5h': p_5h, '5i': p_5i, '5j': p_5j, '6a': p_6a, '6c': p_6c, '6d': p_6d,
          '6e': p_6e, '6f': p_6f}
for _k in range(1, 7):
    PLANOS[f'3p{_k}'] = p_projeto


def quadro(t):
    p = next((x for x in TL['planos'] if x['de'] <= t < x['ate']), TL['planos'][-1])
    fn = PLANOS.get(p['id'])
    q = fn(p, t) if fn else Quadro(p)
    return q.dict()
