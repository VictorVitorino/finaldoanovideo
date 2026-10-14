// Cena "chegada" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · CHEGADA', 'chegada'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('chegada', 960, 540, { size: 90, fill: COR.navy });
}
