"""Narração completa do roteiro na voz "Diego" (ElevenLabs, eleven_multilingual_v2), escolhida pelo usuário.

  python3 producao/narracao_diego.py baixar STATUS.json...   # JSONs de creative_get_flow_run_status → build/azul/diego/tomadas/
  python3 producao/narracao_diego.py montar                  # escolhe a melhor tomada de cada fala e monta os arquivos de entrega

Escolha por fala: fidelidade ao texto (ASR Parakeet) e, no empate, a tomada mais parecida com a amostra que o usuário aprovou
(build/azul/diego/referencia.mp3). Entrega em build/azul/diego/entrega/: a narração completa (pausas de 0,6 s entre falas da
mesma cena e 1,2 s entre cenas) em WAV e MP3, as 30 falas separadas (NN_texto.mp3) num ZIP e o roteiro com os tempos (TXT).
"""
import difflib, json, os, re, subprocess, sys, unicodedata, zipfile
import numpy as np, soundfile as sf

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v21_voz import palavras, norm, aparar, SR, CHAVES

D = os.path.join(RAIZ, 'build', 'azul', 'diego'); TOM = os.path.join(D, 'tomadas'); ENT = os.path.join(D, 'entrega')
FALAS = json.load(open(os.path.join(RAIZ, 'producao', 'dados', 'v19_falas.json')))['falas']
# início de cada cena do vídeo (primeira fala): pausa maior antes delas
CENA = {'l02', 'l11', 'l13', 'l14', 'l16', 'l17', 'l19', 'l20', 'l22', 'l25', 'l28'}
P_FALA, P_CENA, BORDA = 0.6, 1.2, 0.5


def cmd_baixar(arqs):
    os.makedirs(TOM, exist_ok=True)
    S = json.load(open(os.path.join(D, 'sessoes.json')))
    por = {s: fid for fid, v in S.items() if fid.startswith('l') for s in v['s']}
    n = 0
    for arq in arqs:
        R = json.load(open(arq))
        for m in R.get('media', []):
            sess = next((p for p in m['url'].split('/') if p in por), None)
            if sess is None: continue
            dest = os.path.join(TOM, f"{por[sess]}_{m['generation_id']}.mp3")
            if not os.path.exists(dest):
                subprocess.run(['curl', '-sS', '-m', '120', '-o', dest, m['url']], check=True); n += 1
    print('baixadas', n, '; total', len(os.listdir(TOM)))


def ler(p, sr=SR):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).copy()


def nome_arquivo(i, texto):
    t = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode()
    return f'{i + 1:02d}_' + re.sub(r'[^A-Za-z0-9]+', '-', t).strip('-')[:48] + '.mp3'


def cmd_montar():
    import sherpa_onnx as so
    emb = so.SpeakerEmbeddingExtractor(so.SpeakerEmbeddingExtractorConfig(model=os.path.join(RAIZ, 'build', 'modelos', 'wespeaker_en_voxceleb_resnet34_LM.onnx'), num_threads=4))
    def E(x16):
        s = emb.create_stream(); s.accept_waveform(16000, x16); s.input_finished(); v = np.array(emb.compute(s)); return v / np.linalg.norm(v)
    ref = E(ler(os.path.join(D, 'referencia.mp3'), 16000))
    os.makedirs(ENT, exist_ok=True); escolha = {}; clipes = []
    for i, f in enumerate(FALAS):
        cands = []
        for a in sorted(x for x in os.listdir(TOM) if x.startswith(f['id'] + '_')):
            p = os.path.join(TOM, a); x = aparar(ler(p)); nov = palavras(x); rec = ' '.join(w for w, _ in nov)
            nota = difflib.SequenceMatcher(a=norm(rec), b=norm(f['texto'])).ratio() + 0.05 * sum(norm(k) in norm(rec) for k in CHAVES.get(f['id'], []))
            sim = float(E(ler(p, 16000)) @ ref)
            cands.append((round(nota, 2), sim, a, x, rec))
        if not cands: raise SystemExit(f"{f['id']}: sem tomadas")
        cands.sort(key=lambda c: (c[0], c[1]), reverse=True)
        nota, sim, a, x, rec = cands[0]
        escolha[f['id']] = {'tomada': a, 'nota_asr': nota, 'sim_referencia': round(sim, 3), 'dur': round(len(x) / SR, 2), 'asr': rec,
                            'outras': [(c[2], c[0], round(c[1], 3)) for c in cands[1:]]}
        clipes.append((f, x))
        print(f"{f['id']} nota={nota:.2f} sim={sim:.2f} {len(x) / SR:5.2f}s  {rec[:90]}")
    # narração contínua
    partes, t, roteiro = [np.zeros(int(BORDA * SR), np.float32)], BORDA, []
    for i, (f, x) in enumerate(clipes):
        if i:
            p = P_CENA if f['id'] in CENA else P_FALA
            partes.append(np.zeros(int(p * SR), np.float32)); t += p
        roteiro.append(f"{int(t // 60)}:{t % 60:05.2f}  {f['id']}  {f['texto']}")
        partes.append(x); t += len(x) / SR
    partes.append(np.zeros(int(BORDA * SR), np.float32))
    voz = np.concatenate(partes); voz *= 0.89 / np.abs(voz).max()
    wav = os.path.join(ENT, 'Narracao-completa-Diego.wav'); sf.write(wav, voz, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-b:a', '192k', os.path.join(ENT, 'Narracao-completa-Diego.mp3')], check=True)
    # falas separadas
    zp = os.path.join(ENT, 'Narracao-Diego-falas-separadas.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for i, (f, x) in enumerate(clipes):
            tmp = os.path.join(ENT, '_fala.wav'); sf.write(tmp, x * (0.89 / max(1e-6, np.abs(x).max())), SR)
            mp3 = os.path.join(ENT, '_fala.mp3'); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-b:a', '192k', mp3], check=True)
            z.write(mp3, nome_arquivo(i, f['texto']))
        os.remove(tmp); os.remove(mp3)
        z.writestr('roteiro.txt', '\n'.join(roteiro) + '\n')
    open(os.path.join(ENT, 'roteiro-com-tempos.txt'), 'w').write('Narração completa · voz Diego (ElevenLabs, eleven_multilingual_v2)\n\n' + '\n'.join(roteiro) + '\n')
    json.dump(escolha, open(os.path.join(D, 'escolha.json'), 'w'), ensure_ascii=False, indent=1)
    print('total %.1f s' % (len(voz) / SR))


if __name__ == '__main__':
    {'baixar': lambda: cmd_baixar(sys.argv[2:]), 'montar': cmd_montar}[sys.argv[1]]()
