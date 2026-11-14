// Cena "regua" (32,30–41,96 s): "Esses sinais mostram onde ela está hoje na régua de adoção: resiste, observa,
// experimenta, adota, ou multiplica."
// VERSÃO LIMPA, 16:9 (esquema B). A RÉGUA DE ADOÇÃO é a ESTRADA do mapa de trilha, que ocupa a largura toda do
// quadro. O mapa fica inteiro e parado (sem câmera).
// A estrada se desenha de 'esses_sinais' até 'regua'. Em 'hoje' os pinos das Pessoas A e B aparecem no começo da
// estrada e, em 'regua', começam a percorrê-la. Em cada 'nivelN' a estação nasce (um foco por vez: as anteriores
// recuam para 45%) e o cartão-legenda mostra a marca da vez (nome + definição). O pino B para antes de Observa;
// o pino A segue e para ao lado de Adota (os mesmos lugares em que a cena "mapa" os encontra).
// O único detalhe vivo é o tracejado da estrada. Sem personagens: pessoas são pinos com a letra A ou B.
import { MG, C, txt, larg, fin, back, sobe, pop, opa, disco, titulo, clamp, lerp, inv, ease, n2 } from '../base.js';
import { NIVEIS, HEROIS, nivelDe } from '../modelo.js';
import { fundoVivo, sombra, geoTrilha, mapaTrilha, pinoMapa } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const CHIP = '02 · A régua';
export const LEGENDA = true;

// ---------- geometria (quadro 16:9, esquema B: título em uma linha e o mapa na largura toda) ----------
const TY = 188;                                                  // linha de base do título (72 px, uma linha de 1641 px); sobe um
                                                                 // pouco para a bandeira de Multiplica não encostar nele
// O mapa de trilha é desenhado numa geometria lógica de 1280 x 470 e ampliado 1,35x: ocupa x 96–1824, y 250–884
// no quadro (rótulos das estações com 35 px efetivos, letra dos pinos com 27 px). É a mesma geometria da cena "mapa".
const MX = MG, MY = 250, MK = 1.35;
const G = geoTrilha(0, 0, 1280, 470);
const noMapa = corpo => `<g transform="translate(${MX} ${MY}) scale(${MK})">${corpo}</g>`;
const AVISO = 'Retrato do momento, neste projeto. Não é avaliação de desempenho.';
const AY = 905;                                                  // salvaguarda: uma linha de 26 px na margem esquerda, no pé do palco
const NA = nivelDe(HEROIS.A.sinais);                             // Adota (3); a Pessoa B fica em Observa (1)

// rótulo de cada estação (a mesma conta de mapaTrilha), para o fundo opaco de quem recua
const ROT = NIVEIS.map((n, i) => {
  const [ex, ey] = G.est(i), wl = larg(n.rot, 26, { w: 700 }) + 30, lado = [1, 1, -1, 1, -1][i];
  return { x: ex + lado * 58 + (lado < 0 ? -wl : 0), y: ey + (i === 1 ? 26 : -18), w: wl, h: 42 };
});

// percurso de cada pino (coordenadas lógicas do mapa): nasce em U0 e anda até U1. O pino A deixa a estrada em U1 e
// dá um passo para o lado da estação Adota; o pino B para na estrada, logo antes de Observa. São os mesmos lugares
// dos pinos na cena "mapa": G.vaga(3, 0, 4) e G.em(0.20).
// UBM (onde o pino B freia) fica depois do rótulo de Resiste, que neste formato se apoia na estrada.
const UA0 = 0.075, UA1 = 0.62, UB0 = 0.02, UBM = 0.186, UB1 = 0.20;
const PA = G.vaga(NA, 0, 4);                                     // ao lado de Adota

// perfil de velocidade em trapézio: acelera, cruza em velocidade constante, freia
const trap = (p, a = 0.12) => (p <= 0 ? 0 : p >= 1 ? 1 : p < a ? p * p / (2 * a * (1 - a)) : p > 1 - a ? 1 - (1 - p) * (1 - p) / (2 * a * (1 - a)) : (p - a / 2) / (1 - a));

// ---------- os pinos ----------
// pino A: percorre a estrada e dá um passo curto para o lado de Adota
function pinoA(t, T) {
  const u = UA0 + (UA1 - UA0) * trap(inv(T.tA0, T.tA1, t));
  const [rx, ry] = G.em(u), [sx, sy] = G.em(UA1);
  const k = inv(T.tA1, T.tAp, t), q = ease.inOut(k);
  return { x: k > 0 ? lerp(sx, PA[0], q) : rx, y: k > 0 ? lerp(sy, PA[1], q) : ry, hop: 10 * Math.sin(Math.PI * k) };
}
// pino B: passa do lugar de Resiste, freia e avança devagar até parar antes de Observa
function pinoB(t, T) {
  const u = UB0 + (UBM - UB0) * trap(inv(T.tB0, T.tBm, t)) + (UB1 - UBM) * ease.inOut(inv(T.tBm, T.tB1, t));
  const [x, y] = G.em(u);
  return { x, y, hop: 0 };
}

// ---------- cartão-legenda: a marca da vez (nome + definição), troca a cada marca dita ----------
// Fica fora do grupo ampliado, em coordenadas do quadro: canto superior esquerdo do palco, na margem, longe da
// estrada e das estações.
const NS = 38, DS = 30;
const TXW = Math.max(...NIVEIS.map(n => Math.max(larg(n.def, DS), larg(n.rot, NS, { w: 700 }))));
const LEG = { x: MG, y: 270, h: 132, r: 40 };
LEG.w = Math.round(28 + 2 * LEG.r + 24 + TXW + 40);
function cartaoLegenda(t, T) {
  const k = fin(t, T.tN[0] - 0.04, 0.4);
  if (k <= 0.001) return '';
  const tx = LEG.x + 28 + 2 * LEG.r + 24;
  let corpo = '';
  NIVEIS.forEach((n, j) => {
    const ta = T.tN[j], kin = j ? fin(t, ta, 0.3) : 1, kout = j < 4 ? fin(t, T.tN[j + 1] - 0.12, 0.14) : 0;
    const o = clamp(kin * 1.4) * (1 - kout);
    if (o <= 0.001) return;
    const c = disco(n.ic, LEG.x + 28 + LEG.r, LEG.y + LEG.h / 2, LEG.r, { fundo: n.cor, c: n.tx, u: inv(ta, ta + 0.45, t) })
      + txt(n.rot, tx, LEG.y + 60, { w: 700, s: NS })
      + txt(n.def, tx, LEG.y + 101, { s: DS, c: C.navy80 });
    corpo += `<g opacity="${f(o)}" transform="translate(0 ${f((1 - kin) * 10)})">${c}</g>`;
  });
  return sobe(k, sombra(`<rect x="${LEG.x}" y="${LEG.y}" width="${LEG.w}" height="${LEG.h}" rx="20" fill="${C.white}"/>`, true) + corpo, 18);
}

export function desenhar(t, ctx) {
  const { t0, t1, m } = ctx;
  const tSinais = m('esses_sinais'), tHoje = m('hoje'), tRegua = m('regua');
  const tN = [1, 2, 3, 4, 5].map(n => m('nivel' + n) - 0.06);      // cada estação nasce um pouco antes da palavra
  const tFim = t1 - 0.6;                                           // fecho: todas as estações voltam a 100%
  const T = {
    tN,
    tPinB: tHoje - 0.08, tPinA: tHoje + 0.04,                      // "hoje": os dois pinos aparecem no começo da estrada
    tA0: tRegua - 0.15, tA1: tN[3] - 0.5, tAp: tN[3] - 0.06,       // pino A: sai na frente e dá o passo para o lado de Adota
    tB0: tRegua + 0.25, tBm: tN[0] - 0.2, tB1: m('nivel2') + 0.12,  // pino B: anda, freia e para antes de Observa
  };
  let s = fundoVivo(t, { seed: 12 });
  let mp = '';                                                     // tudo o que é do mapa, em coordenadas lógicas

  // ---------- o mapa: ilha e estrada (o tracejado correndo é o único detalhe vivo) ----------
  mp += mapaTrilha(G, { u: inv(tSinais, tRegua, t), uEst: [0, 0, 0, 0, 0], uTerreno: inv(t0 + 0.1, t0 + 0.9, t), t });

  // ---------- estações: cada uma nasce na sua palavra; a que já foi dita recua para 45% até o fecho ----------
  const volta = fin(t, tFim, 0.35);
  NIVEIS.forEach((n, i) => {
    const uE = [0, 0, 0, 0, 0];
    uE[i] = inv(tN[i], tN[i] + 0.5, t);
    if (uE[i] <= 0) return;
    const [ex, ey] = G.est(i);
    const foco = i < 4 ? 1 - fin(t, tN[i + 1] - 0.05, 0.3) : 1 - volta;
    const recua = i < 4 ? 0.55 * (1 - foco) * (1 - volta) : 0;
    const esc = 1 + 0.1 * foco;
    // o foco cresce em torno do centro da estação; a do topo (Multiplica) cresce a partir da ponta da bandeira,
    // para baixo, e assim não invade a faixa do título
    const py = i === 4 ? ey - 97 : ey;
    if (recua > 0.001) {
      const L = ROT[i];
      mp += opa(clamp(recua * 6), pop(esc, ex, py, `<circle cx="${f(ex)}" cy="${f(ey)}" r="46" fill="${C.white}"/>`
        + `<rect x="${f(L.x + 1)}" y="${f(L.y + 1)}" width="${f(L.w - 2)}" height="${L.h - 2}" rx="${L.h / 2 - 1}" fill="${C.white}"/>`));
    }
    mp += opa(1 - recua, pop(esc, ex, py, mapaTrilha(G, { terreno: false, u: 0, uEst: uE, foco: -1, t: 0 })));
  });

  // ---------- os dois pinos na estrada ----------
  [{ id: 'B', h: HEROIS.B, e: pinoB(t, T), ta: T.tPinB }, { id: 'A', h: HEROIS.A, e: pinoA(t, T), ta: T.tPinA }]
    .sort((a, b) => a.e.y - b.e.y)
    .forEach(p => { mp += pinoMapa(p.e.x, p.e.y, { cor: p.h.cor, s: 1, k: back(t, p.ta, 0.4), rotulo: p.id, anel: C.navy, hop: p.e.hop }); });
  s += noMapa(mp);

  // ---------- título (uma linha), cartão-legenda e salvaguarda, em coordenadas do quadro ----------
  s += titulo(['Onde cada pessoa está *hoje* na régua de adoção'], MG, TY, t, t0 + 0.15);
  s += cartaoLegenda(t, T);
  // a linha cruza a beira da ilha: ganha um contorno claro por baixo das letras (texto de mapa), sem caixa
  s += sobe(fin(t, tHoje + 0.12, 0.45), txt(AVISO, MG, AY, { s: 26, c: C.navy80 }).replace('<text ', `<text paint-order="stroke" stroke="${C.white}" stroke-width="7" stroke-linejoin="round" `), 14);
  return s;
}
