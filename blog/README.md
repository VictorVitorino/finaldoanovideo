# Change Management World

Blog de notícias sobre Gestão da Mudança (Change Management), de Victor Vitorino: o que está acontecendo no mundo, como a IA entra na gestão da mudança e guias de campo para carve-out, due diligence, transformação e governança de TI.

É um site estático: a pasta `blog/` inteira é o que se publica. Não precisa de servidor nem de banco de dados. Cada post tem endereço próprio e imagem de compartilhamento, para o link abrir com prévia no LinkedIn.

## O que tem na página inicial

| Bloco | O que mostra |
|---|---|
| Abertura | Nome do blog, edição, globo animado com os temas e a faixa "Radar" com as manchetes. |
| Capa da semana | A reportagem principal (com vídeo, se houver) e três destaques da edição. |
| Temas | Atalhos que filtram o radar por tema. |
| Radar mundial | Todas as reportagens, com filtro por tema e busca. Cada uma cita e linka a fonte. |
| IA & Mudança | Números das pesquisas e reportagens sobre uso de IA na prática. |
| Guias de campo | Como fazer Change Management em carve-out, due diligence, transformação e governança de TI. |
| Laboratório | Diagnóstico de nível e ferramentas interativas (RACI, mapa de influência, matriz de adoção). |
| Vídeos | O vídeo do blog e uma seleção externa. |
| Eventos | Agenda (estrutura pronta; cresce a cada edição). |
| Posts do mês | Lista enxuta do que saiu, por mês, com página própria em `mes/AAAA-MM/`. |
| Quem escreve | Perfil, o que gosto e fun fact. |

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

## Modelos para baixar e painel de downloads

- `modelos/`: seis modelos em Excel (mapa de adoção, formulário de diagnóstico, mapa de riscos, plano editorial de treinamentos, matriz RACI e mapa de influência). Para baixar, a pessoa informa nome e e-mail uma vez e concorda com o registro; os downloads seguintes são em um clique.
- `painel/`: área restrita do autor, com total de downloads, e-mails diferentes, downloads por modelo, por e-mail e o registro completo, com filtro e exportação em CSV.
- O registro fica no Supabase. A estrutura está em `blog/_src/supabase/001_downloads.sql`: quem visita só consegue inserir; ler exige login e o e-mail estar na tabela `painel_admins`.
- Para ligar: preencha `downloads.supabase_url` e `downloads.supabase_chave` (chave publicável) em `blog/_src/site.config.json` e gere o site. Sem isso, os arquivos baixam, mas nada é registrado.
- Limite conhecido: os arquivos `.xlsx` são públicos em `assets/modelos/`. O cadastro registra quem baixa pelo site, mas não impede quem tiver o endereço direto do arquivo.
- Catálogo dos modelos: `blog/_src/content/modelos.json`. Planilhas: `python3 blog/_src/modelos_xlsx.py`.

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
    content/             posts (.md), home.json, perfil.json, eventos.json, videos.json
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
- Animação: entradas suaves ao rolar, traços que se desenham, números que contam e globo em rotação. Quem pede menos movimento no sistema (`prefers-reduced-motion`) vê tudo parado.

## Ver no computador

```bash
cd blog && python3 -m http.server 8765
# abra http://127.0.0.1:8765
```
