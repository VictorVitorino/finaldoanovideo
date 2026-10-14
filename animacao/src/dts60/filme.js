// Curta DTS de 60 s: "Minha trajetória na Alvarez & Marsal em 60 segundos".
// Monta as cenas de src/dts60/cenas/*.js e desenha por cima a interface comum:
// marca DTS, cronômetro regressivo de 60 s, barra de progresso, chip da cena,
// legenda karaokê e a cortina diagonal entre cenas.
//
// Tempos: src/dts60/tempos.json (gerado por producao/dts60_audio.py a partir da narração).
// Render: node render.mjs frames --test dts60 --out build/dts60/frames --workers 4
import { W, H, COR, txt, largura, pilula, back, fin, clamp, lerp, inv, ease, n2, measure, defsFX } from './base.js';
import * as capa from './cenas/capa.js';
import * as chegada from './cenas/chegada.js';
import * as dts from './cenas/dts.js';
import * as papel from './cenas/papel.js';
import * as ia from './cenas/ia.js';
import * as aprender from './cenas/aprender.js';
import * as entregas from './cenas/entregas.js';
import * as lideranca from './cenas/lideranca.js';
import * as foco from './cenas/foco.js';
import * as final from './cenas/final.js';

const f = n2;
const CENAS = { capa, chegada, dts, papel, ia, aprender, entregas, lideranca, foco, final };

export function buildFilme(T) {
  const P = T.palavras, C = T.cenas, ORD = T.ordem, TOTAL = T.duracao;
  const DEST = new Set(T.destaque);
  const wa = i => P[i].a, wb = i => P[i].b;
  const fim = id => { const i = ORD.indexOf(id); return i + 1 < ORD.length ? C[ORD[i + 1]] : TOTAL; };
  const cenaEm = t => { let c = ORD[0]; for (const id of ORD) if (t >= C[id]) c = id; return c; };
  const ctxBase = { T, P, C, TOTAL, wa, wb, produtos: T.produtos, fim };

  // ---------- interface ----------
  function topo(t, escuro, id) {
    const navy = escuro ? '#fff' : COR.navy;
    const cinza = escuro ? 'rgba(255,255,255,.62)' : COR.grey;
    let s = '';
    const px = W * clamp(t / TOTAL);
    s += `<rect x="0" y="0" width="${f(px)}" height="9" fill="${COR.orange}"/>`;
    let r = '';
    for (let x = Math.ceil(px / 14) * 14; x < W; x += 14) r += `M${x},0 L${x},${x % 70 === 0 ? 12 : 7} `;
    if (r) s += `<path d="${r}" stroke="${escuro ? 'rgba(255,255,255,.25)' : '#cdbf9f'}" stroke-width="1.6"/>`;
    const wD = largura('DTS', 46, 900);
    s += txt('DTS', 44, 82, { anchor: 'start', size: 46, weight: 900, fill: navy, ls: 1 })
      + `<rect x="${f(48 + wD + 6)}" y="68" width="11" height="11" fill="${COR.orange}"/>`
      + `<path d="M${f(48 + wD + 34)},54 L${f(48 + wD + 34)},84" stroke="${cinza}" stroke-width="2"/>`
      + txt('ALVAREZ & MARSAL', 48 + wD + 50, 76, { anchor: 'start', size: 17, weight: 700, family: 'DM Sans', fill: cinza, ls: 4 });
    // cronômetro regressivo "em 60 segundos"
    const resta = Math.max(0, Math.ceil(60 * (1 - t / TOTAL) - 1e-6));
    const ang = 360 * clamp(t / TOTAL);
    const rr = 22, cx = 74, cy = 146;
    const a = (ang - 90) * Math.PI / 180;
    const large = ang > 180 ? 1 : 0;
    s += pilula(44, 118, 138, 56, escuro ? 'rgba(255,255,255,.08)' : '#fff', navy, 3)
      + `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${escuro ? 'rgba(255,255,255,.12)' : '#eef2f7'}"/>`
      + (ang > 0.5 ? `<path d="M${cx},${cy} L${cx},${cy - rr} A${rr},${rr} 0 ${large} 1 ${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}Z" fill="${COR.orange}"/>` : '')
      + `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${navy}" stroke-width="2.5"/>`
      + txt(`0:${String(resta).padStart(2, '0')}`, 106, cy + 11, { anchor: 'start', size: 30, weight: 800, fill: navy });
    // chip da cena
    const mod = CENAS[id];
    if (mod.CHIP) {
      const [sup, tit] = mod.CHIP;
      const num = ORD.indexOf(id);
      const k = back(t, C[id] + 0.05, 0.45);
      const wTit = largura(tit, 27, 800), wSup = largura(sup, 13, 700, 'DM Sans') + sup.length * 2;
      const w = Math.max(wTit, wSup) + 110;
      const x0 = W - 40 - w;
      const chip = pilula(0, 0, w, 76, '#fff', COR.navy, 3.5)
        + `<circle cx="40" cy="38" r="23" fill="${COR.orange}"/>` + txt(String(num), 40, 47, { size: 25, weight: 900, fill: '#fff' })
        + txt(sup, 78, 30, { anchor: 'start', size: 13, weight: 700, family: 'DM Sans', fill: COR.grey, ls: 2 })
        + txt(tit, 78, 60, { anchor: 'start', size: 27, weight: 800, fill: COR.navy });
      s += `<g transform="translate(${f(x0 + w / 2)} 70) scale(${f(Math.max(0.001, k))}) translate(${f(-w / 2)} -38)">${chip}</g>`;
    }
    return s;
  }

  function legenda(t) {
    let bloco = null;
    for (const L of T.legendas) if (t >= wa(L.de) - 0.3) bloco = L;
    if (!bloco) return '';
    const idx = T.legendas.indexOf(bloco);
    const prox = T.legendas[idx + 1];
    const some = prox ? wa(prox.de) - 0.3 : wb(bloco.ate) + 1.6;
    if (t > some) return '';
    const size = 35, font = `700 ${size}px "DM Sans"`;
    const words = [];
    for (let i = bloco.de; i <= bloco.ate; i++) words.push({ i, w: P[i].w, ww: measure(P[i].w, font) });
    const sp = measure(' ', font);
    const total = words.reduce((a, w) => a + w.ww, 0) + sp * (words.length - 1);
    const pw = total + 130, ph = 70, x0 = W / 2 - pw / 2, y0 = 968;
    const k = back(t, wa(bloco.de) - 0.3, 0.3);
    const sai = 1 - fin(t, some - 0.25, 0.25);
    let s = pilula(x0, y0, pw, ph, '#0f2440', 'none', 0)
      + `<circle cx="${f(x0 + 40)}" cy="${f(y0 + 35)}" r="20" fill="#fff"/>`
      + `<rect x="${f(x0 + 35)}" y="${f(y0 + 23)}" width="10" height="16" rx="5" fill="#0f2440"/><path d="M${f(x0 + 31)},${f(y0 + 34)} q9,11 18,0 M${f(x0 + 40)},${f(y0 + 41)} l0,5" stroke="#0f2440" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    let x = x0 + 80;
    for (const wd of words) {
      const dita = t >= P[wd.i].a - 0.04;
      const col = dita ? (DEST.has(wd.i) ? COR.orange2 : '#ffffff') : '#5f7391';
      s += txt(wd.w, x, y0 + 47, { anchor: 'start', size, weight: 700, family: 'DM Sans', fill: col });
      x += wd.ww + sp;
    }
    const o = clamp(k * 1.5) * sai;
    return `<g transform="translate(960 ${f(y0 + 35)}) scale(${f(Math.max(0.001, 0.85 + 0.15 * k))}) translate(-960 ${f(-(y0 + 35))})" opacity="${f(o)}">${s}</g>`;
  }

  // cortina diagonal (faixas azul claro / ardósia / navy / laranja, como o banner DTS)
  function cortina(t) {
    let s = '';
    for (const id of ORD.slice(1)) {
      if (CENAS[id].TRANSICAO === 'nenhuma') continue;
      const tc = C[id];
      const u = inv(tc - 0.24, tc + 0.24, t);
      if (u <= 0 || u >= 1) continue;
      const x = lerp(-900, W + 900, ease.inOut(u));
      const band = (dx, w, c) => `<path d="M${f(x + dx - w / 2 - 260)},${H + 20} L${f(x + dx - w / 2 + 260)},-20 L${f(x + dx + w / 2 + 260)},-20 L${f(x + dx + w / 2 - 260)},${H + 20}Z" fill="${c}"/>`;
      s += band(-610, 120, COR.lblue) + band(-470, 180, COR.slate) + band(0, 820, COR.navy) + band(470, 110, COR.orange);
    }
    return s;
  }

  function frame(t) {
    const id = cenaEm(t);
    const mod = CENAS[id];
    const ctx = { ...ctxBase, id, t0: C[id], t1: fim(id) };
    let s = defsFX();
    s += mod.desenhar(t, ctx);
    if (mod.INTERFACE !== false) s += topo(t, !!mod.ESCURO, id);
    if (mod.LEGENDA !== false) s += legenda(t);
    s += cortina(t);
    if (t < 0.3) s += `<rect width="${W}" height="${H}" fill="${COR.navy}" opacity="${f(1 - t / 0.3)}"/>`;
    return s;
  }

  return { duration: TOTAL, frame, audio: './build/dts60/trilha.wav' };
}

export async function criar() {
  const r = await fetch('./src/dts60/tempos.json');
  if (!r.ok) throw new Error('rode antes: python3 producao/dts60_audio.py');
  return buildFilme(await r.json());
}
