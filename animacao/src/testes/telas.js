// Prancha de teste das telas reais (src/sf/telas.js): três slides em cima, dois laptops embaixo.
// O slide da esquerda faz push-in (foco) entre 2 s e 4 s; o da direita sai em 3.6 s.
import { C, text } from '../core.js';
import * as T from '../sf/telas.js';

const fundo = () => `<rect width="1920" height="1080" fill="${C.bg}"/>`
  + Array.from({ length: 32 }, (_, i) => `<rect x="${i * 60}" y="0" width="1" height="1080" fill="#000" opacity=".035"/>`).join('')
  + Array.from({ length: 18 }, (_, i) => `<rect x="0" y="${i * 60}" width="1920" height="1" fill="#000" opacity=".035"/>`).join('');
const rot = (s, x, y) => text(s, x, y, { size: 20, weight: 800, fill: '#6b6f7e', anchor: 'start' });

export function criar({ layer }) {
  const cheio = layer !== 'overlay';
  return {
    duration: 6,
    frame(t) {
      let s = `<defs>${T.defs()}</defs>` + (cheio ? fundo() : '');
      s += T.slideReal('visao-integrada', 330, 250, 600, t - 0.1, { rot: -2, foco: [0.52, 0.28, 0.42, 0.45], zoom: (t - 2) / 2 });
      s += T.slideReal('cockpit', 960, 250, 600, t - 0.35, { rot: 1.5 });
      s += T.slideReal('testes', 1590, 250, 600, t - 0.6, { rot: 2.5, fim: 3.6 });
      s += T.laptop(600, 1000, 620, t - 0.3, { tela: 'cockpit-tela1', brilho: true });
      s += T.laptop(1320, 1000, 620, t - 0.7, { tela: 'cockpit-tela2', brilho: true, rot: -1.5 });
      if (cheio) s += rot('slideReal: visão integrada (foco 2–4 s) · cockpit · testes (fim 3.6 s)', 40, 470) + rot('laptop: cockpit-tela1 · cockpit-tela2', 40, 1050);
      return s;
    },
  };
}
