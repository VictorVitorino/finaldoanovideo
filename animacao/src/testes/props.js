// Prancha de teste dos props (src/sf/props.js).
// t < 10: prancha geral (tudo reduzido). Pranchas de detalhe, em tamanho real:
//   t 10–20 cena 1 · 20–30 escritório · 30–40 seis lugares · 40–50 cena 4/5 · 50–60 mosaico
import { C, text } from '../core.js';
import * as P from '../sf/props.js';

const ESC = '#141826';
const fundo = (cor = C.bg) => `<rect width="1920" height="1080" fill="${cor}"/>`;
const rot = (s, x, y, cor = '#2b2b36') => text(s, x, y, { size: 22, weight: 800, fill: cor, anchor: 'start' });
const esc = (x, y, k, body) => `<g transform="translate(${x} ${y}) scale(${k})">${body}</g>`;
const LUG = ['hospital', 'laboratorio', 'fabrica', 'fazenda', 'estacao', 'obra'];

function cena1(i) {
  let s = P.janelaERP(560, 330, 640, 400, i - 0.3, {});
  s += P.alertaPopup(1180, 160, i, {});
  s += P.alertaPopup(1300, 300, i - 0.25, { icone: 'erro', rot: 4 });
  s += P.alertaPopup(1120, 440, i - 0.5, { texto: 'GO-LIVE ADIADO', icone: 'sino', rot: -3 });
  s += P.telefone(1660, 470, i - 0.1, {});
  s += P.conectores(560, 800, 760, 400, i - 0.4, {});
  s += P.conectores(1380, 800, 760, 400, i - 0.4, { alinhado: Math.min(1, Math.max(0, (i - 1.5) / 1)) });
  return s;
}
function escritorioP(i) {
  let s = P.escritorio(760, 520, i, { itens: ['estante', 'mesa', 'cadeira', 'planta', 'quadro'] });
  s += P.escritorio(560, 1000, i - 0.3, { itens: ['planta', { tipo: 'mesa', telefone: 1, toca: 1 }, 'cadeira'] });
  s += P.celular(1500, 360, i, { nome: 'Paladini' });
  s += P.celular(1760, 380, i - 0.2, { mao: 1, escala: 0.8, rot: 8 });
  s += P.robo(1180, 1000, i, {});
  s += P.robo(1400, 1000, i - 0.2, { acao: 'trabalha', cor: '#7cbf5a' });
  s += P.telefoneFixo(1700, 1000, i, {});
  return s;
}
function lugares(i, k = 0.62) {
  let s = '';
  LUG.forEach((n, j) => {
    const x = 330 + (j % 3) * 630, y = j < 3 ? 470 : 1020;
    s += P[n](x, y, i - j * 0.08, { escala: k });
  });
  return s;
}
function cena45(i) {
  let s = P.slide('integrada', 330, 200, 1100, 620, i, { escala: 0.5, zoom: Math.max(0, Math.min(1, (i - 3) / 1.5)) });
  s += P.slide('mits', 930, 200, 1100, 620, i - 0.1, { escala: 0.5, etiqueta: 1 });
  s += P.slide('remediacao', 330, 545, 1100, 620, i - 0.2, { escala: 0.5 });
  s += P.slide('ia', 930, 545, 1100, 620, i - 0.3, { escala: 0.5 });
  s += P.pptParaDashboard(1560, 260, 1000, 600, i, { escala: 0.6 });
  s += P.painelFinanceiro(1560, 820, 1100, 560, i, { escala: 0.55, titulo: 'FY26' });
  s += P.robo(1000, 1040, i, { escala: 0.9 });
  s += P.robo(1150, 1040, i - 0.15, { acao: 'pula', cor: '#ef8fa0', escala: 0.8 });
  s += P.painelFinanceiro(500, 880, 1100, 560, i, { escala: 0.32 });
  return s;
}
const quadro = (n, i) => fundo() + `<rect y="900" width="1920" height="180" fill="#ebdfca"/>` + P[n](1200, 900, i, { escala: 1.4 });

export function criar() {
  return {
    duration: 6,
    frame(t) {
      let s = '<defs>' + P.defs() + '</defs>';
      if (t < 10) {
        // prancha geral
        s += fundo();
        s += `<rect x="16" y="16" width="940" height="330" rx="22" fill="${ESC}"/>`;
        s += esc(16, 16, 0.3, cena1(t)) + rot('cena 1', 36, 330, '#c9cbe0');
        s += esc(980, 0, 0.3, escritorioP(t)) + esc(990, 350, 0.44, cena45(t));
        s += rot('escritório · cena 4/5', 980, 330);
        s += esc(0, 340, 0.5, lugares(t, 0.62)) + rot('cena 3', 30, 880);
        s += P.mosaico(t - 0.5, LUG.map(n => quadro(n, 3)), { cx: 1440, cy: 968, w: 150, gap: 16, rotulos: ['UNIMED', 'FUNED', 'CAOA', 'JOHN DEERE', 'HUGHES', 'LIBERCON'] });
        return s;
      }
      const i = t % 10, p = Math.floor(t / 10);
      if (p === 1) return s + fundo(ESC) + cena1(i);
      if (p === 2) return s + fundo() + escritorioP(i);
      if (p === 3) return s + fundo() + lugares(i);
      if (p === 4) return s + fundo() + esc(-80, -60, 1.1, cena45(i));
      return s + fundo() + P.mosaico(i, LUG.map(n => quadro(n, 3)), { rotulos: ['UNIMED', 'FUNED', 'CAOA', 'JOHN DEERE', 'HUGHES', 'LIBERCON'] });
    },
  };
}
