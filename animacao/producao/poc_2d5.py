"""Prova de conceito 2,5D: micro-atuação natural a partir de uma folha de personagem.

    python3 producao/poc_2d5.py build/poc/corte build/poc/frames

Usa recortes (PNG com transparência) da folha: 'hero.png' (parado) e 'apontando.png'.
Movimentos por deformação suave (sem trocar desenho): respiração, transferência de
peso com os pés plantados, micro-movimentos de cabeça, piscada, assentamento do braço
depois do gesto, e câmera com profundidade de campo sobre um fundo de bokeh.
"""
import math
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS = 1920, 1080, 30
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)


def ease(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def load(name):
    im = np.array(Image.open(os.path.join(SRC, name)).convert('RGBA')).astype(np.float32)
    return im


def warp(img, dx, dy):
    h, w = img.shape[:2]
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(img, gx - dx, gy - dy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))


def rot_field(h, w, cx, cy, ang, mask):
    """Deslocamento de uma rotação em torno de (cx, cy), ponderado por mask (0..1)."""
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    a = math.radians(ang)
    rx = cx + (gx - cx) * math.cos(a) - (gy - cy) * math.sin(a)
    ry = cy + (gx - cx) * math.sin(a) + (gy - cy) * math.cos(a)
    return (rx - gx) * mask, (ry - gy) * mask


def smoothstep_field(v, a, b):
    t = np.clip((v - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------- fundo de bokeh (camadas com paralaxe) ----------
rng = np.random.default_rng(4)
BOKEH = [(rng.uniform(-200, 2300), rng.uniform(80, 900), rng.uniform(30, 120), rng.choice([0, 1, 2]), rng.uniform(0.25, 0.7), rng.uniform(0.3, 1.0)) for _ in range(46)]
COLS = [(255, 170, 90), (255, 200, 140), (120, 170, 220)]


def background(cam_x, zoom):
    bg = Image.new('RGB', (W, H))
    top, bot = np.array([18, 24, 40]), np.array([70, 52, 44])
    grad = (top[None, :] * (1 - np.linspace(0, 1, H)[:, None]) + bot[None, :] * np.linspace(0, 1, H)[:, None]).astype(np.uint8)
    bg = Image.fromarray(np.repeat(grad[:, None, :], W, axis=1))
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for x, y, r, c, a, depth in BOKEH:
        px = (x - cam_x * depth * 0.35) * (1 + (zoom - 1) * depth * 0.4) + (W / 2) * (1 - (1 + (zoom - 1) * depth * 0.4))
        rr = r * (1 + (zoom - 1) * 0.5)
        d.ellipse([px - rr, y - rr, px + rr, y + rr], fill=COLS[c] + (int(255 * a * 0.55),))
    layer = layer.filter(ImageFilter.GaussianBlur(14))
    bg = Image.alpha_composite(bg.convert('RGBA'), layer)
    # piso
    fl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(fl).rectangle([0, 900, W, H], fill=(30, 26, 30, 170))
    return Image.alpha_composite(bg, fl.filter(ImageFilter.GaussianBlur(30)))


def place(frame, char, cx, foot_y, scale):
    h, w = char.shape[:2]
    im = Image.fromarray(np.clip(char, 0, 255).astype(np.uint8), 'RGBA')
    im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([cx - im.width * 0.45, foot_y - 18, cx + im.width * 0.45, foot_y + 18], fill=(0, 0, 0, 110))
    frame = Image.alpha_composite(frame, sh.filter(ImageFilter.GaussianBlur(12)))
    frame.alpha_composite(im, (int(cx - im.width / 2), int(foot_y - im.height)))
    return frame


def blink_overlay(char, eyes, k, skin):
    """Desenha pálpebras fechando (k: 0 aberto → 1 fechado)."""
    if k <= 0.02:
        return char
    im = Image.fromarray(np.clip(char, 0, 255).astype(np.uint8), 'RGBA')
    d = ImageDraw.Draw(im)
    for (x, y, rx, ry) in eyes:
        top = y - ry
        d.ellipse([x - rx, top - ry * 0.2, x + rx, top + 2 * ry * k], fill=skin + (255,))
        d.arc([x - rx, top + 2 * ry * k - ry * 0.6, x + rx, top + 2 * ry * k + ry * 0.4], 20, 160, fill=(40, 25, 20, 255), width=3)
    return np.array(im).astype(np.float32)


hero = load('hero.png')
aponta = load('apontando.png')
hh, hw = hero.shape[:2]
ah, aw = aponta.shape[:2]

# pontos de referência no recorte (ampliado 3x)
H_NECK, H_WAIST, H_FEET, H_HEADC = (262, 330), 700, 1560, (262, 210)
A_SHOULDER, A_WAIST = (322, 205), 345

T1, T2 = 4.6, 3.6
N = int((T1 + T2) * FPS)
for i in range(N):
    t = i / FPS
    if t < T1:
        u = t / T1
        breath = math.sin(2 * math.pi * t / 3.4)
        sway = math.sin(2 * math.pi * t / 4.6 - 0.6)
        gx, gy = np.meshgrid(np.arange(hw, dtype=np.float32), np.arange(hh, dtype=np.float32))
        upper = 1 - smoothstep_field(gy, H_WAIST - 60, H_WAIST + 40)
        # respiração: tronco e cabeça sobem levemente; ombros abrem
        dy = -breath * 5.0 * upper * smoothstep_field(H_WAIST - gy, 0, 300)
        dx = breath * 2.0 * upper * np.clip((gx - hw / 2) / (hw / 2), -1, 1) * smoothstep_field(H_WAIST - gy, 150, 400)
        # transferência de peso: quadril desloca, pés ficam plantados
        legs = smoothstep_field(gy, 0, H_WAIST) * (1 - smoothstep_field(gy, H_FEET - 260, H_FEET - 40))
        dx += sway * 9.0 * legs + sway * 9.0 * upper
        # cabeça: pequena inclinação e aceno
        head = 1 - smoothstep_field(gy, H_NECK[1] - 20, H_NECK[1] + 30)
        ang = 1.6 * math.sin(2 * math.pi * t / 2.9 + 0.8) + 0.8 * math.sin(2 * math.pi * t / 1.7)
        rx, ry = rot_field(hh, hw, H_NECK[0], H_NECK[1], ang, head)
        img = warp(hero, dx + rx, dy + ry)
        bl = max(0.0, 1 - abs((t % 3.7) - 1.9) / 0.09) if 1.7 < (t % 3.7) < 2.1 else 0.0
        img = blink_overlay(img, [(232, 183, 15, 9), (296, 183, 15, 9)], bl, (205, 140, 105))
        zoom = 1 + 0.07 * ease(u)
        frame = background(cam_x=40 * u, zoom=zoom)
        frame = place(frame, img, W / 2 + 140 - 60 * u, 980 + 25 * ease(u), 0.58 * zoom)
    else:
        lt = t - T1
        u = lt / T2
        breath = math.sin(2 * math.pi * lt / 3.4 + 1)
        gx, gy = np.meshgrid(np.arange(aw, dtype=np.float32), np.arange(ah, dtype=np.float32))
        upper = 1 - smoothstep_field(gy, A_WAIST - 30, A_WAIST + 30)
        dy = -breath * 2.4 * upper * smoothstep_field(A_WAIST - gy, 0, 160)
        # assentamento do braço: chega um pouco alto, desce e estabiliza (follow-through)
        settle = 6.0 * math.exp(-lt * 3.2) * math.cos(lt * 9.0)
        arm = smoothstep_field(gx, A_SHOULDER[0] - 10, A_SHOULDER[0] + 40) * (1 - smoothstep_field(gy, A_SHOULDER[1] + 60, A_SHOULDER[1] + 140))
        rx, ry = rot_field(ah, aw, A_SHOULDER[0], A_SHOULDER[1], -settle, arm)
        head = 1 - smoothstep_field(gy, 120, 150)
        hx, hy = rot_field(ah, aw, 205, 135, 1.2 * math.sin(lt * 2.4), head)
        img = warp(aponta, rx + hx, dy + ry + hy)
        frame = background(cam_x=-120 - 30 * u, zoom=1.12)
        frame = place(frame, img, W / 2 - 160, 1000, 1.18 + 0.03 * ease(u))
        # cartão que aparece onde ele aponta
        k = ease((lt - 0.35) / 0.4)
        if k > 0:
            card = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            cw, ch = 420 * (0.85 + 0.15 * k), 170 * (0.85 + 0.15 * k)
            x0, y0 = 1380 - cw / 2, 330 - ch / 2
            ImageDraw.Draw(card).rounded_rectangle([x0, y0, x0 + cw, y0 + ch], radius=26, fill=(252, 248, 238, int(240 * k)))
            frame = Image.alpha_composite(frame, card)
    # leve vinheta
    frame.convert('RGB').save(os.path.join(OUT, f'f{i:05d}.jpg'), quality=92)
print(N, 'quadros')
