// Base compartilhada da curta DTS de 60 s ("Minha trajetória na A&M em 60 segundos").
// Toda cena é uma função pura do tempo: desenhar(t, ctx) -> string SVG (1920 x 1080).
//
// Este arquivo reúne: paleta, personagens, ícones (reexportados de ../dts), fundos,
// e os efeitos "After Effects" desenhados em SVG: brilho, desfoque de movimento, varredura
// de luz, onda de choque, partículas, glitch RGB, revelação por máscara, digitação,
// cantos de HUD, janelas de interface flutuantes, tremor de câmera e o banner DTS animado.
import { clamp, lerp, inv, ease, kf, n2, esc, measure, rng, hash, noise } from '../core.js';
import { pessoa, INK, ELENCO_DTS } from '../dts/pessoas.js';
import { COR, txt, largura, cartao, pilula, icone, faiscas, marcaAM, predioAM, robo, cavalete } from '../dts/objetos.js';

export { clamp, lerp, inv, ease, kf, n2, esc, measure, rng, hash, noise };
export { pessoa, INK, ELENCO_DTS };
export { COR, txt, largura, cartao, pilula, icone, faiscas, marcaAM, predioAM, robo, cavalete };

const f = n2;
export const W = 1920, H = 1080, CHAO = 840;

// ---------- curvas de animação ----------
// back: entra com leve "overshoot" (0 -> 1, passa um pouco de 1 e volta)
export const back = (t, a, d = 0.42) => ease.back(inv(a, a + d, t));
export const fin = (t, a, d = 0.25) => ease.out(inv(a, a + d, t));      // 0 -> 1 suave
export const fout = (t, a, d = 0.25) => 1 - ease.inOut(inv(a, a + d, t)); // 1 -> 0 suave
export const janela = (t, a, b, r = 0.25) => Math.min(fin(t, a, r), fout(t, b - r, r)); // entra em a, sai até b
// escala a partir de um ponto (pop-in)
export const popG = (k, x, y, body) => (k <= 0.001 ? '' : `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})">${body}</g>`);
export const opa = (o, body) => (o >= 0.999 ? body : o <= 0.001 ? '' : `<g opacity="${f(o)}">${body}</g>`);
export const mover = (x, y, body, r = 0, s = 1) => `<g transform="translate(${f(x)} ${f(y)})${r ? ` rotate(${f(r)})` : ''}${s !== 1 ? ` scale(${f(s)})` : ''}">${body}</g>`;

// ---------- fundos ----------
// Fundo creme quadriculado com manchas pastel (linguagem do vídeo Canteiro).
export function fundoCreme(t, o = {}) {
  let s = `<rect width="${W}" height="${H}" fill="${COR.cream}"/>`;
  let g = '';
  for (let x = 0; x <= W; x += 48) g += `M${x},0 L${x},${H} `;
  for (let y = 0; y <= H; y += 48) g += `M0,${y} L${W},${y} `;
  s += `<path d="${g}" stroke="${COR.grid}" stroke-width="1.5"/>`;
  const blobs = o.blobs ?? [['#d7e4ee', 380, 380, 420, 300, 0], ['#f8e2c2', 1000, 700, 560, 280, 1.7], ['#f3dada', 1560, 360, 400, 320, 3.1]];
  for (const [c, x, y, rx, ry, ph] of blobs) {
    s += `<ellipse cx="${f(x + Math.sin(t * 0.35 + ph) * 40)}" cy="${f(y + Math.cos(t * 0.3 + ph) * 26)}" rx="${rx}" ry="${ry}" fill="${c}" opacity=".62"/>`;
  }
  if (o.doodles !== false) {
    const doodles = [[170, 230, 'x'], [1240, 150, 'tri'], [1790, 640, 'x'], [700, 140, 'o'], [1500, 780, 'o']];
    for (const [x, y, k] of doodles) {
      const yy = y + Math.sin(t * 0.8 + x) * 6;
      if (k === 'x') s += `<path d="M${x - 10},${f(yy - 10)} l20,20 M${x + 10},${f(yy - 10)} l-20,20" stroke="${COR.tan}" stroke-width="4" stroke-linecap="round"/>`;
      else if (k === 'tri') s += `<path d="M${x},${f(yy - 12)} l12,20 l-24,0Z" fill="none" stroke="${COR.tan}" stroke-width="3.5" stroke-linejoin="round"/>`;
      else s += `<circle cx="${x}" cy="${f(yy)}" r="9" fill="none" stroke="${COR.tan}" stroke-width="3"/>`;
    }
  }
  return s;
}
export const chao = (y = CHAO) => `<rect x="-200" y="${y}" width="${W + 400}" height="5" rx="2" fill="#d9ccb4"/>`;

// Fundo navy premium: gradiente radial, grade de pontos sutil, bokeh e feixes de luz suaves.
// Sem linhas diagonais atravessando a tela.
export function fundoNavy(t, o = {}) {
  const id = o.id ?? 'nv';
  const cx = o.cx ?? 960, cy = o.cy ?? 470;
  let s = `<defs><radialGradient id="${id}g" cx="${f(cx / W)}" cy="${f(cy / H)}" r="0.9"><stop offset="0" stop-color="#0f4372"/><stop offset="0.45" stop-color="#062e50"/><stop offset="1" stop-color="#00172a"/></radialGradient>`
    + `<radialGradient id="${id}o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${COR.orange}" stop-opacity=".55"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${id}b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#7fb6ea" stop-opacity=".5"/><stop offset="1" stop-color="#7fb6ea" stop-opacity="0"/></radialGradient></defs>`
    + `<rect width="${W}" height="${H}" fill="url(#${id}g)"/>`;
  // grade de pontos
  let d = '';
  for (let y = 36; y < H; y += 44) for (let x = 36; x < W; x += 44) d += `M${x},${y}h.01`;
  s += `<path d="${d}" stroke="#ffffff" stroke-opacity=".07" stroke-width="3.2" stroke-linecap="round"/>`;
  // bokeh
  const r = rng(o.seed ?? 7);
  for (let i = 0; i < 16; i++) {
    const x = r() * W, y = r() * H * 0.85, rr = 30 + r() * 90, ph = r() * 6;
    const col = i % 3 === 0 ? `url(#${id}o)` : `url(#${id}b)`;
    s += `<circle cx="${f(x + Math.sin(t * 0.3 + ph) * 30)}" cy="${f(y + Math.cos(t * 0.25 + ph) * 20)}" r="${f(rr)}" fill="${col}" opacity="${f(0.25 + 0.2 * Math.sin(t * 0.8 + ph))}"/>`;
  }
  // feixes de luz vindos de cima
  if (o.feixes !== false) {
    for (let i = 0; i < 4; i++) {
      const x = 260 + i * 470 + Math.sin(t * 0.2 + i) * 40;
      s += `<path d="M${f(x - 40)},-20 L${f(x + 40)},-20 L${f(x + 260)},${H} L${f(x - 260)},${H}Z" fill="#ffffff" opacity="${f(0.025 + 0.015 * Math.sin(t * 0.6 + i * 2))}"/>`;
    }
  }
  return s;
}

// ---------- efeitos "After Effects" ----------
// Filtros reutilizáveis. Inclua UMA vez por quadro via defsFX() no começo da cena.
// Uso: filter="url(#fxGlow)", filter="url(#fxBlurX)" (desfoque de movimento horizontal),
//      filter="url(#fxBlurY)" (vertical), filter="url(#fxSombra)".
export function defsFX() {
  return `<defs>`
    + `<filter id="fxGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    + `<filter id="fxGlowForte" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    + `<filter id="fxBlurX" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="18 0"/></filter>`
    + `<filter id="fxBlurY" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="0 18"/></filter>`
    + `<filter id="fxDesfoque" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>`
    + `<filter id="fxSombra" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#0b1a30" flood-opacity=".28"/></filter>`
    + `<linearGradient id="fxVarre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `</defs>`;
}

// Varredura de luz (brilho especular) atravessando um retângulo arredondado.
// u: 0 -> 1 progresso da passada. id: único na cena.
export function varredura(id, x, y, w, h, u, r = 18) {
  if (u <= 0 || u >= 1) return '';
  const bx = x - w * 0.4 + (w * 1.4) * ease.inOut(u);
  return `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}"/></clipPath>`
    + `<g clip-path="url(#${id})"><path d="M${f(bx)},${f(y - 20)} L${f(bx + w * 0.16)},${f(y - 20)} L${f(bx + w * 0.06)},${f(y + h + 20)} L${f(bx - w * 0.1)},${f(y + h + 20)}Z" fill="url(#fxVarre)"/></g>`;
}

// Onda de choque: anel que se expande e some. age = t - t0.
export function onda(x, y, age, o = {}) {
  const d = o.d ?? 0.7;
  if (age < 0 || age > d) return '';
  const k = ease.out(age / d);
  const r = lerp(o.r0 ?? 20, o.r1 ?? 420, k);
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="none" stroke="${o.cor ?? COR.orange}" stroke-width="${f((o.w ?? 14) * (1 - k) + 1)}" opacity="${f(1 - k)}"/>`
    + (o.duplo === false ? '' : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.72)}" fill="none" stroke="#fff" stroke-width="${f(6 * (1 - k))}" opacity="${f(0.7 * (1 - k))}"/>`);
}

// Flash de tela cheia (corte de impacto). age = t - t0.
export function flash(age, d = 0.22, cor = '#ffffff', max = 0.75) {
  if (age < 0 || age > d) return '';
  return `<rect width="${W}" height="${H}" fill="${cor}" opacity="${f(max * (1 - age / d))}"/>`;
}

// Explosão de partículas (pontos e losangos) a partir de (x, y). age = t - t0.
export function particulas(seed, x, y, age, o = {}) {
  const d = o.d ?? 0.9, n = o.n ?? 26;
  if (age < 0 || age > d) return '';
  const r = rng(seed);
  const cores = o.cores ?? [COR.orange, COR.orange2, COR.blue2, '#ffffff', COR.lblue];
  let s = '';
  const k = age / d;
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, v = (o.v ?? 520) * (0.4 + r() * 0.8);
    const px = x + Math.cos(a) * v * ease.out(k), py = y + Math.sin(a) * v * ease.out(k) + (o.g ?? 160) * k * k;
    const sz = (o.sz ?? 9) * (0.5 + r()) * (1 - k);
    const c = cores[i % cores.length];
    s += i % 3 === 0
      ? `<rect x="${f(px - sz / 2)}" y="${f(py - sz / 2)}" width="${f(sz)}" height="${f(sz)}" fill="${c}" transform="rotate(${f(45 + age * 300)} ${f(px)} ${f(py)})"/>`
      : `<circle cx="${f(px)}" cy="${f(py)}" r="${f(sz / 2)}" fill="${c}"/>`;
  }
  return s;
}

// Partículas flutuando no ambiente (poeira de luz), em loop.
export function poeira(t, seed, n, area = [0, 0, W, H], cor = '#ffffff', alpha = 0.5) {
  const r = rng(seed);
  let s = '';
  const [x0, y0, w, h] = area;
  for (let i = 0; i < n; i++) {
    const bx = x0 + r() * w, sp = 12 + r() * 30, ph = r() * h, sz = 1.5 + r() * 3.5;
    const y = y0 + h - ((t * sp + ph) % h);
    const x = bx + Math.sin(t * 0.9 + i) * 14;
    const a = alpha * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)));
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(sz)}" fill="${cor}" opacity="${f(a)}"/>`;
  }
  return s;
}

// Glitch RGB: o texto se divide em faixas deslocadas em ciano e vermelho. k = intensidade 0..1.
export function glitch(str, x, y, o, t, k) {
  const base = txt(str, x, y, o);
  if (k <= 0.01) return base;
  const r = rng(Math.floor(t * 24) * 7 + 3);
  const dx = (r() - 0.5) * 30 * k;
  let s = `<g opacity=".8">${txt(str, x - 6 * k + dx, y, { ...o, fill: '#2fd4ff' })}${txt(str, x + 6 * k - dx, y, { ...o, fill: '#ff3b5c' })}</g>` + base;
  // faixas
  const size = o.size ?? 32;
  for (let i = 0; i < 3; i++) {
    const yy = y - size * r(), hh = 4 + r() * size * 0.18, off = (r() - 0.5) * 60 * k;
    const id = `gl${Math.floor(t * 24)}${i}${Math.round(x)}`;
    s += `<clipPath id="${id}"><rect x="${f(x - 2000)}" y="${f(yy)}" width="4000" height="${f(hh)}"/></clipPath><g clip-path="url(#${id})" transform="translate(${f(off)} 0)">${txt(str, x, y, { ...o, fill: i % 2 ? '#2fd4ff' : (o.fill ?? COR.navy) })}</g>`;
  }
  return s;
}

// Revelação por máscara: mostra `body` dentro de um retângulo que cresce (dir: 'x' da esquerda, 'y' de baixo).
export function revela(id, x, y, w, h, u, body, dir = 'x') {
  if (u <= 0) return '';
  if (u >= 1) return body;
  const e = ease.out(u);
  const rect = dir === 'x' ? `<rect x="${f(x)}" y="${f(y)}" width="${f(w * e)}" height="${f(h)}"/>` : `<rect x="${f(x)}" y="${f(y + h * (1 - e))}" width="${f(w)}" height="${f(h * e)}"/>`;
  return `<clipPath id="${id}">${rect}</clipPath><g clip-path="url(#${id})">${body}</g>`;
}

// Máquina de escrever: mostra parte do texto + cursor piscando. u: 0..1.
export function digita(str, x, y, o, u, t) {
  const n = Math.round(str.length * clamp(u));
  const parte = str.slice(0, n);
  let s = txt(parte, x, y, { ...o, anchor: 'start' });
  if (u < 1.15 && Math.floor(t * 3) % 2 === 0) {
    const w = largura(parte, o.size ?? 32, o.weight ?? 800, o.family ?? 'Outfit');
    s += `<rect x="${f(x + w + 4)}" y="${f(y - (o.size ?? 32) * 0.8)}" width="${f((o.size ?? 32) * 0.08 + 2)}" height="${f((o.size ?? 32) * 0.9)}" fill="${o.cursor ?? COR.orange}"/>`;
  }
  return s;
}

// Cantos de HUD que se desenham ao redor de uma caixa. u: 0..1.
export function hudCantos(x, y, w, h, u, cor = COR.orange, L = 34, sw = 5) {
  if (u <= 0) return '';
  const l = L * ease.out(clamp(u)), pad = 14 * (1 - ease.out(clamp(u)));
  const X0 = x - pad, Y0 = y - pad, X1 = x + w + pad, Y1 = y + h + pad;
  return `<path d="M${f(X0)},${f(Y0 + l)} L${f(X0)},${f(Y0)} L${f(X0 + l)},${f(Y0)} M${f(X1 - l)},${f(Y0)} L${f(X1)},${f(Y0)} L${f(X1)},${f(Y0 + l)} M${f(X1)},${f(Y1 - l)} L${f(X1)},${f(Y1)} L${f(X1 - l)},${f(Y1)} M${f(X0 + l)},${f(Y1)} L${f(X0)},${f(Y1)} L${f(X0)},${f(Y1 - l)}" fill="none" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${f(clamp(u * 2))}"/>`;
}

// Janela de interface flutuante (moldura de app). kind: 'code' | 'chart' | 'chat' | 'kanban' | 'cloud' | 'ai'
// escuro: true para janela navy. t anima o conteúdo.
export function janelaUI(kind, x, y, w, h, t, o = {}) {
  const dark = o.escuro ?? false;
  const bg = dark ? COR.navy2 : '#ffffff', fg = dark ? '#e6eef8' : COR.navy, sub = dark ? '#5f7896' : '#c9d4e2';
  let s = `<rect x="${f(x + 5)}" y="${f(y + 8)}" width="${f(w)}" height="${f(h)}" rx="14" fill="rgba(11,26,48,.18)"/>`
    + `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="14" fill="${bg}" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M${f(x)},${f(y + 28)} L${f(x + w)},${f(y + 28)}" stroke="${dark ? '#24456b' : '#e3e9f1'}" stroke-width="2"/>`
    + `<circle cx="${f(x + 16)}" cy="${f(y + 14)}" r="4.5" fill="#ff6b5e"/><circle cx="${f(x + 30)}" cy="${f(y + 14)}" r="4.5" fill="#ffc24b"/><circle cx="${f(x + 44)}" cy="${f(y + 14)}" r="4.5" fill="#3fc77a"/>`;
  if (o.titulo) s += txt(o.titulo, x + w - 14, y + 20, { anchor: 'end', size: 13, weight: 700, family: 'DM Sans', fill: dark ? '#8fa6c2' : COR.grey, ls: 1.5 });
  const ix = x + 16, iy = y + 44, iw = w - 32, ih = h - 58;
  if (kind === 'code') {
    const linhas = Math.max(2, Math.floor(ih / 20));
    for (let i = 0; i < linhas; i++) {
      const ww = (0.3 + 0.6 * ((i * 37) % 10) / 10) * iw;
      const vis = clamp((t * 3 - i * 0.4) % (linhas + 2) / 1);
      s += `<rect x="${f(ix + (i % 3) * 14)}" y="${f(iy + i * 20)}" width="${f(ww * vis)}" height="9" rx="4" fill="${i % 4 === 0 ? COR.orange : i % 4 === 2 ? COR.blue2 : sub}"/>`;
    }
  } else if (kind === 'chart') {
    const n = 6;
    for (let i = 0; i < n; i++) {
      const v = 0.3 + 0.6 * Math.abs(Math.sin(i * 1.7 + t * 1.2));
      const bh = ih * v, bw = iw / n * 0.6;
      s += `<rect x="${f(ix + i * iw / n + bw * 0.3)}" y="${f(iy + ih - bh)}" width="${f(bw)}" height="${f(bh)}" rx="3" fill="${i === n - 1 ? COR.orange : COR.blue2}"/>`;
    }
  } else if (kind === 'chat') {
    s += `<rect x="${f(ix)}" y="${f(iy)}" width="${f(iw * 0.7)}" height="${f(ih * 0.3)}" rx="10" fill="${sub}"/><rect x="${f(ix + iw * 0.3)}" y="${f(iy + ih * 0.4)}" width="${f(iw * 0.7)}" height="${f(ih * 0.3)}" rx="10" fill="${COR.orange}"/>`;
    for (let i = 0; i < 3; i++) s += `<circle cx="${f(ix + 18 + i * 14)}" cy="${f(iy + ih * 0.85)}" r="4.5" fill="${fg}" opacity="${f(0.3 + 0.7 * Math.abs(Math.sin(t * 5 + i)))}"/>`;
  } else if (kind === 'kanban') {
    for (let c = 0; c < 3; c++) for (let i = 0; i < 3 - (c === 2 ? 1 : 0); i++) {
      s += `<rect x="${f(ix + c * iw / 3 + 3)}" y="${f(iy + i * (ih / 3))}" width="${f(iw / 3 - 6)}" height="${f(ih / 3 - 6)}" rx="5" fill="${c === 2 ? COR.green : c === 1 ? COR.orange : sub}" opacity=".85"/>`;
    }
  } else if (kind === 'cloud') {
    const cx = x + w / 2, cy = y + 28 + (h - 28) / 2;
    s += `<path d="M${f(cx - 40)},${f(cy + 18)} a22,22 0 0 1 4,-44 a30,30 0 0 1 56,-4 a22,22 0 0 1 22,48Z" fill="${COR.lblue}" stroke="${INK}" stroke-width="3"/><path d="M${f(cx)},${f(cy + 6)} l0,-24 m-10,10 l10,-10 l10,10" stroke="${COR.navy}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (kind === 'ai') {
    const cx = x + w / 2, cy = y + 28 + (h - 28) / 2, rr = Math.min(iw, ih) * 0.32;
    s += `<rect x="${f(cx - rr)}" y="${f(cy - rr)}" width="${f(rr * 2)}" height="${f(rr * 2)}" rx="10" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`
      + txt('IA', cx, cy + rr * 0.35, { size: rr, weight: 900, fill: '#fff' });
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      s += `<path d="M${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)} L${f(cx + Math.cos(a) * rr * 1.5)},${f(cy + Math.sin(a) * rr * 1.5)}" stroke="${COR.orange}" stroke-width="4"/>`;
    }
  }
  return s;
}

// Rastro de movimento: desenha `fn(x, y)` em posições anteriores com opacidade decrescente.
// pos(dt) devolve [x, y] no instante t - dt.
export function rastro(pos, fn, n = 4, passo = 0.035) {
  let s = '';
  for (let i = n; i >= 1; i--) {
    const [x, y] = pos(i * passo);
    s += `<g opacity="${f(0.12 * (n - i + 1) / n)}">${fn(x, y)}</g>`;
  }
  const [x, y] = pos(0);
  return s + fn(x, y);
}

// Tremor de câmera: deslocamento [dx, dy] que decai após t0.
export function tremor(t, t0, d = 0.35, amp = 14) {
  const u = t - t0;
  if (u < 0 || u > d) return [0, 0];
  const k = 1 - u / d;
  return [Math.sin(u * 90) * amp * k, Math.cos(u * 77) * amp * 0.6 * k];
}

// Balão de fala com rabicho (cartão branco). (x, y) = centro; lado do rabicho: 'baixo' | 'esq' | 'dir'
export function balao(x, y, w, h, corpo, o = {}) {
  const r = o.r ?? Math.min(h / 2, 36);
  const rab = o.rabicho ?? 'baixo';
  let s = cartao(x - w / 2, y - h / 2, w, h, { r });
  if (rab === 'baixo') s += `<path d="M${f(x - 12)},${f(y + h / 2 - 3)} L${f(x)},${f(y + h / 2 + 20)} L${f(x + 12)},${f(y + h / 2 - 3)}" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><rect x="${f(x - 14)}" y="${f(y + h / 2 - 9)}" width="28" height="8" fill="#fff"/>`;
  return s + corpo;
}

// Chip (pílula branca com ícone + rótulo), como os do Canteiro.
export function chipRotulo(x, y, ic, rotulo, o = {}) {
  const size = o.size ?? 26;
  const w = largura(rotulo, size, 800) + size * 3.2;
  const h = size * 2.5;
  return pilula(x - w / 2, y - h / 2, w, h, o.fill ?? '#fff', o.stroke ?? COR.navy, 3.5)
    + `<circle cx="${f(x - w / 2 + h / 2)}" cy="${f(y)}" r="${f(h * 0.36)}" fill="${o.iconeFundo ?? '#fff4e6'}"/>`
    + icone(ic, x - w / 2 + h / 2, y, size / 37)
    + txt(rotulo, x - w / 2 + h * 0.95, y + size * 0.36, { anchor: 'start', size, weight: 800, fill: o.cor ?? COR.navy });
}

// Carimbo inclinado (como "OPORTUNIDADE" / "MÉTODO" do Canteiro). k = escala do pop.
export function carimbo(str, x, y, k, o = {}) {
  const size = o.size ?? 62;
  const w = largura(str, size, 900) + str.length * 4 + 70, h = size * 1.6;
  return popG(k, x, y, `<g transform="rotate(${o.rot ?? -5})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="14" fill="${o.fill ?? COR.orange}" stroke="${o.stroke ?? COR.navy}" stroke-width="5"/>${txt(str, 0, size * 0.36, { size, weight: 900, fill: o.cor ?? '#fff', ls: 4 })}</g>`);
}

// ---------- marcas ----------
// Banner DTS "Digital & Technology Services" (reconstrução do banner da newsletter), com
// montagem animada estilo After Effects a partir de t0. o: { x, y (centro), s (escala), id }
// Linha do tempo (u = t - t0):
//   0.00-0.35 painel abre na horizontal com borda laranja e desfoque de movimento
//   0.15-0.60 faixa tricolor varre da esquerda
//   0.25-0.75 letras D, T, S caem uma a uma com overshoot e rastro
//   0.55-0.80 divisória laranja cresce
//   0.65-1.15 "Digital & Technology / Services" revelado por máscara
//   0.70-1.20 faixas diagonais deslizam (dentro do painel)
//   0.95-1.55 varredura de luz
//   0.85-1.25 cantos de HUD
export function bannerDTS(t, t0, o = {}) {
  const u = t - t0;
  if (u < 0) return '';
  const id = o.id ?? 'bd';
  const BW = 840, BH = 190;
  const kx = ease.out5(inv(0, 0.35, u));
  let s = '';
  // painel
  const pw = BW * kx;
  s += `<clipPath id="${id}c"><rect x="${f(-pw / 2)}" y="${-BH / 2}" width="${f(pw)}" height="${BH}" rx="18"/></clipPath>`;
  s += `<rect x="${f(-pw / 2 + 8)}" y="${-BH / 2 + 12}" width="${f(pw)}" height="${BH}" rx="18" fill="rgba(0,20,40,.25)"/>`;
  s += `<rect x="${f(-pw / 2)}" y="${-BH / 2}" width="${f(pw)}" height="${BH}" rx="18" fill="${COR.navy}" stroke="${INK}" stroke-width="4"/>`;
  if (kx < 1) s += `<rect x="${f(pw / 2 - 6)}" y="${-BH / 2 - 10}" width="12" height="${BH + 20}" rx="6" fill="${COR.orange}" filter="url(#fxBlurX)"/>`;
  let dentro = '';
  // faixas diagonais
  const kd = ease.out(inv(0.7, 1.2, u));
  const dx = (1 - kd) * 420;
  dentro += `<path d="M${f(260 + dx)},95 L${f(410 + dx)},-95 M${f(342 + dx)},95 L${f(462 + dx)},-95" stroke="${COR.slate}" stroke-width="16"/><path d="M${f(295 + dx)},95 L${f(435 + dx)},-95" stroke="${COR.orange}" stroke-width="3"/>`;
  // letras D T S
  const letras = ['D', 'T', 'S'];
  let lx = -370;
  letras.forEach((L, i) => {
    const a = 0.25 + i * 0.09;
    const k = clamp(inv(a, a + 0.32, u));
    const y = lerp(-170, 0, ease.back(k));
    const w = largura(L, 120, 900);
    if (k > 0) {
      if (k < 0.9) dentro += `<g opacity="${f(0.35 * (1 - k))}" filter="url(#fxBlurY)">${txt(L, lx, y + 38 - 40, { anchor: 'start', size: 120, weight: 900, fill: '#fff' })}</g>`;
      dentro += txt(L, lx, y + 38, { anchor: 'start', size: 120, weight: 900, fill: '#fff', extra: `opacity="${f(clamp(k * 3))}"` });
    }
    lx += w;
  });
  // divisória
  const kv = ease.out(inv(0.55, 0.8, u));
  dentro += `<rect x="-118" y="${f(-4 - 42 * kv)}" width="6" height="${f(84 * kv)}" fill="${COR.orange}"/>`;
  // texto
  const kt = inv(0.65, 1.15, u);
  dentro += revela(`${id}t`, -100, -60, 520, 120, kt,
    txt('Digital & Technology', -94 + (1 - ease.out(kt)) * -20, -4, { anchor: 'start', size: 40, weight: 600, family: 'DM Sans', fill: '#dbe6f2' })
    + txt('Services', -94 + (1 - ease.out(kt)) * -20, 40, { anchor: 'start', size: 40, weight: 600, family: 'DM Sans', fill: '#dbe6f2' }));
  // faixa tricolor
  const k1 = ease.out(inv(0.15, 0.4, u)), k2 = ease.out(inv(0.25, 0.5, u)), k3 = ease.out(inv(0.35, 0.6, u));
  dentro += `<rect x="-420" y="86" width="${f(400 * k1)}" height="9" fill="${COR.orange}"/><rect x="-20" y="86" width="${f(260 * k2)}" height="9" fill="${COR.slate}"/><rect x="240" y="86" width="${f(180 * k3)}" height="9" fill="${COR.lblue}"/>`;
  s += `<g clip-path="url(#${id}c)">${dentro}</g>`;
  // varredura de luz
  s += varredura(`${id}v`, -BW / 2, -BH / 2, BW, BH, inv(0.95, 1.55, u));
  // brilho laranja pulsando depois de montado
  if (u > 1.2 && o.pulso !== false) s += `<rect x="${-BW / 2 - 6}" y="${-BH / 2 - 6}" width="${BW + 12}" height="${BH + 12}" rx="22" fill="none" stroke="${COR.orange}" stroke-width="3" opacity="${f(0.25 + 0.2 * Math.sin(u * 4))}"/>`;
  // HUD
  if (o.hud !== false) s += hudCantos(-BW / 2 - 22, -BH / 2 - 22, BW + 44, BH + 44, inv(0.85, 1.25, u), COR.orange, 40, 5);
  const sc = o.s ?? 1;
  return `<g transform="translate(${f(o.x ?? 960)} ${f(o.y ?? 420)}) scale(${f(sc)})">${s}</g>`;
}

// Glifo "Λ" do logo PERFORMANCE (o A vira uma barra inclinada + vertical, como na newsletter).
function lambda(x, y, size, cor) {
  const h = size * 0.72, w = size * 0.62;
  return `<path d="M${f(x)},${f(y)} L${f(x + w * 0.62)},${f(y - h)} L${f(x + w * 0.62)},${f(y)}" fill="none" stroke="${cor}" stroke-width="${f(size * 0.11)}" stroke-linejoin="miter"/>`;
}

// Lockup "A&M | PERFORMANCE" (como no topo da newsletter). (x, y) = linha de base, alinhado à esquerda.
// Devolve { svg, w } para facilitar o centramento.
export function lockupPerformance(x, y, size = 64, cor = '#ffffff', o = {}) {
  const k = size / 64;
  let s = marcaAM(x, y + 4 * k, 0.11 * k, { c1: cor, c2: COR.blue2, c3: COR.blue3, c4: COR.lblue });
  let cx = x + 86 * k;
  s += `<rect x="${f(cx)}" y="${f(y - size * 0.72)}" width="${f(3 * k)}" height="${f(size * 0.76)}" fill="${cor}" opacity=".85"/>`;
  cx += 22 * k;
  const p1 = 'PERFORM';
  s += txt(p1, cx, y, { anchor: 'start', size, weight: 500, family: 'DM Sans', fill: cor, ls: 1 });
  cx += largura(p1, size, 500, 'DM Sans') + 7 * k + 2;
  s += lambda(cx, y, size, o.corA ?? cor);
  cx += size * 0.5;
  s += txt('NCE', cx, y, { anchor: 'start', size, weight: 500, family: 'DM Sans', fill: cor, ls: 1 });
  cx += largura('NCE', size, 500, 'DM Sans') + 3;
  return { svg: s, w: cx - x };
}

// Lockup "ALVAREZ & MARSAL" com a marca. (x, y) = linha de base à esquerda. Devolve { svg, w }.
export function lockupAM(x, y, size = 54, cor = '#ffffff', o = {}) {
  const k = size / 54;
  const s1 = marcaAM(x, y + 6 * k, 0.2 * k, o.claro ? {} : { c1: cor, c2: COR.blue2, c3: COR.blue3, c4: COR.lblue });
  const tx = x + 158 * k;
  const w = largura('ALVAREZ & MARSAL', size, 600, 'DM Sans') + 16 * 6 * k;
  return {
    svg: s1 + txt('ALVAREZ & MARSAL', tx, y, { anchor: 'start', size, weight: 600, family: 'DM Sans', fill: cor, ls: 6 * k }),
    w: tx - x + w,
  };
}

// Confete nas cores A&M caindo a partir de t0 (para celebrações).
export function confete(t, t0, seed = 11, n = 60, area = [0, 0, W, H]) {
  const age = t - t0;
  if (age < 0) return '';
  const r = rng(seed);
  const cores = [COR.orange, COR.orange2, COR.blue2, COR.lblue, '#ffffff', COR.blue];
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = area[0] + r() * area[2], vy = 260 + r() * 260, ph = r() * 6, w = 10 + r() * 10, h = 6 + r() * 8;
    const y = area[1] - 40 + age * vy - r() * 300;
    if (y < area[1] - 60 || y > area[1] + area[3] + 40) continue;
    const x = x0 + Math.sin(age * 3 + ph) * 40;
    s += `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="2" fill="${cores[i % cores.length]}" transform="rotate(${f(age * 260 + ph * 60)} ${f(x)} ${f(y)})"/>`;
  }
  return s;
}
