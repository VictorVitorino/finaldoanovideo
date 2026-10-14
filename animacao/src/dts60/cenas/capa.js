// Cena "capa": cartão de título da curta (0 → ctx.t1 ≈ 6 s).
// Narração (palavras 0–8): "Minha trajetória na Alvarez & Marsal… em 60 segundos."
//
// Batidas (s absolutos; palavras vêm de ctx.wa):
//   0.08            cronômetro entra com overshoot (raios de sol e halo atrás)
//   0.35 + i·0.25   seis tique-taques da trilha: o anel laranja avança 60° por tique, a coroa afunda
//   0.45            pílula "DTS · Digital & Technology Services" abre como o banner da newsletter
//   0.92            a luminária acende (pisca) · 1.06 Victor surge no foco de luz
//   "Minha"         letras caem com desfoque de movimento · Victor acena
//   "trajetória"    letras sobem por máscara, sublinhado laranja se desenha, varredura de luz
//   "na Alvarez & Marsal"  marca A&M sobe, o nome é revelado palavra a palavra
//   pausa           pílula "JUL → OUT 2026" e cartão do Victor
//   "em"            selo navy · "60": número bate no mostrador (onda, partículas, tremor, brilho)
//   "segundos"      faixa laranja desenrola + varredura
//   1.20 → 1.72     o cronômetro desliza do centro para a direita, abrindo espaço para o título
//   t1−0.54 → t1−0.20  o cronômetro encolhe (60→55) e voa até o mini cronômetro do canto (filme.js),
//                  vira a pílula "0:55" e a cortina leva para a próxima cena.
//   Melhor quadro estático para miniatura: t = 5.32 s (tudo montado, sem varredura nem tremor).
import {
  COR, INK, txt, largura, cartao, pilula, icone, faiscas, marcaAM, pessoa, fundoCreme,
  back, fin, popG, clamp, lerp, inv, ease, n2, varredura, onda, particulas, poeira, revela, tremor,
} from '../base.js';

const f = n2;

export const CHIP = null;
export const LEGENDA = false;
export const INTERFACE = false;

// ---------- layout ----------
const SX = 1330, SY = 478, R = 196, RA = 153;   // cronômetro (posição final): centro, raio do corpo, raio do anel
const S0X = 960, S0Y = 508, S0K = 1.14;         // cronômetro na abertura (centro da tela, durante os tiques)
const VX = 1738, VY = 905, VS = 1.24;           // Victor (pés)
const X0 = 132;                                  // coluna do título
const FX = 760, FY = 330;                        // ponto focal do "push" de câmera
const TK = i => 0.35 + i * 0.25;                 // tique-taques da trilha
const MINI = { cx: 74, cy: 146 };                // mini cronômetro do filme.js

const bump = (t, a, d) => { const u = (t - a) / d; return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI); };

// letras com posição individual (para tipografia cinética)
function letras(str, size, weight = 900, family = 'Outfit', ls = 0) {
  const L = [];
  for (let i = 0; i < str.length; i++) {
    const wc = largura(str[i], size, weight, family);
    L.push({ c: str[i], x: largura(str.slice(0, i + 1), size, weight, family) - wc + i * ls, w: wc });
  }
  return { L, w: largura(str, size, weight, family) + (str.length - 1) * ls };
}

// ---------- câmera ----------
function camera(t, ctx) {
  const k = 1 + 0.028 * ease.sine(clamp(t / (ctx.t1 - 0.5)));
  const [a1, b1] = tremor(t, ctx.wa(7) + 0.08, 0.42, 13);
  const [a2, b2] = tremor(t, ctx.wa(8) + 0.1, 0.28, 6);
  return { k, dx: a1 + a2, dy: b1 + b2 };
}
const camTf = c => `translate(${f(FX + c.dx)} ${f(FY + c.dy)}) scale(${f(c.k)}) translate(${-FX} ${-FY})`;
const scr = (c, x, y) => [FX + c.dx + c.k * (x - FX), FY + c.dy + c.k * (y - FY)];

// ---------- fundo ----------
function fundo(t) {
  let s = fundoCreme(t, {
    doodles: false,
    blobs: [['#d7e4ee', 440, 520, 560, 340, 0], ['#f8e2c2', 1400, 480, 450, 390, 1.7], ['#f3dada', 1780, 830, 300, 230, 3.1]],
  });
  const dd = [[430, 120, 'x'], [700, 160, 'o'], [1072, 150, 'tri'], [1888, 470, 'x'], [1010, 905, 'o'], [74, 955, 'tri'], [560, 985, 'x'], [1240, 1000, 'x']];
  for (const [x, y, k] of dd) {
    const yy = y + Math.sin(t * 0.8 + x) * 6;
    if (k === 'x') s += `<path d="M${x - 10},${f(yy - 10)} l20,20 M${x + 10},${f(yy - 10)} l-20,20" stroke="${COR.tan}" stroke-width="4" stroke-linecap="round"/>`;
    else if (k === 'tri') s += `<path d="M${x},${f(yy - 12)} l12,20 l-24,0Z" fill="none" stroke="${COR.tan}" stroke-width="3.5" stroke-linejoin="round"/>`;
    else s += `<circle cx="${x}" cy="${f(yy)}" r="9" fill="none" stroke="${COR.tan}" stroke-width="3"/>`;
  }
  return s;
}

function defs() {
  return `<defs>`
    + `<radialGradient id="capa_raio" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="560"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".55"/><stop offset=".5" stop-color="${COR.orange2}" stop-opacity=".22"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="capa_halo"><stop offset=".5" stop-color="#ffffff" stop-opacity=".85"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="capa_cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".55"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity=".08"/></linearGradient>`
    + `<linearGradient id="capa_glint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COR.orange2}" stop-opacity="0"/><stop offset=".12" stop-color="${COR.orange2}" stop-opacity=".92"/><stop offset=".4" stop-color="#fff" stop-opacity=".97"/><stop offset=".6" stop-color="#fff" stop-opacity=".97"/><stop offset=".88" stop-color="${COR.orange2}" stop-opacity=".92"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></linearGradient>`
    + `<radialGradient id="capa_vin" cx=".5" cy=".5" r=".75"><stop offset=".62" stop-color="${COR.navy}" stop-opacity="0"/><stop offset="1" stop-color="${COR.navy}" stop-opacity=".10"/></radialGradient>`
    + `</defs>`;
}

// raios de sol girando atrás do cronômetro
function raios(t, k) {
  if (k <= 0.01) return '';
  const n = 18, r = 560 * k, rot = t * 0.12;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + rot, a1 = a0 + (Math.PI / n) * 0.62;
    d += `M0,0 L${f(Math.cos(a0) * r)},${f(Math.sin(a0) * r)} L${f(Math.cos(a1) * r)},${f(Math.sin(a1) * r)}Z`;
  }
  return `<path d="${d}" fill="url(#capa_raio)"/>`;
}

// posição do cronômetro: abre no centro da tela (tiques) e desliza para a direita quando o título chega
const MV0 = 1.2, MV1 = 1.72;
function posRelogio(t) {
  const u = ease.inOut(inv(MV0, MV1, t));
  const arco = Math.sin(u * Math.PI) * -46;      // leve arco no deslocamento
  return { x: lerp(S0X, SX, u), y: lerp(S0Y, SY, u) + arco, k: lerp(S0K, 1, u), u };
}

// ---------- cronômetro ----------
// desenhado na origem. st: { arc (graus), hand (graus), handK, num, numK, press, glow, flash, shimmer }
function relogio(t, st) {
  const C = 2 * Math.PI * RA;
  let s = `<circle cx="10" cy="15" r="${R}" fill="rgba(22,35,59,.16)"/>`;
  // coroa e botão lateral
  const p = st.press * 10;
  s += `<rect x="-17" y="${-R - 30}" width="34" height="38" rx="5" fill="${COR.slate}" stroke="${INK}" stroke-width="5"/>`
    + `<rect x="-52" y="${f(-R - 66 + p)}" width="104" height="38" rx="13" fill="${COR.orange}" stroke="${INK}" stroke-width="5"/>`
    + `<rect x="-36" y="${f(-R - 59 + p)}" width="44" height="7" rx="3.5" fill="#fff" opacity=".6"/>`
    + `<g transform="rotate(44)"><rect x="-16" y="${-R - 24}" width="32" height="32" rx="7" fill="${COR.lblue}" stroke="${INK}" stroke-width="5"/></g>`;
  // corpo
  s += `<circle r="${R}" fill="#fff" stroke="${INK}" stroke-width="7"/>`
    + `<circle r="${R - 22}" fill="#fdf9f2" stroke="${COR.lblue}" stroke-width="3"/>`
    + `<circle r="${RA}" fill="none" stroke="#e6edf5" stroke-width="28"/>`;
  // anel laranja (com brilho)
  if (st.arc > 0.5) {
    const dash = `stroke-dasharray="${f(C * Math.min(st.arc, 360) / 360)} ${f(C + 20)}"`;
    const arco = `<circle r="${RA}" fill="none" stroke="${COR.orange}" stroke-width="28" stroke-linecap="round" ${dash} transform="rotate(-90)"/>`;
    if (st.glow > 0.02) s += `<g opacity="${f(clamp(st.glow))}" filter="url(#fxGlow)">${arco}</g>`;
    s += arco;
    if (st.shimmer > 0) s += `<circle r="${RA}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="46 ${f(C)}" stroke-dashoffset="${f(-((t * 0.42) % 1) * C)}" transform="rotate(-90)" opacity="${f(0.6 * st.shimmer)}"/>`;
  }
  // marcações: as principais acendem em laranja quando o anel passa por elas
  let dMin = '', dMaj = '', dLit = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
    const maj = i % 5 === 0;
    const r1 = maj ? 112 : 124, r2 = 138;
    const seg = `M${f(cs * r1)},${f(sn * r1)} L${f(cs * r2)},${f(sn * r2)} `;
    if (!maj) dMin += seg; else if (i * 6 <= st.arc - 1 || (i === 0 && st.arc >= 359)) dLit += seg; else dMaj += seg;
  }
  s += `<path d="${dMin}" stroke="${COR.lblue}" stroke-width="3" stroke-linecap="round"/>`
    + (dMaj ? `<path d="${dMaj}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` : '')
    + (dLit ? `<path d="${dLit}" stroke="${COR.orange}" stroke-width="7" stroke-linecap="round"/>` : '');
  // brilho especular
  s += `<path d="M${f(Math.cos(3.55) * (R - 36))},${f(Math.sin(3.55) * (R - 36))} A${R - 36},${R - 36} 0 0 1 ${f(Math.cos(4.25) * (R - 36))},${f(Math.sin(4.25) * (R - 36))}" stroke="#fff" stroke-width="11" fill="none" stroke-linecap="round" opacity=".9"/>`;
  // ponteiro
  if (st.handK > 0.01) {
    s += `<g transform="rotate(${f(st.hand)}) scale(${f(st.handK)})"><path d="M0,22 L0,${-RA + 40}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><circle cy="${-RA + 40}" r="10" fill="${COR.orange}" stroke="${INK}" stroke-width="3.5"/></g>`
      + `<g transform="scale(${f(st.handK)})"><circle r="17" fill="${INK}"/><circle r="7" fill="${COR.orange}"/></g>`;
  }
  if (st.flash > 0.01) s += `<circle r="${R - 22}" fill="#fff" opacity="${f(st.flash)}"/>`;
  // número
  if (st.numK > 0) {
    const sc = st.numScale;
    if (sc > 1.15) s += `<g opacity="${f(0.35 * clamp(st.numK * 2))}" filter="url(#fxDesfoque)" transform="scale(${f(sc * 1.12)})">${txt(st.num, 0, 54, { size: 152, weight: 900, fill: COR.navy })}</g>`;
    s += `<g transform="scale(${f(sc)})" opacity="${f(clamp(st.numK * 3))}">${txt(st.num, 0, 54, { size: 152, weight: 900, fill: COR.navy, ls: -2 })}</g>`;
  }
  return s;
}

function estadoRelogio(t, ctx) {
  const w60 = ctx.wa(7), TI = w60 + 0.08;
  let arc = 0, press = 0, kick = 0;
  for (let i = 0; i < 6; i++) {
    arc += 60 * ease.back(inv(TK(i), TK(i) + 0.14, t));
    press = Math.max(press, bump(t, TK(i) - 0.03, 0.13));
    if (t >= TK(i)) kick = Math.max(kick, Math.exp(-(t - TK(i)) * 16));
  }
  arc = Math.min(arc, 360);
  const full = TK(5) + 0.14;
  const hand = arc + Math.max(0, t - full) * 120;
  const handK = 1 - ease.in(inv(w60 - 0.08, w60 + 0.04, t));
  const kN = inv(w60 - 0.04, TI, t);
  const numScale = lerp(2.6, 1, ease.out(kN)) * (1 + 0.07 * Math.exp(-Math.max(0, t - TI) * 9) * Math.sin(Math.max(0, t - TI) * 34));
  let glow = 0;
  if (t > full) glow = 0.35 + 0.65 * Math.exp(-(t - full) * 5) + 0.12 * Math.sin(t * 5);
  if (t > TI) glow += 0.9 * Math.exp(-(t - TI) * 4);
  return {
    arc, press, kick, hand, handK, num: '60', numK: kN, numScale, glow,
    flash: t > TI ? 0.85 * Math.exp(-(t - TI) * 9) : 0,
    shimmer: fin(t, full + 0.25, 0.3),
  };
}

// ---------- pílula DTS (homenagem ao banner da newsletter) ----------
function pilulaDTS(t, x, y, T0) {
  const u = t - T0;
  if (u <= 0) return '';
  const h = 78, sD = 48, sS = 23;
  const LD = letras('DTS', sD, 900);
  const sub = 'Digital & Technology Services';
  const wS = largura(sub, sS, 700, 'DM Sans');
  const xd = 28, xbar = xd + LD.w + 18, xs = xbar + 5 + 18;
  const w = xs + wS + 34 + 74;
  const kx = ease.out5(inv(0, 0.34, u));
  const pw = Math.max(1, w * kx);
  let s = `<rect x="${f(x + 7)}" y="${f(y + 9)}" width="${f(pw)}" height="${h}" rx="16" fill="rgba(22,35,59,.16)"/>`
    + `<rect x="${f(x)}" y="${f(y)}" width="${f(pw)}" height="${h}" rx="16" fill="${COR.navy}"/>`;
  let d = '';
  LD.L.forEach((l, i) => {
    const k = clamp(inv(0.12 + i * 0.06, 0.42 + i * 0.06, u));
    if (k <= 0) return;
    d += txt(l.c, x + xd + l.x, y + 56 + lerp(-64, 0, ease.back(k)), { anchor: 'start', size: sD, weight: 900, fill: '#fff', extra: `opacity="${f(clamp(k * 3))}"` });
  });
  const kv = ease.out(inv(0.3, 0.5, u));
  d += `<rect x="${f(x + xbar)}" y="${f(y + h / 2 - 4 - 22 * kv)}" width="5" height="${f(44 * kv)}" rx="2" fill="${COR.orange}"/>`;
  const kt = ease.out(inv(0.36, 0.72, u));
  if (kt > 0) d += txt(sub, x + xs - (1 - kt) * 26, y + 48, { anchor: 'start', size: sS, weight: 700, family: 'DM Sans', fill: '#dbe6f2', extra: `opacity="${f(kt)}"` });
  const kd = ease.out(inv(0.42, 0.85, u)), xr = x + w - 66 + (1 - kd) * 140;
  d += `<path d="M${f(xr - 22)},${f(y + h)} L${f(xr + 22)},${y} M${f(xr + 12)},${f(y + h)} L${f(xr + 56)},${y}" stroke="${COR.slate}" stroke-width="13"/>`
    + `<path d="M${f(xr - 5)},${f(y + h)} L${f(xr + 39)},${y}" stroke="${COR.orange}" stroke-width="2.5"/>`;
  const k1 = ease.out(inv(0.18, 0.45, u)), k2 = ease.out(inv(0.28, 0.55, u)), k3 = ease.out(inv(0.38, 0.65, u));
  const by = y + h - 8;
  d += `<rect x="${x}" y="${f(by)}" width="${f(w * 0.5 * k1)}" height="8" fill="${COR.orange}"/>`
    + `<rect x="${f(x + w * 0.5)}" y="${f(by)}" width="${f(w * 0.3 * k2)}" height="8" fill="${COR.slate}"/>`
    + `<rect x="${f(x + w * 0.8)}" y="${f(by)}" width="${f(w * 0.2 * k3)}" height="8" fill="${COR.lblue}"/>`;
  s += `<clipPath id="capa_pc"><rect x="${f(x)}" y="${f(y)}" width="${f(pw)}" height="${h}" rx="16"/></clipPath><g clip-path="url(#capa_pc)">${d}</g>`
    + `<rect x="${f(x)}" y="${f(y)}" width="${f(pw)}" height="${h}" rx="16" fill="none" stroke="${INK}" stroke-width="4"/>`;
  if (kx < 1) s += `<rect x="${f(x + pw - 6)}" y="${f(y - 8)}" width="12" height="${h + 16}" rx="6" fill="${COR.orange}" filter="url(#fxBlurX)"/>`;
  s += varredura('capa_pv', x, y, w, h, inv(1.0, 1.55, u), 16);
  return s;
}

// ---------- título ----------
// barra de brilho inclinada (o degradê segue a inclinação; miolo branco, bordas laranja-claro opacas
// para não "sujar" de marrom sobre o navy) + filete fino atrás, como um reflexo de After Effects
function brilho(x, yb, w, h, slant) {
  const sk = -Math.atan(slant / h) * 180 / Math.PI;
  return `<g transform="translate(${f(x)} ${f(yb)}) skewX(${f(sk)})"><rect y="${f(-h)}" width="${w}" height="${f(h)}" fill="url(#capa_glint)"/>`
    + `<rect x="${f(-w * 0.42)}" y="${f(-h)}" width="${f(w * 0.16)}" height="${f(h)}" fill="#fff" opacity=".8"/></g>`;
}
const TOPO_M = 292;   // topo da máscara do "MINHA": logo abaixo da pílula DTS (e da sua sombra)
function minha(t, T0, x, y, size) {
  const LM = letras('MINHA', size, 900, 'Outfit', 3);
  let s = '', g = '';
  LM.L.forEach((l, i) => {
    const a = T0 - 0.07 + i * 0.035;
    const k = clamp(inv(a, a + 0.36, t));
    if (k <= 0) return;
    const yy = y - (1 - ease.back(k)) * (y - TOPO_M + size * 0.1);
    if (k < 0.5) g += txt(l.c, x + l.x, yy - 40, { anchor: 'start', size, weight: 900, fill: COR.navy, extra: `opacity="${f(0.5 * (1 - k))}"` });
    s += txt(l.c, x + l.x, yy, { anchor: 'start', size, weight: 900, fill: COR.navy });
  });
  if (!s) return '';
  // máscara: as letras descem de dentro de uma faixa logo abaixo da pílula DTS
  const top = TOPO_M, bot = y + size * 0.22;
  return `<clipPath id="capa_mc"><rect x="${x - 20}" y="${f(top)}" width="${f(LM.w + 60)}" height="${f(bot - top)}"/></clipPath>`
    + `<g clip-path="url(#capa_mc)">${g ? `<g filter="url(#fxBlurY)">${g}</g>` : ''}${s}</g>`;
}

function trajetoria(t, T0, x, y, size) {
  const LT = letras('TRAJETÓRIA', size, 900, 'Outfit', 2);
  let s = '';
  LT.L.forEach((l, i) => {
    const a = T0 - 0.05 + i * 0.042;
    const k = clamp(inv(a, a + 0.38, t));
    if (k <= 0) return;
    s += txt(l.c, x + l.x, y + (1 - ease.back(k)) * size * 1.08, { anchor: 'start', size, weight: 900, fill: COR.navy });
  });
  let out = `<clipPath id="capa_tc"><rect x="${x - 20}" y="${f(y - size * 1.25)}" width="${f(LT.w + 60)}" height="${f(size * 1.25 + size * 0.16)}"/></clipPath><g clip-path="url(#capa_tc)">${s}</g>`;
  // sublinhado laranja desenhado à mão
  const ks = ease.out(inv(T0 + 0.36, T0 + 0.78, t));
  if (ks > 0.01) out += `<path d="M${f(x + 8)},${f(y + 34)} Q${f(x + LT.w * 0.55)},${f(y + 54)} ${f(x + LT.w - 6)},${f(y + 24)}" pathLength="1" stroke-dasharray="${f(ks)} 1" stroke="${COR.orange}" stroke-width="14" fill="none" stroke-linecap="round"/>`;
  // varredura de luz recortada pelas letras
  const ku = inv(T0 + 0.8, T0 + 1.35, t);
  if (ku > 0 && ku < 1) {
    let clip = '';
    LT.L.forEach(l => { clip += txt(l.c, x + l.x, y, { anchor: 'start', size, weight: 900 }); });
    const bx = lerp(x - 300, x + LT.w + 140, ease.inOut(ku));
    out += `<clipPath id="capa_tsw">${clip}</clipPath><g clip-path="url(#capa_tsw)">${brilho(bx - 20, y + size * 0.2, 104, size * 1.2, 110)}</g>`;
  }
  return { svg: out, w: LT.w };
}

function linhaAM(t, ctx, x, y) {
  const sNa = 44, sAM = 50, ls = 5;
  const wNa = largura('na', sNa, 700, 'DM Sans');
  let s = '';
  const kna = back(t, ctx.wa(2) - 0.06, 0.32);
  s += popG(kna, x + wNa / 2, y - 15, txt('na', 0, 15, { size: sNa, weight: 700, family: 'DM Sans', fill: COR.slate }));
  const mk = 0.13, mx = x + wNa + 20 - 148 * mk;
  s += revela('capa_mk', mx, y - 512 * mk - 6, 700 * mk + 8, 512 * mk + 10, inv(ctx.wa(3) - 0.07, ctx.wa(3) + 0.22, t), marcaAM(mx, y + 2, mk), 'y');
  let xx = mx + 700 * mk + 18;
  const sp = largura(' ', sAM, 700, 'DM Sans') + ls;
  const pal = [['ALVAREZ', ctx.wa(3), COR.navy], ['&', ctx.wa(4), COR.orange], ['MARSAL', ctx.wa(5), COR.navy]];
  pal.forEach(([w, ta, cor], i) => {
    const ww = largura(w, sAM, 700, 'DM Sans') + ls * w.length;
    if (w === '&') {
      s += popG(back(t, ta - 0.06, 0.32), xx + ww / 2, y - 18, txt(w, 0, 18, { size: sAM, weight: 700, family: 'DM Sans', fill: cor }));
    } else {
      const k = inv(ta - 0.06, ta + 0.28, t);
      if (k > 0) s += `<clipPath id="capa_am${i}"><rect x="${f(xx - 4)}" y="${f(y - sAM)}" width="${f((ww + 8) * ease.out(k))}" height="${f(sAM * 1.3)}"/></clipPath>`
        + `<g clip-path="url(#capa_am${i})">${txt(w, xx - (1 - ease.out(k)) * 30, y, { anchor: 'start', size: sAM, weight: 700, family: 'DM Sans', fill: cor, ls })}</g>`;
    }
    xx += ww + sp;
  });
  // varredura de luz recortada pelo nome, durante o "Marsal…" alongado
  const ku = inv(ctx.wa(5) + 0.36, ctx.wa(5) + 0.86, t);
  if (ku > 0 && ku < 1) {
    let clip = '', x2 = mx + 700 * mk + 18;
    for (const [w] of pal) { clip += txt(w, x2, y, { anchor: 'start', size: sAM, weight: 700, family: 'DM Sans', ls }); x2 += largura(w, sAM, 700, 'DM Sans') + ls * w.length + sp; }
    const x1 = mx + 700 * mk + 18, bx = lerp(x1 - 200, x2 + 60, ease.inOut(ku));
    s += `<clipPath id="capa_asw">${clip}</clipPath><g clip-path="url(#capa_asw)">${brilho(bx - 10, y + sAM * 0.3, 70, sAM * 1.3, 50)}</g>`;
  }
  return s;
}

// ---------- pílulas auxiliares ----------
function pilulaData(t, T0, x, cy) {
  const k = back(t, T0, 0.4);
  if (k <= 0.001) return '';
  const size = 30, h = 64;
  const w1 = largura('JUL', size, 800), w3 = largura('OUT 2026', size, 800);
  const xa = 76 + w1 + 14, xo = xa + 40 + 14;
  const w = xo + w3 + 30;
  const ka = ease.out(inv(T0 + 0.18, T0 + 0.45, t));
  let b = pilula(0, -h / 2, w, h, '#fff', COR.navy, 3.5)
    + `<circle cx="34" cy="0" r="23" fill="#fff4e6"/>` + icone('calendar', 34, 0, 0.78)
    + txt('JUL', 76, 11, { anchor: 'start', size, weight: 800, fill: COR.navy })
    + `<path d="M${f(xa)},0 L${f(xa + 34 * ka)},0 M${f(xa + 34 * ka - 10)},-10 L${f(xa + 34 * ka)},0 L${f(xa + 34 * ka - 10)},10" stroke="${COR.orange}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${f(clamp(ka * 3))}"/>`
    + txt('OUT 2026', xo, 11, { anchor: 'start', size, weight: 800, fill: COR.navy });
  return `<g transform="translate(${f(x)} ${f(cy)}) scale(${f(k)})">${b}</g>`;
}

function cartaoNome(t, T0) {
  const k = back(t, T0, 0.4);
  if (k <= 0.001) return '';
  const sub = 'Gestão de Mudanças em Tecnologia';
  const w = Math.max(largura(sub, 16, 700, 'DM Sans'), largura('VICTOR', 27, 900) + 12) + 58, h = 72;
  const b = cartao(-w / 2, 0, w, h, { r: 16 })
    + `<rect x="${f(-w / 2 + 15)}" y="15" width="7" height="${h - 30}" rx="3.5" fill="${COR.orange}"/>`
    + txt('VICTOR', -w / 2 + 35, 35, { anchor: 'start', size: 27, weight: 900, fill: COR.navy, ls: 2 })
    + txt(sub, -w / 2 + 35, 57, { anchor: 'start', size: 16, weight: 700, family: 'DM Sans', fill: COR.grey });
  return `<g transform="translate(${VX - 86} 938) scale(${f(k)})">${b}</g>`;
}

// selo "EM" e faixa "SEGUNDOS"
function seloEM(t, T0, kOut) {
  const k = back(t, T0 - 0.05, 0.36) * kOut;
  if (k <= 0.001) return '';
  const a = -50 * Math.PI / 180, x = SX + Math.sin(a) * (R + 14), y = SY - Math.cos(a) * (R + 14);
  const wob = Math.sin(t * 3) * 3;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(-10 + wob)}) scale(${f(k)})"><circle cx="5" cy="7" r="54" fill="rgba(22,35,59,.16)"/><circle r="54" fill="${COR.navy}" stroke="${INK}" stroke-width="5"/><circle r="43" fill="none" stroke="${COR.orange}" stroke-width="3" stroke-dasharray="7 6"/>${txt('EM', 0, 15, { size: 42, weight: 900, fill: '#fff', ls: 1 })}</g>`;
}

function faixa(t, T0, kOut) {
  const k = back(t, T0 - 0.06, 0.34) * kOut;
  if (k <= 0.001) return '';
  const w = 506, h = 100, cy = SY + R + 14;
  const LS = letras('SEGUNDOS', 72, 900, 'Outfit', 5);
  let b = '';
  // pontas dobradas (navy)
  const kt = clamp(inv(T0 + 0.08, T0 + 0.24, t));
  if (kt > 0) {
    for (const sd of [-1, 1]) {
      const x0 = sd * (w / 2 - 34), x1 = sd * (w / 2 + 40 * kt);
      b += `<path d="M${f(x0)},-24 L${f(x1)},-24 L${f(x1 - sd * 22)},${f(h / 2 - 12 + 6)} L${f(x1)},${f(h / 2 + 20)} L${f(x0)},${f(h / 2 + 20)}Z" fill="${COR.navy}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    }
  }
  b += `<rect x="${-w / 2 + 6}" y="${-h / 2 + 9}" width="${w}" height="${h}" rx="16" fill="rgba(22,35,59,.18)"/>`
    + `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16" fill="${COR.orange}" stroke="${INK}" stroke-width="5"/>`
    + `<rect x="${-w / 2 + 10}" y="${-h / 2 + 10}" width="${w - 20}" height="${h - 20}" rx="10" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="9 7" opacity=".55"/>`;
  let tx = '';
  LS.L.forEach((l, i) => {
    const kk = clamp(inv(T0 - 0.07 + i * 0.03, T0 + 0.21 + i * 0.03, t));
    if (kk <= 0) return;
    tx += txt(l.c, -LS.w / 2 + l.x, 26 + (1 - ease.back(kk)) * 86, { anchor: 'start', size: 72, weight: 900, fill: '#fff' });
  });
  b += `<clipPath id="capa_fc"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16"/></clipPath><g clip-path="url(#capa_fc)">${tx}</g>`;
  b += varredura('capa_fv', -w / 2, -h / 2, w, h, inv(T0 + 0.22, T0 + 0.58, t), 16);
  return `<g transform="translate(${SX} ${cy}) rotate(-3) scale(${f(Math.max(0.001, k))} ${f(Math.max(0.001, Math.min(1.15, 0.6 + 0.4 * k)))})">${b}</g>`;
}

// ---------- luminária, foco de luz e Victor ----------
function luminaria(t, on) {
  const sw = Math.sin(t * 1.6) * 1.6;
  let s = `<g transform="rotate(${f(sw)} ${VX} -10)">`;
  if (on > 0.01) {
    s += `<path d="M${VX - 64},186 L${VX + 64},186 L${VX + 260},${VY} L${VX - 260},${VY}Z" fill="url(#capa_cone)" opacity="${f(on)}"/>`;
  }
  s += `<path d="M${VX},-10 L${VX},124" stroke="${INK}" stroke-width="4"/>`
    + `<rect x="${VX - 9}" y="112" width="18" height="16" rx="3" fill="${COR.slate}" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M${VX - 30},126 L${VX + 30},126 L${VX + 76},182 L${VX - 76},182Z" fill="${COR.navy}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
    + `<path d="M${VX - 18},136 L${VX - 44},170" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>`
    + `<rect x="${VX - 80}" y="178" width="160" height="11" rx="5" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`
    + `<ellipse cx="${VX}" cy="192" rx="28" ry="10" fill="${on > 0.5 ? '#fff8e8' : '#d8cfbf'}" stroke="${INK}" stroke-width="3"/>`;
  s += '</g>';
  if (on > 0.01) s += `<ellipse cx="${VX}" cy="${VY}" rx="250" ry="36" fill="${COR.orange2}" opacity="${f(0.32 * on)}"/>`;
  return s;
}

function victor(t, ctx, TF) {
  const k = back(t, 1.06, 0.42);
  if (k <= 0.001) return '';
  const wM = ctx.wa(0), w60 = ctx.wa(7), wS = ctx.wa(8);
  const waveA = 116 + Math.sin(t * 13) * 12;     // 104–128°: a mão nunca encosta na cabeça
  const up1 = fin(t, wM - 0.28, 0.25), down1 = fin(t, 3.25, 0.3);
  const cel = fin(t, w60 + 0.02, 0.16) * (1 - fin(t, wS - 0.1, 0.25));
  const up2 = fin(t, wS - 0.05, 0.25), pt = fin(t, TF, 0.18);
  let armR = lerp(8, waveA, up1);
  armR = lerp(armR, 10, down1);
  armR = lerp(armR, 124 + Math.sin(t * 12) * 6, cel);   // braços em "V" de comemoração
  armR = lerp(armR, waveA, up2);
  armR = lerp(armR, 12, pt);
  let armL = lerp(8, 124 + Math.sin(t * 12 + 1) * 6, cel);
  armL = lerp(armL, 112, pt);                       // aponta para o mini cronômetro (canto superior esquerdo)
  let expr = 'smile';
  if (t >= wM - 0.3 && t < 2.7) expr = 'joy';
  else if (t >= w60 && t < wS) expr = 'wow';
  else if (t >= wS && t < TF) expr = 'proud';
  else if (t >= TF) expr = 'joy';
  let gaze = [0, 0];
  if (t >= 2.7 && t < w60) gaze = [-1, -0.3];
  else if (t >= w60 && t < wS + 0.2) gaze = [-1, -0.6];
  else if (t >= TF) gaze = [-1, -1];
  const hop = 30 * bump(t, w60 + 0.04, 0.36) + 22 * bump(t, 1.2, 0.28);
  return pessoa('victor', { x: VX, y: VY, s: VS * k, t, armL, armR, expr, gaze, hop, lean: -7 * pt, alpha: clamp(k * 3) });
}

// faíscas de brilho (estrelinhas) ao redor do cronômetro
function brilhos(t, T0) {
  const P = [[1118, 238, 0.62], [1668, 262, 0.72], [1080, 812, 0.5], [1610, 790, 0.45], [1240, 120, 0.42]];
  let s = '';
  P.forEach(([x, y, sc], i) => {
    const k = back(t, T0 + i * 0.07, 0.35);
    if (k <= 0.001) return;
    const tw = 0.75 + 0.25 * Math.sin(t * 4.2 + i * 1.7);
    s += `<g transform="translate(${x} ${f(y + Math.sin(t * 1.5 + i) * 6)}) rotate(${f(Math.sin(t + i) * 12)})">${icone('sparkle', 0, 0, sc * k * tw)}</g>`;
  });
  return s;
}

// ---------- voo do cronômetro até o mini cronômetro ----------
function miniTimer(t, ctx, kP) {
  const navy = COR.navy, rr = 22, cx = MINI.cx, cy = MINI.cy;
  const ang = 360 * clamp(t / ctx.TOTAL);
  const a = (ang - 90) * Math.PI / 180;
  const resta = Math.max(0, Math.ceil(60 * (1 - t / ctx.TOTAL) - 1e-6));
  const eP = ease.out(kP), w = lerp(56, 138, eP);
  const xr = Math.max(98, 44 + w - 28);   // texto recortado à direita do mostrador, dentro da ponta arredondada
  return pilula(44, 118, w, 56, '#fff', navy, 3)
    + `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="#eef2f7"/>`
    + (ang > 0.5 ? `<path d="M${cx},${cy} L${cx},${cy - rr} A${rr},${rr} 0 ${ang > 180 ? 1 : 0} 1 ${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}Z" fill="${COR.orange}"/>` : '')
    + `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${navy}" stroke-width="2.5"/>`
    + `<clipPath id="capa_mt"><path d="M98,118 L${f(xr)},118 A28,28 0 0 1 ${f(xr)},174 L98,174Z"/></clipPath>`
    + `<g clip-path="url(#capa_mt)">${txt(`0:${String(resta).padStart(2, '0')}`, 106 - (1 - eP) * 10, cy + 11, { anchor: 'start', size: 30, weight: 800, fill: navy, extra: `opacity="${f(eP)}"` })}</g>`;
}

// ---------- quadro ----------
export function desenhar(t, ctx) {
  const c = camera(t, ctx);
  const w60 = ctx.wa(7), wSeg = ctx.wa(8), TI = w60 + 0.08;
  const TF = ctx.t1 - 0.54, TL = ctx.t1 - 0.2;    // voo até o mini cronômetro
  const voando = t >= TF;
  const kOut = 1 - ease.in(inv(TF - 0.08, TF + 0.08, t));   // selo e faixa saem antes do cronômetro ganhar velocidade
  const fica = 1 - 0.55 * fin(t, TF + 0.2, 0.5);    // halo e raios baixam devagar (sem sumir) depois que o cronômetro parte
  const P = posRelogio(t);
  const full = TK(5) + 0.14;

  let s = defs();
  // fundo com paralaxe suave (retângulo de base evita bordas durante o tremor)
  s += `<rect width="1920" height="1080" fill="${COR.cream}"/>`;
  const kb = 1 + 0.01 * ease.sine(clamp(t / ctx.t1));
  s += `<g transform="translate(${f(FX + c.dx * 0.45)} ${f(FY + c.dy * 0.45)}) scale(${f(kb)}) translate(${-FX} ${-FY})">${fundo(t)}</g>`;
  s += `<rect width="1920" height="1080" fill="url(#capa_vin)"/>`;

  // ----- camada 1: raios, halo, luz -----
  const on = t < 0.92 ? 0 : t < 0.98 ? 1 : t < 1.05 ? 0.25 : fin(t, 1.05, 0.12);
  const kS = back(t, 0.08, 0.45);
  const kR = fin(t, 0.15, 0.5) + (t > TI ? 0.16 * Math.exp(-(t - TI) * 3) : 0);   // tamanho; na partida só a opacidade cai
  let c1 = '';
  if (kR > 0.01 && fica > 0.01) c1 += `<g transform="translate(${f(P.x)} ${f(P.y)}) scale(${f(P.k)})"${fica < 1 ? ` opacity="${f(fica)}"` : ''}>${raios(t, kR)}</g>`;
  if (kS > 0.01) c1 += `<circle cx="${f(P.x)}" cy="${f(P.y)}" r="${f((R + 110) * P.k * Math.min(1, kS))}" fill="url(#capa_halo)" opacity="${f(fica)}"/>`;
  // "fantasma" tracejado do cronômetro no lugar de onde ele partiu (evita um vazio antes da cortina)
  const kG = voando ? 0.85 * ease.out(inv(TF + 0.04, TF + 0.17, t)) * (1 - 0.4 * fin(t, TF + 0.2, 0.4)) : 0;
  if (kG > 0.01) {
    // silhueta tracejada (corpo + coroa), como o contorno do lugar onde o objeto estava; respira levemente
    const kg = 1 + 0.05 * ease.out(inv(TF, TF + 0.5, t)) + 0.012 * Math.sin(t * 9);
    const tr = `stroke="${COR.blue3}" stroke-width="${f(5.5 / kg)}" stroke-dasharray="16 12" stroke-linecap="round" fill="none"`;
    c1 += `<g transform="translate(${SX} ${SY}) scale(${f(kg)})" opacity="${f(kG)}">`
      + `<circle r="${R}" fill="#fff" opacity=".42"/>`
      + `<circle r="${R}" ${tr} stroke-dashoffset="${f(-t * 60)}"/>`
      + `<rect x="-52" y="${-R - 66}" width="104" height="38" rx="13" ${tr} stroke-dashoffset="${f(t * 30)}"/>`
      + `<path d="M-17,${-R - 26} L-17,${-R} M17,${-R - 26} L17,${-R}" ${tr}/>`
      + `<circle r="${RA}" fill="none" stroke="${COR.orange2}" stroke-width="5" stroke-dasharray="6 14" stroke-linecap="round" stroke-dashoffset="${f(t * 40)}" opacity=".8"/>`
      + `</g>`;
  }
  c1 += luminaria(t, on);
  c1 += poeira(t, 5, 22, [820, 140, 1080, 760], COR.orange, 0.35);
  s += `<g transform="${camTf(c)}">${c1}`;

  // cronômetro (dentro da câmera enquanto não voa)
  const st = estadoRelogio(t, ctx);
  const fl = Math.sin(t * 1.8) * 5 * fin(t, 0.5, 0.4);
  if (!voando && kS > 0.001) {
    const sc = kS * P.k * (1 + 0.035 * st.kick);
    s += `<g transform="translate(${f(P.x)} ${f(P.y + fl)}) rotate(${f((1 - Math.min(1, kS)) * -14 + 4 * Math.sin(P.u * Math.PI))}) scale(${f(sc)})">${relogio(t, st)}</g>`;
  }

  // ----- camada 2: tipografia, pílulas, Victor, efeitos -----
  let c2 = '';
  // faíscas na ponta do anel a cada tique
  for (let i = 0; i < 6; i++) {
    const a = (i + 1) * Math.PI / 3, rr = RA * P.k;
    c2 += faiscas(P.x + Math.sin(a) * rr, P.y + fl - Math.cos(a) * rr, t - TK(i) - 0.08, COR.orange, 6, 12, 40);
  }
  c2 += faiscas(P.x, P.y - (R + 50) * P.k, t - TK(0), COR.orange, 8, 30, 70);
  c2 += onda(SX, SY, t - full, { r0: R - 10, r1: R + 130, d: 0.5, w: 10 });
  c2 += onda(SX, SY, t - TI, { r0: R * 0.9, r1: R + 300, d: 0.65, w: 20 });
  c2 += particulas(31, SX, SY, t - TI, { n: 30, v: 600, d: 0.95, sz: 13 });
  if (!voando) c2 += seloEM(t, ctx.wa(6), kOut);
  c2 += onda(SX + Math.sin(-50 * Math.PI / 180) * (R + 14), SY - Math.cos(-50 * Math.PI / 180) * (R + 14), t - ctx.wa(6) - 0.05, { r0: 40, r1: 120, d: 0.4, w: 8, duplo: false });
  if (!voando) c2 += faixa(t, wSeg, kOut);
  c2 += faiscas(SX, SY + R + 14, t - wSeg - 0.12, COR.orange, 10, 280, 340);
  c2 += brilhos(t, full + 0.1);

  c2 += pilulaDTS(t, X0, 204, 0.45);
  c2 += minha(t, ctx.wa(0), X0, 436, 120);
  const sizeT = Math.min(170, 905 / (largura('TRAJETÓRIA', 100, 900) / 100 + 0.18));
  c2 += trajetoria(t, ctx.wa(1), X0 - 4, 606, sizeT).svg;
  c2 += linhaAM(t, ctx, X0, 744);
  c2 += pilulaData(t, 3.42, X0, 852);

  c2 += victor(t, ctx, TF);
  c2 += faiscas(VX, VY - 10, t - 1.32, COR.orange, 8, 60, 120);
  c2 += cartaoNome(t, 3.62);

  // partida do cronômetro: onda e partículas no lugar
  if (voando) {
    c2 += onda(SX, SY, t - TF - 0.06, { r0: R * 0.7, r1: R + 160, d: 0.5, w: 12, cor: COR.orange });
    c2 += particulas(47, SX, SY, t - TF - 0.06, { n: 34, v: 520, d: 0.95, sz: 13, g: 420 });
  }
  s += c2 + '</g>';

  // ----- voo (espaço de tela) -----
  if (voando) {
    const u = inv(TF, TL, t);
    const [x0, y0] = scr(c, SX, SY + fl);
    const P1 = [820, 30];
    const pos = uu => {
      const e = ease.inOut(uu), a = (1 - e) * (1 - e), b = 2 * (1 - e) * e, d = e * e;
      return [a * x0 + b * P1[0] + d * MINI.cx, a * y0 + b * P1[1] + d * MINI.cy];
    };
    const scl = uu => lerp(c.k, 22 / R, ease.inOut(uu)) * (1 + 0.08 * bump(uu, 0, 0.32));
    // cauda de cometa afilada (rastro de movimento)
    const cauda = (len, larg, cor, op) => {
      const n = 16, L = [], Rr = [];
      for (let i = 0; i <= n; i++) {
        const uu = clamp(u - (i / n) * len);
        const [px, py] = pos(uu), [qx, qy] = pos(clamp(uu + 0.01)), [rx, ry] = pos(clamp(uu - 0.01));
        let tx = qx - rx, ty = qy - ry;
        const m = Math.hypot(tx, ty) || 1;
        tx /= m; ty /= m;
        const w = R * scl(uu) * larg * (1 - i / n);
        L.push(`${f(px - ty * w)},${f(py + tx * w)}`);
        Rr.unshift(`${f(px + ty * w)},${f(py - tx * w)}`);
      }
      return `<path d="M${L.join(' L')} L${Rr.join(' L')}Z" fill="${cor}" opacity="${f(op)}"/>`;
    };
    const kc = Math.min(1, u * 5) * (1 - inv(0.8, 1, u));
    if (kc > 0.01) s += cauda(0.34, 0.92, COR.orange2, 0.4 * kc) + cauda(0.22, 0.42, COR.orange, 0.5 * kc);
    const oV = 1 - inv(TL - 0.05, TL + 0.02, t);
    if (oV > 0.001) {
      const [px, py] = pos(u);
      const n = 60 - Math.floor(5 * ease.out(inv(TF + 0.06, TL - 0.06, t)) + 1e-6);
      const stV = { ...st, num: String(n), numK: 1, numScale: 1, flash: 0, handK: 0, glow: st.glow * (1 - u) };
      s += `<g transform="translate(${f(px)} ${f(py)}) rotate(${f(-22 * bump(u, 0, 1))}) scale(${f(scl(u))})" opacity="${f(oV)}">${relogio(t, stV)}</g>`;
    }
    // selo "EM" e faixa "SEGUNDOS" continuam por cima enquanto encolhem: o cronômetro sai por baixo deles
    if (kOut > 0.001) s += `<g transform="${camTf(c)}">${seloEM(t, ctx.wa(6), kOut)}${faixa(t, wSeg, kOut)}</g>`;
    const kP = inv(TL - 0.05, TL + 0.1, t);
    if (kP > 0) s += miniTimer(t, ctx, kP);
    s += onda(MINI.cx, MINI.cy, t - TL, { r0: 24, r1: 96, d: 0.4, w: 8 });
  }
  return s;
}
