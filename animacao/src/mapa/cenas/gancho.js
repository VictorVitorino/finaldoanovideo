// Cena "gancho" (0,00–9,67 s): abertura e miniatura do post.
// Duas telas lado a lado, uma de cada pessoa. As duas recebem a MESMA ferramenta (o mesmo mini aplicativo desliza
// para dentro das duas janelas) e o MESMO treinamento (o mesmo selo carimba as duas). Em "adota" a tela da Pessoa A
// ganha vida: barras crescem, checks em cascata, o uso diário sobe a 92%. Em "a outra volta para a planilha" uma
// planilha antiga desliza por cima da ferramenta nova na tela da Pessoa B e o uso diário dela cai a zero.
// No vão entre as telas, três marcadores contam a história: "=" (ferramenta), "=" (treinamento), "≠" (resultado).
// O título e as duas telas já estão no quadro em t = 0 (no feed o vídeo aparece mudo e parado no primeiro quadro).
import {
  W, MG, C, txt, tRico, larg, fin, back, pop, opa, sobe, onda, particulas, tremor, varredura, icone, disco, pilula,
  clamp, lerp, inv, ease, kf, n2,
} from '../base.js';
import { HEROIS, avatar } from '../modelo.js';
import { fundoNoite, velocidade } from '../ludico.js';
import { cursor } from '../painelUI.js';

export const FUNDO = 'navy';
export const LEGENDA = true;

const f = n2;
const bump = (t, a, d) => Math.sin(inv(a, a + d, t) * Math.PI);   // sobe e desce dentro de [a, a + d]

// ---------- geometria ----------
const TIT = { y: 222, s: 62, lh: 69 };                 // título: 3 linhas
const WW = 440, WH = 652, WY = 436;                    // as duas telas (janelas claras)
const XA = MG, XB = W - MG - WW;                       // 72 e 568
const CAB = 80;                                        // cabeçalho do usuário
// coordenadas locais da janela (0..WW, 0..WH)
const AP = { x: 20, y: 96, w: 400, h: 304 };           // mini aplicativo: a "nova ferramenta"
const SB = 52;                                         // barra lateral do aplicativo
const BAR = { x: 105, w: 38, passo: 62, base: 312, max: 124 };
const TOCO = [30, 40, 34, 46, 38];                     // altura das barras antes de alguém usar (igual nas duas telas)
const ALVO = [0.5, 0.68, 0.6, 0.84, 1];                // altura final das barras na tela da Pessoa A
const BT = { y: 334, h: 46, x1: 88, x2: 256, w: 152 }; // dois botões
const SL = { x: 20, y: 414, w: 400, h: 64 };           // selo do treinamento
const MD = { x: 20, y: 492, w: 400, h: 140 };          // medidor "uso diário"
const PL = { x: 44, y: 146, w: 408, tit: 40, cab: 28, lin: 34, n: 5, rw: 34 };   // planilha (só na tela B)
PL.h = PL.tit + PL.cab + PL.lin * PL.n;
PL.cw = (PL.w - PL.rw) / 4;
const CEL = { r: 3, c: 1 };                            // célula ativa da planilha
const celXY = (r, c) => [PL.x + PL.rw + PL.cw * c, PL.y + PL.tit + PL.cab + PL.lin * r];
const ETQ = { y: 1108, h: 58 };                        // etiquetas "Adota" / "Volta para a planilha"
const GX = W / 2;                                      // vão entre as telas
const GY = [WY + AP.y + AP.h / 2, WY + SL.y + SL.h / 2, WY + MD.y + MD.h / 2];

// retângulo arredondado como caminho (para o pulso de luz que percorre a borda)
const rr = (x, y, w, h, r) => `M${f(x + r)},${f(y)} H${f(x + w - r)} a${r},${r} 0 0 1 ${r},${r} V${f(y + h - r)} a${r},${r} 0 0 1 ${-r},${r} H${f(x + r)} a${r},${r} 0 0 1 ${-r},${-r} V${f(y + r)} a${r},${r} 0 0 1 ${r},${-r}Z`;
const ret = (x, y, w, h, rx, attr) => `<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}" rx="${rx}" ${attr}/>`;
// pulso de luz que corre pela borda (u = posição 0..1 ao longo do contorno)
const pulsoBorda = (d, u, cor, sw, o = 1, len = 0.12) => (o <= 0.001 ? '' : `<path d="${d}" pathLength="1" fill="none" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${len} ${f(1 - len)}" stroke-dashoffset="${f(1 - (u % 1))}" opacity="${f(o)}"/>`);
// halo: contorno arredondado que abre em volta de uma peça e some (idade em s)
function halo(x, y, w, h, r, idade, cor, o = {}) {
  const u = idade / (o.d ?? 0.5);
  if (u <= 0 || u >= 1) return '';
  const g = (o.abre ?? 16) * ease.out(u);
  return ret(x - g, y - g, w + 2 * g, h + 2 * g, r + g, `fill="none" stroke="${cor}" stroke-width="${f((o.sw ?? 4) * (1 - u) + 0.5)}" opacity="${f(1 - u)}"`);
}
const checkPath = (cx, cy, k) => `M${f(cx - 5.5 * k)},${f(cy + 0.5 * k)} l${f(3.8 * k)},${f(3.8 * k)} l${f(7.2 * k)},${f(-8 * k)}`;

// ---------- uso diário (%): igual nas duas telas até a fala separar as duas ----------
function uso(tau, lado, T) {
  let v = 22 * ease.inOut(inv(T.tApp + 0.45, T.tApp + 1.25, tau)) + 18 * ease.inOut(inv(T.tSelo + 0.3, T.tSelo + 1.0, tau));
  if (lado === 'A') v += 52 * ease.out(inv(T.tVida + 0.05, T.tVida + 1.05, tau));
  else v *= 1 - ease.inOut(inv(T.mOut + 0.05, T.mPla - 0.1, tau));
  return v;
}

// ---------- peças da janela (coordenadas locais) ----------
// esqueleto cinza (tela ainda vazia): mesma planta do aplicativo, do selo e do medidor
function esqueleto(t, fase, oApp, oSelo, oMed, tGira) {
  const resp = 0.72 + 0.28 * Math.sin(t * 2.6 + fase);
  let s = '';
  if (oApp > 0.001) {
    let a = ret(AP.x, AP.y, AP.w, AP.h, 14, `fill="${C.gray20}" stroke="${C.line}" stroke-width="1.5"`)
      + ret(AP.x + 10, AP.y + 10, SB - 18, AP.h - 20, 9, `fill="${C.gray80}"`)
      + ret(88, 114, 168, 20, 10, `fill="${C.gray}"`) + ret(350, 114, 58, 20, 10, `fill="${C.gray40}"`);
    [40, 60, 48, 74, 56].forEach((h, i) => { a += ret(BAR.x + i * BAR.passo, BAR.base - h, BAR.w, h, 6, `fill="${C.gray80}" opacity="${f(0.6 + 0.4 * Math.sin(t * 2.6 + fase - i * 0.5))}"`); });
    a += ret(96, BAR.base, 308, 2, 1, `fill="${C.gray}"`)
      + ret(BT.x1, BT.y, BT.w, BT.h, 10, `fill="${C.gray80}"`) + ret(BT.x2, BT.y, BT.w, BT.h, 10, `fill="${C.gray40}"`);
    a += varredura('gc-brilho' + (fase ? 'B' : 'A'), AP.x, AP.y, AP.w, AP.h, ((t + fase * 0.35) % 1.9) / 1.0, 14);
    // "carregando": arco girando no meio da área da ferramenta, depois que as pessoas acendem
    const kSp = fin(t, tGira, 0.4);
    if (kSp > 0.001) {
      const cx = AP.x + SB + (AP.w - SB) / 2 - 4, cy = AP.y + 108, r = 20;
      a += opa(kSp, `<circle cx="${cx}" cy="${cy}" r="${r + 12}" fill="${C.gray20}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.gray}" stroke-width="5"/>`
        + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.blue}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${f(r * 1.9)} ${f(r * 6.283)}" transform="rotate(${f(t * 300 + fase * 40)} ${cx} ${cy})"/>`);
    }
    s += opa(oApp, a);
  }
  if (oSelo > 0.001) {
    s += opa(oSelo, ret(SL.x + 1, SL.y + 1, SL.w - 2, SL.h - 2, 12, `fill="none" stroke="${C.gray}" stroke-width="2" stroke-dasharray="7 8" stroke-dashoffset="${f(-t * 9)}"`)
      + `<circle cx="${SL.x + 36}" cy="${SL.y + SL.h / 2}" r="20" fill="${C.gray40}"/>`
      + ret(SL.x + 68, SL.y + SL.h / 2 - 9, 190, 18, 9, `fill="${C.gray40}" opacity="${f(resp)}"`));
  }
  if (oMed > 0.001) {
    s += opa(oMed, ret(MD.x, MD.y, MD.w, MD.h, 14, `fill="${C.gray20}" stroke="${C.line}" stroke-width="1.5"`)
      + ret(MD.x + 16, MD.y + 18, 120, 18, 9, `fill="${C.gray}"`)
      + ret(MD.x + 16, MD.y + 52, 92, 40, 10, `fill="${C.gray80}" opacity="${f(resp)}"`)
      + ret(MD.x + 196, MD.y + 40, 188, 52, 10, `fill="${C.gray40}"`)
      + ret(MD.x + 16, MD.y + 110, MD.w - 32, 12, 6, `fill="${C.gray}"`));
  }
  return s;
}

// mini aplicativo: barra lateral, título, gráfico de barras e dois botões. Idêntico nas duas telas.
// o: { uB: [5] crescimento das barras, kC: [5] checks, aperto (0..1 clique no botão), t }
function aplicativo(o) {
  const { x, y, w, h } = AP, t = o.t;
  let s = ret(x, y, w, h, 14, `fill="${C.gray20}" stroke="${C.line}" stroke-width="1.5"`);
  // barra lateral navy
  s += `<path d="M${x + 14},${y} H${x + SB} V${y + h} H${x + 14} a14,14 0 0 1 -14,-14 V${y + 14} a14,14 0 0 1 14,-14Z" fill="${C.navy}"/>`
    + `<path d="M${x + 16},${y + 26} h20 M${x + 16},${y + 33} h20 M${x + 16},${y + 40} h13" stroke="${C.white}" stroke-width="2.6" stroke-linecap="round"/>`
    + ret(x, y + 68, 4, 26, 2, `fill="${C.orange}"`);
  for (let i = 0; i < 4; i++) s += ret(x + 15, y + 70 + i * 40, 22, 22, 6, `fill="${C.white}" opacity="${i === 0 ? 1 : 0.26}"`);
  // título do aplicativo
  s += `<circle cx="94" cy="${y + 27}" r="5.5" fill="${C.orange}"/>` + txt('Nova ferramenta', 108, y + 35, { w: 700, s: 24, c: C.navy })
    + [0, 1, 2].map(i => `<circle cx="${f(x + w - 22 - i * 11)}" cy="${y + 27}" r="3" fill="${C.navy40}"/>`).join('');
  // gráfico
  s += `<path d="M96,${BAR.base - 62} H404 M96,${BAR.base - 124} H404" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="4 6"/>`
    + ret(96, BAR.base, 308, 2, 1, `fill="${C.gray}"`);
  for (let i = 0; i < 5; i++) {
    const u = o.uB[i], bx = BAR.x + i * BAR.passo;
    const viva = u > 0.9 ? 1 + 0.045 * Math.sin(t * 2.6 + i * 1.1) : 1;
    const hh = TOCO[i] + (ALVO[i] * BAR.max * viva - TOCO[i]) * u;
    s += ret(bx, BAR.base - hh, BAR.w, hh, 6, `fill="${C.blue40}"`);
    if (u > 0.001) s += ret(bx, BAR.base - hh, BAR.w, hh, 6, `fill="${C.blue}" opacity="${f(clamp(u * 2.5))}"`);
    const kc = o.kC[i];
    if (kc > 0.001) {
      const cy = BAR.base - hh - 18;
      s += pop(kc, bx + BAR.w / 2, cy, `<circle cx="${f(bx + BAR.w / 2)}" cy="${f(cy)}" r="11.5" fill="${C.white}" stroke="${C.blue}" stroke-width="2.5"/>`
        + `<path d="${checkPath(bx + BAR.w / 2 - 1, cy, 0.82)}" fill="none" stroke="${C.blue}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
  }
  // botões
  const ap = 1 - 0.07 * o.aperto;
  s += pop(ap, BT.x1 + BT.w / 2, BT.y + BT.h / 2, ret(BT.x1, BT.y, BT.w, BT.h, 10, `fill="${C.blue}"`) + txt('Registrar', BT.x1 + BT.w / 2, BT.y + 30.5, { w: 700, s: 21, c: C.white, a: 'middle' }))
    + ret(BT.x2, BT.y, BT.w, BT.h, 10, `fill="${C.white}" stroke="${C.navy40}" stroke-width="1.5"`) + txt('Consultar', BT.x2 + BT.w / 2, BT.y + 30.5, { w: 700, s: 21, c: C.navy, a: 'middle' });
  return s;
}

// selo "Treinamento concluído": cai girando, bate e assenta. Idêntico nas duas telas.
function carimbo(t, tS, semente) {
  const u = inv(tS, tS + 0.2, t);
  if (u <= 0) return '';
  const cx = SL.x + SL.w / 2, cy = SL.y + SL.h / 2;
  const sc = lerp(1.22, 1, ease.in(u)) * (1 - 0.045 * bump(t, tS + 0.2, 0.16));
  const rot = lerp(-10, -1.6, ease.out(u));
  const uChk = ease.out(inv(tS + 0.24, tS + 0.5, t));
  const corpo = ret(SL.x, SL.y, SL.w, SL.h, 12, `fill="${C.white}" stroke="${C.navy}" stroke-width="3"`)
    + ret(SL.x + 6, SL.y + 6, SL.w - 12, SL.h - 12, 8, `fill="none" stroke="${C.navy}" stroke-width="1.2" stroke-dasharray="3 4"`)
    + disco('capelo', SL.x + 38, cy, 21, { fundo: C.navy, c: C.white, sw: 2.6 })
    + txt('Treinamento concluído', SL.x + 70, cy + 8.5, { w: 700, s: 24, c: C.navy })
    + `<circle cx="${SL.x + SL.w - 36}" cy="${cy}" r="15" fill="${C.blue}"/>`
    + (uChk > 0 ? `<path d="${checkPath(SL.x + SL.w - 37, cy, 1)}" fill="none" stroke="${C.white}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - uChk)}"/>` : '');
  return opa(clamp(u * 3), `<g transform="translate(${cx} ${cy}) rotate(${f(rot)}) scale(${f(sc)}) translate(${-cx} ${-cy})">${corpo}</g>`)
    + halo(SL.x, SL.y, SL.w, SL.h, 12, t - (tS + 0.18), C.blue, { abre: 14, d: 0.45, sw: 5 })
    + particulas(semente, cx, cy, t - (tS + 0.18), { n: 6, v: 190, r: 4, d: 0.5, cores: [C.navy40, C.blue, C.orange] });
}

// medidor "uso diário": número que conta, linha do histórico que se desenha e barra de nível
function medidor(t, lado, T, t1) {
  const v = uso(t, lado, T), A = lado === 'A';
  const sobeA = A ? fin(t, T.tVida + 0.1, 0.3) : 0, cai = A ? 0 : fin(t, T.mOut + 0.1, 0.3);
  let s = ret(MD.x, MD.y, MD.w, MD.h, 14, `fill="${C.gray20}" stroke="${C.line}" stroke-width="1.5"`)
    + txt('USO DIÁRIO', MD.x + 16, MD.y + 33, { w: 700, s: 21, ls: 1.4, c: C.navy80 });
  const num = Math.round(v) + '%';
  s += txt(num, MD.x + 14, MD.y + 92, { f: 'L', w: 400, s: 54, c: C.navy });
  // seta de tendência ao lado do número
  const sx = MD.x + 14 + larg(num, 54, { f: 'L', w: 400 }) + 20, sy = MD.y + 72;
  if (sobeA > 0.001) s += pop(sobeA, sx, sy, `<path d="M${f(sx - 10)},${sy + 8} L${f(sx)},${sy - 9} L${f(sx + 10)},${sy + 8}Z" fill="${C.blue}" transform="translate(0 ${f(-2.5 * Math.abs(Math.sin(t * 3)))})"/>`);
  if (cai > 0.001) s += pop(cai, sx, sy, `<path d="M${f(sx - 10)},${sy - 8} L${f(sx)},${sy + 9} L${f(sx + 10)},${sy - 8}Z" fill="${C.orangeD}" transform="translate(0 ${f(2.5 * Math.abs(Math.sin(t * 3)))})"/>`);
  // histórico: a linha avança com o tempo da cena
  const ta = T.tApp + 0.45;
  if (t > ta) {
    const x0 = MD.x + 204, x1 = MD.x + MD.w - 22;
    const X = tau => lerp(x0, x1, inv(ta, t1 - 0.25, tau)), Y = val => MD.y + 94 - 0.68 * val;
    let d = '', n = 0;
    for (let tau = ta; tau < t; tau += 0.07) { const val = uso(tau, lado, T); d += (n++ ? 'L' : 'M') + f(X(tau)) + ',' + f(Y(val + (val > 4 ? Math.sin(tau * 9) * 1.6 : 0))) + ' '; }
    const vf = v + (v > 4 ? Math.sin(t * 9) * 1.6 : 0);
    d += (n ? 'L' : 'M') + f(X(t)) + ',' + f(Y(vf));
    const cor = A ? C.blue : (cai > 0.5 ? C.orangeD : C.blue);
    s += `<path d="M${x0},${MD.y + 94.5} H${x1}" stroke="${C.gray}" stroke-width="1.5" stroke-dasharray="3 5"/>`
      + `<path d="${d} L${f(X(t))},${MD.y + 94} L${x0},${MD.y + 94}Z" fill="${cor}" opacity=".16"/>`
      + `<path d="${d}" fill="none" stroke="${cor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<circle cx="${f(X(t))}" cy="${f(Y(vf))}" r="${f(5.5 + 1.2 * Math.sin(t * 6))}" fill="${cor}" stroke="${C.white}" stroke-width="2.5"/>`;
  }
  // barra de nível
  const tw = MD.w - 32;
  s += ret(MD.x + 16, MD.y + 110, tw, 12, 6, `fill="${C.gray}"`)
    + ret(MD.x + 16, MD.y + 110, tw * v / 100, 12, 6, `fill="${C.blue}"`);
  if (cai > 0.001) s += ret(MD.x + 16, MD.y + 110, tw * v / 100, 12, 6, `fill="${C.orange80}" opacity="${f(cai)}"`);
  return s;
}

// planilha antiga: barra de título cinza, cantos retos, grade, células laranja-20 e o cursor de texto piscando
function planilha(t, tP) {
  const { x, y, w, h, tit, cab, lin, n, rw, cw } = PL;
  const gy = y + tit + cab;
  let s = ret(x, y, w, h, 4, `fill="${C.white}"`)
    + `<path d="M${x},${y + tit} V${y + 4} a4,4 0 0 1 4,-4 H${x + w - 4} a4,4 0 0 1 4,4 V${y + tit}Z" fill="${C.gray}"/>`
    + icone('planilha', x + 24, y + tit / 2, 22, { c: C.navy, sw: 2.4 })
    + txt('controle_v7_FINAL.xls', x + 44, y + 27.5, { w: 700, s: 21, c: C.navy })
    + ret(x + w - 32, y + 10, 20, 20, 2, `fill="${C.gray20}" stroke="${C.navy80}" stroke-width="1.5"`)
    + `<path d="M${x + w - 27},${y + 15} l10,10 M${x + w - 17},${y + 15} l-10,10" stroke="${C.navy80}" stroke-width="2" stroke-linecap="round"/>`;
  // cabeçalhos de coluna e de linha
  s += ret(x, y + tit, w, cab, 0, `fill="${C.gray40}"`) + ret(x, gy, rw, lin * n, 0, `fill="${C.gray40}"`);
  ['A', 'B', 'C', 'D'].forEach((l, c) => { s += txt(l, x + rw + cw * (c + 0.5), y + tit + 21.5, { w: 700, s: 21, c: C.navy80, a: 'middle' }); });
  for (let r = 0; r < n; r++) s += txt(String(r + 1), x + rw / 2, gy + lin * r + 24.5, { s: 21, c: C.navy80, a: 'middle' });
  // células: a primeira linha é o cabeçalho da tabela (laranja-20); algumas células marcadas à mão
  const larguras = [[0.7, 0.55, 0.6, 0.5], [0.8, 0.45, 0.5, 0.62], [0.62, 0.5, 0.42, 0.7], [0.74, 0, 0.56, 0.48], [0.56, 0.4, 0.5, 0.66]];
  for (let r = 0; r < n; r++) for (let c = 0; c < 4; c++) {
    const [cx, cy] = celXY(r, c);
    const marc = r === 0 || (c === 2 && (r === 2 || r === 3)) || (c === 3 && r === 4);
    if (marc) s += ret(cx, cy, cw, lin, 0, `fill="${C.orange20}"`);
    const k = ease.out(inv(tP + 0.42 + (r * 4 + c) * 0.03, tP + 0.62 + (r * 4 + c) * 0.03, t));
    const lw = larguras[r][c] * (cw - 20);
    if (k > 0.001 && lw > 0) s += ret(c === 0 ? cx + 10 : cx + cw - 10 - lw * k, cy + lin / 2 - 5, lw * k, 10, 5, `fill="${r === 0 ? C.navy80 : C.navy40}" opacity="${r === 0 ? 0.85 : 0.7}"`);
  }
  let grade = '';
  for (let c = 0; c <= 4; c++) grade += `M${f(x + rw + cw * c)},${y + tit} V${y + h} `;
  for (let r = 0; r <= n; r++) grade += `M${x},${f(gy + lin * r)} H${x + w} `;
  s += `<path d="${grade}" stroke="${C.gray}" stroke-width="1.5"/>`;
  // célula ativa: contorno navy, valor digitado e cursor de texto piscando
  const [ax, ay] = celXY(CEL.r, CEL.c);
  const kAt = fin(t, tP + 0.62, 0.2);
  if (kAt > 0.001) {
    const valor = '1.250', nc = Math.floor(clamp((t - (tP + 0.78)) / 0.085, 0, valor.length));
    const dig = valor.slice(0, nc), tx = ax + 10;
    s += opa(kAt, ret(ax, ay, cw, lin, 0, `fill="${C.white}" stroke="${C.navy}" stroke-width="3"`)
      + `<rect x="${f(ax + cw - 4.5)}" y="${f(ay + lin - 4.5)}" width="8" height="8" fill="${C.navy}" stroke="${C.white}" stroke-width="1.5"/>`
      + (dig ? txt(dig, tx, ay + 24, { w: 700, s: 21, c: C.navy }) : '')
      + ((t * 1.9) % 1 < 0.58 ? ret(tx + (dig ? larg(dig, 21, { w: 700 }) : 0) + 2.5, ay + 6.5, 2.6, lin - 13, 1, `fill="${C.navy}"`) : ''));
  }
  s += ret(x, y, w, h, 4, `fill="none" stroke="${C.navy80}" stroke-width="2"`);
  return s;
}

// marcador no vão entre as telas: "=" (branco) ou "≠" (laranja)
function marcador(cy, k, dif, t) {
  if (k <= 0.001) return '';
  const r = 23, cx = GX, resp = dif ? 1 + 0.05 * Math.sin(t * 4) : 1;
  let b = `<circle cx="${cx}" cy="${f(cy)}" r="${r}" fill="${dif ? C.orange : C.white}" stroke="${C.navy}" stroke-width="5"/>`
    + `<path d="M${cx - 9.5},${f(cy - 5)} h19 M${cx - 9.5},${f(cy + 5)} h19${dif ? ` M${cx - 6.5},${f(cy + 12)} l13,-24` : ''}" stroke="${C.navy}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
  return pop(k * resp, cx, cy, b);
}

// etiqueta de resultado sob a tela
function etiquetaRes(str, cx, fill, tinta, ic) {
  const s = 28, wt = larg(str, s, { w: 700 }), w = wt + 88, x0 = cx - w / 2, cy = ETQ.y + ETQ.h / 2;
  return pilula(x0, ETQ.y, w, ETQ.h, fill)
    + `<circle cx="${f(x0 + 31)}" cy="${cy}" r="18" fill="${C.white}"/>` + ic(x0 + 31, cy)
    + txt(str, x0 + 60, cy + s * 0.35, { w: 700, s, c: tinta });
}

export function desenhar(t, ctx) {
  const { t0, t1 } = ctx;
  const mDuas = ctx.m('duas'), mFer = ctx.m('ferramenta'), mTre = ctx.m('treinamento');
  const mAdo = ctx.m('adota'), mOut = ctx.m('outra'), mPla = ctx.m('planilha');

  // ---------- relógio da cena ----------
  const T = {
    tAv: mDuas - 0.06,                 // avatares acendem
    tApp: mFer - 0.12,                 // a mesma ferramenta entra nas duas telas
    tSelo: mTre - 0.1,                 // o mesmo treinamento carimba as duas
    tUma: ctx.wa(8),                   // "Uma delas..."
    tVida: mAdo - 0.08,                // a tela da A ganha vida (clique no botão)
    mOut,                              // "A outra..."
    tPlan: ctx.wa(13) - 0.1,           // "...volta": a planilha desliza por cima
    mPla,                              // "...planilha"
    tFim: mPla + 0.2,                  // as duas telas lado a lado, em contraste
  };

  // foco: uma tela por vez; no fim, as duas a 100%
  const eA = ease.inOut(inv(T.tVida - 0.3, T.tVida + 0.25, t)), eB = ease.inOut(inv(mOut - 0.25, mOut + 0.25, t)), eF = ease.inOut(inv(T.tFim, T.tFim + 0.5, t));
  const kA = eA * (1 - eB), kB = eB * (1 - eF);            // câmera perto da A, perto da B
  const focoA = 1 - 0.4 * kB, focoB = 1 - 0.4 * kA;
  // abertura: o quadro 0 já está completo; no primeiro segundo o palco se aproxima e as telas assentam
  const kAbre = ease.inOut(inv(t0 + 0.05, t0 + 1.2, t));

  // ---------- fundo ----------
  let s = fundoNoite(t);

  // ---------- título (parado desde o primeiro quadro; a linha da vez fica acesa) ----------
  s += txt('MAPA DE PERFIL COGNITIVO', MG, 150, { w: 700, s: 21, ls: 2.4, c: C.navy20 });
  const jan = (a, b) => Math.min(ease.inOut(inv(a, a + 0.3, t)), 1 - ease.inOut(inv(b, b + 0.3, t)));
  const fl = [jan(mFer - 0.45, mTre - 0.45), jan(mTre - 0.45, T.tUma - 0.2), jan(T.tUma - 0.2, T.tFim)];
  const algum = Math.max(...fl);
  ['Mesma ferramenta.', 'Mesmo treinamento.', '*Resultados diferentes.*'].forEach((ln, i) => {
    s += opa(1 - 0.42 * (algum - fl[i]), tRico(ln, MG - 3, TIT.y + i * TIT.lh, { f: 'L', s: TIT.s, c: C.white, hi: C.orange }));
    if (fl[i] > 0.001) s += ret(MG - 30, TIT.y + i * TIT.lh - 44, 6, 46 * fl[i], 3, `fill="${C.orange}"`);
  });

  // ---------- uma tela ----------
  function tela(lado) {
    const A = lado === 'A', h = HEROIS[lado], fase = A ? 0 : 1.7;
    const tAv = T.tAv + (A ? 0 : 0.12), tApp = T.tApp + (A ? 0 : 0.07), tS = T.tSelo + (A ? 0 : 0.09);
    let b = '';
    // moldura
    b += `<g filter="url(#fx-sombra)">${ret(0, 0, WW, WH, 22, `fill="${C.white}" stroke="${C.gray}" stroke-width="2"`)}</g>`;
    const topoCab = `M0,${CAB} V22 a22,22 0 0 1 22,-22 H${WW - 22} a22,22 0 0 1 22,22 V${CAB}Z`;
    b += `<path d="${topoCab}" fill="${C.gray20}"/>`;
    const lampejo = bump(t, tAv, 0.7);
    if (lampejo > 0.001) b += `<path d="${topoCab}" fill="${A ? C.blue40 : C.orange40}" opacity="${f(0.75 * lampejo)}"/>`;
    b += `<path d="M0,${CAB} H${WW}" stroke="${C.gray}" stroke-width="2"/>`;
    // barra de carregamento: enche entre "duas pessoas" e a chegada da ferramenta (a mesma nas duas telas)
    const uCar = ease.inOut(inv(tAv + 0.45, tApp + 0.1, t)), oCar = Math.min(fin(t, tAv + 0.45, 0.2), 1 - fin(t, tApp + 0.3, 0.3));
    if (oCar > 0.001) b += opa(oCar, ret(0, CAB - 2, WW * uCar, 5, 0, `fill="${C.orange}"`) + `<circle cx="${f(WW * uCar)}" cy="${CAB + 0.5}" r="${f(5 + 1.5 * Math.sin(t * 9))}" fill="${C.orange}"/>`);
    b += [C.orange, C.blue40, C.navy40].map((c, i) => `<circle cx="${WW - 30 - i * 22}" cy="${CAB / 2}" r="6.5" fill="${c}"/>`).join('');
    // cabeçalho do usuário: avatar apagado (lugar reservado) e, em "duas", aceso na cor da pessoa
    const kOn = back(t, tAv, 0.5), ax = 48, ay = CAB / 2;
    if (kOn < 0.999) {
      b += avatar(ax, ay, { r: 27, cor: C.gray, c: C.navy80, sw: 2.8 })
        + `<circle cx="${ax}" cy="${ay}" r="32" fill="none" stroke="${A ? C.blue : C.orange80}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="7 9" transform="rotate(${f(t * 40 * (A ? 1 : -1))} ${ax} ${ay})" opacity="${f(1 - clamp(kOn))}"/>`;
    }
    b += onda(ax, ay, t - (tAv + 0.08), { c: h.cor, r0: 27, r1: 20, d: 0.55, sw: 5 })
            + avatar(ax, ay, { r: 27, cor: h.cor, c: A ? C.white : C.navy, k: kOn * (1 + 0.02 * Math.sin(t * 2.2 + fase)), u: inv(tAv + 0.05, tAv + 0.55, t), sw: 2.8 });
    b += txt(h.nome, 88, 37, { w: 700, s: 26, c: C.navy }) + txt('Financeiro', 88, 63, { s: 21, c: C.navy80 });

    // conteúdo: esqueleto -> ferramenta, selo e medidor
    const uApp = inv(tApp, tApp + 0.6, t), kApp = ease.out5(uApp);
    const kMed = fin(t, tApp + 0.22, 0.4);
    b += esqueleto(t, fase, 1 - fin(t, tApp + 0.05, 0.3), 1 - fin(t, tS + 0.12, 0.12), 1 - fin(t, tApp + 0.2, 0.25), tAv + 0.5);
    if (kApp > 0.001) {
      const dir = A ? 1 : -1;
      const uB = ALVO.map((_, i) => (A ? back(t, T.tVida + 0.06 + i * 0.085, 0.5) : 0));
      const kC = ALVO.map((_, i) => (A ? back(t, T.tVida + 0.5 + i * 0.09, 0.34) : 0));
      let app = aplicativo({ uB, kC, aperto: A ? bump(t, T.tVida - 0.02, 0.26) + (t > T.tVida + 1.1 ? bump((t - T.tVida - 1.1) % 1.15, 0, 0.26) : 0) : 0, t });
      app += varredura('gc-var' + lado, AP.x, AP.y, AP.w, AP.h, inv(tApp + 0.5, tApp + 1.15, t), 14);
      // pulso de luz na borda da ferramenta: uma volta na chegada; na tela da A, segue correndo depois de "adota"
      const dBorda = rr(AP.x, AP.y, AP.w, AP.h, 14);
      app += pulsoBorda(dBorda, 0.1 + 1.0 * ease.inOut(inv(tApp + 0.35, tApp + 1.5, t)), C.orange, 4, Math.min(fin(t, tApp + 0.35, 0.15), 1 - fin(t, tApp + 1.3, 0.25)), 0.16);
      if (A) app += pulsoBorda(dBorda, (t - T.tVida) * 0.42, C.blue, 4, fin(t, T.tVida + 0.1, 0.3) * 0.9, 0.14);
      const mov = `<g transform="translate(${f((1 - kApp) * dir * 440)} 0)">${app}</g>`
        + opa(0.5, velocidade(8, AP.y + 30, WW - 16, AP.h - 60, uApp < 0.6 ? uApp / 0.6 : 1, { seed: A ? 4 : 9, n: 4, cor: C.blue20 }));
      b += `<clipPath id="gc-clip${lado}"><rect x="3" y="${CAB + 2}" width="${WW - 6}" height="${WH - CAB - 6}" rx="12"/></clipPath><g clip-path="url(#gc-clip${lado})">${mov}</g>`;
    }
    if (kMed > 0.001) b += sobe(kMed, medidor(t, lado, T, t1), 24);
    b += carimbo(t, tS, A ? 31 : 47);

    // só na tela B: a ferramenta fica de lado e a planilha desliza por cima
    if (!A) {
      const kO = fin(t, T.tPlan + 0.5, 0.4);
      if (kO > 0.001) b += ret(0, 0, WW, WH, 22, `fill="none" stroke="${C.orange80}" stroke-width="4" opacity="${f(kO * (0.75 + 0.25 * Math.sin(t * 2.4 + 1)))}"`);
      const uP = inv(T.tPlan, T.tPlan + 0.58, t), kP = ease.back(uP);
      const apaga = ease.inOut(inv(mOut + 0.1, T.tPlan + 0.3, t));
      if (apaga > 0.001) b += ret(AP.x - 1, AP.y - 1, AP.w + 2, AP.h + 2, 14, `fill="${C.white}" opacity="${f(0.62 * apaga)}"`);
      if (uP > 0) {
        const px = PL.x + PL.w / 2, py = PL.y + PL.h / 2, flut = Math.sin(t * 1.7) * 1.5;
        b += `<g clip-path="url(#gc-clipB)">${opa(0.6, velocidade(PL.x + 60, PL.y + 20, PL.w - 80, PL.h - 40, uP, { seed: 6, n: 5, cor: C.orange40 }))}</g>`;
        b += opa(clamp(uP * 4), `<g transform="translate(${f(px + (1 - kP) * 330)} ${f(py + (1 - kP) * 34 + flut)}) rotate(${f(lerp(7, -1.6, kP))}) translate(${-px} ${-py})">`
          + `<g filter="url(#fx-sombra)">${ret(PL.x, PL.y, PL.w, PL.h, 4, `fill="${C.white}"`)}</g>` + planilha(t, T.tPlan) + `</g>`);
      }
    }
    // tela A depois de "adota": borda azul acesa (um único brilho)
    if (A) {
      const kG = fin(t, T.tVida + 0.05, 0.45);
      if (kG > 0.001) {
        b += `<g filter="url(#fx-glow)" opacity="${f(kG * (0.78 + 0.22 * Math.sin(t * 2.4)))}">${ret(0, 0, WW, WH, 22, `fill="none" stroke="${C.blue80}" stroke-width="5"`)}`
          + pulsoBorda(rr(0, 0, WW, WH, 22), (t - T.tVida) * 0.22, C.white, 5, 1, 0.09) + `</g>`;
      }
    }
    // "Uma delas...": as duas bordas piscam, uma depois da outra
    const pisca = bump(t, T.tUma + (A ? 0 : 0.17), 0.34);
    if (pisca > 0.001) b += ret(-5, -5, WW + 10, WH + 10, 26, `fill="none" stroke="${C.white}" stroke-width="5" opacity="${f(0.85 * pisca)}"`);

    // cursor do mouse: as duas pessoas fazem o mesmo gesto até a fala separar as duas
    const kCur = fin(t, tApp + 0.55, 0.3);
    if (kCur > 0.001) {
      const base = [[tApp + 0.5, [400, 452]], [tApp + 1.15, [312, 206]], [tS - 0.1, [306, 212]], [tS + 0.75, [356, 190]], [T.tVida - 0.5, [352, 194]]];
      const [acx, acy] = celXY(CEL.r, CEL.c);
      const keys = A
        ? [...base, [T.tVida - 0.06, [BT.x1 + 127, BT.y + 22]]]
        : [...base, [mOut + 0.02, [352, 194]], [mOut + 0.42, [BT.x1 + 120, BT.y - 30]], [T.tPlan + 0.05, [BT.x1 + 132, BT.y - 38]], [T.tPlan + 0.62, [acx + PL.cw - 22, acy + 20]], [T.tPlan + 0.8, [acx + PL.cw - 22, acy + 20]], [T.tPlan + 1.2, [acx + PL.cw + 26, acy + 44]]];
      let [cx, cy] = kf(t, keys);
      cx += Math.sin(t * 1.3 + fase) * 3; cy += Math.cos(t * 1.1 + fase) * 2.4;
      if (!A) cx += tremor(t, mOut + 0.42, 0.4, 7)[0];
      const clique = A ? (t < T.tVida + 1.1 ? inv(T.tVida - 0.03, T.tVida + 0.42, t) : ((t - T.tVida - 1.1) % 1.15) / 0.45) : inv(T.tPlan + 0.62, T.tPlan + 1.05, t);
      b += opa(kCur, cursor(cx, cy, { clique, s: 0.95 }));
    }

    // posição da janela: flutua de leve, inclinada ±2°; a tela em foco fica reta
    const kFoco = A ? kA : kB;
    const rot = (A ? -2 : 2) * (1 - 0.8 * kFoco) * (1 + 0.55 * (1 - kAbre));
    const esc = 1 - 0.04 * (A ? kB : kA);                   // a tela fora de foco recua (profundidade)
    const [qx, qy] = tremor(t, tS + 0.19, 0.28, 5);
    const dy = Math.sin(t * 1.15 + fase) * 3.2 + qy, dx = qx;
    return `<g transform="translate(${f((A ? XA : XB) + WW / 2 + dx)} ${f(WY + WH / 2 + dy)}) rotate(${f(rot)}) scale(${f(esc)}) translate(${-WW / 2} ${-WH / 2})">${b}</g>`;
  }

  // ---------- palco ----------
  let p = '';
  // luz atrás das telas: azul atrás da A quando ela adota, laranja atrás da B quando a planilha volta
  const luzA = fin(t, T.tVida + 0.05, 0.6), luzB = fin(t, T.tPlan + 0.35, 0.6);
  if (luzA > 0.001) p += `<circle cx="${XA + WW / 2}" cy="${WY + WH / 2}" r="${f(470 + 16 * Math.sin(t * 2))}" fill="url(#g-azul)" opacity="${f(0.85 * luzA)}"/>`;
  if (luzB > 0.001) p += `<circle cx="${XB + WW / 2}" cy="${WY + WH / 2}" r="${f(450 + 16 * Math.sin(t * 2 + 1))}" fill="url(#g-laranja)" opacity="${f(0.7 * luzB)}"/>`;
  p += opa(focoA, tela('A')) + opa(focoB, tela('B'));

  // marcadores no vão: "=" ferramenta, "=" treinamento, "≠" resultado
  const tM = [T.tApp + 0.72, T.tSelo + 0.42, mPla + 0.28];
  // fio que liga os marcadores: desce devagar até o próximo e leva um pulso de luz
  const yFio = GY[0] + (GY[1] - GY[0]) * ease.inOut(inv(tM[0] + 0.3, tM[1] + 0.05, t)) + (GY[2] - GY[1]) * ease.inOut(inv(tM[1] + 0.3, tM[2] + 0.05, t));
  if (yFio > GY[0] + 24) {
    p += `<path d="M${GX},${f(GY[0] + 23)} V${f(yFio)}" stroke="${C.navy40}" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9" opacity=".9"/>`;
    const up = (t * 0.8) % 1, yp = GY[0] + 23 + (yFio - GY[0] - 23) * ease.inOut(up);
    p += `<circle cx="${GX}" cy="${f(yp)}" r="4" fill="${C.white}" opacity="${f(0.9 * Math.sin(up * Math.PI))}"/>`;
  }
  tM.forEach((tm, i) => {
    p += onda(GX, GY[i], t - (tm + 0.12), { c: i === 2 ? C.orange : C.white, r0: 23, r1: 46, d: 0.55, sw: 4 });
    p += marcador(GY[i], back(t, tm, 0.42), i === 2, t);
  });

  // lugares reservados dos resultados (desde o primeiro quadro), que viram as etiquetas
  const lugar = (cx, o) => (o <= 0.001 ? '' : opa(o, ret(cx - 104, ETQ.y + 4, 208, ETQ.h - 8, (ETQ.h - 8) / 2, `fill="rgba(255,255,255,.05)" stroke="${C.navy40}" stroke-width="2" stroke-dasharray="7 8" stroke-dashoffset="${f(-t * 9)}"`)
    + txt('Resultado', cx - 14, ETQ.y + ETQ.h / 2 + 8, { s: 24, c: C.navy20, a: 'middle' })
    + `<circle cx="${cx + 58}" cy="${ETQ.y + ETQ.h / 2}" r="13" fill="none" stroke="${C.navy20}" stroke-width="2"/>` + txt('?', cx + 58, ETQ.y + ETQ.h / 2 + 7.5, { w: 700, s: 21, c: C.navy20, a: 'middle' })));
  p += lugar(XA + WW / 2, (1 - fin(t, T.tVida + 0.2, 0.2)) * focoA) + lugar(XB + WW / 2, (1 - fin(t, mPla, 0.2)) * focoB);

  // etiquetas de resultado
  const tEA = T.tVida + 0.24, tEB = mPla + 0.06, cxA = XA + WW / 2, cxB = XB + WW / 2, eyc = ETQ.y + ETQ.h / 2;
  const wEA = larg('Adota', 28, { w: 700 }) + 88, wEB = larg('Volta para a planilha', 28, { w: 700 }) + 88;
  p += halo(cxA - wEA / 2, ETQ.y, wEA, ETQ.h, ETQ.h / 2, t - (tEA + 0.14), C.blue40, { abre: 18, d: 0.55, sw: 5 })
    + particulas(71, cxA, eyc, t - (tEA + 0.08), { n: 10, v: 120, r: 5, d: 0.6, cores: [C.blue40, C.white, C.blue] });
  p += opa(focoA, pop(back(t, tEA, 0.45), cxA, eyc, etiquetaRes('Adota', cxA, C.blue, C.white,
    (x, y) => `<path d="${checkPath(x - 1, y, 1.15)}" fill="none" stroke="${C.blue}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`)));
  p += halo(cxB - wEB / 2, ETQ.y, wEB, ETQ.h, ETQ.h / 2, t - (tEB + 0.14), C.orange, { abre: 18, d: 0.55, sw: 5 });
  p += pop(back(t, tEB, 0.45), cxB, eyc, etiquetaRes('Volta para a planilha', cxB, C.orange80, C.navy,
    (x, y) => icone('planilha', x, y, 22, { c: C.navy, sw: 2.4 })));

  // ---------- câmera: aproxima da tela da vez (o ponto fixo fica do lado dela) e abre no fim ----------
  const zA = 1 + 0.05 * kA, zB = 1 + 0.05 * kB;
  const z0 = lerp(0.962, 1, kAbre);
  s += `<g transform="translate(540 800) scale(${f(z0)}) translate(-540 -800)"><g transform="translate(190 800) scale(${f(zA)}) translate(-190 -800)"><g transform="translate(890 800) scale(${f(zB)}) translate(-890 -800)">${p}</g></g></g>`;
  return s;
}
