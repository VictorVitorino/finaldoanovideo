# Curta DTS: "Minha trajetória na Alvarez & Marsal em 60 segundos"

- **Vídeo:** [`videos/dts-trajetoria-victor-60s.mp4`](../videos/dts-trajetoria-victor-60s.mp4), com 60,0 s, 1920×1080, 30 fps, narração e trilha.
- **Capa (thumbnail):** [`videos/capa-dts-trajetoria-60s.jpg`](../videos/capa-dts-trajetoria-60s.jpg). É o quadro de 5,38 s do vídeo.

A versão de 30 s continua em [`curta-dts.md`](curta-dts.md).

## O que mudou em relação à versão de 30 s

| Pedido | O que foi feito |
|---|---|
| Vídeo de 1 minuto | O vídeo tem 60,0 s. A fala **não é acelerada**: cada frase é recortada no silêncio natural e recolocada com respiros planejados entre as frases (`producao/dts60_audio.py`). |
| Voz melhor, "Doug Warm" | Voz **Doug – Warm, Confident, Conversational** (ElevenLabs, `eleven_v4`), take 1 de 4. A voz foi normalizada para −18 dBFS e a música abaixa sob a fala. |
| Pronúncia "Alvarez and Marsal" e "DTS" como sigla | O texto diz "Alvarez and Marsal" e "DTS" (não "Dits"). Na tela aparece sempre "Alvarez & Marsal" e "DTS". |
| Capa rápida "Minha trajetória na Alvarez em 60 segundos" | Cena de abertura com tipografia cinética e um cronômetro que marca 60 s. No fim da capa, ele voa para o canto e vira o **contador regressivo 0:60 → 0:00**, que acompanha o filme inteiro. |
| Banner DTS reconstruído com efeitos de After Effects | O banner é montado no momento em que a narração diz "DTS": o painel abre com desfoque de movimento, as letras D-T-S caem, a divisória cresce, o texto é revelado por máscara e há faixas, varredura de luz, onda de choque e cantos de HUD. Em seguida entram janelas de interface, rótulos INOVAÇÃO / TECNOLOGIA / IA e linhas de rede. |
| Nome e cargo mais agradáveis | Crachá em cordão laranja com avatar, "Victor Vitorino" e "Gestão de Mudanças em Tecnologia", título cinético e os chips Pessoas · Processos · Tecnologia. |
| "IA não é moda, é método" com efeitos | "IA" com glitch e brilho, "MODA" estilhaçada, carimbo "MÉTODO" com tremor e onda de choque, e um ciclo de método sendo montado. |
| Aprendendo, testando, entregando qualidade | Trilha em 3 etapas (Aprender → Testar → Entregar) que acendem junto com a fala. |
| Entregas saindo do computador | 10 entregas saem do notebook no ritmo da narração e seguem por uma esteira até o CLIENTE. Os diretores observam de longe. |
| Liderança por perto | Direciona · Acompanha · Troca, com setas de troca nos dois sentidos. |
| Foco em entrega, performance, collection + aprendendo com os melhores | Três pilares no formato do logo A&M e o Victor com os 3 diretores no topo. |
| Encerramento: "Isso é DTS. Isso é Performance Alvarez and Marsal" | Fundo navy limpo, sem as linhas diagonais. Banner DTS, lockup A&M \| PERFORMΛNCE, Alvarez & Marsal, os 4 personagens no palco e confete. |

## Roteiro e tempos

| Tempo | Cena | Narração |
|---|---|---|
| 0:00–0:06 | Capa | "Minha trajetória na Alvarez and Marsal… em sessenta segundos." |
| 0:06–0:09 | 1 · A chegada | "Cheguei na Alvarez and Marsal, dentro de…" |
| 0:09–0:13 | 2 · DTS | "…DTS: um mundo de inovação e tecnologia!" |
| 0:13–0:22 | 3 · Meu papel | "Meu papel? Gestão de Mudanças em Tecnologia. E fui recebido por gente que ensina, provoca e abre portas." |
| 0:22–0:26 | 4 · IA como método | "Aqui, IA não é moda. É MÉTODO." |
| 0:26–0:31 | 5 · Aprender fazendo | "Estou aprendendo, testando… e entregando qualidade aos clientes." |
| 0:31–0:39 | 6 · Mão na massa | "Dashboards, propostas, sistemas, produtos de engajamento… tudo saindo do computador, direto para o cliente!" |
| 0:39–0:46 | 7 · Liderança por perto | "E com a liderança sempre por perto: direcionando, acompanhando, trocando." |
| 0:46–0:52 | 8 · Foco | "Foco em entrega, performance, collection… e o melhor de tudo: aprendendo com os melhores." |
| 0:52–1:00 | 9 · DTS / Performance | "Isso é DTS. Isso é Performance Alvarez and Marsal." |

Os nomes dos diretores não aparecem. O Victor é careca (laterais raspadas e brilho no topo); o resto do visual do personagem fica em `animacao/src/dts/pessoas.js`.

## Arquivos

- `animacao/audio/dts60/` guarda a narração escolhida (`doug1.mp3`) e o tempo de cada palavra (`doug1.words.json`).
- `animacao/producao/dts60_audio.py` gera:
  - `build/dts60/trilha.wav`, com a narração montada, a trilha e os efeitos;
  - `src/dts60/tempos.json`, com as cenas, as palavras, as legendas e os produtos.
- `animacao/src/dts60/base.js` reúne a paleta, os fundos, os efeitos de After Effects, o banner DTS e os lockups.
- `animacao/src/dts60/filme.js` monta as cenas e desenha a interface comum: marca, cronômetro de 60 s, chip, legenda karaokê e cortina.
- `animacao/src/dts60/cenas/*.js` tem uma cena por arquivo.

## Como renderizar

```bash
cd animacao
npm install
python3 producao/dts60_audio.py --take doug1          # áudio + tempos
node render.mjs stills --test dts60 --t 5.38,10,20,40,59 --out build/dts60/stills
node render.mjs frames --test dts60 --out build/dts60/frames --workers 4
node render.mjs encode --frames build/dts60/frames --audio build/dts60/trilha.wav --out build/dts60/dts-60s.mp4
```

Para trocar a take de voz, coloque `<take>.mp3` e `<take>.words.json` em `audio/dts60/` e rode o script com `--take <take>`. Os tempos de todas as cenas se ajustam sozinhos.
