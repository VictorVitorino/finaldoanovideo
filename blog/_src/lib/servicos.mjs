// Página de Serviços (serviços particulares de gestão da mudança e IA aplicada) e o convite dela na página inicial.
// Os efeitos (galeria que desliza, ficha em foco, cartões que viram, fluxo BPMN, narrativa fixa e gráfico que se constrói)
// ficam em assets/js/efeitos.js; aqui só a estrutura. Sem JavaScript, tudo aparece como texto e listas.
import { esc } from './md.mjs';
import { icone } from './ilustra.mjs';
import { iconeVivo } from './vivo.mjs';
import { pagina, titSecao, navGaleria, botoesContato, contato, frases, corrido } from './modelos.mjs';

const tit = l => esc(l).replace(/\*(.+?)\*/g, '<em>$1</em>');
const quebra = (t, max = 15) => { const ls = ['']; for (const p of t.split(' ')) { const k = ls.length - 1; if (ls[k] && (ls[k] + ' ' + p).length > max) ls.push(p); else ls[k] = (ls[k] + ' ' + p).trim(); } return ls; };
const lista = (itens, cls = '') => `<ul class="checks${cls ? ' ' + cls : ''}">${itens.map(e => `<li>${icone('check')}<span>${esc(e)}</span></li>`).join('')}</ul>`;

// ---------- fluxo BPMN: três raias, tarefas, uma decisão e a ficha que percorre o caminho ----------
function fluxoSVG(f) {
  const RAIA = 104, TOPO = 14, LAT = 150, TW = 98, TH = 54, R = 12, PASSO = 112, X0 = 200;
  const col = i => X0 + i * PASSO, cy = r => TOPO + r * RAIA + RAIA / 2, W = col(9) + 44, H = TOPO * 2 + 3 * RAIA;
  // colunas: 0 início · 1 a 6 tarefas · 7 decisão · 8 última tarefa · 9 fim
  const pos = f.passos.map((p, i) => ({ ...p, x: col(i < 6 ? i + 1 : 8), y: cy(p.raia), i }));
  const ini = { x: col(0), y: cy(pos[0].raia) }, gw = { x: col(7), y: cy(pos[5].raia) }, fim = { x: col(9), y: cy(pos[6].raia) }, G = 23;
  const dir = p => [p.x + TW / 2, p.y], esq = p => [p.x - TW / 2, p.y], cima = p => [p.x, p.y - TH / 2], baixo = p => [p.x, p.y + TH / 2];
  // ligação em ângulo reto, com canto arredondado: sai para o lado e entra por cima ou por baixo
  const liga = (a, b) => Math.abs(a[1] - b[1]) < 1 ? `M${a[0]} ${a[1]}H${b[0]}` : `M${a[0]} ${a[1]}H${b[0] - R}Q${b[0]} ${a[1]} ${b[0]} ${a[1] + (b[1] > a[1] ? R : -R)}V${b[1]}`;
  const entra = (a, b) => Math.abs(a.y - b.y) < 1 ? esq(b) : b.y > a.y ? cima(b) : baixo(b);
  const yVolta = TOPO + 3 * RAIA - 8;
  const C = [   // ligações, com o nó de chegada de cada uma
    ['c-ini', `M${ini.x + 9} ${ini.y}H${esq(pos[0])[0]}`],
    ...[0, 1, 2, 3, 4].map(i => [`c-${i}`, liga(dir(pos[i]), entra(pos[i], pos[i + 1]))]),
    ['c-5', `M${dir(pos[5])[0]} ${pos[5].y}H${gw.x - G}`],
    ['c-nao', `M${gw.x} ${gw.y + G}V${yVolta - R}Q${gw.x} ${yVolta} ${gw.x - R} ${yVolta}H${pos[4].x + R}Q${pos[4].x} ${yVolta} ${pos[4].x} ${yVolta - 6}V${baixo(pos[4])[1]}`],
    ['c-sim', `M${gw.x} ${gw.y - G}V${pos[6].y + R}Q${gw.x} ${pos[6].y} ${gw.x + R} ${pos[6].y}H${esq(pos[6])[0]}`],
    ['c-fim', `M${dir(pos[6])[0]} ${pos[6].y}H${fim.x - 12}`],
  ];
  const raias = f.raias.map((n, r) => { const ls = quebra(n, 13); return `<rect x="0" y="${TOPO + r * RAIA}" width="${W}" height="${RAIA}" class="fx-raia${r % 2 ? ' fx-raia--b' : ''}"/><text class="fx-raia-t" x="16" y="${cy(r) + 4 - (ls.length - 1) * 8}">${ls.map((l, k) => `<tspan x="16" dy="${k ? 16 : 0}">${esc(l)}</tspan>`).join('')}</text>`; }).join('');
  const tarefas = pos.map(p => { const ls = quebra(p.t, 14); return `<g class="fx-no fx-tarefa" data-no="t${p.i}"><rect x="${p.x - TW / 2}" y="${p.y - TH / 2}" width="${TW}" height="${TH}" rx="10"/><text x="${p.x}" y="${p.y + 4.5 - (ls.length - 1) * 7.5}" text-anchor="middle">${ls.map((l, k) => `<tspan x="${p.x}" dy="${k ? 15 : 0}">${esc(l)}</tspan>`).join('')}</text></g>`; }).join('');
  return `<svg class="fluxo-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Fluxo do trabalho em três raias: ${esc(f.raias.join(', '))}. A descrição de cada passo está na lista abaixo.">
  <defs><marker id="fx-seta" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5L8.5 5 1 8.5z" class="fx-ponta"/></marker></defs>
  ${raias}<path d="M${LAT - 12} ${TOPO}V${H - TOPO}" class="fx-div"/>
  <g class="fx-linhas">${C.map(([id, d]) => `<path id="${id}" d="${d}" marker-end="url(#fx-seta)"/>`).join('')}</g>
  <g class="fx-feitas">${C.map(([id, d]) => `<path data-feita="${id}" d="${d}" pathLength="1"/>`).join('')}</g>
  <g class="fx-no" data-no="ini"><circle cx="${ini.x}" cy="${ini.y}" r="9" class="fx-evento"/></g>
  <g class="fx-no" data-no="fim"><circle cx="${fim.x}" cy="${fim.y}" r="11" class="fx-evento fx-evento--fim"/></g>
  ${tarefas}
  <g class="fx-no fx-decisao" data-no="gw"><path d="M${gw.x} ${gw.y - G}l${G} ${G}-${G} ${G}-${G}-${G}z"/><text x="${gw.x + G + 10}" y="${gw.y + 4}" class="fx-rot">${esc(f.decisao.pergunta)}</text><text x="${gw.x + 9}" y="${gw.y + G + 20}" class="fx-rot fx-rot--p">não: ${esc(f.decisao.nao.toLowerCase())}</text><text x="${gw.x + 9}" y="${gw.y - G - 9}" class="fx-rot fx-rot--p">sim</text></g>
  <g class="fx-ficha" transform="translate(${ini.x} ${ini.y})"><circle r="14" class="fx-ficha-halo"/><circle r="7" class="fx-ficha-centro"/></g>
  </svg>`;
}

// ---------- gráfico que se constrói: barras, linha de tendência e pontos ----------
function graficoSVG(g) {
  const W = 520, H = 300, X0 = 56, Y0 = 244, AL = 190, max = 60, n = g.ondas.length, passo = (W - X0 - 30) / n, LB = 64;
  const y = v => Y0 - v / max * AL, cx = i => X0 + passo * i + passo / 2;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Índice de adoção por onda: ${esc(g.ondas.map(o => `${o.rotulo}, ${o.valor}%`).join('; '))}">
  <g class="gr-eixos">${[0, 20, 40, 60].map(v => `<path d="M${X0} ${y(v)}H${W - 20}"/><text x="${X0 - 10}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`).join('')}${g.ondas.map((o, i) => `<text x="${cx(i)}" y="${Y0 + 24}" text-anchor="middle">${esc(o.rotulo)}</text>`).join('')}</g>
  ${g.ondas.map((o, i) => `<rect class="gr-barra" style="--i:${i}" x="${cx(i) - LB / 2}" y="${y(o.valor)}" width="${LB}" height="${Y0 - y(o.valor)}" rx="6"/>`).join('')}
  <path class="gr-linha" d="M${g.ondas.map((o, i) => `${cx(i)} ${y(o.valor)}`).join('L')}" pathLength="1"/>
  ${g.ondas.map((o, i) => `<g class="gr-ponto" style="--i:${i}"><circle cx="${cx(i)}" cy="${y(o.valor)}" r="6"/><text x="${cx(i)}" y="${y(o.valor) - 14}" text-anchor="middle">${o.valor}%</text></g>`).join('')}
  </svg>`;
}

// ---------- convite na página inicial ----------
export const blocoServicos = (c, raiz) => !c ? '' : `<section class="sec sec--servicos" id="servicos" aria-labelledby="servicos-t">
  <div class="sec-in">
    <a class="convite holo holo--auto revela" href="${raiz}servicos/">
      <div class="convite-txt"><span class="olho">${esc(c.olho)}</span><h2 id="servicos-t">Change Management Advisory e IA aplicada, com apoio de perto</h2><p>${esc(c.resumo_inicio)}</p></div>
      <ul class="convite-lista">${c.servicos.map(s => `<li>${icone('check')}<span>${esc(s.nome)}</span></li>`).join('')}</ul>
      <span class="btn btn--claro">Ver os serviços${icone('seta')}</span>
    </a>
  </div>
</section>`;

// ---------- página ----------
export function paginaServicos({ cfg, c }) {
  const raiz = '../', f = c.fluxo, j = c.jornada, g = c.grafico, v = c.viradas, ac = c.acompanhamento, ct = contato(cfg);
  const acoes = botoesContato(cfg, { principal: 'btn--p', apoio: 'btn--s' });
  const ficha = s => `<article class="ficha" id="servico-${esc(s.id)}" data-det="${esc(s.id)}">
        <header class="ficha-cab"><small>${esc(s.olho)}</small><h3>${esc(s.nome)}</h3><p>${esc(s.frase)}</p></header>
        <div class="ficha-grade">
          <section><h4>Para quem</h4><p>${esc(s.para_quem)}</p><h4>O que inclui</h4>${lista(s.inclui)}</section>
          <section><h4>Como funciona</h4><ol class="ficha-etapas">${s.como.map((e, i) => `<li><span>${i + 1}</span><b>${esc(e.t)}</b><em>${esc(e.d)}</em></li>`).join('')}</ol><h4>Acompanhamento</h4><p>${esc(s.acompanhamento)}</p><h4>O que você recebe</h4><p class="ficha-entregas">${s.entregas.map(e => `<span>${esc(e)}</span>`).join('')}</p><h4>Formato</h4><p>${esc(s.formato)}</p></section>
        </div>
        ${acoes ? `<footer class="ficha-pe">${acoes}</footer>` : ''}
      </article>`;
  const corpo = `<section class="abertura abertura--pg" aria-labelledby="ab-t">
  <div class="abertura-in">
    <div class="abertura-txt">
      <span class="selo revela">${esc(c.olho)} <i></i> ${esc(cfg.autor)}</span>
      <h1 id="ab-t" class="mega">${c.titulo.map(l => `<span class="mega-l"><span>${tit(l)}</span></span>`).join('')}</h1>
      <p class="abertura-lead revela">${frases(c.lead)}</p>
      <div class="abertura-acoes revela">${ct.zap ? `<a class="btn btn--p" href="${esc(ct.zap)}" target="_blank" rel="noopener">${icone('conversa')}Chamar no WhatsApp</a>` : ''}<a class="btn btn--s" href="#servicos">Ver os serviços${icone('setaBaixo')}</a></div>
    </div>
    <ul class="frentes revela" aria-label="Duas frentes de trabalho">${c.frentes.map(x => `<li class="frente holo vivo"><span class="frente-ic">${iconeVivo(x.icone || 'orbita')}</span><b>${esc(x.nome)}</b><p>${esc(x.frase)}</p>${lista(x.itens)}</li>`).join('')}</ul>
  </div>
</section>

<section class="sec sec--servicos-pg" id="servicos" aria-labelledby="servicos-t">
  <div class="sec-in">
    ${titSecao('servicos', 'Serviços', esc(c.servicos_titulo), esc(c.servicos_nota))}
    <div class="galeria galeria--servicos galeria--centro revela" data-galeria data-inicio="${Math.floor(c.servicos.length / 2)}">
      <ol class="galeria-trilho" data-cursor="Arraste" tabindex="0" aria-label="Serviços">${c.servicos.map((s, i) => `<li class="galeria-item"><a class="servico holo vivo" href="#servico-${esc(s.id)}" data-foco="${esc(s.id)}"><span class="servico-ic">${iconeVivo(s.icone || 'orbita')}</span><span class="servico-n">${String(i + 1).padStart(2, '0')}</span><small>${esc(s.olho)}</small><b>${esc(s.nome)}</b><span class="servico-frase">${esc(s.frase)}</span>${lista(s.inclui.slice(0, 4), 'checks--p')}<em>Abrir a ficha completa${icone('seta')}</em></a></li>`).join('')}</ol>
      ${navGaleria('Serviços')}
    </div>
    <div class="fichas">${c.servicos.map(ficha).join('\n')}</div>
  </div>
</section>

<section class="sec sec--viradas" aria-labelledby="viradas-t">
  <div class="sec-in">
    ${titSecao('viradas', esc(v.olho), esc(v.titulo), esc(v.nota), `<button type="button" class="btn btn--s btn--peq so-js" data-virar-todos aria-pressed="false">${icone('ciclo')}<span>Virar todos</span></button>`)}
    <div class="viradas revela" data-viradas>${v.itens.map((x, i) => `<button type="button" class="virada vivo" style="--i:${i}" aria-pressed="false"><span class="virada-face virada-frente"><span class="virada-ic">${iconeVivo(x.icone || 'orbita')}</span><small>O que aparece</small><b>${esc(x.frente)}</b><em>${icone('ciclo')}Virar</em></span><span class="virada-face virada-verso"><small>Como eu ajudo</small><b>${esc(x.verso)}</b></span></button>`).join('')}</div>
  </div>
</section>

<section class="sec sec--fluxo" aria-labelledby="fluxo-t">
  <div class="sec-in">
    ${titSecao('fluxo', esc(f.olho), esc(f.titulo), esc(f.nota))}
    <div class="fluxo revela" data-fluxo>
      <div class="fluxo-rolagem">${fluxoSVG(f)}</div>
      <div class="fluxo-barra so-js"><button type="button" class="btn btn--p btn--peq" data-fx="tocar" aria-pressed="false">${icone('play')}<span>Reproduzir</span></button><button type="button" class="btn btn--s btn--peq" data-fx="passo">Passo a passo${icone('seta')}</button><button type="button" class="btn btn--s btn--peq" data-fx="veloz" aria-label="Velocidade: 1 vez">Velocidade <b>1×</b></button><p class="fluxo-legenda" data-fx-legenda><b>Início</b><span>${esc(f.passos[0].d)}</span></p></div>
      <ol class="fluxo-lista">${f.passos.map((p, i) => `<li data-passo="t${i}"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(p.t)}</b><small>${esc(f.raias[p.raia])}</small><em>${esc(p.d)}</em></li>`).join('')}<li data-passo="gw"><span>?</span><b>${esc(f.decisao.pergunta)}</b><small>${esc(f.raias[1])}</small><em>Se a adoção ainda não chegou ao alvo, o caminho volta para capacitação e prática. Se chegou, segue para o reforço.</em></li></ol>
    </div>
  </div>
</section>

<section class="sec sec--acomp" id="acompanhamento" aria-labelledby="acomp-t">
  <div class="sec-in">
    ${titSecao('acomp', esc(ac.olho), esc(ac.titulo), esc(ac.nota))}
    <ol class="momentos">${ac.momentos.map((m, i) => `<li class="momento revela" style="--i:${i}"><span class="momento-q">${esc(m.quando)}</span><h3>${esc(m.titulo)}</h3><p>${esc(m.texto)}</p>${lista(m.itens, 'checks--p')}</li>`).join('')}</ol>
    <div class="ritos revela"><h3>${esc(ac.ritos_titulo)}</h3><dl>${ac.ritos.map(r => `<div><dt>${esc(r.t)}</dt><dd>${esc(r.d)}</dd></div>`).join('')}</dl></div>
  </div>
</section>

<section class="sec sec--jornada" aria-labelledby="jornada-t">
  <div class="sec-in">
    ${titSecao('jornada', esc(j.olho), esc(j.titulo), '')}
    <div class="historia" data-historia>
      <div class="historia-fixo"><div class="historia-painel">
        <svg class="historia-trilha" viewBox="0 0 320 190" aria-hidden="true"><path class="trilha-base" d="M22 160C92 160 84 58 160 98S250 30 298 30"/><path class="trilha-feita" d="M22 160C92 160 84 58 160 98S250 30 298 30" pathLength="1"/>${j.fases.map((_, i) => `<circle class="trilha-parada" data-parada="${i}" r="5"/>`).join('')}<g class="trilha-marca"><circle r="15" class="trilha-halo"/><circle r="8" class="trilha-centro"/></g></svg>
        <p class="historia-fase"><small>Fase <b data-h-n>1</b> de ${j.fases.length}</small><strong data-h-nome>${esc(j.fases[0].nome)}</strong><span data-h-frase>${esc(j.fases[0].frase)}</span></p>
        <ul class="checks checks--p historia-entregas" data-h-entregas>${j.fases[0].entregas.map(e => `<li>${icone('check')}<span>${esc(e)}</span></li>`).join('')}</ul>
        <div class="historia-barra" aria-hidden="true"><i></i></div>
        <div class="historia-botoes so-js" role="group" aria-label="Ir para a fase">${j.fases.map((x, i) => `<button type="button" data-h-ir="${i}"${i ? '' : ' aria-current="true"'}>${esc(x.nome)}</button>`).join('')}</div>
      </div></div>
      <ol class="historia-passos">${j.fases.map((x, i) => `<li class="historia-passo" data-i="${i}" data-nome="${esc(x.nome)}" data-frase="${esc(x.frase)}" data-entregas="${esc(JSON.stringify(x.entregas))}"><span class="historia-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(x.nome)}</h3><p class="historia-frase">${esc(x.frase)}</p><p>${esc(x.texto)}</p>${lista(x.entregas, 'checks--p')}</li>`).join('')}</ol>
    </div>
  </div>
</section>

<section class="sec sec--grafico" aria-labelledby="grafico-t">
  <div class="sec-in">
    <div class="grafico-grade">
      <div class="grafico-txt">${titSecao('grafico', esc(g.olho), esc(g.titulo), '')}<p class="grafico-nota">${esc(g.nota)}</p><div class="grafico-acoes"><button type="button" class="btn btn--s btn--peq so-js" data-gr-repetir>${icone('ciclo')}Montar de novo</button><a class="link-seta" href="${raiz}posts/mapa-de-perfil-cognitivo/">Ver o vídeo da capa${icone('seta')}</a></div></div>
      <figure class="grafico" data-grafico>${graficoSVG(g)}</figure>
    </div>
  </div>
</section>

<section class="sec sec--fecho" id="contato" aria-labelledby="fecho-t">
  <div class="sec-in"><div class="convite convite--fecho holo holo--auto revela"><div class="convite-txt"><span class="olho">${esc(c.fecho.olho)}</span><h2 id="fecho-t">${esc(c.fecho.titulo)}</h2><p>${frases(c.fecho.texto)}</p></div><div class="convite-acoes">${botoesContato(cfg, { principal: 'btn--claro', apoio: 'btn--vidro', telefone: true })}</div></div></div>
</section>`;
  return pagina({ cfg, raiz, titulo: 'Serviços', descricao: corrido(c.lead), corpo, caminho: 'servicos/', imagem: 'assets/img/og/servicos.jpg', classe: 'pg-servicos pg-escura', ativo: 'servicos' });
}
