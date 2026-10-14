// Objetos, ícones e peças de interface da curta DTS (estilo do vídeo Canteiro).
import { n2, esc, measure } from '../core.js';
import { INK } from './pessoas.js';

const f = n2;

export const COR = {
  navy: '#002a46', navy2: '#0d2b4a', navy3: '#16395e', orange: '#f78c16', orange2: '#ffb25c',
  slate: '#39566d', lblue: '#b8cce0', blue: '#2f74b5', blue2: '#5b9bd5', blue3: '#8fbbe3',
  cream: '#f5efe4', grid: '#ebe3d4', tan: '#cdb48f', ink: INK, grey: '#7d8ba3', white: '#ffffff', green: '#2fa36b',
};

export function txt(str, x, y, o = {}) {
  return `<text x="${f(x)}" y="${f(y)}" font-family="${o.family ?? 'Outfit'}" font-weight="${o.weight ?? 800}" font-size="${o.size ?? 32}" fill="${o.fill ?? COR.navy}" text-anchor="${o.anchor ?? 'middle'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.extra ? ' ' + o.extra : ''}>${esc(str)}</text>`;
}

export const largura = (str, size, weight = 800, family = 'Outfit') => measure(str, `${weight} ${size}px ${family === 'Outfit' ? 'Outfit' : '"DM Sans"'}`);

// cartão com sombra deslocada (como os quadros do Canteiro)
export function cartao(x, y, w, h, o = {}) {
  const r = o.r ?? 18;
  return `<rect x="${f(x + 6)}" y="${f(y + 8)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="rgba(22,35,59,.14)"/>`
    + `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${o.fill ?? '#fff'}" stroke="${o.stroke ?? INK}" stroke-width="${o.sw ?? 3.5}"/>`;
}

export function pilula(x, y, w, h, fill, stroke = INK, sw = 3) {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(h / 2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

// ---------- ícones (caixa de 48 x 48 centrada em cx, cy) ----------
export function icone(kind, cx, cy, s = 1, col = COR.orange, ink = INK) {
  const st = `fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"`;
  let b = '';
  switch (kind) {
    case 'dash':
      b = `<rect x="-22" y="-18" width="44" height="36" rx="5" fill="#fff" ${st}/><rect x="-14" y="0" width="7" height="11" fill="${COR.blue2}"/><rect x="-4" y="-7" width="7" height="18" fill="${COR.blue}"/><rect x="6" y="-12" width="7" height="23" fill="${col}"/><path d="M-16,-9 L-6,-13 L4,-10 L16,-15" stroke="${col}" stroke-width="3" fill="none"/>`;
      break;
    case 'deck':
      b = `<rect x="-22" y="-17" width="44" height="28" rx="4" fill="#fff" ${st}/><path d="M0,11 L0,20 M-9,21 L9,21" ${st}/><path d="M-6,-8 L6,-2 L-6,4Z" fill="${col}"/>`;
      break;
    case 'doc':
      b = `<path d="M-15,-21 L7,-21 L16,-12 L16,21 L-15,21Z" fill="#fff" ${st}/><path d="M7,-21 L7,-12 L16,-12" ${st}/><path d="M-8,-5 L9,-5 M-8,3 L9,3 M-8,11 L3,11" stroke="${COR.grey}" stroke-width="3" stroke-linecap="round"/><rect x="-8" y="-14" width="10" height="5" rx="1.5" fill="${col}"/>`;
      break;
    case 'map':
      b = `<path d="M-21,-14 L-7,-19 L7,-14 L21,-19 L21,16 L7,21 L-7,16 L-21,21Z" fill="#fff" ${st}/><path d="M-7,-19 L-7,16 M7,-14 L7,21" stroke="${COR.lblue}" stroke-width="2.5"/><path d="M-14,10 Q-4,-2 10,-4" stroke="${col}" stroke-width="3" stroke-dasharray="4 4" fill="none"/><path d="M12,-12 a6,6 0 1 1 0.1,0 M12,-6 L12,2" stroke="${col}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      break;
    case 'app':
      b = `<rect x="-22" y="-18" width="44" height="36" rx="5" fill="#fff" ${st}/><path d="M-22,-9 L22,-9 M-10,-9 L-10,18" ${st}/><circle cx="-16" cy="-13.5" r="1.8" fill="${col}"/><circle cx="-10" cy="-13.5" r="1.8" fill="${COR.blue2}"/><rect x="-4" y="-3" width="20" height="6" rx="2" fill="${col}"/><rect x="-4" y="7" width="14" height="5" rx="2" fill="${COR.lblue}"/>`;
      break;
    case 'tool':
      b = `<path d="M10,-20 a11,11 0 0 0 -12,15 L-19,12 a4,4 0 0 0 6,6 L4,1 a11,11 0 0 0 15,-12 L12,-4 L5,-7 L3,-13Z" fill="${col}" ${st}/>`;
      break;
    case 'game':
      b = `<path d="M-14,-12 L14,-12 Q24,-12 25,2 L26,12 Q26,18 20,18 Q15,18 12,10 L-12,10 Q-15,18 -20,18 Q-26,18 -26,12 L-25,2 Q-24,-12 -14,-12Z" fill="#fff" ${st}/><path d="M-15,-3 L-15,5 M-19,1 L-11,1" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/><circle cx="12" cy="-2" r="3" fill="${col}"/><circle cx="18" cy="4" r="3" fill="${COR.blue2}"/>`;
      break;
    case 'trophy':
      b = `<path d="M-12,-19 L12,-19 L11,-2 Q0,9 -11,-2Z" fill="${col}" ${st}/><path d="M-12,-14 Q-22,-14 -19,-5 Q-16,1 -10,0 M12,-14 Q22,-14 19,-5 Q16,1 10,0" ${st}/><path d="M0,6 L0,13 M-9,19 L9,19 L7,13 L-7,13Z" fill="${col}" ${st}/>`;
      break;
    case 'compass':
      b = `<circle r="21" fill="#fff" ${st}/><path d="M9,-9 L3,3 L-9,9 L-3,-3Z" fill="${col}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><circle r="2.5" fill="${ink}"/>`;
      break;
    case 'eye':
      b = `<path d="M-23,0 Q0,-22 23,0 Q0,22 -23,0Z" fill="#fff" ${st}/><circle r="8" fill="${col}" stroke="${ink}" stroke-width="3"/><circle cx="2.5" cy="-2.5" r="2.5" fill="#fff"/>`;
      break;
    case 'swap':
      b = `<path d="M-18,-7 L16,-7 M8,-15 L16,-7 L8,1" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M18,9 L-16,9 M-8,1 L-16,9 L-8,17" stroke="${COR.blue}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    case 'bulb':
      b = `<path d="M0,-20 a14,14 0 0 1 8,25 L7,10 L-7,10 L-8,5 a14,14 0 0 1 8,-25Z" fill="${col}" ${st}/><path d="M-6,15 L6,15 M-4,20 L4,20" ${st}/>`;
      break;
    case 'check':
      b = `<circle r="20" fill="${COR.green}" stroke="${ink}" stroke-width="3"/><path d="M-9,0 L-2,8 L10,-7" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    case 'gauge':
      b = `<path d="M-21,10 A21,21 0 1 1 21,10" fill="#fff" ${st}/><path d="M-14,4 A14,14 0 0 1 -4,-10" stroke="${COR.lblue}" stroke-width="5" fill="none"/><path d="M-4,-10 A14,14 0 0 1 14,4" stroke="${col}" stroke-width="5" fill="none"/><path d="M0,6 L11,-9" stroke="${ink}" stroke-width="4" stroke-linecap="round"/><circle cy="6" r="4" fill="${ink}"/>`;
      break;
    case 'coin':
      b = `<circle r="20" fill="${col}" ${st}/><circle r="13" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/><text y="8" font-family="Outfit" font-weight="900" font-size="22" fill="#fff" text-anchor="middle">$</text>`;
      break;
    case 'box':
      b = `<path d="M0,-20 L20,-10 L20,12 L0,22 L-20,12 L-20,-10Z" fill="#fff" ${st}/><path d="M-20,-10 L0,0 L20,-10 M0,0 L0,22" ${st}/><path d="M-7,6 L-2,11 L7,1" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(-6 -4) scale(.8)"/>`;
      break;
    case 'sparkle':
      b = `<path d="M0,-21 Q3,-3 21,0 Q3,3 0,21 Q-3,3 -21,0 Q-3,-3 0,-21Z" fill="${col}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`;
      break;
    case 'code':
      b = `<path d="M-9,-12 L-20,0 L-9,12 M9,-12 L20,0 L9,12 M4,-16 L-4,16" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    case 'chat':
      b = `<path d="M-20,-15 L20,-15 Q22,-15 22,-13 L22,8 Q22,10 20,10 L-4,10 L-13,18 L-11,10 L-20,10 Q-22,10 -22,8 L-22,-13 Q-22,-15 -20,-15Z" fill="#fff" ${st}/><circle cx="-9" cy="-3" r="2.6" fill="${col}"/><circle cx="0" cy="-3" r="2.6" fill="${col}"/><circle cx="9" cy="-3" r="2.6" fill="${col}"/>`;
      break;
    case 'people':
      b = `<circle cx="-8" cy="-9" r="7" fill="${col}" ${st}/><circle cx="10" cy="-6" r="6" fill="${COR.blue2}" ${st}/><path d="M-21,16 Q-20,0 -8,0 Q4,0 5,16Z" fill="${col}" ${st}/><path d="M4,16 Q6,3 11,4 Q21,5 21,16Z" fill="${COR.blue2}" ${st}/>`;
      break;
    case 'flow':
      b = `<rect x="-22" y="-18" width="16" height="12" rx="3" fill="${col}" ${st}/><rect x="6" y="-18" width="16" height="12" rx="3" fill="#fff" ${st}/><rect x="-8" y="6" width="16" height="12" rx="3" fill="${COR.blue2}" ${st}/><path d="M-6,-12 L6,-12 M14,-6 L14,0 L4,6 M-14,-6 L-14,0 L-4,6" ${st}/>`;
      break;
    case 'badge':
      b = `<rect x="-16" y="-20" width="32" height="40" rx="5" fill="#fff" ${st}/><rect x="-10" y="-14" width="20" height="7" rx="2" fill="${col}"/><circle cy="3" r="6" fill="${COR.lblue}" stroke="${ink}" stroke-width="2.5"/><path d="M-8,14 L8,14" stroke="${COR.grey}" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case 'calendar':
      b = `<rect x="-20" y="-16" width="40" height="36" rx="5" fill="#fff" ${st}/><path d="M-20,-16 L20,-16 L20,-5 L-20,-5Z" fill="${col}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/><path d="M-10,-21 L-10,-11 M10,-21 L10,-11" ${st}/><circle cx="-8" cy="5" r="2.5" fill="${ink}"/><circle cx="2" cy="5" r="2.5" fill="${ink}"/><circle cx="12" cy="5" r="2.5" fill="${COR.orange}"/><circle cx="-8" cy="13" r="2.5" fill="${ink}"/>`;
      break;
    default:
      b = `<circle r="18" fill="${col}"/>`;
  }
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(s)})">${b}</g>`;
}

// faísca de pouso
export function faiscas(x, y, age, col = COR.orange, n = 8, r0 = 26, r1 = 70) {
  if (age < 0 || age > 0.5) return '';
  const k = age / 0.5;
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.3;
    const ra = r0 + (r1 - r0) * k, rb = ra + 16 * (1 - k);
    s += `<path d="M${f(x + Math.cos(a) * ra)},${f(y + Math.sin(a) * ra)} L${f(x + Math.cos(a) * rb)},${f(y + Math.sin(a) * rb)}" stroke="${col}" stroke-width="${f(5 * (1 - k) + 1)}" stroke-linecap="round"/>`;
  }
  return s;
}

// Marca A&M em vetor (proporções do logo), para fundo escuro ou claro.
// (ox, oy) = canto inferior esquerdo; k = escala (altura total ~512*k)
export function marcaAM(ox, oy, k, o = {}) {
  const P = (u, v) => `${f(ox + u * k)},${f(oy - (512 - v) * k)}`;
  const c1 = o.c1 ?? COR.navy, c2 = o.c2 ?? COR.blue, c3 = o.c3 ?? COR.blue2, c4 = o.c4 ?? COR.blue3;
  return `<path d="M${P(148, 512)} L${P(235, 512)} L${P(485, 100)} L${P(485, 512)} L${P(545, 512)} L${P(545, 0)} L${P(470, 0)}Z" fill="${c1}"/>`
    + `<path d="M${P(397, 280)} L${P(463, 178)} L${P(463, 512)} L${P(397, 512)}Z" fill="${c2}"/>`
    + `<path d="M${P(567, 180)} L${P(628, 258)} L${P(628, 512)} L${P(567, 512)}Z" fill="${c3}"/>`
    + `<path d="M${P(650, 300)} L${P(700, 355)} L${P(700, 512)} L${P(650, 512)}Z" fill="${c4}"/>`;
}

// prédio A&M: o próprio logo vira arquitetura, com janelas e a porta do DTS
export function predioAM(ox, oy, k, t, doorOpen = 0) {
  let s = marcaAM(ox, oy, k);
  const X = u => ox + u * k, Y = v => oy - (512 - v) * k;
  // janelas nas barras
  let w = '';
  for (const [u0, u1, v0] of [[397, 463, 290], [567, 628, 270], [650, 700, 365]]) {
    for (let v = v0; v < 470; v += 34) {
      w += `<rect x="${f(X(u0 + 10))}" y="${f(Y(v))}" width="${f((u1 - u0 - 20) * k)}" height="${f(14 * k)}" rx="3" fill="#fff" opacity="${f(0.28 + 0.12 * Math.sin(v + t * 2))}"/>`;
    }
  }
  s += w;
  // porta
  const dx = X(567) - 8, dw = (700 - 567) * k + 16, dy = oy - 170;
  s += `<rect x="${f(dx - 14)}" y="${f(dy - 46)}" width="${f(dw + 28)}" height="46" rx="10" fill="${COR.orange}" stroke="${INK}" stroke-width="3.5"/>`
    + txt('DTS', dx + dw / 2, dy - 12, { size: 32, fill: '#fff', weight: 900, ls: 3 })
    + `<rect x="${f(dx)}" y="${f(dy)}" width="${f(dw)}" height="170" fill="#cfe2f3" stroke="${INK}" stroke-width="3.5"/>`
    + `<rect x="${f(dx + 4)}" y="${f(dy + 4)}" width="${f((dw / 2 - 4) * (1 - doorOpen * 0.85))}" height="162" fill="#e8f1fa" stroke="${INK}" stroke-width="2.5"/>`
    + `<rect x="${f(dx + dw - 4 - (dw / 2 - 4) * (1 - doorOpen * 0.85))}" y="${f(dy + 4)}" width="${f((dw / 2 - 4) * (1 - doorOpen * 0.85))}" height="162" fill="#e8f1fa" stroke="${INK}" stroke-width="2.5"/>`
    + `<path d="M${f(dx + 16)},${f(dy + 20)} l18,-10 M${f(dx + 16)},${f(dy + 36)} l30,-18" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
  return s;
}

// robozinho mascote "IA"
export function robo(x, y, t, s = 1, point = 0) {
  const bob = Math.sin(t * 3) * 6;
  const st = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  const blink = (t % 3.1) < 0.12 ? 0.15 : 1;
  const armA = -20 - point * 70 + Math.sin(t * 4) * 4;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="0" rx="46" ry="9" fill="rgba(22,35,59,.16)"/>`
    + `<g transform="translate(0 ${f(-30 + bob)})">`
    + `<path d="M-6,-150 L-6,-176" stroke="${INK}" stroke-width="4"/><circle cx="-6" cy="-182" r="9" fill="${COR.orange}" ${st}/>`
    + `<rect x="-60" y="-152" width="120" height="96" rx="34" fill="#e7f0f8" ${st}/>`
    + `<rect x="-44" y="-136" width="88" height="62" rx="22" fill="${COR.navy}"/>`
    + `<g transform="translate(0 -106) scale(1 ${blink})"><ellipse cx="-17" cy="0" rx="8" ry="10" fill="#7fd3ff"/><ellipse cx="17" cy="0" rx="8" ry="10" fill="#7fd3ff"/></g>`
    + `<path d="M-10,-86 Q0,-80 10,-86" stroke="#7fd3ff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    + `<rect x="-38" y="-52" width="76" height="52" rx="18" fill="#e7f0f8" ${st}/>`
    + txt('IA', 0, -16, { size: 26, fill: COR.orange, weight: 900 })
    + `<g transform="translate(-38 -40) rotate(${f(armA)})"><path d="M0,0 L-34,0" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M0,0 L-34,0" stroke="#e7f0f8" stroke-width="10" stroke-linecap="round"/><circle cx="-38" cy="0" r="9" fill="${COR.orange}" ${st}/></g>`
    + `<path d="M38,-40 Q56,-30 50,-12" stroke="${INK}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M38,-40 Q56,-30 50,-12" stroke="#e7f0f8" stroke-width="10" fill="none" stroke-linecap="round"/>`
    + `</g></g>`;
}

// cavalete com quadro escuro
export function cavalete(x, y, w, h, legH = 260) {
  const st = `stroke="${INK}" stroke-width="5" stroke-linecap="round"`;
  return `<path d="M${f(x + w * 0.25)},${f(y + h - 10)} L${f(x + w * 0.12)},${f(y + h + legH)} M${f(x + w * 0.75)},${f(y + h - 10)} L${f(x + w * 0.88)},${f(y + h + legH)} M${f(x + w * 0.5)},${f(y + h)} L${f(x + w * 0.5)},${f(y + h + legH * 0.9)}" ${st} fill="none"/>`
    + `<path d="M${f(x + w * 0.25)},${f(y + h - 10)} L${f(x + w * 0.12)},${f(y + h + legH)} M${f(x + w * 0.75)},${f(y + h - 10)} L${f(x + w * 0.88)},${f(y + h + legH)}" stroke="#d8b27a" stroke-width="9" stroke-linecap="round"/>`
    + `<path d="M${f(x + w * 0.18)},${f(y + h + legH * 0.55)} L${f(x + w * 0.82)},${f(y + h + legH * 0.55)}" stroke="#d8b27a" stroke-width="8" stroke-linecap="round"/>`
    + `<rect x="${f(x - 10)}" y="${f(y + h - 6)}" width="${f(w + 20)}" height="16" rx="6" fill="#c99a5b" stroke="${INK}" stroke-width="3"/>`;
}
