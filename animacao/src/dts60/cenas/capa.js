// Cena "capa" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · CAPA', 'capa'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('capa', 960, 540, { size: 90, fill: COR.navy });
}
