"""v23: narração inteira na voz do narrador original, gerada no ElevenLabs (voz "Paulo Radames" do workspace do usuário,
modelo eleven_multilingual_v2 — identificada por embedding de locutor: 0,93 de similaridade com a narração do v18,
o mesmo nível de uma fala do v18 comparada com outra). As gerações são feitas pelo conector (4 tomadas por fala, no
flow "Projeto do Ano A&M + TOTVS · narração"); este script só baixa, confere e escolhe.

  python3 producao/v23_voz.py baixar RESULTADO.json...   # JSONs de creative_get_flow_run_status → build/azul/v23/tomadas/<fala>_<k>.mp3
  python3 producao/v23_voz.py escolher                   # ASR (Parakeet) em cada tomada; fica a mais fiel ao texto; empate: duração
                                                         # mais próxima da fala original → build/azul/v23/falas/<fala>.wav + escolha.json
As tomadas são ligadas às falas por build/azul/v23/sessoes.json (session_id → fala), gravado ao disparar as gerações.
"""
import difflib, json, os, subprocess, sys
import numpy as np, soundfile as sf

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v21_voz import palavras, norm, aparar, SR, CHAVES   # ASR por palavras, normalização e corte de silêncio

V23 = os.path.join(RAIZ, 'build', 'azul', 'v23')
TOMADAS, FALAS = os.path.join(V23, 'tomadas'), os.path.join(V23, 'falas')
BASE = json.load(open(os.path.join(RAIZ, 'producao', 'dados', 'v19_falas.json')))['falas']


def sessoes():
    J = json.load(open(os.path.join(V23, 'sessoes.json')))
    return {s: fid for fid, v in J.items() if fid.startswith('l') for s in v['s']}


def cmd_baixar(arquivos):
    os.makedirs(TOMADAS, exist_ok=True); por = sessoes(); n = 0
    for arq in arquivos:
        R = json.load(open(arq))
        gens = {g['id']: g for g in R.get('generations', [])}
        for m in R.get('media', []):
            g = gens.get(m['generation_id'], {})
            # a sessão de cada geração aparece no caminho do content_url (.../content_generation/<sessão>/<geração>/...)
            sess = next((p for p in m['url'].split('/') if p in por), None)
            if sess is None: print('sessão desconhecida', m['generation_id']); continue
            fid = por[sess]; k = sum(1 for f in os.listdir(TOMADAS) if f.startswith(fid + '_')) + 1
            dest = os.path.join(TOMADAS, f'{fid}_{k}.mp3')
            if any(f.startswith(fid + '_') and m['generation_id'] in open(os.path.join(TOMADAS, f) + '.id').read() for f in os.listdir(TOMADAS) if f.endswith('.mp3') and os.path.exists(os.path.join(TOMADAS, f) + '.id')):
                continue
            subprocess.run(['curl', '-sS', '-m', '120', '-o', dest, m['url']], check=True)
            open(dest + '.id', 'w').write(m['generation_id']); n += 1
    print('baixadas', n, 'tomadas; total', len([f for f in os.listdir(TOMADAS) if f.endswith('.mp3')]))


def ler44(p):
    x = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(x, np.float32).copy()


def cmd_escolher():
    os.makedirs(FALAS, exist_ok=True); escolha = {}
    for f in BASE:
        fid = f['id']; dur0 = f['ate'] - f['de']; cands = []
        for arq in sorted(a for a in os.listdir(TOMADAS) if a.startswith(fid + '_') and a.endswith('.mp3')):
            x = aparar(ler44(os.path.join(TOMADAS, arq))); novas = palavras(x)
            rec = norm(' '.join(w for w, _ in novas))
            nota = difflib.SequenceMatcher(a=rec, b=norm(f['texto'])).ratio() + 0.05 * sum(norm(k) in rec for k in CHAVES.get(fid, []))
            cands.append((round(nota, 3), -abs(len(x) / SR - dur0), arq, x, novas))
        if not cands: print(fid, 'SEM TOMADAS'); continue
        cands.sort(key=lambda c: (c[0], c[1]), reverse=True)
        nota, _, arq, x, novas = cands[0]
        sf.write(os.path.join(FALAS, fid + '.wav'), x, SR)
        escolha[fid] = {'tomada': arq, 'nota': nota, 'dur': round(len(x) / SR, 2), 'dur_v18': round(dur0, 2),
                        'asr': ' '.join(w for w, _ in novas), 'palavras': [[w, round(t, 3)] for w, t in novas],
                        'outras': [(c[2], c[0], round(len(c[3]) / SR, 2)) for c in cands[1:]]}
        print(f"{fid} {arq} nota={nota:.2f} dur={len(x) / SR:4.2f}s (v18 {dur0:4.2f}s)  {escolha[fid]['asr'][:95]}")
    json.dump(escolha, open(os.path.join(V23, 'escolha.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    {'baixar': lambda: cmd_baixar(sys.argv[2:]), 'escolher': cmd_escolher}[sys.argv[1]]()
