// Fluxos por tipo de projeto (página de Serviços): um diagrama BPMN para cada tipo, com raias, fases, tarefas, decisões e laços.
// O conteúdo vem de content/fluxos.json. Cada nó ocupa uma coluna e uma raia; as ligações são traçadas em ângulo reto, com cantos arredondados.
// O comportamento (abas, ficha que percorre o roteiro, passo a passo e clique nas etapas) fica em assets/js/efeitos.js.
// Sem JavaScript, os fluxos aparecem um abaixo do outro, cada um com a lista das etapas.
import { esc } from './md.mjs';
import { icone } from './ilustra.mjs';
import { titSecao } from './modelos.mjs';

// medidas do desenho, em unidades do SVG
const M = { LAT: 130, X0: 142, DIR: 10, CT: 116, CG: 72, CE: 44, TW: 104, TH: 58, G: 22, RI: 9, RF: 11, RAIA: 96, TOPO: 8, FASE: 38, BASE: 14, R: 12, VAO: 22 };
const f1 = v => String(Math.round(v * 10) / 10);
const quebra = (t, max = 14) => { const ls = ['']; for (const p of t.split(' ')) { const k = ls.length - 1; if (ls[k] && (ls[k] + ' ' + p).length > max) ls.push(p); else ls[k] = (ls[k] + ' ' + p).trim(); } return ls; };
const classe = n => n.tipo === 'decisao' ? 'G' : n.tipo === 'inicio' || n.tipo === 'fim' ? 'E' : 'T';

// largura natural de um fluxo: soma das colunas (a mais larga peça de cada coluna decide) e das folgas pedidas
function colunas(f) {
  const n = Math.max(...f.nos.map(x => x.col)) + 1;
  const tipo = Array.from({ length: n }, (_, c) => { const k = f.nos.filter(x => x.col === c).map(classe); return k.includes('T') ? 'T' : k.includes('G') ? 'G' : 'E'; });
  const larg = tipo.map(t => (t === 'T' ? M.CT : t === 'G' ? M.CG : M.CE));
  const folga = Array.from({ length: n }, (_, c) => Number((f.folgas || {})[c] || 0));
  // duas tarefas vizinhas na mesma raia, ligadas uma à outra: o vão entre elas precisa caber uma seta
  const por = Object.fromEntries(f.nos.map(x => [x.id, x]));
  for (const [de, para] of f.ligacoes) { const a = por[de], b = por[para]; if (a && b && a.raia === b.raia && b.col === a.col + 1 && classe(a) === 'T' && classe(b) === 'T') folga[b.col] = Math.max(folga[b.col], M.VAO - (M.CT - M.TW)); }
  return { n, tipo, larg, folga, total: larg.reduce((s, v) => s + v, 0) + folga.reduce((s, v) => s + v, 0) };
}
export const larguraFluxo = f => M.X0 + colunas(f).total + M.DIR;

// posições: todos os fluxos saem com a mesma largura (a do maior), para o texto ter o mesmo tamanho em todas as abas
function posicoes(f, W) {
  const c = colunas(f), sobra = Math.max(0, W - (M.X0 + c.total + M.DIR)), nT = c.tipo.filter(t => t === 'T').length || 1;
  const larg = c.larg.map((v, i) => (c.tipo[i] === 'T' ? v + sobra / nT : v));
  const esq = []; let x = M.X0; larg.forEach((v, i) => { x += c.folga[i]; esq.push(x); x += v; });
  const cy = r => M.TOPO + M.FASE + r * M.RAIA + M.RAIA / 2;
  const nos = f.nos.map(n => ({ ...n, k: classe(n), x: esq[n.col] + larg[n.col] / 2, y: cy(n.raia) }));
  return { nos, esq, larg, H: M.TOPO + M.FASE + f.raias.length * M.RAIA + M.BASE, cy };
}

// porta de um nó: e (esquerda), d (direita), c (cima), b (baixo)
function porta(n, lado) {
  const mw = n.k === 'G' ? M.G : n.k === 'E' ? (n.tipo === 'fim' ? M.RF + 2 : M.RI) : M.TW / 2, mh = n.k === 'G' ? M.G : n.k === 'E' ? (n.tipo === 'fim' ? M.RF + 2 : M.RI) : M.TH / 2;
  return lado === 'd' ? [n.x + mw, n.y] : lado === 'e' ? [n.x - mw, n.y] : lado === 'c' ? [n.x, n.y - mh] : [n.x, n.y + mh];
}
// lados de saída e de entrada: os declarados na ligação ou, na falta, os naturais para a posição dos dois nós
function lados(a, b, o) {
  const mesmaCol = a.col === b.col, mesmaRaia = a.raia === b.raia, H = l => l === 'd' || l === 'e';
  const s = o.s || (mesmaCol ? (b.raia > a.raia ? 'b' : 'c') : 'd');
  const e = o.e || (mesmaCol ? (b.raia > a.raia ? 'c' : 'b') : mesmaRaia ? 'e' : H(s) ? (b.raia > a.raia ? 'c' : 'b') : b.col > a.col ? 'e' : 'd');
  return [s, e];
}
// pontos de uma ligação em ângulo reto: reta, em L (um canto) ou em Z (dois cantos)
function pontos(p0, s, p1, e, m) {
  const H = l => l === 'd' || l === 'e';
  if (H(s) && H(e)) { if (Math.abs(p0[1] - p1[1]) < 1) return [p0, p1]; const xm = m ?? (p0[0] + p1[0]) / 2; return [p0, [xm, p0[1]], [xm, p1[1]], p1]; }
  if (H(s) && !H(e)) return [p0, [p1[0], p0[1]], p1];
  if (!H(s) && H(e)) return [p0, [p0[0], p1[1]], p1];
  if (Math.abs(p0[0] - p1[0]) < 1) return [p0, p1];
  const ym = m ?? (s === e ? (s === 'b' ? Math.max(p0[1], p1[1]) + 22 : Math.min(p0[1], p1[1]) - 22) : (p0[1] + p1[1]) / 2);
  return [p0, [p0[0], ym], [p1[0], ym], p1];
}
// caminho com os cantos arredondados
function tracado(pts) {
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i], a = pts[i - 1], p = pts[i + 1];
    if (!p) { d += `L${f1(x)} ${f1(y)}`; break; }
    const l1 = Math.hypot(x - a[0], y - a[1]), l2 = Math.hypot(p[0] - x, p[1] - y), r = Math.min(M.R, l1 / 2, l2 / 2);
    d += `L${f1(x - (x - a[0]) / l1 * r)} ${f1(y - (y - a[1]) / l1 * r)}Q${f1(x)} ${f1(y)} ${f1(x + (p[0] - x) / l2 * r)} ${f1(y + (p[1] - y) / l2 * r)}`;
  }
  return d;
}

// tudo o que o desenho e o roteiro precisam: nós com posição, ligações com caminho e as conferências de coerência
function monta(f, W) {
  const P = posicoes(f, W), porId = Object.fromEntries(P.nos.map(n => [n.id, n]));
  const erro = m => { throw new Error(`fluxos.json › ${f.id}: ${m}`); };
  const ligs = f.ligacoes.map(([de, para, o = {}], i) => {
    const a = porId[de], b = porId[para]; if (!a || !b) erro(`ligação ${de} → ${para} aponta para um nó que não existe`);
    const [s, e] = lados(a, b, o), pts = pontos(porta(a, s), s, porta(b, e), e, o.m);
    return { id: `fx-${f.id}-${i}`, de, para, r: o.r || '', s, e, pts, d: tracado(pts) };
  });
  const chave = (a, b) => a + '>' + b, mapa = Object.fromEntries(ligs.map(l => [chave(l.de, l.para), l]));
  f.roteiro.forEach((id, i) => { if (!porId[id]) erro(`o roteiro cita "${id}", que não existe`); if (i && !mapa[chave(f.roteiro[i - 1], id)]) erro(`o roteiro vai de ${f.roteiro[i - 1]} para ${id}, mas não há ligação entre eles`); });
  P.nos.forEach(n => { if (!f.roteiro.includes(n.id)) erro(`o nó "${n.id}" não aparece no roteiro`); if (n.k === 'G' && !(n.nao && n.sim)) erro(`a decisão "${n.id}" precisa dos textos "nao" e "sim"`); });
  ligs.forEach(l => { if (!f.roteiro.some((id, i) => i && f.roteiro[i - 1] === l.de && id === l.para)) erro(`a ligação ${l.de} → ${l.para} nunca é percorrida`); });
  // dois nós não podem ocupar a mesma casa
  const casas = new Set(); P.nos.forEach(n => { const k = n.col + ':' + n.raia; if (casas.has(k)) erro(`dois nós na coluna ${n.col}, raia ${n.raia}`); casas.add(k); });
  // ordem das tarefas: a da primeira passagem pelo roteiro
  let ordem = 0; const vistos = new Set();
  f.roteiro.forEach(id => { const n = porId[id]; if (n.k === 'T' && !vistos.has(id)) { vistos.add(id); n.ordem = ++ordem; } });
  const fase = c => f.fases.findIndex(([, de, ate]) => c >= de && c <= ate);
  (f.travas || []).forEach(([id]) => { if (!porId[id]) erro(`a trava aponta para "${id}", que não existe`); porId[id].alerta = true; });
  P.nos.forEach(n => { n.fase = fase(n.col); if (n.fase < 0) erro(`a coluna ${n.col} não pertence a nenhuma fase`); });
  return { ...P, porId, ligs, mapa, tarefas: ordem, decisoes: P.nos.filter(n => n.k === 'G').length };
}

function svgFluxo(f, D, W) {
  const { nos, esq, larg, H, cy, ligs } = D, n = f.raias.length, yTopo = M.TOPO + M.FASE, yBase = yTopo + n * M.RAIA;
  const raias = f.raias.map((nome, r) => { const ls = quebra(nome, 14); return `<rect x="0" y="${yTopo + r * M.RAIA}" width="${f1(W)}" height="${M.RAIA}" class="fx-raia${r % 2 ? ' fx-raia--b' : ''}"/><text class="fx-raia-t" x="14" y="${f1(cy(r) + 4 - (ls.length - 1) * 7.5)}">${ls.map((l, k) => `<tspan x="14" dy="${k ? 15 : 0}">${esc(l)}</tspan>`).join('')}</text>`; }).join('');
  const fases = f.fases.map(([nome, de, ate], i) => { const x0 = esq[de] + (i ? 3 : -6), x1 = esq[ate] + larg[ate] - 3; return `<g class="fx-fase" data-fase="${i}"><rect x="${f1(x0)}" y="${M.TOPO + 5}" width="${f1(x1 - x0)}" height="24" rx="12"/><text x="${f1((x0 + x1) / 2)}" y="${M.TOPO + 21.5}" text-anchor="middle">${esc(nome)}</text></g>${i ? `<path class="fx-sep" d="M${f1(esq[de])} ${yTopo + 6}V${yBase - 6}"/>` : ''}`; }).join('');
  const texto = (ls, x, y, passo = 15) => `<text x="${f1(x)}" y="${f1(y + 4.4 - (ls.length - 1) * passo / 2)}" text-anchor="middle">${ls.map((l, k) => `<tspan x="${f1(x)}" dy="${k ? passo : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  const rotulo = no => `${no.k === 'T' ? `Etapa ${no.ordem}` : no.k === 'G' ? 'Decisão' : no.tipo === 'inicio' ? 'Início' : 'Fim'}: ${no.t}. ${f.raias[no.raia]}${no.alerta ? '. Ponto em que a mudança costuma travar' : ''}`;
  // selo de atenção: marca no diagrama as etapas em que a mudança costuma travar
  const selo = (x, y) => `<g class="fx-alerta" aria-hidden="true"><circle cx="${f1(x)}" cy="${f1(y)}" r="7"/><path d="M${f1(x)} ${f1(y - 3.6)}v3.8M${f1(x)} ${f1(y + 3.3)}v.1"/></g>`;
  const attrs = no => `data-no="${esc(no.id)}" aria-label="${esc(rotulo(no))}"`;
  const desenho = no => {
    if (no.k === 'T') return `<g class="fx-no fx-tarefa" ${attrs(no)}><rect x="${f1(no.x - M.TW / 2)}" y="${f1(no.y - M.TH / 2)}" width="${M.TW}" height="${M.TH}" rx="10"/>${texto(quebra(no.t), no.x, no.y)}${no.alerta ? selo(no.x + M.TW / 2 + 2, no.y - M.TH / 2 - 2) : ''}</g>`;
    if (no.k === 'E') return `<g class="fx-no fx-ev" ${attrs(no)}><circle cx="${f1(no.x)}" cy="${f1(no.y)}" r="20" class="fx-alvo"/><circle cx="${f1(no.x)}" cy="${f1(no.y)}" r="${no.tipo === 'fim' ? M.RF : M.RI}" class="fx-evento${no.tipo === 'fim' ? ' fx-evento--fim' : ''}"/></g>`;
    const lado = no.rot || 'd', G = M.G;
    const pos = lado === 'b' ? [no.x, no.y + G + 20, 'middle'] : lado === 'c' ? [no.x, no.y - G - 11, 'middle'] : lado === 'e' ? [no.x - G - 9, no.y + 4.4, 'end'] : [no.x + G + 9, no.y + 4.4, 'start'];
    return `<g class="fx-no fx-decisao" ${attrs(no)}><path d="M${f1(no.x)} ${f1(no.y - G)}l${G} ${G}-${G} ${G}-${G}-${G}z"/><text x="${f1(pos[0])}" y="${f1(pos[1])}" text-anchor="${pos[2]}" class="fx-rot">${esc(no.t)}</text>${no.alerta ? selo(no.x - G / 2 - 4, no.y - G / 2 - 4) : ''}</g>`;
  };
  // "sim" e "não" ao lado da saída de cada decisão
  const marcas = ligs.filter(l => l.r).map(l => { const [x, y] = l.pts[0]; const p = l.s === 'c' ? [x + 7, y - 7, 'start'] : l.s === 'b' ? [x + 7, y + 15, 'start'] : l.s === 'd' ? [x + 5, y - 7, 'start'] : [x - 5, y - 7, 'end']; return `<text x="${f1(p[0])}" y="${f1(p[1])}" text-anchor="${p[2]}" class="fx-rot fx-rot--p">${esc(l.r)}</text>`; }).join('');
  const ini = nos.find(x => x.tipo === 'inicio');
  return `<svg class="fluxo-svg" viewBox="0 0 ${f1(W)} ${H}" role="group" aria-label="Fluxo de ${esc(f.nome)} em ${n} raias: ${esc(f.raias.join(', '))}. A lista completa das etapas vem logo depois do diagrama.">
  <defs><marker id="fx-${esc(f.id)}-seta" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5L8.5 5 1 8.5z" class="fx-ponta"/></marker></defs>
  ${raias}<path d="M${M.LAT} ${yTopo}V${yBase}" class="fx-div"/>
  <g class="fx-fases">${fases}</g>
  <g class="fx-linhas">${ligs.map(l => `<path id="${l.id}" d="${l.d}" marker-end="url(#fx-${esc(f.id)}-seta)"/>`).join('')}</g>
  <g class="fx-feitas">${ligs.map(l => `<path data-feita="${l.id}" d="${l.d}" pathLength="1"/>`).join('')}</g>
  ${marcas}
  ${nos.map(desenho).join('\n  ')}
  <g class="fx-ficha" transform="translate(${f1(ini.x)} ${f1(ini.y)})"><circle r="14" class="fx-ficha-halo"/><circle r="7" class="fx-ficha-centro"/></g>
  </svg>`;
}

const SELO = '<svg class="ic fluxo-selo" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M12 7.2v5.6M12 16.6v.1" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/></svg>';

// ---------- seção completa ----------
export function secaoFluxos(F, raiz) {
  if (!F || !(F.tipos || []).length) return '';
  const W = Math.max(...F.tipos.map(larguraFluxo)), R = F.rotulos || {};
  const painel = (f, i) => {
    const D = monta(f, W), ini = f.roteiro[0], n0 = D.porId[ini];
    // o que o navegador precisa para animar: roteiro, nós (texto, posição, fase) e ligações (caminho e rótulo)
    const dados = {
      r: f.roteiro, t: D.tarefas,
      n: Object.fromEntries(D.nos.map(n => [n.id, { t: n.t, l: f.raias[n.raia], k: n.k, i: n.ordem || 0, f: n.fase, x: +f1(n.x), y: +f1(n.y), ...(n.k === 'G' ? { nao: n.nao, sim: n.sim } : { d: n.d }), ...(n.e ? { e: n.e } : {}), ...(n.tipo === 'fim' ? { fim: 1 } : {}) }])),
      a: Object.fromEntries(D.ligs.map(l => [l.de + '>' + l.para, { id: l.id, ...(l.r ? { r: l.r } : {}) }])),
    };
    const etapas = D.nos.filter(n => n.k !== 'E').sort((a, b) => f.roteiro.indexOf(a.id) - f.roteiro.indexOf(b.id));
    return `<div class="fluxo" id="fluxo-${esc(f.id)}" data-fluxo="${esc(f.id)}" role="tabpanel" aria-labelledby="fluxo-aba-${esc(f.id)}">
        <header class="fluxo-cab"><h3>${esc(f.nome)}</h3><p>${esc(f.frase)}</p></header>
        <div class="fluxo-rolagem">${svgFluxo(f, D, W)}</div>
        <div class="fluxo-barra so-js">
          <div class="fluxo-botoes" role="group" aria-label="Controles do fluxo"><button type="button" class="btn btn--p btn--peq" data-fx="tocar" aria-pressed="false">${icone('play')}<span>Reproduzir</span></button><button type="button" class="btn btn--s btn--peq fluxo-volta" data-fx="volta" aria-label="Etapa anterior">${icone('setaEsq')}</button><button type="button" class="btn btn--s btn--peq" data-fx="passo">Passo a passo${icone('seta')}</button><button type="button" class="btn btn--s btn--peq" data-fx="veloz" aria-label="Velocidade: 1 vez">Velocidade <b>1×</b></button></div>
          <div class="fluxo-legenda" data-fx-legenda><small data-fx-onde>${esc(f.raias[n0.raia])} · Início</small><b data-fx-tit>${esc(n0.t)}</b><span data-fx-desc>${esc(n0.d)}</span><em data-fx-ent hidden><i>${esc(R.entrega || 'Entrega')}</i><span></span></em></div>
        </div>
        <ol class="fluxo-lista">${etapas.map(n => n.k === 'G'
          ? `<li class="fluxo-lista-g"><span>?</span><b>${esc(n.t)}</b><small>Decisão · ${esc(f.raias[n.raia])}</small><em>${esc(n.nao)} ${esc(n.sim)}</em></li>`
          : `<li><span>${String(n.ordem).padStart(2, '0')}</span><b>${esc(n.t)}</b><small>${esc(f.raias[n.raia])} · ${esc(f.fases[n.fase][0])}</small><em>${esc(n.d)}${n.e ? ` <i>${esc(R.entrega || 'Entrega')}: ${esc(n.e)}.</i>` : ''}</em></li>`).join('')}</ol>
        <div class="fluxo-notas">
          <section><h4>${SELO}${esc(R.travas || 'Onde costuma travar')}</h4><ul>${f.travas.map(([id, t]) => { const [a, ...b] = t.split(': '); return `<li data-fx-trava="${esc(id)}">${b.length ? `<b>${esc(a)}.</b> ${esc(b.join(': ').replace(/^./, c => c.toUpperCase()))}` : esc(t)} <button type="button" class="fluxo-ver so-js" data-fx-ver="${esc(id)}" aria-label="Ver no fluxo: ${esc(D.porId[id].t)}">Ver no fluxo${icone('setaCima')}</button></li>`; }).join('')}</ul></section>
          <section><h4>${icone('grade')}${esc(R.medidas || 'O que eu acompanho')}</h4><ul>${f.medidas.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>
          <section><h4>${icone('livro')}${esc(R.links || 'Para aprofundar')}</h4><ul class="fluxo-links">${f.links.map(([t, h]) => `<li><a href="${h.startsWith('servicos/#') ? esc(h.slice(9)) : raiz + esc(h)}">${esc(t)}${icone('seta')}</a></li>`).join('')}</ul></section>
        </div>
        <script type="application/json" data-fx-dados>${JSON.stringify(dados).replace(/</g, '\\u003c')}</script>
      </div>`;
  };
  return `<section class="sec sec--fluxo" id="fluxos" aria-labelledby="fluxo-t">
  <div class="sec-in">
    ${titSecao('fluxo', esc(F.olho), esc(F.titulo), esc(F.nota))}
    <div class="fluxos revela" data-fluxos style="--n:${F.tipos.length};--fx-l:${Math.round(W)}">
      <div class="fluxos-abas so-js" role="tablist" aria-label="Tipo de projeto">${F.tipos.map((f, i) => `<button type="button" class="fluxos-aba" role="tab" id="fluxo-aba-${esc(f.id)}" aria-controls="fluxo-${esc(f.id)}" aria-selected="${i ? 'false' : 'true'}"${i ? ' tabindex="-1"' : ''}>${icone(f.icone || 'rota')}<span><b>${esc(f.nome)}</b><small>${esc(f.frase)}</small></span></button>`).join('')}</div>
      ${F.tipos.map(painel).join('\n      ')}
    </div>
  </div>
</section>`;
}
// resumo para a busca do site
export const fluxosBusca = F => (F && F.tipos ? F.tipos.map(f => ({ t: `Fluxo de projeto: ${f.nome}`, u: `servicos/#fluxo-${f.id}` })) : []);
