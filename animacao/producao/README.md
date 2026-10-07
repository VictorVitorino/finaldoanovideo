# Produção no padrão de longa de animação 3D

A cinematografia de estúdio (personagens esculpidos, pele com subsurface, luz de cinema) não dá para renderizar por código neste ambiente: não há GPU nem Blender, e as APIs de IA estão bloqueadas. Por isso o caminho é:

1. **Gerar os planos** numa ferramenta de vídeo por IA com imagem de referência: Kling, Runway Gen-4, Hailuo/MiniMax, Google Veo, Pika ou similar.
2. **Montar o filme aqui:** os clipes gerados entram por baixo, e a nossa pós-produção vai por cima. A pós cobre legendas, textos do roteiro, valores, logos oficiais, cartões dos projetos, etiquetas de quem é quem, transições, trilha e efeitos.

As ferramentas de IA erram textos e logos. Por isso **nada de texto, número ou logo é gerado**: tudo isso já está pronto na camada de sobreposição.

## Passo a passo

1. **Diga quem é quem** em `producao/elenco_fotos.json`, por exemplo `"antonialli": "foto5"` (as fotos estão numeradas na ordem em que foram enviadas).
2. **Gere os documentos de prompts:** `python3 producao/prompts.py`. O comando cria:
   - `PERSONAGENS.md`: folhas de personagem (turnaround e expressões). Gere essas imagens primeiro, anexando a foto de cada pessoa como referência de semelhança.
   - `PROMPTS.md`: os prompts de cada clipe (quadro-chave e movimento), já com a descrição de cada personagem, câmera, luz, falas e o nome do arquivo a salvar.
3. **Gere cada clipe:**
   1. Gere a imagem do quadro-chave, anexando as folhas dos personagens em cena.
   2. Anime essa imagem com o prompt de movimento (image-to-video, 5 a 10 s).
   3. Salve o resultado em `producao/clipes/` com o nome indicado (ex.: `c3_p1.mp4`, `c6_monologue_a.mp4`).
4. **Monte o filme:**
   ```bash
   node render.mjs cues
   python3 audio/gerar_trilha.py
   node render.mjs frames --layer base        # animação provisória (só usada onde falta clipe)
   node render.mjs frames --layer overlay     # textos, logos, cartões, legendas, transições
   node render.mjs frames --layer etiquetas   # quem é quem, aplicado só sobre os clipes gerados
   python3 producao/montar.py                 # -> build/projeto-do-ano-final.mp4
   ```
   Os planos que ainda não têm clipe usam a animação provisória no lugar. Assim dá para montar o filme aos poucos e ver o resultado a cada clipe novo.
5. **Ajuste as etiquetas:** depois de ver um clipe, ajuste as posições das etiquetas de quem é quem em `src/producao.js` (x, y em pixels).

## Dicas

- **Personagem consistente:** use sempre a mesma folha de personagem como referência e mantenha o sufixo de estilo igual em todos os prompts.
- **Falas em cena:** os planos com fala de personagem estão marcados com `(lip-sync)`. Use o recurso de lip-sync da ferramenta depois de gravar a voz, ou prefira enquadramentos em que a boca não fica em destaque.
- **Locução:** a narração e as falas estão em `build/cues.json`, com os tempos exatos. Grave a locução seguindo esses tempos.
- **Clipe curto demais:** o último quadro é congelado até completar o tempo do plano. **Clipe longo demais:** é cortado no tempo do plano.
- **Marcas:** não use "Pixar" ou "Disney" nos prompts. Muitas ferramentas bloqueiam esses nomes, e o estilo já está descrito em termos técnicos no sufixo.

## Teste de 15 s no novo molde (folha de personagem + micro-atuação)

O teste parte de uma folha de personagem no estilo de longa 3D (ex.: "01 VICTOR"). Ela não vai para o git, porque tem a imagem de uma pessoa real. Nenhum plano troca de desenho: a vida vem de deformações pequenas sobre o próprio desenho:

- respiração e transferência de peso, com os pés plantados;
- inclinação de cabeça e piscada;
- braço que assenta depois do gesto;
- câmera com push-in e profundidade de campo.

Os cortes caem no tempo da música.

```bash
python3 producao/recortar_folha.py <folha.png> build/poc/corte   # poses e close em PNG transparente
python3 producao/teste15.py quadros                               # cenário + personagem -> build/teste15/base
python3 producao/teste15.py trilha
node render.mjs frames --test teste15 --layer overlay --out build/teste15/overlay
python3 producao/teste15.py montar                                # -> build/teste15/teste15.mp4
```

Os pontos de referência (pescoço, cintura, olhos, ombro, cotovelo) em `teste15.py` são os da folha do Victor. Para outra pessoa, gere a folha no mesmo layout e confira esses pontos.

A folha ideal tem as poses em resolução maior e fundo liso ou transparente, o que melhora o recorte e a nitidez. Movimentos grandes (andar, virar, apertar a mão) precisam de quadros desenhados ou de clipes de imagem-para-vídeo; a deformação só cobre a micro-atuação.
