// Cena "ia" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · IA', 'ia'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('ia', 960, 540, { size: 90, fill: COR.navy });
}
