// Capa (thumbnail) do vídeo de 60 s para o LinkedIn: node render.mjs stills --test dtscapa --t 3
// O centro da imagem fica livre de texto, porque o LinkedIn desenha o botão de play ali.
import {
  W, H, COR, INK, txt, largura, pilula, cartao, icone, pessoa, fundoCreme, defsFX, bannerDTS, lockupAM, n2,
} from '../dts60/base.js';

const f = n2;

function cronometro(cx, cy, r) {
  let s = '';
  // raios de sol atrás
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    s += `<path d="M${cx},${cy} L${f(cx + Math.cos(a - 0.07) * 900)},${f(cy + Math.sin(a - 0.07) * 900)} L${f(cx + Math.cos(a + 0.07) * 900)},${f(cy + Math.sin(a + 0.07) * 900)}Z" fill="${COR.orange}" opacity=".08"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 1.45}" fill="#fff3e2" opacity=".9"/>`;
  // coroa e botões
  s += `<rect x="${cx - 26}" y="${cy - r - 46}" width="52" height="34" rx="6" fill="${COR.slate}" stroke="${INK}" stroke-width="5"/>`
    + `<rect x="${cx - 62}" y="${cy - r - 78}" width="124" height="40" rx="14" fill="${COR.orange}" stroke="${INK}" stroke-width="5"/>`
    + `<rect x="${cx + r * 0.62}" y="${cy - r * 0.86}" width="40" height="26" rx="6" fill="${COR.lblue}" stroke="${INK}" stroke-width="5" transform="rotate(42 ${cx + r * 0.62 + 20} ${cy - r * 0.86 + 13})"/>`;
  // corpo
  s += `<circle cx="${cx + 10}" cy="${cy + 14}" r="${r + 16}" fill="rgba(22,35,59,.16)"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${r + 16}" fill="#fff" stroke="${INK}" stroke-width="6"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${r - 14}" fill="none" stroke="${COR.orange}" stroke-width="30"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${r - 40}" fill="#fffaf2"/>`;
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * Math.PI * 2, big = i % 5 === 0;
    const r1 = r - 46, r0 = r1 - (big ? 22 : 10);
    s += `<path d="M${f(cx + Math.cos(a) * r0)},${f(cy + Math.sin(a) * r0)} L${f(cx + Math.cos(a) * r1)},${f(cy + Math.sin(a) * r1)}" stroke="${big ? COR.orange : '#c9d4e2'}" stroke-width="${big ? 6 : 3}" stroke-linecap="round"/>`;
  }
  s += txt('60', cx, cy + r * 0.3, { size: r * 0.9, weight: 900, fill: COR.navy, ls: -4 });
  // selo "EM"
  s += `<circle cx="${cx - r * 0.8}" cy="${cy - r * 0.72}" r="${r * 0.27}" fill="${COR.navy}" stroke="#fff" stroke-width="5"/>`
    + `<circle cx="${cx - r * 0.8}" cy="${cy - r * 0.72}" r="${r * 0.21}" fill="none" stroke="${COR.orange}" stroke-width="3" stroke-dasharray="7 6"/>`
    + txt('EM', cx - r * 0.8, cy - r * 0.72 + r * 0.09, { size: r * 0.24, weight: 900, fill: '#fff' });
  // faixa "SEGUNDOS"
  const fw = r * 2.5, fy = cy + r * 0.88;
  s += `<path d="M${f(cx - fw / 2 - 60)},${f(fy + 10)} l60,-34 l0,90 l-60,-10 l22,-24Z" fill="${COR.navy}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    + `<path d="M${f(cx + fw / 2 + 60)},${f(fy + 10)} l-60,-34 l0,90 l60,-10 l-22,-24Z" fill="${COR.navy}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    + `<g transform="rotate(-3 ${cx} ${fy})"><rect x="${f(cx - fw / 2)}" y="${f(fy - 50)}" width="${f(fw)}" height="100" rx="12" fill="${COR.orange}" stroke="${INK}" stroke-width="6"/>`
    + `<rect x="${f(cx - fw / 2 + 12)}" y="${f(fy - 38)}" width="${f(fw - 24)}" height="76" rx="8" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 8" opacity=".8"/>`
    + txt('SEGUNDOS', cx, fy + 26, { size: 72, weight: 900, fill: '#fff', ls: 6 }) + '</g>';
  return s;
}

function capa() {
  let s = defsFX() + fundoCreme(2.2);
  // ---- direita: cronômetro + elenco
  s += cronometro(1420, 400, 205);
  // brilhos
  for (const [x, y, k] of [[1120, 160, 1], [1760, 210, 0.8], [1140, 640, 0.7], [1840, 560, 0.9]]) s += icone('sparkle', x, y, k);
  // palco
  s += `<ellipse cx="1500" cy="1012" rx="420" ry="40" fill="${COR.orange}" opacity=".18"/>`;
  s += pessoa('dir1', { x: 1215, y: 990, s: 0.95, t: 1.3, expr: 'joy', gaze: [0.4, -0.1], armR: 125 });
  s += pessoa('dir2', { x: 1375, y: 990, s: 0.95, t: 2.1, expr: 'joy', gaze: [0.3, -0.1] });
  s += pessoa('dir3', { x: 1535, y: 990, s: 0.95, t: 0.4, expr: 'joy', gaze: [0.2, -0.1], armR: 118 });
  s += pessoa('victor', { x: 1735, y: 1030, s: 1.55, t: 0.6, expr: 'joy', gaze: [-0.4, -0.2], armR: 132, armL: 14, blink: 0 });
  // ---- esquerda: marca, título, assinatura
  s += bannerDTS(9, 0, { x: 90 + 840 * 0.62 / 2, y: 150, s: 0.62, id: 'cp_b', hud: false, pulso: false });
  s += txt('MINHA', 92, 400, { anchor: 'start', size: 118, weight: 900, fill: COR.navy, ls: 2 });
  s += txt('TRAJETÓRIA', 88, 540, { anchor: 'start', size: 132, weight: 900, fill: COR.navy, ls: 1 });
  const wT = largura('TRAJETÓRIA', 132, 900) + 10;
  s += `<path d="M92,578 Q${f(92 + wT / 2)},600 ${f(92 + wT)},570" stroke="${COR.orange}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  s += txt('na', 94, 688, { anchor: 'start', size: 50, weight: 700, family: 'DM Sans', fill: COR.slate });
  s += lockupAM(158, 690, 50, COR.navy, { claro: true }).svg;
  // chips com o que o vídeo mostra
  const chips = [['sparkle', 'IA como método'], ['box', 'Entregas reais'], ['people', 'Liderança por perto']];
  let cx = 92;
  for (const [ic, lab] of chips) {
    const w = largura(lab, 28, 800) + 92;
    s += pilula(cx, 772, w, 70, '#fff', COR.navy, 3.5)
      + `<circle cx="${cx + 35}" cy="807" r="24" fill="#fff4e6"/>` + icone(ic, cx + 35, 807, 0.72)
      + txt(lab, cx + 68, 817, { anchor: 'start', size: 28, weight: 800, fill: COR.navy });
    cx += w + 18;
  }
  // chamada para assistir
  s += pilula(92, 890, 420, 84, COR.navy, INK, 4)
    + `<circle cx="134" cy="932" r="28" fill="${COR.orange}"/><path d="M126,918 L148,932 L126,946Z" fill="#fff"/>`
    + txt('Assista · 1 minuto', 178, 944, { anchor: 'start', size: 34, weight: 800, fill: '#fff' });
  s += txt('JUL → OUT 2026  ·  VICTOR VITORINO  ·  GESTÃO DE MUDANÇAS EM TECNOLOGIA', 94, 1026, { anchor: 'start', size: 19, weight: 700, family: 'DM Sans', fill: COR.grey, ls: 2.5 });
  // faixa tricolor de base, como o banner DTS
  s += `<rect x="0" y="${H - 14}" width="${W * 0.46}" height="14" fill="${COR.orange}"/><rect x="${W * 0.46}" y="${H - 14}" width="${W * 0.3}" height="14" fill="${COR.slate}"/><rect x="${W * 0.76}" y="${H - 14}" width="${W * 0.24}" height="14" fill="${COR.lblue}"/>`;
  return s;
}

export async function criar() {
  return { duration: 6, frame: () => capa() };
}
