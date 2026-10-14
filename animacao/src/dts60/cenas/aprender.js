// Cena "aprender" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · APRENDER', 'aprender'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('aprender', 960, 540, { size: 90, fill: COR.navy });
}
