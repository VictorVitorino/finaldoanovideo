// As 3 páginas do carrossel. Cada função desenha o miolo da página (entre o cabeçalho e o rodapé)
// no tempo local tt (s), seguindo os beats B de tempos.json. modo.estatico = true desenha o estado
// final sem pulsos (PDF).
import { W, C, t, tRico, kicker, quebra, op, fin, clamp, inv, ease, n2, varredura } from './base.js';
import { titulo, graficoLinha, faixaNumeros, funil, matriz, legendaMatriz, barraEmpilhada, etapas, indicadores, equacao, selo } from './componentes.js';
import { P1, P2, P3 } from './dados.js';

const f = n2;

// rótulo de bloco em mono laranja-escuro
const rotulo = (str, x, y, tt, a0) => op(fin(tt, a0, 0.4), t(str.toUpperCase(), x, y, { f: 'M', w: 600, s: 14, c: C.orangeD, ls: 2 }));

// "so what": faixa com barra laranja à esquerda e texto em navy
function conclusao(str, x, y, w, tt, a0, o = {}) {
  const s = o.s ?? 23, lh = s * 1.36;
  const linhas = quebra(str, s, w - 56, 500, 'B');
  const h = linhas.length * lh + 34;
  const k = ease.out(inv(a0, a0 + 0.5, tt));
  if (k <= 0) return '';
  let b = `<rect x="${f(x)}" y="${f(y)}" width="${f(w * k)}" height="${f(h)}" rx="10" fill="${o.fundo ?? C.orangeBg}"/>`
    + `<rect x="${f(x)}" y="${f(y)}" width="6" height="${f(h)}" rx="3" fill="${C.orange}"/>`;
  linhas.forEach((l, i) => {
    b += op(fin(tt, a0 + 0.25 + i * 0.1, 0.4), tRico(l, x + 30, y + 17 + s * 0.98 + i * lh, { f: 'B', w: 500, s, c: C.navy, hi: C.orangeD, hw: 700 }));
  });
  return b + varredura('vconc' + Math.round(y), x, y, w, h, inv(a0 + 0.6, a0 + 1.6, tt), 10);
}

// número grande da página ao fundo, no canto superior direito do miolo
export const marcaDagua = (i, tt = 99, a0 = 0) => op(fin(tt, a0, 0.8), t(`0${i}`, 1036, 330, { f: 'H', w: 800, s: 210, c: '#F2F5F9', a: 'end', ls: -2 }));

// ---------- página 1 · contexto ----------
export function pagina1(tt, B) {
  let s = marcaDagua(1, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P1.kicker, 48, 190));
  s += titulo(P1.titulo, 48, 258, tt, B.titulo, { s: 70, lh: 68 });
  // gráfico
  const gy = 378;
  s += rotulo(P1.grafico.titulo, 48, gy, tt, B.grafico - 0.5);
  const [sa, sb] = P1.grafico.series;
  s += graficoLinha({
    x: 96, y: gy + 76, w: 800, h: 300, x0: P1.grafico.x0, x1: P1.grafico.x1, yMax: 100, t0: B.grafico, dur: 2.4, pilulaH: 42, pilulaW: 92,
    series: [
      { ...sa, cor: C.navy, legX: 48, legY: gy + 38, areaOp: 0.08 },
      { ...sb, cor: C.orange, legX: 330, legY: gy + 38, atraso: 1.3, area: false, corRot: C.orangeD, rotDy: 30 },
    ],
  }, tt);
  s += faixaNumeros({ x: 112, y: gy + 80, w: 560, h: 86, t0: B.grafico + 2.6, max: 60,
    titulo: P1.velocidade.titulo, itens: P1.velocidade.itens.map((it, i) => ({ ...it, cor: [C.orange, C.slate, C.blueL][i] })) }, tt);
  // funil
  const fy = 822;
  s += rotulo(P1.funilTitulo, 48, fy, tt, B.funil - 0.35);
  s += funil({ x: 48, y: fy + 22, w: 500, hBar: 54, gap: 22, minW: 34, rotX: 590, rotS: 21, t0: B.funil, step: 0.8,
    itens: P1.funil.map((it, i) => ({ ...it, cor: [C.navy, C.slate, C.orange][i] })) }, tt);
  s += conclusao(P1.conclusao, 48, 1090, 984, tt, B.conclusao);
  return s;
}

// ---------- página 2 · desafio ----------
export function pagina2(tt, B, modo = {}) {
  let s = marcaDagua(2, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P2.kicker, 48, 190));
  s += titulo(P2.titulo, 48, 258, tt, B.titulo, { s: 66, lh: 68 });
  // regra 10-20-70
  const ry = 378;
  s += rotulo(P2.regra.rotulo, 48, ry, tt, B.barra - 0.4);
  s += barraEmpilhada({ x: 48, y: ry + 18, w: 984, h: 58, t0: B.barra,
    partes: P2.regra.partes.map((p, i) => ({ ...p, cor: [C.blueL, C.slate, C.orange][i], corTxt: i === 0 ? C.navy : '#fff' })) }, tt);
  // matriz + legenda
  const my = 532;
  s += rotulo(P2.matrizTitulo, 48, my, tt, B.matriz - 0.4);
  const M = { x: 100, y: my + 56, size: 420, itens: P2.desafios, t0: B.matriz, step: 0.42, r: 21, fimPulso: modo.estatico ? -1 : 1e9 };
  s += matriz(M, tt);
  s += legendaMatriz({ x: 568, y: my + 46, w: 464, itens: P2.desafios, t0: B.matriz, step: 0.42, gap: 12 }, tt).svg;
  // foco na zona crítica (só no vídeo)
  if (!modo.estatico) {
    const k = Math.min(ease.out(inv(B.foco, B.foco + 0.5, tt)), 1 - ease.out(inv(B.focoFim - 0.4, B.focoFim, tt)));
    if (k > 0) {
      const cs = (M.size - 20) / 5, x0 = M.x + 2 * (cs + 5) - 8, y0 = M.y - 46, w = M.size - 2 * (cs + 5) + 16, h = 3 * (cs + 5) + 50;
      s += `<path d="M0,140 L${W},140 L${W},1230 L0,1230Z M${f(x0)},${f(y0)} L${f(x0 + w)},${f(y0)} L${f(x0 + w)},${f(y0 + h)} L${f(x0)},${f(y0 + h)}Z" fill="${C.dark}" fill-rule="evenodd" opacity="${f(0.55 * k)}"/>`;
    }
  }
  s += conclusao(P2.conclusao, 48, 1100, 984, tt, B.conclusao);
  return s;
}

// ---------- página 3 · o que fazemos ----------
export function pagina3(tt, B) {
  let s = marcaDagua(3, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P3.kicker, 48, 190));
  s += titulo(P3.titulo, 48, 258, tt, B.titulo, { s: 66, lh: 68 });
  // equação
  s += equacao({ x: 48, y: 370, w: 984, h: 92, t0: B.equacao, ops: ['×', '='],
    termos: [
      { ...P3.equacao[0], cor: C.navy, s: 34 },
      { ...P3.equacao[1], cor: C.navy3, s: 29 },
      { ...P3.equacao[2], cor: C.orange, subCor: '#fff', s: 34, brilho: true },
    ] }, tt);
  // método
  s += rotulo('Nosso método · gestão de mudanças para adoção de IA', 48, 512, tt, B.etapas - 0.4);
  s += etapas({ x: 48, y: 530, w: 984, h: 100, t0: B.etapas, step: 0.42, itens: P3.etapas }, tt);
  // indicadores
  s += rotulo(P3.kpisTitulo, 48, 792, tt, B.kpis - 0.3);
  s += indicadores({ x: 48, y: 810, w: 984, h: 82, t0: B.kpis, step: 0.18, itens: P3.kpis }, tt);
  // prova (7x) + CTA
  const by = 928;
  s += selo(150, by + 132, 100, P3.selo.num, P3.selo.linhas, tt, B.selo);
  const cx = 290, cw = 1032 - cx, ch = 262;
  const k = ease.out(inv(B.cta, B.cta + 0.55, tt));
  if (k > 0) {
    let b = `<rect x="${cx}" y="${by}" width="${cw}" height="${ch}" rx="14" fill="${C.navy}"/>`
      + `<clipPath id="ctaClip"><rect x="${cx}" y="${by}" width="${cw}" height="${ch}" rx="14"/></clipPath>`
      + `<g clip-path="url(#ctaClip)"><path d="M${cx + cw - 150},${by + ch} L${cx + cw - 40},${by}" stroke="${C.slate}" stroke-width="30"/><path d="M${cx + cw - 196},${by + ch} L${cx + cw - 86},${by}" stroke="${C.orange}" stroke-width="2.4"/></g>`;
    b += op(fin(tt, B.cta + 0.2, 0.4), t(P3.cta.pergunta, cx + 34, by + 62, { f: 'H', w: 700, s: 40, c: '#fff', ls: 0.3 }));
    b += op(fin(tt, B.cta + 0.5, 0.4), tRico(P3.cta.destaque, cx + 34, by + 112, { f: 'H', w: 800, s: 48, c: '#fff', hi: C.orange, ls: 0.3 }));
    b += op(fin(tt, B.final, 0.45), `<rect x="${cx + 34}" y="${by + 146}" width="${cw - 68}" height="1.5" fill="#fff" opacity=".25"/>`
      + t(P3.cta.acao, cx + 34, by + 190, { f: 'B', w: 700, s: 22, c: '#fff' })
      + t(P3.cta.lema, cx + 34, by + 226, { f: 'M', w: 500, s: 15, c: C.orangeL, ls: 1.5 }));
    s += `<g opacity="${f(clamp(k * 1.4))}" transform="translate(${f((1 - k) * 40)} 0)">${b}</g>`;
    s += varredura('vcta', cx, by, cw, ch, inv(B.final + 0.2, B.final + 1.3, tt), 14);
  }
  return s;
}

export const PAGINAS = [
  { desenha: pagina1, fontes: () => P1.fontes },
  { desenha: pagina2, fontes: () => P2.fontes },
  { desenha: pagina3, fontes: () => P3.fontes },
];
