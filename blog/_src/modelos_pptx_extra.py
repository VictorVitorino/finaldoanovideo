"""Gera três apresentações-modelo do blog em PowerPoint (blog/assets/modelos):
kickoff da mudança, relatório executivo de adoção e workshop com patrocinadores.

Slides 16:9, editáveis (formas, tabelas e gráficos nativos), no sistema visual do blog.
As instruções de uso de cada slide ficam nas anotações do orador.
Uso: python3 blog/_src/modelos_pptx_extra.py
"""
import sys

sys.dont_write_bytecode = True      # não deixa __pycache__ no repositório

from modelos_pptx_base import *     # noqa: E402,F403


# ================================================================ 1 · kickoff da mudança
def kickoff(pasta=None):
    d = Deck('Apresentação de kickoff da mudança', 'Modelo para lançar a mudança com líderes e equipes: o porquê, o que muda, a jornada, a rede de apoio e o que se pede de cada pessoa.',
             'gestão da mudança; kickoff; lançamento; comunicação')

    d.capa('Kickoff da mudança', '_[Nome do projeto]:_\vo que muda e por quê',
           'Para líderes e equipes: a história da mudança em dez minutos e o que se espera de cada pessoa.',
           'Apresentação de lançamento. Conta a história da mudança em cerca de dez minutos e termina com um pedido claro.\n'
           'Troque os textos entre colchetes e apague o que não usar. Quem abre e fecha é o patrocinador; os gestores diretos falam do que muda na rotina.\n'
           'Os títulos são frases de conclusão: reescreva cada um com a mensagem do seu projeto.')

    # 2 · o porquê
    s = d.mensagem('O porquê', '[A frase que explica por que estamos mudando, na linguagem de quem vive o problema.]',
                   'Comece pelo problema, não pela solução. Quem fala este slide é o patrocinador.\n'
                   'A frase grande é a mensagem que as pessoas devem conseguir repetir depois. Os três blocos da direita dão a prova: como é hoje, o custo de não mudar e o que se ganha.\n'
                   'Use um exemplo do dia a dia de quem está na sala, não um indicador distante.')
    frase = s.shapes.title
    frase.left, frase.top, frase.width, frase.height = E(MARGEM), E(Y_TITULO), E(col(0, 7)[1] - 0.4), E(5.2)      # a frase ocupa a metade esquerda
    for r in frase.text_frame.paragraphs[0].runs: r.font.size = Pt(T_SECAO)                                          # e cresce: é a mensagem do slide
    apoio = [('Hoje', '[O que acontece hoje, com um exemplo do dia a dia de quem está na sala.]'),
             ('Se nada mudar', '[O custo de ficar como está: para o cliente, para a equipe e para o resultado.]'),
             ('O que ganhamos', '[O que fica melhor para quem faz o trabalho, não só para a empresa.]')]
    xa, wa = col(7, 5)
    for i, (t, c) in enumerate(apoio):
        ganho = t == 'O que ganhamos'
        bloco(s, xa, Y_TITULO + 0.1 + i * 1.82, wa, 1.6, None, t, c, cor_fio=AZ if ganho else AZP, esp=2 if ganho else 1.25, tam_tit=20, tam=14)

    # 3 · aonde queremos chegar
    s = d.slide('Aonde queremos chegar', 'Com a mudança, queremos [resultado principal] até [data]',
                'Mostre o destino em até três resultados, cada um com ponto de partida, meta e data. Números simples, que as pessoas reconheçam no trabalho.\n'
                'Em cada coluna: o indicador, o valor de hoje (à esquerda, em cinza), a meta (à direita, em azul) e o que isso significa na prática.\n'
                'Se ainda não houver meta fechada, diga a direção e quando o número será definido.')
    for i, (x, w) in enumerate(faixas(3, calha=0.45)):
        fio(s, x, Y_TOPO, x + w, Y_TOPO, AZP, 1.25)
        texto(s, x, Y_TOPO + 0.16, w, 0.95, [R(f'Resultado {i + 1}', AZ, entre=6), H('[Indicador que vai melhorar]')])
        texto(s, x, Y_TOPO + 1.25, 1.3, 1.2, '[xx]', tam=40, cor=CZ, ancora='base')
        fio(s, x + 1.35, Y_TOPO + 2.05, x + 1.95, Y_TOPO + 2.05, AZ, 1.5, seta=True)
        texto(s, x + 2.1, Y_TOPO + 1.25, w - 2.1, 1.2, '[xx]', tam=66, cor=AZP, ancora='base')
        rotulo(s, x, Y_TOPO + 2.55, 1.3, 'Hoje'); rotulo(s, x + 2.1, Y_TOPO + 2.55, w - 2.1, 'Até [data]', AZ)
        fio(s, x, Y_TOPO + 3.0, x + w, Y_TOPO + 3.0, LIN, 0.75)
        texto(s, x, Y_TOPO + 3.15, w, 1.1, '[O que isso significa na prática para quem faz o trabalho.]', cor=CZ, tam=14)

    # 4 · de e para
    s = d.slide('De e para', 'Na prática, [quatro] rotinas vão funcionar de outro jeito',
                'Três ou quatro linhas bastam. Use exemplos concretos do trabalho das pessoas: o que elas fazem hoje e o que passam a fazer.\n'
                'A tabela é nativa: clique para editar; para incluir uma rotina, use Inserir linha abaixo.\n'
                'Diga também o que não muda. Saber o que continua igual reduz a ansiedade.')
    linhas = [['Rotina', 'Hoje', '', 'Com a mudança']]
    linhas += [[f'[Rotina {i}]', {'t': '[Como é feito hoje, em uma frase.]', 'cor': CZ}, {'t': '→', 'alinh': 'centro', 'cor': AZ, 'tam': 20},
                {'t': '[Como passa a ser, em uma frase.]', 'fundo': AZC, 'cor': AZP, 'negrito': True}] for i in range(1, 5)]
    tabela(s, MARGEM, Y_TOPO, [2.3, 4.2, 0.7, UTIL - 7.2], linhas, 0.78, 0.36, tam=T_CORPO, nome='Tabela: de e para')
    texto(s, MARGEM, 5.95, UTIL, 0.4, '*O que não muda:* [o que as pessoas podem contar que continua igual.]', cor=AZP, ancora='meio')

    # 5 · para quem
    s = d.slide('Para quem', 'A mudança chega de um jeito diferente para cada grupo',
                'Uma coluna por público. Diga o que muda no dia a dia, o que não muda e o que cada grupo ganha.\n'
                'Escreva do ponto de vista de quem recebe ("o que muda para mim"), não do projeto.\n'
                'Se houver mais de três públicos, duplique o slide em vez de apertar as colunas.')
    for i, (x, w) in enumerate(faixas(3, calha=0.45)):
        fio(s, x, Y_TOPO, x + w, Y_TOPO, AZP, 1.25)
        texto(s, x, Y_TOPO + 0.16, w, 2.75, [H(f'[Público {i + 1}]', tam=20, entre=2), P('[Quantas pessoas, de quais áreas]', tam=T_TAB, cor=CZ, entre=14),
                                             R('O que muda no dia a dia', CZ, entre=3), P('[Em uma ou duas frases.]', entre=12),
                                             R('O que não muda', CZ, entre=3), P('[Em uma ou duas frases.]')])
        painel(s, x, Y_TOPO + 3.05, w, 1.1, [R('O que ganha', AZ, entre=3), P('[O benefício para este grupo, em uma frase.]', cor=AZP, negrito=True)], fundo=AZC, margem=0.2, ancora='meio')

    # 6 · jornada
    s = d.slide('Jornada', 'Até o go-live, cinco marcos preparam você para a virada',
                'Marcos que as pessoas vão sentir: comunicação, preparação dos gestores, capacitação, virada e apoio.\n'
                'Em cada marco: quando acontece, o que acontece e qual é a parte de cada pessoa. O marco em destaque é o go-live; arraste o destaque se a ordem mudar.\n'
                'Evite o cronograma do projeto: aqui entra só o que as equipes percebem.')
    marcos = ['Lançamento e escuta', 'Preparação dos gestores', 'Capacitação e prática', 'Go-live', 'Apoio e reforço']
    yl, lb = Y_TOPO + 1.15, UTIL / 5
    fio(s, MARGEM, yl, DIR, yl, AZP, 1.25)
    for i, m in enumerate(marcos):
        x, vira = MARGEM + i * lb, m == 'Go-live'
        rotulo(s, x, yl - 0.55, lb - 0.2, '[mês]', AZ)
        dn = 0.34 if vira else 0.2
        oval(s, x, yl - dn / 2, dn, AZ if vira else BR, BR if vira else AZP, 1.5, nome=f'Marco {i + 1}')
        # o nome do marco tem caixa própria, de duas linhas, para os rótulos de baixo ficarem alinhados entre as colunas
        texto(s, x, yl + 0.45, lb - 0.25, 0.64, [H(m, cor=AZ if vira else AZP, entre=0)])
        texto(s, x, yl + 1.22, lb - 0.25, 1.7, [R('O que acontece', CZ, entre=3), P('[Em uma frase.]', entre=14), R('A sua parte', CZ, entre=3), P('[O que esperamos de você.]')])

    # 7 · rede de apoio
    s = d.slide('Rede de apoio', 'Você não está sozinho: conte com quatro apoios',
                'Mostre a rede de apoio: quem procurar, onde aprender e como dar retorno.\n'
                'Troque os textos entre colchetes por nomes, datas e endereços reais. Apoio sem nome e sem canal não é usado.\n'
                'Combine com os gestores antes: eles são a primeira referência e precisam saber responder.')
    rede = [('Seu gestor', 'Primeira referência para dúvidas e para o que muda na sua rotina.', 'Quem', '[Nome do gestor ou da gestora]'),
            ('Multiplicadores', 'Colegas preparados para ajudar no posto de trabalho.', 'Quem', '[Nomes ou áreas]'),
            ('Capacitação', 'Prática perto do uso, guias rápidos e vídeos curtos.', 'Quando', '[Formatos e datas]'),
            ('Canal de escuta', 'Tudo o que chega tem resposta.', 'Onde', '[Onde registrar dúvidas e sugestões]')]
    for i, ((x, w), (t, c, rot, quem)) in enumerate(zip(faixas(4, calha=0.4), rede)):
        passo_numerado(s, x, Y_TOPO, w, 2.6, f'{i + 1:02d}', t, c, tam_num=40)
        painel(s, x, Y_TOPO + 2.75, w, 1.05, [R(rot, AZ, entre=3), P(quem, cor=AZP, negrito=True)], fundo=AZC, margem=0.2, ancora='meio')

    # 8 · o que pedimos
    s = d.fechamento('O que pedimos', '[O compromisso que esperamos de cada pessoa, em uma frase.]',
                     'Feche com um pedido claro e com a próxima data que importa. Quem fala é o patrocinador.\n'
                     'As três atitudes devem ser concretas e observáveis: participar da capacitação, testar no ambiente de prática, trazer o que não funciona.\n'
                     'Termine dizendo quando e onde as pessoas terão a próxima notícia.')
    atitudes = ['[Atitude 1: participar da capacitação.]', '[Atitude 2: testar no ambiente de prática.]', '[Atitude 3: trazer o que não funciona.]']
    for i, ((x, w), t) in enumerate(zip(faixas(3, MARGEM, 8.7, 0.4), atitudes)):
        texto(s, x, 4.4, w, 1.3, [P(f'{i + 1:02d}', tam=24, cor=AZS, fonte=TIT, italico=True, entre=4), P(t, tam=T_LEAD, cor=BR)])
    texto(s, MARGEM, 6.05, 8.7, 0.4, [P('*Próxima data:* [dia, horário e local do próximo passo]', tam=T_CORPO, cor=AZS)], ancora='meio')

    return d.salvar('apresentacao-kickoff-da-mudanca.pptx', pasta)


# ================================================================ 2 · relatório executivo de adoção
# Exemplo dois meses depois do go-live (coerente com o painel de indicadores do blog): índice de adoção de 20% para 56%.
# (área, pessoas em Resiste, Observa, Experimenta, Adota, Multiplica): as mesmas áreas e pessoas da planilha "Mapa de adoção", dois meses depois
REL_AREAS = [('TI', (0, 1, 1, 4, 2)), ('Comercial', (1, 2, 5, 12, 5)), ('RH', (0, 1, 1, 3, 1)),
             ('Suprimentos', (1, 1, 3, 5, 2)), ('Financeiro', (1, 2, 5, 7, 3)), ('Operações', (5, 8, 11, 14, 4))]
REL_SEMANAS = ['Go-live'] + [f'S{i}' for i in range(1, 9)]
REL_REALIZADO = [.20, .22, .25, .28, .32, .37, .43, .49, .56]
REL_PLANEJADO = [.20, .26, .32, .38, .44, .50, .57, .63, .70]


def relatorio(pasta=None):
    d = Deck('Relatório executivo de adoção', 'Modelo de relatório para o comitê: uso real, onde a adoção trava e as decisões que precisam ser tomadas.',
             'gestão da mudança; adoção; comitê; relatório executivo; ADKAR')

    d.capa('Relatório executivo', 'Adoção do\v_[nome do projeto]_',
           'Para o comitê: o uso real, onde a adoção trava e as decisões que precisam ser tomadas hoje.',
           'Relatório para o comitê do projeto. A ordem é a da pirâmide: primeiro a resposta, depois a evidência, depois o que se pede.\n'
           'Troque os dados de exemplo pelos do seu projeto (clique em cada gráfico e use "Editar dados") e reescreva os títulos com a sua conclusão.\n'
           'O exemplo mostra um projeto dois meses depois do go-live, com as mesmas áreas das planilhas do blog.',
           meta='[Comitê] · [data da reunião]')

    # 2 · síntese
    s = d.slide('Síntese', 'A adoção chegou a [56%], [14 pontos] abaixo da meta',
                'Abra com a resposta: estamos no caminho ou não, e por quê. O título é a mensagem principal.\n'
                'Cartões: valor atual, situação, meta com o atingimento (valor ÷ meta) e variação contra o último comitê. Situação: na meta (100% ou mais), '
                'em atenção (85% a 99%) e crítico (abaixo de 85%). A etiqueta fica mais escura quanto mais atenção o indicador pede.\n'
                'Embaixo, três linhas de leitura e, no painel azul, a decisão mais importante da reunião.', dica=EXEMPLO)
    cartoes = [('Índice de adoção', 56, 70, '+24 p.p. contra o último comitê'), ('Uso efetivo', 81, 85, '+13 p.p. contra o último comitê'),
               ('Proficiência', 64, 75, '+16 p.p. contra o último comitê'), ('Benefício realizado', 41, 60, '+19 p.p. contra o último comitê')]
    for (x, w), (nome, v, meta, var) in zip(faixas(4), cartoes):
        sit, at = situacao(v, meta)
        cartao_indicador(s, x, Y_TOPO, w, 2.05, nome, f'{v}%', f'{meta}%', sit, None, at, variacao=var)
    xl, wl = col(0, 8)
    leitura = [('Avançou', '[O que melhorou desde o último comitê e o que explica o avanço.]'), ('Travou', '[Onde a adoção parou e a causa provável, em uma linha.]'),
               ('Risco principal', '[O que mais ameaça a adoção agora.]')]
    tabela(s, xl, 4.5, [1.6, wl - 1.6], [[t, {'t': c, 'cor': CZ}] for t, c in leitura], 0.62, cab=False, tam=T_CORPO, nome='Tabela: leitura do período')
    xp, wp = col(8, 4)
    painel(s, xp, 4.5, wp, 1.86, [R('O que pedimos hoje', AZS, entre=6), H('[A decisão mais importante desta reunião.]', cor=BR, tam=17, entre=6),
                                  P('As três decisões estão no slide 6.', tam=T_TAB, cor=AZC)], fundo=AZP, margem=0.28, my=0.2)

    # 3 · evolução
    s = d.slide('Evolução', 'O índice de adoção quase triplicou desde o go-live, mas o ritmo ainda não alcança a meta',
                'Curva de adoção por semana contra a curva planejada. Clique no gráfico e use "Editar dados" para trocar os valores.\n'
                'À direita, os três números que resumem o gráfico: onde estamos, a meta e a distância. Atualize junto com os dados.\n'
                'Se a distância para o planejado aumenta por duas ou três leituras seguidas, leve a causa (slide 5) e uma decisão (slide 6).', dica=EXEMPLO)
    xg, wg = col(0, 8)
    legenda(s, xg, Y_TOPO, [(AZ, 'Índice de adoção realizado'), (CZ, 'Curva planejada')])
    POS = XL_LABEL_POSITION
    grafico_linhas(s, xg - 0.05, Y_TOPO + 0.35, wg + 0.05, H_UTIL - 0.35, REL_SEMANAS, [('Índice de adoção realizado', REL_REALIZADO), ('Curva planejada', REL_PLANEJADO)],
                   [dict(cor=AZ, pos=POS.BELOW, tam_marcador=8, esp=2.5), dict(cor=CZ, tracejado=True, marcador=False, esp=1.5, cor_rotulo=CZ, pos=POS.ABOVE)],
                   nome='Gráfico: índice de adoção por semana', descr='Linhas com o índice de adoção realizado por semana e a curva planejada.', tam_rot=T_TAB)
    xn, wn = col(8, 4)
    distancia = round((REL_PLANEJADO[-1] - REL_REALIZADO[-1]) * 100)
    for k, (rot, v, descr) in enumerate([('Adoção hoje', f'{REL_REALIZADO[-1]:.0%}', 'das pessoas em Adota ou Multiplica'), ('Meta para esta semana', f'{REL_PLANEJADO[-1]:.0%}', 'pela curva planejada'),
                                         ('Distância', f'{distancia} p.p.', '[O que explica a distância, em uma linha.]')]):
        indicador(s, xn, Y_TOPO + k * 1.45, wn, rot, v, descr, h=1.4, cor_fio=AZ if k == 2 else AZP)

    # 4 · por área
    s = d.slide('Por área', 'A adoção avança em [TI e Comercial] e trava em [Operações], a área com mais gente',
                'Régua de adoção por área, da mais avançada para a mais atrasada. Clique no gráfico e use "Editar dados" para informar a parcela de pessoas em cada marca '
                '(a soma de cada área é 100%). Os números vêm da planilha "Mapa de adoção". A última barra é o conjunto das áreas.\n'
                'Índice de adoção = pessoas em Adota ou Multiplica. Atualize os valores à direita junto com o gráfico.\n'
                'Use leitura agregada por área: o mapa serve para decidir onde investir energia, não para avaliar pessoas.', dica=EXEMPLO)
    regua_adocao(s, MARGEM, Y_TOPO, UTIL, H_UTIL, [a for a, _ in REL_AREAS], [[v / sum(c) for v in c] for _, c in REL_AREAS], pessoas=[sum(c) for _, c in REL_AREAS])

    # 5 · causas
    grupos = [g for g in EX_ADKAR if g[0] in ('Atendimento', 'Supervisores de loja', 'Analistas de contas a pagar', 'Vendas internas')]
    grupos.sort(key=lambda g: -g[2])
    s = d.slide('Causas', 'Nos grupos de [Operações], a barreira ainda é [Consciência]: falta o porquê, não o treinamento',
                'Leitura ADKAR dos grupos com adoção mais baixa. As notas de 1 a 5 e o ponto de barreira vêm da planilha "Avaliação ADKAR com mapa de resistência".\n'
                'O ponto de barreira (célula em azul profundo) é o primeiro elemento, na ordem do modelo, com nota 3 ou menor. As demais notas seguem a régua: cinzas para as baixas, azuis para as altas. A ação certa depende da barreira: '
                'não adianta treinar quem ainda não entendeu por que mudar.\n'
                'Complete a evidência nas anotações ou na fala: o que os dados e as conversas mostram. ADKAR é marca registrada da Prosci.', dica=EXEMPLO)
    linhas = [['Grupo'] + [{'t': e, 'alinh': 'centro'} for e in ELEMENTOS] + ['Ação para destravar', 'Dono e prazo']]
    for g in grupos:
        pb = barreira(g[3:8])
        notas = [celula_nota(n, ELEMENTOS[k] == pb) for k, n in enumerate(g[3:8])]
        linhas.append([{'t': f'{g[0]}\v_{g[1]}_'}] + notas + [ACAO_ADKAR[pb], '[Nome] · [data]'])
    tabela(s, MARGEM, Y_TOPO, [2.6] + [1.05] * 5 + [UTIL - 9.25, 1.4], linhas, 0.74, 0.42, caixa_cab=False, nome='Tabela: leitura ADKAR por grupo')
    legenda(s, MARGEM, 6.12, [(AZP, 'Ponto de barreira: primeiro elemento com nota 3 ou menor'), (CZ, 'Nota 1'), (LIN, 'Nota 2'), (CZC, 'Nota 3'), (AZS, 'Nota 4'), (AZ, 'Nota 5')])

    # 6 · decisões
    s = d.slide('Decisões', 'Precisamos de três decisões do comitê hoje',
                'Cada decisão com contexto, opções e recomendação. O comitê existe para decidir, não só para ser informado.\n'
                'Escreva a decisão como pergunta que se responde com sim, não ou uma escolha. Diga o que acontece com a adoção se a decisão não for tomada.\n'
                'Registre na hora quem decidiu e a data. Leve a decisão para o slide seguinte.')
    hl = 1.3
    for i in range(3):
        y = Y_TOPO + i * (hl + 0.1)
        fio(s, MARGEM, y, DIR, y, AZP if i == 0 else LIN, 1.25 if i == 0 else 0.75)
        texto(s, MARGEM, y + 0.18, 0.9, 0.9, f'{i + 1:02d}', tam=40, cor=AZ, fonte=TIT, italico=True)
        texto(s, MARGEM + 1.05, y + 0.2, 4.9, hl - 0.3, [H('[Decisão necessária, em uma frase.]', entre=5), P('[Contexto em uma ou duas linhas e as opções consideradas.]', tam=T_TAB, cor=CZ)])
        painel(s, MARGEM + 6.2, y + 0.18, 3.3, hl - 0.26, [R('Recomendação', AZ, entre=3), P('[O que recomendamos e por quê.]', tam=T_TAB, cor=AZP, negrito=True)], fundo=AZC, margem=0.18)
        texto(s, MARGEM + 9.75, y + 0.3, UTIL - 9.75, hl - 0.4, [R('Se não decidirmos', CZ, entre=3), P('[O que acontece com a adoção.]', tam=T_TAB, cor=TINTA)])

    # 7 · próximo ciclo
    s = d.slide('Próximo ciclo', 'Até o próximo comitê, [seis] ações têm dono e data',
                'Compromissos com dono e data. Volte a este slide na abertura da próxima reunião e atualize a situação.\n'
                'Situação: a fazer (cinza claro), em andamento (azul vivo) e concluída (azul profundo). Troque o texto e o preenchimento da célula juntos.\n'
                'Em "Resultado esperado na adoção", escreva o que deve mudar no uso, não a atividade em si.', dica=EXEMPLO)
    acoes = [('Patrocinador abre a reunião semanal de Operações com os dados de adoção', 'Supervisores passam a acompanhar o uso por loja', 'Em andamento'),
             ('Gestores de Operações refazem a conversa do porquê com as equipes', 'Atendimento e lojas saem de Resiste e Observa', 'Em andamento'),
             ('Apoio no posto de trabalho por mais quatro semanas', 'Proficiência chega a 75% das tarefas sem retrabalho', 'A fazer'),
             ('Multiplicadores de Comercial apresentam o que funcionou', 'Outras áreas copiam as práticas de quem já adota', 'A fazer'),
             ('[Ação]', '[O que deve mudar no uso]', 'A fazer'), ('[Ação]', '[O que deve mudar no uso]', 'A fazer')]
    nivel = {'A fazer': 0, 'Em andamento': 2, 'Concluída': 3}
    linhas = [['Ação', 'Resultado esperado na adoção', 'Dono', {'t': 'Data', 'alinh': 'dir'}, {'t': 'Situação', 'alinh': 'centro'}]]
    linhas += [[{'t': a, 'negrito': False, 'cor': TINTA}, {'t': r, 'cor': CZ}, '[Nome]', {'t': '[dd/mm]', 'alinh': 'dir'}, celula(st, nivel[st])] for a, r, st in acoes]
    tabela(s, MARGEM, Y_TOPO, [4.3, 3.75, 1.2, 0.95, UTIL - 10.2], linhas, 0.58, 0.36, nome='Tabela: ações até o próximo comitê')

    return d.salvar('relatorio-executivo-de-adocao.pptx', pasta)


# ================================================================ 3 · workshop com patrocinadores
def workshop(pasta=None):
    d = Deck('Workshop com patrocinadores', 'Roteiro de 90 minutos para alinhar a liderança sobre o papel de quem patrocina a mudança e sair com compromissos.',
             'gestão da mudança; patrocínio; liderança; workshop; stakeholders')

    d.capa('Workshop com patrocinadores', 'O papel de quem\vpatrocina a mudança',
           'Noventa minutos para alinhar a liderança: o que se espera de quem patrocina, onde podemos travar e que compromissos saem da sala.',
           'Roteiro de 90 minutos em quatro blocos. Cada bloco abre com uma divisória e termina com uma saída concreta.\n'
           'Antes do encontro: troque os textos entre colchetes, traga os números do projeto e combine com o patrocinador principal a fala de abertura.\n'
           'Durante: projete os slides de exercício e preencha na hora, com o grupo. Depois: envie os compromissos a todos no mesmo dia.',
           meta='[Projeto] · [data e local]')

    # 2 · agenda
    s = d.slide('Agenda', 'Em noventa minutos, cada líder sai com um compromisso',
                'Ajuste os tempos de cada bloco (o comprimento das barras acompanha os minutos: redimensione se mudar). O bloco de compromissos não pode ser cortado.\n'
                'Diga logo na abertura qual é a saída esperada: um compromisso visível por líder, para os próximos 30 dias.')
    blocos = [('Onde estamos', 15, 'O que muda, para quem e o que já sabemos da adoção.', 'A mesma leitura do ponto de partida'),
              ('O papel de quem patrocina', 20, 'Três atitudes que só a liderança pode ter.', 'A nota do grupo em cada atitude'),
              ('Onde podemos travar', 30, 'Quem tem influência e ainda não apoia.', 'Quem conversa com quem, e até quando'),
              ('Compromissos', 25, 'O que cada líder faz nos próximos 30 dias.', 'Um compromisso visível por líder')]
    alt, xs, xb = 0.95, MARGEM + 5.9, MARGEM + 9.2
    rotulo(s, MARGEM + 1.0, Y_TOPO, 4.5, 'Bloco'); rotulo(s, xs, Y_TOPO, 3.0, 'Saída'); rotulo(s, xb, Y_TOPO, 2.5, 'Tempo')
    for i, (t, minutos, c, saida) in enumerate(blocos):
        y, ultimo = Y_TOPO + 0.32 + i * alt, i == 3
        fio(s, MARGEM, y, DIR, y, AZP if i == 0 else LIN, 1.25 if i == 0 else 0.75)
        texto(s, MARGEM, y, 0.9, alt, f'{i + 1:02d}', tam=32, cor=AZ, fonte=TIT, italico=True, ancora='meio')
        texto(s, MARGEM + 1.0, y, 4.6, alt, [H(t, entre=3), P(c, tam=T_TAB, cor=CZ)], ancora='meio')
        texto(s, xs, y, 3.0, alt, saida, cor=AZP, negrito=True, ancora='meio')
        wb = 1.7 * minutos / 30
        ret(s, xb, y + alt / 2 - 0.09, wb, 0.18, AZP if ultimo else AZS, nome=f'Barra de tempo: {minutos} minutos')
        texto(s, xb + wb + 0.12, y, 0.7, alt, f'{minutos} min', cor=AZP, negrito=True, ancora='meio')
    fio(s, MARGEM, Y_TOPO + 0.32 + 4 * alt, DIR, Y_TOPO + 0.32 + 4 * alt, LIN, 0.75)

    # 3 a 4 · bloco 1
    d.divisoria('01', 'Onde estamos', 'O que muda, para quem e o que já sabemos da adoção.',
                'Bloco 1, 15 minutos. Objetivo: todos saem com a mesma leitura do ponto de partida.\n'
                'Se precisar de mais detalhe, traga dois ou três slides do kit de gestão da mudança: a mudança em uma página, os impactos e a régua de adoção.',
                olho='Bloco 1 · 15 minutos')
    s = d.slide('Onde estamos', 'A mudança chega a [180] pessoas em [cinco] áreas',
                'Três números para situar o grupo, cada um com uma frase de leitura. Troque pelos números do seu projeto '
                '(pessoas impactadas e impactos altos vêm da planilha "Lista de impactos com dashboard"; o índice de adoção, do "Mapa de adoção").\n'
                'Peça que cada líder diga, em uma frase, como a mudança aparece na área dele. Não discuta soluções ainda.', dica=EXEMPLO)
    situ = [('Pessoas impactadas', '180', 'O que muda', '[Em uma frase: processos, sistemas e papéis que mudam.]'),
            ('Impactos de grau alto, em 8 mapeados', '4', 'Para quem pesa mais', '[Os grupos com mais impacto e o que cada um perde ou precisa aprender.]'),
            ('Índice de adoção hoje', '27%', 'O que já sabemos', '[Onde a adoção avança, onde trava e o que os gestores estão ouvindo.]')]
    for (x, w), (rot, v, t, c) in zip(faixas(3, calha=0.45), situ):
        indicador(s, x, Y_TOPO, w, rot, v, tam=60, h=1.7)
        bloco(s, x, Y_TOPO + 2.0, w, 2.2, None, t, c, cor_fio=LIN, esp=0.75, tam_tit=20, tam=14)

    # 5 a 7 · bloco 2
    d.divisoria('02', 'O papel de quem patrocina', 'Três atitudes que só a liderança pode ter, e a nota que este grupo se dá em cada uma.',
                'Bloco 2, 20 minutos. Apresente as três atitudes (slide seguinte) e faça a autoavaliação (slide depois dele). Saída do bloco: a nota que o grupo se dá em cada atitude.', olho='Bloco 2 · 20 minutos')
    s = d.slide('O papel', 'Três atitudes que só o patrocinador pode ter',
                'Apresente cada atitude e peça um exemplo concreto neste projeto. Preencha o painel "Neste projeto" com o que o grupo disser.\n'
                'Patrocínio não se delega: a equipe do projeto prepara, mas a presença, a coalizão e a mensagem do porquê são de quem lidera.')
    atitudes = [('Ser presença ativa e visível', 'Estar presente do começo ao fim, não só no lançamento: abrir reuniões, perguntar pela adoção, aparecer na operação.', '[Onde a sua presença faz diferença]'),
                ('Formar a coalizão de líderes', 'Alinhar os outros diretores e gestores para que digam a mesma coisa às suas equipes.', '[Quem precisa estar junto]'),
                ('Comunicar diretamente', 'Explicar por que a mudança existe e o risco de não mudar. Essa mensagem tem mais força vinda do topo.', '[Momentos e canais]')]
    for i, ((x, w), (t, c, neste)) in enumerate(zip(faixas(3, calha=0.45), atitudes)):
        passo_numerado(s, x, Y_TOPO, w, 2.85, f'{i + 1:02d}', t, c, tam_num=40)
        painel(s, x, Y_TOPO + 3.15, w, 1.0, [R('Neste projeto', AZ, entre=3), P(neste, cor=AZP, negrito=True)], fundo=AZC, margem=0.2, ancora='meio')
    notas_ex = [3.4, 2.6, 3.1]
    s = d.slide('Exercício 1', 'Onde estamos em cada atitude: a nota que o grupo se dá',
                'Autoavaliação. Cada líder dá uma nota de 1 a 5 para o grupo em cada atitude (1 = quase nunca fazemos; 5 = fazemos sempre, e as equipes veem). '
                'Calcule a média e registre no gráfico: clique nele e use "Editar dados".\n'
                'Comece a conversa pela nota mais baixa (a barra escura; troque o destaque se for outra) e preencha, à direita, o que o grupo fará para subir um ponto.\n'
                'A nota não é avaliação de ninguém: é o ponto de partida do grupo.', dica='Exemplo ilustrativo: registre a média das notas do grupo.')
    nomes = [a[0] for a in atitudes]
    yg, hg = Y_TOPO + 0.35, 3.3
    faixa = hg / 3
    rotulo(s, MARGEM, Y_TOPO, 3.2, 'Atitude'); rotulo(s, MARGEM + 3.4, Y_TOPO, 3.6, 'Nota média do grupo, de 1 a 5'); rotulo(s, MARGEM + 7.6, Y_TOPO, UTIL - 7.6, 'O que faremos para subir um ponto', AZ)
    grafico_barras(s, MARGEM + 3.4, yg, 3.9, hg, nomes, notas_ex, destaque=[notas_ex.index(min(notas_ex))], maximo=5, fmt='0.0', vao=90, horizontal=True, rotulo_cat=False,
                   margens=(0.0, 0.0, 0.86, 1.0), nome='Gráfico: nota do grupo por atitude', descr='Barras com a nota média de 1 a 5 que o grupo se dá em cada atitude de patrocínio.', tam_rot=16)
    for i, n in enumerate(nomes):
        y = yg + i * faixa
        fio(s, MARGEM, y, DIR, y, AZP if i == 0 else LIN, 1.25 if i == 0 else 0.75)
        texto(s, MARGEM, y, 3.2, faixa, [P(f'{i + 1:02d}', tam=T_LEAD, cor=AZ, fonte=TIT, italico=True, entre=0), H(n, tam=17)], ancora='meio')
        texto(s, MARGEM + 7.6, y, UTIL - 7.6, faixa, '[A ação que este grupo assume, com quem e até quando.]', cor=CZ, ancora='meio')

    # 8 a 9 · bloco 3
    d.divisoria('03', 'Onde podemos travar', 'Quem tem influência e ainda não apoia, o que essa pessoa perde com a mudança e quem conversa com ela.',
                'Bloco 3, 30 minutos. Exercício em grupo com o mapa de stakeholders. Saída do bloco: quem conversa com quem, sobre o quê e até quando.', olho='Bloco 3 · 30 minutos')
    s = d.slide('Exercício 2', 'Quem precisamos conquistar, e quem conversa com quem',
                'Exercício em grupo. Posicione os stakeholders no mapa (arraste os círculos; as notas de influência e de apoio vêm da planilha "Mapa de influência de stakeholders") '
                'e preencham juntos a tabela para quem está no quadrante em destaque.\n'
                'Pergunta-chave: o que essa pessoa perde ou teme com a mudança? A coluna "Quem conversa" só vale com nome, e a última, com data.\n'
                'O mapa é material sensível: combine com o grupo quem recebe este slide depois.', dica='Exemplo ilustrativo: arraste os círculos e preencha a tabela com o grupo.')
    lado = 3.45
    mapa_influencia(s, MARGEM + 0.56, Y_TOPO, lado, [(i + 1, st[2], st[3]) for i, st in enumerate(EX_STAKEHOLDERS)])
    xt = MARGEM + 0.56 + lado + 0.5
    linhas = [['Stakeholder', 'O que perde ou teme', 'Quem conversa', {'t': 'Até quando', 'alinh': 'dir'}],
              ['2 · Diretor de operações', '[Em uma linha]', '[Patrocinador]', {'t': '[data]', 'alinh': 'dir'}],
              ['4 · Gestores de linha', '[Em uma linha]', '[Patrocinador]', {'t': '[data]', 'alinh': 'dir'}]]
    linhas += [['[Nome ou grupo]', '[Em uma linha]', '[Patrocinador]', {'t': '[data]', 'alinh': 'dir'}] for _ in range(3)]
    tabela(s, xt, Y_TOPO - 0.06, [2.15, 2.15, 1.7, DIR - xt - 6.0], linhas, 0.58, 0.36, nome='Tabela: quem conversa com cada stakeholder')

    # 10 a 11 · bloco 4
    d.divisoria('04', 'Compromissos', 'O que cada líder faz nos próximos 30 dias, com quem e como saberemos que aconteceu.',
                'Bloco 4, 25 minutos. Este bloco não pode ser cortado: é a saída do workshop. Cada líder assume um compromisso visível para os próximos 30 dias.', olho='Bloco 4 · 25 minutos')
    s = d.slide('Compromissos', 'Cada líder sai com um compromisso visível para 30 dias',
                'Projete e preencha na hora. Um compromisso por líder: uma ação que as equipes conseguem ver, com data e evidência.\n'
                'Exemplos: abrir a reunião semanal com os dados de adoção, visitar a operação na semana do go-live, conversar com um stakeholder do quadrante "Conquistar".\n'
                'Envie este slide a todos no mesmo dia e volte a ele na abertura do próximo encontro.')
    linhas = [['Líder', 'Compromisso', 'Com quem', {'t': 'Data', 'alinh': 'dir'}, 'Como saberemos']]
    linhas += [['[Nome]', '[Ação que as equipes conseguem ver]', '[Equipe ou stakeholder]', {'t': '[dd/mm]', 'alinh': 'dir'}, '[Evidência]'] for _ in range(6)]
    tabela(s, MARGEM, Y_TOPO, [1.9, 4.1, 2.2, 1.0, UTIL - 9.2], linhas, 0.5, 0.36, nome='Tabela: compromissos de cada líder')
    painel(s, MARGEM, 5.75, UTIL, 0.62, [P('*Regra do compromisso:* uma ação que as equipes conseguem ver, com data e com evidência.', cor=AZP)], fundo=AZC, margem=0.25, my=0.1, ancora='meio')

    # 12 · fechamento
    d.secao('Fechamento')
    s = d.fechamento('Fechamento', 'As pessoas observam o líder da própria área antes de decidir se a mudança é para valer.',
                     'Termine com a frase e com a data do próximo encontro. Peça ao patrocinador principal que feche.\n'
                     'Preencha os três campos de baixo antes de encerrar: quando o grupo se encontra de novo, quem acompanha os compromissos e onde eles ficam registrados.')
    for (x, w), (rot, t) in zip(faixas(3, MARGEM, 8.7, 0.4), [('Próximo encontro', '[Data, horário e local]'), ('Quem acompanha', '[Nome de quem cobra os compromissos]'),
                                                             ('Onde ficam os compromissos', '[Pasta ou canal do grupo]')]):
        texto(s, x, 4.45, w, 1.5, [R(rot, AZS, entre=6), P(t, tam=T_LEAD, cor=BR)])

    return d.salvar('workshop-com-patrocinadores.pptx', pasta)


if __name__ == '__main__':
    kickoff(); relatorio(); workshop()
