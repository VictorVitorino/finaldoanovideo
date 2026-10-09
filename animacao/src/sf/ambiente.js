// Ambiente e "chrome" no estilo do explainer SpecForge, com a marca A&M + TOTVS.
// Funções puras do tempo que devolvem SVG em coordenadas de tela 1920x1080.
// defs() entra uma vez por quadro; os ids começam com "sf" para não colidir.
import { tr, g, op, clamp, lerp, inv, ease, rng, text, measure, n2, esc, C, TAU } from '../core.js';
import { logo, logoSize } from '../assets.js';

const W = 1920, H = 1080;
const INK = '#2b2b36';
const AMBAR = '#f2b84b';

// ---------- paleta ----------
export const BLOB = {
  teal: '#9dd2cf', rosa: '#f3b6cc', amarelo: '#f6d684', verde: '#b4dca4',
  lilas: '#cbbaf0', azul: '#a7c6f2', pessego: '#f7c19e',
};
// versões saturadas para o papel noite (viram brilho frio)
const BLOB_NOITE = { teal: '#1fb3c8', rosa: '#c94b98', amarelo: '#d9a43a', verde: '#3fae7c', lilas: '#7b62e0', azul: '#3a72ea', pessego: '#d9775a' };
const RABISCO = ['#a98ee0', '#ee93b8', '#7cc7c4', '#f0be5e', '#8fb3ee'];
const RABISCO_NOITE = ['#6f8fe8', '#5fc3d8', '#8a7be0', '#9fb8ff'];

const TONS = {
  creme: { base: '#f2eadc', luz: '#f9f4ea', borda: '#c4b8a2', linha: 'rgba(105,85,55,.11)', fina: 'rgba(105,85,55,.045)', mancha: '#8a6a3a', rab: RABISCO, rabOp: 0.42 },
  bege: { base: '#eddfc4', luz: '#f6ecd8', borda: '#bfa985', linha: 'rgba(105,80,40,.09)', fina: 'rgba(105,80,40,.045)', mancha: '#8a6530', rab: RABISCO, rabOp: 0.34 },
  dourado: { base: '#f0dcae', luz: '#f9ecca', borda: '#c9a568', linha: 'rgba(120,85,25,.09)', fina: 'rgba(120,85,25,.045)', mancha: '#9a6a1a', rab: RABISCO, rabOp: 0.36 },
  noite: { base: '#141b36', luz: '#24315f', borda: '#070b19', linha: 'rgba(150,180,255,.095)', fina: 'rgba(150,180,255,.045)', mancha: '#000000', rab: RABISCO_NOITE, rabOp: 0.22 },
  cartao: { base: '#f8f3e9', luz: '#fdfaf3', borda: '#d9cdb6', linha: 'rgba(105,85,55,.10)', fina: 'rgba(105,85,55,.035)', mancha: '#8a6a3a', rab: RABISCO, rabOp: 0.3 },
};

// ---------- defs ----------
function grade(id, T, extra = '') {
  let d = `<pattern id="${id}" patternUnits="userSpaceOnUse" width="240" height="240"${extra}>`;
  for (let k = 1; k < 5; k++) d += `<path d="M${k * 48} 0V240M0 ${k * 48}H240" stroke="${T.fina}" stroke-width="1.2"/>`;
  d += `<path d="M0 0V240M0 0H240" stroke="${T.linha}" stroke-width="2.4"/></pattern>`;
  return d;
}

export function defs() {
  let d = '';
  for (const [nome, T] of Object.entries(TONS)) {
    const id = nome[0].toUpperCase() + nome.slice(1);
    d += grade('sfGrade' + id, T, nome === 'cartao' ? ' patternTransform="skewX(-9)"' : '');
    d += `<radialGradient id="sfLuz${id}" cx="50%" cy="46%" r="62%"><stop offset="0" stop-color="${T.luz}"/><stop offset=".55" stop-color="${T.base}"/><stop offset="1" stop-color="${T.borda}"/></radialGradient>`;
  }
  // manchas grandes do papel (bem leves) e fibras
  d += `<filter id="sfMancha" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".0045 .006" numOctaves="3" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -.62"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
  d += `<filter id="sfFibra" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".9 .22" numOctaves="1" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.2 0 0 0 -1.25"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
  // aquarela dos blobs: grão + borda irregular
  d += `<filter id="sfAqua" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="3" result="gr"/>
<feColorMatrix in="gr" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.5 0 0 0 1.62" result="ga"/>
<feComposite in="SourceGraphic" in2="ga" operator="in" result="gs"/>
<feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="2" seed="8" result="dm"/>
<feDisplacementMap in="gs" in2="dm" scale="22" xChannelSelector="R" yChannelSelector="G" result="dd"/>
<feGaussianBlur in="dd" stdDeviation=".7"/></filter>`;
  d += `<filter id="sfBorra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>`;
  d += `<filter id="sfBrilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>`;
  d += `<radialGradient id="sfVinheta" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="#3a2a10" stop-opacity="0"/><stop offset="1" stop-color="#3a2a10" stop-opacity=".16"/></radialGradient>`;
  d += `<radialGradient id="sfVinhetaNoite" cx="50%" cy="48%" r="72%"><stop offset=".5" stop-color="#02040c" stop-opacity="0"/><stop offset="1" stop-color="#02040c" stop-opacity=".55"/></radialGradient>`;
  d += `<radialGradient id="sfFrio" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#5b8cff" stop-opacity=".55"/><stop offset="1" stop-color="#5b8cff" stop-opacity="0"/></radialGradient>`;
  d += `<radialGradient id="sfCiano" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2fd0e6" stop-opacity=".45"/><stop offset="1" stop-color="#2fd0e6" stop-opacity="0"/></radialGradient>`;
  // faixa da transição e fechamento
  d += `<linearGradient id="sfFaixa" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="#0b5ed7"/><stop offset="1" stop-color="#1f6fd6"/></linearGradient>`;
  d += `<linearGradient id="sfFaixaBrilho" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".13"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  d += `<radialGradient id="sfPalcoLuz" cx="50%" cy="8%" r="80%"><stop offset="0" stop-color="#fff7de" stop-opacity=".95"/><stop offset=".55" stop-color="#fff2cf" stop-opacity=".25"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient>`;
  d += `<linearGradient id="sfFacho" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0" stop-opacity=".55"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></linearGradient>`;
  return d;
}

// ---------- utilidades ----------
// curva fechada suave (Catmull-Rom → Bézier)
function fechada(P) {
  const n = P.length;
  let d = `M${n2(P[0][0])} ${n2(P[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    d += `C${n2(p1[0] + (p2[0] - p0[0]) / 6)} ${n2(p1[1] + (p2[1] - p0[1]) / 6)} ${n2(p2[0] - (p3[0] - p1[0]) / 6)} ${n2(p2[1] - (p3[1] - p1[1]) / 6)} ${n2(p2[0])} ${n2(p2[1])}`;
  }
  return d + 'Z';
}

// estrela de 4 pontas (faísca)
const faiscaPath = s => `M0 ${n2(-s)}Q${n2(s * 0.12)} ${n2(-s * 0.12)} ${n2(s)} 0Q${n2(s * 0.12)} ${n2(s * 0.12)} 0 ${n2(s)}Q${n2(-s * 0.12)} ${n2(s * 0.12)} ${n2(-s)} 0Q${n2(-s * 0.12)} ${n2(-s * 0.12)} 0 ${n2(-s)}Z`;
// "explosãozinha" de 4 traços (como nos cartões do SpecForge)
export function faisca(x, y, s, cor, rot = 45) {
  let d = '';
  for (let k = 0; k < 4; k++) { const a = (rot + k * 90) * Math.PI / 180; d += `M${n2(Math.cos(a) * s * 0.35)} ${n2(Math.sin(a) * s * 0.35)}L${n2(Math.cos(a) * s)} ${n2(Math.sin(a) * s)}`; }
  return `<path transform="${tr(x, y)}" d="${d}" stroke="${cor}" stroke-width="${n2(Math.max(2, s * 0.22))}" stroke-linecap="round" fill="none"/>`;
}

function rabisco(tipo, s, cor, sw) {
  const st = `stroke="${cor}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  if (tipo === 0) return `<path d="${faiscaPath(s)}" ${st}/>`;
  if (tipo === 1) return `<path d="M0 ${n2(-s)}L${n2(s * 0.9)} ${n2(s * 0.6)}L${n2(-s * 0.9)} ${n2(s * 0.6)}Z" ${st}/>`;
  if (tipo === 2) return `<circle r="${n2(s * 0.8)}" ${st}/>`;
  if (tipo === 3) return `<path d="M${n2(-s * 0.7)} 0H${n2(s * 0.7)}M0 ${n2(-s * 0.7)}V${n2(s * 0.7)}" ${st}/>`;
  if (tipo === 4) return `<path d="M${n2(-s * 0.6)} ${n2(-s * 0.6)}L${n2(s * 0.6)} ${n2(s * 0.6)}M${n2(s * 0.6)} ${n2(-s * 0.6)}L${n2(-s * 0.6)} ${n2(s * 0.6)}" ${st}/>`;
  const a = s * 0.55;
  return `<path d="M${n2(-s * 1.1)} 0q${n2(a / 2)} ${n2(-a)} ${n2(a)} 0t${n2(a)} 0t${n2(a)} 0t${n2(a)} 0" ${st}/>`;
}

// ---------- papel ----------
// Manchas do papel: ruído de valor gerado uma vez num canvas (determinístico) e posto no <defs> fixo
// da página; o feTurbulence em tela cheia custava ~90 ms por quadro. Sem documento, cai no filtro.
let _textura = null;
function texturaPapel() {
  if (_textura !== null) return _textura;
  _textura = false;
  const fixo = typeof document !== 'undefined' && document.getElementById('defs');
  if (!fixo) return false;
  const w = 480, h = 270, R = rng(11);
  const oitavas = [[7, 0.55], [14, 0.3], [28, 0.15]].map(([nx, p]) => {
    const ny = Math.ceil(nx * h / w) + 1, L = Array.from({ length: (nx + 1) * ny }, R);
    return { nx, ny, p, L };
  });
  const sm = u => u * u * (3 - 2 * u);
  const img = (cor) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d'), d = cx.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = 0;
      for (const O of oitavas) {
        const fx = x / w * O.nx, fy = y / w * O.nx, ix = Math.floor(fx), iy = Math.floor(fy), ux = sm(fx - ix), uy = sm(fy - iy);
        const at = (i, j) => O.L[j * (O.nx + 1) + i];
        v += O.p * lerp(lerp(at(ix, iy), at(ix + 1, iy), ux), lerp(at(ix, iy + 1), at(ix + 1, iy + 1), ux), uy);
      }
      const k = (y * w + x) * 4;
      d.data[k] = cor[0]; d.data[k + 1] = cor[1]; d.data[k + 2] = cor[2];
      d.data[k + 3] = 255 * clamp((v - 0.42) * 2.6);
    }
    cx.putImageData(d, 0, 0);
    return cv.toDataURL('image/png');
  };
  fixo.insertAdjacentHTML('beforeend',
    `<image id="sfManchaImgC" href="${img([122, 90, 42])}" width="${W}" height="${H}" preserveAspectRatio="none"/>` +
    `<image id="sfManchaImgE" href="${img([0, 0, 0])}" width="${W}" height="${H}" preserveAspectRatio="none"/>`);
  return (_textura = true);
}

// o: tom ('creme'|'bege'|'dourado'|'noite'|'cartao'), seed, px/py (paralaxe da grade e rabiscos),
//    rabiscos (qtde, padrão 16; 0 desliga), textura (false desliga manchas/grão), vinheta (false desliga)
export function papel(t, o = {}) {
  const tom = TONS[o.tom] ? o.tom : 'creme';
  const T = TONS[tom], id = tom[0].toUpperCase() + tom.slice(1);
  const px = o.px ?? 0, py = o.py ?? 0;
  const noite = tom === 'noite';
  let s = `<rect width="${W}" height="${H}" fill="url(#sfLuz${id})"/>`;
  if (o.textura !== false) {
    s += texturaPapel()
      ? `<use href="#sfManchaImg${noite ? 'E' : 'C'}" opacity="${noite ? 0.45 : 0.065}"/>`
      : `<rect width="${W}" height="${H}" fill="${T.mancha}" filter="url(#sfMancha)" opacity="${noite ? 0.35 : 0.045}"/>`;
  }
  if (noite) {
    // brilhos frios que respiram devagar
    const L = [[420, 300, 520, 0], [1520, 260, 460, 1.7], [1180, 820, 560, 3.1]];
    for (const [x, y, r, f] of L) {
      const k = 0.75 + 0.25 * Math.sin(t * 0.45 + f);
      s += `<ellipse cx="${n2(x + 30 * Math.sin(t * 0.17 + f))}" cy="${n2(y)}" rx="${n2(r)}" ry="${n2(r * 0.7)}" fill="url(#${f > 2 ? 'sfCiano' : 'sfFrio'})" opacity="${n2(0.32 * k)}"/>`;
    }
  }
  const gx = ((px % 240) + 240) % 240 - 240, gy = ((py % 240) + 240) % 240 - 240;
  s += `<rect x="${n2(gx)}" y="${n2(gy)}" width="${W + 480}" height="${H + 480}" fill="url(#sfGrade${id})"/>`;
  // rabiscos decorativos bem apagados
  const nR = o.rabiscos ?? 16;
  if (nR) {
    const R = rng(o.seed ?? 7);
    let r = '';
    const cols = 6, rows = Math.ceil(nR / cols);
    for (let i = 0; i < nR; i++) {
      // espalha por células para não embolar
      const cx = ((i % cols) + 0.15 + R() * 0.7) * (W + 160) / cols - 80;
      const cy = (Math.floor(i / cols) + 0.15 + R() * 0.7) * (H + 80) / rows - 40;
      const tipo = Math.floor(R() * 6), sz = 12 + R() * 14, rot = R() * 360, ph = R() * TAU;
      const cor = T.rab[Math.floor(R() * T.rab.length)];
      const dx = 6 * Math.sin(t * 0.25 + ph), dy = 5 * Math.cos(t * 0.21 + ph);
      r += g(tr(cx + dx + px * 0.6, cy + dy + py * 0.6, 1, rot + 8 * Math.sin(t * 0.3 + ph)), rabisco(tipo, sz, cor, 3.4));
    }
    s += op(T.rabOp, r);
  }
  if (o.textura !== false && !noite) s += `<rect width="${W}" height="${H}" fill="url(#grain)" opacity=".22"/>`;
  if (o.vinheta !== false) s += `<rect width="${W}" height="${H}" fill="url(#${noite ? 'sfVinhetaNoite' : 'sfVinheta'})"/>`;
  return s;
}

// ---------- blob ----------
// o: op (opacidade, padrão .62), sy (achatamento), rot, pontos (padrão 7), resp (amplitude da respiração), noite (true = mais apagado)
export function blob(x, y, r, cor, t, seed = 1, o = {}) {
  const c = (o.noite ? BLOB_NOITE[cor] : BLOB[cor]) ?? cor;
  const R = rng(seed * 7919 + 13);
  const n = o.pontos ?? 7, sy = o.sy ?? 0.9, rot = (o.rot ?? R() * 360) * Math.PI / 180;
  const amp = o.resp ?? 1;
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU + (R() - 0.5) * 0.5;
    const rr = r * (0.84 + R() * 0.3) * (1 + amp * 0.035 * Math.sin(t * (0.55 + R() * 0.3) + R() * TAU));
    P.push([Math.cos(a) * rr, Math.sin(a) * rr * sy]);
  }
  const k = 1 + amp * 0.018 * Math.sin(t * 0.5 + seed);
  const d = fechada(P);
  const body = `<path d="${d}" fill="${c}"/>`;
  // no papel noite o blob vira um brilho frio (mistura em tela)
  return g(tr(x, y, k), `<g filter="url(#sfAqua)">${body}</g>`, `opacity="${n2(o.op ?? (o.noite ? 0.3 : 0.6))}"${o.noite ? ' style="mix-blend-mode:screen"' : ''}`);
}

// ---------- chão ----------
// o: x0, x1, cor, op, noite
export function chao(y, o = {}) {
  const x0 = o.x0 ?? 40, x1 = o.x1 ?? 1880;
  const cor = o.cor ?? (o.noite ? 'rgba(170,190,255,.16)' : 'rgba(120,100,70,.2)');
  let s = `<rect x="${n2(x0)}" y="${n2(y + 3)}" width="${n2(x1 - x0)}" height="10" rx="5" fill="${o.noite ? 'rgba(0,0,0,.25)' : 'rgba(90,70,40,.07)'}"/>`;
  s += `<rect x="${n2(x0)}" y="${n2(y - 5)}" width="${n2(x1 - x0)}" height="10" rx="5" fill="${cor}"/>`;
  return op(o.op ?? 1, s);
}

// ---------- brilhos ----------
// o: n (padrão 14), area [x,y,w,h], cores, op, tam (tamanho base), noite
export function brilhos(t, seed = 1, o = {}) {
  const R = rng(seed * 104729 + 7);
  const [ax, ay, aw, ah] = o.area ?? [60, 120, 1800, 820];
  const cores = o.cores ?? (o.noite ? ['#cfe0ff', '#8fe7f5', '#ffffff'] : [AMBAR, '#ee93b8', '#7cc7c4', '#a98ee0']);
  const n = o.n ?? 14, tam = o.tam ?? 12;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = ax + R() * aw, y = ay + R() * ah, per = 2.2 + R() * 2.6, ph = R(), cor = cores[Math.floor(R() * cores.length)];
    const ponto = R() < 0.4, sz = tam * (0.6 + R() * 0.7);
    const u = ((t / per + ph) % 1 + 1) % 1;
    const k = Math.pow(Math.max(0, Math.sin(u * Math.PI)), 2);
    if (k < 0.03) continue;
    s += ponto
      ? `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(sz * 0.3 * (0.6 + 0.4 * k))}" fill="${cor}" opacity="${n2(k)}"/>`
      : g(tr(x, y, 0.45 + 0.55 * k, u * 40), `<path d="${faiscaPath(sz)}" fill="${cor}"/>`, `opacity="${n2(k)}"`);
  }
  return op(o.op ?? 1, s);
}

// ---------- régua ----------
// o: cor, noite
export function regua(t, total, o = {}) {
  const p = clamp(t / total);
  const xp = W * p;
  let s = `<rect width="${n2(xp)}" height="9" fill="${o.cor ?? AMBAR}"/>`;
  let on = '', off = '';
  for (let x = 12; x < W; x += 24) {
    const h = x % 120 === 12 ? 11 : 6;
    const r = `<rect x="${x - 1}" y="0" width="2" height="${h}"/>`;
    if (x < xp) on += r; else off += r;
  }
  s += `<g fill="rgba(140,80,0,.45)">${on}</g><g fill="${o.noite ? 'rgba(200,215,255,.28)' : 'rgba(70,58,40,.3)'}">${off}</g>`;
  return s;
}

// ---------- marca ----------
// o: x, y (centro vertical), h (altura do A&M, padrão 64), fundo (pílula clara; padrão só no 'noite'), noite, op
export function marca(idade = 9, o = {}) {
  // lockup fixo no canto: pílula branca com A&M | TOTVS, alturas equilibradas pelo peso visual
  const a = ease.out(clamp(idade / 0.5));
  if (a <= 0) return '';
  const h = o.h ?? 46, x = o.x ?? 34, y = o.y ?? 60;
  const am = logoSize('alvarez-marsal', h), tv = logoSize('totvs', h * 0.62);
  const pad = 22, gap = 20;
  const w = pad + am.w + gap * 2 + 2 + tv.w + pad, H = h + 22;
  let s = `<rect x="${n2(x)}" y="${n2(y - H / 2 + 3)}" width="${n2(w)}" height="${n2(H)}" rx="${n2(H / 2)}" fill="#2b1a05" opacity=".10"/>`;
  s += `<rect x="${n2(x)}" y="${n2(y - H / 2)}" width="${n2(w)}" height="${n2(H)}" rx="${n2(H / 2)}" fill="#fffdf8" stroke="#e6dccb" stroke-width="1.5"/>`;
  s += logo('alvarez-marsal', x + pad + am.w / 2, y, h);
  const dx = x + pad + am.w + gap;
  s += `<rect x="${n2(dx)}" y="${n2(y - h * 0.34)}" width="2" height="${n2(h * 0.68)}" rx="1" fill="#d9cfbd"/>`;
  s += logo('totvs', dx + 2 + gap + tv.w / 2, y, h * 0.62);
  return op(a * (o.op ?? 1), g(tr(-24 * (1 - a), 0), s));
}

// ---------- pílula de capítulo ----------
// o: cor (círculo do número; padrão azul A&M), x (borda direita, padrão 1874), y (topo, 27), fim (idade em que começa a sair)
export function pilulaCapitulo(num, parte, titulo, idade = 9, o = {}) {
  const sai = o.fim != null ? ease.in(clamp((idade - o.fim) / 0.35)) : 0;
  const a = ease.out(clamp(idade / 0.4)) * (1 - sai);
  if (a <= 0) return '';
  const cor = o.cor ?? C.blue;
  const x1 = o.x ?? 1874, y0 = o.y ?? 27, h = 62;
  const sup = String(parte ?? '').toUpperCase();
  const fSup = '800 14px Outfit', fTit = '800 27px Outfit';
  const tw = Math.max(measure(sup, fSup) + sup.length * 1.6, measure(titulo, fTit));
  const w = 70 + tw + 28, x0 = x1 - w;
  // entra: o círculo estala, a pílula desenrola para a direita e o texto aparece
  const kc = ease.back(clamp(idade / 0.32));
  const kw = ease.out5(clamp((idade - 0.12) / 0.4));
  const ww = lerp(h, w, kw);
  const dx = sai * 90;
  let s = `<rect x="${n2(x0 + 4)}" y="${n2(y0 + 5)}" width="${n2(ww)}" height="${h}" rx="${h / 2}" fill="rgba(60,45,25,.16)"/>`;
  s += `<rect x="${n2(x0)}" y="${n2(y0)}" width="${n2(ww)}" height="${h}" rx="${h / 2}" fill="#fffdf8" stroke="${INK}" stroke-width="3"/>`;
  const cx = x0 + 34, cy = y0 + h / 2;
  const at = clamp((idade - 0.28) / 0.3);
  if (at > 0) s += `<clipPath id="sfPil${num}"><rect x="${n2(x0)}" y="${n2(y0)}" width="${n2(ww - 10)}" height="${h}"/></clipPath>` + g('', op(at, g(tr((1 - ease.out(at)) * -18, 0),
    text(sup, x0 + 68, y0 + 23, { size: 14, weight: 800, fill: '#6b6f7e', anchor: 'start', ls: '1.6' }) +
    text(titulo, x0 + 68, y0 + 50, { size: 27, weight: 800, fill: INK, anchor: 'start' }))), `clip-path="url(#sfPil${num})"`);
  s += g(tr(cx, cy, Math.max(0.01, kc), (1 - kw) * -90), `<circle r="22" fill="${cor}"/>` + text(String(num).padStart(2, '0'), 0, 8, { size: 21, weight: 900, fill: '#fff' }));
  return op(a, g(tr(dx, 0), s));
}

// ---------- legenda ----------
// o: quem (nome; ausente = narrador), cor (do círculo/etiqueta), karaoke (padrão true: palavras ainda não ditas ficam apagadas),
//    y (base da pílula, padrão 1046), maxW (padrão 1300), tam (corpo do texto, padrão 38; a pílula acompanha)
export function legenda(texto, t, de, ate, o = {}) {
  const a = clamp(Math.min((t - de) / 0.25, (ate - t) / 0.2));
  if (a <= 0 || !texto) return '';
  const size = o.tam ?? 38, k_ = size / 38, lh = 50 * k_, font = `700 ${size}px "DM Sans"`;
  const maxW = (o.maxW ?? 1300) - 150 * k_;
  // palavras com destaque (*...*) — o destaque pode abranger várias palavras
  const pal = [];
  let hi = false;
  for (const w of texto.split(/\s+/).filter(Boolean)) {
    let p = w;
    const ini = p.startsWith('*'); if (ini) { hi = true; p = p.slice(1); }
    const fim = p.endsWith('*'); if (fim) p = p.slice(0, -1);
    pal.push({ p, hi }); if (fim) hi = false;
  }
  const esp = measure(' ', font);
  const linhas = [[]];
  let lw = 0;
  for (const w of pal) {
    w.w = measure(w.p, font);
    const nl = lw ? lw + esp + w.w : w.w;
    if (nl > maxW && lw) { linhas.push([w]); lw = w.w; } else { linhas[linhas.length - 1].push(w); lw = nl; }
    w.l = linhas.length - 1;
  }
  const larg = linhas.map(L => L.reduce((s, w, i) => s + w.w + (i ? esp : 0), 0));
  const tw = Math.max(...larg);
  const h = 92 * k_ + (linhas.length - 1) * lh, w = (26 + 58 + 20 + 36) * k_ + tw;
  const yb = o.y ?? 1046, y0 = yb - h, x0 = 960 - w / 2;
  // karaokê: proporcional ao número de letras
  const nLetras = pal.reduce((s, w) => s + w.p.length + 1, 0);
  const prog = o.karaoke === false ? 1e9 : clamp((t - de) / Math.max(0.3, (ate - de) * 0.85)) * nLetras;
  let s = `<rect x="${n2(x0)}" y="${n2(y0)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(24 * k_)}" fill="#262833" opacity=".96"/>`;
  const ix = x0 + (26 + 29) * k_, iy = y0 + h / 2;
  let s0 = '';
  if (!o.quem) {
    s0 += `<circle cx="${n2(ix)}" cy="${n2(iy)}" r="29" fill="#fffdf8"/><rect x="${n2(ix - 7)}" y="${n2(iy - 16)}" width="14" height="22" rx="7" fill="${INK}"/><path d="M${n2(ix - 12)} ${n2(iy - 1)}a12 12 0 0 0 24 0M${n2(ix)} ${n2(iy + 11)}v6" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  } else {
    const cor = o.cor ?? C.blue;
    s0 += `<circle cx="${n2(ix)}" cy="${n2(iy)}" r="29" fill="${cor}" stroke="#fffdf8" stroke-width="3"/>` + text(o.quem[0].toUpperCase(), ix, iy + 11, { size: 30, weight: 900, fill: '#fff' });
    const nome = o.quem.toUpperCase(), nf = '800 19px Outfit';
    const nw = measure(nome, nf) + nome.length * 1.2 + 30;
    s0 += `<rect x="${n2(x0 + 18)}" y="${n2(y0 - 20)}" width="${n2(nw)}" height="32" rx="16" fill="${cor}" stroke="#262833" stroke-width="3"/>` + text(nome, x0 + 18 + nw / 2, y0 + 3, { size: 19, weight: 800, fill: '#fff', ls: '1.2' });
  }
  // ícone e etiqueta acompanham o corpo do texto (escala em torno do ícone)
  s += k_ === 1 ? s0 : `<g transform="translate(${n2(ix)} ${n2(iy)}) scale(${n2(k_)}) translate(${n2(-ix)} ${n2(-iy)})">${s0}</g>`;
  // texto palavra a palavra
  const tx = x0 + (26 + 58 + 20) * k_;
  let acc = 0, cur = -1, xx = 0, spans = '';
  for (const w of pal) {
    if (w.l !== cur) { cur = w.l; xx = 0; }
    const dita = acc <= prog;
    acc += w.p.length + 1;
    const cor = w.hi ? '#ffc04a' : '#ffffff';
    spans += `<text x="${n2(tx + xx)}" y="${n2(y0 + 59 * k_ + w.l * lh)}" font-family="DM Sans" font-weight="700" font-size="${size}" fill="${cor}"${dita ? '' : ' fill-opacity=".42"'}>${esc(w.p)}</text>`;
    xx += w.w + esp;
  }
  s += spans;
  const k = ease.out(clamp((t - de) / 0.32));
  return op(a, g(`translate(960 ${n2(yb)}) scale(${n2(0.96 + 0.04 * k)}) translate(-960 ${n2(-yb + (1 - k) * 16)})`, s));
}

// ---------- ícones (caixa 24x24 no estilo traço) ----------
function engrenagem() {
  let d = '';
  const n = 8;
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * TAU, a1 = ((i + 1) / (n * 2)) * TAU;
    const r = i % 2 ? 7.2 : 9.6, rm = (a1 - a0) * 0.18;
    d += `${i ? 'L' : 'M'}${n2(12 + Math.cos(a0 + rm) * r)} ${n2(12 + Math.sin(a0 + rm) * r)}L${n2(12 + Math.cos(a1 - rm) * r)} ${n2(12 + Math.sin(a1 - rm) * r)}`;
  }
  return `<path d="${d}Z"/><circle cx="12" cy="12" r="3"/>`;
}
function estrela5() {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 4.4 : 9.6; d += `${i ? 'L' : 'M'}${n2(12 + Math.cos(a) * r)} ${n2(12.6 + Math.sin(a) * r)}`; }
  return `<path d="${d}Z"/>`;
}
const ICONES = {
  alerta: () => '<path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4.4M12 17h.01"/>',
  aperto: () => '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  pin: () => '<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  engrenagem,
  moeda: () => '<circle cx="12" cy="12" r="9.5"/><path d="M15 8.6h-3.9a2 2 0 0 0 0 4h1.8a2 2 0 0 1 0 4H9M12 6.8v1.8M12 16.6v1.8"/>',
  estrela: estrela5,
};
// ícone em traço centrado em (x, y) com tamanho s (px)
export function icone(nome, x, y, s = 48, cor = '#fff', sw = 2.2) {
  const f = ICONES[nome] ?? ICONES.estrela;
  return `<g transform="translate(${n2(x - s / 2)} ${n2(y - s / 2)}) scale(${n2(s / 24)})" fill="none" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${f()}</g>`;
}

// ---------- cartão de fase ----------
// Abertura de parte em tela cheia (desenha o próprio fundo).
// o: icone, total (bolinhas, padrão 6), atual (padrão num), grupos [{n, rotulo, cor}], cor/cor2 (gradiente da pílula e do círculo),
//    sub (cor do sublinhado, padrão âmbar), fim (idade em que começa a sair), seed
export function cartaoFase(num, parte, titulo, icone_ = 'estrela', idade = 9, o = {}) {
  if (idade < 0) return '';
  const sai = o.fim != null ? clamp((idade - o.fim) / 0.4) : 0;
  if (sai >= 1) return '';
  const cor = o.cor ?? '#0b5ed7', cor2 = o.cor2 ?? '#4aa3ff', sub = o.sub ?? AMBAR;
  const ic = o.icone ?? icone_;
  const total = o.total ?? 6, atual = o.atual ?? num;
  const grupos = o.grupos ?? [{ n: total, rotulo: String(parte ?? '').toUpperCase(), cor }];
  const S = k => clamp((idade - k[0]) / (k[1] - k[0]));
  const uid = 'sfFase' + (o.seed ?? num);
  let s = papel(idade, { tom: 'cartao', rabiscos: 0, seed: 3 });
  s += `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cor}"/><stop offset="1" stop-color="${cor2}"/></linearGradient></defs>`;
  const fx = 200, mov = -40 * ease.in(sai);
  let L = '';
  // pílula FASE 0X + parte
  const p1 = ease.back(S([0.05, 0.45]));
  const fTag = '800 34px Outfit', tag = 'FASE ' + String(num).padStart(2, '0');
  const tgw = measure(tag, fTag) + 4 * tag.length * 0.6 + 82;
  let pl = `<rect x="4" y="6" width="${n2(tgw)}" height="70" rx="35" fill="rgba(60,45,25,.18)"/><rect width="${n2(tgw)}" height="70" rx="35" fill="url(#${uid})" stroke="${INK}" stroke-width="3.5"/>`;
  pl += icone(ic, 38, 35, 26, '#fff', 2.8) + text(tag, 60, 47, { size: 34, weight: 800, fill: '#fff', anchor: 'start', ls: '2' });
  L += op(S([0.05, 0.3]), g(tr(fx - (1 - p1) * 40, 236), pl));
  L += op(S([0.2, 0.5]), text(String(parte ?? '').toUpperCase(), fx + tgw + 26 - (1 - S([0.2, 0.5])) * 20, 283, { size: 28, weight: 800, fill: cor, anchor: 'start', ls: '3.5' }));
  // título grande
  const fTit = '900 136px Outfit';
  const tTit = Math.min(1100, measure(titulo, fTit));
  const kt = ease.out(S([0.12, 0.55]));
  L += op(S([0.12, 0.4]), g(tr(fx, 485 + (1 - kt) * 50), `<text x="0" y="0" font-family="Outfit" font-weight="900" font-size="136" fill="#34333b" letter-spacing="-2.5"${tTit < measure(titulo, fTit) ? ` textLength="${n2(tTit)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(titulo)}</text>`));
  // sublinhado à mão
  const su = ease.inOut(S([0.45, 0.95]));
  if (su > 0) {
    const ux1 = fx + tTit + 40;
    const d = `M${fx} 538C${n2(fx + tTit * 0.3)} 531 ${n2(fx + tTit * 0.7)} 529 ${n2(ux1)} 535`;
    L += `<path d="${d}" fill="none" stroke="${sub}" stroke-width="7.5" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${n2(1 - su)}"/>`;
  }
  // círculo com ícone
  const ccx = 1508, ccy = 420, kc = ease.back(S([0.25, 0.7]));
  if (kc > 0) {
    let c = `<circle r="158" fill="none" stroke="${cor2}" stroke-opacity=".55" stroke-width="7" stroke-dasharray="0 21" stroke-linecap="round" transform="rotate(${n2(idade * 12)})"/>`;
    c += `<circle cx="7" cy="9" r="128" fill="rgba(60,45,25,.16)"/><circle r="128" fill="url(#${uid})" stroke="${INK}" stroke-width="5"/>`;
    c += `<ellipse cx="-38" cy="-62" rx="46" ry="22" fill="#fff" opacity=".14" transform="rotate(-32)"/>`;
    c += icone(ic, 0, 2, 132, '#fff', 2.1);
    L += g(tr(ccx, ccy, Math.max(0.01, kc)), c);
    const sp = [[-185, -160, '#ee5fa7', 22], [190, -110, '#17b2cd', 16], [160, 175, '#ee5fa7', 19], [-200, 150, AMBAR, 14]];
    sp.forEach(([dx, dy, cr, sz], i) => {
      const k = S([0.55 + i * 0.07, 0.8 + i * 0.07]) * (0.75 + 0.25 * Math.sin(idade * 3 + i * 1.7));
      if (k > 0) L += op(k, faisca(ccx + dx, ccy + dy, sz * (0.6 + 0.4 * k), cr, 45));
    });
  }
  // trilha de progresso
  const ty = 812, dxp = 87, gap = 66;
  let xx = fx + 10, idx = 0, T = '', marcador = null;
  grupos.forEach((G, gi) => {
    const gc = G.cor ?? cor;
    const x0g = xx;
    for (let i = 0; i < G.n; i++) {
      idx++;
      const x = xx + i * dxp;
      const kd = ease.back(S([0.45 + idx * 0.045, 0.7 + idx * 0.045]));
      if (i < G.n - 1) {
        const feito = idx < atual;
        const lg = S([0.45 + idx * 0.045, 0.65 + idx * 0.045]);
        T += feito
          ? `<path d="M${n2(x)} ${ty}h${n2(dxp * lg)}" stroke="${gc}" stroke-width="5"/>`
          : op(lg, `<path d="M${n2(x + 22)} ${ty}h${n2(dxp - 44)}" stroke="${gc}" stroke-opacity=".38" stroke-width="4" stroke-dasharray="0 11" stroke-linecap="round"/>`);
      }
      if (kd <= 0) continue;
      let b;
      if (idx < atual) b = `<circle r="16" fill="${gc}" stroke="${INK}" stroke-width="3"/><path d="M-6.5 0.5l4.5 4.5 8.5-9" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      else if (idx === atual) { b = `<circle r="25" fill="#fffdf8" stroke="${INK}" stroke-width="4"/>` + text(String(num), 0, 8, { size: 24, weight: 900, fill: INK }); marcador = [x, kd]; }
      else b = `<circle r="15" fill="#fbf8f1" stroke="#b9b2a6" stroke-width="3"/>`;
      T += g(tr(x, ty, Math.max(0.01, kd)), b);
    }
    if (G.rotulo) T += op(S([0.5, 0.8]), text(G.rotulo, x0g - 16, ty + 58, { size: 21, weight: 800, fill: gc, anchor: 'start', ls: '3' }));
    xx += Math.max((G.n - 1) * dxp, G.rotulo ? measure(G.rotulo, '800 21px Outfit') + G.rotulo.length * 3 - 10 : 0) + gap + dxp * 0.6;
  });
  L += T;
  if (marcador) {
    const km = ease.bounce(S([1.0, 1.45]));
    if (km > 0) {
      const bob = 4 * Math.sin(idade * 3.2);
      L += g(tr(marcador[0], ty - 62 - (1 - km) * 40 + bob), `<path d="M0 22c-3-6-15-14-15-25a15 15 0 0 1 30 0c0 11-12 19-15 25Z" fill="${AMBAR}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/><circle cy="-3" r="5.5" fill="#fffdf8" stroke="${INK}" stroke-width="2.6"/>`, `opacity="${n2(clamp(km * 3))}"`);
    }
  }
  s += op(1 - sai, g(tr(0, mov), L));
  return s;
}

// ---------- transição ----------
// Faixa diagonal que varre a tela de [tb, tb + dur]; cobre a tela inteira por volta de tb + dur/2 (bom ponto de corte).
// o: dur (padrão .9), dir (1 = da esquerda para a direita, -1 = ao contrário), inclinacao (px, padrão 360)
export function transicao(t, tb, o = {}) {
  const dur = o.dur ?? 0.9;
  const u = (t - tb) / dur;
  if (u <= 0 || u >= 1) return '';
  const dir = o.dir ?? 1, sl = o.inclinacao ?? 360;
  const BW = W + sl + 300; // largura da faixa: cobre a tela no meio do percurso
  const e = ease.inOut(u);
  const xa = lerp(-BW - sl, W + sl, e); // borda de trás (inferior)
  const P = (a, b) => `M${n2(a + sl)} -20L${n2(b + sl)} -20L${n2(b)} ${H + 20}L${n2(a)} ${H + 20}Z`;
  let s = `<path d="${P(xa, xa + BW)}" fill="url(#sfFaixa)"/>`;
  s += `<path d="${P(xa + 60, xa + BW * 0.45)}" fill="url(#sfFaixaBrilho)"/>`;
  // bordas âmbar com fio escuro
  for (const xb of [xa, xa + BW]) {
    s += `<path d="M${n2(xb + sl)} -20L${n2(xb)} ${H + 20}" stroke="${INK}" stroke-width="34"/>`;
    s += `<path d="M${n2(xb + sl)} -20L${n2(xb)} ${H + 20}" stroke="${AMBAR}" stroke-width="22"/>`;
  }
  s += `<path d="${P(xa, xa + BW)}" fill="url(#grain)" opacity=".12"/>`;
  // fios decorativos dentro da faixa
  s += `<path d="M${n2(xa + BW - 70 + sl)} -20L${n2(xa + BW - 70)} ${H + 20}" stroke="${AMBAR}" stroke-opacity=".7" stroke-width="5"/>`;
  s += `<path d="M${n2(xa + 110 + sl)} -20L${n2(xa + 110)} ${H + 20}" stroke="#fff" stroke-opacity=".18" stroke-width="6"/>`;
  return dir < 0 ? g(`translate(${W} 0) scale(-1 1)`, s) : s;
}

// ---------- confete ----------
const FESTA = ['#0b5ed7', AMBAR, '#ef7a8a', '#17b2cd', '#0c2f57', '#1f9d57', '#a98ee0', '#1f6fd6'];
function peca(tipo, cor, sz) {
  if (tipo === 0) return `<rect x="${n2(-sz * 0.35)}" y="${n2(-sz * 0.6)}" width="${n2(sz * 0.7)}" height="${n2(sz * 1.2)}" rx="2" fill="${cor}"/>`;
  if (tipo === 1) return `<circle r="${n2(sz * 0.45)}" fill="${cor}"/>`;
  if (tipo === 2) return `<path d="M${n2(-sz)} 0q${n2(sz / 2)} ${n2(-sz * 0.7)} ${n2(sz)} 0t${n2(sz)} 0" stroke="${cor}" stroke-width="${n2(sz * 0.32)}" fill="none" stroke-linecap="round"/>`;
  if (tipo === 3) return `<path d="M0 ${n2(-sz * 0.6)}L${n2(sz * 0.6)} ${n2(sz * 0.5)}L${n2(-sz * 0.6)} ${n2(sz * 0.5)}Z" fill="${cor}"/>`;
  return `<path d="${faiscaPath(sz * 0.8)}" fill="${cor}"/>`;
}
// Chuva de confete de cima. o: n (padrão 90), cores, dur (some depois de dur s, padrão 4.5), area [x0, x1]
export function confete(idade, seed = 1, o = {}) {
  if (idade <= 0) return '';
  const dur = o.dur ?? 4.5;
  const fa = 1 - clamp((idade - dur + 0.6) / 0.6);
  if (fa <= 0) return '';
  const R = rng(seed * 31337 + 1);
  const cores = o.cores ?? FESTA, n = o.n ?? 90;
  const [ax0, ax1] = o.area ?? [-40, W + 40];
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = ax0 + R() * (ax1 - ax0), y0 = -30 - R() * 520, vy = 210 + R() * 230, sw = 20 + R() * 45, fw = 1.2 + R() * 2.2, ph = R() * TAU;
    const tipo = Math.floor(R() * 5), cor = cores[Math.floor(R() * cores.length)], sz = 9 + R() * 9, giro = (R() - 0.5) * 600;
    const y = y0 + vy * idade;
    if (y < -40 || y > H + 40) continue;
    const x = x0 + sw * Math.sin(idade * fw + ph);
    const flip = Math.cos(idade * (3 + fw * 2) + ph);
    s += g(`${tr(x, y, 1, giro * idade / 60 + ph * 57)} scale(1 ${n2(Math.abs(flip) < 0.15 ? 0.15 * Math.sign(flip || 1) : flip)})`, peca(tipo, cor, sz));
  }
  return op(fa, s);
}

// Estouro radial de confete e faíscas em (x, y). o: n (padrão 24), r (alcance, padrão 260), cores, flash (padrão true)
export function estouro(x, y, idade, seed = 1, o = {}) {
  if (idade <= 0 || idade > 1.8) return '';
  const R = rng(seed * 7717 + 3);
  const cores = o.cores ?? FESTA, n = o.n ?? 30, alc = o.r ?? 280;
  let s = '';
  if (o.flash !== false && idade < 0.4) {
    const k = idade / 0.4;
    s += `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(30 + alc * 0.45 * ease.out(k))}" fill="none" stroke="${AMBAR}" stroke-width="${n2(10 * (1 - k))}" opacity="${n2(1 - k)}"/>`;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.2, r0 = 40 + alc * 0.35 * ease.out(k), r1 = r0 + 40 * (1 - k);
      s += `<path d="M${n2(x + Math.cos(a) * r0)} ${n2(y + Math.sin(a) * r0)}L${n2(x + Math.cos(a) * r1)} ${n2(y + Math.sin(a) * r1)}" stroke="${i % 2 ? '#ef7a8a' : AMBAR}" stroke-width="7" stroke-linecap="round" opacity="${n2(1 - k)}"/>`;
    }
  }
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (R() - 0.5) * 0.5, v = alc * (0.6 + R() * 0.6), vida = 1.1 + R() * 0.6;
    if (idade > vida) continue;
    const kk = 4;
    const d = v * (1 - Math.exp(-kk * idade)) / (1 - Math.exp(-kk)) * 0.9;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.85 + 260 * idade * idade;
    const fa = 1 - clamp((idade - vida + 0.35) / 0.35);
    const tipo = Math.floor(R() * 5), cor = cores[Math.floor(R() * cores.length)], sz = 13 + R() * 11;
    s += g(tr(px, py, 0.6 + 0.4 * fa, idade * 360 * (R() - 0.5) * 2), peca(tipo, cor, sz), `opacity="${n2(fa)}"`);
  }
  return s;
}

// ---------- palco (fechamento) ----------
// Fundo festivo: papel dourado, luz suave do alto, fachos e bandeirolas.
// o: papel (false = só a decoração), tom (padrão 'dourado'), luz (0..1, padrão 1), bandeirolas (padrão true), seed
const BANDEIRA = ['#0c2f57', '#0b5ed7', AMBAR, '#1f6fd6', '#fffdf8'];
function cordao(t, xa, ya, xb, yb, flecha, nB, fase, R) {
  // catenária aproximada por parábola
  const pt = u => [lerp(xa, xb, u), lerp(ya, yb, u) + flecha * 4 * u * (1 - u)];
  let d = '';
  for (let i = 0; i <= 24; i++) { const [x, y] = pt(i / 24); d += `${i ? 'L' : 'M'}${n2(x)} ${n2(y)}`; }
  let s = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  for (let i = 0; i < nB; i++) {
    const u = (i + 0.5) / nB;
    const [x, y] = pt(u), [x2, y2] = pt(u + 0.01);
    const ang = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;
    const cor = BANDEIRA[(i + fase) % BANDEIRA.length];
    const bal = 5 * Math.sin(t * 1.6 + i * 0.9 + fase);
    const w = 27, h = 50;
    s += g(tr(x, y, 1, ang + bal), `<path d="M${-w} 0H${w}L0 ${h}Z" fill="${cor}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>` + (cor === '#fffdf8' ? `<circle cy="16" r="5" fill="${AMBAR}"/>` : ''));
  }
  return s;
}
export function palco(t, o = {}) {
  let s = o.papel === false ? '' : papel(t, { tom: o.tom ?? 'dourado', seed: o.seed ?? 21, rabiscos: o.rabiscos ?? 12 });
  const luz = o.luz ?? 1;
  if (luz > 0) {
    s += `<rect width="${W}" height="${H}" fill="url(#sfPalcoLuz)" opacity="${n2(0.9 * luz)}"/>`;
    // fachos suaves que balançam devagar
    let f = '';
    [[560, -1], [1360, 1]].forEach(([x, sg], i) => {
      const a = sg * (10 + 4 * Math.sin(t * 0.5 + i * 2));
      f += g(`translate(${x} -40) rotate(${n2(a)})`, `<path d="M-60 0L60 0L260 1150L-260 1150Z" fill="url(#sfFacho)"/>`);
    });
    s += op(0.38 * luz, f);
  }
  if (o.bandeirolas !== false) {
    const R = rng(o.seed ?? 21);
    const cair = ease.out(clamp((o.idade ?? 9) / 0.8));
    const dy = (1 - cair) * -220;
    s += g(tr(0, dy), cordao(t, -30, 110, 960, 104, 95, 12, 0, R) + cordao(t, 960, 104, 1950, 112, 95, 12, 2, R) + `<circle cx="960" cy="104" r="9" fill="${AMBAR}" stroke="${INK}" stroke-width="3"/>`);
  }
  return s;
}
