"""Gera "Matrizes da mudança: slides de apresentação" (blog/assets/modelos/slides-das-matrizes-da-mudanca.pptx).

É o par de apresentação das planilhas do blog: a pessoa preenche a planilha e leva a leitura para o slide.
Um slide pronto para o comitê por matriz, com tabelas, formas e gráficos nativos, e os mesmos exemplos das planilhas.
As instruções de uso de cada slide ficam nas anotações do orador.
Uso: python3 blog/_src/modelos_pptx_matrizes.py
"""
import sys

sys.dont_write_bytecode = True      # não deixa __pycache__ no repositório

from modelos_pptx_base import *     # noqa: E402,F403

POR_EXTENSO = ['Nenhum', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez']


def matrizes(pasta=None):
    d = Deck('Matrizes da mudança: slides de apresentação', 'Um slide pronto para o comitê para cada planilha de gestão da mudança: RACI, influência, impactos, ADKAR, prontidão, adoção, riscos e treinamentos.',
             'gestão da mudança; matriz RACI; stakeholders; impactos; ADKAR; adoção; riscos; treinamentos')

    # números que se repetem na síntese e nos títulos, calculados dos exemplos
    pessoas_imp = sum(r[6] for r in EX_IMPACTOS)
    imp_altos = sum(1 for r in EX_IMPACTOS if r[5] >= 4)
    prioridade = [st for st in EX_STAKEHOLDERS if estrategia(st[2], st[3])[1] == 3]
    por_barreira = {}
    for g in EX_ADKAR: por_barreira[barreira(g[3:8])] = por_barreira.get(barreira(g[3:8]), 0) + g[2]
    pessoas_adkar = sum(g[2] for g in EX_ADKAR)
    maior_barreira = max(por_barreira, key=por_barreira.get)
    tot_adocao = sum(sum(c) for _, c in EX_ADOCAO)
    ind_adocao = sum(c[3] + c[4] for _, c in EX_ADOCAO) / tot_adocao
    riscos_altos = sum(1 for r in EX_RISCOS if r[3] * r[4] >= 15)
    treinos_feitos = sum(1 for t in EX_TREINOS if t[7] == 'Realizado')
    sem_a = [nome for nome, letras in EX_RACI if not any('A' in l.split('/') for l in letras.split())]

    # 1 · capa
    d.capa('Matrizes da mudança', 'As matrizes da mudança\vdo _[nome do projeto]_',
           'Um slide pronto para o comitê para cada planilha: papéis, stakeholders, impactos, barreiras, prontidão, adoção, riscos e capacitação.',
           'Este deck é o par de apresentação das planilhas do blog. Preencha a planilha, traga os números para o slide e escreva a conclusão no título.\n'
           'Os exemplos são os mesmos das planilhas (áreas, papéis e escalas), para você conferir de onde vem cada número antes de trocar pelos seus.\n'
           'Tabelas e gráficos são nativos: clique para editar o texto ou use "Editar dados" no gráfico. Apague os slides das matrizes que não usar.',
           meta='[Comitê ou área] · [mês e ano]')

    # 2 · como usar
    s = d.slide('Como usar', 'Preencha a planilha, leve a leitura para o slide',
                'Slide de orientação para quem monta a apresentação. Apague antes de levar ao comitê.\n'
                'Cada planilha do blog tem um slide correspondente neste deck. A planilha guarda os dados e faz as contas; o slide mostra a leitura e a conclusão.\n'
                'Ordem sugerida para o comitê: síntese executiva, as matrizes que sustentam a síntese e os próximos passos.')
    passos = [('Preencha a planilha', 'Os dados e os cálculos ficam lá: notas, contagens, índices e prioridades.'),
              ('Leve os números ao slide', 'Edite a tabela, as formas ou os dados do gráfico. Nada aqui é imagem.'),
              ('Escreva a conclusão', 'No título do slide: o comitê lê a mensagem primeiro. A matriz é a prova.')]
    fx = faixas(3, calha=0.7)
    for i, ((x, w), (t, c)) in enumerate(zip(fx, passos)):
        fio(s, x, Y_TOPO, x + w, Y_TOPO, AZP, 1.25)
        texto(s, x, Y_TOPO + 0.14, w, 1.62, [P(f'{i + 1:02d}', tam=24, cor=AZ, fonte=TIT, italico=True, entre=2), H(t, entre=4), P(c, tam=T_TAB, cor=CZ)])
        if i < 2: fio(s, x + w + 0.15, Y_TOPO + 0.7, x + w + 0.55, Y_TOPO + 0.7, AZ, 1.5, seta=True)
    planilhas = [(4, 'Matriz RACI', 'Letras por atividade e por papel'), (5, 'Mapa de influência', 'Notas de influência e de apoio'), (6, 'Lista de impactos', 'Impactos por área e por tipo'),
                 (7, 'Avaliação ADKAR', 'Notas e ponto de barreira por grupo'), (8, 'Formulário de diagnóstico', 'Cinco sinais de prontidão por grupo'), (9, 'Mapa de adoção', 'Pessoas em cada marca da régua'),
                 (10, 'Mapa de riscos', 'Probabilidade, impacto e resposta'), (11, 'Plano de treinamentos', 'Ações por público e por data')]
    rotulo(s, MARGEM, Y_TOPO + 1.82, UTIL, 'De qual planilha vem cada slide')
    for i, (n, nome, traz) in enumerate(planilhas):
        x, w = faixas(4)[i % 4]
        y = Y_TOPO + 2.14 + (i // 4) * 1.1
        fio(s, x, y, x + w, y, LIN, 0.75)
        texto(s, x, y + 0.12, 0.62, 0.8, [P(str(n), tam=28, cor=AZP, entre=0)])
        texto(s, x + 0.64, y + 0.16, w - 0.64, 0.9, [R(f'Slide {n}', AZ, entre=1), P(nome, tam=T_TAB, cor=TINTA, negrito=True, entre=1), P(traz, tam=T_ROTULO + 1, cor=CZ)])

    # 3 · síntese executiva
    s = d.slide('Síntese executiva', f'A mudança ainda trava no porquê: [{por_barreira[maior_barreira] / pessoas_adkar:.0%}] das pessoas estão em [{maior_barreira}] e a adoção é de [{ind_adocao:.0%}]',
                'A leitura de todas as matrizes em uma página, com as decisões pedidas ao comitê. É o slide que abre a conversa; os seguintes são a prova.\n'
                'Cada quadro traz o número que resume uma planilha e uma linha de leitura. Atualize os seis quadros sempre que as planilhas mudarem.\n'
                'No painel azul, escreva no máximo três decisões, cada uma como frase que se responde com sim, não ou uma escolha.', dica=EXEMPLO)
    xq, wq = col(0, 8)
    quadros = [('Impactos', f'{imp_altos} de {len(EX_IMPACTOS)}', f'impactos de grau alto, com {pessoas_imp} pessoas impactadas'),
               ('Stakeholders', f'{len(prioridade)} de {len(EX_STAKEHOLDERS)}', 'com muita influência e pouco apoio: são a prioridade'),
               ('Barreira (ADKAR)', f'{por_barreira[maior_barreira] / pessoas_adkar:.0%}', f'das pessoas travadas em {maior_barreira}'),
               ('Adoção', f'{ind_adocao:.0%}', 'das pessoas em Adota ou Multiplica'),
               ('Riscos', f'{riscos_altos} de {len(EX_RISCOS)}', 'riscos de exposição alta, com ação imediata'),
               ('Capacitação', f'{treinos_feitos} de {len(EX_TREINOS)}', 'ações de capacitação realizadas até agora')]
    hq = (H_UTIL - 0.3) / 2
    for i, (rot, num, leit) in enumerate(quadros):
        x, w = faixas(3, xq, wq)[i % 3]
        indicador(s, x, Y_TOPO + (i // 3) * (hq + 0.3), w, rot, num, leit, tam=36, h=hq, cor_rot=AZ)
    xp, wp = col(8, 4)
    decisoes = ['Patrocinador leva o porquê a Operações antes de mais treinamento.', 'Diretor de operações entra na coalizão de patrocínio.', 'Definir quem aprova o reforço da adoção, hoje sem dono na RACI.']
    painel(s, xp, Y_TOPO, wp, H_UTIL, [R('Decisões pedidas ao comitê', AZS, entre=12)] + [x for i, t in enumerate(decisoes) for x in
                                       (P(f'{i + 1:02d}', tam=20, cor=AZS, fonte=TIT, italico=True, entre=2), P(t, tam=14, cor=BR, entre=14))], fundo=AZP, margem=0.3)

    # 4 · matriz RACI
    d.secao('Matrizes')
    com_a = len(EX_RACI) - len(sem_a)
    s = d.slide('Matriz RACI', f'[{POR_EXTENSO[com_a]} das {POR_EXTENSO[len(EX_RACI)].lower()}] atividades têm um único aprovador; falta definir quem aprova [{sem_a[0].lower()}]' if sem_a
                else 'Cada atividade da mudança tem um único aprovador',
                'Vem da planilha "Matriz RACI da mudança". Copie as letras de cada cruzamento e troque a cor do preenchimento junto com a letra.\n'
                'R = responsável (executa), A = aprova e responde pelo resultado (um por atividade), C = consultado, I = informado, A/R = aprova e executa.\n'
                'A coluna Conferência repete o aviso da planilha: atividade sem aprovador ou com mais de um. No exemplo, a última atividade está sem A de propósito.\n'
                'As duas linhas finais mostram a carga por papel: muitos R no mesmo papel indicam sobrecarga.', dica=EXEMPLO)
    matriz_raci(s, MARGEM, Y_TOPO - 0.1, UTIL, EX_PAPEIS, EX_RACI, alt=0.298, larg_ativ=2.85, alt_cab=0.44, carga=True, conferencia=0.95, tam=11, caixa_cab=False)
    legenda_raci(s, MARGEM, 6.25, lado=0.26)

    # 5 · mapa de influência
    s = d.slide('Mapa de influência', f'[{POR_EXTENSO[len(prioridade)]}] stakeholders de muita influência ainda não apoiam: são a prioridade do patrocinador',
                'Vem da planilha "Mapa de influência de stakeholders". Arraste cada círculo numerado para a posição das notas de influência (vertical) e de apoio (horizontal), de 1 a 5.\n'
                'A estratégia sugerida segue a planilha: nota 3 ou mais conta como alta. Influência alta e apoio baixo: conquistar (prioridade). '
                'Alta e alto: mobilizar. Baixa e alto: envolver. Baixa e baixo: ouvir.\n'
                'O mapa é retrato do momento e material sensível: restrinja o acesso e atualize a cada fase.', dica='Exemplo ilustrativo: arraste os círculos e troque as linhas da tabela pelos seus stakeholders.')
    lado = 3.7
    mapa_influencia(s, MARGEM + 0.56, Y_TOPO, lado, [(i + 1, st[2], st[3]) for i, st in enumerate(EX_STAKEHOLDERS)])
    xt = MARGEM + 0.56 + lado + 0.45
    linhas = [[{'t': 'Nº', 'alinh': 'centro'}, 'Stakeholder', {'t': 'Influência', 'alinh': 'centro'}, {'t': 'Apoio', 'alinh': 'centro'}, {'t': 'Estratégia', 'alinh': 'centro'}, 'Próxima ação']]
    # a próxima ação da planilha, em versão curta para caber em duas linhas
    curta = ['Abrir o kickoff e aparecer nos marcos', 'Conversa individual com o patrocinador', 'Combinar o plano de suporte do go-live', 'Preparar antes das equipes, com roteiro',
             'Convidar para a rede de multiplicadores', 'Roda de escuta com o gestor direto']
    for i, st in enumerate(EX_STAKEHOLDERS):
        nome, nivel = estrategia(st[2], st[3])
        linhas.append([{'t': str(i + 1), 'alinh': 'centro'}, {'t': f'{st[0]}\v_{st[1]}_', 'tam': 11}, {'t': str(st[2]), 'alinh': 'centro'}, {'t': str(st[3]), 'alinh': 'centro'},
                       celula(nome, nivel, tam=T_ROTULO), {'t': curta[i] if i < len(curta) else st[5], 'tam': 11, 'cor': CZ}])
    tabela(s, xt, Y_TOPO - 0.06, [0.4, 1.75, 1.05, 0.62, 1.5, DIR - xt - 5.32], linhas, 0.66, 0.36, primeira=False, nome='Tabela: stakeholders e estratégia')

    # 6 · lista de impactos
    por_area = {a: sum(r[6] for r in EX_IMPACTOS if r[1] == a) for a in EX_AREAS}
    maior_area = max(por_area, key=por_area.get)
    altos_area = sum(1 for r in EX_IMPACTOS if r[1] == maior_area and r[5] >= 4)
    s = d.slide('Lista de impactos', f'[{maior_area}] concentra o peso da mudança: [{por_area[maior_area]}] das [{pessoas_imp}] pessoas e {POR_EXTENSO[altos_area].lower()} impactos de grau alto',
                'Vem da planilha "Lista de impactos com dashboard". O mapa de calor cruza área e tipo de impacto: o número é o de pessoas impactadas e a cor, o maior grau do cruzamento.\n'
                'Grau 4 ou 5 = alto (azul profundo), 3 = médio (azul vivo), 1 ou 2 = baixo (azul suave). Troque o número e a cor da célula juntos.\n'
                'As barras à direita somam as pessoas por área: clique no gráfico e use "Editar dados". Embaixo, os três impactos mais críticos, com o que muda.', dica=EXEMPLO)
    la, lt, alt_cab, alt = 1.45, 0.95, 0.42, 0.43
    linhas = [['Área'] + [{'t': t, 'alinh': 'centro'} for t in EX_TIPOS]]
    for a in EX_AREAS:
        lin = [a]
        for t in EX_TIPOS:
            itens = [r for r in EX_IMPACTOS if r[1] == a and r[3] == t]
            if itens:
                g = max(r[5] for r in itens)
                lin.append(celula(str(sum(r[6] for r in itens)), 3 if g >= 4 else 2 if g == 3 else 1, negrito=True))
            else:
                lin.append({'t': '', 'fundo': CZC})
        linhas.append(lin)
    tabela(s, MARGEM, Y_TOPO, [la] + [lt] * 6, linhas, alt, alt_cab, tam_cab=T_RODAPE, esp_cab=0.4, nome='Mapa de calor: área por tipo de impacto')
    xb = MARGEM + la + 6 * lt + 0.4
    rotulo(s, xb, Y_TOPO + 0.18, DIR - xb, 'Pessoas impactadas por área')
    grafico_barras(s, xb, Y_TOPO + alt_cab, DIR - xb, 6 * alt, EX_AREAS, [por_area[a] for a in EX_AREAS], destaque=[EX_AREAS.index(maior_area)], horizontal=True, rotulo_cat=False,
                   vao=70, margens=(0.0, 0.0, 0.84, 1.0), nome='Gráfico: pessoas impactadas por área', descr='Barras com o número de pessoas impactadas em cada área, na mesma ordem do mapa de calor.')
    legenda(s, MARGEM, Y_TOPO + alt_cab + 6 * alt + 0.1, [(AZP, 'Grau alto (4 ou 5)'), (AZ, 'Grau médio (3)'), (AZS, 'Grau baixo (1 ou 2)')])
    texto(s, MARGEM + la + 6 * lt - 2.4, Y_TOPO + alt_cab + 6 * alt + 0.1, 2.4, 0.24, 'Número = pessoas impactadas', tam=T_ROTULO, cor=CZ, alinh='dir', entre=0)
    criticos = sorted(EX_IMPACTOS, key=lambda r: (-r[5], -r[6]))[:3]
    yc = 5.68
    for (x, w), r in zip(faixas(3), criticos):
        fio(s, x, yc, x + w, yc, AZP, 1.25)
        texto(s, x, yc + 0.1, w, 0.8, [R(f'Grau {r[5]} · {r[6]} pessoas · {r[1]}', AZ, entre=1), P(f'*{r[0]}:* {r[4][0].lower() + r[4][1:]}', tam=T_ROTULO + 1, cor=TINTA)])

    # 7 · avaliação ADKAR
    s = d.slide('Avaliação ADKAR', f'[{por_barreira[maior_barreira]}] das [{pessoas_adkar}] pessoas travam em [{maior_barreira}]: antes de treinar, é preciso explicar o porquê',
                'Vem da planilha "Avaliação ADKAR com mapa de resistência". À esquerda, pessoas por ponto de barreira (clique no gráfico e use "Editar dados"). À direita, as notas de 1 a 5 por grupo.\n'
                'Ponto de barreira (célula em azul profundo): o primeiro elemento, na ordem do modelo, com nota 3 ou menor. As demais notas seguem a régua das planilhas: cinzas para as baixas, azuis para as altas.\n'
                'Resistência: alta quando a barreira é Consciência ou Desejo, média em Conhecimento ou Habilidade, baixa em Reforço ou sem barreira.\n'
                'ADKAR é marca registrada da Prosci.', dica=EXEMPLO)
    cats = ELEMENTOS + ['Sem barreira']
    wg = 3.35
    rotulo(s, MARGEM, Y_TOPO + 0.12, wg, 'Pessoas por ponto de barreira')
    grafico_barras(s, MARGEM, Y_TOPO + 0.45, wg, 3.0, cats, [por_barreira.get(c, 0) for c in cats], destaque=[cats.index(maior_barreira)], horizontal=True, vao=55,
                   margens=(0.36, 0.0, 0.5, 1.0), tam_cat=T_ROTULO + 1, nome='Gráfico: pessoas por ponto de barreira', descr='Barras com o número de pessoas em cada ponto de barreira do ADKAR.')
    xt = MARGEM + wg + 0.4
    nivel_res = lambda pb: ('Alta', 3) if pb in ELEMENTOS[:2] else ('Média', 2) if pb in ELEMENTOS[2:4] else ('Baixa', 1)
    linhas = [['Grupo', {'t': 'Pessoas', 'alinh': 'dir'}] + [{'t': e, 'alinh': 'centro', 'tam': T_RODAPE} for e in ELEMENTOS] + [{'t': 'Resistência', 'alinh': 'centro'}]]
    for g in sorted(EX_ADKAR, key=lambda g: -g[2]):
        pb = barreira(g[3:8])
        linhas.append([{'t': f'{g[0]}\v_{g[1]}_', 'tam': 11}, {'t': str(g[2]), 'alinh': 'dir'}] + [celula_nota(n, ELEMENTOS[k] == pb) for k, n in enumerate(g[3:8])] + [celula(*nivel_res(pb), tam=T_ROTULO)])
    tabela(s, xt, Y_TOPO, [1.95, 0.7] + [0.9] * 5 + [DIR - xt - 7.15], linhas, 0.5, 0.42, caixa_cab=False, nome='Tabela: notas ADKAR por grupo')
    legenda(s, xt, 5.82, [(AZP, 'Ponto de barreira'), (CZ, 'Nota 1'), (LIN, 'Nota 2'), (CZC, 'Nota 3'), (AZS, 'Nota 4'), (AZ, 'Nota 5')])

    # 8 · diagnóstico de prontidão
    medias_sinal = [sum(g[2][k] for g in EX_PRONTIDAO) / len(EX_PRONTIDAO) for k in range(5)]
    fraco = medias_sinal.index(min(medias_sinal))
    resiste = [g for g in EX_PRONTIDAO if sum(g[2]) / 5 < 2]
    s = d.slide('Diagnóstico de prontidão', f'[{SINAIS[fraco]}] é o sinal mais fraco; quem ainda resiste é [{resiste[0][0]}]' if resiste
                else f'[{SINAIS[fraco]}] é o sinal mais fraco entre os grupos avaliados',
                'Vem da planilha "Formulário de diagnóstico de prontidão". Notas de 1 (discordo totalmente) a 5 (concordo totalmente) para cinco sinais, por grupo.\n'
                'As cores seguem a régua das planilhas: cinzas para as notas baixas, azuis para as altas. A média de cada grupo sugere a marca da régua de adoção e a ação que mais ajuda: '
                'abaixo de 2, Resiste (escuta); de 2 a 2,9, Observa (exemplo); de 3 a 3,9, Experimenta (prática); de 4 a 4,5, Adota (reforço); acima disso, Multiplica (palco).\n'
                'É ponto de partida para conversa, não diagnóstico fechado. Registre por grupo, nunca por pessoa.', dica=EXEMPLO)
    linhas = [['Grupo'] + [{'t': n, 'alinh': 'centro'} for n in SINAIS] + [{'t': 'Média', 'alinh': 'centro'}, 'Leitura sugerida']]
    for g in EX_PRONTIDAO:
        m = sum(g[2]) / 5
        linhas.append([{'t': f'{g[0]} · _{g[1]}_', 'tam': 11}] + [celula_nota(n, tam=11) for n in g[2]] + [celula_media(m, tam=11), {'t': leitura(m), 'tam': 11, 'negrito': True, 'cor': AZP}])
    linhas.append([{'t': 'Média do sinal', 'cor': CZ, 'negrito': False, 'tam': T_ROTULO + 1}] + [celula_media(m, tam=11) for m in medias_sinal] + ['', ''])
    tabela(s, MARGEM, Y_TOPO, [3.1] + [1.12] * 5 + [0.95, UTIL - 9.65], linhas, [0.37] * len(EX_PRONTIDAO) + [0.42], 0.45, caixa_cab=False, nome='Tabela: cinco sinais de prontidão por grupo')
    # duas legendas separadas: a cor de cada nota e a cor da média (a marca da régua que ela sugere)
    texto(s, MARGEM, 6.22, 0.5, 0.24, 'Nota', tam=T_ROTULO, cor=TINTA, negrito=True, entre=0)
    xf = legenda(s, MARGEM + 0.5, 6.22, [(NOTAS[n][0], str(n)) for n in range(1, 6)])
    texto(s, xf + 0.35, 6.22, 1.3, 0.24, 'Média e leitura', tam=T_ROTULO, cor=TINTA, negrito=True, entre=0)
    legenda(s, xf + 1.65, 6.22, [(fundo, marca) for marca, fundo, _, _ in REGUA])

    # 9 · mapa de adoção
    piores = min(EX_ADOCAO, key=lambda a: (a[1][3] + a[1][4]) / sum(a[1]))
    s = d.slide('Mapa de adoção', f'Pouco mais de uma em cada quatro pessoas já adota: o índice é de [{ind_adocao:.0%}], e [{piores[0]}] fica abaixo do conjunto',
                'Vem da planilha "Mapa de adoção". Clique no gráfico e use "Editar dados" para informar a parcela de pessoas de cada área em cada marca (a soma de cada área é 100%). '
                'A última barra é o conjunto das áreas.\n'
                'Índice de adoção = pessoas em Adota ou Multiplica ÷ total de pessoas. Atualize os valores à direita junto com o gráfico.\n'
                'A marca com mais gente em cada área indica a ação que mais ajuda agora (está na legenda). Leitura agregada: retrato do momento, não avaliação de desempenho.', dica=EXEMPLO)
    regua_adocao(s, MARGEM, Y_TOPO, UTIL, H_UTIL, [a for a, _ in EX_ADOCAO], [[v / sum(c) for v in c] for _, c in EX_ADOCAO], pessoas=[sum(c) for _, c in EX_ADOCAO])

    # 10 · mapa de riscos
    altos = [r for r in EX_RISCOS if r[3] * r[4] >= 15]
    s = d.slide('Mapa de riscos', f'[{POR_EXTENSO[riscos_altos]}] riscos têm exposição alta e pedem resposta imediata: [{" e ".join(r[1].lower() for r in altos)}]',
                'Vem da planilha "Mapa de riscos da mudança". Probabilidade (vertical) e impacto na adoção (horizontal), de 1 a 5. Exposição = probabilidade x impacto.\n'
                'Arraste cada círculo numerado para a célula do risco. A tabela traz os cinco de maior exposição, com a resposta combinada e o responsável.\n'
                'Alta (15 ou mais): ação imediata e acompanhamento no comitê. Média (8 a 14): plano de resposta com dono. Baixa (até 7): monitorar.', dica=EXEMPLO)
    lado = 3.45
    matriz_riscos(s, MARGEM + 0.6, Y_TOPO, lado, [(i + 1, r[3], r[4]) for i, r in enumerate(EX_RISCOS)])
    xt = MARGEM + 0.6 + lado + 0.55
    expo = lambda e: celula(f'{e} · ' + ('Alta' if e >= 15 else 'Média' if e >= 8 else 'Baixa'), 3 if e >= 15 else 2 if e >= 8 else 1)
    maiores = sorted(range(len(EX_RISCOS)), key=lambda i: -EX_RISCOS[i][3] * EX_RISCOS[i][4])[:5]
    linhas = [[{'t': 'Nº', 'alinh': 'centro'}, 'Risco', {'t': 'Exposição', 'alinh': 'centro'}, 'Resposta', 'Responsável']]
    linhas += [[{'t': str(i + 1), 'alinh': 'centro'}, {'t': f'{EX_RISCOS[i][0]}\v_{EX_RISCOS[i][1]}_', 'tam': 11}, expo(EX_RISCOS[i][3] * EX_RISCOS[i][4]),
                {'t': EX_RISCOS[i][5].rstrip('.'), 'tam': T_ROTULO + 0.5, 'cor': CZ}, {'t': EX_RISCOS[i][6], 'tam': 11}] for i in maiores]
    tabela(s, xt, Y_TOPO - 0.06, [0.4, 2.15, 1.05, 2.25, DIR - xt - 5.85], linhas, 0.66, 0.36, primeira=False, nome='Tabela: riscos de maior exposição')
    legenda_exposicao(s, xt, 6.2, (DIR - xt) / 3)

    # 11 · plano de treinamentos
    primeiro = min(EX_TREINOS, key=lambda t: t[3])
    s = d.slide('Plano de treinamentos', f'A capacitação começa pelos [{primeiro[0].lower()}], [{POR_EXTENSO[-primeiro[3] // 7].lower()}] semanas antes do go-live, e segue até o reforço',
                'Vem da planilha "Plano editorial de treinamentos". Uma linha por ação, na ordem do calendário. A faixa em destaque é a semana do go-live.\n'
                'Arraste cada etiqueta para a semana da ação (o "Momento" da planilha: semanas em relação ao go-live) e troque o texto pelo formato e pela duração.\n'
                'A cor da etiqueta é o status: a planejar, em preparo, agendado e realizado, do mais claro ao mais escuro. A coluna da direita repete o status em texto.\n'
                'Prepare primeiro os patrocinadores, os gestores diretos e os usuários-chave: eles sustentam a mudança quando o projeto sai.', dica=EXEMPLO)
    xa, wa, xl, wl, ws = MARGEM, 4.25, MARGEM + 4.4, 5.75, 1.3
    semanas = ['−5', '−4', '−3', '−2', '−1', 'Go-live', '+1', '+2']
    ls = wl / len(semanas)
    y0, alt_cab, alt = Y_TOPO, 0.5, 0.415
    yb = y0 + alt_cab + alt * len(EX_TREINOS)
    ret(s, xl + 5 * ls, y0 + 0.2, ls, yb - y0 - 0.2, AZC, nome='Faixa: semana do go-live')
    rotulo(s, xa, y0 + 0.2, wa, 'Público e ação'); rotulo(s, xl, y0, wl, 'Semanas em relação ao go-live', alinh='centro'); rotulo(s, DIR - ws, y0 + 0.2, ws, 'Status', alinh='dir')
    for k, sem in enumerate(semanas):
        texto(s, xl + k * ls, y0 + 0.24, ls, 0.22, sem, tam=T_ROTULO, cor=AZP if sem == 'Go-live' else CZ, negrito=sem == 'Go-live', alinh='centro', entre=0)
        if k: fio(s, xl + k * ls, y0 + alt_cab, xl + k * ls, yb, LIN, 0.5)
    fio(s, MARGEM, y0 + alt_cab, DIR, y0 + alt_cab, AZP, 1.25)
    for i, (pub, tema, formato, dias, dur, _, _, status) in enumerate(EX_TREINOS):
        y = y0 + alt_cab + i * alt
        texto(s, xa, y, wa, alt, f'*{pub}:* {tema[0].lower() + tema[1:]}', tam=11, cor=TINTA, ancora='meio')
        fundo, tinta = STATUS_TREINO[status]
        wp = 0.3 + 0.074 * len(f'{formato} · {dur}')
        xp = min(xl + (dias // 7 + 5) * ls + 0.05, xl + wl - wp)
        ret(s, xp, y + 0.07, wp, alt - 0.14, fundo, None, 0.75, 0.05, f'{formato} · {dur}', 'meio', 0.05, 0, tam=T_ROTULO, cor=tinta, negrito=True, nome=f'Ação {i + 1}: {status}')
        texto(s, DIR - ws, y, ws, alt, status, tam=11, cor=CZ, alinh='dir', ancora='meio')
        fio(s, MARGEM, y + alt, DIR, y + alt, LIN, 0.75)
    legenda(s, MARGEM, 6.22, [(STATUS_TREINO[k][0], k) for k in ('A planejar', 'Em preparo', 'Agendado', 'Realizado')])

    # 12 · próximos passos
    d.secao('Próximos passos')
    s = d.slide('Próximos passos', 'Em 30 dias, as matrizes viram decisão, ação e nova leitura',
                'Feche com compromissos. Três horizontes: o que o comitê decide agora, o que a equipe de mudança e os gestores fazem em seguida e quando as matrizes serão lidas de novo.\n'
                'As tabelas são nativas: para incluir uma linha, clique na última e use Inserir linha abaixo.\n'
                'Na próxima reunião, abra por este slide e pela síntese executiva.')
    horizontes(s, [('7', 'dias', '[Levar as decisões ao comitê]', '[As três decisões da síntese, tomadas e registradas]'),
                   ('15', 'dias', '[Agir onde as matrizes apontam]', '[Conversas feitas, ações de capacitação e respostas aos riscos em curso]'),
                   ('30', 'dias', '[Refazer a leitura das matrizes]', '[O que deve aparecer diferente na próxima síntese]')], cab=('Ação', 'Dono', 'Data'), marco='Como saberemos')

    return d.salvar('slides-das-matrizes-da-mudanca.pptx', pasta)


if __name__ == '__main__':
    matrizes()
