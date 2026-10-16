// v19 · o filme inteiro na linguagem azul, sobre o áudio do v18 (170 s). Cenas por tempo absoluto.
// O trecho 119.1–128.1 (Quintão & Antonialli; equipe no palco) é mantido do original na montagem.
import { clamp, lerp, inv, ease, g, op } from '../core.js';
import * as B from './base.js';
import * as A from './v19a.js';
import * as C2 from './v19b.js';
import * as C3 from './v19c.js';

export const CENAS = [
  { id: 'capa', de: 0.0, ate: 7.6, f: A.capa },
  { id: 'dashboard', de: 7.6, ate: 52.8, f: A.dashboard },
  { id: 'erp', de: 52.8, ate: 64.47, f: A.erp },
  { id: 'farol', de: 64.47, ate: 70.13, f: A.farol },
  { id: 'uniao', de: 70.13, ate: 80.0, f: A.uniao },
  { id: 'papeis', de: 80.0, ate: 90.0, f: C2.papeis },
  { id: 'metodologia', de: 90.0, ate: 112.6, f: C2.metodologia },
  { id: 'tmo', de: 112.6, ate: 119.1, f: C2.tmo },
  { id: 'original', de: 119.1, ate: 128.1, f: null },
  { id: 'linha', de: 128.1, ate: 143.13, f: C3.linha },
  { id: 'cockpit', de: 143.13, ate: 156.0, f: C3.cockpit },
  { id: 'rumo', de: 156.0, ate: 170.067, f: C3.rumo },
];
export const MARCAS = CENAS.map(c => c.de).slice(1);
const TRANS = 0.45;

export async function carregarFilme() { return B.carregar(); }

function cena(c, t) {
  if (!c.f) return `<rect width="1920" height="1080" fill="#0a1630"/>`;
  return c.f(t - c.de, t, c.ate - c.de);
}

export function quadro(t) {
  const i = Math.max(0, CENAS.findIndex(c => t >= c.de && t < c.ate));
  const c = CENAS[i] ?? CENAS.at(-1);
  let s = cena(c, t);
  const prox = CENAS[i + 1];
  // transição: a próxima cena entra em dissolve nos últimos TRANS s (não entre cenas refeitas e o trecho original)
  if (prox && prox.f && c.f && t > c.ate - TRANS) {
    const u = ease.inOut(inv(c.ate - TRANS, c.ate, t));
    s += op(u, cena(prox, t));   // dissolve puro: sem zoom, para que personagens que continuam na cena seguinte não dupliquem
  }
  s += B.chrome(t, { marcas: MARCAS });
  s += B.legenda(t, c.id === 'erp' ? { cx: 1160 } : {});   // no ERP a legenda fica sob o painel, longe do personagem
  // escurece no fim do filme (o v18 fecha em preto)
  if (t > 169.1) s += `<rect width="1920" height="1080" fill="#000" opacity="${B.F(clamp((t - 169.1) / 0.75))}"/>`;
  return s;
}
