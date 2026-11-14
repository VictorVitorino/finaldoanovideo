// Cena "mapa" (41,92–47,18 s): "Junte as posições, área por área, e nasce o Mapa de Adoção."
// Versão limpa, composta para 16:9 (esquema B: título em uma linha e o mapa de trilha na largura toda).
// O mapa de trilha da cena anterior fica parado e completo, sem câmera. Os pinos das Pessoas A e B
// já estão no lugar (assentam uma vez, antes da primeira leva). De 'junte' até pouco antes de 'nasce', as outras
// 23 pessoas aparecem em quatro levas, ÁREA POR ÁREA: uma única etiqueta no canto do palco diz o nome da área da
// vez e as áreas que já entraram recuam (um foco por vez). Em 'nasce' a etiqueta sai, o mapa inteiro volta a 100%
// e "Mapa de Adoção" entra na continuação da linha do título, com o fio laranja se desenhando até 'mapa_adocao'.
// O placar conta as pessoas e as áreas e termina em "25 pessoas · 4 áreas · 5 marcas", com o selo ILUSTRATIVO.
// Único detalhe vivo: o tracejado da estrada.
// Salvaguardas no pé do palco: "Leitura agregada por área." e
// "Retrato do momento, neste projeto. Não é avaliação de desempenho."
import { W, MG, C, txt, larg, fin, fout, back, opa, pilula, selo, titulo, clamp, lerp, inv, ease, n2 } from '../base.js';
import { NIVEIS, AREAS, PESSOAS } from '../modelo.js';
import { fundoVivo, sombra, geoTrilha, mapaTrilha, pinoMapa } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const CHIP = '03 · O mapa';
export const LEGENDA = true;

// ---------- geometria ----------
// O mapa é desenhado numa geometria lógica de 1280 x 470 e ampliado 1,35x: ocupa x 96–1824, y 250–884 do quadro
// (a mesma conta da cena anterior, "regua", para o corte casar). Estações, estrada e os 25 pinos vivem nesse grupo.
const G = geoTrilha(0, 0, 1280, 470);
const MAPA = { x: MG, y: 250, k: 1.35 };
const X1 = W - MG;                                       // margem direita (1824)
const TY = 200, TS = 72;                                 // título: uma linha, Light 72 px
const T1 = 'Área por área, nasce o', T2 = 'Mapa de Adoção';
const SP = 0.62;                                         // escala dos pinos (a do kit); no quadro, 0,84
const SH = 0.8;                                          // escala final dos pinos A e B; no quadro, 1,08
const GOTA = 'M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z';
const PASSO = 0.065;                                     // intervalo entre as pessoas de uma leva
const RECUO = 0.5;                                       // quanto as áreas que já entraram recuam
const LBL = { x: MG, y: 262, h: 56, s: 30 };             // etiqueta da área da vez (canto superior esquerdo do palco)
const BAR = { y: 808, h: 76 };                           // placar (canto inferior direito do mapa, fora da ilha)
const KS = 1.9;                                          // ampliação do selo do kit (14 px -> 26,6 px)
const PE = { y: 882, h: 40, s: 26 };                     // faixa das salvaguardas (linha de base em y ≈ 911)

// onde cada pessoa fica (onda 1), em coordenadas lógicas do mapa. Lugares compostos para o mapa largo: nenhum pino
// fica em cima de uma bandeira, de um rótulo, no meio da pista, na beira da ilha ou encostado no anel de A e B.
const PA = G.vaga(3, 0, 4);                              // Pessoa A: ao lado de Adota (onde a cena anterior a deixou)
const PB0 = G.em(0.20);                                  // Pessoa B: onde parou na cena anterior (na estrada, antes de Observa)
const POS = {
  // Resiste (6): arco à esquerda da estação e duas pessoas depois da bandeira
  6: [84, 372], 7: [112, 334], 2: [152, 310], 19: [186, 298], 18: [284, 344], 23: [326, 334],
  // Observa (8): B sai da estrada; três acima, à esquerda da bandeira; duas entre as pistas; duas abaixo da pista
  1: [436, 320], 3: [486, 318], 8: [520, 292], 9: [558, 286], 12: [676, 305], 15: [722, 304], 20: [536, 446], 21: [590, 446],
  // Experimenta (6): grupo à direita da estação
  4: [1114, 232], 5: [1160, 238], 10: [1136, 286], 13: [1182, 292], 17: [1108, 338], 22: [1154, 344],
  // Adota (4): A e um arco que sobe à esquerda da estação
  0: PA, 11: [514, 150], 14: [548, 116], 24: [590, 102],
  // Multiplica (1)
  16: [1102, 144],
};
// ordem de entrada em cada área: da estação Resiste para a Multiplica (o sentido da estrada). A e B já estão no mapa.
const FILA = AREAS.map((_, a) => PESSOAS.filter(p => p.area === a && !p.heroi).sort((p, q) => p.niv[0] - q.niv[0] || p.id - q.id));
const ORDEM = {};
FILA.forEach(fila => fila.forEach((p, k) => { ORDEM[p.id] = k; }));

// pino comum (pinoMapa do kit). k = escala de entrada, em torno da ponta
function pino(x, y, cor, k) {
  // o azul-40 de Experimenta some sobre a ilha clara: ganha um filete azul por fora da borda branca
  return (cor === C.blue40 ? `<g transform="translate(${f(x)} ${f(y)}) scale(${f(SP * k)})"><path d="${GOTA}" fill="none" stroke="${C.blue}" stroke-width="9"/></g>` : '')
    + pinoMapa(x, y, { cor, s: SP, k });
}
// pinos das Pessoas A e B: o desenho do kit (gota + anel navy), com a letra sempre legível. s vai de 1 (como na
// cena anterior) a SH; a cabeça branca cresce um pouco para a letra caber. A letra tem 22 px lógicos (30 px no quadro)
function pinoHeroi(x, y, o) {
  const s = o.s, cy = y - 42 * s, u = inv(1, SH, s);
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(13 * s)}" ry="${f(5 * s)}" fill="${C.navy}" opacity=".22"/>`
    + `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="${GOTA}" fill="${o.cor}" stroke="${C.white}" stroke-width="4"/>`
    + `<circle cx="0" cy="-42" r="30" fill="none" stroke="${C.navy}" stroke-width="5"/></g>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(lerp(12, 14, u))}" fill="${C.white}"/>`
    + txt(o.letra, x, cy + 7.8, { w: 700, s: 22, c: C.navy, a: 'middle' });
}

// medidas de texto (as fontes só existem depois de carregadas: mede uma vez, no primeiro quadro)
let MED = null;
function medidas() {
  if (MED) return MED;
  const SN = 48, SL = 28;
  MED = {
    LW: AREAS.map(n => larg(n, LBL.s, { w: 700 }) + 48 + 30),
    x2: MG + larg(T1 + ' ' + T2, TS, { f: 'L' }) - larg(T2, TS, { f: 'L' }),
    SN, SL,
    wn: ['25', '4', '5'].map(v => larg(v, SN, { f: 'L', w: 400 })),
    wl: ['pessoas', 'áreas', 'marcas'].map(r => larg(r, SL)),
    wSelo: (larg('ILUSTRATIVO', 14, { w: 700, ls: 2.4 }) + 22) * KS,
    w1: larg('Leitura agregada por área.', PE.s, { w: 700 }),
    w2: larg('Retrato do momento, neste projeto. Não é avaliação de desempenho.', PE.s),
  };
  return MED;
}

export function desenhar(t, ctx) {
  const { t0, m } = ctx;
  const M = medidas();
  const tJ = m('junte'), tA = m('area'), tN = m('nasce') - 0.08;
  // 1ª pessoa de cada leva: Financeiro em 'junte', Comercial em 'área', as outras duas no meio do caminho
  const dL = (tA - tJ) / 2, LAND = [tJ, tJ + dL, tA, tA + dL];
  const tPouso = p => (p.heroi ? -9 : LAND[p.area] + ORDEM[p.id] * PASSO);
  const tPop = i => LAND[i] - 0.3;                                    // a etiqueta troca logo antes de a leva chegar
  // foco: a área da vez em 100%; as que já entraram recuam até 'nasce', quando o mapa inteiro volta
  const recuo = a => (a < 3 ? Math.min(fin(t, tPop(a + 1) + 0.12, 0.3), fout(t, tN - 0.22, 0.32)) : 0);
  // quantas pessoas e áreas já estão no mapa (as Pessoas A e B contam desde o início)
  const nP = PESSOAS.filter(p => t >= tPouso(p)).length;
  const nA = Math.max(1, LAND.filter(q => t >= q).length);

  let s = fundoVivo(t);

  // ---------- o mapa (grupo ampliado): parado e completo. Só o tracejado da estrada corre ----------
  {
    let g = mapaTrilha(G, { u: 1, uEst: [0, 0, 0, 0, 0], t });
    g += mapaTrilha(G, { terreno: false, u: 0, uEst: [1, 1, 1, 1, 1], t: 0 });

    // os pinos: A e B no lugar desde o início; os outros 23 aparecem área por área
    const itens = [];
    for (const p of PESSOAS) {
      const [x, y] = POS[p.id], cor = NIVEIS[p.niv[0]].cor;
      if (p.heroi) {
        // continuidade com a cena anterior: A e B começam na escala 1 (B ainda na beira da estrada) e assentam uma
        // vez, antes de a primeira leva chegar. Não recuam: são o fio da história
        const uh = ease.inOut(inv(tJ - 0.6, tJ - 0.05, t)), sh = lerp(1, SH, uh);
        const hx = p.heroi === 'B' ? lerp(PB0[0], x, uh) : x, hy = p.heroi === 'B' ? lerp(PB0[1], y, uh) : y;
        itens.push({ y: hy, svg: pinoHeroi(hx, hy, { cor, s: sh, letra: p.heroi }) });
        continue;
      }
      const a = tPouso(p) - 0.2, u = inv(a, a + 0.34, t);
      if (u <= 0) continue;
      const o = clamp(u * 3) * (1 - RECUO * recuo(p.area));
      itens.push({ y, svg: opa(o, pino(x, y, cor, 0.6 + 0.4 * back(t, a, 0.34))) });
    }
    itens.sort((a, b) => a.y - b.y);
    g += itens.map(i => i.svg).join('');
    s += `<g transform="translate(${MAPA.x} ${MAPA.y}) scale(${MAPA.k})">${g}</g>`;
  }

  // ---------- etiqueta: uma só, com o nome da área da vez ----------
  {
    const kIn = fin(t, tPop(0), 0.35), k = Math.min(kIn, fout(t, tN - 0.22, 0.32));
    if (k > 0.001) {
      const LW = M.LW;
      let i = 0;
      for (let j = 1; j < AREAS.length; j++) if (t >= tPop(j)) i = j;
      const u = i ? inv(tPop(i), tPop(i) + 0.26, t) : 1;
      // a pílula cresce antes de o nome novo entrar e encolhe depois de o antigo sair
      const w = i ? lerp(LW[i - 1], LW[i], ease.inOut(LW[i] > LW[i - 1] ? clamp(u * 2) : clamp(u * 2 - 1))) : LW[0];
      const cy = LBL.y + LBL.h / 2, yb = cy + LBL.s * 0.35;
      const b = pilula(LBL.x, LBL.y, w, LBL.h, C.navy)
        + `<circle cx="${f(LBL.x + 28)}" cy="${f(cy)}" r="7" fill="${C.orange}"/>`
        + (i ? opa(1 - clamp(u * 2), txt(AREAS[i - 1], LBL.x + 48, yb, { w: 700, s: LBL.s, c: C.white })) : '')
        + opa(clamp(u * 2 - 1), txt(AREAS[i], LBL.x + 48, yb, { w: 700, s: LBL.s, c: C.white }));
      s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - kIn) * 12)})">${b}</g>`;
    }
  }

  // ---------- título em uma linha: a 1ª parte entra com a cena; "Mapa de Adoção" entra em 'nasce' ----------
  s += titulo([T1], MG, TY, t, t0 + 0.15, { s: TS });
  s += titulo(['*' + T2 + '*'], M.x2, TY, t, tN, { s: TS });

  // ---------- placar: conta as pessoas e as áreas; termina em 25 · 4 · 5. O selo fica logo acima ----------
  {
    const k = fin(t, t0 + 0.3, 0.45);
    if (k > 0.001) {
      const { SN, SL, wn, wl, wSelo } = M, GAP = 10, SEP = 48, PAD = 38, ch = BAR.h, y0 = BAR.y, cy = y0 + ch / 2, yb = cy + 17;
      const itens = [[nP, 'pessoas'], [nA, nA > 1 ? 'áreas' : 'área'], [5, 'marcas']];
      const cw = PAD * 2 + wn.reduce((p, q) => p + q, 0) + wl.reduce((p, q) => p + q, 0) + GAP * 3 + SEP * 2;
      const x0 = X1 - cw;
      let corpo = '', x = x0 + PAD;
      itens.forEach(([v, r], i) => {
        corpo += txt(String(v), x + wn[i], yb, { f: 'L', w: 400, s: SN, c: C.navy, a: 'end' })
          + txt(r, x + wn[i] + GAP, yb - 2, { s: SL, c: C.navy80 });
        x += wn[i] + GAP + wl[i];
        if (i < 2) { corpo += `<path d="M${f(x + SEP / 2)},${f(cy - 17)} v34" stroke="${C.navy20}" stroke-width="2" stroke-linecap="round"/>`; x += SEP; }
      });
      const cartao = sombra(`<rect x="${f(x0)}" y="${y0}" width="${f(cw)}" height="${ch}" rx="${ch / 2}" fill="${C.white}" stroke="${C.navy20}" stroke-width="1.5"/>`, true) + corpo
        + `<g transform="translate(${f(X1 - wSelo)} ${f(y0 - 14 - 26 * KS)}) scale(${KS})">${selo('Ilustrativo', 0, 0)}</g>`;
      s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - k) * 16)})">${cartao}</g>`;
    }
  }

  // ---------- salvaguardas no pé do palco, alinhadas à margem esquerda ----------
  {
    const k = fin(t, t0 + 0.42, 0.45);
    if (k > 0.001) {
      const f1 = 'Leitura agregada por área.', f2 = 'Retrato do momento, neste projeto. Não é avaliação de desempenho.';
      const { w1, w2 } = M, gap = 32, pad = 24, w = w1 + gap + w2 + pad * 2, x0 = MG, yb = PE.y + PE.h / 2 + PE.s * 0.35;
      s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - k) * 12)})"><rect x="${f(x0)}" y="${PE.y}" width="${f(w)}" height="${PE.h}" rx="${PE.h / 2}" fill="#fff" opacity=".88"/>`
        + txt(f1, x0 + pad, yb, { w: 700, s: PE.s, c: C.navy80 })
        + `<path d="M${f(x0 + pad + w1 + gap / 2)},${PE.y + 10} v20" stroke="${C.navy40}" stroke-width="1.5"/>`
        + txt(f2, x0 + pad + w1 + gap, yb, { s: PE.s, c: C.navy80 }) + `</g>`;
    }
  }
  return s;
}
