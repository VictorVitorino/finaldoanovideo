// Cena "fecho" (76,55–88,00 s): "Adoção não se impõe. Se constrói. Pessoa por pessoa. Gestão da Mudança. (…)"
// Motion graphics adulto: tipografia cinética, gráfico e câmera. Sem logo, sem nome de empresa e sem personagens.
// ATO 1 (até ~82,0): a negação bate grande ("Adoção" no impacto sonoro; "impõe." despenca, a tela treme e a palavra é
// riscada em laranja). Embaixo, a planta tracejada de uma escada de dez barras espera. Em "Se constrói." a negação
// recua e encolhe, a frase laranja sobe letra a letra por máscara e as barras se erguem da esquerda para a direita,
// nas cores da régua (duas por marca). Em "Pessoa por pessoa." um pino pousa sobre cada barra, em cascata, e a linha
// de tendência com brilho vai ligando os pinos.
// ATO 2 (de 'gestao' - 0,3 em diante): a tipografia do ato 1 sobe e sai; a câmera abre e entra o cartão final: pino
// laranja como emblema (dele sai a trilha da régua, até a margem direita), título, fio, frase-síntese, "Gestão da
// Mudança | Change Management" e a chamada. Os pinos dão um salto em onda, uma onda de luz passa pelas barras, sobe
// uma poeira de luz (sem confete: o tom é sóbrio) e um pulso percorre a linha.
// Quadro final (t >= 85,5): estável; ficam a respiração dos pinos, o pulso na linha, o emblema e a poeira do fundo.
import { W, MG, C, txt, larg, fin, back, pop, sobe, desliza, revela, tracar, tremor, onda, particulas, fio, icone, opa, rotulo, clamp, lerp, inv, ease, n2, rng } from '../base.js';
import { NIVEIS } from '../modelo.js';
import { fundoNoite, camera, brilho, pinoMapa } from '../ludico.js';

const f = n2;
export const FUNDO = 'navy';
export const LEGENDA = false;

// ---------- ato 1: tipografia ----------
const S1 = 92, LS = -1.4, Y1 = 262, Y2 = 364;      // "Adoção não" / "se impõe." (Light)
const KN = 1.3, DYN = 190;                         // a negação começa ampliada e mais embaixo; depois recua para (Y1, Y2)
const S3 = 124, Y3 = 512;                          // "Se constrói." (laranja)
const S4 = 68, Y4 = 668;                           // "Pessoa por pessoa."
const wL = (str, s, ls = LS) => larg(str, s, { f: 'L' }) + ls * str.length;
const tL = (str, x, y, s, c, ls = LS) => txt(str, x, y, { f: 'L', s, c, ls });

// ---------- escada: dez barras nas cores da régua (duas por marca) ----------
const NB = 10, YB = 1250, GAP = 14, BW = (W - 2 * MG - (NB - 1) * GAP) / NB;
const bx = i => MG + i * (BW + GAP), cxB = i => bx(i) + BW / 2;
const hB = i => 100 + i * 33;
const topo = i => YB - hB(i);
const SPIN = 0.8, CAB = 42 * SPIN;                 // escala do pino e altura do centro da cabeça acima da ponta
const GRADE = [1, 2, 3, 4].map(k => YB - 100 * k);
// barra com o topo arredondado; h = altura atual
const dBarra = (i, h, r = 9) => {
  const x = bx(i), y = YB - h, rr = Math.min(r, h / 2);
  return `M${f(x)},${YB} V${f(y + rr)} Q${f(x)},${f(y)} ${f(x + rr)},${f(y)} H${f(x + BW - rr)} Q${f(x + BW)},${f(y)} ${f(x + BW)},${f(y + rr)} V${YB}Z`;
};

// ---------- ato 2: cartão final ----------
const PIN = { x: MG + 38, y: 250, k: 1.6 };        // ponta do pino-emblema
const ST = 70, TY1 = 346, TY2 = 428;               // título (Light)
const FY = 460;                                    // fio laranja
const SF = 42, FR1 = 540, FR2 = 596;               // frase-síntese
const SLAB = 30, LAB = 678;                        // rótulo da prática
const SCTA = 26, CTA = 742;                        // assinatura pessoal (linha de base do nome)

// escala (sx, sy) em torno de (x, y)
const esm = (x, y, sx, sy, body, r = 0) => `<g transform="translate(${f(x)} ${f(y)})${r ? ` rotate(${f(r)})` : ''} scale(${f(sx)} ${f(sy)}) translate(${f(-x)} ${f(-y)})">${body}</g>`;
// linha que sobe por trás de uma máscara (k: 0 -> 1)
const sobeMasc = (id, y, s, k, body) => (k <= 0 ? '' : k >= 1 ? body
  : `<clipPath id="${id}"><rect x="0" y="${f(y - s * 0.98)}" width="${W}" height="${f(s * 1.28)}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(0 ${f((1 - k) * s * 1.1)})">${body}</g></g>`);
// letras que sobem uma a uma por trás da máscara da linha (animador de texto)
function letras(str, x, y, s, cor, t, ti, passo) {
  if (t <= ti) return '';
  let out = '', n = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ' ') continue;
    const a = ti + n * passo, k = ease.out5(inv(a, a + 0.42, t));
    n++;
    if (k <= 0) continue;
    const lx = x + wL(str.slice(0, i), s);
    out += k >= 1 ? tL(str[i], lx, y, s, cor) : `<g transform="translate(0 ${f((1 - k) * s * 1.05)})">${tL(str[i], lx, y, s, cor)}</g>`;
  }
  return out;
}
// overshoot contido (~4%) para as barras altas
const backS = u => 1 + 2 * Math.pow(u - 1, 3) + Math.pow(u - 1, 2);
// ponto ao longo de uma poligonal (u = 0..1, por índice)
function aoLongo(P, u) {
  const v = clamp(u) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(v)), k = v - i;
  return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k)];
}

// brilho que varre um texto (a máscara é o próprio texto): u = 0..1
const lustro = (id, texto, x0, x1, y, s, u, o = 0.6) => {
  if (u <= 0 || u >= 1) return '';
  const cx = lerp(x0 - 130, x1 + 130, u);
  return `<clipPath id="${id}">${texto}</clipPath><g clip-path="url(#${id})"><path d="M${f(cx - 52)},${f(y + s * 0.32)} L${f(cx + 12)},${f(y - s)} L${f(cx + 78)},${f(y - s)} L${f(cx + 14)},${f(y + s * 0.32)}Z" fill="#fff" opacity="${o}"/></g>`;
};
// poeira de luz que sobe dos pontos P a partir de ti (no lugar de confete: mais sóbrio)
function poeira(t, ti, P) {
  const age = t - ti;
  if (age <= 0 || age > 2.4) return '';
  const R = rng(31), cores = [C.white, C.orange40, C.blue40];
  let s = '';
  P.forEach(([x, y], i) => {
    for (let j = 0; j < 3; j++) {
      const d = i * 0.05 + R() * 0.3, dur = 1.0 + R() * 0.7, dx = (R() - 0.5) * 64, alt = 70 + R() * 120, r = 1.8 + R() * 2.4;
      const a = age - d, u = a / dur;
      if (u <= 0 || u >= 1) continue;
      s += `<circle cx="${f(x + dx * u + Math.sin(a * 4 + i + j) * 5)}" cy="${f(y - alt * ease.out(u))}" r="${f(r * (1 - 0.4 * u))}" fill="${cores[(i + j) % 3]}" opacity="${f(0.85 * Math.sin(Math.PI * u))}"/>`;
    }
  });
  return s;
}
// trilha do emblema: sobe da base do pino até a margem direita, com as cinco marcas da régua
const TRX = u => PIN.x + 44 + u * 826, TRY = u => PIN.y - 3 - 93 * (0.35 * u + 0.65 * u * u);
const TRU = [0.13, 0.35, 0.57, 0.79, 1];
const TRD = Array.from({ length: 41 }, (_, k) => (k ? 'L' : 'M') + f(TRX(k / 40)) + ',' + f(TRY(k / 40))).join(' ');

export function desenhar(t, ctx) {
  const { t0, m, wa, T } = ctx;
  const iA = T.marcas.adocao.i, iC = T.marcas.constroi.i, iP = T.marcas.pessoa_por_pessoa.i;
  const tImp = m('adocao') - 0.03;                               // impacto: "Adoção"
  const tNao = wa(iA + 1) - 0.08, tSe1 = wa(iA + 2) - 0.08;      // "não", "se"
  const tBate = m('impoe') - 0.02, tCai = tBate - 0.16;          // "impõe." despenca e bate
  const tRisca = tBate + 0.26;                                   // o risco laranja
  const tSe = wa(iC - 1) - 0.06, tCons = m('constroi') - 0.06;   // "Se" e "constrói."
  const tP = [0, 1, 2].map(i => wa(iP + i) - 0.06);              // "Pessoa" "por" "pessoa."
  const tA2 = m('gestao') - 0.55, tGes = m('gestao') - 0.08;      // ato 2 (a tipografia sai antes, para o cartão já estar montado na fala)
  const tAlv = ctx.mb('mudanca_final') + 0.4;                     // a marca pessoal entra só na imagem, depois da última palavra da fala
  const TT = ctx.TOTAL;                                           // os instantes do quadro final são relativos ao fim do vídeo
  const tBar = i => tCons + 0.12 + i * 0.13;                      // cada barra cresce, da esquerda para a direita
  const tPin = i => tP[0] + 0.02 + i * 0.115, DQ = 0.22;         // cada pino cai (DQ = duração da queda)
  const tLin0 = tPin(0) + DQ, tLin1 = tPin(NB - 1) + DQ;         // a linha acompanha os pousos

  let s = fundoNoite(t, { seed: 9 });

  // ---------- câmera: soco de zoom e tremor nos impactos; aproxima na construção e abre para o cartão final ----------
  const [q1x, q1y] = tremor(t, tImp, 0.3, 8), [q2x, q2y] = tremor(t, tBate, 0.36, 14);
  const soco = (t > tImp ? 0.028 * Math.exp(-(t - tImp) * 8) : 0) + (t > tBate ? 0.042 * Math.exp(-(t - tBate) * 8) : 0);
  const zAto1 = 0.035 * ease.inOut(inv(tSe, tLin1, t)) * (1 - ease.inOut(inv(tA2 - 0.05, tA2 + 0.6, t)));
  const zFinal = 0.012 * ease.inOut(inv(TT - 3.2, TT - 0.1, t));         // empurrão lento e mínimo no quadro final

  // ================= GRÁFICO: grade, planta, barras, linha e pinos =================
  let e = '';
  const [px, py] = tremor(t, tBate, 0.42, 6);                    // a planta sente a pancada do "impõe."
  // cabeçalho, grade e linha de base
  {
    const u = ease.out(inv(t0 + 0.12, t0 + 0.8, t));
    e += desliza(fin(t, t0 + 0.2, 0.5), rotulo('Régua de adoção', MG, 822, { c: C.blue40, s: 22 }), -24);
    GRADE.forEach((y, k) => {
      const uk = ease.out(inv(t0 + 0.2 + k * 0.07, t0 + 0.9 + k * 0.07, t));
      if (uk > 0) e += `<rect x="${MG}" y="${y - 0.75}" width="${f((W - 2 * MG) * uk)}" height="1.5" fill="#fff" opacity=".1"/>`;
    });
    if (u > 0) e += `<rect x="${MG}" y="${YB}" width="${f((W - 2 * MG) * u)}" height="3" rx="1.5" fill="#fff" opacity=".42"/>`;
  }
  // nomes das marcas sob cada par de barras (acendem quando o par começa a subir)
  NIVEIS.forEach((nv, j) => {
    const k = fin(t, t0 + 0.4 + j * 0.07, 0.45), on = fin(t, tBar(2 * j), 0.4);
    const xc = (cxB(2 * j) + cxB(2 * j + 1)) / 2;
    if (k > 0) e += sobe(k, `<rect x="${f(xc - 1)}" y="${YB + 8}" width="2" height="8" fill="#fff" opacity=".35"/>`
      + txt(nv.rot, xc, YB + 46, { w: 700, s: 24, c: C.white, a: 'middle', o: lerp(0.45, 0.95, on) }), 12);
  });
  // topo de cada barra (com crescimento) e estado dos pinos
  const kB = [], hop = [], hopL = [], kP = [];
  for (let i = 0; i < NB; i++) {
    kB.push(t > tBar(i) ? backS(inv(tBar(i), tBar(i) + 0.5, t)) : 0);
    const a = tPin(i), u = inv(a, a + DQ, t), dl = t - a - DQ;
    let h = 0, hq = 0;
    if (t > a) {
      hq = (1 - u * u) * 190;                                                          // queda
      if (dl > 0) h += Math.abs(Math.sin(dl * 15)) * 15 * Math.exp(-dl * 7);          // quique curto no pouso
      h += Math.sin(Math.PI * inv(tGes + i * 0.05, tGes + 0.42 + i * 0.05, t)) * 36;   // salto em onda em "Gestão"
      h += Math.sin(Math.PI * inv(tAlv + i * 0.045, tAlv + 0.4 + i * 0.045, t)) * 20;  // onda menor no fim da fala
      h += (0.5 + 0.5 * Math.sin(t * 1.7 - i * 0.6)) * 3.5 * fin(t, 85.0, 0.8);        // respiração do quadro final
    }
    hop.push(h + hq);
    hopL.push(h);                                                                      // a linha não acompanha a queda, só o pouso e os saltos
    kP.push(t > a ? lerp(0.55, 1, ease.out(inv(a, a + 0.14, t))) : 0);
  }
  // área suave sob a linha (dá corpo à subida)
  const PL = Array.from({ length: NB }, (_, i) => [cxB(i), topo(i) - CAB - hopL[i]]);
  {
    const o = fin(t, tLin1 - 0.1, 0.7);
    if (o > 0) {
      let d = `M${f(PL[0][0])},${YB}`;
      PL.forEach(([x, y]) => { d += ` L${f(x)},${f(y)}`; });
      d += ` L${f(PL[NB - 1][0])},${YB}Z`;
      e += `<linearGradient id="fe-ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.blue40}" stop-opacity=".22"/><stop offset="1" stop-color="${C.blue40}" stop-opacity="0"/></linearGradient>`
        + `<path d="${d}" fill="url(#fe-ar)" opacity="${f(o)}"/>`;
    }
  }
  e += `<linearGradient id="fe-nv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.navy80}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>`;
  // planta tracejada (o que se quer construir) e barras
  for (let i = 0; i < NB; i++) {
    const nv = NIVEIS[i >> 1], k = kB[i];
    const ug = ease.out(inv(t0 + 0.12 + i * 0.04, t0 + 0.6 + i * 0.04, t)), og = 0.5 * (1 - clamp(k * 1.6));
    if (ug > 0 && og > 0.01) {
      const dp = t - tBate, q = dp > 0 ? Math.exp(-dp * 7) * Math.cos(dp * 21) : 0;   // encolhe com a pancada e volta
      e += `<path d="${dBarra(i, hB(i) * ug * (1 - 0.07 * q))}" transform="translate(${f(px)} ${f(py)})" fill="rgba(255,255,255,.035)" stroke="#fff" stroke-width="2" stroke-dasharray="7 9" stroke-dashoffset="${f(-t * 16)}" stroke-linecap="round" opacity="${f(og)}"/>`;
    }
    if (k <= 0.001) continue;
    const h = hB(i) * k, navy = nv.cor === C.navy;
    let b = `<path d="${dBarra(i, h)}" fill="${navy ? 'url(#fe-nv)' : nv.cor}"${navy ? ` stroke="${C.white}" stroke-width="2.5"` : ''}/>`
      + `<rect x="${f(bx(i) + 9)}" y="${f(YB - h + 8)}" width="${f(BW - 18)}" height="5" rx="2.5" fill="#fff" opacity=".22"/>`;
    const dl = t - tPin(i) - DQ;                                  // clarão quando o pino pousa
    if (dl > 0 && dl < 0.5) b += `<path d="${dBarra(i, h)}" fill="#fff" opacity="${f(0.4 * Math.exp(-dl * 9))}"/>`;
    const uo = inv(tGes + i * 0.05, tGes + 0.5 + i * 0.05, t);    // onda de luz nas barras em "Gestão"
    if (uo > 0 && uo < 1) b += `<path d="${dBarra(i, h)}" fill="#fff" opacity="${f(0.26 * Math.sin(Math.PI * uo))}"/>`;
    e += b;
  }
  // linha de tendência com brilho, ligando os pinos, e o pulso de luz que a percorre
  {
    const u = inv(tLin0, tLin1, t);
    if (u > 0) {
      const d = PL.map(([x, y], i) => (i ? 'L' : 'M') + f(x) + ',' + f(y)).join(' ');
      let l = tracar(d, u, { c: C.white, sw: 4.5 });
      if (u < 1) { const [x, y] = aoLongo(PL, u); l += `<circle cx="${f(x)}" cy="${f(y)}" r="13" fill="#fff" opacity=".3"/><circle cx="${f(x)}" cy="${f(y)}" r="6" fill="#fff"/>`; }
      for (const tp of [tLin1 + 0.08, tGes + 0.55, tAlv + 0.05, TT - 2.2, TT - 0.9]) {
        const up = inv(tp, tp + 1.05, t);
        if (up <= 0 || up >= 1) continue;
        const ue = ease.inOut(up), [x, y] = aoLongo(PL, ue), o = Math.sin(Math.PI * up);
        l += `<path d="${d}" fill="none" stroke="${C.orange80}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="${f(Math.min(0.14, ue))} 2" stroke-dashoffset="${f(-Math.max(0, ue - 0.14))}" opacity="${f(o)}"/>`;
        l += `<circle cx="${f(x)}" cy="${f(y)}" r="15" fill="${C.orange}" opacity="${f(0.35 * o)}"/><circle cx="${f(x)}" cy="${f(y)}" r="7" fill="${C.orange40}" opacity="${f(o)}"/>`;
      }
      e += brilho(l);
    }
  }
  // pinos: caem em cascata, um por barra
  for (let i = 0; i < NB; i++) {
    if (kP[i] <= 0) continue;
    const nv = NIVEIS[i >> 1], dl = t - tPin(i) - DQ;
    e += onda(cxB(i), topo(i), dl, { c: nv.cor === C.navy ? C.blue40 : nv.cor, r0: 8, r1: 30, sw: 3.5, d: 0.4 });
    const uq = inv(tPin(i), tPin(i) + DQ, t);
    if (uq > 0 && uq < 1) e += `<rect x="${f(cxB(i) - 1.5)}" y="${f(topo(i) - hop[i] - CAB - 26 - 110 * uq)}" width="3" height="${f(110 * uq)}" rx="1.5" fill="${nv.cor === C.navy ? C.blue40 : nv.cor}" opacity="${f(0.55 * uq)}"/>`;
    const pn = pinoMapa(cxB(i), topo(i), { cor: nv.cor, k: kP[i], s: SPIN });
    e += hop[i] > 0.01 ? `<g transform="translate(0 ${f(-hop[i])})">${pn}</g>` : pn;
  }

  // ================= ATO 1: tipografia cinética =================
  let tp = '';
  if (t < tA2 + 0.3) {
    // a negação entra ampliada; quando chega "Se constrói." ela recua, encolhe e apaga
    const uM = ease.inOut(inv(tSe - 0.27, tSe + 0.18, t));
    const tf = `translate(0 ${f(lerp(DYN, 0, uM))}) translate(${MG} ${Y2}) scale(${f(lerp(KN, 1, uM))}) translate(${-MG} ${-Y2})`;
    const oNeg = lerp(1, 0.46, uM);
    let a = '', fx = '';
    // fio de antecipação até o impacto
    {
      const u = ease.inOut(inv(t0 + 0.14, tImp, t)), v = ease.out(inv(tImp, tImp + 0.4, t));
      if (u > 0 && v < 1) fx += `<rect x="${MG}" y="${Y1 + 20}" width="${f(lerp(wL('Adoção não', S1) * u, 900, v))}" height="${f(lerp(3, 1.5, v))}" fill="#fff" opacity="${f(0.55 * (1 - v))}"/>`;
    }
    // "Adoção": bate grande e assenta
    if (t > tImp) {
      const w = wL('Adoção', S1), u = ease.out5(inv(tImp, tImp + 0.2, t)), cx = MG + w * 0.3;
      if (u < 1) a += opa(0.2 * (1 - u), esm(cx, Y1, lerp(2.1, 1, u), lerp(2.1, 1, u), tL('Adoção', MG, Y1, S1, C.blue40)));
      a += opa(clamp(u * 2.2), esm(cx, Y1, lerp(1.5, 1, u), lerp(1.5, 1, u), tL('Adoção', MG, Y1, S1, C.white)));
    }
    // "não" e "se": sobem por máscara
    a += sobeMasc('fe-na', Y1, S1, ease.out5(inv(tNao, tNao + 0.34, t)), tL('não', MG + wL('Adoção ', S1), Y1, S1, C.white));
    a += sobeMasc('fe-se', Y2, S1, ease.out5(inv(tSe1, tSe1 + 0.3, t)), tL('se', MG, Y2, S1, C.white));
    // "impõe.": despenca pesado, a tela treme, e a palavra é riscada e cede
    if (t > tCai) {
      const x = MG + wL('se ', S1), w = wL('impõe.', S1), cx = x + w / 2;
      const u = inv(tCai, tBate, t), dp = t - tBate, q = dp > 0 ? Math.exp(-dp * 9) * Math.cos(dp * 26) : 0;
      const ur = ease.out(inv(tRisca + 0.08, tRisca + 0.4, t));
      // cai em profundidade: encolhe de 1,55 para 1 acelerando, ancorada no meio da altura da palavra, para crescer
      // para a direita e para baixo sem atravessar a linha de cima
      const cai = (v, o) => `<g transform="translate(0 ${f(ur * 7)}) rotate(${f(ur * 2.4)} ${f(x)} ${f(Y2)})" opacity="${f(o)}">`
        + esm(v < 1 ? x : cx, v < 1 ? Y2 - 30 : Y2, lerp(1.55, 1, v * v) * (1 + 0.04 * q), lerp(1.55, 1, v * v) * (1 - 0.08 * q), tL('impõe.', x, Y2, S1, C.white)) + `</g>`;
      let pal = '';
      if (u < 1) pal += cai(Math.max(0, u - 0.3), 0.16 * u);
      pal += cai(u, clamp(u * 1.6) * lerp(1, 0.62, ur));
      a += pal;
      // clarão horizontal e poeira no impacto
      const uf = inv(tBate, tBate + 0.45, t);
      if (uf > 0 && uf < 1) {
        const L = lerp(w * 0.5, 1500, ease.out(uf));
        fx += `<rect x="${f(cx - L / 2)}" y="${f(Y2 + 27 - lerp(3, 0.8, uf))}" width="${f(L)}" height="${f(lerp(6, 1.6, uf))}" fill="${C.orange}" opacity="${f(1 - uf)}"/>`;
      }
      fx += particulas(7, cx - w * 0.3, Y2 + 24, dp, { n: 7, v: 130, r: 4.5, d: 0.55, cores: [C.white, C.navy20, C.orange40] })
        + particulas(8, cx + w * 0.3, Y2 + 24, dp, { n: 7, v: 130, r: 4.5, d: 0.55, cores: [C.white, C.navy20, C.orange40] });
      // risco laranja
      fx += opa(lerp(1, 0.9, uM), `<g transform="rotate(${f(ur * 2.4)} ${f(x)} ${f(Y2)}) translate(0 ${f(ur * 7)})">`
        + tracar(`M${f(x - 14)},${f(Y2 - 25)} Q${f(cx)},${f(Y2 - 40)} ${f(x + w + 6)},${f(Y2 - 33)}`, ease.out(inv(tRisca, tRisca + 0.2, t)), { c: C.orange, sw: 8 }) + `</g>`);
    }
    let b = `<g transform="${tf}">${opa(oNeg, a)}${fx}</g>`;
    // "Se constrói.": as letras sobem em cascata por trás da máscara, em laranja, e ganham o fio
    if (t > tSe) {
      const corpo = letras('Se', MG, Y3, S3, C.orange, t, tSe, 0.05) + letras('constrói.', MG + wL('Se ', S3), Y3, S3, C.orange, t, tCons, 0.036);
      b += `<clipPath id="fe-sc"><rect x="0" y="${f(Y3 - S3 * 0.98)}" width="${W}" height="${f(S3 * 1.26)}"/></clipPath><g clip-path="url(#fe-sc)">${corpo}</g>`;
      b += lustro('fe-ls', tL('Se constrói.', MG, Y3, S3, C.orange), MG, MG + wL('Se constrói.', S3), Y3, S3, ease.inOut(inv(tCons + 0.62, tCons + 1.3, t)));
      b += fio(MG, Y3 + 34, inv(tCons + 0.4, tCons + 0.9, t), 150, 7);
    }
    // "Pessoa por pessoa.": cada palavra sobe no seu instante
    ['Pessoa', 'por', 'pessoa.'].forEach((p, i) => {
      const x = MG + wL(['', 'Pessoa ', 'Pessoa por '][i], S4, -0.6);
      b += sobeMasc('fe-p' + i, Y4, S4, ease.out5(inv(tP[i], tP[i] + 0.34, t)), tL(p, x, Y4, S4, C.white, -0.6));
    });
    // saída: a tipografia sobe e some para dar lugar ao cartão final
    const sai = ease.inOut(inv(tA2, tA2 + 0.28, t));
    tp = sai >= 1 ? '' : sai <= 0 ? b : `<g transform="translate(0 ${f(-120 * sai)})" opacity="${f(1 - sai)}">${b}</g>`;
  }

  // ================= ATO 2: cartão final (sem logos) =================
  let c = '';
  if (t > tA2) {
    // pino-emblema: cai, assenta e fica pulsando de leve; dele sai a trilha da régua (cinco marcas subindo)
    {
      const tp0 = tA2 + 0.25, tq = tp0 + 0.2;
      if (t > tp0) {
        const u = inv(tp0, tq, t), cai = (1 - u * u) * 46;
        const dl = t - tq, q = dl > 0 ? Math.exp(-dl * 8) * Math.cos(dl * 22) : 0;
        const viva = dl > 0 ? Math.sin(t * 2.2) * 2.5 * clamp(dl - 0.6) : 0;
        const K = PIN.k;
        c += `<ellipse cx="${PIN.x}" cy="${PIN.y + 4}" rx="${f(28 * clamp(u) - viva)}" ry="${f(7 * clamp(u))}" fill="#fff" opacity=".16"/>`;
        if (dl > 0.6) { const ph = ((t - tq) % 2.6) / 2.6; c += `<ellipse cx="${PIN.x}" cy="${PIN.y + 4}" rx="${f(28 + 44 * ease.out(ph))}" ry="${f(7 + 11 * ease.out(ph))}" fill="none" stroke="${C.orange}" stroke-width="3" opacity="${f(0.55 * (1 - ph))}"/>`; }
        c += onda(PIN.x, PIN.y - 4, dl, { c: C.orange, r0: 14, r1: 44, sw: 4, d: 0.45 });
        // trilha da régua: tracejado correndo, as cinco marcas e um pulso de luz que a percorre
        const ut = ease.inOut(inv(tq + 0.1, tq + 1.0, t));
        c += revela('fe-tr', PIN.x + 36, PIN.y - 130, 880, 150, ut, `<path d="${TRD}" fill="none" stroke="${C.white}" stroke-width="3" stroke-dasharray="3 12" stroke-dashoffset="${f(-t * 14)}" stroke-linecap="round" opacity=".5"/>`);
        TRU.forEach((ui, i) => {
          const kk = back(t, tq + 0.22 + i * 0.16, 0.38), x = TRX(ui), y = TRY(ui);
          if (kk > 0.001) c += pop(kk, x, y, `<circle cx="${f(x)}" cy="${f(y)}" r="${f(10.5 + i * 1.4)}" fill="${NIVEIS[i].cor === C.navy ? 'url(#fe-nv)' : NIVEIS[i].cor}" stroke="${C.white}" stroke-width="3"/>`);
        });
        for (const tpl of [tq + 1.15, tAlv + 0.65, TT - 1.6]) {
          const up = inv(tpl, tpl + 1.1, t);
          if (up <= 0 || up >= 1) continue;
          const ue = ease.inOut(up), o = Math.sin(Math.PI * up);
          c += `<circle cx="${f(TRX(ue))}" cy="${f(TRY(ue))}" r="12" fill="${C.orange}" opacity="${f(0.5 * o)}"/><circle cx="${f(TRX(ue))}" cy="${f(TRY(ue))}" r="5.5" fill="${C.orange20}" opacity="${f(clamp(o * 1.8))}"/>`;
        }
        c += opa(clamp(u * 2.5), brilho(`<g transform="translate(${PIN.x} ${f(PIN.y - cai - viva)}) scale(${f(K * lerp(0.6, 1, u) * (1 + 0.1 * q))} ${f(K * lerp(0.6, 1, u) * (1 - 0.14 * q))})">`
          + `<path d="M0,0 C-7,-12 -22,-24 -22,-42 A22,22 0 1 1 22,-42 C22,-24 7,-12 0,0Z" fill="${C.orange}" stroke="${C.white}" stroke-width="3"/>`
          + `<path d="M-13,-50 a14,14 0 0 1 13,-12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`
          + `<circle cx="0" cy="-42" r="9.5" fill="${C.white}"/></g>`));
      }
    }
    // título
    const tT = tA2 + 0.22;
    c += sobeMasc('fe-t1', TY1, ST, ease.out5(inv(tT, tT + 0.55, t)), txt('Mapa de Perfil Cognitivo', MG, TY1, { f: 'L', s: ST, c: C.white, ls: -0.8 }));
    c += sobeMasc('fe-t2', TY2, ST, ease.out5(inv(tT + 0.1, tT + 0.65, t)), txt('Mapa de Adoção', MG, TY2, { f: 'L', s: ST, c: C.orange, ls: -0.8 }));
    c += lustro('fe-lt', txt('Mapa de Adoção', MG, TY2, { f: 'L', s: ST, ls: -0.8 }), MG, MG + larg('Mapa de Adoção', ST, { f: 'L', ls: -0.8 }), TY2, ST,
      Math.max(ease.inOut(inv(tAlv + 1.0, tAlv + 1.8, t)), t > TT - 1.5 ? ease.inOut(inv(TT - 1.4, TT - 0.6, t)) : 0), 0.5);
    c += fio(MG, FY, inv(tT + 0.5, tT + 1.0, t), 110, 6);
    // rótulo da prática, em 'gestao'
    {
      const A = 'Gestão da Mudança', B = 'Change Management', wA = larg(A, SLAB, { w: 700 }), xf = MG + wA + 20;
      c += sobeMasc('fe-la', LAB, SLAB, ease.out5(inv(tGes - 0.02, tGes + 0.38, t)), txt(A, MG, LAB, { w: 700, s: SLAB, c: C.white }));
      const uf = ease.out(inv(tGes + 0.16, tGes + 0.48, t));
      if (uf > 0) c += `<rect x="${f(xf - 1.25)}" y="${f(LAB - 10 - 16 * uf)}" width="2.5" height="${f(32 * uf)}" rx="1" fill="${C.orange}"/>`;
      c += desliza(fin(t, tGes + 0.24, 0.45), txt(B, xf + 20, LAB, { w: 700, s: SLAB, c: C.white }), -26);
    }
    // frase-síntese
    const tF = tGes - 0.16;                                       // sobe em cascata logo depois do título, antes do rótulo
    c += sobe(fin(t, tF, 0.45), txt('Adoção não se impõe.', MG, FR1, { f: 'L', s: SF, c: C.white }), 24);
    c += sobe(fin(t, tF + 0.1, 0.45), txt('Se constrói, pessoa por pessoa.', MG, FR2, { f: 'L', s: SF, c: C.orange }), 24);
    // marca pessoal (não é falada): monograma + nome + papel
    {
      const kM = back(t, tAlv, 0.5), cxm = MG + 34, cym = CTA + 10;
      if (kM > 0.001) {
        c += pop(kM, cxm, cym, `<circle cx="${cxm}" cy="${cym}" r="34" fill="${C.orange}"/>` + txt('VV', cxm, cym + 11, { w: 700, s: 30, c: C.navy, a: 'middle', ls: 0.5 }));
        c += onda(cxm, cym, t - tAlv - 0.1, { c: C.orange, r0: 34, r1: 30, sw: 3, d: 0.6 });
      }
      c += sobeMasc('fe-vn', CTA + 4, 40, ease.out5(inv(tAlv + 0.08, tAlv + 0.5, t)), txt('Victor Vitorino', MG + 86, CTA + 4, { w: 700, s: 38, c: C.white }));
      c += desliza(fin(t, tAlv + 0.5, 0.45), txt('Consultor de Change Management', MG + 86, CTA + 38, { s: 26, c: C.navy20 }), -22);
    }
  }

  // em "Gestão", poeira de luz sobe dos pinos (sem confete: o tom é sóbrio); termina antes do quadro final
  e += poeira(t, tGes + 0.1, Array.from({ length: NB }, (_, i) => [cxB(i), topo(i) - CAB - 14]));
  s += camera(e + tp + c, { z: 1 + soco + zAto1 + zFinal, dx: q1x + q2x, dy: q1y + q2y });
  return s;
}
