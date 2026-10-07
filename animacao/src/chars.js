// Elenco em 2D (SVG). Cada personagem é desenhado por uma função pura do estado:
// drawChar(id, st) -> string SVG. Pés em (st.x, st.y); escala padrão 1.45.
//
// st: { x, y, s, dir, t, walk, bob, hop, sx, sy, lean, armL, armR, lenL, lenR,
//       expr, talk, gaze:[dx,dy], blink, propR, propL, front, lock, ting, sweat, alpha, headTilt }
// armL/armR: ângulo de elevação em graus (-28 = repouso; 90 = para cima).
import { tr, g, op, clamp, lerp, hash, C, n2 } from './core.js';
import { ELENCO, EMPRESAS } from './roteiro.js';

export const ASC = 1.45;
const INK = C.ink;

export const EXPR = {
  neutral: { brow: 0, tilt: 0, k: 0.6, w: 1, eye: 1, blush: 0 },
  calm: { brow: 0, tilt: 0, k: 0.5, w: 1, eye: 0.92, blush: 0 },
  happy: { brow: -2, tilt: 0, k: 1.15, w: 1.15, eye: 1, blush: 0.5 },
  joy: { brow: -4, tilt: 0, k: 1.2, w: 1.25, eye: 0.9, blush: 0.7, open: 0.75 },
  proud: { brow: -3, tilt: -10, k: 1, w: 1.2, eye: 0.85, blush: 0.3 },
  excited: { brow: -4, tilt: 0, k: 1.3, w: 1.3, eye: 1.2, blush: 0.6 },
  surprised: { brow: -6, tilt: 0, k: 0, w: 1, eye: 1.35, blush: 0, o: 1 },
  worried: { brow: -1, tilt: 16, k: -0.5, w: 0.9, eye: 1.1, blush: 0 },
  panic: { brow: -5, tilt: 20, k: -0.6, w: 1, eye: 1.3, blush: 0, o: 0.85 },
  serious: { brow: 2, tilt: -12, k: 0.15, w: 0.9, eye: 0.95, blush: 0 },
  determined: { brow: 2, tilt: -14, k: 0.5, w: 1, eye: 0.9, blush: 0 },
  sly: { brow: [1, -3], tilt: [-10, -4], k: 0.8, w: 1.05, eye: 0.8, blush: 0 },
  sad: { brow: 2, tilt: 18, k: -0.9, w: 0.9, eye: 0.95, blush: 0 },
  thinking: { brow: [-1, 2], tilt: [-8, 6], k: 0.1, w: 0.9, eye: 1, blush: 0 },
};

function resolveExpr(e) {
  const base = { brow: 0, tilt: 0, k: 0.6, w: 1, eye: 1, blush: 0, o: 0, open: 0 };
  if (!e) return base;
  if (typeof e === 'string') return { ...base, ...EXPR[e] };
  if (Array.isArray(e)) {
    const [a, b, k] = e;
    const A = resolveExpr(a), B = resolveExpr(b), out = {};
    for (const key in base) {
      const va = A[key], vb = B[key];
      if (Array.isArray(va) || Array.isArray(vb)) {
        const aa = Array.isArray(va) ? va : [va, va], bb = Array.isArray(vb) ? vb : [vb, vb];
        out[key] = [lerp(aa[0], bb[0], k), lerp(aa[1], bb[1], k)];
      } else out[key] = lerp(va ?? 0, vb ?? 0, k);
    }
    return out;
  }
  return { ...base, ...e };
}

// ---------------- Rosto ----------------
// o: { cx, cy, ex, er, my, mw, browY, ink, plate }
function face(st, o, seed) {
  const E = resolveExpr(st.expr);
  const t = st.t ?? 0;
  const ink = o.ink ?? INK;
  const er = o.er ?? 1;
  // piscar
  let bl = 1;
  if (st.blink != null) bl = 1 - st.blink;
  else {
    const per = 4.2 + (seed % 10) / 10;
    const ph = (t + (seed % 97) * 0.37) % per;
    if (ph < 0.14) bl = Math.abs(ph - 0.07) / 0.07;
  }
  bl = Math.max(0.08, bl);
  const [gx, gy] = st.gaze ?? [0, 0];
  let s = '';
  for (const side of [-1, 1]) {
    const ex = o.cx + side * o.ex;
    const sc = E.eye;
    s += `<g transform="translate(${n2(ex)} ${n2(o.cy)}) scale(${n2(sc)} ${n2(sc * bl)})">`
      + `<ellipse rx="${n2(7.5 * er)}" ry="${n2(8.5 * er)}" fill="#fff"/>`
      + `<g transform="translate(${n2(gx * 3.4 * er + 0.8)} ${n2(gy * 3 * er + 0.8)})"><circle r="${n2(4.3 * er)}" fill="${ink}"/><circle cx="${n2(1.6 * er)}" cy="${n2(-1.9 * er)}" r="${n2(1.55 * er)}" fill="#fff"/></g></g>`;
  }
  // sobrancelhas
  const bys = Array.isArray(E.brow) ? E.brow : [E.brow, E.brow];
  const tls = Array.isArray(E.tilt) ? E.tilt : [E.tilt, E.tilt];
  const by = o.cy - 12.5 * er + (o.browY ?? 0);
  for (const [i, side] of [[0, -1], [1, 1]]) {
    const bx = o.cx + side * o.ex;
    const rot = side < 0 ? -tls[0] : tls[1];
    s += `<path d="M${n2(bx - 7 * er)} ${n2(by + 1)} q${n2(7 * er)} ${n2(-4 * er)} ${n2(14 * er)} ${n2(-0.5 * er)}" stroke="${ink}" stroke-width="${n2(2.9 * er)}" fill="none" stroke-linecap="round" transform="translate(0 ${n2(bys[i])}) rotate(${n2(rot)} ${n2(bx)} ${n2(by)})"/>`;
  }
  // bochechas
  if (E.blush > 0.01) for (const side of [-1, 1])
    s += `<ellipse cx="${n2(o.cx + side * (o.ex + 8.5 * er))}" cy="${n2(o.cy + 9 * er)}" rx="${n2(4.6 * er)}" ry="${n2(2.7 * er)}" fill="${C.pink}" opacity="${n2(E.blush * 0.85)}"/>`;
  // boca
  const mw = (o.mw ?? 17) * E.w * er, mx = o.cx, my = o.my;
  let open = E.open ?? 0;
  if (st.talk) {
    const k = typeof st.talk === 'number' ? st.talk : 1;
    open = Math.max(open, k * (0.3 + 0.7 * Math.abs(Math.sin(t * 13.5 + seed))) * (0.65 + 0.35 * Math.sin(t * 3.9 + seed)));
  }
  if (E.o > 0.05 && open < 0.2) {
    s += `<ellipse cx="${n2(mx)}" cy="${n2(my + 2)}" rx="${n2(4.2 * er * (0.6 + 0.4 * E.o))}" ry="${n2(5.6 * er * E.o)}" fill="${o.mouthFill ?? '#3a1d24'}"/>`;
  } else if (open > 0.06) {
    const H = (3 + 11 * open) * er, k = E.k;
    const x0 = mx - mw / 2;
    s += `<path d="M${n2(x0)} ${n2(my)} Q${n2(mx)} ${n2(my + k * 4)} ${n2(x0 + mw)} ${n2(my)} Q${n2(mx)} ${n2(my + k * 4 + H * 1.7)} ${n2(x0)} ${n2(my)}Z" fill="#3a1d24"/>`;
    s += `<ellipse cx="${n2(mx)}" cy="${n2(my + k * 2 + H * 0.95)}" rx="${n2(mw * 0.2)}" ry="${n2(H * 0.22)}" fill="#e46b7b"/>`;
  } else {
    s += `<path d="M${n2(mx - mw / 2)} ${n2(my)} q${n2(mw / 2)} ${n2(E.k * 9 * er)} ${n2(mw)} 0" stroke="${o.mouthStroke ?? ink}" stroke-width="${n2(2.7 * er)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

// ---------------- Peças ----------------
function arm(side, sx, sy, raise, len, sleeve, hand, prop, keepUpright = true) {
  // side: -1 = esquerda da tela; +1 = direita
  const rot = side < 0 ? raise : -raise;
  const x0 = side < 0 ? sx - len : sx;
  const hx = sx + side * len;
  let p = '';
  if (prop) p = keepUpright ? `<g transform="rotate(${n2(-rot)} ${n2(hx)} ${n2(sy)})">${prop(hx, sy)}</g>` : prop(hx, sy);
  return `<g transform="rotate(${n2(rot)} ${n2(sx)} ${n2(sy)})"><rect x="${n2(x0)}" y="${n2(sy - 5.5)}" width="${n2(len)}" height="11" rx="5.5" fill="${sleeve}"/>${p}<circle cx="${n2(hx)}" cy="${n2(sy)}" r="6.6" fill="${hand}"/></g>`;
}

function legs(lx, rx, top, len, pants, shoe, walkA) {
  const leg = (x, a) => `<g transform="rotate(${n2(a)} ${n2(x)} ${n2(top)})"><rect x="${n2(x - 6.5)}" y="${n2(top)}" width="13" height="${n2(len)}" rx="6" fill="${pants}"/><ellipse cx="${n2(x - 0.5)}" cy="${n2(top + len + 1)}" rx="10" ry="5" fill="${shoe}"/></g>`;
  return leg(lx, walkA) + leg(rx, -walkA);
}

const sheen = (d, w = 5) => `<path d="${d}" stroke="rgba(255,255,255,.38)" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

// ---------------- Objetos de mão ----------------
export const PROPS = {
  phone: (x, y) => `<g transform="translate(${n2(x)} ${n2(y)}) rotate(-12)"><rect x="-6" y="-21" width="12" height="22" rx="3" fill="#23252c"/><rect x="-4.3" y="-18.5" width="8.6" height="15" rx="1.5" fill="#8fd3ff"/></g>`,
  stopwatch: (x, y) => `<g transform="translate(${n2(x)} ${n2(y - 14)})"><rect x="-3" y="-17" width="6" height="6" rx="2" fill="#c9962e"/><circle r="12" fill="#f2c14a"/><circle r="9" fill="#fffaf0"/><path d="M0 0 V-6.5 M0 0 L4.5 2.5" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/></g>`,
  clipboard: (x, y) => `<g transform="translate(${n2(x)} ${n2(y - 6)}) rotate(-6)"><rect x="-15" y="-22" width="30" height="40" rx="4" fill="#fffaf0" stroke="${INK}" stroke-width="2.4"/><rect x="-7" y="-26" width="14" height="7" rx="2" fill="${INK}"/><path d="M-9 -10h18M-9 -2h18M-9 6h11" stroke="#9a9aa8" stroke-width="2.4" stroke-linecap="round"/></g>`,
  wrench: (x, y) => `<g transform="translate(${n2(x)} ${n2(y)}) rotate(165)"><rect x="-3.5" y="-40" width="7" height="42" rx="3" fill="#aeb6c2"/><path d="M-9 -44 a9 9 0 1 1 18 0 l-4 0 l0 -6 l-10 0 l0 6z" fill="#aeb6c2"/></g>`,
  blueprint: (x, y) => `<g transform="translate(${n2(x)} ${n2(y)}) rotate(40)"><rect x="-6" y="-38" width="12" height="44" rx="6" fill="#8fc0ff"/><ellipse cx="0" cy="-38" rx="6" ry="2.5" fill="#4f8fe0"/></g>`,
  flask: (x, y) => `<g transform="translate(${n2(x)} ${n2(y - 2)})"><path d="M-3 -24h6v8l9 16q2 4 -2 4h-20q-4 0 -2 -4l9 -16z" fill="#e6f6ff" stroke="#9cc9e6" stroke-width="2"/><path d="M-9 -4h18l2 4q1 4 -3 4h-16q-4 0 -3 -4z" fill="#3ad08a"/></g>`,
  helmet: (x, y) => `<g transform="translate(${n2(x)} ${n2(y + 6)})"><circle r="15" fill="#13286b"/><path d="M-15 -2 a15 15 0 0 1 30 0" fill="none" stroke="#14a04f" stroke-width="5"/><rect x="-10" y="-4" width="20" height="10" rx="5" fill="#101418"/></g>`,
  tablet: (x, y) => `<g transform="translate(${n2(x)} ${n2(y - 4)}) rotate(-8)"><rect x="-17" y="-24" width="34" height="26" rx="4" fill="#1d2230"/><rect x="-14" y="-21" width="28" height="20" rx="2" fill="#0f2a55"/><path d="M-11 -5v-5M-6 -5v-9M-1 -5v-6M4 -5v-12M9 -5v-8" stroke="#5fe1ff" stroke-width="3" stroke-linecap="round"/></g>`,
  nf: (x, y) => `<g transform="translate(${n2(x)} ${n2(y - 8)}) rotate(-8)"><rect x="-14" y="-20" width="28" height="36" rx="3" fill="#fff" stroke="${INK}" stroke-width="2"/><text x="0" y="-6" font-family="Outfit" font-weight="900" font-size="10" fill="${C.blue}" text-anchor="middle">NF</text><path d="M-8 2h16M-8 8h11" stroke="#9a9aa8" stroke-width="2" stroke-linecap="round"/></g>`,
};

// ---------------- Cabelos e chapéus (cabeça centrada em 0,0, r=28) ----------------
function hairBack(style, col) {
  if (style === 'long') return `<path d="M-31 -6 q-2 -26 31 -30 q33 4 31 30 v34 q0 8 -8 8 h-46 q-8 0 -8 -8z" fill="${col}"/>`;
  return '';
}
function hairFront(style, col, lock = 0) {
  switch (style) {
    case 'swoop': {
      // topete com uma mecha que pode cair na testa
      const lk = clamp(lock);
      const mecha = `<g transform="translate(-8 -24) rotate(${n2(lerp(165, 15, lk))})"><path d="M0 0 q-9 5 -6 15 q2 4 5 2" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
      return `<path d="M-29 -2 q-1 -30 26 -32 q30 -2 32 26 q-8 -12 -24 -12 q-18 0 -34 18z" fill="${col}"/><path d="M-22 -22 q16 -24 46 -10 q-6 -2 -14 2 q-14 -10 -32 8z" fill="${col}"/>` + mecha;
    }
    case 'short':
      return `<path d="M-29 -3 q-2 -29 28 -31 q31 0 30 30 q-6 -13 -18 -15 q-6 7 -16 5 q-8 -3 -12 -6 q-8 6 -12 17z" fill="${col}"/>`;
    case 'buzz':
      return `<path d="M-28 -6 q0 -26 28 -27 q28 1 28 27 q-6 -14 -28 -16 q-22 2 -28 16z" fill="${col}"/>`;
    case 'long':
      return `<path d="M-30 4 q-4 -34 30 -36 q34 2 30 36 q-4 -14 -12 -20 q-14 8 -38 2 q-6 6 -10 18z" fill="${col}"/>`;
    case 'bun':
      return `<circle cx="0" cy="-34" r="11" fill="${col}"/><path d="M-29 -2 q-2 -30 29 -31 q31 1 29 31 q-8 -16 -29 -17 q-21 1 -29 17z" fill="${col}"/>`;
    case 'ponytail':
      return `<path d="M24 -18 q20 6 16 34 q-6 -10 -14 -14z" fill="${col}"/><path d="M-29 -2 q-2 -30 29 -31 q31 1 29 31 q-10 -15 -29 -16 q-19 1 -29 16z" fill="${col}"/>`;
    case 'curly': {
      let s = '';
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * (1.05 + (i / 10) * 0.9);
        s += `<circle cx="${n2(Math.cos(a) * 26)}" cy="${n2(Math.sin(a) * 26 - 2)}" r="9.5" fill="${col}"/>`;
      }
      return s + `<path d="M-26 -8 q0 -22 26 -22 q26 0 26 22 q-10 -10 -26 -10 q-16 0 -26 10z" fill="${col}"/>`;
    }
    case 'wild':
      return [[-24, -14, 8], [-30, -2, 7], [24, -14, 8], [30, -2, 7], [-14, -26, 7], [14, -26, 7], [0, -30, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`).join('');
    default:
      return '';
  }
}
function hat(kind) {
  if (kind === 'campo') return `<ellipse cx="0" cy="-20" rx="50" ry="9" fill="#d9b06a"/><path d="M-24 -20 q0 -26 24 -27 q24 1 24 27z" fill="#e2bd78"/><rect x="-24" y="-27" width="48" height="7" rx="2" fill="#7a5233"/><ellipse cx="0" cy="-20" rx="50" ry="9" fill="none" stroke="#c49a52" stroke-width="2"/>`;
  if (kind === 'obra') return `<path d="M-31 -14 q0 -32 31 -33 q31 1 31 33z" fill="#0a4fd6"/><rect x="-37" y="-17" width="74" height="9" rx="4.5" fill="#0a4fd6"/><rect x="-5" y="-46" width="10" height="30" rx="4" fill="#3d7bff"/>` + sheen('M-20 -24 q4 -14 16 -17', 4);
  return '';
}

// ---------------- Tronco por figurino ----------------
function torso(S, W = 60, top = -88, bot = -22) {
  const x = -W / 2, h = bot - top, col = S.top;
  let s = '';
  switch (S.outfit) {
    case 'suit':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      s += `<path d="M-11 ${top + 1} L0 ${top + 20} L11 ${top + 1}z" fill="#f6f4ef"/>`;
      if (S.tie) s += `<path d="M-3.5 ${top + 9} h7 l3 22 l-6.5 7 l-6.5 -7z" fill="${S.tie}"/>`;
      s += `<path d="M-13 ${top + 2} L-2 ${top + 26} M13 ${top + 2} L2 ${top + 26}" stroke="rgba(0,0,0,.18)" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case 'shirt':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      s += `<path d="M-14 ${top + 2} l14 13 l14 -13" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
      s += [0, 1, 2].map(i => `<circle cx="0" cy="${top + 24 + i * 12}" r="2" fill="rgba(0,0,0,.22)"/>`).join('');
      break;
    case 'blouse':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      s += `<path d="M-12 ${top + 1} q12 14 24 0z" fill="${S.skin}"/>`;
      break;
    case 'labcoat':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h + 6}" rx="22" fill="#fbfbf8"/>`;
      s += `<path d="M-12 ${top + 1} L0 ${top + 22} L12 ${top + 1}z" fill="${col}"/>`;
      s += `<path d="M0 ${top + 22} V${bot + 4}" stroke="rgba(0,0,0,.12)" stroke-width="2.5"/>`;
      s += `<rect x="9" y="${top + 30}" width="14" height="11" rx="2" fill="#ecebe5"/>`;
      if (S.stethoscope) s += `<path d="M-15 ${top + 3} q-6 22 10 26 M15 ${top + 3} q6 22 -8 30" stroke="#3a3f48" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="7" cy="${top + 34}" r="5" fill="#c9ced6" stroke="#3a3f48" stroke-width="2"/>`;
      break;
    case 'vest':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      s += `<path d="M${x} ${top + 18} q0 -18 18 -18 h1 v${h} h-9 q-10 0 -10 -10z M${-x} ${top + 18} q0 -18 -18 -18 h-1 v${h} h9 q10 0 10 -10z" fill="#f07a2a"/>`;
      s += `<path d="M${x} ${top + 30} h19 M${-x} ${top + 30} h-19 M${x} ${top + 42} h19 M${-x} ${top + 42} h-19" stroke="#eef2f5" stroke-width="4"/>`;
      break;
    case 'overalls':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      s += `<path d="M${x + 4} ${top + 14} h${W - 8} M${x + 2} ${top + 26} h${W - 4}" stroke="rgba(0,0,0,.18)" stroke-width="3"/><path d="M${x + 12} ${top} v${h} M${-x - 12} ${top} v${h}" stroke="rgba(0,0,0,.12)" stroke-width="3"/>`;
      s += `<path d="M-16 ${top + 22} h32 v${h - 22} h-32z" fill="${S.bottom}"/><path d="M-16 ${top + 22} L-20 ${top + 2} M16 ${top + 22} L20 ${top + 2}" stroke="${S.bottom}" stroke-width="6" stroke-linecap="round"/><circle cx="-11" cy="${top + 28}" r="2.6" fill="#e2b84a"/><circle cx="11" cy="${top + 28}" r="2.6" fill="#e2b84a"/>`;
      break;
    case 'racing':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      s += `<rect x="-9" y="${top + 2}" width="5" height="${h - 4}" fill="${S.accent}"/><rect x="4" y="${top + 2}" width="5" height="${h - 4}" fill="${S.accent}"/><circle cx="16" cy="${top + 22}" r="5" fill="#fff"/>`;
      break;
    case 'spacesuit':
      s += `<rect x="${x - 18}" y="${top + 6}" width="18" height="34" rx="6" fill="#dfe3ea"/>`;
      s += `<rect x="${x - 3}" y="${top}" width="${W + 6}" height="${h}" rx="26" fill="#f4f6fa"/>`;
      s += `<rect x="-14" y="${top + 22}" width="28" height="16" rx="4" fill="${S.accent}"/><circle cx="-7" cy="${top + 30}" r="2.6" fill="#e5484d"/><circle cx="0" cy="${top + 30}" r="2.6" fill="#f2c94c"/><circle cx="7" cy="${top + 30}" r="2.6" fill="#3ccf7a"/>`;
      s += `<rect x="${x - 3}" y="${bot - 12}" width="${W + 6}" height="8" fill="${S.accent}" opacity=".9"/>`;
      break;
    default:
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
  }
  return s + sheen(`M${x + 9} ${top + 20} q4 -12 16 -15`, 4);
}

// ---------------- Desenho por tipo ----------------
function shadowEl(st, rx = 32) {
  const lift = clamp((st.hop ?? 0) / 60);
  return `<ellipse cx="0" cy="0" rx="${n2(rx * (1 - lift * 0.4))}" ry="5" fill="${C.shadow}"/>`;
}

function walkAngles(st) {
  if (st.walk == null) return { leg: 0, swing: 0, bob: 0 };
  const s = Math.sin(st.walk);
  return { leg: 24 * s, swing: 16 * s, bob: Math.abs(Math.cos(st.walk)) * 3.2 };
}

function human(S, st, seed) {
  const W = walkAngles(st);
  const skin = S.skin, shoe = S.shoes ?? '#262a33';
  const armL = (st.armL ?? -28) + W.swing, armR = (st.armR ?? -28) - W.swing;
  const sleeve = S.outfit === 'labcoat' ? '#fbfbf8' : S.outfit === 'blouse' ? S.top : S.outfit === 'spacesuit' ? '#f4f6fa' : S.top;
  const hand = S.outfit === 'spacesuit' ? '#e9edf3' : S.outfit === 'racing' ? '#23252c' : skin;
  const HX = 0, HY = -116;
  let s = '';
  s += legs(-10.5, 10.5, -26, 20, S.outfit === 'spacesuit' ? '#e9edf3' : S.bottom, S.outfit === 'spacesuit' ? '#9aa3b5' : shoe, W.leg);
  s += torso(S);
  s += arm(-1, -24, -73, armL, st.lenL ?? 24, sleeve, hand, st.propL ? PROPS[st.propL] : null);
  // braço direito por trás da cabeça (ex.: ajeitar o cabelo); a mão é redesenhada na frente
  if (st.behindR) s += arm(1, 24, -73, armR, st.lenR ?? 24, sleeve, hand, null);
  // cabeça
  const tilt = st.headTilt ?? 0;
  let head = hairBack(S.hair, S.hairColor);
  head += `<circle cx="-27" cy="2" r="6.5" fill="${skin}"/><circle cx="27" cy="2" r="6.5" fill="${skin}"/>`;
  head += `<circle cx="0" cy="0" r="28" fill="${skin}"/>`;
  head += face(st, { cx: 0, cy: 0, ex: 10, er: 0.95, my: 11, mw: 16 }, seed);
  if (S.mustache) head += `<path d="M-1 6 q-7 -5 -13 1 q6 5 13 0z M1 6 q7 -5 13 1 q-6 5 -13 0z" fill="${S.hairColor}"/>`;
  if (S.glasses) head += `<g stroke="${S.glassesColor ?? '#2b2b36'}" stroke-width="2.4" fill="rgba(255,255,255,.12)"><circle cx="-10" cy="0" r="9.5"/><circle cx="10" cy="0" r="9.5"/></g><path d="M-0.5 -1h1" stroke="${S.glassesColor ?? '#2b2b36'}" stroke-width="2.4"/>`;
  head += hairFront(S.hair, S.hairColor, st.lock ?? 0);
  if (S.hat) head += hat(S.hat);
  if (S.outfit === 'spacesuit') head += `<circle r="38" fill="rgba(190,225,255,.22)" stroke="#ffffff" stroke-width="3.5"/><path d="M-24 -20 q8 -12 22 -14" stroke="rgba(255,255,255,.8)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M22 -30 l8 -16" stroke="#c9ced6" stroke-width="2.5"/><circle cx="31" cy="-48" r="4.5" fill="#ff5a5a"/>`;
  s += `<g transform="translate(${HX} ${HY}) rotate(${n2(tilt)})">${head}</g>`;
  if (st.behindR) {
    const a = (-armR * Math.PI) / 180, L = st.lenR ?? 24;
    s += `<circle cx="${n2(24 + Math.cos(a) * L)}" cy="${n2(-73 + Math.sin(a) * L)}" r="6.6" fill="${hand}"/>`;
  } else s += arm(1, 24, -73, armR, st.lenR ?? 24, sleeve, hand, st.propR ? PROPS[st.propR] : null);
  if (st.front) s += PROPS[st.front](0, -40);
  return { body: s, bob: W.bob, rx: 32 };
}

function modulo(S, st, seed) {
  const W = walkAngles(st);
  const armL = (st.armL ?? -20) + W.swing, armR = (st.armR ?? -20) - W.swing;
  let s = legs(-14, 14, -28, 20, S.bottom, '#1c2433', W.leg);
  s += `<rect x="-14" y="-122" width="28" height="12" rx="4" fill="#7fc0ff"/><rect x="-8" y="-128" width="4" height="8" rx="1.5" fill="#cfe6ff"/><rect x="4" y="-128" width="4" height="8" rx="1.5" fill="#cfe6ff"/>`;
  s += `<rect x="-42" y="-114" width="84" height="88" rx="26" fill="${C.blue2}"/>`;
  s += `<rect x="-42" y="-114" width="84" height="70" rx="26" fill="${S.top}"/>`;
  s += sheen('M-30 -92 q6 -14 22 -16');
  s += `<rect x="-29" y="-101" width="58" height="38" rx="16" fill="#f7fbff"/>`;
  s += face(st, { cx: 0, cy: -84, ex: 11, er: 1, my: -73, mw: 17 }, seed);
  if (S.tie) s += `<path d="M-4 -58 h8 l3 18 l-7 7 l-7 -7z" fill="${S.tie}"/>`;
  s += arm(-1, -38, -66, armL, st.lenL ?? 24, C.blue2, '#f2b84b', st.propL ? PROPS[st.propL] : null);
  s += arm(1, 38, -66, armR, st.lenR ?? 24, C.blue2, '#f2b84b', st.propR ? PROPS[st.propR] : null);
  if (st.front) s += PROPS[st.front](0, -36);
  return { body: s, bob: W.bob, rx: 38 };
}

function cronos(S, st, seed) {
  const W = walkAngles(st);
  const armL = (st.armL ?? -28) + W.swing, armR = (st.armR ?? -28) - W.swing;
  let s = legs(-10.5, 10.5, -26, 20, S.bottom, '#151a26', W.leg);
  s += torso({ ...S, outfit: 'suit' }, 58);
  s += arm(-1, -23, -73, armL, st.lenL ?? 24, S.top, S.skin, st.propL ? PROPS[st.propL] : null);
  let head = '';
  // cronômetro
  head += `<rect x="-5" y="-44" width="10" height="12" rx="3" fill="${C.navy}"/><rect x="-10" y="-49" width="20" height="7" rx="3.5" fill="#d8a93b"/>`;
  head += `<g transform="rotate(45)"><rect x="-4" y="-41" width="8" height="9" rx="2.5" fill="${C.navy}"/></g>`;
  head += `<circle r="31" fill="#fffdf6" stroke="${C.navy}" stroke-width="6"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, r1 = i % 3 === 0 ? 20 : 23;
    head += `<path d="M${n2(Math.sin(a) * r1)} ${n2(-Math.cos(a) * r1)} L${n2(Math.sin(a) * 25.5)} ${n2(-Math.cos(a) * 25.5)}" stroke="${C.navy}" stroke-width="${i % 3 === 0 ? 2.6 : 1.6}" stroke-linecap="round" opacity=".55"/>`;
  }
  head += face(st, { cx: 0, cy: -4, ex: 9.5, er: 0.86, my: 12, mw: 12, ink: C.navy }, seed);
  // bigode de ponteiros
  head += `<path d="M0 5 q-7 -2 -12 3 q-2 2 0 3 M0 5 q7 -2 12 3 q2 2 0 3" stroke="${C.navy}" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="0" cy="5" r="2.6" fill="#d8a93b"/>`;
  head += `<g stroke="#d8a93b" stroke-width="2.2" fill="rgba(255,255,255,.1)"><circle cx="-9.5" cy="-4" r="8"/><circle cx="9.5" cy="-4" r="8"/></g>`;
  s += `<g transform="translate(0 -118) rotate(${n2(st.headTilt ?? 0)})">${head}</g>`;
  s += arm(1, 23, -73, armR, st.lenR ?? 24, S.top, S.skin, st.propR ? PROPS[st.propR] : null);
  if (st.front) s += PROPS[st.front](0, -40);
  return { body: s, bob: W.bob, rx: 32 };
}

function frasco(S, st, seed) {
  const W = walkAngles(st);
  const t = st.t ?? 0;
  const armL = (st.armL ?? -24) + W.swing, armR = (st.armR ?? -24) - W.swing;
  let s = legs(-14, 14, -28, 22, S.bottom, '#262a33', W.leg);
  s += arm(-1, -30, -58, armL, st.lenL ?? 22, '#e6f6ff', S.skin, st.propL ? PROPS[st.propL] : null);
  s += arm(1, 30, -58, armR, st.lenR ?? 22, '#e6f6ff', S.skin, st.propR ? PROPS[st.propR] : null);
  const flask = 'M-10 -150 L10 -150 L10 -118 L43 -38 Q47 -26 35 -26 L-35 -26 Q-47 -26 -43 -38 L-10 -118 Z';
  s += `<path d="${flask}" fill="#eef8ff" stroke="#9cc9e6" stroke-width="3" stroke-linejoin="round"/>`;
  const w = Math.sin(t * 3 + seed) * 3;
  const liq = `M-25 -84 Q-12 ${n2(-90 + w)} 0 -84 T25 -84 L39 -40 Q42 -31 33 -31 L-33 -31 Q-42 -31 -39 -40 Z`;
  s += `<path d="${liq}" fill="${S.top}"/>`;
  for (let i = 0; i < 4; i++) {
    const u = (t * 0.6 + i * 0.27 + seed * 0.01) % 1;
    s += `<circle cx="${n2(-14 + i * 9 + Math.sin(t * 3 + i) * 2)}" cy="${n2(-36 - u * 44)}" r="${n2(2.6 - u)}" fill="rgba(255,255,255,.55)"/>`;
  }
  s += sheen('M-30 -46 L-12 -100', 4);
  s += face(st, { cx: 0, cy: -62, ex: 11, er: 1, my: -50, mw: 16 }, seed);
  s += `<rect x="-12" y="-161" width="24" height="13" rx="3.5" fill="#b07b4a"/>`;
  // óculos de proteção e cabelo
  s += [[-15, -146, 7.5], [-19, -136, 6.5], [15, -146, 7.5], [19, -136, 6.5], [-11, -154, 6], [11, -154, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${S.hairColor}"/>`).join('');
  s += `<rect x="-16" y="-136" width="32" height="7" rx="3" fill="#3b3f46"/><circle cx="-8" cy="-132.5" r="6.5" fill="#f2a93b" stroke="#3b3f46" stroke-width="2.4"/><circle cx="8" cy="-132.5" r="6.5" fill="#f2a93b" stroke="#3b3f46" stroke-width="2.4"/>`;
  if (st.front) s += PROPS[st.front](0, -36);
  return { body: s, bob: W.bob, rx: 40 };
}

function acelerado(S, st, seed) {
  const W = walkAngles(st);
  const armL = (st.armL ?? -28) + W.swing, armR = (st.armR ?? -28) - W.swing;
  let s = legs(-10.5, 10.5, -26, 20, S.bottom, '#23252c', W.leg);
  s += torso(S);
  s += arm(-1, -24, -73, armL, st.lenL ?? 24, S.top, '#23252c', st.propL ? PROPS[st.propL] : null);
  let head = `<circle r="32" fill="${S.top}"/><rect x="-6" y="-32" width="12" height="20" rx="3" fill="${S.accent}"/><path d="M26 -6 q8 4 10 14 l-8 -2z" fill="${S.accent}"/>`;
  head += `<rect x="-23" y="-14" width="46" height="31" rx="13" fill="${S.skin}"/>`;
  head += face(st, { cx: 0, cy: -1, ex: 9.5, er: 0.86, my: 9, mw: 13 }, seed);
  head += `<path d="M-25 -14 q25 -14 50 0 v-6 q-25 -12 -50 0z" fill="#101418"/>` + sheen('M-20 -20 q10 -12 24 -12', 4);
  s += `<g transform="translate(0 -116) rotate(${n2(st.headTilt ?? 0)})">${head}</g>`;
  s += arm(1, 24, -73, armR, st.lenR ?? 24, S.top, '#23252c', st.propR ? PROPS[st.propR] : null);
  if (st.front) s += PROPS[st.front](0, -40);
  return { body: s, bob: W.bob, rx: 32 };
}

const KIND = { modulo, cronos, frasco, acelerado };
const ALL = { ...ELENCO, ...EMPRESAS };

// Desenha um personagem pelo id (chaves de ELENCO e EMPRESAS).
export function drawChar(id, st = {}) {
  const S = ALL[id];
  if (!S) throw new Error('personagem desconhecido: ' + id);
  const seed = hash(id) % 1000;
  const fn = KIND[id] ?? human;
  const r = fn(S, st, seed);
  const s = (st.s ?? ASC) * (S.scale ?? 1);
  const dir = st.dir ?? 1;
  const bob = (st.bob ?? 0) + r.bob + (st.hop ?? 0);
  let extra = '';
  if (st.sweat) extra += `<path d="M34 -150 q6 10 0 14 q-6 -4 0 -14z" fill="#8fd3ff" opacity="${n2(st.sweat)}"/>`;
  if (st.ting != null && st.ting >= 0 && st.ting < 0.8) {
    const k = st.ting / 0.8, sz = 10 + 16 * Math.sin(k * Math.PI);
    extra += `<g transform="translate(26 -148) rotate(${n2(k * 90)})" opacity="${n2(1 - k * k)}"><path d="M0 ${-sz} L${sz * 0.22} ${-sz * 0.22} L${sz} 0 L${sz * 0.22} ${sz * 0.22} L0 ${sz} L${-sz * 0.22} ${sz * 0.22} L${-sz} 0 L${-sz * 0.22} ${-sz * 0.22}z" fill="#ffd84a"/></g>`;
  }
  if (st.alarm) extra += `<g opacity="${n2(st.alarm)}"><path d="M-4 -186 l-4 -26 h16 l-4 26z M0 -178 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" fill="${C.red}"/></g>`;
  const inner = shadowEl(st, r.rx) + `<g transform="translate(0 ${n2(-bob)})">${r.body}${extra}</g>`;
  const br = st.walk == null && !st.hop ? Math.sin((st.t ?? 0) * 1.9 + seed) * 0.012 : 0;
  const body = g(tr(st.x ?? 0, st.y ?? 0, s, st.lean ?? 0, (st.sx ?? 1) * (1 - br * 0.5) * dir, (st.sy ?? 1) * (1 + br)), inner);
  return op(st.alpha ?? 1, body);
}

// Altura aproximada (para posicionar etiquetas e balões).
export function charHeight(id, s) {
  const S = ALL[id];
  return 165 * (s ?? ASC) * (S?.scale ?? 1);
}
