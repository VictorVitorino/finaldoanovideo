// Componentes de dados do carrossel: título cinético, gráfico de linha, funil, matriz de impacto,
// barra 10-20-70, método em etapas, indicadores e equação. Cada função recebe o tempo local da
// página (tt, em s) e o instante em que entra (t0); com tt grande desenha o estado final (PDF).
import { C, t, tRico, larg, quebra, clamp, lerp, inv, ease, n2, esc, fin, back, op, sobe, contaNum, ico, varredura } from './base.js';

const f = n2;

// ---------- texto ----------
// Título em Barlow Condensed: as linhas sobem em sequência e os trechos *destacados* ganham um
// sublinhado laranja que cresce da esquerda para a direita.
export function titulo(linhas, x, y, tt, t0 = 0, o = {}) {
  const s = o.s ?? 72, lh = o.lh ?? s * 0.98, step = o.step ?? 0.16, cor = o.c ?? C.navy, hi = o.hi ?? C.orange;
  let out = '';
  linhas.forEach((ln, i) => {
    const k = fin(tt, t0 + i * step, 0.5);
    if (k <= 0.001) return;
    const yy = y + i * lh;
    let corpo = tRico(ln, x, yy, { f: 'H', w: o.w ?? 800, s, c: cor, hi, ls: o.ls ?? 0.5 });
    // sublinhado sob cada destaque
    const partes = ln.split(/(\*[^*]+\*)/).filter(Boolean);
    let cx = x;
    for (const p of partes) {
      const limpo = p.replace(/\*/g, '');
      const w = larg(limpo, s, o.w ?? 800, 'H') + limpo.length * (o.ls ?? 0.5);
      if (p.startsWith('*') && o.sublinha !== false) {
        const u = ease.out(inv(t0 + i * step + 0.35, t0 + i * step + 0.85, tt));
        if (u > 0) corpo += `<rect x="${f(cx)}" y="${f(yy + s * 0.12)}" width="${f(w * u)}" height="${f(s * 0.07)}" fill="${hi}" opacity=".9"/>`;
      }
      cx += w;
    }
    out += sobe(k, corpo, 34);
  });
  return out;
}

// parágrafo que entra com fade + subida, quebrado por largura
export function texto(str, x, y, tt, t0, o = {}) {
  const s = o.s ?? 24, lh = o.lh ?? s * 1.38;
  const linhas = quebra(str, s, o.maxW ?? 900, o.w ?? 500, o.f ?? 'B');
  let out = '';
  linhas.forEach((l, i) => {
    const k = fin(tt, t0 + i * (o.step ?? 0.07), 0.45);
    out += sobe(k, tRico(l, x, y + i * lh, { f: o.f ?? 'B', w: o.w ?? 500, s, c: o.c ?? C.slate, hi: o.hi ?? C.orange, hw: o.hw ?? 700, a: o.a }), 16);
  });
  return { svg: out, h: linhas.length * lh };
}

// ---------- gráfico de linha ----------
// o: { x, y, w, h, x0, x1, yMax, ticks, series: [{ nome, cor, pts: [[ano, v]], larg, tracejado }], t0, dur, id }
export function graficoLinha(o, tt) {
  const X = a => o.x + ((a - o.x0) / (o.x1 - o.x0)) * o.w;
  const Y = v => o.y + o.h - (v / o.yMax) * o.h;
  const kGrade = fin(tt, o.t0 - 0.3, 0.6);
  let s = '';
  // grade
  for (const v of o.ticks ?? [0, 25, 50, 75, 100]) {
    s += op(kGrade, `<path d="M${f(o.x)},${f(Y(v))} L${f(o.x + o.w)},${f(Y(v))}" stroke="${v === 0 ? C.blueL : C.blueLL}" stroke-width="${v === 0 ? 1.6 : 1}"${v === 0 ? '' : ' stroke-dasharray="3 5"'}/>`
      + t(`${v}${o.sufixo ?? '%'}`, o.x - 12, Y(v) + 5, { f: 'M', w: 500, s: 13, c: C.greyL, a: 'end' }));
  }
  // anos (eixo x)
  const anos = o.anosEixo ?? o.series[0].pts.map(p => p[0]);
  for (const a of anos) s += op(kGrade, t(String(a).replace(/\.5$/, '½'), X(a), o.y + o.h + 26, { f: 'M', w: 500, s: 13, c: C.grey, a: 'middle' }));

  // posição vertical dos rótulos finais, afastados para não colidirem
  const ph = o.pilulaH ?? 44, minGap = ph + 6;
  const finais = o.series.map((se, si) => ({ si, y: Y(se.pts[se.pts.length - 1][1]) })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < finais.length; k++) if (finais[k].y - finais[k - 1].y < minGap) {
    const meio = (finais[k].y + finais[k - 1].y) / 2;
    finais[k - 1].y = meio - minGap / 2; finais[k].y = meio + minGap / 2;
  }
  const yFinal = Object.fromEntries(finais.map(q => [q.si, q.y]));
  o.series.forEach((se, si) => {
    const a0 = o.t0 + (se.atraso ?? si * 0.5);
    const u = ease.inOut(inv(a0, a0 + (o.dur ?? 2.2), tt));
    if (u <= 0) return;
    const P = se.pts.map(([a, v]) => [X(a), Y(v)]);
    // comprimento acumulado
    const L = [0];
    for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const alvo = L[L.length - 1] * u;
    const parcial = [P[0]];
    let ponta = P[0];
    for (let i = 1; i < P.length; i++) {
      if (L[i] <= alvo) { parcial.push(P[i]); ponta = P[i]; continue; }
      const k = (alvo - L[i - 1]) / (L[i] - L[i - 1]);
      ponta = [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)];
      parcial.push(ponta);
      break;
    }
    const d = parcial.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join(' ');
    if (se.area !== false) s += `<path d="${d} L${f(ponta[0])},${f(Y(0))} L${f(P[0][0])},${f(Y(0))}Z" fill="${se.cor}" opacity="${se.areaOp ?? 0.1}"/>`;
    s += `<path d="${d}" fill="none" stroke="${se.cor}" stroke-width="${se.larg ?? 5}" stroke-linecap="round" stroke-linejoin="round"${se.tracejado ? ' stroke-dasharray="10 8"' : ''}/>`;
    // pontos e rótulos de valor
    P.forEach((p, i) => {
      const pa = a0 + (L[i] / L[L.length - 1]) * (o.dur ?? 2.2);
      const k = back(tt, pa - 0.05, 0.35);
      if (k <= 0) return;
      const ult = i === P.length - 1;
      s += `<g transform="translate(${f(p[0])} ${f(p[1])}) scale(${f(k)})"><circle r="${ult ? 9 : 6}" fill="#fff" stroke="${se.cor}" stroke-width="${ult ? 4 : 3}"/></g>`;
      if (se.rotulos !== false && (!ult || se.rotuloFinal === false)) s += op(k, t(`${se.pts[i][1]}${o.sufixo ?? '%'}`, p[0], p[1] + (se.rotDy ?? -16), { f: 'B', w: 600, s: 14, c: se.corRot ?? C.slate, a: 'middle' }));
    });
    // rótulo final em pílula, com contagem
    if (se.rotuloFinal !== false) {
      const last = P[P.length - 1], v = se.pts[se.pts.length - 1][1];
      const k = back(tt, a0 + (o.dur ?? 2.2) - 0.1, 0.45);
      if (k > 0) {
        const txt = contaNum(v, inv(a0 + (o.dur ?? 2.2) - 0.1, a0 + (o.dur ?? 2.2) + 0.7, tt)) + (o.sufixo ?? '%');
        const pw = o.pilulaW ?? 96, px = last[0] + 20, py = yFinal[si] - ph / 2;
        s += `<g transform="translate(${f(px)} ${f(py + ph / 2)}) scale(${f(k)}) translate(${f(-px)} ${f(-(py + ph / 2))})">`
          + `<path d="M${f(px - 12)},${f(last[1])} L${f(px)},${f(Math.max(py + 8, Math.min(py + ph - 8, last[1] - 7)))} L${f(px)},${f(Math.max(py + 16, Math.min(py + ph, last[1] + 7)))}Z" fill="${se.cor}"/>`
          + `<rect x="${f(px)}" y="${f(py)}" width="${pw}" height="${ph}" rx="9" fill="${se.cor}"/>`
          + t(txt, px + pw / 2, py + ph * 0.75, { f: 'H', w: 800, s: ph * 0.78, c: '#fff', a: 'middle' }) + `</g>`;
      }
    }
    // legenda da série
    if (se.nome) {
      const k = fin(tt, a0 + 0.2, 0.5);
      s += op(k, `<rect x="${f(se.legX ?? o.x)}" y="${f((se.legY ?? o.y - 18) - 10)}" width="22" height="5" rx="2.5" fill="${se.cor}"/>`
        + t(se.nome, (se.legX ?? o.x) + 32, se.legY ?? o.y - 18 + 0, { f: 'B', w: 600, s: 15, c: C.slate }));
    }
  });
  return s;
}

// faixa compacta de números lado a lado, com barrinha proporcional sob cada um.
// o: { x, y, w, h, titulo, itens: [{ rot, val, dec, pre, suf, cor, max }], t0, max, semBarra }
export function faixaNumeros(o, tt) {
  const k = fin(tt, o.t0, 0.45);
  if (k <= 0) return '';
  const n = o.itens.length, pad = 16, cw = (o.w - pad * 2) / n;
  let s = `<rect x="${f(o.x)}" y="${f(o.y)}" width="${f(o.w)}" height="${f(o.h)}" rx="10" fill="#fff" stroke="${C.blueLL}" stroke-width="1.5" filter="url(#fSombra)"/>`
    + tRico(o.titulo, o.x + pad, o.y + 24, { f: 'B', w: 700, s: 14.5, c: C.navy, hi: C.orangeD });
  o.itens.forEach((it, i) => {
    const a0 = o.t0 + 0.25 + i * 0.25;
    const u = ease.out(inv(a0, a0 + 0.7, tt));
    const x = o.x + pad + i * cw;
    const cor = it.cor ?? C.navy;
    const fmt = q => (it.pre ?? '') + contaNum(it.val, q, it.dec ?? 0) + (it.suf ?? '%');
    const wn = larg(fmt(1), 30, 800, 'H');
    s += op(clamp(u * 2), t(fmt(u), x, o.y + 60, { f: 'H', w: 800, s: 30, c: cor })
      + t(it.rot, x + wn + 7, o.y + 59, { f: 'B', w: i === 0 ? 700 : 500, s: 13, c: i === 0 ? C.navy : C.slate }));
    if (o.semBarra) return;
    const bw = cw - 18, max = it.max ?? o.max ?? 100;
    s += `<rect x="${f(x)}" y="${f(o.y + o.h - 17)}" width="${f(bw)}" height="6" rx="3" fill="${C.blueBg}"/>`;
    if (u > 0) s += `<rect x="${f(x)}" y="${f(o.y + o.h - 17)}" width="${f(Math.max(6, (it.val / max) * bw * u))}" height="6" rx="3" fill="${cor}"/>`;
  });
  return `<g opacity="${f(clamp(k))}" transform="translate(0 ${f((1 - k) * 14)})">${s}</g>`;
}

// ---------- o abismo ----------
// Barras sobre a mesma base (perguntas distintas, não etapas de funil): número à esquerda,
// barra proporcional e rótulo logo depois da ponta. Um colchete laranja marca a distância entre
// a maior e a menor barra. o: { x, y, w, hBar, gap, itens: [{ val, rot, cor }], t0, step, numW, rotChave }
export function abismo(o, tt) {
  const hB = o.hBar ?? 46, gap = o.gap ?? 22, numW = o.numW ?? 104, x0 = o.x + numW, wMax = o.w - numW;
  let s = '';
  const ponta = v => x0 + (v / 100) * wMax;
  o.itens.forEach((it, i) => {
    const a0 = o.t0 + i * (o.step ?? 0.55);
    const u = ease.out(inv(a0, a0 + 0.7, tt));
    if (u <= 0) return;
    const y = o.y + i * (hB + gap), cor = it.cor ?? C.navy;
    s += `<rect x="${f(x0)}" y="${f(y)}" width="${f(wMax)}" height="${hB}" rx="6" fill="${C.blueBg}"/>`;
    s += `<rect x="${f(x0)}" y="${f(y)}" width="${f(Math.max(8, (ponta(it.val) - x0) * u))}" height="${hB}" rx="6" fill="${cor}"/>`;
    s += op(clamp(u * 1.6), t(contaNum(it.val, inv(a0, a0 + 0.9, tt)) + '%', x0 - 14, y + hB * 0.8, { f: 'H', w: 800, s: hB * 1.0, c: cor, a: 'end' }));
    const kr = fin(tt, a0 + 0.35, 0.4);
    const lx = ponta(it.val) + 14, cabe = lx + larg(it.rot.replace(/\*/g, ''), 18, 700, 'B') < o.x + o.w + 4;
    s += op(kr, tRico(it.rot, cabe ? lx : x0 + 16, y + hB * 0.64, { f: 'B', w: 700, s: 18, c: cabe ? C.navy : '#fff', hi: C.orangeD }));
  });
  // colchete "o abismo" entre a ponta da maior e a da menor barra
  const kc = ease.out(inv(o.t0 + o.itens.length * (o.step ?? 0.55) + 0.3, o.t0 + o.itens.length * (o.step ?? 0.55) + 0.9, tt));
  if (kc > 0) {
    const vals = o.itens.map(it => it.val), a = ponta(Math.min(...vals)), b = ponta(Math.max(...vals));
    const yb = o.y + o.itens.length * (hB + gap) - gap + 16, bb = lerp(a, b, kc);
    s += `<path d="M${f(a)},${f(yb - 8)} L${f(a)},${f(yb)} L${f(bb)},${f(yb)}${kc > 0.98 ? ` L${f(b)},${f(yb - 8)}` : ''}" fill="none" stroke="${C.orange}" stroke-width="3" stroke-linejoin="round"/>`;
    s += op(fin(tt, o.t0 + o.itens.length * (o.step ?? 0.55) + 0.7, 0.4), `<rect x="${f((a + b) / 2 - 62)}" y="${f(yb - 2)}" width="124" height="26" rx="13" fill="${C.orange}"/>` + t(o.rotChave ?? 'O ABISMO', (a + b) / 2, yb + 16, { f: 'M', w: 700, s: 13, c: '#fff', a: 'middle', ls: 2 }));
  }
  return s;
}

// ---------- matriz de impacto ----------
// 5 x 5: x = probabilidade (1..5), y = impacto (1..5). Células coloridas pela severidade (P × I),
// bolhas numeradas por desafio (navy = gente ou processo, branca = tecnologia) e contorno da zona
// crítica (P × I >= limiar). o: { x, y, size, itens: [{ n, nome, nat, p, i }], t0, step, r, limiar }
export function corCalor(p, i) {
  const h = (p * i - 1) / 24; // 0..1
  const stops = [[0, [238, 243, 248]], [0.2, [220, 231, 242]], [0.4, [251, 236, 216]], [0.62, [249, 190, 122]], [1, [247, 140, 22]]];
  for (let k = 0; k < stops.length - 1; k++) {
    const [a, ca] = stops[k], [b, cb] = stops[k + 1];
    if (h <= b) {
      const u = (h - a) / (b - a);
      return `rgb(${ca.map((c, j) => Math.round(lerp(c, cb[j], u))).join(',')})`;
    }
  }
  return 'rgb(247,140,22)';
}
const ehCritico = (it, lim) => it.p * it.i >= lim;
const corNat = nat => (nat === 'tecnologia' ? { fill: '#fff', txt: C.navy, stroke: C.blue } : { fill: C.navy, txt: '#fff', stroke: C.navy });

export function matriz(o, tt) {
  const n = 5, g = 5, cs = (o.size - g * (n - 1)) / n, lim = o.limiar ?? 16;
  const cx = p => o.x + (p - 1) * (cs + g), cy = i => o.y + (n - i) * (cs + g);
  let s = '';
  // células (onda diagonal do canto inferior esquerdo)
  for (let p = 1; p <= n; p++) for (let i = 1; i <= n; i++) {
    const k = back(tt, o.t0 + (p + i - 2) * 0.06, 0.4);
    if (k <= 0) continue;
    const x = cx(p) + cs / 2, y = cy(i) + cs / 2;
    s += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})"><rect x="${f(-cs / 2)}" y="${f(-cs / 2)}" width="${f(cs)}" height="${f(cs)}" rx="6" fill="${corCalor(p, i)}"/></g>`;
  }
  // eixos com escala 1..5
  const kE = fin(tt, o.t0 + 0.3, 0.5);
  const yb = o.y + o.size;
  let eixos = `<path d="M${f(o.x)},${f(yb + 14)} L${f(o.x + o.size)},${f(yb + 14)}" stroke="${C.navy}" stroke-width="2"/><path d="M${f(o.x + o.size - 9)},${f(yb + 8)} L${f(o.x + o.size)},${f(yb + 14)} L${f(o.x + o.size - 9)},${f(yb + 20)}" fill="none" stroke="${C.navy}" stroke-width="2"/>`
    + t('PROBABILIDADE', o.x, yb + 56, { f: 'M', w: 600, s: 13.5, c: C.navy, ls: 2 })
    + `<path d="M${f(o.x - 14)},${f(yb)} L${f(o.x - 14)},${f(o.y)}" stroke="${C.navy}" stroke-width="2"/><path d="M${f(o.x - 20)},${f(o.y + 9)} L${f(o.x - 14)},${f(o.y)} L${f(o.x - 8)},${f(o.y + 9)}" fill="none" stroke="${C.navy}" stroke-width="2"/>`
    + `<g transform="translate(${f(o.x - 44)} ${f(yb)}) rotate(-90)">${t('IMPACTO NO RESULTADO', 0, 0, { f: 'M', w: 600, s: 13.5, c: C.navy, ls: 2 })}</g>`;
  for (let q = 1; q <= n; q++) {
    eixos += t(String(q), cx(q) + cs / 2, yb + 34, { f: 'M', w: 500, s: 12.5, c: C.grey, a: 'middle' })
      + t(String(q), o.x - 26, cy(q) + cs / 2 + 4, { f: 'M', w: 500, s: 12.5, c: C.grey, a: 'middle' });
  }
  s += op(kE, eixos);
  // zona crítica: contorno em escada das células com P × I >= lim
  const kZ = ease.out(inv(o.t0 + 0.9, o.t0 + 1.6, tt));
  if (kZ > 0) {
    const col = [];
    for (let p = 1; p <= n; p++) { let iMin = 0; for (let i = n; i >= 1; i--) if (p * i >= lim) iMin = i; if (iMin) col.push([p, iMin]); }
    if (col.length) {
      const topo = o.y - g / 2, dir = o.x + o.size + g / 2;
      let d = `M${f(cx(col[0][0]) - g / 2)},${f(topo)}`;
      for (const [p, iMin] of col) d += ` L${f(cx(p) - g / 2)},${f(cy(iMin) + cs + g / 2)} L${f(cx(p) + cs + g / 2)},${f(cy(iMin) + cs + g / 2)}`;
      d += ` L${f(dir)},${f(topo)}Z`;
      const per = 2 * o.size * 1.6;
      s += `<path d="${d}" fill="none" stroke="${C.orangeD}" stroke-width="3" stroke-dasharray="${f(per)}" stroke-dashoffset="${f(per * (1 - kZ))}" stroke-linejoin="round"/>`;
      s += op(fin(tt, o.t0 + 1.4, 0.4), `<rect x="${f(dir - 146)}" y="${f(topo - 36)}" width="146" height="27" rx="13.5" fill="${C.orangeD}"/>` + t('ZONA CRÍTICA', dir - 73, topo - 18, { f: 'M', w: 700, s: 12.5, c: '#fff', a: 'middle', ls: 1.5 }));
    }
  }
  // bolhas (até 3 por célula)
  const porCelula = {};
  o.itens.forEach(it => { const k = it.p + ',' + it.i; (porCelula[k] = porCelula[k] ?? []).push(it); });
  o.itens.forEach((it, idx) => {
    const lista = porCelula[it.p + ',' + it.i], j = lista.indexOf(it), m = lista.length;
    const R = m >= 3 ? cs * 0.26 : cs * 0.2;
    const off = m === 1 ? [0, 0] : m === 2 ? [[-R, -R * 0.55], [R, R * 0.55]][j] : [Math.cos(-Math.PI / 2 + (j / m) * 6.283) * R, Math.sin(-Math.PI / 2 + (j / m) * 6.283) * R + 3];
    const bx = cx(it.p) + cs / 2 + off[0], by = cy(it.i) + cs / 2 + off[1];
    const a0 = o.t0 + 1.2 + idx * (o.step ?? 0.32);
    const k = back(tt, a0, 0.45);
    if (k <= 0) return;
    const r = m >= 3 ? (o.rTrio ?? 17) : (o.r ?? 21), cn = corNat(it.nat);
    let b = '';
    if (ehCritico(it, lim) && tt > a0 + 0.5 && tt < (o.fimPulso ?? 1e9)) {
      const ph = ((tt - a0) % 1.6) / 1.6;
      b += `<circle r="${f(r + 3 + ph * 14)}" fill="none" stroke="${C.orangeD}" stroke-width="2" opacity="${f(0.7 * (1 - ph))}"/>`;
    }
    b += `<circle r="${r}" fill="${cn.fill}" stroke="${cn.stroke}" stroke-width="2.5" filter="url(#fSombra)"/>`
      + t(String(it.n), 0, r * 0.42, { f: 'H', w: 800, s: r * 1.2, c: cn.txt, a: 'middle' });
    s += `<g transform="translate(${f(bx)} ${f(by)}) scale(${f(k)})">${b}</g>`;
  });
  return s;
}

// legenda da matriz: número, nome e evidência (com fonte) por desafio
// o: { x, y, w, itens, t0, step, gap, lim }
export function legendaMatriz(o, tt) {
  let s = '', y = o.y;
  o.itens.forEach((it, idx) => {
    const a0 = o.t0 + 1.2 + idx * (o.step ?? 0.32);
    const k = fin(tt, a0 + 0.1, 0.45);
    const cn = corNat(it.nat), crit = ehCritico(it, o.lim ?? 16);
    const linhas = quebra(it.dado, 14, o.w - 44, 500, 'B');
    let b = `<circle cx="${f(o.x + 14)}" cy="${f(y - 5)}" r="13.5" fill="${cn.fill}" stroke="${cn.stroke}" stroke-width="2"/>`
      + t(String(it.n), o.x + 14, y + 1.5, { f: 'H', w: 800, s: 17, c: cn.txt, a: 'middle' })
      + t(it.nome, o.x + 38, y + 1, { f: 'B', w: 700, s: 17, c: C.navy })
      + (it.fonte ? t(it.fonte, o.x + o.w, y, { f: 'M', w: 500, s: 11.5, c: C.greyL, a: 'end' }) : '');
    if (crit) b += `<rect x="${f(o.x + 38 + larg(it.nome, 17, 700, 'B') + 8)}" y="${f(y - 11)}" width="8" height="8" rx="2" fill="${C.orangeD}" transform="rotate(45 ${f(o.x + 38 + larg(it.nome, 17, 700, 'B') + 12)} ${f(y - 7)})"/>`;
    linhas.forEach((l, i) => { b += tRico(l, o.x + 38, y + 21 + i * 17.5, { f: 'B', w: 500, s: 14, c: C.grey, hi: C.orangeD, hw: 700 }); });
    s += sobe(k, b, 12);
    y += 23 + linhas.length * 17.5 + (o.gap ?? 12);
  });
  return { svg: s, y };
}

// ---------- 10 · 20 · 70 ----------
// o: { x, y, w, h, partes: [{ v, rot, cor, corTxt }], t0 }
export function barraEmpilhada(o, tt) {
  let s = '', x = o.x;
  const total = o.partes.reduce((a, p) => a + p.v, 0);
  o.partes.forEach((p, i) => {
    const a0 = o.t0 + i * 0.35;
    const u = ease.out(inv(a0, a0 + 0.6, tt));
    const w = (p.v / total) * o.w;
    if (u > 0) {
      s += `<rect x="${f(x)}" y="${f(o.y)}" width="${f(Math.max(0, w * u - 3))}" height="${o.h}" fill="${p.cor}"${i === 0 ? ' rx="6"' : ''}/>`;
      s += op(fin(tt, a0 + 0.3, 0.4), t(`${p.v}%`, x + 14, o.y + o.h * 0.7, { f: 'H', w: 800, s: o.h * 0.62, c: p.corTxt ?? '#fff' })
        + (p.rot ? t(p.rot, x + (w > 300 ? 14 + larg(`${p.v}%`, o.h * 0.62, 800, 'H') + 12 : 14), w > 300 ? o.y + o.h * 0.62 : o.y + o.h + 22, { f: 'B', w: 600, s: w > 300 ? 17 : 14, c: w > 300 ? p.corTxt ?? '#fff' : C.slate }) : ''));
    }
    x += w;
  });
  if (o.nota) s += op(fin(tt, o.t0 + 1.2, 0.4), t(o.nota, o.x + o.w, o.y + o.h + 22, { f: 'M', w: 400, s: 12, c: C.greyL, a: 'end' }));
  return s;
}

// ---------- método em etapas (chevrons) ----------
// Cada etapa: número, título em 2 linhas, chips com os desafios da matriz que ela ataca e o entregável.
// o: { x, y, w, h, itens: [{ n, titulo: [l1, l2], ataca: [n...], itens: [...] }], nat: { n: nat }, t0, step }
export function etapas(o, tt) {
  const bico = 22, m = o.itens.length, pw = (o.w - bico) / m;
  let s = '';
  o.itens.forEach((it, i) => {
    const a0 = o.t0 + i * (o.step ?? 0.4);
    const k = ease.out(inv(a0, a0 + 0.5, tt));
    if (k <= 0) return;
    const x = o.x + i * pw, dx = (1 - k) * 60, tx = x + (i ? bico + 12 : 16);
    const ult = i === m - 1;
    const cor = ult ? C.orange : i % 2 ? C.navy3 : C.navy;
    const d = `M${f(x)},${f(o.y)} L${f(x + pw - 4)},${f(o.y)} L${f(x + pw - 4 + bico)},${f(o.y + o.h / 2)} L${f(x + pw - 4)},${f(o.y + o.h)} L${f(x)},${f(o.y + o.h)}${i ? ` L${f(x + bico)},${f(o.y + o.h / 2)}` : ''}Z`;
    let b = `<path d="${d}" fill="${cor}"/>` + t(`0${it.n}`, tx, o.y + 28, { f: 'M', w: 700, s: 13.5, c: ult ? C.navy : C.orangeL, ls: 1 });
    it.titulo.forEach((l, j) => { b += t(l, tx, o.y + 57 + j * 24, { f: 'H', w: 700, s: 24, c: '#fff', ls: 0.3 }); });
    // chips "ataca"
    const kc = fin(tt, a0 + 0.3, 0.35);
    let cb = t('ATACA', x + 4, o.y + o.h + 31, { f: 'M', w: 600, s: 11, c: C.grey, ls: 1.5 });
    (it.ataca ?? []).forEach((nn, q) => {
      const cxp = x + 62 + q * 27, cyp = o.y + o.h + 27;
      const tec = (o.nat ?? {})[nn] === 'tecnologia';
      cb += `<circle cx="${f(cxp)}" cy="${f(cyp)}" r="11.5" fill="${tec ? '#fff' : C.navy}" stroke="${tec ? C.blue : C.navy}" stroke-width="2"/>`
        + t(String(nn), cxp, cyp + 5, { f: 'H', w: 800, s: 15, c: tec ? C.navy : '#fff', a: 'middle' });
    });
    b += op(kc, cb);
    // entregável
    let yy = o.y + o.h + 66;
    (it.itens ?? []).forEach((e, j) => {
      const linhas = quebra(e, 14.5, pw - 22, 500, 'B');
      let eb = `<rect x="${f(x + 4)}" y="${f(yy - 15)}" width="3" height="${f(linhas.length * 18 + 2)}" rx="1.5" fill="${C.orange}"/>`;
      linhas.forEach((l, q) => { eb += t(l, x + 15, yy + q * 18, { f: 'B', w: 500, s: 14.5, c: C.slate }); });
      b += op(fin(tt, a0 + 0.4 + j * 0.12, 0.35), eb);
      yy += linhas.length * 18 + 10;
    });
    s += `<g opacity="${f(clamp(k * 1.5))}" transform="translate(${f(dx)} 0)">${b}</g>`;
  });
  return s;
}

// ---------- indicadores (o que medimos) ----------
// o: { x, y, w, h, itens: [{ ico, rot, sub }], t0, step, gap }
export function indicadores(o, tt) {
  const m = o.itens.length, gap = o.gap ?? 14, cw = (o.w - gap * (m - 1)) / m;
  let s = '';
  o.itens.forEach((it, i) => {
    const a0 = o.t0 + i * (o.step ?? 0.18);
    const k = back(tt, a0, 0.45);
    if (k <= 0) return;
    const x = o.x + i * (cw + gap), cyi = o.y + o.h / 2;
    let b = `<rect x="${f(x)}" y="${f(o.y)}" width="${f(cw)}" height="${o.h}" rx="12" fill="#fff" stroke="${C.blueLL}" stroke-width="1.5"/>`
      + `<rect x="${f(x)}" y="${f(o.y)}" width="5" height="${o.h}" rx="2.5" fill="${C.orange}"/>`
      + `<circle cx="${f(x + 32)}" cy="${f(cyi)}" r="19" fill="${C.blueBg}"/>` + ico(it.ico, x + 32, cyi, 1.05, C.navy, 2.2);
    const linhas = quebra(it.rot, 15.5, cw - 66, 700, 'B');
    const y0 = cyi - (linhas.length - 1) * 9 + (it.sub ? -4 : 5.5);
    linhas.forEach((l, q) => { b += t(l, x + 58, y0 + q * 18, { f: 'B', w: 700, s: 15.5, c: C.navy }); });
    if (it.sub) b += t(it.sub, x + 58, y0 + linhas.length * 18 + 2, { f: 'B', w: 500, s: 13, c: C.grey });
    s += `<g transform="translate(${f(x + cw / 2)} ${f(cyi)}) scale(${f(k)}) translate(${f(-(x + cw / 2))} ${f(-cyi)})">${b}</g>`;
  });
  return s;
}

// ---------- equação TECNOLOGIA × PESSOAS = PERFORMANCE ----------
// o: { x, y, h, termos: [{ rot, sub, cor, txt }], ops: ['×', '='], t0, w }
export function equacao(o, tt) {
  const n = o.termos.length, opW = 46;
  const cw = (o.w - opW * (n - 1)) / n;
  let s = '';
  o.termos.forEach((tm, i) => {
    const a0 = o.t0 + i * 0.45;
    const k = back(tt, a0, 0.5);
    const x = o.x + i * (cw + opW);
    if (k > 0) {
      const cxm = x + cw / 2, cym = o.y + o.h / 2;
      let b = `<rect x="${f(x)}" y="${f(o.y)}" width="${f(cw)}" height="${o.h}" rx="12" fill="${tm.cor}"${tm.borda ? ` stroke="${tm.borda}" stroke-width="2"` : ''}/>`
        + t(tm.rot, cxm, o.y + o.h * 0.5 + (tm.sub ? 0 : 10), { f: 'H', w: 800, s: tm.s ?? 34, c: tm.txt ?? '#fff', a: 'middle', ls: 0.8 });
      if (tm.sub) b += t(tm.sub, cxm, o.y + o.h * 0.5 + 26, { f: 'M', w: 600, s: 13, c: tm.subCor ?? C.blueL, a: 'middle', ls: 1.5 });
      s += `<g transform="translate(${f(cxm)} ${f(cym)}) scale(${f(k)}) translate(${f(-cxm)} ${f(-cym)})">${b}</g>`;
      if (tm.brilho) s += varredura('eqv' + i, x, o.y, cw, o.h, inv(a0 + 0.5, a0 + 1.4, tt), 12);
    }
    if (i < n - 1) {
      const ko = back(tt, a0 + 0.3, 0.4);
      if (ko > 0) s += `<g transform="translate(${f(x + cw + opW / 2)} ${f(o.y + o.h / 2)}) scale(${f(ko)})">${t(o.ops[i], 0, 15, { f: 'H', w: 800, s: 46, c: C.orange, a: 'middle' })}</g>`;
    }
  });
  return s;
}

// ---------- prova: 7x + gradiente da Prosci ----------
// Cartão com o múltiplo em destaque e 4 colunas (% de projetos que atingiram os objetivos por qualidade
// da gestão de mudanças). o: { x, y, w, h, num, rot, barras: [{ v, rot }], eixo, nota, t0 }
export function prova(o, tt) {
  const k = ease.out(inv(o.t0, o.t0 + 0.5, tt));
  if (k <= 0) return '';
  let s = `<rect x="${f(o.x)}" y="${f(o.y)}" width="${f(o.w)}" height="${f(o.h)}" rx="14" fill="#fff" stroke="${C.blueLL}" stroke-width="1.5" filter="url(#fSombra)"/>`
    + `<rect x="${f(o.x)}" y="${f(o.y)}" width="${f(o.w)}" height="6" rx="3" fill="${C.orange}"/>`;
  const kn = back(tt, o.t0 + 1.5, 0.5);
  if (kn > 0) s += `<g transform="translate(${f(o.x + 20)} ${f(o.y + 66)}) scale(${f(kn)})">${t(o.num, 0, 0, { f: 'H', w: 800, s: 64, c: C.orange })}</g>`;
  const wn = larg(o.num, 64, 800, 'H');
  quebra(o.rot, 13.5, o.w - wn - 40, 600, 'B').forEach((l, i) => { s += op(fin(tt, o.t0 + 1.7, 0.4), t(l, o.x + 30 + wn, o.y + 40 + i * 16.5, { f: 'B', w: 600, s: 13.5, c: C.navy })); });
  // colunas
  const n = o.barras.length, base = o.y + o.h - 62, hMax = o.h - 172, bw = 30;
  const passo = (o.w - 40) / n;
  o.barras.forEach((b, i) => {
    const a0 = o.t0 + 0.25 + i * 0.22;
    const u = ease.out(inv(a0, a0 + 0.6, tt));
    const cxb = o.x + 20 + passo * (i + 0.5), h = (b.v / 100) * hMax * u;
    const cor = i === n - 1 ? C.orange : [C.blueLL, C.blueL, C.blue][i] ?? C.navy;
    s += `<rect x="${f(cxb - bw / 2)}" y="${f(base - h)}" width="${bw}" height="${f(Math.max(0, h))}" rx="4" fill="${cor}"/>`;
    if (u > 0) s += t(contaNum(b.v, u) + '%', cxb, base - h - 7, { f: 'H', w: 800, s: 17, c: i === n - 1 ? C.orangeD : C.navy, a: 'middle' });
    s += t(b.rot, cxb, base + 17, { f: 'B', w: 500, s: 11.5, c: C.slate, a: 'middle' });
  });
  s += `<path d="M${f(o.x + 16)},${f(base)} L${f(o.x + o.w - 16)},${f(base)}" stroke="${C.blueL}" stroke-width="1.5"/>`;
  s += t(o.eixo.toUpperCase(), o.x + o.w / 2, base + 36, { f: 'M', w: 600, s: 9.5, c: C.grey, a: 'middle', ls: 0.6 });
  s += t(o.nota, o.x + o.w / 2, base + 52, { f: 'M', w: 400, s: 10, c: C.greyL, a: 'middle' });
  return `<g opacity="${f(clamp(k * 1.4))}" transform="translate(0 ${f((1 - k) * 20)})">${s}</g>`;
}

// transição entre páginas: faixas diagonais (laranja + ardósia + navy) atravessam a área (x0, y0, w, h).
// O navy cobre a área inteira em u = 0.5 (é quando a página troca por baixo).
export function cortina(u, x0, y0, w, h) {
  if (u <= 0 || u >= 1) return '';
  const e = ease.inOut(u);
  const inc = h * 0.42;
  const N = w + 2 * inc + 160;
  const faixas = [[C.orange, 60], [C.slate, 170], [C.navy, N], [C.slate, 110], [C.orange, 40]];
  const totalW = faixas.reduce((a, b) => a + b[1], 0);
  let x = x0 + lerp(w + inc, -totalW - inc, e);
  let s = `<clipPath id="cortClip"><rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}"/></clipPath><g clip-path="url(#cortClip)">`;
  for (const [cor, wf] of faixas) {
    s += `<path d="M${f(x + inc)},${f(y0)} L${f(x + inc + wf)},${f(y0)} L${f(x + wf)},${f(y0 + h)} L${f(x)},${f(y0 + h)}Z" fill="${cor}"/>`;
    x += wf;
  }
  return s + '</g>';
}

export { esc };
