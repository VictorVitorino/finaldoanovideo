// Cena "acoes" (47,22–57,99 s), navy: "Com ele, a Gestão da Mudança deixa de ser receita única. Escuta para quem
// resiste. Prática para quem experimenta. Palco para quem multiplica."
// O mapa vira DASHBOARD: a janela entra com escala, leve giro e linhas de velocidade; três indicadores contam
// (índice de adoção 20%, 25 pessoas lidas, 4 áreas) e o mapa de calor (áreas x régua) entra em cascata. Em 'com_ele'
// o cursor entra, passa pelo índice e consulta uma célula. Embaixo, o cartão "RECEITA ÚNICA" (o mesmo treinamento
// para as cinco marcas) é riscado em laranja em 'receita', racha ao meio e cai. No lugar nasce a linha "Ação por
// marca", com uma vaga sob cada coluna. Em 'escuta', 'pratica' e 'palco' o cursor clica no cabeçalho da coluna, a
// moldura laranja salta para ela, as pessoas da coluna voam (pontos) para o contador do cartão de ação, e o cartão
// anterior encolhe e vira ficha na sua vaga. No fim as cinco fichas (Escuta, Exemplo, Prática, Reforço, Palco) ficam
// lado a lado, o foco volta para o mapa todo e um pulso de luz passa por elas.
// Sem personagens: pessoas são números nas células e pontos em movimento.
import { W, H, MG, C, txt, tRico, larg, fin, fout, back, sobe, mover, pop, opa, tracar, conta, tremor, onda, particulas, varredura, selo, icone, titulo, clamp, lerp, inv, ease, kf, n2 } from '../base.js';
import { NIVEIS, contagem } from '../modelo.js';
import { fundoNoite, camera, velocidade, sombra, brilho } from '../ludico.js';
import { janela, kpi, geoCalor, calor, cursor, naCelula } from '../painelUI.js';

const f = n2;
export const FUNDO = 'navy';
export const CHIP = '04 · A ação';
export const LEGENDA = true;

// ---------- geometria ----------
const WIN = { x: 48, y: 340, w: 984, h: 540 };                    // janela do dashboard
const KP = { x: 72, y: 418, w: 936, h: 108, gap: 14 };            // linha dos três indicadores
const GC = geoCalor(72, 542, 936, 318, { rotW: 150, cab: 46 });   // mapa de calor
const colX = n => GC.x + GC.rotW + GC.cw * n;
const SLOT = { y: 902, h: 50, w: GC.cw - 16 };                    // linha "Ação por marca": uma vaga sob cada coluna
const slotX = i => colX(i) + 8;
const CARD = { x: MG, y: 970, w: W - 2 * MG, h: 132 };            // cartão grande da ação em foco
const RC = { x: MG, y: 912, w: W - 2 * MG, h: 184 };              // cartão "receita única"
const BX = CARD.x + CARD.w - 152, BY = CARD.y + CARD.h / 2;       // contador de pessoas do cartão
const YPE = 1160;                                                 // pé do palco
const SEQ = [0, 2, 4];                                            // marcas que a fala chama: Resiste, Experimenta, Multiplica
const TELA = '#0F3A5B';                                           // fundo sólido dos cartões sobre o navy
const VEU = '#06304F';                                            // véu que apaga as colunas fora de foco
const TIT = 'Mapa de Adoção · Onda 1';

const corViva = n => (n.cor === C.navy ? C.blue80 : n.cor);       // navy sobre navy vira azul-80
const pulso = (t, a, d) => { const u = (t - a) / d; return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0; };
const jan = (t, a, b, r = 0.25) => Math.min(fin(t, a, r), fout(t, b - r, r));
// centros das células ocupadas de cada coluna (onda 1), uma entrada por pessoa, na ordem em que voam para o cartão
const VOO = [0, 1, 2, 3, 4].map(n => {
  const l = [];
  for (let a = 0; a < 4; a++) for (let k = 0; k < naCelula(a, n, 0); k++) l.push(GC.centro(a, n));
  return l;
});
const CONT = contagem(0);                                         // [6, 8, 6, 4, 1]

// ---------- minigráficos dos indicadores ----------
function minis(t, t0, kw) {
  let s = '';
  const by = KP.y + KP.h - 40, bw = 128, bh = 10, bx = i => KP.x + i * (kw + KP.gap) + kw - bw - 20;
  // 1: barra do índice (20%)
  const u1 = ease.out(inv(t0 + 0.8, t0 + 1.9, t));
  s += opa(fin(t, t0 + 0.75, 0.3), `<rect x="${f(bx(0))}" y="${by}" width="${bw}" height="${bh}" rx="5" fill="rgba(255,255,255,.14)"/>`
    + `<rect x="${f(bx(0))}" y="${by}" width="${f(bw * 0.2 * u1)}" height="${bh}" rx="5" fill="${C.orange}"/>`
    + `<circle cx="${f(bx(0) + bw * 0.2 * u1)}" cy="${by + bh / 2}" r="${f(7 + 1.5 * Math.sin(t * 4))}" fill="${C.orange}" opacity=".35"/>`);
  // 2: as 25 pessoas, repartidas pelas cinco marcas
  let x = bx(1), seg = '';
  NIVEIS.forEach((n, i) => {
    const w = bw * CONT[i] / 25, k = ease.out(inv(t0 + 0.9 + i * 0.09, t0 + 1.35 + i * 0.09, t));
    if (k > 0) seg += `<rect x="${f(x)}" y="${by}" width="${f(Math.max(0, w - 2.5) * k)}" height="${bh}" rx="3.5" fill="${corViva(n)}"/>`;
    x += w;
  });
  s += seg;
  // 3: as quatro áreas
  for (let i = 0; i < 4; i++) {
    const k = back(t, t0 + 1.0 + i * 0.1, 0.35), w = (bw - 18) / 4, cx = bx(2) + i * (w + 6) + w / 2;
    s += pop(k, cx, by + bh / 2, `<rect x="${f(cx - w / 2)}" y="${by}" width="${f(w)}" height="${bh}" rx="5" fill="${C.blue40}"/>`);
  }
  return s;
}

// ---------- cartão "receita única" (parado; queda, risco e racha ficam em desenhar) ----------
function receita(t, tR, tX) {
  const { x, y, w, h } = RC, cy = y + h / 2;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${C.gray20}"/>`
    + `<rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" rx="12" fill="none" stroke="${C.navy40}" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>`;
  s += `<circle cx="${x + 84}" cy="${cy}" r="48" fill="${C.blue20}"/>` + icone('capelo', x + 84, cy, 60, { c: C.navy, sw: 3.6, u: inv(tR + 0.3, tR + 0.95, t) });
  s += txt('RECEITA ÚNICA', x + 154, cy - 8, { w: 700, s: 38, ls: 1.5, c: C.navy })
    + txt('o mesmo treinamento para todos', x + 154, cy + 32, { s: 26, c: C.navy80 });
  // as cinco marcas da régua recebem o mesmo capelo
  for (let i = 0; i < 5; i++) {
    const cx = x + 590 + i * 70, k = back(t, tR + 0.5 + i * 0.07, 0.4) * (1 + 0.06 * Math.max(0, Math.sin(t * 5 - i * 0.9)) * fout(t, tX - 0.2, 0.2));
    s += pop(k, cx, cy + 8, `<rect x="${cx - 19}" y="${f(cy - 40)}" width="38" height="10" rx="5" fill="${NIVEIS[i].cor}"/>`
      + `<circle cx="${cx}" cy="${cy + 10}" r="27" fill="${C.white}" stroke="${C.navy20}" stroke-width="2.5"/>`
      + icone('capelo', cx, cy + 10, 32, { c: C.navy80, sw: 2.8, u: inv(tR + 0.6 + i * 0.07, tR + 1.1 + i * 0.07, t) }));
  }
  // o risco laranja
  s += tracar(`M${x + 34},${cy + 18} L${x + w - 34},${cy - 18}`, ease.out(inv(tX, tX + 0.3, t)), { c: C.orange, sw: 14 });
  return s;
}

// ---------- ficha de ação (pílula na cor da marca) e vaga pontilhada ----------
function ficha(i, k) {
  if (k <= 0.001) return '';
  const n = NIVEIS[i], x = slotX(i), wt = larg(n.acao, 23, { w: 700 }), x0 = x + (SLOT.w - (26 + 8 + wt)) / 2, cy = SLOT.y + SLOT.h / 2;
  return pop(k, x + SLOT.w / 2, cy, `<rect x="${f(x)}" y="${SLOT.y}" width="${f(SLOT.w)}" height="${SLOT.h}" rx="${SLOT.h / 2}" fill="${n.cor}"${n.cor === C.navy ? ` stroke="${C.blue40}" stroke-width="2.5"` : ''}/>`
    + icone(n.icAcao, x0 + 13, cy, 26, { c: n.tx, sw: 2.7 }) + txt(n.acao, x0 + 34, cy + 8, { w: 700, s: 23, c: n.tx }));
}
function vaga(i, k, t, ativo = 0) {
  if (k <= 0.001) return '';
  const n = NIVEIS[i], x = slotX(i), cy = SLOT.y + SLOT.h / 2;
  return opa(clamp(k), pop(0.8 + 0.2 * k, x + SLOT.w / 2, cy, `<rect x="${f(x + 1.5)}" y="${SLOT.y + 1.5}" width="${f(SLOT.w - 3)}" height="${SLOT.h - 3}" rx="${SLOT.h / 2 - 1.5}" fill="${ativo > 0.01 ? corViva(n) : '#ffffff'}" fill-opacity="${f(0.04 + 0.16 * ativo)}" stroke="${corViva(n)}" stroke-width="${f(2.5 + ativo)}" stroke-dasharray="7 8" stroke-dashoffset="${f(-t * (14 + 26 * ativo))}" stroke-linecap="round" opacity="${f(0.7 + 0.3 * ativo)}"/>`));
}

// ---------- cartão grande da ação: "Resiste -> Escuta" + o que fazer + quantas pessoas ----------
// tIn = instante em que entra; pousadas = quantas pessoas já chegaram; tPouso = instante do último pouso
function cartaoAcao(i, j, t, tIn, pousadas, tPouso) {
  const n = NIVEIS[i], { x, y, w, h } = CARD, cor = corViva(n), cy = y + h / 2;
  let s = sombra(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${TELA}" stroke="rgba(255,255,255,.22)" stroke-width="2"/>`, true)
    + `<path d="M${x + 12},${y} L${x + 18},${y} Q${x},${y} ${x},${y + 18} L${x},${y + h - 18} Q${x},${y + h} ${x + 18},${y + h} L${x + 12},${y + h}Z" fill="${cor}"/>`;
  // disco do ícone da ação, com anel que respira
  const kD = back(t, tIn + 0.04, 0.4);
  s += pop(kD, x + 82, cy, `<circle cx="${x + 82}" cy="${cy}" r="${f(50 + 2 * Math.sin(t * 4.2))}" fill="none" stroke="${cor}" stroke-width="2" opacity=".45"/>`
    + `<circle cx="${x + 82}" cy="${cy}" r="42" fill="${n.cor}"${n.cor === C.navy ? ` stroke="${C.blue40}" stroke-width="2.5"` : ''}/>`
    + icone(n.icAcao, x + 82, cy, 50, { c: n.tx, sw: 3.4, u: inv(tIn + 0.1, tIn + 0.6, t) }));
  // "Marca -> Ação"
  const S = 30, tx = x + 152, w1 = larg(n.rot, S, { w: 700 }), ua = inv(tIn + 0.08, tIn + 0.3, t), ax = tx + w1 + 14, ay = y + 46;
  s += sobe(fin(t, tIn + 0.04, 0.24), txt(n.rot, tx, y + 57, { w: 700, s: S, c: C.white }), 14)
    + tracar(`M${f(ax)},${ay} L${f(ax + 34)},${ay}`, clamp(ua * 1.6), { c: C.orange, sw: 4.5 })
    + tracar(`M${f(ax + 22)},${ay - 11} L${f(ax + 35)},${ay} L${f(ax + 22)},${ay + 11}`, clamp(ua * 2 - 0.9), { c: C.orange, sw: 4.5 })
    + pop(back(t, tIn + 0.1, 0.36), ax + 52, y + 46, txt(n.acao, ax + 52, y + 57, { w: 700, s: S, c: C.orange }))
    + sobe(fin(t, tIn + 0.3, 0.34), txt(n.acaoDef, tx, y + 96, { s: 24, c: C.blue40 }), 12);
  // contador de pessoas
  const kB = fin(t, tIn + 0.2, 0.3);
  if (kB > 0.001) {
    const b = `<path d="M${BX - 62},${y + 26} L${BX - 62},${y + h - 26}" stroke="rgba(255,255,255,.2)" stroke-width="2" stroke-linecap="round"/>`
      + pop(1 + 0.28 * pulso(t, tPouso, 0.22), BX - 10, BY, txt(String(pousadas), BX + 8, BY + 21, { f: 'L', w: 400, s: 60, c: C.white, a: 'end' }))
      + txt(pousadas === 1 ? 'pessoa' : 'pessoas', BX + 24, BY - 3, { w: 700, s: 23, c: C.white })
      + txt('na Onda 1', BX + 24, BY + 24, { s: 20, c: C.blue40 });
    s += opa(kB, b);
  }
  // brilho que varre o cartão logo depois de entrar
  s += varredura('ac-vc' + j, x, y, w, h, inv(tIn + 0.42, tIn + 0.95, t), 18);
  return s;
}

export function desenhar(t, ctx) {
  const { t0, m } = ctx;
  const tW = t0 + 0.15;                                      // a janela entra
  const tCal = t0 + 0.5;                                     // o mapa de calor entra em cascata
  const tCur = m('com_ele') - 0.08;                          // "Com ele": o cursor entra
  const tR = t0 + 1.3;                                       // entra o cartão da receita única
  const tX = m('receita') - 0.1;                             // é riscado
  const tT = m('receita') + 0.4;                             // racha e cai ("única")
  const tA = [m('escuta') - 0.1, m('pratica') - 0.1, m('palco') - 0.1];   // cada ação
  const tAll = m('palco') + 0.8;                             // as cinco fichas, foco em todos
  const tClk = tA.map(x => x - 0.04);                        // cliques do cursor
  const tF = tClk.map(x => x + 0.05);                        // troca de foco
  const emFoco = fin(t, tF[0], 0.4) * fout(t, tAll, 0.5);    // há uma coluna em foco
  const tSai = [tA[1] - 0.3, tA[2] - 0.3];                 // o cartão anterior sai na pausa da fala e vira ficha
  // quanto cada coluna está selecionada (0..1)
  const sel = [fin(t, tF[0], 0.25) * fout(t, tF[1], 0.25), 0, fin(t, tF[1], 0.25) * fout(t, tF[2], 0.25), 0, fin(t, tF[2], 0.25) * fout(t, tAll, 0.3)];

  // ---------- janela do dashboard ----------
  const jw = janela(WIN.x, WIN.y, WIN.w, WIN.h, { titulo: TIT, abas: ['Mapa', 'Painel'], aba: 1 });
  let win = jw.svg;
  win += varredura('ac-vb', WIN.x, WIN.y, WIN.w, 58, inv(tCur, tCur + 0.7, t), 22);
  win += opa(0.92 * fin(t, tW + 0.55, 0.3), mover(WIN.x + 112 + larg(TIT, 24, { w: 700 }) + 20, WIN.y + 10.5, selo('Ilustrativo', 0, 0), 0, 1.43));

  // indicadores (recuam enquanto uma coluna está em foco)
  {
    const kw = (KP.w - 2 * KP.gap) / 3, hov = jan(t, tCur + 0.5, tCur + 1.1, 0.2);
    const itens = [
      { rot: 'Índice de adoção', valor: conta(20, inv(t0 + 0.75, t0 + 1.9, t)) + '%', ic: 'grafico' },
      { rot: 'Pessoas lidas', valor: conta(25, inv(t0 + 0.85, t0 + 1.8, t)), ic: 'pessoas' },
      { rot: 'Áreas', valor: conta(4, inv(t0 + 0.95, t0 + 1.5, t)), ic: 'planilha' },
    ];
    let ks = '';
    itens.forEach((it, i) => {
      const x = KP.x + i * (kw + KP.gap);
      ks += kpi(x, KP.y, kw, KP.h, { ...it, k: fin(t, t0 + 0.4 + i * 0.1, 0.4) });
      if (i === 0 && hov > 0.001) ks += `<rect x="${f(x)}" y="${KP.y}" width="${f(kw)}" height="${KP.h}" rx="14" fill="rgba(255,255,255,.06)" stroke="${C.orange}" stroke-width="3" opacity="${f(hov)}"/>`;
    });
    ks += minis(t, t0, kw);
    win += opa(1 - 0.45 * emFoco, ks);
  }

  // mapa de calor
  {
    const uC = inv(tCal, tCal + 1.25, t);
    if (uC > 0) win += calor(GC, { onda: 0, u: uC });
    // véu sobre as colunas fora de foco (troca suave com a fala)
    if (emFoco > 0.001) {
      for (let n = 0; n < 5; n++) {
        const v = 0.62 * emFoco * (1 - sel[n]);
        if (v > 0.004) win += `<rect x="${f(colX(n))}" y="${GC.y - 3}" width="${f(GC.cw + 0.5)}" height="${GC.h + 6}" fill="${VEU}" opacity="${f(v)}"/>`;
      }
    }
    // moldura laranja que salta de coluna em coluna e, no fim, abraça o mapa todo; um pulso de luz corre por ela
    const kF = fin(t, tF[0], 0.28);
    if (kF > 0.001) {
      const salto = u => 0.6 * ease.out(u) + 0.4 * ease.back(u);   // overshoot contido: a moldura não invade a coluna vizinha
      const pos = Math.min(4.03, 2 * salto(inv(tClk[1], tClk[1] + 0.4, t)) + 2 * salto(inv(tClk[2], tClk[2] + 0.4, t)));
      const uAll = ease.inOut(inv(tAll, tAll + 0.4, t));
      const fx = lerp(colX(pos), colX(0), uAll), fw = lerp(GC.cw, GC.cw * 5, uAll), resp = 1.5 * Math.sin(t * 5);
      const estica = 7 * (pulso(t, tClk[1], 0.36) + pulso(t, tClk[2], 0.36));
      const geo = `x="${f(fx + 1 - estica - resp)}" y="${f(GC.y - 7 - resp)}" width="${f(fw - 2 + 2 * estica + 2 * resp)}" height="${f(GC.h + 10 + 2 * resp)}" rx="14"`;
      win += opa(kF * (1 - 0.3 * uAll) * fout(t, tAll + 0.5, 0.3), pop(1.12 - 0.12 * kF, fx + fw / 2, GC.y + GC.h / 2,
        brilho(`<rect ${geo} fill="rgba(255,255,255,.05)" stroke="${C.orange}" stroke-width="4.5"/>`)
        + `<rect ${geo} fill="none" stroke="${C.white}" stroke-width="2.5" stroke-linecap="round" pathLength="1" stroke-dasharray=".07 .93" stroke-dashoffset="${f(-((t * 0.42) % 1))}" opacity=".8"/>`));
    }
    // brilho que varre o mapa quando o foco volta a todos
    win += varredura('ac-vm', colX(0), GC.y, GC.cw * 5, GC.h, inv(tAll + 0.05, tAll + 0.62, t), 12);
    // dica do cursor sobre uma célula (Operações x Observa)
    const kD = jan(t, tCur + 1.42, tCur + 2.2, 0.18);
    if (kD > 0.001) {
      const [cx, cy] = GC.centro(1, 1), str = `${naCelula(1, 1, 0)} pessoas · Operações`, wd = larg(str, 21, { w: 700 }) + 32, y0 = cy - 88;
      win += `<rect x="${f(colX(1) + 3)}" y="${f(cy - GC.rh / 2 + 3)}" width="${f(GC.cw - 6)}" height="${f(GC.rh - 6)}" rx="11" fill="none" stroke="${C.white}" stroke-width="3" opacity="${f(kD)}"/>`
        + opa(kD, pop(0.7 + 0.3 * kD, cx, cy - 36, `<path d="M${f(cx - wd / 2 + 10)},${f(y0)} h${f(wd - 20)} a10,10 0 0 1 10,10 v24 a10,10 0 0 1 -10,10 H${f(cx + 10)} L${f(cx)},${f(y0 + 55)} L${f(cx - 10)},${f(y0 + 44)} H${f(cx - wd / 2 + 10)} a10,10 0 0 1 -10,-10 v-24 a10,10 0 0 1 10,-10Z" fill="${C.white}"/>`
          + txt(str, cx, y0 + 29.5, { w: 700, s: 21, c: C.navy, a: 'middle' })));
    }
  }

  // ---------- palco ----------
  let palco = '';
  palco += titulo(['Cada marca pede', 'uma *ação diferente*'], MG, 196, t, t0 + 0.15, { escuro: true });
  // entrada da janela: escala com overshoot, leve giro que assenta, clarão e linhas de velocidade
  {
    const uf = inv(tW - 0.05, tW + 0.55, t);
    if (uf > 0 && uf < 1) palco += `<circle cx="${W / 2}" cy="${WIN.y + WIN.h / 2}" r="${f(220 + 520 * ease.out(uf))}" fill="url(#g-luz)" opacity="${f(0.6 * (1 - uf))}"/>`;
    palco += velocidade(-60, WIN.y + 10, W + 120, WIN.h - 20, inv(tW - 0.08, tW + 0.5, t), { n: 14, cor: C.blue40, seed: 9 });
    const kW = back(t, tW, 0.6), oW = fin(t, tW, 0.22), cx = WIN.x + WIN.w / 2, cy = WIN.y + WIN.h / 2;
    if (oW > 0.001) palco += `<g opacity="${f(oW)}" transform="translate(${cx} ${f(cy + (1 - kW) * 60)}) rotate(${f((1 - ease.out(inv(tW, tW + 0.7, t))) * -5)}) scale(${f(0.6 + 0.4 * kW)}) translate(${-cx} ${-cy})">${win}</g>`;
  }

  // pé do palco
  palco += sobe(fin(t, tR + 0.25, 0.45), tRico('*Quem age:* patrocinador, gestores diretos e rede de multiplicadores.', MG, YPE, { s: 22, c: C.navy20, hi: C.white, hw: 700 }), 14);

  // ---------- receita única: desliza com leve giro, é riscada, racha ao meio e cai ----------
  if (t >= tR && t < tT + 0.7) {
    const kq = back(t, tR, 0.55), oq = fin(t, tR, 0.2), [dx, dy] = tremor(t, tX + 0.26, 0.34, 8);
    const cx = RC.x + RC.w / 2, cy = RC.y + RC.h / 2;
    const rot = (1 - ease.out(inv(tR, tR + 0.7, t))) * 2.5;
    const sq = 1 + 0.035 * pulso(t, tX + 0.24, 0.25);
    const corpo = receita(t, tR, tX);
    const base = b => `<g opacity="${f(oq)}" transform="translate(${f(dx + (1 - kq) * 260)} ${f(dy)}) translate(${cx} ${cy}) rotate(${f(rot)}) scale(${f(sq)}) translate(${-cx} ${-cy})">${b}</g>`;
    if (t < tT) {
      palco += velocidade(RC.x - 40, RC.y + 10, RC.w + 80, RC.h - 20, inv(tR - 0.05, tR + 0.45, t), { n: 7, cor: C.blue40, seed: 4 });
      palco += sombra(base(corpo), true);
    } else {
      const zx = RC.x + RC.w * 0.47;
      let zz = '';
      for (let i = 0; i <= 8; i++) zz += ` L${f(zx + (i % 2 ? 16 : -16))},${f(RC.y - 30 + (RC.h + 60) * i / 8)}`;
      const esq = `M${RC.x - 60},${RC.y - 30}${zz} L${RC.x - 60},${RC.y + RC.h + 30}Z`, dir = `M${RC.x + RC.w + 60},${RC.y - 30}${zz} L${RC.x + RC.w + 60},${RC.y + RC.h + 30}Z`;
      const meia = (id, d, atraso, mx, my, r) => {
        const u = inv(tT + atraso, tT + atraso + 0.6, t), e = ease.in(u) * 0.75 + u * 0.25, sc = 1 - 0.14 * e;
        return `<g opacity="${f(1 - ease.inOut(inv(0.3, 0.92, u)))}" transform="translate(${f(mx * e)} ${f(my * e)}) rotate(${f(r * e)} ${cx} ${cy}) translate(${cx} ${cy}) scale(${f(sc)}) translate(${-cx} ${-cy})">${base(`<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${corpo}</g>`)}</g>`;
      };
      palco += `<clipPath id="ac-rq"><rect x="-40" y="${WIN.y + WIN.h + 6}" width="${W + 80}" height="${YPE - 34 - (WIN.y + WIN.h + 6)}"/></clipPath><g clip-path="url(#ac-rq)">`
        + meia('ac-rl', esq, 0, -40, 170, -8) + meia('ac-rr', dir, 0.07, 46, 150, 10) + `</g>`;
      palco += particulas(31, zx, cy, t - tT, { n: 14, v: 170, r: 7, d: 0.7, cores: [C.gray20, C.orange, C.blue40] });
    }
    palco += onda(cx, cy, t - tX - 0.26, { r0: 40, r1: 130, d: 0.42, sw: 5 });
  }

  // ---------- linha "Ação por marca": vagas sob as colunas, que viram fichas ----------
  {
    const kL = fin(t, tT + 0.4, 0.3);
    palco += sobe(kL, txt('AÇÃO', MG + 4, SLOT.y + 23, { w: 700, s: 20, ls: 1.8, c: C.white }) + txt('por marca', MG + 4, SLOT.y + 46, { s: 20, c: C.blue40 }), 12);
    const tFicha = [tSai[0], tAll, tSai[1], tAll + 0.06, tAll + 0.12];
    for (let i = 0; i < 5; i++) {
      const cxs = slotX(i) + SLOT.w / 2, cys = SLOT.y + SLOT.h / 2, kV = fin(t, tT + 0.42 + i * 0.05, 0.25);
      if (i === 0 || i === 2) {
        // sai do disco do cartão grande, faz um arco e pousa na vaga
        const u = inv(tFicha[i], tFicha[i] + 0.4, t), e = ease.inOut(u), tP = tFicha[i] + 0.36;
        palco += vaga(i, kV * (1 - clamp(e * 1.4)), t, sel[i]);
        if (u > 0) {
          const dx = (CARD.x + 82 - cxs) * (1 - e), dy = (CARD.y + CARD.h / 2 - cys) * (1 - e) - Math.sin(e * Math.PI) * 30;
          { const ua = inv(tP, tP + 0.4, t), g = 16 * ease.out(ua); if (ua > 0 && ua < 1) palco += `<rect x="${f(slotX(i) - g)}" y="${f(SLOT.y - g)}" width="${f(SLOT.w + 2 * g)}" height="${f(SLOT.h + 2 * g)}" rx="${f(SLOT.h / 2 + g)}" fill="none" stroke="${corViva(NIVEIS[i])}" stroke-width="${f(4 * (1 - ua) + 0.5)}" opacity="${f(1 - ua)}"/>`; }
          palco += opa(clamp(u * 5), `<g transform="translate(${f(dx)} ${f(dy)})">${ficha(i, (0.7 + 0.3 * e) * (1 + 0.14 * pulso(t, tP, 0.26)) * (1 + 0.07 * pulso(t, tAll + 0.26 + i * 0.05, 0.26)))}</g>`);
        }
      } else {
        const kf2 = back(t, tFicha[i], 0.42);
        palco += vaga(i, kV * (1 - clamp(kf2 * 2)), t, sel[i]);
        palco += ficha(i, kf2 * (1 + 0.07 * pulso(t, tAll + 0.26 + i * 0.05, 0.26)));
      }
    }
    // pulso de luz que passa pelas cinco fichas
    palco += varredura('ac-vf', colX(0), SLOT.y, GC.cw * 5, SLOT.h, inv(tAll + 0.2, tAll + 0.68, t), SLOT.h / 2);
  }

  // ---------- cartões grandes: entra o da vez; o anterior encolhe e voa para a sua vaga ----------
  SEQ.forEach((n, j) => {
    const tIn = tA[j], tOut = j < 2 ? tSai[j] : 1e6;
    if (t < tIn - 0.06 || t > tOut + 0.3) return;
    const tv = k => tIn + 0.1 + k * 0.07;                    // partida de cada pessoa
    const l = VOO[n], pous = l.filter((_, k) => t >= tv(k) + 0.5).length;
    const tPouso = pous ? tv(pous - 1) + 0.5 : -9;
    const c = cartaoAcao(n, j, t, tIn, pous, tPouso);
    const kI = back(t, tIn, 0.45), cx = CARD.x + CARD.w / 2, cy = CARD.y + CARD.h / 2;
    const uo = ease.in(inv(tOut, tOut + 0.24, t));           // sai recuando para a esquerda
    const px = cx + (1 - kI) * 260 - uo * 90, sc = 1 - 0.05 * uo;
    const rot = (1 - ease.out(inv(tIn, tIn + 0.5, t))) * 2;
    palco += velocidade(CARD.x, CARD.y + 8, CARD.w + 80, CARD.h - 16, inv(tIn - 0.04, tIn + 0.4, t), { n: 6, cor: corViva(NIVEIS[n]), seed: 12 + j });
    palco += `<g opacity="${f(fin(t, tIn, 0.16) * (1 - uo))}" transform="translate(${f(px)} ${f(cy)}) rotate(${f(rot)}) scale(${f(sc)}) translate(${-cx} ${-cy})">${c}</g>`;
    // as pessoas da coluna (pontos) voam do mapa de calor para o contador do cartão
    const cor = corViva(NIVEIS[n]);
    l.forEach(([x0, y0], k) => {
      const ts = tv(k), u = inv(ts, ts + 0.5, t);
      if (u <= 0 || u >= 1) return;
      const P = v => { const e = ease.inOut(v); return [lerp(x0, BX - 10, e) + Math.sin(e * Math.PI) * (k % 2 ? 70 : -50), lerp(y0, BY, e)]; };
      const fim = 1 - inv(0.8, 1, u);
      for (const [dv, o, r] of [[0.18, 0.2, 4], [0.12, 0.35, 5.5], [0.06, 0.55, 7], [0, 1, 9.5]]) {
        const [qx, qy] = P(Math.max(0, u - dv));
        palco += `<circle cx="${f(qx)}" cy="${f(qy)}" r="${f(r * (0.45 + 0.55 * fim))}" fill="${cor}"${dv === 0 ? ` stroke="${C.white}" stroke-width="2.5"` : ''} opacity="${f(o * (0.2 + 0.8 * fim))}"/>`;
      }
    });
    if (pous) palco += onda(BX - 10, BY, t - tPouso, { r0: 20, r1: 14, d: 0.3, sw: 4, c: cor });
  });

  // ---------- cursor ----------
  if (t >= tCur) {
    const hd = n => [colX(n) + GC.cw / 2 + 26, GC.y + 22], [c2x, c2y] = GC.centro(1, 1), [v4x, v4y] = GC.centro(3, 4), kw = (KP.w - 2 * KP.gap) / 3;
    const p = kf(t, [
      [tCur, [1100, 800]], [tCur + 0.6, [KP.x + kw * 0.62, KP.y + 62]], [tCur + 1.0, [KP.x + kw * 0.64, KP.y + 58]], [tCur + 1.5, [c2x + 16, c2y + 10]], [tCur + 2.15, [c2x + 20, c2y + 8]],
      [tX - 0.08, [RC.x + 34, RC.y + RC.h / 2 + 18]], [tX + 0.3, [RC.x + RC.w - 34, RC.y + RC.h / 2 - 18], ease.out], [tT - 0.02, [RC.x + RC.w - 40, RC.y + RC.h / 2 - 30]], [tClk[0] - 0.04, hd(0)], [tClk[0] + 0.6, hd(0)], [tClk[0] + 1.3, [hd(0)[0] + 10, GC.y + 190]],
      [tClk[1] - 0.5, [hd(0)[0] + 12, GC.y + 196]], [tClk[1] - 0.04, hd(2)], [tClk[1] + 0.6, hd(2)], [tClk[1] + 1.3, [hd(2)[0] + 10, GC.y + 190]],
      [tClk[2] - 0.5, [hd(2)[0] + 12, GC.y + 196]], [tClk[2] - 0.04, hd(4)], [tAll - 0.05, hd(4)], [tAll + 0.5, [v4x + 4, v4y - 8]],
    ]);
    let uc = 0;
    for (const tc of [...tClk, tX - 0.04]) { const u = inv(tc, tc + 0.45, t); if (u > 0 && u < 1) uc = u; }
    tClk.forEach((tc, j) => { palco += onda(hd(SEQ[j])[0] - 26, GC.y + 18, t - tc - 0.05, { r0: 20, r1: 84, d: 0.5, sw: 5, c: corViva(NIVEIS[SEQ[j]]) }); });
    palco += opa(fin(t, tCur, 0.2) * fout(t, tAll + 0.3, 0.3), cursor(p[0], p[1], { clique: uc, s: 1.25 }));
  }

  // ---------- câmera: aproxima de leve da coluna em foco e volta para o todo ----------
  const z = 1 + 0.03 * emFoco;
  const col = 2 * ease.inOut(inv(tClk[1], tClk[1] + 0.6, t)) + 2 * ease.inOut(inv(tClk[2], tClk[2] + 0.6, t));   // 0..4
  const pan = lerp(6, -6, col / 4) * emFoco;               // a coluna em foco vem um pouco para o centro
  const cy = 760;
  return fundoNoite(t) + camera(palco, { z, cx: W / 2, cy, dx: pan, dy: cy - H / 2 });
}
