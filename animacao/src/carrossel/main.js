// Ponto de entrada do carrossel (1080 x 1350). window.renderAt(t) desenha o quadro t (usado pelo render.mjs).
//   ?test=video   -> vídeo das 3 páginas animadas   (padrão)
//   ?test=paginas -> as 3 páginas paradas, uma por segundo (para o PDF do carrossel)
const params = new URLSearchParams(location.search);
const TEST = params.get('test') || 'video';
const FONTS = ['500 20px "Barlow Condensed"', '600 20px "Barlow Condensed"', '700 20px "Barlow Condensed"', '800 20px "Barlow Condensed"',
  '400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '400 20px "JetBrains Mono"', '500 20px "JetBrains Mono"', '600 20px "JetBrains Mono"'];

async function init() {
  await Promise.all(FONTS.map(f => document.fonts.load(f, 'ÁÃÇçãõéêíóú')));
  await document.fonts.ready;
  const dyn = document.getElementById('dyn');
  const world = await (await import('./' + TEST + '.js')).criar();
  window.DURATION = world.duration;
  window.renderAt = t => { dyn.innerHTML = world.frame(t); return true; };
  window.frameAt = t => world.frame(t);
  window.renderAt(Number(params.get('t') || 0));
  window.READY = true;
}
init().catch(e => { window.FAILED = String(e && e.stack || e); console.error(e); });
