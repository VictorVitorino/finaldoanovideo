// ?test=v19 — o filme azul inteiro (src/azul/v19.js), uma camada só, 170 s sobre o áudio do v18.
import * as V from '../azul/v19.js';
import * as B from '../azul/base.js';

export async function criar() {
  const J = await V.carregarFilme();
  return { duration: J.total, frame: t => `<defs>${B.defs()}</defs>` + V.quadro(t) };
}
