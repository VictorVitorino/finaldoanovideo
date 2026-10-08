"""Teste de 30 s no modelo de explainer do SpecForge, com os personagens chibi 3D do usuário
(time + mascotes das empresas) e o roteiro do Projeto do Ano.

Três camadas, todas com a mesma câmera:
  fundo     papel, blobs, chão e lugares (SVG no Chromium: src/teste30.js, layer=fundo)
  atores    personagens recortados com micro-atuação (Python: este arquivo + motor30.py)
  overlay   balões de logo, adesivos, carimbos, cartões, legendas (SVG, layer=overlay)

    python3 producao/narracao.py                 # trechos da narração (build/teste30/narracao)
    python3 producao/teste30.py tempo            # timeline.json a partir das durações da narração
    python3 producao/teste30.py rastro           # câmera e posição de cada personagem -> track.json
    node render.mjs frames --test teste30 --layer fundo --out build/teste30/fundo
    python3 producao/teste30.py quadros          # fundo + personagens -> build/teste30/base
    node render.mjs frames --test teste30 --layer overlay --out build/teste30/overlay
    python3 producao/trilha30.py                 # música + efeitos + narração -> build/teste30/mix.wav
    python3 producao/teste30.py montar           # -> build/teste30/teste30.mp4

Mundo = pixels de tela com a câmera em (960, 540, z=1); tela = (P − c)·z + (960, 540).
"""
import argparse
import json
import math
import os
import random
import subprocess
import sys
from multiprocessing import Pool

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import motor30 as M  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B30 = os.path.join(ROOT, 'build', 'teste30')
FPS = 30
BEAT = 60 / 112
DUR = 30.0
CHAO = 840  # linha do chão (y de mundo)
PESSOAS = [f'foto{i}' for i in range(1, 13)]
CLIENTES = ['cuidado', 'frasco', 'acelerado', 'campo', 'astro', 'obrinha']


def acima(t):
    """Próximo tempo de batida (os cortes caem no tempo da música)."""
    return math.ceil(t / BEAT - 1e-6) * BEAT


# ---------------------------------------------------------------- timeline
def cmd_tempo(a):
    nar = json.load(open(os.path.join(B30, 'narracao', 'narracao.json')))
    d = {x['id']: x['dur'] for x in nar['trechos']}
    tx = {x['id']: x['texto'] for x in nar['trechos']}
    falas, sfx, sec, mk = [], [], [], {}

    def fala(i, t):
        falas.append({'id': i, 'de': round(t, 3), 'ate': round(t + d[i], 3), 'texto': tx[i]})
        return t + d[i]

    # abertura (título) e parceria
    mk['modulo_chega'] = 1.35
    t = fala('n1a', 1.75)
    t = fala('n1b', t + 0.3)
    mk['cronos_chega'] = falas[-1]['de'] - 0.3
    mk['encontro'] = t + 0.15
    s1 = acima(mk['encontro'] + 1.0)
    sec.append({'id': 'parceria', 'de': 0.0, 'ate': round(s1, 3)})
    # time
    mk['time_entra'] = s1 + 0.2
    t = fala('n2', s1 + 0.45)
    ini = falas[-1]['de']
    mk['fazedora'] = ini + d['n2'] * 0.68
    mk['adaptavel'] = ini + d['n2'] * 0.86
    s2 = acima(t + 0.4)
    sec.append({'id': 'time', 'de': round(s1, 3), 'ate': round(s2, 3)})
    # jornada: cartão de fase e um trecho por cliente
    mk['fase'] = s2
    t = s2 + 1.35
    mk['clientes'] = []
    for k, i in enumerate(['n3a', 'n3b', 'n3c', 'n3d', 'n3e', 'n3f']):
        ini = t
        t = fala(i, t)
        # momento em que o nome do cliente é dito
        nome = ini + {'n3a': 0.6, 'n3b': 0.62, 'n3d': 0.1, 'n3f': 0.25}.get(i, 0.08) * d[i]
        mk['clientes'].append(round(nome, 3))
        t += 0.14
    s3 = acima(t + 0.3)
    sec.append({'id': 'jornada', 'de': round(s2, 3), 'ate': round(s3, 3)})
    # resultado
    t = fala('n4a', s3 + 0.45)
    mk['kpi_projetos'] = falas[-1]['de'] + 0.45 * d['n4a']
    t = fala('n4b', t + 0.12)
    mk['kpi_paises'] = falas[-1]['de'] + 0.35 * d['n4b']
    t = fala('n4c', t + 0.15)
    mk['kpi_valor'] = falas[-1]['de'] + 0.18 * d['n4c']
    mk['carimbo'] = t + 0.1
    s4 = acima(t + 0.5)
    sec.append({'id': 'resultado', 'de': round(s3, 3), 'ate': round(s4, 3)})
    # fechamento
    t = fala('n5', s4 + 0.5)
    fim = max(DUR, acima(t + 1.5))
    sec.append({'id': 'fechamento', 'de': round(s4, 3), 'ate': round(fim, 3)})
    mk['confete'] = s4 + 0.2

    sfx += [{'t': 0.25, 's': 'shine', 'ganho': 0.5}, {'t': mk['modulo_chega'] + 0.85, 's': 'pop'},
            {'t': mk['cronos_chega'] + 0.85, 's': 'pop'}, {'t': mk['encontro'], 's': 'sparkle'}]
    for x in (s1, s2, s3, s4):
        sfx.append({'t': round(x - 0.16, 3), 's': 'whoosh', 'ganho': 0.5})
    for n in range(12):
        sfx.append({'t': round(mk['time_entra'] + 0.38 + n * 0.16, 3), 's': 'pop', 'ganho': 0.22})
    sfx += [{'t': mk['fazedora'], 's': 'pop', 'ganho': 0.5}, {'t': mk['adaptavel'], 's': 'pop', 'ganho': 0.5}]
    for k, tc in enumerate(mk['clientes']):
        sfx.append({'t': tc, 's': f'pluck{k + 1}'})
    sfx += [{'t': mk['kpi_projetos'], 's': 'tick'}, {'t': mk['kpi_paises'], 's': 'tick'},
            {'t': mk['kpi_valor'] - 1.0, 's': 'riser'}, {'t': mk['kpi_valor'], 's': 'hit'},
            {'t': mk['carimbo'], 's': 'pop', 'ganho': 0.7},
            {'t': mk['confete'], 's': 'confetti'}, {'t': falas[-1]['de'] + 0.1, 's': 'shine'}]
    for f in sfx:
        f['t'] = round(f['t'], 3)
    mk = {k: (round(v, 3) if isinstance(v, float) else v) for k, v in mk.items()}
    tl = {'dur': round(fim, 3), 'fps': FPS, 'bpm': 112, 'secoes': sec, 'falas': falas, 'sfx': sorted(sfx, key=lambda x: x['t']), 'marcas': mk}
    json.dump(tl, open(os.path.join(B30, 'timeline.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps({'secoes': sec, 'fim': fim}, indent=1))


# ---------------------------------------------------------------- direção
TL = None
MARCOS = {}
P = {}


def carregar_marcos():
    global TL
    TL = json.load(open(os.path.join(B30, 'timeline.json')))
    for arq, pasta in (('marcos_pessoas.json', 'pessoas'), ('marcos_mascotes.json', 'mascotes')):
        for i, m in json.load(open(os.path.join(ROOT, 'producao', arq))).items():
            m['_caminho'] = os.path.join(B30, 'corte', pasta, m['arquivo'])
            MARCOS[i] = m


def secao(nome):
    return next(s for s in TL['secoes'] if s['id'] == nome)


def idle(i, t):
    """Quem está parado respira, mexe a cabeça e pisca, cada um no seu tempo."""
    r = random.Random(i)
    ph = r.uniform(0, 6.28)
    resp = math.sin(2 * math.pi * t / r.uniform(3.0, 3.8) + ph)
    cab = 2.0 * math.sin(2 * math.pi * r.uniform(0.22, 0.32) * t + ph) + 0.7 * math.sin(2 * math.pi * r.uniform(0.5, 0.7) * t + 2 * ph)
    t0, per = r.uniform(0.4, 2.2), r.uniform(2.8, 4.4)
    n = math.floor((t - t0) / per)
    pk = max(M.piscada(t, t0 + n * per), M.piscada(t, t0 + (n + 1) * per)) if t > t0 else 0.0
    return {'sx': 1 - 0.006 * resp, 'sy': 1 + 0.012 * resp, 'cabeca': cab, 'piscar': pk, 'dy': 0.0, 'rot': 0.0}


def junta(st, dy, sx, sy, rot=0.0):
    st.update(dy=st['dy'] + dy, sx=st['sx'] * sx, sy=st['sy'] * sy, rot=st['rot'] + rot)
    return st


class Quadro:
    """Câmera + atores de um quadro; converte mundo → tela e calcula os pontos para as outras camadas."""

    def __init__(self, sec, cam):
        self.sec, self.cam = sec, cam
        self.atores = []

    def tela(self, x, y):
        cx, cy, z = self.cam
        return (x - cx) * z + 960, (y - cy) * z + 540

    def ator(self, i, wx, wy, altura, st, blob=None):
        m = MARCOS[i]
        z = self.cam[2]
        x, y = self.tela(wx, wy)
        k = altura * z / (m['pes_y'] - m['topo'][1])
        dy = st.get('dy', 0.0) * z
        topo = (x + (m['topo'][0] - m['centro_x']) * k, y + dy + (m['topo'][1] - m['pes_y']) * k * st.get('sy', 1.0))
        a = {'id': i, 'x': round(x, 2), 'y': round(y + dy, 2), 'chao': round(y, 2), 'k': round(k, 5),
             'topo': [round(topo[0], 1), round(topo[1], 1)], 'alt': round(altura * z, 1),
             'st': {c: round(v, 4) for c, v in st.items() if c in ('sx', 'sy', 'rot', 'cabeca', 'piscar', 'braco')}}
        if blob:
            a['blob'] = blob
        self.atores.append(a)

    def dict(self):
        return {'secao': self.sec, 'cam': [round(v, 3) for v in self.cam], 'atores': self.atores}


def d_parceria(t):
    s = secao('parceria')
    mk = TL['marcas']
    u = M.ease_io(t / s['ate'])
    q = Quadro('parceria', (960, 540 - 10 * u, 1.0 + 0.04 * u))
    for i, t0, xa, xb, cor in (('modulo', mk['modulo_chega'], -260, 560, 'teal'), ('cronos', mk['cronos_chega'], 2180, 1360, 'azul')):
        if t < t0:
            continue
        x, dy, sx, sy, rot = M.caminhada_pulos(t, t0, t0 + 0.85, xa, xb, passo=0.28, altura=30)
        st = junta(idle(i, t), dy, sx, sy, rot)
        junta(st, *M.pulo(t, mk['encontro'] + (0.0 if i == 'modulo' else 0.1), 0.4, 70))
        if MARCOS[i].get('braco') and t > t0 + 0.85:
            v = t - t0 - 0.85
            st['braco'] = 9 * math.sin(2 * math.pi * 1.5 * v) * math.exp(-v * 0.7)
        q.ator(i, x, CHAO, 430, st, blob={'cor': cor, 'r': 270})
    return q


def lugares_time():
    larg = 1700
    return [(960 - larg / 2 + larg * (k + 0.5) / 12, CHAO) for k in range(12)]


def d_time(t):
    s = secao('time')
    lt = t - s['de']
    u = M.ease_io(lt / (s['ate'] - s['de']))
    q = Quadro('time', (960, 540 - 30 * u, 1.0 + 0.05 * u))
    pos = lugares_time()
    ordem = [5, 6, 4, 7, 3, 8, 2, 9, 1, 10, 0, 11]  # do centro para as pontas
    t_in = TL['marcas']['time_entra'] - s['de']
    for n, k in enumerate(ordem):
        i = PESSOAS[k]
        e = M.entrada_queda(lt, t_in + n * 0.16, altura=600)
        if e is None:
            continue
        st = junta(idle(i, t), *e)
        # pulinho de alegria quando falam "fazedora" e "adaptável"
        for tm in ('fazedora', 'adaptavel'):
            junta(st, *M.pulo(t, TL['marcas'][tm] + 0.03 * n, 0.36, 40))
        q.ator(i, pos[k][0], pos[k][1], 255, st)
    return q


def paradas():
    """Posições dos lugares dos clientes na jornada (src/jornada30.js exporta as mesmas)."""
    arq = os.path.join(B30, 'jornada_paradas.json')
    if os.path.exists(arq):
        return json.load(open(arq))
    return [{'x': 900 + 1050 * k, 'y': CHAO} for k in range(6)]


def d_jornada(t):
    s = secao('jornada')
    mk = TL['marcas']
    par = paradas()
    xs = [p['x'] for p in par]
    # a câmera chega a cada parada um pouco antes do nome do cliente
    chegadas = [c - 0.3 for c in mk['clientes']]
    chaves = [(s['de'], xs[0] - 700), (mk['fase'] + 1.2, xs[0] - 700)]
    for k in range(6):
        ida = min(0.8, (chegadas[k] - chaves[-1][0]) * 0.85)
        chaves += [(chegadas[k] - ida, chaves[-1][1]), (chegadas[k], xs[k])]
    cx = chaves[-1][1]
    for (ta, xa), (tb, xb) in zip(chaves[:-1], chaves[1:]):
        if ta <= t < tb:
            cx = xa + (xb - xa) * M.ease_io((t - ta) / max(1e-3, tb - ta))
            break
    q = Quadro('jornada', (cx + 160, 540, 1.0))
    for k, i in enumerate(CLIENTES):
        t0 = mk['clientes'][k] - 0.05
        e = M.entrada_queda(t, t0, altura=520)
        if e is None:
            continue
        st = junta(idle(i, t), *e)
        if MARCOS[i].get('braco') and t > t0 + 0.4:
            v = t - t0 - 0.4
            st['braco'] = 9 * math.sin(2 * math.pi * 1.4 * v) * math.exp(-v * 0.55)
        q.ator(i, par[k]['x'] - par[k].get('lado', 300), par[k].get('y', CHAO), 400, st)
    return q


def d_resultado(t):
    s = secao('resultado')
    lt = t - s['de']
    u = M.ease_io(lt / (s['ate'] - s['de']))
    q = Quadro('resultado', (960, 540, 1.0 + 0.04 * u))
    tv = TL['marcas']['kpi_valor']
    for i, wx, atraso, cor in (('modulo', 250, 0.0, 'teal'), ('cronos', 1670, 0.1, 'azul')):
        e = M.entrada_queda(lt, 0.05 + atraso * 2, altura=500)
        if e is None:
            continue
        st = junta(idle(i, t), *e)
        junta(st, *M.pulo(t, tv + 0.12 + atraso, 0.45, 90))
        q.ator(i, wx, CHAO + 40, 380, st, blob={'cor': cor, 'r': 220})
    return q


def d_fechamento(t):
    s = secao('fechamento')
    lt = t - s['de']
    u = M.ease_io(lt / (s['ate'] - s['de']))
    q = Quadro('fechamento', (960, 540 + 10 * u, 1.04 - 0.05 * u))
    tras = PESSOAS
    frente = ['cuidado', 'frasco', 'acelerado', 'modulo', 'cronos', 'campo', 'astro', 'obrinha']
    larg_t, larg_f = 1760, 1640
    for n, i in enumerate(tras):
        st = idle(i, t)
        junta(st, *M.pulo(lt, 0.3 + 0.06 * ((n * 5) % 12), 0.38, 50))
        q.ator(i, 960 - larg_t / 2 + larg_t * (n + 0.5) / 12, 770, 205, st)
    for n, i in enumerate(frente):
        st = idle(i, t)
        junta(st, *M.pulo(lt, 0.25 + 0.07 * ((n * 3) % 8), 0.42, 60))
        q.ator(i, 960 - larg_f / 2 + larg_f * (n + 0.5) / 8, 905, 280, st)
    return q


DIRECAO = {'parceria': d_parceria, 'time': d_time, 'jornada': d_jornada, 'resultado': d_resultado, 'fechamento': d_fechamento}


def direcao(i):
    t = i / FPS
    s = next((x for x in TL['secoes'] if x['de'] <= t < x['ate']), TL['secoes'][-1])
    return DIRECAO[s['id']](t).dict()


def cmd_rastro(a):
    carregar_marcos()
    n = int(round(TL['dur'] * FPS))
    quadros = [direcao(i) for i in range(n)]
    json.dump({'fps': FPS, 'dur': TL['dur'], 'chao': CHAO, 'quadros': quadros}, open(os.path.join(B30, 'track.json'), 'w'))
    print(f'track.json: {n} quadros')


# ---------------------------------------------------------------- render dos atores
TRACK = None
ACAB = None


def quadro(i):
    q = TRACK['quadros'][i]
    fundo = cv2.imread(os.path.join(B30, 'fundo', f'f{i:05d}.jpg'))
    frame = fundo.astype(np.float32) if fundo is not None else np.full((M.H, M.W, 3), 236, np.float32)
    for a in sorted(q['atores'], key=lambda a: a['chao']):
        i_ = a['id']
        if i_ not in P:
            P[i_] = M.Personagem(MARCOS[i_]['_caminho'], MARCOS[i_])
        st = dict(a['st'], x=a['x'], y=a['y'], k=a['k'])
        r = P[i_].sprite(st)
        if r is None:
            continue
        spr, x0, y0 = r
        altura = a['chao'] - a['y']
        M.sombra(frame, a['x'], a['chao'], spr.shape[1] * 0.40, forca=0.28, altura=max(0.0, altura))
        M.compor(frame, spr, x0, y0)
    frame = ACAB.aplicar(frame, i, None, bloom=0.0)
    t = i / FPS
    frame *= min(1.0, t / 0.3) * (1 - M.ease((t - (TRACK['dur'] - 0.5)) / 0.45))
    cv2.imwrite(os.path.join(B30, 'base', f'f{i:05d}.jpg'), np.clip(frame, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 93])


class AcabamentoPapel(M.Acabamento):
    """Papel: vinheta bem leve e grão fino, sem brilho."""

    def __init__(self):
        super().__init__()
        self.vinheta = 1 - (1 - self.vinheta) * 0.35
        self.grao = [g * 0.5 for g in self.grao]


def cmd_quadros(a):
    global TRACK, ACAB
    carregar_marcos()
    TRACK = json.load(open(os.path.join(B30, 'track.json')))
    ACAB = AcabamentoPapel()
    os.makedirs(os.path.join(B30, 'base'), exist_ok=True)
    n = len(TRACK['quadros'])
    ids = list(range(n)) if a.so is None else [int(round(float(x) * FPS)) for x in a.so.split(',')]
    with Pool(a.workers) as pool:
        pool.map(quadro, ids, chunksize=4)
    print(f'{len(ids)} quadros em {B30}/base')


def cmd_montar(a):
    out = os.path.join(B30, 'teste30.mp4')
    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', os.path.join(B30, 'base', 'f%05d.jpg'),
           '-framerate', str(FPS), '-i', os.path.join(B30, 'overlay', 'f%05d.png'), '-i', os.path.join(B30, 'mix.wav'),
           '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p[v]', '-map', '[v]', '-map', '2:a',
           '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', str(a.crf), '-movflags', '+faststart', '-shortest', out]
    subprocess.run(cmd, check=True)
    print(out, f'{os.path.getsize(out) / 1e6:.1f} MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['tempo', 'rastro', 'quadros', 'montar'])
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--so', help='só estes tempos (s), separados por vírgula, para conferir')
    ap.add_argument('--crf', type=int, default=20)
    a = ap.parse_args()
    {'tempo': cmd_tempo, 'rastro': cmd_rastro, 'quadros': cmd_quadros, 'montar': cmd_montar}[a.cmd](a)
