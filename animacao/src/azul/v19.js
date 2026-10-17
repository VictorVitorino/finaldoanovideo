// v19 · o filme inteiro na linguagem azul, sobre o áudio do v18 (170 s). Cenas por tempo absoluto.
// O trecho 119.2–128.1 (Quintão & Antonialli; equipe no palco) é mantido do original na montagem, com dissolve de 0,5 s a partir do TMO.
import { clamp, lerp, inv, ease, g, op } from '../core.js';
import * as B from './base.js';
import * as A from './v19a.js';
import * as C2 from './v19b.js';
import * as C3 from './v19c.js';

const FUNCS = { capa: A.capa, dashboard: A.dashboard, erp: A.erp, farol: A.farol, uniao: A.uniao, papeis: C2.papeis, metodologia: C2.metodologia, tmo: C2.tmo, original: null, linha: C3.linha, cockpit: C3.cockpit, rumo: C3.rumo };
// cenas por tempo absoluto, lidas de build/azul/v19.json (producao/v21_voz.py: limites relativos às falas)
export let CENAS = [];
export let MARCAS = [];
const TRANS = 0.45;

export async function carregarFilme() {
  const J = await B.carregar();
  CENAS = J.cenas.map(c => ({ id: c.id, de: c.de, ate: c.ate, f: FUNCS[c.id] ?? null, ...(c.trans ? { trans: c.trans } : {}) }));
  MARCAS = CENAS.map(c => c.de).slice(1);
  return J;
}

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
  const TR = c.trans ?? TRANS;
  if (prox && prox.f && c.f && t > c.ate - TR) {
    const u = ease.inOut(inv(c.ate - TR, c.ate, t));
    s += op(u, cena(prox, t));   // dissolve puro: sem zoom, para que personagens que continuam na cena seguinte não dupliquem
  }
  s += B.chrome(t, { marcas: MARCAS });
  // a legenda some durante o trecho original (ele já traz a própria legenda), do dissolve de entrada ao de saída
  const org = CENAS.find(x => x.id === 'original');
  if (!org || t < org.de - 0.8 || t >= org.ate + 0.8) s += B.legenda(t, c.id === 'erp' || c.id === 'cockpit' ? { cx: 1150 } : {});   // com personagem grande à esquerda, a legenda fica sob o painel
  // escurece no fim do filme (o v18 fecha em preto)
  const tF = B.J.total - 0.97;
  if (t > tF) s += `<rect width="1920" height="1080" fill="#000" opacity="${B.F(clamp((t - tF) / 0.75))}"/>`;
  return s;
}
