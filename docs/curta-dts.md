# Curta DTS: a trajetória do Victor na A&M (29,5 s)

Vídeo: [`videos/dts-trajetoria-victor-30s.mp4`](../videos/dts-trajetoria-victor-30s.mp4) (1920×1080, 30 fps, narração + trilha).

Segue a linguagem do vídeo de referência *Canteiro*: papel creme quadriculado, manchas pastel, legenda em pílula navy com karaokê, chip de cena no canto e personagens chibi. As cores são as da A&M e do banner DTS: navy `#002a46`, laranja `#f78c16`, ardósia `#39566d` e azul claro `#b8cce0`.

## Roteiro

| Tempo | Cena | Narração | Na tela |
|---|---|---|---|
| 0:00–0:07 | 1 · A chegada | "Julho de 2026. Cheguei à Alvarez and Marsal, no DTS, para fazer Gestão de Mudanças em Tecnologia." | Victor caminha até o prédio A&M (o próprio logo vira arquitetura) e entra pela porta do DTS. Lá dentro, o painel DTS, os colegas acenando e o crachá "Gestão de Mudanças em Tecnologia". |
| 0:07–0:12 | 2 · IA como método | "Aqui, IA não é moda: é método. Aprendi, testei, me descobri..." | Aula de IA com o robô "IA"; "MODA" é riscada e entra o carimbo "MÉTODO". Depois o Victor no centro, com as ferramentas orbitando: Claude, Skills, Prompts, Agentes, Automação, Gamificação, Design e Dados. |
| 0:12–0:17 | 3 · Mão na massa | "e comecei a criar! Dashboards, propostas, sistemas, produtos de engajamento." | Victor digita e o notebook cospe 8 entregas que voam até a prateleira. Os 3 diretores observam de longe, pela janela de vidro (olho e check). |
| 0:17–0:22 | 4 · Liderança por perto | "E sempre com a liderança por perto: direcionando, acompanhando, trocando." | Victor apresenta. Os diretores chegam e reagem com os balões Direciona, Acompanha e Troca, e setas nos dois sentidos fazem a troca bilateral. |
| 0:22–0:25 | 5 · 4 meses | "Quatro meses. Foco em entrega, performance e collection." | Fita métrica JUL → OUT e três barras no formato do logo A&M: ENTREGA, PERFORMANCE e COLLECTION. |
| 0:25–0:29 | 6 · DTS | "Isso é DTS. Isso é Alvarez and Marsal." | Cartão navy no estilo do banner DTS, com o lockup da A&M e os quatro personagens. |

Os nomes dos diretores não aparecem em nenhum momento.

## Personagens

Ficam em `animacao/src/dts/pessoas.js` (`ELENCO_DTS`).

- `dir1`, `dir2` e `dir3` seguem as três fotos enviadas, na ordem em que chegaram.
- `victor` é careca (laterais raspadas e brilho no topo), de blazer azul, camisa clara e crachá DTS. Para ajustar, basta trocar a linha `victor` (cabelo, pele, barba, óculos, roupa).

## Narração

- Gerada no ElevenLabs com a voz "Enzo – Professional and Warm" (pt-BR) e o modelo `eleven_v4`. Foi escolhida a take 3 de 4.
- O arquivo está em `animacao/audio/dts/`.
- A take original tinha 33,5 s. `producao/dts_audio.py` encurta as pausas para 0,2 s e acelera a fala em 9% (sem mudar o tom), o que deixa o vídeo em 29,5 s.
- O mesmo script sintetiza a trilha (Ré maior, 112 bpm, com ducking sob a voz) e os efeitos: cortinas, pops das entregas, digitação e o sino final.
- A transcrição com o tempo de cada palavra (`eleven_scribe_v1`) sincroniza a legenda karaokê e as cenas.

## Como renderizar

```bash
cd animacao
npm install
python3 producao/dts_audio.py                                   # build/dts/trilha.wav + src/dts/tempos.json
node render.mjs stills --test dts --t 3,14,20,28 --out build/dts/stills
node render.mjs frames --test dts --out build/dts/frames --workers 4
node render.mjs encode --frames build/dts/frames --audio build/dts/trilha.wav --out build/dts/dts-curta.mp4
```

Para ver a prancha do elenco: `node render.mjs stills --test dtselenco --t 0.5`.
