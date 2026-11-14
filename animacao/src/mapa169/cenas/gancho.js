// Cena "gancho" (0,00–9,67 s): abertura e miniatura do post. Versão limpa: poucas peças, paradas, sem efeitos.
// Duas telas lado a lado, retas e fixas, uma de cada pessoa. Cada batida da fala acrescenta UMA peça, igual nas duas:
// "ferramenta" traz o gráfico da nova ferramenta, "treinamento" traz o selo, "uma delas" traz o medidor de uso diário.
// Em "adota" as barras da Pessoa A crescem e o uso dela conta até 92%. Em "volta para a planilha" a planilha antiga
// cobre a ferramenta na tela da Pessoa B, que fica com uso zero. O foco troca de tela só por opacidade.
// O título e as duas telas já estão no quadro em t = 0 (no feed o vídeo aparece mudo e parado no primeiro quadro).
import {
  W, MG, C, txt, tRico, larg, fin, back, opa, sobe, icone, disco, pilula, clamp, lerp, inv, ease, n2,
} from '../base.js';
import { HEROIS, avatar } from '../modelo.js';
import { fundoNoite, sombra } from '../ludico.js';

export const FUNDO = 'navy';
export const LEGENDA = true;

const f = n2;

// ---------- geometria ----------
const TIT = { y: 222, s: 62, lh: 69 };                 // título: 3 linhas
const WW = 440, WH = 616, WY = 440;                    // as duas telas (janelas claras)
const XA = MG, XB = W - MG - WW;                       // 72 e 568
const CAB = 84;                                        // cabeçalho com a pessoa
// coordenadas locais da janela (0..WW, 0..WH)
const AP = { x: 24, y: 108, w: 392, h: 264 };          // a "nova ferramenta": título e um gráfico de barras
const BAR = { x: 60, w: 48, passo: 68, base: 344, max: 150 };
const TOCO = [34, 46, 38, 52, 42];                     // barras antes de alguém usar (iguais nas duas telas)
const ALVO = [0.5, 0.68, 0.6, 0.84, 1];                // barras da Pessoa A depois de "adota"
const SL = { x: 24, y: 388, w: 392, h: 68 };           // selo do treinamento
const MD = { x: 24, y: 472, w: 392, h: 120 };          // medidor "uso diário"
const PL = { x: 16, y: 158, w: 408, tit: 44, cab: 32, lin: 34, n: 4, rw: 36 };   // planilha (só na tela B): cobre o gráfico, 8 px mais larga de cada lado
PL.h = PL.tit + PL.cab + PL.lin * PL.n;
PL.cw = (PL.w - PL.rw) / 4;
const ETQ = { y: 1088, h: 58 };                        // etiquetas "Adota" / "Volta para a planilha"

const ret = (x, y, w, h, rx, attr) => `<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}" rx="${rx}" ${attr}/>`;
const checkPath = (cx, cy, k) => `M${f(cx - 5.5 * k)},${f(cy + 0.5 * k)} l${f(3.8 * k)},${f(3.8 * k)} l${f(7.2 * k)},${f(-8 * k)}`;
// entrada simples: fade com escala curta (0,92 -> 1, overshoot pequeno) em torno de (cx, cy)
function entra(t, a, cx, cy, body, d = 0.42) {
  const u = inv(a, a + d, t);
  if (u <= 0) return '';
  if (u >= 1) return body;
  return `<g opacity="${f(clamp(u * 2.5))}" transform="translate(${f(cx)} ${f(cy)}) scale(${f(lerp(0.92, 1, ease.back(u)))}) translate(${f(-cx)} ${f(-cy)})">${body}</g>`;
}

// ---------- peças da janela (coordenadas locais) ----------
// a nova ferramenta: um cartão com o nome e um gráfico de barras. Idêntico nas duas telas. uB = crescimento das barras
function ferramenta(uB) {
  let s = ret(AP.x, AP.y, AP.w, AP.h, 14, `fill="${C.gray20}" stroke="${C.line}" stroke-width="1.5"`)
    + txt('Nova ferramenta', AP.x + 20, AP.y + 42, { w: 700, s: 26, c: C.navy });
  for (let i = 0; i < 5; i++) {
    const u = uB[i], hh = TOCO[i] + (ALVO[i] * BAR.max - TOCO[i]) * u, bx = BAR.x + i * BAR.passo;
    s += ret(bx, BAR.base - hh, BAR.w, hh, 6, `fill="${C.blue40}"`);
    if (u > 0.001) s += ret(bx, BAR.base - hh, BAR.w, hh, 6, `fill="${C.blue}" opacity="${f(clamp(u * 2.5))}"`);
  }
  return s + ret(AP.x + 20, BAR.base, AP.w - 40, 2, 1, `fill="${C.gray}"`);
}

// selo "Treinamento concluído". Idêntico nas duas telas. uChk = traço do check
function selo(uChk) {
  const cy = SL.y + SL.h / 2;
  return ret(SL.x, SL.y, SL.w, SL.h, 14, `fill="${C.white}" stroke="${C.navy}" stroke-width="2"`)
    + disco('capelo', SL.x + 40, cy, 22, { fundo: C.navy, c: C.white, sw: 2.6 })
    + txt('Treinamento concluído', SL.x + 76, cy + 9, { w: 700, s: 25, c: C.navy })
    + `<circle cx="${SL.x + SL.w - 36}" cy="${cy}" r="15" fill="${C.blue}"/>`
    + (uChk > 0 ? `<path d="${checkPath(SL.x + SL.w - 37, cy, 1)}" fill="none" stroke="${C.white}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - uChk)}"/>` : '');
}

// medidor "uso diário": o número que conta e a barra de nível (v em %)
function medidor(v) {
  const tw = MD.w - 40;
  return ret(MD.x, MD.y, MD.w, MD.h, 14, `fill="${C.gray20}" stroke="${C.line}" stroke-width="1.5"`)
    + txt('USO DIÁRIO', MD.x + 20, MD.y + 56, { w: 700, s: 22, ls: 1.4, c: C.navy80 })
    + txt(Math.round(v) + '%', MD.x + MD.w - 20, MD.y + 66, { f: 'L', w: 400, s: 56, c: C.navy, a: 'end' })
    + ret(MD.x + 20, MD.y + 86, tw, 14, 7, `fill="${C.gray}"`)
    + (v > 0.5 ? ret(MD.x + 20, MD.y + 86, Math.max(14, tw * v / 100), 14, 7, `fill="${C.blue}"`) : '');
}

// planilha antiga: barra de título cinza, cantos retos, grade e a primeira linha em laranja-20
function planilha() {
  const { x, y, w, h, tit, cab, lin, n, rw, cw } = PL;
  const gy = y + tit + cab;
  let s = ret(x, y, w, h, 4, `fill="${C.white}"`)
    + `<path d="M${x},${y + tit} V${y + 4} a4,4 0 0 1 4,-4 H${x + w - 4} a4,4 0 0 1 4,4 V${y + tit}Z" fill="${C.gray}"/>`
    + icone('planilha', x + 26, y + tit / 2, 24, { c: C.navy, sw: 2.4 })
    + txt('controle_v7_FINAL.xls', x + 48, y + 30, { w: 700, s: 22, c: C.navy });
  s += ret(x, y + tit, w, cab, 0, `fill="${C.gray40}"`) + ret(x, gy, rw, lin * n, 0, `fill="${C.gray40}"`)
    + ret(x + rw, gy, w - rw, lin, 0, `fill="${C.orange20}"`);
  ['A', 'B', 'C', 'D'].forEach((l, c) => { s += txt(l, x + rw + cw * (c + 0.5), y + tit + 24, { w: 700, s: 22, c: C.navy80, a: 'middle' }); });
  for (let r = 0; r < n; r++) s += txt(String(r + 1), x + rw / 2, gy + lin * r + 25, { s: 22, c: C.navy80, a: 'middle' });
  const larguras = [[0.7, 0.55, 0.6, 0.5], [0.8, 0.45, 0.5, 0.62], [0.62, 0.5, 0.42, 0.7], [0.74, 0.58, 0.56, 0.48]];
  for (let r = 0; r < n; r++) for (let c = 0; c < 4; c++) {
    const cx = x + rw + cw * c, cy = gy + lin * r, lw = larguras[r][c] * (cw - 24);
    s += ret(c === 0 ? cx + 12 : cx + cw - 12 - lw, cy + lin / 2 - 5, lw, 10, 5, `fill="${r === 0 ? C.navy80 : C.navy40}"`);
  }
  let grade = '';
  for (let c = 0; c <= 4; c++) grade += `M${f(x + rw + cw * c)},${y + tit} V${y + h} `;
  for (let r = 0; r <= n; r++) grade += `M${x},${f(gy + lin * r)} H${x + w} `;
  return s + `<path d="${grade}" stroke="${C.gray}" stroke-width="1.5"/>` + ret(x, y, w, h, 4, `fill="none" stroke="${C.navy80}" stroke-width="2"`);
}

// etiqueta de resultado sob a tela
function etiquetaRes(str, cx, fill, tinta, ic) {
  const s = 28, wt = larg(str, s, { w: 700 }), w = wt + 88, x0 = cx - w / 2, cy = ETQ.y + ETQ.h / 2;
  return pilula(x0, ETQ.y, w, ETQ.h, fill)
    + `<circle cx="${f(x0 + 31)}" cy="${cy}" r="18" fill="${C.white}"/>` + ic(x0 + 31, cy)
    + txt(str, x0 + 60, cy + s * 0.35, { w: 700, s, c: tinta });
}

export function desenhar(t, ctx) {
  const mDuas = ctx.m('duas'), mFer = ctx.m('ferramenta'), mTre = ctx.m('treinamento');
  const mAdo = ctx.m('adota'), mOut = ctx.m('outra'), mPla = ctx.m('planilha');

  // ---------- relógio da cena ----------
  const tAv = mDuas - 0.06;            // "Duas pessoas": os avatares ganham a cor de cada pessoa
  const tApp = mFer - 0.12;            // a mesma ferramenta entra nas duas telas
  const tSelo = mTre - 0.1;            // o mesmo treinamento, nas duas
  const tUma = ctx.wa(8) - 0.05;       // "Uma delas...": o medidor de uso entra nas duas
  const tVida = mAdo - 0.08;           // "adota": a tela da A ganha uso
  const tPlan = ctx.wa(13) - 0.1;      // "...volta": a planilha cobre a ferramenta na tela da B
  const tFim = mPla + 0.2;             // as duas telas lado a lado, em contraste

  // foco só por opacidade: uma tela por vez; no fim, as duas a 100%
  const eA = ease.inOut(inv(tVida - 0.3, tVida + 0.25, t)), eB = ease.inOut(inv(mOut - 0.25, mOut + 0.25, t)), eF = ease.inOut(inv(tFim, tFim + 0.5, t));
  const focoA = 1 - 0.55 * eB * (1 - eF), focoB = 1 - 0.55 * eA * (1 - eB);

  // ---------- fundo e título (as três linhas sempre acesas) ----------
  let s = fundoNoite(t);
  ['Mesma ferramenta.', 'Mesmo treinamento.', '*Resultados diferentes.*'].forEach((ln, i) => {
    s += tRico(ln, MG - 3, TIT.y + i * TIT.lh, { f: 'L', s: TIT.s, c: C.white, hi: C.orange });
  });

  // ---------- uma tela (reta e parada) ----------
  function tela(lado) {
    const A = lado === 'A', h = HEROIS[lado], at = A ? 0 : 0.08;   // a tela B entra um instante depois (cascata curta)
    let b = ret(0, 0, WW, WH, 22, `fill="${C.white}" stroke="${C.gray}" stroke-width="2"`)
      + `<path d="M1,${CAB} V22 a21,21 0 0 1 21,-21 H${WW - 22} a21,21 0 0 1 21,21 V${CAB}Z" fill="${C.gray20}"/>`
      + `<path d="M0,${CAB} H${WW}" stroke="${C.gray}" stroke-width="2"/>`;
    // cabeçalho: avatar neutro que ganha a cor da pessoa em "duas"
    const ax = 54, ay = CAB / 2;
    b += avatar(ax, ay, { r: 28, cor: C.gray, c: C.navy80, sw: 2.8 })
      + opa(fin(t, tAv + at, 0.45), avatar(ax, ay, { r: 28, cor: h.cor, c: A ? C.white : C.navy, sw: 2.8 }))
      + txt(h.nome, 98, ay + 10, { w: 700, s: 28, c: C.navy });

    // enquanto a tela está vazia, a pessoa aparece grande no miolo (parada); sai quando a ferramenta chega
    const some = 1 - fin(t, tApp + at - 0.32, 0.3);
    if (some > 0.001) {
      const gx = WW / 2, gy = CAB + (WH - CAB) / 2 - 10;
      b += opa(some, avatar(gx, gy, { r: 92, cor: C.gray20, c: C.navy40, sw: 3 })
        + opa(fin(t, tAv + at, 0.45), avatar(gx, gy, { r: 92, cor: h.cor, c: A ? C.white : C.navy, sw: 3 })));
    }

    // a ferramenta, o selo e o medidor: uma peça por batida da fala, iguais nas duas telas
    const uB = ALVO.map((_, i) => (A ? back(t, tVida + 0.06 + i * 0.07, 0.5) : 0));
    b += sobe(fin(t, tApp + at, 0.45), ferramenta(uB), 20);
    b += entra(t, tSelo + at, SL.x + SL.w / 2, SL.y + SL.h / 2, selo(ease.out(inv(tSelo + at + 0.34, tSelo + at + 0.6, t))));
    b += sobe(fin(t, tUma + at, 0.45), medidor(A ? 92 * ease.out(inv(tVida + 0.05, tVida + 1.05, t)) : 0), 20);

    // só na tela B: a ferramenta recua e a planilha antiga sobe por cima dela
    if (!A) {
      const apaga = ease.inOut(inv(mOut + 0.1, tPlan + 0.3, t));
      if (apaga > 0.001) b += ret(AP.x - 1, AP.y - 1, AP.w + 2, AP.h + 2, 14, `fill="${C.white}" opacity="${f(0.62 * apaga)}"`);
      b += sobe(fin(t, tPlan, 0.5), sombra(planilha()), 18);
    }
    return `<g transform="translate(${A ? XA : XB} ${WY})">${b}</g>`;
  }
  s += opa(focoA, tela('A')) + opa(focoB, tela('B'));

  // ---------- etiquetas de resultado ----------
  const cxA = XA + WW / 2, cxB = XB + WW / 2, eyc = ETQ.y + ETQ.h / 2;
  s += opa(focoA, entra(t, tVida + 0.24, cxA, eyc, etiquetaRes('Adota', cxA, C.blue, C.white,
    (x, y) => `<path d="${checkPath(x - 1, y, 1.15)}" fill="none" stroke="${C.blue}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`)));
  s += entra(t, mPla + 0.06, cxB, eyc, etiquetaRes('Volta para a planilha', cxB, C.orange80, C.navy,
    (x, y) => icone('planilha', x, y, 22, { c: C.navy, sw: 2.4 })));
  return s;
}
