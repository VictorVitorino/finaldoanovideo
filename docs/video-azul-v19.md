# Vídeo azul v19 — "Projeto do Ano · A&M + TOTVS" refeito sobre o v18

Reconstrução completa do vídeo v18 (release [`video-v18`](https://github.com/VictorVitorino/finaldoanovideo/releases/tag/video-v18),
`Projeto-do-Ano-AM-TOTVS-v18-1080p.m4v`, sha256 `644b907d…`, 170 s, 1920×1080, 30 fps) com uma só linguagem visual
(fundo azul profundo, cartões de vidro, dourado/ciano, personagens 3D do padrão) **sem alterar narração, legendas, textos,
números, logos nem a ordem das cenas**. O áudio do v18 é usado intacto; o trecho 1:59–2:08 (Quintão & Antonialli e a
equipe no palco) é mantido do original na montagem, com um dissolve de 0,5 s a partir do TMO refeito (o v18 tinha ali o
seu próprio dissolve a partir do slide antigo).

## Arquivos

| O quê | Onde |
|---|---|
| Base visual: paleta, fundo, cartões, pílulas, personagens (respiração, sem espelhar), chrome, legenda karaokê do v18 | `animacao/src/azul/base.js` |
| Montagem das cenas por tempo absoluto, transições, fade final | `animacao/src/azul/v19.js` (`CENAS`, `quadro(t)`) |
| Cenas 1–5: capa, dashboard, desafio do ERP, farol A&M, união | `animacao/src/azul/v19a.js` |
| Cenas 6–8: papéis complementares (Venn), metodologia TMO (seis etapas), TMO em três círculos | `animacao/src/azul/v19b.js` |
| Cenas 11–13: linha do tempo dos seis projetos, cockpit/Xray/IA com Vinicius, Rumo a 2027 | `animacao/src/azul/v19c.js` |
| Entrada do renderizador (`--test v19`) | `animacao/src/testes/v19.js` |
| Falas, tempos e palavras da narração do v18 (reconhecimento de fala Parakeet TDT, conferido legenda a legenda) | `animacao/producao/dados/v19_falas.json` (+ `v19_palavras_v18.json`, bruto) |
| Preparação dos insumos em `build/azul` (recortes, rostos, logos brancos, `meta.json`, `v19.json`) | `animacao/producao/v19_preparar.py` |
| Montagem final (quadros + trecho original + áudio do v18) | `animacao/producao/v19_montar.py` |

Personagens: mascotes TOTVS e A&M e Antonialli líder de `assets/personagens/novos-9-personagens-3d/`, retratos de
`assets/personagens/animation-3d/` (avatares). Fontes: Outfit, DM Sans e Open Sans (legenda, como no v18) via `npm install`.

## Cenas (tempo absoluto, s)

| Cena | Trecho | Sincronia |
|---|---|---|
| Capa | 0–7,6 | lua, cidade, dois mascotes, faixa de luz e fio dourado nas palavras "projeto"/"parceria" |
| Dashboard "Resultados que fazem a diferença" | 7,6–53,6 | câmera parada; um cartão por vez, grande no centro, com números e descrições entrando por máscara de revelação (lados alternados) e contadores; no fim os nove cartões compõem o painel (revelações de lados diferentes, o último voa para o seu lugar), contorno luminoso e traço de luz em cada cartão, varredura de luz, selo "Alvarez & Marsal · Painel de excelência" carimbado no canto com clarão final; ~2,5 s com o painel completo. Cartão 6 com o chip "FRAMEWORK INTEGRADO" + elo; cartão 7 "Utilizando IA como aceleradores" com MIT em destaque |
| Desafio do ERP | 53,6–64,47 | "Principais desafios de uma implantação de ERP": Antonialli (3D padrão) à esquerda; painel se constrói, núcleo ERP, conectores curvos do núcleo a cada nó (tracejados e inquietos na "complexidade", sólidos e luminosos quando o nó acende, verdes com fluxo em "juntos"), ícones animados |
| Farol A&M | 64,47–71,1 | holofote na cidade, logo A&M projetado com as três frases ao lado (Gente que entende do jogo · Confiança que impulsa · Núcleo de excelência em performance), mascote A&M entra em "chamar" |
| União | 71,1–80 | feixes azul/laranja, "TECNOLOGIA + GESTÃO" |
| Papéis complementares | 80–90 | mandala: dois anéis entrelaçados (TOTVS azul, A&M dourado, R 290; o arco azul do entrelaçamento usa sweep 0 para ficar sobre o próprio anel) com os logos grandes nas laterais e a descrição de cada lado; itens (16 px) com folga das bordas entrando por máscara; lente estreita só com "Atuação Conjunta · Refinamento de Processos (MIT)"; os cinco itens da atuação conjunta numa fileira de chips sob a mandala; título pequeno no topo |
| Metodologia Integrada A&M e TOTVS | 90–112,6 | título "METODOLOGIA INTEGRADA A&M E TOTVS · 6 FASES, E UMA ÚNICA JORNADA"; quadro mais baixo, afastado do título e compacto; ícone da etapa ativa pulsa, burst ao acender, anel girando no elo ativo, energia correndo pela linha; seis chevrons; câmera acompanha a etapa narrada e volta à visão geral em "Com metodologias" |
| TMO em três círculos | 112,6–119,7 | os três círculos vêm de cima e dos cantos e se unem (onda de choque); o disco TMO emerge do centro com clarão, faíscas e anéis; rodapé qualidade · previsibilidade · resultados |
| Original (liderança e equipe) | 119,2–128,1 | trecho do v18 sem alteração (dissolve de 0,5 s na entrada e de 0,8 s na saída, para a linha do tempo) |
| Linha do tempo | 127,3–143,13 | trilha com seis projetos, cartões e avatares, "Argentina", título |
| Cockpit · Xray · IA | 143,13–156 | três painéis (IA · Testes · Cockpit, da esquerda para a direita) com pan de câmera na ordem da narração, entrada por máscara e brilho no painel em foco; Vinicius (busto novo, sem a antena, 400 px, fora dos painéis) |
| Rumo a 2027 | 156–170,07 | gráfico de crescimento traçado devagar por um foguete cartoon (logo A&M no corpo, astronauta com o rosto do Antonialli na viseira, chamas e rastro); marcos com logos acima da linha; ao fim do gráfico o foguete segue subindo por uma trajetória projetada com as bandeiras 2027 · 2028 · 2029 e paira no alto; chips e fechamento |

## Rodar

```bash
cd animacao && npm install
# baixe o v18 da release para build/azul/v18.m4v (áudio e trecho 119,2–128,1 s)
python3 producao/v19_preparar.py                                   # build/azul/img/* e build/azul/v19.json
node render.mjs stills --test v19 --t 8.3,14.2,86.8,160.6          # conferir quadros (build/stills/v19_<t>.jpg)
node render.mjs frames --test v19 --out build/azul/v19 --workers 4 # 5103 quadros, ~17 min, ~1,1 GB (pula quadros existentes)
python3 producao/v19_montar.py                                     # build/azul/Projeto-do-Ano-AM-TOTVS-v19.mp4 (crf 20) e -leve.mp4 (crf 25, < 30 MB)
```

Transições: dissolve de 0,45 s entre cenas (1,2 s dashboard → ERP e 1,0 s ERP → farol, com saída dos personagens e do painel).
Quadro N = round(t × 30); `--from N --to M` renderiza um trecho. Depois de mudar código, apague os quadros do trecho
(`build/azul/v19/fNNNNN.jpg`) antes de renderizar de novo. Reserve ≥ 3 GB de disco.

## Regras seguidas

- Nenhum número, texto, logo, legenda ou fala alterado; legendas com os textos exatos do v18 (pílula escura, Open Sans 600,
  palavras acendem com a voz, no máximo duas linhas: falas longas usam fonte 28/25; no ERP e no cockpit a legenda fica
  centrada sob o painel, longe do personagem).
- Nenhum elemento cortado ou sobreposto; personagens nas laterais nunca cobrem painéis; sem espelhar personagens.
- Duração igual à do v18 (170,07 s).
- Nada de slides de PowerPoint colados: todos os quadros são construídos em SVG.
- Personagens estáticos (sem respiração nem balanço); entram deslizando de fora do quadro (`foraEsq`/`foraDir` em `base.js`)
  e, quando continuam na cena seguinte, ficam no mesmo tamanho e posição para o dissolve não os duplicar.
- Entradas de texto/números com máscara de revelação (`revela` em `base.js`), estilo After Effects; sem zoom/balanço de câmera.

## Revisão

Pranchas de 9 quadros a cada 0,5 s por cena (`scratchpad/v19/qa/`) revisadas por seis revisores independentes contra as
regras acima (elementos cortados/sobrepostos, personagens sobre painéis, sincronia com a narração, glitches, transições);
cada achado foi conferido no quadro 1920×1080 e corrigido no código antes do render final.

## v20 · remoção do par de pernas extra (carrinho)

O v20 (release [`videov-20`](https://github.com/VictorVitorino/finaldoanovideo/releases/tag/videov-20),
`Projeto.Totvs.-.Final.do.ano.mp4`, sha256 `2210d627…`, 3:30) tinha, na abertura (0:01–0:15) e no encerramento (3:11–3:30),
um segundo par de pernas do Fabio Quintão dentro do carrinho (calça e sapatos duplicados sob o tronco, atrás da grade).

| O quê | Onde |
|---|---|
| Remoção: polígono-âncora por tomada, rastreio do carrinho (LK + similaridade RANSAC), LaMa em quadros-chave a cada 10 quadros deformado para os vizinhos; arames, capas azuis e pele nunca pintados | `animacao/producao/v20_pernas.py` (`TOMADAS`) |
| Montagem: quadros tratados sobrepostos no v20 original, áudio intacto | `animacao/producao/v20_montar.py` |

Tomadas tratadas (quadros a 30 fps): W 40–67, A 148–226, B 267–366, C 405–433, D 5740–5766, D2 5796–5838, E 6053–6140,
F1 6141–6157, F3 6240–6302. Modelos: `big-lama.pt` (baixado pelo pacote `simple-lama-inpainting`) e torch em CPU.

```bash
cd animacao && mkdir -p build/azul/v20in && curl -L -o build/azul/v20in/v20.mp4 <url da release>
# extrai os quadros das tomadas (png/nNNNNNN.png), ex.: ffmpeg -ss 8.9 -i v20.mp4 -frames:v 100 -start_number 267 png/n%06d.png
python3 producao/v20_pernas.py testar        # antes/depois dos quadros-âncora em build/azul/v20in/teste/
python3 producao/v20_pernas.py rodar         # build/azul/v20in/fix/
python3 producao/v20_montar.py               # build/azul/Projeto-Totvs-Final-do-ano-v20-pernas(.mp4|-leve.mp4)
```

> Resultado reprovado na revisão ("ficou muito ruim"): o v21 parte do v20 original, sem a remoção.

## v21 · voz única, filme mais curto e ajustes

O v21 mantém a abertura e o encerramento do carrinho do v20 e troca o miolo pelo filme azul refeito:

| O quê | Onde |
|---|---|
| Narração inteira na voz "Narrador" (Supertonic 3, voz 8, 1,06x), mesmas 30 falas; até 3 sínteses por fala, fica a mais clara no ASR (Parakeet), com palavras-chave para nomes e termos | `animacao/producao/v21_voz.py voz [l10,l25]` |
| Pausas curtas, cenas re-sincronizadas pelos tempos das palavras (índices antigos preservados); filme de 170 s para ~162 s | `PAUSA_ANTES`, `CENAS` em `v21_voz.py` → `build/azul/v19.json` e `producao/dados/v21_falas.json` |
| Trilha: instrumental do v18 (UVR Kim_Vocal_2) com ducking sob a voz | `animacao/producao/v21_voz.py mix` |
| Mandala entra já em "Competências complementares" (sem desenho lento) | `CENAS` (`papeis` em `l15`), `src/azul/v19b.js` |
| Linha do tempo: FUNED com José e Victor (foto fora do git, em `build/azul/fontes/`) | `src/azul/v19c.js`, `producao/v19_preparar.py` |
| Cockpit: visão geral dos três painéis maior e centralizada acima do Vinicius | `src/azul/v19c.js` (`cockpit`) |
| Rumo a 2027: time inteiro lado a lado (2×7) no espaço livre; foguete com brilho, rastro luminoso e astronauta de cabeça grande | `src/azul/v19c.js` (`rumo`, `foguete`) |
| Montagem por partes: v20 0–15,0 s + filme + v20 185,1–210,1 s, cada parte com áudio da mesma duração do vídeo e concatenadas sem recodificar (sincronia medida: 21 ms constantes); palco do v18 (119,4–128,1 s) desacelerado 1,41x com `minterpolate` (cache em `build/azul/v21/palco_*.mp4`); versão leve crf 27 (~28 MB) | `animacao/producao/v21_montar.py` |

```bash
cd animacao
python3 producao/v21_voz.py voz && python3 producao/v21_voz.py mix
node render.mjs frames --test v19 --out build/azul/v21 --workers 4
python3 producao/v21_montar.py             # build/azul/Projeto-do-Ano-AM-TOTVS-v21(.mp4|-leve.mp4), 3:21
```
