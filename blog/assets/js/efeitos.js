// Change Management World · efeitos da jornada (sem dependências).
// Galeria que desliza, ficha em foco, cartões que viram, fluxo BPMN, narrativa fixa, gráfico que se constrói
// pilha de livros num cartão que vira e cartões que inclinam com o cursor. Cada efeito só existe na página que tem o seu gancho (data-*),
// usa um requestAnimationFrame por tarefa e para quando sai da tela.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raiz = document.documentElement;
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cria = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
  const IC = {
    x: '<path d="M6 6l12 12M18 6L6 18"/>', seta: '<path d="M5 12h14M13 6l6 6-6 6"/>', setaEsq: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>', pausa: '<path d="M8.5 6v12M15.5 6v12" stroke-width="2.6"/>',
  };
  const ic = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
  const suave = calmo ? 'auto' : 'smooth';

  // ---------- galeria que desliza ----------
  // Rolagem nativa com encaixe; o mouse arrasta com inércia; setas, teclado, barra de posição e contagem.
  $$('[data-galeria]').forEach(g => {
    const trilho = $('.galeria-trilho', g), itens = [...trilho.children], n = itens.length; if (!n) return;
    const ant = $('[data-g-ant]', g), prox = $('[data-g-prox]', g), barra = $('.galeria-barra i', g), conta = $('.galeria-conta', g);
    const centro = g.classList.contains('galeria--centro');
    let pos = [], max = 0, larg = 0, atual = -1, marcado = false;
    const alvoDe = i => centro ? pos[i] - (larg - itens[i].offsetWidth) / 2 : pos[i];
    const mede = () => {
      if (centro) trilho.style.paddingInline = Math.max(16, (trilho.clientWidth - itens[0].offsetWidth) / 2) + 'px';
      larg = trilho.clientWidth; max = Math.max(0, trilho.scrollWidth - larg);
      const base = itens[0].offsetLeft; pos = itens.map(it => it.offsetLeft - base + (centro ? parseFloat(trilho.style.paddingInline) : 0));
      if (!centro) pos = itens.map(it => it.offsetLeft - base);
    };
    const pinta = () => {
      marcado = false;
      const s = trilho.scrollLeft; let i = 0, menor = Infinity;
      for (let k = 0; k < n; k++) { const d = Math.abs(Math.min(max, Math.max(0, alvoDe(k))) - s); if (d < menor - .5) { menor = d; i = k; } }
      if (barra) { barra.style.setProperty('--pos', max > 0 ? (s / max).toFixed(4) : '0'); barra.style.setProperty('--tam', (trilho.scrollWidth > 0 ? Math.min(1, larg / trilho.scrollWidth) : 1).toFixed(4)); }
      if (ant) ant.disabled = s < 4; if (prox) prox.disabled = s > max - 4;
      if (i === atual) return; atual = i;
      if (centro) itens.forEach((it, k) => it.classList.toggle('centro', k === i));
      if (conta) conta.textContent = `${i + 1} / ${n}`;
    };
    const pede = () => { if (!marcado) { marcado = true; requestAnimationFrame(pinta); } };
    const vai = (i, liso = true) => trilho.scrollTo({ left: Math.min(max, Math.max(0, alvoDe(Math.min(n - 1, Math.max(0, i))))), behavior: liso ? suave : 'auto' });
    // por página nas galerias comuns; item a item na galeria com foco no centro
    const anda = d => { if (centro) return vai(atual + d); let k = atual; const alvo = trilho.scrollLeft + d * larg * .8; if (d > 0) { while (k < n - 1 && pos[k] < alvo - 4) k++; } else { while (k > 0 && pos[k] > alvo + 4) k--; } vai(k === atual ? atual + d : k); };
    if (ant) ant.addEventListener('click', () => anda(-1));
    if (prox) prox.addEventListener('click', () => anda(1));
    trilho.addEventListener('keydown', e => { if (e.target !== trilho) return; if (e.key === 'ArrowRight') { e.preventDefault(); vai(atual + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); vai(atual - 1); } });
    trilho.addEventListener('scroll', pede, { passive: true });
    let tRed = 0; addEventListener('resize', () => { clearTimeout(tRed); tRed = setTimeout(() => { mede(); atual = -1; pede(); }, 140); }, { passive: true });
    // arrastar com o mouse (o toque usa a rolagem nativa)
    let baixo = false, moveu = false, x0 = 0, s0 = 0, v = 0, ux = 0, ut = 0, raf = 0;
    const encaixa = () => {
      let i = 0, menor = Infinity; const s = trilho.scrollLeft;
      for (let k = 0; k < n; k++) { const d = Math.abs(Math.min(max, Math.max(0, alvoDe(k))) - s); if (d < menor) { menor = d; i = k; } }
      vai(i); setTimeout(() => trilho.classList.remove('pegando'), calmo ? 0 : 420);
    };
    trilho.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button) return; baixo = true; moveu = false; x0 = ux = e.clientX; s0 = trilho.scrollLeft; v = 0; ut = e.timeStamp; cancelAnimationFrame(raf); });
    addEventListener('pointermove', e => {
      if (!baixo) return;
      const dx = e.clientX - x0;
      if (!moveu) { if (Math.abs(dx) < 6) return; moveu = true; trilho.classList.add('pegando'); }
      trilho.scrollLeft = s0 - dx;
      const dt = e.timeStamp - ut; if (dt > 0) { v = .8 * (e.clientX - ux) / dt + .2 * v; ux = e.clientX; ut = e.timeStamp; }
    }, { passive: true });
    const solta = () => {
      if (!baixo) return; baixo = false; if (!moveu) return;
      v = Math.max(-2.2, Math.min(2.2, v));
      const passo = () => { if (Math.abs(v) < .04 || calmo) return encaixa(); trilho.scrollLeft -= v * 16; v *= .93; raf = requestAnimationFrame(passo); };
      passo();
    };
    addEventListener('pointerup', solta); addEventListener('pointercancel', solta);
    trilho.addEventListener('click', e => { if (moveu) { e.preventDefault(); e.stopPropagation(); moveu = false; } }, true);
    trilho.addEventListener('dragstart', e => e.preventDefault());
    g.classList.add('viva'); mede();
    const inicio = Number(g.dataset.inicio || 0);
    if (inicio > 0) vai(inicio, false);
    pinta();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { mede(); if (inicio > 0 && trilho.scrollLeft < 4) vai(inicio, false); atual = -1; pede(); });
  });

  // ---------- ficha em foco ----------
  // O cartão abre a ficha completa num painel que cresce a partir dele; o fundo escurece e desfoca.
  const fichas = $$('.ficha[data-det]');
  if (fichas.length && 'showModal' in document.createElement('dialog')) {
    const ids = fichas.map(f => f.dataset.det);
    const dlg = cria('dialog', 'foco', `<div class="foco-painel" tabindex="-1"><button type="button" class="foco-x" data-foco-x aria-label="Fechar a ficha">${ic('x')}</button><div class="foco-corpo"></div><div class="foco-nav"><button type="button" data-foco-ant>${ic('setaEsq')}<span>Anterior</span></button><span data-foco-conta></span><button type="button" data-foco-prox><span>Próximo</span>${ic('seta')}</button></div></div>`);
    dlg.setAttribute('aria-label', 'Ficha do serviço');
    document.body.appendChild(dlg);
    const painel = $('.foco-painel', dlg), corpo = $('.foco-corpo', dlg), contaF = $('[data-foco-conta]', dlg);
    let aberto = -1, origem = null;
    const enche = i => {
      aberto = i; const c = fichas[i].cloneNode(true); c.removeAttribute('id');
      corpo.replaceChildren(c); contaF.textContent = `${i + 1} de ${ids.length}`; painel.scrollTop = 0;
      const t = $('h3', c); if (t) dlg.setAttribute('aria-label', 'Ficha do serviço: ' + t.textContent);
    };
    const abre = (id, de) => {
      const i = ids.indexOf(id); if (i < 0) return;
      enche(i);
      if (dlg.open) return;
      origem = de || $(`[data-foco="${id}"]`);
      dlg.classList.remove('saindo'); dlg.showModal(); raiz.classList.add('trava');
      // o painel cresce a partir do centro do cartão que foi clicado
      if (origem) { const r = origem.getBoundingClientRect(), w = painel.offsetWidth, h = painel.offsetHeight, l = (innerWidth - w) / 2, t = (innerHeight - h) / 2; painel.style.setProperty('--ox', Math.min(w, Math.max(0, r.left + r.width / 2 - l)) + 'px'); painel.style.setProperty('--oy', Math.min(h, Math.max(0, r.top + r.height / 2 - t)) + 'px'); }
      painel.focus({ preventScroll: true });
      try { history.replaceState(null, '', '#servico-' + id); } catch { /* sem histórico: a ficha abre do mesmo jeito */ }
    };
    const fecha = () => {
      if (!dlg.open || dlg.classList.contains('saindo')) return;
      dlg.classList.add('saindo');
      setTimeout(() => { dlg.classList.remove('saindo'); dlg.close(); }, calmo ? 0 : 180);
    };
    dlg.addEventListener('close', () => {
      raiz.classList.remove('trava');
      try { history.replaceState(null, '', location.pathname + location.search); } catch { /* idem */ }
      if (origem && origem.isConnected) origem.focus({ preventScroll: true });
    });
    dlg.addEventListener('cancel', e => { e.preventDefault(); fecha(); });
    dlg.addEventListener('click', e => {
      if (e.target === dlg || e.target.closest('[data-foco-x]')) return fecha();
      if (e.target.closest('[data-foco-ant]')) return enche((aberto - 1 + ids.length) % ids.length);
      if (e.target.closest('[data-foco-prox]')) return enche((aberto + 1) % ids.length);
    });
    dlg.addEventListener('keydown', e => { if (e.key === 'ArrowRight') enche((aberto + 1) % ids.length); else if (e.key === 'ArrowLeft') enche((aberto - 1 + ids.length) % ids.length); });
    document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-foco]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); abre(a.dataset.foco, a); });
    const doEndereco = () => { const m = /^#servico-(.+)$/.exec(location.hash); if (m && ids.includes(m[1])) abre(m[1]); };
    addEventListener('hashchange', doEndereco); doEndereco();
  }

  // ---------- prévia dos modelos ----------
  // Antes do formulário de download, a pessoa vê as primeiras páginas reais do arquivo.
  const brutoPrevias = $('[data-previas-dados]');
  if (brutoPrevias && 'showModal' in document.createElement('dialog')) {
    let PV = {}; try { PV = JSON.parse(brutoPrevias.textContent); } catch { /* sem prévias: os botões não fazem nada */ }
    const dlg = cria('dialog', 'foco foco--previa', `<div class="foco-painel" tabindex="-1"><button type="button" class="foco-x" data-foco-x aria-label="Fechar a prévia">${ic('x')}</button><header class="previa-cab"><small></small><h3></h3><p></p></header><div class="previa-paginas"></div><footer class="previa-pe"><button type="button" class="btn btn--p" data-previa-baixar>Baixar este modelo</button><button type="button" class="btn btn--s" data-foco-x>Fechar</button></footer></div>`);
    document.body.appendChild(dlg);
    const painel = $('.foco-painel', dlg); let origem = null, idAtual = '';
    const fecha = depois => { if (!dlg.open || dlg.classList.contains('saindo')) return; dlg.classList.add('saindo'); setTimeout(() => { dlg.classList.remove('saindo'); dlg.close(); if (depois) depois(); }, calmo ? 0 : 180); };
    dlg.addEventListener('close', () => { raiz.classList.remove('trava'); if (origem && origem.isConnected) origem.focus({ preventScroll: true }); });
    dlg.addEventListener('cancel', e => { e.preventDefault(); fecha(); });
    dlg.addEventListener('click', e => {
      if (e.target === dlg || e.target.closest('[data-foco-x]')) return fecha();
      if (e.target.closest('[data-previa-baixar]')) { const b = $(`[data-baixar="${idAtual}"]`); origem = b || origem; fecha(() => { if (b) b.click(); }); }
    });
    document.addEventListener('click', e => {
      const b = e.target.closest ? e.target.closest('[data-previa]') : null; if (!b) return;
      const d = PV[b.dataset.previa]; if (!d) return;
      e.preventDefault(); origem = b; idAtual = b.dataset.previa;
      $('.previa-cab small', dlg).textContent = d.o; $('.previa-cab h3', dlg).textContent = d.n; $('.previa-cab p', dlg).textContent = `${d.f ? d.f + '. ' : ''}Primeiras páginas do arquivo.`;
      $('.previa-paginas', dlg).replaceChildren(...d.i.map((x, k) => { const im = cria('img'); im.src = x.s; im.width = x.l; im.height = x.a; im.alt = `Página ${k + 1} de ${d.n}`; im.loading = k ? 'lazy' : 'eager'; im.decoding = 'async'; return im; }));
      dlg.setAttribute('aria-label', 'Prévia de ' + d.n); painel.scrollTop = 0;
      dlg.classList.remove('saindo'); dlg.showModal(); raiz.classList.add('trava');
      const r = b.getBoundingClientRect(), w = painel.offsetWidth, h = painel.offsetHeight;
      painel.style.setProperty('--ox', Math.min(w, Math.max(0, r.left + r.width / 2 - (innerWidth - w) / 2)) + 'px'); painel.style.setProperty('--oy', Math.min(h, Math.max(0, r.top + r.height / 2 - (innerHeight - h) / 2)) + 'px');
      painel.focus({ preventScroll: true });
    });
  }

  // ---------- cartões que viram ----------
  const vira = (b, estado) => {
    const novo = estado === undefined ? b.getAttribute('aria-pressed') !== 'true' : estado;
    if (String(novo) === b.getAttribute('aria-pressed')) return;
    b.setAttribute('aria-pressed', String(novo));
    if (!calmo) { b.classList.add('girando'); setTimeout(() => b.classList.remove('girando'), 720); }
  };
  document.addEventListener('click', e => {
    const el = e.target.closest ? e.target : null; if (!el) return;
    const v = el.closest('.virada'); if (v) return vira(v);
    const todos = el.closest('[data-virar-todos]');
    if (todos) {
      const grupo = $('[data-viradas]', todos.closest('section') || document); if (!grupo) return;
      const cs = $$('.virada', grupo), abrir = cs.some(c => c.getAttribute('aria-pressed') !== 'true');
      cs.forEach((c, i) => setTimeout(() => vira(c, abrir), calmo ? 0 : i * 120));
      todos.setAttribute('aria-pressed', String(abrir));
      const rot = $('span', todos); if (rot) rot.textContent = abrir ? 'Desvirar todos' : 'Virar todos';
    }
  });

  // ---------- fluxo BPMN ----------
  // A ficha percorre as ligações, acende cada tarefa e, na decisão, volta uma vez antes de seguir.
  const fx = $('[data-fluxo]');
  if (fx) {
    const svg = $('.fluxo-svg', fx), ficha = $('.fx-ficha', svg), legenda = $('[data-fx-legenda]', fx), rol = $('.fluxo-rolagem', fx);
    const bTocar = $('[data-fx="tocar"]', fx), bPasso = $('[data-fx="passo"]', fx), bVeloz = $('[data-fx="veloz"]', fx);
    const no = id => $(`[data-no="${id}"]`, svg), feita = id => $(`[data-feita="${id}"]`, svg);
    const txt = {}; $$('.fluxo-lista li', fx).forEach(li => { txt[li.dataset.passo] = { t: $('b', li).textContent, r: $('small', li).textContent, d: $('em', li).textContent }; });
    txt.ini = { t: 'Início', r: txt.t0.r, d: 'O projeto começa quando alguém decide que a mudança é necessária.' };
    txt.fim = { t: 'Mudança adotada', r: txt.t6.r, d: 'O ciclo fecha quando o uso vira rotina. E recomeça na próxima onda.' };
    const ROTEIRO = ['ini', 'c-ini', 't0', 'c-0', 't1', 'c-1', 't2', 'c-2', 't3', 'c-3', 't4', 'c-4', 't5', 'c-5', 'gw', 'c-nao', 't4', 'c-4', 't5', 'c-5', 'gw', 'c-sim', 't6', 'c-fim', 'fim'];
    const VELS = [1, 1.6, 2.4], PXS = 250, PAUSA = 1100;
    const caminho = {}, comp = {};
    for (const id of new Set(ROTEIRO.filter(x => x.startsWith('c-')))) { caminho[id] = $('#' + id, svg); comp[id] = caminho[id].getTotalLength(); }
    const vb = svg.viewBox.baseVal;
    let k = 0, tocando = false, vis = false, iv = 0, raf = 0, espera = 0, t0 = 0, dur = 0, parar = false, visitasGw = 0, andando = false;
    const poe = (x, y) => {
      ficha.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      if (rol.scrollWidth > rol.clientWidth + 4) { const esc = svg.clientWidth / vb.width; rol.scrollLeft = x * esc - rol.clientWidth / 2; }   // em tela estreita, a rolagem acompanha a ficha
    };
    const centroDe = id => { const b = no(id).firstElementChild.getBBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
    const diz = id => {
      const t = txt[id]; if (!t) return;
      let d = t.d; if (id === 'gw') d = visitasGw < 2 ? 'Ainda não: o caminho volta para capacitação e prática.' : 'Sim: a mudança segue para o reforço.';
      legenda.innerHTML = `<b></b><span></span>`; legenda.firstChild.textContent = `${t.r} · ${t.t}`; legenda.lastChild.textContent = d;
    };
    const zera = () => {
      k = 0; visitasGw = 0;
      $$('.fx-no', svg).forEach(g => g.classList.remove('ativo', 'feito'));
      $$('.fx-feitas path', svg).forEach(p => { p.style.strokeDashoffset = '1'; });
      const [x, y] = centroDe('ini'); poe(x, y); ficha.classList.remove('some'); no('ini').classList.add('ativo'); diz('ini');
    };
    const chega = id => {   // a ficha parou num nó
      $$('.fx-no.ativo', svg).forEach(g => { g.classList.remove('ativo'); g.classList.add('feito'); });
      if (id === 'gw') visitasGw++;
      const g = no(id); g.classList.remove('feito'); g.classList.add('ativo'); diz(id);
      const [x, y] = centroDe(id); poe(x, y); ficha.classList.add('some');
    };
    const botao = () => { bTocar.setAttribute('aria-pressed', String(tocando)); bTocar.innerHTML = `${ic(tocando ? 'pausa' : 'play')}<span>${tocando ? 'Pausar' : k >= ROTEIRO.length - 1 ? 'Recomeçar' : 'Reproduzir'}</span>`; };
    const agenda = ms => { clearTimeout(espera); espera = setTimeout(avanca, ms); };
    const quadro = agora => {
      const id = ROTEIRO[k], u = Math.min(1, (agora - t0) / dur), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const p = caminho[id].getPointAtLength(comp[id] * e); poe(p.x, p.y);
      feita(id).style.strokeDashoffset = String(1 - e);
      if (u < 1) { raf = requestAnimationFrame(quadro); return; }
      raf = 0; andando = false; k++; chega(ROTEIRO[k]);
      if (parar) { parar = false; tocando = false; botao(); return; }
      if (tocando) agenda(k >= ROTEIRO.length - 1 ? 4200 : PAUSA / VELS[iv]);
      else botao();
    };
    function avanca() {   // sai do nó atual e percorre a próxima ligação
      if (andando) return;
      if (k >= ROTEIRO.length - 1) zera();
      const id = ROTEIRO[k + 1];
      if (calmo) { k += 2; feita(id).style.strokeDashoffset = '0'; chega(ROTEIRO[k]); botao(); return; }
      k++; andando = true; ficha.classList.remove('some'); t0 = performance.now(); dur = Math.max(380, comp[id] / (PXS * VELS[iv]) * 1000);
      raf = requestAnimationFrame(quadro);
    }
    const pausa = () => { tocando = false; clearTimeout(espera); if (andando) parar = true; botao(); };
    const toca = () => { tocando = true; parar = false; botao(); if (!andando) agenda(k === 0 ? 500 : 60); };
    bTocar.addEventListener('click', () => (tocando ? pausa() : toca()));
    bPasso.addEventListener('click', () => { clearTimeout(espera); if (andando) { parar = true; tocando = false; botao(); return; } tocando = false; parar = !calmo; avanca(); botao(); });
    bVeloz.addEventListener('click', () => { iv = (iv + 1) % VELS.length; const r = String(VELS[iv]).replace('.', ','); $('b', bVeloz).textContent = r + '×'; bVeloz.setAttribute('aria-label', `Velocidade: ${r} vez${VELS[iv] > 1 ? 'es' : ''}`); });
    zera(); botao();
    // começa sozinho quando entra na tela e descansa quando sai, quando a aba some ou quando há um diálogo aberto
    let jaTocou = false;
    const confere = () => {
      const pode = vis && !document.hidden && !raiz.classList.contains('trava');
      if (!pode && tocando) { pausa(); fx.dataset.volta = '1'; }
      else if (pode && fx.dataset.volta) { delete fx.dataset.volta; toca(); }
      else if (pode && !jaTocou && !calmo) { jaTocou = true; toca(); }
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis = es[0].isIntersecting; confere(); }, { threshold: .35 }).observe(fx); else { vis = true; confere(); }
    document.addEventListener('visibilitychange', confere);
    new MutationObserver(confere).observe(raiz, { attributes: true, attributeFilter: ['class'] });
  }

  // ---------- narrativa fixa ----------
  // O painel fica parado; conforme cada fase cruza o meio da tela, o marcador anda pela trilha e o texto troca.
  const hs = $('[data-historia]');
  if (hs) {
    const passos = $$('.historia-passo', hs), n = passos.length, base = $('.trilha-base', hs), feita = $('.trilha-feita', hs), marca = $('.trilha-marca', hs), paradas = $$('.trilha-parada', hs);
    const elN = $('[data-h-n]', hs), elNome = $('[data-h-nome]', hs), elFrase = $('[data-h-frase]', hs), elEnt = $('[data-h-entregas]', hs), barra = $('.historia-barra i', hs), botoes = $$('[data-h-ir]', hs);
    const L = base.getTotalLength(), fr = i => (n > 1 ? i / (n - 1) : 0);
    paradas.forEach((c, i) => { const p = base.getPointAtLength(L * fr(i)); c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); });
    const check = $('.historia-entregas .ic', hs), icCheck = check ? check.outerHTML : '';
    let atual = -1, u = 0, raf = 0;
    const poe = v => { u = v; const p = base.getPointAtLength(L * v); marca.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); feita.style.strokeDashoffset = String(1 - v); };
    const vai = i => {
      if (i === atual || i < 0 || i >= n) return; atual = i;
      const d = passos[i].dataset;
      elN.textContent = i + 1; elNome.textContent = d.nome; elFrase.textContent = d.frase;
      elEnt.innerHTML = JSON.parse(d.entregas).map(() => `<li>${icCheck}<span></span></li>`).join(''); $$('span', elEnt).forEach((s, j) => { s.textContent = JSON.parse(d.entregas)[j]; });
      passos.forEach((p, j) => p.classList.toggle('ativo', j === i));
      paradas.forEach((c, j) => c.classList.toggle('feita', j <= i));
      botoes.forEach((b, j) => { if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      barra.style.setProperty('--p', ((i + 1) / n).toFixed(3));
      cancelAnimationFrame(raf);
      const de = u, para = fr(i), t0 = performance.now();
      if (calmo) return poe(para);
      const anda = t => { const k = Math.min(1, (t - t0) / 650), e = 1 - Math.pow(1 - k, 3); poe(de + (para - de) * e); if (k < 1) raf = requestAnimationFrame(anda); };
      raf = requestAnimationFrame(anda);
    };
    hs.classList.add('viva'); poe(0); vai(0);
    if ('IntersectionObserver' in window) { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) vai(Number(e.target.dataset.i)); }), { rootMargin: '-46% 0px -46% 0px' }); passos.forEach(p => o.observe(p)); }
    botoes.forEach(b => b.addEventListener('click', () => passos[Number(b.dataset.hIr)].scrollIntoView({ block: 'center', behavior: suave })));
  }

  // ---------- gráfico que se constrói ----------
  $$('[data-grafico]').forEach(gr => {
    const monta = () => gr.classList.add('monta');
    if (calmo || !('IntersectionObserver' in window)) monta();
    else { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { monta(); o.disconnect(); } }, { threshold: .4 }); o.observe(gr); }
    const rep = $('[data-gr-repetir]', gr.closest('section') || document);
    if (rep) rep.addEventListener('click', () => { gr.classList.remove('monta'); void gr.getBoundingClientRect(); requestAnimationFrame(() => requestAnimationFrame(monta)); });
  });

  // ---------- estante: pilha de livros num cartão que vira ----------
  // Os livros ficam um atrás do outro. Arrastar o da frente (ou usar as setas) passa para o próximo;
  // tocar nele vira o cartão e mostra a página de contexto: o livro em três ideias e a leitura do autor.
  const lv = $('[data-livros]');
  if (lv) {
    const itens = $$('.pilha-item', lv), n = itens.length, bruto = $('[data-livros-dados]', lv);
    let dados = []; try { dados = JSON.parse(bruto.textContent); } catch { /* sem dados: a pilha só mostra as capas */ }
    if (n > 1 && dados.length === n) {
      lv.classList.add('viva');
      const q = sel => $(sel, lv), frente = q('.livros-frente'), verso = q('.livros-verso'), fala = q('.estante-fala'), marcos = $$('[data-l-ir]', lv);
      let ordem = itens.map((_, i) => i), virado = false, ocupado = false;
      const conta = i => {
        const d = dados[i];
        q('[data-l-n]').textContent = String(i + 1).padStart(2, '0'); q('[data-l-pergunta]').textContent = d.p; q('[data-l-titulo]').textContent = d.t; q('[data-l-autor]').textContent = d.a;
        marcos.forEach((m, k) => { m.classList.toggle('feito', k < i); if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current'); });
        if (!calmo) { fala.classList.remove('troca'); void fala.offsetWidth; fala.classList.add('troca'); }
        if (virado) enche(i);
      };
      const enche = i => {   // página de contexto do livro i
        const d = dados[i];
        q('[data-l-titulo2]').textContent = d.t; q('[data-l-autor2]').textContent = d.a; q('[data-l-conta2]').textContent = `livro ${i + 1} de ${n}`;
        q('[data-l-capa]').innerHTML = d.c ? `<img src="${d.c}" alt="" width="96" height="144">` : '';
        const ol = q('[data-l-ideias]'); ol.replaceChildren(...d.i.map(t => { const li = cria('li'); li.textContent = t; return li; }));
        q('[data-l-leitura]').textContent = d.l;
        const f = q('[data-l-fonte]'); f.hidden = !d.f; if (d.f) f.href = d.f;
      };
      const pinta = () => {
        ordem.forEach((idx, k) => {
          const li = itens[idx]; li.style.setProperty('--k', k); li.style.zIndex = String(n - k);
          li.classList.toggle('na-frente', k === 0); li.classList.toggle('longe', k > 3);
          const b = li.firstElementChild; b.tabIndex = k === 0 ? 0 : -1; if (k === 0) li.removeAttribute('aria-hidden'); else li.setAttribute('aria-hidden', 'true');
        });
        conta(ordem[0]);
      };
      const passa = (d, lado) => {   // d = 1 leva o livro da frente para o fundo; d = -1 traz o do fundo para a frente
        if (ocupado) return;
        if (calmo || virado) { if (d > 0) ordem.push(ordem.shift()); else ordem.unshift(ordem.pop()); return pinta(); }
        ocupado = true;
        const li = itens[d > 0 ? ordem[0] : ordem[n - 1]];
        if (d > 0) {
          li.style.setProperty('--dx', (lado || 1) * 130 + '%'); li.classList.add('voa');
          setTimeout(() => { ordem.push(ordem.shift()); li.classList.add('sem-anim'); li.classList.remove('voa'); pinta(); void li.offsetWidth; li.classList.remove('sem-anim'); ocupado = false; }, 320);
        } else {
          li.classList.add('sem-anim', 'voa'); li.style.setProperty('--dx', '-130%'); ordem.unshift(ordem.pop()); pinta(); void li.offsetWidth;
          li.classList.remove('sem-anim'); requestAnimationFrame(() => { li.classList.remove('voa'); setTimeout(() => { ocupado = false; }, 400); });
        }
      };
      const ate = i => { if (ocupado) return; while (ordem[0] !== i) ordem.push(ordem.shift()); pinta(); };
      const vira = abre => {
        if (abre === virado) return; virado = abre;
        if (abre) enche(ordem[0]);
        lv.classList.toggle('virado', abre);
        if (!calmo) { lv.classList.add('girando'); setTimeout(() => lv.classList.remove('girando'), 720); }
        frente.toggleAttribute('inert', abre); frente.setAttribute('aria-hidden', String(abre));
        verso.toggleAttribute('inert', !abre); verso.setAttribute('aria-hidden', String(!abre));
        setTimeout(() => (abre ? q('[data-l-voltar]') : itens[ordem[0]].firstElementChild).focus({ preventScroll: true }), calmo ? 0 : 380);
      };
      // arrastar o livro da frente: acompanha o ponteiro com leve giro; solto além de 80 px, vai para o fundo da pilha
      const lista = q('.pilha-lista');
      let arr = null;
      lista.addEventListener('pointerdown', e => { const li = e.target.closest('.pilha-item.na-frente'); if (!li || e.button || ocupado) return; arr = { li, x: e.clientX, dx: 0, moveu: false, id: e.pointerId }; });
      addEventListener('pointermove', e => {
        if (!arr) return;
        arr.dx = e.clientX - arr.x;
        if (!arr.moveu) { if (Math.abs(arr.dx) < 8) return; arr.moveu = true; arr.li.classList.add('pegando'); try { arr.li.setPointerCapture(arr.id); } catch { /* segue sem captura */ } }
        arr.li.style.setProperty('--ax', arr.dx.toFixed(1) + 'px'); arr.li.style.setProperty('--ar', (arr.dx / 18).toFixed(2) + 'deg');
      }, { passive: true });
      const solta = () => {
        if (!arr) return; const a = arr; arr = null;
        a.li.classList.remove('pegando'); a.li.style.removeProperty('--ax'); a.li.style.removeProperty('--ar');
        if (a.moveu && Math.abs(a.dx) > 80) passa(1, Math.sign(a.dx));
        if (a.moveu) { lista.dataset.arrastou = '1'; setTimeout(() => { delete lista.dataset.arrastou; }, 60); }
      };
      addEventListener('pointerup', solta); addEventListener('pointercancel', solta);
      lista.addEventListener('dragstart', e => e.preventDefault());
      lv.addEventListener('click', e => {
        const el = e.target;
        if (el.closest('.capa-livro')) { if (lista.dataset.arrastou) return; return el.closest('.pilha-item.na-frente') ? vira(true) : null; }
        if (el.closest('[data-l-abrir]')) return vira(true);
        if (el.closest('[data-l-voltar]')) return vira(false);
        if (el.closest('[data-l-ant], [data-l-ant2]')) return passa(-1);
        if (el.closest('[data-l-prox], [data-l-prox2]')) return passa(1, -1);
        const m = el.closest('[data-l-ir]'); if (m) ate(Number(m.dataset.lIr));
      });
      lv.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); passa(1, -1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); passa(-1); }
        else if (e.key === 'Escape' && virado) { e.preventDefault(); vira(false); }
      });
      pinta();
    }
  }

  // ---------- cartão de contato: "Salvar contato" baixa um arquivo .vcf ----------
  document.addEventListener('click', e => {
    const b = e.target.closest ? e.target.closest('[data-salvar-contato]') : null; if (!b) return;
    const d = b.dataset, lim = t => String(t || '').replace(/([,;\\])/g, '\\$1'), [prim, ...resto] = d.nome.split(' ');
    const v = ['BEGIN:VCARD', 'VERSION:3.0', `N:${lim(resto.join(' '))};${lim(prim)};;;`, `FN:${lim(d.nome)}`, d.papel ? `TITLE:${lim(d.papel)}` : '', d.tel ? `TEL;TYPE=CELL:${d.tel}` : '', d.linkedin ? `URL:${d.linkedin}` : '', d.site ? `URL:${d.site}` : '', 'END:VCARD'].filter(Boolean).join('\r\n');
    const a = cria('a'); a.href = URL.createObjectURL(new Blob([v], { type: 'text/vcard;charset=utf-8' }));
    a.download = d.nome.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-') + '.vcf';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });

  // ---------- cartões que inclinam com o cursor (perspectiva, reflexo que segue o ponteiro) ----------
  if (!calmo && matchMedia('(pointer: fine)').matches) {
    let alvo = null, cx = 0, cy = 0, marcado = false, caixa = null;
    const pinta = () => {
      marcado = false; if (!alvo || !caixa) return;
      const px = Math.min(1, Math.max(0, (cx - caixa.left) / caixa.width)), py = Math.min(1, Math.max(0, (cy - caixa.top) / caixa.height));
      alvo.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg'); alvo.style.setProperty('--rx', ((.5 - py) * 9).toFixed(2) + 'deg');
      alvo.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); alvo.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    };
    const sai = () => { if (!alvo) return; alvo.classList.remove('inclinado'); for (const k of ['--rx', '--ry']) alvo.style.removeProperty(k); alvo = null; caixa = null; };
    document.addEventListener('pointermove', e => {
      const el = e.target.closest ? e.target.closest('[data-inclina]') : null;
      if (el !== alvo) { sai(); if (el) { alvo = el; caixa = el.getBoundingClientRect(); el.classList.add('inclinado'); } }
      if (!alvo) return;
      cx = e.clientX; cy = e.clientY; if (!marcado) { marcado = true; requestAnimationFrame(pinta); }
    }, { passive: true });
    addEventListener('scroll', () => { if (alvo) caixa = alvo.getBoundingClientRect(); }, { passive: true });
    document.addEventListener('pointerleave', sai);
  }
})();
