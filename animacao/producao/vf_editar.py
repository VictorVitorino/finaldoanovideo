"""Edita o vídeo final do usuário (release `videofinal`, Projeto.Totvs.-.Final.do.ano.mp4, sha256 2210d627…) direto
nos quadros, mantendo a narração original (a narradora do v18, deslocada +14,20 s; o vídeo do filme está em +14,70 s).

1. 01:28 · a mandala entra já em "TOTVS na solução…" (no lugar das linhas de luz) e as pausas em volta encolhem:
   corta 0,8 s antes da fala l14, 1,5 s entre l15 e l16 e 0,9 s entre l16 e l17 (áudio e vídeo juntos, −3,2 s).
   A montagem da mandala roda 1:1 e o trecho já montado é desacelerado para cobrir a fala l16. A legenda gravada nos
   quadros da mandala é apagada com uma placa limpa (quadro 95,0 s, sem legenda) e a legenda certa é reaplicada a partir de
   render.mjs (testes legenda_preto/legenda_branco → alfa pela diferença preto/branco).
2. 02:24 em diante (linha do tempo, cockpit, Rumo a 2027) · os quadros vêm do render atual do código no tempo do v18
   (build/azul/vfr/fNNNNN.jpg, t = quadro do vídeo − 14,70 s): Victor na FUNED, visão geral dos três painéis grande e
   centralizada, time lado a lado e foguete com brilho e astronauta de cabeça grande.

Uso: python3 producao/vf_editar.py   → build/azul/Projeto-Totvs-Final-do-ano-v22(.mp4|-leve.mp4)
"""
import os, subprocess
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AZ = os.path.join(RAIZ, 'build', 'azul')
VF = os.path.join(AZ, 'videofinal', 'videofinal.mp4')
VFR = os.path.join(AZ, 'vfr')                       # linha/cockpit/rumo renderizados no tempo do v18
LEG = os.path.join(AZ, 'vf_legenda')               # legendas sobre preto e branco (subpastas preto/ e branco/)
W, H, FPS = 1920, 1080, 30
DESLOC_V = 14.70                                    # quadro do vídeo = t do filme + 14,70
TROCA_DE, TROCA_ATE = 144.0, 170.067 + DESLOC_V     # trecho trocado pelo render novo (tempo do vídeo final)

# cortes de áudio (tempo do vídeo final): l13 termina 83,27 · l14 84,69 · l15 até 93,64 · l16 95,64–103,33 · l17 105,05
AUDIO = [(0.0, 83.6), (84.4, 93.9), (95.4, 103.6), (104.5, None)]
M0, MANDALA, MONTADA, SAI = 83.6, 94.7, 100.0, 103.8   # início da mandala na edição; quadros da mandala no vídeo final
DISS = 0.5
CORTE = 3.2                                         # total removido
N_MONT = M0 + (MONTADA - MANDALA)                   # fim da montagem da mandala (1:1) na edição
N_SAI = SAI - CORTE                                 # daí em diante, vídeo = edição + 3,2
LEG_ATE = 101.3                                     # até aqui a legenda é a reaplicada
PLACA = 95.0                                        # quadro da mandala sem legenda
CX0, CX1, CY0, CY1, PENA = 300, 1620, 925, 1062, 14


def tempo_audio(n):
    """Tempo no vídeo final do áudio que toca no instante n da edição."""
    ini = 0.0
    for a, b in AUDIO:
        dur = (b - a) if b is not None else 1e9
        if n < ini + dur: return a + (n - ini)
        ini += dur
    raise ValueError(n)


def fonte_video(n):
    """Lista [(tempo no vídeo final, peso)] dos quadros que compõem o instante n da edição."""
    if n < M0: return [(n, 1.0)]
    if n < N_MONT:
        m = [(MANDALA + n - M0, 1.0)]
        if n < M0 + DISS:
            a = (n - M0) / DISS
            return [(n, 1 - a), (m[0][0], a)]
        return m
    if n < N_SAI:
        v = MONTADA + (n - N_MONT) * (SAI - MONTADA) / (N_SAI - N_MONT)
        return [(v, 1.0)]
    return [(n + CORTE, 1.0)]


class Leitor:
    """Lê os quadros do vídeo final em ordem (com o trecho trocado pelo render novo), guardando os últimos."""
    def __init__(self):
        self.p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', VF, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
        self.i, self.cache = -1, {}
        self.fixos = {k: None for k in range(round(M0 * FPS), round((M0 + DISS) * FPS) + 2)}   # farol do dissolve

    def quadro(self, k):
        while self.i < k:
            b = self.p.stdout.read(W * H * 3)
            if len(b) < W * H * 3: return self.cache[self.i]
            self.i += 1; self.cache[self.i] = np.frombuffer(b, np.uint8).reshape(H, W, 3)
            if self.i in self.fixos: self.fixos[self.i] = self.cache[self.i]
            for j in [j for j in self.cache if j < self.i - 40]: del self.cache[j]
        f = self.fixos[k] if self.fixos.get(k) is not None else self.cache[k]
        t = k / FPS
        if TROCA_DE <= t < TROCA_ATE:
            arq = os.path.join(VFR, f'f{round((t - DESLOC_V) * FPS):05d}.jpg')
            f = np.asarray(Image.open(arq).convert('RGB'))
        return f


def main():
    rd = Leitor()
    placa = None
    yy, xx = np.mgrid[CY0:CY1, CX0:CX1]
    d = np.minimum.reduce([xx - CX0, CX1 - 1 - xx, yy - CY0, CY1 - 1 - yy]).astype(np.float32)
    mask = np.clip(d / PENA, 0, 1)[..., None]
    total_vf = 210.1
    n_tot = round((total_vf - CORTE) * FPS)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', os.path.join(AZ, 'vf_video.mp4')], stdin=subprocess.PIPE)
    for N in range(n_tot):
        n = N / FPS
        partes = []
        for v, w in fonte_video(n):
            k = min(round(v * FPS), round(total_vf * FPS) - 1)
            f = rd.quadro(k)
            if placa is None and k == round(PLACA * FPS): placa = f[CY0:CY1, CX0:CX1].astype(np.float32)
            partes.append((f.astype(np.float32), w))
        out = sum(f * w for f, w in partes)
        if M0 <= n < LEG_ATE:
            if placa is None: placa = rd.quadro(round(PLACA * FPS))[CY0:CY1, CX0:CX1].astype(np.float32)
            reg = out[CY0:CY1, CX0:CX1]
            out[CY0:CY1, CX0:CX1] = reg * (1 - mask) + placa * mask
            tc = tempo_audio(n) - DESLOC_V
            q = round(tc * FPS)
            pr = os.path.join(LEG, 'preto', f'f{q:05d}.jpg'); br = os.path.join(LEG, 'branco', f'f{q:05d}.jpg')
            if os.path.exists(pr):
                P = np.asarray(Image.open(pr).convert('RGB'), np.float32)[900:1066]
                B = np.asarray(Image.open(br).convert('RGB'), np.float32)[900:1066]
                a = np.clip(1 - (B - P).mean(2, keepdims=True) / 255, 0, 1)
                out[900:1066] = out[900:1066] * (1 - a) + P
        enc.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    # áudio: trechos do vídeo final com cruzamentos de 40 ms
    sr = 48000
    x = subprocess.run(['ffmpeg', '-v', 'error', '-i', VF, '-vn', '-ac', '2', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True).stdout
    A = np.frombuffer(x, np.float32).reshape(-1, 2)
    xf = int(0.04 * sr); res = None
    for a, b in AUDIO:
        seg = A[int(a * sr):(int(b * sr) if b is not None else len(A))].copy()
        if res is None: res = seg; continue
        r = np.linspace(0, 1, xf)[:, None]
        res[-xf:] = res[-xf:] * (1 - r) + seg[:xf] * r
        res = np.concatenate([res, seg[xf:]])
    import soundfile as sf
    sf.write(os.path.join(AZ, 'vf_audio.wav'), res, sr)
    for nome, crf in [('Projeto-Totvs-Final-do-ano-v22.mp4', None), ('Projeto-Totvs-Final-do-ano-v22-leve.mp4', 27)]:
        v = ['-c:v', 'copy'] if crf is None else ['-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p']
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(AZ, 'vf_video.mp4'), '-i', os.path.join(AZ, 'vf_audio.wav'), '-map', '0:v', '-map', '1:a',
                        *v, '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', os.path.join(AZ, nome)], check=True)
        print(nome, round(os.path.getsize(os.path.join(AZ, nome)) / 1e6, 1), 'MB')


if __name__ == '__main__':
    main()
