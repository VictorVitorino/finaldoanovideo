// Modelos de página do blog. Cada função recebe os dados já carregados e devolve HTML.
import { esc, markdown, minutos, data } from './md.mjs';
import { icone, marca, globo, capa } from './ilustra.mjs';

export const TEMAS = {
  ia: { nome: 'IA & Mudança', ic: 'faisca', frase: 'Como a IA muda quem muda' },
  mundo: { nome: 'Mundo da profissão', ic: 'globo', frase: 'Normas, pesquisas e tendências' },
  transformacao: { nome: 'Transformação', ic: 'ciclo', frase: 'O que faz dar certo' },
  'carve-out': { nome: 'Carve-out', ic: 'tesoura', frase: 'Separar sem perder gente' },
  'due-diligence': { nome: 'Due diligence e M&A', ic: 'lupa', frase: 'Pessoas antes do preço' },
  'governanca-ti': { nome: 'Governança de TI', ic: 'escudo', frase: 'Regra que vira hábito' },
  adocao: { nome: 'Adoção', ic: 'rota', frase: 'Da ferramenta ao uso' },
  brasil: { nome: 'Brasil & LatAm', ic: 'bussola', frase: 'O que acontece por aqui' },
};
const TIPOS = { capa: 'Capa da semana', reportagem: 'Reportagem', guia: 'Guia de campo', video: 'Vídeo' };
const tema = p => TEMAS[p.tema] || TEMAS.mundo;
const urlPost = (raiz, p) => `${raiz}posts/${p.slug}/`;

// ---------- esqueleto ----------
export function pagina({ cfg, raiz, titulo, descricao, corpo, caminho = '', imagem, tipo = 'website', classe = '', artigo, scripts = [], ativo = '' }) {
  const tituloCompleto = titulo ? `${titulo} · ${cfg.nome}` : `${cfg.nome} · ${cfg.lema}`;
  const abs = cfg.url ? cfg.url.replace(/\/$/, '') + '/' + caminho : '';
  const og = imagem ? (cfg.url ? cfg.url.replace(/\/$/, '') + '/' + imagem : raiz + imagem) : '';
  const nav = [['#radar', 'Radar'], ['#ia', 'IA & Mudança'], ['#guias', 'Guias'], ['lab/', 'Laboratório'], ['#videos', 'Vídeos'], ['#eventos', 'Eventos'], ['#mes', 'Posts do mês'], ['#sobre', 'Sobre']]
    .map(([h, t]) => h[0] === '#' ? `<a href="${raiz ? raiz + 'index.html' : ''}${h}">${t}</a>` : `<a href="${raiz}${h}"${ativo === 'lab' ? ' class="aqui" aria-current="page"' : ''}>${t}</a>`).join('');
  return `<!doctype html>
<html lang="${cfg.idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(descricao || cfg.descricao)}">
<meta name="author" content="${esc(cfg.autor)}">
<meta name="theme-color" content="#0A2463">
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="${esc(cfg.nome)}">
<meta property="og:title" content="${esc(titulo || cfg.nome)}">
<meta property="og:description" content="${esc(descricao || cfg.descricao)}">
<meta property="og:locale" content="pt_BR">
${abs ? `<meta property="og:url" content="${esc(abs)}">\n<link rel="canonical" href="${esc(abs)}">` : ''}
${og ? `<meta property="og:image" content="${esc(og)}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="627">\n<meta name="twitter:card" content="summary_large_image">` : ''}
${artigo ? `<meta property="article:published_time" content="${esc(artigo.data)}">\n<meta property="article:author" content="${esc(cfg.autor)}">\n<meta property="article:section" content="${esc(artigo.secao)}">` : ''}
<link rel="icon" href="${raiz}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${raiz}assets/fonts/newsreader.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${raiz}assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${raiz}assets/css/site.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="${classe}">
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo" data-topo>
  <div class="topo-in">
    <a class="logo" href="${raiz}index.html" aria-label="${esc(cfg.nome)}: início">${marca()}<span class="logo-txt">Change Management <i>World</i></span><span class="logo-curto">CM <i>World</i></span></a>
    <nav class="nav" aria-label="Seções" data-nav>${nav}</nav>
    <div class="topo-acoes">
      <a class="btn-ic" href="${raiz ? raiz + 'index.html' : ''}#radar" data-abrir-busca aria-label="Buscar no radar">${icone('busca')}</a>
      ${cfg.linkedin ? `<a class="btn btn--p btn--peq so-desk" href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}Seguir</a>` : ''}
      <button class="btn-ic so-mob" type="button" data-menu aria-expanded="false" aria-controls="menu-mob" aria-label="Abrir menu">${icone('menu', 'ic-menu')}${icone('x', 'ic-x')}</button>
    </div>
  </div>
  <div class="menu-mob" id="menu-mob" hidden>${nav}${cfg.linkedin ? `<a class="btn btn--p" href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}Seguir no LinkedIn</a>` : ''}</div>
</header>
<main id="conteudo">
${corpo}
</main>
<footer class="rodape">
  <div class="rodape-in">
    <div class="rodape-marca">${marca()}<div><strong>${esc(cfg.nome)}</strong><span>${esc(cfg.lema)}</span></div></div>
    <nav class="rodape-nav" aria-label="Rodapé">${nav}</nav>
    <p class="rodape-nota">Curadoria e textos de ${esc(cfg.autor)}. Cada reportagem cita a fonte original, com link; os números valem para o recorte de cada pesquisa. Os guias de campo são a visão do autor.</p>
    <p class="rodape-fim">© ${new Date().getFullYear()} ${esc(cfg.autor)} · ${esc(cfg.papel)}</p>
  </div>
</footer>
<script src="${raiz}assets/js/site.js" defer></script>${scripts.map(sc => `\n<script src="${raiz}${sc}" defer></script>`).join('')}
</body>
</html>`;
}

// ---------- peças ----------
const chipTema = p => `<span class="chip chip--tema">${icone(tema(p).ic)}${esc(tema(p).nome)}</span>`;
const fonteCurta = p => String(p.fonte_nome || '').split(/[,(|]/)[0].trim();
const fonteLinha = p => p.fonte_nome ? `<span class="fonte">${esc(fonteCurta(p))}${p.fonte_data ? ' · ' + esc(data(p.fonte_data).curta) : ''}</span>` : `<span class="fonte">${esc(TIPOS[p.tipo] || '')}</span>`;

// chamada do cartão: a primeira frase do resumo, inteira
const chamada = r => { const m = /^(.{40,190}?[.!?])(\s|$)/.exec(r); return m ? m[1] : r.length > 190 ? r.slice(0, 188).replace(/\s+\S*$/, '') + '…' : r; };
export function cartao(p, raiz, o = {}) {
  return `<article class="cartao revela${o.cls ? ' ' + o.cls : ''}" data-tema="${esc(p.tema)}" data-busca="${esc((p.titulo + ' ' + p.resumo + ' ' + (p.fonte_nome || '') + ' ' + tema(p).nome + ' ' + (p.regiao || '')).toLowerCase())}">
  <a class="cartao-capa" href="${urlPost(raiz, p)}" tabindex="-1" aria-hidden="true">${capa(p.tema, p.slug)}</a>
  <div class="cartao-corpo">
    <div class="cartao-meta">${chipTema(p)}${p.regiao ? `<span class="regiao">${icone('pino')}${esc(p.regiao)}</span>` : ''}</div>
    <h3><a href="${urlPost(raiz, p)}">${esc(p.titulo)}</a></h3>
    <p>${esc(chamada(p.resumo))}</p>
    <div class="cartao-pe">${fonteLinha(p)}<span class="ler">${icone('relogio')}${p.min} min</span></div>
  </div>
</article>`;
}
export const titSecao = (id, olho, tit, sub, extra = '') => `<header class="sec-cab revela">
  <div><span class="olho">${olho}</span><h2 id="${id}-t">${tit}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${extra}</header>`;

// ---------- início ----------
export function inicio({ cfg, posts, eventos, videos, perfil, home, lab = '', estante }) {
  const raiz = '';
  const capaP = posts.find(p => p.slug === cfg.edicao.capa) || posts[0];
  const reportagens = posts.filter(p => p.tipo === 'reportagem');
  const destaques = (home.destaques || []).map(s => posts.find(p => p.slug === s)).filter(Boolean).slice(0, 3);
  const guias = posts.filter(p => p.tipo === 'guia');
  const usados = new Set(reportagens.map(p => p.tema));
  const temasRadar = Object.keys(TEMAS).filter(k => usados.has(k));
  const ticker = reportagens.slice(0, 12).map(p => `<a href="${urlPost(raiz, p)}"><b>${esc(p.olho || tema(p).nome)}</b>${esc(p.titulo)}</a>`).join('');

  // organizações de origem: conta pela primeira palavra do nome, para "PwC", "PwC US" e "PwC Brasil" valerem uma só
  const fontes = new Set(reportagens.map(p => fonteCurta(p).split(/[\s|]/)[0].replace(/^Boston$/, 'BCG').replace(/^Agência$/, 'Câmara').toLowerCase()).filter(Boolean));
  const rotulos = [['ia', 3, 13], ['carve-out', 73, 5], ['governanca-ti', 80, 47], ['transformacao', 63, 88], ['due-diligence', 2, 79], ['adocao', -3, 45]].filter(([k]) => posts.some(p => p.tema === k));
  const abertura = `<section class="abertura" aria-labelledby="ab-t">
  <div class="abertura-in">
    <div class="abertura-txt">
      <span class="selo revela">${esc(cfg.edicao.rotulo)} <i></i> ${esc(cfg.edicao.periodo)}</span>
      <h1 id="ab-t" class="mega"><span class="mega-l"><span>O mundo da</span></span><span class="mega-l"><span><em>gestão da mudança</em>,</span></span><span class="mega-l"><span>em movimento.</span></span></h1>
      <p class="abertura-lead revela">${esc(cfg.descricao)}</p>
      <div class="abertura-acoes revela"><a class="btn btn--p" href="#capa">Ver a capa da semana${icone('seta')}</a><a class="btn btn--s" href="#radar">Abrir o radar</a></div>
      <dl class="abertura-fatos revela"><div><dt data-conta="${reportagens.length}">${reportagens.length}</dt><dd>reportagens com fonte</dd></div><div><dt data-conta="${fontes.size}">${fontes.size}</dt><dd>organizações de origem</dd></div><div><dt data-conta="${guias.length}">${guias.length}</dt><dd>guias de campo</dd></div></dl>
    </div>
    <div class="abertura-globo" data-paralaxe>
      ${globo()}
      ${rotulos.map(([k, x, y], i) => `<a class="g-rotulo" style="--x:${x}%;--y:${y}%;--i:${i}" ${usados.has(k) ? `href="#radar" data-filtrar="${k}"` : 'href="#capa"'}><i></i>${esc(TEMAS[k].nome)}</a>`).join('')}
    </div>
  </div>
  <div class="ticker" aria-label="Manchetes do radar"><span class="ticker-rot"><i></i>Radar</span><div class="ticker-faixa"><div class="ticker-trilho">${ticker}${ticker}</div></div></div>
</section>`;

  const blocoCapa = `<section class="sec sec--capa" id="capa" aria-labelledby="capa-t">
  <div class="sec-in">
    <div class="capa-grade">
      <article class="capa-principal revela">
        <div class="capa-midia">${capaP.video ? `<video controls preload="none" playsinline poster="${raiz}${esc(capaP.poster)}"><source src="${raiz}${esc(capaP.video)}" type="video/mp4"></video>` : capa(capaP.tema, capaP.slug)}</div>
        <div class="capa-txt">
          <span class="chip chip--capa">${icone('faisca')}Capa da semana</span>
          <h2 id="capa-t"><a href="${urlPost(raiz, capaP)}">${esc(capaP.titulo)}</a></h2>
          <p>${esc(capaP.resumo)}</p>
          <div class="capa-pe"><a class="btn btn--p" href="${urlPost(raiz, capaP)}">Ler a matéria de capa${icone('seta')}</a><span class="ler">${icone('relogio')}${capaP.min} min · ${esc(data(capaP.data).longa)}</span></div>
        </div>
      </article>
      <div class="capa-lado">
        <h3 class="lado-tit revela">Também nesta edição</h3>
        ${destaques.map((p, i) => `<article class="lado-item revela" style="--i:${i + 1}"><a class="lado-capa" href="${urlPost(raiz, p)}" tabindex="-1" aria-hidden="true">${capa(p.tema, p.slug)}</a><div>${chipTema(p)}<h4><a href="${urlPost(raiz, p)}">${esc(p.titulo)}</a></h4>${fonteLinha(p)}</div></article>`).join('')}
      </div>
    </div>
  </div>
</section>`;

  const atalhos = `<section class="sec sec--atalhos" aria-label="Temas">
  <div class="sec-in"><div class="atalhos">
    ${Object.entries(TEMAS).filter(([k]) => posts.some(p => p.tema === k)).map(([k, t], i) => `<a class="atalho revela" style="--i:${i}" ${usados.has(k) ? `href="#radar" data-filtrar="${k}"` : 'href="#capa"'}><span class="atalho-ic">${icone(t.ic)}</span><span><b>${esc(t.nome)}</b><small>${esc(t.frase)}</small></span><em>${usados.has(k) ? reportagens.filter(p => p.tema === k).length : 'capa'}</em></a>`).join('')}
  </div></div>
</section>`;

  const radar = `<section class="sec sec--radar" id="radar" aria-labelledby="radar-t">
  <div class="sec-in">
    ${titSecao('radar', 'Radar mundial', 'O que está acontecendo em Change Management', 'Pesquisas, normas e movimentos do mercado, com a fonte original em cada reportagem.')}
    <div class="filtros revela" role="group" aria-label="Filtrar reportagens">
      <div class="chips" data-chips><button type="button" class="filtro ativo" data-tema="">Tudo <i>${reportagens.length}</i></button>${temasRadar.map(k => `<button type="button" class="filtro" data-tema="${k}">${icone(TEMAS[k].ic)}${esc(TEMAS[k].nome)} <i>${reportagens.filter(p => p.tema === k).length}</i></button>`).join('')}</div>
      <label class="busca">${icone('busca')}<span class="vis-oculto">Buscar no radar</span><input type="search" placeholder="Buscar: IA, Prosci, carve-out…" data-busca-campo autocomplete="off"></label>
    </div>
    <div class="grade grade--radar" data-grade>${reportagens.map(p => cartao(p, raiz)).join('\n')}</div>
    <p class="vazio" data-vazio hidden>Nada no radar com esse filtro. Tente outro tema ou outra palavra.</p>
    <div class="mais"><button class="btn btn--s" type="button" data-mais>Mostrar mais reportagens${icone('setaBaixo')}</button></div>
  </div>
</section>`;

  const stats = (home.numeros || []).map((n, i) => { const p = posts.find(x => x.slug === n.slug); return `<a class="num revela" style="--i:${i}" href="${p ? urlPost(raiz, p) : '#radar'}"><strong data-conta="${esc(n.valor)}">${esc(n.valor)}</strong><span>${esc(n.descricao)}</span><small>${esc(n.fonte)}${icone('setaFora')}</small></a>`; }).join('');
  const praticas = (home.praticas || []).map(s => posts.find(p => p.slug === s)).filter(Boolean);
  const ia = `<section class="sec sec--ia" id="ia" aria-labelledby="ia-t">
  <div class="sec-in">
    <div class="ia-cab">
      ${titSecao('ia', 'IA & Mudança', 'A IA não se adota sozinha', 'O que as pesquisas mais recentes dizem sobre adoção de IA, e como quem faz gestão da mudança já usa IA no próprio trabalho.')}
      <div class="ia-arte revela" aria-hidden="true">${capa('ia', 'secao-ia', { variante: 'b' })}</div>
    </div>
    <div class="nums">${stats}</div>
    ${praticas.length ? `<h3 class="sub revela">Para quem conduz a adoção de IA</h3><div class="praticas">${praticas.map((p, i) => `<a class="pratica revela" style="--i:${i}" href="${urlPost(raiz, p)}"><span class="pratica-n">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(p.titulo)}</b><small>${esc(fonteCurta(p))}</small></span>${icone('seta')}</a>`).join('')}</div>` : ''}
  </div>
</section>`;

  const blocoGuias = `<section class="sec sec--guias" id="guias" aria-labelledby="guias-t">
  <div class="sec-in">
    ${titSecao('guias', 'Guias de campo', 'Como fazer Change Management em…', 'Quatro contextos em que a gestão da mudança muda de forma. Um guia direto para cada um.')}
    <div class="guias">${guias.map((p, i) => `<article class="guia revela" style="--i:${i}">
      <a class="guia-capa" href="${urlPost(raiz, p)}" tabindex="-1" aria-hidden="true">${capa(p.tema, p.slug, { variante: ['a', 'b', 'c', 'a'][i % 4] })}</a>
      <div class="guia-corpo"><span class="guia-n">${String(i + 1).padStart(2, '0')}</span><h3><a href="${urlPost(raiz, p)}">${esc(p.titulo)}</a></h3><p>${esc(p.resumo)}</p>
      <ul>${(p.passos || []).slice(0, 3).map(s => `<li>${icone('check')}${esc(s)}</li>`).join('')}</ul>
      <a class="link-seta" href="${urlPost(raiz, p)}">Abrir o guia${icone('seta')}</a></div></article>`).join('')}</div>
  </div>
</section>`;

  const proprios = videos.filter(v => v.arquivo), externos = videos.filter(v => !v.arquivo);
  const blocoVideos = `<section class="sec sec--videos" id="videos" aria-labelledby="videos-t">
  <div class="sec-in">
    ${titSecao('videos', 'Vídeos', 'Para ver e mostrar ao time', 'Os vídeos do blog e uma seleção do que vale assistir sobre mudança e IA.')}
    <div class="videos">
      <div class="video-destaque revela">${proprios.slice(0, 1).map(v => `<div class="video-quadro"><video controls preload="none" playsinline poster="${raiz}${esc(v.poster)}"><source src="${raiz}${esc(v.arquivo)}" type="video/mp4"></video></div><div class="video-info"><span class="chip chip--capa">${icone('video')}Do blog</span><h3>${esc(v.titulo)}</h3><p>${esc(v.resumo)}</p>${v.post ? `<a class="link-seta" href="${raiz}posts/${esc(v.post)}/">Ler a matéria de capa${icone('seta')}</a>` : ''}</div>`).join('')}</div>
      <div class="video-lista">${externos.map((v, i) => `<a class="video-item revela" style="--i:${i}" href="${esc(v.url)}" target="_blank" rel="noopener"><span class="video-play">${icone('play')}</span><span><b>${esc(v.titulo)}</b><small>${esc(String(v.canal).split(/[,(|]/)[0].trim())}${v.data ? ' · ' + esc(data(v.data).curta) : ''}</small><em>${esc(v.resumo)}</em></span>${icone('setaFora')}</a>`).join('')}${externos.length ? '' : '<p class="nota revela">A seleção de vídeos externos entra nas próximas edições.</p>'}</div>
    </div>
  </div>
</section>`;

  const blocoEventos = `<section class="sec sec--eventos" id="eventos" aria-labelledby="eventos-t">
  <div class="sec-in">
    ${titSecao('eventos', 'Eventos', 'Na agenda', 'Conferências e webinars de gestão da mudança, governança e confiança digital. A agenda cresce a cada edição.')}
    <div class="eventos">${eventos.map((e, i) => { const d = data(e.inicio); return `<a class="evento revela" style="--i:${i}" href="${esc(e.url)}" target="_blank" rel="noopener">
      <span class="evento-data"><b>${d.dia ?? ''}</b><i>${esc(d.mes3 || '')}</i><small>${d.ano || ''}</small></span>
      <span class="evento-txt"><b>${esc(e.titulo)}</b><em><span>${icone('agenda')}${esc(e.quando)}</span><span>${icone('pino')}${esc(e.local)}</span></em><small>${esc(e.resumo)}</small></span>${icone('setaFora')}</a>`; }).join('')}
      <div class="evento evento--vago revela"><span class="evento-data">${icone('agenda')}</span><span class="evento-txt"><b>Conhece um evento que deveria estar aqui?</b><small>A agenda está em construção e ganha novos eventos a cada edição.${cfg.linkedin ? ` <a href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">Indique pelo LinkedIn</a>.` : ''}</small></span></div>
    </div>
  </div>
</section>`;

  const porMes = {};
  for (const p of posts) { const k = p.data.slice(0, 7); (porMes[k] = porMes[k] || []).push(p); }
  const meses = Object.keys(porMes).sort().reverse();
  const blocoMes = `<section class="sec sec--mes" id="mes" aria-labelledby="mes-t">
  <div class="sec-in">
    ${titSecao('mes', 'Posts do mês', 'Tudo o que saiu', 'A lista enxuta, para achar rápido e compartilhar.')}
    <div class="abas revela" role="tablist" aria-label="Meses">${meses.map((m, i) => `<button role="tab" type="button" id="aba-${m}" aria-controls="painel-${m}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-aba="${m}">${esc(data(m).mesNome)} <i>${data(m).ano}</i></button>`).join('')}</div>
    ${meses.map((m, i) => `<div class="painel" role="tabpanel" id="painel-${m}" aria-labelledby="aba-${m}"${i ? ' hidden' : ''}><ol class="lista-mes">${porMes[m].map((p, j) => `<li class="revela" style="--i:${Math.min(j, 8)}"><a href="${urlPost(raiz, p)}"><span class="lm-n">${String(j + 1).padStart(2, '0')}</span><span class="lm-t">${esc(p.titulo)}</span><span class="lm-m">${esc(tema(p).nome)} · ${esc(TIPOS[p.tipo] || '')}</span>${icone('seta')}</a></li>`).join('')}</ol><a class="link-seta revela" href="mes/${m}/">Abrir a página de ${esc(data(m).mesNome)}${icone('seta')}</a></div>`).join('')}
  </div>
</section>`;

  const blocoEstante = estante && estante.itens.length ? `<section class="sec sec--estante" id="estante" aria-labelledby="estante-t">
  <div class="sec-in">
    ${titSecao('estante', 'Sugestões', esc(estante.titulo), esc(estante.nota))}
    <ol class="estante">${estante.itens.map((b, i) => `<li class="livro revela" style="--i:${Math.min(i, 7)}"><span class="livro-n">${String(i + 1).padStart(2, '0')}</span><span class="livro-txt"><small>${esc(b.tipo)}</small><b>${esc(b.titulo)}</b><i>${esc(b.autor)}</i><em>${esc(b.porque)}</em></span></li>`).join('')}</ol>
  </div>
</section>` : '';
  const sobre = `<section class="sec sec--sobre" id="sobre" aria-labelledby="sobre-t">
  <div class="sec-in">
    <div class="sobre">
      <div class="sobre-foto revela" aria-hidden="true"><div class="monograma"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" class="mono-anel"/><circle cx="100" cy="100" r="82" class="mono-anel mono-anel--b"/><circle cx="100" cy="4" r="5" class="mono-ponto"/></svg><span>${esc(perfil.iniciais)}</span></div></div>
      <div class="sobre-txt">
        <span class="olho revela">Quem escreve</span>
        <h2 id="sobre-t" class="revela">${esc(perfil.nome)}</h2>
        <p class="sobre-papel revela">${esc(perfil.papel)}</p>
        ${perfil.bio.map(b => `<p class="revela">${esc(b)}</p>`).join('')}
        <div class="sobre-cols">
          <div class="revela"><h3>${icone('coracao')}O que eu gosto</h3><ul class="gostos">${perfil.gosto.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div>
          <div class="revela"><h3>${icone('lampada')}Fun fact</h3><p class="fato">${esc(perfil.fun_fact)}</p></div>
        </div>
        ${cfg.linkedin ? `<a class="btn btn--p revela" href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}Seguir no LinkedIn</a>` : ''}
      </div>
    </div>
  </div>
</section>`;

  return pagina({ cfg, raiz, titulo: '', descricao: cfg.descricao, corpo: abertura + blocoCapa + atalhos + radar + ia + blocoGuias + lab + blocoVideos + blocoEventos + blocoMes + blocoEstante + sobre, caminho: '', imagem: 'assets/img/og/inicio.jpg', classe: 'pg-inicio' });
}

// ---------- página de post ----------
export function post({ cfg, p, posts }) {
  const raiz = '../../';
  const t = tema(p), d = data(p.data);
  const dados = (p.dados || []).map(l => l.split('|').map(s => s.trim()));
  const relacionados = posts.filter(x => x.slug !== p.slug && x.tema === p.tema).slice(0, 3);
  const juntos = (p.relacionados || []).map(sl => posts.find(x => x.slug === sl)).filter(Boolean);
  const outros = relacionados.length < 3 ? posts.filter(x => x.slug !== p.slug && x.tema !== p.tema && x.tipo !== 'capa').slice(0, 3 - relacionados.length) : [];
  const corpo = `<article class="artigo">
  <header class="art-cab${p.video ? ' art-cab--video' : ''}">
    <div class="art-cab-in">
      <div class="art-cab-txt">
        <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<a href="${raiz}index.html#${p.tipo === 'guia' ? 'guias' : 'radar'}">${esc(p.tipo === 'guia' ? 'Guias de campo' : 'Radar')}</a>${icone('seta')}<span>${esc(t.nome)}</span></nav>
        <div class="art-meta"><span class="chip chip--capa">${icone(p.tipo === 'guia' ? 'livro' : p.tipo === 'capa' ? 'faisca' : 'globo')}${esc(TIPOS[p.tipo] || 'Reportagem')}</span>${chipTema(p)}${p.regiao ? `<span class="regiao">${icone('pino')}${esc(p.regiao)}</span>` : ''}</div>
        <h1>${esc(p.titulo)}</h1>
        <p class="art-lead">${esc(p.resumo)}</p>
        <div class="art-assina"><span class="monograma monograma--p"><span>VV</span></span><span><b>${esc(cfg.autor)}</b><small>${esc(d.longa)} · ${p.min} min de leitura</small></span></div>
      </div>
      ${p.video ? '' : `<div class="art-arte">${capa(p.tema, p.slug)}</div>`}
    </div>
    ${p.video ? `<div class="art-capa"><video controls preload="none" playsinline poster="${raiz}${esc(p.poster)}"><source src="${raiz}${esc(p.video)}" type="video/mp4"></video></div>` : ''}
  </header>
  <div class="art-grade">
    <div class="art-corpo prosa">
      ${p.html}
      ${juntos.length ? `<aside class="juntos"><h2>${icone('lista')}Para ler junto</h2><ul>${juntos.map(x => `<li><a href="${urlPost(raiz, x)}">${esc(x.titulo)}</a><span>${esc(fonteCurta(x))}</span></li>`).join('')}</ul></aside>` : ''}
      ${p.por_que_importa ? `<aside class="importa"><h2>${icone('lampada')}Por que importa para quem faz gestão da mudança</h2><p>${esc(p.por_que_importa)}</p></aside>` : ''}
      ${p.fonte_url ? `<aside class="fonte-caixa"><h2>${icone('link')}Fonte</h2><p><a href="${esc(p.fonte_url)}" target="_blank" rel="noopener">${esc(p.fonte_nome)}${icone('setaFora')}</a>${p.fonte_data ? `<span>Publicado em ${esc(data(p.fonte_data).longa)}</span>` : p.fonte_nota ? `<span>${esc(p.fonte_nota[0].toUpperCase() + p.fonte_nota.slice(1))}</span>` : ''}${p.fonte_tipo ? `<span>Fonte ${esc(p.fonte_tipo)}</span>` : ''}${p.verificacao ? `<span>Conferência: ${esc(p.verificacao)}</span>` : ''}</p><small>Texto original do blog a partir da fonte citada. Os números valem para o recorte da pesquisa; confira o material completo antes de usar em decisão.</small></aside>` : ''}
    </div>
    <aside class="art-lado">
      ${dados.length ? `<div class="lado-caixa"><h2>Em números</h2>${dados.map(([v, desc]) => `<div class="dado"><strong${v.length > 9 ? ' class="dado-longo"' : ''}>${esc(v)}</strong><span>${esc(desc || '')}</span></div>`).join('')}</div>` : ''}
      ${(p.passos || []).length ? `<div class="lado-caixa"><h2>Em resumo</h2><ul class="lado-lista">${p.passos.map(s => `<li>${icone('check')}${esc(s)}</li>`).join('')}</ul></div>` : ''}
      <div class="lado-caixa lado-caixa--acoes"><h2>Compartilhar</h2><a class="btn btn--p" data-linkedin href="https://www.linkedin.com/sharing/share-offsite/?url=" target="_blank" rel="noopener">${icone('linkedin')}Postar no LinkedIn</a><button class="btn btn--s" type="button" data-copiar>${icone('copia')}<span>Copiar link</span></button></div>
    </aside>
  </div>
</article>
<section class="sec sec--rel" aria-labelledby="rel-t"><div class="sec-in">
  <header class="sec-cab"><div><span class="olho">Continue no radar</span><h2 id="rel-t">Mais sobre ${esc(t.nome)}</h2></div><a class="link-seta" href="${raiz}index.html#radar">Ver tudo${icone('seta')}</a></header>
  <div class="grade grade--rel">${[...relacionados, ...outros].map(x => cartao(x, raiz)).join('\n')}</div>
</div></section>`;
  return pagina({ cfg, raiz, titulo: p.titulo, descricao: p.resumo, corpo, caminho: `posts/${p.slug}/`, imagem: `assets/img/og/${p.slug}.jpg`, tipo: 'article', classe: 'pg-post', artigo: { data: p.data, secao: t.nome } });
}

// ---------- posts do mês (página minimalista) ----------
export function mes({ cfg, chave, lista }) {
  const raiz = '../../', d = data(chave);
  const corpo = `<section class="sec sec--arquivo"><div class="sec-in sec-in--estreita">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<span>Posts do mês</span></nav>
  <h1 class="arq-tit">${esc(d.mesNome)} <i>${d.ano}</i></h1>
  <p class="arq-sub">${lista.length} ${lista.length === 1 ? 'post' : 'posts'} · ${esc(cfg.nome)}</p>
  <ol class="lista-mes lista-mes--pg">${lista.map((p, j) => `<li><a href="${urlPost(raiz, p)}"><span class="lm-n">${String(j + 1).padStart(2, '0')}</span><span class="lm-t">${esc(p.titulo)}<small>${esc(p.resumo)}</small></span><span class="lm-m">${esc(tema(p).nome)} · ${esc(TIPOS[p.tipo] || '')}</span>${icone('seta')}</a></li>`).join('')}</ol>
</div></section>`;
  return pagina({ cfg, raiz, titulo: `Posts de ${d.mesNome} de ${d.ano}`, descricao: `Todos os posts de ${d.mesNome} de ${d.ano} no ${cfg.nome}.`, corpo, caminho: `mes/${chave}/`, imagem: 'assets/img/og/inicio.jpg', classe: 'pg-arquivo' });
}

export function naoAchou({ cfg }) {
  const corpo = `<section class="sec sec--arquivo"><div class="sec-in sec-in--estreita erro"><div class="erro-arte">${capa('mundo', '404', { variante: 'a' })}</div><h1 class="arq-tit">Essa página mudou de lugar</h1><p class="arq-sub">Acontece nas melhores transformações. O radar continua no início.</p><a class="btn btn--p" href="index.html">Voltar ao início</a></div></section>`;
  return pagina({ cfg, raiz: '', titulo: 'Página não encontrada', corpo, caminho: '404.html', classe: 'pg-arquivo' });
}
// cartão de imagem para o LinkedIn (1200 x 627): renderizado por og.mjs
export function cartaoOG({ cfg, p }) {
  const t = p ? tema(p) : null;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><link rel="stylesheet" href="../assets/css/site.css"><style>html,body{margin:0;width:1200px;height:627px;overflow:hidden}</style></head>
<body><div class="og">
  <div class="og-arte">${p && p.arte ? p.arte : p ? capa(p.tema, p.slug, { variante: 'a' }) : `<div class="og-globo">${globo()}</div>`}</div>
  <div class="og-txt"><div class="og-marca">${marca()}<span>Change Management <i>World</i></span></div>
    <div><span class="og-chip">${esc(p ? (p.tipo === 'lab' ? 'Laboratório' : p.tipo === 'guia' ? 'Guia de campo' : p.tipo === 'capa' ? 'Capa da semana' : t.nome) : cfg.edicao.rotulo)}</span><h1 class="${p && p.titulo.length > 70 ? 'og-menor' : ''}">${esc(p ? p.titulo : cfg.lema)}</h1></div>
    <p>${esc(cfg.autor)} · ${esc(cfg.papel)}</p></div>
</div></body></html>`;
}
