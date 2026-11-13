# Vídeo "Mapa de Perfil Cognitivo · Mapa de Adoção"

Post de LinkedIn sobre Gestão da Mudança (Change Management), em motion graphics com efeitos de After Effects: telas, ícones, um mapa de trilha e um dashboard com gráficos. **Não tem logo, logotipo nem personagens: usa só as cores da paleta.** O vídeo conta e **constrói na tela** o Mapa de Perfil Cognitivo: cinco sinais lidos em cada pessoa mostram em que marca da régua de adoção ela está hoje; juntando as posições por área nasce o Mapa de Adoção do projeto; e o mapa precisa ficar vivo, porque posição é momento, não rótulo.

| Arquivo | Para quê |
|---|---|
| [`videos/mapa-perfil-cognitivo.mp4`](../videos/mapa-perfil-cognitivo.mp4) | Vídeo 1080 × 1350 (4:5), 88 s, 30 fps, com narração, trilha e legenda queimada (o feed toca mudo). |
| [`videos/mapa-perfil-cognitivo-capa.jpg`](../videos/mapa-perfil-cognitivo-capa.jpg) | Capa (miniatura) do vídeo. |

## Roteiro e tempos

A narração é do ElevenLabs (voz **Doug – Warm, Confident, Conversational**, modelo `eleven_v4`, take 2 de 2). A fala não foi acelerada: cada frase foi recortada no silêncio natural e recolocada com respiros para a animação construir o mapa.

| Tempo | Cena | Narração | O que a tela constrói |
|---|---|---|---|
| 0:00–0:10 | Gancho | Duas pessoas. A mesma ferramenta. O mesmo treinamento. Uma delas adota. A outra volta para a planilha. | Duas telas lado a lado recebem a mesma ferramenta e o mesmo treinamento; a tela da Pessoa A ganha vida, a da Pessoa B é coberta pela planilha. |
| 0:10–0:16 | O porquê | Não é má vontade. É perfil: como cada pessoa percebe, avalia e decide. | A etiqueta "má vontade" cai; um fluxo de três nós: percebe, avalia, decide. "Não é teste psicológico." |
| 0:16–0:20 | Título | Por isso existe o Mapa de Perfil Cognitivo. | Um mapa se desdobra e um pino crava nele. |
| 0:20–0:32 | 01 · O perfil | Em cada pessoa, mapeamos cinco sinais: clareza do porquê, fluência digital, autonomia para aprender, segurança para errar, e o valor que ela vê na mudança. | O radar da Pessoa B é construído: cada sinal acende um eixo. |
| 0:32–0:42 | 02 · A régua | Esses sinais mostram onde ela está hoje na régua de adoção: resiste, observa, experimenta, adota, ou multiplica. | A régua vira a estrada do mapa, com cinco estações; o pino da Pessoa B para em Observa e o da Pessoa A em Adota. |
| 0:42–0:47 | 03 · O mapa | Junte as posições, área por área, e nasce o Mapa de Adoção. | Os pinos das 25 pessoas chovem no mapa de trilha, área por área. |
| 0:47–0:58 | 04 · A ação | Com ele, a Gestão da Mudança deixa de ser receita única. Escuta para quem resiste. Prática para quem experimenta. Palco para quem multiplica. | O mapa vira um dashboard (indicadores e mapa de calor áreas × régua); a receita única dá lugar a uma ação por marca. |
| 0:58–1:13 | 05 · O mapa vivo | Mas o mapa precisa estar vivo. Posição é momento, não rótulo: pessoas avançam, travam, recuam. A cada onda, medimos de novo e ajustamos o plano, antes e depois do go-live. | Dashboard ao vivo: a cada onda o mapa de calor, a rosca e a linha do índice de adoção mudam; o plano é ajustado; o foguete do go-live decola. |
| 1:13–1:17 | Pergunta | No seu projeto, você sabe onde cada pessoa está hoje? | Tipografia grande; uma lupa transforma os "?" em pinos no mapa. |
| 1:17–1:28 | Fecho | Adoção não se impõe. Se constrói. Pessoa por pessoa. Gestão da Mudança. Alvarez & Marsal. | Pinos sobem uma escada nas cores da régua; cartão final sem logos: "Mapa de Perfil Cognitivo · Mapa de Adoção" e "Gestão da Mudança \| Change Management". |

A voz ainda diz "Gestão da Mudança. Alvarez and Marsal." no fim; a tela não mostra o nome nem a marca. Para tirar o nome também do áudio, reduza a última frase em `FRASES` de `producao/mapa_audio.py` (as três últimas palavras) e gere a trilha de novo.

## O modelo mostrado no vídeo

É uma **proposta ilustrativa** para o vídeo. Ajuste os nomes ao método real do time antes de publicar (tudo está em `animacao/src/mapa/modelo.js`).

- **Cinco sinais do perfil:** clareza do porquê, fluência digital, autonomia para aprender, segurança para errar e valor que a pessoa vê na mudança. São sinais de estado, ligados ao projeto, não traços de personalidade.
- **Régua de adoção (cinco marcas):** Resiste (ainda não vê motivo para mudar), Observa (espera para ver funcionar), Experimenta (testa, com apoio), Adota (usa na rotina) e Multiplica (ensina os colegas).
- **Ação por marca:** Escuta, Exemplo, Prática, Reforço e Palco. A narração cita três (Escuta, Prática, Palco) e a tela mostra as cinco.
- **Mapa vivo:** três ondas de leitura, com o go-live entre a onda 2 e a onda 3. Entre uma onda e outra há quem avance, quem trave e quem recue.
- **Dashboard:** o índice de adoção é a parcela de pessoas em Adota ou Multiplica. No modelo ilustrativo ele vai de 20% (onda 1) a 32% (onda 2) e 56% (onda 3).
- **Pessoas e áreas:** 25 pessoas anônimas (pinos e ícones, sem personagens) em quatro áreas (Financeiro, Operações, Comercial, Suprimentos). Os dados são inventados para a animação e a tela traz o selo "Ilustrativo".

**Salvaguardas na tela** (pedidas na revisão do roteiro, para o mapa não ser lido como rótulo de pessoas): "Não é teste psicológico", "Retrato do momento, neste projeto. Não é avaliação de desempenho", "Leitura agregada por área" e "Fontes: pesquisa curta, conversa com gestores e dados de uso". O vídeo não cita nenhuma estatística.

## Legenda do post

```
Duas pessoas. A mesma ferramenta. O mesmo treinamento.
Uma adota. A outra volta para a planilha.

Não é má vontade. É perfil: como cada pessoa percebe, avalia e decide diante da mudança.

O Mapa de Perfil Cognitivo lê cinco sinais em cada pessoa do projeto: clareza do porquê, fluência digital, autonomia para aprender, segurança para errar e o valor que ela vê na mudança. Esses sinais mostram onde ela está hoje na régua de adoção: resiste, observa, experimenta, adota ou multiplica.

Juntando as posições, área por área, nasce o Mapa de Adoção. Com ele, a Gestão da Mudança deixa de ser receita única: escuta para quem resiste, exemplo para quem observa, prática para quem experimenta, reforço para quem adota e palco para quem multiplica.

E o mapa precisa estar vivo. Posição é momento, não rótulo: pessoas avançam, travam e recuam. Por isso medimos de novo a cada onda do projeto e ajustamos o plano, antes e depois do go-live.

No seu projeto, você sabe onde cada pessoa está hoje?

Adoção não se impõe. Se constrói, pessoa por pessoa.

#GestãoDaMudança #ChangeManagement #AdoçãoDeTecnologia #TransformaçãoDigital #AlvarezAndMarsal
```

## Antes de publicar

1. **Método.** Confirme com o time os cinco sinais, as cinco marcas da régua, as ações e as fontes de leitura ("pesquisa curta, conversa com gestores e dados de uso"). São uma proposta para o vídeo.
2. **Marca.** O vídeo não mostra logo nem logotipo, mas a narração cita "Alvarez and Marsal" no fim. Confirme se o nome pode ficar no áudio.
3. **Voz.** Ouça a narração inteira uma vez, com atenção a "go-live", "Cognitivo" e "Alvarez and Marsal". A conferência aqui foi por transcrição automática, não por ouvido.

## Como gerar de novo

```bash
cd animacao
npm install
python3 producao/mapa_audio.py --take doug2      # trilha (build/mapa/trilha.wav) e tempos (src/mapa/tempos.json)
node render.mjs stills --page mapa.html --w 1080 --h 1350 --test filme --t 3,25,40,46,55,70,86 --out build/mapa/stills
node render.mjs frames --page mapa.html --w 1080 --h 1350 --test filme --out build/mapa/frames --workers 4
node render.mjs encode --frames build/mapa/frames --audio build/mapa/trilha.wav --out ../videos/mapa-perfil-cognitivo.mp4
```

O render pula quadros que já existem: apague `build/mapa/frames` depois de mudar algo. Para trabalhar em uma cena só, use `--test uma-<id>` (por exemplo `uma-perfil`). Para ver os componentes, use `--test prancha --t 0.5,1.5,2.5,3.5,4.5,5.5`.

Para trocar a voz, coloque `<take>.mp3` e `<take>.words.json` em `animacao/audio/mapa/` e rode o script com `--take <take>`. Se o texto mudar, atualize `FRASES`, `LEGENDAS`, `DESTAQUE` e `MARCAS` em `producao/mapa_audio.py`.

## Onde mudar o quê

| Quero mudar… | Arquivo |
|---|---|
| Sinais, marcas da régua, ações, áreas e pessoas | `animacao/src/mapa/modelo.js` |
| Respiros entre frases, legenda, efeitos sonoros e trilha | `animacao/producao/mapa_audio.py` |
| Uma cena | `animacao/src/mapa/cenas/<id>.js` |
| Interface comum (selo do vídeo, etiqueta do capítulo, legenda, progresso) | `animacao/src/mapa/filme.js` |
| Fundos, câmera, efeitos e o mapa de trilha | `animacao/src/mapa/ludico.js` |
| Componentes do dashboard (mapa de calor, rosca, tendência, indicadores) | `animacao/src/mapa/painelUI.js` |
| Paleta, texto, movimento, ícones e marcas | `animacao/src/mapa/base.js` |
| Direção de arte e contrato das cenas | `animacao/src/mapa/DIRECAO.md` |
