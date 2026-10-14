// Cena 6 · MÃO NA MASSA — "Dashboards, propostas, sistemas, produtos de engajamento… tudo saindo do
// computador, direto para o cliente!" (≈ 31.14 → 39.34 s)
//
// Cenário (fundo creme): à esquerda o Victor sentado à mesa, digitando no notebook (tela de frente
// para a câmera, ao lado dele, para o rosto ficar livre); no alto à esquerda, uma sala de vidro ao
// longe com os três diretores observando (camada com paralaxe); no centro o quadro "ENTREGAS"
// (grade 4 × 2); embaixo uma esteira que leva até o prédio "CLIENTE" à direita (doca de entrada,
// 10 janelas = 10 entregas).
//
// Batidas (tempos absolutos):
//   t0+0.3        balão dos diretores com o olho ("de longe, vendo").
//   produtos[i].t cada produto se forma na tela (ícone + anel) e, no instante exato, é "cuspido":
//                 flash na tela, onda de choque, partículas, recuo do notebook, tremor leve; o cartão
//                 voa em arco girando, com rastro, cresce e pousa com squash no seu lugar do quadro
//                 (faíscas + onda), o contador ENTREGAS sobe.
//   wa(59)        "produtos": o balão vira joinha, o diretor 1 levanta o braço.
//   P7 pousa      quadro cheio: cantos de HUD travam no quadro, varredura de luz.
//   wa(62)        "tudo": a esteira acelera; os cartões descem do quadro em cascata para a esteira
//                 (o lugar vazio ganha um check verde); os produtos 8 e 9 saem do notebook direto
//                 para a esteira ("direto para o cliente").
//   chegadas      cada cartão entra na doca do prédio: cortina de tiras balança, uma janela acende,
//                 "+1" verde sobe. Agenda montada para a ÚLTIMA entrega cair exatamente em wa(69).
//   wa(69)        "cliente!": selo de check gigante sobre o prédio (brilho, onda, partículas,
//                 confete, tremor), varredura na placa CLIENTE, carimbo ENTREGUE! no quadro, Victor
//                 vibra com o punho, diretores comemoram e o balão vira check.
import {
  COR, INK, W, H, CHAO, txt, largura, pilula, cartao, icone, pessoa,
  clamp, lerp, inv, ease, kf, rng, n2, back, fin, popG, opa,
  fundoCreme, onda, particulas, poeira, hudCantos, tremor, faiscas, varredura, confete, carimbo,
} from '../base.js';

const f = n2;

export const CHIP = ['CENA 6 · MÃO NA MASSA', 'Ideia vira entrega'];

// ---------------- layout ----------------
const VX = 300, VS = 1.3;                         // Victor
const MESA = 748;                                 // tampo da mesa (Victor recortado acima disso)
// notebook: tela = paralelogramo (local 200 × 150) -> matrix(a b c d e f)
const TM = [1.04, 0, -0.08, 1.0267, 432, 572];
const tela = (u, v) => [TM[4] + TM[0] * u + TM[2] * v, TM[5] + TM[1] * u + TM[3] * v];
const [EX, EY] = tela(100, 78);                   // boca do "canhão" (centro da tela)
// sala de vidro dos diretores (camada distante)
const JX = 84, JY = 216, JW = 404, JH = 214;
// quadro de entregas
const PX0 = 742, PY0 = 196, PW = 748, PH = 434;
const CW = 160;
const COLX = [840, 1024, 1208, 1392];
const ROWY = [350, 530];
const slotXY = i => [COLX[i % 4], ROWY[Math.floor(i / 4)]];
// esteira
const BX0 = 732, BX1 = 1770, BTOP = 756;          // superfície da esteira
const ESC = 0.7;                                  // escala do cartão na esteira
const BCY = BTOP - CW * ESC / 2;                  // centro y do cartão na esteira
const POUSO = 792;                                // onde os produtos 8 e 9 caem na esteira
// prédio CLIENTE
const PR0 = 1612, PR1 = 1878, PRT = 404;
const DOCA1 = 1738, DOCAT = 636;                  // doca: x de PR0 a DOCA1, y de DOCAT ao chão
const PORTA = 1700;                               // chegada = centro do cartão cruza este x
const PCX = (PR0 + PR1) / 2;                      // centro do prédio
const JAN = (() => { const L = []; for (let r = 4; r >= 0; r--) for (let c = 0; c < 2; c++) L.push([PCX - 56 + c * 112, PRT + 36 + r * 40]); return L; })();
const SELO = [PCX, PRT - 166];                    // selo de check do final

const FL = 0.5, FLB = 0.45, DROP = 0.28;          // voos: quadro, esteira; descida do quadro

// ---------------- agenda (montada a partir da narração) ----------------
function agenda(ctx) {
  const P = ctx.produtos, wa = ctx.wa;
  const tudo = wa(62), cli = wa(69);
  const t8 = P[8].t + FLB, t9 = P[9].t + FLB;           // pouso na esteira
  const v = (PORTA - POUSO) / (cli - t9);               // velocidade: o último chega em "cliente!"
  const a8 = t8 + (PORTA - POUSO) / v;
  const d2 = (cli - a8) / 3;
  const a1 = tudo + DROP + (PORTA - COLX[3]) / v;       // 1º a sair do quadro sai em "tudo"
  const a6 = a8 - d2;
  const d1 = (a6 - a1) / 5;
  // ordem de saída: coluna da direita primeiro, linha de baixo antes da de cima
  const ordem = [7, 3, 6, 2, 5, 1, 'P8', 4, 0, 'P9'];
  const chegadas = [];
  const sai = {};                                       // slot -> { td, tl, a, bx }
  let k = 0;
  ordem.forEach((o, j) => {
    let a;
    if (o === 'P8') a = a8; else if (o === 'P9') a = cli;
    else if (j < 6) a = a1 + j * d1; else a = a8 + (j - 6) * d2;
    chegadas.push(a);
    if (typeof o === 'number') {
      const bx = COLX[o % 4];
      const tl = a - (PORTA - bx) / v;
      sai[o] = { td: tl - DROP, tl, a, bx };
    }
    k++;
  });
  return { v, t8, t9, sai, chegadas, tudo, cli, cheio: P[7].t + FL };
}

// ---------------- utilidades ----------------
const pulso = (a, d) => (a < 0 || a > d ? 0 : Math.pow(1 - a / d, 2));
const bez = (a, c, b, u) => { const w = 1 - u; return [w * w * a[0] + 2 * w * u * c[0] + u * u * b[0], w * w * a[1] + 2 * w * u * c[1] + u * u * b[1]]; };
const quad = (pts, attrs) => `<path d="M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}Z" ${attrs}/>`;
const ST = (w = 3.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"`;

function defs() {
  return `<defs>`
    + `<linearGradient id="en_sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16395e"/><stop offset="1" stop-color="#0a2238"/></linearGradient>`
    + `<radialGradient id="en_gl"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".8"/><stop offset=".55" stop-color="${COR.orange}" stop-opacity=".18"/><stop offset="1" stop-color="${COR.orange}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="en_gv"><stop offset="0" stop-color="#7fe0a8" stop-opacity=".75"/><stop offset="1" stop-color="${COR.green}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="en_in" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16395e"/><stop offset=".7" stop-color="#0a2238"/><stop offset="1" stop-color="#3a2a10"/></linearGradient>`
    + `<clipPath id="en_vc"><rect x="0" y="0" width="${W}" height="${MESA}"/></clipPath>`
    + `<clipPath id="en_tc"><rect x="0" y="0" width="200" height="150"/></clipPath>`
    + `<clipPath id="en_jc"><rect x="${JX}" y="${JY}" width="${JW}" height="${JH}" rx="8"/></clipPath>`
    + `</defs>`;
}

// tamanho do rótulo para caber no cartão
const _tam = {};
function tamRotulo(s) {
  if (_tam[s] == null) _tam[s] = Math.min(22, 22 * 134 / largura(s, 22, 800));
  return _tam[s];
}

// cartão de entrega centrado em (0,0), 160 × 160
function cartaoProduto(p, i) {
  const h = CW / 2, r = 18;
  return `<rect x="${-h + 6}" y="${-h + 8}" width="${CW}" height="${CW}" rx="${r}" fill="rgba(22,35,59,.16)"/>`
    + `<rect x="${-h}" y="${-h}" width="${CW}" height="${CW}" rx="${r}" fill="#fff"/>`
    + `<path d="M${-h},${-h + 24} L${-h},${-h + r} A${r},${r} 0 0 1 ${-h + r},${-h} L${h - r},${-h} A${r},${r} 0 0 1 ${h},${-h + r} L${h},${-h + 24}Z" fill="${COR.orange}"/>`
    + txt(String(i + 1).padStart(2, '0'), -h + 14, -h + 18, { anchor: 'start', size: 14, weight: 700, family: 'DM Sans', fill: '#fff', ls: 1.5 })
    + `<circle cx="${h - 34}" cy="${-h + 12}" r="3.4" fill="#fff" opacity=".85"/><circle cx="${h - 23}" cy="${-h + 12}" r="3.4" fill="#fff" opacity=".6"/><circle cx="${h - 12}" cy="${-h + 12}" r="3.4" fill="#fff" opacity=".4"/>`
    + `<circle cx="0" cy="-6" r="38" fill="#fff4e6"/>` + icone(p.icone, 0, -6, 1.28)
    + txt(p.rotulo, 0, 60, { size: tamRotulo(p.rotulo), weight: 800, fill: COR.navy })
    + `<rect x="${-h}" y="${-h}" width="${CW}" height="${CW}" rx="${r}" fill="none" stroke="${INK}" stroke-width="3.5"/>`;
}

function slotVazio(x, y, t) {
  const h = CW / 2;
  return `<rect x="${x - h}" y="${y - h}" width="${CW}" height="${CW}" rx="18" fill="rgba(255,255,255,.55)" stroke="${COR.blue3}" stroke-width="3" stroke-dasharray="11 9" stroke-dashoffset="${f(-t * 26)}"/>`
    + `<path d="M${x - 12},${y} h24 M${x},${y - 12} v24" stroke="${COR.blue3}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
}

function slotEntregue(p, x, y, t, k) {
  const h = CW / 2;
  let s = `<rect x="${x - h}" y="${y - h}" width="${CW}" height="${CW}" rx="18" fill="rgba(255,255,255,.6)" stroke="${COR.blue3}" stroke-width="3" stroke-dasharray="11 9" stroke-dashoffset="${f(-t * 26)}"/>`
    + `<g opacity=".3">${icone(p.icone, x, y - 8, 1.1, COR.lblue, COR.slate)}</g>`
    + txt(p.rotulo, x, y + 58, { size: tamRotulo(p.rotulo) * 0.92, weight: 700, fill: COR.grey });
  s += popG(back(t, k, 0.4), x + h - 16, y - h + 16, `<circle r="21" fill="${COR.green}" stroke="${INK}" stroke-width="3"/><path d="M-9,0 L-2,8 L10,-7" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  return s;
}

// joinha simples (mão laranja com punho navy)
function joinha(s = 1) {
  return `<g transform="scale(${f(s)})"><rect x="-21" y="-4" width="11" height="28" rx="3" fill="${COR.navy}" stroke="${INK}" stroke-width="3"/>`
    + `<path d="M-10,-2 L-3,-3 L1,-17 Q3,-25 9,-22 Q13,-19 11,-10 L10,-5 L18,-5 Q24,-4 22,3 L19,18 Q18,23 12,23 L-10,23Z" fill="${COR.orange2}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="M10,4 L20,4 M9,12 L19,12" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/></g>`;
}

const checkGrande = r => `<circle r="${r}" fill="${COR.green}" stroke="${INK}" stroke-width="${f(r * 0.08)}"/><path d="M${f(-r * 0.45)},${f(r * 0.02)} L${f(-r * 0.1)},${f(r * 0.38)} L${f(r * 0.5)},${f(-r * 0.34)}" stroke="#fff" stroke-width="${f(r * 0.24)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

// ---------------- camada distante: sala de vidro com os diretores ----------------
function salaDiretores(t, ctx, A) {
  const { wa, t0 } = ctx;
  const cli = A.cli, joia = wa(59);
  let s = '';
  // trecho de parede do escritório (a janela fica "embutida" nele)
  s += `<rect x="${JX - 28}" y="${JY - 22}" width="${JW + 56}" height="${JH + 62}" rx="12" fill="${COR.lblue}" opacity=".35"/>`
    + `<path d="M${JX - 28},${JY + JH + 40} L${JX + JW + 28},${JY + JH + 40}" stroke="${COR.blue3}" stroke-width="3" opacity=".6"/>`;
  // moldura da janela (cantos retos, como esquadria)
  s += `<rect x="${JX - 10 + 5}" y="${JY - 10 + 6}" width="${JW + 20}" height="${JH + 20}" rx="6" fill="rgba(22,35,59,.12)"/>`
    + `<rect x="${JX - 10}" y="${JY - 10}" width="${JW + 20}" height="${JH + 20}" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
  let d = `<rect x="${JX}" y="${JY}" width="${JW}" height="${JH}" fill="#dceaf6"/>`
    + `<rect x="${JX}" y="${JY + JH - 52}" width="${JW}" height="52" fill="#c9dbec"/>`
    + `<rect x="${JX}" y="${JY + JH - 56}" width="${JW}" height="5" fill="${COR.blue3}"/>`;
  // persiana no alto
  for (let i = 0; i < 4; i++) d += `<rect x="${JX}" y="${JY + 4 + i * 11}" width="${JW}" height="7" fill="#fff" opacity=".75"/>`;
  d += `<path d="M${JX + 40},${JY} L${JX + 40},${JY + 48} M${JX + JW - 40},${JY} L${JX + JW - 40},${JY + 48}" stroke="${COR.lblue}" stroke-width="2"/>`;
  // quadro na parede do fundo (mini dashboard)
  d += `<rect x="${JX + 150}" y="${JY + 62}" width="104" height="58" rx="6" fill="#fff" stroke="${COR.blue3}" stroke-width="2.5"/>`;
  for (let i = 0; i < 4; i++) {
    const hh = 10 + 30 * Math.abs(Math.sin(i * 1.3 + t * 0.9));
    d += `<rect x="${JX + 166 + i * 20}" y="${f(JY + 112 - hh)}" width="11" height="${f(hh)}" rx="2" fill="${i === 3 ? COR.orange : COR.blue2}" opacity=".8"/>`;
  }
  // diretores (pequenos, ao longe)
  const vivas = t >= cli - 0.02;
  // braços para cima em "cliente!": transição rápida, sem passar parado pela horizontal (T-pose)
  const sobe = (alvo, w) => kf(t, [[cli - 0.02, 8], [cli + 0.07, alvo + 18], [cli + 0.22, alvo]]) + w;
  const gz = t < A.tudo ? [0.5, 0.9] : [1, 0.1];
  const D = [['dir1', JX + 86], ['dir2', JX + 202], ['dir3', JX + 318]];
  D.forEach(([id, x], i) => {
    const st = { x, y: JY + JH + 32, s: 0.62, t: t + i * 0.9, gaze: gz, expr: 'smile' };
    if (vivas) st.hop = 9 * Math.sin(clamp((t - cli + 0.02 - i * 0.05) / 0.4) * Math.PI);
    if (id === 'dir1') {
      const up = t >= joia - 0.05 && t < A.tudo - 0.1;
      st.armR = up ? kf(t, [[joia - 0.05, 8], [joia + 0.05, 146], [joia + 0.2, 124]]) + Math.sin(t * 9) * 5 : vivas ? sobe(126, Math.sin(t * 12) * 8) : 8;
      if (vivas) st.armL = sobe(122, -Math.sin(t * 12) * 8);
      if (up || vivas) st.expr = 'joy';
    }
    if (id === 'dir2') {
      if (t > joia + 0.5 && t < joia + 1.3) { st.talk = true; st.gaze = [-1, 0]; }
      if (vivas) { st.armL = sobe(126, Math.sin(t * 13) * 8); st.armR = sobe(126, -Math.sin(t * 13) * 8); st.expr = 'joy'; }
    }
    if (id === 'dir3') {
      const n1 = t - wa(57), n2b = t - (A.tudo + 0.9);
      const nod = (n1 > 0 && n1 < 0.9 ? Math.sin(n1 * 14) * 6 * (1 - n1 / 0.9) : 0) + (n2b > 0 && n2b < 0.9 ? Math.sin(n2b * 14) * 6 * (1 - n2b / 0.9) : 0);
      if (nod) st.tilt = nod;
      st.expr = t > wa(57) ? 'proud' : 'smile';
      if (vivas) { st.armL = sobe(128, Math.sin(t * 11) * 8); st.armR = sobe(122, -Math.sin(t * 11) * 8); st.expr = 'joy'; }
    }
    d += pessoa(id, st);
  });
  // reflexos do vidro + leve tom azulado
  d += `<rect x="${JX}" y="${JY}" width="${JW}" height="${JH}" fill="${COR.blue3}" opacity=".12"/>`
    + `<path d="M${JX + 14},${JY + 96} L${JX + 96},${JY + 6} M${JX + 40},${JY + 108} L${JX + 132},${JY + 6}" stroke="#fff" stroke-width="9" opacity=".45" stroke-linecap="round"/>`;
  // montantes da janela entre os diretores
  for (const mx of [JX + 144, JX + 260]) d += `<rect x="${mx - 5}" y="${JY - 4}" width="10" height="${JH + 8}" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
  s += `<g clip-path="url(#en_jc)">${d}</g>`;
  // brilho que atravessa o vidro de tempos em tempos (só na faixa da persiana, acima das cabeças)
  s += varredura('en_vj', JX, JY, JW, 60, ((t - t0) / 2.6) % 1, 6);
  // peitoril: ressalto fino de ardósia
  s += `<rect x="${JX - 18}" y="${JY + JH + 8}" width="${JW + 36}" height="9" rx="3" fill="${COR.slate}" stroke="${INK}" stroke-width="3"/>`;

  // balão: olho -> joinha -> check
  const kb = back(t, t0 + 0.24, 0.4);
  if (kb > 0.001) {
    const bx = 570, by = 270 + Math.sin(t * 2.2) * 4;
    let b = cartao(-46, -40, 92, 80, { r: 26 })
      + `<path d="M-44,8 L-66,30 L-40,22" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><rect x="-46" y="4" width="8" height="18" fill="#fff"/>`;
    if (t < joia - 0.05) b += popG(1, 0, 0, icone('eye', 0, 0, 1.15));
    else if (t < cli - 0.02) b += popG(back(t, joia - 0.05, 0.35), 0, 0, joinha(1.15));
    else b += popG(back(t, cli - 0.02, 0.35), 0, 0, icone('check', 0, 0, 1.05));
    s += popG(kb, bx, by, b);
    s += faiscas(bx, by, t - (joia - 0.05), COR.orange, 8, 52, 84) + faiscas(bx, by, t - (cli - 0.02), COR.green, 8, 52, 84);
  }
  return s;
}

// ---------------- mesa, Victor e notebook ----------------
function estacao(t, ctx, A) {
  const P = ctx.produtos, cli = A.cli;
  let kick = 0, olhar = 0, alegria = false;
  for (const p of P) {
    const a = t - p.t;
    kick += pulso(a, 0.32);
    olhar = Math.max(olhar, a > 0 && a < 0.7 ? Math.sin(a / 0.7 * Math.PI) : 0);
    if (a > 0 && a < 0.4) alegria = true;
  }
  kick = Math.min(1.2, kick);
  let s = '';
  // cadeira (encosto atrás do Victor)
  s += `<rect x="${VX - 82}" y="636" width="164" height="140" rx="30" fill="${COR.orange2}" ${ST(4)}/>`
    + `<rect x="${VX - 62}" y="652" width="124" height="18" rx="9" fill="#fff" opacity=".35"/>`;
  // mesa
  s += `<rect x="96" y="${MESA}" width="608" height="20" rx="6" fill="#c99a5b" ${ST(4)}/>`
    + `<rect x="114" y="${MESA + 20}" width="572" height="${CHAO - MESA - 20}" fill="#e3c08a" ${ST(4)}/>`
    + `<path d="M132,${MESA + 46} L668,${MESA + 46}" stroke="#c99a5b" stroke-width="4"/>`
    + `<rect x="380" y="${MESA + 56}" width="40" height="8" rx="4" fill="#c99a5b" stroke="${INK}" stroke-width="2.5"/>`
    + `<rect x="114" y="${MESA + 20}" width="572" height="8" fill="${COR.orange}" opacity=".85"/>`;
  // caneca com vapor
  s += `<path d="M150,${MESA - 26} q-16,0 -16,13 q0,13 16,13" fill="none" stroke="${INK}" stroke-width="4"/>`
    + `<rect x="148" y="${MESA - 40}" width="38" height="40" rx="7" fill="#fff" ${ST(3.5)}/>`
    + `<rect x="148" y="${MESA - 28}" width="38" height="9" fill="${COR.orange}"/>`
    + `<rect x="148" y="${MESA - 40}" width="38" height="40" rx="7" fill="none" ${ST(3.5)}/>`;
  for (let i = 0; i < 2; i++) {
    const ph = ((t * 0.7 + i * 0.5) % 1);
    const y0 = MESA - 48 - ph * 46;
    s += `<path d="M${158 + i * 16},${f(y0)} q-7,-10 0,-20 q7,-10 0,-20" fill="none" stroke="${COR.lblue}" stroke-width="4" stroke-linecap="round" opacity="${f(Math.sin(ph * Math.PI) * 0.9)}"/>`;
  }
  // brilho da tela
  s += `<ellipse cx="${f(EX)}" cy="${f(EY - 10)}" rx="${f(190 + 60 * kick)}" ry="${f(150 + 40 * kick)}" fill="url(#en_gl)" opacity="${f(0.35 + 0.1 * Math.sin(t * 5) + 0.45 * Math.min(1, kick))}"/>`;
  // notebook (recuo a cada disparo)
  const sq = Math.min(1, kick);
  let nb = `<ellipse cx="515" cy="${MESA}" rx="140" ry="8" fill="rgba(22,35,59,.18)"/>`;
  const TL = tela(0, 0), TR = tela(200, 0), BR = tela(200, 150), BL = tela(0, 150);
  // espessura da tampa
  nb += quad([[TR[0], TR[1]], [TR[0] + 9, TR[1] + 4], [BR[0] + 7, BR[1]], [BR[0], BR[1]]], `fill="#8fa3ba" ${ST(3.5)}`);
  nb += quad([[TL[0] - 9, TL[1] - 9], [TR[0] + 9, TR[1] - 9], [BR[0] + 9, BR[1] + 2], [BL[0] - 9, BL[1] + 2]], `fill="#1b2a40" ${ST(4)}`);
  nb += `<g transform="matrix(${TM.map(f).join(' ')})"><g clip-path="url(#en_tc)">${conteudoTela(t, ctx, A)}</g></g>`;
  // teclado (base em perspectiva)
  const fl = [BL[0] - 30, MESA - 4], fr = [BR[0] - 22, MESA - 4];
  nb += quad([fl, fr, [BR[0] + 9, BR[1] + 2], [BL[0] - 9, BL[1] + 2]], `fill="#d5dee9" ${ST(3.5)}`);
  nb += `<rect x="${f(fl[0])}" y="${MESA - 5}" width="${f(fr[0] - fl[0])}" height="8" rx="3" fill="#9fb0c4" ${ST(3)}/>`;
  for (let r = 0; r < 3; r++) {
    const yy = BL[1] + 6 + r * 4.6, xa = lerp(BL[0] - 4, fl[0] + 8, (r + 1) / 4) + 6, xb = lerp(BR[0] + 4, fr[0] - 8, (r + 1) / 4) - 6;
    nb += `<path d="M${f(xa)},${f(yy)} L${f(xb)},${f(yy)}" stroke="#8fa3ba" stroke-width="3" stroke-dasharray="9 4"/>`;
  }
  s += `<g transform="translate(515 ${MESA}) scale(${f(1 + 0.035 * sq)} ${f(1 - 0.05 * sq)}) translate(-515 ${-MESA})">${nb}</g>`;

  // Victor (recortado no tampo da mesa)
  const viva = t >= cli - 0.02;
  // braços: da digitação direto para o alto (passa rápido pela posição baixa, sem T-pose sobre a caneca)
  const wob = viva ? Math.sin((t - cli) * 12) * 9 * clamp((t - cli) / 0.2) : 0;
  const st = {
    x: VX, y: CHAO, s: VS, t,
    armR: viva ? kf(t, [[cli - 0.02, 62], [cli + 0.06, 152], [cli + 0.2, 128]]) - wob : 62 + Math.sin(t * 26 + 1.7) * 6,
    armL: viva ? kf(t, [[cli - 0.02, -62], [cli + 0.06, 152], [cli + 0.2, 128]]) + wob : -62 + Math.sin(t * 26) * 6,
    expr: t < P[0].t - 0.08 ? 'focus' : viva ? (t > cli + 0.9 ? 'proud' : 'joy') : alegria ? 'joy' : 'smile',
    gaze: viva ? [0.6, -0.3] : [lerp(1, 0.9, olhar), lerp(0.55, -0.8, olhar)],
    tilt: viva ? 2 + Math.sin(t * 3) * 2 : 4 + Math.sin(t * 9) * 1.4 - olhar * 3,
    hop: (6 * Math.min(1, kick) + (viva ? 22 * Math.sin(Math.min(1, (t - cli) / 0.45) * Math.PI) : 0)) / VS,
  };
  s += `<g clip-path="url(#en_vc)">${pessoa('victor', st)}</g>`;
  return s;
}

// conteúdo da tela (coordenadas locais 200 × 150)
function conteudoTela(t, ctx, A) {
  const P = ctx.produtos;
  let s = `<rect x="0" y="0" width="200" height="150" fill="url(#en_sg)"/>`
    + `<rect x="0" y="0" width="200" height="16" fill="#0a2238"/>`
    + `<circle cx="9" cy="8" r="3" fill="#ff6b5e"/><circle cx="19" cy="8" r="3" fill="#ffc24b"/><circle cx="29" cy="8" r="3" fill="#3fc77a"/>`
    + txt('DTS', 190, 12.5, { anchor: 'end', size: 10, weight: 900, fill: COR.orange, ls: 1 });
  // linhas de código digitando (em loop)
  for (let i = 0; i < 7; i++) {
    const ww = (0.3 + 0.55 * ((i * 37) % 10) / 10) * 150;
    const vis = clamp(((t * 2.4 + i * 0.31) % 3.2) - i * 0.25);
    s += `<rect x="${10 + (i % 3) * 10}" y="${24 + i * 15}" width="${f(ww * vis)}" height="6" rx="3" fill="${i % 4 === 0 ? COR.orange : i % 4 === 2 ? COR.blue2 : '#3f5f82'}" opacity=".75"/>`;
  }
  // próximo produto se formando no centro da tela
  let prox = null;
  for (const p of P) if (t >= p.t - 0.34 && t < p.t + 0.02) { prox = p; break; }
  if (prox) {
    const u = inv(prox.t - 0.34, prox.t, t);
    const k = ease.out(u);
    s += `<circle cx="100" cy="80" r="${f(44 * k)}" fill="#0a2238" opacity=".85"/>`
      + `<circle cx="100" cy="80" r="${f(40 * k)}" fill="none" stroke="${COR.orange}" stroke-width="3" stroke-dasharray="${f(251 * u)} 300" transform="rotate(-90 100 80)"/>`
      + `<g opacity="${f(clamp(u * 1.6))}">${icone(prox.icone, 100, 80, 0.4 + 0.75 * k, COR.orange, '#ffffff')}</g>`;
  }
  // flash + portal no disparo
  for (const p of P) {
    const a = t - p.t;
    if (a >= 0 && a < 0.4) {
      s += `<circle cx="100" cy="80" r="${f(16 + 120 * ease.out(a / 0.4))}" fill="none" stroke="${COR.orange2}" stroke-width="${f(10 * (1 - a / 0.4))}" opacity="${f(1 - a / 0.4)}"/>`;
      s += `<rect width="200" height="150" fill="#fff" opacity="${f(0.85 * pulso(a, 0.2))}"/>`;
    }
  }
  // barra de progresso
  const prog = (() => {
    let last = ctx.t0, next = P[0].t;
    for (let i = 0; i < P.length; i++) if (t >= P[i].t) { last = P[i].t; next = i + 1 < P.length ? P[i + 1].t : last + 1; }
    return clamp((t - last) / Math.max(0.2, next - last));
  })();
  s += `<rect x="12" y="136" width="176" height="6" rx="3" fill="#24456b"/><rect x="12" y="136" width="${f(176 * prog)}" height="6" rx="3" fill="${COR.orange}"/>`;
  return s;
}

// ---------------- quadro de entregas ----------------
function quadro(t, ctx, A, nPronto, ultPouso) {
  const P = ctx.produtos;
  let s = cartao(PX0, PY0, PW, PH, { r: 26, fill: '#eaf1f8' });
  s += `<rect x="${PX0 + 2}" y="${PY0 + 2}" width="${PW - 4}" height="62" rx="24" fill="#fff" opacity=".7"/>`
    + `<path d="M${PX0 + 18},${PY0 + 64} L${PX0 + PW - 18},${PY0 + 64}" stroke="#cfdbe8" stroke-width="2.5"/>`
    + `<circle cx="${PX0 + 42}" cy="${PY0 + 33}" r="21" fill="#fff4e6" stroke="${INK}" stroke-width="2.5"/>` + icone('box', PX0 + 42, PY0 + 34, 0.62)
    + txt('ENTREGAS', PX0 + 76, PY0 + 41, { anchor: 'start', size: 22, weight: 700, family: 'DM Sans', fill: COR.navy, ls: 6 })
    + txt('DTS · A&M', PX0 + 76 + largura('ENTREGAS', 22, 700, 'DM Sans') + 8 * 6 + 14, PY0 + 40, { anchor: 'start', size: 15, weight: 700, family: 'DM Sans', fill: COR.grey, ls: 3 });
  // contador
  const kc = 1 + 0.16 * pulso(t - ultPouso, 0.3);
  const verde = t >= A.cli;
  const cx = PX0 + PW - 84, cy = PY0 + 33;
  s += `<g transform="translate(${cx} ${cy}) scale(${f(kc)})">${pilula(-58, -22, 116, 44, verde ? COR.green : COR.navy, INK, 3)}`
    + txt(String(nPronto).padStart(2, '0'), verde ? -12 : 0, 11, { size: 30, weight: 900, fill: verde ? '#fff' : COR.orange2 })
    + (verde ? `<path d="M18,0 L25,7 L38,-8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : '')
    + `</g>`;
  // lugares + cartões assentados
  for (let i = 0; i < 8; i++) {
    const [x, y] = slotXY(i);
    const p = P[i];
    const pousa = p.t + FL;
    const sai = A.sai[i];
    if (t < pousa) { s += popG(back(t, ctx.t0 + 0.22 + i * 0.04, 0.36), x, y, slotVazio(0, 0, t)); continue; }
    if (t >= sai.td) { s += slotEntregue(p, x, y, t, sai.td + 0.12); continue; }
    s += slotVazio(x, y, t);
    // assentado: squash de pouso + flutuação leve + brilho
    const a = t - pousa;
    const kq = Math.exp(-a * 11) * Math.cos(a * 32);
    const sx = 1 + 0.15 * kq, sy = 1 - 0.15 * kq;
    const yy = y + Math.sin(t * 2.3 + i * 1.1) * 2.5;
    s += `<g transform="translate(${x} ${f(yy + 80)}) scale(${f(sx)} ${f(sy)}) translate(0 -80)">${cartaoProduto(p, i)}</g>`;
    s += varredura(`en_c${i}`, x - 80, yy - 80, CW, CW, inv(pousa + 0.05, pousa + 0.5, t), 18);
    s += `<rect x="${x - 80}" y="${f(yy - 80)}" width="${CW}" height="${CW}" rx="18" fill="#fff" opacity="${f(0.7 * pulso(a, 0.18))}"/>`;
  }
  return s;
}

// ---------------- esteira ----------------
function esteira(t, A) {
  const ativo = clamp(inv(A.tudo - 0.15, A.tudo + 0.2, t));
  const off = 30 * t + (A.v - 30) * Math.max(0, t - A.tudo);
  let s = '';
  for (const x of [800, 1030, 1260, 1490]) s += `<rect x="${x - 8}" y="${BTOP + 30}" width="16" height="${CHAO - BTOP - 30}" fill="${COR.slate}" stroke="${INK}" stroke-width="3"/><rect x="${x - 18}" y="${CHAO - 8}" width="36" height="8" rx="3" fill="${COR.slate}" stroke="${INK}" stroke-width="3"/>`;
  s += `<rect x="${BX0}" y="${BTOP + 4}" width="${BX1 - BX0}" height="32" rx="16" fill="${COR.slate}" stroke="${INK}" stroke-width="3.5"/>`;
  // roletes girando
  let rol = '';
  for (let x = BX0 + 26; x < BX1 - 10; x += 52) {
    const a = (off / 9) % (Math.PI * 2);
    rol += `<circle cx="${x}" cy="${BTOP + 20}" r="9" fill="#8fa3ba" stroke="${INK}" stroke-width="2.5"/><path d="M${f(x - Math.cos(a) * 7)},${f(BTOP + 20 - Math.sin(a) * 7)} L${f(x + Math.cos(a) * 7)},${f(BTOP + 20 + Math.sin(a) * 7)}" stroke="${INK}" stroke-width="2.5"/>`;
  }
  s += rol;
  // lona
  s += `<rect x="${BX0 - 4}" y="${BTOP - 6}" width="${BX1 - BX0 + 8}" height="14" rx="7" fill="#22324a" stroke="${INK}" stroke-width="3"/>`;
  let chev = '';
  for (let x = BX0 + 10 + (off % 44); x < BX1 - 6; x += 44) chev += `M${f(x)},${BTOP - 3} l6,4 l-6,4 `;
  s += `<path d="${chev}" stroke="${ativo > 0.5 ? COR.orange2 : '#5f7896'}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${f(0.6 + 0.4 * ativo)}"/>`;
  // LEDs na lateral
  for (let i = 0; i < 9; i++) {
    const x = BX0 + 60 + i * 96;
    const on = ativo > 0 ? (Math.floor(t * 10) - i) % 3 === 0 : (i % 3 === Math.floor(t * 2) % 3);
    s += `<circle cx="${x}" cy="${BTOP + 30}" r="3.6" fill="${ativo > 0 ? (on ? '#7fe0a8' : COR.green) : (on ? COR.orange2 : '#8fa3ba')}"/>`;
  }
  return s;
}

// ---------------- prédio do cliente ----------------
function interiorDoca() {
  return `<rect x="${PR0}" y="${DOCAT}" width="${PR1 - PR0}" height="${CHAO - DOCAT}" fill="url(#en_in)"/>`
    + `<rect x="${PR0}" y="${DOCAT}" width="${DOCA1 - PR0}" height="14" fill="#000" opacity=".25"/>`;
}

function predio(t, ctx, A) {
  const cli = A.cli;
  let s = '';
  // sombra
  s += `<rect x="${PR0 + 8}" y="${PRT + 10}" width="${PR1 - PR0}" height="${CHAO - PRT - 10}" rx="10" fill="rgba(22,35,59,.12)"/>`;
  // fachada (com a doca recortada no canto inferior esquerdo)
  s += `<path d="M${PR0},${PRT} L${PR1},${PRT} L${PR1},${CHAO} L${DOCA1},${CHAO} L${DOCA1},${DOCAT} L${PR0},${DOCAT}Z" fill="#fff" ${ST(4)}/>`;
  s += `<rect x="${PR0 + 4}" y="${PRT + 2}" width="16" height="${DOCAT - PRT - 4}" fill="${COR.lblue}" opacity=".55"/><rect x="${PR1 - 20}" y="${PRT + 2}" width="16" height="${CHAO - PRT - 4}" fill="${COR.lblue}" opacity=".55"/>`;
  // cobertura
  s += `<rect x="${PR0 - 12}" y="${PRT - 24}" width="${PR1 - PR0 + 24}" height="28" rx="8" fill="${COR.navy}" ${ST(3.5)}/>`;
  // luzes de sinalização na cobertura
  for (const [i, x] of [[0, PR0 + 4], [1, PR1 - 4]]) s += `<circle cx="${x}" cy="${PRT - 10}" r="6" fill="${(Math.floor(t * 2.5) + i) % 2 ? COR.orange : '#ffd9a8'}" stroke="${INK}" stroke-width="2.5"/>`;
  // placa CLIENTE
  const dir = ctx.wa(66);                                   // "direto"
  const kp = 1 + 0.12 * pulso(t - cli, 0.4) + 0.14 * pulso(t - dir, 0.35);
  const tw = largura('CLIENTE', 30, 900) + 6 * 4;
  const pw = tw + 92, ph = 56, px = PCX, py = PRT - 62;
  let pl = `<path d="M-58,${ph / 2} L-58,${ph / 2 + 14} M58,${ph / 2} L58,${ph / 2 + 14}" stroke="${INK}" stroke-width="5"/>`
    + pilula(-pw / 2, -ph / 2, pw, ph, COR.orange, INK, 4)
    + `<circle cx="${f(-pw / 2 + 30)}" cy="0" r="19" fill="#fff" stroke="${INK}" stroke-width="2.5"/>` + icone('people', -pw / 2 + 30, 1, 0.6, COR.orange)
    + txt('CLIENTE', -pw / 2 + 60, 11, { anchor: 'start', size: 30, weight: 900, fill: '#fff', ls: 4 });
  const ke = back(t, ctx.t0 + 0.14, 0.45);
  s += `<g transform="translate(${f(px)} ${f(py)}) rotate(${f((1 - clamp(ke)) * -10)}) scale(${f(kp * Math.max(0.001, ke))})">${pl}</g>`;
  s += varredura('en_vd', px - pw / 2, py - ph / 2, pw, ph, inv(dir, dir + 0.5, t), ph / 2);
  s += varredura('en_vp', px - pw / 2, py - ph / 2, pw, ph, inv(cli + 0.15, cli + 0.75, t), ph / 2);
  // janelas (10 = 10 entregas)
  JAN.forEach(([x, y], i) => {
    const a = A.chegadas[i];
    const lit = t >= a;
    const k = lit ? back(t, a, 0.3) : 0;
    s += `<rect x="${x - 42}" y="${y - 14}" width="84" height="28" rx="6" fill="#cfe2f3" stroke="${INK}" stroke-width="3"/>`;
    if (lit) {
      const tw2 = 0.85 + 0.15 * Math.sin(t * 4 + i);
      s += popG(k, x, y, `<rect x="-42" y="-14" width="84" height="28" rx="6" fill="${COR.orange2}" stroke="${INK}" stroke-width="3" opacity="${f(tw2)}"/><path d="M-9,0 L-3,6 L9,-6" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)
        + `<rect x="${x - 42}" y="${y - 14}" width="84" height="28" rx="6" fill="#fff" opacity="${f(0.8 * pulso(t - a, 0.25))}"/>`;
    } else s += `<path d="M${x - 32},${y + 7} l12,-14 M${x - 20},${y + 9} l12,-14" stroke="#fff" stroke-width="3" opacity=".7"/>`;
  });
  // porta de vidro
  s += `<rect x="1772" y="700" width="80" height="${CHAO - 700}" rx="4" fill="#cfe2f3" ${ST(3.5)}/><path d="M1812,700 L1812,${CHAO}" stroke="${INK}" stroke-width="3"/><path d="M1782,${CHAO - 30} l18,-24 M1822,${CHAO - 30} l18,-24" stroke="#fff" stroke-width="4" opacity=".75"/>`
    + `<rect x="1764" y="686" width="96" height="16" rx="5" fill="${COR.navy}" ${ST(3)}/>`;
  // verga laranja da doca
  s += `<rect x="${PR0 - 8}" y="${DOCAT - 16}" width="${DOCA1 - PR0 + 16}" height="20" rx="6" fill="${COR.orange}" ${ST(3.5)}/>`;
  for (let i = 0; i < 6; i++) s += `<path d="M${PR0 + 2 + i * 22},${DOCAT - 2} l12,-12" stroke="${COR.navy}" stroke-width="5" opacity=".55"/>`;
  return s;
}

// cortina de tiras da doca (balança quando um cartão passa)
function cortina(t, xs) {
  let s = '';
  let empurra = 0;
  for (const x of xs) empurra = Math.max(empurra, clamp(1 - Math.abs(x - 1712) / 70));
  for (let i = 0; i < 4; i++) {
    const x = 1700 + i * 10;
    const sw = empurra * (26 - i * 4) + Math.sin(t * 3 + i) * 1.5;
    s += `<path d="M${x},${DOCAT + 4} Q${f(x + sw * 0.4)},${DOCAT + 60} ${f(x + sw)},${BTOP - 8}" stroke="${COR.lblue}" stroke-width="9" stroke-linecap="round" opacity=".55" fill="none"/>`;
  }
  return s;
}

// ---------------- cartões em movimento ----------------
function emMovimento(t, ctx, A) {
  const P = ctx.produtos;
  let rodando = '', caindo = '', voando = '', fx = '';
  const xsDoca = [];
  const E = [EX, EY];
  // voo tela -> alvo (quadro ou esteira)
  const voo = (p, i, alvo, dur, escFinal) => {
    const c = escFinal < 1 ? [lerp(E[0], alvo[0], 0.8), Math.min(E[1], alvo[1]) - 330] : [lerp(E[0], alvo[0], 0.62) - 40, Math.min(E[1], alvo[1]) - 210];
    const dir = i % 2 ? 1 : -1;
    const pos = tt => {
      const u = clamp((tt - p.t) / dur);
      const ue = ease.out(u);
      const [x, y] = bez(E, c, alvo, ue);
      return { x, y, s: lerp(0.16, escFinal, ue) + 0.14 * escFinal * Math.sin(ue * Math.PI), r: (1 - ue) * dir * 330, u };
    };
    const q = pos(t);
    // rastro: faixa luminosa + fantasmas
    let tr = '';
    const pts = [];
    for (let k = 0; k <= 6; k++) { const tt = t - k * 0.03; if (tt < p.t) break; const o = pos(tt); pts.push([o.x, o.y]); }
    for (let k = 1; k < pts.length; k++) {
      tr += `<path d="M${f(pts[k - 1][0])},${f(pts[k - 1][1])} L${f(pts[k][0])},${f(pts[k][1])}" stroke="${COR.orange2}" stroke-width="${f(46 * q.s * (1 - k / 7))}" stroke-linecap="round" opacity="${f(0.45 * (1 - k / 7))}"/>`;
    }
    for (let k = 3; k >= 1; k--) {
      const tt = t - k * 0.035;
      if (tt < p.t) continue;
      const o = pos(tt);
      tr += `<g transform="translate(${f(o.x)} ${f(o.y)}) rotate(${f(o.r)}) scale(${f(o.s)})" opacity="${f(0.16 * (4 - k) / 3)}"><rect x="-80" y="-80" width="160" height="160" rx="18" fill="#fff" stroke="${COR.orange}" stroke-width="4"/></g>`;
    }
    return tr + `<g transform="translate(${f(q.x)} ${f(q.y)}) rotate(${f(q.r)}) scale(${f(q.s)})">${cartaoProduto(p, i)}</g>`;
  };
  // squash ao pousar na esteira
  const naEsteira = (p, i, x, a) => {
    const kq = Math.exp(-a * 11) * Math.cos(a * 32);
    const sx = ESC * (1 + 0.16 * kq), sy = ESC * (1 - 0.16 * kq);
    return `<g transform="translate(${f(x)} ${BTOP}) scale(${f(sx)} ${f(sy)}) translate(0 -80)">${cartaoProduto(p, i)}</g>`;
  };

  P.forEach((p, i) => {
    // fx do disparo na tela
    const a0 = t - p.t;
    if (a0 >= 0 && a0 < 0.6) {
      fx += onda(EX, EY, a0, { r0: 30, r1: 210, w: 12, d: 0.45, cor: COR.orange2 })
        + particulas(300 + i * 7, EX, EY, a0, { n: 14, v: 380, d: 0.55, sz: 9, g: 260 })
        + faiscas(EX, EY, a0, COR.orange, 10, 70, 120);
    }
    if (i < 8) {
      // voo até o quadro
      const alvo = slotXY(i);
      if (t >= p.t && t < p.t + FL) voando += voo(p, i, alvo, FL, 1);
      const ap = t - (p.t + FL);
      if (ap >= 0 && ap < 0.6) fx += faiscas(alvo[0], alvo[1], ap, COR.orange, 10, 92, 130) + onda(alvo[0], alvo[1], ap, { r0: 70, r1: 150, w: 8, d: 0.4, cor: COR.orange, duplo: false });
      // saída do quadro -> esteira -> doca
      const S = A.sai[i];
      if (t >= S.td && t < S.tl) {
        const u = (t - S.td) / DROP;
        const lift = Math.sin(clamp(u / 0.3) * Math.PI / 2) * 16 * (1 - clamp((u - 0.3) / 0.7));
        const y = lerp(alvo[1], BCY, ease.in(clamp((u - 0.15) / 0.85))) - lift;
        const sc = lerp(1.04, ESC, ease.inOut(u));
        const rot = Math.sin(u * Math.PI) * (i % 2 ? 7 : -7);
        const vel = clamp((u - 0.4) / 0.6);
        if (vel > 0) caindo += `<rect x="${f(S.bx - 70 * sc)}" y="${f(y - 80 * sc - 90 * vel)}" width="${f(140 * sc)}" height="${f(90 * vel + 40)}" rx="20" fill="${COR.orange2}" opacity="${f(0.22 * vel)}"/>`;
        caindo += `<g transform="translate(${f(S.bx)} ${f(y)}) rotate(${f(rot)}) scale(${f(sc)})">${cartaoProduto(p, i)}</g>`;
        if (u < 0.35) fx += faiscas(alvo[0], alvo[1], t - S.td, COR.green, 8, 86, 120);
      } else if (t >= S.tl) {
        const x = S.bx + A.v * (t - S.tl);
        if (x < DOCA1 + 70) { rodando += naEsteira(p, i, x, t - S.tl); xsDoca.push(x); }
      }
    } else {
      // produtos 8 e 9: direto do computador para a esteira
      const tl = p.t + FLB;
      if (t >= p.t && t < tl) voando += voo(p, i, [POUSO, BCY], FLB, ESC);
      if (t >= tl) {
        const x = POUSO + A.v * (t - tl);
        if (x < DOCA1 + 70) { rodando += naEsteira(p, i, x, t - tl); xsDoca.push(x); }
        const ap = t - tl;
        if (ap < 0.5) fx += faiscas(POUSO, BTOP - 4, ap, COR.orange, 8, 50, 90);
      }
    }
  });
  return { rodando, caindo, voando, fx, xsDoca };
}

// "+1" e checks a cada chegada; selo grande no fim
function chegadasFX(t, ctx, A) {
  let s = '';
  // "direto": onda na doca do cliente
  s += onda(1690, DOCAT + 60, t - ctx.wa(66), { r0: 30, r1: 140, w: 10, d: 0.45, cor: COR.orange2 });
  // "+1": no máximo os 2 mais recentes; o mais antigo some rápido quando chega o terceiro
  const nArr = A.chegadas.filter(a => t >= a).length;
  A.chegadas.forEach((a, k) => {
    const age = t - a;
    if (age < 0 || age > 0.6 || k < nArr - 3) return;
    const u = age / 0.6;
    const x = 1557 + (k % 2 ? 10 : -10), y = DOCAT - 6 - 90 * u;
    let o = 1 - clamp((u - 0.6) / 0.4);
    if (k + 2 < A.chegadas.length) o *= 1 - clamp((t - A.chegadas[k + 2]) / 0.08);
    if (o > 0.01) s += `<g opacity="${f(o)}">` + popG(0.85 * back(t, a, 0.25), x, y, `<circle cx="-30" cy="-10" r="17" fill="${COR.green}" stroke="${INK}" stroke-width="3"/><path d="M-37,-10 L-32,-5 L-23,-15" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      + txt('+1', -6, 2, { anchor: 'start', size: 34, weight: 900, fill: COR.green, extra: `stroke="#fff" stroke-width="7" paint-order="stroke" stroke-linejoin="round"` })) + `</g>`;
  });
  A.chegadas.forEach((a, k) => {
    s += particulas(900 + k * 13, 1690, DOCAT + 50, t - a, { n: 10, v: 220, d: 0.5, sz: 8, g: 120, cores: [COR.green, '#7fe0a8', COR.orange2, '#fff'] });
  });
  // selo final
  const cli = A.cli, ag = t - cli;
  if (ag >= -0.08) {
    const k = back(t, cli - 0.08, 0.38);
    const bx = SELO[0], by = SELO[1] + Math.sin(t * 2.4) * 4;
    s += `<circle cx="${bx}" cy="${f(by)}" r="${f(92 + 8 * Math.sin(t * 5))}" fill="url(#en_gv)" opacity="${f(0.8 * clamp((ag + 0.08) * 4))}"/>`;
    // partículas saem de trás do selo (desenhadas antes dele)
    s += particulas(4242, bx, by + 10, ag - 0.03, { n: 30, v: 300, d: 1.0, sz: 12, g: 650, cores: [COR.green, COR.orange, COR.orange2, '#fff', COR.blue2] });
    s += popG(k, bx, by, `<g filter="url(#fxGlow)">${checkGrande(52)}</g>`);
    s += onda(bx, by, ag, { r0: 50, r1: 150, w: 14, d: 0.6, cor: COR.green });
    s += onda(PCX, 520, ag - 0.05, { r0: 60, r1: 330, w: 14, d: 0.7, cor: COR.orange2, duplo: false });
    // anel pulsante depois
    if (ag > 0.6) { const u = ((ag - 0.6) % 1.1) / 1.1; s += `<circle cx="${bx}" cy="${f(by)}" r="${f(60 + 50 * u)}" fill="none" stroke="${COR.green}" stroke-width="${f(5 * (1 - u))}" opacity="${f(0.8 * (1 - u))}"/>`; }
    // estrelinhas
    const r = rng(77);
    for (let i = 0; i < 7; i++) {
      const ang = r() * Math.PI * 2, rr = 90 + r() * 90, ph = r() * 6;
      const kk = back(t, cli + 0.1 + i * 0.06, 0.4) * (0.6 + 0.4 * Math.sin(t * 6 + ph));
      s += popG(kk, bx + Math.cos(ang) * rr * 1.25, by + 70 + Math.abs(Math.sin(ang)) * rr * 0.9, `<path d="M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z" fill="${i % 2 ? COR.orange2 : '#fff'}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`);
    }
  }
  return s;
}

// ---------------- câmera ----------------
function camera(t, ctx, A) {
  const u = inv(ctx.t0, ctx.t1, t);
  const z = lerp(1, 1.045, ease.sine(u));
  const px = -26 * ease.inOut(inv(A.tudo - 0.2, A.tudo + 1.6, t));
  let sx = 0, sy = 0;
  for (const p of ctx.produtos) { const [a, b] = tremor(t, p.t, 0.18, 3.5); sx += a; sy += b; }
  const [a, b] = tremor(t, A.cli, 0.45, 11); sx += a; sy += b;
  const [a2, b2] = tremor(t, A.cli + 0.3, 0.3, 6); sx += a2; sy += b2;
  return { z, px, sx, sy };
}
const CAMX = 980, CAMY = 560;
function camada(c, par, body) {
  const z = 1 + (c.z - 1) * par;
  return `<g transform="translate(${f(CAMX + (c.px + c.sx) * par)} ${f(CAMY + c.sy * par)}) scale(${f(z)}) translate(${-CAMX} ${-CAMY})">${body}</g>`;
}

// ---------------- quadro final ----------------
export function desenhar(t, ctx) {
  const A = agenda(ctx);
  const P = ctx.produtos;
  const c = camera(t, ctx, A);
  // contador: pousos no quadro (0–7) e na esteira (8, 9)
  let n = 0, ult = -9;
  P.forEach((p, i) => { const tp = p.t + (i < 8 ? FL : FLB); if (t >= tp) { n++; ult = Math.max(ult, tp); } });

  let s = defs();
  s += fundoCreme(t, { blobs: [['#d7e4ee', 330, 330, 400, 280, 0], ['#f8e2c2', 1080, 760, 620, 260, 1.7], ['#f3dada', 1640, 420, 360, 320, 3.1]] });
  s += poeira(t, 61, 16, [640, 180, 1100, 640], COR.orange2, 0.45);

  // camada distante (paralaxe)
  s += camada(c, 0.55, salaDiretores(t, ctx, A));

  // camada principal
  const M = emMovimento(t, ctx, A);
  let m = `<rect x="-200" y="${CHAO}" width="${W + 400}" height="5" rx="2" fill="#d9ccb4"/>`;
  m += quadro(t, ctx, A, n, ult);
  // quadro cheio: HUD + varredura
  const kh = inv(A.cheio, A.cheio + 0.3, t) * (1 - inv(A.tudo + 0.1, A.tudo + 0.4, t));
  if (kh > 0) m += hudCantos(PX0 - 8, PY0 - 8, PW + 16, PH + 16, kh, COR.orange, 44, 5);
  m += varredura('en_vq', PX0, PY0, PW, PH, inv(A.cheio + 0.05, A.cheio + 0.65, t), 26);
  // "cliente!": véu sobre a grade para o carimbo ENTREGUE! ler limpo
  const tc = A.cli + 0.1, ucar = inv(tc, tc + 0.2, t);
  if (ucar > 0) m += `<rect x="${PX0 + 12}" y="${PY0 + 70}" width="${PW - 24}" height="${PH - 82}" rx="18" fill="#eaf1f8" opacity="${f(0.78 * clamp(ucar * 2))}"/>`;
  m += esteira(t, A);
  m += interiorDoca();
  m += estacao(t, ctx, A);
  m += M.rodando + M.caindo;
  m += predio(t, ctx, A);
  m += cortina(t, M.xsDoca);
  m += M.fx + M.voando;
  m += chegadasFX(t, ctx, A);
  // carimbo no quadro em "cliente!"
  if (ucar > 0) {
    const sc = ucar < 1 ? lerp(2.6, 1, ease.in(ucar)) : 1 + 0.06 * Math.exp(-(t - tc - 0.2) * 9) * Math.cos((t - tc - 0.2) * 40);
    const cx = PX0 + PW / 2, cy = PY0 + PH / 2 + 34;
    m += opa(clamp(ucar * 2.5), carimbo('ENTREGUE!', cx, cy, sc, { size: 62, rot: -6 }));
    m += particulas(5151, cx, cy, t - tc - 0.2, { n: 18, v: 420, d: 0.6, sz: 10, g: 200, cores: [COR.orange, COR.orange2, COR.navy, '#fff'] });
  }
  m += confete(t, A.cli, 23, 56, [1000, 300, 920, 580]);
  s += camada(c, 1, m);
  return s;
}
