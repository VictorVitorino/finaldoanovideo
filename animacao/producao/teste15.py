"""Teste de 15 s no novo molde: personagem da folha (estilo longa 3D) com micro-atuação natural.

    python3 producao/teste15.py quadros [--corte build/poc/corte]   # cenário + personagem + câmera
    python3 producao/teste15.py trilha                              # música e efeitos
    node render.mjs frames --test teste15 --layer overlay --out build/teste15/overlay
    python3 producao/teste15.py montar                              # -> build/teste15/teste15.mp4

O personagem nunca troca de desenho dentro do plano. A vida vem de deformações pequenas e
suaves sobre o próprio desenho: respiração, transferência de peso com os pés plantados,
inclinação de cabeça, piscada, braço que assenta depois do gesto (follow-through). A câmera
faz push-in lento sobre um cenário desfocado (profundidade de campo), e os cortes caem no
tempo da música. Textos, logos e etiquetas ficam na camada de sobreposição (src/teste15.js),
que lê as posições da cabeça, do dedo e do polegar em <saida>/track.json.
"""
import argparse
import json
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS = 1920, 1080, 30
DUR = 15.0
BEAT = 60 / 112
CORTES = [0.0, 8 * BEAT, 15 * BEAT, 22 * BEAT, DUR]  # cortes no tempo da música
N = int(DUR * FPS)


def sstep(v, a, b):
    t = np.clip((v - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def ease(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def mola(t, amp, freq, damp):
    """Follow-through amortecido: começa em amp, passa do ponto e assenta em 0."""
    return amp * math.exp(-damp * max(t, 0)) * math.cos(freq * max(t, 0))


def piscada(t, tb):
    d = t - tb
    if d < 0 or d > 0.24:
        return 0.0
    if d < 0.07:
        return ease(d / 0.07)
    if d < 0.10:
        return 1.0
    return 1 - ease((d - 0.10) / 0.14)


def bgr(r, g, b):
    return np.array([b, g, r], np.float32)


# ---------------------------------------------------------------- personagem
class Boneco:
    """Recorte RGBA da folha, guardado em BGRA pré-multiplicado (sem franja escura ao deformar)."""

    def __init__(self, path):
        im = cv2.imread(path, cv2.IMREAD_UNCHANGED).astype(np.float32)
        a = im[..., 3:4] / 255
        im[..., :3] *= a
        self.img = im
        self.orig = cv2.imread(path, cv2.IMREAD_UNCHANGED).astype(np.float32)
        self.h, self.w = im.shape[:2]
        self.gx, self.gy = np.meshgrid(np.arange(self.w, dtype=np.float32), np.arange(self.h, dtype=np.float32))

    def rot(self, cx, cy, ang, mask):
        a = math.radians(ang)
        gx, gy = self.gx, self.gy
        rx = cx + (gx - cx) * math.cos(a) - (gy - cy) * math.sin(a)
        ry = cy + (gx - cx) * math.sin(a) + (gy - cy) * math.cos(a)
        return (rx - gx) * mask, (ry - gy) * mask

    def deformar(self, img, dx, dy):
        return cv2.remap(img, self.gx - dx, self.gy - dy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))

    def pele(self, cx, cy, rx, ry):
        """Cor da pálpebra: a pele mais escura entre logo acima e logo abaixo do olho (dentro da lente)."""
        a = self.orig[int(cy + ry + 2):int(cy + ry + 7), int(cx - 5):int(cx + 5), :3].reshape(-1, 3)
        b = self.orig[int(cy - ry - 3):int(cy - ry), int(cx - 4):int(cx + 4), :3].reshape(-1, 3)
        ma, mb = np.median(a, axis=0), np.median(b, axis=0)
        return (ma if ma.sum() < mb.sum() else mb) * 0.97

    def piscar(self, img, olhos, k):
        if k <= 0.01:
            return img
        out = img.copy()
        for (cx, cy, rx, ry) in olhos:
            x0, x1, y0, y1 = int(cx - rx - 4), int(cx + rx + 5), int(cy - ry - 4), int(cy + ry + 5)
            yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
            u = (xx - cx) / (rx + 1.0)
            half = (ry + 1.0) * np.sqrt(np.clip(1 - u * u, 0, 1))
            top, bot = cy - half, cy + half
            ponta = sstep(1 - np.abs(u), 0, 0.18)
            borda = np.minimum(top + (bot - top) * k + 0.14 * ry * k * (1 - u * u), bot)
            lid = np.clip((borda - yy) / 1.6 + 0.5, 0, 1) * np.clip((yy - top) / 1.6 + 0.6, 0, 1) * ponta
            # pálpebra inferior sobe um pouco
            baixo = np.clip((yy - (bot - (bot - top) * 0.12 * k)) / 1.6 + 0.5, 0, 1) * np.clip((bot - yy) / 1.6 + 0.6, 0, 1) * ponta
            lid = np.maximum(lid, baixo)
            cor = self.pele(cx, cy, rx, ry)
            # volume: o centro da pálpebra pega luz, as bordas e o vinco ficam em sombra
            v = np.clip((yy - top) / np.maximum(borda - top, 1), 0, 1)
            luz = 1.06 - 0.20 * u * u - 0.16 * v - 0.18 * np.exp(-((yy - (top + 2.0)) / 1.6) ** 2)
            roi = out[y0:y1, x0:x1]
            roi[..., :3] = roi[..., :3] * (1 - lid[..., None]) + (cor[None, None, :] * luz[..., None]) * lid[..., None]
            cilio = np.exp(-((yy - borda) / 1.2) ** 2) * ponta * min(1.0, k * 2.5) * np.clip(1.2 - np.abs(u), 0, 1)
            roi[..., :3] = roi[..., :3] * (1 - 0.8 * cilio[..., None]) + bgr(46, 28, 22) * 0.8 * cilio[..., None]
        return out


def sobrepor(frame, spr, x, y):
    """Compõe sprite BGRA pré-multiplicado em (x, y) de um quadro BGR float."""
    h, w = spr.shape[:2]
    X0, Y0 = max(0, int(x)), max(0, int(y))
    X1, Y1 = min(W, int(x) + w), min(H, int(y) + h)
    if X1 <= X0 or Y1 <= Y0:
        return
    s = spr[Y0 - int(y):Y1 - int(y), X0 - int(x):X1 - int(x)]
    a = s[..., 3:4] / 255
    frame[Y0:Y1, X0:X1] = frame[Y0:Y1, X0:X1] * (1 - a) + s[..., :3]


def colocar(frame, img, cam, ax, ay, ox, oy, esc):
    """Coloca a imagem do personagem: o ponto (ox, oy) da imagem vai para (ax, ay) do mundo, escala esc.
    A câmera (cx, cy, z) leva o mundo para a tela. Devolve a função que converte pontos da imagem para a tela."""
    cx, cy, z = cam
    k = esc * z
    sx = (ax - cx) * z + W / 2 - ox * k
    sy = (ay - cy) * z + H / 2 - oy * k
    w, h = max(1, round(img.shape[1] * k)), max(1, round(img.shape[0] * k))
    spr = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA if k < 1 else cv2.INTER_CUBIC)
    # subpixel: o movimento lento da câmera não pode "pular" de pixel em pixel
    fx, fy = sx - math.floor(sx), sy - math.floor(sy)
    spr = cv2.warpAffine(spr, np.float32([[1, 0, fx], [0, 1, fy]]), (w + 2, h + 2), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    spr = np.clip(spr, 0, 255)
    sobrepor(frame, spr, math.floor(sx), math.floor(sy))
    return lambda px, py: (sx + px * k, sy + py * k)


def sombra_chao(frame, cam, ax, ay, larg, forca=0.55):
    cx, cy, z = cam
    x, y = (ax - cx) * z + W / 2, (ay - cy) * z + H / 2
    m = np.zeros((H, W), np.float32)
    cv2.ellipse(m, (int(x), int(y)), (int(larg * z), int(larg * z * 0.09)), 0, 0, 360, 1.0, -1, cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), 10 * z)
    m2 = np.zeros((H, W), np.float32)
    cv2.ellipse(m2, (int(x), int(y + 6)), (int(larg * 1.6 * z), int(larg * 0.22 * z)), 0, 0, 360, 1.0, -1, cv2.LINE_AA)
    m2 = cv2.GaussianBlur(m2, (0, 0), 30 * z)
    frame *= (1 - forca * m - 0.25 * m2)[..., None]


# ---------------------------------------------------------------- cenário
PW, PH = 2880, 1620


def gerar_cenario(seed=11):
    """Escritório no fim de tarde: janelões com a cidade, móveis baixos, piso com reflexo. Tudo desfocado."""
    rng = np.random.default_rng(seed)
    img = np.zeros((PH, PW, 3), np.float32)
    SILL, FLOOR = 880, 990
    # céu
    v = np.linspace(0, 1, SILL)[:, None]
    stops = [(0.0, bgr(20, 26, 46)), (0.40, bgr(58, 52, 78)), (0.72, bgr(196, 118, 84)), (1.0, bgr(255, 178, 102))]
    sky = np.zeros((SILL, 1, 3), np.float32)
    for (a, ca), (b, cb) in zip(stops[:-1], stops[1:]):
        m = ((v >= a) & (v <= b)).astype(np.float32)
        u = np.clip((v - a) / (b - a), 0, 1)
        sky += m[..., None] * (ca * (1 - u[..., None]) + cb * u[..., None])
    img[:SILL] = sky
    # cidade em duas camadas (a de trás mais clara: perspectiva atmosférica)
    for camada, (ymin, ymax, base, luz) in enumerate([(380, 640, (92, 70, 86), 0.22), (520, 800, (40, 36, 52), 0.34)]):
        x = -40
        while x < PW:
            bw = int(rng.uniform(70, 190))
            top = int(rng.uniform(ymin, ymax))
            col = bgr(*base) * rng.uniform(0.85, 1.12)
            cv2.rectangle(img, (x, top), (x + bw, SILL), col.tolist(), -1)
            for wy in range(top + 14, SILL - 10, 22):
                for wx in range(x + 8, x + bw - 10, 16):
                    if rng.random() < luz:
                        c = bgr(255, 196, 120) if rng.random() > 0.15 else bgr(170, 205, 255)
                        cv2.rectangle(img, (wx, wy), (wx + 6, wy + 9), (c * rng.uniform(0.6, 1.0)).tolist(), -1)
            x += bw + int(rng.uniform(0, 30))
    # parede baixa / armários e piso
    img[SILL:FLOOR] = bgr(46, 34, 34)
    fl = np.linspace(0, 1, PH - FLOOR)[:, None, None]
    img[FLOOR:] = bgr(40, 30, 31) * (1 - fl) + bgr(22, 18, 20) * fl
    refl = cv2.flip(img[SILL - 300:SILL], 0)
    k = np.linspace(0.32, 0.0, 300)[:, None, None]
    img[FLOOR:FLOOR + 300] = img[FLOOR:FLOOR + 300] * (1 - k) + refl * k
    # luminárias e telas sobre os armários
    luzes = []
    for lx in range(260, PW, 640):
        luzes.append((lx + 210, SILL - 40, 52, bgr(255, 190, 120), 0.32))
    # caixilhos das janelas
    for mx in range(140, PW, 420):
        cv2.rectangle(img, (mx - 11, 0), (mx + 11, SILL), bgr(14, 15, 22).tolist(), -1)
    cv2.rectangle(img, (0, SILL - 10), (PW, SILL + 10), bgr(18, 18, 24).tolist(), -1)
    cv2.rectangle(img, (0, 60), (PW, 80), bgr(14, 15, 22).tolist(), -1)
    img = cv2.GaussianBlur(img, (0, 0), 11)
    # bokeh: discos das luzes (janelas acesas, luminárias, teto)
    bok = np.zeros_like(img)
    for _ in range(80):
        x, y = rng.uniform(0, PW), rng.uniform(340, SILL - 60)
        r = rng.uniform(10, 34)
        c = bgr(255, 186, 110) if rng.random() > 0.15 else bgr(160, 200, 255)
        a = rng.uniform(0.06, 0.22)
        cv2.circle(bok, (int(x), int(y)), int(r), (c * a).tolist(), -1, cv2.LINE_AA)
        cv2.circle(bok, (int(x), int(y)), int(r), (c * a * 0.6).tolist(), 2, cv2.LINE_AA)
    for (x, y, r, c, a) in luzes:
        cv2.circle(bok, (int(x), int(y)), int(r), (c * a).tolist(), -1, cv2.LINE_AA)
    for x in range(120, PW, 300):
        cv2.circle(bok, (x, 120), 34, (bgr(255, 214, 160) * 0.35).tolist(), -1, cv2.LINE_AA)
    bok = cv2.GaussianBlur(bok, (0, 0), 2.2)
    img = img + bok
    # brilho quente atrás do personagem (luz de recorte)
    yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float32)
    for (gx, gy, r, c, a) in [(1700, 700, 700, bgr(255, 170, 100), 0.30), (900, 640, 600, bgr(120, 150, 255), 0.10)]:
        img += (c * a)[None, None, :] * np.exp(-((xx - gx) ** 2 + (yy - gy) ** 2) / (2 * r * r))[..., None]
    return np.clip(img, 0, 255)


def planta_frente():
    """Folhas desfocadas em primeiro plano (profundidade)."""
    m = np.zeros((700, 700), np.float32)
    rng = np.random.default_rng(3)
    for _ in range(9):
        ang = rng.uniform(-70, 20)
        L = rng.uniform(220, 360)
        cx, cy = 200 + L * 0.5 * math.cos(math.radians(ang)), 600 + L * 0.5 * math.sin(math.radians(ang))
        cv2.ellipse(m, (int(cx), int(cy)), (int(L / 2), int(L / 7)), ang, 0, 360, 1.0, -1, cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), 16)
    spr = np.zeros((700, 700, 4), np.float32)
    a = np.clip(m * 1.1, 0, 0.95)
    spr[..., :3] = bgr(10, 16, 12)[None, None, :] * a[..., None]
    spr[..., 3] = a * 255
    return spr


def fundo(frame, plate, cam, centro, esc, par=0.35):
    """O cenário anda menos que o personagem (paralaxe) e amplia menos com a câmera."""
    cx, cy, z = cam
    zf = esc * (1 + (z - 1) * par)
    ux = centro[0] + (cx - W / 2) * par / esc
    uy = centro[1] + (cy - H / 2) * par / esc
    M = np.float32([[zf, 0, W / 2 - ux * zf], [0, zf, H / 2 - uy * zf]])
    frame[:] = cv2.warpAffine(plate, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


# ---------------------------------------------------------------- acabamento
def acabamento(frame, i):
    small = cv2.resize(frame, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    bright = np.clip(small - 190, 0, None)
    bloom = cv2.resize(cv2.GaussianBlur(bright, (0, 0), 10), (W, H), interpolation=cv2.INTER_LINEAR)
    frame += bloom * 0.45
    frame *= VINHETA[..., None]
    # sombras levemente frias, altas quentes
    lum = frame.mean(axis=2, keepdims=True) / 255
    frame += (1 - lum) * bgr(-2, 0, 5) + lum * bgr(6, 2, -4)
    frame += GRAO[i % len(GRAO)][..., None]
    return frame


# ---------------------------------------------------------------- planos
CORTE = os.path.join(ROOT, 'build', 'poc', 'corte')
SAIDA = os.path.join(ROOT, 'build', 'teste15')
B = {}


def carregar(corte):
    for n in ('hero', 'retrato', 'apontando', 'polegar'):
        B[n] = Boneco(os.path.join(corte, n + '.png'))


def plano1(lt, frame):
    """Plano aberto: Victor parado, mãos no bolso. Respira, transfere o peso, mexe a cabeça, pisca."""
    b = B['hero']
    NECK, WAIST, FEET = (262, 330), 700, 1560
    u = lt / CORTES[1]
    cam = (960 + 60 * ease(u), 540 - 20 * ease(u), 1 + 0.075 * ease(u))
    fundo(frame, PLATE, cam, (1440, 760), 1.0)
    gx, gy = b.gx, b.gy
    resp = math.sin(2 * math.pi * lt / 3.6 + 0.4)
    peso = math.sin(2 * math.pi * lt / 5.2 - 0.9)
    upper = 1 - sstep(gy, WAIST - 60, WAIST + 40)
    dy = -resp * 4.5 * upper * sstep(WAIST - gy, 0, 300)
    dx = resp * 1.8 * upper * np.clip((gx - b.w / 2) / (b.w / 2), -1, 1) * sstep(WAIST - gy, 150, 400)
    perfil = np.interp(gy, [0, NECK[1], WAIST, FEET - 300, FEET - 60], [0.45, 0.5, 1.0, 0.35, 0.0]).astype(np.float32)
    dx += peso * 10 * perfil
    ang = 1.4 * math.sin(2 * math.pi * lt / 3.1 + 0.8) + 0.5 * math.sin(2 * math.pi * lt / 1.9)
    head = 1 - sstep(gy, NECK[1] - 20, NECK[1] + 30)
    rx, ry = b.rot(NECK[0], NECK[1], ang, head)
    src = b.piscar(b.img, [(213, 190, 16, 11.5), (285, 184, 16, 12)], max(piscada(lt, 1.35), piscada(lt, 3.55)))
    img = b.deformar(src, dx + rx, dy + ry)
    sombra_chao(frame, cam, 1250, 1000, 150)
    para_tela = colocar(frame, img, cam, 1250, 1000, b.w / 2, FEET, 0.6)
    sobrepor(frame, PLANTA, -120 - 90 * ease(u), H - 560 + 30 * ease(u))
    p = (262, 40)
    return {'cabeca': para_tela(p[0] + float(dx[p[1], p[0]] + rx[p[1], p[0]]), p[1] + float(dy[p[1], p[0]] + ry[p[1], p[0]]))}


def plano2(lt, frame):
    """Close: o sorriso enorme. A cabeça chega inclinada e assenta; respiração; uma risadinha."""
    b = B['retrato']
    u = lt / (CORTES[2] - CORTES[1])
    cam = (960 - 50 * ease(u), 540 - 30 * ease(u), 1 + 0.06 * ease(u))
    fundo(frame, PLATE2, cam, (2050, 640), 1.7, par=0.25)
    gx, gy = b.gx, b.gy
    PIV = (690, 1130)
    resp = math.sin(2 * math.pi * lt / 3.4 + 1.2)
    ang = mola(lt, 2.6, 4.4, 2.4) + 0.7 * math.sin(2 * math.pi * lt / 2.7 + 0.3)
    ombro = (1 - sstep(gx, 330, 520)) * sstep(gy, 960, 1060)
    head = (1 - sstep(gy, 980, 1110)) * (1 - ombro)
    rx, ry = b.rot(PIV[0], PIV[1], ang, head)
    d = lt - 2.15
    riso = 3.2 * math.exp(-d * 3.5) * abs(math.sin(d * 13)) if d > 0 else 0.0
    dy = -resp * 3.0 - riso * head - riso * 0.35 * (1 - head)
    img = b.deformar(b.img, rx, ry + dy)
    colocar(frame, img, cam, -30, 1120, 0, b.h, 0.72)
    return {}


def plano3(lt, frame):
    """Apontando: o braço chega um pouco baixo, passa do ponto e assenta. O cartão nasce onde ele aponta."""
    b = B['apontando']
    OMBRO, NECK, WAIST = (293, 213), (230, 190), 355
    u = lt / (CORTES[3] - CORTES[2])
    cam = (960 + 40 * ease(u), 540 - 10 * ease(u), 1 + 0.04 * ease(u))
    fundo(frame, PLATE, cam, (980, 760), 1.15)
    gx, gy = b.gx, b.gy
    resp = math.sin(2 * math.pi * lt / 3.4 + 1)
    upper = 1 - sstep(gy, WAIST - 30, WAIST + 30)
    dy = -resp * 2.2 * upper * sstep(WAIST - gy, 0, 160)
    peso = math.sin(2 * math.pi * lt / 4.6 + 0.4)
    dx = peso * 2.5 * np.interp(gy, [0, WAIST, 560, 610], [0.6, 1.0, 0.2, 0.0]).astype(np.float32)
    braco = sstep(gx, 288, 328) * (1 - sstep(gy, 236, 262))
    ang = mola(lt, 6.5, 10.0, 4.0)
    rx, ry = b.rot(OMBRO[0], OMBRO[1], ang, braco)
    head = (1 - sstep(gy, 175, 200)) * (1 - sstep(gx, 270, 290))
    hx, hy = b.rot(NECK[0], NECK[1], 1.1 * math.sin(lt * 2.3) - mola(lt, 1.5, 6, 3), head)
    img = b.deformar(b.img, dx + rx + hx, dy + ry + hy)
    sombra_chao(frame, cam, 560, 972, 150)
    para_tela = colocar(frame, img, cam, 560, 972, b.w / 2, 632, 1.2)
    p = (566, 160)
    return {'dedo': para_tela(p[0] + float(dx[p[1], p[0]] + rx[p[1], p[0]]), p[1] + float(dy[p[1], p[0]] + ry[p[1], p[0]]))}


MAO = None


def plano4(lt, frame):
    """Joinha: o antebraço chega e assenta no cotovelo; a cabeça acompanha. Câmera abre para o título."""
    global MAO
    b = B['polegar']
    COTOVELO, NECK, WAIST = (62, 300), (195, 190), 380
    if MAO is None:
        m = np.zeros((b.h, b.w), np.float32)
        cv2.fillPoly(m, [np.array([(70, 120), (120, 118), (140, 190), (138, 252), (112, 272), (78, 304), (40, 304), (50, 250)], np.int32)], 1.0)
        MAO = cv2.GaussianBlur(m, (0, 0), 7)
    u = lt / (CORTES[4] - CORTES[3])
    cam = (930 + 30 * ease(u), 540, 1.06 - 0.06 * ease(u))
    fundo(frame, PLATE, cam, (1880, 760), 1.15)
    gx, gy = b.gx, b.gy
    resp = math.sin(2 * math.pi * lt / 3.4 + 0.2)
    upper = 1 - sstep(gy, WAIST - 30, WAIST + 30)
    dy = -resp * 2.2 * upper * sstep(WAIST - gy, 0, 180)
    ang = mola(lt, 7.0, 11.0, 4.2)
    rx, ry = b.rot(COTOVELO[0], COTOVELO[1], ang, MAO)
    head = 1 - sstep(gy, 178, 202)
    hx, hy = b.rot(NECK[0], NECK[1], -mola(lt - 0.05, 2.0, 7, 3.2) + 0.9 * math.sin(lt * 2.1), head * (1 - MAO))
    img = b.deformar(b.img, rx + hx, dy + ry + hy)
    sombra_chao(frame, cam, 640, 968, 120)
    para_tela = colocar(frame, img, cam, 640, 968, b.w / 2, 632, 1.2)
    sobrepor(frame, PLANTA_D, W - 560 + 60 * ease(u), H - 600)
    p = (96, 146)
    return {'polegar': para_tela(p[0] + float(rx[p[1], p[0]]), p[1] + float(dy[p[1], p[0]] + ry[p[1], p[0]])),
            'cabeca': para_tela(190, 45)}


PLANOS = [plano1, plano2, plano3, plano4]


def quadro(i):
    t = i / FPS
    k = max(j for j in range(4) if t >= CORTES[j])
    lt = t - CORTES[k]
    frame = np.zeros((H, W, 3), np.float32)
    info = PLANOS[k](lt, frame)
    frame = acabamento(frame, i)
    # entrada e saída em preto
    frame *= min(1.0, t / 0.35) * (1 - ease((t - 14.45) / 0.5))
    cv2.imwrite(os.path.join(SAIDA, 'base', f'f{i:05d}.jpg'), np.clip(frame, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 93])
    info = {k2: [round(v[0], 1), round(v[1], 1)] for k2, v in info.items()}
    info['plano'] = k + 1
    return info


def preparar(corte):
    global PLATE, PLATE2, PLANTA, PLANTA_D, VINHETA, GRAO
    carregar(corte)
    PLATE = gerar_cenario()
    PLATE2 = cv2.GaussianBlur(PLATE, (0, 0), 12)
    PLANTA = planta_frente()
    PLANTA_D = cv2.flip(PLANTA, 1)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r2 = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
    VINHETA = (1 - 0.32 * np.clip(r2 / 2, 0, 1) ** 1.2).astype(np.float32)
    rng = np.random.default_rng(5)
    GRAO = [cv2.GaussianBlur(rng.normal(0, 5.0, (H, W)).astype(np.float32), (0, 0), 0.6) for _ in range(6)]


def cmd_quadros(a):
    os.makedirs(os.path.join(SAIDA, 'base'), exist_ok=True)
    preparar(a.corte)
    ids = list(range(N)) if a.so is None else [int(round(float(x) * FPS)) for x in a.so.split(',')]
    with Pool(a.workers) as pool:
        infos = pool.map(quadro, ids, chunksize=4)
    if a.so is None:
        json.dump({'fps': FPS, 'dur': DUR, 'cortes': CORTES, 'quadros': infos}, open(os.path.join(SAIDA, 'track.json'), 'w'))
    print(f'{len(ids)} quadros em {SAIDA}/base')


# ---------------------------------------------------------------- trilha
def cmd_trilha(a):
    sys.path.insert(0, os.path.join(ROOT, 'audio'))
    import gerar_trilha as T
    import wave
    mus = T.Mix(DUR)
    BAR = T.BAR
    T.theme_section(mus, 0, 2 * BAR, full=False, drums=False, start_bar=0, mel_gain=0.24)
    T.theme_section(mus, 2 * BAR, 6 * BAR, full=True, drums=True, start_bar=4, mel_gain=0.30)
    fim = 6 * BAR
    notes, root = T.CH['F']
    mus.add(T.brass(notes + [65], 2.1), fim, 0.26, -0.2)
    mus.add(T.pad(notes, 2.2, 0.05, 0.8), fim, 0.16, 0.1)
    mus.add(T.bass(root, 1.6), fim, 0.6)
    mus.add(T.timpani(41, 1.8), fim, 0.7)
    for j, m in enumerate([77, 81, 84, 89]):
        mus.add(T.celesta(m, 1.2, 0.8), fim + 0.12 + j * 0.09, 0.22, 0.2)
    mus.L, mus.R = T.reverb(mus.L, wet=0.24, seed=3), T.reverb(mus.R, wet=0.24, seed=4)
    fx = T.Mix(DUR)
    for t, fn, g in [(CORTES[1] - 0.12, T.fx_whoosh, 0.25), (CORTES[2] - 0.12, T.fx_whoosh, 0.3),
                     (8.45, T.fx_pop, 0.5), (10.05, T.fx_pop, 0.5), (12.02, T.fx_ting, 0.8), (12.05, T.fx_sparkle, 0.5),
                     (12.9, T.fx_shine, 0.45)]:
        fx.add(fn(), t, g, float(np.clip(math.sin(t * 1.7) * 0.3, -0.3, 0.3)))
    fx.L, fx.R = T.reverb(fx.L, 0.8, 0.1, 5), T.reverb(fx.R, 0.8, 0.1, 6)
    n = int(DUR * T.SR)
    L, R = (mus.L * 0.6 + fx.L * 0.7)[:n], (mus.R * 0.6 + fx.R * 0.7)[:n]
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-9)
    L, R = [np.tanh(c / peak * 1.15) / np.tanh(1.15) * 0.89 for c in (L, R)]
    f0, f1 = int(0.05 * T.SR), int(0.6 * T.SR)
    for c in (L, R):
        c[:f0] *= np.linspace(0, 1, f0)
        c[-f1:] *= np.linspace(1, 0, f1) ** 1.5
    os.makedirs(SAIDA, exist_ok=True)
    with wave.open(os.path.join(SAIDA, 'trilha.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(T.SR)
        w.writeframes((np.stack([L, R], axis=1) * 32767).astype('<i2').tobytes())
    print(os.path.join(SAIDA, 'trilha.wav'))


def cmd_montar(a):
    out = os.path.join(SAIDA, 'teste15.mp4')
    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', os.path.join(SAIDA, 'base', 'f%05d.jpg'),
           '-framerate', str(FPS), '-i', os.path.join(SAIDA, 'overlay', 'f%05d.png'), '-i', os.path.join(SAIDA, 'trilha.wav'),
           '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p[v]', '-map', '[v]', '-map', '2:a',
           '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'grain', '-movflags', '+faststart', '-shortest', out]
    subprocess.run(cmd, check=True)
    print(out, f'{os.path.getsize(out) / 1e6:.1f} MB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['quadros', 'trilha', 'montar'])
    ap.add_argument('--corte', default=CORTE)
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--so', help='só estes tempos (s), separados por vírgula, para conferir')
    a = ap.parse_args()
    {'quadros': cmd_quadros, 'trilha': cmd_trilha, 'montar': cmd_montar}[a.cmd](a)
