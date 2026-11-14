// Modelo e componentes do Mapa de Perfil Cognitivo: os 5 sinais, a régua de adoção de 5 marcas,
// as pessoas (anônimas) por área e por onda, e os desenhos compartilhados pelas cenas (radar, régua, mapa).
// Os dados são ILUSTRATIVOS: servem para a animação mostrar o método, não são de um cliente.
import { C, W, MG, txt, larg, bloco, icone, disco, pop, opa, tracar, painel, pilula, rotulo, clamp, lerp, inv, ease, n2, rng } from './base.js';

const f = n2;

// ---------- os 5 sinais do perfil ----------
export const SINAIS = [
  { id: 'clareza', rot: 'Clareza do porquê', curto: 'Clareza', ic: 'lampada', pergunta: 'Entende por que a mudança existe?' },
  { id: 'fluencia', rot: 'Fluência digital', curto: 'Fluência', ic: 'chip', pergunta: 'Fica à vontade com ferramentas novas?' },
  { id: 'autonomia', rot: 'Autonomia para aprender', curto: 'Autonomia', ic: 'bussola', pergunta: 'Aprende sem depender de alguém ao lado?' },
  { id: 'seguranca', rot: 'Segurança para errar', curto: 'Segurança', ic: 'escudo', pergunta: 'Sente que pode testar e errar?' },
  { id: 'valor', rot: 'Valor que vê na mudança', curto: 'Valor', ic: 'diamante', pergunta: 'Enxerga ganho no próprio trabalho?' },
];

// ---------- a régua de adoção ----------
// cor = preenchimento da marca; tx = cor do texto sobre ela. A rampa vai do laranja escuro (atenção) ao navy (marca).
export const NIVEIS = [
  { id: 'resiste', rot: 'Resiste', def: 'ainda não vê motivo para mudar', ic: 'barreira', cor: C.orangeD, tx: C.white, acao: 'Escuta', acaoDef: 'ouvir o motivo e ajustar a mensagem', icAcao: 'balao' },
  { id: 'observa', rot: 'Observa', def: 'espera para ver funcionar', ic: 'olho', cor: C.orange80, tx: C.navy, acao: 'Exemplo', acaoDef: 'mostrar colegas usando', icAcao: 'pessoas' },
  { id: 'experimenta', rot: 'Experimenta', def: 'testa, com apoio', ic: 'frasco', cor: C.blue40, tx: C.navy, acao: 'Prática', acaoDef: 'prática guiada no dia a dia', icAcao: 'alvo' },
  { id: 'adota', rot: 'Adota', def: 'usa na rotina', ic: 'check', cor: C.blue, tx: C.white, acao: 'Reforço', acaoDef: 'reconhecer e tirar atritos', icAcao: 'reforco' },
  { id: 'multiplica', rot: 'Multiplica', def: 'ensina os colegas', ic: 'megafone', cor: C.navy, tx: C.white, acao: 'Palco', acaoDef: 'dar voz e formar a rede', icAcao: 'estrela' },
];
// posição na régua (0..4) a partir da média dos 5 sinais (0..1)
export const nivelDe = sinais => {
  const m = sinais.reduce((a, b) => a + b, 0) / sinais.length;
  return m < 0.3 ? 0 : m < 0.46 ? 1 : m < 0.62 ? 2 : m < 0.8 ? 3 : 4;
};

// ---------- as duas pessoas do gancho ----------
// A adota logo; B volta para a planilha. Os sinais explicam a diferença.
export const HEROIS = {
  A: { id: 'A', nome: 'Pessoa A', area: 0, sinais: [0.85, 0.8, 0.72, 0.7, 0.82], cor: C.blue },
  B: { id: 'B', nome: 'Pessoa B', area: 0, sinais: [0.35, 0.55, 0.3, 0.25, 0.45], cor: C.orange80 },
};

// ---------- as áreas e as pessoas do projeto (anônimas) ----------
export const AREAS = ['Financeiro', 'Operações', 'Comercial', 'Suprimentos'];
// nível por onda [onda 1, onda 2, onda 3]. A maioria avança, alguns travam e um recua (o mapa precisa estar vivo).
const NIV = [
  // Financeiro (inclui os dois heróis: A é a 1ª, B é a 2ª)
  [[3, 4, 4], [1, 2, 3], [0, 1, 2], [1, 1, 2], [2, 3, 3], [2, 2, 3]],
  // Operações
  [[0, 0, 1], [0, 1, 1], [1, 2, 3], [1, 1, 1], [2, 3, 4], [3, 3, 4], [1, 2, 2]],
  // Comercial
  [[2, 3, 3], [3, 2, 3], [1, 2, 3], [4, 4, 4], [2, 2, 3], [0, 1, 2]],
  // Suprimentos
  [[0, 0, 0], [1, 1, 2], [1, 2, 2], [2, 3, 3], [0, 1, 1], [3, 4, 4]],
];
export const PESSOAS = [];
{
  const R = rng(20261113);
  NIV.forEach((linha, a) => linha.forEach((niv, j) => {
    const alvo = [0.2, 0.38, 0.54, 0.7, 0.88][niv[0]];
    const sinais = Array.from({ length: 5 }, () => clamp(alvo + (R() - 0.5) * 0.3, 0.08, 0.98));
    PESSOAS.push({ id: PESSOAS.length, area: a, j, niv, sinais, heroi: a === 0 && j === 0 ? 'A' : a === 0 && j === 1 ? 'B' : null });
  }));
}
// rótulo do movimento de uma pessoa entre duas ondas (índices 0..2)
export const movimento = (p, de, ate) => (p.niv[ate] > p.niv[de] ? 'avanca' : p.niv[ate] < p.niv[de] ? 'recua' : 'trava');
// contagem de pessoas por nível numa onda (0..2)
export const contagem = onda => NIVEIS.map((_, n) => PESSOAS.filter(p => p.niv[onda] === n).length);

// ---------- radar dos 5 sinais ----------
// ponto do eixo i (0..4) a uma fração v do raio
export function pontoRadar(cx, cy, R, i, v = 1) {
  const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
  return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
}
// o: { cx, cy, R, valores: [5 x 0..1], uGrade (0..1 anéis e eixos se desenham), uEixo: [5 x 0..1] (cada sinal acende),
//      cor (do polígono), rotulos: 'completo' | 'curto' | 'icone' | 'nada', destaque (índice do eixo em foco), escuro }
export function radar(o) {
  const { cx, cy, R } = o;
  const uG = o.uGrade ?? 1, uE = o.uEixo ?? [1, 1, 1, 1, 1], cor = o.cor ?? C.blue;
  const lin = o.escuro ? 'rgba(255,255,255,.28)' : C.gray, tinta = o.escuro ? C.white : C.navy;
  let s = '';
  // anéis (pentágonos) e eixos
  [1 / 3, 2 / 3, 1].forEach((v, k) => {
    const pts = [0, 1, 2, 3, 4].map(i => pontoRadar(cx, cy, R, i, v));
    const d = 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L') + 'Z';
    s += tracar(d, clamp(uG * 1.6 - k * 0.25), { c: lin, sw: k === 2 ? 2.2 : 1.4 });
  });
  for (let i = 0; i < 5; i++) {
    const [x, y] = pontoRadar(cx, cy, R, i);
    s += tracar(`M${f(cx)},${f(cy)} L${f(x)},${f(y)}`, clamp(uG * 1.8 - 0.5 - i * 0.08), { c: lin, sw: 1.4 });
  }
  // polígono do perfil: cada vértice cresce quando o seu sinal acende
  const vs = [0, 1, 2, 3, 4].map(i => pontoRadar(cx, cy, R, i, o.valores[i] * ease.back(clamp(uE[i])) * 0.96 + 0.04 * Math.min(1, uG)));
  const soma = uE.reduce((a, b) => a + clamp(b), 0);
  if (soma > 0.001) {
    const d = 'M' + vs.map(p => `${f(p[0])},${f(p[1])}`).join(' L') + 'Z';
    s += `<path d="${d}" fill="${cor}" fill-opacity="${f(0.22 * clamp(soma / 2))}" stroke="${cor}" stroke-width="3.5" stroke-linejoin="round"/>`;
    for (let i = 0; i < 5; i++) {
      const k = ease.back(clamp(uE[i] * 1.4));
      if (k > 0.001) s += `<circle cx="${f(vs[i][0])}" cy="${f(vs[i][1])}" r="${f(7 * k)}" fill="${C.white}" stroke="${cor}" stroke-width="3.5"/>`;
    }
  }
  // rótulos nas pontas
  const modo = o.rotulos ?? 'completo';
  if (modo !== 'nada') {
    for (let i = 0; i < 5; i++) {
      const k = ease.back(clamp(uE[i] * 1.25));
      const [x, y] = pontoRadar(cx, cy, R, i, 1);
      const [lx, ly] = pontoRadar(cx, cy, R, i, 1 + (o.folga ?? 0.3));
      const foco = o.destaque === i;
      const rd = o.rIcone ?? 34;
      const dc = disco(SINAIS[i].ic, lx, ly, rd, { k: Math.max(0.0001, k), u: clamp(uE[i] * 1.2 - 0.1), fundo: foco ? C.navy : (o.escuro ? 'rgba(255,255,255,.12)' : C.blue20), c: foco ? C.white : tinta });
      s += dc;
      if (modo !== 'icone' && k > 0.001) {
        const str = modo === 'curto' ? SINAIS[i].curto : SINAIS[i].rot;
        const sz = o.sRot ?? 24;
        // rótulo ao lado do disco, do lado de fora do radar
        const esq = lx < cx - 8, dir = lx > cx + 8;
        const a = esq ? 'end' : dir ? 'start' : 'middle';
        const tx = esq ? lx - rd - 12 : dir ? lx + rd + 12 : lx;
        const ty = !esq && !dir ? (ly < cy ? ly - rd - 14 : ly + rd + 30) : ly + sz * 0.34;
        const maxW = o.maxWRot ?? 190;
        const linhas = larg(str, sz, { w: 700 }) > maxW && (esq || dir) ? quebra2(str) : [str];
        linhas.forEach((l, j) => {
          s += opa(clamp(uE[i] * 1.6 - 0.3), txt(l, tx, ty + (j - (linhas.length - 1) / 2) * sz * 1.1, { w: 700, s: sz, c: tinta, a }));
        });
      }
    }
  }
  return s;
}
// quebra um rótulo em duas linhas de tamanho parecido
function quebra2(str) {
  const ws = str.split(' ');
  if (ws.length < 2) return [str];
  let melhor = 1, dif = Infinity;
  for (let i = 1; i < ws.length; i++) {
    const d = Math.abs(ws.slice(0, i).join(' ').length - ws.slice(i).join(' ').length);
    if (d < dif) { dif = d; melhor = i; }
  }
  return [ws.slice(0, melhor).join(' '), ws.slice(melhor).join(' ')];
}

// ---------- régua de adoção ----------
// geometria: 5 marcas de largura igual entre x e x + w. centro(i) devolve o x do meio da marca i.
export function geoRegua(x, w) {
  const lw = w / 5;
  return { x, w, lw, centro: i => x + lw * (i + 0.5), ini: i => x + lw * i };
}
// o: { x, y, w, h (altura da faixa), uTracos (0..1 a régua se desenha), uNivel: [5 x 0..1] (cada marca acende),
//      ativo (índice em foco, -1 = nenhum), defs (mostra a definição de cada marca), icones (mostra o ícone acima), escuro, sRot }
export function regua(o) {
  const g = geoRegua(o.x, o.w), h = o.h ?? 64, y = o.y;
  const uT = o.uTracos ?? 1, uN = o.uNivel ?? [1, 1, 1, 1, 1], ativo = o.ativo ?? -1;
  const tinta = o.escuro ? C.white : C.navy, lin = o.escuro ? 'rgba(255,255,255,.4)' : C.navy40;
  let s = '';
  // trilho com tracinhos de régua
  s += tracar(`M${f(g.x)},${f(y + h + 14)} L${f(g.x + g.w * ease.inOut(clamp(uT)))},${f(y + h + 14)}`, 1, { c: lin, sw: 2 });
  let tr = '';
  const nT = 50;
  for (let k = 0; k <= nT; k++) {
    if (k / nT > ease.inOut(clamp(uT)) + 0.001) break;
    const xx = g.x + g.w * k / nT, grande = k % 10 === 0;
    tr += `M${f(xx)},${f(y + h + 14)} L${f(xx)},${f(y + h + 14 + (grande ? 16 : 8))} `;
  }
  if (tr) s += `<path d="${tr}" stroke="${lin}" stroke-width="${1.6}" fill="none"/>`;
  // as 5 marcas
  NIVEIS.forEach((n, i) => {
    const k = ease.back(clamp(uN[i]));
    if (k <= 0.001) return;
    const foco = ativo === i, apagado = ativo >= 0 && !foco && o.apagar !== false;
    const x0 = g.ini(i) + 4, lw = g.lw - 8, cx = g.centro(i);
    let b = `<rect x="${f(x0)}" y="${f(y)}" width="${f(lw)}" height="${f(h)}" rx="8" fill="${n.cor}"/>`;
    const sz = o.sRot ?? (g.lw > 170 ? 27 : 23);
    b += txt(n.rot, cx, y + h / 2 + sz * 0.35, { w: 700, s: sz, c: n.tx, a: 'middle' });
    if (foco) b += `<rect x="${f(x0 - 5)}" y="${f(y - 5)}" width="${f(lw + 10)}" height="${f(h + 10)}" rx="12" fill="none" stroke="${tinta}" stroke-width="3"/>`;
    s += opa(apagado ? 0.38 : 1, pop(0.6 + 0.4 * k, cx, y + h / 2, opa(clamp(k * 1.4), b)));
    if (o.icones) {
      const ki = ease.back(clamp(uN[i] * 1.3 - 0.25));
      s += opa(apagado ? 0.38 : 1, disco(n.ic, cx, y - 52, 34, { k: Math.max(0.0001, ki), u: clamp(uN[i] * 1.4 - 0.3), fundo: o.escuro ? 'rgba(255,255,255,.12)' : C.gray20, c: tinta, anel: foco ? n.cor : null, asw: 4 }));
    }
    if (o.defs) {
      const bl = bloco(n.def, cx, y + h + 62, { s: o.sDef ?? 20, maxW: g.lw - 18, lh: (o.sDef ?? 20) * 1.15, c: o.escuro ? C.navy20 : C.navy80, a: 'middle' });
      s += opa(clamp(uN[i] * 1.5 - 0.5) * (apagado ? 0.38 : 1), bl.svg);
    }
  });
  return s;
}

// ---------- marcador de pessoa (anônimo) ----------
// ponto: disco pequeno do mapa. o: { r, cor, k (escala), anel (cor do anel de destaque), rotulo ('A' / 'B') }
export function ponto(x, y, o = {}) {
  const k = o.k ?? 1;
  if (k <= 0.001) return '';
  const r = o.r ?? 13;
  let b = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${o.cor ?? C.navy}" stroke="${C.white}" stroke-width="2.5"/>`;
  if (o.anel) b += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r + 6)}" fill="none" stroke="${o.anel}" stroke-width="3"/>`;
  if (o.rotulo) b += txt(o.rotulo, x, y + r * 0.42, { w: 700, s: r * 1.15, c: o.tx ?? C.white, a: 'middle' });
  return pop(k, x, y, b);
}
// pino de mapa (gota) com a ponta em (x, y). o: { cor, k, s (escala), rotulo, tx }
export function pino(x, y, o = {}) {
  const k = o.k ?? 1;
  if (k <= 0.001) return '';
  const s = o.s ?? 1, cor = o.cor ?? C.navy;
  const b = `<path d="M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z" fill="${cor}" stroke="${C.white}" stroke-width="3"/>`
    + `<circle cx="0" cy="-42" r="10" fill="${C.white}"/>`
    + (o.rotulo ? txt(o.rotulo, 0, -35, { w: 700, s: 19, c: cor, a: 'middle' }) : '');
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * k)})">${b}</g>`;
}
// avatar anônimo: disco com ícone de pessoa. o: { r, cor (fundo), c (traço), k, u }
export const avatar = (cx, cy, o = {}) => disco('pessoa', cx, cy, o.r ?? 44, { fundo: o.cor ?? C.blue20, c: o.c ?? C.navy, k: o.k ?? 1, u: o.u ?? 1, sw: o.sw ?? 3.2, anel: o.anel, asw: o.asw });

// ---------- o mapa de adoção (áreas x régua) ----------
// geometria da grade. x, y, w, h = retângulo total; cab = altura do cabeçalho (marcas da régua); rotW = coluna dos nomes das áreas
export function geoMapa(x, y, w, h, o = {}) {
  const cab = o.cab ?? 58, rotW = o.rotW ?? 176, nA = AREAS.length;
  const cw = (w - rotW) / 5, rh = (h - cab) / nA;
  const g = {
    x, y, w, h, cab, rotW, cw, rh,
    colX: n => x + rotW + cw * n, linY: a => y + cab + rh * a,
    centro: (a, n) => [x + rotW + cw * (n + 0.5), y + cab + rh * (a + 0.5)],
    // posição da j-ésima de `total` pessoas dentro da célula (a, n): até 3 por linha
    vaga: (a, n, j, total) => {
      const porLinha = Math.min(3, total), linhas = Math.ceil(total / 3);
      const li = Math.floor(j / 3), ci = j % 3, nessa = li === linhas - 1 ? total - 3 * li : 3;
      const passo = Math.min(34, (cw - 26) / Math.max(1, porLinha));
      const [cx, cy] = g.centro(a, n);
      return [cx + (ci - (nessa - 1) / 2) * passo, cy + (li - (linhas - 1) / 2) * 32];
    },
  };
  return g;
}
// posição de cada pessoa no mapa numa onda (0, 1 ou 2): { [id]: [x, y] }
export function posicoes(g, onda) {
  const out = {};
  for (let a = 0; a < AREAS.length; a++) for (let n = 0; n < 5; n++) {
    const cel = PESSOAS.filter(p => p.area === a && p.niv[onda] === n);
    cel.forEach((p, j) => { out[p.id] = g.vaga(a, n, j, cel.length); });
  }
  return out;
}
// grade vazia: cabeçalho com as 5 marcas e uma linha por área.
// o: { uGrade (0..1 linhas se desenham), uCab: [5 x 0..1], uArea: [4 x 0..1], realce (índice de coluna em foco ou -1), sRot }
export function gradeMapa(g, o = {}) {
  const uG = o.uGrade ?? 1, uC = o.uCab ?? [1, 1, 1, 1, 1], uA = o.uArea ?? [1, 1, 1, 1], realce = o.realce ?? -1;
  let s = '';
  // fundo do corpo
  s += opa(clamp(uG * 2), painel(g.x, g.y + g.cab, g.w, g.h - g.cab, { fill: C.gray20 }));
  // colunas em foco
  if (realce >= 0) s += `<rect x="${f(g.colX(realce) + 3)}" y="${f(g.y + g.cab + 4)}" width="${f(g.cw - 6)}" height="${f(g.h - g.cab - 8)}" rx="6" fill="${C.white}" stroke="${NIVEIS[realce].cor}" stroke-width="3"/>`;
  // linhas da grade
  for (let n = 1; n < 5; n++) s += tracar(`M${f(g.colX(n))},${f(g.y + g.cab + 10)} L${f(g.colX(n))},${f(g.y + g.h - 10)}`, clamp(uG * 1.5 - n * 0.08), { c: C.gray80, sw: 1.5 });
  for (let a = 1; a < AREAS.length; a++) s += tracar(`M${f(g.x + 12)},${f(g.linY(a))} L${f(g.x + g.w - 12)},${f(g.linY(a))}`, clamp(uG * 1.5 - 0.2 - a * 0.08), { c: C.gray80, sw: 1.5 });
  s += tracar(`M${f(g.x + g.rotW)},${f(g.y + g.cab + 10)} L${f(g.x + g.rotW)},${f(g.y + g.h - 10)}`, clamp(uG * 1.5), { c: C.gray, sw: 1.5 });
  // cabeçalho: as marcas da régua
  NIVEIS.forEach((n, i) => {
    const k = ease.back(clamp(uC[i]));
    if (k <= 0.001) return;
    const x0 = g.colX(i) + 4, cx = x0 + (g.cw - 8) / 2, hh = g.cab - 12;
    const sz = o.sRot ?? (g.cw > 150 ? 22 : 19.5);
    s += pop(0.6 + 0.4 * k, cx, g.y + hh / 2, opa(clamp(k * 1.4),
      `<rect x="${f(x0)}" y="${f(g.y)}" width="${f(g.cw - 8)}" height="${f(hh)}" rx="8" fill="${n.cor}"/>` + txt(n.rot, cx, g.y + hh / 2 + sz * 0.35, { w: 700, s: sz, c: n.tx, a: 'middle' })));
  });
  // nomes das áreas
  AREAS.forEach((nome, a) => {
    const k = clamp(uA[a]);
    if (k <= 0.001) return;
    s += opa(ease.out(k), `<g transform="translate(${f((1 - ease.out(k)) * -24)} 0)">` + txt(nome, g.x + 18, g.linY(a) + g.rh / 2 + 8, { w: 700, s: o.sArea ?? 23, c: C.navy }) + `</g>`);
  });
  return s;
}
// as pessoas no mapa. o: { onda (0..2, pode ser fracionária: 0.5 = no meio do caminho entre a onda 1 e a 2),
//   k: id -> escala (0..1) de entrada de cada ponto (padrão 1), r, destacar: Set de ids com anel, corPor: 'nivel' | cor fixa }
export function pessoasMapa(g, o = {}) {
  const onda = clamp(o.onda ?? 0, 0, 2), i0 = Math.min(1, Math.floor(onda)), u = ease.inOut(clamp(onda - i0));
  const p0 = posicoes(g, i0), p1 = posicoes(g, i0 + 1);
  let s = '';
  for (const p of PESSOAS) {
    const k = o.k ? o.k(p) : 1;
    if (k <= 0.001) continue;
    const [xa, ya] = p0[p.id], [xb, yb] = p1[p.id];
    // quem muda de marca faz um arco; quem fica só se acomoda
    const muda = p.niv[i0] !== p.niv[i0 + 1];
    const x = lerp(xa, xb, u), y = lerp(ya, yb, u) - (muda ? Math.sin(u * Math.PI) * 22 : 0);
    const nv = u < 0.5 ? p.niv[i0] : p.niv[i0 + 1];
    const cor = o.cor ? o.cor(p, nv) : NIVEIS[nv].cor;
    const anel = o.destacar && o.destacar.has(p.id) ? (o.corAnel ?? C.navy) : (p.heroi && o.herois !== false ? C.navy : null);
    s += ponto(x, y, { r: o.r ?? 13, cor, k, anel, rotulo: p.heroi && o.herois !== false ? p.heroi : null, tx: NIVEIS[nv].tx });
  }
  return s;
}
// barra de totais por marca (quantas pessoas em cada marca na onda). o: { x, y, w, onda (0..2 fracionária), u }
export function totais(o) {
  const onda = clamp(o.onda ?? 0, 0, 2), i0 = Math.min(1, Math.floor(onda)), u = clamp(onda - i0);
  const c0 = contagem(i0), c1 = contagem(i0 + 1), total = PESSOAS.length;
  let s = '', x = o.x;
  const h = o.h ?? 30, k = ease.out(clamp(o.u ?? 1));
  NIVEIS.forEach((n, i) => {
    const q = lerp(c0[i], c1[i], ease.inOut(u)), w = (o.w * q / total) * k;
    if (w > 0.5) {
      s += `<rect x="${f(x)}" y="${f(o.y)}" width="${f(Math.max(0, w - 3))}" height="${h}" rx="5" fill="${n.cor}"/>`;
      if (w > 34 && k > 0.9) s += txt(String(Math.round(q)), x + (w - 3) / 2, o.y + h / 2 + 7, { w: 700, s: 20, c: n.tx, a: 'middle' });
    }
    x += w;
  });
  return s;
}
export { W, MG, pilula, rotulo };
