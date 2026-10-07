# Animação — Projeto do Ano (A&M + TOTVS)

Animação 2D do roteiro *Projeto do Ano — Parceria A&M + TOTVS*, no estilo de explainer animado: mascotes simpáticos, cores chapadas, legendas em pílula e transições em diagonal. Tudo é gerado por código, sem software de animação. Cada quadro é um SVG desenhado a partir do tempo, renderizado no Chromium e montado em MP4 com ffmpeg.

- **Duração:** 2:51 (170,9 s), 1920×1080, 30 fps.
- **Áudio:** trilha e efeitos sintetizados (`audio/gerar_trilha.py`). A narração e as falas aparecem como legendas e servem de guia para gravar a locução.

## Onde mudar o quê

| Quero mudar… | Arquivo |
|---|---|
| Textos das falas, durações dos planos, efeitos sonoros | `src/roteiro.js` (`PLANOS`) |
| Valor do FY27 (hoje `R$ [X] MILHÕES`) | `src/roteiro.js` (`VALORES`) |
| Métricas antes/depois de cada projeto (hoje placeholders) | `src/roteiro.js` (`PROJETOS[].antes` / `.depois`) |
| Aparência de cada pessoa do time (cabelo, pele, roupa, óculos) | `src/roteiro.js` (`ELENCO`) |
| Personagens das empresas | `src/roteiro.js` (`EMPRESAS`) e `src/chars.js` |
| O que acontece em cada plano (câmera, cenário, atuação) | `src/film.js` |
| Cenários e objetos | `src/scenery.js` |
| Legendas, selo, capítulo, cartão do projeto | `src/hud.js` |
| Música e efeitos | `audio/gerar_trilha.py` |
| Logos | `assets/logos/*.png` (trocar pelos arquivos oficiais, mesmo nome) |

Palavras entre `*asteriscos*` nas falas saem destacadas em amarelo na legenda.

## Como renderizar

Requer Node 18+, Python 3 com numpy, ffmpeg e o Chromium do Playwright.

```bash
cd animacao
npm install
node render.mjs cues                     # exporta as deixas de som e as legendas (build/cues.json)
python3 audio/gerar_trilha.py            # gera build/trilha.wav
node render.mjs frames --workers 3       # renderiza os quadros em build/frames/
node render.mjs encode                   # monta build/projeto-do-ano.mp4
```

Para ver alguns quadros: `node render.mjs stills --t 12.5,40,121.6`.
Para ver a prancha do elenco: `node render.mjs stills --test lineup --t 0.5`.
Para assistir no navegador com a trilha: sirva a pasta (`npx serve .`) e abra `index.html`.

Depois de mudar um texto ou valor, apague `build/frames` antes de renderizar de novo. O render pula os quadros que já existem.

## Estrutura do filme

| Cena | Tempo | Conteúdo |
|---|---|---|
| 1. O desafio | 0:00–0:19 | Notificações no escuro, sala de crise (telefones, ERRO, REWORK, GO-LIVE ADIADO), silêncio, a ligação, a muda que nasce |
| 2. A parceria | 0:19–0:40 | TOTVS (Módulo) e A&M (Cronos) se cumprimentam; Antonialli e o time; TECNOLOGIA + GESTÃO + TRANSFORMAÇÃO = VALOR; mapa |
| 3. Seis projetos | 0:40–1:21 | Um lugar por projeto no mapa: nuvem de chuva → sol, mascote e time, cartão com antes/depois; resumo 6 / 2 / 13 / 1 |
| 4. Método e IA | 1:21–1:43 | Escada aprendizado → previsibilidade; quadro do framework (ilustrativo); Vinicius guarda o PPT na gaveta e abre os dashboards |
| 5. P&L e a NF | 1:43–2:18 | P&L de todo mundo; barras FY26/FY27; "Mas tem um detalhe…"; Giovanna, Paladini, record scratch, Operação Collection Zero Defect, o cabelo |
| 6. Fechamento | 2:18–2:51 | Logos, fala do Antonialli, novos projetos FY27, quadro final com os 13, "Mas pagou a NF?", FIM |

## Pendências do roteiro

- **Valor FY27:** placeholder `R$ [X]`.
- **Métricas antes/depois** dos seis projetos: placeholders.
- **Slides 7, 9, 10 e 11 do framework:** a cena 4 usa uma versão ilustrativa, sem números.
- **Aparência das pessoas:** é provisória. Ajustar com cada pessoa antes da versão final.
- **Logos:** usar os arquivos oficiais de cada empresa e confirmar a permissão de uso.
- **Locução:** gravar a narração e as falas seguindo as legendas (lista com tempos em `build/cues.json`).
- **Duração:** o texto falado não cabe em 2:25. Veja `docs/analise-roteiro-projeto-do-ano.md`, seção 14.
