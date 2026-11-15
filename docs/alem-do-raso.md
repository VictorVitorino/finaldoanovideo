# Vídeo interativo "Além do raso" (o iceberg que não aparece no slide)

Filme de 1 min 28 s sobre gestão da mudança, feito para a página inicial do blog Change Management World.
Motion graphics em azul, com narração, trilha e efeitos. **Não tem personagens**: nenhuma figura humana aparece.
No site, o filme ganha uma camada interativa: capítulos, legendas, 11 pontos clicáveis, um momento em que o vídeo para e espera o toque de quem assiste, e um quadro final de escolha.

| Arquivo | Para quê |
|---|---|
| [`blog/assets/video/alem-do-raso-1080.mp4`](../blog/assets/video/alem-do-raso-1080.mp4) | Filme em 1920 × 1080, 30 fps, H.264 + AAC (cerca de 14 MB). O player usa em tela larga. |
| [`blog/assets/video/alem-do-raso-720.mp4`](../blog/assets/video/alem-do-raso-720.mp4) | Mesma coisa em 1280 × 720 (cerca de 7,5 MB): celular, economia de dados e navegador sem JavaScript. |
| [`blog/assets/video/alem-do-raso-capa.jpg`](../blog/assets/video/alem-do-raso-capa.jpg) | Capa: o quadro em que os cinco fatores estão na tela. |
| `blog/assets/video/alem-do-raso.vtt` | Legendas (gerado pelo build do blog a partir dos tempos do filme). |
| [`blog/_src/content/video.json`](../blog/_src/content/video.json) | Textos do player: título, cartões dos 11 pontos, quadro final. |
| [`blog/_src/content/video-tempos.json`](../blog/_src/content/video-tempos.json) | Tempos e posições exportados do próprio filme (não edite à mão). |

## A ideia

O cenário é uma sala de reunião à noite, vista de frente: a cidade pelas janelas, o slide de status na parede, cadeiras vazias.
**O tampo da mesa é a linha d'água.** Em cima dele fica só a ponta do iceberg, como um enfeite de mesa, e um barco de papel com a bandeira "PROJETO".
A câmera mergulha através da mesa e mostra o resto: o gelo que ninguém pôs no slide.

- **Quem usa o sistema** aparece como pontos de luz, nunca como bonecos: três no barco, que voltam para as planilhas quando o barco bate no gelo; seis que atravessam o caminho no fim.
- **O gelo** é um bloco de oito pedaços. Ele é mapeado (sonda e pulsos), rachado em três golpes (sentido, prática, medida) e os pedaços sobem para virar pedras de travessia.
- **A tela da sala** muda junto: começa em "Tudo dentro do plano" (prazo, sistema, treinamento) e termina na curva de adoção, "uso de verdade, semana a semana".

## Roteiro e tempos

Narração do ElevenLabs: voz **Dani** (carioca), modelo `eleven_v4`, take 1 de 2 (`animacao/audio/raso/dani1.mp3`).
A fala não foi acelerada: cada frase foi recortada no silêncio natural e reposicionada para caber nas cenas.

| Tempo | Capítulo | Narração | O que a tela faz |
|---|---|---|---|
| 0:00–0:15 | 01 · A ponta | Todo projeto de mudança tem uma parte que cabe no slide: o prazo, o sistema, o treinamento. É a ponta do iceberg. E muita reunião termina aqui, na superfície. | As luzes acendem, o slide de status se preenche, o barco "PROJETO" balança na mesa, a ponta do gelo ganha o rótulo. |
| 0:15–0:20 | 02 · Abaixo da linha | Só que a mudança de verdade acontece abaixo da linha d'água. | A câmera atravessa a mesa e recua até caber o iceberg inteiro. |
| 0:20–0:32 | 02 · Abaixo da linha | No que cada pessoa entende. No que ela acredita. No que tem medo de perder. Nos hábitos de anos. Na confiança em quem lidera. | Cinco fatores invisíveis, um por vez: Sentido, Crenças, Perdas, Hábitos, Confiança. |
| 0:32–0:41 | 03 · Onde o projeto bate | É nesse gelo invisível que os projetos batem. O sistema entra no ar, e as pessoas voltam para a planilha. | O barco bate no gelo raso, a bandeira vira "NO AR" e os pontos de luz pulam para três planilhas que boiam. |
| 0:41–0:52 | 04 · Como a gente trabalha | Gestão da mudança é mergulhar. Primeiro, a gente mapeia o gelo: quem é impactado, o que muda para cada um, onde está a resistência. | Uma sonda desce e solta pulsos; nascem os pontos dos impactados, eles ganham tamanho e um alvo marca o pedaço mais duro. |
| 0:52–1:10 | 04 · Como a gente trabalha | Depois, quebra esse gelo em partes. Com sentido: o porquê, na voz de quem lidera. Com prática: as pessoas aprendendo no trabalho real. E com medida: o uso de verdade, semana a semana. | Três golpes racham o bloco: um feixe de luz vindo de cima, pontos que tocam o gelo em volta e uma régua que sobe. |
| 1:10–1:20 | 05 · O gelo vira caminho | Pedaço por pedaço, o que travava o projeto vira caminho. E a adoção deixa de ser promessa: vira rotina. | Os pedaços sobem e se alinham na superfície; o barco segue viagem; os pontos atravessam até a bandeira "ROTINA"; a curva de adoção sobe na tela. |
| 1:20–1:28 | Fecho | Isso é gestão da mudança além do raso. | Assinatura: "Gestão da mudança, além do raso." e "Victor Vitorino · Change Management Advisor". |

Os números e exemplos são ilustrativos (a tela da curva de adoção traz o selo "ilustrativo").

## Como o filme é feito

Mesmo motor dos outros vídeos do repositório (`animacao/`): cada quadro é um SVG calculado a partir do tempo, fotografado no Chromium e montado com o ffmpeg.

```
cd animacao
python3 producao/raso_audio.py                 # corta a fala, monta trilha e efeitos -> build/raso/trilha.wav e src/raso/tempos.json
node render.mjs frames --page raso.html --w 1920 --h 1080 --test filme --out build/raso/frames --workers 3   # 2.641 quadros
node producao/raso_interativo.mjs              # exporta tempos e posições -> ../blog/_src/content/video-tempos.json
bash producao/raso_final.sh                    # MP4 1080p e 720p + capa -> ../blog/assets/video/
node ../blog/_src/build.mjs                    # grava as legendas (VTT) e monta a página inicial
```

Para ver o filme no navegador, com som: sirva a pasta `animacao/` e abra `raso.html`.
Para conferir quadros soltos: `node render.mjs stills --page raso.html --w 1920 --h 1080 --test filme --t 6,36,61 --out build/raso/stills`.

| Onde | O quê |
|---|---|
| `animacao/src/raso/base.js` | Paleta, tipografia, curvas de movimento e ícones. |
| `animacao/src/raso/mundo.js` | O mundo: sala, cidade, água, iceberg em oito pedaços, rachaduras, barco, planilhas, ponto de luz, sonda. |
| `animacao/src/raso/filme.js` | As cenas, a câmera, os textos e a exportação para o player (`interativo()`). |
| `animacao/producao/raso_audio.py` | Roteiro em unidades de fala, respiros, marcas de palavra, legendas, capítulos, música e efeitos. |
| `animacao/src/raso/tempos.json` | Tempos calculados pelo áudio (o filme lê deste arquivo). |

Regras que valem para qualquer mudança:

- **Sem personagens.** Pessoas são pontos de luz; cadeiras ficam vazias; ícones não têm figura humana.
- Só dois azuis e um cinza, os mesmos do site.
- Se o texto da narração mudar, gere a fala de novo e ajuste `UNIDADES`, `MARCAS` e `LEGENDAS` em `raso_audio.py`.
- Se a posição de um rótulo mudar no filme, rode `raso_interativo.mjs` de novo: os pontos clicáveis do site saem do filme.

## Som

Fala sempre à frente: os efeitos ficam em uma faixa própria, que recua quando há voz (a voz fica pelo menos 9 dB acima do fundo em todas as frases).
Trilha sintetizada em lá menor que abre em dó maior no fim, a 80 bpm. Volume final normalizado em −16 LUFS.

## A camada interativa (no site)

Fica em `blog/_src/lib/video.mjs` (marcação), `blog/assets/js/video.js` (comportamento) e `blog/assets/css/video.css` (estilo).
O filme é um MP4 comum; a página desenha por cima dele.

- **Capítulos:** cinco botões abaixo do vídeo e marcas na barra de posição.
- **Pontos clicáveis (11):** os cinco fatores, os três itens do mapa e os três golpes. Clicar pausa o filme e abre um cartão com o tema, o que a gente faz e um link do blog. A lista "Explore os 11 pontos" abre os mesmos cartões e marca os já vistos.
- **Sua vez:** aos 0:55 o filme para e pede um toque no gelo. Quem não tocar em 9 s segue junto.
- **Quadro final:** "Qual é o seu iceberg?", com os três fluxos de Serviços (Adoção de IA, ERP, Governança), a conversa por WhatsApp e "Ver de novo".
- **Teclado:** espaço ou K (tocar e pausar), setas (5 s), Home (começo), M (som), C (legendas), F (tela cheia), Esc (fecha o cartão).
- **Sem JavaScript:** o vídeo toca com os controles do navegador e a faixa de legendas; a transcrição e os pontos ficam em texto.

Para mudar os textos dos cartões e do quadro final, edite `blog/_src/content/video.json` e rode o build.

## O que foi conferido e o que não foi

- Conferido: os dois MP4 decodificam do começo ao fim (2.641 quadros), têm início rápido e som em −16,8 LUFS; a camada interativa passou por 97 verificações automáticas em tela larga, celular, teclado, sem JavaScript e com movimento reduzido.
- O navegador dos testes não toca H.264. Por isso os testes de reprodução usaram uma cópia WebM do mesmo filme; o MP4 foi conferido pelo ffmpeg, não tocado em um navegador.
- A narração foi escolhida pela transcrição (texto completo e ritmo), não de ouvido. Vale ouvir uma vez e pedir outra tomada se a entonação não agradar.
- Os textos dos cartões são uma primeira versão e podem ser ajustados em `video.json`.
