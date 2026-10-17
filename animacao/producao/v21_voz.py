"""v21: narração nova com a voz "Narrador" do filme SpecForge (Supertonic 3, voz 8, 1,06x), mesmo texto das 30 legendas do
v18, pausas curtas; trilha instrumental do v18 (UVR Kim_Vocal_2) por baixo. Os tempos das palavras (Parakeet) são alinhados
à tokenização antiga (producao/dados/v19_falas.json) para os índices usados pelas cenas não mudarem.

Saídas: build/azul/v21/voz.wav, build/azul/v21/mix.wav, build/azul/v19.json (falas + cenas + total) e
producao/dados/v21_falas.json (cópia versionada).
Uso: python3 producao/v21_voz.py voz [l10,l25]   # sintetiza (falas listadas de novo; as demais vêm do cache), confere por ASR,
                                                  # monta a linha do tempo e grava o JSON
     python3 producao/v21_voz.py mix   # voz + instrumental (precisa de build/azul/v21/*Instrumental*.flac)
"""
import difflib, json, os, re, sys, unicodedata
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AZ = os.path.join(RAIZ, 'build', 'azul'); OUT = os.path.join(AZ, 'v21'); MOD = os.path.join(RAIZ, 'build', 'modelos')
SR = 44100
VOZ, VEL = 8, 1.06            # voz e velocidade do "Narrador" (producao/vozes_filme.py: VOZES['Narrador'])
INICIO, FIM, PAUSA = 0.9, 2.5, 0.32
PAUSA_ANTES = {'l02': 0.6, 'l11': 1.3, 'l13': 0.5, 'l14': 0.35, 'l16': 0.35, 'l17': 0.4, 'l18': 0.45, 'l19': 0.6, 'l20': 0.6, 'l22': 0.6, 'l25': 0.5, 'l28': 0.6}
# grafia para a pronúncia (marcas, siglas, inglês); o texto da legenda não muda
PRON = [('Alvarez & Marsal', 'Álvares e Marsál'), ('TOTVS', 'Tótus'), ('A&M', 'Á i Ême'), ('ERP', 'E, R, P,'), ('TMO', 'Tê Eme Ó'),
        ('MITs', 'mits'), ('skills', 'squils'), ('Xray', 'Éks-rei'), ('cockpit', 'cóck pit'), ('Delivery Center', 'Delíveri Cênter'),
        ('Cross-sell', 'Cróss-sél'), ('collections', 'colécxions'), ('Cutover', 'Cât-ôver'), ('Unimed', 'Unimédi'), ('FUNED', 'Funédi'),
        ('CAOA', 'Cá-ôa'), ('John Deere', 'Djón Díer'), ('Hughes', 'Riúz'), ('Libercon', 'Líbercon'), ('Antonialli', 'Antoniáli'),
        ('2026', 'dois mil e vinte e seis'), ('2027', 'dois mil e vinte e sete')]
# limites das cenas relativos às falas (id da fala, deslocamento em s) e duração do dissolve de entrada da próxima
CENAS = [('capa', None, 0), ('dashboard', 'l02', -0.48), ('erp', 'l11', -0.3), ('farol', 'l13', -0.43), ('uniao', 'l14', 0.44),
         ('papeis', 'l15', -0.35), ('metodologia', 'l17', -0.45), ('tmo', 'l19', -0.5), ('original', 'l20', -0.5), ('linha', 'l22', -0.6),
         ('cockpit', 'l25', -0.32), ('rumo', 'l28', -0.7)]
TRANS = {'dashboard': 1.2, 'erp': 1.0}

_tts = None
def tts():
    global _tts
    if _tts is None:
        import sherpa_onnx as so
        d = os.path.join(MOD, 'sherpa-onnx-supertonic-3-tts-int8-2026-05-11')
        cfg = so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(supertonic=so.OfflineTtsSupertonicModelConfig(
            duration_predictor=d + '/duration_predictor.int8.onnx', text_encoder=d + '/text_encoder.int8.onnx', vector_estimator=d + '/vector_estimator.int8.onnx',
            vocoder=d + '/vocoder.int8.onnx', tts_json=d + '/tts.json', unicode_indexer=d + '/unicode_indexer.bin', voice_style=d + '/voice.bin'), num_threads=4))
        _tts = so.OfflineTts(cfg)
    return _tts

def sintetizar(texto):
    import sherpa_onnx as so
    g = so.GenerationConfig(); g.sid, g.speed, g.num_steps = VOZ, VEL, 16; g.extra = {'lang': 'pt'}
    a = tts().generate(texto, g); x = np.asarray(a.samples, np.float32)
    if a.sample_rate != SR: x = resample_poly(x, SR, a.sample_rate).astype(np.float32)
    return x

_asr = None
def asr():
    global _asr
    if _asr is None:
        import sherpa_onnx as so
        m = os.path.join(MOD, 'sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8')
        _asr = so.OfflineRecognizer.from_transducer(encoder=m + '/encoder.int8.onnx', decoder=m + '/decoder.int8.onnx', joiner=m + '/joiner.int8.onnx', tokens=m + '/tokens.txt', model_type='nemo_transducer', num_threads=4)
    return _asr

def palavras(x44):
    """palavras reconhecidas (texto, instante relativo) num clipe 44,1 kHz"""
    x = resample_poly(x44, 160, 441).astype(np.float32)
    s = asr().create_stream(); s.accept_waveform(16000, x); asr().decode_stream(s)
    ws, w = [], None
    for tok, ts in zip(s.result.tokens, s.result.timestamps):
        if tok.startswith(' ') or w is None:
            if w: ws.append(w)
            w = [tok.strip(), round(ts, 3)]
        else: w[0] += tok
    if w: ws.append(w)
    return ws

def norm(s):
    s = unicodedata.normalize('NFKD', s.lower()); s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '', s)

def alinhar(antigas, novas):
    """mesma quantidade de entradas que `antigas` (tokenização do v18), com os instantes das `novas` (ASR da voz nova)"""
    A = [norm(w) for w, _ in antigas]; N = [norm(w) for w, _ in novas]
    sm = difflib.SequenceMatcher(a=A, b=N, autojunk=False); mapa = {}
    for tag, i0, i1, j0, j1 in sm.get_opcodes():
        if tag == 'equal':
            for k in range(i1 - i0): mapa[i0 + k] = novas[j0 + k][1]
        elif tag == 'replace':
            for k in range(i1 - i0): mapa[i0 + k] = novas[min(j1 - 1, j0 + round(k * (j1 - j0) / max(1, i1 - i0)))][1]
    # faltantes: interpola entre vizinhos conhecidos (ou proporcional no clipe)
    tempos = []
    for i in range(len(A)):
        if i in mapa: tempos.append(mapa[i]); continue
        ant = max([k for k in mapa if k < i], default=None); dep = min([k for k in mapa if k > i], default=None)
        if ant is not None and dep is not None: tempos.append(mapa[ant] + (mapa[dep] - mapa[ant]) * (i - ant) / (dep - ant))
        elif ant is not None: tempos.append(mapa[ant] + 0.25 * (i - ant))
        elif dep is not None: tempos.append(max(0, mapa[dep] - 0.25 * (dep - i)))
        else: tempos.append(novas[min(len(novas) - 1, round(i * len(novas) / len(A)))][1] if novas else 0.3 * i)
    return [[antigas[i][0], round(float(tempos[i]), 3)] for i in range(len(A))]

def aparar(x, lim_db=-42):
    e = np.abs(x); lim = 10 ** (lim_db / 20) * max(1e-6, e.max()); idx = np.where(e > lim)[0]
    a, b = (idx[0], idx[-1] + 1) if len(idx) else (0, len(x))
    a = max(0, a - int(0.02 * SR)); b = min(len(x), b + int(0.08 * SR))
    return x[a:b]

TENTATIVAS = 3
CHAVES = {'l10': ['cockpit'], 'l25': ['cockpit'], 'l11': ['erp'], 'l17': ['testes', 'cutover'], 'l20': ['guilherme', 'quintão']}

def nota(f, novas):
    """Semelhança do ASR com o texto + 0,05 por palavra-chave reconhecida (nomes e termos que o ASR confunde fácil)."""
    rec = norm(' '.join(w for w, _ in novas))
    return difflib.SequenceMatcher(a=rec, b=norm(f['texto'])).ratio() + 0.05 * sum(norm(k) in rec for k in CHAVES.get(f['id'], []))

def cmd_voz():
    os.makedirs(OUT, exist_ok=True)
    base = json.load(open(os.path.join(RAIZ, 'producao', 'dados', 'v19_falas.json')))['falas']
    clipes, falas, t = [], [], INICIO
    refazer = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else set()
    cache = os.path.join(OUT, 'falas'); os.makedirs(cache, exist_ok=True)
    for f in base:
        arq = os.path.join(cache, f['id'] + '.wav')
        if os.path.exists(arq) and f['id'] not in refazer:
            x = sf.read(arq, dtype='float32')[0]; novas = palavras(x); ok = nota(f, novas)
        else:                                     # a síntese varia a cada chamada: até TENTATIVAS versões, fica a mais clara no ASR
            txt = f['texto']
            for a, b in PRON: txt = txt.replace(a, b)
            melhor = None
            for _ in range(TENTATIVAS):
                x = aparar(sintetizar(txt)); novas = palavras(x); ok = nota(f, novas)
                if melhor is None or ok > melhor[0]: melhor = (ok, x, novas)
                if ok >= 0.99 + 0.05 * len(CHAVES.get(f['id'], [])): break
            ok, x, novas = melhor; sf.write(arq, x, SR)
        rec = ' '.join(w for w, _ in novas)
        print(f"{f['id']} {len(x) / SR:5.2f}s  nota={ok:.2f}  {rec[:110]}")
        if f['id'] in PAUSA_ANTES: t += PAUSA_ANTES[f['id']]
        elif falas: t += PAUSA
        pal = alinhar(f['palavras'], novas)
        falas.append({'id': f['id'], 'texto': f['texto'], 'de': round(t, 3), 'ate': round(t + len(x) / SR, 3), 'palavras': [[w, round(t + ts, 3)] for w, ts in pal]})
        clipes.append((t, x)); t += len(x) / SR
    total = round(t + FIM, 3)
    voz = np.zeros(int(total * SR) + SR, np.float32)
    for t0, x in clipes:
        i = int(t0 * SR); voz[i:i + len(x)] += x
    voz = voz[:int(total * SR)]
    pico = np.abs(voz).max(); voz *= 0.89 / pico
    sf.write(os.path.join(OUT, 'voz.wav'), voz, SR)
    # cenas
    por = {f['id']: f for f in falas}; cenas = []
    for i, (cid, fid, off) in enumerate(CENAS):
        de = 0.0 if fid is None else round(por[fid]['de'] + off, 3)
        cenas.append({'id': cid, 'de': de, **({'trans': TRANS[cid]} if cid in TRANS else {})})
    for i, c in enumerate(cenas): c['ate'] = cenas[i + 1]['de'] if i + 1 < len(cenas) else total
    J = {'total': total, 'voz': 'supertonic3 sid 8 x1.06', 'falas': falas, 'cenas': cenas}
    json.dump(J, open(os.path.join(AZ, 'v19.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(J, open(os.path.join(RAIZ, 'producao', 'dados', 'v21_falas.json'), 'w'), ensure_ascii=False, indent=1)
    print('total', total, 's'); print('cenas', [(c['id'], c['de']) for c in cenas])

def cmd_mix():
    J = json.load(open(os.path.join(AZ, 'v19.json'))); total = J['total']
    voz, sr = sf.read(os.path.join(OUT, 'voz.wav'), dtype='float32'); assert sr == SR
    inst = [f for f in os.listdir(OUT) if 'Instrumental' in f and f.endswith('.flac')]
    if not inst: raise SystemExit('instrumental não encontrado em ' + OUT)
    m, sr2 = sf.read(os.path.join(OUT, inst[0]), dtype='float32'); assert sr2 == SR
    if m.ndim > 1: m = m.mean(1)
    n = int(total * SR)
    if len(m) < n: m = np.concatenate([m, np.zeros(n - len(m), np.float32)])
    m = m[:n].copy()
    # música -16 dB sob a voz (ducking simples pelo envelope da voz) e -9 dB nos silêncios; fade final 2 s
    env = np.abs(voz[:n]); k = int(0.05 * SR); env = np.convolve(env, np.ones(k) / k, mode='same'); duck = np.where(env > 0.01, 10 ** (-16 / 20), 10 ** (-9 / 20))
    duck = np.convolve(duck, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same')
    m *= duck; m[-2 * SR:] *= np.linspace(1, 0, 2 * SR)
    mix = voz[:n] + m; mix *= min(1, 0.95 / np.abs(mix).max())
    sf.write(os.path.join(OUT, 'mix.wav'), mix, SR); print('mix', round(n / SR, 2), 's')

if __name__ == '__main__':
    {'voz': cmd_voz, 'mix': cmd_mix}[sys.argv[1] if len(sys.argv) > 1 else 'voz']()
