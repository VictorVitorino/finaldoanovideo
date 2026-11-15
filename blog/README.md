# Change Management World

Blog de notícias sobre Gestão da Mudança (Change Management), de Victor Vitorino: o que está acontecendo no mundo, como a IA entra na gestão da mudança e guias de campo para carve-out, due diligence, transformação e governança de TI.

É um site estático: a pasta `blog/` inteira é o que se publica. Não precisa de servidor nem de banco de dados. Cada post tem endereço próprio e imagem de compartilhamento, para o link abrir com prévia no LinkedIn.

## Como o site está organizado

Quatro destinos no topo: **Radar**, **Laboratório**, **Serviços** e **Sobre**. Em telas menores, o botão Menu abre os mesmos quatro, mais os atalhos (guias de campo, IA & Mudança, agenda e vídeos, posts do mês, modelos, sugestões de leitura) e o contato.

| Página | O que mostra |
|---|---|
| Início (`index.html`) | Abertura "Gestão da mudança, além do raso" com o iceberg interativo; três caminhos (ler, praticar, aplicar); capa da semana com a régua de adoção; galeria com os destaques do radar; ferramentas do Laboratório; convite para os Serviços; quem escreve. |
| Radar (`radar/`) | Todas as reportagens (filtro por tema, busca, grade ou lista), guias de campo, IA em números (cada número leva à reportagem) e agenda e vídeos. |
| Laboratório (`lab/`) | Diagnóstico de nível, três ferramentas para montar no navegador, a galeria de apresentações em HTML (`apresentacoes/`) e a galeria de modelos para baixar (`modelos/`). |
| Apresentações (`apresentacoes/`) | Cinco apresentações de gestão da mudança em HTML, que rodam no navegador como um PowerPoint: visão do programa, comunicação, cultura e engajamento, impactos e kickoff com plano de treinamento. Cada uma é uma página autônoma (`apresentacoes/<id>/`). |
| Serviços (`servicos/`) | Change Management Advisory e IA aplicada: duas frentes, "Quem conduz" (apresentação do autor, com a foto), cinco serviços com ficha completa (para quem, o que inclui, como funciona, acompanhamento, entregas, formato), sintomas e respostas, fluxo do trabalho, acompanhamento antes, durante e depois, jornada de IA aplicada, gráfico de adoção e contato. |
| Sobre (`sobre/`) | Bio, cartão de contato (WhatsApp, LinkedIn e "Salvar contato" em .vcf), quatro pilares e a pilha de livros: cada livro abre uma página de contexto com o resumo em três ideias e a leitura do autor. |

Conteúdo que alimenta essas páginas, em `_src/content/`: `home.json` (abertura, iceberg, trilha, régua), `servicos.json`, `perfil.json`, `estante.json` (livros, com ISBN, pergunta, ideias e leitura), `modelos.json` e os posts em `posts/`. O contato fica em `_src/site.config.json` (`contato`).

### Iceberg da abertura

O cartão tem três regiões: a barra de cima (título, zona atual e profundidade), a cena e os controles (sonda ao lado, botão "Explorar o iceberg" embaixo). Nada fica por cima da ilustração. Os pontos abaixo d'água são numerados; em telas estreitas, os rótulos saem da cena e vão para uma legenda numerada logo abaixo, e cada item leva a câmera até o ponto. Dá para explorar arrastando a cena, pela sonda, pelo botão ou pelo teclado (setas, Page Up, Page Down, Home e End na sonda).

### Efeitos (do guia de design)

`assets/css/jornada.css` e `assets/js/efeitos.js` guardam os componentes de efeito, cada um ligado por um atributo `data-*` e sem dependências: galeria que desliza com inércia, ficha em foco (o painel cresce a partir do cartão), cartões que viram, fluxo BPMN com ficha que percorre o processo, narrativa fixa, gráfico que se constrói, pilha de livros num cartão que vira, capas vivas dos modelos, cartões que inclinam com o cursor, ícones de linha que se desenham na entrada (`_src/lib/vivo.mjs`), brilho holográfico e prévia dos modelos. As partículas da abertura ficam em `motion.js`. Tudo respeita "reduzir movimento", para fora da tela e funciona como texto e listas sem JavaScript.

Tokens do sistema (em `jornada.css`): espaçamento `--e-1` a `--e-6` (8, 16, 24, 32 e 48 px), raios `--r-1` a `--r-4` e três níveis de elevação `--elev-1` a `--elev-3`.

### Prévias e capas

- Prévias reais dos modelos: `python3 blog/_src/previas_modelos.py` converte cada PowerPoint e planilha em imagens das primeiras páginas (`assets/img/modelos/`), conta slides e abas e lê o olho e o título da capa de cada apresentação (`_src/content/modelos-previas.json`). Rode depois de regerar os arquivos. `--so pptx` (ou `xlsx`) refaz só um formato; `--textos` relê slides, abas e capas sem refazer as imagens.
- Capa viva dos modelos (`capaViva` em `_src/lib/lab.mjs`, estilos `.capa-viva` em `jornada.css`): nas apresentações, o site mostra a própria capa do arquivo (olho, título e iceberg, com a mesma geometria de `modelos_pptx_base.py`), animada: fundo que respira, linha d'água que se desenha, gelo que flutua, bolhas, título que entra palavra a palavra e o campo `[nome do projeto]` que se preenche com exemplos (uma vez ao aparecer e em sequência com o cursor em cima). O arquivo baixado traz a mesma capa, estática, com a luz atrás do iceberg em degradê nativo (`FUNDO_CAPA`). Nas planilhas, a capa é clara e traz o motivo do conteúdo, que se constrói. O texto das capas não se move (fica nítido): com o cursor, o que se desloca são as camadas. A entrada acontece na primeira vez que a capa aparece (`.viu`), os laços só rodam com a capa na tela (`.na-tela`) e, sem JavaScript ou com "reduzir movimento", a capa fica parada.
- Capas dos livros: `python3 blog/_src/capas_livros.py` baixa as capas pelo ISBN (Google Books; Open Library como reserva) para `assets/img/livros/`.
- Foto do autor: `python3 blog/_src/foto_perfil.py <arquivo>` corrige a orientação, recorta um quadrado com o rosto no centro, grava em `assets/img/victor-vitorino.jpg` (720 × 720) e tira os metadados da câmera. Com `--circulo`, aceita um print em que a foto aparece dentro de um círculo (o visualizador de foto do LinkedIn, por exemplo) e recorta só o círculo. O site sempre mostra a foto em círculo: em Serviços (cartão "Quem conduz" e bloco de contato), em Sobre (sobre a cena do iceberg, no cartão de contato) e na página inicial ("Quem escreve"). Sem o arquivo, "Quem conduz" usa a mesma moldura com o iceberg da marca.

## Laboratório (área interativa)

Fica em `lab/` e tem cinco páginas. Tudo roda no navegador de quem acessa; nada é enviado nem guardado pelo blog.

| Página | O que faz |
|---|---|
| `lab/diagnostico/` | Diagnóstico de nível em Change Management: 30 perguntas em 6 domínios (modo completo) ou 12 sorteadas (modo rápido). Gera relatório com nível, radar por domínio, o que estudar, desafios do dia a dia, plano de 30 dias e gabarito comentado. O relatório pode ser salvo em PDF. |
| `lab/matriz-raci/` | Monta a matriz RACI (ou RASCI) com conferência automática de A e R e carga por papel. Exporta CSV e PDF. |
| `lab/mapa-de-influencia/` | Stakeholders arrastáveis em influência x apoio, com estratégia por quadrante. Exporta imagem e CSV. |
| `lab/matriz-de-adocao/` | Pessoas por área na régua de adoção, com índice, gráfico e ação prioritária. Exporta imagem, CSV e PDF. |
| `lab/` | Entrada do Laboratório e os modelos em Excel (`assets/modelos/*.xlsx`). |

- Perguntas: `blog/_src/content/diagnostico/<dominio>.json` (enunciado, 4 alternativas, índice da correta, explicação, referência e tema de estudo). Cada pergunta foi escrita por um autor e resolvida às cegas por dois examinadores independentes antes de entrar.
- Textos do relatório (níveis, o que estudar, leituras do blog): `blog/_src/content/diagnostico-relatorio.json`.
- Modelos em Excel: `python3 blog/_src/modelos_xlsx.py` gera os três arquivos de novo.
- Lógica das ferramentas: `blog/assets/js/lab.js`. Páginas: `blog/_src/lib/lab.mjs`.

## Apresentações em HTML

Slides que as pessoas usam direto no navegador, sem instalar nada. Cada apresentação é uma página autônoma: o motor (`assets/css/deck.css` e `assets/js/deck.js`) vai embutido no HTML na geração, então a página pode ser salva ou baixada como um arquivo único.

- Conteúdo: um arquivo por apresentação em `_src/content/apresentacoes/<id>.json` (nome, olho, frase, para quem, duração e a lista de slides). A ordem fica em `DECKS`, no `build.mjs`.
- Tipos de slide (`_src/lib/apresenta.mjs`): `capa`, `secao`, `mensagem`, `cartoes` (com ícone, número ou valor em destaque), `depara`, `tabela` (uma célula `@2 Em curso` vira etiqueta de situação), `linha` (linha do tempo), `agenda`, `matriz` (mapa de calor), `barras`, `escada`, `lista` e `fecho`. Todo slide aceita `notas` (para quem apresenta) e `"etapas": false` desliga a revelação por clique.
- No texto, `*ênfase*` vira itálico e `{projeto}`, `{area}`, `{data}` e `{quem}` viram campos: a pessoa preenche uma vez em "Personalizar" e vale para todos os slides (`{Projeto}`, com maiúscula, começa o texto de espera em maiúscula).
- Escala: o slide é uma caixa 16:9 e tudo dentro dele é medido em `em`; o tamanho base é 1,45% da largura do slide (`1.45cqw`). Por isso o mesmo slide serve em tela cheia, na grade de miniaturas e na impressão, sem JavaScript para escalar.
- Modos: apresentar (um slide por vez, com etapas), leitura (todos em coluna; até 1000 px de largura o slide deixa de ser 16:9 e o conteúdo reflui, para ler no celular) e grade (miniaturas). Telas largas abrem apresentando; estreitas, em leitura. `?modo=leitura` força a leitura.
- O que a pessoa faz na tela: editar qualquer texto (fica salvo no navegador dela, por apresentação e por versão do conteúdo), mudar o início e as durações da agenda (os horários se recalculam), clicar nas células do mapa de calor para mudar o grau, trocar os números das barras (largura e situação acompanham), marcar o item da agenda em andamento (num intervalo, o cronômetro começa), ver as notas, salvar em PDF (uma página por slide) e baixar uma cópia autônoma com as fontes embutidas, que abre sem internet.
- Atalhos: setas, espaço, Home e End; `F` tela cheia, `G` grade, `N` notas, `E` editar, `P` personalizar, `T` cronômetro, `L` leitura, `A` apresentar, `?` lista de atalhos.
- Sem JavaScript, a página mostra todos os slides abertos, em coluna. Com "reduzir movimento", nada se anima.
- Capas e divisórias usam o mesmo iceberg e a mesma luz de fundo dos arquivos em PowerPoint.
- Imagens de compartilhamento: `node blog/_src/og.mjs apresentacoes apresentacao-<id>`.

Para criar uma apresentação nova: copie um dos arquivos de `_src/content/apresentacoes/`, mude `id`, textos e slides, acrescente o `id` em `DECKS` e rode o build. Mantenha os títulos em até duas linhas e confira se nenhum slide passa do rodapé.

## Modelos para baixar e painel de downloads

- `modelos/`: quinze artefatos, todos nativos e editáveis. Em PowerPoint (seis decks, 64 slides): kit de slides de gestão da mudança, apresentação de kickoff, relatório executivo de adoção, workshop com patrocinadores, slides das matrizes da mudança e painel de indicadores. Em Excel (nove planilhas, com as abas Como usar, preenchimento e Painel): painel de indicadores com os cálculos, avaliação ADKAR, lista de impactos, matriz de adoção, formulário de diagnóstico, mapa de riscos, plano de treinamentos, matriz RACI e mapa de influência. No site, cada cartão tem uma capa viva e o botão "Ver prévia", que mostra as primeiras páginas reais do arquivo antes do formulário. Para baixar, a pessoa informa nome e e-mail uma vez e concorda com o registro; os downloads seguintes são em um clique.
- `painel/`: área restrita do autor, com total de downloads, e-mails diferentes, downloads por modelo, por e-mail e o registro completo, com filtro e exportação em CSV.
- O registro fica no Supabase. A estrutura está em `blog/_src/supabase/001_downloads.sql`: quem visita só consegue inserir; ler exige login e o e-mail estar na tabela `painel_admins`.
- Para ligar: preencha `downloads.supabase_url` e `downloads.supabase_chave` (chave publicável) em `blog/_src/site.config.json` e gere o site. Sem isso, os arquivos baixam, mas nada é registrado.
- Limite conhecido: os arquivos são públicos em `assets/modelos/`. O cadastro registra quem baixa pelo site, mas não impede quem tiver o endereço direto do arquivo.
- Catálogo dos modelos: `blog/_src/content/modelos.json`.
- Planilhas: `python3 blog/_src/modelos_xlsx.py` gera as nove (estilo comum em `modelos_xlsx_estilo.py`).
- Slides: `python3 blog/_src/modelos_pptx.py` (kit), `modelos_pptx_extra.py` (kickoff, relatório e workshop), `modelos_pptx_matrizes.py` e `modelos_pptx_indicadores.py`; o tema e os componentes ficam em `modelos_pptx_base.py`. Os exemplos dos decks repetem os das planilhas (bloco `EX_` em `modelos_pptx_base.py`).
- Depois de regerar os arquivos, rode `python3 blog/_src/previas_modelos.py` e gere o site de novo.
- Conferência feita só no LibreOffice: vale abrir cada arquivo uma vez no PowerPoint e no Excel.
- Sugestões de leitura da página inicial: `blog/_src/content/estante.json`.
- Banco em uso: projeto Supabase `change-management-world`. O usuário do painel é criado em Authentication, no Supabase.

## Como publicar um post novo

1. Crie um arquivo em `blog/_src/content/posts/`, por exemplo `meu-post.md`:

   ```
   ---
   titulo: Título do post
   data: 2026-11-21
   tipo: reportagem
   tema: ia
   olho: IA no trabalho
   resumo: Duas frases que aparecem no cartão e na prévia do LinkedIn.
   regiao: Global
   fonte_nome: Nome da fonte
   fonte_url: https://endereco-da-fonte
   fonte_data: 2026-11-18
   por_que_importa: O que quem faz gestão da mudança deve fazer com isso.
   dados:
     - 37% | das organizações investem em gestão da mudança ao implantar IA
   ---
   Texto do post em Markdown: parágrafos, ## subtítulos, listas com - e 1., **negrito**, [links](https://...) e > citações.
   ```

   - `tipo`: `reportagem`, `guia` ou `capa`.
   - `tema`: `ia`, `mundo`, `transformacao`, `carve-out`, `due-diligence`, `governanca-ti`, `adocao` ou `brasil`.
   - Em guia, use `passos:` (lista) para o resumo em tópicos.

2. Gere o site e as imagens de compartilhamento:

   ```bash
   node blog/_src/build.mjs     # páginas
   node blog/_src/og.mjs        # imagens do LinkedIn (assets/img/og)
   ```

3. Faça commit e publique.

## Trocar a capa da semana e os destaques

- Capa e número da edição: `blog/_src/site.config.json`, em `edicao` (`capa` é o nome do arquivo do post, sem `.md`).
- Destaques ao lado da capa, números da seção de IA e a lista "Na prática": `blog/_src/content/home.json`.
- Perfil (bio, o que gosto, fun fact): `blog/_src/content/perfil.json`.
- Eventos e vídeos: `blog/_src/content/eventos.json` e `videos.json`.
- Nome do blog, endereço público (`url`) e LinkedIn (`linkedin`): `blog/_src/site.config.json`. Com o `url` preenchido, o site gera `sitemap.xml` e os endereços absolutos que o LinkedIn usa na prévia.

## Como as reportagens são apuradas

Regra da casa: só entra o que foi lido na fonte.

- `blog/_src/tools/ler.mjs <url>` lê uma página ou PDF público e mostra título, datas e texto, para conferir cada número na origem. Sites que recusam robôs não são contornados: a informação é buscada em outra página oficial.
- A apuração verificada fica em `blog/_src/pesquisa/*.json`, com a frase de checagem de cada item. `node blog/_src/importa.mjs AAAA-MM-DD` transforma esses arquivos em posts.
- Cada post mostra a fonte, a data de publicação da fonte e o tipo de conferência ("lida na fonte" ou "confirmada por busca").
- Os guias de campo são opinião do autor e não citam estatísticas.

## Estrutura

```
blog/
  index.html, posts/<slug>/, mes/<aaaa-mm>/, 404.html   páginas geradas (não edite à mão)
  assets/css, js, fonts, img, video                      estilo, comportamento, fontes e mídia
  _src/
    site.config.json     nome, edição, endereço, LinkedIn
    content/             posts (.md), home.json (destaques, números, chamada da abertura, iceberg e régua), perfil.json, eventos.json, videos.json, estante.json
    pesquisa/            apuração verificada (JSON)
    lib/                 modelos de página, ilustrações e utilitários
    build.mjs            gera as páginas
    og.mjs               gera as imagens de compartilhamento
    importa.mjs          apuração -> posts
    tools/               leitor de fontes e ferramentas de conferência visual
```

## Visual

- Cores: azul profundo `#0A2463`, azul vivo `#2F6FED` e cinza `#667085`, com tons claros derivados.
- Tipos: Newsreader (títulos) e Inter (texto), servidos do próprio site (licença SIL Open Font).
- Ilustrações: SVG em traço fino, geradas por `lib/ilustra.mjs` (uma por tema).
- Marca: um círculo com a linha d'água e um iceberg (o mundo visto abaixo da superfície).
- Animação: entradas suaves ao rolar, traços que se desenham, números que contam, ondas e bolhas na cena do iceberg. Quem pede menos movimento no sistema (`prefers-reduced-motion`) vê tudo parado.

## Ver no computador

```bash
cd blog && python3 -m http.server 8765
# abra http://127.0.0.1:8765
```

## Camada de motion

`assets/css/motion.css` e `assets/js/motion.js` entram em todas as páginas e são só enfeite: vinheta de abertura na página inicial (uma vez por visita), formas em movimento na abertura (canvas que reage ao ponteiro), grifo desenhado e letras em onda no título, palavras dos títulos de seção que sobem de trás de uma máscara, capas que entram em cortina, cartões com inclinação 3D e brilho, formas que acompanham a rolagem, barra de progresso e transição entre páginas. Com "reduzir movimento" ligado no sistema, tudo isso fica desligado.

## Conceito: além do raso

O blog mostra o que fica abaixo da superfície da gestão da mudança. A abertura traduz isso em um iceberg: a ponta é o que todo mundo vê (comunicado, treinamento, go-live) e a massa submersa é o que decide a mudança. Tudo é editável em `_src/content/home.json`:

- `abertura`: as linhas do título (o trecho entre asteriscos vira o destaque) e o texto de apoio.
- `iceberg.superficie`: as etiquetas da ponta. `iceberg.fundo`: os pontos abaixo d'água, cada um com rótulo, `slug` da reportagem que abre e posição (`x` de 0 a 560, `y` de 300 a 1290, medidas do desenho). `iceberg.zonas`: os nomes mostrados conforme a profundidade.
- `regua`: as cinco marcas da régua de adoção, com o estado e a ação de cada uma (textos da matéria de capa).

O lema ("Gestão da mudança além do raso") e a descrição do site ficam em `_src/site.config.json`.

## Camada de interação

`assets/css/ux.css`, `assets/js/ux.js` e `assets/js/mergulho.js` (só na página inicial) cuidam do acabamento em vidro e de tudo o que se arrasta e clica. `assets/js/dados.js` é gerado pelo build com a lista de posts, ferramentas e modelos.

| Recurso | Como funciona |
|---|---|
| Menu | Cápsula de vidro no topo, com seis seções, busca, lista de salvos e o botão Menu, que abre o menu completo em tela cheia. |
| Busca do site | Ícone da lupa, `Ctrl K` ou `/`. Procura em reportagens, guias, ferramentas, modelos e seções, sem depender de acentos. |
| Leitura rápida | O olho no cartão (ou um ponto do iceberg) abre a matéria em uma folha lateral, sem sair da página; no celular, a folha sobe de baixo. Setas trocam de matéria e o endereço ganha `#ler/<slug>`, que pode ser compartilhado. |
| Para ler depois | O marcador guarda a matéria em uma lista que fica só no aparelho da pessoa (`localStorage`). O painel também mostra quantas publicações ela já leu. |
| Barra de leitura (posts) | Progresso e tempo que falta, tamanho do texto, ouvir em voz alta (voz do próprio aparelho), modo foco, guardar e buscar. Guias com três ou mais partes ganham sumário. Selecionar um trecho oferece copiar como citação, com o link. |
| Profundímetro | Em telas largas, um mapa das seções da página inicial na lateral direita. |

Nada disso envia dados para fora: salvos, lidos e preferências ficam no navegador de quem lê. Sem JavaScript, o site continua legível: a régua vira lista, a cena do iceberg rola por conta própria e os livros mostram frente e verso.

