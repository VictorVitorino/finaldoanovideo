// Prancha de conferência dos componentes (dados provisórios). ?test=prancha&pg=1|2 ; t = tempo local.
import { W, H, C, defs, cabecalho, rodape, kicker, t } from './base.js';
import { titulo, graficoLinha, funil, matriz, legendaMatriz, barraEmpilhada, etapas, indicadores, equacao, selo, cortina } from './componentes.js';

const pg = +(new URLSearchParams(location.search).get('pg') || 1);
const ITENS = [
  { n: 1, nome: 'Shadow AI', p: 5, i: 4, dado: 'Dado de exemplo com *destaque* e fonte (Org, 2025).' },
  { n: 2, nome: 'Lacuna de habilidades', p: 5, i: 5, dado: 'Dado de exemplo com *destaque* (Org, 2025).' },
  { n: 3, nome: 'Medo e resistência', p: 4, i: 4, dado: 'Dado de exemplo (Org, 2025).' },
  { n: 4, nome: 'Liderança ausente', p: 3, i: 5, dado: 'Dado de exemplo (Org, 2025).' },
  { n: 5, nome: 'Processo não redesenhado', p: 4, i: 5, dado: 'Dado de exemplo (Org, 2025).' },
  { n: 6, nome: 'Governança', p: 3, i: 3, dado: 'Dado de exemplo (Org, 2025).' },
  { n: 7, nome: 'Fadiga de mudança', p: 2, i: 3, dado: 'Dado de exemplo (Org, 2025).' },
];
export async function criar() {
  return {
    duration: 20,
    frame(tt) {
      let s = defs() + `<rect width="${W}" height="${H}" fill="#fff"/>`;
      s += cabecalho(pg, 3, 'GESTÃO DE MUDANÇAS', 'Adoção de IA que vira resultado');
      if (pg === 1) {
        s += kicker('01 · A NOVA REALIDADE', 48, 196);
        s += titulo(['A IA JÁ CHEGOU.', 'O VALOR, *AINDA NÃO.*'], 48, 280, tt, 0.2, { s: 78 });
        s += graficoLinha({ x: 110, y: 420, w: 880, h: 300, x0: 2017, x1: 2025, yMax: 100, t0: 1,
          series: [{ nome: 'Usam IA em ao menos uma função', cor: C.navy, pts: [[2017, 20], [2018, 47], [2019, 58], [2020, 50], [2021, 56], [2022, 50], [2023, 55], [2024, 78], [2025, 88]] },
                   { nome: 'Usam IA generativa', cor: C.orange, pts: [[2023, 33], [2024, 71], [2025, 79]], legX: 520, legY: 402 }] }, tt);
        s += funil({ x: 120, y: 820, w: 560, itens: [{ val: 88, rot: 'usam IA', sub: 'em ao menos uma função' }, { val: 39, rot: 'veem impacto no EBIT', sub: 'em qualquer nível', cor: C.slate }, { val: 6, rot: 'capturam valor relevante', sub: '≥ 5% do EBIT vindo de IA', cor: C.orange }], t0: 4 }, tt);
      } else if (pg === 2) {
        s += kicker('02 · O DESAFIO', 48, 196);
        s += barraEmpilhada({ x: 48, y: 230, w: 984, h: 64, t0: 0.5, partes: [{ v: 10, rot: 'algoritmos', cor: C.blueL }, { v: 20, rot: 'tecnologia e dados', cor: C.slate }, { v: 70, rot: 'pessoas e processos', cor: C.orange }] }, tt);
        s += matriz({ x: 100, y: 380, size: 500, itens: ITENS, t0: 1.5 }, tt);
        s += legendaMatriz({ x: 640, y: 390, w: 392, itens: ITENS, t0: 1.5 }, tt).svg;
      } else {
        s += kicker('03 · O QUE FAZEMOS', 48, 196);
        s += equacao({ x: 48, y: 230, w: 984, h: 96, t0: 0.3, ops: ['×', '='], termos: [{ rot: 'TECNOLOGIA', sub: 'DTS', cor: C.navy }, { rot: 'GESTÃO DE MUDANÇAS', sub: 'PESSOAS', cor: C.navy3, s: 30 }, { rot: 'PERFORMANCE', sub: 'RESULTADO', cor: C.orange, subCor: '#fff', brilho: true }] }, tt);
        s += etapas({ x: 48, y: 400, w: 984, h: 110, t0: 2, itens: [
          { n: 1, titulo: ['DIAGNÓSTICO', 'DE PRONTIDÃO'], itens: ['Mapa de impacto por área', 'Prontidão ADKAR'] },
          { n: 2, titulo: ['LIDERANÇA', 'E PATROCÍNIO'], itens: ['Coalizão de sponsors', 'Narrativa de mudança'] },
          { n: 3, titulo: ['PESSOAS E', 'CAPACITAÇÃO'], itens: ['Trilhas por persona', 'Rede de embaixadores'] },
          { n: 4, titulo: ['ADOÇÃO', 'MEDIDA'], itens: ['Cockpit de adoção', 'Ritos de acompanhamento'] },
          { n: 5, titulo: ['SUSTENTAÇÃO', 'E VALOR'], itens: ['Reforço e incentivos', 'Valor no P&L'] }] }, tt);
        s += indicadores({ x: 48, y: 760, w: 984, h: 92, t0: 4, itens: [{ ico: 'pessoas', rot: 'Uso ativo', sub: 'semanal por área' }, { ico: 'livro', rot: 'Proficiência', sub: 'por persona' }, { ico: 'raio', rot: 'Tempo até valor', sub: 'por caso de uso' }, { ico: 'grafico', rot: 'Impacto no P&L', sub: 'capturado' }] }, tt);
        s += selo(900, 1000, 90, '7x', ['MAIS CHANCE', 'DE SUCESSO'], tt, 5);
      }
      s += rodape(pg, 3, 'Fontes: dados provisórios para conferência de layout.', { arraste: true, prog: (tt % 10) / 10 });
      const cu = (tt - 18) / 1.2;
      s += cortina(cu, W, H);
      return s;
    },
  };
}
