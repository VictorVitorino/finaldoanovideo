// Cena "acoes" (47,22–57,99 s), navy: "Com ele, a Gestão da Mudança deixa de ser receita única. Escuta para quem
// resiste. Prática para quem experimenta. Palco para quem multiplica."
// Versão limpa. Três blocos por momento: título, DASHBOARD (três indicadores + mapa de calor áreas x régua) e um
// cartão de apoio, mais a salvaguarda em uma linha.
// 1. A janela entra (fade + subida curta), os indicadores contam (20%, 25, 4) e o mapa de calor entra em cascata.
// 2. Entra o cartão "RECEITA ÚNICA"; em 'receita' ele é riscado em laranja e some.
// 3. Em 'escuta', 'pratica' e 'palco' o cursor clica no cabeçalho da coluna (Resiste, Experimenta, Multiplica):
//    a coluna ganha um contorno simples, as outras recuam e o cartão da ação da vez ocupa o lugar do anterior.
//    Cada ação já dita vira um chip sob a sua coluna.
// 4. No fim o foco volta para o mapa todo e os cinco chips (Escuta, Exemplo, Prática, Reforço, Palco) ficam lado a lado.
// Sem câmera, sem brilhos, sem rastros; nada se mexe depois de entrar. Sem personagens: pessoas são números nas células.
import { W, MG, C, txt, tRico, larg, fin, fout, back, sobe, mover, pop, opa, tracar, conta, selo, icone, titulo, inv, ease, n2 } from '../base.js';
import { NIVEIS } from '../modelo.js';
import { fundoNoite } from '../ludico.js';
import { janela, geoCalor, calor, cursor } from '../painelUI.js';

const f = n2;
export const FUNDO = 'navy';
export const CHIP = '04 · A ação';
export const LEGENDA = true;

// ---------- geometria (margem lateral de 72 px) ----------
const WIN = { x: MG, y: 340, w: W - 2 * MG, h: 524 };             // janela do dashboard
const KP = { x: WIN.x + 24, y: 414, w: WIN.w - 48, h: 100, gap: 16 };   // linha dos três indicadores
const GC = geoCalor(WIN.x + 24, 532, WIN.w - 48, 312, { rotW: 130, cab: 46 });   // mapa de calor
const colX = n => GC.x + GC.rotW + GC.cw * n;
const SLOT = { y: 892, h: 50, w: GC.cw - 8 };                     // chips de ação, um sob cada coluna
const slotX = i => colX(i) + 4;
const CARD = { x: MG, y: 972, w: W - 2 * MG, h: 128 };            // cartão de apoio (receita única e ação da vez)
const YPE = 1156;                                                 // salvaguarda, em uma linha
const SEQ = [0, 2, 4];                                            // marcas que a fala chama: Resiste, Experimenta, Multiplica
const TELA = '#0F3A5B';                                           // fundo sólido do cartão sobre o navy
const VEU = '#06304F';                                            // véu que recua as colunas fora de foco
const TIT = 'Mapa de Adoção · Onda 1';


// ---------- indicador: só rótulo e número ----------
function indicador(x, y, w, h, rot, valor, k) {
  if (k <= 0.001) return '';
  return sobe(k, `<rect x="${f(x)}" y="${y}" width="${f(w)}" height="${h}" rx="14" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>`
    + txt(rot.toUpperCase(), x + 20, y + 34, { w: 700, s: 22, ls: 1.2, c: C.blue40 })
    + txt(valor, x + 20, y + h - 16, { f: 'L', w: 400, s: 46, c: C.white }), 14);
}

// ---------- cartão "receita única": ícone, duas linhas e o risco ----------
function receita(t, tX) {
  const { x, y, w, h } = CARD, cy = y + h / 2, tx = x + 146, wt = larg('RECEITA ÚNICA', 34, { w: 700, ls: 1.5 });
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${C.gray20}"/>`
    + `<circle cx="${x + 78}" cy="${cy}" r="40" fill="${C.blue20}"/>` + icone('capelo', x + 78, cy, 50, { c: C.navy, sw: 3.4 })
    + txt('RECEITA ÚNICA', tx, cy - 4, { w: 700, s: 34, ls: 1.5, c: C.navy })
    + txt('o mesmo treinamento para todos', tx, cy + 32, { s: 26, c: C.navy80 })
    + tracar(`M${tx - 10},${cy - 16} L${f(tx + wt + 10)},${cy - 16}`, ease.out(inv(tX, tX + 0.35, t)), { c: C.orange, sw: 5 });
}

// ---------- cartão da ação da vez: "Resiste -> Escuta" + o que fazer ----------
function cartaoAcao(i) {
  const n = NIVEIS[i], { x, y, w, h } = CARD, cy = y + h / 2, S = 34, tx = x + 146;
  const w1 = larg(n.rot, S, { w: 700 }), ax = tx + w1 + 16, ay = y + 46;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${TELA}" stroke="rgba(255,255,255,.22)" stroke-width="2"/>`
    + `<circle cx="${x + 78}" cy="${cy}" r="40" fill="${n.cor}"${n.cor === C.navy ? ` stroke="${C.blue40}" stroke-width="2.5"` : ''}/>`
    + icone(n.icAcao, x + 78, cy, 48, { c: n.tx, sw: 3.4 })
    + txt(n.rot, tx, y + 58, { w: 700, s: S, c: C.white })
    + `<path d="M${f(ax)},${ay} L${f(ax + 36)},${ay} M${f(ax + 24)},${ay - 11} L${f(ax + 36)},${ay} L${f(ax + 24)},${ay + 11}" fill="none" stroke="${C.blue40}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
    + txt(n.acao, ax + 54, y + 58, { w: 700, s: S, c: C.orange })
    + txt(n.acaoDef, tx, y + 98, { s: 26, c: C.blue40 });
}

// ---------- chip de ação (pílula na cor da marca) ----------
function chip(i, k) {
  if (k <= 0.001) return '';
  const n = NIVEIS[i], x = slotX(i), cx = x + SLOT.w / 2, cy = SLOT.y + SLOT.h / 2;
  return opa(Math.min(1, k * 1.6), pop(0.85 + 0.15 * k, cx, cy,
    `<rect x="${f(x)}" y="${SLOT.y}" width="${f(SLOT.w)}" height="${SLOT.h}" rx="${SLOT.h / 2}" fill="${n.cor}"${n.cor === C.navy ? ` stroke="${C.blue40}" stroke-width="2.5"` : ''}/>`
    + txt(n.acao, cx, cy + 9, { w: 700, s: 26, c: n.tx, a: 'middle' })));
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
  let win = janela(WIN.x, WIN.y, WIN.w, WIN.h, { titulo: TIT }).svg;
  {
    const esc = 1.58, ws = (larg('ILUSTRATIVO', 14, { w: 700, ls: 2.4 }) + 22) * esc;
    win += mover(WIN.x + WIN.w - 22 - ws, WIN.y + (58 - 26 * esc) / 2, selo('Ilustrativo', 0, 0), 0, esc);
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
  // mapa de calor
  {
    const uC = inv(tCal, tCal + 1.0, t);
    if (uC > 0) win += calor(GC, { onda: 0, u: uC });
    for (let n = 0; n < 5; n++) {
      // véu sobre as colunas fora de foco
      const v = 0.6 * emFoco * (1 - sel[n]);
      if (v > 0.004) win += `<rect x="${f(colX(n))}" y="${GC.y - 3}" width="${f(GC.cw + 0.5)}" height="${GC.h + 2}" fill="${VEU}" opacity="${f(v)}"/>`;
      // contorno simples na coluna em foco
      if (sel[n] > 0.004) win += `<rect x="${f(colX(n))}" y="${GC.y - 4}" width="${f(GC.cw)}" height="${GC.h + 4}" rx="13" fill="none" stroke="${C.white}" stroke-width="3" opacity="${f(sel[n])}"/>`;
    }
  }

  let s = fundoNoite(t);
  s += titulo(['Cada marca pede', 'uma *ação diferente*'], MG, 196, t, t0 + 0.15, { escuro: true });
  s += sobe(fin(t, tW, 0.45), win, 24);

  // ---------- salvaguarda ----------
  s += sobe(fin(t, tR + 0.2, 0.4), tRico('*Quem age:* patrocinador, gestores diretos e rede de multiplicadores.', MG, YPE, { s: 24, c: C.navy20, hi: C.white, hw: 700 }), 12);

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
    const x = colX(SEQ[j]) + GC.cw / 2 + 38, y = GC.y + 32, e = 1 - ease.out(inv(tc - 0.45, tc - 0.04, t)), u = inv(tc, tc + 0.4, t);
    s += opa(oc, cursor(x + 30 * e, y + 48 * e, { clique: u < 1 ? u : 0, s: 1.1 }));
  });
  return s;
}
