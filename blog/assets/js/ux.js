// Change Management World · camada de interação (sem dependências).
// Busca do site, leitura rápida em folha lateral, lista "para ler depois", leitura em voz alta, barra de leitura dos posts,
// régua de adoção, estante de livros, manchetes arrastáveis, profundímetro da página inicial e detalhes de interface.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches, fino = matchMedia('(pointer: fine)').matches;
  const RAIZ = new URL('../../', document.currentScript.src).href;   // raiz do site, a partir de assets/js/ux.js
  const D = window.CMW_DADOS || { posts: [], lab: [], modelos: [], secoes: [] };
  const POST = new Map(D.posts.map(p => [p.s, p]));
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const cria = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
  const limita = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const urlPost = s => RAIZ + 'posts/' + s + '/';
  const guarda = {
    ler(k, padrao) { try { const v = JSON.parse(localStorage.getItem('cmw-' + k)); return v ?? padrao; } catch { return padrao; } },
    por(k, v) { try { localStorage.setItem('cmw-' + k, JSON.stringify(v)); } catch { /* sem armazenamento: vale só nesta visita */ } },
  };
  const IC = {
    busca: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    marcador: '<path d="M7 4.5h10a1 1 0 011 1V20l-6-4-6 4V5.500a1 1 0 011-1z"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    setaEsq: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    setaCima: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    setaFora: '<path d="M7 17L17 7M9 7h8v8"/>',
    som: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>',
    pausa: '<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="2.6"/>',
    foco: '<path d="M4 9V5.5A1.5 1.5 0 015.5 4H9M15 4h3.5A1.5 1.5 0 0120 5.5V9M20 15v3.5a1.5 1.5 0 01-1.5 1.5H15M9 20H5.5A1.5 1.5 0 014 18.5V15"/>',
    copia: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V7A2.5 2.5 0 0013 4.5H7A2.5 2.5 0 004.5 7v6A2.5 2.5 0 007 15.5h1.5"/>',
    linkedin: '<path d="M6.5 9.5v9M6.5 6.2v.1M10.5 18.5v-5a3 3 0 016 0v5M10.5 9.5v9" stroke-width="2.4"/>',
    mao: '<path d="M8.5 12.5V6a1.5 1.5 0 013 0v5M11.5 10.5V4.5a1.5 1.5 0 013 0v6M14.5 10.5V6a1.5 1.5 0 013 0v8.5c0 3.5-2.5 6-6 6h-1c-2 0-3.5-1-4.5-2.5L4 14.5c-.6-1 .6-2.2 1.7-1.4l2.8 2.4"/>',
    livro: '<path d="M5 5.5A2.5 2.5 0 017.5 3H19v15H7.5A2.5 2.5 0 005 20.5zM5 20.5A2.5 2.5 0 007.5 23H19"/>',
    globo: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
    faisca: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/>',
    grade: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    baixar: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
    lista: '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="4.8" cy="7" r="1.2" fill="currentColor"/><circle cx="4.8" cy="12" r="1.2" fill="currentColor"/><circle cx="4.8" cy="17" r="1.2" fill="currentColor"/>',
    pessoa: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1-4 4-5.5 7.5-5.5s6.5 1.5 7.500 5.500"/>',
  };
  const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
  const pisca = el => { if (!el) return; el.classList.remove('pulo'); void el.offsetWidth; el.classList.add('pulo'); };
  const copia = async txt => {
    try { await navigator.clipboard.writeText(txt); return true; } catch { /* tenta o caminho antigo */ }
    const a = cria('textarea'); a.value = txt; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; } a.remove(); return ok;
  };
  // a página não rola por trás de um diálogo aberto
  const atualizaTrava = () => document.documentElement.classList.toggle('trava', !!$('dialog[open]'));
  document.addEventListener('close', () => setTimeout(atualizaTrava, 0), true);

  // ---------- avisos ----------
  const avisos = cria('div', 'avisos'); avisos.setAttribute('role', 'status'); avisos.setAttribute('aria-live', 'polite');
  const avisa = (txt, icone = 'check') => {
    ($('dialog[open]:not(.menu)') || document.body).appendChild(avisos);   // dentro do diálogo aberto, para não ficar por trás dele
    while (avisos.children.length > 2) avisos.firstChild.remove();
    const a = cria('div', 'aviso', ic(icone) + `<span>${esc(txt)}</span>`); avisos.appendChild(a);
    setTimeout(() => a.classList.add('sai'), 2600); setTimeout(() => a.remove(), 3000);
  };

  // ---------- leitura em voz alta ----------
  const voz = {
    ok: 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function',
    raiz: null, blocos: [], i: 0, partes: [], tocando: false, ficha: null, aoMudar: null,
    escolhe() { const vs = speechSynthesis.getVoices(); return vs.find(v => /^pt[-_]BR/i.test(v.lang)) || vs.find(v => /^pt/i.test(v.lang)) || null; },
    alterna(raiz, aoMudar) { if (this.tocando && this.raiz === raiz) this.pausa(); else this.toca(raiz, aoMudar); },
    toca(raiz, aoMudar) {
      if (!this.ok) return;
      if (speechSynthesis.getVoices().length && !this.escolhe()) return avisa('Este aparelho não tem voz em português instalada', 'som');
      if (this.raiz !== raiz) {
        this.para(); this.raiz = raiz;
        this.blocos = $$('h2, h3, p, li, blockquote', raiz).filter(el => !el.closest('.fonte-caixa, nav, .folha-fim, .sumario-mob, .folha-meta') && !el.querySelector('p, li') && el.textContent.trim().length > 1);
        // começa de onde a pessoa está, não do início da matéria
        this.i = Math.max(0, this.blocos.findIndex(el => el.getBoundingClientRect().bottom > 90));
      }
      this.aoMudar = aoMudar; this.tocando = true; if (aoMudar) aoMudar(true); this.bloco();
    },
    bloco() {
      const el = this.blocos[this.i];
      if (!el) { const cb = this.aoMudar; this.para(); if (cb) cb(false); return avisa('Fim da leitura'); }
      $$('.lendo', this.raiz).forEach(x => x.classList.remove('lendo')); el.classList.add('lendo');
      el.scrollIntoView({ block: 'center', behavior: calmo ? 'auto' : 'smooth' });
      // frases curtas: alguns navegadores cortam falas longas
      const frases = el.textContent.trim().replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]*\s*/g) || [];
      this.partes = []; let atual = '';
      for (const f of frases) { if ((atual + f).length > 220 && atual) { this.partes.push(atual); atual = f; } else atual += f; }
      if (atual.trim()) this.partes.push(atual);
      this.fala();
    },
    fala() {
      const txt = this.partes.shift();
      if (txt === undefined) { this.i++; return this.bloco(); }
      const u = new SpeechSynthesisUtterance(txt), v = this.escolhe(), minha = this.ficha = {};
      u.lang = 'pt-BR'; if (v) u.voice = v; u.rate = 1.02;
      u.onend = () => { if (this.ficha === minha && this.tocando) this.fala(); };
      u.onerror = e => { if (this.ficha !== minha || /interrupted|canceled/.test(e.error || '')) return; const cb = this.aoMudar; this.para(); if (cb) cb(false); avisa('Não foi possível ler em voz alta neste navegador', 'som'); };
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    },
    pausa() { this.tocando = false; this.ficha = null; speechSynthesis.cancel(); if (this.aoMudar) this.aoMudar(false); },
    para() {
      if (!this.ok) return;
      this.tocando = false; this.ficha = null; speechSynthesis.cancel();
      if (this.raiz) $$('.lendo', this.raiz).forEach(x => x.classList.remove('lendo'));
      if (this.aoMudar) this.aoMudar(false);
      this.raiz = null; this.i = 0; this.partes = []; this.aoMudar = null;
    },
  };
  addEventListener('pagehide', () => { if (voz.ok) speechSynthesis.cancel(); });
  const pintaOuvir = b => on => { if (!b) return; b.setAttribute('aria-pressed', String(on)); b.innerHTML = ic(on ? 'pausa' : 'som'); b.setAttribute('aria-label', on ? 'Pausar a leitura em voz alta' : 'Ouvir'); if (b.dataset.dica) b.dataset.dica = on ? 'Pausar' : 'Ouvir'; };

  // ---------- para ler depois e lidos ----------
  let salvos = guarda.ler('salvos', []).filter(s => POST.has(s));
  const lidos = new Set(guarda.ler('lidos', []));
  const cartoes = $$('.cartao[data-slug], .guia[data-slug]');
  for (const c of cartoes) {
    const s = c.dataset.slug, t = esc((POST.get(s) || {}).t || '');
    c.appendChild(cria('div', 'cartao-acoes', `<button type="button" class="acao" data-ler-rapido aria-label="Leitura rápida: ${t}" data-dica="Leitura rápida">${ic('olho')}</button><button type="button" class="acao" data-salvar="${esc(s)}" aria-pressed="false" aria-label="Guardar para ler depois: ${t}" data-dica="Guardar">${ic('marcador')}</button>`));
  }
  let painelLista = null;
  function pinta() {
    for (const c of cartoes) {
      const lido = lidos.has(c.dataset.slug), selo = $('.selo-lido', c);
      if (lido && !selo) c.appendChild(cria('span', 'selo-lido', ic('check') + 'Lido'));
      else if (!lido && selo) selo.remove();
    }
    $$('[data-salvar]').forEach(b => { if (!b.hasAttribute('aria-pressed')) return; const on = salvos.includes(b.dataset.salvar); b.setAttribute('aria-pressed', String(on)); if (b.dataset.dica) b.dataset.dica = on ? 'Guardado' : 'Guardar'; });
    $$('[data-conta-salvos]').forEach(i => { i.hidden = !salvos.length; i.textContent = salvos.length; });
    if (painelLista) desenhaLista();
  }
  const alternaSalvo = (s, el) => {
    if (!s) return;
    const tinha = salvos.includes(s);
    salvos = tinha ? salvos.filter(x => x !== s) : [s, ...salvos];
    guarda.por('salvos', salvos); pinta(); pisca(el); pisca($('[data-conta-salvos]'));
    avisa(tinha ? 'Tirado da sua lista' : 'Guardado para ler depois', 'marcador');
  };
  const marcaLido = s => { if (!s || lidos.has(s) || !POST.has(s)) return; lidos.add(s); guarda.por('lidos', [...lidos]); pinta(); };
  function desenhaLista() {
    const n = salvos.length, total = D.posts.length, nLidos = [...lidos].filter(s => POST.has(s)).length;
    painelLista.innerHTML = `<div class="lista-cab"><h2>Para ler depois</h2><span>${n} ${n === 1 ? 'guardada' : 'guardadas'}</span></div>`
      + (n ? `<ul class="lista-itens">${salvos.map(s => { const p = POST.get(s); return `<li><a href="${urlPost(s)}" data-ler="${esc(s)}"><b>${esc(p.t)}</b><small>${esc(p.tn)} · ${p.m} min${lidos.has(s) ? ' · lido' : ''}</small></a><button type="button" data-salvar="${esc(s)}" aria-label="Tirar da lista: ${esc(p.t)}">${ic('x')}</button></li>`; }).join('')}</ul>`
        : `<div class="lista-vazia">${ic('marcador')}<p>Toque no marcador de uma reportagem para guardá-la aqui. A lista fica só neste aparelho.</p></div>`)
      + `<div class="lista-pe"><span>Você já leu ${nLidos} de ${total} publicações</span><div class="lista-barra"><i style="--p:${total ? nLidos / total : 0}"></i></div></div>`;
  }
  const fechaLista = () => { if (!painelLista) return; painelLista.remove(); painelLista = null; $$('[data-abrir-lista]').forEach(b => b.setAttribute('aria-expanded', 'false')); };
  const alternaLista = () => {
    if (painelLista) return fechaLista();
    painelLista = cria('div', 'lista-painel'); painelLista.setAttribute('role', 'dialog'); painelLista.setAttribute('aria-label', 'Para ler depois'); painelLista.tabIndex = -1;
    desenhaLista(); document.body.appendChild(painelLista); painelLista.focus({ preventScroll: true });
    $$('[data-abrir-lista]').forEach(b => b.setAttribute('aria-expanded', 'true'));
  };

  // ---------- leitura rápida (folha lateral) ----------
  let folha = null, fila = [], atual = 0, origem = null, empurrou = false, porHistorico = false;
  const cache = new Map();
  const carrega = async s => {
    if (cache.has(s)) return cache.get(s);
    const base = urlPost(s), r = await fetch(base + 'index.html');
    if (!r.ok) throw new Error('falha ' + r.status);
    const doc = new DOMParser().parseFromString(await r.text(), 'text/html'), q = sel => doc.querySelector(sel), corpo = q('.art-corpo');
    if (!corpo) throw new Error('sem corpo');
    corpo.querySelectorAll('[href]').forEach(a => {
      a.setAttribute('href', new URL(a.getAttribute('href'), base).href);
      const m = /\/posts\/([\w-]+)\/(?:index\.html)?$/.exec(a.href);   // outra matéria do blog abre na própria folha
      if (m && POST.has(m[1]) && a.href.startsWith(RAIZ)) a.dataset.ler = m[1];
    });
    corpo.querySelectorAll('[src]').forEach(a => a.setAttribute('src', new URL(a.getAttribute('src'), base).href));
    const o = { titulo: (q('h1') || {}).textContent || '', lead: (q('.art-lead') || {}).textContent || '', meta: (q('.art-meta') || {}).innerHTML || '', quando: (q('.art-assina small') || {}).textContent || '', dados: [...doc.querySelectorAll('.art-lado .dado')].map(d => d.outerHTML).join(''), corpo: corpo.innerHTML };
    cache.set(s, o); return o;
  };
  const mostraFolha = async s => {
    const art = $('.folha-art', folha), rol = $('.folha-rolagem', folha);
    voz.para();
    art.innerHTML = `<div class="folha-osso">${'<i></i>'.repeat(7)}</div>`; rol.scrollTop = 0; folha.style.setProperty('--p', 0);
    $('[data-salvar]', folha).dataset.salvar = s; $('[data-f="abrir"]', folha).href = urlPost(s);
    $('[data-f="ant"]', folha).disabled = atual <= 0; $('[data-f="prox"]', folha).disabled = atual >= fila.length - 1;
    pinta();
    try {
      const o = await carrega(s);
      if (fila[atual] !== s || !folha.open) return;   // a pessoa já foi para outra
      art.innerHTML = `<div class="folha-meta">${o.meta}</div><h2>${esc(o.titulo)}</h2><p class="folha-lead">${esc(o.lead)}</p><p class="folha-quando">${esc(o.quando)}</p>${o.dados ? `<div class="folha-dados">${o.dados}</div>` : ''}<div class="prosa">${o.corpo}</div><div class="folha-fim"><a class="btn btn--p" href="${urlPost(s)}">Abrir a página completa${ic('seta')}</a><button type="button" class="btn btn--s" data-f="fechar">Fechar</button></div>`;
      art.style.animation = 'none'; void art.offsetWidth; art.style.animation = '';
      setTimeout(() => { if (folha.open && fila[atual] === s && rol.scrollHeight <= rol.clientHeight + 60) marcaLido(s); }, 5000);
    } catch { location.href = urlPost(s); }   // sem conseguir buscar (arquivo local, rede): abre a página
  };
  const fechaFolha = () => {
    if (!folha || !folha.open || folha.classList.contains('saindo')) return;
    folha.classList.add('saindo'); setTimeout(() => { folha.classList.remove('saindo'); folha.close(); }, calmo ? 0 : 240);
  };
  const passoFolha = d => { const n = atual + d; if (n < 0 || n >= fila.length) return; atual = n; history.replaceState({ cmwFolha: fila[n] }, '', '#ler/' + fila[n]); mostraFolha(fila[n]); };
  const montaFolha = () => {
    folha = cria('dialog', 'folha', `<header class="folha-topo"><i class="folha-pega" aria-hidden="true"></i><span class="folha-rot">${ic('olho')}<span>Leitura rápida</span></span>
      <button type="button" class="folha-b" data-f="ant" aria-label="Anterior" data-dica="Anterior">${ic('setaEsq')}</button><button type="button" class="folha-b" data-f="prox" aria-label="Próxima" data-dica="Próxima">${ic('seta')}</button><i class="folha-sep" aria-hidden="true"></i>
      ${voz.ok ? `<button type="button" class="folha-b" data-f="ouvir" aria-pressed="false" aria-label="Ouvir" data-dica="Ouvir">${ic('som')}</button>` : ''}
      <button type="button" class="folha-b" data-salvar="" aria-pressed="false" aria-label="Guardar para ler depois" data-dica="Guardar">${ic('marcador', 'ic-cheio')}</button>
      <a class="folha-b" data-f="abrir" href="#" aria-label="Abrir a página completa" data-dica="Página completa">${ic('setaFora')}</a>
      <button type="button" class="folha-b" data-f="fechar" aria-label="Fechar a leitura rápida" data-dica="Fechar">${ic('x')}</button>
      <div class="folha-prog" aria-hidden="true"><i></i></div></header>
      <div class="folha-rolagem" tabindex="0"><article class="folha-art"></article></div>`);
    folha.setAttribute('aria-label', 'Leitura rápida');
    document.body.appendChild(folha);
    const rol = $('.folha-rolagem', folha), topo = $('.folha-topo', folha);
    folha.addEventListener('click', e => {
      if (e.target === folha) return fechaFolha();   // clique no fundo
      const b = e.target.closest('[data-f]'); if (!b) return;
      const f = b.dataset.f;
      if (f === 'fechar') fechaFolha();
      else if (f === 'ant') passoFolha(-1);
      else if (f === 'prox') passoFolha(1);
      else if (f === 'ouvir') voz.alterna($('.folha-art', folha), pintaOuvir(b));
    });
    folha.addEventListener('cancel', e => { e.preventDefault(); fechaFolha(); });
    folha.addEventListener('close', () => {
      voz.para();
      if (!porHistorico) { if (empurrou) history.back(); else history.replaceState(null, '', location.pathname + location.search); }
      porHistorico = false; empurrou = false;
      if (origem && origem.isConnected && origem.focus) origem.focus({ preventScroll: true });
    });
    folha.addEventListener('keydown', e => { if (e.target.closest('input, textarea')) return; if (e.key === 'ArrowLeft') passoFolha(-1); else if (e.key === 'ArrowRight') passoFolha(1); });
    rol.addEventListener('scroll', () => {
      const max = rol.scrollHeight - rol.clientHeight, p = max > 0 ? rol.scrollTop / max : 0;
      folha.style.setProperty('--p', p.toFixed(3)); if (p > 0.9) marcaLido(fila[atual]);
    }, { passive: true });
    // no celular, puxar o topo da folha para baixo fecha
    topo.addEventListener('pointerdown', e => {
      if (!matchMedia('(max-width: 720px)').matches || e.target.closest('button, a')) return;
      const y0 = e.clientY; let dy = 0;
      try { topo.setPointerCapture(e.pointerId); } catch { /* segue sem captura */ }
      const move = ev => { dy = Math.max(0, ev.clientY - y0); folha.style.setProperty('--arrasto', dy + 'px'); };
      const solta = () => {
        topo.removeEventListener('pointermove', move); topo.removeEventListener('pointerup', solta); topo.removeEventListener('pointercancel', solta);
        if (dy > 110) { fechaFolha(); return setTimeout(() => folha.style.setProperty('--arrasto', '0px'), 300); }
        folha.style.transition = 'transform .3s'; folha.style.setProperty('--arrasto', '0px'); setTimeout(() => { folha.style.transition = ''; }, 320);
      };
      topo.addEventListener('pointermove', move); topo.addEventListener('pointerup', solta); topo.addEventListener('pointercancel', solta);
    });
  };
  const abreFolha = (s, el, deHistorico) => {
    if (!POST.has(s) || !window.fetch || !window.DOMParser || !HTMLDialogElement.prototype.showModal) { location.href = urlPost(s); return; }
    if (!folha) montaFolha();
    fechaLista();
    const grupo = el && el.closest('[data-grade], .grade, .guias, .cena-fundo, .lista-itens, .lista-painel');
    fila = grupo ? [...new Set($$('[data-slug]:not(.oculto), a[data-ler]', grupo).map(x => x.dataset.slug || x.dataset.ler))] : [];
    if (!fila.includes(s)) fila = [s];
    atual = fila.indexOf(s);
    if (!folha.open) {
      origem = el || document.activeElement;
      folha.showModal(); atualizaTrava();
      if (!deHistorico) { history.pushState({ cmwFolha: s }, '', '#ler/' + s); empurrou = true; }
      $('.folha-rolagem', folha).focus({ preventScroll: true });
    } else history.replaceState({ cmwFolha: s }, '', '#ler/' + s);
    mostraFolha(s);
  };
  addEventListener('popstate', () => {
    const st = history.state, s = st && st.cmwFolha;
    if (folha && folha.open && !s) { porHistorico = true; fechaFolha(); }
    else if (s && !(folha && folha.open)) { abreFolha(s, null, true); empurrou = true; }
  });

  // ---------- busca do site ----------
  let paleta = null, indice = null, pAtivo = 0;
  const noInicio = document.body.classList.contains('pg-inicio');
  const montaIndice = () => {
    indice = [
      ...D.posts.map(p => ({ g: p.tp === 'guia' ? 'Guias de campo' : 'Reportagens', t: p.t, d: [p.tn, p.f, p.g].filter(Boolean).join(' · '), u: urlPost(p.s), ic: p.tp === 'guia' ? 'livro' : p.tp === 'capa' ? 'faisca' : 'globo', e: p.tp === 'capa' ? 'Capa' : p.m + ' min', b: norm([p.t, p.r, p.tn, p.f, p.g].join(' ')) })),
      ...D.lab.map(f => ({ g: 'Laboratório', t: f.t, d: f.d, u: RAIZ + f.u, ic: 'grade', e: 'Ferramenta', b: norm(f.t + ' ' + f.d + ' laboratorio ferramenta') })),
      ...D.modelos.map(m => ({ g: 'Modelos para baixar', t: m.t, d: m.d, u: RAIZ + m.u, ic: 'baixar', e: m.f, b: norm(m.t + ' ' + m.d + ' ' + m.f + ' modelo template baixar') })),
      ...D.secoes.map(s => ({ g: 'Seções', t: s.t, d: '', u: noInicio && s.u.startsWith('index.html#') ? s.u.slice(10) : RAIZ + s.u, ic: 'lista', e: 'Ir', b: norm(s.t + ' secao') })),
    ];
    for (const x of indice) x.nt = norm(x.t);
  };
  // marca no título os trechos encontrados, sem se perder com acentos
  const realca = (t, ts) => {
    const mapa = []; let n = '';
    for (let i = 0; i < t.length; i++) for (const ch of norm(t[i])) { n += ch; mapa.push(i); }
    const marc = new Array(t.length).fill(false);
    // só começo de palavra: "ti" marca "TI", não o meio de "política"
    for (const tk of ts) for (let i = n.indexOf(tk); i >= 0; i = n.indexOf(tk, i + tk.length)) if (i === 0 || !/[a-z0-9]/.test(n[i - 1])) for (let k = i; k < i + tk.length; k++) marc[mapa[k]] = true;
    let out = '', on = false;
    for (let i = 0; i < t.length; i++) { if (marc[i] !== on) { out += marc[i] ? '<mark>' : '</mark>'; on = marc[i]; } out += esc(t[i]); }
    return out + (on ? '</mark>' : '');
  };
  const ORDEM = ['Reportagens', 'Guias de campo', 'Laboratório', 'Modelos para baixar', 'Seções'], TETO = { Reportagens: 6 };
  const desenhaBusca = q => {
    const res = $('.paleta-res', paleta), ts = norm(q).split(/\s+/).filter(Boolean);
    let grupos;
    if (!ts.length) grupos = [['Atalhos', indice.filter(x => x.g === 'Seções')]];
    else {
      const achados = indice.map(x => { let pt = 0; for (const t of ts) { if (!x.b.includes(t)) return null; const i = x.nt.indexOf(t); pt += i < 0 ? 1 : i === 0 || x.nt[i - 1] === ' ' ? 14 : 8; } return { x, pt }; }).filter(Boolean).sort((a, b) => b.pt - a.pt);
      const por = {}; let total = 0;
      for (const { x } of achados) { const l = por[x.g] = por[x.g] || []; if (l.length < (TETO[x.g] || 4) && total < 16) { l.push(x); total++; } }
      grupos = ORDEM.filter(g => por[g]).map(g => [g, por[g]]);
    }
    let k = 0;
    const item = x => `<a class="paleta-item" role="option" id="pi-${k++}" href="${esc(x.u)}"><span class="paleta-ic">${ic(x.ic)}</span><span><b>${realca(x.t, ts)}</b>${x.d ? `<small>${esc(x.d)}</small>` : ''}</span><em>${esc(x.e)}</em></a>`;
    res.innerHTML = (ts.length ? '' : `<div class="paleta-grupo">Experimente</div><div class="paleta-sug">${['IA', 'ADKAR', 'carve-out', 'fadiga', 'cultura', 'RACI', 'due diligence'].map(s => `<button type="button" data-sug="${s}">${s}</button>`).join('')}</div>`)
      + (grupos.length ? grupos.map(([g, l]) => `<div class="paleta-grupo">${g}</div>${l.map(item).join('')}`).join('') : `<p class="paleta-vazio">Nada encontrado para "${esc(q)}". Tente outra palavra, como IA, carve-out ou RACI.</p>`);
    pAtivo = 0; marcaBusca(false); res.scrollTop = 0;
  };
  const marcaBusca = rola => {
    const its = $$('.paleta-item', paleta), campo = $('input', paleta);
    its.forEach((a, i) => { a.classList.toggle('ativo', i === pAtivo); a.setAttribute('aria-selected', String(i === pAtivo)); });
    if (its[pAtivo]) { campo.setAttribute('aria-activedescendant', its[pAtivo].id); if (rola) its[pAtivo].scrollIntoView({ block: 'nearest' }); } else campo.removeAttribute('aria-activedescendant');
  };
  const abreBusca = () => {
    if (!HTMLDialogElement.prototype.showModal) { location.href = RAIZ + 'index.html#radar'; return; }
    fechaLista();
    if (!paleta) {
      montaIndice();
      paleta = cria('dialog', 'paleta', `<label class="paleta-campo">${ic('busca')}<span class="vis-oculto">Buscar no site</span><input type="search" placeholder="Buscar reportagens, guias, ferramentas e modelos" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="paleta-res" aria-autocomplete="list"><kbd>Esc</kbd></label>
        <div class="paleta-res" id="paleta-res" role="listbox" aria-label="Resultados"></div>
        <footer class="paleta-pe"><span><kbd>↑</kbd><kbd>↓</kbd>navegar</span><span><kbd>Enter</kbd>abrir</span><span><kbd>/</kbd>buscar de qualquer página</span></footer>`);
      paleta.setAttribute('aria-label', 'Buscar no site');
      document.body.appendChild(paleta);
      const campo = $('input', paleta);
      campo.addEventListener('input', () => desenhaBusca(campo.value));
      campo.addEventListener('keydown', e => {
        const n = $$('.paleta-item', paleta).length;
        if (e.key === 'ArrowDown') { e.preventDefault(); pAtivo = n ? (pAtivo + 1) % n : 0; marcaBusca(true); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); pAtivo = n ? (pAtivo - 1 + n) % n : 0; marcaBusca(true); }
        else if (e.key === 'Enter') { e.preventDefault(); const a = $$('.paleta-item', paleta)[pAtivo]; if (a) a.click(); }
      });
      paleta.addEventListener('pointermove', e => { const a = e.target.closest('.paleta-item'); if (!a) return; const i = $$('.paleta-item', paleta).indexOf(a); if (i !== pAtivo) { pAtivo = i; marcaBusca(false); } });
      paleta.addEventListener('click', e => {
        if (e.target === paleta) return paleta.close();
        const sug = e.target.closest('[data-sug]');
        if (sug) { campo.value = sug.dataset.sug; desenhaBusca(campo.value); campo.focus(); }
        else if (e.target.closest('.paleta-item')) paleta.close();
      });
    }
    if (paleta.open) return;
    const campo = $('input', paleta); campo.value = ''; desenhaBusca('');
    paleta.showModal(); atualizaTrava(); campo.focus();
  };

  // ---------- cliques e teclado (um ouvinte para tudo) ----------
  document.addEventListener('click', e => {
    const el = e.target.closest ? e.target : null; if (!el) return;
    const bs = el.closest('[data-salvar]'); if (bs) { e.preventDefault(); return alternaSalvo(bs.dataset.salvar, bs); }
    const bl = el.closest('[data-ler-rapido]'); if (bl) { e.preventDefault(); const c = bl.closest('[data-slug]'); return abreFolha(c.dataset.slug, c); }
    const al = el.closest('a[data-ler]'); if (al && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.button) { e.preventDefault(); return abreFolha(al.dataset.ler, al); }
    if (el.closest('[data-abrir-busca]')) { e.preventDefault(); return abreBusca(); }
    if (el.closest('[data-abrir-lista]')) { e.preventDefault(); return alternaLista(); }
    if (painelLista && !el.closest('.lista-painel')) fechaLista();
  });
  document.addEventListener('keydown', e => {
    const digitando = e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]');
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); abreBusca(); }
    else if (e.key === '/' && !digitando && !e.ctrlKey && !e.metaKey && !e.altKey && !$('dialog[open]')) { e.preventDefault(); abreBusca(); }
    else if (e.key === 'Escape' && painelLista) fechaLista();
  });

  // ---------- menu do topo: pílula que acompanha o ponteiro ----------
  const nav = $('.nav');
  if (nav && fino) {
    const pil = cria('span', 'nav-pilula'); pil.setAttribute('aria-hidden', 'true'); nav.prepend(pil);
    const vai = a => { if (!a) { pil.style.opacity = 0; return; } pil.style.opacity = 1; pil.style.width = a.offsetWidth + 'px'; pil.style.transform = `translateX(${a.offsetLeft}px)`; };
    nav.addEventListener('pointerover', e => { const a = e.target.closest('a'); if (a) vai(a); });
    nav.addEventListener('pointerleave', () => vai(null));
    nav.addEventListener('focusin', e => vai(e.target.closest('a')));
    nav.addEventListener('focusout', () => vai(null));
  }

  // ---------- fileiras que deslizam com o mouse (com inércia) e setas ----------
  const fileira = el => {
    let baixo = false, x0 = 0, s0 = 0, v = 0, ux = 0, ut = 0, moveu = false, raf = 0;
    const encaixa = () => {   // para no começo do item mais próximo
      const itens = [...el.children], base = itens[0] ? itens[0].offsetLeft : 0;
      let alvo = el.scrollLeft, menor = Infinity;
      for (const it of itens) { const d = Math.abs(it.offsetLeft - base - el.scrollLeft); if (d < menor) { menor = d; alvo = it.offsetLeft - base; } }
      el.scrollTo({ left: alvo, behavior: calmo ? 'auto' : 'smooth' });
      setTimeout(() => el.classList.remove('pegando'), 420);
    };
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button) return; baixo = true; moveu = false; x0 = ux = e.clientX; s0 = el.scrollLeft; v = 0; ut = e.timeStamp; cancelAnimationFrame(raf); });
    addEventListener('pointermove', e => {
      if (!baixo) return;
      const dx = e.clientX - x0;
      if (!moveu) { if (Math.abs(dx) < 5) return; moveu = true; el.classList.add('pegando'); }
      el.scrollLeft = s0 - dx;
      const dt = e.timeStamp - ut; if (dt > 0) { v = (e.clientX - ux) / dt; ux = e.clientX; ut = e.timeStamp; }
    });
    addEventListener('pointerup', () => {
      if (!baixo) return; baixo = false; if (!moveu) return;
      const passo = () => { if (Math.abs(v) < 0.03 || calmo) return encaixa(); el.scrollLeft -= v * 16; v *= 0.94; raf = requestAnimationFrame(passo); };
      passo();
    });
    el.addEventListener('click', e => { if (moveu) { e.preventDefault(); e.stopPropagation(); moveu = false; } }, true);
    el.addEventListener('dragstart', e => e.preventDefault());
    const setas = $(`[data-trilho-setas="${el.dataset.trilho}"]`);
    if (setas) {
      const ant = $('[data-trilho-ant]', setas), prox = $('[data-trilho-prox]', setas);
      const estado = () => { ant.disabled = el.scrollLeft < 8; prox.disabled = el.scrollLeft > el.scrollWidth - el.clientWidth - 8; };
      const anda = d => el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: calmo ? 'auto' : 'smooth' });
      ant.addEventListener('click', () => anda(-1)); prox.addEventListener('click', () => anda(1));
      el.addEventListener('scroll', estado, { passive: true }); addEventListener('resize', estado); estado();
    }
  };
  $$('[data-trilho]').forEach(fileira);
  // livros: um toque vira a capa e mostra por que recomendo
  const est = $('.estante');
  if (est) est.classList.add('viva');
  if (est) est.addEventListener('click', e => {
    const b = e.target.closest('.livro-obj'); if (!b) return;
    const abre = b.getAttribute('aria-expanded') !== 'true';
    $$('.livro-obj[aria-expanded="true"]', est).forEach(x => x.setAttribute('aria-expanded', 'false'));
    b.setAttribute('aria-expanded', String(abre));
  });

  // ---------- régua de adoção ----------
  const rg = $('[data-regua]');
  if (rg) {
    const itens = $$('.regua-lista li', rg).map(li => ({ ...li.dataset })), n = itens.length, corpo = $('.regua-corpo', rg);
    if (n > 1) {
      const trilho = cria('div', 'regua-trilho', `<div class="regua-linha"><i></i></div><ol class="regua-marcas">${itens.map((m, i) => `<li style="--i:${i}"><button type="button" data-marca="${i}" tabindex="-1">${esc(m.nome)}</button></li>`).join('')}</ol><div class="regua-pessoa" role="slider" tabindex="0" aria-label="Posição da pessoa na régua de adoção" aria-valuemin="1" aria-valuemax="${n}">${ic('pessoa')}</div>`);
      trilho.style.setProperty('--ult', n - 1);
      const painel = cria('div', 'regua-painel', '<div class="regua-estado"><small>Onde a pessoa está</small><b></b><p></p></div><div class="regua-acao"><small>O que fazer</small><b></b><p></p></div>');
      painel.setAttribute('aria-live', 'polite');
      corpo.append(trilho, painel); rg.classList.add('viva');
      const pessoa = $('.regua-pessoa', trilho), linha = $('.regua-linha', trilho), marcas = $$('.regua-marcas li', trilho);
      let idx = -1;
      const mostra = i => {
        if (i === idx) return; idx = i; const m = itens[i];
        $('.regua-estado b', painel).textContent = m.nome; $('.regua-estado p', painel).textContent = m.estado;
        $('.regua-acao b', painel).textContent = m.acao; $('.regua-acao p', painel).textContent = m.como;
        pessoa.setAttribute('aria-valuenow', i + 1); pessoa.setAttribute('aria-valuetext', `${m.nome}. ${m.estado} O que fazer: ${m.acao}. ${m.como}`);
        marcas.forEach((li, k) => li.classList.toggle('aqui', k === i));
        painel.classList.remove('troca'); void painel.offsetWidth; painel.classList.add('troca');
      };
      const define = (i, suave) => { i = limita(i, 0, n - 1); trilho.classList.toggle('suave', suave !== false && !calmo); trilho.style.setProperty('--p', i / (n - 1)); mostra(i); };
      const fracao = e => { const r = linha.getBoundingClientRect(); return limita((e.clientX - r.left) / r.width); };
      const pega = e => {
        if (e.button || e.target.closest('button')) return;
        e.preventDefault(); pessoa.classList.add('pegando'); trilho.classList.remove('suave');
        const move = ev => { const t = fracao(ev); trilho.style.setProperty('--p', t.toFixed(4)); mostra(Math.round(t * (n - 1))); };
        const solta = ev => { removeEventListener('pointermove', move); removeEventListener('pointerup', solta); removeEventListener('pointercancel', solta); pessoa.classList.remove('pegando'); define(Math.round(fracao(ev) * (n - 1))); };
        addEventListener('pointermove', move); addEventListener('pointerup', solta); addEventListener('pointercancel', solta);
        move(e);
      };
      pessoa.addEventListener('pointerdown', pega); linha.addEventListener('pointerdown', pega);
      trilho.addEventListener('click', e => { const b = e.target.closest('[data-marca]'); if (b) define(Number(b.dataset.marca)); });
      pessoa.addEventListener('keydown', e => {
        const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
        if (d) { e.preventDefault(); define(idx + d); } else if (e.key === 'Home') { e.preventDefault(); define(0); } else if (e.key === 'End') { e.preventDefault(); define(n - 1); }
      });
      define(Number(rg.dataset.inicial) || 0, false);
    }
  }

  // ---------- manchetes: correm sozinhas e aceitam ser arrastadas ----------
  const tk = $('[data-ticker] .ticker-trilho');
  if (tk && !calmo) {
    const faixa = tk.parentElement, caixa = tk.closest('[data-ticker]');
    let x = 0, meio = 0, parado = false, arr = null, v = 0, moveu = false, na_tela = true, ult = performance.now();
    const mede = () => { meio = tk.scrollWidth / 2; };
    tk.style.animation = 'none'; mede(); addEventListener('resize', mede);
    const quadro = agora => {
      const dt = Math.min(48, agora - ult); ult = agora;
      if (na_tela && meio) {
        if (!arr) { if (Math.abs(v) > 0.02) { x += v * dt; v *= 0.94; } else if (!parado) x -= meio / 110000 * dt; }
        if (x <= -meio) x += meio; else if (x > 0) x -= meio;
        tk.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      requestAnimationFrame(quadro);
    };
    caixa.addEventListener('pointerenter', () => { parado = true; }); caixa.addEventListener('pointerleave', () => { parado = false; });
    caixa.addEventListener('focusin', () => { parado = true; }); caixa.addEventListener('focusout', () => { parado = false; });
    faixa.style.touchAction = 'pan-y';
    faixa.addEventListener('pointerdown', e => { if (e.button) return; arr = { x0: e.clientX, ux: e.clientX, ut: e.timeStamp }; moveu = false; v = 0; });
    addEventListener('pointermove', e => {
      if (!arr) return;
      if (!moveu && Math.abs(e.clientX - arr.x0) < 5) return;
      moveu = true; x += e.clientX - arr.ux;
      const dt = e.timeStamp - arr.ut; if (dt > 0) v = (e.clientX - arr.ux) / dt;
      arr.ux = e.clientX; arr.ut = e.timeStamp;
    });
    const solta = () => { arr = null; };
    addEventListener('pointerup', solta); addEventListener('pointercancel', solta);
    faixa.addEventListener('click', e => { if (moveu) { e.preventDefault(); e.stopPropagation(); moveu = false; } }, true);
    faixa.addEventListener('dragstart', e => e.preventDefault());
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { na_tela = es[0].isIntersecting; }).observe(caixa);
    requestAnimationFrame(quadro);
  }

  // ---------- radar: grade ou lista ----------
  const gradeRadar = $('[data-grade]'), visoes = $$('[data-visao]');
  if (gradeRadar && visoes.length) {
    const poe = v => { gradeRadar.classList.toggle('grade--lista', v === 'lista'); visoes.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.visao === v))); };
    visoes.forEach(b => b.addEventListener('click', () => { poe(b.dataset.visao); guarda.por('visao', b.dataset.visao); }));
    poe(guarda.ler('visao', 'grade'));
  }

  // ---------- página inicial: profundímetro (mapa das seções, em telas largas) ----------
  if (noInicio && 'IntersectionObserver' in window) {
    const NOMES = { capa: 'Capa da semana', radar: 'Radar mundial', ia: 'IA & Mudança', guias: 'Guias de campo', lab: 'Laboratório', videos: 'Vídeos', eventos: 'Eventos', mes: 'Posts do mês', estante: 'Sugestões', sobre: 'Quem escreve' };
    const secs = $$('main > section[id]').filter(s => NOMES[s.id]);
    if (secs.length > 2) {
      const fun = cria('nav', 'fundura', `<ol>${secs.map(s => `<li><a href="#${s.id}"><i></i><span>${NOMES[s.id]}</span></a></li>`).join('')}</ol><span class="fundura-m" aria-hidden="true">0 m</span>`);
      fun.setAttribute('aria-label', 'Seções desta página');
      document.body.appendChild(fun);
      const links = $$('a', fun), m = $('.fundura-m', fun), ab = $('.abertura'), rod = $('.rodape');
      const espia = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('aqui', a.hash === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(s => espia.observe(s));
      let marcado = false;
      const rola = () => {
        marcado = false;
        const max = document.documentElement.scrollHeight - innerHeight, fim = rod ? rod.getBoundingClientRect().top < innerHeight * 0.7 : false;
        fun.classList.toggle('visivel', (!ab || ab.getBoundingClientRect().bottom < innerHeight * 0.45) && !fim);
        m.textContent = Math.round(limita(max > 0 ? scrollY / max : 0) * 60) + ' m';
      };
      addEventListener('scroll', () => { if (!marcado) { marcado = true; requestAnimationFrame(rola); } }, { passive: true });
      rola();
    }
  }

  // ---------- páginas de post: barra de leitura, sumário e citação ----------
  const corpoPost = document.body.classList.contains('pg-post') && $('.art-corpo');
  if (corpoPost) {
    const slug = document.body.dataset.slug || '', min = Number(document.body.dataset.min) || 1, titulo = ($('.art-cab h1') || {}).textContent || document.title;
    const doca = cria('nav', 'doca', `<button type="button" class="doca-b doca-topo" data-d="topo" aria-label="Voltar ao topo" data-dica="Voltar ao topo"><svg class="doca-anel" viewBox="0 0 38 38" aria-hidden="true"><circle class="anel-f" cx="19" cy="19" r="16"/><circle class="anel-p" cx="19" cy="19" r="16" pathLength="100"/></svg>${ic('setaCima')}</button>
      <button type="button" class="doca-b doca-aa" data-d="aa" aria-label="Mudar o tamanho do texto" data-dica="Tamanho do texto">Aa</button>
      ${voz.ok ? `<button type="button" class="doca-b" data-d="ouvir" aria-pressed="false" aria-label="Ouvir" data-dica="Ouvir">${ic('som')}</button>` : ''}
      <button type="button" class="doca-b" data-d="foco" aria-pressed="false" aria-label="Modo foco" data-dica="Modo foco">${ic('foco')}</button>
      <button type="button" class="doca-b" data-salvar="${esc(slug)}" aria-pressed="false" aria-label="Guardar para ler depois" data-dica="Guardar">${ic('marcador', 'ic-cheio')}</button>
      <i class="doca-sep" aria-hidden="true"></i>
      <button type="button" class="doca-b" data-abrir-busca aria-label="Buscar no site" data-dica="Buscar">${ic('busca')}</button>`);
    doca.setAttribute('aria-label', 'Ferramentas de leitura');
    document.body.appendChild(doca);
    const bTopo = $('[data-d="topo"]', doca), TAM = [1, 1.12, 1.25], NOME_TAM = ['Texto no tamanho normal', 'Texto maior', 'Texto bem maior'];
    let tam = limita(guarda.ler('leitura', 0), 0, TAM.length - 1) | 0;
    const poeTam = () => document.documentElement.style.setProperty('--leitura', TAM[tam]);
    poeTam();
    const foco = on => { document.body.classList.toggle('foco', on); $('[data-d="foco"]', doca).setAttribute('aria-pressed', String(on)); if (on) avisa('Modo foco ligado. Esc para sair', 'foco'); };
    doca.addEventListener('click', e => {
      const b = e.target.closest('[data-d]'); if (!b) return;
      const d = b.dataset.d;
      if (d === 'topo') scrollTo({ top: 0, behavior: calmo ? 'auto' : 'smooth' });
      else if (d === 'aa') { tam = (tam + 1) % TAM.length; guarda.por('leitura', tam); poeTam(); avisa(NOME_TAM[tam], 'check'); }
      else if (d === 'foco') foco(!document.body.classList.contains('foco'));
      else if (d === 'ouvir') voz.alterna(corpoPost, on => { pintaOuvir(b)(on); doca.classList.toggle('falando', on); });
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('foco') && !$('dialog[open]')) foco(false); });
    // progresso, tempo que falta e "lido"
    let marcado = false;
    const rola = () => {
      marcado = false;
      const r = corpoPost.getBoundingClientRect(), p = limita((innerHeight * 0.5 - r.top) / r.height);
      doca.style.setProperty('--p', p.toFixed(3)); doca.classList.toggle('visivel', scrollY > 260);
      const falta = Math.ceil(min * (1 - p));
      bTopo.dataset.dica = p >= 0.98 ? 'Voltar ao topo' : `Voltar ao topo · ${falta === 1 ? 'falta 1 min' : 'faltam ' + falta + ' min'}`;
      if (p > 0.9) marcaLido(slug);
    };
    addEventListener('scroll', () => { if (!marcado) { marcado = true; requestAnimationFrame(rola); } }, { passive: true });
    rola();
    const rod = $('.rodape');
    if (rod && 'IntersectionObserver' in window) new IntersectionObserver(es => doca.classList.toggle('some', es[0].isIntersecting), { rootMargin: '0px 0px -60px 0px' }).observe(rod);
    // sumário, quando a matéria tem três ou mais partes
    const hs = $$(':scope > h2', corpoPost);
    if (hs.length >= 3) {
      hs.forEach((h, i) => { if (!h.id) h.id = 'parte-' + (i + 1); });
      const lis = hs.map(h => `<li><a href="#${h.id}">${esc(h.textContent)}</a></li>`).join(''), lado = $('.art-lado');
      if (lado) lado.prepend(cria('div', 'lado-caixa sumario', `<h2>Nesta página</h2><ol>${lis}</ol>`));
      corpoPost.prepend(cria('details', 'sumario-mob', `<summary>Nesta página</summary><ol class="sumario">${lis}</ol>`));
      if ('IntersectionObserver' in window) {
        const espia = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) $$('.sumario a').forEach(a => a.classList.toggle('aqui', a.hash === '#' + en.target.id)); }), { rootMargin: '-20% 0px -70% 0px' });
        hs.forEach(h => espia.observe(h));
      }
    }
    // selecionar um trecho oferece copiar como citação
    let cita = null;
    const tiraCita = () => { if (cita) { cita.remove(); cita = null; } };
    corpoPost.addEventListener('pointerup', () => setTimeout(() => {
      const sel = getSelection(), txt = String(sel).trim().replace(/\s+/g, ' ');
      if (!sel.rangeCount || txt.length < 12 || txt.length > 700 || !corpoPost.contains(sel.anchorNode)) return tiraCita();
      const r = sel.getRangeAt(0).getBoundingClientRect(); tiraCita();
      cita = cria('div', 'cita', `<button type="button" data-c="copiar">${ic('copia')}Copiar citação</button><button type="button" data-c="postar">${ic('linkedin')}Levar ao LinkedIn</button>`);
      cita.style.left = limita(r.left + r.width / 2, 150, innerWidth - 150) + scrollX + 'px'; cita.style.top = r.top + scrollY + 'px';
      cita.dataset.txt = txt; document.body.appendChild(cita);
    }, 10));
    document.addEventListener('pointerdown', e => { if (cita && !e.target.closest('.cita')) tiraCita(); });
    document.addEventListener('click', async e => {
      const b = e.target.closest('[data-c]'); if (!b || !cita) return;
      const url = location.href.split('#')[0], ok = await copia(`“${cita.dataset.txt}”\n${titulo} · Change Management World\n${url}`);
      if (b.dataset.c === 'postar') { window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url), '_blank', 'noopener'); avisa(ok ? 'Citação copiada: é só colar no post' : 'Abra o LinkedIn e cole o trecho', 'linkedin'); }
      else avisa(ok ? 'Citação copiada, com o link' : 'Não foi possível copiar', 'copia');
      tiraCita(); getSelection().removeAllRanges();
    });
  }

  // ---------- rótulo "arraste" que acompanha o ponteiro ----------
  if (fino && !calmo) {
    const cur = cria('div', 'cursor', `<span>${ic('mao')}<b></b></span>`); cur.setAttribute('aria-hidden', 'true'); document.body.appendChild(cur);
    const rot = $('b', cur); let ligado = false;
    document.addEventListener('pointermove', e => {
      const z = e.target.closest && e.target.closest('[data-cursor]');
      const vale = z && !z.dataset.cursorVisto && !e.buttons && !e.target.closest('a, button, input, [role="slider"]');
      if (vale) { cur.style.setProperty('--cx', e.clientX + 'px'); cur.style.setProperty('--cy', e.clientY + 'px'); if (rot.textContent !== z.dataset.cursor) rot.textContent = z.dataset.cursor; }
      if (!!vale !== ligado) { ligado = !!vale; cur.classList.toggle('on', ligado); }
    }, { passive: true });
    // depois do primeiro arraste, a dica daquela área não aparece mais
    document.addEventListener('pointerdown', e => { const z = e.target.closest && e.target.closest('[data-cursor]'); if (z) { z.dataset.cursorVisto = '1'; ligado = false; cur.classList.remove('on'); } }, { passive: true });
  }

  pinta();
  // link direto para uma leitura rápida: .../#ler/slug (ao abrir a página ou ao trocar só o endereço)
  const direto = () => {
    const m = /^#ler\/([\w-]+)$/.exec(location.hash);
    if (m && POST.has(m[1]) && !(folha && folha.open)) { history.replaceState({ cmwFolha: m[1] }, '', location.href); abreFolha(m[1], null, true); }
  };
  addEventListener('hashchange', direto); direto();
})();
