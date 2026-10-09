// Gags e cartelas novas do roteiro FY26: "go-live adiado" (botão, calendário vivo, monitor
// fumegando, mão no cabelo), "Operação NF" (envelope, lasers, cabo, gota, alarme, cofre,
// NF gigante, obstáculos, pista) e cartelas (cartão de portfólio, tile de número, barra de
// meses, portas, pipeline). Mesmas convenções de props.js: funções puras do tempo que devolvem
// SVG 1920x1080; idade em s desde a entrada (idade < 0 = ''); (x, y) = base central no chão,
// salvo indicação; todas aceitam o.escala. Ids de defs com prefixo "gg".
import { TAU, clamp, lerp, inv, ease, kf, rng, text, measure, esc, n2, g, op, tr } from '../core.js';
import { logo } from '../assets.js';
import { INK } from './props.js';
import { icone, COR, brilhoCabelo, carimbo, adesivo, chip } from './graficos.js';

const F = n2;
const K = {
  papel: '#fffaf0', creme: '#fbf1de', creme2: '#f1e2c4', bege: '#e9d6b4', pardo: '#c9a26b', pardo2: '#a9834f',
  navy: '#2c4a7a', navy2: '#1e3560', aco: '#e4e7ec', cinza: '#d5d0c6', cinza2: '#a39b8f', grafite: '#3b4660', grafite2: '#2a3146',
  vermelho: '#e5534b', laranja: '#f08a3c', amarelo: '#f5c04a', verde: '#57b47a', verde2: '#3e9a5a', azul: '#5aa9e6', vidro: '#bfe3f2',
  pele: '#e8b48f', tijolo: '#c8553d', madeira: '#c98e55', madeira2: '#9c6638', laser: '#ff3b4a', fumo: '#c3c6cf', fumo2: '#9ea3b0', agua: '#8fd3f7',
};
const tom = (hex, k = 0.2) => {
  const h = hex.replace('#', ''), v = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)), a = [42, 26, 18];
  return '#' + v.map((c, i) => Math.round(lerp(c, a[i], k)).toString(16).padStart(2, '0')).join('');
};

// ---------- primitivas (iguais a props.js) ----------
const st = (k = 3, cor = INK) => (k ? ` stroke="${cor}" stroke-width="${k}" stroke-linejoin="round" stroke-linecap="round"` : '');
const xa = x2 => (x2 ? ' ' + x2 : '');
const R = (x, y, w, h, r, fill, k = 3, x2 = '', cor = INK) => `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" rx="${F(r)}" fill="${fill}"${st(k, cor)}${xa(x2)}/>`;
const Ci = (cx, cy, r, fill, k = 3, x2 = '', cor = INK) => `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(r)}" fill="${fill}"${st(k, cor)}${xa(x2)}/>`;
const E = (cx, cy, rx, ry, fill, k = 3, x2 = '', cor = INK) => `<ellipse cx="${F(cx)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry)}" fill="${fill}"${st(k, cor)}${xa(x2)}/>`;
const P = (d, fill = 'none', k = 3, x2 = '', cor = INK) => `<path d="${d}" fill="${fill}"${st(k, cor)}${xa(x2)}/>`;
const Ln = (x1, y1, x2, y2, k = 3, cor = INK, x3 = '') => `<line x1="${F(x1)}" y1="${F(y1)}" x2="${F(x2)}" y2="${F(y2)}" stroke="${cor}" stroke-width="${k}" stroke-linecap="round"${xa(x3)}/>`;
const T = (s, x, y, size, fill = INK, o = {}) => text(s, x, y, { size, fill, weight: o.weight ?? 800, anchor: o.anchor ?? 'middle', family: o.family ?? 'Outfit', ls: o.ls, extra: o.extra });
// texto com contorno de tinta (estilo "PLIM!")
const Tc = (s, x, y, size, fill, k = 5, extra = '') => `<text x="${F(x)}" y="${F(y)}" font-family="Outfit" font-weight="900" font-size="${size}" text-anchor="middle" fill="${fill}" stroke="${INK}" stroke-width="${k}" stroke-linejoin="round" paint-order="stroke"${xa(extra)}>${s}</text>`;
const larg = (s, font) => measure(s, font);

function caixa(x, y, w, h, r, fill, o = {}) {
  const sh = o.sombra ?? tom(fill, 0.16);
  let s = R(x, y, w, h, r, fill, 0);
  const b = o.base ?? Math.min(h * 0.16, 14);
  if (b > 0) s += R(x, y + h - b, w, b, Math.min(r, b), sh, 0) + R(x, y + h - b, w, Math.min(r, b) * 0.6, 0, sh, 0);
  if (o.lado) s += R(x + w - o.lado, y, o.lado, h, Math.min(r, o.lado), sh, 0) + R(x + w - o.lado, y, Math.min(r, o.lado) * 0.6, h, 0, sh, 0);
  return s + R(x, y, w, h, r, 'none', o.k ?? 3);
}
const forma = (d, fill, dSombra, sh) => P(d, fill, 0) + (dSombra ? P(dSombra, sh ?? tom(fill, 0.16), 0) : '') + P(d, 'none', 3);
const chao = (w, cx = 0, cy = 0) => `<ellipse cx="${F(cx)}" cy="${F(cy + 3)}" rx="${F(w / 2)}" ry="${F(Math.max(7, w * 0.04))}" fill="rgba(0,0,0,.22)"/>`;
function pop(idade, a, ox, oy, body, queda = 0, d = 0.42) {
  const u = inv(a, a + d, idade);
  if (u <= 0) return '';
  if (u >= 1) return body;
  const s = ease.back(u), dy = -queda * (1 - ease.out(u));
  return g(`translate(${F(ox)} ${F(oy + dy)}) scale(${F(Math.max(0.001, s))}) translate(${F(-ox)} ${F(-oy)})`, body);
}
const rot = (a, cx, cy, body) => g(`rotate(${F(a)} ${F(cx)} ${F(cy)})`, body);
const mv = (dx, dy, body) => g(`translate(${F(dx)} ${F(dy)})`, body);
const raiz = (x, y, o, body) => g(tr(x, y, o.escala ?? 1, o.rot ?? 0), body);
const quadro = idade => Math.floor(idade * 12); // "em dois", estilo anime
// sombra + contorno fundidos: desenha tudo com traço grosso e depois só o preenchimento
const silhueta = (pecas, k = 6) => pecas.map(([f, fill]) => f(k)).join('') + pecas.map(([f, fill]) => f(0)).join('');

// fumaça: bolinhas que sobem, crescem e somem (com contorno)
function fumaca(cx, cy, idade, o = {}) {
  let s = '';
  const n = o.n ?? 4, per = o.per ?? 2.2, cor = o.cor ?? K.fumo, cresce = o.cresce ?? 1.3;
  for (let j = 0; j < n; j++) {
    const f = (idade / per + j / n) % 1;
    const r = (o.r ?? 12) * (0.6 + f * cresce);
    const px = cx + Math.sin(f * 5 + j) * (o.ondula ?? 8) + f * (o.vento ?? 30), py = cy - f * (o.alt ?? 110);
    s += Ci(px, py, r, cor, 2.5, `opacity="${F((1 - f) * Math.min(1, f * 6))}"`);
  }
  return s;
}
// nuvem de 5 bolotas (silhueta única)
function nuvem(cx, cy, r, cor = K.fumo) {
  const bs = [[0, 0.05, 1], [-0.85, 0.25, 0.7], [0.85, 0.25, 0.7], [-0.45, -0.45, 0.68], [0.5, -0.4, 0.62]];
  return silhueta(bs.map(([dx, dy, k]) => [sw => Ci(cx + dx * r, cy + dy * r, r * k, cor, sw)]));
}
// chamas: línguas de fogo tremulando sobre uma base de largura lw, até a altura alt
function chamas(cx, cy, idade, o = {}) {
  const n = o.n ?? 5, alt = o.alt ?? 90, lw = o.larg ?? 120;
  const Rr = rng((o.seed ?? 5) + quadro(idade) * 131);
  const ling = [];
  for (let i = 0; i < n; i++) {
    const fx = cx - lw / 2 + (lw / (n - 1)) * i + (Rr() - 0.5) * 8;
    const hh = alt * (0.55 + 0.45 * Rr()) * (i === 0 || i === n - 1 ? 0.65 : 1), ww = (lw / n) * 1.1;
    ling.push([fx, hh, ww]);
  }
  const lingua = (fx, hh, ww, k) => `M${F(fx - ww / 2)} ${F(cy)} C${F(fx - ww / 2)} ${F(cy - hh * 0.45)} ${F(fx - ww * 0.12)} ${F(cy - hh * 0.7)} ${F(fx)} ${F(cy - hh)} C${F(fx + ww * 0.12)} ${F(cy - hh * 0.7)} ${F(fx + ww / 2)} ${F(cy - hh * 0.45)} ${F(fx + ww / 2)} ${F(cy)} Z`;
  let s = ling.map(([fx, hh, ww]) => P(lingua(fx, hh, ww), K.laranja, 6)).join('') + ling.map(([fx, hh, ww]) => P(lingua(fx, hh, ww), K.laranja, 0)).join('');
  s += ling.map(([fx, hh, ww]) => P(lingua(fx, hh * 0.5, ww * 0.5), K.amarelo, 0)).join('');
  return s;
}
// estrelinha de 4 pontas
const estrela = (cx, cy, r, fill, k = 0) => P(`M${F(cx)} ${F(cy - r)} Q${F(cx + r * 0.22)} ${F(cy - r * 0.22)} ${F(cx + r)} ${F(cy)} Q${F(cx + r * 0.22)} ${F(cy + r * 0.22)} ${F(cx)} ${F(cy + r)} Q${F(cx - r * 0.22)} ${F(cy + r * 0.22)} ${F(cx - r)} ${F(cy)} Q${F(cx - r * 0.22)} ${F(cy - r * 0.22)} ${F(cx)} ${F(cy - r)} Z`, fill, k);
// placa amarela com texto (centrada em 0,0)
function placa(texto, o = {}) {
  const tam = o.tam ?? 20, w = larg(texto, `900 ${tam}px Outfit`) + tam * 1.6, h = tam * 2.2;
  return R(-w / 2, -h / 2 + 4, w, h, 8, 'rgba(0,0,0,.25)', 0) + R(-w / 2, -h / 2, w, h, 8, o.cor ?? K.amarelo, 3) + T(texto, 0, tam * 0.36, tam, INK, { weight: 900 });
}
// placa num poste (base em 0,0)
const placaPoste = (texto, h, o = {}) => Ln(0, 0, 0, -h, 8) + Ln(0, 0, 0, -h, 4, '#a3a9b7') + mv(0, -h, placa(texto, o));

export function defs() {
  return `<filter id="ggGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>`
    + `<filter id="ggGlow4" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>`
    + `<radialGradient id="ggVinhetaAlarme" cx="50%" cy="50%" r="70%"><stop offset="35%" stop-color="#ff2a2a" stop-opacity="0"/><stop offset="100%" stop-color="#ff2a2a" stop-opacity=".8"/></radialGradient>`
    + `<radialGradient id="ggLuz" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffe7a0" stop-opacity=".65"/><stop offset="100%" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="ggFeixe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="ggPorta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3b0" stop-opacity=".1"/></linearGradient>`;
}

// =====================================================================
// GAG 1 — GO-LIVE ADIADO (fundo escuro)
// =====================================================================

// Pedestal com botão vermelho "GO-LIVE". o: apertado (0–1, afunda com squash), escala. ~220x260
export function botaoGoLive(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const ap = clamp(o.apertado ?? 0);
  let s = chao(230);
  s += forma('M-100 0 L-84 -140 Q-82 -148 -74 -148 L74 -148 Q82 -148 84 -140 L100 0 Z', K.grafite, 'M-100 0 L-97 -20 L97 -20 L100 0 Z', K.grafite2);
  s += R(-64, -104, 128, 42, 9, K.papel, 3) + T('GO-LIVE', 0, -74, 24, INK, { weight: 900, ls: 1 });
  s += Ci(-74, -124, 5, K.verde, 2) + Ci(74, -124, 5, K.vermelho, 2);
  s += E(0, -148, 100, 20, '#505c7e', 3);
  s += E(0, -154, 66, 15, K.cinza, 3) + E(0, -154, 52, 10, tom(K.cinza, 0.25), 0);
  // botão (base local em 0,0)
  let b = R(-50, -56, 100, 48, 0, tom(K.vermelho, 0.22), 0);
  b += P('M-50 -58 L-50 -10 A50 15 0 0 0 50 -10 L50 -58 A50 15 0 0 0 -50 -58 Z', K.vermelho, 0);
  b += P('M-50 -24 L-50 -10 A50 15 0 0 0 50 -10 L50 -24 A50 15 0 0 1 -50 -24 Z', tom(K.vermelho, 0.22), 0);
  b += P('M-50 -58 L-50 -10 A50 15 0 0 0 50 -10 L50 -58 A50 15 0 0 0 -50 -58 Z', 'none', 3);
  b += E(0, -58, 50, 15, '#f2766d', 3) + E(-16, -60, 16, 5, 'rgba(255,255,255,.55)', 0);
  s += op(ap * 0.5, Ci(0, -200, 95, K.vermelho, 0, 'filter="url(#ggGlow)"'));
  s += g(`translate(0 ${F(-154 + 26 * ap)}) scale(${F(1 + 0.12 * ap)} ${F(1 - 0.4 * ap)})`, b);
  return pop(idade, 0, x, y, raiz(x, y, o, s), 0, 0.4);
}

// ---------- folha viva: pernas, bracinhos, olhos e boca sobre um corpo (origem na base do corpo) ----------
// corpo: fn() do corpo, base em (0,0), subindo até -h. olhos em (0, oy); boca em (0, by)
function folhaViva(idade, o, w, h, corpo, oy, by, seed = 1) {
  const vivo = clamp(o.vivo ?? 1), corre = clamp(o.corre ?? 0), cara = o.cara ?? 'normal';
  const ph = idade * 14;
  const L = 30 * ease.back(vivo);
  const quica = Math.abs(Math.sin(ph)) * 12 * corre;
  const incl = 13 * corre;
  let s = chao(w * 0.8, 0, 0);
  // pernas (coxa + canela num traço, pezinho)
  let pernas = '';
  for (const [dx, fase] of [[-w * 0.2, 0], [w * 0.2, Math.PI]]) {
    const a = (Math.sin(ph + fase) * 42 * corre * Math.PI) / 180;
    const lift = Math.max(0, -Math.cos(ph + fase)) * 14 * corre; // levanta o pé na passada de volta
    const fx = dx + Math.sin(a) * L, fy = -quica + Math.max(0, L * (1 - Math.cos(a)) * 0.3) - lift;
    pernas += Ln(dx, -L - quica, fx, fy - 4, 7) + E(fx + 4, fy - 4, 14, 8, INK, 0);
  }
  if (vivo > 0.01) s += pernas;
  // corpo + bracinhos + cara
  let c = corpo();
  for (const lado of [-1, 1]) {
    const sw = corre ? Math.sin(ph + (lado > 0 ? 0 : Math.PI)) * 50 * corre : Math.sin(idade * 2.5 + lado) * 5;
    const ang = ((lado > 0 ? 150 : 30) - sw * lado + (1 - corre) * (lado > 0 ? -45 : 45)) * (Math.PI / 180);
    const ax = lado * (w / 2 - 2), ay = -h * 0.42, hx = ax + Math.cos(ang) * 30, hy = ay + Math.sin(ang) * 30;
    c += op(vivo, Ln(ax, ay, hx, hy, 7) + Ci(hx, hy, 7, INK, 0));
  }
  // olhos
  const pisc = (idade + seed) % 3.1 > 2.96 ? 0.12 : 1;
  const ro = cara === 'susto' ? 17 : 14, rp = cara === 'susto' ? 4.5 : 6.5, olhar = 2 + 3 * corre;
  for (const dx of [-26, 26]) {
    if (cara === 'feliz') c += P(`M${dx - 13} ${oy + 4} Q${dx} ${oy - 14} ${dx + 13} ${oy + 4}`, 'none', 5);
    else c += g(`translate(${dx} ${oy}) scale(1 ${F(Math.max(0.05, vivo * pisc))})`, Ci(0, 0, ro, '#fff', 3) + Ci(olhar, 1, rp, INK, 0) + Ci(olhar + 2, -2, 1.8, '#fff', 0));
    if (cara === 'susto') c += P(`M${dx - 14} ${oy - 26} Q${dx} ${oy - 36} ${dx + 14} ${oy - 28}`, 'none', 4);
  }
  // boca
  if (cara === 'susto') c += E(0, by + 2, 11, 15, INK, 0) + E(0, by + 9, 6, 6, K.vermelho, 0);
  else if (cara === 'feliz') c += P(`M-16 ${by - 4} Q0 ${by + 18} 16 ${by - 4} Z`, INK, 3) + E(0, by + 6, 7, 4, K.vermelho, 0);
  else c += P(`M-11 ${by} Q0 ${by + 9 * vivo} 11 ${by}`, 'none', 4);
  s += g(`translate(0 ${F(-L - quica)}) rotate(${F(incl)})`, c);
  // linhas de velocidade atrás
  if (corre > 0.05) {
    const Rr = rng(seed + quadro(idade) * 7);
    let v = '';
    for (let i = 0; i < 4; i++) {
      const yy = -h * (0.25 + 0.6 * (i / 3)) - quica, len = 40 + Rr() * 50, x0 = -w / 2 - 14 - Rr() * 10;
      v += Ln(x0, yy, x0 - len * corre, yy + 3, 4, o.corVel ?? '#dfe4f5', `opacity="${F(0.7 * corre)}"`);
    }
    s += v;
  }
  return (o.dir ?? 1) < 0 ? g('scale(-1 1)', s) : s;
}

// Página de calendário viva. o: vivo (0–1: olhos abrem, perninhas aparecem), corre (0–1), cara ('normal'|'susto'),
// dir (-1 = olha para a esquerda), escala. ~200x250
export function calendario(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const w = 170, h = 190;
  const corpo = () => {
    let c = caixa(-w / 2, -h, w, h, 10, K.papel, { base: 10 });
    c += R(-w / 2, -h, w, 46, 10, K.vermelho, 0) + R(-w / 2, -h + 24, w, 22, 0, K.vermelho, 0) + Ln(-w / 2, -h + 46, w / 2, -h + 46, 3);
    c += T('GO-LIVE', 0, -h + 32, 24, '#fff', { weight: 900, ls: 1 });
    // argolas
    for (const ax of [-48, 48]) c += Ci(ax, -h + 12, 5, tom(K.vermelho, 0.5), 0) + P(`M${ax - 9} ${-h + 10} C${ax - 9} ${-h - 20} ${ax + 9} ${-h - 20} ${ax + 9} ${-h + 10}`, 'none', 6) + P(`M${ax - 9} ${-h + 10} C${ax - 9} ${-h - 20} ${ax + 9} ${-h - 20} ${ax + 9} ${-h + 10}`, 'none', 2.5, '', '#b9c2d3');
    // grade de dias (7 x 4), um dia marcado com X
    for (let r = 0; r < 4; r++) for (let col = 0; col < 7; col++) {
      const gx = -77 + col * 22, gy = -h + 60 + r * 26;
      c += R(gx, gy, 18, 20, 3, r === 0 && col === 5 ? '#fde9a6' : K.creme2, 1.5, '', 'rgba(58,42,34,.35)');
      if (r === 0 && col === 5) c += Ln(gx + 4, gy + 4, gx + 14, gy + 16, 3.5, K.vermelho) + Ln(gx + 14, gy + 4, gx + 4, gy + 16, 3.5, K.vermelho);
    }
    c += R(-w / 2, -h, w, h, 10, 'none', 3);
    return c;
  };
  const s = folhaViva(idade, o, w, h, corpo, -h + 112, -h + 160, 3);
  return pop(idade, 0, x, y, raiz(x, y, o, s), 0, 0.4);
}

// Monitor numa mesinha. o: erro (0–1: tela vermelha piscando "ERRO"), tremor (0–1), fumaca (0–1), escala. ~380x330
export function monitorFumaca(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const er = clamp(o.erro ?? 0), tre = clamp(o.tremor ?? 0), fu = clamp(o.fumaca ?? 0);
  const Rr = rng(quadro(idade) * 17 + 3);
  const jx = (Rr() - 0.5) * 10 * tre, jy = (Rr() - 0.5) * 6 * tre, jr = (Rr() - 0.5) * 3 * tre;
  let s = chao(380);
  // mesa
  s += Ln(-150, -58, -158, 0, 8) + Ln(-150, -58, -158, 0, 4, '#a3a9b7') + Ln(150, -58, 158, 0, 8) + Ln(150, -58, 158, 0, 4, '#a3a9b7');
  s += caixa(-190, -74, 380, 18, 7, K.madeira, { base: 6 });
  // monitor
  let m = E(0, -78, 56, 9, '#8d93a3', 3) + R(-11, -124, 22, 48, 4, '#8d93a3', 3);
  m += caixa(-160, -318, 320, 200, 14, K.grafite, { base: 0, lado: 0 });
  m += R(-146, -304, 292, 170, 8, '#c9ecf6', 2.5);
  // janela de sistema
  m += R(-130, -290, 260, 30, 6, '#3b4a6b', 0) + R(-130, -272, 260, 12, 0, '#3b4a6b', 0) + R(-130, -290, 260, 142, 6, 'none', 2.5);
  [K.vermelho, K.amarelo, K.verde].forEach((c, i) => { m += Ci(-116 + i * 16, -275, 5, c, 1.5); });
  for (let i = 0; i < 4; i++) m += R(-118, -250 + i * 24, 120 - (i % 2) * 40, 10, 5, '#9fc3d6', 0) + R(20, -250 + i * 24, 90 - (i % 3) * 20, 10, 5, '#b9d8e6', 0);
  for (let i = 0; i < 3; i++) m += R(-118 + i * 54, -250 + 4 * 24 + 2, 40, 30 + Math.sin(idade * 2 + i) * 6, 4, [K.azul, K.verde, K.amarelo][i], 0);
  if (er > 0) {
    const pisca = Math.sin(idade * 10) > -0.2 ? 1 : 0.45;
    m += op(er * pisca, R(-146, -304, 292, 170, 8, K.vermelho, 0));
    m += op(er, g(tr(0, -226), g(tr(-68, -6), icone('alerta', 70, '#fff', K.vermelho)) + T('ERRO', 22, 14, 52, '#fff', { weight: 900, ls: 2 })));
    m += op(er * (1 - pisca) * 0.4, R(-146, -304, 292, 170, 8, '#fff', 0));
  }
  m += R(-146, -304, 292, 170, 8, 'none', 2.5);
  m += Ci(0, -128, 4, '#5a6478', 0);
  s += g(`translate(${F(jx)} ${F(jy)}) rotate(${F(jr)} 0 -120)`, m);
  if (fu > 0.01) {
    let f = fumaca(-40, -322, idade, { n: 5, r: 19 * fu, alt: 170 * (0.5 + 0.5 * fu), vento: 44, per: 2.4, cresce: 2, cor: K.fumo });
    f += fumaca(50, -320, idade + 0.7, { n: 4, r: 15 * fu, alt: 140 * (0.5 + 0.5 * fu), vento: 26, per: 2.1, cresce: 1.8, cor: K.fumo2 });
    const Rf = rng(quadro(idade) * 5 + 9);
    for (let i = 0; i < 5; i++) {
      const u = (idade * 1.7 + i / 5) % 1, px = -60 + i * 30 + (Rf() - 0.5) * 20, py = -322 - u * 60;
      f += estrela(px, py, 5 * (1 - u) + 2, i % 2 ? K.amarelo : K.laranja, 0);
    }
    s += op(fu, f);
  }
  return pop(idade, 0, x, y, raiz(x, y, o, s), 0, 0.4);
}

// Mão do Antonialli ajeitando o cabelo (~1,2 s). (x, y) = topo da cabeça. o: lado (1 = mão direita), escala (~0.5–1)
export function maoCabelo(x, y, idade, o = {}) {
  if (idade < 0 || idade > 1.7) return '';
  const k = o.escala ?? 1, lado = o.lado ? -1 : 1;
  // sobe (0–.25), passa (.25–.55 e .55–.85), desce (.85–1.15)
  const sub = ease.out(inv(0, 0.25, idade)), desc = ease.in(inv(0.85, 1.15, idade));
  const px = kf(idade, [[0.25, -60], [0.55, 60, ease.inOut], [0.85, -60, ease.inOut]]);
  const dir = idade < 0.55 ? 1 : -1;
  const py = 240 * (1 - sub) + 240 * desc + (idade > 0.25 && idade < 0.85 ? 6 * Math.sin(inv(0.25, 0.85, idade) * TAU * 2) : 0) + 10;
  const ang = kf(idade, [[0, -14], [0.25, -10], [0.3, 12 * dir], [0.55, 12 * dir], [0.6, -12], [0.85, -12], [0.95, -6]]);
  let s = '';
  if (idade < 1.15) {
    const dedos = [[-30, 30], [-13, 36], [4, 34], [21, 26]];
    const pecas = [
      [sw => R(-19, -6, 38, 34, 8, K.pele, sw)],
      [sw => R(-25, 24, 50, 20, 6, K.navy, sw)],
      [sw => rot(-42, -30, -44, R(-38, -58, 14, 36, 7, K.pele, sw))],
      [sw => R(-33, -64, 66, 64, 20, K.pele, sw)],
      ...dedos.map(([dx, len]) => [sw => R(dx, -58 - len, 15, len + 12, 7, K.pele, sw)]),
    ];
    let m = silhueta(pecas);
    m += R(-25, 24, 50, 20, 6, K.navy, 0) + R(-25, 24, 50, 7, 3, '#fff', 0, 'opacity=".5"');
    for (const bx of [-14.5, 2.5, 19.5]) m += Ln(bx, -52, bx, -74, 2.5, 'rgba(58,42,34,.55)');
    m += P('M-20 -44 Q-10 -50 0 -44', 'none', 2, '', 'rgba(58,42,34,.35)');
    s += g(tr(px * lado, py, lado, ang * lado, 1, 1), m);
  }
  s += g(tr(0, 0, Math.max(0.7, k) / k), brilhoCabelo(lado * 44, -24, idade - 0.95));
  return g(tr(x, y, k), s);
}

// =====================================================================
// GAG 2 — OPERAÇÃO NF (fundo escuro)
// =====================================================================

// Envelope pardo "MISSÃO ULTRASSECRETA". (x, y) = centro. o: destroi (idade em que pega fogo), escala. ~440x300
export function envelope(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const w = 440, h = 300, X = -w / 2, Y = -h / 2;
  const d = o.destroi == null ? -1 : idade - o.destroi;
  if (d > 2.3) return '';
  const u = inv(0, 0.55, idade);
  const dx = 1100 * (1 - ease.back(u)), ang = -7 * (1 - ease.out(u));
  let s = '';
  const enc = 1 - ease.in(inv(0.45, 0.95, d)); // encolhe ao queimar
  if (enc > 0.001) {
    let e = R(X + 6, Y + 14, w, h, 12, 'rgba(0,0,0,.3)', 0);
    e += caixa(X, Y, w, h, 12, K.pardo, { base: 16 });
    e += P(`M${X} ${Y} L0 ${Y + h * 0.52} L${-X} ${Y} Z`, tom(K.pardo, 0.12), 3);
    e += T('MISSÃO ULTRASSECRETA', 0, Y + h * 0.7, 27, INK, { family: 'DM Sans', weight: 800, ls: 3 });
    e += Ln(-150, Y + h * 0.77, 150, Y + h * 0.77, 2.5, 'rgba(58,42,34,.45)');
    // lacre
    e += Ci(0, Y + h * 0.5, 25, K.vermelho, 3) + Ci(0, Y + h * 0.5, 16, 'none', 2.5, '', tom(K.vermelho, 0.35)) + estrela(0, Y + h * 0.5, 9, '#fff', 0);
    e += carimbo('ULTRASSECRETO', 96, Y + h * 0.88, idade - 0.6, { cor: 'vermelho', tam: 30, rot: -12, icone: null, fundo: 'rgba(255,255,255,.0)' });
    // queima: escurece
    if (d > 0) e += op(Math.min(0.75, d * 0.9), R(X, Y, w, h, 12, '#1a0e08', 0));
    s += g(`translate(0 ${F(Y + h)}) scale(${F(enc)}) translate(0 ${F(-Y - h)})`, e);
  }
  // linha datilografada
  const td = o.destroi == null ? -1 : idade - (o.destroi - 1.4);
  if (td > 0 && d < 0.5) {
    const msg = 'esta mensagem se autodestruirá em 5 segundos', n = Math.min(msg.length, Math.floor(td * 34));
    const cur = Math.floor(td * 6) % 2 ? '▌' : ' ';
    s += T(msg.slice(0, n) + cur, X + 10, Y + h + 44, 20, o.corTexto ?? '#f3ecdc', { family: 'DM Sans', weight: 700, anchor: 'start', ls: 1 });
  }
  if (d > 0) {
    const cresce = ease.out(inv(0, 0.5, d)) * (1 - ease.in(inv(0.9, 1.3, d)));
    if (cresce > 0.01) s += g(`translate(0 ${F(Y + h)}) scale(${F(cresce)}) translate(0 ${F(-Y - h)})`, chamas(0, Y + h - 4, idade, { n: 7, alt: 150, larg: w - 60, seed: 5 }));
    const ds = d - 0.5;
    if (ds > 0) {
      const sobe = ease.out(inv(0, 1.8, ds)), al = (1 - inv(1.1, 1.8, ds)) * inv(0, 0.2, ds);
      s += op(al, nuvem(0, Y + h * 0.5 - 110 * sobe, (50 + 70 * sobe), K.fumo) + nuvem(-120, Y + h * 0.6 - 60 * sobe, (30 + 40 * sobe), K.fumo2) + nuvem(130, Y + h * 0.65 - 90 * sobe, (26 + 46 * sobe), K.fumo2));
    }
  }
  return g(tr(x + dx, y, o.escala ?? 1, ang), s);
}

// Feixes de laser cruzando a área. o: area [x0,y0,x1,y1], n (6–8), alarme (0–1: sólidos e piscando), seed
export function lasers(idade, o = {}) {
  if (idade < 0) return '';
  const [x0, y0, x1, y1] = o.area ?? [0, 0, 1920, 1080], n = o.n ?? 7, al = clamp(o.alarme ?? 0);
  const Rr = rng(o.seed ?? 3), ent = inv(0, 0.5, idade);
  const pisca = Math.sin(idade * 24) > 0 ? 1 : 0.2;
  let s = '';
  for (let i = 0; i < n; i++) {
    const vert = Rr() < 0.3, a = 0.08 + Rr() * 0.84, b = 0.08 + Rr() * 0.84, f = 0.35 + Rr() * 0.5, ph = Rr() * TAU;
    const sw = Math.sin(idade * f + ph) * 0.1;
    let ax, ay, bx, by;
    if (vert) { ax = lerp(x0, x1, a + sw); ay = y0; bx = lerp(x0, x1, b - sw); by = y1; }
    else { ax = x0; ay = lerp(y0, y1, a + sw); bx = x1; by = lerp(y0, y1, b - sw); }
    const opa = ent * lerp(0.72 + 0.1 * Math.sin(idade * 9 + ph), pisca, al) * inv(0, 0.1, idade - i * 0.06);
    if (opa <= 0.01) continue;
    s += Ln(ax, ay, bx, by, lerp(9, 16, al), K.laser, `opacity="${F(opa * 0.55)}" filter="url(#ggGlow)"`);
    s += Ln(ax, ay, bx, by, lerp(3, 4.5, al), K.laser, `opacity="${F(opa)}"`) + Ln(ax, ay, bx, by, 1.2, '#fff', `opacity="${F(opa * 0.9)}"`);
    s += Ci(ax, ay, 5, '#fff', 0, `opacity="${F(opa)}"`) + Ci(bx, by, 5, '#fff', 0, `opacity="${F(opa)}"`);
  }
  return s;
}

// Cabo de rapel do topo (y0) até y1, com mosquetão. o: desce (0–1, comprimento), balanco (0–1), escala
export function cabo(x, y0, y1, idade, o = {}) {
  if (idade < 0) return '';
  const desce = clamp(o.desce ?? 1), bal = clamp(o.balanco ?? 0);
  const L = (y1 - y0) * desce;
  if (L < 1) return '';
  const ang = Math.sin(idade * 2.1) * 4 * bal + Math.sin(idade * 5.3) * 1 * bal;
  let s = Ln(0, 0, 0, L, 9) + Ln(0, 0, 0, L, 5, '#d9b35c') + Ln(0, 0, 0, L, 5, tom('#d9b35c', 0.35), 'stroke-dasharray="7 9"');
  // mosquetão
  let m = E(0, 4, 9, 6, '#d9b35c', 3);
  m += R(-12, 8, 24, 46, 11, 'none', 8) + R(-12, 8, 24, 46, 11, 'none', 3.5, '', '#c7ccd6');
  m += Ln(12, 20, 12, 40, 3.5, K.laranja);
  s += g(tr(0, L), m);
  return g(`translate(${F(x)} ${F(y0)}) rotate(${F(ang)}) scale(${F(o.escala ?? 1)})`, s);
}

// Gota de suor que se forma em (x, y0), cai até y1 e espirra com "PLIM!". '' depois de ~2 s. o: escala
export function gotaCaindo(x, y0, y1, idade, o = {}) {
  if (idade < 0 || idade > 2.05) return '';
  const k = o.escala ?? 1;
  const d = 'M0 -30 C6 -18 18 -4 18 9 A18 18 0 0 1 -18 9 C-18 -4 -6 -18 0 -30 Z';
  const gota = `<path d="${d}" fill="${K.agua}"${st(3)}/><ellipse cx="-7" cy="6" rx="4" ry="7" fill="#fff" opacity=".85" transform="rotate(20 -7 6)"/>`;
  let s = '';
  if (idade < 1.05) {
    const cresce = ease.back(inv(0, 0.6, idade)), cai = ease.in(inv(0.6, 1.05, idade));
    const estica = 1 + 0.4 * cai + 0.06 * Math.sin(idade * 30) * (1 - cai) * inv(0.3, 0.6, idade);
    s += g(tr(x, lerp(y0, y1, cai), cresce * k, 0, 1 / estica, estica), gota);
  } else {
    const dd = idade - 1.05;
    for (let j = 0; j < 2; j++) {
      const uj = inv(j * 0.14, 0.6 + j * 0.14, dd);
      if (uj > 0 && uj < 1) s += E(x, y1, (12 + 70 * ease.out(uj)) * k, (12 + 70 * ease.out(uj)) * 0.32 * k, 'none', 3.5 * (1 - uj) + 1, `opacity="${F(1 - uj)}"`, K.agua);
    }
    const ud = inv(0, 0.55, dd);
    if (ud < 1) for (let i = 0; i < 6; i++) {
      const an = -Math.PI * (0.12 + 0.76 * (i / 5)), r0 = (16 + 70 * ease.out(ud)) * k;
      s += Ci(x + Math.cos(an) * r0, y1 + Math.sin(an) * r0 * 0.9 + 110 * ud * ud * k, (5.5 - i % 2) * (1 - ud) * k, K.agua, 2);
    }
    const sp = kf(dd, [[0, 0], [0.1, 1.25, ease.out], [0.2, 1], [0.7, 1], [0.95, 0, ease.in]]);
    if (sp > 0.01) s += g(tr(x + 48 * k, y1 - 48 * k, sp * k, -8), Tc('PLIM!', 0, 14, 42, COR.ambar, 6));
  }
  return s;
}

// Alarme em tela cheia: vinheta vermelha pulsante, varreduras de sirene e adesivo "ALERTA!" tremendo. o: dur (2,5 s), y (do adesivo)
export function alarme(idade, o = {}) {
  if (idade < 0) return '';
  const dur = o.dur ?? 2.5;
  if (idade > dur + 0.4) return '';
  const fim = 1 - inv(dur, dur + 0.35, idade), ent = inv(0, 0.12, idade), k = ent * fim;
  const pulso = 0.4 + 0.6 * Math.pow(Math.max(0, Math.sin(idade * TAU * 1.5)), 2);
  let s = `<rect width="1920" height="1080" fill="url(#ggVinhetaAlarme)" opacity="${F(pulso * k)}"/>`;
  s += `<rect width="1920" height="1080" fill="#ff2a2a" opacity="${F(0.12 * pulso * k)}"/>`;
  for (const [ph, cor] of [[0, '#fff'], [Math.PI, '#ffb0b0']]) {
    const a = 50 * Math.sin(idade * 4.2 + ph);
    s += g(`rotate(${F(a)} 960 -120)`, `<polygon points="960,-120 700,1700 1220,1700" fill="url(#ggFeixe)" opacity="${F(0.35 * k)}"/>`);
  }
  s += adesivo('ALERTA!', 960, o.y ?? 230, idade, { cor: COR.vermelho, tam: 120, tremida: 3.5, rot: -3, fim: dur });
  return s;
}

// Cofre: pedestal com redoma de vidro guardando a "NF" iluminada, placa "NOTAS FISCAIS", chão com ladrilhos sensores. ~420x440
export function cofre(x, y, idade, o = {}) {
  if (idade < 0) return '';
  let s = '';
  // ladrilhos sensores
  s += R(-212, -30, 424, 46, 8, K.grafite2, 3);
  for (let i = 0; i < 8; i++) for (let r = 0; r < 2; r++) {
    const on = Math.sin(idade * 2.6 + i * 1.9 + r * 2.3) > 0.72;
    s += R(-204 + i * 52, -24 + r * 18, 46, 13, 3, on ? K.azul : '#4a5470', 1.5, on ? 'filter="url(#ggGlow4)"' : '', 'rgba(0,0,0,.35)');
  }
  s += chao(260, 0, -30);
  // pedestal e placa
  s += caixa(-85, -214, 170, 190, 8, K.aco, { lado: 22 });
  s += R(-72, -138, 144, 38, 8, K.navy, 3) + T('NOTAS FISCAIS', 0, -112, 17, '#fff', { weight: 900, ls: 1 });
  s += Ci(0, -170, 9, K.amarelo, 3) + Ci(0, -170, 3, INK, 0);
  s += caixa(-104, -230, 208, 18, 6, K.cinza, { base: 6 });
  // luz e documento
  s += `<polygon points="-10,-396 10,-396 70,-238 -70,-238" fill="#ffe7a0" opacity=".16"/>`;
  s += Ci(0, -306, 72, 'url(#ggLuz)', 0);
  const bob = Math.sin(idade * 1.8) * 5;
  let doc = R(4, -50 + 5, 84, 104, 6, 'rgba(0,0,0,.25)', 0) + caixa(-42, -52, 84, 104, 6, K.papel, { base: 8 });
  doc += R(-42, -52, 84, 20, 6, K.navy, 0) + R(-42, -42, 84, 10, 0, K.navy, 0) + Ln(-42, -32, 42, -32, 3);
  doc += T('NF', 0, 8, 34, K.navy, { weight: 900 });
  for (let i = 0; i < 3; i++) doc += R(-30, 20 + i * 9, 60 - i * 14, 4, 2, K.cinza, 0);
  doc += R(-42, -52, 84, 104, 6, 'none', 3);
  s += g(tr(0, -306 + bob, 1, Math.sin(idade * 1.3) * 3), doc);
  for (let i = 0; i < 3; i++) {
    const u = (idade * 0.8 + i / 3) % 1, sc = Math.sin(u * Math.PI);
    s += g(tr(-55 + i * 55, -360 + i * 14 - u * 30, sc, u * 90), estrela(0, 0, 12, i === 1 ? '#fff' : K.amarelo, 0));
  }
  // redoma
  s += P('M-96 -230 L-96 -300 A96 96 0 0 1 96 -300 L96 -230 Z', 'rgba(191,227,242,.28)', 3);
  s += P('M-74 -300 A78 78 0 0 1 -26 -376', 'none', 5, 'opacity=".85"', '#fff') + P('M-96 -270 L-96 -240', 'none', 4, 'opacity=".5"', '#fff');
  s += E(0, -230, 104, 12, 'rgba(255,255,255,.25)', 0);
  return pop(idade, 0, x, y, raiz(x, y, o, s), 0, 0.45);
}

// Nota fiscal gigante viva. o: corre (0–1), cara ('normal'|'susto'|'feliz'), carimbo (0–1: "ANTECIPADA ✓" bate), vivo, dir, escala. ~260x340
export function nfGigante(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const w = 220, h = 270;
  const corpo = () => {
    let c = caixa(-w / 2, -h, w, h, 8, K.papel, { base: 12 });
    c += R(-w / 2, -h, w, 44, 8, K.navy, 0) + R(-w / 2, -h + 22, w, 22, 0, K.navy, 0) + Ln(-w / 2, -h + 44, w / 2, -h + 44, 3);
    c += T('NOTA FISCAL', 0, -h + 30, 22, '#fff', { weight: 900, ls: 2 });
    c += R(-92, -h + 58, 110, 8, 4, K.cinza, 0) + R(-92, -h + 74, 80, 8, 4, K.cinza, 0) + R(-92, -h + 90, 96, 8, 4, K.cinza2, 0);
    c += Ci(72, -h + 80, 24, 'none', 3.5, '', K.vermelho) + Ci(72, -h + 80, 17, 'none', 2, '', K.vermelho) + T('R$', 72, -h + 87, 18, K.vermelho, { weight: 900 });
    c += R(-92, -74, 184, 7, 3.5, K.cinza, 0) + R(-92, -60, 120, 7, 3.5, K.cinza, 0);
    const Rb = rng(21);
    for (let bx = -74; bx < 74; bx += 0) { const bw = 2 + Math.floor(Rb() * 3) * 2; c += R(bx, -46, bw, 28, 0, INK, 0); bx += bw + 3; }
    c += R(-w / 2, -h, w, h, 8, 'none', 3);
    return c;
  };
  let s = folhaViva(idade, o, w, h, corpo, -h + 150, -h + 196, 7);
  const uc = clamp(o.carimbo ?? 0);
  if (uc > 0) s += carimbo('ANTECIPADA', 0, -h * 0.62 - 30, uc * 0.45, { cor: 'verde', tam: 30, rot: -10 });
  return pop(idade, 0, x, y, raiz(x, y, o, s), 0, 0.4);
}

// Obstáculo da corrida: 'barreira' | 'muro' | 'abismo' | 'portal'. o: rotulo (placa), largura (abismo), rompe (portal, 0–1), escala
export function obstaculo(tipo, x, y, idade, o = {}) {
  if (idade < 0) return '';
  let s = '';
  if (tipo === 'barreira') {
    s += chao(230);
    for (const lx of [-70, 70]) s += Ln(lx - 30, 0, lx + 30, 0, 7) + Ln(lx, 0, lx, -118, 7) + Ln(lx, 0, lx, -118, 3, '#a3a9b7');
    s += caixa(-100, -134, 200, 24, 7, '#fff', { base: 6 });
    for (let i = 0; i < 4; i++) s += R(-88 + i * 50, -131, 22, 18, 3, K.vermelho, 0);
    s += R(-100, -134, 200, 24, 7, 'none', 3);
    if (o.rotulo) s += mv(0, -84, placa(o.rotulo, { tam: 20 }));
  } else if (tipo === 'muro') {
    s += chao(230);
    s += caixa(-100, -180, 200, 180, 5, K.tijolo, { lado: 16 });
    for (let r = 0, yy = -162; yy < -2; r++, yy += 18) {
      s += Ln(-98, yy, 82, yy, 2, 'rgba(58,42,34,.4)');
      for (let xx = -100 + (r % 2 ? 18 : 36); xx < 82; xx += 36) s += Ln(xx, yy + 2, xx, yy + 16, 2, 'rgba(58,42,34,.4)');
    }
    s += caixa(-108, -192, 216, 16, 4, K.cinza, { base: 5 });
    if (o.rotulo) s += mv(0, -100, placa(o.rotulo, { tam: 20 }));
  } else if (tipo === 'abismo') {
    const L = o.largura ?? 220, borda = o.cor ?? (o.noite ? '#dfe4f5' : INK);
    const buraco = `M${F(-L / 2)} 0 L${F(-L / 2 + 10)} 24 L${F(-L / 2 + 4)} 50 L${F(-L / 2 + 20)} 74 L${F(L / 2 - 20)} 74 L${F(L / 2 - 6)} 48 L${F(L / 2 - 12)} 22 L${F(L / 2)} 0 Z`;
    s += P(buraco, '#120c16', 3, '', borda);
    s += P(`M${F(-L / 2 + 14)} 30 L${F(L / 2 - 14)} 30 L${F(L / 2 - 20)} 60 L${F(-L / 2 + 20)} 60 Z`, '#000', 0, 'opacity=".5"');
    s += P(`M${F(-L / 2)} 0 Q${F(-L / 2 + 30)} 14 ${F(-L / 2 + 60)} 10 M${F(L / 2)} 0 Q${F(L / 2 - 30)} 14 ${F(L / 2 - 60)} 10`, 'none', 3, 'opacity=".55"', borda);
    for (let i = 0; i < 4; i++) s += Ln(-L / 2 + 30 + i * (L - 60) / 3, 8, -L / 2 + 30 + i * (L - 60) / 3 + (i % 2 ? 6 : -6), 26 + i * 4, 2.5, borda, 'opacity=".3"');
    let av = Ln(0, 0, 0, -96, 8) + Ln(0, 0, 0, -96, 4, '#a3a9b7');
    av += P('M-34 -100 L0 -158 L34 -100 Z', K.amarelo, 3) + Ln(0, -138, 0, -118, 5) + Ci(0, -108, 3, INK, 0);
    if (o.rotulo) av += mv(0, -176, placa(o.rotulo, { tam: 18 }));
    s += mv(-L / 2 - 36, 0, av);
  } else if (tipo === 'portal') {
    const rompe = clamp(o.rompe ?? 0);
    s += chao(330);
    for (const px of [-120, 120]) s += caixa(px - 13, -270, 26, 270, 6, K.navy, { lado: 7 }) + R(px - 20, -16, 40, 16, 4, K.navy2, 3);
    s += caixa(-156, -318, 312, 64, 10, K.navy, { base: 10 }) + T(o.rotulo ?? 'FY26', 0, -273, 38, '#fff', { weight: 900, ls: 3 });
    // bandeira quadriculada
    const ond = Math.sin(idade * 6) * 6;
    let bd = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) bd += `<rect x="${F(c * 14)}" y="${F(r * 13 + Math.sin(idade * 6 + c * 0.8) * 3)}" width="14" height="13" fill="${(r + c) % 2 ? INK : '#fff'}"/>`;
    s += Ln(-110, -318, -110, -400, 5) + g(`translate(-108 -398) skewY(${F(ond)})`, bd + R(0, 0, 70, 39, 0, 'none', 3));
    // fita de chegada
    const ya = -120;
    if (rompe <= 0) s += Ln(-120, ya, 120, ya, 10) + Ln(-120, ya, 120, ya, 6, K.amarelo) + Ln(-120, ya, 120, ya, 6, INK, 'stroke-dasharray="14 18"');
    else {
      const r = ease.out(rompe), fl = Math.sin(idade * 9) * 8 * r;
      for (const lado of [-1, 1]) {
        const d = `M${F(lado * 120)} ${ya} Q${F(lado * (120 - 50 * r))} ${F(ya + 20 * r + fl)} ${F(lado * (120 - 60 * r))} ${F(ya + 110 * r - fl)}`;
        s += P(d, 'none', 10) + P(d, 'none', 6, '', K.amarelo);
      }
    }
  }
  return pop(idade, 0, x, y, raiz(x, y, o, s), 0, 0.4);
}

// Linha de chão da corrida com tracinhos. o: lacunas [[xa, xb], ...], cor, noite (cor clara), k
export function pista(x0, x1, y, idade, o = {}) {
  if (idade < 0) return '';
  const cor = o.cor ?? (o.noite ? '#dfe4f5' : INK), k = o.k ?? 6;
  const lac = [...(o.lacunas ?? [])].sort((a, b) => a[0] - b[0]);
  const segs = [];
  let a = x0;
  for (const [la, lb] of lac) { if (la > a) segs.push([a, la]); a = Math.max(a, lb); }
  if (a < x1) segs.push([a, x1]);
  const xe = lerp(x0, x1, ease.out(inv(0, 0.8, idade)));
  let s = '';
  for (const [sa, sb] of segs) {
    const b = Math.min(sb, xe);
    if (b <= sa) continue;
    s += Ln(sa, y, b, y, k, cor);
    for (let xx = Math.ceil(sa / 60) * 60; xx < b; xx += 60) s += Ln(xx, y + 6, xx, y + 16, k * 0.6, cor);
    for (let xx = Math.ceil((sa - 30) / 120) * 120 + 30; xx < b; xx += 120) s += Ln(xx - 8, y - 12, xx + 8, y - 12, k * 0.5, cor, 'opacity=".5"');
  }
  return s;
}

// =====================================================================
// CARTELAS NOVAS
// =====================================================================
// ícones extras para o cartão de portfólio (centrados em 0,0, caixa ~s)
function iconeX(nome, s, cor = '#fff', fundo = INK) {
  const k = v => F(v * s), sw = F(s * 0.11);
  const stn = `fill="none" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  switch (nome) {
    case 'cifrao': return text('$', 0, s * 0.3, { size: s * 0.86, weight: 900, fill: cor });
    case 'pessoas': return g(tr(-s * 0.24, s * 0.06, 0.8), icone('pessoa', s, cor)) + g(tr(s * 0.24, s * 0.06, 0.8), icone('pessoa', s, cor))
      + g(tr(0, -s * 0.04), `<circle cy="${k(-0.13)}" r="${k(0.19)}" fill="${fundo}"/><path d="M${k(-0.33)} ${k(0.36)} Q${k(-0.33)} ${k(0.04)} 0 ${k(0.04)} Q${k(0.33)} ${k(0.04)} ${k(0.33)} ${k(0.36)} Z" fill="${fundo}"/>`)
      + g(tr(0, -s * 0.04), icone('pessoa', s * 1.05, cor));
    case 'calendario': return `<rect x="${k(-0.3)}" y="${k(-0.26)}" width="${k(0.6)}" height="${k(0.54)}" rx="${k(0.06)}" ${stn}/><path d="M${k(-0.3)} ${k(-0.08)} H${k(0.3)} M${k(-0.14)} ${k(-0.36)} V${k(-0.18)} M${k(0.14)} ${k(-0.36)} V${k(-0.18)}" ${stn}/>`
      + [[-0.15, 0.06], [0, 0.06], [0.15, 0.06], [-0.15, 0.18], [0, 0.18]].map(([a, b]) => `<circle cx="${k(a)}" cy="${k(b)}" r="${k(0.035)}" fill="${cor}"/>`).join('');
    case 'fogo': return `<path d="M0 ${k(-0.34)} C${k(0.1)} ${k(-0.2)} ${k(0.3)} ${k(-0.12)} ${k(0.28)} ${k(0.1)} A${k(0.28)} ${k(0.28)} 0 0 1 ${k(-0.28)} ${k(0.1)} C${k(-0.3)} ${k(-0.08)} ${k(-0.14)} ${k(-0.1)} ${k(-0.1)} ${k(-0.2)} C${k(-0.04)} ${k(-0.12)} ${k(0.02)} ${k(-0.18)} 0 ${k(-0.34)} Z" fill="${cor}"/><path d="M0 ${k(-0.04)} C${k(0.1)} ${k(0.06)} ${k(0.14)} ${k(0.12)} ${k(0.12)} ${k(0.2)} A${k(0.12)} ${k(0.12)} 0 0 1 ${k(-0.12)} ${k(0.2)} C${k(-0.14)} ${k(0.1)} ${k(-0.06)} ${k(0.06)} 0 ${k(-0.04)} Z" fill="${fundo}"/>`;
    case 'ia': return g(tr(-s * 0.06, s * 0.04), estrela(0, 0, s * 0.33, cor)) + g(tr(s * 0.22, -s * 0.22), estrela(0, 0, s * 0.13, cor)) + g(tr(s * 0.2, s * 0.22), estrela(0, 0, s * 0.08, cor));
    case 'cockpit': return `<path d="M${k(-0.32)} ${k(0.14)} A${k(0.32)} ${k(0.32)} 0 0 1 ${k(0.32)} ${k(0.14)}" ${stn}/><path d="M${k(-0.26)} ${k(0.02)} L${k(-0.2)} ${k(0.05)} M${k(0.26)} ${k(0.02)} L${k(0.2)} ${k(0.05)} M0 ${k(-0.3)} V${k(-0.22)}" ${stn}/><path d="M0 ${k(0.16)} L${k(0.17)} ${k(-0.12)}" ${stn}/><circle cy="${k(0.16)}" r="${k(0.05)}" fill="${cor}"/>`;
    case 'teste': return `<path d="M${k(-0.12)} ${k(-0.32)} V${k(-0.06)} L${k(-0.3)} ${k(0.22)} Q${k(-0.34)} ${k(0.32)} ${k(-0.24)} ${k(0.32)} H${k(0.24)} Q${k(0.34)} ${k(0.32)} ${k(0.3)} ${k(0.22)} L${k(0.12)} ${k(-0.06)} V${k(-0.32)} Z M${k(-0.18)} ${k(-0.32)} H${k(0.18)}" ${stn}/><path d="M${k(-0.2)} ${k(0.12)} H${k(0.2)} L${k(0.26)} ${k(0.24)} H${k(-0.26)} Z" fill="${cor}"/>`;
    default: return icone(nome, s, cor, fundo);
  }
}

// quebra o texto em linhas de palavras {p, hi}; o *destaque* pode abranger várias palavras (como legenda() de ambiente.js)
function linhasDestaque(texto, font, maxW) {
  const pal = [];
  let hi = false;
  for (let p of String(texto).split(/\s+/).filter(Boolean)) {
    const ini = p.startsWith('*'); if (ini) { hi = true; p = p.slice(1); }
    const fim = p.endsWith('*'); if (fim) p = p.slice(0, -1);
    pal.push({ p, hi, w: measure(p, font) }); if (fim) hi = false;
  }
  const esp = measure(' ', font), linhas = [[]];
  let lw = 0;
  for (const w of pal) {
    const nl = lw ? lw + esp + w.w : w.w;
    if (nl > maxW && lw) { linhas.push([w]); lw = w.w; } else { linhas[linhas.length - 1].push(w); lw = nl; }
  }
  return linhas;
}
const linhaDestaque = (L, x, y, o) => `<text x="${F(x)}" y="${F(y)}" font-family="Outfit" font-weight="${o.weight ?? 700}" font-size="${o.size}" fill="${o.fill ?? INK}" text-anchor="middle">`
  + L.map((w, i) => `<tspan${w.hi ? ` fill="${o.hi}"` : ''}>${esc(w.p)}${i < L.length - 1 ? ' ' : ''}</tspan>`).join('') + '</text>';

// Cartela de abertura: cartão grande com ícone, número que conta e texto. item: {icone, numero, prefixo, sufixo, texto}.
// o: n, total (bolinhas), fim (sai para a esquerda), aba (padrão 'DESTAQUES'), x, y (centro), escala. ~1240x420
export function cartaoPortfolio(item, idade, o = {}) {
  if (idade < 0) return '';
  const w = 1240, h = 420, cx = o.x ?? 960, cy = o.y ?? 540;
  const u = inv(0, 0.55, idade), ent = 1 - ease.back(u);
  let dx = 1500 * ent;
  if (o.fim != null) { const v = ease.in(inv(o.fim, o.fim + 0.35, idade)); if (v >= 1) return ''; dx -= 1500 * v; }
  let b = R(-w / 2, -h / 2 + 12, w, h, 28, 'rgba(43,30,10,.2)', 0) + caixa(-w / 2, -h / 2, w, h, 28, K.creme, { base: 0, k: 3.5 });
  // aba
  const aba = (o.aba ?? 'DESTAQUES').toUpperCase(), aw = larg(aba, '800 20px Outfit') + 44;
  b += g(tr(-w / 2 + 30, -h / 2 - 16, 1, -3), R(0, 3, aw, 38, 9, 'rgba(43,30,10,.2)', 0) + R(0, 0, aw, 38, 9, INK, 0) + T(aba, aw / 2, 26, 20, '#fff', { ls: 2 }));
  // círculo do ícone
  const ix = -w / 2 + 190, ui = ease.back(inv(0.3, 0.65, idade));
  b += g(tr(ix, 0, ui), Ci(0, 0, 112, 'none', 3, 'stroke-dasharray="6 10"', COR.ambar) + Ci(0, 0, 96, K.navy, 3.5) + iconeX(item.icone ?? 'doc', 118, '#fff', K.navy));
  // número e texto
  const tx = ix + 150, tw = w / 2 - 60 - tx;
  const linhas = linhasDestaque(item.texto ?? '', '700 46px Outfit', tw);
  const temNum = item.numero != null;
  if (temNum) {
    const uc = ease.out(inv(0.4, 1.25, idade));
    const num = String(Math.round(item.numero * uc)), pre = item.prefixo ?? '', suf = item.sufixo ?? '';
    const tN = 150, tP = 76;
    const wP = larg(pre, `900 ${tP}px Outfit`), wN = larg(num, `900 ${tN}px Outfit`), wS = larg(suf, `800 ${tP}px Outfit`);
    const tot = wP + wN + wS, k = Math.min(1, tw / tot), x0 = tx + (tw - tot * k) / 2;
    const ny = linhas.length > 1 ? -44 : -14;
    const um = ease.out5(inv(0.5, 0.9, idade));
    let nn = R(-14, -tN * 0.42, (tot + 28) * um, tN * 0.46, 10, COR.ambar, 0);
    nn += text(pre, 0, 0, { size: tP, weight: 900, fill: INK, anchor: 'start' }) + text(num, wP, 0, { size: tN, weight: 900, fill: INK, anchor: 'start', ls: -3 })
      + text(suf, wP + wN, 0, { size: tP, weight: 800, fill: INK, anchor: 'start' });
    b += op(inv(0.35, 0.5, idade), g(tr(x0, ny, k), nn));
  }
  const ty0 = temNum ? (linhas.length > 1 ? 56 : 74) : -(linhas.length - 1) * 28 + 16;
  linhas.forEach((L, i) => { b += op(inv(0.45 + i * 0.1, 0.65 + i * 0.1, idade), linhaDestaque(L, tx + tw / 2, ty0 + i * 56, { size: 46, hi: COR.laranja })); });
  // bolinhas de progresso
  if (o.total) {
    const n = o.n ?? 1, gap = 26, x0 = -(o.total - 1) * gap / 2;
    for (let i = 0; i < o.total; i++) {
      const at = i === n - 1;
      b += Ci(x0 + i * gap, h / 2 - 34, at ? 8 : 5.5, i < n ? COR.ambar : K.creme, at ? 3 : 2);
    }
  }
  return g(tr(cx + dx, cy, o.escala ?? 1, -3 * ent), b);
}

// Tile creme com número que conta e rótulo em caixa alta. (x, y) = centro. o: prefixo, numero, sufixo, rotulo, cor, escala
export function tileNumero(x, y, w, h, idade, o = {}) {
  if (idade < 0) return '';
  const u = inv(0, 0.45, idade), cor = o.cor ?? INK;
  let b = R(-w / 2, -h / 2 + 8, w, h, 22, 'rgba(43,30,10,.2)', 0) + caixa(-w / 2, -h / 2, w, h, 22, K.creme, { base: 0 });
  const uc = ease.out(inv(0.15, 1.05, idade));
  const txt = (o.prefixo ?? '') + Math.round((o.numero ?? 0) * uc) + (o.sufixo ?? '');
  const rot = o.rotulo ? String(o.rotulo).toUpperCase() : '';
  let tam = o.tam ?? Math.min(h * 0.4, 120);
  const tw = larg(txt, `900 ${tam}px Outfit`);
  if (tw > w - 60) tam *= (w - 60) / tw;
  const ny = rot ? -h * 0.02 : h * 0.14;
  const um = ease.out5(inv(0.25, 0.65, idade)), mw = larg(txt, `900 ${tam}px Outfit`) + 30;
  b += g(tr(0, ny, 1, -1.5), R(-mw / 2, -tam * 0.4, mw * um, tam * 0.42, 8, COR.ambar, 0));
  b += text(txt, 0, ny, { size: tam, weight: 900, fill: cor, ls: -2 });
  if (rot) {
    const ts = Math.min(h * 0.12, 30), rw = larg(rot, `800 ${ts}px Outfit`) + ts * 0.14 * rot.length + ts * 1.6, rh = ts * 1.8;
    const ur = inv(0.4, 0.7, idade);
    b += g(tr(0, ny + tam * 0.3 + rh / 2 + 10, lerp(0.5, 1, ease.back(ur))), R(-rw / 2, -rh / 2 + 5, rw, rh, rh / 2, 'rgba(43,30,10,.2)', 0) + R(-rw / 2, -rh / 2, rw, rh, rh / 2, K.navy, 2.5)
      + text(rot, 0, ts * 0.36, { size: ts, weight: 800, fill: '#fff', ls: F(ts * 0.14) }));
  }
  const kb = idade - 1.1;
  if (kb > 0 && kb < 0.7) { const sp = kf(kb, [[0, 0], [0.15, 1.2], [0.3, 1], [0.7, 0]]); b += g(tr(w / 2 - 30, -h / 2 + 30, sp, kb * 90), estrela(0, 0, 22, COR.ambar, 2.5)); }
  return op(inv(0, 0.12, idade), g(tr(x, y + 26 * (1 - ease.out(u)), lerp(0.85, 1, ease.back(u)) * (o.escala ?? 1)), b));
}

// Barra que cresce até 12 meses e depois estende uma parte tracejada "POTENCIAL DE EXTENSÃO". (x, y) = ponta esquerda, meio vertical. o: h, escala
export function barraMeses(x, y, w, idade, o = {}) {
  if (idade < 0) return '';
  const h = o.h ?? 48, w12 = w * 0.68;
  const u = ease.out(inv(0.25, 1.55, idade)), ue = ease.out(inv(1.7, 2.5, idade));
  let s = R(0, -h / 2 + 7, w12, h, h / 2, 'rgba(43,30,10,.2)', 0) + R(0, -h / 2, w12, h, h / 2, K.creme, 0);
  const fw = Math.max(h, w12 * u);
  s += R(0, -h / 2, fw, h, h / 2, K.azul, 0) + R(0, -h / 2 + 6, fw, 8, 4, 'rgba(255,255,255,.4)', 0);
  for (let m = 1; m <= 12; m++) {
    const tx = (w12 * m) / 12;
    if (u * 12 >= m - 0.5) {
      if (m < 12) s += Ln(tx, -h / 2 + 8, tx, h / 2 - 8, 2.5, 'rgba(255,255,255,.65)');
      s += T(String(m), tx - w12 / 24, h / 2 + 24, 17, INK, { weight: 800 });
    }
  }
  s += R(0, -h / 2, w12, h, h / 2, 'none', 3);
  // extensão tracejada
  if (ue > 0.01) {
    const ex = w12 + 8, ew = (w - w12 - 8) * ue;
    s += R(ex, -h / 2 + 6, ew, h - 12, (h - 12) / 2, 'none', 3.5, 'stroke-dasharray="12 9"', COR.laranja);
    if (ue > 0.9) s += P(`M${F(ex + ew - 18)} ${F(-h / 2 + 2)} L${F(ex + ew + 6)} 0 L${F(ex + ew - 18)} ${F(h / 2 - 2)}`, 'none', 4, '', COR.laranja);
    s += op(inv(0.5, 1, ue), T('POTENCIAL DE EXTENSÃO', ex + (w - w12 - 8) / 2, -h / 2 - 16, 18, COR.laranja, { weight: 900, ls: 1.5 }));
  }
  // rótulo
  const rt = 'MÉDIA DE 12 MESES', rw = larg(rt, '800 20px Outfit') + 20 * 0.12 * rt.length + 36, rh = 40;
  const ur = inv(0, 0.35, idade);
  s += g(tr(rw / 2, -h / 2 - 40, lerp(0.5, 1, ease.back(ur))), R(-rw / 2, -rh / 2 + 5, rw, rh, rh / 2, 'rgba(43,30,10,.2)', 0) + R(-rw / 2, -rh / 2, rw, rh, rh / 2, K.navy, 2.5) + text(rt, 0, 7, { size: 20, weight: 800, fill: '#fff', ls: 2.4 }));
  return op(inv(0, 0.15, idade), raiz(x, y, o, s));
}

// Três portas que se abrem em sequência com luz saindo; logo A&M pequeno em cima e chip "CROSS-SELL". (x, y) = base. ~700x380
export function portas(x, y, idade, o = {}) {
  if (idade < 0) return '';
  let s = '';
  [-230, 0, 230].forEach((dx, i) => {
    const t0 = 0.5 + i * 0.35, a = ease.inOut(inv(t0, t0 + 0.6, idade));
    let p = chao(190);
    // luz no chão
    p += `<polygon points="-66,0 66,0 170,70 -170,70" fill="#fff3b0" opacity="${F(0.38 * a)}"/>`;
    // batente
    p += caixa(-84, -254, 168, 254, 8, K.madeira2, { lado: 10, base: 0 });
    p += R(-66, -238, 132, 238, 3, '#2a2033', 0);
    p += op(a, R(-66, -238, 132, 238, 3, 'url(#ggPorta)', 0) + R(-80, -250, 160, 250, 6, '#fff3b0', 0, 'filter="url(#ggGlow)"'));
    // folha da porta (dobradiça à esquerda)
    let fo = caixa(-66, -238, 132, 238, 3, K.madeira, { lado: 0, base: 0 });
    fo += R(-50, -220, 100, 90, 4, 'none', 2.5, '', tom(K.madeira, 0.35)) + R(-50, -116, 100, 100, 4, 'none', 2.5, '', tom(K.madeira, 0.35));
    fo += Ci(48, -120, 7, K.amarelo, 2.5);
    p += g(`translate(-66 0) skewY(${F(-a * 16)}) scale(${F(1 - 0.8 * a)} 1) translate(66 0)`, fo);
    p += R(-84, -254, 168, 254, 8, 'none', 3);
    // logo e número
    p += Ci(0, -288, 22, K.papel, 3) + T(String(i + 1), 0, -280, 22, INK, { weight: 900 });
    s += pop(idade, 0.08 * i, dx, 0, mv(dx, 0, p), 0, 0.42);
  });
  s += op(inv(0.3, 0.5, idade), R(-72, -358, 144, 46, 10, K.papel, 3) + logo('alvarez-marsal', 0, -335, 30, 120));
  s += chip('CROSS-SELL', 230, -350, idade - 0.9, { cor: COR.ambar, solido: true, icone: 'raio', h: 48 });
  return raiz(x, y, o, s);
}

// Pipeline: cano com válvula, cartões "PROJETO" fluindo, chama embaixo e termômetro subindo. (x, y) = base. ~620x320
export function pipeline(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const nivel = ease.out(inv(0.6, 2.6, idade)) * 0.88;
  let s = chao(560);
  // queimador e chama
  s += caixa(-70, -36, 140, 36, 6, K.grafite, { base: 8 });
  for (let i = 0; i < 5; i++) s += R(-50 + i * 24, -44, 10, 10, 3, K.grafite2, 2.5);
  s += op(inv(0.3, 0.6, idade), chamas(0, -44, idade, { n: 5, alt: 100 + 40 * nivel, larg: 110, seed: 9 }));
  // cano de vidro com flanges
  const py = -200;
  s += R(-300, py - 26, 600, 52, 16, 'rgba(191,227,242,.35)', 0);
  let cards = '';
  for (let i = 0; i < 5; i++) {
    const cx = -320 + ((idade * 150 + i * 150) % 740);
    cards += R(cx - 30, py - 15, 60, 30, 5, K.papel, 2.5) + R(cx - 30, py - 15, 60, 9, 5, K.azul, 0) + T('PROJETO', cx, py + 10, 11, INK, { weight: 900 });
  }
  s += `<clipPath id="ggCano"><rect x="-288" y="${py - 22}" width="576" height="44" rx="12"/></clipPath><g clip-path="url(#ggCano)">${cards}</g>`;
  s += R(-300, py - 26, 600, 52, 16, 'none', 3) + R(-290, py - 20, 580, 8, 4, 'rgba(255,255,255,.5)', 0);
  for (const fx of [-240, 160]) s += caixa(fx - 11, py - 36, 22, 72, 4, '#6f7f98', { lado: 6 });
  // válvula
  s += R(-128, py - 54, 16, 30, 4, '#6f7f98', 3);
  let roda = Ci(0, 0, 24, 'none', 7, '', K.vermelho) + Ci(0, 0, 24, 'none', 2, '', INK) + Ci(0, 0, 6, K.vermelho, 2.5);
  for (let i = 0; i < 3; i++) roda += rot(i * 60, 0, 0, Ln(-24, 0, 24, 0, 5, K.vermelho));
  s += g(tr(-120, py - 62, 1, idade * 70), roda);
  // termômetro
  const tx = 262;
  s += R(tx - 14, -300, 28, 262, 14, '#fff', 3) + Ci(tx, -30, 28, K.vermelho, 3);
  s += R(tx - 7, -40 - 238 * nivel, 14, 238 * nivel + 10, 7, K.vermelho, 0);
  for (let i = 0; i < 6; i++) s += Ln(tx + 16, -60 - i * 42, tx + 26, -60 - i * 42, 3);
  s += op(inv(1.8, 2.2, idade), g(tr(tx, -286, 1, 0), R(-18, -14, 36, 28, 6, '#fff', 0, 'opacity=".6"')) + estrela(tx, -292, 14, COR.ambar, 2.5));
  // rótulos
  s += adesivo('PIPELINE AQUECIDO', -70, -350, idade - 1.1, { tam: 38, cor: COR.laranja, rot: -3 });
  s += chip('PRÓXIMO ANO', tx + 30, -372, idade - 1.6, { cor: COR.navy, icone: null, h: 40 });
  return pop(idade, 0, x, y, raiz(x, y, o, s), 0, 0.45);
}
