// Capa do blog Change Management World para o LinkedIn.
// Usa o cenário do filme "Além do raso" (a sala de reunião à noite, a mesa como linha d'água e o iceberg inteiro por baixo),
// sem personagens, com a marca, a chamada e o endereço do blog.
//   capa-blog.html?formato=paisagem   1200 x 627   (post com link e imagem de compartilhamento do site)
//   capa-blog.html?formato=retrato    1080 x 1350  (post de imagem: ocupa mais tela no celular)
//   &url=endereço que aparece na capa (sem https://)
// Os arquivos finais são gerados por producao/capa_blog.mjs.
import { instalarDefs, WL } from './mundo.js';
import { criar } from './filme.js';
import { C, txt, tRico, marca, larg, n2 as f } from './base.js';

const params = new URLSearchParams(location.search);
const FORMATO = params.get('formato') === 'retrato' ? 'retrato' : 'paisagem';
const URL_TXT = params.get('url') || 'change-management-world.vercel.app';
const FONTS = ['400 20px Newsreader', '500 20px Newsreader', 'italic 400 20px Newsreader', '400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter'];
// instante do filme usado como cenário: o gelo inteiro, já debaixo d'água, com o slide de status completo na parede
const T0 = 20.15;
// o iceberg, em coordenadas do mundo (ver V em mundo.js)
const GELO = { x0: 400, x1: 1560, topo: 596, base: 2640, cx: 985 };

// linha ondulada sob "além do raso", como na abertura do site
const onda = (x, y, l, o = {}) => { let d = `M${f(x)} ${f(y)}`; const n = Math.max(2, Math.round(l / (o.passo ?? 112))), p = l / n, a = o.amp ?? 6; for (let i = 0; i < n; i++) d += `q${f(p / 4)} ${-a} ${f(p / 2)} 0t${f(p / 2)} 0`; return `<path d="${d}" fill="none" stroke="${o.c ?? C.suave}" stroke-width="${o.sw ?? 3}" stroke-linecap="round"/>`; };
// marca do blog: o selo e o nome
const nome = (x, y, s) => {
  const a = 'Change Management ', la = larg(a, s, { w: 600 });
  return marca(x + s * 0.86, y - s * 0.34, s * 0.86) + txt(a, x + s * 2.2, y, { w: 600, s, c: '#fff' }) + txt('World', x + s * 2.2 + la, y, { f: 'N', it: true, w: 400, s: s * 1.16, c: C.suave });
};

function paisagem(mundo) {
  const Wv = 1200, Hv = 627, z = 0.226, yAgua = 172;
  // a sala e o gelo ficam à direita; à esquerda, parede e água lisas para o texto
  const cam = { z, cx: 960 - (890 - Wv / 2) / z, cy: WL + (Hv / 2 - yAgua) / z };
  const X = 64;
  let s = mundo.cenario(T0, cam, Wv, Hv);
  s += `<rect width="${Wv}" height="${Hv}" fill="url(#g-capa-lado)"/>`;
  s += nome(X, 76, 21);
  s += txt('Gestão da mudança,', X, 300, { f: 'N', s: 64, c: '#fff' }) + tRico('*além do raso*.', X, 372, { f: 'N', s: 64, hi: C.suave });
  s += onda(X + 2, 390, larg('além do raso', 64, { f: 'N', it: true }) - 4);
  s += txt('Notícias com fonte, ferramentas e modelos', X, 446, { w: 400, s: 21, c: '#E3EBFF' }) + txt('para quem conduz a mudança.', X, 476, { w: 400, s: 21, c: '#E3EBFF' });
  s += txt(URL_TXT, X, 560, { w: 600, s: 20, c: '#fff' }) + txt('Victor Vitorino · Change Management Advisor', X, 590, { w: 500, s: 16, c: '#B9C9EE' });
  return { Wv, Hv, s };
}

function retrato(mundo) {
  const Wv = 1080, Hv = 1350, z = 0.285, yAgua = 690;
  const cam = { z, cx: 960, cy: WL + (Hv / 2 - yAgua) / z };
  const X = 76;
  let s = mundo.cenario(T0, cam, Wv, Hv);
  s += `<rect width="${Wv}" height="${Hv}" fill="url(#g-capa-topo)"/><rect width="${Wv}" height="${Hv}" fill="url(#g-capa-pe)"/>`;
  s += nome(X, 104, 26);
  s += txt('Gestão da mudança,', X, 232, { f: 'N', s: 88, c: '#fff' }) + tRico('*além do raso*.', X, 330, { f: 'N', s: 88, hi: C.suave });
  s += onda(X + 2, 356, larg('além do raso', 88, { f: 'N', it: true }) - 6, { sw: 3.5, passo: 150, amp: 8 });
  s += txt('Notícias com fonte, ferramentas e modelos para quem conduz a mudança.', X, 412, { w: 400, s: 25, c: '#E3EBFF' });
  s += txt(URL_TXT, X, 1284, { w: 600, s: 27, c: '#fff' }) + txt('Victor Vitorino · Change Management Advisor', X, 1319, { w: 500, s: 20, c: '#B9C9EE' });
  return { Wv, Hv, s };
}

async function init() {
  await Promise.all(FONTS.map(fo => document.fonts.load(fo, 'ÁÃÇçãõéêíóú’')));
  await document.fonts.ready;
  const defs = document.getElementById('defs');
  instalarDefs(defs);
  // véus da capa: escurecem o fundo só onde há texto
  defs.insertAdjacentHTML('beforeend', `<linearGradient id="g-capa-lado" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${C.fundo}" stop-opacity=".78"/><stop offset=".42" stop-color="${C.fundo}" stop-opacity=".5"/><stop offset=".62" stop-color="${C.fundo}" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="g-capa-topo" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.fundo}" stop-opacity=".97"/><stop offset=".3" stop-color="${C.fundo}" stop-opacity=".94"/><stop offset=".37" stop-color="${C.fundo}" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="g-capa-pe" x1="0" x2="0" y1="0" y2="1"><stop offset=".84" stop-color="${C.fundo}" stop-opacity="0"/><stop offset="1" stop-color="${C.fundo}" stop-opacity=".7"/></linearGradient>`);
  const mundo = await criar();
  const { Wv, Hv, s } = (FORMATO === 'retrato' ? retrato : paisagem)(mundo);
  const palco = document.getElementById('stage');
  palco.setAttribute('width', Wv); palco.setAttribute('height', Hv); palco.setAttribute('viewBox', `0 0 ${Wv} ${Hv}`);
  document.getElementById('dyn').innerHTML = s;
  window.TAMANHO = [Wv, Hv];
  window.READY = true;
}
init().catch(e => { window.FAILED = String(e && e.stack || e); console.error(e); });
export { GELO };
