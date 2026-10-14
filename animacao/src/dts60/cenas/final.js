// Cena "final" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · FINAL', 'final'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('final', 960, 540, { size: 90, fill: COR.navy });
}
