// Dados do roteiro "Projeto do Ano — Parceria A&M + TOTVS".
// Este arquivo não depende do three.js: é lido pelo navegador (animação)
// e pelo render.mjs (que exporta as deixas de áudio para o gerador da trilha).
// Para mudar textos, valores ou durações, edite aqui e renderize de novo.

export const FPS = 30;

// Valores que o roteiro ainda deixa em aberto.
export const VALORES = {
  fy26: 'R$ 7 MILHÕES',
  fy26Falado: 'R$ 7 milhões',
  fy27: 'R$ [X] MILHÕES', // substituir pelo valor aprovado pelo Financeiro
  fy27Falado: 'R$ [X] milhões',
};

// Os seis projetos da cena 3. "antes" e "depois" são placeholders:
// o roteiro pede um resultado no formato antes/depois, mas não traz os dados.
export const PROJETOS = [
  { n: '01', cliente: 'UNIMED BRASIL', frente: 'Remediação', erp: 'ERP Protheus', logo: 'unimed',
    time: ['Bruno Moraes'], personagem: 'cuidado',
    narr: 'Tudo começou na *maior rede de assistência médica* do Brasil.',
    antes: '[métrica antes]', depois: '[métrica depois]' },
  { n: '02', cliente: 'FUNED', frente: 'TMO + GMO', erp: 'ERP Protheus', logo: 'funed',
    time: ['José Aires', 'Nara Martins'], personagem: 'frasco',
    narr: 'Depois veio a *FUNED*, referência em vacinas, medicamentos e biotecnologia.',
    antes: '[métrica antes]', depois: '[métrica depois]' },
  { n: '03', cliente: 'CAOA', frente: 'Remediação', erp: 'ERP Protheus', logo: 'caoa',
    time: ['Marcos Massao Iwata', 'Thauany Moreira'], personagem: 'acelerado',
    narr: 'Na *CAOA*, *acelerando* uma montadora.',
    antes: '[métrica antes]', depois: '[métrica depois]' },
  { n: '04', cliente: 'JOHN DEERE ARGENTINA', frente: 'Remediação', erp: 'ERP Protheus', logo: 'john-deere',
    time: ['João Lopes', 'Marcus Mancini', 'Jaqueline Valdevino'], personagem: 'campo',
    narr: 'E a parceria cruzou *fronteiras*: John Deere, na *Argentina*.',
    antes: '[métrica antes]', depois: '[métrica depois]' },
  { n: '05', cliente: 'HUGHES', frente: 'TMO + GMO', erp: 'ERP Protheus', logo: 'hughes',
    time: ['Giovanna Brandão', 'Pedro Lanzetta'], personagem: 'astro',
    narr: 'Na *Hughes*, a parceria chegou ao *espaço*.',
    antes: '[métrica antes]', depois: '[métrica depois]' },
  { n: '06', cliente: 'LIBERCON', frente: 'TMO + GMO', erp: 'ERP RM', logo: 'libercon',
    time: ['Monica Audrey'], personagem: 'obrinha',
    narr: 'E na *Libercon*, *construindo junto*. Literalmente.',
    antes: '[métrica antes]', depois: '[métrica depois]' },
];

// Aparência das pessoas do time. É um ponto de partida: ajustar cabelo,
// pele e roupa para cada pessoa, com a aprovação dela, antes da versão final.
// hair: swoop | short | buzz | long | bun | ponytail | curly | wild | bald
// outfit: suit | shirt | blouse | labcoat | vest | overalls | racing | spacesuit
export const ELENCO = {
  antonialli: { nome: 'Guilherme Antonialli', skin: '#e8b48f', hair: 'swoop', hairColor: '#3a2618', outfit: 'suit', top: '#1f2d4d', bottom: '#1f2d4d', tie: '#8a2433', scale: 1.04 },
  bruno:      { nome: 'Bruno Moraes', skin: '#d9a07a', hair: 'short', hairColor: '#1c1c1c', outfit: 'shirt', top: '#7fb3e6', bottom: '#4a5160' },
  jose:       { nome: 'José Aires', skin: '#c68863', hair: 'short', hairColor: '#5a4636', outfit: 'shirt', top: '#6b7f4a', bottom: '#3f4450', glasses: true },
  nara:       { nome: 'Nara Martins', skin: '#f1d0b5', hair: 'long', hairColor: '#3b2416', outfit: 'blouse', top: '#e5735f', bottom: '#2f3a52' },
  marcos:     { nome: 'Marcos Massao Iwata', skin: '#f3c9a8', hair: 'short', hairColor: '#141414', outfit: 'shirt', top: '#2f6f73', bottom: '#30343c', glasses: true },
  thauany:    { nome: 'Thauany Moreira', skin: '#8a5536', hair: 'curly', hairColor: '#1c1412', outfit: 'blouse', top: '#e0a93b', bottom: '#2b2f3a' },
  joao:       { nome: 'João Lopes', skin: '#e8b48f', hair: 'short', hairColor: '#4a3020', outfit: 'shirt', top: '#3a4f7a', bottom: '#5b5f66' },
  mancini:    { nome: 'Marcus Mancini', skin: '#f3c9a8', hair: 'buzz', hairColor: '#2a2420', outfit: 'suit', top: '#5d6470', bottom: '#5d6470', tie: '#2e4a7a' },
  jaqueline:  { nome: 'Jaqueline Valdevino', skin: '#c68863', hair: 'ponytail', hairColor: '#2e1c12', outfit: 'blouse', top: '#7b5aa6', bottom: '#2b2f3a' },
  giovanna:   { nome: 'Giovanna Brandão', skin: '#f1d0b5', hair: 'long', hairColor: '#7a3b22', outfit: 'blouse', top: '#d94b4b', bottom: '#2b3448' },
  pedro:      { nome: 'Pedro Lanzetta', skin: '#f3c9a8', hair: 'short', hairColor: '#8c6a4a', outfit: 'shirt', top: '#4f9a6a', bottom: '#3d4250' },
  monica:     { nome: 'Monica Audrey', skin: '#a86d4b', hair: 'bun', hairColor: '#161210', outfit: 'suit', top: '#3c6fd1', bottom: '#2a3550', tie: null },
  vinicius:   { nome: 'Vinicius de Sousa', skin: '#a86d4b', hair: 'short', hairColor: '#141010', outfit: 'shirt', top: '#f2f2f2', bottom: '#2f3440', glasses: true },
  paladini:   { nome: 'Paladini', skin: '#e8b48f', hair: 'bun', hairColor: '#6b4423', outfit: 'blouse', top: '#3aa6a0', bottom: '#33384a', glasses: true },
  quintao:    { nome: 'Fabio Quintão', skin: '#f3c9a8', hair: 'buzz', hairColor: '#8f8f8f', outfit: 'suit', top: '#353b45', bottom: '#353b45', tie: '#b0413e' },
  sampaio:    { nome: 'Sampaio', skin: '#c68863', hair: 'short', hairColor: '#1a1a1a', outfit: 'suit', top: '#6d4c3d', bottom: '#4a3a32', tie: '#d9b44a', glasses: true },
};

// Caricaturas a partir das fotos enviadas (na ordem recebida). Falta saber quem é
// quem: quando os nomes chegarem, copie a linha da foto para a pessoa em ELENCO.
export const RETRATOS = {
  foto1:  { nome: 'Foto 1', skin: '#ebbd9b', hair: 'side', hairColor: '#2b1d15', glasses: 'round', glassesColor: '#2b2b30', beard: 'short', outfit: 'suit', top: '#5b6069', bottom: '#4a4f57', tie: '#1f3a7a', grin: true },
  foto2:  { nome: 'Foto 2', skin: '#f0c9ab', hair: 'longStraight', hairColor: '#3b2418', hairColor2: '#7a5034', outfit: 'top', top: '#1d1d22', bottom: '#2b2b33', necklace: true, grin: true, lashes: true },
  foto3:  { nome: 'Foto 3', skin: '#ebc4a4', hair: 'slick', hairColor: '#2a1d16', beard: 'full', outfit: 'suit', top: '#2b2e36', bottom: '#2b2e36', tie: '#b9bec7' },
  foto4:  { nome: 'Foto 4', skin: '#d9a07c', hair: 'bigCurly', hairColor: '#3a2216', freckles: true, outfit: 'top', top: '#f4f1ea', bottom: '#c9b79a', knit: true, necklace: true, grin: true, lashes: true },
  foto5:  { nome: 'Foto 5', skin: '#e8bc98', hair: 'bald', hairColor: '#5a3e2b', glasses: 'round', glassesColor: '#7a5230', beard: 'full', beardColor: '#5a3e2b', outfit: 'suit', top: '#1f2f5a', bottom: '#1f2f5a', tie: '#a9c4ea', grin: true },
  foto6:  { nome: 'Foto 6', skin: '#dba582', hair: 'side', hairColor: '#1e1a17', glasses: 'geo', glassesColor: '#2b2b30', beard: 'full', outfit: 'polo', top: '#1c1f26', bottom: '#3a3f4a', grin: true },
  foto7:  { nome: 'Foto 7', skin: '#f0d0b2', hair: 'grayUp', hairColor: '#7f7f80', hairColor2: '#d2d2d2', browColor: '#4a4a4a', glasses: 'rect', glassesColor: '#1e1e22', outfit: 'vestShirt', top: '#1f2a4a', inner: '#5c6068', bottom: '#2a3040' },
  foto8:  { nome: 'Foto 8', skin: '#e8bb98', hair: 'side', hairColor: '#2a1d16', glasses: 'rect', glassesColor: '#3a3a3a', beard: 'goatee', outfit: 'dotted', top: '#f4f4f6', bottom: '#4a4f5a', grin: true },
  foto9:  { nome: 'Foto 9', skin: '#eac3a3', hair: 'shoulder', hairColor: '#141418', earrings: 'stud', outfit: 'blazer', top: '#f3f1ec', inner: '#f7f3ea', bottom: '#e9e5dc', buttons: true, necklace: true, necklaceColor: '#7a1f3a' },
  foto10: { nome: 'Foto 10', skin: '#e8c0a0', hair: 'wavy', hairColor: '#2a1a14', earrings: 'stud', outfit: 'plaid', top: '#d8c7a8', plaidColor: '#3a3530', inner: '#dcc6a6', turtleneck: true, bottom: '#3a3530' },
  foto11: { nome: 'Foto 11', skin: '#e7bd9d', hair: 'longWavy', hairColor: '#141214', lashes: true, earrings: 'drop', earringColor: '#1f8a5a', outfit: 'blouseCollar', top: '#fbfbf8', bottom: '#2b2f3a', grin: true },
  foto12: { nome: 'Foto 12', skin: '#e2b18f', hair: 'curlyTop', hairColor: '#2a1d16', glasses: 'geo', glassesColor: '#c9a24a', beard: 'short', outfit: 'blazer', top: '#5b5a45', inner: '#2f3a4a', bottom: '#3a3a33' },
};

// Os 13 do quadro final, na ordem da esquerda para a direita (Antonialli no centro).
export const QUADRO_FINAL = ['bruno', 'jose', 'nara', 'marcos', 'thauany', 'joao', 'antonialli',
  'mancini', 'jaqueline', 'giovanna', 'pedro', 'monica', 'vinicius'];

// Personagens das empresas (docs/analise-roteiro-projeto-do-ano.md, seção 13).
export const EMPRESAS = {
  modulo:    { nome: 'Módulo', empresa: 'TOTVS', skin: '#e8b48f', top: '#1667e0', bottom: '#0a3f91', tie: '#7fc0ff', badge: 'totvs' },
  cronos:    { nome: 'Cronos', empresa: 'A&M', skin: '#f3c9a8', top: '#0c2f57', bottom: '#0c2f57', tie: '#4f8fd6', badge: 'alvarez-marsal' },
  cuidado:   { nome: 'Dra. Cuidado', empresa: 'Unimed', skin: '#c68863', hair: 'bun', hairColor: '#1e1410', outfit: 'labcoat', top: '#0b9a5c', bottom: '#0b7a4b', stethoscope: true, badge: 'unimed' },
  frasco:    { nome: 'Dr. Frasco', empresa: 'FUNED', skin: '#f1d0b5', hairColor: '#f4f4f4', top: '#2fb36b', bottom: '#1d5fb8', badge: 'funed' },
  acelerado: { nome: 'Acelerado', empresa: 'CAOA', skin: '#d9a07a', outfit: 'racing', top: '#13286b', bottom: '#13286b', accent: '#14a04f', badge: 'caoa' },
  campo:     { nome: 'Tío Campo', empresa: 'John Deere Argentina', skin: '#e0a882', hair: 'short', hairColor: '#4a3220', outfit: 'overalls', top: '#c4473a', bottom: '#3b5b8a', hat: 'campo', mustache: true, badge: 'john-deere' },
  astro:     { nome: 'Astro', empresa: 'Hughes', skin: '#f3c9a8', hair: 'short', hairColor: '#3a2a1a', outfit: 'spacesuit', top: '#f4f6fa', bottom: '#f4f6fa', accent: '#1e4fae', badge: 'hughes' },
  obrinha:   { nome: 'Obrinha', empresa: 'Libercon', skin: '#a86d4b', hair: 'short', hairColor: '#141010', outfit: 'vest', top: '#1f5fd1', bottom: '#3a4250', hat: 'obra', badge: 'libercon' },
};

// Linha do tempo. Cada plano tem duração (s), legendas relativas ao início
// do plano e deixas de som (sfx) também relativas ao plano.
// who: 'N' = narrador; senão, nome do personagem que fala.
export const PLANOS = [
  // ---------------- CENA 1 — O desafio ----------------
  { id: 'c1_black', cena: 1, dur: 1.0, sfx: [{ at: 0.1, s: 'pings' }] },
  { id: 'c1_wide', cena: 1, dur: 1.8, sfx: [{ at: 0.2, s: 'slam' }, { at: 0.0, s: 'ring' }] },
  { id: 'c1_monitors', cena: 1, dur: 1.6, sfx: [{ at: 0.1, s: 'slam' }, { at: 0.3, s: 'alarm' }] },
  { id: 'c1_stress', cena: 1, dur: 2.0, sfx: [{ at: 0.1, s: 'slam' }, { at: 0.5, s: 'ring' }] },
  { id: 'c1_calendar', cena: 1, dur: 2.0, sfx: [{ at: 0.1, s: 'slam' }, { at: 0.9, s: 'stamp' }] },
  { id: 'c1_silence', cena: 1, dur: 1.0, sfx: [{ at: 0.15, s: 'paper' }] },
  { id: 'c1_call', cena: 1, dur: 6.2, sfx: [{ at: 3.2, s: 'pickup' }],
    subs: [
      { at: 0.2, end: 3.1, who: 'N', text: 'Todo mundo que já viveu um projeto de *ERP* conhece esse filme.' },
      { at: 3.1, end: 6.1, who: 'N', text: 'A diferença é *quem você chama* quando ele começa a dar errado.' },
    ] },
  { id: 'c1_seed', cena: 1, dur: 3.8, sfx: [{ at: 0.5, s: 'sparkle' }],
    subs: [
      { at: 0.5, end: 3.7, who: 'N', text: 'A nossa começou com *um projeto*. E não parou mais de crescer.' },
    ] },

  // ---------------- CENA 2 — A parceria e a liderança ----------------
  { id: 'c2_handshake', cena: 2, dur: 8.2, sfx: [{ at: 7.2, s: 'sparkle' }, { at: 7.2, s: 'clap' }],
    subs: [
      { at: 0.2, end: 4.0, who: 'N', text: 'De um lado, a *TOTVS*: a maior empresa de tecnologia do Brasil.' },
      { at: 4.0, end: 8.1, who: 'N', text: 'Do outro, a *A&M Performance*: núcleo de excelência em performance da Alvarez & Marsal.' },
    ] },
  { id: 'c2_leader', cena: 2, dur: 6.8, sfx: [{ at: 0.4, s: 'whoosh' }],
    subs: [
      { at: 0.2, end: 3.4, who: 'N', text: 'Um time de especialistas com mentalidade *fazedora* e *adaptável*.' },
      { at: 3.4, end: 6.7, who: 'N', text: 'Executivos que já viveram desafios reais. Gente que *entende do jogo*.' },
    ] },
  { id: 'c2_values', cena: 2, dur: 3.0, sfx: [{ at: 0.2, s: 'thud' }, { at: 0.75, s: 'thud' }, { at: 1.3, s: 'thud' }, { at: 2.0, s: 'shine' }] },
  { id: 'c2_unimed', cena: 2, dur: 2.8, sfx: [{ at: 0.0, s: 'whoosh' }],
    subs: [{ at: 0.1, end: 2.7, who: 'N', text: 'Tudo começou na *Unimed Brasil*. Nosso projeto pioneiro.' }] },

  // ---------------- CENA 3 — Seis projetos, seis resultados ----------------
  ...PROJETOS.map((p, i) => ({
    id: `c3_p${i + 1}`, cena: 3, dur: 6.0, projeto: i,
    sfx: [{ at: 0.15, s: 'whoosh' }, { at: 3.1, s: 'fix' }],
    subs: [{ at: 0.3, end: 3.6, who: 'N', text: p.narr }],
  })),
  { id: 'c3_summary', cena: 3, dur: 5.0,
    sfx: [{ at: 0.9, s: 'pop' }, { at: 1.7, s: 'pop' }, { at: 2.5, s: 'pop' }, { at: 3.3, s: 'shine' }] },

  // ---------------- CENA 4 — O método e a IA ----------------
  { id: 'c4_method', cena: 4, dur: 5.4,
    sfx: [{ at: 0.4, s: 'thud' }, { at: 1.5, s: 'thud' }, { at: 2.7, s: 'thud' }, { at: 3.9, s: 'thud' }],
    subs: [
      { at: 0.2, end: 2.7, who: 'N', text: 'Projeto após projeto, o aprendizado vira *método*.' },
      { at: 2.7, end: 5.3, who: 'N', text: 'O método vira padrão. E o padrão gera *previsibilidade*.' },
    ] },
  { id: 'c4_slides', cena: 4, dur: 9.6,
    sfx: [{ at: 0.0, s: 'whoosh' }, { at: 2.4, s: 'whoosh' }, { at: 4.8, s: 'whoosh' }, { at: 7.2, s: 'whoosh' }] },
  { id: 'c4_vinicius', cena: 4, dur: 7.0,
    sfx: [{ at: 1.7, s: 'record_stop' }, { at: 2.2, s: 'whoosh' }, { at: 2.75, s: 'drawer' }, { at: 3.1, s: 'pop' }, { at: 3.4, s: 'pop' }, { at: 3.7, s: 'pop' }, { at: 4.0, s: 'robots' }],
    subs: [{ at: 3.2, end: 6.9, who: 'N', text: 'Com o apoio do Delivery Center, os entregáveis viraram *cockpits de dashboards* para o cliente.' }] },

  // ---------------- CENA 5 — Resultado no P&L e a NF ----------------
  { id: 'c5_pl', cena: 5, dur: 4.0,
    subs: [
      { at: 0.2, end: 2.1, who: 'N', text: 'E quando a gente diz resultado no P&L…' },
      { at: 2.2, end: 3.9, who: 'N', text: '…é no P&L *de todo mundo*.' },
    ] },
  { id: 'c5_numbers', cena: 5, dur: 4.8, sfx: [{ at: 0.2, s: 'timpani' }, { at: 2.6, s: 'timpani' }] },
  { id: 'c5_growth', cena: 5, dur: 4.2, sfx: [{ at: 0.3, s: 'coins' }, { at: 2.6, s: 'clap' }],
    subs: [
      { at: 0.1, end: 2.3, who: 'N', text: 'Uma parceria que não só entrega valor para o cliente.' },
      { at: 2.3, end: 4.1, who: 'N', text: 'Ela também *cresce o nosso negócio*.' },
    ] },
  { id: 'c5_detail', cena: 5, dur: 1.6, sfx: [{ at: 0.05, s: 'typewriter' }] },
  { id: 'c5_giovanna', cena: 5, dur: 2.6, sfx: [{ at: 0.0, s: 'steps_fast' }],
    subs: [{ at: 1.8, end: 2.6, who: 'Giovanna', text: 'Paladini!' }] },
  { id: 'c5_paladini', cena: 5, dur: 3.4, sfx: [{ at: 0.05, s: 'startle' }, { at: 0.1, s: 'paper' }],
    subs: [
      { at: 0.7, end: 2.3, who: 'Giovanna', text: 'A TOTVS pagou a nota?' },
      { at: 2.5, end: 3.4, who: 'Paladini', text: 'Pagou.' },
    ] },
  { id: 'c5_scratch', cena: 5, dur: 1.2, sfx: [{ at: 0.0, s: 'scratch' }] },
  { id: 'c5_antecipar', cena: 5, dur: 3.6,
    subs: [
      { at: 0.1, end: 2.3, who: 'Antonialli', text: 'Vamos precisar antecipar algumas notas para o FY26.' },
      { at: 2.4, end: 3.5, who: 'Antonialli', text: 'Fala com a TOTVS.' },
    ] },
  { id: 'c5_phones', cena: 5, dur: 1.8, sfx: [{ at: 0.0, s: 'dial' }] },
  { id: 'c5_celebrate', cena: 5, dur: 2.4, sfx: [{ at: 0.15, s: 'confetti' }],
    subs: [{ at: 0.2, end: 2.3, who: 'Giovanna e Bruno', text: 'Antecipamos as NFs para esse ano fiscal!' }] },
  { id: 'c5_operacao', cena: 5, dur: 3.2, sfx: [{ at: 1.85, s: 'stamp' }],
    subs: [{ at: 0.1, end: 1.9, who: 'Antonialli', text: 'Agora é Operação Collection Zero Defect.' }] },
  { id: 'c5_hair', cena: 5, dur: 1.8, sfx: [{ at: 1.25, s: 'ting' }] },

  // ---------------- CENA 6 — Fechamento ----------------
  { id: 'c6_montage', cena: 6, dur: 3.9,
    sfx: [0, 0.65, 1.3, 1.95, 2.6, 3.25].map(at => ({ at, s: 'pop' })) },
  { id: 'c6_monologue', cena: 6, dur: 9.2,
    subs: [
      { at: 0.2, end: 3.4, who: 'Antonialli', text: 'Começamos com um projeto na Unimed. Hoje são seis, em dois países,' },
      { at: 3.4, end: 5.6, who: 'Antonialli', text: `e ${VALORES.fy26Falado} só neste ano fiscal.` },
      { at: 5.8, end: 9.1, who: 'Antonialli', text: 'Isso não é sorte. É *método* e *confiança*.' },
    ] },
  { id: 'c6_narr', cena: 6, dur: 4.8, sfx: [{ at: 2.0, s: 'rise' }],
    subs: [
      { at: 0.2, end: 2.0, who: 'N', text: 'Um projeto que *gera projetos*.' },
      { at: 2.0, end: 4.7, who: 'N', text: `E mais ${VALORES.fy27Falado} já a caminho no próximo ano fiscal.` },
    ] },
  { id: 'c6_group', cena: 6, dur: 6.0, sfx: [{ at: 1.0, s: 'shine' }] },
  { id: 'c6_fade', cena: 6, dur: 1.4 },
  { id: 'c6_gente', cena: 6, dur: 3.6, sfx: [{ at: 0.0, s: 'steps' }],
    subs: [
      { at: 0.6, end: 1.7, who: 'Giovanna', text: 'Gente…' },
      { at: 2.3, end: 3.6, who: 'Giovanna', text: 'Mas pagou a NF?' },
    ] },
  { id: 'c6_hair', cena: 6, dur: 2.0, sfx: [{ at: 1.3, s: 'ting' }] },
  { id: 'c6_fim', cena: 6, dur: 2.2, sfx: [{ at: 0.3, s: 'button' }] },
];

// Trilha: trechos de música por plano (início e fim relativos aos planos).
// estilo: tensao | esperanca | tema | metodo | triunfo | furtivo | comico | espiao | final | botao
export const MUSICA = [
  { estilo: 'tensao', de: ['c1_black', 0], ate: ['c1_calendar', 'fim'] },
  { estilo: 'esperanca', de: ['c1_call', 0.2], ate: ['c1_seed', 'fim'] },
  { estilo: 'tema', de: ['c2_handshake', 0], ate: ['c3_summary', 'fim'] },
  { estilo: 'metodo', de: ['c4_method', 0], ate: ['c4_vinicius', 'fim'] },
  { estilo: 'triunfo', de: ['c5_pl', 0], ate: ['c5_growth', 'fim'] },
  { estilo: 'furtivo', de: ['c5_giovanna', 0], ate: ['c5_paladini', 'fim'] },
  { estilo: 'comico', de: ['c5_antecipar', 0.3], ate: ['c5_celebrate', 'fim'] },
  { estilo: 'espiao', de: ['c5_operacao', 0], ate: ['c5_hair', 'fim'] },
  { estilo: 'final', de: ['c6_montage', 0], ate: ['c6_group', 'fim'] },
];

// Tempo absoluto de cada plano.
export function linhaDoTempo() {
  let t = 0;
  const out = [];
  for (const p of PLANOS) {
    out.push({ ...p, t0: t, t1: t + p.dur });
    t += p.dur;
  }
  return { planos: out, total: t };
}

export function tempoDe(planos, id, quando) {
  const p = planos.find(x => x.id === id);
  if (!p) throw new Error('plano desconhecido: ' + id);
  return quando === 'fim' ? p.t1 : p.t0 + quando;
}
