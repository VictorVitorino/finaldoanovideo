// Cena "entregas" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · ENTREGAS', 'entregas'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('entregas', 960, 540, { size: 90, fill: COR.navy });
}
