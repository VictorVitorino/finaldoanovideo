// Textos, números e fontes do carrossel. Única fonte do conteúdo: as páginas só desenham o que está aqui.
// Trechos entre *asteriscos* saem em laranja. Todos os números vêm da pesquisa verificada
// (ver docs/carrossel-gmo-ia.md, seção Fontes).

export const CAB = { titulo: 'GESTÃO DE MUDANÇAS', sub: 'Adoção de IA que vira resultado' };

export const ABERTURA = {
  selo: 'ALVAREZ & MARSAL · DTS · PERFORMANCE',
  linhas: ['A IA É INEVITÁVEL.', 'ADOTAR É FÁCIL.', '*GERAR VALOR, NÃO.*'],
};

export const P1 = {
  kicker: '01 · A NOVA REALIDADE',
  titulo: ['QUASE TODOS JÁ USAM IA.', '*POUCOS CAPTURAM VALOR.*'],
  grafico: {
    titulo: '% das organizações que usam IA em ao menos uma função',
    x0: 2017, x1: 2026,
    series: [
      { nome: 'IA (qualquer uso)', pts: [[2017, 20], [2018, 47], [2019, 58], [2020, 50], [2021, 56], [2022, 50], [2023, 55], [2024, 78], [2025, 88], [2026, 89]] },
      { nome: 'IA generativa', pts: [[2023, 33], [2024, 71], [2025, 79]] },
    ],
  },
  velocidade: {
    titulo: 'Nenhuma tecnologia foi adotada *tão rápido* (3 anos após o lançamento)',
    itens: [{ rot: 'IA generativa', val: 54.6, dec: 1 }, { rot: 'internet', val: 30.1, dec: 1 }, { rot: 'PC', val: 19.7, dec: 1 }],
  },
  funilTitulo: 'O abismo entre adotar e capturar valor (2026)',
  funil: [
    { val: 89, rot: 'usam IA', sub: 'em ao menos uma função' },
    { val: 37, rot: 'veem efeito positivo no EBIT', sub: 'atribuído à IA' },
    { val: 6, rot: '*capturam valor significativo*', sub: '≥ 5% do EBIT vindo da IA' },
  ],
  conclusao: 'Daqui para frente, adotar IA é inevitável. *A diferença está em fazer as pessoas usarem, e bem.*',
  fontes: 'Fonte: McKinsey, The State of AI (2017–2025). Rascunho: números em verificação.',
};

export const P2 = {
  kicker: '02 · O DESAFIO',
  titulo: ['O GARGALO NÃO É O ALGORITMO.', '*SÃO AS PESSOAS.*'],
  regra: {
    rotulo: 'Onde está o esforço de uma transformação com IA',
    partes: [{ v: 10, rot: 'algoritmos' }, { v: 20, rot: 'tecnologia e dados' }, { v: 70, rot: 'pessoas e processos' }],
  },
  matrizTitulo: 'Matriz de impacto · desafios de mudança na adoção de IA',
  desafios: [
    { n: 1, nome: 'Shadow AI', p: 5, i: 4, dado: 'Rascunho: dado em verificação.' },
    { n: 2, nome: 'Lacuna de habilidades', p: 5, i: 5, dado: 'Rascunho: dado em verificação.' },
    { n: 3, nome: 'Medo e resistência', p: 4, i: 4, dado: 'Rascunho: dado em verificação.' },
    { n: 4, nome: 'Liderança sem patrocínio', p: 3, i: 5, dado: 'Rascunho: dado em verificação.' },
    { n: 5, nome: 'Processo não redesenhado', p: 4, i: 5, dado: 'Rascunho: dado em verificação.' },
    { n: 6, nome: 'Governança e risco', p: 3, i: 3, dado: 'Rascunho: dado em verificação.' },
    { n: 7, nome: 'Fadiga de mudança', p: 2, i: 3, dado: 'Rascunho: dado em verificação.' },
  ],
  conclusao: 'Os desafios críticos são *de gente e de processo*, não de tecnologia.',
  fontes: 'Fontes: rascunho, números em verificação.',
};

export const P3 = {
  kicker: '03 · O QUE FAZEMOS',
  titulo: ['IA SÓ VIRA RESULTADO', 'QUANDO VIRA *HÁBITO.*'],
  equacao: [
    { rot: 'TECNOLOGIA', sub: 'DTS' },
    { rot: 'GESTÃO DE MUDANÇAS', sub: 'PESSOAS E PROCESSOS' },
    { rot: 'PERFORMANCE', sub: 'RESULTADO' },
  ],
  etapas: [
    { n: 1, titulo: ['DIAGNÓSTICO', 'DE PRONTIDÃO'], itens: ['Mapa de impacto por área', 'Prontidão por persona'] },
    { n: 2, titulo: ['LIDERANÇA', 'E PATROCÍNIO'], itens: ['Sponsors ativos', 'Narrativa da mudança'] },
    { n: 3, titulo: ['PESSOAS E', 'CAPACITAÇÃO'], itens: ['Trilhas por persona', 'Rede de embaixadores'] },
    { n: 4, titulo: ['ADOÇÃO', 'MEDIDA'], itens: ['Cockpit de adoção', 'Ritos de acompanhamento'] },
    { n: 5, titulo: ['SUSTENTAÇÃO', 'E VALOR'], itens: ['Reforço e incentivos', 'Valor no P&L'] },
  ],
  kpisTitulo: 'O que medimos',
  kpis: [
    { ico: 'pessoas', rot: 'Uso ativo', sub: 'por área e persona' },
    { ico: 'livro', rot: 'Proficiência', sub: 'evolução por trilha' },
    { ico: 'raio', rot: 'Tempo até valor', sub: 'por caso de uso' },
    { ico: 'grafico', rot: 'Valor capturado', sub: 'no P&L' },
  ],
  selo: { num: '7x', linhas: ['MAIS CHANCE DE', 'ATINGIR OBJETIVOS'], nota: 'Projetos com gestão de mudanças excelente têm 7x mais chance de atingir seus objetivos do que os com gestão ruim.' },
  cta: { pergunta: 'Sua empresa já comprou IA.', destaque: '*Seus times já usam?*', acao: 'Fale com o time de Gestão de Mudanças · DTS', lema: 'Leadership. Action. Results.' },
  fontes: 'Fonte: rascunho, números em verificação.',
};
