// Laboratório: páginas das ferramentas interativas (diagnóstico de nível, matriz RACI, mapa de influência e matriz de adoção).
// O comportamento fica em assets/js/lab.js; aqui só a estrutura das páginas e as prévias em traço fino.
import { esc } from './md.mjs';
import { icone } from './ilustra.mjs';
import { pagina, titSecao, regua, navGaleria } from './modelos.mjs';

const L = 'fill="none" stroke="var(--l)" stroke-width="1.3"';
const K = 'fill="none" stroke="var(--f1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const moldura = (v, corpo) => `<svg class="capa capa--${v}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="240" fill="var(--bg)"/>${[48, 96, 144, 192].map(y => `<path d="M0 ${y}H400" stroke="var(--l)" stroke-width=".6" opacity=".35"/>`).join('')}${corpo}</svg>`;
const hex = (cx, cy, r, f = 1) => [0, 1, 2, 3, 4, 5].map(i => { const a = -Math.PI / 2 + i * Math.PI / 3; return `${(cx + Math.cos(a) * r * f).toFixed(1)} ${(cy + Math.sin(a) * r * f).toFixed(1)}`; });
export const PREVIAS = {
  diagnostico(v = 'a') {
    const cx = 200, cy = 122, R = 86, val = [0.9, 0.62, 0.78, 0.5, 0.84, 0.66];
    const pts = val.map((f, i) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f]; });
    return moldura(v, [1, 0.66, 0.33].map(f => `<path d="M${hex(cx, cy, R, f).join('L')}Z" ${L}/>`).join('') + hex(cx, cy, R).map(p => `<path d="M${cx} ${cy}L${p}" ${L}/>`).join('')
      + `<path d="M${pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join('L')}Z" fill="var(--f2)" fill-opacity=".28"/><path class="c-desenha" pathLength="1" d="M${pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join('L')}Z" ${K} stroke="var(--f2)" stroke-width="2.4"/>`
      + pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="var(--f1)"/>`).join('') + `<circle class="c-halo" cx="${pts[0][0].toFixed(1)}" cy="${pts[0][1].toFixed(1)}" r="5" fill="none" stroke="var(--f2)" stroke-width="1.6"/>`);
  },
  raci(v = 'b') {
    const letras = ['A', 'R', 'C', 'I', 'C', 'A', 'R', 'I', 'I', 'C', 'A', 'R', 'R', 'I', 'C', 'A'];
    let s = '';
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const x = 150 + i * 50, y = 44 + j * 40, l = letras[j * 4 + i], forte = l === 'A' || l === 'R';
      s += `<rect x="${x}" y="${y}" width="44" height="34" fill="${l === 'A' ? 'var(--f1)' : l === 'R' ? 'var(--f2)' : 'var(--f3)'}" stroke="var(--l)" stroke-width="1"/><text x="${x + 22}" y="${y + 23}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="15" fill="${forte ? 'var(--bg)' : 'var(--f1)'}">${l}</text>`;
    }
    for (let j = 0; j < 4; j++) s += `<path d="M52 ${61 + j * 40}H${116 - (j % 2) * 18}" ${K} stroke-width="5" opacity=".${j === 1 ? 9 : 5}"/>`;
    return moldura(v, s);
  },
  influencia(v = 'c') {
    const p = [[286, 76, 1], [330, 110, 0], [124, 84, 1], [170, 168, 0], [262, 178, 0], [96, 150, 0]];
    return moldura(v, `<rect x="60" y="36" width="280" height="172" fill="var(--f3)" stroke="var(--l)" stroke-width="1.3"/><path d="M200 36V208M60 122H340" ${L} stroke-dasharray="3 5"/>`
      + `<path class="c-desenha" pathLength="1" d="M124 84Q200 40 286 76" ${K} stroke="var(--f2)"/>`
      + p.map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="${f ? 11 : 8}" fill="var(--${f ? 'f2' : 'f1'})"/>`).join('') + `<circle class="c-halo" cx="124" cy="84" r="5" fill="none" stroke="var(--f2)" stroke-width="1.6"/>`);
  },
  adocao(v = 'b') {
    const linhas = [[0.14, 0.26, 0.28, 0.2, 0.12], [0.24, 0.34, 0.2, 0.16, 0.06], [0.1, 0.2, 0.3, 0.26, 0.14], [0.28, 0.3, 0.2, 0.16, 0.06]];
    const cores = ['var(--l)', 'var(--f3)', 'var(--f2)', 'var(--f2)', 'var(--f1)'], op = [0.7, 1, 0.45, 1, 1];
    let s = '';
    linhas.forEach((l, j) => { let x = 96; l.forEach((f, i) => { const w = f * 250; s += `<rect class="c-sobe" style="--d:${(j * 0.1).toFixed(1)}s" x="${x.toFixed(1)}" y="${52 + j * 40}" width="${(w - 2).toFixed(1)}" height="26" fill="${cores[i]}" opacity="${op[i]}"/>`; x += w; }); s += `<path d="M48 ${65 + j * 40}H${82 - (j % 2) * 12}" ${K} stroke-width="5" opacity=".5"/>`; });
    return moldura(v, s);
  },
};

export const FERRAMENTAS = [
  { id: 'diagnostico', slug: 'diagnostico', nome: 'Diagnóstico de nível', olho: 'Diagnóstico', frase: 'Perguntas difíceis sobre modelos, patrocínio, resistência, medição e contextos como IA e carve-out. No fim, um relatório com o seu nível e o que estudar.', acao: 'Fazer o diagnóstico' },
  { id: 'raci', slug: 'matriz-raci', nome: 'Matriz RACI', olho: 'Papéis', frase: 'Monte a matriz de responsabilidades da mudança, com conferência automática de quem aprova e quem executa.', acao: 'Montar a matriz' },
  { id: 'influencia', slug: 'mapa-de-influencia', nome: 'Mapa de influência', olho: 'Stakeholders', frase: 'Arraste cada stakeholder no mapa de influência e apoio e veja a estratégia de engajamento para cada quadrante.', acao: 'Abrir o mapa' },
  { id: 'adocao', slug: 'matriz-de-adocao', nome: 'Matriz de adoção', olho: 'Adoção', frase: 'Distribua as pessoas de cada área pela régua de adoção e veja o índice, o gráfico e a ação prioritária.', acao: 'Montar a matriz' },
];
const MODELOS = [['matriz-raci.xlsx', 'Matriz RACI da mudança', 'Com conferência automática do A e carga por papel'], ['mapa-de-influencia.xlsx', 'Mapa de influência de stakeholders', 'Com estratégia sugerida e gráfico de dispersão'], ['matriz-de-adocao.xlsx', 'Matriz de adoção', 'Com índice de adoção e gráfico por área']];

// bloco do Laboratório na página inicial: as quatro ferramentas em uma linha, sem enfeite
const CURTA = { diagnostico: 'Descubra o seu nível e o que estudar.', raci: 'Quem aprova, quem executa, quem é consultado.', influencia: 'Arraste cada stakeholder no mapa.', adocao: 'As pessoas na régua, área por área.' };
export function secaoLab(raiz, nPerguntas, nModelos) {
  return `<section class="sec sec--lab" id="lab" aria-labelledby="lab-t">
  <div class="sec-in">
    ${titSecao('lab', 'Laboratório', 'Teste, monte e baixe', 'Um diagnóstico de nível e três instrumentos para montar no navegador.', `<a class="link-seta" href="${raiz}modelos/">${nModelos ? nModelos + ' modelos' : 'Modelos'} para baixar${icone('seta')}</a>`)}
    <div class="ferramentas">${FERRAMENTAS.map((f, i) => `<a class="ferramenta revela" style="--i:${i}" href="${raiz}lab/${f.slug}/"><small>${esc(f.olho)}${f.id === 'diagnostico' && nPerguntas ? ' · ' + nPerguntas + ' perguntas' : ''}</small><b>${esc(f.nome)}</b><span>${esc(CURTA[f.id] || f.frase)}</span><em>${esc(f.acao)}${icone('seta')}</em></a>`).join('')}</div>
  </div>
</section>`;
}

// ---------- capas vivas dos modelos ----------
// Apresentações: no site aparece a própria capa do arquivo (olho, título e iceberg, lidos do primeiro slide por previas_modelos.py),
// só que viva: o fundo respira, o gelo flutua, bolhas sobem, o título entra palavra a palavra e o campo [nome do projeto] se preenche
// com exemplos. O arquivo baixado traz a mesma capa, estática. Planilhas: capa clara com o motivo do conteúdo, que se constrói.
// Nas duas o texto fica parado (nítido) e as camadas se deslocam com o cursor. As páginas reais aparecem em "Ver prévia".
const EXEMPLOS = ['novo ERP', 'CRM de vendas', 'programa de IA', 'RH digital'];
// iceberg da capa: a mesma geometria de modelos_pptx_base.py (_iceberg), na escala do cartão (viewBox 320 × 200)
const BERG = (() => {
  const U = 22, CX = 250, YW = 66, x = dx => (CX + dx * U).toFixed(1), y = dy => (YW + dy * U).toFixed(1);
  const poli = pts => 'M' + pts.map(([dx, dy]) => `${x(dx)} ${y(dy)}`).join('L') + 'Z';
  const borda = [[-1.30, 0.17], [1.35, 0.17], [1.90, 1.15], [1.60, 2.40], [0.50, 3.50], [-0.65, 2.90], [-1.45, 1.80], [-1.65, 1.00]];
  const facetas = [[0.08, 0.17], [-1.65, 1.00], [1.90, 1.15], [1.60, 2.40], [0.50, 3.50], [-0.65, 2.90]];
  const ponta = [['b-p1', [[-0.38, -0.90], [0, -0.90], [0, -0.05], [-0.84, -0.05], [-0.68, -0.58]]], ['b-p2', [[0.02, -1.80], [0.75, -0.62], [0.92, -0.05], [0, -0.05], [0, -1.0]]],
    ['b-p3', [[0.02, -1.80], [0.32, -0.98], [0.12, -0.05], [-0.34, -0.05], [-0.38, -0.90]]]];
  const bolhas = [[-2.0, 3.0, 1.4], [-0.9, 3.45, 1.9], [0.9, 3.6, 1.2], [2.2, 2.9, 1.7], [1.5, 3.3, 1.0]];
  const agua = `M${x(-2.05)} ${y(0.035)}H344`;
  return `<svg class="cl-cena" viewBox="0 0 320 200" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false"><g class="b-fundo">${bolhas.map(([dx, dy, r], i) => `<circle class="b-bolha" style="--i:${i}" cx="${x(dx)}" cy="${y(dy)}" r="${r}"/>`).join('')}</g><g class="b-par"><g class="b-berg"><path class="b-borda" pathLength="1" d="${poli(borda)}"/>${facetas.map((f, i) => `<path class="b-faceta" pathLength="1" style="--i:${i}" d="M${x(0)} ${y(1.4)}L${x(f[0])} ${y(f[1])}"/>`).join('')}<g class="b-ponta">${ponta.map(([c, pts]) => `<path class="${c}" d="${poli(pts)}"/>`).join('')}</g></g></g><path class="b-agua" pathLength="1" d="${agua}"/><path class="b-reflexo" pathLength="1" d="${agua}"/></svg>`;
})();
// título da capa: uma linha do arquivo por linha, cada palavra numa caixa (entra em sequência) e o campo entre colchetes pronto para digitar exemplos
const tituloCapa = (linhas, k) => {
  let w = 0; const ex = EXEMPLOS.map((_, i) => EXEMPLOS[(i + k) % EXEMPLOS.length]).join('|');
  const palavras = t => t.split(/(\s+)/).map(p => !p ? '' : /^\s+$/.test(p) ? ' ' : `<span class="cl-w" style="--w:${w++}">${esc(p)}</span>`).join('');
  return linhas.map(l => `<span class="cl-l">${l.map(r => {
    const html = r.t.split(/(\[[^\]]+\])/).map(p => { const c = /^\[(.+)\]$/.exec(p); return c ? `<span class="cl-w cl-campo" style="--w:${w++}" data-digita="${esc(ex)}">[<span class="cl-dt">${esc(c[1])}</span>]</span>` : palavras(p); }).join('');
    return r.i ? `<em>${html}</em>` : html;
  }).join('')}</span>`).join('');
};
let nCapas = 0;
const capaDeck = m => { const c = m.capa_txt || { olho: 'Apresentação', titulo: [[{ t: m.nome, i: false }]] };
  return `<span class="capa-viva capa-viva--ppt${m.capa_txt ? '' : ' capa-viva--solta'}" data-inclina aria-hidden="true"><span class="cl-fundo"><i class="cl-orbe"></i><i class="cl-orbe"></i><i class="cl-orbe"></i></span><span class="cl-mar"></span>${BERG}<span class="cl-txt"><small>${esc(c.olho || 'Apresentação')}</small><b>${tituloCapa(c.titulo, nCapas++)}</b><i>${esc(m.fatos || m.formato || '')}</i></span></span>`; };
const MOTIVO = {
  barras: () => `<path class="m-e" d="M18 138h164"/>${[34, 56, 80, 104, 126].map((h, i) => `<rect class="m-b" style="--i:${i}" x="${26 + i * 31}" y="${138 - h}" width="21" height="${h}" rx="3"/>`).join('')}`,
  linha: () => `<path class="m-e" d="M18 138h164M18 138V22"/><path class="m-a" d="M22 118L62 96L100 104L140 62L178 34V138H22z"/><path class="m-l" pathLength="1" d="M22 118L62 96L100 104L140 62L178 34"/>${[[22, 118], [62, 96], [100, 104], [140, 62], [178, 34]].map(([x, y], i) => `<circle class="m-p" style="--i:${i}" cx="${x}" cy="${y}" r="5"/>`).join('')}`,
  calor: (c = 6, l = 4) => Array.from({ length: c * l }, (_, k) => { const i = k % c, j = Math.floor(k / c), o = [.25, .5, .75, 1][(i * 7 + j * 5 + i * j) % 4]; return `<rect class="m-c" style="--i:${i + j};--o:${o}" x="${20 + i * 27}" y="${22 + j * 29}" width="23" height="25" rx="4"/>`; }).join(''),
  quadrante: () => `<rect class="m-q" x="22" y="18" width="156" height="120" rx="6"/><path class="m-e m-t" d="M100 18v120M22 78h156"/>${[[136, 44, 9], [158, 62, 6], [60, 50, 7], [72, 108, 6], [128, 104, 6], [44, 92, 5]].map(([x, y, r], i) => `<circle class="m-d${i ? '' : ' m-d--f'}" style="--i:${i}" cx="${x}" cy="${y}" r="${r}"/>`).join('')}`,
  radar: () => { const P = (f, k) => { const a = -Math.PI / 2 + k * Math.PI / 3; return `${(100 + Math.cos(a) * 58 * f).toFixed(1)} ${(80 + Math.sin(a) * 58 * f).toFixed(1)}`; }, v = [.92, .6, .8, .5, .86, .68]; return [1, .66, .33].map(f => `<path class="m-e" d="M${[0, 1, 2, 3, 4, 5].map(k => P(f, k)).join('L')}Z"/>`).join('') + `<path class="m-a" d="M${v.map((f, k) => P(f, k)).join('L')}Z"/><path class="m-l" pathLength="1" d="M${v.map((f, k) => P(f, k)).join('L')}Z"/>${v.map((f, k) => `<circle class="m-p" style="--i:${k}" cx="${P(f, k).split(' ')[0]}" cy="${P(f, k).split(' ')[1]}" r="4"/>`).join('')}`; },
  tempo: () => `<path class="m-l" pathLength="1" d="M18 84h164"/>${[30, 65, 100, 135, 170].map((x, i) => `<rect class="m-c" style="--i:${i};--o:${i % 2 ? .5 : .85}" x="${x - 14}" y="${i % 2 ? 100 : 34}" width="28" height="30" rx="5"/><circle class="m-p" style="--i:${i}" cx="${x}" cy="84" r="6"/>`).join('')}`,
  letras: () => 'ARCICARIICARRICA'.split('').map((t, k) => { const i = k % 4, j = Math.floor(k / 4); return `<g class="m-c" style="--i:${i + j};--o:1"><rect class="${t === 'A' ? 'm-f1' : t === 'R' ? 'm-f2' : 'm-f3'}" x="${34 + i * 34}" y="${16 + j * 31}" width="30" height="27" rx="4"/><text x="${49 + i * 34}" y="${35 + j * 31}" text-anchor="middle">${t}</text></g>`; }).join(''),
  medidor: () => `<path class="m-e m-g" d="M30 118a70 70 0 01140 0"/><path class="m-l m-g" pathLength="1" d="M30 118a70 70 0 01140 0"/><path class="m-n" d="M100 118L100 58"/><circle class="m-p" style="--i:0" cx="100" cy="118" r="7"/>${[0, 1, 2].map(i => `<rect class="m-c" style="--i:${i + 2};--o:${[.4, .7, 1][i]}" x="${44 + i * 40}" y="130" width="32" height="8" rx="4"/>`).join('')}`,
};
const MOTIVO_DE = { 'painel-de-indicadores-da-mudanca-xlsx': 'medidor', 'avaliacao-adkar-mapa-de-resistencia': 'barras', 'lista-de-impactos-dashboard': 'calor', 'matriz-de-adocao': 'linha', 'formulario-de-diagnostico': 'radar', 'mapa-de-riscos': 'calor', 'plano-de-treinamentos': 'tempo', 'matriz-raci': 'letras', 'mapa-de-influencia': 'quadrante' };
const capaViva = m => { if (/power/i.test(m.formato || '')) return capaDeck(m);
  const mot = MOTIVO[MOTIVO_DE[m.id]] || MOTIVO[{ raci: 'letras', influencia: 'quadrante', adocao: 'linha', diagnostico: 'radar' }[m.previa]] || MOTIVO.barras;
  return `<span class="capa-viva capa-viva--xls" data-inclina aria-hidden="true"><span class="cl-txt"><small>Planilha</small><b>${esc(m.nome)}</b><i>${esc(m.fatos || m.formato || '')}</i></span><span class="cl-arte"><svg viewBox="0 0 200 156" aria-hidden="true" focusable="false">${mot()}</svg></span><span class="cl-formas"><i></i><i></i></span></span>`; };
const cab = (raiz, f, extra = '') => `<header class="lab-cab"><div class="sec-in">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<a href="${raiz}lab/">Laboratório</a>${icone('seta')}<span>${esc(f.nome)}</span></nav>
  <span class="olho">${esc(f.olho)}</span><h1>${esc(f.titulo || f.nome)}</h1><p class="lab-lead">${esc(f.lead || f.frase)}</p>${extra}</div></header>`;
const semJs = `<noscript><p class="lab-aviso">Esta ferramenta precisa de JavaScript ligado no navegador. Os modelos em Excel podem ser baixados sem ele, na página do Laboratório.</p></noscript>`;
// barra de ações: "editar" muda o conteúdo da ferramenta; "exportar" leva o resultado para fora
const barra = (editar, exportar, modelo, raiz) => `<div class="lab-barra"><div class="lab-grupo" role="toolbar" aria-label="Editar"><span class="lab-grupo-t">Editar</span>${editar}</div><div class="lab-grupo lab-grupo--sair" role="toolbar" aria-label="Exportar"><span class="lab-grupo-t">Exportar</span>${exportar}${modelo ? `<a class="btn btn--s btn--peq" href="${raiz}modelos/#${modelo.replace('.xlsx', '')}">${icone('setaFora')}Modelo em Excel</a>` : ''}</div></div>`;
const bt = (acao, ic, txt, cls = 'btn--s') => `<button type="button" class="btn ${cls} btn--peq" data-acao="${acao}">${icone(ic)}<span>${txt}</span></button>`;
const privacidade = `<p class="lab-nota">${icone('escudo')}Tudo o que você preenche fica só no seu navegador. Nada é enviado nem guardado pelo blog.</p>`;
const outras = (raiz, atual) => `<section class="sec sec--rel"><div class="sec-in"><header class="sec-cab"><div><span class="olho">Laboratório</span><h2>Outras ferramentas</h2></div><a class="link-seta" href="${raiz}lab/">Ver todas${icone('seta')}</a></header>
  <div class="lab-lista lab-lista--3">${FERRAMENTAS.filter(f => f.id !== atual).map(f => `<a class="lab-item" href="${raiz}lab/${f.slug}/"><span class="lab-item-arte">${PREVIAS[f.id]()}</span><span class="lab-item-txt"><small>${esc(f.olho)}</small><b>${esc(f.nome)}</b></span>${icone('seta')}</a>`).join('')}</div></div></section>`;
const pg = (cfg, f, corpo, scripts = ['assets/js/lab.js']) => pagina({ cfg, raiz: '../../', titulo: f.nome, descricao: f.frase, corpo, caminho: `lab/${f.slug}/`, imagem: `assets/img/og/lab-${f.id}.jpg`, classe: 'pg-lab', scripts, ativo: 'lab' });

export function labInicio({ cfg, nPerguntas, regua: rg, modelos = [] }) {
  const raiz = '../';
  const corpo = `<header class="lab-cab"><div class="sec-in">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<span>Laboratório</span></nav>
  <span class="olho">Laboratório</span><h1>Teste, monte e baixe</h1><p class="lab-lead">Um diagnóstico para saber em que nível de Change Management você está, três instrumentos para montar no navegador e modelos em PowerPoint e Excel para levar ao projeto.</p></div></header>
<section class="sec sec--lab-pg" aria-label="Ferramentas"><div class="sec-in">
  <div class="lab-cartoes">${FERRAMENTAS.map((f, i) => `<a class="lab-cartao revela" style="--i:${i}" href="${f.slug}/"><span class="lab-cartao-arte">${PREVIAS[f.id](['a', 'b', 'c', 'b'][i])}</span><span class="lab-cartao-txt"><small>${esc(f.olho)}${f.id === 'diagnostico' && nPerguntas ? ' · ' + nPerguntas + ' perguntas' : ''}</small><b>${esc(f.nome)}</b><em>${esc(f.frase)}</em><span class="link-seta">${esc(f.acao)}${icone('seta')}</span></span></a>`).join('')}</div>
</div></section>
${rg ? `<section class="sec sec--regua" aria-label="Régua de adoção"><div class="sec-in">${regua(rg, raiz)}</div></section>` : ''}
${modelos.length ? `<section class="sec sec--modelos-lab" id="modelos" aria-labelledby="modelos-t"><div class="sec-in">
  ${titSecao('modelos', 'Modelos para baixar', 'Slides e planilhas prontos para o projeto', 'Apresentações em PowerPoint e planilhas em Excel com os cálculos, o painel e as instruções de uso.', `<a class="link-seta" href="${raiz}modelos/">Ver os ${modelos.length} modelos${icone('seta')}</a>`)}
  <div class="galeria galeria--modelos revela" data-galeria>
    <ol class="galeria-trilho" data-cursor="Arraste" tabindex="0" aria-label="Modelos para baixar">${modelos.map((m, i) => `<li class="galeria-item"><a class="modelo-c holo" href="${raiz}modelos/#${esc(m.id)}"><span class="modelo-c-arte">${capaViva(m)}</span><small>${esc(m.olho)} · ${esc(m.formato || 'Excel')}</small><b>${esc(m.nome)}</b><span>${esc(m.frase)}</span><em>Ver e baixar${icone('seta')}</em></a></li>`).join('')}</ol>
    ${navGaleria('Modelos para baixar')}
  </div>
</div></section>` : ''}`;
  return pagina({ cfg, raiz, titulo: 'Laboratório', descricao: 'Diagnóstico de nível em Change Management, ferramentas interativas (matriz RACI, mapa de influência e matriz de adoção) e modelos em PowerPoint e Excel para baixar.', corpo, caminho: 'lab/', imagem: 'assets/img/og/lab.jpg', classe: 'pg-lab', ativo: 'lab' });
}

export function labDiagnostico({ cfg, dominios, relatorio }) {
  const f = { ...FERRAMENTAS[0], titulo: 'Em que nível de Change Management você está?', lead: 'Um diagnóstico formativo, com casos e perguntas de precisão sobre os principais modelos. Sem cadastro. No fim, você recebe um relatório com o seu nível, os domínios a reforçar e o que estudar.' };
  const total = dominios.reduce((a, d) => a + d.perguntas.length, 0), rapido = dominios.length * 2;
  const corpo = `${cab('../../', f)}
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="diag" data-ferramenta="diagnostico">
    <div class="diag-inicio" data-etapa="inicio">
      <div class="diag-dominios">${dominios.map((d, i) => `<div class="diag-dom"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(relatorio.dominios[d.id].nome)}</b><small>${esc(relatorio.dominios[d.id].descricao)}</small></div>`).join('')}</div>
      <div class="diag-escolha">
        <button type="button" class="diag-modo" data-modo="completo"><b>Completo</b><span>${total} perguntas · cerca de ${Math.round(total * 0.6)} minutos</span><em>Relatório mais preciso, com todos os domínios em profundidade.</em><i>${icone('seta')}</i></button>
        <button type="button" class="diag-modo" data-modo="rapido"><b>Rápido</b><span>${rapido} perguntas · cerca de ${Math.round(rapido * 0.6)} minutos</span><em>Duas perguntas por domínio, sorteadas a cada tentativa.</em><i>${icone('seta')}</i></button>
      </div>
      ${privacidade}
    </div>
    <div class="diag-prova" data-etapa="prova" hidden></div>
    <div class="relatorio" data-etapa="relatorio" hidden></div>
  </div>
  ${semJs}
  <p class="lab-rodape">Diagnóstico formativo, sem valor de certificação. Os modelos citados pertencem aos seus autores e instituições. ADKAR é marca registrada da Prosci.</p>
</div></section>${outras('../../', 'diagnostico')}`;
  return pg(cfg, f, corpo, ['assets/js/diagnostico-dados.js', 'assets/js/lab.js']);
}

export function labRaci({ cfg }) {
  const f = { ...FERRAMENTAS[1], titulo: 'Matriz RACI da mudança', lead: 'Clique em cada célula para alternar entre R, A, C e I. Edite atividades e papéis, e a conferência avisa quando falta ou sobra quem responde.' };
  const corpo = `${cab('../../', f)}
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="ferr" data-ferramenta="raci">
    ${barra(bt('add-linha', 'lista', 'Nova atividade') + bt('add-coluna', 'pessoa', 'Novo papel') + `<button type="button" class="btn btn--s btn--peq" data-acao="modo" aria-pressed="false">${icone('grade')}<span>Usar RASCI</span></button>` + bt('exemplo', 'ciclo', 'Recarregar exemplo'), bt('csv', 'setaBaixo', 'Baixar CSV') + bt('imprimir', 'copia', 'Imprimir ou PDF'), 'matriz-raci.xlsx', '../../')}
    <div class="ferr-grade"><div class="ferr-principal"><div class="tabela-rolagem" data-tabela></div></div>
      <aside class="ferr-lado"><div class="lado-caixa"><h2>Legenda</h2><ul class="legenda" data-legenda></ul></div><div class="lado-caixa"><h2>Conferência</h2><div data-conferencia></div></div><div class="lado-caixa"><h2>Carga por papel</h2><div data-carga></div></div></aside></div>
    ${privacidade}
  </div>${semJs}
  <div class="lab-como"><h2>Como ler a sua matriz</h2><ul><li><b>Um único A por atividade.</b> Quem aprova responde pelo resultado. Dois aprovadores é o mesmo que nenhum.</li><li><b>R sem A não fecha.</b> Alguém executa, mas ninguém decide quando está bom.</li><li><b>Muitos C deixam a decisão lenta.</b> Veja quem pode passar a I.</li><li><b>Valide com as pessoas.</b> A matriz que ninguém reconhece não muda comportamento.</li></ul></div>
</div></section>${outras('../../', 'raci')}`;
  return pg(cfg, f, corpo);
}

export function labInfluencia({ cfg }) {
  const f = { ...FERRAMENTAS[2], titulo: 'Mapa de influência de stakeholders', lead: 'Arraste cada pessoa ou grupo para a posição que ocupa hoje: quanta influência tem sobre o resultado e quanto apoia a mudança. A estratégia aparece ao lado.' };
  const corpo = `${cab('../../', f)}
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="ferr" data-ferramenta="influencia">
    ${barra(`<form class="ferr-add" data-form><label class="vis-oculto" for="inf-nome">Nome do stakeholder</label><input id="inf-nome" type="text" maxlength="40" placeholder="Nome ou grupo" autocomplete="off"><button type="submit" class="btn btn--p btn--peq">${icone('pessoa')}Adicionar</button></form>` + bt('exemplo', 'ciclo', 'Recarregar exemplo'), bt('png', 'setaBaixo', 'Baixar imagem') + bt('csv', 'setaBaixo', 'Baixar CSV'), 'mapa-de-influencia.xlsx', '../../')}
    <div class="ferr-grade"><div class="ferr-principal"><div class="mapa" data-mapa></div><p class="lab-dica">Arraste os pontos, ou selecione um e use as setas do teclado.</p></div>
      <aside class="ferr-lado"><div class="lado-caixa"><h2>Selecionado</h2><div data-selecionado></div></div><div class="lado-caixa"><h2>Estratégia por quadrante</h2><div data-quadrantes></div></div></aside></div>
    ${privacidade}
  </div>${semJs}
  <div class="lab-como"><h2>Como usar o mapa</h2><ul><li><b>Conquistar:</b> muita influência e pouco apoio. É a prioridade: entenda o que a pessoa perde e envolva o patrocinador.</li><li><b>Mobilizar:</b> muita influência e apoio. Dê papel visível na coalizão de patrocínio.</li><li><b>Envolver:</b> pouca influência formal e apoio alto. Bons multiplicadores.</li><li><b>Ouvir:</b> pouca influência e pouco apoio. Resistência costuma ser informação sobre o desenho da mudança.</li><li><b>Material sensível:</b> é retrato do momento. Atualize a cada fase e restrinja o acesso.</li></ul></div>
</div></section>${outras('../../', 'influencia')}`;
  return pg(cfg, f, corpo);
}

export function labAdocao({ cfg }) {
  const f = { ...FERRAMENTAS[3], titulo: 'Matriz de adoção', lead: 'Informe quantas pessoas de cada área estão hoje em cada marca da régua de adoção. O índice, o gráfico e a ação prioritária se atualizam na hora.' };
  const corpo = `${cab('../../', f)}
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="ferr" data-ferramenta="adocao">
    ${barra(bt('add-linha', 'lista', 'Nova área') + bt('exemplo', 'ciclo', 'Recarregar exemplo'), bt('png', 'setaBaixo', 'Baixar gráfico') + bt('csv', 'setaBaixo', 'Baixar CSV') + bt('imprimir', 'copia', 'Imprimir ou PDF'), 'matriz-de-adocao.xlsx', '../../')}
    <div class="ferr-grade"><div class="ferr-principal"><div class="tabela-rolagem" data-tabela></div><div class="grafico" data-grafico></div></div>
      <aside class="ferr-lado"><div class="lado-caixa lado-caixa--kpi"><h2>Índice de adoção</h2><div data-indice></div></div><div class="lado-caixa"><h2>Onde agir primeiro</h2><div data-acoes></div></div></aside></div>
    ${privacidade}
  </div>${semJs}
  <div class="lab-como"><h2>A régua e a ação de cada marca</h2><ul><li><b>Resiste → Escuta:</b> ouvir o motivo e ajustar a mensagem.</li><li><b>Observa → Exemplo:</b> mostrar funcionando, com gente parecida.</li><li><b>Experimenta → Prática:</b> tempo protegido e apoio por perto.</li><li><b>Adota → Reforço:</b> reconhecer e tirar atritos da rotina.</li><li><b>Multiplica → Palco:</b> dar voz e formar a rede.</li><li><b>Leitura agregada:</b> retrato do momento por área, não avaliação de desempenho. Veja a <a href="../../posts/mapa-de-perfil-cognitivo/">capa sobre o Mapa de Perfil Cognitivo</a>.</li></ul></div>
</div></section>${outras('../../', 'adocao')}`;
  return pg(cfg, f, corpo);
}

// ---------- modelos para baixar (com cadastro) e painel do autor ----------
export function paginaModelos({ cfg, modelos }) {
  const raiz = '../';
  const corpo = `<header class="lab-cab"><div class="sec-in">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<a href="${raiz}lab/">Laboratório</a>${icone('seta')}<span>Modelos</span></nav>
  <span class="olho">Modelos para baixar</span><h1>Instrumentos prontos para o seu projeto</h1><p class="lab-lead">Apresentações em PowerPoint e planilhas em Excel com os cálculos, o painel e as instruções de uso. Veja a prévia de cada arquivo antes de baixar; para baixar, informe nome e e-mail uma única vez.</p></div></header>
<section class="sec sec--lab-pg"><div class="sec-in" data-modelos>
  <div class="mod-grade">${modelos.map((m, i) => `<article class="mod revela" style="--i:${i % 3}" id="${esc(m.id)}">${(m.previas || []).length ? `<button type="button" class="mod-arte mod-arte--previa so-js-botao" data-previa="${esc(m.id)}" aria-label="Ver a prévia de ${esc(m.nome)}">${capaViva(m)}<span class="mod-lupa">${icone('lupa')}Ver prévia</span></button>` : `<div class="mod-arte">${capaViva(m)}</div>`}<div class="mod-txt"><small>${esc(m.olho)} · ${esc(m.formato || 'Excel')}</small><h2>${esc(m.nome)}</h2><p>${esc(m.frase)}</p>${m.fatos ? `<p class="mod-fatos">${esc(m.fatos)}</p>` : ''}<div class="mod-acoes"><button type="button" class="btn btn--p btn--peq" data-baixar="${esc(m.id)}" data-arquivo="${esc(m.arquivo)}" data-nome="${esc(m.nome)}">${icone('setaBaixo')}<span>Baixar modelo</span></button></div></div></article>`).join('')}</div>
  <p class="lab-nota">${icone('escudo')}Seu nome e e-mail são usados só para registrar o download. Não são repassados a terceiros.</p>
  <script type="application/json" data-previas-dados>${JSON.stringify(Object.fromEntries(modelos.filter(m => (m.previas || []).length).map(m => [m.id, { n: m.nome, o: `${m.olho} · ${m.formato || 'Excel'}`, f: m.fatos || '', i: m.previas.map(x => ({ s: raiz + x.src, l: x.l, a: x.a })) }]))).replace(/</g, '\\u003c')}</script>
  <dialog class="portao" data-portao aria-labelledby="portao-t">
    <form method="dialog" class="portao-in" data-form novalidate>
      <button type="button" class="m-x portao-x" data-fechar aria-label="Fechar">×</button>
      <span class="olho">Download</span><h2 id="portao-t" data-titulo>Baixar modelo</h2><p>Informe seus dados uma vez. Nos próximos downloads, basta um clique.</p>
      <label class="campo"><span>Nome</span><input type="text" name="nome" required minlength="2" maxlength="120" autocomplete="name"></label>
      <label class="campo"><span>E-mail</span><input type="email" name="email" required maxlength="254" autocomplete="email" inputmode="email"></label>
      <label class="campo"><span>Empresa (opcional)</span><input type="text" name="empresa" maxlength="120" autocomplete="organization"></label>
      <label class="aceite"><input type="checkbox" name="aceite" required><span>Concordo com o registro do meu nome e e-mail para liberar o download.</span></label>
      <p class="portao-erro" data-erro role="alert" hidden></p>
      <button type="submit" class="btn btn--p">${icone('setaBaixo')}<span>Baixar agora</span></button>
    </form>
  </dialog>
</div>
<noscript><div class="sec-in"><p class="lab-aviso">O download com cadastro precisa de JavaScript ligado no navegador.</p></div></noscript></section>`;
  return pagina({ cfg, raiz, titulo: 'Modelos para baixar', descricao: 'Modelos em PowerPoint e Excel para gestão da mudança: kit de slides, avaliação ADKAR com mapa de resistência, lista de impactos com dashboard, mapa de adoção, mapa de riscos e mais.', corpo, caminho: 'modelos/', imagem: 'assets/img/og/lab.jpg', classe: 'pg-lab', scripts: ['assets/js/cfg.js', 'assets/js/modelos.js'], ativo: 'modelos' });
}

export function paginaPainel({ cfg }) {
  const raiz = '../';
  const corpo = `<section class="sec sec--lab-pg"><div class="sec-in" data-painel>
  <span class="olho">Painel do autor</span><h1 class="arq-tit" style="text-transform:none">Downloads dos modelos</h1>
  <form class="painel-login" data-login><p class="arq-sub">Área restrita. Entre com o e-mail e a senha de administrador.</p>
    <label class="campo"><span>E-mail</span><input type="email" name="email" required autocomplete="username"></label>
    <label class="campo"><span>Senha</span><input type="password" name="senha" required autocomplete="current-password"></label>
    <p class="portao-erro" data-erro role="alert" hidden></p><button type="submit" class="btn btn--p">Entrar</button></form>
  <div data-dados hidden></div>
</div></section>`;
  return pagina({ cfg, raiz, titulo: 'Painel', descricao: 'Área restrita.', corpo, caminho: 'painel/', classe: 'pg-lab', scripts: ['assets/js/cfg.js', 'assets/js/modelos.js'] }).replace('<meta name="author"', '<meta name="robots" content="noindex, nofollow">\n<meta name="author"');
}
