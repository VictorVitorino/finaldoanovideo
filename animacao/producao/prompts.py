"""Gera os documentos de produção a partir de producao/pacote.json.

    python3 producao/prompts.py

Entradas:
  producao/pacote.json        bíblia de personagens e estilo + prompts por plano (já revisados)
  producao/elenco_fotos.json  quem é quem: {"antonialli": "foto5", ...}  (preencher)
Saídas:
  producao/PERSONAGENS.md     prompts das folhas de personagem (gerar primeiro)
  producao/PROMPTS.md         prompts de cada clipe, prontos para colar na ferramenta
  ../src/producao.js          etiquetas de "quem é quem" para a montagem
"""
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(AQUI)

PESSOAS = ['antonialli', 'bruno', 'jose', 'nara', 'marcos', 'thauany', 'joao', 'mancini', 'jaqueline', 'giovanna', 'pedro', 'monica', 'vinicius', 'paladini', 'quintao', 'sampaio']
NOMES = {'antonialli': 'Guilherme Antonialli', 'bruno': 'Bruno Moraes', 'jose': 'José Aires', 'nara': 'Nara Martins', 'marcos': 'Marcos Massao Iwata', 'thauany': 'Thauany Moreira', 'joao': 'João Lopes', 'mancini': 'Marcus Mancini', 'jaqueline': 'Jaqueline Valdevino', 'giovanna': 'Giovanna Brandão', 'pedro': 'Pedro Lanzetta', 'monica': 'Monica Audrey', 'vinicius': 'Vinicius de Sousa', 'paladini': 'Paladini', 'quintao': 'Fabio Quintão', 'sampaio': 'Sampaio'}
POS = {'esquerda': 420, 'centro-esquerda': 700, 'centro': 960, 'centro-direita': 1220, 'direita': 1500}


def carregar():
    pacote = json.load(open(os.path.join(AQUI, 'pacote.json')))
    caminho = os.path.join(AQUI, 'elenco_fotos.json')
    mapa = json.load(open(caminho)) if os.path.exists(caminho) else {}
    return pacote, {k: v for k, v in mapa.items() if v}


def tokens(pacote, mapa):
    tk = {}
    for p in pacote['mascotes']['personagens']:
        tk[p['id']] = (p['nome'], p['token_en'], None)
    fotos = {p['id']: p for p in pacote['pessoas']['personagens']}
    generico = fotos.get('pessoa_sem_foto', {}).get('token_en', 'a stylized friendly office professional')
    for pid in PESSOAS:
        f = mapa.get(pid)
        if f and f in fotos:
            tk[pid] = (NOMES[pid], fotos[f]['token_en'], f)
        else:
            tk[pid] = (NOMES[pid], generico, None)
    return tk


def substituir(texto, tk, look):
    def rep(m):
        k = m.group(1)
        if k == 'ESTILO':
            return look['estilo_en']
        if k == 'MOVIMENTO':
            return look['movimento_en']
        if k in tk:
            nome, tok, _ = tk[k]
            return f'{nome.split()[0]} ({tok.rstrip(".")})'
        return m.group(0)
    return re.sub(r'\{([A-Za-z_]+)\}', rep, texto)


def main():
    pacote, mapa = carregar()
    look = pacote['look']
    tk = tokens(pacote, mapa)
    planos = pacote['planos']

    # ---- personagens
    L = ['# Folhas de personagem\n', 'Gere primeiro uma folha (turnaround) e uma folha de expressões para cada personagem, no mesmo estilo. Use a imagem escolhida como referência em todos os clipes em que o personagem aparece.\n',
         f'**Sufixo de estilo (colar no fim):** {look["estilo_en"]}\n', f'**Prompt negativo:** {look["negativo_en"]}\n']
    L.append('\n## Mascotes das empresas\n')
    for p in pacote['mascotes']['personagens']:
        L += [f'\n### {p["nome"]} — selo: {p["selo"]}\n', f'{p["descricao_pt"]}\n', f'**Identidade (token):** {p["token_en"]}\n', f'**Folha de personagem:**\n```\n{p["folha_en"]} {look["estilo_en"]}\n```\n', f'**Expressões:**\n```\n{p["expressoes_en"]} {look["estilo_en"]}\n```\n']
    L.append('\n## Pessoas (caricaturas a partir das fotos)\n')
    inverso = {v: k for k, v in mapa.items()}
    for p in pacote['pessoas']['personagens']:
        quem = NOMES.get(inverso.get(p['id'], ''), 'nome a definir') if p['id'] != 'pessoa_sem_foto' else 'modelo para quem não enviou foto'
        L += [f'\n### {p["nome"]} — {quem}\n', f'Anexe a foto: **{p["referencia"]}**\n\n{p["descricao_pt"]}\n', f'**Identidade (token):** {p["token_en"]}\n', f'**Folha de personagem:**\n```\n{p["folha_en"]} {look["estilo_en"]}\n```\n', f'**Expressões:**\n```\n{p["expressoes_en"]} {look["estilo_en"]}\n```\n']
    if pacote['pessoas'].get('notas_pt'):
        L.append(f'\n> {pacote["pessoas"]["notas_pt"]}\n')
    open(os.path.join(AQUI, 'PERSONAGENS.md'), 'w').write('\n'.join(L))

    # ---- planos
    cen = {c['id']: c for c in look['cenarios']}
    P = ['# Prompts por clipe\n', 'Para cada clipe: (1) gere o quadro-chave com o prompt de imagem, anexando as folhas dos personagens em cena; (2) anime com o prompt de movimento (image-to-video); (3) salve em `producao/clipes/` com o nome indicado; (4) rode `python3 producao/montar.py`. Textos, logos, números, legendas e etiquetas NÃO devem ser gerados: entram na montagem.\n',
         f'**Prompt negativo (todas as imagens):** {look["negativo_en"]}\n', '\n## Regras de produção\n'] + [f'- {r}' for r in look['regras_pt']]
    cena_atual = None
    for p in planos:
        if p['cena'] != cena_atual:
            cena_atual = p['cena']
            pal = next((x for x in look['paleta_cenas'] if x['cena'] == cena_atual), None)
            P.append(f'\n## Cena {cena_atual}\n')
            if pal:
                P.append(f'Luz: {pal["luz_pt"]} · Cores: {pal["cores_pt"]} · Clima: {pal["clima_pt"]}\n')
        arq = p['id'] + (f'_{p["sub"]}' if p['sub'] else '') + '.mp4'
        refs = []
        for q in p['personagens']:
            if q in tk:
                nome, _, foto = tk[q]
                refs.append(f'{nome}' + (f' (folha da {foto.replace("foto", "Foto ")})' if foto else ' (folha)'))
        c = cen.get(p['cenario_id'])
        P += [f'\n### `{arq}` — {p["dur"]:.1f} s\n', f'{p["objetivo_pt"]}\n',
              f'**Cenário:** {c["nome_pt"] if c else p["cenario_id"]} · **Câmera:** {p["camera_pt"]} · **Luz:** {p["luz_pt"]}\n',
              f'**Referências a anexar:** {", ".join(refs) if refs else "nenhuma"}\n',
              f'**Imagem (quadro-chave):**\n```\n{substituir(p["keyframe_prompt_en"], tk, look)}\n```\n',
              f'**Movimento:**\n```\n{substituir(p["motion_prompt_en"], tk, look)}\n```\n']
        if p['falas']:
            P.append('**Falas:** ' + ' / '.join(f'{f["quem"]}: "{f["texto"]}"' + (' (lip-sync)' if f['labial'] else '') for f in p['falas']) + '\n')
        if p['overlays_pt']:
            P.append('**Entra na montagem (não gerar):** ' + '; '.join(p['overlays_pt']) + '\n')
        P.append(f'**Som:** {p["som_pt"]}\n')
        if p['notas_pt']:
            P.append(f'**Notas:** {p["notas_pt"]}\n')
    open(os.path.join(AQUI, 'PROMPTS.md'), 'w').write('\n'.join(P))

    # ---- etiquetas para a montagem
    et = {}
    for p in planos:
        for e in p['etiquetas']:
            pid = e['personagem'].strip('{}')
            x = POS.get(e['posicao'].strip().lower(), 960)
            item = {'personagem': pid, 'x': x, 'y': 160 + 70 * len(et.get(p['id'], []))}
            if e.get('logo') and e['logo'] not in ('nome', ''):
                item['logo'] = e['logo']
            et.setdefault(p['id'], [])
            if all(i['personagem'] != pid for i in et[p['id']]):
                et[p['id']].append(item)
    js = '// Etiquetas de "quem é quem" sobre os clipes gerados por IA (camada \'etiquetas\').\n// Gerado por producao/prompts.py. Posições em pixels da tela 1920x1080: ajuste depois de ver cada clipe.\n'
    js += 'export const ETIQUETAS = ' + json.dumps(et, ensure_ascii=False, indent=1) + ';\n'
    open(os.path.join(ROOT, 'src', 'producao.js'), 'w').write(js)
    print(f'PERSONAGENS.md, PROMPTS.md ({len(planos)} clipes) e src/producao.js gerados; {len(mapa)} pessoas mapeadas para fotos.')


if __name__ == '__main__':
    main()
