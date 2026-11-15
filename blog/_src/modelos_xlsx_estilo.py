"""Identidade visual e componentes das planilhas-modelo do Laboratório.

Usado por modelos_xlsx.py. Aqui ficam a paleta, a tipografia, a fábrica de
formatos e os blocos que se repetem em todas as planilhas: faixa de título,
legenda de células, tabela de preenchimento, cartões de indicador, gráficos,
rodapé com a assinatura e configuração de impressão.

Convenções:
- linhas e colunas são índices a partir de zero (como no xlsxwriter);
  nas fórmulas, as referências viram A1 pelas funções `ref` e `faixa`;
- célula de ENTRADA em azul muito claro, célula CALCULADA em cinza muito
  claro com texto cinza, cabeçalho em azul profundo;
- nenhuma cor fora da paleta abaixo.
"""
import datetime
import re
import zipfile

import xlsxwriter
from xlsxwriter.utility import xl_col_to_name, xl_rowcol_to_cell

# ---------------------------------------------------------------- paleta
AZP = '#0A2463'    # azul profundo
AZ = '#2F6FED'     # azul vivo
CZ = '#667085'     # cinza
AZC = '#EAF1FE'    # azul muito claro (entrada)
CZC = '#F3F5F8'    # cinza muito claro (calculado)
AZS = '#9DBDFF'    # azul suave
LIN = '#E0E5EC'    # linhas
TINTA = '#0B1530'  # tinta do texto
BR = '#FFFFFF'

MARCA = 'Change Management World · Victor Vitorino'
LIVRE = 'Modelo livre para uso e adaptação.'
SERIFA, SEM_SERIFA = 'Georgia', 'Calibri'

# Tamanhos de fonte (poucos, sempre os mesmos)
T_TITULO, T_SECAO, T_SUB, T_CORPO, T_CAB, T_NOTA, T_KPI = 22, 13, 11, 10.5, 10, 9, 24

# Régua de cinco marcas, do cinza (resiste) ao azul profundo (multiplica), e a cor do texto sobre cada uma
REGUA = [CZ, LIN, AZS, AZ, AZP]
REGUA_TEXTO = [BR, TINTA, TINTA, BR, BR]

# Grade do painel e da aba "Como usar": margem + 12 colunas iguais + margem
GRADE_N, GRADE_L, MARGEM = 12, 12, 2

# Nomes curtos (em português) para as propriedades de formato do xlsxwriter
_PROPS = {
    'fonte': 'font_name', 'tam': 'font_size', 'cor': 'font_color', 'negrito': 'bold',
    'italico': 'italic', 'fundo': 'bg_color', 'alinha': 'align', 'valinha': 'valign',
    'quebra': 'text_wrap', 'num': 'num_format', 'recuo': 'indent', 'gira': 'rotation',
    'encolhe': 'shrink',
}


def ref(lin, col, fixa=False):
    """Referência A1 de uma célula (índices a partir de zero)."""
    return xl_rowcol_to_cell(lin, col, row_abs=fixa, col_abs=fixa)


def letra(col):
    return xl_col_to_name(col)


def px_col(largura):
    """Largura de coluna em pixels, como o Excel calcula para a fonte padrão."""
    return int(largura * 7 + 0.5) + 5 if largura >= 1 else int(largura * 12 + 0.5)


def px_lin(altura):
    return int(altura * 4 / 3)


def linhas_de_texto(texto, largura, tam=T_CORPO):
    """Estima em quantas linhas o texto quebra numa coluna com essa largura.
    Em Calibri 10,5 cabem, com folga, 1,2 caractere por unidade de largura."""
    cabe = max(4, largura * 1.2 * T_CORPO / tam - 1)
    total = 0
    for paragrafo in str(texto).split('\n'):
        atual, n = 0, 1
        for palavra in paragrafo.split(' '):
            tamanho = len(palavra) + (1 if atual else 0)
            if atual + tamanho > cabe and atual:
                n, atual = n + 1, len(palavra)
            else:
                atual += tamanho
        total += n
    return total


def altura_de_texto(texto, largura, tam=T_CORPO, minimo=20, folga=8):
    """Altura de linha (em pontos) para o texto caber com respiro."""
    return max(minimo, round(linhas_de_texto(texto, largura, tam) * tam * 1.36 + folga))


def num_dir(fmt):
    """Formato numérico com três espaços de respiro à direita. O recuo de célula
    só vale para alinhamento à esquerda no LibreOffice; o espaço no formato vale
    em qualquer programa e equivale a um nível de recuo do Excel."""
    partes = fmt.split(';')
    for i, parte in enumerate(partes[:3]):           # positivos, negativos e zero (a 4ª seção é de texto)
        if parte:
            partes[i] = parte + '"   "'
    return ';'.join(partes)


def _alinha(e, alinha, num):
    """Aplica alinhamento, recuo e formato numérico a um estilo de célula."""
    e['alinha'] = alinha
    if num and alinha == 'right' and num != 'General':
        e['num'] = num_dir(num)
    else:
        if alinha in ('left', 'right'):
            e['recuo'] = 1
        if num:
            e['num'] = num
    return e


class _TextoVazio(str):
    """Resultado em cache de uma fórmula que devolve texto vazio.

    O xlsxwriter grava o tipo "texto" quando o valor não é igual a "";
    assim a célula aparece vazia (e não zero) em visualizadores que não
    recalculam, como o modo protegido do Excel.
    """

    def __eq__(self, outro):
        return False

    def __ne__(self, outro):
        return True

    __hash__ = str.__hash__


VAZIO = _TextoVazio('')


class Col:
    """Uma coluna de tabela de preenchimento.

    tipo: 'entrada' (a pessoa preenche), 'calc' (fórmula), 'apoio' (fórmula em
    coluna oculta, usada pelo painel) ou 'vazio' (coluna de margem).
    nota: explicação que aparece ao selecionar o cabeçalho (como é calculado)."""

    def __init__(self, chave, titulo, largura, tipo='entrada', alinha='left', num=None,
                 formula=None, valida=None, estilo=None, quebra=True, nota=None, sub=None):
        self.chave, self.titulo, self.largura, self.tipo = chave, titulo, largura, tipo
        self.alinha, self.num, self.formula, self.valida = alinha, num, formula, valida
        self.estilo, self.quebra, self.nota, self.sub = estilo or {}, quebra, nota, sub


class Tabela:
    """Posição de uma tabela já escrita: serve para montar fórmulas e faixas."""

    def __init__(self, aba, lin_cab, lin0, n, colunas):
        self.aba, self.lin_cab, self.lin0, self.n = aba, lin_cab, lin0, n
        self.linN = lin0 + n - 1
        self.col = dict(colunas)                       # chave -> índice da coluna
        self.L = {k: letra(c) for k, c in colunas}     # chave -> letra da coluna
        self.r0, self.rn = lin0 + 1, lin0 + n          # primeira e última linha (base 1)

    def faixa(self, chave, externa=True, fixa=True):
        """Faixa da coluna inteira, por exemplo 'Riscos'!$C$8:$C$37."""
        c = self.L[chave]
        s = f'${c}${self.r0}:${c}${self.rn}' if fixa else f'{c}{self.r0}:{c}{self.rn}'
        return (self.aba.prefixo + s) if externa else s

    def cab(self, chave, externa=True):
        s = f'${self.L[chave]}${self.lin_cab + 1}'
        return (self.aba.prefixo + s) if externa else s

    def cel(self, chave, i, externa=True, fixa=False):
        """Célula da linha i (a partir de zero) da tabela."""
        c, r = self.L[chave], self.r0 + i
        s = f'${c}${r}' if fixa else f'{c}{r}'
        return (self.aba.prefixo + s) if externa else s


class Pasta:
    """Um arquivo .xlsx com a identidade visual do blog."""

    def __init__(self, caminho, titulo, resumo, valores=None, exemplo=True):
        self.caminho, self.titulo = caminho, titulo
        self.valores = valores          # resultados das fórmulas (2ª passada) ou None
        self.exemplo = exemplo          # False gera a planilha sem os dados de exemplo
        self.wb = xlsxwriter.Workbook(caminho, {'in_memory': True})
        self.wb.set_size(1500, 950)
        self.wb.set_properties({
            'title': titulo, 'subject': resumo, 'author': 'Victor Vitorino',
            'company': 'Change Management World', 'category': 'Gestão da mudança',
            'keywords': 'gestão da mudança, modelo, planilha',
            'created': datetime.datetime(2026, 11, 14, 12, 0, 0),
        })
        self._formatos = {}
        self.abas = []

    # ------------------------------------------------------------ formatos
    def fmt(self, **p):
        """Formato de célula, com cache. Aceita os nomes curtos de _PROPS e:
        borda=cor (fio fino nos quatro lados), acima/abaixo/esq/dir=cor ou (cor, estilo)."""
        chave = tuple(sorted((k, str(v)) for k, v in p.items()))
        if chave in self._formatos:
            return self._formatos[chave]
        d = {'font_name': SEM_SERIFA, 'font_size': T_CORPO, 'font_color': TINTA, 'valign': 'vcenter'}
        for k, v in p.items():
            if k == 'borda':
                d.update({'border': 1, 'border_color': v})
            elif k in ('acima', 'abaixo', 'esq', 'dir'):
                lado = {'acima': 'top', 'abaixo': 'bottom', 'esq': 'left', 'dir': 'right'}[k]
                cor, estilo = v if isinstance(v, tuple) else (v, 1)
                d.update({lado: estilo, lado + '_color': cor})
            else:
                d[_PROPS.get(k, k)] = v
        if d.get('font_name') == SERIFA:
            d['font_family'] = 1
        f = self._formatos[chave] = self.wb.add_format(d)
        return f

    def dxf(self, fundo=None, cor=None, negrito=None, borda=None):
        """Formato para formatação condicional (só cor, peso, fundo e borda)."""
        d = {}
        if fundo:
            d['bg_color'] = fundo
        if cor:
            d['font_color'] = cor
        if negrito is not None:
            d['bold'] = negrito
        if borda:
            d.update({'border': 1, 'border_color': borda})
        return self.wb.add_format(d)

    def aba(self, nome, papel):
        a = Aba(self, nome, papel)
        self.abas.append(a)
        return a

    def salvar(self):
        primeira = self.abas[0].ws
        primeira.activate()
        primeira.set_first_sheet()
        self.wb.close()
        aplica_tema(self.caminho)


# Tema do arquivo: as cores e as fontes que o Excel oferece em "Cores do tema" e
# usa em gráficos e formas novos. Trocamos o tema padrão pela paleta do blog,
# para que o que a pessoa acrescentar já nasça na identidade.
TEMA_CORES = {
    'dk1': TINTA, 'lt1': BR, 'dk2': AZP, 'lt2': CZC, 'accent1': AZ, 'accent2': AZP, 'accent3': AZS,
    'accent4': CZ, 'accent5': AZC, 'accent6': LIN, 'hlink': AZ, 'folHlink': CZ,
}
NOME_TEMA = 'Change Management World'


def aplica_tema(caminho):
    """Regrava o .xlsx trocando só o tema (cores e fonte de títulos). Mantém a
    ordem e a data fixa das partes, para a geração continuar reproduzível."""
    with zipfile.ZipFile(caminho) as z:
        partes = [(info.filename, z.read(info.filename)) for info in z.infolist()]
    with zipfile.ZipFile(caminho, 'w', zipfile.ZIP_DEFLATED) as z:
        for nome, dados in partes:
            if nome == 'xl/theme/theme1.xml':
                x = dados.decode('utf-8')
                for chave, cor in TEMA_CORES.items():
                    x, n = re.subn(rf'<a:{chave}>.*?</a:{chave}>', f'<a:{chave}><a:srgbClr val="{cor[1:]}"/></a:{chave}>', x, count=1)
                    assert n == 1, chave
                x = x.replace('<a:majorFont><a:latin typeface="Cambria"/>', f'<a:majorFont><a:latin typeface="{SERIFA}"/>')
                x = x.replace('name="Office Theme"', f'name="{NOME_TEMA}"').replace('<a:clrScheme name="Office">', f'<a:clrScheme name="{NOME_TEMA}">')
                x = x.replace('<a:fontScheme name="Office">', f'<a:fontScheme name="{NOME_TEMA}">')
                x = x.replace('<a:srgbClr val="000000">', f'<a:srgbClr val="{TINTA[1:]}">')      # sombra dos efeitos do tema
                dados = x.encode('utf-8')
            info = zipfile.ZipInfo(nome, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, dados)


class Aba:
    """Uma aba da pasta, com os componentes de layout."""

    CORES_ABA = {'guia': CZ, 'entrada': AZ, 'painel': AZP, 'listas': AZS}

    def __init__(self, pasta, nome, papel):
        self.p, self.nome, self.papel = pasta, nome, papel
        self.ws = pasta.wb.add_worksheet(nome)
        self.ws.hide_gridlines(2)
        self.ws.set_tab_color(self.CORES_ABA[papel])
        self.prefixo = "'" + nome.replace("'", "''") + "'!"
        self.larg, self.alt = {}, {}

    # ------------------------------------------------------------ medidas
    def colunas(self, larguras, inicio=0):
        for i, w in enumerate(larguras):
            self.ws.set_column(inicio + i, inicio + i, w)
            self.larg[inicio + i] = w

    def grade(self):
        """Margem + 12 colunas iguais + margem. Devolve o índice da última coluna."""
        self.colunas([MARGEM] + [GRADE_L] * GRADE_N + [MARGEM])
        return GRADE_N + 1

    def altura(self, lin, h):
        self.ws.set_row(lin, h)
        self.alt[lin] = h

    def largura_de(self, c1, c2):
        return sum(self.larg.get(c, 8.43) for c in range(c1, c2 + 1))

    # ------------------------------------------------------------ escrita
    def texto(self, lin, col, valor, **estilo):
        f = self.p.fmt(**estilo)
        if valor is None or valor == '':
            self.ws.write_blank(lin, col, None, f)
        elif isinstance(valor, (datetime.date, datetime.datetime)):
            self.ws.write_datetime(lin, col, valor, f)
        elif isinstance(valor, (int, float)) and not isinstance(valor, bool):
            self.ws.write_number(lin, col, valor, f)
        else:
            self.ws.write_string(lin, col, str(valor), f)

    def _cache(self, lin, col):
        """Resultado guardado da fórmula (para quem abre sem recalcular)."""
        if self.p.valores is None:
            return ''
        v = self.p.valores.get((self.nome, ref(lin, col)))
        return VAZIO if v is None or v == '' else v

    def formula(self, lin, col, f, **estilo):
        self.ws.write_formula(lin, col, f, self.p.fmt(**estilo), self._cache(lin, col))

    def mescla(self, l1, c1, l2, c2, valor, **estilo):
        f = self.p.fmt(**estilo)
        if (l1, c1) == (l2, c2):
            return self.texto(l1, c1, valor, **estilo)
        if isinstance(valor, str) and valor.startswith('='):
            self.ws.merge_range(l1, c1, l2, c2, '', f)
            self.ws.write_formula(l1, c1, valor, f, self._cache(l1, c1))
        else:
            self.ws.merge_range(l1, c1, l2, c2, '' if valor is None else valor, f)

    def rico(self, l1, c1, l2, c2, partes, **estilo):
        """Texto com trechos de estilos diferentes: partes = [(texto, estilo), ...]."""
        f = self.p.fmt(**estilo)
        partes = [(t, e) for t, e in partes if t]
        if len(partes) == 1:
            partes.append((' ', partes[0][1]))
        args = []
        for t, e in partes:
            args += [self.p.fmt(**e), t]
        if (l1, c1) != (l2, c2):
            self.ws.merge_range(l1, c1, l2, c2, '', f)
        self.ws.write_rich_string(l1, c1, *args, f)

    def pinta(self, l1, c1, l2, c2, **estilo):
        f = self.p.fmt(**estilo)
        for lin in range(l1, l2 + 1):
            for col in range(c1, c2 + 1):
                self.ws.write_blank(lin, col, None, f)

    # ------------------------------------------------------------ faixa de título
    def faixa(self, olho, titulo, sub, ult):
        """Faixa de título em azul profundo com fio azul vivo. Devolve a próxima linha."""
        n_sub = linhas_de_texto(sub, self.largura_de(1, ult - 1), T_SUB)
        for lin, h in ((0, 21), (1, 35), (2, 9 + 15 * n_sub), (3, 3)):
            self.altura(lin, h)
        self.pinta(0, 0, 2, ult, fundo=AZP)
        self.mescla(0, 1, 0, ult - 1, olho.upper(), fundo=AZP, cor=AZS, tam=T_NOTA, negrito=True, valinha='bottom')
        self.mescla(1, 1, 1, ult - 1, titulo, fundo=AZP, cor=BR, tam=T_TITULO, fonte=SERIFA)
        self.mescla(2, 1, 2, ult - 1, sub, fundo=AZP, cor=AZC, tam=T_SUB, valinha='top', quebra=True)
        self.pinta(3, 0, 3, ult, fundo=AZ)
        return 4

    # ------------------------------------------------------------ legenda
    def legenda(self, lin, dica, c_dica, fichas, alt=21, rotulo=None, alinha='left'):
        """Linha com as fichas da convenção de células e uma dica curta.

        c_dica = (primeira, última coluna da dica); fichas = [(c1, c2, rótulo, tipo)],
        com tipo 'entrada', 'calc' ou (cor de fundo, cor do texto);
        rotulo = coluna onde escrever "Legenda", se couber."""
        self.altura(lin, alt)
        if rotulo is not None:
            self.texto(lin, rotulo, 'LEGENDA', cor=CZ, tam=T_NOTA, negrito=True, alinha='right', recuo=1)
        if dica:
            self.mescla(lin, c_dica[0], lin, c_dica[1], dica, cor=CZ, tam=T_NOTA, alinha=alinha, recuo=1)
        for c1, c2, texto, tipo in fichas:
            if tipo == 'entrada':
                e = dict(fundo=AZC, cor=TINTA)
            elif tipo == 'calc':
                e = dict(fundo=CZC, cor=CZ)
            else:
                e = dict(fundo=tipo[0], cor=tipo[1], negrito=True)
            self.mescla(lin, c1, lin, c2, texto, tam=T_NOTA, alinha='center', borda=BR, **e)

    # ------------------------------------------------------------ estilos de célula
    @staticmethod
    def e_entrada(alinha='left', num=None, quebra=True, **mais):
        e = _alinha(dict(fundo=AZC, cor=TINTA, borda=BR, quebra=quebra), alinha, num)
        e.update(mais)
        return e

    @staticmethod
    def e_calc(alinha='left', num=None, quebra=True, **mais):
        e = _alinha(dict(fundo=CZC, cor=CZ, borda=BR, quebra=quebra), alinha, num)
        e.update(mais)
        return e

    @staticmethod
    def e_cab(alinha='left', **mais):
        e = _alinha(dict(fundo=AZP, cor=BR, negrito=True, tam=T_CAB, borda=BR, quebra=True), alinha, None)
        e.update(mais)
        return e

    @staticmethod
    def e_linha(alinha='left', num=None, **mais):
        """Linha de tabela do painel: fundo branco e fio fino embaixo."""
        e = _alinha(dict(cor=TINTA, abaixo=LIN, quebra=True), alinha, num)
        e.update(mais)
        return e

    # ------------------------------------------------------------ tabela de preenchimento
    def prepara(self, cols, col0=1):
        """Define as larguras: margem, colunas da tabela (as de apoio ficam
        ocultas). Devolve o índice da margem direita (primeira coluna 'vazio')."""
        self.colunas([MARGEM])
        ult = None
        for j, c in enumerate(cols):
            self.ws.set_column(col0 + j, col0 + j, c.largura, None, {'hidden': 1} if c.tipo == 'apoio' else {})
            self.larg[col0 + j] = c.largura
            if c.tipo == 'vazio' and ult is None:
                ult = col0 + j
        return ult

    def tabela(self, lin_cab, col0, cols, n, dados=None, alt_cab=34, alt=26, alt_sub=30):
        """Escreve cabeçalho e n linhas. `dados` traz os exemplos: uma tupla por
        linha, na ordem das colunas de entrada. Se alguma coluna tiver `sub`, o
        cabeçalho ocupa duas linhas (nome curto em cima, explicação embaixo).
        Devolve a Tabela."""
        dados = dados if (dados and self.p.exemplo) else []
        indices = [(c.chave, col0 + j) for j, c in enumerate(cols)]
        duplo = any(c.sub for c in cols)
        t = Tabela(self, lin_cab, lin_cab + (2 if duplo else 1), n, indices)
        self.altura(lin_cab, alt_cab)
        if duplo:
            self.altura(lin_cab + 1, alt_sub)
        for j, c in enumerate(cols):
            if c.tipo == 'vazio':
                continue
            if c.tipo == 'apoio':
                self.texto(lin_cab, col0 + j, c.titulo, cor=CZ, tam=T_NOTA)
            elif duplo and c.sub:
                self.texto(lin_cab, col0 + j, c.titulo, **self.e_cab(c.alinha, valinha='bottom', abaixo=AZP))
                self.texto(lin_cab + 1, col0 + j, c.sub, **self.e_cab(c.alinha, negrito=False, tam=T_NOTA, cor=AZC, valinha='top', acima=AZP))
            elif duplo:
                self.mescla(lin_cab, col0 + j, lin_cab + 1, col0 + j, c.titulo, **self.e_cab(c.alinha))
            else:
                self.texto(lin_cab, col0 + j, c.titulo, **self.e_cab(c.alinha))
            if c.nota:
                self.ws.data_validation(lin_cab, col0 + j, lin_cab, col0 + j, {
                    'validate': 'any', 'input_title': 'Como é calculado' if c.tipo == 'calc' else c.titulo.replace('\n', ' ')[:32],
                    'input_message': c.nota[:255]})
        entradas = [c for c in cols if c.tipo == 'entrada']
        for i in range(n):
            lin = t.lin0 + i
            h = alt
            linha = dict(zip([c.chave for c in entradas], dados[i])) if i < len(dados) else {}
            for j, c in enumerate(cols):
                col = col0 + j
                if c.tipo == 'vazio':
                    continue
                if c.tipo == 'entrada':
                    v = linha.get(c.chave)
                    self.texto(lin, col, v, **self.e_entrada(c.alinha, c.num, c.quebra, **c.estilo))
                    if v and isinstance(v, str) and c.quebra:
                        h = max(h, altura_de_texto(v, c.largura, minimo=alt, folga=10))
                else:
                    f = c.formula.format(r=lin + 1, r0=t.r0, rn=t.rn, rc=lin_cab + 1, **t.L)
                    if c.tipo == 'apoio':
                        self.formula(lin, col, f, cor=CZ, tam=T_NOTA)
                    else:
                        self.formula(lin, col, f, **self.e_calc(c.alinha, c.num, c.quebra, **c.estilo))
            self.altura(lin, h)
        for j, c in enumerate(cols):
            if c.valida:
                self.ws.data_validation(t.lin0, col0 + j, t.linN, col0 + j, c.valida)
        return t

    def condicional(self, l1, c1, l2, c2, regras):
        """regras = [(texto exato, fundo, cor do texto)], aplicadas por igualdade."""
        for valor, fundo, cor in regras:
            self.ws.conditional_format(l1, c1, l2, c2, {
                'type': 'cell', 'criteria': '==', 'value': f'"{valor}"',
                'format': self.p.dxf(fundo=fundo, cor=cor, negrito=True)})

    def barra(self, l1, c1, l2, c2, maximo):
        """Barra de dados em azul suave atrás do número (de zero até `maximo`)."""
        self.ws.conditional_format(l1, c1, l2, c2, {
            'type': 'data_bar', 'bar_color': AZS, 'bar_solid': True, 'bar_no_border': True,
            'bar_negative_color': AZS, 'bar_negative_border_color': AZS, 'bar_axis_color': LIN,
            'min_type': 'num', 'min_value': 0, 'max_type': 'num', 'max_value': maximo})

    def condicional_formula(self, l1, c1, l2, c2, formula, **estilo):
        self.ws.conditional_format(l1, c1, l2, c2, {
            'type': 'formula', 'criteria': formula, 'format': self.p.dxf(**estilo)})

    # ------------------------------------------------------------ painel
    def secao(self, lin, col, titulo, sub=None, c2=None):
        """Título de seção em serifa, com uma linha de apoio opcional."""
        self.altura(lin, 26)
        self.texto(lin, col, titulo, fonte=SERIFA, tam=T_SECAO, cor=AZP)
        if sub:
            self.altura(lin + 1, 17)
            if c2:
                self.mescla(lin + 1, col, lin + 1, c2, sub, cor=CZ, tam=T_NOTA, valinha='top')
            else:
                self.texto(lin + 1, col, sub, cor=CZ, tam=T_NOTA, valinha='top')

    def cartao(self, lin, col, ncols, rotulo, formula, nota=None, num='0', texto=False):
        """Cartão de indicador em três linhas: rótulo (com fio azul), valor e nota."""
        for c in range(col, col + ncols - 1):
            self.texto(lin, c, None, acima=(AZ, 2))
        self.texto(lin, col, rotulo.upper(), cor=CZ, tam=T_NOTA, negrito=True, valinha='bottom', acima=(AZ, 2))
        e = dict(fonte=SERIFA, cor=AZP, alinha='left', tam=16 if texto else T_KPI, encolhe=bool(texto))
        if not texto:
            e['num'] = num
        self.mescla(lin + 1, col, lin + 1, col + ncols - 1, formula, **e)
        if nota:
            self.mescla(lin + 2, col, lin + 2, col + ncols - 1, nota, cor=CZ, tam=T_NOTA, valinha='top')

    def cartoes(self, lin, itens):
        """Fileira de quatro cartões na grade de 12 colunas. Devolve a próxima linha."""
        for a, h in ((lin, 22), (lin + 1, 40), (lin + 2, 19)):
            self.altura(a, h)
        n = GRADE_N // len(itens)
        for i, item in enumerate(itens):
            self.cartao(lin, 1 + i * n, n, *item[:3], **(item[3] if len(item) > 3 else {}))
        return lin + 3

    def tira(self, lin, rotulo, itens, c1=1, c2=GRADE_N, tam=T_CAB):
        """Tira de leitura: rótulo em caixa alta e blocos de texto lado a lado.
        Cada item é um texto ou um par (título, texto). Devolve a próxima linha."""
        self.altura(lin, 20)
        self.texto(lin, c1, rotulo.upper(), cor=AZ, tam=T_NOTA, negrito=True, valinha='bottom')
        n = (c2 - c1 + 1) // len(itens)
        h = 20
        for i, item in enumerate(itens):
            ultimo = i == len(itens) - 1
            a, b = c1 + i * n, c1 + i * n + n - 1
            fim = b if ultimo else b - 1                 # a última coluna do bloco fica de respiro
            titulo, corpo = item if isinstance(item, tuple) else (None, item)
            partes = ([(titulo + '\n', dict(negrito=True, cor=AZP, tam=T_CORPO))] if titulo else []) + [(corpo, dict(cor=TINTA, tam=tam))]
            self.rico(lin + 1, a, lin + 1, fim, partes, valinha='top', quebra=True, tam=tam, acima=LIN)
            if not ultimo:
                self.texto(lin + 1, b, None, acima=LIN)
            h = max(h, altura_de_texto(corpo, self.largura_de(a, fim), tam, folga=12) + (15 if titulo else 0))
        self.altura(lin + 1, h)
        return lin + 2

    # ------------------------------------------------------------ gráficos
    def grafico(self, ch, l1, c1, l2, c2, descricao):
        """Insere o gráfico ocupando exatamente o bloco de células l1:c1 a l2:c2."""
        larg = sum(px_col(self.larg.get(c, 8.43)) for c in range(c1, c2 + 1))
        alt = sum(px_lin(self.alt.get(lin, 15)) for lin in range(l1, l2 + 1))
        ch.set_size({'width': larg, 'height': alt})
        self.ws.insert_chart(l1, c1, ch, {'description': descricao, 'object_position': 1})

    # ------------------------------------------------------------ rodapé e impressão
    def rodape(self, lin, ult, extra=None):
        """Assinatura no fim da área de trabalho. Devolve a linha usada."""
        self.altura(lin - 1, 12)
        self.altura(lin, 20)
        for c in range(1, ult):
            self.texto(lin, c, None, acima=LIN)
        texto = f'{MARCA} · {LIVRE}' + (f' {extra}' if extra else '')
        self.texto(lin, 1, texto, cor=CZ, tam=T_NOTA, acima=LIN)
        return lin

    def imprime(self, ult_lin, ult_col, repete=None, uma_pagina=False):
        """Paisagem, uma página de largura, margens estreitas, cabeçalho e rodapé."""
        ws = self.ws
        ws.set_landscape()
        ws.set_paper(9)                         # A4
        ws.fit_to_pages(1, 1 if uma_pagina else 0)
        ws.set_margins(left=0.4, right=0.4, top=0.62, bottom=0.58)
        ws.center_horizontally()
        ws.print_area(0, 0, ult_lin, ult_col)
        if repete is not None:
            ws.repeat_rows(*repete) if isinstance(repete, tuple) else ws.repeat_rows(repete)
        titulo = self.p.titulo.replace('&', '&&')
        ws.set_header(f'&L&"Calibri,Bold"&9&K0A2463{titulo}&R&"Calibri,Regular"&9&K667085{self.nome}', {'margin': 0.3})
        ws.set_footer(f'&L&"Calibri,Regular"&8&K667085{MARCA}&R&"Calibri,Regular"&8&K667085Página &P de &N', {'margin': 0.3})

    def abre_em(self, congela=None, celula=(0, 0), zoom=100):
        """Estado ao abrir: zoom, painéis congelados e célula selecionada."""
        self.ws.set_zoom(zoom)
        if congela:
            self.ws.freeze_panes(*congela)
        self.ws.set_selection(celula[0], celula[1], celula[0], celula[1])
        self.ws.ignore_errors({k: 'A1:XFD1048576' for k in (
            'number_stored_as_text', 'formula_range', 'formula_differs', 'empty_cell_reference', 'eval_error')})


# ---------------------------------------------------------------- validações
def lista(opcoes, titulo, msg, erro=None, bloqueia=True):
    """Lista suspensa. `opcoes` é uma lista de textos ou uma faixa ('=Listas!$B$8:$B$17').
    Com bloqueia=False, a lista só sugere: a pessoa pode confirmar outro valor."""
    de_faixa = isinstance(opcoes, str)
    d = {
        'validate': 'list', 'source': opcoes, 'ignore_blank': not de_faixa,
        'input_title': titulo[:32], 'input_message': msg[:255],
        'error_title': 'Valor fora da lista',
        'error_message': (erro or 'Escolha um dos valores da lista suspensa.')[:255],
    }
    if not bloqueia:
        d.update({'error_type': 'warning', 'error_message': (erro or 'Este valor não está na lista. Confirme se quer usar mesmo assim.')[:255]})
    return d


def inteiro(minimo, maximo, titulo, msg, erro=None):
    d = {'validate': 'integer', 'input_title': titulo[:32], 'input_message': msg[:255],
         'error_title': 'Valor inválido'}
    if maximo is None:
        d.update({'criteria': '>=', 'value': minimo,
                  'error_message': erro or f'Digite um número inteiro a partir de {minimo}.'})
    else:
        d.update({'criteria': 'between', 'minimum': minimo, 'maximum': maximo,
                  'error_message': erro or f'Digite um número inteiro de {minimo} a {maximo}.'})
    return d


def data(titulo, msg):
    return {'validate': 'date', 'criteria': '>=', 'value': datetime.date(2000, 1, 1),
            'input_title': titulo[:32], 'input_message': msg[:255],
            'error_title': 'Data inválida', 'error_message': 'Digite uma data no formato dd/mm/aaaa.'}


NOTA_1A5 = 'Digite um número inteiro de 1 a 5.'


# ---------------------------------------------------------------- gráficos
F_EIXO = {'name': SEM_SERIFA, 'size': 9, 'color': CZ}
F_ROTULO = {'name': SEM_SERIFA, 'size': 9, 'color': TINTA}
F_CATEG = {'name': SEM_SERIFA, 'size': 10, 'color': TINTA}
F_TITULO = {'name': SERIFA, 'size': T_SECAO, 'bold': False, 'color': AZP}
GRADE = {'visible': True, 'line': {'color': LIN, 'width': 0.5}}
SEM_GRADE = {'visible': False}


def novo_grafico(pasta, tipo, titulo, subtipo=None, legenda=None):
    """Gráfico nativo já no padrão: sem moldura, título em serifa à esquerda,
    sem legenda (a não ser que se peça 'top' ou 'bottom')."""
    opcoes = {'type': tipo}
    if subtipo:
        opcoes['subtype'] = subtipo
    ch = pasta.wb.add_chart(opcoes)
    ch.set_title({'name': titulo, 'name_font': F_TITULO, 'overlay': False, 'layout': {'x': 0.004, 'y': 0.012}})
    ch.set_chartarea({'border': {'none': True}, 'fill': {'color': BR}})
    ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}})
    if legenda:
        ch.set_legend({'position': legenda, 'font': F_EIXO})
    else:
        ch.set_legend({'none': True})
    return ch


def eixo_categorias(inverte=False, fonte=None, **mais):
    d = {'num_font': fonte or F_CATEG, 'line': {'color': LIN, 'width': 0.75},
         'major_tick_mark': 'none', 'minor_tick_mark': 'none', 'major_gridlines': SEM_GRADE}
    if inverte:
        d['reverse'] = True
    d.update(mais)
    return d


def eixo_oculto(**mais):
    d = {'visible': False, 'major_gridlines': SEM_GRADE, 'min': 0}
    d.update(mais)
    return d


def eixo_valores(**mais):
    d = {'num_font': F_EIXO, 'line': {'none': True}, 'major_tick_mark': 'none',
         'minor_tick_mark': 'none', 'major_gridlines': GRADE}
    d.update(mais)
    return d


def rotulos(cor=TINTA, num='0;;;', posicao=None, tam=9, negrito=False):
    d = {'value': True, 'num_format': num, 'font': {'name': SEM_SERIFA, 'size': tam, 'color': cor, 'bold': negrito}}
    if posicao:
        d['position'] = posicao
    return d


# ---------------------------------------------------------------- aba "Como usar"
EXEMPLO = 'As abas já vêm com um exemplo preenchido, com áreas e papéis genéricos. Para começar o seu, apague o exemplo nas células azuis.'
FICHAS_BASE = [
    ('Preencher', (AZC, TINTA), 'Azul claro: digite ou escolha na lista.'),
    ('Calculado', (CZC, CZ), 'Cinza: fórmula. Não edite.'),
    ('Cabeçalho', (AZP, BR), 'Azul profundo: título da coluna.'),
]


def como_usar(pasta, olho, titulo, serve, passos, preencher, calculos, niveis=(), aviso=None, credito=None):
    """Aba de instruções em uma página: para que serve, passos, legenda das
    cores, o que preencher e como cada conta é feita.

    passos = [(título, texto)], preencher e calculos = [(campo, explicação)],
    niveis = [(rótulo, (fundo, cor), explicação)], aviso = (rótulo, texto)."""
    a = pasta.aba('Como usar', 'guia')
    a.colunas([MARGEM, 5, 21, 60, 4, 21, 33, MARGEM])
    ult = 7
    lin = a.faixa(olho, titulo, 'Como preencher, como ler e como cada conta é feita.', ult)
    a.altura(lin, 10)
    lin += 1

    # para que serve
    a.altura(lin, 18)
    a.texto(lin, 1, 'PARA QUE SERVE', cor=AZ, tam=T_NOTA, negrito=True, valinha='bottom')
    lin += 1
    a.altura(lin, altura_de_texto(serve, a.largura_de(1, 6), T_SUB, folga=8))
    a.mescla(lin, 1, lin, 6, serve, tam=T_SUB, quebra=True, valinha='top')
    lin += 1
    a.altura(lin, 17)
    a.mescla(lin, 1, lin, 6, EXEMPLO, cor=CZ, tam=T_NOTA, valinha='top')
    lin += 1
    a.altura(lin, 4)
    lin += 1

    # passos (à esquerda) e legenda das cores (à direita), em linhas de mesma altura
    numerais = {3: 'três', 4: 'quatro', 5: 'cinco'}
    a.secao(lin, 1, f'Em {numerais.get(len(passos), len(passos))} passos')
    a.secao(lin, 5, 'Legenda das cores')
    lin += 1
    a.altura(lin, 4)
    lin += 1
    fichas = FICHAS_BASE + list(niveis)
    por_passo = 2
    n_lin = max(len(passos) * por_passo, len(fichas))
    for i in range(n_lin):
        a.altura(lin + i, 21)
    for i, (t, corpo) in enumerate(passos):
        l1 = lin + i * por_passo
        l2 = l1 + por_passo - 1
        a.mescla(l1, 1, l2, 1, i + 1, fonte=SERIFA, tam=T_SECAO + 3, cor=AZ, alinha='left', valinha='top', acima=LIN, num='0')
        a.rico(l1, 2, l2, 3, [(t + '. ', dict(negrito=True, cor=AZP)), (corpo, dict(cor=TINTA))],
               quebra=True, valinha='top', acima=LIN)
    for i, (rotulo, (fundo, cor), explica) in enumerate(fichas):
        a.texto(lin + i, 5, rotulo, fundo=fundo, cor=cor, tam=T_NOTA, alinha='center', borda=BR,
                negrito=fundo not in (AZC, CZC))
        a.texto(lin + i, 6, explica, cor=CZ, tam=T_NOTA, recuo=1)
    lin += n_lin
    a.altura(lin, 6)
    lin += 1

    # campos de entrada e contas: o nome do campo vem na cor da célula
    def bloco(lin, titulo, itens, fundo, cor):
        a.secao(lin, 1, titulo)
        a.altura(lin + 1, 3)
        lin += 2
        for campo, explica in itens:
            h = max(altura_de_texto(explica, a.largura_de(3, 6) - 3, folga=9),
                    altura_de_texto(campo, a.largura_de(1, 2) - 3, T_CAB, folga=9), 23)
            a.altura(lin, h)
            a.mescla(lin, 1, lin, 2, campo, fundo=fundo, cor=cor, negrito=True, tam=T_CAB, borda=BR, recuo=1, quebra=True)
            a.mescla(lin, 3, lin, 6, explica, quebra=True, recuo=1, abaixo=LIN)
            lin += 1
        a.altura(lin, 6)
        return lin + 1

    lin = bloco(lin, 'O que preencher', preencher, AZC, TINTA)
    lin = bloco(lin, 'Como cada conta é feita', calculos, CZC, CZ)
    if aviso:
        rotulo, corpo = aviso
        a.altura(lin, 4)
        lin += 1
        a.altura(lin, altura_de_texto(rotulo + '. ' + corpo, a.largura_de(1, 6) - 4, folga=14))
        a.rico(lin, 1, lin, 6, [(rotulo + '. ', dict(negrito=True, cor=AZP)), (corpo, dict(cor=TINTA))],
               fundo=CZC, quebra=True, recuo=1, esq=(AZ, 5))
        lin += 1
    if credito:
        a.altura(lin, 20)
        a.texto(lin, 1, credito, cor=CZ, tam=T_NOTA, valinha='bottom')
        lin += 1
    fim = a.rodape(lin + 1, ult)
    a.imprime(fim, ult, uma_pagina=True)
    a.abre_em()
    return a


# ---------------------------------------------------------------- aba "Listas"
def aba_listas(pasta, olho, sub, listas, notas, vagas=10):
    """Aba com as listas editáveis, lado a lado, e as notas de uso à direita.
    listas = [(título, itens)]. Devolve a aba e {título: (linha do 1º item, coluna)}."""
    a = pasta.aba('Listas', 'listas')
    larguras = [MARGEM]
    for _ in listas:
        larguras += [30, 3]
    larguras += [max(52, 118 - 33 * len(listas)), MARGEM]
    a.colunas(larguras)
    ult = len(larguras) - 1
    c_notas = ult - 1
    lin = a.faixa(olho, 'Listas', sub, ult)
    a.legenda(lin, 'Edite só as células azuis, de cima para baixo, sem deixar linhas em branco no meio.', (2, c_notas),
              [(1, 1, 'Preencher', 'entrada')])
    a.altura(lin + 1, 6)
    lin += 2
    a.altura(lin, 30)
    pos = {}
    for k, (titulo, itens) in enumerate(listas):
        col = 1 + 2 * k
        a.texto(lin, col, titulo, **a.e_cab())
        itens = itens if pasta.exemplo is not None else []
        for i in range(vagas):
            a.texto(lin + 1 + i, col, itens[i] if i < len(itens) else None, **a.e_entrada())
        pos[titulo] = (lin + 1, col)
    for i in range(vagas):
        a.altura(lin + 1 + i, 23)
    a.texto(lin, c_notas, 'Como funcionam', fonte=SERIFA, tam=T_SECAO, cor=AZP, recuo=1)
    for i, nota in enumerate(notas):
        l1 = lin + 1 + 2 * i
        a.rico(l1, c_notas, l1 + 1, c_notas, [('•  ', dict(cor=AZ, negrito=True)), (nota, dict(cor=TINTA))],
               quebra=True, valinha='top', recuo=1)
    fim = a.rodape(lin + vagas + 2, ult)
    a.imprime(fim, ult, uma_pagina=True)
    a.abre_em(celula=(lin + 1, 1))
    return a, pos

