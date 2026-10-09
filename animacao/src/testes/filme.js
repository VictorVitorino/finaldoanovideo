// ?test=filme&layer=fundo|overlay — o filme no modelo SpecForge (src/sf/filme.js).
import { criarFilme } from '../sf/filme.js';
import { carregar } from '../sf/telas.js';

export const criar = async ({ layer }) => { await carregar(); return criarFilme({ layer }); };
