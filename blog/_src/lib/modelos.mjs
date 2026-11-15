// Modelos de página do blog. Cada função recebe os dados já carregados e devolve HTML.
import { esc, markdown, minutos, data } from './md.mjs';
import { icone, marca, iceberg, CENA, capa } from './ilustra.mjs';
import { iconeVivo } from './vivo.mjs';

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

// texto com quebras: cada linha do conteúdo (separada por \n) vira uma frase em bloco
export const frases = t => String(t || '').split('\n').map(l => `<span class="frase">${esc(l)}</span>`).join('');
export const corrido = t => String(t || '').replace(/\s*\n\s*/g, ' ');

// ---------- contato (site.config.json › contato) ----------
export const contato = cfg => {
  const c = cfg.contato || {}, n = String(c.numero || '').replace(/\D/g, '');
  return { tel: c.telefone || '', hrefTel: n ? `tel:+${n}` : '', zap: c.whatsapp && n ? `https://wa.me/${n}${c.mensagem ? '?text=' + encodeURIComponent(c.mensagem) : ''}` : '' };
};
// botões de contato: WhatsApp (ou telefone) e LinkedIn
export const botoesContato = (cfg, { principal = 'btn--p', apoio = 'btn--s', telefone = false } = {}) => {
  const ct = contato(cfg);
  return [
    ct.zap ? `<a class="btn ${principal}" href="${esc(ct.zap)}" target="_blank" rel="noopener">${icone('conversa')}Chamar no WhatsApp</a>` : '',
    ct.tel && (telefone || !ct.zap) ? `<a class="btn ${ct.zap ? apoio : principal}" href="${esc(ct.hrefTel)}">${icone('telefone')}${esc(ct.tel)}</a>` : '',
    cfg.linkedin ? `<a class="btn ${ct.zap || ct.tel ? apoio : principal}" href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}LinkedIn</a>` : '',
  ].join('');
};

// ---------- esqueleto ----------
export function pagina({ cfg, raiz, titulo, descricao, corpo, caminho = '', imagem, tipo = 'website', classe = '', artigo, scripts = [], estilos = [], ativo = '', attrs = '' }) {
  const tituloCompleto = titulo ? `${titulo} · ${cfg.nome}` : `${cfg.nome} · ${cfg.lema}`;
  const abs = cfg.url ? cfg.url.replace(/\/$/, '') + '/' + caminho : '';
  const og = imagem ? (cfg.url ? cfg.url.replace(/\/$/, '') + '/' + imagem : raiz + imagem) : '';
  const mesAtual = cfg.mesAtual ? `mes/${cfg.mesAtual}/` : 'radar/';
  // quatro abas no topo; os atalhos ficam no menu e no rodapé
  const ABAS = [['radar/', 'Radar', 'Notícias, pesquisas e guias de campo, com a fonte'], ['lab/', 'Laboratório', 'Diagnóstico, ferramentas e modelos para baixar'], ['servicos/', 'Serviços', 'Change Management Advisory e IA aplicada'], ['sobre/', 'Sobre', `Quem é ${esc(cfg.autor)} e o que ele recomenda`]];
  const ATALHOS = [['radar/#guias', 'Guias de campo'], ['radar/?tema=ia', 'IA & Mudança'], ['radar/#agenda', 'Agenda e vídeos'], [mesAtual, 'Posts do mês'], ['apresentacoes/', 'Apresentações em HTML'], ['modelos/', 'Modelos para baixar'], ['sobre/#estante', 'Sugestões de leitura']];
  const GRUPO = { radar: 'radar/', lab: 'lab/', modelos: 'lab/', servicos: 'servicos/', sobre: 'sobre/' };
  const href = h => `${raiz}${h}`;
  const aqui = h => GRUPO[ativo] === h ? ` class="aqui" aria-current="${ativo === 'modelos' ? 'true' : 'page'}"` : '';
  const nav = ABAS.map(([h, t]) => `<a href="${href(h)}"${aqui(h)}>${t}</a>`).join('');
  // rodapé: os mesmos destinos, agrupados pelas quatro abas (o título de cada coluna leva à aba)
  const RODAPE = [
    ['radar/', 'Radar', [['radar/', 'Reportagens'], ['radar/#guias', 'Guias de campo'], ['radar/?tema=ia', 'IA & Mudança'], ['radar/#agenda', 'Agenda e vídeos'], [mesAtual, 'Posts do mês']]],
    ['lab/', 'Laboratório', [['lab/diagnostico/', 'Diagnóstico de nível'], ['lab/', 'Ferramentas para montar'], ['apresentacoes/', 'Apresentações em HTML'], ['modelos/', 'Modelos para baixar']]],
    ['servicos/', 'Serviços', [['servicos/#servicos', 'O que eu faço'], ['servicos/#fluxos', 'Fluxos por tipo de projeto'], ['servicos/#acompanhamento', 'Acompanhamento'], ['servicos/#contato', 'Falar comigo']]],
    ['sobre/', 'Sobre', [['sobre/', `Quem é ${esc(cfg.autor)}`], ['sobre/#estante', 'Sugestões de leitura']]],
  ];
  const navRodape = RODAPE.map(([h, t, links], i) => `<div class="rodape-col"><p class="rodape-tit" id="rod-${i}"><a href="${href(h)}">${t}</a></p><ul aria-labelledby="rod-${i}">${links.map(([l, r]) => `<li><a href="${href(l)}">${r}</a></li>`).join('')}</ul></div>`).join('');
  const navMenu = ABAS.map(([h, t, d], i) => `<a href="${href(h)}"${aqui(h)} style="--i:${i}"><span class="menu-n">${String(i + 1).padStart(2, '0')}</span><span class="menu-t">${t}</span><span class="menu-d">${d}</span>${icone('seta')}</a>`).join('');
  const navAtalhos = ATALHOS.map(([h, t]) => `<a href="${href(h)}">${t}</a>`).join('');
  const ct = contato(cfg);
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
<link rel="stylesheet" href="${raiz}assets/css/jornada.css">${estilos.map(e => `\n<link rel="stylesheet" href="${raiz}${e}">`).join('')}
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="${classe}"${attrs}>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo" data-topo>
  <div class="topo-in">
    <a class="logo" href="${raiz || './'}" aria-label="${esc(cfg.nome)}: início">${marca()}<span class="logo-txt">Change Management <i>World</i></span><span class="logo-curto">CM <i>World</i></span></a>
    <nav class="nav" aria-label="Seções" data-nav>${nav}</nav>
    <div class="topo-acoes">
      <a class="btn-ic" href="${raiz}radar/" data-abrir-busca aria-label="Buscar no site" data-dica="Buscar · Ctrl K">${icone('busca')}</a>
      <button class="btn-ic so-js" type="button" data-abrir-lista aria-haspopup="dialog" aria-label="Para ler depois" data-dica="Para ler depois">${icone('marcador')}<i class="conta" data-conta-salvos hidden></i></button>
      <a class="btn-menu" href="#rodape" role="button" data-menu aria-expanded="false" aria-controls="menu" aria-label="Abrir menu"><span class="btn-menu-rot">Menu</span><span class="btn-menu-ic" aria-hidden="true"><i></i><i></i></span></a>
    </div>
  </div>
</header>
<dialog class="menu" id="menu" aria-label="Menu do site">
  <div class="menu-in">
    <div class="menu-topo"><a class="logo logo--claro" href="${raiz || './'}" aria-label="${esc(cfg.nome)}: início">${marca()}<span>Change Management <i>World</i></span></a><button class="btn-menu btn-menu--x" type="button" data-menu-fechar aria-label="Fechar menu"><span class="btn-menu-rot">Fechar</span><span class="btn-menu-ic" aria-hidden="true"><i></i><i></i></span></button></div>
    <div class="menu-nav">
      <nav class="menu-links" aria-label="Seções do site">${navMenu}</nav>
      <nav class="menu-atalhos" aria-label="Atalhos"><span>Atalhos</span>${navAtalhos}</nav>
    </div>
    <aside class="menu-lado">
      ${cm ? `<a class="menu-capa" href="${raiz}posts/${esc(cm.slug)}/"><small>${icone('faisca')}Capa da semana</small><b>${esc(cm.titulo)}</b><span class="link-seta">Ler agora${icone('seta')}</span></a>` : ''}
      <div class="menu-acoes"><button class="btn btn--vidro" type="button" data-abrir-busca>${icone('busca')}Buscar no site<kbd>Ctrl K</kbd></button>${ct.zap ? `<a class="btn btn--claro" href="${esc(ct.zap)}" target="_blank" rel="noopener">${icone('conversa')}Chamar no WhatsApp</a>` : ''}${cfg.linkedin ? `<a class="btn btn--vidro" href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}Seguir no LinkedIn</a>` : ''}</div>
      <p class="menu-nota">${esc(cfg.lema)}.${ct.tel ? ` <a href="${esc(ct.hrefTel)}">${esc(ct.tel)}</a>` : ''}</p>
    </aside>
    <div class="menu-mar" aria-hidden="true"></div>
  </div>
</dialog>
<main id="conteudo">
${corpo}
</main>
<footer class="rodape" id="rodape">
  <div class="rodape-in">
    <div class="rodape-grade">
      <div class="rodape-sobre">
        <a class="rodape-marca" href="${raiz || './'}" aria-label="${esc(cfg.nome)}: início">${marca()}<span><strong>${esc(cfg.nome)}</strong><span>${esc(cfg.lema)}</span></span></a>
        ${ct.tel || cfg.linkedin ? `<div class="rodape-contato"><p class="rodape-tit">Fale comigo</p><p class="rodape-canais">${ct.zap ? `<a href="${esc(ct.zap)}" target="_blank" rel="noopener">${icone('conversa')}<span>WhatsApp<b>${esc(ct.tel)}</b></span></a>` : ct.tel ? `<a href="${esc(ct.hrefTel)}">${icone('telefone')}<span>Telefone<b>${esc(ct.tel)}</b></span></a>` : ''}${cfg.linkedin ? `<a href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}<span>LinkedIn<b>Ver o perfil</b></span></a>` : ''}</p></div>` : ''}
      </div>
      <nav class="rodape-nav" aria-label="Rodapé">${navRodape}</nav>
    </div>
    <div class="rodape-fim">
      <div class="rodape-legal"><p class="rodape-nota">Curadoria e textos de ${esc(cfg.autor)}. Cada reportagem cita a fonte original, com link; os números valem para o recorte de cada pesquisa. Os guias de campo são a visão do autor.</p><p class="rodape-direitos">© ${new Date().getFullYear()} ${esc(cfg.autor)} · ${esc(cfg.papel)}</p></div>
      <a class="rodape-topo" href="#conteudo">Voltar à superfície${icone('setaCima')}</a>
    </div>
  </div>
</footer>
<script src="${raiz}assets/js/site.js" defer></script>
<script src="${raiz}assets/js/motion.js" defer></script>
<script src="${raiz}assets/js/dados.js" defer></script>
<script src="${raiz}assets/js/ux.js" defer></script>
<script src="${raiz}assets/js/efeitos.js" defer></script>${scripts.map(sc => `\n<script src="${raiz}${sc}" defer></script>`).join('')}
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
export const regua = (r, raiz) => !r ? '' : `<div class="regua revela" data-regua data-inicial="${r.inicial ?? 2}">
      <div class="regua-cab"><span class="olho">${esc(r.olho)}</span><h3>${esc(r.titulo)}</h3><p>${esc(r.nota)}</p><a class="link-seta" href="${raiz}lab/matriz-de-adocao/">Montar a matriz de adoção do seu projeto${icone('seta')}</a></div>
      <div class="regua-corpo">
        <ol class="regua-lista">${r.marcas.map((m, i) => `<li data-nome="${esc(m.nome)}" data-estado="${esc(m.estado)}" data-acao="${esc(m.acao)}" data-como="${esc(m.como)}"><span class="regua-n">${i + 1}</span><b>${esc(m.nome)}</b><span>${esc(m.estado)}</span><strong>${esc(m.acao)}</strong><span>${esc(m.como)}</span></li>`).join('')}</ol>
      </div>
    </div>`;

// navegação de uma galeria que desliza: setas, barra de posição e contagem (o comportamento fica em assets/js/efeitos.js)
export const navGaleria = rotulo => `<div class="galeria-nav so-js" role="group" aria-label="${esc(rotulo)}"><button type="button" data-g-ant aria-label="Anterior">${icone('setaEsq')}</button><span class="galeria-barra" aria-hidden="true"><i></i></span><output class="galeria-conta" aria-live="polite"></output><button type="button" data-g-prox aria-label="Próximo">${icone('seta')}</button></div>`;
const linhaTit = l => esc(l).replace(/\*(.+?)\*/g, '<em>$1</em>');
// manchete em cartão, para a galeria
const mancheteCartao = (p, raiz, i) => `<li class="galeria-item"><article class="manchete manchete--cartao holo" data-slug="${esc(p.slug)}">
      <span class="manchete-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="manchete-meta">${esc(tema(p).nome)}${p.regiao ? ' · ' + esc(p.regiao) : ''}</span>
      <h3><a href="${urlPost(raiz, p)}">${esc(p.titulo)}</a></h3>
      <span class="manchete-pe">${esc(fonteCurta(p))} · ${p.min} min</span></article></li>`;

// ---------- início: abertura e um trecho de cada destino (radar, laboratório, serviços e sobre) ----------
// video: { html, rotulo } do vídeo interativo (lib/video.mjs), logo abaixo da abertura; sem ele, a página fica como antes
export function inicio({ cfg, posts, perfil, home, lab = '', servicos = '', sobre = '', video = null }) {
  const raiz = '';
  const capaP = posts.find(p => p.slug === cfg.edicao.capa) || posts[0];
  const reportagens = posts.filter(p => p.tipo === 'reportagem');
  const usados = new Set(reportagens.map(p => p.tema));
  const temasRadar = Object.keys(TEMAS).filter(k => usados.has(k));
  const ab = home.abertura || { titulo: ['Gestão da mudança,', '*além do raso*.'], lead: cfg.descricao }, ice = home.iceberg || { zonas: [], superficie: [], fundo: [] };
  const pct = (v, total) => (v / total * 100).toFixed(2) + '%';
  const pontos = (ice.fundo || []).map(h => ({ ...h, p: posts.find(p => p.slug === h.slug) })).filter(h => h.p);
  // radar da página inicial: os destaques da edição e as reportagens seguintes, sem repetir (o radar completo fica em radar/)
  const manchetes = [...(home.destaques || []).map(s => posts.find(p => p.slug === s)).filter(Boolean), ...reportagens].filter((p, i, a) => a.indexOf(p) === i).slice(0, home.radar_inicio || 6);

  const abertura = `<section class="abertura" aria-labelledby="ab-t">
  <div class="abertura-in">
    <div class="abertura-txt">
      <span class="selo revela">${esc(cfg.edicao.rotulo)} <i></i> ${esc(cfg.edicao.periodo)}</span>
      <h1 id="ab-t" class="mega">${ab.titulo.map(l => `<span class="mega-l"><span>${linhaTit(l)}</span></span>`).join('')}</h1>
      <p class="abertura-lead revela">${frases(ab.lead)}</p>
      <div class="abertura-acoes revela"><a class="btn btn--p" href="radar/">Explorar notícias${icone('seta')}</a><a class="btn btn--s btn--busca" href="radar/" data-abrir-busca>${icone('busca')}Buscar no blog<kbd>Ctrl K</kbd></a></div>
      ${video ? `<a class="abertura-video revela" href="#video" data-vi-abrir><i>${icone('play')}</i><span>${esc(video.chamada)}</span><small>${esc(video.rotulo)}</small></a>` : ''}
    </div>
    <div class="mergulho revela" data-mergulho data-zonas="${esc(JSON.stringify(ice.zonas || []))}">
      <div class="cena-topo"><div class="cena-cab"><h2 class="cena-tit">${esc(ice.titulo || 'O iceberg da mudança')}</h2><p class="cena-zona" data-zona aria-live="polite"><b>${esc((ice.zonas[0] || {}).nome || 'Superfície')}</b><span>${esc((ice.zonas[0] || {}).frase || '')}</span></p></div><output class="sonda-m so-js" aria-hidden="true">0 m</output></div>
      <div class="cena-corpo">
        <div class="cena-janela" data-cursor="${esc(ice.dica || 'Arraste para mergulhar')}">
          <div class="cena-mundo">
            ${iceberg()}
            <ul class="cena-raso" aria-label="Na superfície: o que todo mundo vê">${(ice.superficie || []).map(s => `<li style="--x:${pct(s.x, CENA.L)};--y:${pct(s.y, CENA.A)}">${esc(s.t)}</li>`).join('')}</ul>
            <ul class="cena-fundo" aria-label="Abaixo da superfície: o que decide a mudança">${pontos.map((h, i) => `<li style="--x:${pct(h.x, CENA.L)};--y:${pct(h.y, CENA.A)};--i:${i}" class="${h.x > 300 ? 'ponto--e' : ''}"><a class="ponto" href="${urlPost(raiz, h.p)}" data-ler="${esc(h.p.slug)}" data-ponto="${i}"><i>${i + 1}</i><span><b>${esc(h.t)}</b><small>${esc(h.p.titulo)}</small></span></a></li>`).join('')}</ul>
            ${ice.fim ? `<p class="cena-fim" style="--y:${pct(1385, CENA.A)}">${esc(ice.fim)}</p>` : ''}
          </div>
        </div>
        <div class="sonda so-js" data-sonda><span class="sonda-trilho" aria-hidden="true"><i></i></span><button class="sonda-pega" type="button" role="slider" aria-orientation="vertical" aria-label="Profundidade do mergulho" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Superfície">${icone('setaBaixo')}</button></div>
      </div>
      <div class="cena-pe so-js"><button class="cena-botao" type="button" data-mergulhar><span>Explorar o iceberg</span>${icone('setaBaixo')}</button><span class="cena-dica">${icone('mao')}Arraste a cena</span></div>
      <div class="cena-legenda"><h3>Os ${pontos.length} temas abaixo da superfície</h3><ol>${pontos.map((h, i) => `<li><a href="${urlPost(raiz, h.p)}" data-ler="${esc(h.p.slug)}" data-legenda="${i}"><i>${i + 1}</i><span><b>${esc(h.t)}</b><small>${esc(h.p.titulo)}</small></span></a></li>`).join('')}</ol></div>
    </div>
  </div>
</section>`;

  // três caminhos: ler, praticar e aplicar
  const tr = home.trilha;
  const trilha = !tr ? '' : `<section class="sec sec--trilha" aria-labelledby="trilha-t">
  <div class="sec-in">
    <h2 class="vis-oculto" id="trilha-t">${esc(tr.titulo || tr.olho)}</h2>
    <ol class="trilha">${tr.passos.map((x, i) => `<li class="revela" style="--i:${i}"><a class="trilha-passo holo vivo" href="${raiz}${esc(x.href)}"><span class="trilha-ic">${iconeVivo(x.icone || 'rota')}</span><small><i>${String(i + 1).padStart(2, '0')}</i>${esc(x.verbo)}</small><b>${esc(x.titulo)}</b><span>${esc(x.frase)}</span><em>${esc(x.acao)}${icone('seta')}</em></a></li>`).join('')}</ol>
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
    <div class="galeria galeria--manchetes revela" data-galeria>
      <ol class="galeria-trilho" data-cursor="Arraste" tabindex="0" aria-label="Destaques do radar">${manchetes.map((p, i) => mancheteCartao(p, raiz, i)).join('')}</ol>
      ${navGaleria('Destaques do radar')}
    </div>
    <p class="temas-linha revela"><span>Temas</span>${temasRadar.map(k => `<a href="radar/?tema=${k}">${esc(TEMAS[k].nome)}</a>`).join('')}<a href="radar/#guias">Guias de campo</a></p>
  </div>
</section>`;

  return pagina({ cfg, raiz, titulo: '', descricao: cfg.descricao, corpo: abertura + (video ? video.html : '') + trilha + blocoCapa + radar + lab + servicos + sobre, caminho: '', imagem: 'assets/img/og/inicio.jpg', classe: 'pg-inicio pg-escura', scripts: ['assets/js/mergulho.js', ...(video ? ['assets/js/video.js'] : [])], estilos: video ? ['assets/css/video.css'] : [] });
}

// ---------- radar completo: reportagens (filtro, busca, grade ou lista), guias de campo, IA em números, agenda e vídeos ----------
export function paginaRadar({ cfg, posts, eventos = [], videos = [], home = {} }) {
  const raiz = '../';
  const reportagens = posts.filter(p => p.tipo === 'reportagem');
  const guias = posts.filter(p => p.tipo === 'guia');
  const usados = new Set(reportagens.map(p => p.tema));
  const temasRadar = Object.keys(TEMAS).filter(k => usados.has(k));
  const nomeGuia = p => { const s = p.titulo.replace(/^Change Management em\s+/i, ''); return s[0].toUpperCase() + s.slice(1); };
  const externos = videos.filter(v => !v.arquivo);
  // cada número é uma parcela de 100%: a barra cresce até o valor quando o bloco entra na tela
  const stats = (home.numeros || []).map((n, i) => { const p = posts.find(x => x.slug === n.slug), v = parseFloat(String(n.valor).replace(',', '.')); return `<a class="num revela" style="--i:${i}" href="${p ? urlPost(raiz, p) : '#radar'}"><strong data-conta="${esc(n.valor)}">${esc(n.valor)}</strong>${v > 0 && v <= 100 && /%/.test(n.valor) ? `<span class="num-barra" aria-hidden="true"><i style="--v:${(v / 100).toFixed(2)}"></i></span>` : ''}<span>${esc(n.descricao)}</span><small>${esc(n.fonte)}${icone('setaFora')}</small></a>`; }).join('');
  const corpo = `<section class="sec sec--radar sec--radar-pg" id="radar" aria-labelledby="radar-t">
  <div class="sec-in">
    <nav class="migalhas" aria-label="Você está em"><a href="${raiz || './'}">Início</a>${icone('seta')}<span>Radar</span></nav>
    <header class="sec-cab"><div><span class="olho">Radar mundial</span><h1 id="radar-t">O que está acontecendo em Change Management</h1><p>Pesquisas, normas e movimentos do mercado, com a fonte original em cada reportagem.</p></div><nav class="sec-atalhos" aria-label="Nesta página">${guias.length ? `<a href="#guias">Guias de campo</a>` : ''}${stats ? `<a href="#ia">IA em números</a>` : ''}<a href="#agenda">Agenda e vídeos</a></nav></header>
    <div class="filtros" role="group" aria-label="Filtrar reportagens">
      <div class="chips" data-chips><button type="button" class="filtro ativo" data-tema="">Tudo <i>${reportagens.length}</i></button>${temasRadar.map(k => `<button type="button" class="filtro" data-tema="${k}">${icone(TEMAS[k].ic)}${esc(TEMAS[k].nome)} <i>${reportagens.filter(p => p.tema === k).length}</i></button>`).join('')}</div>
      <label class="busca">${icone('busca')}<span class="vis-oculto">Buscar no radar</span><input type="search" placeholder="Buscar: IA, Prosci, carve-out…" data-busca-campo autocomplete="off"></label>
      <div class="visao" role="group" aria-label="Formato da lista"><button type="button" data-visao="grade" aria-pressed="true" aria-label="Ver em grade" data-dica="Grade">${icone('grade')}</button><button type="button" data-visao="lista" aria-pressed="false" aria-label="Ver em lista" data-dica="Lista">${icone('lista')}</button></div>
    </div>
    <div class="grade grade--radar" data-grade>${reportagens.map(p => cartao(p, raiz)).join('\n')}</div>
    <p class="vazio" data-vazio hidden>Nada no radar com esse filtro. Tente outro tema ou outra palavra.</p>
    <div class="mais"><button class="btn btn--s" type="button" data-mais>Mostrar mais reportagens${icone('setaBaixo')}</button></div>
  </div>
</section>
${guias.length ? `<section class="sec sec--guias" id="guias" aria-labelledby="guias-t">
  <div class="sec-in">
    ${titSecao('guias', 'Guias de campo', 'Como fazer Change Management em…', 'Quatro contextos em que a gestão da mudança muda de forma.')}
    <div class="guias">${guias.map((p, i) => `<article class="guia revela" data-slug="${esc(p.slug)}" style="--i:${i}">
      <span class="guia-n">${String(i + 1).padStart(2, '0')}</span><h3><a href="${urlPost(raiz, p)}">${esc(nomeGuia(p))}</a></h3><p>${esc(p.resumo)}</p>
      <a class="link-seta" href="${urlPost(raiz, p)}">Abrir o guia${icone('seta')}</a></article>`).join('')}</div>
  </div>
</section>` : ''}
${stats ? `<section class="sec sec--ia" id="ia" aria-labelledby="ia-t">
  <div class="sec-in">
    ${titSecao('ia', 'IA & Mudança', 'A IA não se adota sozinha', 'O que as pesquisas mais recentes dizem sobre a adoção de IA nas organizações. Cada número leva à reportagem, com a fonte.', `<a class="link-seta" href="?tema=ia#radar" data-filtrar="ia">Ver as reportagens de IA${icone('seta')}</a>`)}
    <div class="nums">${stats}</div>
  </div>
</section>` : ''}
<section class="sec sec--agenda" id="agenda" aria-labelledby="agenda-t">
  <div class="sec-in">
    ${titSecao('agenda', 'Agenda e vídeos', 'Para acompanhar', '')}
    <div class="duas">
      <div class="revela"><h3 class="lista-tit">Na agenda</h3><ul class="linhas">${eventos.map(e => { const d = data(e.inicio); return `<li><a href="${esc(e.url)}" target="_blank" rel="noopener"><span class="linha-d">${d.dia ?? ''} ${esc(d.mes3 || '')} ${d.ano || ''}</span><b>${esc(e.titulo)}</b><small>${esc(e.local)}</small>${icone('setaFora')}</a></li>`; }).join('')}</ul></div>
      <div class="revela" style="--i:1"><h3 class="lista-tit">Para ver</h3><ul class="linhas">${externos.map(v => `<li><a href="${esc(v.url)}" target="_blank" rel="noopener"><span class="linha-d">${esc(String(v.canal).split(/[,(|]/)[0].trim())}</span><b>${esc(v.titulo)}</b><small>${v.data ? esc(data(v.data).curta) : ''}</small>${icone('setaFora')}</a></li>`).join('')}</ul></div>
    </div>
  </div>
</section>`;
  return pagina({ cfg, raiz, titulo: 'Radar mundial', descricao: 'Reportagens, guias de campo, números sobre IA e agenda de gestão da mudança, com filtro por tema, busca e a fonte original de cada uma.', corpo, caminho: 'radar/', imagem: 'assets/img/og/inicio.jpg', classe: 'pg-radar', ativo: 'radar' });
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
        <nav class="migalhas" aria-label="Você está em"><a href="${raiz || './'}">Início</a>${icone('seta')}<a href="${p.tipo === 'guia' ? raiz + 'radar/#guias' : raiz + 'radar/'}">${esc(p.tipo === 'guia' ? 'Guias de campo' : 'Radar')}</a>${icone('seta')}<span>${esc(t.nome)}</span></nav>
        <div class="art-meta"><span class="chip chip--capa">${icone(p.tipo === 'guia' ? 'livro' : p.tipo === 'capa' ? 'faisca' : 'globo')}${esc(TIPOS[p.tipo] || 'Reportagem')}</span>${chipTema(p)}${p.regiao ? `<span class="regiao">${icone('pino')}${esc(p.regiao)}</span>` : ''}</div>
        <h1>${esc(p.titulo)}</h1>
        <p class="art-lead">${esc(p.resumo)}</p>
        <div class="art-assina"><span><b>${esc(cfg.autor)}</b><small>${esc(d.longa)} · ${p.min} min de leitura</small></span></div>
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
  <nav class="proximo revela" aria-label="Próximo passo"><span class="olho">Próximo passo</span>
    <a class="proximo-item holo" href="${raiz}lab/"><small>Pratique</small><b>Leve o tema para o Laboratório</b><span>Diagnóstico de nível, ferramentas para montar e modelos para baixar.</span>${icone('seta')}</a>
    <a class="proximo-item holo" href="${raiz}servicos/"><small>Aplique</small><b>Precisa disso no seu projeto?</b><span>Advisory em Change Management e aulas de IA aplicada.</span>${icone('seta')}</a>
  </nav>
</div></section>`;
  return pagina({ cfg, raiz, titulo: p.titulo, descricao: p.resumo, corpo, caminho: `posts/${p.slug}/`, imagem: `assets/img/og/${p.slug}.jpg`, tipo: 'article', classe: 'pg-post', ativo: 'radar', artigo: { data: p.data, secao: t.nome }, attrs: ` data-slug="${esc(p.slug)}" data-min="${p.min}"` });
}

// ---------- posts do mês (página minimalista) ----------
export function mes({ cfg, chave, lista }) {
  const raiz = '../../', d = data(chave);
  const corpo = `<section class="sec sec--arquivo"><div class="sec-in sec-in--estreita">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz || './'}">Início</a>${icone('seta')}<span>Posts do mês</span></nav>
  <h1 class="arq-tit">${esc(d.mesNome)} <i>${d.ano}</i></h1>
  <p class="arq-sub">${lista.length} ${lista.length === 1 ? 'post' : 'posts'} · ${esc(cfg.nome)}</p>
  <ol class="lista-mes lista-mes--pg">${lista.map((p, j) => `<li><a href="${urlPost(raiz, p)}"><span class="lm-n">${String(j + 1).padStart(2, '0')}</span><span class="lm-t">${esc(p.titulo)}<small>${esc(p.resumo)}</small></span><span class="lm-m">${esc(tema(p).nome)} · ${esc(TIPOS[p.tipo] || '')}</span>${icone('seta')}</a></li>`).join('')}</ol>
</div></section>`;
  return pagina({ cfg, raiz, titulo: `Posts de ${d.mesNome} de ${d.ano}`, descricao: `Todos os posts de ${d.mesNome} de ${d.ano} no ${cfg.nome}.`, corpo, caminho: `mes/${chave}/`, imagem: 'assets/img/og/inicio.jpg', classe: 'pg-arquivo', ativo: 'radar' });
}

export function naoAchou({ cfg }) {
  const corpo = `<section class="sec sec--arquivo"><div class="sec-in sec-in--estreita erro"><div class="erro-arte">${capa('mundo', '404', { variante: 'a' })}</div><h1 class="arq-tit">Essa página mudou de lugar</h1><p class="arq-sub">Acontece nas melhores transformações. O radar continua no início.</p><a class="btn btn--p" href="/">Voltar ao início</a></div></section>`;
  // raiz '/': a página de erro aparece em qualquer endereço que não exista, então os caminhos partem da raiz do site
  return pagina({ cfg, raiz: '/', titulo: 'Página não encontrada', corpo, caminho: '404.html', classe: 'pg-arquivo' });
}
// cartão de imagem para o LinkedIn (1200 x 627): renderizado por og.mjs
export function cartaoOG({ cfg, p }) {
  const t = p ? tema(p) : null;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><link rel="stylesheet" href="../assets/css/site.css"><style>html,body{margin:0;width:1200px;height:627px;overflow:hidden}</style></head>
<body><div class="og">
  <div class="og-arte">${p && p.arte ? p.arte : p ? capa(p.tema, p.slug, { variante: 'a' }) : `<div class="og-gelo">${iceberg({ recorte: [60, 40, 440, 627], id: 'og' })}</div>`}</div>
  <div class="og-txt"><div class="og-marca">${marca()}<span>Change Management <i>World</i></span></div>
    <div><span class="og-chip">${esc(p ? (p.rotulo ? p.rotulo : p.tipo === 'lab' ? 'Laboratório' : p.tipo === 'guia' ? 'Guia de campo' : p.tipo === 'capa' ? 'Capa da semana' : t.nome) : cfg.edicao.rotulo)}</span><h1 class="${p && p.titulo.length > 70 ? 'og-menor' : ''}">${esc(p ? p.titulo : cfg.lema)}</h1></div>
    <p>${esc(cfg.autor)} · ${esc(cfg.papel)}</p></div>
</div></body></html>`;
}
