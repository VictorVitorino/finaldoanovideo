// Cena "perfil" (20,41–32,30 s): "Em cada pessoa, mapeamos cinco sinais: clareza do porquê, fluência digital,
// autonomia para aprender, segurança para errar, e o valor que ela vê na mudança."
// Versão limpa, composta para 16:9 (1920 x 1080) no esquema A com o peso invertido: três blocos e nada mais.
//  1. à esquerda (x 96–776), o título em três linhas;
//  2. abaixo dele, o cartão com o sinal da vez (ícone, nome, pergunta e a barra baixo ↔ alto) e, no rodapé, as fontes;
//  3. à direita (x 856–1824, a 80 px do cartão), o RADAR grande da Pessoa B (avatar anônimo no centro): a grade se desenha em
//     'cada_pessoa', os cinco ícones aparecem apagados em 'cinco' e, a cada 'sinalN', o ícone N acende (navy),
//     ganha o rótulo e o vértice cresce.
// Um foco por vez: o sinal que está sendo falado fica em navy e os já lidos recuam; no fim todos voltam a 100%.
// Sem câmera, sem scanner, sem contadores: depois que um elemento entra, ele fica parado.
import { W, MG, C, txt, tRico, larg, fin, back, pop, opa, sobe, selo, disco, titulo, clamp, lerp, inv, ease, n2 } from '../base.js';
import { SINAIS, HEROIS, radar, pontoRadar, avatar } from '../modelo.js';
import { fundoVivo, sombra } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const CHIP = '01 · O perfil';
export const LEGENDA = true;

// mistura de duas cores #RRGGBB (u: 0 = a, 1 = b)
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, u) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join('');
};

// ---------- geometria (quadro 1920 x 1080; palco y 130–910; legenda a partir de y 930) ----------
const P = HEROIS.B, V = P.sinais;
// coluna da esquerda: título e cartão
const X0 = MG, X1 = 776;                           // o cartão termina 80 px antes do rótulo mais à esquerda do radar (x 856)
const TIT = { y: 240, s: 72, lh: 82 };              // linhas de base em 240, 322 e 404
// coluna da direita: radar
const KR = 1.25;                                    // o radar do kit é desenhado menor e ampliado (traços e pontos crescem juntos)
const R = 248, RP = R + 12;                         // raio do radar e do prato branco
const RD = 43, RS = R + 63;                         // raio dos discos dos sinais e da órbita em que ficam
const CX = 1364, CY = 550;                          // o rótulo mais à direita (Fluência) termina na margem, x = 1824; o conjunto fica centrado na altura do bloco da esquerda
const lugar = i => pontoRadar(CX, CY, RS, i, 1);
// rótulos em duas linhas, do lado de fora do radar
const ROT = [['Clareza', 'do porquê'], ['Fluência', 'digital'], ['Autonomia', 'para aprender'], ['Segurança', 'para errar'], ['Valor que vê', 'na mudança']];
const ESQ = [false, false, false, true, true];     // rótulo à esquerda do disco?
const SR = 30, LR = 36, GR = 20;                    // rótulos: corpo, entrelinha e distância do disco (o disco em foco cresce 8%)
// cartão do sinal da vez
const CD = { x: X0, y: 462, w: X1 - X0, h: 392 };
const XL = CD.x + 36, XR = CD.x + CD.w - 36;       // bordas do conteúdo do cartão
const IC = { cx: XL + 44, cy: CD.y + 78, r: 44 };
const TX = IC.cx + IC.r + 24;
const YP = CD.y + 170;                              // linha de base da pergunta
const BR = { y: CD.y + 214, h: 16 };                // barra baixo ↔ alto
const DIV = CD.y + 272;                             // fio que separa o rodapé das fontes
const FONTES = ['*Fontes:* pesquisa curta, conversa', 'com gestores e dados de uso.'];
const ABRE = { ic: 'pessoa', rot: 'Pessoa B', pergunta: 'Como ela percebe, avalia e decide a mudança?' };
// selo do kit (fonte fixa de 14 px) ampliado para o texto passar de 26 px
const KS = 1.9;

export function desenhar(t, ctx) {
  const { t0, m } = ctx;
  // ---------- relógio da cena ----------
  const tGrade = m('cada_pessoa') - 0.1;                 // a grade começa a se desenhar
  const tCinco = m('cinco');                             // os cinco ícones aparecem, apagados
  const tM = [1, 2, 3, 4, 5].map(n => m('sinal' + n));
  const tA = tM.map(a => a - 0.05);                      // o sinal acende
  const tS = tM.map(a => a - 0.12);                      // o cartão troca
  const tFim = m('mudanca');                             // perfil completo
  const uG = inv(tGrade, tCinco - 0.05, t);
  const uFim = fin(t, tFim, 0.4);
  const uE = tA.map(a => inv(a, a + 0.6, t));            // cada vértice cresce
  const aceso = tA.map(a => fin(t, a, 0.25));
  // foco: o sinal que está sendo falado (o último segue em foco até o fim, junto do cartão)
  const foco = tA.map((a, i) => fin(t, a, 0.25) * (i < 4 ? 1 - fin(t, tA[i + 1] - 0.1, 0.25) : 1));

  let s = fundoVivo(t, { seed: 31 });
  s += titulo(['Cinco sinais', 'formam o *perfil*', 'de cada pessoa'], X0, TIT.y, t, t0 + 0.15, { s: TIT.s, lh: TIT.lh });
  // selo fixo, no alto do palco à direita
  s += opa(fin(t, t0 + 0.6, 0.4), `<g transform="translate(${W - MG} 130) scale(${KS})">${selo('Ilustrativo', 0, 0, { a: 'end' })}</g>`);

  // =====================================================================================
  // RADAR
  // =====================================================================================
  // prato
  {
    const k = fin(t, t0 + 0.2, 0.45);
    s += opa(k, pop(0.96 + 0.04 * k, CX, CY, sombra(`<circle cx="${CX}" cy="${CY}" r="${RP}" fill="${C.white}" stroke="${C.blue20}" stroke-width="2.5"/>`, true)));
  }
  // grade e polígono do perfil
  s += `<g transform="translate(${CX} ${CY}) scale(${KR})">${radar({ cx: 0, cy: 0, R: R / KR, valores: V, cor: P.cor, uGrade: uG, uEixo: uE, rotulos: 'nada' })}</g>`;
  // Pessoa B no centro: avatar anônimo, parado
  {
    const k = fin(t, t0 + 0.35, 0.4);
    s += opa(k, avatar(CX, CY, { r: 35, cor: P.cor, c: C.navy, k: 0.9 + 0.1 * k, anel: C.white, asw: 5, sw: 3.6 }));
  }
  // os cinco sinais nas pontas: apagados em 'cinco'; cada um acende quando é falado
  for (let i = 0; i < 5; i++) {
    const a = tCinco - 0.04 + i * 0.07, k = back(t, a, 0.4);
    if (k <= 0.001) continue;
    const [lx, ly] = lugar(i), esq = ESQ[i];
    const fundo = mix(mix(C.white, C.blue20, aceso[i]), C.navy, foco[i]);
    const tinta = mix(mix(C.navy40, C.navy, aceso[i]), C.white, foco[i]);
    let b = disco(SINAIS[i].ic, lx, ly, RD, { k: (0.8 + 0.2 * k) * (1 + 0.08 * foco[i]), fundo, c: tinta, sw: 3.4, anel: mix(C.navy20, fundo, aceso[i]), asw: 2.5 });
    if (aceso[i] > 0.001) {
      const tx = esq ? lx - RD - GR : lx + RD + GR, dx = (1 - aceso[i]) * (esq ? 10 : -10);
      let l = '';
      ROT[i].forEach((ln, j) => { l += txt(ln, tx, ly + SR * 0.34 + (j - 0.5) * LR, { w: 700, s: SR, a: esq ? 'end' : 'start' }); });
      b += `<g opacity="${f(aceso[i])}" transform="translate(${f(dx)} 0)">${l}</g>`;
    }
    // já lido e fora do foco: recua; no fim todos voltam
    const vis = lerp(1, lerp(0.55, 1, Math.max(foco[i], uFim)), aceso[i]);
    s += opa(clamp(k * 1.5) * vis, b);
  }

  // =====================================================================================
  // CARTÃO: o sinal da vez (nome, pergunta, barra baixo ↔ alto) e as fontes
  // =====================================================================================
  {
    const kCd = fin(t, t0 + 0.4, 0.45);
    if (kCd > 0.001) {
      let p = sombra(`<rect x="${CD.x}" y="${CD.y}" width="${CD.w}" height="${CD.h}" rx="24" fill="${C.white}" stroke="${C.blue20}" stroke-width="2.5"/>`, true);

      // conteúdo que troca: abertura (Pessoa B) e os 5 sinais
      const estados = [{ a: t0 + 0.4, d: ABRE }, ...SINAIS.map((d, i) => ({ a: tS[i], d, navy: true }))];
      estados.forEach((e, j) => {
        const b = j < estados.length - 1 ? estados[j + 1].a : 1e6;
        const kIn = fin(t, e.a + 0.04, 0.3), o = kIn * (1 - fin(t, b - 0.12, 0.14));
        if (o <= 0.001) return;
        const c = disco(e.d.ic, IC.cx, IC.cy, IC.r, { fundo: e.navy ? C.navy : C.blue20, c: e.navy ? C.white : C.navy, sw: 3.6 })
          + txt(e.d.rot, TX, IC.cy + 14, { w: 700, s: 40 })
          + txt(e.d.pergunta, XL, YP, { s: 30, c: C.navy80 });
        p += `<g opacity="${f(o)}" transform="translate(${f((1 - kIn) * 14)} 0)">${c}</g>`;
      });

      // nível do sinal na Pessoa B: a barra vai direto de um valor ao outro
      {
        let val = 0;
        for (let i = 0; i < 5; i++) val = lerp(val, V[i], ease.inOut(inv(tS[i] + 0.04, tS[i] + 0.64, t)));
        const liga = fin(t, tS[0] + 0.04, 0.2);
        const wB = larg('baixo', 26), wA = larg('alto', 26);
        const x0 = XL + wB + 18, x1 = XR - wA - 18, bw = x1 - x0, my = BR.y + BR.h / 2;
        p += txt('baixo', XL, my + 9, { s: 26, c: C.navy80 }) + txt('alto', XR, my + 9, { s: 26, c: C.navy80, a: 'end' });
        p += `<rect x="${f(x0)}" y="${BR.y}" width="${f(bw)}" height="${BR.h}" rx="${BR.h / 2}" fill="${C.gray40}"/>`;
        if (liga > 0.001) {
          const xv = x0 + bw * clamp(val, 0.02, 1);
          p += opa(liga, `<rect x="${f(x0)}" y="${BR.y}" width="${f(Math.max(BR.h, xv - x0))}" height="${BR.h}" rx="${BR.h / 2}" fill="${P.cor}"/>`
            + `<circle cx="${f(xv)}" cy="${my}" r="13" fill="${C.white}" stroke="${P.cor}" stroke-width="6"/>`);
        }
      }

      // rodapé das fontes (texto obrigatório): fica o tempo todo
      p += `<rect x="${XL}" y="${DIV}" width="${XR - XL}" height="2" fill="${C.gray}"/>`;
      FONTES.forEach((ln, j) => { p += tRico(ln, XL, DIV + 46 + j * 37, { s: 28, c: C.navy80, hi: C.navy, hw: 700 }); });

      s += sobe(kCd, p, 24);
    }
  }
  return s;
}
