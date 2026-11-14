// Cena "porque" (9,67–16,42 s): "Não é má vontade. É perfil: como cada pessoa percebe, avalia e decide."
// Versão limpa: poucos elementos, um foco por vez, nada em laço.
//   1. Plano fechado: o avatar da Pessoa B com uma etiqueta simples "má vontade". Em 'ma_vontade' a etiqueta é riscada
//      (único laranja do momento) e some.
//   2. Em 'perfil' entra a segunda linha do título e, logo depois, a salvaguarda em uma linha.
//   3. Um único movimento de câmera abre o quadro; do avatar descem linhas simples até três cartões, um por palavra:
//      Percebe, Avalia, Decide. O cartão da vez fica em foco (fio laranja); os anteriores recuam para 45%. No fim, os três iguais.
// Sem personagens, sem logo. Função pura de t.
import {
  W, MG, C, txt, tRico, larg, bloco, fin, sobe, opa, tracar, disco, titulo,
  lerp, inv, ease, n2,
} from '../base.js';
import { HEROIS, avatar } from '../modelo.js';
import { fundoVivo, camera, sombra } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const LEGENDA = true;

// ---------- geometria (coordenadas do "mundo", antes da câmera) ----------
const TS = 62, TY = 196, TLH = TS * 1.12;                 // título
const AX = W / 2, AY = 466, AR = 84;                      // avatar da Pessoa B (posição final, no quadro aberto)
const ZF = 1.9, YF = 690;                                 // plano fechado: zoom e altura do avatar na tela
const TAG = { y: AY + AR + 14, h: 68, s: 40, pad: 30 };   // etiqueta "má vontade", logo abaixo do avatar
const GAP = 30, CW = (W - 2 * MG - 2 * GAP) / 3, CY0 = 700, CH = 326;   // os três cartões
const cxNo = i => MG + CW / 2 + i * (CW + GAP);
const RD = 58, DY = 102;                                  // disco do ícone: raio e altura dentro do cartão
const NOS = [
  { ic: 'olho', rot: 'Percebe', apoio: 'o que nota na mudança', marca: 'percebe' },
  { ic: 'balanca', rot: 'Avalia', apoio: 'o que pesa: ganho e risco', marca: 'avalia' },
  { ic: 'decide', rot: 'Decide', apoio: 'o que faz com isso', marca: 'decide' },
];
const CT = { x: MG, y: 1100, w: W - 2 * MG, h: 64 };      // salvaguarda, em uma linha
const SALVA = '*Perfil cognitivo:* como cada pessoa entende e vive esta mudança. *Não é teste psicológico.*';

// ligações avatar → cartões: haste que desce do avatar, vira num canto arredondado e desce até o topo do cartão
const LY0 = AY + AR + 14, LYB = 632, LR = 22;
const LIG = NOS.map((_, i) => {
  const x = cxNo(i), sx = Math.sign(x - AX);
  if (!sx) return `M${AX},${LY0} V${CY0}`;
  return `M${AX},${LY0} V${LYB - LR} Q${AX},${LYB} ${f(AX + sx * LR)},${LYB} H${f(x - sx * LR)} Q${f(x)},${LYB} ${f(x)},${LYB + LR} V${CY0}`;
});

export function desenhar(t, ctx) {
  const { t0, m } = ctx;
  const tAv = t0 + 0.05;                                  // avatar
  const tTag = t0 + 0.12;                                 // a etiqueta aparece (fica legível antes do risco)
  const tRis = m('ma_vontade') - 0.02;                    // o risco começa junto com "má"
  const tSai = m('perfil') - 0.5;                         // a etiqueta some depois de "vontade."
  const tPerfil = m('perfil') - 0.1;
  const tAbre = m('percebe') - 1.1, DA = 0.8;             // a câmera abre em "como cada pessoa"
  const tM = NOS.map(n => m(n.marca) - 0.08);             // cada cartão entra um pouco antes da palavra
  const tTodos = m('decide') + 0.4;                       // os três em pé de igualdade

  // ---------- câmera: um único movimento, do plano fechado no avatar para o quadro inteiro ----------
  const uA = ease.inOut(inv(tAbre, tAbre + DA, t));       // 0 = plano fechado, 1 = quadro inteiro
  const z = lerp(ZF, 1, uA);

  // ---------- foco: um cartão por vez; os anteriores recuam ----------
  const uTodos = fin(t, tTodos, 0.35);
  const est = NOS.map((_, i) => {
    const prox = i < 2 ? tM[i + 1] : 1e6, on = fin(t, tM[i], 0.25) * (1 - fin(t, prox, 0.25));
    return { foco: on * (1 - uTodos), aceso: Math.max(on, uTodos) };
  });

  let w = '';                                             // tudo o que está no "mundo" passa pela câmera

  // ---------- ligações: cada linha se desenha pouco antes do seu cartão e fica parada ----------
  LIG.forEach((d, i) => {
    const dur = i === 1 ? 0.24 : 0.34;
    w += tracar(d, ease.inOut(inv(tM[i] - dur - 0.02, tM[i] - 0.02, t)), { c: C.blue, sw: 3 });
  });

  // ---------- os três cartões ----------
  let bases = '', cont = '';
  NOS.forEach((n, i) => {
    const ti = tM[i], e = est[i];
    const kB = fin(t, ti, 0.4);
    if (kB <= 0.001) return;
    const x0 = cxNo(i) - CW / 2, cx = cxNo(i), cyD = CY0 + DY;
    bases += sobe(kB, `<rect x="${f(x0)}" y="${CY0}" width="${f(CW)}" height="${CH}" rx="20" fill="${C.white}" stroke="${C.blue40}" stroke-width="2"/>`, 24);

    // o cartão entra inteiro (fade + subida curta); só o ícone se desenha
    let c = disco(n.ic, cx, cyD, RD, { fundo: C.navy, c: C.white, sw: 3.6, u: inv(ti + 0.05, ti + 0.6, t) });
    c += txt(n.rot, cx, CY0 + 226, { w: 700, s: 46, a: 'middle' });
    // fio laranja sob o nome: só no cartão em foco (um laranja por vez)
    const wf = 56 * e.foco * fin(t, ti + 0.18, 0.3);
    if (wf > 0.5) c += `<rect x="${f(cx - wf / 2)}" y="${CY0 + 243}" width="${f(wf)}" height="5" rx="2.5" fill="${C.orange}"/>`;
    c += bloco(n.apoio, cx, CY0 + 288, { s: 24, maxW: CW - 24, lh: 28, c: C.navy80, a: 'middle' }).svg;
    cont += sobe(kB, opa(lerp(0.45, 1, e.aceso), c), 24);
  });
  if (bases) w += sombra(bases, true);
  w += cont;

  // ---------- avatar da Pessoa B ----------
  {
    const kAv = fin(t, tAv, 0.4);
    w += opa(kAv, avatar(AX, AY, { r: AR, cor: HEROIS.B.cor, c: C.navy, k: lerp(0.92, 1, kAv), u: inv(tAv + 0.05, tAv + 0.5, t), sw: 4.2 }));
  }

  // ---------- etiqueta "má vontade": aparece, é riscada e some ----------
  {
    const k = fin(t, tTag, 0.35) * (1 - fin(t, tSai, 0.3));
    if (k > 0.001) {
      const wt = larg('má vontade', TAG.s, { w: 700 }), tw = wt + 2 * TAG.pad, x = AX - tw / 2, y = TAG.y - TAG.h / 2;
      const yr = TAG.y + 2, xr = wt / 2 + 12;
      const desce = (1 - fin(t, tTag, 0.35)) * 14;
      w += opa(k, `<g transform="translate(0 ${f(desce)})">`
        + `<rect x="${f(x)}" y="${f(y)}" width="${f(tw)}" height="${TAG.h}" rx="14" fill="${C.white}" stroke="${C.navy}" stroke-width="2.5"/>`
        + txt('má vontade', AX, TAG.y + TAG.s * 0.34, { w: 700, s: TAG.s, a: 'middle' })
        + tracar(`M${f(AX - xr)},${yr} H${f(AX + xr)}`, ease.inOut(inv(tRis, tRis + 0.35, t)), { c: C.orange, sw: 6 })
        + `</g>`);
    }
  }

  let s = fundoVivo(t);
  s += camera(w, { z, cx: AX, cy: lerp(AY, 675, uA), dy: lerp(YF - 675, 0, uA) });

  // ---------- título (fora da câmera) ----------
  s += titulo(['Não é má vontade.'], MG, TY, t, t0 + 0.15);
  s += titulo(['*É perfil.*'], MG, TY + TLH, t, tPerfil);

  // ---------- salvaguarda: uma linha, cartão branco no pé do palco ----------
  {
    const kC = fin(t, m('perfil') + 0.42, 0.45);
    if (kC > 0.001) {
      const limpo = SALVA.split('*');                     // [ '', negrito, normal, negrito, '' ]
      let sz = 24;
      const largura = z0 => limpo.reduce((a, p, j) => a + (p ? larg(p, z0, { w: j % 2 ? 700 : 400 }) : 0), 0);
      while (sz > 22 && largura(sz) > CT.w - 48) sz--;
      s += sobe(kC, `<rect x="${CT.x}" y="${CT.y}" width="${CT.w}" height="${CT.h}" rx="14" fill="${C.white}" stroke="${C.blue40}" stroke-width="2"/>`
        + tRico(SALVA, W / 2, CT.y + CT.h / 2 + sz * 0.35, { s: sz, c: C.navy80, hi: C.navy, hw: 700, a: 'middle' }), 16);
    }
  }
  return s;
}
