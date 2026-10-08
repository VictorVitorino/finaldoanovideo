// Grafismos no estilo do explainer SpecForge: adesivos, carimbos, bilhetes, cartões,
// cartelas de texto e efeitos "anime action". Funções puras da idade (s desde a entrada)
// que devolvem SVG em coordenadas de tela 1920x1080. (x, y) é o centro, salvo indicação.
import { tr, g, op, clamp, lerp, inv, ease, bump, kf, rng, hash, text, measure, wrap, n2, esc, TAU, noise } from '../core.js';
import { logo, logoSize } from '../assets.js';

const TINTA = '#2b2b36';
export const COR = {
  tinta: TINTA, navy: '#0c2f57', azul: '#0b5ed7', totvs: '#1f6fd6', ambar: '#f2b84b', laranja: '#e8891a',
  verde: '#1f9d57', vermelho: '#d9443f', creme: '#fcf8ee', branco: '#fffdf8', papel: '#f4ecdf',
  amarelo: '#fde9a6', amarelo2: '#f4c44e', cinza: '#7b7f8e', cinza2: '#c9c3b6', sombra: 'rgba(43,30,10,.17)',
};
const TOM = { verde: COR.verde, laranja: COR.laranja, vermelho: COR.vermelho, azul: COR.azul, navy: COR.navy, ambar: COR.ambar };

// ---------- utilidades ----------
const F = (peso, tam, fam = 'Outfit') => `${peso} ${tam}px ${fam === 'Outfit' ? 'Outfit' : '"' + fam + '"'}`;
const larg = (s, peso, tam, fam, ls = 0) => measure(s, F(peso, tam, fam)) + ls * Math.max(0, [...s].length - 1);
const uid = (pref, ...p) => pref + hash(p.join('|')).toString(36);
const rr = (x, y, w, h, r, a) => `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(r)}" ${a}/>`;
const contorno = (sw = 3) => `stroke="${TINTA}" stroke-width="${sw}" stroke-linejoin="round"`;
// cartão base: sombra curta + corpo com contorno de tinta
const caixa = (x, y, w, h, r, fill, sw = 3, dy = 6) =>
  rr(x, y + dy, w, h, r, `fill="${COR.sombra}"`) + rr(x, y, w, h, r, `fill="${fill}" ${contorno(sw)}`);
export function mistura(a, b, k) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
}
// saída opcional (o.fim = idade em que começa a sair)
const saida = (idade, o, d = 0.25) => (o.fim == null ? 1 : 1 - ease.in(inv(o.fim, o.fim + d, idade)));
const popS = (u, de = 0) => lerp(de, 1, ease.back(clamp(u)));
const quadro = idade => Math.floor(idade * 12); // animação "em dois" (12 qps), estilo anime

// ---------- ícones (centrados em 0,0; caixa ~s) ----------
export function icone(nome, s, cor = '#fff', fundo = TINTA) {
  const k = v => n2(v * s), sw = n2(s * 0.13);
  const st = `fill="none" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  switch (nome) {
    case 'check': return `<path d="M${k(-0.28)} ${k(0.02)} L${k(-0.08)} ${k(0.22)} L${k(0.3)} ${k(-0.2)}" ${st}/>`;
    case 'x': return `<path d="M${k(-0.2)} ${k(-0.2)} L${k(0.2)} ${k(0.2)} M${k(0.2)} ${k(-0.2)} L${k(-0.2)} ${k(0.2)}" ${st}/>`;
    case 'pessoa': return `<circle cx="0" cy="${k(-0.13)}" r="${k(0.15)}" fill="${cor}"/><path d="M${k(-0.27)} ${k(0.3)} Q${k(-0.27)} ${k(0.05)} 0 ${k(0.05)} Q${k(0.27)} ${k(0.05)} ${k(0.27)} ${k(0.3)} Z" fill="${cor}"/>`;
    case 'engrenagem': {
      let d = '';
      for (let i = 0; i < 32; i++) {
        const a = (i / 32) * TAU, r = (Math.floor(i / 2) % 2 ? 0.25 : 0.34) * s;
        d += `${i ? 'L' : 'M'}${n2(Math.cos(a) * r)} ${n2(Math.sin(a) * r)} `;
      }
      return `<path d="${d}Z" fill="${cor}"/><circle r="${k(0.1)}" fill="${fundo}"/>`;
    }
    case 'erp': return `<ellipse cx="0" cy="${k(-0.2)}" rx="${k(0.27)}" ry="${k(0.09)}" ${st}/><path d="M${k(-0.27)} ${k(-0.2)} V${k(0.2)} A${k(0.27)} ${k(0.09)} 0 0 0 ${k(0.27)} ${k(0.2)} V${k(-0.2)} M${k(-0.27)} 0 A${k(0.27)} ${k(0.09)} 0 0 0 ${k(0.27)} 0" ${st}/>`;
    case 'telefone': return `<path d="M${k(-0.3)} ${k(-0.2)} Q${k(-0.3)} ${k(-0.34)} ${k(-0.17)} ${k(-0.32)} L${k(-0.06)} ${k(-0.12)} Q${k(-0.06)} ${k(-0.04)} ${k(-0.14)} ${k(-0.01)} Q${k(-0.06)} ${k(0.1)} ${k(0.02)} ${k(0.15)} Q${k(0.06)} ${k(0.07)} ${k(0.13)} ${k(0.07)} L${k(0.32)} ${k(0.18)} Q${k(0.34)} ${k(0.32)} ${k(0.2)} ${k(0.33)} Q${k(-0.32)} ${k(0.26)} ${k(-0.3)} ${k(-0.2)} Z" fill="${cor}"/>`;
    case 'alerta': return `<path d="M0 ${k(-0.3)} L${k(0.3)} ${k(0.24)} H${k(-0.3)} Z" fill="${cor}" stroke="${cor}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M0 ${k(-0.1)} V${k(0.06)}" stroke="${fundo}" stroke-width="${sw}" stroke-linecap="round"/><circle cy="${k(0.15)}" r="${k(0.035)}" fill="${fundo}"/>`;
    case 'doc': return `<rect x="${k(-0.22)}" y="${k(-0.28)}" width="${k(0.44)}" height="${k(0.56)}" rx="${k(0.06)}" ${st}/><path d="M${k(-0.1)} ${k(-0.1)} H${k(0.1)} M${k(-0.1)} ${k(0.04)} H${k(0.1)} M${k(-0.1)} ${k(0.16)} H${k(0.03)}" ${st}/>`;
    case 'globo': return `<circle r="${k(0.29)}" ${st}/><path d="M${k(-0.29)} 0 H${k(0.29)} M0 ${k(-0.29)} Q${k(-0.2)} 0 0 ${k(0.29)} Q${k(0.2)} 0 0 ${k(-0.29)}" ${st}/>`;
    case 'raio': return `<path d="M${k(0.06)} ${k(-0.32)} L${k(-0.18)} ${k(0.04)} H${k(0)} L${k(-0.06)} ${k(0.32)} L${k(0.18)} ${k(-0.04)} H${k(0)} Z" fill="${cor}" stroke="${cor}" stroke-width="${n2(s * 0.05)}" stroke-linejoin="round"/>`;
    default: return '';
  }
}

// logo com altura ajustada: marcas quase quadradas (FUNED, John Deere, Libercon) ganham altura extra
function logoAj(nome, x, y, h, maxW, hMax = h * 1.5) {
  const L = logoSize(nome, 100);
  const k = L.w / L.h < 1.6 ? 1.45 : 1;
  return logo(nome, x, y, Math.min(h * k, hMax), maxW);
}
const logoAjSize = (nome, h, maxW, hMax = h * 1.5) => {
  const L = logoSize(nome, 100);
  return logoSize(nome, Math.min(h * (L.w / L.h < 1.6 ? 1.45 : 1), hMax), maxW);
};

// estrelinha de 4 pontas (brilho)
const brilho4 = (r, fill, sw = 0) => {
  const a = r * 0.22;
  return `<path d="M0 ${n2(-r)} Q${n2(a)} ${n2(-a)} ${n2(r)} 0 Q${n2(a)} ${n2(a)} 0 ${n2(r)} Q${n2(-a)} ${n2(a)} ${n2(-r)} 0 Q${n2(-a)} ${n2(-a)} 0 ${n2(-r)} Z" fill="${fill}"${sw ? ` ${contorno(sw)}` : ''}/>`;
};
// três risquinhos de "estalo" (como os do SpecForge), centrados em 0,0 apontando para ang
function estalo(u, ang = -45, r0 = 0, cor = TINTA, s = 1) {
  if (u <= 0 || u >= 1) return '';
  const a = ease.out(u), r1 = r0 + 10 * s + 22 * s * a, r2 = r1 + 18 * s * (1 - u);
  let d = '';
  for (const da of [-28, 0, 28]) {
    const t = ((ang + da) * Math.PI) / 180;
    d += `M${n2(Math.cos(t) * r1)} ${n2(Math.sin(t) * r1)} L${n2(Math.cos(t) * r2)} ${n2(Math.sin(t) * r2)} `;
  }
  return `<path d="${d}" stroke="${cor}" stroke-width="${n2(4 * s)}" stroke-linecap="round"/>`;
}

// ---------- defs compartilhados ----------
export const TEL = {
  A: '0,0 1000,0 920,1080 0,1080',
  B: '1000,0 1920,0 1920,1080 920,1080',
};
export function defs() {
  return `<radialGradient id="gfVinheta" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>`
    + `<linearGradient id="gfLuz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<pattern id="gfListras" patternUnits="userSpaceOnUse" width="36" height="36" patternTransform="rotate(45)"><rect width="36" height="36" fill="${COR.ambar}"/><rect width="18" height="36" fill="${TINTA}"/></pattern>`
    + `<filter id="gfBrilho" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>`
    + `<clipPath id="gfTelA"><polygon points="${TEL.A}"/></clipPath><clipPath id="gfTelB"><polygon points="${TEL.B}"/></clipPath>`;
}

// =====================================================================
// ADESIVO — palavra de impacto inclinada (ex.: "NO CHUTE!")
// o: cor, tam, rot, tinta (texto escuro), tremida, fim
export function adesivo(texto, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const tam = o.tam ?? 96, cor = o.cor ?? COR.laranja, ls = o.ls ?? -tam * 0.02;
  const tw = larg(texto, 900, tam, 'Outfit', ls);
  const w = tw + tam * 0.72, h = tam * 1.22, r = h * 0.2;
  const s = kf(idade, [[0, 0], [0.13, 1.17, ease.out], [0.23, 0.93], [0.33, 1.03], [0.42, 1]]) * saida(idade, o);
  if (s <= 0.001) return '';
  const R = rng(hash(texto));
  const amort = Math.exp(-idade * 7);
  const rot = (o.rot ?? -4) + 7 * amort * Math.sin(idade * 34);
  const tq = o.tremida ?? 0.7, fq = quadro(idade);
  const jx = (noise(fq * 1.3, 2) * tq) + (R() - 0.5) * 0, jy = noise(fq * 1.7, 5) * tq;
  const sombra = mistura(cor, TINTA, 0.45);
  let b = rr(-w / 2, -h / 2 + tam * 0.09, w, h, r, `fill="${sombra}" ${contorno(Math.max(3, tam * 0.04))}`)
    + rr(-w / 2, -h / 2, w, h, r, `fill="${cor}" ${contorno(Math.max(3, tam * 0.04))}`)
    + rr(-w / 2 + tam * 0.12, -h / 2 + tam * 0.1, w - tam * 0.24, tam * 0.1, tam * 0.05, `fill="#fff" opacity=".22"`)
    + text(texto, 0, tam * 0.35, { size: tam, weight: 900, fill: o.tinta ? TINTA : '#fff', ls: n2(ls) });
  b += g(tr(w / 2 + 6, -h / 2 - 4), estalo(inv(0.08, 0.5, idade), -40, 0, TINTA, tam / 90));
  return g(tr(x + jx, y + jy, s, rot), b);
}

// =====================================================================
// CARIMBO — bate grande → normal com tranco; tinta falhada
// o: cor ('verde'|'laranja'|'vermelho'|hex), tam, rot, icone ('check'|'x'|null), fundo, id
export function carimbo(texto, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const cor = TOM[o.cor] ?? o.cor ?? COR.verde;
  const tam = o.tam ?? 54, ls = tam * 0.06;
  const ic = o.icone !== undefined ? o.icone : cor === COR.verde ? 'check' : cor === COR.vermelho ? 'x' : null;
  const tw = larg(texto, 900, tam, 'Outfit', ls), icW = ic ? tam * 0.95 : 0;
  const w = tw + icW + tam * 0.75, h = tam * 1.5;
  const s = kf(idade, [[0, 2.5], [0.11, 0.92, ease.in], [0.19, 1.04, ease.out], [0.27, 1]]) * saida(idade, o);
  if (s <= 0.001) return '';
  const a = inv(0, 0.06, idade);
  const imp = inv(0.11, 0.3, idade), tq = idade > 0.11 ? (1 - imp) * 7 : 0;
  const R0 = rng(quadro(idade) + 11);
  const dx = (R0() - 0.5) * tq, dy = (R0() - 0.5) * tq;
  const rot = (o.rot ?? -8) - 12 * (1 - ease.out(inv(0, 0.11, idade)));
  const id = o.id ?? uid('gfCb', texto, x, y);
  const tinta = mistura(cor, TINTA, 0.12);
  // máscara de tinta falhada (determinística)
  const R = rng(hash(texto) + 7);
  let falhas = '';
  for (let i = 0; i < 46; i++) falhas += `<circle cx="${n2((R() - 0.5) * w)}" cy="${n2((R() - 0.5) * h)}" r="${n2(0.8 + R() * R() * 4.5)}" fill="#000"/>`;
  for (let i = 0; i < 5; i++) {
    const yy = (R() - 0.5) * h * 0.8, xx = (R() - 0.5) * w;
    falhas += `<rect x="${n2(xx)}" y="${n2(yy)}" width="${n2(30 + R() * 70)}" height="${n2(1.5 + R() * 2)}" fill="#000" opacity=".7" transform="rotate(${n2((R() - 0.5) * 16)} ${n2(xx)} ${n2(yy)})"/>`;
  }
  const mask = `<mask id="${id}" maskUnits="userSpaceOnUse" x="${n2(-w)}" y="${n2(-h)}" width="${n2(w * 2)}" height="${n2(h * 2)}"><rect x="${n2(-w)}" y="${n2(-h)}" width="${n2(w * 2)}" height="${n2(h * 2)}" fill="#fff"/>${falhas}</mask>`;
  const x0 = -w / 2 + tam * 0.375;
  let tinta2 = rr(-w / 2, -h / 2, w, h, tam * 0.18, `fill="none" stroke="${tinta}" stroke-width="${n2(tam * 0.1)}"`)
    + rr(-w / 2 + tam * 0.16, -h / 2 + tam * 0.16, w - tam * 0.32, h - tam * 0.32, tam * 0.09, `fill="none" stroke="${tinta}" stroke-width="${n2(tam * 0.035)}"`)
    + (ic ? g(tr(x0 + icW * 0.38, 0), icone(ic, tam * 1.05, tinta)) : '')
    + text(texto, x0 + icW + tw / 2, tam * 0.35, { size: tam, weight: 900, fill: tinta, ls: n2(ls) });
  let b = mask + rr(-w / 2, -h / 2, w, h, tam * 0.18, `fill="${o.fundo ?? 'rgba(255,253,248,.88)'}"`) + `<g mask="url(#${id})">${tinta2}</g>`;
  // respingos no impacto
  const u = inv(0.11, 0.4, idade);
  if (u > 0 && u < 1) {
    const Rs = rng(hash(texto) + 3);
    for (let i = 0; i < 8; i++) {
      const ang = Rs() * TAU, d0 = Math.max(w, h) * 0.5;
      const d = d0 + 50 * ease.out(u) * (0.6 + Rs() * 0.6);
      b += `<circle cx="${n2(Math.cos(ang) * d * (w / Math.max(w, h)))}" cy="${n2(Math.sin(ang) * d * 0.55)}" r="${n2((2 + Rs() * 4) * (1 - u))}" fill="${tinta}"/>`;
    }
  }
  return op(a, g(tr(x + dx, y + dy, s, rot), b));
}

// =====================================================================
// BILHETE — nota amarela com faixa
// o: w, rot, icone, fim
export function bilhete(titulo, texto, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const w = o.w ?? 320, fs = F(800, 28), lh = 34;
  const linhas = wrap(texto, fs, w - 48);
  const h = 74 + linhas.length * lh + 20;
  const u = inv(0, 0.5, idade);
  const s = popS(u, 0.6) * saida(idade, o);
  if (s <= 0.001) return '';
  const rot = (o.rot ?? -3) + 12 * (1 - ease.back(u)) * Math.cos(idade * 9);
  const dy = -50 * (1 - ease.out(u));
  const x0 = -w / 2, y0 = -h / 2, r = 10;
  let b = rr(x0, y0 + 6, w, h, r, `fill="${COR.sombra}"`)
    + rr(x0, y0, w, h, r, `fill="${COR.amarelo}"`)
    + `<path d="M${x0} ${y0 + 18} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} H${-x0 - r} Q${-x0} ${y0} ${-x0} ${y0 + r} V${y0 + 18} Z" fill="${COR.amarelo2}"/>`
    + `<path d="M${x0} ${y0 + 18} H${-x0}" stroke="${mistura(COR.amarelo2, TINTA, 0.25)}" stroke-width="1.5"/>`
    + rr(x0, y0, w, h, r, `fill="none" ${contorno(3)}`);
  const cl = '#7a6331';
  b += g(tr(x0 + 36, y0 + 48), icone(o.icone ?? 'doc', 24, cl))
    + text(titulo.toUpperCase(), x0 + 54, y0 + 56, { size: 19, weight: 800, fill: cl, anchor: 'start', ls: '2.4' });
  linhas.forEach((l, i) => (b += text(l, x0 + 26, y0 + 98 + i * lh, { size: 28, weight: 800, anchor: 'start' })));
  return op(inv(0, 0.12, idade), g(tr(x, y + dy, s, rot), b));
}

// =====================================================================
// CHIP — pílula com ícone
// o: icone, cor (círculo do ícone), solido (pílula na cor, texto branco), h, ancora ('middle'|'start'), fim
export function chipLargura(texto, o = {}) {
  const h = o.h ?? 52;
  return (o.icone === null ? h * 0.5 : h + 2) + larg(texto, 700, h * 0.46, 'DM Sans') + h * 0.46;
}
export function chip(texto, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const h = o.h ?? 52, ic = o.icone === undefined ? 'check' : o.icone, cor = o.cor ?? COR.azul;
  const w = chipLargura(texto, o);
  const u = inv(0, 0.32, idade);
  const s = popS(u, 0.5) * saida(idade, o);
  if (s <= 0.001) return '';
  const cx = o.ancora === 'start' ? x + w / 2 : x;
  const fill = o.solido ? cor : COR.branco, tf = o.solido ? '#fff' : TINTA;
  let b = caixa(-w / 2, -h / 2, w, h, h / 2, fill, 2.5, 4);
  let tx = -w / 2 + h * 0.5;
  if (ic) {
    const ir = h / 2 - 7;
    b += `<circle cx="${n2(-w / 2 + h / 2)}" cy="0" r="${n2(ir)}" fill="${o.solido ? '#fff' : cor}"/>` + g(tr(-w / 2 + h / 2, 0), icone(ic, ir * 1.7, o.solido ? cor : '#fff', o.solido ? '#fff' : cor));
    tx = -w / 2 + h + 2;
  }
  b += text(texto, tx, h * 0.16, { family: 'DM Sans', size: n2(h * 0.46), weight: 700, fill: tf, anchor: 'start' });
  return op(inv(0, 0.1, idade), g(tr(cx, y + 12 * (1 - ease.out(u)), s), b));
}

// =====================================================================
// CARTÃO — creme com contorno; o.cabecalho = título numa aba preta
// o: cabecalho, estilo ('aba'|'faixa'), prendedor (aba de prancheta), cor, conteudo (string ou fn(w,h), origem no canto sup. esq.), rot, fim
export function cartao(x, y, w, h, idade, o = {}) {
  if (idade < 0) return '';
  const u = inv(0, 0.45, idade);
  const s = lerp(0.88, 1, ease.back(u)) * saida(idade, o);
  if (s <= 0.001) return '';
  const x0 = -w / 2, y0 = -h / 2;
  let b = caixa(x0, y0, w, h, 18, o.cor ?? COR.creme, 3, 7);
  if (o.prendedor) b += rr(-38, y0 - 12, 76, 22, 8, `fill="${TINTA}"`);
  const conteudo = typeof o.conteudo === 'function' ? o.conteudo(w, h) : o.conteudo ?? '';
  if (conteudo) b += g(tr(x0, y0), conteudo);
  if (o.cabecalho) {
    const tt = o.cabecalho.toUpperCase(), ts = o.tamCab ?? 22, tw = larg(tt, 800, ts, 'Outfit', 2) + 36;
    const corAba = o.corAba ?? TINTA;
    if (o.estilo === 'faixa') {
      const fw = Math.max(tw + 20, w * 0.72);
      b += g(tr(x0 - 8, y0 - 20), rr(0, 4, fw, ts + 26, 9, `fill="${COR.sombra}"`) + rr(0, 0, fw, ts + 26, 9, `fill="${corAba}"`)
        + text(tt, 18, ts + 6, { size: ts, weight: 800, fill: '#fff', anchor: 'start', ls: '2' }));
    } else {
      b += g(tr(x0 + 22, y0 - 14, 1, -4), rr(0, 3, tw, ts + 18, 8, `fill="${COR.sombra}"`) + rr(0, 0, tw, ts + 18, 8, `fill="${corAba}"`)
        + text(tt, tw / 2, ts + 2, { size: ts, weight: 800, fill: '#fff', ls: '2' }));
    }
  }
  return op(inv(0, 0.15, idade), g(tr(x, y + 26 * (1 - ease.out(u)), s, o.rot ?? 0), b));
}

// =====================================================================
// CHECKLIST — marca ✓ em sequência
// o: w, tempos[i] (idade da marcação), marcas[i] ('ok'|'x'|null), cor, fim
export function checklist(titulo, itens, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const w = o.w ?? 560, rh = 56, topo = 88;
  const h = topo + itens.length * rh + 22;
  const cor = o.cor ?? COR.verde;
  const conteudo = () => {
    let c = rr(32, 40, 10, 22, 3, `fill="${COR.laranja}"`) + text(titulo.toUpperCase(), 52, 59, { size: 24, weight: 900, anchor: 'start', ls: '2.6' });
    itens.forEach((it, i) => {
      const yy = topo + i * rh + rh / 2;
      const ti = o.tempos?.[i] ?? 0.6 + i * 0.45;
      const m = o.marcas?.[i] === undefined ? 'ok' : o.marcas[i];
      const k = idade - ti;
      const a = m ? clamp(k / 0.18) : 0;
      const ruim = m === 'x';
      // destaque da linha no momento da marcação
      const hl = ruim ? clamp(k / 0.2) : bump(idade, ti - 0.05, 0.8) * 0.9;
      if (hl > 0.01) c += op(hl, rr(18, yy - rh / 2 + 4, w - 36, rh - 8, 10, ruim ? `fill="#fdf0e2" stroke="${COR.laranja}" stroke-width="2.5"` : `fill="#fff3c9"`));
      const bs = 1 + 0.28 * bump(idade, ti, 0.22);
      let box;
      if (a > 0) {
        const cc = ruim ? COR.laranja : cor;
        const d = ruim ? `M-7 -7 L7 7 M7 -7 L-7 7` : `M-8 0.5 L-2.5 6.5 L8.5 -6`;
        box = rr(-16, -16, 32, 32, 8, `fill="${cc}" ${contorno(2.5)}`)
          + `<path d="${d}" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n2(1 - ease.out(a))}"/>`;
      } else box = rr(-16, -16, 32, 32, 8, `fill="#fff" ${contorno(2.5)}`);
      c += g(tr(50, yy, bs), box);
      c += text(it, 82, yy + 10, { family: 'DM Sans', size: 28, weight: 700, anchor: 'start' });
      if (ruim && k > 0) c += g(tr(w - 44, yy), `<circle r="${n2(15 * popS(k / 0.3))}" fill="${COR.ambar}" ${contorno(2.5)}/>` + op(clamp(k / 0.2), text('?', 0, 8, { size: 22, weight: 900 })));
    });
    return c;
  };
  return cartao(x, y, w, h, idade, { prendedor: true, conteudo, fim: o.fim });
}

// =====================================================================
// BALÃO COM LOGO — (x, y) = ponta do rabicho; fica acima da cabeça
// o: h (altura do logo), maxW, fim
export function balaoLogo(nomeLogo, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const L = logoAjSize(nomeLogo, o.h ?? 52, o.maxW ?? 190);
  const bw = Math.max(L.w + 48, 120), bh = L.h + 36, cauda = 22, r = 18;
  const s = popS(inv(0, 0.38, idade)) * saida(idade, o);
  if (s <= 0.001) return '';
  const bob = Math.sin(idade * 2.6) * 3 * clamp(idade / 0.5);
  const l = -bw / 2, rgt = bw / 2, bot = -cauda, top = bot - bh;
  const d = `M${n2(l + r)} ${n2(top)} H${n2(rgt - r)} A${r} ${r} 0 0 1 ${n2(rgt)} ${n2(top + r)} V${n2(bot - r)} A${r} ${r} 0 0 1 ${n2(rgt - r)} ${n2(bot)} H14 L1 0 L-12 ${n2(bot)} H${n2(l + r)} A${r} ${r} 0 0 1 ${n2(l)} ${n2(bot - r)} V${n2(top + r)} A${r} ${r} 0 0 1 ${n2(l + r)} ${n2(top)} Z`;
  const b = `<path d="${d}" fill="${COR.sombra}" transform="translate(0 6)"/><path d="${d}" fill="#fff" ${contorno(3)}/>` + logoAj(nomeLogo, 0, top + bh / 2, o.h ?? 52, o.maxW ?? 190);
  return g(tr(x, y + bob, s), b);
}

// =====================================================================
// PLACA DE NOME — plaquinha creme: nome em negrito e linha cinza
// o: cor (faixinha lateral), tam, fim
export function placaNome(nome, sub, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const tam = o.tam ?? 30, st = Math.round(tam * 0.66);
  const nw = larg(nome, 800, tam), sw = sub ? larg(sub, 700, st, 'DM Sans') : 0;
  const fx = o.cor ? 14 : 0;
  const w = Math.max(nw, sw) + 44 + fx, h = sub ? tam * 2.5 : tam * 1.95;
  const u = inv(0, 0.36, idade);
  const s = popS(u, 0.6) * saida(idade, o);
  if (s <= 0.001) return '';
  const x0 = -w / 2, y0 = -h / 2, cx = x0 + fx + (w - fx) / 2;
  let b = caixa(x0, y0, w, h, 12, COR.creme, 2.5, 5);
  if (o.cor) b += `<path d="M${n2(x0 + 12)} ${n2(y0)} H${n2(x0 + fx + 2)} V${n2(-y0)} H${n2(x0 + 12)} A12 12 0 0 1 ${n2(x0)} ${n2(-y0 - 12)} V${n2(y0 + 12)} A12 12 0 0 1 ${n2(x0 + 12)} ${n2(y0)} Z" fill="${o.cor}"/>` + rr(x0, y0, w, h, 12, `fill="none" ${contorno(2.5)}`);
  if (sub) {
    b += text(nome, cx, y0 + tam * 1.12, { size: tam, weight: 800 });
    b += text(sub, cx, y0 + tam * 1.12 + st * 1.38, { family: 'DM Sans', size: st, weight: 700, fill: COR.cinza });
  } else {
    b += text(nome, cx, y0 + tam * 1.1, { size: tam, weight: 800 });
    b += rr(cx - nw * 0.3, y0 + tam * 1.42, nw * 0.6, 4, 2, `fill="${COR.cinza2}"`);
  }
  return op(inv(0, 0.12, idade), g(tr(x, y + 14 * (1 - ease.out(u)), s), b));
}

// =====================================================================
// TERCEIRO INFERIOR — lower-third de liderança. (x, y) = canto superior esquerdo do bloco
// o: rotulo (aba opcional), cor (navy), fim, id
export function terceiroInferior(nome, cargo, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const id = o.id ?? uid('gfLt', nome, cargo);
  const tn = o.tam ?? 54, tc = 25;
  const nw = larg(nome, 900, tn, 'Outfit', -0.5), cw = larg(cargo, 700, tc, 'DM Sans');
  const fx = 22, cardW = nw + 64 + fx, cardH = tn * 1.75;
  const pilW = cw + 52, pilH = 50, pilX = fx + 26, pilY = cardH - 14;
  const sai = o.fim == null ? 0 : ease.in(inv(o.fim, o.fim + 0.4, idade));
  const wipe = ease.out5(inv(0.05, 0.5, idade)) * (1 - sai);
  const wipe2 = ease.out5(inv(0.38, 0.8, idade)) * (1 - sai);
  if (wipe <= 0.001) return '';
  const cor = o.cor ?? COR.navy;
  let b = `<clipPath id="${id}a"><rect x="-10" y="-60" width="${n2((cardW + 30) * wipe)}" height="${n2(cardH + 80)}"/></clipPath>`
    + `<clipPath id="${id}b"><rect x="${n2(pilX - 10)}" y="${n2(pilY - 10)}" width="${n2((pilW + 30) * wipe2)}" height="${pilH + 30}"/></clipPath>`
    + `<clipPath id="${id}c"><rect x="0" y="0" width="${n2(cardW)}" height="${n2(cardH)}" rx="16"/></clipPath>`;
  // cartão do nome
  let card = caixa(0, 0, cardW, cardH, 16, COR.creme, 3, 7)
    + `<g clip-path="url(#${id}c)"><rect x="0" y="0" width="${fx}" height="${n2(cardH)}" fill="${cor}"/><rect x="${fx}" y="0" width="7" height="${n2(cardH)}" fill="${COR.ambar}"/></g>`
    + rr(0, 0, cardW, cardH, 16, `fill="none" ${contorno(3)}`);
  const un = ease.out(inv(0.2, 0.6, idade));
  card += `<g clip-path="url(#${id}c)">` + op(un, text(nome, fx + 34, cardH * 0.5 + tn * 0.34 + 26 * (1 - un), { size: tn, weight: 900, anchor: 'start', ls: '-0.5' })) + '</g>';
  if (o.rotulo) {
    const rt = o.rotulo.toUpperCase(), rw = larg(rt, 800, 18, 'Outfit', 2) + 28;
    card += g(tr(fx + 22, -16, 1, -3), rr(0, 2, rw, 34, 8, `fill="${COR.sombra}"`) + rr(0, 0, rw, 34, 8, `fill="${TINTA}"`) + text(rt, rw / 2, 23, { size: 18, weight: 800, fill: '#fff', ls: '2' }));
  }
  b += `<g clip-path="url(#${id}a)">${card}</g>`;
  // pílula do cargo
  const uc = ease.out(inv(0.55, 0.85, idade));
  const pil = rr(pilX, pilY + 5, pilW, pilH, pilH / 2, `fill="${COR.sombra}"`) + rr(pilX, pilY, pilW, pilH, pilH / 2, `fill="${cor}" ${contorno(2.5)}`)
    + op(uc, text(cargo, pilX + 26, pilY + pilH / 2 + tc * 0.34, { family: 'DM Sans', size: tc, weight: 700, fill: '#fff', anchor: 'start' }));
  b += `<g clip-path="url(#${id}b)">${pil}</g>`;
  return g(tr(x - 30 * (1 - ease.out(inv(0, 0.5, idade))), y), b);
}

// =====================================================================
// TEXTO DE CRISE — tipo cinético sobre fundo escuro (cena 1)
// o: x, y, tam, maxW, cor, sublinha (true), id, glitch2 (idade do 2º glitch)
export function textoCrise(texto, idade, o = {}) {
  if (idade < 0) return '';
  const x = o.x ?? 960, y = o.y ?? 540, maxW = o.maxW ?? 1640, cor = o.cor ?? '#fff';
  const id = o.id ?? uid('gfCr', texto);
  // ajuste: uma linha ou duas linhas equilibradas
  let tam = o.tam ?? 250, linhas = [texto];
  const w1 = larg(texto, 900, tam, 'Outfit', -2);
  if (w1 > maxW) {
    const ps = texto.split(' ');
    if (tam * maxW / w1 < 130 && ps.length > 1) {
      let best = null;
      for (let i = 1; i < ps.length; i++) {
        const L = [ps.slice(0, i).join(' '), ps.slice(i).join(' ')];
        const m = Math.max(...L.map(l => larg(l, 900, tam, 'Outfit', -2)));
        if (!best || m < best.m) best = { L, m };
      }
      linhas = best.L;
      tam = Math.min(tam * maxW / best.m, 165);
    } else tam = tam * maxW / w1;
  }
  const lh = tam * 0.98;
  const larguras = linhas.map(l => larg(l, 900, tam, 'Outfit', -2));
  const wMax = Math.max(...larguras);
  const sc = kf(idade, [[0, 1.85], [0.1, 0.96, ease.out], [0.18, 1]]) * (1 + 0.03 * Math.max(0, idade - 0.18));
  const fq = Math.floor(idade * 24);
  const R = rng(hash(texto) + fq * 131);
  const A = idade > 0.1 ? 16 * (1 - inv(0.1, 0.42, idade)) : 0;
  const sx = (R() - 0.5) * 2 * A, sy = (R() - 0.5) * 2 * A * 0.6;
  const blur = 26 * (1 - ease.out(inv(0, 0.13, idade)));
  const y0 = -((linhas.length - 1) * lh) / 2;
  const bloco = (fill, extra = '') => linhas.map((l, i) => text(l, 0, y0 + i * lh + tam * 0.35, { size: n2(tam), weight: 900, fill, ls: '-2', extra })).join('');
  let s = '';
  if (blur > 0.5) s += `<filter id="${id}f" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="${n2(blur)} ${n2(blur * 0.12)}"/></filter>`;
  // rastro de zoom (desfoque de movimento)
  if (idade < 0.14) for (let k = 1; k <= 3; k++) s += op(0.16 * (4 - k) / 3 * (1 - idade / 0.14), g(tr(0, 0, 1 + k * 0.12 * (1 - idade / 0.14)), bloco(cor)));
  const glitch = (idade > 0.1 && idade < 0.24) || (idade > (o.glitch2 ?? 0.66) && idade < (o.glitch2 ?? 0.66) + 0.09);
  if (glitch) {
    const gx = 7 + R() * 12;
    s += g(tr(-gx, R() * 4 - 2), bloco('#ff3b5c'), 'opacity=".85"') + g(tr(gx, R() * 4 - 2), bloco('#2fd3ff'), 'opacity=".85"');
  }
  let main = bloco(cor);
  if (blur > 0.5) main = `<g filter="url(#${id}f)">${main}</g>`;
  s += main;
  if (glitch) {
    // fatias deslocadas (duplicação efêmera)
    for (let k = 0; k < 3; k++) {
      const hy = y0 - tam * 0.5 + R() * (lh * linhas.length), hh = 8 + R() * tam * 0.22, dx = (R() - 0.5) * 70;
      s += `<clipPath id="${id}s${k}"><rect x="${n2(-wMax)}" y="${n2(hy)}" width="${n2(wMax * 2)}" height="${n2(hh)}"/></clipPath>`
        + `<g clip-path="url(#${id}s${k})"><g transform="translate(${n2(dx)} 0)">${bloco(k % 2 ? '#2fd3ff' : cor)}</g></g>`;
    }
  }
  if (o.sublinha !== false) {
    const uw = ease.out5(inv(0.14, 0.42, idade));
    const ly = y0 + (linhas.length - 1) * lh + tam * 0.6;
    if (uw > 0) s += rr(-wMax / 2, ly, wMax * uw, Math.max(10, tam * 0.075), 4, `fill="${COR.vermelho}"`);
  }
  return g(tr(x + sx, y + sy, sc), s);
}

// =====================================================================
// TIPO SUAVE — type-on suave, letra a letra (ex.: "Toda parceria tem um começo.")
// o: tam, peso, cor, vel (s por letra), cursor (cor; false = sem cursor), fam
export function tipoSuave(texto, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const tam = o.tam ?? 76, peso = o.peso ?? 700, fam = o.fam ?? 'Outfit', vel = o.vel ?? 0.05, cor = o.cor ?? TINTA;
  const cs = [...texto];
  const W = larg(texto, peso, tam, fam);
  const x0 = x - W / 2;
  let spans = '', prev = 0, ult = 0;
  cs.forEach((c, i) => {
    const a = ease.out(inv(i * vel, i * vel + 0.22, idade));
    const off = 12 * (1 - a);
    if (a > 0) ult = i + 1;
    spans += `<tspan dy="${n2(off - prev)}" fill-opacity="${n2(a)}">${esc(c)}</tspan>`;
    prev = off;
  });
  let s = `<text x="${n2(x0)}" y="${n2(y)}" font-family="${fam}" font-weight="${peso}" font-size="${tam}" fill="${cor}">${spans}</text>`;
  const fimT = cs.length * vel + 0.2;
  if (o.cursor !== false) {
    const cx = x0 + (ult ? larg(cs.slice(0, ult).join(''), peso, tam, fam) : 0) + 6;
    const pisca = idade < fimT || Math.floor((idade - fimT) / 0.45) % 2 === 0;
    if (pisca && idade < fimT + (o.cursorDur ?? 1.6)) s += rr(cx, y - tam * 0.74, 5, tam * 0.9, 2.5, `fill="${o.cursor ?? COR.laranja}"`);
  }
  return op(saida(idade, o), s);
}

// =====================================================================
// PALAVRAS → VALOR — TECNOLOGIA, GESTÃO, TRANSFORMAÇÃO ligadas por linha → "= VALOR"
// o: tempos [t1, t2, t3, tValor], y, palavras, fim
export function palavrasValor(idade, o = {}) {
  if (idade < 0) return '';
  const P = o.palavras ?? ['TECNOLOGIA', 'GESTÃO', 'TRANSFORMAÇÃO'];
  const T = o.tempos ?? [0, 0.55, 1.1, 1.9];
  const cores = [COR.navy, COR.totvs, COR.laranja];
  const y = o.y ?? 430, tam = 56, h = 108, gap = 120;
  const ws = P.map(p => larg(p, 900, tam, 'Outfit', 1) + 76);
  const tot = ws.reduce((a, b) => a + b, 0) + gap * (P.length - 1);
  const cx = [];
  let xx = 960 - tot / 2;
  ws.forEach(w => { cx.push(xx + w / 2); xx += w + gap; });
  let s = '';
  // linha que liga as palavras
  for (let i = 0; i < P.length - 1; i++) {
    const u = ease.inOut(inv(T[i + 1] - 0.1, T[i + 1] + 0.2, idade));
    if (u <= 0) continue;
    const xa = cx[i] + ws[i] / 2, xb = cx[i + 1] - ws[i + 1] / 2;
    s += `<path d="M${n2(xa)} ${y} H${n2(lerp(xa, xb, u))}" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/>`;
    if (u > 0.5) s += g(tr((xa + xb) / 2, y, popS((u - 0.5) * 2)), `<circle r="20" fill="${COR.ambar}" ${contorno(3)}/>` + text('+', 0, 10, { size: 30, weight: 900 }));
  }
  // chave que desce até o VALOR
  const tv = T[3], ub = ease.inOut(inv(tv - 0.35, tv, idade));
  const yb = y + h / 2 + 34, yv = y + 250;
  if (ub > 0) {
    const L = cx[0], Rr = cx[P.length - 1];
    let d = `M${n2(L)} ${n2(y + h / 2 + 4)} V${n2(yb)} H${n2(Rr)} V${n2(y + h / 2 + 4)} M960 ${n2(yb)} V${n2(yv - 70)}`;
    s += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n2(1 - ub)}"/>`;
  }
  P.forEach((p, i) => {
    const k = idade - T[i];
    if (k < 0) return;
    const u = inv(0, 0.4, k);
    const b = caixa(-ws[i] / 2, -h / 2, ws[i], h, 20, COR.creme, 3, 7)
      + rr(-ws[i] / 2 + 26, h / 2 - 22, ws[i] - 52, 9, 4.5, `fill="${cores[i]}"`)
      + text(p, 0, 12, { size: tam, weight: 900, ls: '1' });
    s += op(inv(0, 0.1, k), g(tr(cx[i], y - 30 * (1 - ease.out(u)), popS(u, 0.4), lerp(-6, 0, ease.back(u))), b));
    s += g(tr(cx[i] + ws[i] / 2, y - h / 2), estalo(inv(0.05, 0.45, k), -45, 4, TINTA, 0.9));
  });
  s += adesivo('= VALOR', 960, yv, idade - tv, { cor: COR.ambar, tinta: true, tam: 104, rot: -3 });
  return op(saida(idade, o), s);
}

// =====================================================================
// CARTÃO DE PROJETO — número, logo, nome, chips de frente/ERP e time em sequência
// p = { n, cliente, frente, erp, logo, time: [] }; o: w, tTime (idade do 1º nome), passoTime, fim
export function cartaoProjeto(p, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const W = o.w ?? 640, pad = 34;
  // nomes do time em linhas
  const ch = 48, gap = 12, maxL = W - pad * 2;
  const pos = [];
  let lx = 0, ln = 0;
  p.time.forEach(n => {
    const w = chipLargura(n, { h: ch, icone: 'pessoa' });
    if (lx > 0 && lx + w > maxL) { ln++; lx = 0; }
    pos.push({ x: lx, ln }); lx += w + gap;
  });
  const linhasT = ln + 1, yTime = 388;
  const H = yTime + linhasT * (ch + gap) + 18;
  const ent = inv(0, 0.45, idade);
  const s0 = lerp(0.88, 1, ease.back(ent)) * saida(idade, o);
  if (s0 <= 0.001) return '';
  const x0 = -W / 2, y0 = -H / 2;
  let b = caixa(x0, y0, W, H, 22, COR.creme, 3, 8);
  b += rr(x0, y0 + 8, W, 6, 0, 'fill="none"');
  // número
  const un = popS(inv(0.12, 0.45, idade));
  b += g(tr(x0 + pad + 50, y0 + pad + 50, un, -4), rr(-50, -50 + 5, 100, 100, 22, `fill="${COR.sombra}"`) + rr(-50, -50, 100, 100, 22, `fill="${COR.ambar}" ${contorno(3)}`) + text(p.n, 0, 23, { size: 64, weight: 900, ls: '-1' }));
  // painel do logo
  const lpx = x0 + pad + 124, lpw = W - pad * 2 - 124, lph = 100;
  const ul = inv(0.2, 0.55, idade);
  if (ul > 0) b += op(inv(0, 0.3, ul), rr(lpx, y0 + pad, lpw, lph, 16, `fill="#fff" ${contorno(2.5)}`) + g(tr(lpx + lpw / 2, y0 + pad + lph / 2, popS(ul, 0.6)), logoAj(p.logo, 0, 0, 56, lpw - 120, 84)));
  // cliente
  const uc = ease.out(inv(0.3, 0.6, idade));
  const ct = Math.min(46, 46 * (W - pad * 2) / larg(p.cliente, 900, 46, 'Outfit', -0.5));
  b += `<clipPath id="${uid('gfPj', p.n, p.cliente)}"><rect x="${n2(x0)}" y="${n2(y0 + 150)}" width="${W}" height="70"/></clipPath>`;
  b += `<g clip-path="url(#${uid('gfPj', p.n, p.cliente)})">` + op(uc, text(p.cliente, x0 + pad, y0 + 200 + 40 * (1 - uc), { size: n2(ct), weight: 900, anchor: 'start', ls: '-0.5' })) + '</g>';
  // frente e ERP
  const fw = chipLargura(p.frente, { h: 48, icone: 'engrenagem' });
  b += chip(p.frente, x0 + pad, y0 + 258, idade - 0.5, { h: 48, icone: 'engrenagem', cor: COR.laranja, ancora: 'start' });
  b += chip(p.erp, x0 + pad + fw + 12, y0 + 258, idade - 0.62, { h: 48, icone: 'erp', cor: COR.totvs, ancora: 'start' });
  // divisória e TIME
  const ud = ease.out(inv(0.75, 1.05, idade));
  if (ud > 0) b += `<path d="M${n2(x0 + pad)} ${n2(y0 + 310)} H${n2(x0 + pad + (W - pad * 2) * ud)}" stroke="${COR.cinza2}" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>`;
  b += op(inv(0.85, 1.05, idade), text('TIME', x0 + pad, y0 + 352, { size: 19, weight: 800, fill: COR.cinza, anchor: 'start', ls: '3' }));
  const tt = o.tTime ?? 1.0, pt = o.passoTime ?? 0.3;
  p.time.forEach((n, i) => {
    b += chip(n, x0 + pad + pos[i].x, y0 + yTime + pos[i].ln * (ch + gap) + ch / 2 - 6, idade - tt - i * pt, { h: ch, icone: 'pessoa', cor: COR.navy, ancora: 'start' });
  });
  return op(inv(0, 0.15, idade), g(tr(x, y + 30 * (1 - ease.out(ent)), s0), b));
}

// =====================================================================
// ANTES → DEPOIS — conceitual, sem números: peças bagunçadas → processo organizado
// o: w, h, tOrg (idade em que as peças se organizam), fim
export function antesDepois(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const W = o.w ?? 1160, H = o.h ?? 420, seta = 170, pw = (W - seta) / 2;
  const tOrg = o.tOrg ?? 1.25;
  const cores = [COR.navy, COR.totvs, COR.ambar, COR.laranja, COR.verde, '#8a7fd1'];
  const bag = [[-0.3, -0.22, -18], [0.12, -0.3, 14], [0.3, 0.02, -26], [-0.14, 0.05, 32], [-0.3, 0.3, 10], [0.18, 0.3, -12]]
    .map(([bx, by, r]) => ({ x: bx * (pw - 60), y: by * (H - 60) + 14, r }));
  const pecaW = 92, pecaH = 58;
  const peca = (c, i) => rr(-pecaW / 2, -pecaH / 2, pecaW, pecaH, 10, `fill="${c}" ${contorno(3)}`)
    + `<path d="M${-pecaW / 2 + 16} -8 H${n2(pecaW / 2 - 16 - (i % 3) * 8)} M${-pecaW / 2 + 16} 8 H${n2(pecaW / 2 - 30)}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>`;
  let s = '';
  const xa = -W / 2 + pw / 2, xd = W / 2 - pw / 2;
  // ANTES
  const antes = () => {
    let c = '';
    // rabisco embolado ligando as peças
    const ur = ease.inOut(inv(0.45, 1.0, idade));
    if (ur > 0) {
      let d = '';
      bag.forEach((p, i) => {
        const q = bag[(i * 2 + 3) % bag.length];
        d += `M${n2(p.x + pw / 2)} ${n2(p.y + H / 2)} C${n2(p.x + pw / 2 + 120)} ${n2(p.y + H / 2 - 90)} ${n2(q.x + pw / 2 - 110)} ${n2(q.y + H / 2 + 100)} ${n2(q.x + pw / 2)} ${n2(q.y + H / 2)} `;
      });
      c += `<path d="${d}" fill="none" stroke="${COR.vermelho}" stroke-width="3" stroke-dasharray="9 8" opacity=".75" stroke-linecap="round"/>`
        .replace('stroke-dasharray', `stroke-dashoffset="${n2(-idade * 30)}" stroke-dasharray`);
      c = op(ur, c);
    }
    bag.forEach((p, i) => {
      const k = idade - 0.15 - i * 0.06;
      if (k < 0) return;
      const fq = quadro(idade);
      const jx = noise(fq * 0.9, i) * 2.5, jr = noise(fq * 1.1, i + 9) * 3;
      c += g(tr(pw / 2 + p.x + jx, H / 2 + p.y, popS(k / 0.35), p.r + jr), peca(cores[i], i));
    });
    [[0.22, 0.24], [0.78, 0.7], [0.5, 0.86]].forEach(([fx, fy], i) => {
      const k = idade - 0.7 - i * 0.12;
      if (k > 0) c += g(tr(pw * fx, H * fy, popS(k / 0.3), (i - 1) * 12), `<circle r="18" fill="${COR.vermelho}" ${contorno(2.5)}/>` + text('?', 0, 8, { size: 24, weight: 900, fill: '#fff' }));
    });
    return c;
  };
  s += cartao(xa, 0, pw, H, idade, { cabecalho: 'ANTES', corAba: COR.vermelho, conteudo: antes });
  // seta central
  const us = ease.out(inv(0.85, 1.2, idade));
  if (us > 0) {
    const L = 120 * us;
    const d = `M${-60} -16 H${n2(-60 + L - 34)} V-36 L${n2(-60 + L)} 0 L${n2(-60 + L - 34)} 36 V16 H-60 Z`;
    s += `<path d="${d}" fill="${COR.sombra}" transform="translate(0 6)"/><path d="${d}" fill="${COR.ambar}" ${contorno(3)}/>`;
  }
  // DEPOIS
  const cols = 3, gx = (pw - 120) / (cols - 1);
  const depois = () => {
    let c = '';
    const alvo = i => ({ x: 60 + (i % cols) * gx, y: H / 2 - 28 + Math.floor(i / cols) * 112 - 30 });
    const ua = ease.inOut(inv(tOrg + 0.75, tOrg + 1.15, idade));
    if (ua > 0) {
      let d = '';
      for (let i = 0; i < cores.length - 1; i++) {
        const a = alvo(i), b = alvo(i + 1);
        if (Math.floor(i / cols) === Math.floor((i + 1) / cols)) d += `M${n2(a.x + pecaW / 2 + 8)} ${n2(a.y)} H${n2(b.x - pecaW / 2 - 10)} `;
        else d += `M${n2(a.x)} ${n2(a.y + pecaH / 2 + 6)} V${n2(a.y + 56)} H${n2(b.x)} V${n2(b.y - pecaH / 2 - 8)} `;
      }
      c += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${n2(1 - ua)}"/>`;
    }
    cores.forEach((cc, i) => {
      const k = idade - 1.0 - i * 0.05;
      if (k < 0) return;
      const um = ease.inOut(inv(tOrg + i * 0.08, tOrg + i * 0.08 + 0.55, idade));
      const a = alvo(i), p = bag[i];
      const px = lerp(pw / 2 + p.x, a.x, um), py = lerp(H / 2 + p.y, a.y, um);
      c += g(tr(px, py, popS(k / 0.3) * (1 + 0.12 * bump(idade, tOrg + i * 0.08 + 0.45, 0.25)), lerp(p.r, 0, um)), peca(cc, i));
    });
    const kc = idade - tOrg - 1.25;
    if (kc > 0) c += g(tr(pw - 46, H - 50, popS(kc / 0.35)), `<circle r="26" fill="${COR.verde}" ${contorno(3)}/>` + icone('check', 34, '#fff'));
    return c;
  };
  s += cartao(xd, 0, pw, H, idade - 0.95, { cabecalho: 'DEPOIS', corAba: COR.verde, conteudo: depois });
  return op(saida(idade, o), g(tr(x, y), s));
}

// =====================================================================
// TOTAIS — 6 PROJETOS · 2 PAÍSES · 13 PESSOAS · UMA PARCERIA (um por vez)
// o: tempos [4], y, durConta, fim
export function totais(idade, o = {}) {
  if (idade < 0) return '';
  const T = o.tempos ?? [0, 0.6, 1.2, 1.95];
  const it = [{ v: 6, r: 'PROJETOS', c: COR.navy, ic: 'doc' }, { v: 2, r: 'PAÍSES', c: COR.totvs, ic: 'globo' }, { v: 13, r: 'PESSOAS', c: COR.laranja, ic: 'pessoa' }, { t: 'UMA', r: 'PARCERIA' }];
  const y = o.y ?? 500, cw = 330, ch = 300, gap = 64, dc = o.durConta ?? 0.55;
  let s = '';
  it.forEach((q, i) => {
    const k = idade - T[i];
    if (k < 0) return;
    const cx = 960 + (i - 1.5) * (cw + gap);
    const u = inv(0, 0.42, k);
    const fim = q.v != null && k > dc ? bump(k, dc, 0.22) : 0;
    let b;
    if (q.v != null) {
      const n = Math.round(lerp(0, q.v, ease.out(inv(0.05, dc, k))));
      b = caixa(-cw / 2, -ch / 2, cw, ch, 24, COR.creme, 3, 8)
        + g(tr(0, -ch / 2 + 2), `<circle r="32" fill="${q.c}" ${contorno(3)}/>` + icone(q.ic, 46, '#fff', q.c))
        + g(tr(0, 0, 1 + 0.1 * fim), text(String(n), 0, 52, { size: 168, weight: 900, ls: '-4' }))
        + rr(-cw / 2 + 70, ch / 2 - 74, cw - 140, 8, 4, `fill="${q.c}"`)
        + text(q.r, 0, ch / 2 - 26, { size: 38, weight: 900, ls: '3' });
    } else {
      b = rr(-cw / 2, -ch / 2 + 10, cw, ch, 24, `fill="${mistura(COR.ambar, TINTA, 0.4)}" ${contorno(3)}`) + rr(-cw / 2, -ch / 2, cw, ch, 24, `fill="${COR.ambar}" ${contorno(3)}`)
        + text(q.t, 0, 40, { size: 128, weight: 900, ls: '-2' })
        + text(q.r, 0, ch / 2 - 26, { size: 38, weight: 900, ls: '3' });
      b += g(tr(cw / 2 - 6, -ch / 2 + 4), estalo(inv(0.08, 0.5, k), -45, 4, TINTA, 1.1));
    }
    s += op(inv(0, 0.12, k), g(tr(cx, y + 40 * (1 - ease.out(u)), popS(u, 0.5), q.v == null ? lerp(-8, -2, ease.back(u)) : 0), b));
    if (i > 0) s += g(tr(cx - (cw + gap) / 2, y, popS(inv(0, 0.3, k))), `<circle r="9" fill="${TINTA}"/>`);
  });
  return op(saida(idade, o), s);
}

// =====================================================================
// NÚMERO HERÓI — "R$ 7 MILHÕES" / "NO FY26" com count-up; "[X]" fica literal, sem contagem
// o: tam, dur (contagem), tSub, brilho (idade do reflexo), id, fim
export function numeroHeroi(texto, sub, x, y, idade, o = {}) {
  if (idade < 0) return '';
  const tam = o.tam ?? 170, id = o.id ?? uid('gfNh', texto, sub);
  const m = texto.match(/\d+/), conta = m && !texto.includes('[') && o.contagem !== false;
  const W = larg(texto, 900, tam, 'Outfit', -3);
  const u = inv(0, 0.4, idade);
  let txt = texto;
  if (conta) {
    const v = +m[0], uc = ease.out(inv(0.12, 0.12 + (o.dur ?? 0.9), idade));
    txt = texto.replace(m[0], String(Math.round(v * uc)));
  }
  const x0 = -W / 2, base = tam * 0.35;
  let s = '';
  // marca-texto âmbar atrás do número
  const um = ease.out5(inv(0.15, 0.55, idade));
  if (um > 0) s += g(tr(0, 0, 1, -1.2), rr(x0 - 26, base - tam * 0.42, (W + 52) * um, tam * 0.44, 10, `fill="${COR.ambar}"`));
  const corpo = `<text x="${n2(x0)}" y="${n2(base)}" font-family="Outfit" font-weight="900" font-size="${tam}" fill="${TINTA}" letter-spacing="-3">${esc(txt)}</text>`;
  s += corpo;
  // reflexo correndo dentro das letras
  const tb = o.brilho ?? (conta ? 1.15 : 0.55), ub = inv(tb, tb + 0.6, idade);
  if (ub > 0 && ub < 1) {
    s += `<clipPath id="${id}"><text x="${n2(x0)}" y="${n2(base)}" font-family="Outfit" font-weight="900" font-size="${tam}" letter-spacing="-3">${esc(txt)}</text></clipPath>`
      + `<g clip-path="url(#${id})"><rect x="${n2(lerp(x0 - 200, -x0 + 60, ease.inOut(ub)))}" y="${n2(-tam)}" width="140" height="${n2(tam * 2)}" fill="url(#gfLuz)" transform="skewX(-20)"/></g>`;
  }
  // subtítulo
  if (sub) {
    const ts = Math.round(tam * 0.27), k = idade - (o.tSub ?? 0.5);
    if (k > 0) {
      const sw = larg(sub, 800, ts, 'Outfit', ts * 0.12) + ts * 1.6, sh = ts * 1.75;
      s += g(tr(0, base + tam * 0.22 + sh / 2, popS(k / 0.35, 0.5)), rr(-sw / 2, -sh / 2 + 5, sw, sh, sh / 2, `fill="${COR.sombra}"`) + rr(-sw / 2, -sh / 2, sw, sh, sh / 2, `fill="${COR.navy}" ${contorno(2.5)}`)
        + text(sub, 0, ts * 0.36, { size: ts, weight: 800, fill: '#fff', ls: n2(ts * 0.12) }));
    }
  }
  // brilhos ao final da contagem
  const kb = idade - (conta ? 1.02 : 0.45);
  if (kb > 0 && kb < 0.7) {
    const sp = kf(kb, [[0, 0], [0.15, 1.2], [0.3, 1], [0.7, 0]]);
    s += g(tr(-x0 + 24, -tam * 0.5, sp, kb * 90), brilho4(26, COR.ambar, 2.5)) + g(tr(x0 - 10, base - 6, sp * 0.7, -kb * 90), brilho4(22, '#fff', 2.5));
  }
  return op(inv(0, 0.15, idade) * saida(idade, o), g(tr(x, y + 30 * (1 - ease.out(u)), lerp(0.86, 1, ease.back(u))), s));
}

// =====================================================================
// TELEFONEMA — split-screen de duas ligações com ondas de áudio
// o: ativo ('A'|'B'|'ambos'), paineis (true), corA, corB, fim. Recortes: url(#gfTelA) / url(#gfTelB)
export function telefonema(nomeA, nomeB, idade, o = {}) {
  if (idade < 0) return '';
  const ua = ease.out5(inv(0, 0.4, idade)), ub = ease.out5(inv(0.08, 0.48, idade));
  const ativo = o.ativo ?? 'ambos';
  let s = '';
  if (o.paineis !== false) {
    s += g(tr(-1000 * (1 - ua), 0), `<polygon points="${TEL.A}" fill="${o.corA ?? '#dce9f8'}"/>` + aneis(470, 600, idade, COR.totvs));
    s += g(tr(1000 * (1 - ub), 0), `<polygon points="${TEL.B}" fill="${o.corB ?? '#f8e4cf'}"/>` + aneis(1450, 600, idade + 0.4, COR.laranja));
  }
  // divisória diagonal
  const ud = ease.out(inv(0.2, 0.5, idade));
  if (ud > 0) {
    const yb = 1080 * ud;
    s += `<path d="M1000 0 L${n2(1000 - 80 * ud)} ${n2(yb)}" stroke="${TINTA}" stroke-width="30" stroke-linecap="butt"/><path d="M1000 0 L${n2(1000 - 80 * ud)} ${n2(yb)}" stroke="${COR.ambar}" stroke-width="22"/>`;
  }
  // HUDs de chamada
  const hud = (nome, x, k, lado, cor, fala) => {
    if (k < 0) return '';
    const nw = larg(nome, 800, 34), w = 92 + nw + 26 + 150 + 22, h = 84;
    const ox = lado < 0 ? x : x - w;
    const toque = idade < 1 ? Math.sin(idade * 70) * 9 * (1 - idade) : 0;
    let b = caixa(0, 0, w, h, h / 2, COR.creme, 3, 6)
      + g(tr(h / 2, h / 2, 1, toque), `<circle r="31" fill="${cor}" ${contorno(3)}/>` + icone('telefone', 40, '#fff'))
      + text(nome, 92, h / 2 + 12, { size: 34, weight: 800, anchor: 'start' });
    // ondas de áudio
    const bx = 92 + nw + 26;
    for (let i = 0; i < 15; i++) {
      const a = fala ? 0.25 + 0.75 * Math.abs(noise(idade * 9 + i * 0.7, i + (lado < 0 ? 0 : 20))) : 0.12;
      const bh = 6 + 44 * a;
      b += rr(bx + i * 10, h / 2 - bh / 2, 5, bh, 2.5, `fill="${fala ? cor : COR.cinza2}"`);
    }
    return g(tr(ox, 104 + 20 * (1 - ease.out(inv(0, 0.35, k))), popS(inv(0, 0.35, k), 0.7)), b);
  };
  s += hud(nomeA, 60, idade - 0.35, -1, COR.totvs, ativo !== 'B');
  s += hud(nomeB, 1860, idade - 0.5, 1, COR.laranja, ativo !== 'A');
  return op(saida(idade, o), s);
}
// anéis de toque saindo do telefone (fundo dos painéis)
function aneis(x, y, idade, cor) {
  let s = '';
  for (let k = 0; k < 3; k++) {
    const u = ((idade * 0.6 + k / 3) % 1);
    s += `<circle cx="${x}" cy="${y}" r="${n2(80 + 420 * u)}" fill="none" stroke="${cor}" stroke-width="${n2(10 * (1 - u) + 2)}" opacity="${n2(0.22 * (1 - u))}"/>`;
  }
  return s;
}

// =====================================================================
// TÍTULO DE MISSÃO — "OPERAÇÃO COLLECTION ZERO DEFECT", espionagem divertida
// o: rotulo ('MISSÃO'), y, fim
export function tituloMissao(texto, idade, o = {}) {
  if (idade < 0) return '';
  const y = o.y ?? 540, H = 440;
  const ub = ease.out5(inv(0, 0.3, idade)) * saida(idade, o, 0.3);
  if (ub <= 0.001) return '';
  let l1 = '', l2 = texto;
  const m = texto.match(/^(OPERAÇÃO)\s+(.*)$/i);
  if (m) { l1 = m[1].toUpperCase(); l2 = m[2]; }
  const h = H * ub;
  let s = rr(0, y - h / 2, 1920, h, 0, `fill="#0d1b30"`);
  // grade sutil e faixas zebradas
  for (let gx = 0; gx < 1920; gx += 60) s += `<rect x="${gx}" y="${n2(y - h / 2)}" width="1" height="${n2(h)}" fill="#fff" opacity=".05"/>`;
  const fx = (idade * 90) % 36;
  s += g(tr(-fx, 0), rr(0, y - h / 2 - 16, 1990, 16, 0, 'fill="url(#gfListras)"') + rr(0, y + h / 2, 1990, 16, 0, 'fill="url(#gfListras)"'));
  s += `<path d="M0 ${n2(y - h / 2 - 16)} H1920 M0 ${n2(y + h / 2 + 16)} H1920" stroke="${TINTA}" stroke-width="3"/>`;
  if (ub < 0.98) return s;
  // texto com "decodificação" (letras embaralhadas que se resolvem)
  const AL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&';
  const decod = (str, t0, passo) => [...str].map((c, i) => {
    const ti = t0 + i * passo;
    if (idade < ti - 0.25) return ' ';
    if (idade >= ti || c === ' ') return c;
    const R = rng(i * 97 + quadro(idade * 2));
    return AL[Math.floor(R() * AL.length)];
  }).join('');
  const t2 = Math.min(150, 150 * 1500 / larg(l2, 900, 150, 'Outfit', 2));
  const yt = y + (l1 ? 66 : 40);
  if (l1) {
    const lt = decod(l1, 0.3, 0.05);
    s += text(lt, 960 - larg(l1, 900, 58, 'Outfit', 16) / 2, y - 92, { size: 58, weight: 900, fill: COR.ambar, ls: '16', anchor: 'start' });
  }
  const lt2 = decod(l2, 0.55, 0.04);
  s += text(lt2, 960 - larg(l2, 900, t2, 'Outfit', 2) / 2, yt, { size: n2(t2), weight: 900, fill: '#fff', ls: '2', anchor: 'start' });
  // cantoneiras de mira que se fecham
  const W2 = larg(l2, 900, t2, 'Outfit', 2) + 90, uc = ease.out(inv(0.3, 0.8, idade));
  const bw = lerp(W2 + 260, W2, uc) / 2, bh = lerp(240, 160, uc), cy = y - 10;
  const L = 44;
  let d = '';
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) d += `M${n2(960 + sx * bw)} ${n2(cy + sy * bh - sy * L)} V${n2(cy + sy * bh)} H${n2(960 + sx * bw - sx * L)} `;
  s += op(uc, `<path d="${d}" fill="none" stroke="${COR.ambar}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`);
  // REC e rótulo
  const rot = o.rotulo ?? 'MISSÃO';
  if (rot) {
    const pisca = Math.floor(idade / 0.4) % 2 === 0;
    const rw = larg(rot, 800, 24, 'Outfit', 5) + 30;
    s += g(tr(960 - rw / 2 + 10, y + H / 2 - 36), (pisca ? `<circle r="9" fill="${COR.vermelho}"/>` : `<circle r="9" fill="none" stroke="${COR.vermelho}" stroke-width="3"/>`) + text(rot, 24, 9, { size: 24, weight: 800, fill: '#fff', anchor: 'start', ls: '5' }));
  }
  // linha de varredura
  const uv = inv(0.25, 1.2, idade);
  if (uv > 0 && uv < 1) s += rr(0, y - H / 2 + H * uv, 1920, 3, 0, `fill="${COR.ambar}" opacity=".6"`);
  return s;
}

// =====================================================================
// FAIXA DE LOGOS — UNIMED → FUNED → CAOA → JOHN DEERE → HUGHES → LIBERCON
// o: tempos, y, nomes, fim
export function faixaLogos(idade, o = {}) {
  if (idade < 0) return '';
  const N = o.nomes ?? ['unimed', 'funed', 'caoa', 'john-deere', 'hughes', 'libercon'];
  const T = o.tempos ?? N.map((_, i) => i * 0.32);
  const y = o.y ?? 540, tw = 232, th = 150, seta = 52;
  const tot = N.length * tw + (N.length - 1) * seta;
  let s = '';
  N.forEach((n, i) => {
    const k = idade - T[i];
    if (k < 0) return;
    const cx = 960 - tot / 2 + tw / 2 + i * (tw + seta);
    if (i > 0) {
      const ua = ease.out(inv(0, 0.25, k));
      const ax = cx - tw / 2 - seta / 2;
      s += op(ua, `<path d="M${n2(ax - 9 - 8 * (1 - ua))} ${y - 15} L${n2(ax + 7 - 8 * (1 - ua))} ${y} L${n2(ax - 9 - 8 * (1 - ua))} ${y + 15}" fill="none" stroke="${TINTA}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    const u = inv(0, 0.4, k);
    const b = caixa(-tw / 2, -th / 2, tw, th, 20, '#fff', 3, 7) + logoAj(n, 0, 0, 72, tw - 60, 112)
      + g(tr(-tw / 2 + 8, -th / 2 + 6), `<circle r="20" fill="${COR.ambar}" ${contorno(2.5)}/>` + text(String(i + 1).padStart(2, '0'), 0, 7, { size: 18, weight: 900 }));
    s += op(inv(0, 0.1, k), g(tr(cx, y - 30 * (1 - ease.out(u)), popS(u, 0.5)), b));
  });
  return op(saida(idade, o), s);
}

// =====================================================================
// LOCKUP FINAL — A&M + TOTVS, "Framework A&M x TOTVS" e a frase final
// o: y, tempos [frase1, frase2, frase3], fim
export function lockupFinal(idade, o = {}) {
  if (idade < 0) return '';
  const y = o.y ?? 400;
  let s = '';
  const am = logoSize('alvarez-marsal', 150), tv = logoSize('totvs', 74);
  const gap = 110, cw = am.w + tv.w + gap + 140, ch = 230;
  s += cartao(960, y, cw, ch, idade, {});
  const xa = 960 - (am.w + tv.w + gap) / 2 + am.w / 2, xt = 960 + (am.w + tv.w + gap) / 2 - tv.w / 2;
  const ua = inv(0.15, 0.5, idade), ut = inv(0.35, 0.7, idade), up = inv(0.25, 0.55, idade);
  if (ua > 0) s += g(tr(xa, y, popS(ua, 0.6)), logo('alvarez-marsal', 0, 0, 150));
  if (ut > 0) s += g(tr(xt, y, popS(ut, 0.6)), logo('totvs', 0, 0, 74));
  if (up > 0) s += g(tr(xa + am.w / 2 + gap / 2, y, popS(up)), `<circle r="30" fill="${COR.ambar}" ${contorno(3)}/>` + text('+', 0, 13, { size: 44, weight: 900 }));
  // Framework
  const fk = idade - 0.7;
  if (fk > 0) {
    const ft = 'Framework A&M x TOTVS', fw = larg(ft, 800, 34) + 70, fh = 64;
    s += g(tr(960, y + ch / 2 + 6, popS(fk / 0.35, 0.5)), rr(-fw / 2, -fh / 2 + 5, fw, fh, fh / 2, `fill="${COR.sombra}"`) + rr(-fw / 2, -fh / 2, fw, fh, fh / 2, `fill="${COR.navy}" ${contorno(3)}`) + text(ft, 0, 12, { size: 34, weight: 800, fill: '#fff' }));
  }
  // frase final, uma parte por vez
  const F3 = ['UM TIME.', 'METODOLOGIAS INTEGRADAS.', 'VALOR SUSTENTÁVEL.'];
  const T = o.tempos ?? [1.1, 1.45, 1.8];
  const ft = 50, sp = 34;
  const ws = F3.map(f => larg(f, 900, ft, 'Outfit', 1));
  const tot = ws.reduce((a, b) => a + b, 0) + sp * 2;
  let xx = 960 - tot / 2;
  const yf = y + ch / 2 + 150;
  F3.forEach((f, i) => {
    const k = idade - T[i], u = ease.out(inv(0, 0.4, k));
    if (k > 0) {
      s += op(u, text(f, xx, yf + 24 * (1 - u), { size: ft, weight: 900, anchor: 'start', ls: '1' }));
      s += rr(xx, yf + 18, ws[i] * ease.out5(inv(0.15, 0.55, k)), 7, 3.5, `fill="${[COR.navy, COR.totvs, COR.ambar][i]}"`);
    }
    xx += ws[i] + sp;
  });
  return op(saida(idade, o, 0.5), s);
}

// =====================================================================
// "MAS TEM UM DETALHE…" — máquina de escrever
// o: texto, x, y, tam, cor, vel, fim
export function mas_detalhe(idade, o = {}) {
  if (idade < 0) return '';
  const tx = o.texto ?? 'MAS TEM UM DETALHE…', tam = o.tam ?? 124, cor = o.cor ?? TINTA, vel = o.vel ?? 0.065;
  const x = o.x ?? 960, y = o.y ?? 560;
  const cs = [...tx], n = Math.min(cs.length, Math.floor(idade / vel) + 1);
  const W = larg(tx, 900, tam, 'Outfit', -1), x0 = x - W / 2;
  const vis = cs.slice(0, n).join('');
  const zoom = 1 + 0.025 * idade;
  let s = `<text x="${n2(x0)}" y="${n2(y)}" font-family="Outfit" font-weight="900" font-size="${tam}" fill="${cor}" letter-spacing="-1">${esc(vis)}</text>`;
  const cx = x0 + larg(vis, 900, tam, 'Outfit', -1) + 10;
  const fimT = cs.length * vel;
  if (idade < fimT || Math.floor((idade - fimT) / 0.4) % 2 === 0) s += rr(cx, y - tam * 0.78, tam * 0.1, tam * 0.92, 3, `fill="${COR.laranja}"`);
  return op(saida(idade, o), g(tr(x, y, zoom) + ` translate(${-x} ${-y})`, s));
}

// =====================================================================
// ANIME ACTION
// LINHAS DE VELOCIDADE — o: tipo ('radial'|'horizontal'), r (raio livre), n, cor, op, w, h, dir, fim
export function linhasVelocidade(x, y, idade, o = {}) {
  if (idade < 0) return '';
  const a = clamp(idade / 0.12) * saida(idade, o, 0.2) * (o.op ?? 0.85);
  if (a <= 0.001) return '';
  const cor = o.cor ?? TINTA, fq = quadro(idade);
  const R = rng(hash('vel' + (o.tipo ?? 'r')) + fq * 7919);
  let d = '';
  if ((o.tipo ?? 'radial') === 'radial') {
    const n = o.n ?? 110, r0 = o.r ?? 300, Rmax = 1500;
    for (let i = 0; i < n; i++) {
      if (R() < 0.3) { R(); R(); R(); continue; }
      const an = (i / n) * TAU + (R() - 0.5) * 0.04;
      const ri = r0 + R() * r0 * 0.7, wo = (3 + R() * 16) / Rmax;
      const c = Math.cos(an), sn = Math.sin(an);
      d += `M${n2(x + c * ri)} ${n2(y + sn * ri)} L${n2(x + Math.cos(an - wo) * Rmax)} ${n2(y + Math.sin(an - wo) * Rmax)} L${n2(x + Math.cos(an + wo) * Rmax)} ${n2(y + Math.sin(an + wo) * Rmax)} Z `;
      R();
    }
  } else {
    const W = o.w ?? 1920, H = o.h ?? 1080, n = o.n ?? 46, dir = o.dir ?? -1;
    const Rb = rng(hash('velh'));
    for (let i = 0; i < n; i++) {
      const yy = y - H / 2 + Rb() * H, len = 160 + Rb() * 700, th = 2 + Rb() * 7, vel = 2400 + Rb() * 2400;
      const base = Rb() * (W + len);
      const px = ((base + dir * idade * vel) % (W + len) + (W + len)) % (W + len) - len;
      const x0 = x - W / 2 + px;
      d += `M${n2(x0)} ${n2(yy)} L${n2(x0 + len)} ${n2(yy - th / 2)} L${n2(x0 + len)} ${n2(yy + th / 2)} Z `;
    }
  }
  return `<path d="${d}" fill="${cor}" opacity="${n2(a)}"/>`;
}

// IMPACTO — estrela de impacto + flash. o: tam, cor, fim
export function impacto(x, y, idade, o = {}) {
  if (idade < 0 || idade > 0.6) return '';
  const k = o.tam ?? 1, cor = o.cor ?? COR.ambar;
  let s = '';
  const uf = inv(0, 0.22, idade);
  if (uf < 1) s += `<circle cx="${x}" cy="${y}" r="${n2((40 + 300 * ease.out(uf)) * k)}" fill="#fff" opacity="${n2(0.85 * (1 - uf) * (1 - uf))}"/>`;
  const ur = inv(0.04, 0.45, idade);
  if (ur > 0 && ur < 1) s += `<circle cx="${x}" cy="${y}" r="${n2((90 + 230 * ease.out(ur)) * k)}" fill="none" stroke="${TINTA}" stroke-width="${n2(6 * (1 - ur) + 1)}" opacity="${n2(1 - ur)}"/>`;
  const sc = kf(idade, [[0, 0.35], [0.05, 1.15], [0.1, 1], [0.32, 1], [0.48, 0]]) * k;
  if (sc > 0.01) {
    const R = rng(hash('imp') + quadro(idade));
    const pts = (r1, r2, n) => {
      let d = '';
      for (let i = 0; i < n * 2; i++) {
        const an = (i / (n * 2)) * TAU + 0.1;
        const r = i % 2 ? r2 : r1 * (0.75 + R() * 0.45);
        d += `${i ? 'L' : 'M'}${n2(Math.cos(an) * r)} ${n2(Math.sin(an) * r)} `;
      }
      return d + 'Z';
    };
    s += g(tr(x, y, sc, quadro(idade) * 7), `<path d="${pts(150, 62, 11)}" fill="#fff" ${contorno(4)}/><path d="${pts(92, 42, 11)}" fill="${cor}"/>`);
  }
  // detritos
  const ud = inv(0.03, 0.4, idade);
  if (ud > 0 && ud < 1) {
    const R = rng(hash('detr'));
    let d = '';
    for (let i = 0; i < 10; i++) {
      const an = R() * TAU, r1 = (120 + 200 * ease.out(ud) * (0.7 + R() * 0.5)) * k, l = 26 * (1 - ud) * k;
      d += `M${n2(x + Math.cos(an) * r1)} ${n2(y + Math.sin(an) * r1)} L${n2(x + Math.cos(an) * (r1 + l))} ${n2(y + Math.sin(an) * (r1 + l))} `;
    }
    s += `<path d="${d}" stroke="${TINTA}" stroke-width="5" stroke-linecap="round"/>`;
  }
  return s;
}

// GOTA DE SUOR (estilo anime)
export function gotaSuor(x, y, idade) {
  if (idade < 0) return '';
  const s = popS(inv(0, 0.22, idade));
  const dy = 16 * ease.inOut(inv(0.25, 1.2, idade));
  const st = 1 + 0.08 * ease.inOut(inv(0.25, 1.2, idade));
  const d = 'M0 -30 C6 -18 18 -4 18 9 A18 18 0 0 1 -18 9 C-18 -4 -6 -18 0 -30 Z';
  return g(tr(x, y + dy, s, 12, 1 / st, st), `<path d="${d}" fill="#8fd3f7" ${contorno(3)}/><ellipse cx="-7" cy="6" rx="4" ry="7" fill="#fff" opacity=".85" transform="rotate(20 -7 6)"/>`);
}

// REAÇÕES — "?" e "!" em cima da cabeça
function reacao(ch, x, y, idade, gira) {
  if (idade < 0) return '';
  const s = kf(idade, [[0, 0], [0.12, 1.28, ease.out], [0.22, 0.9], [0.32, 1.04], [0.4, 1]]);
  const rot = gira ? Math.sin(idade * 6) * 10 : 0;
  const jy = gira ? 0 : -14 * bump(idade, 0, 0.25);
  let b = `<text x="0" y="38" font-family="Outfit" font-weight="900" font-size="110" text-anchor="middle" fill="${COR.ambar}" stroke="${TINTA}" stroke-width="7" stroke-linejoin="round" paint-order="stroke">${ch}</text>`;
  if (!gira) b += g(tr(0, -30), estalo(inv(0.06, 0.5, idade), -90, 52, TINTA, 1.2));
  return g(tr(x, y + jy, s, rot), b);
}
export const interrogacao = (x, y, idade) => reacao('?', x, y, idade, true);
export const exclamacao = (x, y, idade) => reacao('!', x, y, idade, false);

// BRILHO NO CABELO — "ting"
export function brilhoCabelo(x, y, idade) {
  if (idade < 0 || idade > 0.7) return '';
  const s1 = kf(idade, [[0, 0], [0.1, 1.3, ease.out], [0.2, 1], [0.5, 0, ease.in]]);
  const s2 = kf(idade, [[0.08, 0], [0.18, 1.1, ease.out], [0.26, 0.9], [0.55, 0, ease.in]]);
  let s = '';
  const ug = bump(idade, 0, 0.3);
  if (ug > 0) s += `<circle cx="${x}" cy="${y}" r="38" fill="#fff" opacity="${n2(0.8 * ug)}" filter="url(#gfBrilho)"/>`
    + `<path d="M${x - 90 * ug} ${y} H${x + 90 * ug} M${x} ${y - 60 * ug} V${y + 60 * ug}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="${n2(ug)}"/>`;
  if (s1 > 0.01) s += g(tr(x, y, s1, idade * 120), brilho4(34, '#fff', 2.5) + brilho4(12, COR.ambar));
  if (s2 > 0.01) s += g(tr(x + 40, y - 30, s2, -idade * 90), brilho4(16, '#fff', 2));
  return s;
}

// RISCO DE DISCO — "record scratch": congela, flash e linhas de ruído
// o: dur, congela (dessatura o que está atrás; só na camada completa)
export function riscoDisco(idade, o = {}) {
  if (idade < 0) return '';
  const dur = o.dur ?? 0.7;
  if (idade > dur) return '';
  let s = '';
  if (o.congela) s += `<rect width="1920" height="1080" fill="#888" style="mix-blend-mode:saturation"/><rect width="1920" height="1080" fill="#f3e2c2" opacity=".14"/>`;
  s += `<rect width="1920" height="1080" fill="url(#gfVinheta)" opacity="${n2(0.9 * (1 - inv(dur * 0.6, dur, idade)))}"/>`;
  const uf = inv(0, 0.1, idade);
  if (uf < 1) s += `<rect width="1920" height="1080" fill="#fff" opacity="${n2(0.6 * (1 - uf))}"/>`;
  const fq = Math.floor(idade * 24), R = rng(4242 + fq * 31);
  const forca = 1 - inv(dur * 0.4, dur, idade);
  for (let i = 0; i < 16; i++) {
    const yy = R() * 1080, hh = 1 + R() * 5, xx = R() * 1500, ww = 200 + R() * 1400;
    s += `<rect x="${n2(xx)}" y="${n2(yy)}" width="${n2(ww)}" height="${n2(hh)}" fill="${R() < 0.5 ? '#fff' : TINTA}" opacity="${n2((0.35 + R() * 0.5) * forca)}"/>`;
  }
  for (let i = 0; i < 3; i++) {
    const yy = R() * 1080, hh = 10 + R() * 26;
    s += `<rect x="0" y="${n2(yy)}" width="1920" height="${n2(hh)}" fill="${i % 2 ? '#2fd3ff' : '#ff3b5c'}" opacity="${n2(0.16 * forca)}"/>`;
  }
  // o "risco": zigue-zague da agulha
  if (idade < 0.22) {
    const Rz = rng(77 + Math.floor(idade * 24));
    let d = 'M-20 540';
    for (let xx = 40; xx <= 1960; xx += 60) d += ` L${xx} ${n2(540 + (Rz() - 0.5) * 120)}`;
    s += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="14" stroke-linejoin="round" opacity=".8"/><path d="${d}" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>`;
  }
  return s;
}
