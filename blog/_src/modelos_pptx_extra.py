"""Gera três apresentações-modelo do blog em PowerPoint (blog/assets/modelos):
kickoff da mudança, relatório executivo de adoção e workshop com patrocinadores.
Reaproveita os auxiliares de modelos_pptx.py. Uso: python3 blog/_src/modelos_pptx_extra.py
"""
import os
AQUI = os.path.dirname(os.path.abspath(__file__))
fonte = open(os.path.join(AQUI, 'modelos_pptx.py'), encoding='utf-8').read().split('# 1 · capa')[0]
G = {'__file__': os.path.join(AQUI, 'modelos_pptx.py')}
exec(fonte, G)
Presentation, Inches, Pt, RGBColor, MSO_SHAPE, PP_ALIGN = G['Presentation'], G['Inches'], G['Pt'], G['RGBColor'], G['MSO_SHAPE'], G['PP_ALIGN']
caixa, texto, no, slide, tabela = G['caixa'], G['texto'], G['no'], G['slide'], G['tabela']
AZP, AZ, AZC, AZS, CZ, CZC, LIN, TINTA, BR, TIT, SAIDA = (G[k] for k in ('AZP', 'AZ', 'AZC', 'AZS', 'CZ', 'CZC', 'LIN', 'TINTA', 'BR', 'TIT', 'SAIDA'))
CLARO = RGBColor(0xC9, 0xD6, 0xF2)


def novo():
    G['P'] = Presentation(); G['P'].slide_width = Inches(13.333); G['P'].slide_height = Inches(7.5); G['VAZIO'] = G['P'].slide_layouts[6]
    return G['P']


def capa(olho, linhas, sub):
    s = G['P'].slides.add_slide(G['VAZIO'])
    caixa(s, 0, 0, 13.333, 7.5, AZP); caixa(s, 8.9, 0, 4.433, 7.5, RGBColor(0x0F, 0x2E, 0x7A))
    for i in range(5): caixa(s, 9.5 + i * 0.62, 5.6 - i * 0.75, 0.42, 1.2 + i * 0.75, AZ if i > 2 else RGBColor(0x1B, 0x44, 0xA8))
    caixa(s, 0.8, 1.2, 0.9, 0.04, AZS)
    texto(s, 0.8, 1.45, 7.5, 0.4, olho.upper(), 12, AZS, True)
    texto(s, 0.8, 1.95, 7.8, 2.0, linhas, 42, BR, fonte=TIT)
    texto(s, 0.8, 4.5, 7.4, 1.0, sub, 16, CLARO)
    texto(s, 0.8, 6.4, 7.5, 0.4, '[Área responsável] · [mês e ano]', 12, AZS)
    return s


def divisor(num, titulo, frase):
    s = G['P'].slides.add_slide(G['VAZIO'])
    caixa(s, 0, 0, 13.333, 7.5, AZC); caixa(s, 0, 0, 0.35, 7.5, AZP)
    texto(s, 1.1, 2.2, 3, 1.4, num, 80, AZ, fonte=TIT, italico=True)
    texto(s, 1.1, 3.7, 11, 1.0, titulo, 38, AZP, fonte=TIT)
    texto(s, 1.1, 4.7, 9.5, 1.0, frase, 16, CZ)
    return s


def frase_grande(olho, frase, apoio, dica):
    s = slide(olho, '', dica)
    caixa(s, 0.6, 1.9, 0.08, 2.6, AZ)
    texto(s, 1.0, 1.8, 11.4, 2.8, frase, 36, AZP, fonte=TIT)
    texto(s, 1.0, 4.9, 10.5, 1.4, apoio, 16, CZ)
    return s


def colunas(s, itens, y=1.75, h=4.6, numerar=True):
    n = len(itens); w = (12.13 - 0.2 * (n - 1)) / n
    for i, (t, d) in enumerate(itens):
        x = 0.6 + i * (w + 0.2)
        caixa(s, x, y, w, h, CZC); caixa(s, x, y, w, 0.07, AZP if i % 2 == 0 else AZ)
        if numerar: texto(s, x + 0.25, y + 0.3, w - 0.5, 0.6, f'{i + 1:02d}', 26, AZ, fonte=TIT, italico=True)
        texto(s, x + 0.25, y + (1.05 if numerar else 0.35), w - 0.5, 0.9, t, 17, AZP, True)
        texto(s, x + 0.25, y + (2.0 if numerar else 1.3), w - 0.5, h - 2.2, d, 12.5, CZ)


def salva(nome):
    G['P'].save(os.path.join(SAIDA, nome)); print(nome, len(G['P'].slides._sldIdLst), 'slides')


# ================= 1 · Kickoff da mudança =================
novo()
capa('Kickoff da mudança', ['[Nome do projeto]:', 'o que muda e por quê'], 'Apresentação de lançamento para líderes e equipes. Conta a história da mudança em dez minutos e termina com o que se espera de cada um.')
frase_grande('O porquê', '[A frase que explica por que estamos mudando, em linguagem de quem vive o problema.]', '[O que acontece se nada mudar: o custo de ficar como está, com um exemplo do dia a dia.]', 'Comece pelo problema, não pela solução. Quem fala este slide é o patrocinador.')
s = slide('De e para', 'O que muda na prática', 'Três ou quatro linhas bastam. Use exemplos concretos do trabalho das pessoas.')
caixa(s, 0.6, 1.75, 5.7, 0.6, CZC); texto(s, 0.85, 1.85, 5.2, 0.4, 'HOJE', 12, CZ, True)
caixa(s, 7.03, 1.75, 5.7, 0.6, AZP); texto(s, 7.28, 1.85, 5.2, 0.4, 'COM A MUDANÇA', 12, BR, True)
for i in range(4):
    y = 2.55 + i * 1.02
    caixa(s, 0.6, y, 5.7, 0.9, BR, LIN); texto(s, 0.85, y + 0.25, 5.2, 0.5, '[Como é feito hoje]', 14, CZ)
    f = caixa(s, 6.42, y + 0.25, 0.5, 0.4, AZ, forma=MSO_SHAPE.RIGHT_ARROW)
    caixa(s, 7.03, y, 5.7, 0.9, AZC); texto(s, 7.28, y + 0.25, 5.2, 0.5, '[Como passa a ser]', 14, AZP, True)
s = slide('Para quem', 'O que muda para cada grupo', 'Uma coluna por público. Diga o que muda, o que não muda e o que cada um ganha.')
colunas(s, [('[Público 1]', '[O que muda no dia a dia]\n\n[O que não muda]\n\n[O que ganha]'), ('[Público 2]', '[O que muda no dia a dia]\n\n[O que não muda]\n\n[O que ganha]'), ('[Público 3]', '[O que muda no dia a dia]\n\n[O que não muda]\n\n[O que ganha]')], numerar=False)
s = slide('Jornada', 'O caminho até o go-live', 'Marcos que as pessoas vão sentir: comunicação, capacitação, virada e apoio.')
caixa(s, 0.9, 3.55, 11.5, 0.06, AZP)
for i, (m, d) in enumerate([('[mês]', 'Lançamento e escuta'), ('[mês]', 'Preparação dos gestores'), ('[mês]', 'Capacitação e prática'), ('[mês]', 'Go-live'), ('[mês]', 'Apoio e reforço')]):
    x = 0.9 + i * 2.875
    f = caixa(s, x - 0.22, 3.36, 0.44, 0.44, AZ if i == 3 else AZP, BR, MSO_SHAPE.OVAL); no(f, str(i + 1), 11)
    texto(s, x - 1.1, 2.5, 2.2, 0.4, m, 13, AZ, True, alinh=PP_ALIGN.CENTER); texto(s, x - 1.1, 4.0, 2.2, 0.8, d, 14, TINTA, True, alinh=PP_ALIGN.CENTER)
    texto(s, x - 1.1, 4.75, 2.2, 1.2, '[O que acontece e o que se espera das pessoas]', 11.5, CZ, alinh=PP_ALIGN.CENTER)
s = slide('Apoio', 'Você não vai fazer isso sozinho', 'Mostre a rede de apoio: quem procurar, onde aprender e como dar retorno.')
colunas(s, [('Seu gestor', 'Primeira referência para dúvidas e para o que muda na sua rotina.'), ('Multiplicadores', '[Nomes ou áreas] Colegas preparados para ajudar no posto de trabalho.'), ('Capacitação', '[Formatos e datas] Prática perto do uso, guias rápidos e vídeos curtos.'), ('Canal de escuta', '[Onde registrar dúvidas e sugestões] Tudo o que chega tem resposta.')])
frase_grande('O que pedimos', '[O compromisso que esperamos de cada pessoa, em uma frase.]', '[Três atitudes concretas: participar da capacitação, testar no ambiente de prática, trazer o que não funciona.]', 'Feche com um pedido claro e com a próxima data que importa.')
salva('apresentacao-kickoff-da-mudanca.pptx')

# ================= 2 · Relatório executivo de adoção =================
novo()
capa('Relatório executivo', ['Adoção do', '[nome do projeto]'], 'Modelo de apresentação para o comitê. Mostra uso real, onde a adoção trava e as decisões que precisam ser tomadas.')
s = slide('Síntese', 'A adoção em uma tela', 'Abra com a resposta: estamos no caminho ou não, e por quê.')
caixa(s, 0.6, 1.75, 12.13, 1.25, AZP); texto(s, 0.9, 1.9, 11.5, 0.3, 'MENSAGEM PRINCIPAL', 10, AZS, True); texto(s, 0.9, 2.2, 11.5, 0.7, '[Em uma frase: como está a adoção e o que isso significa para o resultado do projeto.]', 20, BR, fonte=TIT)
for i, (r, d) in enumerate([('Índice de adoção', 'pessoas que usam na rotina'), ('Velocidade', 'tempo até o uso esperado'), ('Proficiência', 'tarefas sem retrabalho'), ('Benefício', 'resultado em relação ao previsto')]):
    x = 0.6 + i * 3.08
    caixa(s, x, 3.25, 2.9, 1.75, CZC); texto(s, x + 0.2, 3.38, 2.5, 0.3, r.upper(), 10, CZ, True); texto(s, x + 0.2, 3.7, 2.5, 0.75, '[xx%]', 32, AZP, fonte=TIT); texto(s, x + 0.2, 4.5, 2.5, 0.4, d, 11, CZ)
texto(s, 0.6, 5.3, 12.13, 1.4, ['Tendência desde o último comitê: [subiu, estável ou caiu] · [causa provável em uma linha]', 'Risco principal: [o que mais ameaça a adoção agora]'], 14, TINTA)
s = slide('Por área', 'Onde a adoção avança e onde trava', 'Substitua as barras pelos seus números. A cor indica a marca da régua de adoção.')
niv = [('Resiste', RGBColor(0x98, 0xA2, 0xB3)), ('Observa', CZ), ('Experimenta', AZS), ('Adota', AZ), ('Multiplica', AZP)]
for i, (n, c) in enumerate(niv):
    f = caixa(s, 2.6 + i * 1.75, 1.75, 1.65, 0.42, c); no(f, n, 11, TINTA if i == 2 else BR)
for j, ps in enumerate([[10, 20, 30, 30, 10], [25, 35, 20, 15, 5], [5, 15, 25, 35, 20], [30, 35, 20, 15, 0], [15, 25, 30, 20, 10]]):
    y = 2.45 + j * 0.78
    texto(s, 0.6, y + 0.12, 1.9, 0.4, f'[Área {j + 1}]', 13, TINTA, True); x = 2.6
    for i, pc in enumerate(ps):
        if not pc: continue
        w = 8.6 * pc / 100; f = caixa(s, x, y, w - 0.03, 0.58, niv[i][1]); no(f, f'{pc}%', 10.5, TINTA if i == 2 else BR); x += w
    texto(s, 11.35, y + 0.1, 1.38, 0.4, f'{ps[3] + ps[4]}%', 16, AZP, True, alinh=PP_ALIGN.RIGHT)
texto(s, 11.0, 1.8, 1.73, 0.3, 'ÍNDICE', 10, CZ, True, alinh=PP_ALIGN.RIGHT)
s = slide('Causas', 'Por que a adoção trava: leitura ADKAR', 'Para cada grupo com adoção baixa, diga a barreira e a ação. Use a planilha "Avaliação ADKAR com mapa de resistência".')
tabela(s, 0.6, 1.75, 12.13, 4.5, [['Grupo', 'Pessoas', 'Ponto de barreira', 'Evidência', 'Ação', 'Dono e prazo']] + [['[Grupo]', '[nº]', '[Consciência, Desejo, Conhecimento, Habilidade ou Reforço]', '[O que os dados e as conversas mostram]', '[O que será feito]', '[Nome · data]'] for _ in range(5)], [1.9, 0.9, 2.5, 2.9, 2.4, 1.53])
s = slide('Decisões', 'O que precisamos do comitê hoje', 'Cada decisão com contexto, opções e recomendação. O comitê existe para decidir, não só para ser informado.')
for i in range(3):
    y = 1.75 + i * 1.62
    caixa(s, 0.6, y, 12.13, 1.45, CZC if i % 2 else AZC); f = caixa(s, 0.6, y, 0.9, 1.45, AZP); no(f, f'{i + 1:02d}', 20)
    texto(s, 1.75, y + 0.15, 6.6, 0.4, '[Decisão necessária]', 16, AZP, True); texto(s, 1.75, y + 0.6, 6.6, 0.75, '[Contexto em uma ou duas linhas e as opções]', 12, CZ)
    texto(s, 8.6, y + 0.15, 3.9, 0.3, 'RECOMENDAÇÃO', 10, AZ, True); texto(s, 8.6, y + 0.5, 3.9, 0.8, '[O que recomendamos e por quê]', 12.5, TINTA)
s = slide('Próximo ciclo', 'O que acontece até o próximo comitê', 'Compromissos com dono e data. Volte a este slide na abertura da próxima reunião.')
tabela(s, 0.6, 1.75, 12.13, 4.4, [['Ação', 'Resultado esperado na adoção', 'Dono', 'Data', 'Status']] + [['[Ação]', '[O que deve mudar no uso]', '[Nome]', '[dd/mm]', '[A fazer]'] for _ in range(6)], [4.0, 4.0, 1.7, 1.2, 1.23])
salva('relatorio-executivo-de-adocao.pptx')

# ================= 3 · Workshop com patrocinadores =================
novo()
capa('Workshop', ['O papel do patrocinador', 'na mudança'], 'Roteiro de 90 minutos para alinhar a liderança: o que se espera de quem patrocina, onde estão os riscos e quais compromissos saem da sala.')
s = slide('Agenda', 'Noventa minutos, quatro blocos', 'Ajuste os tempos. O bloco de compromissos não pode ser cortado.')
for i, (t, m, d) in enumerate([('Onde estamos', '15 min', 'O que muda, para quem e o que já sabemos da adoção.'), ('O papel de quem patrocina', '20 min', 'Três atitudes que só a liderança pode ter.'), ('Onde podemos travar', '30 min', 'Stakeholders, resistências e carga de mudança.'), ('Compromissos', '25 min', 'O que cada líder faz nos próximos 30 dias.')]):
    y = 1.75 + i * 1.2
    caixa(s, 0.6, y, 12.13, 1.05, CZC if i % 2 else AZC); texto(s, 0.85, y + 0.18, 1.2, 0.7, f'{i + 1:02d}', 26, AZ, fonte=TIT, italico=True)
    texto(s, 2.0, y + 0.14, 6.5, 0.4, t, 17, AZP, True); texto(s, 2.0, y + 0.56, 8.0, 0.4, d, 12.5, CZ); texto(s, 10.7, y + 0.3, 1.8, 0.4, m, 14, AZP, True, alinh=PP_ALIGN.RIGHT)
divisor('01', 'Onde estamos', 'Use dois ou três slides do kit: a mudança em uma página, impactos e mapa de adoção.')
s = slide('O papel', 'Três atitudes que só o patrocinador pode ter', 'Peça exemplos concretos de cada atitude neste projeto.')
colunas(s, [('Participar de forma ativa e visível', 'Estar presente do começo ao fim, não só no lançamento. Abrir reuniões, perguntar pela adoção, aparecer na operação.\n\nNeste projeto: [exemplo]'), ('Formar a coalizão de líderes', 'Alinhar os outros diretores e gestores para que digam a mesma coisa às suas equipes.\n\nNeste projeto: [quem precisa estar junto]'), ('Comunicar diretamente', 'Explicar por que a mudança existe e o risco de não mudar. Essa mensagem tem mais força vinda do topo.\n\nNeste projeto: [momentos e canais]')])
divisor('02', 'Onde podemos travar', 'Exercício em grupo: quem tem influência e ainda não apoia, e o que essa pessoa perde com a mudança.')
s = slide('Exercício', 'Quem precisamos conquistar', 'Preencham juntos. A última coluna só vale com nome e data.')
tabela(s, 0.6, 1.75, 12.13, 4.5, [['Stakeholder', 'Influência', 'Posição hoje', 'O que perde ou teme', 'Quem conversa', 'Até quando']] + [['[Nome ou grupo]', '[Alta, média, baixa]', '[Resiste, neutro, apoia]', '[Em uma linha]', '[Patrocinador responsável]', '[data]'] for _ in range(5)], [2.4, 1.5, 1.9, 3.0, 2.0, 1.33])
s = slide('Compromissos', 'O que cada líder faz nos próximos 30 dias', 'Projete e preencha na hora. Envie a todos no mesmo dia.')
tabela(s, 0.6, 1.75, 12.13, 4.5, [['Líder', 'Compromisso', 'Com quem', 'Data', 'Como saberemos que aconteceu']] + [['[Nome]', '[Ação visível]', '[Equipe ou stakeholder]', '[dd/mm]', '[Evidência]'] for _ in range(6)], [2.0, 4.0, 2.2, 1.2, 2.73])
frase_grande('Fechamento', 'As pessoas observam o líder da própria área antes de decidir se a mudança é para valer.', '[Próximo encontro deste grupo: data] · [Quem acompanha os compromissos: nome]', 'Termine com a data do próximo encontro.')
salva('workshop-com-patrocinadores.pptx')
