// ?test=legenda_branco — só a legenda sobre fundo sólido (#fff); com o par preto/branco recupera-se a legenda com alfa para sobrepor em vídeo.
import * as B from '../azul/base.js';

export async function criar() {
  const J = await B.carregar();
  return { duration: J.total, frame: t => `<defs>${B.defs()}</defs><rect width="1920" height="1080" fill="#fff"/>` + B.legenda(t) };
}
