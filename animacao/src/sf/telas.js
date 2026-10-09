// Telas reais do roteiro (slides e cockpit) em molduras no estilo SpecForge: cartão creme com
// contorno de tinta, laptop plano. Funções puras do tempo (idade em s desde a entrada; < 0 = invisível),
// saída em SVG 1920x1080. Imagens: build/filme/slides/<nome>.png (servidas a partir de index.html).
import { clamp, lerp, inv, ease, g, op, tr, n2 } from '../core.js';

const INK = '#3a2a22';
const F = n2;
const K = { creme: '#fbf1de', tampa: '#2b2b36', tampa2: '#1c1c26', tecla: '#4a4a5a', base: '#d5d0c6', base2: '#a39b8f', sombra: 'rgba(70,40,15,.16)' };
// tamanho em px de cada imagem (proporção da tela); o padrão é o slide 2500x1406
const TAM = { 'cockpit-tela1': [693, 444], 'cockpit-tela2': [693, 444] };
const SLIDE = [2500, 1406];

const st = (k = 3, cor = INK) => ` stroke="${cor}" stroke-width="${k}" stroke-linejoin="round"`;
const R = (x, y, w, h, r, fill, k = 3, x2 = '') => `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" rx="${F(r)}" fill="${fill}"${k ? st(k) : ''}${x2 ? ' ' + x2 : ''}/>`;
const img = (nome, x, y, w, h) => `<image href="build/filme/slides/${nome}.png" x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" preserveAspectRatio="xMidYMid slice"/>`;
const uid = (pre, ...p) => ('tl-' + pre + '-' + p.join('-')).replace(/[^a-z0-9-]/gi, '_');
// entrada com exagero, caindo de "queda" px; saída opcional em o.fim
const pop = (idade, d = 0.45) => ease.back(inv(0, d, idade));
const queda = (idade, q = 28, d = 0.45) => -q * (1 - ease.out(inv(0, d, idade)));
const saida = (idade, o, d = 0.3) => (o.fim == null ? 1 : 1 - ease.in(inv(o.fim, o.fim + d, idade)));
const chao = (w, cy) => `<ellipse cx="0" cy="${F(cy + 3)}" rx="${F(w / 2)}" ry="${F(Math.max(7, w * 0.035))}" fill="${K.sombra}"/>`;

export function defs() {
  return `<linearGradient id="tl-brilho" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="tl-vidro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
}

// reflexo que varre a tela (retângulo inclinado com gradiente), u = 0..1 da esquerda p/ direita
function varredura(u, w, h) {
  if (u <= 0 || u >= 1) return '';
  const bw = w * 0.28, x = -bw + u * (w + bw * 2);
  return `<rect x="${F(x)}" y="${F(-h * 0.3)}" width="${F(bw)}" height="${F(h * 1.6)}" fill="url(#tl-brilho)" transform="skewX(-18)"/>`;
}

// =====================================================================
// SLIDE REAL — cartão creme (contorno 3 px, cantos arredondados, sombra curta) com a imagem do slide
// (x, y) = centro; w = largura do cartão (altura = w*1406/2500 + moldura).
// o: rot, fim, id (clipPath), foco [fx, fy, fw, fh] (frações do slide) + zoom 0..1 (push-in p/ o foco)
export function slideReal(nome, x, y, w, idade, o = {}) {
  if (idade < 0) return '';
  const s = pop(idade) * saida(idade, o);
  if (s <= 0.001) return '';
  const pad = o.pad ?? 16, r = 20;
  const iw = w - pad * 2, ih = iw * SLIDE[1] / SLIDE[0], h = ih + pad * 2;
  const id = o.id ?? uid('sl', nome, Math.round(x), Math.round(y));
  // push-in: a região do foco cresce até caber inteira na janela, centrada
  let k = 1, ix = 0, iy = 0;
  const z = ease.inOut(clamp(o.zoom ?? 0));
  if (o.foco && z > 0) {
    const [fx, fy, fw, fh] = o.foco;
    k = lerp(1, Math.min(1 / fw, 1 / fh), z);
    ix = clamp(iw / 2 - (fx + fw / 2) * iw * k, iw - iw * k, 0);
    iy = clamp(ih / 2 - (fy + fh / 2) * ih * k, ih - ih * k, 0);
  }
  const x0 = -w / 2, y0 = -h / 2;
  let b = R(x0, y0 + 8, w, h, r, K.sombra, 0) + R(x0, y0, w, h, r, K.creme, 3);
  b += `<clipPath id="${id}"><rect x="${F(x0 + pad)}" y="${F(y0 + pad)}" width="${F(iw)}" height="${F(ih)}" rx="8"/></clipPath>`;
  b += g('', R(x0 + pad, y0 + pad, iw, ih, 8, K.tampa, 0) + img(nome, x0 + pad + ix, y0 + pad + iy, iw * k, ih * k)
    + R(x0 + pad, y0 + pad, iw, ih, 8, 'url(#tl-vidro)', 0), `clip-path="url(#${id})"`);
  b += R(x0 + pad, y0 + pad, iw, ih, 8, 'none', 2);
  return g(tr(x, y + queda(idade), s, o.rot ?? 0), b);
}

// =====================================================================
// LAPTOP — plano: tampa escura com a tela, base com teclado. (x, y) = base central no chão; w = largura da tampa.
// o: tela (nome da imagem), brilho (true = varredura após a entrada; número = fase 0..1), rot, escala, fim
export function laptop(x, y, w, idade, o = {}) {
  if (idade < 0) return '';
  const s = pop(idade) * saida(idade, o);
  if (s <= 0.001) return '';
  const tela = o.tela ?? 'cockpit-tela1';
  const [tw, th] = TAM[tela] ?? SLIDE;
  const bz = w * 0.03, iw = w - bz * 2, ih = iw * th / tw, lh = ih + bz * 2.6;
  const bh = w * 0.075, bw = w * 1.08;
  const id = uid('lap', tela, Math.round(x), Math.round(y));
  let b = chao(bw * 1.05, 0);
  // base: placa clara com faixa de sombra e teclado
  b += R(-bw / 2, -bh, bw, bh, bh * 0.35, K.base, 0) + R(-bw / 2, -bh * 0.35, bw, bh * 0.35, bh * 0.2, K.base2, 0, 'opacity=".45"') + R(-bw / 2, -bh, bw, bh, bh * 0.35, 'none', 3);
  const kx = -w * 0.38, kw = w * 0.76, ky = -bh * 0.9, kh = bh * 0.5;
  b += R(kx, ky, kw, kh, 4, K.tampa, 0);
  for (let li = 0; li < 3; li++) for (let j = 0; j < 14; j++) b += R(kx + 5 + j * (kw - 10) / 14, ky + 3 + li * (kh - 6) / 3, (kw - 10) / 14 - 3, (kh - 6) / 3 - 2, 2, K.tecla, 0);
  b += R(-w * 0.09, -bh * 0.36, w * 0.18, bh * 0.26, 3, K.base2, 0, 'opacity=".6"');
  // tampa: moldura escura, câmera, tela com imagem e varredura
  const ly = -bh - lh + bz * 0.4;
  b += R(-w / 2, ly + 8, w, lh, w * 0.03, K.sombra, 0) + R(-w / 2, ly, w, lh, w * 0.03, K.tampa, 3);
  b += `<circle cx="0" cy="${F(ly + bz * 0.55)}" r="${F(Math.max(2.5, bz * 0.16))}" fill="${K.tampa2}"${st(1.5)}/>`;
  const sx = -iw / 2, sy = ly + bz * 1.1;
  const u = o.brilho === true ? (idade - 0.5) / 1.2 : o.brilho == null ? -1 : o.brilho;
  b += `<clipPath id="${id}"><rect x="${F(sx)}" y="${F(sy)}" width="${F(iw)}" height="${F(ih)}" rx="6"/></clipPath>`;
  b += g('', R(sx, sy, iw, ih, 6, K.tampa2, 0) + img(tela, sx, sy, iw, ih) + g(tr(sx, sy), varredura(u, iw, ih))
    + R(sx, sy, iw, ih, 6, 'url(#tl-vidro)', 0), `clip-path="url(#${id})"`);
  b += R(sx, sy, iw, ih, 6, 'none', 2);
  return g(tr(x, y + queda(idade, 36), s * (o.escala ?? 1), o.rot ?? 0), b);
}
