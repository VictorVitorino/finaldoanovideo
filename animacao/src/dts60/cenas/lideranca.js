// Cena 7 · LIDERANÇA POR PERTO — "E com a liderança sempre por perto: direcionando, acompanhando,
// trocando." (≈ 39.34 → 45.57 s)
//
// Cenário (fundo creme): à esquerda o Victor apresenta, num cavalete com tela navy, o painel
// "Mapa de adoção" (barras por área + donut de adoção); uma luminária pendente ilumina a tela.
// Os três diretores entram pela direita e param bem perto dele (sem nomes, só o visual).
//
// Batidas (tempos absolutos, via ctx.wa):
//   t0 …          tela monta (barras com overshoot, donut conta até 82%, linha de tendência),
//                 Victor aponta a tela; os diretores já vêm caminhando da direita.
//   t0+0.85       varredura de luz na tela.
//   wa(73)        "liderança": chamada flutuante "Liderança" (letras saltam) com conector e
//                 colchete que acompanha o grupo enquanto ele anda; o diretor 1 acena; Victor olha.
//   wa(74..76)    "sempre por perto": as palavras entram na chamada no ritmo da fala; os diretores
//                 param um a um (poeira); em "perto" o colchete pisca, uma poça de luz no chão
//                 une Victor e liderança, onda no chão, leve tremor.
//   wa(77)        "direcionando": a chamada se recolhe; balão "Direciona" (bússola gira) sobre o
//                 diretor 1, que aponta; feixe tracejado do dedo até a tela; linha de META se
//                 desenha no gráfico com a bandeirinha.
//   wa(78)        "acompanhando": balão "Acompanha" (olho pisca) sobre a diretora 2, que acena com a
//                 cabeça; linha de varredura percorre o painel, cantos de HUD travam no donut,
//                 82% → 87% com selo "+5 p.p."; Victor aponta o donut.
//   wa(79)        "trocando": balão "Troca" (setas giram) sobre o diretor 3, que abre os braços;
//                 dois cometas partem ao mesmo tempo e desenham o laço bilateral: arco LARANJA dos
//                 líderes para o Victor por cima (bússola, conversa) e arco AZUL do Victor para os
//                 líderes por baixo (ideia, dashboard). Chegada com onda + faíscas, Victor pula,
//                 a luminária balança; fichas continuam circulando até o corte.
import {
  COR, INK, W, H, CHAO, txt, largura, pilula, cartao, icone, pessoa,
  clamp, lerp, inv, ease, kf, n2, back, fin, popG,
  varredura, onda, particulas, poeira, hudCantos, tremor, faiscas, revela,
} from '../base.js';

const f = n2;

export const CHIP = ['CENA 7 · LIDERANÇA POR PERTO', 'Troca bilateral'];

// ---------------- layout (mundo) ----------------
const VX = 300, VS = 1.15;                          // Victor
const SX0 = 470, SY0 = 335, SW = 560, SH = 320;     // tela do cavalete
const SCX = SX0 + SW / 2;
const LAMP_X = SCX;                                 // luminária pendente
const DS = 1.08;                                    // escala dos diretores
const DIRS = [
  { id: 'dir1', x: 1345, dx: 430, s0: 0.05, chega: -0.26, bx: 1368, by: 452 },
  { id: 'dir2', x: 1545, dx: 520, s0: 0.13, chega: -0.13, bx: 1545, by: 372 },
  { id: 'dir3', x: 1745, dx: 610, s0: 0.21, chega: 0, bx: 1745, by: 452 },
];
const CHX = 1545, CHY = 430;                        // chamada "Liderança · sempre por perto"
const BRY = 546;                                    // colchete sobre as cabeças

// laço bilateral (cúbicas): laranja = líderes -> Victor (por cima); azul = Victor -> líderes (por baixo)
const ARCO_L = [[1206, 612], [1222, 196], [360, 196], [372, 532]];
const ARCO_A = [[384, 770], [394, 934], [1146, 934], [1188, 760]];

const cub = (P, u) => {
  const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
  return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
};
function tabela(P, n = 180) {
  const pts = [], cum = [0];
  let L = 0;
  for (let i = 0; i <= n; i++) {
    pts.push(cub(P, i / n));
    if (i) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(L); }
  }
  return { pts, cum, L, d: `M${P[0][0]},${P[0][1]} C${P[1][0]},${P[1][1]} ${P[2][0]},${P[2][1]} ${P[3][0]},${P[3][1]}` };
}
const TL = tabela(ARCO_L), TA = tabela(ARCO_A);
// ponto a uma fração s do comprimento (com o ângulo da tangente)
function noArco(tb, s) {
  const alvo = clamp(s) * tb.L;
  let lo = 0, hi = tb.cum.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (tb.cum[m] < alvo) lo = m; else hi = m; }
  const k = (alvo - tb.cum[lo]) / ((tb.cum[hi] - tb.cum[lo]) || 1);
  const [x0, y0] = tb.pts[lo], [x1, y1] = tb.pts[hi];
  return [lerp(x0, x1, k), lerp(y0, y1, k), Math.atan2(y1 - y0, x1 - x0)];
}

// escala em torno de um ponto (o corpo fica em coordenadas do mundo)
const pop = (k, px, py, body) => (k <= 0.001 ? '' : `<g transform="translate(${f(px)} ${f(py)}) scale(${f(k)}) translate(${f(-px)} ${f(-py)})">${body}</g>`);
const pulso = (t, a, d) => { const u = inv(a, a + d, t); return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI); };

function tempos(ctx) {
  const wa = ctx.wa, wb = ctx.wb;
  const T = {
    t0: ctx.t0, t1: ctx.t1, e: wa(70), lid: wa(73), sem: wa(74), por: wa(75), per: wa(76),
    dir: wa(77), aco: wa(78), tro: wa(79), trob: wb(79),
  };
  T.lanca = T.tro - 0.1;           // cometas partem
  T.chega = T.tro + 0.45;          // cometas chegam (laço fechado)
  return T;
}

// ---------------- câmera ----------------
function camera(t, T) {
  // abre perto do Victor, recua quando a liderança chega, encosta no diretor 1 (direciona), na tela
  // (acompanha) e recua de novo para mostrar o laço inteiro (troca)
  const cx = kf(t, [[T.t0, 880], [T.per + 0.15, 960], [T.dir + 0.3, 976], [T.aco + 0.3, 948], [T.tro - 0.1, 952], [T.tro + 0.4, 962], [T.t1, 958]]);
  const cy = kf(t, [[T.t0, 566], [T.per + 0.15, 543], [T.aco + 0.3, 545], [T.t1, 547]]);
  const z = kf(t, [[T.t0, 1.075], [T.per + 0.15, 1.0], [T.dir + 0.3, 1.016], [T.aco + 0.3, 1.024], [T.tro - 0.1, 1.022], [T.tro + 0.4, 1.0], [T.t1, 1.01]]);
  let dx = 0, dy = 0;
  for (const [a, d, amp] of [[T.per, 0.3, 3.5], [T.tro, 0.3, 5], [T.chega, 0.32, 7]]) {
    const [a1, b1] = tremor(t, a, d, amp); dx += a1; dy += b1;
  }
  return { cx, cy, z, dx, dy };
}

// ---------------- fundo (com paralaxe) ----------------
function fundo(t, cam) {
  const px = -(cam.cx - 960) * 0.3;
  let s = `<rect width="${W}" height="${H}" fill="${COR.cream}"/>`;
  const ox = ((px % 48) + 48) % 48;
  let g = '';
  for (let x = ox - 48; x <= W + 48; x += 48) g += `M${f(x)},0 L${f(x)},${H} `;
  for (let y = 0; y <= H; y += 48) g += `M0,${y} L${W},${y} `;
  s += `<path d="${g}" stroke="${COR.grid}" stroke-width="1.5"/>`;
  const bp = px * 0.7;
  for (const [c, x, y, rx, ry, ph] of [['#d7e4ee', 360, 400, 440, 300, 0], ['#f8e2c2', 980, 760, 640, 250, 1.7], ['#f3dada', 1600, 380, 420, 320, 3.1], ['#e3ecf4', 1120, 200, 300, 150, 4.4]]) {
    s += `<ellipse cx="${f(x + bp + Math.sin(t * 0.35 + ph) * 40)}" cy="${f(y + Math.cos(t * 0.3 + ph) * 26)}" rx="${rx}" ry="${ry}" fill="${c}" opacity=".6"/>`;
  }
  for (const [x, y, k] of [[560, 214, 'x'], [1300, 176, 'tri'], [1880, 640, 'o'], [36, 560, 'x'], [1490, 930, 'o'], [140, 300, 'o']]) {
    const xx = x + px * 1.2, yy = y + Math.sin(t * 0.9 + x) * 6;
    if (k === 'x') s += `<path d="M${f(xx - 10)},${f(yy - 10)} l20,20 M${f(xx + 10)},${f(yy - 10)} l-20,20" stroke="${COR.tan}" stroke-width="4" stroke-linecap="round"/>`;
    else if (k === 'tri') s += `<path d="M${f(xx)},${f(yy - 12)} l12,20 l-24,0Z" fill="none" stroke="${COR.tan}" stroke-width="3.5" stroke-linejoin="round"/>`;
    else s += `<circle cx="${f(xx)}" cy="${f(yy)}" r="9" fill="none" stroke="${COR.tan}" stroke-width="3"/>`;
  }
  return s;
}

function defs() {
  return `<defs>`
    + `<radialGradient id="lideranca_poca" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".6"/><stop offset=".55" stop-color="${COR.orange2}" stop-opacity=".25"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="lideranca_cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".5"/><stop offset=".5" stop-color="${COR.orange2}" stop-opacity=".2"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></linearGradient>`
    + `<radialGradient id="lideranca_halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="lideranca_scan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COR.blue3}" stop-opacity="0"/><stop offset=".75" stop-color="${COR.blue3}" stop-opacity=".38"/><stop offset="1" stop-color="#ffffff" stop-opacity=".9"/></linearGradient>`
    + `<clipPath id="lideranca_tela"><rect x="0" y="0" width="${SW}" height="${SH}" rx="18"/></clipPath>`
    + `</defs>`;
}

// ---------------- cenário ----------------
function planta(x, t, sc = 1) {
  const sw = Math.sin(t * 1.6 + x) * 2.5;
  const folha = (ang, len, c) => `<g transform="rotate(${f(ang + sw)})"><path d="M0,0 Q${f(-len * 0.28)},${f(-len * 0.55)} 0,${f(-len)} Q${f(len * 0.28)},${f(-len * 0.55)} 0,0Z" fill="${c}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/><path d="M0,-6 L0,${f(-len * 0.8)}" stroke="#fff" stroke-width="2.2" opacity=".55" stroke-linecap="round"/></g>`;
  return `<g transform="translate(${x} ${CHAO}) scale(${sc})">`
    + `<g transform="translate(0 -74)">${folha(-38, 120, COR.blue2)}${folha(36, 112, COR.blue2)}${folha(-14, 150, COR.blue3)}${folha(14, 140, COR.blue)}${folha(-62, 86, COR.blue3)}${folha(60, 84, COR.blue3)}</g>`
    + `<path d="M-40,-82 L40,-82 L32,0 L-32,0Z" fill="${COR.orange}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
    + `<rect x="-46" y="-92" width="92" height="18" rx="6" fill="${COR.orange2}" stroke="${INK}" stroke-width="3.5"/>`
    + `<path d="M-22,-56 L-20,-18" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/></g>`;
}

// luminária pendente sobre a tela (balança no impacto da troca)
function luminaria(t, T) {
  const u = t - T.tro;
  const ang = (u > 0 ? 3.4 * Math.sin(u * 7.5) * Math.exp(-u * 1.6) : 0) + 0.8 * Math.sin(t * 1.3);
  const flick = 0.92 + 0.08 * Math.sin(t * 9.3) * Math.sin(t * 3.1);
  const X = LAMP_X;
  let s = `<path d="M${X - 40},234 L${X + 40},234 L${SX0 + SW + 50},${SY0 + 150} L${SX0 - 50},${SY0 + 150}Z" fill="url(#lideranca_cone)" opacity="${f(0.9 * flick)}"/>`
    + `<circle cx="${X}" cy="238" r="70" fill="url(#lideranca_halo)" opacity="${f(0.75 * flick)}"/>`
    + `<path d="M${X},-20 L${X},182" stroke="${INK}" stroke-width="3"/>`
    + `<rect x="${X - 10}" y="174" width="20" height="16" rx="4" fill="${COR.slate}" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M${X - 22},188 L${X + 22},188 L${X + 48},226 L${X - 48},226Z" fill="${COR.blue}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
    + `<path d="M${X - 12},196 L${X - 28},218" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".45"/>`
    + `<ellipse cx="${X}" cy="231" rx="34" ry="9" fill="#fff3d6" stroke="${INK}" stroke-width="3"/>`
    + `<rect x="${X - 50}" y="221" width="100" height="9" rx="4.5" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`;
  return `<g transform="rotate(${f(ang)} ${X} 0)">${s}</g>`;
}

// ---------------- tela: "Mapa de adoção" ----------------
const BASE = 280, HM = 150;                          // gráfico (coordenadas locais da tela)
const VALS = [0.40, 0.55, 0.66, 0.79, 0.93];
const AREAS = ['RH', 'FIN', 'TI', 'OPS', 'COM'];
const barX = i => 46 + i * 58;
const DCX = 474, DCY = 182, DR = 52;                 // donut
const META = 0.86;

function tela(t, T) {
  let s = cavalete(SX0, SY0, SW, SH, CHAO - SY0 - SH);
  let c = `<rect x="8" y="12" width="${SW}" height="${SH}" rx="18" fill="rgba(22,35,59,.22)"/>`
    + `<rect x="-7" y="-7" width="${SW + 14}" height="${SH + 14}" rx="24" fill="none" stroke="${COR.orange2}" stroke-width="4" opacity="${f(0.25 + 0.12 * Math.sin(t * 3) + 0.5 * pulso(t, T.tro, 0.7))}"/>`
    + `<rect width="${SW}" height="${SH}" rx="18" fill="${COR.navy2}" stroke="${INK}" stroke-width="4"/>`;
  let d = '';
  // grade
  for (const v of [0.25, 0.5, 0.75, 1]) d += `<path d="M34,${f(BASE - HM * v)} L340,${f(BASE - HM * v)}" stroke="#1f4268" stroke-width="2"/>`;
  d += `<path d="M34,${BASE} L340,${BASE}" stroke="#46658a" stroke-width="2.5"/>`;
  // cabeçalho
  const kt = inv(T.t0 - 0.1, T.t0 + 0.35, t);
  d += revela('lideranca_tit', 20, 14, 330, 80, kt, txt('Mapa de adoção', 28, 50, { anchor: 'start', size: 31, weight: 800, fill: '#fff' })
    + txt('CLIENTE · TECNOLOGIA', 30, 74, { anchor: 'start', size: 12, weight: 700, family: 'DM Sans', fill: '#8fa6c2', ls: 3 }));
  d += `<rect x="30" y="84" width="${f(96 * ease.out(inv(T.t0 + 0.1, T.t0 + 0.5, t)))}" height="5" rx="2.5" fill="${COR.orange}"/>`;
  d += `<circle cx="522" cy="44" r="23" fill="#fff4e6" stroke="${INK}" stroke-width="2.5"/>` + icone('map', 522, 44, 0.6);
  // barras
  VALS.forEach((v, i) => {
    const kg = back(t, T.t0 + 0.04 + i * 0.08, 0.5);
    if (kg <= 0) return;
    const live = 0.014 * Math.sin(t * 2.4 + i * 1.3);
    const hh = HM * (v + live) * kg;
    const x = barX(i);
    const sobe = i === 4 && t > T.dir + 0.35;
    d += `<rect x="${x}" y="${f(BASE - hh)}" width="38" height="${f(hh)}" rx="6" fill="${i === 4 ? COR.orange : COR.blue2}"/>`
      + `<rect x="${x + 5}" y="${f(BASE - hh + 6)}" width="6" height="${f(Math.max(0, hh - 14))}" rx="3" fill="#fff" opacity=".22"/>`;
    if (sobe) d += `<rect x="${x - 4}" y="${f(BASE - hh - 4)}" width="46" height="${f(hh + 4)}" rx="9" fill="none" stroke="${COR.orange2}" stroke-width="3" opacity="${f(0.5 + 0.4 * Math.sin(t * 8))}"/>`;
  });
  AREAS.forEach((a, i) => { d += txt(a, barX(i) + 19, BASE + 22, { size: 12, weight: 700, family: 'DM Sans', fill: '#8fa6c2', ls: 1 }); });
  // linha de tendência
  const kl = fin(t, T.t0 + 0.6, 0.55);
  if (kl > 0) {
    const pts = VALS.map((v, i) => `${barX(i) + 19},${f(BASE - HM * v - 16)}`).join(' L');
    d += `<path d="M${pts}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="100" stroke-dasharray="${f(100 * kl)} 100" opacity=".85"/>`;
    VALS.forEach((v, i) => { if (kl > i / 4 - 0.01) d += `<circle cx="${barX(i) + 19}" cy="${f(BASE - HM * v - 16)}" r="4.5" fill="#fff"/>`; });
  }
  // META (direcionando)
  const km = inv(T.dir + 0.08, T.dir + 0.45, t);
  if (km > 0) {
    const ym = BASE - HM * META - 16;
    d += revela('lideranca_meta', 30, ym - 8, 312, 16, km, `<path d="M34,${f(ym)} L340,${f(ym)}" stroke="${COR.orange}" stroke-width="4" stroke-dasharray="11 7" stroke-linecap="round"/>`);
    d += popG(back(t, T.dir + 0.3, 0.4), 370, ym, `<rect x="-30" y="-13" width="60" height="26" rx="13" fill="${COR.orange}" stroke="${INK}" stroke-width="2.5"/>${txt('META', 0, 5, { size: 13, weight: 800, family: 'DM Sans', fill: '#fff', ls: 1.5 })}`);
    d += onda(SW + 2, 238, t - (T.dir + 0.32), { r0: 6, r1: 60, w: 6, d: 0.45, duplo: false });
  }
  // donut de adoção
  const val = 82 * ease.out(inv(T.t0 + 0.08, T.t0 + 1.0, t)) + 5 * ease.inOut(inv(T.aco + 0.12, T.aco + 0.62, t));
  const C = 2 * Math.PI * DR;
  const bump = 1 + 0.1 * pulso(t, T.aco + 0.55, 0.35);
  let dn = `<circle cx="${DCX}" cy="${DCY}" r="${DR}" fill="none" stroke="#22446b" stroke-width="17"/>`
    + `<circle cx="${DCX}" cy="${DCY}" r="${DR}" fill="none" stroke="${COR.orange}" stroke-width="17" stroke-linecap="round" stroke-dasharray="${f(C * val / 100)} ${f(C)}" transform="rotate(-90 ${DCX} ${DCY})"/>`
    + txt(`${Math.round(val)}%`, DCX, DCY + 11, { size: 31, weight: 900, fill: '#fff' });
  d += pop(bump, DCX, DCY, dn);
  d += txt('ADOÇÃO', DCX, 262, { size: 12, weight: 700, family: 'DM Sans', fill: '#8fa6c2', ls: 2.5 });
  d += popG(back(t, T.aco + 0.55, 0.4), DCX, 290, `<rect x="-47" y="-14" width="94" height="28" rx="14" fill="${COR.green}" stroke="${INK}" stroke-width="2.5"/><path d="M-36,5 L-29,-6 L-22,5Z" fill="#fff"/>${txt('+5 p.p.', 7, 5, { size: 14, weight: 800, family: 'DM Sans', fill: '#fff' })}`);
  // acompanhando: varredura de leitura + cantos de HUD no donut
  const ks = inv(T.aco - 0.02, T.aco + 0.7, t);
  if (ks > 0 && ks < 1) {
    const xs = lerp(-70, SW + 10, ease.inOut(ks));
    d += `<rect x="${f(xs)}" y="0" width="70" height="${SH}" fill="url(#lideranca_scan)"/><path d="M${f(xs + 70)},0 L${f(xs + 70)},${SH}" stroke="#fff" stroke-width="2.5" opacity=".9"/>`;
  }
  const kh = inv(T.aco + 0.1, T.aco + 0.4, t) * (1 - fin(t, T.tro + 0.25, 0.3));
  d += hudCantos(DCX - 70, DCY - 70, 140, 140, kh, COR.orange, 22, 4);
  // varreduras de luz
  d += varredura('lideranca_sw1', 0, 0, SW, SH, inv(T.t0 + 0.85, T.t0 + 1.5, t))
    + varredura('lideranca_sw2', 0, 0, SW, SH, inv(T.tro + 0.1, T.tro + 0.75, t));
  c += `<g clip-path="url(#lideranca_tela)">${d}</g>`;
  s += `<g transform="translate(${SX0} ${SY0})">${c}</g>`;
  return pop(back(t, T.t0 - 0.2, 0.45), SCX, CHAO, s);
}

function cavalete(x, y, w, h, legH) {
  const st = `stroke="${INK}" stroke-width="5" stroke-linecap="round"`;
  return `<path d="M${f(x + w * 0.25)},${f(y + h - 10)} L${f(x + w * 0.12)},${f(y + h + legH)} M${f(x + w * 0.75)},${f(y + h - 10)} L${f(x + w * 0.88)},${f(y + h + legH)} M${f(x + w * 0.5)},${f(y + h)} L${f(x + w * 0.5)},${f(y + h + legH * 0.9)}" ${st} fill="none"/>`
    + `<path d="M${f(x + w * 0.25)},${f(y + h - 10)} L${f(x + w * 0.12)},${f(y + h + legH)} M${f(x + w * 0.75)},${f(y + h - 10)} L${f(x + w * 0.88)},${f(y + h + legH)}" stroke="#d8b27a" stroke-width="9" stroke-linecap="round"/>`
    + `<path d="M${f(x + w * 0.18)},${f(y + h + legH * 0.55)} L${f(x + w * 0.82)},${f(y + h + legH * 0.55)}" stroke="#d8b27a" stroke-width="8" stroke-linecap="round"/>`
    + `<rect x="${f(x - 10)}" y="${f(y + h - 6)}" width="${f(w + 20)}" height="16" rx="6" fill="#c99a5b" stroke="${INK}" stroke-width="3"/>`;
}

// ---------------- personagens ----------------
function posDir(i, t, T) {
  const D = DIRS[i];
  const a = T.t0 + D.s0, b = T.per + D.chega;
  const u = inv(a, b, t);
  const p = 1 - Math.pow(1 - u, 1.6);
  return { x: D.x + D.dx * (1 - p), andando: u < 1, chegou: b, vel: Math.pow(1 - u, 0.6) };
}

// mão (braço direito) de um diretor virado para a esquerda
const maoDir = (x, ang) => [x - (34 + 56 * Math.sin(ang * Math.PI / 180)) * DS, CHAO + (-110 + 56 * Math.cos(ang * Math.PI / 180)) * DS];

function diretores(t, T) {
  let s = '', rastros = '';
  DIRS.forEach((D, i) => {
    const P = posDir(i, t, T);
    const st = { x: P.x, y: CHAO, s: DS, t: t + i * 0.7, flip: true, gaze: [1, -0.1], expr: 'smile' };
    if (P.andando) {
      st.walk = (P.x - D.x) / 135;
      // linhas de velocidade atrás de quem caminha
      const o = 0.55 * P.vel;
      if (o > 0.04) {
        for (const [hy, len] of [[-70, 46], [-120, 64], [-165, 40]]) {
          const yy = CHAO + hy * DS;
          rastros += `<path d="M${f(P.x + 70)},${f(yy)} L${f(P.x + 70 + len * (0.6 + P.vel))},${f(yy)}" stroke="${COR.tan}" stroke-width="4" stroke-linecap="round" opacity="${f(o)}"/>`;
        }
      }
    }
    if (i === 0) {
      // acena ao entrar ("liderança")
      const kw = Math.min(fin(t, T.lid - 0.15, 0.2), 1 - fin(t, T.lid + 0.75, 0.25));
      if (kw > 0.01 && P.andando) {
        st.armL = 14 + Math.sin(st.walk * Math.PI * 2) * 16;
        st.armR = lerp(14, 130 + Math.sin(t * 13) * 16, kw);
        st.expr = 'joy';
      }
      // direcionando: aponta para a tela
      const ap = kf(t, [[T.dir - 0.1, 8], [T.dir + 0.18, 122, ease.back], [T.aco + 0.35, 122], [T.aco + 0.65, 40], [T.tro, 40], [T.tro + 0.3, 72]]);
      if (t > T.dir - 0.1) {
        st.armR = ap + (t < T.aco + 0.35 ? Math.sin(t * 7) * 3 : 0);
        st.lean = 4 * Math.min(fin(t, T.dir - 0.1, 0.25), 1 - fin(t, T.aco + 0.35, 0.3));
        st.gaze = t < T.aco + 0.4 ? [1, -0.45] : [1, -0.1];
        st.expr = t < T.aco ? 'focus' : 'smile';
      }
      if (t > T.chega) { st.expr = 'joy'; st.hop = 12 * pulso(t, T.chega + 0.05, 0.32); }
    }
    if (i === 1 && t > T.aco - 0.1) {
      // acompanhando: olha a tela e acena com a cabeça
      const u = t - T.aco;
      st.gaze = u < 1.1 ? [1, -0.5] : [1, -0.1];
      st.tilt = (u > 0 ? -7 * Math.sin(u * 11) * Math.exp(-u * 2.2) : 0) + Math.sin(t * 1.3 + 2) * 2;
      st.armR = kf(t, [[T.aco - 0.1, 8], [T.aco + 0.2, 48, ease.back], [T.tro, 48], [T.tro + 0.3, 30]]);
      st.expr = 'smile';
    }
    if (i === 2 && t > T.tro - 0.1) {
      // trocando: abre os braços
      const k = back(t, T.tro - 0.1, 0.35);
      st.armL = lerp(8, 118, k) + Math.sin(t * 6) * 6;
      st.armR = lerp(8, 128, k) + Math.sin(t * 6 + 1) * 6;
      st.expr = 'joy';
      st.hop = 14 * pulso(t, T.tro - 0.05, 0.34);
    }
    if (i === 1 && t > T.per && t < T.aco - 0.1) st.expr = 'smile';
    s += pessoa(D.id, st);
    // poeira ao parar
    s += poeiraPe(D.x, t - P.chegou, i);
  });
  return rastros + s;
}

// nuvenzinhas de poeira nos pés (ao parar de andar)
function poeiraPe(x, age, seed) {
  if (age < 0 || age > 0.55) return '';
  const k = age / 0.55, e = ease.out(k);
  let s = '';
  for (let j = 0; j < 6; j++) {
    const side = j % 2 ? 1 : -1, a = 1 + (j >> 1) * 0.45;
    const px = x + side * (30 + 62 * e * a), py = CHAO - 8 - 22 * e * (0.6 + 0.25 * ((j + seed) % 3));
    s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f((9 - (j >> 1) * 2) * (0.6 + 0.6 * e))}" fill="#e6d8bd" stroke="${COR.tan}" stroke-width="2" opacity="${f(1 - k)}"/>`;
  }
  return s;
}

function victor(t, T) {
  const armR = kf(t, [[T.t0, 112], [T.lid + 0.3, 112], [T.per - 0.1, 112], [T.per + 0.25, 64], [T.aco - 0.05, 64], [T.aco + 0.22, 116, ease.back], [T.tro - 0.08, 116], [T.tro + 0.2, 80]]) + Math.sin(t * 3.2) * 5;
  const armL = kf(t, [[T.tro - 0.08, 8], [T.tro + 0.2, 36]]) + (t > T.tro ? Math.sin(t * 4) * 4 : 0);
  let gaze = [1, -0.6];
  if (t > T.lid + 0.15) gaze = kf(t, [[T.lid + 0.15, [1, -0.6]], [T.lid + 0.4, [1, 0]], [T.aco - 0.05, [1, 0]], [T.aco + 0.2, [1, -0.55]], [T.aco + 0.9, [1, -0.55]], [T.aco + 1.1, [1, -0.05]]]);
  let expr = 'joy';
  if (t > T.lid + 0.2 && t < T.aco) expr = 'smile';
  // acena com a cabeça ao receber a direção
  const u = t - (T.dir + 0.15);
  const nod = u > 0 ? -6 * Math.sin(u * 10) * Math.exp(-u * 2.4) : 0;
  const hop = 16 * pulso(t, T.chega + 0.02, 0.34);
  return pessoa('victor', { x: VX, y: CHAO, s: VS, t, armR, armL, gaze, expr, hop, tilt: Math.sin(t * 1.3 + 6) * 2 + nod });
}

// ---------------- chamada "Liderança · sempre por perto" ----------------
function chamada(t, T) {
  const kIn = back(t, T.lid - 0.08, 0.42);
  const kOut = 1 - ease.inOut(inv(T.dir - 0.22, T.dir + 0.04, t));
  if (kIn <= 0.001 || kOut <= 0.001) return '';
  const size = 30, HH = 64, sp = largura(' ', size, 800);
  const palavras = [
    { s: 'Liderança', a: T.lid - 0.08, cor: COR.navy, letras: true },
    { s: '·', a: T.sem - 0.06, cor: COR.tan },
    { s: 'sempre', a: T.sem - 0.04, cor: COR.navy },
    { s: 'por', a: T.por - 0.04, cor: COR.orange },
    { s: 'perto', a: T.per - 0.04, cor: COR.orange },
  ];
  let xx = 0;
  const lay = palavras.map(p => { const ww = largura(p.s, size, 800); const o = { ...p, x: xx, ww }; xx += ww + sp; return o; });
  const TX = 74;
  const larg = n => TX + lay[n].x + lay[n].ww + 30;
  let w = larg(0);
  w += (larg(2) - larg(0)) * ease.out(inv(lay[2].a, lay[2].a + 0.24, t));
  w += (larg(3) - larg(2)) * ease.out(inv(lay[3].a, lay[3].a + 0.2, t));
  w += (larg(4) - larg(3)) * ease.out(inv(lay[4].a, lay[4].a + 0.22, t));
  const x0 = CHX - w / 2, y0 = CHY - HH / 2;
  let s = '';
  // conector + colchete que acompanha o grupo
  const d1 = posDir(0, t, T).x, d3 = posDir(2, t, T).x;
  const kc = ease.out(inv(T.lid + 0.08, T.lid + 0.3, t));
  const kb = ease.out(inv(T.lid + 0.22, T.lid + 0.62, t));
  const flashB = pulso(t, T.per - 0.02, 0.45);
  const corB = flashB > 0.3 ? COR.orange : COR.navy;
  if (kc > 0) s += `<path d="M${CHX},${CHY + HH / 2} L${CHX},${f(lerp(CHY + HH / 2, BRY, kc))}" stroke="${COR.navy}" stroke-width="3" stroke-dasharray="6 6"/>`;
  if (kb > 0) {
    const L = CHX - (CHX - (d1 - 64)) * kb, R = CHX + (Math.min(d3 + 64, 1896) - CHX) * kb;
    s += `<path d="M${f(L)},${BRY + 16} L${f(L)},${BRY} L${f(R)},${BRY} L${f(R)},${BRY + 16}" fill="none" stroke="${corB}" stroke-width="${f(3.5 + 2 * flashB)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<circle cx="${CHX}" cy="${BRY}" r="${f(7 + 3 * flashB)}" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`;
  }
  // pílula
  s += `<rect x="${f(x0 + 6)}" y="${f(y0 + 8)}" width="${f(w)}" height="${HH}" rx="${HH / 2}" fill="rgba(22,35,59,.14)"/>`
    + `<rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${HH}" rx="${HH / 2}" fill="#fff" stroke="${flashB > 0.3 ? COR.orange : COR.navy}" stroke-width="3.5"/>`
    + `<circle cx="${f(x0 + 36)}" cy="${CHY}" r="24" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`
    + `<g transform="translate(${f(x0 + 36)} ${CHY}) scale(.62) translate(${f(-x0 - 36)} ${-CHY})">${icone('people', x0 + 36, CHY, 1, '#fff')}</g>`;
  let tx = '';
  for (const p of lay) {
    if (p.letras) {
      let cx = 0;
      for (let j = 0; j < p.s.length; j++) {
        const ch = p.s[j];
        const k = back(t, p.a + 0.05 + j * 0.028, 0.3);
        if (k > 0.001) tx += `<g opacity="${f(clamp(k * 2))}" transform="translate(0 ${f((1 - k) * 22)})">${txt(ch, x0 + TX + p.x + cx, CHY + 11, { anchor: 'start', size, weight: 800, fill: p.cor })}</g>`;
        cx += largura(ch, size, 800);
      }
    } else {
      const k = back(t, p.a, 0.32);
      if (k > 0.001) tx += `<g opacity="${f(clamp(k * 2))}" transform="translate(0 ${f((1 - k) * 22)})">${txt(p.s, x0 + TX + p.x, CHY + 11, { anchor: 'start', size, weight: 800, fill: p.cor })}</g>`;
    }
  }
  // sublinhado em "por perto"
  const ku = ease.out(inv(T.per + 0.05, T.per + 0.4, t));
  if (ku > 0) {
    const ux0 = x0 + TX + lay[3].x, ux1 = x0 + TX + lay[4].x + lay[4].ww;
    tx += `<path d="M${f(ux0)},${CHY + 21} Q${f((ux0 + ux1) / 2)},${CHY + 27} ${f(lerp(ux0, ux1, ku))},${CHY + 20}" fill="none" stroke="${COR.orange2}" stroke-width="5" stroke-linecap="round"/>`;
  }
  s += `<clipPath id="lideranca_cal"><rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${HH}" rx="${HH / 2}"/></clipPath><g clip-path="url(#lideranca_cal)">${tx}</g>`;
  s += varredura('lideranca_swc', x0, y0, w, HH, inv(T.per + 0.05, T.per + 0.6, t), HH / 2);
  const sc = clamp(kIn, 0, 1.2) * lerp(0.65, 1, kOut);
  return `<g opacity="${f(kOut)}" transform="translate(${CHX} ${f(CHY + (1 - kOut) * -26)}) scale(${f(sc)}) translate(${-CHX} ${-CHY})">${s}</g>`
    + onda(CHX, CHY, t - T.lid, { r0: 30, r1: 230, w: 8, d: 0.55 });
}

// ---------------- balões (Direciona · Acompanha · Troca) ----------------
const BALOES = [
  { ic: 'compass', rot: 'Direciona', k: 'dir' },
  { ic: 'eye', rot: 'Acompanha', k: 'aco' },
  { ic: 'swap', rot: 'Troca', k: 'tro' },
];
function baloes(t, T) {
  let s = '', fx = '';
  const prox = { dir: T.aco, aco: T.tro, tro: T.t1 + 1 };
  BALOES.forEach((B, i) => {
    const D = DIRS[i];
    const a = T[B.k];
    const k = back(t, a - 0.07, 0.42);
    if (k <= 0.001) return;
    const size = 27, h = 62;
    const w = largura(B.rot, size, 800) + h + 30;
    const ativo = t >= a - 0.07 && t < prox[B.k];
    const bob = Math.sin(t * 2.3 + i * 1.7) * 4;
    const bx = D.bx, by = D.by + bob;
    const realce = (ativo ? 1 : 0) * clamp(inv(a - 0.07, a + 0.1, t)) + 0.6 * pulso(t, T.tro, 0.5) * (B.k === 'tro' ? 0 : 1);
    const cor = realce > 0.3 ? COR.orange : INK;
    // ícone animado
    let ic;
    const ix = -w / 2 + h / 2;
    if (B.ic === 'compass') {
      const r = 150 * (1 - ease.elastic(inv(a - 0.05, a + 0.9, t))) + Math.sin(t * 3) * 5;
      ic = `<g transform="translate(${f(ix)} 0) rotate(${f(r)})">${icone('compass', 0, 0, 0.72)}</g>`;
    } else if (B.ic === 'eye') {
      const bl = 1 - 0.9 * Math.max(pulso(t, a + 0.3, 0.18), pulso(t, a + 1.6, 0.18));
      ic = `<g transform="translate(${f(ix)} 0) scale(1 ${f(bl)})">${icone('eye', 0, 0, 0.72)}</g>`;
    } else {
      const r = 180 * ease.back(inv(a - 0.02, a + 0.5, t));
      ic = `<g transform="translate(${f(ix)} 0) rotate(${f(r)})">${icone('swap', 0, 0, 0.72)}</g>`;
    }
    let body = '';
    if (realce > 0.05) body += `<rect x="${f(-w / 2 - 9)}" y="${f(-h / 2 - 9)}" width="${f(w + 18)}" height="${h + 18}" rx="${h / 2 + 9}" fill="${COR.orange2}" opacity="${f(0.32 * clamp(realce))}"/>`;
    body += cartao(-w / 2, -h / 2, w, h, { r: h / 2, stroke: cor, sw: 3.5 + clamp(realce) })
      + `<path d="M-12,${h / 2 - 3} L0,${h / 2 + 20} L12,${h / 2 - 3}" fill="#fff" stroke="${cor}" stroke-width="3.5" stroke-linejoin="round"/><rect x="-14" y="${h / 2 - 9}" width="28" height="8" fill="#fff"/>`
      + `<circle cx="${f(ix)}" cy="0" r="${f(h * 0.37)}" fill="#fff4e6"/>` + ic
      + txt(B.rot, -w / 2 + h * 0.98, size * 0.36, { anchor: 'start', size, weight: 800, fill: COR.navy });
    const sc = k * (1 + 0.06 * clamp(realce));
    s += `<g transform="translate(${f(bx)} ${f(by + h / 2 + 20)}) scale(${f(sc)}) translate(0 ${-(h / 2 + 20)})">${body}</g>`;
    fx += particulas(31 + i * 7, bx, by, t - a, { n: 16, v: 210, d: 0.7, sz: 10, g: 90 })
      + faiscas(bx, by, t - a, COR.orange, 10, w / 2 + 6, w / 2 + 46);
  });
  return s + fx;
}

// feixe tracejado do dedo do diretor 1 até a tela (direcionando)
function feixe(t, T) {
  const k = ease.out(inv(T.dir + 0.08, T.dir + 0.36, t));
  const sai = 1 - fin(t, T.aco + 0.25, 0.3);
  if (k <= 0 || sai <= 0) return '';
  const [hx, hy] = maoDir(DIRS[0].x, 122);
  const x0 = hx - 16, y0 = hy - 10, x1 = SX0 + SW + 18, y1 = SY0 + 238;
  const xe = lerp(x0, x1, k), ye = lerp(y0, y1, k);
  const ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
  return `<g opacity="${f(sai)}"><path d="M${f(x0)},${f(y0)} L${f(xe)},${f(ye)}" stroke="${COR.orange}" stroke-width="5" stroke-dasharray="12 9" stroke-dashoffset="${f(t * 60)}" stroke-linecap="round"/>`
    + `<g transform="translate(${f(xe)} ${f(ye)}) rotate(${f(ang)})"><path d="M-16,-11 L4,0 L-16,11Z" fill="${COR.orange}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g></g>`;
}

// ---------------- laço bilateral ----------------
const FICHAS_L = ['compass', 'chat'], FICHAS_A = ['bulb', 'dash'];
function ficha(x, y, ic, cor, k) {
  if (k <= 0.001) return '';
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})"><circle r="31" fill="${cor}" stroke="${INK}" stroke-width="3.5"/><circle r="23.5" fill="#fff"/>${icone(ic, 0, 0, 0.6)}</g>`;
}
function rastroFicha(tb, s, cor) {
  let r = '';
  for (let i = 5; i >= 1; i--) {
    const [x, y] = noArco(tb, s - i * 0.016);
    if (s - i * 0.016 <= 0) continue;
    r += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(24 - i * 3)}" fill="${cor}" opacity="${f(0.36 - i * 0.055)}"/>`;
  }
  return r;
}
function ponta(tb, cor, k) {
  const [x, y, a] = noArco(tb, 1);
  return popG(k, x, y, `<g transform="rotate(${f(a * 180 / Math.PI)})"><path d="M-30,-19 L6,0 L-30,19 L-22,0Z" fill="${cor}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g>`);
}
function laco(t, T) {
  const sH = ease.out(inv(T.lanca, T.chega, t));
  if (sH <= 0) return { tras: '', frente: '' };
  let tras = '', frente = '';
  for (const [tb, cor, fichas, id] of [[TA, COR.blue, FICHAS_A, 'a'], [TL, COR.orange, FICHAS_L, 'l']]) {
    const Ld = f(tb.L * sH), Lt = f(tb.L + 20);
    // brilho largo + contorno navy + traço colorido
    tras += `<path d="${tb.d}" fill="none" stroke="${cor}" stroke-width="26" stroke-linecap="round" opacity="${f(0.16 + 0.1 * pulso(t, T.chega, 0.6))}" stroke-dasharray="${Ld} ${Lt}"/>`
      + `<path d="${tb.d}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${Ld} ${Lt}"/>`
      + `<path d="${tb.d}" fill="none" stroke="${cor}" stroke-width="6.5" stroke-linecap="round" stroke-dasharray="${Ld} ${Lt}"/>`;
    // formigas: fluxo no sentido do arco
    const ka = fin(t, T.chega - 0.05, 0.25);
    if (ka > 0) tras += `<path d="${tb.d}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3 23" stroke-dashoffset="${f(-t * 110)}" opacity="${f(0.9 * ka)}"/>`;
    // ponta da seta
    tras += ponta(tb, cor, back(t, T.chega - 0.06, 0.35));
    // cometa (ficha 0) desenhando o arco
    if (sH < 1) {
      const [x, y] = noArco(tb, sH);
      frente += rastroFicha(tb, sH, cor)
        + `<circle cx="${f(x)}" cy="${f(y)}" r="34" fill="${cor}" opacity=".55" filter="url(#fxGlow)"/>`
        + ficha(x, y, fichas[0], cor, back(t, T.lanca, 0.25));
    }
    // chegada: onda + faíscas no destino
    const [ex, ey] = noArco(tb, 1);
    frente += onda(ex, ey, t - T.chega, { r0: 16, r1: 120, w: 10, d: 0.55, cor })
      + faiscas(ex, ey, t - T.chega, cor, 10, 30, 80);
    // fichas seguintes circulando até o corte
    for (let j = 1; j < 6; j++) {
      const ta = T.chega - 0.22 + j * 0.4, dur = 0.78;
      const u = inv(ta, ta + dur, t);
      if (u <= 0 || u >= 1) continue;
      const s = 0.4 * u + 0.6 * ease.inOut(u);
      const [x, y] = noArco(tb, s);
      const k = Math.min(back(t, ta, 0.2), 1 - inv(ta + dur - 0.08, ta + dur, t));
      frente += rastroFicha(tb, s, cor) + ficha(x, y, fichas[j % 2], cor, k);
      frente += onda(ex, ey, t - (ta + dur), { r0: 12, r1: 70, w: 6, d: 0.4, cor, duplo: false });
    }
  }
  // selo central "TROCA" no meio do laço (sobre a tela) — sutil, após fechar o laço
  return { tras, frente };
}

// poça de luz no chão unindo Victor e liderança ("por perto")
function poca(t, T) {
  const k = ease.out(inv(T.per - 0.05, T.per + 0.55, t));
  if (k <= 0) return '';
  const cx = 1030, rx = 860 * k, ry = 50 * k;
  const pul = 1 + 0.04 * Math.sin(t * 3.4);
  let s = `<ellipse cx="${cx}" cy="${CHAO + 4}" rx="${f(rx * pul)}" ry="${f(ry * pul)}" fill="url(#lideranca_poca)" opacity="${f(0.85 + 0.6 * pulso(t, T.per, 0.5))}"/>`;
  // duas ondulações finas que partem do grupo da liderança e varrem o chão até o Victor
  for (const atraso of [0, 0.15]) {
    const u = t - T.per + 0.04 - atraso;
    if (u > 0 && u < 0.75) {
      const e = ease.out(u / 0.75);
      s += `<ellipse cx="${DIRS[1].x}" cy="${CHAO + 4}" rx="${f(lerp(90, 1340, e))}" ry="${f(lerp(10, 52, e))}" fill="none" stroke="${COR.orange}" stroke-width="${f(4.5 * (1 - e) + 0.5)}" opacity="${f(0.8 * (1 - e))}"/>`;
    }
  }
  // brilho no pé do Victor quando a onda chega
  s += faiscas(VX, CHAO - 4, t - (T.per + 0.36), COR.orange, 8, 40, 84);
  return s;
}

// ---------------- cena ----------------
export function desenhar(t, ctx) {
  const T = tempos(ctx);
  const cam = camera(t, T);
  const { tras, frente } = laco(t, T);
  let mundo = '';
  mundo += planta(96, t, 0.95);
  mundo += `<rect x="-300" y="${CHAO}" width="${W + 600}" height="5" rx="2" fill="#d9ccb4"/>`;
  mundo += poca(t, T);
  mundo += poeira(t, 77, 18, [120, 200, 1720, 620], COR.orange2, 0.45);
  mundo += luminaria(t, T);
  mundo += tela(t, T);
  mundo += victor(t, T);
  mundo += diretores(t, T);
  mundo += feixe(t, T);
  mundo += tras;
  mundo += chamada(t, T);
  mundo += baloes(t, T);
  mundo += frente;
  const tf = `translate(${f(960 + cam.dx)} ${f(540 + cam.dy)}) scale(${f(cam.z)}) translate(${f(-cam.cx)} ${f(-cam.cy)})`;
  return defs() + fundo(t, cam) + `<g transform="${tf}">${mundo}</g>`;
}
