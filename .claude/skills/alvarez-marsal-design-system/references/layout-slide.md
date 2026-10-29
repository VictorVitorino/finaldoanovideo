# Padrão de slide de conteúdo

Referência visual: `references/img/slide-padrao-referencia.png`. A versão em HTML está em `examples/slide-padrao.html`, e as classes ficam em `components/am-slide.css`. A tela é 16:9, desenhada em 1600 × 900 px.

## Estrutura, de cima para baixo

| Faixa | Posição (px) | Conteúdo | Classe |
|---|---|---|---|
| Topo | y 24–64 | Número da seção num círculo navy de 40px, etiqueta do capítulo em pílula laranja-20 com ponto laranja, nome Alvarez & Marsal navy à direita (17px de altura) | `.am-slide-top`, `.am-section-num`, `.am-chapter`, `.am-logo-am-nome` |
| Título | y ~90–135 | Action title em Arial Nova Light 46px navy. Duas partes podem ser separadas por um fio cinza vertical | `.am-slide-title`, `.sep` |
| Lede | y ~150–200 | Uma frase em Arial Nova Condensed 23px azul `#5E8AB4`, com a ideia-chave em navy negrito. Até 2 linhas | `.am-slide-lede`, `b` |
| Conteúdo | y 238 até 856 | Painéis cinza-20 com cantos de 8px, em grade com espaço de 16–18px | `.am-slide-body`, `.am-panel` |
| Rodapé | y ~876 | Número da página, 14px navy-80, à direita | `.am-page-num` |

Margens laterais de 80px. Fundo branco, sem faixa de cabeçalho, sem grafismo.

## Blocos de conteúdo

- **Painel.** Fundo `gray-20`, cantos `radius-md` (8px). Título em Condensed Bold 16px, caixa alta, espaçamento de 0,08em (`.am-panel-title`). Uma etiqueta à direita pode qualificar o dado: ILUSTRATIVO ou REFERÊNCIA, com contorno laranja e texto laranja escuro (`.am-flag`).
- **Matriz com escala de pontos.** As linhas são separadas por fio. O nível é marcado por ponto: navy cheio para referência, azul para proficiente, anel para em formação, ponto cinza mínimo para ausente. A legenda fica embaixo, com a nota em itálico à direita (`.am-matrix`, `.am-dot-*`, `.am-legend`).
- **Etiqueta de risco.** É uma pílula em caixa alta. ALTO usa laranja escuro com texto branco, MÉDIO usa laranja-40 com texto navy e BAIXO usa azul-20 com texto navy (`.am-risk-alto`, `-medio`, `-baixo`).
- **Trilha em chevrons.** São três etapas que escurecem da esquerda para a direita: azul-40, azul e navy. Uma nota curta fica embaixo de cada uma (`.am-chevrons`, `.am-chevron-notes`).
- **Métricas.** São cartões brancos com fio `line-soft` dentro do painel, com valor em Light 40px e rótulo em Condensed Bold 14px (`.am-metrics`, `.am-metric`).
- **Etapas numeradas.** São três blocos com número grande em Light azul, título, lista com ✓ laranja e uma linha final "SAÍDA" com o resultado esperado. A última etapa vira navy, com número e "SAÍDA" em laranja, e fecha a história (`.am-steps`, `.am-step`, `.am-step.is-final`).

## Exceções ao brand book, aprovadas pelo padrão de referência

O padrão do time ajusta algumas regras gerais do `brand-book.md`. Valem só para slides de conteúdo. As medidas deste arquivo também prevalecem sobre a tabela de tipografia do brand book:

1. **Cantos de 8px** em painéis e cartões (`radius-md`). Capas, faixas e tabelas seguem retas.
2. **Número grande em laranja sobre branco**, só em métricas com Light de 40px ou mais. É um valor de destaque por painel, nunca texto corrido. Em qualquer outro texto, o laranja sobre branco continua proibido.
3. **Laranja escuro `#C26907`** (`orange-dark`) como preenchimento da etiqueta ALTO e como texto das etiquetas ILUSTRATIVO e REFERÊNCIA.
4. **Marcador ✓ laranja** nas listas das etapas (`.am-step`), sempre ao lado de texto navy-80, nunca sozinho.
5. **Pílulas** (`radius-pill`) na etiqueta do capítulo, na etiqueta de risco e no círculo do número da seção. A etiqueta ILUSTRATIVO/REFERÊNCIA usa `radius-xs` (4px).

## Checklist antes de entregar

- O título afirma a conclusão e o lede mostra onde está a prova.
- O slide traz uma ideia por painel e no máximo três etapas.
- O laranja aparece só como detalhe: ponto da etiqueta do capítulo, ✓, um valor de destaque, a etapa final.
- O nome A&M está no topo direito, e Performance e DTS não se repetem no slide de conteúdo.
- Nada passa de y 856, porque o número da página precisa ficar livre.

## Capa e divisória (padrão da capa oficial A&M)

Referência: a capa oficial do time, enviada como imagem. HTML em `examples/capa-divisoria.html`.

| Elemento | Posição (px, em 1600 × 900) | Estilo |
|---|---|---|
| Fundo | tela inteira | Navy `#002B49` liso, sem gradiente |
| Logo | x 68, y 30, 145px de altura | `am-simbolo-am-branco.png` |
| Título | x 62, a partir de y 272, até 940px de largura | Light 44px branco, até 4 linhas |
| Subtítulo | x 62, y ~560 | Light 37px branco, 1 linha |
| Logo do cliente | x 62, y ~665 | **Opcional, removido do modelo.** Se o projeto pedir, entra aqui, branco, com até 64px de altura (veja "Capa de proposta" abaixo) |
| Data | x 62, a 56px do pé | Condensed 22px branco ("Outubro 2026") |
| Linhas | à direita | `capa-linhas.svg` |
| Número da página | canto inferior direito | Condensed 12px branco |

A divisória usa a mesma base, com o sobretítulo do capítulo em Condensed Bold 16px azul-40 e o título único.

### Capa de proposta, com ou sem cliente

- **Sem cliente.** A assinatura Performance · DTS fica em y 670, e a data fica no pé.
- **Com cliente.** O logo do cliente entra branco em x 62, y 665, com até 64px de altura. A assinatura Performance · DTS desce para y 760, e a data fica onde está.
- **Ordem.** O logo do cliente nunca fica acima do título nem maior que o logo da capa A&M.

## Em PowerPoint (16:9, 13,333 × 7,5 in)

O canvas de 1600 × 900 equivale a 120 px por polegada, e 1pt = 1,667px. Insira as logos como imagem (Inserir > Imagens), trave a proporção e informe só a altura.

| Elemento | x (in) | y (in) | Tamanho |
|---|---|---|---|
| **Capa:** logo da capa (`am-simbolo-am-branco.png`) | 0,57 | 0,25 | altura 1,21 in |
| **Capa:** título | 0,52 | 2,27 | caixa de 7,83 in, Light 26pt branco |
| **Capa:** subtítulo | 0,52 | 4,67 | Light 22pt branco |
| **Capa:** Performance · DTS (opcional) | 0,52 | 5,58 | Performance com 0,40 in de altura, DTS com 0,22 in |
| **Capa:** data | 0,52 | 6,85 | Condensed 13pt branco |
| **Capa:** linha grossa | de (8,54; 7,5) a (12,92; 0) | | branca, 4,2pt |
| **Capa:** traço fino | de (7,53; 7,5) a (9,45; 4,06), depois vertical até 7,5 | | `#CCD5DB`, 1,2pt |
| **Conteúdo:** número da seção | 0,67 | 0,20 | círculo navy de 0,33 in, Condensed Bold 13pt branco |
| **Conteúdo:** etiqueta do capítulo | 1,15 | 0,25 | pílula laranja-20 de 0,23 in de altura, 9pt navy |
| **Conteúdo:** nome A&M (`am-nome-navy.png`) | alinhado a 0,67 in da direita | 0,33 | altura 0,14 in |
| **Conteúdo:** action title | 0,67 | 0,75 | Light 28pt navy |
| **Conteúdo:** lede | 0,67 | 1,25 | Condensed 14pt azul, palavra-chave em navy negrito |
| **Conteúdo:** área de painéis | 0,67 a 12,67 | 1,98 a 7,13 | painéis cinza-20 com cantos de 0,07 in |
| **Conteúdo:** número da página | alinhado a 0,67 in da direita | 7,25 | Condensed 8pt navy-80 |
