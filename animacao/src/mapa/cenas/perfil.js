// Cena "perfil" (20,41–32,30 s): "Em cada pessoa, mapeamos cinco sinais: clareza do porquê, fluência digital,
// autonomia para aprender, segurança para errar, e o valor que ela vê na mudança."
// Versão limpa: três blocos e nada mais.
//  1. título;
//  2. o RADAR grande da Pessoa B (avatar anônimo no centro): a grade se desenha em 'cada_pessoa', os cinco ícones
//     aparecem apagados em 'cinco' e, a cada 'sinalN', o ícone N acende (navy), ganha o rótulo e o vértice cresce;
//  3. o cartão com o sinal da vez (nome, pergunta e a barra baixo ↔ alto) e, no rodapé, as fontes.
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

// ---------- geometria ----------
const P = HEROIS.B, V = P.sinais;
const RD = 38, RS = 282;                           // raio dos discos dos sinais e da órbita em que ficam
const CX = 540, CY = 338 + RD + RS;                // radar: o disco de cima encosta em y = 338
const R = 220, RP = R + 14;                        // raio do radar e do prato branco
const lugar = i => pontoRadar(CX, CY, RS, i, 1);
// rótulos em duas linhas, do lado de fora do radar
const ROT = [['Clareza', 'do porquê'], ['Fluência', 'digital'], ['Autonomia', 'para aprender'], ['Segurança', 'para errar'], ['Valor que vê', 'na mudança']];
const ESQ = [false, false, false, true, true];     // rótulo à esquerda do disco?
const CD = { x: MG, y: 966, w: W - 2 * MG, h: 202, div: 1112 };   // cartão do sinal da vez
const IC = { cx: CD.x + 62, cy: CD.y + 54, r: 34 };
const TX = IC.cx + IC.r + 22;
const XL = CD.x + 28, XR = CD.x + CD.w - 28;       // bordas do conteúdo do cartão
const BR = { y: 1075, h: 14 };                     // barra baixo ↔ alto
const ABRE = { ic: 'pessoa', rot: 'Pessoa B', pergunta: 'Como ela percebe, avalia e decide a mudança?' };

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
  s += titulo(['Cinco sinais formam', 'o *perfil* de cada pessoa'], MG, 196, t, t0 + 0.15);
  // selo fixo, no alto do palco à direita
  s += opa(fin(t, t0 + 0.6, 0.4), selo('Ilustrativo', W - MG, 340, { a: 'end' }));

  // =====================================================================================
  // RADAR
  // =====================================================================================
  // prato
  {
    const k = fin(t, t0 + 0.2, 0.45);
    s += opa(k, pop(0.96 + 0.04 * k, CX, CY, sombra(`<circle cx="${CX}" cy="${CY}" r="${RP}" fill="${C.white}" stroke="${C.blue20}" stroke-width="2"/>`, true)));
  }
  // grade e polígono do perfil
  s += radar({ cx: CX, cy: CY, R, valores: V, cor: P.cor, uGrade: uG, uEixo: uE, rotulos: 'nada' });
  // Pessoa B no centro: avatar anônimo, parado
  {
    const k = fin(t, t0 + 0.35, 0.4);
    s += opa(k, avatar(CX, CY, { r: 28, cor: P.cor, c: C.navy, k: 0.9 + 0.1 * k, anel: C.white, asw: 4, sw: 3 }));
  }
  // os cinco sinais nas pontas: apagados em 'cinco'; cada um acende quando é falado
  for (let i = 0; i < 5; i++) {
    const a = tCinco - 0.04 + i * 0.07, k = back(t, a, 0.4);
    if (k <= 0.001) continue;
    const [lx, ly] = lugar(i), esq = ESQ[i];
    const fundo = mix(mix(C.white, C.blue20, aceso[i]), C.navy, foco[i]);
    const tinta = mix(mix(C.navy40, C.navy, aceso[i]), C.white, foco[i]);
    let b = disco(SINAIS[i].ic, lx, ly, RD, { k: (0.8 + 0.2 * k) * (1 + 0.08 * foco[i]), fundo, c: tinta, anel: mix(C.navy20, fundo, aceso[i]), asw: 2 });
    if (aceso[i] > 0.001) {
      const tx = esq ? lx - RD - 16 : lx + RD + 16, dx = (1 - aceso[i]) * (esq ? 10 : -10);
      let l = '';
      ROT[i].forEach((ln, j) => { l += txt(ln, tx, ly + 8 + (j - 0.5) * 28, { w: 700, s: 24, a: esq ? 'end' : 'start' }); });
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
      let p = sombra(`<rect x="${CD.x}" y="${CD.y}" width="${CD.w}" height="${CD.h}" rx="22" fill="${C.white}" stroke="${C.blue20}" stroke-width="2"/>`, true);

      // conteúdo que troca: abertura (Pessoa B) e os 5 sinais
      const estados = [{ a: t0 + 0.4, d: ABRE }, ...SINAIS.map((d, i) => ({ a: tS[i], d, navy: true }))];
      estados.forEach((e, j) => {
        const b = j < estados.length - 1 ? estados[j + 1].a : 1e6;
        const kIn = fin(t, e.a + 0.04, 0.3), o = kIn * (1 - fin(t, b - 0.12, 0.14));
        if (o <= 0.001) return;
        const c = disco(e.d.ic, IC.cx, IC.cy, IC.r, { fundo: e.navy ? C.navy : C.blue20, c: e.navy ? C.white : C.navy, sw: 3.2 })
          + txt(e.d.rot, TX, IC.cy - 8, { w: 700, s: 28 })
          + txt(e.d.pergunta, TX, IC.cy + 27, { s: 24, c: C.navy80 });
        p += `<g opacity="${f(o)}" transform="translate(${f((1 - kIn) * 14)} 0)">${c}</g>`;
      });

      // nível do sinal na Pessoa B: a barra vai direto de um valor ao outro
      {
        let val = 0;
        for (let i = 0; i < 5; i++) val = lerp(val, V[i], ease.inOut(inv(tS[i] + 0.04, tS[i] + 0.64, t)));
        const liga = fin(t, tS[0] + 0.04, 0.2);
        const wB = larg('baixo', 22), wA = larg('alto', 22);
        const x0 = XL + wB + 16, x1 = XR - wA - 16, bw = x1 - x0, my = BR.y + BR.h / 2;
        p += txt('baixo', XL, my + 7.5, { s: 22, c: C.navy80 }) + txt('alto', XR, my + 7.5, { s: 22, c: C.navy80, a: 'end' });
        p += `<rect x="${f(x0)}" y="${BR.y}" width="${f(bw)}" height="${BR.h}" rx="${BR.h / 2}" fill="${C.gray40}"/>`;
        if (liga > 0.001) {
          const xv = x0 + bw * clamp(val, 0.02, 1);
          p += opa(liga, `<rect x="${f(x0)}" y="${BR.y}" width="${f(Math.max(BR.h, xv - x0))}" height="${BR.h}" rx="${BR.h / 2}" fill="${P.cor}"/>`
            + `<circle cx="${f(xv)}" cy="${my}" r="11" fill="${C.white}" stroke="${P.cor}" stroke-width="5"/>`);
        }
      }

      // rodapé das fontes (texto obrigatório): fica o tempo todo
      p += `<rect x="${XL}" y="${CD.div}" width="${XR - XL}" height="2" fill="${C.gray}"/>`
        + tRico('*Fontes:* pesquisa curta, conversa com gestores e dados de uso.', XL, (CD.div + CD.y + CD.h) / 2 + 9.5, { s: 24, c: C.navy80, hi: C.navy, hw: 700 });

      s += sobe(kCd, p, 24);
    }
  }
  return s;
}
