// ?test=filme&layer=fundo|overlay — o filme no modelo SpecForge (src/sf/filme.js).
import { criarFilme } from '../sf/filme.js';

export const criar = ({ layer }) => criarFilme({ layer });
