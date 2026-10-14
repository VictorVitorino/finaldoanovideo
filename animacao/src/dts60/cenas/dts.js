// Cena 2 · DTS — "…dentro de DTS: um mundo de inovação e tecnologia!" (≈ 8.86 → 13.0 s)
//
// Abertura estilo "title sequence" de After Effects, sobre navy premium.
// Batidas (tempos absolutos, de tempos.json):
//   t0        a câmera sai do voo pela porta da cena anterior: flash branco/laranja que se dissolve,
//             riscos de velocidade radiais e um ponto de luz com reflexo anamórfico no centro.
//   wa(16)-.12 o banner DTS (reconstrução da newsletter) se abre do ponto de luz.
//   wa(16)    "DTS:" IMPACTO: ondas de choque (circular + retangular), explosão de partículas,
//             bloom, raios de luz atrás do banner, flash e tremor de câmera; as letras D-T-S caem uma a
//             uma (cada pouso solta faíscas, um micro-tremor e "frames" de eco que se expandem);
//             aberração cromática laranja/azul quando o S assenta.
//   +1.0 s    lockup ALVAREZ & MARSAL revelado por máscara acima do banner.
//   wa(17)    "um mundo": um globo em wireframe se expande atrás do banner e as janelas de interface
//             (código, chat, gráfico, IA, kanban, cloud) voam da profundidade, com ecos de movimento,
//             e assentam em órbita com cantos de HUD.
//   wa(20)    "inovação": INOVAÇÃO surge letra a letra sob o banner (linha "newsletter");
//             etiquetas IA e AUTOMAÇÃO saltam.
//   wa(21)    "e": o "&" entra.
//   wa(22)    "tecnologia!": TECNOLOGIA surge; etiquetas DADOS e CLOUD; trilhas de circuito ligam
//             o banner às janelas, com pulsos de luz; segunda varredura de luz no banner.
//   até t1    tudo respira: órbitas, pulsos, poeira de luz, empurrão lento de câmera.
import {
  COR, INK, W, H, txt, largura, pilula, pessoa, lockupAM,
  clamp, lerp, inv, ease, rng, n2, back, fin, fout, mover, popG,
  fundoNavy, varredura, onda, flash, particulas, poeira, faiscas, hudCantos, janelaUI, tremor, bannerDTS,
} from '../base.js';

const f = n2;

export const CHIP = ['CENA 2 · DTS', 'Digital & Technology Services'];
export const TRANSICAO = 'nenhuma';
export const ESCURO = true;

// ---------- geometria ----------
const BX = 960, BY = 420, BS = 1.2;          // banner (centro, escala)
const BW = 840 * BS, BH = 190 * BS;           // tamanho do painel na tela
const CAMX = 960, CAMY = 480;                 // pivô da câmera

// Janelas de interface: posição final (canto sup. esq.), tamanho, conteúdo, profundidade p (paralaxe)
const JAN = [
  { k: 'code', x: 70, y: 214, w: 300, h: 196, esc: true, tit: 'DTS.APP', p: 0.8, rot: -2.2, ox: 330, oy: -40 },
  { k: 'chat', x: 1545, y: 206, w: 296, h: 190, esc: false, tit: '', p: 0.85, rot: 2.0, ox: -330, oy: -40 },
  { k: 'chart', x: 92, y: 548, w: 292, h: 200, esc: false, tit: '', p: 1.1, rot: 1.6, ox: 330, oy: 40 },
  { k: 'ai', x: 1535, y: 546, w: 292, h: 206, esc: true, tit: 'AGENTES', p: 1.1, rot: -1.8, ox: -330, oy: 40 },
  { k: 'kanban', x: 478, y: 716, w: 262, h: 170, esc: false, tit: '', p: 1.25, rot: -1.4, ox: 120, oy: -150 },
  { k: 'cloud', x: 1180, y: 716, w: 262, h: 170, esc: true, tit: '', p: 1.25, rot: 1.4, ox: -120, oy: -150 },
];

// ---------- defs locais (gradientes com prefixo da cena) ----------
// rfl = raio (px) do flash de abertura: encolhe como uma íris, limpando primeiro os cantos
function defs(rfl = 1500) {
  return `<defs>`
    + `<radialGradient id="dts_fl" gradientUnits="userSpaceOnUse" cx="${BX}" cy="${BY}" r="${f(rfl)}"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity=".96"/><stop offset=".78" stop-color="${COR.orange2}" stop-opacity=".72"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="dts_bloom"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="${COR.orange2}" stop-opacity=".55"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="dts_halo"><stop offset="0" stop-color="${COR.orange}" stop-opacity=".42"/><stop offset=".55" stop-color="${COR.orange}" stop-opacity=".1"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="dts_raio" gradientUnits="userSpaceOnUse" cx="${BX}" cy="${BY}" r="1150"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="${COR.blue3}" stop-opacity=".35"/><stop offset="1" stop-color="${COR.blue3}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="dts_anam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COR.blue2}" stop-opacity="0"/><stop offset=".35" stop-color="${COR.blue3}" stop-opacity=".7"/><stop offset=".5" stop-color="#fff"/><stop offset=".65" stop-color="${COR.orange2}" stop-opacity=".7"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="dts_globo" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="800"><stop offset="0" stop-color="${COR.blue3}" stop-opacity=".55"/><stop offset=".55" stop-color="${COR.blue3}" stop-opacity=".35"/><stop offset="1" stop-color="${COR.blue3}" stop-opacity="0"/></linearGradient>`
    + `<radialGradient id="dts_bok"><stop offset="0" stop-color="${COR.blue3}" stop-opacity=".55"/><stop offset="1" stop-color="${COR.blue3}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="dts_bokO"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".5"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="dts_palco"><stop offset="0" stop-color="${COR.blue3}" stop-opacity=".45"/><stop offset="1" stop-color="${COR.blue3}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="dts_regra" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COR.lblue}" stop-opacity="0"/><stop offset="1" stop-color="${COR.lblue}" stop-opacity=".7"/></linearGradient>`
    + `<linearGradient id="dts_regra2" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${COR.lblue}" stop-opacity="0"/><stop offset="1" stop-color="${COR.lblue}" stop-opacity=".7"/></linearGradient>`
    + `</defs>`;
}

// grupo de câmera com paralaxe: p = profundidade (0 = infinito, 1 = plano do banner, >1 = perto)
function camada(cam, p, body) {
  const z = 1 + (cam.z - 1) * p;
  return `<g transform="translate(${f(CAMX + cam.x * p)} ${f(CAMY + cam.y * p)}) scale(${f(z)}) translate(${-CAMX} ${-CAMY})">${body}</g>`;
}

// ---------- fundo distante: janelas-fantasma e raios ----------
// a0 = início: as molduras "acendem" uma a uma (pop com brilho que assenta em 0.13) ainda durante "DTS:"
function fantasmas(t, a0) {
  if (t < a0) return '';
  const r = rng(52);
  let s = '', n = 0;
  for (let i = 0; i < 9; i++) {
    const x = 120 + r() * 1680, y = 210 + r() * 640, w = 70 + r() * 90, h = w * (0.55 + r() * 0.25), ph = r() * 6;
    if (Math.abs(x - BX) < 560 && Math.abs(y - BY) < 170) continue; // não atrás do banner
    const a = a0 + (n++) * 0.07, k = back(t, a, 0.35);
    if (k <= 0.001) continue;
    const brilho = 0.13 + 0.32 * Math.exp(-Math.max(0, t - a) * 3.5);
    const xx = x + Math.sin(t * 0.35 + ph) * 18, yy = y + Math.cos(t * 0.3 + ph) * 12;
    s += `<g opacity="${f(brilho * clamp(k * 2))}" transform="translate(${f(xx + w / 2)} ${f(yy + h / 2)}) scale(${f(k)}) translate(${f(-xx - w / 2)} ${f(-yy - h / 2)})"><rect x="${f(xx)}" y="${f(yy)}" width="${f(w)}" height="${f(h)}" rx="8" fill="none" stroke="${COR.blue3}" stroke-width="2"/>`
      + `<path d="M${f(xx)},${f(yy + 14)} h${f(w)} M${f(xx + 10)},${f(yy + 26)} h${f(w * 0.5)} M${f(xx + 10)},${f(yy + 36)} h${f(w * 0.32)}" stroke="${COR.blue3}" stroke-width="2"/></g>`;
  }
  return s;
}

function raios(t, k) {
  if (k <= 0.005) return '';
  let s = '';
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.12;
    const da = 0.05 + 0.03 * Math.sin(i * 2.3);
    const L = 1150;
    s += `<path d="M${BX},${BY} L${f(BX + Math.cos(a - da) * L)},${f(BY + Math.sin(a - da) * L)} L${f(BX + Math.cos(a + da) * L)},${f(BY + Math.sin(a + da) * L)}Z" fill="url(#dts_raio)"/>`;
  }
  return `<g opacity="${f(k)}">${s}</g>`;
}

// ---------- o "mundo": globo em wireframe ----------
function globo(t, k) {
  if (k <= 0.002) return '';
  const R = 360, cx = BX, cy = BY + 20;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="url(#dts_globo)" stroke-width="3"/>`;
  // meridianos girando
  for (let i = 0; i < 6; i++) {
    const ph = i * Math.PI / 6 + t * 0.55;
    const rx = Math.abs(Math.cos(ph)) * R;
    if (rx < 4) continue;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx)}" ry="${R}" fill="none" stroke="url(#dts_globo)" stroke-width="2"/>`;
  }
  // paralelos
  for (const lat of [-55, -28, 0, 28, 55]) {
    const a = lat * Math.PI / 180;
    const yy = cy + Math.sin(a) * R, rx = Math.cos(a) * R;
    s += `<ellipse cx="${cx}" cy="${f(yy)}" rx="${f(rx)}" ry="${f(rx * 0.16)}" fill="none" stroke="url(#dts_globo)" stroke-width="2"/>`;
  }
  // nós de rede piscando sobre o globo
  const r = rng(77);
  for (let i = 0; i < 14; i++) {
    const lon = r() * Math.PI * 2 + t * 0.55, lat = (r() - 0.5) * 2.4;
    const z = Math.cos(lon);
    if (z < 0.1) continue;
    const x = cx + Math.sin(lon) * Math.cos(lat) * R, y = cy + Math.sin(lat) * R;
    if (y > cy + R * 0.55) continue;
    const pis = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.7);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + 2 * pis)}" fill="${i % 3 ? COR.blue3 : COR.orange2}" opacity="${f(0.35 + 0.5 * pis * z)}"/>`;
  }
  const sc = lerp(0.25, 1, k);
  return `<g opacity="${f(clamp(k * 1.6))}" transform="translate(${cx} ${cy}) scale(${f(sc)}) translate(${-cx} ${-cy})">${s}</g>`;
}

// ---------- trilhas de circuito (rede) ----------
function polyLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
function pontoEm(pts, d) {
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= l) { const u = d / l; return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]; }
    d -= l;
  }
  return pts[pts.length - 1];
}
const BL = BX - BW / 2, BR = BX + BW / 2;
const TRILHAS = [
  // banner -> janelas laterais
  [[BL + 30, BY - 60], [BL - 14, BY - 60], [BL - 34, BY - 80], [370, BY - 80]],
  [[BL + 30, BY + 60], [BL - 14, BY + 60], [BL - 34, BY + 80], [BL - 34, 600], [384, 600]],
  [[BR - 30, BY - 60], [BR + 14, BY - 60], [BR + 34, BY - 80], [1545, BY - 80]],
  [[BR - 30, BY + 60], [BR + 14, BY + 60], [BR + 34, BY + 80], [BR + 34, 600], [1535, 600]],
  // janelas laterais -> janelas de baixo
  [[238, 748], [238, 812], [478, 812]],
  [[1681, 752], [1681, 812], [1442, 812]],
  // coluna esquerda / direita
  [[110, 410], [110, 548]],
  [[1800, 396], [1800, 546]],
];

function trilhas(t, tA) {
  let s = '', nos = '', pulsos = '';
  TRILHAS.forEach((pts, i) => {
    const a = tA + i * 0.06;
    const u = ease.inOut(inv(a, a + 0.55, t));
    if (u <= 0) return;
    const L = polyLen(pts);
    const d = pts.map((p, j) => `${j ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join(' ');
    s += `<path d="${d}" fill="none" stroke="${COR.blue3}" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${f(L)} ${f(L + 10)}" stroke-dashoffset="${f(L * (1 - u))}"/>`;
    // nós nas pontas
    const [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
    nos += `<circle cx="${f(x0)}" cy="${f(y0)}" r="${f(6 * clamp(u * 4))}" fill="${COR.navy}" stroke="${COR.blue3}" stroke-width="3"/>`;
    if (u >= 0.98) nos += `<circle cx="${f(x1)}" cy="${f(y1)}" r="${f(7 * back(t, a + 0.53, 0.3))}" fill="${COR.orange}" stroke="#fff" stroke-width="2.5"/>`;
    // cabeça de luz enquanto desenha
    if (u > 0 && u < 1) {
      const [hx, hy] = pontoEm(pts, L * u);
      pulsos += `<circle cx="${f(hx)}" cy="${f(hy)}" r="14" fill="url(#dts_bokO)"/><circle cx="${f(hx)}" cy="${f(hy)}" r="4.5" fill="#fff"/>`;
    }
    // pulsos de dados viajando depois de desenhada
    if (u >= 1) {
      const vel = 420, per = (L + 120) / vel;
      const fase = ((t - a - 0.55 + i * 0.37) % per) / per;
      const [px, py] = pontoEm(pts, fase * (L + 120) - 60);
      const ap = clamp(Math.min(fase * 8, (1 - fase) * 8));
      if (fase * (L + 120) - 60 > 0) pulsos += `<circle cx="${f(px)}" cy="${f(py)}" r="12" fill="url(#dts_bokO)" opacity="${f(ap)}"/><circle cx="${f(px)}" cy="${f(py)}" r="4" fill="${COR.orange2}" opacity="${f(ap)}"/>`;
    }
  });
  return s + nos + pulsos;
}

// ---------- etiqueta tech (pílula com rótulo em caixa alta espaçada) ----------
function etiqueta(t, a, x, y, str, o = {}) {
  const k = back(t, a, 0.4);
  if (k <= 0.001) return '';
  const size = 19, ls = 3.4;
  const w = largura(str, size, 700, 'DM Sans') + str.length * ls + 48, h = 40;
  const laranja = o.laranja ?? true;
  const fill = laranja ? COR.orange : '#fff', cor = laranja ? '#fff' : COR.navy;
  const dot = laranja ? '#fff' : COR.orange;
  const body = `<rect x="${f(-w / 2 + 3)}" y="${f(-h / 2 + 4)}" width="${f(w)}" height="${h}" rx="${h / 2}" fill="rgba(0,10,25,.35)"/>`
    + pilula(-w / 2, -h / 2, w, h, fill, INK, 3)
    + `<circle cx="${f(-w / 2 + 18)}" cy="0" r="5" fill="${dot}" opacity="${f(0.6 + 0.4 * Math.sin(t * 6 + x))}"/>`
    + txt(str, -w / 2 + 31, 7, { anchor: 'start', size, weight: 700, family: 'DM Sans', fill: cor, ls });
  // anel de pop no formato da pílula (fica perto da etiqueta: não varre a tagline nem as janelas)
  let ring = '';
  const age = t - a, dr = 0.45;
  if (age >= 0 && age <= dr) {
    const u = ease.out(age / dr), e = 4 + 30 * u;
    ring = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(o.rot ?? 0)})"><rect x="${f(-w / 2 - e)}" y="${f(-h / 2 - e)}" width="${f(w + 2 * e)}" height="${f(h + 2 * e)}" rx="${f(h / 2 + e)}" fill="none" stroke="${laranja ? COR.orange2 : '#fff'}" stroke-width="${f(5 * (1 - u) + 1)}" opacity="${f(0.9 * (1 - u))}"/></g>`;
  }
  return ring + popG(k, x, y, `<g transform="rotate(${f(o.rot ?? 0)})">${body}</g>`);
}

// ---------- linha "INOVAÇÃO & TECNOLOGIA" (estilo da linha NEWSLETTER do banner) ----------
const LSZ = 40, LLS = 10, LY = 622;
function linhaLetras() {
  const partes = [['INOVAÇÃO', 'a'], [' & ', 'e'], ['TECNOLOGIA', 'b']];
  const out = [];
  let x = 0;
  for (const [str, grp] of partes) {
    let i = 0;
    for (const ch of str) {
      const w = ch === ' ' ? LSZ * 0.32 : largura(ch, LSZ, 800);
      if (ch !== ' ') out.push({ ch, x, w, grp, i: i++ });
      x += w + (ch === ' ' ? 0 : LLS);
    }
  }
  const total = x - LLS;
  for (const L of out) L.x += BX - total / 2;
  return { letras: out, x0: BX - total / 2, x1: BX + total / 2 };
}
const LINHA = linhaLetras();

function tagline(t, tInov, tE, tTec) {
  let s = '';
  const ini = { a: tInov - 0.08, e: tE - 0.06, b: tTec - 0.08 };
  for (const L of LINHA.letras) {
    const a = ini[L.grp] + L.i * 0.028;
    const k = clamp(inv(a, a + 0.34, t));
    if (k <= 0) continue;
    const dy = (1 - ease.back(k)) * 34;
    const op = clamp(k * 3);
    const cor = L.grp === 'e' ? '#fff' : COR.orange;
    s += `<text x="${f(L.x)}" y="${f(LY + dy)}" font-family="Outfit" font-weight="800" font-size="${LSZ}" fill="${cor}" opacity="${f(op)}">${L.ch}</text>`;
  }
  // réguas que se estendem para os lados
  const kr = ease.out(inv(tInov, tInov + 0.7, t));
  if (kr > 0) {
    const y = LY - LSZ * 0.36, L = 210 * kr;
    s += `<rect x="${f(LINHA.x0 - 28 - L)}" y="${f(y - 1.5)}" width="${f(L)}" height="3" fill="url(#dts_regra)"/>`
      + `<rect x="${f(LINHA.x1 + 28)}" y="${f(y - 1.5)}" width="${f(L)}" height="3" fill="url(#dts_regra2)"/>`
      + `<rect x="${f(LINHA.x0 - 28 - 9)}" y="${f(y - 4.5)}" width="9" height="9" fill="${COR.orange}" transform="rotate(45 ${f(LINHA.x0 - 32.5)} ${f(y)})"/>`
      + `<rect x="${f(LINHA.x1 + 28)}" y="${f(y - 4.5)}" width="9" height="9" fill="${COR.orange}" transform="rotate(45 ${f(LINHA.x1 + 32.5)} ${f(y)})"/>`;
  }
  // varredura de brilho atravessando as letras (máscara feita com o próprio texto)
  const uv = inv(tTec + 0.5, tTec + 1.1, t);
  if (uv > 0 && uv < 1) {
    let clip = '';
    for (const L of LINHA.letras) clip += `<text x="${f(L.x)}" y="${LY}" font-family="Outfit" font-weight="800" font-size="${LSZ}">${L.ch}</text>`;
    const x0 = LINHA.x0 - 120, x1 = LINHA.x1 + 40;
    const bx = lerp(x0, x1, ease.inOut(uv));
    s += `<clipPath id="dts_tlc">${clip}</clipPath><g clip-path="url(#dts_tlc)"><path d="M${f(bx)},${LY - 50} L${f(bx + 70)},${LY - 50} L${f(bx + 40)},${LY + 12} L${f(bx - 30)},${LY + 12}Z" fill="#fff" opacity=".85"/></g>`;
  }
  return s;
}

// ---------- janela de interface voando da profundidade ----------
const VOO = 0.62;
// pose da janela no instante tau (posição, escala, rotação), para o voo e para os ecos
function pose(J, a, i, tau) {
  const u = inv(a, a + VOO, tau);
  const e = ease.out5(u);
  // começa atrás do banner (no centro, pequena) e vem para a frente com leve overshoot de escala
  const sx = BX + J.ox - J.w / 2, sy = BY + J.oy - J.h / 2;
  const kb = fin(tau, a + VOO, 0.4);
  const x = lerp(sx, J.x, e) + Math.sin(tau * 1.1 + i * 1.9) * 7 * kb;
  const y = lerp(sy, J.y, e) + Math.cos(tau * 0.9 + i * 1.3) * 6 * kb;
  const sc = lerp(0.2, 1, e) + 0.06 * Math.sin(Math.PI * clamp(inv(0.55, 1, u)));
  const rot = lerp(J.rot * 6, J.rot, e) + Math.sin(tau * 0.8 + i) * 0.6;
  return { u, cx: x + J.w / 2, cy: y + J.h / 2, sc, rot };
}
const tfJ = (J, P) => `translate(${f(P.cx)} ${f(P.cy)}) rotate(${f(P.rot)}) scale(${f(P.sc)}) translate(${f(-J.w / 2)} ${f(-J.h / 2)})`;

function janelaVoo(t, J, a, i) {
  const P = pose(J, a, i, t);
  if (P.u <= 0) return '';
  let s = '';
  // ecos de movimento: molduras vazadas nas posições anteriores (efeito "echo")
  if (P.u < 0.8) {
    const ar = 1 - P.u / 0.8;
    for (let j = 4; j >= 1; j--) {
      const Q = pose(J, a, i, t - j * 0.04);
      if (Q.u <= 0) continue;
      s += `<g transform="${tfJ(J, Q)}" opacity="${f(0.6 * ar * (1 - j / 5))}"><rect width="${J.w}" height="${J.h}" rx="14" fill="${J.esc ? COR.navy3 : COR.blue3}" fill-opacity=".25" stroke="${j % 2 ? COR.orange2 : COR.blue3}" stroke-width="${f(3 / Q.sc)}"/></g>`;
    }
  }
  const corpo = janelaUI(J.k, 0, 0, J.w, J.h, t, { escuro: J.esc, titulo: J.tit || undefined });
  const hud = hudCantos(-12, -12, J.w + 24, J.h + 24, inv(a + VOO - 0.15, a + VOO + 0.25, t), COR.orange, 22, 4);
  s += `<g opacity="${f(clamp(P.u * 4))}" transform="${tfJ(J, P)}">`
    + `<g opacity="${f(0.85 * fout(t, a + VOO + 0.5, 0.6) + 0.15)}">${hud}</g>${corpo}</g>`;
  return s;
}

// ---------- desenho ----------
export function desenhar(t, ctx) {
  const T0 = ctx.t0, T1 = ctx.t1;
  const tI = ctx.wa(16);            // "DTS:"
  const tb = tI - 0.12;             // banner começa a abrir
  const tUm = ctx.wa(17);
  const tInov = ctx.wa(20);
  const tE = ctx.wa(21);
  const tTec = ctx.wa(22);

  // pouso das letras D T S (mesma conta de bannerDTS: cai em k≈0.37 do trecho de 0.32 s)
  const pousos = [0, 1, 2].map(i => tb + 0.25 + i * 0.09 + 0.118);

  // ---------- câmera ----------
  let [sx, sy] = tremor(t, tI, 0.45, 18);
  for (const tp of pousos) { const [a, b] = tremor(t, tp, 0.18, 5); sx += a; sy += b; }
  { const [a, b] = tremor(t, tTec, 0.22, 4); sx += a; sy += b; }
  const chegada = 1 - ease.out5(inv(T0, T0 + 0.7, t));             // vindo do voo pela porta
  const soco = Math.exp(-Math.max(0, t - tI) * 7) * (t >= tI ? 1 : 0); // "punch-in" no impacto
  const cam = {
    x: sx + Math.sin(t * 0.7) * 8,
    y: sy + Math.cos(t * 0.55) * 5,
    z: 1 + 0.14 * chegada + 0.035 * soco + 0.035 * ease.inOut(inv(tI, T1, t)),
  };

  let s = defs(lerp(1500, 60, ease.out(inv(T0 + 0.02, T0 + 0.32, t))));
  // fundo navy (leve zoom com a câmera)
  s += camada(cam, 0.25, fundoNavy(t, { id: 'dts_nv', cx: BX, cy: BY, seed: 21 }));

  // ---------- camada distante ----------
  let far = '';
  far += fantasmas(t, tI + 0.42);
  const kRaio = t < tI ? 0 : 0.85 * Math.exp(-(t - tI) * 3) + 0.22 * fin(t, tI, 0.3) + 0.04 * Math.sin(t * 2);
  far += raios(t, kRaio);
  far += `<ellipse cx="${BX}" cy="${BY}" rx="${f(760 + 40 * Math.sin(t * 1.4))}" ry="${f(380 + 20 * Math.sin(t * 1.4))}" fill="url(#dts_halo)" opacity="${f(clamp(fin(t, tb, 0.4) * (0.75 + 0.25 * Math.sin(t * 2.2))))}"/>`;
  far += globo(t, back(t, tUm, 0.75));
  far += poeira(t, 5, 26, [0, 160, W, 820], COR.blue3, 0.45);
  s += camada(cam, 0.5, far);

  // ---------- camada média: rede + janelas ----------
  let mid = '';
  mid += trilhas(t, tTec - 0.45);
  JAN.forEach((J, i) => {
    const a = tI + 0.6 + i * 0.075;
    mid += janelaVoo(t, J, a, i);
  });
  // etiquetas
  const ET = [
    { j: 1, str: 'IA GENERATIVA', a: tInov - 0.02, dx: 0.5, dy: 0, rot: -4 },
    { j: 4, str: 'AUTOMAÇÃO', a: tInov + 0.1, dx: 0.5, dy: 0, rot: 3 },
    { j: 2, str: 'DADOS', a: tTec - 0.02, dx: 0.78, dy: 0, rot: 4 },
    { j: 5, str: 'CLOUD', a: tTec + 0.1, dx: 0.5, dy: 0, rot: -3 },
  ];
  for (const E of ET) {
    const J = JAN[E.j];
    const bx = J.x + J.w * E.dx + Math.sin(t * 1.1 + E.j * 1.9) * 7, by = J.y - 2 + Math.cos(t * 0.9 + E.j * 1.3) * 6;
    mid += etiqueta(t, E.a, bx, by, E.str, { rot: E.rot, laranja: !(E.j === 4 || E.j === 5) });
  }
  s += camada(cam, 0.85, mid);

  // ---------- banner (herói) ----------
  let hero = '';
  // bloom do impacto
  const kb = t < tb ? 0 : Math.exp(-Math.max(0, t - tI) * 3.2) * clamp((t - tb) / 0.1);
  if (kb > 0.01) hero += `<ellipse cx="${BX}" cy="${BY}" rx="${f(700 * (0.6 + 0.4 * kb))}" ry="${f(260 * (0.6 + 0.4 * kb))}" fill="url(#dts_bloom)" opacity="${f(kb)}"/>`;
  // ondas de choque
  hero += onda(BX, BY, t - tI, { d: 0.85, r0: 120, r1: 1100, w: 20 });
  hero += onda(BX, BY, t - tI - 0.12, { d: 0.8, r0: 80, r1: 820, w: 10, cor: COR.blue3, duplo: false });
  {
    const age = t - tI, d = 0.65;
    if (age >= 0 && age <= d) {
      const k = ease.out(age / d), e = 20 + 190 * k;
      hero += `<rect x="${f(BX - BW / 2 - e)}" y="${f(BY - BH / 2 - e * 0.55)}" width="${f(BW + 2 * e)}" height="${f(BH + e * 1.1)}" rx="${f(22 + e * 0.3)}" fill="none" stroke="#fff" stroke-width="${f(8 * (1 - k) + 1)}" opacity="${f(0.9 * (1 - k))}"/>`;
    }
  }
  hero += particulas(31, BX, BY, t - tI, { n: 46, v: 820, d: 1.15, sz: 12, g: 140 });
  // lockup A&M acima do banner
  {
    const a = tb + 1.0;
    const u = inv(a, a + 0.55, t);
    if (u > 0) {
      const lk = lockupAM(0, 0, 24, '#ffffff');
      const lx = BX - lk.w / 2, ly = BY - BH / 2 - 52;
      const corpo = mover(lx, ly, lk.svg);
      const e = ease.out(u);
      hero += `<clipPath id="dts_lk"><rect x="${f(lx - 10)}" y="${f(ly - 40)}" width="${f((lk.w + 20) * e)}" height="56"/></clipPath><g clip-path="url(#dts_lk)" opacity=".92">${corpo}</g>`;
      if (u < 1) hero += `<rect x="${f(lx - 10 + (lk.w + 20) * e - 3)}" y="${f(ly - 40)}" width="4" height="54" fill="${COR.orange}"/>`;
    }
  }
  hero += bannerDTS(t, tb, { x: BX, y: BY, s: BS, id: 'dts_b' });
  // faíscas no pouso de cada letra
  {
    let lx = -370;
    ['D', 'T', 'S'].forEach((L, i) => {
      const w = largura(L, 120, 900);
      const px = BX + (lx + w / 2) * BS, py = BY + 40 * BS;
      hero += faiscas(px, py, t - pousos[i], i === 1 ? '#fff' : COR.orange2, 9, 30, 92);
      // "frames" de eco: molduras que saltam de cada letra e se expandem em direção à câmera
      for (let e = 0; e < 2; e++) {
        const age = t - pousos[i] - e * 0.07, d = 0.55;
        if (age < 0 || age > d) continue;
        const k = ease.out(age / d), sc = 1 + 1.9 * k;
        const ew = (w + 26) * BS * sc, eh = 120 * BS * sc, ecx = px, ecy = BY + (38 - 44) * BS;
        hero += `<rect x="${f(ecx - ew / 2)}" y="${f(ecy - eh / 2)}" width="${f(ew)}" height="${f(eh)}" rx="${f(10 * sc)}" fill="none" stroke="${e ? COR.blue3 : COR.orange}" stroke-width="${f(4 * (1 - k) + 1)}" opacity="${f(0.95 * (1 - k))}"/>`;
      }
      lx += w;
    });
  }
  // aberração cromática curta (laranja/azul) nas letras quando o S assenta
  {
    const age = t - pousos[2], d = 0.2;
    if (age >= 0 && age <= d) {
      const k = 1 - age / d, off = 9 * k;
      const o = { anchor: 'start', size: 120, weight: 900 };
      let lx = -370, rgb = '';
      for (const L of ['D', 'T', 'S']) {
        rgb += txt(L, lx - off, 38, { ...o, fill: COR.blue2 }) + txt(L, lx + off, 38 + off * 0.3, { ...o, fill: COR.orange });
        lx += largura(L, 120, 900);
      }
      hero += `<g transform="translate(${BX} ${BY}) scale(${BS})" opacity="${f(0.85 * k)}" style="mix-blend-mode:screen">${rgb}</g>`;
    }
  }
  // segunda varredura de luz no banner em "tecnologia!"
  hero += mover(BX, BY, varredura('dts_v2', -420, -95, 840, 190, inv(tTec + 0.25, tTec + 0.95, t)), 0, BS);
  // linha INOVAÇÃO & TECNOLOGIA
  hero += tagline(t, tInov, tE, tTec);
  s += camada(cam, 1, hero);

  // ---------- Victor maravilhado (primeiro plano, centro-baixo) ----------
  {
    const vx = 960, vy = 908;
    const kIn = back(t, T0 + 0.05, 0.5);
    const kA = clamp(inv(T0 + 0.04, T0 + 0.3, t));
    let near = `<ellipse cx="${vx}" cy="${vy - 120}" rx="230" ry="190" fill="url(#dts_palco)" opacity="${f(kA * (0.75 + 0.15 * Math.sin(t * 2)))}"/>`;
    near += `<ellipse cx="${vx}" cy="${vy}" rx="150" ry="20" fill="${COR.blue3}" opacity="${f(0.18 * kA)}"/>`;
    const hop = 18 * Math.sin(Math.PI * clamp(inv(tI + 0.02, tI + 0.36, t))) + 14 * Math.sin(Math.PI * clamp(inv(tTec, tTec + 0.32, t)));
    const braco = lerp(lerp(10, 38, fin(t, tI, 0.25)), 118, fin(t, tTec - 0.05, 0.25));
    const expr = t >= tTec ? 'joy' : t >= tI ? 'wow' : 'smile';
    near += pessoa('victor', {
      x: vx, y: vy + (1 - kIn) * 60, s: 0.86, t, expr, gaze: [0, -2.4], hop, alpha: kA,
      armL: braco + Math.sin(t * 7) * (t > tTec ? 8 : 0), armR: braco + Math.sin(t * 7 + 1) * (t > tTec ? 8 : 0),
    });
    s += camada(cam, 1.15, near);
  }

  // ---------- primeiro plano: bokeh e poeira rápida ----------
  let fg = '';
  {
    const r = rng(93);
    for (let i = 0; i < 4; i++) {
      const y = 240 + r() * 560, sp = 60 + r() * 50, ph = r() * W, rr = 50 + r() * 60;
      const x = ((ph + t * sp) % (W + 400)) - 200;
      fg += `<circle cx="${f(x)}" cy="${f(y + Math.sin(t + i) * 20)}" r="${f(rr)}" fill="url(#${i % 2 ? 'dts_bokO' : 'dts_bok'})" opacity=".35"/>`;
    }
  }
  fg += poeira(t, 9, 16, [0, 200, W, 760], COR.orange2, 0.55);
  s += camada(cam, 1.35, fg);

  // ---------- abertura: voo pela porta -> flash ----------
  {
    const age = t - T0;
    // riscos de velocidade radiais
    if (age < 0.6) {
      const r = rng(13);
      const k = age / 0.6;
      let st = '';
      for (let i = 0; i < 30; i++) {
        const a = r() * Math.PI * 2, d0 = 140 + r() * 500, len = 120 + r() * 260, sw = 2 + r() * 4;
        if (Math.sin(a) < -0.3 && Math.abs(Math.cos(a)) > 0.5) continue; // não riscar header/chip
        const ra = d0 + k * 900, rb = ra + len * (1 - k);
        st += `<path d="M${f(BX + Math.cos(a) * ra)},${f(BY + Math.sin(a) * ra)} L${f(BX + Math.cos(a) * rb)},${f(BY + Math.sin(a) * rb)}" stroke="${i % 3 ? '#fff' : COR.orange2}" stroke-width="${f(sw)}" stroke-linecap="round"/>`;
      }
      s += `<g opacity="${f(0.8 * (1 - k))}">${st}</g>`;
    }
    // ponto de luz + reflexo anamórfico que vira o banner
    const kf2 = clamp(inv(T0, T0 + 0.15, t)) * (1 - ease.inOut(inv(tb + 0.05, tb + 0.4, t)));
    if (kf2 > 0.01) {
      const w = 900 + 300 * Math.sin(age * 6);
      s += `<g opacity="${f(kf2)}"><ellipse cx="${BX}" cy="${BY}" rx="${f(w)}" ry="7" fill="url(#dts_anam)"/>`
        + `<circle cx="${BX}" cy="${BY}" r="${f(70 + 20 * Math.sin(age * 9))}" fill="url(#dts_bloom)"/><circle cx="${BX}" cy="${BY}" r="10" fill="#fff"/></g>`;
    }
    // flash vindo da cena anterior (branco no centro, laranja nas bordas)
    const kfl = 1 - ease.in(inv(T0 + 0.14, T0 + 0.3, t));
    if (kfl > 0.005) s += `<rect width="${W}" height="${H}" fill="url(#dts_fl)" opacity="${f(kfl)}"/>`;
    s += flash(t - tI, 0.16, '#ffffff', 0.32);
  }
  return s;
}
