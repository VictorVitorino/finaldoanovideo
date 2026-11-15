// Base visual do vídeo "Além do raso" (página inicial do blog Change Management World), 1920 x 1080 (16:9).
// Paleta do site: dois azuis e um cinza, com os tons de gelo. Títulos em Newsreader, textos em Inter.
// Tudo é função pura do tempo: nada de estado nem de Math.random().
import { clamp, lerp, inv, ease, kf, n2, esc, measure, rng, hash, noise, TAU } from '../core.js';

export { clamp, lerp, inv, ease, kf, n2, esc, measure, rng, hash, noise, TAU };
const f = n2;

export const W = 1920, H = 1080;
export const C = {
  noite: '#071A4A', fundo: '#04102E', navy: '#0A2463', navy2: '#123A96', navy3: '#1E50C0', azul: '#2F6FED', suave: '#9DBDFF',
  claro: '#EAF1FE', gelo: '#F4F8FF', branco: '#FFFFFF', cinza: '#667085', cinzaClaro: '#F3F5F8', linha: '#E0E5EC', tinta: '#0B1530',
  gelo2: '#C9DBFF', gelo3: '#6F9BF5',
};
export const FONTE = { N: 'Newsreader', I: 'Inter' };

// ---------- cor ----------
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
// mistura duas cores em hexadecimal (u de 0 a 1)
export function mix(a, b, u) {
  const A = hex(a), B = hex(b), k = clamp(u);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
}

// ---------- texto ----------
// o: { f: 'N' (serifada, títulos) | 'I' (textos), w (peso), s (tamanho), c (cor), a (anchor), ls, o (opacidade), it (itálico) }
export function txt(str, x, y, o = {}) {
  const fk = o.f ?? 'I', w = o.w ?? (fk === 'N' ? 400 : 500);
  return `<text x="${f(x)}" y="${f(y)}" font-family="'${FONTE[fk]}'" font-weight="${w}" font-size="${o.s ?? 28}"${o.it ? ' font-style="italic"' : ''} fill="${o.c ?? C.branco}" text-anchor="${o.a ?? 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.o != null ? ` opacity="${f(o.o)}"` : ''}>${esc(str)}</text>`;
}
export const larg = (str, s, o = {}) => {
  const fk = o.f ?? 'I';
  return measure(str, `${o.it ? 'italic ' : ''}${o.w ?? (fk === 'N' ? 400 : 500)} ${s}px "${FONTE[fk]}"`) + (o.ls ? o.ls * str.length : 0);
};
// texto com trechos *em itálico* (o destaque da marca: "além do raso"); o.hi = cor do trecho
export function tRico(str, x, y, o = {}) {
  const fk = o.f ?? 'N', w = o.w ?? (fk === 'N' ? 400 : 500);
  let sp = '';
  for (const p of str.split(/(\*[^*]+\*)/).filter(Boolean)) {
    const hi = p.startsWith('*');
    sp += `<tspan${hi ? ` font-style="italic"${o.hi ? ` fill="${o.hi}"` : ''}` : ''}>${esc(hi ? p.slice(1, -1) : p)}</tspan>`;
  }
  return `<text x="${f(x)}" y="${f(y)}" font-family="'${FONTE[fk]}'" font-weight="${w}" font-size="${o.s ?? 28}" fill="${o.c ?? C.branco}" text-anchor="${o.a ?? 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${sp}</text>`;
}
// rótulo em caixa alta, espaçado (olho de seção)
export const olho = (str, x, y, o = {}) => txt(str.toUpperCase(), x, y, { w: 600, s: o.s ?? 20, ls: o.ls ?? 3.2, c: o.c ?? C.suave, a: o.a, o: o.o });

// ---------- tempo e movimento ----------
export const fin = (t, a, d = 0.4) => ease.out(inv(a, a + d, t));               // 0 -> 1 suave a partir de a
export const fout = (t, a, d = 0.35) => 1 - ease.inOut(inv(a, a + d, t));        // 1 -> 0 suave a partir de a
export const janela = (t, a, b, r = 0.35) => Math.min(fin(t, a, r), fout(t, b - r, r));
export const back = (t, a, d = 0.5) => ease.back(inv(a, a + d, t));              // 0 -> 1 com passagem
export const elast = (t, a, d = 0.9) => ease.elastic(inv(a, a + d, t));
export const opa = (o, body) => (o >= 0.999 ? body : o <= 0.001 ? '' : `<g opacity="${f(o)}">${body}</g>`);
export const mover = (x, y, body, r = 0, s = 1) => `<g transform="translate(${f(x)} ${f(y)})${r ? ` rotate(${f(r)})` : ''}${s !== 1 ? ` scale(${f(s)})` : ''}">${body}</g>`;
export const escala = (k, x, y, body) => (k <= 0.001 ? '' : `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)}) translate(${f(-x)} ${f(-y)})">${body}</g>`);
export const sobe = (k, body, d = 26) => (k <= 0.001 ? '' : `<g opacity="${f(clamp(k))}" transform="translate(0 ${f((1 - k) * d)})">${body}</g>`);
export const desliza = (k, body, dx = -40) => (k <= 0.001 ? '' : `<g opacity="${f(clamp(k))}" transform="translate(${f((1 - k) * dx)} 0)">${body}</g>`);
// traço que se desenha: d = path, u = 0..1
export function tracar(d, u, o = {}) {
  if (u <= 0) return '';
  const dash = u >= 1 ? '' : ` pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - u)}"`;
  return `<path d="${d}" fill="${o.fill ?? 'none'}" stroke="${o.c ?? C.branco}" stroke-width="${o.sw ?? 3}" stroke-linecap="${o.cap ?? 'round'}" stroke-linejoin="round"${dash}${o.o != null ? ` opacity="${f(o.o)}"` : ''}${o.extra ? ' ' + o.extra : ''}/>`;
}
// anel que cresce e some (idade em s)
export function anel(x, y, idade, o = {}) {
  const d = o.d ?? 1.2, u = idade / d;
  if (u <= 0 || u >= 1) return '';
  const r = (o.r0 ?? 8) + (o.r1 ?? 120) * ease.out(u);
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="none" stroke="${o.c ?? C.suave}" stroke-width="${f((o.sw ?? 3) * (1 - u) + 0.6)}" opacity="${f((o.o ?? 0.8) * (1 - u))}"/>`;
}
export const poli = (pts, o = {}) => `<polygon points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${o.fill ?? C.gelo}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1}" stroke-linejoin="round"` : ''}${o.o != null ? ` opacity="${f(o.o)}"` : ''}/>`;
export const caminho = pts => 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L');

// ---------- ícones de traço (grade 48 x 48) ----------
const IC = {
  check: ['M9 25l10 10L39 14'],
  pontos: ['!M24 7a6.500 6.500 0 1 0 0 13 6.500 6.500 0 0 0 0-13Z', '!M11.500 27a6.500 6.500 0 1 0 0 13 6.500 6.500 0 0 0 0-13Z', '!M36.500 27a6.500 6.500 0 1 0 0 13 6.500 6.500 0 0 0 0-13Z'],
  troca: ['M8 16h28', 'M28 8l8 8-8 8', 'M40 32H12', 'M20 24l-8 8 8 8'],
  alvo: ['M24 5a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z', 'M24 13a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z', '!M24 21a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  megafone: ['M6 19v10h7l14 9V10L13 19z', 'M33 17a9 9 0 0 1 0 14', 'M38 11a16 16 0 0 1 0 26'],
  grafico: ['M6 6v36h36', 'M14 32l8-9 7 6 11-14'],
  lampada: ['M24 5a13 13 0 0 0-8 23.200c1.500 1.200 2.400 3 2.400 4.800h11.200c0-1.800.9-3.600 2.400-4.800A13 13 0 0 0 24 5Z', 'M19 39h10', 'M21 44h6'],
  coracao: ['M24 41S7 31 7 18.500A9.500 9.500 0 0 1 24 13a9.500 9.500 0 0 1 17 5.500C41 31 24 41 24 41Z'],
  escudo: ['M24 5 8 11v11c0 10 6.700 17.400 16 20 9.300-2.600 16-10 16-20V11z'],
  ciclo: ['M8 24a16 16 0 0 1 27.500-11L41 18', 'M41 8v10H31', 'M40 24a16 16 0 0 1-27.500 11L7 30', 'M7 40V30h10'],
};
// ícone `nome` centrado em (cx, cy) com lado `tam`. o: { c, sw, u (0..1, quanto já foi desenhado) }
export function icone(nome, cx, cy, tam, o = {}) {
  const ps = IC[nome] ?? IC.alvo, u = o.u ?? 1;
  if (u <= 0) return '';
  const k = tam / 48, sw = (o.sw ?? 3) / k, cor = o.c ?? C.branco, n = ps.length;
  let s = '';
  ps.forEach((d, i) => {
    const ui = clamp((u * (n + 1.2) - i * 0.9) / 2.1);
    if (ui <= 0) return;
    if (d[0] === '!') { s += `<path d="${d.slice(1)}" fill="${cor}" opacity="${f(ui)}"/>`; return; }
    const dash = ui >= 1 ? '' : ` pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - ease.inOut(ui))}"`;
    s += `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${f(sw)}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`;
  });
  return `<g transform="translate(${f(cx - tam / 2)} ${f(cy - tam / 2)}) scale(${f(k)})">${s}</g>`;
}

// ---------- marca do blog: o iceberg dentro do círculo ----------
export function marca(x, y, r = 22) {
  const k = r / 24;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})"><circle r="24" fill="${C.navy2}"/><path d="M-24 2a24 24 0 0 0 48 0z" fill="${C.azul}"/>`
    + `<path d="M-9 2l9-17 8 17z" fill="${C.branco}"/><path d="M-12 4h24l-4 10-8 6-9-7z" fill="${C.suave}" opacity=".9"/><path d="M-24 2c6-3 10 3 16 0s10 3 16 0 10 3 16 0" fill="none" stroke="${C.branco}" stroke-width="1.6"/></g>`;
}
