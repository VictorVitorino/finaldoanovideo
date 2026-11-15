"""Gera o "Painel de indicadores da mudança" (blog/assets/modelos/painel-de-indicadores-da-mudanca.pptx).

Dez slides para o comitê: o que medir e por quê, o painel de uma página, a evolução dos indicadores,
a ficha de cada um, a leitura do período com as decisões pedidas e os próximos passos.
Usa os mesmos onze indicadores e os mesmos dados de exemplo da planilha-par (Mês 1 a Mês 6, go-live no Mês 4).
As instruções de uso de cada slide ficam nas anotações do orador.
Uso: python3 blog/_src/modelos_pptx_indicadores.py
"""
import sys

sys.dont_write_bytecode = True      # não deixa __pycache__ no repositório

from modelos_pptx_base import *     # noqa: E402,F403

POR_EXTENSO = ['nenhum', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze']
PERGUNTAS = {'Prontidão': 'As pessoas estão prontas?', 'Capacitação': 'Sabem fazer do jeito novo?',
             'Adoção': 'Estão usando na rotina?', 'Resultado': 'O negócio colheu o benefício?'}

def _meta(ind):
    """Texto da meta de um indicador (com "até" quando o menor valor é o melhor)."""
    return ('até ' if ind[4] else '') + fmt_ind(ind[3], ind[2])


def _serie(ind):
    """Série para o gráfico: percentuais como fração; None onde não há dado."""
    return [None if v is None else (v / 100 if ind[2] == '%' else v) for v in ind[5]]


def _painel_tendencia(s, x, y, w, h, ind, grupo=True, linhas_nome=1):
    sit, _ = situacao(ind[5][-1], ind[3], ind[4])
    pct = ind[2] == '%'
    escala = dict(fmt='0%', minimo=0, maximo=1, passo=0.5) if pct else dict(fmt='0.0', minimo=1, maximo=5, passo=2) if ind[2] == 'nota' else dict(fmt='0.0', minimo=0, maximo=2, passo=1)
    return tendencia(s, x, y, w, h, ind[1], [f'M{i}' for i in range(1, 7)], _serie(ind), ind[3] / 100 if pct else ind[3], fmt_ind(ind[5][-1], ind[2]), _meta(ind), sit,
                     ind[0] if grupo else None, linhas_nome, sem_dado='Antes do go-live' if ind[0] in ('Adoção', 'Resultado') else 'Sem dado', **escala)


def indicadores(pasta=None):
    d = Deck('Painel de indicadores da mudança', 'Modelo de painel para o comitê: onze indicadores de prontidão, capacitação, adoção e resultado, com meta, situação e evolução.',
             'gestão da mudança; indicadores; KPI; adoção; painel; comitê')
    inds = EX_INDICADORES
    sits = [situacao(i[5][-1], i[3], i[4]) for i in inds]
    conta = {k: sum(1 for st, _ in sits if st == k) for k in SITUACAO}
    por_nome = {i[1]: i for i in inds}
    grupos = list(PERGUNTAS)

    # 1 · capa
    d.capa('Painel de indicadores', 'Indicadores da mudança\vdo _[nome do projeto]_',
           'Onze indicadores em quatro grupos para acompanhar prontidão, capacitação, adoção e resultado, do preparo ao pós go-live.',
           'Painel de indicadores para o comitê. A planilha-par "Painel de indicadores da mudança" guarda os dados e faz as contas; este deck mostra a leitura.\n'
           'Os dados de exemplo são os mesmos da planilha: seis meses, com o go-live no Mês 4. Troque pelos seus (clique em cada gráfico e use "Editar dados") e reescreva os títulos com a sua conclusão.\n'
           'Situação de cada indicador pelo atingimento da meta: na meta (100% ou mais), em atenção (85% a 99%) e crítico (abaixo de 85%). '
           'A etiqueta fica mais escura quanto mais atenção o indicador pede, e sempre traz o nome da situação.', meta='[Comitê] · [período do painel]')

    # 2 · o que medir e por quê
    s = d.slide('O que medir', 'Quatro grupos de indicadores mostram, do preparo ao benefício, se a mudança vai virar resultado',
                'A árvore de indicadores. Os dois primeiros grupos antecipam: mostram, antes do go-live, se a mudança tem chance de pegar. Os dois últimos confirmam: mostram, depois, se pegou e se valeu.\n'
                'Use este slide para combinar com o comitê o que será acompanhado e por quê. Menos indicadores, com dono e fonte, valem mais do que uma lista longa.\n'
                'Se trocar um indicador, troque também a ficha (slides 7 e 8) e a planilha.')
    painel(s, MARGEM, Y_TOPO, UTIL, 0.66, [P('*A pergunta do comitê:* a mudança vai virar resultado?', tam=T_LEAD, cor=BR)], fundo=AZP, margem=0.28, my=0.1, ancora='meio')
    yg = Y_TOPO + 0.9
    for (x, w), g in zip(faixas(4), grupos):
        fio(s, x + w / 2, Y_TOPO + 0.66, x + w / 2, yg, AZP, 1.25)
        painel(s, x, yg, w, 1.05, [H(g, tam=20, entre=3), P(PERGUNTAS[g], tam=T_TAB, cor=CZ)], fundo=AZC, margem=0.2, my=0.08, ancora='meio')
        for k, ind in enumerate([i for i in inds if i[0] == g]):
            y = yg + 1.2 + k * 0.46
            texto(s, x, y, w - 0.95, 0.46, ind[1], tam=T_TAB, cor=TINTA, ancora='meio')
            texto(s, x + w - 0.95, y, 0.95, 0.46, 'meta ' + _meta(ind), tam=T_ROTULO, cor=CZ, alinh='dir', ancora='meio')
            fio(s, x, y + 0.46, x + w, y + 0.46, LIN, 0.75)
    ya = yg + 1.2 + 3 * 0.46 + 0.28
    meio = MARGEM + UTIL / 2
    fio(s, MARGEM, ya, meio - 0.15, ya, AZS, 2); fio(s, meio + 0.15, ya, DIR, ya, AZP, 2)
    texto(s, MARGEM, ya + 0.1, UTIL / 2 - 0.3, 0.5, [P('*Antecipam:* mostram, antes do go-live, se a mudança tem chance de pegar.', tam=T_TAB, cor=CZ)])
    texto(s, meio + 0.15, ya + 0.1, UTIL / 2 - 0.15, 0.5, [P('*Confirmam:* mostram, depois do go-live, se pegou e se valeu.', tam=T_TAB, cor=CZ)])

    # 3 · painel de uma página
    d.secao('Painel e evolução')
    s = d.slide('Painel do período', f'No [Mês 6], [{POR_EXTENSO[conta["Na meta"]]}] indicadores estão na meta, [{POR_EXTENSO[conta["Em atenção"]]}] em atenção e [{POR_EXTENSO[conta["Crítico"]]}] são críticos',
                'O painel de uma página. À esquerda, os quatro indicadores dos cartões da planilha, com valor atual, situação, meta, atingimento e variação contra a medição anterior. '
                'À direita, o atingimento da meta dos onze indicadores (valor ÷ meta; nos indicadores em que menor é melhor, meta ÷ valor).\n'
                'Para atualizar: troque os valores dos cartões, ajuste a barra de cada um e use "Editar dados" no gráfico. Troque a cor da barra do gráfico quando a situação mudar: '
                'azul profundo para crítico, azul vivo para em atenção, azul suave para na meta.\n'
                'Os números vêm da aba de painel da planilha-par.', dica=EXEMPLO)
    xc, wc = col(0, 6)
    hc = (H_UTIL - 0.3) / 2
    for i, nome in enumerate(CARTOES_PAINEL):
        ind = por_nome[nome]
        sit, at = situacao(ind[5][-1], ind[3], ind[4])
        x, w = faixas(2, xc, wc - 0.2)[i % 2]
        cartao_indicador(s, x, Y_TOPO + (i // 2) * (hc + 0.3), w, hc, nome, fmt_ind(ind[5][-1], ind[2]), _meta(ind), sit, ind[0], at,
                         variacao=f'{ind[5][-1] - ind[5][-2]:+.0f} p.p. contra a medição anterior')
    xg, wg = col(6, 6)
    rotulo(s, xg, Y_TOPO + 0.02, wg, 'Atingimento da meta por indicador')
    g = grafico_barras(s, xg, Y_TOPO + 0.32, wg, 3.7, [i[1] for i in inds], [round(at, 3) for _, at in sits], horizontal=True, fmt='0%', maximo=1.3, vao=60, tam_rot=T_ROTULO + 1,
                       tam_cat=T_ROTULO, margens=(0.43, 0.0, 0.46, 1.0), nome='Gráfico: atingimento da meta por indicador',
                       descr='Barras com o atingimento da meta de cada um dos onze indicadores; a cor acompanha a situação.')
    serie = g.plots[0].series[0]
    for i, (sit, _) in enumerate(sits):      # a barra leva a cor da situação e o valor fica dentro dela, para não cruzar a linha dos 100%
        fundo, tinta = NIVEIS[SITUACAO[sit]]
        p = serie.points[i]; p.format.fill.solid(); p.format.fill.fore_color.rgb = rgb(fundo); p.format.line.fill.background()
        rotulo_ponto(serie, i, '0%', tinta, T_ROTULO + 1, XL_LABEL_POSITION.INSIDE_END)
    eixo = g.value_axis; eixo.major_unit = 1.0; eixo.has_major_gridlines = True      # a única linha de grade marca os 100% da meta
    eixo.major_gridlines.format.line.color.rgb = rgb(CZ); eixo.major_gridlines.format.line.width = Pt(0.75)
    legenda(s, xg, Y_TOPO + 4.08, [(NIVEIS[SITUACAO[k]][0], k) for k in ('Crítico', 'Em atenção', 'Na meta')])
    texto(s, xg + 3.6, Y_TOPO + 4.08, wg - 3.6, 0.24, 'Linha vertical: 100% da meta', tam=T_ROTULO, cor=CZ, alinh='dir', entre=0)

    # 4 · prontidão e capacitação
    s = d.slide('Prontidão e capacitação', 'O preparo está feito: os cinco indicadores cruzaram a meta entre o [Mês 5] e o [Mês 6]',
                'Os indicadores que antecipam a adoção, mês a mês, contra a meta (linha tracejada). Clique em cada gráfico e use "Editar dados".\n'
                'Em cada painel: o valor do último mês, a meta e a situação. Atualize os três junto com o gráfico.\n'
                'Se um destes indicadores estiver abaixo da meta perto do go-live, a adoção vai sentir: leve a causa e uma decisão ao comitê.', dica=EXEMPLO)
    for (x, w), ind in zip(faixas(5, calha=0.32), inds[:5]):
        _painel_tendencia(s, x, Y_TOPO, w, H_UTIL - 0.1, ind, linhas_nome=2)

    # 5 · adoção e uso
    s = d.slide('Adoção e uso', 'O uso chegou a [81%], mas só [56%] adotaram de fato',
                'Os três indicadores de adoção, que só existem a partir do go-live (Mês 4). Uso efetivo mostra quem acessa; índice de adoção, quem já trabalha do jeito novo; '
                'proficiência, quanto do trabalho sai certo.\n'
                'A distância entre uso e adoção é a mensagem: login não é adoção. Clique em cada gráfico e use "Editar dados".\n'
                'Definições: uso efetivo = usuários ativos ÷ usuários previstos; índice de adoção = pessoas em Adota ou Multiplica ÷ pessoas impactadas.', dica=EXEMPLO + ' Go-live no Mês 4.')
    for (x, w), ind in zip(faixas(3, calha=0.5), inds[5:8]):
        _painel_tendencia(s, x, Y_TOPO, w, H_UTIL - 0.1, ind, grupo=False)

    # 6 · resultado
    s = d.slide('Resultado', 'O benefício realizado está em [41%] do previsto: acompanha a adoção, não o uso',
                'Os três indicadores de resultado. Chamados de suporte por usuário: quanto menor, melhor (a meta é um teto). Satisfação: nota média de 1 a 5. '
                'Benefício realizado: parcela do benefício previsto no caso de negócio que já apareceu.\n'
                'Clique em cada gráfico e use "Editar dados". O benefício costuma seguir a adoção com atraso: mostre os dois juntos quando o comitê cobrar resultado.', dica=EXEMPLO + ' Go-live no Mês 4.')
    for (x, w), ind in zip(faixas(3, calha=0.5), inds[8:]):
        _painel_tendencia(s, x, Y_TOPO, w, H_UTIL - 0.1, ind, grupo=False)

    # 7 e 8 · ficha dos indicadores
    d.secao('Ficha dos indicadores')
    def ficha(titulo, lista, alt, dica):
        s = d.slide('Ficha dos indicadores', titulo,
                    'Ficha dos indicadores, como na planilha-par: definição, fórmula em palavras, fonte do dado, frequência e meta de cada um. '
                    'O responsável por cada indicador está na aba Indicadores da planilha.\n'
                    'Combine a ficha com quem fornece o dado antes de publicar o primeiro painel. Indicador sem fonte e sem dono não se sustenta.\n'
                    'Se mudar uma fórmula ou uma meta aqui, mude também na planilha.', dica=dica)
        linhas = [['Indicador', 'Definição', 'Fórmula', 'Fonte do dado', 'Frequência', {'t': 'Meta', 'alinh': 'dir'}]]
        for ind in lista:
            linhas.append([{'t': f'{ind[1]}\v_{ind[0]}_', 'tam': 11}, {'t': ind[6], 'tam': 11}, {'t': ind[7], 'tam': 11, 'cor': CZ}, {'t': ind[8], 'tam': 11}, {'t': ind[9], 'tam': 11},
                           {'t': _meta(ind), 'alinh': 'dir', 'negrito': True, 'cor': AZP}])
        tabela(s, MARGEM, Y_TOPO, [2.2, 2.95, 2.7, 1.9, 1.2, UTIL - 10.95], linhas, alt, 0.36, nome='Tabela: ficha dos indicadores')

    exemplo_ficha = 'Exemplo ilustrativo: ajuste definições, fontes e metas ao seu projeto.'
    ficha('Os cinco indicadores de preparo dizem se as pessoas estão prontas e se sabem fazer do jeito novo', inds[:5], 0.72, exemplo_ficha)
    ficha('Os seis indicadores de adoção e de resultado dizem se a mudança pegou e se valeu a pena', inds[5:], 0.66, exemplo_ficha)

    # 9 · leitura do período e decisões
    d.secao('Leitura e próximos passos')
    s = d.slide('Leitura do período', 'A mudança está preparada e em uso; falta transformar uso em adoção e em resultado',
                'A leitura do painel em uma página e as decisões pedidas ao comitê. Os três blocos contam os indicadores por situação e dizem, em uma frase, o que isso significa.\n'
                'No painel azul, no máximo três decisões, cada uma escrita como frase que se responde com sim, não ou uma escolha.\n'
                'Atualize as contagens, as listas e as frases a cada painel.', dica=EXEMPLO)
    xq, wq = col(0, 8)
    frases = {'Na meta': 'O preparo está completo.', 'Em atenção': 'O uso existe, mas com retrabalho.', 'Crítico': 'Adoção e benefício seguem atrasados.'}
    for (x, w), k in zip(faixas(3, xq, wq), ('Na meta', 'Em atenção', 'Crítico')):
        fio(s, x, Y_TOPO, x + w, Y_TOPO, AZP, 1.25)
        texto(s, x, Y_TOPO + 0.12, 1.0, 1.0, str(conta[k]), tam=60, cor=AZP, entre=0)
        pilula(s, x + w - 1.15, Y_TOPO + 0.2, 1.15, k, SITUACAO[k])
        nomes = [P(f'{i[1]}: *{fmt_ind(i[5][-1], i[2])}*', tam=T_ROTULO + 1, cor=CZ, entre=3) for i, (st, _) in zip(inds, sits) if st == k]
        texto(s, x, Y_TOPO + 1.22, w, 2.9, [H(frases[k], tam=17, entre=10)] + nomes)
    xp, wp = col(8, 4)
    decisoes = ['Manter o apoio no posto de trabalho por mais dois meses.', 'Gestores levam o índice de adoção da área à reunião semanal.', 'Rever com as áreas a curva de benefício do caso de negócio.']
    painel(s, xp, Y_TOPO, wp, H_UTIL, [R('Decisões pedidas ao comitê', AZS, entre=12)] + [x for i, t in enumerate(decisoes) for x in
                                       (P(f'{i + 1:02d}', tam=20, cor=AZS, fonte=TIT, italico=True, entre=2), P(t, tam=14, cor=BR, entre=14))], fundo=AZP, margem=0.3)

    # 10 · próximos passos
    criticos = [i for i, (st, _) in zip(inds, sits) if st == 'Crítico']
    s = d.slide('Próximos passos', f'Até o próximo painel, [{POR_EXTENSO[len(criticos)]}] ações atacam os indicadores críticos',
                'Uma ação por indicador crítico, com o valor de hoje, o alvo para o próximo painel, o dono e a data.\n'
                'O alvo do próximo painel é um passo, não a meta final: escolha um número que a ação consiga mover em um mês.\n'
                'Abra o próximo painel por este slide: o que foi feito e quanto o indicador andou.', dica=EXEMPLO)
    acoes = {'Índice de adoção': ('[62%]', 'Gestores refazem a conversa do porquê nas áreas com menor índice.'),
             'Chamados de suporte por usuário': ('[0,5]', 'Guia rápido para os erros mais comuns e apoio no posto de trabalho.'),
             'Benefício realizado': ('[48%]', 'Rever com as áreas onde o benefício depende do uso completo.')}
    for (x, w), ind in zip(faixas(3, calha=0.45), criticos):
        alvo, acao = acoes.get(ind[1], ('[alvo]', '[Ação que move o indicador em um mês.]'))
        fio(s, x, Y_TOPO, x + w, Y_TOPO, AZP, 1.25)
        texto(s, x, Y_TOPO + 0.16, w - 1.2, 0.75, [R(ind[0], AZ, entre=1), P(ind[1], cor=TINTA, negrito=True)])
        pilula(s, x + w - 1.05, Y_TOPO + 0.18, 1.05, 'Crítico', 3)
        texto(s, x, Y_TOPO + 0.85, 1.15, 1.0, fmt_ind(ind[5][-1], ind[2]), tam=32, cor=CZ, ancora='base')
        fio(s, x + 1.2, Y_TOPO + 1.52, x + 1.7, Y_TOPO + 1.52, AZ, 1.5, seta=True)
        texto(s, x + 1.85, Y_TOPO + 0.85, w - 1.85, 1.0, alvo, tam=44, cor=AZP, ancora='base')
        rotulo(s, x, Y_TOPO + 1.95, 1.15, 'Hoje'); rotulo(s, x + 1.85, Y_TOPO + 1.95, w - 1.85, 'Próximo painel', AZ)
        fio(s, x, Y_TOPO + 2.4, x + w, Y_TOPO + 2.4, LIN, 0.75)
        texto(s, x, Y_TOPO + 2.55, w, 1.5, [R('Ação', CZ, entre=3), P(acao, entre=12), R('Dono e data', CZ, entre=3), P('[Nome] · [dd/mm]', cor=AZP, negrito=True)])
    return d.salvar('painel-de-indicadores-da-mudanca.pptx', pasta)


if __name__ == '__main__':
    indicadores()
