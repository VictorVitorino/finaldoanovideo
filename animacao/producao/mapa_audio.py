"""Vídeo "Mapa de Perfil Cognitivo · Mapa de Adoção" (LinkedIn, 1080x1350): narração, trilha e efeitos.

  python3 producao/mapa_audio.py [--take doug2s]

Entrada:  audio/mapa/<take>.mp3         narração do ElevenLabs (voz "Doug - Warm", eleven_v4). A take doug2s é a doug2 sem a
                                        assinatura falada: a voz termina em "Gestão da Mudança." e a marca entra só na imagem
          audio/mapa/<take>.words.json  tempo de cada palavra (eleven_scribe_v1)
Saídas:   build/mapa/trilha.wav   -> narração + música + efeitos, mixados
          src/mapa/tempos.json    -> palavras no tempo final, início de cada cena, legendas e marcas

A fala não é acelerada. Cada frase é recortada no silêncio natural e recolocada com um respiro
planejado entre as frases, para a animação ter tempo de construir o mapa. O total fica abaixo de 90 s.
"""
import json
import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dts60_audio import (SR, decode, encode_wav, ponto_de_corte, add, nota, mtof, kick, hat, whoosh, pop, sino,  # noqa: E402
                         riser, impacto, tique)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALVO = 88.0      # duração desejada (s); o teto do pedido é 90 s
TETO = 89.6

# Roteiro em frases: (cena que a frase abre, nº de palavras). Total = 167 palavras.
FRASES = [
    ('gancho', 17),    # Duas pessoas. A mesma ferramenta. O mesmo treinamento. Uma delas adota. A outra volta para a planilha.
    ('porque', 13),    # Não é má vontade. É perfil: como cada pessoa percebe, avalia e decide.
    ('titulo', 8),     # Por isso existe o Mapa de Perfil Cognitivo.
    ('perfil', 25),    # Em cada pessoa, mapeamos cinco sinais: clareza do porquê, fluência digital, autonomia para aprender, segurança para errar, e o valor que ela vê na mudança.
    ('regua', 17),     # Esses sinais mostram onde ela está hoje na régua de adoção: resiste, observa, experimenta, adota, ou multiplica.
    ('mapa', 12),      # Junte as posições, área por área, e nasce o Mapa de Adoção.
    ('acoes', 23),     # Com ele, a Gestão da Mudança deixa de ser receita única. Escuta para quem resiste. Prática para quem experimenta. Palco para quem multiplica.
    ('vivo', 30),      # Mas o mapa precisa estar vivo. Posição é momento, não rótulo: pessoas avançam, travam, recuam. A cada onda, medimos de novo e ajustamos o plano, antes e depois do go-live.
    ('pergunta', 10),  # No seu projeto, você sabe onde cada pessoa está hoje?
    ('fecho', 9),      # Adoção não se impõe. Se constrói. Pessoa por pessoa.
    (None, 3),         # Gestão da Mudança. (depois disso a marca pessoal entra só na imagem)
]
# respiro planejado DEPOIS de cada frase (s), antes do ajuste fino para fechar em ALVO
RESPIRO = [1.0, 0.85, 1.5, 1.0, 1.15, 1.35, 1.0, 1.25, 0.9, 0.75]
ABERTURA = 0.9   # antes da primeira palavra (a capa já está na tela)
FINAL = 4.3      # segura o quadro final depois da última palavra
ORDEM = ['gancho', 'porque', 'titulo', 'perfil', 'regua', 'mapa', 'acoes', 'vivo', 'pergunta', 'fecho']
# fração do respiro anterior que ainda pertence à cena que termina (o resto já é a cena nova)
CORTE = {'porque': 0.5, 'titulo': 0.45, 'perfil': 0.62, 'regua': 0.5, 'mapa': 0.5, 'acoes': 0.55, 'vivo': 0.5, 'pergunta': 0.6, 'fecho': 0.5}

# Texto exibido na legenda (mesma ordem das 170 palavras faladas)
EXIBE = {'and': '&'}
# Blocos da legenda (índices de palavra, inclusive)
LEGENDAS = [(0, 1), (2, 7), (8, 10), (11, 16), (17, 20), (21, 22), (23, 29), (30, 37), (38, 43), (44, 46), (47, 48),
            (49, 51), (52, 54), (55, 62), (63, 68), (69, 73), (74, 79), (80, 85), (86, 91), (92, 97), (98, 102),
            (103, 106), (107, 110), (111, 114), (115, 120), (121, 125), (126, 129), (130, 135), (136, 139), (140, 144),
            (145, 147), (148, 154), (155, 158), (159, 160), (161, 163), (164, 166)]
DESTAQUE = [10, 16, 22, 26, 27, 29, 34, 35, 36, 37, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 57, 69, 71, 72, 73,
            74, 75, 76, 77, 79, 89, 90, 91, 101, 102, 103, 107, 111, 120, 123, 125, 127, 128, 129, 132, 139, 140, 142, 144,
            154, 158, 160, 161, 162, 163]

# Marcas: índice da palavra que dispara cada evento da animação (as cenas leem estas chaves em T.marcas)
MARCAS = {
    'duas': 0, 'ferramenta': 4, 'treinamento': 7, 'adota': 10, 'outra': 12, 'planilha': 16,
    'ma_vontade': 19, 'perfil': 22, 'percebe': 26, 'avalia': 27, 'decide': 29,
    'por_isso': 30, 'mapa_perfil': 34, 'cognitivo': 37,
    'cada_pessoa': 39, 'cinco': 42, 'sinal1': 44, 'sinal2': 47, 'sinal3': 49, 'sinal4': 52, 'sinal5': 57, 'mudanca': 62,
    'esses_sinais': 63, 'hoje': 69, 'regua': 71, 'nivel1': 74, 'nivel2': 75, 'nivel3': 76, 'nivel4': 77, 'nivel5': 79,
    'junte': 80, 'area': 83, 'nasce': 87, 'mapa_adocao': 89,
    'com_ele': 92, 'receita': 101, 'escuta': 103, 'pratica': 107, 'palco': 111,
    'vivo': 120, 'momento': 123, 'rotulo': 125, 'avancam': 127, 'travam': 128, 'recuam': 129,
    'onda': 132, 'medimos': 133, 'plano': 139, 'antes': 140, 'depois': 142, 'golive': 144,
    'seu_projeto': 147, 'voce_sabe': 148, 'hoje2': 154,
    'adocao': 155, 'impoe': 158, 'constroi': 160, 'pessoa_por_pessoa': 161, 'gestao': 164, 'mudanca_final': 166,
}


def musica(T, drop, fim):
    """Trilha calma em Dó maior, 96 bpm: pad + piano; a partir de `drop` entram baixo, arpejo e pulso leve."""
    buf = np.zeros(int(T * SR) + SR)
    beat = 60 / 96
    comp = 4 * beat
    acordes = [(57, 60, 64, 67), (53, 57, 60, 64), (60, 64, 67, 71), (55, 59, 62, 67)]  # Am7 Fmaj7 Cmaj7 G
    baixos = [33, 29, 36, 31]
    t, k = 0.0, 0
    while t < T:
        ac = acordes[k % 4]
        intro = t < drop - 0.01
        final = t >= fim - 0.01
        for m in ac[:3]:
            add(buf, nota(mtof(m + 12), comp + 0.8, 'pad', 0.026), t)
        seq = [ac[0] + 24, ac[2] + 24, ac[1] + 24, ac[3] + 12]
        for i in range(4):
            add(buf, nota(mtof(seq[i]), 1.4, 'piano', 0.045 if intro or final else 0.03), t + i * beat)
        if not intro and not final:
            add(buf, nota(mtof(baixos[k % 4] + 12), comp, 'bass', 0.075), t)
            arp = [ac[0] + 24, ac[1] + 24, ac[2] + 24, ac[3] + 24, ac[2] + 24, ac[1] + 24, ac[0] + 24, ac[1] + 24]
            for i in range(8):
                add(buf, nota(mtof(arp[i]), 0.32, 'pluck', 0.022), t + i * beat / 2)
            for i in range(4):
                tb = t + i * beat
                if i % 2 == 0:
                    add(buf, kick(0.13), tb)
                add(buf, hat(int(tb * 997), 0.014), tb + beat / 2)
        t += comp
        k += 1
    return buf[:int(T * SR)]


def main():
    take = 'doug2s'
    if '--take' in sys.argv:
        take = sys.argv[sys.argv.index('--take') + 1]
    pal = json.load(open(os.path.join(ROOT, f'audio/mapa/{take}.words.json')))['words']
    pal = [w for w in pal if w['type'] == 'word' and not w['text'].startswith('[')]
    total_palavras = sum(n for _, n in FRASES)
    assert len(pal) == total_palavras, f'esperava {total_palavras} palavras, veio {len(pal)}'
    voz = decode(os.path.join(ROOT, f'audio/mapa/{take}.mp3'))
    dur_voz = len(voz) / SR
    # normaliza a voz: RMS dos trechos falados em -18 dBFS
    hop = SR // 50
    nfr = len(voz) // hop
    fr = np.sqrt(np.mean(voz[:nfr * hop].reshape(nfr, hop) ** 2, axis=1))
    falado = fr[fr > np.max(fr) * 0.08]
    voz *= 10 ** (-18 / 20) / max(1e-6, float(np.sqrt(np.mean(falado ** 2))))
    voz = np.tanh(voz * 1.1) / 1.1

    lim, i = [], 0
    for _, n in FRASES:
        lim.append((i, i + n - 1))
        i += n
    cortes = []
    for k in range(len(FRASES) - 1):
        a = pal[lim[k][1]]['end'] - 0.05
        b = pal[lim[k + 1][0]]['start'] + 0.05
        q0, q1 = ponto_de_corte(voz, a, max(b, a + 0.05))
        cortes.append((min(q0 + 0.07, q1), max(q1 - 0.05, q0)))
    seg_ini = [max(0.0, pal[0]['start'] - 0.06)] + [c[1] for c in cortes]
    seg_fim = [c[0] for c in cortes] + [min(dur_voz, pal[-1]['end'] + 0.25)]
    fala = sum(b - a for a, b in zip(seg_ini, seg_fim))

    # ajuste fino dos respiros para fechar em ALVO (nos dois sentidos), sem passar do TETO
    resp = list(RESPIRO)
    fator = (ALVO - fala - ABERTURA - FINAL) / sum(resp)
    resp = [float(np.clip(r * fator, 0.35, 2.2)) for r in resp]
    T = round(fala + ABERTURA + sum(resp) + FINAL, 2)
    assert T <= TETO, f'vídeo com {T:.1f} s passa do teto de {TETO} s: corte texto ou respiros'

    buf_voz = np.zeros(int((T + 1) * SR))
    novo_ini = []
    pos = ABERTURA
    fade = int(0.012 * SR)
    for k, (a, b) in enumerate(zip(seg_ini, seg_fim)):
        seg = voz[int(a * SR):int(b * SR)].copy()
        seg[:fade] *= np.linspace(0, 1, fade)
        seg[-fade:] *= np.linspace(1, 0, fade)
        novo_ini.append(pos)
        add(buf_voz, seg, pos)
        pos += (b - a) + (resp[k] if k < len(resp) else 0)

    def mapa(tw, k):
        return round(novo_ini[k] + (tw - seg_ini[k]), 3)

    palavras = []
    for k, (i0, i1) in enumerate(lim):
        for i in range(i0, i1 + 1):
            w = pal[i]
            txt = w['text']
            limpo = txt.strip('.,!?:;…').lower()
            if limpo in EXIBE:
                txt = EXIBE[limpo] + txt[len(txt.rstrip('.,!?:;…')):]
            palavras.append({'w': txt, 'a': mapa(w['start'], k), 'b': mapa(w['end'], k), 'frase': k})

    def wa(i):
        return palavras[i]['a']

    def wb(i):
        return palavras[i]['b']

    cenas = {'gancho': 0.0}
    for k, (cid, _) in enumerate(FRASES):
        if k == 0 or cid is None:
            continue
        fim_ant = wb(lim[k - 1][1])
        cenas[cid] = round(fim_ant + resp[k - 1] * CORTE[cid], 3)
    cenas = {c: cenas[c] for c in ORDEM}
    marcas = {k: {'i': i, 'a': wa(i), 'b': wb(i)} for k, i in MARCAS.items()}

    # ---- mix ----
    mus = musica(T, cenas['perfil'] - 0.02, cenas['pergunta'])
    buf = np.zeros(int(T * SR))
    vz = buf_voz[:len(buf)]
    n = len(buf) // hop
    env_v = np.sqrt(np.mean(vz[:n * hop].reshape(n, hop) ** 2, axis=1))
    duck = np.interp(np.arange(len(buf)), np.arange(n) * hop + hop / 2, np.where(env_v > 0.02, 0.3, 0.78))
    kk = int(0.15 * SR)
    duck = np.convolve(duck, np.ones(kk) / kk, mode='same')
    fade_out = np.clip((T - np.arange(len(buf)) / SR) / 1.6, 0, 1)
    fade_in = np.clip(np.arange(len(buf)) / SR / 0.5, 0, 1)
    buf += mus * duck * fade_out * fade_in
    buf += vz

    sfx = []

    def fx(x, t, nome):
        add(buf, x, t)
        sfx.append({'t': round(t, 3), 's': nome})

    # Trilha limpa: poucos efeitos, baixos, só nos momentos que a imagem marca.
    # cortes entre cenas (menos o título, que tem riser + impacto)
    for i, cid in enumerate(ORDEM[1:]):
        if cid in ('titulo',):
            continue
        fx(whoosh(0.45, 0.05, seed=i + 3), cenas[cid] - 0.24, 'whoosh')
    # gancho: uma adota, a outra volta para a planilha
    fx(sino(0.05, 91), wa(10) - 0.02, 'sino')
    fx(pop(420, 0.08), wa(16) + 0.1, 'pop')
    # porquê: três verbos
    for j, m in enumerate(('percebe', 'avalia', 'decide')):
        fx(pop(700 + 90 * j, 0.06), wa(MARCAS[m]), 'pop')
    # título: riser + impacto no "Mapa"
    fx(riser(1.2, 0.045, 5), wa(34) - 1.2, 'riser')
    fx(impacto(0.14), wa(34) - 0.02, 'impacto')
    # perfil: cada sinal acende um eixo do radar
    for j in range(5):
        fx(pop(620 + 70 * j, 0.06), wa(MARCAS[f'sinal{j + 1}']) - 0.02, 'pop')
    # régua: cada marca nasce na estrada
    for j in range(5):
        fx(pop(560 + 80 * j, 0.055), wa(MARCAS[f'nivel{j + 1}']) + 0.04, 'pop')
    # mapa: um sino quando o mapa nasce
    fx(sino(0.06, 86), wa(89) + 0.05, 'sino')
    # ações
    for j, m in enumerate(('escuta', 'pratica', 'palco')):
        fx(pop(640 + 110 * j, 0.07), wa(MARCAS[m]) - 0.02, 'pop')
    # vivo: go-live
    fx(sino(0.06, 91), wa(144) + 0.02, 'sino')
    # pergunta e fecho
    fx(impacto(0.09), wa(155) - 0.02, 'impacto')
    fx(sino(0.08, 84), wa(164) - 0.05, 'sino')
    fx(sino(0.08, 91), wb(166) + 0.4, 'sino')     # a marca pessoal entra na imagem, depois da última palavra

    pico = np.max(np.abs(buf))
    buf *= 0.89 / pico
    os.makedirs(os.path.join(ROOT, 'build/mapa'), exist_ok=True)
    encode_wav(buf, os.path.join(ROOT, 'build/mapa/trilha.wav'))

    out = {
        'duracao': T, 'take': take, 'cenas': cenas, 'ordem': ORDEM, 'palavras': palavras, 'marcas': marcas,
        'frases': [{'de': a, 'ate': b} for a, b in lim], 'legendas': [{'de': a, 'ate': b} for a, b in LEGENDAS],
        'destaque': DESTAQUE, 'sfx': sfx,
    }
    with open(os.path.join(ROOT, 'src/mapa/tempos.json'), 'w') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print(f'{take}: fala {fala:.2f} s · total {T:.2f} s · respiros', [round(r, 2) for r in resp])
    print('cenas:', {k: round(v, 2) for k, v in cenas.items()})


if __name__ == '__main__':
    main()
