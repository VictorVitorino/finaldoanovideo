"""Filme "Projeto do Ano — Parceria A&M + TOTVS" no modelo de explainer do SpecForge.

Roteiro: docs/roteiro-storyboard-ae-srt.md (falas preservadas). Três camadas com a mesma câmera:
  fundo     papel, blobs, props (SVG: src/sf/filme.js, layer=fundo)
  atores    personagens chibi 3D com micro-atuação (Python: motor30.py)
  overlay   balões de logo, cartões, adesivos, legendas (SVG: src/sf/filme.js, layer=overlay)

    python3 producao/vozes_filme.py              # falas -> build/filme/vozes
    python3 producao/filme.py tempo              # planos, falas e efeitos -> build/filme/timeline.json
    python3 producao/filme.py rastro             # posição de cada personagem por quadro -> track.json
    node render.mjs frames --test filme --layer fundo --out build/filme/fundo
    python3 producao/filme.py quadros            # fundo + personagens -> build/filme/base
    node render.mjs frames --test filme --layer overlay --out build/filme/overlay
    python3 producao/trilha_filme.py             # música + efeitos + vozes -> build/filme/mix.wav
    python3 producao/filme.py montar             # -> build/filme/projeto-do-ano-specforge.mp4

Quem é quem: producao/elenco_filme.json liga cada nome do roteiro a uma foto (foto1..foto13) ou
a uma folha nova. Enquanto um nome não tem foto confirmada, aparece como silhueta com as iniciais
(nunca chutamos quem é quem).
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
BF = os.path.join(ROOT, 'build', 'filme')
FPS = 30
CHAO = 840
BEAT = 60 / 112

NOMES = {
    'antonialli': 'Guilherme Antonialli', 'bruno': 'Bruno Moraes', 'jose': 'José Aires', 'nara': 'Nara Martins',
    'marcos': 'Marcos Massao Iwata', 'thauany': 'Thauany Moreira', 'joao': 'João Lopes', 'mancini': 'Marcus Mancini',
    'jaqueline': 'Jaqueline Valdevino', 'giovanna': 'Giovanna Brandão', 'pedro': 'Pedro Lanzetta', 'monica': 'Monica Audrey',
    'vinicius': 'Vinicius de Sousa', 'paladini': 'Paladini', 'quintao': 'Fabio Quintão', 'sampaio': 'Sampaio',
}
TIME13 = ['bruno', 'jose', 'nara', 'marcos', 'thauany', 'joao', 'mancini', 'jaqueline', 'giovanna', 'pedro', 'monica', 'vinicius', 'antonialli']
MASCOTES = {'modulo': 'totvs', 'cronos': 'alvarez-marsal', 'cuidado': 'unimed', 'frasco': 'funed', 'acelerado': 'caoa',
            'campo': 'john-deere', 'conectado': 'hughes', 'obrinha': 'libercon'}
PROJETOS = [
    {'n': '01', 'cliente': 'UNIMED BRASIL', 'frente': 'Remediação', 'erp': 'ERP Protheus', 'logo': 'unimed', 'mascote': 'cuidado', 'lugar': 'hospital', 'time': ['bruno'], 'fala': 'c3_n1', 'dur': 6.0},
    {'n': '02', 'cliente': 'FUNED', 'frente': 'TMO + GMO', 'erp': 'ERP Protheus', 'logo': 'funed', 'mascote': 'frasco', 'lugar': 'laboratorio', 'time': ['jose', 'nara'], 'fala': 'c3_n2', 'dur': 6.4},
    {'n': '03', 'cliente': 'CAOA', 'frente': 'Remediação', 'erp': 'ERP Protheus', 'logo': 'caoa', 'mascote': 'acelerado', 'lugar': 'fabrica', 'time': ['marcos', 'thauany'], 'fala': 'c3_n3', 'dur': 5.2},
    {'n': '04', 'cliente': 'JOHN DEERE ARGENTINA', 'frente': 'Remediação', 'erp': 'ERP Protheus', 'logo': 'john-deere', 'mascote': 'campo', 'lugar': 'fazenda', 'time': ['joao', 'mancini', 'jaqueline'], 'fala': 'c3_n4', 'dur': 6.2},
    {'n': '05', 'cliente': 'HUGHES', 'frente': 'TMO + GMO', 'erp': 'ERP Protheus', 'logo': 'hughes', 'mascote': 'conectado', 'lugar': 'estacao', 'time': ['giovanna', 'pedro'], 'fala': 'c3_n5', 'dur': 5.4},
    {'n': '06', 'cliente': 'LIBERCON', 'frente': 'TMO + GMO', 'erp': 'ERP RM', 'logo': 'libercon', 'mascote': 'obrinha', 'lugar': 'obra', 'time': ['monica'], 'fala': 'c3_n6', 'dur': 5.6},
]


def acima(t):
    return math.ceil(t / BEAT - 1e-6) * BEAT


# ---------------------------------------------------------------- timeline
class Linha:
    def __init__(self, vozes):
        self.v = {f['id']: f for f in vozes['falas']}
        self.t = 0.0
        self.planos, self.falas, self.sfx, self.musica = [], [], [], []

    def plano(self, pid, cena, dur, **kw):
        p = dict(id=pid, cena=cena, de=round(self.t, 3), ate=round(self.t + dur, 3), **kw)
        self.planos.append(p)
        self.t += dur
        return p

    def fala(self, fid, t):
        f = self.v[fid]
        self.falas.append({'id': fid, 'quem': f['quem'], 'texto': f['texto'], 'de': round(t, 3), 'ate': round(t + f['dur'], 3)})
        return t + f['dur']

    def d(self, fid):
        return self.v[fid]['dur']

    def efeito(self, t, s, ganho=None):
        e = {'t': round(t, 3), 's': s}
        if ganho is not None:
            e['ganho'] = ganho
        self.sfx.append(e)


def cmd_tempo(a):
    L = Linha(json.load(open(os.path.join(BF, 'vozes', 'vozes.json'))))
    d = L.d

    # ---------------- CENA 1 — o desafio (papel noturno)
    L.musica.append({'estilo': 'tensao', 'de': 0.0})
    p = L.plano('1a', 1, 1.9, tom='noite')
    for k in range(7):
        L.efeito(p['de'] + 0.15 + k * 0.24 * (1 - k * 0.07), 'ping', 0.25 + 0.06 * k)
    L.efeito(p['de'] + 0.5, 'ring', 0.45)
    for pid, txt, dur in (('1b', 'ESCOPO SUBDIMENSIONADO.', 1.35), ('1c', 'REWORK.', 1.1), ('1d', 'MAPEAMENTO DE PROCESSOS DESALINHADO', 1.6), ('1e', 'GO-LIVE ADIADO.', 1.35)):
        p = L.plano(pid, 1, dur, tom='noite', texto=txt)
        L.efeito(p['de'], 'slam', 0.55)
    p = L.plano('1f', 1, 1.1, tom='noite')  # silêncio repentino
    L.musica.append({'estilo': 'silencio', 'de': p['de']})
    p = L.plano('1g', 1, 0.45 + d('c1_n1') + 0.35 + d('c1_n2') + 0.5, tom='creme')
    t = L.fala('c1_n1', p['de'] + 0.45)
    p['marcas'] = {'pergunta': t + 0.35}
    L.fala('c1_n2', t + 0.35)
    L.musica.append({'estilo': 'suave', 'de': p['de'] + 0.2})
    p = L.plano('1h', 1, 2.3 + d('c1_n3') + 0.7, tom='creme', texto='Toda parceria tem um começo.')
    L.fala('c1_n3', p['de'] + 2.3)
    p['marcas'] = {'cresce': p['de'] + 2.3 + d('c1_n3') * 0.62}
    L.efeito(p['ate'] - 0.2, 'whoosh', 0.5)

    # ---------------- CENA 2 — a parceria e a liderança
    L.musica.append({'estilo': 'tema', 'de': acima(L.t)})
    p = L.plano('2fase', 2, 1.5, tom='creme', fase={'num': '01', 'parte': 'PARTE 1', 'titulo': 'A parceria', 'icone': 'aperto'})
    L.efeito(p['de'] + 0.1, 'whoosh', 0.4)
    p = L.plano('2a', 2, 0.5 + d('c2_n1') + 0.3 + d('c2_n2') + 1.5, tom='creme')
    t = L.fala('c2_n1', p['de'] + 0.5)
    t2 = L.fala('c2_n2', t + 0.3)
    p['marcas'] = {'modulo': p['de'] + 0.15, 'cronos': t + 0.0, 'encontro': t2 + 0.15}
    L.efeito(p['de'] + 1.0, 'pop'), L.efeito(t + 0.85, 'pop'), L.efeito(t2 + 0.15, 'sparkle')
    p = L.plano('2b', 2, 1.3 + d('c2_n3') + 0.3 + d('c2_n4') + 0.3 + d('c2_n5') + 0.6, tom='creme')
    t = L.fala('c2_n3', p['de'] + 1.3)
    p['marcas'] = {'cartao': p['de'] + 0.4, 'fazedora': t - d('c2_n3') * 0.30, 'adaptavel': t - d('c2_n3') * 0.08}
    t = L.fala('c2_n4', t + 0.3)
    p['marcas']['executivos'] = t - d('c2_n4') * 0.7
    t = L.fala('c2_n5', t + 0.3)
    p['marcas']['jogo'] = t - d('c2_n5') * 0.5
    for k in range(13):
        L.efeito(p['de'] + 0.35 + 0.09 * k, 'pop', 0.18)
    L.efeito(p['marcas']['fazedora'], 'pop', 0.5), L.efeito(p['marcas']['adaptavel'], 'pop', 0.5), L.efeito(p['marcas']['jogo'], 'ting', 0.6)
    p = L.plano('2d', 2, 3.2, tom='creme')
    p['marcas'] = {'palavras': [p['de'] + 0.2, p['de'] + 0.8, p['de'] + 1.4, p['de'] + 2.1]}
    for x in p['marcas']['palavras']:
        L.efeito(x, 'pop', 0.45)
    p = L.plano('2e', 2, 0.45 + d('c2_n6') + 0.6, tom='creme')
    L.fala('c2_n6', p['de'] + 0.45)
    L.efeito(p['ate'] - 0.2, 'whoosh', 0.5)

    # ---------------- CENA 3 — seis projetos
    p = L.plano('3fase', 3, 1.5, tom='bege', fase={'num': '02', 'parte': 'PARTE 2', 'titulo': 'Seis projetos', 'icone': 'pin'})
    for k, pj in enumerate(PROJETOS):
        p = L.plano(f'3p{k + 1}', 3, max(pj['dur'], 0.45 + d(pj['fala']) + 2.0), tom='bege', projeto=k)
        L.fala(pj['fala'], p['de'] + 0.45)
        p['marcas'] = {'cartao': p['de'] + 0.9, 'antes': p['de'] + 2.2, 'depois': p['de'] + 3.4}
        L.efeito(p['de'] + 0.15, f'pluck{k + 1}', 0.8)
        L.efeito(p['de'] + 0.5, 'pop', 0.4)
        L.efeito(p['ate'] - 0.15, 'whoosh', 0.3)
    p = L.plano('3g', 3, 3.4, tom='bege')
    p = L.plano('3h', 3, 4.6, tom='bege')
    p['marcas'] = {'itens': [p['de'] + 0.3 + 0.75 * k for k in range(4)]}
    for x in p['marcas']['itens']:
        L.efeito(x, 'tick', 0.6)

    # ---------------- CENA 4 — o método e a IA
    L.musica.append({'estilo': 'metodo', 'de': acima(L.t)})
    p = L.plano('4fase', 4, 1.5, tom='creme', fase={'num': '03', 'parte': 'PARTE 3', 'titulo': 'O método e a IA', 'icone': 'engrenagem'})
    slides = [('integrada', 'UM TIME. PAPÉIS COMPLEMENTARES.', 'c4_n1'), ('mits', 'CADA MIT COM PRAZO, DONO E RASTREABILIDADE.', 'c4_n2'),
              ('remediacao', 'DO PROJETO PARADO AO GO-LIVE.', 'c4_n3'), ('ia', 'IA EM CADA FASE DO PROJETO.', None)]
    for k, (tipo, txt, fid) in enumerate(slides):
        dur = max(2.9, 0.35 + (d(fid) if fid else 0) + 0.9)
        p = L.plano(f'4s{k + 1}', 4, dur, tom='creme', slide=tipo, texto=txt)
        if fid:
            L.fala(fid, p['de'] + 0.35)
        L.efeito(p['de'] + 0.1, 'whoosh', 0.25)
    p = L.plano('4e', 4, 2.8, tom='creme', texto=['MENOS PPT NA GAVETA.', 'MAIS RESULTADO NO P&L.'])
    L.efeito(p['de'] + 0.2, 'pop', 0.5), L.efeito(p['de'] + 1.3, 'pop', 0.6)
    p = L.plano('4f', 4, 0.8 + d('c4_n4') + 1.2, tom='creme')
    L.fala('c4_n4', p['de'] + 0.8)
    p['marcas'] = {'fecha': p['de'] + 1.0, 'robos': p['de'] + 3.2}
    L.efeito(p['de'] + 1.0, 'whoosh', 0.35), L.efeito(p['de'] + 3.2, 'robots', 0.5)

    # ---------------- CENA 5 — resultado no P&L e a NF
    L.musica.append({'estilo': 'triunfo', 'de': acima(L.t)})
    p = L.plano('5fase', 5, 1.5, tom='dourado', fase={'num': '04', 'parte': 'PARTE 4', 'titulo': 'Resultado no P&L', 'icone': 'moeda'})
    p = L.plano('5a', 5, 0.4 + d('c5_n1') + 0.25 + d('c5_n2') + 1.3, tom='dourado')
    t = L.fala('c5_n1', p['de'] + 0.4)
    t = L.fala('c5_n2', t + 0.25)
    p['marcas'] = {'numero': p['de'] + 0.6}
    L.efeito(p['de'] + 0.6, 'riser', 0.4), L.efeito(t - 0.2, 'hit', 0.8)
    p = L.plano('5b', 5, 2.7, tom='dourado')
    L.efeito(p['de'] + 0.3, 'shine', 0.5)
    p = L.plano('5c', 5, 0.3 + d('c5_n3') + 0.25 + d('c5_n4') + 0.7, tom='dourado')
    t = L.fala('c5_n3', p['de'] + 0.3)
    L.fala('c5_n4', t + 0.25)
    p['marcas'] = {'cresce': t + 0.25}
    p = L.plano('5d', 5, 2.1, tom='creme', texto='MAS TEM UM DETALHE…')
    L.musica.append({'estilo': 'silencio', 'de': p['de']})
    L.efeito(p['de'], 'record_stop', 0.8)
    p = L.plano('5e', 5, 2.0, tom='creme')  # Giovanna anda rápido com o celular
    L.fala('c5_g1', p['de'] + 0.9)
    L.musica.append({'estilo': 'suspense', 'de': p['de'] + 0.1})
    L.efeito(p['de'] + 0.1, 'steps_fast', 0.6)
    p = L.plano('5f', 5, 0.5 + d('c5_g2') + 0.5, tom='creme')  # Paladini assustada
    L.fala('c5_g2', p['de'] + 0.5)
    L.efeito(p['de'] + 0.1, 'startle', 0.6)
    p = L.plano('5g', 5, 0.35 + d('c5_p1') + 2.6, tom='creme')
    t = L.fala('c5_p1', p['de'] + 0.35)
    p['marcas'] = {'scratch': t + 0.15}
    L.musica.append({'estilo': 'silencio', 'de': t + 0.1})
    L.efeito(t + 0.15, 'scratch', 0.9)
    L.musica.append({'estilo': 'alegria', 'de': t + 0.7})
    p = L.plano('5h', 5, 0.3 + d('c5_a1') + 0.25 + d('c5_a2') + 0.5, tom='creme')
    t = L.fala('c5_a1', p['de'] + 0.3)
    L.fala('c5_a2', t + 0.25)
    p = L.plano('5i', 5, 1.5 + d('c5_gb') + 0.6, tom='creme')
    L.efeito(p['de'] + 0.2, 'dial', 0.5)
    L.fala('c5_gb', p['de'] + 1.5)
    p['marcas'] = {'comemora': p['de'] + 1.5}
    L.efeito(p['de'] + 1.5, 'confetti', 0.5)
    p = L.plano('5j', 5, 0.3 + d('c5_a3') + 2.0, tom='creme')
    L.musica.append({'estilo': 'espiao', 'de': p['de']})
    t = L.fala('c5_a3', p['de'] + 0.3)
    p['marcas'] = {'missao': t - 0.6, 'cabelo': t + 0.5}
    L.efeito(t - 0.6, 'slam', 0.6), L.efeito(t + 0.5, 'ting', 0.8)

    # ---------------- CENA 6 — fechamento
    L.musica.append({'estilo': 'final', 'de': acima(L.t)})
    p = L.plano('6a', 6, 3.6, tom='creme')
    p['marcas'] = {'logos': [p['de'] + 0.2 + 0.55 * k for k in range(6)]}
    for k, x in enumerate(p['marcas']['logos']):
        L.efeito(x, f'pluck{k + 1}', 0.6)
    p = L.plano('6c', 6, 0.4 + d('c6_a1') + 0.3 + d('c6_a2') + 0.3 + d('c6_a3') + 0.5, tom='creme')
    t = L.fala('c6_a1', p['de'] + 0.4)
    t = L.fala('c6_a2', t + 0.3)
    p['marcas'] = {'numeros': t - d('c6_a2') * 0.75}
    L.fala('c6_a3', t + 0.3)
    p = L.plano('6d', 6, 0.4 + d('c6_n1') + 0.3 + d('c6_n2') + 1.6, tom='creme')
    t = L.fala('c6_n1', p['de'] + 0.4)
    L.fala('c6_n2', t + 0.3)
    p['marcas'] = {'frase': t + 0.3}
    for k in range(13):
        L.efeito(p['de'] + 0.2 + 0.08 * k, 'pop', 0.15)
    p = L.plano('6e', 6, 3.2, tom='creme')
    L.efeito(p['de'] + 0.3, 'shine', 0.6)
    L.musica.append({'estilo': 'silencio', 'de': p['ate'] - 0.8})
    p = L.plano('6f', 6, 0.6 + d('c6_g1') + 1.1 + d('c6_g2') + 0.45 + 1.7, tom='creme')
    t = L.fala('c6_g1', p['de'] + 0.6)
    t = L.fala('c6_g2', t + 1.1)
    p['marcas'] = {'corte': t + 0.45}
    L.efeito(t + 0.5, 'ting', 0.8)

    tl = {'dur': round(L.t, 3), 'fps': FPS, 'chao': CHAO, 'planos': L.planos, 'falas': L.falas,
          'sfx': sorted(L.sfx, key=lambda e: e['t']), 'musica': L.musica, 'projetos': PROJETOS, 'nomes': NOMES}
    json.dump(tl, open(os.path.join(BF, 'timeline.json'), 'w'), indent=1, ensure_ascii=False)
    cenas = {}
    for p in L.planos:
        cenas.setdefault(p['cena'], [p['de'], p['ate']])[1] = p['ate']
    print('\n'.join(f'cena {c}: {v[0]:6.1f} – {v[1]:6.1f}  ({v[1] - v[0]:.1f} s)' for c, v in cenas.items()))
    print(f'total {L.t:.1f} s, {len(L.planos)} planos, {len(L.falas)} falas')


# ---------------------------------------------------------------- personagens
def fazer_silhueta(marcos):
    """Silhueta genérica (média das 13 fotos alinhadas pelos pés): quem ainda não tem foto confirmada."""
    H, Wd = 900, 700
    acc = np.zeros((H + 40, Wd), np.float32)
    n = 0
    for i in range(1, 14):
        m = marcos.get(f'foto{i}')
        if not m:
            continue
        im = cv2.imread(os.path.join(BF, 'corte', m['arquivo']), cv2.IMREAD_UNCHANGED)
        a = im[..., 3].astype(np.float32) / 255
        alt = m['pes_y'] - m['topo'][1]
        k = H / alt
        M2 = np.float32([[k, 0, Wd / 2 - m['centro_x'] * k], [0, k, 20 - m['topo'][1] * k]])
        acc += cv2.warpAffine(a, M2, (Wd, H + 40))
        n += 1
    a = cv2.GaussianBlur(acc / max(n, 1), (0, 0), 6)
    a = np.clip((a - 0.45) * 8, 0, 1)
    yy, xx = np.mgrid[0:H + 40, 0:Wd].astype(np.float32)
    luz = 1 - 0.18 * np.clip(((xx - Wd * 0.42) ** 2 + (yy - H * 0.3) ** 2) ** 0.5 / (H * 0.7), 0, 1)
    cor = np.array([216, 204, 200], np.float32)  # BGR: lilás-acinzentado
    borda = np.clip(a - cv2.erode(a, np.ones((9, 9), np.uint8)), 0, 1)
    rgb = cor[None, None, :] * luz[..., None] * (1 - 0.35 * borda[..., None])
    out = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    cv2.imwrite(os.path.join(BF, 'corte', 'silhueta.png'), out)
    return {'arquivo': 'silhueta.png', 'w': Wd, 'h': H + 40, 'pes_y': 20 + H, 'centro_x': Wd / 2, 'topo': [Wd / 2, 20],
            'pescoco': [Wd / 2, 20 + H * 0.56], 'piscar': False}


def marcos_todos():
    import direcao_filme as D
    mf = json.load(open(os.path.join(ROOT, 'producao', 'marcos_filme.json')))
    if not os.path.exists(os.path.join(BF, 'corte', 'silhueta.png')) or 'silhueta' not in mf:
        mf['silhueta'] = fazer_silhueta(mf)
    D.MARCAS_SPR.update(mf)
    return mf


def cmd_rastro(a):
    import direcao_filme as D
    tl = json.load(open(os.path.join(BF, 'timeline.json')))
    D.carregar(tl)
    marcos_todos()
    n = int(round(tl['dur'] * FPS))
    q = [D.quadro(i / FPS) for i in range(n)]
    json.dump({'fps': FPS, 'dur': tl['dur'], 'quadros': q}, open(os.path.join(BF, 'track.json'), 'w'))
    print(f'track.json: {n} quadros; elenco confirmado: {D.ELENCO or "nenhum (silhuetas)"}')


TRACK = None
P = {}
MF = None
ACAB = None


class AcabamentoPapel(M.Acabamento):
    def __init__(self):
        super().__init__()
        self.vinheta = 1 - (1 - self.vinheta) * 0.3
        self.grao = [g * 0.45 for g in self.grao]


def quadro_base(i):
    q = TRACK['quadros'][i]
    fundo = cv2.imread(os.path.join(BF, 'fundo', f'f{i:05d}.jpg'))
    frame = fundo.astype(np.float32) if fundo is not None else np.full((M.H, M.W, 3), 236, np.float32)
    for a in sorted(q['atores'], key=lambda a: a['chao']):
        sid = a['spr']
        if sid not in P:
            m = MF[sid]
            P[sid] = M.Personagem(os.path.join(BF, 'corte', m['arquivo']), m)
        r = P[sid].sprite(dict(a['st'], x=a['x'], y=a['y'], k=a['k']))
        if r is None:
            continue
        spr, x0, y0 = r
        if a.get('painel'):  # tela dividida: o personagem só aparece no seu painel
            px0, py0, px1, py1 = a['painel']
            h, w = spr.shape[:2]
            xs = np.arange(w)[None, :] + x0
            ys = np.arange(h)[:, None] + y0
            spr = spr * ((xs >= px0) & (xs < px1) & (ys >= py0) & (ys < py1))[..., None]
        M.sombra(frame, a['x'], a['chao'], spr.shape[1] * 0.40, forca=0.26, altura=max(0.0, a['chao'] - a['y']))
        M.compor(frame, spr, x0, y0)
    frame = ACAB.aplicar(frame, i, None, bloom=0.0)
    t = i / FPS
    frame *= min(1.0, t / 0.25) * (1 - M.ease((t - (TRACK['dur'] - 0.4)) / 0.35))
    cv2.imwrite(os.path.join(BF, 'base', f'f{i:05d}.jpg'), np.clip(frame, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])


def cmd_quadros(a):
    global TRACK, MF, ACAB
    MF = marcos_todos()
    TRACK = json.load(open(os.path.join(BF, 'track.json')))
    ACAB = AcabamentoPapel()
    os.makedirs(os.path.join(BF, 'base'), exist_ok=True)
    n = len(TRACK['quadros'])
    ids = list(range(n)) if a.so is None else [int(round(float(x) * FPS)) for x in a.so.split(',')]
    with Pool(a.workers) as pool:
        pool.map(quadro_base, ids, chunksize=8)
    print(f'{len(ids)} quadros em {BF}/base')


def cmd_montar(a):
    out = os.path.join(BF, 'projeto-do-ano-specforge.mp4')
    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', os.path.join(BF, 'base', 'f%05d.jpg'),
           '-framerate', str(FPS), '-i', os.path.join(BF, 'overlay', 'f%05d.png'), '-i', os.path.join(BF, 'mix.wav'),
           '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p[v]', '-map', '[v]', '-map', '2:a',
           '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '160k',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', str(a.crf), '-movflags', '+faststart', '-shortest', out]
    subprocess.run(cmd, check=True)
    print(out, f'{os.path.getsize(out) / 1e6:.1f} MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['tempo', 'rastro', 'quadros', 'montar'])
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--so', help='só estes tempos (s), separados por vírgula')
    ap.add_argument('--crf', type=int, default=22)
    a = ap.parse_args()
    {'tempo': cmd_tempo, 'rastro': cmd_rastro, 'quadros': cmd_quadros, 'montar': cmd_montar}[a.cmd](a)
