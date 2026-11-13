// Componentes do DASHBOARD do Mapa de Adoção: janela de aplicativo, mapa de calor (áreas x régua), rosca,
// linha de tendência, barras, indicadores, alertas, filtros e cursor. Tudo animável por u (0..1).
// Os números saem do modelo ilustrativo (modelo.js): 25 pessoas, 4 áreas, 3 ondas.
import { C, txt, larg, icone, pop, opa, tracar, clamp, lerp, inv, ease, n2 } from './base.js';
import { NIVEIS, PESSOAS, AREAS, contagem } from './modelo.js';

const f = n2;

// ---------- dados derivados ----------
// % de pessoas em Adota ou Multiplica em cada onda (0..2): o "índice de adoção"
export const indice = onda => Math.round(100 * PESSOAS.filter(p => p.niv[onda] >= 3).length / PESSOAS.length);
export const INDICES = [0, 1, 2].map(indice);                 // [20, 32, 56]
export const indiceArea = (a, onda) => { const ps = PESSOAS.filter(p => p.area === a); return Math.round(100 * ps.filter(p => p.niv[onda] >= 3).length / ps.length); };
// pessoas na célula (área a, marca n) numa onda
export const naCelula = (a, n, onda) => PESSOAS.filter(p => p.area === a && p.niv[onda] === n).length;
// valor interpolado entre ondas (onda fracionária 0..2)
const entre = (fn, onda) => { const o = clamp(onda, 0, 2), i = Math.min(1, Math.floor(o)), u = ease.inOut(o - i); return lerp(fn(i), fn(i + 1), u); };
export const indiceEm = onda => entre(indice, onda);

// ---------- janela de aplicativo ----------
// o: { titulo, abas: [..], aba (índice ativo), k (escala de entrada), escuro (true = tela navy) }
// devolve { svg, x, y, w, h }: (x, y, w, h) é a área útil de conteúdo dentro da janela
export function janela(x, y, w, h, o = {}) {
  const k = o.k ?? 1, bar = 58, esc = o.escuro !== false;
  const fundo = esc ? 'url(#g-tela)' : C.white, tinta = esc ? C.white : C.navy;
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="22" fill="${fundo}" stroke="${esc ? C.navy80 : C.gray}" stroke-width="2.5"/>`
    + `<path d="M${f(x)},${f(y + bar)} H${f(x + w)}" stroke="${esc ? 'rgba(255,255,255,.14)' : C.gray}" stroke-width="2"/>`
    + [C.orange, C.blue40, C.navy40].map((c, i) => `<circle cx="${f(x + 30 + i * 24)}" cy="${f(y + bar / 2)}" r="7.5" fill="${c}"/>`).join('');
  if (o.titulo) s += txt(o.titulo, x + 112, y + bar / 2 + 8.500, { w: 700, s: 24, c: tinta });
  if (o.abas) {
    let ax = x + w - 22;
    [...o.abas].reverse().forEach((a, j) => {
      const i = o.abas.length - 1 - j, on = i === (o.aba ?? 0), wl = larg(a, 20, { w: 700 }) + 28;
      ax -= wl;
      s += `<rect x="${f(ax)}" y="${f(y + 12)}" width="${f(wl)}" height="34" rx="17" fill="${on ? C.orange : 'none'}" stroke="${on ? 'none' : (esc ? 'rgba(255,255,255,.3)' : C.gray)}" stroke-width="1.5"/>`
        + txt(a, ax + wl / 2, y + 36, { w: 700, s: 20, c: on ? C.navy : tinta, a: 'middle' });
      ax -= 10;
    });
  }
  return { svg: k >= 0.999 ? `<g filter="url(#fx-sombra)">${s}</g>` : pop(0.86 + 0.14 * k, x + w / 2, y + h / 2, opa(clamp(k * 1.3), `<g filter="url(#fx-sombra)">${s}</g>`)), x: x + 24, y: y + bar + 20, w: w - 48, h: h - bar - 40 };
}
// cartão interno do painel. o: { escuro, titulo, k }
export function cartao(x, y, w, h, o = {}) {
  const esc = o.escuro !== false, k = o.k ?? 1;
  if (k <= 0.001) return '';
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="14" fill="${esc ? 'rgba(255,255,255,.07)' : C.gray20}" stroke="${esc ? 'rgba(255,255,255,.14)' : C.line}" stroke-width="1.5"/>`;
  if (o.titulo) s += txt(o.titulo.toUpperCase(), x + 18, y + 32, { w: 700, s: 20, ls: 1.4, c: esc ? C.blue40 : C.navy80 });
  return opa(clamp(k * 1.4), `<g transform="translate(0 ${f((1 - ease.out(clamp(k))) * 22)})">${s}</g>`);
}

// ---------- mapa de calor: áreas x régua ----------
// o: { onda (0..2 fracionária), u (0..1 entrada em cascata), escuro, foco: [a, n] célula em destaque, focoCol (coluna em destaque),
//      rotW (largura dos nomes das áreas), cab (altura do cabeçalho), numeros (true) }
export function geoCalor(x, y, w, h, o = {}) {
  const rotW = o.rotW ?? 150, cab = o.cab ?? 44, cw = (w - rotW) / 5, rh = (h - cab) / AREAS.length;
  return { x, y, w, h, rotW, cab, cw, rh, cel: (a, n) => [x + rotW + cw * n, y + cab + rh * a, cw, rh], centro: (a, n) => [x + rotW + cw * (n + 0.5), y + cab + rh * (a + 0.5)] };
}
export function calor(g, o = {}) {
  const esc = o.escuro !== false, u = o.u ?? 1, onda = o.onda ?? 0, tinta = esc ? C.white : C.navy;
  let s = '';
  NIVEIS.forEach((n, i) => {
    const k = ease.back(clamp(u * 2.4 - i * 0.14));
    if (k <= 0.001) return;
    const [cx] = g.centro(0, i), apag = o.focoCol != null && o.focoCol >= 0 && o.focoCol !== i;
    s += opa(apag ? 0.4 : 1, pop(k, cx, g.y + g.cab / 2 - 4, `<rect x="${f(g.x + g.rotW + g.cw * i + 4)}" y="${f(g.y)}" width="${f(g.cw - 8)}" height="${f(g.cab - 10)}" rx="8" fill="${n.cor}"${n.cor === C.navy && esc ? ` stroke="${C.blue40}" stroke-width="1.5"` : ''}/>`
      + txt(n.rot, cx, g.y + (g.cab - 10) / 2 + 7.500, { w: 700, s: g.cw > 150 ? 21 : 19, c: n.tx, a: 'middle' })));
  });
  AREAS.forEach((nome, a) => {
    const k = ease.out(clamp(u * 2.2 - 0.3 - a * 0.14));
    if (k > 0.001) s += opa(k, txt(nome, g.x + 4 + (1 - k) * -16, g.y + g.cab + g.rh * (a + 0.5) + 8, { w: 700, s: 22, c: tinta }));
    for (let n = 0; n < 5; n++) {
      const kc = ease.back(clamp(u * 2.4 - 0.5 - a * 0.12 - n * 0.09));
      if (kc <= 0.001) continue;
      const q = entre(od => naCelula(a, n, od), onda), [cx, cy] = g.centro(a, n), [x0, y0, cw, rh] = g.cel(a, n);
      const forca = clamp(q / 3), emFoco = o.foco && o.foco[0] === a && o.foco[1] === n;
      const apag = (o.focoCol != null && o.focoCol >= 0 && o.focoCol !== n) || (o.foco && !emFoco);
      const cor = NIVEIS[n].cor === C.navy && esc ? C.blue80 : NIVEIS[n].cor;
      let b = `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="10" fill="${esc ? 'rgba(255,255,255,.06)' : C.white}"/>`
        + `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="10" fill="${cor}" opacity="${f(q > 0.4 ? 0.3 + 0.7 * forca : 0.08)}"/>`;
      // número: branco sobre célula escura; navy só quando a célula está clara e cheia (laranja-80 e azul-40)
      const clara = NIVEIS[n].tx === C.navy && forca > 0.6;
      if (o.numeros !== false && q > 0.4) b += txt(String(Math.round(q)), cx, cy + 10, { w: 700, s: 28, c: clara ? C.navy : (esc ? C.white : (forca > 0.6 ? NIVEIS[n].tx : C.navy)), a: 'middle' });
      if (emFoco) b += `<rect x="${f(x0 + 1)}" y="${f(y0 + 1)}" width="${f(cw - 2)}" height="${f(rh - 2)}" rx="12" fill="none" stroke="${C.orange}" stroke-width="4"/>`;
      s += opa(apag ? 0.4 : 1, pop(kc, cx, cy, b));
    }
  });
  return s;
}

// ---------- rosca da distribuição por marca ----------
// o: { onda, u, escuro, centro: texto grande no meio (padrão: índice de adoção), sub }
export function rosca(cx, cy, r, o = {}) {
  const esc = o.escuro !== false, u = ease.out(clamp(o.u ?? 1)), onda = o.onda ?? 0, esp = o.esp ?? r * 0.34;
  const total = PESSOAS.length;
  let s = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r - esp / 2)}" fill="none" stroke="${esc ? 'rgba(255,255,255,.08)' : C.gray40}" stroke-width="${f(esp)}"/>`;
  let a0 = -Math.PI / 2;
  NIVEIS.forEach((n, i) => {
    const q = entre(od => contagem(od)[i], onda), da = (q / total) * Math.PI * 2 * u;
    if (da > 0.01) {
      const a1 = a0 + da - 0.03, rr = r - esp / 2;
      const cor = n.cor === C.navy && esc ? C.blue80 : n.cor;
      s += `<path d="M${f(cx + Math.cos(a0) * rr)},${f(cy + Math.sin(a0) * rr)} A${f(rr)},${f(rr)} 0 ${da > Math.PI ? 1 : 0} 1 ${f(cx + Math.cos(a1) * rr)},${f(cy + Math.sin(a1) * rr)}" fill="none" stroke="${cor}" stroke-width="${f(esp)}"/>`;
    }
    a0 += da;
  });
  const val = o.centro ?? Math.round(indiceEm(onda) * u) + '%';
  s += txt(val, cx, cy + r * 0.13, { f: 'L', w: 400, s: r * 0.5, c: esc ? C.white : C.navy, a: 'middle' });
  if (o.sub !== false) s += txt(o.sub ?? 'adotam', cx, cy + r * 0.4, { s: Math.max(20, r * 0.2), c: esc ? C.blue40 : C.navy80, a: 'middle' });
  return s;
}

// ---------- linha de tendência do índice de adoção por onda ----------
// o: { onda (0..2: até onde a linha já foi), u (entrada dos eixos), escuro, golive (true: marca o go-live entre a onda 2 e a 3) }
export function tendencia(x, y, w, h, o = {}) {
  const esc = o.escuro !== false, u = clamp(o.u ?? 1), onda = clamp(o.onda ?? 0, 0, 2), tinta = esc ? C.white : C.navy, sec = esc ? C.blue40 : C.navy80;
  const px = i => x + 36 + (w - 72) * i / 2, py = v => y + h - 44 - (h - 84) * v / 70;
  let s = '';
  [0, 35, 70].forEach(v => { s += tracar(`M${f(x + 8)},${f(py(v))} L${f(x + 8 + (w - 16) * ease.out(u))},${f(py(v))}`, 1, { c: esc ? 'rgba(255,255,255,.14)' : C.gray, sw: 1.5 }); });
  ['Onda 1', 'Onda 2', 'Onda 3'].forEach((r, i) => { s += opa(clamp(u * 2 - i * 0.3), txt(r, px(i), y + h - 12, { w: i <= onda + 0.05 ? 700 : 400, s: 20, c: i <= onda + 0.05 ? tinta : sec, a: 'middle' })); });
  if (o.golive !== false) {
    const gx = (px(1) + px(2)) / 2;
    s += opa(clamp(u * 2 - 0.6), `<path d="M${f(gx)},${f(y + 34)} L${f(gx)},${f(y + h - 44)}" stroke="${C.orange}" stroke-width="2.5" stroke-dasharray="6 7"/>` + txt('GO-LIVE', gx, y + 26, { w: 700, s: 20, ls: 1.2, c: C.orange, a: 'middle' }));
  }
  // linha até a onda atual
  const pts = [[px(0), py(INDICES[0])]];
  for (let i = 1; i <= 2; i++) {
    if (onda >= i) pts.push([px(i), py(INDICES[i])]);
    else if (onda > i - 1) { const k = ease.inOut(onda - (i - 1)); pts.push([lerp(px(i - 1), px(i), k), lerp(py(INDICES[i - 1]), py(INDICES[i]), k)]); break; }
  }
  if (u > 0.5) {
    const d = 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
    const ult = pts[pts.length - 1];
    s += `<path d="${d} L${f(ult[0])},${f(py(0))} L${f(pts[0][0])},${f(py(0))}Z" fill="${C.blue}" opacity=".22"/>`
      + `<path d="${d}" fill="none" stroke="${esc ? C.blue40 : C.blue}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (let i = 0; i <= Math.floor(onda + 0.001); i++) s += `<circle cx="${f(px(i))}" cy="${f(py(INDICES[i]))}" r="9" fill="${esc ? C.navy : C.white}" stroke="${esc ? C.blue40 : C.blue}" stroke-width="4"/>` + txt(INDICES[i] + '%', px(i), py(INDICES[i]) - 20, { w: 700, s: 24, c: tinta, a: 'middle' });
    s += `<circle cx="${f(ult[0])}" cy="${f(ult[1])}" r="12" fill="${C.orange}" stroke="${esc ? C.navy : C.white}" stroke-width="4"/>`;
  }
  return s;
}

// ---------- barras empilhadas: distribuição por marca em cada onda ----------
// o: { ondas (0..3 fracionário: quantas barras já subiram), escuro }
export function pilhas(x, y, w, h, o = {}) {
  const esc = o.escuro !== false, q = o.ondas ?? 3, total = PESSOAS.length, bw = Math.min(110, w / 3 - 30);
  let s = '';
  for (let od = 0; od < 3; od++) {
    const k = ease.out(clamp(q - od));
    const cx = x + w * (od + 0.5) / 3, c = contagem(od);
    s += txt('Onda ' + (od + 1), cx, y + h - 6, { w: 700, s: 20, c: esc ? C.blue40 : C.navy80, a: 'middle' });
    if (k <= 0.001) continue;
    let yy = y + h - 36;
    NIVEIS.forEach((n, i) => {
      const hh = (h - 50) * (c[i] / total) * k;
      yy -= hh;
      const cor = n.cor === C.navy && esc ? C.blue80 : n.cor;
      if (hh > 1) s += `<rect x="${f(cx - bw / 2)}" y="${f(yy + 1.500)}" width="${f(bw)}" height="${f(Math.max(0, hh - 3))}" rx="5" fill="${cor}"/>`;
    });
  }
  return s;
}

// ---------- barras horizontais: índice de adoção por área ----------
export function barrasArea(x, y, w, h, o = {}) {
  const esc = o.escuro !== false, onda = o.onda ?? 0, u = o.u ?? 1, rh = h / AREAS.length, rot = o.rotW ?? 150;
  let s = '';
  AREAS.forEach((nome, a) => {
    const k = ease.out(clamp(u * 1.8 - a * 0.18)), v = entre(od => indiceArea(a, od), onda), yy = y + rh * a;
    s += opa(k, txt(nome, x, yy + rh / 2 + 7, { w: 700, s: 21, c: esc ? C.white : C.navy }));
    s += `<rect x="${f(x + rot)}" y="${f(yy + rh / 2 - 9)}" width="${f(w - rot - 62)}" height="18" rx="9" fill="${esc ? 'rgba(255,255,255,.1)' : C.gray40}"/>`
      + `<rect x="${f(x + rot)}" y="${f(yy + rh / 2 - 9)}" width="${f(Math.max(0, (w - rot - 62) * v / 100 * k))}" height="18" rx="9" fill="${v < 25 ? C.orange80 : C.blue}"/>`
      + opa(k, txt(Math.round(v * k) + '%', x + w, yy + rh / 2 + 7.500, { w: 700, s: 21, c: esc ? C.white : C.navy, a: 'end' }));
  });
  return s;
}

// ---------- indicador (número grande) ----------
// o: { rot, valor (texto), delta (texto, ex.: '+12 p.p.'), bom (true = seta para cima azul; false = laranja), escuro, k, ic }
export function kpi(x, y, w, h, o = {}) {
  const esc = o.escuro !== false, k = o.k ?? 1;
  if (k <= 0.001) return '';
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="14" fill="${esc ? 'rgba(255,255,255,.07)' : C.gray20}" stroke="${esc ? 'rgba(255,255,255,.14)' : C.line}" stroke-width="1.5"/>`
    + txt((o.rot ?? '').toUpperCase(), x + 18, y + 32, { w: 700, s: 20, ls: 1.2, c: esc ? C.blue40 : C.navy80 })
    + txt(o.valor ?? '', x + 18, y + h - 22, { f: 'L', w: 400, s: Math.min(64, h * 0.46), c: esc ? C.white : C.navy });
  if (o.delta) {
    const wl = larg(o.delta, 20, { w: 700 }) + 24;
    s += `<rect x="${f(x + w - wl - 14)}" y="${f(y + h - 50)}" width="${f(wl)}" height="32" rx="16" fill="${o.bom === false ? C.orange : C.blue}"/>` + txt(o.delta, x + w - 14 - wl / 2, y + h - 28, { w: 700, s: 20, c: o.bom === false ? C.navy : C.white, a: 'middle' });
  }
  if (o.ic) s += icone(o.ic, x + w - 34, y + 30, 30, { c: esc ? C.blue40 : C.navy80, sw: 2.6 });
  return opa(clamp(k * 1.4), `<g transform="translate(0 ${f((1 - ease.out(clamp(k))) * 20)})">${s}</g>`);
}
// ---------- alerta / recomendação ----------
// o: { ic, titulo, texto, tom: 'atencao' | 'bom' | 'neutro', escuro, k }
export function alerta(x, y, w, h, o = {}) {
  const esc = o.escuro !== false, k = o.k ?? 1;
  if (k <= 0.001) return '';
  const cor = o.tom === 'atencao' ? C.orange : o.tom === 'bom' ? C.blue : C.navy40;
  const s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="12" fill="${esc ? 'rgba(255,255,255,.08)' : C.white}" stroke="${esc ? 'rgba(255,255,255,.16)' : C.line}" stroke-width="1.5"/>`
    + `<rect x="${f(x)}" y="${f(y)}" width="8" height="${f(h)}" rx="4" fill="${cor}"/>`
    + `<circle cx="${f(x + 44)}" cy="${f(y + h / 2)}" r="22" fill="${cor}" opacity="${esc ? 0.9 : 1}"/>` + icone(o.ic ?? 'alerta', x + 44, y + h / 2, 26, { c: o.tom === 'bom' ? C.white : C.navy, sw: 2.8 })
    + txt(o.titulo ?? '', x + 80, y + h / 2 - (o.texto ? 4 : -8), { w: 700, s: 23, c: esc ? C.white : C.navy })
    + (o.texto ? txt(o.texto, x + 80, y + h / 2 + 24, { s: 20, c: esc ? C.blue40 : C.navy80 }) : '');
  return opa(clamp(k * 1.4), `<g transform="translate(${f((1 - ease.out(clamp(k))) * 40)} 0)">${s}</g>`);
}
// filtro em pílula
export function filtro(str, x, y, o = {}) {
  const on = !!o.on, esc = o.escuro !== false, w = larg(str, 20, { w: 700 }) + 30;
  return { w, svg: `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="36" rx="18" fill="${on ? C.orange : 'none'}" stroke="${on ? 'none' : (esc ? 'rgba(255,255,255,.3)' : C.gray)}" stroke-width="1.5"/>` + txt(str, x + w / 2, y + 25, { w: 700, s: 20, c: on ? C.navy : (esc ? C.white : C.navy), a: 'middle' }) };
}
// cursor de mouse com clique (u do clique: 0..1 faz um anel)
export function cursor(x, y, o = {}) {
  const uc = o.clique ?? 0;
  let s = '';
  if (uc > 0 && uc < 1) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(8 + 30 * ease.out(uc))}" fill="none" stroke="${C.orange}" stroke-width="${f(5 * (1 - uc) + 1)}" opacity="${f(1 - uc)}"/>`;
  const k = uc > 0 && uc < 0.3 ? 0.86 : 1;
  s += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k * (o.s ?? 1))})"><path d="M0,0 L0,34 L9,26 L15,40 L21,37 L15,24 L27,24Z" fill="${C.white}" stroke="${C.navy}" stroke-width="3" stroke-linejoin="round"/></g>`;
  return s;
}
