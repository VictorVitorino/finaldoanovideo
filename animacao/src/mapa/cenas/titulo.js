// Cena "titulo" (16,42–20,41 s): "Por isso existe o Mapa de Perfil Cognitivo."
// Filme de produto, sem personagens e sem confete. Sobre um território de curvas de nível bem leves (o fundo do quadro),
// um MAPA em cartão entra dobrado (capa com bloco de título, pilha de painéis na borda) e pousa num alvo já marcado:
// contorno tracejado do mapa aberto, fios de mira e cantoneiras. Durante o riser ele se DESDOBRA em três painéis e
// vem para a câmera; a estrada do mapa de trilha se desenha e cada estação acende quando a estrada chega nela.
// No impacto ('mapa_perfil') vêm o clarão, o tremor, os riscos de velocidade e o título cinético em duas linhas; o
// mapa recua para a metade de baixo. Um pulso de luz corre pela estrada, uma mira fecha girando sobre o ponto e, em
// 'cognitivo', um pino laranja vem da câmera e crava ali; do pino sai uma linha com pulso até o cartão PERFIL, onde
// o radar de cinco eixos se monta: perfil vira posição. Até o fim: brilho no pino, mira girando, tracejado correndo,
// bandeiras, um brilho que atravessa o título e o mapa fechando devagar (o texto fica firme na margem).
// Sem logo e sem logotipo: só as cores da paleta.
import { W, H, MG, C, txt, larg, fin, back, sobe, pop, opa, onda, particulas, tremor, fio, icone, tracar, clamp, lerp, inv, ease, n2, rng } from '../base.js';
import { radar, NIVEIS } from '../modelo.js';
import { fundoNoite, geoTrilha, mapaTrilha, pinoMapa, camera, sombra } from '../ludico.js';

const f = n2;
export const FUNDO = 'navy';
export const LEGENDA = false;

// ---------- tipografia ----------
const KS = 30, KY = 198;                                  // "Por isso existe"
const TS = 100, TLS = -1.8, Y1 = 304, Y2 = 414;           // título cinético (Light), duas linhas
const TX = MG - 6;                                        // alinhamento óptico: a haste do M e do P cai na margem de 72 px
const FY = 448;                                           // fio laranja
const SS = 32, SY = 514;                                  // subtítulo
const ESP = larg('a a', SS) - 2 * larg('a', SS);
const SUB = (() => {
  const partes = [['e, com ele, o', 400, C.navy20], ['Mapa de Adoção', 700, C.white], ['do projeto', 400, C.navy20]];
  let x = MG;
  return partes.map(([str, w, c]) => { const p = { str, w, c, x }; x += larg(str, SS, { w }) + ESP; return p; });
})();

// ---------- o mapa em cartão (coordenadas locais, centro em 0,0) ----------
const CX = W / 2, CY0 = 752, CY1 = 916;                   // centro durante o riser e depois que o título entra
const PW = 918, PH = 620, PP = PW / 3, HX = PP / 2, H2 = PH / 2, RC = 22;   // cartão, painel, dobra (x = ±HX), canto
const INCL = -4;                                          // inclinação do cartão
const OBLIQ = 0.085;                                      // quanto a borda solta da aba sobe no meio do giro
const AX = -PW / 2 + 14, AY = -H2 + 14, AW = PW - 28, AH = PH - 28;         // área impressa do mapa
// mini mapa de trilha: geometria grande, reduzida para caber no cartão
const KM = 0.78, GX = -486, GY = -300;
const G = geoTrilha(0, 0, 1220, 744);
const loc = ([gx, gy]) => [GX + KM * gx, GY + KM * gy];
const UPIN = lerp(G.uEst[1], G.uEst[2], 0.3);             // onde o pino crava: na estrada, entre Observa e Experimenta
const PIN = loc(G.em(UPIN));
const CAL = { x: 230, y: 100, w: 206, h: 196 };           // cartão PERFIL (radar), no canto inferior direito do mapa
const YL = 236;                                           // altura em que a linha do pino entra no cartão PERFIL
const KZ = 0.96;                                          // escala de repouso do cartão (cabe dentro das margens de 72 px)
const PS = 1.6;                                           // tamanho do pino
const VAL = [0.84, 0.6, 0.76, 0.5, 0.9];                  // perfil ilustrativo

const CLIPS = `<clipPath id="tt-card"><rect x="${-PW / 2}" y="${-H2}" width="${PW}" height="${PH}" rx="${RC}"/></clipPath>`
  + `<clipPath id="tt-area"><rect x="${AX}" y="${AY}" width="${AW}" height="${AH}" rx="10"/></clipPath>`
  + `<clipPath id="tt-m"><rect x="${-HX - 0.4}" y="${-H2}" width="${PP + 0.8}" height="${PH}"/></clipPath>`
  + `<clipPath id="tt-pe"><rect x="${-PW / 2}" y="${-H2}" width="${PP + 0.4}" height="${PH}"/></clipPath>`
  + `<clipPath id="tt-pd"><rect x="${HX - 0.4}" y="${-H2}" width="${PP + 0.4}" height="${PH}"/></clipPath>`
  + `<clipPath id="tt-v"><path d="M0,${-H2} H${PP - RC} Q${PP},${-H2} ${PP},${-H2 + RC} V${H2 - RC} Q${PP},${H2} ${PP - RC},${H2} H0Z"/></clipPath>`
  + `<clipPath id="tt-cp"><rect x="14" y="${-H2 + 14}" width="${PP - 28}" height="${PH - 28}" rx="10"/></clipPath>`;

// curvas de nível por quadrados marchantes: devolve um caminho (texto do atributo d) por nível
function contornos(h, ox, oy, w, hh, st, niveis) {
  const nx = Math.ceil(w / st), ny = Math.ceil(hh / st), v = [];
  for (let j = 0; j <= ny; j++) { v.push([]); for (let i = 0; i <= nx; i++) v[j].push(h(ox + i * st, oy + j * st)); }
  const r1 = n => Math.round(n * 10) / 10;
  return niveis.map(L => {
    let d = '';
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = v[j][i], b = v[j][i + 1], c = v[j + 1][i + 1], e = v[j + 1][i];
      const id = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (e > L ? 1 : 0);
      if (id === 0 || id === 15) continue;
      const x0 = ox + i * st, y0 = oy + j * st, k2 = (p, q) => (L - p) / (q - p);
      const top = () => [x0 + st * k2(a, b), y0], bot = () => [x0 + st * k2(e, c), y0 + st];
      const esq = () => [x0, y0 + st * k2(a, e)], dir = () => [x0 + st, y0 + st * k2(b, c)];
      const seg = (p, q) => { d += `M${r1(p[0])},${r1(p[1])}L${r1(q[0])},${r1(q[1])}`; };
      switch (id) {
        case 1: case 14: seg(esq(), bot()); break;
        case 2: case 13: seg(bot(), dir()); break;
        case 3: case 12: seg(esq(), dir()); break;
        case 4: case 11: seg(top(), dir()); break;
        case 6: case 9: seg(top(), bot()); break;
        case 7: case 8: seg(top(), esq()); break;
        case 5: seg(top(), esq()); seg(bot(), dir()); break;
        case 10: seg(top(), dir()); seg(esq(), bot()); break;
      }
    }
    return d;
  });
}
const relevo = morros => (x, y) => morros.reduce((a, [cx, cy, sx, sy, A]) => a + A * Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2)), 0);

// curvas de nível da carta (relevo suave, soma de morros); calculadas uma vez
const CURVAS = (() => {
  const h = relevo([[-262, -128, 250, 168, 1], [318, 190, 215, 150, 0.8], [352, -236, 180, 128, 0.62], [-70, 176, 200, 104, 0.42]]);
  let fino = '', forte = '';
  contornos(h, AX, AY, AW, AH, 15, [0, 1, 2, 3, 4, 5, 6, 7].map(k => 0.11 + k * 0.112)).forEach((d, k) => { if (k % 3 === 1) forte += d; else fino += d; });
  return `<path d="${fino}" fill="none" stroke="${C.blue40}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`
    + `<path d="${forte}" fill="none" stroke="${C.blue80}" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>`;
})();
// o mesmo relevo em escala de território, bem leve, no fundo do quadro inteiro (o mapa é um recorte dele)
const TOPO = (() => {
  const h = relevo([[840, 330, 430, 300, 1], [130, 1060, 380, 300, 0.85], [980, 1200, 300, 250, 0.6], [330, 600, 300, 220, 0.45]]);
  const ds = contornos(h, -60, -60, W + 120, H + 120, 20, [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86]);
  return `<path d="${ds.join('')}" fill="none" stroke="${C.blue40}" stroke-width="1.6" stroke-linecap="round"/>`;
})();

// a parte fixa da carta: papel, terreno, curvas de nível, malha de coordenadas, cruzes, régua da moldura e escala
const TERRENO = (() => {
  let s = `<rect x="${-PW / 2}" y="${-H2}" width="${PW}" height="${PH}" fill="${C.white}"/>`
    + `<rect x="${AX}" y="${AY}" width="${AW}" height="${AH}" rx="10" fill="url(#g-terra)"/>`;
  let malha = '', cruz = '', regua = '';
  const PX = 74, PY = 74;
  for (let x = -PX * 5; x <= PX * 5; x += PX) malha += `M${x},${AY}V${AY + AH}`;
  for (let y = -PY * 3; y <= PY * 3; y += PY) malha += `M${AX},${y}H${AX + AW}`;
  for (let x = -PX * 5; x <= PX * 5; x += PX) for (let y = -PY * 3; y <= PY * 3; y += PY) cruz += `M${x - 6},${y}h12M${x},${y - 6}v12`;
  for (let x = -PX * 5.5; x <= PX * 5.5; x += PX / 2) { const g = Math.abs(x % PX) < 1 ? 14 : 7; regua += `M${x},${AY}v${g}M${x},${AY + AH}v${-g}`; }
  for (let y = -PY * 3.5; y <= PY * 3.5; y += PY / 2) { const g = Math.abs(y % PY) < 1 ? 14 : 7; regua += `M${AX},${y}h${g}M${AX + AW},${y}h${-g}`; }
  s += `<g clip-path="url(#tt-area)">${CURVAS}<path d="${malha}" stroke="${C.white}" stroke-width="1.5" opacity=".7"/>`
    + `<path d="${cruz}" stroke="${C.navy40}" stroke-width="1.6" opacity=".7"/><path d="${regua}" stroke="${C.navy40}" stroke-width="2"/></g>`
    + `<rect x="${AX}" y="${AY}" width="${AW}" height="${AH}" rx="10" fill="none" stroke="${C.navy20}" stroke-width="2"/>`;
  // escala gráfica
  for (let i = 0; i < 4; i++) s += `<rect x="${-420 + i * 30}" y="266" width="30" height="8" fill="${i % 2 ? C.white : C.navy80}" stroke="${C.navy80}" stroke-width="1.5"/>`;
  return s;
})();

// coroa de graus da bússola: 24 marcas, as quatro principais mais longas
const ROSA = (() => {
  let d = '';
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.2832, r0 = i % 6 ? 39 : 34, ca = Math.cos(a), sa = Math.sin(a); d += `M${f(ca * r0)},${f(sa * r0)}L${f(ca * 44)},${f(sa * 44)}`; }
  return `<path d="${d}" stroke="${C.navy40}" stroke-width="2" stroke-linecap="round"/><circle r="52" fill="none" stroke="${C.navy40}" stroke-width="1.5" stroke-dasharray="2 6" opacity=".8"/>`;
})();

// pulso de luz que corre pela estrada (coordenadas do mapa de trilha, antes da redução)
function pulsoEstrada(u, o = 1) {
  if (u <= 0.001 || u >= 0.999 || o <= 0.01) return '';
  const d = G.d(Math.max(0, u - 0.085), u), [x, y] = G.em(u);
  return `<g opacity="${f(o)}"><path d="${d}" fill="none" stroke="${C.orange}" stroke-width="20" stroke-linecap="round" opacity=".45"/>`
    + `<path d="${d}" fill="none" stroke="${C.orange40}" stroke-width="7" stroke-linecap="round"/>`
    + `<circle cx="${f(x)}" cy="${f(y)}" r="22" fill="${C.orange}" opacity=".35"/><circle cx="${f(x)}" cy="${f(y)}" r="9" fill="#fff"/></g>`;
}

// a face impressa da carta, publicada uma vez por quadro em <defs> e reutilizada com <use> pelos três painéis
function face(t, uRoad, uEst, tEst, uPulso, oPulso) {
  // estrada, pulso de luz por cima dela e, por último, as estações (o pulso passa por baixo dos discos)
  let via = mapaTrilha(G, { u: uRoad, uEst: [0, 0, 0, 0, 0], t, terreno: false, rotulos: false }) + pulsoEstrada(uPulso, oPulso);
  // anel fino que se abre quando a estrada chega a cada estação
  NIVEIS.forEach((n, i) => { const [ex, ey] = G.est(i); via += onda(ex, ey, t - tEst[i], { c: C.navy80, r0: 46, r1: 34, sw: 3.5, d: 0.5 }); });
  via += mapaTrilha(G, { u: 0, uEst, t, terreno: false, rotulos: false });
  let s = TERRENO + `<g clip-path="url(#tt-area)"><g transform="translate(${GX} ${GY}) scale(${KM})">${via}</g></g>`;
  // legenda da régua: cinco marcas, cada uma acende com a sua estação
  s += `<rect x="-290" y="254" width="266" height="32" rx="16" fill="${C.white}" opacity=".9"/>`;
  NIVEIS.forEach((n, i) => {
    const x = -278 + i * 50;
    s += `<rect x="${x}" y="264" width="42" height="12" rx="6" fill="${C.gray40}"/>`
      + pop(ease.back(clamp(uEst[i])), x + 21, 270, `<rect x="${x}" y="264" width="42" height="12" rx="6" fill="${n.cor}"/>`);
  });
  // bússola: a agulha oscila
  {
    const cx = -366, cy = -210, a = Math.sin(t * 1.7) * 6 + Math.sin(t * 4.3) * 1.5;
    s += `<circle cx="${cx}" cy="${cy}" r="44" fill="${C.white}" opacity=".88"/><circle cx="${cx}" cy="${cy}" r="44" fill="none" stroke="${C.navy40}" stroke-width="2"/>`
      + `<g transform="translate(${cx} ${cy})">${ROSA}<g transform="rotate(${f(16 + a)})"><path d="M0,-30 L8,0 L-8,0Z" fill="${C.orange}"/><path d="M0,30 L8,0 L-8,0Z" fill="${C.navy80}"/><circle r="4" fill="${C.white}"/></g></g>`;
  }
  return `<defs>${CLIPS}<g id="tt-face" clip-path="url(#tt-card)">${s}</g><g id="tt-capa">${CAPA}</g><g id="tt-verso">${VERSO}</g></defs>`;
}
const FACE = `<use href="#tt-face"/>`, USO_CAPA = `<use href="#tt-capa"/>`, USO_VERSO = `<use href="#tt-verso"/>`;

// verso das abas, em coordenadas (d, y): d = distância da dobra (0..PP)
const CAPA = (() => {
  const cy = -84, by = 138;                                // centro da bússola; topo do bloco de título
  let s = `<rect x="0" y="${-H2}" width="${PP}" height="${PH}" fill="${C.white}"/><rect x="14" y="${-H2 + 14}" width="${PP - 28}" height="${PH - 28}" rx="10" fill="url(#g-terra)"/>`;
  let curvas = '';
  [236, 196, 156, 118].forEach((r, i) => { curvas += `<ellipse cx="${HX + (i % 2 ? 8 : -6)}" cy="${cy + i * 5}" rx="${f(r * 0.56)}" ry="${r}" fill="none" stroke="${i === 1 ? C.blue80 : C.blue40}" stroke-width="${i === 1 ? 2.2 : 1.6}" opacity="${i === 1 ? 0.55 : 0.9}"/>`; });
  let cruz = '', regua = '';
  for (let x = HX - 74; x <= HX + 74; x += 74) for (let y = -222; y <= 74; y += 74) cruz += `M${x - 6},${y}h12M${x},${y - 6}v12`;
  for (let x = HX - 111; x <= HX + 111; x += 37) { const g = Math.abs((x - HX) % 74) < 1 ? 14 : 7; regua += `M${x},${-H2 + 14}v${g}`; }
  for (let y = -259; y <= 111; y += 37) { const g = Math.abs(y % 74) < 1 ? 14 : 7; regua += `M14,${y}h${g}M${PP - 14},${y}h${-g}`; }
  s += `<g clip-path="url(#tt-cp)">${curvas}</g><path d="${cruz}" stroke="${C.navy40}" stroke-width="1.6" opacity=".7"/><path d="${regua}" stroke="${C.navy40}" stroke-width="2"/>`
    + `<circle cx="${HX}" cy="${cy}" r="60" fill="${C.navy}" stroke="${C.white}" stroke-width="5"/>` + icone('bussola', HX, cy, 66, { c: C.white, sw: 3.4 })
    // bloco de título da capa: fio laranja, duas linhas e as cinco cores da régua
    + `<path d="M14,${by} H${PP - 14} V${H2 - 24} a10,10 0 0 1 -10,10 H24 a10,10 0 0 1 -10,-10Z" fill="url(#g-tela)"/>`
    + `<rect x="40" y="${by + 30}" width="52" height="5" fill="${C.orange}"/>`
    + `<rect x="40" y="${by + 52}" width="168" height="9" rx="4.5" fill="${C.white}" opacity=".92"/><rect x="40" y="${by + 74}" width="112" height="9" rx="4.5" fill="${C.white}" opacity=".45"/>`;
  NIVEIS.forEach((n, i) => { s += `<rect x="${40 + i * 46}" y="${by + 110}" width="38" height="12" rx="6" fill="${n.cor}" stroke="${C.white}" stroke-width="1.5"/>`; });
  s += `<rect x="14" y="${-H2 + 14}" width="${PP - 28}" height="${PH - 28}" rx="10" fill="none" stroke="${C.navy20}" stroke-width="2"/>`;
  return s;
})();
const VERSO = (() => {
  let pts = '';
  for (let x = 42; x < PP - 30; x += 37) for (let y = -H2 + 51; y < H2 - 30; y += 37) pts += `M${x},${y}h.01`;
  return `<rect x="0" y="${-H2}" width="${PP}" height="${PH}" fill="${C.gray20}"/><path d="${pts}" stroke="${C.navy20}" stroke-width="3.2" stroke-linecap="round"/>`
    + `<rect x="14" y="${-H2 + 14}" width="${PP - 28}" height="${PH - 28}" rx="10" fill="none" stroke="${C.gray}" stroke-width="2"/>`;
})();

// aba que gira na dobra. sgn = -1 (esquerda) | 1 (direita); q = cosseno do giro: 1 = deitada sobre o painel do meio, -1 = aberta.
// É um scaleX a partir da dobra com uma leve projeção oblíqua: no meio do giro a borda solta sobe (a aba vem para a frente).
function aba(sgn, q, verso) {
  const hx = sgn * HX, lado = sgn < 0 ? 'e' : 'd';
  if (q <= -0.9995) return `<g clip-path="url(#tt-p${lado})">${FACE}</g>`;
  const sn = Math.sqrt(Math.max(0, 1 - q * q)), k = OBLIQ * sn;
  if (q > 0) {
    return `<g transform="matrix(${f(-sgn * q)} ${f(-k)} 0 1 ${f(hx)} 0)" clip-path="url(#tt-v)">${verso}<rect x="0" y="${-H2}" width="${PP}" height="${PH}" fill="${C.navy}" opacity="${f(0.2 * sn)}"/></g>`;
  }
  return `<g transform="matrix(${f(-q)} ${f(-k * sgn)} 0 1 ${f(hx * (1 + q))} ${f(k * sgn * hx)})" clip-path="url(#tt-p${lado})">${FACE}<rect x="${sgn < 0 ? -PW / 2 : HX}" y="${-H2}" width="${PP}" height="${PH}" fill="${C.navy}" opacity="${f(0.24 * sn)}"/></g>`;
}

// riscos de velocidade finos, da direita para a esquerda, na faixa do título (ficam à direita do texto)
function riscos(u) {
  if (u <= 0 || u >= 1) return '';
  const R = rng(6), o = Math.sin(Math.PI * u);
  let s = '';
  for (let i = 0; i < 16; i++) {
    const y = 150 + R() * 330, l = 150 + R() * 380, ph = (u * 1.5 + R()) % 1, h = 1.5 + R() * 2, k = 0.35 + 0.65 * R();
    const x = lerp(W + 60, 430 - l, ph), xa = Math.max(x, 468), w = x + l - xa;
    if (w < 8) continue;
    s += `<rect x="${f(xa)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="1.5" fill="${i % 5 ? C.blue40 : C.white}" opacity="${f(0.6 * o * k)}"/>`;
  }
  return s;
}
// anel de mira em quatro arcos (pathLength = 4: cada arco ocupa `arco` de um quarto de volta)
const mira = (r, arco, cor, sw, o) => `<path d="M${f(r)},0 A${f(r)},${f(r)} 0 1 1 ${f(-r)},0 A${f(r)},${f(r)} 0 1 1 ${f(r)},0" pathLength="4" fill="none" stroke="${cor}" stroke-width="${sw}" stroke-dasharray="${arco} ${f(1 - arco)}" stroke-dashoffset="${f(arco / 2)}" opacity="${f(o)}"/>`;

// ponto a uma fração s (0..1) do comprimento de uma linha quebrada
function naLinha(pts, s) {
  const ls = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) { ls.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); L += ls[i - 1]; }
  let d = clamp(s) * L;
  for (let i = 0; i < ls.length; i++) {
    if (d <= ls[i] || i === ls.length - 1) { const k = clamp(d / ls[i]); return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; }
    d -= ls[i];
  }
  return pts[pts.length - 1];
}

// linha de título que sobe letra a letra por trás de uma máscara. tis = instante de cada palavra; passo = atraso por letra
function linhaCinetica(id, str, x, y, t, tis, cor, passo = 0.03, dur = 0.46) {
  if (t < tis[0]) return '';
  let s = '', n = 0, pal = 0, fim = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') { pal++; n = 0; continue; }
    const ti = tis[pal] + n * passo;
    n++;
    fim = Math.max(fim, ti + dur);
    if (t <= ti) continue;
    const k = ease.out5(inv(ti, ti + dur, t));
    const cx = x + larg(str.slice(0, i), TS, { f: 'L' }) + TLS * i;
    s += txt(ch, cx, y + (1 - k) * TS * 1.1, { f: 'L', s: TS, c: cor });
  }
  if (t >= fim) return s;
  return `<clipPath id="${id}"><rect x="0" y="${f(y - TS * 1.0)}" width="${W}" height="${f(TS * 1.28)}"/></clipPath><g clip-path="url(#${id})">${s}</g>`;
}

export function desenhar(t, ctx) {
  const { t0, t1, m, wa, T } = ctx;
  const iPor = T.marcas.por_isso.i, iMapa = T.marcas.mapa_perfil.i;
  const tPor = m('por_isso');
  const tImp = m('mapa_perfil') - 0.02;                   // impacto (junto com o som)
  const tCog = m('cognitivo');
  const tPouso = tCog + 0.05;                             // o pino crava junto com o sino
  const tEntra = t0 + 0.1, dEntra = 0.6;                  // o cartão dobrado desliza para dentro do quadro
  const tA1 = tPor - 0.08, tA2 = tA1 + 0.32, dA = 0.46;   // as duas abas abrem durante o riser
  const tR0 = tA1 + 0.42, tR1 = tImp;                     // a estrada se desenha até o impacto
  const tSub = tCog + 0.14;
  const tLin = tPouso + 0.04, tCal = tPouso + 0.12;        // linha do pino ao cartão PERFIL; o cartão e o radar

  let s = fundoNoite(t);
  const [qx, qy] = tremor(t, tImp, 0.34, 9);
  let c = '';

  // ---------- estado do cartão ----------
  const aImp = t - tImp;
  const kDesce = back(t, tImp - 0.03, 0.55);
  const vivo = fin(t, tImp + 0.6, 0.8);                    // respiração depois do impacto
  const cy = lerp(CY0, CY1, kDesce) + 4 * Math.sin(t * 1.5) * vivo;
  const eIn = ease.out5(inv(tEntra, tEntra + dEntra, t));
  const dyIn = (1 - eIn) * 760;
  // escala: cresce com o riser (o mapa vem para a câmera), recua no impacto para a escala de repouso e fecha devagar até o fim
  const zoom = lerp(1, KZ, kDesce) * (lerp(1.03, 1, ease.inOut(inv(tA1, tA2 + dA, t)))
    + 0.045 * ease.in(inv(tA1, tImp, t)) * (1 - ease.out(inv(tImp, tImp + 0.25, t)))
    - 0.03 * Math.sin(Math.PI * inv(0, 0.3, aImp)) + 0.004 * Math.sin(t * 1.9) * vivo
    + 0.022 * ease.sine(inv(tImp + 0.5, t1, t)));
  const rot = INCL + (1 - eIn) * 9 + 0.4 * Math.sin(t * 1.15) * vivo;
  const qE = lerp(1, -1, ease.inOut(inv(tA1, tA1 + dA, t)));
  const qD = lerp(1, -1, ease.inOut(inv(tA2, tA2 + dA, t)));
  // estrada e estações: cada estação nasce quando a estrada chega nela
  const uRoad = inv(tR0, tR1, t);
  const chega = alvo => { let a = 0, b = 1; for (let i = 0; i < 18; i++) { const mid = (a + b) / 2; if (ease.inOut(mid) < alvo) a = mid; else b = mid; } return lerp(tR0, tR1, a); };
  const tEst = G.uEst.map(u => chega(u) - 0.05);
  const uEst = tEst.map(te => inv(0, 0.42, t - te));
  // pulso de luz: corre da entrada da estrada até onde o pino vai cravar; depois, passa de tempos em tempos
  let uPulso = 0, oPulso = 0;
  if (t < tPouso + 0.25) { uPulso = lerp(0.01, UPIN, ease.inOut(inv(tImp + 0.2, tPouso - 0.02, t))); oPulso = fin(t, tImp + 0.2, 0.12) * (1 - inv(tPouso, tPouso + 0.25, t)); }
  else { const ph = ((t - tPouso - 0.5) % 1.7 + 1.7) % 1.7; uPulso = ph / 1.25; oPulso = t > tPouso + 0.5 ? 0.8 * Math.sin(Math.PI * clamp(uPulso)) : 0; }

  // ---------- atrás do cartão: energia do riser e clarão do impacto ----------
  {
    const carga = ease.in(inv(tA1 - 0.1, tImp - 0.08, t)) * (t < tImp ? 1 : 0);
    // território: curvas de nível bem leves no quadro inteiro, em paralaxe lenta; acendem um pouco com o riser e no impacto
    const oTopo = 0.11 + 0.1 * carga + 0.16 * (aImp > 0 ? 1 - ease.out(inv(0, 0.7, aImp)) : 0);
    c += `<g opacity="${f(oTopo)}" transform="translate(${f(14 * Math.sin(t * 0.22))} ${f(-10 * (t - t0))})">${TOPO}</g>`;
    if (carga > 0) {
      c += `<circle cx="${CX}" cy="${f(cy)}" r="${f(540 + 24 * Math.sin(t * 12))}" fill="url(#g-azul)" opacity="${f(0.8 * carga)}"/>`;
      const R = rng(41);
      for (let i = 0; i < 26; i++) {
        const a = R() * 6.283, ph = (t * (1.5 + R()) + R()) % 1, r = lerp(680, 300, ph * ph), l = 30 + 60 * ph;
        const ca = Math.cos(a), sa = Math.sin(a) * 0.9;
        c += `<path d="M${f(CX + ca * r)},${f(cy + sa * r)} L${f(CX + ca * (r + l))},${f(cy + sa * (r + l))}" stroke="${i % 4 ? C.blue40 : C.orange80}" stroke-width="${f(1.5 + 2 * ph)}" stroke-linecap="round" opacity="${f(carga * Math.sin(Math.PI * ph) * 0.85)}"/>`;
      }
    }
    if (aImp > 0 && aImp < 0.6) {
      const u = aImp / 0.6, R = rng(77);
      c += `<circle cx="${CX}" cy="${f(cy)}" r="${f(380 + 440 * ease.out(u))}" fill="url(#g-luz)" opacity="${f(0.5 * (1 - u))}"/>`;
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * 6.283 + R() * 0.2, r = 360 + (260 + R() * 160) * ease.out(u), l = (70 + R() * 80) * (1 - u);
        c += `<path d="M${f(CX + Math.cos(a) * r)},${f(cy + Math.sin(a) * r * 0.86)} L${f(CX + Math.cos(a) * (r + l))},${f(cy + Math.sin(a) * (r + l) * 0.86)}" stroke="${i % 3 ? C.white : C.orange}" stroke-width="2.2" stroke-linecap="round" opacity="${f(0.85 * (1 - u))}"/>`;
      }
      c += onda(CX, cy, aImp, { c: C.white, r0: 340, r1: 240, sw: 3.5, d: 0.5 });
    }
  }

  // ---------- "Por isso existe": palavra a palavra, com a fala ----------
  {
    let x = MG;
    const recua = lerp(1, 0.72, fin(t, tImp + 0.1, 0.5));
    let k = '';
    ['Por', 'isso', 'existe'].forEach((p, i) => {
      k += sobe(fin(t, wa(iPor + i) - 0.07, 0.3), txt(p, x, KY, { s: KS, c: C.navy20 }), 16);
      x += larg(p, KS) + larg('a a', KS) - 2 * larg('a', KS);
    });
    c += opa(recua, k);
  }

  // ---------- o cartão ----------
  if (t > tEntra) {
    let mp = face(t, uRoad, uEst, tEst, uPulso, oPulso);
    // luz por trás e cantoneiras de enquadramento: marcam o tamanho do mapa aberto antes de ele se abrir
    mp += `<circle r="470" fill="url(#g-azul)" opacity="${f(0.55 * eIn)}"/>`;
    {
      // contorno tracejado do mapa aberto e fios de mira: o cartão dobrado chega a um alvo já marcado
      const kG = fin(t, tEntra + 0.32, 0.3) * (1 - ease.inOut(inv(tA1 + 0.12, tA2 + dA, t)));
      if (kG > 0.01) {
        const uF = ease.inOut(inv(tEntra + 0.26, tEntra + 0.7, t));
        let fios = '', tiq = '';
        [[1, 0, 640], [-1, 0, 640], [0, 1, 470], [0, -1, 400]].forEach(([a, b, L]) => {
          const r0 = a ? HX + 26 : H2 + 26;
          fios += `M${a * r0},${b * r0} L${f(a * lerp(r0, L, uF))},${f(b * lerp(r0, L, uF))}`;
          for (let r = r0 + 28; r < lerp(r0, L, uF) - 4; r += 37) tiq += a ? `M${a * r},-5v10` : `M-5,${b * r}h10`;
        });
        mp += `<g opacity="${f(kG)}"><rect x="${-PW / 2}" y="${-H2}" width="${PW}" height="${PH}" rx="${RC}" fill="none" stroke="${C.blue40}" stroke-width="2" stroke-dasharray="10 12" stroke-dashoffset="${f(-t * 44)}" opacity=".5"/>`
          + `<path d="${fios}" stroke="${C.blue40}" stroke-width="1.6" opacity=".55"/><path d="${tiq}" stroke="${C.blue40}" stroke-width="1.6" opacity=".55"/></g>`;
      }
      const bx = PW / 2 + 16, by = H2 + 16, L = 44;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b], i) => {
        const u = ease.inOut(inv(tEntra + 0.3 + i * 0.07, tEntra + 0.7 + i * 0.07, t));
        mp += tracar(`M${a * (bx - L)},${b * by} H${a * bx} V${b * (by - L)}`, u, { c: C.blue40, sw: 3, cap: 'square' });
      });
      const kp = fin(t, tEntra + 0.5, 0.4);
      let mais = '';
      [[0, -by], [0, by], [-bx, 0], [bx, 0]].forEach(([x, y]) => { mais += `M${x - 9},${y}h18M${x},${y - 9}v18`; });
      mp += opa(0.7 * kp, `<path d="${mais}" stroke="${C.blue40}" stroke-width="2.5" stroke-linecap="round"/>`);
    }
    // sombra no chão (uma forma só, desfocada)
    const xe = -HX - PP * Math.max(0, -qE), xd = HX + PP * Math.max(0, -qD);
    mp += `<g filter="url(#fx-blur)"><rect x="${f(xe + 4)}" y="${-H2 + 34}" width="${f(xd - xe - 8)}" height="${PH}" rx="${RC}" fill="#00101C" opacity=".6"/></g>`;
    if (qE <= -0.9995 && qD <= -0.9995) {
      mp += FACE;
    } else {
      // a pilha de painéis aparece na borda enquanto o cartão está dobrado (papel, não tela)
      const pilha = (dx, dy, cor, k) => (k <= 0.01 ? '' : `<rect x="${-HX + dx}" y="${-H2 + dy}" width="${PP}" height="${PH}" rx="5" fill="${cor}" opacity="${f(k)}"/>`);
      mp += pilha(10, 9, C.navy40, clamp(qE * 4)) + pilha(5, 4.5, C.gray, clamp(qD * 4));
      // painel do meio, aba direita (por baixo) e aba esquerda (a capa, por cima)
      mp += `<g clip-path="url(#tt-m)">${FACE}</g>` + aba(1, qD, USO_VERSO) + aba(-1, qE, USO_CAPA);
      // dobrado: um brilho atravessa a capa
      const uv = inv(tEntra + 0.36, tEntra + 0.86, t);
      if (qE >= 0.9995 && uv > 0 && uv < 1) { const xv = lerp(-HX - 200, HX + 200, ease.inOut(uv)); mp += `<g clip-path="url(#tt-m)"><path d="M${f(xv - 70)},${H2} L${f(xv + 40)},${-H2} L${f(xv + 110)},${-H2} L${f(xv)},${H2}Z" fill="#fff" opacity=".5"/></g>`; }
    }
    // vincos do cartão aberto
    const kv = fin(t, tA1 + dA, 0.2), kv2 = fin(t, tA2 + dA, 0.2);
    const vinco = (x, k) => (k <= 0 ? '' : `<rect x="${x - 20}" y="${-H2}" width="20" height="${PH}" fill="${C.navy}" opacity="${f(0.045 * k)}"/><path d="M${x},${-H2}V${H2}" stroke="${C.navy}" stroke-width="1.5" opacity="${f(0.14 * k)}"/><path d="M${x + 2},${-H2}V${H2}" stroke="#fff" stroke-width="1.5" opacity="${f(0.7 * k)}"/>`);
    mp += vinco(-HX, kv) + vinco(HX, kv2);
    // brilho que varre o cartão no impacto
    if (aImp > 0 && aImp < 0.55) {
      const xv = lerp(-PW / 2 - 180, PW / 2 + 180, ease.inOut(aImp / 0.55));
      mp += `<g clip-path="url(#tt-card)"><path d="M${f(xv - 90)},${H2} L${f(xv + 50)},${-H2} L${f(xv + 120)},${-H2} L${f(xv - 20)},${H2}Z" fill="#fff" opacity=".5"/><path d="M${f(xv)},${H2} L${f(xv + 140)},${-H2} L${f(xv + 154)},${-H2} L${f(xv + 14)},${H2}Z" fill="#fff" opacity=".32"/></g>`;
    }

    // ---------- pino, linha com pulso e cartão PERFIL ----------
    const aP = t - tPouso, tQ = tPouso - 0.34, pulso = fin(t, tPouso + 0.5, 0.5);
    if (t > tQ) {
      const [px, py] = PIN;
      // linha do pino até o cartão PERFIL (por baixo do pino)
      const pts = [[px, py + 4], [px, YL - 16], [px + 16, YL], [CAL.x, YL]];
      const uL = ease.inOut(inv(tLin, tLin + 0.26, t));
      if (uL > 0) {
        mp += tracar('M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L'), uL, { c: C.navy, sw: 3 });
        const ph = ((t - tLin - 0.26) % 1.05 + 1.05) % 1.05, up = ph / 0.7;
        if (t > tLin + 0.26 && up < 1) {
          const [ax, ay] = naLinha(pts, ease.inOut(up)), o = Math.sin(Math.PI * up);
          mp += `<circle cx="${f(ax)}" cy="${f(ay)}" r="13" fill="${C.orange}" opacity="${f(0.35 * o)}"/><circle cx="${f(ax)}" cy="${f(ay)}" r="6" fill="${C.orange}" stroke="#fff" stroke-width="2" opacity="${f(clamp(o * 2))}"/>`;
        }
      }
      // cartão PERFIL: radar de cinco eixos que se monta
      const kc = back(t, tCal, 0.42);
      if (kc > 0.001) {
        const rcx = CAL.x + CAL.w / 2, rcy = CAL.y + 129, RR = 64;
        const uE = VAL.map((_, i) => inv(tCal + 0.1 + i * 0.045, tCal + 0.34 + i * 0.045, t));
        const resp = i => 1 + 0.05 * Math.sin(t * 2.6 + i * 1.3) * fin(t, tCal + 0.7, 0.4);
        let cal = `<rect x="${CAL.x}" y="${CAL.y}" width="${CAL.w}" height="${CAL.h}" rx="16" fill="url(#g-tela)" stroke="${C.white}" stroke-width="3"/>`
          + txt('PERFIL', CAL.x + 18, CAL.y + 37, { w: 700, s: 22, ls: 1.8, c: C.blue40 });
        // cinco sinais: os pontos acendem com os eixos do radar
        for (let i = 0; i < 5; i++) cal += `<circle cx="${CAL.x + CAL.w - 20 - (4 - i) * 14}" cy="${CAL.y + 29}" r="4.5" fill="${uE[i] > 0.4 ? C.orange : 'rgba(255,255,255,.25)'}"/>`;
        cal += `<path d="M${CAL.x + 14},${CAL.y + 50}H${CAL.x + CAL.w - 14}" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>`
          + radar({ cx: rcx, cy: rcy, R: RR, valores: VAL.map((v, i) => v * resp(i)), escuro: true, rotulos: 'nada', cor: C.orange, uGrade: inv(tCal + 0.03, tCal + 0.3, t), uEixo: uE });
        mp += pop(0.72 + 0.28 * kc, CAL.x, YL, opa(clamp(kc * 3), sombra(cal, true)));
        mp += pop(back(t, tLin + 0.22, 0.3), CAL.x, YL, `<circle cx="${CAL.x}" cy="${YL}" r="7" fill="${C.orange}" stroke="${C.white}" stroke-width="3"/>`);
      }
      // chão do pino: luz laranja pulsando e ondas
      if (aP > 0) {
        mp += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(104 + 14 * Math.sin(t * 4))}" ry="${f(52 + 7 * Math.sin(t * 4))}" fill="url(#g-laranja)" opacity="${f(clamp(aP * 6) * (0.75 + 0.25 * Math.sin(t * 4)))}"/>`;
        mp += onda(px, py, aP, { c: C.orange, r0: 14, r1: 150, sw: 8, d: 0.7 }) + onda(px, py, aP - 0.14, { c: C.white, r0: 10, r1: 96, sw: 5, d: 0.6 });
        const ciclo = ((aP - 0.9) % 1.15 + 1.15) % 1.15;
        if (aP > 0.9) mp += onda(px, py, ciclo, { c: C.orange, r0: 12, r1: 64, sw: 4.5, d: 0.9 });
        // traços radiais curtos que saltam do ponto (no lugar de confete)
        if (aP < 0.42) {
          const u = aP / 0.42, e = ease.out(u), l = 24 * (1 - u);
          let d = '';
          for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832 + 0.39, r = 74 + 64 * e, ca = Math.cos(a), sa = Math.sin(a); d += `M${f(px + ca * r)},${f(py + sa * r)}L${f(px + ca * (r + l))},${f(py + sa * (r + l))}`; }
          mp += `<path d="${d}" stroke="${C.orange}" stroke-width="2.5" stroke-linecap="round" opacity="${f(1 - u)}"/>`;
        }
      }
      // mira: fecha girando sobre o ponto enquanto o pino desce, trava quando ele crava e continua girando devagar
      {
        const uM = inv(tPouso - 0.46, tPouso, t);
        if (uM > 0) {
          const e5 = ease.out5(uM), rM = lerp(168, 62, e5) * (1 + 0.03 * Math.sin(t * 4) * pulso);
          const aM = lerp(-150, 0, e5) + Math.max(0, aP) * 22;
          // os quatro arcos navy ficam; as marcas laranja de aproximação somem quando a mira trava
          const oT = aP < 0 ? 1 : 1 - clamp(aP / 0.3);
          mp += `<g transform="translate(${f(px)} ${f(py)}) rotate(${f(aM)})" opacity="${f(clamp(uM * 3))}">` + mira(rM, 0.62, C.navy, 3, aP < 0 ? 0.9 : lerp(0.9, 0.75, clamp(aP / 0.7)))
            + (oT > 0.01 ? `<g transform="rotate(${f(-aM * 1.6)})">` + mira(rM + 14, 0.16, C.orange, 3.5, oT) + `</g>` : '') + `</g>`;
        }
      }
      // o pino vem da câmera para o mapa (queda em profundidade): começa grande e fecha no ponto, com a sombra convergindo
      const u = inv(tQ, tPouso, t), e = ease.in(u);
      if (aP < 0) mp += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(lerp(120, 26, e))}" ry="${f(lerp(46, 10, e))}" fill="${C.navy}" opacity="${f(0.28 * e)}"/>`;
      mp += particulas(53, px, py, aP, { n: 9, v: 150, r: 5, d: 0.5, cores: [C.orange, C.white, C.orange40] });
      // ao cravar: aperto curto e vibração amortecida
      const am = aP < 0 ? 0 : 0.06 * Math.sin(Math.PI * inv(-0.01, 0.12, aP));
      const vib = aP > 0 ? 8 * Math.exp(-6 * aP) * Math.sin(aP * 32) : 0;
      const zs = aP < 0 ? lerp(2.1, 1, e) : 1, dy = aP < 0 ? -170 * (1 - e) : 0;
      mp += opa(clamp(u * 3.5), `<g transform="translate(${f(px)} ${f(py + dy)}) rotate(${f(vib)}) scale(${f(zs * (1 + am * 0.6) * (1 + 0.025 * Math.sin(t * 4) * pulso))} ${f(zs * (1 - am))})">${pinoMapa(0, 0, { cor: C.orange, s: PS })}</g>`);
    }

    c += `<g transform="translate(${CX} ${f(cy + dyIn)}) rotate(${f(rot)}) scale(${f(zoom)})">${mp}</g>`;
  }

  // ---------- título cinético ----------
  {
    // linhas de velocidade atravessam a faixa do título no impacto
    // (à direita do texto, para não riscar as letras)
    c += riscos(inv(tImp - 0.02, tImp + 0.42, t));
    const soco = 1 + 0.045 * (1 - ease.out(inv(tImp, tImp + 0.45, t)));
    c += pop(soco, TX, Y1, linhaCinetica('tt-l1', 'Mapa de', TX, Y1, t, [tImp, wa(iMapa + 1) - 0.06], C.white, 0.034));
    c += linhaCinetica('tt-l2', 'Perfil Cognitivo', TX, Y2, t, [wa(iMapa + 2) - 0.07, wa(iMapa + 3) - 0.07], C.orange, 0.028);
    c += fio(MG, FY, inv(tCog + 0.08, tCog + 0.6, t), 132, 6);
    SUB.forEach((p, i) => { c += sobe(fin(t, tSub + i * 0.08, 0.38), txt(p.str, p.x, SY, { s: SS, w: p.w, c: p.c }), 18); });
    // um brilho atravessa "Perfil Cognitivo" depois que o título assenta
    const uB = inv(tCog + 0.78, tCog + 1.3, t);
    if (uB > 0 && uB < 1) {
      const xb = lerp(-120, 840, ease.inOut(uB));
      c += `<clipPath id="tt-gl">${linhaCinetica('tt-x', 'Perfil Cognitivo', TX, Y2, 1e9, [0, 0], '#fff')}</clipPath>`
        + `<g clip-path="url(#tt-gl)"><path d="M${f(xb)},${Y2 + 34} l64,-140 h84 l-64,140Z" fill="#fff" opacity=".62"/></g>`;
    }
  }

  // ---------- câmera: soco no impacto ----------
  // (a aproximação lenta do fim é só do mapa: o texto fica firme na margem de 72 px)
  const z = 1 + 0.03 * (1 - ease.out(inv(tImp, tImp + 0.6, t))) * (t >= tImp ? 1 : 0);
  c = camera(c, { z, cx: W / 2, cy: 700, dy: 700 - H / 2 });

  // ---------- clarão do impacto ----------
  let flash = '';
  if (aImp > -0.02 && aImp < 0.26) flash = `<rect width="${W}" height="${H}" fill="#fff" opacity="${f(0.34 * Math.pow(1 - inv(-0.02, 0.26, aImp), 2))}"/>`;

  return s + `<g transform="translate(${f(qx)} ${f(qy)})">${c}</g>` + flash;
}
