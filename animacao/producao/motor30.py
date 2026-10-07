"""Motor de renderização 2,5D do teste de 30 s: cenários em camadas com paralaxe, personagens
recortados com micro-atuação (respiração, pulinho com squash & stretch, balanço, cabeça,
piscada, aceno), luz de recorte, reflexo no piso, sombra de contato e acabamento de câmera.

Usado por producao/teste30.py. Convenções:
  - "mundo" = pixels do painel do cenário (camada de paralaxe 1.0); câmera (cx, cy, z) em mundo.
  - Sprites em BGRA float32 pré-multiplicado.
"""
import json
import math
import os

import cv2
import numpy as np

W, H = 1920, 1080


def sstep(v, a, b):
    t = np.clip((v - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def ease(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def ease_out(u):
    u = min(1.0, max(0.0, u))
    return 1 - (1 - u) ** 3


def ease_io(u):
    u = min(1.0, max(0.0, u))
    return 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2


def mola(t, amp, freq, damp):
    """Follow-through amortecido: começa em amp, passa do ponto e assenta em 0."""
    t = max(t, 0.0)
    return amp * math.exp(-damp * t) * math.cos(freq * t)


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


def premult(im):
    im = im.astype(np.float32)
    im[..., :3] *= im[..., 3:4] / 255
    return im


# ---------------------------------------------------------------- cenário
class Cenario:
    """Camadas RGBA do mesmo tamanho; a de paralaxe 1.0 define o mundo."""

    def __init__(self, pasta, nome):
        self.meta = json.load(open(os.path.join(pasta, nome + '.json')))
        self.tam = tuple(self.meta['tamanho'])
        self.camadas = []
        for c in self.meta['camadas']:
            arq = c['arquivo']
            if not os.path.isabs(arq):
                cand = [os.path.join(pasta, nome, arq), os.path.join(pasta, arq)]
                arq = next((x for x in cand if os.path.exists(x)), cand[0])
            im = cv2.imread(arq, cv2.IMREAD_UNCHANGED)
            if im.shape[2] == 3:
                im = np.dstack([im, np.full(im.shape[:2], 255, np.uint8)])
            pm = im.astype(np.float32)
            pm[..., :3] *= pm[..., 3:4] / 255
            self.camadas.append((np.clip(pm, 0, 255).astype(np.uint8), float(c['paralaxe'])))
        self.base = H / self.tam[1]
        self.ref = (self.tam[0] / 2, self.tam[1] / 2)

    def matriz(self, cam, p):
        cx, cy, z = cam
        zl = self.base * (1 + (z - 1) * p)
        ux = self.ref[0] + (cx - self.ref[0]) * p
        uy = self.ref[1] + (cy - self.ref[1]) * p
        return np.float32([[zl, 0, W / 2 - ux * zl], [0, zl, H / 2 - uy * zl]])

    def desenhar(self, frame, cam, ate=None):
        for i, (img, p) in enumerate(self.camadas):
            if ate is not None and i >= ate:
                break
            M = self.matriz(cam, p)
            lay = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE if i == 0 else cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
            a = lay[..., 3:4].astype(np.float32) / 255
            frame[:] = frame * (1 - a) + lay[..., :3]

    def tela(self, cam, x, y):
        """Ponto do mundo (paralaxe 1.0) → tela."""
        cx, cy, z = cam
        k = self.base * z
        return (x - cx) * k + W / 2, (y - cy) * k + H / 2


# ---------------------------------------------------------------- personagem
class Personagem:
    """Recorte + marcos. Guarda uma pirâmide de resoluções para deformar perto da escala final."""

    def __init__(self, caminho, marcos):
        im = cv2.imread(caminho, cv2.IMREAD_UNCHANGED)
        self.orig = im.astype(np.float32)
        self.m = marcos
        self.h, self.w = im.shape[:2]
        self.niveis = {}
        self.mascara_braco = {}

    def nivel(self, s):
        if s not in self.niveis:
            if s == 1:
                im = premult(self.orig)
            else:
                im = cv2.resize(premult(self.orig), (max(1, round(self.w * s)), max(1, round(self.h * s))), interpolation=cv2.INTER_AREA)
            h, w = im.shape[:2]
            gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
            orig = cv2.resize(self.orig, (w, h), interpolation=cv2.INTER_AREA) if s != 1 else self.orig
            self.niveis[s] = (im, gx, gy, orig)
        return self.niveis[s]

    def cor_palpebra(self, orig, cx, cy, rx, ry):
        if 'cor_palpebra' in self.m:
            return np.array(self.m['cor_palpebra'], np.float32)
        a = orig[int(cy + ry + 2):int(cy + ry + 2 + max(3, ry * 0.4)), int(cx - rx * 0.4):int(cx + rx * 0.4), :3].reshape(-1, 3)
        b = orig[int(cy - ry - max(3, ry * 0.3)):int(cy - ry), int(cx - rx * 0.3):int(cx + rx * 0.3), :3].reshape(-1, 3)
        cands = [np.median(x, axis=0) for x in (a, b) if len(x)]
        if not cands:
            return bgr(230, 170, 140)
        return min(cands, key=lambda c: c.sum()) * 0.97

    def piscar(self, img, orig, s, k):
        if k <= 0.01 or not self.m.get('olhos') or self.m.get('piscar') is False:
            return img
        out = img.copy()
        for (cx, cy, rx, ry) in self.m['olhos']:
            cx, cy, rx, ry = cx * s, cy * s, rx * s, ry * s
            if rx < 1.5 or ry < 1.5:
                continue
            x0, x1 = max(0, int(cx - rx - 4)), min(img.shape[1], int(cx + rx + 5))
            y0, y1 = max(0, int(cy - ry - 4)), min(img.shape[0], int(cy + ry + 5))
            yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
            u = (xx - cx) / (rx + 1.0)
            half = (ry + 1.0) * np.sqrt(np.clip(1 - u * u, 0, 1))
            top, bot = cy - half, cy + half
            ponta = sstep(1 - np.abs(u), 0, 0.18)
            fe = max(1.0, ry * 0.08)
            borda = np.minimum(top + (bot - top) * k + 0.14 * ry * k * (1 - u * u), bot)
            lid = np.clip((borda - yy) / fe + 0.5, 0, 1) * np.clip((yy - top) / fe + 0.6, 0, 1) * ponta
            baixo = np.clip((yy - (bot - (bot - top) * 0.12 * k)) / fe + 0.5, 0, 1) * np.clip((bot - yy) / fe + 0.6, 0, 1) * ponta
            lid = np.maximum(lid, baixo)
            cor = self.cor_palpebra(orig, cx, cy, rx, ry)
            v = np.clip((yy - top) / np.maximum(borda - top, 1), 0, 1)
            luz = 1.06 - 0.20 * u * u - 0.16 * v - 0.18 * np.exp(-((yy - (top + 2.0 * fe)) / (1.6 * fe)) ** 2)
            roi = out[y0:y1, x0:x1]
            roi[..., :3] = roi[..., :3] * (1 - lid[..., None]) + (cor[None, None, :] * luz[..., None]) * lid[..., None]
            cil = np.exp(-((yy - borda) / (1.2 * fe)) ** 2) * ponta * min(1.0, k * 2.5) * np.clip(1.2 - np.abs(u), 0, 1)
            roi[..., :3] = roi[..., :3] * (1 - 0.8 * cil[..., None]) + bgr(46, 28, 22) * 0.8 * cil[..., None]
        return out

    def _mask_braco(self, s, shape):
        if s not in self.mascara_braco:
            b = self.m.get('braco')
            if not b:
                self.mascara_braco[s] = None
            else:
                m = np.zeros(shape, np.float32)
                cv2.fillPoly(m, [(np.array(b['poligono'], np.float32) * s).astype(np.int32)], 1.0)
                self.mascara_braco[s] = cv2.GaussianBlur(m, (0, 0), max(1.0, 7 * s * (self.h / 1000)))
        return self.mascara_braco[s]

    def sprite(self, st):
        """st: x, y (tela, pés), k (px de tela por px do recorte), sx, sy, rot (graus), cabeca (graus),
        piscar (0..1), braco (graus), luz (dict opcional: dir (dx, dy), cor bgr, forca).
        Devolve (sprite BGRA pré-multiplicado, x0, y0) ou None."""
        k = st['k']
        sx, sy = st.get('sx', 1.0), st.get('sy', 1.0)
        alvo = k * max(sx, sy)
        s = 1.0
        while s / 2 >= alvo and s > 0.13:
            s /= 2
        img, gx, gy, orig = self.nivel(s)
        m = self.m
        img = self.piscar(img, orig, s, st.get('piscar', 0.0))
        dx = dy = None
        ang = st.get('cabeca', 0.0)
        if abs(ang) > 0.02 and m.get('pescoco'):
            nx, ny = m['pescoco'][0] * s, m['pescoco'][1] * s
            hh = img.shape[0]
            mask = 1 - sstep(gy, ny - 0.03 * hh, ny + 0.03 * hh)
            a = math.radians(ang)
            rx = nx + (gx - nx) * math.cos(a) - (gy - ny) * math.sin(a)
            ry = ny + (gx - nx) * math.sin(a) + (gy - ny) * math.cos(a)
            dx, dy = (rx - gx) * mask, (ry - gy) * mask
        ab = st.get('braco', 0.0)
        if abs(ab) > 0.05 and m.get('braco'):
            mb = self._mask_braco(s, img.shape[:2])
            px, py = m['braco']['pivo'][0] * s, m['braco']['pivo'][1] * s
            a = math.radians(ab)
            rx = px + (gx - px) * math.cos(a) - (gy - py) * math.sin(a)
            ry = py + (gx - px) * math.sin(a) + (gy - py) * math.cos(a)
            bx, by = (rx - gx) * mb, (ry - gy) * mb
            dx = bx if dx is None else dx * (1 - mb) + bx
            dy = by if dy is None else dy * (1 - mb) + by
        if dx is not None:
            img = cv2.remap(img, gx - dx, gy - dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
        # afim: pés → (x, y), escala anisotrópica (squash & stretch) e rotação em torno dos pés
        fx, fy = m['centro_x'] * s, m['pes_y'] * s
        ks = k / s
        r = math.radians(st.get('rot', 0.0))
        c, sn = math.cos(r), math.sin(r)
        A = np.array([[c * sx * ks, -sn * sy * ks], [sn * sx * ks, c * sy * ks]], np.float64)
        t = np.array([st['x'], st['y']]) - A @ np.array([fx, fy])
        hh, ww = img.shape[:2]
        cantos = (A @ np.array([[0, ww, 0, ww], [0, 0, hh, hh]], np.float64)).T + t
        x0, y0 = np.floor(cantos.min(axis=0)) - 2
        x1, y1 = np.ceil(cantos.max(axis=0)) + 2
        if x1 < 0 or y1 < 0 or x0 > W or y0 > H:
            return None
        M = np.hstack([A, (t - [x0, y0])[:, None]]).astype(np.float32)
        spr = cv2.warpAffine(img, M, (int(x1 - x0), int(y1 - y0)), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
        spr = np.clip(spr, 0, 255)
        luz = st.get('luz')
        if luz:
            a = spr[..., 3] / 255
            d = max(1.0, luz.get('largura', 3.0) * k * 3)
            ldx, ldy = luz['dir']
            Ms = np.float32([[1, 0, -ldx * d], [0, 1, -ldy * d]])
            vizinho = cv2.warpAffine(a, Ms, (a.shape[1], a.shape[0]), borderValue=0)
            rim = cv2.GaussianBlur(np.clip(a - vizinho, 0, 1), (0, 0), max(0.6, d * 0.35)) * a
            spr[..., :3] += rim[..., None] * np.asarray(luz['cor'], np.float32)[None, None, :] * luz.get('forca', 0.6)
        return spr, int(x0), int(y0)


def compor(frame, spr, x0, y0, alfa=1.0):
    h, w = spr.shape[:2]
    X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if X1 <= X0 or Y1 <= Y0:
        return
    s = spr[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
    if alfa < 1:
        s = s * alfa
    a = s[..., 3:4] / 255
    frame[Y0:Y1, X0:X1] = frame[Y0:Y1, X0:X1] * (1 - a) + s[..., :3]


def reflexo(frame, spr, x0, y0, pe_y, forca=0.16, alcance=0.45):
    """Reflexo no piso polido: sprite espelhado abaixo dos pés, sumindo com a distância."""
    if forca <= 0:
        return
    h, w = spr.shape[:2]
    corte = max(1, min(h, int(pe_y - y0)))
    parte = spr[:corte][::-1].copy()
    n = parte.shape[0]
    g = np.clip(1 - np.arange(n, dtype=np.float32) / max(1.0, n * alcance), 0, 1) ** 1.6 * forca
    parte *= g[:, None, None]
    parte = cv2.GaussianBlur(parte, (0, 0), 2.0)
    compor(frame, parte, x0, int(pe_y))


def sombra(frame, x, y, larg, forca=0.5, altura=0.0):
    """Sombra de contato: encolhe e clareia quando o personagem sobe (altura em px de tela)."""
    f = 1 / (1 + altura / 120)
    rx, ry = larg * (0.5 + 0.5 * f), larg * 0.13 * (0.5 + 0.5 * f)
    pad = int(rx * 0.8 + 30)
    X0, Y0 = int(x - rx - pad), int(y - ry - pad)
    X1, Y1 = int(x + rx + pad), int(y + ry + pad)
    m = np.zeros((Y1 - Y0, X1 - X0), np.float32)
    cv2.ellipse(m, (int(x - X0), int(y - Y0)), (int(rx), max(1, int(ry))), 0, 0, 360, 1.0, -1, cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), max(2.0, ry * 0.9))
    cv2.ellipse(m, (int(x - X0), int(y - Y0)), (int(rx * 0.55), max(1, int(ry * 0.45))), 0, 0, 360, 1.0, -1, cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), max(1.5, ry * 0.35))
    a, b, c, d = max(0, X0), max(0, Y0), min(W, X1), min(H, Y1)
    if c <= a or d <= b:
        return
    mm = m[b - Y0:d - Y0, a - X0:c - X0] * forca * f
    frame[b:d, a:c] *= (1 - np.clip(mm, 0, 0.9))[..., None]


# ---------------------------------------------------------------- movimento
def pulo(t, t0, dur=0.42, altura=60.0):
    """Pulinho com antecipação, estica no ar, amassa na aterrissagem e assenta.
    Devolve (deslocamento vertical em px de tela, sx, sy)."""
    u = t - t0
    if u < -0.12 or u > dur + 0.45:
        return 0.0, 1.0, 1.0
    if u < 0:  # antecipação: agacha
        a = ease((u + 0.12) / 0.12)
        return 0.0, 1 + 0.08 * a, 1 - 0.10 * a
    if u < dur:
        p = u / dur
        y = -altura * 4 * p * (1 - p)
        est = math.sin(math.pi * p)
        return y, 1 - 0.06 * est, 1 + 0.09 * est * (1 - p) + 0.03 * est
    v = u - dur  # aterrissagem
    sq = mola(v, 0.12, 22, 9)
    return 0.0, 1 + sq * 0.8, 1 - sq


def entrada_queda(t, t0, altura=420.0, dur=0.38):
    """Cai do alto (entrada 'pop' de cima) e amassa ao tocar o chão."""
    u = t - t0
    if u < 0:
        return None
    if u < dur:
        p = u / dur
        return -altura * (1 - p * p), 0.92, 1.12
    v = u - dur
    sq = mola(v, 0.16, 20, 8)
    return 0.0, 1 + sq * 0.8, 1 - sq


def caminhada_pulos(t, t0, t1, x0, x1, passo=0.30, altura=26.0):
    """Andar de boneco: pulinhos curtos enquanto desliza, com balanço lateral.
    Devolve (x, dy, sx, sy, rot)."""
    if t <= t0:
        return x0, 0.0, 1.0, 1.0, 0.0
    if t >= t1:
        v = t - t1  # chega e assenta
        sq = mola(v, 0.08, 20, 9)
        return x1, 0.0, 1 + sq * 0.8, 1 - sq, mola(v, 3.0, 12, 6)
    u = (t - t0) / (t1 - t0)
    x = x0 + (x1 - x0) * (u * u * (3 - 2 * u) * 0.35 + u * 0.65)
    fase = (t - t0) / passo
    p = fase - math.floor(fase)
    dy = -altura * 4 * p * (1 - p)
    est = math.sin(math.pi * p)
    rot = 4.0 * math.sin(math.pi * fase)
    return x, dy, 1 - 0.04 * est, 1 + 0.05 * est, rot


# ---------------------------------------------------------------- acabamento
class Acabamento:
    def __init__(self, seed=5):
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r2 = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
        self.vinheta = (1 - 0.30 * np.clip(r2 / 2, 0, 1) ** 1.2).astype(np.float32)
        rng = np.random.default_rng(seed)
        self.grao = [cv2.GaussianBlur(rng.normal(0, 4.0, (H, W)).astype(np.float32), (0, 0), 0.6) for _ in range(6)]

    def aplicar(self, frame, i, grade=None, bloom=0.4, limiar=185):
        small = cv2.resize(frame, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
        bright = np.clip(small - limiar, 0, None)
        frame += cv2.resize(cv2.GaussianBlur(bright, (0, 0), 10), (W, H), interpolation=cv2.INTER_LINEAR) * bloom
        frame *= self.vinheta[..., None]
        if grade is not None:
            sombras, altas = grade
            lum = frame.mean(axis=2, keepdims=True) / 255
            frame += (1 - lum) * np.asarray(sombras, np.float32) + lum * np.asarray(altas, np.float32)
        frame += self.grao[i % len(self.grao)][..., None]
        return frame


def poeira(frame, t, seed, n=40, cor=(150, 210, 255), area=(0, 0, W, H), forca=0.5):
    """Partículas de poeira dourada flutuando na luz (aditivo)."""
    rng = np.random.default_rng(seed)
    x0, y0, x1, y1 = area
    for _ in range(n):
        px, py = rng.uniform(x0, x1), rng.uniform(y0, y1)
        vx, vy = rng.uniform(-8, 8), rng.uniform(-14, -4)
        r = rng.uniform(1.5, 4.5)
        fase = rng.uniform(0, 6.28)
        x = px + vx * t + 10 * math.sin(t * 0.7 + fase)
        y = py + vy * t
        y = y0 + (y - y0) % (y1 - y0)
        a = forca * (0.5 + 0.5 * math.sin(t * 1.3 + fase)) * rng.uniform(0.4, 1.0)
        R = int(r * 4)
        X, Y = int(x), int(y)
        if X - R < 0 or Y - R < 0 or X + R >= W or Y + R >= H:
            continue
        yy, xx = np.mgrid[-R:R + 1, -R:R + 1].astype(np.float32)
        g = np.exp(-(xx * xx + yy * yy) / (2 * r * r)) * a
        frame[Y - R:Y + R + 1, X - R:X + R + 1] += g[..., None] * np.asarray(cor, np.float32)[None, None, :]
