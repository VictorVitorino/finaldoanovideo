// Change Management World · comportamento do site (sem dependências)
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // topo: sombra ao rolar e menu no celular
  const topo = $('[data-topo]');
  const aoRolar = () => topo && topo.classList.toggle('rolou', scrollY > 8);
  addEventListener('scroll', aoRolar, { passive: true }); aoRolar();
  const btnMenu = $('[data-menu]'), menu = $('#menu-mob');
  if (btnMenu && menu) {
    const fecha = () => { menu.hidden = true; btnMenu.setAttribute('aria-expanded', 'false'); btnMenu.setAttribute('aria-label', 'Abrir menu'); };
    btnMenu.addEventListener('click', () => {
      const abrir = menu.hidden;
      menu.hidden = !abrir; btnMenu.setAttribute('aria-expanded', String(abrir)); btnMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) fecha(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { fecha(); btnMenu.focus(); } });
    matchMedia('(min-width: 1101px)').addEventListener('change', fecha);
  }

  // entrada ao rolar e capas que só se movem quando estão na tela
  const itens = $$('.revela'), capas = $$('.capa');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); obs.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    itens.forEach(el => obs.observe(el));
    if (!calmo) {
      const vivas = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('viva', e.isIntersecting)), { threshold: 0.25 });
      capas.forEach(c => vivas.observe(c));
    }
  } else itens.forEach(el => el.classList.add('visto'));
  if (calmo) $$('animateMotion').forEach(a => a.remove());

  // navegação: marca a seção em que a pessoa está
  const links = $$('[data-nav] a').filter(a => a.hash && $(a.hash));
  if (links.length && 'IntersectionObserver' in window) {
    const alvo = new Map(links.map(a => [$(a.hash), a]));
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('aqui')); alvo.get(e.target).classList.add('aqui'); } }), { rootMargin: '-45% 0px -50% 0px' });
    alvo.forEach((_, sec) => spy.observe(sec));
  }

  // paralaxe leve do globo com o ponteiro
  const par = $('[data-paralaxe]');
  if (par && !calmo && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      par.style.setProperty('--px', ((e.clientX / innerWidth) - 0.5).toFixed(3));
      par.style.setProperty('--py', ((e.clientY / innerHeight) - 0.5).toFixed(3));
    }, { passive: true });
  }

  // radar: filtro por tema, busca e "mostrar mais"
  const grade = $('[data-grade]');
  if (grade) {
    const cartoes = $$('.cartao', grade), campo = $('[data-busca-campo]'), vazio = $('[data-vazio]'), mais = $('[data-mais]'), filtros = $$('.filtro');
    const PASSO = 9; let tema = '', limite = PASSO;
    const aplica = () => {
      const q = (campo.value || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      let n = 0, total = 0;
      for (const c of cartoes) {
        const txt = c.dataset.busca.normalize('NFD').replace(/[̀-ͯ]/g, '');
        const ok = (!tema || c.dataset.tema === tema) && (!q || q.split(/\s+/).every(p => txt.includes(p)));
        if (ok) total++;
        const mostra = ok && n < limite; if (mostra) n++;
        c.classList.toggle('oculto', !mostra);
        if (mostra) c.classList.add('visto');
      }
      vazio.hidden = total > 0; mais.parentElement.hidden = total <= limite;
      mais.firstChild.textContent = `Mostrar mais ${Math.min(PASSO, total - limite)} de ${total - limite}`;
    };
    const escolhe = (t, rola) => {
      tema = t; limite = PASSO;
      filtros.forEach(b => { const on = b.dataset.tema === t; b.classList.toggle('ativo', on); b.setAttribute('aria-pressed', String(on)); if (on) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: calmo ? 'auto' : 'smooth' }); });
      aplica();
      if (rola) $('#radar').scrollIntoView({ behavior: calmo ? 'auto' : 'smooth' });
    };
    filtros.forEach(b => b.addEventListener('click', () => escolhe(b.dataset.tema)));
    campo.addEventListener('input', () => { limite = PASSO; aplica(); });
    mais.addEventListener('click', () => { limite += PASSO; aplica(); });
    $$('[data-filtrar]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = a.dataset.filtrar; escolhe(filtros.some(b => b.dataset.tema === t) ? t : '', true); }));
    $$('[data-abrir-busca]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); $('#radar').scrollIntoView({ behavior: calmo ? 'auto' : 'smooth' }); setTimeout(() => campo.focus({ preventScroll: true }), calmo ? 0 : 500); }));
    const inicial = new URLSearchParams(location.search).get('tema');
    escolhe(filtros.some(b => b.dataset.tema === inicial) ? inicial : '');
  }

  // números que contam (aceita 37%, 2,5x, 1.500, US$ 4 bi...)
  const nums = $$('[data-conta]');
  if (nums.length && !calmo && 'IntersectionObserver' in window) {
    const conta = el => {
      const alvo = el.dataset.conta, m = /(\d[\d.]*)(?:,(\d+))?/.exec(alvo);
      if (!m) return;
      const inteiro = m[1].replace(/\./g, ''), casas = m[2] ? m[2].length : 0, fim = parseFloat(inteiro + (m[2] ? '.' + m[2] : ''));
      const milhar = m[1].includes('.'), t0 = performance.now(), dur = 1400;
      const fmt = v => { let s = v.toFixed(casas).replace('.', ','); if (milhar) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return alvo.slice(0, m.index) + s + alvo.slice(m.index + m[0].length); };
      const passo = t => { const u = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - u, 4); el.textContent = fmt(fim * e); if (u < 1) requestAnimationFrame(passo); else el.textContent = alvo; };
      requestAnimationFrame(passo);
    };
    const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { conta(e.target); obs.unobserve(e.target); } }), { threshold: 0.6 });
    nums.forEach(n => obs.observe(n));
  }

  // posts do mês: abas
  const abas = $$('[data-aba]');
  abas.forEach((b, i) => {
    b.addEventListener('click', () => abas.forEach(o => { const on = o === b; o.setAttribute('aria-selected', String(on)); o.tabIndex = on ? 0 : -1; $('#painel-' + o.dataset.aba).hidden = !on; if (on) $$('.revela', $('#painel-' + o.dataset.aba)).forEach(x => x.classList.add('visto')); }));
    b.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; const o = abas[(i + d + abas.length) % abas.length]; o.focus(); o.click(); });
  });

  // vídeos: só um toca por vez
  const videos = $$('video');
  videos.forEach(v => v.addEventListener('play', () => videos.forEach(o => { if (o !== v) o.pause(); })));

  // post: compartilhar no LinkedIn e copiar link
  const url = location.href.split('#')[0];
  $$('[data-linkedin]').forEach(a => { a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url); });
  $$('[data-copiar]').forEach(b => b.addEventListener('click', async () => {
    const rot = b.querySelector('span'), antes = rot.textContent;
    try { await navigator.clipboard.writeText(url); rot.textContent = 'Link copiado'; } catch { rot.textContent = 'Copie da barra de endereço'; }
    setTimeout(() => { rot.textContent = antes; }, 2200);
  }));
})();
