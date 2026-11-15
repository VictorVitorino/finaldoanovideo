"""Gera os modelos em Excel do Laboratório (blog/assets/modelos/*.xlsx), na identidade do blog.

Uso: python3 blog/_src/modelos_xlsx.py

Cada planilha tem uma função (raci, influencia, adocao, diagnostico, riscos,
treinamentos, adkar, impactos, indicadores). O estilo e os componentes comuns
ficam em modelos_xlsx_estilo.py.

A geração é feita em duas passadas quando o LibreOffice está instalado: a
primeira grava as fórmulas, o LibreOffice calcula e a segunda grava de novo
com os resultados guardados em cada célula. Assim a planilha aparece completa
também onde nada é recalculado ao abrir (modo protegido do Excel, visualização
rápida, leitores de celular). Sem o LibreOffice, a planilha sai sem resultados
guardados e é calculada ao abrir.

Opções para conferência:
  --saida PASTA    grava em outra pasta
  --so NOMES       gera só as funções indicadas (separadas por vírgula)
  --sem-exemplo    gera sem os dados de exemplo (planilha vazia)
  --sem-listas     gera também sem os itens das listas editáveis
  --sem-cache      pula a segunda passada
"""
import argparse
import datetime
import os
import shutil
import subprocess
import sys
import tempfile
import warnings

sys.dont_write_bytecode = True      # não deixa __pycache__ no repositório
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelos_xlsx_estilo import (  # noqa: E402
    AZ, AZC, AZP, AZS, BR, CZ, LIN, TINTA, F_EIXO, F_ROTULO, GRADE, NOTA_1A5, REGUA, REGUA_TEXTO,
    SEM_SERIFA, SERIFA, T_CAB, T_NOTA, T_SECAO, Col, Pasta, aba_listas, como_usar, data,
    eixo_categorias, eixo_oculto, eixo_valores, inteiro, letra, lista, novo_grafico, ref, rotulos,
)

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'modelos')
MARCAS = ['Resiste', 'Observa', 'Experimenta', 'Adota', 'Multiplica']


def _pasta(saida, arquivo, titulo, resumo, valores, exemplo):
    """Cria a pasta. `valores` traz os resultados de todas as planilhas
    ({arquivo: {(aba, célula): valor}}); aqui se separa o que é deste arquivo."""
    meus = valores.get(arquivo, {}) if valores is not None else None
    return Pasta(os.path.join(saida or SAIDA, arquivo), titulo, resumo, meus, exemplo)


def _cab(aba, lin, itens, alt=28):
    """Cabeçalho de tabela do painel: itens = [(c1, c2, título, alinhamento)]."""
    aba.altura(lin, alt)
    for c1, c2, titulo, alinha in itens:
        aba.mescla(lin, c1, lin, c2, titulo, **aba.e_cab(alinha))


# ====================================================================== RACI
def raci(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'matriz-raci.xlsx', 'Matriz RACI da mudança',
               'Papéis e responsabilidades em cada entrega da gestão da mudança', valores, exemplo)
    como_usar(
        p, 'Papéis e responsabilidades', 'Matriz RACI da mudança',
        'Deixa claro quem faz, quem responde, quem opina e quem só precisa saber, em cada entrega da gestão da mudança.',
        [('Liste as atividades', 'Na aba Matriz RACI, escreva uma entrega por linha e troque os nomes dos papéis no cabeçalho pelos do seu projeto.'),
         ('Marque cada cruzamento', 'Escolha R, A, C ou I na lista suspensa. Use A/R quando a mesma pessoa aprova e executa.'),
         ('Confira a regra de ouro', 'Cada atividade tem um único A. A coluna Conferência avisa quando falta ou sobra. No exemplo, a última atividade está sem A de propósito, para mostrar o aviso.'),
         ('Leia a carga no Painel', 'Veja quantas vezes cada papel aparece com cada letra e quais atividades pedem ajuste.')],
        [('Atividade ou entrega', 'O que precisa acontecer. Uma entrega por linha.'),
         ('Papéis (cabeçalho)', 'Os papéis do projeto. Troque os nomes à vontade. Para incluir um papel, insira uma coluna entre dois papéis existentes: as fórmulas acompanham.'),
         ('R, A, C, I ou A/R', 'R = Responsável, executa. A = Aprovador, responde pelo resultado. C = Consultado, opina antes. I = Informado, fica sabendo depois. A/R = aprova e executa.')],
        [('Nº de A', 'Conta quantas células da linha têm A ou A/R. O certo é 1: se ninguém responde, ninguém decide; se dois respondem, ninguém responde.'),
         ('Conferência', 'Nenhum A na linha: "Falta definir o A". Mais de um A: "Mais de um A". Um A e nenhum R ou A/R: "Falta um R". Fora isso: "OK".'),
         ('Carga por papel', 'No Painel: conta quantas vezes cada papel aparece com A, R, C e I na matriz. A/R conta como A e como R. O gráfico mostra a mesma conta.'),
         ('Indicadores do Painel', 'Atividades mapeadas = linhas com atividade. Conferência OK = linhas com "OK". Pedem ajuste = linhas com aviso. Papel com mais R = papel com a maior contagem de R.')],
        niveis=[('A', (AZP, BR), 'Aprovador: responde pelo resultado.'), ('R', (AZ, BR), 'Responsável: executa.'),
                ('C', (AZS, TINTA), 'Consultado: opina antes.'), ('I', (LIN, TINTA), 'Informado: fica sabendo depois.')],
        aviso=('Dica', 'Valide a matriz com as pessoas, não só com o organograma. A RACI que ninguém reconhece não muda comportamento.'),
    )

    # ------------------------------------------------------------ matriz
    m = p.aba('Matriz RACI', 'entrada')
    papeis = ['Patrocinador', 'Líder do projeto', 'Gestão da mudança', 'Gestores diretos', 'RH', 'TI', 'Multiplicadores']
    exemplos = [('Definir a estratégia de mudança', 'A C R C C I I'), ('Mapear stakeholders e impactos', 'I A R C C C I'),
                ('Aprovar as mensagens-chave', 'A R R C I I I'), ('Executar o plano de comunicação', 'C C A R C I R'),
                ('Preparar e entregar a capacitação', 'I C A C R C R'), ('Preparar os gestores diretos', 'C C A R C I I'),
                ('Medir a adoção e reportar', 'I C A/R C I C C'), ('Tratar resistências', 'C C A R C I R'),
                ('Sustentar e transferir para a operação', 'A R C R C C I'), ('Reconhecer e reforçar a adoção', 'C C R R C I R')]
    np_, n = len(papeis), 20
    escolha = lista(['R', 'A', 'C', 'I', 'A/R'], 'Papel na atividade',
                    'R = executa · A = responde pelo resultado · C = é consultado · I = é informado · A/R = aprova e executa.',
                    'Use R, A, C, I ou A/R.')
    pa, pz = '{p1}{r}', '{p%d}{r}' % np_
    cols = [Col('ativ', 'Atividade ou entrega', 40)]
    cols += [Col(f'p{j + 1}', nome, 13.5, alinha='center', valida=escolha, estilo=dict(negrito=True)) for j, nome in enumerate(papeis)]
    cols += [
        Col('na', 'Nº de A', 9, 'calc', 'center', '0',
            formula='=IF(AND({ativ}{r}="",COUNTA(%s:%s)=0),"",COUNTIF(%s:%s,"A")+COUNTIF(%s:%s,"A/R"))' % (pa, pz, pa, pz, pa, pz),
            nota='Quantas células da linha têm A ou A/R. O certo é 1.'),
        Col('conf', 'Conferência', 25, 'calc',
            formula='=IF({na}{r}="","",IF({na}{r}=0,"Falta definir o A",IF({na}{r}>1,"Mais de um A",'
                    'IF(COUNTIF(%s:%s,"R")+COUNTIF(%s:%s,"A/R")=0,"Falta um R","OK"))))' % (pa, pz, pa, pz),
            nota='Nenhum A: Falta definir o A. Mais de um A: Mais de um A. Um A e nenhum R ou A/R: Falta um R. Fora isso: OK.'),
        Col('m', '', 2, 'vazio'),
        Col('ordem', 'Ordem do ajuste', 8, 'apoio',
            formula='=IF(OR({conf}{r}="",{conf}{r}="OK"),"",COUNTIF({conf}${r0}:{conf}{r},"Falta*")+COUNTIF({conf}${r0}:{conf}{r},"Mais*"))'),
    ]
    ult = m.prepara(cols)
    lin = m.faixa('Papéis e responsabilidades', 'Matriz RACI da mudança',
                  'R = Responsável (executa) · A = Aprovador (responde pelo resultado, um por atividade) · C = Consultado · I = Informado', ult)
    m.legenda(lin, 'Escolha a letra em cada cruzamento. Cada atividade tem um único A: a coluna Conferência avisa quando falta ou sobra.', (4, 10),
              [(2, 2, 'Preencher', 'entrada'), (3, 3, 'Calculado', 'calc')], rotulo=1)
    m.altura(lin + 1, 6)
    dados = [(a,) + tuple(l.split()) for a, l in exemplos]
    t = m.tabela(lin + 2, 1, cols, n, dados, alt_cab=34, alt=25)
    c1, c2 = t.col['p1'], t.col[f'p{np_}']
    m.condicional(t.lin0, c1, t.linN, c2, [('A', AZP, BR), ('A/R', AZP, BR), ('R', AZ, BR), ('C', AZS, TINTA), ('I', LIN, TINTA)])
    m.condicional_formula(t.lin0, t.col['conf'], t.linN, t.col['conf'],
                          f'=AND({t.L["conf"]}{t.r0}<>"",{t.L["conf"]}{t.r0}<>"OK")', fundo=AZP, cor=BR, negrito=True)

    fim = m.rodape(t.linN + 2, ult)
    m.imprime(fim, ult, repete=t.lin_cab)
    m.abre_em(congela=(t.lin0, 2), celula=(t.lin0, 1))

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Painel da matriz RACI', 'Qualidade da matriz e carga por papel. Atualiza sozinho a partir da aba Matriz RACI.', ultp)
    d.altura(lin, 14)
    M = m.prefixo
    f_ativ, f_conf, f_ordem = t.faixa('ativ'), t.faixa('conf'), t.faixa('ordem')
    topo = lin + 5                                   # gráfico e lista de ajustes
    tc = topo + 14                                   # cabeçalho da tabela "Carga por papel"
    LETRAS = [('A', 'Aprovador (A)', 'responde pelo resultado', AZP, BR), ('R', 'Responsável (R)', 'executa', AZ, BR),
              ('C', 'Consultado (C)', 'opina antes', AZS, TINTA), ('I', 'Informado (I)', 'fica sabendo depois', LIN, TINTA)]
    carga = {letra_: tc + 1 + k for k, (letra_, *_r) in enumerate(LETRAS)}     # linha de cada letra na tabela
    pc1, pc2 = 3, 2 + np_                            # colunas dos papéis na tabela do painel
    cab_papeis = f'${letra(pc1)}${tc + 1}:${letra(pc2)}${tc + 1}'
    linha_r = f'${letra(pc1)}${carga["R"] + 1}:${letra(pc2)}${carga["R"] + 1}'
    n_ativ = f'COUNTA({f_ativ})'
    n_ok = f'COUNTIF({f_conf},"OK")'
    n_aj = f'(COUNTIF({f_conf},"Falta*")+COUNTIF({f_conf},"Mais*"))'
    lin = d.cartoes(lin + 1, [
        ('Atividades mapeadas', f'={n_ativ}', 'linhas preenchidas na matriz'),
        ('Conferência OK', f'={n_ok}', f'=IF({n_ativ}=0,"sem atividades listadas",ROUND(100*{n_ok}/{n_ativ},0)&"% das atividades")'),
        ('Pedem ajuste', f'={n_aj}', 'sem A, com mais de um A ou sem R'),
        ('Papel com mais R', f'=IF(MAX({linha_r})=0,"–",INDEX({cab_papeis},MATCH(MAX({linha_r}),{linha_r},0)))',
         f'=IF(MAX({linha_r})=0,"nenhum R marcado",MAX({linha_r})&" atividades como Responsável")', dict(texto=True)),
    ])
    d.altura(lin, 16)
    assert lin + 1 == topo
    # lista de ajustes (direita)
    d.secao(topo, 8, 'Atividades que pedem ajuste', 'As oito primeiras, na ordem da matriz.')
    lin = topo + 2
    _cab(d, lin, [(8, 10, 'Atividade', 'left'), (11, 12, 'Conferência', 'left')])
    for k in range(8):
        l = lin + 1 + k
        d.altura(l, 24)
        fa = f'IFERROR(INDEX({f_ativ},MATCH({k + 1},{f_ordem},0)),"")'
        if k == 0:
            fa = f'IF({n_aj}=0,"Nenhum ajuste pendente.",{fa})'
        d.mescla(l, 8, l, 10, '=' + fa, **d.e_linha())
        d.mescla(l, 11, l, 12, f'=IFERROR(INDEX({f_conf},MATCH({k + 1},{f_ordem},0)),"")', **d.e_linha(cor=AZP, negrito=True))
    base = lin + 8
    d.altura(base + 1, 14)
    # tabela "Carga por papel": quantas vezes cada papel aparece com cada letra
    d.secao(base + 2, 1, 'Contagem por papel e letra', 'Quantas vezes cada papel aparece com cada letra na matriz. A/R conta como A e como R.')
    assert base + 4 == tc
    d.altura(tc, 34)
    d.mescla(tc, 1, tc, 2, 'Letra', **d.e_cab())
    for j in range(np_):
        origem = f'{M}{letra(c1 + j)}${t.lin_cab + 1}'
        d.formula(tc, pc1 + j, f'=IF({origem}="","",{origem})', **d.e_cab('right', tam=T_NOTA))
    d.texto(tc, pc2 + 1, 'Total', **d.e_cab('right'))
    d.mescla(tc, pc2 + 2, tc, 12, 'O que a letra quer dizer', **d.e_cab())
    for letra_, nome, quer_dizer, fundo, cor in LETRAS:
        l = carga[letra_]
        d.altura(l, 25)
        d.mescla(l, 1, l, 2, nome, fundo=fundo, cor=cor, negrito=True, recuo=1, borda=BR)
        for j in range(np_):
            fxm = f'{M}{letra(c1 + j)}${t.r0}:{letra(c1 + j)}${t.rn}'
            f = f'=COUNTIF({fxm},"{letra_}")' + (f'+COUNTIF({fxm},"A/R")' if letra_ in 'RA' else '')
            d.formula(l, pc1 + j, f, **d.e_linha('right', '0'))
        d.formula(l, pc2 + 1, f'=SUM({ref(l, pc1)}:{ref(l, pc2)})', **d.e_linha('right', '0', negrito=True, cor=AZP))
        d.mescla(l, pc2 + 2, l, 12, quer_dizer, **d.e_linha(cor=CZ, tam=T_CAB))
    lp = tc + 5
    d.altura(lp, 25)
    d.mescla(lp, 1, lp, 2, 'Atividades em que aparece', negrito=True, cor=AZP, recuo=1, acima=AZP, tam=T_CAB)
    for j in range(np_):
        fxm = f'{M}{letra(c1 + j)}${t.r0}:{letra(c1 + j)}${t.rn}'
        d.formula(lp, pc1 + j, f'=COUNTA({fxm})', negrito=True, cor=AZP, alinha='right', num='0"   "', acima=AZP)
    d.texto(lp, pc2 + 1, None, acima=AZP)
    d.mescla(lp, pc2 + 2, lp, 12, 'papel sem letra pode sair', cor=CZ, tam=T_CAB, recuo=1, acima=AZP)
    # gráfico de carga (esquerda), a partir da tabela
    ch = novo_grafico(p, 'bar', 'Carga por papel', 'stacked', legenda='top')
    for letra_, nome, _, cor, cor_rot in LETRAS:
        l = carga[letra_]
        ch.add_series({'name': [d.nome, l, 1], 'categories': [d.nome, tc, pc1, tc, pc2],
                       'values': [d.nome, l, pc1, l, pc2], 'fill': {'color': cor}, 'border': {'color': BR, 'width': 0.75},
                       'gap': 42, 'overlap': 100, 'data_labels': rotulos(cor_rot)})
    ch.set_y_axis(eixo_categorias(inverte=True))
    ch.set_x_axis(eixo_oculto())
    d.grafico(ch, topo, 1, base, 6, 'Barras empilhadas com o número de A, R, C e I de cada papel.')
    d.altura(lp + 1, 12)
    lin = d.tira(lp + 2, 'Como ler', [
        'Muitos R no mesmo papel indicam sobrecarga: redistribua ou reforce a equipe.',
        'Muitos C tornam a decisão lenta: veja se parte deles pode virar I.',
        'Se ninguém responde, ninguém decide. Se dois respondem, ninguém responde.'])
    fim = d.rodape(lin + 1, ultp)
    d.imprime(fim, ultp, uma_pagina=True)
    d.abre_em()
    p.salvar()


# ====================================================================== influência
def influencia(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'mapa-de-influencia.xlsx', 'Mapa de influência de stakeholders',
               'Influência e apoio de cada stakeholder, com estratégia sugerida', valores, exemplo)
    # (estratégia, posição no mapa, fundo, cor do texto, o que fazer)
    QUAD = [
        ('Conquistar: prioridade', 'Influência alta · apoio baixo', AZP, BR,
         'Entenda o que a pessoa perde, envolva o patrocinador e ajuste o que for possível. É aqui que a mudança costuma travar.'),
        ('Mobilizar como aliado', 'Influência alta · apoio alto', AZ, BR,
         'Dê papel visível: porta-voz, coalizão de patrocínio, exemplo para os pares.'),
        ('Ouvir e acompanhar', 'Influência baixa · apoio baixo', LIN, TINTA,
         'Escute o motivo: resistência costuma ser informação sobre o desenho da mudança.'),
        ('Envolver como rede', 'Influência baixa · apoio alto', AZS, TINTA,
         'São bons multiplicadores e trazem o que não está funcionando.'),
    ]
    como_usar(
        p, 'Stakeholders', 'Mapa de influência de stakeholders',
        'Ajuda a decidir onde investir tempo de engajamento. Nem todo stakeholder pede o mesmo esforço.',
        [('Liste pessoas ou grupos', 'Na aba Stakeholders, uma linha para cada pessoa ou grupo que pode acelerar ou travar a mudança.'),
         ('Dê as duas notas', 'Influência sobre o resultado da mudança e apoio atual, de 1 a 5. No apoio, 1 = resiste, 3 = neutro e 5 = apoia ativamente.'),
         ('Registre a ação', 'Escreva o que a pessoa perde ou ganha, a próxima ação e quem responde por ela. A estratégia sugerida orienta o tom.'),
         ('Acompanhe no Painel', 'O mapa mostra todos de uma vez e lista quem está em cada quadrante. Atualize a cada fase do projeto.')],
        [('Stakeholder e área ou papel', 'Pessoa ou grupo e onde atua.'),
         ('Influência (1 a 5)', 'Peso sobre o resultado da mudança. 1 = quase não pesa. 5 = decide.'),
         ('Apoio (1 a 5)', 'Posição hoje. 1 = resiste. 3 = neutro. 5 = apoia ativamente.'),
         ('O que perde ou ganha', 'O interesse em jogo: o que a mudança tira ou traz para essa pessoa ou grupo.'),
         ('Próxima ação e responsável', 'O próximo passo concreto de engajamento e quem responde por ele.')],
        [('Estratégia sugerida', 'Nota 3 ou mais conta como alta. Influência alta e apoio baixo: Conquistar: prioridade. Influência alta e apoio alto: Mobilizar como aliado. '
                                 'Influência baixa e apoio alto: Envolver como rede. Influência baixa e apoio baixo: Ouvir e acompanhar.'),
         ('Indicadores do Painel', 'Contagem de stakeholders em cada estratégia e média simples das notas de apoio.'),
         ('Posição no mapa', 'Apoio no eixo horizontal e influência no vertical. Quem tem as mesmas notas aparece empilhado, com um pequeno afastamento, para os nomes não se sobreporem.')],
        niveis=[(q[0], (q[2], q[3]), q[1] + '.') for q in QUAD],
        aviso=('Cuidado', 'O mapa é retrato do momento e material sensível. Atualize a cada fase do projeto e restrinja o acesso.'),
    )

    # ------------------------------------------------------------ stakeholders
    s = p.aba('Stakeholders', 'entrada')
    n = 30
    cols = [
        Col('nome', 'Stakeholder', 27),
        Col('area', 'Área ou papel', 19),
        Col('inf', 'Influência\n(1 a 5)', 11, alinha='center', num='0',
            valida=inteiro(1, 5, 'Influência', '1 = quase não pesa no resultado. 5 = decide o resultado da mudança.', NOTA_1A5)),
        Col('apo', 'Apoio\n(1 a 5)', 11, alinha='center', num='0',
            valida=inteiro(1, 5, 'Apoio à mudança', '1 = resiste. 3 = neutro. 5 = apoia ativamente.', NOTA_1A5)),
        Col('est', 'Estratégia sugerida', 24, 'calc', estilo=dict(cor=TINTA),
            formula='=IF(OR({inf}{r}="",{apo}{r}=""),"",IF({inf}{r}>=3,IF({apo}{r}>=3,"Mobilizar como aliado","Conquistar: prioridade"),'
                    'IF({apo}{r}>=3,"Envolver como rede","Ouvir e acompanhar")))',
            nota='Nota 3 ou mais conta como alta. Influência alta e apoio baixo: Conquistar. Alta e alto: Mobilizar. Baixa e alto: Envolver. Baixa e baixo: Ouvir.'),
        Col('perde', 'O que perde ou ganha', 35),
        Col('acao', 'Próxima ação', 35),
        Col('resp', 'Responsável', 18),
        Col('m', '', 2, 'vazio'),
        Col('chave', 'Chave do quadrante', 12, 'apoio', formula='=IF({est}{r}="","",{est}{r}&"|"&COUNTIF({est}${r0}:{est}{r},{est}{r}))'),
    ]
    ult = s.prepara(cols)
    lin = s.faixa('Stakeholders', 'Mapa de influência de stakeholders',
                  'Influência e apoio de 1 a 5. A estratégia é sugerida pela posição de cada pessoa ou grupo no mapa.', ult)
    s.legenda(lin, 'Nota 3 ou mais conta como alta, nos dois eixos. Influência alta com apoio baixo é a prioridade.', (5, 8),
              [(3, 3, 'Preencher', 'entrada'), (4, 4, 'Calculado', 'calc')], rotulo=2)
    s.altura(lin + 1, 6)
    dados = [
        ('Patrocinador executivo', 'Diretoria', 5, 5, 'Ganha: resultado do projeto ligado à sua agenda.', 'Abrir o kickoff e aparecer nos marcos.', 'Líder do projeto'),
        ('Diretor de operações', 'Operações', 5, 2, 'Perde: autonomia sobre o processo atual.', 'Conversa individual com o patrocinador para ouvir as objeções.', 'Patrocinador'),
        ('Gerente de TI', 'Tecnologia', 4, 3, 'Ganha: menos sistemas paralelos. Perde: folga da equipe na virada.', 'Combinar o plano de suporte do go-live.', 'Líder do projeto'),
        ('Gestores de linha', 'Operações', 3, 2, 'Perdem: tempo da equipe durante a transição.', 'Preparar antes das equipes, com roteiro de conversa.', 'Gestão da mudança'),
        ('Usuários-chave', 'Áreas de negócio', 2, 4, 'Ganham: visibilidade e novas competências.', 'Convidar para a rede de multiplicadores.', 'Gestão da mudança'),
        ('Equipe de atendimento', 'Atendimento', 1, 2, 'Perde: rotina conhecida.', 'Roda de escuta com o gestor direto.', 'Gestor direto'),
    ]
    t = s.tabela(lin + 2, 1, cols, n, dados, alt_cab=36, alt=27)
    s.condicional(t.lin0, t.col['est'], t.linN, t.col['est'], [(q[0], q[2], q[3]) for q in QUAD])
    fim = s.rodape(t.linN + 2, ult)
    s.imprime(fim, ult, repete=t.lin_cab)
    s.abre_em(congela=(t.lin0, 2), celula=(t.lin0, 1))

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Mapa de influência e apoio', 'Onde investir o tempo de engajamento. Atualiza sozinho a partir da aba Stakeholders.', ultp)
    d.altura(lin, 14)
    f_est, f_nome, f_chave, f_apo = t.faixa('est'), t.faixa('nome'), t.faixa('chave'), t.faixa('apo')
    lin = d.cartoes(lin + 1, [
        ('Stakeholders mapeados', f'=COUNTIF({f_est},"?*")', 'com influência e apoio avaliados'),
        ('A conquistar', f'=COUNTIF({f_est},"{QUAD[0][0]}")', 'muita influência e pouco apoio'),
        ('Aliados a mobilizar', f'=COUNTIF({f_est},"{QUAD[1][0]}")', 'muita influência e apoio'),
        ('Apoio médio', f'=IFERROR(AVERAGE({f_apo}),"–")', 'média das notas, de 1 a 5', dict(num='0.0')),
    ])
    d.altura(lin, 16)
    topo = lin + 1
    # quadrantes com os nomes (direita), na mesma posição em que aparecem no mapa
    d.secao(topo, 7, 'Quem está em cada quadrante', 'Até cinco nomes por quadrante, na ordem da lista.')
    por_quad = 5
    for q, (est, onde, fundo, cor, _) in enumerate(QUAD):
        l0 = topo + 2 + (q // 2) * (por_quad + 3)
        c0 = 7 + (q % 2) * 3
        d.altura(l0, 26)
        d.mescla(l0, c0, l0, c0 + 1, est, fundo=fundo, cor=cor, negrito=True, tam=T_CAB, recuo=1, borda=BR)
        d.formula(l0, c0 + 2, f'=COUNTIF({f_est},"{est}")', fundo=fundo, cor=cor, negrito=True, alinha='right', recuo=1, num='0', borda=BR)
        d.altura(l0 + 1, 18)
        d.mescla(l0 + 1, c0, l0 + 1, c0 + 2, onde, cor=CZ, tam=T_NOTA, recuo=1)
        for k in range(por_quad):
            l = l0 + 2 + k
            d.altura(l, 21)
            f = f'IFERROR(INDEX({f_nome},MATCH("{est}|{k + 1}",{f_chave},0)),"")'
            if k == por_quad - 1:
                cont = f'COUNTIF({f_est},"{est}")'
                f = f'IF({cont}>{por_quad},"e mais "&({cont}-{por_quad - 1})&" na lista",{f})'
            d.mescla(l, c0, l, c0 + 2, '=' + f, **d.e_linha(tam=T_CAB))
        if q < 2:
            d.altura(l0 + 2 + por_quad, 10)
    base = topo + 1 + 2 * (por_quad + 3) - 1
    # dados de apoio do gráfico, nas células que ficam atrás dele
    S = s.prefixo
    I_, A_ = t.L['inf'], t.L['apo']
    ch = novo_grafico(p, 'scatter', 'Influência e apoio à mudança')
    ponto = {'type': 'circle', 'size': 8, 'fill': {'color': AZ}, 'border': {'color': BR, 'width': 0.75}}
    for i in range(n):
        r = t.r0 + i
        l, cx = topo + (i % 15), 2 + 2 * (i // 15)
        d.formula(l, cx, f'=IF({S}{t.L["est"]}{r}="",-1,{S}{A_}{r})', cor=CZ, tam=T_NOTA)
        d.formula(l, cx + 1, f'=IF({S}{t.L["est"]}{r}="",-1,{S}{I_}{r}+0.22*((COUNTIFS({S}${I_}${t.r0}:${I_}${t.rn},{S}{I_}{r},{S}${A_}${t.r0}:${A_}${t.rn},{S}{A_}{r})+1)/2'
                            f'-COUNTIFS({S}${I_}${t.r0}:{I_}{r},{S}{I_}{r},{S}${A_}${t.r0}:{A_}{r},{S}{A_}{r})))', cor=CZ, tam=T_NOTA)
        ch.add_series({'name': [s.nome, t.lin0 + i, t.col['nome']], 'categories': [d.nome, l, cx, l, cx],
                       'values': [d.nome, l, cx + 1, l, cx + 1], 'marker': ponto,
                       'data_labels': {'series_name': True, 'position': 'right', 'font': F_ROTULO}})
    # linhas que separam os quadrantes (entre as notas 2 e 3)
    for k, (xs, ys) in enumerate([((2.5, 2.5), (0, 6)), ((0, 6), (2.5, 2.5))]):
        l = topo + 15 + k
        for j in range(2):
            d.texto(l, 2 + j, xs[j], cor=CZ, tam=T_NOTA)
            d.texto(l, 4 + j, ys[j], cor=CZ, tam=T_NOTA)
        ch.add_series({'name': 'Divisa', 'categories': [d.nome, l, 2, l, 3], 'values': [d.nome, l, 4, l, 5],
                       'line': {'color': AZS, 'width': 1, 'dash_type': 'dash'}, 'marker': {'type': 'none'}})
    eixo = {'num_font': F_EIXO, 'name_font': dict(F_EIXO, bold=False), 'line': {'color': LIN, 'width': 0.75},
            'major_gridlines': GRADE, 'min': 0, 'max': 6, 'major_unit': 1, 'major_tick_mark': 'none',
            'minor_tick_mark': 'none', 'num_format': '[=0]"";[=6]"";0'}
    ch.set_x_axis(dict(eixo, name='Apoio à mudança (1 = resiste · 5 = apoia)'))
    ch.set_y_axis(dict(eixo, name='Influência'))
    ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}, 'layout': {'x': 0.09, 'y': 0.12, 'width': 0.72, 'height': 0.73}})
    d.grafico(ch, topo, 1, base, 6, 'Dispersão com o apoio no eixo horizontal e a influência no vertical, um ponto por stakeholder.')
    d.altura(base + 1, 14)
    lin = d.tira(base + 2, 'O que fazer em cada quadrante', [(q[0], q[4]) for q in QUAD])
    fim = d.rodape(lin + 1, ultp)
    d.imprime(fim, ultp, uma_pagina=True)
    d.abre_em()
    p.salvar()


# ====================================================================== adoção
REGUA_INFO = [
    ('Resiste', 'Ainda não vê motivo para mudar.', 'Escuta: ouvir o motivo e ajustar a mensagem.'),
    ('Observa', 'Espera para ver funcionar.', 'Exemplo: mostrar funcionando, com gente parecida.'),
    ('Experimenta', 'Testa, com apoio.', 'Prática: tempo protegido e apoio por perto.'),
    ('Adota', 'Usa na rotina.', 'Reforço: reconhecer e tirar atritos da rotina.'),
    ('Multiplica', 'Ensina os colegas.', 'Palco: dar voz e formar a rede.'),
]
FICHAS_REGUA = [(nome, (REGUA[i], REGUA_TEXTO[i]), sinal) for i, (nome, sinal, _) in enumerate(REGUA_INFO)]


def adocao(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'matriz-de-adocao.xlsx', 'Matriz de adoção',
               'Pessoas de cada área na régua de adoção, com índice e ação por marca', valores, exemplo)
    como_usar(
        p, 'Adoção', 'Matriz de adoção',
        'Mostra onde cada área está na régua de adoção e aponta a ação que mais ajuda cada grupo.',
        [('Liste as áreas', 'Na aba Matriz de adoção, uma linha por área ou grupo impactado.'),
         ('Conte as pessoas em cada marca', 'Informe quantas pessoas da área estão em Resiste, Observa, Experimenta, Adota e Multiplica. Fontes: pesquisa curta, conversa com os gestores e dados de uso.'),
         ('Leia o índice e a marca predominante', 'A marca com mais gente indica a ação prioritária da área. Posição é momento, não rótulo: pessoas avançam, travam e recuam.'),
         ('Acompanhe a cada onda', 'Atualize antes e depois do go-live e compare os retratos no Painel.')],
        [('Área', 'Área ou grupo impactado pela mudança. Uma linha para cada.'),
         ('Resiste a Multiplica', 'Número de pessoas da área em cada marca da régua, hoje.'),
         ('A régua de adoção', 'No fim da aba. Os textos de sinal e de ação podem ser editados: a coluna "Ação que mais ajuda" acompanha.')],
        [('Pessoas', 'Soma das cinco marcas da linha.'),
         ('Índice de adoção', '(Adota + Multiplica) ÷ Pessoas. É a parcela da área que já usa a mudança na rotina ou ensina os colegas. Na linha Total, a mesma conta com a soma de todas as áreas.'),
         ('Marca predominante', 'A marca com o maior número de pessoas na linha. Em caso de empate, vale a primeira da régua.'),
         ('Ação que mais ajuda', 'A ação da régua de adoção para a marca predominante.'),
         ('Destaque das células', 'Marca com 50% ou mais das pessoas da área em azul vivo; de 30% a 49%, em azul suave.')],
        niveis=FICHAS_REGUA,
        aviso=('Cuidado', 'Use leitura agregada por área. O mapa serve para decidir onde investir energia, não para avaliar pessoas.'),
    )

    # ------------------------------------------------------------ matriz
    m = p.aba('Matriz de adoção', 'entrada')
    n = 12
    pessoas = inteiro(0, None, 'Pessoas nesta marca', 'Quantas pessoas da área estão nesta marca da régua hoje. Use números inteiros.')
    lin_cab = 6
    lin_regua = lin_cab + n + 5           # cabeçalho da tabela "A régua de adoção" (base zero)
    cols = [Col('area', 'Área', 24)]
    cols += [Col(f'n{k + 1}', nome, 12, alinha='right', num='0', valida=pessoas) for k, nome in enumerate(MARCAS)]
    cols += [
        Col('pes', 'Pessoas', 10, 'calc', 'right', '0', formula='=IF(COUNT({n1}{r}:{n5}{r})=0,"",SUM({n1}{r}:{n5}{r}))',
            nota='Soma das cinco marcas da linha.'),
        Col('ind', 'Índice de\nadoção', 11, 'calc', 'right', '0%', estilo=dict(cor=AZP, negrito=True),
            formula='=IF(OR({pes}{r}="",{pes}{r}=0),"",({n4}{r}+{n5}{r})/{pes}{r})',
            nota='(Adota + Multiplica) ÷ Pessoas.'),
        Col('marca', 'Marca predominante', 16, 'calc', estilo=dict(cor=TINTA),
            formula='=IF(OR({pes}{r}="",{pes}{r}=0),"",INDEX(${n1}${rc}:${n5}${rc},MATCH(MAX({n1}{r}:{n5}{r}),{n1}{r}:{n5}{r},0)))',
            nota='A marca com mais pessoas na linha. No empate, vale a primeira da régua.'),
        Col('acao', 'Ação que mais ajuda', 42, 'calc',
            formula='=IF({marca}{r}="","",IFERROR(INDEX($%s$%d:$%s$%d,MATCH({marca}{r},$B$%d:$B$%d,0)),""))'
                    % ('H', lin_regua + 2, 'H', lin_regua + 6, lin_regua + 2, lin_regua + 6),
            nota='A ação da régua de adoção (no fim da aba) para a marca predominante.'),
        Col('m', '', 2, 'vazio'),
    ]
    ult = m.prepara(cols)
    lin = m.faixa('Adoção', 'Matriz de adoção',
                  'Quantas pessoas de cada área estão hoje em cada marca da régua. Leitura agregada: retrato do momento, não avaliação de desempenho.', ult)
    m.legenda(lin, 'Índice de adoção = (Adota + Multiplica) ÷ Pessoas. A marca com mais pessoas indica a ação que mais ajuda.', (4, 10),
              [(2, 2, 'Preencher', 'entrada'), (3, 3, 'Calculado', 'calc')], rotulo=1)
    dados = [('Financeiro', 2, 5, 6, 4, 1), ('Operações', 9, 14, 10, 7, 2), ('Comercial', 3, 6, 8, 6, 2),
             ('Suprimentos', 2, 4, 3, 2, 1), ('TI', 1, 2, 2, 2, 1), ('RH', 0, 2, 2, 1, 1)]
    t = m.tabela(lin_cab, 1, cols, n, dados, alt_cab=34, alt=25)
    assert lin + 2 == lin_cab
    # fio com as cores da régua, logo acima dos nomes das marcas
    m.altura(lin_cab - 1, 6)
    for k in range(5):
        m.texto(lin_cab - 1, t.col['n1'] + k, None, fundo=REGUA[k], dir=BR, esq=BR)
    n1, n5 = t.L['n1'], t.L['n5']
    # destaque: onde está a maior parte das pessoas de cada área
    for limite, fundo, cor in ((0.5, AZ, BR), (0.3, AZS, TINTA)):
        m.condicional_formula(t.lin0, t.col['n1'], t.linN, t.col['n5'],
                              f'=AND(ISNUMBER({n1}{t.r0}),ISNUMBER(${t.L["pes"]}{t.r0}),{n1}{t.r0}/${t.L["pes"]}{t.r0}>={limite})',
                              fundo=fundo, cor=cor, negrito=True)
    m.condicional(t.lin0, t.col['marca'], t.linN + 1, t.col['marca'], [(nome, REGUA[k], REGUA_TEXTO[k]) for k, nome in enumerate(MARCAS)])
    # linha de total
    lt = t.linN + 1
    rt = lt + 1
    m.altura(lt, 27)
    m.texto(lt, 1, 'Total', **m.e_calc(cor=TINTA, negrito=True, acima=AZP))
    for k in range(5):
        c = t.col['n1'] + k
        m.formula(lt, c, f'=SUM({letra(c)}{t.r0}:{letra(c)}{t.rn})', **m.e_calc('right', '0', cor=TINTA, negrito=True, acima=AZP))
    P, I_, MA = t.L['pes'], t.L['ind'], t.L['marca']
    m.formula(lt, t.col['pes'], f'=SUM({P}{t.r0}:{P}{t.rn})', **m.e_calc('right', '0', cor=TINTA, negrito=True, acima=AZP))
    m.formula(lt, t.col['ind'], f'=IF({P}{rt}=0,"",({t.L["n4"]}{rt}+{n5}{rt})/{P}{rt})', fundo=AZP, cor=BR, negrito=True, alinha='right', recuo=1, num='0%', borda=BR)
    m.formula(lt, t.col['marca'], f'=IF({P}{rt}=0,"",INDEX(${n1}${t.lin_cab + 1}:${n5}${t.lin_cab + 1},MATCH(MAX({n1}{rt}:{n5}{rt}),{n1}{rt}:{n5}{rt},0)))',
              **m.e_calc(cor=TINTA, negrito=True, acima=AZP))
    m.formula(lt, t.col['acao'], f'=IF({MA}{rt}="","",IFERROR(INDEX($H${lin_regua + 2}:$H${lin_regua + 6},MATCH({MA}{rt},$B${lin_regua + 2}:$B${lin_regua + 6},0)),""))',
              **m.e_calc(acima=AZP))
    # a régua de adoção: sinal e ação de cada marca (fonte da coluna "Ação que mais ajuda")
    m.secao(lt + 2, 1, 'A régua de adoção', 'O sinal de cada marca e a ação que mais ajuda. Os textos podem ser editados.')
    assert lt + 4 == lin_regua
    m.altura(lin_regua, 28)
    m.texto(lin_regua, 1, 'Marca', **m.e_cab())
    m.mescla(lin_regua, 2, lin_regua, 6, 'Sinal', **m.e_cab())
    m.mescla(lin_regua, 7, lin_regua, 10, 'Ação que mais ajuda', **m.e_cab())
    for k, (nome, sinal, acao) in enumerate(REGUA_INFO):
        l = lin_regua + 1 + k
        m.altura(l, 24)
        m.formula(l, 1, f'=IF({ref(t.lin_cab, t.col["n1"] + k)}="","",{ref(t.lin_cab, t.col["n1"] + k)})',
                  fundo=REGUA[k], cor=REGUA_TEXTO[k], negrito=True, recuo=1, borda=BR)
        m.mescla(l, 2, l, 6, sinal, **m.e_entrada())
        m.mescla(l, 7, l, 10, acao, **m.e_entrada())
    fim = m.rodape(lin_regua + 7, ult)
    m.imprime(fim, ult, uma_pagina=True)
    m.abre_em(congela=(t.lin0, 2), celula=(t.lin0, 1))

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Painel de adoção', 'Onde cada área está na régua. Atualiza sozinho a partir da aba Matriz de adoção.', ultp)
    d.altura(lin, 14)
    M = m.prefixo
    tot = lambda c: f'{M}${c}${rt}'                       # célula da linha Total
    f_area, f_ind = t.faixa('area'), t.faixa('ind')
    lin = d.cartoes(lin + 1, [
        ('Pessoas mapeadas', f'={tot(P)}', 'soma de todas as áreas'),
        ('Índice de adoção', f'=IF({tot(P)}=0,"–",{tot(I_)})', 'pessoas em Adota ou Multiplica ÷ total', dict(num='0%')),
        ('Em resistência', f'=IF({tot(P)}=0,"–",{tot(n1)}/{tot(P)})', f'=IF({tot(P)}=0,"sem pessoas mapeadas",{tot(n1)}&" pessoas na marca Resiste")', dict(num='0%')),
        ('Área que pede atenção', f'=IF(COUNT({f_ind})=0,"–",IFERROR(INDEX({f_area},MATCH(MIN({f_ind}),{f_ind},0)),"–"))',
         f'=IF(COUNT({f_ind})=0,"sem dados","menor índice de adoção: "&ROUND(100*MIN({f_ind}),0)&"%")', dict(texto=True)),
    ])
    d.altura(lin, 16)
    topo = lin + 1
    # leitura por marca (direita)
    d.secao(topo, 6, 'Leitura por marca', 'Pessoas em cada marca, parcela do total e a ação que mais ajuda.')
    lin = topo + 2
    _cab(d, lin, [(6, 7, 'Marca', 'left'), (8, 8, 'Pessoas', 'right'), (9, 9, '% do total', 'right'), (10, 12, 'Ação que mais ajuda', 'left')])
    for k in range(5):
        l = lin + 1 + k
        c = letra(t.col['n1'] + k)
        d.altura(l, 30)
        d.mescla(l, 6, l, 7, f'={M}${c}${t.lin_cab + 1}', fundo=REGUA[k], cor=REGUA_TEXTO[k], negrito=True, recuo=1, borda=BR)
        d.formula(l, 8, f'={tot(c)}', **d.e_linha('right', '0'))
        d.formula(l, 9, f'=IF({tot(P)}=0,"",{tot(c)}/{tot(P)})', **d.e_linha('right', '0%'))
        d.mescla(l, 10, l, 12, f'=IF({M}$H${lin_regua + 2 + k}="","",{M}$H${lin_regua + 2 + k})', **d.e_linha(tam=T_CAB))
    base = lin + 5
    d.altura(base + 1, 12)
    d.altura(base + 2, 12)
    ch = novo_grafico(p, 'column', 'Pessoas por marca da régua')
    ch.add_series({'name': 'Pessoas', 'categories': [m.nome, t.lin_cab, t.col['n1'], t.lin_cab, t.col['n5']],
                   'values': [m.nome, lt, t.col['n1'], lt, t.col['n5']], 'gap': 55,
                   'points': [{'fill': {'color': cor}} for cor in REGUA], 'data_labels': rotulos(tam=10)})
    ch.set_x_axis(eixo_categorias())
    ch.set_y_axis(eixo_oculto())
    d.grafico(ch, topo, 1, base + 2, 4, 'Colunas com o total de pessoas em cada marca da régua de adoção.')
    # distribuição por área (largura inteira; áreas vazias ficam em branco no fim)
    lin = base + 3
    for i in range(15):
        d.altura(lin + i, 19)
    ch = novo_grafico(p, 'bar', 'Distribuição por área', 'percent_stacked', legenda='top')
    for k, nome in enumerate(MARCAS):
        c = t.col['n1'] + k
        ch.add_series({'name': [m.nome, t.lin_cab, c], 'categories': [m.nome, t.lin0, 1, t.linN, 1],
                       'values': [m.nome, t.lin0, c, t.linN, c], 'fill': {'color': REGUA[k]},
                       'border': {'color': BR, 'width': 0.75}, 'gap': 38, 'overlap': 100, 'data_labels': rotulos(REGUA_TEXTO[k])})
    ch.set_y_axis(eixo_categorias(inverte=True, line={'none': True}))
    ch.set_x_axis(eixo_oculto())
    d.grafico(ch, lin, 1, lin + 14, 12, 'Barras empilhadas em 100% com a distribuição das pessoas de cada área pelas cinco marcas.')
    lin += 15
    d.altura(lin, 10)
    lin = d.tira(lin + 1, 'Como ler', [
        'A marca com mais gente em cada área indica a ação prioritária.',
        'Posição é momento, não rótulo: pessoas avançam, travam e recuam.',
        'Acompanhe o índice a cada onda do projeto, antes e depois do go-live.'])
    fim = d.rodape(lin + 1, ultp)
    d.imprime(fim, ultp, uma_pagina=True)
    d.abre_em()
    p.salvar()


# ====================================================================== listas editáveis
LIN_LISTA = 7          # primeira linha de itens na aba Listas (base zero)


def fx_lista(k, vagas=10):
    """Faixa da k-ésima lista da aba Listas (a aba é criada no fim da pasta)."""
    c = letra(1 + 2 * k)
    return f"'Listas'!${c}${LIN_LISTA + 1}:${c}${LIN_LISTA + vagas}"


def item_lista(k, i):
    """Célula do i-ésimo item da k-ésima lista."""
    return f"'Listas'!${letra(1 + 2 * k)}${LIN_LISTA + 1 + i}"


def _listas(p, sub, listas, notas, vagas=10):
    a, pos = aba_listas(p, 'Listas', sub, listas, notas, vagas)
    assert all(pos[t][0] == LIN_LISTA for t, _ in listas)
    return a


# ====================================================================== diagnóstico
SINAIS = [
    ('Clareza do porquê', 'Entendo por que a mudança existe'),
    ('Fluência digital', 'Tenho facilidade com a nova ferramenta'),
    ('Autonomia', 'Consigo aprender sem depender de alguém'),
    ('Segurança para errar', 'Sinto que posso testar e errar'),
    ('Valor percebido', 'Vejo ganho para o meu trabalho'),
]
LEITURAS = ['Resiste: escuta', 'Observa: exemplo', 'Experimenta: prática', 'Adota: reforço', 'Multiplica: palco']
AREAS = ['Financeiro', 'Operações', 'Comercial', 'Suprimentos', 'TI', 'RH']
F_LEITURA = ('IF({m}<2,"Resiste: escuta",IF({m}<3,"Observa: exemplo",IF({m}<4,"Experimenta: prática",'
             'IF({m}<4.6,"Adota: reforço","Multiplica: palco"))))')


def _cores_de_nota(aba, l1, c1, l2, c2):
    """Notas de 1 a 5 na régua: 1 em cinza, 2 em cinza claro, 4 em azul suave, 5 em azul vivo."""
    for nota, fundo, cor in ((1, CZ, BR), (2, LIN, TINTA), (4, AZS, TINTA), (5, AZ, BR)):
        aba.ws.conditional_format(l1, c1, l2, c2, {'type': 'cell', 'criteria': '==', 'value': nota,
                                                   'format': aba.p.dxf(fundo=fundo, cor=cor, negrito=True)})


def _cores_de_media(aba, l1, c1, l2, c2):
    """Médias na régua, com os mesmos cortes da leitura sugerida."""
    a1 = ref(l1, c1)
    for cond, fundo, cor in ((f'{a1}<2', CZ, BR), (f'{a1}<3', LIN, TINTA), (f'{a1}<4', AZS, TINTA), (f'{a1}<4.6', AZ, BR), (f'{a1}>=4.6', AZP, BR)):
        aba.ws.conditional_format(l1, c1, l2, c2, {'type': 'formula', 'criteria': f'=AND(ISNUMBER({a1}),{cond})',
                                                   'format': aba.p.dxf(fundo=fundo, cor=cor, negrito=True), 'stop_if_true': True})


def diagnostico(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'formulario-de-diagnostico.xlsx', 'Formulário de diagnóstico de prontidão',
               'Cinco sinais de prontidão por pessoa ou grupo, com leitura sugerida da marca de adoção', valores, exemplo)
    como_usar(
        p, 'Diagnóstico', 'Formulário de diagnóstico de prontidão',
        'Lê cinco sinais em cada pessoa ou grupo do projeto e sugere em que marca da régua de adoção ela está hoje.',
        [('Defina quem será ouvido', 'Na aba Formulário, uma linha por pessoa ou grupo. Prefira registrar por grupo. As áreas vêm da aba Listas e podem ser trocadas.'),
         ('Aplique as cinco afirmações', 'Use como roteiro de pesquisa curta ou de conversa com os gestores. Nota de 1 (discordo totalmente) a 5 (concordo totalmente).'),
         ('Leia a média e o sinal mais fraco', 'A média indica uma marca provável e a ação que mais ajuda. O sinal mais fraco mostra por onde começar. Combine com dados de uso.'),
         ('Veja o conjunto no Painel', 'Média por sinal, grupos por marca e mapa de calor por área. A leitura é ponto de partida para conversa, não diagnóstico fechado.')],
        [('Pessoa ou grupo', 'Quem respondeu ou sobre quem é a leitura. Prefira grupos a indivíduos.'),
         ('Área', 'Escolha na lista. Para trocar as opções, edite a aba Listas.'),
         ('Os cinco sinais', 'Clareza do porquê, fluência digital, autonomia para aprender, segurança para errar e valor percebido. Nota de 1 a 5 para cada afirmação. São sinais do momento, ligados ao projeto, não traços de personalidade.')],
        [('Média', 'Média simples das notas preenchidas na linha.'),
         ('Sinal mais fraco', 'O sinal com a menor nota da linha. Em caso de empate, vale o primeiro.'),
         ('Leitura sugerida', 'Média abaixo de 2: Resiste: escuta. De 2 a 2,9: Observa: exemplo. De 3 a 3,9: Experimenta: prática. De 4 a 4,5: Adota: reforço. A partir de 4,6: Multiplica: palco. Ajuste os cortes à sua realidade.'),
         ('Painel', 'Média por sinal = média da coluna. Grupos por marca = contagem das leituras. Mapa de calor = média das notas de cada área em cada sinal, na mesma escala de cores.')],
        niveis=[(LEITURAS[k], (REGUA[k], REGUA_TEXTO[k]), ['Média abaixo de 2.', 'Média de 2 a 2,9.', 'Média de 3 a 3,9.', 'Média de 4 a 4,5.', 'Média a partir de 4,6.'][k]) for k in range(5)],
        aviso=('Cuidado', 'Não é teste psicológico nem avaliação de desempenho. Explique para que serve, guarde com acesso restrito e use leitura agregada.'),
    )

    # ------------------------------------------------------------ formulário
    f = p.aba('Formulário', 'entrada')
    n = 40
    cols = [
        Col('quem', 'Pessoa ou grupo', 26),
        Col('area', 'Área', 14, valida=lista('=' + fx_lista(0), 'Área', 'Escolha a área na lista. Para trocar as opções, edite a aba Listas.',
                                             'Escolha uma área da lista. Para incluir outra, edite a aba Listas.')),
    ]
    cols += [Col(f's{k + 1}', nome, 18, alinha='center', num='0', sub=frase,
                 valida=inteiro(1, 5, nome, f'"{frase}." 1 = discordo totalmente. 5 = concordo totalmente.', NOTA_1A5))
             for k, (nome, frase) in enumerate(SINAIS)]
    cols += [
        Col('media', 'Média', 9, 'calc', 'right', '0.0', estilo=dict(cor=AZP, negrito=True),
            formula='=IF(COUNT({s1}{r}:{s5}{r})=0,"",AVERAGE({s1}{r}:{s5}{r}))', nota='Média simples das notas preenchidas na linha.'),
        Col('fraco', 'Sinal mais fraco', 20, 'calc',
            formula='=IF(COUNT({s1}{r}:{s5}{r})=0,"",INDEX(${s1}${rc}:${s5}${rc},MATCH(MIN({s1}{r}:{s5}{r}),{s1}{r}:{s5}{r},0)))',
            nota='O sinal com a menor nota da linha. No empate, vale o primeiro.'),
        Col('leitura', 'Leitura sugerida', 20, 'calc', estilo=dict(cor=TINTA),
            formula='=IF({media}{r}="","",' + F_LEITURA.replace('{m}', '{media}{r}') + ')',
            nota='Média abaixo de 2: Resiste. De 2 a 2,9: Observa. De 3 a 3,9: Experimenta. De 4 a 4,5: Adota. A partir de 4,6: Multiplica.'),
        Col('m', '', 2, 'vazio'),
    ]
    ult = f.prepara(cols)
    lin = f.faixa('Diagnóstico', 'Formulário de diagnóstico de prontidão',
                  'Uma linha por pessoa ou grupo. Notas de 1 (discordo totalmente) a 5 (concordo totalmente) para cada afirmação.', ult)
    f.legenda(lin, 'A média indica a marca provável na régua de adoção. O sinal mais fraco mostra por onde começar.', (4, 10),
              [(2, 2, 'Preencher', 'entrada'), (3, 3, 'Calculado', 'calc')], rotulo=1)
    f.altura(lin + 1, 6)
    dados = [
        ('Analistas de contas a pagar', 'Financeiro', 4, 3, 2, 2, 3), ('Controladoria', 'Financeiro', 5, 4, 5, 4, 4),
        ('Supervisores de loja', 'Operações', 3, 2, 3, 2, 2), ('Equipe de atendimento', 'Operações', 2, 2, 1, 2, 1),
        ('Equipe de vendas internas', 'Comercial', 5, 4, 4, 3, 4), ('Compradores', 'Suprimentos', 4, 4, 3, 3, 4),
        ('Equipe de suporte', 'TI', 4, 5, 4, 3, 3), ('Parceiros de negócio de RH', 'RH', 5, 4, 5, 5, 5),
    ]
    t = f.tabela(lin + 2, 1, cols, n, dados, alt_cab=23, alt=24, alt_sub=30)
    _cores_de_nota(f, t.lin0, t.col['s1'], t.linN, t.col['s5'])
    f.condicional(t.lin0, t.col['leitura'], t.linN, t.col['leitura'], [(LEITURAS[k], REGUA[k], REGUA_TEXTO[k]) for k in range(5)])
    fim = f.rodape(t.linN + 2, ult)
    f.imprime(fim, ult, repete=(t.lin_cab, t.lin_cab + 1))
    f.abre_em(congela=(t.lin0, 2), celula=(t.lin0, 1))

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Painel de prontidão', 'Onde estão os sinais fortes e fracos. Atualiza sozinho a partir da aba Formulário.', ultp)
    d.altura(lin, 14)
    F = f.prefixo
    f_media, f_area, f_leit = t.faixa('media'), t.faixa('area'), t.faixa('leitura')
    topo = lin + 5                                    # onde começam os gráficos
    # dados de apoio dos gráficos, nas células atrás deles: média por sinal e grupos por marca
    ap = topo + 1
    for k, (nome, _) in enumerate(SINAIS):
        c = t.L[f's{k + 1}']
        l = ap + k
        d.formula(l, 1, f'={F}${c}${t.lin_cab + 1}', cor=CZ, tam=T_NOTA)
        d.formula(l, 2, f'=IFERROR(AVERAGE({F}${c}${t.r0}:${c}${t.rn}),"")', cor=CZ, tam=T_NOTA)
    medias = f'$C${ap + 1}:$C${ap + 5}'
    nomes = f'$B${ap + 1}:$B${ap + 5}'
    for k in range(5):
        l = ap + k
        d.formula(l, 3, f'=IF(ISNUMBER(C{l + 1}),IF(C{l + 1}>MIN({medias}),C{l + 1},""),"")', cor=CZ, tam=T_NOTA)
        d.formula(l, 4, f'=IF(ISNUMBER(C{l + 1}),IF(C{l + 1}=MIN({medias}),C{l + 1},""),"")', cor=CZ, tam=T_NOTA)
        d.texto(l, 8, MARCAS[k], cor=CZ, tam=T_NOTA)
        d.formula(l, 9, f'=COUNTIF({f_leit},"{LEITURAS[k]}")', cor=CZ, tam=T_NOTA)
    d.texto(ap - 1, 3, 'Demais sinais', cor=CZ, tam=T_NOTA)
    d.texto(ap - 1, 4, 'Sinal mais fraco', cor=CZ, tam=T_NOTA)
    tem = f'COUNT({medias})>0'
    lin = d.cartoes(lin + 1, [
        ('Grupos ouvidos', f'=COUNT({f_media})', 'linhas com pelo menos uma nota'),
        ('Média geral', f'=IFERROR(AVERAGE({f_media}),"–")', 'média das linhas, de 1 a 5', dict(num='0.0')),
        ('Sinal mais forte', f'=IF({tem},INDEX({nomes},MATCH(MAX({medias}),{medias},0)),"–")',
         f'=IF({tem},"média "&FIXED(MAX({medias}),1),"sem notas")', dict(texto=True)),
        ('Sinal mais fraco', f'=IF({tem},INDEX({nomes},MATCH(MIN({medias}),{medias},0)),"–")',
         f'=IF({tem},"média "&FIXED(MIN({medias}),1),"sem notas")', dict(texto=True)),
    ])
    d.altura(lin, 16)
    assert lin + 1 == topo
    for i in range(13):
        d.altura(topo + i, 19)
    ch = novo_grafico(p, 'bar', 'Média por sinal', legenda='top')
    for col, cor, cor_r in ((3, AZS, TINTA), (4, AZP, AZP)):                # demais sinais e sinal mais fraco
        ch.add_series({'name': [d.nome, ap - 1, col], 'categories': [d.nome, ap, 1, ap + 4, 1], 'values': [d.nome, ap, col, ap + 4, col],
                       'fill': {'color': cor}, 'gap': 45, 'overlap': 100,
                       'data_labels': rotulos(cor_r, '0.0;;;', 'outside_end', 10, cor == AZP)})
    ch.set_y_axis(eixo_categorias(inverte=True))
    ch.set_x_axis(eixo_oculto(max=5.6))
    d.grafico(ch, topo, 1, topo + 12, 6, 'Barras com a nota média de cada um dos cinco sinais; o sinal mais fraco aparece em azul profundo.')
    ch = novo_grafico(p, 'column', 'Grupos por marca da régua')
    ch.add_series({'name': 'Grupos', 'categories': [d.nome, ap, 8, ap + 4, 8], 'values': [d.nome, ap, 9, ap + 4, 9], 'gap': 55,
                   'points': [{'fill': {'color': cor}} for cor in REGUA], 'data_labels': rotulos(tam=10)})
    ch.set_x_axis(eixo_categorias())
    ch.set_y_axis(eixo_oculto())
    d.grafico(ch, topo, 7, topo + 12, 12, 'Colunas com o número de grupos em cada marca da régua de adoção, pela leitura sugerida.')
    # mapa de calor: média de cada área em cada sinal
    lin = topo + 13
    d.altura(lin, 10)
    d.secao(lin + 1, 1, 'Mapa de calor: área x sinal', 'Média das notas de cada área em cada sinal. As cores seguem a régua: do cinza (resiste) ao azul profundo (multiplica).')
    lin += 3
    _cab(d, lin, [(1, 2, 'Área', 'left')] + [(3 + k, 3 + k, nome, 'center') for k, (nome, _) in enumerate(SINAIS)]
         + [(8, 8, 'Média', 'right'), (9, 9, 'Grupos', 'right'), (10, 12, 'Leitura sugerida', 'left')], alt=34)
    for i in range(10):
        l = lin + 1 + i
        r = l + 1
        d.altura(l, 23)
        d.mescla(l, 1, l, 2, f'=IF({item_lista(0, i)}="","",{item_lista(0, i)})', **d.e_linha(borda=BR))
        for k in range(5):
            c = t.L[f's{k + 1}']
            d.formula(l, 3 + k, f'=IF($B{r}="","",IFERROR(AVERAGEIF({f_area},$B{r},{F}${c}${t.r0}:${c}${t.rn}),""))', **d.e_linha('center', '0.0', borda=BR))
        d.formula(l, 8, f'=IF($B{r}="","",IFERROR(AVERAGEIF({f_area},$B{r},{f_media}),""))', **d.e_linha('right', '0.0', negrito=True, cor=AZP, borda=BR))
        d.formula(l, 9, f'=IF($B{r}="","",COUNTIFS({f_area},$B{r},{f_media},">0"))', **d.e_linha('right', '0', borda=BR))
        d.mescla(l, 10, l, 12, f'=IF(ISNUMBER(I{r}),' + F_LEITURA.replace('{m}', f'I{r}') + ',"")', **d.e_linha(negrito=True, borda=BR))
    _cores_de_media(d, lin + 1, 3, lin + 10, 7)
    d.condicional(lin + 1, 10, lin + 10, 12, [(LEITURAS[k], REGUA[k], REGUA_TEXTO[k]) for k in range(5)])
    lin += 11
    d.altura(lin, 12)
    lin = d.tira(lin + 1, 'Como ler', [
        'Sinal fraco em quase todas as áreas pede ação do projeto. Sinal fraco em uma área pede ação local, com o gestor.',
        'Clareza e valor baixos pedem conversa e exemplo antes de treinamento. Fluência e autonomia baixas pedem prática e apoio.',
        'A leitura é retrato do momento. Repita a cada onda do projeto e compare.'])
    fim = d.rodape(lin + 1, ultp)
    d.imprime(fim, ultp, uma_pagina=True)
    d.abre_em()
    _listas(p, 'As áreas que aparecem na lista suspensa do Formulário e no mapa de calor do Painel.',
            [('Áreas', AREAS)],
            ['Troque os nomes pelas áreas do seu projeto. A lista suspensa do Formulário e o mapa de calor do Painel acompanham.',
             'Há espaço para dez áreas. Preencha de cima para baixo, sem pular linhas.',
             'Se trocar o nome de uma área já usada no Formulário, corrija também as linhas que usavam o nome antigo.'])
    p.salvar()


# ====================================================================== riscos
CATEGORIAS = ['Patrocínio', 'Resistência', 'Capacitação', 'Comunicação', 'Sobrecarga', 'Solução', 'Operação']
STATUS_RISCO = ['Aberto', 'Em tratamento', 'Controlado', 'Encerrado']
PRIORIDADES = [('Alta', AZP, BR), ('Média', AZ, BR), ('Baixa', AZS, TINTA)]


def riscos(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'mapa-de-riscos.xlsx', 'Mapa de riscos da mudança',
               'Riscos de adoção com probabilidade, impacto, exposição, prioridade e resposta', valores, exemplo)
    como_usar(
        p, 'Riscos', 'Mapa de riscos da mudança',
        'Registra o que pode impedir a adoção, prioriza e combina resposta, responsável e prazo.',
        [('Descreva o risco', 'Na aba Riscos, escreva como causa e efeito e escolha a categoria. As categorias ficam na aba Listas e podem ser trocadas.'),
         ('Dê as duas notas', 'Probabilidade e impacto na adoção, de 1 a 5. A exposição é o produto das duas e define a prioridade.'),
         ('Combine a resposta', 'Para cada risco, o que será feito, quem responde e até quando. Atualize o status a cada revisão.'),
         ('Revise no ritmo do projeto', 'A cada marco e depois do go-live. Risco de mudança muda de lugar ao longo do caminho. O Painel mostra onde agir primeiro.')],
        [('Risco (causa e efeito)', 'O que pode acontecer e o que isso provoca na adoção.'),
         ('Categoria e grupo afetado', 'Categoria da lista (patrocínio, resistência, capacitação e outras) e quem sente o efeito.'),
         ('Probabilidade (1 a 5)', '1 = muito improvável. 5 = quase certo.'),
         ('Impacto (1 a 5)', '1 = quase não afeta a adoção. 5 = pode impedir a adoção.'),
         ('Resposta, responsável, prazo', 'O que será feito, quem responde e a data limite (dd/mm/aaaa).'),
         ('Status', 'Aberto, Em tratamento, Controlado ou Encerrado.')],
        [('Exposição', 'Probabilidade × Impacto. Vai de 1 a 25.'),
         ('Prioridade', 'Exposição de 15 a 25: Alta, ação imediata e acompanhamento no comitê. De 8 a 14: Média, plano de resposta com dono. Até 7: Baixa, monitorar.'),
         ('Mapa de calor do Painel', 'Conta os riscos em cada combinação de probabilidade e impacto. A cor de fundo de cada célula segue a prioridade da combinação.'),
         ('Ação primeiro', 'Os cinco riscos de maior exposição que não estão encerrados. No empate, vale a ordem da lista.')],
        niveis=[(nome, (fundo, cor), txt) for (nome, fundo, cor), txt in zip(PRIORIDADES, ['Exposição de 15 a 25.', 'Exposição de 8 a 14.', 'Exposição até 7.'])],
        aviso=('Dica', 'Risco sem responsável é risco sem resposta. O Painel mostra quantos estão sem dono.'),
    )

    # ------------------------------------------------------------ riscos
    a = p.aba('Riscos', 'entrada')
    n = 30
    cols = [
        Col('num', 'Nº', 5, 'calc', 'center', '0', formula='=IF({risco}{r}="","",COUNTA({risco}${r0}:{risco}{r}))'),
        Col('risco', 'Risco (causa e efeito)', 40),
        Col('cat', 'Categoria', 15, valida=lista('=' + fx_lista(0), 'Categoria', 'Escolha a categoria na lista. Para trocar as opções, edite a aba Listas.',
                                                'Escolha uma categoria da lista. Para incluir outra, edite a aba Listas.')),
        Col('grupo', 'Grupo afetado', 17),
        Col('prob', 'Probabilidade\n(1 a 5)', 12.5, alinha='center', num='0',
            valida=inteiro(1, 5, 'Probabilidade', '1 = muito improvável. 5 = quase certo.', NOTA_1A5)),
        Col('imp', 'Impacto\n(1 a 5)', 10, alinha='center', num='0',
            valida=inteiro(1, 5, 'Impacto na adoção', '1 = quase não afeta a adoção. 5 = pode impedir a adoção.', NOTA_1A5)),
        Col('exp', 'Exposição', 10.5, 'calc', 'right', '0', estilo=dict(cor=TINTA, negrito=True),
            formula='=IF(OR({prob}{r}="",{imp}{r}=""),"",{prob}{r}*{imp}{r})', nota='Probabilidade × Impacto. Vai de 1 a 25.'),
        Col('pri', 'Prioridade', 11, 'calc', estilo=dict(cor=TINTA),
            formula='=IF({exp}{r}="","",IF({exp}{r}>=15,"Alta",IF({exp}{r}>=8,"Média","Baixa")))',
            nota='Exposição de 15 a 25: Alta. De 8 a 14: Média. Até 7: Baixa.'),
        Col('resp', 'Resposta', 38),
        Col('dono', 'Responsável', 17),
        Col('prazo', 'Prazo', 11.5, alinha='right', num='dd/mm/yyyy', valida=data('Prazo', 'Data limite para a resposta, no formato dd/mm/aaaa.')),
        Col('status', 'Status', 13, valida=lista(STATUS_RISCO, 'Status', 'Aberto, Em tratamento, Controlado ou Encerrado.')),
        Col('m', '', 2, 'vazio'),
        Col('ativo', 'Exposição em aberto', 8, 'apoio', formula='=IF(OR({exp}{r}="",{status}{r}="Encerrado"),"",{exp}{r})'),
        Col('ordem', 'Ordem por exposição', 8, 'apoio',
            formula='=IF({ativo}{r}="","",COUNTIF({ativo}${r0}:{ativo}${rn},">"&{ativo}{r})+COUNTIF({ativo}${r0}:{ativo}{r},{ativo}{r}))'),
    ]
    ult = a.prepara(cols)
    lin = a.faixa('Riscos', 'Mapa de riscos da mudança', 'O que pode impedir a adoção, com prioridade, resposta, responsável e prazo.', ult)
    a.legenda(lin, 'Exposição = probabilidade × impacto. Prioridade: Alta de 15 a 25 · Média de 8 a 14 · Baixa até 7.', (5, 12),
              [(3, 3, 'Preencher', 'entrada'), (4, 4, 'Calculado', 'calc')], rotulo=2)
    a.altura(lin + 1, 6)
    d0 = datetime.date
    dados = [
        ('Patrocinador deixa de participar depois do lançamento', 'Patrocínio', 'Todas as áreas', 3, 5,
         'Agenda fixa do patrocinador até a estabilização e dados de adoção na reunião de resultados.', 'Líder do projeto', d0(2027, 2, 26), 'Em tratamento'),
        ('Gestores diretos não repassam as mensagens', 'Comunicação', 'Operações', 4, 4,
         'Preparar os gestores antes das equipes e dar roteiro de conversa.', 'Gestão da mudança', d0(2027, 2, 12), 'Aberto'),
        ('Treinamento distante do uso real', 'Capacitação', 'Usuários finais', 3, 4,
         'Prática perto do go-live e apoio no posto de trabalho.', 'Líder de capacitação', d0(2027, 3, 5), 'Em tratamento'),
        ('Várias mudanças na mesma área no mesmo trimestre', 'Sobrecarga', 'Financeiro', 4, 3,
         'Mapa de carga e decisão de sequência com a liderança.', 'Patrocinador', d0(2027, 1, 29), 'Aberto'),
        ('Retorno às planilhas depois do período de apoio', 'Resistência', 'Vendas', 3, 3,
         'Reforço pelos supervisores e uso nos indicadores da rotina.', 'Gestores diretos', d0(2027, 4, 16), 'Aberto'),
        ('Suporte insuficiente nas primeiras semanas depois do go-live', 'Operação', 'Usuários finais', 2, 4,
         'Apoio reforçado no posto de trabalho e critérios de saída combinados.', 'TI', d0(2027, 3, 19), 'Aberto'),
        ('Solução não cobre exceções frequentes do processo', 'Solução', 'Suprimentos', 2, 3,
         'Mapear exceções com usuários-chave e definir tratamento antes da virada.', 'Líder do processo', d0(2027, 2, 5), 'Controlado'),
        ('Mensagens diferentes entre as áreas sobre o que muda', 'Comunicação', 'Todas as áreas', 2, 2,
         'Mensagens-chave únicas, aprovadas pelo patrocinador.', 'Gestão da mudança', d0(2027, 1, 22), 'Controlado'),
    ]
    t = a.tabela(lin + 2, 1, cols, n, dados, alt_cab=36, alt=30)
    a.condicional(t.lin0, t.col['pri'], t.linN, t.col['pri'], PRIORIDADES)
    a.barra(t.lin0, t.col['exp'], t.linN, t.col['exp'], 25)
    fim = a.rodape(t.linN + 2, ult)
    a.imprime(fim, ult, repete=t.lin_cab)
    a.abre_em(congela=(t.lin0, 3), celula=(t.lin0, 2), zoom=90)

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Painel de riscos', 'Onde está a exposição e o que pede ação primeiro. Atualiza sozinho a partir da aba Riscos.', ultp)
    d.altura(lin, 14)
    f_risco, f_exp, f_pri, f_dono, f_status = (t.faixa(k) for k in ('risco', 'exp', 'pri', 'dono', 'status'))
    f_prob, f_imp, f_cat, f_ordem = (t.faixa(k) for k in ('prob', 'imp', 'cat', 'ordem'))
    n_riscos = f'COUNTA({f_risco})'
    lin = d.cartoes(lin + 1, [
        ('Riscos mapeados', f'={n_riscos}', f'=({n_riscos}-COUNTIF({f_status},"Encerrado"))&" ainda não encerrados"'),
        ('Prioridade alta', f'=COUNTIF({f_pri},"Alta")', 'exposição de 15 a 25'),
        ('Exposição média', f'=IFERROR(AVERAGE({f_exp}),"–")', 'probabilidade × impacto, de 1 a 25', dict(num='0.0')),
        ('Sem responsável', f'=SUMPRODUCT(({f_risco}<>"")*({f_dono}=""))', 'riscos mapeados sem dono definido'),
    ])
    d.altura(lin, 16)
    topo = lin + 1
    # mapa de calor 5 x 5 (esquerda)
    d.secao(topo, 1, 'Mapa de calor: probabilidade x impacto', 'Número de riscos em cada combinação. O fundo indica a prioridade.')
    lin = topo + 2
    d.altura(lin, 28)
    d.texto(lin, 1, 'Probabilidade ↓  Impacto →', **d.e_cab(tam=T_NOTA, negrito=False))
    for i in range(5):
        d.texto(lin, 2 + i, i + 1, **d.e_cab('center'))
    for k, prob in enumerate(range(5, 0, -1)):
        l = lin + 1 + k
        d.altura(l, 31)
        d.texto(l, 1, prob, **d.e_cab('center'))
        for i in range(1, 6):
            e = prob * i
            fundo, cor = (AZP, BR) if e >= 15 else ((AZ, BR) if e >= 8 else (AZS, TINTA))
            d.formula(l, 1 + i, f'=COUNTIFS({f_prob},{prob},{f_imp},{i})', fundo=fundo, cor=cor, negrito=True, alinha='center',
                      num='0;;;', borda=BR, tam=T_SECAO)
    l = lin + 6
    d.altura(l, 8)
    d.altura(l + 1, 21)
    for j, ((nome, fundo, cor), faixa_e) in enumerate(zip(PRIORIDADES[::-1], ['até 7', '8 a 14', '15 a 25'])):
        d.mescla(l + 1, 1 + 2 * j, l + 1, 2 + 2 * j, f'{nome}: {faixa_e}', fundo=fundo, cor=cor, negrito=True, tam=T_NOTA, alinha='center', borda=BR)
    # riscos que pedem ação primeiro (direita)
    d.secao(topo, 8, 'Riscos que pedem ação primeiro', 'Os cinco de maior exposição que não estão encerrados.')
    _cab(d, lin, [(8, 10, 'Risco', 'left'), (11, 11, 'Exposição', 'right'), (12, 12, 'Prioridade', 'left')])
    for k in range(5):
        l = lin + 1 + k
        pega = lambda fx: f'IFERROR(INDEX({fx},MATCH({k + 1},{f_ordem},0)),"")'
        fr = pega(f_risco)
        if k == 0:
            fr = f'IF(COUNT({f_ordem})=0,"Nenhum risco em aberto.",{fr})'
        d.mescla(l, 8, l, 10, '=' + fr, **d.e_linha(tam=T_CAB))
        d.formula(l, 11, '=' + pega(f_exp), **d.e_linha('right', '0', negrito=True))
        d.formula(l, 12, '=' + pega(f_pri), **d.e_linha(negrito=True, borda=BR))
    d.condicional(lin + 1, 12, lin + 5, 12, PRIORIDADES)
    base = lin + 7
    d.altura(base + 1, 14)
    # gráficos: riscos por categoria e por status, com os dados de apoio atrás deles
    g = base + 2
    for i in range(13):
        d.altura(g + i, 19)
    for j, (nome, _, _) in enumerate(PRIORIDADES):
        d.texto(g, 3 + j, nome, cor=CZ, tam=T_NOTA)
    for i in range(10):
        l, r = g + 1 + i, g + 2 + i
        d.formula(l, 2, f'=IF({item_lista(0, i)}="","",{item_lista(0, i)})', cor=CZ, tam=T_NOTA)
        for j, (nome, _, _) in enumerate(PRIORIDADES):
            d.formula(l, 3 + j, f'=IF($C{r}="","",COUNTIFS({f_cat},$C{r},{f_pri},"{nome}"))', cor=CZ, tam=T_NOTA)
    for i, nome in enumerate(STATUS_RISCO):
        d.texto(g + 1 + i, 9, nome, cor=CZ, tam=T_NOTA)
        d.formula(g + 1 + i, 10, f'=COUNTIF({f_status},"{nome}")', cor=CZ, tam=T_NOTA)
    ch = novo_grafico(p, 'bar', 'Riscos por categoria e prioridade', 'stacked', legenda='top')
    for j, (nome, fundo, cor) in enumerate(PRIORIDADES):
        ch.add_series({'name': [d.nome, g, 3 + j], 'categories': [d.nome, g + 1, 2, g + 10, 2], 'values': [d.nome, g + 1, 3 + j, g + 10, 3 + j],
                       'fill': {'color': fundo}, 'border': {'color': BR, 'width': 0.75}, 'gap': 40, 'overlap': 100, 'data_labels': rotulos(cor)})
    ch.set_y_axis(eixo_categorias(inverte=True, line={'none': True}))
    ch.set_x_axis(eixo_oculto())
    d.grafico(ch, g, 1, g + 12, 7, 'Barras empilhadas com o número de riscos de cada categoria, por prioridade.')
    ch = novo_grafico(p, 'column', 'Riscos por status')
    ch.add_series({'name': 'Riscos', 'categories': [d.nome, g + 1, 9, g + 4, 9], 'values': [d.nome, g + 1, 10, g + 4, 10], 'gap': 60,
                   'points': [{'fill': {'color': cor}} for cor in (AZP, AZ, AZS, LIN)], 'data_labels': rotulos(tam=10)})
    ch.set_x_axis(eixo_categorias())
    ch.set_y_axis(eixo_oculto())
    d.grafico(ch, g, 8, g + 12, 12, 'Colunas com o número de riscos em cada status.')
    lin = g + 13
    d.altura(lin, 12)
    lin = d.tira(lin + 1, 'Como ler', [
        ('Alta', 'Ação imediata e acompanhamento no comitê do projeto.'),
        ('Média', 'Plano de resposta com dono e prazo.'),
        ('Baixa', 'Monitorar a cada revisão.'),
        ('Ritmo', 'Revise a cada marco e depois do go-live. Risco de mudança muda de lugar.')])
    fim = d.rodape(lin + 1, ultp)
    d.imprime(fim, ultp, uma_pagina=True)
    d.abre_em()
    _listas(p, 'As categorias que aparecem na lista suspensa da aba Riscos e no gráfico do Painel.',
            [('Categorias de risco', CATEGORIAS)],
            ['Troque pelas categorias do seu projeto. A lista suspensa da aba Riscos e o gráfico do Painel acompanham.',
             'Há espaço para dez categorias. Preencha de cima para baixo, sem pular linhas.',
             'Se trocar o nome de uma categoria já usada, corrija também os riscos que usavam o nome antigo.'])
    p.salvar()


# ====================================================================== treinamentos
FORMATOS = ['Presencial', 'Ao vivo on-line', 'Vídeo curto', 'Prática guiada', 'Guia rápido', 'Apoio no posto']
MEDIR = ['Reação', 'Aprendizagem', 'Comportamento', 'Resultado']
STATUS_TREINO = [('A planejar', LIN, TINTA), ('Em preparo', AZS, TINTA), ('Agendado', AZ, BR), ('Realizado', AZP, BR), ('Adiado', CZ, BR)]


def treinamentos(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'plano-de-treinamentos.xlsx', 'Plano editorial de treinamentos',
               'A pauta da capacitação: público, tema, objetivo, formato, data e como medir', valores, exemplo)
    como_usar(
        p, 'Capacitação', 'Plano editorial de treinamentos',
        'Organiza a capacitação como uma pauta: cada público recebe o conteúdo certo, no formato certo, perto do momento de usar.',
        [('Informe a data do go-live', 'No alto da aba Plano. A coluna Momento mostra a distância de cada ação até essa data. Se o go-live mudar, basta trocar a data.'),
         ('Uma linha por ação', 'Público, tema, formato, data e responsável. Escreva o objetivo como comportamento: o que a pessoa passa a fazer depois.'),
         ('Defina como medir', 'Reação (gostou), aprendizagem (sabe), comportamento (faz no trabalho) ou resultado (efeito no negócio). Presença e satisfação não provam adoção.'),
         ('Atualize o status', 'O Painel mostra o andamento, a distribuição no tempo e os formatos. Prepare primeiro os gestores diretos e os usuários-chave.')],
        [('Data do go-live', 'A data da virada, no alto da aba Plano (dd/mm/aaaa).'),
         ('Público, tema e objetivo', 'Quem aprende, o quê e o que passa a fazer depois. Uma linha por ação de capacitação.'),
         ('Formato', 'Escolha na lista. Para trocar as opções, edite a aba Listas.'),
         ('Data, duração, responsável, material', 'Quando acontece (dd/mm/aaaa), quanto tempo leva, quem conduz e o material de apoio.'),
         ('Como medir e status', 'Nível de avaliação (Reação, Aprendizagem, Comportamento ou Resultado) e andamento (A planejar, Em preparo, Agendado, Realizado ou Adiado).')],
        [('Momento', 'Semanas inteiras entre a data da ação e a data do go-live: (data da ação − data do go-live) ÷ 7, arredondado para baixo. Negativo vira "semanas antes"; zero, "Semana do go-live"; positivo, "semanas depois".'),
         ('Realizadas', 'Ações com status Realizado ÷ total de ações do plano.'),
         ('Públicos atendidos', 'Número de públicos diferentes na coluna Público.'),
         ('Medem uso ou resultado', 'Ações medidas por Comportamento ou Resultado ÷ total de ações.'),
         ('Ações por semana', 'Conta as ações em cada semana em relação ao go-live, de seis semanas antes a quatro semanas depois.')],
        niveis=[(nome, (fundo, cor), txt) for (nome, fundo, cor), txt in zip(STATUS_TREINO, [
            'Ainda sem data ou conteúdo.', 'Conteúdo em produção.', 'Data e turma confirmadas.', 'Ação concluída.', 'Remarcar e avisar o público.'])],
        aviso=('Lembrete', 'Treinar longe do uso faz o conteúdo se perder. Aproxime a prática do go-live e planeje apoio no posto de trabalho nas primeiras semanas.'),
    )

    # ------------------------------------------------------------ plano
    a = p.aba('Plano', 'entrada')
    n = 40
    GOLIVE = '$C$5'                                    # célula da data do go-live
    cols = [
        Col('pub', 'Público', 20),
        Col('tema', 'Tema', 25),
        Col('obj', 'Objetivo: o que a pessoa passa a fazer', 34),
        Col('fmt', 'Formato', 16, valida=lista('=' + fx_lista(0), 'Formato', 'Escolha o formato na lista. Para trocar as opções, edite a aba Listas.',
                                               'Escolha um formato da lista. Para incluir outro, edite a aba Listas.')),
        Col('data', 'Data', 12, alinha='right', num='dd/mm/yyyy', valida=data('Data da ação', 'Data prevista ou realizada, no formato dd/mm/aaaa.')),
        Col('mom', 'Momento', 17, 'calc',
            formula='=IF({sem}{r}="","",IF({sem}{r}=0,"Semana do go-live",IF({sem}{r}<0,-{sem}{r}&IF({sem}{r}=-1," semana antes"," semanas antes"),'
                    '{sem}{r}&IF({sem}{r}=1," semana depois"," semanas depois"))))',
            nota='Semanas inteiras entre a data da ação e a data do go-live, informada no alto da aba.'),
        Col('dur', 'Duração', 10),
        Col('resp', 'Responsável', 17),
        Col('mat', 'Material', 17),
        Col('medir', 'Como medir', 15.5, valida=lista(MEDIR, 'Como medir', 'Reação = gostou. Aprendizagem = sabe. Comportamento = faz no trabalho. Resultado = efeito no negócio.')),
        Col('status', 'Status', 12, valida=lista([s[0] for s in STATUS_TREINO], 'Status', 'A planejar, Em preparo, Agendado, Realizado ou Adiado.')),
        Col('obs', 'Observações', 21),
        Col('m', '', 2, 'vazio'),
        Col('sem', 'Semana em relação ao go-live', 8, 'apoio', formula='=IF(OR({data}{r}="",%s=""),"",INT(({data}{r}-%s)/7))' % (GOLIVE, GOLIVE)),
    ]
    ult = a.prepara(cols)
    lin = a.faixa('Capacitação', 'Plano editorial de treinamentos', 'Quem aprende o quê, em que formato, quando e como se confirma que aprendeu.', ult)
    assert lin == 4
    a.legenda(lin, 'Momento = semanas entre a data de cada ação e o go-live. Se o go-live mudar, troque só a data ao lado.', (6, 12),
              [(4, 4, 'Preencher', 'entrada'), (5, 5, 'Calculado', 'calc')], rotulo=3)
    a.texto(lin, 1, 'DATA DO GO-LIVE', cor=AZP, tam=T_NOTA, negrito=True, alinha='right', recuo=1)
    gl = datetime.date(2027, 3, 1)
    a.texto(lin, 2, gl if p.exemplo else None, **a.e_entrada('left', 'dd/mm/yyyy', negrito=True))
    a.ws.data_validation(lin, 2, lin, 2, data('Data do go-live', 'A data da virada, no formato dd/mm/aaaa. A coluna Momento e o Painel usam esta data.'))
    a.altura(lin + 1, 6)
    dia = lambda k: gl + datetime.timedelta(days=k)
    dados = [
        ('Patrocinadores', 'Papel do patrocinador nos marcos', 'Abrir os marcos e cobrar a adoção nas reuniões de resultado', 'Presencial', dia(-28), '60 min', 'Gestão da mudança', 'Roteiro do patrocinador', 'Comportamento', 'Realizado', ''),
        ('Gestores diretos', 'O que muda e como conduzir a equipe', 'Explicar a mudança e tratar dúvidas da equipe', 'Ao vivo on-line', dia(-21), '90 min', 'Gestão da mudança', 'Roteiro de conversa', 'Comportamento', 'Realizado', ''),
        ('Usuários-chave', 'Processo novo de ponta a ponta', 'Executar o processo e apoiar os colegas', 'Prática guiada', dia(-14), '4 h', 'Líder do processo', 'Ambiente de treino', 'Aprendizagem', 'Agendado', ''),
        ('Multiplicadores', 'Como apoiar os colegas no posto', 'Tirar dúvidas e registrar o que não funciona', 'Prática guiada', dia(-10), '3 h', 'Líder de capacitação', 'Guia do multiplicador', 'Aprendizagem', 'Em preparo', ''),
        ('Usuários finais', 'Tarefas do dia a dia no novo sistema', 'Realizar as tarefas mais frequentes sem ajuda', 'Prática guiada', dia(-5), '2 h', 'Multiplicadores', 'Guia rápido', 'Comportamento', 'Em preparo', 'Turmas por área, perto do uso.'),
        ('Usuários finais', 'Apoio na virada', 'Resolver dúvidas na hora, no próprio posto', 'Apoio no posto', dia(0), '1 semana', 'Multiplicadores', 'Guia rápido', 'Resultado', 'A planejar', ''),
        ('Todos', 'Dúvidas frequentes da primeira semana', 'Resolver os erros mais comuns', 'Vídeo curto', dia(7), '5 min', 'Gestão da mudança', 'Vídeos e guia', 'Reação', 'A planejar', ''),
        ('Usuários finais', 'Reforço das tarefas com mais erro', 'Corrigir os erros mais frequentes sem ajuda', 'Guia rápido', dia(14), '30 min', 'Multiplicadores', 'Guia rápido', 'Resultado', 'A planejar', ''),
    ]
    t = a.tabela(lin + 2, 1, cols, n, dados, alt_cab=36, alt=30)
    a.condicional(t.lin0, t.col['status'], t.linN, t.col['status'], STATUS_TREINO)
    fim = a.rodape(t.linN + 2, ult)
    a.imprime(fim, ult, repete=t.lin_cab)
    a.abre_em(congela=(t.lin0, 3), celula=(t.lin0, 1), zoom=85)

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Painel da capacitação', 'Andamento, distribuição no tempo e formatos. Atualiza sozinho a partir da aba Plano.', ultp)
    d.altura(lin, 14)
    f_tema, f_pub, f_status, f_medir, f_fmt, f_sem = (t.faixa(k) for k in ('tema', 'pub', 'status', 'medir', 'fmt', 'sem'))
    n_acoes = f'COUNTA({f_tema})'
    n_real = f'COUNTIF({f_status},"Realizado")'
    n_uso = f'(COUNTIF({f_medir},"Comportamento")+COUNTIF({f_medir},"Resultado"))'
    lin = d.cartoes(lin + 1, [
        ('Ações de capacitação', f'={n_acoes}', 'linhas preenchidas no plano'),
        ('Realizadas', f'=IF({n_acoes}=0,"–",{n_real}/{n_acoes})', f'={n_real}&" de "&{n_acoes}&" ações"', dict(num='0%')),
        ('Públicos atendidos', f'=SUMPRODUCT(({f_pub}<>"")/COUNTIF({f_pub},{f_pub}&""))', 'públicos diferentes no plano'),
        ('Medem uso ou resultado', f'=IF({n_acoes}=0,"–",{n_uso}/{n_acoes})', 'ações medidas por comportamento ou resultado', dict(num='0%')),
    ])
    d.altura(lin, 16)
    g1 = lin + 1
    for i in range(27):
        d.altura(g1 + i, 19 if i != 13 else 14)
    g2 = g1 + 14
    # dados de apoio, atrás dos gráficos
    semanas = ['≤ -6', '-5', '-4', '-3', '-2', '-1', 'Go-live', '+1', '+2', '+3', '≥ +4']
    for i, rot in enumerate(semanas):
        k = i - 6
        crit = '"<=-6"' if i == 0 else ('">=4"' if i == 10 else str(k))
        d.texto(g1 + 1 + i, 2, rot, cor=CZ, tam=T_NOTA)
        d.formula(g1 + 1 + i, 3, f'=COUNTIF({f_sem},{crit})', cor=CZ, tam=T_NOTA)
    for i, (nome, _, _) in enumerate(STATUS_TREINO):
        d.texto(g1 + 1 + i, 10, nome, cor=CZ, tam=T_NOTA)
        d.formula(g1 + 1 + i, 11, f'=COUNTIF({f_status},"{nome}")', cor=CZ, tam=T_NOTA)
    for i in range(10):
        d.formula(g2 + 1 + i, 2, f'=IF({item_lista(0, i)}="","",{item_lista(0, i)})', cor=CZ, tam=T_NOTA)
        d.formula(g2 + 1 + i, 3, f'=IF(C{g2 + 2 + i}="","",COUNTIF({f_fmt},C{g2 + 2 + i}))', cor=CZ, tam=T_NOTA)
    for i, nome in enumerate(MEDIR):
        d.texto(g2 + 1 + i, 8, nome, cor=CZ, tam=T_NOTA)
        d.formula(g2 + 1 + i, 9, f'=COUNTIF({f_medir},"{nome}")', cor=CZ, tam=T_NOTA)
    # ações por semana em relação ao go-live
    ch = novo_grafico(p, 'column', 'Ações por semana em relação ao go-live')
    ch.add_series({'name': 'Ações', 'categories': [d.nome, g1 + 1, 2, g1 + 11, 2], 'values': [d.nome, g1 + 1, 3, g1 + 11, 3], 'gap': 45,
                   'points': [{'fill': {'color': AZS}}] * 6 + [{'fill': {'color': AZP}}] + [{'fill': {'color': AZ}}] * 4,
                   'data_labels': rotulos(tam=10)})
    ch.set_x_axis(eixo_categorias(fonte=F_EIXO, name='Semanas antes (−) e depois (+) do go-live', name_font=dict(F_EIXO, bold=False)))
    ch.set_y_axis(eixo_oculto())
    d.grafico(ch, g1, 1, g1 + 12, 8, 'Colunas com o número de ações de capacitação em cada semana, de seis semanas antes a quatro semanas depois do go-live.')
    ch = novo_grafico(p, 'bar', 'Ações por status')
    ch.add_series({'name': 'Ações', 'categories': [d.nome, g1 + 1, 10, g1 + 5, 10], 'values': [d.nome, g1 + 1, 11, g1 + 5, 11], 'gap': 45,
                   'points': [{'fill': {'color': fundo}} for _, fundo, _ in STATUS_TREINO], 'data_labels': rotulos(tam=10, posicao='outside_end')})
    ch.set_y_axis(eixo_categorias(inverte=True))
    ch.set_x_axis(eixo_oculto())
    d.grafico(ch, g1, 9, g1 + 12, 12, 'Barras com o número de ações em cada status.')
    ch = novo_grafico(p, 'bar', 'Ações por formato')
    ch.add_series({'name': 'Ações', 'categories': [d.nome, g2 + 1, 2, g2 + 10, 2], 'values': [d.nome, g2 + 1, 3, g2 + 10, 3], 'gap': 40,
                   'fill': {'color': AZ}, 'data_labels': rotulos(tam=10, posicao='outside_end')})
    ch.set_y_axis(eixo_categorias(inverte=True, line={'none': True}))
    ch.set_x_axis(eixo_oculto())
    d.grafico(ch, g2, 1, g2 + 12, 6, 'Barras com o número de ações em cada formato da lista.')
    ch = novo_grafico(p, 'column', 'Como as ações são medidas')
    ch.add_series({'name': 'Ações', 'categories': [d.nome, g2 + 1, 8, g2 + 4, 8], 'values': [d.nome, g2 + 1, 9, g2 + 4, 9], 'gap': 60,
                   'points': [{'fill': {'color': cor}} for cor in (LIN, AZS, AZ, AZP)], 'data_labels': rotulos(tam=10)})
    ch.set_x_axis(eixo_categorias())
    ch.set_y_axis(eixo_oculto())
    d.grafico(ch, g2, 7, g2 + 12, 12, 'Colunas com o número de ações por nível de avaliação: reação, aprendizagem, comportamento e resultado.')
    lin = g2 + 13
    d.altura(lin, 12)
    lin = d.tira(lin + 1, 'Como ler', [
        'Ações concentradas muito antes do go-live se perdem. Aproxime a prática da virada e mantenha apoio nas semanas seguintes.',
        'Reação e aprendizagem mostram se o treinamento funcionou. Comportamento e resultado mostram se a mudança aconteceu.',
        'Gestores diretos e usuários-chave vêm primeiro: eles sustentam a mudança quando o projeto sai.'])
    fim = d.rodape(lin + 1, ultp)
    d.imprime(fim, ultp, uma_pagina=True)
    d.abre_em()
    _listas(p, 'Os formatos que aparecem na lista suspensa da aba Plano e no gráfico do Painel.',
            [('Formatos', FORMATOS)],
            ['Troque pelos formatos que a sua organização usa. A lista suspensa da aba Plano e o gráfico do Painel acompanham.',
             'Há espaço para dez formatos. Preencha de cima para baixo, sem pular linhas.',
             'As listas de Como medir e de Status são fixas, porque os indicadores do Painel dependem delas.'])
    p.salvar()


# ====================================================================== ADKAR
ELEMENTOS = [
    ('Consciência', 'Entende por que a mudança é necessária? 1 = não entende. 5 = entende bem.'),
    ('Desejo', 'Quer participar e apoiar a mudança? 1 = não quer. 5 = quer muito.'),
    ('Conhecimento', 'Sabe como mudar? 1 = não sabe. 5 = sabe bem.'),
    ('Habilidade', 'Consegue fazer do novo jeito no dia a dia? 1 = não consegue. 5 = faz com fluência.'),
    ('Reforço', 'Há reforço para sustentar a mudança? 1 = nenhum. 5 = constante.'),
]
# (ponto de barreira, nível de resistência, quando acontece, ação recomendada)
BARREIRAS = [
    ('Consciência', 'Alta', 'Consciência com nota 3 ou menor: o grupo ainda não entende por que mudar.', 'Patrocinador explica por que mudar e o risco de não mudar.'),
    ('Desejo', 'Alta', 'Consciência acima de 3 e Desejo 3 ou menor: entende, mas ainda não quer participar.', 'Gestor direto conversa sobre perdas, ganhos e o que muda para cada um.'),
    ('Conhecimento', 'Média', 'As duas primeiras acima de 3 e Conhecimento 3 ou menor: quer, mas não sabe como.', 'Capacitação no processo e na ferramenta, perto do uso.'),
    ('Habilidade', 'Média', 'As três primeiras acima de 3 e Habilidade 3 ou menor: sabe, mas ainda não consegue fazer.', 'Prática guiada, apoio no posto de trabalho e tempo para aprender.'),
    ('Reforço', 'Baixa', 'As quatro primeiras acima de 3 e Reforço 3 ou menor: faz, mas pode voltar ao jeito antigo.', 'Reconhecer, medir o uso e tirar atritos da rotina.'),
    ('Sem barreira', 'Baixa', 'Todas as notas acima de 3.', 'Manter o reforço e usar o grupo como exemplo.'),
]
COR_NIVEL = {nome: (fundo, cor) for nome, fundo, cor in PRIORIDADES}
CREDITO_ADKAR = 'ADKAR é marca registrada da Prosci.'


def adkar(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'avaliacao-adkar-mapa-de-resistencia.xlsx', 'Avaliação ADKAR e mapa de resistência',
               'Notas por grupo, ponto de barreira, nível de resistência e ação recomendada', valores, exemplo)
    como_usar(
        p, 'Resistência', 'Avaliação ADKAR e mapa de resistência',
        'Mostra em que elemento do ADKAR cada grupo está travado e indica a ação certa para destravar.',
        [('Liste os grupos impactados', 'Na aba Avaliação ADKAR, uma linha por grupo, com a área e o número de pessoas.'),
         ('Dê nota aos cinco elementos', 'De 1 a 5 para Consciência, Desejo, Conhecimento, Habilidade e Reforço. Baseie-se em pesquisa curta, conversa com gestores e dados de uso.'),
         ('Leia o ponto de barreira', 'É o primeiro elemento, na ordem do modelo, com nota 3 ou menor. A planilha indica o nível de resistência e a ação recomendada.'),
         ('Priorize no Painel', 'O mapa de resistência soma grupos e pessoas por barreira e mostra onde agir primeiro. É retrato do momento, não rótulo.')],
        [('Grupo impactado e área', 'Quem é afetado pela mudança. Avalie por grupo, não por pessoa.'),
         ('Pessoas', 'Número de pessoas do grupo. Dá o peso de cada barreira no Painel.'),
         ('Consciência a Reforço', 'Nota de 1 a 5 para cada elemento, na ordem do modelo: entende por que mudar, quer participar, sabe como, consegue fazer, tem reforço para manter.'),
         ('Ações por ponto de barreira', 'No fim da aba. O texto de cada ação pode ser editado: a coluna "Ação recomendada" acompanha.')],
        [('Ponto de barreira', 'O primeiro elemento, na ordem Consciência, Desejo, Conhecimento, Habilidade e Reforço, com nota 3 ou menor. Não é a menor nota: os elementos são sequenciais, e não adianta treinar quem ainda não decidiu participar. Sem nota 3 ou menor: "Sem barreira".'),
         ('Nível de resistência', 'Barreira em Consciência ou Desejo: Alta (ainda não quer mudar). Em Conhecimento ou Habilidade: Média (quer, mas não consegue). Em Reforço ou sem barreira: Baixa. É uma leitura deste modelo, para priorizar o esforço.'),
         ('Ação recomendada', 'A ação da tabela "Ações por ponto de barreira" para a barreira do grupo.'),
         ('Painel', 'Soma grupos e pessoas por barreira. % das pessoas = pessoas na barreira ÷ total de pessoas. Nota média = média simples das notas de cada elemento. '
                    'Onde agir primeiro: resistência mais alta primeiro e, dentro dela, os grupos com mais pessoas.')],
        niveis=[('Alta', COR_NIVEL['Alta'], 'Barreira em Consciência ou Desejo.'), ('Média', COR_NIVEL['Média'], 'Em Conhecimento ou Habilidade.'),
                ('Baixa', COR_NIVEL['Baixa'], 'Em Reforço ou sem barreira.')],
        aviso=('Cuidado', 'Avalie por grupo, com base em pesquisa curta, conversa com gestores e dados de uso. É retrato do momento, não rótulo.'),
        credito=CREDITO_ADKAR,
    )

    # ------------------------------------------------------------ avaliação
    a = p.aba('Avaliação ADKAR', 'entrada')
    n = 30
    lin_cab = 6
    lin_ref = lin_cab + n + 4                    # cabeçalho da tabela "Ações por ponto de barreira"
    larg_e = [12.5, 10, 14, 11.5, 10]
    cols = [
        Col('grupo', 'Grupo impactado', 26),
        Col('area', 'Área', 14),
        Col('pes', 'Pessoas', 9.5, alinha='right', num='0', valida=inteiro(0, None, 'Pessoas', 'Número de pessoas do grupo. Use números inteiros.')),
    ]
    cols += [Col(f'e{k + 1}', nome, larg_e[k], alinha='center', num='0', valida=inteiro(1, 5, nome, msg, NOTA_1A5)) for k, (nome, msg) in enumerate(ELEMENTOS)]
    cols += [
        Col('barr', 'Ponto de barreira', 16, 'calc', estilo=dict(cor=AZP, negrito=True),
            formula='=IF(COUNT({e1}{r}:{e5}{r})<5,"",IF({e1}{r}<=3,"Consciência",IF({e2}{r}<=3,"Desejo",IF({e3}{r}<=3,"Conhecimento",'
                    'IF({e4}{r}<=3,"Habilidade",IF({e5}{r}<=3,"Reforço","Sem barreira"))))))',
            nota='O primeiro elemento, na ordem do modelo, com nota 3 ou menor. Não é a menor nota. Só aparece com as cinco notas preenchidas.'),
        Col('nivel', 'Nível de\nresistência', 12, 'calc', estilo=dict(cor=TINTA),
            formula='=IF({barr}{r}="","",IF(OR({barr}{r}="Consciência",{barr}{r}="Desejo"),"Alta",IF(OR({barr}{r}="Conhecimento",{barr}{r}="Habilidade"),"Média","Baixa")))',
            nota='Barreira em Consciência ou Desejo: Alta. Em Conhecimento ou Habilidade: Média. Em Reforço ou sem barreira: Baixa.'),
        Col('acao', 'Ação recomendada', 45, 'calc',
            formula='=IF({barr}{r}="","",IFERROR(INDEX($L$%d:$L$%d,MATCH({barr}{r},$B$%d:$B$%d,0)),""))' % (lin_ref + 2, lin_ref + 7, lin_ref + 2, lin_ref + 7),
            nota='A ação da tabela "Ações por ponto de barreira", no fim da aba, para a barreira do grupo.'),
        Col('m', '', 2, 'vazio'),
        Col('peso', 'Peso para a ordem', 8, 'apoio',
            formula='=IF({nivel}{r}="","",IF({nivel}{r}="Alta",3,IF({nivel}{r}="Média",2,1))*1000000+N({pes}{r}))'),
        Col('ordem', 'Ordem de ação', 8, 'apoio',
            formula='=IF({peso}{r}="","",COUNTIF({peso}${r0}:{peso}${rn},">"&{peso}{r})+COUNTIF({peso}${r0}:{peso}{r},{peso}{r}))'),
    ]
    ult = a.prepara(cols)
    lin = a.faixa('Resistência', 'Avaliação ADKAR e mapa de resistência',
                  'Notas de 1 a 5 por grupo. O ponto de barreira é o primeiro elemento, na ordem, com nota 3 ou menor. ' + CREDITO_ADKAR, ult)
    a.legenda(lin, 'A célula em azul profundo mostra onde o grupo trava. Resistência alta: Consciência ou Desejo · Média: Conhecimento ou Habilidade · Baixa: Reforço ou sem barreira.', (4, 11),
              [(2, 2, 'Preencher', 'entrada'), (3, 3, 'Calculado', 'calc')], rotulo=1)
    a.altura(lin + 1, 6)
    assert lin + 2 == lin_cab
    dados = [('Analistas de contas a pagar', 'Financeiro', 18, 4, 2, 2, 2, 1), ('Supervisores de loja', 'Operações', 42, 3, 3, 2, 2, 2),
             ('Vendas internas', 'Comercial', 25, 5, 4, 4, 2, 2), ('Compradores', 'Suprimentos', 12, 5, 5, 4, 4, 3),
             ('Atendimento', 'Operações', 60, 2, 2, 1, 1, 1), ('Controladoria', 'Financeiro', 9, 5, 4, 5, 4, 4)]
    t = a.tabela(lin_cab, 1, cols, n, dados, alt_cab=36, alt=31)
    e1, e5 = t.col['e1'], t.col['e5']
    for k, (nome, _) in enumerate(ELEMENTOS):                 # a célula que é o ponto de barreira, em azul profundo
        a.ws.conditional_format(t.lin0, e1 + k, t.linN, e1 + k, {
            'type': 'formula', 'criteria': f'=${t.L["barr"]}{t.r0}="{nome}"',
            'format': p.dxf(fundo=AZP, cor=BR, negrito=True), 'stop_if_true': True})
    _cores_de_nota(a, t.lin0, e1, t.linN, e5)
    a.condicional(t.lin0, t.col['nivel'], t.linN, t.col['nivel'], PRIORIDADES)
    # ações por ponto de barreira: regra à vista e textos editáveis
    a.secao(t.linN + 2, 1, 'Ações por ponto de barreira', 'Como a planilha lê cada barreira. O texto da ação pode ser editado.')
    assert t.linN + 4 == lin_ref
    a.altura(lin_ref, 28)
    a.texto(lin_ref, 1, 'Ponto de barreira', **a.e_cab())
    a.mescla(lin_ref, 2, lin_ref, 3, 'Nível de resistência', **a.e_cab())
    a.mescla(lin_ref, 4, lin_ref, 10, 'Quando acontece', **a.e_cab())
    a.texto(lin_ref, 11, 'Ação recomendada', **a.e_cab())
    for k, (nome, nivel, quando, acao) in enumerate(BARREIRAS):
        l = lin_ref + 1 + k
        a.altura(l, 31)
        a.texto(l, 1, nome, **a.e_calc(cor=AZP, negrito=True))
        a.mescla(l, 2, l, 3, nivel, fundo=COR_NIVEL[nivel][0], cor=COR_NIVEL[nivel][1], negrito=True, recuo=1, borda=BR)
        a.mescla(l, 4, l, 10, quando, **a.e_calc())
        a.texto(l, 11, acao, **a.e_entrada())
    fim = a.rodape(lin_ref + 8, ult, extra=CREDITO_ADKAR)
    a.imprime(fim, ult, repete=t.lin_cab)
    a.abre_em(congela=(t.lin0, 2), celula=(t.lin0, 1))

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Mapa de resistência', 'Onde a mudança trava: grupos e pessoas por ponto de barreira. Atualiza sozinho a partir da aba Avaliação ADKAR.', ultp)
    d.altura(lin, 14)
    A = a.prefixo
    f_barr, f_pes, f_nivel, f_grupo, f_acao, f_ordem = (t.faixa(k) for k in ('barr', 'pes', 'nivel', 'grupo', 'acao', 'ordem'))
    total = f'SUM({f_pes})'
    alta = f'SUMIF({f_nivel},"Alta",{f_pes})'
    topo = lin + 5
    tb = topo + 3                                     # primeira linha da tabela por barreira
    nomes_b, pes_b = f'$H${tb + 1}:$H${tb + 6}', f'$K${tb + 1}:$K${tb + 6}'
    lin = d.cartoes(lin + 1, [
        ('Grupos avaliados', f'=COUNTIF({f_barr},"?*")', 'com as cinco notas preenchidas'),
        ('Pessoas impactadas', f'={total}', 'soma das pessoas dos grupos'),
        ('Com resistência alta', f'={alta}', f'=IF({total}=0,"sem pessoas informadas",ROUND(100*{alta}/{total},0)&"% das pessoas, em Consciência ou Desejo")'),
        ('Barreira mais comum', f'=IF(MAX({pes_b})=0,"–",INDEX({nomes_b},MATCH(MAX({pes_b}),{pes_b},0)))',
         f'=IF(MAX({pes_b})=0,"sem dados",MAX({pes_b})&" pessoas neste ponto")', dict(texto=True)),
    ])
    d.altura(lin, 16)
    assert lin + 1 == topo
    # tabela por barreira (direita) e gráfico (esquerda)
    d.secao(topo, 7, 'Onde a mudança trava', 'Grupos e pessoas em cada ponto de barreira.')
    _cab(d, topo + 2, [(7, 8, 'Ponto de barreira', 'left'), (9, 9, 'Grupos', 'right'), (10, 10, 'Pessoas', 'right'),
                       (11, 11, '% das pessoas', 'right'), (12, 12, 'Resistência', 'left')])
    assert topo + 3 == tb
    for k, (nome, nivel, _, _) in enumerate(BARREIRAS):
        l = tb + k
        d.altura(l, 27)
        d.mescla(l, 7, l, 8, nome, **d.e_linha(negrito=True, cor=AZP))
        d.formula(l, 9, f'=COUNTIF({f_barr},$H{l + 1})', **d.e_linha('right', '0'))
        d.formula(l, 10, f'=SUMIF({f_barr},$H{l + 1},{f_pes})', **d.e_linha('right', '0'))
        d.formula(l, 11, f'=IF({total}=0,"",K{l + 1}/{total})', **d.e_linha('right', '0%'))
        d.texto(l, 12, nivel, fundo=COR_NIVEL[nivel][0], cor=COR_NIVEL[nivel][1], negrito=True, recuo=1, borda=BR)
    base = tb + 5
    ch = novo_grafico(p, 'bar', 'Pessoas por ponto de barreira')
    ch.add_series({'name': 'Pessoas', 'categories': [d.nome, tb, 7, base, 7], 'values': [d.nome, tb, 10, base, 10], 'gap': 42,
                   'points': [{'fill': {'color': COR_NIVEL[b[1]][0]}} for b in BARREIRAS], 'data_labels': rotulos(tam=10, posicao='outside_end')})
    ch.set_y_axis(eixo_categorias(inverte=True))
    ch.set_x_axis(eixo_oculto())
    d.grafico(ch, topo, 1, base, 5, 'Barras com o número de pessoas em cada ponto de barreira, na ordem do modelo.')
    d.altura(base + 1, 14)
    # onde agir primeiro (direita) e nota média por elemento (esquerda)
    g = base + 2
    d.secao(g, 7, 'Onde agir primeiro', 'Resistência mais alta primeiro e, dentro dela, os grupos com mais pessoas.')
    _cab(d, g + 2, [(7, 8, 'Grupo', 'left'), (9, 9, 'Pessoas', 'right'), (10, 10, 'Barreira', 'left'), (11, 12, 'Ação recomendada', 'left')])
    for k in range(5):
        l = g + 3 + k
        d.altura(l, 40)
        pega = lambda fx: f'IFERROR(INDEX({fx},MATCH({k + 1},{f_ordem},0)),"")'
        fg = pega(f_grupo)
        if k == 0:
            fg = f'IF(COUNT({f_ordem})=0,"Nenhum grupo avaliado.",{fg})'
        d.mescla(l, 7, l, 8, '=' + fg, **d.e_linha(tam=T_CAB))
        d.formula(l, 9, '=' + pega(f_pes), **d.e_linha('right', '0'))
        d.formula(l, 10, '=' + pega(f_barr), **d.e_linha(negrito=True, cor=AZP, tam=T_CAB))
        d.mescla(l, 11, l, 12, '=' + pega(f_acao), **d.e_linha(tam=T_NOTA))
    base2 = g + 7
    # apoio do gráfico de notas, atrás dele
    for k, (nome, _) in enumerate(ELEMENTOS):
        c = t.L[f'e{k + 1}']
        d.formula(g + 2 + k, 2, f'={A}${c}${t.lin_cab + 1}', cor=CZ, tam=T_NOTA)
        d.formula(g + 2 + k, 3, f'=IFERROR(AVERAGE({A}${c}${t.r0}:${c}${t.rn}),"")', cor=CZ, tam=T_NOTA)
        d.texto(g + 2 + k, 4, 3, cor=CZ, tam=T_NOTA)
    d.texto(g + 1, 3, 'Nota média', cor=CZ, tam=T_NOTA)
    d.texto(g + 1, 4, 'Limite de barreira (3)', cor=CZ, tam=T_NOTA)
    ch = novo_grafico(p, 'column', 'Nota média por elemento', legenda='top')
    ch.add_series({'name': [d.nome, g + 1, 3], 'categories': [d.nome, g + 2, 2, g + 6, 2], 'values': [d.nome, g + 2, 3, g + 6, 3],
                   'fill': {'color': AZ}, 'gap': 60, 'data_labels': rotulos(num='0.0;;;', tam=10)})
    limite = p.wb.add_chart({'type': 'line'})
    limite.add_series({'name': [d.nome, g + 1, 4], 'categories': [d.nome, g + 2, 2, g + 6, 2], 'values': [d.nome, g + 2, 4, g + 6, 4],
                       'line': {'color': AZP, 'width': 1.25, 'dash_type': 'dash'}, 'marker': {'type': 'none'}})
    ch.combine(limite)
    ch.set_x_axis(eixo_categorias())
    ch.set_y_axis(eixo_oculto(max=5.5))
    d.grafico(ch, g, 1, base2, 5, 'Colunas com a nota média de cada elemento do ADKAR e uma linha tracejada na nota 3, o limite de barreira.')
    d.altura(base2 + 1, 12)
    lin = d.tira(base2 + 2, 'Como ler', [
        'O ponto de barreira não é a menor nota: os elementos são sequenciais, e não adianta treinar quem ainda não decidiu participar.',
        'Resistência alta pede patrocinador e gestor direto. Média pede capacitação e prática. Baixa pede reforço.',
        'É uma leitura deste modelo, para priorizar o esforço. Retrato do momento, não rótulo.'])
    fim = d.rodape(lin + 1, ultp, extra=CREDITO_ADKAR)
    d.imprime(fim, ultp, uma_pagina=True)
    d.abre_em()
    p.salvar()


# ====================================================================== impactos
TIPOS = ['Processo', 'Sistema', 'Papel', 'Competência', 'Estrutura', 'Indicador']
CLASSES = [('Alto', AZP, BR), ('Médio', AZ, BR), ('Baixo', AZS, TINTA)]
VAGAS_IMP = 8          # vagas das listas de áreas e de tipos


def impactos(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'lista-de-impactos-dashboard.xlsx', 'Lista de impactos com dashboard',
               'Impactos da mudança por grupo, com classificação e painel por área e por tipo', valores, exemplo)
    como_usar(
        p, 'Impactos', 'Lista de impactos com dashboard',
        'Registra o que muda para cada grupo e mostra onde a mudança pesa mais, para dimensionar comunicação, capacitação e apoio.',
        [('Ajuste as listas', 'Na aba Listas, troque as áreas e os tipos de impacto pelos do seu projeto. As listas suspensas e o Painel acompanham.'),
         ('Uma linha por impacto', 'Na aba Lista de impactos: processo, área, grupo, tipo, o que muda, grau de 1 a 5 e número de pessoas.'),
         ('Defina a ação', 'Para cada impacto, a ação de mudança e quem responde por ela. A classificação é calculada pelo grau.'),
         ('Leia o Painel', 'Indicadores, impactos por área e por tipo e mapa de calor área x tipo. Tudo atualiza sozinho.')],
        [('Processo ou atividade', 'O que é afetado pela mudança.'),
         ('Área e tipo de impacto', 'Escolha nas listas. Para trocar as opções, edite a aba Listas.'),
         ('Grupo impactado e o que muda', 'Quem sente o impacto e o que passa a ser diferente no dia a dia.'),
         ('Grau (1 a 5) e pessoas', 'Tamanho do impacto para o grupo: 1 = baixo, 5 = muito alto. E quantas pessoas são afetadas.'),
         ('Ação de mudança e responsável', 'O que será feito para o grupo atravessar o impacto e quem responde.')],
        [('Classificação', 'Grau 4 ou 5: Alto. Grau 3: Médio. Grau 1 ou 2: Baixo.'),
         ('Indicadores do Painel', 'Impactos mapeados = linhas preenchidas. Impactos altos = linhas com classificação Alto. Pessoas impactadas = soma da coluna Pessoas (um grupo que aparece em duas linhas conta duas vezes). Grau médio = média simples dos graus.'),
         ('Por área', 'Para cada área da lista: número de impactos, quantos são altos, soma de pessoas e média dos graus.'),
         ('Mapa de calor', 'Número de impactos em cada cruzamento de área e tipo. A cor segue a contagem: 1, 2, de 3 a 4 e 5 ou mais.')],
        niveis=[(nome, (fundo, cor), txt) for (nome, fundo, cor), txt in zip(CLASSES, ['Grau 4 ou 5.', 'Grau 3.', 'Grau 1 ou 2.'])],
        aviso=('Como ler', 'Área com muitos impactos altos e muitas pessoas pede plano próprio e gestores preparados antes das equipes. '
                           'Impacto de papel e de competência costuma gerar mais resistência do que impacto só de sistema.'),
    )

    # ------------------------------------------------------------ lista
    a = p.aba('Lista de impactos', 'entrada')
    n = 60
    cols = [
        Col('proc', 'Processo ou atividade', 26),
        Col('area', 'Área', 14, valida=lista('=' + fx_lista(0, VAGAS_IMP), 'Área', 'Escolha a área na lista. Para trocar as opções, edite a aba Listas.',
                                             'Escolha uma área da lista. Para incluir outra, edite a aba Listas.')),
        Col('grupo', 'Grupo impactado', 21),
        Col('tipo', 'Tipo de impacto', 14, valida=lista('=' + fx_lista(1, VAGAS_IMP), 'Tipo de impacto', 'Escolha o tipo na lista. Para trocar as opções, edite a aba Listas.',
                                                        'Escolha um tipo da lista. Para incluir outro, edite a aba Listas.')),
        Col('muda', 'O que muda', 38),
        Col('grau', 'Grau\n(1 a 5)', 9, alinha='center', num='0', valida=inteiro(1, 5, 'Grau do impacto', '1 = baixo. 3 = médio. 5 = muito alto.', NOTA_1A5)),
        Col('pes', 'Pessoas', 10, alinha='right', num='0', valida=inteiro(0, None, 'Pessoas', 'Número de pessoas do grupo afetadas por este impacto.')),
        Col('classe', 'Classificação', 12.5, 'calc', estilo=dict(cor=TINTA),
            formula='=IF({grau}{r}="","",IF({grau}{r}>=4,"Alto",IF({grau}{r}=3,"Médio","Baixo")))', nota='Grau 4 ou 5: Alto. Grau 3: Médio. Grau 1 ou 2: Baixo.'),
        Col('acao', 'Ação de mudança', 36),
        Col('resp', 'Responsável', 17),
        Col('m', '', 2, 'vazio'),
    ]
    ult = a.prepara(cols)
    lin = a.faixa('Impactos', 'Lista de impactos da mudança', 'Uma linha por impacto. Grau de 1 (baixo) a 5 (muito alto). O Painel se atualiza sozinho.', ult)
    a.legenda(lin, 'Classificação: grau 4 ou 5 = Alto · grau 3 = Médio · grau 1 ou 2 = Baixo. Áreas e tipos vêm da aba Listas.', (4, 10),
              [(2, 2, 'Preencher', 'entrada'), (3, 3, 'Calculado', 'calc')], rotulo=1)
    a.altura(lin + 1, 6)
    dados = [
        ('Lançamento de notas fiscais', 'Financeiro', 'Analistas de contas a pagar', 'Sistema', 'Lançamento passa a ser feito no novo sistema, com validação automática.', 4, 18, 'Prática guiada e apoio no posto na primeira semana.', 'Líder de capacitação'),
        ('Aprovação de pagamentos', 'Financeiro', 'Coordenadores', 'Papel', 'Aprovação sai do e-mail e passa a ter alçadas no sistema.', 3, 6, 'Comunicar novas alçadas e treinar aprovadores.', 'Gestão da mudança'),
        ('Pedido de compra', 'Suprimentos', 'Compradores', 'Processo', 'Requisição obrigatória antes do pedido.', 5, 12, 'Patrocinador explica o porquê; gestores acompanham exceções.', 'Patrocinador'),
        ('Reposição de loja', 'Operações', 'Supervisores de loja', 'Indicador', 'Meta de ruptura passa a ser acompanhada por loja, toda semana.', 4, 42, 'Roteiro de conversa para gestores e painel semanal.', 'Gestores diretos'),
        ('Cadastro de clientes', 'Comercial', 'Vendas internas', 'Sistema', 'Cadastro único, com campos obrigatórios.', 2, 25, 'Guia rápido e vídeo curto.', 'Líder de capacitação'),
        ('Atendimento ao cliente', 'Operações', 'Atendimento', 'Competência', 'Atendente passa a resolver casos que antes escalava.', 5, 60, 'Trilha de capacitação e mentoria entre pares.', 'Gestão da mudança'),
        ('Fechamento mensal', 'Financeiro', 'Controladoria', 'Processo', 'Calendário de fechamento reduzido em dois dias.', 3, 9, 'Ensaio do fechamento antes da virada.', 'Líder do processo'),
        ('Suporte a usuários', 'TI', 'Equipe de suporte', 'Estrutura', 'Novo modelo de suporte, com apoio reforçado após o go-live.', 3, 8, 'Treinar a equipe e combinar critérios de saída.', 'TI'),
    ]
    t = a.tabela(lin + 2, 1, cols, n, dados, alt_cab=36, alt=30)
    a.condicional(t.lin0, t.col['classe'], t.linN, t.col['classe'], CLASSES)
    for nota, fundo, cor in ((5, AZ, BR), (4, AZS, TINTA)):
        a.ws.conditional_format(t.lin0, t.col['grau'], t.linN, t.col['grau'], {
            'type': 'cell', 'criteria': '==', 'value': nota, 'format': p.dxf(fundo=fundo, cor=cor, negrito=True)})
    fim = a.rodape(t.linN + 2, ult)
    a.imprime(fim, ult, repete=t.lin_cab)
    a.abre_em(congela=(t.lin0, 2), celula=(t.lin0, 1), zoom=90)

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Dashboard de impactos', 'Onde a mudança pesa mais, por área e por tipo. Atualiza sozinho a partir da Lista de impactos.', ultp)
    d.altura(lin, 14)
    f_proc, f_area, f_tipo, f_grau, f_pes, f_classe = (t.faixa(k) for k in ('proc', 'area', 'tipo', 'grau', 'pes', 'classe'))
    n_imp = f'COUNTA({f_proc})'
    n_alto = f'COUNTIF({f_classe},"Alto")'
    lin = d.cartoes(lin + 1, [
        ('Impactos mapeados', f'={n_imp}', 'linhas preenchidas na lista'),
        ('Impactos altos', f'={n_alto}', f'=IF({n_imp}=0,"grau 4 ou 5",ROUND(100*{n_alto}/{n_imp},0)&"% dos impactos, com grau 4 ou 5")'),
        ('Pessoas impactadas', f'=SUM({f_pes})', 'soma da coluna Pessoas'),
        ('Grau médio', f'=IFERROR(AVERAGE({f_grau}),"–")', 'média dos graus, de 1 a 5', dict(num='0.0')),
    ])
    d.altura(lin, 16)
    topo = lin + 1
    # por área (esquerda)
    d.secao(topo, 1, 'Por área', 'Impactos, impactos altos, pessoas e grau médio de cada área da lista.')
    ta = topo + 3                                     # primeira linha de dados
    _cab(d, topo + 2, [(1, 2, 'Área', 'left'), (3, 3, 'Impactos', 'right'), (4, 4, 'Altos', 'right'), (5, 5, 'Pessoas', 'right'), (6, 6, 'Grau médio', 'right')])
    for i in range(VAGAS_IMP):
        l, r = ta + i, ta + i + 1
        d.altura(l, 23)
        d.mescla(l, 1, l, 2, f'=IF({item_lista(0, i)}="","",{item_lista(0, i)})', **d.e_linha())
        d.formula(l, 3, f'=IF($B{r}="","",COUNTIF({f_area},$B{r}))', **d.e_linha('right', '0'))
        d.formula(l, 4, f'=IF($B{r}="","",COUNTIFS({f_area},$B{r},{f_classe},"Alto"))', **d.e_linha('right', '0', negrito=True, cor=AZP))
        d.formula(l, 5, f'=IF($B{r}="","",SUMIF({f_area},$B{r},{f_pes}))', **d.e_linha('right', '0'))
        d.formula(l, 6, f'=IF($B{r}="","",IFERROR(AVERAGEIF({f_area},$B{r},{f_grau}),""))', **d.e_linha('right', '0.0'))
    base = ta + VAGAS_IMP - 1
    # mapa de calor (abaixo): área x tipo, com totais
    d.altura(base + 1, 14)
    hm = base + 2
    d.secao(hm, 1, 'Mapa de calor: área x tipo', 'Número de impactos em cada cruzamento. Quanto mais profundo o azul, mais impactos.')
    hc = hm + 2                                       # cabeçalho do mapa
    d.altura(hc, 30)
    d.mescla(hc, 1, hc, 2, 'Área', **d.e_cab())
    for k in range(VAGAS_IMP):
        d.formula(hc, 3 + k, f'=IF({item_lista(1, k)}="","",{item_lista(1, k)})', **d.e_cab('center'))
    d.texto(hc, 11, 'Total', **d.e_cab('center'))
    d.condicional_formula(hc, 3, hc, 10, f'={ref(hc, 3)}=""', fundo=BR)
    for i in range(VAGAS_IMP):
        l, r = hc + 1 + i, hc + 2 + i
        d.altura(l, 25)
        d.mescla(l, 1, l, 2, f'=IF({item_lista(0, i)}="","",{item_lista(0, i)})', **d.e_linha(borda=BR))
        for k in range(VAGAS_IMP):
            c = letra(3 + k)
            d.formula(l, 3 + k, f'=IF(OR($B{r}="",{c}${hc + 1}=""),"",COUNTIFS({f_area},$B{r},{f_tipo},{c}${hc + 1}))',
                      alinha='center', num='0;;;', negrito=True, borda=BR)
        d.formula(l, 11, f'=IF($B{r}="","",COUNTIF({f_area},$B{r}))', alinha='center', num='0;;;', negrito=True, cor=AZP, borda=BR)
    lt = hc + 1 + VAGAS_IMP
    d.altura(lt, 25)
    d.mescla(lt, 1, lt, 2, 'Total', negrito=True, cor=AZP, recuo=1, acima=AZP)
    for k in range(VAGAS_IMP):
        c = letra(3 + k)
        d.formula(lt, 3 + k, f'=IF({c}${hc + 1}="","",COUNTIF({f_tipo},{c}${hc + 1}))', alinha='center', num='0;;;', negrito=True, cor=AZP, acima=AZP)
    d.formula(lt, 11, f'={n_imp}', alinha='center', num='0;;;', negrito=True, cor=AZP, acima=AZP)
    a1 = ref(hc + 1, 3)
    for cond, fundo, cor in ((f'{a1}>=5', AZP, BR), (f'{a1}>=3', AZ, BR), (f'{a1}=2', AZS, TINTA), (f'{a1}=1', AZC, TINTA)):
        d.ws.conditional_format(hc + 1, 3, hc + VAGAS_IMP, 10, {'type': 'formula', 'criteria': f'=AND(ISNUMBER({a1}),{cond})',
                                                               'format': p.dxf(fundo=fundo, cor=cor), 'stop_if_true': True})
    d.altura(lt + 1, 8)
    d.altura(lt + 2, 21)
    d.texto(lt + 2, 1, 'Impactos por célula', cor=CZ, tam=T_NOTA, negrito=True)
    for j, (rot, fundo, cor) in enumerate([('1', AZC, TINTA), ('2', AZS, TINTA), ('3 a 4', AZ, BR), ('5 ou mais', AZP, BR)]):
        d.texto(lt + 2, 3 + j, rot, fundo=fundo, cor=cor, negrito=True, tam=T_NOTA, alinha='center', borda=BR)
    # gráficos (direita do bloco por área): pessoas por área e impactos por tipo
    ch = novo_grafico(p, 'bar', 'Pessoas por área')
    ch.add_series({'name': 'Pessoas', 'categories': [d.nome, ta, 1, base, 1], 'values': [d.nome, ta, 5, base, 5], 'gap': 40,
                   'fill': {'color': AZ}, 'data_labels': rotulos(tam=10, posicao='outside_end')})
    ch.set_y_axis(eixo_categorias(inverte=True, line={'none': True}))
    ch.set_x_axis(eixo_oculto())
    d.grafico(ch, topo, 7, base, 9, 'Barras com a soma de pessoas impactadas em cada área.')
    ch = novo_grafico(p, 'bar', 'Impactos por tipo')
    ch.add_series({'name': 'Impactos', 'categories': [d.nome, hc, 3, hc, 10], 'values': [d.nome, lt, 3, lt, 10], 'gap': 40,
                   'fill': {'color': AZP}, 'data_labels': rotulos(tam=10, posicao='outside_end')})
    ch.set_y_axis(eixo_categorias(inverte=True, line={'none': True}))
    ch.set_x_axis(eixo_oculto())
    d.grafico(ch, topo, 10, base, 12, 'Barras com o número de impactos de cada tipo.')
    lin = lt + 3
    d.altura(lin, 12)
    lin = d.tira(lin + 1, 'Como ler', [
        'Área com muitos impactos altos e muitas pessoas pede plano próprio e gestores preparados antes das equipes.',
        'Impacto de papel e de competência costuma gerar mais resistência do que impacto só de sistema.',
        'Cruzamentos em azul profundo no mapa de calor concentram mudança: confira a carga dessa área antes de definir o calendário.'])
    fim = d.rodape(lin + 1, ultp)
    d.imprime(fim, ultp, uma_pagina=True)
    d.abre_em()
    _listas(p, 'As áreas e os tipos de impacto que aparecem nas listas suspensas e no Painel.',
            [('Áreas', AREAS), ('Tipos de impacto', TIPOS)],
            ['Troque pelas áreas e pelos tipos de impacto do seu projeto. As listas suspensas da Lista de impactos e as tabelas e os gráficos do Painel acompanham.',
             'Há espaço para oito itens em cada lista. Preencha de cima para baixo, sem pular linhas.',
             'Se trocar um nome já usado na Lista de impactos, corrija também as linhas que usavam o nome antigo.'],
            vagas=VAGAS_IMP)
    p.salvar()


# ====================================================================== indicadores
# (grupo, indicador, definição, fórmula em palavras, fonte do dado, unidade, meta, sentido, responsável, valores de exemplo)
INDICADORES = [
    ('Prontidão', 'Cobertura de comunicação', 'Parcela do público-alvo alcançada pelas mensagens-chave da mudança.',
     'Pessoas alcançadas ÷ pessoas previstas no plano de comunicação', 'Plano de comunicação e registros de alcance', '%', 90, 'Maior é melhor', 'Gestão da mudança',
     [45, 62, 78, 86, 91, 93]),
    ('Prontidão', 'Patrocínio ativo', 'Parcela das ações combinadas com os patrocinadores que foi realizada.',
     'Ações de patrocínio realizadas ÷ ações previstas', 'Agenda dos patrocinadores', '%', 80, 'Maior é melhor', 'Patrocinador',
     [50, 58, 67, 75, 83, 85]),
    ('Prontidão', 'Índice de prontidão', 'Parcela das pessoas impactadas que se declara pronta para a mudança.',
     'Respostas favoráveis ÷ total de respostas da pesquisa de prontidão', 'Pesquisa curta de prontidão', '%', 75, 'Maior é melhor', 'Gestão da mudança',
     [38, 46, 57, 66, 74, 79]),
    ('Capacitação', 'Cobertura de treinamento', 'Parcela das pessoas previstas que concluiu a capacitação.',
     'Pessoas treinadas ÷ pessoas previstas', 'Plano de treinamentos e listas de presença', '%', 95, 'Maior é melhor', 'Líder de capacitação',
     [10, 34, 61, 82, 93, 96]),
    ('Capacitação', 'Aproveitamento do treinamento', 'Parcela dos participantes que atingiu a nota mínima na avaliação de aprendizagem.',
     'Participantes aprovados ÷ participantes avaliados', 'Avaliações de aprendizagem', '%', 80, 'Maior é melhor', 'Líder de capacitação',
     [None, 71, 74, 78, 81, 83]),
    ('Adoção', 'Uso efetivo', 'Parcela dos usuários previstos que usa a solução no período.',
     'Usuários ativos ÷ usuários previstos', 'Registros de uso do sistema', '%', 85, 'Maior é melhor', 'TI',
     [None, None, None, 52, 68, 81]),
    ('Adoção', 'Índice de adoção', 'Parcela das pessoas impactadas que já usa a mudança na rotina ou ensina os colegas.',
     'Pessoas que adotam ou multiplicam ÷ total de pessoas impactadas', 'Matriz de adoção', '%', 70, 'Maior é melhor', 'Gestão da mudança',
     [None, None, None, 20, 32, 56]),
    ('Adoção', 'Proficiência', 'Parcela dos usuários que executa as tarefas no padrão esperado, sem ajuda.',
     'Usuários proficientes ÷ usuários avaliados', 'Observação dos gestores e indicadores do processo', '%', 75, 'Maior é melhor', 'Gestores diretos',
     [None, None, None, 31, 48, 64]),
    ('Resultado', 'Chamados de suporte por usuário', 'Volume de pedidos de ajuda em relação ao número de usuários ativos.',
     'Chamados abertos no período ÷ usuários ativos', 'Central de suporte', 'número', 0.5, 'Menor é melhor', 'TI',
     [None, None, None, 1.8, 1.1, 0.6]),
    ('Resultado', 'Satisfação com a mudança', 'Nota média da pesquisa de satisfação com a mudança.',
     'Soma das notas ÷ número de respostas', 'Pesquisa de satisfação', 'nota 1 a 5', 4, 'Maior é melhor', 'Gestão da mudança',
     [3.1, 3.3, 3.4, 3.2, 3.6, 3.9]),
    ('Resultado', 'Benefício realizado', 'Parcela do benefício previsto no caso de negócio que já foi capturada.',
     'Benefício capturado ÷ benefício previsto', 'Acompanhamento do caso de negócio', '%', 60, 'Maior é melhor', 'Patrocinador',
     [None, None, None, 8, 22, 41]),
]
SITUACOES = [('Crítico', AZP, BR), ('Em atenção', AZ, BR), ('Na meta', AZS, TINTA)]
GERAL = 'General'                    # formato numérico sem casas fixas (45, 0,5, 3,9)


def indicadores(saida=None, valores=None, exemplo=True):
    p = _pasta(saida, 'painel-de-indicadores-da-mudanca.xlsx', 'Painel de indicadores da mudança',
               'Ficha dos indicadores, dados por período e painel com meta, atingimento, variação e situação', valores, exemplo)
    como_usar(
        p, 'Indicadores', 'Painel de indicadores da mudança',
        'Acompanha, mês a mês, se a mudança está acontecendo: prontidão, capacitação, adoção e resultado, sempre contra a meta.',
        [('Defina os indicadores', 'Na aba Indicadores, registre a ficha de cada um: grupo, definição, fórmula em palavras, fonte, unidade, meta, sentido e responsável.'),
         ('Lance os valores', 'Na aba Dados, digite o valor de cada indicador em cada mês. Deixe em branco o que ainda não foi medido.'),
         ('Leia o Painel', 'Para cada indicador: último valor, meta, atingimento, variação contra a medição anterior e situação. Escolha os quatro indicadores dos cartões.'),
         ('Aja sobre o que está fora da meta', 'Comece pelos críticos. Leve o painel ao comitê do projeto com a ação combinada para cada um.')],
        [('Ficha do indicador', 'Grupo, nome, definição, fórmula em palavras, fonte do dado, frequência e responsável. Uma linha por indicador, até 14.'),
         ('Unidade', '% para percentuais (digite 45 para 45%), número ou nota. Os valores e a meta usam a mesma unidade.'),
         ('Meta e sentido', 'A meta do período e se o indicador melhora quando sobe (Maior é melhor) ou quando desce (Menor é melhor).'),
         ('Valores por mês', 'Na aba Dados, de Mês 1 a Mês 12. Os nomes dos meses no cabeçalho podem ser trocados.')],
        [('Último valor', 'O valor do último mês preenchido na linha do indicador. Meses em branco à direita são ignorados.'),
         ('Variação', 'Último valor − valor da medição anterior (o mês preenchido imediatamente antes). No Painel aparece com ▲ quando sobe, ▼ quando desce e = quando não muda. Em percentuais, a diferença é em pontos percentuais (p.p.).'),
         ('Atingimento', 'Último valor ÷ meta. Quando menor é melhor, a conta se inverte: meta ÷ último valor.'),
         ('Situação', 'Atingimento arredondado para percentual inteiro. 100% ou mais: Na meta. De 85% a 99%: Em atenção. Abaixo de 85%: Crítico.')],
        niveis=[(nome, (fundo, cor), txt) for (nome, fundo, cor), txt in zip(SITUACOES, [
            'Atingimento abaixo de 85%.', 'Atingimento de 85% a 99%.', 'Atingimento de 100% ou mais.'])],
        aviso=('Sobre o exemplo', 'Os dados são fictícios e servem só para mostrar o funcionamento. No exemplo, o go-live acontece no Mês 4: '
                                  'os indicadores de adoção e de resultado só começam a ser medidos a partir daí.'),
    )
    n = 14

    # ------------------------------------------------------------ ficha dos indicadores
    f = p.aba('Indicadores', 'entrada')
    numero = {'validate': 'decimal', 'criteria': 'between', 'minimum': -1e12, 'maximum': 1e12,
              'input_title': 'Meta', 'input_message': 'A meta do indicador, na mesma unidade dos valores. Para percentuais, digite 90 para 90%.',
              'error_title': 'Valor inválido', 'error_message': 'Digite um número.'}
    cols = [
        Col('num', 'Nº', 5, 'calc', 'center', '0', formula='=IF({nome}{r}="","",COUNTA({nome}${r0}:{nome}{r}))'),
        Col('grupo', 'Grupo', 13, valida=lista(['Prontidão', 'Capacitação', 'Adoção', 'Resultado'], 'Grupo',
                                               'Prontidão, Capacitação, Adoção ou Resultado. Se precisar, digite outro grupo.', bloqueia=False)),
        Col('nome', 'Indicador', 27, estilo=dict(negrito=True)),
        Col('defin', 'Definição', 36),
        Col('conta', 'Fórmula em palavras', 34),
        Col('fonte', 'Fonte do dado', 25),
        Col('freq', 'Frequência', 12, valida=lista(['Semanal', 'Quinzenal', 'Mensal', 'Trimestral'], 'Frequência',
                                                   'De quanto em quanto tempo o indicador é medido.', bloqueia=False)),
        Col('un', 'Unidade', 11, valida=lista(['%', 'número', 'nota 1 a 5'], 'Unidade',
                                              '% para percentuais (digite 45 para 45%), número ou nota de 1 a 5. Se precisar, digite outra unidade.', bloqueia=False)),
        Col('meta', 'Meta', 9, alinha='right', num=GERAL, valida=numero),
        Col('sent', 'Sentido', 15, valida=lista(['Maior é melhor', 'Menor é melhor'], 'Sentido', 'Maior é melhor: o indicador melhora quando sobe. Menor é melhor: melhora quando desce.')),
        Col('resp', 'Responsável', 18),
        Col('m', '', 2, 'vazio'),
    ]
    ult = f.prepara(cols)
    lin = f.faixa('Indicadores', 'Ficha dos indicadores', 'O que cada indicador mede, como é calculado, de onde vem o dado, qual é a meta e quem responde.', ult)
    f.legenda(lin, 'Uma linha por indicador. A aba Dados e o Painel leem os nomes, as unidades, as metas e os sentidos daqui.', (5, 11),
              [(3, 3, 'Preencher', 'entrada'), (4, 4, 'Calculado', 'calc')], rotulo=2)
    f.altura(lin + 1, 6)
    dados = [(g, nome, defin, conta, fonte, 'Mensal', un, meta, sent, resp) for g, nome, defin, conta, fonte, un, meta, sent, resp, _ in INDICADORES]
    tf = f.tabela(lin + 2, 1, cols, n, dados, alt_cab=30, alt=34)
    fim = f.rodape(tf.linN + 2, ult)
    f.imprime(fim, ult, repete=tf.lin_cab)
    f.abre_em(congela=(tf.lin0, 4), celula=(tf.lin0, 2), zoom=90)

    # ------------------------------------------------------------ dados por período
    a = p.aba('Dados', 'entrada')
    valor = {'validate': 'decimal', 'criteria': 'between', 'minimum': -1e12, 'maximum': 1e12,
             'input_title': 'Valor do mês', 'input_message': 'Digite o valor medido, na unidade do indicador. Deixe em branco se ainda não houve medição.',
             'error_title': 'Valor inválido', 'error_message': 'Digite um número ou deixe a célula em branco.'}
    # cada linha de Dados lê a linha de mesma posição na ficha (as duas tabelas têm o mesmo número de linhas)
    da_ficha = lambda chave: '=IF(INDEX(%s,{r}-{r0}+1)="","",INDEX(%s,{r}-{r0}+1))' % (tf.faixa(chave), tf.faixa(chave))
    meses = '{m1}{r}:{m12}{r}'
    posicao = '(COLUMN(%s)-COLUMN({m1}{r})+1)' % meses
    cols = [
        Col('nome', 'Indicador', 30, 'calc', estilo=dict(cor=TINTA, negrito=True), formula=da_ficha('nome')),
        Col('un', 'Unidade', 10, 'calc', formula=da_ficha('un')),
        Col('meta', 'Meta', 8, 'calc', 'right', GERAL, formula=da_ficha('meta')),
        Col('sent', 'Sentido', 14, 'calc', formula=da_ficha('sent')),
    ]
    cols += [Col(f'm{k}', f'Mês {k}', 7.5, alinha='right', num=GERAL, valida=valor) for k in range(1, 13)]
    cols += [
        Col('umes', 'Último mês', 9.5, 'calc', sub='último mês preenchido',
            formula='=IF({pos}{r}=0,"",INDEX(${m1}${rc}:${m12}${rc},{pos}{r}))', nota='O nome do último mês com valor na linha.'),
        Col('ult', 'Último valor', 9.5, 'calc', 'right', GERAL, estilo=dict(cor=AZP, negrito=True), sub='valor desse mês',
            formula='=IF({pos}{r}=0,"",INDEX(%s,{pos}{r}))' % meses, nota='O valor do último mês preenchido na linha.'),
        Col('ant', 'Valor anterior', 9.5, 'calc', 'right', GERAL, sub='medição anterior',
            formula='=IF({pos2}{r}=0,"",INDEX(%s,{pos2}{r}))' % meses, nota='O valor do mês preenchido imediatamente antes do último.'),
        Col('var', 'Variação', 10, 'calc', 'right', '+0.0;-0.0;0.0', sub='último − anterior',
            formula='=IF(OR({ult}{r}="",{ant}{r}=""),"",{ult}{r}-{ant}{r})', nota='Último valor − valor anterior.'),
        Col('ating', 'Atingimento', 12, 'calc', 'right', '0%', estilo=dict(cor=TINTA), sub='valor ÷ meta ou meta ÷ valor',
            formula='=IF(OR({ult}{r}="",{meta}{r}="",{meta}{r}=0),"",IF({sent}{r}="Menor é melhor",IF({ult}{r}<=0,1,{meta}{r}/{ult}{r}),{ult}{r}/{meta}{r}))',
            nota='Último valor ÷ meta. Quando menor é melhor, a conta se inverte: meta ÷ último valor.'),
        Col('situ', 'Situação', 12, 'calc', estilo=dict(cor=TINTA), sub='≥ 100% · ≥ 85% · < 85%',
            formula='=IF({ating}{r}="","",IF(ROUND({ating}{r},2)>=1,"Na meta",IF(ROUND({ating}{r},2)>=0.85,"Em atenção","Crítico")))',
            nota='Atingimento de 100% ou mais: Na meta. De 85% a 99%: Em atenção. Abaixo de 85%: Crítico.'),
        Col('m', '', 2, 'vazio'),
        Col('pos', 'Posição do último mês', 8, 'apoio', formula='=SUMPRODUCT(MAX(ISNUMBER(%s)*%s))' % (meses, posicao)),
        Col('pos2', 'Posição do mês anterior', 8, 'apoio',
            formula='=IF({pos}{r}<=1,0,SUMPRODUCT(MAX(ISNUMBER(%s)*%s*(%s<{pos}{r}))))' % (meses, posicao, posicao)),
    ]
    ult = a.prepara(cols)
    lin = a.faixa('Indicadores', 'Dados por período', 'O valor de cada indicador em cada mês. Os nomes, as unidades, as metas e os sentidos vêm da aba Indicadores.', ult)
    a.legenda(lin, 'Digite o valor de cada mês, na unidade do indicador (45 para 45%), e deixe em branco o que ainda não foi medido. '
                   'Os valores já preenchidos são um exemplo fictício, com go-live no Mês 4.', (5, 22),
              [(2, 3, 'Preencher', 'entrada'), (4, 4, 'Calculado', 'calc')], rotulo=1)
    a.altura(lin + 1, 6)
    dados = [tuple(vals + [None] * (12 - len(vals))) for *_, vals in INDICADORES]
    t = a.tabela(lin + 2, 1, cols, n, dados, alt_cab=31, alt=26, alt_sub=29)
    assert t.n == tf.n
    a.condicional(t.lin0, t.col['situ'], t.linN, t.col['situ'], SITUACOES)
    # percentuais sem casa decimal na variação
    a.ws.conditional_format(t.lin0, t.col['var'], t.linN, t.col['var'], {
        'type': 'formula', 'criteria': f'=${t.L["un"]}{t.r0}="%"', 'format': p.wb.add_format({'num_format': '+0"   ";-0"   ";0"   "'})})
    a.barra(t.lin0, t.col['ating'], t.linN, t.col['ating'], 1)
    fim = a.rodape(t.linN + 2, ult)
    a.imprime(fim, ult, repete=(t.lin_cab, t.lin_cab + 1))
    a.abre_em(congela=(t.lin0, 2), celula=(t.lin0, t.col['m1']), zoom=90)

    # ------------------------------------------------------------ painel
    d = p.aba('Painel', 'painel')
    ultp = d.grade()
    lin = d.faixa('Painel', 'Painel de indicadores da mudança', 'Último valor, meta, atingimento, variação e situação de cada indicador. Atualiza sozinho a partir da aba Dados.', ultp)
    d.altura(lin, 14)
    D = a.prefixo
    fx = {k: t.faixa(k) for k in ('nome', 'un', 'meta', 'ult', 'var', 'ating', 'situ', 'umes')}
    # cartões: o indicador de cada um é escolhido na lista suspensa
    c0 = lin + 1
    for l, h in ((c0, 25), (c0 + 1, 38), (c0 + 2, 17), (c0 + 3, 17), (c0 + 4, 5), (c0 + 5, 21)):
        d.altura(l, h)
    escolha = lista('=' + tf.faixa('nome'), 'Indicador do cartão', 'Escolha o indicador que este cartão mostra.', 'Escolha um indicador da lista.')
    padrao = ['Índice de adoção', 'Uso efetivo', 'Índice de prontidão', 'Cobertura de treinamento']
    for k in range(4):
        c = 1 + 3 * k
        sel = ref(c0, c, fixa=True)
        pega = lambda chave, sel=sel: f'INDEX({fx[chave]},MATCH({sel},{fx["nome"]},0))'
        casas = f'IF({pega("un")}="%",0,1)'
        sufixo = f'IF({pega("un")}="%","%","")'
        d.mescla(c0, c, c0, c + 1, padrao[k] if p.exemplo else None, fundo=AZC, cor=AZP, negrito=True, recuo=1, acima=(AZ, 2), borda=BR)
        d.ws.data_validation(c0, c, c0, c + 1, escolha)
        d.mescla(c0 + 1, c, c0 + 1, c + 2, f'=IFERROR(IF({pega("ult")}="","–",FIXED({pega("ult")},{casas},TRUE)&{sufixo}),"–")',
                 fonte=SERIFA, cor=AZP, tam=24, alinha='left')
        d.mescla(c0 + 2, c, c0 + 2, c + 2,
                 f'=IFERROR(IF({pega("meta")}="","sem meta definida","meta "&FIXED({pega("meta")},{casas},TRUE)&{sufixo}'
                 f'&IF({pega("ating")}="",""," · atingimento "&ROUND(100*{pega("ating")},0)&"%")),"escolha um indicador na célula azul")', cor=CZ, tam=T_NOTA)
        d.mescla(c0 + 3, c, c0 + 3, c + 2,
                 f'=IFERROR(IF({pega("var")}="",IF({pega("ult")}="","sem medição","primeira medição"),IF({pega("var")}>0,"▲ ",IF({pega("var")}<0,"▼ ","= "))'
                 f'&FIXED(ABS({pega("var")}),{casas},TRUE)&IF({pega("un")}="%"," p.p.","")&" contra a medição anterior"),"")', cor=TINTA, tam=T_NOTA)
        d.mescla(c0 + 5, c, c0 + 5, c + 1, f'=IFERROR({pega("situ")}&"","")', negrito=True, tam=T_CAB, alinha='center', cor=TINTA, borda=BR)
    d.condicional(c0 + 5, 1, c0 + 5, 12, SITUACOES)
    d.altura(c0 + 6, 14)
    # gráficos: evolução de quatro indicadores, direto das linhas da aba Dados
    g = c0 + 7
    for i in range(12):
        d.altura(g + i, 16)
    linha_de = {nome: t.lin0 + i for i, (_, nome, *_r) in enumerate(INDICADORES)}

    def evolucao(titulo, nomes, col, descricao):
        """Linhas com dois indicadores e as metas tracejadas. As metas ficam em
        doze células atrás do gráfico (uma coluna por indicador)."""
        ch = novo_grafico(p, 'line', titulo, legenda='bottom')
        meses_cab = [a.nome, t.lin_cab, t.col['m1'], t.lin_cab, t.col['m12']]
        for j, (nome, cor, onde) in enumerate(zip(nomes, (AZP, AZ), ('below', 'above'))):
            lr = linha_de[nome]
            origem = f'{D}${t.L["nome"]}${lr + 1}'
            d.formula(g + 1, col + 3 + j, f'=IF({origem}="","sem indicador",{origem})', cor=CZ, tam=T_NOTA)      # nome da série
            ch.add_series({'name': [d.nome, g + 1, col + 3 + j], 'categories': meses_cab,
                           'values': [a.nome, lr, t.col['m1'], lr, t.col['m12']], 'line': {'color': cor, 'width': 2.25},
                           'marker': {'type': 'circle', 'size': 5, 'fill': {'color': cor}, 'border': {'color': BR, 'width': 0.75}},
                           'data_labels': {'value': True, 'position': onde, 'num_format': '0', 'font': {'name': SEM_SERIFA, 'size': 9, 'color': cor}}})
        for j, (nome, cor) in enumerate(zip(nomes, (AZP, AZ))):
            lr = linha_de[nome]
            meta = f'{D}${t.L["meta"]}${lr + 1}'
            un = f'{D}${t.L["un"]}${lr + 1}'
            d.formula(g, col + 3 + j, f'="Meta "&{meta}&IF({un}="%","%","")', cor=CZ, tam=T_NOTA)
            for k in range(12):
                d.formula(g + k, col + 1 + j, f'=N({meta})', cor=CZ, tam=T_NOTA)
            ch.add_series({'name': [d.nome, g, col + 3 + j], 'categories': meses_cab, 'values': [d.nome, g, col + 1 + j, g + 11, col + 1 + j],
                           'line': {'color': cor, 'width': 1, 'dash_type': 'dash'}, 'marker': {'type': 'none'}})
        ch.set_x_axis(eixo_categorias(fonte=F_EIXO))
        ch.set_y_axis(eixo_valores(min=0, max=100, major_unit=20, num_format='0"%"'))
        d.grafico(ch, g, col, g + 11, col + 5, descricao)

    evolucao('Evolução do índice de adoção e do uso efetivo', ('Índice de adoção', 'Uso efetivo'), 1,
             'Linhas com a evolução mensal do índice de adoção e do uso efetivo, com as metas tracejadas.')
    evolucao('Prontidão x cobertura de treinamento', ('Índice de prontidão', 'Cobertura de treinamento'), 7,
             'Linhas com a evolução mensal do índice de prontidão e da cobertura de treinamento, com as metas tracejadas.')
    lin = g + 12
    d.altura(lin, 10)
    lin = d.tira(lin + 1, 'Como é calculado', [
        ('Último valor', 'O valor do último mês preenchido na linha do indicador.'),
        ('Variação', 'Último valor − medição anterior. Em %, a diferença é em p.p.'),
        ('Atingimento', 'Valor ÷ meta. Se menor é melhor: meta ÷ valor.'),
        ('Situação', '100% ou mais: Na meta. De 85% a 99%: Em atenção. Abaixo de 85%: Crítico.')])
    for i in range(3):                               # respiro onde cai a quebra de página na impressão
        d.altura(lin + i, 12)
    lin += 3
    # resumo de todos os indicadores
    f_situ = fx['situ']
    d.secao(lin, 1, 'Resumo dos indicadores')
    d.altura(lin + 1, 17)
    d.mescla(lin + 1, 1, lin + 1, 12, f'=COUNTIF({f_situ},"Na meta")&" na meta · "&COUNTIF({f_situ},"Em atenção")&" em atenção · "&COUNTIF({f_situ},"Crítico")&" críticos"',
             cor=CZ, tam=T_NOTA, valinha='top')
    lin += 2
    _cab(d, lin, [(1, 1, 'Grupo', 'left'), (2, 4, 'Indicador', 'left'), (5, 5, 'Unidade', 'left'), (6, 6, 'Meta', 'right'), (7, 7, 'Último mês', 'left'),
                  (8, 8, 'Último valor', 'right'), (9, 9, 'Variação', 'left'), (10, 10, 'Atingimento', 'right'), (11, 11, 'Situação', 'left'), (12, 12, 'Sentido', 'left')], alt=30)
    for i in range(n):
        l, r = lin + 1 + i, t.r0 + i
        cel = lambda chave, r=r: f'{D}${t.L[chave]}${r}'
        passa = lambda chave: f'=IF({cel(chave)}="","",{cel(chave)})'
        d.altura(l, 22)
        grupo = tf.cel('grupo', i, fixa=True)
        d.formula(l, 1, f'=IF({grupo}="","",{grupo})', **d.e_linha(cor=CZ, tam=T_CAB))
        d.mescla(l, 2, l, 4, passa('nome'), **d.e_linha(negrito=True))
        d.formula(l, 5, passa('un'), **d.e_linha(cor=CZ, tam=T_CAB))
        d.formula(l, 6, passa('meta'), **d.e_linha('right', GERAL))
        d.formula(l, 7, passa('umes'), **d.e_linha(cor=CZ, tam=T_CAB))
        d.formula(l, 8, passa('ult'), **d.e_linha('right', GERAL, negrito=True, cor=AZP))
        v = cel('var')
        d.formula(l, 9, f'=IF({v}="","",IF({v}>0,"▲ ",IF({v}<0,"▼ ","= "))&FIXED(ABS({v}),IF({cel("un")}="%",0,1),TRUE)&IF({cel("un")}="%"," p.p.",""))', **d.e_linha(tam=T_CAB))
        d.formula(l, 10, passa('ating'), **d.e_linha('right', '0%'))
        d.formula(l, 11, passa('situ'), **d.e_linha(negrito=True, tam=T_CAB))
        d.formula(l, 12, passa('sent'), **d.e_linha(cor=CZ, tam=T_NOTA))
    d.condicional(lin + 1, 11, lin + n, 11, SITUACOES)
    d.barra(lin + 1, 10, lin + n, 10, 1)
    fim = d.rodape(lin + n + 2, ultp)
    d.imprime(fim, ultp)
    d.abre_em(celula=(c0, 1))
    p.salvar()


MODELOS = [raci, influencia, adocao, diagnostico, riscos, treinamentos, adkar, impactos, indicadores]


# ====================================================================== geração
PERFIL_XCU = '''<?xml version="1.0" encoding="UTF-8"?>
<oor:items xmlns:oor="http://openoffice.org/2001/registry" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<item oor:path="/org.openoffice.Office.Calc/Formula/Load"><prop oor:name="OOXMLRecalcMode" oor:op="fuse"><value>0</value></prop></item>
</oor:items>
'''


def calcula(arquivos, pasta_tmp):
    """Abre os arquivos no LibreOffice (com recálculo forçado) e devolve, por
    arquivo, o valor de cada célula: {nome: {(aba, 'B8'): valor}}. Devolve None
    se o LibreOffice ou o openpyxl não estiverem disponíveis."""
    soffice = shutil.which('soffice') or shutil.which('libreoffice')
    try:
        import openpyxl
    except ImportError:
        openpyxl = None
    if not soffice or not openpyxl:
        return None
    perfil = os.path.join(pasta_tmp, 'perfil')
    os.makedirs(os.path.join(perfil, 'user'), exist_ok=True)
    with open(os.path.join(perfil, 'user', 'registrymodifications.xcu'), 'w', encoding='utf-8') as fh:
        fh.write(PERFIL_XCU)
    destino = os.path.join(pasta_tmp, 'calculado')
    os.makedirs(destino, exist_ok=True)
    try:
        subprocess.run([soffice, '--headless', f'-env:UserInstallation=file://{perfil}', '--convert-to', 'xlsx',
                        '--outdir', destino] + arquivos, check=True, capture_output=True, timeout=600)
    except (subprocess.SubprocessError, OSError):
        return None
    resultado = {}
    for caminho in arquivos:
        nome = os.path.basename(caminho)
        convertido = os.path.join(destino, nome)
        if not os.path.exists(convertido):
            return None
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')          # o openpyxl avisa que não lê barras de dados; aqui só importam os valores
            wb = openpyxl.load_workbook(convertido, data_only=True)
        valores = {}
        for ws in wb.worksheets:
            for linha in ws.iter_rows():
                for c in linha:
                    if c.value is not None:
                        valores[(ws.title, c.coordinate)] = c.value
        resultado[nome] = valores
    return resultado


def gera(saida=None, exemplo=True, cache=True, modelos=None):
    """Gera as planilhas. Devolve True se os resultados das fórmulas foram guardados."""
    saida = os.path.normpath(saida or SAIDA)
    os.makedirs(saida, exist_ok=True)
    modelos = modelos or MODELOS
    valores = None
    if cache:
        with tempfile.TemporaryDirectory(prefix='modelos-xlsx-') as tmp:
            bruto = os.path.join(tmp, 'bruto')
            os.makedirs(bruto)
            for f in modelos:
                f(bruto, None, exemplo)
            arquivos = sorted(os.path.join(bruto, nome) for nome in os.listdir(bruto) if nome.endswith('.xlsx'))
            valores = calcula(arquivos, tmp)
    for f in modelos:
        f(saida, valores, exemplo)
    return valores is not None


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Gera as planilhas-modelo do Laboratório.')
    ap.add_argument('--saida', help='pasta de saída (padrão: blog/assets/modelos)')
    ap.add_argument('--so', help='gera só as funções indicadas, separadas por vírgula (ex.: raci,riscos)')
    ap.add_argument('--sem-exemplo', action='store_true', help='gera sem os dados de exemplo')
    ap.add_argument('--sem-listas', action='store_true', help='gera também sem os itens das listas')
    ap.add_argument('--sem-cache', action='store_true', help='não grava os resultados das fórmulas')
    a = ap.parse_args()
    exemplo = None if a.sem_listas else (not a.sem_exemplo)
    escolhidos = [f for f in MODELOS if not a.so or f.__name__ in a.so.split(',')]
    com_cache = gera(a.saida, exemplo, not a.sem_cache, escolhidos)
    print('modelos gerados em', os.path.normpath(a.saida or SAIDA),
          '(com resultados guardados)' if com_cache else '(sem resultados guardados: calculados ao abrir)')
