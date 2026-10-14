// Prancha do elenco da curta DTS: node render.mjs stills --test dtselenco --t 0.5
import { pessoa } from '../dts/pessoas.js';

export async function criar() {
  const ids = ['victor', 'dir1', 'dir2', 'dir3', 'col1', 'col2'];
  return {
    duration: 2,
    frame: t => `<rect width="1920" height="1080" fill="#f5efe4"/>`
      + ids.map((id, i) => pessoa(id, { id, x: 220 + i * 300, y: 640, s: 1.5, t, expr: i === 0 ? 'joy' : 'smile', wave: i === 2 ? 1 : 0 })).join('')
      + ids.map((id, i) => pessoa(id, { x: 220 + i * 300, y: 1040, s: 1.2, t, walk: t * 1.6 + i * 0.2 })).join(''),
  };
}
