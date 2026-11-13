// Ponto de entrada do vídeo "Mapa de Perfil Cognitivo" (1080 x 1350). window.renderAt(t) desenha o quadro t (render.mjs).
//   ?test=filme    -> o vídeo completo (padrão)
//   ?test=prancha  -> prancha de componentes (ícones, radar, régua, personagens, mapa de trilha, dashboard), um quadro por segundo
//   ?test=uma-<id> -> o mesmo vídeo, mas só com a cena <id> carregada (para trabalhar numa cena sem depender das outras)
import { instalarDefs } from './ludico.js';

const params = new URLSearchParams(location.search);
const TEST = params.get('test') || 'filme';
const FONTS = ['300 20px Inter', '400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter',
  '400 20px "Roboto Condensed"', '500 20px "Roboto Condensed"', '700 20px "Roboto Condensed"'];

async function init() {
  await Promise.all(FONTS.map(f => document.fonts.load(f, 'ÁÃÇçãõéêíóú')));
  await document.fonts.ready;
  instalarDefs(document.getElementById('defs'));
  const dyn = document.getElementById('dyn');
  const [mod, arg] = TEST.split('-');
  const world = await (await import('./' + (mod === 'uma' ? 'filme' : mod) + '.js')).criar(arg);
  window.DURATION = world.duration;
  window.renderAt = t => { dyn.innerHTML = world.frame(t); return true; };
  window.frameAt = t => world.frame(t);
  window.renderAt(Number(params.get('t') || 0));
  window.READY = true;
}
init().catch(e => { window.FAILED = String(e && e.stack || e); console.error(e); });
