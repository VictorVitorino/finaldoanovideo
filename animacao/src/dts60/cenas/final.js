// Cena 9 · FINAL — "Isso é DTS. Isso é Performance Alvarez & Marsal." (≈ 52.37 → 60.0 s)
//
// Cartão final cinematográfico sobre navy premium (gradiente radial, grade de pontos, bokeh —
// sem linhas atravessando a tela). Hierarquia vertical centrada:
//   A&M | PERFORMANCE  ->  banner DTS (herói)  ->  ALVAREZ & MARSAL  ->  palco com a equipe
//   (os 3 diretores num praticável alto atrás — o tronco da diretora central fica acima da cabeça
//   do Victor —, Victor na frente) e o tablado com os chips
//   ENTREGA · PERFORMANCE · COLLECTION.
// Batidas (tempos absolutos, de tempos.json):
//   t0         cone de luz difuso acende; a equipe sobe pelo palco (elevador) e os ícones das entregas
//              flutuam nas laterais; câmera recua e inclina para cima.
//   wa(94)-.1  "Isso": ponto de luz + reflexo anamórfico curto onde o banner vai abrir; todos olham para cima.
//   wa(96)     "DTS.": o banner monta e D-T-S pousam juntos; IMPACTO em I1 = wa(96)+.08 (logo já completo):
//              onda, partículas, contraluz quente saindo de trás do banner, flash curto e tremor.
//   wa(97)     "Isso": uma linha laranja se desenha acima do banner (a máscara do próximo título).
//   wa(99)     "Performance": o lockup A&M | PERFORMANCE sobe letra a letra da linha; varredura de luz.
//   wa(100)    "Alvarez": a marca e ALVAREZ sobem letra a letra; "&" e MARSAL fecham rápido.
//   IMP        wa(102)+.14 "Marsal.": com o lockup já completo, IMPACTO final: onda, canhões de confete,
//              chuva de confete (atrás da marca e da equipe, com furo suave nas linhas de texto), contraluz,
//              tremor, equipe pula com os braços em V, faixa tricolor da newsletter na base.
//   wb(102)+   chips ENTREGA · PERFORMANCE · COLLECTION saltam no tablado; acenos (os 4 personagens).
//   ~58.5      o confete sai pela base por gravidade; quadro final assentado: nada entra; só respiração,
//              acenos, cintilação, ondas no piso, uma passada de luz no banner e zoom lento contínuo.
// Obs.: o banner é uma cópia local de bannerDTS (base.js) com as faixas diagonais deslocadas
// para a direita, para não cruzarem "Technology" (como na newsletter original).
import {
  COR, INK, W, H, txt, largura, pessoa, chipRotulo, icone,
  clamp, lerp, inv, ease, rng, n2, back, fin, popG,
  fundoNavy, varredura, onda, particulas, poeira, tremor, revela, hudCantos, lockupPerformance, lockupAM,
} from '../base.js';

const f = n2;

export const CHIP = ['CENA 9 · DTS', 'Performance A&M'];
export const ESCURO = true;

// ---------- geometria (coordenadas do "mundo", antes da câmera) ----------
const CX = 960;
// Fileira de trás (diretores) e Victor na frente com folga visível: o topo do cabelo do Victor
// (VIC_Y - 258·VIC_S ≈ 672) fica ~32 px abaixo dos pés dos diretores (RIS_Y) e abaixo do filete
// laranja do praticável — nada de "totem" (busto de diretora flutuando sobre a cabeça dele).
const PERF_Y = 146, PERF_S = 40;               // lockup A&M | PERFORMANCE (linha de base, tamanho)
const BX = 960, BY = 271, BS = 0.84;            // banner DTS (centro, escala)
const BW = 840 * BS, BH = 190 * BS;
const AM_Y = 438, AM_S = 34;                    // lockup ALVAREZ & MARSAL
const RIS_Y = 640, RIS_RX = 310, RIS_RY = 15;   // praticável dos diretores (pés)
const DIR_S = 0.68, DIR_DX = 200;
const ST_Y = 864, ST_RX = 470, ST_RY = 20, ST_H = 56; // tablado principal (topo elíptico + face)
const VIC_Y = 868, VIC_S = 0.76;
const CHIP_Y = ST_Y + ST_RY + (ST_H - ST_RY) / 2 + 8;
const PIV_X = 960, PIV_Y = 560;                 // pivô da câmera

// ícones das entregas flutuando nas laterais: [x, y, ícone, profundidade, fase]
const BADGES = [
  [262, 320, 'dash', 0.9, 0.0], [418, 530, 'deck', 1.0, 1.3], [236, 735, 'sparkle', 0.85, 2.1],
  [1658, 320, 'app', 0.9, 0.7], [1502, 530, 'game', 1.0, 2.6], [1684, 735, 'trophy', 0.85, 1.7],
];

const pulso = (t, a, d) => { const u = inv(a, a + d, t); return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI); };

function defs() {
  return `<defs>`
    + `<radialGradient id="final_halo"><stop offset="0" stop-color="${COR.blue2}" stop-opacity=".42"/><stop offset=".5" stop-color="${COR.blue}" stop-opacity=".14"/><stop offset="1" stop-color="${COR.blue}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="final_haloO"><stop offset="0" stop-color="${COR.orange2}" stop-opacity="1"/><stop offset=".45" stop-color="${COR.orange2}" stop-opacity=".7"/><stop offset=".8" stop-color="${COR.orange}" stop-opacity=".15"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="final_chao"><stop offset="0" stop-color="${COR.blue3}" stop-opacity=".38"/><stop offset=".55" stop-color="${COR.blue2}" stop-opacity=".1"/><stop offset="1" stop-color="${COR.blue2}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="final_piso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000d1a" stop-opacity="0"/><stop offset="1" stop-color="#000d1a" stop-opacity=".55"/></linearGradient>`
    + `<linearGradient id="final_face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11426d"/><stop offset="1" stop-color="#062440"/></linearGradient>`
    + `<linearGradient id="final_rface" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c3a62"/><stop offset="1" stop-color="#05203a"/></linearGradient>`
    + `<linearGradient id="final_topo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5d8c"/><stop offset="1" stop-color="#164672"/></linearGradient>`
    + `<linearGradient id="final_anam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COR.blue2}" stop-opacity="0"/><stop offset=".35" stop-color="${COR.blue3}" stop-opacity=".7"/><stop offset=".5" stop-color="#fff"/><stop offset=".65" stop-color="${COR.orange2}" stop-opacity=".7"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="final_ouro" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COR.orange2}" stop-opacity="0"/><stop offset=".5" stop-color="${COR.orange2}"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="final_linha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COR.orange}" stop-opacity="0"/><stop offset=".5" stop-color="${COR.orange2}"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></linearGradient>`
    // cone de luz difuso: perfil horizontal quase gaussiano (bordas em zero) + fade vertical por máscara
    + `<linearGradient id="final_coneH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6f0fb" stop-opacity="0"/><stop offset=".22" stop-color="#e6f0fb" stop-opacity=".012"/><stop offset=".36" stop-color="#e6f0fb" stop-opacity=".07"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".15"/><stop offset=".64" stop-color="#e6f0fb" stop-opacity=".07"/><stop offset=".78" stop-color="#e6f0fb" stop-opacity=".012"/><stop offset="1" stop-color="#e6f0fb" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="final_coneV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".3" stop-color="#3a3a3a"/><stop offset="1" stop-color="#fff"/></linearGradient>`
    + `<mask id="final_coneM" maskUnits="userSpaceOnUse" x="0" y="100" width="${W}" height="${ST_Y + 40 - 100}"><rect x="0" y="100" width="${W}" height="${ST_Y + 40 - 100}" fill="url(#final_coneV)"/></mask>`
    // furo suave na chuva de confete atrás das linhas de texto (nada parece acento sobre as letras)
    + `<radialGradient id="final_furo"><stop offset="0" stop-color="#000"/><stop offset=".7" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
    + `<mask id="final_cfm" maskUnits="userSpaceOnUse" x="-300" y="-300" width="${W + 600}" height="${H + 600}"><rect x="-300" y="-300" width="${W + 600}" height="${H + 600}" fill="#fff"/>`
    + `<ellipse cx="${CX}" cy="${PERF_Y - 14}" rx="340" ry="62" fill="url(#final_furo)"/><ellipse cx="${CX + 6}" cy="${AM_Y - 30}" rx="420" ry="92" fill="url(#final_furo)"/></mask>`
    // contraluz quente do banner (um único elemento com desfoque)
    + `<filter id="final_rimF" x="-15%" y="-60%" width="130%" height="220%"><feGaussianBlur stdDeviation="20"/></filter>`
    + `</defs>`;
}

// ---------- revelação letra a letra ----------
// Cada janela [xa, xb] mostra o mesmo SVG, que sobe de baixo de uma "linha de máscara" com overshoot.
function letraALetra(id, svg, janelas, y0, y1, t, starts, d = 0.34) {
  let s = '', pronto = true;
  const hh = y1 - y0;
  janelas.forEach(([xa, xb], i) => {
    const di = Array.isArray(d) ? d[i] : d;
    const k = inv(starts[i], starts[i] + di, t);
    if (k < 1) pronto = false;
    if (k <= 0) return;
    const dy = (1 - lerp(ease.out(k), ease.back(k), 0.45)) * hh * 0.82;
    s += `<clipPath id="${id}${i}"><rect x="${f(xa)}" y="${f(y0)}" width="${f(xb - xa)}" height="${f(hh)}"/></clipPath>`
      + `<g clip-path="url(#${id}${i})"><g transform="translate(0 ${f(dy)})"${k < 0.5 ? ` opacity="${f(clamp(k * 2.4))}"` : ''}>${svg}</g></g>`;
  });
  return pronto ? svg : s;
}

// Brilho especular recortado no próprio desenho (texto + marca).
function brilho(id, corpo, x, y, w, h, u) {
  if (u <= 0 || u >= 1) return '';
  const clip = corpo.replace(/<path[^>]*fill="none"[^>]*\/>/g, '');
  const bx = x - w * 0.25 + w * 1.5 * ease.inOut(u);
  return `<clipPath id="${id}">${clip}</clipPath><g clip-path="url(#${id})"><path d="M${f(bx - 70)},${f(y - 10)} L${f(bx + 70)},${f(y - 10)} L${f(bx + 20)},${f(y + h + 10)} L${f(bx - 120)},${f(y + h + 10)}Z" fill="url(#final_ouro)"/></g>`;
}

// Janelas por letra de um texto com espaçamento ls a partir de x0.
function janelasTexto(str, x0, size, weight, family, ls) {
  const out = [];
  const pos = [];
  for (let i = 0; i <= str.length; i++) pos.push(x0 + largura(str.slice(0, i), size, weight, family) + i * ls);
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ' ') continue;
    out.push([pos[i] - ls / 2 - 1, pos[i + 1] - ls / 2 + 1, i]);
  }
  return out;
}

// ---------- confete de canhão (sai das pontas do palco) ----------
function canhao(seed, x, y, ang, age, n = 30) {
  if (age < 0 || age > 3.2) return '';
  const r = rng(seed);
  const cores = [COR.orange, COR.orange2, COR.blue2, COR.lblue, '#ffffff', COR.blue3];
  const kd = 2.4;
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = ang + (r() - 0.5) * 0.75, v = 1150 + r() * 900, w = 8 + r() * 9, h = 5 + r() * 5, ph = r() * 6, spin = 300 + r() * 500;
    const dist = (1 - Math.exp(-kd * age)) / kd;
    const px = x + Math.cos(a) * v * dist + Math.sin(age * 4 + ph) * 18 * clamp(age);
    const py = y + Math.sin(a) * v * dist + 0.5 * 420 * age * age;
    if (py > H + 40) continue;
    const o = clamp(3.2 - age) * clamp(age * 12);
    s += `<rect x="${f(px - w / 2)}" y="${f(py - h / 2)}" width="${f(w)}" height="${f(h * (0.35 + 0.65 * Math.abs(Math.cos(age * 7 + ph))))}" rx="1.5" fill="${cores[i % cores.length]}" opacity="${f(o)}" transform="rotate(${f(age * spin + ph * 50)} ${f(px)} ${f(py)})"/>`;
  }
  return s;
}

// ---------- chuva de confete ----------
// Cai do alto; a partir de tg a gravidade assume e todas as peças saem pela base (sem fade longo,
// nada vira "sujeira" no quadro final). faixas: intervalos de x onde as peças nascem.
function chuva(t, t0, seed, n, o = {}) {
  const age = t - t0;
  if (age < 0) return '';
  const r = rng(seed);
  const cores = [COR.orange, COR.orange2, COR.blue2, COR.lblue, '#ffffff', COR.blue3];
  const faixas = o.faixas ?? [[0, W]];
  const esc = o.esc ?? 1, tg = o.tg ?? 1e9;
  const extra = t > tg ? 0.5 * 1300 * (t - tg) * (t - tg) : 0;
  let s = '';
  for (let i = 0; i < n; i++) {
    const [fa, fb] = faixas[i % faixas.length];
    const bx = fa + r() * (fb - fa), y0 = -40 - r() * (o.alt ?? 480), vy = (o.vy ?? 380) + r() * 240, ph = r() * 6;
    const w = (10 + r() * 10) * esc, h = (6 + r() * 7) * esc, spin = 200 + r() * 160;
    const y = y0 + vy * age + extra;
    if (y < -60 || y > H + 60) continue;
    const x = bx + Math.sin(age * 3 + ph) * 40;
    // não passa por trás do cabeçalho (sup. esq.) nem do chip (sup. dir.)
    const op = x < 500 ? clamp((y - 195) / 50) : x > 1410 ? clamp((y - 128) / 50) : 1;
    if (op <= 0.02) continue;
    const hh = h * (0.3 + 0.7 * Math.abs(Math.cos(age * 5 + ph)));
    s += `<rect x="${f(x - w / 2)}" y="${f(y - hh / 2)}" width="${f(w)}" height="${f(hh)}" rx="2" fill="${cores[i % cores.length]}"${op < 1 ? ` opacity="${f(op)}"` : ''} transform="rotate(${f(age * spin + ph * 60)} ${f(x)} ${f(y)})"/>`;
  }
  return s;
}

// estrela de 4 pontas (cintilação)
function estrela(x, y, r, cor, o) {
  if (o <= 0.01) return '';
  return `<path d="M${f(x)},${f(y - r)} Q${f(x + r * 0.18)},${f(y - r * 0.18)} ${f(x + r)},${f(y)} Q${f(x + r * 0.18)},${f(y + r * 0.18)} ${f(x)},${f(y + r)} Q${f(x - r * 0.18)},${f(y + r * 0.18)} ${f(x - r)},${f(y)} Q${f(x - r * 0.18)},${f(y - r * 0.18)} ${f(x)},${f(y - r)}Z" fill="${cor}" opacity="${f(o)}"/>`;
}

// ---------- banner DTS ----------
// Mesma montagem de bannerDTS (base.js), com as faixas diagonais deslocadas para a direita
// (SDX) para que não cruzem "Technology" — como na newsletter original, onde as faixas ficam
// na ponta direita, longe do texto.
const SDX = 80;
function bannerFinal(t, t0, o = {}) {
  const u = t - t0;
  if (u < 0) return '';
  const id = o.id ?? 'final_b';
  const BW0 = 840, BH0 = 190;
  const kx = ease.out5(inv(0, 0.35, u));
  let s = '';
  const pw = BW0 * kx;
  s += `<clipPath id="${id}c"><rect x="${f(-pw / 2)}" y="${-BH0 / 2}" width="${f(pw)}" height="${BH0}" rx="18"/></clipPath>`;
  s += `<rect x="${f(-pw / 2 + 8)}" y="${-BH0 / 2 + 12}" width="${f(pw)}" height="${BH0}" rx="18" fill="rgba(0,20,40,.25)"/>`;
  s += `<rect x="${f(-pw / 2)}" y="${-BH0 / 2}" width="${f(pw)}" height="${BH0}" rx="18" fill="${COR.navy}" stroke="${INK}" stroke-width="4"/>`;
  if (kx < 1) s += `<rect x="${f(pw / 2 - 6)}" y="${-BH0 / 2 - 10}" width="12" height="${BH0 + 20}" rx="6" fill="${COR.orange}" filter="url(#fxBlurX)"/>`;
  let dentro = '';
  const kd = ease.out(inv(0.7, 1.2, u));
  const dx = (1 - kd) * 420 + SDX;
  dentro += `<path d="M${f(180 + dx)},95 L${f(330 + dx)},-95 M${f(262 + dx)},95 L${f(382 + dx)},-95" stroke="${COR.slate}" stroke-width="16"/><path d="M${f(215 + dx)},95 L${f(355 + dx)},-95" stroke="${COR.orange}" stroke-width="3"/>`;
  let lx = -370;
  ['D', 'T', 'S'].forEach((L, i) => {
    const a = 0.16 + i * 0.05;
    const k = clamp(inv(a, a + 0.3, u));
    const y = lerp(-170, 0, ease.back(k));
    const w = largura(L, 120, 900);
    if (k > 0) {
      if (k < 0.9) dentro += `<g opacity="${f(0.35 * (1 - k))}" filter="url(#fxBlurY)">${txt(L, lx, y - 2, { anchor: 'start', size: 120, weight: 900, fill: '#fff' })}</g>`;
      dentro += txt(L, lx, y + 38, { anchor: 'start', size: 120, weight: 900, fill: '#fff', extra: `opacity="${f(clamp(k * 3))}"` });
    }
    lx += w;
  });
  const kv = ease.out(inv(0.48, 0.72, u));
  dentro += `<rect x="-118" y="${f(-4 - 42 * kv)}" width="6" height="${f(84 * kv)}" fill="${COR.orange}"/>`;
  const kt = inv(0.56, 1.06, u);
  dentro += revela(`${id}t`, -100, -60, 520, 120, kt,
    txt('Digital & Technology', -94 + (1 - ease.out(kt)) * -20, -4, { anchor: 'start', size: 40, weight: 600, family: 'DM Sans', fill: '#dbe6f2' })
    + txt('Services', -94 + (1 - ease.out(kt)) * -20, 40, { anchor: 'start', size: 40, weight: 600, family: 'DM Sans', fill: '#dbe6f2' }));
  const k1 = ease.out(inv(0.15, 0.4, u)), k2 = ease.out(inv(0.25, 0.5, u)), k3 = ease.out(inv(0.35, 0.6, u));
  dentro += `<rect x="-420" y="86" width="${f(400 * k1)}" height="9" fill="${COR.orange}"/><rect x="-20" y="86" width="${f(260 * k2)}" height="9" fill="${COR.slate}"/><rect x="240" y="86" width="${f(180 * k3)}" height="9" fill="${COR.lblue}"/>`;
  s += `<g clip-path="url(#${id}c)">${dentro}</g>`;
  s += varredura(`${id}v`, -BW0 / 2, -BH0 / 2, BW0, BH0, inv(0.95, 1.55, u));
  if (u > 1.2) s += `<rect x="${-BW0 / 2 - 6}" y="${-BH0 / 2 - 6}" width="${BW0 + 12}" height="${BH0 + 12}" rx="22" fill="none" stroke="${COR.orange}" stroke-width="3" opacity="${f(0.25 + 0.2 * Math.sin(u * 4))}"/>`;
  s += hudCantos(-BW0 / 2 - 22, -BH0 / 2 - 22, BW0 + 44, BH0 + 44, inv(0.85, 1.25, u), COR.orange, 40, 5);
  return `<g transform="translate(${f(o.x ?? 960)} ${f(o.y ?? 420)}) scale(${f(o.s ?? 1)})">${s}</g>`;
}

// Orbe de energia onde o banner vai nascer: partículas convergem, anéis de lente giram.
function orbe(t, a, b) {
  const u = inv(a, b, t);
  if (u <= 0 || u >= 1) return '';
  const k = ease.out(inv(a, a + 0.3, t)) * (1 - ease.in(inv(b - 0.12, b, t)));
  const r = rng(977);
  let s = '';
  for (let i = 0; i < 22; i++) {
    const ang = r() * Math.PI * 2, R = 260 + r() * 520, st = a + r() * 0.35, sp = 0.35 + r() * 0.25;
    const v = inv(st, st + sp, t);
    if (v <= 0 || v >= 1) continue;
    const sx0 = BX + Math.cos(ang) * R, sy0 = BY + Math.sin(ang) * R * 0.6;
    if (sy0 < 175 || (sx0 < 500 && sy0 < 215) || (sx0 > 1400 && sy0 < 150)) continue; // fora do cabeçalho/chip
    const rr = R * (1 - ease.in(v)), rr2 = rr + 26 + 30 * (1 - v);
    const c = i % 3 === 0 ? COR.orange2 : i % 3 === 1 ? '#ffffff' : COR.blue3;
    s += `<path d="M${f(BX + Math.cos(ang) * rr)},${f(BY + Math.sin(ang) * rr * 0.6)} L${f(BX + Math.cos(ang) * rr2)},${f(BY + Math.sin(ang) * rr2 * 0.6)}" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="${f(Math.sin(v * Math.PI))}"/>`;
  }
  const rot = t * 90;
  s += `<g opacity="${f(k)}"><circle cx="${BX}" cy="${BY}" r="${f(70 + 10 * Math.sin(t * 9))}" fill="none" stroke="${COR.blue3}" stroke-width="2" stroke-dasharray="4 10" transform="rotate(${f(rot)} ${BX} ${BY})" opacity=".7"/>`
    + `<circle cx="${BX}" cy="${BY}" r="${f(118 - 8 * Math.sin(t * 7))}" fill="none" stroke="${COR.orange2}" stroke-width="2" stroke-dasharray="18 14" transform="rotate(${f(-rot * 0.7)} ${BX} ${BY})" opacity=".45"/>`
    + `<ellipse cx="${BX}" cy="${BY}" rx="${f(160 + 60 * k)}" ry="3" fill="url(#final_anam)" opacity=".8"/>`
    + `<circle cx="${BX}" cy="${BY}" r="${f(9 + 7 * k + 2 * Math.sin(t * 14))}" fill="#fff" filter="url(#fxGlow)"/></g>`;
  return s;
}

// Clarão de impacto: flash frio e curtíssimo em modo "screen" (o calor vem do contraluz atrás da marca).
function bloom(id, x, y, age, d, max) {
  if (age < 0 || age > d) return '';
  const k = 1 - ease.out(age / d);
  return `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(x)}" cy="${f(y)}" r="900"><stop offset="0" stop-color="#ffffff" stop-opacity=".8"/><stop offset=".25" stop-color="${COR.blue3}" stop-opacity=".25"/><stop offset="1" stop-color="${COR.blue3}" stop-opacity="0"/></radialGradient></defs>`
    + `<rect x="-120" y="-120" width="${W + 240}" height="${H + 240}" fill="url(#${id})" opacity="${f(max * k)}" style="mix-blend-mode:screen"/>`;
}

// ---------- palco ----------
function holofotes(t, k) {
  if (k <= 0) return '';
  const fl = 0.88 + 0.12 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
  // um único cone central, largo e de borda difusa (sem faixas nítidas nem feixes cruzados)
  return `<g mask="url(#final_coneM)"><path d="M${CX - 150},110 L${CX + 150},110 L${CX + ST_RX + 260},${ST_Y + 30} L${CX - ST_RX - 260},${ST_Y + 30}Z" fill="url(#final_coneH)" opacity="${f(k * fl)}"/></g>`;
}

function praticavel(t, k) {
  // praticável dos diretores (atrás): topo elíptico + face com LEDs
  const x0 = CX - RIS_RX, x1 = CX + RIS_RX;
  let s = `<path d="M${x0},${RIS_Y} L${x0},${ST_Y} L${x1},${ST_Y} L${x1},${RIS_Y} A${RIS_RX},${RIS_RY} 0 0 1 ${x0},${RIS_Y}Z" fill="url(#final_rface)" stroke="${INK}" stroke-width="3"/>`
    + `<ellipse cx="${CX}" cy="${RIS_Y}" rx="${RIS_RX}" ry="${RIS_RY}" fill="url(#final_topo)" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M${x0 + 8},${RIS_Y + 4} A${RIS_RX - 8},${RIS_RY - 4} 0 0 0 ${x1 - 8},${RIS_Y + 4}" fill="none" stroke="${COR.orange}" stroke-width="3" opacity="${f(0.55 + 0.35 * k)}"/>`;
  // fileira de LEDs na face
  for (let i = 0; i < 13; i++) {
    const x = x0 + 30 + i * ((RIS_RX * 2 - 60) / 12);
    const on = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 4 - i * 0.7));
    s += `<circle cx="${f(x)}" cy="${RIS_Y + 44}" r="3.6" fill="${i % 2 ? COR.blue3 : COR.orange2}" opacity="${f(on * k)}"/>`;
  }
  // face alta: filete laranja e uma segunda fileira de luzes, mais discreta
  s += `<rect x="${x0 + 3}" y="${RIS_Y + 82}" width="${RIS_RX * 2 - 6}" height="2.5" fill="${COR.orange}" opacity="${f(0.28 * k)}"/>`;
  for (let i = 0; i < 25; i++) {
    const x = x0 + 24 + i * ((RIS_RX * 2 - 48) / 24);
    const on = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 3 + i * 0.5));
    s += `<circle cx="${f(x)}" cy="${RIS_Y + 112}" r="2.2" fill="${COR.blue3}" opacity="${f(0.55 * on * k)}"/>`;
  }
  return s;
}

function tablado(t, k) {
  const x0 = CX - ST_RX, x1 = CX + ST_RX;
  let s = `<ellipse cx="${CX}" cy="${ST_Y + ST_H + 6}" rx="${ST_RX + 40}" ry="${ST_RY + 6}" fill="#000d1a" opacity=".45"/>`;
  s += `<path d="M${x0},${ST_Y} L${x0},${ST_Y + ST_H} A${ST_RX},${ST_RY} 0 0 0 ${x1},${ST_Y + ST_H} L${x1},${ST_Y}Z" fill="url(#final_face)" stroke="${INK}" stroke-width="3.5"/>`
    + `<ellipse cx="${CX}" cy="${ST_Y}" rx="${ST_RX}" ry="${ST_RY}" fill="url(#final_topo)" stroke="${INK}" stroke-width="3.5"/>`
    + `<path d="M${x0 + 4},${ST_Y + 3} A${ST_RX - 4},${ST_RY - 3} 0 0 0 ${x1 - 4},${ST_Y + 3}" fill="none" stroke="${COR.orange}" stroke-width="4"/>`;
  // círculo de luz no topo (spot)
  s += `<ellipse cx="${CX}" cy="${ST_Y - 2}" rx="${f(ST_RX * 0.62)}" ry="${f(ST_RY * 0.72)}" fill="#fff" opacity="${f(0.1 * k + 0.04 * Math.sin(t * 2))}"/>`;
  return s;
}

// piso brilhante: reflexo do tablado e ondas de luz lentas
function piso(t, k, tOnda) {
  if (k <= 0) return '';
  const yb = ST_Y + ST_H + ST_RY;       // base do tablado (frente)
  const x0 = CX - ST_RX, x1 = CX + ST_RX;
  let s = `<path d="M${x0},${ST_Y + ST_H} A${ST_RX},${ST_RY} 0 0 0 ${x1},${ST_Y + ST_H} L${x1 - 30},${yb + 34} A${ST_RX - 30},${ST_RY + 4} 0 0 1 ${x0 + 30},${yb + 34}Z" fill="#0c3a62" opacity="${f(0.35 * k)}"/>`
    + `<path d="M${x0 + 30},${yb + 30} A${ST_RX - 30},${ST_RY + 6} 0 0 0 ${x1 - 30},${yb + 30}" fill="none" stroke="${COR.orange}" stroke-width="3" opacity="${f(0.22 * k)}"/>`
    + `<path d="M${x0 + 70},${yb + 52} A${ST_RX - 70},${ST_RY + 8} 0 0 0 ${x1 - 70},${yb + 52}" fill="none" stroke="${COR.orange2}" stroke-width="2" opacity="${f(0.1 * k)}"/>`;
  // ondas de luz no piso (depois do primeiro impacto)
  if (t > tOnda) {
    for (let i = 0; i < 3; i++) {
      const u = ((t - tOnda) / 2.6 + i / 3) % 1;
      const o = Math.sin(u * Math.PI) * 0.22 * clamp((t - tOnda) * 2) * k;
      s += `<ellipse cx="${CX}" cy="${yb - 6}" rx="${f(ST_RX + 30 + 420 * u)}" ry="${f(ST_RY + 18 + 70 * u)}" fill="none" stroke="${COR.blue3}" stroke-width="2" opacity="${f(o)}"/>`;
    }
  }
  return s;
}

// ---------- equipe ----------
function equipe(t, T) {
  const { t0, W94, W96, W99, B102, I1, IMP } = T;
  const olhaCima = t >= W94 - 0.12 && t < W96 + 0.75;
  const DIRS = [
    { id: 'dir1', x: CX - DIR_DX, d: 0.06, flip: true, ph: 0.0 },
    { id: 'dir3', x: CX + DIR_DX, d: 0.14, flip: false, ph: 0.9 },
    { id: 'dir2', x: CX, d: 0.22, flip: false, ph: 1.7 },
  ];
  let fila = '';
  const clipR = `<clipPath id="final_cr"><rect x="0" y="0" width="${W}" height="${RIS_Y + 7}"/></clipPath>`;
  let precisaClip = false;
  for (const D of DIRS) {
    const a = t0 - 0.14 + D.d;
    const k = inv(a, a + 0.5, t);
    if (k <= 0) continue;
    if (k < 1) precisaClip = true;
    const sub = (1 - ease.back(k)) * 260 * DIR_S;
    let armL = 8, armR = 8, expr = 'smile', gaze = [0, 0], hop = 0;
    if (olhaCima) { gaze = [0, -1.3]; expr = t < W96 + 0.05 ? 'wow' : 'joy'; }
    hop += pulso(t, I1 - 0.04 + D.d * 0.3, 0.34) * 12;
    // "Performance": um braço para cima
    const kp = pulso(t, W99 + D.d * 0.4, 1.3);
    if (kp > 0) { armR = lerp(8, 126 + Math.sin(t * 9 + D.ph) * 6, clamp(kp * 1.6)); expr = 'joy'; }
    // "Marsal": todos vibram
    const km = pulso(t, IMP - 0.14 + D.d * 0.25, 0.9);
    if (km > 0) { armL = lerp(armL, 132, clamp(km * 1.7)); armR = lerp(armR, 132, clamp(km * 1.7)); expr = 'joy'; hop += km * 20; }
    // depois: aceno calmo (para fora) e sorriso
    const ka = fin(t, B102 + 0.05 + D.d, 0.4);
    if (ka > 0 && km <= 0.0001) {
      if (D.id === 'dir2') { armL = lerp(8, 118 + Math.sin(t * 6.5 + D.ph) * 12, ka); armR = lerp(8, 24, ka); expr = 'joy'; }
      else { armR = lerp(8, 124 + Math.sin(t * 7 + D.ph) * 12, ka); expr = 'smile'; }
    }
    fila += pessoa(D.id, { x: D.x, y: RIS_Y + sub, s: DIR_S, t: t + D.ph, flip: D.flip, expr, gaze, armL, armR, hop });
  }
  if (precisaClip) fila = `${clipR}<g clip-path="url(#final_cr)">${fila}</g>`;

  // Victor, na frente
  let front = '';
  const av = t0 + 0.04;
  const kv = inv(av, av + 0.5, t);
  if (kv > 0) {
    const sub = (1 - ease.back(kv)) * 280 * VIC_S;
    let armL = 10, armR = 10, expr = 'smile', gaze = [0, 0], hop = 0;
    hop += pulso(t, av + 0.42, 0.3) * 16;
    if (olhaCima) { gaze = [0, -1.4]; expr = t < W96 + 0.05 ? 'wow' : 'joy'; }
    const kd = pulso(t, I1 - 0.02, 0.95);
    if (kd > 0) { armL = lerp(10, 130, clamp(kd * 1.8)); armR = lerp(10, 130, clamp(kd * 1.8)); hop += pulso(t, I1 - 0.02, 0.4) * 16; }
    const kp = pulso(t, W99 - 0.05, 1.2);
    if (kp > 0) { armR = lerp(10, 128 + Math.sin(t * 10) * 7, clamp(kp * 1.8)); expr = 'joy'; gaze = [0.2, -0.6]; }
    const km = pulso(t, IMP - 0.16, 0.9);
    if (km > 0) { armL = lerp(armL, 136, clamp(km * 1.7)); armR = lerp(armR, 136, clamp(km * 1.7)); hop += km * 30; expr = 'joy'; }
    const ka = fin(t, B102 + 0.02, 0.35);
    if (ka > 0 && km <= 0.0001) { armR = lerp(10, 126 + Math.sin(t * 8) * 13, ka); armL = lerp(10, 22, ka); expr = 'joy'; }
    const v = pessoa('victor', { x: CX, y: VIC_Y + sub, s: VIC_S, t, expr, gaze, armL, armR, hop });
    front = kv < 1 ? `<clipPath id="final_cv"><rect x="0" y="0" width="${W}" height="${VIC_Y + 8}"/></clipPath><g clip-path="url(#final_cv)">${v}</g>` : v;
  }
  return { back: fila, front };
}

// ---------- ícones das entregas (laterais) ----------
function badges(t, t0) {
  let s = '';
  BADGES.forEach(([x, y, ic, p, ph], i) => {
    const a = t0 + 0.02 + [0, 2, 4, 1, 3, 5][i] * 0.06;
    const k = back(t, a, 0.5);
    if (k <= 0.001) return;
    const dir = x < CX ? -1 : 1;
    const xx = x + dir * (1 - clamp(k)) * 160 + Math.sin(t * 0.9 + ph) * 6;
    const yy = y + Math.sin(t * 1.3 + ph) * 9;
    const r = 46 * p;
    const body = `<circle cx="5" cy="7" r="${f(r)}" fill="rgba(0,10,20,.35)"/>`
      + `<circle r="${f(r)}" fill="#fff" stroke="${INK}" stroke-width="3.5"/>`
      + `<circle r="${f(r + 9)}" fill="none" stroke="${COR.orange}" stroke-width="2.5" opacity=".55" stroke-dasharray="6 9" transform="rotate(${f(t * 30 * (i % 2 ? 1 : -1))})"/>`
      + icone(ic, 0, 0, 1.12 * p);
    s += popG(clamp(k, 0, 1.2), xx, yy, `<g opacity=".94">${body}</g>`);
  });
  return s;
}

function cintilas(t, t0) {
  const P = [[500, 250, 9], [1430, 270, 10], [536, 432, 7], [1392, 446, 8], [612, 610, 6], [1300, 618, 7], [140, 520, 8], [1790, 540, 8], [338, 880, 7], [1590, 880, 7]];
  let s = '';
  P.forEach(([x, y, r], i) => {
    const o = clamp((t - t0 - 0.3 - i * 0.05) * 3) * (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 3.1 + i * 1.9), 3));
    s += estrela(x, y, r, i % 3 === 0 ? COR.orange2 : '#ffffff', o);
  });
  return s;
}

export function desenhar(t, ctx) {
  const t0 = ctx.t0, t1 = ctx.t1;
  const W94 = ctx.wa(94), W96 = ctx.wa(96), W97 = ctx.wa(97), W99 = ctx.wa(99), W100 = ctx.wa(100);
  const W101 = ctx.wa(101), W102 = ctx.wa(102), B102 = ctx.wb(102);
  const TB = W96 - 0.42;               // início da montagem do banner (D-T-S pousam juntos em ~wa(96))
  const I1 = W96 + 0.08;               // impacto do DTS: as três letras já pousaram
  const IMP = W102 + 0.14;             // impacto final: MARSAL já completo
  const T = { t0, t1, W94, W96, W97, W99, W100, W101, W102, B102, I1, IMP };

  // ---------- câmera ----------
  const zIn = lerp(1.08, 1.0, ease.out(inv(t0, t0 + 1.2, t)));
  const zPush = 0.038 * inv(t0 + 1.2, t1, t);   // empurrão lento e contínuo até o corte
  const z = zIn + zPush;
  const tilt = -34 * (1 - ease.inOut(inv(t0 + 0.05, W96 - 0.05, t)));
  const [a1, b1] = tremor(t, I1, 0.32, 8);
  const [a2, b2] = tremor(t, IMP, 0.42, 10);
  const sx = a1 + a2, sy = b1 + b2;
  const camera = (p, body) => {
    const zz = 1 + (z - 1) * p;
    return `<g transform="translate(${f(PIV_X + sx * p)} ${f(PIV_Y + (sy + tilt) * p)}) scale(${f(zz)}) translate(${-PIV_X} ${-PIV_Y})">${body}</g>`;
  };

  let s = defs();
  // ---------- fundo (paralaxe lenta) ----------
  let fundo = fundoNavy(t, { id: 'final_nv', cx: 960, cy: 430, feixes: false, seed: 19 });
  const kLuz = fin(t, t0 + 0.05, 0.3);
  fundo += `<ellipse cx="${BX}" cy="${BY + 40}" rx="980" ry="520" fill="url(#final_halo)" opacity="${f(0.55 + 0.45 * fin(t, TB, 0.6))}"/>`;
  s += camera(0.35, fundo);

  // ---------- mundo ----------
  let w = '';
  w += holofotes(t, kLuz);
  w += `<rect x="-100" y="${ST_Y - 30}" width="${W + 200}" height="${H - ST_Y + 160}" fill="url(#final_piso)"/>`;
  w += `<ellipse cx="${CX}" cy="${ST_Y + 30}" rx="820" ry="150" fill="url(#final_chao)" opacity="${f(kLuz)}"/>`;
  w += poeira(t, 91, 22, [420, 160, 1080, 700], '#ffffff', 0.4);
  w += cintilas(t, t0);
  w += badges(t, t0);

  // contraluz quente: brilho laranja difuso que contorna o banner (estreito e intenso -> luminoso,
  // sem véu cinza); pulsa nos dois impactos
  {
    const kr = fin(t, I1 - 0.04, 0.25) * (0.62 + 0.1 * Math.sin(t * 2.2)) + pulso(t, I1 - 0.04, 0.6) * 0.3 + pulso(t, IMP - 0.04, 0.7) * 0.3;
    if (kr > 0.01) w += `<rect x="${f(BX - BW / 2 - 10)}" y="${f(BY - BH / 2 - 10)}" width="${f(BW + 20)}" height="${f(BH + 20)}" rx="26" fill="${COR.orange}" opacity="${f(clamp(kr))}" filter="url(#final_rimF)" style="mix-blend-mode:screen"/>`;
    // estouro de contraluz nos impactos: o brilho quente sai de trás do banner, abre e esfria
    // (intenso junto à borda = luminoso; curto, para não virar véu)
    const e1 = t >= I1 ? 1 - ease.out(clamp((t - I1) / 0.5)) : 0;
    const e2 = t >= IMP ? 1 - ease.out(clamp((t - IMP) / 0.55)) : 0;
    const ke = Math.max(e1, e2);
    if (ke > 0.01) {
      const sp = 16 + 46 * (1 - ke);
      w += `<rect x="${f(BX - BW / 2 - sp)}" y="${f(BY - BH / 2 - sp * 0.6)}" width="${f(BW + sp * 2)}" height="${f(BH + sp * 1.2)}" rx="34" fill="${COR.orange2}" opacity="${f(ke)}" filter="url(#final_rimF)" style="mix-blend-mode:screen"/>`;
    }
    // e um clarão curto atrás de ALVAREZ & MARSAL no impacto final
    if (e2 > 0.01) w += `<ellipse cx="${CX + 6}" cy="${AM_Y - 28}" rx="${f(300 + 80 * (1 - e2))}" ry="${f(62 + 14 * (1 - e2))}" fill="url(#final_haloO)" opacity="${f(0.6 * e2)}" style="mix-blend-mode:screen"/>`;
  }

  // flashes curtos atrás da marca e da equipe (o logo continua nítido)
  w += bloom('final_fl1', BX, BY, t - I1, 0.24, 0.4);
  w += bloom('final_fl2', CX, AM_Y - 30, t - IMP, 0.26, 0.4);

  // ---------- impactos (atrás da marca: os anéis saem de trás do logo) ----------
  w += onda(BX, BY, t - I1, { r0: 120, r1: 540, d: 0.7, w: 12 });   // some antes do cabeçalho/chip
  w += particulas(961, BX, BY, t - I1, { n: 30, v: 760, d: 1.0, sz: 11 });

  // ---------- confete, camada de trás (atrás do palco, da equipe e da marca) ----------
  {
    const tg = IMP + 1.0;              // a gravidade assume: tudo sai pela base até ~58.5 s
    // partículas do impacto final entram aqui também: o furo da máscara impede que uma delas
    // pare sobre uma letra e pareça acento
    let cf = onda(CX, AM_Y - 30, t - IMP, { r0: 80, r1: 600, d: 0.75, w: 11 });
    cf += particulas(962, CX, AM_Y - 30, t - IMP, { n: 34, v: 820, d: 1.1, sz: 12 });
    cf += chuva(t, IMP + 0.02, 29, 58, { tg });
    // canhões nas pontas do tablado (as peças saem de trás do palco)
    cf += canhao(963, CX - ST_RX + 30, ST_Y - 10, -Math.PI / 2 + 0.42, t - IMP - 0.02);
    cf += canhao(964, CX + ST_RX - 30, ST_Y - 10, -Math.PI / 2 - 0.42, t - IMP - 0.02);
    if (cf) w += `<g mask="url(#final_cfm)">${cf}</g>`;
  }

  // orbe de energia onde o banner nasce (atrás da equipe: os traços não cruzam rostos)
  w += orbe(t, t0 + 0.12, TB + 0.06);

  // palco + equipe
  const eq = equipe(t, T);
  w += piso(t, kLuz, I1);
  w += praticavel(t, kLuz);
  w += eq.back;
  w += tablado(t, kLuz);
  w += eq.front;

  // chips ENTREGA · PERFORMANCE · COLLECTION no tablado
  {
    const CH = [['box', 'ENTREGA'], ['gauge', 'PERFORMANCE'], ['coin', 'COLLECTION']];
    const sz = 18;
    const ws = CH.map(([, r]) => largura(r, sz, 800) + sz * 3.2);
    const gap = 46;
    const tot = ws.reduce((a, b) => a + b, 0) + gap * (CH.length - 1);
    let x = CX - tot / 2;
    CH.forEach(([ic, r], i) => {
      const cx = x + ws[i] / 2;
      const k = back(t, B102 + 0.08 + i * 0.14, 0.42);
      if (k > 0.001) w += popG(k, cx, CHIP_Y, chipRotulo(0, 0, ic, r, { size: sz }));
      if (i < CH.length - 1) {
        const kd = fin(t, B102 + 0.2 + i * 0.14, 0.25);
        if (kd > 0) w += `<circle cx="${f(x + ws[i] + gap / 2)}" cy="${CHIP_Y}" r="${f(5 * kd)}" fill="${COR.orange}"/>`;
      }
      x += ws[i] + gap;
    });
  }

  // ---------- marca: banner DTS ----------
  // "Isso": ponto de luz + reflexo anamórfico onde o banner abre (curto: termina antes dos ícones laterais)
  {
    const u = inv(W94 - 0.12, TB + 0.45, t);
    if (u > 0 && u < 1) {
      const kk = Math.sin(u * Math.PI);
      w += `<ellipse cx="${BX}" cy="${BY}" rx="${f(80 + 540 * ease.out(u))}" ry="${f(6 + 4 * kk)}" fill="url(#final_anam)" opacity="${f(kk)}"/>`
        + `<circle cx="${BX}" cy="${BY}" r="${f(10 + 26 * kk)}" fill="#fff" opacity="${f(kk * 0.9)}" filter="url(#fxGlow)"/>`;
    }
  }
  w += bannerFinal(t, TB, { x: BX, y: BY, s: BS, id: 'final_b' });
  // segunda e terceira passadas de luz no banner (no impacto final e no assentamento)
  w += varredura('final_v2', BX - BW / 2, BY - BH / 2, BW, BH, inv(IMP + 0.05, IMP + 0.65, t), 18 * BS);
  w += varredura('final_v3', BX - BW / 2, BY - BH / 2, BW, BH, inv(t1 - 1.45, t1 - 0.6, t), 18 * BS);

  // ---------- A&M | PERFORMANCE ----------
  {
    const lp0 = lockupPerformance(0, 0, PERF_S, '#ffffff');
    const x0 = CX - lp0.w / 2;
    const lp = lockupPerformance(x0, PERF_Y, PERF_S, '#ffffff');
    const k = PERF_S / 64;
    // linha de máscara: desenha em "Isso" (wa 97), some depois da revelação
    const kl = fin(t, W97 + 0.02, 0.32) * (1 - fin(t, W99 + 0.55, 0.35));
    if (kl > 0.01) {
      const lw = (lp0.w + 60) * ease.out(fin(t, W97 + 0.02, 0.32));
      w += `<rect x="${f(CX - lw / 2)}" y="${PERF_Y + 7}" width="${f(lw)}" height="3" rx="1.5" fill="url(#final_linha)" opacity="${f(kl)}"/>`
        + `<circle cx="${f(CX - lw / 2)}" cy="${PERF_Y + 8.5}" r="4" fill="#fff" opacity="${f(kl * 0.8)}"/><circle cx="${f(CX + lw / 2)}" cy="${PERF_Y + 8.5}" r="4" fill="#fff" opacity="${f(kl * 0.8)}"/>`;
    }
    // janelas: marca + divisória, depois cada letra de PERFORM, o Λ e NCE
    const cx0 = x0 + 108 * k;
    const jan = [[x0 - 12, cx0 - 3]];
    const pf = janelasTexto('PERFORM', cx0, PERF_S, 500, 'DM Sans', 1);
    pf.forEach(([a, b]) => jan.push([Math.max(a, cx0 - 3), b]));
    const lx = cx0 + largura('PERFORM', PERF_S, 500, 'DM Sans') + 7 * k + 2;
    const nx = lx + PERF_S * 0.5;
    jan.push([jan[jan.length - 1][1], nx - 1]);
    const nc = janelasTexto('NCE', nx, PERF_S, 500, 'DM Sans', 1);
    nc.forEach(([a, b], i) => jan.push([i === 0 ? nx - 1 : a, i === nc.length - 1 ? b + 12 : b]));
    const st = jan.map((_, i) => W99 - 0.1 + i * 0.035);
    w += letraALetra('final_lp', lp.svg, jan, PERF_Y - PERF_S * 1.15, PERF_Y + 8, t, st, 0.36);
    w += brilho('final_sp', lp.svg, x0, PERF_Y - PERF_S, lp.w, PERF_S * 1.1, inv(W99 + 0.5, W99 + 1.05, t));
  }

  // ---------- ALVAREZ & MARSAL ----------
  {
    const la0 = lockupAM(0, 0, AM_S, '#ffffff');
    const x0 = CX - la0.w / 2;
    const la = lockupAM(x0, AM_Y, AM_S, '#ffffff');
    const k = AM_S / 54;
    const tx = x0 + 158 * k;
    const ls = 6 * k;
    const jan = [[x0 - 14, tx - ls]];
    const st = [W100 - 0.1];
    const dd = [0.36];
    const txtJ = janelasTexto('ALVAREZ & MARSAL', tx, AM_S, 600, 'DM Sans', ls);
    txtJ.forEach(([a, b, i]) => {
      jan.push([a, i === 15 ? b + 16 : b]);
      // ALVAREZ (0-6) em "Alvarez", & (8) em "&", MARSAL (10-15) rápido e concentrado em "Marsal":
      // a última letra assenta antes do impacto (IMP).
      st.push(i <= 6 ? W100 - 0.05 + i * 0.04 : i === 8 ? W101 - 0.12 : W102 - 0.18 + (i - 10) * 0.02);
      dd.push(i <= 6 ? 0.36 : 0.26);
    });
    // linha de máscara curta antes da marca
    const kl = fin(t, W100 - 0.25, 0.25) * (1 - fin(t, IMP + 0.3, 0.4));
    if (kl > 0.01) {
      const lw = (la0.w + 60) * ease.out(fin(t, W100 - 0.25, 0.3));
      w += `<rect x="${f(CX - lw / 2)}" y="${AM_Y + 12}" width="${f(lw)}" height="3" rx="1.5" fill="url(#final_linha)" opacity="${f(kl)}"/>`;
    }
    w += letraALetra('final_la', la.svg, jan, AM_Y - 86, AM_Y + 10, t, st, dd);
    w += brilho('final_sa', la.svg, x0, AM_Y - 74, la.w, 84, inv(IMP + 0.15, IMP + 0.8, t));
  }

  // ---------- confete, camada da frente: esparsa, maior, só nas laterais (nunca sobre a marca ou rostos) ----------
  w += chuva(t, IMP + 0.06, 47, 14, { tg: IMP + 1.0, faixas: [[40, 470], [1450, 1880]], esc: 1.45, vy: 470, alt: 420 });

  s += camera(1, w);
  // faixa tricolor da newsletter na base
  {
    const k1 = ease.out(inv(IMP, IMP + 0.5, t)), k2 = ease.out(inv(IMP + 0.1, IMP + 0.6, t)), k3 = ease.out(inv(IMP + 0.2, IMP + 0.7, t));
    if (k1 > 0) s += `<rect x="-60" y="${H - 10}" width="${f((W * 0.46 + 60) * k1)}" height="14" fill="${COR.orange}"/>`
      + `<rect x="${W * 0.46}" y="${H - 10}" width="${f(W * 0.3 * k2)}" height="14" fill="${COR.slate}"/>`
      + `<rect x="${W * 0.76}" y="${H - 10}" width="${f((W * 0.24 + 60) * k3)}" height="14" fill="${COR.lblue}"/>`;
  }

  return s;
}
