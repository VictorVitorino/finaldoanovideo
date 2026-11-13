// Cena "perfil" (20,41–32,30 s): "Em cada pessoa, mapeamos cinco sinais: clareza do porquê, fluência digital,
// autonomia para aprender, segurança para errar, e o valor que ela vê na mudança."
// O perfil é CONSTRUÍDO na tela como um instrumento de leitura (sem personagens):
//  1. a Pessoa B é um avatar anônimo no centro de um prato; em 'cada_pessoa' um anel de scanner se abre a partir dela,
//     uma varredura de luz gira (como um sonar) e a grade do radar se desenha até 'cinco';
//  2. em 'cinco' nascem as cinco vagas numeradas, o contador "0/5 sinais", e o cartão de leitura desliza de baixo;
//  3. a cada 'sinalN' um pulso de luz corre do centro pelo eixo N, o disco do ícone nasce na ponta com overshoot,
//     o vértice do polígono cresce, o contador vira e o cartão troca (nome, pergunta, barra baixo ↔ alto com o percentual);
//  4. depois de 'mudanca' o polígono pulsa com brilho, o cartão resume o perfil e destaca as fontes.
// A câmera aproxima de leve o radar durante a lista (1,00 → 1,06), acompanha o eixo da vez e volta a 1,00 no fim.
// Vida entre as falas: um cometa dá a volta pelas vagas antes do 1º sinal, a próxima vaga "carrega" com um arco,
// os tracinhos do mostrador acendem no setor da vez, pontos de luz sobem pelo eixo em foco e um reflexo varre o cartão.
import { W, MG, C, txt, tRico, larg, fin, fout, back, elast, pop, opa, tracar, onda, particulas, varredura, selo, rotulo, etiqueta, disco, icone, titulo, clamp, lerp, inv, ease, n2 } from '../base.js';
import { SINAIS, HEROIS, radar, pontoRadar, avatar } from '../modelo.js';
import { fundoVivo, camera, sombra, brilho } from '../ludico.js';

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
const bate = (t, a, d) => Math.sin(Math.PI * inv(a, a + d, t));   // 0 -> 1 -> 0
const polar = (r, graus) => [CX + Math.cos(graus * Math.PI / 180) * r, CY + Math.sin(graus * Math.PI / 180) * r];

// ---------- geometria ----------
const P = HEROIS.B, V = P.sinais;
const CX = 540, CY = 640, R = 205;                 // radar
const RP = R + 17;                                 // prato branco
const RS = 264, RD = 36;                           // órbita das vagas e raio dos discos dos sinais
const ANG = i => -90 + 72 * i;                     // ângulo do eixo i
const vaga = i => pontoRadar(CX, CY, RS, i, 1);
// rótulos em duas linhas, do lado de fora do radar
const ROT = [['Clareza', 'do porquê'], ['Fluência', 'digital'], ['Autonomia', 'para aprender'], ['Segurança', 'para errar'], ['Valor que vê', 'na mudança']];
const ESQ = [false, false, false, true, true];     // rótulo à esquerda do disco?
const CT = { x: MG, y: 462 };                      // contador (linha de base do número)
const CD = { x: MG, y: 950, w: W - 2 * MG, h: 218, div: 1104 };   // cartão de leitura
const IC = { cx: CD.x + 66, cy: 1003, r: 37 };
const TX = CD.x + 122;
const XR = CD.x + CD.w - 30;                       // borda direita do conteúdo do cartão
const BR = { y: 1062, h: 16 };                     // barra baixo ↔ alto
const ABRE = { ic: 'pessoa', rot: 'Pessoa B', pergunta: 'Como ela percebe, avalia e decide a mudança?' };
const INTRO = { ic: 'cerebro', rot: 'Cinco sinais', pergunta: 'Cada sinal responde a uma pergunta.' };
const FIM = { ic: 'check', rot: 'Perfil completo', pergunta: 'Cinco sinais lidos na Pessoa B.' };

export function desenhar(t, ctx) {
  const { t0, m } = ctx;
  // ---------- relógio da cena ----------
  const tScan = m('cada_pessoa') - 0.1;                  // o scanner liga
  const tCinco = m('cinco');
  const uG = inv(tScan + 0.2, tCinco - 0.05, t);         // a grade se desenha
  const tCard = t0 + 0.4;                                // o cartão de leitura desliza de baixo
  const tM = [1, 2, 3, 4, 5].map(n => m('sinal' + n));
  const tP = tM.map(a => a - 0.3);                       // o pulso de luz sai do centro
  const tA = tM.map(a => a - 0.04);                      // chega à ponta: o disco nasce (junto do "pop")
  const tS = tM.map(a => a - 0.14);                      // o cartão troca
  const tC = tM.map(a => a + 0.2);                       // o contador vira (junto do "tique")
  const tFim = m('mudanca');                             // perfil completo (dá tempo de ler o fecho antes do corte)
  const tCom = tCinco + 0.3, dCom = tP[0] - 0.02 - tCom;  // um cometa dá a volta pelas cinco vagas antes do 1º sinal
  const uFim = fin(t, tFim, 0.3);
  const uE = tA.map(a => inv(a + 0.02, a + 0.62, t));    // cada vértice cresce
  const foco = tA.map((a, i) => fin(t, a - 0.1, 0.2) * (1 - fin(t, i < 4 ? tP[i + 1] : tFim, 0.25)));
  const fracV = i => V[i] * ease.back(clamp(uE[i])) * 0.96 + 0.04 * Math.min(1, uG);
  const nOk = tC.filter(a => t >= a).length;

  let s = fundoVivo(t, { seed: 31 });
  s += titulo(['Cinco sinais formam', 'o *perfil* de cada pessoa'], MG, 196, t, t0 + 0.15);

  // =====================================================================================
  // RADAR (vai dentro da câmera)
  // =====================================================================================
  let rad = '';
  const kPl = back(t, t0 + 0.18, 0.55);
  // órbita pontilhada que liga as cinco vagas (gira devagar)
  // (é um arco: abre um vão ao lado do disco 1 para o pontilhado não atravessar o rótulo "Clareza do porquê")
  {
    const a0 = lerp(-82, -55, ease.inOut(inv(tA[0] - 0.05, tA[0] + 0.3, t)));
    const [x0, y0] = polar(RS, a0), [x1, y1] = polar(RS, 262);
    rad += opa(fin(t, tCinco - 0.2, 0.45), `<path d="M${f(x0)},${f(y0)} A${RS},${RS} 0 1 1 ${f(x1)},${f(y1)}" fill="none" stroke="${C.navy40}" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 13" stroke-dashoffset="${f(-t * 16)}"/>`);
    // cometa de luz: dá uma volta pela órbita, passando pelas cinco vagas, e entrega a vez ao sinal 1
    const u = inv(tCom, tCom + dCom, t);
    if (u > 0 && u < 1) {
      let c = '';
      for (let j = 0; j < 12; j++) {
        const aj = -90 + 360 * u - j * 2.6;
        if (aj < -90) break;
        const [x, y] = polar(RS, aj);
        if (j === 0) c += `<circle cx="${f(x)}" cy="${f(y)}" r="15" fill="${C.orange}" opacity=".22"/>`;
        c += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(7.5 - j * 0.5)}" fill="${C.orange}" opacity="${f(Math.pow(1 - j / 12, 1.4))}"/>`;
      }
      rad += opa(Math.min(1, 8 * u, 6 * (1 - u)), c);
    }
  }
  // prato
  if (kPl > 0.001) {
    rad += pop(kPl, CX, CY, sombra(`<circle cx="${CX}" cy="${CY}" r="${RP}" fill="${C.white}" stroke="${C.blue20}" stroke-width="2.5"/>`, true)
      + `<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#g-azul)" opacity=".2"/>`);
  }
  // brilho laranja quando o perfil fecha
  {
    const u = inv(tFim, tFim + 0.8, t);
    if (u > 0 && u < 1) rad += `<circle cx="${CX}" cy="${CY}" r="${f(R * (0.7 + 0.5 * ease.out(u)))}" fill="url(#g-laranja)" opacity="${f(Math.sin(Math.PI * u) * 0.9)}"/>`;
  }
  // mostrador: tracinhos na borda do prato (aparecem com o scanner)
  {
    const k = fin(t, tScan + 0.5, 0.5);
    if (k > 0.001) {
      let fino = '', grosso = '';
      for (let j = 0; j < 60; j++) {
        if (j / 60 > k + 0.001) break;
        const a = -90 + j * 6, g = j % 5 === 0;
        const [x0, y0] = polar(g ? R + 4 : R + 6, a), [x1, y1] = polar(R + 11, a);
        if (g) grosso += `M${f(x0)},${f(y0)} L${f(x1)},${f(y1)} `; else fino += `M${f(x0)},${f(y0)} L${f(x1)},${f(y1)} `;
      }
      rad += `<path d="${fino}" stroke="${C.navy20}" stroke-width="1.6" stroke-linecap="round"/><path d="${grosso}" stroke="${C.navy40}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
  }
  // varredura de luz (sonar) que gira enquanto a grade se desenha
  const rScan = lerp(48, RP, ease.out(inv(tScan, tScan + 0.75, t)));
  const aSw = -90 + 320 * (t - tScan);
  {
    const k = fin(t, tScan + 0.05, 0.2) * (1 - fin(t, tCinco + 0.05, 0.5));
    if (k > 0.001) {
      const rr = Math.min(rScan - 6, R + 2);
      let sw = '';
      for (let j = 0; j < 16; j++) {
        const [x1, y1] = polar(rr, aSw - j * 5), [x2, y2] = polar(rr, aSw - (j + 1) * 5 - 0.6);
        sw += `<path d="M${CX},${CY} L${f(x1)},${f(y1)} A${f(rr)},${f(rr)} 0 0 0 ${f(x2)},${f(y2)}Z" fill="${C.blue}" opacity="${f(0.34 * Math.pow(1 - j / 16, 1.6))}"/>`;
      }
      const [hx, hy] = polar(rr, aSw);
      sw += `<path d="M${CX},${CY} L${f(hx)},${f(hy)}" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>`
        + `<circle cx="${f(hx)}" cy="${f(hy)}" r="5" fill="${C.white}" stroke="${C.blue}" stroke-width="3"/>`;
      rad += opa(k, sw);
    }
  }
  // grade e polígono do perfil
  rad += radar({ cx: CX, cy: CY, R, valores: V, cor: P.cor, uGrade: uG, uEixo: uE, rotulos: 'nada' });
  // ecos do sonar: quando a varredura cruza cada eixo pela primeira vez, a ponta acende
  for (let i = 0; i < 5; i++) {
    const tb = tScan + (72 * i) / 320 + 0.02, age = t - tb;
    if (age <= 0 || t > tCinco + 0.4) continue;
    const [x, y] = pontoRadar(CX, CY, R, i, 1);
    rad += onda(x, y, age, { c: C.blue, r0: 5, r1: 24, sw: 4, d: 0.6 })
      + opa(1 - fin(t, tCinco - 0.1, 0.4), `<circle cx="${f(x)}" cy="${f(y)}" r="${f(6 * back(t, tb, 0.3))}" fill="${C.blue}"/>`);
  }
  // eixo em foco e vértice que acabou de ser lido
  for (let i = 0; i < 5; i++) {
    if (foco[i] > 0.001) {
      const [x, y] = pontoRadar(CX, CY, R, i, 1);
      rad += opa(foco[i] * 0.9, tracar(`M${CX},${CY} L${f(x)},${f(y)}`, ease.out(inv(tP[i] + 0.05, tA[i], t)), { c: C.navy, sw: 2.6 }));
    }
    if (uE[i] <= 0) continue;
    const [x, y] = pontoRadar(CX, CY, R, i, fracV(i));
    rad += onda(x, y, t - (tA[i] + 0.3), { c: C.orange, r0: 9, r1: 26, sw: 4, d: 0.5 });
    const kR = foco[i] * fin(t, tA[i] + 0.45, 0.25);
    if (kR > 0.001) {
      rad += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(13 + 2 * Math.sin((t - tA[i]) * 6))}" fill="none" stroke="${C.navy}" stroke-width="2.4" opacity="${f(kR * 0.85)}"/>`;
      // leitura em curso: pontos de luz sobem pelo eixo, da pessoa até o disco do sinal
      const ra = R * fracV(i) + 18, rb = RS - RD - 6;
      for (let j = 0; j < 3; j++) {
        const p = (((t - tA[i]) * 0.85 + j / 3) % 1 + 1) % 1;
        const [fx, fy] = polar(lerp(ra, rb, p), ANG(i));
        rad += `<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(3 + 2.2 * Math.sin(Math.PI * p))}" fill="${C.orange}" opacity="${f(kR * Math.sin(Math.PI * p))}"/>`;
      }
    }
  }
  // eco do polígono no fecho (com brilho)
  {
    const u = inv(tFim + 0.02, tFim + 0.7, t);
    if (u > 0 && u < 1) {
      const pts = V.map((v, i) => pontoRadar(CX, CY, R, i, v * (1 + 1.1 * ease.out(u))));
      rad += brilho(`<path d="M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}Z" fill="none" stroke="${C.orange}" stroke-width="${f(7 * (1 - u) + 1)}" stroke-linejoin="round" opacity="${f(1 - u)}"/>`);
    }
  }
  // anel de scanner: abre a partir da pessoa e fica girando na borda do prato
  {
    const k = fin(t, tScan, 0.12);
    if (k > 0.001) {
      const abrindo = inv(tScan, tScan + 0.75, t) < 1;
      const cor = mix(C.blue, C.orange, uFim);
      const anel = `<circle cx="${CX}" cy="${CY}" r="${f(rScan)}" fill="none" stroke="${cor}" stroke-width="${f(abrindo ? 5 : 3.5)}" stroke-linecap="round" stroke-dasharray="${f(rScan * 0.62)} ${f(rScan * 0.425)}" transform="rotate(${f(t * 70)} ${CX} ${CY})"/>`;
      rad += opa(k * (abrindo ? 1 : lerp(0.75, 1, uFim)), abrindo ? brilho(anel) : anel);
      rad += onda(CX, CY, t - tFim, { c: C.orange, r0: RP, r1: 26, sw: 5, d: 0.6 });
    }
  }
  // marcador do instrumento: os tracinhos do mostrador acendem em laranja no setor do eixo que está sendo lido
  // (o setor desliza de um eixo para o outro com a fala)
  {
    const k = fin(t, tP[0] + 0.05, 0.25) * (1 - fin(t, tFim - 0.15, 0.3));
    if (k > 0.001) {
      let aF = ANG(0);
      for (let i = 1; i < 5; i++) aF += 72 * ease.inOut(inv(tP[i] - 0.08, tP[i] + 0.34, t));
      for (let j = 0; j < 60; j++) {
        const a = -90 + j * 6, dif = Math.abs((((a - aF) % 360) + 540) % 360 - 180), w = clamp(1 - dif / 34);
        if (w <= 0.01) continue;
        const [x0, y0] = polar(R + 5 - 2 * w, a), [x1, y1] = polar(R + 11 + 2 * w, a);
        rad += `<path d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}" stroke="${C.orange}" stroke-width="${f(2 + 1.4 * w)}" stroke-linecap="round" opacity="${f(k * Math.min(1, w * 1.6))}"/>`;
      }
    }
  }

  // ---------- as cinco vagas, o pulso de luz, os discos dos sinais e os rótulos ----------
  for (let i = 0; i < 5; i++) {
    const [lx, ly] = vaga(i), esq = ESQ[i];
    const nasceu = t >= tA[i];
    // vaga numerada, à espera do sinal
    if (!nasceu) {
      const kV = back(t, tCinco - 0.06 + i * 0.07, 0.4);
      if (kV > 0.001) {
        const passa = bate(t, tCom + dCom * (i / 5) - 0.06, 0.34) + (i === 0 ? bate(t, tCom + dCom - 0.1, 0.3) : 0);
        const vez = t >= tP[i] || passa > 0.25;
        rad += pop((0.5 + 0.5 * kV) * (1 + 0.14 * passa), lx, ly, opa(clamp(kV * 1.3),
          `<circle cx="${f(lx)}" cy="${f(ly)}" r="${RD - 2}" fill="${C.white}" stroke="${vez ? C.orange : C.navy40}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3 8.5" transform="rotate(${f(t * 20 + i * 20)} ${f(lx)} ${f(ly)})"/>`
          + txt(String(i + 1), lx, ly + 8.5, { w: 700, s: 24, c: vez ? C.orangeD : C.navy40, a: 'middle' })
          // a próxima vaga "carrega": um arco laranja se fecha em volta dela enquanto o sinal anterior é lido
          + (i > 0 ? tracar(`M${f(lx)},${f(ly - RD - 4)} a${RD + 4},${RD + 4} 0 1 1 -0.01,0`, ease.inOut(inv(tA[i - 1] + 0.8, tP[i] - 0.02, t)), { c: C.orange, sw: 3.5 }) : '')));
      }
    }
    // pulso de luz: corre do centro pelo eixo até a vaga
    {
      const u = inv(tP[i], tA[i], t), some = 1 - fin(t, tA[i], 0.12);
      if (u > 0 && some > 0.001) {
        const r1 = lerp(26, RS - RD + 2, ease.inOut(u)), r0 = Math.max(26, r1 - 30 - 80 * Math.sin(Math.PI * Math.min(1, u)));
        const [xa, ya] = polar(r0, ANG(i)), [xb, yb] = polar(r1, ANG(i));
        const d = `M${f(xa)},${f(ya)} L${f(xb)},${f(yb)}`;
        // halo em camadas (sem filtro: um traço reto tem caixa de largura zero e o filtro o apagaria)
        rad += opa(some, `<path d="${d}" stroke="${C.orange}" stroke-width="26" stroke-linecap="round" opacity=".14"/>`
          + `<path d="${d}" stroke="${C.orange}" stroke-width="15" stroke-linecap="round" opacity=".28"/>`
          + `<path d="${d}" stroke="${C.orange}" stroke-width="7" stroke-linecap="round"/>`
          + `<path d="${d}" stroke="${C.white}" stroke-width="2" stroke-linecap="round" opacity=".9"/>`
          + `<circle cx="${f(xb)}" cy="${f(yb)}" r="${f(15 + 3 * Math.sin(t * 40))}" fill="${C.orange}" opacity=".3"/>`
          + `<circle cx="${f(xb)}" cy="${f(yb)}" r="6.5" fill="${C.white}" stroke="${C.orange}" stroke-width="3"/>`);
      }
    }
    if (!nasceu) continue;
    // disco do sinal: nasce com overshoot, o ícone se desenha; fica navy enquanto é falado
    const kD = back(t, tA[i], 0.45);
    const vis = lerp(0.6, 1, Math.max(foco[i], uFim));
    const fecha = 0.14 * bate(t, tFim + i * 0.06, 0.36);
    let b = onda(lx, ly, t - tA[i], { c: C.orange, r0: RD, r1: 34, sw: 5, d: 0.5 })
      + particulas(40 + i, lx, ly, t - tA[i], { n: 7, v: 80, r: 4, d: 0.55, cores: [C.orange, C.blue, C.orange40] });
    if (foco[i] > 0.001) b += `<circle cx="${f(lx)}" cy="${f(ly)}" r="${f(RD + 8 + 1.5 * Math.sin((t - tA[i]) * 5))}" fill="none" stroke="${C.orange}" stroke-width="3" opacity="${f(foco[i] * fin(t, tA[i] + 0.3, 0.25))}"/>`;
    b += disco(SINAIS[i].ic, lx, ly, RD, { k: kD * (1 + 0.08 * foco[i] + fecha), u: inv(tA[i] + 0.04, tA[i] + 0.6, t), fundo: mix(C.blue20, C.navy, foco[i]), c: foco[i] > 0.45 ? C.white : C.navy, anel: C.white, asw: 3 });
    const kL = ease.out(inv(tA[i] + 0.08, tA[i] + 0.45, t));
    if (kL > 0.001) {
      const tx = esq ? lx - RD - 16 : lx + RD + 16, dx = (1 - kL) * (esq ? 16 : -16);
      let l = '';
      ROT[i].forEach((ln, j) => { l += txt(ln, tx, ly + 8 + (j - 0.5) * 27, { w: 700, s: 24, a: esq ? 'end' : 'start' }); });
      b += `<g opacity="${f(kL)}" transform="translate(${f(dx)} 0)">${l}</g>`;
    }
    rad += opa(vis, b);
  }

  // ---------- Pessoa B no centro: avatar anônimo ----------
  {
    // ondas de sinal saindo da pessoa antes da leitura
    const kO = fin(t, t0 + 0.5, 0.3) * (1 - fin(t, tScan + 0.1, 0.4));
    if (kO > 0.001) {
      let o = '';
      for (let j = 0; j < 3; j++) o += onda(CX, CY, ((t - t0 - 0.5 + j * 0.5) % 1.5 + 1.5) % 1.5, { c: P.cor, r0: 44, r1: 110, sw: 4, d: 1.5 });
      rad += opa(kO, o);
    }
    const kAv = back(t, t0 + 0.3, 0.5);
    const rAv = lerp(42, 27, ease.inOut(inv(tCinco - 0.15, tCinco + 0.5, t))) * (1 + 0.1 * bate(t, tScan, 0.35) + 0.14 * bate(t, tFim, 0.45));
    if (kAv > 0.001) {
      rad += pop(kAv, CX, CY, `<circle cx="${CX}" cy="${CY}" r="${f(rAv + 9 + 2 * Math.sin(t * 2.4))}" fill="${P.cor}" opacity=".28"/>`)
        + avatar(CX, CY, { r: rAv, cor: P.cor, c: C.navy, k: kAv, u: inv(t0 + 0.35, t0 + 0.9, t), anel: C.white, asw: 4, sw: 3 });
    }
  }
  // fecho: partículas discretas
  rad += particulas(77, CX, CY, t - tFim, { n: 14, v: 230, r: 6, d: 0.8, cores: [C.orange, C.blue, C.orange40] });

  // ---------- câmera: aproxima de leve durante a lista, acompanha o eixo da vez e volta no fim ----------
  {
    const zIn = 0.045 * ease.inOut(inv(tM[0] - 0.7, tM[0] + 0.6, t)) + 0.015 * inv(tM[0] + 0.6, tM[4] + 0.4, t);
    const volta = 1 - ease.inOut(inv(tFim - 0.2, tFim + 0.5, t));
    const z = (1 + zIn * volta) * (1 + 0.018 * bate(t, tFim, 0.5));
    let px = 0, py = 0;
    for (let i = 0; i < 5; i++) {
      const fimI = i < 4 ? tP[i + 1] : tFim - 0.25;
      const w = ease.inOut(inv(tP[i] - 0.1, tP[i] + 0.55, t)) * (1 - ease.inOut(inv(fimI - 0.1, fimI + 0.55, t)));
      px += w * Math.cos(ANG(i) * Math.PI / 180) * 12;
      py += w * Math.sin(ANG(i) * Math.PI / 180) * 6;
    }
    s += camera(rad, { z, cx: CX + px, cy: 560 + py, dy: 560 - 675 });
  }

  // =====================================================================================
  // INTERFACE FIXA: Pessoa B, selo, estado da leitura, contador e cartão
  // =====================================================================================
  // etiqueta "Pessoa B" no canto superior esquerdo do palco
  {
    const e = etiqueta(P.nome, MG, 340);
    s += pop(back(t, t0 + 0.45, 0.45), MG + e.w / 2, 360, e.svg);
  }
  // selo fixo, no alto do palco à direita
  s += opa(fin(t, t0 + 0.7, 0.4), selo('Ilustrativo', W - MG, 340, { a: 'end' }));

  // estado da leitura (pílula à direita): "Lendo sinais…" -> "Perfil lido"
  {
    const k = back(t, tScan - 0.05, 0.4);
    if (k > 0.001) {
      const y0 = 396, h = 40;
      const pil = (str, feito) => {
        const wl = larg(str, 21, { w: 700 }) + 56, x0 = W - MG - wl;
        return `<rect x="${f(x0)}" y="${y0}" width="${f(wl)}" height="${h}" rx="${h / 2}" fill="${feito ? C.navy : C.white}" stroke="${feito ? C.navy : C.blue}" stroke-width="2.5"/>`
          + (feito ? icone('check', x0 + 24, y0 + h / 2, 24, { c: C.white, sw: 2.8, u: inv(tFim + 0.05, tFim + 0.5, t) })
            : `<circle cx="${f(x0 + 22)}" cy="${y0 + h / 2}" r="6.5" fill="${C.orange}" opacity="${f(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 9)))}"/>`)
          + txt(str, x0 + 40, y0 + h / 2 + 7.5, { w: 700, s: 21, c: feito ? C.white : C.navy });
      };
      const wl = larg('Lendo sinais…', 21, { w: 700 }) + 56;
      s += pop(k * (1 + 0.1 * bate(t, tFim, 0.4)), W - MG - wl / 2, y0 + h / 2, opa(1 - fin(t, tFim - 0.04, 0.12), pil('Lendo sinais…', false)) + opa(fin(t, tFim + 0.06, 0.2), pil('Perfil lido', true)));
    }
  }

  // contador 0/5 … 5/5 sinais
  {
    const kC = back(t, tCinco - 0.04, 0.45);
    if (kC > 0.001) {
      let c = '', bump = 0;
      tC.forEach(a => { bump += bate(t, a, 0.32); });
      const wd = larg('0', 90, { f: 'L', w: 400 });
      for (let n = 0; n <= 5; n++) {
        const a = n === 0 ? -1e6 : tC[n - 1], b = n < 5 ? tC[n] : 1e6;
        if (t < a) continue;
        const kin = n === 0 ? 1 : back(t, a, 0.36), kout = fin(t, b - 0.02, 0.12);
        if (kout >= 0.999) continue;
        // o número antigo some subindo um pouco; o novo entra com overshoot
        c += opa(clamp(kin * 1.8) * (1 - kout), pop(0.55 + 0.45 * kin, CT.x + wd / 2, CT.y - 30, `<g transform="translate(0 ${f(-kout * 14)})">${txt(String(n), CT.x + wd / 2 - 2, CT.y, { f: 'L', w: 400, s: 90, a: 'middle' })}</g>`));
      }
      const x1 = CT.x + wd + 4;
      c += txt('/5', x1, CT.y, { f: 'L', w: 400, s: 50, c: C.navy40 });
      const x2 = x1 + larg('/5', 50, { f: 'L', w: 400 }) + 14;
      c += rotulo('sinais', x2, CT.y - 27, { s: 22 }) + rotulo('lidos', x2, CT.y, { s: 22, c: C.navy80 });
      // cinco marcas de progresso
      for (let i = 0; i < 5; i++) {
        const feito = fin(t, tC[i], 0.2), x = CT.x + i * 41, y = CT.y + 18;
        c += `<rect x="${f(x)}" y="${y}" width="34" height="10" rx="5" fill="${foco[i] > 0.5 && feito < 0.5 ? C.orange : mix(C.navy20, C.navy, feito)}"/>`;
      }
      s += pop(kC * (1 + 0.07 * bump + 0.07 * bate(t, tFim, 0.4)), CT.x + 60, CT.y - 30, c);
      if (nOk > 0) s += onda(CT.x + wd / 2, CT.y - 32, t - tC[nOk - 1], { c: C.orange, r0: 30, r1: 14, sw: 4, d: 0.45 });
    }
  }

  // ---------- cartão de leitura: o sinal da vez (nome, pergunta, barra baixo ↔ alto) e as fontes ----------
  {
    const kCd = back(t, tCard, 0.55);
    if (kCd > 0.001) {
      let p = sombra(`<rect x="${CD.x}" y="${CD.y}" width="${CD.w}" height="${CD.h}" rx="22" fill="${C.white}" stroke="${C.blue20}" stroke-width="2"/>`, true);
      // reflexo de luz que varre o cartão a cada troca (por baixo do conteúdo)
      [...tS, tFim].forEach((a, j) => { p += varredura('pf-vr' + j, CD.x + 2, CD.y + 2, CD.w - 4, CD.div - CD.y - 3, inv(a - 0.02, a + 0.5, t), 20, C.blue40); });
      // filete de cor na lateral (acende no sinal da vez)
      p += `<rect x="${CD.x + 1}" y="${CD.y + 26}" width="6" height="${CD.div - CD.y - 52}" rx="3" fill="${P.cor}" opacity="${f(clamp(foco.reduce((a, b) => a + b, 0) + uFim))}"/>`;

      // rodapé das fontes (texto obrigatório): fica o tempo todo e ganha destaque no fecho
      {
        const kF = fin(t, tCard + 0.35, 0.45);
        if (uFim > 0.001) p += `<path d="M${CD.x + 1},${CD.div} H${CD.x + CD.w - 1} V${CD.y + CD.h - 22} a21,21 0 0 1 -21,21 H${CD.x + 22} a21,21 0 0 1 -21,-21Z" fill="${C.orange20}" opacity="${f(uFim)}"/>`;
        let fo = `<rect x="${CD.x + 26}" y="${CD.div}" width="${f((CD.w - 52) * ease.out(kF))}" height="2" fill="${mix(C.gray, C.orange40, uFim)}"/>`;
        const ix = CD.x + 50, iy = (CD.div + CD.y + CD.h) / 2;
        fo += pop(1 + 0.3 * bate(t, tFim, 0.4), ix, iy, icone('lupa', ix, iy, 30, { u: inv(tCard + 0.4, tCard + 0.95, t), sw: 3 }));
        fo += onda(ix, iy, t - tFim, { c: C.orange, r0: 14, r1: 9, sw: 4, d: 0.5 });
        fo += tRico('*Fontes:* pesquisa curta, conversa com gestores e dados de uso.', ix + 30, iy + 8.5, { s: 24, c: C.navy80, hi: C.navy, hw: 700 });
        const uU = ease.out(inv(tFim + 0.05, tFim + 0.45, t));
        if (uU > 0) fo += `<rect x="${ix + 30}" y="${f(iy + 15)}" width="${f(larg('Fontes:', 24, { w: 700 }) * uU)}" height="4" rx="2" fill="${C.orange}"/>`;
        p += opa(kF, fo);
      }

      // conteúdo que troca deslizando: abertura (Pessoa B), "cinco sinais", os 5 sinais e o perfil completo
      const estados = [{ a: tCard + 0.1, d: ABRE }, { a: tCinco - 0.12, d: INTRO }, ...SINAIS.map((d, i) => ({ a: tS[i], d, navy: true })), { a: tFim, d: FIM, navy: true }];
      estados.forEach((e, j) => {
        const b = j < estados.length - 1 ? estados[j + 1].a : 1e6;
        const kIn = back(t, e.a, 0.36), kOut = fout(t, b - 0.1, 0.14);
        const o = clamp(kIn * 1.5) * kOut;
        if (o <= 0.001) return;
        const c = disco(e.d.ic, IC.cx, IC.cy, IC.r, { k: 0.6 + 0.4 * elast(t, e.a + 0.03, 0.7), u: inv(e.a + 0.05, e.a + 0.55, t), fundo: e.navy ? C.navy : C.blue20, c: e.navy ? C.white : C.navy, sw: 3.2 })
          + txt(e.d.rot, TX, IC.cy - 8, { w: 700, s: 28 })
          + txt(e.d.pergunta, TX, IC.cy + 27, { s: 24, c: C.navy80 });
        p += `<g opacity="${f(o)}" transform="translate(${f((1 - kIn) * 50 - (1 - kOut) * 18)} 0)">${c}</g>`;
      });

      // nível do sinal na Pessoa B: percentual contando + barra baixo ↔ alto
      {
        let val = 0;
        // a cada sinal a barra esvazia rápido (junto da troca do cartão) e enche de novo até o valor, com o vértice do radar
        for (let i = 0; i < 5; i++) {
          val *= 1 - ease.inOut(inv(tS[i] - 0.14, tS[i] + 0.04, t));
          val += (V[i] - val) * ease.out(inv(tS[i] + 0.06, tS[i] + 0.72, t));
        }
        const kB = fin(t, tCard + 0.25, 0.45) * (1 - fin(t, tFim - 0.1, 0.2)), aceso = fin(t, tS[0] + 0.04, 0.3);
        if (kB > 0.001) {
          const kN = back(t, tS[0] + 0.02, 0.4);
          let b = kN <= 0.001 ? '' : `<g opacity="${f(clamp(kN * 1.5))}" transform="translate(${f((1 - kN) * 36)} 0)">`
            + rotulo('Nível na Pessoa B', XR, IC.cy - 21, { c: C.navy80, a: 'end' })
            + txt(Math.round(val * 100) + '%', XR, IC.cy + 35, { f: 'L', w: 400, s: 56, a: 'end' }) + `</g>`;
          const xL = CD.x + 30, wB = larg('baixo', 22), wA = larg('alto', 22);
          const x0 = xL + wB + 16, x1 = XR - wA - 16, bw = x1 - x0, my = BR.y + BR.h / 2;
          b += txt('baixo', xL, my + 7.5, { s: 22, c: C.navy80 }) + txt('alto', XR, my + 7.5, { s: 22, c: C.navy80, a: 'end' });
          b += `<rect x="${f(x0)}" y="${BR.y}" width="${f(bw * ease.out(fin(t, tCard + 0.3, 0.5)))}" height="${BR.h}" rx="${BR.h / 2}" fill="${C.gray40}" stroke="${C.gray}" stroke-width="1.5"/>`;
          const xv = x0 + bw * clamp(val, 0.02, 1);
          if (aceso > 0.001) b += `<rect x="${f(x0)}" y="${BR.y}" width="${f(Math.max(BR.h, xv - x0))}" height="${BR.h}" rx="${BR.h / 2}" fill="${P.cor}" opacity="${f(aceso)}"/>`;
          [0.25, 0.5, 0.75].forEach(q => { b += `<rect x="${f(x0 + bw * q - 1)}" y="${BR.y + 3}" width="2" height="${BR.h - 6}" rx="1" fill="${C.white}" opacity=".85"/>`; });
          if (aceso > 0.001) b += pop(aceso * (1 + 0.06 * Math.sin(t * 4.2)), xv, my, `<circle cx="${f(xv)}" cy="${my}" r="13" fill="${C.white}" stroke="${C.orange}" stroke-width="5"/>`);
          p += opa(kB, b);
        }
      }
      // no fecho: a barra se divide nos cinco sinais do perfil
      if (uFim > 0.001) {
        const xL = CD.x + 30, cw = (XR - xL) / 5, my = BR.y + BR.h / 2;
        let b = '';
        for (let i = 0; i < 5; i++) {
          const k = back(t, tFim + 0.05 + i * 0.05, 0.34), x = xL + i * cw;
          if (k <= 0.001) continue;
          const x0 = x + 40, bw = cw - 62;
          b += opa(clamp(k * 1.5), `<g transform="translate(0 ${f((1 - k) * 14)})">`
            + icone(SINAIS[i].ic, x + 15, my, 28, { sw: 2.6 })
            + `<rect x="${f(x0)}" y="${my - 7}" width="${f(bw)}" height="14" rx="7" fill="${C.gray40}" stroke="${C.gray}" stroke-width="1.5"/>`
            + `<rect x="${f(x0)}" y="${my - 7}" width="${f(Math.max(14, bw * V[i] * ease.out(inv(tFim + 0.1 + i * 0.05, tFim + 0.5 + i * 0.05, t))))}" height="14" rx="7" fill="${P.cor}"/></g>`);
        }
        p += opa(uFim, b + rotulo('Perfil da Pessoa B', XR, IC.cy + 7, { c: C.navy80, a: 'end' }));
      }
      let troca = bate(t, tFim - 0.08, 0.34);
      tS.forEach(a => { troca += bate(t, a - 0.06, 0.34); });
      s += opa(clamp(kCd * 1.4), `<g transform="translate(0 ${f((1 - kCd) * 44 + 4 * troca)}) rotate(${f((1 - kCd) * -1.6)} ${CD.x + CD.w / 2} ${CD.y + CD.h / 2})">${p}</g>`);
    }
  }
  return s;
}
