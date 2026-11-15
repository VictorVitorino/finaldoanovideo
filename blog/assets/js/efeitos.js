// Change Management World · efeitos da jornada (sem dependências).
// Galeria que desliza, ficha em foco, cartões que viram, fluxos por tipo de projeto (BPMN), narrativa fixa, gráfico que se constrói
// pilha de livros num cartão que vira, capas vivas dos modelos e cartões que reagem ao cursor. Cada efeito só existe na página que tem o seu gancho (data-*),
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

  // ---------- fluxos por tipo de projeto (BPMN) ----------
  // Cada aba é um tipo de projeto, com o seu diagrama. A ficha percorre o roteiro, acende cada etapa e, nas decisões,
  // faz o laço uma vez antes de seguir. Dá para pausar, andar passo a passo, voltar e abrir qualquer etapa com clique ou teclado.
  const fxs = $('[data-fluxos]');
  if (fxs) {
    const VELS = [1, 1.6, 2.4], PXS = 250, PAUSA = 2600;
    const abas = $$('[role="tab"]', fxs), paineis = $$('[data-fluxo]', fxs);
    let iv = 0, sel = 0, vis = false;
    const maquina = fx => {
      const svg = $('.fluxo-svg', fx), ficha = $('.fx-ficha', svg), rol = $('.fluxo-rolagem', fx), leg = $('[data-fx-legenda]', fx);
      const D = JSON.parse($('[data-fx-dados]', fx).textContent), R = D.r, ULT = R.length - 1;
      const elOnde = $('[data-fx-onde]', fx), elTit = $('[data-fx-tit]', fx), elDesc = $('[data-fx-desc]', fx), elEnt = $('[data-fx-ent]', fx);
      const bTocar = $('[data-fx="tocar"]', fx), bPasso = $('[data-fx="passo"]', fx), bVolta = $('[data-fx="volta"]', fx), bVeloz = $('[data-fx="veloz"]', fx);
      const no = id => $(`[data-no="${id}"]`, svg), lig = i => D.a[R[i] + '>' + R[i + 1]];
      const linha = id => $('#' + id, svg), feita = id => $(`[data-feita="${id}"]`, svg), fases = $$('.fx-fase', svg);
      const comp = {}, compDe = id => comp[id] || (comp[id] = linha(id).getTotalLength());   // medido só com o painel na tela
      const vb = svg.viewBox.baseVal;
      let k = 0, tocando = false, andando = false, parar = false, raf = 0, espera = 0, t0 = 0, dur = 0, nova = true, vezes = {};
      const nosTodos = $$('.fx-no', svg); nosTodos.forEach(g => { g.setAttribute('role', 'button'); g.tabIndex = -1; });
      svg.setAttribute('aria-label', svg.getAttribute('aria-label') + ' Use as setas para andar pelas etapas.');
      const marcaFoco = () => nosTodos.forEach(g => { g.tabIndex = g.dataset.no === R[k] ? 0 : -1; });   // só a etapa atual entra na ordem do Tab
      const poe = (x, y, segue = true) => {
        ficha.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        if (segue && rol.scrollWidth > rol.clientWidth + 4) rol.scrollLeft = x * (svg.clientWidth / vb.width) - rol.clientWidth / 2;   // em tela estreita, a rolagem acompanha a ficha
      };
      const diz = () => {
        const n = D.n[R[k]], a = k < ULT ? lig(k) : null;
        const tipo = n.k === 'G' ? 'Decisão' : n.k === 'E' ? (n.fim ? 'Fim' : 'Início') : `Etapa ${n.i} de ${D.t}`;
        elOnde.textContent = `${n.l} · ${tipo}`; elTit.textContent = n.t;
        elDesc.textContent = n.k === 'G' ? (a && a.r === 'não' ? n.nao : n.sim) : n.d;
        elEnt.hidden = !n.e; if (n.e) elEnt.lastElementChild.textContent = n.e;
        fases.forEach((g, j) => { g.classList.toggle('ativa', j === n.f); g.classList.toggle('feita', j < n.f); });
      };
      const botao = () => { bTocar.setAttribute('aria-pressed', String(tocando)); bTocar.innerHTML = `${ic(tocando ? 'pausa' : 'play')}<span>${tocando ? 'Pausar' : k >= ULT ? 'Recomeçar' : 'Reproduzir'}</span>`; bVolta.disabled = k === 0 && !andando; leg.setAttribute('aria-live', tocando ? 'off' : 'polite'); };
      // estado parado em uma parada do roteiro: tudo o que veio antes fica feito
      const pinta = alvo => {
        cancelAnimationFrame(raf); raf = 0; clearTimeout(espera); andando = false; parar = false; k = alvo; vezes = {};
        $$('.fx-no', svg).forEach(g => g.classList.remove('ativo', 'feito'));
        $$('.fx-feitas path', svg).forEach(c => { c.style.strokeDashoffset = '1'; });
        for (let i = 0; i < alvo; i++) { no(R[i]).classList.add('feito'); feita(lig(i).id).style.strokeDashoffset = '0'; vezes[R[i]] = (vezes[R[i]] || 0) + 1; }
        const g = no(R[alvo]); g.classList.remove('feito'); g.classList.add('ativo'); vezes[R[alvo]] = (vezes[R[alvo]] || 0) + 1;
        const n = D.n[R[alvo]]; poe(n.x, n.y); ficha.classList.toggle('some', alvo > 0); diz(); botao(); marcaFoco();
      };
      const chega = () => {   // a ficha parou na parada seguinte
        const de = no(R[k]); de.classList.remove('ativo'); de.classList.add('feito');
        k++; const g = no(R[k]); g.classList.remove('feito'); g.classList.add('ativo'); vezes[R[k]] = (vezes[R[k]] || 0) + 1;
        const n = D.n[R[k]]; poe(n.x, n.y); ficha.classList.add('some'); diz(); marcaFoco();
      };
      const agenda = ms => { clearTimeout(espera); espera = setTimeout(avanca, ms); };
      const descanso = () => (k >= ULT ? 5200 : (vezes[R[k]] > 1 ? .45 : 1) * PAUSA / VELS[iv]);   // etapa já vista no laço: pausa curta
      const quadro = agora => {
        const id = lig(k).id, u = Math.min(1, (agora - t0) / dur), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const q = linha(id).getPointAtLength(compDe(id) * e); poe(q.x, q.y);
        if (nova) feita(id).style.strokeDashoffset = String(1 - e);
        if (u < 1) { raf = requestAnimationFrame(quadro); return; }
        raf = 0; andando = false; feita(id).style.strokeDashoffset = '0'; chega();
        if (parar) { parar = false; tocando = false; botao(); return; }
        if (tocando) agenda(descanso()); botao();
      };
      function avanca() {   // sai da parada atual e percorre a próxima ligação
        if (andando) return;
        if (k >= ULT) pinta(0);
        const id = lig(k).id;
        if (calmo) { feita(id).style.strokeDashoffset = '0'; chega(); botao(); return; }
        nova = feita(id).style.strokeDashoffset !== '0';
        andando = true; ficha.classList.remove('some'); t0 = performance.now(); dur = Math.max(420, compDe(id) / (PXS * VELS[iv]) * 1000);
        raf = requestAnimationFrame(quadro); botao();
      }
      const pausa = () => { tocando = false; clearTimeout(espera); if (andando) parar = true; botao(); };
      const toca = () => { tocando = true; parar = false; botao(); if (!andando) agenda(k === 0 ? 700 : 80); };
      const abre = id => { const i = R.indexOf(id); if (i < 0) return; tocando = false; delete fxs.dataset.volta; pinta(i); };   // etapa escolhida por clique ou teclado
      bTocar.addEventListener('click', () => { delete fxs.dataset.volta; if (tocando) pausa(); else toca(); });
      bPasso.addEventListener('click', () => { clearTimeout(espera); delete fxs.dataset.volta; if (andando) { parar = true; tocando = false; botao(); return; } tocando = false; parar = !calmo; avanca(); botao(); });
      bVolta.addEventListener('click', () => { delete fxs.dataset.volta; tocando = false; pinta(Math.max(0, andando ? k : k - 1)); });
      bVeloz.addEventListener('click', () => { iv = (iv + 1) % VELS.length; const r = String(VELS[iv]).replace('.', ','); $$('[data-fx="veloz"]', fxs).forEach(b => { $('b', b).textContent = r + '×'; b.setAttribute('aria-label', `Velocidade: ${r} vez${VELS[iv] > 1 ? 'es' : ''}`); }); });
      svg.addEventListener('click', e => { const g = e.target.closest('[data-no]'); if (g) abre(g.dataset.no); });
      svg.addEventListener('keydown', e => {
        const g = e.target.closest('[data-no]'); if (!g) return;
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abre(g.dataset.no); }
        else if (d || e.key === 'Home' || e.key === 'End') { e.preventDefault(); tocando = false; delete fxs.dataset.volta; pinta(e.key === 'Home' ? 0 : e.key === 'End' ? ULT : Math.min(ULT, Math.max(0, k + d))); no(R[k]).focus(); }   // setas: parada anterior e seguinte do roteiro
      });
      $$('[data-fx-trava]', fx).forEach(li => {
        const g = no(li.dataset.fxTrava), b = $('[data-fx-ver]', li); if (!g) return;
        const acende = v => g.classList.toggle('alerta', v);
        li.addEventListener('pointerenter', () => acende(true)); li.addEventListener('pointerleave', () => acende(false));
        li.addEventListener('focusin', () => acende(true)); li.addEventListener('focusout', () => acende(false));
        if (b) b.addEventListener('click', () => { abre(li.dataset.fxTrava); const q = rol.getBoundingClientRect(); if (q.top < 80 || q.bottom > innerHeight) rol.scrollIntoView({ block: 'center', behavior: suave }); });
      });
      return { toca, pausa, pinta, tocando: () => tocando };
    };
    const ms = paineis.map(maquina);
    let jaTocou = false;
    // toca sozinho quando entra na tela e descansa quando sai, quando a aba do navegador some ou quando há um diálogo aberto
    const confere = () => {
      const pode = vis && !document.hidden && !raiz.classList.contains('trava'), m = ms[sel];
      if (!pode && m.tocando()) { m.pausa(); fxs.dataset.volta = '1'; }
      else if (pode && fxs.dataset.volta) { delete fxs.dataset.volta; m.toca(); }
      else if (pode && !jaTocou && !calmo) { jaTocou = true; m.toca(); }
    };
    const mostra = (i, foco) => {
      if (i === sel && !paineis[i].hidden) return;
      const tocava = ms[sel].tocando() || !!fxs.dataset.volta; ms[sel].pausa(); ms[sel].pinta(0); delete fxs.dataset.volta;   // o fluxo que sai volta ao início, parado
      sel = i;
      abas.forEach((a, j) => { a.setAttribute('aria-selected', String(j === i)); a.tabIndex = j === i ? 0 : -1; });
      paineis.forEach((q, j) => { q.hidden = j !== i; });
      ms[i].pinta(0);
      if (foco) abas[i].focus();
      if (tocava && !calmo && vis && !document.hidden) ms[i].toca();
    };
    abas.forEach((a, i) => {
      a.addEventListener('click', () => mostra(i));
      a.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); mostra((i + d + abas.length) % abas.length, true); }
        else if (e.key === 'Home') { e.preventDefault(); mostra(0, true); }
        else if (e.key === 'End') { e.preventDefault(); mostra(abas.length - 1, true); }
      });
    });
    paineis.forEach((q, j) => { q.hidden = j !== 0; });
    ms[0].pinta(0);
    // endereço com o tipo (servicos/#fluxo-erp) abre a aba certa
    const doEndereco = rola => { const i = paineis.findIndex(q => '#' + q.id === location.hash); if (i < 0) return; mostra(i); if (rola) fxs.scrollIntoView({ block: 'start', behavior: 'auto' }); };
    doEndereco(true); addEventListener('hashchange', () => doEndereco(true));
    if ('IntersectionObserver' in window) {
      const naTela = new Set();
      const io = new IntersectionObserver(es => { es.forEach(e => (e.isIntersecting ? naTela.add(e.target) : naTela.delete(e.target))); vis = naTela.size > 0; confere(); }, { threshold: .4 });
      paineis.forEach(q => io.observe($('.fluxo-rolagem', q)));
    } else { vis = true; confere(); }
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

  // ---------- capas vivas dos modelos ----------
  // Entram em cena na primeira vez que aparecem (.viu), só se movem enquanto estão na tela (.na-tela) e, nas apresentações,
  // o campo entre colchetes do título ("[nome do projeto]") se preenche com exemplos: uma vez ao aparecer e em sequência com o cursor em cima.
  const maquina = capa => {
    const campo = capa.querySelector('[data-digita]'); if (!campo || calmo) return null;
    if (campo._maq) return campo._maq;
    const dt = $('.cl-dt', campo), orig = dt.textContent, maius = /^[A-ZÀ-Ý]/.test(orig);
    const lista = campo.dataset.digita.split('|').map(t => maius ? t.charAt(0).toUpperCase() + t.slice(1) : t);
    const espera = ms => new Promise(r => setTimeout(r, ms));
    let ficha = 0, k = 0;
    const roda = async voltas => {                       // cada chamada invalida a anterior: quem perde a ficha para no próximo passo
      const minha = ++ficha, vale = () => minha === ficha;
      const troca = async alvo => {
        while (vale() && dt.textContent.length) { dt.textContent = dt.textContent.slice(0, -1); await espera(24); }
        await espera(170);
        for (let i = 1; vale() && i <= alvo.length; i++) { dt.textContent = alvo.slice(0, i); await espera(46 + Math.random() * 46); }
      };
      campo.classList.add('digitando'); await espera(320);
      for (let v = 0; vale() && v < voltas; v++) { await troca(lista[k++ % lista.length]); if (!vale()) return; await espera(1500); }
      if (!vale()) return;
      if (dt.textContent !== orig) await troca(orig);
      if (vale()) campo.classList.remove('digitando');
    };
    return campo._maq = { toca: roda, encerra: () => roda(0) };
  };
  const capas = $$('.capa-viva');
  if (capas.length) {
    if ('IntersectionObserver' in window) {
      let vaga = 0;                                         // próxima hora livre: as demonstrações do campo acontecem uma de cada vez
      const olho = new IntersectionObserver(es => es.forEach(e => {
        const c = e.target; c.classList.toggle('na-tela', e.isIntersecting);
        if (e.isIntersecting) c.classList.add('viu');
        if (e.intersectionRatio >= .85 && !c._demo) {      // uma demonstração por capa, na primeira vez que ela aparece inteira
          c._demo = true; const m = maquina(c); if (!m) return;
          const agora = performance.now(); vaga = Math.max(agora + 2400, vaga + 4600);
          setTimeout(() => { if (c.classList.contains('na-tela') && !c.classList.contains('inclinado')) m.toca(1); else { c._demo = false; vaga = Math.min(vaga, performance.now()); } }, vaga - agora);
        }
      }), { threshold: [0, .85] });
      capas.forEach(c => olho.observe(c));
    } else capas.forEach(c => c.classList.add('viu', 'na-tela'));
  }

  // ---------- cartões que reagem ao cursor: inclinação (pilares, cartão de contato) ou paralaxe em camadas (capas vivas), com reflexo que segue o ponteiro ----------
  if (!calmo && matchMedia('(pointer: fine)').matches) {
    let alvo = null, cx = 0, cy = 0, marcado = false, caixa = null;
    const pinta = () => {
      marcado = false; if (!alvo || !caixa) return;
      const px = Math.min(1, Math.max(0, (cx - caixa.left) / caixa.width)), py = Math.min(1, Math.max(0, (cy - caixa.top) / caixa.height));
      alvo.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg'); alvo.style.setProperty('--rx', ((.5 - py) * 9).toFixed(2) + 'deg');
      alvo.style.setProperty('--ix', ((px - .5) * 2).toFixed(3)); alvo.style.setProperty('--iy', ((py - .5) * 2).toFixed(3));
      alvo.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); alvo.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    };
    const sai = () => {
      if (!alvo) return; alvo.classList.remove('inclinado'); for (const k of ['--rx', '--ry', '--ix', '--iy']) alvo.style.removeProperty(k);
      const m = alvo.classList.contains('capa-viva') ? maquina(alvo) : null; if (m) m.encerra();
      alvo = null; caixa = null;
    };
    document.addEventListener('pointermove', e => {
      const el = e.target.closest ? e.target.closest('[data-inclina]') : null;
      if (el !== alvo) {
        sai();
        if (el) {
          alvo = el; caixa = el.getBoundingClientRect(); el.classList.add('inclinado');
          if (el.classList.contains('capa-viva')) { el.dataset.vez = el.dataset.vez === 'a' ? 'b' : 'a'; const m = maquina(el); if (m) m.toca(Infinity); }
        }
      }
      if (!alvo) return;
      cx = e.clientX; cy = e.clientY; if (!marcado) { marcado = true; requestAnimationFrame(pinta); }
    }, { passive: true });
    addEventListener('scroll', () => { if (alvo) caixa = alvo.getBoundingClientRect(); }, { passive: true });
    document.addEventListener('pointerleave', sai);
  }
})();
