// Cena "pergunta" (72,46–76,48 s): "No seu projeto, você sabe onde cada pessoa está hoje?"
// Versão limpa, 16:9 (1920 x 1080), esquema A · duas colunas. Dois blocos e nada mais:
//   1. à esquerda (x 96–900), a PERGUNTA em Light 112 px, quatro linhas centradas na vertical; cada palavra entra no
//      instante da fala (fade + subida curta) e só "hoje?" fica em laranja (o foco do fim da cena);
//   2. à direita (x 900–1920), o mapa de trilha noturno ocupando a altura toda do palco: a estrada entra pela base,
//      sobe em zigue-zague e sai pela borda direita; as cinco estações ainda apagadas e 25 pinos cinza com "?".
//      Em 'voce_sabe' os pinos ganham a cor da sua marca em cascata, da esquerda para a direita, e deslizam até a
//      estação mais próxima, que acende. Depois disso tudo fica parado.
//      O mapa é desenhado numa geometria local (LW x LA) e ampliado K vezes: "?" dos pinos com 33 px no quadro.
// Sem câmera, sem contador, sem feixe de leitura, sem halos, rastros ou anéis. O único detalhe vivo é o tracejado da
// estrada, bem lento. Sem personagens: pessoas são pinos.
import { MG, C, txt, larg, fin, opa, pop, icone, clamp, lerp, inv, ease, n2, rng } from '../base.js';
import { NIVEIS, contagem } from '../modelo.js';
import { fundoNoite, geoTrilha } from '../ludico.js';

const f = n2;
export const FUNDO = 'navy';
export const LEGENDA = false;

// ---------- tipografia ----------
const TS = 112, TLS = -2.2, LH = 136, TY = 412;            // Light 112 px, quatro linhas (bases 412/548/684/820)
// cada linha: palavras [texto, índice em tempos.palavras, destaque]
const LINHAS = [
  [['No', 145], ['seu', 146], ['projeto,', 147]],
  [['você', 148], ['sabe', 149], ['onde', 150]],
  [['cada', 151], ['pessoa', 152]],
  [['está', 153], ['hoje?', 154, 1]],
];

// ---------- cores ----------
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
const CINZA = mix(C.navy80, C.navy40, 0.3);                // pino sem leitura: cinza-azulado
const APAGADA = '#0B3554';                                 // estação ainda sem leitura

// ---------- mapa de trilha (apoio) ----------
// geometria local do mapa; no quadro vira translate(MX MY) scale(K): x 880–1840, y 138–1093 (a estrada entra pela
// base e sai pela borda direita)
const K = 1.4, MX = 880, MY = 138, LW = 686, LA = 682;
const G = geoTrilha(0, 0, LW, LA);
const X0 = 80, X1 = 650, Y0 = 78, Y1 = 636;                // área onde os pinos nascem (ponta do pino, coordenadas locais)
const PS = 0.74;                                           // escala local dos pinos ("?" com 32 x 0,74 x K = 33 px no quadro)
const RE = 42;                                             // raio local das estações (59 px no quadro)
const CONT = contagem(2);                                  // pessoas por marca hoje (onda 3): [1, 4, 6, 9, 5]
const CASC = 1.1;                                          // duração da cascata de cor (s), da esquerda para a direita
// lugares em volta de cada estação: um arco limpo de pinos (até 6), mais um segundo arco por fora quando há mais gente,
// sempre do lado livre da estrada. DIR = direção do centro do arco (rad). Devolve a ponta de cada pino.
const DIR = [-2.1, -1.8, -0.36, -2.7, -2.08];
const PASSO = [0.46, 0.46, 0.46, 0.46, 0.42];              // abertura entre pinos do arco de dentro (a 5ª estação fica entre dois trechos da estrada)
const CAB = 31;                                            // altura do centro da cabeça do pino acima da ponta
function vagas(n, q) {
  const [ex, ey] = G.est(n), dentro = q <= 6 ? q : 5, out = [];
  const arco = (m, raio, passo) => { for (let j = 0; j < m; j++) { const a = DIR[n] + (j - (m - 1) / 2) * passo; out.push([ex + Math.cos(a) * raio, ey + Math.sin(a) * raio + CAB]); } };
  arco(dentro, 98, PASSO[n]);
  arco(q - dentro, 160, 0.3);
  return out;
}
// pinos: espalhados numa grade 5 x 5 com ruído (x, y = ponta do pino), longe das estações; cada um vai para um lugar
// perto dele (trajetos curtos, ninguém cruza o mapa inteiro)
const PINOS = (() => {
  const R = rng(4107), ps = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    let x = X0 + (c + 0.5 + (R() - 0.5) * 0.62 + (r % 2 ? 0.2 : -0.2)) * (X1 - X0) / 5;
    let y = Y0 + (r + 0.5 + (R() - 0.5) * 0.6) * (Y1 - Y0) / 5;
    for (let i = 0; i < 5; i++) {                           // afasta das estações
      const [ex, ey] = G.est(i), dx = x - ex, dy = y - CAB - ey, d = Math.hypot(dx, dy);
      if (d < 84) { x = ex + dx / (d || 1) * 88; y = ey + CAB + dy / (d || 1) * 88; }
    }
    ps.push({ x: clamp(x, X0, X1), y: clamp(y, Y0, Y1) });
  }
  // os 25 lugares (marca + ponta do pino) e o casamento pino -> lugar: começa na ordem e troca pares enquanto a soma
  // dos quadrados das distâncias diminuir (determinístico)
  const lug = [];
  NIVEIS.forEach((_, n) => vagas(n, CONT[n]).forEach(([vx, vy]) => lug.push({ n, vx, vy })));
  const d2 = (p, l) => (p.x - l.vx) ** 2 + (p.y - l.vy) ** 2, de = ps.map((_, i) => i);
  for (let volta = 0, mudou = true; mudou && volta < 60; volta++) {
    mudou = false;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      if (d2(ps[i], lug[de[j]]) + d2(ps[j], lug[de[i]]) < d2(ps[i], lug[de[i]]) + d2(ps[j], lug[de[j]]) - 1e-6) { [de[i], de[j]] = [de[j], de[i]]; mudou = true; }
    }
  }
  ps.forEach((p, i) => Object.assign(p, lug[de[i]]));
  ps.forEach(p => {
    p.dur = clamp(0.4 + Math.hypot(p.vx - p.x, p.vy - p.y) / 1600, 0.42, 0.55);
    p.ts = CASC * inv(X0, X1, p.x);                        // atraso na cascata: ganha cor em ts, sai em ts + 0,08
    p.tp = p.ts + 0.08 + p.dur;                             // pousa em tp
  });
  return ps;
})();
const POUSO = NIVEIS.map((_, n) => Math.min(...PINOS.filter(p => p.n === n).map(p => p.tp)));   // 1º pino de cada estação
// estrada inteira, com um trecho a mais de cada lado para sair do quadro
const ESTRADA = (() => {
  const [x0, y0, a0] = G.em(0), [x1, y1, a1] = G.em(1);
  return u => `M${f(x0 - Math.cos(a0) * 170)},${f(y0 - Math.sin(a0) * 170)} L` + G.d(0, u).slice(1) + (u >= 1 ? `L${f(x1 + Math.cos(a1) * 90)},${f(y1 + Math.sin(a1) * 90)}` : '');
})();

// pino (gota) com a ponta em (x, y). k = entrada; q = quanto do "?" ainda aparece (1 = sem leitura, 0 = localizado)
function pino(x, y, o) {
  if (o.k <= 0.001) return '';
  const b = `<path d="M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z" fill="${o.cor}" stroke="${o.borda}" stroke-width="3.500"/>`
    + (o.q < 0.999 ? `<circle cx="0" cy="-42" r="${f(10.5 * (1 - o.q))}" fill="${C.white}"/>` : '')
    + (o.q > 0.001 ? txt('?', 0, -30.5, { w: 700, s: 32, c: C.white, a: 'middle', o: o.q }) : '');
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(PS * (0.8 + 0.2 * o.k))})"${o.k < 0.999 ? ` opacity="${f(o.k)}"` : ''}>${b}</g>`;
}

export function desenhar(t, ctx) {
  const { t0, m, wa } = ctx;
  const tA = m('voce_sabe') - 0.1;                         // começa a cascata de cor

  // ---------- estrada (o tracejado corre devagar: único detalhe vivo) ----------
  let mapa = '';
  const uE = ease.inOut(inv(t0 + 0.1, t0 + 0.6, t));
  if (uE > 0) {
    const d = ESTRADA(uE);
    mapa += `<path d="${d}" fill="none" stroke="${C.blue80}" stroke-opacity=".5" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${d}" fill="none" stroke="${C.navy}" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${d}" fill="none" stroke="${C.blue20}" stroke-opacity=".8" stroke-width="3" stroke-dasharray="16 16" stroke-dashoffset="${f(-t * 14)}" stroke-linecap="round"/>`;
  }

  // ---------- estações: apagadas no início; ganham a cor da marca quando o primeiro pino chega ----------
  NIVEIS.forEach((nv, n) => {
    const tn = t0 + 0.15 + 0.45 * G.uEst[n], kN = fin(t, tn, 0.3);
    if (kN <= 0.001) return;
    const [ex, ey] = G.est(n), aceso = fin(t, tA + POUSO[n] - 0.05, 0.3);
    let b = `<circle cx="${f(ex)}" cy="${f(ey)}" r="${RE}" fill="${APAGADA}" stroke="${C.blue80}" stroke-width="3"/>`
      + icone(nv.ic, ex, ey, RE * 1.12, { c: C.blue40, sw: 3 });
    if (aceso > 0.001) b += opa(aceso, `<circle cx="${f(ex)}" cy="${f(ey)}" r="${RE}" fill="${nv.cor}" stroke="${C.white}" stroke-width="5"/>`
      + icone(nv.ic, ex, ey, RE * 1.12, { c: nv.tx, sw: 3.4 }));
    mapa += opa(kN, pop(0.85 + 0.15 * kN, ex, ey, b));
  });

  // ---------- pinos: ganham cor em cascata e vão para a estação ----------
  mapa += PINOS.map(p => {
    const cor = NIVEIS[p.n].cor;
    const kIn = fin(t, t0 + 0.15 + 0.2 * (p.x / LW), 0.3);
    const kc = fin(t, tA + p.ts, 0.2), e = ease.inOut(inv(tA + p.ts + 0.08, tA + p.tp, t));
    const y = lerp(p.y, p.vy, e);
    return { y, svg: pino(lerp(p.x, p.vx, e), y, { k: kIn, cor: mix(CINZA, cor, kc), borda: mix(C.navy40, C.white, kc), q: 1 - kc }) };
  }).sort((a, b) => a.y - b.y).map(p => p.svg).join('');

  // ---------- pergunta: cada palavra entra na fala (fade + subida curta) ----------
  let texto = '';
  const esp = larg(' ', TS, { f: 'L' }) + TLS;
  LINHAS.forEach((ln, li) => {
    let x = MG;
    const y = TY + li * LH;
    ln.forEach(([w, wi, hi]) => {
      const k = ease.out(inv(wa(wi) - 0.08, wa(wi) + 0.3, t));
      if (k > 0.001) texto += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - k) * 22)})">${txt(w, x, y, { f: 'L', s: TS, c: hi ? C.orange : C.white, ls: TLS })}</g>`;
      x += larg(w, TS, { f: 'L', ls: TLS }) + esp;
    });
  });

  return fundoNoite(t, { seed: 21 }) + `<g transform="translate(${MX} ${MY}) scale(${K})">${mapa}</g>` + texto;
}
