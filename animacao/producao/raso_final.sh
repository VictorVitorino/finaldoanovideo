#!/bin/bash
# Fecha o vídeo "Além do raso": junta os quadros já renderizados com a trilha e entrega ao blog os dois MP4 e a capa.
#
# Antes (dentro de animacao/):
#   python3 producao/raso_audio.py                                   -> build/raso/trilha.wav e src/raso/tempos.json
#   node render.mjs frames --page raso.html --w 1920 --h 1080 --test filme --out build/raso/frames --workers 3
#   node producao/raso_interativo.mjs                                -> ../blog/_src/content/video-tempos.json
# Depois: node ../blog/_src/build.mjs (grava as legendas em VTT e monta a página inicial).
#
# Uso: bash producao/raso_final.sh
set -e
cd "$(dirname "$0")/.."
QUADROS=build/raso/frames
TRILHA=build/raso/trilha.wav
SAIDA=../blog/assets/video
TEMPOS=../blog/_src/content/video-tempos.json
[ -f "$QUADROS/f00000.jpg" ] || { echo "faltam os quadros em $QUADROS"; exit 1; }
[ -f "$TRILHA" ] || { echo "falta a trilha em $TRILHA"; exit 1; }
mkdir -p "$SAIDA"
# H.264 para a web: quadro-chave a cada 2 s (pulos rápidos entre capítulos), início rápido e som normalizado em -16 LUFS
VIDEO="-c:v libx264 -preset slow -tune animation -crf 24 -x264-params aq-mode=3 -profile:v high -pix_fmt yuv420p -g 60 -movflags +faststart"
SOM="-af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 -c:a aac"
ffmpeg -v error -y -framerate 30 -i "$QUADROS/f%05d.jpg" -i "$TRILHA" $VIDEO $SOM -b:a 112k -shortest "$SAIDA/alem-do-raso-1080.mp4"
ffmpeg -v error -y -framerate 30 -i "$QUADROS/f%05d.jpg" -i "$TRILHA" -vf scale=1280:720:flags=lanczos $VIDEO $SOM -b:a 96k -shortest "$SAIDA/alem-do-raso-720.mp4"
# capa: o quadro indicado pelo próprio filme (video-tempos.json › capa)
N=$(python3 -c "import json;d=json.load(open('$TEMPOS'));print(round(d['capa']*d['fps']))")
ffmpeg -v error -y -i "$(printf "$QUADROS/f%05d.jpg" "$N")" -vf scale=1600:900:flags=lanczos -q:v 4 "$SAIDA/alem-do-raso-capa.jpg"
ls -la "$SAIDA"/alem-do-raso-*
