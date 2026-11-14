// Cena "vivo" (57,95–72,46 s): "Mas o mapa precisa estar vivo. Posição é momento, não rótulo: pessoas avançam, travam,
// recuam. A cada onda, medimos de novo e ajustamos o plano, antes e depois do go-live."
// Versão LIMPA, composta para 16:9 no esquema A (duas colunas, com a janela larga): três blocos e nada mais.
//   Esquerda (x 96–640)
//   1. O indicador AO VIVO (o ponto pulsando é o único detalhe vivo da cena) e o título em duas linhas. O indicador
//      nasce na mesma altura do topo da janela (y 150).
//   2. O cartão de aviso, com a base na mesma altura da base da janela (y 900): "Posição é momento, não rótulo." e
//      depois "Plano de mudança ajustado · v2 / v3".
//   Direita (x 720–1824, y 150–900)
//   3. A janela do dashboard em duas metades: à esquerda o MAPA DE CALOR (áreas x régua); à direita um cartão com o
//      ÍNDICE DE ADOÇÃO em número grande, em cima, e a LINHA por onda com o marco GO-LIVE, embaixo.
// As colunas do mapa de calor ficam estreitas no quadro horizontal; por isso o cabeçalho de cada marca da régua é uma
// faixa vertical na cor da marca, com o nome girado (28 px), e as células ficam quase quadradas.
// Roteiro: a janela sobe e monta; em 'vivo' o indicador acende; em "Posição" entra o aviso; em avançam / travam / recuam
// uma etiqueta marca uma célula do mapa de calor; em 'medimos' o cursor clica em "Onda 2" e o mapa, o índice (20% -> 32%)
// e a linha mudam; em 'plano' o aviso vira "Plano de mudança ajustado"; em 'antes' o cursor clica em "Onda 3"
// (32% -> 56%) e em 'go-live' a linha cruza o marco, que acende em laranja, e o plano vira v3.
// Depois que entra, cada elemento fica parado. Sem câmera, sem brilhos, sem varreduras. Sem logos, sem personagens.
import { MG, C, txt, larg, fin, fout, back, pop, opa, sobe, tracar, selo, icone, titulo, clamp, lerp, inv, ease, kf, n2 } from '../base.js';
import { NIVEIS, AREAS } from '../modelo.js';
import { fundoNoite } from '../ludico.js';
import { janela, geoCalor, cursor, INDICES, indiceEm, naCelula } from '../painelUI.js';

const f = n2;
export const FUNDO = 'navy';
export const CHIP = '05 · O mapa vivo';
export const LEGENDA = true;

// mistura de duas cores #RRGGBB (u: 0 = a, 1 = b)
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, u) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join('');
};
// inversa de ease.inOut (para comandar a linha de tendência com progresso linear)
const invIO = p => (p < 0.5 ? Math.cbrt(p / 4) : 1 - Math.cbrt(2 * (1 - p)) / 2);

// ---------- geometria ----------
const TX0 = MG, TX1 = 640;                                 // coluna de texto: x 96–640
const WX = 720, WY = 150, WW = 1104, WH = 750;             // janela do dashboard: x 720–1824, y 150–900
const KJ = 1.25, BAR = 58 * KJ;                            // a janela do kit é ampliada 1,25x: barra de 72,5 px, título de 30 px
const PAD = 28;
const JX = WX + PAD, JY = Math.round(WY + BAR + 27), JW = WW - 2 * PAD, JH = WY + WH - PAD - JY;   // área útil: 748–1796 x 250–872
const TITULO_J = 'Mapa de Adoção';
const SELO_K = 1.9, SELO_X = WX + 112 * KJ + larg(TITULO_J, 24, { w: 700 }) * KJ + 20;   // selo ampliado: texto de 14 -> 26,6 px
const ABAS = ['Onda 1', 'Onda 2', 'Onda 3'];
const TABS = 26, TABH = 46;
const TAB = (() => {                                       // abas desenhadas na cena (texto de 26 px)
  let ax = WX + WW - PAD;                                 // a última aba termina na guia direita da área útil
  const out = [];
  for (let i = ABAS.length - 1; i >= 0; i--) {
    const wl = larg(ABAS[i], TABS, { w: 700 }) + 40;
    ax -= wl;
    out[i] = { x: ax, w: wl, cx: ax + wl / 2, cy: WY + BAR / 2 };
    ax -= 10;
  }
  return out;
})();
// duas metades: mapa de calor (636 px) e cartão do índice (384 px), com 28 px entre elas
const GW = 636, GAP = 28;
const AS = 28, HS = 28, NS = 40;                                               // corpo: áreas, marcas da régua e números
const GC = geoCalor(JX, JY, GW, JH, { rotW: 162, cab: 174 });                  // células de 94,8 x 112 px
const IC = { x: JX + GW + GAP, y: JY, w: JW - GW - GAP, h: JH - 4 };           // cartão do índice: número em cima, linha embaixo; base na base das células
const NUM = { s: 132, y: IC.y + 190 };                                         // número grande (linha de base)
const CH = { x: IC.x + 20, w: IC.w - 40 };                                     // área da linha dentro do cartão
const GOY = IC.y + 264, GOH = 44;                                              // pílula GO-LIVE (centro e altura)
const Y0 = IC.y + IC.h - 76, Y70 = Y0 - 228;                                   // eixo: 0% e 70%
const tpx = i => CH.x + 52 + (CH.w - 104) * i / 2, tpy = v => Y0 - (Y0 - Y70) * v / 70;
const GX = (tpx(1) + tpx(2)) / 2;                                              // x do marco GO-LIVE
const NT = { x: TX0, w: TX1 - TX0, h: 200, y: WY + WH - 200 };                 // cartão de aviso: base na base da janela

// as três células-exemplo do mapa de calor (posições da onda 1): [área, marca]
const EX = [
  { rot: 'avança', ic: 'setaDir', cel: [1, 1], cor: C.blue, tx: C.white },     // Operações × Observa
  { rot: 'trava', ic: 'pausa', cel: [3, 0], cor: C.gray, tx: C.navy },         // Suprimentos × Resiste
  { rot: 'recua', ic: 'setaEsq', cel: [2, 3], cor: C.orange, tx: C.navy },     // Comercial × Adota
];
// pessoas em cada célula do mapa de calor, por onda: CEL[área][marca][onda]
const CEL = [0, 1, 2, 3].map(a => [0, 1, 2, 3, 4].map(n => [0, 1, 2].map(od => naCelula(a, n, od))));

// ---------- componentes da cena ----------
// mapa de calor áreas x régua (onda fracionária 0..2). Entra coluna por coluna, com fade e subida curta.
function mapaCalor(ond, u) {
  const o = clamp(ond, 0, 2), i = Math.min(1, Math.floor(o)), k = ease.inOut(o - i);
  const hc = GC.cab - 10;                                  // altura da faixa do cabeçalho
  let s = '';
  AREAS.forEach((nome, a) => { s += opa(ease.out(clamp(u * 2)), txt(nome, GC.x, GC.y + GC.cab + GC.rh * (a + 0.5) + AS * 0.35, { w: 700, s: AS, c: C.white })); });
  NIVEIS.forEach((nv, n) => {
    const kc = ease.out(clamp(u * 2.2 - n * 0.2));
    if (kc <= 0.001) return;
    const x0 = GC.x + GC.rotW + GC.cw * n, cx = x0 + GC.cw / 2, cor = nv.cor === C.navy ? C.blue80 : nv.cor;
    // cabeçalho: faixa vertical na cor da marca, com o nome girado (lê-se de baixo para cima)
    let b = `<rect x="${f(x0 + 4)}" y="${f(GC.y)}" width="${f(GC.cw - 8)}" height="${f(hc)}" rx="10" fill="${nv.cor}"${nv.cor === C.navy ? ` stroke="${C.blue40}" stroke-width="1.5"` : ''}/>`
      + `<g transform="translate(${f(cx)} ${f(GC.y + hc / 2)}) rotate(-90)">${txt(nv.rot, 0, HS * 0.35, { w: 700, s: HS, c: nv.tx, a: 'middle' })}</g>`;
    for (let a = 0; a < 4; a++) {
      const q0 = CEL[a][n][i], q1 = CEL[a][n][i + 1], q = lerp(q0, q1, k), v = Math.round(q), forca = clamp(q / 3);
      const [, y0, cw, rh] = GC.cel(a, n), cy = y0 + rh / 2;
      b += `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="12" fill="rgba(255,255,255,.06)"/>`
        + `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="12" fill="${cor}" opacity="${f(lerp(0.08, 0.3 + 0.7 * forca, clamp((q - 0.15) / 0.5)))}"/>`;
      if (v < 1) continue;
      // célula que enche ou esvazia: o número aparece / some com fade
      const op = Math.min(q0, q1) < 1 && q < 1 ? clamp((q - 0.5) / 0.35) : 1;
      b += txt(String(v), cx, cy + NS * 0.35, { w: 700, s: NS, c: nv.tx === C.navy && forca > 0.6 ? C.navy : C.white, a: 'middle', o: op });
    }
    s += sobe(kc, b, 14);
  });
  return s;
}
// etiqueta do movimento: a própria célula vira a etiqueta (ícone em cima, palavra embaixo), 6 px maior que a célula
function etiq(ex, k) {
  if (k <= 0.001) return '';
  const [x0, y0, cw, rh] = GC.cel(...ex.cel), [cx, cy] = GC.centro(...ex.cel), e = 6;
  const b = `<rect x="${f(x0 + 4 - e)}" y="${f(y0 + 4 - e)}" width="${f(cw - 8 + 2 * e)}" height="${f(rh - 8 + 2 * e)}" rx="14" fill="${ex.cor}" stroke="${C.white}" stroke-width="3.5"/>`
    + icone(ex.ic, cx, cy - 20, 38, { c: ex.tx, sw: 3.2 })
    + txt(ex.rot, cx, cy + 35, { w: 700, s: 28, c: ex.tx, a: 'middle' });
  return opa(clamp(k * 1.5), pop(0.8 + 0.2 * k, cx, cy, b));
}
// cartão do índice: número grande em cima e linha por onda embaixo.
// ondL = até onde a linha já foi (0..2); u = entrada; kGo = marco aceso (0..1)
function indice(valor, ondL, u, kGo) {
  const onda = clamp(ondL, 0, 2);
  let s = `<rect x="${IC.x}" y="${IC.y}" width="${IC.w}" height="${IC.h}" rx="16" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>`
    + txt('ÍNDICE DE ADOÇÃO', IC.x + 28, IC.y + 54, { w: 700, s: 26, ls: 1.2, c: C.blue40 })
    + txt(valor, IC.x + 22, NUM.y, { f: 'L', s: NUM.s, c: C.white });
  // eixo e rótulos das ondas
  s += tracar(`M${f(CH.x + 8)},${f(Y0)} L${f(CH.x + CH.w - 8)},${f(Y0)}`, ease.out(u), { c: 'rgba(255,255,255,.2)', sw: 2 });
  ABAS.forEach((r, i) => {
    const on = i <= onda + 0.05;
    s += opa(clamp(u * 2 - i * 0.3), txt(r, tpx(i), IC.y + IC.h - 28, { w: on ? 700 : 400, s: 26, c: on ? C.white : C.blue40, a: 'middle' }));
  });
  // marco GO-LIVE: discreto até a fala chegar nele; aí acende em laranja
  {
    const wl = larg('GO-LIVE', 26, { w: 700, ls: 1.2 }) + 32;
    const g = `<path d="M${f(GX)},${f(GOY + GOH / 2 + 8)} L${f(GX)},${f(Y0)}" stroke="${mix('#7C97AF', C.orange, kGo)}" stroke-width="3" stroke-dasharray="7 8"/>`
      + (kGo > 0.001 ? `<rect x="${f(GX - wl / 2)}" y="${f(GOY - GOH / 2)}" width="${f(wl)}" height="${GOH}" rx="${GOH / 2}" fill="${C.orange}" opacity="${f(kGo)}"/>` : '')
      + txt('GO-LIVE', GX, GOY + 9, { w: 700, s: 26, ls: 1.2, c: mix(C.blue40, C.navy, kGo), a: 'middle' });
    s += opa(clamp(u * 2 - 0.6), g);
  }
  // linha até a onda atual
  if (u > 0.5) {
    const pts = [[tpx(0), tpy(INDICES[0])]];
    for (let i = 1; i <= 2; i++) {
      if (onda >= i) pts.push([tpx(i), tpy(INDICES[i])]);
      else if (onda > i - 1) { const k = ease.inOut(onda - (i - 1)); pts.push([lerp(tpx(i - 1), tpx(i), k), lerp(tpy(INDICES[i - 1]), tpy(INDICES[i]), k)]); break; }
    }
    const ult = pts[pts.length - 1], ko = clamp(u * 2 - 1);
    let g = `<path d="M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}" fill="none" stroke="${C.blue40}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (let i = 0; i <= 2; i++) {
      // o ponto de partida só ganha rótulo quando a linha sai dele (antes disso o número grande já diz 20%)
      const ki = i === 0 ? clamp(onda / 0.1) : clamp((onda - i + 0.02) / 0.02);
      if (ki <= 0.001) continue;
      g += opa(ki, txt(INDICES[i] + '%', tpx(i), tpy(INDICES[i]) - 26, { w: 700, s: 26, c: C.white, a: 'middle' }));
    }
    g += `<circle cx="${f(ult[0])}" cy="${f(ult[1])}" r="12" fill="${C.white}" stroke="${C.navy}" stroke-width="3.5"/>`;
    s += opa(ko, g);
  }
  return s;
}

export function desenhar(t, ctx) {
  const { t0, m, mb } = ctx;
  // ---------- tempos ----------
  const tVivo = m('vivo') - 0.06;
  const tNot = m('momento') - 0.86;                        // o aviso entra em "Posição"
  const tMom = m('momento') - 0.06, tRisca = m('rotulo') + 0.1;
  const tEx = ['avancam', 'travam', 'recuam'].map(k => m(k) - 0.08);
  const tSai = mb('recuam') + 0.12;                        // as etiquetas saem
  const tC1 = m('medimos') - 0.04;                         // clique em "Onda 2"
  const tW1 = m('plano') - 0.32;                           // a onda 2 termina de ser lida
  const tAl = m('plano') - 0.14;                           // aviso do plano
  const tC2 = m('antes') - 0.05;                           // clique em "Onda 3"
  const tGo = m('golive') - 0.05;                          // a linha cruza o marco GO-LIVE
  const tW2 = m('golive') + 0.5;                           // a onda 3 termina de ser lida
  const tV3 = tGo + 0.3;                                   // o plano vira v3

  // onda fracionária (0..2) que alimenta o mapa de calor e o índice
  const o1 = inv(tC1 + 0.05, tW1, t), o2 = inv(tC2 + 0.05, tW2, t);
  const ond = o1 + o2;
  // a linha tem o seu próprio relógio na onda 3: chega ao marco GO-LIVE na palavra e segue até a onda 3
  const pL = t < tGo ? 0.5 * ease.sine(inv(tC2 + 0.08, tGo, t)) : 0.5 + 0.5 * ease.out(inv(tGo, tGo + 0.5, t));
  const ondL = t <= tC2 ? o1 : 1 + invIO(pL);
  const aba = t < tC1 ? 0 : t < tC2 ? 1 : 2;

  // ---------- coluna da esquerda: indicador AO VIVO e título ----------
  let cena = '';
  {
    const k = fin(t, t0 + 0.55, 0.45), on = fin(t, tVivo, 0.35);
    const sz = 28, wT = larg('AO VIVO', sz, { w: 700, ls: 2 }), h = 56, w = 26 + 20 + 14 + wT + 28, x0 = TX0, y0 = WY, cy = y0 + h / 2;
    // único detalhe vivo da cena: o ponto pisca devagar
    const pisca = 1 - 0.5 * on * (0.5 - 0.5 * Math.cos((t - tVivo) * Math.PI * 2 / 1.5));
    const b = `<rect x="${f(x0)}" y="${y0}" width="${f(w)}" height="${h}" rx="${h / 2}" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.3)" stroke-width="2"/>`
      + `<circle cx="${f(x0 + 36)}" cy="${cy}" r="10" fill="${mix(C.navy40, C.orange, on)}" opacity="${f(pisca)}"/>`
      + txt('AO VIVO', x0 + 60, cy + sz * 0.35, { w: 700, s: sz, ls: 2, c: mix(C.navy40, C.white, on) });
    cena += sobe(k, b, 16);
  }
  cena += titulo(['O mapa precisa', 'estar *vivo*'], TX0, 304, t, t0 + 0.15, { escuro: true });

  // ---------- janela do dashboard (kit ampliado 1,25x) ----------
  let w = `<g transform="translate(${WX} ${WY}) scale(${KJ})">${janela(0, 0, WW / KJ, WH / KJ, { titulo: TITULO_J }).svg}</g>`;
  // selo ampliado 1,9x: o texto do selo passa de 14 para 26,6 px
  w += `<g transform="translate(${f(SELO_X)} ${f(WY + (BAR - 26 * SELO_K) / 2)}) scale(${SELO_K})">${selo('Ilustrativo', 0, 0)}</g>`;
  TAB.forEach((tb, i) => {
    const on = i === aba;
    w += `<rect x="${f(tb.x)}" y="${f(tb.cy - TABH / 2)}" width="${f(tb.w)}" height="${TABH}" rx="${TABH / 2}" fill="${on ? C.white : 'none'}" stroke="${on ? 'none' : 'rgba(255,255,255,.3)'}" stroke-width="1.5"/>`
      + txt(ABAS[i], tb.cx, tb.cy + TABS * 0.35, { w: 700, s: TABS, c: on ? C.navy : C.white, a: 'middle' });
  });

  // ---------- metade esquerda: mapa de calor ----------
  w += mapaCalor(ond, inv(t0 + 0.45, t0 + 1.45, t));

  // ---------- metade direita: índice de adoção (número grande + linha por onda) ----------
  const kFoco = fin(t, tEx[0] - 0.3, 0.4) * fout(t, tSai, 0.4);            // fase das etiquetas: o cartão do índice recua
  {
    const uIn = inv(t0 + 0.8, t0 + 1.6, t);
    const valor = (uIn < 1 ? Math.round(INDICES[0] * ease.out(uIn)) : Math.round(indiceEm(ond))) + '%';
    w += sobe(fin(t, t0 + 0.7, 0.45) * (1 - 0.55 * kFoco), indice(valor, ondL, inv(t0 + 0.95, t0 + 1.75, t), fin(t, tGo, 0.3)), 14);
  }

  // ---------- etiquetas sobre o mapa de calor: avança, trava, recua ----------
  EX.forEach((ex, i) => { w += etiq(ex, back(t, tEx[i], 0.4) * fout(t, tSai, 0.3)); });

  // a janela entra subindo, com fade
  cena += sobe(fin(t, t0 + 0.1, 0.55), w, 40);

  // ---------- cartão de aviso (coluna da esquerda, base alinhada à base da janela) ----------
  {
    const kN = fin(t, tNot, 0.45);
    if (kN > 0.001) {
      const cy = NT.y + NT.h / 2, px = NT.x + 36;
      let b = `<rect x="${NT.x}" y="${NT.y}" width="${NT.w}" height="${NT.h}" rx="18" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>`;
      // 1. "Posição é momento, / não rótulo." em duas linhas
      const kA = fout(t, tAl - 0.35, 0.3);
      if (kA > 0.001) {
        const sz = 48, lh = 60, o = { w: 700 }, P1 = 'Posição é ', P2 = 'momento', P3 = ',', P4 = 'não ', P5 = 'rótulo', P6 = '.';
        const w1 = larg(P1, sz, o), w2 = larg(P2, sz, o), w4 = larg(P4, sz, o), w5 = larg(P5, sz, o);
        const y1 = cy - lh / 2 + sz * 0.35, y2 = y1 + lh;
        const uX = ease.inOut(inv(tRisca, tRisca + 0.4, t));
        let a = txt(P1, px, y1, { w: 700, s: sz, c: C.white })
          + txt(P2, px + w1, y1, { w: 700, s: sz, c: mix(C.white, C.orange, fin(t, tMom, 0.3)) })
          + txt(P3, px + w1 + w2, y1, { w: 700, s: sz, c: C.white })
          + txt(P4, px, y2, { w: 700, s: sz, c: C.white })
          + txt(P5, px + w4, y2, { w: 700, s: sz, c: mix(C.white, C.navy40, uX) })
          + txt(P6, px + w4 + w5, y2, { w: 700, s: sz, c: C.white });
        if (uX > 0) a += `<rect x="${f(px + w4 - 5)}" y="${f(y2 - sz * 0.32)}" width="${f((w5 + 10) * uX)}" height="4.5" rx="2.25" fill="${C.white}"/>`;
        b += opa(kA * (1 - 0.5 * fin(t, tEx[0] - 0.3, 0.4)), a);           // recua quando o foco passa para as etiquetas
      }
      // 2. "Plano de mudança / ajustado · v2" (v2 na onda 2, v3 depois do go-live)
      const kP = fin(t, tAl - 0.05, 0.45);
      if (kP > 0.001) {
        const sz = 40, lh = 52, r = 36, dx = px + r, xt = dx + r + 24, y1 = cy - lh / 2 + sz * 0.35, y2 = y1 + lh;
        const k2 = fout(t, tV3, 0.15), k3 = fin(t, tV3 + 0.15, 0.25), xv = xt + larg('ajustado ', sz, { w: 700 }) + 4;
        let a = pop(back(t, tAl, 0.45), dx, cy, `<circle cx="${dx}" cy="${cy}" r="${r}" fill="${C.blue}"/>` + icone('plano', dx, cy, 42, { c: C.white, sw: 2.8 }))
          + txt('Plano de mudança', xt, y1, { w: 700, s: sz, c: C.white })
          + txt('ajustado', xt, y2, { w: 700, s: sz, c: C.white })
          + txt('· v2', xv, y2, { s: sz, c: C.blue40, o: k2 })
          + txt('· v3', xv, y2, { s: sz, c: C.blue40, o: k3 });
        b += sobe(kP, a, 10);
      }
      cena += sobe(kN, b, 16);
    }
  }

  // ---------- cursor: aparece só para os dois cliques nas abas ----------
  [tC1, tC2].forEach((tc, j) => {
    const o = fin(t, tc - 0.55, 0.2) * fout(t, tc + 0.5, 0.3);
    if (o <= 0.001) return;
    // a ponta do cursor pousa no canto inferior direito da aba, sem cobrir o texto
    const tb = TAB[j + 1], P1 = [tb.x + tb.w - 16, tb.cy + 13], P0 = [P1[0] + 30, P1[1] + 76];
    const [x, y] = kf(t, [[tc - 0.55, P0], [tc - 0.08, P1]]);
    cena += opa(o, cursor(x, y, { clique: inv(tc, tc + 0.45, t), s: 1.4 }));
  });

  return fundoNoite(t) + cena;
}
