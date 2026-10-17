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
  // McKinsey, The State of AI in 2026: "nearly nine in ten" usam IA em ao menos uma função
  abre: 'Quase *9 em cada 10* organizações já usam IA em alguma função. Mas a empresa ter a ferramenta não é o mesmo que as pessoas usarem:',
  escadaTitulo: 'Da IA implantada à IA adotada',
  escadaSub: 'de cada 100 trabalhadores',
  lacuna: { rot: 'LACUNA DE ADOÇÃO: 32 PONTOS' },
  // Gallup, maio/2026, 22.573 trabalhadores dos EUA: 47% dizem que a empresa integrou IA; 30% usam com frequência; 15% diariamente
  escada: [
    { val: 47, rot: 'têm IA implantada', sub: 'dizem que a empresa integrou IA' },
    { val: 30, rot: 'usam com frequência', sub: 'algumas vezes por semana ou mais' },
    { val: 15, rot: 'usam todos os dias', sub: 'a IA virou hábito de trabalho' },
  ],
  conclusao: 'Implantar não garante uso. *A adoção precisa ser construída, com as pessoas.* É isso que a Gestão da Mudança faz.',
  fontes: 'Gallup, mai/2026 (22.573 trabalhadores, EUA) · McKinsey, The State of AI in 2026',
};

export const P2 = {
  kicker: '02 · COM E SEM GESTÃO DA MUDANÇA',
  titulo: ['COM GESTÃO DA MUDANÇA,', 'A ADOÇÃO SOBE.', '*SEM ELA, O RISCO É ALTO.*'],
  colunasTitulo: 'Projetos que atingiram os objetivos, por eficácia da gestão da mudança (GMO)',
  // Prosci, Best Practices in Change Management (benchmark de projetos de mudança; correlação)
  colunas: [{ val: 13, rot: 'ruim' }, { val: 39, rot: 'razoável' }, { val: 73, rot: 'boa' }, { val: 88, rot: 'excelente' }],
  zonas: [{ de: 0, ate: 1, rot: 'GMO fraca', cor: '#FDECEC', txt: '#9B1C1C' }, { de: 3, ate: 4, rot: 'GMO forte', cor: '#E8F1F8', txt: '#002B49' }],
  destaque: { num: '7x' },
  tempoTitulo: 'O custo de começar tarde',
  tempoSub: 'projetos que atingiram os objetivos, por momento de início da gestão da mudança',
  // Prosci: 47% quando a gestão da mudança começou na iniciação do projeto; 29% quando só começou no encerramento
  tempo: [
    { rot: 'Começou na iniciação do projeto', val: 47 },
    { rot: 'Começou só no encerramento', val: 29 },
  ],
  // Prosci: 85% dizem que deveria começar na iniciação; só 40% começaram
  lacuna: { a: { val: 85, rot: 'dizem que a GMO deveria começar na iniciação do projeto' }, b: { val: 40, rot: 'de fato começaram nesse momento' } },
  conclusao: '*Quanto mais cedo a Gestão da Mudança entra, mais fácil a adoção.* Começar depois do go-live é correr atrás do prejuízo.',
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
      { em: -0.15, rot: 'Preparar o terreno' }, { em: 0.16, rot: 'Patrocínio e narrativa', linha: 1 }, { em: 0.46, rot: 'Capacitação e champions' }, { em: 0.70, rot: 'Apoio no go-live', linha: 1 }, { em: 0.95, rot: 'Reforço e medição', a: 'end', dx: 30 },
    ] },
    { rot: 'Tecnologia', de: 0, ate: 0.74, cor: '#002B49', txt: '#fff', itens: [
      { em: 0.18, rot: 'Desenho' }, { em: 0.45, rot: 'Construção e testes' }, { em: 0.68, rot: 'Go-live' },
    ] },
  ],
  antes: { de: -0.3, rot: 'ANTES DO KICKOFF' },
  entregas: [
    { ico: 'megafone', rot: 'Sensibilização antes do projeto', sub: 'o porquê, para cada público' },
    { ico: 'pessoas', rot: 'Liderança e patrocínio ativos', sub: 'patrocinadores e champions' },
    { ico: 'livro', rot: 'Capacitação por perfil', sub: 'trilhas, regras de uso, suporte' },
    { ico: 'painel', rot: 'Adoção medida e sustentada', sub: 'uso real, proficiência, reforço' },
  ],
  cta: {
    pergunta: 'Seu projeto de IA já tem data de início.', destaque: '*A Gestão da Mudança já começou?*',
    acao: 'Fale com o time A&M · DTS + Performance', acao2: 'Chame no privado ou comente aqui.', lema: 'Leadership. Action. Results.',
  },
  fontes: '',
};
