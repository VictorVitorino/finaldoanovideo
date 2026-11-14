# Direção do vídeo "Mapa de Perfil Cognitivo · Mapa de Adoção" · versão 16:9

Post de LinkedIn sobre Gestão da Mudança. Motion graphics **limpo e sofisticado**, feito em SVG quadro a quadro: **poucos elementos, poucos efeitos, um foco por vez**. **Sem logo e sem logotipo de empresa: só as cores da paleta e a marca pessoal "Victor Vitorino · Consultor de Change Management" (só na imagem, nunca na fala). Sem personagens e nada infantil.** Formato **1920 × 1080 (16:9)**, 30 fps, 88,0 s, narrado em pt-BR (ElevenLabs, voz Doug). O vídeo toca **mudo** no feed: a tela precisa contar a história sozinha, com legenda.

## A história

Duas pessoas recebem a mesma ferramenta e o mesmo treinamento. Uma adota, a outra volta para a planilha. Não é má vontade, é perfil: como cada pessoa percebe, avalia e decide. O **Mapa de Perfil Cognitivo** lê cinco sinais em cada pessoa, mostra onde ela está **hoje** na **régua de adoção** e, juntando as posições área por área, forma o **Mapa de Adoção** do projeto. Com ele, a Gestão da Mudança deixa de ser receita única: cada marca da régua pede uma ação. E o mapa precisa estar **vivo**: posição é momento, não rótulo; a cada onda do projeto mede-se de novo e ajusta-se o plano, antes e depois do go-live.

## Narração e cenas (tempos em `tempos.json`)

| Cena (`id`) | Início–fim (s) | Fundo | Fala |
|---|---|---|---|
| `gancho` | 0,00–9,66 | claro | Duas pessoas. A mesma ferramenta. O mesmo treinamento. Uma delas adota. A outra volta para a planilha. |
| `porque` | 9,66–16,41 | claro | Não é má vontade. É perfil: como cada pessoa percebe, avalia e decide. |
| `titulo` | 16,41–20,40 | navy | Por isso existe o Mapa de Perfil Cognitivo. |
| `perfil` | 20,40–32,28 | claro | Em cada pessoa, mapeamos cinco sinais: clareza do porquê, fluência digital, autonomia para aprender, segurança para errar, e o valor que ela vê na mudança. |
| `regua` | 32,28–41,92 | claro | Esses sinais mostram onde ela está hoje na régua de adoção: resiste, observa, experimenta, adota, ou multiplica. |
| `mapa` | 41,92–47,18 | claro | Junte as posições, área por área, e nasce o Mapa de Adoção. |
| `acoes` | 47,18–57,95 | navy | Com ele, a Gestão da Mudança deixa de ser receita única. Escuta para quem resiste. Prática para quem experimenta. Palco para quem multiplica. |
| `vivo` | 57,95–72,46 | navy | Mas o mapa precisa estar vivo. Posição é momento, não rótulo: pessoas avançam, travam, recuam. A cada onda, medimos de novo e ajustamos o plano, antes e depois do go-live. |
| `pergunta` | 72,46–76,48 | navy | No seu projeto, você sabe onde cada pessoa está hoje? |
| `fecho` | 76,48–88,00 | navy | Adoção não se impõe. Se constrói. Pessoa por pessoa. Gestão da Mudança. |

`tempos.json` traz `cenas` (início de cada cena), `palavras` (cada palavra com início `a` e fim `b`), `marcas` (nome → `{ i, a, b }` da palavra que dispara um evento) e `sfx` (efeitos sonoros já mixados, poucos e baixos: pop, whoosh, sino, impacto). **Sincronize a animação com as marcas**: o que a fala nomeia acende na tela no instante da palavra (pode antecipar 0,05–0,15 s). Marcas disponíveis: `duas, ferramenta, treinamento, adota, outra, planilha, ma_vontade, perfil, percebe, avalia, decide, por_isso, mapa_perfil, cognitivo, cada_pessoa, cinco, sinal1..sinal5, mudanca, esses_sinais, hoje, regua, nivel1..nivel5, junte, area, nasce, mapa_adocao, com_ele, receita, escuta, pratica, palco, vivo, momento, rotulo, avancam, travam, recuam, onda, medimos, plano, antes, depois, golive, seu_projeto, voce_sabe, hoje2, adocao, impoe, constroi, pessoa_por_pessoa, gestao, mudanca_final`. A fala termina em "Gestão da Mudança."; a marca pessoal entra só na imagem, depois de `mb('mudanca_final')`.

## Contrato de uma cena (`src/mapa169/cenas/<id>.js`)

```js
import { ... } from '../base.js';      // paleta C, texto, movimento, ícones, título
import { ... } from '../modelo.js';    // SINAIS, NIVEIS, HEROIS, AREAS, PESSOAS, radar, régua
import { ... } from '../ludico.js';    // fundoVivo, fundoNoite, camera, confete, faiscas, velocidade, balao, sombra, brilho, geoTrilha, mapaTrilha, pinosTrilha, pinoMapa
import { ... } from '../painelUI.js';  // janela, cartao, geoCalor, calor, rosca, tendencia, pilhas, barrasArea, kpi, alerta, filtro, cursor, INDICES, indiceEm

export const FUNDO = 'claro';          // 'claro' | 'navy' (a interface usa para escolher cores)
export const CHIP = '01 · O perfil';   // opcional: etiqueta do capítulo no topo direito
export const LEGENDA = true;           // false = a cena já mostra a fala em tipografia grande
export function desenhar(t, ctx) { return svg; }   // quadro inteiro 1920 × 1080, começando pelo fundo
```

- `t` é o tempo **global** do vídeo em segundos. `ctx = { t0, t1, m(nome), mb(nome), wa(i), wb(i), T, P, TOTAL, id }`: `t0`/`t1` são o início e o fim da cena, `m('nivel3')` devolve o instante em que a palavra começa e `mb()` o instante em que termina.
- Tudo é **função pura de `t`**: sem estado, sem `Math.random()` (use `rng(seed)`), sem `Date`.
- A cena desenha o próprio fundo: `fundoVivo(t)` (claro, liso) ou `fundoNoite(t)` (navy, liso, com uma luz suave).
- A interface comum (marca pessoal "VICTOR VITORINO | CHANGE MANAGEMENT" no topo esquerdo, etiqueta do capítulo, legenda karaokê e fio de progresso) é desenhada pelo `filme.js` por cima. Não redesenhe.
- Entre cenas há um mergulho de cor de 0,22 s para cada lado, feito pelo `filme.js`. A cena deve estar com tudo no lugar até `t1` e pode começar a animar em `t0 + 0,1`.
- **Nenhum logo, logotipo ou nome de empresa na tela (a única marca é a pessoal, desenhada pelo `filme.js` e pelo cartão final do `fecho`). Nenhum personagem, mascote ou desenho de gente.**

## Áreas do quadro 16:9 (px)

`W = 1920`, `H = 1080`, margem lateral `MG = 96`.

| Faixa | y | Uso |
|---|---|---|
| Topo | 36–100 | Marca pessoal e etiqueta do capítulo (do `filme.js`). Não desenhe aqui. |
| **Palco** | 130–910 | Área da cena: título e animação. |
| Legenda | 930–1034 | Pílula da legenda, centrada em x = 960. Não desenhe aqui se `LEGENDA` não for `false`. |
| Progresso | 1070–1080 | Fio laranja. |

Dois esquemas de composição (escolha um por cena e mantenha):

- **A · duas colunas.** Texto à esquerda, x 96–736 (640 px): título em Light 72 px (até 3 linhas, primeira linha de base em y ≈ 250) e, abaixo, o apoio (cartão ou linha de salvaguarda). Visual principal à direita, x 816–1824 (1008 px), y 150–900. O bloco de texto fica centrado na vertical em relação ao visual, ou alinhado pelo topo dele.
- **B · largura total.** Título em uma linha (Light 72 px, linha de base em y ≈ 200) e o visual ocupando x 96–1824, y 250–900.

O vídeo 16:9 aparece **menor** no feed do que o 4:5, então tudo precisa ser maior: **nenhum texto abaixo de 26 px**, rótulos importantes com 30 px ou mais, ícones e discos proporcionais. Componentes do kit com fonte fixa pequena (mapa de calor, tendência, mapa de trilha, pinos) devem ser desenhados numa geometria menor e ampliados com `<g transform="translate(x y) scale(k)">`, com k entre 1,2 e 1,6. Prefira aumentar o visual principal a preencher os lados com coisas novas.

## Linguagem visual: limpa e adulta, com as cores da paleta

- **Tom.** Interessante e envolvente, mas **adulto**: a referência é um filme de produto de tecnologia (interface, dados e tipografia em movimento), não um desenho animado. Mapa de verdade e dashboard de verdade, com **muito respiro**: no máximo três blocos por momento (título + visual principal + um apoio), mais a salvaguarda em uma linha. Na dúvida, tire. **Nada infantil**: sem personagens, sem carinhas, sem mascotes, sem emojis, sem arvorezinhas.
- **Cor.** Só a paleta: navy `C.navy`, azuis (`C.blue`, `C.blue80`, `C.blue40`, `C.blue20`), cinzas e laranja (`C.orange`, `C.orange80`, `C.orange40`, `C.orange20`, `C.orangeD`). Laranja é o acento: use para o foco, não para áreas enormes. Texto laranja só sobre navy.
- **Pessoas.** Sempre abstratas e anônimas: `avatar()` (disco com o ícone de pessoa), `ponto()` ou `pinoMapa()` com a letra A ou B. A Pessoa A (adota) é azul `HEROIS.A.cor`; a Pessoa B (volta para a planilha) é laranja-80 `HEROIS.B.cor`. **Não desenhe personagens.**
- **Telas.** Para mostrar "a ferramenta", "a planilha" e "o painel", use janelas de aplicativo (`janela()`), com pouca interface: um gráfico, um selo, um indicador. Cursor só quando clica.
- **Mapa de Adoção.** É um **mapa de trilha**: `g = geoTrilha(x, y, w, h)`, `mapaTrilha(g, { u, uEst, foco, t })` desenha a ilha, a estrada que sobe e as cinco estações com bandeira (Resiste → Multiplica); `pinosTrilha(g, { onda, k })` põe as 25 pessoas como pinos em volta das estações; `g.em(u)` dá o ponto da estrada (para alguém andar por ela) e `g.uEst[i]` a posição de cada estação.
- **Dashboard.** Tela navy com `janela()`, `kpi()`, `calor()` (mapa de calor áreas × régua), `rosca()`, `tendencia()` (índice de adoção por onda, com o marco GO-LIVE), `pilhas()`, `barrasArea()`, `alerta()`, `filtro()`, `cursor()`. Os números vêm do modelo ilustrativo: índice de adoção 20% → 32% → 56% nas ondas 1, 2 e 3; 25 pessoas; 4 áreas.
- **Régua.** As cinco marcas têm cor fixa em `NIVEIS[i].cor`: Resiste (laranja escuro), Observa (laranja-80), Experimenta (azul-40), Adota (azul), Multiplica (navy).
- **Tipo.** Títulos em Light (`f: 'L'`). Textos e rótulos em Roboto Condensed (`f: 'C'`, 400 e 700). Nada menor que **22 px**; rótulos importantes com 24 px ou mais. Corte rótulos que não fazem falta.
- **Sombra e brilho.** `sombra(svg)` em no máximo um ou dois elementos grandes por cena (cartão, janela). `brilho()` está desligado no kit.

## Movimento: calmo, um foco por vez

O cliente achou a versão anterior poluída. A regra agora é **menos efeito**:

- Entradas simples: `fin()` com subida curta, ou escala com overshoot pequeno. Cascata curta (0,06–0,12 s). Depois que entra, o elemento **fica parado**.
- Traços que se desenham (`tracar`, `icone` com `u`) e números que contam podem ficar.
- **Câmera:** nenhuma, ou no máximo um movimento suave por cena. Sem socos de zoom, sem rotação, sem tremor.
- **Desligados no kit** (as funções existem, mas não desenham nada): `particulas`, `faiscas`, `confete`, `velocidade`, `varredura`, `tremor`, `brilho`. `onda()` é um anel fino e discreto: no máximo uma por momento forte.
- Não desenhe na cena: rastros e cometas de luz, pulsos correndo linhas, anéis e halos em laço, scanners, contornos tracejados marchando, vagas tracejadas, miras, cantoneiras, réguas e malhas decorativas, contadores e etiquetas que repetem informação, cursores passeando.
- Um único detalhe vivo discreto por cena basta (o tracejado da estrada correndo, o ponto "ao vivo").
- O olho segue a fala: um foco por vez; o resto recua para cerca de 45% de opacidade. Laranja só no foco do momento.

## Texto de tela obrigatório (salvaguardas)

- `porque`: "Como cada pessoa entende e vive esta mudança. Não é teste psicológico."
- `perfil`: "Fontes: pesquisa curta, conversa com gestores e dados de uso." e o selo `ILUSTRATIVO`.
- `regua` e `mapa`: "Retrato do momento, neste projeto. Não é avaliação de desempenho."
- `mapa`: "Leitura agregada por área" e o selo `ILUSTRATIVO`.
- `acoes`: "Quem age: patrocinador, gestores diretos e rede de multiplicadores."
- Não cite estatísticas de pesquisa. Os números do dashboard são do modelo ilustrativo e a tela traz o selo `ILUSTRATIVO`.

## Como testar a sua cena

```bash
cd /home/user/finaldoanovideo/animacao
node render.mjs stills --page mapa169.html --w 1920 --h 1080 --test uma-<id> --t 21.0,22.5,24.3 --out build/mapa169/stills/<id>
```

As imagens saem em `build/mapa169/stills/<id>/uma-<id>_<t>.jpg`. Abra com a ferramenta Read. Se a página falhar, o erro aparece no terminal. **Edite só o arquivo da sua cena.** Não altere `base.js`, `modelo.js`, `ludico.js`, `painelUI.js`, `filme.js`, `main.js` nem `tempos.json`; se faltar um auxiliar, escreva-o dentro da sua cena.
