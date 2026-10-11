import { buildCredits } from '../creditos.js';

export async function criar(options = {}) {
  const response = await fetch('./producao/creditos.json');
  if (!response.ok) throw new Error('Não foi possível carregar os créditos');
  return { ...buildCredits(await response.json(), options), audio: './build/creditos/trilha.wav' };
}
