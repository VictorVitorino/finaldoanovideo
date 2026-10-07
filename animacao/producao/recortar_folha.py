"""Recorta as poses da folha de personagem (PNG com transparência), para a animação 2,5D.

    python3 producao/recortar_folha.py <folha.png> <pasta_saida> [poses separadas por vírgula]

As coordenadas são da folha "01 VICTOR" (1536x1024): poses e turnaround na grade padrão da
folha. Para outra folha com o mesmo layout, as caixas servem; confira o resultado e ajuste
HINTS (retângulos que são fundo) se sobrar cenário em volta do personagem.
Cada pose é ampliada 3x (Lanczos) e recortada com GrabCut. O retrato do canto (close)
usa uma silhueta desenhada à mão e o GrabCut só refina a borda (trimapa).
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image

src = Image.open(sys.argv[1]).convert('RGB')
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
SO = sys.argv[3].split(',') if len(sys.argv) > 3 else None
BOX = {
  'hero': (445, 12, 608, 532),
  'apresentando': (22, 782, 205, 992), 'polegar': (207, 782, 310, 992), 'conversando': (340, 782, 495, 992),
  'celular': (505, 782, 605, 992), 'notebook': (655, 782, 805, 992), 'pensativo': (830, 782, 920, 992),
  'cruzados': (980, 782, 1070, 992), 'caminhando': (1110, 782, 1255, 992), 'apontando': (1285, 782, 1475, 992),
}
K = 3
# retângulos que são fundo (coordenadas do recorte ampliado 3x)
HINTS = {
  'hero': [(445, 440, 525, 565), (0, 1170, 118, 1340)],
  'celular': [(150, 470, 200, 640)],
  'notebook': [(80, 165, 125, 215)],
  'caminhando': [(310, 175, 470, 360)],
  'apontando': [(305, 225, 520, 640)],
}
for nome, (x0, y0, x1, y1) in BOX.items():
    if SO and nome not in SO:
        continue
    pad = 6
    c = src.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    c = c.resize((c.width * K, c.height * K), Image.LANCZOS)
    img = cv2.cvtColor(np.array(c), cv2.COLOR_RGB2BGR)
    mask = np.zeros(img.shape[:2], np.uint8)
    rect = (pad * K, pad * K, (x1 - x0) * K, (y1 - y0) * K)
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, rect, bgd, fgd, 10, cv2.GC_INIT_WITH_RECT)
    if nome in HINTS:
        for (a, b, c2, d) in HINTS[nome]:
            mask[b:d, a:c2] = cv2.GC_BGD
        cv2.grabCut(img, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    # maior componente conectado (o personagem)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 1:
        big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        keep = np.zeros_like(m)
        for i in range(1, n):
            if i == big or stats[i, cv2.CC_STAT_AREA] > 0.04 * stats[big, cv2.CC_STAT_AREA]:
                keep[lab == i] = 255
        m = keep
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.GaussianBlur(m, (5, 5), 0)
    rgba = np.dstack([np.array(c), m])
    Image.fromarray(rgba, 'RGBA').save(os.path.join(out, nome + '.png'))
    print(nome, c.size, round(float((m > 128).mean()), 3))


# ---- retrato (close) por trimapa: silhueta à mão em coordenadas da folha x2
if not SO or 'retrato' in SO:
    K = 3
    c = src.crop((0, 0, 446, 515))  # o texto '01 VICTOR' fica fora da silhueta (vira fundo)
    c = c.resize((c.width * K, c.height * K), Image.LANCZOS)
    img = cv2.cvtColor(np.array(c), cv2.COLOR_RGB2BGR)
    h, w = img.shape[:2]
    P = [(0, 1040), (0, 740), (60, 720), (150, 700), (230, 680), (285, 660), (310, 630), (325, 570), (335, 480),
         (300, 455), (282, 400), (285, 330), (315, 300), (362, 305), (372, 250), (392, 170), (430, 100), (500, 50),
         (580, 28), (660, 24), (740, 40), (800, 80), (840, 130), (865, 195), (880, 262), (872, 330), (845, 400),
         (815, 462), (798, 478), (805, 540), (785, 592), (742, 616), (700, 612), (645, 655), (590, 700), (566, 734),
         (608, 786), (712, 872), (798, 938), (880, 988), (900, 990), (900, 1040)]
    poly = (np.array(P, np.float32) * K / 2).astype(np.int32)
    sil = np.zeros((h, w), np.uint8)
    cv2.fillPoly(sil, [poly], 255)
    r = 14 * K // 2
    inner = cv2.erode(sil, np.ones((2 * r + 1, 2 * r + 1), np.uint8))
    outer = cv2.dilate(sil, np.ones((2 * r + 1, 2 * r + 1), np.uint8))
    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    mask[outer > 0] = cv2.GC_PR_BGD
    mask[sil > 0] = cv2.GC_PR_FGD
    mask[inner > 0] = cv2.GC_FGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    m = np.where(lab == big, 255, 0).astype(np.uint8)
    # preenche buracos internos
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(cv2.bitwise_not(m), 8)
    for i in range(1, n2):
        xx, yy, ww, hh, area = st2[i]
        if xx > 0 and yy > 0 and xx + ww < w and yy + hh < h:
            m[lab2 == i] = 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.GaussianBlur(m, (7, 7), 0)
    Image.fromarray(np.dstack([np.array(c), m]), 'RGBA').save(os.path.join(out, 'retrato.png'))
    print('retrato', c.size, round(float((m > 128).mean()), 3))
