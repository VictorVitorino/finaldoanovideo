// Base visual do carrossel "Gestão de Mudanças Tech" (A&M · DTS · Performance), 1080 x 1350.
// Linguagem de consultoria A&M: navy #002B49, laranja #F78C16, Barlow Condensed nos títulos,
// Inter no texto e JetBrains Mono nos rótulos técnicos. Tudo é função pura do tempo.
import { clamp, lerp, inv, ease, kf, n2, esc, measure, rng } from '../core.js';

export { clamp, lerp, inv, ease, kf, n2, esc, measure, rng };
const f = n2;

export const W = 1080, H = 1350;

export const C = {
  navy: '#002B49', dark: '#0E1C39', dark2: '#122143', navy3: '#1F3263', slate: '#35516A', slate2: '#33556D',
  orange: '#F78C16', orangeL: '#F9A64A', orangeD: '#B35F00', orangeBg: '#FEF1E2',
  blue: '#5E8AB4', blueL: '#9DBBD9', blueLL: '#BFD0E1', blueBg: '#EEF3F8', blueSoft: '#C8DBEB',
  grey: '#6B7B8C', greyL: '#8A97A8', red: '#BC0404', green: '#1F8A5B', white: '#FFFFFF', ink: '#0E1C39',
};
export const FONTE = { H: 'Barlow Condensed', B: 'Inter', M: 'JetBrains Mono' };

// texto. o: { f: 'H'|'B'|'M', w, s (tamanho), c (cor), a (anchor), ls, extra }
export function t(str, x, y, o = {}) {
  const fam = FONTE[o.f ?? 'B'];
  return `<text x="${f(x)}" y="${f(y)}" font-family="'${fam}'" font-weight="${o.w ?? 500}" font-size="${o.s ?? 28}" fill="${o.c ?? C.navy}" text-anchor="${o.a ?? 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.extra ? ' ' + o.extra : ''}>${esc(str)}</text>`;
}
export const larg = (str, s, w = 500, fk = 'B') => measure(str, `${w} ${s}px "${FONTE[fk]}"`);

// texto com trechos destacados entre *asteriscos* (cor de destaque)
export function tRico(str, x, y, o = {}) {
  const fam = FONTE[o.f ?? 'B'];
  const parts = str.split(/(\*[^*]+\*)/).filter(Boolean);
  let sp = '';
  for (const p of parts) {
    const hi = p.startsWith('*');
    sp += `<tspan${hi ? ` fill="${o.hi ?? C.orange}"${o.hw ? ` font-weight="${o.hw}"` : ''}` : ''}>${esc(hi ? p.slice(1, -1) : p)}</tspan>`;
  }
  return `<text x="${f(x)}" y="${f(y)}" font-family="'${fam}'" font-weight="${o.w ?? 500}" font-size="${o.s ?? 28}" fill="${o.c ?? C.navy}" text-anchor="${o.a ?? 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${sp}</text>`;
}

// quebra de linha por largura (respeita *destaques*)
export function quebra(str, s, maxW, w = 500, fk = 'B') {
  const words = str.split(/\s+/);
  const out = [];
  let cur = '';
  for (const wd of words) {
    const test = cur ? cur + ' ' + wd : wd;
    if (larg(test.replace(/\*/g, ''), s, w, fk) > maxW && cur) { out.push(cur); cur = wd; } else cur = test;
  }
  if (cur) out.push(cur);
  // fecha/reabre destaques que atravessam linhas
  let aberto = false;
  return out.map(l => {
    let r = (aberto ? '*' : '') + l;
    const n = (l.match(/\*/g) || []).length;
    if (n % 2 === 1) aberto = !aberto;
    if (aberto) r += '*';
    return r;
  });
}

export function paragrafo(str, x, y, o = {}) {
  const linhas = quebra(str, o.s ?? 28, o.maxW ?? 900, o.w ?? 500, o.f ?? 'B');
  const lh = o.lh ?? (o.s ?? 28) * 1.32;
  return { svg: linhas.map((l, i) => tRico(l, x, y + i * lh, o)).join(''), h: linhas.length * lh, n: linhas.length };
}

// ---------- animação ----------
export const back = (tt, a, d = 0.45) => ease.back(inv(a, a + d, tt));
export const fin = (tt, a, d = 0.35) => ease.out(inv(a, a + d, tt));
export const pop = (k, x, y, body) => (k <= 0.001 ? '' : `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)}) translate(${f(-x)} ${f(-y)})">${body}</g>`);
export const op = (o, body) => (o >= 0.999 ? body : o <= 0.001 ? '' : `<g opacity="${f(o)}">${body}</g>`);
// entra subindo + fade
export const sobe = (k, body, d = 26) => (k <= 0.001 ? '' : `<g opacity="${f(clamp(k))}" transform="translate(0 ${f((1 - k) * d)})">${body}</g>`);
export const revela = (id, x, y, w, h, u, body) => {
  if (u <= 0) return '';
  if (u >= 1) return body;
  return `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(w * ease.out(u))}" height="${f(h)}"/></clipPath><g clip-path="url(#${id})">${body}</g>`;
};

export function defs() {
  return `<defs>`
    + `<linearGradient id="gNavy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14305A"/><stop offset=".55" stop-color="${C.dark2}"/><stop offset="1" stop-color="${C.dark}"/></linearGradient>`
    + `<linearGradient id="gVarre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="gLaranja" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.orangeL}"/><stop offset="1" stop-color="${C.orange}"/></linearGradient>`
    + `<linearGradient id="gAzul" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>`
    + `<filter id="fSombra" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0E1C39" flood-opacity=".14"/></filter>`
    + `<filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    + `</defs>`;
}

// ---------- marcas ----------
// Marca A&M (proporções do logo). (ox, oy) = canto inferior esquerdo; k = escala (altura ~512*k)
export function marcaAM(ox, oy, k, o = {}) {
  const P = (u, v) => `${f(ox + u * k)},${f(oy - (512 - v) * k)}`;
  const c1 = o.c1 ?? C.navy, c2 = o.c2 ?? '#2F74B5', c3 = o.c3 ?? '#5B9BD5', c4 = o.c4 ?? '#8FBBE3';
  return `<path d="M${P(148, 512)} L${P(235, 512)} L${P(485, 100)} L${P(485, 512)} L${P(545, 512)} L${P(545, 0)} L${P(470, 0)}Z" fill="${c1}"/>`
    + `<path d="M${P(397, 280)} L${P(463, 178)} L${P(463, 512)} L${P(397, 512)}Z" fill="${c2}"/>`
    + `<path d="M${P(567, 180)} L${P(628, 258)} L${P(628, 512)} L${P(567, 512)}Z" fill="${c3}"/>`
    + `<path d="M${P(650, 300)} L${P(700, 355)} L${P(700, 512)} L${P(650, 512)}Z" fill="${c4}"/>`;
}

// Lockup "ALVAREZ & MARSAL" (versalete) com a marca. Devolve { svg, w }.
export function lockupAM(x, y, size = 30, cor = C.navy, o = {}) {
  const k = size / 30;
  const claro = cor === '#fff' || cor === C.white;
  const s = marcaAM(x, y + 3 * k, 0.085 * k, claro ? { c1: '#fff' } : {});
  const tx = x + 66 * k;
  const big = size, small = size * 0.78;
  let svg = s, cx = tx;
  for (const [ch, sz] of [['A', big], ['LVAREZ ', small], ['& ', big], ['M', big], ['ARSAL', small]]) {
    svg += t(ch, cx, y, { f: 'B', w: 600, s: sz, c: cor, ls: 1.5 * k });
    cx += larg(ch, sz, 600) + ch.length * 1.5 * k;
  }
  if (o.sub) svg += t(o.sub, tx, y + size * 0.78, { f: 'B', w: 500, s: size * 0.46, c: o.subCor ?? cor, ls: 0.5 });
  return { svg, w: cx - x };
}

// Lockup "A&M | PERFORMΛNCE" (como na newsletter). Devolve { svg, w }.
export function lockupPerformance(x, y, size = 34, cor = '#fff') {
  const k = size / 34;
  let s = marcaAM(x, y + 2 * k, 0.07 * k, { c1: cor });
  let cx = x + 50 * k;
  s += `<rect x="${f(cx)}" y="${f(y - size * 0.74)}" width="${f(2.2 * k)}" height="${f(size * 0.78)}" fill="${cor}" opacity=".9"/>`;
  cx += 14 * k;
  s += t('PERFORM', cx, y, { f: 'B', w: 500, s: size, c: cor, ls: 0.5 });
  cx += larg('PERFORM', size, 500) + 3.5 + 4 * k;
  const h = size * 0.72, wA = size * 0.4;
  s += `<path d="M${f(cx)},${f(y)} L${f(cx + wA)},${f(y - h)} L${f(cx + wA)},${f(y)}" fill="none" stroke="${C.orange}" stroke-width="${f(size * 0.1)}"/>`;
  cx += wA + size * 0.12;
  s += t('NCE', cx, y, { f: 'B', w: 500, s: size, c: cor, ls: 0.5 });
  cx += larg('NCE', size, 500) + 1.5;
  return { svg: s, w: cx - x };
}

// Mini banner DTS (DTS | Digital & Technology Services) com faixa tricolor.
export function bannerDTS(x, y, s = 1, o = {}) {
  const w = 460, h = 96;
  let b = `<rect x="0" y="0" width="${w}" height="${h}" rx="10" fill="${C.navy}"/>`
    + `<path d="M372,${h} L424,0 M414,${h} L462,0" stroke="${C.slate}" stroke-width="9"/><path d="M393,${h} L443,0" stroke="${C.orange}" stroke-width="1.8"/>`
    + t('DTS', 22, 66, { f: 'B', w: 800, s: 58, c: '#fff', ls: -1 })
    + `<rect x="148" y="24" width="3.5" height="46" fill="${C.orange}"/>`
    + t('Digital & Technology', 162, 44, { f: 'B', w: 500, s: 19, c: '#DBE6F2' })
    + t('Services', 162, 68, { f: 'B', w: 500, s: 19, c: '#DBE6F2' })
    + `<rect x="0" y="${h - 6}" width="${w * 0.46}" height="6" fill="${C.orange}"/><rect x="${w * 0.46}" y="${h - 6}" width="${w * 0.33}" height="6" fill="${C.slate}"/><rect x="${w * 0.79}" y="${h - 6}" width="${w * 0.21}" height="6" fill="${C.blueLL}"/>`;
  if (o.clip !== false) b = `<clipPath id="${o.id ?? 'bdts'}"><rect width="${w}" height="${h}" rx="10"/></clipPath><g clip-path="url(#${o.id ?? 'bdts'})">${b}</g>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${b}</g>`;
}

// Linhas diagonais do banner (laranja fina + ardósia grossas), para fundos escuros.
export function diagonais(x, y, h, u = 1, o = {}) {
  const e = ease.out(clamp(u));
  const dx = (1 - e) * 220;
  const a = o.alpha ?? 1;
  return `<g opacity="${f(a * clamp(u * 2))}">`
    + `<path d="M${f(x + dx)},${f(y + h)} L${f(x + h * 0.58 + dx)},${f(y)}" stroke="${C.orange}" stroke-width="2.4"/>`
    + `<path d="M${f(x + 110 + dx)},${f(y + h)} L${f(x + 110 + h * 0.58 + dx)},${f(y)}" stroke="${C.slate}" stroke-width="16"/>`
    + `<path d="M${f(x + 250 + dx)},${f(y + h)} L${f(x + 250 + h * 0.58 + dx)},${f(y)}" stroke="${C.slate}" stroke-width="34"/>`
    + `<path d="M${f(x + 250 + h * 0.58 + 26 + dx)},${f(y)} L${f(x + 250 + h * 0.58 + 26 + dx)},${f(y + h)}" stroke="${C.slate}" stroke-width="12"/>`
    + `<path d="M${f(x + 190 + dx)},${f(y)} L${f(x + 190 + dx)},${f(y + h)}" stroke="${C.orange}" stroke-width="2.2" opacity=".85"/>`
    + `</g>`;
}

// ---------- moldura das páginas ----------
// Cabeçalho navy com marca A&M, área (DTS · Performance), título da página e paginação.
export function cabecalho(pag, total, titulo, sub, k = 1) {
  const h = 128;
  let s = `<rect x="0" y="0" width="${W}" height="${h}" fill="${C.navy}"/>`;
  s += `<clipPath id="cabClip"><rect width="${W}" height="${h}"/></clipPath><g clip-path="url(#cabClip)">${diagonais(760, 0, h, k, { alpha: 0.9 })}</g>`;
  const L = lockupAM(48, 62, 27, '#fff');
  s += L.svg + t('DTS · PERFORMANCE', 48 + 66 * 0.9, 92, { f: 'M', w: 500, s: 13, c: C.blueL, ls: 2 });
  s += `<rect x="${f(48 + L.w + 26)}" y="34" width="2" height="62" fill="#ffffff" opacity=".35"/>`;
  const tx = 48 + L.w + 50;
  s += t(titulo, tx, 64, { f: 'H', w: 700, s: 30, c: '#fff', ls: 1.5 });
  s += t(sub, tx, 92, { f: 'B', w: 500, s: 16, c: C.blueL });
  // paginação
  s += `<rect x="${W - 112}" y="44" width="68" height="40" rx="20" fill="#ffffff" fill-opacity=".1" stroke="#fff" stroke-opacity=".35"/>`
    + t(`${pag}/${total}`, W - 78, 71, { f: 'M', w: 600, s: 17, c: '#fff', a: 'middle' });
  s += `<rect x="0" y="${h}" width="${W * 0.46}" height="6" fill="${C.orange}"/><rect x="${W * 0.46}" y="${h}" width="${W * 0.33}" height="6" fill="${C.slate}"/><rect x="${W * 0.79}" y="${h}" width="${W * 0.21}" height="6" fill="${C.blueLL}"/>`;
  return s;
}

// Rodapé: fonte dos dados + DTS + PERFORMANCE + indicação de página.
export function rodape(pag, total, fonte, o = {}) {
  const y0 = H - 118;
  let s = `<rect x="0" y="${y0}" width="${W}" height="118" fill="${o.fundo ?? '#F4F7FB'}"/>`
    + `<path d="M48,${y0} L${W - 48},${y0}" stroke="${C.blueLL}" stroke-width="1.5"/>`;
  const linhas = quebra(fonte, 11.5, 640, 400, 'M');
  if (linhas.length > 6) console.warn('fontes do rodapé com', linhas.length, 'linhas (máx. 6):', fonte.slice(0, 60));
  linhas.slice(0, 6).forEach((l, i) => { s += t(l, 48, y0 + 24 + i * 15.5, { f: 'M', w: 400, s: 11.5, c: C.grey }); });
  const P = lockupPerformance(W - 48 - 300, y0 + 58, 30, C.navy);
  s += `<g transform="translate(${f(300 - P.w)} 0)">${P.svg}</g>`;
  // bolinhas de página: a ativa é larga e enche com o progresso da página (o.prog 0..1)
  const larguras = Array.from({ length: total }, (_, i) => (i + 1 === pag ? 40 : 12));
  const gap = 8, totalW = larguras.reduce((a, b) => a + b, 0) + gap * (total - 1);
  let bx = W - 48 - totalW;
  for (let i = 0; i < total; i++) {
    const on = i + 1 === pag;
    s += `<rect x="${f(bx)}" y="${y0 + 84}" width="${larguras[i]}" height="8" rx="4" fill="${on ? C.orangeBg : i + 1 < pag ? C.orange : C.blueLL}"${on ? ` stroke="${C.orange}" stroke-width="1"` : ''}/>`;
    if (on) s += `<rect x="${f(bx)}" y="${y0 + 84}" width="${f(larguras[i] * clamp(o.prog ?? 1))}" height="8" rx="4" fill="${C.orange}"/>`;
    bx += larguras[i] + gap;
  }
  if (o.arraste) s += t('arraste →', W - 48 - totalW - 16, y0 + 92, { f: 'M', w: 500, s: 13, c: C.grey, a: 'end' });
  return s;
}

// rótulo de seção (kicker): "PARTE 01 · CONTEXTO"
export function kicker(str, x, y, cor = C.orange) {
  return `<rect x="${f(x)}" y="${f(y - 15)}" width="26" height="4" fill="${cor}"/>` + t(str, x + 38, y, { f: 'M', w: 600, s: 17, c: cor, ls: 2.4 });
}

// cartão branco com sombra
export function cartao(x, y, w, h, o = {}) {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${o.r ?? 14}" fill="${o.fill ?? '#fff'}" stroke="${o.stroke ?? C.blueLL}" stroke-width="${o.sw ?? 1.5}"${o.sombra === false ? '' : ' filter="url(#fSombra)"'}/>`;
}

// varredura de luz sobre um retângulo
export function varredura(id, x, y, w, h, u, r = 14) {
  if (u <= 0 || u >= 1) return '';
  const bx = x - w * 0.4 + w * 1.4 * ease.inOut(u);
  return `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}"/></clipPath>`
    + `<g clip-path="url(#${id})"><path d="M${f(bx)},${f(y - 10)} L${f(bx + w * 0.18)},${f(y - 10)} L${f(bx + w * 0.08)},${f(y + h + 10)} L${f(bx - w * 0.1)},${f(y + h + 10)}Z" fill="url(#gVarre)"/></g>`;
}

// contador animado de número: "78%" etc. u 0..1
export function contaNum(valor, u, dec = 0) {
  const v = valor * ease.out(clamp(u));
  return dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
}

// ícones de linha simples (24x24 base), centrados
export function ico(kind, cx, cy, s = 1, cor = C.navy, sw = 2.2) {
  const st = `fill="none" stroke="${cor}" stroke-width="${f(sw / s)}" stroke-linecap="round" stroke-linejoin="round"`;
  const P = {
    alvo: `<circle r="10" ${st}/><circle r="5.5" ${st}/><circle r="1.6" fill="${cor}"/>`,
    pessoas: `<circle cx="-4" cy="-4" r="3.6" ${st}/><path d="M-11,8 Q-4,-1 3,8" ${st}/><circle cx="6" cy="-3" r="3" ${st}/><path d="M3,5 Q8,0 12,7" ${st}/>`,
    escudo: `<path d="M0,-11 L9,-7 L9,0 Q9,8 0,11 Q-9,8 -9,0 L-9,-7Z" ${st}/><path d="M-4,0 L-1,3 L5,-3" ${st}/>`,
    alerta: `<path d="M0,-10 L10,8 L-10,8Z" ${st}/><path d="M0,-3 L0,2" ${st}/><circle cy="5" r="1" fill="${cor}"/>`,
    grafico: `<path d="M-10,9 L10,9" ${st}/><path d="M-7,9 L-7,1 M-2,9 L-2,-4 M3,9 L3,-1 M8,9 L8,-8" ${st}/>`,
    raio: `<path d="M2,-11 L-6,1 L0,1 L-2,11 L6,-1 L0,-1Z" ${st}/>`,
    livro: `<path d="M-10,-8 Q-5,-10 0,-7 Q5,-10 10,-8 L10,8 Q5,6 0,9 Q-5,6 -10,8Z M0,-7 L0,9" ${st}/>`,
    engrenagem: `<circle r="4" ${st}/><path d="M0,-10 L0,-7 M0,7 L0,10 M-10,0 L-7,0 M7,0 L10,0 M-7,-7 L-5,-5 M5,5 L7,7 M7,-7 L5,-5 M-5,5 L-7,7" ${st}/><circle r="7" ${st}/>`,
    lupa: `<circle cx="-2" cy="-2" r="7" ${st}/><path d="M3,3 L10,10" ${st}/>`,
    megafone: `<path d="M-10,-3 L-4,-3 L6,-9 L6,9 L-4,3 L-10,3Z M-6,3 L-4,10" ${st}/>`,
    painel: `<rect x="-10" y="-9" width="20" height="18" rx="2" ${st}/><path d="M-6,4 L-6,0 M-1,4 L-1,-4 M4,4 L4,-1" ${st}/>`,
    estrela: `<path d="M0,-10 L3,-3 L10,-3 L4.5,1.5 L6.5,9 L0,4.5 L-6.5,9 L-4.5,1.5 L-10,-3 L-3,-3Z" ${st}/>`,
    seta: `<path d="M-9,0 L9,0 M3,-6 L9,0 L3,6" ${st}/>`,
    check: `<path d="M-8,0 L-2,6 L9,-6" ${st}/>`,
    cerebro: `<path d="M-2,-9 Q-9,-10 -9,-3 Q-12,1 -8,5 Q-7,10 -2,9 Z M2,-9 Q9,-10 9,-3 Q12,1 8,5 Q7,10 2,9 Z M-2,-9 L-2,9 M2,-9 L2,9" ${st}/>`,
    cadeado: `<rect x="-8" y="-2" width="16" height="12" rx="2" ${st}/><path d="M-5,-2 L-5,-6 Q0,-12 5,-6 L5,-2" ${st}/>`,
    rota: `<circle cx="-7" cy="7" r="2.5" ${st}/><circle cx="7" cy="-7" r="2.5" ${st}/><path d="M-5,6 Q6,6 0,0 Q-6,-6 5,-6" ${st}/>`,
  };
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(s)})">${P[kind] ?? P.alvo}</g>`;
}
