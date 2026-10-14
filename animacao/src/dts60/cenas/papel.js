// Cena 3 · MEU PAPEL — "Meu papel? Gestão de Mudanças em Tecnologia. E fui recebido por gente que
// ensina, provoca e abre portas." (≈ 13.0 → 22.2 s)
//
// Tudo vive num "mundo" contínuo filmado por uma câmera (pan + zoom), sem corte duro:
//
// PARTE A — crachá + papel (câmera em x≈960, empurrão lento)
//   t0+0.02  o crachá DTS despenca preso ao cordão laranja (rastro com desfoque), pousa com mola e
//            balança com amortecimento; o nome "Victor Vitorino" é revelado por máscara; o selo
//            de verificado salta. Victor (à direita) acompanha a queda com o olhar.
//   wa(23)   "Meu papel?" explode em tipografia cinética laranja (com sublinhado desenhado);
//            Victor aponta para o crachá.
//   wa(25)   a pergunta encolhe até virar o rótulo "MEU PAPEL" e a manchete sobe por máscara,
//            palavra por palavra: Gestão (25) de (26) Mudanças (27) em (28) Tecnologia (29, laranja).
//   wa(29)   impacto: tremor, o crachá "imprime" o cargo (varredura de luz + onda) e ganha um tranco;
//            os três pilares da gestão de mudanças saltam: Pessoas · Processos · Tecnologia.
//   wb(29)   o cordão se solta e o crachá voa (arco + rastro) até o peito do Victor.
//
// PARTE B — boas-vindas (pan de ~1330 px com zoom-out em arco, linhas de velocidade)
//   pan      Victor dá alguns passos; um colega entra andando; outros dois acenam ("recebido").
//   wa(34)   "gente": toca-aqui com estouro de faíscas.
//   wa(36)   balão "Ensina" (lâmpada) — o colega do toca-aqui (col2, 1º da esquerda) ergue o dedo.
//   wa(37)   balão "Provoca" (raio) — a colega do meio (col1) se inclina, provocando.
//            (ordem esquerda→direita = ordem da narração: Ensina · Provoca · Abre portas)
//   wa(39)   "abre": a colega puxa a maçaneta; a porta gira nas dobradiças e a luz invade a cena.
//   wa(40)   balão "Abre portas"; raios e partículas de luz; a câmera avança em direção à porta.
import {
  COR, INK, W, H, CHAO, txt, largura, icone, lockupAM, pessoa, chipRotulo, cartao, cavalete,
  clamp, lerp, inv, ease, kf, rng, n2, back, fin, popG, onda, particulas, faiscas, tremor,
  revela, varredura, hudCantos,
} from '../base.js';

const f = n2;

export const CHIP = ['CENA 3 · MEU PAPEL', 'Gestão de Mudanças'];

// back() com guarda: devolve 0 exatamente antes do início (ease.back(0) = 2e-16 > 0)
const bk = (t, a, d = 0.42) => { const u = inv(a, a + d, t); return u <= 0 ? 0 : ease.back(u); };
// piscada com fase própria por personagem (evita todos piscarem juntos)
const pisc = (t, off) => { const p = (((t + off) % 3.4) + 3.4) % 3.4; return p < 0.14 ? 1 - Math.abs(p - 0.07) / 0.07 : 0; };

// ---------------- layout do mundo ----------------
const SV = 1.4;                       // escala do Victor
const S2 = 1.36, S1 = 1.28, S3 = 1.32; // colegas: profundidade (col1 um passo atrás)
const Y1 = CHAO - 12;                 // col1 fica levemente atrás da linha do chão
const VXA = 1600, VXB = 1700;         // Victor (parte A / parte B)
const BX = 1110, BY = 262;            // crachá: centro x e topo do corpo
const BW = 400, BH = 560;
const PIV = -60;                      // pivô do balanço (acima da tela)
const HX = 150;                       // margem esquerda da manchete
const C2A = 2330, C2B = 1952;         // colega do toca-aqui (entra andando)
const C1X = 2262, C3X = 2585;         // colegas parados
const LAMP_DX = 130, LAMP_DY = 352;   // lâmpada do "ensina" relativa aos pés do col2 (no vão entre as cabeças, acima da mão)
const DL = 2690, DR = 2940, DH = 430; // porta (vão)
const DT = CHAO - DH;
const DW = DR - DL;
const CXB = VXB + (960 - 420) / 0.92, ZB = 0.92; // câmera da parte B (Victor em x≈420 na tela)
const PLANTA = 3132;                  // planta pequena à direita da porta (só aparece na parte B)
const QX = 1318, QY = 456, QW = 228, QH = 166; // cavalete "Bem-vindo, Victor!" (à esquerda do Victor)

// ---------------- tempos ----------------
function tempos(ctx) {
  const { wa, wb } = ctx;
  const T = {
    t0: ctx.t0, t1: ctx.t1,
    meu: wa(23), papel: wa(24), gestao: wa(25), de: wa(26), mud: wa(27), em: wa(28), tec: wa(29), tecB: wb(29),
    E: wa(30), receb: wa(32), gente: wa(34), ensina: wa(36), ensinaB: wb(36), provoca: wa(37), provocaB: wb(37),
    abre: wa(39), portas: wa(40), portasB: wb(40),
  };
  T.drop0 = T.t0 + 0.10;            // a queda acontece depois da cortina (visível)
  T.land = T.t0 + 0.60;
  T.chip0 = T.tec + 0.26;
  T.voa0 = T.tecB + 0.08;           // cordão solta
  T.voa1 = T.voa0 + 0.4;            // crachá chega ao peito
  T.pan0 = T.voa0 + 0.2;
  T.pan1 = T.pan0 + 0.85;
  T.anda0 = T.pan0 + 0.12;
  T.anda1 = T.pan1 - 0.05;
  T.c2a = T.pan0 + 0.15;            // colega 2 entra
  T.c2b = T.gente - 0.26;
  T.hf = T.gente + 0.03;            // contato do toca-aqui
  T.porta0 = T.abre + 0.02;         // porta começa a abrir
  T.porta1 = T.abre + 0.5;
  T.push0 = T.t1 - 0.66;
  return T;
}

// ---------------- câmera ----------------
function camera(t, T) {
  let cx = 960, cy = 540, z;
  if (t <= T.pan0) {
    // abre em close no crachá + Victor e recua para revelar a manchete em "Meu papel?"
    // (enquadramento inicial alto: mostra o cordão e a presilha entrando com o crachá)
    const zA = lerp(1.0, 1.025, ease.sine(inv(T.meu, T.pan0, t)));
    const zI = lerp(1.12, 1.10, inv(T.t0, T.land + 0.12, t));
    const u = ease.inOut(inv(T.land + 0.12, T.meu + 0.14, t));
    z = lerp(zI, zA, u); cx = lerp(1240, 960, u); cy = lerp(470, 540, u);
  }
  else if (t <= T.pan1) {
    const u = inv(T.pan0, T.pan1, t), e = ease.inOut(u);
    cx = lerp(960, CXB, e);
    z = lerp(1.025, ZB, e) - 0.07 * Math.sin(Math.PI * u);
    cy = 540 - 18 * Math.sin(Math.PI * u);
  } else {
    const d = ease.sine(inv(T.pan1, T.push0, t));
    cx = CXB + 24 * d;
    z = ZB + 0.012 * d;
    const p = ease.in(inv(T.push0, T.t1 + 0.1, t));
    if (p > 0) {
      cx = lerp(cx, 2700, p);
      cy = lerp(540, 560, p);
      z = lerp(z, 1.12, p);
    }
  }
  const [a1, b1] = tremor(t, T.land, 0.3, 7);
  const [a2, b2] = tremor(t, T.tec, 0.35, 11);
  const [a3, b3] = tremor(t, T.hf, 0.25, 6);
  const [a4, b4] = tremor(t, T.porta0 + 0.3, 0.3, 6);
  return { cx, cy, z, dx: a1 + a2 + a3 + a4, dy: b1 + b2 + b3 + b4 };
}

// ---------------- defs locais ----------------
function defs() {
  return `<defs>`
    + `<linearGradient id="papel_sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6ebf2"/><stop offset=".5" stop-color="#f7f9fc"/><stop offset="1" stop-color="#e6ebf2"/></linearGradient>`
    + `<radialGradient id="papel_luz" cx="0.5" cy="0.6" r="0.75"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff7e8"/><stop offset="1" stop-color="${COR.orange2}"/></radialGradient>`
    + `<radialGradient id="papel_halo"><stop offset="0" stop-color="${COR.orange2}" stop-opacity=".75"/><stop offset=".45" stop-color="${COR.orange2}" stop-opacity=".28"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="papel_chao"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="${COR.orange2}" stop-opacity=".45"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="papel_raio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="${COR.orange2}" stop-opacity=".45"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></linearGradient>`
    + `<radialGradient id="papel_fim"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".4" stop-color="#fff4e0" stop-opacity=".6"/><stop offset="1" stop-color="${COR.orange2}" stop-opacity="0"/></radialGradient>`
    + `</defs>`;
}

// ---------------- fundo (grade no mundo + manchas com paralaxe) ----------------
function fundo(t, cam) {
  let s = `<rect width="${W}" height="${H}" fill="${COR.cream}"/>`;
  // manchas pastel com paralaxe (movem ~55% da câmera)
  const pcx = 960 + (cam.cx - 960) * 0.55, pz = lerp(1, cam.z, 0.5);
  let b = '';
  const blobs = [['#d7e4ee', 380, 380, 440, 300, 0], ['#f8e2c2', 1050, 720, 600, 280, 1.7], ['#f3dada', 1600, 340, 420, 320, 3.1],
    ['#d7e4ee', 2150, 660, 520, 300, 4.2], ['#f8e2c2', 2600, 330, 460, 280, 5.3]];
  for (const [c, x, y, rx, ry, ph] of blobs) {
    b += `<ellipse cx="${f(x + Math.sin(t * 0.35 + ph) * 40)}" cy="${f(y + Math.cos(t * 0.3 + ph) * 26)}" rx="${rx}" ry="${ry}" fill="${c}" opacity=".62"/>`;
  }
  s += `<g transform="translate(${f(960 + cam.dx * 0.5)} ${f(540 + cam.dy * 0.5)}) scale(${f(pz)}) translate(${f(-pcx)} -540)">${b}</g>`;
  return s;
}

function grade(cam) {
  const x0 = cam.cx - 960 / cam.z - 60, x1 = cam.cx + 960 / cam.z + 60;
  const y0 = cam.cy - 540 / cam.z - 60, y1 = cam.cy + 540 / cam.z + 60;
  let g = '';
  for (let x = Math.floor(x0 / 48) * 48; x <= x1; x += 48) g += `M${x},${f(y0)}V${f(y1)}`;
  for (let y = Math.floor(y0 / 48) * 48; y <= y1; y += 48) g += `M${f(x0)},${y}H${f(x1)}`;
  return `<path d="${g}" stroke="${COR.grid}" stroke-width="1.5"/>`
    + `<rect x="${f(x0)}" y="${CHAO}" width="${f(x1 - x0)}" height="5" rx="2" fill="#d9ccb4"/>`;
}

function doodles(t) {
  let s = '';
  const L = [[700, 236, 'o'], [880, 205, 'x'], [1520, 250, 'tri'], [1880, 470, 'x'], [2040, 236, 'o'], [2420, 205, 'x'], [3040, 300, 'tri'], [3200, 560, 'o'], [1320, 210, 'o']];
  for (const [x, y, k] of L) {
    const yy = y + Math.sin(t * 0.8 + x) * 6;
    if (k === 'x') s += `<path d="M${x - 10},${f(yy - 10)} l20,20 M${x + 10},${f(yy - 10)} l-20,20" stroke="${COR.tan}" stroke-width="4" stroke-linecap="round"/>`;
    else if (k === 'tri') s += `<path d="M${x},${f(yy - 12)} l12,20 l-24,0Z" fill="none" stroke="${COR.tan}" stroke-width="3.5" stroke-linejoin="round"/>`;
    else s += `<circle cx="${x}" cy="${f(yy)}" r="9" fill="none" stroke="${COR.tan}" stroke-width="3"/>`;
  }
  return s;
}

// planta de escritório (vaso laranja + folhas em tons de azul da marca)
function planta(x, t, sc = 1) {
  const sw = Math.sin(t * 1.6 + x) * 2.5;
  const folha = (ang, len, c) => `<g transform="rotate(${f(ang + sw)})"><path d="M0,0 Q${f(-len * 0.28)},${f(-len * 0.55)} 0,${f(-len)} Q${f(len * 0.28)},${f(-len * 0.55)} 0,0Z" fill="${c}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/><path d="M0,-6 L0,${f(-len * 0.8)}" stroke="#fff" stroke-width="2.2" opacity=".55" stroke-linecap="round"/></g>`;
  return `<g transform="translate(${x} ${CHAO}) scale(${sc})">`
    + `<g transform="translate(0 -74)">${folha(-38, 120, COR.blue2)}${folha(36, 112, COR.blue2)}${folha(-14, 150, COR.blue3)}${folha(14, 140, COR.blue)}${folha(-62, 86, COR.blue3)}${folha(60, 84, COR.blue3)}</g>`
    + `<path d="M-40,-82 L40,-82 L32,0 L-32,0Z" fill="${COR.orange}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
    + `<rect x="-46" y="-92" width="92" height="18" rx="6" fill="${COR.orange2}" stroke="${INK}" stroke-width="3.5"/>`
    + `<path d="M-22,-56 L-20,-18" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/></g>`;
}

// ---------------- crachá ----------------
// Coordenadas locais: origem no topo-centro do corpo, y para baixo. Corpo: x -200..200, y 0..560.
function cracha(t, T, o = {}) {
  const r = 30;
  let s = '';
  s += `<rect x="-192" y="12" width="${BW}" height="${BH}" rx="${r}" fill="rgba(22,35,59,.16)"/>`;
  s += `<clipPath id="papel_cb"><rect x="-200" y="0" width="${BW}" height="${BH}" rx="${r}"/></clipPath>`;
  s += `<rect x="-200" y="0" width="${BW}" height="${BH}" rx="${r}" fill="#fff"/>`;
  let dentro = '';
  // rodapé navy no estilo do banner DTS
  dentro += `<rect x="-200" y="448" width="${BW}" height="112" fill="${COR.navy}"/>`;
  dentro += `<path d="M120,560 L190,448 M168,560 L238,448" stroke="${COR.slate}" stroke-width="15"/><path d="M146,560 L216,448" stroke="${COR.orange}" stroke-width="3"/>`;
  dentro += `<rect x="-200" y="546" width="190" height="14" fill="${COR.orange}"/><rect x="-10" y="546" width="130" height="14" fill="${COR.slate}"/><rect x="120" y="546" width="80" height="14" fill="${COR.lblue}"/>`;
  // faixa superior clara
  dentro += `<rect x="-200" y="0" width="${BW}" height="112" fill="#f3f6fa"/>`;
  s += `<g clip-path="url(#papel_cb)">${dentro}</g>`;
  s += `<path d="M-200,112 L200,112" stroke="#dfe6ef" stroke-width="2"/>`;
  // DTS | Digital & Technology Services (no rodapé)
  s += txt('DTS', -172, 522, { anchor: 'start', size: 56, weight: 900, fill: '#fff', ls: 1 });
  s += `<rect x="-54" y="474" width="5" height="56" fill="${COR.orange}"/>`;
  s += txt('Digital & Technology', -38, 497, { anchor: 'start', size: 19, weight: 600, family: 'DM Sans', fill: '#dbe6f2' });
  s += txt('Services', -38, 523, { anchor: 'start', size: 19, weight: 600, family: 'DM Sans', fill: '#dbe6f2' });
  // fenda do cordão + lockup A&M
  s += `<rect x="-44" y="18" width="88" height="16" rx="8" fill="${COR.cream}" stroke="${INK}" stroke-width="3"/>`;
  const lk = lockupAM(0, 0, 17, COR.navy, { claro: true });
  s += `<g transform="translate(${f(-lk.w / 2)} 84)">${lk.svg}</g>`;
  // avatar do Victor recortado no círculo
  const ay = 200, R = 66;
  s += `<circle cx="0" cy="${ay}" r="${R + 15}" fill="${COR.orange}" stroke="${INK}" stroke-width="3.5"/>`;
  s += `<circle cx="0" cy="${ay}" r="${R + 6}" fill="#fff"/>`;
  s += `<clipPath id="papel_av"><circle cx="0" cy="${ay}" r="${R}"/></clipPath>`;
  let av = `<circle cx="0" cy="${ay}" r="${R}" fill="${COR.lblue}"/><circle cx="-30" cy="${ay - 34}" r="40" fill="#fff" opacity=".35"/>`;
  av += pessoa('victor', { x: 0, y: ay + 168, s: 0.92, t, expr: o.exprAv ?? 'smile', tilt: Math.sin(t * 1.3) * 2, gaze: o.gazeAv ?? [0, 0] });
  s += `<g clip-path="url(#papel_av)">${av}</g>`;
  s += `<circle cx="0" cy="${ay}" r="${R}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  // selo de verificado
  const kv = bk(t, T.land + 0.3, 0.4);
  if (kv > 0) s += popG(kv, 56, ay + 52, icone('check', 0, 0, 0.78));
  // nome
  const nome = 'Victor Vitorino';
  const ns = Math.min(42, 350 / largura(nome, 1, 900));
  const kn = inv(T.land + 0.02, T.land + 0.38, t);
  s += revela('papel_nm', -190, 278, 380, 70, kn, txt(nome, 0, 330, { size: f(ns), weight: 900, fill: COR.navy }));
  if (kn > 0 && kn < 1) {
    const cxN = -190 + 380 * ease.out(kn);
    s += `<rect x="${f(cxN - 3)}" y="290" width="6" height="50" rx="3" fill="${COR.orange}"/>`;
  }
  s += `<rect x="${f(-26 * ease.out(kn))}" y="348" width="${f(52 * ease.out(kn))}" height="5" rx="2.5" fill="${COR.orange}"/>`;
  // cargo: esqueleto "carregando" até a narração dizer o papel; depois imprime
  const kr = inv(T.tec + 0.02, T.tec + 0.42, t);
  if (kr < 1) {
    const sh = (t * 1.4) % 1;
    const esq = `<rect x="-150" y="374" width="300" height="22" rx="11" fill="url(#papel_sh)"/><rect x="-104" y="410" width="208" height="22" rx="11" fill="url(#papel_sh)"/>`
      + `<rect x="${f(-200 + sh * 520)}" y="370" width="40" height="66" fill="#fff" opacity=".7" transform="skewX(-18)"/>`;
    s += `<g opacity="${f(1 - ease.out(kr))}"><clipPath id="papel_sk"><rect x="-150" y="374" width="300" height="22" rx="11"/><rect x="-104" y="410" width="208" height="22" rx="11"/></clipPath><rect x="-150" y="374" width="300" height="22" rx="11" fill="#e6ebf2"/><rect x="-104" y="410" width="208" height="22" rx="11" fill="#e6ebf2"/><g clip-path="url(#papel_sk)">${esq}</g></g>`;
  }
  if (kr > 0) {
    s += revela('papel_r1', -190, 360, 380, 44, kr * 1.6, txt('Gestão de Mudanças', 0, 395, { size: 31, weight: 800, fill: COR.navy }));
    s += revela('papel_r2', -190, 404, 380, 44, kr * 1.6 - 0.6, txt('em Tecnologia', 0, 431, { size: 31, weight: 800, fill: COR.orange }));
  }
  // contorno por cima
  s += `<rect x="-200" y="0" width="${BW}" height="${BH}" rx="${r}" fill="none" stroke="${INK}" stroke-width="4"/>`;
  // varreduras de luz: no pouso e quando o cargo é impresso
  s += varredura('papel_v1', -200, 0, BW, BH, inv(T.land + 0.08, T.land + 0.7, t), r);
  s += varredura('papel_v2', -200, 0, BW, BH, inv(T.tec + 0.1, T.tec + 0.75, t), r);
  // presilha metálica
  s += `<path d="M-13,-46 L13,-46 L13,26 L-13,26Z" fill="#c9d4e2" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
    + `<rect x="-6" y="-38" width="12" height="54" rx="5" fill="#eef2f7"/>`
    + `<circle cx="0" cy="-58" r="13" fill="none" stroke="${INK}" stroke-width="8"/><circle cx="0" cy="-58" r="13" fill="none" stroke="#c9d4e2" stroke-width="3.5"/>`;
  return s;
}

// silhueta simplificada do crachá (para o rastro com desfoque de movimento)
function crachaFantasma() {
  return `<rect x="-200" y="0" width="${BW}" height="${BH}" rx="30" fill="#eef3f8" stroke="${COR.lblue}" stroke-width="4"/><rect x="-200" y="448" width="${BW}" height="112" rx="20" fill="${COR.slate}" opacity=".5"/><circle cx="0" cy="200" r="80" fill="${COR.orange2}" opacity=".6"/>`;
}

// cordão laranja: duas tiras subindo para fora da tela
function cordao(t) {
  const tira = (x0, x1) => `<path d="M${x0},-70 L${x1},-1400" stroke="${INK}" stroke-width="25" stroke-linecap="round"/>`
    + `<path d="M${x0},-70 L${x1},-1400" stroke="${COR.orange}" stroke-width="18" stroke-linecap="round"/>`
    + `<path d="M${x0},-70 L${x1},-1400" stroke="#fff" stroke-width="3" stroke-dasharray="3 22" opacity=".8"/>`;
  return tira(-8, -44) + tira(8, 44) + `<path d="M-16,-62 Q0,-82 16,-62" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
}

function balanco(t, T) {
  let a = 0.8 * Math.sin(t * 1.5 + 0.4);
  const u = t - T.land;
  if (u > 0) a += -6.5 * Math.exp(-2.3 * u) * Math.sin(7.2 * u);
  const u1 = t - T.meu;
  if (u1 > 0) a += 1.6 * Math.exp(-2.5 * u1) * Math.sin(6.5 * u1);
  const u2 = t - T.tec;
  if (u2 > 0) a += 3.4 * Math.exp(-2.8 * u2) * Math.sin(8 * u2);
  return a;
}
function queda(t, T) {
  if (t < T.land) { const u = inv(T.drop0, T.land, t); return -700 * (1 - u * u); }
  const u = t - T.land;
  return 30 * Math.exp(-6 * u) * Math.sin(15 * u);
}

function cenaCracha(t, T) {
  if (t > T.voa1 + 0.02) return '';
  const a = balanco(t, T);
  const dy = queda(t, T);
  const L = BY - PIV + dy;
  let s = '';
  const kf1 = ease.inOut(inv(T.voa0, T.voa1, t));
  // ondas do pouso e da "impressão" do cargo: ATRÁS do crachá (só o anel externo aparece)
  if (kf1 <= 0) {
    s += onda(BX, BY + 280, t - T.land, { r0: 220, r1: 460, w: 10, d: 0.6 });
    s += onda(BX, BY + 330, t - T.tec - 0.1, { r0: 240, r1: 440, w: 9, d: 0.6, cor: COR.orange2 });
  }
  // cordão (recolhe para cima quando solta)
  const rec = ease.in(inv(T.voa0, T.voa0 + 0.32, t));
  if (rec < 1) {
    s += `<g transform="translate(${BX} ${PIV}) rotate(${f(a * (1 - rec))}) translate(0 ${f(L - 1300 * rec)})">${cordao(t)}</g>`;
  }
  if (kf1 <= 0) {
    // queda: linhas de velocidade ao lado do crachá + fantasma com desfoque vertical
    if (t < T.land) {
      const vel = inv(T.drop0, T.land, t);
      const r = rng(5);
      for (let i = 0; i < 8; i++) {
        const xx = BX + (i % 2 ? 1 : -1) * (222 + r() * 80), len = 140 + r() * 240, yy = BY + dy + 60 + r() * 420;
        s += `<rect x="${f(xx - 3)}" y="${f(yy - len)}" width="6" height="${f(len)}" rx="3" fill="${i % 3 ? '#fff' : COR.orange2}" opacity="${f(0.85 * Math.min(1, vel * 1.6))}"/>`;
      }
      s += `<g transform="translate(${BX} ${f(BY + dy - 70 * vel)})" opacity="${f(0.5 * vel)}" filter="url(#fxBlurY)">${crachaFantasma()}</g>`;
    }
    const kh = Math.min(inv(T.land + 0.04, T.land + 0.4, t), 1 - inv(T.land + 0.9, T.land + 1.25, t));
    const hud = kh > 0 ? `<g opacity="${f(clamp(kh * 1.5))}">${hudCantos(-226, -26, 452, 612, kh, COR.orange, 44, 5)}</g>` : '';
    s += `<g transform="translate(${BX} ${PIV}) rotate(${f(a)}) translate(0 ${f(L)})">${cracha(t, T, { gazeAv: [0, 0] })}${hud}</g>`;
    s += faiscas(BX - 200, BY + 10, t - T.land, COR.orange, 6, 20, 60) + faiscas(BX + 200, BY + 10, t - T.land, COR.orange, 6, 20, 60);
    return s;
  }
  // voo até o peito do Victor (arco + rastro)
  const ar = a * (1 - kf1);
  const L0 = L + 280;
  const p0x = BX - L0 * Math.sin(ar * Math.PI / 180), p0y = PIV + L0 * Math.cos(ar * Math.PI / 180);
  const px = VXA + 21 * SV, py = CHAO - 73 * SV;
  const pos = k => [lerp(p0x, px, k), lerp(p0y, py, k) - 170 * Math.sin(Math.PI * k)];
  const sc = k => lerp(1, 0.078, ease.in(k) * 0.4 + k * 0.6);
  const desenha = (k, body) => {
    const [x, y] = pos(k);
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ar + 14 * Math.sin(Math.PI * k))}) scale(${f(sc(k))}) translate(0 -280)">${body}</g>`;
  };
  // rastro: dois fantasmas leves num único grupo com desfoque horizontal
  let fant = '';
  [[2, 0.10], [1, 0.18]].forEach(([i, op]) => {
    const kk = Math.max(0, kf1 - i * 0.08);
    fant += `<g opacity="${op}">${desenha(kk, crachaFantasma())}</g>`;
  });
  if (kf1 < 0.97) s += `<g filter="url(#fxBlurX)">${fant}</g>`;
  const alpha = 1 - inv(0.86, 1, kf1);
  s += `<g opacity="${f(alpha)}">${desenha(kf1, cracha(t, T))}</g>`;
  return s;
}

// brilho de chegada no peito (fica fora de cenaCracha porque dura mais)
function chegadaPeito(t, T, vx) {
  const age = t - T.voa1;
  if (age < -0.05 || age > 0.7) return '';
  const px = vx + 21 * SV, py = CHAO - 73 * SV;
  return onda(px, py, age, { r0: 6, r1: 110, w: 8, d: 0.5 }) + faiscas(px, py, age, COR.orange, 8, 18, 60)
    + popG(Math.max(0, 1 - age / 0.5) * bk(t, T.voa1 - 0.04, 0.25), px + 26, py - 30, icone('sparkle', 0, 0, 0.7));
}

// ---------------- manchete cinética ----------------
function manchete(t, T) {
  let s = '';
  // "Meu papel?" (pergunta laranja estilo Canteiro)
  const yQ = 560, sQ = 124;
  const kM = bk(t, T.meu - 0.08, 0.42), kP = bk(t, T.papel - 0.08, 0.42);
  const sai = ease.inOut(inv(T.gestao - 0.2, T.gestao + 0.12, t));
  if (kM > 0 && sai < 1) {
    const st = `stroke="${COR.navy}" stroke-width="9" paint-order="stroke" stroke-linejoin="round"`;
    const wMeu = largura('Meu', sQ, 900), wSp = largura(' ', sQ, 900), wPap = largura('papel', sQ, 900), wQ = largura('?', sQ, 900);
    let q = '';
    q += popG(kM, HX + wMeu / 2, yQ, txt('Meu', 0, 0, { size: sQ, weight: 900, fill: COR.orange, ls: 1, extra: st }));
    const xP = HX + wMeu + wSp + sQ * 0.16;
    q += popG(kP, xP + wPap / 2, yQ, txt('papel', 0, 0, { size: sQ, weight: 900, fill: COR.orange, ls: 1, extra: st }));
    const kq = bk(t, T.papel + 0.1, 0.45);
    const wob = Math.sin((t - T.papel) * 9) * 10 * Math.exp(-2 * Math.max(0, t - T.papel - 0.1));
    // "?" com respiro próprio depois do "l" (mesmo estilo das palavras; o balanço o destaca)
    const xQ = xP + wPap + sQ * 0.05 + wQ / 2;
    if (kq > 0) q += `<g transform="translate(${f(xQ)} ${yQ}) rotate(${f(8 + wob)}) scale(${f(kq)})">${txt('?', 0, 0, { size: sQ, weight: 900, fill: COR.orange, extra: st })}</g>`;
    const wTot = xQ + wQ / 2 - HX;
    const ku = ease.out(inv(T.papel + 0.15, T.papel + 0.5, t));
    if (ku > 0) q += `<path d="M${HX - 4},${yQ + 34} Q${f(HX + wTot / 2)},${yQ + 60} ${f(HX + wTot + 10)},${yQ + 26}" stroke="${COR.orange}" stroke-width="11" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${f(1 - ku)}"/>`;
    const sc = lerp(1, 0.2, sai), yy = lerp(yQ, 338, sai);
    s += `<g opacity="${f(1 - sai)}" transform="translate(${HX} ${f(yy)}) rotate(${f(-4 * (1 - sai))}) scale(${f(sc)}) translate(${-HX} ${-yQ})">${q}</g>`;
  }
  // rótulo "MEU PAPEL"
  const kl = fin(t, T.gestao - 0.1, 0.3);
  if (kl > 0) {
    const wl = largura('MEU PAPEL', 22, 700, 'DM Sans') + 8 * 5;
    s += `<g opacity="${f(kl)}" transform="translate(${f(-30 * (1 - kl))} 0)">`
      + `<rect x="${HX}" y="320" width="16" height="16" rx="3" fill="${COR.orange}"/>`
      + txt('MEU PAPEL', HX + 30, 337, { anchor: 'start', size: 22, weight: 700, family: 'DM Sans', fill: COR.slate, ls: 5 })
      + `<rect x="${f(HX + 46 + wl)}" y="327" width="${f(220 * ease.out(inv(T.gestao, T.gestao + 0.6, t)))}" height="3" rx="1.5" fill="${COR.lblue}"/>`
      + `</g>`;
  }
  // linhas da manchete
  const size = 100;
  const linhas = [
    { y: 448, ws: [['Gestão', T.gestao, COR.navy], ['de', T.de, COR.navy]] },
    { y: 556, ws: [['Mudanças', T.mud, COR.navy]] },
    { y: 664, ws: [['em', T.em, COR.navy], ['Tecnologia', T.tec, COR.orange]] },
  ];
  const sp = largura(' ', size, 900);
  linhas.forEach((ln, li) => {
    let x = HX, corpo = '', todos = true, algum = false;
    for (const [w, ta, cor] of ln.ws) {
      const ww = largura(w, size, 900);
      const u = inv(ta - 0.07, ta + 0.33, t);
      if (u > 0) {
        algum = true;
        const yy = ln.y + (1 - ease.back(u)) * 120;
        const sk = (1 - u) * -8;
        corpo += `<g transform="translate(${f(x)} ${f(yy)}) skewX(${f(sk)})">${txt(w, 0, 0, { anchor: 'start', size, weight: 900, fill: cor })}</g>`;
      }
      if (u < 1) todos = false;
      x += ww + sp;
    }
    if (!algum) return;
    if (todos) s += corpo;
    else s += `<clipPath id="papel_l${li}"><rect x="${HX - 30}" y="${ln.y - 110}" width="900" height="162"/></clipPath><g clip-path="url(#papel_l${li})">${corpo}</g>`;
  });
  // sublinhado desenhado sob "Tecnologia"
  const xT = HX + largura('em', size, 900) + sp, wT = largura('Tecnologia', size, 900);
  const kU = ease.out(inv(T.tec + 0.2, T.tec + 0.55, t));
  if (kU > 0) s += `<path d="M${f(xT - 4)},${664 + 38} Q${f(xT + wT / 2)},${664 + 58} ${f(xT + wT + 8)},${664 + 30}" stroke="${COR.orange}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".9" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${f(1 - kU)}"/>`;
  // três pilares da gestão de mudanças
  const chips = [['people', 'Pessoas'], ['flow', 'Processos'], ['app', 'Tecnologia']];
  let cx = HX;
  const cs = 25, ch = cs * 2.5;
  let aneis = '', pilulas = '';
  chips.forEach(([ic, rot], i) => {
    const w = largura(rot, cs, 800) + cs * 3.2;
    const ta = T.chip0 + i * 0.17;
    const k = bk(t, ta, 0.42);
    const xc = cx + w / 2, yc = 790;
    if (k > 0) {
      const bob = Math.sin(t * 2.2 + i * 1.3) * 3;
      // eco em forma de pílula, atrás de todos os chips
      const age = t - ta;
      if (age > 0.05 && age < 0.55) {
        const e = ease.out((age - 0.05) / 0.5), g = 8 + 40 * e;
        aneis += `<rect x="${f(xc - w / 2 - g)}" y="${f(yc - ch / 2 - g)}" width="${f(w + 2 * g)}" height="${f(ch + 2 * g)}" rx="${f(ch / 2 + g)}" fill="none" stroke="${COR.orange}" stroke-width="${f(6 * (1 - e) + 1)}" opacity="${f(0.9 * (1 - e))}"/>`;
      }
      pilulas += popG(k, xc, yc + bob, chipRotulo(0, 0, ic, rot, { size: cs }));
    }
    cx += w + 22;
  });
  s += aneis + pilulas;
  return s;
}

// ---------------- personagens ----------------
function estadoVictor(t, T) {
  const st = { t, s: SV, y: CHAO, expr: 'smile', gaze: [0, 0], armL: 8, armR: 8, blink: pisc(t, 0) };
  st.x = kf(t, [[T.anda0, VXA], [T.anda1, VXB, ease.inOut]]);
  if (t > T.anda0 && t < T.anda1) { st.walk = (st.x - VXA) / 42; st.gaze = [1, 0]; st.expr = 'joy'; }
  if (t < T.land) { st.gaze = [-0.6, -1]; st.expr = 'wow'; }
  else if (t < T.meu - 0.1) { st.gaze = [-0.8, -0.3]; st.expr = 'joy'; st.hop = 14 * Math.sin(Math.PI * inv(T.land, T.land + 0.3, t)); }
  else if (t < T.voa0) {
    // aponta para o crachá enquanto fala
    const ap = Math.min(fin(t, T.meu - 0.15, 0.22), 1 - fin(t, T.gestao + 0.25, 0.3));
    st.armL = lerp(8, 82, ap) + Math.sin(t * 6) * 3 * ap;
    st.gaze = [lerp(0, -1, ap), 0];
    st.talk = t < T.tecB;
    st.lean = -3 * ap;
    // olha as palavras da manchete enquanto as diz
    const le = Math.min(fin(t, T.gestao + 0.3, 0.25), 1 - fin(t, T.tec + 0.1, 0.25));
    if (le > 0) st.gaze = [lerp(st.gaze[0], -1, le), -0.15 * le];
    if (t > T.gestao + 0.4) st.expr = 'proud';
    // "Tecnologia": salto comemorando, braços em V (mãos fora da silhueta da cabeça)
    const k = kf(t, [[T.tec - 0.1, 0], [T.tec + 0.08, 1, ease.out], [T.tec + 0.5, 1], [T.tec + 0.85, 0]]);
    if (k > 0) {
      st.hop = 30 * Math.sin(Math.PI * inv(T.tec - 0.06, T.tec + 0.34, t));
      st.armL = lerp(st.armL, 122 + Math.sin(t * 10) * 6, k); st.armR = lerp(8, 122 - Math.sin(t * 10) * 6, k);
      st.expr = k > 0.3 ? 'joy' : 'proud'; st.gaze = [0, -0.2 * k];
    }
  } else if (t < T.anda0) {
    // recebe o crachá no peito
    st.gaze = [0.2, 0.9]; st.expr = 'proud';
    st.hop = 10 * Math.sin(Math.PI * inv(T.voa1 - 0.05, T.voa1 + 0.25, t));
  }
  if (t >= T.anda1) {
    st.gaze = [1, 0]; st.expr = 'joy';
    // toca-aqui
    const up = kf(t, [[T.hf - 0.32, 0], [T.hf - 0.04, 1, ease.out], [T.hf + 0.32, 1], [T.hf + 0.6, 0]]);
    st.armR = lerp(8, 130, up);
    st.lean = 5 * up;
    st.hop = 8 * Math.sin(Math.PI * inv(T.hf - 0.04, T.hf + 0.22, t));
    if (t > T.ensina - 0.1 && t < T.provoca - 0.1) { st.gaze = [1, -0.3]; st.tilt = 3 * Math.sin((t - T.ensina) * 7); st.expr = 'smile'; }
    if (t > T.provoca - 0.1) { st.gaze = [1, 0]; st.expr = 'joy'; }
    if (t > T.porta0 + 0.15) {
      st.gaze = [1, -0.25]; st.expr = t < T.portas + 0.25 ? 'wow' : 'joy';
      st.armL = lerp(8, 30, fin(t, T.portas, 0.3));
    }
  }
  return st;
}

function estadoCol2(t, T) {
  const st = { t, s: S2, y: CHAO, flip: true, expr: 'joy', gaze: [1, 0], armL: 8, armR: 8, blink: pisc(t, 1.15) };
  st.x = kf(t, [[T.c2a, C2A], [T.c2b, C2B, ease.out]]);
  if (t > T.c2a && t < T.c2b) st.walk = (C2A - st.x) / 105;
  const up = kf(t, [[T.hf - 0.3, 0], [T.hf - 0.04, 1, ease.out], [T.hf + 0.32, 1], [T.hf + 0.6, 0]]);
  st.armR = lerp(st.armR, 130, up);
  st.lean = 5 * up;
  st.hop = 8 * Math.sin(Math.PI * inv(T.hf - 0.04, T.hf + 0.22, t));
  // "ensina": a mão do toca-aqui continua no alto e vira o dedo erguido de quem explica
  const en = Math.min(fin(t, T.ensina - 0.12, 0.2), 1 - fin(t, T.ensinaB + 0.35, 0.3));
  if (en > 0) {
    st.armR = lerp(st.armR, 150, en) + Math.sin(t * 7) * 4 * en; st.armL = lerp(8, -26, en);
    st.talk = t > T.ensina - 0.05 && t < T.ensinaB; st.expr = 'joy'; st.gaze = [1, -0.2];
    st.lean = lerp(st.lean, 0, en);
  }
  if (t > T.porta0 + 0.2) { st.gaze = [-1, -0.2]; st.expr = t < T.portas + 0.2 ? 'wow' : 'joy'; }
  return st;
}

// intensidade da pose "provoca" (col1) — também usada para o rabicho do balão acompanhar a cabeça
const provocaK = (t, T) => Math.min(fin(t, T.provoca - 0.12, 0.2), 1 - fin(t, T.provocaB + 0.25, 0.3));

function estadoCol1(t, T) {
  // um passo atrás (menor e acima da linha do chão), corpo levemente virado para o Victor
  const st = { t, s: S1, y: Y1, x: C1X, expr: 'smile', gaze: [-1, 0], armL: 8, armR: 8, lean: -4, blink: pisc(t, 2.3) };
  const ac = Math.min(fin(t, T.receb - 0.15, 0.2), 1 - fin(t, T.hf + 0.15, 0.25));
  if (ac > 0) { st.wave = ac; st.expr = 'joy'; }
  // "provoca": inclina e aponta para o Victor, falando
  const pv = provocaK(t, T);
  if (pv > 0) {
    st.lean = lerp(-4, -10, pv); st.armL = lerp(8, 96, pv) + Math.sin(t * 9) * 6 * pv; st.armR = lerp(8, -30, pv);
    st.talk = t > T.provoca - 0.05 && t < T.provocaB; st.expr = 'joy'; st.gaze = [-1, 0];
  }
  if (t > T.porta0 + 0.2) { st.gaze = [1, -0.2]; st.expr = t < T.portas + 0.25 ? 'wow' : 'joy'; st.lean = 2; }
  return st;
}

// lâmpada que acende sobre a mão erguida do col2 em "ensina"
function ideiaCol2(t, T) {
  const k = bk(t, T.ensina + 0.02, 0.32);
  const sai = 1 - fin(t, T.ensinaB + 0.3, 0.3);
  if (k <= 0 || sai <= 0) return '';
  const x = C2B - LAMP_DX, y = CHAO - LAMP_DY + Math.sin(t * 5) * 4;
  let s = '';
  // raios de luz girando em volta da lâmpada
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + t * 1.2;
    s += `<path d="M${f(Math.cos(a) * 26)},${f(Math.sin(a) * 26)} L${f(Math.cos(a) * 38)},${f(Math.sin(a) * 38)}" stroke="${COR.orange}" stroke-width="5" stroke-linecap="round"/>`;
  }
  s += `<circle r="21" fill="#fff4e0" stroke="${INK}" stroke-width="3"/>` + icone('bulb', 0, 0, 0.52);
  return `<g opacity="${f(sai)}">${popG(k, x, y, s)}</g>` + faiscas(x, y, t - T.ensina - 0.02, COR.orange2, 6, 34, 66);
}

function estadoCol3(t, T) {
  const st = { t, s: S3, y: CHAO, x: C3X, expr: 'smile', gaze: [-1, 0], armL: 8, armR: 8, lean: -4, blink: pisc(t, 0.7) };
  const ac = Math.min(fin(t, T.receb - 0.05, 0.2), 1 - fin(t, T.hf + 0.25, 0.25));
  if (ac > 0) { st.armL = lerp(8, 130 + Math.sin(t * 13 + 1) * 16, ac); st.expr = 'joy'; }
  // puxa a maçaneta e apresenta a porta aberta
  const pega = Math.min(fin(t, T.abre - 0.28, 0.22), 1 - fin(t, T.porta1 - 0.05, 0.25));
  const mostra = fin(t, T.porta1 - 0.1, 0.3);
  if (pega > 0) { st.armR = lerp(8, 108, pega); st.gaze = [1, 0]; st.lean = lerp(-4, 6, pega); st.expr = 'smile'; }
  if (mostra > 0) {
    st.armR = lerp(st.armR, 96 + Math.sin(t * 3) * 4, mostra); st.armL = lerp(8, 24, mostra);
    st.gaze = [-1, -0.1]; st.expr = 'joy'; st.lean = lerp(st.lean, -3, mostra);
    st.talk = t > T.portas - 0.05 && t < T.portasB;
  }
  return st;
}

// colega 3: variação da col1 (cabelo curto ruivo, blusa azul, pele clara)
function colega3(st) {
  return pessoa('col1', st)
    .replace(/<circle cx="0" cy="-244" r="22"[^>]*\/>/, '')
    .replaceAll('#c98d66', '#f1c9a5')
    .replaceAll('#1d1410', '#8a4524')
    .replaceAll('#2a9d8f', COR.blue2)
    .replaceAll('#2b3448', COR.slate);
}

// ---------------- porta ----------------
function quadP(Q, u, v) {
  const [A, B, C, D] = Q; // A topo-dobradiça, B topo-livre, C base-livre, D base-dobradiça
  const tx = lerp(A[0], B[0], u), ty = lerp(A[1], B[1], u);
  const bx = lerp(D[0], C[0], u), by = lerp(D[1], C[1], u);
  return [lerp(tx, bx, v), lerp(ty, by, v)];
}
function poly(Q, pts) {
  return 'M' + pts.map(([u, v]) => quadP(Q, u, v).map(n => f(n)).join(',')).join(' L') + 'Z';
}

function porta(t, T, luz) {
  let s = '';
  const FR = 18;
  // halo quente atrás (a sala recebe a luz)
  if (luz > 0) {
    s += `<circle cx="${(DL + DR) / 2}" cy="${DT + DH * 0.5}" r="${f(520 + 80 * luz)}" fill="url(#papel_halo)" opacity="${f(luz)}"/>`;
    // feixes saindo pelo vão
    let raios = '';
    for (let i = 0; i < 7; i++) {
      const ang = 180 + (i - 3) * 17 + Math.sin(t * 0.9 + i) * 3;
      const len = 900 + 160 * Math.sin(t * 1.3 + i * 2);
      const w0 = 40, w1 = 150 + 30 * (i % 3);
      raios += `<g transform="translate(${(DL + DR) / 2} ${DT + DH * 0.55}) rotate(${f(ang)})"><path d="M0,${-w0} L${f(len)},${-w1} L${f(len)},${w1} L0,${w0}Z" fill="url(#papel_raio)" opacity="${f(0.42 + 0.14 * Math.sin(t * 2 + i))}"/></g>`;
    }
    s += `<g opacity="${f(luz)}">${raios}</g>`;
  }
  // batente
  s += `<rect x="${DL - FR + 6}" y="${DT - FR + 8}" width="${DW + 2 * FR}" height="${DH + FR - 8}" rx="8" fill="rgba(22,35,59,.14)"/>`;
  s += `<rect x="${DL - FR}" y="${DT - FR}" width="${DW + 2 * FR}" height="${DH + FR}" rx="8" fill="${COR.navy}" stroke="${INK}" stroke-width="3.5"/>`;
  // vão: escuro quando fechado, luz quando aberto
  s += `<rect x="${DL}" y="${DT}" width="${DW}" height="${DH}" fill="#0d2b4a"/>`;
  if (luz > 0) {
    s += `<rect x="${DL}" y="${DT}" width="${DW}" height="${DH}" fill="url(#papel_luz)" opacity="${f(luz)}"/>`;
    s += `<rect x="${DL + 30}" y="${DT + 30}" width="${DW - 60}" height="${DH - 40}" rx="20" fill="#fff" opacity="${f(0.75 * luz)}" filter="url(#fxGlowForte)"/>`;
  }
  // folha da porta girando na dobradiça (direita)
  const th = kf(t, [[T.porta0, 0], [T.porta1, 118, ease.out], [T.porta1 + 0.25, 108, ease.inOut]]) * Math.PI / 180;
  const xf = DR - DW * Math.cos(th);
  const ext = DH * 0.09 * Math.sin(th);
  const Q = [[DR, DT], [xf, DT - ext], [xf, CHAO + ext * 0.25], [DR, CHAO]];
  const costas = Math.cos(th) < 0;
  const corFolha = costas ? '#dfe8f1' : '#ffffff';
  s += `<path d="${poly(Q, [[0, 0], [1, 0], [1, 1], [0, 1]])}" fill="${corFolha}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  if (Math.abs(Math.cos(th)) > 0.12) {
    s += `<path d="${poly(Q, [[0.16, 0.08], [0.84, 0.08], [0.84, 0.44], [0.16, 0.44]])}" fill="${costas ? '#cfdbe8' : COR.lblue}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" opacity=".9"/>`;
    s += `<path d="${poly(Q, [[0.16, 0.52], [0.84, 0.52], [0.84, 0.92], [0.16, 0.92]])}" fill="${costas ? '#cfdbe8' : COR.lblue}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" opacity=".9"/>`;
    if (!costas) {
      const [hx, hy] = quadP(Q, 0.88, 0.62);
      s += `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(11 * Math.max(0.3, Math.cos(th)))}" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`;
    }
  }
  // brilho na borda do batente quando a luz vaza
  if (luz > 0) s += `<rect x="${DL - FR}" y="${DT - FR}" width="${DW + 2 * FR}" height="${DH + FR}" rx="8" fill="none" stroke="${COR.orange2}" stroke-width="4" opacity="${f(0.6 * luz)}"/>`;
  return s;
}

function luzChao(t, luz) {
  if (luz <= 0) return '';
  return `<ellipse cx="${(DL + DR) / 2 - 140}" cy="${CHAO + 6}" rx="${f(520 * luz)}" ry="40" fill="url(#papel_chao)" opacity="${f(luz)}"/>`;
}

// ---------------- bandeirinhas de boas-vindas ----------------
// Varal em dois arcos (do cavalete até a planta, passando sobre a porta). Em "recebido" o cordão
// se desenrola da esquerda para a direita e cada bandeirinha cai pendurada com mola.
const VARAL = [[1480, 166], [2290, 150], [3100, 166]];
const SAG = 58;
function varalPt(s, t) {
  // s em [0, 1] ao longo dos dois arcos
  const seg = Math.min(1, Math.floor(s * 2)), u = s * 2 - seg;
  const [x0, y0] = VARAL[seg], [x1, y1] = VARAL[seg + 1];
  return [lerp(x0, x1, u), lerp(y0, y1, u) + SAG * 4 * u * (1 - u) + Math.sin(t * 2 + s * 9) * 3];
}
function bandeirinhas(t, T) {
  const ini = T.receb - 0.15, dur = 0.8;
  const u = inv(ini, ini + dur, t);
  if (u <= 0) return '';
  const frente = ease.sine(u);
  let d = '';
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const sv = Math.min(frente, i / N);
    const [x, y] = varalPt(sv, t);
    d += (i ? 'L' : 'M') + f(x) + ',' + f(y);
    if (i / N >= frente) break;
  }
  let s = `<path d="${d}" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const cores = [COR.orange, COR.lblue, COR.navy, COR.orange2, COR.blue2];
  const n = 26;
  for (let i = 0; i < n; i++) {
    const sv = (i + 0.5) / n;
    if (Math.abs(sv - 0.5) < 0.015) continue;               // pino central
    // cada bandeirinha cai quando o cordão passa por ela (inverso de ease.sine)
    const ti = ini + dur * Math.acos(1 - 2 * sv) / Math.PI;
    const kb = bk(t, ti, 0.32);
    if (kb <= 0.001) continue;
    const [x, y] = varalPt(sv, t);
    const age = Math.max(0, t - ti);
    const sw = Math.sin(t * 3.2 + i * 0.9) * 6 + 24 * Math.exp(-age * 6) * Math.sin(age * 22);
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(sw)}) scale(${f(kb)})"><path d="M-20,0 L20,0 L0,42Z" fill="${cores[i % cores.length]}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>`;
  }
  // pinos (aparecem quando o cordão chega até eles)
  VARAL.forEach(([x, y], i) => {
    const kp = i === 0 ? 1 : clamp((frente - i / 2 + 0.02) / 0.05);
    if (kp > 0) s += `<circle cx="${x}" cy="${y}" r="${f(8 * kp)}" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>`;
  });
  return s;
}

// ---------------- cavalete "Bem-vindo, Victor!" (ao lado do Victor) ----------------
function cavaleteBV(t, T) {
  const ta = T.pan1 - 0.2;
  const k = bk(t, ta, 0.5);
  if (k <= 0) return '';
  const legH = CHAO - (QY + QH);
  let q = cavalete(QX, QY, QW, QH, legH);
  // quadro com sombra deslocada e fitas laranja
  const rot = -2.5 + Math.sin(t * 1.4) * 0.8;
  const cxq = QX + QW / 2, cyq = QY + QH / 2;
  let b = cartao(QX, QY, QW, QH, { r: 14 });
  b += `<rect x="${QX + 16}" y="${QY - 9}" width="44" height="18" rx="3" fill="${COR.orange2}" stroke="${INK}" stroke-width="2.5" transform="rotate(-12 ${QX + 38} ${QY})"/>`;
  b += `<rect x="${QX + QW - 60}" y="${QY - 9}" width="44" height="18" rx="3" fill="${COR.orange2}" stroke="${INK}" stroke-width="2.5" transform="rotate(10 ${QX + QW - 38} ${QY})"/>`;
  b += txt('DTS · A&M', cxq, QY + 40, { size: 15, weight: 700, family: 'DM Sans', fill: COR.slate, ls: 3 });
  b += txt('Bem-vindo,', cxq, QY + 88, { size: 34, weight: 900, fill: COR.navy });
  b += txt('Victor!', cxq, QY + 136, { size: 42, weight: 900, fill: COR.orange });
  // coraçãozinho / brilho desenhado
  const kh = bk(t, ta + 0.35, 0.35);
  if (kh > 0) b += popG(kh, QX + QW - 22, QY + 112, icone('sparkle', 0, 0, 0.6, COR.orange));
  q += `<g transform="rotate(${f(rot)} ${f(cxq)} ${f(cyq)})">${b}</g>`;
  // pop a partir do pé do cavalete
  return onda(cxq, cyq, t - ta - 0.05, { r0: 60, r1: 230, w: 8, d: 0.5 })
    + `<g transform="translate(${f(cxq)} ${CHAO}) scale(${f(k)}) translate(${f(-cxq)} ${-CHAO})">${q}</g>`;
}

// luz quente aos pés do Victor (protagonista em destaque na parte B)
function luzVictor(t, T, vx) {
  const k = fin(t, T.pan1 - 0.25, 0.5);
  if (k <= 0) return '';
  const pul = 1 + 0.04 * Math.sin(t * 3);
  return `<ellipse cx="${f(vx)}" cy="${CHAO + 4}" rx="${f(165 * k * pul)}" ry="${f(30 * k)}" fill="url(#papel_chao)" opacity="${f(0.6 * k)}"/>`;
}

// ---------------- balões ----------------
function bolha(cx, cy, w, h, tipX, tipY, k, o, corpo) {
  if (k <= 0.001) return '';
  const r = h / 2;
  const fill = o.fill ?? '#fff';
  const bx = clamp(tipX, cx - w / 2 + r * 0.9, cx + w / 2 - r * 0.9);
  const by = cy + h / 2;
  let s = `<rect x="${f(cx - w / 2 + 6)}" y="${f(cy - h / 2 + 8)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="rgba(22,35,59,.16)"/>`;
  s += `<path d="M${f(bx - 17)},${f(by - 6)} L${f(tipX)},${f(tipY)} L${f(bx + 17)},${f(by - 6)}Z" fill="${fill}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  if (o.aro) s += `<rect x="${f(cx - w / 2 - 5)}" y="${f(cy - h / 2 - 5)}" width="${f(w + 10)}" height="${f(h + 10)}" rx="${f(r + 5)}" fill="none" stroke="${o.aro}" stroke-width="4"/>`;
  s += `<rect x="${f(cx - w / 2)}" y="${f(cy - h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${fill}" stroke="${INK}" stroke-width="3.5"/>`;
  s += `<path d="M${f(bx - 13.5)},${f(by)} L${f(bx + 13.5)},${f(by)}" stroke="${fill}" stroke-width="6"/>`;
  s += corpo;
  return `<g transform="translate(${f(tipX)} ${f(tipY)}) scale(${f(k)}) translate(${f(-tipX)} ${f(-tipY)})">${s}</g>`;
}

const icRaio = (x, y, s = 1, fill = '#fff') => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="M5,-23 L-13,4 L-1,4 L-6,23 L13,-5 L1,-5Z" fill="${fill}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/></g>`;
const icPorta = (x, y, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><rect x="-15" y="-21" width="26" height="42" rx="3" fill="#fff4dc" stroke="${INK}" stroke-width="3"/><path d="M11,-21 L22,-26 L22,25 L11,21Z" fill="${COR.lblue}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M-6,-8 L-12,-14 M-2,-12 L-2,-19 M-9,0 L-15,0" stroke="${COR.orange}" stroke-width="3" stroke-linecap="round"/></g>`;

function baloes(t, T) {
  let fundoB = '', frente = '';
  // balão logo acima da cabeça: rabicho curto (≈ 40-60 px) que termina no topo do cabelo
  const fala = (rot, x, y, tipX, tipY, ta, o) => {
    const k = bk(t, ta - 0.04, 0.42);
    if (k <= 0) return;
    const size = 36;
    const tw = largura(rot, size, 800);
    const w = tw + 104, h = 80;
    const bob = Math.sin(t * 2.4 + x) * 3;
    const icx = x - w / 2 + 44, icy = y + bob;
    const corpo = `<circle cx="${f(icx)}" cy="${f(icy)}" r="26" fill="${o.icFundo}"/>` + o.ic(icx, icy)
      + txt(rot, x - w / 2 + 80, y + bob + 12.5, { anchor: 'start', size, weight: 800, fill: o.cor });
    // onda atrás do balão
    fundoB += onda(x, y, t - ta, { r0: w * 0.42, r1: w * 0.5 + 90, w: 7, d: 0.5, cor: o.onda ?? COR.orange, duplo: false });
    fundoB += faiscas(x + w / 2 - 10, y - h / 2 + 8, t - ta, COR.orange, 6, 22, 56);
    frente += bolha(x, y + bob, w, h, tipX, tipY, k, { fill: o.fill, aro: o.aro }, corpo);
  };
  // topo do cabelo de cada colega (para o rabicho não invadir a cabeça)
  const topo2 = CHAO - 253 * S2, topo1 = Y1 - 266 * S1, topo3 = CHAO - 244 * S3;
  // ordem esquerda→direita igual à da narração: Ensina · Provoca · Abre portas
  // "Ensina" (colega 2, o do toca-aqui, mais perto do Victor)
  const x2 = kf(t, [[T.c2a, C2A], [T.c2b, C2B, ease.out]]);
  fala('Ensina', 1930, 396, x2 - 6, topo2 + 6, T.ensina, { fill: '#fff', cor: COR.navy, icFundo: '#fff4e6', ic: (x, y) => icone('bulb', x, y, 0.92) });
  // "Provoca" (colega 1, no meio) — o rabicho segue a cabeça quando ela se inclina
  const lean1 = 46 * provocaK(t, T);
  fala('Provoca', 2194, 412, C1X - 6 - lean1, topo1 + 6 + lean1 * 0.08, T.provoca, { fill: COR.orange, cor: '#fff', icFundo: '#ffd9a8', ic: (x, y) => icRaio(x, y, 1.0, '#fff'), onda: COR.navy });
  // "Abre portas" (colega 3, ao lado da porta; aro laranja-claro separa do batente)
  fala('Abre portas', 2494, 438, C3X + 4, topo3 + 6, T.portas, { fill: COR.navy, cor: '#fff', icFundo: '#24476b', aro: COR.orange2, ic: (x, y) => icPorta(x, y, 0.92) });
  return [fundoB, frente];
}

// toca-aqui: faíscas no ponto de contato
function tocaAqui(t, T) {
  const age = t - T.hf;
  if (age < 0 || age > 0.8) return '';
  const x = (VXB + C2B) / 2, y = CHAO - 196;
  return onda(x, y, age, { r0: 10, r1: 150, w: 9, d: 0.5 })
    + faiscas(x, y, age, COR.orange, 10, 26, 84)
    + particulas(34, x, y, age, { n: 18, v: 360, d: 0.8, sz: 10, g: 220 })
    + popG(Math.max(0, 1 - age / 0.35) * bk(t, T.hf - 0.02, 0.18), x, y - 4, icone('sparkle', 0, 0, 1.3, COR.orange2));
}

// linhas de velocidade durante o pan (espaço de tela)
function velocidade(t, T) {
  const u = inv(T.pan0, T.pan1, t);
  if (u <= 0 || u >= 1) return '';
  const k = Math.pow(Math.sin(Math.PI * u), 1.5);
  const r = rng(77);
  let s = '';
  for (let i = 0; i < 11; i++) {
    const y = 205 + r() * 270, len = 160 + r() * 340, sp = 2600 + r() * 1800, h = 3 + r() * 4;
    const x0 = r() * (W + 800);
    const xx = (((x0 - (t - T.pan0) * sp) % (W + 800)) + (W + 800)) % (W + 800) - 400;
    s += `<rect x="${f(xx)}" y="${f(y)}" width="${f(len)}" height="${f(h)}" rx="${f(h / 2)}" fill="${i % 3 === 0 ? COR.orange2 : '#ffffff'}" opacity="${f((i % 3 === 0 ? 0.45 : 0.85) * k)}"/>`;
  }
  return s;
}

// partículas de luz saindo da porta
function brilhosPorta(t, luz) {
  if (luz <= 0) return '';
  const r = rng(91);
  let s = '';
  for (let i = 0; i < 16; i++) {
    const ph = r(), sp = 0.5 + r() * 0.6, ang = Math.PI * (0.75 + r() * 0.6), sz = 3 + r() * 5;
    const u = ((t * sp + ph) % 1);
    const d = 40 + u * 520;
    const x = (DL + DR) / 2 + Math.cos(ang) * d, y = DT + DH * 0.5 + Math.sin(ang) * d * 0.6 - u * 60;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(sz * (1 - u * 0.5))}" fill="${i % 2 ? '#fff' : COR.orange2}" opacity="${f(luz * Math.sin(Math.PI * u) * 0.9)}"/>`;
  }
  return s;
}

// ---------------- quadro ----------------
export function desenhar(t, ctx) {
  const T = tempos(ctx);
  const cam = camera(t, T);
  let s = defs() + fundo(t, cam);

  const luz = ease.out(inv(T.porta0 + 0.05, T.porta1, t)) * (1 + 0.06 * Math.sin(t * 6));
  let mundo = grade(cam) + doodles(t);
  const kPl = bk(t, T.pan1 - 0.1, 0.45);
  if (kPl > 0) mundo += `<g transform="translate(${PLANTA} ${CHAO}) scale(${f(kPl)}) translate(${-PLANTA} ${-CHAO})">${planta(PLANTA, t, 0.8)}</g>`;
  // porta + luz (fica atrás dos personagens); varal e cavalete por cima dos raios
  mundo += porta(t, T, clamp(luz)) + luzChao(t, clamp(luz));
  mundo += bandeirinhas(t, T) + cavaleteBV(t, T);

  // parte A: manchete e crachá
  if (t < T.pan1 + 0.1) mundo += manchete(t, T);
  // pendurado: atrás do Victor; em voo: na frente dele (pousa no peito)
  const voando = t > T.voa0;
  if (!voando) mundo += cenaCracha(t, T);

  // personagens (do fundo para a frente): col1 um passo atrás, Victor na frente com luz própria
  const v = estadoVictor(t, T);
  const [balFundo, balFrente] = baloes(t, T);
  mundo += luzVictor(t, T, v.x) + balFundo;   // ondas dos balões atrás das pessoas
  mundo += pessoa('col1', estadoCol1(t, T));
  mundo += colega3(estadoCol3(t, T));
  mundo += pessoa('col2', estadoCol2(t, T));
  mundo += pessoa('victor', v);
  if (voando) mundo += cenaCracha(t, T);
  mundo += ideiaCol2(t, T);
  mundo += chegadaPeito(t, T, v.x);
  mundo += tocaAqui(t, T);
  mundo += brilhosPorta(t, clamp(luz));
  mundo += balFrente;

  s += `<g transform="translate(${f(960 + cam.dx)} ${f(540 + cam.dy)}) scale(${f(cam.z)}) translate(${f(-cam.cx)} ${f(-cam.cy)})">${mundo}</g>`;
  s += velocidade(t, T);
  // clarão quente no fim, conduzindo para a próxima cena
  const fimK = ease.in(inv(T.push0 + 0.1, T.t1, t));
  if (fimK > 0) {
    const dx = ((DL + DR) / 2 - cam.cx) * cam.z + 960 + cam.dx, dy = (DT + DH * 0.55 - cam.cy) * cam.z + 540 + cam.dy;
    s += `<circle cx="${f(dx)}" cy="${f(dy)}" r="${f(300 + 700 * fimK)}" fill="url(#papel_fim)" opacity="${f(0.85 * fimK)}"/>`;
  }
  return s;
}
