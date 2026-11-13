// Prancha de componentes: t=0.5 ícones; 1.5 radar e régua; 2.5 pessoas (ícones e pinos); 3.5 mapa de trilha; 4.5 dashboard; 5.5 gráficos sobre o fundo noite.
import { W, H, MG, C, txt, icone, disco, ICONES, titulo, lede, etiqueta, selo } from './base.js';
import { radar, regua, HEROIS } from './modelo.js';
import { fundoVivo, fundoNoite, geoTrilha, mapaTrilha, pinosTrilha, pinoMapa, balao, faiscas, confete, sombra, camera } from './ludico.js';
import { avatar } from './modelo.js';
import { janela, cartao, geoCalor, calor, rosca, tendencia, pilhas, barrasArea, kpi, alerta, filtro, cursor, INDICES } from './painelUI.js';

export async function criar() {
  return {
    duration: 6,
    frame(t) {
      const q = Math.floor(t);
      let s = fundoVivo(t);
      if (q === 0) {
        ICONES.forEach((n, i) => { const x = 110 + (i % 6) * 172, y = 120 + Math.floor(i / 6) * 170; s += disco(n, x, y, 46) + txt(n, x, y + 78, { s: 20, a: 'middle', c: C.navy80 }); });
      } else if (q === 1) {
        s += radar({ cx: 540, cy: 420, R: 190, valores: HEROIS.B.sinais, cor: C.orange80, destaque: 2 });
        s += regua({ x: MG, y: 900, w: W - 2 * MG, icones: true, defs: true });
      } else if (q === 2) {
        s += titulo(['Pessoas como', '*ícones e pinos*'], MG, 196, 9, 0);
        s += avatar(300, 560, { r: 80, cor: C.orange20, anel: C.orange80, asw: 6 }) + avatar(540, 560, { r: 80, anel: C.blue, asw: 6 }) + pinoMapa(800, 620, { cor: C.orange80, rotulo: 'B', s: 1.6 });
        s += balao(300, 440, 300, 100, txt('voltou para a planilha', 24, 60, { s: 26, w: 700 }));
        s += faiscas(540, 560, t, { raio: 120 }) + confete(t, 2.0);
      } else if (q === 3) {
        const g = geoTrilha(MG, 330, W - 2 * MG, 800);
        s += titulo(['O *Mapa de Adoção*'], MG, 196, 9, 0) + mapaTrilha(g, { t, foco: 1 }) + pinosTrilha(g, { onda: 0 });
      } else if (q === 4) {
        s = fundoNoite(t);
        const j = janela(40, 150, 1000, 1010, { titulo: 'Mapa de Adoção · Projeto', abas: ['Onda 1', 'Onda 2', 'Onda 3'], aba: 1 });
        s += j.svg;
        s += kpi(j.x, j.y, 300, 130, { rot: 'Índice de adoção', valor: INDICES[1] + '%', delta: '+12 p.p.' }) + kpi(j.x + 316, j.y, 300, 130, { rot: 'Pessoas lidas', valor: '25', ic: 'pessoas' }) + kpi(j.x + 632, j.y, 320, 130, { rot: 'Travados', valor: '9', delta: 'atenção', bom: false });
        const gc = geoCalor(j.x, j.y + 150, j.w, 330);
        s += calor(gc, { onda: 1, foco: [1, 1] });
        s += cartao(j.x, j.y + 500, 300, 330, { titulo: 'Distribuição' }) + rosca(j.x + 150, j.y + 690, 110, { onda: 1 });
        s += cartao(j.x + 316, j.y + 500, j.w - 316, 330, { titulo: 'Índice por onda' }) + tendencia(j.x + 326, j.y + 540, j.w - 336, 280, { onda: 1.5 });
        s += alerta(j.x, j.y + 846, j.w, 76, { titulo: 'Suprimentos travou em Resiste', texto: 'Ação sugerida: escuta com o gestor da área', tom: 'atencao' });
        s += cursor(700, 560, { clique: 0.4 });
      } else {
        s = fundoNoite(t);
        s += titulo(['Adoção não se impõe.', '*Se constrói.*'], MG, 300, 9, 0, { escuro: true, s: 84 });
        s += pilhas(MG, 520, 500, 420, {}) + barrasArea(MG + 520, 560, 420, 300, { onda: 2 });
        const f1 = filtro('Financeiro', MG, 1000, { on: true }); s += f1.svg + filtro('Operações', MG + f1.w + 10, 1000, {}).svg;
      }
      return s;
    },
  };
}
