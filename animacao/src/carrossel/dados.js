// Textos, números e fontes do carrossel. Única fonte do conteúdo: as páginas só desenham o que está aqui.
// Trechos entre *asteriscos* saem em laranja. Só entram números verificados na fonte
// (status, recorte e URL de cada um em docs/carrossel-gmo-ia.md, seção Fontes).

export const CAB = { titulo: 'GESTÃO DE MUDANÇAS', sub: 'Adoção de IA que vira resultado' };

export const ABERTURA = {
  selo: 'ALVAREZ & MARSAL · DTS · PERFORMANCE',
  linhas: ['A IA É INEVITÁVEL.', 'COMPRAR IA É FÁCIL.', '*GERAR VALOR EXIGE*', '*GESTÃO DE MUDANÇAS.*'],
};

export const P1 = {
  kicker: '01 · A NOVA REALIDADE',
  titulo: ['A IA JÁ ESTÁ NA SUA EMPRESA.', '*O RESULTADO, AINDA NÃO.*'],
  grafico: {
    titulo: '% dos respondentes cuja organização usa IA em ao menos uma função',
    x0: 2017, x1: 2026,
    series: [
      // McKinsey Global Surveys on the state of AI, 2017–2026 (2026: "nearly nine in ten"; 89% no artigo McKinsey derivado)
      { nome: 'IA (qualquer tipo)', pts: [[2017, 20], [2018, 47], [2019, 58], [2020, 50], [2021, 56], [2022, 50], [2023, 55], [2024, 78], [2025, 88], [2026, 89]] },
      { nome: 'IA generativa', pts: [[2023, 33], [2024, 71], [2025, 79]] },
    ],
  },
  // faixa sobre o gráfico: velocidade de adoção (St. Louis Fed, adultos de 18 a 64 anos nos EUA)
  faixa: {
    titulo: '*Nunca foi tão rápido:* adoção 3 anos após o lançamento (EUA)',
    itens: [
      { rot: 'IA generativa', val: 54.6, dec: 1, max: 60 },
      { rot: 'internet', val: 30.1, dec: 1, max: 60 },
      { rot: 'PC', val: 19.7, dec: 1, max: 60 },
    ],
  },
  abismoTitulo: 'O ganho individual raramente vira *EBIT relevante* (2026)',
  abismo: [
    { val: 80, rot: 'dizem que a IA elevou sua produtividade' },
    { val: 37, rot: 'relatam contribuição da IA no EBIT' },
    { val: 6, rot: '*atribuem à IA ≥ 5% do EBIT*' },
  ],
  abismoNota: '% do total de respondentes · perguntas distintas, não etapas',
  conclusao: 'No Brasil, *83% dos profissionais do conhecimento já usam IA* (2024), mas só *17% das empresas* usam (2025). A vantagem é de quem transforma uso em EBIT.',
  fontes: 'Fontes: McKinsey, Global Surveys on the state of AI 2017–2025 e The State of AI in 2026 (1.719 respondentes; 2026 = "quase 9 em 10", 89% em artigo McKinsey); definição de uso varia entre os anos · St. Louis Fed, nov/2025: adultos de 18 a 64 anos nos EUA · Microsoft/LinkedIn, Work Trend Index 2024 (trabalhadores do conhecimento) · Cetic.br, TIC Empresas 2025 (empresas com 10+ pessoas ocupadas).',
};

export const P2 = {
  kicker: '02 · O DESAFIO',
  titulo: ['O GARGALO NÃO É O ALGORITMO.', '*SÃO PESSOAS E PROCESSOS.*'],
  regra: {
    rotulo: 'Regra 10-20-70 da BCG · onde investir para escalar IA',
    nota: 'regra prática de alocação do investimento',
    partes: [{ v: 10, rot: 'algoritmos' }, { v: 20, rot: 'tecnologia e dados' }, { v: 70, rot: 'pessoas e processos' }],
  },
  matrizTitulo: 'Matriz de impacto · desafios na adoção de IA',
  matrizEscala: 'Probabilidade: frequência nas pesquisas · Impacto: efeito na captura de valor · Crítico: P × I ≥ 16',
  // nat: 'gente' | 'processo' | 'tecnologia' (cor da bolha). p e i de 1 a 5.
  desafios: [
    { n: 1, nome: 'Liderança desalinhada', nat: 'gente', p: 5, i: 5, dado: 'só *26%* dos usuários de IA a veem alinhada', fonte: 'Microsoft, 2026' },
    { n: 2, nome: 'Processo intocado', nat: 'processo', p: 5, i: 5, dado: 'fora da elite, só *~1 em 4* redesenhou fluxos', fonte: 'McKinsey, 2026' },
    { n: 3, nome: 'Dados não prontos', nat: 'tecnologia', p: 5, i: 5, dado: '*63%* sem dados prontos para IA, ou sem saber', fonte: 'Gartner, 2025' },
    { n: 4, nome: 'Lacuna de habilidades', nat: 'gente', p: 5, i: 4, dado: 'só *36%* sentem ter capacitação adequada', fonte: 'BCG, 2026' },
    { n: 5, nome: 'Pilotite crônica', nat: 'processo', p: 4, i: 5, dado: 'abandono da maioria das iniciativas: *17% → 42%*', fonte: 'S&P Global, 2025' },
    { n: 6, nome: 'Confiança cega', nat: 'gente', p: 4, i: 4, dado: '*51%* já tiveram consequência negativa', fonte: 'McKinsey, 2025' },
    { n: 7, nome: 'Medo do emprego', nat: 'gente', p: 4, i: 3, dado: '*41%* temem perder o emprego em 10 anos', fonte: 'BCG, 2025' },
    { n: 8, nome: 'Shadow AI', nat: 'gente', p: 3, i: 4, dado: '*1 em 5* organizações violadas: shadow AI', fonte: 'IBM, 2025' },
  ],
  conclusao: 'Dos 6 desafios críticos, *5 são de gente e processo.* Tecnologia sozinha não fecha o abismo.',
  fontes: 'Fontes: BCG, Where\'s the Value in AI? (2024) e AI at Work 2025/2026 · Microsoft, Work Trend Index 2026 · McKinsey, The State of AI 2025/2026 · Gartner (fev/2025) · S&P Global, VotE AI & ML 2025 (América do Norte e Europa) · IBM, Cost of a Data Breach 2025. Probabilidade e impacto: leitura A&M a partir dos dados citados.',
};

export const P3 = {
  kicker: '03 · O QUE FAZEMOS',
  titulo: ['IA SÓ VIRA RESULTADO', 'QUANDO VIRA *HÁBITO.*'],
  equacao: [
    { rot: 'TECNOLOGIA', sub: 'DTS' },
    { rot: 'GESTÃO DE MUDANÇAS', sub: 'PESSOAS E PROCESSOS' },
    { rot: 'PERFORMANCE', sub: 'RESULTADO NO P&L' },
  ],
  equacaoNota: 'É multiplicação: *se um dos lados é zero, o resultado é zero.*',
  metodoTitulo: 'Nosso método · cada etapa ataca os desafios da matriz',
  etapas: [
    { n: 1, titulo: ['DIAGNÓSTICO', 'DE PRONTIDÃO'], ataca: [3, 5, 8], itens: ['Prontidão e uso real, inclusive shadow AI'] },
    { n: 2, titulo: ['LIDERANÇA', 'E PATROCÍNIO'], ataca: [1, 7], itens: ['Narrativa do CEO e rede de sponsors'] },
    { n: 3, titulo: ['TRABALHO', 'REDESENHADO'], ataca: [2, 5], itens: ['Fluxos redesenhados com metas no P&L'] },
    { n: 4, titulo: ['PESSOAS E', 'CAPACITAÇÃO'], ataca: [4, 6, 8], itens: ['Trilhas por persona e guardrails de uso'] },
    { n: 5, titulo: ['ADOÇÃO MEDIDA', 'E SUSTENTADA'], ataca: [5], itens: ['Cockpit de adoção e ritos de reforço'] },
  ],
  kpisTitulo: 'O que medimos',
  kpis: [
    { ico: 'pessoas', rot: 'Uso ativo' },
    { ico: 'livro', rot: 'Proficiência' },
    { ico: 'raio', rot: 'Tempo até valor' },
    { ico: 'escudo', rot: 'Confiança' },
    { ico: 'grafico', rot: 'Valor no P&L' },
  ],
  prova: {
    num: '7x', rot: 'mais chance de atingir os objetivos',
    barras: [{ v: 13, rot: 'ruim' }, { v: 39, rot: 'razoável' }, { v: 73, rot: 'boa' }, { v: 88, rot: 'excelente' }],
    eixo: 'qualidade da gestão de mudanças',
    nota: 'Prosci · benchmark · correlação',
  },
  cta: {
    pergunta: 'Sua empresa já adotou IA.', destaque: '*Ela já gera resultado?*',
    acao: 'Comece por um diagnóstico de prontidão para IA.', acao2: 'Fale com o time A&M · DTS + Performance',
    lema: 'Leadership. Action. Results.',
  },
  fontes: 'Fonte: Prosci, The Correlation Between Change Management and Project Success: % de projetos que atingiram ou superaram os objetivos, por qualidade da gestão de mudanças (benchmark cumulativo; correlação; projetos de mudança em geral). Método e entregáveis: oferta do time A&M DTS + Performance.',
};
