// As 3 páginas do carrossel. Cada função desenha o miolo da página (entre o cabeçalho e o rodapé)
// no tempo local tt (s), seguindo os beats B de tempos.json. modo.estatico = true desenha o estado
// final sem pulsos (PDF).
import { W, C, t, tRico, kicker, quebra, op, fin, inv, ease, n2, varredura } from './base.js';
import { titulo, graficoLinha, faixaNumeros, abismo, matriz, legendaMatriz, barraEmpilhada, etapas, indicadores, equacao, prova } from './componentes.js';
import { P1, P2, P3 } from './dados.js';

const f = n2;

// rótulo de bloco em mono laranja-escuro
const rotulo = (str, x, y, tt, a0) => op(fin(tt, a0, 0.4), t(str.toUpperCase(), x, y, { f: 'M', w: 600, s: 16, c: C.orangeD, ls: 1.6 }));

// número grande da página ao fundo, no canto superior direito do miolo
const marcaDagua = (i, tt, a0) => op(fin(tt, a0, 0.8), t(`0${i}`, 1036, 330, { f: 'H', w: 800, s: 210, c: '#F2F5F9', a: 'end', ls: -2 }));

// "so what": faixa com barra laranja à esquerda e texto em navy
function conclusao(str, x, y, w, tt, a0, o = {}) {
  const s = o.s ?? 22, lh = s * 1.36;
  const linhas = quebra(str, s, w - 56, 500, 'B');
  const h = linhas.length * lh + 30;
  const k = ease.out(inv(a0, a0 + 0.5, tt));
  if (k <= 0) return '';
  let b = `<rect x="${f(x)}" y="${f(y)}" width="${f(w * k)}" height="${f(h)}" rx="10" fill="${o.fundo ?? C.orangeBg}"/>`
    + `<rect x="${f(x)}" y="${f(y)}" width="6" height="${f(h)}" rx="3" fill="${C.orange}"/>`;
  linhas.forEach((l, i) => {
    b += op(fin(tt, a0 + 0.25 + i * 0.1, 0.4), tRico(l, x + 30, y + 15 + s * 0.98 + i * lh, { f: 'B', w: 500, s, c: C.navy, hi: C.orangeD, hw: 700 }));
  });
  return b + varredura('vconc' + Math.round(y), x, y, w, h, inv(a0 + 0.6, a0 + 1.6, tt), 10);
}

// ---------- página 1 · contexto ----------
export function pagina1(tt, B) {
  let s = marcaDagua(1, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P1.kicker, 48, 190));
  s += titulo(P1.titulo, 48, 258, tt, B.titulo, { s: 66, lh: 68 });
  // gráfico de adoção
  const gy = 378, G = P1.grafico;
  s += op(fin(tt, B.grafico - 0.5, 0.4), t(G.titulo, 48, gy, { f: 'B', w: 600, s: 17, c: C.slate }));
  const [sa, sb] = G.series;
  const anos = Array.from({ length: G.x1 - G.x0 + 1 }, (_, i) => G.x0 + i);
  s += graficoLinha({
    x: 96, y: gy + 76, w: 800, h: 280, x0: G.x0, x1: G.x1, yMax: 100, t0: B.grafico, dur: 2.4, pilulaH: 42, pilulaW: 92, anosEixo: anos,
    series: [
      { ...sa, cor: C.navy, legX: 48, legY: gy + 40, areaOp: 0.08, rotDyPrimeiro: 30 },
      { ...sb, cor: C.orange, legX: 300, legY: gy + 40, atraso: 1.3, area: false, corRot: C.orangeD, rotDy: 32, corTxtPilula: C.navy },
    ],
  }, tt);
  s += faixaNumeros({ x: 112, y: gy + 76, w: 560, h: 84, t0: B.grafico + 2.6, titulo: P1.faixa.titulo, semBarra: true,
    itens: P1.faixa.itens.map((it, i) => ({ ...it, cor: it.cor ?? [C.orange, C.slate, C.blueL][i] })) }, tt);
  // o abismo
  const fy = 808;
  s += op(fin(tt, B.funil - 0.35, 0.4), tRico(P1.abismoTitulo, 48, fy, { f: 'B', w: 700, s: 21, c: C.navy, hi: C.orangeD }));
  s += op(fin(tt, B.funil + 2.4, 0.4), t(P1.abismoNota, 48, 1066, { f: 'B', w: 500, s: 15, c: C.slate }));
  s += abismo({ x: 48, y: fy + 20, w: 984, hBar: 44, gap: 18, numW: 100, t0: B.funil, step: 0.6,
    itens: P1.abismo.map((it, i) => ({ ...it, cor: [C.navy, C.slate, C.orange][i] })) }, tt);
  s += conclusao(P1.conclusao, 48, 1086, 984, tt, B.conclusao, { s: 21 });
  return s;
}

// ---------- página 2 · desafio ----------
export function pagina2(tt, B, modo = {}) {
  let s = marcaDagua(2, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P2.kicker, 48, 190));
  s += titulo(P2.titulo, 48, 258, tt, B.titulo, { s: 64, lh: 68 });
  // regra 10-20-70
  const ry = 378;
  s += rotulo(P2.regra.rotulo, 48, ry, tt, B.barra - 0.4);
  s += barraEmpilhada({ x: 48, y: ry + 16, w: 984, h: 54, t0: B.barra, nota: P2.regra.nota,
    partes: P2.regra.partes.map((p, i) => ({ ...p, cor: [C.blueL, C.slate, C.orange][i], corTxt: i === 1 ? '#fff' : C.navy })) }, tt);
  // matriz + legenda
  const my = 526;
  s += rotulo(P2.matrizTitulo, 48, my, tt, B.matriz - 0.4);
  s += op(fin(tt, B.matriz - 0.2, 0.4), t(P2.matrizEscala, 48, my + 24, { f: 'B', w: 500, s: 14.5, c: C.slate }));
  const nat = Object.fromEntries(P2.desafios.map(d => [d.n, d.nat]));
  const M = { x: 112, y: my + 80, size: 408, itens: P2.desafios, t0: B.matriz, step: 0.4, r: 20, rTrio: 16, fimPulso: modo.estatico ? -1 : 1e9 };
  s += matriz(M, tt);
  s += legendaMatriz({ x: 572, y: my + 92, w: 460, itens: P2.desafios, t0: B.matriz, step: 0.4, gap: 10 }, tt).svg;
  // chave de cores da legenda
  s += op(fin(tt, B.matriz + 1.2, 0.4), `<circle cx="586" cy="${my + 54}" r="8" fill="${C.navy}"/>` + t('pessoas/processos', 601, my + 60, { f: 'B', w: 600, s: 15, c: C.slate })
    + `<circle cx="766" cy="${my + 54}" r="8" fill="#fff" stroke="${C.blue}" stroke-width="2"/>` + t('tecnologia', 781, my + 60, { f: 'B', w: 600, s: 15, c: C.slate })
    + `<rect x="890" y="${my + 50}" width="8" height="8" rx="2" fill="${C.orangeD}" transform="rotate(45 894 ${my + 54})"/>` + t('crítico', 907, my + 60, { f: 'B', w: 600, s: 15, c: C.slate }));
  void nat;
  // foco na zona crítica (só no vídeo)
  if (!modo.estatico) {
    const k = Math.min(ease.out(inv(B.foco, B.foco + 0.5, tt)), 1 - ease.out(inv(B.focoFim - 0.4, B.focoFim, tt)));
    if (k > 0) {
      const cs = (M.size - 20) / 5, x0 = M.x + 3 * (cs + 5) - 9, y0 = M.y - 44, w = 2 * (cs + 5) + 14, h = 2 * (cs + 5) + 50;
      s += `<path d="M0,140 L${W},140 L${W},1230 L0,1230Z M${f(x0)},${f(y0)} L${f(x0 + w)},${f(y0)} L${f(x0 + w)},${f(y0 + h)} L${f(x0)},${f(y0 + h)}Z" fill="${C.dark}" fill-rule="evenodd" opacity="${f(0.5 * k)}"/>`;
    }
  }
  s += conclusao(P2.conclusao, 48, 1104, 984, tt, B.conclusao);
  return s;
}

// ---------- página 3 · o que fazemos ----------
export function pagina3(tt, B) {
  let s = marcaDagua(3, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P3.kicker, 48, 190));
  s += titulo(P3.titulo, 48, 258, tt, B.titulo, { s: 66, lh: 68 });
  // equação
  s += equacao({ x: 48, y: 368, w: 984, h: 88, t0: B.equacao, ops: ['×', '='],
    termos: [
      { ...P3.equacao[0], cor: C.navy, s: 34 },
      { ...P3.equacao[1], cor: C.navy3, s: 29 },
      { ...P3.equacao[2], cor: C.orange, txt: C.navy, subCor: C.navy, s: 34, brilho: true },
    ] }, tt);
  s += op(fin(tt, B.equacao + 1.5, 0.45), tRico(P3.equacaoNota, 540, 492, { f: 'B', w: 500, s: 19, c: C.slate, hi: C.orangeD, a: 'middle' }));
  // método
  const nat = Object.fromEntries((P2.desafios ?? []).map(d => [d.n, d.nat]));
  s += rotulo(P3.metodoTitulo, 48, 534, tt, B.etapas - 0.4);
  s += etapas({ x: 48, y: 550, w: 984, h: 96, t0: B.etapas, step: 0.42, itens: P3.etapas, nat }, tt);
  // indicadores
  s += rotulo(P3.kpisTitulo, 48, 780, tt, B.kpis - 0.3);
  s += indicadores({ x: 48, y: 796, w: 984, h: 66, gap: 12, t0: B.kpis, step: 0.16, itens: P3.kpis }, tt);
  // prova (7x) + CTA
  const by = 890, bh = 300;
  const Pv = P3.prova;
  s += prova({ x: 48, y: by, w: 320, h: bh, num: Pv.num, rot: Pv.rot, barras: Pv.barras, eixo: Pv.eixo, nota: Pv.nota, t0: B.selo }, tt);
  const cx = 386, cw = 1032 - cx;
  const k = ease.out(inv(B.cta, B.cta + 0.55, tt));
  if (k > 0) {
    const Q = P3.cta;
    let b = `<rect x="${cx}" y="${by}" width="${cw}" height="${bh}" rx="14" fill="${C.navy}"/>`
      + `<clipPath id="ctaClip"><rect x="${cx}" y="${by}" width="${cw}" height="${bh}" rx="14"/></clipPath>`
      + `<g clip-path="url(#ctaClip)"><path d="M${cx + cw - 70},${by + bh} L${cx + cw + 20},${by}" stroke="${C.slate}" stroke-width="30"/><path d="M${cx + cw - 120},${by + bh} L${cx + cw - 30},${by}" stroke="${C.orange}" stroke-width="2.4"/></g>`;
    b += op(fin(tt, B.cta + 0.2, 0.4), t(Q.pergunta, cx + 34, by + 64, { f: 'H', w: 700, s: 40, c: '#fff', ls: 0.3 }));
    b += op(fin(tt, B.cta + 0.5, 0.4), tRico(Q.destaque, cx + 34, by + 118, { f: 'H', w: 800, s: 50, c: '#fff', hi: C.orange, ls: 0.3 }));
    b += op(fin(tt, B.final, 0.45), `<rect x="${cx + 34}" y="${by + 152}" width="${cw - 230}" height="1.5" fill="#fff" opacity=".25"/>`
      + t(Q.acao, cx + 34, by + 194, { f: 'B', w: 700, s: 21, c: '#fff' })
      + t(Q.acao2, cx + 34, by + 226, { f: 'B', w: 500, s: 18, c: C.blueLL })
      + t(Q.lema, cx + 34, by + 268, { f: 'M', w: 500, s: 15, c: C.orangeL, ls: 1.5 }));
    s += `<g opacity="${f(Math.min(1, k * 1.4))}" transform="translate(${f((1 - k) * 40)} 0)">${b}</g>`;
    s += varredura('vcta', cx, by, cw, bh, inv(B.final + 0.2, B.final + 1.3, tt), 14);
  }
  return s;
}

export const PAGINAS = [
  { desenha: pagina1, fontes: () => P1.fontes },
  { desenha: pagina2, fontes: () => P2.fontes },
  { desenha: pagina3, fontes: () => P3.fontes },
];
