#!/bin/bash
# Folha de contato de uma página: fotografa a página inteira e corta em colunas. Uso: folha.sh <url> <saida.jpg> <largura> [colunas]
set -e
URL="$1"; OUT="$2"; W="${3:-1440}"; COLS="${4:-4}"
TMP="$(mktemp -d)"
node "$(dirname "$0")/foto.mjs" "$URL" "$TMP/p.png" "$W" 900 --inteira
H=$(ffprobe -v error -show_entries stream=height -of csv=p=0 "$TMP/p.png")
SEG=$(( (H + COLS - 1) / COLS ))
F=""; for i in $(seq 0 $((COLS-1))); do F="$F[0]crop=$W:$SEG:0:$((i*SEG)),pad=$W:$SEG:0:0:white[c$i];"; done
IN=""; for i in $(seq 0 $((COLS-1))); do IN="$IN[c$i]"; done
ffmpeg -v error -y -i "$TMP/p.png" -filter_complex "${F}${IN}hstack=inputs=$COLS" -q:v 3 "$OUT"
echo "$OUT ($W x $H em $COLS colunas de $SEG px)"
