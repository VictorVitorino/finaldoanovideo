"""v20: remove o par de pernas extra do Fabio Quintão dentro do carrinho (abertura e encerramento).

Para cada tomada: um polígono-âncora (coordenadas do quadro 1920x1080) marca a região das pernas extras num quadro de
referência; o movimento do carrinho é rastreado (fluxo óptico LK na região + similaridade RANSAC) e o polígono acompanha
os demais quadros. O preenchimento vem do LaMa (inpainting) em quadros-chave a cada N quadros, deformado pelo mesmo
rastreio para os quadros vizinhos e cruzado entre os dois quadros-chave mais próximos (sem cintilação). Os arames da
cesta nunca são pintados: são detectados por cor no próprio quadro e recompostos por cima.

Uso:
  python3 producao/v20_pernas.py testar  [tomadas]   # só os quadros-âncora: antes/depois em build/azul/v20in/teste/
  python3 producao/v20_pernas.py rodar   [tomadas]   # todos os quadros das tomadas -> build/azul/v20in/fix/nNNNNNN.png
Entrada: build/azul/v20in/png/nNNNNNN.png (quadros extraídos do v20).
"""
import os, sys, time
import numpy as np, cv2
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(RAIZ, 'build', 'azul', 'v20in')
PNG, FIX, TESTE = (os.path.join(BASE, d) for d in ('png', 'fix', 'teste'))
PASSO_CHAVE = 10   # LaMa a cada N quadros

# tomada: (primeiro, último, quadro-âncora, polígono) — polígono = pernas extras (e sapato extra quando houver)
TOMADAS = {
    'W':  (40, 67, 67, [(520, 605), (640, 600), (722, 618), (740, 700), (700, 732), (560, 736), (515, 700)]),
    'A':  (148, 226, 180, [(700, 1012), (1000, 1008), (1250, 1010), (1470, 1000), (1470, 1080), (700, 1080)]),
    'B':  (267, 366, 300, [(555, 850), (760, 846), (830, 860), (905, 866), (965, 900), (965, 1000), (945, 1050), (830, 1055), (620, 1055), (560, 1010)]),
    'C':  (405, 433, 410, [(832, 642), (905, 640), (1010, 642), (1130, 700), (1245, 742), (1240, 790), (1150, 795), (960, 795), (840, 790)]),
    'D':  (5740, 5766, 5758, [(600, 705), (880, 700), (960, 730), (1000, 800), (990, 1000), (880, 1040), (620, 1040), (590, 980)]),
    'D2': (5796, 5838, 5814, [(790, 628), (960, 625), (1000, 650), (1005, 790), (940, 800), (800, 798)]),
    'E':  (6053, 6140, 6095, [(605, 885), (880, 885), (1000, 905), (1090, 945), (1180, 948), (1360, 1000), (1355, 1060), (1200, 1072), (960, 1075), (640, 1075), (605, 1020)]),
    'F1': (6141, 6157, 6141, [(828, 648), (990, 645), (1060, 690), (1140, 735), (1280, 760), (1275, 795), (1150, 800), (960, 800), (835, 795)]),
    'F3': (6240, 6302, 6265, [(828, 650), (980, 648), (1040, 690), (1045, 790), (960, 800), (835, 798)]),
}

_lama = None
def lama():
    global _lama
    if _lama is None:
        from simple_lama_inpainting import SimpleLama
        _lama = SimpleLama()
    return _lama

def ler(n):
    return np.array(Image.open(os.path.join(PNG, f'n{n:06d}.png')).convert('RGB'))

def arames(rgb, m):
    """o que nunca é pintado dentro da máscara: arames e aro da cesta (cinza claro), capas azuis dos cantos e pele (mão/braço)"""
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV); h, s, v = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    w = ((s < 70) & (v > 120)).astype(np.uint8)
    w = cv2.morphologyEx(w, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    w = cv2.dilate(w, np.ones((3, 3), np.uint8))
    capa = ((h >= 100) & (h <= 130) & (s >= 150) & (v >= 120)).astype(np.uint8)          # azul forte das capas
    pele = ((h <= 22) & (s >= 60) & (s <= 190) & (v >= 120)).astype(np.uint8)              # pele
    fixo = cv2.dilate(np.maximum(capa, pele), np.ones((9, 9), np.uint8))                   # com folga: nada de halo
    return ((w > 0) | (fixo > 0)) & (m > 0)

def rasteriza(poly):
    m = np.zeros((1080, 1920), np.uint8)
    cv2.fillPoly(m, [np.round(poly).astype(np.int32)], 255)
    m = cv2.GaussianBlur(m, (0, 0), 2)
    return (m > 80).astype(np.uint8) * 255

def transformas(n0, n1, poly):
    """T[n]: similaridade que leva pontos do quadro-âncora para o quadro n (rastreio do carrinho em torno do polígono)"""
    # faixa de rastreio: caixa do polígono com margem (muito arame = bons cantos)
    xs, ys = zip(*poly); x0, x1 = max(0, min(xs) - 120), min(1920, max(xs) + 120); y0, y1 = max(0, min(ys) - 160), min(1080, max(ys) + 60)
    def passo(a, b, T_ab_roi):
        ga, gb = cv2.cvtColor(a, cv2.COLOR_RGB2GRAY), cv2.cvtColor(b, cv2.COLOR_RGB2GRAY)
        roi = np.zeros_like(ga); rx0, ry0, rx1, ry1 = T_ab_roi; roi[ry0:ry1, rx0:rx1] = 255
        p = cv2.goodFeaturesToTrack(ga, 400, 0.01, 7, mask=roi)
        if p is None or len(p) < 12: return np.eye(2, 3)
        q, st, _ = cv2.calcOpticalFlowPyrLK(ga, gb, p, None, winSize=(21, 21), maxLevel=3)
        ok = st.ravel() == 1
        if ok.sum() < 12: return np.eye(2, 3)
        M, inl = cv2.estimateAffinePartial2D(p[ok], q[ok], method=cv2.RANSAC, ransacReprojThreshold=2.0)
        return M if M is not None else np.eye(2, 3)
    return passo, (x0, y0, x1, y1)

def compor(M, N):   # M depois de N (2x3)
    A = np.vstack([M, [0, 0, 1]]) @ np.vstack([N, [0, 0, 1]])
    return A[:2]

def aplica(M, pts):
    P = np.hstack([np.asarray(pts, float), np.ones((len(pts), 1))])
    return (P @ M.T)

def processa(nome, so_ancora=False):
    n0, n1, na, poly = TOMADAS[nome]
    os.makedirs(FIX, exist_ok=True); os.makedirs(TESTE, exist_ok=True)
    frames = {n: ler(n) for n in range(n0, n1 + 1)}
    passo, roi = transformas(n0, n1, poly)
    # transformações âncora -> n (para frente e para trás), com a ROI acompanhando o polígono
    T = {na: np.eye(2, 3)}
    def roi_de(M):
        P = aplica(M, poly); xs, ys = P[:, 0], P[:, 1]
        return (int(max(0, xs.min() - 120)), int(max(0, ys.min() - 160)), int(min(1920, xs.max() + 120)), int(min(1080, ys.max() + 60)))
    for n in range(na, n1):
        T[n + 1] = compor(passo(frames[n], frames[n + 1], roi_de(T[n])), T[n])
    for n in range(na, n0, -1):
        T[n - 1] = compor(passo(frames[n], frames[n - 1], roi_de(T[n])), T[n])
    if so_ancora:
        ns_chave = [na]
    else:
        ns_chave = sorted(set([n0, n1, na] + list(range(na, n1, PASSO_CHAVE)) + list(range(na, n0, -PASSO_CHAVE))))
    # LaMa nos quadros-chave (recorte em torno do polígono)
    cheios = {}
    for k in ns_chave:
        rgb = frames[k]; m = rasteriza(aplica(T[k], poly)); mm = m.copy(); mm[arames(rgb, m)] = 0
        ys, xs = np.where(m > 0)
        if len(xs) == 0: cheios[k] = rgb; continue
        x0, x1 = max(0, xs.min() - 160), min(1920, xs.max() + 160); y0, y1 = max(0, ys.min() - 160), min(1080, ys.max() + 160)
        t = time.time()
        o = np.array(lama()(Image.fromarray(rgb[y0:y1, x0:x1]), Image.fromarray(mm[y0:y1, x0:x1])).convert('RGB'))[:y1 - y0, :x1 - x0]
        cheio = rgb.copy(); cheio[y0:y0 + o.shape[0], x0:x0 + o.shape[1]] = o; cheios[k] = cheio
        print(f'  {nome} chave n{k}: lama {time.time() - t:.1f}s')
    # composição quadro a quadro
    alvo = range(n0, n1 + 1) if not so_ancora else [na]
    for n in alvo:
        rgb = frames[n]; m = rasteriza(aplica(T[n], poly)); keep = arames(rgb, m)
        # preenchimento: quadros-chave vizinhos deformados para n, cruzados pelo tempo
        prev = max([k for k in ns_chave if k <= n], default=ns_chave[0]); nxt = min([k for k in ns_chave if k >= n], default=ns_chave[-1])
        def deforma(k):
            Mk = compor(T[n], cv2.invertAffineTransform(T[k]))   # k -> âncora -> n
            return cv2.warpAffine(cheios[k], Mk, (1920, 1080), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        if prev == nxt: fill = deforma(prev)
        else:
            w = (n - prev) / (nxt - prev); fill = (deforma(prev) * (1 - w) + deforma(nxt) * w).astype(np.uint8)
        mm = m.copy(); mm[keep] = 0
        soft = cv2.GaussianBlur(mm.astype(np.float32) / 255, (0, 0), 1.5)[..., None]
        out = (rgb * (1 - soft) + fill * soft).astype(np.uint8)
        if so_ancora:
            ys, xs = np.where(m > 0); x0, x1 = max(0, xs.min() - 200), min(1920, xs.max() + 200); y0, y1 = max(0, ys.min() - 200), min(1080, ys.max() + 60)
            a, b = rgb[y0:y1, x0:x1], out[y0:y1, x0:x1]
            Image.fromarray(np.hstack([a, b])).save(os.path.join(TESTE, f'{nome}_n{n}.jpg'), quality=90)
        else:
            Image.fromarray(out).save(os.path.join(FIX, f'n{n:06d}.png'))
    return T

if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else 'testar'
    nomes = sys.argv[2:] or list(TOMADAS)
    for nome in nomes:
        t = time.time(); processa(nome, so_ancora=(modo == 'testar')); print(nome, 'ok', f'{time.time() - t:.0f}s')
