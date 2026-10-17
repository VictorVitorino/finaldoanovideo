// Base visual do filme azul (v19): paleta, fundo, cartões de vidro, pílulas, personagens, chrome e legenda.
// Tudo é SVG 1920x1080 gerado a partir do tempo t (s). As imagens entram como data: URL (carregar()).
import { clamp, lerp, inv, ease, kf, rng, n2, tr, g, op, esc, measure, TAU } from '../core.js';
import { dataUrl } from '../assets.js';

export const F = n2;
export const W = 1920, H = 1080;
export const COR = {
  fundo0: '#0a1630', fundo1: '#153566', azul: '#3b82f6', azulClaro: '#6cc4ff', ciano: '#5ec8ff', ouro: '#e6b75e', ouro2: '#f2c66d',
  laranja: '#f08a2c', branco: '#ffffff', texto: '#e8eefb', claro: '#d6e2f7', suave: 'rgba(214,226,247,.62)', mudo: '#9fb3d6',
  vidro: 'rgba(16,38,80,.55)', borda: 'rgba(255,255,255,.15)', verde: '#43d1a9', verde2: '#3ccf6e', vermelho: '#ff5d6c', navy: '#0b1a38',
};
export const IMG = {}, PROP = {}, META = {};
export let J = null;

export async function carregar(nomesImg) {
  Object.assign(META, await (await fetch('build/azul/img/meta.json')).json());
  J = await (await fetch('build/azul/v19.json')).json();
  const base = ['totvs_boy', 'am_boy', 'antonialli_lider', 'vinicius', 'alvarez-marsal-branco', 'totvs-branco', ...(nomesImg ?? [])];
  const rostos = Object.keys(META).filter(k => META[k].nome && !k.endsWith('_rosto') && ['bruno', 'giovanna', 'antonialli', 'jaqueline', 'jose', 'joao', 'massao', 'mancini', 'monica', 'nara', 'pedro', 'thauany', 'vinicius', 'victor'].includes(k)).map(k => k + '_rosto');
  await Promise.all([...new Set([...base, ...rostos])].map(async n => { try { IMG[n] = await dataUrl(`build/azul/img/${n}.png`); } catch (e) { console.warn(String(e)); } }));
  for (const n of ['unimed', 'funed', 'caoa', 'john-deere', 'hughes', 'libercon', 'alvarez-marsal', 'totvs']) IMG['logo-' + n] = await dataUrl(`assets/logos/${n}.png`);
  const tam = await Promise.all(Object.keys(IMG).map(k => new Promise(ok => { const im = new Image(); im.onload = () => ok([k, im.naturalWidth, im.naturalHeight]); im.onerror = () => ok([k, 1, 1]); im.src = IMG[k]; })));
  for (const [k, w, h] of tam) PROP[k] = { w, h, r: w / h };
  return J;
}

// ------------------------------------------------------------------ texto e primitivas
export const T = (s, x, y, size, o = {}) => `<text x="${F(x)}" y="${F(y)}" font-family="${o.fam ?? 'Outfit'}" font-weight="${o.w ?? 700}" font-size="${size}" fill="${o.fill ?? COR.texto}" text-anchor="${o.anchor ?? 'middle'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.op != null ? ` opacity="${F(o.op)}"` : ''}${o.extra ? ' ' + o.extra : ''}>${esc(s)}</text>`;
export const OS = { fam: 'Open Sans', w: 600 };
export const larg = (s, size, w = 700, fam = 'Outfit') => measure(s, `${w} ${size}px ${fam === 'Outfit' ? 'Outfit' : fam === 'os' || fam === 'Open Sans' ? '"Open Sans"' : '"DM Sans"'}`);
export const imagem = (id, x, y, w, h, extra = '') => IMG[id] ? `<image href="${IMG[id]}" x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" preserveAspectRatio="xMidYMid meet"${extra ? ' ' + extra : ''}/>` : '';
export function logoImg(id, cx, cy, h, maxW = 1e9, extra = '') {
  const r = PROP[id]?.r ?? 3; let w = h * r, hh = h;
  if (w > maxW) { w = maxW; hh = w / r; }
  return imagem(id, cx - w / 2, cy - hh / 2, w, hh, extra);
}
// logo colorido numa pílula branca (como no v18)
export function logoPilula(id, cx, cy, w, h, k = 1) {
  return g(`translate(${F(cx)} ${F(cy)}) scale(${F(k)})`, `<rect x="${F(-w / 2)}" y="${F(-h / 2)}" width="${F(w)}" height="${F(h)}" rx="${F(Math.min(10, h / 3))}" fill="#fff"/>` + logoImg(id, 0, 0, h * 0.64, w * 0.82));
}
export const entra = (L, a, d = 0.5) => ease.back(inv(a, a + d, L));
export const sobe = (L, a, d = 0.5) => ease.out(inv(a, a + d, L));
export const quebra = (texto, size, fam, maxW, w = 600) => {   // quebra de linha simples por largura
  const out = []; let lin = '';
  for (const p of texto.split(' ')) { const t = lin ? lin + ' ' + p : p; if (larg(t, size, w, fam) > maxW && lin) { out.push(lin); lin = p; } else lin = t; }
  if (lin) out.push(lin); return out;
};

// ------------------------------------------------------------------ fundo
const sorteio = rng(7);
const BOKEH = Array.from({ length: 30 }, () => ({ x: sorteio() * W, y: sorteio() * H, r: 40 + sorteio() * 130, a: 0.025 + sorteio() * 0.06, v: 3 + sorteio() * 9, f: sorteio() * TAU }));
const ESTRELAS = Array.from({ length: 110 }, () => ({ x: sorteio() * W, y: sorteio() * H * 0.85, r: 0.6 + sorteio() * 1.5, f: sorteio() * TAU, q: sorteio() }));

export function defs() {
  return `<radialGradient id="azFundo" cx="50%" cy="30%" r="85%"><stop offset="0" stop-color="${COR.fundo1}"/><stop offset=".55" stop-color="#0e254f"/><stop offset="1" stop-color="${COR.fundo0}"/></radialGradient>`
    + `<radialGradient id="azVinheta" cx="50%" cy="50%" r="72%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>`
    + `<radialGradient id="azLuz" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="#bfe0ff" stop-opacity=".35"/><stop offset="1" stop-color="#7fb8ff" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="azLuzOuro" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".95"/><stop offset=".4" stop-color="${COR.ouro}" stop-opacity=".35"/><stop offset="1" stop-color="${COR.ouro}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="azSpot" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cfe4ff" stop-opacity=".30"/><stop offset=".55" stop-color="#7fb0ff" stop-opacity=".10"/><stop offset="1" stop-color="#7fb0ff" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="azLua" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe2a6"/><stop offset=".25" stop-color="#ffcf7a" stop-opacity=".85"/><stop offset=".6" stop-color="#f2a64a" stop-opacity=".18"/><stop offset="1" stop-color="#f2a64a" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="azTopo" cx="50%" cy="0%" r="60%"><stop offset="0" stop-color="#9cc8ff" stop-opacity=".16"/><stop offset="1" stop-color="#9cc8ff" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="azCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".10"/><stop offset="1" stop-color="#ffffff" stop-opacity=".03"/></linearGradient>`
    + `<linearGradient id="azBarra" x1="0" x2="1"><stop offset="0" stop-color="${COR.azul}"/><stop offset="1" stop-color="${COR.ouro}"/></linearGradient>`
    + `<linearGradient id="azFeixe" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6d8" stop-opacity=".7"/><stop offset=".5" stop-color="#cfe2ff" stop-opacity=".2"/><stop offset="1" stop-color="#cfe2ff" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="azEnergiaA" x1="0" x2="1"><stop offset="0" stop-color="${COR.azul}" stop-opacity="0"/><stop offset=".6" stop-color="${COR.azulClaro}"/><stop offset="1" stop-color="#fff"/></linearGradient>`
    + `<linearGradient id="azEnergiaB" x1="1" x2="0"><stop offset="0" stop-color="${COR.laranja}" stop-opacity="0"/><stop offset=".6" stop-color="#ffb36b"/><stop offset="1" stop-color="#fff"/></linearGradient>`
    + `<linearGradient id="azOuroV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d389"/><stop offset="1" stop-color="#d9a441"/></linearGradient>`
    + `<linearGradient id="azAzulV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4ff"/><stop offset="1" stop-color="#2f6fe0"/></linearGradient>`
    + `<filter id="azBrilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>`
    + `<filter id="azBrilhoP" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>`
    + `<filter id="azBrilhoG" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="26"/></filter>`
    + `<filter id="azPessoa" x="-10%" y="-10%" width="120%" height="125%" color-interpolation-filters="sRGB">`
    + `<feComponentTransfer><feFuncR type="linear" slope="1.06" intercept="0.01"/><feFuncG type="linear" slope="1.06" intercept="0.01"/><feFuncB type="linear" slope="1.05" intercept="0.008"/></feComponentTransfer>`
    + `<feColorMatrix type="saturate" values="1.05" result="p"/><feGaussianBlur in="SourceAlpha" stdDeviation="16" result="b"/><feOffset dx="0" dy="16" result="o"/>`
    + `<feComponentTransfer in="o" result="s"><feFuncA type="linear" slope=".5"/></feComponentTransfer><feMerge><feMergeNode in="s"/><feMergeNode in="p"/></feMerge></filter>`;
}

export function fundo(t, o = {}) {
  let s = `<rect width="${W}" height="${H}" fill="url(#azFundo)"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#azTopo)"/>`;
  for (const b of BOKEH) {
    const x = (b.x + t * b.v) % (W + 260) - 130, y = b.y + Math.sin(t * 0.25 + b.f) * 14;
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(b.r)}" fill="#8fb8ff" opacity="${F(b.a * (o.bokeh ?? 1))}"/>`;
  }
  for (const e of ESTRELAS) s += `<circle cx="${F(e.x)}" cy="${F(e.y)}" r="${F(e.r)}" fill="#dbe8ff" opacity="${F((0.2 + 0.4 * (0.5 + 0.5 * Math.sin(t * (1 + e.q) + e.f))) * (o.estrelas ?? 1))}"/>`;
  return s;
}
export const vinheta = (k = 1) => `<rect width="${W}" height="${H}" fill="url(#azVinheta)" opacity="${F(k)}"/>`;

// cidade à noite em silhueta, janelas que acendem
const PREDIOS = (() => {
  const r = rng(21), out = [];
  for (let x = -20; x < W + 40;) {
    const w = 60 + r() * 90, h = 110 + r() * 240 * (0.6 + 0.4 * Math.sin(x / 300)) + (r() < 0.12 ? 170 : 0);
    const jan = [];
    for (let yy = 18; yy < h - 18; yy += 22) for (let xx = 10; xx < w - 14; xx += 18) if (r() < 0.36) jan.push([xx, yy, r() * TAU, r()]);
    out.push({ x, w, h, jan, tom: r() }); x += w + 4 + r() * 10;
  }
  return out;
})();
export function cidade(t, base = 1000, o = {}) {
  let s = '';
  const k = o.k ?? 1;
  for (const p of PREDIOS) {
    const y = base - p.h * k;
    s += `<rect x="${F(p.x)}" y="${F(y)}" width="${F(p.w)}" height="${F(p.h * k + 200)}" fill="${p.tom < 0.5 ? '#0d2246' : '#102a56'}"/>`;
    for (const [xx, yy, f, q] of p.jan) {
      if (yy > p.h * k - 10) continue;
      const liga = o.acende != null ? clamp((o.acende - Math.abs(p.x + xx - (o.foco ?? 960)) / 900) * 3) : 1;
      s += `<rect x="${F(p.x + xx)}" y="${F(y + yy)}" width="7" height="9" fill="${q > 0.82 ? '#ffd27a' : '#f7c76a'}" opacity="${F(clamp((0.45 + 0.4 * Math.sin(t * (0.6 + q) + f)) * liga))}"/>`;
    }
  }
  return s + `<rect x="0" y="${F(base)}" width="${W}" height="${F(H - base)}" fill="#091a37"/>`;
}

// ------------------------------------------------------------------ componentes
export function vidro(x, y, w, h, o = {}) {
  const r = o.r ?? 18;
  let s = '';
  if (o.brilho) s += `<rect x="${F(x - 8)}" y="${F(y - 8)}" width="${F(w + 16)}" height="${F(h + 16)}" rx="${r + 8}" fill="${o.corBrilho ?? COR.ciano}" opacity="${F(0.32 * o.brilho)}" filter="url(#azBrilho)"/>`;
  s += `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" rx="${r}" fill="${o.fill ?? COR.vidro}"/>`;
  s += `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" rx="${r}" fill="url(#azCard)" stroke="${o.borda ?? COR.borda}" stroke-width="${o.bw ?? 1.5}"/>`;
  return s;
}
export function pilula(texto, cx, cy, o = {}) {
  const size = o.size ?? 22, fam = o.fam ?? 'Outfit', wgt = o.w ?? 800;
  const w = larg(texto, size, wgt, fam) + (o.padX ?? 26) * 2 + (o.ls ? texto.length * o.ls : 0) + (o.icone ? size * 1.3 : 0), h = o.h ?? size + 22;
  const x0 = cx - w / 2;
  let s = `<rect x="${F(x0)}" y="${F(cy - h / 2)}" width="${F(w)}" height="${F(h)}" rx="${F(h / 2)}" fill="${o.fill ?? COR.azul}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1.5}"` : ''}/>`;
  if (o.icone) s += g(`translate(${F(x0 + (o.padX ?? 26) + size * 0.5)} ${F(cy)})`, o.icone);
  s += T(texto, cx + (o.icone ? size * 0.65 : 0), cy + size * 0.36, size, { w: wgt, fam, fill: o.cor ?? '#fff', ls: o.ls });
  return s;
}
// chip de contorno (como os do v18: "Melhoria de processos", "TMO")
export function chip(texto, cx, cy, o = {}) {
  const size = o.size ?? 17, w = larg(texto, size, 600, 'os') + 30 + (o.ls ? texto.length * o.ls : 0), h = size + 16;
  return `<rect x="${F(cx - w / 2)}" y="${F(cy - h / 2)}" width="${F(w)}" height="${F(h)}" rx="${F(h / 2)}" fill="${o.fill ?? 'rgba(255,255,255,.05)'}" stroke="${o.cor ?? COR.verde}" stroke-width="1.5"/>`
    + T(texto, cx, cy + size * 0.36, size, { ...OS, fill: o.texto ?? '#fff', ls: o.ls });
}
export const chipW = (texto, size = 17, ls = 0) => larg(texto, size, 600, 'os') + 30 + texto.length * ls;
// rótulo de seção "— TÍTULO" (dourado + letras espaçadas), como no v18
export function secao(texto, x, y, L, o = {}) {
  const k = ease.out(inv(0, 0.5, L));
  return op(k, `<rect x="${F(x)}" y="${F(y - 2)}" width="${F(34 * k)}" height="2.5" fill="${COR.ouro}"/>` + T(texto, x + 48, y + 6, o.size ?? 18, { w: 700, fill: o.fill ?? '#c8d6f0', anchor: 'start', ls: 4.5 }));
}
export function brilhoPonto(x, y, r, cor = '#fff', a = 1) {
  return `<circle cx="${F(x)}" cy="${F(y)}" r="${F(r * 2.2)}" fill="${cor}" opacity="${F(0.35 * a)}" filter="url(#azBrilhoP)"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(r)}" fill="${cor}" opacity="${F(a)}"/>`;
}
// check circular (verde)
export const checkIco = (x, y, r = 11, cor = COR.verde) => `<circle cx="${F(x)}" cy="${F(y)}" r="${F(r)}" fill="${cor}"/><path d="M${F(x - r * 0.45)} ${F(y)} l${F(r * 0.3)} ${F(r * 0.32)} l${F(r * 0.6)} ${F(-r * 0.62)}" stroke="#fff" stroke-width="${F(r * 0.22)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

// ------------------------------------------------------------------ personagens
// retrato PNG: (cx, base) = centro horizontal e linha de base (borda de baixo), h = altura desenhada.
// Respiração, leve balanço e sombra. Nunca espelhar (as logos das camisas).
export function pessoa(id, cx, base, h, L, o = {}) {
  const m = PROP[id]; if (!m) return '';
  const w = h * m.r;
  const k = 1, bob = 0, sway = 0;   // personagens estáticos (sem respiração/balanço): só a entrada deslizando
  let s = '';
  if (o.halo !== false) s += `<ellipse cx="${F(cx)}" cy="${F(base - h * 0.6)}" rx="${F(w * 0.5)}" ry="${F(h * 0.46)}" fill="${o.halo ?? '#5aa0ff'}" opacity="${F(o.haloA ?? 0.14)}" filter="url(#azBrilhoG)"/>`;
  s += g(`translate(${F(cx)} ${F(base + bob)}) rotate(${F(sway)}) scale(${F(k)})`, imagem(id, -w / 2, -h, w, h, 'filter="url(#azPessoa)"'));
  return s;
}
// máscara de revelação (estilo After Effects): recorta `inner` com um retângulo que cresce a partir de um lado
// ('E' esquerda, 'D' direita, 'C' cima, 'B' baixo), com um leve deslocamento no sentido da entrada
let _rev = 0;
export function revela(k, lado, w, h, inner, x0 = 0, y0 = 0) {
  k = clamp(k); if (k <= 0) return ''; if (k >= 1) return inner;
  const id = 'azRev' + (_rev++ % 100000);
  const rw = lado === 'E' || lado === 'D' ? w * k : w, rh = lado === 'C' || lado === 'B' ? h * k : h;
  const rx = lado === 'D' ? x0 + w - rw : x0, ry = lado === 'B' ? y0 + h - rh : y0;
  const dx = lado === 'E' ? -(1 - k) * 26 : lado === 'D' ? (1 - k) * 26 : 0, dy = lado === 'C' ? -(1 - k) * 26 : lado === 'B' ? (1 - k) * 26 : 0;
  return `<clipPath id="${id}"><rect x="${F(rx)}" y="${F(ry)}" width="${F(rw)}" height="${F(rh)}"/></clipPath><g clip-path="url(#${id})">${g(tr(dx, dy), inner)}</g>`;
}
export const largPessoa = (id, h) => (PROP[id] ? h * PROP[id].r : 0);
// deslocamento que deixa o personagem inteiramente fora do quadro (para entradas deslizando pela lateral)
export const foraEsq = (id, cx, h) => cx + largPessoa(id, h) / 2 + 60;
export const foraDir = (id, cx, h) => 1920 - cx + largPessoa(id, h) / 2 + 60;
// avatar redondo de uma pessoa do time
export function avatar(id, cx, cy, r, k = 1, borda = '#fff') {
  const cid = 'av' + id + Math.round(cx) + Math.round(cy);
  return g(`translate(${F(cx)} ${F(cy)}) scale(${F(k)})`, `<clipPath id="${cid}"><circle r="${F(r)}"/></clipPath><circle r="${F(r + 1.5)}" fill="${borda}"/><g clip-path="url(#${cid})">${imagem(id + '_rosto', -r, -r, 2 * r, 2 * r)}</g>`);
}

// ------------------------------------------------------------------ chrome (logos + barra de progresso) e legenda
export function chrome(t, o = {}) {
  let s = '';
  s += logoImg('alvarez-marsal-branco', 84, 62, 48, 68) + `<rect x="128" y="42" width="1.2" height="40" fill="rgba(255,255,255,.35)"/>` + logoImg('totvs-branco', 196, 63, 28, 104);
  // barra de progresso fina embaixo com marcas nas cenas
  const total = J?.total ?? 170;
  s += `<rect x="0" y="1075" width="${W}" height="2" fill="rgba(255,255,255,.08)"/>`;
  for (const m of (o.marcas ?? [])) s += `<rect x="${F(m / total * W)}" y="1068" width="1.5" height="9" fill="rgba(255,255,255,.26)"/>`;
  s += `<rect x="0" y="1073" width="${F(clamp(t / total) * W)}" height="5" fill="url(#azBarra)"/>`;
  return s;
}

function legendaPalavras(f) {
  const pal = f.texto.split(/\s+/).map(p => ({ p }));
  const asr = f.palavras, nA = asr.length, nD = pal.length;
  pal.forEach((w, i) => { w.t = asr[Math.min(nA - 1, Math.floor(i * nA / nD))][1]; });
  return pal;
}
// legenda do v18: pílula escura, ponto azul, palavras acendem (brancas) conforme são ditas; 1 ou 2 linhas
export function legenda(t, o = {}) {
  const falas = J.falas;
  const i = falas.findIndex((x, k) => t >= x.de - 0.3 && t <= Math.min(x.ate + 0.95, (falas[k + 1]?.de ?? 1e9) - 0.12));
  if (i < 0) return '';
  const f = falas[i];
  const pal = legendaPalavras(f);
  const maxW = o.maxW ?? 1240, cxL = o.cx ?? 960;
  // quebra em linhas; se passar de duas, reduz a fonte (31 → 28 → 25) até caber em duas
  let size = o.size ?? 31, esp, ws, linhas;
  for (;;) {
    esp = larg(' ', size, 600, 'os'); ws = pal.map(w => larg(w.p, size, 600, 'os'));
    linhas = [[]]; let lw = 0;
    pal.forEach((w, k) => { const add = ws[k] + (linhas.at(-1).length ? esp : 0); if (lw + add > maxW && linhas.at(-1).length) { linhas.push([k]); lw = ws[k]; } else { linhas.at(-1).push(k); lw += add; } });
    if (linhas.length <= 2 || size <= 25) break;
    size -= 3;
  }
  // duas linhas: equilibra
  if (linhas.length === 2) { const tot = ws.reduce((a, b) => a + b, 0); let acc = 0, cut = 0; for (let k = 0; k < pal.length; k++) { acc += ws[k] + esp; if (acc > tot / 2) { cut = k + 1; break; } } linhas[0] = pal.map((_, k) => k).slice(0, cut); linhas[1] = pal.map((_, k) => k).slice(cut); }
  const lws = linhas.map(l => l.reduce((a, k) => a + ws[k], 0) + esp * (l.length - 1));
  const bw = Math.max(...lws) + 110, lh = size * 1.22, bh = linhas.length * lh + 34;
  const yc = o.y ?? (linhas.length > 1 ? 985 : 1000);
  const x0 = cxL - bw / 2, y0 = yc - bh / 2;
  const a = clamp((t - f.de + 0.3) / 0.22) * (1 - clamp((t - Math.min(f.ate + 0.95, (falas[i + 1]?.de ?? 1e9) - 0.12) + 0.2) / 0.2));
  let s = `<rect x="${F(x0)}" y="${F(y0)}" width="${F(bw)}" height="${F(bh)}" rx="20" fill="rgba(7,16,38,.64)" stroke="rgba(255,255,255,.10)"/>`;
  linhas.forEach((l, li) => {
    const y = y0 + 17 + lh * (li + 0.78);
    let x = cxL - lws[li] / 2 + 22;
    if (li === 0) s += `<circle cx="${F(x - 30)}" cy="${F(y - size * 0.33)}" r="6" fill="${COR.ciano}"/>`;
    for (const k of l) {
      const w = pal[k], dito = t >= w.t - 0.05;
      s += `<text x="${F(x)}" y="${F(y)}" font-family="Open Sans" font-weight="600" font-size="${size}" fill="${dito ? '#ffffff' : 'rgba(214,226,247,.55)'}">${esc(w.p)}</text>`;
      x += ws[k] + esp;
    }
  });
  return op(a, g(tr(0, 6 * (1 - a)), s));
}

// tempo (s) da palavra idx da legenda id; idx negativo conta do fim
export function palavra(id, idx) {
  const f = J.falas.find(x => x.id === id); if (!f) return 0;
  const ws = f.palavras; return ws[idx < 0 ? Math.max(0, ws.length + idx) : Math.min(idx, ws.length - 1)][1];
}
export const fala = id => J.falas.find(x => x.id === id);
