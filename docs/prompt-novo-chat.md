# Prompt de partida — vídeo "Projeto do Ano FY26" (A&M + TOTVS)

> **Atualização (out/2026):** o trabalho mais recente é a reconstrução do vídeo azul v18 → **v19** (`animacao/src/azul/*`), descrita em `docs/video-azul-v19.md`. O briefing abaixo é do filme chibi anterior.

> Copie tudo abaixo da linha e cole como primeira mensagem do novo chat. (Este arquivo também está no repositório, em `docs/prompt-novo-chat.md`.)

---

Você vai assumir a produção de um vídeo corporativo animado que já tem uma versão completa pronta. Leia este briefing, localize o repositório, confirme que entendeu o estado atual e **aguarde minhas novas solicitações antes de produzir ou alterar qualquer coisa**. Quando eu mandar as solicitações, vou dizer se vamos reaproveitar o que existe ou recomeçar do zero.

## 1. Onde está tudo

- **Repositório GitHub:** `https://github.com/VictorVitorino/finaldoanovideo`
- **Branch com o trabalho atual:** `claude/gifted-shannon-ggw2mm`, sincronizada com `origin`. Histórico recente (do mais antigo ao mais novo): `352597b` primeira versão SpecForge → `9ad8b08` roteiro novo de 7 cenas + três gags → `b515ad2` gesto do cabelo sem a mão + imagens sempre presentes → `a3b23c7` folha padronizada de Quintão/Sampaio/Paladini → o(s) commit(s) que trouxeram e atualizaram este briefing. Confira com `git log --oneline -6`. Não faça push em outra branch sem eu pedir.
- **Pasta do projeto:** `animacao/` (na sessão anterior o clone ficava em `/home/user/finaldoanovideo`; no seu ambiente o caminho pode ser outro). Se o repositório não estiver no seu ambiente, peça para eu conectá-lo; não tente adivinhar outro caminho.
- **Leia primeiro:**
  - `docs/filme-specforge.md` — análise do roteiro, cena a cena, as três gags, como rodar, pendências.
  - `docs/roteiro-fy26.md` — o roteiro atual (7 cenas): fonte de todos os textos e números.
  - `docs/prompt-novo-chat.md` — este briefing.
- **Histórico, não é o filme atual (ignore para produção):**
  - `docs/roteiro-storyboard-ae-srt.md` e `docs/analise-roteiro-projeto-do-ano.md`: versões anteriores do roteiro.
  - `animacao/README.md`: a primeira versão, 2D desenhada por código (`src/film.js`, `roteiro.js`, `hud.js`, `scenery.js`, `chars.js`, `people.js`, `producao.js`, `teste15.js`, `teste30.js`). `node render.mjs cues|encode` e `node render.mjs frames` **sem** `--test filme` operam esse filme antigo (`src/main.js` cai em `./film.js`).
  - `animacao/producao/README.md`, `PROMPTS.md`, `PERSONAGENS.md`, `prompts.py`, `pacote.json`, `montar.py`, `clipes/`: pipeline abandonado de clipes 3D gerados por IA.
  - `producao/teste15.py`, `teste30.py`, `poc_2d5.py`, `recortar_folha.py`, `elenco_fotos.json`: testes anteriores (`motor30.py` nasceu no teste de 30 s, mas é o motor em uso). `animacao/build/cues.json` está no git por exceção do `.gitignore` (versão antiga): não regenerar.
- **O que importa:** `animacao/src/sf/*`, `src/testes/*`, `src/core.js`, `src/assets.js`, `src/main.js`, `index.html`, `render.mjs`, `producao/{filme,direcao_filme,vozes_filme,trilha_filme,recortar_filme,motor30}.py`, `producao/{marcos_filme,elenco_filme}.json`, `audio/gerar_trilha.py` (usado só como biblioteca), `assets/logos/*.png`.

## 2. O que é o vídeo

Vídeo de premiação interno "Projeto do Ano — Parceria A&M + TOTVS", divertido, no estilo do explainer do SpecForge: papel creme com grade, props chapados com contorno escuro, blobs de cor, legendas "karaokê" em pílula, pílula de capítulo, régua de progresso, cartões de fase, adesivos e carimbos, "anime action" (linhas de velocidade, impactos, record scratch). Personagens são recortes de folhas chibi 3D (feitas a partir das fotos do time) com micro-atuação 2,5D. Narração em português, música e efeitos sintetizados.

Roteiro FY26 em 7 cenas: (1) portfólio TOTVS em 10 cartelas sem fala; (2) o desafio — GO-LIVE ADIADO; (3) a parceria e a liderança; (4) seis projetos (Unimed Brasil, FUNED, CAOA, John Deere Argentina, Hughes, Libercon); (5) framework integrado, cockpit executivo, ferramenta de testes com IA; (6) P&L (+R$ 16 MM em collections: R$ 7 MM FY26 + R$ 9 MM FY27; 12 meses; cross-sell) e a operação das notas fiscais; (7) fechamento ("UM TIME. METODOLOGIAS INTEGRADAS. VALOR SUSTENTÁVEL. E NÃO PARA POR AÍ.").

## 3. O que já foi feito (estado atual)

**Arquitetura (tudo gerado por código, sem software de animação):**
- Três camadas com a mesma câmera: `fundo` (SVG no Chromium: papel, blobs, props, slides), `atores` (Python: recortes com micro-atuação via `producao/motor30.py`) e `overlay` (SVG: gráficos, legendas, chrome). Composição com ffmpeg.
- `animacao/src/sf/`: `ambiente.js` (papel, blobs, régua, pílulas, legendas, cartões de fase, transições), `graficos.js` (adesivos, carimbos, cartões, balões, contadores, número herói, telefonema, missão, efeitos), `props.js` (crise, escritório, os 6 lugares, slides provisórios, robôs, painel), `gags.js` (botão de go-live, calendário fugitivo, monitor fumegante, gesto do cabelo, envelope, lasers, cabo, gota, alarme, cofre, NF gigante, obstáculos, cartelas do portfólio, tiles, barra de meses, portas, pipeline), `telas.js` (slides reais e laptop), `filme.js` (o filme, plano a plano). Entrada: `src/testes/filme.js` via `index.html?test=filme&layer=fundo|overlay`. Pranchas por componente: `src/testes/{ambiente,gags,graficos,props,telas}.js`.
- `animacao/producao/`: `filme.py` (`tempo` → `build/filme/timeline.json`; `rastro` → `track.json`; `quadros` → fundo + personagens; `montar` → MP4), `direcao_filme.py` (direção dos personagens, uma função por plano), `vozes_filme.py` (36 falas, TTS offline), `trilha_filme.py` (música + efeitos + vozes com ducking), `recortar_filme.py` (folhas → recortes + marcos), `motor30.py` (motor 2,5D), `marcos_filme.json` (marcos dos recortes), `elenco_filme.json` (quem é quem).
- Logos e slides entram no SVG como `data:` URL (`src/assets.js: dataUrl`); referenciados por arquivo, uma parte dos quadros saía sem a imagem.

**Vocabulário do código:**
- **chrome** = moldura fixa da tela: pílula com o lockup "A&M | TOTVS" (`ambiente.js: marca`), régua de progresso (`regua`) e pílula de capítulo (`pilulaCapitulo`; títulos em `filme.js: CAPITULO`). Só aparece em `p.cena > 1`, com `tom !== 'noite'` e fora dos planos `2f`, `*fase`, `7e`, `7f` (`filme.js: chromeOn`).
- **marcas** = dicionário de instantes absolutos por plano (ex.: `{'aperta': t0+1.0, 'foge': t0+1.45, ...}`) definido em `producao/filme.py cmd_tempo` e salvo em `timeline.json`. É a única fonte de sincronia: `direcao_filme.py` (atores), `src/sf/filme.js` (fundo/overlay) e os efeitos sonoros leem as mesmas chaves. Para mover um evento, mude a marca em `filme.py` e rode `tempo` + `rastro` de novo.
- **tom** do plano (`creme`, `noite`, `dourado`, …) troca papel e paleta; **id** do plano = `<cena><letra>` (ex.: `1t`, `2e`, `7f`), o mesmo em `filme.py`, `direcao_filme.py` e `filme.js`.
- **grupos** de recorte = `pessoas` (foto1..foto13), `mascotes` (modulo, cronos, cuidado, frasco, acelerado, campo, conectado, obrinha), `trio` (quintao, sampaio, paladini).

**Personagens (todos confirmados):** Foto 1 Bruno Moraes, 2 Giovanna Brandão, 3 Guilherme Antonialli, 4 Jaqueline Valdevino, 5 João Lopes, 6 Marcus Mancini, 7 Monica Audrey, 8 Nara Martins, 9 Pedro Lanzetta, 10 Marcos Massao Iwata, 11 José Aires, 12 Thauany Moreira, 13 Vinicius de Sousa (folha `time13.png`); 8 mascotes (`mascotes8.png`): Módulo/TOTVS, Cronos/A&M, Dra. Cuidado/Unimed, Dr. Frasco/FUNED, Acelerado/CAOA, Tio Campo/John Deere, Conectado/Hughes, Obrinha/Libercon; Fabio Quintão, Sampaio e Nathalia Paladini (folha padronizada `trio_novo.png`, sem o cordão de ouro). Mapa em `producao/elenco_filme.json` (nunca alterar sem minha confirmação).

**Vozes:** sherpa-onnx + Supertonic 3 (int8); voz e velocidade por personagem em `VOZES` (Narrador, Antonialli, Bruno, Giovanna, Nathalia Paladini); pronúncia conferida por reconhecimento de fala (Parakeet TDT) com melhor-de-N para as falas com palavras de marca (`ESPERADO`). Pronúncias: TOTVS = "Tótus", A&M = "Á i Ême", IA = "I, A" (constantes em `vozes_filme.py`); ERP escrito "E, R, P" direto no texto falado; outras grafias fonéticas inline ("pê e éle", "éfe uai vinte e seis", "ene éfes").

**Trilha:** sintetizada (`audio/gerar_trilha.py` reaproveitado por `producao/trilha_filme.py`), estilo por trecho (`ESTILO`: abertura triunfal, riff de espionagem na missão…), música abaixa 9 dB sob as falas, efeitos sincronizados às marcas.

**Linha do tempo:** 246,8 s (4:07), 63 planos, 36 falas; cortes nos tempos do BPM 112.

**As três gags pedidas (implementadas):**
1. GO-LIVE ADIADO físico: Bruno pula no botão, a página do calendário cria olhos e pernas e foge, o monitor solta fumaça ("ERRO") e Bruno tenta segurá-lo suando; Antonialli entra em pânico e se recompõe.
2. Operação NF em missão impossível: envelope "MISSÃO ULTRASSECRETA" que se autodestrói, Bruno agente especial, rapel na sala de controle entre lasers, gota de suor cai, "PLIM!", alarme, corte seco para o telefonema; NF gigante pula CONFERÊNCIA, APROVAÇÃO e o abismo FIM DO ANO FISCAL até o portal FY26, carimbo ANTECIPADA; cartão "Operação Collection Zero Defect".
3. Piada recorrente: a cada problema Antonialli "ajeita o cabelo" — cabeça inclina, brilho varre o cabelo, "ting" e adesivo "ajeita o cabelo ✦" (sem mão desenhada por cima do rosto: a primeira versão parecia uma mão solta na testa). No final, "Mas pagou a NF?" → gesto, silêncio, corte seco.

**Feedback já aplicado (não voltar atrás):** legendas em uma linha e menores; logo TOTVS azul forte, lockup "A&M | TOTVS" fixo numa pílula no canto superior esquerdo, sem sobrepor o cartão do projeto; claquete "AÇÃO!" + fita de filme nas cenas de crise; Módulo "bad boy" de óculos escuros na capa da parceria; Antonialli à frente do time como líder; capa "Onde tudo começou"; cordão de ouro removido; Nathalia Paladini incluída; logos novos de FUNED, John Deere e Libercon (vieram em 120 px e foram ampliados).

**Última entrega:** `animacao/build/filme/projeto-do-ano-specforge.mp4` — 4:07, 1920×1080, 30 fps, 26,1 MB (crf 28), varredura final sem quadros com imagens faltando. O MP4 não está no git: fica em `build/` e foi entregue anexado no chat.

## 4. O que NÃO está no git

Tudo que é pessoal ou pesado fica em `animacao/build/` (ignorado pelo git) e **nunca deve ser commitado**: fotos, folhas de personagens, recortes, vozes, slides, modelos.

**Eu reenvio (nomes e tamanhos exatos que o pipeline espera, em `animacao/build/filme/`):**
- `folhas/time13.png` 1448×1086 (13 pessoas em 2 linhas: 7 + 6)
- `folhas/mascotes8.png` 1672×941 (8 mascotes em 2 linhas de 4)
- `folhas/trio_novo.png` 1448×1086 (Quintão, Sampaio, Paladini em 3 colunas)
- `slides/visao-integrada.png`, `slides/cockpit.png`, `slides/testes.png` 2500×1406; `slides/cockpit-tela1.png` e `slides/cockpit-tela2.png` 693×444 (`src/sf/telas.js: NOMES, TAM`)

São os mesmos arquivos da sessão anterior: as células de recorte (`recortar_filme.py: FOLHA`), as correções à mão (`AJUSTE`), os pivôs dos braços dos mascotes (`BRACO_FOLHA`) e `producao/marcos_filme.json` (no git) estão em pixels dessas folhas. Depois de recortar, `git diff producao/marcos_filme.json` deve ficar vazio; se mudar, a folha não é a mesma. Se eu mandar folhas novas (recomeço do zero), as células, `AJUSTE` e `BRACO_FOLHA` precisam ser medidos de novo e os marcos regenerados. Sem os slides o render **não falha**: `telas.js carregar()` só avisa no console e a moldura sai vazia — confira `ls build/filme/slides` antes de renderizar. Se eu colar uma imagem na conversa em vez de anexar o arquivo, ela pode não chegar ao disco: me avise para reenviar como arquivo.

**Você baixa (nenhum script baixa estes dois):**
```bash
mkdir -p animacao/build/modelos && cd animacao/build/modelos
# IS-Net (recorte das folhas), 179 MB — release do rembg
curl -L -o isnet-general-use.onnx https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx
# Parakeet TDT 0.6b v3 int8 (ASR que confere a pronúncia; vozes_filme.py usa mesmo sem --conferir), 487 MB
curl -L -O https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2
tar xjf sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2
```
O Supertonic 3 (TTS, 129 MB) é baixado sozinho por `vozes_filme.py` (`baixar()`, release `tts-models` do sherpa-onnx). Outros modelos que havia em `build/modelos/` (BiRefNet, isnet-anime, kokoro, whisper) foram experimentos e não são usados.

**Regeneráveis:** vozes (`build/filme/vozes/*.wav` + `vozes.json`) com `vozes_filme.py`; recortes (`build/filme/corte/`) com `recortar_filme.py` a partir das folhas (as máscaras do IS-Net ficam em cache em `build/filme/corte/_ml/*.npy`; apague para forçar). Os logos oficiais estão no git em `animacao/assets/logos/` (nomes em `src/assets.js: LOGO_NAMES`).

## 5. Preparar o ambiente e rodar

**Preparar (uma vez):**
```bash
cd animacao
npm install                                   # só as fontes Outfit e DM Sans (sem isso o texto cai em fonte do sistema sem avisar)
node -e "import('playwright').then(()=>console.log('ok'))" || npm install playwright@1.56.1 && npx playwright install chromium
#   render.mjs tenta import('playwright') e, se falhar, o Playwright global em /opt/node22/lib/node_modules; Chromium via PLAYWRIGHT_BROWSERS_PATH
pip install numpy opencv-python-headless pillow onnxruntime sherpa-onnx scipy jiwer soundfile
ffmpeg -version && node --version              # usados: ffmpeg 6, Node 22, Python 3.13
```
Sessão anterior: 4 CPUs, 15 GB de RAM, sem GPU (onnxruntime em CPU); HuggingFace bloqueado, PyPI, npm e releases do GitHub funcionam. Um render completo gera ~5,3 GB em `build/filme/` (fundo 2,1 GB + base 2,4 GB + overlay 0,7 GB; 7405 quadros por camada) e os modelos necessários somam ~0,8 GB: reserve ≥ 8 GB de disco.

**Pipeline (a ordem não é opcional):**
```bash
cd animacao
python3 producao/recortar_filme.py                  # [etapas] [grupos]; padrão: mascaras,corte,marcos,movimento para pessoas,mascotes,trio
python3 producao/recortar_filme.py mascaras,corte,marcos trio   # só um grupo: 1º argumento = etapas, 2º = grupos
python3 producao/vozes_filme.py                     # 36 falas (TTS offline); --so c5_n6,c5_n7 refaz só essas; --conferir transcreve de volta
python3 producao/filme.py tempo                     # planos, falas e efeitos -> build/filme/timeline.json (lê a duração de cada WAV em vozes.json)
python3 producao/filme.py rastro                    # câmera e personagens por quadro -> track.json (precisa de timeline + marcos_filme.json)
node render.mjs frames --test filme --layer fundo   --out build/filme/fundo   --workers 4
python3 producao/filme.py quadros --workers 4       # fundo + personagens -> build/filme/base (precisa de track.json, recortes e do fundo)
node render.mjs frames --test filme --layer overlay --out build/filme/overlay --workers 4
python3 producao/trilha_filme.py                    # música + efeitos + vozes -> build/filme/mix.wav
python3 producao/filme.py montar --crf 28           # base + overlay + mix -> build/filme/projeto-do-ano-specforge.mp4 (padrão crf 22; 28 fica < 30 MB)
```
Tempos com 4 CPUs: fundo ~12 min, personagens ~4, overlay ~5, trilha 1, montagem ~5 (≈ 30 min). O render de quadros pula arquivos que já existem: apague `build/filme/{fundo,base,overlay}` depois de mudar algo. Numeração dos quadros: `fNNNNN` com N = round(t × 30).

**Conferir um plano sem renderizar tudo** (ex.: t = 12.5 s → quadro 375):
```bash
cd animacao; T=12.5; N=$(python3 -c "print(round($T*30))"); F=$(printf f%05d $N)
node render.mjs frames --test filme --layer fundo   --out build/filme/fundo   --from $N --to $((N+1))
python3 producao/filme.py quadros --so $T                        # personagens sobre o fundo -> build/filme/base/$F.jpg
node render.mjs frames --test filme --layer overlay --out build/filme/overlay --from $N --to $((N+1))
mkdir -p build/filme/amostras && ffmpeg -y -v error -i build/filme/base/$F.jpg -i build/filme/overlay/$F.png -filter_complex overlay -frames:v 1 build/filme/amostras/a_$T.jpg
```
`node render.mjs stills --test filme --layer fundo|overlay --t 12.5,40` mostra uma camada isolada (sai em `build/stills/filme_<t>.jpg|png`, nome por tempo; não alimenta o `quadros --so`, que sem o quadro de fundo compõe sobre cinza chapado). Pranchas por componente: `--test ambiente|gags|graficos|props|telas` (ex.: `--test "gags&pg=3"`; ver o cabeçalho de cada `src/testes/*.js`). Para assistir no navegador: `npx serve .` e abrir `index.html?test=filme&layer=fundo`.

**Onde mudar o quê:**

| Quero mudar… | Arquivo |
|---|---|
| Texto de uma fala, quem fala, grafia fonética, voz/velocidade | `producao/vozes_filme.py` (`FALAS`, `VOZES`, `ESPERADO`) → `vozes_filme.py --so <ids>` e depois `filme.py tempo` + `rastro` |
| Duração/ordem dos planos, marcas de sincronia, efeitos sonoros, estilo musical por trecho | `producao/filme.py` (`cmd_tempo`, `PROJETOS`, `PORTFOLIO`) |
| Quem entra, posição, pulos, reações dos personagens | `producao/direcao_filme.py` (uma função por plano; `NOMES`, `CORES`, `PLANOS`) |
| Papel, blobs, régua, pílulas, legenda (tam 30, uma linha), cartões de fase, transições | `src/sf/ambiente.js` |
| Palavras que acendem na legenda, cor por falante, títulos de capítulo | `src/sf/filme.js` (`DESTAQUE`, `COR_FALA`, `CAPITULO`) |
| O que aparece em cada plano no fundo e no overlay | `src/sf/filme.js` (`fundo(t)` / `overlay(t)`, por `id`) |
| Props, gags, grafismos, slides reais | `src/sf/props.js`, `gags.js`, `graficos.js`, `telas.js` |
| Cores base e utilitários de texto; fontes | `src/core.js`; `index.html` |
| Música/instrumentos | `audio/gerar_trilha.py` (biblioteca) e `producao/trilha_filme.py` (`ESTILO`, efeitos) |
| Logos | `assets/logos/<nome>.png` |
| Quem é quem | `producao/elenco_filme.json` (só com minha confirmação) |

## 6. Convenções e decisões já tomadas

- Todos os números e textos vêm do roteiro (`docs/roteiro-fy26.md`); nada inventado.
- Pronúncias: "Tótus", "E, R, P", "Á i Ême", "I, A".
- Legendas em uma linha, menores que o padrão do SpecForge; palavras entre `*asteriscos*` acendem.
- Não identificar nome ou gênero de ninguém pelas fotos: o mapa Foto → nome foi confirmado por mim e está em `elenco_filme.json`.
- Nenhuma mão ou membro desenhado por cima do rosto dos recortes.
- Commits claros em português; nunca subir fotos, folhas, recortes, vozes, slides ou modelos (ficam em `build/`, ignorado).

## 7. Pendências e pontos a validar

1. **Duração:** 4:07 contra a meta de 2:55 do roteiro. As 36 falas somam 2:03 (só o narrador, 1:49) e a cena 1 tem 22 s sem fala. Sem cortar texto dá para chegar a ~3:50 (tirar cartões de fase, a esteira de cenas e encurtar rapel/corrida da NF); abaixo disso é preciso cortar falas ou acelerar vozes.
2. **Slides provisórios:** metodologia, MITs, remediação e IA são desenhos sem dados; os reais que vieram (visão integrada, cockpit, testes) já estão no filme. A gravação de tela do Xray não veio.
3. **Logos** de FUNED, John Deere e Libercon vieram em 120 px e estão ampliados (levemente suaves em tela grande).
4. **Vozes** são TTS; para a versão final, gravar com pessoas ou vozes aprovadas.
5. **Humor:** as três gags e o adesivo "ajeita o cabelo" aguardam aprovação final.

## 8. Como quero trabalhar

- Primeiro pense, analise e entenda as mudanças; depois crie o código.
- Antes de renderizar o filme inteiro, mostre stills ou pranchas das cenas alteradas (receita na seção 5).
- Entregue o MP4 (≤ 30 MB, o limite do chat nos dois sentidos) **anexando o arquivo na conversa** — ele fica em `animacao/build/filme/` e nunca entra no git. Commite só código, docs e os JSON de `producao/`, e faça push na branch indicada.
- Trabalhe em português.

**Agora:**
1. Localize o repositório (URL e branch acima); se não estiver no seu ambiente, peça para eu conectá-lo. Confirme branch e HEAD (`git log --oneline -6`).
2. Leia `docs/filme-specforge.md` e `docs/roteiro-fy26.md`.
3. Rode `ls animacao/build/filme/folhas animacao/build/filme/slides animacao/build/modelos` e me diga exatamente quais dos 8 arquivos da seção 4 faltam e se os dois modelos (IS-Net, Parakeet) e as dependências estão instalados.
4. Resuma o estado atual em poucas linhas.

Você pode instalar dependências e baixar modelos sem perguntar (não altera o filme nem o repositório). **Não renderize, não gere vozes, não altere código e não commite nada até eu mandar as solicitações.**
