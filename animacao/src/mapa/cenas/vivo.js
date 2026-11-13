// Cena "vivo" (57,99–72,52 s): "Mas o mapa precisa estar vivo. Posição é momento, não rótulo: pessoas avançam, travam,
// recuam. A cada onda, medimos de novo e ajustamos o plano, antes e depois do go-live."
// Um DASHBOARD VIVO em tela navy: a janela "Mapa de Adoção · ao vivo" desliza para o palco e monta em cascata os
// indicadores, o mapa de calor (áreas x régua), a rosca e a linha do índice por onda. Em 'vivo' o indicador AO VIVO
// acende, um pulso de luz corre pela borda da janela e as células respiram.
// Fase 1 (onda 1): o aviso "Posição é momento, não rótulo." desliza sobre a base da janela ("rótulo" é riscado) e três
// etiquetas estouram sobre células do mapa de calor, cada uma na sua palavra: avança, trava, recua (a câmera aproxima
// e os indicadores Avançaram / Travaram / Recuaram, que ainda aguardam a onda 2, acendem junto).
// Fase 2: o cursor clica em "Onda 2", uma varredura de nova leitura cruza o painel e tudo muda (células, rosca,
// índice 20% -> 32%, contadores, linha); em 'plano' entra o alerta "Plano de mudança ajustado · v2". Em 'antes' o cursor
// clica em "Onda 3": 32% -> 56%, a linha chega ao marco GO-LIVE na palavra, o foguete decola com rastro e um punhado
// de confete, o plano vira v3, "antes" e "depois" acendem dos dois lados do marco e o aviso "Pessoa B adotou" fecha a cena.
// Os contadores comparam cada pessoa com a posição dela na onda 1 (modelo ilustrativo de modelo.js).
// Pessoas só aparecem como números, discos e avatar com ícone. Sem logos, sem personagens.
import { W, H, MG, C, txt, larg, fin, fout, back, pop, opa, sobe, tracar, onda, tremor, selo, icone, titulo, clamp, lerp, inv, ease, kf, n2, rng } from '../base.js';
import { PESSOAS, HEROIS, NIVEIS, movimento, avatar } from '../modelo.js';
import { fundoNoite, camera, brilho } from '../ludico.js';
import { janela, cartao, geoCalor, calor, rosca, tendencia, kpi, alerta, cursor, INDICES, indiceEm, naCelula } from '../painelUI.js';

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
const WX = 40, WY = 330, WW = 1000, WH = 840;              // janela do dashboard (ocupa o palco inteiro)
const JX = WX + 24, JY = WY + 78, JW = WW - 48;            // área útil (a mesma que janela() devolve)
const TITULO_J = 'Mapa de Adoção · ao vivo';
const ABAS = ['Onda 1', 'Onda 2', 'Onda 3'];
// posição das abas (mesma conta de janela())
const TAB = (() => {
  let ax = WX + WW - 22;
  const out = [];
  for (let i = ABAS.length - 1; i >= 0; i--) {
    const wl = larg(ABAS[i], 20, { w: 700 }) + 28;
    ax -= wl;
    out[i] = { x: ax, w: wl, cx: ax + wl / 2, cy: WY + 29 };
    ax -= 10;
  }
  return out;
})();
const KY = JY, KH = 112, KW = [298, 204, 204, 204], KX = [JX, JX + 312, JX + 530, JX + 748];   // linha de indicadores
const GC = geoCalor(JX, 534, JW, 266, { rotW: 150, cab: 44 });                                // mapa de calor
const RC = { x: JX, y: 814, w: 300, h: 252 };                                                   // cartão da rosca
const TC = { x: JX + 314, y: 814, w: JW - 314, h: 252 };                                        // cartão da tendência
const TD = { x: TC.x + 10, y: TC.y + 40, w: TC.w - 20, h: TC.h - 48 };                          // área do gráfico
const tpx = i => TD.x + 36 + (TD.w - 72) * i / 2, tpy = v => TD.y + TD.h - 44 - (TD.h - 84) * v / 70;   // mesma conta de tendencia()
const GX = (tpx(1) + tpx(2)) / 2;                                                               // x do marco GO-LIVE
const ST = { x: JX, y: 1080, w: JW, h: 66 };                                                    // faixa de status / alerta

// contadores de movimento desde a onda 1: [avançaram, travaram, recuaram] na onda 2 e na onda 3
const MOV = ['avanca', 'trava', 'recua'].map(tipo => [1, 2].map(ate => PESSOAS.filter(p => movimento(p, 0, ate) === tipo).length));
const KPIS = [
  { rot: 'Avançaram', ic: 'setaDir', cor: C.blue80, marca: 'avancam' },
  { rot: 'Travaram', ic: 'pausa', cor: C.navy40, marca: 'travam' },
  { rot: 'Recuaram', ic: 'setaEsq', cor: C.orange, marca: 'recuam' },
];
// as três células-exemplo do mapa de calor (posições da onda 1): [área, marca]
const EX = [
  { rot: 'avança', ic: 'setaDir', dir: 1, cel: [1, 1], cor: C.blue, tx: C.white, anel: C.blue80 },      // Operações × Observa
  { rot: 'trava', ic: 'pausa', dir: 0, cel: [3, 0], cor: C.gray, tx: C.navy, anel: C.gray },             // Suprimentos × Resiste
  { rot: 'recua', ic: 'setaEsq', dir: -1, cel: [2, 3], cor: C.orange, tx: C.navy, anel: C.orange },      // Comercial × Adota
];
const CAM_Y = 740;                                         // ponto fixo do zoom da câmera
const CEL_B = [0, 3];                                       // onde a Pessoa B chega na onda 3: Financeiro × Adota

// pessoas em cada célula do mapa de calor, por onda: CEL[área][marca][onda]
const CEL = [0, 1, 2, 3].map(a => [0, 1, 2, 3, 4].map(n => [0, 1, 2].map(od => naCelula(a, n, od))));

// ---------- componentes da cena ----------
// números do mapa de calor. A cena desenha os números (calor() fica só com as células) para que uma célula que
// esvazia apague o número em vez de mostrar "0", e para que o número novo entre com um pequeno salto.
function numerosCalor(ond, u) {
  const o = clamp(ond, 0, 2), i = Math.min(1, Math.floor(o)), k = ease.inOut(o - i);
  let s = '';
  for (let a = 0; a < 4; a++) for (let n = 0; n < 5; n++) {
    const kc = ease.back(clamp(u * 2.4 - 0.5 - a * 0.12 - n * 0.09));
    if (kc <= 0.001) continue;
    const q0 = CEL[a][n][i], q1 = CEL[a][n][i + 1], q = lerp(q0, q1, k), v = Math.round(q);
    if (v < 1) continue;
    const [cx, cy] = GC.centro(a, n), clara = NIVEIS[n].tx === C.navy && clamp(q / 3) > 0.6;
    // célula que enche ou esvazia: o número aparece / some com fade; valor que muda: salto curto no meio da troca
    const op = Math.min(q0, q1) < 1 && q < 1 ? clamp((q - 0.5) / 0.35) : 1;
    const salto = q0 !== q1 ? -5 * Math.sin(Math.PI * clamp((k - 0.35) / 0.3)) : 0;
    s += pop(kc, cx, cy, txt(String(v), cx, cy + 10 + salto, { w: 700, s: 28, c: clara ? C.navy : C.white, a: 'middle', o: op }));
  }
  return s;
}
// traço de batimento que corre para a esquerda dentro de uma janela; amp 0 = linha reta
const ECG = [[0, 0], [14, 0], [18, -4], [22, 0], [27, 0], [30, 5], [34, -15], [38, 10], [41, 0], [47, 0], [51, -5], [56, 0], [60, 0]];
function batimento(id, x, cy, w, t, amp, cor) {
  const P = 60, off = (t * 50) % P;
  let d = '';
  for (let k = 0; k * P < w + P; k++) for (const [px, py] of ECG) d += `${d ? 'L' : 'M'}${f(x + k * P + px - off)},${f(cy + py * amp)} `;
  return `<clipPath id="${id}"><rect x="${f(x)}" y="${f(cy - 20)}" width="${f(w)}" height="40"/></clipPath>`
    + `<g clip-path="url(#${id})"><path d="${d}" fill="none" stroke="${cor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
// pulso de luz que percorre a borda da janela (u: 0..1)
function pulsoBorda(u, cor = C.orange) {
  if (u <= 0 || u >= 1) return '';
  const o = Math.sin(Math.PI * u), base = `x="${WX}" y="${WY}" width="${WW}" height="${WH}" rx="22" fill="none" stroke="${cor}" stroke-linecap="round" pathLength="1" stroke-dasharray=".16 .84" stroke-dashoffset="${f(0.3 - u * 1.15)}"`;
  return `<rect ${base} stroke-width="12" opacity="${f(0.22 * o)}"/><rect ${base} stroke-width="4" opacity="${f(o)}"/>`;
}
// etiqueta com ícone e ponteiro para baixo; a ponta fica em (x, y)
function etiq(str, ic, x, y, k, o = {}) {
  if (k <= 0.001) return '';
  const s = 24, wt = larg(str, s, { w: 700 }), w = 16 + 28 + 8 + wt + 20, h = 44, x0 = x - w / 2, y0 = y - 10 - h;
  const b = `<rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${h}" rx="${h / 2}" fill="${o.cor}" stroke="${C.navy}" stroke-width="2.5"/>`
    + `<path d="M${f(x - 11)},${f(y0 + h - 1.5)} L${f(x)},${f(y)} L${f(x + 11)},${f(y0 + h - 1.5)}Z" fill="${o.cor}"/>`
    + icone(ic, x0 + 30, y0 + h / 2, 28, { c: o.tx, sw: 3.2, u: o.u ?? 1 })
    + txt(str, x0 + 52, y0 + h / 2 + s * 0.35, { w: 700, s, c: o.tx });
  return pop(k, x, y, b);
}
// pílula "antes" / "depois" encostada no pé do marco GO-LIVE (lado -1 = à esquerda, 1 = à direita)
function marca(str, x, base, lado, k, fundo, tinta) {
  if (k <= 0.001) return '';
  const s = 22, wl = larg(str, s, { w: 700 }) + 22, x0 = lado < 0 ? x - wl : x;
  return pop(k, x, base - 8, `<rect x="${f(x0)}" y="${f(base - 23)}" width="${f(wl)}" height="31" rx="15.5" fill="${fundo}"/>` + txt(str, x0 + wl / 2, base, { w: 700, s, c: tinta, a: 'middle' }));
}
// selo de variação do indicador (mesmo desenho do delta de kpi(), mas com entrada animada)
function delta(str, k) {
  if (k <= 0.001) return '';
  const wl = larg(str, 20, { w: 700 }) + 24, xr = KX[0] + KW[0] - 14, y = KY + KH - 50;
  return pop(k, xr - wl / 2, y + 16, `<rect x="${f(xr - wl)}" y="${y}" width="${f(wl)}" height="32" rx="16" fill="${C.blue}"/>` + txt(str, xr - wl / 2, y + 22, { w: 700, s: 20, c: C.white, a: 'middle' }));
}
// varredura de nova leitura: fio laranja com rastro azul cruzando a área útil (u: 0..1)
function leitura(id, u) {
  if (u <= 0 || u >= 1) return '';
  const y0 = JY - 8, hh = ST.y - 6 - y0, x = lerp(JX - 10, JX + JW + 10, u), o = Math.min(inv(0, 0.07, u), 1 - inv(0.92, 1, u));
  return opa(o, `<defs><linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.blue80}" stop-opacity="0"/><stop offset="1" stop-color="${C.blue80}" stop-opacity=".34"/></linearGradient>`
    + `<clipPath id="${id}"><rect x="${JX - 6}" y="${y0}" width="${JW + 12}" height="${f(hh)}" rx="14"/></clipPath></defs>`
    + `<g clip-path="url(#${id})"><rect x="${f(x - 220)}" y="${y0}" width="220" height="${f(hh)}" fill="url(#${id}-g)"/>`
    + `<rect x="${f(x - 7)}" y="${y0}" width="14" height="${f(hh)}" fill="${C.orange}" opacity=".25"/><rect x="${f(x - 2)}" y="${y0}" width="4" height="${f(hh)}" fill="${C.orange}"/></g>`
    + `<circle cx="${f(x)}" cy="${f(y0 + 2)}" r="7" fill="${C.orange}"/><circle cx="${f(x)}" cy="${f(y0 + hh - 2)}" r="7" fill="${C.orange}"/>`);
}
// ponta da linha de tendência para uma onda fracionária
function pontaLinha(od) {
  const o = clamp(od, 0, 2), i = Math.min(1, Math.floor(o)), k = ease.inOut(o - i);
  return [lerp(tpx(i), tpx(i + 1), k), lerp(tpy(INDICES[i]), tpy(INDICES[i + 1]), k)];
}
// punhado discreto de confete que salta do marco GO-LIVE e cai sem cobrir o mapa de calor (u: 0..1)
function estouro(x, y, u) {
  if (u <= 0 || u >= 1) return '';
  const R = rng(31), cores = [C.orange, C.blue40, C.white, C.orange40, C.blue80], g = u * 0.95;
  let s = '';
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (R() - 0.5) * 2.0, v = 170 + R() * 230, w = 6 + R() * 6, rot = R() * 360;
    const px = x + Math.cos(a) * v * g, py = y + Math.sin(a) * v * g + 430 * g * g;
    s += `<rect x="${f(-w / 2)}" y="${f(-w * 0.3)}" width="${f(w)}" height="${f(w * 0.6)}" rx="2" fill="${cores[i % 5]}" transform="translate(${f(px)} ${f(py)}) rotate(${f(rot + g * 420)})"/>`;
  }
  return opa(1 - inv(0.45, 1, u), s);
}
// trajetória do foguete: decola do marco GO-LIVE, sobe e inclina para a esquerda até sair pelo topo
const VOO = 0.74;                                          // duração do voo (s)
const FG0 = [GX, tpy((INDICES[1] + INDICES[2]) / 2) - 6], FG1 = [GX, 470], FG2 = [430, -150];   // sai pelo corredor entre o título e a pílula AO VIVO
function fogueteEm(tt, tGo) {
  const u = inv(tGo, tGo + VOO, tt), s = Math.pow(u, 1.6), q = 1 - s;
  const x = q * q * FG0[0] + 2 * q * s * FG1[0] + s * s * FG2[0], y = q * q * FG0[1] + 2 * q * s * FG1[1] + s * s * FG2[1];
  const dx = 2 * q * (FG1[0] - FG0[0]) + 2 * s * (FG2[0] - FG1[0]), dy = 2 * q * (FG1[1] - FG0[1]) + 2 * s * (FG2[1] - FG1[1]);
  return [x, y, Math.atan2(dx, -dy) * 180 / Math.PI, s];
}

export function desenhar(t, ctx) {
  const { t0, m, mb } = ctx;
  // ---------- tempos ----------
  const tVivo = m('vivo') - 0.06;
  const tNot = m('momento') - 0.86;                        // o aviso entra em "Posição"
  const tMom = m('momento') - 0.06, tNao = m('rotulo') - 0.24, tRisca = m('rotulo') + 0.1;
  const tEx = ['avancam', 'travam', 'recuam'].map(k => m(k) - 0.08);
  const tNotSai = tEx[0] - 0.42;                           // o aviso sai antes de "pessoas avançam"
  const tSai = mb('recuam') + 0.12;                        // as etiquetas saem
  const tAbas = m('onda') - 0.5;                           // "A cada onda": as abas piscam em sequência
  const tC1 = m('medimos') - 0.04;                         // clique em "Onda 2"
  const tW1 = m('plano') - 0.32;                           // a onda 2 termina de ser lida (a barra fecha em 100% antes de o alerta entrar)
  const tAl = m('plano') - 0.14;                           // alerta do plano
  const tC2 = m('antes') - 0.05;                           // clique em "Onda 3"
  const tGo = m('golive') - 0.05;                          // a linha chega ao marco e o foguete decola
  const tW2 = m('golive') + 0.5;                           // a onda 3 termina de ser lida
  const tDe = m('depois') - 0.06;
  const tV3 = tGo + 0.22;                                  // o plano vira v3
  const tB = tGo + 0.14;                                   // "Pessoa B adotou": logo depois do go-live, para dar tempo de ler

  // onda fracionária (0..2) que alimenta os gráficos
  const o1 = inv(tC1 + 0.05, tW1, t), o2 = inv(tC2 + 0.05, tW2, t);
  const ond = o1 + o2;
  // a linha de tendência tem o seu próprio relógio na onda 3: chega ao marco GO-LIVE na palavra e dispara depois
  const pL = t < tGo ? 0.5 * ease.sine(inv(tC2 + 0.08, tGo, t)) : 0.5 + 0.5 * ease.out(inv(tGo, tGo + 0.5, t));
  const ondL = t <= tC2 ? o1 : 1 + invIO(pL);
  const aba = t < tC1 ? 0 : t < tC2 ? 1 : 2;

  // ---------- título e indicador AO VIVO ----------
  let cena = titulo(['O mapa precisa', 'estar *vivo*'], MG, 196, t, t0 + 0.15, { escuro: true });
  {
    const k = fin(t, t0 + 0.55, 0.45), on = fin(t, tVivo, 0.3);
    const sz = 22, wT = larg('AO VIVO', sz, { w: 700, ls: 2 });
    const wE = 124, w = 22 + 16 + 14 + wT + 16 + wE + 22, h = 50, x0 = W - MG - w, y0 = 206, cy = y0 + h / 2;
    let b = `<rect x="${f(x0)}" y="${y0}" width="${f(w)}" height="${h}" rx="${h / 2}" fill="${mix('#12405F', '#1B4A6B', on)}" stroke="${mix(C.navy80, C.orange, on)}" stroke-width="2"/>`;
    const dx = x0 + 30, bate = 1 + 0.22 * on * Math.pow(Math.max(0, Math.sin((t - tVivo) * Math.PI / 0.65)), 6);
    if (on > 0) b += onda(dx, cy, (t - tVivo) % 1.3, { r0: 8, r1: 12, d: 1.05, sw: 3 });
    b += `<circle cx="${f(dx)}" cy="${cy}" r="${f(8 * bate)}" fill="${mix(C.navy40, C.orange, on)}"/>`;
    b += txt('AO VIVO', x0 + 52, cy + sz * 0.35, { w: 700, s: sz, ls: 2, c: mix(C.navy40, C.white, on) });
    b += batimento('vv-ecg', x0 + 52 + wT + 16, cy, wE, t, back(t, tVivo, 0.5), mix(C.navy80, C.orange, on));
    cena += opa(k, `<g transform="translate(${f((1 - k) * 34)} 0)">${pop(1 + 0.08 * Math.sin(Math.PI * inv(tVivo, tVivo + 0.45, t)), x0 + w, cy, b)}</g>`);
    cena += onda(dx, cy, t - tVivo, { r0: 10, r1: 70, d: 0.7, sw: 5 });
  }

  // ---------- janela do dashboard ----------
  const jn = janela(WX, WY, WW, WH, { titulo: TITULO_J, abas: ABAS, aba });
  let w = jn.svg;
  // selo ampliado 1,43x: o texto do selo passa de 14 para 20 px (legível no celular)
  w += opa(fin(t, t0 + 0.7, 0.4), `<g transform="translate(${f(WX + 112 + larg(TITULO_J, 24, { w: 700 }) + 18)} ${WY + 10.5}) scale(1.43)">${selo('Ilustrativo', 0, 0)}</g>`);
  // "A cada onda": as três abas piscam em sequência; a aba que o cursor vai clicar ganha contorno
  TAB.forEach((tb, i) => {
    const u = inv(tAbas + i * 0.17, tAbas + i * 0.17 + 0.5, t);
    if (u > 0 && u < 1) w += `<rect x="${f(tb.x - 4)}" y="${WY + 8}" width="${f(tb.w + 8)}" height="42" rx="21" fill="none" stroke="${C.orange}" stroke-width="3" opacity="${f(Math.sin(Math.PI * u))}"/>`;
  });
  [[1, tC1], [2, tC2]].forEach(([i, tc]) => {
    const kh = fin(t, tc - 0.3, 0.2) * fout(t, tc, 0.15);
    if (kh > 0.001) w += `<rect x="${f(TAB[i].x)}" y="${WY + 12}" width="${f(TAB[i].w)}" height="34" rx="17" fill="${C.white}" fill-opacity=".16" stroke="${C.white}" stroke-width="2" opacity="${f(kh)}"/>`;
    w += onda(TAB[i].cx, TAB[i].cy, t - tc, { r0: 18, r1: 60, d: 0.6, sw: 5 });
  });

  // ---------- indicadores ----------
  const kK = i => fin(t, t0 + 0.45 + i * 0.09, 0.45);
  {
    const uIn = inv(t0 + 0.65, t0 + 1.55, t);
    const valor = (uIn < 1 ? Math.round(INDICES[0] * ease.out(uIn)) : Math.round(indiceEm(ond))) + '%';
    w += kpi(KX[0], KY, KW[0], KH, { rot: 'Índice de adoção', valor, k: kK(0) });
    // variação: +12 p.p. na onda 2 e +24 p.p. na onda 3
    const tD1 = tW1 - 0.1, tD2 = tW2 - 0.22;
    w += t < tD2 ? delta('+12 p.p.', back(t, tD1, 0.4) * fout(t, tC2, 0.2)) : delta('+24 p.p.', back(t, tD2, 0.4));
    w += onda(KX[0] + KW[0] - 60, KY + KH - 34, t - tD1, { r0: 20, r1: 46, d: 0.6, sw: 4, c: C.blue80 });   // na onda 3 o foco é o go-live: sem anel
  }
  KPIS.forEach((kp, i) => {
    const x = KX[i + 1], k = kK(i + 1), viva = ond > 0.001;
    const q = ond <= 1 ? lerp(0, MOV[i][0], ease.inOut(ond)) : lerp(MOV[i][0], MOV[i][1], ease.inOut(ond - 1));
    w += kpi(x, KY, KW[i + 1], KH, { rot: kp.rot, valor: viva ? String(Math.round(q)) : '', k });
    let b = '';
    // na onda 1 ainda não há com o que comparar: o indicador espera a próxima leitura
    const kEsp = fout(t, tC1, 0.25);
    if (kEsp > 0.001) b += opa(kEsp, `<circle cx="${x + 26}" cy="${KY + KH - 37}" r="${f(4.5 + 1.5 * Math.sin(t * 4 + i))}" fill="${kp.cor}" opacity=".8"/>` + txt('aguarda Onda 2', x + 40, KY + KH - 30, { s: 21, c: C.blue40 }));
    // medidor: fatia das 25 pessoas
    if (viva) {
      const mx = x + 92, mw = KW[i + 1] - 92 - 18, my = KY + KH - 46, km = fin(t, tC1 + 0.05, 0.3);
      b += opa(km, `<rect x="${mx}" y="${my}" width="${mw}" height="9" rx="4.5" fill="rgba(255,255,255,.12)"/>`
        + (q > 0.05 ? `<rect x="${mx}" y="${my}" width="${f(Math.max(9, mw * q / PESSOAS.length))}" height="9" rx="4.5" fill="${kp.cor}"/>` : ''));
    }
    // ícone: desenha na entrada e de novo quando a fala cita o movimento
    const uI = t < tEx[i] ? inv(t0 + 0.8 + i * 0.09, t0 + 1.4 + i * 0.09, t) : inv(tEx[i], tEx[i] + 0.5, t);
    b += icone(kp.ic, x + KW[i + 1] - 32, KY + 28, 28, { c: kp.cor, sw: 2.8, u: uI });
    // contorno que acende com a palavra
    const ac = fin(t, tEx[i], 0.15) * fout(t, tEx[i] + 0.55, 0.7);
    if (ac > 0.001) b += `<rect x="${x}" y="${KY}" width="${KW[i + 1]}" height="${KH}" rx="14" fill="${kp.cor}" fill-opacity="${f(0.14 * ac)}" stroke="${kp.cor}" stroke-width="3" opacity="${f(ac)}"/>`;
    w += opa(clamp(k * 1.4), b);
  });

  // ---------- mapa de calor ----------
  w += calor(GC, { onda: ond, u: inv(t0 + 0.55, t0 + 1.75, t), numeros: false }) + numerosCalor(ond, inv(t0 + 0.55, t0 + 1.75, t));
  // respiração: em 'vivo' um brilho cruza as células; depois volta de tempos em tempos, bem leve
  if (t > tVivo) {
    let r = '';
    for (let a = 0; a < 4; a++) for (let n = 0; n < 5; n++) {
      const [x0, y0, cw, rh] = GC.cel(a, n);
      const forte = Math.sin(Math.PI * inv(0, 0.5, t - tVivo - n * 0.09 - a * 0.04));
      const ciclo = (((t - tVivo - 1.4) / 2.6 - n * 0.045 - a * 0.02) % 1 + 1) % 1;
      const leve = t > tVivo + 1.4 && ciclo < 0.16 ? Math.sin(Math.PI * ciclo / 0.16) : 0;
      const o = 0.26 * forte + 0.1 * leve;
      if (o > 0.004) r += `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="10" fill="#fff" opacity="${f(o)}"/>`;
    }
    w += r;
  }

  // nova leitura: cada célula acende quando o fio da varredura passa por ela
  [[tC1 + 0.05, 1.25], [tC2 + 0.05, 1.0]].forEach(([ts, d]) => {
    const u = inv(ts, ts + d, t);
    if (u <= 0 || u >= 1) return;
    const xs = lerp(JX - 10, JX + JW + 10, u);
    let r = '';
    for (let a = 0; a < 4; a++) for (let n = 0; n < 5; n++) {
      const [x0, y0, cw, rh] = GC.cel(a, n), dist = xs - (x0 + cw / 2);
      const o = dist < -cw / 2 || dist > 300 ? 0 : dist < 0 ? 0.34 * (1 + dist / (cw / 2)) : 0.34 * (1 - dist / 300);
      if (o > 0.004) r += `<rect x="${f(x0 + 4)}" y="${f(y0 + 4)}" width="${f(cw - 8)}" height="${f(rh - 8)}" rx="10" fill="#fff" opacity="${f(o)}"/>`;
    }
    w += r;
  });

  // ---------- rosca e tendência ----------
  const kFoco = fin(t, tEx[0] - 0.3, 0.4) * fout(t, tSai, 0.4);            // fase das etiquetas: a parte de baixo recua
  {
    let b = cartao(RC.x, RC.y, RC.w, RC.h, { titulo: 'Distribuição', k: fin(t, t0 + 0.8, 0.45) });
    b += opa(fin(t, t0 + 0.95, 0.3), rosca(RC.x + RC.w / 2, RC.y + 146, 90, { onda: ond, u: inv(t0 + 0.95, t0 + 1.85, t) }));
    b += cartao(TC.x, TC.y, TC.w, TC.h, { titulo: 'Índice por onda', k: fin(t, t0 + 0.9, 0.45) });
    // "antes" e "depois": as duas metades do gráfico, de cada lado do marco GO-LIVE
    const y0 = TD.y + 36, y1 = tpy(0), base = TD.y + TD.h - 12;
    const kA = fin(t, tC2, 0.3), kD = fin(t, tDe, 0.3);
    if (kA > 0.001) {
      const fl = 1 + 1.4 * Math.sin(Math.PI * inv(tC2, tC2 + 0.6, t));
      b += `<rect x="${f(TD.x + 8)}" y="${f(y0)}" width="${f(GX - TD.x - 8)}" height="${f(y1 - y0)}" fill="${C.blue40}" opacity="${f(0.07 * kA * fl)}"/>`;
      b += marca('antes', GX - 10, base, -1, back(t, tC2, 0.4), 'rgba(255,255,255,.2)', C.white);
    }
    if (kD > 0.001) {
      const fl = 1 + 1.2 * Math.sin(Math.PI * inv(tDe, tDe + 0.6, t));
      b += `<rect x="${f(GX)}" y="${f(y0)}" width="${f(TD.x + TD.w - 8 - GX)}" height="${f(y1 - y0)}" fill="${C.orange}" opacity="${f(0.08 * kD * fl)}"/>`;
      b += marca('depois', GX + 10, base, 1, back(t, tDe, 0.4), C.orange, C.navy);
    }
    b += opa(fin(t, t0 + 1.0, 0.3), tendencia(TD.x, TD.y, TD.w, TD.h, { onda: ondL, u: inv(t0 + 1.0, t0 + 1.8, t) }));
    const [lx, ly] = pontaLinha(ondL);
    // o tempo que ainda vem: tracejado correndo no eixo, da ponta da linha até a onda 3
    if (lx < tpx(2) - 20) b += opa(fin(t, t0 + 1.6, 0.4) * 0.6, `<path d="M${f(lx + 18)},${f(tpy(0))} L${f(tpx(2))},${f(tpy(0))}" stroke="${C.blue40}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 14" stroke-dashoffset="${f(-t * 22)}"/>`);
    // um brilho percorre a linha quando a leitura da onda 2 fecha
    {
      const u = inv(tW1 + 0.1, tW1 + 0.6, t);
      if (u > 0 && u < 1) {
        const k = ease.inOut(u), gx = lerp(tpx(0), tpx(1), k), gy = lerp(tpy(INDICES[0]), tpy(INDICES[1]), k), o = Math.sin(Math.PI * u);
        b += `<circle cx="${f(gx)}" cy="${f(gy)}" r="13" fill="#fff" opacity="${f(0.25 * o)}"/><circle cx="${f(gx)}" cy="${f(gy)}" r="5" fill="#fff" opacity="${f(o)}"/>`;
      }
    }
    // go-live: um feixe acende o marco e o rótulo vira pílula cheia (o marco foi cruzado)
    {
      const u = inv(tGo - 0.02, tGo + 0.7, t), kP = t < tGo ? 0 : 1 + 0.22 * Math.sin(Math.PI * inv(tGo, tGo + 0.42, t));
      if (u > 0 && u < 1) b += `<path d="M${f(GX)},${f(TD.y + 36)} L${f(GX)},${f(tpy(0))}" stroke="${C.orange}" stroke-width="${f(lerp(26, 6, u))}" stroke-linecap="round" opacity="${f(0.3 * (1 - u))}"/>`
        + `<path d="M${f(GX)},${f(TD.y + 36)} L${f(GX)},${f(tpy(0))}" stroke="${C.orange40}" stroke-width="${f(lerp(7, 2.5, u))}" stroke-linecap="round" opacity="${f(1 - u)}"/>`;
      if (kP > 0.001) {
        const wl = larg('GO-LIVE', 20, { w: 700, ls: 1.2 }) + 26;
        b += pop(kP, GX, TD.y + 19, `<rect x="${f(GX - wl / 2)}" y="${f(TD.y + 3)}" width="${f(wl)}" height="32" rx="16" fill="${C.orange}"/>` + txt('GO-LIVE', GX, TD.y + 26, { w: 700, s: 20, ls: 1.2, c: C.navy, a: 'middle' }));
      }
    }
    // a ponta da linha pulsa (dado ao vivo)
    if (t > tVivo) { b += onda(lx, ly, (t - tVivo) % 1.3, { r0: 12, r1: 7, d: 1.0, sw: 3.5 }); }
    w += opa(1 - 0.5 * kFoco, b);
  }

  // ---------- faixa de status / alerta do plano ----------
  {
    // some enquanto o aviso da fase 1 está por cima e volta quando ele sai
    const k = fin(t, t0 + 1.15, 0.45) * fout(t, tW1 + 0.04, 0.13) * (1 - fin(t, tNot + 0.25, 0.2) * fout(t, tNotSai + 0.22, 0.3));   // sai antes de o alerta entrar (sem dupla exposição)
    if (k > 0.001) {
      const cy = ST.y + ST.h / 2, lendo = t >= tC1, vivo = fin(t, tVivo, 0.3);
      let b = `<rect x="${ST.x}" y="${ST.y}" width="${ST.w}" height="${ST.h}" rx="12" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>`;
      b += `<circle cx="${ST.x + 30}" cy="${cy}" r="${f(7 + (lendo ? 2 * Math.sin(t * 16) : vivo * 1.5 * Math.sin(t * 5)))}" fill="${lendo ? C.orange : mix(C.blue80, C.orange, vivo)}"/>`;
      const kT = lendo ? fin(t, tC1, 0.25) : 1;
      b += sobe(kT, txt(lendo ? 'Nova leitura · Onda 2' : 'Leitura da Onda 1', ST.x + 52, cy + 8.5, { w: 700, s: 24, c: C.white }), 12);
      if (lendo) {
        // barra de progresso da nova leitura
        const bx = ST.x + 300, bw = ST.w - 300 - 96, u = ease.inOut(o1);
        b += opa(kT, `<rect x="${bx}" y="${cy - 6}" width="${bw}" height="12" rx="6" fill="rgba(255,255,255,.12)"/><rect x="${bx}" y="${cy - 6}" width="${f(Math.max(12, bw * u))}" height="12" rx="6" fill="${C.orange}"/>`
          + txt(Math.round(u * 100) + '%', ST.x + ST.w - 22, cy + 8.5, { w: 700, s: 24, c: C.white, a: 'end' }));
      } else {
        b += txt('25 pessoas · 4 áreas', ST.x + ST.w - 22, cy + 8, { s: 23, c: C.blue40, a: 'end' });
      }
      w += sobe(k, opa(1 - 0.5 * kFoco, b), 18);
    }
    // alerta: o plano de mudança foi ajustado (v2 na onda 2, v3 depois do go-live)
    const kAl = fin(t, tAl, 0.5);
    if (kAl > 0.001) {
      const v3 = t >= tV3, wAl = lerp(ST.w, 560, ease.inOut(inv(tB - 0.26, tB + 0.1, t)));
      const tit = 'Plano de mudança ajustado';
      let b = alerta(ST.x, ST.y, wAl, ST.h, { ic: 'plano', titulo: tit, texto: ' ', tom: 'bom', k: kAl });
      // subtítulo: o da v2 sobe e some, o da v3 entra por baixo
      {
        const kO = fin(t, tV3, 0.14), kS = fin(t, tV3 + 0.12, 0.24), sy = ST.y + ST.h / 2 + 24, so = { s: 20, c: C.blue40 };
        const sub = (kO < 1 ? `<g opacity="${f(1 - kO)}" transform="translate(0 ${f(-8 * kO)})">${txt('Mais prática guiada onde travou', ST.x + 80, sy, so)}</g>` : '')
          + (kS > 0 ? `<g opacity="${f(kS)}" transform="translate(0 ${f(8 * (1 - kS))})">${txt('Reforço e palco depois do go-live', ST.x + 80, sy, so)}</g>` : '');
        b += opa(clamp(kAl * 1.4), `<g transform="translate(${f((1 - ease.out(clamp(kAl))) * 40)} 0)">${sub}</g>`);
      }
      const bx = ST.x + 80 + larg(tit, 23, { w: 700 }) + 14, by = ST.y + ST.h / 2 - 24, tv = v3 ? tV3 : tAl + 0.2;
      b += pop(back(t, tv, 0.4), bx + 26, by + 14, `<rect x="${f(bx)}" y="${f(by)}" width="52" height="30" rx="15" fill="${C.orange}"/>` + txt(v3 ? 'v3' : 'v2', bx + 26, by + 22.5, { w: 700, s: 22, c: C.navy, a: 'middle' }));
      // prioridade do plano nesta versão (as ações da cena anterior); sai para dar lugar ao aviso da Pessoa B
      const kCh = fout(t, tB - 0.42, 0.2);
      if (kCh > 0.001) {
        let c = '', cx = ST.x + ST.w - 20;
        const cy = ST.y + ST.h / 2, on = fin(t, tAl + 0.75, 0.3);
        [['Palco', 0], ['Prática', 1], ['Escuta', 0]].forEach(([r, ativa], i) => {
          const wl = larg(r, 21, { w: 700 }) + 30, a = ativa * on;
          cx -= wl;
          c += pop(back(t, tAl + 0.5 - i * 0.07, 0.4) * (1 + 0.14 * ativa * Math.sin(Math.PI * inv(tAl + 0.75, tAl + 1.15, t))), cx + wl / 2, cy,
            `<rect x="${f(cx)}" y="${cy - 18}" width="${f(wl)}" height="36" rx="18" fill="${C.orange}" fill-opacity="${f(a)}" stroke="${mix('#5C7A91', C.orange, a)}" stroke-width="1.5"/>`
            + txt(r, cx + wl / 2, cy + 7.5, { w: 700, s: 21, c: mix(C.white, C.navy, a), a: 'middle' }));
          cx -= 10;
        });
        c += opa(fin(t, tAl + 0.3, 0.3), txt('PRIORIDADE', cx - 6, cy + 7, { w: 700, s: 20, ls: 1.2, c: C.blue40, a: 'end' }));
        b += opa(kCh, c);
      }
      // brilho quando o alerta chega e quando a versão muda
      for (const tt of [tAl + 0.1]) {
        const u = inv(tt, tt + 0.6, t);
        if (u > 0 && u < 1) b += `<rect x="${ST.x}" y="${ST.y}" width="${f(wAl)}" height="${ST.h}" rx="12" fill="#fff" fill-opacity="${f(0.16 * (1 - u))}" stroke="${C.blue40}" stroke-width="3" opacity="${f(1 - ease.out(u))}"/>`;
      }
      w += b;
    }
    // aviso final: a Pessoa B, que tinha voltado para a planilha, agora adota
    const kB = back(t, tB, 0.5);
    if (kB > 0.001) {
      const bw = 378, bx = ST.x + ST.w - bw, cy = ST.y + ST.h / 2;
      let b = `<rect x="${bx}" y="${ST.y}" width="${bw}" height="${ST.h}" rx="12" fill="${C.white}"/>`
        + avatar(bx + 40, cy, { r: 23, cor: HEROIS.B.cor, c: C.navy, sw: 2.6, u: inv(tB + 0.05, tB + 0.5, t) })
        + txt('Pessoa B adotou', bx + 76, cy + 9, { w: 700, s: 26, c: C.navy })
        + `<circle cx="${bx + bw - 36}" cy="${cy}" r="18" fill="${C.blue}"/>`
        + `<g transform="translate(${bx + bw - 36} ${cy})">${tracar('M-8,0 L-2,6 L9,-6', inv(tB + 0.2, tB + 0.5, t), { c: C.white, sw: 3.6 })}</g>`;
      w += opa(clamp(kB * 1.6), `<g transform="translate(0 ${f((1 - kB) * 40)})">${b}</g>`);
      // a célula onde ela chegou acende no mapa de calor (depois que o foguete já passou por ali)
      const [x0, y0, cw, rh] = GC.cel(...CEL_B), [cx, cyc] = GC.centro(...CEL_B), tCel = tB + 0.36, kC = back(t, tCel, 0.4);
      w += onda(cx, cyc, t - tCel, { r0: 24, r1: 70, d: 0.7, sw: 5 });
      w += `<rect x="${f(x0 + 1)}" y="${f(y0 + 1)}" width="${f(cw - 2)}" height="${f(rh - 2)}" rx="12" fill="none" stroke="${C.orange}" stroke-width="4" opacity="${f(clamp(kC))}"/>`;
      w += pop(kC, x0 + cw - 8, y0 + 8, `<circle cx="${f(x0 + cw - 8)}" cy="${f(y0 + 8)}" r="16" fill="${HEROIS.B.cor}" stroke="${C.navy}" stroke-width="2.5"/>` + txt('B', x0 + cw - 8, y0 + 15.5, { w: 700, s: 21, c: C.navy, a: 'middle' }));
    }
  }

  // ---------- fase 1: aviso "Posição é momento, não rótulo." ----------
  {
    const kIn = back(t, tNot, 0.55), sai = fout(t, tNotSai, 0.32);
    if (kIn > 0.001 && sai > 0.001) {
      const x0 = ST.x, y0 = ST.y - 8, ww = ST.w, hh = ST.h + 16, cy = y0 + hh / 2, sz = 32, o = { w: 700 };
      const P1 = 'Posição é ', P2 = 'momento', P3 = ', não ', P4 = 'rótulo', P5 = '.';
      const w1 = larg(P1, sz, o), w2 = larg(P2, sz, o), w3 = larg(P3, sz, o), w4 = larg(P4, sz, o);
      const total = 56 + 20 + w1 + w2 + w3 + w4 + larg(P5, sz, o), xi = x0 + (ww - total) / 2, xt = xi + 76, yb = cy + sz * 0.35;
      let b = `<rect x="${x0}" y="${y0}" width="${ww}" height="${hh}" rx="14" fill="${C.orange20}"/><rect x="${x0}" y="${y0}" width="10" height="${hh}" rx="5" fill="${C.orange}"/>`;
      // relógio: o ponteiro gira (posição é momento)
      const a1 = t * 2.4, a2 = t * 0.4 - 1, rx = xi + 28;
      b += pop(back(t, tNot + 0.1, 0.4), rx, cy, `<circle cx="${f(rx)}" cy="${f(cy)}" r="28" fill="${C.navy}"/>`
        + `<circle cx="${f(rx)}" cy="${f(cy)}" r="18" fill="none" stroke="${C.white}" stroke-width="3"/>`
        + `<path d="M${f(rx)},${f(cy)} L${f(rx + Math.sin(a1) * 13)},${f(cy - Math.cos(a1) * 13)}" stroke="${C.orange}" stroke-width="3.2" stroke-linecap="round"/>`
        + `<path d="M${f(rx)},${f(cy)} L${f(rx + Math.sin(a2) * 8.5)},${f(cy - Math.cos(a2) * 8.5)}" stroke="${C.white}" stroke-width="3.2" stroke-linecap="round"/>`);
      const kM = fin(t, tMom, 0.3), kR = fin(t, tNao, 0.3), uX = ease.inOut(inv(tRisca, tRisca + 0.4, t));
      // a frase inteira já está lá, apagada; cada trecho acende em navy quando a fala chega nele
      const apag = mix(C.orange20, C.navy, 0.26), k1 = fin(t, tNot + 0.14, 0.3);
      const salto = k => -5 * Math.sin(Math.PI * clamp(k));
      b += txt(P1, xt, yb + salto(k1), { w: 700, s: sz, c: mix(apag, C.navy, k1) });
      b += txt(P2, xt + w1, yb + salto(kM), { w: 700, s: sz, c: mix(apag, C.navy, kM) });
      b += `<rect x="${f(xt + w1)}" y="${f(yb + 7)}" width="${f(w2 * ease.out(inv(tMom + 0.1, tMom + 0.5, t)))}" height="5" fill="${C.orange}"/>`;
      b += txt(P3, xt + w1 + w2, yb + salto(kR), { w: 700, s: sz, c: mix(apag, C.navy, kR) })
        + txt(P4, xt + w1 + w2 + w3, yb + salto(kR), { w: 700, s: sz, c: mix(mix(apag, C.navy, kR), '#7C8FA0', uX) })
        + txt(P5, xt + w1 + w2 + w3 + w4, yb, { w: 700, s: sz, c: mix(apag, C.navy, kR) });
      if (uX > 0) b += `<rect x="${f(xt + w1 + w2 + w3 - 5)}" y="${f(yb - sz * 0.32)}" width="${f((w4 + 10) * uX)}" height="4" rx="2" fill="${C.navy}"/>`;
      const dy = (1 - kIn) * 24 + (1 - sai) * 10;         // deslocamento curto: o aviso não sai da moldura da janela
      w += `<g opacity="${f(clamp(kIn * 1.6) * sai)}" transform="translate(0 ${f(dy)}) rotate(${f((1 - kIn) * -1.6)} ${x0 + ww / 2} ${cy})">${b}</g>`;
    }
  }

  // ---------- fase 1: etiquetas sobre o mapa de calor ----------
  EX.forEach((ex, i) => {
    const ti = tEx[i], sai = fout(t, tSai + i * 0.07, 0.3), k = back(t, ti, 0.42) * sai;
    if (k <= 0.001) return;
    const [x0, y0, cw, rh] = GC.cel(...ex.cel), [cx, cy] = GC.centro(...ex.cel);
    let b = onda(cx, cy, t - ti, { r0: 26, r1: 80, d: 0.65, sw: 5, c: ex.anel });
    b += `<rect x="${f(x0 + 1)}" y="${f(y0 + 1)}" width="${f(cw - 2)}" height="${f(rh - 2)}" rx="12" fill="none" stroke="${ex.anel}" stroke-width="4.5" opacity="${f(clamp(k))}"/>`;
    // sinal de movimento na borda da célula: empurra para a direita, trava ou volta para a esquerda
    const c = Math.max(0, t - ti) % 1.1;
    const dx = ex.dir ? ex.dir * 9 * (0.5 - 0.5 * Math.cos(c * Math.PI * 2 / 1.1)) : (c < 0.42 ? Math.sin(c * 46) * 3 * (1 - c / 0.42) : 0);
    const bx = (ex.dir < 0 ? x0 : x0 + cw) + dx;
    let g = `<circle cx="${f(bx)}" cy="${f(cy)}" r="17" fill="${ex.cor}" stroke="${C.navy}" stroke-width="2.5"/>`;
    g += ex.dir
      ? `<path d="M${f(bx - ex.dir * 4)},${f(cy - 8)} L${f(bx + ex.dir * 5)},${f(cy)} L${f(bx - ex.dir * 4)},${f(cy + 8)}" fill="none" stroke="${ex.tx}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M${f(bx - 4.5)},${f(cy - 7.5)} v15 M${f(bx + 4.5)},${f(cy - 7.5)} v15" stroke="${ex.tx}" stroke-width="3.6" stroke-linecap="round"/>`;
    b += pop(back(t, ti + 0.12, 0.4) * sai, bx, cy, g);
    b += etiq(ex.rot, ex.ic, cx, y0 + 3, k, { cor: ex.cor, tx: ex.tx, u: inv(ti + 0.1, ti + 0.55, t) });
    w += b;
  });

  // ---------- varreduras de nova leitura e pulsos de luz na borda ----------
  w += leitura('vv-l1', inv(tC1 + 0.05, tC1 + 1.3, t)) + leitura('vv-l2', inv(tC2 + 0.05, tC2 + 1.05, t));
  w += pulsoBorda(inv(tVivo, tVivo + 1.5, t)) + pulsoBorda(inv(tC1, tC1 + 1.3, t), C.blue40) + pulsoBorda(inv(tC2, tC2 + 1.2, t), C.blue40);

  // a janela entra deslizando de baixo, com leve rotação
  {
    const kW = back(t, t0 + 0.1, 0.75), oW = fin(t, t0 + 0.1, 0.3);
    cena += `<g opacity="${f(oW)}" transform="translate(0 ${f((1 - kW) * 130)}) rotate(${f((1 - kW) * -2.6)} ${WX + WW / 2} ${WY + WH / 2})">${w}</g>`;
  }

  // ---------- cursor ----------
  {
    const A = [TAB[1].cx + 8, TAB[1].cy + 4], B = [TAB[2].cx + 8, TAB[2].cy + 4], R = [TAB[1].x + TAB[1].w + 5, WY + 52];
    const tIn = tAbas - 0.2;
    const [x, y] = kf(t, [[tIn, [1104, 700]], [tC1 - 0.1, A], [tC1 + 0.3, A], [tC1 + 0.85, R], [tC2 - 0.45, R], [tC2 - 0.08, B], [tC2 + 0.3, B], [tC2 + 1.0, [1100, 560]]]);
    const o = fin(t, tIn, 0.3) * fout(t, tC2 + 0.6, 0.35);
    const u1 = inv(tC1, tC1 + 0.45, t), u2 = inv(tC2, tC2 + 0.45, t);
    cena += opa(o, cursor(x, y, { clique: u1 > 0 && u1 < 1 ? u1 : u2, s: 1.15 }));
  }

  // ---------- go-live: o foguete decola do marco ----------
  {
    const kR = back(t, tGo - 0.2, 0.3), tFim = tGo + VOO;
    if (kR > 0.001 && t < tFim + 0.5) {
      const [x, y, ang, s] = fogueteEm(t, tGo);
      let b = onda(FG0[0], FG0[1], t - tGo, { r0: 18, r1: 84, d: 0.6, sw: 5 });
      // rastro: uma fita de luz afilada atrás do foguete (laranja com miolo branco); depois da saída ela encolhe e some
      {
        const tA = Math.min(t, tFim), N = 14, DUR = 0.36, pts = [];
        for (let i = 0; i <= N; i++) {
          const te = lerp(t - DUR, tA, i / N);
          if (te < tGo) continue;
          const [ex, ey, ea] = fogueteEm(te, tGo), ar = ea * Math.PI / 180;
          pts.push([ex - Math.sin(ar) * 38, ey + Math.cos(ar) * 38, i / N]);
        }
        if (pts.length >= 3 && t - DUR < tFim) {
          const fita = hw => {
            const L = [], D = [];
            pts.forEach((q, i) => {
              const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
              const dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy) || 1, h = hw * q[2];
              L.push(`${f(q[0] - dy / d * h)},${f(q[1] + dx / d * h)}`);
              D.unshift(`${f(q[0] + dy / d * h)},${f(q[1] - dx / d * h)}`);
            });
            return 'M' + L.concat(D).join(' L') + 'Z';
          };
          const p0 = pts[0], p1 = pts[pts.length - 1], g = `gradientUnits="userSpaceOnUse" x1="${f(p0[0])}" y1="${f(p0[1])}" x2="${f(p1[0])}" y2="${f(p1[1])}"`;
          b += `<defs><linearGradient id="vv-rg" ${g}><stop offset="0" stop-color="${C.orange}" stop-opacity="0"/><stop offset="1" stop-color="${C.orange}" stop-opacity=".8"/></linearGradient>`
            + `<linearGradient id="vv-rw" ${g}><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".95"/></linearGradient></defs>`
            + `<path d="${fita(9)}" fill="url(#vv-rg)"/><path d="${fita(3.4)}" fill="url(#vv-rw)"/>`;
        }
      }
      // poucas fagulhas finas soltas pela cauda
      const Rn = rng(77), cores = [C.orange, C.orange40, C.white];
      for (let i = 0; i < 16; i++) {
        const te = tGo + 0.03 + i * 0.044, age = t - te, r1 = Rn(), r2 = Rn(), r3 = Rn();
        if (age <= 0 || age >= 0.5) continue;
        const [ex, ey, ea] = fogueteEm(te, tGo), ar = ea * Math.PI / 180, u = age / 0.5;
        const px = ex - Math.sin(ar) * 42 + (r1 - 0.5) * 80 * u, py = ey + Math.cos(ar) * 42 + (30 + r2 * 70) * u;
        b += `<circle cx="${f(px)}" cy="${f(py)}" r="${f((2 + r3 * 3) * (1 - u))}" fill="${cores[i % 3]}" opacity="${f(0.9 * (1 - u * u))}"/>`;
      }
      // chama e corpo
      const tam = 80 * (1 + 0.3 * s), ch = 30 + 12 * Math.sin(t * 60) + 30 * clamp(s * 3), [tx, ty] = tremor(t, tGo - 0.2, 0.25, 3);
      const corpo = `<path d="M-10,${f(tam * 0.34)} Q0,${f(tam * 0.34 + ch * 1.6)} 10,${f(tam * 0.34)}Z" fill="${C.orange40}"/><path d="M-5,${f(tam * 0.34)} Q0,${f(tam * 0.34 + ch * 0.9)} 5,${f(tam * 0.34)}Z" fill="${C.white}"/>`
        + icone('foguete', 0, 0, tam, { c: C.white, sw: 3.2, fill: C.orange });
      if (t < tFim + 0.05) b += `<g transform="translate(${f(x + tx)} ${f(y + ty)}) rotate(${f(ang)}) scale(${f(kR)})">${brilho(corpo)}</g>`;
      cena += b;
    }
    cena += estouro(FG0[0], FG0[1], (t - tGo - 0.04) / 0.8);
  }

  // ---------- câmera: aproxima na fase das etiquetas e dá um leve soco no go-live ----------
  const push = ease.inOut(inv(tEx[0] - 0.55, tEx[0] + 0.25, t)) * (1 - ease.inOut(inv(tSai - 0.05, tSai + 0.75, t)));
  const soco = Math.sin(Math.PI * inv(tGo, tGo + 0.5, t));
  const [sx, sy] = tremor(t, tGo, 0.3, 5);
  return fundoNoite(t) + camera(cena, { z: 1 + 0.06 * push + 0.022 * soco, cx: 540, cy: CAM_Y, dx: sx, dy: sy + CAM_Y - H / 2 });   // (540, CAM_Y) fica parado no quadro
}
