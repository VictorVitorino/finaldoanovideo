// Cena 5 · APRENDER FAZENDO — "Estou aprendendo, testando… e entregando qualidade aos clientes."
// (≈ 26.14 → 31.14 s)
//
// Tríptico no estilo Canteiro: três quadros brancos sobre postes, ligados por um trilho de progresso
// em que um ponto laranja viaja de estação em estação. Cada quadro "acende" na palavra que o nomeia
// (cabeçalho cinza → laranja por máscara, letras saltam uma a uma, varredura de luz, cantos de HUD,
// onda de choque na estação do trilho). Quadros já vencidos ficam navy com selo verde de ✓.
// A câmera acompanha o trilho (pan + leve zoom) e recua no fim para mostrar a jornada inteira.
//
//   t0 … wa(49)  quadro 1 monta: lousa "Aula de IA" no cavalete, robô professor, Victor com caderno.
//   wa(49)       "aprendendo": APRENDER acende; lâmpada estoura sobre o Victor; o robô aponta a lousa;
//                as linhas da aula vão sendo escritas (Prompts & contexto · Claude + Skills · Agentes).
//   wa(50)       "testando": TESTAR acende; janela de testes com ✓ ✓ ✓ em sequência; um bug é
//                esmagado na linha "Dados"; o teste A/B escolhe a variante B; Victor digita no laptop.
//   wa(52)       "entregando": ENTREGAR acende; Victor chega com a caixa brilhando; a cliente acena.
//   wa(53)       "qualidade": o carimbo QUALIDADE crava no quadro (tremor, onda, poeira); selo na caixa.
//   wb(53)…      Victor entrega a caixa (arco com rastro) para a cliente.
//   wa(55)       "clientes": a cliente recebe e pula, 5 estrelas saltam, a placa CLIENTE acende,
//                confete; todos os selos viram ✓ e um pulso de luz percorre o trilho; a câmera recua.
//
// Fita inferior: chips das ferramentas (Claude, Skills, Prompts, Agentes, Automação, Contexto) correm à direita.
import {
  COR, INK, W, H, txt, largura, cartao, pilula, icone, pessoa, ELENCO_DTS, robo, cavalete, chipRotulo,
  clamp, lerp, inv, ease, kf, rng, n2, back, fin, popG, opa,
  varredura, onda, particulas, faiscas, tremor, revela, hudCantos, rastro, confete, carimbo,
} from '../base.js';

const f = n2;

export const CHIP = ['CENA 5 · APRENDER FAZENDO', 'Aprender · Testar · Entregar'];

// Cliente (personagem local desta cena; chave própria para não colidir com o elenco comum).
if (!ELENCO_DTS.aprender_cliente) {
  ELENCO_DTS.aprender_cliente = {
    skin: '#f1cba9', hair: 'bun', hairColor: '#b7773a', outfit: 'blazer', top: '#2f74b5',
    shirt: '#ffffff', pants: '#26334a', lashes: true, earrings: true,
  };
}

// ---------------- geometria (mundo) ----------------
const PX = [115, 700, 1285], PW = 520, PY = 232, PH = 496, HH = 82;
const PB = PY + PH;                      // base dos quadros
const PC = PX.map(x => x + PW / 2);      // centros: 375, 960, 1545
const RY = 794, RX0 = 76, RX1 = 1844;    // trilho
const FL = 712;                          // linha dos pés dentro dos quadros
const TY = 866;                          // fita de ferramentas
const TIT = ['APRENDER', 'TESTAR', 'ENTREGAR'];
const ICO = ['bulb', 'gauge', 'box'];
const SV = 0.86;                         // escala dos personagens

// ---------------- tempos ----------------
function tempos(ctx) {
  const { wa, wb } = ctx;
  const T = {
    t0: ctx.t0, t1: ctx.t1,
    estou: wa(48), apr: wa(49), tes: wa(50), tesB: wb(50), ent: wa(52), qual: wa(53), qualB: wb(53),
    cli: wa(55), cliB: wb(55),
  };
  T.A = [T.apr, T.tes, T.ent];
  T.B = [T.t0 + 0.08, T.tes - 0.34, T.ent - 0.38];
  T.give0 = T.qual + 0.46;               // Victor começa a entregar a caixa
  T.give1 = T.cli - 0.03;                // caixa chega às mãos da cliente
  T.fim = T.cli + 0.06;                  // jornada completa
  T.rec = T.cli + 0.34;                  // recuo de câmera
  return T;
}

// ---------------- utilidades ----------------
// escala `body` (desenhado em coordenadas do mundo) em torno de (px, py)
const pop = (k, px, py, body) => (k <= 0.001 ? '' : `<g transform="translate(${f(px)} ${f(py)}) scale(${f(k)}) translate(${f(-px)} ${f(-py)})">${body}</g>`);
const bump = (t, a, d) => { const u = inv(a, a + d, t); return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI); };

function estrela(x, y, r, fill = COR.orange, rot = 0) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.46 : r;
    d += `${i ? 'L' : 'M'}${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr)} `;
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"${rot ? ` transform="rotate(${f(rot)} ${f(x)} ${f(y)})"` : ''}/>`;
}

function defs() {
  return `<defs>`
    + `<radialGradient id="aprender_luz"><stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset=".45" stop-color="${COR.orange2}" stop-opacity=".45"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="aprender_tela"><stop offset="0" stop-color="#d9ecff" stop-opacity=".55"/><stop offset="1" stop-color="#d9ecff" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="aprender_pulso" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `</defs>`;
}

// ---------------- câmera ----------------
function camera(t, T) {
  // abre perto do quadro 1, acompanha o trilho e recua no fim para mostrar a jornada inteira
  const fimRec = Math.min(T.t1 - 0.2, T.cli + 0.7);
  const cx = kf(t, [[T.t0, 800], [T.apr + 0.2, 828], [T.tes - 0.4, 842], [T.tes + 0.1, 930], [T.ent - 0.4, 940], [T.ent + 0.1, 1010], [T.cli + 0.08, 1018], [fimRec, 960]]);
  const z = kf(t, [[T.t0, 1.1], [T.apr + 0.2, 1.09], [T.tes - 0.4, 1.085], [T.tes + 0.1, 1.05], [T.cli + 0.08, 1.055], [fimRec, 1.0], [T.t1 + 0.3, 0.99]]);
  // começa um pouco mais baixo: os cantos de HUD do quadro 1 ficam fora da zona do cabeçalho/timer
  const cy = kf(t, [[T.t0, 533], [T.tes + 0.1, 541], [T.cli + 0.08, 545], [fimRec, 550]]);
  let dx = 0, dy = 0;
  for (const [a, d, amp] of [[T.apr, 0.28, 5], [T.tes, 0.28, 5], [T.ent, 0.3, 6], [T.qual, 0.4, 13], [T.cli, 0.3, 6]]) {
    const [a1, b1] = tremor(t, a, d, amp); dx += a1; dy += b1;
  }
  return { cx, cy, z, dx, dy };
}

// ---------------- fundo (com paralaxe) ----------------
function fundo(t, cam) {
  const px = -(cam.cx - 960) * 0.3;
  let s = `<rect width="${W}" height="${H}" fill="${COR.cream}"/>`;
  const ox = ((px % 48) + 48) % 48;
  let g = '';
  for (let x = ox - 48; x <= W + 48; x += 48) g += `M${f(x)},0 L${f(x)},${H} `;
  for (let y = 0; y <= H; y += 48) g += `M0,${y} L${W},${y} `;
  s += `<path d="${g}" stroke="${COR.grid}" stroke-width="1.5"/>`;
  const bp = px * 0.7;
  for (const [c, x, y, rx, ry, ph] of [['#d7e4ee', 330, 420, 440, 300, 0], ['#f8e2c2', 1000, 760, 620, 260, 1.7], ['#f3dada', 1620, 380, 420, 320, 3.1], ['#e3ecf4', 1280, 180, 300, 160, 4.4]]) {
    s += `<ellipse cx="${f(x + bp + Math.sin(t * 0.35 + ph) * 40)}" cy="${f(y + Math.cos(t * 0.3 + ph) * 26)}" rx="${rx}" ry="${ry}" fill="${c}" opacity=".6"/>`;
  }
  for (const [x, y, k] of [[560, 200, 'x'], [1340, 168, 'tri'], [1870, 600, 'o'], [40, 640, 'x'], [1500, 940, 'o']]) {
    const xx = x + px * 1.2, yy = y + Math.sin(t * 0.9 + x) * 6;
    if (k === 'x') s += `<path d="M${f(xx - 10)},${f(yy - 10)} l20,20 M${f(xx + 10)},${f(yy - 10)} l-20,20" stroke="${COR.tan}" stroke-width="4" stroke-linecap="round"/>`;
    else if (k === 'tri') s += `<path d="M${f(xx)},${f(yy - 12)} l12,20 l-24,0Z" fill="none" stroke="${COR.tan}" stroke-width="3.5" stroke-linejoin="round"/>`;
    else s += `<circle cx="${f(xx)}" cy="${f(yy)}" r="9" fill="none" stroke="${COR.tan}" stroke-width="3"/>`;
  }
  return s;
}

// ---------------- trilho de progresso ----------------
function pontoX(t, T) {
  return kf(t, [
    [T.t0 - 0.1, RX0 + 14], [T.apr, PC[0]],
    [T.tes - 0.42, PC[0]], [T.tes, PC[1]],
    [T.ent - 0.42, PC[1]], [T.ent, PC[2]],
    [T.cli + 0.05, PC[2]], [T.cli + 0.5, RX1 - 16],
  ]);
}

function postes() {
  let s = '';
  for (let i = 0; i < 3; i++) {
    for (const x of [PX[i] + 92, PX[i] + PW - 92]) {
      s += `<rect x="${x - 7}" y="${PB - 6}" width="14" height="${RY - PB}" rx="4" fill="${COR.slate}" stroke="${INK}" stroke-width="3"/>`;
    }
  }
  return s;
}

function trilho(t, T) {
  const dx = pontoX(t, T);
  let s = '';
  // base
  s += `<rect x="${RX0 + 5}" y="${RY - 9}" width="${RX1 - RX0}" height="22" rx="11" fill="rgba(22,35,59,.12)"/>`;
  s += `<rect x="${RX0}" y="${RY - 13}" width="${RX1 - RX0}" height="26" rx="13" fill="#efe8da" stroke="${INK}" stroke-width="3.5"/>`;
  let tk = '';
  for (let x = RX0 + 30; x < RX1 - 20; x += 32) tk += `M${x},${RY - 5} L${x},${RY + 5} `;
  s += `<path d="${tk}" stroke="#d6cab3" stroke-width="3" stroke-linecap="round"/>`;
  // preenchimento
  const wfill = Math.max(0, dx - RX0 - 6);
  s += `<clipPath id="aprender_rc"><rect x="${RX0 + 6}" y="${RY - 7}" width="${f(wfill)}" height="14" rx="7"/></clipPath>`;
  s += `<rect x="${RX0 + 6}" y="${RY - 7}" width="${f(wfill)}" height="14" rx="7" fill="${COR.orange}"/>`;
  // listras animadas dentro do preenchimento (esteira)
  let ls = '';
  const off = (t * 70) % 28;
  for (let x = RX0 - 28 + off; x < dx; x += 28) ls += `M${f(x)},${RY + 7} L${f(x + 12)},${RY - 7} `;
  s += `<g clip-path="url(#aprender_rc)"><path d="${ls}" stroke="${COR.orange2}" stroke-width="6"/>`;
  // pulso de luz no fim
  const up = inv(T.cli, T.cli + 0.55, t);
  if (up > 0 && up < 1) {
    const px = lerp(RX0 - 200, RX1 + 40, ease.inOut(up));
    s += `<rect x="${f(px)}" y="${RY - 7}" width="220" height="14" fill="url(#aprender_pulso)"/>`;
  }
  s += `</g>`;
  // estações
  for (let i = 0; i < 3; i++) {
    const A = T.A[i];
    const k = back(t, A - 0.02, 0.35);
    s += `<circle cx="${PC[i]}" cy="${RY}" r="21" fill="#fff" stroke="${INK}" stroke-width="3.5"/>`;
    s += `<circle cx="${PC[i]}" cy="${RY}" r="11" fill="#e2d8c6"/>`;
    if (k > 0) s += `<circle cx="${PC[i]}" cy="${RY}" r="${f(12 * k)}" fill="${COR.orange}"/>`;
    s += onda(PC[i], RY, t - A, { r0: 18, r1: 90, w: 8, d: 0.5, duplo: false });
  }
  // fim do trilho: bandeira
  const kf2 = back(t, T.cli + 0.42, 0.35);
  s += `<path d="M${RX1 - 16},${RY - 12} L${RX1 - 16},${RY - 66}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<path d="M${RX1 - 14},${RY - 66} L${RX1 + 22},${RY - 56} L${RX1 - 14},${RY - 44}Z" fill="${kf2 > 0.5 ? COR.orange : '#e2d8c6'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  return s;
}

function ponto(t, T) {
  const P = dt => [pontoX(t - dt, T), RY];
  const x = pontoX(t, T);
  const v = (x - pontoX(t - 0.03, T)) / 0.03;
  let s = '';
  if (Math.abs(v) > 60) {
    const L = Math.min(220, Math.abs(v) * 0.16);
    s += `<rect x="${f(x - L)}" y="${RY - 8}" width="${f(L)}" height="16" rx="8" fill="${COR.orange2}" opacity=".85" filter="url(#fxBlurX)"/>`;
  }
  s += rastro(P, (px, py) => `<circle cx="${f(px)}" cy="${f(py)}" r="13" fill="${COR.orange}"/>`, 4, 0.03);
  const pul = 1 + 0.12 * Math.sin(t * 9);
  s += `<circle cx="${f(x)}" cy="${RY}" r="${f(15 * pul)}" fill="${COR.orange}" opacity=".55" filter="url(#fxGlow)"/>`;
  s += `<circle cx="${f(x)}" cy="${RY}" r="15" fill="${COR.orange}" stroke="#fff" stroke-width="4"/>`;
  s += `<circle cx="${f(x - 4)}" cy="${RY - 4}" r="4" fill="#fff" opacity=".85"/>`;
  return s;
}

// ---------------- fita de ferramentas ----------------
const FERR = [['sparkle', 'Claude'], ['tool', 'Skills'], ['chat', 'Prompts'], ['people', 'Agentes'], ['flow', 'Automação'], ['compass', 'Contexto']];
function fita(t, T) {
  const per = 2220, esp = per / FERR.length;
  const a = fin(t, T.t0 + 0.05, 0.4);
  let s = '';
  for (let c = 0; c < 2; c++) {
    FERR.forEach(([ic, rot], i) => {
      const x = -160 + ((i * esp + (t - T.t0) * 120 + 400) % per) + c * per;
      if (x < -260 || x > 2200) return;
      const yb = TY + Math.sin(t * 3 + i * 1.3) * 3;
      s += chipRotulo(x, yb, ic, rot, { size: 17 });
    });
  }
  return opa(a, s);
}

// ---------------- quadro (moldura + cabeçalho) ----------------
function topoPath(x, y, w, fill) {
  return `<path d="M${x},${y + HH} L${x},${y + 22} Q${x},${y} ${x + 22},${y} L${x + w - 22},${y} Q${x + w},${y} ${x + w},${y + 22} L${x + w},${y + HH}Z" fill="${fill}"/>`;
}

function cabecalho(i, t, T) {
  const x = PX[i], y = PY, w = PW, A = T.A[i];
  let s = topoPath(x, y, w, '#ece5d8');
  const u = inv(A - 0.03, A + 0.2, t);
  if (u > 0) s += revela(`aprender_h${i}`, x, y, w, HH, u, topoPath(x, y, w, COR.orange));
  if (u > 0 && u < 1) {
    // borda de ataque da máscara com desfoque de movimento
    const ex = x + w * ease.out(u);
    s += `<rect x="${f(ex - 10)}" y="${y + 4}" width="16" height="${HH - 8}" rx="8" fill="#fff" opacity=".85" filter="url(#fxBlurX)"/>`;
  }
  if (i < 2) s += revela(`aprender_d${i}`, x, y, w, HH, inv(T.A[i + 1] - 0.02, T.A[i + 1] + 0.22, t), topoPath(x, y, w, COR.navy));
  s += `<path d="M${x},${y + HH} L${x + w},${y + HH}" stroke="${INK}" stroke-width="3.5"/>`;
  // selo numerado
  const bx = x + 48, by = y + HH / 2;
  const lit = t >= A - 0.02;
  const kb = lit ? back(t, A - 0.02, 0.35) : 1;
  const tCheck = i < 2 ? T.A[i + 1] : T.fim;
  if (t < tCheck + 0.05) {
    const r = 25 * (lit ? Math.max(0.6, kb) : 1);
    s += `<circle cx="${bx}" cy="${by}" r="${f(r)}" fill="#fff" stroke="${lit ? INK : '#c9bfae'}" stroke-width="3"/>`
      + txt(String(i + 1), bx, by + 10, { size: 28, weight: 900, fill: lit ? COR.orange : '#b9ae9b' });
  }
  if (t >= tCheck) {
    const kc = back(t, tCheck, 0.35);
    s += popG(kc, bx, by, `<circle r="26" fill="${COR.green}" stroke="#fff" stroke-width="3.5"/><path d="M-11,0 L-3,9 L12,-8" stroke="#fff" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    s += onda(bx, by, t - tCheck, { r0: 20, r1: 70, w: 6, d: 0.45, cor: COR.green, duplo: false });
  }
  // título com letras saltando
  const str = TIT[i], size = 40, ls = 3;
  const tx = x + 92, ty = y + HH / 2 + 14;
  const sai = 1 - fin(t, A, 0.1);
  if (sai > 0) s += opa(sai, txt(str, tx, ty, { anchor: 'start', size, weight: 900, fill: '#b9ae9b', ls }));
  if (t >= A) {
    for (let k = 0; k < str.length; k++) {
      const kk = back(t, A + k * 0.028, 0.3);
      const lx = tx + largura(str.slice(0, k), size, 900) + k * ls;
      const cw = largura(str[k], size, 900);
      s += popG(kk, lx + cw / 2, ty - 14, txt(str[k], 0, 14, { size, weight: 900, fill: '#fff' }));
    }
  }
  // ícone à direita
  const ix = x + w - 48;
  const ki = lit ? 1 + 0.25 * bump(t, A, 0.35) : 1;
  s += popG(ki, ix, by, `<circle r="27" fill="#fff" stroke="${lit ? INK : '#c9bfae'}" stroke-width="3"/>`
    + (lit ? icone(ICO[i], 0, 0, 0.78) : icone(ICO[i], 0, 0, 0.78, '#e2d8c6', '#c9bfae')));
  return s;
}

function quadro(i, t, T, conteudo) {
  const x = PX[i], y = PY, w = PW, A = T.A[i];
  const lit = fin(t, A, 0.15);
  const done = i < 2 ? fin(t, T.A[i + 1], 0.3) : 0;
  const act = lit * (1 - done);
  let s = '';
  if (act > 0.01) {
    s += `<rect x="${x - 11}" y="${y - 11}" width="${w + 22}" height="${PH + 22}" rx="31" fill="none" stroke="${COR.orange}" stroke-width="6" opacity="${f(act * (0.3 + 0.18 * Math.sin(t * 7)))}"/>`;
  }
  s += cartao(x, y, w, PH, { r: 22 });
  const cl = `M${x + 2},${y + HH} L${x + w - 2},${y + HH} L${x + w - 2},${y + PH - 22} Q${x + w - 2},${y + PH - 2} ${x + w - 22},${y + PH - 2} L${x + 22},${y + PH - 2} Q${x + 2},${y + PH - 2} ${x + 2},${y + PH - 22}Z`;
  s += `<clipPath id="aprender_k${i}"><path d="${cl}"/></clipPath>`;
  // parede / piso do quadro
  const bg = `<rect x="${x}" y="${y + HH}" width="${w}" height="${PH - HH}" fill="${['#f3f7fb', '#fdf7ee', '#f2f7f4'][i]}"/>`
    + `<rect x="${x}" y="${FL - 2}" width="${w}" height="${PB - FL + 2}" fill="#ece3d2"/>`
    + `<path d="M${x},${FL - 2} L${x + w},${FL - 2}" stroke="#d7c9b0" stroke-width="3"/>`;
  s += `<g clip-path="url(#aprender_k${i})">${bg}${fantasma(i, t, T)}${conteudo}</g>`;
  s += cabecalho(i, t, T);
  s += `<rect x="${x}" y="${y}" width="${w}" height="${PH}" rx="22" fill="none" stroke="${INK}" stroke-width="3.5"/>`;
  s += varredura(`aprender_v${i}`, x, y, w, PH, inv(A + 0.02, A + 0.6, t), 22);
  if (act > 0.01) s += opa(1 - done, hudCantos(x - 10, y - 10, w + 20, PH + 20, inv(A, A + 0.3, t), COR.orange, 38, 5));
  return s;
}

// ícone-fantasma tracejado enquanto o quadro ainda não montou (como no Canteiro)
function fantasma(i, t, T) {
  const o = 1 - fin(t, T.B[i], 0.22);
  if (o <= 0) return '';
  const cx = PC[i], cy = 500 + Math.sin(t * 2 + i) * 5;
  const k = 1 - 0.3 * (1 - o);
  return opa(o, pop(k, cx, cy, `<circle cx="${cx}" cy="${f(cy)}" r="88" fill="#fff" fill-opacity=".5" stroke="#cdbf9f" stroke-width="4" stroke-dasharray="12 10" transform="rotate(${f(t * 30)} ${cx} ${f(cy)})"/>`
    + icone(ICO[i], cx, cy, 2.6, '#ece3d2', '#cdbf9f')));
}

// ---------------- quadro 1 · APRENDER ----------------
function caderno(x, y, t) {
  const sc = Math.sin(t * 15) * 2.5;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(-8)">`
    + `<rect x="-24" y="-30" width="48" height="58" rx="5" fill="#fff" stroke="${INK}" stroke-width="3.2"/>`
    + `<rect x="-24" y="-30" width="10" height="58" rx="3" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M-7,-16 L15,-16 M-7,-6 L15,-6 M-7,4 L${f(8 + sc)},4" stroke="${COR.blue2}" stroke-width="3" stroke-linecap="round"/>`
    + `<g transform="translate(${f(10 + sc)} ${f(8 + Math.cos(t * 15) * 2)}) rotate(35)"><rect x="-4" y="-34" width="8" height="30" rx="2" fill="${COR.orange2}" stroke="${INK}" stroke-width="2.5"/><path d="M-4,-4 L0,4 L4,-4Z" fill="${INK}"/></g>`
    + `</g>`;
}

function conteudo1(t, T) {
  const b = T.B[0], A = T.A[0];
  let s = '';
  // lousa no cavalete
  const BX = 290, BY = 334, BW = 256, BH = 156;
  let lousa = cavalete(BX, BY, BW, BH, FL - (BY + BH) - 2);
  lousa += `<rect x="${BX + 6}" y="${BY + 8}" width="${BW}" height="${BH}" rx="12" fill="rgba(22,35,59,.16)"/>`
    + `<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="12" fill="${COR.navy}" stroke="${INK}" stroke-width="4"/>`
    + icone('sparkle', BX + 26, BY + 29, 0.52)
    + txt('Aula de IA', BX + 46, BY + 38, { anchor: 'start', size: 25, weight: 800, fill: '#fff' })
    + txt('IA NA PRÁTICA', BX + 47, BY + 58, { anchor: 'start', size: 11, weight: 700, family: 'DM Sans', fill: '#8fa6c2', ls: 2.5 });
  const L = ['Prompts & contexto', 'Claude + Skills', 'Agentes & automação'];
  L.forEach((str, j) => {
    const a = A - 0.14 + j * 0.3;
    const yy = BY + 86 + j * 25;
    const kb = back(t, a, 0.3);
    if (kb > 0) lousa += popG(kb, BX + 24, yy - 6, `<circle r="8" fill="${COR.orange}"/>` + txt(String(j + 1), 0, 4.5, { size: 11, weight: 900, fill: '#fff' }));
    lousa += revela(`aprender_l${j}`, BX + 36, yy - 20, 210, 28, inv(a + 0.04, a + 0.34, t), txt(str, BX + 39, yy, { anchor: 'start', size: 15.5, weight: 700, family: 'DM Sans', fill: '#e6eef8' }));
  });
  // pequeno anel de progresso no canto da lousa
  const pr = clamp(inv(A - 0.1, A + 1.0, t));
  if (pr > 0) {
    const r = 13, a = pr * Math.PI * 2 - Math.PI / 2;
    lousa += `<circle cx="${BX + BW - 26}" cy="${BY + 28}" r="${r}" fill="none" stroke="#24456b" stroke-width="5"/>`
      + `<path d="M${BX + BW - 26},${BY + 28 - r} A${r},${r} 0 ${pr > 0.5 ? 1 : 0} 1 ${f(BX + BW - 26 + Math.cos(a) * r)},${f(BY + 28 + Math.sin(a) * r)}" fill="none" stroke="${COR.orange}" stroke-width="5" stroke-linecap="round"/>`;
  }
  s += pop(back(t, b, 0.42), BX + BW / 2, BY + BH, lousa);
  // robô professor: aponta com um laser a ponta da linha que está sendo escrita na lousa
  const RXr = 575, RS = 0.8;
  const linhas = L.map((str, j) => {
    const a = A - 0.14 + j * 0.3;
    const yy = BY + 86 + j * 25 - 6;
    const fim = BX + 39 + largura(str, 15.5, 700, 'DM Sans') + 4;
    // borda da escrita (acompanha a máscara de revelação), limitada ao fim do texto
    const bordaX = tt => Math.min(fim, BX + 36 + 210 * ease.out(clamp(inv(a + 0.04, a + 0.34, tt))));
    return { a, yy, fim, bordaX };
  });
  let jL = -1;
  linhas.forEach((ln, j) => { if (t >= ln.a) jL = j; });
  let alvo = null;
  if (jL >= 0) {
    const ln = linhas[jL];
    alvo = [Math.max(ln.bordaX(t), BX + 40), ln.yy];
    if (jL > 0) {
      // salto curto da linha anterior para a nova
      const pv = linhas[jL - 1];
      const u = ease.inOut(inv(ln.a, ln.a + 0.12, t));
      alvo = [lerp(pv.fim, alvo[0], u), lerp(pv.yy, alvo[1], u)];
    }
  }
  const bobR = Math.sin(t * 3) * 6;
  const piv = [RXr - 38 * RS, FL + (-70 + bobR) * RS];      // ombro do braço que aponta
  const mira = fin(t, A - 0.2, 0.2) * (1 - fin(t, T.tes + 0.05, 0.25));
  const alvoM = alvo ?? [BX + 40, linhas[0].yy];
  const th = Math.atan2(piv[1] - alvoM[1], piv[0] - alvoM[0]) * 180 / Math.PI;   // ângulo do braço (graus)
  const ptMira = -(th + 20 - Math.sin(t * 4) * 4) / 70;
  const ptRep = t < T.tes ? 0 : -0.55 + 0.12 * Math.sin(t * 2.2);
  const pt = lerp(ptRep, ptMira, mira);
  const kr = back(t, b + 0.12, 0.42);
  s += pop(kr, RXr, FL, robo(RXr, FL, t, RS, pt));
  const ol = alvo ? fin(t, linhas[0].a, 0.08) * (1 - fin(t, T.tes + 0.02, 0.18)) : 0;
  if (ol > 0.01) {
    const armA = (-20 - pt * 70 + Math.sin(t * 4) * 4) * Math.PI / 180;
    const hx = piv[0] - 38 * RS * Math.cos(armA), hy = piv[1] - 38 * RS * Math.sin(armA);
    const dx = alvo[0] - hx, dy = alvo[1] - hy, dl = Math.hypot(dx, dy) || 1;
    const sx = hx + dx / dl * 10, sy = hy + dy / dl * 10;
    const pul = 1 + 0.25 * Math.sin(t * 18);
    s += opa(ol, `<path d="M${f(sx)},${f(sy)} L${f(alvo[0])},${f(alvo[1])}" stroke="${COR.orange2}" stroke-width="9" stroke-linecap="round" opacity=".22"/>`
      + `<path d="M${f(sx)},${f(sy)} L${f(alvo[0])},${f(alvo[1])}" stroke="${COR.orange}" stroke-width="3.5" stroke-dasharray="8 6" stroke-dashoffset="${f(-t * 90)}" stroke-linecap="round" opacity=".9"/>`
      + `<circle cx="${f(alvo[0])}" cy="${f(alvo[1])}" r="${f(11 * pul)}" fill="${COR.orange}" opacity=".3"/>`
      + `<circle cx="${f(alvo[0])}" cy="${f(alvo[1])}" r="5.5" fill="${COR.orange}" stroke="#fff" stroke-width="2"/>`);
  }
  // Victor estudando
  const kv = back(t, b + 0.05, 0.42);
  const expr = t < A - 0.05 ? 'focus' : t < A + 0.4 ? 'wow' : 'joy';
  const VX = 196;
  const st = { x: VX, y: FL, s: SV, t, expr, gaze: [1.4, -0.9], armR: -26, armL: -44 + Math.sin(t * 15) * 5, hop: 14 * bump(t, A, 0.32), tilt: Math.sin(t * 1.6) * 3 };
  const hy = -14 * bump(t, A, 0.32) * SV;
  s += pop(kv, VX, FL, pessoa('victor', st) + caderno(VX + 8, FL - 58 + hy, t));
  // lâmpada da ideia (flutua acima do cabelo, mesmo no pulo)
  const LX = VX, LY = 414;
  const kl = back(t, A, 0.36);
  if (kl > 0) {
    const fl = 0.85 + 0.15 * Math.sin(t * 11);
    let raios = '';
    for (let j = 0; j < 8; j++) {
      const a = j * Math.PI / 4 + t * 0.6, r0 = 44, r1 = Math.min(56 + 6 * Math.sin(t * 8 + j), Math.sin(a) > 0.5 ? 50 : 62);
      raios += `M${f(Math.cos(a) * r0)},${f(Math.sin(a) * r0)} L${f(Math.cos(a) * r1)},${f(Math.sin(a) * r1)} `;
    }
    s += `<circle cx="${LX}" cy="${LY}" r="${f(78 * kl)}" fill="url(#aprender_luz)" opacity="${f(fl)}"/>`;
    s += popG(kl, LX, LY + Math.sin(t * 3) * 3, `<path d="${raios}" stroke="${COR.orange}" stroke-width="5" stroke-linecap="round"/>` + icone('bulb', 0, 0, 1.55, COR.orange2));
  }
  s += onda(LX, LY, t - A, { r0: 20, r1: 130, w: 9, d: 0.55 });
  s += faiscas(LX, LY, t - A - 0.03, COR.orange, 10, 46, 100);
  return s;
}

// ---------------- quadro 2 · TESTAR ----------------
function bug(x, y, k, t) {
  // k: 1 vivo, 0 esmagado
  const leg = Math.sin(t * 30) * 3 * k;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(1 + 0.25 * (1 - k))} ${f(0.3 + 0.7 * k)})">`
    + `<path d="M-13,-6 L-21,${f(-11 + leg)} M-13,2 L-22,${f(2 - leg)} M-12,9 L-20,${f(15 + leg)} M13,-6 L21,${f(-11 - leg)} M13,2 L22,${f(2 + leg)} M12,9 L20,${f(15 - leg)}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M-4,-16 L-9,-25 M4,-16 L9,-25" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`
    + `<circle cx="0" cy="-12" r="7" fill="${INK}"/>`
    + `<ellipse cx="0" cy="3" rx="13" ry="14" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M0,-10 L0,17" stroke="${INK}" stroke-width="2.5"/><circle cx="-6" cy="0" r="2.6" fill="${INK}"/><circle cx="6" cy="7" r="2.6" fill="${INK}"/>`
    + `</g>`;
}

function conteudo2(t, T) {
  const b = T.B[1], A = T.A[1];
  let s = '';
  // janela de testes
  const WX = 722, WY = 326, WW = 320, WH = 182;
  let win = cartao(WX, WY, WW, WH, { r: 14 })
    + `<path d="M${WX},${WY + 32} L${WX + WW},${WY + 32}" stroke="#e3e9f1" stroke-width="2.5"/>`
    + `<circle cx="${WX + 18}" cy="${WY + 16}" r="5" fill="#ff6b5e"/><circle cx="${WX + 33}" cy="${WY + 16}" r="5" fill="#ffc24b"/><circle cx="${WX + 48}" cy="${WY + 16}" r="5" fill="#3fc77a"/>`
    + txt('TESTES · IA', WX + WW - 16, WY + 22, { anchor: 'end', size: 12, weight: 700, family: 'DM Sans', fill: COR.grey, ls: 2.5 });
  const rows = [
    { lab: 'Prompt', a0: A - 0.22, a1: A + 0.08, ok: A + 0.1 },
    { lab: 'Dados', a0: A - 0.12, a1: A + 0.44, ok: A + 0.42, bugAt: A + 0.3 },
    { lab: 'Resultado', a0: A + 0.28, a1: A + 0.62, ok: A + 0.66 },
  ];
  rows.forEach((r, j) => {
    const ry = WY + 62 + j * 42;
    let p;
    if (r.bugAt) {
      p = t < r.bugAt ? 0.62 * ease.out(inv(r.a0, r.bugAt - 0.12, t)) : lerp(0.62, 1, ease.out(inv(r.bugAt + 0.02, r.a1, t)));
    } else p = ease.inOut(inv(r.a0, r.a1, t));
    const ok = t >= r.ok;
    const BXr = WX + 150, BWr = 124;
    win += `<circle cx="${WX + 26}" cy="${ry}" r="12" fill="#fff" stroke="#c9d4e2" stroke-width="3"/>`;
    win += txt(r.lab, WX + 48, ry + 7, { anchor: 'start', size: 19, weight: 700, fill: COR.navy });
    win += `<rect x="${BXr}" y="${ry - 6}" width="${BWr}" height="12" rx="6" fill="#e8edf3"/>`;
    if (p > 0) win += `<rect x="${BXr}" y="${ry - 6}" width="${f(BWr * p)}" height="12" rx="6" fill="${ok ? COR.green : COR.blue2}"/>`;
    if (ok) {
      const kc = back(t, r.ok, 0.32);
      win += popG(kc, WX + 26, ry, `<circle r="14" fill="${COR.green}" stroke="${INK}" stroke-width="2.5"/><path d="M-6,0 L-1.5,5 L7,-5" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
      win += txt('OK', WX + WW - 16, ry + 6, { anchor: 'end', size: 15, weight: 800, fill: COR.green, extra: `opacity="${f(fin(t, r.ok, 0.15))}"` });
      win += faiscas(WX + 26, ry, t - r.ok, COR.green, 7, 16, 34);
    }
    if (r.bugAt) {
      const vivo = t < r.bugAt;
      const bx = BXr + BWr * 0.62 + 16 + (vivo ? Math.sin(t * 6) * 6 : 0);
      const kk = vivo ? 1 : 1 - ease.out(inv(r.bugAt, r.bugAt + 0.08, t));
      const ob = vivo ? fin(t, r.a0, 0.15) : 1 - fin(t, r.bugAt + 0.18, 0.2);
      if (ob > 0) win += opa(ob, bug(bx, ry, kk, t));
      win += particulas(41, bx, ry, t - r.bugAt, { n: 12, v: 150, sz: 7, d: 0.45, g: 60, cores: [COR.orange, INK, COR.orange2] });
      win += faiscas(bx, ry, t - r.bugAt, INK, 8, 14, 34);
    }
  });
  s += pop(back(t, b, 0.42), WX + WW / 2, WY + WH, win);
  // A/B
  const AX = 1062, AW = 128;
  const ganha = A + 0.55;
  const card = (lbl, y, cor, alto, j) => {
    const kc = back(t, b + 0.08 + j * 0.08, 0.38);
    const isB = lbl === 'B';
    const win2 = isB && t >= ganha;
    const kw = win2 ? 1 + 0.08 * bump(t, ganha, 0.3) : 1;
    let c = cartao(AX, y, AW, 82, { r: 12, stroke: win2 ? COR.orange : INK, sw: win2 ? 4.5 : 3.5 })
      + `<circle cx="${AX + 28}" cy="${y + 41}" r="17" fill="${cor}" stroke="${INK}" stroke-width="2.5"/>`
      + txt(lbl, AX + 28, y + 49, { size: 21, weight: 900, fill: '#fff' });
    for (let q = 0; q < 3; q++) {
      const hgt = alto[q] * (0.85 + 0.15 * Math.sin(t * 4 + q + j));
      c += `<rect x="${AX + 58 + q * 18}" y="${f(y + 64 - hgt)}" width="12" height="${f(hgt)}" rx="3" fill="${q === 2 ? cor : COR.lblue}"/>`;
    }
    if (win2) {
      c += popG(back(t, ganha, 0.32), AX + AW - 6, y + 6, `<circle r="15" fill="${COR.green}" stroke="${INK}" stroke-width="2.5"/><path d="M-6,0 L-1.5,5 L7,-5" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    const dim = !isB && t >= ganha ? 1 - 0.5 * fin(t, ganha, 0.25) : 1;
    return opa(dim, pop(kc * kw, AX + AW / 2, y + 41, c));
  };
  s += card('A', 326, COR.slate, [18, 30, 24], 0);
  s += card('B', 426, COR.orange, [22, 34, 46], 1);
  s += onda(AX + AW / 2, 467, t - ganha, { r0: 30, r1: 110, w: 6, d: 0.45, duplo: false });
  // mesa sobe do rodapé do quadro; Victor surge atrás dela e digita no laptop
  if (t < b - 0.06) return s;
  const VX = 958;
  const dm = (1 - ease.out(inv(b - 0.06, b + 0.22, t))) * 150;
  const kv = back(t, b + 0.12, 0.42);   // Victor surge depois do laptop (nunca uma cabeça sobre a mesa vazia)
  const sobe = (1 - clamp(kv)) * 110;
  const typing = t >= A - 0.25;
  const expr = t < A + 0.7 ? 'focus' : 'smile';
  let m = `<ellipse cx="${VX}" cy="${FL - 120}" rx="${f(90)}" ry="70" fill="url(#aprender_tela)" opacity="${f(clamp(kv))}"/>`;
  if (kv > 0.001) m += pessoa('victor', { x: VX, y: FL + 22 + sobe, s: SV, t, expr, gaze: [0, 0.6], typing, armL: typing ? undefined : 8, armR: typing ? undefined : 8 });
  m += `<rect x="752" y="668" width="416" height="18" rx="7" fill="#fff" stroke="${INK}" stroke-width="3.5"/>`
    + `<rect x="772" y="686" width="376" height="50" fill="#e3ecf5" stroke="${INK}" stroke-width="3.5"/>`
    + `<path d="M772,700 L1148,700" stroke="${COR.orange}" stroke-width="4"/>`;
  // laptop (de costas)
  const kl = back(t, b, 0.4);
  m += pop(kl, VX, 668, `<rect x="${VX - 82}" y="662" width="164" height="9" rx="4" fill="#c9d4e2" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M${VX - 68},664 L${VX - 62},620 L${VX + 62},620 L${VX + 68},664Z" fill="#dfe8f2" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
    + pilula(VX - 26, 631, 52, 22, COR.navy, 'none', 0) + txt('DTS', VX, 647.5, { size: 14, weight: 900, fill: '#fff', ls: 1.5 })
    + `<rect x="${VX + 32}" y="636" width="12" height="12" rx="2" fill="${COR.orange}"/>`);
  // mãos digitando sobre a base do laptop + glifos de código subindo ao lado da tela
  const od = typing ? fin(t, A - 0.25, 0.12) * clamp(kv) : 0;
  if (od > 0.01) {
    let mh = '';
    for (let k = 0; k < 2; k++) {
      const hy = 664 - 4.5 * Math.max(0, Math.sin(t * 22 + k * Math.PI));
      mh += `<circle cx="${VX + (k ? 30 : -30)}" cy="${f(hy)}" r="9" fill="${ELENCO_DTS.victor.skin}" stroke="${INK}" stroke-width="3"/>`;
    }
    ['</>', '{ }', '01'].forEach((g, j) => {
      const p = ((t - A) * 1.3 + j / 3 + 3) % 1;
      const gx = VX + (j % 2 ? 96 : -96) + Math.sin(t * 3 + j) * 4, gy = 640 - p * 64;
      mh += txt(g, gx, gy, { size: 17, weight: 800, fill: j === 1 ? COR.orange : COR.blue, extra: `opacity="${f(0.7 * Math.sin(p * Math.PI))}"` });
    });
    m += opa(od, mh);
  }
  s += dm > 0.5 ? `<g transform="translate(0 ${f(dm)})">${m}</g>` : m;
  return s;
}

// ---------------- quadro 3 · ENTREGAR ----------------
function caixa(cx, cy, t, o = {}) {
  // caixa-presente centrada em (cx, cy); a escala BS é aplicada por fora (pop)
  const sh = o.selo ?? 0;
  let s = `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(o.rot ?? 0)})">`
    + `<rect x="-46" y="-24" width="92" height="60" rx="6" fill="${COR.orange}" stroke="${INK}" stroke-width="3.5"/>`
    + `<rect x="-52" y="-40" width="104" height="20" rx="5" fill="${COR.orange2}" stroke="${INK}" stroke-width="3.5"/>`
    + `<rect x="-8" y="-40" width="16" height="76" fill="#fff" stroke="${INK}" stroke-width="2.6"/>`
    + `<path d="M0,-40 C-10,-62 -34,-56 -22,-42 C-16,-38 -8,-40 0,-40Z M0,-40 C10,-62 34,-56 22,-42 C16,-38 8,-40 0,-40Z" fill="#fff" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>`;
  if (sh > 0) {
    s += popG(sh, 0, 12, `<circle r="15" fill="${COR.green}" stroke="${INK}" stroke-width="2.6"/><path d="M-6,0 L-1.5,5 L7,-5" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  return s + `</g>`;
}

const BS = 0.76;                 // escala da caixa (cabe entre as mãos, à altura do quadril)
const CID = 'aprender_cliente';
const CX3 = 1640;                // x da cliente

// Posição (mundo) da mão que pessoa() desenha para o braço `side` (±1) com ângulo `ang` (graus).
function mao(id, st, side, ang) {
  const a = ang * Math.PI / 180, sx = st.flip ? -1 : 1, s = st.s ?? 1;
  const bob = st.walk != null ? Math.abs(Math.sin(st.walk * Math.PI * 2)) * -5 : 0;
  const br = 1 + Math.sin((st.t ?? 0) * 2.4 + id.length) * 0.012;
  return [st.x + sx * s * side * (34 + Math.sin(a) * 56), st.y + s * ((-110 + Math.cos(a) * 56) * br - (st.hop ?? 0) + bob)];
}
const maoSVG = (p, skin) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(10 * SV)}" fill="${skin}" stroke="${INK}" stroke-width="3"/>`;
const L2 = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];

// Estado do quadro 3 (personagens + caixa) num instante — usado também pelo rastro da caixa.
function estado3(t, T) {
  const b = T.B[2], A = T.A[2], g0 = T.give0, g1 = T.give1;
  const ergue = ease.out(inv(g0, g0 + 0.22, t));              // Victor estende a caixa com a mão direita
  const pega = ease.out(inv(g0 + 0.1, g0 + 0.34, t));         // a cliente estende os braços para pegar
  const passa = ease.inOut(inv(g0 + 0.3, g1, t));             // a caixa troca de mãos
  const recolhe = ease.inOut(inv(g1 - 0.02, T.cli + 0.22, t)); // ela traz a caixa para junto do corpo
  // Victor: entra andando com a caixa nas duas mãos, dá um passo e estende o braço; depois comemora
  const VX = lerp(1300, 1432, ease.out(inv(b, A + 0.04, t))) + 14 * ease.inOut(inv(g0, g0 + 0.3, t));
  let vArmR = lerp(4, 72, ergue);
  const vArmL = lerp(4, 12, ergue);
  if (t >= g1) {
    const up = ease.out(inv(g1, g1 + 0.28, t));
    vArmR = lerp(72, 124, up) + 7 * Math.sin((t - g1 - 0.28) * 10) * fin(t, g1 + 0.28, 0.15);
  }
  const vExpr = t >= T.cli ? 'proud' : t >= T.qual ? 'joy' : 'smile';
  const vst = { x: VX, y: FL, s: SV, t, expr: vExpr, gaze: [1, 0], armL: vArmL, armR: vArmR, hop: 8 * bump(t, T.qual, 0.3) };
  if (t < A + 0.04) vst.walk = (t - b) * 2.2;
  // cliente: acena, abre os braços para receber, puxa a caixa para si e pula de alegria
  let cArmR = lerp(8, 62, pega), cArmL = lerp(8, 30, pega);
  if (t >= g1 - 0.02) { cArmR = lerp(62, 4, recolhe); cArmL = lerp(30, 4, recolhe); }
  const cExpr = t >= T.cli - 0.02 ? 'joy' : 'smile';
  const cst = {
    x: CX3, y: FL, s: SV, t, flip: true, expr: cExpr, gaze: [-1, 0],
    hop: 16 * bump(t, T.cli, 0.36) + 7 * bump(t, T.cli + 0.46, 0.3), armL: cArmL, armR: cArmR,
  };
  const acena = t > A - 0.12 && t < T.qual - 0.05;
  if (acena) { cst.wave = 1; delete cst.armR; }
  // caixa: quadril dele (2 mãos) → estendida na mão direita dele → mão dela → quadril dela (2 mãos)
  const quadril = (id, st) => [st.x, mao(id, st, 1, 4)[1] - 5];
  const estendida = (id, st, ang, dir) => { const [hx, hy] = mao(id, st, 1, ang); return [hx + dir * 30, hy - 8]; };
  let box, rot;
  if (t < g0 + 0.3) { box = L2(quadril('victor', vst), estendida('victor', vst, vArmR, 1), ergue); rot = 6 * Math.sin(Math.PI * ergue); }
  else if (t < g1 - 0.02) { box = L2(estendida('victor', vst, vArmR, 1), estendida(CID, cst, cArmR, -1), passa); rot = 4 * Math.sin(Math.PI * passa); }
  else { box = L2(estendida(CID, cst, cArmR, -1), quadril(CID, cst), recolhe); rot = -6 * Math.sin(Math.PI * recolhe); }
  return { VX, vst, cst, box, rot, acena, vArmR, vArmL, cArmR, cArmL };
}

// confete local: só cores que aparecem sobre o fundo claro do quadro (sem branco)
function confete3(t, t0, seed, n, area) {
  const age = t - t0;
  if (age < 0) return '';
  const r = rng(seed);
  const cores = [COR.orange, COR.blue2, COR.orange2, COR.blue, COR.slate];
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = area[0] + r() * area[2], vy = 220 + r() * 220, ph = r() * 6, w = 10 + r() * 9, h = 6 + r() * 7;
    const y = area[1] - 40 + age * vy - r() * 260;
    if (y < area[1] - 60 || y > area[1] + area[3] + 30) continue;
    const x = x0 + Math.sin(age * 3 + ph) * 34;
    s += `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="2" fill="${cores[i % cores.length]}" transform="rotate(${f(age * 260 + ph * 60)} ${f(x)} ${f(y)})"/>`;
  }
  return s;
}

function conteudo3(t, T) {
  const b = T.B[2], A = T.A[2], g0 = T.give0, g1 = T.give1;
  let s = '';
  // confete atrás de tudo (prédio, placa e personagens), na faixa acima das cabeças
  s += confete3(t, T.cli, 13, 26, [1290, 290, 510, 170]);
  // prédio do cliente (sobe por máscara)
  const PX3 = 1670, PW3 = 106, PY3 = 384;
  let pr = `<rect x="${PX3}" y="${PY3}" width="${PW3}" height="${FL - PY3}" fill="${COR.lblue}" stroke="${INK}" stroke-width="3.5"/>`
    + `<rect x="${PX3 - 8}" y="${PY3 - 12}" width="${PW3 + 16}" height="14" rx="4" fill="${COR.slate}" stroke="${INK}" stroke-width="3"/>`;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) {
    pr += `<rect x="${PX3 + 14 + c * 29}" y="${PY3 + 18 + r * 42}" width="20" height="24" rx="3" fill="#fff" opacity="${f(0.55 + 0.35 * Math.sin(r * 2.1 + c + t * 1.5))}"/>`;
  }
  // placa CLIENTE
  const acende = fin(t, T.cli, 0.12);
  const wP = 118;
  let placa = `<path d="M${PX3 + 26},${PY3 - 12} L${PX3 + 26},${PY3 - 26} M${PX3 + PW3 - 26},${PY3 - 12} L${PX3 + PW3 - 26},${PY3 - 26}" stroke="${INK}" stroke-width="4"/>`
    + pilula(PX3 + PW3 / 2 - wP / 2, PY3 - 58, wP, 34, COR.navy, INK, 3);
  if (acende > 0) placa += revela('aprender_pl', PX3 + PW3 / 2 - wP / 2 - 4, PY3 - 62, wP + 8, 42, acende, pilula(PX3 + PW3 / 2 - wP / 2, PY3 - 58, wP, 34, COR.orange, INK, 3));
  placa += txt('CLIENTE', PX3 + PW3 / 2, PY3 - 34.5, { size: 16, weight: 800, family: 'DM Sans', fill: '#fff', ls: 2.5 });
  const kp = 1 + 0.15 * bump(t, T.cli, 0.3);
  pr += pop(kp, PX3 + PW3 / 2, PY3 - 41, placa);
  s += revela('aprender_pr', PX3 - 30, PY3 - 70, PW3 + 60, FL - PY3 + 72, inv(b - 0.05, b + 0.35, t), pr, 'y');
  s += onda(PX3 + PW3 / 2, PY3 - 41, t - T.cli, { r0: 30, r1: 120, w: 7, d: 0.5 });

  const E = estado3(t, T);
  const [bx, by] = E.box;
  const ov = fin(t, b - 0.02, 0.12);
  // brilho da caixa (atrás dos personagens)
  const brilho = (0.35 + 0.65 * fin(t, A - 0.05, 0.2)) * ov;
  s += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(74 + 6 * Math.sin(t * 6))}" fill="url(#aprender_luz)" opacity="${f(brilho * 0.85)}"/>`;
  // estrelas da cliente (atrás dela: arco acima da cabeça)
  if (t >= T.cli) {
    for (let j = 0; j < 5; j++) {
      const a0 = T.cli + 0.03 + j * 0.06;
      const k = back(t, a0, 0.34);
      const ang = Math.PI * (1.15 + j * 0.175);
      const x = CX3 + Math.cos(ang) * 100, y = 552 + Math.sin(ang) * 100 - 4 * Math.sin(t * 4 + j);
      if (k > 0) s += popG(k, x, y, estrela(0, 0, 17, COR.orange, Math.sin(t * 3 + j) * 8));
    }
  }
  // estouro de partículas atrás da cabeça da cliente (nunca na frente do rosto)
  s += particulas(91, CX3, FL - 250, t - T.cli, { n: 14, v: 240, sz: 9, d: 0.7, g: 220, cores: [COR.orange, COR.orange2, COR.blue2, COR.blue] });
  // cliente
  const kc = back(t, b + 0.1, 0.42);
  s += pop(kc, CX3, FL, pessoa(CID, E.cst));
  // Victor
  s += opa(ov, pessoa('victor', E.vst));
  // rastro da caixa quando ela se move rápido
  const P = dt => estado3(t - dt, T).box;
  const pb = P(0.03), vel = Math.hypot(bx - pb[0], by - pb[1]) / 0.03;
  if (t > g0 && vel > 120) {
    s += rastro(P, (x, y) => `<rect x="${f(x - 36)}" y="${f(y - 26)}" width="72" height="50" rx="7" fill="${COR.orange2}"/>`, 4, 0.03).replace(/<rect[^>]*\/>$/, '');
  }
  // caixa + mãos que a seguram (por cima da caixa, nas posições exatas das mãos dos personagens)
  const selo = back(t, T.qual + 0.1, 0.35);
  const kBox = 1 + 0.1 * bump(t, T.cli + 0.16, 0.3);
  let cx = pop(BS * kBox, bx, by, caixa(bx, by, t, { selo, rot: E.rot }));
  const skV = ELENCO_DTS.victor.skin, skC = ELENCO_DTS[CID].skin;
  if (t < g0 + 0.2) cx += maoSVG(mao('victor', E.vst, -1, E.vArmL), skV);
  if (t < g1 + 0.04) cx += maoSVG(mao('victor', E.vst, 1, E.vArmR), skV);
  if (!E.acena && t >= g0 + 0.24) cx += opa(kc, maoSVG(mao(CID, E.cst, 1, E.cArmR), skC));
  if (t >= g1 - 0.02) cx += opa(kc, maoSVG(mao(CID, E.cst, -1, E.cArmL), skC));
  s += opa(ov, cx);
  s += onda(bx, by, t - A, { r0: 30, r1: 130, w: 8, d: 0.5 });
  s += onda(bx, by, t - T.cli - 0.16, { r0: 30, r1: 120, w: 7, d: 0.45, duplo: false });
  // brilhinhos em volta da caixa (elipse achatada: não passam pelos rostos)
  if (t >= A) {
    for (let j = 0; j < 4; j++) {
      const a = j * Math.PI / 2 + t * 1.4;
      const k = 0.5 + 0.5 * Math.sin(t * 7 + j * 1.7);
      s += icone('sparkle', bx + Math.cos(a) * 68, by + 6 + Math.sin(a) * 26, 0.3 * k, COR.orange2);
    }
  }
  return s;
}

// ---------------- carimbo QUALIDADE (fora do recorte do quadro: cai da câmera) ----------------
function seloQualidade(t, T) {
  const SX = 1478, SY = 420;
  const qa = T.qual - 0.17;
  if (t < qa) return '';
  let s = '';
  s += onda(SX, SY, t - T.qual, { r0: 60, r1: 230, w: 12, d: 0.5 });
  s += particulas(77, SX, SY + 10, t - T.qual, { n: 22, v: 320, sz: 10, d: 0.6 });
  s += faiscas(SX - 150, SY + 14, t - T.qual, COR.orange, 7, 18, 52);
  s += faiscas(SX + 150, SY - 18, t - T.qual, COR.orange, 7, 18, 52);
  const u = inv(qa, T.qual, t);
  const yy = SY + (t > T.qual ? Math.sin((t - T.qual) * 3) * 3 : 0);
  if (t < T.qual) {
    // zoom-blur: cópias maiores e transparentes rastreando a queda
    const sc = lerp(2.7, 1, ease.in(u));
    s += opa(0.12 * u, carimbo('QUALIDADE', SX, yy - 30, sc * 1.35, { size: 30, rot: -6 }));
    s += opa(0.22 * u, carimbo('QUALIDADE', SX, yy - 14, sc * 1.15, { size: 30, rot: -6 }));
    s += opa(clamp(u * 3), carimbo('QUALIDADE', SX, yy, sc, { size: 30, rot: -6 }));
    return s;
  }
  const sc = 1 - 0.07 * bump(t, T.qual, 0.22);
  s += carimbo('QUALIDADE', SX, yy, sc, { size: 30, rot: -6 });
  s += varredura('aprender_cv', SX - 150, yy - 32, 300, 64, inv(T.qual + 0.16, T.qual + 0.6, t), 12);
  s += `<g transform="translate(${SX + 110} ${f(yy - 30)}) rotate(${f(t * 40)})">${estrela(0, 0, 15 * back(t, T.qual + 0.05, 0.3), '#fff')}</g>`;
  return s;
}

// ---------------- quadro final ----------------
export function desenhar(t, ctx) {
  const T = tempos(ctx);
  const cam = camera(t, T);
  let mundo = '';
  mundo += postes();
  mundo += trilho(t, T);
  mundo += quadro(0, t, T, conteudo1(t, T));
  mundo += quadro(1, t, T, conteudo2(t, T));
  mundo += quadro(2, t, T, conteudo3(t, T));
  mundo += seloQualidade(t, T);
  mundo += ponto(t, T);
  mundo += fita(t, T);
  const tf = `translate(${f(960 + cam.dx)} ${f(540 + cam.dy)}) scale(${f(cam.z)}) translate(${f(-cam.cx)} ${f(-cam.cy)})`;
  return defs() + fundo(t, cam) + `<g transform="${tf}">${mundo}</g>`;
}
