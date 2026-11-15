// Ilustrações do blog, todas em SVG de traço fino e nas cores do site (azul profundo, azul vivo e cinza, via variáveis CSS):
// ícones de traço, a marca, o globo animado da abertura e as capas de cada tema.
import { hash } from './md.mjs';

// ---------- ícones (24 x 24, traço) ----------
const I = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  busca: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  setaFora: '<path d="M7 17L17 7M9 7h8v8"/>',
  setaBaixo: '<path d="M6 9l6 6 6-6"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.700-5.700l-1 1M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1"/>',
  agenda: '<rect x="4" y="5.5" width="16" height="14.500" rx="3"/><path d="M4 10h16M8.500 3.500v4M15.500 3.500v4"/>',
  pino: '<path d="M12 21c-4-5-6.500-8-6.500-11.500a6.500 6.500 0 0113 0C18.500 13 16 16 12 21z"/><circle cx="12" cy="9.500" r="2.300"/>',
  relogio: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/>',
  globo: '<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c3 3 3 14 0 17M12 3.500c-3 3-3 14 0 17"/>',
  faisca: '<path d="M12 3.500l1.800 5.200 5.200 1.800-5.200 1.800L12 17.500l-1.800-5.200L5 10.500l5.200-1.800zM18.500 15.500l.8 2.200 2.200.8-2.200.8-.8 2.200-.8-2.200-2.200-.8 2.200-.8z"/>',
  tesoura: '<circle cx="6.500" cy="7" r="2.500"/><circle cx="6.500" cy="17" r="2.500"/><path d="M8.600 8.300L20 17M8.600 15.700L20 7"/>',
  lupa: '<circle cx="10.500" cy="10.500" r="6"/><path d="M15 15l5 5M8 10.500h5M10.500 8v5"/>',
  ciclo: '<path d="M4.500 12a7.500 7.500 0 0113-5.100L20 9M19.500 12a7.500 7.500 0 01-13 5.100L4 15M20 4.500V9h-4.500M4 19.500V15h4.500"/>',
  escudo: '<path d="M12 3.500l7 2.500v5.500c0 4.500-3 7.500-7 9-4-1.500-7-4.500-7-9V6z"/><path d="M9 12l2.200 2.200L15.200 10"/>',
  rota: '<circle cx="6" cy="18" r="2.200"/><circle cx="18" cy="6" r="2.200"/><path d="M8.200 18H15a3 3 0 000-6H9a3 3 0 010-6h6.800"/>',
  bussola: '<circle cx="12" cy="12" r="8.500"/><path d="M15.500 8.500l-2 5-5 2 2-5z"/>',
  video: '<rect x="3.500" y="6" width="12.500" height="12" rx="3"/><path d="M16 10.500l4.500-2.500v8L16 13.500"/>',
  livro: '<path d="M5 5.500A2.500 2.500 0 017.500 3H19v15H7.500A2.500 2.500 0 005 20.500zM5 20.500A2.500 2.500 0 007.500 23H19"/>',
  pessoa: '<circle cx="12" cy="8.500" r="3.800"/><path d="M4.500 20c1-4 4-5.500 7.500-5.500s6.500 1.500 7.500 5.500"/>',
  coracao: '<path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0112 7.500 4.300 4.300 0 0119.500 10c0 5.400-7.500 10-7.500 10z"/>',
  lampada: '<path d="M9 17.500h6M10 20.500h4M12 3.500a6 6 0 00-3.500 10.900c.6.500 1 1.200 1 2v.1h5v-.1c0-.8.4-1.500 1-2A6 6 0 0012 3.500z"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  copia: '<rect x="8.500" y="8.500" width="11" height="11" rx="2.500"/><path d="M15.500 8.500V7A2.500 2.500 0 0013 4.500H7A2.500 2.500 0 004.500 7v6A2.500 2.500 0 007 15.500h1.500"/>',
  grade: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  lista: '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="4.800" cy="7" r="1.200" fill="currentColor"/><circle cx="4.800" cy="12" r="1.200" fill="currentColor"/><circle cx="4.800" cy="17" r="1.200" fill="currentColor"/>',
  linkedin: '<path d="M6.500 9.500v9M6.500 6.200v.1M10.500 18.500v-5a3 3 0 016 0v5M10.500 9.500v9" stroke-width="2.400"/>',
  mao: '<path d="M8.500 12.500V6a1.500 1.500 0 013 0v5M11.500 10.500V4.500a1.500 1.500 0 013 0v6M14.500 10.500V6a1.500 1.500 0 013 0v8.500c0 3.500-2.500 6-6 6h-1c-2 0-3.500-1-4.500-2.500L4 14.500c-.6-1 .6-2.200 1.700-1.400l2.800 2.400"/>',
  marcador: '<path d="M7 4.500h10a1 1 0 011 1V20l-6-4-6 4V5.500a1 1 0 011-1z"/>',
  setaEsq: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  setaCima: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  telefone: '<path d="M8.6 4.5l1.4 3.6-1.9 1.5a9.5 9.5 0 006.3 6.3l1.5-1.9 3.6 1.4V18a1.5 1.5 0 01-1.6 1.5C10.8 19 5 13.2 4.5 6.1A1.5 1.5 0 016 4.5z"/>',
  conversa: '<path d="M12 4a8 8 0 00-6.9 12L4 20l4.1-1.1A8 8 0 1012 4z"/><path d="M9 10.5h6M9 13.5h3.5"/>',
  pausa: '<path d="M8.5 6v12M15.5 6v12" stroke-width="2.6"/>',
  camadas: '<path d="M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4"/>',
  alvo: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
};
export const icone = (nome, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(I[nome] || I.globo).replace(/(\d)\.(\d)00/g, '$1.$2')}</svg>`;

const rnd = h => { let s = h || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

// ---------- marca: o mundo visto abaixo da superfície (um círculo, a linha d'água e um iceberg) ----------
export const marca = (cls = '') => `<svg class="marca ${cls}" viewBox="0 0 48 48" aria-hidden="true">
  <circle cx="24" cy="24" r="21" fill="var(--azul-p)"/>
  <path class="marca-agua" d="M3.1 22A21 21 0 1 0 44.9 22Z" fill="var(--azul)"/>
  <g class="marca-gelo"><path d="M24 8.5l6.2 13.5H17.4z" fill="#fff"/><path d="M14.5 22h19l2.8 7-6.3 9.6-7.6 1.6-7.4-8.4z" fill="#fff" opacity=".42"/></g>
  <path class="marca-onda" d="M3.1 22q5.2-2.4 10.4 0t10.5 0 10.4 0 10.5 0" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`;

// ---------- iceberg da abertura ----------
// Cena de 560 x 1480: céu até a linha d'água (y = 300), a ponta do iceberg acima e a massa submersa abaixo.
// O mergulho e os pontos clicáveis ficam em assets/js/mergulho.js; aqui só o desenho. "recorte" troca o viewBox (imagem de compartilhamento).
export const CENA = { L: 560, A: 1480, agua: 300 };
export function iceberg({ recorte, id = 'ice' } = {}) {
  const { L, A, agua } = CENA, r = rnd(20261114);
  const pol = (pts, attrs) => `<path d="M${pts.map(([x, y]) => `${x} ${y}`).join('L')}Z" ${attrs}/>`;
  // ponta: facetas claras, com a face esquerda iluminada
  const ponta = [
    [[[286, 96], [262, 138], [280, 190], [306, 150]], '#FFFFFF'],
    [[[262, 138], [238, 214], [280, 190]], '#EAF1FE'],
    [[[306, 150], [280, 190], [330, 176]], '#D5E1F8'],
    [[[238, 214], [214, 236], [196, 300], [256, 300], [280, 190]], '#C6D5F3'],
    [[[280, 190], [256, 300], [318, 300], [330, 176]], '#F4F7FD'],
    [[[330, 176], [318, 300], [372, 300], [350, 238]], '#AFC3EC'],
  ].map(([pts, cor]) => pol(pts, `fill="${cor}"`)).join('');
  // massa submersa: contorno esquerdo, direito e espinha, nível a nível; cada faixa vira quatro facetas
  const NIV = [300, 380, 470, 580, 700, 800, 920, 1010, 1120, 1210, 1290];
  const ESQ = [150, 120, 86, 70, 96, 84, 128, 170, 206, 250, 286], DIR = [408, 430, 470, 492, 462, 478, 452, 404, 372, 322, 286];
  const MEIO = [280, 268, 292, 266, 286, 272, 290, 280, 286, 284, 286], DES = [0, 16, -12, 18, -10, 14, -8, 12, -6, 0, 0];
  let massa = '';
  for (let i = 0; i < NIV.length - 1; i++) {
    const e1 = [ESQ[i], NIV[i]], e2 = [ESQ[i + 1], NIV[i + 1]], d1 = [DIR[i], NIV[i]], d2 = [DIR[i + 1], NIV[i + 1]];
    const m1 = [MEIO[i], NIV[i] + DES[i]], m2 = [MEIO[i + 1], NIV[i + 1] + DES[i + 1]];
    const fundo = i / (NIV.length - 1), base = 0.56 - fundo * 0.38;
    const op = k => (base * k * (0.82 + r() * 0.36)).toFixed(2);
    massa += pol([e1, m1, e2], `fill="#CFE0FF" opacity="${op(1.08)}"`) + pol([m1, m2, e2], `fill="#CFE0FF" opacity="${op(0.86)}"`)
      + pol([m1, d1, d2], `fill="#BCD0FA" opacity="${op(0.7)}"`) + pol([m1, d2, m2], `fill="#BCD0FA" opacity="${op(0.56)}"`);
  }
  const contorno = [...ESQ.map((x, i) => [x, NIV[i]]), ...DIR.map((x, i) => [x, NIV[i]]).reverse().slice(1)];
  const gelo = `<g>${massa}${pol(contorno, 'fill="none" stroke="#fff" stroke-opacity=".34" stroke-width="1.2" stroke-linejoin="round"')}<path d="M${MEIO.map((x, i) => `${x} ${NIV[i] + DES[i]}`).join('L')}" fill="none" stroke="#fff" stroke-opacity=".2"/></g><g stroke="#0A2463" stroke-opacity=".1" stroke-width=".8" stroke-linejoin="round">${ponta}</g>`;
  const barco = `<path d="M452 ${agua - 4}h44l-7 11h-30z" fill="#fff"/><path d="M474 ${agua - 4}v-34" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M476 ${agua - 36}l16 26h-16z" fill="#9DBDFF"/><path d="M472 ${agua - 32}l-12 22h12z" fill="#fff" opacity=".85"/>`;
  // ondas: período de 140, três telas de largura para o laço
  const onda = y => `M-280 ${y}${Array.from({ length: 16 }, (_, k) => (k ? 't70 0' : 'q35 -9 70 0')).join('')}`;
  const ondaTras = `<path d="${onda(agua - 5)}V${agua + 30}H-280Z" fill="#5E8DF0" opacity=".5"/>`;
  const ondaFrente = `<path d="${onda(agua)}V${agua + 26}H-280Z" fill="#2A66E0"/><path d="${onda(agua)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/>`;
  const raios = [[104, 26, 70, 96], [226, 34, 240, 110], [352, 22, 322, 84], [462, 30, 488, 104]].map(([x, w, x2, w2]) => `<path d="M${x} ${agua}L${x2 - w2 / 2} ${agua + 640}h${w2}L${x + w} ${agua}Z" fill="url(#${id}-raio)"/>`);
  const bolhas = Array.from({ length: 16 }, () => ({ x: 30 + r() * 500, y: 520 + r() * 900, rr: 2 + r() * 5, d: -r() * 14, t: 9 + r() * 9, dx: (r() - 0.5) * 34 }));
  const plancton = Array.from({ length: 46 }, () => `<circle cx="${(r() * L).toFixed(0)}" cy="${(agua + 40 + r() * (A - agua - 60)).toFixed(0)}" r="${(0.6 + r() * 1.1).toFixed(1)}"/>`);
  const PEIXE = '<path d="M0 6c7-6 17-6 24 0-7 6-17 6-24 0zM24 6l7-5v10z"/>', peixes = [[690, -3, 38, 1], [735, -9, 44, 0.7], [1080, -20, 52, 0.85]];
  const escala = [1, 2, 3, 4, 5, 6].map(k => { const y = agua + k * 160; return `<path d="M0 ${y}h16" stroke="#fff" stroke-opacity=".4"/><text x="22" y="${y + 4}">${k * 10} m</text>`; }).join('');
  const defs = `<defs>
    <linearGradient id="${id}-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A2463"/><stop offset="1" stop-color="#16409C"/></linearGradient>
    <linearGradient id="${id}-mar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A66E0"/><stop offset=".16" stop-color="#1A4CBD"/><stop offset=".42" stop-color="#0F3590"/><stop offset=".72" stop-color="#0A2463"/><stop offset="1" stop-color="#060F2E"/></linearGradient>
    <linearGradient id="${id}-raio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="${id}-halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9DBDFF" stop-opacity=".5"/><stop offset="1" stop-color="#9DBDFF" stop-opacity="0"/></radialGradient>
  </defs>`;
  const ceu = `<rect width="${L}" height="${agua + 6}" fill="url(#${id}-ceu)"/><circle cx="290" cy="170" r="210" fill="url(#${id}-halo)"/><g stroke="#fff" stroke-opacity=".07">${[60, 120, 180, 240].map(y => `<path d="M0 ${y}H${L}"/>`).join('')}</g>`;
  const mar = `<rect y="${agua}" width="${L}" height="${A - agua}" fill="url(#${id}-mar)"/><g font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="#fff" fill-opacity=".5">${escala}</g>`;
  // imagem parada (compartilhamento): tudo em um SVG só, recortado
  if (recorte) return `<svg class="cena" viewBox="${recorte.join(' ')}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}${ceu}${ondaTras}${mar}<g>${raios.join('')}</g><g fill="#fff" opacity=".5">${plancton.join('')}</g>${gelo}${barco}${ondaFrente}</svg>`;
  // cena viva: o que não se move fica em um SVG só; cada parte animada é uma camada do tamanho exato dela,
  // movida só por posição e opacidade (ux.css), sem redesenho a cada quadro
  const pc = (v, total) => (v / total * 100).toFixed(3);
  const caixa = (cls, [x, y, w, h], corpo, estilo = '') => `<svg class="cena-p ${cls}" viewBox="${x} ${y} ${w} ${h}" style="left:${pc(x, L)}%;top:${pc(y, A)}%;width:${pc(w, L)}%;height:${pc(h, A)}%;${estilo}">${corpo}</svg>`;
  const RAIOS = [[104, 26, 70, 96], [226, 34, 240, 110], [352, 22, 322, 84], [462, 30, 488, 104]];
  return `<div class="cena" aria-hidden="true">
  <svg class="cena-c" viewBox="0 0 ${L} ${A}">${defs}${ceu}${mar}<g fill="#fff" opacity=".5">${plancton.filter((_, n) => n % 3).join('')}</g></svg>
  ${caixa('cena-onda cena-onda--tras', [0, agua - 16, L, 16], ondaTras)}
  ${RAIOS.map(([x, w, x2, w2], k) => { const a = Math.min(x, x2 - w2 / 2), b = Math.max(x + w, x2 + w2 / 2); return caixa('cena-raio', [a, agua, b - a, 640], raios[k], `--d:${(k * -2.1).toFixed(1)}s`); }).join('')}
  <svg class="cena-c cena-plancton" viewBox="0 0 ${L} ${A}"><g fill="#fff">${plancton.filter((_, n) => n % 3 === 0).join('')}</g></svg>
  ${peixes.map(([y, d, t, s]) => `<i class="peixe" style="top:${pc(y, A)}%;--l:${(31 * s / L * 100).toFixed(2)}cqw;--d:${d}s;--t:${t}s"><svg viewBox="0 0 31 12">${PEIXE}</svg></i>`).join('')}
  <svg class="cena-c cena-gelo" viewBox="0 0 ${L} ${A}">${gelo}</svg>
  ${caixa('cena-barco', [450, agua - 40, 48, 48], barco)}
  ${caixa('cena-onda cena-onda--frente', [0, agua - 14, L, 42], ondaFrente)}
  ${bolhas.map(b => `<i class="bolha" style="left:${pc(b.x, L)}%;top:${pc(b.y, A)}%;--r:${(b.rr * 2 / L * 100).toFixed(2)}cqw;--x:${(b.dx / L * 100).toFixed(2)}cqw;--d:${b.d.toFixed(1)}s;--t:${b.t.toFixed(1)}s"></i>`).join('')}
  </div>`;
}

// ---------- capas por tema (400 x 240): arte de dados em traço fino ----------
// Variáveis da variante: --bg (fundo), --l (traço), --f1 (elemento-chave), --f2 (acento), --f3 (preenchimento suave).
const L = 'fill="none" stroke="var(--l)" stroke-width="1.3"';
const K = 'fill="none" stroke="var(--f1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ponto = (x, y, r = 4, c = 'f1') => `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--${c})"/>`;
const halo = (x, y, d = 0) => `<circle class="c-halo" style="--d:${d}s" cx="${x}" cy="${y}" r="5" fill="none" stroke="var(--f2)" stroke-width="1.6"/>`;
const MOTIVOS = {
  ia(h) {
    const r = rnd(h), N = [];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) N.push([56 + i * 72 + (r() - 0.5) * 34, 52 + j * 68 + (r() - 0.5) * 30]);
    let s = '';
    for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) {
      const a = N[j * 5 + i];
      if (i < 4) { const b = N[j * 5 + i + 1]; s += `<path d="M${a[0].toFixed(0)} ${a[1].toFixed(0)}L${b[0].toFixed(0)} ${b[1].toFixed(0)}" ${L}/>`; }
      if (j < 2 && (i + j) % 2 === 0) { const b = N[(j + 1) * 5 + i]; s += `<path d="M${a[0].toFixed(0)} ${a[1].toFixed(0)}L${b[0].toFixed(0)} ${b[1].toFixed(0)}" ${L}/>`; }
    }
    const cam = [0, 1, 6, 7, 12, 13, 14].map(k => N[k]);
    s += `<path class="c-desenha" pathLength="1" d="M${cam.map(p => p[0].toFixed(0) + ' ' + p[1].toFixed(0)).join('L')}" fill="none" stroke="var(--f2)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += N.map((p, k) => ponto(p[0].toFixed(0), p[1].toFixed(0), [0, 6, 7, 14].includes(k) ? 5.5 : 3, [0, 6, 7, 14].includes(k) ? 'f1' : 'l')).join('');
    return s + halo(cam[6][0].toFixed(0), cam[6][1].toFixed(0)) + halo(cam[3][0].toFixed(0), cam[3][1].toFixed(0), 1.2);
  },
  mundo() {
    const cx = 286, cy = 150, R = 128;
    const par = [-90, -45, 0, 45, 90].map(dy => { const rx = Math.sqrt(R * R - dy * dy); return `<ellipse cx="${cx}" cy="${cy + dy}" rx="${rx.toFixed(0)}" ry="${(rx * 0.14).toFixed(0)}" ${L}/>`; }).join('');
    return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="var(--f3)"/>${par}<ellipse cx="${cx}" cy="${cy}" rx="46" ry="${R}" ${L}/><ellipse cx="${cx}" cy="${cy}" rx="92" ry="${R}" ${L}/><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--f1)" stroke-width="1.6"/>`
      + `<path class="c-desenha" pathLength="1" d="M74 84Q170 20 250 96" ${K} stroke="var(--f2)"/><path class="c-desenha c-desenha--b" pathLength="1" d="M74 84Q150 150 214 176" ${K} stroke="var(--f2)"/><path class="c-desenha c-desenha--c" pathLength="1" d="M250 96Q330 80 352 150" ${K}/>`
      + ponto(74, 84, 5.5) + ponto(250, 96) + ponto(214, 176) + ponto(352, 150) + halo(74, 84) + halo(352, 150, 1.4);
  },
  transformacao(h) {
    const hs = [[34, 46, 58, 82, 108, 138], [52, 44, 66, 60, 96, 132], [30, 58, 50, 88, 84, 140]][h % 3];
    const b = hs.map((v, i) => `<rect class="c-sobe" style="--d:${(i * 0.09).toFixed(2)}s" x="${70 + i * 46}" y="${196 - v}" width="26" height="${v}" fill="var(--${i > 3 ? 'f2' : 'f3'})" stroke="var(--${i > 3 ? 'f2' : 'l'})" stroke-width="1.3"/>`).join('');
    const pts = hs.map((v, i) => `${83 + i * 46} ${196 - v - 22}`);
    return `<path d="M50 196H360M50 196V40" ${L}/>` + [76, 116, 156].map(y => `<path d="M50 ${y}H360" ${L} stroke-dasharray="2 6" opacity=".6"/>`).join('') + b
      + `<path class="c-desenha" pathLength="1" d="M${pts.join('L')}" ${K}/>` + ponto(313, 196 - hs[5] - 22, 5.5) + halo(313, 196 - hs[5] - 22);
  },
  'carve-out'(h) {
    let s = '';
    const j0 = (h >> 2) % 2 ? 2 : 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const x = 72 + i * 36, y = 50 + j * 36, sai = i > 1 && j >= j0 && j < j0 + 2;
      s += sai ? `<rect x="${x}" y="${y}" width="30" height="30" ${L} stroke-dasharray="3 4"/>` : `<rect x="${x}" y="${y}" width="30" height="30" fill="var(--f3)" stroke="var(--l)" stroke-width="1.3"/>`;
    }
    const by = 50 + j0 * 36;
    const bloco = [0, 1].map(j => [0, 1].map(i => `<rect x="${144 + i * 36}" y="${by + j * 36}" width="30" height="30" fill="var(--f2)"/>`).join('')).join('');
    return s + `<path d="M214 ${by + 16}H258M214 ${by + 52}H258" ${L} stroke-dasharray="2 5"/><g class="c-separa">${bloco}<rect x="138" y="${by - 6}" width="78" height="78" fill="none" stroke="var(--f1)" stroke-width="1.6"/></g>`
      + `<path d="M72 208H216" ${K}/><path d="M252 208H330" ${K} stroke="var(--f2)"/>` + ponto(72, 208, 3.5) + ponto(216, 208, 3.5) + ponto(252, 208, 3.5, 'f2') + ponto(330, 208, 3.5, 'f2');
  },
  'due-diligence'(h) {
    let s = '';
    const fx = [174, 226, 252][h % 3], fy = [118, 118, 106][h % 3], fr = 50;
    for (let j = 0; j < 7; j++) for (let i = 0; i < 12; i++) {
      const x = 57 + i * 26, y = 42 + j * 26, d = Math.hypot(x - fx, y - fy);
      s += d < fr - 4 ? ponto(x, y, 4.2, (i + j) % 3 === 0 ? 'f2' : 'f1') : ponto(x, y, 2, 'l');
    }
    return s + `<g class="c-foco"><circle cx="${fx}" cy="${fy}" r="${fr}" fill="var(--f3)" stroke="var(--f1)" stroke-width="2"/><path d="M${fx - fr - 16} ${fy}H${fx - fr + 10}M${fx + fr - 10} ${fy}H${fx + fr + 16}M${fx} ${fy - fr - 16}V${fy - fr + 10}M${fx} ${fy + fr - 10}V${fy + fr + 16}" ${K} stroke-width="1.6"/><path d="M${fx + 36} ${fy + 36}L${fx + 74} ${fy + 74}" ${K} stroke-width="3"/></g>`;
  },
  'governanca-ti'() {
    const cx = [78, 139, 200, 261, 322];
    return `<path class="c-desenha" pathLength="1" d="M200 62V88M110 114V88H290V114M200 88V114" ${K} stroke-width="1.6"/>`
      + `<path d="M110 144V166M78 190V166H139V190M200 144V190M290 144V166M261 190V166H322V190" ${L}/>`
      + `<rect x="150" y="34" width="100" height="28" fill="var(--f2)"/>` + [110, 200, 290].map(x => `<rect x="${x - 42}" y="114" width="84" height="30" fill="var(--f3)" stroke="var(--f1)" stroke-width="1.5"/>`).join('')
      + cx.map(x => `<rect x="${x - 24}" y="190" width="48" height="22" ${L}/>`).join('')
      + `<path d="M188 48l8 8 14-15" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` + halo(250, 34, .6);
  },
  adocao() {
    const curva = 'M52 192C120 190 150 170 190 128S270 58 352 52';
    const m = [[82, 189], [146, 168], [190, 128], [246, 82], [318, 56]];
    return `<path d="M52 204H360M52 204V36" ${L}/><path d="${curva}V204H52Z" fill="var(--f3)"/><path d="M190 36V204" ${L} stroke-dasharray="3 5"/>`
      + `<path class="c-desenha" pathLength="1" d="${curva}" ${K} stroke-width="2.4"/>`
      + m.map(([x, y], i) => i === 2 ? ponto(x, y, 6.5, 'f2') : `<circle cx="${x}" cy="${y}" r="4.5" fill="var(--bg)" stroke="var(--f1)" stroke-width="2"/>`).join('') + halo(190, 128);
  },
  brasil() {
    const ond = [0, 1, 2, 3, 4, 5].map(i => `<path ${i === 3 ? `class="c-desenha" pathLength="1" ${K} stroke="var(--f2)"` : L} d="M24 ${58 + i * 28}c44-20 78 20 122 0s78 20 122 0 78 20 122 0"/>`).join('');
    return ond + `<circle cx="268" cy="142" r="30" fill="var(--f3)" stroke="var(--f1)" stroke-width="1.6"/>` + ponto(268, 142, 6) + halo(268, 142);
  },
  video() {
    return `<circle cx="200" cy="120" r="78" ${L}/><circle cx="200" cy="120" r="56" fill="var(--f3)" stroke="var(--f1)" stroke-width="1.6"/><path d="M188 96v48l40-24z" fill="var(--f2)"/><path class="c-desenha" pathLength="1" d="M92 120a108 108 0 01216 0" ${K} stroke="var(--f2)"/>` + halo(308, 120);
  },
  evento() {
    let s = `<rect x="88" y="44" width="224" height="160" ${L}/><path d="M88 80H312" ${K}/>`;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) { const q = j === 1 && i === 3; s += `<rect x="${104 + i * 34}" y="${96 + j * 34}" width="24" height="24" ${q ? 'fill="var(--f2)"' : L}/>`; }
    return s + halo(218, 142);
  },
};
export const TEM_MOTIVO = Object.keys(MOTIVOS);
export function capa(tema, semente = '', o = {}) {
  const h = hash(semente + tema), v = o.variante ?? ['a', 'b', 'c', 'b', 'a', 'c'][h % 6];
  const m = MOTIVOS[tema] || MOTIVOS.mundo;
  // metade das capas é espelhada para variar; gráficos com sentido de leitura (crescimento, curva de adoção) nunca
  const espelha = (h >> 5) % 2 === 1 && !['transformacao', 'adocao', 'governanca-ti'].includes(tema);
  const linhas = [48, 96, 144, 192].map(y => `<path d="M0 ${y}H400" stroke="var(--l)" stroke-width=".6" opacity=".35"/>`).join('');
  return `<svg class="capa capa--${v}${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="240" fill="var(--bg)"/>${linhas}
  <g class="c-motivo"${espelha ? ' transform="translate(400 0) scale(-1 1)"' : ''}>${m(h)}</g></svg>`;
}
