#!/bin/sh
# Monta o blog na Vercel a partir de um commit do repositório público, sem depender da integração GitHub da Vercel.
# A publicação envia só este arquivo e o vercel.json; na montagem, a Vercel baixa o commit indicado e serve a pasta blog/.
# Uso (comando de build do projeto na Vercel):  sh build.sh <sha-do-commit>      Pasta de saída: public
set -e
SHA="$1"
[ -n "$SHA" ] || { echo "faltou o sha do commit"; exit 1; }
REPO="VictorVitorino/finaldoanovideo"
rm -rf public && mkdir -p public
curl -fsSL "https://codeload.github.com/$REPO/tar.gz/$SHA" -o repo.tgz
tar -xzf repo.tgz --strip-components=2 -C public "finaldoanovideo-$SHA/blog"
# fora do ar: fontes do gerador e arquivos de configuração (mesma lista do .vercelignore)
rm -rf public/_src public/README.md public/.vercelignore public/vercel.json repo.tgz
test -f public/index.html
echo "blog montado: $(find public -type f | wc -l) arquivos do commit $SHA"
