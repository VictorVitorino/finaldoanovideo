// As 3 páginas do carrossel. Cada função desenha o miolo da página (entre o cabeçalho e o rodapé)
// no tempo local tt (s), seguindo os beats B de tempos.json. modo.estatico = true desenha o estado final (PDF).
import { W, C, t, tRico, larg, kicker, quebra, op, fin, inv, ease, n2, varredura, ico } from './base.js';
import { titulo } from './componentes.js';
import { escada, colunas, barrasTempo, curvasAdocao, linhaDoTempo } from './adocao.js';
import { P1, P2, P3 } from './dados.js';

const f = n2;

// rótulo de bloco
const rotulo = (str, x, y, tt, a0) => op(fin(tt, a0, 0.4), t(str, x, y, { f: 'B', w: 600, s: 18, c: C.slate }));

// número grande da página ao fundo, no canto superior direito do miolo
const marcaDagua = (i, tt, a0) => op(fin(tt, a0, 0.8), t(`0${i}`, 1036, 330, { f: 'H', w: 800, s: 210, c: '#F2F5F9', a: 'end', ls: -2 }));

// "so what": faixa com barra laranja à esquerda e texto em navy
function conclusao(str, x, y, w, tt, a0, o = {}) {
  const s = o.s ?? 23, lh = s * 1.36;
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

// ---------- página 1 · IA versus adoção ----------
export function pagina1(tt, B) {
  let s = marcaDagua(1, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P1.kicker, 48, 190));
  s += titulo(P1.titulo, 48, 258, tt, B.titulo, { s: 64, lh: 68 });
  s += rotulo(P1.escadaTitulo, 48, 392, tt, B.grafico - 0.4);
  s += escada({ x: 48, y: 420, w: 984, h: 560, t0: B.grafico, step: 1.1,
    itens: P1.escada.map((it, i) => ({ ...it, cor: [C.navy, C.slate, C.orange][i] })) }, tt);
  s += conclusao(P1.conclusao, 48, 1064, 984, tt, B.conclusao);
  return s;
}

// ---------- página 2 · com e sem gestão da mudança ----------
export function pagina2(tt, B) {
  let s = marcaDagua(2, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P2.kicker, 48, 190));
  s += titulo(P2.titulo, 48, 254, tt, B.titulo, { s: 54, lh: 58 });
  // gráfico 1: colunas por qualidade da gestão da mudança
  s += rotulo(P2.colunasTitulo, 48, 438, tt, B.colunas - 0.4);
  s += colunas({ x: 48, y: 452, w: 984, h: 300, t0: B.colunas, step: 0.45, itens: P2.colunas, zonas: P2.zonas, destaque: P2.destaque,
    cores: ['#C0392B', C.orangeL, C.blue, C.navy] }, tt);
  // gráfico 2: o custo de começar tarde
  const ty = 800;
  s += op(fin(tt, B.tempo - 0.4, 0.4), t(P2.tempoTitulo, 48, ty, { f: 'B', w: 700, s: 18, c: C.navy })
    + t(P2.tempoSub, 48 + larg(P2.tempoTitulo, 18, 700) + 14, ty, { f: 'B', w: 500, s: 15, c: C.grey }));
  if (P2.tempo.length) {
    s += barrasTempo({ x: 48, y: ty + 22, w: 984, hBar: 36, gap: 14, rotW: 300, t0: B.tempo, step: 0.4, max: 100, suf: P2.tempoSuf ?? '%',
      itens: P2.tempo.map((it, i) => ({ ...it, cor: [C.navy, C.blue, C.orangeL, '#C0392B'][i] })) }, tt);
  } else {
    s += curvasAdocao({ x: 110, y: ty + 40, w: 880, h: 190, t0: B.tempo, golive: 0.6, nota: P2.tempoNota, curvas: P2.curvas ?? [] }, tt);
  }
  s += conclusao(P2.conclusao, 48, 1086, 984, tt, B.conclusao, { s: 21 });
  return s;
}

// ---------- página 3 · o que fazemos: gestão da mudança desde o dia zero ----------
export function pagina3(tt, B) {
  let s = marcaDagua(3, tt, B.kicker);
  s += op(fin(tt, B.kicker, 0.4), kicker(P3.kicker, 48, 190));
  s += titulo(P3.titulo, 48, 258, tt, B.titulo, { s: 64, lh: 68 });
  s += rotulo(P3.linhaTitulo, 48, 392, tt, B.linha - 0.4);
  const L = linhaDoTempo({ x: 48, y: 470, w: 984, t0: B.linha, fases: P3.fases, golive: P3.golive, faixas: P3.faixas, antes: P3.antes }, tt);
  s += L.svg;
  // entregas
  const ey = 756, cw = 480, ch = 74;
  P3.entregas.forEach((e, i) => {
    const a0 = B.entregas + i * 0.25;
    const k = fin(tt, a0, 0.45);
    if (k <= 0) return;
    const x = 48 + (i % 2) * (cw + 24), y = ey + Math.floor(i / 2) * (ch + 16);
    let b = `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="12" fill="#fff" stroke="${C.blueLL}" stroke-width="1.5"/>`
      + `<rect x="${x}" y="${y}" width="5" height="${ch}" rx="2.5" fill="${C.orange}"/>`
      + `<circle cx="${x + 40}" cy="${y + ch / 2}" r="21" fill="${C.blueBg}"/>` + ico(e.ico, x + 40, y + ch / 2, 1.1, C.navy, 2.2)
      + t(e.rot, x + 76, y + 31, { f: 'B', w: 700, s: 18, c: C.navy })
      + t(e.sub, x + 76, y + 54, { f: 'B', w: 500, s: 14.5, c: C.slate });
    s += `<g opacity="${f(k)}" transform="translate(0 ${f((1 - k) * 14)})">${b}</g>`;
  });
  // CTA
  const by = 960, bh = 236, cx = 48, cwid = 984;
  const k = ease.out(inv(B.cta, B.cta + 0.55, tt));
  if (k > 0) {
    const Q = P3.cta;
    let b = `<rect x="${cx}" y="${by}" width="${cwid}" height="${bh}" rx="14" fill="${C.navy}"/>`
      + `<clipPath id="ctaClip"><rect x="${cx}" y="${by}" width="${cwid}" height="${bh}" rx="14"/></clipPath>`
      + `<g clip-path="url(#ctaClip)"><path d="M${cx + cwid - 90},${by + bh} L${cx + cwid + 10},${by}" stroke="${C.slate}" stroke-width="34"/><path d="M${cx + cwid - 146},${by + bh} L${cx + cwid - 46},${by}" stroke="${C.orange}" stroke-width="2.4"/></g>`;
    b += op(fin(tt, B.cta + 0.2, 0.4), t(Q.pergunta, cx + 36, by + 68, { f: 'H', w: 700, s: 40, c: '#fff', ls: 0.3 }));
    b += op(fin(tt, B.cta + 0.5, 0.4), tRico(Q.destaque, cx + 36, by + 124, { f: 'H', w: 800, s: 50, c: '#fff', hi: C.orange, ls: 0.3 }));
    b += op(fin(tt, B.final, 0.45), `<rect x="${cx + 36}" y="${by + 152}" width="${cwid - 260}" height="1.5" fill="#fff" opacity=".25"/>`
      + t(Q.acao, cx + 36, by + 190, { f: 'B', w: 700, s: 21, c: '#fff' })
      + t(Q.lema, cx + 36 + 440, by + 190, { f: 'M', w: 500, s: 15, c: C.orangeL, ls: 1.5 }));
    s += `<g opacity="${f(Math.min(1, k * 1.4))}" transform="translate(${f((1 - k) * 40)} 0)">${b}</g>`;
    s += varredura('vcta', cx, by, cwid, bh, inv(B.final + 0.2, B.final + 1.3, tt), 14);
  }
  return s;
}

export const PAGINAS = [
  { desenha: pagina1, fontes: () => P1.fontes },
  { desenha: pagina2, fontes: () => P2.fontes },
  { desenha: pagina3, fontes: () => P3.fontes },
];
