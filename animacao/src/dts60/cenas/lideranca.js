// Cena "lideranca" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · LIDERANCA', 'lideranca'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('lideranca', 960, 540, { size: 90, fill: COR.navy });
}
