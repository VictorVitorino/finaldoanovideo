# Prompt de partida — vídeo "Projeto do Ano FY26" (A&M + TOTVS)

> Copie tudo abaixo desta linha e cole como primeira mensagem do novo chat.

---

Você vai assumir a produção de um vídeo corporativo animado que já tem uma versão completa pronta. Leia este briefing, localize o repositório, confirme que entendeu o estado atual e **aguarde minhas novas solicitações antes de produzir ou alterar qualquer coisa**. Quando eu mandar as solicitações, vou dizer se vamos reaproveitar o que existe ou recomeçar do zero.

## 1. Onde está tudo

- **Repositório GitHub:** `VictorVitorino/finaldoanovideo`
- **Branch com o trabalho atual:** `claude/gifted-shannon-ggw2mm` (commits `9ad8b08`, `b515ad2`, `a3b23c7`, sobre `352597b`). Não faça push em outra branch sem eu pedir.
- **Pasta do projeto:** `animacao/` (na sessão anterior o clone ficava em `/home/user/finaldoanovideo`; no seu ambiente o caminho pode ser outro).
- **Documentação para ler primeiro:**
  - `docs/filme-specforge.md` — análise do roteiro, cena a cena, as três gags, como rodar, pendências.
  - `docs/roteiro-fy26.md` — o roteiro atual (7 cenas). É a fonte de todos os textos e números.
  - `docs/prompt-novo-chat.md` — este briefing.
  - `docs/roteiro-storyboard-ae-srt.md` e `docs/analise-roteiro-projeto-do-ano.md` — versões anteriores do roteiro (histórico).
  - `animacao/README.md` — descreve a primeira versão, 2D desenhada por código (`src/film.js`); a versão atual é a "SpecForge" em `animacao/src/sf/` + `animacao/producao/`.

## 2. O que é o vídeo

Vídeo de premiação interno "Projeto do Ano — Parceria A&M + TOTVS", divertido, no estilo do explainer do SpecForge: papel creme com grade, props chapados com contorno escuro, blobs de cor, legendas "karaokê" em pílula, pílula de capítulo, régua de progresso, cartões de fase, adesivos e carimbos, "anime action" (linhas de velocidade, impactos, record scratch). Personagens são recortes de folhas chibi 3D (fotos do time) com micro-atuação 2,5D. Narração em português, música e efeitos sintetizados.

Roteiro FY26 em 7 cenas: (1) portfólio TOTVS em 10 cartelas sem fala; (2) o desafio — GO-LIVE ADIADO; (3) a parceria e a liderança; (4) seis projetos (Unimed Brasil, FUNED, CAOA, John Deere Argentina, Hughes, Libercon); (5) framework integrado, cockpit executivo, ferramenta de testes com IA; (6) P&L (+R$ 16 MM em collections: R$ 7 MM FY26 + R$ 9 MM FY27; 12 meses; cross-sell) e a operação das notas fiscais; (7) fechamento ("UM TIME. METODOLOGIAS INTEGRADAS. VALOR SUSTENTÁVEL. E NÃO PARA POR AÍ.").

## 3. O que já foi feito (estado atual)

**Arquitetura (tudo gerado por código, sem software de animação):**
- Três camadas com a mesma câmera: `fundo` (SVG no Chromium: papel, blobs, props, slides), `atores` (Python: recortes com micro-atuação via `producao/motor30.py`) e `overlay` (SVG: gráficos, legendas, chrome). Composição com ffmpeg.
- `animacao/src/sf/`: `ambiente.js` (papel, blobs, régua, pílulas, legendas, cartões de fase, transições), `graficos.js` (adesivos, carimbos, cartões, balões, contadores, número herói, telefonema, missão, efeitos), `props.js` (crise, escritório, os 6 lugares, slides provisórios, robôs, painel), `gags.js` (botão de go-live, calendário fugitivo, monitor fumegante, gesto do cabelo, envelope, lasers, cabo, gota, alarme, cofre, NF gigante, obstáculos, cartelas do portfólio, tiles, barra de meses, portas, pipeline), `telas.js` (slides reais e laptop), `filme.js` (o filme, plano a plano). Entrada: `src/testes/filme.js` via `index.html?test=filme&layer=fundo|overlay`.
- `animacao/producao/`: `filme.py` (`tempo` → `build/filme/timeline.json`; `rastro` → `track.json`; `quadros` → fundo + personagens; `montar` → MP4), `direcao_filme.py` (direção dos personagens por plano), `vozes_filme.py` (36 falas, TTS offline), `trilha_filme.py` (música + efeitos + vozes com ducking), `recortar_filme.py` (folhas → recortes + marcos), `motor30.py` (motor 2,5D), `marcos_filme.json`, `elenco_filme.json`.
- Logos e slides entram no SVG como `data:` URL (`src/assets.js: dataUrl`) — por arquivo, 5–9 % dos quadros saíam sem imagem.

**Personagens (todos confirmados):** Foto 1 Bruno Moraes, 2 Giovanna Brandão, 3 Guilherme Antonialli, 4 Jaqueline Valdevino, 5 João Lopes, 6 Marcus Mancini, 7 Monica Audrey, 8 Nara Martins, 9 Pedro Lanzetta, 10 Marcos Massao Iwata, 11 José Aires, 12 Thauany Moreira, 13 Vinicius de Sousa (folha `time13.png`); 8 mascotes (`mascotes8.png`: Módulo/TOTVS, Cronos/A&M, Dra. Cuidado/Unimed, Frasco/FUNED, Acelerado/CAOA, Tio Campo/John Deere, Conectado/Hughes, Obrinha/Libercon); Fabio Quintão, Sampaio e Nathalia Paladini (folha padronizada `trio_novo.png`, sem o cordão de ouro). Mapa em `producao/elenco_filme.json`.

**Vozes:** sherpa-onnx + Supertonic 3 (int8), vozes por personagem em `VOZES` (Narrador, Antonialli, Bruno, Giovanna, Nathalia Paladini); pronúncia conferida por reconhecimento de fala (Parakeet TDT) com melhor-de-N para palavras de marca. Convenções: TOTVS = "Tótus", ERP = "E, R, P", A&M = "Á i Ême", IA = "I, A".

**Trilha:** sintetizada (`audio/gerar_trilha.py` reaproveitado por `producao/trilha_filme.py`), estilos por trecho (abertura triunfal, riff de espionagem na missão), música abaixa 9 dB sob as falas, efeitos sincronizados às marcas de cada plano.

**Linha do tempo:** 246,8 s (4:07), 63 planos, 36 falas; cortes nos tempos do BPM 112; marcas por plano consumidas pela direção, pelo overlay e pelos efeitos.

**As três gags pedidas (implementadas):**
1. GO-LIVE ADIADO físico: Bruno pula no botão, a página do calendário cria olhos e pernas e foge, o monitor solta fumaça ("ERRO") e Bruno tenta segurá-lo suando; Antonialli entra em pânico e se recompõe.
2. Operação NF em missão impossível: envelope "MISSÃO ULTRASSECRETA" que se autodestrói, Bruno agente especial, rapel na sala de controle entre lasers, gota de suor cai, "PLIM!", alarme, corte seco para o telefonema; NF gigante pula CONFERÊNCIA, APROVAÇÃO e o abismo FIM DO ANO FISCAL até o portal FY26, carimbo ANTECIPADA; "Operação Collection Zero Defect".
3. Piada recorrente: a cada problema Antonialli "ajeita o cabelo" — cabeça inclina, brilho varre o cabelo, "ting" e adesivo "ajeita o cabelo ✦" (sem mão desenhada por cima do rosto: parecia uma mão solta na testa). No final, "Mas pagou a NF?" → gesto, silêncio, corte seco.

**Feedback já aplicado (não voltar atrás):** legendas em uma linha e menores; logo TOTVS azul forte, lockup "A&M | TOTVS" fixo numa pílula no canto superior esquerdo, sem sobrepor o cartão do projeto; claquete "AÇÃO!" + fita de filme nas cenas de crise; Módulo "bad boy" de óculos escuros na capa da parceria; Antonialli à frente do time como líder; capa "Onde tudo começou"; cordão de ouro removido; Nathalia Paladini incluída; logos novos de FUNED, John Deere e Libercon (ampliados a partir de 120 px).

**Última entrega:** `animacao/build/filme/projeto-do-ano-specforge.mp4` — 4:07, 1920×1080, 30 fps, 26 MB (crf 28). Varredura final sem quadros com imagens faltando.

## 4. O que NÃO está no git (vou reenviar quando você pedir)

Tudo que é pessoal ou pesado fica em `animacao/build/` (ignorado pelo git) e **nunca deve ser commitado**: fotos, folhas de personagens, recortes, vozes, slides.

- Folhas: `build/filme/folhas/time13.png`, `mascotes8.png`, `trio_novo.png` (as três que o pipeline usa hoje).
- Slides reais: `build/filme/slides/visao-integrada.png`, `cockpit.png`, `cockpit-tela1.png`, `cockpit-tela2.png`, `testes.png`.
- Vozes (`build/filme/vozes/*.wav` + `vozes.json`): regeneráveis com `vozes_filme.py`; os modelos TTS/ASR são baixados pelo script dos releases do sherpa-onnx no GitHub.
- Recortes (`build/filme/corte/`) e máscaras: regeneráveis com `recortar_filme.py` a partir das folhas; precisa do modelo `build/modelos/isnet-general-use.onnx` (IS-Net, do projeto rembg/DIS). `producao/marcos_filme.json` (marcos dos recortes) está no git.
- Os logos oficiais estão no git em `animacao/assets/logos/`.

Peça o que faltar e eu mando. Se eu colar uma imagem na conversa em vez de anexar o arquivo, ela pode não chegar ao disco: me avise para reenviar como arquivo.

## 5. Como rodar

```bash
cd animacao
npm install                                         # fontes; Chromium do Playwright já instalado no ambiente
python3 producao/recortar_filme.py                  # folhas -> recortes + marcos (grupos: pessoas, mascotes, trio)
python3 producao/vozes_filme.py                     # 36 falas (TTS offline); --so id1,id2 refaz só algumas; --conferir transcreve de volta
python3 producao/filme.py tempo                     # planos, falas e efeitos -> build/filme/timeline.json
python3 producao/filme.py rastro                    # câmera e personagens por quadro -> track.json
node render.mjs frames --test filme --layer fundo   --out build/filme/fundo   --workers 4
python3 producao/filme.py quadros --workers 4       # fundo + personagens -> build/filme/base
node render.mjs frames --test filme --layer overlay --out build/filme/overlay --workers 4
python3 producao/trilha_filme.py                    # música + efeitos + vozes
python3 producao/filme.py montar --crf 28           # -> build/filme/projeto-do-ano-specforge.mp4 (~26 MB)
```

Stills para conferir sem renderizar tudo: `node render.mjs stills --test filme --layer fundo|overlay --t 12.5,40.0`; `python3 producao/filme.py quadros --so 12.5,40.0` compõe os personagens só nesses tempos. O render de quadros pula arquivos que já existem — apague `build/filme/{fundo,base,overlay}` depois de mudar algo. Render completo: ~30 min em 4 CPUs (fundo ~12, personagens ~4, overlay ~5, trilha 1, montagem ~5).

Ambiente da sessão anterior: sem GPU; HuggingFace bloqueado (PyPI, npm e releases do GitHub funcionam); Node 22, Playwright + Chromium, Python 3 com numpy, opencv, pillow, onnxruntime, sherpa-onnx; ffmpeg 6. Arquivos enviados para mim: no máximo 30 MB.

## 6. Convenções e decisões já tomadas

- Todos os números e textos vêm do roteiro (`docs/roteiro-fy26.md`); nada inventado.
- Pronúncias: "Tótus", "E, R, P", "Á i Ême", "I, A".
- Legendas em uma linha, menores que o padrão do SpecForge; palavras entre `*asteriscos*` acendem.
- Não identificar nome ou gênero de ninguém pelas fotos: o mapa Foto → nome foi confirmado por mim e está em `elenco_filme.json`.
- Nenhuma mão ou membro desenhado por cima do rosto dos recortes.
- Commits claros em português; nunca subir fotos, folhas, recortes, vozes ou slides; sem identificador de modelo em commits.

## 7. Pendências e pontos a validar

1. **Duração:** 4:07 contra a meta de 2:55 do roteiro. Só a narração tem 2:03 e a cena 1 tem 20 s sem fala. Sem cortar texto dá para chegar a ~3:50 (tirar cartões de fase, a esteira de cenas e encurtar rapel/corrida da NF); abaixo disso é preciso cortar falas ou acelerar vozes.
2. **Slides provisórios:** metodologia, MITs, remediação e IA são desenhos sem dados; os reais que vieram (visão integrada, cockpit, testes) já estão no filme. A gravação de tela do Xray não veio.
3. **Logos** de FUNED, John Deere e Libercon vieram em 120 px e estão ampliados (levemente suaves em tela grande).
4. **Vozes** são TTS; para a versão final, gravar com pessoas ou vozes aprovadas.
5. **Humor:** as três gags e o adesivo "ajeita o cabelo" aguardam aprovação final.

## 8. Como quero trabalhar

- Primeiro pense, analise e entenda as mudanças; depois crie o código.
- Antes de renderizar o filme inteiro, mostre stills ou pranchas das cenas alteradas.
- Entregue o MP4 (≤ 30 MB), commite e faça push na branch indicada.
- Trabalhe em português.

**Agora:** confirme que localizou o repositório, a branch e os documentos, resuma em poucas linhas o estado atual e diga o que falta eu reenviar (folhas, slides). Depois, aguarde minhas solicitações.
