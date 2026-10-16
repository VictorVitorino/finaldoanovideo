// v19 · cenas 1 a 5: capa, dashboard de resultados, desafio do ERP, farol A&M e união TOTVS + A&M.
// Cada cena recebe (L = tempo dentro da cena, t = tempo absoluto, dur) e devolve SVG sem chrome/legenda.
import { clamp, lerp, inv, ease, kf, rng, tr, g, op, TAU } from '../core.js';
import { F, W, H, COR, T, OS, larg, imagem, logoImg, logoPilula, entra, sobe, fundo, vinheta, cidade, vidro, pilula, chip, chipW, secao, brilhoPonto, checkIco, pessoa, largPessoa, foraEsq, foraDir, avatar, palavra } from './base.js';

// ------------------------------------------------------------------ CENA 1 · CAPA
export function capa(L, t, dur) {
  const push = 1 + 0.035 * ease.inOut(inv(0, dur, L));
  let s = fundo(t);
  s += `<circle cx="1640" cy="470" r="230" fill="url(#azLua)"/>`;
  s += g(tr(0, 24 * (1 - ease.out(inv(0, 1.2, L)))), cidade(t, 1000));
  s += vinheta(0.8);
  const em = sobe(L, 0.2, 0.9), ea = sobe(L, 0.4, 0.9);
  const hb = 720, ha = 700, cxB = 40 + largPessoa('totvs_boy', hb) / 2, cxA = 1880 - largPessoa('am_boy', ha) / 2;
  s += g(tr(-foraEsq('totvs_boy', cxB, hb) * (1 - em), 0), pessoa('totvs_boy', cxB, 1130, hb, L, { halo: '#3b82f6' }));
  s += g(tr(foraDir('am_boy', cxA, ha) * (1 - ea), 0), pessoa('am_boy', cxA, 1125, ha, L, { halo: '#f08a2c', fase: 1.4 }));
  // bloco do título
  const k1 = sobe(L, 0.1, 0.5), k2 = sobe(L, 0.25, 0.5);
  let bloco = '';
  bloco += op(k1, T('PROJETO DO ANO · 2026', 960, 212 - 10 * (1 - k1), 26, { w: 800, fill: COR.ouro2, ls: 7 }));
  bloco += op(k2, T('PARCERIA', 960, 262, 16, { w: 700, fill: COR.mudo, ls: 6 }));
  const c1 = entra(L, 0.45, 0.55), c2 = entra(L, 0.65, 0.55), cp = entra(L, 0.8, 0.4);
  const cartao = (id, cx, k) => g(`translate(${F(cx)} 450) scale(${F(k)})`, `<rect x="-150" y="-70" width="300" height="140" rx="22" fill="#fff"/><rect x="-150" y="-70" width="300" height="140" rx="22" fill="none" stroke="rgba(120,170,255,.45)" stroke-width="2"/>` + logoImg(id, 0, 0, id === 'logo-totvs' ? 62 : 92, 240));
  bloco += op(clamp(c1 * 2), cartao('logo-alvarez-marsal', 740, c1)) + op(clamp(c2 * 2), cartao('logo-totvs', 1180, c2));
  bloco += op(clamp(cp * 2), g(`translate(960 450) scale(${F(cp)})`, `<circle r="26" fill="rgba(7,17,42,.8)" stroke="${COR.ouro}" stroke-width="2"/>` + T('+', 0, 11, 32, { w: 800, fill: COR.ouro })));
  // reflexo que varre os cartões em "se transformam"
  const v = inv(palavra('l01', 1) - 0.1, palavra('l01', 1) + 0.9, t);
  if (v > 0 && v < 1) bloco += `<rect x="${F(560 + v * 820)}" y="370" width="50" height="160" fill="#fff" transform="skewX(-22)" filter="url(#azBrilhoP)" opacity=".35"/>`;
  // rótulos dos personagens + fio dourado em "algo muito maior"
  const tr1 = palavra('l01', 3), tr2 = palavra('l01', 5);
  const p1 = entra(L, tr1 - 0.2, 0.5), p2 = entra(L, tr1 + 0.2, 0.5);
  const fio = ease.inOut(inv(tr1 - 0.1, tr2 + 0.4, t));
  if (fio > 0) {
    // fio e rótulos ficam no vão entre os personagens (x 585–1355), sem passar por cima deles
    const d = `M700 735 C860 690 1060 690 1220 735`;
    bloco += `<path d="${d}" stroke="${COR.ouro}" stroke-width="2.5" fill="none" opacity=".85" stroke-dasharray="${F(fio * 560)} 2000"/>`;
    const px = lerp(700, 1220, fio), py = 735 - 34 * Math.sin(fio * Math.PI);
    if (fio < 1) bloco += brilhoPonto(px, py, 5, '#fff', 1);
  }
  bloco += op(clamp(p1 * 2), g(`translate(700 735) scale(${F(p1)})`, pilula('TOTVS · SOLUÇÃO', 0, 0, { fill: 'rgba(7,17,42,.78)', stroke: COR.azul, size: 19, ls: 2.5 })));
  bloco += op(clamp(p2 * 2), g(`translate(1220 735) scale(${F(p2)})`, pilula('A&M · TRANSFORMAÇÃO', 0, 0, { fill: 'rgba(7,17,42,.78)', stroke: COR.laranja, size: 19, ls: 2.5 })));
  s += g(`translate(960 540) scale(${F(push)}) translate(-960 -540)`, bloco);
  return s;
}

// ------------------------------------------------------------------ CENA 2 · DASHBOARD
const GR = { x0: 300, y0: 100, cw: 420, ch: 250, gx: 30, gy: 30 };
const cel = i => ({ x: GR.x0 + (i % 3) * (GR.cw + GR.gx), y: GR.y0 + Math.floor(i / 3) * (GR.ch + GR.gy) });
const LOGOS6 = ['unimed', 'caoa', 'hughes', 'funed', 'john-deere', 'libercon'];
const AV = ['bruno', 'giovanna', 'antonialli', 'jaqueline', 'jose', 'joao', 'massao', 'mancini', 'monica', 'nara', 'pedro', 'thauany', 'vinicius'];

// ícones dos cartões 5–9
function icoCross(cx, cy, s, u) {
  const n = [[-0.55, 0], [0.45, -0.55], [0.5, 0.05], [0.4, 0.6]];
  let r = `<circle cx="${F(cx + n[0][0] * s)}" cy="${F(cy)}" r="${F(s * 0.2)}" fill="${COR.verde}"/>`;
  for (let i = 1; i < 4; i++) { const k = clamp(u * 3 - (i - 1)); const [a, b] = [n[0], n[i]]; r += `<line x1="${F(cx + a[0] * s)}" y1="${F(cy + a[1] * s)}" x2="${F(cx + lerp(a[0], b[0], k) * s)}" y2="${F(cy + lerp(a[1], b[1], k) * s)}" stroke="${COR.verde}" stroke-width="${F(s * 0.09)}" stroke-linecap="round"/>` + (k > 0.9 ? `<circle cx="${F(cx + b[0] * s)}" cy="${F(cy + b[1] * s)}" r="${F(s * 0.16)}" fill="${i === 2 ? COR.ouro : COR.verde}"/>` : ''); }
  return r;
}
function icoDoc(cx, cy, s, u) {
  const st = `stroke="${COR.azulClaro}" stroke-width="${F(s * 0.09)}" fill="rgba(108,196,255,.12)" stroke-linejoin="round"`;
  let r = `<rect x="${F(cx - s * 0.42)}" y="${F(cy - s * 0.55)}" width="${F(s * 0.84)}" height="${F(s * 1.05)}" rx="${F(s * 0.12)}" ${st}/>`;
  for (let i = 0; i < 3; i++) r += `<line x1="${F(cx - s * 0.22)}" y1="${F(cy - s * 0.25 + i * s * 0.25)}" x2="${F(cx - s * 0.22 + s * (0.44 - i * 0.1) * clamp(u * 3 - i))}" y2="${F(cy - s * 0.25 + i * s * 0.25)}" stroke="${COR.azulClaro}" stroke-width="${F(s * 0.08)}" stroke-linecap="round"/>`;
  return r;
}
const icoRaio = (cx, cy, s) => `<rect x="${F(cx - s * 0.55)}" y="${F(cy - s * 0.55)}" width="${F(s * 1.1)}" height="${F(s * 1.1)}" rx="${F(s * 0.25)}" fill="rgba(67,209,169,.18)" stroke="${COR.verde}" stroke-width="${F(s * 0.08)}"/><path d="M${F(cx + s * 0.08)} ${F(cy - s * 0.38)} L${F(cx - s * 0.22)} ${F(cy + s * 0.05)} H${F(cx)} L${F(cx - s * 0.08)} ${F(cy + s * 0.38)} L${F(cx + s * 0.22)} ${F(cy - s * 0.05)} H${F(cx)} Z" fill="#fff"/>`;
function relogio(cx, cy, r, u, L) {
  const a = -Math.PI / 2 + u * TAU * 1.0 + (u >= 1 ? (L % 60) * 0.1 : 0);
  return `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(r)}" fill="rgba(230,183,94,.08)" stroke="${COR.ouro}" stroke-width="2.5"/>`
    + Array.from({ length: 12 }, (_, i) => { const b = i * TAU / 12; return `<circle cx="${F(cx + Math.cos(b) * r * 0.82)}" cy="${F(cy + Math.sin(b) * r * 0.82)}" r="${i % 3 ? 1.5 : 2.5}" fill="${COR.ouro}"/>`; }).join('')
    + `<line x1="${F(cx)}" y1="${F(cy)}" x2="${F(cx + Math.cos(a) * r * 0.62)}" y2="${F(cy + Math.sin(a) * r * 0.62)}" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="${F(cx)}" cy="${F(cy)}" r="3.5" fill="#fff"/>`;
}
function miniDash(x, y, w, h, u1, u2, u3, L) {   // painel do cockpit: barras, linha e medidor
  let r = `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" rx="10" fill="rgba(7,16,38,.55)" stroke="rgba(255,255,255,.12)"/>`;
  r += [COR.vermelho, COR.ouro, COR.verde2].map((c, i) => `<circle cx="${F(x + w - 16 - i * 12)}" cy="${F(y + 12)}" r="3" fill="${c}"/>`).join('');
  const bh = [0.45, 0.65, 0.5, 0.85, 0.7];
  bh.forEach((b, i) => { const k = clamp(u1 * 5 - i); r += `<rect x="${F(x + 14 + i * 16)}" y="${F(y + h - 14 - b * (h - 36) * ease.out(k))}" width="10" height="${F(b * (h - 36) * ease.out(k))}" rx="3" fill="${i % 2 ? COR.ouro : COR.azulClaro}"/>`; });
  const px0 = x + w * 0.42, pw = w * 0.3, pts = [0.7, 0.55, 0.62, 0.4, 0.45, 0.2].map((v, i) => [px0 + i * pw / 5, y + 14 + v * (h - 28)]);
  let d = ''; pts.forEach((p, i) => { d += `${i ? 'L' : 'M'}${F(p[0])} ${F(p[1])} `; });
  r += `<path d="${d}" stroke="${COR.verde}" stroke-width="2.5" fill="none" stroke-dasharray="${F(u2 * 200)} 400" stroke-linecap="round"/>`;
  if (u2 >= 1) r += brilhoPonto(pts[5][0], pts[5][1], 4, COR.ouro);
  const gx = x + w - 32, gy = y + h / 2 + 4, gr = 18;
  r += `<circle cx="${F(gx)}" cy="${F(gy)}" r="${gr}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="6"/><circle cx="${F(gx)}" cy="${F(gy)}" r="${gr}" fill="none" stroke="${COR.azulClaro}" stroke-width="6" stroke-dasharray="${F(TAU * gr * 0.72 * u3)} 999" transform="rotate(-90 ${F(gx)} ${F(gy)})" stroke-linecap="round"/><circle cx="${F(gx)}" cy="${F(gy)}" r="4" fill="#fff"/>`;
  return r;
}

export function dashboard(L, t, dur) {
  let s = fundo(t, { bokeh: 1.1 });
  const P = (id, i) => palavra(id, i);
  // marcas de narração
  const m = {
    c1: P('l02', 0), c1logos: P('l02', 1), c1txt: P('l02', 3),
    c2: P('l03', 0), c2av: P('l03', 1), c2txt: P('l03', 2),
    c3: P('l04', 0), c3txt: P('l04', 2), b26: P('l04', 5), b27: P('l04', 7),
    c4: P('l05', 0), c4m: P('l05', 1), c4rel: P('l05', 3), c4txt: P('l05', 5), c4rec: P('l05', 10),
    c5: P('l06', 0), ch1: P('l06', 4), ch2: P('l06', 7), ch3: P('l06', 10),
    c6: P('l07', 0), c6txt: P('l07', 2), c6eco: P('l07', 7),
    c7: P('l08', 0), c7mit: P('l08', 4), c7txt: P('l08', 5), c7chk: P('l08', 12),
    c8: P('l09', 0), c8x: P('l09', 3), k1: P('l09', 6), k2: P('l09', 7), k3: P('l09', 9), c8txt: P('l09', 11),
    c9: P('l10', 2), c9t: P('l10', 3), c9txt: P('l10', 7), c9dc: P('l10', -2),
    fim: P('l10', -1),
  };
  const ini = [m.c1, m.c2, m.c3, m.c4, m.c5, m.c6, m.c7, m.c8, m.c9];
  // card ativo; câmera: aproxima no card narrado enquanto ele se preenche e volta à visão geral antes do próximo
  let ativo = -1; for (let i = 0; i < 9; i++) if (t >= ini[i] - 0.35) ativo = i;
  const fimZoom = m.fim + 0.5;
  const centroG = [GR.x0 + 1.5 * GR.cw + GR.gx, GR.y0 + 1.5 * GR.ch + GR.gy];
  // zoom máximo e alvo limitados à área segura: o grid inteiro continua entre os personagens (x 235–1665) e entre o título e a legenda (y 90–965)
  const ZOOM = 1.04;
  const hB = 460, hA = 455, cxB = 112, cxA = 1812;
  const livreE = cxB + largPessoa('totvs_boy', hB) / 2 + 10, livreD = cxA - largPessoa('am_boy', hA) / 2 - 10;
  const alvo = i => {
    const c = cel(i), ax = lerp(centroG[0], c.x + GR.cw / 2, 0.6), ay = lerp(centroG[1], c.y + GR.ch / 2, 0.5);
    const xr = GR.x0 + 3 * GR.cw + 2 * GR.gx, yb = GR.y0 + 3 * GR.ch + 2 * GR.gy;
    const lo = xr - (livreD - 960) / ZOOM, hi = GR.x0 + (960 - livreE) / ZOOM;
    return [clamp(ax, Math.min(lo, hi), Math.max(lo, hi)), clamp(ay, yb - 435 / ZOOM, GR.y0 + 440 / ZOOM)];
  };
  let cam = [centroG[0], centroG[1], 1];
  for (let i = 0; i < 9; i++) {
    const zin = ini[i] - 0.35;
    const hout = i < 8 ? Math.min(ini[i + 1] - 1.05, ini[i] + 3.4) : m.fim + 0.25;
    if (t < zin) break;
    const k = ease.inOut(inv(zin, zin + 0.7, t)) * (1 - ease.inOut(inv(hout, hout + 0.75, t)));
    const a = alvo(i);
    cam = [lerp(centroG[0], a[0], k), lerp(centroG[1], a[1], k), lerp(1, ZOOM, k)];
  }
  const ent = ease.out(inv(0.05, 0.7, L));
  let painel = '';
  // holofote suave sobre o card ativo
  if (ativo >= 0 && t < fimZoom + 0.3) { const c = cel(ativo); painel += `<ellipse cx="${F(c.x + GR.cw / 2)}" cy="${F(c.y + GR.ch / 2)}" rx="340" ry="230" fill="url(#azSpot)" opacity="${F(ease.out(inv(ini[ativo] - 0.35, ini[ativo] + 0.3, t)))}"/>`; }
  for (let i = 0; i < 9; i++) {
    const { x, y } = cel(i);
    const e = ease.out(inv(0.1 + i * 0.05, 0.6 + i * 0.05, L));
    const on = t >= ini[i], ac = clamp(inv(ini[i], ini[i] + 0.45, t));
    const isAtivo = ativo === i && t < fimZoom;
    const lift = isAtivo ? ease.out(inv(ini[i] - 0.35, ini[i] + 0.1, t)) : 0;
    // onda final: depois do último card, um brilho percorre os nove (revelação do dashboard completo)
    const onda = Math.sin(clamp(inv(m.fim + 0.3 + i * 0.1, m.fim + 0.9 + i * 0.1, t)) * Math.PI);
    const k = 1 + 0.045 * lift + 0.015 * onda;
    let c = vidro(0, 0, GR.cw, GR.ch, { brilho: isAtivo ? 0.9 : (on ? 0.25 + 0.6 * onda : 0), borda: on ? `rgba(108,196,255,${F(0.25 + 0.5 * (isAtivo ? 1 : 0.4) + 0.3 * onda)})` : COR.borda, bw: isAtivo || onda > 0.5 ? 2.2 : 1.5, fill: on ? 'rgba(18,42,88,.6)' : 'rgba(16,38,80,.35)' });
    const txt = (lines, x0, y0, size = 20, fill = COR.claro, w = 600) => lines.map((l, j) => T(l, x0, y0 + j * (size + 6), size, { ...OS, w, fill, anchor: 'start' })).join('');
    const num = (str, x0, y0, size, fill = COR.ouro) => T(str, x0, y0, size, { w: 800, fill, anchor: 'start' });
    const cnt = (n, t0, d = 0.8) => Math.round(n * ease.out(inv(t0, t0 + d, t)));
    const sub = (t0, d = 0.4) => ease.out(inv(t0, t0 + d, t));
    const pop = (t0, d = 0.45) => ease.back(inv(t0, t0 + d, t));
    if (i === 0 && on) {
      c += num(String(cnt(6, m.c1)), 26, 84, 64);
      LOGOS6.forEach((lg, j) => { const q = pop(m.c1logos + j * 0.12); if (q > 0) c += logoPilula('logo-' + lg, 150 + (j % 3) * 88, 42 + Math.floor(j / 3) * 50, 80, 38, q); });
      const u = sub(m.c1txt); c += op(u, g(tr(0, 8 * (1 - u)), txt(['projetos vendidos', 'no primeiro ano'], 26, 164)));
    }
    if (i === 1 && on) {
      c += num(String(cnt(20, m.c2)), 26, 84, 64);
      for (let j = 0; j < 20; j++) { const q = pop(m.c2av + j * 0.055, 0.35); if (q <= 0) continue; const col = j % 10, lin = Math.floor(j / 10); const cx2 = 148 + col * 26, cy2 = 46 + lin * 30; const gold = j === 3 || j === 8 || j === 11 || j === 17; c += g(`translate(${cx2} ${cy2}) scale(${F(q)})`, `<circle r="11" fill="${gold ? COR.ouro : 'rgba(108,196,255,.9)'}"/><circle cy="-3" r="4" fill="${COR.navy}"/><path d="M-6.5 7 q6.5 -8 13 0 Z" fill="${COR.navy}"/>`); }
      const u = sub(m.c2txt); c += op(u, g(tr(0, 8 * (1 - u)), txt(['pessoas passaram', 'pelos projetos'], 26, 164)));
    }
    if (i === 2 && on) {
      c += num('R$', 26, 76, 30) + num(String(cnt(16, m.c3)), 78, 84, 64) + num('mi', 158, 76, 28);
      const u = sub(m.c3txt); c += op(u, g(tr(0, 8 * (1 - u)), txt(['em collections · FY26 + FY27'], 26, 176)));
      const b1 = ease.out(inv(m.b26 - 0.05, m.b26 + 0.55, t)), b2 = ease.out(inv(m.b27 - 0.05, m.b27 + 0.55, t));
      const bx = 262, base = 112, e7 = 7.2;
      if (b1 > 0) c += `<rect x="${bx}" y="${F(base - 7 * e7 * b1)}" width="42" height="${F(7 * e7 * b1)}" rx="7" fill="url(#azAzulV)"/>` + op(b1, T('7', bx + 21, base - 7 * e7 * b1 + 24, 20, { w: 800, fill: '#fff' }) + T('FY26', bx + 21, base + 26, 15, { w: 800, fill: COR.ouro2 }));
      if (b2 > 0) c += `<rect x="${bx + 60}" y="${F(base - 9 * e7 * b2)}" width="42" height="${F(9 * e7 * b2)}" rx="7" fill="url(#azAzulV)"/>` + op(b2, T('9', bx + 81, base - 9 * e7 * b2 + 24, 20, { w: 800, fill: '#fff' }) + T('FY27', bx + 81, base + 26, 15, { w: 800, fill: COR.ouro2 }));
    }
    if (i === 3 && on) {
      c += num(String(cnt(12, m.c4, 0.6)), 26, 84, 64);
      let u = sub(m.c4m); c += op(u, txt(['meses de', 'duração média'], 118, 60, 19, COR.claro));
      u = pop(m.c4rel); if (u > 0) c += g(`translate(356 66) scale(${F(u)})`, relogio(0, 0, 30, clamp(inv(m.c4rel, m.c4rec + 0.4, t)), L));
      u = sub(m.c4txt); c += op(u, g(tr(0, 8 * (1 - u)), txt(['Projetos de longo prazo', 'e recorrência'], 26, 174, 21, '#fff', 700)));
    }
    if (i === 4 && on) {
      const u0 = pop(m.c5); c += g(`translate(52 54) scale(${F(u0)})`, icoCross(0, 0, 40, clamp(inv(m.c5, m.c5 + 0.8, t))));
      c += op(sub(m.c5 + 0.1), txt(['Cross-sell com', 'especializações'], 100, 48, 22, '#fff', 700));
      const chips = [['Melhoria de processos', m.ch1, COR.verde], ['Reforma tributária', m.ch2, COR.verde], ['Transformação digital', m.ch3, COR.verde], ['entre outros', m.ch3 + 0.2, COR.ouro]];
      let cx3 = 26, cy3 = 150;
      chips.forEach(([tx, t0, cor], j) => { const w = chipW(tx, 15); if (j === 2) { cx3 = 26; cy3 += 44; } const q = pop(t0, 0.4); if (q > 0) c += g(`translate(${F(cx3 + w / 2)} ${cy3}) scale(${F(q)})`, chip(tx, 0, 0, { size: 15, cor })); cx3 += w + 10; });
    }
    if (i === 5 && on) {
      const chips = [['TMO', COR.ouro], ['GMO', COR.ouro], ['A&M + TOTVS', COR.azulClaro]];
      let cx3 = 26; chips.forEach(([tx, cor], j) => { const w = chipW(tx, 15, 1.5); const q = pop(m.c6 + j * 0.15, 0.4); if (q > 0) c += g(`translate(${F(cx3 + w / 2)} 44) scale(${F(q)})`, chip(tx, 0, 0, { size: 15, cor, ls: 1.5 })); cx3 += w + 10; });
      c += `<rect x="26" y="74" width="${F(lerp(0, GR.cw - 52, ease.out(inv(m.c6 + 0.3, m.c6 + 0.9, t))))}" height="1.5" fill="rgba(108,196,255,.5)"/>`;
      let u = sub(m.c6txt); c += op(u, g(tr(0, 8 * (1 - u)), txt(['Gestão integrada na implantação', 'de soluções do ecossistema TOTVS'], 26, 110, 19, '#fff')));
      u = sub(m.c6eco); c += op(u, T('TOTVS + A&M', 26, 190, 13, { w: 800, fill: COR.claro, anchor: 'start', ls: 2.5 }) + T('um só time na implantação', 26, 212, 13, { ...OS, w: 400, fill: COR.mudo, anchor: 'start' }));
      const q = pop(m.c6eco, 0.5); if (q > 0) c += g(`translate(360 196) scale(${F(q)})`, `<circle cx="-11" r="16" fill="none" stroke="${COR.ouro}" stroke-width="3"/><circle cx="11" r="16" fill="none" stroke="${COR.azulClaro}" stroke-width="3"/>`);
    }
    if (i === 6 && on) {
      const u0 = pop(m.c7); c += g(`translate(50 58) scale(${F(u0)})`, icoDoc(0, 0, 40, clamp(inv(m.c7, m.c7 + 0.8, t))) + (t > m.c7chk ? g(`translate(16 22) scale(${F(ease.back(inv(m.c7chk, m.c7chk + 0.4, t)))})`, checkIco(0, 0, 11, COR.verde2)) : '') + `<path d="M28 -34 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 Z" fill="${COR.ouro}" opacity="${F(0.5 + 0.5 * Math.sin(L * 5))}"/>`);
      c += op(sub(m.c7 + 0.1), txt(['Qualidade e eficiência', 'das MITs'], 100, 50, 22, '#fff', 700));
      const um = sub(m.c7mit);
      if (um > 0) { let xx = 26; [['M', true], ['etodologia de ', false], ['I', true], ['mplantação ', false], ['T', true], ['OTVS', false]].forEach(([p, hl], j) => { const w = larg(p, 16, hl ? 700 : 400, 'os'); if (hl) c += op(um, `<rect x="${F(xx - 2)}" y="112" width="${F(w + 4)}" height="22" rx="4" fill="rgba(230,183,94,.28)" stroke="${COR.ouro}" stroke-width="1"/>`); c += op(um, T(p, xx, 129, 16, { ...OS, w: hl ? 700 : 400, fill: hl ? COR.ouro2 : COR.claro, anchor: 'start' })); xx += w; }); }
      const u = sub(m.c7txt); c += op(u, g(tr(0, 6 * (1 - u)), txt(['Métodos e skills aplicados à revisão', 'e à validação da qualidade dos', 'documentos de implantação.'], 26, 162, 16, COR.claro, 400)));
    }
    if (i === 7 && on) {
      const u0 = pop(m.c8); c += g(`translate(52 54) scale(${F(u0)})`, icoRaio(0, 0, 34));
      c += op(sub(m.c8 + 0.1), T('Testes integrados', 100, 50, 22, { ...OS, w: 700, fill: '#fff', anchor: 'start' }));
      c += op(sub(m.c8x), T('FERRAMENTA XRAY', 100, 74, 12, { w: 800, fill: COR.verde, anchor: 'start', ls: 2.5 }));
      [['Gestão', m.k1, 26], ['Execução', m.k2, 132], ['Rastreabilidade', m.k3, 250]].forEach(([tx, t0, xx]) => { const q = pop(t0, 0.4); if (q > 0) c += g(`translate(${xx} 118) scale(${F(q)})`, `<circle cx="10" r="10" fill="none" stroke="${COR.verde}" stroke-width="2"/><path d="M5.5 0 l3 3.2 l6 -6.4" stroke="${COR.verde}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + T(tx, 27, 6, 15, { ...OS, fill: '#fff', anchor: 'start' })); });
      const u = sub(m.c8txt); c += op(u, g(tr(0, 6 * (1 - u)), txt(['Ferramenta de testes que permite gerenciar,', 'executar e garantir a rastreabilidade dos testes', 'de ponta a ponta.'], 26, 160, 15, COR.claro, 400)));
    }
    if (i === 8 && on) {
      const u0 = sobe(L, 0, 0);
      const q = ease.out(inv(m.c9, m.c9 + 0.5, t));
      c += op(q, g(tr(0, 10 * (1 - q)), miniDash(24, 22, GR.cw - 48, 110, clamp(inv(m.c9 + 0.1, m.c9 + 0.9, t)), clamp(inv(m.c9 + 0.5, m.c9 + 1.3, t)), ease.out(inv(m.c9 + 1.0, m.c9 + 1.8, t)), L)));
      c += op(sub(m.c9t), T('Cockpit executivo', 26, 168, 22, { ...OS, w: 700, fill: '#fff', anchor: 'start' }));
      const u = sub(m.c9txt);
      const dc = ease.out(inv(m.c9dc, m.c9dc + 0.4, t));
      c += op(u, T('Gestão do portfólio de projetos', 26, 196, 15, { ...OS, w: 400, fill: COR.claro, anchor: 'start' }) + T('com apoio do ', 26, 218, 15, { ...OS, w: 400, fill: COR.claro, anchor: 'start' }) + T('Delivery Center', 26 + larg('com apoio do ', 15, 400, 'os'), 218, 15, { ...OS, w: 700, fill: dc > 0 ? COR.ouro2 : COR.claro, anchor: 'start' }));
      if (dc > 0 && dc < 1) c += `<rect x="20" y="202" width="${F(190)}" height="24" rx="6" fill="${COR.ouro}" opacity="${F(0.25 * Math.sin(dc * Math.PI))}"/>`;
    }
    // barra de rodapé do card
    c += `<rect x="24" y="${GR.ch - 12}" width="${F(lerp(44, GR.cw - 48, ac))}" height="3" rx="1.5" fill="${i < 4 ? COR.ouro : COR.azulClaro}" opacity="${F(0.45 + 0.55 * ac)}"/>`;
    painel += op(ent, g(`translate(${F(x + GR.cw / 2)} ${F(y + GR.ch / 2 + 26 * (1 - e))}) scale(${F(k)}) translate(${-GR.cw / 2} ${-GR.ch / 2})`, c));
  }
  // partículas dos cards acesos
  const r = rng(11);
  for (let j = 0; j < 36; j++) {
    const i = Math.floor(r() * 9), t1 = ini[i] + 0.2 + r() * 4, q = inv(t1, t1 + 2.0, t);
    if (q <= 0 || q >= 1) { r(); continue; }
    const { x, y } = cel(i); painel += `<circle cx="${F(x + r() * GR.cw)}" cy="${F(y + GR.ch - q * 130)}" r="${F(1.5 + 1.5 * Math.sin(q * Math.PI))}" fill="${COR.ouro}" opacity="${F(0.7 * Math.sin(q * Math.PI))}"/>`;
  }
  s += g(`translate(960 530) scale(${F(cam[2])}) translate(${F(-cam[0])} ${F(-cam[1])})`, painel);
  s += secao('RESULTADOS QUE FAZEM A DIFERENÇA', GR.x0, 64, L - 0.1);
  // personagens fixos nas laterais (não encobrem o painel na visão geral)
  const eb = sobe(L, 0.5, 0.9), ea = sobe(L, 0.65, 0.9);
  s += g(tr(-foraEsq('totvs_boy', cxB, hB) * (1 - eb), 0), pessoa('totvs_boy', cxB, 1131, hB, L, { halo: '#3b82f6', haloA: 0.1 }));
  s += g(tr(foraDir('am_boy', cxA, hA) * (1 - ea), 0), pessoa('am_boy', cxA, 1126, hA, L, { halo: '#f08a2c', haloA: 0.1, fase: 1.6 }));
  return s + vinheta(0.7);
}

// ------------------------------------------------------------------ CENA 3 · DESAFIO DO ERP
const NOS = [
  { r: 'PROCESSOS', a: -90, ico: 0 }, { r: 'PESSOAS', a: -28, ico: 1 }, { r: 'INTEGRAÇÕES', a: 28, ico: 2 },
  { r: 'PRAZOS', a: 90, ico: 3 }, { r: 'RISCOS', a: 152, ico: 4 }, { r: 'MUDANÇA', a: 208, ico: 5 },
];
function iconeNo(i, cor = '#fff') {
  const st = `stroke="${cor}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (i) {
    case 0: return `<circle r="13" ${st}/><path d="M0 -18 v5 M0 13 v5 M-18 0 h5 M13 0 h5 M-13 -13 l3.5 3.5 M9.5 9.5 l3.5 3.5 M13 -13 l-3.5 3.5 M-9.5 9.5 l-3.5 3.5" ${st}/>`;
    case 1: return `<circle cx="-7" cy="-6" r="6" ${st}/><circle cx="9" cy="-4" r="5" ${st}/><path d="M-18 13 q11 -14 22 0 M3 12 q8 -10 16 0" ${st}/>`;
    case 2: return `<path d="M-4 -4 a8 8 0 0 0 -11 0 l-5 5 a8 8 0 0 0 11 11 l3 -3 M4 4 a8 8 0 0 0 11 0 l5 -5 a8 8 0 0 0 -11 -11 l-3 3 M-5 5 l10 -10" ${st}/>`;
    case 3: return `<circle r="14" ${st}/><path d="M0 -8 v8 l6 5" ${st}/>`;
    case 4: return `<path d="M0 -15 L16 12 H-16 Z" ${st}/><path d="M0 -4 v7 M0 8 v1" ${st}/>`;
    default: return `<path d="M-14 4 a14 14 0 0 1 26 -8 M14 -4 a14 14 0 0 1 -26 8" ${st}/><path d="M12 -12 v8 h-8 M-12 12 v-8 h8" ${st}/>`;
  }
}
const rotulo = (txt, x, y, cor) => { const w = larg(txt, 15, 800) + 26 + txt.length * 1.5; return `<rect x="${F(x - w / 2)}" y="${F(y - 15)}" width="${F(w)}" height="30" rx="15" fill="rgba(7,17,42,.85)" stroke="${cor}" stroke-width="1.2"/>` + T(txt, x, y + 5, 15, { w: 800, fill: '#fff', ls: 1.5 }); };

export function erp(L, t, dur) {
  let s = fundo(t);
  const tERP = palavra('l11', 6), tComp = palavra('l11', 9);
  const quando = [palavra('l12', 0), palavra('l12', 1), palavra('l12', 2), palavra('l12', 3), palavra('l12', 5), palavra('l12', 6)];
  const juntos = palavra('l12', 8), fimFala = palavra('l12', -1);
  // painel
  const bx = 560, by = 120, bw = 1200, bh = 640;
  const kq = ease.out(inv(-0.35, 0.3, L));   // começa durante o dissolve da cena anterior
  const cx = bx + bw / 2, cy = by + bh / 2 + 26, RX = 400, RY = 215;
  let pan = vidro(bx, by, bw, bh, { r: 26, fill: 'rgba(14,34,74,.55)' }) + secao('IMPLANTAÇÃO DE ERP', bx + 34, by + 52, L - 0.4, { size: 17 });
  const alinha = ease.inOut(inv(juntos - 0.25, juntos + 0.9, t));
  const caos = ease.out(inv(tComp - 0.2, tComp + 0.5, t)) * (1 - alinha);
  // nós-fantasma (complexidade) e linhas emaranhadas
  if (caos > 0.01) {
    const r = rng(17); let d = '';
    for (let j = 0; j < 8; j++) { const p = () => [cx + (r() - 0.5) * 820, cy + (r() - 0.5) * 400]; const [a, b, c2, e] = [p(), p(), p(), p()]; d += `<path d="M${F(a[0])} ${F(a[1])} C${F(b[0] + 26 * Math.sin(L * 3 + j))} ${F(b[1])} ${F(c2[0])} ${F(c2[1] + 26 * Math.cos(L * 3 + j))} ${F(e[0])} ${F(e[1])}" stroke="${j % 2 ? COR.vermelho : COR.laranja}" stroke-width="2.2" fill="none" opacity=".5"/>`; }
    pan += op(caos, d);
  }
  const tremor = caos * 3;
  // construção do painel antes do núcleo: elipse pontilhada se desenhando + guias radiais tênues
  const cons = ease.inOut(inv(0.55, tERP - 0.2 - (t - L), L));
  // elipse como caminho que começa no topo (sentido horário), para o traço se desenhar a partir de cima
  const elipse = `M${cx} ${F(cy - RY)} A${RX} ${RY} 0 1 1 ${F(cx - 0.01)} ${F(cy - RY)}`;
  if (cons > 0 && alinha < 1) pan += op((1 - alinha) * 0.9, `<path d="${elipse}" fill="none" stroke="rgba(108,196,255,.45)" stroke-width="1.5" pathLength="100" stroke-dasharray="${F(cons * 100)} 100"/>`
    + NOS.map((n, i) => { const a = n.a * Math.PI / 180; const q = clamp(inv(i * 0.12, 0.4 + i * 0.12, cons)); return `<line x1="${cx}" y1="${cy}" x2="${F(cx + Math.cos(a) * RX * q)}" y2="${F(cy + Math.sin(a) * RY * q)}" stroke="rgba(108,196,255,.18)" stroke-width="1"/>`; }).join(''));
  NOS.forEach((n, i) => {
    const ghost = ease.out(inv(tComp - 0.1 + i * 0.08, tComp + 0.4 + i * 0.08, t));
    const ap = ease.back(inv(quando[i] - 0.15, quando[i] + 0.4, t));
    if (ghost <= 0) return;
    const a = n.a * Math.PI / 180;
    const x = cx + Math.cos(a) * RX + tremor * Math.sin(L * 23 + i), y = cy + Math.sin(a) * RY + tremor * Math.cos(L * 19 + i * 2);
    const pulso = Math.sin(clamp(inv(quando[i], quando[i] + 0.8, t)) * Math.PI);
    const cor = alinha > 0.5 ? COR.verde : COR.ouro;
    // ligação
    if (ap > 0) pan += `<line x1="${cx}" y1="${cy}" x2="${F(lerp(cx, x, ap))}" y2="${F(lerp(cy, y, ap))}" stroke="${cor}" stroke-width="${F(2.5 + 2 * alinha)}" opacity="${F(0.6 + 0.3 * alinha)}"/>`;
    else pan += op(ghost * 0.5, `<line x1="${cx}" y1="${cy}" x2="${F(x)}" y2="${F(y)}" stroke="${COR.azulClaro}" stroke-width="1.5" stroke-dasharray="6 8"/>`);
    if (alinha > 0.3) { const q = (L * 0.9 + i * 0.17) % 1; pan += `<circle cx="${F(lerp(cx, x, q))}" cy="${F(lerp(cy, y, q))}" r="4.5" fill="#fff" opacity="${F(alinha)}"/>`; }
    const k = ap > 0 ? ap : ghost * 0.85;
    const fill = ap > 0 ? (alinha > 0.5 ? 'rgba(67,209,169,.22)' : 'rgba(230,183,94,.22)') : 'rgba(59,130,246,.14)';
    const borda = ap > 0 ? cor : 'rgba(108,196,255,.55)';
    pan += g(`translate(${F(x)} ${F(y)}) scale(${F(k)})`, `<circle r="${F(46 + 26 * pulso)}" fill="none" stroke="${cor}" stroke-width="3" opacity="${F(pulso * 0.8)}"/>`
      + `<circle r="38" fill="${fill}" stroke="${borda}" stroke-width="${ap > 0 ? 3 : 1.5}"/>` + iconeNo(n.ico, ap > 0 ? '#fff' : 'rgba(255,255,255,.7)')
      + rotulo(n.r, 0, i === 0 ? -72 : 70, ap > 0 ? cor : 'rgba(108,196,255,.5)'));
  });
  if (alinha > 0) pan += `<path d="${elipse}" fill="none" stroke="${COR.verde}" stroke-width="3" pathLength="100" stroke-dasharray="${F(alinha * 100)} 100" opacity=".8"/>`;
  // ERP central
  const ke = ease.back(inv(tERP - 0.35, tERP + 0.2, t)), pe = 1 + 0.05 * Math.sin(L * 3.5);
  pan += g(`translate(${cx} ${cy}) scale(${F(ke * pe)})`, `<circle r="84" fill="${COR.azul}" opacity=".35" filter="url(#azBrilho)"/><circle r="64" fill="#1f5fe0" stroke="#9cc6ff" stroke-width="3"/>` + T('ERP', 0, 15, 42, { w: 900, fill: '#fff' }));
  s += op(kq * (1 - ease.in(inv(dur - 0.7, dur - 0.3, L))), g(tr(0, 24 * (1 - kq)), pan));   // o painel some antes do dissolve para o farol
  // personagem no padrão 3D (Antonialli líder) à esquerda, olhando para o painel
  const hp = 600, ep = sobe(L, 0.02, 0.9), cxP = 36 + largPessoa('antonialli_lider', hp) / 2;
  s += g(tr(-foraEsq('antonialli_lider', cxP, hp) * (1 - ep), 0), pessoa('antonialli_lider', cxP, 1100, hp, L, { halo: '#f08a2c', haloA: 0.12 }));
  // reação "!" na complexidade
  const xR = 36 + largPessoa('antonialli_lider', hp) + 30, kEx = caos * clamp(1 - alinha * 3), kOk = clamp((alinha - 0.4) * 2.5);
  if (kEx > 0.02) s += op(kEx, T('!', xR, 500 - 6 * Math.abs(Math.sin(L * 6)), 64, { w: 900, fill: COR.ouro }));
  if (kOk > 0) s += op(kOk, g(`translate(${F(xR)} 480) scale(${F(ease.back(kOk))})`, checkIco(0, 0, 24, COR.verde)));
  return s + vinheta(0.7);
}

// ------------------------------------------------------------------ CENA 4 · FAROL A&M
export function farol(L, t, dur) {
  let s = fundo(t, { bokeh: 0.6 });
  const tLidar = palavra('l13', 3), tChamar = palavra('l13', 11), tQuem = palavra('l13', 12), tJogo = palavra('l13', -1);
  const liga = ease.out(inv(tLidar - 0.4, tLidar + 0.4, t));
  const proj = ease.inOut(inv(tChamar - 0.5, tChamar + 0.6, t));
  s += cidade(t, 900, { k: 0.9, acende: 0.4 + 1.3 * proj, foco: 960 });
  s += `<path d="M840 900 L862 740 L1058 740 L1080 900 Z" fill="#14305e" stroke="rgba(255,255,255,.15)"/>` + `<rect x="900" y="770" width="120" height="64" rx="10" fill="rgba(7,17,42,.85)" stroke="rgba(255,255,255,.25)"/>` + logoImg('alvarez-marsal-branco', 960, 802, 44, 90);
  s += `<rect x="922" y="704" width="76" height="40" rx="10" fill="#1b3a6c" stroke="#8fb4ea" stroke-width="2"/><circle cx="960" cy="704" r="22" fill="#fff4c9" opacity="${F(0.3 + 0.7 * liga)}"/>`;
  s += op(liga, `<circle cx="960" cy="704" r="70" fill="url(#azLuzOuro)"/>`);
  const ang = lerp(-40, -6, proj) + 2.5 * Math.sin(L * 1.3) * (1 - proj);
  const alvo = { x: 960 + Math.sin(ang * Math.PI / 180) * 560, y: 704 - Math.cos(ang * Math.PI / 180) * 500 };
  s += op(liga * 0.9, g(`rotate(${F(ang)} 960 704)`, `<path d="M942 704 L978 704 L1160 160 L760 160 Z" fill="url(#azFeixe)"/>`));
  const r = rng(4);
  for (let j = 0; j < 40; j++) { const q = (r() + L * 0.1) % 1; const yy = 704 - q * 530, xx = 960 + (r() - 0.5) * (40 + q * 360); s += op(liga * 0.6, g(`rotate(${F(ang)} 960 704)`, `<circle cx="${F(xx)}" cy="${F(yy)}" r="${F(1 + r() * 1.8)}" fill="#fff8e0" opacity="${F(0.3 + 0.4 * Math.sin(L * 3 + j))}"/>`)); }
  s += op(liga, `<ellipse cx="${F(alvo.x)}" cy="${F(alvo.y + 10)}" rx="320" ry="100" fill="#2b4d86" opacity=".5" filter="url(#azBrilho)"/>`);
  if (proj > 0) {
    const k = ease.back(inv(tChamar - 0.1, tChamar + 0.6, t)) * (1 + 0.03 * Math.sin(L * 3));
    s += op(proj, `<ellipse cx="${F(alvo.x)}" cy="${F(alvo.y)}" rx="250" ry="130" fill="#fff1c4" opacity=".14" filter="url(#azBrilho)"/>`);
    s += g(`translate(${F(alvo.x)} ${F(alvo.y)}) scale(${F(k)})`, `<circle r="112" fill="none" stroke="#ffe3a0" stroke-width="3" opacity=".7"/>` + logoImg('alvarez-marsal-branco', 0, -4, 128, 190));
  }
  // o mascote A&M entra em "quem entende do jogo"
  const ea = sobe(L, tQuem - 0.2 - (t - L), 0.9);
  const ha = 560, cxA = 1787;
  if (ea > 0) s += g(tr(foraDir('am_boy', cxA, ha) * (1 - ea), 0), pessoa('am_boy', cxA, 1120, ha, L, { halo: '#f08a2c' }));
  const kq = entra(L, tJogo - 0.2 - (t - L), 0.5);
  if (kq > 0) s += g(`translate(1690 520) scale(${F(kq)})`, pilula('QUEM ENTENDE DO JOGO', 0, 0, { fill: COR.laranja, size: 20, ls: 3 }));
  return s + vinheta(0.6);
}

// ------------------------------------------------------------------ CENA 5 · UNIÃO
const onda = (x0, x1, y, k, cor, f, ph, L) => {
  let d = `M${x0} ${y}`;
  for (let i = 1; i <= 40; i++) { const u = i / 40; const x = lerp(x0, x1, u * f); d += ` L${F(x)} ${F(y + Math.sin(u * 9 + L * 4 + ph) * 26 * (1 - u * 0.7) * k)}`; }
  return `<path d="${d}" stroke="${cor}" stroke-width="26" fill="none" opacity=".22" filter="url(#azBrilho)"/><path d="${d}" stroke="${cor}" stroke-width="12" fill="none" opacity=".45" filter="url(#azBrilhoP)"/><path d="${d}" stroke="${cor}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>`;
};
export function uniao(L, t, dur) {
  let s = fundo(t);
  const tT = palavra('l14', 0), tA = palavra('l14', 3), tComp = palavra('l15', 0), tUn = palavra('l15', 2), tFim = palavra('l15', -1);
  const hm = 560;
  const em = sobe(L, -0.3, 0.9);
  const fa = ease.out(inv(tT, tT + 1.3, t)), fb = ease.out(inv(tA, tA + 1.3, t));
  const yE = 640;
  s += op(clamp(fa * 3), onda(0, 960, yE, 1, COR.azulClaro, fa, 0, L) + onda(0, 960, yE + 28, 0.6, COR.azul, fa, 1.4, L));
  s += op(clamp(fb * 3), onda(1920, 960, yE, 1, '#ffb36b', fb, 2, L) + onda(1920, 960, yE + 28, 0.6, COR.laranja, fb, 3.1, L));
  // núcleo
  const nuc = Math.max(fa, fb) * 0.6 + 0.4 * ease.out(inv(tComp - 0.2, tComp + 0.4, t));
  const burst = Math.sin(clamp(inv(tComp - 0.2, tComp + 0.9, t)) * Math.PI);
  s += op(clamp(nuc), `<circle cx="960" cy="${yE}" r="${F(90 + 40 * Math.sin(L * 2))}" fill="url(#azLuz)"/>`);
  s += op(burst * 0.8, `<circle cx="960" cy="${yE}" r="${F(140 + 300 * inv(tComp - 0.2, tComp + 0.9, t))}" fill="url(#azLuz)"/>`);
  const anel = inv(tUn - 0.1, tUn + 1.2, t);
  if (anel > 0 && anel < 1) s += `<circle cx="960" cy="${yE}" r="${F(40 + anel * 520)}" fill="none" stroke="#fff" stroke-width="${F(3 * (1 - anel))}" opacity="${F(1 - anel)}"/>`;
  const r = rng(8);
  for (let j = 0; j < 30; j++) { const q = inv(tComp - 0.1, tComp + 1.2, t); if (q <= 0 || q >= 1) break; const a = r() * TAU, d = 40 + q * (160 + r() * 240); s += `<circle cx="${F(960 + Math.cos(a) * d)}" cy="${F(yE + Math.sin(a) * d * 0.7)}" r="${F(2 + r() * 3)}" fill="${j % 2 ? COR.ouro : '#fff'}" opacity="${F(1 - q)}"/>`; }
  // personagens
  const cxM = 136;
  s += g(tr(-foraEsq('totvs_boy', cxM, hm) * (1 - em), 0), pessoa('totvs_boy', cxM, 1120, hm, L, { halo: COR.azul }));
  s += pessoa('am_boy', 1787, 1120, hm, L, { halo: '#f08a2c' });
  // rótulos superiores
  const k1 = sobe(L, tT - 0.2 - (t - L), 0.5), k2 = sobe(L, tA - 0.2 - (t - L), 0.5), kp = entra(L, tA + 1.3 - (t - L), 0.5);
  let e1 = logoPilula('logo-totvs', 190, 170, 150, 66) + T('TOTVS', 290, 165, 32, { w: 900, fill: '#fff', anchor: 'start', ls: 1 }) + T('NA SOLUÇÃO', 290, 192, 14, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 4 })
    + `<rect x="110" y="214" width="18" height="18" rx="3" fill="none" stroke="${COR.azulClaro}" stroke-width="1.5"/><rect x="115" y="219" width="8" height="8" fill="${COR.azulClaro}"/>` + T('A maior empresa de tecnologia do Brasil', 138, 229, 17, { ...OS, w: 400, fill: COR.claro, anchor: 'start' });
  s += op(k1, g(tr(-30 * (1 - k1), 0), e1));
  let e2 = logoPilula('logo-alvarez-marsal', 1740, 170, 160, 66) + T('A&M', 1640, 165, 32, { w: 900, fill: '#fff', anchor: 'end' }) + T('NA GESTÃO DA TRANSFORMAÇÃO', 1640, 192, 14, { w: 800, fill: COR.ouro2, anchor: 'end', ls: 3.5 })
    + T('A&M Performance · núcleo de excelência em performance da Alvarez & Marsal', 1780, 229, 16, { ...OS, w: 400, fill: COR.claro, anchor: 'end' }) + `<circle cx="1800" cy="224" r="10" fill="none" stroke="${COR.ouro}" stroke-width="1.5"/><path d="M1800 216 l3 6 l-3 6 l-3 -6 Z" fill="${COR.ouro}"/>`;
  s += op(k2, g(tr(30 * (1 - k2), 0), e2));
  // linhas até o "+"
  s += `<line x1="470" y1="172" x2="${F(lerp(470, 920, k1))}" y2="172" stroke="rgba(108,196,255,.6)" stroke-width="1.5"/>` + `<line x1="1460" y1="172" x2="${F(lerp(1460, 1000, k2))}" y2="172" stroke="rgba(230,183,94,.6)" stroke-width="1.5"/>`;
  s += op(clamp(kp * 2), g(`translate(960 172) scale(${F(kp)})`, `<circle r="26" fill="rgba(7,17,42,.85)" stroke="${COR.ouro}" stroke-width="2"/>` + T('+', 0, 10, 30, { w: 800, fill: COR.ouro }) + T('TECNOLOGIA + GESTÃO', 0, 60, 14, { w: 800, fill: COR.claro, ls: 4 })));
  const dot = ease.out(inv(tA + 1.5, tA + 2.3, t));
  if (dot > 0) s += `<line x1="960" y1="240" x2="960" y2="${F(lerp(240, yE - 100, dot))}" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-dasharray="2 9"/>`;
  return s + vinheta(0.6);
}
