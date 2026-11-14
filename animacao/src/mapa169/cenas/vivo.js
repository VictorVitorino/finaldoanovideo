// Cena "vivo" (57,95–72,46 s): "Mas o mapa precisa estar vivo. Posição é momento, não rótulo: pessoas avançam, travam,
// recuam. A cada onda, medimos de novo e ajustamos o plano, antes e depois do go-live."
// Versão LIMPA: três blocos e nada mais.
//   1. Título com o indicador AO VIVO (o ponto pulsando é o único detalhe vivo da cena).
//   2. A janela do dashboard, com duas peças: o MAPA DE CALOR (áreas x régua) e um cartão com o ÍNDICE DE ADOÇÃO
//      em número grande ao lado da LINHA por onda, com o marco GO-LIVE.
//   3. Uma faixa de aviso embaixo da janela: "Posição é momento, não rótulo." e depois "Plano de mudança ajustado".
// Roteiro: a janela sobe e monta; em 'vivo' o indicador acende; em "Posição" entra o aviso; em avançam / travam / recuam
// uma etiqueta marca uma célula do mapa de calor; em 'medimos' o cursor clica em "Onda 2" e o mapa, o índice (20% -> 32%)
// e a linha mudam; em 'plano' o aviso vira "Plano de mudança ajustado"; em 'antes' o cursor clica em "Onda 3"
// (32% -> 56%) e em 'go-live' a linha cruza o marco, que acende em laranja, e o plano vira v3.
// Depois que entra, cada elemento fica parado. Sem câmera, sem brilhos, sem varreduras. Sem logos, sem personagens.
import { W, MG, C, txt, larg, fin, fout, back, pop, opa, sobe, tracar, selo, icone, titulo, clamp, lerp, inv, ease, kf, n2 } from '../base.js';
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
const WX = MG, WY = 330, WW = W - 2 * MG, WH = 726;        // janela do dashboard, alinhada às margens de 72 px
const JX = WX + 24, JW = WW - 48;                          // área útil
const TITULO_J = 'Mapa de Adoção';
const ABAS = ['Onda 1', 'Onda 2', 'Onda 3'];
const TAB = (() => {                                       // abas desenhadas na cena (texto de 22 px)
  let ax = WX + WW - 22;
  const out = [];
  for (let i = ABAS.length - 1; i >= 0; i--) {
    const wl = larg(ABAS[i], 22, { w: 700 }) + 30;
    ax -= wl;
    out[i] = { x: ax, w: wl, cx: ax + wl / 2, cy: WY + 29 };
    ax -= 10;
  }
  return out;
})();
const GC = geoCalor(JX, 412, JW, 312, { rotW: 170, cab: 50 });                 // mapa de calor
const IC = { x: JX, y: 748, w: JW, h: 284 };                                   // cartão do índice: número + linha
const CH = { x: IC.x + 300, w: IC.w - 320 };                                   // área da linha dentro do cartão
const Y0 = IC.y + IC.h - 62, Y70 = IC.y + 70;                                  // eixo: 0% e 70%
const tpx = i => CH.x + 44 + (CH.w - 88) * i / 2, tpy = v => Y0 - (Y0 - Y70) * v / 70;
const GX = (tpx(1) + tpx(2)) / 2;                                              // x do marco GO-LIVE
const NT = { x: WX, y: 1086, w: WW, h: 76 };                                   // faixa de aviso, embaixo da janela

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
  let s = '';
  AREAS.forEach((nome, a) => { s += opa(ease.out(clamp(u * 2)), txt(nome, GC.x, GC.y + GC.cab + GC.rh * (a + 0.5) + 8.5, { w: 700, s: 24, c: C.white })); });
  NIVEIS.forEach((nv, n) => {
    const kc = ease.out(clamp(u * 2.2 - n * 0.2));
    if (kc <= 0.001) return;
    const x0 = GC.x + GC.rotW + GC.cw * n, cx = x0 + GC.cw / 2, cor = nv.cor === C.navy ? C.blue80 : nv.cor;
    let b = `<rect x="${f(x0 + 4)}" y="${f(GC.y)}" width="${f(GC.cw - 8)}" height="${GC.cab - 10}" rx="8" fill="${nv.cor}"${nv.cor === C.navy ? ` stroke="${C.blue40}" stroke-width="1.5"` : ''}/>`
      + txt(nv.rot, cx, GC.y + (GC.cab - 10) / 2 + 8, { w: 700, s: 22, c: nv.tx, a: 'middle' });
    for (let a = 0; a < 4; a++) {
      const q0 = CEL[a][n][i], q1 = CEL[a][n][i + 1], q = lerp(q0, q1, k), v = Math.round(q), forca = clamp(q / 3);
      const [, y0, cw, rh] = GC.cel(a, n), cy = y0 + rh / 2;
      b += `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="10" fill="rgba(255,255,255,.06)"/>`
        + `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="10" fill="${cor}" opacity="${f(lerp(0.08, 0.3 + 0.7 * forca, clamp((q - 0.15) / 0.5)))}"/>`;
      if (v < 1) continue;
      // célula que enche ou esvazia: o número aparece / some com fade
      const op = Math.min(q0, q1) < 1 && q < 1 ? clamp((q - 0.5) / 0.35) : 1;
      b += txt(String(v), cx, cy + 10.5, { w: 700, s: 30, c: nv.tx === C.navy && forca > 0.6 ? C.navy : C.white, a: 'middle', o: op });
    }
    s += sobe(kc, b, 14);
  });
  return s;
}
// etiqueta do movimento: a própria célula vira a etiqueta (ícone + palavra), sem cobrir as vizinhas
function etiq(ex, k) {
  if (k <= 0.001) return '';
  const [x0, y0, cw, rh] = GC.cel(...ex.cel), [cx, cy] = GC.centro(...ex.cel);
  const s = 24, wt = larg(ex.rot, s, { w: 700 }), wc = 26 + 7 + wt, xi = cx - wc / 2;
  const b = `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="10" fill="${ex.cor}" stroke="${C.white}" stroke-width="3"/>`
    + icone(ex.ic, xi + 13, cy, 26, { c: ex.tx, sw: 3 })
    + txt(ex.rot, xi + 33, cy + s * 0.35, { w: 700, s, c: ex.tx });
  return opa(clamp(k * 1.5), pop(0.8 + 0.2 * k, cx, cy, b));
}
// cartão do índice: número grande à esquerda e linha por onda à direita.
// ondL = até onde a linha já foi (0..2); u = entrada; kGo = marco aceso (0..1)
function indice(valor, ondL, u, kGo) {
  const onda = clamp(ondL, 0, 2);
  let s = `<rect x="${IC.x}" y="${IC.y}" width="${IC.w}" height="${IC.h}" rx="14" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>`
    + txt('ÍNDICE DE ADOÇÃO', IC.x + 24, IC.y + 48, { w: 700, s: 22, ls: 1.2, c: C.blue40 })
    + txt(valor, IC.x + 20, IC.y + 196, { f: 'L', s: 116, c: C.white });
  // eixo e rótulos das ondas
  s += tracar(`M${f(CH.x + 8)},${f(Y0)} L${f(CH.x + CH.w - 8)},${f(Y0)}`, ease.out(u), { c: 'rgba(255,255,255,.2)', sw: 2 });
  ABAS.forEach((r, i) => {
    const on = i <= onda + 0.05;
    s += opa(clamp(u * 2 - i * 0.3), txt(r, tpx(i), IC.y + IC.h - 22, { w: on ? 700 : 400, s: 22, c: on ? C.white : C.blue40, a: 'middle' }));
  });
  // marco GO-LIVE: discreto até a fala chegar nele; aí acende em laranja
  {
    const wl = larg('GO-LIVE', 22, { w: 700, ls: 1.2 }) + 28, yl = IC.y + 44;
    const g = `<path d="M${f(GX)},${f(IC.y + 58)} L${f(GX)},${f(Y0)}" stroke="${mix('#7C97AF', C.orange, kGo)}" stroke-width="2.5" stroke-dasharray="6 7"/>`
      + (kGo > 0.001 ? `<rect x="${f(GX - wl / 2)}" y="${f(yl - 26)}" width="${f(wl)}" height="36" rx="18" fill="${C.orange}" opacity="${f(kGo)}"/>` : '')
      + txt('GO-LIVE', GX, yl, { w: 700, s: 22, ls: 1.2, c: mix(C.blue40, C.navy, kGo), a: 'middle' });
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
    let g = `<path d="M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}" fill="none" stroke="${C.blue40}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (let i = 0; i <= 2; i++) {
      // o ponto de partida só ganha rótulo quando a linha sai dele (antes disso o número grande já diz 20%)
      const ki = i === 0 ? clamp(onda / 0.1) : clamp((onda - i + 0.02) / 0.02);
      if (ki <= 0.001) continue;
      g += opa(ki, txt(INDICES[i] + '%', tpx(i), tpy(INDICES[i]) - 22, { w: 700, s: 24, c: C.white, a: 'middle' }));
    }
    g += `<circle cx="${f(ult[0])}" cy="${f(ult[1])}" r="10" fill="${C.white}" stroke="${C.navy}" stroke-width="3"/>`;
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

  // ---------- título e indicador AO VIVO ----------
  let cena = titulo(['O mapa precisa', 'estar *vivo*'], MG, 196, t, t0 + 0.15, { escuro: true });
  {
    const k = fin(t, t0 + 0.55, 0.45), on = fin(t, tVivo, 0.35);
    const sz = 24, wT = larg('AO VIVO', sz, { w: 700, ls: 2 }), w = 24 + 18 + 14 + wT + 24, h = 54, x0 = W - MG - w, y0 = 204, cy = y0 + h / 2;
    // único detalhe vivo da cena: o ponto pisca devagar
    const pisca = 1 - 0.5 * on * (0.5 - 0.5 * Math.cos((t - tVivo) * Math.PI * 2 / 1.5));
    const b = `<rect x="${f(x0)}" y="${y0}" width="${f(w)}" height="${h}" rx="${h / 2}" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.3)" stroke-width="2"/>`
      + `<circle cx="${f(x0 + 33)}" cy="${cy}" r="9" fill="${mix(C.navy40, C.orange, on)}" opacity="${f(pisca)}"/>`
      + txt('AO VIVO', x0 + 56, cy + sz * 0.35, { w: 700, s: sz, ls: 2, c: mix(C.navy40, C.white, on) });
    cena += sobe(k, b, 16);
  }

  // ---------- janela do dashboard ----------
  let w = janela(WX, WY, WW, WH, { titulo: TITULO_J }).svg;
  // selo ampliado 1,57x: o texto do selo passa de 14 para 22 px (legível no celular)
  w += `<g transform="translate(${f(WX + 112 + larg(TITULO_J, 24, { w: 700 }) + 18)} ${WY + 8.5}) scale(1.57)">${selo('Ilustrativo', 0, 0)}</g>`;
  TAB.forEach((tb, i) => {
    const on = i === aba;
    w += `<rect x="${f(tb.x)}" y="${WY + 10}" width="${f(tb.w)}" height="38" rx="19" fill="${on ? C.white : 'none'}" stroke="${on ? 'none' : 'rgba(255,255,255,.3)'}" stroke-width="1.5"/>`
      + txt(ABAS[i], tb.cx, WY + 36.5, { w: 700, s: 22, c: on ? C.navy : C.white, a: 'middle' });
  });

  // ---------- mapa de calor ----------
  w += mapaCalor(ond, inv(t0 + 0.45, t0 + 1.45, t));

  // ---------- índice de adoção: número grande + linha por onda ----------
  const kFoco = fin(t, tEx[0] - 0.3, 0.4) * fout(t, tSai, 0.4);            // fase das etiquetas: o cartão de baixo recua
  {
    const uIn = inv(t0 + 0.8, t0 + 1.6, t);
    const valor = (uIn < 1 ? Math.round(INDICES[0] * ease.out(uIn)) : Math.round(indiceEm(ond))) + '%';
    w += sobe(fin(t, t0 + 0.7, 0.45) * (1 - 0.55 * kFoco), indice(valor, ondL, inv(t0 + 0.95, t0 + 1.75, t), fin(t, tGo, 0.3)), 14);
  }

  // ---------- etiquetas sobre o mapa de calor: avança, trava, recua ----------
  EX.forEach((ex, i) => { w += etiq(ex, back(t, tEx[i], 0.4) * fout(t, tSai, 0.3)); });

  // a janela entra subindo, com fade
  cena += sobe(fin(t, t0 + 0.1, 0.55), w, 40);

  // ---------- faixa de aviso (embaixo da janela) ----------
  {
    const kN = fin(t, tNot, 0.45);
    if (kN > 0.001) {
      const cy = NT.y + NT.h / 2;
      let b = `<rect x="${NT.x}" y="${NT.y}" width="${NT.w}" height="${NT.h}" rx="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>`;
      // 1. "Posição é momento, não rótulo."
      const kA = fout(t, tAl - 0.35, 0.3);
      if (kA > 0.001) {
        const sz = 34, o = { w: 700 }, P1 = 'Posição é ', P2 = 'momento', P3 = ', não ', P4 = 'rótulo', P5 = '.';
        const w1 = larg(P1, sz, o), w2 = larg(P2, sz, o), w3 = larg(P3, sz, o), w4 = larg(P4, sz, o), xt = NT.x + 30, yb = cy + sz * 0.35;
        const uX = ease.inOut(inv(tRisca, tRisca + 0.4, t));
        let a = txt(P1, xt, yb, { w: 700, s: sz, c: C.white })
          + txt(P2, xt + w1, yb, { w: 700, s: sz, c: mix(C.white, C.orange, fin(t, tMom, 0.3)) })
          + txt(P3, xt + w1 + w2, yb, { w: 700, s: sz, c: C.white })
          + txt(P4, xt + w1 + w2 + w3, yb, { w: 700, s: sz, c: mix(C.white, C.navy40, uX) })
          + txt(P5, xt + w1 + w2 + w3 + w4, yb, { w: 700, s: sz, c: C.white });
        if (uX > 0) a += `<rect x="${f(xt + w1 + w2 + w3 - 4)}" y="${f(yb - sz * 0.32)}" width="${f((w4 + 8) * uX)}" height="3.5" rx="1.75" fill="${C.white}"/>`;
        b += opa(kA * (1 - 0.5 * fin(t, tEx[0] - 0.3, 0.4)), a);           // recua quando o foco passa para as etiquetas
      }
      // 2. "Plano de mudança ajustado" (v2 na onda 2, v3 depois do go-live)
      const kP = fin(t, tAl - 0.05, 0.45);
      if (kP > 0.001) {
        const sz = 30, tit = 'Plano de mudança ajustado', xt = NT.x + 92, yb = cy + sz * 0.35, k2 = fout(t, tV3, 0.15), k3 = fin(t, tV3 + 0.15, 0.25);
        let a = pop(back(t, tAl, 0.45), NT.x + 48, cy, `<circle cx="${NT.x + 48}" cy="${cy}" r="24" fill="${C.blue}"/>` + icone('plano', NT.x + 48, cy, 28, { c: C.white, sw: 2.8 }))
          + txt(tit, xt, yb, { w: 700, s: sz, c: C.white })
          + txt('· v2', xt + larg(tit + ' ', sz, { w: 700 }) + 4, yb, { s: sz, c: C.blue40, o: k2 })
          + txt('· v3', xt + larg(tit + ' ', sz, { w: 700 }) + 4, yb, { s: sz, c: C.blue40, o: k3 });
        b += sobe(kP, a, 10);
      }
      cena += sobe(kN, b, 16);
    }
  }

  // ---------- cursor: aparece só para os dois cliques nas abas ----------
  [tC1, tC2].forEach((tc, j) => {
    const o = fin(t, tc - 0.55, 0.2) * fout(t, tc + 0.5, 0.3);
    if (o <= 0.001) return;
    const tb = TAB[j + 1], P1 = [tb.cx + 6, tb.cy + 6], P0 = [P1[0] + 40, P1[1] + 62];
    const [x, y] = kf(t, [[tc - 0.55, P0], [tc - 0.08, P1]]);
    cena += opa(o, cursor(x, y, { clique: inv(tc, tc + 0.45, t), s: 1.15 }));
  });

  return fundoNoite(t) + cena;
}
