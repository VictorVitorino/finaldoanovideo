// ?test=azul — abertura nova do vídeo azul (src/azul/abertura.js), uma camada só.
import * as AB from '../azul/abertura.js';

export async function criar() {
  const J = await AB.carregar();
  return { duration: J.total, frame: t => `<defs>${AB.defs()}</defs>` + AB.quadro(t) };
}
