# Post de LinkedIn e redes sociais

Modelo em HTML: `examples/post-linkedin.html`. Formatos:

| Formato | Tamanho | Uso |
|---|---|---|
| Retrato 4:5 | 1080 × 1350 | Padrão para post e carrossel |
| Quadrado | 1080 × 1080 | Post único, mesmas regras com o conteúdo mais curto |
| Paisagem | 1200 × 627 | Imagem de link e evento |

## Retrato 1080 × 1350

**Margem de 72px nos quatro lados.** Uma ideia por página.

| Faixa | Posição (px) | Conteúdo |
|---|---|---|
| Topo | y 72 | Nome A&M com 22px de altura: `am-nome-navy.png` no branco, `am-nome-branco.png` no navy |
| Sobretítulo | y ~150 | Etiqueta do capítulo (`.am-chapter`), por exemplo "01 · O que muda" |
| Título | a partir de y ~200 | Action title em Light 68px, até 4 linhas, navy no branco e branco no navy |
| Lede | abaixo do título | Condensed 30px azul, com a palavra-chave em navy negrito. Até 3 linhas |
| Conteúdo | até y 1150 | Um painel cinza-20 com um gráfico ou de 2 a 3 números (`.am-metric`, valor em Light 96px ou mais) |
| Rodapé | fio de 1px `gray-100` em y 1190; marcas em y ~1230 | Performance navy (48px de altura) · fio · DTS navy (26px de altura) à esquerda; fonte do dado em Condensed 16px navy-80 à direita |

## Capa do carrossel (página 1)

- **Fundo e linhas.** Fundo navy liso, com as linhas brancas da capa oficial à direita. Use `capa-linhas.svg` ancorado no canto inferior direito, com 1080px de largura.
- **Logo.** `am-simbolo-am-branco.png` com 110px de altura, em x 72, y 72.
- **Texto.** Título branco em Light 76px, a partir de y ~420, e lede em Condensed 32px navy-20.
- **Rodapé.** Performance branco · fio · DTS branco.

## Regras

- **Marcas sempre como imagem.** Nunca escreva "PERFORMANCE" ou "DTS" em texto no lugar do logo. A ordem é A&M no topo, depois Performance e DTS no rodapé.
- **Cabeçalho limpo.** Sem diagonais, sem indicador "1/3" e sem faixa tricolor. O time pediu cabeçalhos limpos.
- **Laranja só como detalhe.** Pode aparecer na etiqueta, no sublinhado da palavra-chave ou em um único dado de destaque.
- **Fonte do dado.** Toda página com número cita a fonte no rodapé.
- **Exportar.** Abra o HTML no Chromium (Playwright) com a janela no tamanho exato e salve como PNG. Para carrossel de documento, salve como PDF com uma página por post.
