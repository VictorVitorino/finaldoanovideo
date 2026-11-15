"""Gera o kit de slides de gestão da mudança (blog/assets/modelos/kit-de-gestao-da-mudanca.pptx).

Quinze slides 16:9, editáveis (formas, tabelas e gráficos nativos), no sistema visual do blog.
As instruções de uso de cada slide ficam nas anotações do orador.
Uso: python3 blog/_src/modelos_pptx.py
"""
import sys

sys.dont_write_bytecode = True      # não deixa __pycache__ no repositório

from modelos_pptx_base import *     # noqa: E402,F403


def kit(pasta=None):
    d = Deck('Kit de slides de gestão da mudança', 'Modelo para apresentar a estratégia de mudança, quem é impactado, como conduzir e como medir a adoção.',
             'gestão da mudança; estratégia; stakeholders; RACI; ADKAR; adoção; riscos')

    # 1 · capa
    d.capa('Kit de slides', 'Gestão da mudança\vdo _[nome do projeto]_',
           'Para apresentar o que muda e para quem, como vamos conduzir e como saberemos que deu certo.',
           'Como usar este kit: troque os textos entre colchetes, substitua os dados de exemplo e apague os slides que não precisar. '
           'Cada slide traz aqui, nas anotações, para que serve e como preencher.\n'
           'Os títulos são frases de conclusão. Reescreva cada um com a mensagem do seu projeto: quem lê só os títulos deve entender a história.\n'
           'Tabelas e gráficos são nativos: clique para editar o texto ou use "Editar dados" no gráfico. '
           'Os exemplos usam as mesmas áreas e escalas das planilhas do blog, para você levar os números de lá para cá.')

    # 2 · a mudança em uma página
    s = d.slide('Estratégia', 'Mudamos [o quê] para alcançar [resultado] até [data]',
                'A estratégia de mudança em uma página: é a síntese que abre a apresentação. Preencha com o patrocinador: se não couber aqui, a mensagem ainda não está clara.\n'
                'Comece pelo painel azul (por que mudar), na linguagem de quem vive o problema. Depois complete os seis blocos, cada um com duas ou três linhas.\n'
                'Este slide costuma abrir a conversa com a liderança e volta em toda apresentação do projeto.')
    x0, w0 = col(0, 4)
    painel(s, x0, Y_TOPO, w0, H_UTIL, [R('Por que mudar', AZS, entre=8),
                                      H('[O problema ou a oportunidade, em duas frases, na linguagem de quem vive o problema.]', cor=BR, tam=20, entre=22),
                                      R('Se nada mudar', AZS, entre=6), P('[O custo de ficar como está, com um exemplo do dia a dia.]', cor=AZC, tam=14)],
           fundo=AZP, margem=0.32)
    xg, wg = col(4, 8)
    blocos = [('O que muda', '[Processos, sistemas, papéis e indicadores que mudam.]'), ('Quem é impactado', '[Grupos e número de pessoas.]'),
              ('Como será o sucesso', '[Adoção, uso e resultado esperados, com data.]'), ('Quem patrocina', '[Patrocinador e coalizão de líderes.]'),
              ('Como vamos conduzir', '[As frentes de comunicação, capacitação e apoio.]'), ('Principais riscos', '[Os três que mais ameaçam a adoção.]')]
    hb = (H_UTIL - 0.3) / 2
    for i, (t, c) in enumerate(blocos):
        x, w = faixas(3, xg, wg)[i % 3]
        bloco(s, x, Y_TOPO + (i // 3) * (hb + 0.3), w, hb, None, t, c, tam_tit=17)

    # 3 · roteiro
    s = d.slide('Roteiro', 'Três perguntas organizam esta apresentação',
                'Roteiro do detalhe, logo depois da visão em uma página. Diga em uma frase o que você espera do grupo ao final (decisão, apoio ou alinhamento) e escreva isso na faixa de baixo.\n'
                'Se cortar slides do kit, ajuste a lista de cada coluna.')
    partes = [('01', 'O que muda e para quem?', ['Impactos por grupo', 'Mapa de stakeholders', 'Onde a mudança pode travar']),
              ('02', 'Como vamos conduzir?', ['Papéis e responsabilidades', 'Comunicação e capacitação', 'Riscos e respostas']),
              ('03', 'Como saberemos que deu certo?', ['Adoção por área', 'Status para o comitê', 'Próximos 90 dias'])]
    for (x, w), (num, pergunta, itens) in zip(faixas(3, calha=0.45), partes):
        passo_numerado(s, x, Y_TOPO, w, 3.0, num, pergunta, [P(i, cor=CZ, entre=5) for i in itens], tam_num=40)
    painel(s, MARGEM, 5.45, UTIL, 0.92, [R('O que esperamos deste grupo', AZ, entre=3), P('[A decisão, o apoio ou o alinhamento que queremos ao final da apresentação.]', cor=AZP, tam=14)],
           fundo=AZC, margem=0.25, my=0.12, ancora='meio')

    # 4 · divisória
    d.divisoria('01', 'O que muda e para quem', 'Os impactos por grupo, o mapa de stakeholders e onde a mudança pode travar.',
                'Divisória da primeira parte. Use a pausa para lembrar a pergunta que os próximos slides respondem: o que muda, para quem e onde a mudança pode travar.')

    # 5 · impactos
    imp = sorted(EX_IMPACTOS, key=lambda r: (-r[5], -r[6]))
    s = d.slide('Impactos', 'Os impactos mais altos se concentram em [Operações e Suprimentos]',
                'Resumo dos impactos. Os números do topo e as linhas da tabela vêm da planilha "Lista de impactos com dashboard".\n'
                'Mostre só os impactos mais altos (grau 4 ou 5) e deixe a lista completa na planilha. Grau: 4 e 5 = alto, 3 = médio, 1 e 2 = baixo.\n'
                'Para trocar a cor de uma célula de grau, selecione a célula e use Preenchimento: azul profundo para alto, azul vivo para médio, azul suave para baixo.',
                dica=EXEMPLO)
    numeros = [('Impactos mapeados', str(len(EX_IMPACTOS))), ('Impactos altos', str(sum(1 for r in EX_IMPACTOS if r[5] >= 4))),
               ('Pessoas impactadas', str(sum(r[6] for r in EX_IMPACTOS))), ('Grau médio (1 a 5)', f'{sum(r[5] for r in EX_IMPACTOS) / len(EX_IMPACTOS):.1f}'.replace('.', ','))]
    for (x, w), (rot, v) in zip(faixas(4), numeros):
        indicador(s, x, Y_TOPO, w, rot, v, tam=32, h=1.0)
    grau = lambda g: celula(f'{g} · ' + ('Alto' if g >= 4 else 'Médio' if g == 3 else 'Baixo'), 3 if g >= 4 else 2 if g == 3 else 1)
    linhas = [['Grupo impactado', 'O que muda', 'Tipo', {'t': 'Grau', 'alinh': 'centro'}, {'t': 'Pessoas', 'alinh': 'dir'}, 'Ação de mudança']]
    linhas += [[r[2], r[4], r[3], grau(r[5]), {'t': str(r[6]), 'alinh': 'dir'}, r[7]] for r in imp[:5]]
    tabela(s, MARGEM, 3.38, [2.2, 3.65, 1.25, 1.05, 0.85, UTIL - 9.0], linhas, 0.53, 0.36, nome='Tabela: impactos mais altos')

    # 6 · stakeholders
    s = d.slide('Stakeholders', 'A prioridade é conquistar quem tem muita influência e ainda não apoia',
                'Mapa de influência (vertical) por apoio à mudança (horizontal). Arraste os círculos numerados para a posição de cada stakeholder; '
                'as notas de 1 a 5 vêm da planilha "Mapa de influência de stakeholders".\n'
                'Quadrante destacado: muita influência e pouco apoio. É onde a mudança costuma travar e onde o patrocinador precisa entrar.\n'
                'O mapa é retrato do momento e material sensível: atualize a cada fase e pense em quem recebe este slide.',
                dica='Exemplo ilustrativo: arraste os círculos para a posição de cada stakeholder.')
    lado = 3.7
    mapa_influencia(s, MARGEM + 0.56, Y_TOPO, lado, [(i + 1, st[2], st[3]) for i, st in enumerate(EX_STAKEHOLDERS)])
    xq, wq = MARGEM + 0.56 + lado + 0.6, DIR - (MARGEM + 0.56 + lado + 0.6)
    quad = [('Conquistar', 'Muita influência, pouco apoio. Entender o que a pessoa perde e envolver o patrocinador.', AZ, 2.5),
            ('Mobilizar', 'Muita influência e apoio. Dar papel visível na coalizão de patrocínio.', AZP, 1.25),
            ('Ouvir', 'Pouca influência, pouco apoio. A resistência costuma ser informação sobre o desenho.', AZP, 1.25),
            ('Envolver', 'Pouca influência formal, apoio alto. São bons multiplicadores.', AZP, 1.25)]
    for i, (nome, acao, cor, esp) in enumerate(quad):
        x, w = faixas(2, xq, wq)[i % 2]
        bloco(s, x, Y_TOPO + (i // 2) * 1.62, w, 1.45, None, nome, acao, cor_fio=cor, esp=esp, tam_tit=17, tam=T_TAB)
    rotulo(s, xq, Y_TOPO + 3.3, wq, 'Quem está no mapa')
    for k, (x, w) in enumerate(faixas(3, xq, wq, 0.2)):
        texto(s, x, Y_TOPO + 3.58, w, 0.5, [P(f'*{i + 1}*  {EX_STAKEHOLDERS[i][0]}', tam=T_ROTULO + 1, cor=CZ, entre=2) for i in (k, k + 3)])

    # 7 · ADKAR
    # pessoas por ponto de barreira, como no painel da planilha: cada grupo trava no primeiro elemento com nota 3 ou menor
    por_barreira = {}
    for g in EX_ADKAR: por_barreira[barreira(g[3:8])] = por_barreira.get(barreira(g[3:8]), 0) + g[2]
    pessoas = [por_barreira.get(e, 0) for e in ELEMENTOS]
    avaliadas = sum(g[2] for g in EX_ADKAR)
    pb = pessoas.index(max(pessoas))
    s = d.slide('Diagnóstico', f'[{pessoas[pb] / avaliadas:.0%}] das pessoas travam em [{ELEMENTOS[pb]}]: é ali que a ação precisa começar',
                'Leitura ADKAR do projeto: pessoas por ponto de barreira. Os números vêm do painel da planilha "Avaliação ADKAR com mapa de resistência": '
                'clique no gráfico e use "Editar dados" para trocar os valores.\n'
                'O ponto de barreira de cada grupo é o primeiro elemento, na ordem do modelo, com nota 3 ou menor. Não é a menor nota: não adianta treinar quem ainda não decidiu participar.\n'
                'A coluna em azul profundo é a barreira com mais gente: se for outra, clique duas vezes na coluna e troque o preenchimento. Ajuste a faixa de baixo com a ação, o dono e o prazo.\n'
                'ADKAR é marca registrada da Prosci.', dica=EXEMPLO)
    hg = 1.72
    rotulo(s, MARGEM, Y_TOPO - 0.04, 5.0, 'Pessoas por ponto de barreira')
    grafico_barras(s, MARGEM, Y_TOPO, UTIL, hg, ELEMENTOS, pessoas, destaque=[pb], maximo=max(pessoas) * 1.2, fmt='0', vao=150, rotulo_cat=False,
                   margens=(0.0, 0.2, 1.0, 0.8), nome='Gráfico: pessoas por ponto de barreira do ADKAR',
                   descr='Colunas com o número de pessoas em cada ponto de barreira do ADKAR; a coluna escura é a barreira com mais gente.')
    significa = ['Entende por que mudar', 'Quer participar', 'Sabe como fazer', 'Consegue fazer', 'Mantém a mudança']
    acoes = ['Patrocinador explica o porquê e o risco de não mudar', 'Gestor direto conversa sobre perdas e ganhos', 'Capacitação no processo, perto do uso',
             'Prática guiada e apoio no posto de trabalho', 'Reconhecer, medir o uso e tirar atritos']
    lb = UTIL / 5
    for i in range(5):
        x = MARGEM + i * lb + 0.12
        texto(s, x, Y_TOPO + hg + 0.08, lb - 0.24, 1.75, [H(ELEMENTOS[i], tam=17, alinh='centro', entre=2), P(significa[i], tam=T_TAB, cor=CZ, alinh='centro', entre=10),
                                                         R('Se for a barreira', AZ if i == pb else CZ, alinh='centro', entre=3), P(acoes[i], tam=T_TAB, cor=TINTA, alinh='centro')])
    yp = 5.72
    ret(s, MARGEM, yp, UTIL, 0.72, AZC, nome='Faixa: ponto de barreira')
    for (x, w), (rot, t) in zip(faixas(3, MARGEM + 0.25, UTIL - 0.5, 0.3), [('Ponto de barreira', f'[{ELEMENTOS[pb]}]: {pessoas[pb]} de {avaliadas} pessoas'),
                                                                              ('Ação prioritária', '[O que será feito para destravar]'), ('Dono e prazo', '[Nome] · [data]')]):
        texto(s, x, yp, w, 0.72, [R(rot, AZ, entre=2), P(t, tam=T_CORPO, cor=AZP, negrito=True)], ancora='meio')

    # 8 · divisória
    d.divisoria('02', 'Como vamos conduzir', 'Quem faz o quê, o que cada público precisa ouvir e aprender, e os riscos que pedem resposta.',
                'Divisória da segunda parte. Use a pausa para dizer o que os próximos slides respondem: quem faz o quê, o que cada público precisa ouvir e aprender, e que riscos pedem resposta.')

    # 9 · RACI
    s = d.slide('Papéis', 'Cada atividade da mudança tem um único aprovador',
                'Matriz RACI. R = responsável (executa), A = aprova e responde pelo resultado (um por atividade), C = consultado, I = informado. '
                'Use A/R quando a mesma pessoa aprova e executa.\n'
                'Troque as letras direto nas células e ajuste a cor do preenchimento. As atividades e os papéis vêm da planilha "Matriz RACI da mudança", que confere se falta ou sobra aprovador.\n'
                'Leitura: muitos R no mesmo papel indicam sobrecarga; muitos C deixam a decisão lenta. Valide a matriz com as pessoas, não só com o organograma.', dica=EXEMPLO)
    matriz_raci(s, MARGEM, Y_TOPO, UTIL, EX_PAPEIS, EX_RACI[:9], alt=0.365)
    legenda_raci(s, MARGEM, 6.1)

    # 10 · comunicação e capacitação
    s = d.slide('Comunicação e capacitação', 'Cada público ouve do emissor certo e treina perto do uso',
                'Uma linha por público. Escreva a mensagem-chave do ponto de vista de quem recebe ("o que muda para mim").\n'
                'Quem comunica: a mensagem de negócio vem do patrocinador; o impacto no dia a dia, do gestor direto.\n'
                'Capacitação: formato, duração e momento, sempre perto do uso. Em "Como medir", prefira comportamento e resultado a presença e satisfação. '
                'O detalhe fica na planilha "Plano editorial de treinamentos".', dica=EXEMPLO)
    linhas = [['Público', 'Mensagem-chave', 'Quem comunica', 'Canal e momento', 'Capacitação', 'Como medir'],
              ['Gestores diretos', 'O que muda na equipe e qual é o papel de quem lidera', 'Patrocinador', 'Reunião de líderes, 3 semanas antes', 'Ao vivo on-line, 90 min: como conduzir a equipe', 'Conversa feita com a equipe'],
              ['Usuários-chave', 'Por que foram escolhidos e o que se espera deles', 'Líder do projeto', 'Encontro dedicado, 2 semanas antes', 'Prática guiada, 4 h: processo de ponta a ponta', 'Executa o processo sem ajuda'],
              ['Usuários finais', 'O que muda no meu dia a dia e onde pedir ajuda', 'Gestor direto', 'Reunião de equipe, na semana do go-live', 'Prática guiada, 2 h: tarefas mais frequentes', 'Uso na rotina, sem retrabalho'],
              ['Todos', 'O que já funciona e o que ainda vamos ajustar', 'Patrocinador', 'Comunicado, 1 semana depois', 'Vídeo curto, 5 min: dúvidas da primeira semana', 'Dúvidas resolvidas no canal']]
    tabela(s, MARGEM, Y_TOPO, [1.6, 2.55, 1.6, 2.05, 2.15, UTIL - 9.95], linhas, 0.7, 0.36, nome='Tabela: comunicação e capacitação por público')
    painel(s, MARGEM, 5.62, UTIL, 0.72, [P('*Quem fala o quê:* o patrocinador explica por que a mudança existe; o gestor direto traduz o que muda na rotina de cada pessoa.', cor=AZP, tam=T_CORPO)],
           fundo=AZC, margem=0.25, my=0.1, ancora='meio')

    # 11 · riscos
    alta = sum(1 for r in EX_RISCOS if r[3] * r[4] >= 15)
    s = d.slide('Riscos', f'[{["Nenhum", "Um", "Dois", "Três", "Quatro", "Cinco"][alta]}] riscos pedem ação imediata para proteger a adoção',
                'Matriz de probabilidade (vertical) por impacto na adoção (horizontal), de 1 a 5. Exposição = probabilidade x impacto.\n'
                'Arraste os círculos numerados para a célula de cada risco. A tabela traz os cinco de maior exposição; a lista completa fica na planilha "Mapa de riscos da mudança".\n'
                'Alta (15 ou mais): ação imediata e acompanhamento no comitê. Média (8 a 14): plano de resposta com dono. Baixa: monitorar.\n'
                'Descreva cada risco como causa e efeito e revise a cada marco do projeto.', dica=EXEMPLO)
    lado = 3.45
    matriz_riscos(s, MARGEM + 0.6, Y_TOPO, lado, [(i + 1, r[3], r[4]) for i, r in enumerate(EX_RISCOS)])
    xt = MARGEM + 0.6 + lado + 0.55
    curta = ['Agenda fixa do patrocinador até a estabilização', 'Preparar os gestores antes das equipes, com roteiro de conversa', 'Prática perto do go-live e apoio no posto de trabalho',
             'Mapa de carga e decisão de sequência com a liderança', 'Reforço pelos supervisores e uso nos indicadores da rotina']
    expo = lambda e: celula(f'{e} · ' + ('Alta' if e >= 15 else 'Média' if e >= 8 else 'Baixa'), 3 if e >= 15 else 2 if e >= 8 else 1)
    maiores = sorted(range(5), key=lambda i: -EX_RISCOS[i][3] * EX_RISCOS[i][4])
    linhas = [[{'t': 'Nº', 'alinh': 'centro'}, 'Risco', {'t': 'Exposição', 'alinh': 'centro'}, 'Resposta', 'Dono']]
    linhas += [[{'t': str(i + 1), 'alinh': 'centro'}, {'t': EX_RISCOS[i][0], 'negrito': False, 'cor': TINTA}, expo(EX_RISCOS[i][3] * EX_RISCOS[i][4]), curta[i], EX_RISCOS[i][6]] for i in maiores]
    tabela(s, xt, Y_TOPO - 0.06, [0.42, 2.1, 1.0, 2.45, DIR - xt - 5.97], linhas, 0.66, 0.36, tam=11, primeira=False, nome='Tabela: principais riscos')
    legenda_exposicao(s, xt, 6.12, (DIR - xt) / 3)

    # 12 · divisória
    d.divisoria('03', 'Como saberemos que deu certo', 'A régua de adoção por área, o status para o comitê e os compromissos dos próximos 90 dias.',
                'Divisória da terceira parte. Daqui em diante a conversa é sobre evidência: onde cada área está na régua de adoção, o status para o comitê e os compromissos dos próximos 90 dias.')

    # 13 · adoção por área
    fr = [[v / sum(c) for v in c] for _, c in EX_ADOCAO]
    s = d.slide('Adoção', 'A adoção ainda trava em [Operações], a área com mais gente e o menor índice',
                'Régua de adoção por área. Clique no gráfico e use "Editar dados" para informar a parcela de pessoas de cada área em cada marca (a soma de cada área é 100%). '
                'Os números vêm da planilha "Mapa de adoção". A última barra é o conjunto das áreas.\n'
                'Índice de adoção = parcela das pessoas em Adota ou Multiplica. Atualize os valores à direita junto com o gráfico.\n'
                'A marca com mais gente em cada área indica a ação prioritária. Posição é momento, não rótulo: use leitura agregada por área, nunca para avaliar pessoas.', dica=EXEMPLO)
    regua_adocao(s, MARGEM, Y_TOPO, UTIL, H_UTIL, [a for a, _ in EX_ADOCAO], fr, pessoas=[sum(c) for _, c in EX_ADOCAO])

    # 14 · status
    s = d.slide('Status para o comitê', 'A adoção está em [27%], [abaixo] do esperado para esta fase',
                'Slide para o comitê. Mostre uso real, não só atividades entregues.\n'
                'Em cada cartão: valor atual, meta da fase com o atingimento (valor ÷ meta) e situação. Situação: na meta (100% ou mais), em atenção (85% a 99%) e crítico (abaixo de 85%). '
                'A etiqueta fica mais escura quanto mais atenção o indicador pede; troque o texto e o preenchimento juntos.\n'
                'A barra na base do cartão mostra o atingimento: ajuste a largura da parte azul. Feche com as decisões que o comitê precisa tomar hoje.', dica=EXEMPLO)
    cartoes = [('Índice de adoção', 27, 35, '%'), ('Uso efetivo', 52, 50, '%'), ('Proficiência', 31, 35, '%'), ('Índice de prontidão', 66, 75, '%')]
    for (x, w), (nome, v, meta, un) in zip(faixas(4), cartoes):
        sit, at = situacao(v, meta)
        cartao_indicador(s, x, Y_TOPO, w, 1.85, nome, fmt_ind(v, un), fmt_ind(meta, un) + ' nesta fase', sit, None, at)
    colunas = [('O que avançou', ['[Conquista desde o último comitê]', '[Conquista desde o último comitê]']), ('O que travou', ['[Onde a adoção parou]', '[Causa provável]']),
               ('Decisões que precisamos', ['[O que o comitê precisa decidir hoje]', '[Quem decide e até quando]'])]
    for (x, w), (t, itens) in zip(faixas(3), colunas):
        bloco(s, x, 4.4, w, 2.0, None, t, [P(i, cor=CZ, marcador='–', entre=5) for i in itens], tam_tit=17)

    # 15 · próximos passos
    s = d.slide('Próximos passos', 'Os próximos 90 dias têm entregas, donos e datas definidos',
                'Feche a apresentação com compromissos. Em cada horizonte: o foco, três entregas com dono e data, e o marco de adoção esperado.\n'
                'As tabelas são nativas: para incluir uma entrega, clique na última linha e use Inserir linha abaixo.\n'
                'Volte a este slide na abertura da próxima reunião.')
    horizontes(s, [('30', 'dias', '[Preparar gestores e usuários-chave]', '[xx% das pessoas em Adota ou Multiplica]'),
                   ('60', 'dias', '[Sustentar o uso depois do go-live]', '[xx% das pessoas em Adota ou Multiplica]'),
                   ('90', 'dias', '[Transferir para a operação]', '[xx% das pessoas em Adota ou Multiplica]')])

    return d.salvar('kit-de-gestao-da-mudanca.pptx', pasta)


if __name__ == '__main__':
    kit()
