// Encerramento independente: pode ser anexado ao filme sem alterar suas falas.
import { clamp, ease, esc, n2, op, text } from './core.js';

const INK = '#0b1425', WHITE = '#f7f4ec', MUTED = '#a7b3c6', GOLD = '#efc675';

function background(t) {
  let s = `<rect width="1920" height="1080" fill="${INK}"/>`;
  s += `<circle cx="${n2(1530 + Math.sin(t * 0.18) * 24)}" cy="180" r="590" fill="#142440" opacity=".6"/>`;
  s += '<circle cx="120" cy="1020" r="470" fill="#112d3b" opacity=".38"/>';
  s += `<path d="M100 126 H1820 M100 954 H1820" stroke="${GOLD}" stroke-width="1" opacity=".3"/>`;
  s += `<rect x="100" y="126" width="${n2(120 + Math.sin(t * 0.25) * 20)}" height="3" fill="${GOLD}"/>`;
  return s;
}

const label = (str, x, y, options = {}) => text(str, x, y, {
  size: 25, weight: 700, fill: GOLD, ls: '3', family: 'DM Sans', ...options,
});

function team(config) {
  let s = label('CRÉDITOS', 960, 205);
  config.equipe.forEach(({ funcao, nome }, i) => {
    const y = 320 + i * 190;
    s += label(funcao.toLocaleUpperCase('pt-BR'), 960, y, { size: 24 });
    s += text(nome, 960, y + 82, { size: 76, weight: 600, fill: WHITE });
  });
  return s;
}

function participants(config) {
  let s = text('Participações especiais', 960, 242, { size: 67, weight: 600, fill: WHITE });
  const rows = Math.ceil(config.participantes.length / 2);
  const spacing = Math.min(68, 520 / Math.max(1, rows - 1));
  config.participantes.forEach((nome, i) => {
    const col = i < rows ? 0 : 1;
    const row = i % rows;
    s += text(nome, col ? 1370 : 550, 350 + row * spacing, {
      size: 38, weight: 500, family: 'DM Sans', fill: WHITE,
      extra: 'data-credit-name="' + esc(nome) + '"',
    });
  });
  s += '<path d="M960 326 V864" stroke="#a7b3c6" stroke-width="1" opacity=".22"/>';
  return s;
}

function thanks(config) {
  let s = label('OBRIGADO A QUEM FEZ PARTE', 960, 338);
  config.agradecimento.forEach((line, i) => {
    s += text(line, 960, 498 + i * 110, { size: 96, weight: 600, fill: WHITE });
  });
  s += `<path d="M820 717 H1100" stroke="${GOLD}" stroke-width="3"/>`;
  s += label('UM TIME. MUITO VALOR.', 960, 785, { size: 26 });
  return s;
}

export function buildCredits(config, { layer = 'full' } = {}) {
  const scenes = { equipe: team, participantes: participants, agradecimento: thanks };
  let duration = 0;
  const cards = config.cartelas.map(card => {
    if (!scenes[card.id] || !(card.duracao > 0)) throw new Error('Cartela de créditos inválida');
    const result = { ...card, start: duration };
    duration += card.duracao;
    return result;
  });
  if (!cards.length) throw new Error('Créditos sem cartelas');
  return {
    duration,
    frame(time) {
      const t = clamp(time, 0, duration);
      const card = cards.find(c => t < c.start + c.duracao) ?? cards.at(-1);
      const local = t - card.start;
      const entrance = ease.out(clamp(local / 0.6));
      const exit = ease.inOut(clamp((card.duracao - local) / 0.6));
      const visible = Math.min(entrance, exit);
      const foreground = label(config.titulo.toLocaleUpperCase('pt-BR'), 100, 94, {
        size: 23, anchor: 'start', fill: MUTED,
      }) + label(config.subtitulo, 1820, 94, {
        size: 23, anchor: 'end', fill: MUTED, ls: '1',
      }) + `<g transform="translate(0 ${n2((1 - entrance) * 18)})">${op(visible, scenes[card.id](config))}</g>`
        + text('PROJETO DO ANO · A&M + TOTVS', 960, 1010, {
          size: 20, family: 'DM Sans', weight: 500, fill: MUTED, ls: '2',
        });
      const fade = Math.min(clamp(t / 0.5), clamp((duration - t) / 0.8));
      if (layer === 'overlay' || layer === 'etiquetas') return op(fade, foreground);
      const black = '<rect width="1920" height="1080" fill="#000"/>';
      if (layer === 'fundo' || layer === 'base') return black + op(fade, background(t));
      return black + op(fade, background(t) + foreground);
    },
  };
}
