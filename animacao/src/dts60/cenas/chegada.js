// Cena 1 · A CHEGADA — "Cheguei na Alvarez & Marsal, dentro de…" (≈ 6.0 → 8.86 s)
//
// Batidas (tempos absolutos, de tempos.json; nada fixo além dos deslocamentos):
//   t0+0.1   cartão-calendário "JULHO / 2026" salta com overshoot; o ano rola como odômetro
//            (trecho ainda sem narração). Victor já caminha a passos rápidos; a rota tracejada
//            ("trajetória") se desenha no chão atrás dele.
//   wa(9)    "Cheguei": pino de localização despenca sobre a porta DTS (onda + partículas).
//   wa(11)   "Alvarez": rótulo ALVAREZ & MARSAL se abre ao lado do pino, palavra por palavra
//            (& em wa(12), MARSAL em wa(13)); varredura de luz no prédio, janelas acendem.
//   wa(13)   "Marsal,": as portas automáticas se abrem; a luz jorra (halo, raios, faixa no chão),
//            tremor de impacto. Victor reage ("uau") e entra em contraluz (silhueta).
//   +0.16 s  a câmera mergulha na porta: zoom exponencial até ~6.5x, rastros radiais, eco do prédio,
//            e o quadro termina quase todo em luz branca/laranja — a cena "dts" abre com flash branco.
import {
  COR, INK, W, H, CHAO, txt, largura, cartao, pilula, marcaAM, predioAM, pessoa, icone,
  clamp, lerp, inv, ease, rng, n2, back, fin, onda, particulas, faiscas, tremor, revela, varredura,
} from '../base.js';

const f = n2;

export const CHIP = ['CENA 1 · A CHEGADA', 'Julho de 2026'];

// ---------- geometria do prédio A&M (predioAM) e da porta DTS ----------
const K = 1.25, OX = 358;
const DX = OX + 567 * K - 8;            // borda esquerda da porta (igual a predioAM)
const DW = (700 - 567) * K + 16;        // largura da porta
const DCX = DX + DW / 2;                // centro x da porta (~1150)
const DH = 210;                         // altura do vão (porta mais alta que a original, para o Victor caber)
const DTOP = CHAO - DH;
const FR = 16;                          // espessura do batente
const DCY = CHAO - DH / 2;              // centro do vão
const SIGN_T = DTOP - FR - 46;          // topo da placa DTS
const PIN_HEAD = SIGN_T - 56;           // centro da cabeça do pino

const PIN_PATH = 'M0,0 C-7,-14 -27,-33 -27,-56 A27,27 0 1 1 27,-56 C27,-33 7,-14 0,0Z';

// ---------- defs locais ----------
function defs() {
  return `<defs>`
    + `<radialGradient id="chegada_int" gradientUnits="userSpaceOnUse" cx="${f(DCX)}" cy="${f(DCY - 10)}" r="${f(DH * 0.8)}"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fff"/><stop offset=".8" stop-color="${COR.orange2}"/><stop offset="1" stop-color="${COR.orange}"/></radialGradient>`
    + `<radialGradient id="chegada_raio" gradientUnits="userSpaceOnUse" cx="${f(DCX)}" cy="${f(DCY)}" r="1200"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".35" stop-color="${COR.orange2}" stop-opacity=".32"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="chegada_spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".25" stop-color="${COR.orange2}" stop-opacity=".55"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></linearGradient>`
    + `<radialGradient id="chegada_bloom"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".38" stop-color="#fff" stop-opacity=".92"/><stop offset=".68" stop-color="${COR.orange2}" stop-opacity=".5"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="chegada_fim" cx=".5" cy=".5" r=".72"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity=".97"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity=".92"/></radialGradient>`
    + `<radialGradient id="chegada_lamp"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".7"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<filter id="chegada_sil" x="-20%" y="-20%" width="140%" height="140%"><feFlood flood-color="${COR.navy2}"/><feComposite in2="SourceAlpha" operator="in"/></filter>`
    + `<radialGradient id="chegada_hdr" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox"><stop offset=".55" stop-color="${COR.cream}" stop-opacity=".96"/><stop offset="1" stop-color="${COR.cream}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="chegada_flood"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#ffe6c4"/><stop offset=".9" stop-color="${COR.orange2}"/><stop offset=".965" stop-color="${COR.orange}"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="chegada_halo"><stop offset="0" stop-color="${COR.cream}" stop-opacity=".85"/><stop offset=".6" stop-color="${COR.cream}" stop-opacity=".55"/><stop offset="1" stop-color="${COR.cream}" stop-opacity="0"/></radialGradient>`
    + `</defs>`;
}

// mistura linear de duas cores hex (#rrggbb)
function mix(a, b, k) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(k))).toString(16).padStart(2, '0')).join('');
}
// "back-in": recua um pouco antes de disparar
const backIn = u => { const c = 1.70158; return u * u * ((c + 1) * u - c); };

// ---------- fundo creme com grade estendida (aguenta o zoom/pan da câmera) ----------
function fundo(t, zb) {
  let s = `<rect width="${W}" height="${H}" fill="${COR.cream}"/>`;
  let g = '';
  const e = 480;
  for (let x = -e; x <= W + e; x += 48) g += `M${x},${-e}L${x},${H + e}`;
  for (let y = -e; y <= H + e; y += 48) g += `M${-e},${y}L${W + e},${y}`;
  let b = `<path d="${g}" stroke="${COR.grid}" stroke-width="1.5"/>`;
  for (const [c, x, y, rx, ry, ph] of [['#d7e4ee', 360, 400, 440, 300, 0], ['#f8e2c2', 1050, 720, 600, 280, 1.7], ['#f3dada', 1580, 330, 420, 300, 3.1]]) {
    b += `<ellipse cx="${f(x + Math.sin(t * 0.35 + ph) * 40)}" cy="${f(y + Math.cos(t * 0.3 + ph) * 26)}" rx="${rx}" ry="${ry}" fill="${c}" opacity=".62"/>`;
  }
  for (const [x, y, k] of [[120, 560, 'x'], [1350, 175, 'tri'], [760, 205, 'o'], [1880, 440, 'x'], [640, 560, 'o'], [1660, 230, 'o']]) {
    const yy = y + Math.sin(t * 0.8 + x) * 6;
    if (k === 'x') b += `<path d="M${x - 10},${f(yy - 10)} l20,20 M${x + 10},${f(yy - 10)} l-20,20" stroke="${COR.tan}" stroke-width="4" stroke-linecap="round"/>`;
    else if (k === 'tri') b += `<path d="M${x},${f(yy - 12)} l12,20 l-24,0Z" fill="none" stroke="${COR.tan}" stroke-width="3.5" stroke-linejoin="round"/>`;
    else b += `<circle cx="${x}" cy="${f(yy)}" r="9" fill="none" stroke="${COR.tan}" stroke-width="3"/>`;
  }
  return s + `<g transform="translate(960 540) scale(${f(zb)}) translate(-960 -540)">${b}</g>`;
}

// ---------- camada distante: silhuetas suaves da cidade ----------
function skyline(t) {
  const prs = [[-30, 120, 210], [96, 70, 150], [1300, 96, 236], [1404, 70, 168], [1588, 104, 300], [1700, 66, 196], [1820, 140, 258]];
  let s = '';
  for (const [x, w, h] of prs) {
    s += `<rect x="${x}" y="${CHAO - h}" width="${w}" height="${h + 6}" rx="10" fill="${COR.lblue}" opacity=".38"/>`;
    for (let y = CHAO - h + 26; y < CHAO - 30; y += 34) {
      for (let xx = x + 16; xx < x + w - 20; xx += 26) s += `<rect x="${xx}" y="${y}" width="12" height="14" rx="3" fill="#fff" opacity="${f(0.35 + 0.15 * Math.sin(xx + y + t * 1.5))}"/>`;
    }
  }
  return s;
}

// nuvens chapadas com contorno (união de círculos)
function nuvem(x, y, sc, t, ph = 0) {
  const xx = x + Math.sin(t * 0.5 + ph) * 14 + t * 6, yy = y + Math.sin(t * 0.9 + ph) * 5;
  const cs = [[-46, 2, 26], [-8, -16, 36], [34, -4, 28], [62, 8, 18]];
  let s = '';
  for (const [cx, cy, r] of cs) s += `<circle cx="${cx}" cy="${cy}" r="${r + 3.5}" fill="${INK}"/>`;
  s += `<rect x="-76.5" y="0" width="160" height="29.5" rx="14.75" fill="${INK}"/>`;
  for (const [cx, cy, r] of cs) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/>`;
  s += `<rect x="-73" y="3.5" width="153" height="22.5" rx="11.25" fill="#fff"/>`;
  s += `<path d="M-30,-20 Q-16,-38 4,-36" stroke="${COR.lblue}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(${f(xx)} ${f(yy)}) scale(${sc})">${s}</g>`;
}

// ---------- árvore estilizada (tons de azul da marca) e poste ----------
function arvore(x, t, sc = 1) {
  const sw = Math.sin(t * 1.4 + x) * 2.2;
  const cs = [[-44, -150, 38, COR.blue2], [46, -154, 36, COR.blue2], [0, -186, 58, COR.blue3], [-30, -226, 40, COR.blue3], [28, -230, 38, COR.blue3]];
  let copa = '';
  for (const [cx, cy, r] of cs) copa += `<circle cx="${cx}" cy="${cy}" r="${r + 3.5}" fill="${INK}"/>`;
  for (const [cx, cy, r, c] of cs) copa += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
  copa += `<path d="M-40,-238 Q-24,-258 0,-252" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`
    + `<circle cx="-14" cy="-176" r="5" fill="#fff" opacity=".35"/><circle cx="24" cy="-200" r="4" fill="#fff" opacity=".35"/>`;
  return `<g transform="translate(${x} ${CHAO}) scale(${sc})">`
    + `<path d="M-9,0 L-6,-140 L6,-140 L9,0Z" fill="${COR.slate}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="M0,-96 L-22,-122 M2,-112 L20,-132" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    + `<g transform="rotate(${f(sw)} 0 -140)">${copa}</g></g>`;
}
function poste(x, t) {
  const pul = 0.85 + 0.15 * Math.sin(t * 3);
  return `<circle cx="${x + 34}" cy="${CHAO - 268}" r="${f(70 * pul)}" fill="url(#chegada_lamp)"/>`
    + `<rect x="${x - 7}" y="${CHAO - 290}" width="14" height="290" rx="5" fill="${COR.navy}" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M${x},${CHAO - 284} Q${x + 4},${CHAO - 312} ${x + 34},${CHAO - 300}" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>`
    + `<path d="M${x + 18},${CHAO - 296} L${x + 50},${CHAO - 296} L${x + 44},${CHAO - 276} L${x + 24},${CHAO - 276}Z" fill="${COR.orange}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
    + `<rect x="${x - 18}" y="${CHAO - 14}" width="36" height="14" rx="4" fill="${COR.slate}" stroke="${INK}" stroke-width="3"/>`;
}

// ---------- cartão-calendário "JULHO 2026" com odômetro no ano ----------
function odometro(t, t0) {
  const dig = [2, 0, 2, 6];
  const size = 116, LH = 150, base = 66;
  const ws = dig.map(d => largura(String(d), size, 900));
  const gap = 4;
  const tot = ws.reduce((a, b) => a + b, 0) + gap * 3;
  let x = -tot / 2;
  let nitido = '', borrado = '';
  dig.forEach((d, i) => {
    const Ti = t0 + 0.5 + i * 0.1;
    const N = 5 + i * 2;
    const P = tt => N * (1 - ease.out(inv(t0 - 0.06, Ti, tt))) - 0.14 * Math.sin(Math.PI * inv(Ti - 0.03, Ti + 0.2, tt));
    const p = P(t);
    const v = Math.abs(p - P(t - 1 / 30));
    const cx = x + ws[i] / 2;
    const m0 = Math.floor(p);
    // dígitos sempre nítidos (legíveis enquanto giram) + um rastro leve acima quando rápidos
    for (let m = m0; m <= m0 + 1; m++) {
      const val = (((d - m) % 10) + 10) % 10;
      const y = base + (m - p) * LH;
      const fill = i === 3 ? COR.orange : COR.navy;
      nitido += txt(String(val), cx, y, { size, weight: 900, fill });
      if (v > 0.08) borrado += txt(String(val), cx, y - Math.min(40, v * LH * 0.45), { size, weight: 900, fill, extra: 'opacity=".22"' });
    }
    x += ws[i] + gap;
  });
  return `<clipPath id="chegada_odo"><rect x="-150" y="${base - 100}" width="300" height="118"/></clipPath>`
    + `<g clip-path="url(#chegada_odo)">${borrado}${nitido}</g>`;
}

function calendario(t, t0, tOut, sx, sy) {
  const ta = t0 + 0.08;
  const k = back(t, ta, 0.5);
  if (k <= 0.001) return '';
  const bob = Math.sin(t * 2.1) * 5;
  const rot = lerp(-15, -4, ease.out(inv(ta, ta + 0.55, t))) + Math.sin(t * 1.6) * 0.8;
  const tLand = t0 + 0.8;
  let s = '';
  s += onda(0, 0, t - tLand, { r0: 140, r1: 250, w: 10, d: 0.5 });
  s += cartao(-155, -128, 310, 262, { r: 22 });
  s += `<path d="M-155,-50 L-155,-106 Q-155,-128 -133,-128 L133,-128 Q155,-128 155,-106 L155,-50Z" fill="${COR.orange}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  for (const rx of [-92, 92]) s += `<circle cx="${rx}" cy="-112" r="6" fill="${INK}" opacity=".5"/><rect x="${rx - 7}" y="-150" width="14" height="40" rx="7" fill="${COR.navy}" stroke="${INK}" stroke-width="3"/>`;
  s += txt('JULHO', 4, -71, { size: 46, weight: 900, fill: '#fff', ls: 8 });
  s += odometro(t, t0);
  s += txt('INÍCIO DA TRAJETÓRIA', 1.5, 112, { size: 15, weight: 700, family: 'DM Sans', fill: COR.grey, ls: 3 });
  s += varredura('chegada_cv', -155, -128, 310, 262, inv(tLand + 0.05, tLand + 0.6, t), 22);
  // faíscas de pouso do ano
  s += faiscas(118, -10, t - tLand, COR.orange, 8, 30, 74);
  const ks = back(t, tLand + 0.02, 0.4);
  if (ks > 0) s += `<g transform="translate(150 -120) scale(${f(ks)}) rotate(${f(t * 40)})">${icone('sparkle', 0, 0, 0.8)}</g>`;
  // saída: recua e dispara para a esquerda (back-in), com rastro de movimento
  const uo = inv(tOut, tOut + 0.28, t);
  if (uo >= 1) return '';
  const dx = -900 * backIn(uo);
  const card = (x, extra = '') => `<g transform="translate(${f(430 + x + sx)} ${f(374 + bob + sy)}) rotate(${f(rot - 10 * ease.in(uo))}) scale(${f(k)})"${extra}>${s}</g>`;
  let out = '';
  if (uo > 0.25) out += card(dx + 70 * ease.in(uo) * 3, ` filter="url(#fxBlurX)" opacity="${f(0.55 * (1 - uo))}"`);
  return out + card(dx);
}

// ---------- prédio: janelas acesas e varredura de luz ----------
function janelasAcesas(t, tA) {
  let s = '';
  const X = u => OX + u * K, Y = v => CHAO - (512 - v) * K;
  for (const [u0, u1, v0] of [[397, 463, 290], [567, 628, 270], [650, 700, 365]]) {
    for (let v = v0; v < 470; v += 34) {
      const y = Y(v);
      const k = fin(t, tA + (CHAO - y) / 640 * 0.45, 0.12);
      if (k <= 0) continue;
      const fl = 0.6 + 0.4 * Math.sin(t * 9 + v);
      const wx = X(u0 + 10), ww = (u1 - u0 - 20) * K, wh = 14 * K;
      s += `<rect x="${f(wx)}" y="${f(y)}" width="${f(ww)}" height="${f(wh)}" rx="3" fill="${COR.orange2}" stroke="${COR.orange}" stroke-width="2" opacity="${f(k)}"/>`
        + `<rect x="${f(wx + ww * 0.2)}" y="${f(y + wh * 0.2)}" width="${f(ww * 0.6)}" height="${f(wh * 0.6)}" rx="2" fill="#fff" opacity="${f(0.35 * fl * k)}"/>`;
    }
  }
  return s;
}
function brilhoPredio(t, tA) {
  const u = inv(tA - 0.05, tA + 0.55, t);
  if (u <= 0 || u >= 1) return '';
  const bx = lerp(420, 1420, ease.inOut(u));
  return `<clipPath id="chegada_bc">${marcaAM(OX, CHAO, K)}</clipPath>`
    + `<g clip-path="url(#chegada_bc)"><path d="M${f(bx)},180 L${f(bx + 120)},180 L${f(bx - 70)},860 L${f(bx - 190)},860Z" fill="#fff" opacity=".6"/><path d="M${f(bx + 150)},180 L${f(bx + 175)},180 L${f(bx - 15)},860 L${f(bx - 40)},860Z" fill="#fff" opacity=".45"/></g>`;
}

// ---------- porta DTS (sobreposta à porta de predioAM) ----------
// lavRampa: brilho crescente do interior (por BAIXO da silhueta); lavTroca: clarão curto que
// esconde a troca Victor de fora -> de dentro (por CIMA de tudo no vão).
function porta(t, open, L, dentro, lavRampa, lavTroca, uP) {
  const longe = 1 - inv(0.6, 0.78, uP);   // filtros somem quando já estão fora do quadro
  const kw = ease.inOut(inv(0.3, 0.62, uP)); // a luz "transborda" sobre o batente (aquece os escuros)
  let s = '';
  s += `<rect x="${f(DX - FR)}" y="${f(DTOP - FR)}" width="${f(DW + 2 * FR)}" height="${f(DH + FR)}" rx="6" fill="${COR.navy}" stroke="${INK}" stroke-width="3.5"/>`;
  if (kw > 0.001) {
    const e = (FR + 2) * kw;
    s += `<rect x="${f(DX - e)}" y="${f(DTOP - e)}" width="${f(DW + 2 * e)}" height="${f(DH + e)}" rx="${f(6 * kw)}" fill="${mix(COR.orange, COR.orange2, kw)}"/>`;
  }
  let v = `<rect x="${f(DX)}" y="${f(DTOP)}" width="${f(DW)}" height="${DH}" fill="#fff"/>`
    + `<rect x="${f(DX)}" y="${f(DTOP)}" width="${f(DW)}" height="${DH}" fill="${COR.lblue}" opacity="${f(0.55 * (1 - L))}"/>`
    + `<rect x="${f(DX)}" y="${f(DTOP)}" width="${f(DW)}" height="${DH}" fill="url(#chegada_int)" opacity="${f(lerp(0.4, 1, L))}"/>`;
  // piso interno em perspectiva (linhas de luz)
  if (L > 0) v += `<path d="M${f(DX)},${CHAO - 30} L${f(DX + DW)},${CHAO - 30} M${f(DCX)},${CHAO - 30} L${f(DCX - 40)},${CHAO} M${f(DCX)},${CHAO - 30} L${f(DCX + 40)},${CHAO}" stroke="${COR.orange}" stroke-width="2.5" opacity="${f(0.35 * L)}"/>`;
  if (lavRampa > 0) v += `<rect x="${f(DX)}" y="${f(DTOP)}" width="${f(DW)}" height="${DH}" fill="#fff" opacity="${f(lavRampa)}"/>`;
  v += dentro;
  if (lavTroca > 0) v += `<rect x="${f(DX)}" y="${f(DTOP)}" width="${f(DW)}" height="${DH}" fill="#fff" opacity="${f(lavTroca)}"/>`;
  // folhas de vidro deslizando
  const pw = DW / 2 - 3;
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? DX + 2 - open * (pw + 6) : DX + DW / 2 + 1 + open * (pw + 6);
    if (open >= 0.999) continue;
    v += `<rect x="${f(x0)}" y="${f(DTOP + 2)}" width="${f(pw)}" height="${DH - 2}" fill="${COR.lblue}" opacity=".55" stroke="${INK}" stroke-width="2.5"/>`
      + `<path d="M${f(x0 + 14)},${f(DTOP + 30)} l22,-14 M${f(x0 + 14)},${f(DTOP + 52)} l36,-24" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".8"/>`
      + `<rect x="${f(side < 0 ? x0 + pw - 14 : x0 + 8)}" y="${f(DTOP + DH * 0.48)}" width="6" height="34" rx="3" fill="${COR.slate}"/>`;
  }
  s += `<clipPath id="chegada_porta"><rect x="${f(DX)}" y="${f(DTOP)}" width="${f(DW)}" height="${DH}"/></clipPath><g clip-path="url(#chegada_porta)">${v}</g>`;
  // soleira
  s += `<rect x="${f(DX - FR - 10)}" y="${CHAO - 5}" width="${f(DW + 2 * FR + 20)}" height="11" rx="4" fill="${mix(COR.slate, COR.orange2, kw)}" stroke="${kw > 0.5 ? COR.orange : INK}" stroke-width="3"/>`;
  // halo de luz nas bordas do vão
  if (L * longe > 0.01) s += `<rect x="${f(DX + 2)}" y="${f(DTOP + 2)}" width="${f(DW - 4)}" height="${DH - 4}" fill="none" stroke="#fff" stroke-width="12" filter="url(#fxGlowForte)" opacity="${f(L * 0.95 * longe)}"/>`;
  return s;
}

// placa DTS (desenhada por cima das partículas, para o letreiro ficar sempre limpo)
function placa(t, L, tOpen, uP) {
  const longe = 1 - inv(0.6, 0.78, uP);
  const sx = DX - 24, sw = DW + 48;
  let s = '';
  const gl = (Math.max(0, Math.sin(Math.PI * inv(tOpen - 0.02, tOpen + 0.5, t))) + 0.35 * L) * longe;
  if (gl > 0.01) s += `<rect x="${f(sx)}" y="${f(SIGN_T)}" width="${f(sw)}" height="52" rx="12" fill="${COR.orange2}" filter="url(#fxGlow)" opacity="${f(clamp(gl))}"/>`;
  s += `<rect x="${f(sx + 4)}" y="${f(SIGN_T + 6)}" width="${f(sw)}" height="52" rx="12" fill="rgba(22,35,59,.18)"/>`
    + `<rect x="${f(sx)}" y="${f(SIGN_T)}" width="${f(sw)}" height="52" rx="12" fill="${COR.orange}" stroke="${INK}" stroke-width="3.5"/>`
    + txt('DTS', DCX + 2.5, SIGN_T + 39, { size: 36, weight: 900, fill: '#fff', ls: 5 });
  return s;
}

// ---------- raios de luz saindo da porta ----------
function raios(t, L) {
  if (L <= 0.01) return '';
  const n = 18, rot = t * 12, R = 1500;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360 + rot, hw = i % 2 ? 3.2 : 5.5;
    const a1 = (a - hw) * Math.PI / 180, a2 = (a + hw) * Math.PI / 180;
    d += `M${f(DCX)},${f(DCY)} L${f(DCX + Math.cos(a1) * R)},${f(DCY + Math.sin(a1) * R)} L${f(DCX + Math.cos(a2) * R)},${f(DCY + Math.sin(a2) * R)}Z`;
  }
  return `<path d="${d}" fill="url(#chegada_raio)" opacity="${f(L)}"/>`;
}

// partículas de luz flutuando para fora da porta
function motas(t, tOpen, L, tEnt, uP) {
  L *= 1 - inv(0.42, 0.6, uP);           // somem antes da fase final do mergulho
  if (L <= 0.01) return '';
  const limpa = t < tEnt + 0.3;          // enquanto o Victor está no vão, nada passa sobre ele
  const r = rng(321);
  let s = '';
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.6, sp = 160 + r() * 260, ph = r(), sz = 3 + r() * 5;
    const age = ((t - tOpen) * 0.9 + ph) % 1;
    const x = DCX + (r() - 0.5) * DW * 0.8 + Math.cos(a) * sp * age;
    const y = DCY + (r() - 0.3) * DH * 0.6 + Math.sin(a) * sp * age * 0.7;
    if (limpa && x > DX - 12 && x < DX + DW + 12 && y > DTOP - 12) continue;
    if (y < SIGN_T + 60 && y > SIGN_T - 12 && x > DX - 36 && x < DX + DW + 36) continue;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(sz * (1 - age * 0.5))}" fill="${i % 3 ? '#fff' : COR.orange2}" opacity="${f(L * (1 - age) * 0.95)}"/>`;
  }
  return s;
}

// ---------- pino de localização + rótulo ALVAREZ & MARSAL ----------
function pino(t, tC) {
  const kd = inv(tC - 0.3, tC, t);
  if (kd <= 0) return '';
  const y = lerp(-760, 0, ease.in(kd));
  const a = t - tC;
  const sq = a > 0 ? Math.sin(a * 24) * Math.exp(-a * 7) : 0;
  const bob = a > 0 ? Math.sin(a * 3.2) * 4 * clamp(a * 2) : 0;
  let s = '';
  if (kd < 1) s += `<path d="M${f(DCX - 14)},${f(SIGN_T + y - 70)} L${f(DCX + 14)},${f(SIGN_T + y - 70)} L${f(DCX + 4)},${f(SIGN_T + y - 70 - 260 * kd)} L${f(DCX - 4)},${f(SIGN_T + y - 70 - 260 * kd)}Z" fill="${COR.orange2}" opacity=".55"/>`;
  // ondulação no pouso
  if (a > 0 && a < 0.6) {
    const e = ease.out(a / 0.6);
    s += `<ellipse cx="${f(DCX)}" cy="${f(SIGN_T)}" rx="${f(lerp(26, 170, e))}" ry="${f(lerp(7, 40, e))}" fill="none" stroke="${COR.orange}" stroke-width="${f(8 * (1 - e) + 1)}" opacity="${f(1 - e)}"/>`;
  }
  s += particulas(97, DCX, SIGN_T - 30, a, { n: 16, v: 300, d: 0.7, g: 200, sz: 10 });
  const body = `<ellipse cx="0" cy="0" rx="${f(18 * (1 + sq * 0.4))}" ry="4" fill="rgba(22,35,59,.25)"/>`
    + `<g transform="translate(0 ${f(bob)}) scale(${f(1 + 0.2 * sq)} ${f(1 - 0.2 * sq)})"><path d="${PIN_PATH}" fill="${COR.navy}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
    + `<circle cx="0" cy="-56" r="13" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/><circle cx="-5" cy="-61" r="4" fill="#fff" opacity=".85"/></g>`;
  s += `<g transform="translate(${f(DCX)} ${f(SIGN_T + y)})">${body}</g>`;
  return s;
}

function rotulo(t, P) {
  const [tA, tE, tM] = P;
  const u = inv(tA - 0.1, tA + 0.12, t);
  if (u <= 0) return '';
  const size = 28, ls = 2;
  const words = [['ALVAREZ', tA], ['&', tE], ['MARSAL', tM]];
  const ww = words.map(([w]) => largura(w, size, 800) + ls * w.length);
  const sp = 12;
  const x0 = DCX + 4, cy = PIN_HEAD, h = 58;
  const mx = x0 + 44;              // marca A&M
  const tx = mx + 54;              // início do texto
  // a pílula cresce acompanhando cada palavra dita
  let alvo = tx - x0 + 24 - sp;
  // MARSAL entra mais cedo e mais curto, para a pílula assentar antes do mergulho
  const pop = i => (i === 2 ? [-0.1, 0.2] : [-0.05, 0.32]);
  words.forEach(([, tw0], i) => { alvo += (ww[i] + sp) * ease.back(inv(tw0 + pop(i)[0] - 0.03, tw0 + pop(i)[0] + pop(i)[1] * 0.8, t)); });
  const pw = Math.max(h, alvo * ease.out(u));
  const bob = Math.sin((t - tA) * 3.2) * 4 * clamp((t - tA) * 2);
  let b = `<rect x="${f(x0 + 5)}" y="${f(cy - h / 2 + 7)}" width="${f(pw)}" height="${h}" rx="${h / 2}" fill="rgba(22,35,59,.16)"/>`
    + pilula(x0, cy - h / 2, pw, h, '#fff', INK, 3.5);
  let inner = marcaAM(mx, cy + 15, 0.058);
  let x = tx;
  words.forEach(([w, tw0], i) => {
    const k = back(t, tw0 + pop(i)[0], pop(i)[1]);
    if (k > 0.001) {
      const o = clamp(k * 2);
      inner += `<g transform="translate(${f(x)} ${f(cy + 10 + (1 - k) * 18)})" opacity="${f(o)}">${txt(w, 0, 0, { anchor: 'start', size, weight: 800, fill: i === 1 ? COR.orange : COR.navy, ls })}</g>`;
    }
    x += ww[i] + sp;
  });
  b += `<clipPath id="chegada_lbl"><rect x="${f(x0)}" y="${f(cy - h / 2)}" width="${f(pw)}" height="${h}" rx="${h / 2}"/></clipPath><g clip-path="url(#chegada_lbl)">${inner}</g>`;
  b += varredura('chegada_lv', x0, cy - h / 2, pw, h, inv(tM + 0.02, tM + 0.3, t), h / 2);
  return `<g transform="translate(0 ${f(bob)})">${b}</g>`;
}

// ---------- Victor ----------
function victor(t, T) {
  const { t0, tArr, tOpen, tEnt } = T;
  const xA = 250, xB = DCX - 54;
  const a = 0.78, norm = a + (1 - a) / 2;
  const u = inv(t0, tArr, t);
  const g = (u < a ? u : a + (u - a) - (u - a) ** 2 / (2 * (1 - a))) / norm;
  const vrel = t < tArr ? (u < a ? 1 : 1 - (u - a) / (1 - a)) : 0;
  const x = lerp(xA, xB, g);
  const andando = t < tArr - 0.01;
  const walk = andando ? x / 190 : null;

  const hop = 16 * Math.sin(Math.PI * inv(tOpen, tOpen + 0.18, t));
  const braco = lerp(14, 58, ease.out(inv(tOpen, tOpen + 0.15, t)));
  const expr = t < T.tA ? 'smile' : t < tOpen ? 'joy' : 'wow';
  const gaze = andando ? [1, -0.4] : [0.2, -1];

  let fora = '', dentro = '';
  if (t < tEnt) {
    const s = 0.78;
    // rastros de velocidade e poeira dos passos
    if (vrel > 0.2) {
      for (let i = 0; i < 3; i++) {
        const yy = CHAO - (78 + i * 46) * s;
        const len = (46 + 26 * Math.sin(t * 19 + i * 2.1)) * vrel;
        const x1 = x - 66 * s - 6 - i * 10;
        fora += `<path d="M${f(x1)},${f(yy)} L${f(x1 - len)},${f(yy)}" stroke="${COR.slate}" stroke-width="5" stroke-linecap="round" opacity="${f(0.6 * vrel)}"/>`;
      }
      const steps = (x / 190) * 2, fr = steps % 1;
      for (let q = 0; q < 3; q++) {
        const age = fr + q;
        fora += `<circle cx="${f(x - 16 - age * 95)}" cy="${CHAO - 8}" r="${f(6 + age * 5)}" fill="${COR.tan}" opacity="${f(0.45 * (1 - age / 3) * vrel)}"/>`;
      }
    }
    const st = { x, y: CHAO, s, t, walk, lean: 7 * vrel, expr, gaze, hop: Math.max(0, hop) };
    if (!andando) { st.armL = braco; st.armR = braco; }
    // halo creme suave: separa o blazer navy da perna navy do "A" quando ele passa na frente
    const kh = 1 - inv(xB - 170, xB - 40, x);   // só enquanto ele cruza a perna do "A"
    if (kh > 0.01) fora += `<ellipse cx="${f(x)}" cy="${f(CHAO - 112 * s)}" rx="${f(86 * s + 14)}" ry="${f(132 * s)}" fill="url(#chegada_halo)" opacity="${f(kh)}"/>`;
    fora += pessoa('victor', st);
  } else {
    // entra em contraluz: mesma pose/posição do quadro anterior, vira silhueta nítida, encolhe rumo
    // ao fundo e some num ponto de luz (sem fade: nunca vira "fantasma" cinza)
    const k = ease.inOut(inv(tEnt, tEnt + 0.3, t));
    const s = lerp(0.78, 0.42, k);
    const y = lerp(CHAO, CHAO - 40, k);
    const tV = tEnt + 0.15;
    const kv = ease.in(inv(tV, tV + 0.1, t));
    const xx = lerp(xB, DCX, ease.out(inv(tEnt, tEnt + 0.22, t)));
    const cy = y - 125 * s;
    if (kv < 0.999) {
      const walkP = (t - tEnt) * 2.6;
      const kb = ease.out(inv(tEnt, tEnt + 0.15, t));
      const sw = Math.sin(walkP * Math.PI * 2) * 16;
      const st = {
        x: xx, y, s, t, walk: walkP, lean: 5 * kb, expr: 'wow', gaze: [0, -1],
        armL: lerp(58, 14 + sw, kb), armR: lerp(58, 14 - sw, kb),
        hop: Math.max(0, 16 * Math.sin(Math.PI * inv(tOpen, tOpen + 0.18, t))) * (1 - inv(tEnt, tEnt + 0.05, t)),
      };
      const sil = ease.out(inv(tEnt - 0.03, tEnt + 0.03, t));
      const corpo = `${sil < 0.999 ? pessoa('victor', st) : ''}<g filter="url(#chegada_sil)" opacity="${f(sil)}">${pessoa('victor', st)}</g>`;
      dentro = kv > 0.001 ? `<g transform="translate(${f(xx)} ${f(cy)}) scale(${f(1 - kv)} ${f(1 - kv * 0.7)}) translate(${f(-xx)} ${f(-cy)})">${corpo}</g>` : corpo;
    }
    // cintilação no ponto onde ele some
    const tw = t - (tV + 0.07);
    dentro += faiscas(xx, cy, tw * 1.6, COR.orange, 8, 8, 34);
    const ks = Math.sin(Math.PI * clamp(tw / 0.18)) * (tw > 0 ? 1 : 0);
    if (ks > 0.01) dentro += `<g transform="translate(${f(xx)} ${f(cy)}) rotate(${f(tw * 260)}) scale(${f(ks * 0.6)})"><path d="M0,-34 Q5,-5 34,0 Q5,5 0,34 Q-5,5 -34,0 Q-5,-5 0,-34Z" fill="#fff" stroke="${COR.orange}" stroke-width="4" stroke-linejoin="round"/></g>`;
  }
  return { fora, dentro, x };
}

// rota tracejada no chão: o caminho percorrido (laranja) e o que falta (pontilhado)
function rota(t, xv, chegou) {
  const y = CHAO + 24, x0 = 150;
  let s = `<path d="M${f(xv)},${y} L${f(DCX)},${y}" stroke="${COR.tan}" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round" opacity=".9"/>`;
  s += `<path d="M${x0},${y} L${f(xv)},${y}" stroke="${COR.orange}" stroke-width="6" stroke-dasharray="20 14" stroke-dashoffset="${f(-t * 40)}" stroke-linecap="round"/>`;
  s += `<circle cx="${x0}" cy="${y}" r="8" fill="#fff" stroke="${COR.orange}" stroke-width="4"/>`;
  const kc = back(t, chegou, 0.35);
  s += `<circle cx="${f(DCX)}" cy="${y}" r="${f(9 + 3 * kc)}" fill="${kc > 0.5 ? COR.orange : '#fff'}" stroke="${COR.orange}" stroke-width="4"/>`;
  return s;
}

// rastros radiais (desfoque de movimento do mergulho), em coordenadas de tela
function rastros(t, k, cx, cy) {
  if (k <= 0.01) return '';
  const r = rng(77);
  let s = '';
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, ph = r(), sp = 1.8 + r() * 1.6, wd = 2.5 + r() * 4.5;
    const u = (t * sp + ph) % 1;
    const r0 = 70 + u * u * 1200;
    const len = (50 + 560 * u) * k;
    const c = i % 4 === 0 ? COR.orange : i % 4 === 2 ? COR.orange2 : '#fff';
    const ca = Math.cos(a), sa = Math.sin(a);
    const ex = cx + ca * (r0 + len), ey = cy + sa * (r0 + len);
    if (ex < 480 && ey < 200) continue;   // não cruza o header
    s += `<path d="M${f(cx + ca * r0)},${f(cy + sa * r0)} L${f(cx + ca * (r0 + len))},${f(cy + sa * (r0 + len))}" stroke="${c}" stroke-width="${f(wd)}" stroke-linecap="round" opacity="${f(k * (0.3 + 0.6 * u))}"/>`;
  }
  return s;
}

export function desenhar(t, ctx) {
  const { t0, t1, wa } = ctx;
  const tC = wa(9);             // "Cheguei"
  const tA = wa(11);            // "Alvarez"
  const tE = wa(12);            // "&"
  const tOpen = wa(13);         // "Marsal,"
  const tArr = tOpen - 0.1;     // Victor chega à porta
  const tEnt = tOpen + 0.17;    // Victor entra
  const tP = tOpen + 0.16;      // início do mergulho da câmera

  // ---------- câmera ----------
  const uD = ease.sine(inv(t0, tP, t));
  const uP = inv(tP, t1, t);
  const Z = (1 + 0.05 * uD) * Math.exp(Math.log(16) * uP * uP);
  const C0x = 960 + lerp(-30, 40, uD), C0y = 540 + 6 * uD;
  const w = ease.inOut(inv(tP - 0.06, tP + 0.34, t));
  const Cx = lerp(C0x, DCX, w), Cy = lerp(C0y, DCY - 6, w);
  const [shx, shy] = tremor(t, tOpen, 0.32, 8);
  const rum = 2.5 * uP;
  const sx = shx + Math.sin(t * 71) * rum, sy = shy + Math.cos(t * 63) * rum;
  const cam = (z, cx, cy) => `translate(${f(960 + sx)} ${f(540 + sy)}) scale(${f(z)}) translate(${f(-cx)} ${f(-cy)})`;

  // luz e portas
  const open = ease.inOut(inv(tOpen - 0.04, tOpen + 0.2, t));
  const L = ease.out(inv(tOpen - 0.02, tOpen + 0.2, t));

  // ---------- montagem ----------
  let s = defs();
  s += fundo(t, 1 + (Z - 1) * 0.18);

  // camada distante (paralaxe)
  const Zf = 1 + (Z - 1) * 0.5, Cfx = lerp(960, Cx, 0.55), Cfy = lerp(540, Cy, 0.55);
  const kn = 1 - ease.inOut(inv(tP, tP + 0.2, t));
  const nuvens = kn > 0.001 ? `<g opacity="${f(kn)}">${nuvem(700, 330, 0.85, t, 0)}${nuvem(1470, 300, 1.05, t, 2)}${nuvem(1790, 410, 0.6, t, 4)}</g>` : '';
  s += `<g transform="${cam(Zf, Cfx, Cfy)}">${skyline(t)}${nuvens}</g>`;

  // mundo
  const V = victor(t, { t0, tArr, tOpen, tEnt, tA });
  // pílula + pino: recolhem para dentro da ponta do pino quando o mergulho já começou
  const ko = ease.in(inv(tP + 0.12, tP + 0.24, t));
  let m = `<rect x="-400" y="${CHAO}" width="${W + 800}" height="5" rx="2" fill="#d9ccb4"/>`;
  m += raios(t, L * 0.72);
  m += rota(t, Math.min(DCX, V.x + 54 * ease.out(inv(tArr - 0.1, tOpen, t))), tOpen);
  m += arvore(1500, t) + poste(1785, t);
  // prédio com "respiração" na batida de Alvarez
  const bsy = 1 + 0.028 * Math.sin(Math.PI * inv(tA, tA + 0.32, t));
  let pr = predioAM(OX, CHAO, K, t, 0) + janelasAcesas(t, tA) + brilhoPredio(t, tA);
  m += `<g transform="translate(0 ${CHAO}) scale(1 ${f(bsy)}) translate(0 ${-CHAO})">${pr}</g>`;
  // no mergulho, a luz da porta inunda a fachada como uma onda (frente nítida: sem fase "lamacenta")
  const kfl = ease.inOut(inv(0.3, 0.72, uP));
  if (kfl > 0.001) {
    const RW = lerp(DW * 0.55, 620, kfl);
    m += `<clipPath id="chegada_fl">${marcaAM(OX, CHAO, K)}</clipPath>`
      + `<g clip-path="url(#chegada_fl)"><circle cx="${f(DCX)}" cy="${f(DCY)}" r="${f(RW)}" fill="url(#chegada_flood)"/></g>`;
  }
  // luz derramada no chão
  if (L > 0.01) m += `<path d="M${f(DX)},${CHAO} L${f(DX + DW)},${CHAO} L${f(DX + DW + 330)},${H + 260} L${f(DX - 330)},${H + 260}Z" fill="url(#chegada_spill)" opacity="${f(L)}"/>`;
  // onda de abertura nasce ATRÁS do batente
  m += onda(DCX, DCY, t - tOpen, { r0: 140, r1: 480, w: 6, cor: COR.orange2, d: 0.55 });
  // brilho do interior: rampa por baixo da silhueta + clarão curto (100% branco) na troca fora -> dentro
  const lavR = 0.88 * ease.in(inv(tEnt + 0.12, tEnt + 0.48, t));
  const ut = t - tEnt;
  const lavT = ut < 0 ? ease.in(inv(-0.06, 0, ut)) : 1 - inv(0.025, 0.04, ut);
  m += porta(t, open, L, V.dentro, lavR, lavT, uP);
  m += particulas(55, DCX, DCY - 20, t - tOpen - 0.03, { n: 22, v: 520, d: 0.8, g: 60, sz: 11, cores: ['#fff', COR.orange2, COR.orange, '#fff'] });
  m += V.fora;
  m += motas(t, tOpen, L, tEnt, uP);
  m += placa(t, L, tOpen, uP);
  if (ko < 0.999) m += `<g transform="translate(${f(DCX)} ${f(SIGN_T)}) scale(${f(1 - ko)}) translate(${f(-DCX)} ${f(-SIGN_T)})">${rotulo(t, [tA, tE, tOpen])}${pino(t, tC)}</g>`;
  s += `<g transform="${cam(Z, Cx, Cy)}">${m}</g>`;
  // aquece os escuros na fase final (screen: navy vira âmbar em vez de cinza)
  const kq = inv(0.45, 0.8, uP);
  if (kq > 0.001) s += `<rect width="${W}" height="${H}" fill="${COR.orange2}" style="mix-blend-mode:screen" opacity="${f(0.6 * kq)}"/>`;

  // eco do prédio (desfoque radial do mergulho)
  const kg = inv(0.12, 0.7, uP) * (1 - inv(0.85, 1, uP));
  if (kg > 0.01) {
    const eco = marcaAM(OX, CHAO, K, { c1: '#fff', c2: COR.orange2, c3: 'none', c4: 'none' }) + `<rect x="${f(DX - FR)}" y="${f(DTOP - FR)}" width="${f(DW + 2 * FR)}" height="${f(DH + FR)}" rx="6" fill="none" stroke="#fff" stroke-width="10"/>`;
    for (const [gk, go] of [[1.06, 0.2], [1.13, 0.1]]) {
      s += `<g opacity="${f(go * kg)}" transform="translate(960 540) scale(${gk}) translate(-960 -540)"><g transform="${cam(Z, Cx, Cy)}">${eco}</g></g>`;
    }
  }

  // centro da porta na tela
  const pdx = (DCX - Cx) * Z + 960 + sx, pdy = (DCY - Cy) * Z + 540 + sy;
  s += rastros(t, inv(0.15, 0.55, uP), pdx, pdy);
  // clarão que engole o quadro
  const kb = Math.pow(uP, 1.4);
  if (kb > 0.001) {
    const R = 150 * Z;
    s += `<circle cx="${f(pdx)}" cy="${f(pdy)}" r="${f(R)}" fill="url(#chegada_bloom)" opacity="${f(0.6 * clamp(kb * 1.5))}"/>`;
  }
  // proteção creme do header (filme.js desenha o header navy por cima) só durante o mergulho
  const kh = inv(0.28, 0.45, uP);
  if (kh > 0.01) s += `<rect x="0" y="0" width="640" height="280" fill="url(#chegada_hdr)" opacity="${f(kh)}"/>`;
  // cartão-calendário em coordenadas de tela (o pan da câmera nunca o leva à zona do header)
  s += calendario(t, t0, tOpen + 0.02, sx, sy);
  const wf = ease.in(inv(t1 - 0.32, t1, t));
  if (wf > 0.001) s += `<rect width="${W}" height="${H}" fill="url(#chegada_fim)" opacity="${f(wf)}"/>`;
  return s;
}
