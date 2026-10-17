// Textos, números e fontes do carrossel "IA precisa de adoção. Quem faz a adoção é a Gestão da Mudança".
// Única fonte do conteúdo: as páginas só desenham o que está aqui. Trechos entre *asteriscos* saem em laranja.
// Só entram números verificados na fonte (recorte e URL de cada um em docs/carrossel-gmo-ia.md).

export const CAB = { titulo: 'GESTÃO DA MUDANÇA', sub: 'Tecnologia precisa de adoção' };

export const ABERTURA = {
  selo: 'ALVAREZ & MARSAL · DTS · PERFORMANCE',
  linhas: ['TECNOLOGIA NÃO SE', 'ADOTA SOZINHA.', '*QUEM FAZ A ADOÇÃO É A*', '*GESTÃO DA MUDANÇA.*'],
};

export const P1 = {
  kicker: '01 · IA VERSUS ADOÇÃO',
  titulo: ['COMPRAR IA É RÁPIDO.', '*ADOTAR IA É OUTRA HISTÓRIA.*'],
  escadaTitulo: 'Da tecnologia comprada à tecnologia adotada',
  // McKinsey, The State of AI in 2026 (89% usam em ≥1 função; 44% escalando) · BCG, AI at Work 2026 (36% capacitação adequada)
  escada: [
    { val: 89, rot: 'têm IA', sub: 'usam IA em ao menos uma função' },
    { val: 44, rot: 'escalaram', sub: 'a IA já escala pela empresa' },
    { val: 36, rot: 'capacitaram', sub: 'das pessoas se sentem capacitadas', semQueda: true },
  ],
  conclusao: 'A tecnologia chega pronta. *A adoção precisa ser construída, com as pessoas.* É isso que a Gestão da Mudança faz.',
  fontes: 'McKinsey, The State of AI in 2026 · BCG, AI at Work 2026',
};

export const P2 = {
  kicker: '02 · COM E SEM GESTÃO DA MUDANÇA',
  titulo: ['COM GESTÃO DA MUDANÇA,', 'A ADOÇÃO SOBE.', '*SEM, O RISCO É ALTO.*'],
  colunasTitulo: 'Projetos que atingiram os objetivos, por qualidade da gestão da mudança',
  // Prosci, benchmark de projetos de mudança (correlação)
  colunas: [{ val: 13, rot: 'ruim' }, { val: 39, rot: 'razoável' }, { val: 73, rot: 'boa' }, { val: 88, rot: 'excelente' }],
  zonas: [{ de: 0, ate: 1, rot: 'sem GMO', cor: '#FDECEC', txt: '#9B1C1C' }, { de: 3, ate: 4, rot: 'com GMO', cor: '#E8F1F8', txt: '#002B49' }],
  destaque: { num: '7x', rot: 'MAIS CHANCE' },
  tempoTitulo: 'O custo de começar tarde',
  tempoSub: 'Resultado do projeto conforme o momento em que a gestão da mudança entrou',
  // preenchido com os dados verificados da Prosci (ver docs); ordem: do mais cedo ao mais tarde
  tempo: [],
  conclusao: '*Quanto mais cedo a Gestão da Mudança entra, mais fácil a adoção.* Começar depois do go-live é correr atrás da resistência.',
  fontes: 'Prosci, Best Practices in Change Management (benchmark; correlação)',
};

export const P3 = {
  kicker: '03 · O QUE FAZEMOS',
  titulo: ['GESTÃO DA MUDANÇA', '*DESDE O DIA ZERO.*'],
  linhaTitulo: 'Onde a Gestão da Mudança entra no seu projeto de IA',
  fases: [{ rot: 'Antes', de: -0.3, ate: 0 }, { rot: 'Desenho', de: 0, ate: 0.32 }, { rot: 'Construção', de: 0.32, ate: 0.68 }, { rot: 'Depois', de: 0.68, ate: 1 }],
  golive: 0.68,
  faixas: [
    { rot: 'Gestão da Mudança', de: -0.3, ate: 1, cor: '#F78C16', txt: '#002B49', itens: [
      { em: -0.15, rot: 'Preparar o terreno' }, { em: 0.16, rot: 'Patrocínio e narrativa' }, { em: 0.5, rot: 'Capacitação e champions' }, { em: 0.72, rot: 'Apoio no go-live' }, { em: 0.95, rot: 'Reforço e medição', a: 'end', dx: 12 },
    ] },
    { rot: 'Tecnologia', de: 0, ate: 0.74, cor: '#002B49', txt: '#fff', itens: [
      { em: 0.18, rot: 'Desenho' }, { em: 0.45, rot: 'Construção e testes' }, { em: 0.68, rot: 'Go-live' },
    ] },
  ],
  antes: { de: -0.3, rot: 'ANTES DO KICKOFF' },
  entregas: [
    { ico: 'megafone', rot: 'Sensibilização antes do projeto', sub: 'o porquê, para cada público' },
    { ico: 'pessoas', rot: 'Liderança e patrocínio ativos', sub: 'sponsors e rede de champions' },
    { ico: 'livro', rot: 'Capacitação por persona', sub: 'trilhas, regras de uso, suporte' },
    { ico: 'painel', rot: 'Adoção medida e sustentada', sub: 'uso real, proficiência, reforço' },
  ],
  cta: {
    pergunta: 'Seu projeto de IA já tem data de início.', destaque: '*A gestão da mudança já começou?*',
    acao: 'Fale com o time A&M · DTS + Performance', lema: 'Leadership. Action. Results.',
  },
  fontes: '',
};
