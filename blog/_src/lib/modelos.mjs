// Modelos de página do blog. Cada função recebe os dados já carregados e devolve HTML.
import { esc, markdown, minutos, data } from './md.mjs';
import { icone, marca, iceberg, CENA, capa } from './ilustra.mjs';

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
export function pagina({ cfg, raiz, titulo, descricao, corpo, caminho = '', imagem, tipo = 'website', classe = '', artigo, scripts = [], ativo = '', attrs = '' }) {
  const tituloCompleto = titulo ? `${titulo} · ${cfg.nome}` : `${cfg.nome} · ${cfg.lema}`;
  const abs = cfg.url ? cfg.url.replace(/\/$/, '') + '/' + caminho : '';
  const og = imagem ? (cfg.url ? cfg.url.replace(/\/$/, '') + '/' + imagem : raiz + imagem) : '';
  const mesAtual = cfg.mesAtual ? `mes/${cfg.mesAtual}/` : '#radar';
  const TUDO = [['radar/', 'Radar', 'Radar mundial', 'Notícias e pesquisas, com a fonte'], ['#ia', 'IA & Mudança', 'IA & Mudança', 'O que as pesquisas dizem'], ['#guias', 'Guias', 'Guias de campo', 'Carve-out, due diligence, transformação e TI'], ['lab/', 'Laboratório', 'Laboratório', 'Diagnóstico e ferramentas para montar'], ['modelos/', 'Modelos', 'Modelos para baixar', 'PowerPoint e Excel prontos para usar'], ['#agenda', 'Agenda', 'Agenda e vídeos', 'Eventos e o que vale assistir'], [mesAtual, 'Posts do mês', 'Posts do mês', 'Tudo o que saiu'], ['#estante', 'Sugestões', 'Sugestões', 'O que eu leio e recomendo'], ['#sobre', 'Sobre', 'Quem escreve', esc(cfg.autor)]];
  const href = h => h[0] === '#' ? `${raiz ? raiz + 'index.html' : ''}${h}` : `${raiz}${h}`;
  const aqui = h => (h === 'lab/' && ativo === 'lab') || (h === 'modelos/' && ativo === 'modelos') || (h === 'radar/' && ativo === 'radar') ? ' class="aqui" aria-current="page"' : '';
  const NO_TOPO = ['radar/', '#ia', '#guias', 'lab/', 'modelos/', '#sobre'];
  const nav = TUDO.filter(([h]) => NO_TOPO.includes(h)).map(([h, t]) => `<a href="${href(h)}"${aqui(h)}>${t}</a>`).join('');
  const navRodape = TUDO.map(([h, t]) => `<a href="${href(h)}">${t}</a>`).join('');
  const navMenu = TUDO.map(([h, , t, d], i) => `<a href="${href(h)}"${aqui(h)} style="--i:${i}"><span class="menu-n">${String(i + 1).padStart(2, '0')}</span><span class="menu-t">${t}</span><span class="menu-d">${d}</span>${icone('seta')}</a>`).join('');
  const cm = cfg.capaMenu;
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
<link rel="stylesheet" href="${raiz}assets/css/motion.css">
<link rel="stylesheet" href="${raiz}assets/css/ux.css">
<script>document.documentElement.classList.add('js')${caminho === '' ? ";try{if(!sessionStorage.getItem('cmw-vinheta')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('vinheta')}catch(e){}" : ''}</script>
</head>
<body class="${classe}"${attrs}>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo" data-topo>
  <div class="topo-in">
    <a class="logo" href="${raiz}index.html" aria-label="${esc(cfg.nome)}: início">${marca()}<span class="logo-txt">Change Management <i>World</i></span><span class="logo-curto">CM <i>World</i></span></a>
    <nav class="nav" aria-label="Seções" data-nav>${nav}</nav>
    <div class="topo-acoes">
      <a class="btn-ic" href="${raiz}radar/" data-abrir-busca aria-label="Buscar no site" data-dica="Buscar · Ctrl K">${icone('busca')}</a>
      <button class="btn-ic so-js" type="button" data-abrir-lista aria-haspopup="dialog" aria-label="Para ler depois" data-dica="Para ler depois">${icone('marcador')}<i class="conta" data-conta-salvos hidden></i></button>
      ${cfg.linkedin ? `<a class="btn btn--p btn--peq so-desk" href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}Seguir</a>` : ''}
      <a class="btn-menu" href="#rodape" role="button" data-menu aria-expanded="false" aria-controls="menu" aria-label="Abrir menu"><span class="btn-menu-rot">Menu</span><span class="btn-menu-ic" aria-hidden="true"><i></i><i></i></span></a>
    </div>
  </div>
</header>
<dialog class="menu" id="menu" aria-label="Menu do site">
  <div class="menu-in">
    <div class="menu-topo"><a class="logo logo--claro" href="${raiz}index.html" aria-label="${esc(cfg.nome)}: início">${marca()}<span>Change Management <i>World</i></span></a><button class="btn-menu btn-menu--x" type="button" data-menu-fechar aria-label="Fechar menu"><span class="btn-menu-rot">Fechar</span><span class="btn-menu-ic" aria-hidden="true"><i></i><i></i></span></button></div>
    <nav class="menu-links" aria-label="Todas as seções">${navMenu}</nav>
    <aside class="menu-lado">
      ${cm ? `<a class="menu-capa" href="${raiz}posts/${esc(cm.slug)}/"><small>${icone('faisca')}Capa da semana</small><b>${esc(cm.titulo)}</b><span class="link-seta">Ler agora${icone('seta')}</span></a>` : ''}
      <div class="menu-acoes"><button class="btn btn--vidro" type="button" data-abrir-busca>${icone('busca')}Buscar no site<kbd>Ctrl K</kbd></button>${cfg.linkedin ? `<a class="btn btn--claro" href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}Seguir no LinkedIn</a>` : ''}</div>
      <p class="menu-nota">${esc(cfg.lema)}.</p>
    </aside>
    <div class="menu-mar" aria-hidden="true"></div>
  </div>
</dialog>
<main id="conteudo">
${corpo}
</main>
<footer class="rodape" id="rodape">
  <div class="rodape-in">
    <div class="rodape-marca">${marca()}<div><strong>${esc(cfg.nome)}</strong><span>${esc(cfg.lema)}</span></div></div>
    <nav class="rodape-nav" aria-label="Rodapé">${navRodape}</nav>
    <p class="rodape-nota">Curadoria e textos de ${esc(cfg.autor)}. Cada reportagem cita a fonte original, com link; os números valem para o recorte de cada pesquisa. Os guias de campo são a visão do autor.</p>
    <p class="rodape-fim"><span>© ${new Date().getFullYear()} ${esc(cfg.autor)} · ${esc(cfg.papel)}</span><a class="rodape-topo" href="#conteudo">Voltar à superfície${icone('setaCima')}</a></p>
  </div>
</footer>
<script src="${raiz}assets/js/site.js" defer></script>
<script src="${raiz}assets/js/motion.js" defer></script>
<script src="${raiz}assets/js/dados.js" defer></script>
<script src="${raiz}assets/js/ux.js" defer></script>${scripts.map(sc => `\n<script src="${raiz}${sc}" defer></script>`).join('')}
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
  return `<article class="cartao revela${o.cls ? ' ' + o.cls : ''}" data-slug="${esc(p.slug)}" data-tema="${esc(p.tema)}" data-busca="${esc((p.titulo + ' ' + p.resumo + ' ' + (p.fonte_nome || '') + ' ' + tema(p).nome + ' ' + (p.regiao || '')).toLowerCase())}">
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

// régua de adoção da capa: sem JavaScript é uma lista; com JavaScript vira um controle de arrastar
const regua = (r, raiz) => !r ? '' : `<div class="regua revela" data-regua data-inicial="${r.inicial ?? 2}">
      <div class="regua-cab"><span class="olho">${esc(r.olho)}</span><h3>${esc(r.titulo)}</h3><p>${esc(r.nota)}</p></div>
      <div class="regua-corpo">
        <ol class="regua-lista">${r.marcas.map((m, i) => `<li data-nome="${esc(m.nome)}" data-estado="${esc(m.estado)}" data-acao="${esc(m.acao)}" data-como="${esc(m.como)}"><span class="regua-n">${i + 1}</span><b>${esc(m.nome)}</b><span>${esc(m.estado)}</span><strong>${esc(m.acao)}</strong><span>${esc(m.como)}</span></li>`).join('')}</ol>
      </div>
      <a class="link-seta" href="${raiz}lab/matriz-de-adocao/">Montar a matriz de adoção do seu projeto${icone('seta')}</a>
    </div>`;

// ---------- início ----------
export function inicio({ cfg, posts, eventos, videos, perfil, home, lab = '', estante }) {
  const raiz = '';
  const capaP = posts.find(p => p.slug === cfg.edicao.capa) || posts[0];
  const reportagens = posts.filter(p => p.tipo === 'reportagem');
  const guias = posts.filter(p => p.tipo === 'guia');
  const usados = new Set(reportagens.map(p => p.tema));
  const temasRadar = Object.keys(TEMAS).filter(k => usados.has(k));
  const ab = home.abertura || { titulo: ['Gestão da mudança,', '*além do raso*.'], lead: cfg.descricao }, ice = home.iceberg || { zonas: [], superficie: [], fundo: [] };
  const linhaTit = l => esc(l).replace(/\*(.+?)\*/g, '<em>$1</em>');
  const pct = (v, total) => (v / total * 100).toFixed(2) + '%';
  const pontos = (ice.fundo || []).map(h => ({ ...h, p: posts.find(p => p.slug === h.slug) })).filter(h => h.p);
  // radar da página inicial: os destaques da edição e as reportagens seguintes, sem repetir (o radar completo fica em radar/)
  const manchetes = [...(home.destaques || []).map(s => posts.find(p => p.slug === s)).filter(Boolean), ...reportagens].filter((p, i, a) => a.indexOf(p) === i).slice(0, home.radar_inicio || 6);

  const abertura = `<section class="abertura" aria-labelledby="ab-t">
  <div class="abertura-in">
    <div class="abertura-txt">
      <span class="selo revela">${esc(cfg.edicao.rotulo)} <i></i> ${esc(cfg.edicao.periodo)}</span>
      <h1 id="ab-t" class="mega">${ab.titulo.map(l => `<span class="mega-l"><span>${linhaTit(l)}</span></span>`).join('')}</h1>
      <p class="abertura-lead revela">${esc(ab.lead)}</p>
      <div class="abertura-acoes revela"><a class="btn btn--p" href="radar/">Mergulhar no radar${icone('seta')}</a><a class="btn btn--s btn--busca" href="radar/" data-abrir-busca>${icone('busca')}Buscar no blog<kbd>Ctrl K</kbd></a></div>
    </div>
    <div class="mergulho revela" data-mergulho data-zonas="${esc(JSON.stringify(ice.zonas || []))}">
      <div class="cena-janela" data-cursor="${esc(ice.dica || 'Arraste para mergulhar')}">
        <div class="cena-mundo">
          ${iceberg()}
          <ul class="cena-raso" aria-label="Na superfície: o que todo mundo vê">${(ice.superficie || []).map(s => `<li style="--x:${pct(s.x, CENA.L)};--y:${pct(s.y, CENA.A)}">${esc(s.t)}</li>`).join('')}</ul>
          <ul class="cena-fundo" aria-label="Abaixo da superfície: o que decide a mudança">${pontos.map((h, i) => `<li style="--x:${pct(h.x, CENA.L)};--y:${pct(h.y, CENA.A)};--i:${i}" class="${h.x > 300 ? 'ponto--e' : ''}"><a class="ponto" href="${urlPost(raiz, h.p)}" data-ler="${esc(h.p.slug)}"><i></i><span><b>${esc(h.t)}</b><small>${esc(h.p.titulo)}</small></span></a></li>`).join('')}</ul>
          ${ice.fim ? `<p class="cena-fim" style="--y:${pct(1385, CENA.A)}">${esc(ice.fim)}</p>` : ''}
        </div>
        <p class="cena-zona" data-zona aria-live="polite"><b>${esc((ice.zonas[0] || {}).nome || 'Superfície')}</b><span>${esc((ice.zonas[0] || {}).frase || '')}</span></p>
        <div class="sonda so-js" data-sonda><span class="sonda-trilho" aria-hidden="true"><i></i></span><button class="sonda-pega" type="button" role="slider" aria-orientation="vertical" aria-label="Profundidade do mergulho" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Superfície">${icone('setaBaixo')}</button><output class="sonda-m" aria-hidden="true">0 m</output></div>
        <button class="cena-botao so-js" type="button" data-mergulhar><span>Mergulhar</span>${icone('setaBaixo')}</button>
      </div>
    </div>
  </div>
</section>`;

  const blocoCapa = `<section class="sec sec--capa" id="capa" aria-labelledby="capa-t">
  <div class="sec-in">
    <article class="capa-principal revela">
      <div class="capa-midia">${capaP.video ? `<video controls preload="none" playsinline poster="${raiz}${esc(capaP.poster)}"><source src="${raiz}${esc(capaP.video)}" type="video/mp4"></video>` : capa(capaP.tema, capaP.slug)}</div>
      <div class="capa-txt">
        <span class="olho">Capa da semana</span>
        <h2 id="capa-t"><a href="${urlPost(raiz, capaP)}">${esc(capaP.titulo)}</a></h2>
        <p>${esc(capaP.resumo)}</p>
        <div class="capa-pe"><a class="btn btn--p" href="${urlPost(raiz, capaP)}">Ler a matéria de capa${icone('seta')}</a><span class="ler">${icone('relogio')}${capaP.min} min · ${esc(data(capaP.data).longa)}</span></div>
      </div>
    </article>
    ${regua(home.regua, raiz)}
  </div>
</section>`;

  const radar = `<section class="sec sec--radar" id="radar" aria-labelledby="radar-t">
  <div class="sec-in">
    ${titSecao('radar', 'Radar', 'O que está acontecendo em Change Management', '', `<a class="link-seta" href="radar/">Ver as ${reportagens.length} reportagens${icone('seta')}</a>`)}
    <ol class="manchetes">${manchetes.map((p, i) => `<li class="manchete revela" data-slug="${esc(p.slug)}" style="--i:${i}">
      <span class="manchete-n">${String(i + 1).padStart(2, '0')}</span>
      <div class="manchete-txt"><span class="manchete-meta">${esc(tema(p).nome)}${p.regiao ? ' · ' + esc(p.regiao) : ''}</span><h3><a href="${urlPost(raiz, p)}">${esc(p.titulo)}</a></h3><span class="manchete-pe">${esc(fonteCurta(p))} · ${p.min} min</span></div>
    </li>`).join('')}</ol>
    <p class="temas-linha revela"><span>Temas</span>${temasRadar.map(k => `<a href="radar/?tema=${k}">${esc(TEMAS[k].nome)}</a>`).join('')}</p>
  </div>
</section>`;

  const stats = (home.numeros || []).map((n, i) => { const p = posts.find(x => x.slug === n.slug); return `<a class="num revela" style="--i:${i}" href="${p ? urlPost(raiz, p) : 'radar/'}"><strong data-conta="${esc(n.valor)}">${esc(n.valor)}</strong><span>${esc(n.descricao)}</span><small>${esc(n.fonte)}${icone('setaFora')}</small></a>`; }).join('');
  const ia = `<section class="sec sec--ia" id="ia" aria-labelledby="ia-t">
  <div class="sec-in">
    ${titSecao('ia', 'IA & Mudança', 'A IA não se adota sozinha', 'O que as pesquisas mais recentes dizem sobre a adoção de IA nas organizações.', `<a class="link-seta" href="radar/?tema=ia">Ver as reportagens de IA${icone('seta')}</a>`)}
    <div class="nums">${stats}</div>
  </div>
</section>`;

  const nomeGuia = p => { const s = p.titulo.replace(/^Change Management em\s+/i, ''); return s[0].toUpperCase() + s.slice(1); };
  const blocoGuias = `<section class="sec sec--guias" id="guias" aria-labelledby="guias-t">
  <div class="sec-in">
    ${titSecao('guias', 'Guias de campo', 'Como fazer Change Management em…', 'Quatro contextos em que a gestão da mudança muda de forma.')}
    <div class="guias">${guias.map((p, i) => `<article class="guia revela" data-slug="${esc(p.slug)}" style="--i:${i}">
      <span class="guia-n">${String(i + 1).padStart(2, '0')}</span><h3><a href="${urlPost(raiz, p)}">${esc(nomeGuia(p))}</a></h3><p>${esc(p.resumo)}</p>
      <a class="link-seta" href="${urlPost(raiz, p)}">Abrir o guia${icone('seta')}</a></article>`).join('')}</div>
  </div>
</section>`;

  const externos = videos.filter(v => !v.arquivo);
  const agenda = `<section class="sec sec--agenda" id="agenda" aria-labelledby="agenda-t">
  <div class="sec-in">
    ${titSecao('agenda', 'Agenda e vídeos', 'Para acompanhar', '')}
    <div class="duas">
      <div class="revela"><h3 class="lista-tit">Na agenda</h3><ul class="linhas">${eventos.map(e => { const d = data(e.inicio); return `<li><a href="${esc(e.url)}" target="_blank" rel="noopener"><span class="linha-d">${d.dia ?? ''} ${esc(d.mes3 || '')} ${d.ano || ''}</span><b>${esc(e.titulo)}</b><small>${esc(e.local)}</small>${icone('setaFora')}</a></li>`; }).join('')}</ul></div>
      <div class="revela" style="--i:1"><h3 class="lista-tit">Para ver</h3><ul class="linhas">${externos.map(v => `<li><a href="${esc(v.url)}" target="_blank" rel="noopener"><span class="linha-d">${esc(String(v.canal).split(/[,(|]/)[0].trim())}</span><b>${esc(v.titulo)}</b><small>${v.data ? esc(data(v.data).curta) : ''}</small>${icone('setaFora')}</a></li>`).join('')}</ul></div>
    </div>
  </div>
</section>`;

  const blocoEstante = estante && estante.itens.length ? `<section class="sec sec--estante" id="estante" aria-labelledby="estante-t">
  <div class="sec-in">
    ${titSecao('estante', 'Sugestões', esc(estante.titulo), esc(estante.nota), `<div class="trilho-setas" data-trilho-setas="estante"><button type="button" data-trilho-ant aria-label="Livros anteriores">${icone('setaEsq')}</button><button type="button" data-trilho-prox aria-label="Próximos livros">${icone('seta')}</button></div>`)}
    <div class="prateleira revela">
      <ol class="estante" data-trilho="estante" data-cursor="Arraste">${estante.itens.map((b, i) => `<li class="livro" style="--v:${i % 4}"><button class="livro-obj" type="button" aria-expanded="false" aria-label="${esc(b.titulo)}, de ${esc(b.autor)}. Ver por que recomendo"><span class="livro-face livro-frente"><small>${esc(b.tipo)}</small><b${b.titulo.length > 34 ? ' class="livro-longo"' : ''}>${esc(b.titulo.split(':')[0])}</b><i>${esc(b.autor)}</i><span class="livro-n">${String(i + 1).padStart(2, '0')}</span></span><span class="livro-face livro-verso"><small>Por que recomendo</small><em>${esc(b.porque)}</em><i>${esc(b.titulo.split(':')[0])} · ${esc(b.autor)}</i></span></button></li>`).join('')}</ol>
      <p class="prateleira-dica">${icone('mao')}Arraste a prateleira e toque num livro para virar</p>
    </div>
  </div>
</section>` : '';

  const sobre = `<section class="sec sec--sobre" id="sobre" aria-labelledby="sobre-t">
  <div class="sec-in">
    <div class="sobre">
      <div class="sobre-foto revela"><div class="monograma${perfil.temFoto ? ' monograma--foto' : ''}"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" class="mono-anel"/><circle cx="100" cy="100" r="82" class="mono-anel mono-anel--b"/><circle cx="100" cy="4" r="5" class="mono-ponto"/></svg>${perfil.temFoto ? `<img src="${raiz}${esc(perfil.foto)}" alt="${esc(perfil.nome)}" width="400" height="400" loading="lazy" decoding="async">` : `<span aria-hidden="true">${esc(perfil.iniciais)}</span>`}</div></div>
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

  return pagina({ cfg, raiz, titulo: '', descricao: cfg.descricao, corpo: abertura + blocoCapa + radar + ia + blocoGuias + lab + agenda + blocoEstante + sobre, caminho: '', imagem: 'assets/img/og/inicio.jpg', classe: 'pg-inicio', scripts: ['assets/js/mergulho.js'] });
}

// ---------- radar completo (todas as reportagens, com filtro, busca e visão em grade ou lista) ----------
export function paginaRadar({ cfg, posts }) {
  const raiz = '../';
  const reportagens = posts.filter(p => p.tipo === 'reportagem');
  const usados = new Set(reportagens.map(p => p.tema));
  const temasRadar = Object.keys(TEMAS).filter(k => usados.has(k));
  const corpo = `<section class="sec sec--radar sec--radar-pg" id="radar" aria-labelledby="radar-t">
  <div class="sec-in">
    <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<span>Radar</span></nav>
    <header class="sec-cab"><div><span class="olho">Radar mundial</span><h1 id="radar-t">O que está acontecendo em Change Management</h1><p>Pesquisas, normas e movimentos do mercado, com a fonte original em cada reportagem.</p></div>${cfg.mesAtual ? `<a class="link-seta" href="${raiz}mes/${cfg.mesAtual}/">Posts do mês${icone('seta')}</a>` : ''}</header>
    <div class="filtros" role="group" aria-label="Filtrar reportagens">
      <div class="chips" data-chips><button type="button" class="filtro ativo" data-tema="">Tudo <i>${reportagens.length}</i></button>${temasRadar.map(k => `<button type="button" class="filtro" data-tema="${k}">${icone(TEMAS[k].ic)}${esc(TEMAS[k].nome)} <i>${reportagens.filter(p => p.tema === k).length}</i></button>`).join('')}</div>
      <label class="busca">${icone('busca')}<span class="vis-oculto">Buscar no radar</span><input type="search" placeholder="Buscar: IA, Prosci, carve-out…" data-busca-campo autocomplete="off"></label>
      <div class="visao" role="group" aria-label="Formato da lista"><button type="button" data-visao="grade" aria-pressed="true" aria-label="Ver em grade" data-dica="Grade">${icone('grade')}</button><button type="button" data-visao="lista" aria-pressed="false" aria-label="Ver em lista" data-dica="Lista">${icone('lista')}</button></div>
    </div>
    <div class="grade grade--radar" data-grade>${reportagens.map(p => cartao(p, raiz)).join('\n')}</div>
    <p class="vazio" data-vazio hidden>Nada no radar com esse filtro. Tente outro tema ou outra palavra.</p>
    <div class="mais"><button class="btn btn--s" type="button" data-mais>Mostrar mais reportagens${icone('setaBaixo')}</button></div>
  </div>
</section>`;
  return pagina({ cfg, raiz, titulo: 'Radar mundial', descricao: 'Todas as reportagens do blog sobre gestão da mudança, com filtro por tema, busca e a fonte original de cada uma.', corpo, caminho: 'radar/', imagem: 'assets/img/og/inicio.jpg', classe: 'pg-radar', ativo: 'radar' });
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
        <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<a href="${p.tipo === 'guia' ? raiz + 'index.html#guias' : raiz + 'radar/'}">${esc(p.tipo === 'guia' ? 'Guias de campo' : 'Radar')}</a>${icone('seta')}<span>${esc(t.nome)}</span></nav>
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
  <header class="sec-cab"><div><span class="olho">Continue no radar</span><h2 id="rel-t">Mais sobre ${esc(t.nome)}</h2></div><a class="link-seta" href="${raiz}radar/">Ver tudo${icone('seta')}</a></header>
  <div class="grade grade--rel">${[...relacionados, ...outros].map(x => cartao(x, raiz)).join('\n')}</div>
</div></section>`;
  return pagina({ cfg, raiz, titulo: p.titulo, descricao: p.resumo, corpo, caminho: `posts/${p.slug}/`, imagem: `assets/img/og/${p.slug}.jpg`, tipo: 'article', classe: 'pg-post', artigo: { data: p.data, secao: t.nome }, attrs: ` data-slug="${esc(p.slug)}" data-min="${p.min}"` });
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
  <div class="og-arte">${p && p.arte ? p.arte : p ? capa(p.tema, p.slug, { variante: 'a' }) : `<div class="og-gelo">${iceberg({ recorte: [60, 40, 440, 627], id: 'og' })}</div>`}</div>
  <div class="og-txt"><div class="og-marca">${marca()}<span>Change Management <i>World</i></span></div>
    <div><span class="og-chip">${esc(p ? (p.tipo === 'lab' ? 'Laboratório' : p.tipo === 'guia' ? 'Guia de campo' : p.tipo === 'capa' ? 'Capa da semana' : t.nome) : cfg.edicao.rotulo)}</span><h1 class="${p && p.titulo.length > 70 ? 'og-menor' : ''}">${esc(p ? p.titulo : cfg.lema)}</h1></div>
    <p>${esc(cfg.autor)} · ${esc(cfg.papel)}</p></div>
</div></body></html>`;
}
