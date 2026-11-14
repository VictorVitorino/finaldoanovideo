"""Gera o kit de slides em PowerPoint do blog (blog/assets/modelos/kit-de-gestao-da-mudanca.pptx).
Slides 16:9, editáveis (formas e tabelas nativas), nas cores do blog. Uso: python3 blog/_src/modelos_pptx.py
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'modelos')
AZP, AZ, AZC, AZS = RGBColor(0x0A, 0x24, 0x63), RGBColor(0x2F, 0x6F, 0xED), RGBColor(0xEA, 0xF1, 0xFE), RGBColor(0x9D, 0xBD, 0xFF)
CZ, CZC, LIN, TINTA, BR = RGBColor(0x66, 0x70, 0x85), RGBColor(0xF3, 0xF5, 0xF8), RGBColor(0xE0, 0xE5, 0xEC), RGBColor(0x0B, 0x15, 0x30), RGBColor(0xFF, 0xFF, 0xFF)
TIT, TXT = 'Georgia', 'Calibri'
P = Presentation(); P.slide_width = Inches(13.333); P.slide_height = Inches(7.5)
VAZIO = P.slide_layouts[6]


def caixa(s, x, y, w, h, cor=None, linha=None, forma=MSO_SHAPE.RECTANGLE):
    f = s.shapes.add_shape(forma, Inches(x), Inches(y), Inches(w), Inches(h))
    if cor is None: f.fill.background()
    else: f.fill.solid(); f.fill.fore_color.rgb = cor
    if linha is None: f.line.fill.background()
    else: f.line.color.rgb = linha; f.line.width = Pt(1)
    f.shadow.inherit = False
    return f


def texto(s, x, y, w, h, t, tam=14, cor=TINTA, negrito=False, fonte=TXT, alinh=PP_ALIGN.LEFT, ancora=MSO_ANCHOR.TOP, italico=False):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = ancora
    tf.margin_left = tf.margin_right = Inches(0.04); tf.margin_top = tf.margin_bottom = Inches(0.02)
    for i, linha in enumerate(t if isinstance(t, list) else [t]):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.alignment = alinh
        r = p.add_run(); r.text = linha; r.font.size = Pt(tam); r.font.color.rgb = cor; r.font.bold = negrito; r.font.name = fonte; r.font.italic = italico
        p.space_after = Pt(4)
    return tb


def no(f, t, tam=12, cor=BR, negrito=True, alinh=PP_ALIGN.CENTER):
    tf = f.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = alinh; r = p.add_run(); r.text = t; r.font.size = Pt(tam); r.font.color.rgb = cor; r.font.bold = negrito; r.font.name = TXT


def slide(olho, titulo, dica):
    s = P.slides.add_slide(VAZIO)
    caixa(s, 0, 0, 13.333, 0.12, AZP)
    texto(s, 0.6, 0.38, 9, 0.3, olho.upper(), 10.5, AZ, True)
    texto(s, 0.6, 0.66, 12, 0.8, titulo, 28, TINTA, fonte=TIT)
    caixa(s, 0.6, 7.02, 12.13, 0.01, LIN)
    texto(s, 0.6, 7.06, 8, 0.3, 'Change Management World · Victor Vitorino', 9, CZ)
    texto(s, 8.7, 7.06, 4.03, 0.3, 'Modelo livre para uso e adaptação', 9, CZ, alinh=PP_ALIGN.RIGHT)
    s.notes_slide.notes_text_frame.text = dica
    return s


def tabela(s, x, y, w, h, linhas, larguras=None, tam=11):
    nl, nc = len(linhas), len(linhas[0])
    t = s.shapes.add_table(nl, nc, Inches(x), Inches(y), Inches(w), Inches(h)).table
    if larguras:
        for j, lw in enumerate(larguras): t.columns[j].width = Inches(lw)
    for i, lin in enumerate(linhas):
        for j, v in enumerate(lin):
            c = t.cell(i, j); c.text = str(v); c.vertical_anchor = MSO_ANCHOR.MIDDLE
            c.fill.solid(); c.fill.fore_color.rgb = AZP if i == 0 else (CZC if i % 2 == 0 else BR)
            for p in c.text_frame.paragraphs:
                for r in p.runs: r.font.size = Pt(tam); r.font.name = TXT; r.font.bold = i == 0; r.font.color.rgb = BR if i == 0 else TINTA
    return t


# 1 · capa
s = P.slides.add_slide(VAZIO)
caixa(s, 0, 0, 13.333, 7.5, AZP)
caixa(s, 0.8, 1.2, 0.9, 0.04, AZS)
texto(s, 0.8, 1.45, 8, 0.4, 'KIT DE SLIDES', 12, AZS, True)
texto(s, 0.8, 1.95, 11, 1.6, ['Gestão da mudança', 'do [nome do projeto]'], 46, BR, fonte=TIT)
texto(s, 0.8, 4.2, 9, 0.9, 'Dez slides editáveis para apresentar estratégia, stakeholders, papéis, adoção, riscos e plano. Troque os textos entre colchetes.', 16, RGBColor(0xC9, 0xD6, 0xF2))
texto(s, 0.8, 6.4, 8, 0.4, '[Área responsável] · [mês e ano]', 12, AZS)
texto(s, 8.3, 6.4, 4.2, 0.4, 'Change Management World · Victor Vitorino', 10, AZS, alinh=PP_ALIGN.RIGHT)

# 2 · estratégia em uma página
s = slide('Estratégia', 'A mudança em uma página', 'Preencha os seis blocos com o patrocinador. Se não couber aqui, a mensagem ainda não está clara.')
blocos = [('Por que mudar', '[O problema ou a oportunidade, em duas frases]'), ('O que muda', '[Processos, sistemas, papéis e indicadores]'), ('Quem é impactado', '[Grupos e número de pessoas]'),
          ('Como será o sucesso', '[Adoção, uso e resultado esperados, com data]'), ('Quem patrocina', '[Patrocinador e coalizão de líderes]'), ('Principais riscos', '[Os três que mais ameaçam a adoção]')]
for i, (t, d) in enumerate(blocos):
    x, y = 0.6 + (i % 3) * 4.11, 1.75 + (i // 3) * 2.55
    caixa(s, x, y, 3.9, 2.35, CZC if i % 2 else AZC)
    caixa(s, x, y, 3.9, 0.06, AZ if i < 3 else AZP)
    texto(s, x + 0.25, y + 0.28, 3.4, 0.4, t, 16, AZP, True)
    texto(s, x + 0.25, y + 0.85, 3.4, 1.3, d, 12.5, CZ)

# 3 · lista de impactos
s = slide('Impactos', 'O que muda para cada grupo', 'Resuma aqui os impactos mais altos. A lista completa fica na planilha "Lista de impactos com dashboard".')
tabela(s, 0.6, 1.75, 12.13, 4.6, [['Grupo impactado', 'O que muda', 'Tipo', 'Grau', 'Pessoas', 'Ação de mudança']] + [['[Grupo]', '[De / para, em uma frase]', '[Processo, sistema, papel…]', '[1 a 5]', '[nº]', '[Comunicação, capacitação ou apoio]'] for _ in range(6)], [2.2, 3.6, 1.9, 0.8, 0.9, 2.73])

# 4 · mapa de stakeholders
s = slide('Stakeholders', 'Mapa de influência e apoio', 'Arraste os círculos para a posição de cada stakeholder. Prioridade: quem tem muita influência e pouco apoio.')
X0, Y0, T = 1.5, 1.7, 4.9
caixa(s, X0, Y0, T, T, CZC, LIN)
caixa(s, X0, Y0, T / 2, T / 2, AZC); caixa(s, X0 + T / 2, Y0, T / 2, T / 2, RGBColor(0xDD, 0xE8, 0xFD))
for (tx, ty, t) in [(X0 + 0.12, Y0 + 0.1, 'CONQUISTAR'), (X0 + T / 2 + 0.12, Y0 + 0.1, 'MOBILIZAR'), (X0 + 0.12, Y0 + T - 0.42, 'OUVIR'), (X0 + T / 2 + 0.12, Y0 + T - 0.42, 'ENVOLVER')]:
    texto(s, tx, ty, 2, 0.3, t, 10, AZP, True)
texto(s, X0, Y0 + T + 0.08, T, 0.3, 'Apoio à mudança: resiste → apoia', 11, CZ, alinh=PP_ALIGN.CENTER)
texto(s, 0.55, Y0 + 1.9, 0.9, 1.2, ['Influência', 'baixa → alta'], 11, CZ, alinh=PP_ALIGN.CENTER)
for (px, py, t, c) in [(0.25, 0.14, 'DO', AZP), (0.82, 0.1, 'PE', AZ), (0.56, 0.3, 'TI', AZ), (0.3, 0.46, 'GL', AZP), (0.76, 0.68, 'UC', CZ), (0.2, 0.82, 'AT', CZ)]:
    f = caixa(s, X0 + px * T - 0.24, Y0 + py * T - 0.24, 0.48, 0.48, c, BR, MSO_SHAPE.OVAL); no(f, t, 10)
for i, (t, d) in enumerate([('Conquistar', 'Muita influência, pouco apoio. Entender o que a pessoa perde e envolver o patrocinador.'), ('Mobilizar', 'Muita influência e apoio. Dar papel visível na coalizão de patrocínio.'), ('Envolver', 'Pouca influência formal, apoio alto. Bons multiplicadores.'), ('Ouvir', 'Pouca influência, pouco apoio. Resistência pode ser informação sobre o desenho.')]):
    y = 1.7 + i * 1.25
    caixa(s, 7.2, y, 0.06, 1.0, AZ)
    texto(s, 7.4, y, 5.3, 0.35, t, 15, AZP, True); texto(s, 7.4, y + 0.4, 5.3, 0.7, d, 12, CZ)

# 5 · matriz RACI
s = slide('Papéis', 'Matriz RACI da mudança', 'R = responsável, A = aprovador (um por atividade), C = consultado, I = informado. Troque as letras direto nas células.')
cab = ['Atividade', 'Patrocinador', 'Líder do projeto', 'Gestão da mudança', 'Gestores diretos', 'RH', 'TI']
lin = [['Definir a estratégia de mudança', 'A', 'C', 'R', 'C', 'C', 'I'], ['Mapear stakeholders e impactos', 'I', 'A', 'R', 'C', 'C', 'C'], ['Aprovar as mensagens-chave', 'A', 'R', 'R', 'C', 'I', 'I'], ['Executar o plano de comunicação', 'C', 'C', 'A', 'R', 'C', 'I'], ['Preparar e entregar a capacitação', 'I', 'C', 'A', 'C', 'R', 'C'], ['Medir a adoção e reportar', 'I', 'C', 'A', 'R', 'I', 'C'], ['Sustentar e transferir para a operação', 'A', 'R', 'C', 'R', 'C', 'C']]
t = tabela(s, 0.6, 1.75, 12.13, 4.4, [cab] + lin, [3.73, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4])
COR = {'A': (AZP, BR), 'R': (AZ, BR), 'C': (RGBColor(0xD5, 0xE2, 0xFB), AZP), 'I': (CZC, CZ)}
for i in range(1, len(lin) + 1):
    for j in range(1, 7):
        c = t.cell(i, j); v = c.text; c.fill.solid(); c.fill.fore_color.rgb = COR[v][0]
        for p in c.text_frame.paragraphs:
            p.alignment = PP_ALIGN.CENTER
            for r in p.runs: r.font.bold = True; r.font.size = Pt(13); r.font.color.rgb = COR[v][1]
texto(s, 0.6, 6.3, 12.13, 0.5, 'Regra de ouro: um único A por atividade. Muitos C deixam a decisão lenta.', 12, CZ, italico=True)

# 6 · ADKAR
s = slide('Diagnóstico', 'Onde a mudança trava: leitura ADKAR', 'Preencha a nota de cada elemento por grupo. O ponto de barreira é o primeiro elemento com nota 3 ou menor. Use a planilha "Avaliação ADKAR" para calcular.')
el = [('Consciência', 'Entende por que mudar', 'Patrocinador explica o porquê'), ('Desejo', 'Quer participar', 'Gestor direto conversa sobre perdas e ganhos'), ('Conhecimento', 'Sabe como fazer', 'Capacitação perto do uso'), ('Habilidade', 'Consegue fazer', 'Prática guiada e apoio no posto'), ('Reforço', 'Mantém a mudança', 'Reconhecer e medir o uso')]
for i, (n, d, a) in enumerate(el):
    x = 0.6 + i * 2.46
    f = caixa(s, x, 1.75, 2.3, 0.8, [AZP, AZP, AZ, AZ, AZS][i], forma=MSO_SHAPE.CHEVRON if i else MSO_SHAPE.PENTAGON); no(f, n, 13, BR if i < 4 else AZP)
    texto(s, x, 2.7, 2.3, 0.4, d, 12, TINTA, True, alinh=PP_ALIGN.CENTER)
    caixa(s, x, 3.2, 2.3, 1.1, CZC); texto(s, x + 0.12, 3.28, 2.06, 0.3, 'NOTA DO GRUPO', 9, CZ, True, alinh=PP_ALIGN.CENTER); texto(s, x, 3.55, 2.3, 0.7, '[1 a 5]', 22, AZP, fonte=TIT, alinh=PP_ALIGN.CENTER)
    texto(s, x, 4.45, 2.3, 0.3, 'SE FOR A BARREIRA', 9, AZ, True, alinh=PP_ALIGN.CENTER); texto(s, x, 4.75, 2.3, 0.9, a, 11.5, CZ, alinh=PP_ALIGN.CENTER)
caixa(s, 0.6, 5.85, 12.13, 0.95, AZC); texto(s, 0.85, 5.95, 11.6, 0.8, ['Ponto de barreira do grupo: [elemento]', 'Ação prioritária: [o que será feito, por quem e até quando]'], 13, AZP, True)

# 7 · régua de adoção
s = slide('Adoção', 'Mapa de adoção: onde cada área está', 'Informe o percentual de pessoas de cada área em cada marca. A largura das barras é ilustrativa: redimensione para refletir os seus números.')
niv = [('Resiste', RGBColor(0x98, 0xA2, 0xB3), 'Escuta'), ('Observa', CZ, 'Exemplo'), ('Experimenta', AZS, 'Prática'), ('Adota', AZ, 'Reforço'), ('Multiplica', AZP, 'Palco')]
for i, (n, c, a) in enumerate(niv):
    x = 2.6 + i * 2.03
    f = caixa(s, x, 1.75, 1.93, 0.5, c); no(f, n, 12, TINTA if i == 2 else BR)
    texto(s, x, 6.0, 1.93, 0.3, 'AÇÃO', 9, CZ, True, alinh=PP_ALIGN.CENTER); texto(s, x, 6.25, 1.93, 0.4, a, 14, AZP, True, alinh=PP_ALIGN.CENTER)
for j, (ar, ps) in enumerate([('[Área 1]', [17, 33, 33, 17, 0]), ('[Área 2]', [29, 42, 15, 14, 0]), ('[Área 3]', [17, 17, 33, 17, 16]), ('[Área 4]', [33, 33, 17, 17, 0])]):
    y = 2.5 + j * 0.85
    texto(s, 0.6, y + 0.12, 1.9, 0.4, ar, 13, TINTA, True)
    x = 2.6
    for i, pc in enumerate(ps):
        if not pc: continue
        w = 10.13 * pc / 100; f = caixa(s, x, y, w - 0.03, 0.62, niv[i][1]); no(f, f'{pc}%', 11, TINTA if i == 2 else BR); x += w
texto(s, 0.6, 5.95, 1.9, 0.8, ['Índice de adoção', '[xx%]'], 12, AZP, True)

# 8 · comunicação e capacitação
s = slide('Plano', 'Comunicação e capacitação por público', 'Uma linha por público. A mensagem de negócio vem do patrocinador; o impacto no dia a dia, do gestor direto.')
tabela(s, 0.6, 1.75, 12.13, 4.6, [['Público', 'Mensagem-chave', 'Quem comunica', 'Canal e momento', 'Capacitação', 'Como medir']] + [['[Público]', '[O que muda para mim]', '[Patrocinador ou gestor direto]', '[Canal · data]', '[Formato · quando]', '[Uso, comportamento ou resultado]'] for _ in range(6)], [1.8, 2.6, 2.0, 1.9, 1.9, 1.93])

# 9 · riscos
s = slide('Riscos', 'Mapa de riscos da mudança', 'Posicione os números dos riscos na matriz. Detalhe cada um na planilha "Mapa de riscos".')
G0x, G0y, C = 1.6, 1.75, 0.86
for i in range(5):
    for j in range(5):
        e = (5 - i) * (j + 1); cor = AZP if e >= 15 else AZ if e >= 8 else AZC
        f = caixa(s, G0x + j * C, G0y + i * C, C - 0.05, C - 0.05, cor); no(f, str(e), 11, BR if e >= 8 else CZ, False)
texto(s, G0x, G0y + 5 * C + 0.02, 5 * C, 0.3, 'Impacto na adoção: baixo → alto', 11, CZ, alinh=PP_ALIGN.CENTER)
texto(s, 0.55, G0y + 1.6, 1.0, 1.0, ['Probabilidade', 'baixa → alta'], 11, CZ, alinh=PP_ALIGN.CENTER)
tabela(s, 6.5, 1.75, 6.23, 4.3, [['Nº', 'Risco', 'Resposta', 'Dono']] + [[str(i), '[Causa e efeito]', '[O que será feito]', '[Nome]'] for i in range(1, 6)], [0.5, 2.4, 2.23, 1.1])
texto(s, 6.5, 6.2, 6.23, 0.5, 'Exposição = probabilidade x impacto. 15 ou mais: ação imediata.', 11.5, CZ, italico=True)

# 10 · status de adoção
s = slide('Acompanhamento', 'Status da adoção', 'Slide para o comitê. Mostre uso real, não só atividades entregues.')
for i, (r, v, d) in enumerate([('Índice de adoção', '[xx%]', 'pessoas em Adota ou Multiplica'), ('Uso na rotina', '[xx%]', 'dos usuários ativos na semana'), ('Proficiência', '[xx%]', 'das tarefas sem retrabalho'), ('Prontidão', '[x,x]', 'nota média de 1 a 5')]):
    x = 0.6 + i * 3.08
    caixa(s, x, 1.75, 2.9, 1.9, AZP if i == 0 else CZC)
    texto(s, x + 0.2, 1.9, 2.5, 0.3, r.upper(), 10, AZS if i == 0 else CZ, True); texto(s, x + 0.2, 2.25, 2.5, 0.8, v, 36, BR if i == 0 else AZP, fonte=TIT); texto(s, x + 0.2, 3.1, 2.5, 0.4, d, 11, RGBColor(0xC9, 0xD6, 0xF2) if i == 0 else CZ)
for i, (t, d) in enumerate([('O que avançou', '[Duas ou três conquistas desde o último comitê]'), ('O que travou', '[Onde a adoção parou e a causa provável]'), ('Decisões que precisamos', '[O que o comitê precisa decidir hoje]')]):
    x = 0.6 + i * 4.11
    caixa(s, x, 3.95, 3.9, 0.05, AZ); texto(s, x, 4.1, 3.9, 0.4, t, 15, AZP, True); texto(s, x, 4.6, 3.9, 2.0, d, 12.5, CZ)

# 11 · próximos passos
s = slide('Plano', 'Próximos 30, 60 e 90 dias', 'Feche a apresentação com compromissos, donos e datas.')
for i, (t, c) in enumerate([('30 dias', AZP), ('60 dias', AZ), ('90 dias', AZS)]):
    x = 0.6 + i * 4.11
    f = caixa(s, x, 1.75, 3.9, 0.7, c); no(f, t, 16, AZP if i == 2 else BR)
    caixa(s, x, 2.45, 3.9, 3.9, CZC)
    texto(s, x + 0.25, 2.65, 3.4, 3.5, ['[Entrega] · [dono] · [data]', '[Entrega] · [dono] · [data]', '[Entrega] · [dono] · [data]', '[Marco de adoção esperado]'], 13, TINTA)

os.makedirs(SAIDA, exist_ok=True)
P.save(os.path.join(SAIDA, 'kit-de-gestao-da-mudanca.pptx'))
print('kit de slides gerado:', len(P.slides._sldIdLst), 'slides')
