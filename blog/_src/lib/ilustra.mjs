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
};
export const icone = (nome, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(I[nome] || I.globo).replace(/(\d)\.(\d)00/g, '$1.$2')}</svg>`;

// ---------- marca: um globo de traço fino com um ponto em órbita ----------
export const marca = (cls = '') => `<svg class="marca ${cls}" viewBox="0 0 48 48" aria-hidden="true">
  <circle cx="24" cy="24" r="14.5" fill="var(--azul-p)"/>
  <g fill="none" stroke="#fff" stroke-width="1.4" opacity=".9"><ellipse class="marca-meridiano" cx="24" cy="24" rx="6.2" ry="14.5"/><path d="M9.5 24h29M12 17h24M12 31h24" opacity=".6"/></g>
  <g class="marca-orbita"><ellipse cx="24" cy="24" rx="21.5" ry="8.5" fill="none" stroke="var(--azul)" stroke-width="1.6" transform="rotate(-24 24 24)"/><circle cx="43.6" cy="15.3" r="3.1" fill="var(--azul)"/></g></svg>`;

// ---------- globo da abertura (sobre fundo azul profundo) ----------
// Esfera em traço fino: meridianos que giram, paralelos, rotas entre pontos, pulsos e um satélite em órbita.
export function globo() {
  const C = 280, R = 204;
  const mer = [0, 1, 2, 3, 4, 5, 6].map(i => `<ellipse class="g-mer" style="--d:${(-i * 2.3).toFixed(2)}s" cx="${C}" cy="${C}" rx="${R}" ry="${R}"/>`).join('');
  const par = [-150, -100, -50, 0, 50, 100, 150].map(dy => { const rx = Math.sqrt(R * R - dy * dy); return `<ellipse cx="${C}" cy="${C + dy}" rx="${rx.toFixed(1)}" ry="${(rx * 0.13).toFixed(1)}"/>`; }).join('');
  const P = [[196, 190], [352, 164], [396, 286], [246, 330], [330, 392], [150, 280]];
  const rotas = [[0, 1], [1, 2], [0, 3], [3, 4], [5, 3], [2, 4]].map(([a, b], i) => {
    const [x1, y1] = P[a], [x2, y2] = P[b], mx = (x1 + x2) / 2 + (y1 - y2) * 0.28, my = (y1 + y2) / 2 + (x2 - x1) * 0.28 - 18;
    return `<path class="g-rota" style="--d:${(i * 0.9).toFixed(1)}s" pathLength="1" d="M${x1} ${y1}Q${mx.toFixed(0)} ${my.toFixed(0)} ${x2} ${y2}"/>`;
  }).join('');
  const pinos = P.map(([x, y], i) => `<g class="g-pino" style="--d:${(i * 0.7).toFixed(2)}s" transform="translate(${x} ${y})"><circle class="g-onda" r="5"/><circle r="4.5" fill="#fff"/></g>`).join('');
  return `<svg class="globo" viewBox="0 0 560 560" aria-hidden="true">
  <defs>
    <radialGradient id="g-esfera" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#5B8DF5" stop-opacity=".5"/><stop offset=".6" stop-color="#2F6FED" stop-opacity=".16"/><stop offset="1" stop-color="#2F6FED" stop-opacity="0"/></radialGradient>
    <clipPath id="g-clip"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
    <path id="g-orbita" d="M30 280C30 214 142 160 280 160s250 54 250 120-112 120-250 120S30 346 30 280z" transform="rotate(-20 280 280)"/>
  </defs>
  <use href="#g-orbita" class="g-anel g-anel--tras"/>
  <circle cx="${C}" cy="${C}" r="${R}" fill="url(#g-esfera)"/>
  <g clip-path="url(#g-clip)" fill="none" stroke="#fff" stroke-width="1" opacity=".34">${mer}</g>
  <g fill="none" stroke="#fff" stroke-width="1" opacity=".2">${par}</g>
  <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/>
  <g fill="none" stroke="#8FB4FF" stroke-width="1.6" stroke-linecap="round">${rotas}</g>
  ${pinos}
  <use href="#g-orbita" class="g-anel g-anel--frente"/>
  <g class="g-sat"><circle r="16" fill="#2F6FED" opacity=".25"/><circle r="6" fill="#fff"/>
    <animateMotion dur="18s" repeatCount="indefinite" rotate="0"><mpath href="#g-orbita"/></animateMotion></g>
  </svg>`;
}

// ---------- capas por tema (400 x 240): arte de dados em traço fino ----------
// Variáveis da variante: --bg (fundo), --l (traço), --f1 (elemento-chave), --f2 (acento), --f3 (preenchimento suave).
const L = 'fill="none" stroke="var(--l)" stroke-width="1.3"';
const K = 'fill="none" stroke="var(--f1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ponto = (x, y, r = 4, c = 'f1') => `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--${c})"/>`;
const halo = (x, y, d = 0) => `<circle class="c-halo" style="--d:${d}s" cx="${x}" cy="${y}" r="5" fill="none" stroke="var(--f2)" stroke-width="1.6"/>`;
const rnd = h => { let s = h || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
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
  transformacao() {
    const hs = [34, 46, 58, 82, 108, 138];
    const b = hs.map((v, i) => `<rect class="c-sobe" style="--d:${(i * 0.09).toFixed(2)}s" x="${70 + i * 46}" y="${196 - v}" width="26" height="${v}" fill="var(--${i > 3 ? 'f2' : 'f3'})" stroke="var(--${i > 3 ? 'f2' : 'l'})" stroke-width="1.3"/>`).join('');
    const pts = hs.map((v, i) => `${83 + i * 46} ${196 - v - 22}`);
    return `<path d="M50 196H360M50 196V40" ${L}/>` + [76, 116, 156].map(y => `<path d="M50 ${y}H360" ${L} stroke-dasharray="2 6" opacity=".6"/>`).join('') + b
      + `<path class="c-desenha" pathLength="1" d="M${pts.join('L')}" ${K}/>` + ponto(313, 36, 5.5) + halo(313, 36);
  },
  'carve-out'() {
    let s = '';
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const x = 72 + i * 36, y = 50 + j * 36, sai = i > 1 && j < 2;
      s += sai ? `<rect x="${x}" y="${y}" width="30" height="30" ${L} stroke-dasharray="3 4"/>` : `<rect x="${x}" y="${y}" width="30" height="30" fill="var(--f3)" stroke="var(--l)" stroke-width="1.3"/>`;
    }
    const bloco = [0, 1].map(j => [0, 1].map(i => `<rect x="${144 + i * 36}" y="${50 + j * 36}" width="30" height="30" fill="var(--f2)"/>`).join('')).join('');
    return s + `<path d="M214 66H250M214 102H250" ${L} stroke-dasharray="2 5"/><g class="c-separa">${bloco}<rect x="138" y="44" width="78" height="78" fill="none" stroke="var(--f1)" stroke-width="1.6"/></g>`
      + `<path d="M72 208H216" ${K}/><path d="M252 208H330" ${K} stroke="var(--f2)"/>` + ponto(72, 208, 3.5) + ponto(216, 208, 3.5) + ponto(252, 208, 3.5, 'f2') + ponto(330, 208, 3.5, 'f2');
  },
  'due-diligence'() {
    let s = '';
    const fx = 226, fy = 118, fr = 50;
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
  const linhas = [48, 96, 144, 192].map(y => `<path d="M0 ${y}H400" stroke="var(--l)" stroke-width=".6" opacity=".35"/>`).join('');
  return `<svg class="capa capa--${v}${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="240" fill="var(--bg)"/>${linhas}
  <g class="c-motivo">${m(h)}</g></svg>`;
}
