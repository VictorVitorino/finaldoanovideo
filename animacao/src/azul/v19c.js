// v19 · cenas 11 a 13: linha do tempo dos seis projetos, cockpit/testes/IA com Vinicius e Rumo a 2027.
import { clamp, lerp, inv, ease, rng, tr, g, op, TAU } from '../core.js';
import { F, W, H, COR, T, OS, larg, logoImg, logoPilula, entra, sobe, fundo, vinheta, vidro, pilula, chip, chipW, secao, brilhoPonto, checkIco, pessoa, largPessoa, foraEsq, avatar, palavra } from './base.js';

// curva suave (Catmull-Rom) por pontos; devolve amostras com comprimento acumulado
function curva(pts, n = 240) {
  const out = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const seg = Math.max(2, Math.round(n / (pts.length - 1)));
    for (let k = 0; k < seg; k++) {
      const u = k / seg, u2 = u * u, u3 = u2 * u;
      out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
    }
  }
  out.push(pts[pts.length - 1]);
  const cum = [0];
  for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  const comp = cum[cum.length - 1];
  const d = out.map((p, i) => `${i ? 'L' : 'M'}${F(p[0])} ${F(p[1])}`).join(' ');
  const ponto = u => { const L = clamp(u) * comp; let i = 1; while (i < cum.length - 1 && cum[i] < L) i++; const k = (L - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return [lerp(out[i - 1][0], out[i][0], k), lerp(out[i - 1][1], out[i][1], k)]; };
  const uDe = x => { let best = 0, bd = 1e9; for (let i = 0; i < out.length; i++) { const dd = Math.abs(out[i][0] - x); if (dd < bd) { bd = dd; best = i; } } return cum[best] / comp; };
  return { d, comp, ponto, uDe };
}

// ------------------------------------------------------------------ CENA 11 · LINHA DO TEMPO
const PROJ = [
  { nome: 'Unimed Brasil', logo: 'unimed', sub: 'Remediação · ERP Protheus', time: ['bruno'], cor: '#2bb673', ico: 'bandeira', x: 230, ny: 515, cima: true },
  { nome: 'FUNED', logo: 'funed', sub: 'TMO + GMO · ERP Protheus', time: ['jose', 'nara'], cor: '#e0405a', ico: 'frasco', x: 530, ny: 600, cima: false },
  { nome: 'CAOA', logo: 'caoa', sub: 'Remediação · ERP Protheus', time: ['massao', 'thauany'], cor: '#2f6fe0', ico: 'sol', x: 830, ny: 515, cima: true },
  { nome: 'John Deere Argentina', logo: 'john-deere', sub: 'Remediação · ERP Protheus', time: ['joao', 'mancini', 'jaqueline'], cor: '#2bb673', ico: 'globo', x: 1130, ny: 600, cima: false },
  { nome: 'Hughes', logo: 'hughes', sub: 'TMO + GMO · ERP Protheus', time: ['giovanna', 'pedro'], cor: '#2f6fe0', ico: 'raio', x: 1430, ny: 515, cima: true },
  { nome: 'Libercon', logo: 'libercon', sub: 'TMO + GMO · ERP RM', time: ['monica'], cor: '#2f6fe0', ico: 'predio', x: 1730, ny: 600, cima: false },
];
const TRILHA = curva([[-60, 560], [230, 515], [530, 600], [830, 515], [1130, 600], [1430, 515], [1730, 600], [1900, 430], [1990, 380]]);
function icoNo(n) {
  const st = `stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (n) {
    case 'bandeira': return `<path d="M-8 14 V-14 M-8 -14 h18 l-5 7 l5 7 h-18" ${st}/>`;
    case 'frasco': return `<path d="M-5 -14 h10 M-3 -14 v9 l-9 15 a3 3 0 0 0 3 4 h18 a3 3 0 0 0 3 -4 l-9 -15 v-9" ${st}/>`;
    case 'sol': return `<circle r="6" ${st}/><path d="M0 -14 v4 M0 10 v4 M-14 0 h4 M10 0 h4 M-10 -10 l3 3 M7 7 l3 3 M10 -10 l-3 3 M-7 7 l-3 3" ${st}/>`;
    case 'globo': return `<circle r="13" ${st}/><path d="M-13 0 h26 M0 -13 c-7 7 -7 19 0 26 c7 -7 7 -19 0 -26" ${st}/>`;
    case 'raio': return `<path d="M3 -15 L-8 2 H0 L-3 15 L8 -2 H0 Z" fill="#fff"/>`;
    default: return `<rect x="-9" y="-13" width="18" height="26" rx="2" ${st}/><path d="M-4 -7 h2 M2 -7 h2 M-4 -1 h2 M2 -1 h2 M-4 5 h2 M2 5 h2" ${st}/>`;
  }
}

export function linha(L, t, dur) {
  let s = fundo(t);
  const t0 = t - L;
  const tU = palavra('l22', 3), tBr = palavra('l22', 4), tF = palavra('l23', 2), tC = palavra('l23', 3), tJD = palavra('l23', 5), tArg = palavra('l23', -1), tH = palavra('l24', 0), tLb = palavra('l24', 2), tSeis = palavra('l24', 6), tEvo = palavra('l24', -1);
  const chega = [tU - 0.4, tF - 0.3, tC - 0.3, tJD - 0.2, tH - 0.3, tLb - 0.25];
  const uNo = PROJ.map(p => TRILHA.uDe(p.x));
  // avanço da cabeça do caminho (linear por trechos entre os marcos)
  const marcos = [[t0 + 0.2, 0], ...chega.map((tt, i) => [tt, uNo[i]]), [tSeis + 0.9, 1]];
  let u = 0;
  for (let i = 0; i < marcos.length - 1; i++) { const [ta, ua] = marcos[i], [tb, ub] = marcos[i + 1]; if (t >= ta) u = lerp(ua, ub, ease.inOut(inv(ta, tb, t))); }
  // câmera: acompanha a cabeça até o 4º marco, depois volta ao geral
  const head = TRILHA.ponto(u);
  const segue = 1 - ease.inOut(inv(tH - 0.6, tH + 0.4, t));
  // deriva suave atrás da cabeça do caminho, limitada para que nenhum cartão já apresentado saia do quadro
  const camx = clamp(lerp(960, head[0], 0.3 * segue), 955, 976), zoom = 1 + 0.012 * segue * ease.out(inv(0.3, 1.2, L));
  let v = '';
  // marca d'água "2026"
  v += T('2026', 960, 720, 420, { w: 900, fill: 'rgba(255,255,255,.035)', ls: 10 });
  // trilha
  v += `<path d="${TRILHA.d}" stroke="rgba(230,183,94,.18)" stroke-width="14" fill="none" stroke-dasharray="${F(u * TRILHA.comp)} 9999" filter="url(#azBrilhoP)"/>`;
  v += `<path d="${TRILHA.d}" stroke="url(#azOuroV)" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="${F(u * TRILHA.comp)} 9999"/>`;
  if (u < 1) v += brilhoPonto(head[0], head[1], 6, '#fff', 1);
  else { const k = ease.out(inv(tSeis + 0.9, tSeis + 1.3, t)); v += op(k, `<path d="M1950 395 l28 -14 l-12 30" fill="${COR.ouro}"/>`); }
  // nós e cartões
  PROJ.forEach((p, i) => {
    const k = ease.back(inv(chega[i], chega[i] + 0.5, t));
    if (k <= 0) return;
    const pul = 0.5 + 0.5 * Math.sin(L * 3 + i);
    v += g(`translate(${p.x} ${p.ny}) scale(${F(k)})`, `<circle r="46" fill="${p.cor}" opacity=".35" filter="url(#azBrilho)"/><circle r="40" fill="none" stroke="${p.cor}" stroke-width="2" stroke-dasharray="4 6" opacity=".8" transform="rotate(${F(L * 30)})"/><circle r="32" fill="${COR.navy}" stroke="${p.cor}" stroke-width="3"/>` + icoNo(p.ico));
    // haste e cartão
    const kc = ease.out(inv(chega[i] + 0.15, chega[i] + 0.65, t));
    const cw = 330, ch = 170, cx = p.x, cy = p.cima ? p.ny - 70 - ch : p.ny + 70;
    if (kc > 0) {
      v += `<line x1="${p.x}" y1="${F(p.cima ? p.ny - 32 : p.ny + 32)}" x2="${p.x}" y2="${F(p.cima ? p.ny - 70 : p.ny + 70)}" stroke="${p.cor}" stroke-width="2" opacity="${F(kc)}"/>`;
      let c = vidro(0, 0, cw, ch, { r: 16, fill: 'rgba(18,42,88,.72)', borda: 'rgba(255,255,255,.2)' }) + `<rect x="0" y="0" width="5" height="${ch}" rx="2" fill="${p.cor}"/>`;
      c += logoPilula('logo-' + p.logo, 18 + 70, 34, 140, 40);
      c += T(p.nome, 20, 86, 22, { w: 800, fill: '#fff', anchor: 'start' }) + T(p.sub, 20, 112, 16, { ...OS, w: 400, fill: COR.claro, anchor: 'start' });
      p.time.forEach((id, j) => { const q = ease.back(inv(chega[i] + 0.5 + j * 0.12, chega[i] + 0.9 + j * 0.12, t)); if (q > 0) c += avatar(id, 36 + j * 28, 144, 15, q, p.cor); });
      const np = p.time.length; const qn = ease.out(inv(chega[i] + 0.7, chega[i] + 1.1, t));
      c += op(qn, T(`${np} pessoa${np > 1 ? 's' : ''}`, 36 + np * 28 + 6, 150, 15, { ...OS, w: 700, fill: COR.ouro2, anchor: 'start' }));
      v += op(kc, g(`translate(${F(cx - cw / 2)} ${F(cy + (p.cima ? -1 : 1) * 14 * (1 - kc))})`, c));
    }
  });
  const kb = ease.back(inv(tBr - 0.1, tBr + 0.4, t));
  if (kb > 0) v += g(`translate(230 585) scale(${F(kb)})`, pilula('☆ O COMEÇO', 0, 0, { fill: COR.ouro, cor: COR.navy, size: 15, ls: 2.5 }));
  const ka = ease.back(inv(tArg - 0.25, tArg + 0.25, t));
  if (ka > 0) v += g(`translate(1130 520) scale(${F(ka)})`, pilula('Argentina', 0, 0, { fill: 'rgba(7,17,42,.85)', stroke: 'rgba(255,255,255,.3)', size: 15, fam: 'Open Sans', w: 600 }));
  // título final
  const kt = ease.out(inv(tSeis - 0.1, tSeis + 0.5, t));
  if (kt > 0) {
    const partes = [['PROGRAMA TOTVS –', '#fff'], ['6', COR.ouro2], ['PROJETOS', '#fff'], ['1', COR.ouro2], ['JORNADA', '#fff']];
    const esp = larg('N', 50, 900) * 0.55;
    const tot = partes.reduce((a, [p]) => a + larg(p, 50, 900), 0) + esp * (partes.length - 1); let x = 960 - tot / 2;
    let tt = ''; partes.forEach(([p, c]) => { tt += T(p, x, 182, 50, { w: 900, fill: c, anchor: 'start' }); x += larg(p, 50, 900) + esp; });
    v += op(kt, g(tr(0, 14 * (1 - kt)), tt));
    const ev = Math.sin(clamp(inv(tEvo - 0.4, tEvo + 1.0, t)) * Math.PI);
    if (ev > 0) v += `<rect x="${F(960 - tot / 2 - 20)}" y="136" width="${F(tot + 40)}" height="64" rx="12" fill="${COR.ouro}" opacity="${F(0.12 * ev)}"/>`;
  }
  s += g(`translate(960 560) scale(${F(zoom)}) translate(${F(-camx)} -560)`, v);
  s += secao('COMO TUDO COMEÇOU · 2026', 60, 118, L - 0.1, { size: 16 });
  return s + vinheta(0.6);
}

// ------------------------------------------------------------------ CENA 12 · COCKPIT · TESTES · IA
const PW = 1200, PH = 560, PX = [360, 1640, 2920], PY = 190;
const PORT = [
  ['unimed', 'Unimed Brasil', 'Remediação ERP Protheus', 1.0, 'Go-live', COR.verde2],
  ['funed', 'FUNED', 'TMO+GMO', 0.6, 'Em andamento', COR.azulClaro],
  ['caoa', 'CAOA', 'Remediação', 0.75, 'Em andamento', COR.azulClaro],
  ['john-deere', 'John Deere Argentina', 'Remediação', 1.0, 'Go-live', COR.verde2],
  ['hughes', 'Hughes', 'TMO+GMO', 0.45, '', ''],
  ['libercon', 'Libercon', 'TMO+GMO ERP RM', 0.25, '', ''],
];
const XRAY = [['Roteiro padronizado', 'OK', 'VS'], ['Rastreabilidade ponta a ponta', 'OK', 'BM'], ['Evidência no lugar certo', 'OK', 'JA'], ['Status em tempo real', 'OK', 'NM'], ['Defeito com dono e prazo', '', 'MM'], ['Reuso entre ciclos e fases', '', 'TM']];

function painelCockpit(L, t, t0) {
  let c = vidro(0, 0, PW, PH, { r: 24, fill: 'rgba(14,34,74,.72)', borda: 'rgba(108,196,255,.35)', brilho: 0.25 });
  c += `<rect x="0" y="0" width="${PW}" height="76" rx="24" fill="rgba(255,255,255,.05)"/><rect x="0" y="52" width="${PW}" height="24" fill="rgba(255,255,255,.05)"/>`;
  c += g('translate(44 38)', `<rect x="-14" y="-11" width="28" height="20" rx="3" stroke="${COR.azulClaro}" stroke-width="2.5" fill="none"/><path d="M-8 3 l5 -6 l5 4 l6 -8" stroke="${COR.azulClaro}" stroke-width="2.5" fill="none"/>`) + T('COCKPIT EXECUTIVO', 76, 48, 28, { w: 800, fill: '#fff', anchor: 'start' });
  const tabs = [['Portfólio', 1], ['Status', 0], ['Riscos', 0]]; let tx = 660;
  tabs.forEach(([n, on]) => { c += T(n, tx, 46, 22, { ...OS, fill: on ? '#fff' : COR.mudo, anchor: 'start' }); if (on) c += `<rect x="${tx}" y="60" width="${F(larg(n, 22, 600, 'os'))}" height="3" fill="${COR.azulClaro}"/>`; tx += larg(n, 22, 600, 'os') + 44; });
  // KPIs
  const kp = [['6', 'projetos', 6], ['20', 'pessoas', 20], ['12', 'meses médios', 12]]; let kx = 30;
  kp.forEach(([n, l, val], i) => { const w = 60 + larg(l, 20, 400, 'os') + 60; const q = ease.out(inv(t0 + 0.3 + i * 0.15, t0 + 0.8 + i * 0.15, t)); const cnt = Math.round(val * ease.out(inv(t0 + 0.4 + i * 0.15, t0 + 1.3 + i * 0.15, t))); c += op(q, g(tr(0, 8 * (1 - q)), `<rect x="${kx}" y="100" width="${F(w)}" height="60" rx="10" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.14)"/>` + T(String(cnt), kx + 18, 142, 34, { w: 800, fill: '#fff', anchor: 'start' }) + T(l, kx + 18 + larg(String(val), 34, 800) + 10, 140, 20, { ...OS, w: 400, fill: COR.claro, anchor: 'start' }))); kx += w + 16; });
  const gq = ease.out(inv(t0 + 0.6, t0 + 1.8, t));
  c += `<circle cx="1110" cy="132" r="34" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="8"/><circle cx="1110" cy="132" r="34" fill="none" stroke="${COR.azulClaro}" stroke-width="8" stroke-dasharray="${F(TAU * 34 * 0.78 * gq)} 999" transform="rotate(-90 1110 132)" stroke-linecap="round"/><circle cx="1110" cy="98" r="5" fill="${COR.ciano}"/>`;
  c += T('PORTFÓLIO A&M + TOTVS', 30, 206, 17, { w: 800, fill: COR.mudo, anchor: 'start', ls: 3 });
  PORT.forEach(([lg, nome, sub, pr, st, cor], i) => {
    const y = 236 + i * 52, q = ease.out(inv(t0 + 0.9 + i * 0.14, t0 + 1.3 + i * 0.14, t));
    if (q <= 0) return;
    let r = logoPilula('logo-' + lg, 86, y + 14, 112, 36) + T(nome, 160, y + 20, 21, { ...OS, w: 700, fill: '#fff', anchor: 'start' }) + T(sub, 160 + larg(nome, 21, 700, 'os') + 10, y + 20, 19, { ...OS, w: 400, fill: COR.mudo, anchor: 'start' });
    const bw = 540, pb = ease.out(inv(t0 + 1.1 + i * 0.14, t0 + 1.9 + i * 0.14, t));
    r += `<rect x="160" y="${y + 32}" width="${bw}" height="5" rx="2.5" fill="rgba(255,255,255,.1)"/><rect x="160" y="${y + 32}" width="${F(bw * pr * pb)}" height="5" rx="2.5" fill="${pr >= 1 ? COR.verde2 : COR.azulClaro}"/>`;
    if (st) { const w = chipW(st, 17); const kq = ease.back(inv(t0 + 1.6 + i * 0.14, t0 + 2.0 + i * 0.14, t)); if (kq > 0) r += g(`translate(${F(PW - 40 - w / 2)} ${y + 14}) scale(${F(kq)})`, chip(st, 0, 0, { size: 17, cor, fill: 'rgba(255,255,255,.06)' })); }
    c += op(q, g(tr(-10 * (1 - q), 0), r));
  });
  c += `<rect x="30" y="${PH - 10}" width="${F(lerp(60, 200, gq))}" height="3" rx="1.5" fill="${COR.azulClaro}"/>`;
  return c;
}
function painelXray(L, t, t0) {
  let c = vidro(0, 0, PW, PH, { r: 24, fill: 'rgba(14,34,74,.72)', borda: 'rgba(108,196,255,.35)', brilho: 0.25 });
  c += `<rect x="0" y="0" width="${PW}" height="76" rx="24" fill="rgba(255,255,255,.05)"/><rect x="0" y="52" width="${PW}" height="24" fill="rgba(255,255,255,.05)"/>`;
  c += g('translate(44 38)', `<path d="M-5 -14 h10 M-3 -14 v9 l-9 15 a3 3 0 0 0 3 4 h18 a3 3 0 0 0 3 -4 l-9 -15 v-9" stroke="${COR.verde}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>`) + T('TESTES INTEGRADOS', 76, 48, 28, { w: 800, fill: '#fff', anchor: 'start' }) + T('· XRAY', 76 + larg('TESTES INTEGRADOS', 28, 800) + 14, 48, 26, { w: 700, fill: COR.ciano, anchor: 'start' });
  const cols = [[40, 'Roteiro', 'start'], [700, 'Evidência', 'middle'], [860, 'Status', 'middle'], [1010, 'Dono', 'middle'], [1130, 'Prazo', 'middle']];
  cols.forEach(([x, n, a]) => { c += T(n, x, 126, 22, { ...OS, w: 700, fill: COR.mudo, anchor: a }); });
  c += `<rect x="30" y="140" width="${PW - 60}" height="1" fill="rgba(255,255,255,.14)"/>`;
  XRAY.forEach(([rot, st, dono], i) => {
    const y = 186 + i * 60, q = ease.out(inv(t0 + 0.5 + i * 0.15, t0 + 0.9 + i * 0.15, t));
    if (q <= 0) return;
    let r = T(rot, 40, y + 8, 21, { ...OS, w: 400, fill: '#fff', anchor: 'start' });
    r += g(`translate(700 ${y})`, `<path d="M-7 -11 h9 l5 5 v17 h-14 Z M2 -11 v5 h5 M-3 1 h7 M-3 6 h7" stroke="${COR.azulClaro}" stroke-width="2" fill="none" stroke-linejoin="round"/>`);
    const kq = ease.back(inv(t0 + 0.9 + i * 0.15, t0 + 1.3 + i * 0.15, t));
    if (st) r += g(`translate(860 ${y}) scale(${F(kq)})`, `<rect x="-42" y="-16" width="84" height="32" rx="16" fill="rgba(60,207,110,.18)" stroke="${COR.verde2}" stroke-width="1.5"/>` + `<path d="M-24 0 l5 5 l10 -11" stroke="${COR.verde2}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + T('OK', 4, 7, 18, { ...OS, w: 700, fill: '#fff' }));
    else r += g(`translate(860 ${y}) scale(${F(kq)})`, `<rect x="-42" y="-16" width="84" height="32" rx="16" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>` + [-10, 0, 10].map((dx, k) => `<circle cx="${dx}" cy="0" r="2.5" fill="rgba(255,255,255,.6)" opacity="${F(0.4 + 0.6 * (0.5 + 0.5 * Math.sin(L * 5 - k)))}"/>`).join(''));
    r += g(`translate(1010 ${y})`, `<circle r="20" fill="#2f5fcf"/>` + T(dono, 0, 7, 17, { w: 800, fill: '#fff' }));
    r += T('FY26', 1130, y + 7, 20, { ...OS, w: 600, fill: '#fff' });
    r += `<rect x="30" y="${y + 30}" width="${PW - 60}" height="1" fill="rgba(255,255,255,.07)"/>`;
    c += op(q, g(tr(-10 * (1 - q), 0), r));
  });
  c += `<rect x="30" y="${PH - 10}" width="${F(lerp(60, 200, ease.out(inv(t0 + 0.6, t0 + 2.4, t))))}" height="3" rx="1.5" fill="${COR.verde}"/>`;
  return c;
}
function painelIA(L, t, t0) {
  let c = vidro(0, 0, PW, PH, { r: 24, fill: 'rgba(14,34,74,.72)', borda: 'rgba(108,196,255,.35)', brilho: 0.25 });
  c += `<rect x="0" y="0" width="${PW}" height="76" rx="24" fill="rgba(255,255,255,.05)"/><rect x="0" y="52" width="${PW}" height="24" fill="rgba(255,255,255,.05)"/>`;
  const sparkle = (x, y, r, cor) => `<path d="M${x} ${y - r} l${r * 0.3} ${r * 0.7} l${r * 0.7} ${r * 0.3} l${-r * 0.7} ${r * 0.3} l${-r * 0.3} ${r * 0.7} l${-r * 0.3} ${-r * 0.7} l${-r * 0.7} ${-r * 0.3} l${r * 0.7} ${-r * 0.3} Z" fill="${cor}"/>`;
  c += sparkle(44, 38, 14, COR.ouro) + sparkle(60, 26, 7, COR.ouro) + T('IA · MÉTODOS / SKILLS / QA', 86, 48, 28, { w: 800, fill: '#fff', anchor: 'start' });
  // prompt digitado
  const prompt = 'Gerar roteiro de testes para integração fiscal…';
  const n = Math.round(prompt.length * clamp(inv(t0 + 0.5, t0 + 2.2, t)));
  c += `<rect x="30" y="104" width="${PW - 60}" height="64" rx="14" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.2)"/>` + sparkle(62, 136, 10, COR.ouro) + T(prompt.slice(0, n) + (n < prompt.length && Math.floor(L * 3) % 2 ? '|' : ''), 86, 145, 22, { ...OS, w: 400, fill: '#fff', anchor: 'start' }) + `<path d="M${PW - 70} 136 h26 m-8 -8 l8 8 l-8 8" stroke="${COR.claro}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const kr = ease.out(inv(t0 + 2.2, t0 + 2.7, t));
  if (kr > 0) {
    let r = `<rect x="30" y="192" width="${PW - 60}" height="330" rx="14" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.14)"/><rect x="30" y="192" width="5" height="330" rx="2" fill="${COR.ouro}"/>`;
    r += sparkle(70, 232, 14, COR.ouro);
    const chips = [['Métodos', COR.azulClaro, 'rgba(59,130,246,.25)'], ['Skills', COR.ouro, 'rgba(230,183,94,.25)'], ['QA das MITs', COR.verde, 'rgba(67,209,169,.25)']]; let cx = 100;
    const tChip = [palavra('l26', 5), palavra('l26', 8), palavra('l26', 8) + 0.35];   // métodos · skills · QA das MITs
    chips.forEach(([tx, cor, fill], i) => { const w = chipW(tx, 20); const q = ease.back(inv(tChip[i] - 0.05, tChip[i] + 0.35, t)); if (q > 0) r += g(`translate(${F(cx + w / 2)} 232) scale(${F(q)})`, chip(tx, 0, 0, { size: 20, cor, fill })); cx += w + 14; });
    ['Governança', 'Automação', 'Escala'].forEach((tx, i) => { const q = ease.back(inv(t0 + 2.9 + i * 0.35, t0 + 3.3 + i * 0.35, t)); if (q > 0) r += g(`translate(76 ${300 + i * 68}) scale(${F(q)})`, `<circle r="16" fill="rgba(60,207,110,.18)" stroke="${COR.verde2}" stroke-width="2"/><path d="M-7 0 l5 5 l10 -11" stroke="${COR.verde2}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) + op(clamp(q * 1.5), T(tx, 110, 308 + i * 68, 24, { ...OS, w: 600, fill: '#fff', anchor: 'start' })); });
    c += op(kr, g(tr(0, 10 * (1 - kr)), r));
  }
  c += `<rect x="30" y="${PH - 10}" width="${F(lerp(60, 200, ease.out(inv(t0 + 0.6, t0 + 3.6, t))))}" height="3" rx="1.5" fill="${COR.ouro}"/>`;
  return c;
}

export function cockpit(L, t, dur) {
  let s = fundo(t);
  const tCk = palavra('l25', 2), tGov = palavra('l25', 6), tIA = palavra('l26', 0), tTec = palavra('l27', 0), tQual = palavra('l27', -1);
  const tP = [tCk - 0.3, tGov - 0.1, tIA - 0.1];   // início de cada painel
  // câmera: centro em cada painel; no fim, abre para os três
  const cxP = PX.map(x => x + PW / 2);
  let camx = cxP[0], esc = 1;
  for (let i = 1; i < 3; i++) { const u = ease.inOut(inv(tP[i] - 0.4, tP[i] + 0.4, t)); camx = lerp(camx, cxP[i], u); }
  const abre = ease.inOut(inv(tTec - 0.3, tTec + 0.8, t));
  camx = lerp(camx, cxP[1], abre); esc = lerp(1, 0.38, abre);
  let v = '';
  // conectores entre painéis
  for (let i = 0; i < 2; i++) { const q = ease.out(inv(tP[i + 1] - 0.3, tP[i + 1] + 0.2, t)); v += `<line x1="${PX[i] + PW}" y1="${PY + PH / 2}" x2="${F(lerp(PX[i] + PW, PX[i + 1], q))}" y2="${PY + PH / 2}" stroke="rgba(108,196,255,.6)" stroke-width="2" stroke-dasharray="3 8"/>` + brilhoPonto(PX[i] + PW, PY + PH / 2, 5, COR.ciano, q) + (q >= 1 ? brilhoPonto(PX[i + 1], PY + PH / 2, 5, COR.ciano, 1) : ''); }
  const pains = [painelCockpit, painelXray, painelIA];
  pains.forEach((fn, i) => {
    const q = ease.out(inv(tP[i], tP[i] + 0.6, t)); if (q <= 0) return;
    // painel fora do foco da câmera esmaece (não fica aparecendo atrás do personagem); todos voltam na visão geral
    const longe = Math.min(1, Math.abs(camx - cxP[i]) / (PW * 0.8)), vis = lerp(1 - longe, 1, abre);
    v += op(q * vis, g(`translate(${PX[i]} ${F(PY + 30 * (1 - q))})`, fn(L, t, tP[i])));
  });
  // brilho final em "Tecnologia a serviço da qualidade"
  const fin = Math.sin(clamp(inv(tQual - 0.6, tQual + 1.0, t)) * Math.PI);
  if (fin > 0) v += `<rect x="${PX[0] - 40}" y="${PY - 40}" width="${F(PX[2] + PW - PX[0] + 80)}" height="${PH + 80}" rx="40" fill="none" stroke="${COR.ouro}" stroke-width="4" opacity="${F(0.6 * fin)}"/>`;
  s += g(`translate(${F(lerp(1060, 1160, abre))} ${F(lerp(470, 520, abre))}) scale(${F(esc)}) translate(${F(-camx)} ${F(-(PY + PH / 2))})`, v);
  // Vinicius à esquerda, no padrão 3D, apresentando
  const hv = 560, ev = sobe(L, 0.03, 0.9), cxV = 20 + largPessoa('vinicius', hv) / 2;
  s += g(tr(-foraEsq('vinicius', cxV, hv) * (1 - ev), 0), pessoa('vinicius', cxV, 1110, hv, L, { halo: COR.azul, haloA: 0.12 }));
  const kn = sobe(L, 0.8, 0.5);
  s += op(kn, g(`translate(${F(20 + largPessoa('vinicius', hv) + 40)} 780)`, pilula('Vinicius de Sousa', 0, 0, { fill: 'rgba(7,17,42,.8)', stroke: 'rgba(255,255,255,.25)', size: 17, fam: 'Open Sans', w: 700, icone: `<circle r="4" fill="${COR.ciano}"/>` })));
  return s + vinheta(0.6);
}

// ------------------------------------------------------------------ CENA 13 · RUMO A 2027
function serie(x0, y0, x1, y1, seed, n = 48) {
  const r = rng(seed), pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; const y = lerp(y0, y1, Math.pow(u, 1.2)) + (Math.sin(u * 14 + seed) * 9 + (r() - 0.5) * 10) * Math.sin(u * Math.PI) * 1.2; pts.push([lerp(x0, x1, u), y]); }
  return curva(pts, 300);
}
const GX0 = 950, GX1 = 1690, GY = { ouroA: 650, ouroB: 300, azulA: 745, azulB: 445, verdeA: 805, verdeB: 545 };
const S_OURO = serie(GX0, GY.ouroA, GX1, GY.ouroB, 3), S_AZUL = serie(GX0, GY.azulA, GX1, GY.azulB, 5), S_VERDE = serie(GX0, GY.verdeA, GX1, GY.verdeB, 7);
const MARCOS = [['unimed', 0.03], ['funed', 0.16], ['caoa', 0.30], ['john-deere', 0.44], ['hughes', 0.58], ['libercon', 0.73]];

export function rumo(L, t, dur) {
  let s = fundo(t, { bokeh: 1.1 });
  const tRumo = palavra('l28', 0), t27 = palavra('l28', 1), tMaisP = palavra('l28', 4), tOp = palavra('l28', 6), tVal = palavra('l28', -1), tEm = palavra('l29', 0), tForte = palavra('l29', -1);
  // painel do gráfico
  const kp = ease.out(inv(0.1, 0.8, L));
  let gpanel = vidro(880, 120, 980, 820, { r: 26, fill: 'rgba(14,34,74,.5)' });
  gpanel += T('E NÃO PARA POR AÍ  ·  PARCERIA A&M + TOTVS EM ALTA', 920, 168, 14, { w: 800, fill: COR.mudo, anchor: 'start', ls: 3.5 });
  gpanel += `<circle cx="1612" cy="162" r="5" fill="${COR.verde2}" opacity="${F(0.5 + 0.5 * Math.sin(L * 4))}"/>` + T('LIVE', 1624, 168, 14, { w: 800, fill: COR.verde2, anchor: 'start', ls: 3 });
  for (let i = 0; i < 6; i++) { const y = 260 + i * 110; gpanel += `<line x1="920" y1="${y}" x2="1820" y2="${y}" stroke="rgba(255,255,255,.06)"/>`; }
  gpanel += T('FY26', 950, 912, 16, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 2 }) + T('FY27', 1760, 912, 16, { w: 800, fill: COR.ouro2, anchor: 'end', ls: 2 });
  // barras miúdas
  const r = rng(9);
  for (let i = 0; i < 44; i++) { const h = 8 + r() * 30, c = ['#3d5a86', COR.verde, COR.vermelho, COR.ouro][i % 4]; gpanel += `<rect x="${F(950 + i * 18.5)}" y="${F(884 - h)}" width="10" height="${F(h)}" rx="2" fill="${c}" opacity="${F(0.55 * ease.out(inv(0.6 + i * 0.03, 1.0 + i * 0.03, L)))}"/>`; }
  // séries
  const uO = ease.out(inv(tRumo - 0.5, tRumo + 3.6, t)), uA = ease.out(inv(tRumo - 0.1, tRumo + 4.0, t)), uV = ease.out(inv(tRumo + 0.3, tRumo + 4.4, t));
  const linhaS = (S, u, cor, w) => `<path d="${S.d}" stroke="${cor}" stroke-width="${w * 3}" fill="none" opacity=".16" filter="url(#azBrilhoP)" stroke-dasharray="${F(u * S.comp)} 9999"/><path d="${S.d}" stroke="${cor}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-dasharray="${F(u * S.comp)} 9999"/>`;
  // área sob a linha de ouro
  if (uO > 0) { const p = S_OURO.ponto(uO); gpanel += `<clipPath id="azClipO"><rect x="${GX0}" y="0" width="${F(p[0] - GX0)}" height="1080"/></clipPath><path d="${S_OURO.d} L${GX1} 890 L${GX0} 890 Z" fill="${COR.ouro}" opacity=".08" clip-path="url(#azClipO)"/>`; }
  gpanel += linhaS(S_VERDE, uV, COR.verde, 4) + linhaS(S_AZUL, uA, COR.azulClaro, 4) + linhaS(S_OURO, uO, COR.ouro2, 5);
  for (const [S, u, cor] of [[S_VERDE, uV, COR.verde], [S_AZUL, uA, COR.azulClaro], [S_OURO, uO, COR.ouro2]]) { const p = S.ponto(u); if (u > 0) gpanel += brilhoPonto(p[0], p[1], u < 1 ? 6 : 8, u < 1 ? '#fff' : cor, 1); }
  // marcos com logos na linha de ouro
  MARCOS.forEach(([lg, um], i) => {
    if (uO < um) return;
    const p = S_OURO.ponto(um), k = ease.back(inv(0, 0.4, (uO - um) * 4.2 + 0.0001));
    const alto = [-70, -165, -70, -175, -70, -168][i];   // alternado e compensando a subida da curva: cartões vizinhos nunca se tocam
    gpanel += `<line x1="${F(p[0])}" y1="${F(p[1])}" x2="${F(p[0])}" y2="${F(p[1] + alto + 22)}" stroke="rgba(230,183,94,.5)" stroke-width="1.5"/><circle cx="${F(p[0])}" cy="${F(p[1])}" r="5" fill="${COR.ouro2}" stroke="#fff" stroke-width="1.5"/>`;
    gpanel += logoPilula('logo-' + lg, p[0], p[1] + alto, 136, 42, k);
  });
  gpanel += op(ease.out(inv(tRumo - 0.2, tRumo + 0.4, t)), T('R$ 7 MM · FY26', GX0, GY.ouroA + 40, 15, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 1.5 }) + T('6 PROJETOS', GX0, GY.azulA + 36, 14, { w: 800, fill: COR.claro, anchor: 'start', ls: 1.5 }) + T('20 PESSOAS', GX0, GY.verdeA + 36, 14, { w: 800, fill: COR.claro, anchor: 'start', ls: 1.5 }));
  const kf = ease.out(inv(tRumo + 3.3, tRumo + 3.9, t));
  gpanel += op(kf, T('COLLECTIONS FY27', GX1 + 22, GY.ouroB - 10, 12, { w: 800, fill: COR.mudo, anchor: 'start', ls: 1.4 }) + T('R$ 9 MM', GX1 + 22, GY.ouroB + 20, 26, { w: 900, fill: COR.ouro2, anchor: 'start' }));
  gpanel += op(ease.out(inv(tRumo + 3.7, tRumo + 4.3, t)), T('MAIS', GX1 + 26, GY.azulB - 2, 13, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 2 }) + T('PROJETOS', GX1 + 26, GY.azulB + 16, 13, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 2 }));
  gpanel += op(ease.out(inv(tRumo + 4.1, tRumo + 4.7, t)), T('PARCERIA', GX1 + 26, GY.verdeB - 2, 13, { w: 800, fill: COR.verde, anchor: 'start', ls: 2 }) + T('EM EXPANSÃO', GX1 + 26, GY.verdeB + 16, 13, { w: 800, fill: COR.verde, anchor: 'start', ls: 2 }));
  const k27 = ease.back(inv(tEm - 0.1, tEm + 0.5, t));
  if (k27 > 0) gpanel += g(`translate(1770 200) scale(${F(k27)})`, `<rect x="-70" y="-30" width="140" height="56" rx="12" fill="${COR.ouro}" opacity=".18"/>` + T('2027', 0, 14, 44, { w: 900, fill: COR.ouro2 }));
  s += op(kp, g(tr(0, 20 * (1 - kp)), gpanel));
  // bloco da esquerda: RUMO A 2027 + chips; depois o lockup "JUNTOS, CONSTRUINDO O PRÓXIMO CAPÍTULO"
  const troca = ease.inOut(inv(tEm - 0.5, tEm + 0.2, t)), sai = ease.in(inv(tEm - 0.55, tEm - 0.2, t)), vem = ease.out(inv(tEm - 0.15, tEm + 0.25, t));
  const kr = ease.out(inv(0.2, 0.9, L));
  let esq = '';
  esq += T('RUMO A', 100, 300, 104, { w: 900, fill: '#fff', anchor: 'start', ls: -2 }) + T('2027', 100 + larg('RUMO A ', 104, 900), 300, 104, { w: 900, fill: COR.ouro2, anchor: 'start', ls: -2 });
  const chips = [['MAIS PROJETOS', tMaisP, `<path d="M-9 -3 l9 -5 l9 5 l-9 5 Z M-9 2 l9 5 l9 -5" stroke="${COR.ouro2}" stroke-width="2" fill="none" stroke-linejoin="round"/>`], ['MAIS OPORTUNIDADES', tOp, `<path d="M0 -10 l2.5 7 l7 2.5 l-7 2.5 l-2.5 7 l-2.5 -7 l-7 -2.5 l7 -2.5 Z" fill="${COR.ouro2}"/>`], ['MAIS VALOR', tVal, `<path d="M-9 6 l6 -7 l5 4 l7 -9 M4 -6 h5 v5" stroke="${COR.ouro2}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`]];
  chips.forEach(([tx, t0, ico], i) => { const q = ease.back(inv(t0 - 0.15, t0 + 0.35, t)); if (q <= 0) return; const w = larg(tx, 18, 800) + 86 + tx.length * 3; esq += g(`translate(${F(100 + w / 2)} ${F(380 + i * 72)}) scale(${F(q)})`, pilula(tx, 0, 0, { fill: 'rgba(7,17,42,.75)', stroke: COR.ouro, size: 18, ls: 3, icone: ico, cor: '#fff' })); });
  if (sai < 1) s += op(kr * (1 - sai), g(tr(-40 * sai, 0), esq));
  if (vem > 0) {
    let j = '';
    const cartao = (id, cx, h) => `<rect x="${F(cx - 110)}" y="-50" width="220" height="100" rx="20" fill="#fff"/>` + logoImg(id, cx, 0, h, 180);
    j += g('translate(0 190)', cartao('logo-alvarez-marsal', 210, 64) + T('+', 340, 12, 30, { w: 800, fill: COR.ouro }) + cartao('logo-totvs', 470, 46));
    j += T('JUNTOS, CONSTRUINDO', 100, 326, 36, { w: 800, fill: '#fff', anchor: 'start', ls: 3 }) + T('O PRÓXIMO CAPÍTULO', 100, 372, 36, { w: 800, fill: '#fff', anchor: 'start', ls: 3 });
    j += T('A&M + TOTVS  ·  PROJETO DO ANO FY26', 100, 420, 15, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 4 });
    const forte = Math.sin(clamp(inv(tForte - 0.3, tForte + 1.0, t)) * Math.PI);
    if (forte > 0) j += `<rect x="86" y="130" width="${F(690)}" height="320" rx="24" fill="${COR.ouro}" opacity="${F(0.08 * forte)}"/>`;
    s += op(vem, g(tr(30 * (1 - vem), 0), j));
  }
  return s + vinheta(0.6);
}
