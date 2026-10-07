// Utilitários: easing, keyframes, aleatório determinístico e ajudantes de SVG.
// Toda a animação é função pura do tempo: render(t) desenha o quadro t do zero.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const TAU = Math.PI * 2;

export const ease = {
  linear: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  bounce: t => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
};

export const seg = (t, a, b, e = ease.inOut) => e(inv(a, b, t));
// 0 → 1 em [a, a+r], 1 → 0 em [b-r, b]
export const win = (t, a, b, r = 0.2) => Math.min(inv(a, a + r, t), 1 - inv(b - r, b, t));
// pulso que sobe e desce dentro de [a, a+d]
export const bump = (t, a, d) => { const u = inv(a, a + d, t); return Math.sin(u * Math.PI); };

export function kf(t, keys, e = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, va] = keys[i], [tb, vb] = keys[i + 1];
    if (t <= tb) {
      const ee = keys[i + 1][2] ?? e;
      const u = ee(inv(ta, tb, t));
      if (Array.isArray(va)) return va.map((v, j) => lerp(v, vb[j], u));
      return lerp(va, vb, u);
    }
  }
  return keys[keys.length - 1][1];
}

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const noise = (t, s = 0) => Math.sin(t * 1.7 + s * 3.1) * 0.5 + Math.sin(t * 2.9 + s * 1.3) * 0.3 + Math.sin(t * 5.3 + s * 7.7) * 0.2;

// ---------- SVG ----------
const f = n => (Math.abs(n) < 1e-4 ? 0 : +n.toFixed(2));
export const n2 = f;

export function tr(x = 0, y = 0, s = 1, r = 0, sx = 1, sy = 1) {
  let out = `translate(${f(x)} ${f(y)})`;
  if (r) out += ` rotate(${f(r)})`;
  if (s !== 1 || sx !== 1 || sy !== 1) out += ` scale(${f(s * sx)} ${f(s * sy)})`;
  return out;
}

export const g = (transform, body, extra = '') => `<g${transform ? ` transform="${transform}"` : ''}${extra ? ' ' + extra : ''}>${body}</g>`;
export const op = (o, body) => (o >= 0.999 ? body : o <= 0.001 ? '' : `<g opacity="${f(o)}">${body}</g>`);

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Medição de texto (fontes já carregadas).
const mc = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
export function measure(text, font) {
  mc.font = font;
  return mc.measureText(text).width;
}

export function wrap(text, font, maxW) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (measure(test.replace(/\*/g, ''), font) > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Texto com palavras destacadas entre *asteriscos*.
export function richText(line, x, y, o) {
  const parts = line.split(/(\*[^*]+\*)/).filter(Boolean);
  let spans = '';
  for (const p of parts) {
    const hi = p.startsWith('*');
    spans += `<tspan${hi ? ` fill="${o.hi}"` : ''}>${esc(hi ? p.slice(1, -1) : p)}</tspan>`;
  }
  return `<text x="${f(x)}" y="${f(y)}" font-family="${o.family}" font-weight="${o.weight}" font-size="${o.size}" fill="${o.fill}" text-anchor="${o.anchor ?? 'middle'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${spans}</text>`;
}

export function text(str, x, y, o = {}) {
  return `<text x="${f(x)}" y="${f(y)}" font-family="${o.family ?? 'Outfit'}" font-weight="${o.weight ?? 800}" font-size="${o.size ?? 40}" fill="${o.fill ?? '#2b2b36'}" text-anchor="${o.anchor ?? 'middle'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.extra ? ' ' + o.extra : ''}>${esc(str)}</text>`;
}

// Paleta do vídeo.
export const C = {
  bg: '#f4ecdf', bg2: '#ebdfca', ink: '#2b2b36', soft: '#6b6f7e', paper: '#fcf8ee', paper2: '#f3ecdc',
  blue: '#0b5ed7', blue2: '#0a3f91', sky: '#4aa3ff', navy: '#0c2f57', navy2: '#16457c',
  amber: '#e08a12', gold: '#f2b84b', green: '#1f9d57', green2: '#14a04f', red: '#e5484d', cyan: '#17b2cd',
  purple: '#7c3aed', pink: '#ef7a8a', orange: '#f07a2a', shadow: 'rgba(43,30,10,.16)',
};
