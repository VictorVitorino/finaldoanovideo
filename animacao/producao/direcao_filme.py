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
    'vinicius': 'Vinicius de Sousa', 'paladini': 'Nathalia Paladini', 'quintao': 'Fabio Quintão', 'sampaio': 'Sampaio',
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
def ajeita(st, t, tc):
    """Piada recorrente: Antonialli ajeita o cabelo (a cabeça inclina e assenta; a mão e o "ting" vêm da camada de textos)."""
    if tc is not None and t > tc - 0.3:
        st['cabeca'] += 5 * M.ease((t - tc + 0.3) / 0.3) - 5 * M.ease((t - tc - 0.8) / 0.4)
    return st


def p_3a(p, t):
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
    """Os 13 do time: o Antonialli na frente de todos, como líder; os outros 12 em duas fileiras atrás."""
    lider = ELENCO.get('antonialli')
    ordem = [f for f in FOTOS if f != lider]
    tras, frente = ordem[:6], ordem[6:]
    for fil, ys, alt, xs in ((tras, y_tras, alt_t, fila(6, x0, x1)), (frente, y_frente, alt_f, fila(6, x0 + 40, x1 - 40))):
        for n, i in enumerate(fil):
            st = cai(i, t, t_in + 0.09 * (FOTOS.index(i)), 520)
            if st is None:
                continue
            for k, tp in enumerate(pulos):
                junta(st, *M.pulo(t, tp + 0.04 * n + 0.02 * k, 0.36, 40))
            q.ator(i, xs[n], ys, alt, st)
    if lider:
        st = cai('antonialli', t, t_in + 1.25, 600)
        if st:
            for k, tp in enumerate(pulos):
                junta(st, *M.pulo(t, tp + 0.1, 0.36, 30))
            q.ator('antonialli', (x0 + x1) / 2, y_frente + 70, alt_f * 1.18, st, lider=True)


def p_3b(p, t):
    mk = p['marcas']
    q = Quadro(p, push(p, t, 1.0, 1.05, cy=560))
    time13(q, t, p['de'] + 0.35, pulos=(mk['fazedora'], mk['adaptavel'], mk['jogo']))
    return q


def p_2e(p, t):
    """GO-LIVE ADIADO com humor físico: Bruno pula no botão, a data foge, o computador fumega e ele tenta
    segurá-lo; Antonialli entra desesperado e, claro, ajeita o cabelo."""
    mk = p['marcas']
    q = Quadro(p)
    r = random.Random(int(t * 30))
    # Bruno: chega pulando, salta para cima do botão (os pés ficam no topo do pedestal), depois corre para o monitor
    if t >= mk['bruno']:
        if t < mk['aperta'] - 0.42:
            x, st = chega_pulando('bruno', t, mk['bruno'], -200, 470, 0.7)
            y = CHAO
        elif t < mk['segura']:
            u = M.ease_io((t - (mk['aperta'] - 0.42)) / 0.42)
            x = 470 + (640 - 470) * u
            y = CHAO - 150 * M.ease_out(u)
            st = idle('bruno', t)
            arco = -90 * math.sin(math.pi * min(1.0, u))
            junta(st, arco, 1 - 0.05 * math.sin(math.pi * u), 1 + 0.08 * math.sin(math.pi * u))
            if t >= mk['aperta']:  # aterrissa amassando o botão
                sq = M.mola(t - mk['aperta'], 0.18, 20, 8)
                junta(st, 0, 1 + sq * 0.8, 1 - sq)
            if t >= mk['foge']:
                st['cabeca'] += 8 * M.ease((t - mk['foge']) / 0.2)
        else:
            u = M.ease_io((t - mk['segura']) / 0.45)
            x = 640 + (1060 - 640) * u
            y = CHAO - 150 * (1 - M.ease_out(min(1.0, u * 1.6)))
            st = idle('bruno', t)
            if u >= 1:  # segura o monitor que treme
                st['rot'] += r.uniform(-2.2, 2.2)
                st['dy'] += r.uniform(-3, 3)
                st['cabeca'] += r.uniform(-2, 2)
        extra = {'reacao': '!'} if mk['foge'] < t < mk['segura'] + 0.9 else {}
        if t > mk['segura'] + 0.5:
            extra['suor'] = mk['segura'] + 0.5
        q.ator('bruno', x, y, 330, st, nome=True, **extra)
    # Antonialli: entra pela direita em pânico, depois se recompõe ajeitando o cabelo
    if t >= mk['antonialli']:
        x, st = chega_pulando('antonialli', t, mk['antonialli'], 2150, 1580, 0.6)
        if t < mk['cabelo'] - 0.3:
            st['rot'] += r.uniform(-1.4, 1.4)
            st['dy'] += r.uniform(-2, 2)
            st['cabeca'] += -4 + r.uniform(-1.2, 1.2)
            q.ator('antonialli', x, CHAO, 420, st, nome=True, desespero=mk['antonialli'] + 0.6)
        else:
            ajeita(st, t, mk['cabelo'])
            q.ator('antonialli', x, CHAO, 420, st, nome=True, cabelo=mk['cabelo'])
    return q


def p_3fase(p, t):
    """Capa da parceria: o Módulo cai de pé, pose de bad boy, e os óculos escuros descem."""
    q = Quadro(p)
    st = cai('modulo', t, p['marcas']['modulo'], 700)
    if st:
        st['cabeca'] = 3.5 * M.ease((t - p['marcas']['oculos'] - 0.2) / 0.4) + 1.2 * math.sin(2 * math.pi * 0.7 * t)
        st['rot'] -= 3.0
        st['braco'] = 0.0
        q.ator('modulo', 1600, 950, 580, st, oculos=p['marcas']['oculos'], blob={'cor': 'azul', 'r': 320})
    return q


def p_projeto(p, t):
    pj = TL['projetos'][p['projeto']]
    q = Quadro(p, push(p, t, 1.0, 1.03))
    st = cai(pj['mascote'], t, p['de'] + 0.3)
    if st:
        aceno(st, braco(pj['mascote']), t, p['de'] + 0.8)
        q.ator(pj['mascote'], 1130 if len(pj['time']) < 3 else 1180, CHAO, 400, st, blob={'cor': CORES.get(pj['time'][0], 'teal'), 'r': 250})
    xs = {1: [800], 2: [700, 890], 3: [600, 790, 980]}[len(pj['time'])]
    for n, papel in enumerate(pj['time']):
        t0 = p['de'] + 0.55 + 0.18 * n
        if t < t0:
            continue
        x, st = chega_pulando(papel, t, t0, -200 - 150 * n, xs[n], 0.85)
        q.ator(papel, x, CHAO, 330, st, nome=True)
    return q


def p_4h(p, t):
    q = Quadro(p)
    for n, (i, x) in enumerate(zip(FOTOS, fila(13, 140, 1780))):
        st = cai(i, t, p['marcas']['time'] + 0.06 * n, 400)
        if st:
            q.ator(i, x, 985, 190, st)
    return q


def p_5s1(p, t):
    q = Quadro(p)
    for i, x, cor in (('modulo', 210, 'teal'), ('cronos', 1710, 'azul')):
        st = cai(i, t, p['de'] + 0.5 + (0.15 if i == 'cronos' else 0), 450)
        if st:
            q.ator(i, x, 960, 300, st, blob={'cor': cor, 'r': 190})
    return q


def p_5s5(p, t):
    """Um time só: os dois mascotes chegam aos pulinhos quando a narração os chama."""
    mk = p['marcas']
    q = Quadro(p)
    for i, t0, xa, xb, cor in (('modulo', mk['totvs'] - 0.6, -200, 300, 'teal'), ('cronos', mk['am'] - 0.6, 2100, 1620, 'azul')):
        if t < t0:
            continue
        x, st = chega_pulando(i, t, t0, xa, xb, 0.7)
        junta(st, *M.pulo(t, mk['time'], 0.4, 60))
        q.ator(i, x, 960, 320, st, blob={'cor': cor, 'r': 200})
    return q


def p_5u(p, t):
    q = Quadro(p, push(p, t, 1.0, 1.03))
    x, st = chega_pulando('vinicius', t, p['de'] + 0.1, -200, 330, 0.8)
    q.ator('vinicius', x, CHAO + 40, 380, st, nome=True, blob={'cor': 'amarelo', 'r': 240})
    return q


def p_6a(p, t):
    q = Quadro(p)
    tn = p['marcas']['numero']
    for i, x, cor in (('modulo', 250, 'teal'), ('cronos', 1670, 'azul')):
        st = cai(i, t, p['de'] + 0.2 + (0.12 if i == 'cronos' else 0), 450)
        if st:
            junta(st, *M.pulo(t, tn + 1.6 + (0.1 if i == 'cronos' else 0), 0.42, 80))
            q.ator(i, x, CHAO + 40, 360, st, blob={'cor': cor, 'r': 230})
    return q


def p_6c(p, t):
    """Longo prazo, valor, crescimento e portas: os mascotes dos clientes à esquerda; Módulo e Cronos comemoram."""
    q = Quadro(p)
    mk = p['marcas']
    cl = ['cuidado', 'frasco', 'acelerado', 'campo', 'conectado', 'obrinha']
    for n, (i, x) in enumerate(zip(cl, fila(6, 70, 900))):
        st = cai(i, t, mk['valor'] + 0.08 * n, 450)
        if st:
            q.ator(i, x, CHAO + 30, 250, st)
    for n, (i, x) in enumerate((('modulo', 1040), ('cronos', 1220))):
        st = cai(i, t, mk['cresce'] + 0.1 * n, 450)
        if st:
            junta(st, *M.pulo(t, mk['cresce'] + 0.9 + 0.1 * n, 0.4, 60))
            q.ator(i, x, CHAO + 30, 330, st)
    return q


def p_6e(p, t):
    """Giovanna atravessa o escritório depressa, celular na mão."""
    q = Quadro(p)
    x, dy, sx, sy, rot = M.caminhada_pulos(t, p['de'] + 0.05, p['ate'] - 0.25, 2150, 1180, passo=0.19, altura=22)
    st = junta(idle('giovanna', t), dy, sx, sy, rot * 1.4)
    q.ator('giovanna', x, CHAO, 380, st, nome=True, celular=True, blob={'cor': 'rosa', 'r': 240})
    return q


def p_6f(p, t):
    """Nathalia Paladini olha assustada."""
    q = Quadro(p, push(p, t, 1.05, 1.12, cy=500))
    st = junta(idle('paladini', t), *M.pulo(t, p['de'] + 0.15, 0.3, 70))
    st['cabeca'] += M.mola(t - p['de'] - 0.15, 6, 14, 5)
    q.ator('paladini', 760, CHAO, 470, st, nome=True, reacao='!', blob={'cor': 'pessego', 'r': 260})
    q.ator('giovanna', 1350, CHAO, 400, idle('giovanna', t), nome=True, celular=True, blob={'cor': 'rosa', 'r': 250})
    return q


def p_6g(p, t):
    """Pagou. → risco de disco → os donos do dinheiro e o Antonialli, felizes."""
    q = Quadro(p)
    ts = p['marcas']['scratch']
    if t < ts:
        q.ator('paladini', 760, CHAO, 470, idle('paladini', t), nome=True, blob={'cor': 'pessego', 'r': 260})
        q.ator('giovanna', 1350, CHAO, 400, idle('giovanna', t), nome=True, celular=True, blob={'cor': 'rosa', 'r': 250})
        return q
    q.cam = (960, 540, 1.04)
    for n, (i, x, alt) in enumerate((('quintao', 450, 560), ('antonialli', 960, 470), ('sampaio', 1470, 560))):
        st = cai(i, t, ts + 0.15 + 0.12 * n, 300)
        if st:
            junta(st, *M.pulo(t, ts + 0.9 + 0.12 * n, 0.4, 50))
            q.ator(i, x, 950, alt, st, nome=True, donos=i != 'antonialli', blob={'cor': CORES[i], 'r': 280})
    return q


def p_6h(p, t):
    """A ordem: Antonialli ajeita o cabelo enquanto fala; Giovanna recebe o envelope da missão."""
    mk = p['marcas']
    q = Quadro(p, push(p, t, 1.0, 1.05, cy=520))
    st = ajeita(idle('antonialli', t), t, mk['cabelo'])
    q.ator('antonialli', 560, CHAO + 20, 460, st, nome=True, cabelo=mk['cabelo'], blob={'cor': 'azul', 'r': 290})
    st = idle('giovanna', t)
    if t > mk['destroi']:  # o envelope explode em fumaça: ela se assusta
        junta(st, *M.pulo(t, mk['destroi'] + 0.05, 0.3, 50))
        st['cabeca'] += M.mola(t - mk['destroi'], 5, 14, 5)
    q.ator('giovanna', 1420, CHAO + 20, 400, st, nome=True, reacao='!' if t > mk['destroi'] else None, blob={'cor': 'rosa', 'r': 250})
    return q


def p_6i(p, t):
    """Bruno surge como agente especial: cai de pé no foco de luz e os óculos escuros descem."""
    mk = p['marcas']
    q = Quadro(p, push(p, t, 1.0, 1.06, cy=520))
    st = cai('bruno', t, mk['bruno'], 700)
    if st:
        st['rot'] -= 2.0
        st['cabeca'] += 3 * M.ease((t - mk['oculos'] - 0.2) / 0.4)
        q.ator('bruno', 960, CHAO + 30, 520, st, nome=True, oculos=mk['oculos'], agente=mk['chip'], blob={'cor': 'teal', 'r': 310})
    return q


def p_6j(p, t):
    """O rapel: Bruno desce pelo cabo até o cofre das NFs, uma gota de suor cai e dispara o alarme."""
    mk = p['marcas']
    q = Quadro(p)
    u = M.ease_io((t - mk['desce']) / (mk['alcanca'] - mk['desce']))
    y = -260 + (CHAO - 450 + 260) * u
    st = idle('bruno', t)
    st['rot'] += 14 + 3 * math.sin(2 * math.pi * 0.5 * t)
    st['cabeca'] += 6 * M.ease((t - mk['alcanca']) / 0.4)
    if t > mk['alarme']:
        r = random.Random(int(t * 30))
        st['rot'] += r.uniform(-3, 3)
        st['dy'] += r.uniform(-4, 4)
    extra = {'reacao': '!'} if t > mk['alarme'] else {}
    q.ator('bruno', 960, y, 400, st, nome=True, pendurado=True, oculos=mk['desce'] - 9, **extra)
    return q


def p_6k(p, t):
    """Corte seco: Giovanna e Bruno ao telefone, em tela dividida."""
    q = Quadro(p)
    for i, x, pain in (('giovanna', 520, [0, 0, 960, 1080]), ('bruno', 1400, [960, 0, 1920, 1080])):
        q.ator(i, x, CHAO + 20, 430, idle(i, t), nome=True, celular=True, painel=pain)
    return q


def p_6l(p, t):
    """A NF gigante corre pelos obstáculos; Giovanna e Bruno esperam no portal do FY26."""
    mk = p['marcas']
    q = Quadro(p)
    for n, (i, x) in enumerate((('giovanna', 1760), ('bruno', 1870))):
        st = idle(i, t)
        if t > mk['chega']:
            for k in range(2):
                junta(st, *M.pulo(t, mk['chega'] + 0.1 + 0.5 * k + 0.1 * n, 0.4, 60))
        q.ator(i, x, CHAO + 20, 260, st)
    return q


def p_6m(p, t):
    """Os dois comemorando."""
    q = Quadro(p)
    tc = p['marcas']['comemora']
    for i, x in (('giovanna', 700), ('bruno', 1220)):
        st = idle(i, t)
        for k in range(3):
            junta(st, *M.pulo(t, tc + 0.05 + 0.55 * k + (0.12 if i == 'bruno' else 0), 0.4, 70))
        q.ator(i, x, CHAO + 20, 430, st, nome=True)
    return q


def p_6n(p, t):
    q = Quadro(p, push(p, t, 1.0, 1.08, cy=560))
    st = ajeita(idle('antonialli', t), t, p['marcas']['cabelo'])
    q.ator('antonialli', 960, CHAO + 40, 480, st, nome=True, cabelo=p['marcas']['cabelo'], blob={'cor': 'azul', 'r': 300})
    return q


def p_7a(p, t):
    q = Quadro(p)
    cl = ['cuidado', 'frasco', 'acelerado', 'campo', 'conectado', 'obrinha']
    for n, (i, x) in enumerate(zip(cl, fila(6, 120, 1800))):
        st = cai(i, t, p['marcas']['logos'][n] - 0.15, 450)
        if st:
            aceno(st, braco(i), t, p['marcas']['logos'][n] + 0.3)
            q.ator(i, x, CHAO, 330, st, logo=True)
    return q


def p_7b(p, t):
    """Antonialli olha para a câmera, sério."""
    q = Quadro(p, push(p, t, 1.0, 1.08, cy=520))
    st = idle('antonialli', t)
    st['piscar'] = 0.0
    q.ator('antonialli', 960, CHAO + 40, 500, st, nome=True, blob={'cor': 'azul', 'r': 320})
    return q


def p_7c(p, t):
    """Pipeline aquecido: Antonialli à esquerda apresenta; Módulo e Cronos chegam."""
    mk = p['marcas']
    q = Quadro(p, push(p, t, 1.0, 1.03))
    q.ator('antonialli', 420, CHAO + 20, 440, idle('antonialli', t), nome=True, blob={'cor': 'azul', 'r': 270})
    for i, t0, xa, xb in (('modulo', mk['pipeline'], -200, 760, ), ('cronos', mk['pipeline'] + 0.2, 2100, 1560)):
        if t < t0:
            continue
        x, st = chega_pulando(i, t, t0, xa, xb, 0.7)
        junta(st, *M.pulo(t, mk['aquecido'] + 0.3, 0.4, 60))
        q.ator(i, x, CHAO + 20, 300, st)
    return q


def p_7d(p, t):
    q = Quadro(p, push(p, t, 1.06, 1.0, cy=560))
    time13(q, t, p['de'] + 0.2, y_tras=770, y_frente=900, alt_t=240, alt_f=280, x0=300, x1=1620,
           pulos=(p['marcas']['frase'],))
    for i, x in (('modulo', 150), ('cronos', 1770)):
        st = cai(i, t, p['de'] + 1.2 + (0.1 if i == 'cronos' else 0), 450)
        if st:
            q.ator(i, x, 900, 300, st, logo=True)
    return q


def p_7e(p, t):
    q = Quadro(p)
    time13(q, t, p['de'] - 10, y_tras=900, y_frente=990, alt_t=190, alt_f=215, x0=260, x1=1660)
    return q


def p_7f(p, t):
    """"Mas pagou a NF?" → corte seco → Antonialli só ajeita o cabelo. Silêncio."""
    q = Quadro(p)
    mk = p['marcas']
    if t < mk['corte']:
        x, st = chega_pulando('giovanna', t, p['de'] + 0.1, 2150, 1300, 0.7)
        q.ator('giovanna', x, CHAO, 400, st, nome=True)
    else:
        q.cam = (960, 470, 1.25)
        st = ajeita(idle('antonialli', t), t, mk['cabelo'])
        st['piscar'] = 0.0
        q.ator('antonialli', 960, CHAO + 60, 480, st, nome=True, cabelo=mk['cabelo'])
    return q


PLANOS = {'2e': p_2e, '3fase': p_3fase, '3a': p_3a, '3b': p_3b, '4h': p_4h, '5s1': p_5s1, '5s5': p_5s5, '5u': p_5u,
          '6a': p_6a, '6c': p_6c, '6e': p_6e, '6f': p_6f, '6g': p_6g, '6h': p_6h, '6i': p_6i, '6j': p_6j, '6k': p_6k,
          '6l': p_6l, '6m': p_6m, '6n': p_6n, '7a': p_7a, '7b': p_7b, '7c': p_7c, '7d': p_7d, '7e': p_7e, '7f': p_7f}
for _k in range(1, 7):
    PLANOS[f'4p{_k}'] = p_projeto


def quadro(t):
    p = next((x for x in TL['planos'] if x['de'] <= t < x['ate']), TL['planos'][-1])
    fn = PLANOS.get(p['id'])
    q = fn(p, t) if fn else Quadro(p)
    return q.dict()
