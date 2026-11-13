# Direção do vídeo "Mapa de Perfil Cognitivo · Mapa de Adoção"

Post de LinkedIn sobre Gestão da Mudança. Motion graphics **dinâmico e sofisticado**, com cara de After Effects, feito em SVG quadro a quadro. **Sem logo e sem logotipo: só as cores da paleta. Sem personagens e nada infantil.** Formato 1080 × 1350 (4:5), 30 fps, 88,0 s, narrado em pt-BR (ElevenLabs, voz Doug). O vídeo toca **mudo** no feed: a tela precisa contar a história sozinha, com legenda.

## A história

Duas pessoas recebem a mesma ferramenta e o mesmo treinamento. Uma adota, a outra volta para a planilha. Não é má vontade, é perfil: como cada pessoa percebe, avalia e decide. O **Mapa de Perfil Cognitivo** lê cinco sinais em cada pessoa, mostra onde ela está **hoje** na **régua de adoção** e, juntando as posições área por área, forma o **Mapa de Adoção** do projeto. Com ele, a Gestão da Mudança deixa de ser receita única: cada marca da régua pede uma ação. E o mapa precisa estar **vivo**: posição é momento, não rótulo; a cada onda do projeto mede-se de novo e ajusta-se o plano, antes e depois do go-live.

## Narração e cenas (tempos em `tempos.json`)

| Cena (`id`) | Início–fim (s) | Fundo | Fala |
|---|---|---|---|
| `gancho` | 0,00–9,67 | claro | Duas pessoas. A mesma ferramenta. O mesmo treinamento. Uma delas adota. A outra volta para a planilha. |
| `porque` | 9,67–16,42 | claro | Não é má vontade. É perfil: como cada pessoa percebe, avalia e decide. |
| `titulo` | 16,42–20,41 | navy | Por isso existe o Mapa de Perfil Cognitivo. |
| `perfil` | 20,41–32,30 | claro | Em cada pessoa, mapeamos cinco sinais: clareza do porquê, fluência digital, autonomia para aprender, segurança para errar, e o valor que ela vê na mudança. |
| `regua` | 32,30–41,96 | claro | Esses sinais mostram onde ela está hoje na régua de adoção: resiste, observa, experimenta, adota, ou multiplica. |
| `mapa` | 41,96–47,22 | claro | Junte as posições, área por área, e nasce o Mapa de Adoção. |
| `acoes` | 47,22–57,99 | navy | Com ele, a Gestão da Mudança deixa de ser receita única. Escuta para quem resiste. Prática para quem experimenta. Palco para quem multiplica. |
| `vivo` | 57,99–72,52 | navy | Mas o mapa precisa estar vivo. Posição é momento, não rótulo: pessoas avançam, travam, recuam. A cada onda, medimos de novo e ajustamos o plano, antes e depois do go-live. |
| `pergunta` | 72,52–76,55 | navy | No seu projeto, você sabe onde cada pessoa está hoje? |
| `fecho` | 76,55–88,00 | navy | Adoção não se impõe. Se constrói. Pessoa por pessoa. Gestão da Mudança. Alvarez & Marsal. |

`tempos.json` traz `cenas` (início de cada cena), `palavras` (cada palavra com início `a` e fim `b`), `marcas` (nome → `{ i, a, b }` da palavra que dispara um evento) e `sfx` (efeitos sonoros já mixados: pop, tique, whoosh, sino, impacto). **Sincronize a animação com as marcas**: o que a fala nomeia acende na tela no instante da palavra (pode antecipar 0,05–0,15 s). Marcas disponíveis: `duas, ferramenta, treinamento, adota, outra, planilha, ma_vontade, perfil, percebe, avalia, decide, por_isso, mapa_perfil, cognitivo, cada_pessoa, cinco, sinal1..sinal5, mudanca, esses_sinais, hoje, regua, nivel1..nivel5, junte, area, nasce, mapa_adocao, com_ele, receita, escuta, pratica, palco, vivo, momento, rotulo, avancam, travam, recuam, onda, medimos, plano, antes, depois, golive, seu_projeto, voce_sabe, hoje2, adocao, impoe, constroi, pessoa_por_pessoa, gestao, alvarez, marsal`.

## Contrato de uma cena (`src/mapa/cenas/<id>.js`)

```js
import { ... } from '../base.js';      // paleta C, texto, movimento, ícones, título
import { ... } from '../modelo.js';    // SINAIS, NIVEIS, HEROIS, AREAS, PESSOAS, radar, régua
import { ... } from '../ludico.js';    // fundoVivo, fundoNoite, camera, confete, faiscas, velocidade, balao, sombra, brilho, geoTrilha, mapaTrilha, pinosTrilha, pinoMapa
import { ... } from '../painelUI.js';  // janela, cartao, geoCalor, calor, rosca, tendencia, pilhas, barrasArea, kpi, alerta, filtro, cursor, INDICES, indiceEm

export const FUNDO = 'claro';          // 'claro' | 'navy' (a interface usa para escolher cores)
export const CHIP = '01 · O perfil';   // opcional: etiqueta do capítulo no topo direito
export const LEGENDA = true;           // false = a cena já mostra a fala em tipografia grande
export function desenhar(t, ctx) { return svg; }   // quadro inteiro 1080 × 1350, começando pelo fundo
```

- `t` é o tempo **global** do vídeo em segundos. `ctx = { t0, t1, m(nome), mb(nome), wa(i), wb(i), T, P, TOTAL, id }`: `t0`/`t1` são o início e o fim da cena, `m('nivel3')` devolve o instante em que a palavra começa e `mb()` o instante em que termina.
- Tudo é **função pura de `t`**: sem estado, sem `Math.random()` (use `rng(seed)`), sem `Date`.
- A cena desenha o próprio fundo: `fundoVivo(t)` (claro, com formas flutuando) ou `fundoNoite(t)` (navy com luzes e poeira).
- A interface comum (selo "MAPA DE ADOÇÃO" no topo esquerdo, etiqueta do capítulo, legenda karaokê e fio de progresso) é desenhada pelo `filme.js` por cima. Não redesenhe.
- Entre cenas há um mergulho de cor de 0,22 s para cada lado, feito pelo `filme.js`. A cena deve estar com tudo no lugar até `t1` e pode começar a animar em `t0 + 0,1`.
- **Nenhum logo, logotipo ou nome de empresa na tela. Nenhum personagem, mascote ou desenho de gente.**

## Áreas do quadro (y em px)

| Faixa | y | Uso |
|---|---|---|
| Topo | 40–100 | Selo do vídeo e etiqueta do capítulo. Não desenhe aqui. |
| Título da cena | 150–320 | `titulo([...], MG, 196, t, t0 + 0.15)`: Light 62 px, até 2 linhas. |
| **Palco** | 330–1170 | Área da animação. Margem lateral de 72 px (`MG`); fundos, estrada e brilhos podem sangrar. |
| Legenda | 1210–1295 | Pílula da legenda. Não desenhe aqui se `LEGENDA` não for `false`. |
| Progresso | 1340–1350 | Fio laranja. |

## Linguagem visual: dinâmica e adulta, com as cores da paleta

- **Tom.** Interessante e envolvente, mas **adulto**: a referência é um filme de produto de tecnologia (interface, dados e tipografia em movimento), não um desenho animado. Mapa de verdade, dashboard de verdade, câmera que se move, luz e profundidade. Nada de slide de consultoria parado e **nada infantil**: sem personagens, sem carinhas, sem mascotes, sem emojis, sem arvorezinhas.
- **Cor.** Só a paleta: navy `C.navy`, azuis (`C.blue`, `C.blue80`, `C.blue40`, `C.blue20`), cinzas e laranja (`C.orange`, `C.orange80`, `C.orange40`, `C.orange20`, `C.orangeD`). Laranja é o acento: use para o foco, não para áreas enormes. Texto laranja só sobre navy.
- **Pessoas.** Sempre abstratas e anônimas: `avatar()` (disco com o ícone de pessoa), `ponto()` ou `pinoMapa()` com a letra A ou B. A Pessoa A (adota) é azul `HEROIS.A.cor`; a Pessoa B (volta para a planilha) é laranja-80 `HEROIS.B.cor`. **Não desenhe personagens.**
- **Telas.** Para mostrar "a ferramenta", "a planilha" e "o painel", use janelas de aplicativo (`janela()`), com interface, gráficos e cursor.
- **Mapa de Adoção.** É um **mapa de trilha**: `g = geoTrilha(x, y, w, h)`, `mapaTrilha(g, { u, uEst, foco, t })` desenha a ilha, a estrada que sobe e as cinco estações com bandeira (Resiste → Multiplica); `pinosTrilha(g, { onda, k })` põe as 25 pessoas como pinos em volta das estações; `g.em(u)` dá o ponto da estrada (para alguém andar por ela) e `g.uEst[i]` a posição de cada estação.
- **Dashboard.** Tela navy com `janela()`, `kpi()`, `calor()` (mapa de calor áreas × régua), `rosca()`, `tendencia()` (índice de adoção por onda, com o marco GO-LIVE), `pilhas()`, `barrasArea()`, `alerta()`, `filtro()`, `cursor()`. Os números vêm do modelo ilustrativo: índice de adoção 20% → 32% → 56% nas ondas 1, 2 e 3; 25 pessoas; 4 áreas.
- **Régua.** As cinco marcas têm cor fixa em `NIVEIS[i].cor`: Resiste (laranja escuro), Observa (laranja-80), Experimenta (azul-40), Adota (azul), Multiplica (navy).
- **Tipo.** Títulos em Light (`f: 'L'`). Textos e rótulos em Roboto Condensed (`f: 'C'`, 400 e 700). Nada menor que **20 px**; rótulos importantes com 24 px ou mais.
- **Sombra e brilho.** `sombra(svg)` e `brilho(svg)` usam filtros já instalados (`#fx-sombra`, `#fx-glow`, `#fx-blur`). Use em poucos elementos grandes (cartões, janela, título), nunca em dezenas de itens: filtro é caro.

## Movimento (After Effects)

- Entradas com `back()` (overshoot), `elast()` ou `fin()`; nada aparece "seco". Objetos caem e quicam, cartões deslizam com leve rotação, números contam, traços se desenham (`tracar`, `icone` com `u`).
- **Câmera.** `camera(svg, { z, cx, cy, r })` para zoom-in no detalhe, zoom-out para revelar o todo e pequenas panorâmicas. Uma ou duas por cena, com `ease.inOut`.
- Rastro e linhas de velocidade (`velocidade`) em entradas rápidas; `onda()`, `particulas()` e `faiscas()` nos momentos fortes. `confete()` só no título, no go-live e no quadro final, e discreto.
- Encadeie em cascata (0,06–0,12 s). Sempre há algo vivo: um pulso de luz, o tracejado da estrada correndo, uma bandeira tremulando, um cursor, um número contando.
- O olho segue a fala: um foco por vez; o resto recua para 45–55% de opacidade.

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
node render.mjs stills --page mapa.html --w 1080 --h 1350 --test uma-<id> --t 21.0,22.5,24.3 --out build/mapa/stills/<id>
```

As imagens saem em `build/mapa/stills/<id>/uma-<id>_<t>.jpg`. Abra com a ferramenta Read. Se a página falhar, o erro aparece no terminal. **Edite só o arquivo da sua cena.** Não altere `base.js`, `modelo.js`, `ludico.js`, `painelUI.js`, `filme.js`, `main.js` nem `tempos.json`; se faltar um auxiliar, escreva-o dentro da sua cena.
