"""Gera os modelos em Excel do Laboratório (blog/assets/modelos/*.xlsx), nas cores do blog.
Uso: python3 blog/_src/modelos_xlsx.py
"""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import CellIsRule, FormulaRule, ColorScaleRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.chart import BarChart, ScatterChart, Reference, Series
from openpyxl.utils import get_column_letter as L

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'modelos')
AZP, AZ, AZC, CZ, CZC, LIN, TINTA = '0A2463', '2F6FED', 'EAF1FE', '667085', 'F3F5F8', 'E0E5EC', '0B1530'
fill = lambda c: PatternFill('solid', start_color=c, end_color=c)
fino = Side(style='thin', color=LIN)
borda = Border(left=fino, right=fino, top=fino, bottom=fino)
centro = Alignment(horizontal='center', vertical='center', wrap_text=True)
esq = Alignment(horizontal='left', vertical='center', wrap_text=True)
MARCA = 'Change Management World · Victor Vitorino'


def cabecalho(ws, titulo, sub, largura):
    ws.sheet_view.showGridLines = False
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=largura)
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=largura)
    ws['A1'] = titulo
    ws['A1'].font = Font(name='Georgia', size=20, color='FFFFFF')
    ws['A1'].fill = fill(AZP)
    ws['A1'].alignment = Alignment(horizontal='left', vertical='center', indent=1)
    ws['A2'] = sub
    ws['A2'].font = Font(name='Calibri', size=10.5, color='FFFFFF')
    ws['A2'].fill = fill(AZP)
    ws['A2'].alignment = Alignment(horizontal='left', vertical='center', indent=1, wrap_text=True)
    for c in range(2, largura + 1):
        ws.cell(1, c).fill = fill(AZP); ws.cell(2, c).fill = fill(AZP)
    ws.row_dimensions[1].height = 38
    ws.row_dimensions[2].height = 34


def th(c, txt, cor=AZP):
    c.value = txt
    c.font = Font(name='Calibri', size=10.5, bold=True, color='FFFFFF')
    c.fill = fill(cor); c.alignment = centro; c.border = borda


def rodape(ws, linha, largura):
    ws.merge_cells(start_row=linha, start_column=1, end_row=linha, end_column=largura)
    c = ws.cell(linha, 1, MARCA + ' · Modelo livre para uso e adaptação.')
    c.font = Font(name='Calibri', size=9, italic=True, color=CZ)


def como_usar(wb, titulo, linhas):
    ws = wb.create_sheet('Como usar')
    cabecalho(ws, titulo, 'Como preencher e como ler', 2)
    ws.column_dimensions['A'].width = 26; ws.column_dimensions['B'].width = 96
    for i, (a, b) in enumerate(linhas):
        r = 4 + i
        ws.cell(r, 1, a).font = Font(name='Calibri', size=11, bold=True, color=AZP)
        ws.cell(r, 2, b).font = Font(name='Calibri', size=11, color=TINTA)
        ws.cell(r, 1).alignment = Alignment(vertical='top', wrap_text=True)
        ws.cell(r, 2).alignment = Alignment(vertical='top', wrap_text=True)
        ws.row_dimensions[r].height = max(20, 15 * (1 + len(b) // 95))
    rodape(ws, 5 + len(linhas), 2)


def raci():
    wb = Workbook(); ws = wb.active; ws.title = 'Matriz RACI'
    papeis = ['Patrocinador', 'Líder do projeto', 'Gestão da mudança', 'Gestores diretos', 'RH', 'TI', 'Multiplicadores']
    ativ = [('Definir a estratégia de mudança', 'A C R C C I I'), ('Mapear stakeholders e impactos', 'I A R C C C I'), ('Aprovar as mensagens-chave', 'A R R C I I I'),
            ('Executar o plano de comunicação', 'C C A R C I R'), ('Preparar e entregar a capacitação', 'I C A C R C R'), ('Preparar os gestores diretos', 'C C A R C I I'),
            ('Medir a adoção e reportar', 'I C A/R C I C C'), ('Tratar resistências', 'C C A R C I R'), ('Sustentar e transferir para a operação', 'A R C R C C I')]
    n = len(papeis)
    cabecalho(ws, 'Matriz RACI da mudança', 'R = Responsável (executa) · A = Aprovador (responde pelo resultado, um por atividade) · C = Consultado · I = Informado', n + 3)
    th(ws.cell(4, 1), 'Atividade')
    for j, p in enumerate(papeis): th(ws.cell(4, 2 + j), p)
    th(ws.cell(4, n + 2), 'Nº de A', AZ); th(ws.cell(4, n + 3), 'Conferência', AZ)
    ws.row_dimensions[4].height = 34
    ws.column_dimensions['A'].width = 42
    for j in range(n): ws.column_dimensions[L(2 + j)].width = 16
    ws.column_dimensions[L(n + 2)].width = 10; ws.column_dimensions[L(n + 3)].width = 30
    linhas = 20
    dv = DataValidation(type='list', formula1='"R,A,C,I,A/R"', allow_blank=True); dv.error = 'Use R, A, C, I ou A/R'; ws.add_data_validation(dv)
    for i in range(linhas):
        r = 5 + i
        nome, letras = ativ[i] if i < len(ativ) else ('', '')
        c = ws.cell(r, 1, nome); c.font = Font(name='Calibri', size=11, color=TINTA); c.alignment = esq; c.border = borda
        for j in range(n):
            v = letras.split()[j] if letras else None
            cel = ws.cell(r, 2 + j, v); cel.alignment = centro; cel.border = borda; cel.font = Font(name='Calibri', size=11, bold=True, color=TINTA)
            dv.add(cel)
        a1, a2 = f'{L(2)}{r}', f'{L(n + 1)}{r}'
        ca = ws.cell(r, n + 2, f'=COUNTIF({a1}:{a2},"A")+COUNTIF({a1}:{a2},"A/R")'); ca.alignment = centro; ca.border = borda
        cc = ws.cell(r, n + 3, f'=IF(A{r}="","",IF({L(n + 2)}{r}=0,"Falta definir o A",IF({L(n + 2)}{r}>1,"Mais de um A",IF(COUNTIF({a1}:{a2},"R")+COUNTIF({a1}:{a2},"A/R")=0,"Falta um R","OK"))))')
        cc.alignment = esq; cc.border = borda; cc.font = Font(name='Calibri', size=10.5, color=CZ)
        ws.row_dimensions[r].height = 24
    area = f'{L(2)}5:{L(n + 1)}{4 + linhas}'
    ws.conditional_formatting.add(area, CellIsRule(operator='equal', formula=['"A"'], fill=fill(AZP), font=Font(color='FFFFFF', bold=True)))
    ws.conditional_formatting.add(area, CellIsRule(operator='equal', formula=['"A/R"'], fill=fill(AZP), font=Font(color='FFFFFF', bold=True)))
    ws.conditional_formatting.add(area, CellIsRule(operator='equal', formula=['"R"'], fill=fill(AZ), font=Font(color='FFFFFF', bold=True)))
    ws.conditional_formatting.add(area, CellIsRule(operator='equal', formula=['"C"'], fill=fill('C9DAFB')))
    ws.conditional_formatting.add(area, CellIsRule(operator='equal', formula=['"I"'], fill=fill(CZC)))
    conf = f'{L(n + 3)}5:{L(n + 3)}{4 + linhas}'
    ws.conditional_formatting.add(conf, FormulaRule(formula=[f'AND({L(n + 3)}5<>"",{L(n + 3)}5<>"OK")'], font=Font(color='B42318', bold=True)))
    r0 = 6 + linhas
    th(ws.cell(r0, 1), 'Carga por papel')
    for k, letra in enumerate(['R', 'A', 'C', 'I']):
        ws.cell(r0 + 1 + k, 1, {'R': 'Responsável (R)', 'A': 'Aprovador (A)', 'C': 'Consultado (C)', 'I': 'Informado (I)'}[letra]).border = borda
        for j in range(n):
            col = L(2 + j)
            f = f'=COUNTIF({col}5:{col}{4 + linhas},"{letra}")' + (f'+COUNTIF({col}5:{col}{4 + linhas},"A/R")' if letra in 'RA' else '')
            c = ws.cell(r0 + 1 + k, 2 + j, f); c.alignment = centro; c.border = borda
    for j, p in enumerate(papeis): th(ws.cell(r0, 2 + j), p)
    rodape(ws, r0 + 7, n + 3)
    ws.freeze_panes = 'B5'
    como_usar(wb, 'Matriz RACI da mudança', [
        ('Para que serve', 'Deixar claro quem faz, quem responde, quem opina e quem só precisa saber, em cada entrega da gestão da mudança.'),
        ('Como preencher', 'Liste as atividades na coluna A e os papéis na linha 4 (troque os nomes à vontade). Em cada cruzamento, escolha R, A, C ou I. Use A/R quando a mesma pessoa aprova e executa.'),
        ('Regra de ouro', 'Cada atividade tem um único A. Se ninguém responde, ninguém decide; se dois respondem, ninguém responde. A coluna "Conferência" avisa quando falta ou sobra.'),
        ('Como ler', 'Muitos R no mesmo papel indicam sobrecarga. Muitos C tornam a decisão lenta: veja se parte deles pode virar I. Papéis sem nenhuma letra talvez não precisem estar na matriz.'),
        ('Dica', 'Valide a matriz com as pessoas, não só com o organograma. A RACI que ninguém reconhece não muda comportamento.'),
    ])
    wb.save(os.path.join(SAIDA, 'matriz-raci.xlsx'))


def influencia():
    wb = Workbook(); ws = wb.active; ws.title = 'Mapa de influência'
    cabecalho(ws, 'Mapa de influência de stakeholders', 'Influência (1 a 5) e apoio à mudança (1 = resiste, 5 = apoia). A estratégia é sugerida pela posição no mapa.', 7)
    cols = ['Stakeholder', 'Área ou papel', 'Influência (1-5)', 'Apoio (1-5)', 'Estratégia sugerida', 'O que essa pessoa perde ou ganha', 'Próxima ação e responsável']
    larg = [28, 24, 16, 14, 30, 40, 40]
    for j, (c, w) in enumerate(zip(cols, larg)):
        th(ws.cell(4, 1 + j), c); ws.column_dimensions[L(1 + j)].width = w
    ws.row_dimensions[4].height = 34
    ex = [('Patrocinador executivo', 'Diretoria', 5, 5), ('Diretor de operações', 'Operações', 5, 2), ('Gerente de TI', 'Tecnologia', 4, 3), ('Gestores de linha', 'Operações', 3, 2), ('Usuários-chave', 'Áreas de negócio', 2, 4), ('Equipe de atendimento', 'Atendimento', 1, 2)]
    dv = DataValidation(type='whole', operator='between', formula1='1', formula2='5'); dv.error = 'Use um número de 1 a 5'; ws.add_data_validation(dv)
    n = 30
    for i in range(n):
        r = 5 + i
        v = ex[i] if i < len(ex) else ('', '', None, None)
        for j, val in enumerate(v):
            c = ws.cell(r, 1 + j, val); c.border = borda; c.alignment = esq if j < 2 else centro; c.font = Font(name='Calibri', size=11, color=TINTA)
        dv.add(ws.cell(r, 3)); dv.add(ws.cell(r, 4))
        e = ws.cell(r, 5, f'=IF(OR(C{r}="",D{r}=""),"",IF(C{r}>=3,IF(D{r}>=3,"Mobilizar como aliado","Conquistar: prioridade"),IF(D{r}>=3,"Envolver como rede","Ouvir e acompanhar")))')
        e.border = borda; e.alignment = esq; e.font = Font(name='Calibri', size=11, bold=True, color=AZP)
        for j in (6, 7): ws.cell(r, j).border = borda; ws.cell(r, j).alignment = esq
        ws.row_dimensions[r].height = 24
    ws.conditional_formatting.add(f'E5:E{4 + n}', CellIsRule(operator='equal', formula=['"Conquistar: prioridade"'], fill=fill(AZP), font=Font(color='FFFFFF', bold=True)))
    ws.conditional_formatting.add(f'E5:E{4 + n}', CellIsRule(operator='equal', formula=['"Mobilizar como aliado"'], fill=fill(AZ), font=Font(color='FFFFFF', bold=True)))
    ws.conditional_formatting.add(f'E5:E{4 + n}', CellIsRule(operator='equal', formula=['"Envolver como rede"'], fill=fill('C9DAFB')))
    ws.conditional_formatting.add(f'E5:E{4 + n}', CellIsRule(operator='equal', formula=['"Ouvir e acompanhar"'], fill=fill(CZC)))
    ch = ScatterChart(); ch.title = 'Influência x apoio à mudança'; ch.style = 13; ch.height = 11; ch.width = 16
    ch.x_axis.title = 'Apoio à mudança (1 = resiste, 5 = apoia)'; ch.y_axis.title = 'Influência'
    ch.x_axis.scaling.min = 0.5; ch.x_axis.scaling.max = 5.5; ch.y_axis.scaling.min = 0.5; ch.y_axis.scaling.max = 5.5
    ch.x_axis.delete = False; ch.y_axis.delete = False; ch.legend = None
    s = Series(Reference(ws, min_col=3, min_row=5, max_row=4 + n), Reference(ws, min_col=4, min_row=5, max_row=4 + n), title='Stakeholders')
    s.marker.symbol = 'circle'; s.marker.size = 9; s.marker.graphicalProperties.solidFill = AZ; s.marker.graphicalProperties.line.solidFill = AZP; s.graphicalProperties.line.noFill = True
    ch.series.append(s); ws.add_chart(ch, 'I4')
    rodape(ws, 6 + n, 7); ws.freeze_panes = 'B5'
    como_usar(wb, 'Mapa de influência de stakeholders', [
        ('Para que serve', 'Decidir onde investir tempo de engajamento. Nem todo stakeholder pede o mesmo esforço.'),
        ('Como preencher', 'Liste pessoas ou grupos. Dê nota de 1 a 5 para a influência sobre o resultado da mudança e para o apoio atual (1 = resiste, 3 = neutro, 5 = apoia ativamente).'),
        ('Conquistar: prioridade', 'Muita influência e pouco apoio. Entenda o que a pessoa perde, envolva o patrocinador e ajuste o que for possível. É aqui que a mudança costuma travar.'),
        ('Mobilizar como aliado', 'Muita influência e apoio. Dê papel visível: porta-voz, coalizão de patrocínio, exemplo para os pares.'),
        ('Envolver como rede', 'Pouca influência formal e apoio alto. São bons multiplicadores e trazem o que não está funcionando.'),
        ('Ouvir e acompanhar', 'Pouca influência e pouco apoio. Escute o motivo: resistência costuma ser informação sobre o desenho da mudança.'),
        ('Cuidado', 'O mapa é retrato do momento e material sensível. Atualize a cada fase do projeto e restrinja o acesso.'),
    ])
    wb.save(os.path.join(SAIDA, 'mapa-de-influencia.xlsx'))


def adocao():
    wb = Workbook(); ws = wb.active; ws.title = 'Matriz de adoção'
    niveis = ['Resiste', 'Observa', 'Experimenta', 'Adota', 'Multiplica']
    cabecalho(ws, 'Matriz de adoção', 'Quantas pessoas de cada área estão hoje em cada marca da régua de adoção. Leitura agregada: retrato do momento, não avaliação de desempenho.', 8)
    th(ws.cell(4, 1), 'Área')
    cores = ['98A2B3', '667085', '5B8DF5', AZ, AZP]
    for j, nv in enumerate(niveis): th(ws.cell(4, 2 + j), nv, cores[j])
    th(ws.cell(4, 7), 'Pessoas', AZ); th(ws.cell(4, 8), 'Índice de adoção', AZ)
    ws.column_dimensions['A'].width = 26
    for j in range(2, 9): ws.column_dimensions[L(j)].width = 15
    ws.row_dimensions[4].height = 30
    ex = [('Financeiro', 1, 2, 2, 1, 0), ('Operações', 2, 3, 1, 1, 0), ('Comercial', 1, 1, 2, 1, 1), ('Suprimentos', 2, 2, 1, 1, 0)]
    n = 12
    for i in range(n):
        r = 5 + i
        v = ex[i] if i < len(ex) else ('',) + (None,) * 5
        for j, val in enumerate(v):
            c = ws.cell(r, 1 + j, val); c.border = borda; c.alignment = esq if j == 0 else centro; c.font = Font(name='Calibri', size=11, color=TINTA)
        t = ws.cell(r, 7, f'=IF(A{r}="","",SUM(B{r}:F{r}))'); t.border = borda; t.alignment = centro
        ix = ws.cell(r, 8, f'=IF(OR(A{r}="",SUM(B{r}:F{r})=0),"",(E{r}+F{r})/SUM(B{r}:F{r}))'); ix.border = borda; ix.alignment = centro; ix.number_format = '0%'; ix.font = Font(bold=True, color=AZP)
        ws.row_dimensions[r].height = 24
    rt = 5 + n
    th(ws.cell(rt, 1), 'Total')
    for j in range(2, 8):
        c = ws.cell(rt, j, f'=SUM({L(j)}5:{L(j)}{4 + n})'); c.border = borda; c.alignment = centro; c.font = Font(bold=True)
    c = ws.cell(rt, 8, f'=IF(G{rt}=0,"",(E{rt}+F{rt})/G{rt})'); c.number_format = '0%'; c.border = borda; c.alignment = centro; c.font = Font(bold=True, color='FFFFFF'); c.fill = fill(AZP)
    ws.conditional_formatting.add(f'B5:F{4 + n}', ColorScaleRule(start_type='num', start_value=0, start_color='FFFFFF', end_type='max', end_color='9DBDFF'))
    ra = rt + 2
    th(ws.cell(ra, 1), 'Ação por marca')
    for j, a in enumerate(['Escuta: ouvir o motivo e ajustar a mensagem', 'Exemplo: mostrar funcionando, com gente parecida', 'Prática: tempo protegido e apoio por perto', 'Reforço: reconhecer e tirar atritos da rotina', 'Palco: dar voz e formar a rede']):
        c = ws.cell(ra, 2 + j, a); c.alignment = centro; c.border = borda; c.font = Font(name='Calibri', size=10, color=TINTA)
    ws.row_dimensions[ra].height = 62
    ch = BarChart(); ch.type = 'bar'; ch.grouping = 'percentStacked'; ch.overlap = 100; ch.title = 'Distribuição por área'; ch.height = 9; ch.width = 20
    ch.add_data(Reference(ws, min_col=2, max_col=6, min_row=4, max_row=4 + len(ex)), titles_from_data=True)
    ch.set_categories(Reference(ws, min_col=1, min_row=5, max_row=4 + len(ex)))
    for s, cor in zip(ch.series, cores): s.graphicalProperties.solidFill = cor; s.graphicalProperties.line.solidFill = 'FFFFFF'
    ch.x_axis.delete = False; ch.y_axis.delete = False
    ws.add_chart(ch, f'A{ra + 3}')
    rodape(ws, ra + 23, 8); ws.freeze_panes = 'B5'
    como_usar(wb, 'Matriz de adoção', [
        ('Para que serve', 'Mostrar onde cada área está na régua de adoção e apontar a ação que mais ajuda cada grupo.'),
        ('A régua', 'Resiste: ainda não vê motivo para mudar. Observa: espera para ver funcionar. Experimenta: testa, com apoio. Adota: usa na rotina. Multiplica: ensina os colegas.'),
        ('Como preencher', 'Em cada área, informe quantas pessoas estão em cada marca. Fontes: pesquisa curta, conversa com os gestores e dados de uso. O gráfico usa as quatro primeiras áreas do exemplo; ajuste o intervalo se incluir mais.'),
        ('Índice de adoção', 'Parcela das pessoas em "Adota" ou "Multiplica". Acompanhe a cada onda do projeto, antes e depois do go-live.'),
        ('Como ler', 'A marca com mais gente em cada área indica a ação prioritária. Posição é momento, não rótulo: pessoas avançam, travam e recuam.'),
        ('Cuidado', 'Use leitura agregada por área. O mapa serve para decidir onde investir energia, não para avaliar pessoas.'),
    ])
    wb.save(os.path.join(SAIDA, 'matriz-de-adocao.xlsx'))


if __name__ == '__main__':
    os.makedirs(SAIDA, exist_ok=True)
    raci(); influencia(); adocao()
    print('modelos gerados em', os.path.normpath(SAIDA))
