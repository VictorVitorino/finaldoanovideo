# Logos: Alvarez & Marsal, Performance e DTS

As três marcas usadas nos materiais do time. Os arquivos ficam em `assets/logos/` e a folha visual está em `examples/logos.html`. **Use sempre estes arquivos.** Não redesenhe a marca em SVG, em texto ou em código.

## Hierarquia

**Alvarez & Marsal vem primeiro, depois Performance, depois DTS.** Essa é a ordem de leitura, da esquerda para a direita ou de cima para baixo, em qualquer assinatura:

| Nível | Marca | Papel |
|---|---|---|
| 1 | Alvarez & Marsal | Marca-mãe. Aparece em toda peça. |
| 2 | Performance (lockup "A&M \| PERFORMΛNCE") | Prática que assina o trabalho. |
| 3 | DTS · Digital & Technology Services | Time que entrega a solução de tecnologia. |

Separe as marcas com um fio vertical de 1px, a 35% de opacidade da cor do texto, e espaço de 24px (`space-6`) de cada lado. Classes prontas: `.am-lockup` e `.am-lockup-sep` em `components/am-slide.css`.

**Mesma altura de letra.** Lado a lado, as maiúsculas das três marcas têm a mesma altura, cerca de 23px no canvas de 1600. A caixa-alta do DTS nunca passa a de PERFORMΛNCE. Como os arquivos têm proporções diferentes, a altura da imagem muda:

| Marca | Altura da imagem |
|---|---|
| Nome A&M | 24px |
| Performance | 48px |
| DTS | 26px |

## Arquivos

| Arquivo | Fundo | Uso | Tamanho do arquivo |
|---|---|---|---|
| `alvarez-marsal/am-logo-vertical-cor.png` | Claro | Contracapa clara e documentos Word. Na capa clara, use `am-simbolo-am-cor` | 900 × 623 |
| `alvarez-marsal/am-logo-vertical-branco.png` | Navy | Contracapa navy, banner, fundo de vídeo. **Nunca na capa nem na divisória**, onde vai `am-simbolo-am-branco` | 900 × 623 |
| `alvarez-marsal/am-nome-navy.png` | Claro | Topo direito do slide de conteúdo, rodapés | 900 × 79 |
| `alvarez-marsal/am-nome-branco.png` | Navy | Faixa de topo, divisórias, assinatura em capa navy | 900 × 79 |
| `alvarez-marsal/am-simbolo-am-branco.png` | Navy | **Logo da capa oficial**: símbolo com "A&M" empilhado, no alto à esquerda da capa e da divisória | 707 × 513 |
| `alvarez-marsal/am-simbolo-am-cor.png` | Claro | Mesmo logo para capa clara | 707 × 513 |
| `alvarez-marsal/am-simbolo-cor.png` | Claro | Ícone, favicon, avatar. Só quando o nome aparece em outro lugar da peça | 556 × 513 |
| `alvarez-marsal/am-simbolo-branco.png` | Navy | Mesmo uso, sobre navy | 556 × 513 |
| `performance/performance-navy.png` | Claro | Assinatura da prática em fundo claro | 333 × 51 |
| `performance/performance-branco.png` | Navy | Assinatura da prática em fundo navy | 333 × 51 |
| `performance/performance-sobre-navy-original.png` | (já tem fundo) | Arquivo como foi recebido, com o fundo navy. Referência, não para uso | 335 × 53 |
| `dts/dts-navy.png` | Claro | Assinatura do time em fundo claro | 559 × 79 |
| `dts/dts-branco.png` | Navy | Assinatura do time em fundo navy | 559 × 79 |

**De onde vem cada arquivo.** O A&M saiu do arquivo oficial em alta resolução que já estava no repositório. O nome e o símbolo foram separados desse mesmo arquivo. Performance e DTS saíram das imagens enviadas pelo time. O logo da capa (`am-simbolo-am-*`) foi montado com o símbolo e os glifos A, & e M do próprio nome oficial, na disposição da capa oficial. Troque-o pelo arquivo oficial quando a área de marca enviar. A versão de cor oposta de cada marca foi gerada trocando só as cores do arquivo recebido:

- **Branco para navy.** O texto e o "A" branco viram navy `#002B49`.
- **Cinza-claro para navy-80.** O descritivo do DTS vira navy-80 `#33556D`.
- **Barras do símbolo na versão branca.** Viram azul-100 `#5E8AB4` liso, como na capa oficial e no lockup Performance.
- **Cores que ficam.** O Λ azul de PERFORMΛNCE e o fio laranja do DTS não mudam.

## Qual versão usar

- **Fundo branco ou cinza-20:** versão `-cor` ou `-navy`.
- **Fundo navy `#002B49`:** versão `-branco`.
- **Fundo azul, laranja ou foto:** evite. Se não houver opção, use a versão branca sobre uma área navy sólida.

## Tamanho mínimo e área de proteção

- **Área de proteção.** Deixe livre em volta da marca um espaço igual à altura das maiúsculas do nome. Nada de texto, fio ou borda dentro dela.
- **Alvarez & Marsal (nome):** 12px de altura na tela, ou 0,12 in no impresso.
- **Alvarez & Marsal (vertical):** 48px de altura.
- **Performance:** 24px de altura.
- **DTS:** 24px de altura.

**Resolução dos arquivos de Performance e DTS.** Os dois vieram de captura de tela. Nunca amplie acima do tamanho nativo: 49px de altura para Performance e 79px para DTS. Em tela retina e no impresso, ficam nítidos até cerca da metade disso. Para capa grande, banner ou gráfica, peça o vetorial oficial (SVG, EPS ou PDF) à área de marca e troque o arquivo na mesma pasta, mantendo o nome.

## Não fazer

- Não redesenhar, redigitar o nome com outra fonte, esticar, girar, aplicar sombra, contorno ou gradiente.
- Não recolorir à mão. Use só as versões desta pasta.
- Não usar a versão navy sobre fundo escuro nem a branca sobre fundo claro.
- Não colocar o símbolo A&M, sozinho ou no logo vertical, ao lado do lockup Performance, que já o contém. Na assinatura completa, use o **nome** Alvarez & Marsal e depois o lockup Performance.
- Não inverter a ordem: DTS nunca vem antes de Performance, e nenhuma das duas vem antes de Alvarez & Marsal.
- Não usar o grafismo de diagonais como logo nem em cada página (veja abaixo).

## Grafismos

| Arquivo | Onde | Regra |
|---|---|---|
| `assets/grafismos/capa-linhas.svg` | Capa e divisória navy (`.am-cover-linhas`) | Linhas da capa oficial: diagonal branca grossa e traço fino em forma de "A", à direita. Não mova nem recolora |
| `assets/grafismos/diagonais.png` | Peças digitais do DTS e de redes sociais | Diagonais ardósia com fios laranja. **Só sobre branco ou cinza-20**, porque o ardósia some sobre navy. Fica ancorado em um canto, sangrando a borda, com no máximo 440px de largura (o tamanho nativo) e um por peça. Não use em slides de conteúdo, em cabeçalho de página nem atrás de texto |

A faixa de topo de documentos (`.am-topbar`, referência em `references/img/faixa-cabecalho-referencia.png`) é navy, com borda laranja de 10px no alto. Leva três fios finos em miniatura das linhas da capa (`.am-topbar-diag`) e o nome A&M branco à direita.

## Exemplos de assinatura

| Peça | Assinatura |
|---|---|
| Capa navy | Logo da capa (`am-simbolo-am-branco`) no alto à esquerda. Opcional: Performance · fio · DTS abaixo do subtítulo, no lugar onde a capa oficial leva o logo do cliente (`examples/capa-divisoria.html`) |
| Slide de conteúdo | Só o nome A&M navy no topo direito (`examples/slide-padrao.html`). Performance e DTS não se repetem em toda página |
| Divisória | Logo da capa no alto à esquerda, sem a assinatura das práticas |
| Post de LinkedIn | Topo: só o nome A&M. Rodapé: Performance · fio · DTS, os dois como imagem. Nunca escreva PERFORMANCE ou DTS em texto. Medidas em `references/layout-social.md` |
| Documento / relatório | Faixa de topo com o nome A&M branco. Capa no padrão da capa oficial: logo da capa no alto e, opcional, Performance · DTS no pé |
