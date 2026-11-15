"""Sistema visual das apresentações-modelo do blog Change Management World.

Reúne o que os geradores compartilham:
- identidade: paleta estrita, Georgia nos títulos, Calibri no texto, grade de 12 colunas;
- modelo do PowerPoint: tema, slide mestre e sete layouts (capa, divisória, somente título,
  título e conteúdo, mensagem, fechamento e em branco), com a assinatura e o número do slide;
- componentes editáveis: texto, fios, painéis, tabelas e gráficos nativos;
- componentes de gestão da mudança: matriz RACI, mapa de influência, matriz de riscos,
  régua de adoção, cartões de indicador e painéis de tendência;
- dados de exemplo, os mesmos das planilhas do blog.

Usado por modelos_pptx.py, modelos_pptx_extra.py, modelos_pptx_matrizes.py e
modelos_pptx_indicadores.py. Este módulo não gera arquivo sozinho.
"""
import datetime
import os
import re
import uuid
from xml.sax.saxutils import escape

from lxml import etree
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.dml.color import RGBColor
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION, XL_LEGEND_POSITION, XL_MARKER_STYLE, XL_TICK_LABEL_POSITION, XL_TICK_MARK
from pptx.enum.dml import MSO_LINE
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
from pptx.oxml import parse_xml
from pptx.oxml.ns import qn
from pptx.util import Emu, Pt

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'modelos')

# ================================================================ identidade
# Paleta estrita do blog. Nenhuma outra cor entra nos arquivos.
AZP = '0A2463'    # azul profundo: capas, títulos, nível mais alto
AZ = '2F6FED'     # azul vivo: fio de acento, destaques
CZ = '667085'     # cinza: texto de apoio, rótulos
AZC = 'EAF1FE'    # azul muito claro: painéis de destaque, nível mais baixo
CZC = 'F3F5F8'    # cinza muito claro: painéis neutros
AZS = '9DBDFF'    # azul suave: nível intermediário, texto sobre azul profundo
LIN = 'E0E5EC'    # linhas e divisores
TINTA = '0B1530'  # tinta do texto
BR = 'FFFFFF'
PALETA = {AZP, AZ, CZ, AZC, CZC, AZS, LIN, TINTA, BR}

TIT, TXT = 'Georgia', 'Calibri'
MARCA = 'Change Management World'
AUTOR = 'Victor Vitorino'
EXEMPLO = 'Exemplo ilustrativo: substitua pelos dados do seu projeto.'

# Escala tipográfica (pt). Poucos tamanhos, um papel para cada um.
T_CAPA, T_SECAO, T_FRASE, T_TITULO = 40, 36, 32, 28      # Georgia
T_BLOCO, T_LEAD, T_CORPO, T_TAB = 18, 16, 13, 12
T_ROTULO, T_RODAPE = 10, 9
T_NUMERO = 40                                            # algarismos de destaque, em Calibri

# ================================================================ grade (polegadas)
EMU_POL = 914400
LARG, ALT = 12192000 / EMU_POL, 6858000 / EMU_POL        # 13,333 x 7,5 (16:9)
MARGEM = 0.8
UTIL = LARG - 2 * MARGEM
DIR = LARG - MARGEM
NCOL, CALHA = 12, 0.24
LCOL = (UTIL - (NCOL - 1) * CALHA) / NCOL
Y_OLHO, Y_TITULO, H_TITULO = 0.62, 0.92, 1.0
Y_TOPO, Y_BASE = 2.2, 6.5                                # área de conteúdo
H_UTIL = Y_BASE - Y_TOPO
Y_DICA = 6.62
Y_FIO_RODAPE, Y_RODAPE = 6.96, 7.05
L_CAPA, L_DIVISORIA, L_TITULO, L_CONTEUDO, L_MENSAGEM, L_FECHAMENTO, L_BRANCO = range(7)


def col(i, n=1):
    """Posição x e largura de um bloco que começa na coluna i (0 a 11) e ocupa n colunas da grade."""
    return MARGEM + i * (LCOL + CALHA), n * LCOL + (n - 1) * CALHA


def faixas(n, x=MARGEM, w=UTIL, calha=0.3):
    """Divide a largura em n faixas iguais separadas por uma calha. Devolve [(x, largura)]."""
    lw = (w - (n - 1) * calha) / n
    return [(x + i * (lw + calha), lw) for i in range(n)]


def E(pol):
    return Emu(int(round(pol * EMU_POL)))


def rgb(hexa):
    return RGBColor.from_string(hexa)


# ================================================================ modelo: tema, mestre e layouts
_NS = ('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
       'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
       'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"')
_A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
_C = 'http://schemas.openxmlformats.org/drawingml/2006/chart'
_RAIZ_ARVORE = ('<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/>'
                '<a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>')


def _emu(pol):
    return int(round(pol * EMU_POL))


def _xfrm(x, y, w, h, inverte=False):
    return f'<a:xfrm{" flipV=\"1\"" if inverte else ""}><a:off x="{_emu(x)}" y="{_emu(y)}"/><a:ext cx="{_emu(w)}" cy="{_emu(h)}"/></a:xfrm>'


def _cor(hexa):
    return f'<a:solidFill><a:srgbClr val="{hexa}"/></a:solidFill>'


def _rpr(tam=None, cor=None, fonte=None, negrito=None, italico=None, esp=None, caixa=False, lang='pt-BR', tag='a:rPr'):
    at = f' lang="{lang}"' if lang else ''
    at += f' sz="{int(tam * 100)}"' if tam else ''
    at += '' if negrito is None else f' b="{int(negrito)}"'
    at += '' if italico is None else f' i="{int(italico)}"'
    at += ' cap="all"' if caixa else ''
    at += f' spc="{int(esp * 100)}"' if esp else ''
    filhos = (_cor(cor) if cor else '') + (f'<a:latin typeface="{fonte}"/>' if fonte else '')
    return f'<{tag}{at}>{filhos}</{tag}>' if filhos else f'<{tag}{at}/>'


def _run(t, **estilo):
    return f'<a:r>{_rpr(**estilo)}<a:t>{escape(t)}</a:t></a:r>'


def _nivel(n=1, alinh='l', antes=0, recuo=0, marcador=None, **estilo):
    """Estilo de um nível de texto (lvlNpPr) para o mestre ou para o lstStyle de um marcador de posição."""
    bu = (f'<a:buClr><a:srgbClr val="{AZ}"/></a:buClr><a:buFont typeface="Arial"/><a:buChar char="{marcador}"/>' if marcador else '<a:buNone/>')
    return (f'<a:lvl{n}pPr marL="{_emu(recuo)}" indent="{-_emu(0.18) if marcador else 0}" algn="{alinh}" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1">'
            f'<a:spcBef><a:spcPts val="{int(antes * 100)}"/></a:spcBef>{bu}{_rpr(lang=None, tag="a:defRPr", **estilo)}</a:lvl{n}pPr>')


def _ph(id_, nome, tipo, idx=None, geom=None, estilo='', dica='', ancora=None, tam_ph=None, proprio=True):
    """Marcador de posição (placeholder) de mestre ou layout. dica é o texto de orientação que aparece enquanto está vazio."""
    ph = '<p:ph' + (f' type="{tipo}"' if tipo else '') + (f' sz="{tam_ph}"' if tam_ph else '') + (f' idx="{idx}"' if idx is not None else '') + (' hasCustomPrompt="1"' if dica and proprio else '') + '/>'
    sppr = f'<p:spPr>{_xfrm(*geom)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>' if geom else '<p:spPr/>'
    corpo = (f'<a:bodyPr vert="horz" wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="{ancora}"><a:noAutofit/></a:bodyPr>' if ancora else '<a:bodyPr/>')
    par = f'<a:p><a:r><a:rPr lang="pt-BR"/><a:t>{escape(dica)}</a:t></a:r><a:endParaRPr lang="pt-BR"/></a:p>' if dica else '<a:p><a:endParaRPr lang="pt-BR"/></a:p>'
    return (f'<p:sp><p:nvSpPr><p:cNvPr id="{id_}" name="{nome}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr>{ph}</p:nvPr></p:nvSpPr>'
            f'{sppr}<p:txBody>{corpo}<a:lstStyle>{estilo}</a:lstStyle>{par}</p:txBody></p:sp>')


def _caixa_fixa(id_, nome, x, y, w, h, paragrafos, ancora='t'):
    """Caixa de texto fixa do layout (não é marcador de posição: fica igual em todos os slides)."""
    return (f'<p:sp><p:nvSpPr><p:cNvPr id="{id_}" name="{nome}"/><p:cNvSpPr txBox="1"/><p:nvPr userDrawn="1"/></p:nvSpPr>'
            f'<p:spPr>{_xfrm(x, y, w, h)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>'
            f'<p:txBody><a:bodyPr vert="horz" wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="{ancora}"><a:noAutofit/></a:bodyPr>'
            f'<a:lstStyle/>{paragrafos}</p:txBody></p:sp>')


def _linha_fixa(id_, nome, x1, y1, x2, y2, cor, esp=0.75):
    inverte = (x2 - x1) * (y2 - y1) < 0          # linha que sobe da esquerda para a direita
    return (f'<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="{id_}" name="{nome}"/><p:cNvCxnSpPr/><p:nvPr userDrawn="1"/></p:nvCxnSpPr>'
            f'<p:spPr>{_xfrm(min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1), inverte)}<a:prstGeom prst="line"><a:avLst/></a:prstGeom>'
            f'<a:ln w="{int(esp * 12700)}" cap="flat">{_cor(cor)}</a:ln></p:spPr></p:cxnSp>')


def _poligono_fixo(id_, nome, pontos, cor=None, contorno=None, esp=1.0):
    """Forma livre nativa a partir de uma lista de pontos (em polegadas)."""
    x0, y0 = min(p[0] for p in pontos), min(p[1] for p in pontos)
    w, h = max(p[0] for p in pontos) - x0, max(p[1] for p in pontos) - y0
    pt = lambda p: f'<a:pt x="{_emu(p[0] - x0)}" y="{_emu(p[1] - y0)}"/>'
    caminho = f'<a:moveTo>{pt(pontos[0])}</a:moveTo>' + ''.join(f'<a:lnTo>{pt(p)}</a:lnTo>' for p in pontos[1:]) + '<a:close/>'
    preench = _cor(cor) if cor else '<a:noFill/>'
    linha = f'<a:ln w="{int(esp * 12700)}" cap="flat">{_cor(contorno)}<a:round/></a:ln>' if contorno else '<a:ln><a:noFill/></a:ln>'
    return (f'<p:sp><p:nvSpPr><p:cNvPr id="{id_}" name="{nome}"/><p:cNvSpPr/><p:nvPr userDrawn="1"/></p:nvSpPr><p:spPr>{_xfrm(x0, y0, w, h)}'
            f'<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/><a:pathLst>'
            f'<a:path w="{_emu(w)}" h="{_emu(h)}">{caminho}</a:path></a:pathLst></a:custGeom>{preench}{linha}</p:spPr></p:sp>')


def _assinatura(id_, cor, com_numero=True, fio=LIN):
    """Rodapé fixo: fio, assinatura à esquerda e número do slide (campo automático) à direita."""
    marca = (_run('Change Management ', tam=T_RODAPE, cor=cor, fonte=TXT) + _run('World', tam=T_RODAPE + 0.5, cor=cor, fonte=TIT, italico=True)
             + _run('   ·   ' + AUTOR, tam=T_RODAPE, cor=cor, fonte=TXT))
    xml = _linha_fixa(id_, 'Fio do rodapé', MARGEM, Y_FIO_RODAPE, DIR, Y_FIO_RODAPE, fio)
    xml += _caixa_fixa(id_ + 1, 'Assinatura', MARGEM, Y_RODAPE, 7.0, 0.22, f'<a:p>{marca}<a:endParaRPr lang="pt-BR" sz="{T_RODAPE * 100}"/></a:p>')
    if com_numero:
        campo = (f'<a:p><a:pPr algn="r"/><a:fld id="{{B6F15528-21DE-4FAA-801E-634DDDAF4B2B}}" type="slidenum">{_rpr(tam=T_RODAPE, cor=cor, fonte=TXT)}'
                 f'<a:t>‹nº›</a:t></a:fld><a:endParaRPr lang="pt-BR" sz="{T_RODAPE * 100}"/></a:p>')
        xml += _caixa_fixa(id_ + 2, 'Número do slide', DIR - 1.0, Y_RODAPE, 1.0, 0.22, campo)
    return xml


def _iceberg(id_, cx, yw, k=1.0, linha_de=None, linha_ate=LARG):
    """Motivo da marca ("além do raso"): a ponta que se vê, cheia, e a massa que sustenta a mudança, só em contorno.

    cx é o eixo horizontal, yw a linha d'água e k a escala. Só formas livres e linhas nativas.
    """
    pt = lambda dx, dy: (cx + dx * k, yw + dy * k)
    xml, n = '', id_
    borda = [(-1.30, 0.17), (1.35, 0.17), (1.90, 1.15), (1.60, 2.40), (0.50, 3.50), (-0.65, 2.90), (-1.45, 1.80), (-1.65, 1.00)]
    centro = (0.0, 1.40)
    xml += _poligono_fixo(n, 'Iceberg: o que sustenta', [pt(*p) for p in borda], contorno=AZ, esp=1.25); n += 1
    for alvo in [(0.08, 0.17), (-1.65, 1.00), (1.90, 1.15), (1.60, 2.40), (0.50, 3.50), (-0.65, 2.90)]:
        a, b = pt(*centro), pt(*alvo)
        xml += _linha_fixa(n, 'Iceberg: faceta', a[0], a[1], b[0], b[1], AZ, 1.25); n += 1
    # ponta visível: as facetas laterais passam por baixo da central para não deixar fresta
    for pts, cor in [([(-0.38, -0.90), (0.0, -0.90), (0.0, -0.05), (-0.84, -0.05), (-0.68, -0.58)], AZC),
                     ([(0.02, -1.80), (0.75, -0.62), (0.92, -0.05), (0.0, -0.05), (0.0, -1.0)], AZS),
                     ([(0.02, -1.80), (0.32, -0.98), (0.12, -0.05), (-0.34, -0.05), (-0.38, -0.90)], BR)]:
        xml += _poligono_fixo(n, 'Iceberg: o que se vê', [pt(*p) for p in pts], cor=cor); n += 1
    x0 = cx - 2.05 * k if linha_de is None else linha_de
    xml += _linha_fixa(n, "Iceberg: linha d'água", x0, yw + 0.035 * k, linha_ate, yw + 0.035 * k, AZS, 0.75)
    return xml


def _csld(nome, formas, fundo=None):
    bg = f'<p:bg><p:bgPr>{_cor(fundo)}<a:effectLst/></p:bgPr></p:bg>' if fundo else ''
    return f'<p:cSld {_NS} name="{nome}">{bg}<p:spTree>{_RAIZ_ARVORE}{formas}</p:spTree></p:cSld>'


def _xml_mestre():
    niveis = (_nivel(1, antes=6, tam=14, cor=TINTA, fonte=TXT) + _nivel(2, antes=4, recuo=0.22, marcador='•', tam=T_CORPO, cor=TINTA, fonte=TXT)
              + _nivel(3, antes=3, recuo=0.44, marcador='–', tam=T_TAB, cor=TINTA, fonte=TXT) + _nivel(4, antes=3, recuo=0.66, marcador='–', tam=T_TAB, cor=CZ, fonte=TXT)
              + _nivel(5, antes=3, recuo=0.88, marcador='–', tam=T_TAB, cor=CZ, fonte=TXT))
    corpo = ''.join(f'<a:p><a:pPr lvl="{i}"/><a:r><a:rPr lang="pt-BR"/><a:t>{t}</a:t></a:r></a:p>'
                    for i, t in enumerate(['Clique para editar o texto', 'Segundo nível', 'Terceiro nível', 'Quarto nível', 'Quinto nível']))
    formas = _ph(2, 'Título', 'title', geom=(MARGEM, Y_TITULO, UTIL, H_TITULO), ancora='t', dica='Clique para editar o título', proprio=False)
    formas += (f'<p:sp><p:nvSpPr><p:cNvPr id="3" name="Texto"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>'
               f'<p:spPr>{_xfrm(MARGEM, Y_TOPO, UTIL, H_UTIL)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>'
               f'<p:txBody><a:bodyPr vert="horz" wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="t"><a:noAutofit/></a:bodyPr><a:lstStyle/>{corpo}</p:txBody></p:sp>')
    estilos = (f'<p:txStyles {_NS}><p:titleStyle>{_nivel(1, tam=T_TITULO, cor=AZP, fonte=TIT, negrito=False)}</p:titleStyle>'
               f'<p:bodyStyle>{niveis}</p:bodyStyle><p:otherStyle>{_nivel(1, tam=14, cor=TINTA, fonte=TXT)}</p:otherStyle></p:txStyles>')
    return _csld('Mestre', formas, BR), estilos


def _xml_layouts():
    """Devolve [(tipo, xml do cSld)] dos sete layouts, na ordem em que aparecem no PowerPoint (ver L_CAPA etc.)."""
    olho = lambda cor: _nivel(1, tam=T_ROTULO, cor=cor, fonte=TXT, negrito=True, esp=1.5, caixa=True)
    ph_olho = lambda id_, cor, y=Y_OLHO: _ph(id_, 'Olho', 'body', 13, (MARGEM, y, 9.0, 0.26), olho(cor), 'Seção ou tema', 't', 'quarter')
    titulo = _ph(3, 'Título', 'title', dica='Escreva o título como a conclusão do slide')
    acento = lambda y: _linha_fixa(6, 'Fio de acento', MARGEM, y, MARGEM + 0.7, y, AZ, 2)
    # capa: bloco de texto à esquerda, iceberg à direita
    capa = _iceberg(20, 10.75, 3.12)
    capa += acento(2.32) + ph_olho(2, AZS, 2.52)
    capa += _ph(3, 'Título', 'ctrTitle', None, (MARGEM, 2.92, 8.0, 1.6), _nivel(1, tam=T_CAPA, cor=BR, fonte=TIT, negrito=False), 'Título da apresentação', 't')
    capa += _ph(4, 'Subtítulo', 'subTitle', 1, (MARGEM, 4.68, 6.4, 1.1), _nivel(1, tam=T_LEAD, cor=AZC, fonte=TXT), 'Para quem é e o que se decide com esta apresentação', 't')
    capa += _ph(5, 'Área e data', 'body', 14, (MARGEM, 6.42, 7.0, 0.3), _nivel(1, tam=T_TAB, cor=AZS, fonte=TXT), '[Área responsável] · [mês e ano]', 't', 'quarter')
    capa += _assinatura(7, AZS, com_numero=False, fio=AZ)
    # divisória: número e título apoiados na linha d'água; o texto de apoio fica abaixo dela
    div = _iceberg(20, 11.15, 4.45, 0.55, linha_de=MARGEM, linha_ate=DIR)
    div += _ph(2, 'Número', 'body', 14, (MARGEM, 2.55, 1.45, 1.8), _nivel(1, tam=54, cor=AZS, fonte=TIT, italico=True), '00', 'b', 'quarter')
    div += _ph(3, 'Título', 'title', None, (2.35, 2.2, 7.6, 2.1), _nivel(1, tam=T_SECAO, cor=BR, fonte=TIT, negrito=False), 'Título da seção', 'b')
    div += _ph(4, 'Texto de apoio', 'body', 1, (2.35, 4.8, 6.9, 1.2), _nivel(1, tam=T_LEAD, cor=AZC, fonte=TXT), 'O que esta seção responde', 't')
    div += ph_olho(5, AZS) + _assinatura(7, AZS, fio=AZ)
    # conteúdo
    so_titulo = ph_olho(2, AZ) + titulo + _assinatura(7, CZ)
    conteudo = ph_olho(2, AZ) + titulo + _ph(4, 'Conteúdo', None, 1, dica='Clique para adicionar texto, tabela ou gráfico') + _assinatura(7, CZ)
    mensagem = (ph_olho(2, AZ) + _ph(3, 'Mensagem', 'title', None, (MARGEM, Y_TITULO, 10.2, 2.4), _nivel(1, tam=T_FRASE, cor=AZP, fonte=TIT, negrito=False),
                                     'Escreva a mensagem em uma frase', 't') + _assinatura(7, CZ))
    # fechamento: a frase final acima da linha d'água, o que fica combinado abaixo dela
    fecho = _iceberg(20, 11.15, 4.05, 0.55, linha_de=MARGEM, linha_ate=DIR)
    fecho += ph_olho(2, AZS) + _ph(3, 'Mensagem', 'title', None, (MARGEM, Y_TITULO, 9.2, 2.6), _nivel(1, tam=T_FRASE, cor=BR, fonte=TIT, negrito=False),
                                   'Escreva a mensagem final em uma frase', 't') + _assinatura(7, AZS, fio=AZ)
    return [('title', _csld('Capa', capa, AZP)), ('secHead', _csld('Divisória', div, AZP)), ('titleOnly', _csld('Somente título', so_titulo)),
            ('obj', _csld('Título e conteúdo', conteudo)), (None, _csld('Mensagem', mensagem)), (None, _csld('Fechamento', fecho, AZP)),
            ('blank', _csld('Em branco', _assinatura(7, CZ)))]


def _tema(blob):
    """Troca cores, fontes e efeitos do tema: quem criar um objeto novo já recebe a identidade do blog, sem sombras."""
    raiz = etree.fromstring(blob)
    a = lambda t: f'{{{_A}}}{t}'
    raiz.set('name', MARCA)
    cores = raiz.find(f'.//{a("clrScheme")}'); cores.set('name', MARCA)
    for nome, hexa in [('dk1', TINTA), ('lt1', BR), ('dk2', AZP), ('lt2', CZC), ('accent1', AZ), ('accent2', AZP), ('accent3', AZS), ('accent4', CZ),
                       ('accent5', LIN), ('accent6', AZC), ('hlink', AZ), ('folHlink', CZ)]:
        el = cores.find(a(nome))
        for f in list(el): el.remove(f)
        etree.SubElement(el, a('srgbClr')).set('val', hexa)
    fontes = raiz.find(f'.//{a("fontScheme")}'); fontes.set('name', MARCA)
    fontes.find(f'{a("majorFont")}/{a("latin")}').set('typeface', TIT)
    fontes.find(f'{a("minorFont")}/{a("latin")}').set('typeface', TXT)
    solido = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
    linha = lambda w: f'<a:ln w="{w}" cap="flat" cmpd="sng" algn="ctr">{solido}<a:prstDash val="solid"/></a:ln>'
    novo = etree.fromstring(f'<a:fmtScheme xmlns:a="{_A}" name="{MARCA}"><a:fillStyleLst>{solido * 3}</a:fillStyleLst>'
                            f'<a:lnStyleLst>{linha(9525)}{linha(12700)}{linha(19050)}</a:lnStyleLst>'
                            f'<a:effectStyleLst>{"<a:effectStyle><a:effectLst/></a:effectStyle>" * 3}</a:effectStyleLst>'
                            f'<a:bgFillStyleLst>{solido * 3}</a:bgFillStyleLst></a:fmtScheme>')
    antigo = raiz.find(f'.//{a("fmtScheme")}')
    antigo.getparent().replace(antigo, novo)
    return etree.tostring(raiz, xml_declaration=True, encoding='UTF-8', standalone=True)


def _prepara(prs):
    """Transforma o modelo padrão do python-pptx no modelo do blog: 16:9, tema, mestre e layouts."""
    prs.slide_width, prs.slide_height = Emu(12192000), Emu(6858000)
    tam = prs._element.find(qn('p:sldSz'))
    if 'type' in tam.attrib: del tam.attrib['type']
    for d in prs._element.iter(qn('a:defRPr')):
        if d.get('lang'): d.set('lang', 'pt-BR')
    mestre = prs.slide_master
    tema = mestre.part.part_related_by(RT.THEME)
    tema._blob = _tema(tema.blob)
    csld, estilos = _xml_mestre()
    raiz = mestre._element
    raiz.replace(raiz.find(qn('p:cSld')), parse_xml(csld))
    raiz.replace(raiz.find(qn('p:txStyles')), parse_xml(estilos))
    layouts, specs = list(prs.slide_layouts), _xml_layouts()
    for layout, (tipo, xml) in zip(layouts, specs):
        el = layout._element
        for filho in list(el): el.remove(filho)
        el.append(parse_xml(xml))
        el.append(parse_xml(f'<p:clrMapOvr {_NS}><a:masterClrMapping/></p:clrMapOvr>'))
        for at in ('type', 'userDrawn', 'matchingName', 'showMasterSp'):
            if at in el.attrib: del el.attrib[at]
        if tipo: el.set('type', tipo)
        else: el.set('userDrawn', '1')
        el.set('preserve', '1')
    for layout in layouts[len(specs):]:
        prs.slide_layouts.remove(layout)
    # guias da grade (margens e área de conteúdo), para quem liga as guias no PowerPoint
    vista = prs.part.part_related_by(RT.VIEW_PROPS)
    guias = ''.join(f'<p:guide orient="horz" pos="{round(v * 576)}"/>' for v in (Y_TOPO, Y_BASE)) + ''.join(f'<p:guide pos="{round(v * 576)}"/>' for v in (MARGEM, DIR))
    vista._blob = re.sub(rb'<p:guideLst>.*?</p:guideLst>', f'<p:guideLst>{guias}</p:guideLst>'.encode(), vista.blob, flags=re.S)
    # sai do pacote o que veio do modelo padrão e não serve: miniatura e configuração de impressora
    pacote = prs.part.package
    for rid, rel in list(pacote._rels.items()):
        if rel.reltype == RT.THUMBNAIL: pacote._rels.pop(rid)
    for rid, rel in list(prs.part.rels.items()):
        if rel.reltype == RT.PRINTER_SETTINGS: prs.part.rels.pop(rid)


# ================================================================ texto
def P(t, **estilo):
    """Parágrafo com estilo próprio dentro de uma caixa de texto (ver texto())."""
    return dict(estilo, t=t)


def R(t, cor=CZ, **k):
    """Parágrafo em estilo de rótulo: caixa alta, negrito, letras espaçadas."""
    return P(t, **dict(dict(tam=T_ROTULO, cor=cor, negrito=True, esp=1.2, caixa=True), **k))


def H(t, cor=AZP, tam=T_BLOCO, **k):
    """Parágrafo em estilo de título de bloco (Georgia)."""
    return P(t, **dict(dict(tam=tam, cor=cor, fonte=TIT), **k))


_MARCAS = re.compile(r'(\*[^*]+\*|_[^_]+_)')
_ALINH = {'esq': PP_ALIGN.LEFT, 'centro': PP_ALIGN.CENTER, 'dir': PP_ALIGN.RIGHT}
_ANCORA = {'topo': MSO_ANCHOR.TOP, 'meio': MSO_ANCHOR.MIDDLE, 'base': MSO_ANCHOR.BOTTOM}


def _trechos(t):
    """Separa *negrito* e _itálico_ do texto simples. Devolve [(texto, negrito, itálico)]."""
    saida = []
    for parte in _MARCAS.split(t):
        if not parte: continue
        if len(parte) > 2 and parte[0] == parte[-1] == '*': saida.append((parte[1:-1], True, None))
        elif len(parte) > 2 and parte[0] == parte[-1] == '_': saida.append((parte[1:-1], None, True))
        else: saida.append((parte, None, None))
    return saida


def _escreve(tf, conteudo, tam=T_CORPO, cor=TINTA, fonte=TXT, negrito=False, italico=False, alinh='esq', esp=0, caixa=False,
             entre=4, antes=0, linha=None, marcador=None, herdar=False):
    """Preenche um text_frame. conteudo é um texto, um P(...) ou uma lista deles.

    No texto, *assim* vira negrito e _assim_ vira itálico; \\v quebra a linha sem abrir parágrafo.
    Com herdar=True (marcadores de posição), só entra o que foge do estilo do layout.
    """
    itens = conteudo if isinstance(conteudo, (list, tuple)) else [conteudo]
    base = dict(tam=tam, cor=cor, fonte=fonte, negrito=negrito, italico=italico, alinh=alinh, esp=esp, caixa=caixa, entre=entre, antes=antes, linha=linha, marcador=marcador)
    for i, item in enumerate(itens):
        e = dict(base, **item) if isinstance(item, dict) else dict(base, t=item)
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        if not herdar:
            p.alignment = _ALINH[e['alinh']]
            p.space_after = Pt(e['entre']); p.space_before = Pt(e['antes'])
            if e['linha']: p.line_spacing = e['linha']
        if e['marcador']:
            ppr = p._p.get_or_add_pPr(); ppr.set('marL', str(_emu(0.18))); ppr.set('indent', str(-_emu(0.18)))
            for xml in (f'<a:buClr xmlns:a="{_A}"><a:srgbClr val="{AZ}"/></a:buClr>', f'<a:buFont xmlns:a="{_A}" typeface="Arial"/>', f'<a:buChar xmlns:a="{_A}" char="{e["marcador"]}"/>'):
                ppr.append(parse_xml(xml))
        texto_p = e['t'].upper() if e['caixa'] else e['t']
        for j, trecho in enumerate(texto_p.split('\v')):
            if j: p.add_line_break()
            for t, neg, ita in _trechos(trecho):
                r = p.add_run(); r.text = t
                rpr = r._r.get_or_add_rPr(); rpr.set('lang', 'pt-BR')
                if herdar:
                    if neg: r.font.bold = True
                    if ita: r.font.italic = True
                    continue
                r.font.size = Pt(e['tam']); r.font.name = e['fonte']; r.font.color.rgb = rgb(e['cor'])
                r.font.bold = bool(e['negrito'] if neg is None else neg); r.font.italic = bool(e['italico'] if ita is None else ita)
                if e['esp']: rpr.set('spc', str(int(e['esp'] * 100)))
    return tf


def _quadro(tf, ancora='topo', mx=0.0, my=0.0, vertical=False):
    tf.word_wrap = True; tf.auto_size = MSO_AUTO_SIZE.NONE; tf.vertical_anchor = _ANCORA[ancora]
    tf.margin_left = tf.margin_right = E(mx); tf.margin_top = tf.margin_bottom = E(my)
    if vertical: tf._txBody.find(qn('a:bodyPr')).set('vert', 'vert270')     # texto de baixo para cima (título de eixo)


def texto(s, x, y, w, h, conteudo, ancora='topo', nome=None, vertical=False, **estilo):
    """Caixa de texto sem margens internas: o texto encosta na grade. Devolve a forma."""
    tb = s.shapes.add_textbox(E(x), E(y), E(w), E(h))
    _quadro(tb.text_frame, ancora, vertical=vertical); _escreve(tb.text_frame, conteudo, **estilo)
    if nome: tb.name = nome
    return tb


def rotulo(s, x, y, w, t, cor=CZ, alinh='esq', h=0.24, **k):
    """Rótulo curto em caixa alta, com espaçamento entre letras."""
    return texto(s, x, y, w, h, t, **dict(dict(tam=T_ROTULO, cor=cor, negrito=True, esp=1.2, caixa=True, alinh=alinh, entre=0), **k))


# ================================================================ formas
def _limpa_estilo(forma):
    """Tira a referência ao estilo do tema (contorno, sombra e cor herdados): vale só o que for definido aqui."""
    el = forma._element.find(qn('p:style'))
    if el is not None: forma._element.remove(el)


def _pinta(f, fundo, borda, esp):
    _limpa_estilo(f)
    if fundo: f.fill.solid(); f.fill.fore_color.rgb = rgb(fundo)
    else: f.fill.background()
    if borda: f.line.color.rgb = rgb(borda); f.line.width = Pt(esp)
    else: f.line.fill.background()


def ret(s, x, y, w, h, fundo=None, borda=None, esp=0.75, raio=0, t=None, ancora='meio', mx=0.1, my=0.05, nome=None, **estilo):
    """Retângulo de cantos retos (ou levemente arredondados, com raio em polegadas). Aceita texto dentro."""
    f = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if raio else MSO_SHAPE.RECTANGLE, E(x), E(y), E(w), E(h))
    if raio: f.adjustments[0] = min(0.5, raio / min(w, h))
    _pinta(f, fundo, borda, esp)
    _quadro(f.text_frame, ancora, mx, my)
    if t is not None: _escreve(f.text_frame, t, **dict(dict(alinh='centro', entre=0), **estilo))
    if nome: f.name = nome
    return f


def oval(s, x, y, d, fundo=None, borda=None, esp=0.75, t=None, nome=None, **estilo):
    """Círculo de diâmetro d. Aceita texto centralizado."""
    f = s.shapes.add_shape(MSO_SHAPE.OVAL, E(x), E(y), E(d), E(d))
    _pinta(f, fundo, borda, esp)
    _quadro(f.text_frame, 'meio')
    f.text_frame.word_wrap = False
    if t is not None: _escreve(f.text_frame, t, **dict(dict(alinh='centro', entre=0, negrito=True), **estilo))
    if nome: f.name = nome
    return f


def fio(s, x1, y1, x2, y2, cor=AZ, esp=1.5, tracejado=False, seta=False, nome=None):
    """Linha reta nativa. É o fio de acento (azul vivo) ou um divisor (cor LIN)."""
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, E(x1), E(y1), E(x2), E(y2))
    _limpa_estilo(c)
    c.line.color.rgb = rgb(cor); c.line.width = Pt(esp)
    if tracejado: c.line.dash_style = MSO_LINE.DASH
    if seta: c.line._get_or_add_ln().append(parse_xml(f'<a:tailEnd xmlns:a="{_A}" type="triangle" w="med" len="med"/>'))
    if nome: c.name = nome
    return c


def painel(s, x, y, w, h, conteudo=None, fundo=CZC, margem=0.22, ancora='topo', borda=None, my=None, **estilo):
    """Painel de fundo claro (ou azul profundo) com texto dentro. margem é a lateral; my, a de cima e de baixo."""
    return ret(s, x, y, w, h, fundo, borda, 0.75, 0, conteudo, ancora, margem, margem * 0.8 if my is None else my, **dict(dict(alinh='esq', entre=4), **estilo))


# níveis de estado, do mais fraco ao mais forte: (fundo, cor do texto). É a mesma escala das planilhas do blog:
# 0 neutro, 1 baixo, 2 médio, 3 alto. A intensidade do azul diz o nível; o texto sempre diz o nome.
NIVEIS = [(LIN, TINTA), (AZS, TINTA), (AZ, BR), (AZP, BR)]


def pilula(s, x, y, w, t, nivel=2, h=0.3, tam=T_ROTULO):
    """Etiqueta de estado, pintada pelo nível (0 a 3)."""
    fundo, tinta = NIVEIS[nivel]
    return ret(s, x, y, w, h, fundo, None, 0.75, 0.05, t, 'meio', 0.04, 0.0, tam=tam, cor=tinta, negrito=True)


def celula(t, nivel, **k):
    """Célula de tabela pintada pelo nível (0 a 3), com o texto centralizado."""
    fundo, tinta = NIVEIS[nivel]
    return dict(dict(t=t, fundo=fundo, cor=tinta, alinh='centro', negrito=nivel >= 2), **k)


# notas de 1 a 5 na régua das planilhas: cinzas para as notas baixas, azuis para as altas
NOTAS = {1: (CZ, BR), 2: (LIN, TINTA), 3: (CZC, TINTA), 4: (AZS, TINTA), 5: (AZ, BR)}


def celula_nota(n, destaque=False, **k):
    """Célula de tabela com uma nota de 1 a 5, pintada pela régua; com destaque, vai em azul profundo (ponto de barreira)."""
    fundo, tinta = (AZP, BR) if destaque else NOTAS[max(1, min(5, int(n)))]
    return dict(dict(t=str(n), fundo=fundo, cor=tinta, alinh='centro', negrito=True), **k)


def celula_media(m, **k):
    """Célula com uma média de 1 a 5, pintada pela marca da régua de adoção que ela sugere."""
    i = 0 if m < 2 else 1 if m < 3 else 2 if m < 4 else 3 if m < 4.6 else 4
    return dict(dict(t=arred(m), fundo=REGUA[i][1], cor=REGUA[i][2], alinh='centro', negrito=True), **k)


def numero(s, x, y, n, d=0.36, cheio=True, tam=T_TAB):
    """Marcador numerado: círculo cheio (azul profundo) ou só contorno."""
    return oval(s, x, y, d, AZP if cheio else BR, BR if cheio else AZP, 1.25, str(n), tam=tam, cor=BR if cheio else AZP)


def legenda(s, x, y, itens, passo=None, lado=0.14, tam=T_ROTULO, cor=CZ):
    """Legenda horizontal: quadrado de cor e nome. itens = [(cor, texto)]. Devolve o x final."""
    for fundo, t in itens:
        ret(s, x, y + 0.035, lado, lado, fundo)
        larg = (passo - lado - 0.1) if passo else (0.078 * len(t) * tam / 10 + 0.1)
        texto(s, x + lado + 0.08, y, larg, 0.24, t, tam=tam, cor=cor, entre=0)
        x += passo if passo else lado + 0.08 + larg + 0.22
    return x


# ================================================================ tabelas
_TAB_SEM_ESTILO = '{2D5ABB26-0587-4C30-8999-92F81FD0307C}'     # "Sem estilo, sem grade": só vale o que definimos


def _borda_celula(c, lados):
    """Bordas de uma célula: lados = {'T'|'B'|'L'|'R': (cor, espessura em pt)}; lado ausente fica sem borda."""
    tcpr = c._tc.get_or_add_tcPr()
    for el in list(tcpr):
        if el.tag in (qn('a:lnL'), qn('a:lnR'), qn('a:lnT'), qn('a:lnB')): tcpr.remove(el)
    for pos, lado in enumerate('LRTB'):
        v = lados.get(lado)
        xml = (f'<a:ln{lado} xmlns:a="{_A}" w="{int(v[1] * 12700)}" cap="flat" cmpd="sng" algn="ctr">{_cor(v[0])}<a:prstDash val="solid"/></a:ln{lado}>'
               if v else f'<a:ln{lado} xmlns:a="{_A}" w="0"><a:noFill/></a:ln{lado}>')
        tcpr.insert(pos, parse_xml(xml))


def tabela(s, x, y, larguras, linhas, alturas=0.5, alt_cab=0.4, tam=T_TAB, cab=True, alinh=None, ancora='meio', primeira=True,
           fio_cab=AZP, fio_lin=LIN, recuo=0.12, tam_cab=T_ROTULO, esp_cab=0.8, caixa_cab=True, nome=None):
    """Tabela nativa em estilo editorial: cabeçalho em rótulos, fio sob o cabeçalho e fios finos entre as linhas.

    linhas = lista de listas; cada célula é um texto ou um dict com t (texto) e, se quiser, fundo, cor, negrito,
    italico, alinh, tam, fonte, ancora. Célula com fundo vira "ladrilho" (bordas brancas dão o respiro).
    larguras em polegadas; alturas é um número ou uma lista por linha do corpo; alinh é uma lista por coluna.
    Com caixa_cab=False o cabeçalho vai em caixa normal, sem espaçamento: serve para colunas estreitas.
    """
    nl, nc = len(linhas), len(larguras)
    alts = [alt_cab if (cab and i == 0) else (alturas[i - (1 if cab else 0)] if isinstance(alturas, (list, tuple)) else alturas) for i in range(nl)]
    gf = s.shapes.add_table(nl, nc, E(x), E(y), E(sum(larguras)), E(sum(alts)))
    if nome: gf.name = nome
    tb = gf.table
    pr = tb._tbl.tblPr
    pr.set('firstRow', '1' if cab else '0'); pr.set('bandRow', '0')
    pr.find(qn('a:tableStyleId')).text = _TAB_SEM_ESTILO
    for j, lw in enumerate(larguras): tb.columns[j].width = E(lw)
    for i, lin in enumerate(linhas):
        tb.rows[i].height = E(alts[i])
        eh_cab = cab and i == 0
        for j in range(nc):
            v = lin[j] if j < len(lin) else ''
            d = v if isinstance(v, dict) else {'t': v}
            c = tb.cell(i, j)
            al = d.get('alinh') or (alinh[j] if alinh else 'esq')
            fundo = d.get('fundo')
            c.margin_left = E(0.04 if al == 'centro' else (0 if (j == 0 and not fundo) else recuo))
            c.margin_right = E(0.04 if al == 'centro' else (0 if (j == nc - 1 and al == 'dir') else recuo))
            c.margin_top = c.margin_bottom = E(0.05)
            c.vertical_anchor = _ANCORA['base' if eh_cab else d.get('ancora', ancora)]
            if eh_cab:
                est = dict(tam=d.get('tam', tam_cab), cor=d.get('cor', CZ), negrito=True, esp=d.get('esp', esp_cab if caixa_cab else 0), caixa=d.get('caixa', caixa_cab), alinh=al, entre=0)
            else:
                est = dict(tam=d.get('tam', tam), cor=d.get('cor', AZP if (j == 0 and primeira) else TINTA), negrito=d.get('negrito', j == 0 and primeira),
                           italico=d.get('italico', False), fonte=d.get('fonte', TXT), alinh=al, entre=d.get('entre', 0))
            _escreve(c.text_frame, d.get('t', ''), **est)
            if fundo:
                c.fill.solid(); c.fill.fore_color.rgb = rgb(fundo)
                bordas = {k: (BR, 2.5) for k in 'LRTB'}
                if cab and i == 1: bordas['T'] = (fio_cab, 1.25)      # o fio do cabeçalho continua sobre a primeira linha de ladrilhos
                _borda_celula(c, bordas)
            else:
                c.fill.background()
                _borda_celula(c, {'B': (fio_cab, 1.25)} if eh_cab else ({'B': (fio_lin, 0.75)} if fio_lin else {}))
    return tb


# ================================================================ gráficos nativos
def _sem_fundo(pai, antes_de):
    """Insere um spPr sem preenchimento nem contorno antes do primeiro dos elementos indicados (ou no fim)."""
    sp = parse_xml(f'<c:spPr xmlns:c="{_C}" xmlns:a="{_A}"><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>')
    for filho in pai:
        if filho.tag in [f'{{{_C}}}{t}' for t in antes_de]:
            filho.addprevious(sp); return
    pai.append(sp)


def _base_grafico(s, tipo, x, y, w, h, categorias, series, nome=None, descr=None, fmt='General'):
    dados = CategoryChartData(number_format=fmt)
    dados.categories = categorias
    for rot, valores in series: dados.add_series(rot, valores)
    gf = s.shapes.add_chart(tipo, E(x), E(y), E(w), E(h), dados)
    if nome: gf.name = nome
    if descr: gf._element.nvGraphicFramePr.cNvPr.set('descr', descr)
    g = gf.chart
    g.has_title = False; g.has_legend = False
    g.font.size = Pt(T_ROTULO); g.font.name = TXT; g.font.color.rgb = rgb(CZ)
    cs = g._chartSpace
    cs.find(f'{{{_C}}}date1904').addnext(parse_xml(f'<c:roundedCorners xmlns:c="{_C}" val="0"/>'))
    _sem_fundo(cs, ['txPr', 'externalData', 'printSettings', 'userShapes', 'extLst'])
    _sem_fundo(cs.find(f'{{{_C}}}chart/{{{_C}}}plotArea'), ['extLst'])
    return g


def area_plotagem(g, x, y, w, h):
    """Fixa a área interna de plotagem (em frações do quadro do gráfico) para alinhar com o que está em volta."""
    pa = g._chartSpace.find(f'{{{_C}}}chart/{{{_C}}}plotArea')
    antigo = pa.find(f'{{{_C}}}layout')
    if antigo is not None: pa.remove(antigo)
    pa.insert(0, parse_xml(f'<c:layout xmlns:c="{_C}"><c:manualLayout><c:layoutTarget val="inner"/><c:xMode val="edge"/><c:yMode val="edge"/>'
                           f'<c:x val="{x:.4f}"/><c:y val="{y:.4f}"/><c:w val="{w:.4f}"/><c:h val="{h:.4f}"/></c:manualLayout></c:layout>'))


def _eixo_cat(g, visivel=True, cor_linha=LIN, tam=T_ROTULO, cor=CZ, invertido=False):
    e = g.category_axis
    e.major_tick_mark = XL_TICK_MARK.NONE; e.minor_tick_mark = XL_TICK_MARK.NONE
    e.has_major_gridlines = False
    if cor_linha: e.format.line.color.rgb = rgb(cor_linha); e.format.line.width = Pt(0.75)
    else: e.format.line.fill.background()
    e.tick_label_position = XL_TICK_LABEL_POSITION.LOW if visivel else XL_TICK_LABEL_POSITION.NONE
    e.tick_labels.font.size = Pt(tam); e.tick_labels.font.color.rgb = rgb(cor); e.tick_labels.font.name = TXT
    if invertido: e.reverse_order = True
    return e


def _eixo_val(g, visivel=False, minimo=0, maximo=None, passo=None, fmt=None, grade=False):
    e = g.value_axis
    e.minimum_scale = minimo
    if maximo is not None: e.maximum_scale = maximo
    if passo: e.major_unit = passo
    e.major_tick_mark = XL_TICK_MARK.NONE; e.minor_tick_mark = XL_TICK_MARK.NONE
    e.has_major_gridlines = grade
    if grade: e.major_gridlines.format.line.color.rgb = rgb(LIN); e.major_gridlines.format.line.width = Pt(0.75)
    e.format.line.fill.background()
    e.tick_label_position = XL_TICK_LABEL_POSITION.LOW if visivel else XL_TICK_LABEL_POSITION.NONE
    e.tick_labels.font.size = Pt(T_ROTULO); e.tick_labels.font.color.rgb = rgb(CZ); e.tick_labels.font.name = TXT
    if fmt: e.tick_labels.number_format = fmt; e.tick_labels.number_format_is_linked = False
    return e


def _rotulos(serie, fmt, cor, tam=T_ROTULO, negrito=True, pos=None):
    r = serie.data_labels
    r.show_value = True; r.show_series_name = False; r.show_category_name = False; r.show_legend_key = False
    r.number_format = fmt; r.number_format_is_linked = False
    r.font.size = Pt(tam); r.font.bold = negrito; r.font.color.rgb = rgb(cor); r.font.name = TXT
    if pos is not None: r.position = pos
    return r


def rotulo_ponto(serie, i, fmt, cor=TINTA, tam=T_ROTULO, pos=XL_LABEL_POSITION.ABOVE):
    """Rótulo de valor em um único ponto da série (os demais ficam sem rótulo)."""
    rot = serie.points[i].data_label
    rot.position = pos
    rot.font.size = Pt(tam); rot.font.bold = True; rot.font.color.rgb = rgb(cor); rot.font.name = TXT
    dl = rot._get_or_add_dLbl()
    dl.find(f'{{{_C}}}spPr').addprevious(parse_xml(f'<c:numFmt xmlns:c="{_C}" formatCode="{fmt}" sourceLinked="0"/>'))


def _cor_serie(serie, cor, borda=None, esp=1.5):
    serie.format.fill.solid(); serie.format.fill.fore_color.rgb = rgb(cor)
    if borda: serie.format.line.color.rgb = rgb(borda); serie.format.line.width = Pt(esp)
    else: serie.format.line.fill.background()


def _cor_ponto(serie, i, cor, borda=None, esp=1.0):
    p = serie.points[i]
    p.format.fill.solid(); p.format.fill.fore_color.rgb = rgb(cor)
    if borda: p.format.line.color.rgb = rgb(borda); p.format.line.width = Pt(esp)
    else: p.format.line.fill.background()


def grafico_empilhado(s, x, y, w, h, categorias, series, cores, nome=None, descr=None, vao=55, rotulo_cat=0.0, fmt='0%;;', tam_cat=T_TAB, tam_rot=T_ROTULO):
    """Barras horizontais empilhadas a 100%. series = [(nome, [frações])]; cores = [(preenchimento, cor do rótulo)].

    rotulo_cat é a fração da largura reservada para os nomes das categorias (0 = nomes fora do gráfico).
    A área de plotagem ocupa toda a altura: cada categoria fica com h / n, o que permite alinhar texto ao lado.
    """
    g = _base_grafico(s, XL_CHART_TYPE.BAR_STACKED_100, x, y, w, h, categorias, series, nome, descr, '0%')
    plano = g.plots[0]; plano.gap_width = vao; plano.overlap = 100
    for serie, (cor, tinta) in zip(plano.series, cores):
        _cor_serie(serie, cor, BR, 1.5)                       # contorno branco: respiro entre os segmentos
        _rotulos(serie, fmt, tinta, tam=tam_rot, pos=XL_LABEL_POSITION.CENTER)
    _eixo_cat(g, visivel=rotulo_cat > 0, cor_linha=LIN, tam=tam_cat, cor=TINTA, invertido=True)
    _eixo_val(g, visivel=False, minimo=0, maximo=1)
    area_plotagem(g, rotulo_cat, 0.0, 1 - rotulo_cat, 1.0)
    return g


def grafico_barras(s, x, y, w, h, categorias, valores, destaque=(), contorno=(), nome=None, descr=None, cor=AZS, cor_destaque=AZP, maximo=None, fmt='0',
                   vao=60, horizontal=False, rotulo_cat=True, margens=None, serie='Valor', tam_rot=T_CORPO, tam_cat=None, cor_cat=None, minimo=0):
    """Colunas (ou barras horizontais) de uma série, com ênfase: os índices em destaque recebem a cor forte.

    Os índices em contorno ficam vazados (só a borda): servem para o estado mais fraco de uma escala.
    Cada barra leva o valor na ponta; o eixo de valores não aparece.
    """
    tipo = XL_CHART_TYPE.BAR_CLUSTERED if horizontal else XL_CHART_TYPE.COLUMN_CLUSTERED
    g = _base_grafico(s, tipo, x, y, w, h, categorias, [(serie, valores)], nome, descr, fmt)
    plano = g.plots[0]; plano.gap_width = vao
    sr = plano.series[0]; _cor_serie(sr, cor); sr.invert_if_negative = False
    for i in destaque: _cor_ponto(sr, i, cor_destaque)
    for i in contorno: _cor_ponto(sr, i, BR, AZP, 1.0)
    _rotulos(sr, fmt, TINTA, tam=tam_rot, pos=XL_LABEL_POSITION.OUTSIDE_END)
    _eixo_cat(g, visivel=rotulo_cat, cor_linha=LIN if horizontal else CZ, tam=tam_cat or (T_TAB if horizontal else T_ROTULO),
              cor=cor_cat or (TINTA if horizontal else CZ), invertido=horizontal)
    _eixo_val(g, visivel=False, minimo=minimo, maximo=maximo)
    if margens: area_plotagem(g, *margens)
    return g


def grafico_linhas(s, x, y, w, h, categorias, series, estilos, nome=None, descr=None, minimo=0, maximo=1, passo=0.25, fmt='0%', legenda_pos=None,
                   margens=None, eixo=True, tam_rot=T_ROTULO):
    """Linhas com marcadores. estilos = [dict(cor, esp, tracejado, marcador, rotulo, pos)] na ordem das séries.

    Valores None ficam em branco (a linha começa onde há dado). Só o último ponto de cada série leva rótulo.
    """
    g = _base_grafico(s, XL_CHART_TYPE.LINE_MARKERS, x, y, w, h, categorias, series, nome, descr, fmt)
    for sr, est in zip(g.plots[0].series, estilos):
        cor = est.get('cor', AZ)
        sr.smooth = False
        sr.format.line.color.rgb = rgb(cor); sr.format.line.width = Pt(est.get('esp', 2.25))
        if est.get('tracejado'): sr.format.line.dash_style = MSO_LINE.DASH
        if est.get('marcador', True):
            sr.marker.style = XL_MARKER_STYLE.CIRCLE; sr.marker.size = est.get('tam_marcador', 7)
            sr.marker.format.fill.solid(); sr.marker.format.fill.fore_color.rgb = rgb(cor)
            sr.marker.format.line.color.rgb = rgb(BR); sr.marker.format.line.width = Pt(1.25)     # anel branco em volta do ponto
        else:
            sr.marker.style = XL_MARKER_STYLE.NONE
        if est.get('rotulo', True):
            ult = max(i for i, v in enumerate(sr.values) if v is not None)
            rotulo_ponto(sr, ult, fmt, est.get('cor_rotulo', TINTA), tam_rot, est.get('pos', XL_LABEL_POSITION.ABOVE))
    _eixo_cat(g, visivel=True, cor_linha=CZ)
    ev = _eixo_val(g, visivel=eixo, minimo=minimo, maximo=maximo, passo=passo, fmt=fmt, grade=True)
    cruza = ev._element.find(f'{{{_C}}}crosses')
    if ev._element.find(f'{{{_C}}}crossBetween') is None: cruza.addnext(parse_xml(f'<c:crossBetween xmlns:c="{_C}" val="between"/>'))
    if legenda_pos:
        g.has_legend = True; g.legend.position = legenda_pos; g.legend.include_in_layout = False
        g.legend.font.size = Pt(T_ROTULO); g.legend.font.color.rgb = rgb(CZ); g.legend.font.name = TXT
    if margens: area_plotagem(g, *margens)
    return g


# ================================================================ componentes gerais de slide
def bloco(s, x, y, w, h, rot, titulo, corpo, cor_fio=AZP, esp=1.25, cor_rot=AZ, tam_tit=T_BLOCO, tam=T_CORPO, cor=CZ):
    """Bloco aberto: fio no topo, rótulo, título em Georgia e texto. Sem caixa em volta."""
    if cor_fio: fio(s, x, y, x + w, y, cor_fio, esp)
    itens = ([R(rot, cor_rot, entre=6)] if rot else []) + ([H(titulo, tam=tam_tit, entre=7)] if titulo else [])
    itens += [P(c, tam=tam, cor=cor, entre=6) if isinstance(c, str) else c for c in (corpo if isinstance(corpo, (list, tuple)) else [corpo])]
    return texto(s, x, y + 0.16, w, h - 0.16, itens)


def indicador(s, x, y, w, rot, valor, descr=None, tam=T_NUMERO, h=1.5, cor_fio=AZP, cor_valor=AZP, cor_rot=CZ, cor_descr=CZ):
    """Número grande com rótulo em cima e descrição embaixo. Os algarismos vão em Calibri, de altura uniforme."""
    if cor_fio: fio(s, x, y, x + w, y, cor_fio, 1.25)
    itens = [R(rot, cor_rot, entre=0), P(valor, tam=tam, cor=cor_valor, entre=0)]
    if descr: itens.append(P(descr, tam=T_TAB, cor=cor_descr))
    return texto(s, x, y + 0.16, w, h - 0.16, itens)


def passo_numerado(s, x, y, w, h, num, titulo, corpo, cor_num=AZ, tam_num=24, cor_fio=AZP):
    """Coluna numerada: numeral em Georgia itálico (como no blog), título e texto."""
    if cor_fio: fio(s, x, y, x + w, y, cor_fio, 1.25)
    itens = [P(num, tam=tam_num, cor=cor_num, fonte=TIT, italico=True, entre=4), H(titulo, entre=7)]
    itens += [P(c, cor=CZ, entre=6) if isinstance(c, str) else c for c in (corpo if isinstance(corpo, (list, tuple)) else [corpo])]
    return texto(s, x, y + 0.14, w, h - 0.14, itens)


def horizontes(s, itens, y=Y_TOPO, cab=('Entrega', 'Dono', 'Data'), linhas=3, marco='Marco de adoção'):
    """Três horizontes de prazo lado a lado: número grande, foco, tabela nativa de entregas e marco esperado.

    itens = [(número, unidade, foco, texto do marco)]. A intensidade do ponto na linha do tempo cai com a distância.
    """
    fio(s, MARGEM, y + 0.95, DIR, y + 0.95, LIN, 0.75)
    for i, ((x, w), (num, unidade, foco, alvo)) in enumerate(zip(faixas(3, calha=0.45), itens)):
        larg_num = 0.3 + 0.32 * len(num)
        texto(s, x, y - 0.1, larg_num, 0.95, P(num, tam=48, cor=AZP, entre=0), ancora='base')
        texto(s, x + larg_num, y - 0.1, w - larg_num, 0.83, unidade, tam=T_LEAD, cor=CZ, ancora='base')
        oval(s, x - 0.07, y + 0.88, 0.14, [AZP, AZ, AZS][i])
        texto(s, x, y + 1.15, w, 0.6, [R('Foco', AZ, entre=2), P(foco, cor=AZP, negrito=True)])
        corpo = [[cab[0], cab[1], {'t': cab[2], 'alinh': 'dir'}]] + [[f'[{cab[0]}]', '[Nome]', {'t': '[dd/mm]', 'alinh': 'dir'}] for _ in range(linhas)]
        tabela(s, x, y + 1.85, [w - 1.85, 1.0, 0.85], corpo, 0.4, 0.32, primeira=False, nome=f'Tabela: {num} {unidade}')
        texto(s, x, y + 2.1 + 0.4 * linhas + 0.3, w, 0.95, [R(marco, CZ, entre=2), P(alvo, cor=TINTA)])


# ================================================================ componentes de gestão da mudança
# régua de adoção: cinzas para quem ainda não usa, azuis cada vez mais fortes para quem usa
REGUA = [('Resiste', CZ, BR, 'Escuta'), ('Observa', LIN, TINTA, 'Exemplo'), ('Experimenta', AZS, TINTA, 'Prática'), ('Adota', AZ, BR, 'Reforço'), ('Multiplica', AZP, BR, 'Palco')]
# letras da RACI: (fundo, cor da letra, nome, o que faz)
RACI = {'A': (AZP, BR, 'Aprova', 'responde pelo resultado'), 'R': (AZ, BR, 'Responsável', 'executa'),
        'C': (AZS, TINTA, 'Consultado', 'opina antes'), 'I': (LIN, TINTA, 'Informado', 'fica sabendo depois')}
SITUACAO = {'Na meta': 1, 'Em atenção': 2, 'Crítico': 3}       # nível da etiqueta: quanto mais forte o azul, mais atenção pede


def situacao(valor, meta, menor_melhor=False):
    """Situação pelo atingimento da meta: na meta (100% ou mais), em atenção (85% a 99%) ou crítico (abaixo de 85%)."""
    ating = (meta / valor) if menor_melhor else (valor / meta)
    corte = float(arred(ating, 2).replace(',', '.'))      # a planilha arredonda o atingimento para percentual inteiro antes de classificar
    return ('Na meta' if corte >= 1 else 'Em atenção' if corte >= 0.85 else 'Crítico'), ating


def matriz_raci(s, x, y, w, papeis, atividades, alt=0.36, larg_ativ=3.3, alt_cab=0.5, carga=False, conferencia=0, tam=T_TAB, caixa_cab=True):
    """Matriz RACI em tabela nativa: uma atividade por linha, um papel por coluna, letra em ladrilho colorido.

    Com carga=True, duas linhas finais contam quantas atividades cada papel aprova e executa.
    Com conferencia (largura em polegadas), uma última coluna avisa a atividade que está sem aprovador ou com mais de um.
    """
    lp = (w - larg_ativ - conferencia) / len(papeis)
    linhas = [['Atividade'] + [{'t': p, 'alinh': 'centro'} for p in papeis] + ([{'t': 'Conferência', 'alinh': 'centro'}] if conferencia else [])]
    for nome, letras in atividades:
        lin = [{'t': nome, 'negrito': False, 'cor': TINTA, 'tam': tam}]
        for letra in letras.split():
            fundo, tinta = RACI[letra[0]][:2]
            lin.append({'t': letra, 'fundo': fundo, 'cor': tinta, 'alinh': 'centro', 'negrito': True, 'tam': tam})
        if conferencia:
            n_a = sum(1 for letra in letras.split() if 'A' in letra.split('/'))
            lin.append({'t': 'OK', 'alinh': 'centro', 'cor': CZ, 'tam': tam} if n_a == 1 else celula('Falta o A' if n_a == 0 else 'Mais de um A', 3, tam=T_ROTULO))
        linhas.append(lin)
    alts = [alt] * len(atividades)
    if carga:
        for letra, rot in (('A', 'Atividades que aprova'), ('R', 'Atividades que executa')):
            n = [sum(1 for _, ls in atividades if letra in ls.split()[j].split('/')) for j in range(len(papeis))]
            linhas.append([{'t': rot, 'cor': CZ, 'negrito': False, 'tam': T_ROTULO + 1}]
                          + [{'t': str(v) if v else '–', 'alinh': 'centro', 'cor': AZP if v else CZ, 'negrito': bool(v), 'tam': tam} for v in n] + ([''] if conferencia else []))
            alts.append(0.3)
    return tabela(s, x, y, [larg_ativ] + [lp] * len(papeis) + ([conferencia] if conferencia else []), linhas, alts, alt_cab, tam_cab=T_RODAPE if caixa_cab else T_ROTULO, esp_cab=0.4,
                  caixa_cab=caixa_cab, nome='Matriz RACI')


def legenda_raci(s, x, y, w=UTIL, lado=0.3):
    """Legenda da RACI em uma linha: ladrilho com a letra, nome do papel e o que ele faz."""
    passo = w / 4
    for i, letra in enumerate('ARCI'):
        fundo, tinta, nome, faz = RACI[letra]
        ret(s, x + i * passo, y, lado, lado, fundo, None, 0.75, 0, letra, 'meio', 0, 0, tam=T_TAB if lado >= 0.3 else T_ROTULO, cor=tinta, negrito=True)
        texto(s, x + i * passo + lado + 0.1, y, passo - lado - 0.2, lado, f'*{nome}:* {faz}', tam=T_ROTULO + 1, cor=CZ, ancora='meio')


def mapa_influencia(s, x, y, lado, pontos, d=0.36, eixo_y='Influência', eixo_x='Apoio à mudança', quadrantes=None):
    """Quadrante 2 x 2 de influência (vertical) por apoio (horizontal), com os stakeholders em círculos numerados.

    pontos = [(rótulo, influência 1 a 5, apoio 1 a 5)]. O quadrante de prioridade (muita influência, pouco apoio) é o destacado.
    """
    m = lado / 2
    ret(s, x, y, m, m, AZC, nome='Quadrante: conquistar')
    ret(s, x, y, lado, lado, None, LIN, 0.75, nome='Moldura do mapa')
    fio(s, x + m, y, x + m, y + lado, LIN, 0.75); fio(s, x, y + m, x + lado, y + m, LIN, 0.75)
    q = quadrantes or ['Conquistar', 'Mobilizar', 'Ouvir', 'Envolver']
    for (qx, qy, al), nome, cor in zip([(0.12, 0.1, 'esq'), (m + 0.12, 0.1, 'esq'), (0.12, lado - 0.32, 'esq'), (m + 0.12, lado - 0.32, 'esq')], q, [AZP, CZ, CZ, CZ]):
        rotulo(s, x + qx, y + qy, m - 0.24, nome, cor, al)
    # eixos: título e extremos
    texto(s, x - 0.56, y, 0.26, lado, eixo_y, tam=T_ROTULO, cor=CZ, negrito=True, esp=1.2, caixa=True, alinh='centro', vertical=True, ancora='meio')
    texto(s, x - 0.28, y, 0.22, 0.6, 'alta', tam=T_RODAPE, cor=CZ, alinh='dir', vertical=True, ancora='meio')
    texto(s, x - 0.28, y + lado - 0.6, 0.22, 0.6, 'baixa', tam=T_RODAPE, cor=CZ, alinh='esq', vertical=True, ancora='meio')
    rotulo(s, x, y + lado + 0.24, lado, eixo_x, CZ, 'centro')
    texto(s, x, y + lado + 0.06, 1.2, 0.2, 'resiste', tam=T_RODAPE, cor=CZ)
    texto(s, x + lado - 1.2, y + lado + 0.06, 1.2, 0.2, 'apoia', tam=T_RODAPE, cor=CZ, alinh='dir')
    # pontos: notas de 1 a 5 ocupam o miolo do quadro (as bordas ficam para os nomes dos quadrantes);
    # nota 3 conta como "alta", por isso fica um pouco além da linha do meio
    pos = lambda v: 0.14 + (v + (0.35 if v == 3 else 0) - 1) / 4 * 0.72
    for rot, infl, apoio in pontos:
        px, py = x + pos(apoio) * lado, y + (1 - pos(infl)) * lado
        oval(s, px - d / 2, py - d / 2, d, AZP, BR, 1.5, str(rot), tam=T_TAB, cor=BR, nome=f'Stakeholder {rot}')


def matriz_riscos(s, x, y, lado, riscos, d=0.34):
    """Matriz 5 x 5 de probabilidade (vertical) por impacto (horizontal). riscos = [(número, probabilidade, impacto)].

    Exposição = probabilidade x impacto: alta (15 ou mais) em azul profundo, média (8 a 14) em azul vivo, baixa em azul suave.
    """
    c, vao = lado / 5, 0.04
    grupo = s.shapes.add_group_shape(); grupo.name = 'Matriz de riscos'
    for p in range(1, 6):
        for i in range(1, 6):
            e = p * i
            f = grupo.shapes.add_shape(MSO_SHAPE.RECTANGLE, E(x + (i - 1) * c + vao / 2), E(y + (5 - p) * c + vao / 2), E(c - vao), E(c - vao))
            _pinta(f, AZP if e >= 15 else AZ if e >= 8 else AZS, None, 0)
    for k in range(1, 6):
        texto(s, x + (k - 1) * c, y + lado + 0.05, c, 0.2, str(k), tam=T_ROTULO, cor=CZ, alinh='centro')
        texto(s, x - 0.22, y + (5 - k) * c, 0.16, c, str(k), tam=T_ROTULO, cor=CZ, alinh='dir', ancora='meio')
    rotulo(s, x, y + lado + 0.3, lado, 'Impacto na adoção', CZ, 'centro')
    texto(s, x - 0.56, y, 0.26, lado, 'Probabilidade', tam=T_ROTULO, cor=CZ, negrito=True, esp=1.2, caixa=True, alinh='centro', vertical=True, ancora='meio')
    ocupadas = {}
    for num, prob, imp in riscos:
        k = ocupadas.get((prob, imp), 0); ocupadas[(prob, imp)] = k + 1
        cx, cy = x + (imp - 0.5) * c + (k * 0.2 - 0.0), y + (5 - prob + 0.5) * c
        oval(s, cx - d / 2, cy - d / 2, d, BR, AZP, 1.25, str(num), tam=T_TAB, cor=AZP, nome=f'Risco {num}')


def legenda_exposicao(s, x, y, passo=None):
    return legenda(s, x, y, [(AZP, 'Alta (15 ou mais): ação imediata'), (AZ, 'Média (8 a 14): plano de resposta'), (AZS, 'Baixa (até 7): monitorar')], passo)


def regua_adocao(s, x, y, w, h, areas, fracoes, pessoas=None, total='Todas as áreas', larg_nome=1.6, larg_indice=1.25, com_acao=True):
    """Régua de adoção por área: legenda (com a ação de cada marca), barras empilhadas nativas e índice de adoção ao lado.

    fracoes = lista por área com as cinco frações (Resiste a Multiplica). O índice é Adota + Multiplica.
    Com pessoas e total, entra uma última linha com o conjunto das áreas (média ponderada pelas pessoas).
    """
    areas, fracoes = list(areas), [list(f) for f in fracoes]
    if pessoas and total:
        soma = sum(pessoas)
        fracoes.append([sum(p * f[k] for p, f in zip(pessoas, fracoes)) / soma for k in range(5)])
        areas.append(total); pessoas = list(pessoas) + [soma]
    alt_leg = 0.62 if com_acao else 0.34
    xg, wg = x + larg_nome, w - larg_nome - larg_indice - 0.2
    passo = wg / 5
    for i, (nome, cor, _, acao) in enumerate(REGUA):
        lx = xg + i * passo
        ret(s, lx, y + 0.04, 0.16, 0.16, cor)
        itens = [P(nome, tam=T_TAB, cor=TINTA, negrito=True, entre=0)] + ([P('Ação: ' + acao.lower(), tam=T_ROTULO, cor=CZ, entre=0)] if com_acao else [])
        texto(s, lx + 0.24, y, passo - 0.3, alt_leg, itens)
    yg, hg = y + alt_leg + 0.12, h - alt_leg - 0.12
    series = [(REGUA[k][0], [f[k] for f in fracoes]) for k in range(5)]
    grafico_empilhado(s, xg, yg, wg, hg, areas, series, [(c, t) for _, c, t, _ in REGUA], nome='Gráfico: régua de adoção por área',
                      descr='Barras empilhadas com a parcela de pessoas de cada área em cada marca da régua de adoção.', vao=45)
    faixa = hg / len(areas)
    rotulo(s, x + w - larg_indice, y + 0.02, larg_indice, 'Índice de adoção', CZ, 'dir', h=0.5)
    for i, area in enumerate(areas):
        cy, conjunto = yg + i * faixa, bool(pessoas and total and i == len(areas) - 1)
        itens = [P(area, cor=AZP if conjunto else TINTA, negrito=True, entre=0)] + ([P(f'{pessoas[i]} pessoas', tam=T_ROTULO, cor=CZ, entre=0)] if pessoas else [])
        texto(s, x, cy, larg_nome - 0.15, faixa, itens, ancora='meio')
        texto(s, x + w - larg_indice, cy, larg_indice, faixa, f'{round((fracoes[i][3] + fracoes[i][4]) * 100)}%', tam=22, cor=AZP, negrito=conjunto, alinh='dir', ancora='meio')
        if i: fio(s, x, cy, x + w, cy, AZP if conjunto else LIN, 1.25 if conjunto else 0.75)
    return yg, faixa


def cartao_indicador(s, x, y, w, h, nome, valor, meta, sit, grupo=None, ating=None, variacao=None, tam=T_NUMERO):
    """Cartão de indicador: nome, valor atual grande, etiqueta de situação, meta com atingimento, variação e barra de atingimento."""
    fio(s, x, y, x + w, y, AZP, 1.25)
    topo = y + 0.14 + (0.2 if grupo else 0)
    texto(s, x, y + 0.14, w, 0.5, ([R(grupo, AZ, entre=1)] if grupo else []) + [P(nome, tam=T_TAB, cor=TINTA, negrito=True, entre=0)])
    texto(s, x, topo + 0.2, w - 1.2, 0.7, P(valor, tam=tam, cor=AZP, entre=0), ancora='meio')
    pilula(s, x + w - 1.1, topo + 0.4, 1.1, sit, SITUACAO[sit])
    linhas = [P('Meta ' + meta + (f' · atingimento {ating:.0%}' if ating is not None else ''), tam=T_ROTULO + 1, cor=CZ, entre=1)]
    if variacao: linhas.append(P(variacao, tam=T_ROTULO + 1, cor=CZ, entre=0))
    texto(s, x, topo + 0.92, w, 0.45, linhas)
    if ating is not None:
        ret(s, x, y + h - 0.08, w, 0.08, LIN, nome='Barra de atingimento: fundo')
        ret(s, x, y + h - 0.08, w * max(0.02, min(1.0, ating)), 0.08, AZP, nome='Barra de atingimento')


def tendencia(s, x, y, w, h, nome, categorias, valores, meta, valor_txt, meta_txt, sit, grupo=None, linhas_nome=1, fmt='0%', minimo=0, maximo=1, passo=0.5,
              sem_dado='Sem dado'):
    """Painel de tendência (um por indicador): nome, valor atual, meta e situação, com gráfico nativo do realizado contra a meta.

    Os períodos iniciais sem dado ganham uma faixa cinza (com legenda, se couber), para o vazio não parecer erro.
    """
    fio(s, x, y, x + w, y, AZP, 1.25)
    texto(s, x, y + 0.14, w, 0.75, ([R(grupo, AZ, entre=1)] if grupo else []) + [P(nome, tam=T_TAB, cor=TINTA, negrito=True, entre=0)])
    yv = y + 0.19 + (0.22 if grupo else 0) + 0.22 * linhas_nome
    texto(s, x, yv, w, 0.6, P(valor_txt, tam=30, cor=AZP, entre=0))
    texto(s, x, yv + 0.6, w - 1.1, 0.3, 'Meta: ' + meta_txt, tam=T_ROTULO + 1, cor=CZ, ancora='meio')
    pilula(s, x + w - 1.05, yv + 0.6, 1.05, sit, SITUACAO[sit])
    # gráfico com a área de plotagem fixa: os painéis de um mesmo slide ficam alinhados entre si
    xg, yg, wg, hg = x, yv + 1.08, w, y + h - (yv + 1.08)
    esq, dirt, topo, base = 0.43, 0.15, 0.24, 0.3
    vazios = next(i for i, v in enumerate(valores) if v is not None)
    if vazios:
        lf = (wg - esq - dirt) / len(categorias) * vazios
        ret(s, xg + esq, yg + topo, lf, hg - topo - base, CZC, t=sem_dado if lf > 1.0 else None, ancora='topo', mx=0.06, my=0.06, tam=T_RODAPE, cor=CZ, alinh='esq',
            nome='Faixa: período sem dado')
    ultimo = [v for v in valores if v is not None][-1]
    pos = XL_LABEL_POSITION.ABOVE if ultimo >= meta else XL_LABEL_POSITION.BELOW      # o rótulo foge da linha da meta
    g = grafico_linhas(s, xg, yg, wg, hg, categorias, [('Realizado', valores), ('Meta', [meta] * len(categorias))],
                       [dict(cor=AZ, pos=pos, tam_marcador=6), dict(cor=CZ, tracejado=True, marcador=False, esp=1.25, rotulo=False)],
                       nome=f'Gráfico: {nome}', descr=f'{nome}: realizado por período (linha azul) e meta (linha tracejada).', minimo=minimo, maximo=maximo, passo=passo, fmt=fmt,
                       margens=(esq / wg, topo / hg, (wg - esq - dirt) / wg, (hg - topo - base) / hg))
    return g


# ================================================================ dados de exemplo (os mesmos das planilhas do blog)
EX_PAPEIS = ['Patrocinador', 'Líder do projeto', 'Gestão da mudança', 'Gestores diretos', 'RH', 'TI', 'Multiplicadores']
# a última atividade está sem aprovador de propósito, como na planilha: mostra o aviso da conferência
EX_RACI = [('Definir a estratégia de mudança', 'A C R C C I I'), ('Mapear stakeholders e impactos', 'I A R C C C I'), ('Aprovar as mensagens-chave', 'A R R C I I I'),
           ('Executar o plano de comunicação', 'C C A R C I R'), ('Preparar e entregar a capacitação', 'I C A C R C R'), ('Preparar os gestores diretos', 'C C A R C I I'),
           ('Medir a adoção e reportar', 'I C A/R C I C C'), ('Tratar resistências', 'C C A R C I R'), ('Sustentar e transferir para a operação', 'A R C R C C I'),
           ('Reconhecer e reforçar a adoção', 'C C R R C I R')]
# (stakeholder, área ou papel, influência 1 a 5, apoio 1 a 5, o que perde ou ganha, próxima ação, responsável)
EX_STAKEHOLDERS = [('Patrocinador executivo', 'Diretoria', 5, 5, 'Ganha: resultado do projeto ligado à sua agenda.', 'Abrir o kickoff e aparecer nos marcos.', 'Líder do projeto'),
                   ('Diretor de operações', 'Operações', 5, 2, 'Perde: autonomia sobre o processo atual.', 'Conversa individual com o patrocinador para ouvir as objeções.', 'Patrocinador'),
                   ('Gerente de TI', 'Tecnologia', 4, 3, 'Ganha: menos sistemas paralelos. Perde: folga da equipe na virada.', 'Combinar o plano de suporte do go-live.', 'Líder do projeto'),
                   ('Gestores de linha', 'Operações', 3, 2, 'Perdem: tempo da equipe durante a transição.', 'Preparar antes das equipes, com roteiro de conversa.', 'Gestão da mudança'),
                   ('Usuários-chave', 'Áreas de negócio', 2, 4, 'Ganham: visibilidade e novas competências.', 'Convidar para a rede de multiplicadores.', 'Gestão da mudança'),
                   ('Equipe de atendimento', 'Atendimento', 1, 2, 'Perde: rotina conhecida.', 'Roda de escuta com o gestor direto.', 'Gestor direto')]
ESTRATEGIAS = [('Conquistar: prioridade', 3), ('Mobilizar como aliado', 2), ('Envolver como rede', 1), ('Ouvir e acompanhar', 0)]     # (nome, nível de cor)
# (área, pessoas em Resiste, Observa, Experimenta, Adota, Multiplica)
EX_ADOCAO = [('Financeiro', (2, 5, 6, 4, 1)), ('Operações', (9, 14, 10, 7, 2)), ('Comercial', (3, 6, 8, 6, 2)),
             ('Suprimentos', (2, 4, 3, 2, 1)), ('TI', (1, 2, 2, 2, 1)), ('RH', (0, 2, 2, 1, 1))]
# (risco, categoria, grupo afetado, probabilidade, impacto, resposta, responsável, status)
EX_RISCOS = [('Patrocinador deixa de participar depois do lançamento', 'Patrocínio', 'Todas as áreas', 3, 5, 'Agenda fixa do patrocinador até a estabilização e dados de adoção na reunião de resultados.', 'Líder do projeto', 'Em tratamento'),
             ('Gestores diretos não repassam as mensagens', 'Comunicação', 'Operações', 4, 4, 'Preparar os gestores antes das equipes e dar roteiro de conversa.', 'Gestão da mudança', 'Aberto'),
             ('Treinamento distante do uso real', 'Capacitação', 'Usuários finais', 3, 4, 'Prática perto do go-live e apoio no posto de trabalho.', 'Líder de capacitação', 'Em tratamento'),
             ('Várias mudanças na mesma área no mesmo trimestre', 'Sobrecarga', 'Financeiro', 4, 3, 'Mapa de carga e decisão de sequência com a liderança.', 'Patrocinador', 'Aberto'),
             ('Retorno às planilhas depois do período de apoio', 'Resistência', 'Vendas', 3, 3, 'Reforço pelos supervisores e uso nos indicadores da rotina.', 'Gestores diretos', 'Aberto'),
             ('Suporte insuficiente nas primeiras semanas depois do go-live', 'Operação', 'Usuários finais', 2, 4, 'Apoio reforçado no posto de trabalho e critérios de saída combinados.', 'TI', 'Aberto'),
             ('Solução não cobre exceções frequentes do processo', 'Solução', 'Suprimentos', 2, 3, 'Mapear exceções com usuários-chave e definir tratamento antes da virada.', 'Líder do processo', 'Controlado'),
             ('Mensagens diferentes entre as áreas sobre o que muda', 'Comunicação', 'Todas as áreas', 2, 2, 'Mensagens-chave únicas, aprovadas pelo patrocinador.', 'Gestão da mudança', 'Controlado')]
# (grupo, área, pessoas, Consciência, Desejo, Conhecimento, Habilidade, Reforço)
EX_ADKAR = [('Analistas de contas a pagar', 'Financeiro', 18, 4, 2, 2, 2, 1), ('Supervisores de loja', 'Operações', 42, 3, 3, 2, 2, 2), ('Vendas internas', 'Comercial', 25, 5, 4, 4, 2, 2),
            ('Compradores', 'Suprimentos', 12, 5, 5, 4, 4, 3), ('Atendimento', 'Operações', 60, 2, 2, 1, 1, 1), ('Controladoria', 'Financeiro', 9, 5, 4, 5, 4, 4)]
ELEMENTOS = ['Consciência', 'Desejo', 'Conhecimento', 'Habilidade', 'Reforço']
ACAO_ADKAR = {'Consciência': 'Patrocinador explica por que mudar e o risco de não mudar', 'Desejo': 'Gestor direto conversa sobre perdas, ganhos e o que muda para cada um',
              'Conhecimento': 'Capacitação no processo e na ferramenta, perto do uso', 'Habilidade': 'Prática guiada, apoio no posto de trabalho e tempo para aprender',
              'Reforço': 'Reconhecer, medir o uso e tirar atritos da rotina', 'Sem barreira': 'Manter o reforço e usar o grupo como exemplo'}
EX_AREAS = ['Financeiro', 'Operações', 'Comercial', 'Suprimentos', 'TI', 'RH']
EX_TIPOS = ['Processo', 'Sistema', 'Papel', 'Competência', 'Estrutura', 'Indicador']
# (processo ou atividade, área, grupo impactado, tipo, o que muda, grau 1 a 5, pessoas, ação de mudança)
EX_IMPACTOS = [('Lançamento de notas fiscais', 'Financeiro', 'Analistas de contas a pagar', 'Sistema', 'Lançamento passa a ser feito no novo sistema, com validação automática', 4, 18, 'Prática guiada e apoio no posto na primeira semana'),
               ('Aprovação de pagamentos', 'Financeiro', 'Coordenadores', 'Papel', 'Aprovação sai do e-mail e passa a ter alçadas no sistema', 3, 6, 'Comunicar novas alçadas e treinar aprovadores'),
               ('Pedido de compra', 'Suprimentos', 'Compradores', 'Processo', 'Requisição obrigatória antes do pedido', 5, 12, 'Patrocinador explica o porquê; gestores acompanham exceções'),
               ('Reposição de loja', 'Operações', 'Supervisores de loja', 'Indicador', 'Meta de ruptura passa a ser acompanhada por loja, toda semana', 4, 42, 'Roteiro de conversa para gestores e painel semanal'),
               ('Cadastro de clientes', 'Comercial', 'Vendas internas', 'Sistema', 'Cadastro único, com campos obrigatórios', 2, 25, 'Guia rápido e vídeo curto'),
               ('Atendimento ao cliente', 'Operações', 'Atendimento', 'Competência', 'Atendente passa a resolver casos que antes escalava', 5, 60, 'Trilha de capacitação e mentoria entre pares'),
               ('Fechamento mensal', 'Financeiro', 'Controladoria', 'Processo', 'Calendário de fechamento reduzido em dois dias', 3, 9, 'Ensaio do fechamento antes da virada'),
               ('Suporte a usuários', 'TI', 'Equipe de suporte', 'Estrutura', 'Novo modelo de suporte, com apoio reforçado após o go-live', 3, 8, 'Treinar a equipe e combinar critérios de saída')]
# (público, tema, formato, dias em relação ao go-live, duração, responsável, como medir, status)
EX_TREINOS = [('Patrocinadores', 'Papel do patrocinador nos marcos', 'Presencial', -28, '60 min', 'Gestão da mudança', 'Comportamento', 'Realizado'),
              ('Gestores diretos', 'O que muda e como conduzir a equipe', 'Ao vivo on-line', -21, '90 min', 'Gestão da mudança', 'Comportamento', 'Realizado'),
              ('Usuários-chave', 'Processo novo de ponta a ponta', 'Prática guiada', -14, '4 h', 'Líder do processo', 'Aprendizagem', 'Agendado'),
              ('Multiplicadores', 'Como apoiar os colegas no posto', 'Prática guiada', -10, '3 h', 'Líder de capacitação', 'Aprendizagem', 'Em preparo'),
              ('Usuários finais', 'Tarefas do dia a dia no novo sistema', 'Prática guiada', -5, '2 h', 'Multiplicadores', 'Comportamento', 'Em preparo'),
              ('Usuários finais', 'Apoio na virada', 'Apoio no posto', 0, '1 semana', 'Multiplicadores', 'Resultado', 'A planejar'),
              ('Todos', 'Dúvidas frequentes da primeira semana', 'Vídeo curto', 7, '5 min', 'Gestão da mudança', 'Reação', 'A planejar'),
              ('Usuários finais', 'Reforço das tarefas com mais erro', 'Guia rápido', 14, '30 min', 'Multiplicadores', 'Resultado', 'A planejar')]
STATUS_TREINO = {'A planejar': (LIN, TINTA), 'Em preparo': (AZS, TINTA), 'Agendado': (AZ, BR), 'Realizado': (AZP, BR), 'Adiado': (CZ, BR)}
SINAIS = ['Clareza do porquê', 'Fluência digital', 'Autonomia', 'Segurança para errar', 'Valor percebido']
LEITURAS = ['Resiste: escuta', 'Observa: exemplo', 'Experimenta: prática', 'Adota: reforço', 'Multiplica: palco']
# (pessoa ou grupo, área, notas dos cinco sinais)
EX_PRONTIDAO = [('Analistas de contas a pagar', 'Financeiro', (4, 3, 2, 2, 3)), ('Controladoria', 'Financeiro', (5, 4, 5, 4, 4)), ('Supervisores de loja', 'Operações', (3, 2, 3, 2, 2)),
                ('Equipe de atendimento', 'Operações', (2, 2, 1, 2, 1)), ('Equipe de vendas internas', 'Comercial', (5, 4, 4, 3, 4)), ('Compradores', 'Suprimentos', (4, 4, 3, 3, 4)),
                ('Equipe de suporte', 'TI', (4, 5, 4, 3, 3)), ('Parceiros de negócio de RH', 'RH', (5, 4, 5, 5, 5))]
MESES = ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6']
# indicadores do painel, como na planilha-par: (grupo, nome, unidade, meta, menor é melhor, série de seis meses; None = sem dado,
# definição, fórmula em palavras, fonte do dado, frequência, responsável). O go-live é no Mês 4.
EX_INDICADORES = [
    ('Prontidão', 'Cobertura de comunicação', '%', 90, False, (45, 62, 78, 86, 91, 93), 'Parcela do público-alvo alcançada pelas mensagens-chave da mudança.',
     'Pessoas alcançadas ÷ pessoas previstas no plano de comunicação', 'Plano de comunicação e registros de alcance', 'Mensal', 'Gestão da mudança'),
    ('Prontidão', 'Patrocínio ativo', '%', 80, False, (50, 58, 67, 75, 83, 85), 'Parcela das ações combinadas com os patrocinadores que foi realizada.',
     'Ações de patrocínio realizadas ÷ ações previstas', 'Agenda dos patrocinadores', 'Mensal', 'Patrocinador'),
    ('Prontidão', 'Índice de prontidão', '%', 75, False, (38, 46, 57, 66, 74, 79), 'Parcela das pessoas impactadas que se declara pronta para a mudança.',
     'Respostas favoráveis ÷ total de respostas da pesquisa de prontidão', 'Pesquisa curta de prontidão', 'Mensal', 'Gestão da mudança'),
    ('Capacitação', 'Cobertura de treinamento', '%', 95, False, (10, 34, 61, 82, 93, 96), 'Parcela das pessoas previstas que concluiu a capacitação.',
     'Pessoas treinadas ÷ pessoas previstas', 'Plano de treinamentos e listas de presença', 'Mensal', 'Líder de capacitação'),
    ('Capacitação', 'Aproveitamento do treinamento', '%', 80, False, (None, 71, 74, 78, 81, 83), 'Parcela dos participantes que atingiu a nota mínima na avaliação de aprendizagem.',
     'Participantes aprovados ÷ participantes avaliados', 'Avaliações de aprendizagem', 'Mensal', 'Líder de capacitação'),
    ('Adoção', 'Uso efetivo', '%', 85, False, (None, None, None, 52, 68, 81), 'Parcela dos usuários previstos que usa a solução no período.',
     'Usuários ativos ÷ usuários previstos', 'Registros de uso do sistema', 'Mensal', 'TI'),
    ('Adoção', 'Índice de adoção', '%', 70, False, (None, None, None, 20, 32, 56), 'Parcela das pessoas impactadas que já usa a mudança na rotina ou ensina os colegas.',
     'Pessoas que adotam ou multiplicam ÷ total de pessoas impactadas', 'Matriz de adoção', 'Mensal', 'Gestão da mudança'),
    ('Adoção', 'Proficiência', '%', 75, False, (None, None, None, 31, 48, 64), 'Parcela dos usuários que executa as tarefas no padrão esperado, sem ajuda.',
     'Usuários proficientes ÷ usuários avaliados', 'Observação dos gestores e indicadores do processo', 'Mensal', 'Gestores diretos'),
    ('Resultado', 'Chamados de suporte por usuário', 'n', 0.5, True, (None, None, None, 1.8, 1.1, 0.6), 'Volume de pedidos de ajuda em relação ao número de usuários ativos.',
     'Chamados abertos no período ÷ usuários ativos', 'Central de suporte', 'Mensal', 'TI'),
    ('Resultado', 'Satisfação com a mudança', 'nota', 4.0, False, (3.1, 3.3, 3.4, 3.2, 3.6, 3.9), 'Nota média da pesquisa de satisfação com a mudança, de 1 a 5.',
     'Soma das notas ÷ número de respostas', 'Pesquisa de satisfação', 'Mensal', 'Gestão da mudança'),
    ('Resultado', 'Benefício realizado', '%', 60, False, (None, None, None, 8, 22, 41), 'Parcela do benefício previsto no caso de negócio que já foi capturada.',
     'Benefício capturado ÷ benefício previsto', 'Acompanhamento do caso de negócio', 'Mensal', 'Patrocinador')]
CARTOES_PAINEL = ['Índice de adoção', 'Uso efetivo', 'Índice de prontidão', 'Cobertura de treinamento']      # os quatro cartões do painel da planilha


def barreira(notas):
    """Ponto de barreira ADKAR: o primeiro elemento, na ordem do modelo, com nota 3 ou menor."""
    for nome, n in zip(ELEMENTOS, notas):
        if n <= 3: return nome
    return 'Sem barreira'


def leitura(media):
    """Leitura sugerida do diagnóstico de prontidão, com os mesmos cortes da planilha."""
    return LEITURAS[0 if media < 2 else 1 if media < 3 else 2 if media < 4 else 3 if media < 4.6 else 4]


def estrategia(influencia, apoio):
    """Estratégia sugerida para um stakeholder: nota 3 ou mais conta como alta."""
    return ESTRATEGIAS[(0 if apoio < 3 else 1) if influencia >= 3 else (2 if apoio >= 3 else 3)]


def arred(v, casas=1):
    """Número com vírgula decimal, arredondado como nas planilhas (meio para cima)."""
    from decimal import Decimal, ROUND_HALF_UP
    return str(Decimal(str(v)).quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP)).replace('.', ',')


def fmt_ind(v, unidade):
    """Texto de um valor de indicador: percentual, nota de 1 a 5 ou número com uma casa (vírgula decimal)."""
    if v is None: return '–'
    return f'{v:.0f}%' if unidade == '%' else arred(v)


# ================================================================ apresentação
class Deck:
    """Uma apresentação no sistema visual do blog."""

    def __init__(self, titulo, descricao, palavras=''):
        self.titulo, self.descricao, self.palavras = titulo, descricao, palavras
        self.prs = Presentation()
        _prepara(self.prs)
        self._titulos, self._secoes = [], []

    def secao(self, nome):
        """Abre uma seção do PowerPoint a partir do próximo slide (aparece no painel de miniaturas e no classificador)."""
        self._secoes.append((nome, len(self._titulos)))

    # -- criação de slides
    def _slide(self, layout, notas, titulo):
        s = self.prs.slides.add_slide(self.prs.slide_layouts[layout])
        self._titulos.append(re.sub(r'\s+', ' ', re.sub(r'[*_\v]', ' ', titulo)).strip())
        s.notes_slide.notes_text_frame.text = notas
        return s

    @staticmethod
    def _ph(s, idx, conteudo, nome):
        """Preenche o marcador de posição de índice idx; se não houver conteúdo, tira o marcador do slide."""
        for ph in s.placeholders:
            if ph.placeholder_format.idx == idx:
                if not conteudo: ph._element.getparent().remove(ph._element)
                else: ph.name = nome; _escreve(ph.text_frame, conteudo, herdar=True)
                return ph
        raise KeyError(idx)

    def capa(self, olho, titulo, sub, notas, meta='[Área responsável] · [mês e ano]'):
        self.secao('Abertura')
        s = self._slide(L_CAPA, notas, titulo)
        self._ph(s, 13, olho, 'Olho'); self._ph(s, 0, titulo, 'Título')
        self._ph(s, 1, sub, 'Subtítulo'); self._ph(s, 14, meta, 'Área e data')
        return s

    def divisoria(self, num, titulo, apoio, notas, olho=None):
        self.secao(titulo)
        s = self._slide(L_DIVISORIA, notas, titulo)
        self._ph(s, 14, num, 'Número'); self._ph(s, 0, titulo, 'Título')
        self._ph(s, 1, apoio, 'Texto de apoio'); self._ph(s, 13, olho, 'Olho')
        return s

    def slide(self, olho, titulo, notas, dica=None):
        """Slide de conteúdo: olho, título em frase de ação e, se quiser, uma dica discreta acima do rodapé."""
        s = self._slide(L_TITULO, notas, titulo)
        self._ph(s, 13, olho, 'Olho'); self._ph(s, 0, titulo, 'Título')
        if dica: texto(s, MARGEM, Y_DICA, UTIL, 0.24, dica, tam=T_ROTULO, cor=CZ, nome='Dica')
        return s

    def mensagem(self, olho, frase, notas, dica=None):
        """Slide de mensagem: uma frase grande no lugar do título."""
        s = self._slide(L_MENSAGEM, notas, frase)
        self._ph(s, 13, olho, 'Olho'); self._ph(s, 0, frase, 'Mensagem')
        if dica: texto(s, MARGEM, Y_DICA, UTIL, 0.24, dica, tam=T_ROTULO, cor=CZ, nome='Dica')
        return s

    def fechamento(self, olho, frase, notas):
        """Slide final em azul profundo: a mensagem acima da linha d'água, o combinado abaixo."""
        s = self._slide(L_FECHAMENTO, notas, frase)
        self._ph(s, 13, olho, 'Olho'); self._ph(s, 0, frase, 'Mensagem')
        return s

    # -- gravação
    def _finaliza(self):
        prs = self.prs
        cp = prs.core_properties
        cp.title, cp.subject, cp.author, cp.last_modified_by = self.titulo, self.descricao, AUTOR, AUTOR
        cp.keywords = self.palavras or 'gestão da mudança; modelo de apresentação'
        cp.category, cp.comments, cp.language, cp.content_status = 'Modelo de apresentação', f'{MARCA}: modelo livre para uso e adaptação.', 'pt-BR', ''
        cp.created = cp.modified = datetime.datetime.now().replace(microsecond=0); cp.revision = 1
        pacote = prs.part.package
        for parte in pacote.iter_parts():
            el = getattr(parte, '_element', None)
            if str(parte.partname).startswith('/ppt/theme/'):
                if MARCA.encode() not in parte.blob[:600]:      # o tema das anotações recebe as mesmas cores e fontes
                    if el is None: parte._blob = _tema(parte.blob)
                    else: parte._element = parse_xml(_tema(parte.blob))
            elif el is not None:      # idioma de revisão em todo o texto (sem isso o PowerPoint sublinha o português como erro)
                for tag in ('a:rPr', 'a:endParaRPr'):
                    for no in el.iter(qn(tag)): no.set('lang', 'pt-BR')
        if len(self._secoes) > 1:      # seções do PowerPoint: cada slide pertence a uma
            ids = [el.get('id') for el in prs._element.find(qn('p:sldIdLst'))]
            partes = ''
            for k, (nome, ini) in enumerate(self._secoes):
                fim = self._secoes[k + 1][1] if k + 1 < len(self._secoes) else len(ids)
                guid = str(uuid.uuid5(uuid.NAMESPACE_URL, f'{self.titulo}/{nome}')).upper()
                partes += (f'<p14:section name="{escape(nome)}" id="{{{guid}}}"><p14:sldIdLst>' + ''.join(f'<p14:sldId id="{i}"/>' for i in ids[ini:fim]) + '</p14:sldIdLst></p14:section>')
            prs._element.append(parse_xml(f'<p:extLst {_NS}><p:ext uri="{{521415D9-36F7-43E2-AB2F-B90AF26B5E84}}">'
                                          f'<p14:sectionLst xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main">{partes}</p14:sectionLst></p:ext></p:extLst>'))
        n = len(self._titulos)
        tit = ''.join(f'<vt:lpstr>{escape(t)}</vt:lpstr>' for t in [TXT, TIT, MARCA] + self._titulos)
        par = lambda rot, q: f'<vt:variant><vt:lpstr>{rot}</vt:lpstr></vt:variant><vt:variant><vt:i4>{q}</vt:i4></vt:variant>'
        app = pacote.part_related_by(RT.EXTENDED_PROPERTIES)
        app._blob = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
                     'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><TotalTime>0</TotalTime><Application>Microsoft Office PowerPoint</Application>'
                     f'<PresentationFormat>Widescreen</PresentationFormat><Slides>{n}</Slides><Notes>{n}</Notes><HiddenSlides>0</HiddenSlides><MMClips>0</MMClips><ScaleCrop>false</ScaleCrop>'
                     f'<HeadingPairs><vt:vector size="6" baseType="variant">{par("Fontes usadas", 2)}{par("Tema", 1)}{par("Títulos de slides", n)}</vt:vector></HeadingPairs>'
                     f'<TitlesOfParts><vt:vector size="{n + 3}" baseType="lpstr">{tit}</vt:vector></TitlesOfParts><Company>{MARCA}</Company><LinksUpToDate>false</LinksUpToDate>'
                     '<SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0000</AppVersion></Properties>').encode('utf-8')

    def salvar(self, arquivo, pasta=None):
        self._finaliza()
        pasta = pasta or SAIDA
        os.makedirs(pasta, exist_ok=True)
        caminho = os.path.join(pasta, arquivo)
        self.prs.save(caminho)
        print(f'{arquivo}: {len(self._titulos)} slides')
        return caminho
