// Cena "regua" (32,30–41,96 s): "Esses sinais mostram onde ela está hoje na régua de adoção: resiste, observa,
// experimenta, adota, ou multiplica."
// A RÉGUA DE ADOÇÃO vira a ESTRADA do mapa. A câmera começa fechada na parte de baixo do mapa e abre enquanto a
// estrada se desenha de baixo para cima, com a graduação de uma régua na margem e cinco marcos numerados à espera.
// No canto, dois cartões de interface guardam "os sinais" de cada pessoa (avatar + mini radar). Em 'esses_sinais'
// os radares pulsam e o pino de cada pessoa sai do cartão, pousa no começo da estrada e a percorre com um rastro
// de luz. Em cada 'nivelN' a estação nasce com overshoot e bandeira e o cartão-legenda troca para o nome da marca
// e a definição. O pino B para em Observa; o pino A segue e para em Adota. Cada parada ganha onda e etiqueta.
// Sem personagens: pessoas são discos com ícone e pinos com a letra A ou B.
import { W, H, MG, C, txt, larg, fin, back, sobe, pop, opa, onda, particulas, pilula, rotulo, icone, disco, titulo, clamp, lerp, inv, ease, n2 } from '../base.js';
import { NIVEIS, HEROIS, nivelDe, radar, pontoRadar, avatar } from '../modelo.js';
import { fundoVivo, sombra, geoTrilha, mapaTrilha, pinoMapa } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const CHIP = '02 · A régua';
export const LEGENDA = true;

// ---------- geometria ----------
const TS = 62, TY = 196, TLH = TS * 1.12;                        // título
const G = geoTrilha(72, 350, 936, 760);                          // o mapa de trilha (o mesmo da cena seguinte)
const AVISO = 'Retrato do momento, neste projeto. Não é avaliação de desempenho.';
const NB = nivelDe(HEROIS.B.sinais), NA = nivelDe(HEROIS.A.sinais);   // Observa (1) e Adota (3)
const SP = 1;                                                    // escala dos pinos A e B no mapa

// cartões "os sinais" (canto superior esquerdo do palco): avatar + mini radar de cada pessoa
const CARD = { x: 84, w: 300, h: 112 };
const LIN = [
  { id: 'B', h: HEROIS.B, n: NB, y: 360, fundo: C.orange20, luz: C.orange },
  { id: 'A', h: HEROIS.A, n: NA, y: 482, fundo: C.blue20, luz: '#DCE9F5' },
];
const AVX = CARD.x + 48, RADX = CARD.x + CARD.w - 60, RADR = 46;

// contorno da ilha (o mesmo desenho de mapaTrilha), para recortar a varredura de luz da abertura
const ILHA = `M${f(G.x - 10)},${f(G.y + G.h * 0.62)} C${f(G.x - 30)},${f(G.y + G.h * 0.2)} ${f(G.x + G.w * 0.2)},${f(G.y - 10)} ${f(G.x + G.w * 0.52)},${f(G.y + G.h * 0.03)}`
  + ` C${f(G.x + G.w * 0.8)},${f(G.y - 30)} ${f(G.x + G.w + 26)},${f(G.y + G.h * 0.1)} ${f(G.x + G.w + 14)},${f(G.y + G.h * 0.46)}`
  + ` C${f(G.x + G.w + 30)},${f(G.y + G.h * 0.8)} ${f(G.x + G.w * 0.86)},${f(G.y + G.h + 16)} ${f(G.x + G.w * 0.5)},${f(G.y + G.h + 4)}`
  + ` C${f(G.x + G.w * 0.2)},${f(G.y + G.h + 20)} ${f(G.x + 6)},${f(G.y + G.h + 4)} ${f(G.x - 10)},${f(G.y + G.h * 0.62)}Z`;
// rótulo de cada estação fora de foco (a mesma conta de mapaTrilha), para o fundo opaco de quem recua
const ROT = NIVEIS.map((n, i) => {
  const [ex, ey] = G.est(i), wl = larg(n.rot, 26, { w: 700 }) + 30, lado = [1, 1, -1, 1, -1][i];
  return { x: ex + lado * 58 + (lado < 0 ? -wl : 0), y: ey + (i === 1 ? 26 : -18), w: wl, h: 42 };
});

// percurso de cada pino: pousa em U0, anda até U1. O pino A deixa a estrada em U1 e salta para o lado da estação
// Adota; o pino B para na estrada, logo antes de Observa. São os mesmos lugares dos pinos no Mapa de Adoção.
const UA0 = 0.045, UA1 = 0.62, UB0 = 0.008, UBM = 0.172, UB1 = 0.20;
const PA = G.vaga(NA, 0, 4);                                     // (406, 681): ao lado de Adota
const PB = G.em(UB1);                                            // (398, 941): antes de Observa

// ---------- ajudantes de movimento ----------
const invInOut = p => (p < 0.5 ? Math.cbrt(p / 4) : 1 - Math.cbrt(2 * (1 - p)) / 2);   // inverso de ease.inOut
const bat = (t, a, d) => Math.sin(Math.PI * inv(a, a + d, t));                           // batida 0 -> 1 -> 0
// perfil de velocidade em trapézio: acelera, cruza em velocidade constante, freia
const trap = (p, a = 0.12) => (p <= 0 ? 0 : p >= 1 ? 1 : p < a ? p * p / (2 * a * (1 - a)) : p > 1 - a ? 1 - (1 - p) * (1 - p) / (2 * a * (1 - a)) : (p - a / 2) / (1 - a));

// câmera: fechada na parte de baixo do mapa (z 1,25) e abrindo até 1,0 enquanto a estrada sobe
function camEm(t, T) {
  const u = ease.inOut(inv(T.tSinais - 0.15, T.tRegua + 0.3, t));
  let z = lerp(1.25, 1, u) + 0.04 * (1 - ease.out(inv(T.t0, T.tSinais, t))) + 0.028 * ease.inOut(inv(T.tRegua + 0.3, T.t1 + 0.2, t));
  for (const a of T.tN) z += 0.012 * bat(t, a, 0.4);
  return { u, z, cx: lerp(404, 540, u), cy: lerp(905, 750, u), ax: 540, ay: lerp(882, 750, u), r: lerp(-1.6, 0, u) };
}
// ponto do mapa -> ponto do quadro
function proj(x, y, c) {
  const a = c.r * Math.PI / 180, dx = (x - c.cx) * c.z, dy = (y - c.cy) * c.z;
  return [c.ax + dx * Math.cos(a) - dy * Math.sin(a), c.ay + dx * Math.sin(a) + dy * Math.cos(a)];
}
// trecho curto da estrada entre u0 e u1
function trecho(u0, u1, n = 8) {
  let d = '';
  for (let k = 0; k <= n; k++) { const [x, y] = G.em(lerp(u0, u1, k / n)); d += (k ? 'L' : 'M') + f(x) + ',' + f(y) + ' '; }
  return d;
}
// rastro de luz: cauda de cometa contínua (polígono afilado ao longo da estrada) atrás do ponto u
function cauda(u, comp, w0, n = 14) {
  const L = [], R = [];
  for (let k = 0; k <= n; k++) {
    const q = k / n, [x, y, a] = G.em(Math.max(0, u - comp * (1 - q)));
    const hw = 0.6 + w0 / 2 * Math.pow(q, 1.25), nx = Math.sin(a), ny = -Math.cos(a);
    L.push(f(x + nx * hw) + ',' + f(y + ny * hw));
    R.push(f(x - nx * hw) + ',' + f(y - ny * hw));
  }
  return 'M' + L.join(' L') + ' L' + R.reverse().join(' L') + 'Z';
}
function rastro(u, comp, cor, alpha, w0 = 15) {
  if (alpha <= 0.01 || comp <= 0.002) return '';
  const [hx, hy] = G.em(u);
  return `<path d="${cauda(u, comp, w0)}" fill="${cor}" opacity="${f(alpha * 0.42)}"/>`
    + `<path d="${cauda(u, comp * 0.55, w0 * 0.62)}" fill="${cor}" opacity="${f(alpha * 0.85)}"/>`
    + `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(w0 / 2)}" fill="${cor}" opacity="${f(alpha * 0.42)}"/>`;
}
// graduação de régua na margem da estrada, visível até onde a estrada já foi desenhada
function graduacao(ue) {
  let d1 = '', d2 = '';
  const n = 70;
  for (let k = 1; k < n; k++) {
    const u = k / n;
    if (u > ue - 0.006) break;
    const [x, y, a] = G.em(u), nx = Math.sin(a), ny = -Math.cos(a), g = k % 5 === 0;
    const seg = `M${f(x + nx * 33)},${f(y + ny * 33)} L${f(x + nx * (g ? 50 : 42))},${f(y + ny * (g ? 50 : 42))} `;
    if (g) d2 += seg; else d1 += seg;
  }
  return (d1 ? `<path d="${d1}" stroke="${C.navy40}" stroke-width="2.2" stroke-linecap="round"/>` : '')
    + (d2 ? `<path d="${d2}" stroke="${C.navy80}" stroke-width="3" stroke-linecap="round"/>` : '');
}
// etiqueta de parada: pílula navy com ponto na cor da pessoa. (x, y) = ponta do ponteiro; lado 'cima' ou 'esq'
function etiquetaParada(x, y, str, cor, k, lado) {
  if (k <= 0.001) return '';
  const s = 22, wt = larg(str, s, { w: 700 }), w = wt + 52, h = 40;
  let px, py, seta;
  if (lado === 'cima') { px = x - w * 0.62; py = y - 10 - h; seta = `M${f(x - 9)},${f(y - 11)} L${f(x)},${f(y)} L${f(x + 9)},${f(y - 11)}Z`; }
  else { px = x - 10 - w; py = y - h / 2; seta = `M${f(x - 11)},${f(y - 9)} L${f(x)},${f(y)} L${f(x - 11)},${f(y + 9)}Z`; }
  return pop(k, x, y, `<path d="${seta}" fill="${C.navy}"/>` + pilula(px, py, w, h, C.navy, { stroke: C.white, sw: 2.5 })
    + `<path d="${seta}" fill="${C.navy}"/>`
    + `<circle cx="${f(px + 22)}" cy="${f(py + h / 2)}" r="7.5" fill="${cor}" stroke="${C.white}" stroke-width="2"/>`
    + txt(str, px + 38, py + h / 2 + 7.5, { w: 700, s, c: C.white }));
}

// ---------- os pinos ----------
// estado do pino A: voa do cartão, pousa, percorre a estrada e salta para o lado de Adota
function pinoA(t, T) {
  const u = UA0 + (UA1 - UA0) * trap(inv(T.tA0, T.tA1, t), 0.1);
  const [rx, ry] = G.em(u), [sx, sy] = G.em(UA1);
  const k = inv(T.tA1, T.tAp, t), q = ease.inOut(k);
  const x = k > 0 ? lerp(sx, PA[0], q) : rx, y = k > 0 ? lerp(sy, PA[1], q) : ry;
  const hop = 56 * Math.sin(Math.PI * Math.pow(k, 0.75)) + 12 * bat(t, T.tA0, 0.22) + 14 * bat(t, T.tAp + 0.02, 0.2) + 12 * bat(t, T.tFim + 0.06, 0.24);
  const vel = t > T.tA0 && t < T.tA1 ? 1 : 0;
  return { x, y, u, hop, comp: 0.1 * Math.min(fin(t, T.tA0 + 0.1, 0.5), 1 - fin(t, T.tA1 - 0.35, 0.35)) * vel };
}
// estado do pino B: voa do cartão, pousa, passa de Resiste, hesita e avança devagar até parar antes de Observa
function pinoB(t, T) {
  const k1 = trap(inv(T.tB0, T.tBm, t), 0.16), k2 = ease.inOut(inv(T.tBm + 0.12, T.tB1, t));
  const u = UB0 + (UBM - UB0) * k1 + (UB1 - UBM) * k2;
  const [x, y] = G.em(u);
  const hop = 12 * bat(t, T.tB0, 0.22) + 20 * bat(t, T.tB1 + 0.02, 0.26) + 12 * bat(t, T.tFim + 0.14, 0.24);
  const vel = t > T.tB0 && t < T.tB1 ? 1 : 0;
  return { x, y, u, hop, comp: 0.04 * Math.min(fin(t, T.tB0 + 0.1, 0.5), 1 - fin(t, T.tBm - 0.5, 0.5)) * vel };
}

// ---------- cartões "os sinais" ----------
function cartoesSinais(t, T) {
  let s = '';
  LIN.forEach((p, j) => {
    const ta = T.t0 + 0.14 + j * 0.1, k = back(t, ta, 0.46);
    if (k <= 0.001) return;
    const x = CARD.x, y = p.y, cy = y + CARD.h / 2, tp = T.tPara[j] + 0.18, parou = fin(t, tp, 0.3);
    const pulso = bat(t, T.tSinais - 0.06 + j * 0.1, 0.42);
    let c = sombra(`<rect x="${x}" y="${y}" width="${CARD.w}" height="${CARD.h}" rx="18" fill="${C.white}"/>`, true);
    // moldura que acende em "esses sinais" e quando a pessoa é posicionada
    const ac = Math.max(pulso, bat(t, tp, 0.4));
    if (ac > 0.01) c += `<rect x="${x}" y="${y}" width="${CARD.w}" height="${CARD.h}" rx="18" fill="none" stroke="${ac === pulso ? p.h.cor : NIVEIS[p.n].cor}" stroke-width="4" opacity="${f(ac)}"/>`;
    // avatar anônimo com anel na cor da pessoa
    c += avatar(AVX, cy, { r: 30, cor: p.fundo, anel: p.h.cor, asw: 3.5, k: back(t, ta + 0.1, 0.4), u: inv(ta + 0.15, ta + 0.75, t), sw: 2.8 });
    c += rotulo('Pessoa ' + p.id, x + 92, cy - 9, { s: 20 });
    // linha de estado: "5 sinais" vira a marca da régua quando o pino para
    if (parou < 0.4) c += `<g opacity="${f(clamp(inv(ta + 0.25, ta + 0.6, t)) * clamp(1 - parou * 2.5))}" transform="translate(0 ${f(-10 * parou)})">` + txt('5 sinais', x + 92, cy + 21, { s: 22, c: C.navy80 }) + `</g>`;
    if (parou > 0.45) c += `<g opacity="${f(clamp((parou - 0.45) / 0.55))}" transform="translate(0 ${f(12 * (1 - parou))})"><circle cx="${f(x + 100)}" cy="${f(cy + 14)}" r="8" fill="${NIVEIS[p.n].cor}"/>` + txt(NIVEIS[p.n].rot, x + 116, cy + 21.5, { w: 700, s: 22 }) + `</g>`;
    // mini radar: a grade se desenha, os cinco sinais crescem em cascata e pulsam em "esses sinais"
    const tr = ta + 0.1, ry = cy + 4;
    let r = radar({ cx: RADX, cy: ry, R: RADR, valores: p.h.sinais, cor: p.h.cor, rotulos: 'nada', uGrade: inv(tr, tr + 0.34, t), uEixo: [0, 1, 2, 3, 4].map(i => inv(tr + 0.14 + i * 0.05, tr + 0.46 + i * 0.05, t)) });
    for (let i = 0; i < 5; i++) {
      const [vx, vy] = pontoRadar(RADX, ry, RADR, i, p.h.sinais[i]);
      r += onda(vx, vy, t - (T.tSinais - 0.04 + j * 0.1 + i * 0.06), { c: C.orange, r0: 5, r1: 11, sw: 2.5, d: 0.45 });
    }
    c += pop(1 + 0.09 * pulso + 0.012 * Math.sin(t * 2.4 + j * 1.9), RADX, ry, r);
    const kk = Math.min(1, k);
    s += `<g opacity="${f(clamp(k * 1.5))}" transform="translate(${f((1 - k) * -90)} 0) rotate(${f((1 - kk) * -5)} ${f(x)} ${f(cy)})">${c}</g>`;
  });
  return s;
}

// ---------- cartão-legenda: entra em "régua" e troca de conteúdo a cada marca dita ----------
const DEFW = Math.max(...NIVEIS.map(n => larg(n.def, 24)), larg('cinco marcas pelo caminho', 24));
const LEG = { w: Math.round(112 + DEFW + 28), h: 116, y: 1004 };
LEG.x = 1008 - LEG.w;
function cartaoLegenda(t, T) {
  const k = back(t, T.tRegua - 0.02, 0.5);
  if (k <= 0.001) return '';
  const tS = [T.tRegua - 0.02, ...T.tN];
  let bate = 0, corpo = '', barra = '';
  tS.forEach((ta, j) => {
    if (j) bate = Math.max(bate, bat(t, ta, 0.3));
    const kin = j ? back(t, ta, 0.36) : fin(t, ta + 0.14, 0.3), kout = j < 5 ? fin(t, tS[j + 1] - 0.1, 0.11) : 0;
    const n = j ? NIVEIS[j - 1] : null;
    if (kin > 0.001) barra += `<rect x="${LEG.x}" y="${f(LEG.y + LEG.h * (1 - Math.min(1, fin(t, ta, 0.25))))}" width="12" height="${LEG.h}" fill="${n ? n.cor : C.navy40}"/>`;
    const o = clamp(kin * 1.8) * (1 - kout);
    if (o <= 0.001) return;
    const c = disco(n ? n.ic : 'regua', LEG.x + 62, LEG.y + 56, 31, { fundo: n ? n.cor : C.blue20, c: n ? n.tx : C.navy, u: inv(ta + 0.02, ta + 0.5, t), k: Math.max(0.001, j ? back(t, ta, 0.4) : 1) })
      + txt(n ? n.rot : 'Régua de adoção', LEG.x + 112, LEG.y + 46, { w: 700, s: 30 })
      + txt(n ? n.def : 'cinco marcas pelo caminho', LEG.x + 112, LEG.y + 76, { s: 24, c: C.navy80 })
      + txt(j ? j + ' / 5' : '', LEG.x + LEG.w - 20, LEG.y + 43, { w: 700, s: 20, c: C.navy40, a: 'end' });
    corpo += `<g opacity="${f(o)}" transform="translate(0 ${f((1 - Math.min(1, kin)) * 16 - kout * 12)})">${c}</g>`;
  });
  // passos: as cinco marcas, na cor de cada uma, acendem conforme são ditas
  let passos = '';
  const pw = (DEFW - 4 * 8) / 5;
  for (let i = 0; i < 5; i++) {
    const on = fin(t, T.tN[i], 0.2), atual = on * (1 - (i < 4 ? fin(t, T.tN[i + 1], 0.2) : fin(t, T.tFim, 0.25)));
    const h = 7 + 4 * atual, px = LEG.x + 112 + i * (pw + 8);
    passos += `<rect x="${f(px)}" y="${f(LEG.y + 98 - h / 2)}" width="${f(pw)}" height="${f(h)}" rx="${f(h / 2)}" fill="${C.gray}"/>`
      + (on > 0.001 ? `<rect x="${f(px)}" y="${f(LEG.y + 98 - h / 2)}" width="${f(pw * on)}" height="${f(h)}" rx="${f(h / 2)}" fill="${NIVEIS[i].cor}"/>` : '');
  }
  const base = sombra(`<rect x="${LEG.x}" y="${LEG.y}" width="${LEG.w}" height="${LEG.h}" rx="18" fill="${C.white}"/>`, true);
  const clip = `<clipPath id="rg-leg"><rect x="${LEG.x}" y="${LEG.y}" width="${LEG.w}" height="${LEG.h}" rx="18"/></clipPath>`;
  const kk = Math.min(1, k);
  return `<g opacity="${f(clamp(k * 1.6))}" transform="translate(${f((1 - k) * 110)} 0) rotate(${f((1 - kk) * 4)} ${f(LEG.x + LEG.w)} ${f(LEG.y + LEG.h / 2)})">`
    + pop(1 + 0.035 * bate, LEG.x + LEG.w / 2, LEG.y + LEG.h / 2, base + clip + `<g clip-path="url(#rg-leg)">${barra}${corpo}${passos}</g>`) + `</g>`;
}

export function desenhar(t, ctx) {
  const { t0, t1, m } = ctx;
  const tSinais = m('esses_sinais'), tHoje = m('hoje'), tRegua = m('regua');
  const tN = [1, 2, 3, 4, 5].map(n => m('nivel' + n) - 0.06);      // cada estação nasce um pouco antes da palavra
  const tFim = m('nivel5') + 0.26;                                 // fecho: as quatro primeiras voltam a 100% (Multiplica segue em foco)
  const T = {
    t0, t1, tSinais, tHoje, tRegua, tN, tFim,
    tVooA: tSinais + 0.16, tA0: tSinais + 0.82, tA1: tN[3] + 0.02, tAp: tN[3] + 0.44,   // pino A: voa, pousa, anda, salta para Adota
    tVooB: tSinais + 0.34, tB0: tSinais + 1.0, tBm: tN[0] - 0.2, tB1: m('nivel2') + 0.12,                 // pino B: voa, pousa, anda, para em Observa
  };
  T.tPara = [T.tB1, T.tAp];
  const cam = camEm(t, T);
  let s = fundoVivo(t, { seed: 12 });

  // ---------- o mapa: ilha, estrada, graduação, marcos, estações ----------
  const uRoad = inv(tSinais, tRegua, t), ue = ease.inOut(uRoad);
  let rota = '';
  let mp = mapaTrilha(G, { u: 0, uEst: [0, 0, 0, 0, 0], uTerreno: inv(t0 + 0.1, t0 + 0.9, t), t });
  // abertura: uma faixa de luz varre o terreno (leitura do mapa), recortada no contorno da ilha
  {
    const u = inv(t0 + 0.3, t0 + 1.25, t);
    if (u > 0 && u < 1) {
      const x = lerp(-380, 1180, ease.inOut(u)), o = Math.sin(u * Math.PI);
      const faixa = (dx, w) => `M${f(x + dx)},${G.y + G.h + 60} L${f(x + dx + 300)},${G.y - 60} L${f(x + dx + 300 + w)},${G.y - 60} L${f(x + dx + w)},${G.y + G.h + 60}Z`;
      mp += `<clipPath id="rg-ilha"><path d="${ILHA}"/></clipPath><g clip-path="url(#rg-ilha)">`
        + `<path d="${faixa(0, 230)}" fill="${C.white}" opacity="${f(0.16 * o)}"/><path d="${faixa(110, 120)}" fill="${C.white}" opacity="${f(0.2 * o)}"/>`
        + `<path d="${faixa(230, 5)}" fill="${C.white}" opacity="${f(0.9 * o)}"/></g>`;
    }
  }
  // rota planejada: um tracejado fino antecipa o caminho antes de a estrada ser desenhada por cima
  {
    const up = ease.inOut(inv(t0 + 0.3, tSinais + 0.5, t));
    if (up > 0 && uRoad < 1) {
      const [hx, hy] = G.em(up);
      rota = `<path d="${trecho(0, up, 60)}" fill="none" stroke="${C.navy40}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="3 12"/>`
        + (up < 0.999 ? `<circle cx="${f(hx)}" cy="${f(hy)}" r="7" fill="${C.white}" stroke="${C.navy40}" stroke-width="3"/>` : '');
    }
  }
  // graduação de régua: nasce com a estrada e recua quando as estações assumem
  mp += rota + mapaTrilha(G, { terreno: false, u: uRoad, uEst: [0, 0, 0, 0, 0], t });
  mp += opa(lerp(0.9, 0.5, fin(t, tN[0], 0.5)), graduacao(ue));
  // "na régua de adoção": um brilho corre a estrada de ponta a ponta
  {
    const u = inv(tRegua - 0.05, tRegua + 0.8, t);
    if (u > 0 && u < 1) {
      const c = ease.inOut(u), o = Math.sin(Math.PI * Math.min(1, u * 1.15)), [hx, hy] = G.em(c);
      mp += rastro(c, Math.min(c, 0.2), C.white, 0.8 * o, 30) + `<circle cx="${f(hx)}" cy="${f(hy)}" r="8" fill="${C.white}" opacity="${f(o)}"/>`;
    }
  }
  // a cada marca dita, um pulso de luz corre a estrada desde a estação anterior e acende a próxima
  for (let i = 0; i < 5; i++) {
    const k = inv(tN[i] - 0.36, tN[i] + 0.02, t);
    if (k <= 0 || k >= 1) continue;
    const ua = i ? G.uEst[i - 1] : 0.012, u = lerp(ua, G.uEst[i], ease.inOut(k)), [hx, hy] = G.em(u), o = Math.sin(Math.PI * Math.min(1, k * 1.25));
    mp += rastro(u, Math.min(0.075, u - ua), C.orange, o, 20)
      + `<circle cx="${f(hx)}" cy="${f(hy)}" r="7" fill="${C.white}" opacity="${f(o)}"/>`;
  }
  // marcos numerados: aparecem quando a ponta da estrada passa e esperam a estação
  for (let i = 0; i < 5; i++) {
    const tv = tSinais + invInOut(G.uEst[i]) * (tRegua - tSinais) + 0.02;
    const k = back(t, tv, 0.4) * (1 - fin(t, tN[i] - 0.02, 0.2));
    if (k <= 0.001) continue;
    const [ex, ey] = G.est(i), bt = bat(t, tRegua - 0.04 + i * 0.08, 0.34);
    mp += pop(k * (1 + 0.14 * bt), ex, ey, `<circle cx="${f(ex)}" cy="${f(ey)}" r="33" fill="${C.white}" stroke="${C.navy40}" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 9" transform="rotate(${f(t * 24 + i * 30)} ${f(ex)} ${f(ey)})"/>`
      + txt(String(i + 1), ex, ey + 9, { w: 700, s: 26, c: C.navy80, a: 'middle' }));
  }
  // ponta que desenha a estrada: disco aceso com cauda de luz
  if (ue > 0 && ue < 0.998) {
    const [px, py] = G.em(ue);
    mp += rastro(ue, 0.1, C.orange, 0.85, 22)
      + `<circle cx="${f(px)}" cy="${f(py)}" r="${f(27 + 4 * Math.sin(t * 14))}" fill="${C.orange}" opacity=".3"/><circle cx="${f(px)}" cy="${f(py)}" r="12" fill="${C.white}" stroke="${C.orange}" stroke-width="6"/>`;
  }
  { const [fx, fy] = G.em(1); mp += onda(fx - 24, fy + 12, t - tRegua + 0.02, { c: C.orange, r0: 16, r1: 70, sw: 5, d: 0.6 }); }
  // estações: cada uma nasce com overshoot, bandeira e onda; a que já foi dita recua para 50% até o fecho
  NIVEIS.forEach((n, i) => {
    const uE = [0, 0, 0, 0, 0];
    uE[i] = inv(tN[i], tN[i] + 0.55, t);
    if (uE[i] <= 0) return;
    const [ex, ey] = G.est(i), cor = n.cor === C.navy || n.cor === C.blue40 ? C.blue : n.cor;
    const tProx = i < 4 ? tN[i + 1] : Infinity, emFoco = t < tProx;
    const recua = i < 4 ? 0.5 * fin(t, tProx - 0.03, 0.22) * (1 - fin(t, tFim + i * 0.05, 0.3)) : 0;
    let b = onda(ex, ey, t - tN[i], { c: cor, r0: 40, r1: 86, sw: 7, d: 0.6 }) + onda(ex, ey, t - tN[i] - 0.14, { c: cor, r0: 40, r1: 120, sw: 4, d: 0.65 });
    b += mapaTrilha(G, { terreno: false, u: 0, uEst: uE, foco: emFoco ? i : -1, t });
    b += particulas(40 + i, ex, ey - 6, t - tN[i] - 0.04, { n: 8, v: 110, r: 5, cores: [cor, C.orange, C.blue40] });
    // ao perder o foco, a estação encolhe suave (de 1,12 para 1); no fecho, uma batida em cascata
    const esc = (emFoco ? 1 : 1 + 0.12 * (1 - fin(t, tProx, 0.22))) * (1 + 0.07 * bat(t, tFim + i * 0.06, 0.34));
    if (recua > 0.001) {
      const L = ROT[i];
      mp += opa(clamp(recua * 6), pop(esc, ex, ey, `<circle cx="${f(ex)}" cy="${f(ey)}" r="46" fill="${C.white}"/>`
        + `<rect x="${f(L.x + 1)}" y="${f(L.y + 1)}" width="${f(L.w - 2)}" height="${L.h - 2}" rx="${L.h / 2 - 1}" fill="${C.white}"/>`));
    }
    mp += opa(1 - recua, pop(esc, ex, ey, b));
  });

  // ---------- os dois pinos na estrada ----------
  const eA = pinoA(t, T), eB = pinoB(t, T);
  const PIN = [{ ...LIN[0], e: eB, tVoo: T.tVooB, tPouso: T.tB0 }, { ...LIN[1], e: eA, tVoo: T.tVooA, tPouso: T.tA0 }];
  PIN.forEach((p, j) => {
    if (t < p.tPouso) return;
    const e = p.e;
    mp += rastro(e.u, e.comp, p.luz, 0.95, 24);
    if (e.comp > 0.002) mp += `<circle cx="${f(e.x)}" cy="${f(e.y)}" r="${f(17 + 3 * Math.sin(t * 12))}" fill="${p.luz}" opacity="${f(Math.min(0.75, e.comp * 30))}"/>`;
    mp += onda(e.x, e.y, t - p.tPouso, { c: p.h.cor, r0: 10, r1: 52, sw: 5, d: 0.5 });
    // "onde ela está hoje": dois anéis localizam cada pino
    mp += onda(e.x, e.y, t - (tHoje - 0.06 + j * 0.1), { c: p.h.cor, r0: 14, r1: 64, sw: 6, d: 0.6 })
      + onda(e.x, e.y, t - (tHoje + 0.1 + j * 0.1), { c: p.h.cor, r0: 14, r1: 92, sw: 4, d: 0.7 });
    // parada: duas ondas na cor da marca
    const tp = T.tPara[j], cm = NIVEIS[p.n].cor;
    mp += onda(e.x, e.y, t - tp, { c: cm, r0: 14, r1: 56, sw: 7, d: 0.55 }) + onda(e.x, e.y, t - tp - 0.15, { c: cm, r0: 14, r1: 82, sw: 4, d: 0.65 });
    // sinal de posição: um anel que pulsa de tempos em tempos enquanto o pino está parado
    if (t > tp + 0.9) {
      const q = ((t - tp - 0.9) % 1.3) / 1.3;
      mp += `<circle cx="${f(e.x)}" cy="${f(e.y)}" r="${f(12 + 34 * ease.out(q))}" fill="none" stroke="${p.h.cor}" stroke-width="${f(4 * (1 - q) + 0.5)}" opacity="${f(0.8 * (1 - q))}"/>`;
    }
  });
  [...PIN].filter(p => t >= p.tPouso).sort((a, b) => a.e.y - b.e.y).forEach(p => {
    mp += pinoMapa(p.e.x, p.e.y, { cor: p.h.cor, s: SP, rotulo: p.id, anel: C.navy, hop: p.e.hop / SP });
  });
  // etiquetas de parada
  mp += etiquetaParada(PB[0], PB[1] - 76, 'B · ' + NIVEIS[NB].rot, HEROIS.B.cor, back(t, T.tB1 + 0.28, 0.42), 'cima')
    + etiquetaParada(PA[0] - 34, PA[1] - 42, 'A · ' + NIVEIS[NA].rot, HEROIS.A.cor, back(t, T.tAp + 0.2, 0.42), 'esq');

  // câmera + véu no alto (o mapa ampliado se dissolve antes de chegar ao título)
  const corpoCam = `<g transform="translate(${f(cam.ax)} ${f(cam.ay)}) rotate(${f(cam.r)}) scale(${f(cam.z)}) translate(${f(-cam.cx)} ${f(-cam.cy)})">${mp}</g>`;
  if (cam.u < 0.995) {
    const y1 = lerp(440, 322, cam.u);
    s += `<linearGradient id="rg-veu" gradientUnits="userSpaceOnUse" x1="0" y1="${f(y1 - 100)}" x2="0" y2="${f(y1)}"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>`
      + `<mask id="rg-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#rg-veu)"/></mask>`
      + `<g mask="url(#rg-mask)">${corpoCam}</g>`;
  } else s += corpoCam;

  // ---------- título: o fio sob "hoje" pulsa quando a palavra é dita ----------
  s += titulo(['Onde cada pessoa está', '*hoje* na régua de adoção'], MG, TY, t, t0 + 0.15);
  {
    const b = bat(t, tHoje - 0.06, 0.5);
    if (b > 0.01) s += `<rect x="${MG}" y="${f(TY + TLH + TS * 0.16 - 2 * b)}" width="${f(larg('hoje', TS, { f: 'L' }))}" height="${f(TS * 0.075 + 7 * b)}" fill="${C.orange}"/>`;
  }

  // ---------- cartões de interface ----------
  s += cartoesSinais(t, T) + cartaoLegenda(t, T);

  // ---------- pinos saindo do cartão e voando até o começo da estrada ----------
  PIN.forEach(p => {
    if (t >= p.tPouso) return;
    const x0 = RADX, y0 = p.y + CARD.h / 2 + 4 + 25, kp = back(t, p.tVoo - 0.26, 0.3);
    if (kp <= 0.001) return;
    const u = inv(p.tVoo, p.tPouso, t);
    const [dx, dy] = proj(p.e.x, p.e.y, cam);
    const em = v => { const q = ease.inOut(clamp(v)); return [lerp(x0, dx, q) + Math.sin(q * Math.PI) * 215, lerp(y0, dy, q) - Math.sin(q * Math.PI) * 30, q]; };
    for (let k = 7; k >= 1; k--) {
      if (u - k * 0.035 <= 0) continue;
      const [gx, gy, q] = em(u - k * 0.035);
      s += `<circle cx="${f(gx)}" cy="${f(gy - 26 * lerp(0.6, cam.z, q))}" r="${f(15 - k * 1.7)}" fill="${p.luz}" opacity="${f(0.55 - k * 0.07)}"/>`;
    }
    const [bx, by, q] = em(u);
    s += pinoMapa(bx, by, { cor: p.h.cor, s: lerp(0.6, SP * cam.z, q) * (1 + 0.2 * Math.sin(q * Math.PI)), k: kp, rotulo: p.id, anel: C.navy });
  });

  // ---------- salvaguarda ----------
  {
    const ta = tHoje + 0.12, k = fin(t, ta, 0.45);
    if (k > 0.001) {
      const w = larg(AVISO, 22) + 62;
      s += sobe(k, pilula(MG - 12, 1132, w, 38, 'rgba(255,255,255,.88)')
        + icone('relogio', MG + 10, 1151, 24, { u: inv(ta + 0.05, ta + 0.7, t), sw: 2.4, c: C.navy80 })
        + txt(AVISO, MG + 32, 1158.5, { s: 22, c: C.navy80 }), 16);
    }
  }
  return s;
}
