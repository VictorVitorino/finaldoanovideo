// Ponto de entrada. window.renderAt(t) desenha o quadro t (usado pelo render.mjs).
// Sem ?mode=render, a página vira um player com a trilha (build/trilha.wav).
import { loadAssets } from './assets.js';
import { drawChar } from './chars.js';
import { ELENCO, EMPRESAS, RETRATOS } from './roteiro.js';
import { C, text } from './core.js';

const params = new URLSearchParams(location.search);
const MODE = params.get('mode') || 'preview';
const TEST = params.get('test');
if (MODE === 'render') document.body.classList.add('render');

const FONTS = ['600 20px Outfit', '700 20px Outfit', '800 20px Outfit', '900 20px Outfit', '500 20px "DM Sans"', '700 20px "DM Sans"', '800 20px "DM Sans"'];

async function init() {
  await Promise.all(FONTS.map(f => document.fonts.load(f, 'ÁÃÇçãõéêíóú')));
  await document.fonts.ready;
  await loadAssets(document.getElementById('defs'));
  const dyn = document.getElementById('dyn');

  let world;
  if (TEST === 'lineup') world = lineup();
  else if (TEST === 'retratos') world = retratos();
  else {
    const { buildFilm } = await import('./film.js');
    world = buildFilm();
  }
  window.DURATION = world.duration;
  window.renderAt = t => { dyn.innerHTML = world.frame(t); return true; };
  if (MODE !== 'render') preview(world);
  else window.renderAt(0);
  window.READY = true;
}

function preview(world) {
  const wrap = document.getElementById('wrap');
  const fit = () => { const k = Math.min(1, (innerWidth - 32) / 1920); wrap.style.transform = `scale(${k})`; wrap.style.marginBottom = `${-1080 * (1 - k)}px`; };
  fit();
  addEventListener('resize', fit);
  const scrub = document.getElementById('scrub'), time = document.getElementById('time'), play = document.getElementById('play');
  scrub.max = world.duration;
  const audio = new Audio('./build/trilha.wav');
  let playing = false, t0 = 0, start = 0;
  const show = t => { window.renderAt(t); time.textContent = t.toFixed(2) + ' s'; scrub.value = t; };
  play.onclick = () => {
    playing = !playing;
    play.textContent = playing ? '❚❚ Pausar' : '▶ Tocar';
    if (playing) { t0 = +scrub.value; start = performance.now(); audio.currentTime = t0; audio.play().catch(() => {}); loop(); }
    else audio.pause();
  };
  scrub.oninput = () => { show(+scrub.value); if (playing) { t0 = +scrub.value; start = performance.now(); audio.currentTime = t0; } };
  const loop = () => {
    if (!playing) return;
    const t = !audio.paused && audio.readyState >= 2 ? audio.currentTime : t0 + (performance.now() - start) / 1000;
    if (t >= world.duration) { playing = false; play.textContent = '▶ Tocar'; return; }
    show(t);
    requestAnimationFrame(loop);
  };
  show(+(params.get('t') || 0));
}

// Prancha das caricaturas feitas a partir das fotos.
function retratos() {
  const ids = Object.keys(RETRATOS);
  return {
    duration: 2,
    frame(t) {
      let s = `<rect width="1920" height="1080" fill="${C.bg}"/>`;
      s += text('Caricaturas a partir das fotos (na ordem em que chegaram)', 960, 70, { size: 38, weight: 900 });
      ids.forEach((id, i) => {
        const col = i % 6, row = Math.floor(i / 6);
        const x = 190 + col * 308, y = 470 + row * 470;
        s += `<ellipse cx="${x}" cy="${y - 150}" rx="128" ry="150" fill="${['#cfe3ff', '#ffe1cc', '#d3f1e6', '#e3e1ff', '#f9e3c4', '#d6dcff'][(i + row) % 6]}" opacity=".7"/>`;
        s += drawChar(id, { x, y, t: t + i * 0.37, s: 1.75, expr: t < 1 ? 'happy' : 'neutral', blink: 0 });
        s += text(RETRATOS[id].nome, x, y + 46, { size: 30, weight: 900 });
      });
      return s;
    },
  };
}

// Prancha do elenco (teste visual).
function lineup() {
  const comp = Object.keys(EMPRESAS), team = Object.keys(ELENCO);
  const exprs = ['happy', 'neutral', 'surprised', 'worried', 'proud', 'joy', 'serious', 'sly'];
  return {
    duration: 4,
    frame(t) {
      let s = `<rect width="1920" height="1080" fill="${C.bg}"/>`;
      s += text('Personagens das empresas', 960, 70, { size: 40, weight: 900 });
      comp.forEach((id, i) => {
        const x = 150 + i * 232, y = 430;
        s += `<ellipse cx="${x}" cy="${y - 120}" rx="105" ry="110" fill="${['#cfe3ff', '#d6dcff', '#cdeedd', '#d3f1e6', '#dfe7ff', '#f9e3c4', '#e3e1ff', '#ffe1cc'][i]}" opacity=".7"/>`;
        s += drawChar(id, { x, y, t: t + i * 0.3, expr: t < 1 ? 'happy' : exprs[i], talk: t >= 2 && t < 3 ? 1 : 0, armR: t >= 3 ? 70 : undefined, tag: undefined, propR: id === 'cronos' ? 'clipboard' : id === 'acelerado' ? 'wrench' : id === 'obrinha' ? 'blueprint' : undefined, front: id === 'modulo' ? 'tablet' : undefined });
        s += text(EMPRESAS[id].nome, x, y + 40, { size: 26, weight: 800 });
        s += text(EMPRESAS[id].empresa, x, y + 70, { size: 20, weight: 600, fill: C.soft, family: 'DM Sans' });
      });
      s += text('Time', 960, 590, { size: 34, weight: 900 });
      team.forEach((id, i) => {
        const x = 75 + i * 118, y = 900;
        s += drawChar(id, { x, y, s: 1.0, t: t + i * 0.21, expr: exprs[i % exprs.length], lock: id === 'antonialli' && t >= 1 && t < 2 ? 1 : 0 });
        const nome = ELENCO[id].nome.split(' ');
        s += text(nome[0], x, y + 34, { size: 19, weight: 800 });
        if (nome[1]) s += text(nome.slice(1).join(' '), x, y + 56, { size: 15, weight: 600, fill: C.soft, family: 'DM Sans' });
      });
      return s;
    },
  };
}

init().catch(e => { console.error(e); window.FAILED = String(e && e.stack ? e.stack : e); });
