# Alvarez & Marsal

Leadership. Action. Results. — um sistema sóbrio, navy-first, em que a cor organiza e o laranja aponta.

Este design system traduz a paleta e a tipografia institucionais da Alvarez & Marsal em tokens, regras e componentes para apresentações, relatórios, dashboards e interfaces. A regra-mãe: **o navy carrega a marca, o cinza dá estrutura, o azul apoia e o laranja é só detalhe.**

## Princípios

| Princípio | Na prática |
|---|---|
| **Clareza executiva** | Um título que afirma a conclusão (action title), um dado que a prova. `title-lg` + `subtitle-lg` + `body-lg`. |
| **Disciplina de cor** | Navy domina; o laranja (`accent`) aparece uma vez por bloco, nunca como área. |
| **Estrutura sem ruído** | Cantos retos (`radius-none`), fios finos (`line`, `stroke-hairline`), sem sombras (`shadow-none`). |
| **Dado em primeiro plano** | Séries em navy e azuis (`data-1…3`); o laranja (`data-highlight`) marca apenas o ponto que conta a história. |

## Cor

### Principais e proporção

Quatro cores principais, sempre nesta ordem de peso:

| Cor | Token | Hex | Peso aproximado |
|---|---|---|---|
| Navy | `navy-100` | `#002B49` | ~45% — fundos de capa, títulos, série principal |
| Cinza | `gray-100` | `#CDD5DB` | ~40% — fios, fundos de apoio, estrutura |
| Azul | `blue-100` | `#5E8AB4` | ~10% — apoio em gráficos e ícones |
| Laranja | `orange-100` | `#F78C16` | ~5% — **somente detalhes** |

> O laranja é usado apenas para os detalhes: um fio sob o título, um marcador, a barra que merece atenção. Nunca para blocos grandes, fundos de seção ou texto sobre branco.

### Variações

Cada cor principal tem quatro passos — 100, 80, 40 e 20 — já nomeados no token (`navy-80`, `orange-40`, `blue-20`…). Use os passos 40 e 20 como fundos com texto navy; os passos 100 e 80 como figura.

### Mensagens

| Significado | Token | Uso |
|---|---|---|
| Positiva | `signal-positive` `#9ACC3C` | Preenchimento com texto navy |
| Atenção | `signal-attention` `#F9C20A` | Preenchimento com texto navy |
| Negativa | `signal-negative` `#CF3D3D` | Preenchimento com texto branco |

Cores de mensagem significam estado — nunca decoração. Sempre acompanhe com rótulo ou ícone (não dependa só da cor).

### Combinações aprovadas

| Figura / fundo | Quando |
|---|---|
| Navy + cinza 20/40 | Padrão de documentos e slides |
| Navy + laranja (detalhe) | Capas, divisórias, destaque de KPI |
| Navy-80 + navy-40 | Gráficos monocromáticos |
| Laranja-40 + navy | Linha/célula selecionada |
| Azul + azul-20 | Notas informativas |
| Cinza-20 + navy | Quadros de apoio e boxes de fonte |

### Contraste (verificado)

- Navy sobre branco 14:1 · navy-80 sobre branco 7.9:1 · branco sobre navy 14:1 · laranja sobre navy 6:1.
- **Laranja sobre branco 2.4:1 — reprovado para texto e ícones.** Use-o como fio/forma ao lado de texto navy.
- Azul sobre branco 3.6:1 — apenas texto 24px+ ou ícones.

## Tipografia

Duas famílias da mesma superfamília: **Arial Nova Light** para títulos (voz calma, autoritária) e **Arial Nova Condensed** (Bold para subtítulos, Regular para texto) — densa, ótima para tabelas e slides carregados.

| Nível | Título (Light) | Subtítulo (Cond. Bold) | Texto (Cond. Regular) |
|---|---|---|---|
| Capa | 35pt `title-xl` | 20pt `subtitle-xl` | 20pt `body-xl` |
| Slide | 27pt `title-lg` | 16pt `subtitle-lg` | 16pt `body-lg` |
| Seção | 22pt `title-md` | 16pt `subtitle-lg` | 16pt `body-lg` |
| Cartão | 16pt `title-sm` | 12pt `subtitle-sm` | 12pt `body-sm` |
| Nota | 12pt `title-xs` | 9pt `subtitle-xs` | 9pt `body-xs` |

Os tamanhos de origem são em pontos (Office/PowerPoint); os tokens trazem o equivalente em px para web (1pt ≈ 1,333px). Títulos em Light nunca em negrito; ênfase vai para o subtítulo condensado.

**Fontes:** Arial Nova é distribuída com o Microsoft 365 e não acompanha este sistema como arquivo. As pilhas de fallback (`--font-light`, `--font-cond`) caem para Arial e Arial Narrow / Roboto Condensed.

## Espaço, forma e linha

- Grade de 4px: `space-1` (4) a `space-16` (64). Margem de slide `space-12`.
- Cantos retos por padrão (`radius-none`); `radius-sm` só em controles; `radius-md` (8px) só em painéis e cartões do slide de conteúdo (ver `references/layout-slide.md`).
- Separação por cor e fio (`line`, 1px). O fio de destaque (`stroke-accent`, 4px, `accent`) marca título ou KPI — um por bloco.

## Visualização de dados

1. Série principal `data-1` (navy), comparativos `data-2` e `data-3`.
2. Um único `data-highlight` laranja para o insight.
3. Sem 3D, sem gradientes, sem legendas distantes — rotule direto na série.
4. Fonte do dado em `body-xs`, `ink-muted`, abaixo do gráfico.

## Voz e conteúdo

- Títulos afirmam conclusões: "Capital de giro libera R$ 42 mi em 90 dias", não "Análise de capital de giro".
- Frases curtas, verbos de ação, números com unidade e período.
- Português formal, sem jargão vazio; siglas explicadas na primeira menção.

## Iconografia e logo

As logos oficiais de Alvarez & Marsal, Performance e DTS estão em `assets/logos/`. As regras de uso ficam em `references/logos.md`. Use sempre esses arquivos; nunca recrie a marca. Ícones: traço simples 1.5px, em `ink` ou `blue-100`, nunca em laranja sobre branco.

## Componentes

Componentes em CSS puro (`components/am-components.css` e `components/am-slide.css`, prefixo `am-`), sem dependências: Botão, Badge de status, Alerta, Cartão KPI, Tabela de dados e Cabeçalho de seção. Cada um usa apenas tokens; no tema Navy (`data-theme="navy"`) se adaptam sozinhos.
