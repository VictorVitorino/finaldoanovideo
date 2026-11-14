// Base visual do vídeo "Mapa de Perfil Cognitivo · Mapa de Adoção" (Alvarez & Marsal · Performance · DTS), 1080 x 1350.
// Usa só as CORES da paleta (navy, azuis, cinzas e laranja), sem logo e sem logotipo. Títulos em Light (Inter 300),
// textos e rótulos em Roboto Condensed. O kit lúdico (personagens, fundos vivos, câmera, mapa de trilha) está em
// ludico.js e os componentes do dashboard em painelUI.js. Tudo é função pura do tempo.
import { clamp, lerp, inv, ease, kf, n2, esc, measure, rng, hash, noise } from '../core.js';

export { clamp, lerp, inv, ease, kf, n2, esc, measure, rng, hash, noise };
const f = n2;

export const W = 1080, H = 1350, MG = 72;   // quadro e margem lateral
// Faixas verticais do quadro (y). O palco é a área livre para a animação de cada cena.
export const Z = { topo: 46, tituloY: 196, palco0: 330, palco1: 1170, legenda: 1218 };

export const C = {
  navy: '#002B49', navy80: '#33556D', navy40: '#99AAB6', navy20: '#CCD5DB',
  orange: '#F78C16', orange80: '#F9A345', orange40: '#FCD1A2', orange20: '#FDE8D0', orangeD: '#C26907',
  gray: '#CDD5DB', gray80: '#D7DDE2', gray40: '#EBEEF1', gray20: '#F5F7F8', line: '#DDE3E8',
  blue: '#5E8AB4', blue80: '#7EA1C3', blue40: '#BFD0E1', blue20: '#DFE8F0',
  white: '#FFFFFF', pos: '#9ACC3C', att: '#F9C20A', neg: '#CF3D3D',
};
export const FONTE = { L: 'Inter', C: 'Roboto Condensed' };

// ---------- texto ----------
// o: { f: 'L' (Light, títulos) | 'C' (condensada, textos e rótulos), w (peso), s (tamanho), c (cor), a (anchor), ls, o (opacidade) }
export function txt(str, x, y, o = {}) {
  const fk = o.f ?? 'C';
  const w = o.w ?? (fk === 'L' ? 300 : 400);
  return `<text x="${f(x)}" y="${f(y)}" font-family="'${FONTE[fk]}'" font-weight="${w}" font-size="${o.s ?? 28}" fill="${o.c ?? C.navy}" text-anchor="${o.a ?? 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.o != null ? ` opacity="${f(o.o)}"` : ''}>${esc(str)}</text>`;
}
export const larg = (str, s, o = {}) => {
  const fk = o.f ?? 'C';
  return measure(str, `${o.w ?? (fk === 'L' ? 300 : 400)} ${s}px "${FONTE[fk]}"`) + (o.ls ? o.ls * str.length : 0);
};
// texto com trechos *destacados*: o.hi = cor do destaque, o.hw = peso do destaque
export function tRico(str, x, y, o = {}) {
  const fk = o.f ?? 'C';
  const w = o.w ?? (fk === 'L' ? 300 : 400);
  let sp = '';
  for (const p of str.split(/(\*[^*]+\*)/).filter(Boolean)) {
    const hi = p.startsWith('*');
    sp += `<tspan${hi ? ` fill="${o.hi ?? C.navy}"${o.hw ? ` font-weight="${o.hw}"` : ''}` : ''}>${esc(hi ? p.slice(1, -1) : p)}</tspan>`;
  }
  return `<text x="${f(x)}" y="${f(y)}" font-family="'${FONTE[fk]}'" font-weight="${w}" font-size="${o.s ?? 28}" fill="${o.c ?? C.navy}" text-anchor="${o.a ?? 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${sp}</text>`;
}
// quebra por largura (respeita *destaques* e '\n')
export function quebra(str, s, maxW, o = {}) {
  const out = [];
  for (const par of String(str).split('\n')) {
    let cur = '';
    for (const wd of par.trim().split(/\s+/)) {
      const test = cur ? cur + ' ' + wd : wd;
      if (larg(test.replace(/\*/g, ''), s, o) > maxW && cur) { out.push(cur); cur = wd; } else cur = test;
    }
    if (cur) out.push(cur);
  }
  let aberto = false;
  return out.map(l => {
    let r = (aberto ? '*' : '') + l;
    if (((l.match(/\*/g) || []).length) % 2 === 1) aberto = !aberto;
    if (aberto) r += '*';
    return r;
  });
}
// bloco de texto com várias linhas; devolve { svg, h, n }. o.lh = entrelinha; o.maxW = largura
export function bloco(str, x, y, o = {}) {
  const s = o.s ?? 28, lh = o.lh ?? s * 1.25;
  const linhas = quebra(str, s, o.maxW ?? W - 2 * MG, o);
  return { svg: linhas.map((l, i) => tRico(l, x, y + i * lh, o)).join(''), h: linhas.length * lh, n: linhas.length, linhas };
}

// ---------- tempo e movimento (estilo After Effects) ----------
export const fin = (t, a, d = 0.35) => ease.out(inv(a, a + d, t));              // 0 -> 1 suave a partir de a
export const fout = (t, a, d = 0.3) => 1 - ease.inOut(inv(a, a + d, t));        // 1 -> 0 suave a partir de a
export const janela = (t, a, b, r = 0.3) => Math.min(fin(t, a, r), fout(t, b - r, r)); // entra em a, sai até b
export const back = (t, a, d = 0.45) => ease.back(inv(a, a + d, t));            // 0 -> 1 com overshoot
export const elast = (t, a, d = 0.8) => ease.elastic(inv(a, a + d, t));         // 0 -> 1 elástico
export const opa = (o, body) => (o >= 0.999 ? body : o <= 0.001 ? '' : `<g opacity="${f(o)}">${body}</g>`);
export const mover = (x, y, body, r = 0, s = 1) => `<g transform="translate(${f(x)} ${f(y)})${r ? ` rotate(${f(r)})` : ''}${s !== 1 ? ` scale(${f(s)})` : ''}">${body}</g>`;
// escala em torno de (x, y); k <= 0 some
export const pop = (k, x, y, body) => (k <= 0.001 ? '' : `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)}) translate(${f(-x)} ${f(-y)})">${body}</g>`);
// entra subindo d px com fade (k: 0 -> 1)
export const sobe = (k, body, d = 28) => (k <= 0.001 ? '' : `<g opacity="${f(clamp(k))}" transform="translate(0 ${f((1 - k) * d)})">${body}</g>`);
// entra deslizando de lado dx px com fade
export const desliza = (k, body, dx = -40) => (k <= 0.001 ? '' : `<g opacity="${f(clamp(k))}" transform="translate(${f((1 - k) * dx)} 0)">${body}</g>`);
// máscara que revela da esquerda para a direita (dir 'x') ou de cima para baixo ('y')
export function revela(id, x, y, w, h, u, body, dir = 'x') {
  if (u <= 0) return '';
  if (u >= 1) return body;
  const r = dir === 'x' ? `x="${f(x)}" y="${f(y)}" width="${f(w * u)}" height="${f(h)}"` : `x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h * u)}"`;
  return `<clipPath id="${id}"><rect ${r}/></clipPath><g clip-path="url(#${id})">${body}</g>`;
}
// traço que se desenha: d = path, u = 0..1. o: { c, sw, fill, cap, extra }
export function tracar(d, u, o = {}) {
  if (u <= 0) return '';
  const dash = u >= 1 ? '' : ` pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - u)}"`;
  return `<path d="${d}" fill="${o.fill ?? 'none'}" stroke="${o.c ?? C.navy}" stroke-width="${o.sw ?? 3}" stroke-linecap="${o.cap ?? 'round'}" stroke-linejoin="round"${dash}${o.extra ? ' ' + o.extra : ''}/>`;
}
// número que conta até `valor`
export const conta = (valor, u, dec = 0) => (valor * ease.out(clamp(u))).toFixed(dec).replace('.', ',');
// tremor curto (dx, dy) a partir de t0
export function tremor(t, t0, d = 0.35, amp = 10) {
  return [0, 0];   // versão limpa: sem tremor
}
// anel de onda de choque que cresce e some (idade em s)
export function onda(x, y, idade, o = {}) {
  // versão limpa: um único anel fino e discreto, só para marcar o foco
  const d = o.d ?? 0.6, u = idade / d;
  if (u <= 0 || u >= 1) return '';
  const r = (o.r0 ?? 10) + Math.min(o.r1 ?? 60, 60) * ease.out(u);
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="none" stroke="${o.c ?? C.orange}" stroke-width="${f(2.5 * (1 - u) + 0.5)}" opacity="${f(0.55 * (1 - u))}"/>`;
}
// faíscas que saem de (x, y)
export function particulas(seed, x, y, idade, o = {}) {
  return '';   // versão limpa: sem partículas
}
// brilho que varre um retângulo arredondado
export function varredura(id, x, y, w, h, u, r = 8, cor = '#ffffff') {
  return '';   // versão limpa: sem varredura de brilho
}

// ---------- fundos ----------
export const fundoClaro = () => `<rect width="${W}" height="${H}" fill="${C.white}"/>`;
// navy liso, com as linhas da capa oficial A&M à direita (u = quanto das linhas já foi desenhado)
export function fundoNavy(u = 1, o = {}) {
  let s = `<rect width="${W}" height="${H}" fill="${C.navy}"/>`;
  if (o.linhas === false) return s;
  // mesmas linhas de assets/grafismos/capa-linhas.svg, ancoradas no canto inferior direito do quadro 4:5
  const k = 1.18, ox = W - 1600 * k + 260, oy = H - 900 * k;
  const P = (x, y) => `${f(ox + x * k)},${f(oy + y * k)}`;
  s += `<g opacity="${f(o.alpha ?? 1)}">`
    + tracar(`M${P(1025, 900)} L${P(1550, 0)}`, ease.inOut(clamp(u)), { c: '#FFFFFF', sw: 8, cap: 'butt' })
    + tracar(`M${P(903, 900)} L${P(1134, 487)} L${P(1134, 900)}`, ease.inOut(clamp(u * 1.2 - 0.2)), { c: C.navy20, sw: 2.4, cap: 'butt' })
    + `</g>`;
  return s;
}

// ---------- formas ----------
export const painel = (x, y, w, h, o = {}) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${o.r ?? 8}" fill="${o.fill ?? C.gray20}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1.5}"` : ''}/>`;
export const pilula = (x, y, w, h, fill, o = {}) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(h / 2)}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1.5}"` : ''}/>`;
// etiqueta do capítulo do design system: pílula laranja-20 com ponto laranja
export function etiqueta(str, x, y, o = {}) {
  const s = o.s ?? 22, w = larg(str, s) + 52, h = o.h ?? 40;
  const navy = o.escuro;
  return { w, svg: pilula(x, y, w, h, navy ? 'rgba(255,255,255,.1)' : C.orange20)
    + `<circle cx="${f(x + 20)}" cy="${f(y + h / 2)}" r="5" fill="${C.orange}"/>`
    + txt(str, x + 34, y + h / 2 + s * 0.35, { s, c: navy ? C.white : C.navy }) };
}
// rótulo técnico em caixa alta (título de painel)
export const rotulo = (str, x, y, o = {}) => txt(str.toUpperCase(), x, y, { w: 700, s: o.s ?? 20, ls: o.ls ?? 1.8, c: o.c ?? C.navy, a: o.a });
// etiqueta ILUSTRATIVO / REFERÊNCIA
export function selo(str, x, y, o = {}) {
  const s = 14, w = larg(str.toUpperCase(), s, { w: 700, ls: 2.4 }) + 22;
  const x0 = o.a === 'end' ? x - w : x;
  return `<rect x="${f(x0)}" y="${f(y)}" width="${f(w)}" height="26" rx="4" fill="${C.white}" stroke="${C.orange}" stroke-width="1.5"/>`
    + txt(str.toUpperCase(), x0 + 11, y + 18.5, { w: 700, s, ls: 2.4, c: C.orangeD });
}
// fio laranja curto (detalhe do design system) que cresce com u
export const fio = (x, y, u, w = 64, h = 5) => (u <= 0 ? '' : `<rect x="${f(x)}" y="${f(y)}" width="${f(w * ease.out(clamp(u)))}" height="${h}" fill="${C.orange}"/>`);

// ---------- ícones de traço (grade 48 x 48), desenhados por animação ----------
// cada ícone é uma lista de subcaminhos; os que começam com '!' são preenchidos (pontos), os demais são traços
const IC = {
  pessoa: ['M24 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M8 42c0-8.5 7.2-14 16-14s16 5.5 16 14'],
  pessoas: ['M18 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'M4 40c0-7.5 6.3-12 14-12s14 4.5 14 12', 'M31 9a7 7 0 0 1 0 13', 'M36 29c5 1.6 8 5.4 8 11'],
  laptop: ['M10 10h28v22H10z', 'M4 38h40', 'M18 21l4 4 8-8'],
  sistema: ['M6 8h36v26H6z', 'M6 16h36', 'M18 42h12', 'M24 34v8', 'M12 23h10', 'M12 28h16'],
  planilha: ['M8 8h32v32H8z', 'M8 18h32', 'M8 29h32', 'M20 8v32'],
  capelo: ['M4 18 24 8l20 10-20 10z', 'M12 23v9c0 3 5.4 6 12 6s12-3 12-6v-9', 'M44 18v11'],
  lampada: ['M24 5a13 13 0 0 0-8 23.2c1.5 1.2 2.4 3 2.4 4.8h11.2c0-1.8.9-3.6 2.4-4.8A13 13 0 0 0 24 5Z', 'M19 39h10', 'M21 44h6'],
  chip: ['M13 13h22v22H13z', 'M20 20h8v8h-8z', 'M19 5v8', 'M29 5v8', 'M19 35v8', 'M29 35v8', 'M5 19h8', 'M5 29h8', 'M35 19h8', 'M35 29h8'],
  bussola: ['M24 5a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z', 'M32 16l-5 11-11 5 5-11z'],
  escudo: ['M24 5 8 11v11c0 10 6.7 17.4 16 20 9.3-2.6 16-10 16-20V11z', 'M17 23l5 5 9-10'],
  diamante: ['M13 7h22l9 12-20 23L4 19z', 'M4 19h40', 'M18 7l-3 12 9 23 9-23-3-12'],
  olho: ['M3 24s7.5-14 21-14 21 14 21 14-7.5 14-21 14S3 24 3 24Z', 'M24 18a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z'],
  balanca: ['M24 7v33', 'M13 40h22', 'M9 13h30', 'M9 13 4 26a6.5 6.5 0 0 0 11 0z', 'M39 13l-5 13a6.5 6.5 0 0 0 11 0z'],
  decide: ['M24 43V28', 'M24 28 11 15V7', 'M24 28l13-13V7', 'M5 13l6-6 6 6', 'M31 13l6-6 6 6'],
  barreira: ['M5 17h38v12H5z', 'M15 17 9 29', 'M27 17l-6 12', 'M39 17l-6 12', 'M11 29v12', 'M37 29v12'],
  frasco: ['M17 5h14', 'M20 5v13L8.6 37.5A3.5 3.5 0 0 0 11.6 43h24.8a3.5 3.5 0 0 0 3-5.5L28 18V5', 'M14 31h20'],
  check: ['M24 5a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z', 'M15 24.5l6.5 6.5L34 17'],
  megafone: ['M6 19v10h7l14 9V10L13 19z', 'M33 17a9 9 0 0 1 0 14', 'M38 11a16 16 0 0 1 0 26'],
  balao: ['M7 7h34v25H22l-10 9v-9H7z', 'M15 16h18', 'M15 24h11'],
  alvo: ['M24 5a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z', 'M24 13a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z', '!M24 21a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  reforco: ['M8 24a16 16 0 0 1 27.5-11L41 18', 'M41 8v10H31', 'M40 24a16 16 0 0 1-27.5 11L7 30', 'M7 40V30h10'],
  estrela: ['M24 4l6.2 12.6 13.8 2-10 9.8 2.4 13.8L24 35.6l-12.4 6.6L14 28.4 4 18.6l13.8-2z'],
  alerta: ['M24 5 3 41h42z', 'M24 18v11', '!M24 33.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z'],
  onda: ['M3 20c5-8 9-8 14 0s9 8 14 0 9-8 14 0', 'M3 34c5-8 9-8 14 0s9 8 14 0 9-8 14 0'],
  setaDir: ['M6 24h34', 'M28 12l12 12-12 12'],
  setaEsq: ['M42 24H8', 'M20 12 8 24l12 12'],
  pausa: ['M24 5a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z', 'M19 16v16', 'M29 16v16'],
  foguete: ['M24 4c8.5 6.5 10.5 17 6 27H18C13.5 21 15.500 10.5 24 4Z', 'M18 31l-7 5 2 7 7-5', 'M30 31l7 5-2 7-7-5', 'M24 14a3.500 3.500 0 1 0 0 7 3.500 3.500 0 0 0 0-7Z'],
  relogio: ['M24 5a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z', 'M24 13v11l8 5'],
  regua: ['M5 31 31 5l12 12-26 26z', 'M13 27l4 4', 'M18 22l3 3', 'M23 17l4 4', 'M28 12l3 3'],
  pino: ['M24 45s15-13.500 15-25a15 15 0 1 0-30 0c0 11.500 15 25 15 25Z', 'M24 14a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z'],
  cerebro: ['M24 9.500v29', 'M24 13c-1-4.500-7.500-5.500-10-1.500-4-.5-7 3.500-5 7-3.500 2-3.500 7 0 9-1.500 4 2 7.500 6 6.500 2 4 7.500 3.500 9-1', 'M24 13c1-4.500 7.500-5.500 10-1.500 4-.5 7 3.500 5 7 3.500 2 3.500 7 0 9 1.500 4-2 7.500-6 6.500-2 4-7.500 3.500-9-1', 'M17 19.500c2.500 0 4 1.500 4 4', 'M31 28.500c-2.500 0-4-1.500-4-4'],
  plano: ['M17 6h14v7H17z', 'M17 9h-6v34h26V9h-6', 'M17 22h14', 'M17 29h14', 'M17 36h8'],
  grafico: ['M6 6v36h36', 'M14 32l8-9 7 6 11-14'],
  lupa: ['M21 6a15 15 0 1 0 0 30 15 15 0 0 0 0-30Z', 'M32 32l11 11'],
  maos: ['M6 30l8-8 8 4h8a3 3 0 0 1 0 6h-8', 'M22 32h10l9-6a3 3 0 0 1 3 5l-12 9H18l-12 2'],
  coroa: ['M6 36h36', 'M6 36 4 14l11 9 9-14 9 14 11-9-2 22'],
  cadeado: ['M10 21h28v21H10z', 'M16 21v-6a8 8 0 0 1 16 0v6'],
  raio: ['M27 4 9 27h13l-3 17 20-25H25z'],
  mensagem: ['M5 9h38v28H5z', 'M5 11l19 15 19-15'],
};
export const ICONES = Object.keys(IC);
// ícone `nome` centrado em (cx, cy) com lado `tam`. o: { c (cor), sw (traço em px de tela), u (0..1, quanto já foi desenhado), fill }
export function icone(nome, cx, cy, tam, o = {}) {
  const ps = IC[nome] ?? IC.pessoa;
  const u = o.u ?? 1;
  if (u <= 0) return '';
  const k = tam / 48, sw = (o.sw ?? 3.2) / k, cor = o.c ?? C.navy, n = ps.length;
  let s = '';
  ps.forEach((d, i) => {
    // cada subcaminho começa um pouco depois do anterior (efeito de desenho em sequência)
    const ui = clamp((u * (n + 1.2) - i * 0.9) / 2.1);
    if (ui <= 0) return;
    if (d[0] === '!') { s += `<path d="${d.slice(1)}" fill="${cor}" opacity="${f(ui)}"/>`; return; }
    const dash = ui >= 1 ? '' : ` pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - ease.inOut(ui))}"`;
    s += `<path d="${d}" fill="${o.fill && ui >= 1 ? o.fill : 'none'}" stroke="${cor}" stroke-width="${f(sw)}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`;
  });
  return `<g transform="translate(${f(cx - tam / 2)} ${f(cy - tam / 2)}) scale(${f(k)})">${s}</g>`;
}
// ícone dentro de um disco (chip circular). o: { fundo, c, r, u (desenho do ícone), k (escala do disco), anel }
export function disco(nome, cx, cy, r, o = {}) {
  const k = o.k ?? 1;
  if (k <= 0.001) return '';
  const body = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${o.fundo ?? C.blue20}"${o.anel ? ` stroke="${o.anel}" stroke-width="${o.asw ?? 3}"` : ''}/>`
    + icone(nome, cx, cy, r * 1.15, { c: o.c ?? C.navy, sw: o.sw ?? 3, u: o.u ?? 1 });
  return pop(k, cx, cy, body);
}

// ---------- título de cena ----------
// linhas: textos com *destaque*. Em fundo claro o destaque ganha um fio laranja por baixo (laranja é detalhe, não texto);
// em fundo navy o destaque vira texto laranja. t0 = instante em que a primeira linha entra.
export function titulo(linhas, x, y, t, t0, o = {}) {
  const s = o.s ?? 62, lh = o.lh ?? s * 1.12, escuro = !!o.escuro, passo = o.passo ?? 0.14;
  let out = '';
  linhas.forEach((ln, i) => {
    const k = fin(t, t0 + i * passo, 0.5);
    if (k <= 0.001) return;
    const yy = y + i * lh;
    let corpo = tRico(ln, x, yy, { f: 'L', s, c: escuro ? C.white : C.navy, hi: escuro ? C.orange : C.navy, a: o.a });
    if (!escuro && o.a == null) {
      let cx = x;
      for (const p of ln.split(/(\*[^*]+\*)/).filter(Boolean)) {
        const limpo = p.replace(/\*/g, ''), w = larg(limpo, s, { f: 'L' });
        if (p.startsWith('*')) {
          const u = ease.out(inv(t0 + i * passo + 0.35, t0 + i * passo + 0.9, t));
          if (u > 0) corpo += `<rect x="${f(cx)}" y="${f(yy + s * 0.16)}" width="${f(w * u)}" height="${f(Math.max(4, s * 0.075))}" fill="${C.orange}"/>`;
        }
        cx += w;
      }
    }
    out += sobe(k, corpo, 30);
  });
  return out;
}
// lede: frase de apoio em azul com a palavra-chave em navy negrito (em navy: navy-20 com branco negrito)
export function lede(str, x, y, t, t0, o = {}) {
  const s = o.s ?? 30, escuro = !!o.escuro;
  const b = bloco(str, x, y, { s, maxW: o.maxW ?? W - 2 * MG, lh: s * 1.22, c: escuro ? C.navy20 : C.blue, hi: escuro ? C.white : C.navy, hw: 700, a: o.a });
  return sobe(fin(t, t0, 0.5), b.svg, 20);
}
