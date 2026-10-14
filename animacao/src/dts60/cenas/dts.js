// Cena "dts" (provisória)
import { fundoCreme, chao, txt, COR } from '../base.js';

export const CHIP = ['CENA · DTS', 'dts'];

export function desenhar(t, ctx) {
  return fundoCreme(t) + chao() + txt('dts', 960, 540, { size: 90, fill: COR.navy });
}
