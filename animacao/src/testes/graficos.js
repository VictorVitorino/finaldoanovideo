// Prancha de teste dos grafismos (src/sf/graficos.js).
// ?pg=1..11 mostra uma página em tamanho real; sem pg, a prancha 4x3 com todas.
import { C, g, tr, text } from '../core.js';
import * as G from '../sf/graficos.js';

const PROJ = [
  { n: '01', cliente: 'UNIMED BRASIL', frente: 'Remediação', erp: 'ERP Protheus', logo: 'unimed', time: ['Bruno Moraes'] },
  { n: '04', cliente: 'JOHN DEERE ARGENTINA', frente: 'Remediação', erp: 'ERP Protheus', logo: 'john-deere', time: ['João Lopes', 'Marcus Mancini', 'Jaqueline Valdevino'] },
];
const CRISE = ['ESCOPO SUBDIMENSIONADO.', 'REWORK.', 'MAPEAMENTO DE PROCESSOS DESALINHADO', 'GO-LIVE ADIADO.'];

const fundo = (escuro = false) => escuro ? `<rect width="1920" height="1080" fill="#14161d"/>`
  : `<rect width="1920" height="1080" fill="${C.bg}"/>` + Array.from({ length: 32 }, (_, i) => `<rect x="${i * 60}" y="0" width="1" height="1080" fill="#000" opacity=".035"/>`).join('')
    + Array.from({ length: 18 }, (_, i) => `<rect x="0" y="${i * 60}" width="1920" height="1" fill="#000" opacity=".035"/>`).join('');

const PAGINAS = [
  { nome: 'base', f: t => G.adesivo('NO MÉTODO!', 420, 170, t - 0.1)
      + G.carimbo('APROVADO', 1000, 150, t - 0.5) + G.carimbo('ATENÇÃO', 1000, 290, t - 0.8, { cor: 'laranja', icone: 'alerta' }) + G.carimbo('ADIADO', 1000, 430, t - 1.1, { cor: 'vermelho' })
      + G.bilhete('Bilhete', 'Antecipar algumas notas para o FY26?', 1540, 200, t - 0.3)
      + G.chip('Remediação', 160, 380, t - 0.4, { icone: 'engrenagem', cor: G.COR.laranja, ancora: 'start' })
      + G.chip('ERP Protheus', 160, 450, t - 0.55, { icone: 'erp', cor: G.COR.totvs, ancora: 'start' })
      + G.chip('Bruno Moraes', 420, 380, t - 0.7, { icone: 'pessoa', cor: G.COR.navy, ancora: 'start' })
      + G.chip('TMO + GMO', 420, 450, t - 0.85, { icone: 'engrenagem', cor: G.COR.laranja, solido: true, ancora: 'start' })
      + G.checklist('Checklist', ['Escopo', 'Processos', 'Go-live'], 420, 720, t - 0.2, { marcas: ['ok', 'ok', 'x'], tempos: [0.7, 1.2, 1.8] })
      + G.cartao(1000, 760, 400, 300, t - 0.6, { cabecalho: 'Regras da casa', estilo: 'faixa', conteudo: (w, h) => [0, 1, 2].map(i => `<rect x="40" y="${70 + i * 70}" width="${w - 80}" height="14" rx="7" fill="${C.bg2}"/>`).join('') })
      + G.balaoLogo('totvs', 1440, 610, t - 0.9) + G.balaoLogo('unimed', 1740, 610, t - 1.1)
      + `<circle cx="1440" cy="660" r="40" fill="${C.bg2}"/><circle cx="1740" cy="660" r="40" fill="${C.bg2}"/>`
      + G.placaNome('Giovanna Brandão', 'Hughes', 1440, 800, t - 1.2, { cor: '#d94b4b' }) + G.placaNome('Bruno Moraes', '', 1740, 800, t - 1.4) },
  { nome: 'cartoes', f: t => G.cartaoProjeto(PROJ[0], 430, 320, t - 0.1) + G.cartaoProjeto(PROJ[1], 1130, 360, t - 0.4)
      + G.terceiroInferior('Guilherme Antonialli', 'Diretor Sênior · Liderança da parceria A&M + TOTVS', 120, 780, t - 0.6, { rotulo: 'Liderança' })
      + G.balaoLogo('john-deere', 1680, 260, t - 1) },
  { nome: 'antesDepois', f: t => G.antesDepois(960, 520, t - 0.1) },
  { nome: 'crise', escuro: true, f: t => { const i = Math.min(3, Math.floor(t / 1.5)); return G.textoCrise(CRISE[i], t - i * 1.5); } },
  { nome: 'valor', f: t => G.tipoSuave('Toda parceria tem um começo.', 960, 170, t - 0.1) + G.palavrasValor(t - 0.4, { y: 470 }) },
  { nome: 'totais', f: t => G.totais(t - 0.1) },
  { nome: 'numeros', f: t => G.numeroHeroi('R$ 7 MILHÕES', 'NO FY26', 960, 290, t - 0.1) + G.numeroHeroi('R$ [X] MILHÕES', 'JÁ PREVISTOS PARA O FY27', 960, 720, t - 1.6) },
  { nome: 'logos', f: t => G.faixaLogos(t - 0.1, { y: 170 }) + G.lockupFinal(t - 0.6, { y: 520 }) },
  { nome: 'telefone', f: t => G.telefonema('Giovanna', 'Bruno', t - 0.1, { ativo: t < 3 ? 'A' : 'ambos' })
      + G.gotaSuor(560, 560, t - 1.2) + G.interrogacao(400, 520, t - 1.0) + G.exclamacao(1500, 520, t - 1.3) },
  { nome: 'missao', escuro: true, f: t => (t < 3.4 ? G.tituloMissao('OPERAÇÃO COLLECTION ZERO DEFECT', t - 0.1) : G.mas_detalhe(t - 3.4, { cor: '#fff' }))
      + G.riscoDisco(t - 2.6) },
  { nome: 'anime', f: t => G.linhasVelocidade(960, 540, t - 0.1, { r: 330 }) + G.impacto(600, 380, (t - 0.2) % 1.2)
      + G.brilhoCabelo(1300, 420, (t - 0.3) % 1.0) + G.gotaSuor(960, 560, t - 0.4) + G.exclamacao(960, 440, t - 0.2)
      + G.linhasVelocidade(960, 950, t - 0.1, { tipo: 'horizontal', h: 180, n: 20, op: 0.5 }) },
];

export function criar({ layer }) {
  const pg = +(new URLSearchParams(location.search).get('pg') || 0);
  const cheio = layer !== 'overlay';
  const pagina = (p, t) => (cheio ? fundo(p.escuro) : '') + p.f(t);
  return {
    duration: 6,
    frame(t) {
      let s = `<defs>${G.defs()}</defs>`;
      if (pg) return s + pagina(PAGINAS[pg - 1], t);
      // prancha 4x3 com as 11 páginas
      if (cheio) s += `<rect width="1920" height="1080" fill="${C.bg2}"/>`;
      PAGINAS.forEach((p, i) => {
        s += g(tr((i % 4) * 480, Math.floor(i / 4) * 360, 0.25), `<svg width="1920" height="1080" viewBox="0 0 1920 1080" overflow="hidden">${pagina(p, t)}</svg>`)
          + (cheio ? text(p.nome, (i % 4) * 480 + 10, Math.floor(i / 4) * 360 + 296, { size: 18, weight: 800, anchor: 'start', fill: '#6b6f7e' }) : '');
      });
      return s;
    },
  };
}
