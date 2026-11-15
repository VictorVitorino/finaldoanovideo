// Ponto de entrada do vídeo "Além do raso" (16:9, 1920 x 1080). window.renderAt(t) desenha o quadro t (render.mjs).
//   ?test=filme -> o vídeo completo (padrão)
// window.INTERATIVO traz os tempos e as posições usados pelo player do site (capítulos, legendas, pontos clicáveis).
import { instalarDefs } from './mundo.js';
import { criar } from './filme.js';

const params = new URLSearchParams(location.search);
const FONTS = ['400 20px Newsreader', '500 20px Newsreader', 'italic 400 20px Newsreader', '500 20px Inter', '600 20px Inter', '700 20px Inter'];

async function init() {
  await Promise.all(FONTS.map(f => document.fonts.load(f, 'ÁÃÇçãõéêíóú’')));
  await document.fonts.ready;
  instalarDefs(document.getElementById('defs'));
  const dyn = document.getElementById('dyn');
  const world = await criar();
  window.DURATION = world.duration;
  window.INTERATIVO = world.interativo();
  window.renderAt = t => { dyn.innerHTML = world.frame(t); return true; };
  window.frameAt = t => world.frame(t);
  window.renderAt(Number(params.get('t') || 0));
  // modo de prévia: toca com a trilha (abra raso.html sem ?mode=render)
  if (params.get('mode') !== 'render') {
    const audio = new Audio(world.audio); let t0 = 0, tocando = false;
    const passo = () => { if (!tocando) return; const t = audio.currentTime; window.renderAt(Math.min(world.duration, t)); requestAnimationFrame(passo); };
    document.body.addEventListener('click', () => { tocando = !tocando; if (tocando) { audio.play(); passo(); } else audio.pause(); });
    document.body.classList.remove('render');
  }
  window.READY = true;
}
init().catch(e => { window.FAILED = String(e && e.stack || e); console.error(e); });
