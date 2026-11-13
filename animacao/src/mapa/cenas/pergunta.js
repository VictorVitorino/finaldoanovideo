// Cena "pergunta" (72,52–76,55 s): "No seu projeto, você sabe onde cada pessoa está hoje?"
// A pergunta é a protagonista: tipografia cinética grande em Light, à esquerda, cada palavra sobe por máscara no
// instante da fala ("cada pessoa" e "hoje?" em laranja). Embaixo, como apoio, o Mapa de Adoção em versão noturna:
// malha de coordenadas, curvas de nível, a estrada como linha de luz e as cinco estações ainda apagadas. Espalhados
// pelo mapa, 25 pinos cinza-azulados com "?" oscilam: ninguém sabe onde cada pessoa está. Em 'voce_sabe' um feixe de
// leitura (linha de luz + anel com a lupa) varre o mapa da esquerda para a direita: por onde passa, o mapa acende,
// cada pino ganha a cor da sua marca e desliza, com rastro, até a estação correspondente, que acende. Um contador
// ("pessoas localizadas") acompanha a varredura. Em 'hoje2' o "?" da pergunta pulsa em laranja e solta ondas.
// Sem personagens: pessoas são pinos.
import { W, H, MG, C, txt, larg, fin, back, pop, opa, onda, fio, icone, clamp, lerp, inv, ease, n2, rng } from '../base.js';
import { NIVEIS, contagem } from '../modelo.js';
import { fundoNoite, camera, brilho, geoTrilha, mapaTrilha } from '../ludico.js';

const f = n2;
export const FUNDO = 'navy';
export const LEGENDA = false;

// ---------- tipografia ----------
const TS = 88, TLS = -1.5, LH = 102, TY = 240;             // Light 88 px, quatro linhas (bases 240/342/444/546)
// cada linha: palavras [texto, índice em tempos.palavras, destaque]
const LINHAS = [
  [['No', 145], ['seu', 146], ['projeto,', 147]],
  [['você', 148], ['sabe', 149], ['onde', 150]],
  [['cada', 151, 1], ['pessoa', 152, 1]],
  [['está', 153], ['hoje', 154, 1]],
];

// ---------- cores ----------
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
const sobreNavy = cor => (cor === C.navy ? C.blue20 : cor);   // cor de efeito visível sobre o fundo navy
const CINZA = mix(C.navy80, C.navy40, 0.3);                  // pino sem leitura: cinza-azulado
const NOITE = '#001C30';

// ---------- mapa de trilha (apoio) ----------
const G = geoTrilha(30, 668, 1010, 630);
const MY0 = 600, MYB = H + 440;                                           // topo da zona do mapa (a malha nasce em degradê a partir daqui)
const PS = 0.74;                                           // escala dos pinos ("?" com 24 px)
const N = 25;
const RE = 42;                                            // raio das estações
const FDX = [0, 0, 32, 14, 0], FDY = [0, 0, 13, 5, 0];     // desvio da ficha de cada estação (foge da estrada e dos pinos)
const CONT = contagem(2);                                  // pessoas por marca hoje (onda 3): [1, 4, 6, 9, 5]
// marca de cada pino na ordem da varredura: as estações acendem na ordem da régua (Resiste -> Multiplica)
const SEQ = (() => {
  const rest = [...CONT], abre = [0, 1, 3, 7, 11], out = [];
  for (let i = 0; i < N; i++) {
    let n = abre.indexOf(i);
    if (n < 0 || !rest[n]) {
      n = -1;
      let melhor = -1;
      for (let l = 0; l < 5; l++) { if (abre[l] > i || !rest[l]) continue; const v = rest[l] / CONT[l]; if (v > melhor) { melhor = v; n = l; } }
      if (n < 0) n = rest.findIndex(r => r > 0);
    }
    rest[n]--; out.push(n);
  }
  return out;
})();
// pinos: espalhados numa grade 5 x 5 com ruído (x, y = ponta do pino), longe das estações
const PINOS = (() => {
  const R = rng(4107), ps = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    let x = 100 + (c + 0.5 + (R() - 0.5) * 0.62 + (r % 2 ? 0.2 : -0.2)) * 176;
    let y = 762 + (r + 0.5 + (R() - 0.5) * 0.6) * 100;
    for (let i = 0; i < 5; i++) {                           // afasta das estações
      const [ex, ey] = G.est(i), dx = x - ex, dy = y - 30 - ey, d = Math.hypot(dx, dy);
      if (d < 74) { x = ex + dx / (d || 1) * 78; y = ey + 30 + dy / (d || 1) * 78; }
    }
    ps.push({ x: clamp(x, 84, 996), y: clamp(y, 752, 1268), ph: R() * 6.28, jit: R() });
  }
  ps.sort((a, b) => a.x - b.x);
  const j = [0, 0, 0, 0, 0];
  ps.forEach((p, i) => {
    p.i = i; p.n = SEQ[i];
    [p.vx, p.vy] = G.vaga(p.n, j[p.n]++, CONT[p.n]);
    p.dist = Math.hypot(p.vx - p.x, p.vy - p.y);
    p.dur = clamp(0.4 + p.dist / 2400, 0.42, 0.6);
    p.nx = -(p.vy - p.y) / (p.dist || 1); p.ny = (p.vx - p.x) / (p.dist || 1);   // normal do trajeto (para o arco)
    p.lado = i % 2 ? 1 : -1;
  });
  return ps;
})();

// relevo noturno: malha de coordenadas com cruzes e curvas de nível (texto fixo, calculado uma vez)
const RELEVO = (() => {
  const b = { x: 46, y: 664, w: 988, h: 606 }, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const ilha = `M${f(b.x - 10)},${f(b.y + b.h * 0.62)} C${f(b.x - 30)},${f(b.y + b.h * 0.2)} ${f(b.x + b.w * 0.2)},${f(b.y - 10)} ${f(b.x + b.w * 0.52)},${f(b.y + b.h * 0.03)} C${f(b.x + b.w * 0.8)},${f(b.y - 30)} ${f(b.x + b.w + 26)},${f(b.y + b.h * 0.1)} ${f(b.x + b.w + 14)},${f(b.y + b.h * 0.46)} C${f(b.x + b.w + 30)},${f(b.y + b.h * 0.8)} ${f(b.x + b.w * 0.86)},${f(b.y + b.h + 16)} ${f(b.x + b.w * 0.5)},${f(b.y + b.h + 4)} C${f(b.x + b.w * 0.2)},${f(b.y + b.h + 20)} ${f(b.x + 6)},${f(b.y + b.h + 4)} ${f(b.x - 10)},${f(b.y + b.h * 0.62)}Z`;
  let malha = '', cruz = '';
  for (let x = 54; x < W; x += 108) malha += `M${x},${MY0} V${MYB} `;
  for (let y = 646; y < MYB; y += 108) malha += `M-60,${y} H${W + 60} `;
  for (let x = 54; x < W; x += 108) for (let y = 646; y < MYB; y += 108) cruz += `M${x - 7},${y} h14 M${x},${y - 7} v14 `;
  let s = `<path d="${malha}" fill="none" stroke="${C.white}" stroke-width="1.5" opacity=".1"/>`
    + `<path d="${cruz}" fill="none" stroke="${C.blue40}" stroke-width="2" opacity=".5"/>`
    + `<path d="${ilha}" fill="${C.white}" fill-opacity=".035" stroke="${C.blue40}" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 12"/>`;
  [0.8, 0.6, 0.42, 0.24].forEach((e, i) => {
    s += `<g transform="translate(${f(cx + (i % 2 ? 30 : -22))} ${f(cy + (i % 2 ? -16 : 22))}) scale(${e}) translate(${f(-cx)} ${f(-cy)})"><path d="${ilha}" fill="none" stroke="${C.blue40}" stroke-opacity="${i % 2 ? 0.26 : 0.36}" stroke-width="${f(1.8 / e)}"${i % 2 ? ` stroke-dasharray="${f(3 / e)} ${f(11 / e)}"` : ''}/></g>`;
  });
  return s;
})();

// pino (gota) com a ponta em (x, y). q = quanto do "?" ainda aparece (1 = sem leitura, 0 = localizado)
function pino(x, y, o) {
  if (o.k <= 0.001) return '';
  const b = `<ellipse cx="0" cy="1" rx="12" ry="4.500" fill="${NOITE}" opacity=".45"/>`
    + `<g transform="rotate(${f(o.rot)})"><path d="M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z" fill="${o.cor}" stroke="${o.borda}" stroke-width="3.500"/>`
    + (o.q < 0.999 ? `<circle cx="0" cy="-42" r="${f(10.5 * (1 - o.q))}" fill="${C.white}"/>` : '')
    + (o.q > 0.001 ? txt('?', 0, -30.5, { w: 700, s: 32, c: C.white, a: 'middle', o: o.q }) : '') + `</g>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(PS * o.k)})">${b}</g>`;
}
// anel de leitura: disco de vidro, aro de luz, arco laranja girando, marcas e a lupa no centro
function anel(cx, cy, k, t) {
  if (k <= 0.001) return '';
  const R = 58, a = t * 2.4;
  const arco = (r, a0, a1) => `M${f(Math.cos(a0) * r)},${f(Math.sin(a0) * r)} A${r},${r} 0 0 1 ${f(Math.cos(a1) * r)},${f(Math.sin(a1) * r)}`;
  let marcas = '';
  for (let i = 0; i < 4; i++) { const g = i * Math.PI / 2; marcas += `M${f(Math.cos(g) * (R + 28))},${f(Math.sin(g) * (R + 28))} L${f(Math.cos(g) * (R + 42))},${f(Math.sin(g) * (R + 42))} `; }
  const corpo = `<circle r="${R + 40}" fill="url(#g-luz)" opacity=".16"/>`
    + `<circle r="${R}" fill="${C.navy}" opacity=".55"/><circle r="${R}" fill="${C.white}" opacity=".08"/>`
    + brilho(`<circle r="${R}" fill="none" stroke="${C.white}" stroke-width="5"/>`)
    + `<circle r="${R + 15}" fill="none" stroke="${C.blue40}" stroke-width="2" stroke-dasharray="3 11" opacity=".9" transform="rotate(${f(-t * 50)})"/>`
    + `<path d="${arco(R + 15, a, a + 1.25)}" fill="none" stroke="${C.orange}" stroke-width="5" stroke-linecap="round"/>`
    + `<path d="${arco(R + 15, a + Math.PI, a + Math.PI + 0.6)}" fill="none" stroke="${C.white}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`
    + `<path d="${marcas}" stroke="${C.white}" stroke-width="3" stroke-linecap="round" opacity=".75"/>`
    + icone('lupa', 2, 2, 52, { c: C.white, sw: 4.4 });
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(k)})">${corpo}</g>`;
}
// palavra que sobe por máscara (k: 0 -> 1)
function palavra(id, str, x, y, k, cor) {
  if (k <= 0.001) return '';
  if (k >= 0.999) return txt(str, x, y, { f: 'L', s: TS, c: cor, ls: TLS });
  const w = larg(str, TS, { f: 'L', ls: TLS });
  return `<clipPath id="${id}"><rect x="${f(x - 10)}" y="${f(y - TS * 0.94)}" width="${f(w + 30)}" height="${f(TS * 1.2)}"/></clipPath>`
    + `<g clip-path="url(#${id})">${txt(str, x, y + (1 - k) * TS * 1.02, { f: 'L', s: TS, c: cor, ls: TLS })}</g>`;
}
// contador da varredura: "PESSOAS LOCALIZADAS  18 de 25" + barra por marca (alinhado à direita em xr)
function leitura(xr, y, t, k, achados, porMarca, pronto) {
  if (k <= 0.001) return '';
  const rot = 'PESSOAS LOCALIZADAS', wr = larg(rot, 20, { w: 700, ls: 1.8 });
  const pisca = pronto >= 1 ? 1 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 16));
  let s = `<circle cx="${f(xr - wr - 16)}" cy="${f(y - 7)}" r="6" fill="${C.orange}" opacity="${f(pisca)}"/>`
    + txt(rot, xr, y, { w: 700, s: 20, ls: 1.8, c: C.blue40, a: 'end' });
  const wDe = larg('de ' + N, 34);
  s += txt('de ' + N, xr, y + 82, { s: 34, c: C.blue40, a: 'end' })
    + txt(String(achados).padStart(2, '0'), xr - wDe - 14, y + 82, { f: 'L', s: 84, c: C.white, a: 'end', ls: -2 });
  // barra por marca
  const bw = 300, bh = 10, gap = 5, by = y + 108, util = bw - gap * 4;
  let x = xr - bw;
  NIVEIS.forEach((nv, n) => {
    const w = util * CONT[n] / N, u = clamp(porMarca[n] / CONT[n]);
    s += `<rect x="${f(x)}" y="${by}" width="${f(w)}" height="${bh}" rx="5" fill="${C.white}" opacity=".12"/>`;
    if (u > 0) s += `<rect x="${f(x)}" y="${by}" width="${f(Math.max(bh, w * u))}" height="${bh}" rx="5" fill="${nv.cor}"${nv.cor === C.navy ? ` stroke="${C.white}" stroke-width="2"` : ''}/>`;
    x += w + gap;
  });
  return `<g opacity="${f(clamp(k))}" transform="translate(${f((1 - k) * 36)} 0)">${s}</g>`;
}

export function desenhar(t, ctx) {
  const { t0, m, wa } = ctx;
  const tSabe = m('voce_sabe'), tHoje = m('hoje2'), tNo = wa(145) - 0.07;
  const tQ = tHoje + 0.1;                                  // o "?" da pergunta pulsa (cedo: a cena acaba 0,6 s depois)
  // feixe de leitura: cruza o quadro em velocidade constante
  const tA = tSabe - 0.12, tB = tA + 1.66, X0 = -100, X1 = 1200;
  const bx = lerp(X0, X1, inv(tA, tB, t));
  const tScan = x => tA + (x - X0) / (X1 - X0) * (tB - tA);
  const varrendo = t > tA && t < tB;
  const by = 972 + 52 * Math.sin(bx / W * 5.2 + 0.5);

  let defs = `<linearGradient id="pg-topo" gradientUnits="userSpaceOnUse" x1="0" y1="${MY0}" x2="0" y2="${MY0 + 130}"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>`
    + `<mask id="pg-mask" maskUnits="userSpaceOnUse" x="-200" y="${MY0 - 20}" width="${W + 400}" height="${MYB - MY0 + 60}"><rect x="-200" y="${MY0 - 20}" width="${W + 400}" height="${MYB - MY0 + 60}" fill="url(#pg-topo)"/></mask>`
    + `<clipPath id="pg-lido"><rect x="-200" y="${MY0 - 40}" width="${f(clamp(bx + 200, 0, W + 400))}" height="${MYB}"/></clipPath>`
    + `<linearGradient id="pg-rastro" gradientUnits="userSpaceOnUse" x1="${f(bx - 260)}" y1="0" x2="${f(bx)}" y2="0"><stop offset="0" stop-color="${C.blue40}" stop-opacity="0"/><stop offset="1" stop-color="${C.blue40}" stop-opacity=".3"/></linearGradient>`;

  // ---------- relevo ----------
  const kMapa = fin(t, t0 + 0.04, 0.45);
  let mapa = `<g mask="url(#pg-mask)">` + opa(0.5 * kMapa, RELEVO) + (bx > X0 ? `<g clip-path="url(#pg-lido)" opacity=".75">${RELEVO}</g>` : '') + `</g>`;

  // ---------- estrada: linha de luz ----------
  const uE = ease.inOut(inv(t0 + 0.06, t0 + 0.9, t));
  if (uE > 0) {
    const d = G.d(0, uE);
    mapa += `<path d="${d}" fill="none" stroke="${C.blue}" stroke-opacity=".3" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${d}" fill="none" stroke="${NOITE}" stroke-opacity=".8" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${d}" fill="none" stroke="${C.blue40}" stroke-opacity=".6" stroke-width="3" stroke-dasharray="16 16" stroke-dashoffset="${f(-t * 30)}" stroke-linecap="round"/>`;
    if (bx > X0) mapa += `<g clip-path="url(#pg-lido)">`
      + `<path d="${d}" fill="none" stroke="${C.blue80}" stroke-opacity=".55" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${d}" fill="none" stroke="${C.navy}" stroke-width="37" stroke-linecap="round" stroke-linejoin="round"/>`
      + brilho(`<path d="${d}" fill="none" stroke="${C.white}" stroke-width="3.500" stroke-dasharray="16 16" stroke-dashoffset="${f(-t * 30)}" stroke-linecap="round"/>`) + `</g>`;
    // pulso de luz que percorre a estrada
    const up = (((t - t0 - 0.9) / 1.5) % 1 + 1) % 1, kp = t > t0 + 0.9 ? Math.sin(Math.PI * up) : 0;
    if (kp > 0.01) {
      const [px, py] = G.em(up);
      mapa += `<path d="${G.d(Math.max(0, up - 0.09), up)}" fill="none" stroke="${C.white}" stroke-width="6" stroke-linecap="round" opacity="${f(0.55 * kp)}"/>`
        + `<circle cx="${f(px)}" cy="${f(py)}" r="34" fill="url(#g-luz)" opacity="${f(0.9 * kp)}"/><circle cx="${f(px)}" cy="${f(py)}" r="6" fill="${C.white}" opacity="${f(kp)}"/>`;
    }
  }

  // ---------- pinos ----------
  let rastros = '', fx = '', achados = 0;
  const porMarca = [0, 0, 0, 0, 0], pouso = [9e9, 9e9, 9e9, 9e9, 9e9], pousados = [0, 0, 0, 0, 0];
  const itens = PINOS.map(p => {
    const ts = tScan(p.x), cor = NIVEIS[p.n].cor, luz = sobreNavy(cor);
    const tv = ts + 0.07, tp = tv + p.dur;                 // sai do lugar em tv, pousa em tp
    pouso[p.n] = Math.min(pouso[p.n], tp);
    if (t >= ts) { achados++; porMarca[p.n]++; }
    if (t >= tp - 0.04) pousados[p.n]++;
    const kIn = back(t, t0 + 0.12 + 0.36 * (p.x / W) + p.jit * 0.12, 0.4);
    const kc = fin(t, ts - 0.02, 0.16), u = inv(tv, tp, t), e = ease.inOut(u);
    const em = ee => { const a = Math.sin(Math.PI * ee) * p.dist * 0.13 * p.lado; return [lerp(p.x, p.vx, ee) + p.nx * a, lerp(p.y, p.vy, ee) + p.ny * a]; };
    let [x, y] = em(e);
    const solto = 1 - kc;
    y += 3.5 * Math.sin(t * 1.9 + p.ph) * solto + 1.4 * Math.sin(t * 2.2 + p.ph) * u;
    const rot = 8 * Math.sin(t * 2.6 + p.ph) * solto + 10 * Math.sin(Math.PI * u) * p.lado;
    const k = kIn * (1 + 0.26 * Math.sin(Math.PI * inv(ts - 0.02, ts + 0.3, t)) + 0.12 * Math.sin(Math.PI * u));
    // rastro do trajeto: cauda que afina e some
    if (u > 0 && u < 1) {
      const ks = Math.sin(Math.PI * u);
      let [ax, ay] = em(Math.max(0, e - 0.34));
      for (let i = 1; i <= 6; i++) {
        const [qx, qy] = em(Math.max(0, e - 0.34 + 0.055 * i));
        rastros += `<path d="M${f(ax)},${f(ay - 22)} L${f(qx)},${f(qy - 22)}" stroke="${luz}" stroke-width="${f(1 + 0.75 * i)}" stroke-linecap="round" opacity="${f((0.06 + 0.11 * i) * ks)}"/>`;
        ax = qx; ay = qy;
      }
    }
    fx += onda(x, y - 31, t - ts, { r0: 16, r1: 22, d: 0.4, c: luz, sw: 4 }) + onda(p.vx, p.vy - 30, t - tp, { r0: 14, r1: 14, d: 0.35, c: luz, sw: 3 });
    return { y, svg: pino(x, y, { k, rot, cor: mix(CINZA, cor, kc), borda: mix(C.navy40, C.white, kc), q: 1 - fin(t, ts, 0.18) }) };
  }).sort((a, b) => a.y - b.y);

  // ---------- estações: nascem em fio de arame (apagadas) e ganham cor quando o primeiro pino pousa ----------
  let estacoes = '', fichas = '';
  NIVEIS.forEach((nv, n) => {
    const tn = t0 + 0.14 + 0.7 * G.uEst[n], uN = inv(tn, tn + 0.45, t);
    if (uN <= 0) return;
    const aceso = fin(t, pouso[n] - 0.05, 0.25), pulso = Math.sin(Math.PI * inv(pouso[n] - 0.04, pouso[n] + 0.36, t));
    const [ex, ey] = G.est(n), une = [0, 0, 0, 0, 0], luz = sobreNavy(nv.cor);
    une[n] = uN;
    if (aceso > 0) estacoes += `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(96 + 20 * pulso)}" fill="url(#${n < 2 ? 'g-laranja' : 'g-azul'})" opacity="${f(aceso * (0.75 + 0.25 * Math.sin(t * 3 + n)))}"/>`;
    const px = ex + RE * 0.62, fy = ey - RE - 48, bal = Math.sin(t * 4 + n) * 4;
    const band = `M${f(px)},${f(fy)} q16,${f(-6 + bal)} 34,4 q-16,${f(8 - bal)} -34,16Z`, haste = `M${f(px)},${f(ey - RE * 0.5)} V${f(fy)}`;
    // apagada: disco escuro com aro e ícone em azul claro, bandeira só no contorno
    if (aceso < 0.999) {
      const arame = `<circle cx="${f(ex)}" cy="${f(ey)}" r="${RE}" fill="#0B3554" stroke="${C.blue80}" stroke-width="3"/>`
        + `<circle cx="${f(ex)}" cy="${f(ey)}" r="${RE + 9}" fill="none" stroke="${C.blue40}" stroke-width="1.5" stroke-dasharray="3 9" opacity=".7" transform="rotate(${f(t * 14 + n * 30)} ${f(ex)} ${f(ey)})"/>`
        + icone(nv.ic, ex, ey, RE * 1.12, { c: C.blue40, sw: 3, u: clamp(uN * 1.5 - 0.3) })
        + opa(inv(0.75, 1, uN), `<path d="${haste}" stroke="${C.blue80}" stroke-width="4" stroke-linecap="round"/><path d="${band}" fill="#0B3554" stroke="${C.blue80}" stroke-width="2.500" stroke-linejoin="round"/>`);
      estacoes += opa(0.78 * (1 - aceso), pop(ease.back(clamp(uN)), ex, ey, arame));
    }
    // acesa: a estação do componente; o mastro e o contorno da bandeira dele são navy e somem no fundo noturno, então
    // são redesenhados em claro por cima
    if (aceso > 0.001) {
      const mastro = `<path d="${haste}" stroke="${C.navy20}" stroke-width="4.500" stroke-linecap="round"/><path d="${band}" fill="${nv.cor}" stroke="${C.navy20}" stroke-width="2.500" stroke-linejoin="round"/>`;
      estacoes += opa(aceso, pop(1 + 0.18 * pulso, ex, ey, mapaTrilha(G, { u: 0, uEst: [1, 1, 1, 1, 1].map((v, i) => (i === n ? 1 : 0)), terreno: false, rotulos: false, rEst: RE, t }) + mastro));
    }
    fx += onda(ex, ey, t - pouso[n] + 0.02, { r0: 46, r1: 40, d: 0.5, c: luz, sw: 5 })
      + onda(ex, ey, t - tQ - 0.03 - 0.045 * n, { r0: 46, r1: 34, d: 0.45, c: luz, sw: 4 });   // resposta ao "?" da pergunta
    // ficha da estação: nome da marca e quantas pessoas já chegaram (conta com os pousos)
    const kF = back(t, pouso[n] + 0.06, 0.38);
    if (kF > 0.001) {
      const nome = nv.rot.toUpperCase(), num = String(pousados[n]);
      const wn = larg(nome, 20, { w: 700, ls: 1.4 }), wq = larg(num, 24, { w: 700 }), w = 30 + wn + 12 + wq + 16, h = 36;
      const cxF = ex + FDX[n], x0 = cxF - w / 2, y0 = ey + RE + 15 + FDY[n];
      fichas += pop(kF, cxF, y0 + h / 2, `<rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${h}" rx="${h / 2}" fill="${NOITE}" fill-opacity=".86" stroke="${luz}" stroke-opacity=".75" stroke-width="1.500"/>`
        + `<circle cx="${f(x0 + 17)}" cy="${f(y0 + h / 2)}" r="5.500" fill="${nv.cor}"${nv.cor === C.navy ? ` stroke="${C.white}" stroke-width="1.500"` : ''}/>`
        + txt(nome, x0 + 30, y0 + 25, { w: 700, s: 20, ls: 1.4, c: C.blue20 })
        + txt(num, x0 + w - 16, y0 + 26.5, { w: 700, s: 24, c: C.white, a: 'end' }));
    }
  });

  // ---------- feixe de leitura ----------
  let feixe = '';
  if (varrendo) {
    const kF = Math.min(fin(t, tA, 0.2), 1);
    let ticks = '';
    for (let y = 646; y < MYB; y += 54) ticks += `M${f(bx)},${y} h${(y - 646) % 108 ? 9 : 18} `;
    feixe = `<g mask="url(#pg-mask)" opacity="${f(kF)}">`
      + `<rect x="${f(bx - 260)}" y="${MY0}" width="260" height="${MYB - MY0}" fill="url(#pg-rastro)"/>`
      + `<rect x="${f(bx - 7)}" y="${MY0}" width="14" height="${MYB - MY0}" fill="${C.white}" opacity=".16"/>`
      + `<rect x="${f(bx - 1.5)}" y="${MY0}" width="3" height="${MYB - MY0}" fill="${C.white}"/>`
      + `<path d="${ticks}" stroke="${C.white}" stroke-width="2.500" opacity=".7"/></g>`
      + anel(bx, by, back(t, tA, 0.3), t);
  }

  // ---------- contador ----------
  const painel = leitura(W - MG, 416, t, ease.out(inv(tA + 0.05, tA + 0.5, t)), achados, porMarca, inv(tScan(PINOS[N - 1].x), tScan(PINOS[N - 1].x) + 0.01, t));

  // ---------- tipografia ----------
  let texto = fio(MG, 140, inv(tNo - 0.3, tNo + 0.2, t)), atras = '';
  const esp = larg(' ', TS, { f: 'L' }) + TLS;
  LINHAS.forEach((ln, li) => {
    let x = MG;
    const y = TY + li * LH;
    ln.forEach(([w, wi, hi]) => {
      const tw = wa(wi) - (li === 3 ? 0.12 : 0.07), k = ease.out5(inv(tw, tw + 0.5, t));
      texto += palavra(`pg-w${wi}`, w, x, y, k, hi ? C.orange : C.white);
      x += larg(w, TS, { f: 'L', ls: TLS });
      if (wi === 154) {
        // o "?" final: sobe com "hoje", bate em laranja e solta uma onda de luz
        x += 1;
        const wq = larg('?', TS, { f: 'L' }), cx = x + wq / 2 - 1, cy = y - TS * 0.36;
        const bate = inv(tQ, tQ + 0.07, t) * (1 - ease.elastic(inv(tQ + 0.07, tQ + 0.7, t)));
        const respira = 0.04 * Math.sin((t - tQ) * 5.5) * fin(t, tQ + 0.5, 0.3);
        const kg = fin(t, tQ - 0.05, 0.2);
        // halo que respira + onda de luz suave que se expande (sem traço duro: nada risca as palavras); os anéis de onda()
        // ficam no mapa, onde as cinco estações respondem em cascata
        const uO = inv(tQ, tQ + 0.6, t), xh = x - larg(w, TS, { f: 'L', ls: TLS }) - 1;
        atras += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(120 + 30 * bate)}" fill="url(#g-laranja)" opacity="${f(kg * (0.55 + 0.35 * Math.sin((t - tQ) * 5.5)))}"/>`
          + (uO > 0 && uO < 1 ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(90 + 200 * ease.out(uO))}" fill="url(#g-laranja)" opacity="${f(1 - uO)}"/>` : '');
        // fio laranja que se desenha sob "hoje?"
        texto += fio(xh, y + 20, inv(tQ - 0.04, tQ + 0.34, t), x + wq - xh, 5);
        texto += pop(1 + 0.3 * bate + respira, cx, cy, palavra('pg-wq', '?', x, y, ease.out5(inv(tw + 0.05, tw + 0.36, t)), C.orange));
      }
      x += esp;
    });
  });

  // ---------- câmera em dois planos ----------
  // plano do mapa: a cena abre enquadrada no mapa (ele ocupa o palco enquanto a fala ainda não começou) e a câmera desce
  // e recua até o enquadramento final, abrindo espaço para a pergunta; termina antes da 3ª linha entrar
  const soco = 0.014 * Math.sin(Math.PI * inv(tQ, tQ + 0.4, t));
  const eC = ease.inOut(inv(t0 + 0.3, tSabe + 0.72, t));
  const plMapa = camera(mapa + estacoes + rastros + itens.map(p => p.svg).join('') + fichas + fx + feixe, { z: lerp(1.12, 1, eC) + soco, cx: W / 2, cy: H / 2, dy: lerp(-243, 0, eC) });
  // plano da tipografia: só um recuo leve, com o pivô na margem esquerda (o texto não sai da margem)
  const zT = lerp(1.035, 1, ease.out(inv(tNo, tNo + 1.8, t))) + soco;
  const plTexto = camera(painel + atras + texto, { z: zT, cx: MG, cy: 360, dx: MG - W / 2, dy: 360 - H / 2 });
  return fundoNoite(t, { seed: 21 }) + `<defs>${defs}</defs>` + plMapa + plTexto;
}
