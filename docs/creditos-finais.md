# Créditos finais

Encerramento de 20 segundos, em 1920×1080 a 30 fps, com música instrumental e três cartelas. Entra depois da piada final do filme.

Entrega renderizada: [`assets/video/creditos-finais.mp4`](../assets/video/creditos-finais.mp4). As imagens das três cartelas também estão em `assets/video/`.

| Tempo | Cartela | Conteúdo |
|---|---|---|
| 0–6 s | Equipe criativa | Victor Vitorino — Direção de Imagem; Guilherme Antonialli — Direção Executiva; Giovanna Brandão — Roteiro |
| 6–16 s | Participações especiais | Os 16 nomes confirmados no elenco do filme, em ordem alfabética |
| 16–20 s | Agradecimento | “Uma história feita por muitas mãos.” |

Os nomes, funções, textos e durações são editados em `animacao/producao/creditos.json`. “Sampaio” foi mantido como consta no elenco; não há sobrenome confirmado. As funções de produção só foram atribuídas a Victor, Guilherme e Giovanna, conforme informado pelo usuário.

## Renderizar

Use o checkout existente. No ambiente cloud preparado, ative o Python e o Chromium:

```bash
cd /workspace/finaldoanovideo/animacao
source /workspace/.venvs/finaldoanovideo/bin/activate
export NODE_OPTIONS="--require=/workspace/setup/system-chromium.cjs"
node render.mjs stills --test creditos --t 3,11,18 --out build/creditos/stills
node render.mjs frames --test creditos --workers 2 --out build/creditos/frames
python producao/creditos.py trilha
node render.mjs encode --frames build/creditos/frames --audio build/creditos/trilha.wav --out build/creditos/creditos.mp4
```

Use um diretório de quadros vazio quando editar o conteúdo: o renderizador reaproveita arquivos existentes.

Para assistir à versão editável com a trilha dos créditos, sirva `animacao/` e abra `index.html?test=creditos`.

## Anexar ao filme

O helper concatena vídeo **e** áudio, sem alterar os tempos das cenas existentes. Normaliza a saída para 1080p, 30 fps e áudio estéreo 48 kHz. Se o filme não tiver áudio, adiciona silêncio somente ao trecho do filme.

Quando o áudio termina depois da imagem, preserva o áudio e mantém o último quadro até ele terminar.

```bash
python producao/creditos.py montar \
  --entrada /caminho/filme-final.mp4 \
  --saida build/creditos/video-com-creditos.mp4
```

Ele protege a entrada e recusa sobrescrever uma saída existente sem `--overwrite`. O filme completo SpecForge depende de assets externos; os créditos podem ser renderizados e revisados independentemente.
