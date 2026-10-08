// Prancha de teste do ambiente SpecForge (src/sf/ambiente.js).
//   0–1.7 s  cena creme com chrome completo     1.7–2.6 s  transição
//   2.15–4 s cartão de fase                     4–6 s      palco + confete
// Tons do papel e cores de blob: veja a prancha em 1.5 s.
import { g, tr, text, C, clamp } from '../core.js';
import * as A from '../sf/ambiente.js';

const INK = '#2b2b36';
// forma de teste com escala de personagem (~300 px de altura)
function boneco(x, y, cor, t, s = 1) {
  const b = 3 * Math.sin(t * 2.4 + x);
  return `<ellipse cx="${x}" cy="${y + 4}" rx="${80 * s}" ry="${11 * s}" fill="rgba(60,45,25,.18)"/>` +
    g(tr(x, y + b * 0.3, s), `<rect x="-62" y="-190" width="124" height="190" rx="58" fill="${cor}" stroke="${INK}" stroke-width="5"/><circle cy="${-235 + b}" r="72" fill="${cor}" stroke="${INK}" stroke-width="5"/><circle cx="-22" cy="${-240 + b}" r="9" fill="${INK}"/><circle cx="22" cy="${-240 + b}" r="9" fill="${INK}"/><path d="M-20 ${-212 + b}q20 16 40 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
}

const TOTAL = 140;

function cena(t) {
  let s = A.papel(t, { tom: 'creme', seed: 7 });
  s += A.blob(430, 640, 300, 'teal', t, 1);
  s += A.blob(1480, 600, 270, 'rosa', t, 2);
  s += A.blob(960, 330, 200, 'amarelo', t, 5, { op: 0.45 });
  s += A.chao(905);
  s += A.brilhos(t, 3);
  s += boneco(430, 900, '#3aa6d8', t) + boneco(1480, 900, '#d94b8b', t);
  s += A.regua(18 + t, TOTAL);
  s += A.marca(t + 0.2);
  s += A.pilulaCapitulo(2, 'Parte 1 · A parceria', 'Começa a parceria', t);
  s += A.legenda('A nossa começou com *um projeto.* E não parou mais de crescer.', t, 0.05, 1.75, {});
  return s;
}

function tons(t) {
  const Q = [['creme', 0, 0], ['bege', 960, 0], ['dourado', 0, 540], ['noite', 960, 540]];
  const cores = Object.keys(A.BLOB);
  let s = '';
  Q.forEach(([tom, x, y], i) => {
    const id = 'sfQ' + i;
    s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="960" height="540"/></clipPath>`;
    let q = A.papel(t, { tom, seed: 3 + i });
    const noite = tom === 'noite';
    const c1 = cores[(i * 2) % 7], c2 = cores[(i * 2 + 1) % 7];
    q += A.blob(x + 270, y + 300, 170, c1, t, 10 + i, { noite });
    q += A.blob(x + 690, y + 290, 150, noite ? 'azul' : c2, t, 20 + i, { noite });
    q += A.chao(y + 440, { x0: x + 40, x1: x + 920, noite });
    q += boneco(x + 270, y + 440, '#3aa6d8', t, 0.62) + boneco(x + 690, y + 440, '#f2b84b', t, 0.62);
    if (noite) q += A.brilhos(t, 9, { noite: true, area: [x + 40, y + 40, 880, 360], n: 12 });
    q += text(tom.toUpperCase() + ` · ${c1} / ${noite ? 'azul' : c2}`, x + 480, y + 70, { size: 30, weight: 800, fill: noite ? '#dfe6ff' : INK });
    s += g('', q, `clip-path="url(#${id})"`);
  });
  s += A.regua(40 + t, TOTAL, {});
  s += A.marca(9, { noite: false });
  s += A.pilulaCapitulo(1, 'Prólogo · A crise', 'Tons do papel', 9, { cor: C.navy });
  s += A.legenda('Gente… *mas pagou a NF?* E esta legenda é longa o bastante para quebrar em duas linhas na pílula escura.', t, 1.0, 3, { quem: 'Giovanna', cor: '#d94b4b' });
  // pequeno pílula noite no canto
  s += A.marca(9, { noite: true, x: 1650, y: 1010, h: 44 });
  return s;
}

function fase(t) {
  return A.cartaoFase(2, 'Parte 1 · A parceria', 'Começa a parceria', 'aperto', t - 2.15, {
    total: 6, atual: 2, grupos: [{ n: 1, rotulo: 'O DESAFIO', cor: C.navy }, { n: 4, rotulo: 'A PARCERIA', cor: C.blue }, { n: 1, rotulo: 'O FECHAMENTO', cor: '#d9901a' }],
  });
}

function festa(t) {
  const id = t - 4;
  let s = A.palco(t, { idade: id });
  s += A.chao(905);
  s += A.blob(960, 640, 330, 'lilas', t, 8, { op: 0.4 });
  s += boneco(760, 900, '#3aa6d8', t) + boneco(960, 900, '#1f2d4d', t, 1.1) + boneco(1160, 900, '#d94b4b', t);
  s += A.brilhos(t, 12, { n: 18 });
  s += A.estouro(960, 470, id - 0.55, 4);
  s += A.confete(id - 0.2, 6);
  s += A.regua(130 + t, TOTAL);
  s += A.marca(9);
  s += A.pilulaCapitulo(6, 'Parte 3 · O fechamento', 'Um time', id, { cor: '#d9901a' });
  s += A.legenda('Isso não é sorte. É *método e confiança.*', t, 4.3, 6.2, { quem: 'Antonialli', cor: '#1f2d4d' });
  // ícones do cartão (conferência)
  ['alerta', 'aperto', 'pin', 'engrenagem', 'moeda', 'estrela'].forEach((n, i) => {
    s += `<circle cx="${1500 + i * 62}" cy="330" r="26" fill="${C.blue}" stroke="${INK}" stroke-width="3"/>` + A.icone(n, 1500 + i * 62, 330, 32);
  });
  return s;
}

export function criar() {
  return {
    duration: 6,
    frame(t) {
      let s = A.defs();
      if (t < 1.0) s += cena(t);
      else if (t < 2.15) s += tons(t);
      else if (t < 4) s += fase(t);
      else s += festa(t);
      s += A.transicao(t, 1.7, { dur: 0.9 });
      return s;
    },
  };
}
