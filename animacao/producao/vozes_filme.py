"""Vozes do filme (narrador e personagens) com TTS neural offline (sherpa-onnx + Supertonic 3).

    python3 producao/vozes_filme.py            # gera build/filme/vozes/<id>.wav e vozes.json
    python3 producao/vozes_filme.py --conferir # transcreve de volta (ASR) e mostra o erro por fala

As falas são as do roteiro (docs/roteiro-storyboard-ae-srt.md), sem alteração; "falado" só
ajusta a grafia para a pronúncia sair certa (marcas, siglas, termos em inglês).
Vozes escolhidas por inteligibilidade (ASR com WER 0) e timbre; trocar em VOZES.
"""
import argparse
import json
import os
import re
import unicodedata
import urllib.request

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOD = os.path.join(ROOT, 'build', 'modelos')
OUT = os.path.join(ROOT, 'build', 'filme', 'vozes')
SR = 44100
SUPER = 'sherpa-onnx-supertonic-3-tts-int8-2026-05-11'
URL = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/' + SUPER + '.tar.bz2'

# voz Supertonic (sid) e velocidade por personagem
VOZES = {
    'Narrador': (8, 1.06),
    'Antonialli': (9, 1.0),
    'Bruno': (5, 1.08),
    'Giovanna': (1, 1.12),
    'Paladini': (4, 1.05),
}

TOTVS, AM = 'Tótvis', 'Á i Ême'
FALAS = [
    # cena 1
    ('c1_n1', 'Narrador', 'Todo mundo que já viveu um projeto de ERP conhece esse filme.', 'Todo mundo que já viveu um projeto de é érre pê conhece esse filme.'),
    ('c1_n2', 'Narrador', 'A diferença é quem você chama quando ele começa a dar errado.', None),
    ('c1_n3', 'Narrador', 'A nossa começou com um projeto. E não parou mais de crescer.', None),
    # cena 2
    ('c2_n1', 'Narrador', 'De um lado, a TOTVS: a maior empresa de tecnologia do Brasil.', f'De um lado, a {TOTVS}: a maior empresa de tecnologia do Brasil.'),
    ('c2_n2', 'Narrador', 'Do outro, a A&M Performance: núcleo de excelência em performance da Alvarez & Marsal.',
     f'Do outro, a {AM} Perfórmance: núcleo de excelência em perfórmance da Álvarez e Marsal.'),
    ('c2_n3', 'Narrador', 'Um time de especialistas com mentalidade fazedora e adaptável.', None),
    ('c2_n4', 'Narrador', 'Executivos que já viveram desafios reais.', None),
    ('c2_n5', 'Narrador', 'Gente que entende do jogo.', None),
    ('c2_n6', 'Narrador', 'Tudo começou na Unimed Brasil. Nosso projeto pioneiro.', 'Tudo começou na Unimédi Brasil. Nosso projeto pioneiro.'),
    # cena 3
    ('c3_n1', 'Narrador', 'Tudo começou na maior rede de assistência médica do Brasil.', None),
    ('c3_n2', 'Narrador', 'Depois veio a FUNED, referência em vacinas, medicamentos e biotecnologia.', 'Depois veio a Funédi, referência em vacinas, medicamentos e biotecnologia.'),
    ('c3_n3', 'Narrador', 'Na CAOA, acelerando uma montadora.', 'Na Cá ôa, acelerando uma montadora.'),
    ('c3_n4', 'Narrador', 'E a parceria cruzou fronteiras: John Deere, na Argentina.', 'E a parceria cruzou fronteiras: Djón Díer, na Argentina.'),
    ('c3_n5', 'Narrador', 'Na Hughes, a parceria chegou ao espaço.', 'Na Riúz, a parceria chegou ao espaço.'),
    ('c3_n6', 'Narrador', 'E na Libercon, construindo junto. Literalmente.', 'E na Líbercon, construindo junto. Literalmente.'),
    # cena 4
    ('c4_n1', 'Narrador', 'Projeto após projeto, o aprendizado vira método.', None),
    ('c4_n2', 'Narrador', 'O método vira padrão.', None),
    ('c4_n3', 'Narrador', 'E o padrão gera previsibilidade.', None),
    ('c4_n4', 'Narrador', 'Com o apoio do Delivery Center, os entregáveis viraram cockpits de dashboards para o cliente.',
     'Com o apoio do Delíveri Cênter, os entregáveis viraram cóc-pits de déch-bórds para o cliente.'),
    # cena 5
    ('c5_n1', 'Narrador', 'E quando a gente diz resultado no P&L…', 'E quando a gente diz resultado no pê e éle...'),
    ('c5_n2', 'Narrador', '…é no P&L de todo mundo.', 'é no pê e éle de todo mundo.'),
    ('c5_n3', 'Narrador', 'Uma parceria que não só entrega valor para o cliente.', None),
    ('c5_n4', 'Narrador', 'Ela também cresce o nosso negócio.', None),
    ('c5_g1', 'Giovanna', 'Paladini!', None),
    ('c5_g2', 'Giovanna', 'A TOTVS pagou a nota?', f'A {TOTVS} pagou a nota?'),
    ('c5_p1', 'Paladini', 'Pagou.', None),
    ('c5_a1', 'Antonialli', 'Vamos precisar antecipar algumas notas para o FY26.', 'Vamos precisar antecipar algumas notas para o éfe uai vinte e seis.'),
    ('c5_a2', 'Antonialli', 'Fala com a TOTVS.', f'Fala com a {TOTVS}.'),
    ('c5_gb', 'Giovanna e Bruno', 'Antecipamos as NFs para esse ano fiscal!', 'Antecipamos as ene éfes para esse ano fiscal!'),
    ('c5_a3', 'Antonialli', 'Agora é Operação Collection Zero Defect.', 'Agora é Operação Colécchion Zíro Dífect.'),
    # cena 6
    ('c6_a1', 'Antonialli', 'Começamos com um projeto na Unimed.', 'Começamos com um projeto na Unimédi.'),
    ('c6_a2', 'Antonialli', 'Hoje são seis, em dois países, e R$ 7 milhões só neste ano fiscal.', 'Hoje são seis, em dois países, e sete milhões de reais só neste ano fiscal.'),
    ('c6_a3', 'Antonialli', 'Isso não é sorte. É método e confiança.', None),
    ('c6_n1', 'Narrador', 'Um projeto que gera projetos.', None),
    # valor do FY27 ainda não confirmado: um "bip" no lugar do número ("xis" soaria como "seis")
    ('c6_n2', 'Narrador', 'E mais R$ [X] milhões já a caminho no próximo ano fiscal.', 'E mais [bip] milhões de reais já a caminho no próximo ano fiscal.'),
    ('c6_g1', 'Giovanna', 'Gente…', 'Gente...'),
    ('c6_g2', 'Giovanna', 'Mas pagou a NF?', None),
]


def baixar():
    d = os.path.join(MOD, SUPER)
    if os.path.isdir(d):
        return d
    os.makedirs(MOD, exist_ok=True)
    arq = os.path.join(MOD, SUPER + '.tar.bz2')
    urllib.request.urlretrieve(URL, arq)
    import tarfile
    with tarfile.open(arq) as tf:
        tf.extractall(MOD)
    return d


_tts = None


def motor():
    global _tts
    if _tts is None:
        import sherpa_onnx as so
        d = baixar()
        cfg = so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(supertonic=so.OfflineTtsSupertonicModelConfig(
            duration_predictor=d + '/duration_predictor.int8.onnx', text_encoder=d + '/text_encoder.int8.onnx',
            vector_estimator=d + '/vector_estimator.int8.onnx', vocoder=d + '/vocoder.int8.onnx', tts_json=d + '/tts.json',
            unicode_indexer=d + '/unicode_indexer.bin', voice_style=d + '/voice.bin'), num_threads=3))
        _tts = so.OfflineTts(cfg)
    return _tts


def sintetizar(texto, sid, speed):
    import sherpa_onnx as so
    g = so.GenerationConfig()
    g.sid, g.speed, g.num_steps = sid, speed, 16
    g.extra = {'lang': 'pt'}
    a = motor().generate(texto, g)
    x = np.asarray(a.samples, np.float32)
    if a.sample_rate != SR:
        import scipy.signal as ss
        x = ss.resample_poly(x, SR, a.sample_rate).astype(np.float32)
    return x


def tratar(x):
    """Passa-altas, compressão suave, corte de silêncio, fades e pico em −1 dBFS."""
    import scipy.signal as ss
    b, a = ss.butter(2, 70 / (SR / 2), 'high')
    x = ss.lfilter(b, a, x).astype(np.float32)
    env = np.sqrt(ss.lfilter([1 / 441] * 441, [1], x * x) + 1e-12)
    lim = 0.25
    ganho = np.where(env > lim, (lim / env) ** 0.45, 1.0)
    x = x * ganho
    nivel = np.abs(x) > 0.01 * np.max(np.abs(x))
    idx = np.nonzero(nivel)[0]
    i0, i1 = max(0, idx[0] - int(0.03 * SR)), min(len(x), idx[-1] + int(0.06 * SR))
    x = x[i0:i1]
    f = int(0.012 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return x / np.max(np.abs(x)) * 0.89


def escrever(caminho, x):
    import wave
    with wave.open(caminho, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def gerar():
    os.makedirs(OUT, exist_ok=True)
    saida = []
    for fid, quem, texto, falado in FALAS:
        falado = falado or texto
        if quem == 'Giovanna e Bruno':  # os dois juntos: duas vozes alinhadas no início
            a = sintetizar(falado, *VOZES['Giovanna'])
            b = sintetizar(falado, *VOZES['Bruno'])
            n = max(len(a), len(b))
            x = np.pad(a, (0, n - len(a))) * 0.6 + np.pad(b, (0, n - len(b))) * 0.6
        elif '[bip]' in falado:  # número ainda não confirmado: bip no lugar
            antes, depois = falado.split('[bip]')
            tb = np.arange(int(0.42 * SR)) / SR
            bip = 0.35 * np.sin(2 * np.pi * 1000 * tb) * np.minimum(1, np.minimum(tb, tb[::-1]) / 0.01)
            pausa = np.zeros(int(0.06 * SR), np.float32)
            x = np.concatenate([tratar(sintetizar(antes.strip(), *VOZES[quem])), pausa, bip.astype(np.float32), pausa,
                                tratar(sintetizar(depois.strip(), *VOZES[quem]))])
        else:
            x = sintetizar(falado, *VOZES[quem])
        x = tratar(x)
        escrever(os.path.join(OUT, fid + '.wav'), x)
        saida.append({'id': fid, 'quem': quem, 'texto': texto, 'falado': falado, 'dur': round(len(x) / SR, 3)})
        print(f'{fid:7s} {quem:16s} {len(x) / SR:5.2f} s  {texto}')
    json.dump({'motor': SUPER, 'vozes': VOZES, 'sr': SR, 'falas': saida}, open(os.path.join(OUT, 'vozes.json'), 'w'), indent=1, ensure_ascii=False)
    print(f'total de fala: {sum(f["dur"] for f in saida):.1f} s')


def conferir():
    """ASR (Parakeet) → WER por fala, para pegar pronúncia errada."""
    import jiwer
    import sherpa_onnx as so
    import soundfile as sf
    m = os.path.join(MOD, 'sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8')
    rec = so.OfflineRecognizer.from_transducer(encoder=m + '/encoder.int8.onnx', decoder=m + '/decoder.int8.onnx', joiner=m + '/joiner.int8.onnx',
                                               tokens=m + '/tokens.txt', model_type='nemo_transducer', num_threads=3)

    def norm(s):
        s = ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')
        return ' '.join(re.sub(r'[^\w\s]', ' ', s).split())
    for f in json.load(open(os.path.join(OUT, 'vozes.json')))['falas']:
        a, sr = sf.read(os.path.join(OUT, f['id'] + '.wav'), dtype='float32')
        s = rec.create_stream()
        s.accept_waveform(sr, a)
        rec.decode_stream(s)
        hyp = norm(s.result.text)
        w = jiwer.wer(norm(f['falado']), hyp) if hyp else 1.0
        print(f"{f['id']:7s} WER {w:4.2f} | {s.result.text}")


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--conferir', action='store_true')
    a = ap.parse_args()
    conferir() if a.conferir else gerar()
