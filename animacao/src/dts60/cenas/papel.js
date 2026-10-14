// Cena "papel" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · PAPEL', 'papel'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('papel', 960, 540, { size: 90, fill: COR.navy });
}
