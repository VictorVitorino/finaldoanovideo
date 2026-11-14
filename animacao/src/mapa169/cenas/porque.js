// Cena "porque" (9,67–16,42 s): "Não é má vontade. É perfil: como cada pessoa percebe, avalia e decide."
// Versão limpa, composta para 16:9 no esquema A (duas colunas): poucos elementos, um foco por vez, nada em laço.
//   Esquerda (x 96–736): o título em duas linhas e, abaixo, a salvaguarda em três linhas. O bloco fica centrado
//   na vertical em relação ao visual da direita.
//   Direita (x 816–1824): o avatar da Pessoa B e os três cartões Percebe / Avalia / Decide em linha.
//   1. Plano fechado: o avatar grande, no centro da coluna, com uma etiqueta simples "má vontade". Em 'ma_vontade'
//      a etiqueta é riscada (único laranja do momento) e some.
//   2. Em 'perfil' entra a segunda linha do título e, logo depois, a salvaguarda.
//   3. Um único movimento abre o quadro: o avatar sobe para o alto da coluna e encolhe; dele descem linhas simples
//      até três cartões, um por palavra. O cartão da vez fica em foco (fio laranja); os anteriores recuam para 45%.
//      No fim, os três iguais.
// Sem personagens, sem logo. Função pura de t.
import {
  MG, C, txt, larg, bloco, fin, sobe, opa, tracar, disco, titulo,
  lerp, inv, ease, n2,
} from '../base.js';
import { HEROIS, avatar } from '../modelo.js';
import { fundoVivo, sombra } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const LEGENDA = true;

// ---------- guias do esquema A ----------
const TX0 = MG, TXW = 640;                                // coluna de texto: x 96–736
const VX0 = 816, VX1 = 1824, VY0 = 150, VY1 = 900;        // coluna do visual
const VCX = (VX0 + VX1) / 2;                              // 1320

// ---------- coluna da direita ----------
const AX = VCX, AR = 96, AY = VY0 + AR;                   // avatar da Pessoa B na posição final: alto da coluna
const Z0 = 1.8, Y0 = 484;                                 // plano fechado: escala e altura do avatar (avatar + etiqueta centrados na coluna)
const TAG = { y: AY + AR + 14, h: 62, s: 36, pad: 28 };   // etiqueta "má vontade", logo abaixo do avatar (coordenadas do avatar; na tela, x 1,8 = 65 px)
const GAP = 36, CW = (VX1 - VX0 - 2 * GAP) / 3;           // três cartões de 312 px
const CH = 384, CY0 = VY1 - CH;                           // 516–900
const cxNo = i => VX0 + CW / 2 + i * (CW + GAP);
const RD = 66, DY = 106;                                  // disco do ícone: raio e altura dentro do cartão
const NOME = { y: 236, s: 48 }, FIO = { y: 256, w: 64, h: 6 }, APO = { y: 310, s: 30, lh: 37 };
const NOS = [
  { ic: 'olho', rot: 'Percebe', apoio: 'o que nota\nna mudança', marca: 'percebe' },
  { ic: 'balanca', rot: 'Avalia', apoio: 'o que pesa:\nganho e risco', marca: 'avalia' },
  { ic: 'decide', rot: 'Decide', apoio: 'o que faz\ncom isso', marca: 'decide' },
];

// ligações avatar → cartões: haste que desce do avatar, vira num canto arredondado e desce até o topo do cartão
const LY0 = AY + AR + 16, LYB = Math.round((LY0 + CY0) / 2), LR = 24;
const LIG = NOS.map((_, i) => {
  const x = cxNo(i), sx = Math.sign(x - AX);
  if (!sx) return `M${AX},${LY0} V${CY0}`;
  return `M${AX},${LY0} V${LYB - LR} Q${AX},${LYB} ${f(AX + sx * LR)},${LYB} H${f(x - sx * LR)} Q${f(x)},${LYB} ${f(x)},${LYB + LR} V${CY0}`;
});

// ---------- coluna da esquerda ----------
const T1 = 'Não é má vontade.', T2 = '*É perfil.*';
const SALVA = '*Perfil cognitivo:* como cada pessoa\nentende e vive esta mudança.\n*Não é teste psicológico.*';
const SV = { s: 30, lh: 40, gap: 84 };                    // salvaguarda: corpo, entrelinha e distância da 2ª linha do título

export function desenhar(t, ctx) {
  const { t0, m } = ctx;
  const tAv = t0 + 0.05;                                  // avatar
  const tTag = t0 + 0.12;                                 // a etiqueta aparece (fica legível antes do risco)
  const tRis = m('ma_vontade') - 0.02;                    // o risco começa junto com "má"
  const tSai = m('perfil') - 0.5;                         // a etiqueta some depois de "vontade."
  const tPerfil = m('perfil') - 0.1;
  // o quadro abre em "como cada pessoa", no mesmo instante da versão 4:5 (depois de a salvaguarda assentar: um foco
  // por vez); o movimento é um pouco mais curto para o avatar estar parado antes de a primeira linha se desenhar
  const tAbre = m('percebe') - 1.1, DA = 0.65;
  const tM = NOS.map(n => m(n.marca) - 0.08);             // cada cartão entra um pouco antes da palavra
  const tTodos = m('decide') + 0.4;                       // os três em pé de igualdade

  // ---------- abertura: um único movimento, do avatar grande no centro para o alto da coluna ----------
  const uA = ease.inOut(inv(tAbre, tAbre + DA, t));       // 0 = plano fechado, 1 = quadro aberto
  const z = lerp(Z0, 1, uA), yc = lerp(Y0, AY, uA);

  // ---------- foco: um cartão por vez; os anteriores recuam ----------
  const uTodos = fin(t, tTodos, 0.35);
  const est = NOS.map((_, i) => {
    const prox = i < 2 ? tM[i + 1] : 1e6, on = fin(t, tM[i], 0.25) * (1 - fin(t, prox, 0.25));
    return { foco: on * (1 - uTodos), aceso: Math.max(on, uTodos) };
  });

  let s = fundoVivo(t);

  // ---------- ligações: cada linha se desenha pouco antes do seu cartão e fica parada ----------
  LIG.forEach((d, i) => {
    const dur = i === 1 ? 0.24 : 0.34;
    s += tracar(d, ease.inOut(inv(tM[i] - dur - 0.02, tM[i] - 0.02, t)), { c: C.blue, sw: 4 });
  });

  // ---------- os três cartões ----------
  let bases = '', cont = '';
  NOS.forEach((n, i) => {
    const ti = tM[i], e = est[i];
    const kB = fin(t, ti, 0.4);
    if (kB <= 0.001) return;
    const x0 = cxNo(i) - CW / 2, cx = cxNo(i), cyD = CY0 + DY;
    bases += sobe(kB, `<rect x="${f(x0)}" y="${CY0}" width="${f(CW)}" height="${CH}" rx="22" fill="${C.white}" stroke="${C.blue40}" stroke-width="2.5"/>`, 24);

    // o cartão entra inteiro (fade + subida curta); só o ícone se desenha
    let c = disco(n.ic, cx, cyD, RD, { fundo: C.navy, c: C.white, sw: 4, u: inv(ti + 0.05, ti + 0.6, t) });
    c += txt(n.rot, cx, CY0 + NOME.y, { w: 700, s: NOME.s, a: 'middle' });
    // fio laranja sob o nome: só no cartão em foco (um laranja por vez)
    const wf = FIO.w * e.foco * fin(t, ti + 0.18, 0.3);
    if (wf > 0.5) c += `<rect x="${f(cx - wf / 2)}" y="${CY0 + FIO.y}" width="${f(wf)}" height="${FIO.h}" rx="${FIO.h / 2}" fill="${C.orange}"/>`;
    c += bloco(n.apoio, cx, CY0 + APO.y, { s: APO.s, maxW: CW - 40, lh: APO.lh, c: C.navy80, a: 'middle' }).svg;
    cont += sobe(kB, opa(lerp(0.45, 1, e.aceso), c), 24);
  });
  if (bases) s += sombra(bases, true);
  s += cont;

  // ---------- avatar da Pessoa B e a etiqueta "má vontade" (aparece, é riscada e some) ----------
  {
    const kAv = fin(t, tAv, 0.4);
    let g = opa(kAv, avatar(AX, AY, { r: AR, cor: HEROIS.B.cor, c: C.navy, k: lerp(0.92, 1, kAv), u: inv(tAv + 0.05, tAv + 0.5, t), sw: 4.5 }));
    const k = fin(t, tTag, 0.35) * (1 - fin(t, tSai, 0.3));
    if (k > 0.001) {
      const wt = larg('má vontade', TAG.s, { w: 700 }), tw = wt + 2 * TAG.pad, x = AX - tw / 2, y = TAG.y - TAG.h / 2;
      const yr = TAG.y + 2, xr = wt / 2 + 12;
      const desce = (1 - fin(t, tTag, 0.35)) * 14;
      g += opa(k, `<g transform="translate(0 ${f(desce)})">`
        + `<rect x="${f(x)}" y="${f(y)}" width="${f(tw)}" height="${TAG.h}" rx="14" fill="${C.white}" stroke="${C.navy}" stroke-width="2.2"/>`
        + txt('má vontade', AX, TAG.y + TAG.s * 0.34, { w: 700, s: TAG.s, a: 'middle' })
        + tracar(`M${f(AX - xr)},${yr} H${f(AX + xr)}`, ease.inOut(inv(tRis, tRis + 0.35, t)), { c: C.orange, sw: 5.5 })
        + `</g>`);
    }
    s += `<g transform="translate(${f(AX)} ${f(yc)}) scale(${f(z)}) translate(${f(-AX)} ${f(-AY)})">${g}</g>`;
  }

  // ---------- coluna de texto: título + salvaguarda, centrados na vertical em relação ao visual ----------
  {
    let ts = 72;                                          // Light 72 px; só reduz se a linha não couber na coluna
    while (ts > 60 && larg(T1, ts, { f: 'L' }) > TXW) ts--;
    const tlh = Math.round(ts * 1.14);
    let sz = SV.s;
    const linhas = SALVA.replace(/\*/g, '').split('\n');
    while (sz > 28 && Math.max(...linhas.map(l => larg(l, sz, { w: 700 }))) > TXW) sz--;
    // o bloco fica centrado na vertical em relação ao visual (y 150–900), com um ajuste fino: o fio laranja de
    // "É perfil." termina na mesma altura do topo dos cartões (um eixo horizontal comum às duas colunas)
    const y2 = Math.round(CY0 - ts * 0.16 - Math.max(4, ts * 0.075)), y1 = y2 - tlh;   // linhas de base do título
    s += titulo([T1], TX0, y1, t, t0 + 0.15, { s: ts });
    s += titulo([T2], TX0, y2, t, tPerfil, { s: ts });
    const kC = fin(t, m('perfil') + 0.42, 0.45);
    if (kC > 0.001) {
      s += sobe(kC, bloco(SALVA, TX0, y2 + SV.gap, { s: sz, maxW: TXW, lh: SV.lh, c: C.navy80, hi: C.navy, hw: 700 }).svg, 16);
    }
  }
  return s;
}
