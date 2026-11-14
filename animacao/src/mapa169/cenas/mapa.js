// Cena "mapa" (41,96–47,22 s): "Junte as posições, área por área, e nasce o Mapa de Adoção."
// Versão limpa. O mapa de trilha da cena anterior fica parado e completo, sem câmera. Os pinos das Pessoas A e B
// já estão no lugar (assentam uma vez, antes da primeira leva). De 'junte' até pouco antes de 'nasce', as outras
// 23 pessoas aparecem em quatro levas, ÁREA POR ÁREA: uma única etiqueta no canto do palco diz o nome da área da
// vez e as áreas que já entraram recuam (um foco por vez). Em 'nasce' a etiqueta sai, o mapa inteiro volta a 100%
// e "Mapa de Adoção" sobe para a 2ª linha do título, com o fio laranja se desenhando até 'mapa_adocao'.
// O placar conta as pessoas e as áreas e termina em "25 pessoas · 4 áreas · 5 marcas", com o selo ILUSTRATIVO.
// Único detalhe vivo: o tracejado da estrada.
// Salvaguardas no pé do palco: "Leitura agregada por área." e
// "Retrato do momento, neste projeto. Não é avaliação de desempenho."
import { W, MG, C, txt, larg, fin, fout, back, opa, pilula, selo, titulo, clamp, lerp, inv, ease, n2 } from '../base.js';
import { NIVEIS, AREAS, PESSOAS } from '../modelo.js';
import { fundoVivo, sombra, geoTrilha, mapaTrilha, pinoMapa } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const CHIP = '03 · O mapa';
export const LEGENDA = true;

// ---------- geometria (a mesma da cena anterior) ----------
const G = geoTrilha(72, 350, 936, 760);
const TY = 196, TS = 62, TY2 = TY + TS * 1.12;           // linhas de base do título
const SP = 0.62;                                         // escala dos pinos (a do kit)
const SH = 0.8;                                          // escala final dos pinos A e B
const GOTA = 'M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z';
const PASSO = 0.065;                                     // intervalo entre as pessoas de uma leva
const RECUO = 0.5;                                       // quanto as áreas que já entraram recuam
const LBL = { x: MG, y: 338, h: 50, s: 26 };             // etiqueta da área da vez (canto superior esquerdo do palco)
const LW = AREAS.map(n => larg(n, LBL.s, { w: 700 }) + 66);
const BAR = { y: 1048, h: 66 };                          // placar
const PE = { y: 1134, h: 36 };                           // faixa das salvaguardas

// onde cada pessoa fica (onda 1): os mesmos lugares de pinosTrilha
const POS = {};
for (let n = 0; n < 5; n++) {
  const cel = PESSOAS.filter(p => p.niv[0] === n);
  cel.forEach((p, j) => { POS[p.id] = G.vaga(n, j, cel.length); });
}
// ajustes finos desta cena: nenhum pino fica em cima de uma bandeira, no meio da pista, na beira da ilha ou
// encostado no anel das Pessoas A e B
const AJUSTE = { 2: [238, 846], 3: [389, 867], 6: [160, 852], 10: [902, 722], 11: [388, 604], 12: [554, 772], 15: [361, 826], 16: [758, 430], 23: [292, 902] };
for (const id of Object.keys(AJUSTE)) POS[id] = AJUSTE[id];
const PB0 = G.em(0.20);                                  // onde a Pessoa B parou na cena anterior (na estrada, antes de Observa)
// ordem de entrada em cada área: da estação Resiste para a Multiplica (o sentido da estrada). A e B já estão no mapa.
const FILA = AREAS.map((_, a) => PESSOAS.filter(p => p.area === a && !p.heroi).sort((p, q) => p.niv[0] - q.niv[0] || p.id - q.id));
const ORDEM = {};
FILA.forEach(fila => fila.forEach((p, k) => { ORDEM[p.id] = k; }));

// pino comum (pinoMapa do kit). k = escala de entrada, em torno da ponta
function pino(x, y, cor, k) {
  // o azul-40 de Experimenta some sobre a ilha clara: ganha um filete azul por fora da borda branca
  return (cor === C.blue40 ? `<g transform="translate(${f(x)} ${f(y)}) scale(${f(SP * k)})"><path d="${GOTA}" fill="none" stroke="${C.blue}" stroke-width="9"/></g>` : '')
    + pinoMapa(x, y, { cor, s: SP, k });
}
// pinos das Pessoas A e B: o desenho do kit (gota + anel navy), com a letra sempre legível. s vai de 1 (como na
// cena anterior) a SH; a cabeça branca cresce um pouco para a letra caber
function pinoHeroi(x, y, o) {
  const s = o.s, cy = y - 42 * s, u = inv(1, SH, s);
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(13 * s)}" ry="${f(5 * s)}" fill="${C.navy}" opacity=".22"/>`
    + `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="${GOTA}" fill="${o.cor}" stroke="${C.white}" stroke-width="4"/>`
    + `<circle cx="0" cy="-42" r="30" fill="none" stroke="${C.navy}" stroke-width="5"/></g>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(lerp(12, 14, u))}" fill="${C.white}"/>`
    + txt(o.letra, x, cy + 7.8, { w: 700, s: 22, c: C.navy, a: 'middle' });
}

export function desenhar(t, ctx) {
  const { t0, m } = ctx;
  const tJ = m('junte'), tA = m('area'), tN = m('nasce') - 0.08;
  // 1ª pessoa de cada leva: Financeiro em 'junte', Comercial em 'área', as outras duas no meio do caminho
  const dL = (tA - tJ) / 2, LAND = [tJ, tJ + dL, tA, tA + dL];
  const tPouso = p => (p.heroi ? -9 : LAND[p.area] + ORDEM[p.id] * PASSO);
  const tPop = i => LAND[i] - 0.3;                                    // a etiqueta troca logo antes de a leva chegar
  // foco: a área da vez em 100%; as que já entraram recuam até 'nasce', quando o mapa inteiro volta
  const recuo = a => (a < 3 ? Math.min(fin(t, tPop(a + 1) + 0.12, 0.3), fout(t, tN - 0.22, 0.32)) : 0);
  // quantas pessoas e áreas já estão no mapa (as Pessoas A e B contam desde o início)
  const nP = PESSOAS.filter(p => t >= tPouso(p)).length;
  const nA = Math.max(1, LAND.filter(q => t >= q).length);

  let s = fundoVivo(t);

  // ---------- o mapa: parado e completo. Só o tracejado da estrada corre ----------
  s += mapaTrilha(G, { u: 1, uEst: [0, 0, 0, 0, 0], t });
  s += mapaTrilha(G, { terreno: false, u: 0, uEst: [1, 1, 1, 1, 1], t: 0 });

  // ---------- os pinos: A e B no lugar desde o início; os outros 23 aparecem área por área ----------
  {
    const itens = [];
    for (const p of PESSOAS) {
      const [x, y] = POS[p.id], cor = NIVEIS[p.niv[0]].cor;
      if (p.heroi) {
        // continuidade com a cena anterior: A e B começam na escala 1 (B ainda na beira da estrada) e assentam uma
        // vez, antes de a primeira leva chegar. Não recuam: são o fio da história
        const uh = ease.inOut(inv(tJ - 0.6, tJ - 0.05, t)), sh = lerp(1, SH, uh);
        const hx = p.heroi === 'B' ? lerp(PB0[0], x, uh) : x, hy = p.heroi === 'B' ? lerp(PB0[1], y, uh) : y;
        itens.push({ y: hy, svg: pinoHeroi(hx, hy, { cor, s: sh, letra: p.heroi }) });
        continue;
      }
      const a = tPouso(p) - 0.2, u = inv(a, a + 0.34, t);
      if (u <= 0) continue;
      const o = clamp(u * 3) * (1 - RECUO * recuo(p.area));
      itens.push({ y, svg: opa(o, pino(x, y, cor, 0.6 + 0.4 * back(t, a, 0.34))) });
    }
    itens.sort((a, b) => a.y - b.y);
    s += itens.map(i => i.svg).join('');
  }

  // ---------- etiqueta: uma só, com o nome da área da vez ----------
  {
    const kIn = fin(t, tPop(0), 0.35), k = Math.min(kIn, fout(t, tN - 0.22, 0.32));
    if (k > 0.001) {
      let i = 0;
      for (let j = 1; j < AREAS.length; j++) if (t >= tPop(j)) i = j;
      const u = i ? inv(tPop(i), tPop(i) + 0.26, t) : 1;
      // a pílula cresce antes de o nome novo entrar e encolhe depois de o antigo sair
      const w = i ? lerp(LW[i - 1], LW[i], ease.inOut(LW[i] > LW[i - 1] ? clamp(u * 2) : clamp(u * 2 - 1))) : LW[0];
      const cy = LBL.y + LBL.h / 2, yb = cy + LBL.s * 0.35;
      const b = pilula(LBL.x, LBL.y, w, LBL.h, C.navy)
        + `<circle cx="${f(LBL.x + 24)}" cy="${f(cy)}" r="6" fill="${C.orange}"/>`
        + (i ? opa(1 - clamp(u * 2), txt(AREAS[i - 1], LBL.x + 42, yb, { w: 700, s: LBL.s, c: C.white })) : '')
        + opa(clamp(u * 2 - 1), txt(AREAS[i], LBL.x + 42, yb, { w: 700, s: LBL.s, c: C.white }));
      s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - kIn) * 12)})">${b}</g>`;
    }
  }

  // ---------- título: a 1ª linha entra com a cena; "Mapa de Adoção" sobe em 'nasce' ----------
  s += titulo(['Área por área, nasce o'], MG, TY, t, t0 + 0.15);
  s += titulo(['*Mapa de Adoção*'], MG, TY2, t, tN);

  // ---------- placar: conta as pessoas e as áreas; termina em 25 · 4 · 5 ----------
  {
    const k = fin(t, t0 + 0.3, 0.45);
    if (k > 0.001) {
      const SN = 44, SL = 24, GAP = 9, SEP = 44, ch = BAR.h, y0 = BAR.y, cy = y0 + ch / 2, yb = cy + 15.5;
      const itens = [[nP, 'pessoas', '25'], [nA, nA > 1 ? 'áreas' : 'área', '4'], [5, 'marcas', '5']];
      const wn = itens.map(it => larg(it[2], SN, { f: 'L', w: 400 })), wl = ['pessoas', 'áreas', 'marcas'].map(r => larg(r, SL));
      const wSelo = larg('ILUSTRATIVO', 14, { w: 700, ls: 2.4 }) + 22;
      const cw = 36 + wn.reduce((p, q) => p + q, 0) + wl.reduce((p, q) => p + q, 0) + GAP * 3 + SEP * 2 + 32 + wSelo + 26;
      const x0 = (W - cw) / 2;
      let corpo = '', x = x0 + 36;
      itens.forEach(([v, r], i) => {
        corpo += txt(String(v), x + wn[i], yb, { f: 'L', w: 400, s: SN, c: C.navy, a: 'end' })
          + txt(r, x + wn[i] + GAP, yb - 2, { s: SL, c: C.navy80 });
        x += wn[i] + GAP + wl[i];
        if (i < 2) { corpo += `<path d="M${f(x + SEP / 2)},${f(cy - 15)} v30" stroke="${C.navy20}" stroke-width="2" stroke-linecap="round"/>`; x += SEP; }
      });
      corpo += selo('Ilustrativo', x + 32, cy - 13);
      const cartao = sombra(`<rect x="${f(x0)}" y="${y0}" width="${f(cw)}" height="${ch}" rx="${ch / 2}" fill="${C.white}" stroke="${C.navy20}" stroke-width="1.5"/>`, true) + corpo;
      s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - k) * 16)})">${cartao}</g>`;
    }
  }

  // ---------- salvaguardas no pé do palco ----------
  {
    const k = fin(t, t0 + 0.42, 0.45);
    if (k > 0.001) {
      const f1 = 'Leitura agregada por área.', f2 = 'Retrato do momento, neste projeto. Não é avaliação de desempenho.';
      const SZ = 22, w1 = larg(f1, SZ, { w: 700 }), w2 = larg(f2, SZ), gap = 28, w = w1 + gap + w2 + 44, x0 = (W - w) / 2, yb = PE.y + 25.5;
      s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - k) * 12)})"><rect x="${f(x0)}" y="${PE.y}" width="${f(w)}" height="${PE.h}" rx="${PE.h / 2}" fill="#fff" opacity=".88"/>`
        + txt(f1, x0 + 22, yb, { w: 700, s: SZ, c: C.navy80 })
        + `<path d="M${f(x0 + 22 + w1 + gap / 2)},${PE.y + 9} v18" stroke="${C.navy40}" stroke-width="1.5"/>`
        + txt(f2, x0 + 22 + w1 + gap, yb, { s: SZ, c: C.navy80 }) + `</g>`;
    }
  }
  return s;
}
