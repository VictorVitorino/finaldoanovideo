"""Teste de 30 s: mascotes das empresas + time em chibi 3D, cenários em camadas, narração,
música e motion graphics (indicadores).

    python3 producao/narracao.py                 # trechos da narração (build/teste30/narracao)
    python3 producao/teste30.py tempo            # timeline.json a partir das durações da narração
    python3 producao/trilha30.py                 # música + efeitos + narração -> build/teste30/mix.wav
    python3 producao/teste30.py quadros [--so 1.0,5.2]
    node render.mjs frames --test teste30 --layer overlay --out build/teste30/overlay
    python3 producao/teste30.py montar           # -> build/teste30/teste30.mp4

Planos (os tempos saem da narração e caem no tempo da música, 112 BPM):
  parceria   grua do céu até o terraço; Módulo (TOTVS) e Cronos (A&M) chegam aos pulinhos
  time       os 12 do time caem no terraço, um a um, em duas fileiras
  jornada    travelling pela paisagem: em cada pedestal pousa o mascote do cliente
  cockpit    painel de vidro com os indicadores; Módulo e Cronos comemoram o número
  fechamento todos juntos no terraço, confete e título
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
CEN = os.path.join(B30, 'cenarios')
FPS = 30
BEAT = 60 / 112
DUR = 30.0
PESSOAS = [f'foto{i}' for i in range(1, 13)]
CLIENTES = ['cuidado', 'frasco', 'acelerado', 'campo', 'astro', 'obrinha']
PARADAS = ['unimed', 'funed', 'caoa', 'john-deere', 'hughes', 'libercon']
ALTURA = 560  # altura dos personagens no mundo (px do painel), igual para todos


def acima(t):
    """Próximo tempo de batida."""
    return math.ceil(t / BEAT - 1e-6) * BEAT


# ---------------------------------------------------------------- timeline
def cmd_tempo(a):
    nar = json.load(open(os.path.join(B30, 'narracao', 'narracao.json')))
    d = {x['id']: x['dur'] for x in nar['trechos']}
    tx = {x['id']: x['texto'] for x in nar['trechos']}
    falas, sfx, sec, marcas = [], [], [], {}

    def fala(i, t):
        falas.append({'id': i, 'de': round(t, 3), 'ate': round(t + d[i], 3), 'texto': tx[i]})
        return t + d[i]

    # parceria
    t = fala('n1a', 1.75)
    marcas['modulo_chega'] = 1.45
    t = fala('n1b', t + 0.35)
    marcas['cronos_chega'] = falas[-1]['de'] - 0.3
    marcas['encontro'] = t + 0.2
    s1 = acima(marcas['encontro'] + 0.9)
    sec.append({'id': 'parceria', 'de': 0.0, 'ate': round(s1, 3)})
    # time
    t = fala('n2', s1 + 0.5)
    s2 = acima(t + 0.45)
    sec.append({'id': 'time', 'de': round(s1, 3), 'ate': round(s2, 3)})
    # jornada: um trecho por cliente
    t = s2 + 0.55
    marcas['clientes'] = []
    for k, i in enumerate(['n3a', 'n3b', 'n3c', 'n3d', 'n3e', 'n3f']):
        ini = t
        t = fala(i, t)
        # o nome do cliente está no fim do trecho em n3a ("na Unimed") e n3d ("John Deere, na Argentina")
        nome = ini + (d[i] * 0.55 if i == 'n3a' else 0.05 if i != 'n3f' else d[i] * 0.2)
        marcas['clientes'].append(round(nome, 3))
        t += 0.22 if k else 0.3
    s3 = acima(t + 0.35)
    sec.append({'id': 'jornada', 'de': round(s2, 3), 'ate': round(s3, 3)})
    # cockpit
    t = fala('n4a', s3 + 0.5)
    marcas['kpi_projetos'] = falas[-1]['de'] + 0.35
    t = fala('n4b', t + 0.18)
    marcas['kpi_paises'] = falas[-1]['de'] + 0.25
    t = fala('n4c', t + 0.22)
    marcas['kpi_valor'] = falas[-1]['de'] + 0.2
    s4 = acima(t + 0.45)
    sec.append({'id': 'cockpit', 'de': round(s3, 3), 'ate': round(s4, 3)})
    # fechamento
    t = fala('n5', s4 + 0.6)
    fim = max(DUR, acima(t + 1.6))
    sec.append({'id': 'fechamento', 'de': round(s4, 3), 'ate': round(fim, 3)})
    marcas['confete'] = s4 + 0.25

    sfx += [{'t': 0.2, 's': 'whoosh', 'ganho': 0.4}, {'t': 0.9, 's': 'shine', 'ganho': 0.4},
            {'t': marcas['modulo_chega'] + 0.9, 's': 'pop'}, {'t': marcas['cronos_chega'] + 0.9, 's': 'pop'},
            {'t': marcas['encontro'], 's': 'sparkle'}]
    for x in (s1, s2, s3, s4):
        sfx.append({'t': round(x - 0.18, 3), 's': 'whoosh', 'ganho': 0.5})
    for k, tc in enumerate(marcas['clientes']):
        sfx.append({'t': tc, 's': f'pluck{k + 1}'})
    sfx += [{'t': marcas['kpi_projetos'], 's': 'tick'}, {'t': marcas['kpi_paises'], 's': 'tick'},
            {'t': marcas['kpi_valor'] - 1.2, 's': 'riser'}, {'t': marcas['kpi_valor'], 's': 'hit'},
            {'t': marcas['confete'], 's': 'confetti'}, {'t': falas[-1]['de'] + 0.1, 's': 'shine'}]
    for f in sfx:
        f['t'] = round(f['t'], 3)
    tl = {'dur': round(fim, 3), 'fps': FPS, 'bpm': 112, 'secoes': sec, 'falas': falas, 'sfx': sorted(sfx, key=lambda x: x['t']), 'marcas': marcas}
    json.dump(tl, open(os.path.join(B30, 'timeline.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps({'secoes': sec, 'fim': fim}, indent=1))


# ---------------------------------------------------------------- elenco
TL = None
CENS = {}
P = {}


def carregar():
    global TL
    TL = json.load(open(os.path.join(B30, 'timeline.json')))
    for n in ('terraco', 'jornada', 'cockpit'):
        CENS[n] = M.Cenario(CEN, n)
    mp = json.load(open(os.path.join(ROOT, 'producao', 'marcos_pessoas.json')))
    mm = json.load(open(os.path.join(ROOT, 'producao', 'marcos_mascotes.json')))
    for i, m in mp.items():
        P[i] = M.Personagem(os.path.join(B30, 'corte', 'pessoas', m['arquivo']), m)
    for i, m in mm.items():
        P[i] = M.Personagem(os.path.join(B30, 'corte', 'mascotes', m['arquivo']), m)


def secao(nome):
    return next(s for s in TL['secoes'] if s['id'] == nome)


def idle(i, t):
    """Micro-atuação de quem está parado: respiração, cabeça e piscadas em tempos próprios."""
    r = random.Random(i)
    ph = r.uniform(0, 6.28)
    resp = math.sin(2 * math.pi * t / r.uniform(3.0, 3.8) + ph)
    cab = 2.0 * math.sin(2 * math.pi * r.uniform(0.22, 0.32) * t + ph) + 0.7 * math.sin(2 * math.pi * r.uniform(0.5, 0.7) * t + 2 * ph)
    t0, per = r.uniform(0.4, 2.2), r.uniform(2.8, 4.4)
    n = math.floor((t - t0) / per)
    pk = max(M.piscada(t, t0 + n * per), M.piscada(t, t0 + (n + 1) * per)) if t > t0 else 0.0
    return {'sx': 1 - 0.006 * resp, 'sy': 1 + 0.012 * resp, 'cabeca': cab, 'piscar': pk}


class Cena:
    """Um quadro: cenário + atores na ordem de profundidade + rastreio para a camada de textos."""

    def __init__(self, cen, cam, luz):
        self.cen, self.cam, self.luz = cen, cam, luz
        self.atores = []
        self.track = {'cam': list(cam), 'atores': {}}

    def ator(self, i, wx, wy, st, alt=ALTURA, refl=0.0, sombra=0.45):
        self.atores.append((wy, i, wx, wy, st, alt, refl, sombra))

    def render(self, frame):
        self.cen.desenhar(frame, self.cam)
        z = self.cam[2]
        for (_, i, wx, wy, st, alt, refl, sb) in sorted(self.atores, key=lambda a: a[0]):
            p = P[i]
            x, y = self.cen.tela(self.cam, wx, wy)
            altura_rec = p.m['pes_y'] - p.m['topo'][1]
            k = alt * self.cen.base * z / altura_rec
            dy = st.pop('dy', 0.0)
            st2 = dict(st, x=x, y=y + dy, k=k)
            if self.luz:
                lado = 1 if self.luz['x'] > wx else -1
                st2['luz'] = {'dir': (lado * 0.9, -0.45), 'cor': self.luz['cor'], 'forca': self.luz['forca']}
            r = p.sprite(st2)
            if r is None:
                continue
            spr, x0, y0 = r
            M.sombra(frame, x, y, spr.shape[1] * 0.42 / max(st.get('sx', 1), 0.5), forca=sb, altura=-dy)
            if refl > 0:
                M.reflexo(frame, spr, x0, y0, y + dy, forca=refl)
            M.compor(frame, spr, x0, y0)
            top = (p.m['topo'][0] - p.m['centro_x']) * k, (p.m['topo'][1] - p.m['pes_y']) * k * st.get('sy', 1.0)
            self.track['atores'][i] = [round(x + top[0], 1), round(y + dy + top[1], 1), round(x, 1), round(y, 1), round(k, 4)]


LUZ_TERRACO = {'x': 99999, 'cor': M.bgr(255, 178, 110), 'forca': 0.75}


# ---------------------------------------------------------------- planos
def plano_parceria(t, frame):
    cen = CENS['terraco']
    s = secao('parceria')
    mk = TL['marcas']
    piso = cen.meta['piso_y']
    hor = cen.meta.get('horizonte_y', piso - 400)
    cx0 = cen.tam[0] / 2
    # grua: do céu (título) até o terraço
    u = M.ease_io((t - 0.3) / 1.9)
    cy = (hor - 820) * (1 - u) + (piso - 300) * u
    z = 1.0 + 0.55 * u + 0.05 * M.ease((t - 2.2) / (s['ate'] - 2.2))
    cam = (cx0, cy, z)
    sc = Cena(cen, cam, LUZ_TERRACO)
    # Módulo pela esquerda, Cronos pela direita, aos pulinhos
    for i, t0, xa, xb in (('modulo', mk['modulo_chega'], cx0 - 1250, cx0 - 330), ('cronos', mk['cronos_chega'], cx0 + 1250, cx0 + 330)):
        if t < t0:
            continue
        x, dy, sx, sy, rot = M.caminhada_pulos(t, t0, t0 + 0.9, xa, xb)
        st = idle(i, t)
        st.update(sx=st['sx'] * sx, sy=st['sy'] * sy, rot=rot, dy=dy * cam[2])
        # pulinho de comemoração no encontro
        pdy, psx, psy = M.pulo(t, mk['encontro'] + (0.0 if i == 'modulo' else 0.12), 0.42, 70 * cam[2])
        if pdy or psx != 1:
            st.update(dy=st['dy'] + pdy, sx=st['sx'] * psx, sy=st['sy'] * psy)
        if P[i].m.get('braco'):
            st['braco'] = 7 * math.sin(2 * math.pi * 1.6 * max(0, t - t0 - 0.9)) * math.exp(-max(0, t - t0 - 0.9) * 0.6) if t > t0 + 0.9 else 0
        sc.ator(i, x, piso, st, refl=0.10)
    sc.render(frame)
    sc.track['ancoras'] = {'titulo': titulo_ceu(cen, cam, hor)}
    return sc.track


def titulo_ceu(cen, cam, hor):
    """Posição de tela do título preso ao céu (anda com a camada de paralaxe do céu)."""
    p = cen.meta['camadas'][0]['paralaxe']
    Mt = cen.matriz(cam, p)
    wx, wy = cen.tam[0] / 2, hor - 980
    return [round(float(Mt[0, 0] * wx + Mt[0, 2]), 1), round(float(Mt[1, 1] * wy + Mt[1, 2]), 1)]


def lugares_time(cen, cx, n_tras=6, n_frente=6, larg=2300):
    piso = cen.meta['piso_y']
    pos = []
    for k in range(n_tras):
        pos.append((cx - larg / 2 + larg * (k + 0.5) / n_tras, piso - 190))
    for k in range(n_frente):
        pos.append((cx - larg / 2 + larg * (k + 0.5) / n_frente + (larg / n_frente) * 0.0, piso))
    return pos


def plano_time(t, frame):
    cen = CENS['terraco']
    s = secao('time')
    lt = t - s['de']
    dur = s['ate'] - s['de']
    cx0 = cen.tam[0] / 2
    piso = cen.meta['piso_y']
    u = lt / dur
    cam = (cx0 - 160 + 320 * M.ease_io(u), piso - 330, 1.12 + 0.06 * M.ease(u))
    sc = Cena(cen, cam, LUZ_TERRACO)
    pos = lugares_time(cen, cx0)
    ordem = [6, 1, 9, 3, 11, 0, 7, 4, 10, 2, 8, 5]  # entram intercalados
    for n, k in enumerate(ordem):
        i = PESSOAS[k]
        t0 = 0.15 + n * 0.2
        q = M.entrada_queda(lt, t0, altura=700 * cam[2])
        if q is None:
            continue
        dy, sx, sy = q
        st = idle(i, t)
        st.update(sx=st['sx'] * sx, sy=st['sy'] * sy, dy=dy)
        wx, wy = pos[k]
        sc.ator(i, wx, wy, st, refl=0.10)
    sc.render(frame)
    return sc.track


def plano_jornada(t, frame):
    cen = CENS['jornada']
    s = secao('jornada')
    lt = t - s['de']
    mk = TL['marcas']['clientes']
    par = cen.meta['paradas']
    # câmera: viaja de parada em parada e chega um pouco antes de cada nome
    xs = [p['x'] for p in par]
    chegadas = [c - s['de'] - 0.25 for c in mk]
    chaves = [(0.0, xs[0] - 700)]
    for k in range(6):
        ida = min(0.85, (chegadas[k] - chaves[-1][0]) * 0.8)
        chaves += [(chegadas[k] - ida, chaves[-1][1]), (chegadas[k], xs[k])]
    cx = chaves[-1][1]
    for (ta, xa), (tb, xb) in zip(chaves[:-1], chaves[1:]):
        if ta <= lt < tb:
            cx = xa + (xb - xa) * M.ease_io((lt - ta) / max(1e-3, tb - ta))
            break
    cx += 220  # pedestal um pouco à esquerda do centro: o próximo entra pela direita
    topo = np.mean([p['topo_y'] for p in par])
    cam = (cx, topo - 300, 1.2)
    sc = Cena(cen, cam, {'x': -99999, 'cor': M.bgr(255, 196, 130), 'forca': 0.6})
    for k, i in enumerate(CLIENTES):
        t0 = chegadas[k] + 0.05
        q = M.entrada_queda(lt, t0, altura=650)
        if q is None:
            continue
        dy, sx, sy = q
        st = idle(i, t)
        st.update(sx=st['sx'] * sx, sy=st['sy'] * sy, dy=dy)
        if P[i].m.get('braco') and lt > t0 + 0.4:
            st['braco'] = 8 * math.sin(2 * math.pi * 1.4 * (lt - t0 - 0.4)) * math.exp(-(lt - t0 - 0.4) * 0.5)
        sc.ator(i, par[k]['x'], par[k]['topo_y'], st, alt=ALTURA * 0.92)
    sc.render(frame)
    sc.track['paradas'] = [list(map(lambda v: round(v, 1), cen.tela(cam, p['x'], p['topo_y']))) for p in par]
    return sc.track


def plano_cockpit(t, frame):
    cen = CENS['cockpit']
    s = secao('cockpit')
    lt = t - s['de']
    u = lt / (s['ate'] - s['de'])
    piso = cen.meta['piso_y']
    cx0 = cen.tam[0] / 2
    cam = (cx0, piso - 520, 1.0 + 0.07 * M.ease_io(u))
    sc = Cena(cen, cam, {'x': cx0, 'cor': M.bgr(120, 220, 255), 'forca': 0.55})
    tv = TL['marcas']['kpi_valor'] - s['de']
    x0, y0, x1, y1 = cen.meta['painel']
    for i, wx, atraso in (('modulo', x0 - 120, 0.0), ('cronos', x1 + 120, 0.1)):
        st = idle(i, t)
        pdy, psx, psy = M.pulo(lt, tv + 0.15 + atraso, 0.45, 90)
        st.update(dy=pdy, sx=st['sx'] * psx, sy=st['sy'] * psy)
        sc.ator(i, wx, piso, st, refl=0.22)
    sc.render(frame)
    p = cen.meta.get('painel_paralaxe', next((c['paralaxe'] for c in cen.meta['camadas'] if 'painel' in c['arquivo']), 1.0))
    Mt = cen.matriz(cam, p)
    sc.track['painel'] = [round(float(Mt[0, 0] * x0 + Mt[0, 2]), 1), round(float(Mt[1, 1] * y0 + Mt[1, 2]), 1),
                          round(float(Mt[0, 0] * x1 + Mt[0, 2]), 1), round(float(Mt[1, 1] * y1 + Mt[1, 2]), 1)]
    return sc.track


def plano_fechamento(t, frame):
    cen = CENS['terraco']
    s = secao('fechamento')
    lt = t - s['de']
    u = lt / (s['ate'] - s['de'])
    cx0 = cen.tam[0] / 2
    piso = cen.meta['piso_y']
    cam = (cx0, piso - 360, 1.02 - 0.08 * M.ease_io(u))
    sc = Cena(cen, cam, LUZ_TERRACO)
    larg = 3000
    tras = PESSOAS
    frente = ['cuidado', 'frasco', 'acelerado', 'modulo', 'cronos', 'campo', 'astro', 'obrinha']
    for n, i in enumerate(tras):
        wx = cx0 - larg / 2 + larg * (n + 0.5) / len(tras)
        st = idle(i, t)
        pdy, psx, psy = M.pulo(lt, 0.35 + 0.07 * ((n * 5) % 12), 0.4, 60)
        st.update(dy=pdy, sx=st['sx'] * psx, sy=st['sy'] * psy)
        sc.ator(i, wx, piso - 200, st, alt=ALTURA * 0.92)
    for n, i in enumerate(frente):
        wx = cx0 - larg * 0.42 + larg * 0.84 * (n + 0.5) / len(frente)
        st = idle(i, t)
        pdy, psx, psy = M.pulo(lt, 0.3 + 0.08 * ((n * 3) % 8), 0.42, 70)
        st.update(dy=pdy, sx=st['sx'] * psx, sy=st['sy'] * psy)
        sc.ator(i, wx, piso, st, refl=0.10)
    sc.render(frame)
    return sc.track


PLANOS = {'parceria': plano_parceria, 'time': plano_time, 'jornada': plano_jornada, 'cockpit': plano_cockpit, 'fechamento': plano_fechamento}
GRADE = {'terraco': ((-3, 0, 6), (8, 3, -5)), 'jornada': ((-2, 1, 5), (6, 3, -4)), 'cockpit': ((4, 2, -2), (-2, 2, 6))}
CEN_DE = {'parceria': 'terraco', 'time': 'terraco', 'jornada': 'jornada', 'cockpit': 'cockpit', 'fechamento': 'terraco'}
ACAB = None


def quadro(i):
    t = i / FPS
    s = next((x for x in TL['secoes'] if x['de'] <= t < x['ate']), TL['secoes'][-1])
    frame = np.zeros((M.H, M.W, 3), np.float32)
    track = PLANOS[s['id']](t, frame)
    if CEN_DE[s['id']] == 'terraco':
        M.poeira(frame, t, 7, n=36, cor=M.bgr(255, 214, 160), forca=0.35)
    frame = ACAB.aplicar(frame, i, GRADE[CEN_DE[s['id']]])
    frame *= min(1.0, t / 0.4) * (1 - M.ease((t - (TL['dur'] - 0.6)) / 0.55))
    cv2.imwrite(os.path.join(B30, 'base', f'f{i:05d}.jpg'), np.clip(frame, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 93])
    track['secao'] = s['id']
    return track


def cmd_quadros(a):
    global ACAB
    os.makedirs(os.path.join(B30, 'base'), exist_ok=True)
    carregar()
    ACAB = M.Acabamento()
    n = int(round(TL['dur'] * FPS))
    ids = list(range(n)) if a.so is None else [int(round(float(x) * FPS)) for x in a.so.split(',')]
    with Pool(a.workers) as pool:
        tracks = pool.map(quadro, ids, chunksize=2)
    if a.so is None:
        json.dump({'fps': FPS, 'dur': TL['dur'], 'quadros': tracks}, open(os.path.join(B30, 'track.json'), 'w'))
    print(f'{len(ids)} quadros em {B30}/base')


def cmd_montar(a):
    out = os.path.join(B30, 'teste30.mp4')
    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', os.path.join(B30, 'base', 'f%05d.jpg'),
           '-framerate', str(FPS), '-i', os.path.join(B30, 'overlay', 'f%05d.png'), '-i', os.path.join(B30, 'mix.wav'),
           '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p[v]', '-map', '[v]', '-map', '2:a',
           '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', str(a.crf), '-tune', 'grain', '-movflags', '+faststart', '-shortest', out]
    subprocess.run(cmd, check=True)
    print(out, f'{os.path.getsize(out) / 1e6:.1f} MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['tempo', 'quadros', 'montar'])
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--so', help='só estes tempos (s), separados por vírgula, para conferir')
    ap.add_argument('--crf', type=int, default=22)
    a = ap.parse_args()
    {'tempo': cmd_tempo, 'quadros': cmd_quadros, 'montar': cmd_montar}[a.cmd](a)
