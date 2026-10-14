// Cena 4 · IA COMO MÉTODO — "Aqui, IA não é moda. É MÉTODO." (≈ 22.21 → 26.14 s)
//
// A cena mais "socada" do filme. Batidas (tempos absolutos via ctx.wa / ctx.wb):
//   t0 … wa(41)  pré-rolagem: o chip de IA está "desligado" no centro (cursor piscando, scanlines),
//                trilhas de circuito trazem pulsos de energia para dentro dele, um anel orbital
//                tracejado gira ao redor; Victor (esq.) e o robô IA (dir.) aguardam; câmera empurra.
//   wa(41)       "Aqui,": pílula "AQUI, NA DTS" cai do alto com um pino; Victor apresenta o chip.
//   wa(42)       "IA": as letras IA despencam da câmera para dentro do chip (eco de zoom), impacto
//                com flash, glitch RGB, brilho laranja, onda de choque azul, faíscas, tremor;
//                a energia volta pelas trilhas; cantos de HUD travam no chip; o robô aponta.
//   wa(43..44)   "não é": micro-glitch; a câmera antecipa o lado direito.
//   wa(45)       "moda": cartão "#MODA" (EM ALTA, curtidas, seta de tendência, brilhos) e as tags
//                #hype / #viral saltam; logo em seguida dois riscos navy o cortam em X, o cartão
//                desbota, racha e se ESTILHAÇA em cacos e partículas (em "É").
//   wa(47)       "MÉTODO": o carimbo cai da câmera e crava no chip — tremor forte, onda de choque,
//                anel retangular, poeira, faíscas, flash; a câmera recua e revela a prancheta azul
//                (blueprint) e o ciclo de método Contexto → Prompt → Teste → Entrega, com as setas
//                se desenhando nó a nó; o glitch some (a IA fica estável: método!).
//   até t1       pulso de luz percorre o ciclo e acende cada nó; varredura de luz no carimbo.
import {
  COR, INK, W, H, CHAO, txt, largura, pilula, cartao, icone, pessoa,
  clamp, lerp, inv, ease, kf, rng, n2, back, fin, popG, opa,
  fundoCreme, chao, varredura, onda, flash, particulas, poeira, hudCantos, tremor, carimbo, faiscas,
} from '../base.js';

const f = n2;

// glitch local (paleta da marca): canais deslocados em azul/laranja que somem com k e
// faixas finas que se dissolvem — nada de placas sólidas fora da paleta.
function glitchIA(str, x, y, o, t, k) {
  const base = txt(str, x, y, o);
  if (k <= 0.01) return base;
  const r = rng(Math.floor(t * 24) * 7 + 3);
  const dx = (r() - 0.5) * 30 * k;
  let s = `<g opacity="${f(0.8 * k)}">${txt(str, x - 6 * k + dx, y, { ...o, fill: COR.blue2 })}${txt(str, x + 6 * k - dx, y, { ...o, fill: COR.orange })}</g>` + base;
  const size = o.size ?? 32;
  for (let i = 0; i < 3; i++) {
    const yy = y - size * r(), hh = 3 + r() * size * 0.06, off = (r() - 0.5) * 60 * k;
    const id = `ia_gl${i}`;
    s += `<clipPath id="${id}"><rect x="${f(x - 2000)}" y="${f(yy)}" width="4000" height="${f(hh)}"/></clipPath>`
      + `<g clip-path="url(#${id})" transform="translate(${f(off)} 0)" opacity="${f(clamp(k * 1.4))}">${txt(str, x, y, { ...o, fill: i % 2 ? COR.blue3 : (o.fill ?? COR.navy) })}</g>`;
  }
  return s;
}

export const CHIP = ['CENA 4 · IA COMO MÉTODO', 'Não é moda'];

// ---------- geometria ----------
const CX = 960, CY = 468, CW = 460, CH = 300;      // chip de IA
const EX = 960, EY = 520, ERX = 560, ERY = 252;    // elipse do ciclo de método
const STX = 960, STY = 656, STS = 84, STR = -6;    // carimbo MÉTODO
const MX = 1442, MY = 314, MR = 6;                 // cartão #MODA
const VX = 252, RX = 1700;                         // Victor e robô
const PX = 960, PY = 520;                          // pivô da câmera
const STW = largura('MÉTODO', STS, 900) + 6 * 4 + 70, STH = STS * 1.6;

// ---------- utilidades de polilinha ----------
function comp(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
// parte inicial da polilinha até a fração u; devolve caminho, ponta e ângulo
function parte(pts, u) {
  const L = comp(pts) * clamp(u);
  let acc = 0, d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  let end = pts[0], ang = Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]);
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const sl = Math.hypot(bx - ax, by - ay);
    ang = Math.atan2(by - ay, bx - ax);
    if (acc + sl >= L) {
      const k = sl ? (L - acc) / sl : 0;
      end = [ax + (bx - ax) * k, ay + (by - ay) * k];
      d += ` L${f(end[0])},${f(end[1])}`;
      return { d, end, ang };
    }
    acc += sl;
    d += ` L${f(bx)},${f(by)}`;
    end = pts[i];
  }
  return { d, end, ang };
}
const caminho = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join(' ');

// ---------- trilhas de circuito (do chip para fora) ----------
const TRILHAS = (() => {
  const L = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const y0 = CY - 100 + i * 50, k = i - 2;
      const x0 = CX + side * (CW / 2 + 18);
      const d = Math.abs(k) * 34;
      const x1 = x0 + side * (36 + (2 - Math.abs(k)) * 26);
      const x2 = x1 + side * d, y2 = y0 + Math.sign(k) * d;
      const xe = CX + side * (575 - Math.abs(k) * 22 + (i % 2) * 26);
      L.push([[x0, y0], [x1, y0], [x2, y2], [xe, y2]]);
    }
  }
  return L;
})();

// ---------- ciclo de método ----------
const ANG = [-135, -45, 45, 135].map(a => a * Math.PI / 180);
const NOS = [
  { lab: 'Contexto', ic: 'compass' }, { lab: 'Prompt', ic: 'chat' },
  { lab: 'Teste', ic: 'gauge' }, { lab: 'Entrega', ic: 'box' },
].map((n, i) => ({ ...n, x: EX + ERX * Math.cos(ANG[i]), y: EY + ERY * Math.sin(ANG[i]) }));
const DEL = 21 * Math.PI / 180;
const ARCOS = [0, 1, 2, 3].map(i => {
  const a0 = ANG[i] + DEL, a1 = ANG[i] + Math.PI / 2 - DEL;
  const pts = [];
  const ry = i === 2 ? ERY + 24 : ERY; // arco de baixo afastado do carimbo
  for (let k = 0; k <= 30; k++) { const a = lerp(a0, a1, k / 30); pts.push([EX + ERX * Math.cos(a), EY + ry * Math.sin(a)]); }
  return pts;
});
const LOOP = ARCOS.flat();

// ---------- cacos do cartão #MODA (coordenadas locais do cartão) ----------
const CACOS = (() => {
  const r = rng(404);
  const xs = [-196, -64, 58, 196], ys = [-110, 4, 112];
  const V = ys.map((y, j) => xs.map((x, i) => [x + (i > 0 && i < 3 ? (r() - 0.5) * 56 : 0), y + (j === 1 ? (r() - 0.5) * 50 : 0)]));
  const tris = [];
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) {
    const a = V[j][i], b = V[j][i + 1], c = V[j + 1][i + 1], d = V[j + 1][i];
    if ((i + j) % 2) tris.push([a, b, c], [a, c, d]); else tris.push([a, b, d], [b, c, d]);
  }
  return tris.map(p => {
    const cx = (p[0][0] + p[1][0] + p[2][0]) / 3, cy = (p[0][1] + p[1][1] + p[2][1]) / 3;
    return { p, cx, cy, vx: cx * 3.4 + 320 + (r() - 0.5) * 300, vy: cy * 2.4 - 220 - r() * 220, rot: (r() - 0.5) * 720 };
  });
})();

// ---------- defs locais ----------
function defs() {
  return `<defs>`
    + `<radialGradient id="ia_halo"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".55"/><stop offset=".5" stop-color="${COR.orange}" stop-opacity=".16"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="ia_azul"><stop offset="0" stop-color="${COR.blue3}" stop-opacity=".7"/><stop offset="1" stop-color="${COR.blue3}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="ia_pul"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${COR.orange2}"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="ia_scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COR.blue3}" stop-opacity="0"/><stop offset=".85" stop-color="${COR.blue3}" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></linearGradient>`
    + `</defs>`;
}

// ---------- pino de mapa ----------
const pino = (x, y, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="M0,15 C-4,7 -12,1 -12,-7 A12,12 0 1 1 12,-7 C12,1 4,7 0,15Z" fill="${COR.orange}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-7" r="4.5" fill="#fff"/></g>`;

// estrela de 4 pontas (brilho)
const estrela = (x, y, r, cor = COR.orange, sw = 2.5) => `<path d="M${f(x)},${f(y - r)} Q${f(x + r * 0.16)},${f(y - r * 0.16)} ${f(x + r)},${f(y)} Q${f(x + r * 0.16)},${f(y + r * 0.16)} ${f(x)},${f(y + r)} Q${f(x - r * 0.16)},${f(y + r * 0.16)} ${f(x - r)},${f(y)} Q${f(x - r * 0.16)},${f(y - r * 0.16)} ${f(x)},${f(y - r)}Z" fill="${cor}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;

// ---------- robô IA (variante local do mascote, com olhos expressivos e braços controláveis) ----------
function roboIA(x, y, t, s, o = {}) {
  const bob = Math.sin(t * 3) * 6 - (o.hop ?? 0);
  const st = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  const blink = (t % 3.1) < 0.12 ? 0.15 : 1;
  const olho = '#7fd3ff';
  let olhos = '', boca = '';
  switch (o.eyes ?? 'normal') {
    case 'happy':
      olhos = `<path d="M-27,-100 Q-17,-117 -7,-100 M7,-100 Q17,-117 27,-100" stroke="${olho}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      boca = `<path d="M-14,-88 Q0,-74 14,-88" stroke="${olho}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      break;
    case 'flat':
      olhos = `<path d="M-27,-104 L-8,-104 M8,-104 L27,-104" stroke="${olho}" stroke-width="6" stroke-linecap="round"/><path d="M-27,-118 L-9,-113 M27,-118 L9,-113" stroke="${olho}" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`;
      boca = `<path d="M-9,-84 L9,-84" stroke="${olho}" stroke-width="3.5" stroke-linecap="round"/>`;
      break;
    case 'big':
      olhos = `<ellipse cx="-17" cy="-106" rx="10.5" ry="13" fill="${olho}"/><ellipse cx="17" cy="-106" rx="10.5" ry="13" fill="${olho}"/><circle cx="-13" cy="-111" r="3.6" fill="#fff"/><circle cx="21" cy="-111" r="3.6" fill="#fff"/>`;
      boca = `<ellipse cx="0" cy="-84" rx="5" ry="5.5" fill="none" stroke="${olho}" stroke-width="3.5"/>`;
      break;
    default:
      olhos = `<g transform="translate(0 -106) scale(1 ${blink})"><ellipse cx="-17" cy="0" rx="8" ry="10" fill="${olho}"/><ellipse cx="17" cy="0" rx="8" ry="10" fill="${olho}"/></g>`;
      boca = `<path d="M-10,-86 Q0,-80 10,-86" stroke="${olho}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }
  const braco = (side, a) => {
    const r = a * Math.PI / 180, sx = side * 38, sy = -40, L = 36;
    const ex = sx + side * Math.sin(r) * L, ey = sy + Math.cos(r) * L;
    return `<path d="M${sx},${sy} L${f(ex)},${f(ey)}" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M${sx},${sy} L${f(ex)},${f(ey)}" stroke="#e7f0f8" stroke-width="10" stroke-linecap="round"/>`
      + `<circle cx="${f(ex + side * Math.sin(r) * 5)}" cy="${f(ey + Math.cos(r) * 5)}" r="9" fill="${COR.orange}" ${st}/>`;
  };
  const glow = o.glow ?? 0;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="0" rx="${f(46 - (o.hop ?? 0) * 0.3)}" ry="9" fill="rgba(22,35,59,.16)"/>`
    + `<g transform="translate(0 ${f(-30 + bob)}) rotate(${f(o.tilt ?? 0)} 0 -40)">`
    + (glow > 0.01 ? `<circle cx="-6" cy="-182" r="${f(26 + glow * 20)}" fill="url(#ia_pul)" opacity="${f(glow)}"/>` : '')
    + `<path d="M-6,-150 L-6,-176" stroke="${INK}" stroke-width="4"/><circle cx="-6" cy="-182" r="9" fill="${COR.orange}" ${st}/>`
    + `<rect x="-60" y="-152" width="120" height="96" rx="34" fill="#e7f0f8" ${st}/>`
    + `<rect x="-44" y="-136" width="88" height="62" rx="22" fill="${COR.navy}"/>`
    + (glow > 0.01 ? `<rect x="-44" y="-136" width="88" height="62" rx="22" fill="${COR.blue2}" opacity="${f(glow * 0.35)}"/>` : '')
    + olhos + boca
    + `<rect x="-38" y="-52" width="76" height="52" rx="18" fill="#e7f0f8" ${st}/>`
    + txt('IA', 0, -16, { size: 26, fill: COR.orange, weight: 900 })
    + braco(-1, o.armL ?? 30) + braco(1, o.armR ?? 30)
    + `</g></g>`;
}

// ---------- chip de IA ----------
function chipIA(t, S) {
  const x = CX - CW / 2, y = CY - CH / 2;
  const ix = x + 22, iy = y + 22, iw = CW - 44, ih = CH - 44;
  let s = '';
  // halo laranja atrás (respira)
  if (S.halo > 0.01) s += `<ellipse cx="${CX}" cy="${CY}" rx="${f(390 + 24 * Math.sin(t * 4))}" ry="${f(300 + 18 * Math.sin(t * 4))}" fill="url(#ia_halo)" opacity="${f(S.halo)}"/>`;
  // pinos
  let pinos = '';
  for (let i = 0; i < 5; i++) {
    const py = CY - 100 + i * 50;
    pinos += `<rect x="${x - 20}" y="${py - 8}" width="26" height="16" rx="4"/><rect x="${x + CW - 6}" y="${py - 8}" width="26" height="16" rx="4"/>`;
  }
  for (let i = 0; i < 6; i++) {
    const px = CX - 150 + i * 60;
    pinos += `<rect x="${px - 8}" y="${y - 20}" width="16" height="26" rx="4"/><rect x="${px - 8}" y="${y + CH - 6}" width="16" height="26" rx="4"/>`;
  }
  s += `<g fill="#d3dfeb" stroke="${INK}" stroke-width="3">${pinos}</g>`;
  // corpo
  s += `<rect x="${x + 9}" y="${y + 13}" width="${CW}" height="${CH}" rx="32" fill="rgba(22,35,59,.2)"/>`
    + `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="32" fill="${COR.navy}" stroke="${INK}" stroke-width="4"/>`
    + `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="20" fill="#0a3456" stroke="#2a5680" stroke-width="2"/>`;
  // interior recortado: grade de pontos, scanlines e barra de varredura
  let sl = '';
  for (let yy = iy + 4; yy < iy + ih; yy += 6) sl += `M${ix},${yy} h${iw} `;
  let dots = '';
  for (let yy = iy + 22; yy < iy + ih; yy += 32) for (let xx = ix + 22; xx < ix + iw; xx += 32) dots += `M${xx},${yy}h.01`;
  const sb = iy - 60 + ((t * 0.85) % 1) * (ih + 80);
  s += `<clipPath id="ia_in"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="20"/></clipPath><g clip-path="url(#ia_in)">`
    + `<path d="${dots}" stroke="${COR.blue3}" stroke-opacity=".28" stroke-width="3.5" stroke-linecap="round"/>`
    + `<rect x="${ix}" y="${f(sb)}" width="${iw}" height="60" fill="url(#ia_scan)"/>`
    + `<path d="${sl}" stroke="#fff" stroke-opacity=".05" stroke-width="2"/>`
    + (S.flashIn > 0.01 ? `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#fff" opacity="${f(S.flashIn)}"/>` : '')
    + `</g>`;
  // marca A&M e LEDs
  s += `<g opacity=".8">${txt('A&M · DTS', ix + 18, iy + 28, { anchor: 'start', size: 14, weight: 700, family: 'DM Sans', fill: COR.blue3, ls: 3 })}</g>`;
  const leds = [COR.green, COR.orange, COR.blue2];
  leds.forEach((c, i) => {
    const on = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 7 + i * 2.1));
    s += `<circle cx="${ix + iw - 22 - i * 18}" cy="${iy + 22}" r="5" fill="${c}" opacity="${f(on)}"/>`;
  });
  // cursor (antes do IA)
  if (S.cursor > 0.01) {
    const pisca = Math.floor(t * 3.2) % 2 === 0 ? 1 : 0.15;
    const bw = 250, bx0 = CX - bw / 2, byy = CY + 70;
    const pct = Math.min(99, Math.floor(S.carga * 100));
    s += `<g opacity="${f(S.cursor)}">${txt('>', CX - 52, CY + 6, { size: 80, weight: 800, fill: COR.blue3 })}`
      + `<rect x="${CX - 14}" y="${CY - 50}" width="40" height="62" rx="4" fill="${COR.orange}" opacity="${f(pisca)}"/>`
      + txt('INICIALIZANDO', bx0, byy - 14, { anchor: 'start', size: 14, weight: 700, family: 'DM Sans', fill: COR.blue3, ls: 3 })
      + txt(`${pct}%`, bx0 + bw, byy - 14, { anchor: 'end', size: 14, weight: 700, family: 'DM Sans', fill: COR.orange2, ls: 1 })
      + `<rect x="${bx0}" y="${byy}" width="${bw}" height="12" rx="6" fill="#163f66"/>`
      + `<rect x="${bx0}" y="${byy}" width="${f(Math.max(12, bw * S.carga))}" height="12" rx="6" fill="${COR.orange}"/>`
      + `<rect x="${f(bx0 + Math.max(12, bw * S.carga) - 10)}" y="${byy - 3}" width="12" height="18" rx="6" fill="#fff" opacity="${f(0.5 + 0.5 * Math.sin(t * 20))}"/>`
      + `</g>`;
  }
  // letras IA
  if (S.kIA > 0) {
    const size = 236;
    const wIA = largura('IA', size, 900);
    const bx = CX - 16, by = CY + 84;
    const o = { size, weight: 900, fill: '#ffffff' };
    const sq = `<rect x="${f(bx + wIA / 2 + 12)}" y="${f(by - 40)}" width="36" height="36" fill="${COR.orange}"/>`;
    let letras = '';
    // brilho laranja atrás (um filtro)
    letras += `<g filter="url(#fxGlow)" opacity="${f(0.55 + 0.25 * Math.sin(t * 6) + S.boost)}">${txt('IA', bx, by, { ...o, fill: COR.orange })}</g>`;
    letras += (S.gk > 0.02 ? glitchIA('IA', bx, by, o, t, S.gk) : txt('IA', bx, by, o)) + sq;
    // ecos de zoom durante a queda
    let ecos = '';
    if (S.sIA > 1.01) {
      for (const [m, op] of [[1.22, 0.22], [1.5, 0.1]]) {
        const k = S.sIA * m;
        ecos += `<g transform="translate(${CX} ${CY}) scale(${f(k)}) translate(${-CX} ${-CY})" opacity="${f(op * S.aIA)}">${txt('IA', bx, by, { ...o, fill: COR.orange2 })}</g>`;
      }
    }
    s += ecos + `<g transform="translate(${CX} ${CY}) scale(${f(S.sIA)}) translate(${-CX} ${-CY})" opacity="${f(S.aIA)}">${letras}</g>`;
  }
  return s;
}

// ---------- cartão #MODA (coordenadas locais, centro 0,0) ----------
const MWc = 360, MHc = 186;
function corpoModa(t, risco1, risco2, cinza) {
  let s = cartao(-MWc / 2, -MHc / 2, MWc, MHc, { r: 22 });
  // selo EM ALTA
  s += pilula(-156, -72, 142, 38, COR.orange, INK, 3)
    + `<path d="M-138,-44 l9,-11 l6,6 l9,-11 M-118,-60 h4 v4" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    + txt('EM ALTA', -106, -46, { anchor: 'start', size: 17, weight: 800, family: 'DM Sans', fill: '#fff', ls: 2 });
  // #MODA
  s += txt('#MODA', -160, 36, { anchor: 'start', size: 62, weight: 900, fill: COR.navy });
  // curtidas
  s += `<path d="M-148,66 c-6,-6 -14,0 -8,7 l8,8 l8,-8 c6,-7 -2,-13 -8,-7Z" fill="${COR.orange}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
    + txt('9,8 mil', -132, 80, { anchor: 'start', size: 19, weight: 700, family: 'DM Sans', fill: COR.grey })
    + `<path d="M-44,64 h22 q4,0 4,4 v9 q0,4 -4,4 h-12 l-6,5 v-5 h-4 q-4,0 -4,-4 v-9 q0,-4 4,-4Z" fill="#fff" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
    + txt('1,2 mil', -10, 80, { anchor: 'start', size: 19, weight: 700, family: 'DM Sans', fill: COR.grey });
  // seta de tendência
  const tu = clamp((t % 1.4) / 0.5);
  s += `<path d="M88,62 L114,34 L134,46 L166,-2" stroke="${COR.lblue}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M88,62 L114,34 L134,46 L166,-2" stroke="${COR.orange}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${f(130 * tu)} 200"/>`
    + `<path d="M150,-6 L170,-8 L168,12" stroke="${COR.orange}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  // desbotado
  if (cinza > 0.01) s += `<rect x="${-MWc / 2}" y="${-MHc / 2}" width="${MWc}" height="${MHc}" rx="22" fill="${COR.cream}" opacity="${f(0.55 * cinza)}"/>`;
  // riscos em X (marcador navy)
  if (risco1 > 0) s += `<path d="M-168,-70 L${f(-168 + 336 * risco1)},${f(-70 + 150 * risco1)}" stroke="${COR.navy}" stroke-width="17" stroke-linecap="round"/>`;
  if (risco2 > 0) s += `<path d="M-168,82 L${f(-168 + 336 * risco2)},${f(82 - 156 * risco2)}" stroke="${COR.navy}" stroke-width="17" stroke-linecap="round"/>`;
  return s;
}

// tag pequena (#hype, #viral)
function tag(str, x, y, rot, k) {
  const w = largura(str, 24, 800) + 34;
  return popG(k, x, y, `<g transform="rotate(${rot})">${pilula(-w / 2 + 4, -21, w, 42, 'rgba(22,35,59,.14)', 'none', 0)}${pilula(-w / 2, -25, w, 42, '#fff', INK, 3)}${txt(str, 0, 4, { size: 24, weight: 800, fill: COR.slate })}</g>`);
}

// ---------- nó do ciclo ----------
function no(i, k, ativo) {
  const n = NOS[i];
  const w = largura(n.lab, 30, 800) + 98, h = 72;
  const body = `<rect x="${f(-w / 2 + 5)}" y="${f(-h / 2 + 8)}" width="${f(w)}" height="${h}" rx="${h / 2}" fill="rgba(22,35,59,.16)"/>`
    + (ativo > 0.01 ? `<rect x="${f(-w / 2 - 9)}" y="${f(-h / 2 - 9)}" width="${f(w + 18)}" height="${h + 18}" rx="${h / 2 + 9}" fill="${COR.orange}" opacity="${f(0.28 * ativo)}"/>` : '')
    + pilula(-w / 2, -h / 2, w, h, '#fff', ativo > 0.5 ? COR.orange : INK, 3.5)
    + `<circle cx="${f(-w / 2 + 38)}" cy="0" r="25" fill="#fff4e6"/>` + icone(n.ic, -w / 2 + 38, 0, 0.68)
    + txt(n.lab, -w / 2 + 72, 11, { anchor: 'start', size: 30, weight: 800, fill: COR.navy })
    + `<circle cx="${f(-w / 2 + 10)}" cy="${f(-h / 2 + 4)}" r="16" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`
    + txt(String(i + 1), -w / 2 + 10, -h / 2 + 10.5, { size: 18, weight: 900, fill: '#fff' });
  return popG(k, n.x, n.y, body);
}

// ---------- prancheta (blueprint) ----------
function prancheta(t, R) {
  if (R <= 0) return '';
  const x0 = 330, y0 = 196, x1 = 1590, y1 = 826;
  let g = '';
  for (let x = x0 + 30; x < x1; x += 30) g += `M${x},${y0} L${x},${y1} `;
  for (let y = y0 + 30; y < y1; y += 30) g += `M${x0},${y} L${x1},${y} `;
  let G = '';
  for (let x = x0 + 120; x < x1; x += 120) G += `M${x},${y0} L${x},${y1} `;
  for (let y = y0 + 120; y < y1; y += 120) G += `M${x0},${y} L${x1},${y} `;
  let marcas = '';
  for (const [x, y] of [[x0 + 26, y0 + 26], [x1 - 26, y0 + 26], [x0 + 26, y1 - 26], [x1 - 26, y1 - 26]]) {
    marcas += `M${x - 12},${y} L${x + 12},${y} M${x},${y - 12} L${x},${y + 12} `;
  }
  const body = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="34" fill="#e4edf5" opacity=".88"/>`
    + `<path d="${g}" stroke="${COR.lblue}" stroke-width="1.4" opacity=".7"/>`
    + `<path d="${G}" stroke="${COR.blue3}" stroke-width="2.2" opacity=".7"/>`
    + `<path d="${marcas}" stroke="${COR.blue2}" stroke-width="3" stroke-linecap="round"/>`
    + txt('CICLO DE MÉTODO · DTS', x1 - 52, y1 - 20, { anchor: 'end', size: 13, weight: 700, family: 'DM Sans', fill: COR.blue2, ls: 3 })
    + `<ellipse cx="${EX}" cy="${EY}" rx="${ERX + 34}" ry="${ERY + 34}" fill="none" stroke="${COR.blue3}" stroke-width="2" stroke-dasharray="4 10" opacity=".9"/>`
    + `<path d="M${EX},${y0 + 10} L${EX},${y1 - 10} M${x0 + 10},${EY} L${x1 - 10},${EY}" stroke="${COR.blue3}" stroke-width="2" stroke-dasharray="14 10" opacity=".55"/>`
    + `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="34" fill="none" stroke="${COR.blue2}" stroke-width="3" opacity=".55"/>`;
  return `<clipPath id="ia_bp"><circle cx="${STX}" cy="${STY}" r="${f(R)}"/></clipPath><g clip-path="url(#ia_bp)">${body}</g>`
    + (R < 1500 ? `<circle cx="${STX}" cy="${STY}" r="${f(R)}" fill="none" stroke="${COR.blue2}" stroke-width="${f(5 * (1 - R / 1500) + 1)}" opacity="${f(0.8 * (1 - R / 1500))}"/>` : '');
}

// ---------- poeira do impacto ----------
function poeiraImpacto(age) {
  const d = 0.75;
  if (age < 0 || age > d) return '';
  const r = rng(77);
  const k = ease.out(age / d);
  let s = '';
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1;
    const x0 = STX + side * (STW / 2 - 30 - r() * 120), y0 = STY + STH / 2 - 6 + r() * 10;
    const x = x0 + side * (50 + r() * 190) * k, y = y0 - (10 + r() * 70) * k;
    const rad = (12 + r() * 20) * (0.5 + k);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="#f1e6d0" stroke="#d6c4a2" stroke-width="2.5" opacity="${f(0.95 * (1 - k))}"/>`;
  }
  return s;
}

export function desenhar(t, ctx) {
  const { wa, wb, t0, t1, P } = ctx;
  const T_AQUI = wa(41), T_IA = wa(42), T_NAO = wa(43), T_MODA = wa(45), T_E = wa(46), T_MET = wa(47);
  const TI = T_MET + 0.035;             // impacto do carimbo
  const TL = T_IA + 0.02;               // pouso das letras IA
  const TS = T_E - 0.035;               // estilhaço do cartão
  const met = t >= TI;

  // ---------- câmera ----------
  const z = kf(t, [[t0, 1.05], [T_AQUI, 1.075], [TL - 0.02, 1.08], [TL + 0.07, 1.115, ease.out], [TL + 0.45, 1.095], [T_MODA, 1.1], [TI - 0.01, 1.105], [TI + 0.5, 1.0, ease.out], [t1, 1.012]]);
  const panX = kf(t, [[t0, 0], [T_NAO, 0], [T_MODA + 0.1, -36], [TI - 0.01, -30], [TI + 0.5, 0, ease.out]]) + Math.sin(t * 0.9) * 6;
  const panY = kf(t, [[t0, 8], [T_MODA, 14], [TI + 0.5, 0, ease.out]]) + Math.cos(t * 0.8) * 4;
  const [s1x, s1y] = tremor(t, TL, 0.3, 11);
  const [s2x, s2y] = tremor(t, TI, 0.42, 24);
  const [s3x, s3y] = tremor(t, TS, 0.18, 6);
  const shx = s1x + s2x + s3x, shy = s1y + s2y + s3y;
  const camada = (p, body) => {
    const zz = 1 + (z - 1) * p;
    return `<g transform="translate(${f(PX + (panX + shx) * p)} ${f(PY + (panY + shy) * p)}) scale(${f(zz)}) translate(${-PX} ${-PY})">${body}</g>`;
  };

  let out = defs() + `<rect width="${W}" height="${H}" fill="${COR.cream}"/>`;
  out += camada(0.35, fundoCreme(t));

  // ---------- plano de fundo da cena: prancheta, anel orbital, trilhas ----------
  let bg = '';
  bg += prancheta(t, met ? 1500 * ease.out(inv(TI, TI + 0.62, t)) : 0);
  // anel orbital tracejado (vira o trilho do ciclo)
  const kAnel = fin(t, t0, 0.4) * (met ? 1 - 0.6 * fin(t, TI, 0.3) : 1);
  bg += `<ellipse cx="${EX}" cy="${EY}" rx="${ERX}" ry="${ERY}" fill="none" stroke="${COR.blue3}" stroke-width="3.5" stroke-dasharray="12 14" stroke-dashoffset="${f(-t * 46)}" opacity="${f(0.75 * kAnel)}"/>`;
  if (!met) {
    for (let i = 0; i < 2; i++) {
      const a = t * 1.1 + i * Math.PI;
      const ex = EX + ERX * Math.cos(a), ey = EY + ERY * Math.sin(a);
      bg += `<circle cx="${f(ex)}" cy="${f(ey)}" r="15" fill="url(#ia_azul)" opacity="${f(kAnel)}"/><circle cx="${f(ex)}" cy="${f(ey)}" r="5.5" fill="${COR.blue2}" opacity="${f(kAnel)}"/>`;
    }
  }
  // trilhas
  const kTr = met ? 1 - fin(t, TI, 0.3) : 1;
  const burst = inv(TL, TL + 0.42, t);
  if (kTr > 0.02) {
  let tr = '', trLit = '', pads = '';
  TRILHAS.forEach((pts, i) => {
    tr += caminho(pts) + ' ';
    const e = pts[pts.length - 1];
    pads += `<circle cx="${f(e[0])}" cy="${f(e[1])}" r="8" fill="#fff" stroke="${COR.blue2}" stroke-width="3.5"/>`;
    if (burst > 0 && burst < 1) trLit += parte(pts, ease.out(burst)).d + ' ';
  });
  bg += `<g opacity="${f(kTr)}"><path d="${tr}" fill="none" stroke="${COR.blue3}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
    + (trLit ? `<path d="${trLit}" fill="none" stroke="${COR.orange}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="${f(1 - burst * 0.6)}"/>` : '')
    + pads;
  // pulsos: para dentro (carregando) antes do IA, para fora depois
  TRILHAS.forEach((pts, i) => {
    const ph = (i * 0.383) % 1;
    let u;
    if (t < TL) u = 1 - (((t - t0) * (0.75 + 0.6 * inv(t0, TL, t)) + ph) % 1);
    else if (burst < 1) u = ease.out(burst);
    else u = ((t - TL) * 0.6 + ph) % 1;
    const p = parte(pts, u).end;
    const a = t < TL ? 0.8 : 1;
    bg += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${burst > 0 && burst < 1 ? 20 : 14}" fill="url(#ia_pul)" opacity="${f(a)}"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="5" fill="#fff"/>`;
  });
  bg += `</g>`;
  }
  out += camada(1, bg);

  // ---------- chip de IA ----------
  const uL = inv(TL - 0.15, TL, t);
  const S = {
    halo: 0.35 + 0.65 * fin(t, TL, 0.2) + (met ? 0.25 * Math.max(0, 1 - (t - TI) * 3) : 0),
    cursor: 1 - fin(t, TL - 0.12, 0.08),
    carga: ease.inOut(inv(t0 + 0.1, TL - 0.12, t)),
    kIA: t >= TL - 0.15 ? 1 : 0,
    sIA: t < TL ? lerp(2.4, 1, ease.in(uL)) : 1 + 0.07 * Math.exp(-(t - TL) * 9) * Math.sin((t - TL) * 34),
    aIA: clamp(uL * 2.5),
    flashIn: t >= TL ? Math.max(0, 0.85 - (t - TL) * 4) : 0,
    gk: met ? 0
      : Math.max(
        t >= TL ? Math.max(0, 1 - (t - TL) / 0.2) : 0,
        (t > T_NAO - 0.02 && t < T_NAO + 0.03) ? 0.55 : 0,
        (t > T_MODA + 0.26 && t < T_MODA + 0.31) ? 0.6 : 0,
        (t > TS && t < TS + 0.05) ? 0.7 : 0,
      ),
    boost: met ? 0.4 * Math.max(0, 1 - (t - TI) * 2.5) : 0,
  };
  let chip = chipIA(t, S);
  // varredura de luz no chip após o pouso, e de novo após o carimbo
  chip += varredura('ia_vch', CX - CW / 2, CY - CH / 2, CW, CH, inv(TL + 0.12, TL + 0.62, t), 32);
  chip += varredura('ia_vch2', CX - CW / 2, CY - CH / 2, CW, CH, inv(TI + 0.3, TI + 0.8, t), 32);
  // cantos de HUD travando no chip
  if (!met || t < TI + 0.25) chip += opa(met ? 1 - fin(t, TI, 0.2) : 1, hudCantos(CX - CW / 2 - 34, CY - CH / 2 - 34, CW + 68, CH + 68, inv(TL + 0.04, TL + 0.36, t), COR.orange, 44, 6));
  out += camada(1, chip);

  // ---------- pílula "AQUI, NA DTS" ----------
  {
    const lab = 'AQUI, NA DTS';
    const lw = largura(lab, 22, 800, 'DM Sans') + lab.length * 4 + 78;
    const k = back(t, T_AQUI - 0.06, 0.4);
    const dy = (1 - clamp(inv(T_AQUI - 0.06, T_AQUI + 0.16, t))) * -90;
    if (k > 0) {
      // depois do carimbo a pílula sobe e vira a "aba" da prancheta (centrada na borda superior)
      const lift = met ? fin(t, TI, 0.3) : 0;
      const py = 222 + dy - 30 * lift;
      let p = `<rect x="${f(-lw / 2 + 5)}" y="-19" width="${f(lw)}" height="52" rx="26" fill="rgba(22,35,59,.14)"/>`
        + pilula(-lw / 2, -26, lw, 52, '#fff', INK, 3.5)
        + pino(-lw / 2 + 32, -2, 1.05)
        + txt(lab, -lw / 2 + 56, 8, { anchor: 'start', size: 22, weight: 800, family: 'DM Sans', fill: COR.navy, ls: 4 });
      const age = t - (T_AQUI + 0.12);
      // faíscas nascem nas pontas e ficam POR BAIXO da pílula (não cruzam o texto)
      out += camada(1, faiscas(960 - lw / 2 - 8, py, age, COR.orange, 6, 16, 54) + faiscas(960 + lw / 2 + 8, py, age, COR.orange, 6, 16, 54)
        + popG(Math.min(1.15, k) * (1 - 0.12 * lift), 960, py, p));
    }
  }

  // ---------- personagens ----------
  let gente = chao();
  const fala = (() => { for (let i = 41; i <= 47; i++) if (t >= P[i].a - 0.02 && t <= P[i].b) return true; return false; })();
  let vexpr = 'smile', vgaze = [1, -0.3], varmL = 8, varmR = 8, vhop = 0, vtilt;
  // "Aqui": apresenta o chip
  const kAqui = back(t, T_AQUI - 0.08, 0.3) * (1 - fin(t, T_MODA - 0.1, 0.2));
  varmR = lerp(8, 82, kAqui);
  if (t >= TL - 0.04) { vexpr = 'wow'; varmL = lerp(8, 38, fin(t, TL - 0.04, 0.15)); vhop = Math.max(0, Math.sin(clamp((t - TL) / 0.32) * Math.PI)) * 16; }
  if (t >= T_MODA - 0.04) {
    vexpr = 'focus'; vgaze = [1.4, -0.4];
    varmL = lerp(38, 14, fin(t, T_MODA - 0.04, 0.15));
    vtilt = Math.sin((t - T_MODA) * 24) * 6 * (1 - fin(t, TS, 0.2));
  }
  if (t >= TI - 0.03) {
    vexpr = 'proud'; vgaze = [0.6, -0.6]; vtilt = undefined;
    const up = back(t, TI - 0.03, 0.25);
    const down = fin(t, TI + 0.42, 0.25);
    varmL = lerp(14, lerp(114, 22, down), up);
    varmR = lerp(8, 114, up) - 4 * down;
    vhop = Math.max(0, Math.sin(clamp((t - TI) / 0.36) * Math.PI)) * 22;
  }
  gente += pessoa('victor', { x: VX, y: CHAO, s: 1.16, t, expr: vexpr, gaze: vgaze, armL: varmL, armR: varmR, hop: vhop, tilt: vtilt, talk: fala && !(t >= T_MODA - 0.04 && t < TI - 0.03) });
  // robô
  let reyes = 'normal', rarmL = 28, rarmR = 28, rtilt = Math.sin(t * 1.6) * 2, rhop = 0, rglow = 0;
  if (t >= TL - 0.02) {
    reyes = 'big';
    rarmL = lerp(28, 104, back(t, TL, 0.3)); // aponta para o chip
    rglow = Math.max(0, 1 - (t - TL) * 2.2);
    rhop = Math.max(0, Math.sin(clamp((t - TL) / 0.3) * Math.PI)) * 12;
  }
  if (t >= T_MODA + 0.02) {
    reyes = 'flat';
    rarmL = lerp(104, 22, fin(t, T_MODA + 0.02, 0.15));
    rtilt = Math.sin((t - T_MODA) * 26) * 9 * (1 - fin(t, TS, 0.2));
  }
  if (t >= TI - 0.02) {
    reyes = 'happy';
    const up = back(t, TI - 0.02, 0.25);
    rarmL = lerp(22, 128, up); rarmR = lerp(28, 128, up);
    rhop = Math.max(0, Math.sin(clamp((t - TI) / 0.34) * Math.PI)) * 26;
    rglow = Math.max(0, 1 - (t - TI) * 2);
    rtilt = Math.sin(t * 5) * 3;
  }
  gente += roboIA(RX, CHAO, t, 1.12, { eyes: reyes, armL: rarmL, armR: rarmR, tilt: rtilt, hop: rhop, glow: rglow });
  // anel da antena no IA
  gente += onda(RX - 6 * 1.12, CHAO - (212 + 9) * 1.12, t - TL, { r0: 10, r1: 120, d: 0.45, w: 7, cor: COR.blue2, duplo: false });
  out += camada(1, gente);

  // ---------- cartão #MODA, tags e estilhaço ----------
  let moda = '';
  const kM = back(t, T_MODA - 0.07, 0.34);
  const r1 = ease.out(inv(T_MODA + 0.2, T_MODA + 0.3, t)), r2 = ease.out(inv(T_MODA + 0.3, T_MODA + 0.4, t));
  const cinza = fin(t, T_MODA + 0.22, 0.2);
  const jolt = (t > T_MODA + 0.2 && t < T_MODA + 0.46) ? Math.sin((t - T_MODA) * 70) * 5 * (1 - inv(T_MODA + 0.2, T_MODA + 0.46, t)) : 0;
  const tagK = (a) => back(t, a, 0.3) * (1 - ease.in(inv(TS - 0.02, TS + 0.12, t)));
  if (t < TS && kM > 0) {
    const corpo = corpoModa(t, r1, r2, cinza);
    // brilhos ao redor
    let br = '';
    [[-198, -86, 15, 0], [196, -100, 12, 1.3], [212, 72, 10, 2.1], [-210, 92, 11, 3.0]].forEach(([x, y, r, ph]) => {
      const tw = 0.55 + 0.45 * Math.sin(t * 9 + ph);
      br += estrela(x, y, r * tw * (1 - cinza * 0.6), COR.orange2, 2.2);
    });
    // rachaduras pouco antes do estilhaço
    let racha = '';
    const kr = inv(TS - 0.09, TS - 0.01, t);
    if (kr > 0) {
      const rr = rng(9);
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2 + rr();
        const L = (60 + rr() * 120) * kr;
        racha += `M0,4 L${f(Math.cos(a) * L * 0.5 + (rr() - 0.5) * 16)},${f(4 + Math.sin(a) * L * 0.32)} L${f(Math.cos(a) * L)},${f(4 + Math.sin(a) * L * 0.5)} `;
      }
      racha = `<path d="${racha}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${racha}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    moda += popG(kM, MX + jolt, MY, `<g transform="rotate(${MR + jolt * 0.4})">${corpo}${racha}${br}</g>`);
  }
  // estilhaço
  if (t >= TS && t < TS + 0.45) {
    const a = t - TS;
    const corpo = corpoModa(t, 1, 1, 1);
    let cs = '';
    CACOS.forEach((c, i) => {
      const dx = c.vx * a, dy = c.vy * a + 1900 * a * a, rot = c.rot * a, sc = 1 - 1.1 * a;
      const op = 1 - inv(0.1, 0.3, a);
      if (op <= 0) return;
      cs += `<g transform="translate(${f(c.cx + dx)} ${f(c.cy + dy)}) rotate(${f(rot)}) scale(${f(sc)}) translate(${f(-c.cx)} ${f(-c.cy)})" opacity="${f(op)}">`
        + `<clipPath id="ia_sh${i}"><path d="M${c.p.map(q => `${f(q[0])},${f(q[1])}`).join(' L')}Z"/></clipPath><g clip-path="url(#ia_sh${i})">${corpo}</g></g>`;
    });
    moda += `<g transform="translate(${MX} ${MY}) rotate(${MR})">${cs}</g>`;
    moda += particulas(31, MX, MY, a, { n: 26, d: 0.6, v: 640, sz: 12, cores: [COR.navy, COR.lblue, '#ffffff', COR.orange2, COR.slate] });
    moda += onda(MX, MY, a, { r0: 40, r1: 260, d: 0.35, w: 8, cor: COR.slate });
  }
  // tags satélites
  moda += tag('#hype', 1712, 228, -8, tagK(T_MODA + 0.02));
  moda += tag('#viral', 1668, 452, 7, tagK(T_MODA + 0.09));
  if (t >= TS && t < TS + 0.3) {
    moda += faiscas(1712, 228, t - TS, COR.slate, 6, 24, 60) + faiscas(1668, 452, t - TS, COR.slate, 6, 24, 60);
  }
  out += camada(1, moda);

  // ---------- impacto do IA (efeitos sobre o chip) ----------
  let fxIA = '';
  fxIA += onda(CX, CY, t - TL, { r0: 180, r1: 720, d: 0.55, w: 16, cor: COR.blue2 });
  fxIA += particulas(12, CX, CY - 40, t - TL, { n: 28, d: 0.75, v: 560, sz: 11 });
  fxIA += faiscas(CX - CW / 2 - 10, CY - CH / 2 - 10, t - TL, COR.orange, 6, 20, 70) + faiscas(CX + CW / 2 + 10, CY - CH / 2 - 10, t - TL, COR.orange, 6, 20, 70);
  out += camada(1, fxIA);

  // ---------- ciclo de método ----------
  if (met) {
    const TN = [TI + 0.02, TI + 0.10, TI + 0.18, TI + 0.26];
    let cyc = '';
    const fimLoop = TN[3] + 0.12;
    // pulso circulando depois de fechado
    const lp = t > fimLoop ? ((t - fimLoop) / 1.05) % 1 : -1;
    const posPulso = lp >= 0 ? parte(LOOP, lp).end : null;
    // nó ativo pelo pulso (fração do loop ~ i/4)
    ARCOS.forEach((pts, i) => {
      const u = inv(TN[i], TN[i] + 0.11, t);
      if (u <= 0) return;
      const p = parte(pts, ease.inOut(u));
      cyc += `<path d="${p.d}" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" opacity=".9"/>`
        + `<path d="${p.d}" fill="none" stroke="${COR.orange}" stroke-width="8" stroke-linecap="round"/>`;
      const [hx, hy] = p.end, a = p.ang;
      const ca = Math.cos(a), sa = Math.sin(a);
      const pt = (dx, dy) => `${f(hx + ca * dx - sa * dy)},${f(hy + sa * dx + ca * dy)}`;
      cyc += `<path d="M${pt(14, 0)} L${pt(-12, -14)} L${pt(-6, 0)} L${pt(-12, 14)}Z" fill="${COR.orange}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    });
    if (posPulso) {
      cyc += `<circle cx="${f(posPulso[0])}" cy="${f(posPulso[1])}" r="26" fill="url(#ia_pul)"/><circle cx="${f(posPulso[0])}" cy="${f(posPulso[1])}" r="6" fill="#fff"/>`;
    }
    NOS.forEach((n, i) => {
      const tp = i === 0 ? TN[0] : TN[i - 1] + 0.09;
      const k = back(t, tp, 0.24);
      // aceso quando o pulso passa perto (ou no pouso)
      let ativo = Math.max(0, 1 - (t - tp) * 3.5);
      if (lp >= 0) {
        const alvo = i / 4; // o nó i fica no início do arco i
        let dd = Math.abs(lp - alvo); dd = Math.min(dd, 1 - dd);
        ativo = Math.max(ativo, 1 - dd * 9);
      }
      cyc += faiscas(n.x, n.y, t - tp - 0.1, COR.orange, 8, 95, 150) + no(i, k, clamp(ativo));
    });
    out += camada(1, cyc);
  }

  // ---------- carimbo MÉTODO ----------
  {
    const TF = TI - 0.12;
    let st = '';
    if (t >= TF) {
      const uF = inv(TF, TI, t);
      let k, o = 1;
      if (t < TI) { k = lerp(2.2, 1, ease.in(uF)); o = clamp(uF * 2.2); }
      else { const a = t - TI; k = 1 - 0.085 * Math.exp(-a * 9) * Math.sin(a * 36); }
      // sombra que encolhe enquanto cai
      if (t < TI + 0.05) st += `<ellipse cx="${STX}" cy="${STY + 66}" rx="${f(STW * 0.42 / Math.max(1, k * 0.8))}" ry="16" fill="rgba(22,35,59,.18)" opacity="${f(uF)}"/>`;
      // ecos de queda (desfoque de movimento)
      if (t < TI) {
        st += `<g opacity="${f(0.3 * o)}" filter="url(#fxBlurY)">${carimbo('MÉTODO', STX, STY, k * 1.25, { size: STS, rot: STR })}</g>`;
      }
      st += opa(o, carimbo('MÉTODO', STX, STY, k, { size: STS, rot: STR }));
      // varredura de luz no carimbo
      st += `<g transform="translate(${STX} ${STY}) rotate(${STR})">${varredura('ia_vst', -STW / 2, -STH / 2, STW, STH, inv(TI + 0.22, TI + 0.62, t), 14)}${varredura('ia_vst2', -STW / 2, -STH / 2, STW, STH, inv(TI + 0.68, TI + 1.0, t), 14)}</g>`;
    }
    if (met) {
      const a = t - TI;
      // anel retangular expandindo
      if (a < 0.45) {
        const k = ease.out(a / 0.45), sc = 1 + 0.55 * k;
        st += `<g transform="translate(${STX} ${STY}) rotate(${STR}) scale(${f(sc)})"><rect x="${f(-STW / 2)}" y="${f(-STH / 2)}" width="${f(STW)}" height="${f(STH)}" rx="16" fill="none" stroke="${COR.orange}" stroke-width="${f(8 * (1 - k) + 1)}" opacity="${f(1 - k)}"/></g>`;
      }
      st += onda(STX, STY, a, { r0: 120, r1: 900, d: 0.6, w: 20, cor: COR.orange });
      st += poeiraImpacto(a);
      st += particulas(58, STX, STY + 20, a, { n: 30, d: 0.8, v: 720, sz: 12, g: 420 });
      st += faiscas(STX - STW / 2, STY - STH / 2 + 10, a, COR.orange, 7, 26, 84) + faiscas(STX + STW / 2, STY + STH / 2 - 10, a, COR.orange, 7, 26, 84);
    }
    out += camada(1, st);
  }

  // ---------- primeiro plano: poeira de luz ----------
  out += camada(1.15, poeira(t, 21, 18, [80, 200, 1760, 680], COR.orange2, 0.5));

  // ---------- flashes de impacto ----------
  out += flash(t - TL, 0.16, '#ffffff', 0.45);
  out += flash(t - TI, 0.18, '#fff4e6', 0.4);
  return out;
}
