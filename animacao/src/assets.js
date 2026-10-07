// Logos carregados uma vez em <defs> e reutilizados com <use> (sem piscar entre quadros).
import { n2 } from './core.js';

export const LOGO_NAMES = ['totvs', 'alvarez-marsal', 'unimed', 'funed', 'caoa', 'john-deere', 'hughes', 'libercon'];
export const LOGO = {};

export async function loadAssets(defs) {
  let d = '';
  for (const n of LOGO_NAMES) {
    const img = new Image();
    img.src = `./assets/logos/${n}.png`;
    await img.decode();
    LOGO[n] = { w: img.naturalWidth, h: img.naturalHeight };
    d += `<image id="logo-${n}" href="./assets/logos/${n}.png" width="${img.naturalWidth}" height="${img.naturalHeight}"/>`;
  }
  const grain = new Image();
  grain.src = './assets/grain.png';
  await grain.decode();
  d += `<pattern id="grain" patternUnits="userSpaceOnUse" width="256" height="256"><image href="./assets/grain.png" width="256" height="256"/></pattern>`;
  d += `<radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset="58%" stop-color="#1a1005" stop-opacity="0"/><stop offset="100%" stop-color="#1a1005" stop-opacity=".30"/></radialGradient>`;
  d += `<radialGradient id="glow" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#fffaf0" stop-opacity=".5"/><stop offset="100%" stop-color="#fffaf0" stop-opacity="0"/></radialGradient>`;
  d += `<filter id="ds" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#2a1a05" flood-opacity=".2"/></filter>`;
  d += `<filter id="dsSoft" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#2a1a05" flood-opacity=".16"/></filter>`;
  d += `<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>`;
  d += `<filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>`;
  d += `<linearGradient id="wipe" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0c2f57"/><stop offset="55%" stop-color="#0b5ed7"/><stop offset="100%" stop-color="#4aa3ff"/></linearGradient>`;
  d += `<radialGradient id="spot" cx="50%" cy="62%" r="48%"><stop offset="0%" stop-color="#fff6d6" stop-opacity=".22"/><stop offset="100%" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>`;
  d += `<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffd76a"/><stop offset="100%" stop-color="#e5a020"/></linearGradient>`;
  d += `<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1b2550"/><stop offset="100%" stop-color="#3a3f78"/></linearGradient>`;
  defs.innerHTML = d;
  // Pré-aquece: desenha cada logo uma vez (quase invisível) para o navegador já ter a imagem decodificada.
  const warm = document.getElementById('warm');
  if (warm) warm.innerHTML = LOGO_NAMES.map((n, i) => `<use href="#logo-${n}" transform="translate(${i * 20} 0) scale(0.05)"/>`).join('') + '<rect width="10" height="10" fill="url(#grain)"/>';
  await new Promise(r => setTimeout(r, 300));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
}

// Logo centrado em (x, y) com altura h (ou largura máxima maxW).
export function logo(name, x, y, h, maxW = Infinity) {
  const L = LOGO[name];
  let s = h / L.h;
  if (L.w * s > maxW) s = maxW / L.w;
  return `<use href="#logo-${name}" transform="translate(${n2(x - (L.w * s) / 2)} ${n2(y - (L.h * s) / 2)}) scale(${n2(s)})"/>`;
}

export function logoSize(name, h, maxW = Infinity) {
  const L = LOGO[name];
  let s = h / L.h;
  if (L.w * s > maxW) s = maxW / L.w;
  return { w: L.w * s, h: L.h * s };
}
