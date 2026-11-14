// Kit de motion do vídeo "Mapa de Perfil Cognitivo": fundos vivos, efeitos de After Effects
// (câmera, brilho, sombra, confete, rastros) e o MAPA DE ADOÇÃO desenhado como um mapa de trilha, com
// uma estrada que sobe pelas cinco estações da régua (Resiste, Observa, Experimenta, Adota, Multiplica).
// Só usa as cores da paleta (navy, azuis, cinzas e laranjas). Não há logos, logotipos nem personagens:
// pessoas aparecem como pinos e discos com ícone. O tom é sofisticado, não infantil.
import { C, W, H, txt, larg, icone, disco, pop, opa, tracar, clamp, lerp, inv, ease, n2, rng, noise } from './base.js';
import { NIVEIS, PESSOAS, AREAS } from './modelo.js';

const f = n2;

// ---------- filtros (instalados uma vez em <defs>, fora da área redesenhada) ----------
export function instalarDefs(defs) {
  defs.innerHTML += `<filter id="fx-sombra" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#002B49" flood-opacity=".20"/></filter>`
    + `<filter id="fx-sombra-leve" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#002B49" flood-opacity=".16"/></filter>`
    + `<filter id="fx-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    + `<filter id="fx-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>`
    + `<filter id="fx-blur-x" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="16 0"/></filter>`
    + `<radialGradient id="g-luz" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="g-azul" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.blue}" stop-opacity=".55"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="g-laranja" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.orange}" stop-opacity=".5"/><stop offset="1" stop-color="${C.orange}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="g-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF1F8"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>`
    + `<linearGradient id="g-noite" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#0A3A5E"/><stop offset="1" stop-color="#001C30"/></linearGradient>`
    + `<linearGradient id="g-terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4EDF5"/><stop offset="1" stop-color="#CFDDEA"/></linearGradient>`
    + `<linearGradient id="g-tela" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0D3A5C"/><stop offset="1" stop-color="#002B49"/></linearGradient>`;
}
export const sombra = (body, leve) => `<g filter="url(#fx-sombra${leve ? '-leve' : ''})">${body}</g>`;
export const brilho = body => body;   // versão limpa: sem halo de brilho

// ---------- fundos vivos ----------
// claro: céu azul bem leve, grade de pontos e formas da paleta flutuando em paralaxe
export function fundoVivo(t, o = {}) {
  // versão limpa: fundo claro liso, com um degradê bem leve e nada flutuando
  return `<rect width="${W}" height="${H}" fill="url(#g-ceu)"/>`;
}
// noite: navy em degradê com luzes azul e laranja que respiram, poeira subindo e uma grade em perspectiva sutil
export function fundoNoite(t, o = {}) {
  // versão limpa: navy em degradê, com uma única luz azul bem suave; sem poeira
  return `<rect width="${W}" height="${H}" fill="url(#g-noite)"/>`
    + `<circle cx="${f(W * 0.82)}" cy="${f(H * 0.18)}" r="460" fill="url(#g-azul)" opacity="${f(0.38 * (o.luz ?? 1))}"/>`;
}

// ---------- câmera e efeitos ----------
// câmera: amplia `z` vezes em torno de (cx, cy) do quadro e gira `r` graus. Use para zoom-in, zoom-out e panorâmica.
export function camera(body, o = {}) {
  const z = o.z ?? 1, cx = o.cx ?? W / 2, cy = o.cy ?? H / 2;
  return `<g transform="translate(${f(W / 2 + (o.dx ?? 0))} ${f(H / 2 + (o.dy ?? 0))}) rotate(${f(o.r ?? 0)}) scale(${f(z)}) translate(${f(-cx)} ${f(-cy)})">${body}</g>`;
}
// confete nas cores da paleta, caindo a partir de t0
export function confete(t, t0, o = {}) {
  return '';   // versão limpa: sem confete
}
// estrelinhas de brilho em volta de (x, y)
export function faiscas(x, y, t, o = {}) {
  return '';   // versão limpa: sem faíscas
}
// linhas de velocidade horizontais (para entradas rápidas). u = 0..1
export function velocidade(x, y, w, h, u, o = {}) {
  return '';   // versão limpa: sem linhas de velocidade
}
// balão de fala/pensamento com seta para baixo. (x, y) = ponta da seta
export function balao(x, y, w, h, corpo, o = {}) {
  const k = o.k ?? 1;
  if (k <= 0.001) return '';
  const x0 = x - w * (o.ancora ?? 0.5), y0 = y - h - 18;
  const b = `<path d="M${f(x0 + 18)},${f(y0)} h${f(w - 36)} a18,18 0 0 1 18,18 v${f(h - 36)} a18,18 0 0 1 -18,18 H${f(x + 16)} L${f(x)},${f(y)} L${f(x - 16)},${f(y0 + h)} H${f(x0 + 18)} a18,18 0 0 1 -18,-18 v${f(-(h - 36))} a18,18 0 0 1 18,-18Z" fill="${o.fill ?? C.white}" stroke="${o.stroke ?? C.navy}" stroke-width="${o.sw ?? 3.5}" stroke-linejoin="round"/>`
    + `<g transform="translate(${f(x0)} ${f(y0)})">${corpo}</g>`;
  return pop(k, x, y, b);
}

// ---------- o Mapa de Adoção como mapa de trilha ----------
// A estrada sobe do canto inferior esquerdo ao superior direito, passando pelas cinco estações da régua.
// geoTrilha(x, y, w, h) devolve a geometria: est(i) = [x, y] da estação i; em(u) = ponto da estrada (u = 0..1);
// uEst[i] = posição u de cada estação; vaga(i, j, n) = lugar da j-ésima de n pessoas em volta da estação i.
const PTS = [[0.0, 0.93], [0.15, 0.84], [0.46, 0.74], [0.80, 0.60], [0.47, 0.40], [0.80, 0.18], [1.02, 0.04]];
export function geoTrilha(x, y, w, h) {
  const P = PTS.map(([a, b]) => [x + a * w, y + b * h]);
  // Catmull-Rom -> amostras
  const am = [];
  const N = 26;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < N; k++) {
      const s = k / N, s2 = s * s, s3 = s2 * s;
      am.push([0, 1].map(c => 0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * s + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * s2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * s3)));
    }
  }
  am.push(P[P.length - 1]);
  const acc = [0];
  for (let i = 1; i < am.length; i++) acc.push(acc[i - 1] + Math.hypot(am[i][0] - am[i - 1][0], am[i][1] - am[i - 1][1]));
  const L = acc[acc.length - 1];
  const em = u => {
    const d = clamp(u) * L;
    let i = 1;
    while (i < acc.length - 1 && acc[i] < d) i++;
    const k = (d - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]);
    const a = am[i - 1], b = am[i];
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[1] - a[1], b[0] - a[0])];
  };
  const uEst = [1, 2, 3, 4, 5].map(i => acc[i * N] / L);
  const g = {
    x, y, w, h, L, em, uEst,
    est: i => P[i + 1],
    d: (u0 = 0, u1 = 1) => {
      let d = '';
      const n = 90;
      for (let k = 0; k <= n; k++) { const [px, py] = em(lerp(u0, u1, k / n)); d += (k ? 'L' : 'M') + f(px) + ',' + f(py) + ' '; }
      return d;
    },
    // lugares em volta da estação: anéis de 6 e 10, deslocados para o lado de fora da curva
    vaga: (i, j, n) => {
      const [ex, ey] = P[i + 1];
      const anel = j < 6 ? 0 : 1, m = anel === 0 ? Math.min(6, n) : Math.max(1, n - 6), idx = anel === 0 ? j : j - 6;
      const raio = (anel === 0 ? 0.105 : 0.165) * Math.min(w, h * 1.2), a0 = [-2.6, -1.9, -0.6, -2.5, -1.2][i];
      const a = a0 + (idx - (m - 1) / 2) * (anel === 0 ? 0.62 : 0.42);
      return [ex + Math.cos(a) * raio * 1.15, ey + Math.sin(a) * raio];
    },
  };
  return g;
}
// desenha o mapa. o: { u (0..1 a estrada se desenha), uEst: [5 x 0..1] cada estação nasce, t (para nuvens e bandeiras),
//   foco (índice da estação em foco, -1 = nenhuma), rotulos (true), defs (mostra a definição da marca), terreno (true) }
export function mapaTrilha(g, o = {}) {
  const u = o.u ?? 1, uE = o.uEst ?? [1, 1, 1, 1, 1], t = o.t ?? 0, foco = o.foco ?? -1;
  let s = '';
  if (o.terreno !== false) {
    // ilha: mancha arredondada + relevo
    const k = ease.out(clamp((o.uTerreno ?? 1)));
    const cx = g.x + g.w / 2, cy = g.y + g.h / 2;
    const ilha = `<path d="M${f(g.x - 10)},${f(g.y + g.h * 0.62)} C${f(g.x - 30)},${f(g.y + g.h * 0.2)} ${f(g.x + g.w * 0.2)},${f(g.y - 10)} ${f(g.x + g.w * 0.52)},${f(g.y + g.h * 0.03)} C${f(g.x + g.w * 0.8)},${f(g.y - 30)} ${f(g.x + g.w + 26)},${f(g.y + g.h * 0.1)} ${f(g.x + g.w + 14)},${f(g.y + g.h * 0.46)} C${f(g.x + g.w + 30)},${f(g.y + g.h * 0.8)} ${f(g.x + g.w * 0.86)},${f(g.y + g.h + 16)} ${f(g.x + g.w * 0.5)},${f(g.y + g.h + 4)} C${f(g.x + g.w * 0.2)},${f(g.y + g.h + 20)} ${f(g.x + 6)},${f(g.y + g.h + 4)} ${f(g.x - 10)},${f(g.y + g.h * 0.62)}Z"`;
    s += pop(0.86 + 0.14 * k, cx, cy, opa(k, `${ilha} fill="${C.blue40}" opacity=".5" transform="translate(0 14)"/>` + `${ilha} fill="url(#g-terra)" stroke="${C.white}" stroke-width="6"/>`));
    // relevo: uma única curva de nível, bem leve (versão limpa)
    s += opa(k * 0.7, `<g transform="translate(${f(cx)} ${f(cy)}) scale(0.7) translate(${f(-cx)} ${f(-cy)})">${ilha} fill="none" stroke="${C.blue40}" stroke-width="3" opacity=".6"/></g>`);
  }
  // estrada
  const ue = ease.inOut(clamp(u));
  if (ue > 0) {
    const d = g.d(0, ue);
    s += `<path d="${d}" fill="none" stroke="${C.navy}" stroke-opacity=".16" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 8)"/>`
      + `<path d="${d}" fill="none" stroke="${C.white}" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${d}" fill="none" stroke="${C.navy80}" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${d}" fill="none" stroke="${C.white}" stroke-width="4" stroke-dasharray="18 16" stroke-dashoffset="${f(-t * 26)}" stroke-linecap="round" opacity=".9"/>`;
  }
  // estações
  NIVEIS.forEach((n, i) => {
    const k = ease.back(clamp(uE[i]));
    if (k <= 0.001) return;
    const [ex, ey] = g.est(i), emFoco = foco === i, apag = foco >= 0 && !emFoco;
    const r = (o.rEst ?? 44) * (emFoco ? 1.12 + Math.sin(t * 5) * 0.03 : 1);
    let b = `<ellipse cx="${f(ex)}" cy="${f(ey + r * 0.55)}" rx="${f(r * 1.05)}" ry="${f(r * 0.34)}" fill="${C.navy}" opacity=".18"/>`
      + `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(r)}" fill="${n.cor}" stroke="${C.white}" stroke-width="6"/>`
      + icone(n.ic, ex, ey, r * 1.12, { c: n.tx, sw: 3.4, u: clamp(uE[i] * 1.5 - 0.3) });
    // bandeira
    const fy = ey - r - 4, bal = Math.sin(t * 4 + i) * 4;
    b += `<path d="M${f(ex + r * 0.62)},${f(ey - r * 0.5)} L${f(ex + r * 0.62)},${f(fy - 44)}" stroke="${C.navy}" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="M${f(ex + r * 0.62)},${f(fy - 44)} q16,${f(-6 + bal)} 34,4 q-16,${f(8 - bal)} -34,16Z" fill="${n.cor}" stroke="${C.navy}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (emFoco) b = `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(r + 16 + Math.sin(t * 5) * 4)}" fill="none" stroke="${n.cor === C.navy ? C.blue : n.cor}" stroke-width="5" opacity=".7"/>` + b;
    if (o.rotulos !== false) {
      const sz = o.sRot ?? 26, wl = larg(n.rot, sz, { w: 700 }) + 30, lado = [1, 1, -1, 1, -1][i];
      const lx = ex + lado * (r + 14) + (lado < 0 ? -wl : 0), ly = ey + (i === 1 ? 26 : -18);
      b += `<rect x="${f(lx)}" y="${f(ly)}" width="${f(wl)}" height="${f(sz + 16)}" rx="${f((sz + 16) / 2)}" fill="${C.white}" stroke="${C.navy}" stroke-width="2.5"/>`
        + txt(n.rot, lx + wl / 2, ly + sz * 0.98 + 3, { w: 700, s: sz, c: C.navy, a: 'middle' });
      if (o.defs) b += txt(n.def, lx + (lado < 0 ? wl : 0), ly + sz + 44, { s: 21, c: C.navy80, a: lado < 0 ? 'end' : 'start' });
    }
    s += opa(apag ? 0.5 : 1, pop(k, ex, ey, b));
  });
  return s;
}
// pino de pessoa no mapa (gota com a cor da marca). o: { cor, k, s, rotulo, anel, hop }
export function pinoMapa(x, y, o = {}) {
  const k = o.k ?? 1;
  if (k <= 0.001) return '';
  const s = (o.s ?? 0.62) * k, cor = o.cor ?? C.navy, hop = o.hop ?? 0;
  const b = `<ellipse cx="0" cy="${f(hop * 0.9)}" rx="${f(13 - hop * 0.1)}" ry="5" fill="${C.navy}" opacity=".22"/>`
    + `<g transform="translate(0 ${f(-hop)})"><path d="M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z" fill="${cor}" stroke="${C.white}" stroke-width="4"/>`
    + (o.anel ? `<circle cx="0" cy="-42" r="30" fill="none" stroke="${o.anel}" stroke-width="5"/>` : '')
    + `<circle cx="0" cy="-42" r="11" fill="${C.white}"/>`
    + (o.rotulo ? txt(o.rotulo, 0, -34, { w: 700, s: 20, c: C.navy, a: 'middle' }) : '') + `</g>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${b}</g>`;
}
// todas as pessoas como pinos no mapa de trilha. o: { onda (0..2 fracionária), k: p -> escala de entrada, s, herois (true) }
export function pinosTrilha(g, o = {}) {
  const onda = clamp(o.onda ?? 0, 0, 2), i0 = Math.min(1, Math.floor(onda)), u = ease.inOut(clamp(onda - i0));
  const lugar = od => {
    const out = {};
    for (let n = 0; n < 5; n++) { const cel = PESSOAS.filter(p => p.niv[od] === n); cel.forEach((p, j) => { out[p.id] = g.vaga(n, j, cel.length); }); }
    return out;
  };
  const p0 = lugar(i0), p1 = lugar(i0 + 1);
  const itens = PESSOAS.map(p => {
    const [xa, ya] = p0[p.id], [xb, yb] = p1[p.id], muda = p.niv[i0] !== p.niv[i0 + 1];
    const nv = u < 0.5 ? p.niv[i0] : p.niv[i0 + 1];
    return { p, x: lerp(xa, xb, u), y: lerp(ya, yb, u), hop: muda ? Math.sin(u * Math.PI) * 46 : 0, nv };
  }).sort((a, b) => a.y - b.y);
  let s = '';
  for (const it of itens) {
    const k = o.k ? o.k(it.p) : 1;
    if (k <= 0.001) continue;
    s += pinoMapa(it.x, it.y, { cor: NIVEIS[it.nv].cor, k, s: o.s ?? 0.62, hop: it.hop, rotulo: it.p.heroi && o.herois !== false ? it.p.heroi : null, anel: it.p.heroi && o.herois !== false ? C.navy : null });
  }
  return s;
}
export { AREAS };
