// Cena 8 · FOCO — "Foco em entrega, performance, collection… e o melhor de tudo: aprendendo com os
// melhores." (≈ 45.57 → 52.37 s)
//
// Cenário (fundo creme, skyline pálido ao fundo com paralaxe): três pilares azuis no estilo das barras
// do logo A&M (topo inclinado, janelas) formam uma escada que sobe da esquerda para a direita; o
// terceiro é largo — é o "topo". Victor começa no chão, à esquerda. No alto à esquerda, o título FOCO.
//
// Batidas (tempos absolutos, todos derivados das palavras da narração):
//   t0+0.1 .. wa(80)  contornos tracejados dos pilares ("planta") no chão; a mira entra girando e o
//                     título FOCO entra desfocado; em "Foco" a mira trava e o texto fica nítido.
//   wa(82/83/84)      "entrega" / "performance" / "collection": cada pilar irrompe do chão (poeira),
//                     sobe rápido com rastro e TRAVA na palavra (mola, partículas, anel no chão,
//                     tremor, cantos de HUD de "foco"); o chip com ícone (caixa, velocímetro, moeda)
//                     surge na base; varredura de luz no pilar. Victor aponta e reage a cada um.
//   wa(85..89)        "e o melhor de tudo": luz quente e raios nascem atrás do topo; o título FOCO sai
//                     e a etiqueta "O MELHOR DE TUDO" entra GRANDE no lugar dele (encolhe para o canto
//                     quando o APRENDENDO chega); os três diretores saltam de trás da borda do topo e
//                     pousam, um a um (dir1 em "melhor", dir3 em "tudo"), deixando um lugar à esquerda.
//   wa(90..93)        "aprendendo com os melhores": Victor sobe a escada em três saltos enquanto os
//                     diretores o chamam (o dir1 estende a mão, a dir2 aplaude, o dir3 acena); o letreiro se monta
//                     (APRENDENDO letra a letra, COM, OS) e MELHORES cai com impacto no exato
//                     "melhores", quando o Victor chega ao topo: os quatro erguem os braços e as mãos
//                     se tocam (faíscas), raios explodem, janelas acendem em laranja, confete e
//                     brilhos até o corte.
import {
  COR, INK, CHAO, txt, largura, pilula, icone, pessoa,
  clamp, lerp, inv, ease, rng, n2, back, fin, fout, popG, opa,
  fundoCreme, chao, onda, particulas, poeira, hudCantos, tremor, faiscas, confete, flash, chipRotulo,
} from '../base.js';

const f = n2;

export const CHIP = ['CENA 8 · FOCO', 'Aprendendo com os melhores'];

// ---------------- layout ----------------
const PIL = [
  { x: 740, w: 240, h: 220, sl: 26, cor: COR.blue, rot: 'ENTREGA', ic: 'box' },
  { x: 1010, w: 240, h: 350, sl: 30, cor: COR.blue2, rot: 'PERFORMANCE', ic: 'gauge' },
  { x: 1420, w: 500, h: 470, sl: 40, cor: COR.blue3, rot: 'COLLECTION', ic: 'coin' },
];
// altura do topo (inclinado, sobe para a direita) do pilar i na coordenada x
const topo = (i, x) => { const p = PIL[i]; return CHAO - p.h + p.sl * (p.x + p.w / 2 - x) / p.w; };
const VX0 = 470;                               // Victor no chão
const VS = 0.82, DS = 0.8;                    // escalas
const SPOT_V = [720, 990, 1236];               // onde o Victor pousa em cada pilar
const SPOT_D = [1358, 1480, 1602];             // os três diretores no topo do pilar 3
const DIRS = ['dir1', 'dir2', 'dir3'];
const RX = 1420, RY = 300;                     // centro dos raios / brilho quente
const ANG = 131;                               // braços erguidos: as mãos vizinhas se tocam
const MAOS = [1297, 1419, 1541].map(x => [x, topo(2, x) - 118]);

// ---------------- agenda ----------------
function agenda(ctx) {
  const wa = ctx.wa;
  const apr = wa(90), com = wa(91), mel = wa(93);
  return {
    t0: ctx.t0, t1: ctx.t1,
    foco: wa(80),
    pil: [wa(82), wa(83), wa(84)],
    e: wa(85), melhor: wa(87), tudo: wa(89),
    dirLand: [wa(87), (wa(87) + wa(89)) / 2, wa(89)],
    apr, com, os: wa(92), mel,
    hops: [
      { a: apr - 0.42, b: apr - 0.05, A: 120 },
      { a: apr + 0.12, b: com - 0.2, A: 50 },
      { a: com - 0.12, b: mel - 0.05, A: 95 },
    ],
  };
}

// ---------------- utilidades ----------------
const pulso = (t, a, d) => { const u = inv(a, a + d, t); return Math.sin(u * Math.PI); };
const ST = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
const estrela = (x, y, r, col, rot = 0) => (r <= 0.3 ? '' : `<path transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" d="M0,${f(-r)} Q${f(r * 0.14)},${f(-r * 0.14)} ${f(r)},0 Q${f(r * 0.14)},${f(r * 0.14)} 0,${f(r)} Q${f(-r * 0.14)},${f(r * 0.14)} ${f(-r)},0 Q${f(-r * 0.14)},${f(-r * 0.14)} 0,${f(-r)}Z" fill="${col}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`);
const squash = (x, y, sq, body) => (sq <= 0.001 ? body : `<g transform="translate(${f(x)} ${f(y)}) scale(${f(1 + sq * 0.5)} ${f(1 - sq)}) translate(${f(-x)} ${f(-y)})">${body}</g>`);

function defs() {
  let s = `<defs>`
    + `<radialGradient id="fo_gl"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".7"/><stop offset=".45" stop-color="${COR.orange2}" stop-opacity=".25"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="fo_q" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3df" stop-opacity=".95"/><stop offset="1" stop-color="#ffe3bf" stop-opacity="0"/></radialGradient>`
    + `<clipPath id="fo_rc"><rect x="-300" y="-300" width="2520" height="${CHAO + 300}"/></clipPath>`
    // acima do telhado do pilar 3 (entrada dos diretores, que saltam de trás da fachada)
    + `<clipPath id="fo_d"><path d="M-200,-400 H2200 V${f(topo(2, 2200))} L-200,${f(topo(2, -200))}Z"/></clipPath>`
    // fora das zonas do cabeçalho/timer (x<460,y<185) e do chip (x>1430,y<118), com folga p/ a câmera
    + `<clipPath id="fo_cf"><path d="M490,-60 H1380 V138 H1990 V1140 H-70 V208 H490Z"/></clipPath>`;
  PIL.forEach((p, i) => {
    s += `<clipPath id="fo_c${i}"><rect x="${p.x - p.w / 2 - 12}" y="-200" width="${p.w + 24}" height="${CHAO + 202}"/></clipPath>`;
  });
  return s + `</defs>`;
}

// contorno do pilar i (posição final)
function formaPilar(i, yB = CHAO + 70) {
  const p = PIL[i], x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, yR = CHAO - p.h, yL = yR + p.sl;
  return `M${x0},${f(yL)} L${x1},${f(yR)} L${x1},${f(yB)} L${x0},${f(yB)}Z`;
}

// ---------------- fundo: skyline pálido com paralaxe ----------------
const PREDIOS = (() => {
  const r = rng(808), L = [];
  let x = -80;
  while (x < 2200) { const w = 80 + r() * 90, h = 120 + r() * 190; L.push([x, w, h, r()]); x += w + 22 + r() * 46; }
  return L;
})();
function skyline(t, A) {
  const off = -(t - A.t0) * 14;
  let d = '', jan = '';
  for (const [x, w, h, q] of PREDIOS) {
    const X = x + off, yT = CHAO - h, sl = 14 + q * 18;
    d += `M${f(X)},${CHAO} L${f(X)},${f(yT + sl)} L${f(X + w)},${f(yT)} L${f(X + w)},${CHAO}Z `;
    for (let y = yT + sl + 22; y < CHAO - 24; y += 30) jan += `M${f(X + 14)},${f(y)} h${f(w - 28)} `;
  }
  return `<path d="${d}" fill="${COR.lblue}" opacity=".3"/><path d="${jan}" stroke="#ffffff" stroke-width="7" opacity=".35"/>`;
}

// raios de luz girando a partir de (cx, cy), só acima do chão
function raios(t, k, cx, cy) {
  if (k <= 0.01) return '';
  const n = 16, rot = t * 0.12;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + i * Math.PI * 2 / n, w = 0.06 + 0.015 * Math.sin(t * 2 + i);
    d += `M${cx},${cy} L${f(cx + Math.cos(a - w) * 1700)},${f(cy + Math.sin(a - w) * 1700)} L${f(cx + Math.cos(a + w) * 1700)},${f(cy + Math.sin(a + w) * 1700)}Z `;
  }
  return `<g clip-path="url(#fo_rc)"><path d="${d}" fill="${COR.orange2}" opacity="${f(0.16 * k)}"/></g>`;
}

// ---------------- efeitos de pouso ----------------
function nuvem(x, y, age, larg, n = 6) {
  const d = 0.6;
  if (age < 0 || age > d) return '';
  const k = age / d, e = ease.out(k);
  let s = '';
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, j = Math.floor(i / 2);
    const px = x + side * (larg / 2 - 6 + (30 + j * 28) * e);
    const py = y - 8 - (6 + j * 14) * e;
    const r = (13 + j * 5) * (1 - 0.6 * k);
    s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r)}" fill="#fffaf2" stroke="#d9c6a6" stroke-width="2.5" opacity="${f(0.95 * (1 - k))}"/>`;
  }
  return s;
}
function anelChao(x, y, age, r1 = 240) {
  const d = 0.55;
  if (age < 0 || age > d) return '';
  const k = ease.out(age / d);
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(lerp(70, r1, k))}" ry="${f(lerp(10, r1 * 0.14, k))}" fill="none" stroke="${COR.orange}" stroke-width="${f(8 * (1 - k) + 1)}" opacity="${f(1 - k)}"/>`;
}

// ---------------- pilares ----------------
// contorno tracejado ("planta") antes de subir
function planta(i, t, A) {
  const ta = A.pil[i];
  const k = fin(t, A.t0 + 0.05 + i * 0.07, 0.3) * fout(t, ta - 0.27, 0.12);
  if (k <= 0.01) return '';
  const p = PIL[i];
  const pul = 0.55 + 0.45 * Math.sin(t * 7 + i);
  return `<g opacity="${f(k)}"><path d="${formaPilar(i, CHAO)}" fill="#ffffff" fill-opacity=".35" stroke="${COR.blue2}" stroke-width="3" stroke-dasharray="12 10" stroke-dashoffset="${f(-t * 30)}"/>`
    + `<rect x="${p.x - p.w / 2 - 8}" y="${CHAO - 7}" width="${p.w + 16}" height="14" rx="7" fill="${COR.orange}" opacity="${f(0.25 + 0.3 * pul)}"/>`
    + `<path d="M${p.x - 12},${CHAO - 40} h24 M${p.x},${CHAO - 52} v24" stroke="${COR.blue2}" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>`;
}

function pilar(i, t, A) {
  const p = PIL[i], ta = A.pil[i];
  const u = inv(ta - 0.27, ta, t);
  if (u <= 0) return '';
  const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, yR = CHAO - p.h, yL = yR + p.sl;
  const a = t - ta;
  const mola = a > 0 ? 0.075 * p.h * Math.exp(-8 * a) * Math.sin(a * 24) : 0;
  const dy = (1 - u * u) * (p.h + 70) - mola;
  let b = '';
  // rastro de movimento enquanto sobe
  if (u < 1) b += `<rect x="${x0}" y="${f(yR + 30)}" width="${p.w}" height="${p.h}" fill="${p.cor}" opacity=".45" filter="url(#fxBlurY)"/>`;
  b += `<path d="${formaPilar(i)}" fill="${p.cor}"/>`;
  // sombra lateral + faixa clara no topo
  const xs = x1 - 36, ys = yR + p.sl * 36 / p.w;
  b += `<path d="M${xs},${f(ys)} L${x1},${yR} L${x1},${CHAO + 70} L${xs},${CHAO + 70}Z" fill="${COR.navy}" opacity=".16"/>`;
  b += `<path d="M${x0},${yL} L${x1},${yR} L${x1},${yR + 15} L${x0},${yL + 15}Z" fill="#ffffff" opacity=".32"/>`;
  // janelas (acendem em laranja no clímax, de baixo para cima)
  const cols = p.w > 300 ? 3 : 2, gap = 18, m = 24;
  const ww = (p.w - 2 * m - (cols - 1) * gap) / cols;
  const yTop = yL + 32, yMax = CHAO - 118;
  const nRows = Math.floor((yMax - yTop) / 38) + 1;
  let row = 0;
  for (let y = yTop; y <= yMax; y += 38, row++) {
    for (let c = 0; c < cols; c++) {
      const wx = x0 + m + c * (ww + gap);
      const tl = A.mel - 0.02 + i * 0.06 + (nRows - 1 - row) * 0.03 + c * 0.02;
      const lit = fin(t, tl, 0.12);
      const tw = (i === 2 ? 0.55 : 0.3) + 0.12 * Math.sin(t * 2.2 + row * 1.7 + c * 2 + i);
      b += `<rect x="${f(wx)}" y="${f(y)}" width="${f(ww)}" height="16" rx="4" fill="#ffffff" opacity="${f(tw)}"/>`;
      if (lit > 0) b += `<rect x="${f(wx)}" y="${f(y)}" width="${f(ww)}" height="16" rx="4" fill="${COR.orange2}" opacity="${f(lit * (0.93 + 0.07 * Math.sin(t * 6 + row + c)))}"/>`;
    }
  }
  b += `<path d="${formaPilar(i)}" fill="none" ${ST}/>`;
  // varredura de luz após travar
  const us = inv(ta + 0.08, ta + 0.62, t);
  if (us > 0 && us < 1) {
    const bx = x0 - 120 + (p.w + 240) * ease.inOut(us);
    b += `<clipPath id="fo_s${i}"><path d="${formaPilar(i, CHAO)}"/></clipPath><g clip-path="url(#fo_s${i})"><path d="M${f(bx)},${yR - 20} L${f(bx + 60)},${yR - 20} L${f(bx - 40)},${CHAO} L${f(bx - 100)},${CHAO}Z" fill="#ffffff" opacity=".5"/></g>`;
  }
  return `<g clip-path="url(#fo_c${i})"><g transform="translate(0 ${f(dy)})">${b}</g></g>`;
}

function efeitosPilar(i, t, A) {
  const p = PIL[i], ta = A.pil[i], yR = CHAO - p.h;
  let s = '';
  s += nuvem(p.x, CHAO, t - (ta - 0.27), p.w);
  s += anelChao(p.x, CHAO, t - ta, 150 + p.w * 0.5);
  s += particulas(40 + i * 7, p.x + p.w * 0.3, yR + 10, t - ta, { n: 18, v: 360, d: 0.75, sz: 11 });
  s += faiscas(p.x + p.w / 2 - 8, yR, t - ta, COR.orange, 8, 30, 90);
  // cantos de HUD: o "foco" trava no pilar
  const kh = inv(ta - 0.06, ta + 0.2, t) * fout(t, ta + 0.62, 0.3);
  if (kh > 0) s += opa(fout(t, ta + 0.62, 0.3), hudCantos(p.x - p.w / 2 - 16, yR - 18, p.w + 32, p.h + 6, inv(ta - 0.06, ta + 0.2, t), COR.orange, 38, 6));
  return s;
}

function chipPilar(i, t, A) {
  const p = PIL[i], ta = A.pil[i];
  const k = back(t, ta + 0.02, 0.42);
  if (k <= 0.001) return '';
  const bob = Math.sin(t * 2.4 + i * 1.3) * 2.5;
  return popG(k, p.x, CHAO - 64 + bob, chipRotulo(0, 0, p.ic, p.rot, { size: 23 }));
}

// ---------------- Victor ----------------
const PTS = [[VX0, CHAO], ...SPOT_V.map((x, i) => [x, topo(i, x)])];
function posVictor(t, A) {
  let x = PTS[0][0] + Math.sin(t * 1.7) * 3 * (t < A.hops[0].a ? 1 : 0), y = PTS[0][1], air = -1, k = 0;
  for (let i = 0; i < 3; i++) {
    const h = A.hops[i];
    if (t >= h.b) { x = PTS[i + 1][0]; y = PTS[i + 1][1]; continue; }
    if (t >= h.a) {
      k = (t - h.a) / (h.b - h.a);
      x = lerp(PTS[i][0], PTS[i + 1][0], k);
      y = lerp(PTS[i][1], PTS[i + 1][1], k) - h.A * 4 * k * (1 - k);
      air = i;
    }
    break;
  }
  return { x, y, air, k };
}

// pulinho sincronizado de comemoração (todos juntos, para as mãos continuarem unidas)
const festa = (t, A) => 11 * Math.abs(Math.sin((t - A.mel - 0.42) * 6.6)) * fin(t, A.mel + 0.42, 0.12);

function estadoVictor(t, A) {
  const V = posVictor(t, A);
  // parte A: aponta para os pilares, reage a cada pouso
  const pA = Math.min(fin(t, A.pil[0] - 0.35, 0.2), fout(t, A.pil[2] + 0.45, 0.3));
  const nP = fin(t, A.pil[1] - 0.2, 0.2) + fin(t, A.pil[2] - 0.2, 0.2);   // 0..2: qual pilar é o mais alto
  const alvo = 104 + 18 * nP;
  let armL = 8, armR = lerp(8, alvo + Math.sin(t * 5) * 5, pA);
  let expr = 'smile';
  let gaze = [0.6, -0.2];
  let hop = 0;
  if (t >= A.pil[0] - 0.3) gaze = [1, -0.35 - 0.3 * nP];
  A.pil.forEach((ta) => {
    if (t >= ta && t < ta + 0.4) expr = 'wow';
    hop += 12 * pulso(t, ta + 0.02, 0.26);
  });
  // parte B: olha para os diretores no topo
  if (t >= A.melhor) { expr = 'joy'; gaze = [1, -1]; }
  if (t >= A.melhor + 0.2 && t < A.hops[0].a) armR = lerp(8, 128 + Math.sin(t * 13) * 14, fin(t, A.melhor + 0.2, 0.15)); // acena de volta
  if (t >= A.hops[0].a - 0.12) {
    gaze = [1, -0.6];
    const noAr = V.air >= 0 ? Math.sin(Math.PI * clamp(V.k)) : 0;
    const sobe = V.air >= 0 ? 0.55 + 0.45 * noAr : 0;
    armL = lerp(16, 118, sobe);
    armR = lerp(16, 112, sobe);
  }
  // clímax: braços erguidos, mãos com o dir1 (começa ainda no ar, no fim do último salto)
  const c = fin(t, A.hops[2].b - 0.08, 0.12);
  if (c > 0) {
    armR = lerp(armR, ANG, c);
    armL = lerp(armL, 138 + Math.sin((t - A.mel) * 9) * 6 * fin(t, A.mel + 0.4, 0.2), c);
    gaze = [0.7, -0.3];
    hop = festa(t, A);
  }
  // agachamento antes de saltar / ao pousar
  let sq = 0;
  for (const h of A.hops) sq += 0.08 * pulso(t, h.a - 0.12, 0.14) + 0.1 * pulso(t, h.b, 0.16);
  return { x: V.x, y: V.y, armL, armR, expr, gaze, hop, sq, air: V.air, k: V.k };
}

function desenhaVictor(t, A) {
  const S = estadoVictor(t, A);
  let s = '';
  // linhas de velocidade durante o salto
  if (S.air >= 0) {
    const P1 = posVictor(t - 0.03, A), P2 = posVictor(t - 0.11, A);
    for (const [hh, w] of [[60, 5], [110, 6], [160, 5]]) {
      s += `<path d="M${f(P2.x - 30)},${f(P2.y - hh * VS)} L${f(P1.x - 40)},${f(P1.y - hh * VS)}" stroke="${COR.orange}" stroke-width="${w}" stroke-linecap="round" opacity=".6"/>`;
    }
  }
  const p = pessoa('victor', { t, s: VS, x: S.x, y: S.y, armL: S.armL, armR: S.armR, expr: S.expr, gaze: S.gaze, hop: S.hop });
  return s + squash(S.x, S.y, S.sq, p);
}

// ---------------- diretores (esperam no topo do pilar 3) ----------------
// Entrada: cada diretor salta de trás da borda do topo do pilar 3 (sobe escondido atrás da fachada,
// passa do ponto, cai e pousa com squash + poeira). Recorte 'fo_d' = região acima da linha do telhado.
const ENT = 0.36, PK = 28, U1 = 0.56;
function yEntrada(u, yF) {
  if (u < U1) return lerp(yF + 250, yF - PK, ease.out(u / U1));
  return lerp(yF - PK, yF, ease.in((u - U1) / (1 - U1)));
}
function desenhaDiretor(i, t, A, V) {
  const land = A.dirLand[i];
  const u = inv(land - ENT, land, t);
  if (u <= 0) return '';
  const x = SPOT_D[i], yF = topo(2, x);
  const y = u < 1 ? yEntrada(u, yF) : yF;
  let armL = 8, armR = 8, expr = 'smile', hop = 0;
  // subindo: braços colados, estica na vertical
  const sobe = u < U1 ? 1 - u / U1 : 0;
  // ao pousar: abrem só os braços de fora ("chegamos!"), sem cruzar com o vizinho
  const abre = pulso(t, land, 0.4);
  armL = lerp(armL, i === 0 ? 70 : 28, abre); armR = lerp(armR, i === 2 ? 70 : 28, abre);
  // chamam o Victor: dir1 estende a mão para ele; dir2 e dir3 acenam
  const h1 = A.hops[0], h3 = A.hops[2];
  const chama = Math.min(fin(t, h1.a - 0.25, 0.18), fout(t, h3.b - 0.04, 0.1));
  if (i === 0) armL = lerp(armL, 72 + Math.sin(t * 10) * 12, chama);
  else if (i === 1) {                                              // dir2 aplaude (mãos na frente, não invade os vizinhos)
    const cl = -22 + Math.abs(Math.sin(t * 9)) * 26;
    armL = lerp(armL, cl, chama); armR = lerp(armR, cl, chama);
  } else armR = lerp(armR, 128 + Math.sin(t * 12 + 3.4) * 12, chama);
  expr = chama > 0.3 ? 'joy' : 'smile';
  // olhar acompanha o Victor
  const gx = clamp((V.x - x) / 160, -1, 1), gy = clamp((V.y - yF) / 200, -0.7, 0.9);
  let gaze = [gx, gy];
  // clímax: braços erguidos, mãos vizinhas se tocam (o dir1 sobe o braço junto com o Victor)
  const c = i === 0 ? fin(t, A.hops[2].b - 0.08, 0.12) : fin(t, A.mel - 0.05, 0.1);
  if (c > 0) {
    expr = 'joy';
    armL = lerp(armL, ANG, c);
    armR = lerp(armR, i === 2 ? 138 + Math.sin((t - A.mel) * 9 + 1) * 6 * fin(t, A.mel + 0.4, 0.2) : ANG, c);
    hop = festa(t, A);
    gaze = [i === 2 ? -0.7 : -0.4, -0.3];
  }
  const sq = 0.12 * pulso(t, land, 0.18);
  const corpo = pessoa(DIRS[i], { t, s: DS, x, y, armL, armR, expr, gaze, hop });
  if (u >= 1) return squash(x, y, sq, corpo);
  // entrada: rastro vertical + estica, recortado pelo telhado
  let e = '';
  const kr = u < U1 + 0.12 ? 1 - clamp((u - U1 + 0.12) / 0.24) : 0;
  if (kr > 0) {
    for (const [dx, L, w] of [[-26, 70, 5], [0, 110, 6], [26, 80, 5]]) {
      e += `<path d="M${f(x + dx)},${f(y + 14)} v${f(L * kr)}" stroke="${COR.orange2}" stroke-width="${w}" stroke-linecap="round" opacity="${f(0.75 * kr)}"/>`;
    }
  }
  const est = sobe > 0 ? `<g transform="translate(${x} ${f(y)}) scale(${f(1 - 0.07 * sobe)} ${f(1 + 0.12 * sobe)}) translate(${-x} ${f(-y)})">${corpo}</g>` : corpo;
  return `<g clip-path="url(#fo_d)">${e}${est}</g>`;
}

// rastro pontilhado da subida do Victor (na altura dos pés)
function trilha(t, A) {
  let d = '';
  for (let i = 0; i < 3; i++) {
    const h = A.hops[i];
    const u = inv(h.a, h.b, t);
    if (u <= 0) break;
    const [x0, y0] = PTS[i], [x1, y1] = PTS[i + 1];
    const n = 16;
    for (let j = 0; j <= n; j++) {
      const k = u * j / n;
      const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - h.A * 4 * k * (1 - k) - 16;
      d += `${j === 0 ? 'M' : 'L'}${f(x)},${f(y)} `;
    }
  }
  if (!d) return '';
  return `<path d="${d}" fill="none" stroke="${COR.orange}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 15" opacity=".7"/>`;
}

// ---------------- tipografia ----------------
const TSTYLE = (sw, cor = COR.navy) => `stroke="${cor}" stroke-width="${f(sw)}" paint-order="stroke" stroke-linejoin="round"`;

// palavra montada letra a letra. modo 'sobe' (sobe com overshoot) ou 'cai' (impacto, vem grande)
function letras(str, x, y, size, cor, t, ta, stg, modo) {
  let s = '';
  const ls = size * 0.02;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') continue;
    const xi = x + largura(str.slice(0, i), size, 900) + i * ls;
    const wc = largura(ch, size, 900);
    const cx = xi + wc / 2, cy = y - size * 0.36;
    let sc, dy = 0, o;
    if (modo === 'cai') {
      const u = inv(ta + i * stg, ta + i * stg + 0.18, t);
      if (u <= 0) continue;
      sc = lerp(2.2, 1, ease.out(u)) + 0.08 * Math.sin(u * Math.PI);
      o = clamp(u * 3.5);
    } else {
      const k = back(t, ta + i * stg, 0.38);
      if (k <= 0.001) continue;
      sc = 0.35 + 0.65 * k;
      dy = (1 - k) * size * 0.55;
      o = clamp(k * 3);
    }
    const sw = size * 0.075;
    const g = txt(ch, xi + 4, y + 6, { anchor: 'start', size, weight: 900, fill: COR.navy, extra: TSTYLE(sw) })
      + txt(ch, xi, y, { anchor: 'start', size, weight: 900, fill: cor, extra: TSTYLE(sw) });
    s += `<g transform="translate(${f(cx)} ${f(cy + dy)}) scale(${f(sc)}) translate(${f(-cx)} ${f(-cy)})"${o < 0.999 ? ` opacity="${f(o)}"` : ''}>${g}</g>`;
  }
  return s;
}

// mira de foco
function mira(cx, cy, r, rot, cor = COR.orange) {
  let tick = '';
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    tick += `M${f(cx + Math.cos(a) * r * 0.62)},${f(cy + Math.sin(a) * r * 0.62)} L${f(cx + Math.cos(a) * r * 1.18)},${f(cy + Math.sin(a) * r * 1.18)} `;
  }
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.86)}" fill="#ffffff" stroke="${INK}" stroke-width="4"/>`
    + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${cor}" stroke-width="5" stroke-dasharray="${f(r * 0.9)} ${f(r * 0.22)}" transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})"/>`
    + `<path d="${tick}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.36)}" fill="none" stroke="${COR.navy}" stroke-width="4"/>`
    + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.14)}" fill="${cor}"/>`;
}

// título "FOCO" (parte A)
function tituloFoco(t, A) {
  const a = A.foco;
  const sai = inv(A.melhor - 0.36, A.melhor - 0.1, t);
  if (sai >= 1) return '';
  const kin = inv(A.t0 + 0.1, a, t);
  const nit = ease.out(inv(a - 0.08, a + 0.07, t));                  // nitidez
  const entra = fin(t, A.t0 + 0.12, 0.3);
  const MX = 176, MY = 298, size = 132, TX = 252, TY = 345;
  let s = '';
  // mira: entra grande girando e trava em "Foco"
  const sc = lerp(2.4, 1, ease.out(kin)) + 0.12 * pulso(t, a, 0.25);
  const rot = lerp(-200, 0, ease.out(kin)) + Math.max(0, t - a) * 40;
  s += opa(entra, `<g transform="translate(${MX} ${MY}) scale(${f(sc)}) translate(${-MX} ${-MY})">${mira(MX, MY, 54, rot)}</g>`);
  s += onda(MX, MY, t - a, { r0: 40, r1: 150, d: 0.5, w: 10 });
  s += faiscas(MX, MY, t - a, COR.orange, 10, 64, 104);
  // texto: desfocado -> nítido
  const sh = 1 + 0.07 * (1 - nit);
  const corpo = txt('FOCO', TX + 5, TY + 7, { anchor: 'start', size, weight: 900, fill: COR.navy, extra: TSTYLE(9) })
    + txt('FOCO', TX, TY, { anchor: 'start', size, weight: 900, fill: COR.orange, extra: TSTYLE(9) });
  const g = b => `<g transform="translate(${TX} ${TY - 46}) scale(${f(sh)}) translate(${-TX} ${-(TY - 46)})">${b}</g>`;
  if (nit < 1) s += opa(entra * (1 - nit) * 0.9, `<g filter="url(#fxDesfoque)">${g(corpo)}</g>`);
  if (nit > 0) s += opa(nit, g(corpo));
  // sublinhado
  const wF = largura('FOCO', size, 900);
  const ku = ease.out(inv(a + 0.05, a + 0.35, t));
  if (ku > 0) s += `<path d="M${TX - 4},${TY + 26} Q${f(TX + wF / 2)},${TY + 40} ${f(TX + wF + 6)},${TY + 20}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - ku)}" stroke="${COR.orange}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  // saída: desliza para a esquerda e some
  const e = ease.inOut(sai);
  return `<g transform="translate(${f(-140 * e)} ${f(-10 * e)})" opacity="${f(1 - e)}">${s}</g>`;
}

// letreiro "O MELHOR DE TUDO / APRENDENDO / COM OS MELHORES" (parte B)
function letreiro(t, A) {
  if (t < A.melhor - 0.24) return '';
  let s = '';
  // etiqueta
  const kt = back(t, A.melhor - 0.2, 0.42);          // entra em "e o melhor", no lugar do FOCO
  if (kt > 0.001) {
    const lab = 'O MELHOR DE TUDO', sz = 21;
    const w = largura(lab, sz, 700, 'DM Sans') + lab.length * 3.5 + 84;
    const body = pilula(0, -27, w, 54, '#ffffff', COR.navy, 3.5)
      + `<circle cx="27" cy="0" r="18" fill="#fff4e6"/>` + icone('sparkle', 27, 0, 0.62)
      + txt(lab, 54, 8, { anchor: 'start', size: sz, weight: 700, family: 'DM Sans', fill: COR.navy, ls: 3.5 });
    const big = 1 - ease.inOut(inv(A.apr - 0.28, A.apr - 0.02, t));
    const bob = big * Math.sin((t - A.melhor) * 5.2) * 3;
    s += `<g transform="translate(${f(lerp(0, 40, big))} ${f(lerp(216, 360, big) + bob)}) scale(${f(kt * (1 + 0.7 * big))})">${body}</g>`;
  }
  // linha 1
  s += letras('APRENDENDO', 0, 334, 90, COR.orange, t, A.apr - 0.07, 0.026, 'sobe');
  // linha 2
  const sC = 58, sM = 112, Y2 = 448;
  const wCom = largura('COM ', sC, 900) + 10, wComOs = largura('COM OS', sC, 900) + 10;
  const kc = back(t, A.com - 0.05, 0.36), ko = back(t, A.os - 0.05, 0.36);
  const navyW = (str, x, k) => (k <= 0.001 ? '' : popG(k, x + largura(str, sC, 900) / 2, Y2 - sC * 0.36,
    txt(str, -largura(str, sC, 900) / 2, sC * 0.36, { anchor: 'start', size: sC, weight: 900, fill: COR.navy })));
  s += navyW('COM', 2, kc) + navyW('OS', wCom + 2, ko);
  const xM = wComOs + 22;
  s += letras('MELHORES', xM, Y2, sM, COR.orange, t, A.mel - 0.17, 0.022, 'cai');
  // sublinhado
  const wM = largura('MELHORES', sM, 900) + 8 * sM * 0.02;
  const ku = ease.out(inv(A.mel + 0.12, A.mel + 0.45, t));
  if (ku > 0) s += `<path d="M${f(xM - 6)},${Y2 + 28} Q${f(xM + wM / 2)},${Y2 + 44} ${f(xM + wM + 8)},${Y2 + 18}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - ku)}" stroke="${COR.orange}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  // brilhos em volta do MELHORES
  const kb = fin(t, A.mel + 0.08, 0.2);
  if (kb > 0) {
    const tw = (ph) => kb * (0.65 + 0.35 * Math.abs(Math.sin(t * 4 + ph)));
    s += estrela(xM + wM + 30, Y2 - 104, 19 * tw(0), COR.orange, t * 40)
      + estrela(xM + wM - 4, Y2 - 142, 11 * tw(1.4), COR.blue2)
      + estrela(largura('APRENDENDO', 90, 900) + 30, 254, 13 * tw(2.6), COR.orange2, -t * 50);
  }
  // flutuação suave depois de montado
  const fl = fin(t, A.mel + 0.3, 0.4);
  const rot = -4 + fl * Math.sin((t - A.mel) * 1.6) * 0.6;
  const yy = fl * Math.sin((t - A.mel) * 1.9) * 4;
  return `<g transform="translate(104 ${f(yy + 30)}) rotate(${f(rot)} 0 380)">${s}</g>`;
}

// ---------------- cena ----------------
export function desenhar(t, ctx) {
  const A = agenda(ctx);
  const V = posVictor(t, A);
  let s = defs();
  // fundo
  s += fundoCreme(t);
  const quente = fin(t, A.e - 0.05, 0.6);
  // tremor acumulado
  let tx = 0, ty = 0;
  const soma = ([a, b]) => { tx += a; ty += b; };
  A.pil.forEach(ta => soma(tremor(t, ta, 0.32, 10)));
  A.dirLand.forEach(tl => soma(tremor(t, tl, 0.2, 4)));
  soma(tremor(t, A.mel, 0.4, 12));
  // câmera: leve aproximação
  const z = 1 + 0.035 * ease.sine(inv(A.t0, A.t1, t));
  const cx = 1100, cy = 560;
  const depois = t >= A.mel;

  let w = '';
  w += skyline(t, A);
  // brilho quente e raios atrás do topo
  if (quente > 0) {
    const burst = depois ? 1 + 0.7 * Math.exp(-3 * (t - A.mel)) : 1;
    w += `<circle cx="${RX}" cy="${RY}" r="${f(560 + 40 * Math.sin(t * 2))}" fill="url(#fo_gl)" opacity="${f(quente * (depois ? 0.95 : 0.7))}"/>`;
    w += raios(t, quente * (0.5 + 0.5 * fin(t, A.mel - 0.05, 0.2)) * burst, RX, RY);
  }
  w += chao();
  PIL.forEach((p, i) => { const k = inv(A.pil[i] - 0.2, A.pil[i], t); if (k > 0) w += `<ellipse cx="${p.x + 10}" cy="${CHAO + 6}" rx="${f(p.w * 0.62 * k)}" ry="11" fill="rgba(22,35,59,.12)"/>`; });
  PIL.forEach((_, i) => { w += planta(i, t, A); });
  PIL.forEach((_, i) => { w += pilar(i, t, A); });
  PIL.forEach((_, i) => { w += efeitosPilar(i, t, A); });
  PIL.forEach((_, i) => { w += chipPilar(i, t, A); });
  w += trilha(t, A);
  // confete atrás dos personagens, recortado fora do cabeçalho/chip
  if (t >= A.mel - 0.02) w += `<g clip-path="url(#fo_cf)">${confete(t, A.mel - 0.02, 23, 70, [260, 0, 1660, 920])}</g>`;
  // poeira de luz
  w += poeira(t, 5, 22, [620, 180, 1260, 640], quente > 0 ? COR.orange2 : '#ffffff', 0.55);
  // poeira dos pousos (atrás dos personagens)
  A.dirLand.forEach((tl, i) => { w += nuvem(SPOT_D[i], topo(2, SPOT_D[i]), t - tl, 64, 4); });
  A.hops.forEach((h, i) => { w += nuvem(PTS[i + 1][0], PTS[i + 1][1], t - h.b, 58, 4); });
  // mãos que se tocam no topo: anéis, faíscas e partículas ATRÁS dos personagens
  const ah = t - (A.mel + 0.02);
  if (ah > -0.02) {
    MAOS.forEach(([mx, my], j) => {
      const yy = my - festa(t, A);
      w += onda(mx, yy, ah - j * 0.03, { r0: 8, r1: 46, d: 0.4, w: 6 });
      w += faiscas(mx, yy, ah - j * 0.03, COR.orange, 8, 18, 56);
    });
    w += `<g clip-path="url(#fo_cf)">${particulas(91, MAOS[1][0], MAOS[1][1] - 80, ah, { n: 22, v: 290, d: 0.9, sz: 11 })}</g>`;
  }
  // diretores e Victor
  for (let i = 0; i < 3; i++) w += desenhaDiretor(i, t, A, V);
  w += desenhaVictor(t, A);
  A.dirLand.forEach((tl, i) => { w += faiscas(SPOT_D[i], topo(2, SPOT_D[i]) - 100, t - tl, COR.orange2, 8, 76, 124); });
  // na frente: só o brilho pequeno onde as mãos se tocam
  if (ah > -0.02) {
    MAOS.forEach(([mx, my], j) => {
      const yy = my - festa(t, A);
      const kg = fin(t, A.mel + j * 0.03, 0.1) * (0.6 + 0.4 * Math.sin(t * 5 + j));
      w += `<circle cx="${mx}" cy="${f(yy)}" r="${f(13 + 2 * Math.sin(t * 6 + j))}" fill="url(#fo_q)" opacity="${f(kg)}"/>`;
    });
  }
  // brilhos ao redor do grupo
  if (t > A.melhor) {
    const BR = [[1110, 290, 14, 0], [1735, 250, 13, 1.1], [1105, 470, 11, 2.3], [1760, 480, 10, 3.1], [870, 560, 12, 4.2], [1740, 640, 9, 5.3]];
    BR.forEach(([x, y, r, ph], j) => {
      const k = back(t, A.melhor + 0.15 + j * 0.12, 0.35);
      if (k > 0) w += estrela(x, y + Math.sin(t * 2 + ph) * 6, r * k * (0.55 + 0.45 * Math.abs(Math.sin(t * 3.2 + ph))), j % 2 ? COR.orange2 : '#ffffff', t * 30 + ph * 40);
    });
  }

  let cena = `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(z)}) translate(${f(-cx)} ${f(-cy)})">${w}</g>`;
  cena += tituloFoco(t, A);
  cena += letreiro(t, A);
  s += `<g transform="translate(${f(tx)} ${f(ty)})">${cena}</g>`;
  // luz quente no impacto final
  s += flash(t - A.mel, 0.26, '#fff1dc', 0.35);
  return s;
}
