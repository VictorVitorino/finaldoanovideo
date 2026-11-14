// Cena "acoes" (47,18–57,95 s), navy: "Com ele, a Gestão da Mudança deixa de ser receita única. Escuta para quem
// resiste. Prática para quem experimenta. Palco para quem multiplica."
// Versão limpa, 16:9, esquema A (duas colunas).
// ESQUERDA (x 96–736): título em três linhas, o cartão de apoio que troca no lugar e a salvaguarda em duas linhas.
// DIREITA (x 816–1824, y 150–900): a janela do DASHBOARD (três indicadores + mapa de calor áreas x régua) e, sob as
// colunas, a linha dos chips de ação.
// 1. A janela entra (fade + subida curta), os indicadores contam (20%, 25, 4) e o mapa de calor entra em cascata.
// 2. Entra o cartão "RECEITA ÚNICA"; em 'receita' ele é riscado em laranja e some.
// 3. Em 'escuta', 'pratica' e 'palco' o cursor clica no cabeçalho da coluna (Resiste, Experimenta, Multiplica):
//    a coluna ganha um contorno simples, as outras recuam e o cartão da ação da vez ocupa o lugar do anterior.
//    Cada ação já dita vira um chip sob a sua coluna.
// 4. No fim o foco volta para o mapa todo e os cinco chips (Escuta, Exemplo, Prática, Reforço, Palco) ficam lado a lado.
// Sem câmera, sem brilhos, sem rastros; nada se mexe depois de entrar. Sem personagens: pessoas são números nas células.
import { MG, C, txt, tRico, larg, fin, fout, back, sobe, mover, pop, opa, tracar, conta, selo, icone, titulo, inv, ease, n2 } from '../base.js';
import { NIVEIS } from '../modelo.js';
import { fundoNoite } from '../ludico.js';
import { janela, geoCalor, calor, cursor } from '../painelUI.js';

const f = n2;
export const FUNDO = 'navy';
export const CHIP = '04 · A ação';
export const LEGENDA = true;

// ---------- geometria 16:9 (esquema A) ----------
// coluna de texto: x 96–736
const COL = { x: MG, w: 640 };
const YTIT = 250, LH = 72 * 1.12;                                 // título em três linhas (Light 72)
const CARD = { x: COL.x, y: 524, w: COL.w, h: 200 };              // cartão de apoio (receita única e ação da vez)
const YPE = [858, 894];                                           // salvaguarda, em duas linhas (28 px)
// coluna do visual: x 816–1824, y 150–900
const WIN = { x: 816, y: 150, w: 1008, h: 676 };                  // janela do dashboard
const KW = 1.25;                                                  // escala da moldura: título da janela 24 -> 30 px
const BAR = 58 * KW, PAD = 20;                                    // barra de título e respiro interno (px finais)
const KP = { x: WIN.x + PAD, y: WIN.y + BAR + 22, w: WIN.w - 2 * PAD, h: 116, gap: 20 };   // linha dos três indicadores
// mapa de calor: desenhado em geometria menor e ampliado KH vezes (cabeçalhos 19 -> 26,2 px; áreas 22 -> 30,4; números 28 -> 38,6)
const KH = 1.38;
// (o calor() recua rótulos e células 4 px da própria caixa: a caixa cresce 4 px x KH de cada lado para tudo alinhar com os indicadores)
const HEAT = { x: WIN.x + PAD - 4 * KH, y: KP.y + KP.h + 20, w: WIN.w - 2 * PAD + 8 * KH, h: 426 };
const GC = geoCalor(0, 0, HEAT.w / KH, HEAT.h / KH, { rotW: 126, cab: 46 });
const colX = n => HEAT.x + KH * (GC.rotW + GC.cw * n);            // x final da coluna n
const CWF = KH * GC.cw;                                           // largura final de uma coluna
const SLOT = { y: 844, h: 56, w: CWF - 8 * KH };                      // chips de ação, um sob cada coluna
const slotX = i => colX(i) + 4 * KH;
const SEQ = [0, 2, 4];                                            // marcas que a fala chama: Resiste, Experimenta, Multiplica
const TELA = '#0F3A5B';                                           // fundo sólido do cartão sobre o navy
const VEU = '#06304F';                                            // véu que recua as colunas fora de foco
const TIT = 'Mapa de Adoção · Onda 1';


// ---------- indicador: só rótulo e número ----------
function indicador(x, y, w, h, rot, valor, k) {
  if (k <= 0.001) return '';
  return sobe(k, `<rect x="${f(x)}" y="${y}" width="${f(w)}" height="${h}" rx="16" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>`
    + txt(rot.toUpperCase(), x + 24, y + 40, { w: 700, s: 26, ls: 1.2, c: C.blue40 })
    + txt(valor, x + 24, y + h - 16, { f: 'L', w: 400, s: 56, c: C.white }), 14);
}

// ---------- cartão "receita única": ícone, duas linhas e o risco ----------
const CIR = { dx: 88, r: 52 }, TXC = 172, SN = 44, SD = 30;      // disco do ícone, início do texto, corpo do nome e da definição
function receita(t, tX) {
  const { x, y, w, h } = CARD, cy = y + h / 2, tx = x + TXC, wt = larg('RECEITA ÚNICA', SN, { w: 700, ls: 1.5 });
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${C.gray20}"/>`
    + `<circle cx="${x + CIR.dx}" cy="${cy}" r="${CIR.r}" fill="${C.blue20}"/>` + icone('capelo', x + CIR.dx, cy, 64, { c: C.navy, sw: 3.4 })
    + txt('RECEITA ÚNICA', tx, y + 88, { w: 700, s: SN, ls: 1.5, c: C.navy })
    + txt('o mesmo treinamento para todos', tx, y + 136, { s: SD, c: C.navy80 })
    + tracar(`M${tx - 12},${y + 73} L${f(tx + wt + 12)},${y + 73}`, ease.out(inv(tX, tX + 0.35, t)), { c: C.orange, sw: 6 });
}

// ---------- cartão da ação da vez: "Resiste -> Escuta" + o que fazer ----------
function cartaoAcao(i) {
  const n = NIVEIS[i], { x, y, w, h } = CARD, cy = y + h / 2, tx = x + TXC;
  const w1 = larg(n.rot, SN, { w: 700 }), ax = tx + w1 + 18, ay = y + 73;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${TELA}" stroke="rgba(255,255,255,.22)" stroke-width="2"/>`
    + `<circle cx="${x + CIR.dx}" cy="${cy}" r="${CIR.r}" fill="${n.cor}"${n.cor === C.navy ? ` stroke="${C.blue40}" stroke-width="2.5"` : ''}/>`
    + icone(n.icAcao, x + CIR.dx, cy, 62, { c: n.tx, sw: 3.4 })
    + txt(n.rot, tx, y + 88, { w: 700, s: SN, c: C.white })
    + `<path d="M${f(ax)},${ay} L${f(ax + 42)},${ay} M${f(ax + 28)},${ay - 13} L${f(ax + 42)},${ay} L${f(ax + 28)},${ay + 13}" fill="none" stroke="${C.blue40}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`
    + txt(n.acao, ax + 62, y + 88, { w: 700, s: SN, c: C.orange })
    + txt(n.acaoDef, tx, y + 136, { s: SD, c: C.blue40 });
}

// ---------- chip de ação (pílula na cor da marca) ----------
function chip(i, k) {
  if (k <= 0.001) return '';
  const n = NIVEIS[i], x = slotX(i), cx = x + SLOT.w / 2, cy = SLOT.y + SLOT.h / 2;
  return opa(Math.min(1, k * 1.6), pop(0.85 + 0.15 * k, cx, cy,
    `<rect x="${f(x)}" y="${SLOT.y}" width="${f(SLOT.w)}" height="${SLOT.h}" rx="${SLOT.h / 2}" fill="${n.cor}"${n.cor === C.navy ? ` stroke="${C.blue40}" stroke-width="2.5"` : ''}/>`
    + txt(n.acao, cx, cy + 10, { w: 700, s: 28, c: n.tx, a: 'middle' })));
}

export function desenhar(t, ctx) {
  const { t0, m } = ctx;
  const tW = t0 + 0.15;                                      // a janela entra
  const tCal = t0 + 0.45;                                    // o mapa de calor entra em cascata
  const tR = t0 + 1.5;                                       // entra o cartão da receita única
  const tX = m('receita') - 0.1;                             // é riscado
  const tT = m('receita') + 0.55;                            // some ("única")
  const tA = [m('escuta') - 0.1, m('pratica') - 0.1, m('palco') - 0.1];   // cada ação
  const tClk = tA.map(x => x - 0.04);                        // os três cliques do cursor
  const tSai = [tA[1] - 0.28, tA[2] - 0.28];                 // o cartão anterior sai na pausa da fala e vira chip
  const tAll = m('palco') + 0.8;                             // os cinco chips; o foco volta para o mapa todo
  const emFoco = fin(t, tA[0], 0.35) * fout(t, tAll, 0.45);  // há uma coluna em foco
  // quanto cada coluna está selecionada (0..1)
  const sel = [fin(t, tA[0], 0.25) * fout(t, tA[1], 0.25), 0, fin(t, tA[1], 0.25) * fout(t, tA[2], 0.25), 0, fin(t, tA[2], 0.25) * fout(t, tAll, 0.3)];

  // ---------- janela do dashboard ----------
  // moldura ampliada KW vezes (título 30 px); o conteúdo é desenhado em px finais
  let win = mover(WIN.x, WIN.y, janela(0, 0, WIN.w / KW, WIN.h / KW, { titulo: TIT }).svg, 0, KW);
  {
    const esc = 1.9, ws = (larg('ILUSTRATIVO', 14, { w: 700, ls: 2.4 }) + 22) * esc;      // selo: 14 -> 26,6 px
    win += mover(WIN.x + WIN.w - PAD - ws, WIN.y + (BAR - 26 * esc) / 2, selo('Ilustrativo', 0, 0), 0, esc);
  }
  // indicadores (recuam enquanto uma coluna está em foco)
  {
    const kw = (KP.w - 2 * KP.gap) / 3;
    const itens = [
      ['Índice de adoção', conta(20, inv(t0 + 0.6, t0 + 1.5, t)) + '%'],
      ['Pessoas', conta(25, inv(t0 + 0.7, t0 + 1.5, t))],
      ['Áreas', conta(4, inv(t0 + 0.8, t0 + 1.4, t))],
    ];
    let ks = '';
    itens.forEach(([rot, valor], i) => { ks += indicador(KP.x + i * (kw + KP.gap), KP.y, kw, KP.h, rot, valor, fin(t, t0 + 0.4 + i * 0.08, 0.4)); });
    win += opa(1 - 0.5 * emFoco, ks);
  }
  // mapa de calor (geometria menor, ampliada KH vezes; véu e contorno na mesma geometria)
  {
    const uC = inv(tCal, tCal + 1.0, t);
    let h = '';
    if (uC > 0) h += calor(GC, { onda: 0, u: uC });
    for (let n = 0; n < 5; n++) {
      const x = GC.rotW + GC.cw * n;
      // véu sobre as colunas fora de foco
      const v = 0.6 * emFoco * (1 - sel[n]);
      if (v > 0.004) h += `<rect x="${f(x)}" y="-2" width="${f(GC.cw + 0.4)}" height="${f(GC.h + 1.5)}" fill="${VEU}" opacity="${f(v)}"/>`;
      // contorno simples na coluna em foco
      if (sel[n] > 0.004) h += `<rect x="${f(x)}" y="-3" width="${f(GC.cw)}" height="${f(GC.h + 3)}" rx="10" fill="none" stroke="${C.white}" stroke-width="2.4" opacity="${f(sel[n])}"/>`;
    }
    if (h) win += mover(HEAT.x, HEAT.y, h, 0, KH);
  }

  let s = fundoNoite(t);
  s += titulo(['Cada marca', 'pede uma *ação*', '*diferente*'], COL.x, YTIT, t, t0 + 0.15, { escuro: true, lh: LH });
  s += sobe(fin(t, tW, 0.45), win, 24);

  // ---------- salvaguarda ----------
  {
    const o = { s: 28, c: C.navy20, hi: C.white, hw: 700 };
    s += sobe(fin(t, tR + 0.2, 0.4), tRico('*Quem age:* patrocinador, gestores diretos', COL.x, YPE[0], o) + tRico('e rede de multiplicadores.', COL.x, YPE[1], o), 12);
  }

  // ---------- receita única: entra, é riscada e some ----------
  if (t >= tR && t < tT + 0.4) {
    const u = ease.inOut(inv(tT, tT + 0.35, t));
    s += opa(1 - u, `<g transform="translate(0 ${f(14 * u)})">${sobe(fin(t, tR, 0.4), receita(t, tX), 16)}</g>`);
  }

  // ---------- chips de ação: cada ação já dita fica sob a sua coluna; no fim, as cinco ----------
  {
    const tChip = [tSai[0] + 0.05, tAll, tSai[1] + 0.05, tAll + 0.07, tAll + 0.14];
    for (let i = 0; i < 5; i++) s += chip(i, back(t, tChip[i], 0.4));
  }

  // ---------- cartão da ação da vez ----------
  SEQ.forEach((n, j) => {
    const tIn = tA[j], tOut = j < 2 ? tSai[j] : 1e6;
    if (t < tIn || t > tOut + 0.3) return;
    s += opa(fout(t, tOut, 0.25), sobe(fin(t, tIn, 0.35), cartaoAcao(n), 16));
  });

  // ---------- cursor: aparece junto do cabeçalho, clica e some (três cliques) ----------
  tClk.forEach((tc, j) => {
    const oc = fin(t, tc - 0.45, 0.2) * fout(t, tc + 0.5, 0.25);
    if (oc <= 0.001) return;
    const x = colX(SEQ[j]) + CWF / 2 + 30, y = HEAT.y + 44, e = 1 - ease.out(inv(tc - 0.45, tc - 0.04, t)), u = inv(tc, tc + 0.4, t);
    s += opa(oc, cursor(x + 14 * e, y + 56 * e, { clique: u < 1 ? u : 0, s: 1.5 }));
  });
  return s;
}
