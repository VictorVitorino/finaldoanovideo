// Props do filme no estilo do explainer SpecForge: ilustração plana, contorno de tinta ~3 px,
// cores chapadas com uma faixa de sombra, sombra suave no chão, formas arredondadas.
// Funções puras do tempo: idade em s desde a entrada (idade < 0 = invisível), saída em SVG 1920x1080.
// (x, y) = base central no chão, salvo quando a assinatura diz "centro" (peças de interface).
// Nenhum logo dentro dos props: os logos entram em balões em outra camada.
import { C, TAU, clamp, lerp, inv, ease, bump, rng, text, n2, g, op, tr } from '../core.js';

export const INK = '#3a2a22';
const F = n2;
const K = {
  papel: '#fffaf0', creme: '#fbf1de', creme2: '#f1e2c4', bege: '#e9d6b4',
  madeira: '#c98e55', madeira2: '#9c6638', tijolo: '#c8553d', telha: '#b9443a',
  verde: '#57b47a', verde2: '#3e9a5a', menta: '#c4ead3', grama: '#9fd27f',
  azul: '#5aa9e6', vidro: '#bfe3f2', navy: '#2c4a7a', navy2: '#1e3560',
  amarelo: '#f5c04a', laranja: '#f08a3c', vermelho: '#e5534b', rosa: '#ef8fa0',
  cinza: '#d5d0c6', cinza2: '#a39b8f', aco: '#e4e7ec', pele: '#f2c29b',
};

// mistura a cor com o marrom da tinta (sombra chapada)
function tom(hex, k = 0.2) {
  const h = hex.replace('#', '');
  const v = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  const a = [42, 26, 18];
  return '#' + v.map((c, i) => Math.round(lerp(c, a[i], k)).toString(16).padStart(2, '0')).join('');
}

// ---------- primitivas com contorno de tinta ----------
const st = (k = 3, cor = INK) => (k ? ` stroke="${cor}" stroke-width="${k}" stroke-linejoin="round" stroke-linecap="round"` : '');
const xa = x2 => (x2 ? ' ' + x2 : '');
const R = (x, y, w, h, r, fill, k = 3, x2 = '', cor = INK) => `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" rx="${F(r)}" fill="${fill}"${st(k, cor)}${xa(x2)}/>`;
const Ci = (cx, cy, r, fill, k = 3, x2 = '') => `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(r)}" fill="${fill}"${st(k)}${xa(x2)}/>`;
const E = (cx, cy, rx, ry, fill, k = 3, x2 = '', cor = INK) => `<ellipse cx="${F(cx)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry)}" fill="${fill}"${st(k, cor)}${xa(x2)}/>`;
const P = (d, fill = 'none', k = 3, x2 = '', cor = INK) => `<path d="${d}" fill="${fill}"${st(k, cor)}${xa(x2)}/>`;
const Ln = (x1, y1, x2, y2, k = 3, cor = INK, x3 = '') => `<line x1="${F(x1)}" y1="${F(y1)}" x2="${F(x2)}" y2="${F(y2)}" stroke="${cor}" stroke-width="${k}" stroke-linecap="round"${xa(x3)}/>`;
const T = (s, x, y, size, fill = INK, o = {}) => text(s, x, y, { size, fill, weight: o.weight ?? 800, anchor: o.anchor ?? 'middle', family: o.family ?? 'Outfit', ls: o.ls });
const id = (pre, x, y) => `pf-${pre}-${Math.round(x)}-${Math.round(y)}`.replace(/[^a-z0-9-]/gi, '_');

// Caixa chapada: face + faixa de sombra (embaixo e/ou à direita) + contorno.
function caixa(x, y, w, h, r, fill, o = {}) {
  const sh = o.sombra ?? tom(fill, 0.16);
  let s = R(x, y, w, h, r, fill, 0);
  const b = o.base ?? Math.min(h * 0.16, 14);
  if (b > 0) s += R(x, y + h - b, w, b, Math.min(r, b), sh, 0) + R(x, y + h - b, w, Math.min(r, b) * 0.6, 0, sh, 0);
  if (o.lado) s += R(x + w - o.lado, y, o.lado, h, Math.min(r, o.lado), sh, 0) + R(x + w - o.lado, y, Math.min(r, o.lado) * 0.6, h, 0, sh, 0);
  return s + R(x, y, w, h, r, 'none', o.k ?? 3);
}
// forma livre: face, sombra (outro path) e contorno
const forma = (d, fill, dSombra, sh) => P(d, fill, 0) + (dSombra ? P(dSombra, sh ?? tom(fill, 0.16), 0) : '') + P(d, 'none', 3);
// sombra suave no chão
const chao = (w, cx = 0, cy = 0) => `<ellipse cx="${F(cx)}" cy="${F(cy + 3)}" rx="${F(w / 2)}" ry="${F(Math.max(7, w * 0.04))}" fill="rgba(70,40,15,.16)"/>`;

// Montagem: a peça cresce a partir do ponto (ox, oy) com leve exagero, caindo de "queda" px.
function pop(idade, a, ox, oy, body, queda = 0, d = 0.42) {
  const u = inv(a, a + d, idade);
  if (u <= 0) return '';
  if (u >= 1) return body;
  const s = ease.back(u), dy = -queda * (1 - ease.out(u));
  return g(`translate(${F(ox)} ${F(oy + dy)}) scale(${F(Math.max(0.001, s))}) translate(${F(-ox)} ${F(-oy)})`, body);
}
const rot = (a, cx, cy, body) => g(`rotate(${F(a)} ${F(cx)} ${F(cy)})`, body);
const mv = (dx, dy, body) => g(`translate(${F(dx)} ${F(dy)})`, body);
// prop inteiro: posição + escala opcional
const raiz = (x, y, o, body) => g(tr(x, y, o.escala ?? 1, o.rot ?? 0), body);

// ondas de som em arco dos dois lados de (cx, cy)
function ondas(cx, cy, idade, o = {}) {
  const r0 = o.r0 ?? 60, dr = o.dr ?? 70, cor = o.cor ?? INK, k = o.k ?? 5;
  let s = '';
  for (let j = 0; j < 3; j++) {
    const f = (idade * (o.vel ?? 1.3) + j / 3) % 1;
    const r = r0 + f * dr, a = (o.ang ?? 38) * Math.PI / 180, al = (1 - f) * (o.op ?? 1);
    for (const lado of [1, -1]) {
      const x1 = cx + lado * r * Math.cos(a), y1 = cy - r * Math.sin(a), y2 = cy + r * Math.sin(a);
      s += P(`M${F(x1)} ${F(y1)} A${F(r)} ${F(r)} 0 0 ${lado > 0 ? 1 : 0} ${F(x1)} ${F(y2)}`, 'none', k, `opacity="${F(al)}"`, cor);
    }
  }
  return s;
}
// fumaça/vapor: bolinhas que sobem, crescem e somem
function fumaca(cx, cy, idade, o = {}) {
  let s = '';
  const n = o.n ?? 4, per = o.per ?? 2.2, cor = o.cor ?? '#eef0f2';
  for (let j = 0; j < n; j++) {
    const f = (idade / per + j / n) % 1;
    const r = (o.r ?? 12) * (0.6 + f * 1.3);
    const px = cx + Math.sin(f * 5 + j) * 8 + f * (o.vento ?? 30), py = cy - f * (o.alt ?? 110);
    s += Ci(px, py, r, cor, 2.5, `opacity="${F((1 - f) * Math.min(1, f * 6))}"`);
  }
  return s;
}
// tijolinhos (juntas) dentro do retângulo
function tijolos(x, y, w, h, bw = 36, bh = 18, cor = 'rgba(58,42,34,.35)') {
  let s = '';
  for (let r = 0, yy = y + bh; yy < y + h - 2; r++, yy += bh) s += Ln(x + 2, yy, x + w - 2, yy, 2, cor);
  for (let r = 0, yy = y; yy < y + h - 2; r++, yy += bh) {
    for (let xx = x + (r % 2 ? bw / 2 : bw); xx < x + w - 4; xx += bw) s += Ln(xx, yy + 2, xx, Math.min(yy + bh, y + h) - 2, 2, cor);
  }
  return s;
}
// ícone de fone (telefone) em torno de (0, 0)
const fone = (cor = '#fff') => P('M-11 -9 Q-11 -14 -6 -14 L-2 -14 L1 -6 L-3 -3 Q0 3 5 5 L8 1 L15 4 L15 8 Q15 14 9 14 Q-11 11 -11 -9 Z', cor, 0);

export function defs() {
  return `<filter id="pf-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>`
    + `<filter id="pf-glow2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>`
    + `<radialGradient id="pf-luz" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffe7a0" stop-opacity=".55"/><stop offset="100%" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient>`;
}

// =====================================================================
// CENA 1 — fundo escuro
// =====================================================================

// Notificação de alerta. (x, y) = centro. o: w, h, cor, icone ('alerta'|'erro'|'sino'), texto, pulso (0–1, reativo ao som; padrão = batida interna), periodo, rot, escala
export function alertaPopup(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const w = o.w ?? 380, h = o.h ?? 104, cor = o.cor ?? K.vermelho;
  const p = o.pulso ?? Math.pow(Math.max(0, Math.cos((idade * TAU) / (o.periodo ?? 0.9))), 12) * inv(0.3, 0.5, idade);
  const s = ease.back(inv(0, 0.36, idade)) * (1 + 0.06 * p) * (o.escala ?? 1);
  const r = (o.rot ?? 0) + Math.sin(idade * 34) * 3 * Math.max(0, 1 - idade / 0.45);
  let b = R(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 30, cor, 0, `opacity="${F(0.28 + 0.4 * p)}" filter="url(#pf-glow)"`);
  b += caixa(-w / 2, -h / 2, w, h, 24, K.papel, { base: 12 });
  const ix = -w / 2 + 56;
  b += Ci(ix, -3, 33, tom(cor, -0.0), 3);
  if ((o.icone ?? 'alerta') === 'alerta') {
    b += P(`M${ix} -24 L${ix + 22} 14 L${ix - 22} 14 Z`, K.amarelo, 3);
    b += Ln(ix, -10, ix, 1, 4) + Ci(ix, 8, 1.6, INK, 2);
  } else if (o.icone === 'erro') {
    b += Ln(ix - 11, -14, ix + 11, 8, 6, '#fff') + Ln(ix + 11, -14, ix - 11, 8, 6, '#fff');
  } else {
    b += P(`M${ix - 16} 10 Q${ix - 14} -20 ${ix} -20 Q${ix + 14} -20 ${ix + 16} 10 Z`, K.amarelo, 3) + Ci(ix, 14, 4, K.amarelo, 2.5);
  }
  if (o.texto) b += T(o.texto, ix + 52, 10, o.tamTexto ?? 28, INK, { anchor: 'start', weight: 900 });
  else b += R(ix + 52, -24, w * 0.5, 15, 7.5, '#d9c9aa', 0) + R(ix + 52, 4, w * 0.34, 12, 6, '#e8dcc4', 0);
  b += Ci(w / 2 - 8, -h / 2 + 8, 15, cor, 3) + Ci(w / 2 - 8, -h / 2 + 8, 5, '#fff', 0);
  return g(tr(x, y, s, r), b);
}

// Telefone de mesa tocando (ondas + fone pulando). (x, y) = base. o: toca (0/1), cor, ondas (0/1), corOnda, escala
export function telefone(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const cor = o.cor ?? K.vermelho, toca = o.toca ?? 1;
  const tocando = toca && idade > 0.35 && idade % 1.3 < 0.8;
  const tre = tocando ? Math.sin(idade * 75) : 0;
  let b = chao(240);
  let corpo = forma('M-112 0 L-90 -90 Q-86 -104 -70 -104 L70 -104 Q86 -104 90 -90 L112 0 Z', cor, 'M-112 0 L-106 -22 L106 -22 L112 0 Z');
  corpo += Ci(0, -52, 33, K.creme, 3);
  for (let j = 0; j < 8; j++) { const a = -2.2 + j * 0.62; corpo += Ci(Math.cos(a) * 21, -52 + Math.sin(a) * 21, 4.5, tom(K.creme, 0.25), 0); }
  corpo += Ci(0, -52, 8, cor, 2.5);
  corpo += P('M-104 -60 C-140 -56 -126 -80 -150 -78 C-170 -76 -150 -100 -132 -112', 'none', 3);
  const lift = tocando ? -8 - Math.abs(tre) * 6 : 0;
  const fone2 = forma('M-122 0 Q-126 -38 -96 -42 L96 -42 Q126 -38 122 0 L78 0 Q76 -20 60 -22 L-60 -22 Q-76 -20 -78 0 Z', cor, 'M-122 0 L-121 -10 L-79 -10 L-78 0 Z M122 0 L121 -10 L79 -10 L78 0 Z');
  corpo += g(`translate(0 ${F(-104 + lift)}) rotate(${F(tre * 5)})`, fone2);
  b += g(`translate(${F(tre * 2)} 0)`, corpo);
  if (toca && (o.ondas ?? 1)) b += op(inv(0.3, 0.6, idade), ondas(0, -80, idade, { r0: 150, dr: 70, cor: o.corOnda ?? K.amarelo, k: 6 }));
  return pop(idade, 0, x, y, raiz(x, y, o, b), 0, 0.4);
}
// Mesmo telefone, parado, para o escritório (cena 5)
export const telefoneFixo = (x, y, idade, o = {}) => telefone(x, y, idade, { toca: 0, ...o });

// Janela de sistema genérica com avisos vermelhos piscando. (x, y) = centro. o: erros (índices das linhas), escala
export function janelaERP(x, y, w = 640, h = 400, idade = 0, o = {}) {
  if (idade < 0) return '';
  const X = -w / 2, Y = -h / 2;
  const pisca = i => (Math.sin(idade * 7 + i * 1.7) > -0.1 ? 1 : 0.35);
  let b = R(X + 10, Y + 14, w, h, 20, 'rgba(0,0,0,.28)', 0);
  b += R(X - 8, Y - 8, w + 16, h + 16, 26, 'none', 0, `stroke="${K.vermelho}" stroke-width="6" opacity="${F(0.15 + 0.35 * pisca(0))}" filter="url(#pf-glow2)"`);
  b += caixa(X, Y, w, h, 20, K.papel, { base: 0 });
  b += R(X, Y, w, 48, 20, '#d8deea', 0) + R(X, Y + 24, w, 24, 0, '#d8deea', 0) + Ln(X, Y + 48, X + w, Y + 48);
  b += R(X, Y, w, h, 20, 'none', 3);
  [K.vermelho, K.amarelo, K.verde].forEach((c, i) => { b += Ci(X + 28 + i * 24, Y + 24, 7, c, 2.5); });
  b += R(X + w / 2 - 90, Y + 17, 180, 14, 7, '#b9c2d3', 0);
  // menu lateral
  b += R(X + 14, Y + 62, 112, h - 76, 12, '#eef0f5', 2.5);
  for (let i = 0; i < 6; i++) b += Ci(X + 34, Y + 90 + i * 40, 7, i === 2 ? K.azul : '#c3cad8', 0) + R(X + 48, Y + 85 + i * 40, 62 - (i % 3) * 10, 10, 5, '#c3cad8', 0);
  // tabela
  const x0 = X + 142, w2 = w - 158, n = 6, rh = (h - 130) / n;
  b += R(x0, Y + 62, w2, 34, 10, C.navy2, 0) + R(x0 + 16, Y + 74, 90, 10, 5, '#7f9cc8', 0) + R(x0 + w2 * 0.45, Y + 74, 70, 10, 5, '#7f9cc8', 0);
  const erros = o.erros ?? [1, 3, 4];
  for (let i = 0; i < n; i++) {
    const ry = Y + 106 + i * rh, er = erros.includes(i), pi = pisca(i);
    b += op(clamp((idade - 0.15 - i * 0.05) * 5), R(x0, ry, w2, rh - 8, 9, er ? `rgba(229,83,75,${F(0.12 + 0.16 * pi)})` : i % 2 ? '#f5efe3' : '#fffdf8', er ? 2.5 : 0, er ? `stroke-opacity="${F(0.4 + 0.6 * pi)}"` : '')
      + R(x0 + 16, ry + rh / 2 - 9, w2 * 0.28, 10, 5, '#cfc6b4', 0) + R(x0 + w2 * 0.45, ry + rh / 2 - 9, w2 * 0.2, 10, 5, '#ddd5c4', 0)
      + (er ? op(pi, Ci(x0 + w2 - 26, ry + rh / 2 - 4, 13, K.vermelho, 2.5) + Ln(x0 + w2 - 26, ry + rh / 2 - 11, x0 + w2 - 26, ry + rh / 2 - 3, 3.5, '#fff') + Ci(x0 + w2 - 26, ry + rh / 2 + 2, 1.5, '#fff', 0))
        : Ci(x0 + w2 - 26, ry + rh / 2 - 4, 7, '#cfe8d6', 0)));
  }
  // faixa de erro no topo
  b += op(pisca(5) * inv(0.5, 0.7, idade), R(X + w - 250, Y + 58, 230, 40, 12, K.vermelho, 3)
    + P(`M${X + w - 228} ${Y + 88} L${X + w - 214} ${Y + 66} L${X + w - 200} ${Y + 88} Z`, K.amarelo, 2.5)
    + R(X + w - 188, Y + 72, 140, 12, 6, 'rgba(255,255,255,.8)', 0));
  return g(tr(x, y, ease.back(inv(0, 0.42, idade)) * (o.escala ?? 1), o.rot ?? 0), b);
}

// Mapa de processos com caixas e conectores soltos que balançam. (x, y) = centro. o: alinhado (0–1), linha (cor), escala
export function conectores(x, y, w = 760, h = 420, idade = 0, o = {}) {
  if (idade < 0) return '';
  const al = clamp(o.alinhado ?? 0), A = 1 - ease.inOut(al);
  const rnd = rng(o.seed ?? 7);
  const bw = 150, bh = 74;
  const pos = [[0.12, 0.27], [0.5, 0.27], [0.88, 0.27], [0.12, 0.78], [0.5, 0.78], [0.88, 0.78]];
  const cores = [K.azul, K.amarelo, K.verde, K.laranja, '#9b7be0', K.rosa];
  const des = pos.map((_, i) => [(rnd() - 0.5) * 70, (rnd() - 0.5) * 70, (rnd() - 0.5) * 22, rnd() * 6]);
  const bx = pos.map(([px, py], i) => {
    const d = des[i];
    return [-w / 2 + px * w + A * (d[0] + Math.sin(idade * 1.7 + d[3]) * 8), -h / 2 + py * h + A * (d[1] + Math.cos(idade * 1.3 + d[3]) * 7), A * (d[2] + Math.sin(idade * 2.1 + d[3]) * 4)];
  });
  const linha = o.linha ?? '#f4ecdf';
  const lig = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5]];
  let s = '';
  lig.forEach(([a, c], k) => {
    const pa = bx[a], pc = bx[c];
    const hor = Math.abs(pos[a][1] - pos[c][1]) < 0.1;
    const ax = pa[0] + (hor ? bw / 2 : 0), ay = pa[1] + (hor ? 0 : bh / 2);
    let cx = pc[0] - (hor ? bw / 2 : 0), cy = pc[1] - (hor ? 0 : bh / 2);
    // solto: termina antes e fora do alvo
    const gap = A * (34 + k * 6), dv = A * (k % 2 ? 40 : -36);
    if (hor) { cx -= gap; cy += dv; } else { cy -= gap; cx += dv; }
    const u = inv(0.25 + k * 0.08, 0.75 + k * 0.08, idade);
    const d = hor ? `M${F(ax)} ${F(ay)} C${F(ax + 60)} ${F(ay)} ${F(cx - 60)} ${F(cy)} ${F(cx)} ${F(cy)}` : `M${F(ax)} ${F(ay)} C${F(ax)} ${F(ay + 50)} ${F(cx)} ${F(cy - 50)} ${F(cx)} ${F(cy)}`;
    s += P(d, 'none', 5, `pathLength="1" stroke-dasharray="${F(u)} 1"`, linha);
    if (u > 0.98) {
      s += A > 0.4 ? op(A, Ci(cx, cy, 8, K.vermelho, 3) + Ln(cx - 3, cy - 3, cx + 3, cy + 3, 2.5, '#fff') + Ln(cx + 3, cy - 3, cx - 3, cy + 3, 2.5, '#fff'))
        : op(1 - A * 2, Ci(cx, cy, 8, K.verde, 3));
    }
  });
  bx.forEach(([px, py, r], i) => {
    let c = caixa(-bw / 2, -bh / 2, bw, bh, 14, K.papel, { base: 9 });
    c += R(-bw / 2, -bh / 2, bw, 20, 14, cores[i], 0) + R(-bw / 2, -bh / 2 + 10, bw, 10, 0, cores[i], 0) + R(-bw / 2, -bh / 2, bw, bh, 14, 'none', 3) + Ln(-bw / 2, -bh / 2 + 20, bw / 2, -bh / 2 + 20, 3);
    c += Ci(-bw / 2 + 24, 12, 9, tom(cores[i], -0.0), 2.5) + R(-bw / 2 + 42, 2, 80, 9, 4.5, '#d9c9aa', 0) + R(-bw / 2 + 42, 17, 54, 8, 4, '#e6dcc6', 0);
    s += pop(idade, i * 0.07, px, py, g(tr(px, py, 1, r), c));
  });
  return g(tr(x, y, o.escala ?? 1), s);
}

// =====================================================================
// ESCRITÓRIO (cenas 2, 4, 5) — peças em coordenadas locais, base central em (0, 0)
// =====================================================================
function mesaP(idade, o = {}) {
  let s = chao(330);
  // gaveteiro e perna
  s += pop(idade, 0, 0, 0, caixa(-150, -142, 92, 142, 8, K.bege, { lado: 16 }) + Ln(-150, -96, -58, -96) + Ln(-150, -50, -58, -50)
    + R(-116, -124, 24, 7, 3.5, K.madeira2, 0) + R(-116, -78, 24, 7, 3.5, K.madeira2, 0) + R(-116, -32, 24, 7, 3.5, K.madeira2, 0)
    + caixa(128, -142, 18, 142, 5, K.bege, { lado: 6 }));
  s += pop(idade, 0.08, 0, -150, caixa(-162, -160, 324, 22, 8, K.madeira, { base: 7 }), 30);
  if (o.monitor ?? 1) {
    let m = R(-8, -200, 16, 42, 3, '#8d93a3', 3) + R(-42, -168, 84, 10, 5, '#8d93a3', 3);
    m += caixa(-96, -298, 192, 116, 12, '#3b4660', { base: 0 });
    m += R(-84, -287, 168, 94, 7, '#c9ecf6', 2.5);
    for (let i = 0; i < 4; i++) {
      const hh = 18 + 30 * (0.5 + 0.5 * Math.sin(idade * 1.6 + i * 1.3)) * inv(0.3, 0.8, idade);
      m += R(-70 + i * 22, -203 - hh, 14, hh, 3, [K.azul, K.verde, K.amarelo, K.laranja][i], 0);
    }
    m += R(18, -276, 54, 9, 4.5, '#8fb7cc', 0) + R(18, -260, 40, 9, 4.5, '#a9cddd', 0) + R(18, -244, 48, 9, 4.5, '#a9cddd', 0);
    m += R(-62, -170, 92, 10, 4, '#ece6da', 2.5) + E(52, -165, 10, 6, '#ece6da', 2.5);
    s += pop(idade, 0.18, 0, -160, o.telefone ? mv(-44, 0, m) : m, 20);
  }
  if (o.telefone) s += mv(104, -160, g('scale(.36)', telefone(0, 0, idade - 0.3, { toca: o.toca ?? 0, ondas: o.toca ?? 0 })));
  else if (o.caneca ?? 1) {
    s += pop(idade, 0.3, 120, -160, forma('M104 -194 L136 -194 L133 -162 L107 -162 Z', K.laranja, 'M104 -194 L136 -194 L135 -186 L105 -186 Z', tom(K.laranja, 0.2)) + P('M135 -186 Q150 -184 146 -172 Q143 -166 134 -168', 'none', 3)
      + op(inv(0.6, 1, idade), fumaca(118, -200, idade, { n: 3, r: 5, alt: 40, vento: 6, per: 1.8 })));
  }
  return s;
}
function cadeiraP(idade, o = {}) {
  const c = o.cor ?? K.navy;
  let s = chao(130);
  s += Ln(-48, -12, 48, -12, 7) + Ln(-48, -12, 48, -12, 3, '#6f7687') + Ci(-46, -6, 7, '#4b5163', 2.5) + Ci(46, -6, 7, '#4b5163', 2.5) + Ci(0, -6, 7, '#4b5163', 2.5);
  s += R(-7, -104, 14, 92, 4, '#8d93a3', 3);
  s += caixa(18, -240, 34, 126, 14, c, { lado: 10 });
  s += caixa(-52, -124, 108, 24, 12, c, { base: 8 });
  s += R(26, -128, 12, 16, 3, '#6f7687', 2.5);
  return pop(idade, 0, 0, 0, o.virada ? g('scale(-1 1)', s) : s, 0);
}
function plantaP(idade, o = {}) {
  let s = chao(110);
  const folhas = [[-62, 120], [-30, 140], [0, 150], [30, 138], [60, 118], [-15, 100], [18, 104]];
  let f = '';
  folhas.forEach(([a, l], i) => {
    const sw = Math.sin(idade * 1.6 + i) * 3;
    const cor = i % 2 ? K.verde : K.verde2;
    f += rot(a + sw, 0, -80, P(`M0 -80 Q${-l * 0.22} ${-80 - l * 0.55} 0 ${-80 - l} Q${l * 0.22} ${-80 - l * 0.55} 0 -80 Z`, cor, 3) + Ln(0, -84, 0, -80 - l * 0.8, 2, tom(cor, 0.3)));
  });
  s += pop(idade, 0.15, 0, -80, f);
  s += pop(idade, 0, 0, 0, forma('M-44 -84 L44 -84 L34 0 L-34 0 Z', '#d9774a', 'M-38 -24 L38 -24 L34 0 L-34 0 Z') + caixa(-50, -96, 100, 20, 8, '#e48a5c', { base: 6 }));
  return s;
}
function estanteP(idade, o = {}) {
  const rnd = rng(o.seed ?? 11);
  let s = chao(230);
  s += pop(idade, 0, 0, 0, caixa(-110, -340, 220, 340, 10, K.madeira, { lado: 18 }) + R(-96, -326, 192, 312, 6, '#e8c99a', 2.5));
  const pr = [-250, -160, -70];
  let livros = '';
  const cores = [K.azul, K.vermelho, K.amarelo, K.verde, K.navy, K.laranja, '#9b7be0'];
  pr.forEach((py, k) => {
    livros += R(-98, py, 196, 10, 3, K.madeira2, 2.5);
    let xx = -90;
    let j = 0;
    while (xx < (k === 1 ? 20 : 70)) {
      const lw = 14 + rnd() * 12, lh = 52 + rnd() * 24, inc = rnd() < 0.12 && j > 0;
      const c = cores[Math.floor(rnd() * cores.length)];
      const L = R(xx, py - lh, lw, lh, 3, c, 2.5) + R(xx + 3, py - lh + 10, lw - 6, 5, 2, 'rgba(255,255,255,.45)', 0);
      livros += pop(idade, 0.2 + k * 0.1 + j * 0.03, xx + lw / 2, py, inc ? rot(-12, xx, py, L) : L);
      xx += lw + 2; j++;
    }
    if (k === 1) livros += pop(idade, 0.5, 60, py, forma(`M38 ${py} L82 ${py} L78 ${py - 34} L42 ${py - 34} Z`, '#d9774a') + Ci(50, py - 46, 14, K.verde, 3) + Ci(70, py - 50, 14, K.verde2, 3) + Ci(60, py - 62, 14, K.verde, 3));
  });
  s += livros + R(-98, -20, 196, 10, 3, K.madeira2, 2.5) + caixa(-80, -64, 70, 44, 6, '#f1e2c4', { base: 6 }) + caixa(10, -58, 70, 38, 6, K.bege, { base: 6 });
  return s;
}

// Quadro branco com rodinhas. (x, y) = base. o: pernas (altura), svg (conteúdo em coords da área branca, origem no canto sup. esq.), escala
export function quadroBranco(x, y, w = 280, h = 180, idade = 0, o = {}) {
  if (idade < 0) return '';
  const L = o.pernas ?? 110, X = -w / 2, Y = -L - h;
  let s = chao(w + 20);
  s += Ln(X + 24, Y + h, X + 4, -10, 8) + Ln(X + 24, Y + h, X + 4, -10, 4, '#a3a9b7') + Ln(-X - 24, Y + h, -X - 4, -10, 8) + Ln(-X - 24, Y + h, -X - 4, -10, 4, '#a3a9b7');
  s += Ci(X + 4, -7, 7, '#4b5163', 2.5) + Ci(-X - 4, -7, 7, '#4b5163', 2.5);
  let q = caixa(X, Y, w, h, 12, '#c9ced8', { base: 8 }) + R(X + 10, Y + 10, w - 20, h - 22, 6, '#ffffff', 2.5);
  q += R(X + 34, Y + h - 6, w - 68, 10, 4, '#a3a9b7', 2.5) + R(X + 50, Y + h - 12, 26, 7, 3, K.vermelho, 2) + R(X + 82, Y + h - 12, 26, 7, 3, K.azul, 2);
  if (o.svg) q += g(`translate(${F(X + 10)} ${F(Y + 10)})`, o.svg);
  else {
    // rabiscos: mini fluxo que se desenha + post-its
    const u = inv(0.35, 1.5, idade), ix = X + 30, iy = Y + 36, sw = (w - 80) / 3;
    const d = `M${F(ix)} ${F(iy + 20)} h${F(sw * 0.6)} M${F(ix + sw)} ${F(iy + 20)} h${F(sw * 0.6)} M${F(ix + sw * 2)} ${F(iy + 20)} h${F(sw * 0.6)} M${F(ix + sw * 0.6 + 6)} ${F(iy + 20)} h${F(sw * 0.3)} M${F(ix + sw * 1.6 + 6)} ${F(iy + 20)} h${F(sw * 0.3)}`;
    q += P(d, 'none', 4, `pathLength="1" stroke-dasharray="${F(u)} 1"`, K.azul);
    for (let i = 0; i < 3; i++) q += op(inv(0.4 + i * 0.25, 0.6 + i * 0.25, idade), R(ix + sw * i - 4, iy + 4, sw * 0.6 + 8, 32, 6, 'none', 3.5, '', [K.azul, K.vermelho, K.verde][i]));
    q += P(`M${F(ix)} ${F(Y + h - 40)} Q${F(ix + 60)} ${F(Y + h - 70)} ${F(ix + 120)} ${F(Y + h - 46)} T${F(ix + 200)} ${F(Y + h - 64)}`, 'none', 4, `pathLength="1" stroke-dasharray="${F(inv(0.9, 1.8, idade))} 1"`, K.vermelho);
    [[K.amarelo, -1], [K.rosa, 4]].forEach(([c, r], i) => { q += pop(idade, 1 + i * 0.15, -X - 50 - i * 46, Y + h - 60, rot(r * 2, -X - 50 - i * 46, Y + h - 60, R(-X - 70 - i * 46, Y + h - 82, 40, 40, 3, c, 2.5))); });
  }
  s += pop(idade, 0, 0, Y + h, q, 30);
  return raiz(x, y, o, s);
}

const PECAS = { mesa: [mesaP, 330], cadeira: [cadeiraP, 120], planta: [plantaP, 110], estante: [estanteP, 230], quadro: [(i, o) => quadroBranco(0, 0, 260, 170, i, o), 280] };
// Escritório modular. (x, y) = base central do conjunto.
// o.itens: lista de 'estante'|'mesa'|'cadeira'|'planta'|'quadro' ou {tipo, dx, ...opções da peça}
//   (mesa: monitor, caneca, telefone, toca; cadeira: cor, virada; quadro: svg). o.gap (30), o.escala
export function escritorio(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const itens = (o.itens ?? ['estante', 'mesa', 'cadeira', 'planta']).map(it => (typeof it === 'string' ? { tipo: it } : it));
  const gap = o.gap ?? 30;
  const larg = itens.map((it, i) => PECAS[it.tipo][1]);
  // cadeira logo após uma mesa entra na frente dela
  const passo = itens.map((it, i) => (i === 0 ? 0 : it.tipo === 'cadeira' && itens[i - 1].tipo === 'mesa' ? -90 : gap) + (it.dx ?? 0));
  const tot = larg.reduce((a, b) => a + b, 0) + passo.reduce((a, b) => a + b, 0);
  let cx = -tot / 2, s = '';
  itens.forEach((it, i) => {
    cx += passo[i];
    s += mv(cx + larg[i] / 2, 0, PECAS[it.tipo][0](idade - i * 0.12, it));
    cx += larg[i];
  });
  return raiz(x, y, o, s);
}
export const mesa = (x, y, idade, o = {}) => (idade < 0 ? '' : raiz(x, y, o, mesaP(idade, o)));
export const cadeira = (x, y, idade, o = {}) => (idade < 0 ? '' : raiz(x, y, o, cadeiraP(idade, o)));
export const planta = (x, y, idade, o = {}) => (idade < 0 ? '' : raiz(x, y, o, plantaP(idade, o)));
export const estante = (x, y, idade, o = {}) => (idade < 0 ? '' : raiz(x, y, o, estanteP(idade, o)));

// Celular grande com tela de chamada. (x, y) = centro. o: nome, status ('chamando…'), toca (0/1), mao (0/1), escala, rot
export function celular(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const w = 190, h = 360, toca = o.toca ?? 1;
  const tocando = toca && idade > 0.4 && idade % 1.2 < 0.7;
  const tre = tocando ? Math.sin(idade * 70) * 3 : 0;
  let s = '';
  if (toca) s += op(inv(0.3, 0.6, idade), ondas(0, -40, idade, { r0: 130, dr: 60, cor: o.corOnda ?? K.amarelo, k: 6, ang: 30 }));
  if (o.mao) s += R(-w / 2 + 10, h / 2 - 70, w - 20, 170, 40, K.pele, 3) + R(-46, h / 2 + 60, 92, 80, 0, K.pele, 0) + Ln(-46, h / 2 + 60, -46, h / 2 + 140) + Ln(46, h / 2 + 60, 46, h / 2 + 140);
  let c = caixa(-w / 2, -h / 2, w, h, 34, '#2f3242', { base: 0, lado: 12 });
  c += R(-w / 2 + 12, -h / 2 + 14, w - 24, h - 28, 24, '#1f6b5a', 2.5);
  c += R(-22, -h / 2 + 22, 44, 9, 4.5, '#2f3242', 0);
  const pr = 0.5 + 0.5 * Math.sin(idade * 6);
  c += Ci(0, -62, 50 + 6 * pr * toca, 'rgba(255,255,255,.12)', 0) + Ci(0, -62, 44, '#d8eef7', 3);
  c += Ci(0, -74, 15, K.azul, 0) + P('M-26 -36 Q-26 -58 0 -58 Q26 -58 26 -36 Z', K.azul, 0) + Ci(0, -62, 44, 'none', 3);
  if (o.nome) c += T(o.nome, 0, 14, 26, '#fff', { weight: 800 });
  else c += R(-50, -4, 100, 14, 7, 'rgba(255,255,255,.75)', 0);
  c += T(o.status ?? 'chamando…', 0, 46, 18, 'rgba(255,255,255,.75)', { weight: 600, family: 'DM Sans' });
  c += Ci(-44, 116, 24, K.vermelho, 3) + g('translate(-44 116) rotate(135)', fone());
  c += Ci(44, 116, 24 + (tocando ? 3 : 0), K.verde, 3) + g('translate(44 116)', fone());
  s += g(`rotate(${F(tre)})`, c);
  if (o.mao) s += g(`rotate(${F(tre)})`, [0, 40, 80, 118].map(dy => R(w / 2 - 22, 20 + dy, 46, 34, 17, K.pele, 3)).join('') + rot(28, -w / 2, 110, R(-w / 2 - 22, 60, 44, 96, 22, K.pele, 3)));
  return g(tr(x, y, ease.back(inv(0, 0.4, idade)) * (o.escala ?? 1), o.rot ?? 0), s);
}

// =====================================================================
// CENA 3 — seis lugares (metáforas, ~420–520 px de altura). (x, y) = base central.
// Deixam o lado esquerdo livre para 1–3 personagens. o: escala
// =====================================================================
const placa = (w, cor = '#c9b08f') => R(-w / 2, -8, w, 18, 9, cor, 3);

export function hospital(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const vd = '#3fae6e', vdC = '#bfe6cf', par = '#fbf1de';
  let s = chao(620) + pop(idade, 0, 0, 0, placa(600));
  let bl = caixa(-240, -330, 480, 322, 12, par, { lado: 46, base: 0 }) + R(-240, -64, 480, 14, 0, vdC, 0) + R(-240, -330, 480, 322, 12, 'none', 3);
  bl += caixa(-254, -352, 508, 32, 12, vd, { base: 8 });
  s += pop(idade, 0.08, 0, 0, bl, 40);
  s += pop(idade, 0.22, 0, -350, caixa(-86, -436, 172, 96, 14, par, { lado: 22, base: 0 }) + caixa(-96, -448, 192, 22, 10, vd, { base: 6 }), 30);
  // janelas
  const jan = [[-200, -290], [-130, -290], [80, -290], [150, -290], [-200, -196], [-130, -196], [80, -196], [150, -196], [-30, -290]];
  jan.forEach(([jx, jy], i) => {
    let j = caixa(jx, jy, 52, 62, 8, K.vidro, { base: 0 }) + Ln(jx + 26, jy, jx + 26, jy + 62, 3) + Ln(jx, jy + 31, jx + 52, jy + 31, 3) + Ln(jx + 8, jy + 22, jx + 18, jy + 10, 4, 'rgba(255,255,255,.8)');
    if (i === 6) j = caixa(jx, jy, 52, 62, 8, '#e8f7ee', { base: 0 }) + P(`M${jx + 4} ${jy + 34} h10 l5 -14 l7 26 l6 -18 l4 6 h12`, 'none', 3.5, `pathLength="1" stroke-dasharray="0.45 0.55" stroke-dashoffset="${F(-(idade * 0.9) % 1)}"`, vd);
    s += pop(idade, 0.35 + i * 0.04, jx + 26, jy + 31, j);
  });
  // entrada com toldo listrado
  let en = caixa(-60, -126, 120, 118, 8, K.vidro, { base: 0 }) + Ln(0, -126, 0, -8, 3) + R(-60, -14, 120, 6, 0, 'none', 0);
  en += R(-12, -76, 6, 18, 3, INK, 0) + R(6, -76, 6, 18, 3, INK, 0);
  let toldo = '';
  for (let i = 0; i < 6; i++) toldo += P(`M${-84 + i * 28} -156 h28 v22 a14 12 0 0 1 -28 0 Z`, i % 2 ? '#fff' : vd, 3);
  s += pop(idade, 0.3, 0, -8, en) + pop(idade, 0.45, 0, -156, toldo, 20);
  // placa com cruz no alto
  const p = Math.pow(0.5 + 0.5 * Math.sin(idade * 3), 3);
  let cruz = Ci(0, -448, 60, vd, 0, `opacity="${F(0.15 + 0.25 * p)}" filter="url(#pf-glow2)"`) + Ci(0, -448, 48, '#fff', 3.5);
  cruz += P('M-11 -480 h22 v21 h21 v22 h-21 v21 h-22 v-21 h-21 v-22 h21 Z', vd, 3);
  s += pop(idade, 0.55, 0, -448, cruz, 40, 0.5);
  // árvore e coraçãozinho subindo
  const sw = Math.sin(idade * 1.4) * 2;
  s += pop(idade, 0.6, 268, 0, R(262, -70, 12, 70, 4, K.madeira2, 3) + rot(sw, 268, -70, Ci(268, -110, 40, K.verde, 3) + Ci(248, -90, 26, K.verde2, 3) + Ci(290, -94, 24, K.verde2, 3)));
  const f = (idade % 2.6) / 2.6;
  if (idade > 1) s += op(Math.sin(f * Math.PI), g(`translate(${F(40 + Math.sin(f * 8) * 6)} ${F(-160 - f * 120)}) scale(${F(1 + f * 0.4)})`, P('M0 8 C-18 -4 -10 -20 0 -10 C10 -20 18 -4 0 8 Z', K.rosa, 3)));
  return raiz(x, y, o, s);
}

export function laboratorio(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const tq = '#2fb3a6', az = '#4aa8d8';
  let s = chao(640) + pop(idade, 0, 0, 0, placa(620));
  // painel de fundo com prateleira
  let fundo = caixa(-270, -480, 540, 300, 22, '#d6efec', { base: 0 }) + R(-240, -390, 210, 12, 4, K.madeira, 3) + R(40, -420, 200, 112, 10, '#ffffff', 3);
  for (let i = 0; i < 4; i++) fundo += R(58 + i * 44, -404, 30, 26, 4, ['#cfe8f5', '#ffe2a8', '#d6f0dc', '#f6d1d6'][i], 2) + R(58 + i * 44, -366, 30, 26, 4, ['#d6f0dc', '#cfe8f5', '#f6d1d6', '#ffe2a8'][i], 2);
  s += pop(idade, 0.06, 0, -180, fundo, 0);
  [[-226, 46, tq], [-170, 56, K.amarelo], [-110, 40, K.rosa], [-70, 50, az]].forEach(([fx, fh, c], i) => {
    s += pop(idade, 0.3 + i * 0.05, fx + 14, -390, R(fx, -390 - fh, 28, fh, 7, '#f2fbfb', 3) + R(fx + 3, -390 - fh * 0.55, 22, fh * 0.55 - 3, 4, c, 0) + R(fx + 6, -400 - fh, 16, 12, 3, K.navy, 2.5));
  });
  // bancada
  let banc = caixa(-262, -168, 220, 160, 10, '#e3eef2', { lado: 14 }) + Ln(-152, -160, -152, -16) + Ci(-166, -90, 4, INK, 0) + Ci(-138, -90, 4, INK, 0);
  banc += caixa(42, -168, 220, 160, 10, '#e3eef2', { lado: 14 }) + Ln(42, -116, 262, -116) + Ln(42, -64, 262, -64) + R(136, -146, 32, 7, 3.5, INK, 0) + R(136, -94, 32, 7, 3.5, INK, 0) + R(136, -42, 32, 7, 3.5, INK, 0);
  banc += caixa(-284, -190, 568, 26, 10, '#8fb2c6', { base: 8 });
  s += pop(idade, 0.12, 0, 0, banc, 30);
  // microscópio
  s += pop(idade, 0.4, -210, -190, caixa(-246, -204, 72, 16, 6, K.navy, { base: 5 }) + P('M-226 -204 Q-232 -250 -206 -272', 'none', 12) + P('M-226 -204 Q-232 -250 -206 -272', 'none', 6, '', '#f4f6fa')
    + rot(-28, -196, -280, R(-206, -322, 24, 64, 7, '#f4f6fa', 3) + R(-210, -330, 32, 14, 5, K.navy, 3)) + R(-224, -232, 46, 8, 4, K.navy, 2.5));
  // balão de fundo redondo + suporte + bico de gás
  const fl = 1 + 0.15 * Math.sin(idade * 18);
  let bal = Ln(-90, -190, -90, -350, 5) + Ln(-90, -190, -90, -350, 2, '#a3a9b7') + R(-112, -196, 44, 8, 4, '#8d93a3', 2.5);
  bal += R(-30, -208, 30, 18, 4, '#8d93a3', 3) + g(`translate(-15 -210) scale(1 ${F(fl)})`, P('M0 0 Q-12 -12 0 -28 Q12 -12 0 0 Z', az, 2.5) + P('M0 -2 Q-5 -9 0 -17 Q5 -9 0 -2 Z', K.amarelo, 0));
  bal += Ln(-60, -262, -30, -262, 4) + R(-22, -330, 14, 44, 3, '#f2fbfb', 3);
  const cx0 = -15, cy0 = -262, rr = 42, dl = -4, a0 = Math.sqrt(rr * rr - dl * dl);
  bal += Ci(cx0, cy0, rr, '#f2fbfb', 0) + P(`M${F(cx0 - a0)} ${F(cy0 + dl)} A${rr} ${rr} 0 0 0 ${F(cx0 + a0)} ${F(cy0 + dl)} Z`, tq, 0) + Ci(cx0, cy0, rr, 'none', 3) + Ln(cx0 - 22, cy0 - 18, cx0 - 12, cy0 - 28, 4, '#fff');
  s += pop(idade, 0.5, -15, -190, bal, 30);
  s += op(inv(0.9, 1.3, idade), fumaca(-15, -336, idade, { n: 4, r: 10, alt: 100, vento: 20, per: 2.4, cor: '#ffffff' }));
  // erlenmeyer borbulhando
  let er = forma('M78 -300 L102 -300 L102 -262 L138 -202 Q142 -192 132 -192 L48 -192 Q38 -192 42 -202 L78 -262 Z', '#f2fbfb') + P('M60 -232 L120 -232 L136 -204 Q138 -196 130 -196 L50 -196 Q42 -196 44 -204 Z', '#7fd36b', 0) + forma('M78 -300 L102 -300 L102 -262 L138 -202 Q142 -192 132 -192 L48 -192 Q38 -192 42 -202 L78 -262 Z', 'none') + R(72, -308, 36, 10, 4, '#f2fbfb', 3);
  s += pop(idade, 0.6, 90, -190, er, 30);
  const rb = rng(5);
  let bol = '';
  for (let j = 0; j < 7; j++) {
    const ph = rb(), sp = 0.6 + rb() * 0.5, f = (idade * sp + ph) % 1, ox = (rb() - 0.5) * 30;
    const by = -210 - f * 160, bx = 90 + ox * (1 - f * 0.3) + Math.sin(f * 9 + j) * 5;
    bol += Ci(bx, by, 4 + f * 6, f < 0.45 ? '#bff0b0' : '#e9fbe3', 2.5, `opacity="${F(Math.min(1, (1 - f) * 2))}"`);
  }
  s += op(inv(0.9, 1.2, idade), bol);
  // tubos de ensaio
  let tb = caixa(160, -236, 110, 16, 5, K.madeira, { base: 5 }) + R(166, -220, 10, 30, 3, K.madeira, 3) + R(254, -220, 10, 30, 3, K.madeira, 3);
  [tq, K.rosa, K.amarelo, az].forEach((c, i) => { const tx = 172 + i * 24, lv = 26 + 8 * Math.sin(idade * 1.5 + i); tb += R(tx, -282, 16, 70, 8, '#f2fbfb', 0) + R(tx, -212 - lv, 16, lv, 6, c, 0) + R(tx, -282, 16, 70, 8, 'none', 3); });
  tb += caixa(160, -236, 110, 16, 5, K.madeira, { base: 5 });
  s += pop(idade, 0.7, 215, -190, tb, 30);
  return raiz(x, y, o, s);
}

// carrinho fofo (comprimento ~110), base no chão das rodas
function carro(cor, ang) {
  let s = forma('M-56 -12 Q-58 -34 -38 -36 L-24 -36 Q-14 -58 8 -58 L24 -58 Q40 -58 46 -36 Q58 -34 58 -12 Z', cor, 'M-56 -12 L-57 -20 L57 -20 L58 -12 Z');
  s += P('M-18 -38 Q-10 -52 4 -52 L6 -52 L6 -38 Z', K.vidro, 2.5) + P('M14 -52 L22 -52 Q34 -52 38 -38 L14 -38 Z', K.vidro, 2.5);
  for (const wx of [-32, 32]) s += Ci(wx, -10, 13, '#3b3f4c', 3) + Ci(wx, -10, 5, '#d5d0c6', 0) + rot(ang, wx, -10, Ln(wx - 9, -10, wx + 9, -10, 2.5, '#d5d0c6'));
  return s + Ci(52, -26, 4, K.amarelo, 2);
}
export function fabrica(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const nv = K.navy, nv2 = K.navy2, par = '#d7e2ef';
  let s = chao(720) + pop(idade, 0, 0, 0, placa(700, '#b7b9c4'));
  // galpão com telhado dente de serra
  let gal = caixa(-330, -390, 470, 300, 10, par, { lado: 40, base: 0 });
  for (let i = 0; i < 3; i++) { const x0 = -330 + i * 157; gal += forma(`M${x0} -390 L${x0} -456 L${x0 + 157} -390 Z`, nv) + R(x0 + 6, -446, 18, 50, 3, K.vidro, 2.5); }
  gal += R(-330, -392, 470, 16, 4, nv2, 3);
  for (let i = 0; i < 4; i++) gal += R(-300 + i * 64, -350, 44, 40, 6, K.vidro, 3) + Ln(-278 + i * 64, -350, -278 + i * 64, -310, 2.5);
  gal += caixa(-50, -250, 140, 160, 8, '#9fb1c8', { base: 0 });
  for (let i = 0; i < 6; i++) gal += Ln(-46, -232 + i * 24, 86, -232 + i * 24, 2.5);
  s += pop(idade, 0.1, 0, -90, gal, 40);
  // engrenagem girando na fachada
  let eng = '';
  for (let i = 0; i < 8; i++) eng += rot(i * 45, 0, 0, R(-7, -34, 14, 14, 3, K.amarelo, 3));
  eng = Ci(0, 0, 26, K.amarelo, 3) + eng + Ci(0, 0, 26, K.amarelo, 0) + Ci(0, 0, 9, nv, 3);
  s += pop(idade, 0.5, -200, -200, mv(-200, -200, g(`rotate(${F(idade * 40)})`, eng)));
  // chaminé com fumaça
  s += pop(idade, 0.3, 110, -390, caixa(90, -510, 44, 122, 6, nv, { lado: 10 }) + R(84, -520, 56, 16, 5, nv2, 3) + R(90, -470, 44, 12, 0, K.vermelho, 3), 30);
  s += op(inv(0.8, 1.2, idade), fumaca(112, -526, idade, { n: 5, r: 16, alt: 140, vento: 50, per: 2.8 }));
  // esteira
  const v = 80, ang = (idade * v / 13) * 57.3;
  let est = '';
  for (const lx of [-280, -100, 80, 260]) est += R(lx - 8, -96, 16, 96, 4, '#8d93a3', 3);
  est += caixa(-320, -134, 640, 40, 20, '#3b3f4c', { base: 0 });
  for (let i = 0; i < 15; i++) { const rx = -296 + i * 42; est += Ci(rx, -114, 13, '#8d93a3', 2.5) + rot(ang, rx, -114, Ln(rx - 9, -114, rx + 9, -114, 3, '#4b5163')); }
  est += Ln(-300, -134, 300, -134, 4, '#6f7687', `stroke-dasharray="16 14" stroke-dashoffset="${F(-idade * v)}"`);
  s += pop(idade, 0.2, 0, 0, est, 30);
  // carrinhos andando pela esteira
  let cs = '';
  const cores = ['#f4f6fa', K.azul, K.amarelo, K.vermelho];
  for (let k = 0; k < 4; k++) {
    const px = -380 + ((idade * v + k * 220) % 880);
    const a = clamp((px + 330) / 50) * clamp((330 - px) / 50);
    if (a > 0) cs += op(a, mv(px, -136, carro(cores[k], idade * v / 13 * 57.3)));
  }
  s += op(inv(0.7, 1, idade), cs);
  // braço robótico soldando
  const a1 = -118 + Math.sin(idade * 1.8) * 8, a2 = 70 + Math.sin(idade * 1.8 + 1) * 14;
  const j1 = [262, -170], r1 = a1 * Math.PI / 180, j2 = [j1[0] + Math.cos(r1) * 100, j1[1] + Math.sin(r1) * 100];
  const r2 = (a1 + a2) * Math.PI / 180, tip = [j2[0] + Math.cos(r2) * 80, j2[1] + Math.sin(r2) * 80];
  let br = caixa(232, -170, 60, 36, 8, K.laranja, { base: 7 }) + Ln(j1[0], j1[1], j2[0], j2[1], 26) + Ln(j1[0], j1[1], j2[0], j2[1], 20, K.laranja) + Ln(j2[0], j2[1], tip[0], tip[1], 20) + Ln(j2[0], j2[1], tip[0], tip[1], 14, K.laranja);
  br += Ci(j1[0], j1[1], 13, '#4b5163', 3) + Ci(j2[0], j2[1], 11, '#4b5163', 3) + Ci(tip[0], tip[1], 9, '#4b5163', 3);
  const fa = Math.sin(idade * 23) > 0.2;
  if (idade > 1 && fa) for (let i = 0; i < 6; i++) { const aa = i * 1.05 + idade * 5; br += Ln(tip[0] + Math.cos(aa) * 12, tip[1] + 10 + Math.sin(aa) * 12, tip[0] + Math.cos(aa) * 24, tip[1] + 10 + Math.sin(aa) * 24, 3.5, K.amarelo); }
  s += pop(idade, 0.45, 262, -134, br, 0);
  return raiz(x, y, o, s);
}

function trator(ang) {
  let s = Ln(-30, -100, -30, -150, 9) + Ln(-30, -100, -30, -150, 5, '#6f7687');
  s += forma('M-96 -40 L-96 -96 Q-96 -104 -88 -104 L-10 -104 L-10 -40 Z', '#3e9a50', 'M-96 -40 L-96 -54 L-10 -54 L-10 -40 Z');
  s += forma('M-14 -40 L-14 -168 Q-14 -176 -6 -176 L72 -176 Q80 -176 80 -168 L80 -40 Z', '#3e9a50', 'M58 -176 L72 -176 Q80 -176 80 -168 L80 -40 L58 -40 Z');
  s += R(-2, -164, 68, 64, 8, K.vidro, 3) + Ln(8, -126, 24, -150, 4, 'rgba(255,255,255,.85)') + R(-20, -182, 108, 14, 6, '#3e9a50', 3);
  s += R(-96, -70, 86, 10, 3, K.amarelo, 0) + R(-96, -40, 176, 10, 3, '#2f7b3e', 3);
  const roda = (wx, wy, r) => Ci(wx, wy, r, '#3b3f4c', 3) + Ci(wx, wy, r * 0.55, K.amarelo, 3) + rot(ang, wx, wy, Ln(wx - r * 0.8, wy, wx - r * 0.6, wy, 5, '#3b3f4c') + Ln(wx + r * 0.6, wy, wx + r * 0.8, wy, 5, '#3b3f4c') + Ln(wx, wy - r * 0.8, wx, wy - r * 0.6, 5, '#3b3f4c') + Ln(wx, wy + r * 0.6, wx, wy + r * 0.8, 5, '#3b3f4c')) + Ci(wx, wy, r * 0.18, '#3b3f4c', 0);
  return s + roda(-70, -28, 28) + roda(40, -50, 50);
}
export function fazenda(x, y, idade, o = {}) {
  if (idade < 0) return '';
  let s = chao(760) + pop(idade, 0, 0, 0, placa(740, '#c9a77c'));
  // colina com plantação
  let col = forma('M-370 -8 L-370 -150 Q-200 -270 -10 -210 Q170 -150 370 -250 L370 -8 Z', K.grama);
  for (let i = 0; i < 9; i++) {
    const x0 = -340 + i * 80;
    for (let j = 0; j < 3; j++) {
      const yy = -40 - j * 44 - (i * 6) % 18, sw = Math.sin(idade * 2 + i + j) * 3;
      col += rot(sw, x0 + j * 12, yy, P(`M${x0 + j * 12} ${yy} q-8 -18 0 -30 q8 12 0 30 Z`, '#5cb85c', 2.5) + P(`M${x0 + j * 12 + 4} ${yy} q10 -12 18 -10 q-6 10 -18 10 Z`, '#4aa04a', 2.5));
    }
  }
  s += pop(idade, 0.05, 0, -8, col, 0);
  // celeiro
  let cel = forma('M70 -8 L70 -230 L300 -230 L300 -8 Z', K.tijolo, 'M262 -230 L300 -230 L300 -8 L262 -8 Z');
  cel += forma('M56 -222 L84 -300 L185 -350 L286 -300 L314 -222 Z', '#8e3b30') + Ln(84, -300, 286, -300, 3);
  cel += R(150, -296, 70, 44, 6, K.creme, 3) + Ln(150, -274, 220, -274) + Ln(185, -296, 185, -252);
  cel += R(120, -130, 130, 122, 4, K.creme, 3) + R(130, -120, 110, 102, 2, K.tijolo, 3) + Ln(130, -120, 240, -18, 6, K.creme) + Ln(240, -120, 130, -18, 6, K.creme) + R(130, -120, 110, 102, 2, 'none', 3);
  s += pop(idade, 0.18, 185, -8, cel, 40);
  // silo
  s += pop(idade, 0.3, 335, -8, caixa(308, -330, 60, 322, 6, '#cfd6df', { lado: 14, base: 0 }) + Ln(308, -250, 368, -250) + Ln(308, -170, 368, -170) + Ln(308, -90, 368, -90) + P('M304 -330 Q338 -384 372 -330 Z', '#8e3b30', 3), 40);
  // trator indo e voltando
  const dx = Math.sin(idade * 0.7) * 26, angT = (dx / 50) * 57.3;
  const bob = Math.abs(Math.sin(idade * 9)) * 2;
  s += pop(idade, 0.45, -60, -8, mv(-70 + dx, -8 - bob, g('scale(-1 1)', trator(-angT))), 30);
  s += op(inv(1, 1.3, idade), fumaca(-40 + dx, -162, idade, { n: 4, r: 9, alt: 90, vento: 30, per: 1.8, cor: '#e9ecef' }));
  // placa ARGENTINA + mapinha com linha de fronteira só como referência
  let pl = R(-312, -150, 12, 142, 4, K.madeira2, 3) + caixa(-370, -168, 128, 40, 8, K.madeira, { base: 7 });
  pl += T('ARGENTINA', -306, -141, 18, INK, { weight: 900, ls: 1 });
  let mapa = caixa(-372, -282, 132, 100, 8, K.papel, { base: 6 });
  mapa += P('M-362 -272 Q-330 -270 -312 -252 Q-300 -230 -306 -192 L-362 -192 Z', '#d7ecc4', 0) + P('M-312 -252 Q-300 -230 -306 -192 L-250 -192 L-250 -272 L-330 -272', '#f5e3b5', 0);
  mapa += P('M-322 -270 Q-302 -248 -308 -226 Q-312 -208 -304 -194', 'none', 3, 'stroke-dasharray="7 6"', K.vermelho);
  mapa += P('M-346 -210 Q-320 -246 -278 -236', 'none', 3, `pathLength="1" stroke-dasharray="0.04 0.05" opacity=".9"`, K.navy);
  mapa += P('M-278 -236 m0 -14 c-8 0 -12 6 -12 11 c0 8 12 18 12 18 c0 0 12 -10 12 -18 c0 -5 -4 -11 -12 -11 Z', K.vermelho, 2.5) + Ci(-278, -239, 3.5, '#fff', 0);
  mapa += R(-372, -282, 132, 100, 8, 'none', 3);
  s += pop(idade, 0.6, -306, -8, pl, 20) + pop(idade, 0.8, -306, -182, rot(-4, -306, -232, mapa), 0);
  return raiz(x, y, o, s);
}

function satelite() {
  let s = R(-62, -12, 40, 24, 3, K.azul, 2.5) + R(22, -12, 40, 24, 3, K.azul, 2.5) + Ln(-42, -12, -42, 12, 2) + Ln(42, -12, 42, 12, 2) + Ln(-22, 0, -14, 0, 3) + Ln(14, 0, 22, 0, 3);
  s += caixa(-15, -15, 30, 30, 6, K.amarelo, { base: 6 }) + Ln(0, -15, 0, -26, 3) + Ci(0, -28, 4, K.vermelho, 2);
  return s;
}
export function estacao(x, y, idade, o = {}) {
  if (idade < 0) return '';
  let s = chao(640) + pop(idade, 0, 0, 0, placa(620, '#b7b9c4'));
  // cartão de céu estrelado
  let ceu = caixa(-300, -510, 600, 440, 30, '#25336d', { base: 0 });
  const rb = rng(19);
  for (let i = 0; i < 34; i++) {
    const sx = -280 + rb() * 560, sy = -490 + rb() * 360, r = 1.5 + rb() * 2.5, tw = 0.5 + 0.5 * Math.sin(idade * (2 + rb() * 3) + i);
    ceu += i % 6 === 0 ? P(`M${F(sx)} ${F(sy - 9)} Q${F(sx)} ${F(sy)} ${F(sx + 9)} ${F(sy)} Q${F(sx)} ${F(sy)} ${F(sx)} ${F(sy + 9)} Q${F(sx)} ${F(sy)} ${F(sx - 9)} ${F(sy)} Q${F(sx)} ${F(sy)} ${F(sx)} ${F(sy - 9)} Z`, '#fff3c4', 0, `opacity="${F(0.5 + 0.5 * tw)}"`) : Ci(sx, sy, r, '#fff', 0, `opacity="${F(0.35 + 0.6 * tw)}"`);
  }
  ceu += Ci(-200, -420, 36, K.laranja, 3) + P('M-224 -440 Q-200 -436 -190 -416', 'none', 3, '', tom(K.laranja, 0.25)) + E(-200, -420, 62, 14, 'none', 3, 'transform="rotate(-18 -200 -420)"');
  ceu += P('M224 -470 A28 28 0 1 0 248 -430 A22 22 0 1 1 224 -470 Z', '#f6f1dc', 3);
  s += pop(idade, 0.05, 0, -290, ceu, 0, 0.5);
  // órbita e satélite
  const ox = 20, oy = -360, rx = 220, ry = 70, ri = -10 * Math.PI / 180;
  s += op(inv(0.4, 0.8, idade), E(ox, oy, rx, ry, 'none', 2.5, `stroke-dasharray="8 10" transform="rotate(-10 ${ox} ${oy})" opacity=".8"`, '#9fb3ff'));
  const th = idade * 0.8 + 0.6;
  const ex = rx * Math.cos(th), ey = ry * Math.sin(th);
  const sx = ox + ex * Math.cos(ri) - ey * Math.sin(ri), sy = oy + ex * Math.sin(ri) + ey * Math.cos(ri);
  // antena parabólica sobre a estação
  let est = caixa(-10, -130, 230, 122, 10, '#eef0f4', { lado: 26, base: 0 }) + R(-10, -138, 230, 14, 5, '#9fb1c8', 3);
  est += R(16, -100, 44, 34, 5, K.vidro, 3) + R(80, -100, 44, 34, 5, K.vidro, 3) + R(150, -82, 42, 74, 5, '#9fb1c8', 3);
  est += R(-60, -280, 8, 272, 3, '#8d93a3', 3) + Ci(-56, -288, 8, Math.sin(idade * 5) > 0 ? K.vermelho : '#7a2a26', 2.5);
  s += pop(idade, 0.2, 100, -8, est, 30);
  const dxs = sx - 90, dys = sy - (-190), ang = clamp(Math.atan2(dxs, -dys) * 57.3, -50, 50);
  let dish = R(80, -190, 20, 54, 4, '#8d93a3', 3) + Ci(90, -190, 9, '#6f7687', 3);
  dish += g(`rotate(${F(ang)} 90 -190)`, P('M30 -196 A60 34 0 0 0 150 -196 Z', '#f4f6fa', 3) + P('M38 -190 A54 26 0 0 0 142 -190', 'none', 0) + Ln(90, -196, 90, -250, 4) + Ln(60, -196, 90, -250, 2.5) + Ln(120, -196, 90, -250, 2.5) + Ci(90, -252, 6, K.amarelo, 2.5));
  s += pop(idade, 0.35, 90, -136, dish, 20);
  // sinal da antena até o satélite
  if (idade > 1.1) {
    const fx = 90 + Math.sin(ang / 57.3) * 62, fy = -190 - Math.cos(ang / 57.3) * 62;
    const dd = Math.hypot(sx - fx, sy - fy), aa = Math.atan2(sy - fy, sx - fx) * 57.3;
    let sig = '';
    for (let j = 0; j < 3; j++) { const f = (idade * 0.9 + j / 3) % 1; sig += P(`M${F(f * dd)} -14 Q${F(f * dd + 10)} 0 ${F(f * dd)} 14`, 'none', 4, `opacity="${F(Math.sin(f * Math.PI))}"`, '#9fe3ff'); }
    s += g(`translate(${F(fx)} ${F(fy)}) rotate(${F(aa)})`, sig);
  }
  s += pop(idade, 0.6, sx, sy, mv(sx, sy, g(`rotate(${F(Math.sin(idade * 1.2) * 10 - 12)})`, satelite())));
  return raiz(x, y, o, s);
}

// bloquinho de montar (studs em cima)
const bloco = (bx, by, w, h, cor) => R(bx + 10, by - 9, 16, 11, 3, cor, 2.5) + R(bx + w - 26, by - 9, 16, 11, 3, cor, 2.5) + caixa(bx, by, w, h, 5, cor, { base: 7 });
export function obra(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const am = K.amarelo;
  let s = chao(720) + pop(idade, 0, 0, 0, placa(700, '#c9b08f'));
  // guindaste (mastro treliçado + lança)
  let gr = caixa(186, -480, 30, 472, 4, am, { base: 0, lado: 8 });
  for (let yy = -8, k = 0; yy > -470; yy -= 34, k++) gr += Ln(k % 2 ? 188 : 214, yy, k % 2 ? 214 : 188, yy - 34, 2.5);
  gr += R(-250, -496, 560, 22, 4, am, 3);
  for (let xx = -246, k = 0; xx < 300; xx += 30, k++) gr += Ln(xx, k % 2 ? -494 : -476, xx + 30, k % 2 ? -476 : -494, 2.5);
  gr += P('M190 -496 L201 -540 L212 -496', 'none', 4) + Ln(201, -540, -240, -496, 2) + Ln(201, -540, 300, -496, 2);
  gr += caixa(256, -474, 48, 50, 5, '#8d93a3', { base: 8 }) + caixa(214, -470, 46, 40, 8, K.azul, { base: 6 }) + R(222, -462, 26, 18, 4, K.vidro, 2.5);
  s += pop(idade, 0.15, 200, -8, gr, 0, 0.5);
  // prédio em construção
  let pr = caixa(-232, -168, 344, 160, 6, K.tijolo, { base: 0, lado: 0 });
  pr = R(-232, -168, 344, 160, 6, K.tijolo, 0) + tijolos(-232, -168, 344, 160) + R(-232, -168, 344, 160, 6, 'none', 3);
  pr += caixa(-196, -138, 70, 60, 4, K.vidro, { base: 0 }) + caixa(-26, -138, 70, 60, 4, K.vidro, { base: 0 }) + R(-110, -100, 60, 92, 4, K.madeira, 3);
  pr += R(-246, -186, 372, 18, 4, '#cfc6b8', 3);
  for (const cx of [-228, -64, 96]) pr += R(cx, -320, 18, 134, 3, '#bdb3a4', 3);
  pr += R(-210, -254, 146, 68, 0, K.tijolo, 0) + tijolos(-210, -254, 146, 68) + R(-210, -254, 146, 68, 0, 'none', 3);
  pr += R(-246, -334, 372, 16, 4, '#cfc6b8', 3);
  s += pop(idade, 0.05, -60, -8, pr, 30);
  // andaime na frente à esquerda
  let an = '';
  for (const ax of [-268, -186]) an += R(ax - 4, -300, 8, 292, 3, '#8d93a3', 2.5);
  for (const ay of [-100, -200, -290]) an += R(-282, ay, 112, 12, 3, K.madeira, 2.5);
  an += Ln(-264, -100, -190, -200, 3, '#8d93a3') + Ln(-190, -100, -264, -200, 3, '#8d93a3');
  s += pop(idade, 0.3, -226, -8, an, 20);
  // blocos que se encaixam: o guindaste leva um bloco a cada ciclo
  const cores = [K.laranja, K.azul, K.verde, am], bw = 72, bh = 32, per = 2.4, t0 = 1.0;
  const slot = k => -230 + 12 + k * (bw + 12);
  const k = Math.floor((idade - t0) / per), u = ((idade - t0) % per) / per;
  let blocos = '';
  for (let j = 0; j < 4; j++) {
    const posto = idade - t0 >= j * per + per * 0.55;
    if (posto) { const q = inv(j * per + per * 0.55, j * per + per * 0.7, idade - t0); blocos += g(`translate(${F(slot(j) + bw / 2)} -334) scale(${F(1 + 0.12 * Math.sin(q * Math.PI))} ${F(1 - 0.12 * Math.sin(q * Math.PI))}) translate(${F(-slot(j) - bw / 2)} 334)`, bloco(slot(j), -334 - bh, bw, bh, cores[j])); }
  }
  s += blocos;
  let tx = 270, hy = -380, leva = true;
  if (idade >= t0 && k < 4) {
    const alvo = slot(k) + bw / 2;
    if (u < 0.3) { tx = lerp(270, alvo, ease.inOut(u / 0.3)); }
    else if (u < 0.55) { tx = alvo; hy = lerp(-380, -334 - bh, ease.inOut((u - 0.3) / 0.25)); }
    else { tx = alvo; leva = false; hy = lerp(-334 - bh, -400, ease.out((u - 0.55) / 0.45)); if (u > 0.75) tx = lerp(alvo, 270, ease.inOut((u - 0.75) / 0.25)); hy = u > 0.75 ? -400 : hy; }
    if (u > 0.85) { leva = true; hy = lerp(-400, -380, (u - 0.85) / 0.15); }
  } else if (k >= 4) { leva = false; hy = -400; }
  const balanco = Math.sin(idade * 2.4) * 4;
  let gan = R(tx - 16, -476, 32, 12, 3, '#6f7687', 2.5) + Ln(tx, -464, tx + balanco, hy - 10, 2.5) + P(`M${F(tx + balanco - 6)} ${F(hy - 12)} h12 v6 q0 8 -6 8`, 'none', 3);
  if (leva && k < 4) gan += bloco(tx + balanco - bw / 2, hy, bw, bh, cores[Math.max(0, Math.min(3, k < 0 ? 0 : k))]);
  s += op(inv(0.5, 0.8, idade), gan);
  // cones e paleta de blocos
  s += pop(idade, 0.5, 270, -8, R(226, -24, 96, 16, 3, K.madeira, 3) + bloco(232, -58, 40, 32, K.laranja) + bloco(276, -58, 40, 32, K.azul));
  for (const cx of [140, 168]) s += pop(idade, 0.6, cx, -8, P(`M${cx - 14} -8 L${cx - 4} -48 L${cx + 4} -48 L${cx + 14} -8 Z`, K.laranja, 3) + Ln(cx - 9, -26, cx + 9, -26, 5, '#fff'));
  return raiz(x, y, o, s);
}

// Mosaico: 6 molduras que chegam espalhadas e se acomodam em grade 3x2.
// quadros: 6 strings SVG desenhadas em 1920x1080 (cada uma é reduzida para a moldura).
// o: cx, cy (centro da grade), w (moldura, 520), gap (40), aperto (0–1: junta e reduz; padrão automático aos 2,2 s), rotulos (6 textos), escala
export function mosaico(idade, quadros = [], o = {}) {
  if (idade < 0) return '';
  const fw = o.w ?? 520, fh = fw * 9 / 16, cx = o.cx ?? 960, cy = o.cy ?? 540;
  const ap = clamp(o.aperto ?? ease.inOut(inv(2.2, 3, idade)));
  const gap = lerp(o.gap ?? 40, 16, ap), es = lerp(1, o.escalaFinal ?? 0.86, ap);
  const rnd = rng(3);
  let s = '';
  for (let i = 0; i < 6; i++) {
    const c = i % 3, r = Math.floor(i / 3);
    const gx = cx + (c - 1) * (fw + 24 + gap) * es, gy = cy + (r - 0.5) * (fh + 24 + gap) * es;
    const a = 0.08 * i, u = ease.out5(inv(a, a + 0.9, idade));
    const ang = (rnd() - 0.5) * 60, dist = 900 + rnd() * 300;
    const sx = 960 + Math.cos(ang / 57.3 + (c - 1) * 0.9 + (r ? Math.PI : 0)) * dist * 0.6, sy = 540 + (r ? 1 : -1) * dist * 0.5;
    const px = lerp(sx, gx, u), py = lerp(sy, gy, u), rr = lerp((rnd() - 0.5) * 24, (rnd() - 0.5) * 3 * (1 - ap), u), sc = lerp(1.8, 1, u) * es;
    const clip = `pf-mos-${i}`;
    let m = `<clipPath id="${clip}"><rect x="${F(-fw / 2)}" y="${F(-fh / 2)}" width="${F(fw)}" height="${F(fh)}" rx="10"/></clipPath>`;
    m += R(-fw / 2 - 12 + 8, -fh / 2 - 12 + 12, fw + 24, fh + 24, 20, 'rgba(60,35,15,.2)', 0);
    m += R(-fw / 2 - 12, -fh / 2 - 12, fw + 24, fh + 24, 20, K.papel, 3);
    m += g('', `<rect x="${F(-fw / 2)}" y="${F(-fh / 2)}" width="${F(fw)}" height="${F(fh)}" fill="${C.bg}"/>` + g(`translate(${F(-fw / 2)} ${F(-fh / 2)}) scale(${F(fw / 1920)})`, quadros[i] ?? ''), `clip-path="url(#${clip})"`);
    m += R(-fw / 2, -fh / 2, fw, fh, 10, 'none', 3);
    if (o.rotulos?.[i]) { const tw = o.rotulos[i].length * fw * 0.03 + fw * 0.08; m += R(-fw / 2 + fw * 0.03, fh / 2 - fw * 0.11, tw, fw * 0.08, fw * 0.025, INK, 0) + T(o.rotulos[i], -fw / 2 + fw * 0.03 + fw * 0.04, fh / 2 - fw * 0.05, fw * 0.045, '#fff', { anchor: 'start', weight: 900 }); }
    s += op(inv(a, a + 0.15, idade), g(tr(px, py, sc, rr), m));
  }
  return s;
}

// =====================================================================
// CENA 4 — slides do framework e entregáveis
// =====================================================================
// PLACEHOLDER: estes slides serão SUBSTITUÍDOS pelos slides reais 7 (integrada), 9 (mits),
// 10 (remediacao) e 11 (ia) do framework A&M + TOTVS assim que forem aprovados.
// Nada aqui é dado real: sem números, prazos ou SLAs.
// slide(tipo, x, y, w, h, idade, o) — (x, y) = centro. o: titulo, zoom (0–1, só 'integrada': aproxima a interseção),
//   destaque (0–1, 'mits': posição do foco na régua), etiqueta (mostra "SLIDE n"), escala
const SLIDE = { integrada: ['Visão integrada', 7], mits: ['Ciclo de vida das MITs', 9], remediacao: ['Remediação', 10], ia: ['Ferramentas + IA', 11] };
export function slide(tipo, x, y, w = 1100, h = 620, idade = 0, o = {}) {
  if (idade < 0) return '';
  const X = -w / 2, Y = -h / 2;
  let s = R(X + 12, Y + 16, w, h, 22, 'rgba(60,35,15,.18)', 0) + caixa(X, Y, w, h, 22, K.papel, { base: 0 });
  s += R(X + 40, Y + 40, 10, 44, 5, C.blue, 0) + T(o.titulo ?? SLIDE[tipo][0], X + 66, Y + 76, 40, INK, { anchor: 'start', weight: 900 });
  s += R(X + 40, Y + h - 40, w - 80, 4, 2, '#e6dcc6', 0);
  if (o.etiqueta) s += R(X + w - 150, Y + 40, 110, 36, 10, 'none', 2.5, 'stroke-dasharray="6 5"') + T('SLIDE ' + SLIDE[tipo][1], X + w - 95, Y + 65, 18, C.soft, { weight: 800 });
  const cx = 0, cy = 40;
  let c = '';
  if (tipo === 'integrada') {
    const r = h * 0.3, dx = r * 0.62, u = ease.out(inv(0.15, 0.8, idade)), d = lerp(r * 1.6, dx, u);
    const cl = id('int', x, y);
    const p = 0.5 + 0.5 * Math.sin(idade * 3);
    c += Ci(cx - d, cy, r, '#dbe6f5', 3) + Ci(cx + d, cy, r, '#d3f0f3', 3);
    c += `<clipPath id="${cl}"><circle cx="${F(cx - d)}" cy="${F(cy)}" r="${F(r)}"/></clipPath>`;
    c += g('', Ci(cx + d, cy, r, K.amarelo, 0) + Ci(cx, cy, r * 0.5, '#fff', 0, `opacity="${F(0.15 + 0.2 * p * inv(0.8, 1.1, idade))}" filter="url(#pf-glow2)"`), `clip-path="url(#${cl})"`);
    c += Ci(cx - d, cy, r, 'none', 3) + Ci(cx + d, cy, r, 'none', 3);
    c += T('A&M', cx - d - r * 0.42, cy + 14, 44, C.navy2, { weight: 900 }) + T('TOTVS', cx + d + r * 0.42, cy + 14, 44, '#127f93', { weight: 900 });
    c += op(inv(0.8, 1, idade), Ci(cx, cy, 30, '#fff', 3) + P(`M${cx - 14} ${cy + 2} l9 9 l19 -21`, 'none', 6, '', C.green));
    const z = ease.inOut(clamp(o.zoom ?? 0));
    if (z > 0) c = g(`translate(${F(cx)} ${F(cy)}) scale(${F(1 + 1.3 * z)}) translate(${F(-cx)} ${F(-cy)})`, c);
  } else if (tipo === 'mits') {
    const bw = w - 200, x0 = -bw / 2, by = cy + 70;
    const seg3 = [['BAIXA', '#bfe6cf', C.green], ['MÉDIA', '#ffe7b0', C.amber], ['ALTA', '#f8c9c4', C.red]];
    c += T('COMPLEXIDADE', x0, by - 32, 20, C.soft, { anchor: 'start', weight: 800, ls: 2 });
    seg3.forEach(([nm, f, k], i) => {
      const sx = x0 + i * bw / 3, u = inv(0.2 + i * 0.12, 0.5 + i * 0.12, idade);
      c += op(u, R(sx + 4, by, bw / 3 - 8, 64, 14, f, 3) + T(nm, sx + bw / 6, by + 42, 26, k, { weight: 900 }));
    });
    const dz = clamp(o.destaque ?? ((idade * 0.35) % 1)), hx = x0 + dz * (bw - bw / 3);
    c += op(inv(0.8, 1, idade), R(hx - 4, by - 10, bw / 3 + 8, 84, 18, 'none', 6, '', C.blue));
    // cartões MIT andando no ciclo: dono (avatar) + rastreio (check)
    for (let i = 0; i < 4; i++) {
      const f = (idade * 0.18 + i / 4) % 1, mx = x0 + f * bw, my = cy - 110;
      c += op(Math.sin(f * Math.PI) * inv(0.6, 0.9, idade), mv(mx, my, caixa(-56, -34, 112, 68, 12, '#fff', { base: 6 }) + Ci(-30, -6, 13, K.azul, 2.5) + R(-10, -14, 50, 8, 4, '#d9c9aa', 0) + R(-10, 0, 34, 8, 4, '#e6dcc6', 0) + (f > 0.6 ? Ci(40, -24, 11, C.green, 2.5) + P('M35 -24 l4 4 l7 -8', 'none', 3, '', '#fff') : '')));
    }
    c += Ln(x0, cy - 110 + 46, x0 + bw, cy - 110 + 46, 3, '#cbbd9f', 'stroke-dasharray="8 10"');
  } else if (tipo === 'remediacao') {
    const n = 5, x0 = -w / 2 + 130, dxp = (w - 260) / (n - 1), py = cy;
    const prog = clamp((idade - 0.4) / 2.2);
    c += Ln(x0, py, x0 + dxp * (n - 1), py, 10, '#e6dcc6') + Ln(x0, py, lerp(x0, x0 + dxp * (n - 1), prog), py, 10, C.blue);
    for (let i = 0; i < n; i++) {
      const px = x0 + i * dxp, on = prog * (n - 1) >= i - 0.01;
      let ic = '';
      if (i === 0) ic = Ci(0, 0, 54, '#f8c9c4', 3) + R(-16, -22, 11, 44, 4, C.red, 0) + R(5, -22, 11, 44, 4, C.red, 0);
      else if (i === n - 1) ic = Ci(0, 0, 54, on ? '#bfe6cf' : '#eee6d6', 3) + P('M-12 24 L-12 -26 L22 -14 L-12 -2', on ? C.green : '#cbbd9f', 3);
      else ic = Ci(0, 0, 38, on ? '#dbe6f5' : '#f3ecdc', 3) + (i === 1 ? Ci(-4, -4, 12, 'none', 4) + Ln(4, 4, 14, 14, 4) : i === 2 ? P('M-14 12 L8 -10 M4 -16 a8 8 0 1 0 10 10', 'none', 5) : R(-14, -14, 28, 28, 6, 'none', 3.5) + P('M-7 0 l5 5 l9 -10', 'none', 3.5));
      c += pop(idade, 0.1 + i * 0.1, px, py, mv(px, py, ic));
    }
    c += T('PROJETO', x0, py + 96, 24, C.red, { weight: 900 }) + T('PARADO', x0, py + 124, 24, C.red, { weight: 900 }) + T('GO-LIVE', x0 + dxp * (n - 1), py + 100, 26, C.green, { weight: 900 });
    c += mv(lerp(x0, x0 + dxp * (n - 1), prog), py - 78, P('M-14 -20 h28 v18 l-14 14 l-14 -14 Z', C.blue, 3));
  } else if (tipo === 'ia') {
    const nomes = ['Claude', 'Luria', 'Xray', 'DataHub'], cw = (w - 200) / 4;
    const icones = [
      P('M0 -26 Q0 0 26 0 Q0 0 0 26 Q0 0 -26 0 Q0 0 0 -26 Z', C.orange, 3),
      P('M-24 -18 h48 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-28 l-14 12 v-12 h-6 a8 8 0 0 1 -8 -8 v-22 a8 8 0 0 1 8 -8 Z', K.azul, 3) + Ci(-12, 1, 3.5, '#fff', 0) + Ci(0, 1, 3.5, '#fff', 0) + Ci(12, 1, 3.5, '#fff', 0),
      Ci(-6, -6, 18, '#d3f0f3', 3.5) + Ln(-16, -8, 4, -8, 3, C.cyan) + Ln(-14, -1, 2, -1, 3, C.cyan) + Ln(7, 7, 22, 22, 6),
      E(0, -18, 22, 8, K.verde, 3) + P('M-22 -18 v32 a22 8 0 0 0 44 0 v-32', K.verde, 3) + P('M-22 -2 a22 8 0 0 0 44 0', 'none', 3) + E(0, -18, 22, 8, K.verde, 3),
    ];
    const ly = cy + 150;
    c += Ln(-w / 2 + 100, ly, w / 2 - 100, ly, 6, '#e6dcc6');
    const pr = (idade * 0.4) % 1;
    c += op(inv(1, 1.3, idade), Ci(-w / 2 + 100 + pr * (w - 200), ly, 10, C.blue, 0, 'filter="url(#pf-glow2)"') + Ci(-w / 2 + 100 + pr * (w - 200), ly, 7, C.blue, 2.5));
    nomes.forEach((nm, i) => {
      const px = -w / 2 + 100 + cw * (i + 0.5);
      let cd = Ln(0, 70, 0, ly - cy, 3, '#cbbd9f', 'stroke-dasharray="6 7"') + Ci(0, ly - cy, 12, '#fff', 3);
      cd += caixa(-cw / 2 + 16, -90, cw - 32, 160, 20, '#fff', { base: 10 }) + Ci(0, -32, 40, '#f6efe0', 0) + mv(0, -32, icones[i]);
      cd += T(nm, 0, 44, 30, INK, { weight: 900 });
      c += pop(idade, 0.15 + i * 0.12, px, cy, mv(px, cy - 30, cd));
    });
  }
  const cs = id('sl' + tipo, x, y);
  s += `<clipPath id="${cs}"><rect x="${F(X)}" y="${F(Y + 100)}" width="${F(w)}" height="${F(h - 140)}"/></clipPath>` + g('', c, `clip-path="url(#${cs})"`);
  return g(tr(x, y, ease.back(inv(0, 0.4, idade)) * (o.escala ?? 1), o.rot ?? 0), s);
}

// Janela de apresentação que fecha e vira cockpit de dashboards (layout sem números, eixos ou valores).
// (x, y) = centro. o: troca (s em que o PPT fecha, padrão 1,8), cursor (0/1), escala
export function pptParaDashboard(x, y, w = 1000, h = 600, idade = 0, o = {}) {
  if (idade < 0) return '';
  const tc = o.troca ?? 1.8, X = -w / 2, Y = -h / 2;
  let s = '';
  // --- PPT ---
  const fecha = inv(tc, tc + 0.35, idade);
  if (fecha < 1) {
    let p = R(X + 12, Y + 16, w, h, 20, 'rgba(60,35,15,.18)', 0) + caixa(X, Y, w, h, 20, '#f3efe8', { base: 0 });
    p += R(X, Y, w, 50, 20, '#d0623e', 0) + R(X, Y + 26, w, 24, 0, '#d0623e', 0) + R(X, Y, w, h, 20, 'none', 3) + Ln(X, Y + 50, X + w, Y + 50);
    p += R(X + 24, Y + 18, 140, 14, 7, 'rgba(255,255,255,.7)', 0);
    const hov = inv(tc - 0.5, tc - 0.2, idade);
    p += R(X + w - 54, Y + 10, 34, 30, 8, hov > 0 ? '#b83d2a' : 'rgba(255,255,255,.25)', 0) + Ln(X + w - 44, Y + 18, X + w - 30, Y + 32, 3.5, '#fff') + Ln(X + w - 30, Y + 18, X + w - 44, Y + 32, 3.5, '#fff');
    for (let i = 0; i < 4; i++) p += R(X + 20, Y + 70 + i * 120, 150, 100, 8, i === 1 ? '#fff' : '#faf7f2', i === 1 ? 4 : 2.5, '', i === 1 ? '#d0623e' : INK) + R(X + 36, Y + 88 + i * 120, 80, 9, 4.5, '#d9c9aa', 0);
    const SX = X + 196, SY = Y + 74, SW = w - 220, SH = h - 98;
    p += R(SX, SY, SW, SH, 10, '#fff', 3) + R(SX + 40, SY + 40, SW * 0.45, 26, 13, '#d0623e', 0);
    for (let i = 0; i < 4; i++) p += Ci(SX + 52, SY + 120 + i * 56, 7, '#cbbd9f', 0) + R(SX + 72, SY + 112 + i * 56, SW * (0.5 - (i % 2) * 0.12), 16, 8, '#e6dcc6', 0);
    p += R(SX + SW - 250, SY + 110, 200, 200, 14, '#f6efe0', 2.5) + P(`M${SX + SW - 220} ${SY + 280} L${SX + SW - 170} ${SY + 210} L${SX + SW - 130} ${SY + 240} L${SX + SW - 80} ${SY + 150}`, 'none', 5, '', '#d0623e');
    if ((o.cursor ?? 1) && idade > tc - 1.2) {
      const cu = ease.inOut(inv(tc - 1.2, tc - 0.4, idade)), cx = lerp(X + w * 0.5, X + w - 30, cu), cy = lerp(Y + h * 0.6, Y + 30, cu);
      const clk = bump(idade, tc - 0.35, 0.25);
      p += g(tr(cx, cy, 1 - 0.15 * clk), P('M0 0 L0 30 L8 23 L14 36 L20 33 L14 21 L25 21 Z', '#fff', 3));
    }
    s += g(`scale(${F(1 + 0.04 * fecha)} ${F(Math.max(0.001, 1 - ease.in(fecha)))})`, op(1 - fecha * 0.6, p));
  }
  // --- cockpit ---
  const ab = idade - tc - 0.25;
  if (ab > 0) {
    const nv = '#16284d', card = '#21396a', lin = '#3d5a91';
    let d = R(X + 12, Y + 16, w, h, 22, 'rgba(20,20,40,.25)', 0) + caixa(X, Y, w, h, 22, nv, { base: 0 });
    d += R(X, Y, w, 50, 22, '#0f1d3a', 0) + R(X, Y + 26, w, 24, 0, '#0f1d3a', 0) + R(X, Y, w, h, 22, 'none', 3);
    [K.vermelho, K.amarelo, K.verde].forEach((c, i) => { d += Ci(X + 26 + i * 22, Y + 25, 6.5, c, 0); });
    for (let i = 0; i < 5; i++) d += R(X + 22, Y + 74 + i * 58, 40, 40, 10, i === 0 ? C.blue : card, 0);
    const GX = X + 84, GW = w - 104, cw4 = (GW - 36) / 4;
    const cartao = (a, cx, cy, cw, ch, body) => pop(ab, a, cx + cw / 2, cy + ch / 2, R(cx, cy, cw, ch, 14, card, 0) + body);
    // linha de 4 blocos de KPI (só forma, sem valores)
    [C.cyan, C.green, K.amarelo, K.rosa].forEach((c, i) => {
      const cx = GX + i * (cw4 + 12), cy = Y + 70;
      d += cartao(0.05 + i * 0.06, cx, cy, cw4, 96, Ci(cx + 34, cy + 48, 18, c, 0) + R(cx + 64, cy + 30, cw4 * 0.45, 12, 6, lin, 0) + R(cx + 64, cy + 52, cw4 * 0.3 * (0.6 + 0.4 * ease.out(inv(0.3, 1, ab))), 16, 8, c, 0));
    });
    // gráfico de linha (sem eixos)
    const lx = GX, ly = Y + 182, lw = GW * 0.6, lh = 220;
    const pts = [0.7, 0.62, 0.66, 0.5, 0.54, 0.38, 0.42, 0.26, 0.3, 0.16].map((v, i) => [lx + 24 + i * (lw - 48) / 9, ly + 40 + v * (lh - 70)]);
    const dl = 'M' + pts.map(p => `${F(p[0])} ${F(p[1])}`).join(' L');
    const uL = ease.inOut(inv(0.35, 1.2, ab));
    d += cartao(0.25, lx, ly, lw, lh, R(lx + 24, ly + 18, 120, 10, 5, lin, 0) + P(`${dl} L${F(pts[9][0])} ${ly + lh - 18} L${F(pts[0][0])} ${ly + lh - 18} Z`, C.cyan, 0, `opacity="${F(0.15 * uL)}"`) + P(dl, 'none', 5, `pathLength="1" stroke-dasharray="${F(uL)} 1"`, C.cyan));
    // barras (sem eixos)
    const bx = lx + lw + 12, bwid = GW - lw - 12;
    let bars = R(bx + 24, ly + 18, 100, 10, 5, lin, 0);
    [0.5, 0.75, 0.6, 0.9, 0.7].forEach((v, i) => { const hh = (lh - 70) * v * ease.out(inv(0.4 + i * 0.06, 1 + i * 0.06, ab)); bars += R(bx + 30 + i * (bwid - 60) / 5, ly + lh - 20 - hh, (bwid - 60) / 5 - 12, hh, 6, i === 3 ? K.amarelo : '#5b8ad6', 0); });
    d += cartao(0.32, bx, ly, bwid, lh, bars);
    // linhas de tabela com status
    const ty = ly + lh + 12, th2 = Y + h - 20 - ty;
    let tab = '';
    for (let i = 0; i < 3; i++) tab += R(GX + 24, ty + 20 + i * (th2 - 30) / 3, GW * 0.4, 12, 6, lin, 0) + R(GX + GW * 0.5, ty + 20 + i * (th2 - 30) / 3, GW * 0.25, 12, 6, lin, 0) + R(GX + GW - 110, ty + 16 + i * (th2 - 30) / 3, 80, 20, 10, [C.green, K.amarelo, C.green][i], 0);
    d += cartao(0.4, GX, ty, GW, th2, tab);
    s += g(tr(0, 0, lerp(0.7, 1, ease.back(inv(0, 0.45, ab)))), op(inv(0, 0.2, ab), d));
  }
  return g(tr(x, y, ease.back(inv(0, 0.4, idade)) * (o.escala ?? 1), o.rot ?? 0), s);
}

// Robozinho de automação. (x, y) = base. o: cor, acao ('acena'|'trabalha'|'pula'|'parado'), escala, virado
export function robo(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const cor = o.cor ?? '#3aa7c9', acao = o.acao ?? 'acena';
  const pulo = acao === 'pula' ? Math.abs(Math.sin(idade * 4)) * 26 : 0;
  const bob = Math.sin(idade * 3.2) * 3 - pulo;
  const pisc = (idade % 2.8) > 2.68 ? 0.15 : 1;
  let s = chao(130 * (1 - pulo / 80));
  // pernas e pés
  s += R(-30, -46, 18, 38, 8, '#2f3242', 3) + R(12, -46, 18, 38, 8, '#2f3242', 3) + E(-24, -8, 22, 11, '#2f3242', 3) + E(24, -8, 22, 11, '#2f3242', 3);
  let corpo = '';
  // braços
  const aE = acao === 'trabalha' ? 30 + Math.sin(idade * 12) * 14 : 18 + Math.sin(idade * 2) * 4;
  const aD = acao === 'acena' ? -130 + Math.sin(idade * 9) * 22 : acao === 'trabalha' ? 30 + Math.sin(idade * 12 + 2) * 14 : 18;
  const arm = (sx, sy, ang) => { const r = ang * Math.PI / 180, hx = sx + Math.cos(r) * 52, hy = sy + Math.sin(r) * 52; return Ln(sx, sy, hx, hy, 15) + Ln(sx, sy, hx, hy, 9, '#9aa3b5') + Ci(hx, hy, 13, K.amarelo, 3); };
  corpo += arm(-44, -84, 180 - aE) + arm(44, -84, acao === 'acena' ? -50 + Math.sin(idade * 9) * 22 : aD);
  corpo += caixa(-48, -112, 96, 70, 26, '#e9eef3', { base: 12 }) + R(-22, -96, 44, 28, 8, '#cfd8e2', 2.5) + Ci(-8, -82, 5, K.vermelho, 0) + Ci(8, -82, 5, Math.sin(idade * 4) > 0 ? K.verde : '#2b6b45', 0);
  // cabeça
  let cab = Ln(0, -212, 0, -240, 4) + Ci(0, -244, 10, Math.sin(idade * 3) > 0 ? K.amarelo : '#d79a20', 3, '');
  cab += Ci(-66, -160, 12, '#9aa3b5', 3) + Ci(66, -160, 12, '#9aa3b5', 3);
  cab += caixa(-66, -214, 132, 104, 36, cor, { base: 14 });
  cab += R(-50, -198, 100, 64, 22, '#1f2b45', 3);
  cab += g(`translate(0 -172) scale(1 ${F(pisc)})`, R(-30, -14, 16, 24, 8, '#7ff0ff', 0) + R(14, -14, 16, 24, 8, '#7ff0ff', 0));
  cab += P('M-14 -150 Q0 -140 14 -150', 'none', 4, '', '#7ff0ff') + E(-38, -150, 9, 5, K.rosa, 0, 'opacity=".75"') + E(38, -150, 9, 5, K.rosa, 0, 'opacity=".75"');
  corpo += rot(Math.sin(idade * 2.1) * 3, 0, -112, cab);
  s += mv(0, bob, corpo);
  const b = o.virado ? g('scale(-1 1)', s) : s;
  return pop(idade, 0, x, y, raiz(x, y, o, b), 0, 0.45);
}

// =====================================================================
// CENA 5 — painel financeiro para os números grandes (escritos por outra camada)
// =====================================================================
// (x, y) = centro. A área central fica vazia (com brilho) para o número. o: titulo (texto do topo, opcional), escala
export function painelFinanceiro(x, y, w = 1100, h = 560, idade = 0, o = {}) {
  if (idade < 0) return '';
  const X = -w / 2, Y = -h / 2, cl = id('pfin', x, y);
  let s = R(X + 14, Y + 18, w, h, 32, 'rgba(60,35,15,.2)', 0);
  s += caixa(X, Y, w, h, 32, K.navy2, { base: 18 });
  const IX = X + 26, IY = Y + 70, IW = w - 52, IH = h - 112;
  s += `<clipPath id="${cl}"><rect x="${F(IX)}" y="${F(IY)}" width="${F(IW)}" height="${F(IH)}" rx="20"/></clipPath>`;
  let tela = R(IX, IY, IW, IH, 20, '#13244a', 0) + E(0, IY + IH / 2, IW * 0.42, IH * 0.42, 'url(#pf-luz)', 0, `opacity="${F(0.55 + 0.25 * Math.sin(idade * 2))}"`);
  for (let i = 0; i < 9; i++) tela += Ln(IX, IY + 30 + i * 48, IX + IW, IY + 30 + i * 48, 1.5, 'rgba(255,255,255,.05)');
  // moedas empilhadas nos cantos
  const pilha = (px, n, a) => { let p = ''; for (let i = 0; i < n; i++) p += pop(idade, a + i * 0.06, px, IY + IH - 20 - i * 16, E(px, IY + IH - 24 - i * 16, 34, 11, K.amarelo, 3) + E(px, IY + IH - 28 - i * 16, 34, 11, '#ffd76a', 3), 30, 0.3); return p; };
  tela += pilha(IX + 70, 5, 0.5) + pilha(IX + 140, 3, 0.7) + pilha(IX + IW - 70, 6, 0.6);
  // seta subindo (decorativa) e brilhos
  const u = ease.inOut(inv(0.6, 1.4, idade));
  tela += P(`M${F(IX + IW - 230)} ${F(IY + IH - 60)} L${F(IX + IW - 180)} ${F(IY + IH - 110)} L${F(IX + IW - 150)} ${F(IY + IH - 90)} L${F(IX + IW - 110)} ${F(IY + IH - 150)}`, 'none', 7, `pathLength="1" stroke-dasharray="${F(u)} 1"`, C.green);
  for (let i = 0; i < 5; i++) { const tw = Math.max(0, Math.sin(idade * 2.4 + i * 1.7)); const bx = IX + 60 + ((i * 263) % (IW - 120)), by = IY + 40 + ((i * 97) % 120); tela += g(tr(bx, by, 0.4 + tw * 0.6), P('M0 -10 Q0 0 10 0 Q0 0 0 10 Q0 0 -10 0 Q0 0 0 -10 Z', '#ffe7a0', 0, `opacity="${F(tw)}"`)); }
  // brilho que varre a tela
  const sw = ((idade - 1.2) % 3.2) / 0.9;
  if (idade > 1.2 && sw < 1) tela += g(`translate(${F(lerp(IX - 200, IX + IW + 200, sw))} 0) skewX(-20)`, R(-50, IY, 100, IH, 0, 'rgba(255,255,255,.1)', 0));
  s += g('', tela, `clip-path="url(#${cl})"`) + R(IX, IY, IW, IH, 20, 'none', 3);
  // fita de LEDs embaixo
  for (let i = 0; i < 24; i++) { const on = Math.sin(idade * 6 - i * 0.6) > 0.3; s += Ci(X + 60 + i * (w - 120) / 23, Y + h - 22, 5, on ? K.amarelo : '#33507f', 0); }
  // plaquinha do topo
  const tw2 = o.titulo ? Math.max(260, o.titulo.length * 22 + 80) : 300;
  let topo = caixa(-tw2 / 2, Y - 30, tw2, 64, 20, K.amarelo, { base: 10 });
  if (o.titulo) topo += T(o.titulo, 0, Y + 12, 30, INK, { weight: 900, ls: 1 });
  else topo += Ci(-tw2 / 2 + 40, Y + 2, 16, '#ffd76a', 3) + R(-tw2 / 2 + 70, Y - 6, tw2 - 120, 14, 7, 'rgba(58,42,34,.35)', 0);
  s += pop(idade, 0.25, 0, Y + 34, topo, 30);
  return g(tr(x, y, ease.back(inv(0, 0.45, idade)) * (o.escala ?? 1), o.rot ?? 0), s);
}
