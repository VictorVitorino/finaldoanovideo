"""Recorta os personagens das folhas do filme (time13 + mascotes8) e marca os pontos de referência.

    python3 producao/recortar_filme.py [etapas] [grupos]   etapas: mascaras,corte,marcos,movimento (padrão: todas)
    python3 producao/recortar_filme.py mascaras,corte donos,paladini   só esses grupos (os outros ficam como estão)

Entrada: build/filme/folhas/{time13,mascotes8,trio_novo}.png. Saída: build/filme/corte/<grupo>/*.png
(RGBA, ampliado 3x), check_*.jpg e producao/marcos_filme.json.
Método: máscara BiRefNet (cache em build/filme/corte/_ml) + distância de cor ao fundo conhecido
(bege + cor da elipse da célula), componente do personagem, GrabCut na faixa de borda e
decontaminação de cor (tira o halo bege/pastel). Marcos: olhos por detecção de íris escuras,
com correções à mão em AJUSTE.
"""
import json
import math
import os
import sys

import cv2
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLHAS = os.path.join(RAIZ, 'build/filme/folhas')
CORTE = os.path.join(RAIZ, 'build/filme/corte')
ML = os.path.join(CORTE, '_ml')
# IS-Net: leve em CPU/memória (o BiRefNet completo estoura a memória do contêiner)
MODELO = {'mascotes': 'isnet-general-use.onnx', 'pessoas': 'isnet-general-use.onnx', 'trio': 'isnet-general-use.onnx'}
MARCOS = os.path.join(RAIZ, 'producao/marcos_filme.json')
K = 3          # ampliação
MARGEM = 12    # px em volta do recorte justo
PAD = 40       # folga do recorte na folha (px da folha), além da célula


def celulas(xs, y0, y1):
    return [(xs[i], y0, xs[i + 1], y1) for i in range(len(xs) - 1)]


# célula = faixa "dona" do personagem (px da folha); vizinhos fora dela são descartados
FOLHA = {
    'pessoas': ('time13.png', ['foto%d' % i for i in range(1, 14)],
                celulas([0, 214, 418, 601, 843, 1045, 1242, 1448], 135, 492)
                + celulas([0, 270, 485, 732, 948, 1188, 1448], 568, 942)),
    'mascotes': ('mascotes8.png', ['modulo', 'cronos', 'cuidado', 'frasco', 'acelerado', 'campo', 'conectado', 'obrinha'],
                 celulas([150, 505, 838, 1160, 1520], 15, 400) + celulas([150, 510, 840, 1185, 1520], 478, 852)),
    # Fabio Quintão, Sampaio e Nathalia Paladini: folha padronizada (mesmo estilo do time), nomes embaixo
    'trio': ('trio_novo.png', ['quintao', 'sampaio', 'paladini'], celulas([0, 496, 975, 1448], 90, 930)),
}


def grupos(sel=None):
    return sel.split(',') if sel else list(FOLHA)


def caixa(cel, shape):
    x0, y0, x1, y1 = cel
    return max(0, x0 - PAD), y0, min(shape[1], x1 + PAD), y1


def ampliar(src, bx):
    c = src.crop(bx)
    return np.array(c.resize((c.width * K, c.height * K), Image.LANCZOS))


# ---------------------------------------------------------------- máscara do modelo
def mascaras(grupo):
    import onnxruntime as ort
    arq, ids, cels = FOLHA[grupo]
    os.makedirs(ML, exist_ok=True)
    so = ort.SessionOptions()
    so.intra_op_num_threads = 2
    so.inter_op_num_threads = 1
    sess = ort.InferenceSession(os.path.join(RAIZ, 'build/modelos', MODELO[grupo]), so, providers=['CPUExecutionProvider'])
    src = Image.open(os.path.join(FOLHAS, arq)).convert('RGB')
    for nome, cel in zip(ids, cels):
        dst = os.path.join(ML, nome + '.npy')  # cache
        if os.path.exists(dst):
            continue
        a = ampliar(src, caixa(cel, (src.height, src.width))).astype(np.float32) / 255
        h, w = a.shape[:2]
        L = max(h, w)
        sq = np.zeros((L, L, 3), np.float32) + a[3, 3]
        oy, ox = (L - h) // 2, (L - w) // 2
        sq[oy:oy + h, ox:ox + w] = a
        inp = cv2.resize(sq, (1024, 1024), interpolation=cv2.INTER_AREA)
        bir = MODELO[grupo].startswith('BiRefNet')
        inp = (inp - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225] if bir else inp - 0.5
        out = sess.run(None, {sess.get_inputs()[0].name: inp.transpose(2, 0, 1)[None].astype(np.float32)})[0][0, 0]
        out = 1 / (1 + np.exp(-out)) if bir else (out - out.min()) / (out.max() - out.min())
        m = cv2.resize(out, (L, L), interpolation=cv2.INTER_LINEAR)[oy:oy + h, ox:ox + w]
        np.save(dst, m.astype(np.float16))
        print('modelo', nome, flush=True)


# ---------------------------------------------------------------- recorte
BEGE = np.array([250, 241, 228], np.float32)  # RGB do fundo
# retângulos da folha que nunca são personagem (ex.: ícone de wi-fi solto do Conectado)
REMOVER = {'conectado': [(1085, 515, 1165, 595)]}


def preencher(val, peso, sigmas=(3, 9, 27, 81)):
    """Estende val (H,W,C) dos pixels com peso>0 para o resto (convolução normalizada multiescala)."""
    out = val * peso[..., None]
    tem = peso > 0.5
    res = np.where(tem[..., None], val, 0).astype(np.float32)
    feito = tem.copy()
    for s in sigmas:
        f = 1.0 / max(1, s // 9)
        p = cv2.resize(peso, None, fx=f, fy=f, interpolation=cv2.INTER_AREA) if f < 1 else peso
        v = cv2.resize(out, None, fx=f, fy=f, interpolation=cv2.INTER_AREA) if f < 1 else out
        num = cv2.GaussianBlur(v, (0, 0), s * f)
        den = cv2.GaussianBlur(p, (0, 0), s * f)
        est = num / np.maximum(den, 1e-6)[..., None]
        if f < 1:
            est = cv2.resize(est, (val.shape[1], val.shape[0]), interpolation=cv2.INTER_LINEAR)
            den = cv2.resize(den, (val.shape[1], val.shape[0]), interpolation=cv2.INTER_LINEAR)
        novo = (~feito) & (den > 0.02)
        res[novo] = est[novo]
        feito |= novo
    res[~feito] = val[tem].mean(axis=0) if tem.any() else 0
    return res


def dist_lab(a, b):
    la = cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    lb = cv2.cvtColor(np.clip(b, 0, 255).astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    return np.sqrt(((la - lb) ** 2).sum(axis=2))


def recortar(nome, rgb, m, cel, bx):
    h, w = m.shape
    # fundo local (bege + elipses) estimado dos pixels que o modelo diz ser fundo
    fundo = (m < 0.03).astype(np.float32)
    fundo = cv2.erode(fundo, np.ones((5, 5), np.uint8))
    B = preencher(rgb.astype(np.float32), fundo)
    d = dist_lab(rgb.astype(np.float32), B)
    # componente(s) do personagem: dentro da faixa da célula
    duro = (m > 0.5).astype(np.uint8)
    # elipse pastel da célula (cor dominante do fundo não-bege no miolo da célula): sai mesmo se o modelo a pegou
    cx0, cx1 = (cel[0] - bx[0]) * K, (cel[2] - bx[0]) * K
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    bege = cv2.cvtColor(BEGE[None, None].astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)[0, 0]
    zf = np.zeros((h, w), bool)
    zf[:h // 2, cx0:cx1] = True
    amostra = lab[zf & (lab[..., 0] > 190)]
    amostra = amostra[np.sqrt(((amostra - bege) ** 2).sum(axis=1)) > 6]
    if len(amostra) > 500:
        q = (amostra // 4).astype(np.int32)
        cod = q[:, 0] * 4096 + q[:, 1] * 64 + q[:, 2]
        moda = np.bincount(cod).argmax()  # a elipse é a maior área de cor uniforme
        el = amostra[cod == moda].mean(axis=0)
        chave = (np.sqrt(((lab - el) ** 2).sum(axis=2)) < 8).astype(np.uint8)
        nk, lk, sk, _ = cv2.connectedComponentsWithStats(chave, 8)
        for i in range(1, nk):
            if sk[i, 4] > 3000:
                duro[lk == i] = 0
        duro = cv2.morphologyEx(duro, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    for (x0, y0, x1, y1) in REMOVER.get(nome, []):
        duro[(y0 - bx[1]) * K:(y1 - bx[1]) * K, (x0 - bx[0]) * K:(x1 - bx[0]) * K] = 0
    n, lab, st, cen = cv2.connectedComponentsWithStats(duro, 8)
    grande = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    dono = np.zeros((h, w), np.uint8)
    for i in range(1, n):
        if i == grande or (st[i, cv2.CC_STAT_AREA] > 0.002 * st[grande, cv2.CC_STAT_AREA] and cx0 < cen[i][0] < cx1):
            dono[lab == i] = 1
    # buracos fechados: cor de fundo → vão (fica transparente); senão é personagem (boca, lente)
    nb, lb, sb, _ = cv2.connectedComponentsWithStats(1 - dono, 4)
    for i in range(1, nb):
        x, y, bw, bh, ar = sb[i]
        if x > 0 and y > 0 and x + bw < w and y + bh < h and (d[lb == i] < 8).mean() < 0.5:
            dono[lb == i] = 1
    zona = cv2.dilate(dono, np.ones((15, 15), np.uint8))
    faixa = (zona > 0) & (cv2.erode(dono, np.ones((25, 25), np.uint8)) == 0)
    # trimapa → GrabCut só na faixa de borda
    gc = np.full((h, w), cv2.GC_BGD, np.uint8)
    gc[zona > 0] = cv2.GC_PR_BGD
    gc[(zona > 0) & (m > 0.5)] = cv2.GC_PR_FGD
    gc[cv2.erode(dono, np.ones((9, 9), np.uint8)) > 0] = cv2.GC_FGD
    gc[faixa & (m < 0.9) & (d < 6)] = cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    img = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    cv2.grabCut(img, gc, None, bgd, fgd, 3, cv2.GC_INIT_WITH_MASK)
    g = ((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)).astype(np.float32)
    g = cv2.GaussianBlur(g, (0, 0), 1.2)
    # alfa: modelo (bordas suaves) limitado pela zona; GrabCut decide onde o modelo hesita
    a = np.clip((m - 0.5) * 1.25 + 0.5, 0, 1) * cv2.GaussianBlur(zona.astype(np.float32), (0, 0), 2)
    duvida = (m > 0.1) & (m < 0.9)
    a = np.where(duvida, 0.5 * a + 0.5 * g * (m > 0.1), a)
    a[faixa & (d < 5) & (m < 0.95)] *= 0.3
    a = np.maximum(a, cv2.erode(dono, np.ones((25, 25), np.uint8)).astype(np.float32))
    for (x0, y0, x1, y1) in REMOVER.get(nome, []):
        a[(y0 - bx[1]) * K:(y1 - bx[1]) * K, (x0 - bx[0]) * K:(x1 - bx[0]) * K] = 0
    a[a < 0.03] = 0
    # decontaminação: tira a cor do fundo da borda semitransparente
    I = rgb.astype(np.float32)
    F = (I - (1 - a[..., None]) * B) / np.maximum(a[..., None], 0.05)
    dentro = (a > 0.9).astype(np.float32)
    Fi = preencher(I, cv2.erode(dentro, np.ones((5, 5), np.uint8)), sigmas=(2, 6, 18))
    t = np.clip((a - 0.35) / 0.5, 0, 1)[..., None]
    F = np.clip(F, 0, 255) * t + Fi * (1 - t)
    F = np.where(a[..., None] > 0.97, I, F)
    al = (a * 255).round().astype(np.uint8)
    ys, xs = np.nonzero(al > 8)
    y0, y1 = max(0, ys.min() - MARGEM), min(h, ys.max() + MARGEM + 1)
    x0, x1 = max(0, xs.min() - MARGEM), min(w, xs.max() + MARGEM + 1)
    out = np.dstack([np.clip(F, 0, 255).astype(np.uint8), al])[y0:y1, x0:x1]
    return out, (x0, y0)


ORIGEM = {}


def corte(sel=None):
    folha_cache = {}
    if os.path.exists(os.path.join(ML, 'origem.json')):
        ORIGEM.update(json.load(open(os.path.join(ML, 'origem.json'))))
    for grupo in grupos(sel):
        arq, ids, cels = FOLHA[grupo]
        os.makedirs(os.path.join(CORTE, grupo), exist_ok=True)
        src = folha_cache.setdefault(arq, Image.open(os.path.join(FOLHAS, arq)).convert('RGB'))
        for nome, cel in zip(ids, cels):
            bx = caixa(cel, (src.height, src.width))
            rgb = ampliar(src, bx)
            if not os.path.exists(os.path.join(ML, nome + '.npy')):
                continue
            m = np.load(os.path.join(ML, nome + '.npy')).astype(np.float32)
            out, off = recortar(nome, rgb, m, cel, bx)
            Image.fromarray(out, 'RGBA').save(os.path.join(CORTE, grupo, nome + '.png'))
            ORIGEM[nome] = [int(bx[0] * K + off[0]), int(bx[1] * K + off[1])]  # folha*K - origem = px do recorte
            print('corte', nome, out.shape[1], out.shape[0], flush=True)
        json.dump(ORIGEM, open(os.path.join(ML, 'origem.json'), 'w'))
        folha_conferencia(grupo, [n for n in ids if os.path.exists(os.path.join(CORTE, grupo, n + '.png'))])


def folha_conferencia(grupo, ids, alt=300, por_linha=7):
    tiles = []
    for nome in ids:
        im = cv2.imread(os.path.join(CORTE, grupo, nome + '.png'), cv2.IMREAD_UNCHANGED).astype(np.float32)
        s = alt / im.shape[0]
        im = cv2.resize(im, (max(1, round(im.shape[1] * s)), alt), interpolation=cv2.INTER_AREA)
        a = im[..., 3:4] / 255
        pares = [im[..., :3] * a + np.array(c, np.float32) * (1 - a) for c in ((255, 0, 255), (60, 30, 20))]
        tiles.append(np.hstack(pares).astype(np.uint8))
    linhas = []
    for i in range(0, len(tiles), por_linha):
        ln = np.hstack([np.pad(t, ((0, 0), (0, 6), (0, 0)), constant_values=255) for t in tiles[i:i + por_linha]])
        linhas.append(ln)
    L = max(x.shape[1] for x in linhas)
    folha = np.vstack([np.pad(x, ((0, 6), (0, L - x.shape[1]), (0, 0)), constant_values=255) for x in linhas])
    cv2.imwrite(os.path.join(CORTE, 'check_%s.jpg' % grupo), folha, [cv2.IMWRITE_JPEG_QUALITY, 88])


# ---------------------------------------------------------------- marcos
# correções à mão (px do recorte); valores aqui substituem os automáticos
AJUSTE = {
    # Quintão usa óculos (pálpebra sintética fica estranha); Paladini: olhos não detectados (cabelo), pivô à mão
    'quintao': {'piscar': False},
    'paladini': {'pescoco': [625, 1085], 'piscar': False},
}


def iris(rgba):
    """Íris escuras grandes na metade de cima: devolve [(cx, cy, r), (cx, cy, r)] da esquerda p/ direita."""
    h, w = rgba.shape[:2]
    lab = cv2.cvtColor(rgba[..., :3], cv2.COLOR_RGB2LAB)
    esc = ((lab[..., 0] < 95) & (rgba[..., 3] > 200)).astype(np.uint8)
    esc[int(h * 0.55):] = 0
    esc = cv2.morphologyEx(esc, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    esc = cv2.morphologyEx(esc, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
    n, lab_, st, cen = cv2.connectedComponentsWithStats(esc, 8)
    cand = []
    for i in range(1, n):
        x, y, bw, bh, ar = st[i]
        if not (0.035 * w < bw < 0.2 * w and 0.75 < bh / bw < 1.7):
            continue
        sol = ar / (math.pi * bw * bh / 4)
        if sol > 0.7:
            cand.append((cen[i][0], cen[i][1], (bw + bh) / 4, ar))
    melhor, nota = None, -1
    for i in range(len(cand)):
        for j in range(i + 1, len(cand)):
            a, b = cand[i], cand[j]
            r = (a[2] + b[2]) / 2
            if abs(a[1] - b[1]) < 1.3 * r and 2.0 * r < abs(a[0] - b[0]) < 7 * r and max(a[2], b[2]) / min(a[2], b[2]) < 1.35:
                s = a[3] + b[3] - 30 * abs(a[1] - b[1])
                if s > nota:
                    melhor, nota = sorted([a, b]), s
    return [c[:3] for c in melhor] if melhor else None


def abertura(rgba, cx, cy, r):
    """Abertura visível do olho: íris + esclera clara ligada a ela."""
    lab = cv2.cvtColor(rgba[..., :3], cv2.COLOR_RGB2LAB).astype(np.float32)
    x0, x1 = int(cx - 2.2 * r), int(cx + 2.2 * r)
    y0, y1 = int(cy - 1.8 * r), int(cy + 1.8 * r)
    L, C = lab[y0:y1, x0:x1, 0], np.hypot(lab[y0:y1, x0:x1, 1] - 128, lab[y0:y1, x0:x1, 2] - 128)
    m = (((L > 205) & (C < 14)) | (L < 95)).astype(np.uint8)
    n, lb = cv2.connectedComponents(m, 8)
    k = lb[int(cy - y0), int(cx - x0)]
    if k == 0:
        return [cx, cy, r * 1.25, r * 1.15]
    ys, xs = np.nonzero(lb == k)
    rx = np.clip((xs.max() - xs.min()) / 2, r * 1.05, r * 1.45)
    ry = np.clip((ys.max() - ys.min()) / 2, r * 1.0, r * 1.3)
    return [x0 + (xs.max() + xs.min()) / 2, y0 + (ys.max() + ys.min()) / 2, rx, ry]


def marcos_auto(rgba):
    h, w = rgba.shape[:2]
    a = rgba[..., 3] > 128
    ys = np.nonzero(a.any(axis=1))[0]
    pes = int(ys.max())
    baixo = a[pes - int(0.06 * h):pes + 1]
    xs = np.nonzero(baixo.any(axis=0))[0]
    centro = float((xs.min() + xs.max()) / 2)
    top = int(ys.min())
    tx = float(np.nonzero(a[top])[0].mean())
    M = {'w': w, 'h': h, 'pes_y': pes, 'centro_x': round(centro, 1), 'topo': [round(tx), top]}
    ir = iris(rgba)
    if ir:
        M['olhos'] = [[round(v, 1) for v in abertura(rgba, *c)] for c in ir]
        ex = (ir[0][0] + ir[1][0]) / 2
        ey = (ir[0][1] + ir[1][1]) / 2
        lin = np.nonzero(a[int(ey)])[0]
        lin = lin[np.abs(lin - ex) < 0.45 * w]
        rc = (lin.max() - lin.min()) / 2 * 0.92
        ri = (ir[0][2] + ir[1][2]) / 2
        rc = min(rc, 4.8 * ri)  # cabelo comprido alarga a linha dos olhos
        M['cabeca'] = [round(ex), round(ey - 0.05 * rc), round(rc)]
        M['pescoco'] = [round(ex), round(ey + 4.3 * ri)]
        # mãos: manchas da cor da pele (amostrada na bochecha) abaixo do pescoço
        lab = cv2.cvtColor(rgba[..., :3], cv2.COLOR_RGB2LAB).astype(np.float32)
        # pele: a amostra mais clara entre testa e bochechas (barba, cabelo e aba de boné são escuros)
        pts = [(ex, ey - 2.0 * ri), (ir[0][0], ey + 1.9 * ri), (ir[1][0], ey + 1.9 * ri)]
        amos = [np.median(lab[int(y) - 6:int(y) + 6, int(x) - 6:int(x) + 6].reshape(-1, 3), axis=0) for x, y in pts]
        amos = [c for c in amos if c[0] < 235] or amos
        pele = max(amos, key=lambda c: c[0])
        # pálpebra = pele da bochecha (a amostra automática do motor pega cílio/sobrancelha)
        bgr_ = cv2.cvtColor(pele.reshape(1, 1, 3).astype(np.uint8), cv2.COLOR_LAB2BGR)[0, 0]
        M['cor_palpebra'] = [round(float(v) * 0.95, 1) for v in bgr_]
        sk = ((np.sqrt(((lab - pele) ** 2).sum(axis=2)) < 32) & a).astype(np.uint8)
        sk[:int(ey + 6.3 * ri)] = 0
        sk = cv2.morphologyEx(sk, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
        n, lb, st, cen = cv2.connectedComponentsWithStats(sk, 8)
        maos = []
        for lado in (-1, 1):
            c = [i for i in range(1, n) if (cen[i][0] - ex) * lado > 0.12 * w and st[i, 4] > 300]
            if c:
                i = max(c, key=lambda i: st[i, 4])
                maos.append([round(cen[i][0]), round(cen[i][1])])
        if len(maos) < 2:  # reserva: pontas da silhueta na linha mais larga da altura das mãos
            lg = [(np.ptp(np.nonzero(a[y])[0]) if a[y].any() else 0, y) for y in range(int(0.55 * h), int(0.8 * h))]
            y = max(lg)[1]
            xs_ = np.nonzero(a[y])[0]
            maos = [[int(xs_.min()) + 25, y], [int(xs_.max()) - 25, y]]
        M['maos'] = maos
    return M


# braço que gesticula (antebraço + mão + objeto), em px da FOLHA: pivô no cotovelo
BRACO_FOLHA = {
    'modulo': ((250, 275), [(178, 178), (252, 172), (264, 240), (270, 292), (232, 298), (214, 264), (180, 248)]),
    'cronos': ((572, 292), [(533, 193), (597, 193), (603, 282), (588, 308), (545, 302), (533, 262)]),
    'cuidado': ((928, 290), [(856, 233), (926, 238), (942, 300), (915, 312), (868, 292)]),
    'frasco': ((1236, 286), [(1186, 168), (1257, 168), (1264, 300), (1225, 307), (1190, 266)]),
    'acelerado': ((270, 722), [(218, 628), (287, 628), (294, 732), (255, 742), (220, 706)]),
    'campo': ((772, 716), [(743, 613), (812, 613), (817, 707), (790, 732), (748, 722)]),
    'conectado': ((930, 742), [(876, 658), (942, 658), (947, 747), (915, 757), (878, 732)]),
    'obrinha': ((1256, 736), [(1206, 643), (1274, 643), (1280, 747), (1245, 757), (1208, 727)]),
}


def marcos(sel=None):
    tudo = json.load(open(MARCOS)) if sel and os.path.exists(MARCOS) else {}
    org = json.load(open(os.path.join(ML, 'origem.json')))
    for grupo in grupos(sel):
        for nome in FOLHA[grupo][1]:
            rgba = np.array(Image.open(os.path.join(CORTE, grupo, nome + '.png')))
            M = {'arquivo': '%s/%s.png' % (grupo, nome)}
            M.update(marcos_auto(rgba))
            if nome in BRACO_FOLHA:
                cv_ = lambda p: [round(p[0] * K - org[nome][0]), round(p[1] * K - org[nome][1])]
                piv, pol = BRACO_FOLHA[nome]
                M['braco'] = {'pivo': cv_(piv), 'poligono': [cv_(p) for p in pol]}
            M.update(AJUSTE.get(nome, {}))
            tudo[nome] = M
            print('marcos', nome, 'olhos' in M, 'maos' in M, flush=True)
    json.dump(tudo, open(MARCOS, 'w'), indent=1, ensure_ascii=False)
    for grupo in grupos(sel):
        folha_marcos(grupo, [tudo[n] for n in FOLHA[grupo][1]])


def folha_marcos(grupo, lista, alt=420):
    """Conferência dos marcos desenhados sobre o recorte (fica em _ml, não é entregue)."""
    tiles = []
    for M in lista:
        im = cv2.imread(os.path.join(CORTE, M['arquivo']), cv2.IMREAD_UNCHANGED).astype(np.float32)
        a = im[..., 3:4] / 255
        im = (im[..., :3] * a + 90 * (1 - a)).astype(np.uint8)
        P = lambda p: (int(p[0]), int(p[1]))
        for (cx, cy, rx, ry) in M.get('olhos', []):
            cv2.ellipse(im, P((cx, cy)), P((rx, ry)), 0, 0, 360, (0, 255, 0), 2)
        if 'cabeca' in M:
            cv2.circle(im, P(M['cabeca']), int(M['cabeca'][2]), (255, 255, 0), 2)
        for p, cor in ((M.get('pescoco'), (0, 0, 255)), (M.get('topo'), (255, 0, 0))):
            if p:
                cv2.circle(im, P(p), 9, cor, -1)
        for p in M.get('maos', []):
            cv2.drawMarker(im, P(p), (0, 255, 255), cv2.MARKER_CROSS, 30, 4)
        if 'braco' in M:
            cv2.polylines(im, [np.int32(M['braco']['poligono'])], True, (255, 0, 255), 3)
            cv2.circle(im, P(M['braco']['pivo']), 10, (255, 0, 255), -1)
        cv2.line(im, (0, M['pes_y']), (im.shape[1], M['pes_y']), (0, 128, 255), 2)
        for gy in range(0, im.shape[0], 100):
            cv2.putText(im, str(gy), (2, gy + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        for gx in range(100, im.shape[1], 100):
            cv2.line(im, (gx, 0), (gx, 12), (255, 255, 255), 3)
        s = alt / im.shape[0]
        tiles.append(cv2.resize(im, (round(im.shape[1] * s), alt), interpolation=cv2.INTER_AREA))
    linhas = [np.hstack(tiles[i:i + 7]) for i in range(0, len(tiles), 7)]
    L = max(x.shape[1] for x in linhas)
    cv2.imwrite(os.path.join(ML, 'marcos_%s.jpg' % grupo), np.vstack([np.pad(x, ((0, 4), (0, L - x.shape[1]), (0, 0))) for x in linhas]), [cv2.IMWRITE_JPEG_QUALITY, 85])


# ---------------------------------------------------------------- teste de movimento
def movimento(sel=None, k=0.35):
    sys.path.insert(0, os.path.join(RAIZ, 'producao'))
    import motor30 as M
    tudo = json.load(open(MARCOS))
    nomes = [n for gr in grupos(sel) for n in FOLHA[gr][1]]
    blocos = []
    for nome, mk in tudo.items():
        if nome not in nomes:
            continue
        p = M.Personagem(os.path.join(CORTE, mk['arquivo']), mk)
        var = [{}, {'piscar': 1.0}, {'cabeca': 5.0}]
        if mk.get('braco'):
            var += [{'braco': 10.0}, {'braco': -10.0}]
        frame = np.zeros((M.H, M.W, 3), np.float32) + np.array([120, 105, 95], np.float32)
        for i, v in enumerate(var):
            st = {'x': 190 + i * 380, 'y': 1040, 'k': k}
            st.update(v)
            spr, x0, y0 = p.sprite(st)
            M.compor(frame, spr, x0, y0)
        frame = np.clip(frame, 0, 255).astype(np.uint8)
        top = max(0, 1040 - int(k * mk['h']) - 50)
        cv2.putText(frame, nome, (10, top + 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
        blocos.append(frame[top:1060, :len(var) * 380])
    L = max(b.shape[1] for b in blocos)
    img = np.vstack([np.pad(b, ((0, 4), (0, L - b.shape[1]), (0, 0))) for b in blocos])
    img = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(CORTE, 'check_movimento.jpg'), img, [cv2.IMWRITE_JPEG_QUALITY, 88])


if __name__ == '__main__':
    etapas = sys.argv[1].split(',') if len(sys.argv) > 1 else ['mascaras', 'corte', 'marcos', 'movimento']
    sel = sys.argv[2] if len(sys.argv) > 2 else None
    if 'mascaras' in etapas:
        for gr in grupos(sel):  # um de cada vez (memória)
            mascaras(gr)
    if 'corte' in etapas:
        corte(sel)
    if 'marcos' in etapas:
        marcos(sel)
    if 'movimento' in etapas:
        movimento(sel)
