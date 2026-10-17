// As 3 páginas paradas no estado final (para o PDF do carrossel e as imagens): quadro t -> página floor(t) + 1.
import { W, H, defs, cabecalho, rodape } from './base.js';
import { PAGINAS } from './paginas3.js';
import { CAB } from './dados.js';

export async function criar() {
  const n = PAGINAS.length;
  return {
    duration: n,
    frame(tm) {
      const i = Math.min(n - 1, Math.max(0, Math.floor(tm)));
      let s = defs() + `<rect width="${W}" height="${H}" fill="#fff"/>`;
      s += PAGINAS[i].desenha(99, new Proxy({}, { get: () => 0 }), { estatico: true });
      s += cabecalho(i + 1, n, CAB.titulo, CAB.sub);
      s += rodape(i + 1, n, PAGINAS[i].fontes(), { arraste: i < n - 1, prog: 1 });
      return s;
    },
  };
}
