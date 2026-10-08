# Projeto do Ano: filme no modelo SpecForge

Análise do roteiro novo e do cenário, como o filme foi feito e o que ainda está pendente.

**Entradas:**
- Base: `docs/roteiro-storyboard-ae-srt.md`, o roteiro técnico com storyboard de After Effects e SRT.
- Personagens:
  - folha nova dos 13 chibis do time (Foto 1–13);
  - folha nova dos 8 mascotes: Conectado no lugar do Astro na Hughes; Módulo com o ícone da TOTVS e Dr. Frasco com o da FUNED.
- Referência visual: o explainer do SpecForge enviado pelo usuário.

## 1. Análise do roteiro

### Fidelidade

Todas as falas foram mantidas palavra por palavra. São 37: 27 do narrador e 10 de personagens (Giovanna, Paladini, Antonialli, Giovanna + Bruno).

Os textos de tela também entram como estão no roteiro:
- os 4 cartões da crise;
- "Toda parceria tem um começo.";
- TECNOLOGIA / GESTÃO / TRANSFORMAÇÃO / = VALOR;
- 6 PROJETOS / 2 PAÍSES / 13 PESSOAS / UMA PARCERIA;
- os 4 textos do framework;
- MENOS PPT NA GAVETA. MAIS RESULTADO NO P&L.;
- R$ 7 MILHÕES NO FY26 e R$ [X] MILHÕES (FY27);
- MAS TEM UM DETALHE…;
- OPERAÇÃO COLLECTION ZERO DEFECT;
- a frase final e o lockup.

### Dados

Só aparecem os números do próprio roteiro: 6 projetos, 2 países, 13 pessoas e R$ 7 milhões no FY26. Não há KPIs por cliente. O painel "antes/depois" é conceitual: peças bagunçadas viram um processo organizado, sem números.

### Duração

Com as vozes gravadas na velocidade natural, o filme fica com **3:17**. O roteiro-base tem 2:25, e ele mesmo pede para não acelerar as falas.

De onde vem o tempo extra:
- 4 cartões de fase de 1,5 s cada;
- os 6 projetos, com 5–6 s cada;
- os 4 slides do framework, com cerca de 3 s cada;
- as pausas de comédia na cena da NF.

**Para voltar a ~2:30:**
1. Tirar os cartões de fase (−6 s).
2. Reduzir os slides para 2 s cada (−4 s).
3. Sobrepor a narração aos cartões da crise, como o SRT sugere (−8 s).
4. Juntar a fala "Tudo começou na Unimed Brasil" (fim da cena 2) com o primeiro projeto. O roteiro usa "Tudo começou" duas vezes seguidas: no fim da cena 2 e no começo da cena 3.

### Pontos para validar (os mesmos da lista do roteiro)

1. **Quem é quem:** nenhuma das Fotos 1–13 tem nome confirmado.
   - Até isso ser preenchido, as pessoas com nome aparecem como **silhuetas com as iniciais**: Antonialli, os times de cada projeto, Vinicius, Giovanna e Bruno.
   - Basta preencher `animacao/producao/elenco_filme.json` e renderizar de novo; tudo é trocado sozinho.
2. **Personagens sem arte:** Paladini, Fabio Quintão e Sampaio. Por enquanto também aparecem como silhuetas. Os prompts estão no §4.
3. **R$ [X] milhões do FY27:**
   - Fica literal na tela.
   - Na narração, vira um "bip": "xis" soou como "seis" para o reconhecedor de fala, o que criaria um número inventado.
   - Regravar quando o valor chegar.
4. **Slides 7, 9, 10 e 11 e o dashboard do Delivery Center:** são placeholders desenhados, sem dados. Trocar pelos slides reais e pelas telas aprovadas.
5. **Piada da NF:** aprovar o humor sobre a antecipação de notas, como o próprio roteiro pede.
6. **Vozes:** são TTS neural offline (Supertonic 3) e servem para o animatic. Na versão final, gravar com pessoas ou usar vozes aprovadas.

## 2. Cenário (modelo SpecForge)

A linguagem visual segue a referência:
- papel creme com grade e rabiscos apagados;
- blobs coloridos suaves atrás dos personagens;
- linha de chão;
- props planos com contorno escuro;
- lockup A&M + TOTVS no canto superior esquerdo;
- pílula de capítulo no canto superior direito e régua de progresso no topo;
- cartões de fase;
- adesivos ("FAZEDORA", "ENTENDE DO JOGO!"), carimbos, bilhetes e chips;
- legendas em karaokê, com a palavra falada acesa em âmbar.

| Cena | Papel | Cenário e props | Personagens |
|---|---|---|---|
| 1. O desafio | noite → creme | pop-ups de alerta, telefone tocando, mapa de processos desconectado, janela de ERP; depois uma "tira de filme" com os cartões e um celular chamando "?" | nenhum (como pede o roteiro) |
| 2. A parceria | creme | cartão de fase; aperto de mãos da parceria; escritório (estantes, quadro branco, plantas); TECNOLOGIA → VALOR | Módulo (TOTVS) e Cronos (A&M) com balões de logo; os 13 caem no escritório; Dra. Cuidado (pioneira) |
| 3. Seis projetos | bege | uma metáfora por cliente: clínica, laboratório, fábrica de carros, fazenda com a placa "ARGENTINA", estação de satélite, obra com guindaste; mosaico; totais | mascote do cliente + time do projeto + cartão do projeto (frente, ERP, time) + antes/depois conceitual |
| 4. Método e IA | creme | slides (visão integrada, MITs, remediação, IA) como placeholders; PPT → cockpit de dashboards; robôs | Módulo e Cronos; Vinicius |
| 5. P&L e a NF | dourado → creme | painel financeiro com R$ 7M e R$ [X]M; tela dividida "valor para o cliente / crescimento"; escritório; telefonema; cartão de missão | os 6 mascotes dos clientes, Módulo e Cronos; Giovanna, Paladini, Quintão, Antonialli, Sampaio e Bruno |
| 6. Fechamento | creme → palco | logos um a um; fala do Antonialli com os números do roteiro; palco com bandeirolas; lockup A&M + TOTVS; a piada final | os 6 mascotes; os 13 + Módulo e Cronos; Giovanna; Antonialli ajeitando o cabelo |

**Movimento dos personagens** (2,5D sobre a própria arte da folha):
- respiração e piscada;
- inclinação de cabeça;
- pulinhos com squash & stretch;
- entrada pulando;
- aceno dos mascotes;
- susto com "!" e gota de suor;
- brilho "ting" no cabelo.

## 3. Como rodar

```bash
cd animacao
python3 producao/recortar_filme.py        # folhas -> recortes + marcos (olhos, pescoço, braço)
python3 producao/vozes_filme.py           # 37 falas (TTS offline); --conferir transcreve de volta
python3 producao/filme.py tempo           # planos, falas e efeitos -> build/filme/timeline.json
python3 producao/filme.py rastro          # câmera e personagens por quadro -> track.json
node render.mjs frames --test filme --layer fundo   --out build/filme/fundo
python3 producao/filme.py quadros         # fundo + personagens -> build/filme/base
node render.mjs frames --test filme --layer overlay --out build/filme/overlay
python3 producao/trilha_filme.py          # música + efeitos + vozes (a música abaixa sob as falas)
python3 producao/filme.py montar          # -> build/filme/projeto-do-ano-specforge.mp4
```

**Módulos:**
- `src/sf/ambiente.js`: papel, blobs, régua, pílulas, legendas, cartões de fase, transições, palco.
- `src/sf/graficos.js`: adesivos, carimbos, cartões, balões, contadores, número herói, telefonema, cartão de missão, efeitos de anime.
- `src/sf/props.js`: crise, escritório, os 6 lugares, slides, dashboard, robôs, painel financeiro.
- `src/sf/filme.js`: o filme, plano a plano.
- `producao/direcao_filme.py`: direção dos personagens.

## 4. Personagens pendentes: prompts no estilo das folhas

Gerar na mesma ferramenta das folhas. Anexar a **foto** da pessoa (para a semelhança) e uma das folhas atuais como referência de estilo. Quando chegarem, colocar a folha em `build/filme/folhas/`, recortar com `recortar_filme.py` e apontar o nome para ela em `elenco_filme.json`.

> 3D chibi caricature of the person in the attached photo, full body, standing, front view, big head and small body, friendly smile, big expressive eyes, glossy soft 3D render like a premium animated film, soft studio lighting, the same proportions, materials and style as the attached reference sheet, plain warm beige background with a soft pastel circle behind the character, no text, no logo.

- **Paladini:** usar a foto dela. No roteiro, ela fica "assustada" na cena da NF.
- **Fabio Quintão:** usar a foto dele. Aparece feliz em close na cena da NF.
- **Sampaio:** usar a foto dele. Aparece feliz em close na cena da NF.
