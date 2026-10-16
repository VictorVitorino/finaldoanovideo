# Vídeo azul v19 — "Projeto do Ano · A&M + TOTVS" refeito sobre o v18

Reconstrução completa do vídeo v18 (release [`video-v18`](https://github.com/VictorVitorino/finaldoanovideo/releases/tag/video-v18),
`Projeto-do-Ano-AM-TOTVS-v18-1080p.m4v`, sha256 `644b907d…`, 170 s, 1920×1080, 30 fps) com uma só linguagem visual
(fundo azul profundo, cartões de vidro, dourado/ciano, personagens 3D do padrão) **sem alterar narração, legendas, textos,
números, logos nem a ordem das cenas**. O áudio do v18 é usado intacto; o trecho 1:59–2:08 (Quintão & Antonialli e a
equipe no palco) é mantido do original na montagem.

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
| Dashboard "Resultados que fazem a diferença" | 7,6–52,8 | nove cartões vazios; cada um se preenche na palavra narrada (número → ícones/logos → texto), contadores, zoom contido (1,05, grade sempre inteira entre os personagens), holofote e relevo no cartão ativo, onda final nos nove |
| Desafio do ERP | 52,8–64,47 | Antonialli (3D padrão) à esquerda; painel se constrói, núcleo ERP, caos na "complexidade", seis nós acendem palavra a palavra, anel de alinhamento em "juntos" |
| Farol A&M | 64,47–70,13 | holofote na cidade, logo A&M projetado, mascote A&M entra em "chamar", pílula "QUEM ENTENDE DO JOGO" |
| União | 70,13–80 | feixes azul/laranja, "TECNOLOGIA + GESTÃO" |
| Papéis complementares | 80–90 | Venn construído (TOTVS × A&M, lente "Atuação Conjunta"), itens do slide original, destaque em "metodologia" |
| Metodologia A&M · TMO | 90–112,6 | seis chevrons; câmera acompanha a etapa narrada e volta à visão geral em "Com metodologias" |
| TMO em três círculos | 112,6–119,1 | círculos entram, disco TMO, rodapé qualidade · previsibilidade · resultados |
| Original (liderança e equipe) | 119,1–128,1 | trecho do v18 sem alteração |
| Linha do tempo | 128,1–143,13 | trilha com seis projetos, cartões e avatares, "Argentina", título |
| Cockpit · Xray · IA | 143,13–156 | três painéis com pan de câmera, Vinicius |
| Rumo a 2027 | 156–170,07 | gráfico de crescimento (sem o indicador "R$" fantasma do v18), marcos com logos, chips, "2027" e fechamento |

## Rodar

```bash
cd animacao && npm install
# baixe o v18 da release para build/azul/v18.m4v (áudio e trecho 119,1–128,1 s)
python3 producao/v19_preparar.py                                   # build/azul/img/* e build/azul/v19.json
node render.mjs stills --test v19 --t 8.3,14.2,86.8,160.6          # conferir quadros (build/stills/v19_<t>.jpg)
node render.mjs frames --test v19 --out build/azul/v19 --workers 4 # 5103 quadros, ~17 min, ~1,1 GB (pula quadros existentes)
python3 producao/v19_montar.py                                     # build/azul/Projeto-do-Ano-AM-TOTVS-v19.mp4 (crf 20) e -leve.mp4 (crf 25, < 30 MB)
```

Quadro N = round(t × 30); `--from N --to M` renderiza um trecho. Depois de mudar código, apague os quadros do trecho
(`build/azul/v19/fNNNNN.jpg`) antes de renderizar de novo. Reserve ≥ 3 GB de disco.

## Regras seguidas

- Nenhum número, texto, logo, legenda ou fala alterado; legendas com os textos exatos do v18 (pílula escura, Open Sans 600,
  palavras acendem com a voz, no máximo duas linhas: falas longas usam fonte 28/25; no ERP e no cockpit a legenda fica
  centrada sob o painel, longe do personagem).
- Nenhum elemento cortado ou sobreposto; personagens nas laterais nunca cobrem painéis; sem espelhar personagens.
- Duração igual à do v18 (170,07 s).
- Nada de slides de PowerPoint colados: todos os quadros são construídos em SVG.
- Personagens entram deslizando de fora do quadro (`foraEsq`/`foraDir` em `base.js`) e, quando continuam na cena seguinte,
  ficam no mesmo tamanho e posição para o dissolve não os duplicar (farol → união → papéis).

## Revisão

Pranchas de 9 quadros a cada 0,5 s por cena (`scratchpad/v19/qa/`) revisadas por seis revisores independentes contra as
regras acima (elementos cortados/sobrepostos, personagens sobre painéis, sincronia com a narração, glitches, transições);
cada achado foi conferido no quadro 1920×1080 e corrigido no código antes do render final.
