// Prancha de teste das gags e cartelas novas (src/sf/gags.js). Duração 8 s.
// Sem pg: prancha 3x2 com as seis páginas. ?pg=1..6 mostra uma página em tamanho real
// (pelo render.mjs: --test "gags&pg=3"). Páginas 1–3 em papel noite.
import { C, g, tr, text, inv, lerp, bump } from '../core.js';
import * as A from '../sf/ambiente.js';
import * as G from '../sf/graficos.js';
import * as X from '../sf/gags.js';

const ITENS = [
  { icone: 'doc', numero: 6, texto: 'projetos vendidos no *primeiro ano* da parceria' },
  { icone: 'pessoas', numero: 20, texto: 'pessoas passaram pelos projetos' },
  { icone: 'cifrao', prefixo: '+ R$ ', numero: 16, sufixo: ' milhões', texto: 'em collections, sendo *R$ 7 milhões no FY26*' },
  { icone: 'fogo', texto: 'pipeline *aquecido* para o próximo ano' },
];
// cabeça de teste para a mão no cabelo
const cabeca = (x, y, r) => `<circle cx="${x}" cy="${y + r}" r="${r}" fill="#f2c29b" stroke="#3a2a22" stroke-width="3"/><path d="M${x - r} ${y + r} A${r} ${r} 0 0 1 ${x + r} ${y + r} Q${x} ${y + r * 0.5} ${x - r} ${y + r} Z" fill="#4a3528" stroke="#3a2a22" stroke-width="3"/>`;

const PAGINAS = [
  { nome: 'gag 1 · go-live', noite: true, f: t => {
    let s = A.chao(900, { noite: true });
    const ap = Math.max(bump(t, 1.6, 0.5), inv(1.85, 2.1, t) * (1 - inv(2.4, 2.7, t)));
    s += X.botaoGoLive(300, 900, t, { apertado: ap });
    const corre = inv(2.8, 3.3, t) * (1 - inv(6.2, 6.8, t));
    s += X.calendario(640 + 520 * inv(3.2, 6.6, t), 900, t - 0.2, { vivo: inv(1.2, 1.8, t), corre, cara: t > 2.5 && t < 6.6 ? 'susto' : 'normal' });
    s += X.monitorFumaca(1300, 900, t - 0.1, { erro: inv(1.6, 1.8, t), tremor: inv(2.2, 2.6, t) * (1 - inv(5, 5.6, t)), fumaca: inv(3.2, 4.2, t) });
    s += cabeca(1720, 420, 90) + X.maoCabelo(1720, 420, (t - 1) % 2.6, { lado: 1 });
    s += cabeca(1600, 760, 45) + X.maoCabelo(1600, 760, (t - 1.8) % 2.6, { escala: 0.5 });
    return s;
  } },
  { nome: 'gag 2 · missão', noite: true, f: t => {
    let s = X.lasers(t - 0.2, { area: [60, 60, 1860, 1020], alarme: inv(5, 5.2, t) * (1 - inv(7.4, 7.6, t)) });
    s += X.cabo(1500, 0, 620, t - 0.4, { desce: inv(0.4, 1.6, t), balanco: 1 });
    s += X.envelope(620, 460, t, { destroi: 3.6 });
    s += X.gotaCaindo(1500, 660, 920, t - 2.2, {});
    s += X.alarme(t - 5, { dur: 2.4 });
    return s;
  } },
  { nome: 'gag 2 · corrida', noite: true, f: t => {
    let s = X.pista(60, 1860, 900, t, { noite: true, lacunas: [[1200, 1420]] });
    s += X.cofre(240, 900, t, { escala: 0.9 });
    s += X.obstaculo('barreira', 720, 900, t - 0.2, { rotulo: 'PRAZO' });
    s += X.obstaculo('muro', 980, 900, t - 0.3, { rotulo: 'BUROCRACIA' });
    s += X.obstaculo('abismo', 1310, 900, t - 0.4, { largura: 220, rotulo: 'FY27', noite: true });
    s += X.obstaculo('portal', 1700, 900, t - 0.5, { rompe: inv(6.3, 6.8, t) });
    const u = inv(2.2, 6.4, t), nx = lerp(480, 1700, u);
    const pulo = 170 * Math.max(bump(t, 3.0, 0.7), bump(t, 3.95, 0.8), bump(t, 4.75, 0.9));
    const corre = inv(2, 2.5, t) * (1 - inv(6.4, 6.9, t));
    s += X.nfGigante(nx, 900 - pulo, t - 0.6, { corre, cara: t < 2 ? 'normal' : t < 6.4 ? 'susto' : 'feliz', carimbo: inv(7, 7.4, t), escala: 0.85 });
    return s;
  } },
  { nome: 'cartão de portfólio', f: t => {
    const i = Math.min(ITENS.length - 1, Math.floor(t / 2));
    return X.cartaoPortfolio(ITENS[i], t - i * 2, { n: i + 1, total: 10, fim: 1.75 });
  } },
  { nome: 'tiles e barra', f: t => X.tileNumero(500, 330, 560, 320, t, { prefixo: 'R$ ', numero: 7, sufixo: ' MI', rotulo: 'NO FY26', cor: C.navy })
    + X.tileNumero(1180, 330, 620, 320, t - 0.3, { prefixo: '+ R$ ', numero: 16, sufixo: ' MI', rotulo: 'EM COLLECTIONS' })
    + X.barraMeses(260, 760, 1400, t - 0.6, {}) },
  { nome: 'portas e pipeline', f: t => A.chao(900) + X.portas(520, 900, t, {}) + X.pipeline(1420, 900, t - 0.3, {}) },
];

export function criar({ layer }) {
  const pg = +(new URLSearchParams(location.search).get('pg') || 0);
  const cheio = layer !== 'overlay';
  const pagina = (p, t) => (cheio ? A.papel(t, { tom: p.noite ? 'noite' : 'creme', seed: 5 }) : '') + p.f(t);
  return {
    duration: 8,
    frame(t) {
      let s = `<defs>${A.defs()}${G.defs()}${X.defs()}</defs>`;
      if (pg) return s + pagina(PAGINAS[pg - 1], t);
      if (cheio) s += `<rect width="1920" height="1080" fill="${C.bg2}"/>`;
      PAGINAS.forEach((p, i) => {
        s += g(tr((i % 3) * 640, Math.floor(i / 3) * 360, 1 / 3), `<svg width="1920" height="1080" viewBox="0 0 1920 1080" overflow="hidden">${pagina(p, t)}</svg>`)
          + (cheio ? text(p.nome, (i % 3) * 640 + 12, Math.floor(i / 3) * 360 + 26, { size: 20, weight: 800, anchor: 'start', fill: p.noite ? '#c9cbe0' : '#6b6f7e' }) : '');
      });
      return s;
    },
  };
}
