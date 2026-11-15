// Apresentações em HTML: cada arquivo de _src/content/apresentacoes/<id>.json vira uma página autônoma de slides
// (apresentacoes/<id>/index.html), com o motor embutido (assets/css/deck.css e assets/js/deck.js). A página não depende
// do resto do site: abre sozinha, pode ser salva e baixada como um arquivo único. Aqui ficam os tipos de slide e a
// página que lista as apresentações. Texto: *ênfase* vira itálico e {projeto}, {area}, {data} e {quem} viram campos que
// a pessoa preenche uma vez (com maiúscula, {Projeto}, o texto de espera começa em maiúscula).
import { createHash } from 'node:crypto';
import { esc } from './md.mjs';
import { icone, marca } from './ilustra.mjs';
import { iconeVivo } from './vivo.mjs';
import { pagina } from './modelos.mjs';
import { capaDeck } from './lab.mjs';

const CAMPOS = { projeto: ['Nome do projeto', 'nome do projeto'], area: ['Área responsável', 'área responsável'], data: ['Data ou período', 'mês e ano'], quem: ['Quem apresenta', 'quem apresenta'] };
const IC = {
  esq: '<path d="M19 12H5M11 6l-6 6 6 6"/>', dir: '<path d="M5 12h14M13 6l6 6-6 6"/>', tocar: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  leitura: '<path d="M5 6h14M5 10.5h14M5 15h14M5 19.5h9"/>', grade: '<rect x="4" y="5" width="7" height="6" rx="1.2"/><rect x="13" y="5" width="7" height="6" rx="1.2"/><rect x="4" y="13.5" width="7" height="6" rx="1.2"/><rect x="13" y="13.5" width="7" height="6" rx="1.2"/>',
  notas: '<path d="M6 4h9l4 4v12H6zM15 4v4h4M9 12.5h7M9 16h5"/>', campos: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  editar: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 7l3 3"/>', cron: '<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2.4 1.6M10 3.5h4M18.2 7l1.3-1.3"/>',
  cheia: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', pdf: '<path d="M7 9V4h10v5M7 17H5V9h14v8h-2M7 14h10v6H7z"/>', baixar: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  ajuda: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', voltar: '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4.5V9h4.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', marco: '<path d="M6 21V4M6 5h11l-2.5 3.5L17 12H6"/>', mais: '<path d="M12 6v12M6 12h12"/>',
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

// ---------- texto: ênfase, campos e trechos editáveis ----------
const rico = t => esc(t).replace(/\*(.+?)\*/g, '<em>$1</em>');
const campo = (nome, maius) => { const v = CAMPOS[nome][1], txt = `[${maius ? v.charAt(0).toUpperCase() + v.slice(1) : v}]`; return `<span data-campo="${nome}" data-vazio="${esc(txt)}" class="vazio">${esc(txt)}</span>`; };
const RE_CAMPO = /\{(projeto|area|data|quem)\}/i;
// um elemento editável; se o texto tem campos, cada trecho de texto vira um editável separado e o campo fica fora dele
const ed = (c, tag, cls, texto, extra = '') => {
  const t = String(texto ?? ''), a = cls ? ` class="${cls}"` : '';
  if (!RE_CAMPO.test(t)) return `<${tag}${a} data-e="${c.e++}"${extra}>${rico(t)}</${tag}>`;
  const partes = t.split(/(\{(?:projeto|area|data|quem)\})/i).filter(Boolean).map(p => { const m = /^\{(\w+)\}$/.exec(p); return m ? campo(m[1].toLowerCase(), /^[A-Z]/.test(m[1])) : `<span data-e="${c.e++}">${rico(p)}</span>`; });
  return `<${tag}${a}${extra}>${partes.join('')}</${tag}>`;
};
const linhas = (c, arr) => arr.map((l, i) => ed(c, 'span', 'ln', l, ` style="--l:${i}"`)).join('');
const limpo = t => String(t ?? '').replace(/\*/g, '').replace(/\{(\w+)\}/g, (_, k) => `[${(CAMPOS[k.toLowerCase()] || ['', k])[1]}]`);

// ---------- iceberg das capas, divisórias e fechamentos: a mesma geometria dos arquivos em PowerPoint (modelos_pptx_base.py) ----------
const gelo = ({ cx, yw, u, de, ate = 1400 }) => {
  const x = dx => (cx + dx * u).toFixed(1), y = dy => (yw + dy * u).toFixed(1), poli = pts => 'M' + pts.map(([dx, dy]) => `${x(dx)} ${y(dy)}`).join('L') + 'Z';
  const borda = [[-1.30, 0.17], [1.35, 0.17], [1.90, 1.15], [1.60, 2.40], [0.50, 3.50], [-0.65, 2.90], [-1.45, 1.80], [-1.65, 1.00]];
  const facetas = [[0.08, 0.17], [-1.65, 1.00], [1.90, 1.15], [1.60, 2.40], [0.50, 3.50], [-0.65, 2.90]];
  const ponta = [['b-p1', [[-0.38, -0.90], [0, -0.90], [0, -0.05], [-0.84, -0.05], [-0.68, -0.58]]], ['b-p2', [[0.02, -1.80], [0.75, -0.62], [0.92, -0.05], [0, -0.05], [0, -1.0]]], ['b-p3', [[0.02, -1.80], [0.32, -0.98], [0.12, -0.05], [-0.34, -0.05], [-0.38, -0.90]]]];
  const bolhas = [[-2.0, 3.0, .07], [-0.9, 3.45, .095], [0.9, 3.6, .06], [2.2, 2.9, .085], [1.5, 3.3, .05]];
  const agua = `M${de ?? x(-2.05)} ${y(0.035)}H${ate}`;
  return `<svg class="ice" style="--u:${u}" viewBox="0 0 1333 750" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false"><g>${bolhas.map(([dx, dy, r], i) => `<circle class="b-bolha" style="--i:${i}" cx="${x(dx)}" cy="${y(dy)}" r="${(r * u).toFixed(1)}"/>`).join('')}</g><g class="b-berg" style="transform-origin:${cx}px ${yw}px"><path class="b-borda" pathLength="1" d="${poli(borda)}"/>${facetas.map((f, i) => `<path class="b-faceta" pathLength="1" style="--i:${i}" d="M${x(0)} ${y(1.4)}L${x(f[0])} ${y(f[1])}"/>`).join('')}<g class="b-ponta">${ponta.map(([k, pts]) => `<path class="${k}" d="${poli(pts)}"/>`).join('')}</g></g><path class="b-agua" pathLength="1" d="${agua}"/><path class="b-reflexo" pathLength="1" d="${agua}"/></svg>`;
};

// ---------- peças comuns ----------
const cab = (c, s) => `<header class="sl-cab">${s.olho ? ed(c, 'p', 'sl-olho', s.olho) : ''}${s.titulo ? ed(c, 'h2', 'sl-tit', s.titulo) : ''}</header>`;
const pe = (c, n) => `<footer class="sl-pe"><span>Change Management <i>World</i></span><span class="sl-proj">${campo('projeto', true)}</span><span class="sl-num">${n}</span></footer>`;
const nota = (c, s) => s.nota ? ed(c, 'p', 'nota', s.nota) : '';
const lista = (c, itens) => itens && itens.length ? `<ul>${itens.map(x => ed(c, 'li', '', x)).join('')}</ul>` : '';
const chip = (c, v) => { const m = /^@(\d)\s+(.*)$/.exec(String(v)); return m ? `<span class="chip chip--${m[1]}" data-e="${c.e++}">${rico(m[2])}</span>` : null; };
const P = (s, k) => s.etapas === false ? '' : ` data-p="${k}"`;

// ---------- tipos de slide: cada um devolve o miolo do slide (dentro de .sl) e, se for o caso, a arte de fundo ----------
const TIPOS = {
  capa: (c, s) => ({ escuro: true, arte: gelo({ cx: 1075, yw: 312, u: 100 }), miolo: `<div class="capa-txt">${ed(c, 'p', 'sl-olho', s.olho)}<h1 class="capa-tit">${linhas(c, s.titulo)}</h1>${s.sub ? ed(c, 'p', 'capa-sub', s.sub) : ''}</div><p class="capa-meta"><span>${campo('area', true)} · ${campo('data')}</span></p>` }),
  secao: (c, s) => ({ escuro: true, arte: gelo({ cx: 1115, yw: 445, u: 55, de: 80, ate: 1253 }), miolo: `${ed(c, 'p', 'sl-olho', s.olho)}<div class="secao-linha"><span class="secao-n" data-e="${c.e++}">${esc(s.n)}</span><h2 class="secao-tit">${linhas(c, s.titulo)}</h2></div>${s.apoio ? ed(c, 'p', 'secao-apoio', s.apoio) : ''}` }),
  mensagem: (c, s) => ({ miolo: `${s.olho ? ed(c, 'p', 'sl-olho', s.olho) : ''}<div class="sl-corpo">${ed(c, 'p', 'msg', s.frase)}${s.apoio ? ed(c, 'p', 'msg-apoio', s.apoio) : ''}${s.itens ? `<ol class="msg-itens">${s.itens.map((x, i) => `<li${P(s, i + 1)}><b>${String(i + 1).padStart(2, '0')}</b>${ed(c, 'strong', '', x.t)}${ed(c, 'span', '', x.d)}</li>`).join('')}</ol>` : ''}</div>` }),
  cartoes: (c, s) => ({ miolo: `${cab(c, s)}<div class="sl-corpo"><div class="cartoes${s.numeros ? ' cartoes--numeros' : ''}" style="--n:${s.itens.length}">${s.itens.map((x, i) => `<article class="cartao${x.dest ? ' cartao--dest' : ''}"${P(s, i + 1)}>${x.icone ? `<span class="cartao-ic">${iconeVivo(x.icone)}</span>` : ''}${x.n ? `<span class="cartao-n">${esc(x.n)}</span>` : ''}${x.v != null ? `<span class="cartao-v"><span data-e="${c.e++}" data-conta>${esc(x.v)}</span>${x.un ? `<small>${esc(x.un)}</small>` : ''}</span>` : ''}${ed(c, 'h3', '', x.t)}${x.d ? ed(c, 'p', '', x.d) : ''}${lista(c, x.lista)}</article>`).join('')}</div>${nota(c, s)}</div>` }),
  depara: (c, s) => { const [a, b] = s.cab || ['Hoje', 'Depois']; return { miolo: `${cab(c, s)}<div class="sl-corpo"><div class="depara"><div class="dp-cab"><span></span><b>${esc(a)}</b><span></span><b>${esc(b)}</b></div>${s.linhas.map(([rot, de, para], i) => `<div class="dp-l"${P(s, i + 1)}>${ed(c, 'span', 'dp-rot', rot)}${ed(c, 'p', 'dp-de', de, ` data-th="${esc(a)}"`)}<span class="dp-seta">${ic('dir')}</span>${ed(c, 'p', 'dp-para', para, ` data-th="${esc(b)}"`)}</div>`).join('')}</div>${nota(c, s)}</div>` }; },
  tabela: (c, s) => ({ miolo: `${cab(c, s)}<div class="sl-corpo"><table class="tab${s.densa ? ' tab--densa' : ''}">${s.larguras ? `<colgroup>${s.larguras.map(w => `<col style="width:${w}%">`).join('')}</colgroup>` : ''}<thead><tr>${s.colunas.map(k => `<th scope="col">${esc(k)}</th>`).join('')}</tr></thead><tbody>${s.linhas.map((l, i) => `<tr style="--i:${i}">${l.map((v, j) => { const ch = chip(c, v); return ch ? `<td data-th="${esc(s.colunas[j])}">${ch}</td>` : ed(c, 'td', '', v, ` data-th="${esc(s.colunas[j])}"`); }).join('')}</tr>`).join('')}</tbody></table>${nota(c, s)}</div>` }),
  linha: (c, s) => ({ miolo: `${cab(c, s)}<div class="sl-corpo"><ol class="linha" style="--n:${s.fases.length}">${s.fases.map((f, i) => `<li class="fase${f.dest ? ' fase--dest' : ''}"${P(s, i + 1)}>${ed(c, 'small', 'fase-per', f.per)}${ed(c, 'h3', '', f.nome)}${lista(c, f.itens)}${f.marco ? `<em class="fase-marco">${ic('marco')}<span data-e="${c.e++}">${rico(f.marco)}</span></em>` : ''}</li>`).join('')}</ol>${nota(c, s)}</div>` }),
  agenda: (c, s) => { const n = s.itens.length, hm = t => { const m = /^(\d{1,2})[:h](\d{2})$/.exec(t); return m ? +m[1] * 60 + +m[2] : 540; }, hora = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const t0 = hm(s.inicio || '09:00'); let t = t0; const horas = s.itens.map(x => { const h = hora(t); t += +x.min || 0; return h; }), tot = t - t0, dur = tot < 60 ? `${tot} min` : `${Math.floor(tot / 60)} h${tot % 60 ? ' ' + String(tot % 60).padStart(2, '0') + ' min' : ''}`;
    return { miolo: `${cab(c, s)}<div class="sl-corpo"><div class="agenda" data-agenda><p class="ag-cab"><small>Início</small><b class="ag-inicio" data-e="${c.e++}">${esc(s.inicio || '09:00')}</b><span class="ag-total">${dur} de encontro · término às ${hora(t)}</span></p><ol class="ag-lista" style="--linhas:${n > 6 ? Math.ceil(n / 2) : n}">${s.itens.map((x, i) => `<li class="ag-item${x.pausa ? ' ag-item--pausa' : ''}" style="--i:${i}"><time class="ag-hora">${horas[i]}</time><span><b class="ag-t" data-e="${c.e++}">${rico(x.t)}</b>${x.quem ? `<span class="ag-quem" data-e="${c.e++}">${rico(x.quem)}</span>` : ''}</span><span class="ag-dur"><span class="ag-min" data-e="${c.e++}">${esc(x.min)}</span> min</span></li>`).join('')}</ol></div>${nota(c, s)}</div>` }; },
  matriz: (c, s) => ({ miolo: `${cab(c, s)}<div class="sl-corpo"><div class="matriz" data-matriz style="--cols:${s.colunas.length}"><div class="mz-cab"><span></span>${s.colunas.map(k => `<b>${esc(k)}</b>`).join('')}<b>Geral</b></div>${s.linhas.map((l, i) => `<div class="mz-l" style="--i:${i}"><span class="mz-rot">${ed(c, 'b', '', l.nome)}${l.sub ? ed(c, 'small', '', l.sub) : ''}</span>${l.graus.map((g, j) => `<button type="button" class="mz-c" style="--c:${j}" data-g="${g}" data-k="m${c.n}-${i}-${j}" data-th="${esc(s.colunas[j])}"><span>${['–', 'Baixo', 'Médio', 'Alto'][g]}</span></button>`).join('')}<span class="mz-geral" style="--c:${l.graus.length}" data-g="${Math.max(0, ...l.graus)}" data-th="Geral"><span>${['–', 'Baixo', 'Médio', 'Alto'][Math.max(0, ...l.graus)]}</span></span></div>`).join('')}<p class="mz-leg"><span><i data-g="3"></i>Alto</span><span><i data-g="2"></i>Médio</span><span><i data-g="1"></i>Baixo</span><span><i data-g="0"></i>Sem impacto</span><em>Geral: o maior grau da linha. Em “Editar texto”, clique numa célula para mudar o grau.</em></p></div>${nota(c, s)}</div>` }),
  barras: (c, s) => { const temMeta = s.itens.some(x => x.meta != null), un = s.un ?? '%', max = s.max || 100, pct = v => Math.max(0, Math.min(100, v / max * 100)).toFixed(1);
    const sit = x => x.meta == null ? 2 : (x.inv ? x.v <= x.meta : x.v >= x.meta) ? 1 : (x.inv ? x.v <= x.meta * 1.25 : x.v >= x.meta * .8) ? 2 : 3;
    return { miolo: `${cab(c, s)}<div class="sl-corpo"><div class="barras" data-barras data-max="${max}">${s.itens.map((x, i) => `<div class="br-l" data-s="${sit(x)}" style="--i:${i};--v:${pct(x.v)};--m:${pct(x.meta ?? 0)}"${x.inv ? ' data-inv' : ''}>${ed(c, 'span', 'br-rot', x.rot)}<span class="br-trilho"><i class="br-b"></i>${x.meta != null ? '<u class="br-meta"></u>' : ''}</span><b class="br-v"><span data-e="${c.e++}">${esc(x.v)}</span>${esc(un)}</b>${x.meta != null ? `<small class="br-m">meta <span data-e="${c.e++}">${esc(x.meta)}</span>${esc(un)}</small>` : '<small class="br-m"></small>'}</div>`).join('')}${temMeta ? '<p class="br-leg"><span><i data-g="1"></i>Na meta</span><span><i data-g="2"></i>Em atenção</span><span><i data-g="3"></i>Crítico</span><span><u></u>Meta</span></p>' : ''}</div>${nota(c, s)}</div>` }; },
  escada: (c, s) => ({ miolo: `${cab(c, s)}<div class="sl-corpo"><ol class="escada" style="--n:${s.degraus.length}">${s.degraus.map((d, i) => `<li class="degrau${s.foco === i ? ' degrau--foco' : ''}" style="--k:${i}"${P(s, i + 1)}><b class="dg-n">${esc(d.n || String(i + 1).padStart(2, '0'))}</b>${ed(c, 'h3', '', d.t)}${ed(c, 'p', '', d.d)}</li>`).join('')}</ol>${nota(c, s)}</div>` }),
  lista: (c, s) => ({ miolo: `${cab(c, s)}<div class="sl-corpo"><ul class="lista${s.colunas === 2 ? ' lista--2' : ''}">${s.itens.map((x, i) => `<li style="--i:${i}"><span class="li-ic">${ic('check')}</span><div>${ed(c, 'b', '', x.t)}${x.d ? ed(c, 'p', '', x.d) : ''}</div>${x.quem ? ed(c, 'span', 'li-quem', x.quem) : '<span></span>'}${x.quando ? ed(c, 'span', 'li-quando', x.quando) : '<span></span>'}</li>`).join('')}</ul>${nota(c, s)}</div>` }),
  fecho: (c, s) => ({ escuro: true, arte: gelo({ cx: 1115, yw: 405, u: 55, de: 80, ate: 1253 }), miolo: `${ed(c, 'p', 'sl-olho', s.olho || 'Para fechar')}<div class="fecho-cx"><p class="fecho-msg">${linhas(c, s.frase)}</p></div>${s.apoio ? ed(c, 'p', 'fecho-apoio', s.apoio) : ''}<p class="fecho-contato"><b>${campo('quem', true)}</b><span>${campo('area', true)}</span></p>` }),
};

const slide = (c, s, n, total) => {
  const f = TIPOS[s.tipo]; if (!f) throw new Error(`apresentação ${c.id}: tipo de slide desconhecido "${s.tipo}"`);
  c.n = n; const r = f(c, s), tit = limpo(Array.isArray(s.titulo) ? s.titulo.join(' ') : s.titulo || (Array.isArray(s.frase) ? s.frase.join(' ') : s.frase) || s.olho || '');
  return `<section class="slide slide--${s.tipo}${r.escuro ? ' slide--escuro' : ''}" id="s${n}" data-n="${n}" aria-roledescription="slide" aria-label="${n} de ${total}: ${esc(tit)}">${r.arte || ''}<div class="sl">${r.miolo}${pe(c, n)}</div>${s.notas ? `<aside class="sl-notas" data-e="${c.e++}" aria-label="Notas de quem apresenta">${esc(s.notas)}</aside>` : ''}</section>`;
};

// capa da apresentação para os cartões do site (a mesma capa viva dos modelos em PowerPoint)
export const capaDoDeck = d => { const s = d.slides[0]; return capaDeck({ nome: d.nome, fatos: `${d.slides.length} slides · HTML`, capa_txt: { olho: s.olho, titulo: s.titulo.map(l => l.split(/(\{\w+\})/).filter(Boolean).map(p => { const m = /^\{(\w+)\}$/.exec(p); return m ? { t: `[${/^[A-Z]/.test(m[1]) ? CAMPOS[m[1].toLowerCase()][1].replace(/^./, x => x.toUpperCase()) : CAMPOS[m[1].toLowerCase()][1]}]`, i: true } : { t: p.replace(/\*/g, ''), i: false }; })) } }); };

// ---------- página autônoma de uma apresentação ----------
export function deckHTML({ cfg, d, css, js }) {
  const c = { id: d.id, e: 0, n: 0 }, base = (cfg.url || '').replace(/\/$/, ''), url = base ? `${base}/apresentacoes/${d.id}/` : '', total = d.slides.length;
  const corpo = d.slides.map((s, i) => slide(c, s, i + 1, total)).join('\n');
  const usados = Object.keys(CAMPOS).filter(k => corpo.includes(`data-campo="${k}"`));
  const ver = createHash('sha1').update(JSON.stringify(d.slides)).digest('hex').slice(0, 8);
  const logo = marca().replace(/var\(--azul-p\)/g, '#0A2463').replace(/var\(--azul\)/g, '#2F6FED').replace(/\s*\n\s*/g, '');
  const fav = 'data:image/svg+xml,' + encodeURIComponent(logo.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
  const B = (acao, icn, rot, extra = '') => `<button type="button" class="bt${acao === 'apresentar' ? ' bt--p' : ''}" data-acao="${acao}"${extra} title="${esc(rot)}" aria-label="${esc(rot)}">${ic(icn)}<span>${esc(rot)}</span></button>`;
  const atalhos = [['→ ou espaço', 'Próxima etapa ou próximo slide'], ['←', 'Voltar'], ['F', 'Tela cheia'], ['G', 'Ver todos os slides'], ['N', 'Notas de quem apresenta'], ['E', 'Editar o texto na tela'], ['P', 'Personalizar os campos'], ['T', 'Cronômetro'], ['L / A', 'Leitura / Apresentar'], ['Esc', 'Sair da edição, da grade ou da tela cheia']];
  return `<!doctype html>
<html lang="pt-BR" data-deck="${esc(d.id)}" data-ver="${ver}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.nome)} · apresentação em HTML · ${esc(cfg.nome || 'Change Management World')}</title>
<meta name="description" content="${esc(d.frase)}">
${url ? `<link rel="canonical" href="${url}">\n<meta property="og:url" content="${url}">` : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(d.nome)} · apresentação em HTML">
<meta property="og:description" content="${esc(d.frase)}">
${base ? `<meta property="og:image" content="${base}/assets/img/og/apresentacao-${esc(d.id)}.jpg">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="#0A2463">
<link rel="icon" href="${fav}">
<style id="dk-fontes">@font-face{font-family:'Newsreader';src:url('../../assets/fonts/newsreader.woff2') format('woff2');font-weight:200 800;font-display:swap}@font-face{font-family:'Newsreader';src:url('../../assets/fonts/newsreader-italic.woff2') format('woff2');font-weight:200 800;font-style:italic;font-display:swap}@font-face{font-family:'Inter';src:url('../../assets/fonts/inter.woff2') format('woff2');font-weight:100 900;font-display:swap}</style>
<style>${css}</style>
</head>
<body>
<main class="slides" aria-label="${esc(d.nome)}">
${corpo}
</main>
<div class="notas-painel"><b>Notas de quem apresenta</b><p></p></div>
<div class="faixa" role="status"><span>Editando</span><button type="button" class="bt" data-acao="restaurar">${ic('voltar')}<span>Restaurar</span></button><button type="button" class="bt" data-acao="concluir">${ic('check')}<span>Concluir</span></button></div>
<div class="cron" role="timer" aria-label="Cronômetro"><output>5:00</output><button type="button" class="bt" data-cron="tocar"><span>Iniciar</span></button><button type="button" class="bt" data-cron="mais" aria-label="Mais um minuto"><span>+1 min</span></button><button type="button" class="bt" data-cron="zerar" aria-label="Recomeçar">${ic('voltar')}</button><button type="button" class="bt" data-cron="fechar" aria-label="Fechar o cronômetro">${ic('x')}</button></div>
<p class="aviso" role="status" aria-live="polite"></p>
<p class="so-leitor" aria-live="polite" data-vivo></p>
<nav class="barra" aria-label="Comandos da apresentação">
  <div class="barra-prog" aria-hidden="true"><i></i></div>
  <a class="barra-site" href="${base ? base + '/apresentacoes/' : '../'}" title="Todas as apresentações">${logo}<span>Change Management <i>World</i></span></a>
  <div class="barra-nav"><button type="button" class="bt" data-acao="ant" aria-label="Voltar">${ic('esq')}</button><output class="barra-conta">1 / ${total}</output><button type="button" class="bt" data-acao="prox" aria-label="Avançar">${ic('dir')}</button></div>
  <div class="barra-acoes">
    ${B('apresentar', 'tocar', 'Apresentar')}${B('leitura', 'leitura', 'Leitura')}${B('grade', 'grade', 'Slides', ' aria-pressed="false"')}${B('notas', 'notas', 'Notas', ' aria-pressed="false"')}<span class="barra-sep"></span>
    ${B('campos', 'campos', 'Personalizar')}${B('editar', 'editar', 'Editar texto', ' aria-pressed="false"')}${B('cron', 'cron', 'Cronômetro', ' aria-pressed="false"')}<span class="barra-sep"></span>
    ${B('cheia', 'cheia', 'Tela cheia', ' aria-pressed="false"')}${B('pdf', 'pdf', 'PDF')}${B('baixar', 'baixar', 'Baixar')}<button type="button" class="bt" data-acao="ajuda" aria-label="Atalhos do teclado" title="Atalhos do teclado">${ic('ajuda')}</button>
  </div>
</nav>
<dialog class="painel" data-painel="campos" aria-labelledby="dk-campos-t"><form method="dialog">
  <h2 id="dk-campos-t">Personalizar</h2><p>Preencha uma vez: vale para todos os slides. Deixe em branco para manter o texto de espera.</p>
  ${usados.map(k => `<label>${esc(CAMPOS[k][0])}<input name="${k}" type="text" autocomplete="off" maxlength="80"></label>`).join('')}
  <div class="painel-acoes"><button type="button" class="bt" data-fechar><span>Cancelar</span></button><button type="submit" class="bt bt--p"><span>Aplicar</span></button></div>
</form></dialog>
<dialog class="painel" data-painel="ajuda" aria-labelledby="dk-ajuda-t"><form method="dialog">
  <h2 id="dk-ajuda-t">Atalhos do teclado</h2>
  <dl>${atalhos.map(([k, t]) => `<dt><kbd>${esc(k)}</kbd></dt><dd>${esc(t)}</dd>`).join('')}</dl>
  <p>Na apresentação, um clique no slide também avança. O que você muda fica salvo neste navegador; “Baixar” gera um arquivo único, que abre sem internet.</p>
  <p>Modelo livre para uso e adaptação. ${base ? `<a href="${base}/apresentacoes/">${esc(cfg.nome || 'Change Management World')}</a>` : esc(cfg.nome || 'Change Management World')}, por ${esc(cfg.autor || '')}.</p>
  <div class="painel-acoes"><button type="submit" class="bt bt--p"><span>Entendi</span></button></div>
</form></dialog>
<script>${js}</script>
</body>
</html>
`;
}

// ---------- página que lista as apresentações (dentro do site) ----------
const PASSOS = [['Abra', 'A apresentação roda no navegador, em tela cheia, com as setas do teclado.'], ['Adapte', 'Preencha o nome do projeto uma vez e edite qualquer texto na própria tela.'], ['Apresente', 'Etapas por clique, notas de quem apresenta e cronômetro para os intervalos.'], ['Leve', 'Salve em PDF ou baixe um arquivo único, que abre sem internet.']];
export const cartaoDeck = (d, raiz, tag = 'h2') => `<article class="mod revela" id="${esc(d.id)}"><a class="mod-arte" href="${raiz}apresentacoes/${esc(d.id)}/" aria-label="Abrir a apresentação ${esc(d.nome)}">${capaDoDeck(d)}</a><div class="mod-txt"><small>${esc(d.olho)} · HTML</small><${tag}>${esc(d.nome)}</${tag}><p>${esc(d.frase)}</p><p class="mod-fatos">${d.slides.length} slides · ${esc(d.duracao)} · ${esc(d.para)}</p><div class="mod-acoes"><a class="btn btn--p btn--peq" href="${raiz}apresentacoes/${esc(d.id)}/">${icone('play')}<span>Abrir apresentação</span></a><a class="link-seta" href="${raiz}apresentacoes/${esc(d.id)}/?modo=leitura">Ler os slides${icone('seta')}</a></div></div></article>`;
export function paginaApresentacoes({ cfg, decks }) {
  const raiz = '../';
  const corpo = `<header class="lab-cab"><div class="sec-in">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<a href="${raiz}lab/">Laboratório</a>${icone('seta')}<span>Apresentações</span></nav>
  <span class="olho">Apresentações em HTML</span><h1>Slides prontos para abrir, adaptar e apresentar no navegador</h1><p class="lab-lead">${decks.length} apresentações de gestão da mudança que funcionam como um PowerPoint, sem precisar instalar nada: abra o link, preencha o nome do projeto, edite o texto na tela e apresente.</p></div></header>
<section class="sec sec--lab-pg"><div class="sec-in">
  <ol class="uso revela" aria-label="Como usar">${PASSOS.map(([t, x], i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><strong>${esc(t)}</strong><span>${esc(x)}</span></li>`).join('')}</ol>
  <div class="mod-grade">${decks.map(d => cartaoDeck(d, raiz)).join('')}</div>
  <p class="lab-nota">${icone('escudo')}Não é preciso cadastro. O que você edita fica salvo só no seu navegador. Prefere PowerPoint ou Excel? Veja os <a href="${raiz}modelos/">modelos para baixar</a>.</p>
</div></section>`;
  return pagina({ cfg, raiz, titulo: 'Apresentações em HTML', descricao: 'Apresentações de gestão da mudança em HTML, para abrir, adaptar e apresentar no navegador: visão do programa, comunicação, cultura e engajamento, impactos e kickoff com plano de treinamento.', corpo, caminho: 'apresentacoes/', imagem: 'assets/img/og/apresentacoes.jpg', classe: 'pg-lab', ativo: 'lab' });
}
