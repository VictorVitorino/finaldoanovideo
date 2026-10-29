---
name: alvarez-marsal-design-system
description: Design system da Alvarez & Marsal com as logos oficiais de Alvarez & Marsal, Performance e DTS, paleta navy/cinza/azul/laranja, tipografia Arial Nova, padrão de capa e de slide de conteúdo e componentes. Use para criar ou revisar slides, documentos, relatórios, dashboards, posts, páginas e qualquer material visual no padrão A&M.
---

# Alvarez & Marsal — Design System

Use este sistema sempre que produzir algo visual no padrão A&M: apresentações (PowerPoint/Slides), documentos (Word/PDF), dashboards, gráficos, páginas HTML e interfaces.

## Regra-mãe

**O navy carrega a marca, o cinza dá estrutura, o azul apoia e o laranja é só detalhe.**
Proporção aproximada por página/slide: navy ~45% · cinza ~40% · azul ~10% · laranja ~5%.

## Cores principais (hex exatos)

| Cor | Token | 100 | 80 | 40 | 20 |
|---|---|---|---|---|---|
| Navy | `navy-*` | `#002B49` | `#33556D` | `#99AAB6` | `#CCD5DB` |
| Laranja | `orange-*` | `#F78C16` | `#F9A345` | `#FCD1A2` | `#FDE8D0` |
| Cinza | `gray-*` | `#CDD5DB` | `#D7DDE2` | `#EBEEF1` | `#F5F7F8` |
| Azul | `blue-*` | `#5E8AB4` | `#7EA1C3` | `#BFD0E1` | `#DFE8F0` |

Mensagens: positiva `#9ACC3C` · atenção `#F9C20A` · negativa `#CF3D3D` (sempre como preenchimento com rótulo; positiva/atenção com texto navy, negativa com texto branco).

## Regras inegociáveis

1. Laranja **somente para detalhes**: fio sob o título, marcador, a única barra/ponto de destaque de um gráfico. Nunca fundo de seção, nunca botão, **nunca texto sobre branco** (contraste 2,4:1). As únicas exceções estão listadas em `references/layout-slide.md`.
2. Texto principal em navy `#002B49` sobre branco (14,5:1); texto secundário em navy-80 `#33556D`.
3. Cantos retos, sem sombras e sem gradientes. A separação é feita com cor e fio de 1px (`#CDD5DB`).
4. Gráficos: série principal navy, depois azul `#5E8AB4` e navy-40 `#99AAB6`; laranja em um único ponto que conta a história. Rotule direto na série e coloque a fonte do dado em 9pt abaixo.
5. Títulos afirmam a conclusão (action title): "Capital de giro libera R$ 42 mi em 90 dias", e não "Análise de capital de giro".

## Tipografia

Títulos em **Arial Nova Light**, subtítulos em **Arial Nova Condensed Bold** e texto em **Arial Nova Condensed Regular**.

| Uso | Título | Subtítulo | Texto |
|---|---|---|---|
| Capa / divisória | 35pt | 20pt | 20pt |
| Slide | 27pt | 16pt | 16pt |
| Seção | 22pt | 16pt | 16pt |
| Cartão / gráfico | 16pt | 12pt | 12pt |
| Nota / rodapé | 12pt | 9pt | 9pt |

Fallback quando a Arial Nova não estiver disponível: Arial (títulos) e Arial Narrow ou Roboto Condensed (subtítulos e texto). Títulos nunca vão em negrito.

**Esta tabela vale para documentos e telas genéricas.** Em capa, divisória, slide de conteúdo e post, as medidas de `references/layout-slide.md` e `references/layout-social.md` prevalecem, porque foram medidas nos modelos oficiais do time. Conversão: no slide de 13,333 × 7,5 in (canvas HTML de 1600 × 900), 1pt = 1,667px. Em texto corrido na web, 1pt ≈ 1,333px.

## Como aplicar por formato

- **PowerPoint / Slides (16:9, 13,333 × 7,5 in):**
  - **Capa e divisória.** Navy liso, sem fio laranja. Logo da capa no alto à esquerda, título Light branco de 26pt e subtítulo Light de 22pt. As linhas brancas ficam à direita.
  - **Slide de conteúdo.** Fundo branco e margens laterais de 0,67 in. Um action title em Light 28pt, seguido do lede Condensed 14pt azul com a palavra-chave em navy negrito.
  - **Medidas.** Posições exatas em polegadas em `references/layout-slide.md`.
- **Word / PDF:** título de seção 22pt Light navy, corpo 12pt Cond Regular, tabelas no padrão de `components/guidelines/DataTable.md`.
- **HTML / web:** importe `tokens/tokens.css`, `components/am-components.css` e `components/am-slide.css`. Use as classes `am-*` e as classes de estilo de texto (`.title-lg`, `.body-sm`…). Para o tema escuro, use `data-theme="navy"`.
- **Post de LinkedIn e redes:** 1080 × 1350 (4:5). Medidas em `references/layout-social.md`, modelo em `examples/post-linkedin.html`. Exporte o HTML para PNG ou PDF com o Chromium (Playwright).
- **Excel / gráficos:** use as cores de dados na ordem navy → azul → navy-40, e laranja só para o destaque.

## Logos (Alvarez & Marsal, Performance, DTS)

Os arquivos oficiais estão em `assets/logos/`, com uma versão para fundo claro (`-cor` ou `-navy`) e outra para navy (`-branco`). **Leia `references/logos.md` antes de colocar qualquer marca.**

- **Ordem de assinatura.** Alvarez & Marsal, depois Performance, depois DTS.
- **Capa.** Use `am-simbolo-am-branco.png`, o símbolo com "A&M" empilhado, no alto à esquerda.
- **Slide de conteúdo.** Leva só `am-nome-navy.png` no topo direito.
- **Lockup Performance.** Já contém o símbolo A&M: não coloque o símbolo de novo ao lado dele.
- **Nunca recrie a marca** em texto, SVG ou código, nem escreva "PERFORMANCE" ou "DTS" em texto no lugar do logo. Insira sempre os arquivos de `assets/logos/`. Em HTML, use `<img>`. No PowerPoint e no Word, use Inserir > Imagens > Este dispositivo. No python-pptx, use `slide.shapes.add_picture(caminho, x, y, height=Inches(h))`. Trave a proporção e informe só a altura.
- **Mesma altura de caixa-alta.** Lado a lado, as três marcas ficam com a mesma altura de letra. O DTS nunca fica maior que o Performance.

## Padrões de página

- **Capa e divisória.** Seguem a capa oficial: navy liso, logo no alto à esquerda, título e subtítulo em Light branco, data no pé e as linhas brancas à direita (`assets/grafismos/capa-linhas.svg`). O modelo não traz logo de cliente.
- **Post.** Veja `references/layout-social.md`.
- **Slide de conteúdo.** Topo com número da seção, etiqueta do capítulo e nome A&M. Depois vêm action title, lede azul com a palavra-chave em navy, painéis cinza-20 e etapas numeradas.
- **Medidas e exceções.** Estão em `references/layout-slide.md`. O padrão usa cantos de 8px nos painéis, número de destaque em laranja só em métricas de 40px ou mais, e laranja escuro `#C26907` na etiqueta de risco ALTO.

## Arquivos

- `references/brand-book.md`: o brand book completo (princípios, combinações aprovadas, contraste, voz). **Leia antes de qualquer peça nova.**
- `references/logos.md`: versões, hierarquia, tamanho mínimo, área de proteção e o que não fazer com as três marcas.
- `references/layout-slide.md`: medidas da capa, da divisória e do slide de conteúdo, mais o checklist de entrega.
- `references/img/`: as referências do time (slide de conteúdo e faixa de topo).
- `assets/logos/alvarez-marsal/`, `assets/logos/performance/`, `assets/logos/dts/`: as logos.
- `assets/grafismos/`: `capa-linhas.svg` (capa oficial) e `diagonais.png` (peças DTS).
- `tokens/tokens.json` e `tokens/tokens.css`: todos os tokens, inclusive `orange-dark`, `line-soft` e `radius-md` do padrão de slide.
- `components/am-components.css`: Botão, Badge, Alerta, Cartão KPI, Tabela de dados e Cabeçalho de seção.
- `components/am-slide.css`: logos e assinatura, faixa de topo, capa, divisória, slide de conteúdo, painel, matriz, etiqueta de risco, chevrons, métricas e etapas.
- `components/guidelines/*.md`: quando e como usar cada componente, inclusive `Logo.md` e `SlideLayout.md`.
- `examples/showcase.html`: vitrine dos componentes básicos.
- `examples/logos.html`: folha com todas as logos sobre fundo claro e navy.
- `examples/capa-divisoria.html`: capa oficial, capa com Performance · DTS, divisória e faixa de topo.
- `examples/slide-padrao.html`: o slide de conteúdo completo, pronto para trocar o texto.
- `references/layout-social.md` e `examples/post-linkedin.html`: post de LinkedIn em 1080 × 1350.

Para HTML, carregue `tokens/tokens.css`, depois `components/am-components.css` e `components/am-slide.css`. Sem Arial Nova, os exemplos usam Roboto Condensed (Google Fonts) como reserva condensada.
