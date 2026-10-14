// Cena "foco" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · FOCO', 'foco'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('foco', 960, 540, { size: 90, fill: COR.navy });
}
