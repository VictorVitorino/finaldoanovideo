// Cena "porque" (9,67–16,42 s): "Não é má vontade. É perfil: como cada pessoa percebe, avalia e decide."
// Motion graphics de interface, sem personagens. A Pessoa B é um avatar (disco com ícone) visto de perto, com a
// etiqueta "má vontade" presa a ele. Em 'ma_vontade' a etiqueta é riscada, se solta, gira e sai do quadro com
// desfoque de movimento. Em 'perfil' um anel de leitura envolve o avatar; a câmera abre e dele parte um fluxo de
// três nós, um por palavra: Percebe → Avalia → Decide, ligados ao avatar por linhas com pulso de luz.
// No pé do palco, a salvaguarda: "Perfil cognitivo: como cada pessoa entende e vive esta mudança. Não é teste psicológico."
import {
  W, MG, C, txt, tRico, larg, bloco, fin, back, sobe, pop, opa, revela, tracar, onda, particulas, varredura, disco, titulo,
  clamp, lerp, inv, ease, kf, n2,
} from '../base.js';
import { HEROIS, avatar } from '../modelo.js';
import { fundoVivo, camera, velocidade, sombra } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const LEGENDA = true;

// mistura de duas cores #RRGGBB (u: 0 = a, 1 = b)
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, u) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join('');
};
const bump = (t, a, d) => Math.sin(inv(a, a + d, t) * Math.PI);   // sobe e desce dentro de [a, a + d]
const rad = g => g * Math.PI / 180;

// ---------- geometria (coordenadas do "mundo", antes da câmera) ----------
const TS = 62, TY = 196, TLH = TS * 1.12;                 // título
const AX = W / 2, AY = 466, AR = 84;                      // avatar da Pessoa B
const RL = 102, RT = 118, RH = 150;                       // anel de leitura, anel de tiques, halo
const TAG = { x: AX + 8, y: AY + AR + 12, w: 276, h: 88, rot: -7 };   // etiqueta "má vontade"
const CHIP = { y: 650, h: 42, s: 18 };                    // pílula "Pessoa B · voltou para a planilha" (só no plano fechado)
const YA = 697, YB = 655;                                 // plano fechado: altura do avatar na tela antes e depois de 'perfil'
const GAP = 40, CW = (W - 2 * MG - 2 * GAP) / 3, CY0 = 690, CH = 334;   // cartões do fluxo
const cxNo = i => MG + CW / 2 + i * (CW + GAP);
const DY = 122;                                           // altura do disco do ícone dentro do cartão
const NOS = [
  { ic: 'olho', rot: 'Percebe', apoio: 'o que nota na mudança', marca: 'percebe', giro: -5 },
  { ic: 'balanca', rot: 'Avalia', apoio: 'o que pesa: ganho e risco', marca: 'avalia', giro: 3 },
  { ic: 'decide', rot: 'Decide', apoio: 'o que faz com isso', marca: 'decide', giro: 5 },
];
const CT = { x: MG, y: 1080, w: W - 2 * MG, h: 88 };      // cartão da salvaguarda
const SALVA = ['*Perfil cognitivo:* como cada pessoa entende e vive esta mudança.', 'Não é teste psicológico.'];

// ligações do avatar a cada nó: curva de Bézier amostrada por comprimento (para o pulso de luz andar em velocidade constante)
const LIG = [128, 90, 52].map((ang, i) => {
  const c = Math.cos(rad(ang)), s = Math.sin(rad(ang)), r0 = RT + 9;
  const p0 = [AX + c * r0, AY + s * r0], p3 = [cxNo(i), CY0 - 10];
  const k = Math.min(74, Math.hypot(p3[0] - p0[0], p3[1] - p0[1]) * 0.33);
  const p1 = [p0[0] + c * k, p0[1] + s * k], p2 = [p3[0], p3[1] - k];
  const B = u => [0, 1].map(j => (1 - u) ** 3 * p0[j] + 3 * (1 - u) ** 2 * u * p1[j] + 3 * (1 - u) * u * u * p2[j] + u ** 3 * p3[j]);
  const am = Array.from({ length: 49 }, (_, n) => B(n / 48)), acc = [0];
  for (let n = 1; n < am.length; n++) acc.push(acc[n - 1] + Math.hypot(am[n][0] - am[n - 1][0], am[n][1] - am[n - 1][1]));
  const L = acc[acc.length - 1];
  const em = u => {
    const d = clamp(u) * L;
    let n = 1;
    while (n < acc.length - 1 && acc[n] < d) n++;
    const q = (d - acc[n - 1]) / Math.max(1e-6, acc[n] - acc[n - 1]);
    return [lerp(am[n - 1][0], am[n][0], q), lerp(am[n - 1][1], am[n][1], q)];
  };
  return { p0, p3, em, d: `M${f(p0[0])},${f(p0[1])} C${f(p1[0])},${f(p1[1])} ${f(p2[0])},${f(p2[1])} ${f(p3[0])},${f(p3[1])}` };
});

// ---------- peças ----------
// arco de círculo entre dois ângulos (graus, sentido horário a partir do eixo x)
const arco = (r, a0, a1) => `M${f(AX + Math.cos(rad(a0)) * r)},${f(AY + Math.sin(rad(a0)) * r)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(AX + Math.cos(rad(a1)) * r)},${f(AY + Math.sin(rad(a1)) * r)}`;

// etiqueta "má vontade" (desenhada em torno da origem). uR = quanto do risco já foi feito; pino = o alfinete ainda está lá
function etiqueta(uR, pino) {
  const w = TAG.w, h = TAG.h, x = -w / 2, y = -h / 2, faixa = 28;
  let s = `<rect x="${x}" y="${y + 7}" width="${w}" height="${h}" rx="12" fill="${C.navy}" opacity=".16"/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.white}" stroke="${C.navy}" stroke-width="3"/>`
    + `<path d="M${x + 1.5},${y + faixa} V${y + 12} a10.5,10.5 0 0 1 10.5,-10.5 H${-x - 12} a10.5,10.5 0 0 1 10.5,10.5 V${y + faixa}Z" fill="${C.navy}"/>`
    + txt('RÓTULO', 0, y + 20.5, { w: 700, s: 14, ls: 4, c: C.white, a: 'middle' })
    + txt('má vontade', 0, y + faixa + 43, { w: 700, s: 42, c: C.navy, a: 'middle' });
  // risco: um traço firme por cima do texto
  s += tracar(`M${-118},${y + faixa + 37} L${118},${y + faixa + 23}`, uR, { c: C.orange, sw: 8 });
  if (pino) s += `<circle cx="0" cy="${y + 1}" r="9" fill="${C.orange}" stroke="${C.white}" stroke-width="3"/><circle cx="-2.5" cy="${y - 1.5}" r="2.6" fill="${C.white}" opacity=".85"/>`;
  return s;
}

// pulso de luz que corre por uma ligação (u = 0..1 posição da cabeça)
function pulso(lg, u, cor = C.orange) {
  if (u <= 0 || u >= 1) return '';
  const cauda = 0.26, h = u * (1 + cauda), [hx, hy] = lg.em(Math.min(1, h));
  const dash = `pathLength="1" stroke-dasharray="${cauda} 3" stroke-dashoffset="${f(cauda - h)}" fill="none" stroke-linecap="round"`;
  let s = `<path d="${lg.d}" ${dash} stroke="${cor}" stroke-width="13" opacity=".28"/><path d="${lg.d}" ${dash} stroke="${cor}" stroke-width="5.5"/>`;
  if (h <= 1) s += `<circle cx="${f(hx)}" cy="${f(hy)}" r="30" fill="url(#g-laranja)"/><circle cx="${f(hx)}" cy="${f(hy)}" r="7.5" fill="${C.white}" stroke="${cor}" stroke-width="4"/>`;
  return s;
}

export function desenhar(t, ctx) {
  const { t0, t1, m } = ctx;
  const tAv = t0 + 0.08;                                  // avatar
  const tTag = t0 + 0.22;                                 // a etiqueta é pregada (fica ~0,4 s legível antes do risco)
  const tRis = m('ma_vontade') - 0.02;                    // o risco começa junto com "má"
  const tSolta = m('ma_vontade') + 0.4;                   // a etiqueta se solta em "vontade"
  const tPerfil = m('perfil') - 0.1;
  const tAbre = m('percebe') - 0.95, DA = 0.66;           // a câmera abre em "como cada pessoa"
  const tM = NOS.map(n => m(n.marca) - 0.08);             // cada nó acende um pouco antes da palavra
  const DP = 0.36;                                        // duração do pulso que viaja do avatar ao nó
  const tTodos = m('decide') + 0.26, LOOP = 0.75;         // os três acesos; período do laço final

  // ---------- câmera: plano fechado no avatar, aproxima em 'perfil' e abre para o fluxo ----------
  const z = kf(t, [[t0, 1.93], [tPerfil, 1.99, ease.linear], [tPerfil + 0.6, 2.05], [tAbre, 2.07, ease.linear], [tAbre + DA, 1], [t1, 1.02, ease.linear]]);
  const yAv = kf(t, [[t0, YA], [tPerfil + 0.05, YA], [tPerfil + 0.65, YB]]);   // em 'perfil' a câmera sobe para dar lugar à salvaguarda
  const uA = ease.inOut(inv(tAbre, tAbre + DA, t));       // 0 = plano fechado, 1 = quadro inteiro

  // ---------- estado dos nós ----------
  const uTodos = fin(t, tTodos, 0.3);
  const est = NOS.map((_, i) => {
    const ti = tM[i], prox = i < 2 ? tM[i + 1] : 1e6, on = fin(t, ti, 0.25) * (1 - fin(t, prox, 0.25));
    return { foco: on * (1 - uTodos), aceso: Math.max(on, uTodos), real: t >= ti };
  });
  // laço final: pulso em todas as ligações e depois o brilho corre Percebe → Avalia → Decide
  const lp = t > tTodos ? ((t - tTodos) / LOOP) % 1 : -1;
  const brilhoNo = i => (lp < 0 ? 0 : clamp(1 - Math.abs(lp - (0.36 + i * 0.19)) / 0.15));
  const brilhoSeta = j => (lp < 0 ? 0 : clamp(1 - Math.abs(lp - (0.455 + j * 0.19)) / 0.09));

  // =====================================================================================================
  let w = '';                                             // tudo o que está no "mundo" passa pela câmera

  // ---------- halo e arcos de instrumento em volta do avatar ----------
  {
    const kH = fin(t, t0 + 0.02, 0.45), rh = lerp(RH, 136, uA);
    w += opa(kH, `<circle cx="${AX}" cy="${AY}" r="${f(rh)}" fill="${C.white}" opacity=".78"/>`
      + `<circle cx="${AX}" cy="${AY}" r="${f(rh)}" fill="none" stroke="${C.blue40}" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 15" transform="rotate(${f(t * 9)} ${AX} ${AY})"/>`);
    // arcos de instrumento, espelhados dos dois lados: o fino acompanha o avatar desde o início; o tracejado e o
    // marcador laranja entram em 'perfil' (leitura em andamento)
    const kA0 = fin(t, t0 + 0.3, 0.5), kA = back(t, tPerfil + 0.08, 0.5), bal = Math.sin(t * 1.1) * 5;
    let lado = `<path d="${arco(176, -24 + bal, 24 + bal)}" fill="none" stroke="${C.navy40}" stroke-width="2.5" stroke-linecap="round" opacity="${f(kA0)}"/>`;
    if (kA > 0.001) {
      lado += opa(clamp(kA * 1.5), `<path d="${arco(196, -14 - bal, 14 - bal)}" fill="none" stroke="${C.blue}" stroke-width="${f(5 * kA)}" stroke-dasharray="2 9" stroke-dashoffset="${f(-t * 14)}"/>`
        + `<circle cx="${f(AX + Math.cos(rad(24 + bal)) * 176)}" cy="${f(AY + Math.sin(rad(24 + bal)) * 176)}" r="${f(5 * kA)}" fill="${C.orange}"/>`);
    }
    w += lado + `<g transform="translate(${2 * AX} 0) scale(-1 1)">${lado}</g>`;
  }

  // ---------- legendas do instrumento (só no quadro aberto): quem é e o andamento da leitura ----------
  {
    const kR = fin(t, tAbre + 0.46, 0.4);
    if (kR > 0.001) {
      const xe = AX - 226, xd = AX + 226, feitos = tM.filter(ti => t >= ti).length;
      let e = txt('PESSOA B', xe, AY - 6, { w: 700, s: 22, ls: 1.8, a: 'end' }) + txt('voltou para a planilha', xe, AY + 26, { s: 24, c: C.navy80, a: 'end' });
      let d = txt('LEITURA DO PERFIL', xd, AY - 6, { w: 700, s: 22, ls: 1.8 });
      NOS.forEach((_, i) => {
        const x = xd + i * 54, k = ease.out(inv(tM[i], tM[i] + 0.35, t));
        d += `<rect x="${x}" y="${AY + 10}" width="46" height="10" rx="5" fill="${C.navy20}"/>`;
        if (k > 0) d += `<rect x="${x}" y="${AY + 10}" width="${f(46 * k)}" height="10" rx="5" fill="${C.orange}"/>`;
      });
      d += txt(feitos + '/3', xd + 172, AY + 25, { w: 700, s: 24, c: C.navy });
      w += opa(kR, `<g transform="translate(${f((1 - kR) * 26)} 0)">${e}</g><g transform="translate(${f((1 - kR) * -26)} 0)">${d}</g>`);
    }
  }

  // ---------- ligações avatar → nós ----------
  LIG.forEach((lg, i) => {
    const uL = ease.inOut(inv(tAbre + 0.1 + i * 0.06, tAbre + 0.5 + i * 0.06, t));
    if (uL <= 0) return;
    const e = est[i];
    w += tracar(lg.d, uL, { c: mix(C.blue40, C.blue, e.aceso), sw: 3.5 });
    if (uL >= 1) w += `<path d="${lg.d}" fill="none" stroke="${C.navy}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="3 15" stroke-dashoffset="${f(-t * 52)}" opacity="${f(0.25 + 0.55 * e.aceso)}"/>`;
    // portas (como num editor de nós)
    w += pop(back(t, tAbre + 0.1 + i * 0.06, 0.3), lg.p0[0], lg.p0[1], `<circle cx="${f(lg.p0[0])}" cy="${f(lg.p0[1])}" r="6.5" fill="${C.white}" stroke="${C.navy}" stroke-width="3"/>`);
    // pulso de luz: um quando o nó nasce, e em laço no final
    w += pulso(lg, inv(tM[i] - DP, tM[i] + 0.06, t));
    if (lp >= 0) w += pulso(lg, lp / 0.34);
  });

  // ---------- os três nós do fluxo ----------
  let bases = '', cont = '';
  NOS.forEach((n, i) => {
    const ti = tM[i], e = est[i], x0 = cxNo(i) - CW / 2, cx = cxNo(i), cym = CY0 + CH / 2;
    // lugar reservado: contorno tracejado andando e o número do passo
    const kG = back(t, tAbre + 0.52 + i * 0.07, 0.36) * (1 - fin(t, ti - 0.04, 0.16));
    if (kG > 0.001) {
      cont += opa(clamp(kG * 1.4), pop(0.9 + 0.1 * kG, cx, cym,
        `<rect x="${f(x0 + 2)}" y="${CY0 + 2}" width="${f(CW - 4)}" height="${CH - 4}" rx="22" fill="${C.white}" fill-opacity=".5" stroke="${C.navy40}" stroke-width="2.5" stroke-dasharray="10 11" stroke-dashoffset="${f(-t * 26)}" stroke-linecap="round"/>`
        + txt('0' + (i + 1), cx, cym + 6, { f: 'L', s: 64, c: C.navy40, a: 'middle' })
        + [0, 1, 2].map(j => `<circle cx="${f(cx + (j - 1) * 20)}" cy="${f(cym + 52 - 5 * Math.max(0, Math.sin(t * 7 - j * 0.9)))}" r="4.5" fill="${C.navy40}"/>`).join('')));
    }
    if (!e.real) return;
    // cartão: nasce com overshoot, leve rotação e subida; em foco cresce e ganha contorno navy
    const kB = back(t, ti, 0.5), uE = ease.out(inv(ti, ti + 0.45, t));
    const salto = -12 * bump(t, tTodos + 0.02 + i * 0.08, 0.36);
    const sc = lerp(0.62, 1, kB) * (0.965 + 0.085 * e.foco + 0.035 * uTodos);
    const tf = `translate(${f(cx)} ${f(cym + (1 - uE) * 46 + salto)}) rotate(${f((1 - uE) * n.giro)}) scale(${f(sc)}) translate(${f(-cx)} ${f(-cym)})`;
    const oB = clamp(kB * 2.2);
    bases += `<g transform="${tf}" opacity="${f(oB)}"><rect x="${f(x0)}" y="${CY0}" width="${f(CW)}" height="${CH}" rx="22" fill="${C.white}" stroke="${mix(C.blue40, C.navy, e.aceso)}" stroke-width="${f(lerp(2, 3 + 1.5 * e.foco, e.aceso))}"/></g>`;

    const cyD = CY0 + DY, uI = inv(ti + 0.05, ti + 0.6, t);
    let c = txt('0' + (i + 1), x0 + 24, CY0 + 44, { w: 700, s: 22, ls: 2, c: C.blue });
    // ponto de estado no canto: pulsa enquanto o nó está em foco
    c += `<circle cx="${f(x0 + CW - 30)}" cy="${CY0 + 36}" r="${f(6 + 1.5 * e.foco * Math.sin((t - ti) * 9))}" fill="${mix(C.navy20, C.orange, e.aceso)}"/>`;
    // disco do ícone: azul claro → navy quando aceso; o ícone se desenha
    // luz quente atrás do disco enquanto o nó está em foco (e de leve quando o brilho do laço passa)
    const luz = Math.max(e.foco * (0.75 + 0.2 * Math.sin((t - ti) * 6)), 0.6 * brilhoNo(i));
    if (luz > 0.01) c += `<circle cx="${f(cx)}" cy="${cyD}" r="112" fill="url(#g-laranja)" opacity="${f(luz)}"/>`;
    let d = disco(n.ic, cx, cyD, 54, { fundo: C.blue20, c: C.navy, sw: 3.6, u: uI });
    if (e.aceso > 0.001) d += opa(e.aceso, disco(n.ic, cx, cyD, 54, { fundo: C.navy, c: C.white, sw: 3.6, u: uI }));
    if (e.foco > 0.01) d += `<circle cx="${f(cx)}" cy="${cyD}" r="66" fill="none" stroke="${C.orange}" stroke-width="4" stroke-linecap="round" stroke-dasharray="26 15.5" opacity="${f(e.foco)}" transform="rotate(${f(t * 70)} ${f(cx)} ${cyD})"/>`;
    c += pop(back(t, ti + 0.03, 0.42), cx, cyD, d);
    c += sobe(fin(t, ti + 0.1, 0.3), txt(n.rot, cx, CY0 + 240, { w: 700, s: 46, a: 'middle' }), 16);
    const wf = 56 * ease.out(clamp(e.aceso)) * fin(t, ti + 0.2, 0.3);
    if (wf > 0.5) c += `<rect x="${f(cx - wf / 2)}" y="${CY0 + 256}" width="${f(wf)}" height="5" rx="2.5" fill="${C.orange}"/>`;
    const ap = bloco(n.apoio, cx, CY0 + 298, { s: 24, maxW: CW - 36, lh: 28, c: C.navy80, a: 'middle' });
    c += sobe(fin(t, ti + 0.18, 0.3), ap.svg, 12);
    c = opa(lerp(0.5, 1, e.aceso), c);
    // brilho que passa pelo cartão no laço final
    const gl = brilhoNo(i);
    if (gl > 0.01) c += `<rect x="${f(x0)}" y="${CY0}" width="${f(CW)}" height="${CH}" rx="22" fill="none" stroke="${C.orange}" stroke-width="13" opacity="${f(gl * 0.25)}"/><rect x="${f(x0)}" y="${CY0}" width="${f(CW)}" height="${CH}" rx="22" fill="none" stroke="${C.orange}" stroke-width="6" opacity="${f(ease.out(gl))}"/>`;
    // porta de entrada no topo do cartão
    c += `<circle cx="${f(cx)}" cy="${CY0}" r="7.5" fill="${mix(C.white, C.orange, e.aceso)}" stroke="${C.navy}" stroke-width="3"/>`;
    cont += `<g transform="${tf}" opacity="${f(oB)}">${c}</g>`;
    // chegada do pulso: anel no topo do cartão
    cont += onda(cx, CY0, t - ti, { c: C.orange, r0: 8, r1: 70, sw: 6, d: 0.5 });
  });
  if (bases) w += sombra(bases, true);
  w += cont;

  // ---------- seta de processo: Percebe → Avalia → Decide ----------
  for (let j = 0; j < 2; j++) {
    const ts = tM[j + 1] - 0.3, k = back(t, ts, 0.36);
    if (k <= 0.001) continue;
    const sx = cxNo(j) + CW / 2 + GAP / 2, sy = CY0 + DY, g = brilhoSeta(j), ac = fin(t, tM[j + 1], 0.25);
    const anda = 2.5 * Math.sin(t * 6 - j);               // a seta "empurra" de leve para a frente
    w += pop(k * (1 + 0.16 * g), sx, sy, (g > 0.01 ? `<circle cx="${f(sx)}" cy="${sy}" r="27" fill="none" stroke="${C.orange}" stroke-width="5" opacity="${f(g)}"/>` : '')
      + `<circle cx="${f(sx)}" cy="${sy}" r="21" fill="${mix(C.white, C.navy, ac)}" stroke="${C.navy}" stroke-width="3"/>`
      + tracar(`M${f(sx - 5.5 + anda)},${sy - 9} L${f(sx + 4.5 + anda)},${sy} L${f(sx - 5.5 + anda)},${sy + 9}`, inv(ts + 0.1, ts + 0.36, t), { c: mix(C.navy, C.white, ac), sw: 4 }));
    w += onda(sx, sy, t - ts - 0.1, { c: C.navy40, r0: 20, r1: 26, sw: 4, d: 0.4 });
  }

  // ---------- avatar da Pessoa B ----------
  {
    const kAv = back(t, tAv, 0.5);
    let sAv = kAv * (1 - 0.05 * bump(t, tTag + 0.1, 0.22) + 0.08 * bump(t, tSolta + 0.02, 0.4) + 0.06 * bump(t, tPerfil, 0.4) + 0.05 * bump(t, tTodos, 0.36));
    tM.forEach(ti => { sAv += 0.045 * bump(t, ti - DP - 0.04, 0.3); });
    // alívio quando a etiqueta se solta
    w += onda(AX, AY, t - tSolta - 0.04, { c: C.blue, r0: AR + 6, r1: 60, sw: 6, d: 0.55 });
    w += onda(AX, AY, t - tSolta - 0.16, { c: C.blue40, r0: AR + 6, r1: 96, sw: 5, d: 0.65 });
    w += sombra(avatar(AX, AY, { r: AR, cor: HEROIS.B.cor, c: C.navy, k: sAv, u: inv(tAv + 0.05, tAv + 0.38, t), sw: 4.2, anel: C.white, asw: 6 }), true);

    // anel de leitura (em 'perfil'): trilho, volta completa em laranja, depois arco que gira e tiques
    const kL = back(t, tPerfil, 0.45);
    if (kL > 0.001) {
      const circ = r => `M${AX},${AY - r} A${r},${r} 0 1 1 ${f(AX - 0.01)},${AY - r}`;
      const uV = ease.inOut(inv(tPerfil, tPerfil + 0.7, t)), fica = fin(t, tPerfil + 0.62, 0.3);
      let a = `<circle cx="${AX}" cy="${AY}" r="${RL}" fill="none" stroke="${mix(C.blue40, C.navy, fica)}" stroke-width="${f(lerp(2, 3, fica))}"/>`;
      if (fica < 1) a += opa(1 - fica, tracar(circ(RL), uV, { c: C.orange, sw: 6 }));
      if (fica > 0) a += opa(fica, `<path d="${circ(RL)}" fill="none" stroke="${C.orange}" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray=".2 1" transform="rotate(${f(t * 170)} ${AX} ${AY})"/>`);
      const per = 2 * Math.PI * RT / 60;
      a += `<circle cx="${AX}" cy="${AY}" r="${RT}" fill="none" stroke="${C.navy40}" stroke-width="8" stroke-dasharray="2 ${f(per - 2)}" transform="rotate(${f(-t * 10)} ${AX} ${AY})"/>`;
      w += opa(clamp(kL * 1.6), pop(0.84 + 0.16 * kL, AX, AY, a));
      // faixa de leitura que varre o avatar (uma vez em 'perfil' e de novo a cada pulso)
      let faixas = '';
      for (const [ta, d] of [[tPerfil + 0.05, 0.75], ...tM.map(ti => [ti - DP - 0.1, 0.42]), [tTodos - 0.05, 0.5]]) {
        const u = inv(ta, ta + d, t);
        if (u > 0 && u < 1) faixas += `<rect x="${AX - AR}" y="${f(AY - AR - 34 + (2 * AR + 34) * ease.inOut(u))}" width="${2 * AR}" height="34" fill="${C.white}" opacity="${f(0.5 * Math.sin(u * Math.PI))}"/>`;
      }
      if (faixas) w += `<clipPath id="pq-av"><circle cx="${AX}" cy="${AY}" r="${AR - 1}"/></clipPath><g clip-path="url(#pq-av)">${faixas}</g>`;
      w += onda(AX, AY, t - tPerfil, { c: C.orange, r0: RL, r1: 56, sw: 6, d: 0.55 });
    }
    // cada pulso que parte faz o anel "pingar"
    tM.forEach(ti => { w += onda(AX, AY, t - (ti - DP), { c: C.orange, r0: RT, r1: 34, sw: 4, d: 0.45 }); });
    if (t > tTodos) w += onda(AX, AY, ((t - tTodos) % LOOP), { c: C.orange, r0: RT, r1: 40, sw: 4, d: 0.5 });
  }

  // ---------- pílula "Pessoa B · voltou para a planilha" (plano fechado) ----------
  {
    const kC = back(t, t0 + 0.36, 0.45) * (1 - fin(t, tPerfil + 0.26, 0.24));   // sai quando a salvaguarda entra
    if (kC > 0.001) {
      const a = 'Pessoa B', b = ' ·  voltou para a planilha';
      const wa = larg(a, CHIP.s, { w: 700 }), wt = wa + larg(b, CHIP.s) + 6, pw = wt + 74, x0 = AX - pw / 2, ym = CHIP.y + CHIP.h / 2;
      w += opa(clamp(kC * 1.6), `<g transform="translate(0 ${f((1 - kC) * 18)})">`
        + `<rect x="${f(x0)}" y="${CHIP.y}" width="${f(pw)}" height="${CHIP.h}" rx="${CHIP.h / 2}" fill="${C.white}" stroke="${C.blue40}" stroke-width="2"/>`
        + disco('planilha', x0 + 23, ym, 14, { fundo: C.orange20, c: C.navy, sw: 2, u: inv(t0 + 0.42, t0 + 0.72, t) })
        + txt(a, x0 + 46, ym + 6.3, { w: 700, s: CHIP.s })
        + txt(b.trim(), x0 + 46 + wa + 6, ym + 6.3, { s: CHIP.s, c: C.navy80 }) + `</g>`);
    }
  }

  // ---------- etiqueta "má vontade": pregada, riscada, solta, gira e sai do quadro com desfoque ----------
  {
    const a = t - tSolta;
    if (t >= tTag && a < 0.6) {
      const uR = ease.inOut(inv(tRis, tRis + 0.28, t));
      let dx = 0, dy = 0, rot = TAG.rot, sc = 1, o = 1, sd = 0;
      if (a <= 0) {
        const u = inv(tTag, tTag + 0.17, t), dt = t - tTag - 0.17;
        const treme = dt > 0 ? 6 * Math.sin(dt * 24) * Math.exp(-dt * 6.5) : 0;                // balança depois de pregada
        const ant = ease.inOut(inv(tSolta - 0.16, tSolta, t));                                 // antecipação antes de soltar
        sc = 1 + 0.6 * (1 - ease.out(u));
        o = clamp(u * 1.6);
        rot += treme - 11 * (1 - ease.out(u)) + Math.sin(t * 2.3) * 1.1 - 6 * ant;
        dx = -16 * ant + 3.5 * bump(t, tRis, 0.3) * Math.sin(t * 64);
        dy = 5 * ant;
      } else {
        dx = -16 + 180 * a + 2500 * a * a;
        dy = 5 - 150 * a + 760 * a * a;
        rot += -6 + 400 * a;
        sd = clamp((5000 * a - 60) * 0.0075, 0, 22);                                           // desfoque proporcional à velocidade
      }
      w += onda(AX, AY, t - tTag - 0.14, { c: C.blue40, r0: AR + 8, r1: 46, sw: 5, d: 0.4 });   // batida ao pregar
      let g = `<g transform="translate(${f(TAG.x + dx)} ${f(TAG.y + dy)}) rotate(${f(rot)}) scale(${f(sc)})">${etiqueta(uR, a <= 0.02)}</g>`;
      if (sd > 0.5) g = `<filter id="pq-mb" x="-90%" y="-60%" width="280%" height="220%"><feGaussianBlur stdDeviation="${f(sd)} ${f(1 + sd * 0.08)}"/></filter><g filter="url(#pq-mb)">${g}</g>`;
      w += opa(o, g);
      // o alfinete que salta e as linhas de velocidade da saída
      w += particulas(31, TAG.x, TAG.y - TAG.h / 2, a, { n: 5, v: 130, r: 4.5, d: 0.5, cores: [C.orange, C.navy40, C.blue] });
      w += velocidade(AX + AR + 150, TAG.y - 70, 230, 140, inv(tSolta + 0.06, tSolta + 0.5, t), { seed: 4, n: 7, cor: C.blue40 });
    }
  }

  // fundo em paralaxe: amplia menos que o primeiro plano (profundidade). Semente escolhida para as formas ficarem nas
  // bordas do quadro, sem espiar por trás do avatar, dos cartões e da salvaguarda
  let s = camera(fundoVivo(t, { seed: 4739, n: 6 }), { z: 1 + (z - 1) * 0.42, cx: AX, cy: lerp(560, 675, uA), dy: lerp((yAv - 675) * 0.4, 0, uA) });
  s += camera(w, { z, cx: AX, cy: lerp(AY, 675, uA), dy: lerp(yAv - 675, 0, uA) });

  // =====================================================================================================
  // ---------- título (fora da câmera) ----------
  s += titulo(['Não é má vontade.'], MG, TY, t, t0 + 0.15);
  s += titulo(['*É perfil.*'], MG, TY + TLH, t, tPerfil);

  // ---------- salvaguarda: cartão branco no pé do palco ----------
  {
    const tC = m('perfil') + 0.42, kC = back(t, tC, 0.5);
    if (kC > 0.001) {
      const xi = CT.x + 60, yi = CT.y + CT.h / 2, xt = CT.x + 108;
      let b = sombra(`<rect x="${CT.x}" y="${CT.y}" width="${CT.w}" height="${CT.h}" rx="16" fill="${C.white}" stroke="${C.blue40}" stroke-width="2"/>`, true);
      b += varredura('pq-brilho', CT.x, CT.y, CT.w, CT.h, inv(tTodos + 0.05, tTodos + 0.6, t), 16, C.blue40);   // por baixo do texto
      b += `<rect x="${CT.x + 12}" y="${CT.y + 14}" width="6" height="${CT.h - 28}" rx="3" fill="${C.orange}"/>`;
      b += disco('escudo', xi, yi, 26, { fundo: C.blue20, k: back(t, tC + 0.12, 0.4), u: inv(tC + 0.15, tC + 0.8, t), sw: 3 });
      b += revela('pq-l1', xt - 4, CT.y + 8, CT.w - 120, 36, ease.out(inv(tC + 0.18, tC + 0.8, t)),
        tRico(SALVA[0], xt, CT.y + 37, { s: 24, c: C.navy, hi: C.navy, hw: 700 }));
      b += revela('pq-l2', xt - 4, CT.y + 44, CT.w - 120, 36, ease.out(inv(tC + 0.45, tC + 0.9, t)),
        txt(SALVA[1], xt, CT.y + 69, { s: 24, c: C.navy80 }));
      s += opa(clamp(kC * 1.8), `<g transform="translate(0 ${f((1 - kC) * 70)}) rotate(${f((1 - kC) * -2.5)} ${W / 2} ${yi})">${b}</g>`);
    }
  }
  return s;
}
