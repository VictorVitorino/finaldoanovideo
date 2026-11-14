// Cena "titulo" (16,41–20,40 s): "Por isso existe o Mapa de Perfil Cognitivo." · versão 16:9, esquema A (duas colunas).
// Versão limpa: três blocos e nada mais. À esquerda, centrados na vertical: "Por isso existe" (com a fala), o título
// em duas linhas e o subtítulo. À direita, UM visual: o mapa em cartão. O cartão sobe e assenta, a estrada se desenha,
// cada uma das cinco estações acende quando a estrada chega nela e, em 'cognitivo', o pino laranja crava na estrada:
// perfil vira posição. Depois que entra, tudo fica parado; o único detalhe vivo é o tracejado da estrada.
// Sem logo, sem personagens, sem câmera e sem clarões: só as cores da paleta.
import { W, MG, C, txt, larg, fin, sobe, opa, onda, clamp, lerp, inv, ease, n2 } from '../base.js';
import { geoTrilha, mapaTrilha, pinoMapa, fundoNoite } from '../ludico.js';

const f = n2;
export const FUNDO = 'navy';
export const LEGENDA = false;

// ---------- o mapa em cartão (coluna da direita: x 860–1824, y 150–900) ----------
const PX = 860, PY = 150, PW = W - MG - PX, PH = 750, RC = 26;
const BD = 16;                                             // moldura branca
const AX = PX + BD, AY = PY + BD, AW = PW - 2 * BD, AH = PH - 2 * BD;   // área impressa
const KM = 1.2;                                            // o mapa de trilha é desenhado menor e ampliado: estações grandes
const GH = 540;                                            // altura do mapa na geometria própria
const GW = 840;                                            // largura do mapa na geometria própria (a estrada entra e sai pelas bordas do cartão)
const G = geoTrilha(0, 0, GW, GH);
// conteúdo do mapa na vertical: do topo da bandeira mais alta (0,18·GH − 101) à borda de baixo da estrada (0,93·GH + 35)
const FOLGA = AH - KM * (0.75 * GH + 136);                 // sobra vertical dentro da área impressa
const GX = AX + AW / 2 - KM * 0.475 * GW;                  // as estações (0,15 a 0,80 da largura) ficam centradas no cartão
const GY = AY + FOLGA * 0.6 - KM * (0.18 * GH - 101);      // um pouco mais de respiro em cima (bandeira) do que embaixo
const loc = ([gx, gy]) => [GX + KM * gx, GY + KM * gy];
const UPIN = lerp(G.uEst[0], G.uEst[1], 0.52);             // onde o pino crava: na estrada, entre Resiste e Observa (trecho livre)
const PIN = loc(G.em(UPIN));
const PS = 2.2;                                            // tamanho do pino (proporcional às estações ampliadas)
const QUEDA = 130;                                         // altura de onde o pino desce

const CLIP = `<clipPath id="tt-area"><rect x="${AX}" y="${AY}" width="${AW}" height="${AH}" rx="12"/></clipPath>`;
// papel: uma sombra só (desfocada), a moldura branca e o terreno liso
const PAPEL = `<g filter="url(#fx-blur)"><rect x="${PX + 8}" y="${PY + 30}" width="${PW - 16}" height="${PH}" rx="${RC}" fill="#00101C" opacity=".5"/></g>`
  + `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="${RC}" fill="${C.white}"/>`
  + `<rect x="${AX}" y="${AY}" width="${AW}" height="${AH}" rx="12" fill="url(#g-terra)"/>`;

// ---------- tipografia (coluna da esquerda: nasce na margem de 96 px e fica centrada na altura do cartão) ----------
const KS = 34;                                            // "Por isso existe"
const TS = 100, TLS = -1.8;                               // título (Light), duas linhas: "Perfil Cognitivo" vai de 90 a ~770
const SS = 34;                                            // subtítulo
const D1 = 110, D2 = 114, D3 = 82;                        // passos entre as linhas de base
const BLOCO = 24 + D1 + D2 + D3 + 9;                      // do topo das maiúsculas da 1ª linha ao pé da última
const KY = Math.round(PY + PH / 2 - BLOCO / 2 + 24);      // linha de base de "Por isso existe"
const Y1 = KY + D1, Y2 = Y1 + D2, SY = Y2 + D3;
const TX = MG - 6;                                        // alinhamento óptico: a haste do M e do P cai na margem
const ESP_K = larg('a a', KS) - 2 * larg('a', KS);
const ESP_S = larg('a a', SS) - 2 * larg('a', SS);
const SUB = (() => {
  const partes = [['e, com ele, o', 400, C.navy20], ['Mapa de Adoção', 700, C.white], ['do projeto', 400, C.navy20]];
  let x = MG, s = '';
  partes.forEach(([str, w, c]) => { s += txt(str, x, SY, { s: SS, w, c }); x += larg(str, SS, { w }) + ESP_S; });
  return s;
})();
// posição de cada palavra do título (mesmo espaçamento entre letras da linha inteira)
const xPal = (antes) => TX + larg(antes, TS, { f: 'L' }) + TLS * antes.length;

export function desenhar(t, ctx) {
  const { t0, m, wa, T } = ctx;
  const iPor = T.marcas.por_isso.i, iMapa = T.marcas.mapa_perfil.i;
  const tPor = m('por_isso');
  const tTit = m('mapa_perfil') - 0.02;                   // o título entra com a fala
  const tCog = m('cognitivo');
  const tPouso = tCog + 0.05;                             // o pino crava junto com o sino
  const tEntra = t0 + 0.1;                                // o cartão sobe e assenta
  const tR0 = tEntra + 0.3, tR1 = tTit;                   // a estrada se desenha devagar, até o título entrar
  const tSub = tPouso + 0.3;                              // o subtítulo vem depois do pino: um foco por vez

  let s = fundoNoite(t);

  // ---------- "Por isso existe": palavra a palavra, com a fala ----------
  {
    let x = MG;
    ['Por', 'isso', 'existe'].forEach((p, i) => {
      s += sobe(fin(t, wa(iPor + i) - 0.07, 0.3), txt(p, x, KY, { s: KS, c: C.navy20 }), 16);
      x += larg(p, KS) + ESP_K;
    });
  }

  // ---------- título: cada palavra entra com a fala (fade + subida curta) ----------
  {
    const pal = (str, x, y, cor, ti) => sobe(fin(t, ti, 0.4), txt(str, x, y, { f: 'L', s: TS, c: cor, ls: TLS }), 24);
    s += pal('Mapa', TX, Y1, C.white, tTit)
      + pal('de', xPal('Mapa '), Y1, C.white, wa(iMapa + 1) - 0.06)
      + pal('Perfil', TX, Y2, C.orange, wa(iMapa + 2) - 0.07)
      + pal('Cognitivo', xPal('Perfil '), Y2, C.orange, wa(iMapa + 3) - 0.07);
    s += sobe(fin(t, tSub, 0.45), SUB, 18);
  }

  // ---------- o mapa em cartão ----------
  const kC = fin(t, tEntra, 0.6);
  if (kC > 0.001) {
    // estrada e estações: cada estação nasce quando a estrada chega nela
    const uRoad = inv(tR0, tR1, t);
    const chega = alvo => { let a = 0, b = 1; for (let i = 0; i < 18; i++) { const mid = (a + b) / 2; if (ease.inOut(mid) < alvo) a = mid; else b = mid; } return lerp(tR0, tR1, a); };
    const uEst = G.uEst.map(u => inv(0, 0.4, t - (chega(u) - 0.04)));
    // o tracejado da estrada corre (único detalhe vivo); as estações ficam paradas (t fixo: bandeiras quietas)
    const via = mapaTrilha(G, { u: uRoad, uEst: [0, 0, 0, 0, 0], t, terreno: false, rotulos: false })
      + mapaTrilha(G, { u: 0, uEst, t: 0, terreno: false, rotulos: false });
    let mp = CLIP + PAPEL + `<g clip-path="url(#tt-area)"><g transform="translate(${f(GX)} ${f(GY)}) scale(${KM})">${via}</g></g>`;

    // pino laranja: desce e crava na estrada em 'cognitivo'
    const aP = t - tPouso, tQ = tPouso - 0.3;
    if (t > tQ) {
      const [px, py] = PIN;
      const u = inv(tQ, tPouso, t), e = ease.in(u);
      mp += onda(px, py, aP, { c: C.orange, r0: 22, r1: 60, d: 0.6 });
      // ao cravar: um aperto curto e pronto
      const am = aP < 0 ? 0 : 0.07 * Math.sin(Math.PI * inv(0, 0.16, aP));
      // a sombra do pino fica no chão, no ponto do pouso, enquanto ele desce (o 'hop' do kit separa o pino da sombra);
      // no quadro grande, a sombra descendo junto com o pino ficava solta no ar
      const hop = QUEDA * (1 - e) / (1.9 * PS);
      mp += opa(clamp(u * 3), `<g transform="translate(${f(px)} ${f(py - 0.9 * PS * hop)}) scale(${f(1 + am * 0.6)} ${f(1 - am)})">${pinoMapa(0, 0, { cor: C.orange, s: PS, hop })}</g>`);
    }
    s += sobe(kC, mp, 44);
  }

  return s;
}
