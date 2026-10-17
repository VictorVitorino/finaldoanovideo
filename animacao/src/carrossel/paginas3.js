// As 3 páginas do carrossel. Cada função desenha o miolo da página (entre o cabeçalho e o rodapé)
// no tempo local tt (s), seguindo os beats B de tempos.json. modo.estatico = true desenha o estado final (PDF).
import { W, C, t, tRico, larg, kicker, quebra, op, fin, back, clamp, inv, ease, n2, varredura } from './base.js';
import { titulo } from './componentes.js';
import { waffle, colunas, barrasTempo } from './adocao.js';
import { P1, P2, P3 } from './dados.js';

const f = n2;

// rótulo de bloco
const rotulo = (str, x, y, tt, a0) => op(fin(tt, a0, 0.4), t(str, x, y, { f: 'B', w: 600, s: 18, c: C.slate }));

// número grande da página ao fundo, no canto superior direito do miolo
const marcaDagua = (i, tt, a0) => op(fin(tt, a0, 0.8), t(`0${i}`, 1036, 330, { f: 'H', w: 800, s: 210, c: '#F2F5F9', a: 'end', ls: -2 }));

// "so what": faixa com barra laranja à esquerda e texto em navy
function conclusao(str, x, y, w, tt, a0, o = {}) {
  const s = o.s ?? 23, lh = s * 1.36;
  const linhas = quebra(str, s, w - 56, 500, 'B');
  const h = linhas.length * lh + 30;
  const k = ease.out(inv(a0, a0 + 0.5, tt));
  if (k <= 0) return '';
  let b = `<rect x="${f(x)}" y="${f(y)}" width="${f(w * k)}" height="${f(h)}" rx="10" fill="${o.fundo ?? C.orangeBg}"/>`
    + `<rect x="${f(x)}" y="${f(y)}" width="6" height="${f(h)}" rx="3" fill="${C.orange}"/>`;
  linhas.forEach((l, i) => {
    b += op(fin(tt, a0 + 0.25 + i * 0.1, 0.4), tRico(l, x + 30, y + 15 + s * 0.98 + i * lh, { f: 'B', w: 500, s, c: C.navy, hi: C.orangeD, hw: 700 }));
  });
  return b + varredura('vconc' + Math.round(y), x, y, w, h, inv(a0 + 0.6, a0 + 1.6, tt), 10);
}

// o porquê da página 1, no mesmo estilo da conclusão: a frase, a virada EXECUTOR → DONO DO RESULTADO e o que isso exige
function caixaDono(D, x, y, w, tt, a0) {
  const k = ease.out(inv(a0, a0 + 0.5, tt));
  if (k <= 0) return '';
  const tl = quebra(D.texto, 21, w - 60, 500, 'B'), lh = 28;
  const py = y + 60, ph = 50, h = 60 + ph + 22 + tl.length * lh + 12;
  let b = `<rect x="${f(x)}" y="${f(y)}" width="${f(w * k)}" height="${f(h)}" rx="10" fill="${C.orangeBg}"/>`
    + `<rect x="${f(x)}" y="${f(y)}" width="6" height="${f(h)}" rx="3" fill="${C.orange}"/>`;
  b += op(fin(tt, a0 + 0.25, 0.4), tRico(D.abre, x + 30, y + 40, { f: 'B', w: 500, s: 25, c: C.navy, hi: C.orangeD, hw: 700 }));
  // as duas pílulas e a seta
  const wDe = larg(D.de, 26, 700, 'H') + D.de.length * 1.2 + 44, wPara = larg(D.para, 26, 800, 'H') + D.para.length * 1.2 + 48;
  const x1 = x + 30, ax0 = x1 + wDe + 18, ax1 = ax0 + 60, x2 = ax1 + 18;
  b += op(fin(tt, a0 + 0.9, 0.4), `<rect x="${f(x1)}" y="${py}" width="${f(wDe)}" height="${ph}" rx="25" fill="#fff" stroke="${C.slate}" stroke-opacity=".55" stroke-width="1.5"/>`
    + t(D.de, x1 + wDe / 2, py + 34, { f: 'H', w: 700, s: 26, c: C.slate, a: 'middle', ls: 1.2 }));
  const ka = ease.out(inv(a0 + 1.2, a0 + 1.6, tt));
  if (ka > 0) b += `<path d="M${f(ax0)},${py + ph / 2} L${f(ax0 + (ax1 - ax0) * ka)},${py + ph / 2}" stroke="${C.orange}" stroke-width="4" stroke-linecap="round"/>`
    + (ka > 0.9 ? `<path d="M${f(ax1 - 12)},${py + ph / 2 - 12} L${f(ax1)},${py + ph / 2} L${f(ax1 - 12)},${py + ph / 2 + 12}" fill="none" stroke="${C.orange}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : '');
  const kp = back(tt, a0 + 1.5, 0.5);
  if (kp > 0) b += `<g transform="translate(${f(x2 + wPara / 2)} ${py + ph / 2}) scale(${f(kp)}) translate(${f(-wPara / 2)} ${-ph / 2})">`
    + `<rect x="0" y="0" width="${f(wPara)}" height="${ph}" rx="25" fill="${C.orange}"/>`
    + t(D.para, wPara / 2, 34, { f: 'H', w: 800, s: 26, c: C.navy, a: 'middle', ls: 1.2 }) + '</g>';
  tl.forEach((l, i) => {
    b += op(fin(tt, a0 + 2.1 + i * 0.12, 0.45), tRico(l, x + 30, py + ph + 32 + i * lh, { f: 'B', w: 500, s: 21, c: C.navy, hi: C.orangeD, hw: 700 }));
  });
  return b + varredura('vdono', x, y, w, h, inv(a0 + 0.6, a0 + 1.6, tt), 10);
}

// ---------- página 1 · IA versus adoção ----------
export function pagina1(tt, B) {
  let s = marcaDagua(1, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P1.kicker, 48, 190));
  s += titulo(P1.titulo, 48, 258, tt, B.titulo, { s: 64, lh: 68 });
  // frase de abertura (McKinsey) em duas linhas
  quebra(P1.abre, 25, 984, 500, 'B').forEach((l, i) => {
    s += op(fin(tt, B.grafico - 1.2 + i * 0.15, 0.45), tRico(l, 48, 394 + i * 34, { f: 'B', w: 500, s: 25, c: C.navy, hi: C.orangeD, hw: 700 }));
  });
  s += op(fin(tt, B.grafico - 0.4, 0.4), t(P1.escadaTitulo.toUpperCase(), 48, 478, { f: 'M', w: 600, s: 14, c: C.orangeD, ls: 2 })
    + t(P1.escadaSub, 1032, 478, { f: 'B', w: 500, s: 15, c: C.grey, a: 'end' }));
  s += waffle({ x: 48, y: 500, w: 984, t0: B.grafico, step: 1.0, dot: 22, gap: 6, lacuna: P1.lacuna,
    itens: P1.escada.map((it, i) => ({ ...it, cor: [C.navy, C.slate, C.orange][i] })) }, tt);
  s += caixaDono(P1.dono, 48, 984, 984, tt, B.conclusao);
  return s;
}

// ---------- página 2 · com e sem gestão da mudança ----------
export function pagina2(tt, B) {
  let s = marcaDagua(2, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P2.kicker, 48, 190));
  s += titulo(P2.titulo, 48, 254, tt, B.titulo, { s: 54, lh: 58 });
  // gráfico 1: colunas por qualidade da gestão da mudança
  s += rotulo(P2.colunasTitulo, 48, 444, tt, B.colunas - 0.4);
  s += colunas({ x: 48, y: 460, w: 984, h: 310, t0: B.colunas, step: 0.45, itens: P2.colunas, zonas: P2.zonas, destaque: P2.destaque,
    cores: ['#C0392B', C.orangeL, C.blue, C.navy] }, tt);
  // gráfico 2: o custo de começar tarde (barras reais) + a lacuna entre intenção e prática
  const ty = 826;
  s += op(fin(tt, B.tempo - 0.4, 0.4), t(P2.tempoTitulo, 48, ty, { f: 'B', w: 700, s: 22, c: C.navy })
    + t(P2.tempoSub, 48, ty + 28, { f: 'B', w: 500, s: 17, c: C.grey }));
  s += barrasTempo({ x: 48, y: ty + 52, w: 984, hBar: 54, gap: 22, rotW: 330, t0: B.tempo, step: 0.5, max: 100,
    itens: P2.tempo.map((it, i) => ({ ...it, cor: [C.navy, '#C0392B'][i] })) }, tt);
  s += conclusao(P2.conclusao, 48, 1064, 984, tt, B.conclusao, { s: 25 });
  return s;
}

// ---------- página 3 · o que fazemos: três momentos ----------
export function pagina3(tt, B) {
  let s = marcaDagua(3, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P3.kicker, 48, 190));
  s += titulo(P3.titulo, 48, 258, tt, B.titulo, { s: 64, lh: 68 });
  s += rotulo(P3.sub, 48, 392, tt, B.linha - 0.4);
  // linha do tempo: 3 colunas (antes · durante · depois), kickoff e go-live nas divisas
  const cx0 = 48, cw = 328, cxs = [cx0, cx0 + cw, cx0 + 2 * cw, cx0 + 3 * cw];
  const yA = 452;
  const kL = fin(tt, B.linha, 0.5);
  let lt = `<path d="M${cx0},${yA} L${cx0 + 3 * cw},${yA}" stroke="${C.navy}" stroke-width="2"/>`;
  P3.momentos.forEach((m, i) => { lt += t(m.quando, cxs[i] + cw / 2, yA - 18, { f: 'M', w: 700, s: 15, c: C.navy, a: 'middle', ls: 1.5 }); });
  s += op(kL, lt);
  P3.marcos.forEach((mk, i) => {
    const k = back(tt, B.linha + 0.4 + i * 0.2, 0.5), x = cxs[i + 1];
    if (k > 0) s += `<g transform="translate(${x} ${yA}) scale(${f(k)})"><path d="M0,-13 L11,0 L0,13 L-11,0Z" fill="${C.orange}"/></g>` + op(k, t(mk, x, yA + 36, { f: 'M', w: 700, s: 13, c: C.orangeD, a: 'middle', ls: 1.5 }));
  });
  P3.faixas.forEach((fx, i) => {
    const a0 = B.linha + 0.7 + i * 0.5, u = ease.out(inv(a0, a0 + 0.8, tt));
    if (u <= 0) return;
    const y = yA + 56 + i * 56, xa = cxs[fx.de], xb = cxs[fx.ate], cor = i ? C.navy : C.orange;
    s += `<rect x="${f(xa)}" y="${y}" width="${f((xb - xa) * u)}" height="44" rx="10" fill="${cor}"/>`;
    s += op(clamp(u * 3), t(fx.rot, xa + 16, y + 30, { f: 'H', w: 700, s: 20, c: i ? '#fff' : C.navy, ls: 1 }));
  });
  // três momentos
  const my = 648;
  P3.momentos.forEach((m, i) => {
    const a0 = B.entregas + i * 0.45, k = fin(tt, a0, 0.5);
    if (k <= 0) return;
    const x = cxs[i] + (i ? 22 : 0), w = cw - 22;
    let b = '';
    if (i) b += `<path d="M${cxs[i]},${my} L${cxs[i]},${my + 270}" stroke="${C.blueLL}" stroke-width="1.5"/>`;
    b += `<circle cx="${x + 20}" cy="${my + 22}" r="20" fill="${C.orange}"/>` + t(String(m.n), x + 20, my + 30, { f: 'H', w: 800, s: 24, c: C.navy, a: 'middle' });
    b += t(m.titulo, x + 54, my + 31, { f: 'H', w: 700, s: 28, c: C.navy, ls: 0.3 });
    let yy = my + 78;
    m.itens.forEach((it, q) => {
      const linhas = quebra(it, 18, w - 30, 500, 'B');
      const kk = fin(tt, a0 + 0.25 + q * 0.15, 0.4);
      let eb = `<circle cx="${x + 8}" cy="${yy - 6}" r="4" fill="${C.orange}"/>`;
      linhas.forEach((l, r) => { eb += t(l, x + 24, yy + r * 24, { f: 'B', w: 500, s: 18, c: C.slate }); });
      b += op(kk, eb);
      yy += linhas.length * 24 + 16;
    });
    s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - k) * 14)})">${b}</g>`;
  });
  // CTA
  const by = 956, bh = 240, cx = 48, cwid = 984;
  const k = ease.out(inv(B.cta, B.cta + 0.55, tt));
  if (k > 0) {
    const Q = P3.cta;
    let b = `<rect x="${cx}" y="${by}" width="${cwid}" height="${bh}" rx="14" fill="${C.navy}"/>`
      + `<clipPath id="ctaClip"><rect x="${cx}" y="${by}" width="${cwid}" height="${bh}" rx="14"/></clipPath>`
      + `<g clip-path="url(#ctaClip)"><path d="M${cx + cwid - 90},${by + bh} L${cx + cwid + 10},${by}" stroke="${C.slate}" stroke-width="34"/><path d="M${cx + cwid - 146},${by + bh} L${cx + cwid - 46},${by}" stroke="${C.orange}" stroke-width="2.4"/></g>`;
    b += op(fin(tt, B.cta + 0.2, 0.4), t(Q.pergunta, cx + 36, by + 68, { f: 'H', w: 700, s: 40, c: '#fff', ls: 0.3 }));
    b += op(fin(tt, B.cta + 0.5, 0.4), tRico(Q.destaque, cx + 36, by + 124, { f: 'H', w: 800, s: 50, c: '#fff', hi: C.orange, ls: 0.3 }));
    b += op(fin(tt, B.final, 0.45), `<rect x="${cx + 36}" y="${by + 150}" width="${cwid - 260}" height="1.5" fill="#fff" opacity=".25"/>`
      + t(Q.acao, cx + 36, by + 188, { f: 'B', w: 700, s: 24, c: '#fff' })
      + t(Q.acao2, cx + 36, by + 216, { f: 'B', w: 500, s: 17, c: C.blueLL })
      + t(Q.lema, cx + cwid - 200, by + 216, { f: 'M', w: 500, s: 16, c: C.orangeL, ls: 1.5, a: 'end' }));
    s += `<g opacity="${f(Math.min(1, k * 1.4))}" transform="translate(${f((1 - k) * 40)} 0)">${b}</g>`;
    s += varredura('vcta', cx, by, cwid, bh, inv(B.final + 0.2, B.final + 1.3, tt), 14);
  }
  return s;
}

export const PAGINAS = [
  { desenha: pagina1, fontes: () => P1.fontes },
  { desenha: pagina2, fontes: () => P2.fontes },
  { desenha: pagina3, fontes: () => P3.fontes },
];
