// Cenários e objetos em SVG (funções puras que devolvem strings).
import { tr, g, op, clamp, lerp, inv, rng, hash, C, n2, esc, text, measure, ease, TAU } from './core.js';
import { logo, logoSize } from './assets.js';

const INK = C.ink;

// ---------- cor ----------
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g2, b) { return '#' + [r, g2, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''); }
export function mix(a, b, k) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)); }
// k = 0: acinzentado (antes) ; k = 1: cor plena (depois)
export function bloom(col, k) {
  const [r, gg, b] = hex2rgb(col);
  const l = 0.3 * r + 0.59 * gg + 0.11 * b;
  const gray = rgb2hex(lerp(l, 160, 0.35), lerp(l, 158, 0.35), lerp(l, 154, 0.35));
  return mix(gray, col, k);
}

// ---------- fundo ----------
export function blobPath(cx, cy, r, seed, wob = 0.18) {
  const R = rng(seed);
  const n = 7, pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const rr = r * (1 - wob / 2 + R() * wob); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.85]); }
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) d += `M${n2(p1[0])} ${n2(p1[1])}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${n2(c1[0])} ${n2(c1[1])} ${n2(c2[0])} ${n2(c2[1])} ${n2(p2[0])} ${n2(p2[1])}`;
  }
  return d + 'Z';
}
export const blob = (cx, cy, r, color, o = 0.5, seed = 1) => `<path d="${blobPath(cx, cy, r, seed)}" fill="${color}" opacity="${o}"/>`;

export function paperBg(o = {}) {
  const base = o.base ?? C.bg, base2 = o.base2 ?? C.bg2;
  let s = `<rect width="1920" height="1080" fill="${base}"/>`;
  s += `<rect width="1920" height="1080" fill="url(#glow)" opacity="${o.dark ? 0.15 : 1}"/>`;
  for (let x = 40; x < 1920; x += 86) s += `<rect x="${x}" y="0" width="2" height="1080" fill="${o.dark ? '#ffffff' : '#000000'}" opacity=".02"/>`;
  if ((o.floorY ?? 1080) < 1080) s += `<rect y="${o.floorY}" width="1920" height="${1080 - o.floorY}" fill="${base2}"/>`;
  return s;
}

export function doodles(seed, color = INK, alpha = 0.09, area = [0, 0, 1920, 820]) {
  const R = rng(seed);
  let s = '';
  for (let i = 0; i < 16; i++) {
    const x = area[0] + R() * (area[2] - area[0]), y = area[1] + R() * (area[3] - area[1]), k = R();
    if (k < 0.35) s += `<path d="M${n2(x - 8)} ${n2(y)}h16M${n2(x)} ${n2(y - 8)}v16" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="${alpha}"/>`;
    else if (k < 0.65) s += `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(8 + R() * 6)}" fill="none" stroke="${color}" stroke-width="3" opacity="${alpha}"/>`;
    else s += `<path d="M${n2(x)} ${n2(y - 10)} l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="${color}" opacity="${alpha}"/>`;
  }
  return s;
}

export const groundLine = (y, x0 = -2000, x1 = 9000, color = 'rgba(43,30,10,.12)') => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="3" fill="${color}"/>`;

// ---------- tipografia animada ----------
// Etiqueta em pílula (inclinada), estilo "palavra que salta".
export function tag(str, x, y, o = {}) {
  const size = o.size ?? 54;
  const font = `900 ${size}px Outfit`;
  const w = measure(str, font) + size * 0.9;
  const h = size * 1.45;
  const k = o.k ?? 1; // 0..1 entrada
  const sc = (o.scale ?? 1) * (k < 1 ? ease.bounce(k) : 1);
  const body = `<rect x="${n2(-w / 2)}" y="${n2(-h / 2)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(h / 2.2)}" fill="${o.bg ?? C.blue}" filter="url(#dsSoft)"/>`
    + (o.stroke ? `<rect x="${n2(-w / 2)}" y="${n2(-h / 2)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(h / 2.2)}" fill="none" stroke="${o.stroke}" stroke-width="4"/>` : '')
    + text(str, 0, size * 0.35, { size, weight: 900, fill: o.fg ?? '#fff', family: 'Outfit' });
  return op(Math.min(1, k * 3) * (o.alpha ?? 1), g(tr(x, y, Math.max(0.001, sc), o.rot ?? -4), body));
}

// Carimbo com borda dupla.
export function stamp(str, x, y, o = {}) {
  const size = o.size ?? 64, col = o.color ?? C.green;
  const lines = Array.isArray(str) ? str : [str];
  const font = `900 ${size}px Outfit`;
  const w = Math.max(...lines.map(l => measure(l, font))) + size * 0.9;
  const h = size * (1.25 * lines.length + 0.35);
  const k = o.k ?? 1;
  const sc = k < 1 ? lerp(2.4, 1, ease.out5(k)) : 1;
  let body = `<rect x="${n2(-w / 2)}" y="${n2(-h / 2)}" width="${n2(w)}" height="${n2(h)}" rx="14" fill="${o.fill ?? 'rgba(255,255,255,.82)'}" stroke="${col}" stroke-width="${n2(size * 0.1)}"/>`;
  body += `<rect x="${n2(-w / 2 + 9)}" y="${n2(-h / 2 + 9)}" width="${n2(w - 18)}" height="${n2(h - 18)}" rx="9" fill="none" stroke="${col}" stroke-width="2.5" opacity=".7"/>`;
  lines.forEach((l, i) => (body += text(l, 0, (i - (lines.length - 1) / 2) * size * 1.2 + size * 0.36, { size, weight: 900, fill: col, ls: '2' })));
  return op(Math.min(1, k * 4) * (o.alpha ?? 1), g(tr(x, y, sc * (o.scale ?? 1), o.rot ?? -8), body));
}

export function bubble(str, x, y, o = {}) {
  const size = o.size ?? 34;
  const font = `800 ${size}px Outfit`;
  const w = measure(str, font) + 44, h = size + 30;
  const k = o.k ?? 1;
  const sc = k < 1 ? ease.bounce(k) : 1;
  const tail = o.tail ?? -1; // -1: cauda à esquerda; 1: à direita
  const tx = tail < 0 ? -w / 2 + 34 : w / 2 - 34;
  const body = `<g filter="url(#dsSoft)"><rect x="${n2(-w / 2)}" y="${n2(-h)}" width="${n2(w)}" height="${n2(h)}" rx="20" fill="#fff"/><path d="M${n2(tx - 12)} -2 l${n2(tail * 6)} 22 l${n2(-tail * -18)} -22z" fill="#fff"/></g>` + text(str, 0, -h / 2 + size * 0.36, { size, weight: 800, fill: INK });
  return op(Math.min(1, k * 3), g(tr(x, y, Math.max(0.001, sc), o.rot ?? 0), body));
}

export function burst(x, y, age, o = {}) {
  if (age < 0 || age > (o.dur ?? 0.9)) return '';
  const u = age / (o.dur ?? 0.9), n = o.n ?? 10, R = o.r ?? 120;
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (o.rot ?? 0);
    const d = R * ease.out(u), sz = (o.size ?? 14) * (1 - u);
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    s += i % 2 ? `<circle cx="${n2(px)}" cy="${n2(py)}" r="${n2(sz * 0.5)}" fill="${o.c2 ?? C.amber}"/>` : `<path d="M${n2(px)} ${n2(py - sz)} L${n2(px + sz * 0.25)} ${n2(py - sz * 0.25)} L${n2(px + sz)} ${n2(py)} L${n2(px + sz * 0.25)} ${n2(py + sz * 0.25)} L${n2(px)} ${n2(py + sz)} L${n2(px - sz * 0.25)} ${n2(py + sz * 0.25)} L${n2(px - sz)} ${n2(py)} L${n2(px - sz * 0.25)} ${n2(py - sz * 0.25)}Z" fill="${o.c1 ?? '#ffd84a'}"/>`;
  }
  return s;
}

export function confetti(x0, y0, age, o = {}) {
  if (age < 0) return '';
  const n = o.n ?? 70, R = rng(o.seed ?? 3), W = o.w ?? 900;
  const cols = ['#ff5a5f', '#ffd166', '#06d6a0', '#118ab2', '#ef8fff', '#4f8bff', '#f07a2a'];
  let s = '';
  for (let i = 0; i < n; i++) {
    const vx = (R() - 0.5) * W, vy = -(500 + R() * 600), sp = R() * 600 - 300, ph = R() * 360;
    const x = x0 + vx * Math.min(age, 1.2) * 0.9 + Math.sin(age * 4 + i) * 20;
    const y = y0 + vy * age + 900 * age * age;
    if (y > y0 + 600) continue;
    s += `<rect x="-6" y="-3.5" width="12" height="7" rx="2" fill="${cols[i % cols.length]}" transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(ph + sp * age)})"/>`;
  }
  return s;
}

// ---------- escritório ----------
export function desk(x, y, w = 360, o = {}) {
  const top = o.top ?? '#c9a477', front = o.front ?? '#b48c5f';
  return `<rect x="${n2(x - w / 2)}" y="${n2(y)}" width="${n2(w)}" height="18" rx="8" fill="${top}"/>`
    + `<rect x="${n2(x - w / 2 + 14)}" y="${n2(y + 16)}" width="${n2(w - 28)}" height="${o.h ?? 110}" rx="6" fill="${front}"/>`
    + `<rect x="${n2(x - w / 2 + 14)}" y="${n2(y + 16)}" width="${n2(w - 28)}" height="10" fill="rgba(0,0,0,.08)"/>`;
}

export function deskPhone(x, y, col, ring = 0, t = 0, o = {}) {
  const j = ring * Math.abs(Math.sin(t * 38 + x)) * 10;
  const tilt = ring * Math.sin(t * 41 + x) * 8;
  const hs = o.picked ? '' : `<g transform="translate(0 ${n2(-j)}) rotate(${n2(tilt)})"><path d="M-34 -40 q34 -18 68 0 l-4 10 q-30 -12 -60 0z" fill="${col}"/><ellipse cx="-30" cy="-34" rx="11" ry="7" fill="${col}"/><ellipse cx="30" cy="-34" rx="11" ry="7" fill="${col}"/></g>`;
  let s = `<path d="M-38 0 L-30 -30 h60 L38 0z" fill="${col}"/><rect x="-38" y="-6" width="76" height="8" rx="4" fill="rgba(0,0,0,.18)"/><circle cx="0" cy="-15" r="10" fill="#fff8ec"/><circle cx="0" cy="-15" r="4" fill="${col}"/>` + hs;
  if (o.face) s += `<g transform="translate(0 -15)"><circle cx="-5" cy="-1" r="2" fill="${INK}"/><circle cx="5" cy="-1" r="2" fill="${INK}"/></g>`;
  if (ring > 0.1) {
    for (const side of [-1, 1]) for (let i = 0; i < 2; i++) {
      const r = 50 + i * 14;
      s += `<path d="M${side * r * 0.7} ${-50 - r * 0.2} q${side * 10} 12 0 26" stroke="${C.red}" stroke-width="4" fill="none" stroke-linecap="round" opacity="${n2(ring * (0.5 + 0.5 * Math.sin(t * 20 + i)))}"/>`;
    }
  }
  return g(tr(x, y), s);
}

export function monitor(x, y, w, h, kind, t = 0, o = {}) {
  let scr = '';
  const sw = w - 16, sh = h - 16;
  if (kind === 'alert') {
    const p = 0.5 + 0.5 * Math.sin(t * 10);
    scr = `<rect width="${sw}" height="${sh}" rx="8" fill="${mix('#7a1220', '#e5484d', p)}"/>` + text('!', sw / 2, sh * 0.62, { size: sh * 0.62, weight: 900, fill: '#fff' }) + text(o.label ?? 'ERRO', sw / 2, sh * 0.9, { size: sh * 0.15, weight: 900, fill: '#fff' });
  } else if (kind === 'sad') {
    scr = `<rect width="${sw}" height="${sh}" rx="8" fill="#ffb4a2"/><circle cx="${sw * 0.35}" cy="${sh * 0.42}" r="${sh * 0.07}" fill="${INK}"/><circle cx="${sw * 0.65}" cy="${sh * 0.42}" r="${sh * 0.07}" fill="${INK}"/><path d="M${sw * 0.35} ${sh * 0.75} q${sw * 0.15} ${-sh * 0.16} ${sw * 0.3} 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>` + text(o.label ?? 'REWORK', sw / 2, sh * 0.2, { size: sh * 0.14, weight: 900, fill: '#7a1220' });
  } else if (kind === 'chart') {
    scr = `<rect width="${sw}" height="${sh}" rx="8" fill="#10233f"/>`;
    for (let i = 0; i < 6; i++) { const bh = (0.25 + 0.6 * Math.abs(Math.sin(i * 1.7 + 1 + t * (o.live ? 1.5 : 0)))) * sh * 0.7; scr += `<rect x="${n2(sw * 0.1 + i * sw * 0.14)}" y="${n2(sh * 0.88 - bh)}" width="${n2(sw * 0.09)}" height="${n2(bh)}" rx="4" fill="${i % 2 ? '#4aa3ff' : '#38d39f'}"/>`; }
  } else if (kind === 'code') {
    scr = `<rect width="${sw}" height="${sh}" rx="8" fill="#16213a"/>`;
    for (let i = 0; i < 6; i++) scr += `<rect x="${12 + (i % 3) * 10}" y="${12 + i * (sh - 20) / 6}" width="${n2(sw * (0.3 + ((i * 37) % 40) / 100))}" height="7" rx="3.5" fill="${['#5aa9ff', '#7ee0b0', '#f7c873'][i % 3]}"/>`;
  } else if (kind === 'off') {
    scr = `<rect width="${sw}" height="${sh}" rx="8" fill="#2a2f3d"/>`;
  }
  return g(tr(x - w / 2, y - h), `<rect width="${w}" height="${h}" rx="12" fill="#262a33"/><g transform="translate(8 8)">${scr}</g><rect x="${w / 2 - 8}" y="${h}" width="16" height="22" fill="#262a33"/><rect x="${w / 2 - 40}" y="${h + 20}" width="80" height="8" rx="4" fill="#262a33"/>`);
}

export function paperSheet(x, y, rot, s = 1, col = '#fffdf6') {
  return g(tr(x, y, s, rot), `<rect x="-22" y="-28" width="44" height="56" rx="3" fill="${col}" filter="url(#dsSoft)"/><path d="M-13 -14h26M-13 -4h26M-13 6h18M-13 16h22" stroke="#b8b4a8" stroke-width="3" stroke-linecap="round"/>`);
}

export function plant(x, y, s = 1, pot = '#d9784a') {
  return g(tr(x, y, s), `<path d="M-26 -46 h52 l-6 46 h-40z" fill="${pot}"/><rect x="-30" y="-52" width="60" height="12" rx="5" fill="${mix(pot, '#000000', 0.15)}"/>`
    + `<ellipse cx="-16" cy="-82" rx="14" ry="30" fill="#4f9d5a" transform="rotate(-25 -16 -82)"/><ellipse cx="16" cy="-86" rx="14" ry="32" fill="#63b86a" transform="rotate(22 16 -86)"/><ellipse cx="0" cy="-100" rx="13" ry="36" fill="#3f8a4c"/>`);
}

export function windowPane(x, y, w, h, o = {}) {
  let sky = o.night ? `<rect width="${w}" height="${h}" fill="url(#night)"/>` : `<rect width="${w}" height="${h}" fill="#cfe8ff"/><circle cx="${w * 0.78}" cy="${h * 0.28}" r="${h * 0.12}" fill="#fff6d6"/>`;
  if (o.night) { const R = rng(hash('w' + x)); for (let i = 0; i < 18; i++) sky += `<circle cx="${n2(R() * w)}" cy="${n2(R() * h * 0.6)}" r="${n2(1 + R() * 1.6)}" fill="#fff" opacity=".8"/>`; }
  const city = o.city ? (() => { const R = rng(9); let c = ''; for (let i = 0; i < 9; i++) { const bw = w / 8, bh = h * (0.25 + R() * 0.4); c += `<rect x="${n2(i * bw - 6)}" y="${n2(h - bh)}" width="${n2(bw - 6)}" height="${n2(bh)}" fill="${o.night ? '#1d2448' : '#b9d4ef'}"/>`; if (o.night) for (let k = 0; k < 5; k++) if (R() > 0.4) c += `<rect x="${n2(i * bw + 4 + (k % 2) * 14)}" y="${n2(h - bh + 10 + k * 14)}" width="7" height="8" fill="#ffd27a"/>`; } return c; })() : '';
  return g(tr(x, y), `<rect x="-10" y="-10" width="${w + 20}" height="${h + 20}" rx="12" fill="${o.frame ?? '#ffffff'}"/><svg x="0" y="0" width="${w}" height="${h}" overflow="hidden">${sky}${city}</svg><rect x="${w / 2 - 4}" y="0" width="8" height="${h}" fill="${o.frame ?? '#ffffff'}"/><rect x="0" y="${h * 0.55}" width="${w}" height="8" fill="${o.frame ?? '#ffffff'}"/>`);
}

export function calendar(x, y, stampK = 0, o = {}) {
  let s = `<rect x="-130" y="-150" width="260" height="290" rx="14" fill="#fffdf6" filter="url(#ds)"/><rect x="-130" y="-150" width="260" height="62" rx="14" fill="${C.red}"/><rect x="-130" y="-104" width="260" height="16" fill="${C.red}"/>`;
  s += text('OUTUBRO', 0, -108, { size: 34, weight: 900, fill: '#fff' });
  s += `<rect x="-70" y="-168" width="12" height="36" rx="6" fill="${INK}"/><rect x="58" y="-168" width="12" height="36" rx="6" fill="${INK}"/>`;
  for (let i = 0; i < 28; i++) {
    const cx = -100 + (i % 7) * 33, cy = -60 + Math.floor(i / 7) * 46;
    s += text(String(i + 1), cx, cy, { size: 20, weight: 700, fill: '#8a8a96', family: 'DM Sans' });
  }
  const gx = -100 + 4 * 33, gy = -60 + 2 * 46;
  s += `<circle cx="${gx}" cy="${gy - 7}" r="20" fill="none" stroke="${C.green}" stroke-width="4"/>` + text('GO-LIVE', gx, gy + 24, { size: 14, weight: 900, fill: C.green });
  if (stampK > 0) s += stamp('ADIADO', 0, 10, { k: stampK, color: C.red, size: 56, rot: -14 });
  return g(tr(x, y, o.s ?? 1, o.rot ?? 0), s);
}

export function seedling(x, y, grow, t = 0, o = {}) {
  const k = clamp(grow);
  const h = 120 * ease.out(k);
  let s = `<path d="M-46 -70 h92 l-10 70 h-72z" fill="#d9784a"/><rect x="-52" y="-80" width="104" height="16" rx="7" fill="#c4683d"/>`;
  s += `<g transform="translate(0 -36)"><circle cx="-14" cy="-2" r="4.5" fill="${INK}"/><circle cx="14" cy="-2" r="4.5" fill="${INK}"/><circle cx="-12.5" cy="-3.5" r="1.6" fill="#fff"/><circle cx="15.5" cy="-3.5" r="1.6" fill="#fff"/><path d="M-9 8 q9 ${n2(4 + 4 * k)} 18 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/><ellipse cx="-24" cy="6" rx="6" ry="3.4" fill="${C.pink}" opacity="${n2(0.4 + 0.5 * k)}"/><ellipse cx="24" cy="6" rx="6" ry="3.4" fill="${C.pink}" opacity="${n2(0.4 + 0.5 * k)}"/></g>`;
  if (k > 0.01) {
    const sway = Math.sin(t * 2) * 3 * k;
    s += `<path d="M0 -80 q${n2(sway)} ${n2(-h / 2)} 0 ${n2(-h)}" stroke="#4f9d4a" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    const l1 = clamp(k * 2 - 0.6), l2 = clamp(k * 2 - 1);
    if (l1 > 0) s += `<g transform="translate(${n2(sway)} ${n2(-80 - h * 0.6)}) rotate(-30) scale(${n2(l1)})"><ellipse cx="-30" cy="0" rx="32" ry="15" fill="#6cc35a"/><path d="M-56 0 h48" stroke="#4f9d4a" stroke-width="3"/></g>`;
    if (l2 > 0) s += `<g transform="translate(${n2(sway)} ${n2(-80 - h * 0.85)}) rotate(30) scale(${n2(l2)})"><ellipse cx="30" cy="0" rx="32" ry="15" fill="#7fd06a"/><path d="M8 0 h48" stroke="#4f9d4a" stroke-width="3"/></g>`;
  }
  return g(tr(x, y, o.s ?? 1), s);
}

export function logoCard(name, x, y, w, h, o = {}) {
  const k = o.k ?? 1;
  const sc = k < 1 ? ease.bounce(k) : 1;
  const body = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${o.r ?? 22}" fill="#fff" filter="url(#ds)"/>` + logo(name, 0, 0, h * (o.lh ?? 0.62), w * 0.82);
  return op(Math.min(1, k * 3), g(tr(x, y, Math.max(0.001, sc), o.rot ?? 0), body));
}

export function easel(x, y, h = 220) {
  return `<path d="M${x - 70} ${y} L${x - 20} ${y - h} M${x + 70} ${y} L${x + 20} ${y - h} M${x} ${y - h + 10} L${x} ${y}" stroke="#8b5e3c" stroke-width="12" stroke-linecap="round"/>`;
}

// ---------- clima ----------
export function rainCloud(x, y, k, t, o = {}) {
  // k: 1 = nuvem cheia; 0 = sumiu
  if (k <= 0.01) return '';
  let s = '';
  for (let i = 0; i < 14; i++) {
    const dx = ((i * 37) % 160) - 80, ph = ((t * 1.6 + i * 0.13) % 1);
    s += `<path d="M${n2(dx - ph * 12)} ${n2(30 + ph * 120)} l-6 18" stroke="#7fa6d6" stroke-width="5" stroke-linecap="round" opacity="${n2((1 - ph) * k)}"/>`;
  }
  const body = `<g fill="#8c93a3"><circle cx="-50" cy="0" r="38"/><circle cx="0" cy="-22" r="52"/><circle cx="56" cy="-2" r="40"/><rect x="-88" y="0" width="182" height="38" rx="19"/></g>`
    + `<path d="M-30 -8 l16 6 M30 -8 l-16 6" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="-20" cy="6" r="5" fill="${INK}"/><circle cx="20" cy="6" r="5" fill="${INK}"/><path d="M-12 26 q12 -8 24 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return op(k, g(tr(x + Math.sin(t * 1.3) * 6, y, (o.s ?? 1) * lerp(0.6, 1, k)), s + body));
}

export function sun(x, y, k, t, o = {}) {
  if (k <= 0.01) return '';
  let rays = '';
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU + t * 0.4; rays += `<path d="M${n2(Math.cos(a) * 66)} ${n2(Math.sin(a) * 66)} L${n2(Math.cos(a) * 88)} ${n2(Math.sin(a) * 88)}" stroke="#ffc83a" stroke-width="9" stroke-linecap="round"/>`; }
  const body = rays + `<circle r="56" fill="#ffd84a"/><circle cx="-18" cy="-6" r="6" fill="${INK}"/><circle cx="18" cy="-6" r="6" fill="${INK}"/><circle cx="-16" cy="-8" r="2" fill="#fff"/><circle cx="20" cy="-8" r="2" fill="#fff"/><path d="M-16 14 q16 14 32 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="-32" cy="10" rx="8" ry="4.5" fill="${C.pink}" opacity=".7"/><ellipse cx="32" cy="10" rx="8" ry="4.5" fill="${C.pink}" opacity=".7"/>`;
  return op(Math.min(1, k * 2), g(tr(x, y, ease.bounce(clamp(k)) * (o.s ?? 1)), body));
}

export function checkBadge(x, y, k, s = 1) {
  if (k <= 0) return '';
  return g(tr(x, y, ease.bounce(clamp(k)) * s), `<circle r="42" fill="${C.green}" filter="url(#dsSoft)"/><path d="M-18 2 l12 12 l24 -26" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
}

// ---------- lugares do mapa (k: 0 antes → 1 depois) ----------
const tree = (x, y, s, k) => g(tr(x, y, s), `<rect x="-7" y="-40" width="14" height="40" rx="5" fill="${bloom('#8a5a36', k)}"/><circle cx="0" cy="-62" r="36" fill="${bloom('#4fa35a', k)}"/><circle cx="16" cy="-78" r="22" fill="${bloom('#63b86a', k)}"/>`);

export function placeClinic(x, y, k, t) {
  let s = tree(-250, 0, 1, k) + tree(260, 0, 0.85, k);
  s += `<rect x="-190" y="-250" width="380" height="250" rx="18" fill="${bloom('#fbfbf8', k)}"/>`;
  s += `<rect x="-205" y="-268" width="410" height="40" rx="14" fill="${bloom('#0b9a5c', k)}"/>`;
  for (const wx of [-130, 70]) s += `<rect x="${wx}" y="-190" width="60" height="56" rx="8" fill="${bloom('#8fc9ff', k)}"/><rect x="${wx}" y="-165" width="60" height="6" fill="${bloom('#fbfbf8', k)}"/>`;
  s += `<rect x="-35" y="-120" width="70" height="120" rx="10" fill="${bloom('#0b7a4b', k)}"/>`;
  s += `<g transform="translate(0 -320) rotate(${n2(k * t * 40)})"><rect x="-42" y="-14" width="84" height="28" rx="8" fill="${bloom('#20b066', k)}"/><rect x="-14" y="-42" width="28" height="84" rx="8" fill="${bloom('#20b066', k)}"/></g>`;
  return g(tr(x, y), s);
}

export function placeLab(x, y, k, t) {
  let s = tree(-280, 0, 0.9, k);
  s += `<rect x="-160" y="-200" width="320" height="200" rx="16" fill="${bloom('#f3f6fb', k)}"/><path d="M-150 -200 a150 130 0 0 1 300 0z" fill="${bloom('#1d5fb8', k)}"/><rect x="-30" y="-110" width="60" height="110" rx="10" fill="${bloom('#1d5fb8', k)}"/>`;
  const flask = (fx, col, i) => {
    let b = `<path d="M-14 -150 h28 v40 l46 96 q6 14 -10 14 h-100 q-16 0 -10 -14 l46 -96z" fill="#eef8ff" stroke="#9cc9e6" stroke-width="4"/>`;
    b += `<path d="M-38 -50 h76 l18 36 q6 14 -10 14 h-92 q-16 0 -10 -14z" fill="${bloom(col, k)}"/>`;
    if (k > 0.5) for (let q = 0; q < 4; q++) { const u = (t * 0.8 + q * 0.25 + i * 0.1) % 1; b += `<circle cx="${n2(-14 + q * 9)}" cy="${n2(-20 - u * 110)}" r="${n2(6 * (1 - u * 0.5))}" fill="${col}" opacity="${n2(0.8 * (1 - u))}"/>`; }
    else { const u = (t * 0.5) % 1; b += `<circle cx="0" cy="${n2(-170 - u * 60)}" r="${n2(14 + u * 20)}" fill="#8c93a3" opacity="${n2(0.6 * (1 - u))}"/>`; }
    return g(tr(fx, 0), b);
  };
  s += flask(230, '#43d17a', 0) + flask(330, '#4aa3ff', 1);
  return g(tr(x, y), s);
}

export function placeTrack(x, y, k, t, age = -1) {
  let s = `<ellipse cx="0" cy="-60" rx="330" ry="90" fill="${bloom('#5a606c', k)}"/><ellipse cx="0" cy="-60" rx="250" ry="52" fill="${bloom('#9ccf6f', k)}"/><ellipse cx="0" cy="-60" rx="290" ry="71" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="22 16" opacity=".8"/>`;
  // bandeira quadriculada
  s += `<rect x="290" y="-260" width="8" height="200" rx="3" fill="#ddd"/>`;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) s += `<rect x="${298 + i * 22}" y="${-258 + j * 18 + Math.sin(t * 5 + i) * 3}" width="22" height="18" fill="${(i + j) % 2 ? '#111' : '#fff'}"/>`;
  // carro (vista lateral)
  const moving = k > 0.5;
  const a = moving ? (age > 0 ? age * 2.4 : 0) - 0.4 : -0.4;
  const cx = Math.cos(a) * 290, cy = -60 + Math.sin(a) * 71;
  const dir = moving ? (Math.sin(a) > 0 ? -1 : 1) : 1;
  let car = `<rect x="-60" y="-34" width="120" height="30" rx="14" fill="${bloom('#13286b', k)}"/><path d="M-30 -34 q10 -26 40 -26 q22 0 34 26z" fill="${bloom('#13286b', k)}"/><path d="M-20 -36 q8 -18 28 -18 q14 0 22 18z" fill="#bfe3ff"/><rect x="-60" y="-22" width="120" height="7" fill="${bloom('#14a04f', k)}"/><circle cx="-34" cy="-4" r="15" fill="#1b1c20"/><circle cx="34" cy="-4" r="15" fill="#1b1c20"/><circle cx="-34" cy="-4" r="6" fill="#cfd5dd"/><circle cx="34" cy="-4" r="6" fill="#cfd5dd"/>`;
  if (moving && age > 0) car += `<path d="M-70 -30 h-50 M-70 -16 h-70 M-70 -2 h-40" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".35"/>`;
  if (!moving) { const u = (t * 0.6) % 1; car += `<circle cx="${n2(40 + u * 10)}" cy="${n2(-50 - u * 70)}" r="${n2(12 + u * 18)}" fill="#8c93a3" opacity="${n2(0.65 * (1 - u))}"/>`; }
  s += g(tr(cx, cy + 10, 1, 0, dir, 1), car);
  for (const [tx, ty] of [[-330, 0], [-300, 0]]) for (let i = 0; i < 3; i++) s += `<ellipse cx="${tx}" cy="${ty - 10 - i * 16}" rx="22" ry="9" fill="#2a2c31"/>`;
  return g(tr(x, y), s);
}

export function placeFarm(x, y, k, t, age = -1) {
  let s = `<path d="M-340 0 L-300 -120 h300 L20 0z" fill="${bloom('#c9a36a', k)}"/>`;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
    const px = -300 + c * 52 + r * 6, py = -18 - r * 22;
    const h = lerp(8, 22, k);
    s += `<ellipse cx="${px}" cy="${py - h / 2}" rx="9" ry="${n2(h / 2)}" fill="${bloom(c % 2 ? '#8fcf4a' : '#e2c94a', k)}"/>`;
  }
  // celeiro
  s += `<rect x="60" y="-170" width="150" height="170" fill="${bloom('#b5452f', k)}"/><path d="M50 -170 l85 -70 l85 70z" fill="${bloom('#8a3424', k)}"/><rect x="105" y="-90" width="60" height="90" fill="${bloom('#f4ecdf', k)}"/><path d="M105 -90 l60 90 M165 -90 l-60 90" stroke="${bloom('#b5452f', k)}" stroke-width="6"/>`;
  // placa
  s += `<rect x="258" y="-190" width="8" height="190" fill="#8a5a36"/><g transform="translate(262 -170) rotate(-4)"><rect x="-80" y="-24" width="160" height="44" rx="10" fill="#74acdf"/><rect x="-80" y="-5" width="160" height="6" fill="#fff" opacity=".9"/>${text('ARGENTINA', 0, 9, { size: 24, weight: 900, fill: '#fff' })}</g>`;
  // trator
  const drive = k > 0.5 && age > 0 ? Math.min(age, 3) : 0;
  const tx = -150 + drive * 60, tilt = k < 0.5 ? -6 : Math.sin(t * 14) * 0.6;
  const tr2 = `<rect x="-70" y="-110" width="110" height="60" rx="12" fill="${bloom('#3d8a35', k)}"/><rect x="30" y="-90" width="60" height="44" rx="10" fill="${bloom('#3d8a35', k)}"/><rect x="-60" y="-170" width="70" height="66" rx="8" fill="#bfe3ff" stroke="${bloom('#3d8a35', k)}" stroke-width="8"/><rect x="66" y="-120" width="8" height="32" fill="#555"/>`
    + `<circle cx="-40" cy="-40" r="40" fill="#1f2125"/><circle cx="-40" cy="-40" r="20" fill="${bloom('#f2c230', k)}"/><circle cx="62" cy="-26" r="26" fill="#1f2125"/><circle cx="62" cy="-26" r="12" fill="${bloom('#f2c230', k)}"/>`;
  s += g(tr(tx, k < 0.5 ? 14 : 0, 1, tilt), tr2);
  if (k < 0.5) s += `<ellipse cx="-160" cy="0" rx="130" ry="18" fill="#6b4a2a" opacity=".55"/>`;
  return g(tr(x, y), s);
}

export function placeSpace(x, y, k, t) {
  let s = `<path d="${blobPath(0, -230, 330, 77, 0.12)}" fill="url(#night)" opacity="${n2(lerp(0.55, 1, k))}"/>`;
  const R = rng(5);
  for (let i = 0; i < 26; i++) { const sx = (R() - 0.5) * 520, sy = -230 + (R() - 0.5) * 380; s += `<circle cx="${n2(sx)}" cy="${n2(sy)}" r="${n2(1.5 + R() * 2.5)}" fill="#fff" opacity="${n2(0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))}"/>`; }
  s += `<circle cx="160" cy="-360" r="34" fill="#ffd9a8"/><circle cx="150" cy="-370" r="8" fill="#f2c28a"/>`;
  // antena
  const ang = lerp(40, -20, k);
  s += `<rect x="-200" y="-120" width="16" height="120" rx="6" fill="#8a93a3"/><g transform="translate(-192 -130) rotate(${n2(ang)})"><path d="M-80 0 a80 46 0 0 0 160 0z" fill="${bloom('#eef1f6', k)}"/><rect x="-4" y="-70" width="8" height="70" fill="#8a93a3"/><circle cx="0" cy="-74" r="10" fill="#eef1f6"/>${k > 0.5 ? `<path d="M0 -84 L-70 -330 L70 -330Z" fill="#7fd1ff" opacity="${n2(0.18 + 0.08 * Math.sin(t * 6))}"/>` : ''}</g>`;
  // satélite orbitando
  if (k > 0.3) {
    const a = t * 0.8;
    s += g(tr(Math.cos(a) * 220, -250 + Math.sin(a) * 90, 1, -15), `<rect x="-20" y="-16" width="40" height="32" rx="6" fill="#d8b24a"/><rect x="-74" y="-10" width="50" height="20" rx="3" fill="#2b5fbf"/><rect x="24" y="-10" width="50" height="20" rx="3" fill="#2b5fbf"/>`);
  }
  return g(tr(x, y), s);
}

export function placeSite(x, y, k, t, age = -1) {
  let s = '';
  // guindaste
  s += `<rect x="-300" y="-420" width="26" height="420" fill="#f2b230"/>`;
  for (let i = 0; i < 8; i++) s += `<path d="M-300 ${-420 + i * 52} l26 52 M-274 ${-420 + i * 52} l-26 52" stroke="#c88a10" stroke-width="3"/>`;
  const sw = Math.sin(t * 0.8) * 6;
  s += g(tr(-287, -420, 1, sw), `<rect x="-60" y="-14" width="340" height="22" rx="4" fill="#f2b230"/><rect x="-90" y="-20" width="40" height="34" rx="4" fill="#555b66"/><rect x="236" y="8" width="3" height="${n2(140 + Math.sin(t * 2) * 10)}" fill="#333"/><rect x="222" y="${n2(146 + Math.sin(t * 2) * 10)}" width="30" height="24" rx="4" fill="${C.red}"/>`);
  // prédio que sobe
  const built = k > 0.5 ? clamp((age + 0.3) / 1.4) : 0.25;
  const floors = ['#0a4fd6', '#3d7bff', '#0a4fd6', '#6fa3ff'];
  floors.forEach((c, i) => {
    const u = clamp(built * 4 - i);
    if (u <= 0) return;
    const hh = 70 * ease.out(u);
    s += `<rect x="-60" y="${n2(-(i * 72) - hh)}" width="230" height="${n2(hh)}" rx="6" fill="${bloom(c, k)}"/>`;
    if (u > 0.9) for (let w = 0; w < 3; w++) s += `<rect x="${-36 + w * 70}" y="${-(i * 72) - 50}" width="44" height="30" rx="5" fill="#cfe6ff" opacity=".9"/>`;
  });
  if (built > 0.99) s += `<rect x="-72" y="-306" width="254" height="16" rx="6" fill="#f2b230"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${200 + (i % 3) * 46}" y="${-30 - Math.floor(i / 3) * 30}" width="42" height="26" rx="4" fill="${bloom('#d9784a', k)}"/>`;
  s += `<path d="M-340 -2 h680" stroke="#f2b230" stroke-width="8" stroke-dasharray="26 18"/>`;
  return g(tr(x, y), s);
}

// ---------- mapa ----------
export function road(d, w = 70) {
  return `<path d="${d}" stroke="#e2cfa6" stroke-width="${w + 16}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#f1e2bf" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#fffaf0" stroke-width="6" fill="none" stroke-dasharray="26 22" stroke-linecap="round"/>`;
}

export function pin(x, y, label, col, k = 1) {
  if (k <= 0) return '';
  return g(tr(x, y, ease.bounce(clamp(k))), `<ellipse cx="0" cy="4" rx="18" ry="5" fill="${C.shadow}"/><path d="M0 0 C-14 -26 -34 -40 -34 -64 a34 34 0 0 1 68 0 C34 -40 14 -26 0 0z" fill="${col}"/><circle cx="0" cy="-64" r="22" fill="#fff"/>` + text(label, 0, -56, { size: 22, weight: 900, fill: col }));
}

// ---------- gráficos e dados ----------
export function robot(x, y, t, seed = 0, s = 1) {
  const bob = Math.sin(t * 4 + seed) * 8;
  return g(tr(x, y + bob, s, Math.sin(t * 3 + seed) * 6), `<ellipse cx="0" cy="60" rx="26" ry="5" fill="${C.shadow}" opacity=".6"/><circle r="34" fill="#fff" filter="url(#dsSoft)"/><rect x="-24" y="-14" width="48" height="26" rx="12" fill="#14203a"/><circle cx="-10" cy="-1" r="5" fill="#4ff0ff"/><circle cx="10" cy="-1" r="5" fill="#4ff0ff"/><rect x="-2" y="-52" width="4" height="18" fill="#9aa3b2"/><circle cx="0" cy="-54" r="6" fill="${C.red}"/><ellipse cx="-38" cy="6" rx="8" ry="12" fill="#e6ecf5"/><ellipse cx="38" cy="6" rx="8" ry="12" fill="#e6ecf5"/>`);
}

export function dashCard(x, y, w, h, kind, k, t) {
  if (k <= 0) return '';
  let c = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="#fff" filter="url(#ds)"/><rect x="${-w / 2 + 18}" y="${-h / 2 + 16}" width="${w * 0.4}" height="10" rx="5" fill="#d9dde6"/>`;
  const ix = -w / 2 + 20, iy = -h / 2 + 40, iw = w - 40, ih = h - 60;
  if (kind === 'bars') for (let i = 0; i < 6; i++) { const bh = ih * (0.3 + 0.6 * Math.abs(Math.sin(i * 1.3 + t * 1.2))); c += `<rect x="${n2(ix + i * iw / 6)}" y="${n2(iy + ih - bh)}" width="${n2(iw / 6 - 8)}" height="${n2(bh)}" rx="5" fill="${i % 2 ? C.blue : C.green}"/>`; }
  else if (kind === 'line') { let d = ''; for (let i = 0; i <= 12; i++) { const px = ix + (i / 12) * iw, py = iy + ih - (ih * (0.2 + 0.6 * (i / 12)) + Math.sin(i + t * 2) * ih * 0.08); d += (i ? 'L' : 'M') + n2(px) + ' ' + n2(py); } c += `<path d="${d}" stroke="${C.amber}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
  else if (kind === 'donut') { const a = 0.72 + 0.05 * Math.sin(t); c += `<circle cx="0" cy="${iy + ih / 2}" r="${ih * 0.42}" fill="none" stroke="#e8ebf2" stroke-width="18"/><circle cx="0" cy="${iy + ih / 2}" r="${ih * 0.42}" fill="none" stroke="${C.green}" stroke-width="18" stroke-dasharray="${n2(a * TAU * ih * 0.42)} 999" transform="rotate(-90 0 ${iy + ih / 2})" stroke-linecap="round"/>` + text(Math.round(a * 100) + '%', 0, iy + ih / 2 + 10, { size: 26, weight: 900 }); }
  else if (kind === 'kpi') { c += text('▲', -w / 2 + 40, iy + 38, { size: 30, fill: C.green }) + `<rect x="${-w / 2 + 64}" y="${iy + 14}" width="${w * 0.45}" height="22" rx="11" fill="${C.green}" opacity=".85"/><rect x="${-w / 2 + 24}" y="${iy + 54}" width="${w * 0.7}" height="12" rx="6" fill="#d9dde6"/>`; }
  return g(tr(x, y, ease.bounce(clamp(k))), c);
}

export function vinyl(x, y, rot) {
  return g(tr(x, y, 1, rot), `<circle r="90" fill="#16171c"/><circle r="70" fill="none" stroke="#2b2d35" stroke-width="3"/><circle r="52" fill="none" stroke="#2b2d35" stroke-width="3"/><circle r="30" fill="${C.red}"/><circle r="5" fill="#fff"/><path d="M-60 -40 q20 -30 60 -36" stroke="rgba(255,255,255,.35)" stroke-width="6" fill="none" stroke-linecap="round"/>`);
}

export function nfDoc(x, y, s = 1, rot = 0, o = {}) {
  let b = `<rect x="-60" y="-80" width="120" height="160" rx="10" fill="#fff" filter="url(#dsSoft)"/><rect x="-60" y="-80" width="120" height="36" rx="10" fill="${C.blue}"/><rect x="-60" y="-56" width="120" height="12" fill="${C.blue}"/>` + text('NF', 0, -52, { size: 26, weight: 900, fill: '#fff' });
  b += `<path d="M-40 -24h80M-40 -6h80M-40 12h52" stroke="#c9ccd6" stroke-width="7" stroke-linecap="round"/>`;
  if (o.face) b += `<circle cx="-16" cy="40" r="6" fill="${INK}"/><circle cx="16" cy="40" r="6" fill="${INK}"/><path d="M-10 58 q10 ${o.face === 'happy' ? 8 : -6} 20 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else b += `<path d="M-40 34h60M-40 52h40" stroke="#c9ccd6" stroke-width="7" stroke-linecap="round"/>`;
  return g(tr(x, y, s, rot), b);
}
