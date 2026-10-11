// Abertura nova (00:00–01:05) do vídeo azul "Projeto do Ano — A&M + TOTVS".
// Substitui as seis primeiras cenas do vídeo original (capa, mural de resultados, volta ao passado, desafio do
// ERP, farol A&M e união), que depois continua a partir da cena da liderança.
// Personagens: retratos 3D em assets/personagens/animation-3d (cópias leves em build/azul/img) e o Módulo
// (mascote TOTVS). Tempos das cenas e das falas: build/azul/abertura.json (producao/azul_audio.py).
import { clamp, lerp, inv, ease, kf, rng, noise, n2, tr, g, op, esc, measure, TAU } from '../core.js';
import { dataUrl } from '../assets.js';

const F = n2;
const W = 1920, H = 1080;
const COR = {
  fundo0: '#0a1630', fundo1: '#12305f', azul: '#3b82f6', azulClaro: '#6cb4ff', ouro: '#f2c14e', ouro2: '#e9a93a',
  laranja: '#f08a2c', branco: '#ffffff', texto: '#e8eefb', suave: 'rgba(232,238,251,.62)', vidro: 'rgba(255,255,255,.065)',
  borda: 'rgba(255,255,255,.16)', verde: '#3ccf91', vermelho: '#ff5d6c',
};
const IMG = {};   // id -> data URL
let META = {}, J = null;

const CAPITULO = {
  capa: ['01', 'ATO 1 · RESULTADOS ESTRATÉGICOS', 'A parceria'],
  resultados: ['02', 'ATO 1 · RESULTADOS ESTRATÉGICOS', 'Resultados que fazem a diferença'],
  tunel: ['03', 'ATO 2 · COMO TUDO COMEÇOU', 'Como tudo começou'],
  desafio: ['04', 'ATO 2 · COMO TUDO COMEÇOU', 'O desafio'],
  farol: ['05', 'ATO 2 · COMO TUDO COMEÇOU', 'O chamado'],
  uniao: ['06', 'ATO 2 · COMO TUDO COMEÇOU', 'A união'],
};
// barra de progresso: a abertura ocupa o mesmo trecho da barra que ocupava no original (0 → 76,1 de 185,8 s)
const PROG_FIM = 76.1 / 185.77;
const MARCAS_BARRA = [0.054, 0.093, 0.172, 0.21, 0.29, 0.335, 0.405, 0.48, 0.563, 0.643, 0.73, 0.82, 0.88];

export async function carregar() {
  META = await (await fetch('build/azul/img/meta.json')).json();
  J = await (await fetch('build/azul/abertura.json')).json();
  const nomes = [...Object.keys(META), ...Object.keys(META).filter(k => k !== 'modulo').map(k => k + '_rosto'), 'alvarez-marsal-branco', 'totvs-branco'];
  await Promise.all(nomes.map(async n => { IMG[n] = await dataUrl(`build/azul/img/${n}.png`); }));
  for (const n of ['unimed', 'funed', 'caoa', 'john-deere', 'hughes', 'libercon', 'alvarez-marsal', 'totvs']) IMG['logo-' + n] = await dataUrl(`assets/logos/${n}.png`);
  const tam = await Promise.all(Object.keys(IMG).filter(k => k.startsWith('logo-') || k.endsWith('-branco')).map(k => new Promise(ok => {
    const im = new Image(); im.onload = () => ok([k, im.naturalWidth / im.naturalHeight]); im.src = IMG[k];
  })));
  for (const [k, r] of tam) PROP[k] = r;
  return J;
}
const PROP = {};

// ------------------------------------------------------------------ primitivas
const T = (s, x, y, size, o = {}) => `<text x="${F(x)}" y="${F(y)}" font-family="${o.fam ?? 'Outfit'}" font-weight="${o.w ?? 700}" font-size="${size}" fill="${o.fill ?? COR.texto}" text-anchor="${o.anchor ?? 'middle'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.extra ? ' ' + o.extra : ''}>${esc(s)}</text>`;
const larg = (s, size, w = 700, fam = 'Outfit') => measure(s, `${w} ${size}px ${fam === 'Outfit' ? 'Outfit' : '"DM Sans"'}`);
const imagem = (id, x, y, w, h, extra = '') => `<image href="${IMG[id]}" x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" preserveAspectRatio="xMidYMid meet"${extra ? ' ' + extra : ''}/>`;
function logoImg(id, cx, cy, h, maxW = 1e9) {
  const r = PROP[id] ?? 3; let w = h * r, hh = h;
  if (w > maxW) { w = maxW; hh = w / r; }
  return imagem(id, cx - w / 2, cy - hh / 2, w, hh);
}
const sorteio = rng(7);
const BOKEH = Array.from({ length: 26 }, () => ({ x: sorteio() * W, y: sorteio() * H, r: 30 + sorteio() * 110, a: 0.02 + sorteio() * 0.05, v: 4 + sorteio() * 10, f: sorteio() * TAU }));
const ESTRELAS = Array.from({ length: 90 }, () => ({ x: sorteio() * W, y: sorteio() * H * 0.75, r: 0.6 + sorteio() * 1.6, f: sorteio() * TAU }));

export function defs() {
  return `<radialGradient id="azFundo" cx="50%" cy="38%" r="80%"><stop offset="0" stop-color="${COR.fundo1}"/><stop offset=".62" stop-color="#0d2149"/><stop offset="1" stop-color="${COR.fundo0}"/></radialGradient>`
    + `<radialGradient id="azVinheta" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>`
    + `<radialGradient id="azLuz" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="#bfe0ff" stop-opacity=".35"/><stop offset="1" stop-color="#7fb8ff" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="azLuzOuro" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".95"/><stop offset=".4" stop-color="${COR.ouro}" stop-opacity=".35"/><stop offset="1" stop-color="${COR.ouro}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="azSpot" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cfe4ff" stop-opacity=".28"/><stop offset=".55" stop-color="#7fb0ff" stop-opacity=".10"/><stop offset="1" stop-color="#7fb0ff" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="azLua" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe2a6"/><stop offset=".25" stop-color="#ffcf7a" stop-opacity=".85"/><stop offset=".6" stop-color="#f2a64a" stop-opacity=".18"/><stop offset="1" stop-color="#f2a64a" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="azCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".11"/><stop offset="1" stop-color="#ffffff" stop-opacity=".035"/></linearGradient>`
    + `<linearGradient id="azBarra" x1="0" x2="1"><stop offset="0" stop-color="${COR.azul}"/><stop offset="1" stop-color="${COR.ouro}"/></linearGradient>`
    + `<linearGradient id="azFeixe" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6d8" stop-opacity=".75"/><stop offset=".5" stop-color="#cfe2ff" stop-opacity=".22"/><stop offset="1" stop-color="#cfe2ff" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="azPeito" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="#0b1a38" stop-opacity="0"/><stop offset="1" stop-color="#0b1a38" stop-opacity=".9"/></linearGradient>`
    + `<linearGradient id="azEnergiaA" x1="0" x2="1"><stop offset="0" stop-color="${COR.azul}" stop-opacity="0"/><stop offset=".6" stop-color="${COR.azulClaro}"/><stop offset="1" stop-color="#fff"/></linearGradient>`
    + `<linearGradient id="azEnergiaB" x1="1" x2="0"><stop offset="0" stop-color="${COR.laranja}" stop-opacity="0"/><stop offset=".6" stop-color="#ffb36b"/><stop offset="1" stop-color="#fff"/></linearGradient>`
    + `<filter id="azBrilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>`
    + `<filter id="azBrilhoP" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>`
    + `<filter id="azDesfoque" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>`
    // personagens: um pouco mais de luz e contraste (no original pareciam apagados) e sombra suave
    + `<filter id="azPessoa" x="-10%" y="-10%" width="120%" height="125%" color-interpolation-filters="sRGB">`
    + `<feComponentTransfer><feFuncR type="linear" slope="1.10" intercept="0.015"/><feFuncG type="linear" slope="1.10" intercept="0.015"/><feFuncB type="linear" slope="1.08" intercept="0.01"/></feComponentTransfer>`
    + `<feColorMatrix type="saturate" values="1.08" result="p"/><feGaussianBlur in="SourceAlpha" stdDeviation="14" result="b"/><feOffset dx="0" dy="14" result="o"/>`
    + `<feComponentTransfer in="o" result="s"><feFuncA type="linear" slope=".45"/></feComponentTransfer><feMerge><feMergeNode in="s"/><feMergeNode in="p"/></feMerge></filter>`
    + `<filter id="azSepia" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".5 .45 .2 0 .06  .38 .42 .18 0 .04  .26 .3 .14 0 .02  0 0 0 1 0"/></filter>`;
}

function fundo(t, o = {}) {
  let s = `<rect width="${W}" height="${H}" fill="url(#azFundo)"/>`;
  for (const b of BOKEH) {
    const x = (b.x + t * b.v) % (W + 200) - 100, y = b.y + Math.sin(t * 0.3 + b.f) * 12;
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(b.r)}" fill="#8fb8ff" opacity="${F(b.a * (o.bokeh ?? 1))}"/>`;
  }
  for (const e of ESTRELAS) s += `<circle cx="${F(e.x)}" cy="${F(e.y)}" r="${F(e.r)}" fill="#dbe8ff" opacity="${F(0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + e.f)))}"/>`;
  return s;
}

// cidade à noite (capa e farol): prédios em silhueta, janelas que acendem e piscam
const PREDIOS = (() => {
  const r = rng(21), out = [];
  for (let x = -20; x < W + 40;) {
    const w = 60 + r() * 90, h = 120 + r() * 260 * (0.6 + 0.4 * Math.sin(x / 300)) + (r() < 0.12 ? 180 : 0);
    const jan = [];
    for (let yy = 18; yy < h - 18; yy += 22) for (let xx = 10; xx < w - 14; xx += 18) if (r() < 0.36) jan.push([xx, yy, r() * TAU, r()]);
    out.push({ x, w, h, jan, tom: r() }); x += w + 4 + r() * 10;
  }
  return out;
})();
function cidade(t, base = 1000, o = {}) {
  let s = '';
  for (const p of PREDIOS) {
    const y = base - p.h * (o.k ?? 1);
    s += `<rect x="${F(p.x)}" y="${F(y)}" width="${F(p.w)}" height="${F(p.h * (o.k ?? 1) + 200)}" fill="${p.tom < 0.5 ? '#0e2347' : '#112a55'}"/>`;
    for (const [xx, yy, f, q] of p.jan) {
      if (yy > p.h * (o.k ?? 1) - 10) continue;
      const liga = o.acende != null ? clamp((o.acende - Math.abs(p.x + xx - (o.foco ?? 960)) / 900) * 3) : 1;
      const a = (0.45 + 0.4 * Math.sin(t * (0.6 + q) + f)) * liga;
      s += `<rect x="${F(p.x + xx)}" y="${F(y + yy)}" width="7" height="9" fill="${q > 0.82 ? '#ffd27a' : '#f7c76a'}" opacity="${F(clamp(a))}"/>`;
    }
  }
  return s + `<rect x="0" y="${base}" width="${W}" height="${H - base}" fill="#091a37"/>`;
}

// cartão de vidro
function vidro(x, y, w, h, o = {}) {
  const r = o.r ?? 20;
  let s = '';
  if (o.brilho) s += `<rect x="${F(x - 6)}" y="${F(y - 6)}" width="${F(w + 12)}" height="${F(h + 12)}" rx="${r + 6}" fill="${o.corBrilho ?? COR.azul}" opacity="${F(0.35 * o.brilho)}" filter="url(#azBrilho)"/>`;
  s += `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" rx="${r}" fill="url(#azCard)" stroke="${o.borda ?? COR.borda}" stroke-width="${o.bw ?? 1.5}"/>`;
  return s;
}
function pilula(texto, cx, cy, o = {}) {
  const size = o.size ?? 22, w = larg(texto, size, 800) + (o.padX ?? 26) * 2 + (o.ls ? texto.length * o.ls : 0), h = size + 22;
  return `<rect x="${F(cx - w / 2)}" y="${F(cy - h / 2)}" width="${F(w)}" height="${F(h)}" rx="${F(h / 2)}" fill="${o.fill ?? COR.azul}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="2"` : ''}/>`
    + T(texto, cx, cy + size * 0.36, size, { w: 800, fill: o.cor ?? '#fff', ls: o.ls });
}
const entra = (L, a, d = 0.5) => ease.back(inv(a, a + d, L));

// personagem: retrato (base no chão / borda de baixo) com respiração e balanço; nunca cortado nas laterais
function pessoa(id, cx, base, h, L, o = {}) {
  const m = META[id]; if (!m) return '';
  const w = h * m.w / m.h, k = 1 + 0.008 * Math.sin(L * 2.1 + (o.fase ?? 0));
  const balanco = 0.9 * Math.sin(L * 0.9 + (o.fase ?? 0));
  const dx = (m.w / 2 - m.cx) * h / m.h;   // centraliza pelo rosto
  let s = '';
  if (o.halo !== false) s += `<ellipse cx="${F(cx)}" cy="${F(base - h * 0.62)}" rx="${F(w * 0.55)}" ry="${F(h * 0.5)}" fill="${o.halo ?? '#5aa0ff'}" opacity=".16" filter="url(#azBrilho)"/>`;
  const corpo = imagem(id, -w / 2 + dx, -h, w, h, `filter="url(#azPessoa)"`);
  s += g(`translate(${F(cx)} ${F(base)}) rotate(${F(balanco)}) scale(${F(o.flip ? -1 : 1)} ${F(k)})`, corpo);
  return s;
}
// largura ocupada (para manter a pessoa inteira dentro do quadro)
const largPessoa = (id, h) => (META[id] ? h * META[id].w / META[id].h : 0);

// ------------------------------------------------------------------ chrome e legenda
function chrome(t, cena) {
  let s = '';
  // logos A&M | TOTVS (brancos), sem fundo, como no original
  s += logoImg('alvarez-marsal-branco', 82, 62, 50, 70) + `<rect x="128" y="40" width="1.5" height="44" fill="rgba(255,255,255,.35)"/>` + logoImg('totvs-branco', 196, 63, 30, 110);
  const [n, ato, titulo] = CAPITULO[cena];
  const w = Math.max(larg(titulo, 21, 700), larg(ato, 12, 700) + 30) + 92;
  const x = 1870 - w;
  s += `<rect x="${F(x)}" y="36" width="${F(w)}" height="54" rx="27" fill="rgba(8,20,48,.55)" stroke="rgba(255,255,255,.16)"/>`
    + `<circle cx="${F(x + 30)}" cy="63" r="17" fill="#1d5bd8"/>` + T(n, x + 30, 69, 16, { w: 800, fill: '#fff' })
    + T(ato, x + 60, 57, 11.5, { w: 700, fill: COR.suave, anchor: 'start', ls: 1.6 }) + T(titulo, x + 60, 79, 20, { w: 700, fill: '#fff', anchor: 'start' });
  // barra de progresso com marcas de capítulo
  const p = clamp(t / J.total) * PROG_FIM;
  s += `<rect x="0" y="1074" width="${W}" height="2" fill="rgba(255,255,255,.08)"/>`;
  for (const m of MARCAS_BARRA) s += `<rect x="${F(m * W)}" y="1067" width="1.5" height="9" fill="rgba(255,255,255,.28)"/>`;
  s += `<rect x="0" y="1072" width="${F(p * W)}" height="5" fill="url(#azBarra)"/>`;
  return s;
}

function legenda(t) {
  const f = J.falas.find(x => t >= x.de - 0.15 && t <= x.ate + 0.35);
  if (!f) return '';
  const pal = [];
  for (const m of f.texto.matchAll(/\*([^*]+)\*|([^*\s][^*]*?)(?=\*|$)/g)) {
    const dest = m[1] != null;
    for (const p of (m[1] ?? m[2]).trim().split(/\s+/)) {
      if (!p) continue;
      if (/^[.,:;!?]+$/.test(p) && pal.length) pal[pal.length - 1].p += p;   // pontuação cola na palavra anterior
      else pal.push({ p, dest });
    }
  }
  const asr = f.palavras, nA = asr.length, nD = pal.length;
  pal.forEach((w, i) => { w.t = asr[Math.min(nA - 1, Math.round(i * nA / nD))][1]; });
  const size = 30, esp = larg(' ', size, 700, 'dm');
  const ws = pal.map(w => larg(w.p, size, 700, 'dm'));
  const tw = ws.reduce((a, b) => a + b, 0) + esp * (pal.length - 1);
  const bw = tw + 96, x0 = 960 - bw / 2, y = 1000;
  const a = clamp((t - f.de + 0.15) / 0.2) * (1 - clamp((t - f.ate - 0.15) / 0.2));
  let s = `<rect x="${F(x0)}" y="${y - 40}" width="${F(bw)}" height="80" rx="20" fill="rgba(7,17,40,.62)" stroke="rgba(255,255,255,.12)"/>`
    + `<circle cx="${F(x0 + 36)}" cy="${y}" r="7" fill="${COR.azulClaro}"/>`;
  let x = x0 + 62;
  pal.forEach((w, i) => {
    const dito = t >= w.t - 0.04;
    const cor = dito ? (w.dest ? COR.ouro : '#ffffff') : 'rgba(225,233,250,.5)';
    s += `<text x="${F(x)}" y="${y + 10}" font-family="DM Sans" font-weight="700" font-size="${size}" fill="${cor}">${esc(w.p)}</text>`;
    x += ws[i] + esp;
  });
  return op(a, s);
}

// ------------------------------------------------------------------ CENA 1 · capa
function capa(L, t) {
  let s = fundo(t);
  s += `<circle cx="1210" cy="660" r="240" fill="url(#azLua)"/>`;
  s += g(tr(0, 22 * (1 - ease.out(inv(0, 1.2, L)))), cidade(t, 1010));
  s += `<rect width="${W}" height="${H}" fill="url(#azVinheta)"/>`;
  // personagens inteiros: Módulo (TOTVS) à esquerda, Antonialli (A&M) à direita
  const em = entra(L, 0.15, 0.7), ea = entra(L, 0.35, 0.7);
  const hm = 560, ha = 640;
  s += g(tr(-380 * (1 - em), 0), pessoa('modulo', 70 + largPessoa('modulo', hm) / 2 + 30, 1060 + 8 * Math.sin(L * 2), hm, L, { halo: '#3b82f6' }));
  s += g(tr(420 * (1 - ea), 0), pessoa('antonialli', 1880 - largPessoa('antonialli', ha) / 2, H, ha, L, { halo: '#f08a2c', fase: 1.3 }));
  // título chega rápido
  const k1 = ease.out(inv(0.15, 0.6, L)), t1 = ease.back(inv(0.3, 0.8, L)), t2 = ease.back(inv(0.45, 0.95, L)), p1 = entra(L, 0.9, 0.5);
  s += op(k1, T('PROJETO DO ANO · FY26', 960, 300 - 10 * (1 - k1), 22, { w: 800, fill: COR.ouro, ls: 6 }));
  s += op(clamp(t1 * 1.4), g(`translate(960 450) scale(${F(lerp(1.25, 1, t1))})`, T('PROJETO', 0, 0, 150, { w: 900, fill: '#fff', ls: -3 })));
  s += op(clamp(t2 * 1.4), g(`translate(960 600) scale(${F(lerp(1.25, 1, t2))})`, T('DO ANO', 0, 0, 150, { w: 900, fill: '#fff', ls: -3 })));
  // reflexo que varre o título
  const v = inv(1.2, 2.1, L);
  if (v > 0 && v < 1) s += `<g opacity=".55"><rect x="${F(560 + v * 900)}" y="330" width="60" height="300" fill="#fff" transform="skewX(-20)" filter="url(#azBrilhoP)" opacity=".35"/></g>`;
  // selo da parceria
  const sw = 470;
  s += op(clamp(p1), g(`translate(960 712) scale(${F(lerp(0.85, 1, p1))})`,
    `<rect x="${-sw / 2}" y="-34" width="${sw}" height="68" rx="34" fill="rgba(8,20,48,.6)" stroke="rgba(255,255,255,.2)"/>`
    + T('PARCERIA', -150, 8, 20, { w: 800, fill: COR.suave, ls: 3 }) + logoImg('alvarez-marsal-branco', -40, 0, 46, 60)
    + T('+', 30, 10, 30, { w: 800, fill: COR.ouro }) + logoImg('totvs-branco', 120, 1, 30, 130)));
  return s;
}

// ------------------------------------------------------------------ CENA 2 · mural de resultados
const GRADE = { x0: 455, y0: 205, cw: 330, ch: 172, gap: 20 };
const celula = i => ({ x: GRADE.x0 + (i % 3) * (GRADE.cw + GRADE.gap), y: GRADE.y0 + Math.floor(i / 3) * (GRADE.ch + GRADE.gap) });
const CARDS = [
  { num: 6, txt: ['projetos vendidos', 'no primeiro ano'] },
  { num: 20, txt: ['pessoas passaram', 'pelos projetos'] },
  { pre: 'R$ ', num: 16, suf: ' mi', txt: ['em collections', 'FY26 + FY27'] },
  { num: 12, txt: ['meses de', 'duração média'] },
  { ic: 'link', txt: ['Cross-sell com outras', 'especializações da A&M'] },
  { ic: 'camadas', txt: ['Framework integrado', 'A&M + TOTVS · TMO + GMO'] },
  { ic: 'ia', txt: ['IA e QA das MITs'] },
  { ic: 'teste', txt: ['Testes integrados'] },
  { ic: 'cockpit', txt: ['Cockpit executivo'] },
];
const LOGOS6 = ['unimed', 'funed', 'caoa', 'john-deere', 'hughes', 'libercon'];
const EQUIPE = ['bruno', 'giovanna', 'antonialli', 'jaqueline', 'jose', 'joao', 'massao', 'mancini', 'monica', 'nara', 'pedro', 'thauany', 'vinicius'];

function palavra(fid, idx) { const f = J.falas.find(x => x.id === fid); return f.palavras[Math.min(idx, f.palavras.length - 1)][1]; }

function icone(tipo, cx, cy, s, u, L) {
  const st = `stroke="${COR.azulClaro}" stroke-width="${F(s * 0.08)}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  if (tipo === 'link') {
    // três nós que se ligam
    const p = [[-0.55, 0.3], [0, -0.45], [0.55, 0.3]].map(([a, b]) => [cx + a * s, cy + b * s]);
    let r = '';
    for (let i = 0; i < 3; i++) { const [a, b] = [p[i], p[(i + 1) % 3]]; const k = clamp(u * 3 - i); r += `<line x1="${F(a[0])}" y1="${F(a[1])}" x2="${F(lerp(a[0], b[0], k))}" y2="${F(lerp(a[1], b[1], k))}" ${st}/>`; }
    return r + p.map(([x, y], i) => `<circle cx="${F(x)}" cy="${F(y)}" r="${F(s * 0.16 * (0.6 + 0.4 * ease.back(clamp(u * 3 - i + 0.5))))}" fill="${COR.azulClaro}"/>`).join('');
  }
  if (tipo === 'camadas') {
    let r = '';
    for (let i = 0; i < 3; i++) { const k = ease.back(clamp(u * 3 - i)); const y = cy + (0.35 - i * 0.32) * s - (1 - k) * s * 0.6; r += op(clamp(k * 2), `<path d="M${F(cx - s * 0.6)} ${F(y)} L${F(cx)} ${F(y - s * 0.28)} L${F(cx + s * 0.6)} ${F(y)} L${F(cx)} ${F(y + s * 0.28)} Z" ${st} fill="${i === 2 ? 'rgba(108,180,255,.25)' : 'none'}"/>`); }
    return r;
  }
  if (tipo === 'ia') {
    let r = '';
    const b = (x, y, rr, a) => `<path d="M${F(x)} ${F(y - rr)} Q${F(x + rr * 0.18)} ${F(y - rr * 0.18)} ${F(x + rr)} ${F(y)} Q${F(x + rr * 0.18)} ${F(y + rr * 0.18)} ${F(x)} ${F(y + rr)} Q${F(x - rr * 0.18)} ${F(y + rr * 0.18)} ${F(x - rr)} ${F(y)} Q${F(x - rr * 0.18)} ${F(y - rr * 0.18)} ${F(x)} ${F(y - rr)} Z" fill="${COR.ouro}" opacity="${F(a)}"/>`;
    r += b(cx, cy, s * 0.55 * (0.85 + 0.15 * Math.sin(L * 6)) * ease.back(u), 1);
    r += b(cx + s * 0.6, cy - s * 0.45, s * 0.22 * clamp(u * 2 - 0.5) * (0.7 + 0.3 * Math.sin(L * 7 + 1)), 0.9);
    r += b(cx - s * 0.55, cy + s * 0.45, s * 0.18 * clamp(u * 2 - 0.8) * (0.7 + 0.3 * Math.sin(L * 8 + 2)), 0.9);
    return r;
  }
  if (tipo === 'teste') {
    let r = '';
    for (let i = 0; i < 3; i++) {
      const y = cy - s * 0.42 + i * s * 0.42, k = clamp(u * 3.2 - i);
      r += `<rect x="${F(cx - s * 0.6)}" y="${F(y - s * 0.14)}" width="${F(s * 0.28)}" height="${F(s * 0.28)}" rx="${F(s * 0.06)}" ${st}/>`
        + `<line x1="${F(cx - s * 0.18)}" y1="${F(y)}" x2="${F(cx + s * 0.6)}" y2="${F(y)}" stroke="rgba(232,238,251,.35)" stroke-width="${F(s * 0.07)}" stroke-linecap="round"/>`;
      if (k > 0) r += `<path d="M${F(cx - s * 0.55)} ${F(y)} l${F(s * 0.08 * clamp(k * 2))} ${F(s * 0.08 * clamp(k * 2))} l${F(s * 0.16 * clamp(k * 2 - 1))} ${F(-s * 0.18 * clamp(k * 2 - 1))}" stroke="${COR.verde}" stroke-width="${F(s * 0.09)}" fill="none" stroke-linecap="round"/>`;
    }
    return r;
  }
  if (tipo === 'cockpit') {
    const a0 = Math.PI, a = Math.PI + Math.PI * (0.15 + 0.7 * ease.out(u)) + 0.05 * Math.sin(L * 5) * u;
    return `<path d="M${F(cx - s * 0.6)} ${F(cy + s * 0.2)} A${F(s * 0.6)} ${F(s * 0.6)} 0 0 1 ${F(cx + s * 0.6)} ${F(cy + s * 0.2)}" ${st}/>`
      + `<path d="M${F(cx - s * 0.6)} ${F(cy + s * 0.2)} A${F(s * 0.6)} ${F(s * 0.6)} 0 0 1 ${F(cx + s * 0.6 * Math.cos(a - a0 + Math.PI))} ${F(cy + s * 0.2 + s * 0.6 * Math.sin(a))}" stroke="${COR.ouro}" stroke-width="${F(s * 0.1)}" fill="none" stroke-linecap="round" opacity="${F(clamp(u * 2))}"/>`
      + `<line x1="${F(cx)}" y1="${F(cy + s * 0.2)}" x2="${F(cx + Math.cos(a) * s * 0.48)}" y2="${F(cy + s * 0.2 + Math.sin(a) * s * 0.48)}" stroke="#fff" stroke-width="${F(s * 0.07)}" stroke-linecap="round"/><circle cx="${F(cx)}" cy="${F(cy + s * 0.2)}" r="${F(s * 0.09)}" fill="#fff"/>`;
  }
  return '';
}

function resultados(L, t) {
  let s = fundo(t, { bokeh: 1.2 });
  const t0 = t - L;
  const at = {
    seis: palavra('p2', 4) - t0, vinte: palavra('p3', 0) - t0, dez: palavra('p4', 0) - t0,
    a26: palavra('p4', 7) - t0, a27: palavra('p4', 9) - t0, metodo: palavra('p5', 2) - t0, inov: palavra('p5', 4) - t0,
    oport: palavra('p5', 7) - t0, fim: palavra('p5', 9) - t0,
  };
  // ordem de destaque (holofote) e quando cada cartão "acende"
  const acende = [at.seis - 0.25, at.vinte - 0.25, at.dez - 0.25, at.oport, at.oport + 0.35, at.metodo - 0.15, at.inov - 0.15, at.inov + 0.45, at.oport + 0.7];
  const foco = [[0, at.seis - 0.6], [1, at.vinte - 0.5], [2, at.dez - 0.5], [5, at.metodo - 0.4], [6, at.inov - 0.4], [7, at.inov + 0.4], [4, at.oport - 0.2], [3, at.oport + 0.4], [8, at.oport + 0.9]];
  // holofote que passeia pelos cartões
  let fi = 0; for (let i = 0; i < foco.length; i++) if (L >= foco[i][1]) fi = i;
  const c0 = celula(foco[Math.max(0, fi - 1)][0]), c1 = celula(foco[fi][0]);
  const u = fi === 0 ? 1 : ease.inOut(inv(foco[fi][1], foco[fi][1] + 0.45, L));
  const sx = lerp(c0.x, c1.x, u) + GRADE.cw / 2, sy = lerp(c0.y, c1.y, u) + GRADE.ch / 2;
  const final = inv(at.fim - 0.2, at.fim + 0.8, L);
  s += op(clamp(inv(0.3, 1, L)) * (1 - final * 0.6), `<ellipse cx="${F(sx)}" cy="${F(sy)}" rx="330" ry="230" fill="url(#azSpot)"/>`
    + `<path d="M${F(sx - 40)} -20 L${F(sx + 40)} -20 L${F(sx + 200)} ${F(sy + 60)} L${F(sx - 200)} ${F(sy + 60)} Z" fill="#cfe4ff" opacity=".05"/>`);
  // título da seção
  const kt = ease.out(inv(0.05, 0.5, L));
  s += op(kt, `<rect x="${GRADE.x0}" y="${F(158)}" width="${F(36 * kt)}" height="2.5" fill="${COR.ouro}"/>` + T('RESULTADOS QUE FAZEM A DIFERENÇA', GRADE.x0 + 50, 167, 18, { w: 800, fill: '#c8d6f0', anchor: 'start', ls: 4.5 }));
  // personagens inteiros nas laterais (Giovanna à esquerda, Antonialli à direita), respirando
  const hp = 455;
  const eg = entra(L, 0.2, 0.7), ea = entra(L, 0.35, 0.7);
  s += g(tr(-300 * (1 - eg), 0), pessoa('jaqueline', 18 + largPessoa('jaqueline', hp) / 2, H, hp, L, { halo: '#6cb4ff' }));
  s += g(tr(320 * (1 - ea), 0), pessoa('antonialli', 1900 - largPessoa('antonialli', hp) / 2, H, hp, L, { halo: '#f08a2c', fase: 2 }));
  // cartões
  CARDS.forEach((c, i) => {
    const { x, y } = celula(i);
    const ent = ease.out(inv(0.25 + i * 0.06, 0.75 + i * 0.06, L));
    const ac = clamp(inv(acende[i], acende[i] + 0.35, L));
    const ativo = fi < foco.length && foco[fi][0] === i && L < at.fim + 0.3;
    const sobe = ativo ? ease.out(inv(foco[fi][1], foco[fi][1] + 0.3, L)) : 0;
    const k = 1 + 0.06 * sobe + 0.02 * final;
    const fl = 3 * Math.sin(L * 1.4 + i);
    let corpo = vidro(0, 0, GRADE.cw, GRADE.ch, { brilho: ac * (ativo ? 1 : 0.35), borda: ac > 0 ? `rgba(108,180,255,${F(0.25 + 0.45 * ac)})` : COR.borda, bw: ativo ? 2.2 : 1.5 });
    const temNum = c.num != null;
    if (temNum) {
      const ini = acende[i] + 0.1, n = Math.round(c.num * ease.out(inv(ini, ini + 0.9, L)));
      const cor = ac > 0 ? COR.ouro : 'rgba(242,193,78,.35)';
      let xx = 24;
      if (c.pre) { corpo += T(c.pre.trim(), xx, 72, 34, { w: 800, fill: cor, anchor: 'start' }); xx += larg(c.pre, 34, 800); }
      corpo += T(String(ac > 0 ? n : c.num), xx, 76, 62, { w: 800, fill: cor, anchor: 'start' });
      xx += larg(String(c.num), 62, 800) + 6;
      if (c.suf) corpo += T(c.suf.trim(), xx, 76, 32, { w: 800, fill: cor, anchor: 'start' });
    } else {
      corpo += icone(c.ic, 52, 52, 44, ac, L);
    }
    const ty = temNum ? 112 : (c.txt.length > 1 ? 110 : 128);
    c.txt.forEach((l, j) => { corpo += T(l, 24, ty + j * 25, 20, { w: 600, fam: 'DM Sans', fill: ac > 0 ? '#eef3ff' : COR.suave, anchor: 'start' }); });
    corpo += `<rect x="24" y="${GRADE.ch - 14}" width="${F(lerp(40, GRADE.cw - 48, ac))}" height="3.5" rx="2" fill="${temNum ? COR.ouro : COR.azulClaro}" opacity="${F(0.5 + 0.5 * ac)}"/>`;
    // extras de cada cartão
    if (i === 0) LOGOS6.forEach((lg, j) => {   // seis projetos: os logos entram um a um
      const q = ease.back(inv(at.seis + 0.05 + j * 0.13, at.seis + 0.4 + j * 0.13, L));
      if (q <= 0) return;
      const lx = 172 + (j % 3) * 46, ly = 26 + Math.floor(j / 3) * 36;
      corpo += g(`translate(${F(lx)} ${F(ly)}) scale(${F(q)})`, `<rect x="-21" y="-14" width="42" height="28" rx="7" fill="#fff"/>` + logoImg('logo-' + lg, 0, 0, 16, 36));
    });
    if (i === 1) {   // vinte pessoas: rostos do time em cascata + "+7"
      EQUIPE.forEach((id, j) => {
        const q = ease.back(inv(at.vinte + j * 0.07, at.vinte + 0.35 + j * 0.07, L));
        if (q <= 0) return;
        const col = j % 7, lin = Math.floor(j / 7), cx2 = 150 + col * 22 + lin * 11, cy2 = 30 + lin * 30;
        corpo += g(`translate(${F(cx2)} ${F(cy2)}) scale(${F(q)})`, `<clipPath id="azR${j}"><circle r="14"/></clipPath><circle r="15.5" fill="#fff"/>` + `<g clip-path="url(#azR${j})">${imagem(id + '_rosto', -15, -15, 30, 30)}</g>`);
      });
      const q7 = ease.back(inv(at.vinte + 1.0, at.vinte + 1.3, L));
      if (q7 > 0) corpo += g(`translate(${F(280)} ${F(60)}) scale(${F(q7)})`, `<circle r="16" fill="${COR.azul}"/>` + T('+7', 0, 6, 15, { w: 800, fill: '#fff' }));
    }
    if (i === 2) {   // R$ 16 mi: 7 (2026) + 9 (2027)
      const b1 = ease.out(inv(at.a26 - 0.1, at.a26 + 0.5, L)), b2 = ease.out(inv(at.a27 - 0.1, at.a27 + 0.5, L));
      const bx = 210, base = 88, esc7 = 5.2;
      if (b1 > 0) corpo += `<rect x="${bx}" y="${F(base - 7 * esc7 * b1)}" width="30" height="${F(7 * esc7 * b1)}" rx="5" fill="${COR.azulClaro}"/>` + op(b1, T('7', bx + 15, base - 7 * esc7 * b1 - 8, 16, { w: 800, fill: '#fff' }) + T('2026', bx + 15, base + 18, 12, { w: 700, fill: COR.suave }));
      if (b2 > 0) corpo += `<rect x="${bx + 42}" y="${F(base - 9 * esc7 * b2)}" width="30" height="${F(9 * esc7 * b2)}" rx="5" fill="${COR.ouro}"/>` + op(b2, T('9', bx + 57, base - 9 * esc7 * b2 - 8, 16, { w: 800, fill: '#fff' }) + T('2027', bx + 57, base + 18, 12, { w: 700, fill: COR.suave }));
      // moedas que saltam
      const r = rng(5);
      for (let j = 0; j < 8; j++) {
        const t1 = at.dez + 0.2 + j * 0.08, q = inv(t1, t1 + 0.9, L);
        if (q <= 0 || q >= 1) continue;
        const ang = -Math.PI / 2 + (r() - 0.5) * 1.6, v = 90 + r() * 60;
        const mx = 120 + Math.cos(ang) * v * q, my = 60 + Math.sin(ang) * v * q + 160 * q * q;
        corpo += `<circle cx="${F(mx)}" cy="${F(my)}" r="9" fill="${COR.ouro}" stroke="#b67d18" stroke-width="2" opacity="${F(1 - q)}"/>`;
      }
    }
    if (i === 3) {   // 12 meses: anel que se completa
      const q = ease.inOut(inv(at.oport + 0.3, at.oport + 1.4, L));
      const r0 = 30, cx3 = 250, cy3 = 54;
      corpo += `<circle cx="${cx3}" cy="${cy3}" r="${r0}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="7"/>`;
      if (q > 0) corpo += `<circle cx="${cx3}" cy="${cy3}" r="${r0}" fill="none" stroke="${COR.ouro}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${F(TAU * r0 * q)} 999" transform="rotate(-90 ${cx3} ${cy3})"/>`;
      for (let m = 0; m < 12; m++) { const a = -Math.PI / 2 + m * TAU / 12; corpo += `<circle cx="${F(cx3 + Math.cos(a) * (r0 + 11))}" cy="${F(cy3 + Math.sin(a) * (r0 + 11))}" r="2.2" fill="${q * 12 > m ? COR.ouro : 'rgba(255,255,255,.25)'}"/>`; }
    }
    const base = op(ent, g(`translate(${F(x + GRADE.cw / 2)} ${F(y + GRADE.ch / 2 + fl * (1 - sobe) + 30 * (1 - ent))}) scale(${F(k)}) translate(${-GRADE.cw / 2} ${-GRADE.ch / 2})`, corpo));
    s += base;
  });
  // partículas que sobem dos cartões acesos
  const r = rng(11);
  for (let j = 0; j < 40; j++) {
    const i = Math.floor(r() * 9), t1 = acende[i] + r() * 6, q = inv(t1, t1 + 2.2, L);
    if (q <= 0 || q >= 1) { r(); continue; }
    const { x, y } = celula(i), px = x + r() * GRADE.cw, py = y + GRADE.ch - q * 120;
    s += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(1.5 + 1.5 * Math.sin(q * Math.PI))}" fill="${COR.ouro}" opacity="${F(0.7 * Math.sin(q * Math.PI))}"/>`;
  }
  return s + `<rect width="${W}" height="${H}" fill="url(#azVinheta)"/>`;
}

// ------------------------------------------------------------------ CENA 3 · túnel do tempo
function tunel(L, t, dur) {
  const ida = ease.inOut(inv(0.2, 1.6, L));        // mural se afasta / túnel abre
  const vel = 0.4 + 2.6 * ease.inOut(inv(1.2, 4.2, L)) - 1.6 * ease.inOut(inv(4.6, 5.6, L));
  const sepia = ease.inOut(inv(2.6, 5.0, L));
  let s = `<rect width="${W}" height="${H}" fill="#07112a"/>`;
  // anéis que vêm em direção à câmera (velocidade acumulada)
  const fase = L * 0.35 + 1.6 * ease.inOut(inv(1.2, 5.2, L)) * 2.2;
  let aneis = '';
  for (let i = 0; i < 18; i++) {
    const z = ((i / 18 + fase) % 1);
    const r = 40 + Math.pow(z, 2.4) * 1400;
    const a = Math.sin(z * Math.PI) * 0.9;
    const cor = i % 3 === 0 ? COR.ouro : i % 3 === 1 ? COR.azulClaro : '#9cc4ff';
    aneis += `<circle cx="960" cy="520" r="${F(r)}" fill="none" stroke="${cor}" stroke-width="${F(1.5 + z * 6)}" opacity="${F(a * (0.25 + 0.5 * z))}"/>`;
    // quadros de "memória" presos em alguns anéis
    if (i % 4 === 1) {
      const ang = i * 1.7 + L * 0.2, mx = 960 + Math.cos(ang) * r * 0.82, my = 520 + Math.sin(ang) * r * 0.62, sc = 0.25 + z * 1.6;
      aneis += op(a * 0.8, g(`translate(${F(mx)} ${F(my)}) rotate(${F(ang * 20 % 30 - 15)}) scale(${F(sc)})`, `<rect x="-60" y="-44" width="120" height="88" rx="8" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.35)" stroke-width="2"/>`
        + `<rect x="-48" y="-32" width="96" height="52" rx="4" fill="rgba(108,180,255,.18)"/>` + `<rect x="-48" y="28" width="${40 + (i * 13) % 40}" height="5" rx="2" fill="rgba(255,255,255,.4)"/>`));
    }
  }
  // riscos de luz radiais (efeito de velocidade)
  const r2 = rng(3);
  for (let j = 0; j < 70; j++) {
    const ang = r2() * TAU, d0 = (r2() + L * vel * 0.35) % 1, comp = 40 + 260 * vel * d0;
    const ra = 80 + Math.pow(d0, 1.8) * 1100;
    aneis += `<line x1="${F(960 + Math.cos(ang) * ra)}" y1="${F(520 + Math.sin(ang) * ra)}" x2="${F(960 + Math.cos(ang) * (ra + comp))}" y2="${F(520 + Math.sin(ang) * (ra + comp))}" stroke="${r2() < 0.3 ? COR.ouro : '#cfe2ff'}" stroke-width="${F(1 + 2 * d0)}" opacity="${F(0.15 + 0.5 * d0 * clamp(vel / 2))}" stroke-linecap="round"/>`;
  }
  s += op(ida, aneis);
  // relógio central girando para trás, cada vez mais rápido
  const giro = -(L * 90 + 1500 * ease.in(inv(1.2, 5.0, L)));
  const kr = ease.back(inv(0.3, 1.0, L)) * (1 - 0.35 * ease.inOut(inv(5.2, 6.3, L)));
  s += g(`translate(960 520) scale(${F(kr)})`, `<circle r="150" fill="rgba(7,17,42,.7)" stroke="${COR.ouro}" stroke-width="4"/>`
    + Array.from({ length: 12 }, (_, i) => { const a = i * TAU / 12; return `<line x1="${F(Math.cos(a) * 128)}" y1="${F(Math.sin(a) * 128)}" x2="${F(Math.cos(a) * 140)}" y2="${F(Math.sin(a) * 140)}" stroke="${COR.ouro}" stroke-width="${i % 3 ? 2 : 4}"/>`; }).join('')
    + `<line x1="0" y1="0" x2="0" y2="-100" stroke="#fff" stroke-width="7" stroke-linecap="round" transform="rotate(${F(giro)})"/>`
    + `<line x1="0" y1="0" x2="0" y2="-70" stroke="${COR.ouro}" stroke-width="9" stroke-linecap="round" transform="rotate(${F(giro / 12)})"/><circle r="10" fill="#fff"/>`
    + op(clamp(vel - 1.2), `<path d="M-180 -40 A190 190 0 0 1 -60 -175" stroke="${COR.ouro}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-60 -175 l-6 26 l24 -12 Z" fill="${COR.ouro}" transform="rotate(-20 -60 -175)"/>`));
  // páginas do calendário voando para trás
  const r3 = rng(9);
  for (let j = 0; j < 10; j++) {
    const t1 = 1.4 + j * 0.32, q = inv(t1, t1 + 1.1, L);
    if (q <= 0 || q >= 1) { r3(); r3(); continue; }
    const ang = r3() * TAU, d = 180 + q * 900;
    s += g(`translate(${F(960 + Math.cos(ang) * d)} ${F(520 + Math.sin(ang) * d * 0.7)}) rotate(${F(q * 260 * (r3() - 0.5))}) scale(${F(0.6 + q * 0.9)})`,
      op(1 - q, `<rect x="-34" y="-40" width="68" height="80" rx="6" fill="#f4ede0"/><rect x="-34" y="-40" width="68" height="20" rx="6" fill="${COR.vermelho}"/><rect x="-22" y="-6" width="44" height="6" rx="3" fill="#b8ad98"/><rect x="-22" y="8" width="30" height="6" rx="3" fill="#b8ad98"/>`));
  }
  // passagem para o passado: tom sépia + clarão controlado
  s += op(sepia * 0.55, `<rect width="${W}" height="${H}" fill="#7a5a2a" style="mix-blend-mode:color"/>`);
  s += op(sepia * 0.25, `<rect width="${W}" height="${H}" fill="#3a2a12"/>`);
  const flash = Math.sin(clamp(inv(5.1, 5.7, L)) * Math.PI);
  s += op(flash * 0.55, `<circle cx="960" cy="520" r="700" fill="url(#azLuzOuro)"/>`);
  // título do ato
  const kt = ease.out(inv(5.3, 6.0, L));
  s += op(kt, T('ATO 2', 960, 470, 20, { w: 800, fill: COR.ouro, ls: 8 }) + T('Como tudo começou', 960, 545 + 12 * (1 - kt), 64, { w: 500, fill: '#fff' }));
  s += `<rect width="${W}" height="${H}" fill="url(#azVinheta)"/>`;
  return s;
}

// ------------------------------------------------------------------ CENA 4 · o desafio (ERP)
const NOS = [
  { r: 'PROCESSOS', a: -90 }, { r: 'PESSOAS', a: -30 }, { r: 'INTEGRAÇÕES', a: 30 }, { r: 'PRAZOS', a: 90 }, { r: 'RISCOS', a: 150 }, { r: 'MUDANÇA', a: 210 },
];
function desafio(L, t) {
  let s = fundo(t);
  const t0 = t - L;
  const quando = [palavra('p8', 0), palavra('p8', 1), palavra('p8', 2), palavra('p8', 3), palavra('p8', 5), palavra('p7', 9)].map(x => x - t0);
  const juntos = palavra('p8', 6) - t0, erp = palavra('p7', 6) - t0, complex = palavra('p7', 9) - t0;
  // quadro
  const bx = 330, by = 130, bw = 1260, bh = 600;
  const kq = ease.out(inv(0.1, 0.6, L));
  s += op(kq, g(tr(0, 20 * (1 - kq)), vidro(bx, by, bw, bh, { r: 26 }) + `<rect x="${bx + 34}" y="${by + 44}" width="34" height="2.5" fill="${COR.ouro}"/>` + T('IMPLANTAÇÃO DE ERP', bx + 82, by + 52, 22, { w: 800, fill: '#d6e2f8', anchor: 'start', ls: 5 })));
  const cx = 960, cy = by + bh / 2 + 22, R = 225;
  const alinha = ease.inOut(inv(juntos - 0.2, juntos + 0.9, L));
  const giro = 60 * ease.inOut(inv(juntos, juntos + 2.2, L));
  // caos: linhas emaranhadas e tremor, entre "complexidade" e "juntos"
  const caos = ease.out(inv(complex - 0.3, complex + 0.4, L)) * (1 - alinha);
  if (caos > 0.01) {
    const r = rng(17); let d = '';
    for (let j = 0; j < 9; j++) {
      const p = () => [cx + (r() - 0.5) * 900, cy + (r() - 0.5) * 420];
      const [a, b, c, e] = [p(), p(), p(), p()];
      d += `<path d="M${F(a[0])} ${F(a[1])} C${F(b[0] + 30 * Math.sin(L * 3 + j))} ${F(b[1])} ${F(c[0])} ${F(c[1] + 30 * Math.cos(L * 3 + j))} ${F(e[0])} ${F(e[1])}" stroke="${j % 2 ? COR.vermelho : COR.laranja}" stroke-width="2.5" fill="none" opacity=".55"/>`;
    }
    s += op(caos, d);
  }
  const tremor = caos * 4;
  // nós
  NOS.forEach((n, i) => {
    const ap = ease.back(inv(quando[i] - 0.15, quando[i] + 0.35, L));
    if (ap <= 0) return;
    const a = (n.a + giro) * Math.PI / 180;
    const rr = R * lerp(1.0, 1.0, alinha);
    const x = cx + Math.cos(a) * rr * 1.55 + tremor * Math.sin(L * 23 + i), y = cy + Math.sin(a) * rr * 0.92 + tremor * Math.cos(L * 19 + i * 2);
    const pulso = Math.sin(clamp(inv(quando[i], quando[i] + 0.8, L)) * Math.PI);
    const cor = alinha > 0.5 ? COR.verde : (i === 4 ? COR.vermelho : COR.azulClaro);
    s += `<line x1="${cx}" y1="${cy}" x2="${F(lerp(cx, x, ap))}" y2="${F(lerp(cy, y, ap))}" stroke="${cor}" stroke-width="${F(2.5 + alinha * 2)}" opacity="${F(0.55 + 0.35 * alinha)}" ${alinha > 0.2 ? '' : 'stroke-dasharray="8 8"'}/>`;
    // pacote de luz correndo na linha quando alinhados
    if (alinha > 0.3) { const q = (L * 0.9 + i * 0.17) % 1; s += `<circle cx="${F(lerp(cx, x, q))}" cy="${F(lerp(cy, y, q))}" r="5" fill="#fff" opacity="${F(alinha)}"/>`; }
    s += g(`translate(${F(x)} ${F(y)}) scale(${F(ap)})`, `<circle r="${F(46 + 26 * pulso)}" fill="none" stroke="${cor}" stroke-width="3" opacity="${F(pulso * 0.8)}"/>`
      + `<circle r="38" fill="${cor === COR.verde ? 'rgba(60,207,145,.18)' : 'rgba(59,130,246,.22)'}" stroke="${cor}" stroke-width="3"/>`
      + iconeNo(i, cor) + pilulaRotulo(n.r, 0, 70, cor));
  });
  // anel que une tudo quando "avançam juntos"
  if (alinha > 0) s += `<ellipse cx="${cx}" cy="${cy}" rx="${F(R * 1.55)}" ry="${F(R * 0.92)}" fill="none" stroke="${COR.verde}" stroke-width="3" stroke-dasharray="${F(alinha * 1800)} 3000" opacity=".75"/>`;
  // ERP no centro
  const ke = ease.back(inv(erp - 0.3, erp + 0.2, L)) || ease.back(inv(0.4, 0.9, L)) * 0.9;
  const pe = 1 + 0.06 * Math.sin(L * 4);
  s += g(`translate(${cx} ${cy}) scale(${F(Math.max(ke, ease.back(inv(0.4, 0.9, L)) * 0.9) * pe)})`, `<circle r="82" fill="${COR.azul}" opacity=".35" filter="url(#azBrilho)"/><circle r="66" fill="#1f5fe0" stroke="#9cc6ff" stroke-width="3"/>` + T('ERP', 0, 16, 46, { w: 900, fill: '#fff' }));
  // pessoas que vivem a implantação (inteiras, com mais luz)
  const hp = 420;
  const e1 = entra(L, 0.3, 0.7), e2 = entra(L, 0.5, 0.7);
  s += g(tr(-260 * (1 - e1), 0), pessoa('bruno', 40 + largPessoa('bruno', hp) / 2, H, hp, L, { fase: 0.5 }));
  s += g(tr(260 * (1 - e2), 0), pessoa('pedro', 1880 - largPessoa('pedro', hp) / 2, H, hp, L, { fase: 1.7, halo: '#f08a2c' }));
  // reação: "!" quando surge o caos e "✓" quando alinha
  if (caos > 0.2) s += op(caos, T('!', 40 + largPessoa('bruno', hp) / 2 + 90, H - hp + 20 - 8 * Math.abs(Math.sin(L * 6)), 70, { w: 900, fill: COR.ouro }));
  if (alinha > 0.3) s += op(alinha, g(`translate(${F(1880 - largPessoa('pedro', hp) / 2 - 110)} ${F(H - hp + 10)}) scale(${F(ease.back(alinha))})`, `<circle r="26" fill="${COR.verde}"/><path d="M-11 0 l7 8 l15 -16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`));
  return s + `<rect width="${W}" height="${H}" fill="url(#azVinheta)"/>`;
}
function pilulaRotulo(txt, x, y, cor) {
  const w = larg(txt, 21, 800) + 30;
  return `<rect x="${F(x - w / 2)}" y="${y - 19}" width="${F(w)}" height="38" rx="19" fill="rgba(7,17,42,.85)" stroke="${cor}" stroke-width="1.5"/>` + T(txt, x, y + 7, 21, { w: 800, fill: '#fff', ls: 1 });
}
function iconeNo(i, cor) {
  const st = `stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (i) {
    case 0: return `<path d="M-14 -10 h20 l8 10 l-8 10 h-20 l8 -10 Z" ${st}/>`;
    case 1: return `<circle cx="-7" cy="-6" r="6" ${st}/><circle cx="9" cy="-4" r="5" ${st}/><path d="M-18 13 q11 -14 22 0 M3 12 q8 -10 16 0" ${st}/>`;
    case 2: return `<rect x="-17" y="-6" width="14" height="12" rx="3" ${st}/><rect x="3" y="-6" width="14" height="12" rx="3" ${st}/><path d="M-3 0 h6" ${st}/>`;
    case 3: return `<circle r="14" ${st}/><path d="M0 -8 v8 l6 5" ${st}/>`;
    case 4: return `<path d="M0 -15 L16 12 H-16 Z" ${st}/><path d="M0 -4 v7 M0 8 v1" ${st}/>`;
    default: return `<path d="M-14 4 a14 14 0 0 1 26 -8 M14 -4 a14 14 0 0 1 -26 8" ${st}/><path d="M12 -12 v8 h-8 M-12 12 v-8 h8" ${st}/>`;
  }
}

// ------------------------------------------------------------------ CENA 5 · o farol A&M
function farol(L, t) {
  let s = fundo(t, { bokeh: 0.6 });
  const t0 = t - L;
  const chama = palavra('p9', 11) - t0;   // "chamar"
  const sabe = palavra('p9', 13) - t0;
  const liga = ease.out(inv(chama - 1.4, chama - 0.6, L));
  const proj = ease.inOut(inv(chama - 0.6, chama + 0.6, L));
  s += cidade(t, 900, { k: 0.9, acende: 0.4 + 1.2 * proj, foco: 960 });
  // prédio do farol com a placa A&M
  s += `<path d="M860 900 L880 760 L1040 760 L1060 900 Z" fill="#14305e" stroke="rgba(255,255,255,.15)"/>` + `<rect x="900" y="782" width="120" height="70" rx="10" fill="rgba(7,17,42,.85)" stroke="rgba(255,255,255,.25)"/>` + logoImg('alvarez-marsal-branco', 960, 816, 48, 90);
  // projetor
  s += `<rect x="925" y="724" width="70" height="40" rx="10" fill="#1b3a6c" stroke="#8fb4ea" stroke-width="2"/><circle cx="960" cy="724" r="22" fill="#fff4c9" opacity="${F(0.35 + 0.65 * liga)}"/>`;
  s += op(liga, `<circle cx="960" cy="724" r="70" fill="url(#azLuzOuro)"/>`);
  // feixe (cone com gradiente; sem estourar a tela)
  const ang = lerp(-38, -4, proj) + 2 * Math.sin(L * 1.3) * (1 - proj);
  const alvo = { x: 960 + Math.sin(ang * Math.PI / 180) * 600, y: 724 - Math.cos(ang * Math.PI / 180) * 520 };
  s += op(liga * 0.9, g(`rotate(${F(ang)} 960 724)`, `<path d="M942 724 L978 724 L1150 180 L770 180 Z" fill="url(#azFeixe)"/>`));
  // poeira no feixe
  const r = rng(4);
  for (let j = 0; j < 40; j++) { const q = (r() + L * 0.1) % 1; const yy = 724 - q * 540, xx = 960 + (r() - 0.5) * (40 + q * 340); s += op(liga * 0.6, g(`rotate(${F(ang)} 960 724)`, `<circle cx="${F(xx)}" cy="${F(yy)}" r="${F(1 + r() * 1.8)}" fill="#fff8e0" opacity="${F(0.3 + 0.4 * Math.sin(L * 3 + j))}"/>`)); }
  // nuvem e a marca projetada: nítida, com brilho contido (no original o branco estourava)
  const nv = op(0.85, `<ellipse cx="${F(alvo.x)}" cy="${F(alvo.y + 10)}" rx="300" ry="95" fill="#2b4d86" opacity=".55" filter="url(#azBrilho)"/>`);
  s += nv;
  if (proj > 0) {
    const k = ease.back(inv(chama - 0.2, chama + 0.5, L)) * (1 + 0.04 * Math.sin(L * 3));
    s += op(proj, `<ellipse cx="${F(alvo.x)}" cy="${F(alvo.y)}" rx="240" ry="120" fill="#fff1c4" opacity=".16" filter="url(#azBrilho)"/>`);
    s += g(`translate(${F(alvo.x)} ${F(alvo.y)}) scale(${F(k)})`, `<circle r="104" fill="none" stroke="#ffe3a0" stroke-width="3" opacity=".7"/>` + logoImg('alvarez-marsal-branco', 0, -4, 120, 170));
    const kq = ease.out(inv(sabe - 0.2, sabe + 0.4, L));
    s += op(kq, pilula('QUEM SABE', alvo.x, alvo.y + 150, { fill: COR.laranja, size: 22, ls: 3 }));
  }
  return s + `<rect width="${W}" height="${H}" fill="url(#azVinheta)"/>`;
}

// ------------------------------------------------------------------ CENA 6 · a união
function aperto(u) {
  // aperto de mãos visto de frente: a mão direita da TOTVS (manga azul, vem da esquerda) e a mão direita da
  // A&M (manga laranja, vem da direita); os dedos da A&M envolvem a mão da TOTVS e o polegar da TOTVS fica por cima
  const ink = 'stroke="#0b1a38" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';
  const d = 26 * (1 - u);
  return g(`translate(${F(-d)} 0)`, `<path d="M-168 74 L-122 112 L-66 48 L-108 14 Z" fill="${COR.azul}" ${ink}/>`
      + `<path d="M-104 16 C-80 -14 -40 -30 6 -26 L58 -14 C72 -10 72 8 58 10 L14 14 C-14 40 -46 54 -70 46 Z" fill="#f2c9a0" ${ink}/>`)
    + g(`translate(${F(d)} 0)`, `<path d="M168 74 L122 112 L66 48 L108 14 Z" fill="${COR.laranja}" ${ink}/>`
      + `<path d="M104 16 C76 -10 44 -18 14 -10 C-10 -4 -30 2 -38 14 C-44 28 -30 36 -16 32 L4 28 C24 46 54 56 70 46 Z" fill="#e6b48a" ${ink}/>`
      + `<path d="M-30 6 Q-38 18 -28 30 M-14 0 Q-22 16 -12 32 M2 -4 Q-6 14 4 32" stroke="#0b1a38" stroke-width="2.5" fill="none" opacity=".55" stroke-linecap="round"/>`)
    + g(`translate(${F(-d)} 0)`, `<path d="M-4 -24 C6 -44 30 -46 36 -34 C40 -26 28 -20 12 -18 Z" fill="#f2c9a0" ${ink}/>`);
}
function uniao(L, t, dur) {
  let s = fundo(t);
  const t0 = t - L;
  const tTotvs = palavra('p10', 0) - t0, tAm = palavra('p10', 3) - t0, tComp = palavra('p11', 0) - t0, tUnidas = palavra('p11', 2) - t0;
  const hm = 520, ha = 600;
  const em = entra(L, 0.1, 0.7), ea = entra(L, 0.25, 0.7);
  const aprox = ease.inOut(inv(tComp - 0.3, tUnidas, L));
  const xm = 60 + largPessoa('modulo', hm) / 2 + 40 + 60 * aprox, xa = 1880 - largPessoa('antonialli', ha) / 2 - 60 * aprox;
  // energia: azul (TOTVS) da esquerda, laranja (A&M) da direita, até o centro
  const fa = ease.out(inv(tTotvs, tTotvs + 1.2, L)), fb = ease.out(inv(tAm, tAm + 1.2, L));
  const onda = (x0, x1, y, k, cor, f, ph) => {
    let d = `M${x0} ${y}`;
    for (let i = 1; i <= 40; i++) { const u = i / 40; const x = lerp(x0, x1, u * f); d += ` L${F(x)} ${F(y + Math.sin(u * 9 + L * 4 + ph) * 26 * (1 - u * 0.7) * k)}`; }
    return `<path d="${d}" stroke="${cor}" stroke-width="10" fill="none" opacity=".35" filter="url(#azBrilhoP)"/><path d="${d}" stroke="${cor}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  };
  s += op(clamp(fa * 3), onda(0, 960, 640, 1, COR.azulClaro, fa, 0) + onda(0, 960, 668, 0.6, COR.azul, fa, 1.4));
  s += op(clamp(fb * 3), onda(1920, 960, 640, 1, '#ffb36b', fb, 2) + onda(1920, 960, 668, 0.6, COR.laranja, fb, 3.1));
  // personagens
  s += g(tr(-360 * (1 - em), 0), pessoa('modulo', xm, 1040 + 6 * Math.sin(L * 2.2), hm, L, { halo: COR.azul }));
  s += g(tr(380 * (1 - ea), 0), pessoa('antonialli', xa, H, ha, L, { halo: COR.laranja, fase: 1.1 }));
  // rótulos
  const k1 = entra(L, tTotvs - 0.1, 0.45), k2 = entra(L, tAm - 0.1, 0.45);
  s += op(clamp(k1), g(`translate(${F(xm)} 230) scale(${F(k1)})`, pilula('TOTVS · SOLUÇÃO', 0, 0, { fill: '#1d5bd8', size: 22, ls: 2.5 })));
  s += op(clamp(k2), g(`translate(${F(xa)} 230) scale(${F(k2)})`, pilula('A&M · GESTÃO DA TRANSFORMAÇÃO', 0, 0, { fill: COR.laranja, size: 22, ls: 2.5 })));
  // encontro: explosão de luz e o aperto de mãos (direita com direita) no emblema central
  const enc = inv(tComp - 0.2, tComp + 0.3, L);
  if (enc > 0) {
    const burst = Math.sin(clamp(inv(tComp - 0.2, tComp + 0.6, L)) * Math.PI);
    s += op(burst * 0.7, `<circle cx="960" cy="650" r="${F(120 + 260 * clamp(enc))}" fill="url(#azLuz)"/>`);
    const r = rng(8);
    for (let j = 0; j < 26; j++) { const q = inv(tComp - 0.1, tComp + 1.0, L); if (q <= 0 || q >= 1) break; const a = r() * TAU, d = 40 + q * (160 + r() * 200); s += `<circle cx="${F(960 + Math.cos(a) * d)}" cy="${F(650 + Math.sin(a) * d * 0.7)}" r="${F(2 + r() * 3)}" fill="${j % 2 ? COR.ouro : '#fff'}" opacity="${F(1 - q)}"/>`; }
    const ke = ease.back(inv(tComp, tComp + 0.5, L)), aperta = ease.inOut(inv(tUnidas - 0.3, tUnidas + 0.3, L));
    const pul = 1 + 0.05 * Math.sin(clamp(inv(tUnidas, tUnidas + 0.6, L)) * Math.PI);
    // duas mãos direitas: a da TOTVS vem da esquerda, a da A&M (espelhada e de ponta-cabeça = direita do outro lado)
    s += g(`translate(960 650) scale(${F(ke * pul * 1.25)})`,
      `<circle r="118" fill="rgba(7,17,42,.82)" stroke="url(#azBarra)" stroke-width="5"/>`
      + `<path d="M0 -118 A118 118 0 0 0 0 118" fill="none" stroke="${COR.azulClaro}" stroke-width="5"/><path d="M0 -118 A118 118 0 0 1 0 118" fill="none" stroke="${COR.laranja}" stroke-width="5"/>`
      + g('scale(.78)', aperto(aperta)));
    const kc = ease.out(inv(tComp + 0.2, tComp + 0.7, L));
    s += op(kc, g(tr(0, 14 * (1 - kc)), pilula('PAPÉIS COMPLEMENTARES', 960, 470, { fill: 'rgba(8,20,48,.75)', stroke: 'rgba(255,255,255,.25)', size: 26, ls: 2 })));
  }
  // fim: escurece para o azul da cena seguinte do original
  s += op(ease.inOut(inv(dur - 0.5, dur, L)), `<rect width="${W}" height="${H}" fill="#163566"/>`);
  return s + `<rect width="${W}" height="${H}" fill="url(#azVinheta)" opacity=".6"/>`;
}

// ------------------------------------------------------------------ montagem
const CENAS = { capa, resultados, tunel, desafio, farol, uniao };
const TRANS = 0.45;

export function quadro(t) {
  const cs = J.cenas;
  let i = cs.findIndex(c => t >= c.de && t < c.ate); if (i < 0) i = cs.length - 1;
  const c = cs[i], L = t - c.de, dur = c.ate - c.de;
  let s = CENAS[c.id](L, t, dur);
  // transição: a próxima cena entra com zoom e desfoque leve nos últimos TRANS s
  const prox = cs[i + 1];
  if (prox && t > c.ate - TRANS && c.id !== 'resultados') {
    const u = ease.inOut(inv(c.ate - TRANS, c.ate, t));
    s += op(u, g(`translate(960 540) scale(${F(lerp(1.06, 1, u))}) translate(-960 -540)`, CENAS[prox.id](t - prox.de, t, prox.ate - prox.de)));
  }
  if (prox && c.id === 'resultados' && t > c.ate - 0.9) {
    // o mural encolhe para dentro do túnel
    const u = ease.inOut(inv(c.ate - 0.9, c.ate, t));
    s = g(`translate(960 520) scale(${F(lerp(1, 0.25, u))}) translate(-960 -520)`, s);
    s = CENAS.tunel(t - prox.de, t, prox.ate - prox.de) + op(1 - u * 0.9, s);
  }
  const cenaChrome = (prox && t > c.ate - TRANS / 2) ? prox.id : c.id;
  return s + chrome(t, cenaChrome) + legenda(t);
}
