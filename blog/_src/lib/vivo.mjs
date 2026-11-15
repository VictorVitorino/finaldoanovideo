// Desenhos com movimento, no vocabulário do guia de efeitos:
// ícones de linha que se desenham na entrada e reagem ao cursor (Icon Motion) e os motivos das capas dos livros. O movimento fica em assets/css/jornada.css.
import { esc } from './md.mjs';

// ---------- ícones de linha (48 x 48) ----------
// Cada forma é desenhada na entrada (pathLength = 1). Classes m1, m2, m3 marcam as partes que se movem no hover;
// "p" marca pontos cheios, que aparecem depois do traço.
const V = {
  camadas: '<path class="m1" d="M24 8l15 7.5-15 7.5-15-7.5z"/><path d="M9 24l15 7.5 15-7.5"/><path class="m3" d="M9 32.5l15 7.5 15-7.5"/>',
  subida: '<path d="M8 40h32"/><g class="m1"><path d="M10 35c9-1 12-7 16-13s8-10 14-11"/><path d="M32.5 10.5H40V18"/></g><circle class="p" cx="10" cy="35" r="2.4"/>',
  orbita: '<circle cx="24" cy="24" r="15"/><g class="m1 gira"><circle class="p" cx="24" cy="9" r="3.6"/><circle class="p" cx="37" cy="31.5" r="3.6"/><circle class="p" cx="11" cy="31.5" r="3.6"/></g><circle class="p" cx="24" cy="24" r="2.6"/>',
  painel: '<path d="M9 33a15 15 0 0130 0"/><path d="M24 18v3M13.4 22.4l2.1 2.1M34.6 22.4l-2.1 2.1"/><path d="M9 39h30"/><path class="m1 agulha" d="M24 33l-8-7"/><circle class="p" cx="24" cy="33" r="2.4"/>',
  tela: '<rect x="7" y="9" width="34" height="23" rx="3"/><path d="M18 39h12M24 32v7"/><path class="m1 pulsa" d="M12 23h7l3-7 4 12 3-5h7"/>',
  cascata: '<circle cx="24" cy="11" r="4.5"/><path d="M24 15.5v7M11 28.5v-6h26v6M24 22.5v6"/><circle class="m1" cx="11" cy="33.5" r="4"/><circle class="m2" cx="24" cy="33.5" r="4"/><circle class="m3" cx="37" cy="33.5" r="4"/>',
  relogio: '<circle cx="24" cy="24" r="16"/><path d="M24 24l7 4"/><path class="m1 gira" d="M24 24V13"/><circle class="p" cx="24" cy="24" r="2"/>',
  faisca: '<path d="M22 7l3.2 9.8L35 20l-9.8 3.2L22 33l-3.2-9.8L9 20l9.8-3.2z"/><path class="m1" d="M36 29l1.5 4.5L42 35l-4.5 1.5L36 41l-1.5-4.5L30 35l4.5-1.5z"/><path class="m2" d="M38 7v6M35 10h6"/>',
  radar: '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="8.5"/><path class="m1 gira" d="M24 24l11.3-11.3"/><circle class="p" cx="24" cy="24" r="2"/><circle class="p m2" cx="31" cy="30" r="2"/>',
  frasco: '<path d="M19 8h10M21 8v10l-9.5 17.500A3 3 0 0014.100 40h19.800a3 3 0 002.600-4.500L27 18V8"/><path d="M15.500 29h17"/><circle class="p m1" cx="21" cy="34.500" r="1.700"/><circle class="p m2" cx="27" cy="33" r="1.300"/>',
  rota: '<path d="M10 38c0-8 14-6 14-14s14-6 14-12"/><circle class="p" cx="10" cy="38" r="2.600"/><path class="m1" d="M38 12V4l6.500 2.700L38 9.400"/>',
  pulso: '<rect x="10" y="8" width="28" height="33" rx="4"/><path d="M19 8V5.500h10V8"/><path class="m1 pulsa" d="M15 25h5l2.500-6 4 11 2.500-5h4"/><path d="M15 34.500h11"/>',
  ciclo: '<g class="m1 gira"><path d="M9 24a15 15 0 0126-10.200L40 18M40 9v9h-9"/><path d="M39 24a15 15 0 01-26 10.200L8 30M8 39v-9h9"/></g>',
  conversa: '<path d="M8 12a4 4 0 014-4h16a4 4 0 014 4v9a4 4 0 01-4 4H18l-6 5v-5a4 4 0 01-4-4z"/><path class="m1" d="M36 17a4 4 0 014 4v9a4 4 0 01-4 4v5l-6-5h-7"/><circle class="p m2" cx="15" cy="16.500" r="1.400"/><circle class="p m2" style="--d:.12s" cx="20" cy="16.500" r="1.400"/><circle class="p m2" style="--d:.24s" cx="25" cy="16.500" r="1.400"/>',
  marcos: '<path d="M6 31h36"/><circle cx="12" cy="31" r="3.500"/><circle cx="24" cy="31" r="3.500"/><circle cx="36" cy="31" r="3.500"/><path class="m1" d="M36 26.500V11l7.500 3.200-7.500 3.200"/>',
};
export const iconeVivo = (nome, cls = '') => `<svg class="icv icv--${nome}${cls ? ' ' + cls : ''}" viewBox="0 0 48 48" aria-hidden="true">${(V[nome] || V.orbita)
  .replace(/(\d)\.(\d)00/g, '$1.$2')
  .replace(/<(path|circle|rect)(?![^>]*class="[^"]*\bp\b)/g, '<$1 pathLength="1"')}</svg>`;

// ---------- capas dos livros: um motivo de traço para cada ideia ----------
const M = {
  degraus: '<path d="M22 112h20v-11h20v-11h20v-11h20v-11h20v-11h20v-11h20v-11h18"/><circle class="c" cx="180" cy="35" r="5"/>',
  passos: '<path d="M26 104l38-18 38-18 38-18 38-18"/><circle cx="26" cy="104" r="7"/><circle cx="64" cy="86" r="7"/><circle cx="102" cy="68" r="7"/><circle cx="140" cy="50" r="7"/><circle class="c" cx="178" cy="32" r="8"/>',
  ponte: '<path d="M12 98h46M142 98h46"/><path d="M52 98C72 34 128 34 148 98"/><path class="t" d="M76 98V62M100 98V50M124 98V62"/><circle class="c" cx="100" cy="50" r="5"/>',
  chave: '<rect x="50" y="42" width="100" height="50" rx="25"/><circle class="c" cx="125" cy="67" r="17"/><path class="t" d="M68 67h26"/>',
  voz: '<path d="M46 40h66a12 12 0 0112 12v28a12 12 0 01-12 12H84l-17 15V92H46a12 12 0 01-12-12V52a12 12 0 0112-12z"/><path d="M142 50a26 26 0 010 34M156 38a44 44 0 010 58"/><circle class="c" cx="62" cy="66" r="4"/><circle class="c" cx="79" cy="66" r="4"/><circle class="c" cx="96" cy="66" r="4"/>',
  curva: '<path d="M12 106h176"/><path d="M14 104C58 104 70 26 100 26s42 78 86 78"/><path class="t" d="M58 106V84M82 106V44M118 106V44M142 106V84"/><circle class="c" cx="100" cy="26" r="5"/>',
  fases: '<path d="M18 52h26l11 17-11 17H18l11-17zM60 52h26l11 17-11 17H60l11-17zM102 52h26l11 17-11 17h-26l11-17zM144 52h26l11 17-11 17h-26l11-17z"/><circle class="c" cx="100" cy="26" r="7"/><path d="M86 44a14 10 0 0128 0"/>',
  empurrao: '<path d="M26 67h52M64 53l14 14-14 14"/><circle class="c" cx="112" cy="67" r="18"/><path class="t" d="M140 67h46"/>',
};
export const motivoLivro = nome => `<svg class="livro-motivo" viewBox="0 0 200 130" aria-hidden="true">${M[nome] || M.passos}</svg>`;
