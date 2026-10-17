// Gráficos do carrossel "IA precisa de adoção": escada (IA comprada → IA adotada), colunas com × sem
// gestão de mudanças, custo de começar tarde e a linha do tempo do projeto com a GMO entrando antes.
// Cada função recebe o tempo local da página (tt) e desenha o estado final quando tt é grande (PDF).
import { C, t, tRico, larg, quebra, clamp, lerp, inv, ease, n2, fin, back, op, contaNum, ico } from './base.js';

const f = n2;

// ---------- escada: três colunas que descem, com a queda anotada entre elas ----------
// o: { x, y, w, h, itens: [{ val, rot, sub, cor }], t0, step, suf }
export function escada(o, tt) {
  const n = o.itens.length, cw = o.w / n, bw = Math.min(190, cw * 0.58), base = o.y + o.h, hMax = o.h - 150, max = o.max ?? 100;
  let s = `<path d="M${f(o.x)},${f(base)} L${f(o.x + o.w)},${f(base)}" stroke="${C.blueL}" stroke-width="2"/>`;
  o.itens.forEach((it, i) => {
    const a0 = o.t0 + i * (o.step ?? 0.9);
    const u = ease.out(inv(a0, a0 + 0.8, tt));
    if (u <= 0) return;
    const cx = o.x + cw * (i + 0.5), h = (it.val / max) * hMax * u, cor = it.cor ?? C.navy;
    s += `<rect x="${f(cx - bw / 2)}" y="${f(base - h)}" width="${f(bw)}" height="${f(h)}" rx="8" fill="${cor}"/>`;
    s += t(contaNum(it.val, u) + (o.suf ?? '%'), cx, base - h - 16, { f: 'H', w: 800, s: 54, c: cor, a: 'middle' });
    const kr = fin(tt, a0 + 0.35, 0.4);
    let rb = t(it.rot, cx, base + 34, { f: 'B', w: 700, s: 19, c: C.navy, a: 'middle' });
    quebra(it.sub ?? '', 15.5, cw - 8, 500, 'B').forEach((l, q) => { rb += t(l, cx, base + 58 + q * 19, { f: 'B', w: 500, s: 15.5, c: C.slate, a: 'middle' }); });
    s += op(kr, rb);
    // queda entre esta coluna e a anterior (só quando as duas têm a mesma base)
    if (i > 0 && !it.semQueda) {
      const prev = o.itens[i - 1], hp = (prev.val / max) * hMax, cxp = o.x + cw * (i - 0.5);
      const kq = ease.out(inv(a0 + 0.5, a0 + 1.0, tt));
      if (kq > 0) {
        const x1 = cxp + bw / 2 + 8, x2 = cx - bw / 2 - 8, ym = base - hp, yn = base - (it.val / max) * hMax;
        s += `<path d="M${f(x1)},${f(ym)} L${f(lerp(x1, x2, kq))},${f(lerp(ym, yn, kq))}" stroke="${C.orange}" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>`;
        const dif = prev.val - it.val;
        s += op(kq, `<g transform="translate(${f((x1 + x2) / 2)} ${f((ym + yn) / 2 - 22)})"><rect x="-44" y="-16" width="88" height="30" rx="15" fill="${C.orangeBg}" stroke="${C.orange}" stroke-width="1.5"/>${t(`−${dif} p.p.`, 0, 5, { f: 'M', w: 700, s: 14, c: C.orangeD, a: 'middle' })}</g>`);
      }
    }
  });
  return s;
}

// ---------- waffle: "de cada 100", três grades de 10 × 10 que se preenchem ----------
// o: { x, y, w, itens: [{ val, rot, sub, cor }], t0, step, dot, gap, lacuna: { de, ate, rot } }
export function waffle(o, tt) {
  const n = o.itens.length, dot = o.dot ?? 22, gap = o.gap ?? 6, gw = 10 * dot + 9 * gap;
  const cw = o.w / n;
  let s = '';
  const gy = o.y + 76;
  o.itens.forEach((it, i) => {
    const a0 = o.t0 + i * (o.step ?? 1.0);
    const u = ease.out(inv(a0, a0 + 1.4, tt));
    const cx = o.x + cw * (i + 0.5), gx = cx - gw / 2, cor = it.cor ?? C.navy;
    const cheios = Math.round(it.val * u);
    // grade: quadrados de baixo para cima, da esquerda para a direita
    for (let k = 0; k < 100; k++) {
      const col = k % 10, row = 9 - Math.floor(k / 10);
      const on = k < cheios;
      const ultimo = on && k === cheios - 1 && u < 1;
      s += `<rect x="${f(gx + col * (dot + gap))}" y="${f(gy + row * (dot + gap))}" width="${dot}" height="${dot}" rx="5" fill="${on ? cor : '#E6ECF2'}"${ultimo ? ` stroke="${C.orange}" stroke-width="2"` : ''}/>`;
    }
    // número e rótulos
    const kn = clamp(u * 1.5);
    s += op(kn, t(contaNum(it.val, u) + '%', cx, o.y + 56, { f: 'H', w: 800, s: 60, c: cor === C.orange ? C.orangeD : cor, a: 'middle' }));
    const kr = fin(tt, a0 + 0.5, 0.4);
    let rb = t(it.rot, cx, gy + gw + 36, { f: 'B', w: 700, s: 19, c: C.navy, a: 'middle' });
    quebra(it.sub ?? '', 15, cw - 12, 500, 'B').forEach((l, q) => { rb += t(l, cx, gy + gw + 60 + q * 19, { f: 'B', w: 500, s: 15, c: C.slate, a: 'middle' }); });
    s += op(kr, rb);
    // seta entre painéis
    if (i < n - 1) {
      const ka = fin(tt, a0 + 0.9, 0.4), ax = o.x + cw * (i + 1), ay = gy + gw / 2;
      s += op(ka, `<path d="M${f(ax - 14)},${f(ay)} L${f(ax + 14)},${f(ay)} M${f(ax + 6)},${f(ay - 8)} L${f(ax + 14)},${f(ay)} L${f(ax + 6)},${f(ay + 8)}" fill="none" stroke="${C.blueL}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
  });
  // lacuna entre o primeiro e o último painel
  if (o.lacuna) {
    const a0 = o.t0 + n * (o.step ?? 1.0) + 0.3, k = ease.out(inv(a0, a0 + 0.6, tt));
    if (k > 0) {
      const x1 = o.x + cw * 0.5, x2 = o.x + cw * (n - 0.5), yb = gy + gw + 96;
      const xm = lerp(x1, x2, k);
      s += `<path d="M${f(x1)},${f(yb - 8)} L${f(x1)},${f(yb)} L${f(xm)},${f(yb)}${k > 0.98 ? ` L${f(x2)},${f(yb - 8)}` : ''}" fill="none" stroke="${C.orange}" stroke-width="3" stroke-linejoin="round"/>`;
      const txt = o.lacuna.rot, wl = larg(txt, 14, 700, 'M') + txt.length * 1.5 + 40;
      s += op(fin(tt, a0 + 0.5, 0.4), `<rect x="${f((x1 + x2) / 2 - wl / 2)}" y="${f(yb - 14)}" width="${f(wl)}" height="28" rx="14" fill="${C.orange}"/>` + t(txt, (x1 + x2) / 2, yb + 5, { f: 'M', w: 700, s: 14, c: C.navy, a: 'middle', ls: 1.5 }));
    }
  }
  return s;
}

// ---------- colunas: com × sem gestão de mudanças (gradiente de qualidade) ----------
// o: { x, y, w, h, itens: [{ val, rot }], zonas: [{ de, ate, rot, cor }], destaque: { num, rot }, t0, step, eixo }
export function colunas(o, tt) {
  const n = o.itens.length, cw = o.w / n, bw = Math.min(120, cw * 0.6), base = o.y + o.h, hMax = o.h - 120;
  let s = '';
  // zonas (faixas de fundo que rotulam "sem" e "com")
  (o.zonas ?? []).forEach(z => {
    const k = fin(tt, o.t0 - 0.2, 0.5);
    const x1 = o.x + cw * z.de, x2 = o.x + cw * z.ate;
    s += op(k, `<rect x="${f(x1 + 6)}" y="${f(o.y)}" width="${f(x2 - x1 - 12)}" height="${f(o.h - 42)}" rx="12" fill="${z.cor}"/>`
      + t(z.rot.toUpperCase(), (x1 + x2) / 2, o.y + 30, { f: 'B', w: 700, s: 15, c: z.txt ?? C.navy, a: 'middle', ls: 1.5 }));
  });
  s += `<path d="M${f(o.x)},${f(base - 42)} L${f(o.x + o.w)},${f(base - 42)}" stroke="${C.blueL}" stroke-width="1.5"/>`;
  const cores = o.cores ?? [C.red, C.orangeL, C.blue, C.navy];
  o.itens.forEach((it, i) => {
    const a0 = o.t0 + i * (o.step ?? 0.45);
    const u = ease.out(inv(a0, a0 + 0.7, tt));
    const cx = o.x + cw * (i + 0.5), hTot = hMax - 60;
    s += t(it.rot, cx, base - 14, { f: 'B', w: 600, s: 19, c: C.slate, a: 'middle' });
    if (u <= 0) return;
    const h = (it.val / 100) * hTot * u, cor = it.cor ?? cores[i] ?? C.navy;
    s += `<rect x="${f(cx - bw / 2)}" y="${f(base - 42 - h)}" width="${f(bw)}" height="${f(h)}" rx="7" fill="${cor}"/>`;
    s += t(contaNum(it.val, u) + '%', cx, base - 42 - h - 12, { f: 'H', w: 800, s: 40, c: i === 0 ? cor : C.navy, a: 'middle' });
  });
  // seta de destaque entre a primeira e a última coluna, com o múltiplo
  if (o.destaque) {
    const a0 = o.t0 + n * (o.step ?? 0.45) + 0.3;
    const k = ease.out(inv(a0, a0 + 0.7, tt));
    if (k > 0) {
      const x1 = o.x + cw * 0.5 + bw / 2 + 10, x2 = o.x + cw * (n - 0.5) - bw / 2 - 10;
      const y1 = base - 42 - (o.itens[0].val / 100) * (hMax - 60) - 70, y2 = base - 42 - (o.itens[n - 1].val / 100) * (hMax - 60) - 70;
      const xm = lerp(x1, x2, k), ym = lerp(y1, y2, k);
      s += `<path d="M${f(x1)},${f(y1)} L${f(xm)},${f(ym)}" stroke="${C.orange}" stroke-width="3.5" stroke-linecap="round"/>`;
      if (k > 0.97) s += `<path d="M${f(x2 - 14)},${f(y2 + 2)} L${f(x2)},${f(y2)} L${f(x2 - 6)},${f(y2 + 14)}" fill="none" stroke="${C.orange}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      const kb = back(tt, a0 + 0.6, 0.5);
      if (kb > 0) {
        const bx = lerp(x1, x2, 0.74), by = lerp(y1, y2, 0.74) - 54;
        s += `<g transform="translate(${f(bx)} ${f(by)}) scale(${f(kb)})"><circle r="42" fill="${C.orange}"/><circle r="36" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 5" opacity=".8"/>${t(o.destaque.num, 0, 15, { f: 'H', w: 800, s: 44, c: C.navy, a: 'middle' })}${o.destaque.rot ? t(o.destaque.rot, 0, 30, { f: 'B', w: 700, s: 11, c: C.navy, a: 'middle' }) : ''}</g>`;
      }
    }
  }
  if (o.eixo) s += op(fin(tt, o.t0 + 0.4, 0.4), t(o.eixo, o.x + o.w / 2, base + 12, { f: 'M', w: 500, s: 12.5, c: C.grey, a: 'middle', ls: 1 }));
  return s;
}

// ---------- custo de começar tarde: barras horizontais por momento de início ----------
// o: { x, y, w, itens: [{ rot, val, cor }], hBar, gap, t0, step, max, suf, rotW }
export function barrasTempo(o, tt) {
  const hB = o.hBar ?? 40, gap = o.gap ?? 16, rotW = o.rotW ?? 230, x0 = o.x + rotW, wMax = o.w - rotW - 80, max = o.max ?? 100;
  let s = '';
  o.itens.forEach((it, i) => {
    const a0 = o.t0 + i * (o.step ?? 0.4);
    const u = ease.out(inv(a0, a0 + 0.7, tt));
    const y = o.y + i * (hB + gap), cor = it.cor ?? C.navy;
    s += op(clamp(u * 3), t(it.rot, x0 - 16, y + hB * 0.66, { f: 'B', w: i === 0 ? 700 : 500, s: 20, c: i === 0 ? C.navy : C.slate, a: 'end' }));
    s += `<rect x="${f(x0)}" y="${f(y)}" width="${f(wMax)}" height="${hB}" rx="6" fill="${C.blueBg}"/>`;
    if (u <= 0) return;
    const wv = Math.max(6, (it.val / max) * wMax * u);
    s += `<rect x="${f(x0)}" y="${f(y)}" width="${f(wv)}" height="${hB}" rx="6" fill="${cor}"/>`;
    s += t(contaNum(it.val, u) + (o.suf ?? '%'), x0 + wv + 12, y + hB * 0.7, { f: 'H', w: 800, s: hB * 0.8, c: cor });
  });
  return s;
}

// ---------- curvas de adoção no tempo (ilustrativas): com GMO cedo, com GMO tarde, sem GMO ----------
// o: { x, y, w, h, t0, golive (0..1 no eixo), curvas: [{ rot, cor, pts: [[u, v]...], tracejado }] }
export function curvasAdocao(o, tt) {
  const X = u => o.x + u * o.w, Y = v => o.y + o.h - v * o.h;
  const kG = fin(tt, o.t0 - 0.3, 0.5);
  let s = op(kG, `<path d="M${f(o.x)},${f(Y(0))} L${f(o.x + o.w)},${f(Y(0))}" stroke="${C.blueL}" stroke-width="1.6"/>`
    + `<path d="M${f(o.x)},${f(Y(0))} L${f(o.x)},${f(o.y)}" stroke="${C.blueL}" stroke-width="1.6"/>`
    + t('ADOÇÃO', o.x - 10, o.y + 12, { f: 'M', w: 600, s: 12.5, c: C.grey, a: 'end', ls: 1.5 })
    + t('TEMPO DO PROJETO →', o.x + o.w, Y(0) + 24, { f: 'M', w: 600, s: 12.5, c: C.grey, a: 'end', ls: 1.5 }));
  if (o.golive != null) {
    s += op(kG, `<path d="M${f(X(o.golive))},${f(o.y)} L${f(X(o.golive))},${f(Y(0))}" stroke="${C.slate}" stroke-width="1.5" stroke-dasharray="4 5"/>`
      + t('GO-LIVE', X(o.golive), o.y - 8, { f: 'M', w: 700, s: 12.5, c: C.slate, a: 'middle', ls: 1.5 }));
  }
  o.curvas.forEach((cv, i) => {
    const a0 = o.t0 + i * 0.6;
    const u = ease.inOut(inv(a0, a0 + 1.8, tt));
    if (u <= 0) return;
    // curva suave por Catmull-Rom → Bézier
    const P = cv.pts.map(([a, b]) => [X(a), Y(b)]);
    let d = `M${f(P[0][0])},${f(P[0][1])}`;
    for (let k = 0; k < P.length - 1; k++) {
      const p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(P.length - 1, k + 2)];
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    const per = o.w * 2.2;
    s += `<path d="${d}" fill="none" stroke="${cv.cor}" stroke-width="${cv.larg ?? 5}" stroke-linecap="round"${cv.tracejado ? ' stroke-dasharray="9 8"' : ''} pathLength="${f(per)}" stroke-dasharray="${cv.tracejado ? '9 8' : f(per)}" stroke-dashoffset="${f(cv.tracejado ? 0 : per * (1 - u))}" opacity="${f(cv.tracejado ? u : 1)}"/>`;
    const last = P[P.length - 1];
    const kr = fin(tt, a0 + 1.6, 0.4);
    const lw = larg(cv.rot, 14, 700) + 20;
    s += op(kr, `<rect x="${f(last[0] + 10)}" y="${f(last[1] - 15)}" width="${f(lw)}" height="28" rx="14" fill="${cv.cor}"/>`
      + t(cv.rot, last[0] + 20, last[1] + 5, { f: 'B', w: 700, s: 14, c: cv.txt ?? '#fff' }));
  });
  if (o.nota) s += op(fin(tt, o.t0 + 2.4, 0.4), t(o.nota, o.x, Y(0) + 48, { f: 'B', w: 500, s: 13, c: C.grey }));
  return s;
}

// ---------- linha do tempo do projeto: a GMO entra antes da tecnologia ----------
// o: { x, y, w, fases: [{ rot, de, ate }], faixas: [{ rot, de, ate, cor, txt, itens: [{ em, rot }] }], golive, antes, t0 }
// de/ate em unidades do projeto (0 = kickoff, 1 = fim); valores negativos ficam antes do kickoff.
export function linhaDoTempo(o, tt) {
  const uMin = Math.min(0, ...o.faixas.map(fx => fx.de), ...(o.fases ?? []).map(fa => fa.de));
  const X = u => o.x + ((u - uMin) / (1 - uMin)) * o.w;
  let s = '';
  const kE = fin(tt, o.t0, 0.5);
  const yE = o.y;
  s += op(kE, `<path d="M${f(o.x)},${f(yE)} L${f(o.x + o.w)},${f(yE)}" stroke="${C.navy}" stroke-width="2"/>`);
  (o.fases ?? []).forEach((fa, i) => {
    const k = fin(tt, o.t0 + 0.1 + i * 0.12, 0.4);
    const xa = X(fa.de), xb = X(fa.ate);
    s += op(k, `<path d="M${f(xa)},${f(yE - 8)} L${f(xa)},${f(yE + 8)}" stroke="${C.navy}" stroke-width="2"/>`
      + t(fa.rot.toUpperCase(), (xa + xb) / 2, yE - 16, { f: 'M', w: 700, s: 16, c: C.navy, a: 'middle', ls: 1.5 }));
  });
  if (o.golive != null) {
    const k = back(tt, o.t0 + 0.6, 0.5);
    if (k > 0) s += `<g transform="translate(${f(X(o.golive))} ${f(yE)}) scale(${f(k)})"><path d="M0,-14 L11,0 L0,14 L-11,0Z" fill="${C.orange}"/></g>`
      + op(k, t('GO-LIVE', X(o.golive), yE - 42, { f: 'M', w: 700, s: 15, c: C.orangeD, a: 'middle', ls: 1.5 }));
  }
  // chamada "antes do kickoff": colchete entre o início da GMO e o kickoff
  if (o.antes) {
    const k = fin(tt, o.t0 + 0.5, 0.5);
    const xa = X(o.antes.de), xb = X(0);
    s += op(k, `<rect x="${f(xa)}" y="${f(yE + 4)}" width="${f(xb - xa)}" height="32" rx="6" fill="${C.orange}"/>`
      + t(o.antes.rot, (xa + xb) / 2, yE + 26, { f: 'B', w: 700, s: 15, c: C.navy, a: 'middle', ls: 0.5 }));
  }
  // faixas, com o rótulo dentro da barra e os marcos embaixo
  let y = yE + 78;
  (o.faixas ?? []).forEach((fx, i) => {
    const a0 = o.t0 + 0.8 + i * 0.7;
    const u = ease.out(inv(a0, a0 + 0.9, tt));
    const h = fx.h ?? 44, xa = X(fx.de), xb = X(fx.ate);
    if (u > 0) {
      // rótulo da faixa logo acima dela, alinhado ao início
      s += op(clamp(u * 3), t(fx.rot.toUpperCase(), xa + 2, y - 10, { f: 'H', w: 700, s: 22, c: fx.cor === '#fff' ? C.navy : fx.cor, ls: 1 }));
      s += `<rect x="${f(xa)}" y="${f(y)}" width="${f((xb - xa) * u)}" height="${h}" rx="10" fill="${fx.cor}"/>`;
      (fx.itens ?? []).forEach((it, j) => {
        const k = fin(tt, a0 + 0.5 + j * 0.25, 0.4);
        const cx = X(it.em);
        s += op(k, `<circle cx="${f(cx)}" cy="${f(y + h / 2)}" r="6" fill="${fx.txt ?? '#fff'}" stroke="${fx.cor}" stroke-width="2"/>`
          + (it.linha ? `<path d="M${f(cx)},${f(y + h + 4)} L${f(cx)},${f(y + h + 24 + it.linha * 20 - 14)}" stroke="${C.blueLL}" stroke-width="1.5"/>` : '')
          + t(it.rot, cx + (it.dx ?? 0), y + h + 24 + (it.linha ?? 0) * 20, { f: 'B', w: 600, s: 17, c: C.slate, a: it.a ?? 'middle' }));
      });
    }
    y += h + (fx.gapBaixo ?? 92);
  });
  return { svg: s, y };
}

export { ico, tRico };
