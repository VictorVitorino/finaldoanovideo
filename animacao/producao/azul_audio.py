"""Abertura nova (00:00-01:15) do vídeo azul "Projeto do Ano A&M + TOTVS".

O vídeo original (render pronto, sem código-fonte) é usado como fonte de áudio: a narração é separada da
música (UVR / Kim_Vocal_2), as falas são recortadas por palavra e reposicionadas na linha do tempo nova.
"somando FY26 e FY27" vira "somando 2026 e 2027" com palavras da mesma narradora ("dois mil e vinte e"
de "Em 2027", "seis" de "seis projetos", "2027" de "Rumo a 2027").

Uso: python3 producao/azul_audio.py ORIGINAL.mp4 VOCAIS.flac INSTRUMENTAL.flac
Saída: build/azul/abertura.json (cenas, falas e tempos) e build/azul/abertura.wav (voz + música).
"""
import json, os, sys
import numpy as np
import soundfile as sf

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(RAIZ, 'build', 'azul')
SR = 44100

# trechos da narração original (s, nas faixas separadas); fim ajustado ao silêncio seguinte
FALAS = [
    ('p1', 1.20, 8.40, 'Algumas parcerias começam com *um projeto*. E se transformam em algo *muito maior*.'),
    ('p2', 10.30, 14.62, 'No primeiro ano, foram *seis projetos* vendidos.'),
    ('p3', 15.10, 18.45, '*Vinte profissionais* passaram por essa jornada.'),
    ('p4', 18.95, 22.97, '*Dezesseis milhões* de reais em collections, somando *2026 e 2027*.'),
    ('p5', 26.98, 33.70, 'E ainda: *método integrado*, *inovação* e novas oportunidades de crescimento.'),
    ('p6', 36.20, 41.00, 'Mas como chegamos até aqui? *Voltemos ao começo.*'),
    ('p7', 42.70, 47.70, 'Quem já viveu uma implantação de *ERP* conhece a complexidade.'),
    ('p8', 48.05, 55.40, '*Processos, pessoas, integrações, prazos e riscos* precisam avançar juntos.'),
    ('p9', 57.15, 63.30, 'Quando o desafio exige mais do que tecnologia, é hora de chamar *quem sabe*.'),
    ('p10', 65.05, 70.25, '*TOTVS* na solução. *A&M* na gestão da transformação.'),
    ('p11', 70.40, 74.95, 'Competências complementares, *unidas para fazer acontecer*.'),
]
# pedaços para "2026 e 2027" (fim de p4)
EMENDA = [(22.30, 22.96), None, (174.47, 175.08), (12.20, 12.84), None, (172.44, 172.78), None, (167.00, 168.01)]
PAUSAS = {1: 0.05, 4: 0.10, 6: 0.06}

# cenas novas: (id, duração, [(fala, início relativo na cena)]) — total ~64 s
CENAS = [   # fala com início fixo (s na cena) ou ('+', pausa) logo depois da anterior
    ('capa', 7.8, [('p1', 0.55)]),
    ('resultados', 18.7, [('p2', 0.1), ('p3', ('+', 0.1)), ('p4', ('+', 0.12)), ('p5', ('+', 0.12))]),
    ('tunel', 7.4, [('p6', 1.1)]),
    ('desafio', 13.0, [('p7', 0.5), ('p8', ('+', 0.35))]),
    ('farol', 7.4, [('p9', 0.6)]),
    ('uniao', 10.6, [('p10', 0.6), ('p11', ('+', 0.3))]),
]
VEL = {'p2': 1.14, 'p3': 1.14, 'p4': 1.14, 'p5': 1.14}   # leve aceleração só no mural (ffmpeg atempo)
CORTE_ORIGINAL = 76.10   # o original continua daqui (cena da liderança)


def ler(f):
    a, sr = sf.read(f, dtype='float32')
    if a.ndim > 1:
        a = a.mean(1)
    assert sr == SR, sr
    return a


def trecho(a, t0, t1, fade=0.012):
    x = a[int(t0 * SR):int(t1 * SR)].copy()
    n = int(fade * SR)
    if len(x) > 2 * n:
        x[:n] *= np.linspace(0, 1, n)
        x[-n:] *= np.linspace(1, 0, n)
    return x


def encurta_pausas(x, maxp=0.16, lim_db=-45):
    """Pausas internas mais longas que maxp viram maxp (corte no meio da pausa, com fade curto)."""
    w = int(0.01 * SR)
    e = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, 'same')) + 1e-9)
    sil = e < lim_db
    out, i, n = [], 0, len(x)
    j = 0
    while j < n:
        if sil[j]:
            k = j
            while k < n and sil[k]:
                k += 1
            if j > 0 and k < n and (k - j) > maxp * SR:
                meio = int(maxp * SR) // 2
                out.append(x[i:j + meio]); i = k - meio
            j = k
        else:
            j += 1
    out.append(x[i:])
    return np.concatenate(out)


def atempo(x, k):
    if abs(k - 1) < 1e-3:
        return x
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as d:
        sf.write(d + '/i.wav', x, SR)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', d + '/i.wav', '-filter:a', f'atempo={k}', d + '/o.wav'], check=True)
        return sf.read(d + '/o.wav', dtype='float32')[0]


def main():
    orig, voc_f, ins_f = sys.argv[1:4]
    os.makedirs(OUT, exist_ok=True)
    voc, ins = ler(voc_f), ler(ins_f)
    clips = {}
    for fid, t0, t1, _ in FALAS:
        x = trecho(voc, t0, t1)
        if fid == 'p4':
            partes = []
            for i, e in enumerate(EMENDA):
                partes.append(np.zeros(int(PAUSAS.get(i, 0.04) * SR), np.float32) if e is None else trecho(voc, *e, fade=0.008))
            x = np.concatenate([x[:int((22.30 - t0) * SR)]] + partes)
        clips[fid] = atempo(encurta_pausas(x), VEL.get(fid, 1.0))
    total = sum(c[1] for c in CENAS)
    voz = np.zeros(int((total + 0.5) * SR), np.float32)
    cenas, falas, t = [], [], 0.0
    texto = {f[0]: f[3] for f in FALAS}
    for cid, dur, fs in CENAS:
        cenas.append({'id': cid, 'de': round(t, 3), 'ate': round(t + dur, 3)})
        fim = 0.0
        for fid, rel in fs:
            c = clips[fid]
            if isinstance(rel, tuple):
                rel = fim + rel[1]
            fim = rel + len(c) / SR
            i = int((t + rel) * SR)
            voz[i:i + len(c)] += c
            falas.append({'id': fid, 'de': round(t + rel, 3), 'ate': round(t + rel + len(c) / SR, 3), 'texto': texto[fid]})
            assert t + rel + len(c) / SR <= t + dur + 0.05, (fid, t + rel + len(c) / SR, t + dur)
        t += dur
    voz = voz[:int(total * SR)]
    # música: começo do instrumental original e, com 2,5 s de transição, o trecho que termina no corte
    n = len(voz)
    xf = int(2.5 * SR)
    a1 = ins[:n]
    a2 = ins[int(CORTE_ORIGINAL * SR) - n:int(CORTE_ORIGINAL * SR)]
    meio = int(41.0 * SR)   # transição durante o túnel do tempo
    w = np.clip((np.arange(n) - (meio - xf // 2)) / xf, 0, 1)
    mus = a1 * np.cos(w * np.pi / 2) + a2 * np.sin(w * np.pi / 2)
    mix = voz + mus
    sf.write(os.path.join(OUT, 'abertura.wav'), mix, SR)
    sf.write(os.path.join(OUT, 'abertura_voz.wav'), voz, SR)
    json.dump({'total': round(total, 3), 'corte_original': CORTE_ORIGINAL, 'cenas': cenas, 'falas': falas},
              open(os.path.join(OUT, 'abertura.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'abertura: {total:.1f} s, {len(falas)} falas')
    for f in falas:
        print(f"  {f['id']:4s} {f['de']:6.2f}-{f['ate']:6.2f}  {f['texto'][:60]}")



def palavras():
    """Tempos de cada palavra na voz nova (Parakeet), gravados em abertura.json -> falas[i].palavras."""
    import sherpa_onnx as so
    from scipy.signal import resample_poly
    m = os.path.join(RAIZ, 'build/modelos/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8')
    r = so.OfflineRecognizer.from_transducer(encoder=m + '/encoder.int8.onnx', decoder=m + '/decoder.int8.onnx', joiner=m + '/joiner.int8.onnx',
                                             tokens=m + '/tokens.txt', model_type='nemo_transducer', num_threads=4)
    a = resample_poly(ler(os.path.join(OUT, 'abertura_voz.wav')), 160, 441).astype('float32')
    J = json.load(open(os.path.join(OUT, 'abertura.json')))
    for f in J['falas']:
        t0 = f['de'] - 0.05
        s = r.create_stream(); s.accept_waveform(16000, a[int(t0 * 16000):int((f['ate'] + 0.05) * 16000)]); r.decode_stream(s)
        ws, w = [], None
        for tok, ts in zip(s.result.tokens, s.result.timestamps):
            if tok.startswith(' ') or w is None:
                if w: ws.append(w)
                w = [tok.strip(), round(t0 + ts, 3)]
            else:
                w[0] += tok
        if w: ws.append(w)
        f['palavras'] = ws
    json.dump(J, open(os.path.join(OUT, 'abertura.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
    palavras()
