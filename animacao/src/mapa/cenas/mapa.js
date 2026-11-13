// Cena "mapa" (41,96–47,22 s): "Junte as posições, área por área, e nasce o Mapa de Adoção."
// Motion de produto, sem personagens. O mapa de trilha da cena anterior já está completo, com os pinos das Pessoas
// A e B no lugar (começam na escala da cena anterior e encolhem um pouco, mantendo a letra em 20 px e o anel navy:
// são o fio da história e nunca recuam). Cada posição se liga à sua marca por um fio pontilhado que corre do pino
// até a estação, por baixo da estrada. A câmera começa fechada
// (1,12, com leve giro) e recua até 1,0. De 'junte' até pouco antes de 'nasce', as outras 23 pessoas entram em
// quatro levas, ÁREA POR ÁREA: a etiqueta navy da área desliza no canto do palco e conta quem pousou, miras marcam
// as vagas, os pinos caem com rastro, assentam e soltam uma ondinha; as áreas que já entraram recuam (um foco por
// vez). O fio sob o título é a barra de progresso (quatro trechos, um por área): quando enche, "Mapa de Adoção"
// sobe de trás dele em 'nasce', enquanto um pulso de luz percorre a estrada e acende as estações. Em 'mapa_adocao'
// a ilha solta uma onda, o contorno acende e o placar (que contou ao vivo) trava em
// "25 pessoas · 4 áreas · 5 marcas", com o selo ILUSTRATIVO. Para fechar, cada estação ganha o seu total
// (6, 8, 6, 4, 1), em cascata, no ritmo dos tiques de áudio que já estão na trilha.
// Salvaguardas no pé do palco: "Leitura agregada por área." e
// "Retrato do momento, neste projeto. Não é avaliação de desempenho."
import { W, MG, C, txt, larg, fin, fout, back, pop, opa, onda, varredura, tracar, pilula, selo, icone, titulo, clamp, lerp, inv, ease, n2 } from '../base.js';
import { NIVEIS, AREAS, PESSOAS, contagem } from '../modelo.js';
import { fundoVivo, camera, sombra, brilho, geoTrilha, mapaTrilha, pinoMapa } from '../ludico.js';

const f = n2;
export const FUNDO = 'claro';
export const CHIP = '03 · O mapa';
export const LEGENDA = true;

// ---------- geometria (a mesma da cena anterior) ----------
const G = geoTrilha(72, 350, 936, 760);
const MCX = G.x + G.w / 2, MCY = G.y + G.h / 2;          // centro do mapa: (540, 730)
const TY = 196, TS = 62, TY2 = TY + TS * 1.12;           // linhas de base do título
const SP = 0.62;                                         // escala dos pinos (a do kit)
const SH = 0.8;                                          // escala final dos pinos A e B (a letra continua com 20 px)
const GOTA = 'M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z';
const TF = 0.26, H0 = 200, PASSO = 0.065;                // queda: duração, altura e intervalo entre pessoas da leva
const TMIRA = 0.38;                                      // a mira aparece este tempo antes do pouso
const LX = MG, LY0 = 352, LH = 52, LDY = 60;             // etiquetas das áreas (canto superior esquerdo do palco)
const BAR = { y: 1054, h: 66 };                          // placar
const CAMY = 990;                                        // pivô da câmera: a altura da estação Resiste (o pé do mapa não invade o placar)
const PE = { y: 1134, h: 36 };                           // faixa das salvaguardas

// contorno da ilha (o mesmo desenho de mapaTrilha), para o brilho e a onda de 'mapa_adocao'
const ILHA = `M${f(G.x - 10)},${f(G.y + G.h * 0.62)} C${f(G.x - 30)},${f(G.y + G.h * 0.2)} ${f(G.x + G.w * 0.2)},${f(G.y - 10)} ${f(G.x + G.w * 0.52)},${f(G.y + G.h * 0.03)}`
  + ` C${f(G.x + G.w * 0.8)},${f(G.y - 30)} ${f(G.x + G.w + 26)},${f(G.y + G.h * 0.1)} ${f(G.x + G.w + 14)},${f(G.y + G.h * 0.46)}`
  + ` C${f(G.x + G.w + 30)},${f(G.y + G.h * 0.8)} ${f(G.x + G.w * 0.86)},${f(G.y + G.h + 16)} ${f(G.x + G.w * 0.5)},${f(G.y + G.h + 4)}`
  + ` C${f(G.x + G.w * 0.2)},${f(G.y + G.h + 20)} ${f(G.x + 6)},${f(G.y + G.h + 4)} ${f(G.x - 10)},${f(G.y + G.h * 0.62)}Z`;
const ESTRADA = G.d(0, 1);

// onde cada pessoa pousa (onda 1): os mesmos lugares de pinosTrilha
const POS = {};
for (let n = 0; n < 5; n++) {
  const cel = PESSOAS.filter(p => p.niv[0] === n);
  cel.forEach((p, j) => { POS[p.id] = G.vaga(n, j, cel.length); });
}
// ajustes finos desta cena (o mapa de trilha não volta depois dela): nenhum pino fica em cima de uma bandeira, no
// meio da pista, na beira da ilha ou encostado no anel das Pessoas A e B
const AJUSTE = { 2: [238, 846], 3: [389, 867], 6: [160, 852], 10: [902, 722], 11: [388, 604], 12: [554, 772], 15: [361, 826], 16: [758, 430], 23: [292, 902] };
for (const id of Object.keys(AJUSTE)) POS[id] = AJUSTE[id];
const PB0 = G.em(0.20);                                  // onde a Pessoa B parou na cena anterior (na estrada, antes de Observa)
// ordem de entrada em cada área: da estação Resiste para a Multiplica (o sentido da estrada). A e B já estão no mapa.
const FILA = AREAS.map((_, a) => PESSOAS.filter(p => p.area === a && !p.heroi).sort((p, q) => p.niv[0] - q.niv[0] || p.id - q.id));
const ORDEM = {};
FILA.forEach(fila => fila.forEach((p, k) => { ORDEM[p.id] = k; }));
const TOTAL = PESSOAS.length;
const CONT = contagem(0);                                // pessoas em cada marca na onda 1: 6, 8, 6, 4, 1
// trechos da barra de progresso: um por área, proporcional ao número de pessoas
const TRECHOS = [];
{ let ac = 0; AREAS.forEach((_, a) => { const n = PESSOAS.filter(p => p.area === a).length; TRECHOS.push([ac / TOTAL, (ac + n) / TOTAL]); ac += n; }); }
// altura da queda de cada pessoa: quem pousa no alto do mapa cai de mais perto (não invade o título) e ninguém
// passa por cima de uma estação nem dos pinos A e B
const ALTURA = {};
for (const p of PESSOAS) {
  const [x, y] = POS[p.id];
  let h = clamp(y - 390, 20, H0);
  for (let i = 0; i < 5; i++) { const [ex, ey] = G.est(i); if (ey < y && Math.abs(x - ex) < 64) h = Math.min(h, Math.max(20, y - ey - 92)); }
  for (const q of PESSOAS) { if (!q.heroi) continue; const [hx, hy] = POS[q.id]; if (hy < y && Math.abs(x - hx) < 46) h = Math.min(h, Math.max(20, y - hy - 48)); }
  ALTURA[p.id] = h;
}
// cor do efeito de pouso (o azul-40 some sobre a ilha clara)
const corFx = n => (NIVEIS[n].cor === C.blue40 ? C.blue : NIVEIS[n].cor);
const corFx2 = cor => (cor === C.blue40 ? C.blue : cor);
// inverso de ease.inOut (para saber quando o pulso de luz passa por cada estação)
const invInOut = y => (y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2);
const bat = (t, a, d) => Math.sin(Math.PI * inv(a, a + d, t));       // batida 0 -> 1 -> 0

// estado de um pino que cai e assenta. tl = instante do pouso
function queda(t, tl, h0) {
  const tau = t - (tl - TF);
  if (tau < 0) return null;
  if (tau < TF) { const u = tau / TF; return { ar: true, u, alt: h0 * (1 - u * u), cai: h0 * u * u, a: clamp(u * 5) }; }
  const s = t - tl;
  return { ar: false, s, alt: s < 0.2 ? 9 * Math.sin(Math.PI * s / 0.2) : 0, sq: 0.16 * Math.max(0, 1 - s / 0.09) };
}
// mira no chão: marca a vaga antes de o pino chegar
function mira(x, y, u) {
  if (u <= 0 || u >= 1) return '';
  const r = lerp(27, 13, ease.out(u)), ry = r * 0.42, o = Math.min(1, u * 5) * 0.62;
  return `<g opacity="${f(o)}" stroke="${C.navy}" fill="none" stroke-linecap="round"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(ry)}" stroke-width="2"/>`
    + `<path d="M${f(x - r - 7)},${f(y)}h7 M${f(x + r)},${f(y)}h7 M${f(x)},${f(y - ry - 5)}v5 M${f(x)},${f(y + ry)}v5" stroke-width="2.4"/>`
    + `<circle cx="${f(x)}" cy="${f(y)}" r="2.2" fill="${C.navy}" stroke="none"/></g>`;
}
// pino no ar: mesmo desenho de pinoMapa, com rastro e a sombra que fecha no chão
function pinoCai(x, y, st, cor) {
  const ks = clamp(1 - st.alt / 280, 0.2, 1), yh = y - st.alt - 42 * SP, L = Math.max(0, Math.min(36 + 120 * st.u, st.cai + 14, yh - 340));   // o rastro não passa do ponto de partida nem sobe para o título
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(13 * SP * ks)}" ry="${f(5 * SP * ks)}" fill="${C.navy}" opacity="${f(0.22 * ks * st.a)}"/>`
    + `<path d="M${f(x - 8)},${f(yh)} L${f(x)},${f(yh - L)} L${f(x + 8)},${f(yh)}Z" fill="${corFx2(cor)}" opacity="${f(0.3 * st.a)}"/>`
    + `<g opacity="${f(st.a)}" transform="translate(${f(x)} ${f(y - st.alt)}) scale(${f(SP * (1 - 0.06 * st.u))} ${f(SP * (1 + 0.14 * st.u))})">`
    + (cor === C.blue40 ? `<path d="${GOTA}" fill="none" stroke="${C.blue}" stroke-width="9"/>` : '')
    + `<path d="${GOTA}" fill="${cor}" stroke="${C.white}" stroke-width="4"/><circle cx="0" cy="-42" r="11" fill="${C.white}"/></g>`;
}
// pino no chão (pinoMapa do kit), com o pequeno salto e o assentamento em torno da ponta
function pinoChao(x, y, o) {
  const sp = o.s ?? SP, alt = o.alt ?? 0;
  // o azul-40 de Experimenta some sobre a ilha clara: ganha um filete azul por fora da borda branca
  const b = (o.cor === C.blue40 ? `<g transform="translate(${f(x)} ${f(y - alt)}) scale(${f(sp)})"><path d="${GOTA}" fill="none" stroke="${C.blue}" stroke-width="9"/></g>` : '')
    + pinoMapa(x, y, { cor: o.cor, s: sp, hop: alt / sp });
  const sq = o.sq ?? 0;
  return sq < 0.004 ? b : `<g transform="translate(${f(x)} ${f(y)}) scale(${f(1 + sq * 0.7)} ${f(1 - sq)}) translate(${f(-x)} ${f(-y)})">${b}</g>`;
}
// pinos das Pessoas A e B: o desenho do kit (gota + anel navy), com a letra sempre em 20 px. s vai de 1 (como na
// cena anterior) a SH; a cabeça branca cresce um pouco para a letra caber
function pinoHeroi(x, y, o) {
  const s = o.s, alt = o.alt ?? 0, cy = y - alt - 42 * s, u = inv(1, SH, s);
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f((13 - alt * 0.12) * s)}" ry="${f(5 * s)}" fill="${C.navy}" opacity=".22"/>`
    + `<g transform="translate(${f(x)} ${f(y - alt)}) scale(${f(s)})"><path d="${GOTA}" fill="${o.cor}" stroke="${C.white}" stroke-width="4"/>`
    + `<circle cx="0" cy="-42" r="30" fill="none" stroke="${C.navy}" stroke-width="5"/></g>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(lerp(11, 13, u))}" fill="${C.white}"/>`
    + txt(o.letra, x, cy + 7.2, { w: 700, s: 20, c: C.navy, a: 'middle' });
}
// ondinha do pouso: anel achatado no chão
function ondinha(x, y, idade, cor) {
  const d = 0.5, u = idade / d;
  if (u <= 0 || u >= 1) return '';
  const rx = 8 + 34 * ease.out(u);
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * 0.4)}" fill="none" stroke="${cor}" stroke-width="${f(4 * (1 - u) + 0.6)}" opacity="${f(1 - u)}"/>`;
}

export function desenhar(t, ctx) {
  const { t0, t1, m } = ctx;
  const tJ = m('junte'), tA = m('area'), tN = m('nasce') - 0.08, tM = m('mapa_adocao') - 0.06;
  // pouso da 1ª pessoa de cada leva: Financeiro em 'junte', Comercial em 'área', as outras duas no meio do caminho
  const dL = (tA - tJ) / 2, LAND = [tJ, tJ + dL, tA, tA + dL];
  const tPouso = p => (p.heroi ? -9 : LAND[p.area] + ORDEM[p.id] * PASSO);
  const tPop = i => LAND[i] - 0.3;                                    // a etiqueta da área desliza logo antes de a leva pousar
  // foco: a área da vez em 100%; as que já entraram recuam até 'nasce', quando o mapa inteiro acende
  const recuo = a => (a < 3 ? Math.min(fin(t, tPop(a + 1) + 0.12, 0.3), fout(t, tN - 0.22, 0.32)) : 0);
  // pulso de luz na estrada: de 'nasce' até 'mapa_adocao'
  const pA = tN + 0.04, pD = tM + 0.08 - pA;
  const tPassa = i => pA + pD * invInOut(G.uEst[i]);
  // leitura agregada: depois de 'mapa_adocao', cada estação mostra em cascata quantas pessoas estão nela
  const tLe = i => tM + 0.3 + i * 0.178;
  // quantas pessoas já estão no mapa (as Pessoas A e B contam desde o início)
  const pousos = PESSOAS.map(tPouso);
  const nP = pousos.filter(q => t >= q).length, ultP = Math.max(-9, ...pousos.filter(q => t >= q));
  const prog = pousos.reduce((a, q) => a + clamp((t - q) / 0.14), 0) / TOTAL;
  const nA = Math.max(1, LAND.filter(q => t >= q).length), ultA = Math.max(-9, ...LAND.filter(q => t >= q));

  let s = fundoVivo(t, { seed: 12 });

  // ---------- o mapa (dentro da câmera, que abre de 1,12 para 1,0 com leve giro) ----------
  let mp = '';
  {
    // 'mapa_adocao': a onda chega à margem e o contorno da ilha acende
    const uB = inv(tM + 0.12, tM + 1.05, t);
    if (uB > 0 && uB < 1) mp += brilho(`<path d="${ILHA}" fill="none" stroke="${C.orange}" stroke-width="${f(5 + 7 * Math.sin(uB * Math.PI))}" stroke-linejoin="round" opacity="${f(0.8 * Math.sin(uB * Math.PI))}"/>`);
  }
  mp += mapaTrilha(G, { u: 0, uEst: [0, 0, 0, 0, 0], t });            // terreno
  // cada posição se liga à sua marca: um fio pontilhado nasce no pino quando ele pousa e corre até a estação
  // (por baixo da estrada); quando a marca é contada, os fios dela acendem
  {
    let fios = '';
    for (const p of PESSOAS) {
      const nv = p.niv[0], [x, y] = POS[p.id], [ex, ey] = G.est(nv), a = p.heroi ? tJ - 0.5 : tPouso(p) + 0.04;
      const u = ease.out(inv(a, a + 0.34, t));
      if (u <= 0) continue;
      const k = bat(t, tLe(nv), 0.5), o = (0.5 + 0.5 * k) * (1 - 0.34 * recuo(p.area));
      fios += `<path d="M${f(x)},${f(y)} L${f(lerp(x, ex, u))},${f(lerp(y, ey, u))}" stroke="${corFx(nv)}" stroke-width="${f(2.4 + 1.6 * k)}" stroke-dasharray="1 7" stroke-dashoffset="${f(-t * 18)}" stroke-linecap="round" opacity="${f(o)}"/>`;
    }
    mp += fios;
  }
  mp += mapaTrilha(G, { terreno: false, u: 1, uEst: [0, 0, 0, 0, 0], t });   // estrada (as estações vêm por cima da luz)

  // 'mapa_adocao': uma onda nasce no centro e fica contida na ilha + varredura de luz
  {
    let dentro = onda(MCX, MCY, t - tM, { r0: 30, r1: 610, d: 0.95, sw: 6, c: C.orange })
      + onda(MCX, MCY, t - tM - 0.13, { r0: 30, r1: 610, d: 0.95, sw: 3, c: C.white });
    const u = inv(tM, tM + 0.8, t);
    if (u > 0 && u < 1) {
      const cx = G.x - 280 + (G.w + 560) * ease.inOut(u), y0 = G.y - 40, y1 = G.y + G.h + 40;
      dentro += `<path d="M${f(cx - 110)},${f(y1)} L${f(cx + 90)},${f(y0)} L${f(cx + 230)},${f(y0)} L${f(cx + 30)},${f(y1)}Z" fill="#fff" opacity=".4"/>`
        + `<path d="M${f(cx - 190)},${f(y1)} L${f(cx + 10)},${f(y0)} L${f(cx + 44)},${f(y0)} L${f(cx - 156)},${f(y1)}Z" fill="#fff" opacity=".26"/>`;
    }
    if (dentro) mp += `<clipPath id="mp-ilha"><path d="${ILHA}"/></clipPath><g clip-path="url(#mp-ilha)">${dentro}</g>`;
  }

  // a estrada acende: pulso de luz de 'nasce' a 'mapa_adocao' e, depois, uma luz suave que continua passando
  {
    const u = inv(pA, pA + pD, t);
    if (u > 0 && t < pA + pD + 0.25) {
      const h = ease.inOut(u), cauda = Math.max(0, h - 0.22 * Math.sin(u * Math.PI) - 0.02), kf = 1 - inv(pA + pD, pA + pD + 0.25, t);
      if (h - cauda > 0.004) mp += opa(kf, brilho(`<path d="${G.d(cauda, h)}" fill="none" stroke="${C.orange}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`
        + `<path d="${G.d(lerp(cauda, h, 0.55), h)}" fill="none" stroke="${C.white}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`));
    }
    const kE = Math.min(fin(t, tM - 0.02, 0.14), fout(t, tM + 0.2, 0.75));
    if (kE > 0.01) mp += `<path d="${ESTRADA}" fill="none" stroke="${C.orange}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="${f(0.85 * kE)}"/>`;
    const v = (t - (tM + 0.6)) / 1.05;
    if (v > 0) {
      const h = (v % 1) * 1.16, a = clamp(h - 0.16), b = clamp(h);
      if (b - a > 0.004) mp += `<path d="${G.d(a, b)}" fill="none" stroke="${C.white}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>`;
    }
  }
  mp += mapaTrilha(G, { terreno: false, u: 0, uEst: [1, 1, 1, 1, 1], t });   // as cinco estações, por cima da luz
  NIVEIS.forEach((n, i) => {
    const [ex, ey] = G.est(i);
    mp += onda(ex, ey, t - tPassa(i), { r0: 46, r1: 26, d: 0.45, sw: 5, c: corFx(i) });   // cada estação responde quando o pulso passa
  });

  // os pinos: A e B no lugar desde o início; os outros 23 entram área por área
  {
    const chao = [], ar = [];
    let alvo = '', fx = '';
    for (const p of PESSOAS) {
      const [x, y] = POS[p.id], nv = p.niv[0], cor = NIVEIS[nv].cor, tl = tPouso(p);
      const o = p.heroi ? 1 : 1 - 0.34 * recuo(p.area);                  // A e B são o fio da história: nunca recuam
      // o pulso de luz passa e o pino responde; depois, responde de novo quando a sua estação é contada
      const hopL = 7 * bat(t, tPassa(nv) + 0.02 + (p.id % 5) * 0.02, 0.26) + 6 * bat(t, tLe(nv) + 0.02 + (p.id % 5) * 0.02, 0.24);
      if (p.heroi) {
        // continuidade com a cena anterior: A e B começam grandes (escala 1, B ainda na beira da estrada) e, quando a
        // primeira leva chega, encolhem para o tamanho de todos e viram parte do mapa
        const uh = ease.inOut(inv(tJ - 0.55, tJ, t)), sh = lerp(1, SH, uh);
        const hx = p.heroi === 'B' ? lerp(PB0[0], x, uh) : x, hy = p.heroi === 'B' ? lerp(PB0[1], y, uh) : y;
        chao.push({ y: hy, svg: opa(o, pinoHeroi(hx, hy, { cor, s: sh, alt: hopL, letra: p.heroi })) });
        // um anel chama o olho para as duas posições que já existem
        fx += onda(hx, hy - 42 * sh, t - (t0 + 0.3 + (p.heroi === 'B' ? 0.14 : 0)), { r0: 32, r1: 36, d: 0.65, sw: 4, c: cor });
        continue;
      }
      alvo += mira(x, y, (t - (tl - TMIRA)) / TMIRA);
      const st = queda(t, tl, ALTURA[p.id]);
      if (!st) continue;
      if (st.ar) { ar.push({ y, svg: pinoCai(x, y, st, cor) }); continue; }
      chao.push({ y, svg: opa(o, pinoChao(x, y, { cor, alt: st.alt + hopL, sq: st.sq })) });
      fx += ondinha(x, y, st.s, corFx(nv));
    }
    chao.sort((a, b) => a.y - b.y);
    ar.sort((a, b) => a.y - b.y);
    mp += alvo + fx + chao.map(i => i.svg).join('') + ar.map(i => i.svg).join('');
  }
  // o total de cada marca nasce como um contador preso à estação (Resiste -> Multiplica)
  NIVEIS.forEach((n, i) => {
    const a = tLe(i), k = back(t, a, 0.36);
    if (k <= 0.001) return;
    const [ex, ey] = G.est(i), bx = ex - 33, by = ey - 33;
    const v = Math.max(1, Math.round(CONT[i] * ease.out(inv(a, a + 0.32, t))));
    mp += onda(ex, ey, t - a, { r0: 46, r1: 30, d: 0.5, sw: 5, c: corFx(i) })
      + pop(k, bx, by, `<circle cx="${f(bx)}" cy="${f(by)}" r="18" fill="${C.white}" stroke="${C.navy}" stroke-width="2.5"/>` + txt(String(v), bx, by + 7.8, { w: 700, s: 22, c: C.navy, a: 'middle' }));
  });

  {
    // recuo de câmera com o pé do mapa fixo: rápido no começo, assentando até 'nasce'; depois, um leve empurrão
    const pz = inv(t0 - 0.1, tN + 0.1, t), uz = 1 - (1 - pz) * (1 - pz);
    const z = lerp(1.12, 1, uz) + 0.02 * bat(t, tM - 0.04, 0.6) + 0.008 * ease.inOut(inv(tM + 0.5, t1, t));
    s += camera(mp, { z, cx: MCX, cy: CAMY, dy: CAMY - 675, r: lerp(-1.2, 0, uz) });
  }

  // ---------- título: a 1ª linha entra com a cena; o fio é a barra de progresso; em 'nasce', "Mapa de Adoção"
  // sobe de trás do fio, palavra por palavra (o resultado final é o mesmo de titulo(['*Mapa de Adoção*'])) ----------
  s += titulo(['Área por área, nasce o'], MG, TY, t, t0 + 0.15);
  {
    const NOME = 'Mapa de Adoção', wT = larg(NOME, TS, { f: 'L' }), y = TY2 + TS * 0.16, h = Math.max(4, TS * 0.075);
    // as palavras nascem atrás do fio (máscara) e param na linha de base
    if (t >= tN) {
      let pal = '', x = MG;
      const ws = NOME.split(' '), esp = (wT - ws.reduce((p, w) => p + larg(w, TS, { f: 'L' }), 0)) / (ws.length - 1);
      ws.forEach((w, i) => {
        const u = ease.out5(inv(tN + i * 0.07, tN + i * 0.07 + 0.5, t));
        if (u > 0) pal += `<g transform="translate(0 ${f((1 - u) * (TS + 8))})">` + txt(w, x, TY2, { f: 'L', s: TS, c: C.navy }) + `</g>`;
        x += larg(w, TS, { f: 'L' }) + esp;
      });
      s += t >= tN + 0.7 ? txt(NOME, MG, TY2, { f: 'L', s: TS, c: C.navy })
        : `<clipPath id="mp-tit"><rect x="${MG - 12}" y="${f(TY2 - TS - 6)}" width="${f(wT + 40)}" height="${f(TS + 6 + TS * 0.16 + h)}"/></clipPath><g clip-path="url(#mp-tit)">${pal}</g>`;
    }
    // o fio fica exatamente onde titulo() desenha o sublinhado do destaque: quatro trechos (um por área) que enchem
    // com os pousos e se fecham num fio só quando o nome chega
    const kT = ease.out(inv(t0 + 0.55, t0 + 1.05, t)), gap = 8 * (1 - ease.inOut(inv(tN - 0.1, tN + 0.25, t)));
    if (kT > 0) {
      let tr = '';
      TRECHOS.forEach(([a, b], i) => {
        const xa = MG + wT * a + (i ? gap / 2 : 0), xb = MG + wT * b - (i < 3 ? gap / 2 : 0);
        const xv = Math.min(xb, MG + wT * kT), xo = Math.min(xb, MG + wT * Math.min(prog, kT));
        if (xv > xa) tr += `<rect x="${f(xa)}" y="${f(y)}" width="${f(xv - xa)}" height="${f(h)}" fill="${C.navy20}"/>`;
        if (xo > xa) tr += `<rect x="${f(xa)}" y="${f(y)}" width="${f(xo - xa)}" height="${f(h)}" fill="${C.orange}"/>`;
      });
      // cabeça da barra: um ponto de luz na frente do preenchimento enquanto as pessoas entram
      const kc = Math.min(fin(t, tPop(0), 0.2), fout(t, tN - 0.1, 0.2));
      if (kc > 0.01) tr += `<circle cx="${f(MG + wT * Math.min(prog, kT))}" cy="${f(y + h / 2)}" r="${f(6 + 1.5 * Math.sin(t * 9))}" fill="${C.orange}" opacity="${f(kc)}"/>`;
      s += tr;
    }
  }

  // ---------- etiquetas das áreas: cada uma desliza quando a sua leva vai entrar e conta quem pousou ----------
  AREAS.forEach((nome, i) => {
    const a = tPop(i), k = back(t, a, 0.45);
    if (k <= 0.001) return;
    const y = LY0 + i * LDY, cy = y + LH / 2, wt = larg(nome, 28, { w: 700 }), w = wt + 108;
    const ativo = Math.min(fin(t, a, 0.2), fout(t, i < 3 ? tPop(i + 1) - 0.02 : tN - 0.15, 0.28));
    const quando = PESSOAS.filter(p => p.area === i).map(tPouso);
    const n = quando.filter(q => t >= q).length, ult = Math.max(-9, ...quando.filter(q => t >= q));
    const bate = 1 + 0.26 * Math.max(0, 1 - (t - ult) / 0.18);         // o contador pulsa a cada pouso
    const bx = LX + w - 30;
    const b = (ativo > 0.01 ? `<rect x="${f(LX - 5)}" y="${f(y - 5)}" width="${f(w + 10)}" height="${f(LH + 10)}" rx="${f(LH / 2 + 5)}" fill="none" stroke="${C.orange}" stroke-width="3.5" opacity="${f(ativo)}"/>` : '')
      + pilula(LX, y, w, LH, C.navy)
      + (ativo > 0.01 ? `<circle cx="${f(LX + 26)}" cy="${f(cy)}" r="${f(9 + 5 * (0.5 + 0.5 * Math.sin(t * 9)))}" fill="${C.orange}" opacity="${f(0.35 * ativo)}"/>` : '')
      + `<circle cx="${f(LX + 26)}" cy="${f(cy)}" r="7" fill="${C.orange}"/>`
      + txt(nome, LX + 46, cy + 10, { w: 700, s: 28, c: C.white })
      + pop(bate, bx, cy, `<circle cx="${f(bx)}" cy="${f(cy)}" r="19" fill="${ativo > 0.5 ? C.orange : C.white}"/>` + txt(String(n), bx, cy + 8.5, { w: 700, s: 24, c: C.navy, a: 'middle' }));
    const trava = 1 + 0.05 * bat(t, tM + 0.02 + i * 0.06, 0.34);       // as quatro respondem em cascata em 'mapa_adocao'
    s += `<g opacity="${f(clamp(k * 2))}" transform="translate(${f((1 - k) * -90)} 0) rotate(${f((1 - k) * -4)} ${f(LX)} ${f(cy)})">` + pop(trava, LX + 30, cy, b) + `</g>`;
  });

  // ---------- placar: conta ao vivo e trava em 'mapa_adocao' ----------
  {
    const a = t0 + 0.3, k = back(t, a, 0.5);
    if (k > 0.001) {
      const SN = 44, SL = 24, GAP = 9, SEP = 42, R = 21, ch = BAR.h, y0 = BAR.y, cy = y0 + ch / 2, yb = cy + 15.5;
      const itens = [[nP, 'pessoas', '25', ultP], [nA, nA > 1 ? 'áreas' : 'área', '4', ultA], [5, 'marcas', '5', -9]];
      const wn = itens.map(it => larg(it[2], SN, { f: 'L', w: 400 })), wl = ['pessoas', 'áreas', 'marcas'].map(r => larg(r, SL));
      const wSelo = larg('ILUSTRATIVO', 14, { w: 700, ls: 2.4 }) + 22;
      const cw = 14 + 2 * R + 20 + wn.reduce((p, q) => p + q, 0) + wl.reduce((p, q) => p + q, 0) + GAP * 3 + SEP * 2 + 30 + wSelo + 24;
      const x0 = (W - cw) / 2, cxD = x0 + 14 + R;
      const uT = inv(tM - 0.02, tM + 0.4, t);                            // 0 = contando, 1 = travado
      let corpo = '';
      // disco de estado: gira enquanto conta; em 'mapa_adocao' fecha o anel e desenha o visto
      {
        const rr = R + 0.5, per = 2 * Math.PI * (rr - 3.5), arco = lerp(0.28, 1, ease.inOut(uT));
        corpo += `<circle cx="${f(cxD)}" cy="${f(cy)}" r="${rr}" fill="${C.navy}"/>`
          + opa(1 - uT, icone('pino', cxD, cy, 25, { c: C.white, sw: 2.6 }))
          + opa(ease.out(uT), `<circle cx="${f(cxD)}" cy="${f(cy)}" r="${rr}" fill="${C.orange}"/>`)
          + `<circle cx="${f(cxD)}" cy="${f(cy)}" r="${f(rr - 3.5)}" fill="none" stroke="${uT > 0.5 ? C.navy : C.orange}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${f(per * arco)} ${f(per * (1 - arco) + 0.01)}" opacity="${f(1 - 0.75 * uT)}" transform="rotate(${f(t * 300 % 360)} ${f(cxD)} ${f(cy)})"/>`
          + tracar(`M${f(cxD - 9)},${f(cy + 0.5)} l6.5,6.5 l12,-13`, ease.out(inv(tM + 0.1, tM + 0.34, t)), { c: C.navy, sw: 4 });
      }
      let x = cxD + R + 20;
      itens.forEach(([v, r, , ult], i) => {
        const bate = 1 + 0.1 * Math.max(0, 1 - (t - ult) / 0.16) + 0.07 * bat(t, tM + 0.02 + i * 0.09, 0.3);
        corpo += pop(bate, x + wn[i], yb, txt(String(v), x + wn[i], yb, { f: 'L', w: 400, s: SN, c: C.navy, a: 'end' }))
          + txt(r, x + wn[i] + GAP, yb - 2, { s: SL, c: C.navy80 });
        x += wn[i] + GAP + wl[i];
        if (i < 2) { corpo += `<path d="M${f(x + SEP / 2)},${f(cy - 15)} v30" stroke="${C.navy20}" stroke-width="2" stroke-linecap="round"/>`; x += SEP; }
      });
      corpo += selo('Ilustrativo', x + 30, cy - 13);
      const kO = Math.min(fin(t, tM - 0.02, 0.12), fout(t, tM + 0.45, 0.8));
      const cartao = sombra(`<rect x="${f(x0)}" y="${y0}" width="${f(cw)}" height="${ch}" rx="${ch / 2}" fill="${C.white}" stroke="${C.navy20}" stroke-width="1.5"/>`, true)
        + (kO > 0.01 ? `<rect x="${f(x0)}" y="${y0}" width="${f(cw)}" height="${ch}" rx="${ch / 2}" fill="none" stroke="${C.orange}" stroke-width="4" opacity="${f(kO)}"/>` : '')
        + varredura('mp-var', x0, y0, cw, ch, inv(tM + 0.02, tM + 0.62, t), ch / 2, C.orange40) + corpo;
      s += `<g transform="translate(0 ${f((1 - k) * 30)})">` + pop((0.8 + 0.2 * k) * (1 + 0.045 * bat(t, tM - 0.02, 0.45)), W / 2, cy, opa(clamp(k * 1.7), cartao)) + `</g>`;
    }
  }

  // ---------- salvaguardas no pé do palco ----------
  {
    const a = t0 + 0.42, k = fin(t, a, 0.45);
    if (k > 0.001) {
      const f1 = 'Leitura agregada por área.', f2 = 'Retrato do momento, neste projeto. Não é avaliação de desempenho.';
      const w1 = larg(f1, 21, { w: 700 }), w2 = larg(f2, 21), gap = 28, w = w1 + gap + w2 + 44, x0 = (W - w) / 2, yb = PE.y + 25;
      s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - k) * 12)})"><rect x="${f(x0)}" y="${PE.y}" width="${f(w)}" height="${PE.h}" rx="${PE.h / 2}" fill="#fff" opacity=".88"/>`
        + txt(f1, x0 + 22, yb, { w: 700, s: 21, c: C.navy80 })
        + `<path d="M${f(x0 + 22 + w1 + gap / 2)},${PE.y + 9} v18" stroke="${C.navy40}" stroke-width="1.5"/>`
        + txt(f2, x0 + 22 + w1 + gap, yb, { s: 21, c: C.navy80 }) + `</g>`;
    }
  }
  return s;
}
