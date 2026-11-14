// Cena "fecho" (76,5–88,0 s): "Adoção não se impõe. Se constrói. Pessoa por pessoa. Gestão da Mudança."
// Versão limpa: fundo liso, sem câmera, sem brilhos. Sem logo, sem nome de empresa e sem personagens.
// ATO 1 (até ~81,7): a tipografia entra palavra a palavra, já no lugar ("impõe." é riscada em laranja). Em "Se constrói."
// a negação recua para 45%, a frase laranja sobe e as dez barras da escada crescem da esquerda para a direita, nas cores
// da régua (duas por marca). Em "Pessoa por pessoa." um pino pousa sobre cada barra, em cascata curta.
// ATO 2 (de 'gestao' - 0,55 em diante): a tipografia do ato 1 sai e entra o cartão final: pino laranja (emblema), título,
// fio, frase-síntese, "Gestão da Mudança | Change Management" e, depois da fala, a marca pessoal. A escada fica parada.
import { W, MG, C, txt, larg, fin, sobe, tracar, fio, opa, clamp, lerp, inv, ease, n2 } from '../base.js';
import { NIVEIS } from '../modelo.js';
import { fundoNoite, pinoMapa } from '../ludico.js';

const f = n2;
export const FUNDO = 'navy';
export const LEGENDA = false;

// ---------- ato 1: tipografia ----------
const S1 = 100, LS = -1.5, Y1 = 272, Y2 = 384;     // "Adoção não" / "se impõe." (Light)
const S3 = 148, Y3 = 560;                          // "Se constrói." (laranja)
const S4 = 72, Y4 = 708;                           // "Pessoa por pessoa."
const wL = (str, s, ls = LS) => larg(str, s, { f: 'L' }) + ls * str.length;
const tL = (str, x, y, s, c, ls = LS) => txt(str, x, y, { f: 'L', s, c, ls });

// ---------- escada: dez barras nas cores da régua (duas por marca), um pino em cada ----------
const NB = 10, YB = 1250, GAP = 14, BW = (W - 2 * MG - (NB - 1) * GAP) / NB;
const bx = i => MG + i * (BW + GAP), cxB = i => bx(i) + BW / 2;
const hB = i => 90 + i * 30;
const topo = i => YB - hB(i);
const SPIN = 0.8;                                  // escala dos pinos
// barra com o topo arredondado; h = altura atual
const dBarra = (i, h, r = 9) => {
  const x = bx(i), y = YB - h, rr = Math.min(r, h / 2);
  return `M${f(x)},${YB} V${f(y + rr)} Q${f(x)},${f(y)} ${f(x + rr)},${f(y)} H${f(x + BW - rr)} Q${f(x + BW)},${f(y)} ${f(x + BW)},${f(y + rr)} V${YB}Z`;
};

// ---------- ato 2: cartão final ----------
const PIN = { x: MG + 35, y: 244, k: 1.5 };        // ponta do pino-emblema (a borda esquerda alinha na margem)
const ST = 70, TY1 = 338, TY2 = 420;               // título (Light)
const FY = 452;                                    // fio laranja
const SF = 42, FR1 = 530, FR2 = 586;               // frase-síntese
const SLAB = 30, LAB = 664;                        // rótulo da prática
const CTA = 744;                                   // marca pessoal (o bloco ocupa de 720 a 789; a escada começa em 837)

// overshoot contido (~4%)
const backS = u => 1 + 2 * Math.pow(u - 1, 3) + Math.pow(u - 1, 2);
// escala k em torno de (x, y)
const esm = (k, x, y, body) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)}) translate(${f(-x)} ${f(-y)})">${body}</g>`;
// linha que sobe por trás de uma máscara (k: 0 -> 1)
const sobeMasc = (id, y, s, k, body) => (k <= 0 ? '' : k >= 1 ? body
  : `<clipPath id="${id}"><rect x="0" y="${f(y - s * 0.98)}" width="${W}" height="${f(s * 1.28)}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(0 ${f((1 - k) * s * 1.1)})">${body}</g></g>`);

export function desenhar(t, ctx) {
  const { t0, m, wa, T } = ctx;
  const iA = T.marcas.adocao.i, iC = T.marcas.constroi.i, iP = T.marcas.pessoa_por_pessoa.i;
  const tAdo = m('adocao') - 0.06;                               // "Adoção"
  const tNao = wa(iA + 1) - 0.08, tSe1 = wa(iA + 2) - 0.08;      // "não", "se"
  const tImp = m('impoe') - 0.06, tRisca = m('impoe') + 0.24;    // "impõe." e o risco laranja
  const tSe = wa(iC - 1) - 0.06, tCons = m('constroi') - 0.06;   // "Se" e "constrói."
  const tP = [0, 1, 2].map(i => wa(iP + i) - 0.06);              // "Pessoa" "por" "pessoa."
  const tA2 = m('gestao') - 0.55, tGes = m('gestao') - 0.08;     // ato 2 (o cartão já está montado na fala)
  const tAlv = ctx.mb('mudanca_final') + 0.4;                    // a marca pessoal entra só na imagem, depois da fala
  const tBar = i => tCons + 0.12 + i * 0.1;                      // cada barra cresce, da esquerda para a direita
  const tPin = i => tP[0] + 0.02 + i * 0.11;                     // um pino pousa em cada barra

  let s = fundoNoite(t, { seed: 9 });

  // ================= ESCADA: linha de base, nomes das marcas, barras e pinos =================
  let e = '';
  {
    const u = ease.out(inv(t0 + 0.12, t0 + 0.8, t));
    if (u > 0) e += `<rect x="${MG}" y="${YB}" width="${f((W - 2 * MG) * u)}" height="3" rx="1.5" fill="#fff" opacity=".42"/>`;
  }
  // nomes das marcas sob cada par de barras (acendem quando o par começa a subir)
  NIVEIS.forEach((nv, j) => {
    const k = fin(t, t0 + 0.4 + j * 0.07, 0.45), on = fin(t, tBar(2 * j), 0.4);
    const xc = (cxB(2 * j) + cxB(2 * j + 1)) / 2;
    e += sobe(k, txt(nv.rot, xc, YB + 46, { w: 700, s: 24, c: C.white, a: 'middle', o: lerp(0.45, 0.95, on) }), 12);
  });
  e += `<linearGradient id="fe-nv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.navy80}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>`;
  for (let i = 0; i < NB; i++) {
    if (t <= tBar(i)) continue;
    const nv = NIVEIS[i >> 1], h = hB(i) * backS(inv(tBar(i), tBar(i) + 0.5, t)), navy = nv.cor === C.navy;
    e += `<path d="${dBarra(i, h)}" fill="${navy ? 'url(#fe-nv)' : nv.cor}"${navy ? ` stroke="${C.white}" stroke-width="2.5"` : ''}/>`;
  }
  for (let i = 0; i < NB; i++) {
    const u = inv(tPin(i), tPin(i) + 0.3, t);
    if (u <= 0) continue;
    // entra por escala a partir da ponta (overshoot pequeno); a opacidade fecha em dois quadros, para a cor não sujar
    e += opa(clamp(u * 6), pinoMapa(cxB(i), topo(i), { cor: NIVEIS[i >> 1].cor, s: SPIN, k: lerp(0.5, 1, backS(u)) }));
  }

  // ================= ATO 1: tipografia =================
  let tp = '';
  if (t < tA2 + 0.3) {
    // a negação entra no lugar, palavra a palavra; quando chega "Se constrói." ela recua para 45%
    const uM = ease.inOut(inv(tSe - 0.2, tSe + 0.2, t));
    const xI = MG + wL('se ', S1), wI = wL('impõe.', S1);
    let a = sobeMasc('fe-ad', Y1, S1, ease.out5(inv(tAdo, tAdo + 0.36, t)), tL('Adoção', MG, Y1, S1, C.white));
    a += sobeMasc('fe-na', Y1, S1, ease.out5(inv(tNao, tNao + 0.34, t)), tL('não', MG + wL('Adoção ', S1), Y1, S1, C.white));
    a += sobeMasc('fe-se', Y2, S1, ease.out5(inv(tSe1, tSe1 + 0.3, t)), tL('se', MG, Y2, S1, C.white));
    a += sobeMasc('fe-im', Y2, S1, ease.out5(inv(tImp, tImp + 0.34, t)), tL('impõe.', xI, Y2, S1, C.white));
    let b = opa(lerp(1, 0.45, uM), a);
    // risco laranja sobre "impõe." (recua junto com a negação)
    b += opa(lerp(1, 0.6, uM), tracar(`M${f(xI - 12)},${f(Y2 - S1 * 0.3)} L${f(xI + wI + 6)},${f(Y2 - S1 * 0.36)}`, ease.out(inv(tRisca, tRisca + 0.25, t)), { c: C.orange, sw: 7 }));
    // "Se constrói.": as duas palavras sobem por máscara, em laranja
    b += sobeMasc('fe-s1', Y3, S3, ease.out5(inv(tSe, tSe + 0.34, t)), tL('Se', MG, Y3, S3, C.orange));
    b += sobeMasc('fe-s2', Y3, S3, ease.out5(inv(tCons, tCons + 0.4, t)), tL('constrói.', MG + wL('Se ', S3), Y3, S3, C.orange));
    // "Pessoa por pessoa.": cada palavra sobe no seu instante
    ['Pessoa', 'por', 'pessoa.'].forEach((p, i) => {
      const x = MG + wL(['', 'Pessoa ', 'Pessoa por '][i], S4, -0.6);
      b += sobeMasc('fe-p' + i, Y4, S4, ease.out5(inv(tP[i], tP[i] + 0.34, t)), tL(p, x, Y4, S4, C.white, -0.6));
    });
    // saída: a tipografia some para dar lugar ao cartão final
    const sai = ease.inOut(inv(tA2, tA2 + 0.28, t));
    tp = sai >= 1 ? '' : sai <= 0 ? b : `<g transform="translate(0 ${f(-40 * sai)})" opacity="${f(1 - sai)}">${b}</g>`;
  }

  // ================= ATO 2: cartão final (sem logos) =================
  let c = '';
  if (t > tA2) {
    // pino-emblema: entra e fica parado
    {
      const u = inv(tA2 + 0.25, tA2 + 0.65, t);
      if (u > 0) c += opa(clamp(u * 6), `<g transform="translate(${PIN.x} ${PIN.y}) scale(${f(PIN.k * lerp(0.5, 1, backS(u)))})">`
        + `<path d="M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z" fill="${C.orange}" stroke="${C.white}" stroke-width="3"/>`
        + `<circle cx="0" cy="-42" r="9.5" fill="${C.white}"/></g>`);
    }
    // título e fio
    const tT = tA2 + 0.22;
    c += sobeMasc('fe-t1', TY1, ST, ease.out5(inv(tT, tT + 0.55, t)), txt('Mapa de Perfil Cognitivo', MG, TY1, { f: 'L', s: ST, c: C.white, ls: -0.8 }));
    c += sobeMasc('fe-t2', TY2, ST, ease.out5(inv(tT + 0.1, tT + 0.65, t)), txt('Mapa de Adoção', MG, TY2, { f: 'L', s: ST, c: C.orange, ls: -0.8 }));
    c += fio(MG, FY, inv(tT + 0.5, tT + 1.0, t), 110, 6);
    // frase-síntese (sobe logo depois do título, antes do rótulo)
    const tF = tGes - 0.16;
    c += sobe(fin(t, tF, 0.45), txt('Adoção não se impõe.', MG, FR1, { f: 'L', s: SF, c: C.navy20 }), 20);
    c += sobe(fin(t, tF + 0.1, 0.45), txt('Se constrói, pessoa por pessoa.', MG, FR2, { f: 'L', s: SF, c: C.white }), 20);
    // rótulo da prática, em 'gestao'
    {
      const A = 'Gestão da Mudança', B = 'Change Management', xf = MG + larg(A, SLAB, { w: 700 }) + 20;
      c += sobe(fin(t, tGes - 0.02, 0.45), txt(A, MG, LAB, { w: 700, s: SLAB, c: C.white })
        + `<rect x="${f(xf - 1)}" y="${LAB - 25}" width="2" height="30" fill="${C.navy40}"/>`
        + txt(B, xf + 20, LAB, { w: 700, s: SLAB, c: C.white }), 20);
    }
    // marca pessoal (não é falada): monograma + nome + papel
    {
      const cxm = MG + 42, cym = CTA + 12, u = inv(tAlv, tAlv + 0.45, t);
      if (u > 0) c += opa(clamp(u * 6), esm(lerp(0.5, 1, backS(u)), cxm, cym, `<circle cx="${cxm}" cy="${cym}" r="42" fill="${C.orange}"/>` + txt('VV', cxm, cym + 13, { w: 700, s: 36, c: C.navy, a: 'middle', ls: 0.5 })));
      c += sobe(fin(t, tAlv + 0.1, 0.45), txt('Victor Vitorino', MG + 104, CTA + 6, { w: 700, s: 46, c: C.white }), 16);
      c += sobe(fin(t, tAlv + 0.22, 0.45), txt('Consultor de Change Management', MG + 104, CTA + 44, { s: 30, c: C.navy20 }), 16);
    }
  }

  return s + e + tp + c;
}
