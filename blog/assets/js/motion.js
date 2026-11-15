// Change Management World · camada de motion (sem dependências).
// Vinheta de abertura, barra de progresso, palavras dos títulos, partículas da abertura (ligadas por proximidade,
// afastadas pelo ponteiro e empurradas pelo pulso do clique) e onda no clique dos botões.
// Tudo o que se move usa um único requestAnimationFrame por tarefa e para quando não está à vista.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raiz = document.documentElement;
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches, fino = matchMedia('(pointer: fine)').matches;
  const cria = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
  if (calmo) { raiz.classList.remove('vinheta'); return; }

  // ---------- vinheta de abertura ----------
  if (raiz.classList.contains('vinheta')) {
    try { sessionStorage.setItem('cmw-vinheta', '1'); } catch { /* sem memória de sessão: a vinheta só repete */ }
    const tela = cria('div', 'vinheta-tela', `<div class="vinheta-faixas">${[0, 1, 2, 3, 4].map(i => `<i style="--i:${i}"></i>`).join('')}</div>
      <div class="vinheta-marca"><svg viewBox="0 0 48 48" aria-hidden="true"><circle class="v-globo" cx="24" cy="24" r="21" fill="#2F6FED"/>
      <path class="v-agua" d="M3.1 22A21 21 0 1 0 44.9 22Z" fill="#0A2463"/>
      <g class="v-gelo"><path d="M24 8.5l6.2 13.5H17.4z" fill="#fff"/><path d="M14.5 22h19l2.8 7-6.3 9.6-7.6 1.6-7.4-8.4z" fill="#fff" opacity=".5"/></g>
      <path class="v-linhas" pathLength="1" d="M3.1 22q5.2-2.4 10.4 0t10.5 0 10.4 0 10.5 0" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>
      <div class="vinheta-nome">${['Change', 'Management', 'World'].map((p, i) => `<span style="--i:${i}">${p}</span>`).join('')}</div><div class="vinheta-traco"></div></div>`);
    tela.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tela);
    setTimeout(() => raiz.classList.remove('vinheta'), 740);   // a abertura começa quando as faixas sobem
    setTimeout(() => tela.remove(), 1600);
  }

  // ---------- barra de progresso: uma conta por quadro, só quando a página rola ----------
  const barra = cria('div', 'progresso'); barra.setAttribute('aria-hidden', 'true'); document.body.appendChild(barra);
  let max = 0, marcado = false;
  const mede = () => { max = raiz.scrollHeight - innerHeight; };
  const pinta = () => { marcado = false; barra.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0})`; };
  const pede = () => { if (!marcado) { marcado = true; requestAnimationFrame(pinta); } };
  addEventListener('scroll', pede, { passive: true });
  addEventListener('resize', () => { mede(); pede(); }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => { mede(); pede(); }).observe(document.body);   // a altura muda quando o radar mostra mais cartões
  mede(); pinta();

  // ---------- títulos: cada palavra sobe de trás de uma máscara ----------
  const fatia = (no, conta) => {
    for (const filho of [...no.childNodes]) {
      if (filho.nodeType === 3) {
        const frag = document.createDocumentFragment();
        filho.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) return frag.appendChild(document.createTextNode(' '));
          const pal = cria('span', 'pal'), dentro = cria('span'); dentro.textContent = t; dentro.style.setProperty('--i', conta.n++); pal.appendChild(dentro); frag.appendChild(pal);
        });
        filho.replaceWith(frag);
      } else if (filho.nodeType === 1 && !filho.closest('svg')) fatia(filho, conta);
    }
  };
  $$('.sec-cab h2, .sec-cab h1, .lab-cab h1, .pg-cab h1').forEach(h => fatia(h, { n: 0 }));
  const soltos = $$('.pal').filter(p => !p.closest('.revela'));
  if (soltos.length && 'IntersectionObserver' in window) { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); o.unobserve(e.target); } }), { threshold: 0.2 }); soltos.forEach(p => o.observe(p)); }
  else soltos.forEach(p => p.classList.add('visto'));
  const em = $('.mega em');
  if (em) em.insertAdjacentHTML('beforeend', '<svg class="grifo-mao" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 13C48 4 92 17 142 9s96-7 155 3"/></svg>');

  // ---------- abertura: formas em movimento e luz do ponteiro ----------
  // O laço roda a 30 quadros por segundo e só existe enquanto a abertura está na tela, a aba está visível e não há diálogo aberto.
  const ab = $('.abertura');
  if (ab) {
    const luz = cria('div', 'abertura-luz'), cv = cria('canvas', 'formas'); cv.setAttribute('aria-hidden', 'true');
    ab.prepend(cv); ab.prepend(luz);
    const c = cv.getContext('2d'), CORES = ['157,189,255', '47,111,237', '255,255,255'];
    let W = 0, H = 0, topo = 0, F = [], naTela = true, mx = -9999, my = -9999, lx = null, ly = null, raf = 0, ult = 0, t = 0, pulsos = [];
    const semeia = () => {
      const n = Math.round(Math.min(40, Math.max(14, W * H / 30000)));
      F = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        t: ['ponto', 'ponto', 'ponto', 'anel', 'mais', 'tri', 'quad'][i % 7], s: 3 + Math.random() * 9, a: Math.random() * 6.28, va: (Math.random() - .5) * .012,
        cor: CORES[i % 3], o: .16 + Math.random() * .3, f: Math.random() * 6.28, ex: 0, ey: 0,
      }));
    };
    const medeTela = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      topo = cv.offsetTop; W = ab.clientWidth; H = Math.max(0, ab.clientHeight - topo);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; c.setTransform(dpr, 0, 0, dpr, 0, 0); semeia();
    };
    const quadro = agora => {
      raf = requestAnimationFrame(quadro);
      const dt = agora - ult; if (dt < 30) return;   // cerca de 30 quadros por segundo
      ult = agora; const k = Math.min(3, dt / 16.67); t += Math.min(dt, 100) / 1000;
      if (lx !== null) { luz.style.transform = `translate3d(${lx}px,${ly}px,0)`; lx = null; }
      c.clearRect(0, 0, W, H);
      for (const f of F) {
        const dx = f.x - mx, dy = f.y - my, d = Math.hypot(dx, dy);
        if (d < 150 && d > 0) { const e = (1 - d / 150) * 1.6 * k; f.ex += dx / d * e; f.ey += dy / d * e; }
        f.ex *= .92; f.ey *= .92;
        f.x += (f.vx + f.ex * .12) * k; f.y += (f.vy + f.ey * .12 + Math.sin(t * .6 + f.f) * .08) * k; f.a += f.va * k;
        if (f.x < -20) f.x = W + 20; else if (f.x > W + 20) f.x = -20;
        if (f.y < -20) f.y = H + 20; else if (f.y > H + 20) f.y = -20;
      }
      // pulsos do clique: um anel que cresce e empurra as formas por onde passa
      for (const p of pulsos) {
        p.r += 8.5 * k; const a = 1 - p.r / 280;
        for (const f of F) { const dx = f.x - p.x, dy = f.y - p.y, d = Math.hypot(dx, dy); if (d > 0 && Math.abs(d - p.r) < 30) { const e = a * 5; f.ex += dx / d * e; f.ey += dy / d * e; } }
        if (a > 0) { c.lineWidth = 1.5; c.strokeStyle = `rgba(157,189,255,${(a * .55).toFixed(3)})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.stroke(); }
      }
      if (pulsos.length) pulsos = pulsos.filter(p => p.r < 280);
      c.lineWidth = 1;
      for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) {
        const a = F[i], b = F[j]; if (a.t !== 'ponto' || b.t !== 'ponto') continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y); if (d > 170) continue;
        c.strokeStyle = `rgba(157,189,255,${(1 - d / 170) * .22})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      }
      for (const f of F) {
        const s = f.s * (1 + Math.sin(t * 1.3 + f.f) * .12);
        c.save(); c.translate(f.x, f.y); c.rotate(f.a); c.strokeStyle = c.fillStyle = `rgba(${f.cor},${f.o})`; c.lineWidth = 1.5; c.lineCap = 'round'; c.beginPath();
        if (f.t === 'ponto') { c.arc(0, 0, Math.max(1.4, s * .28), 0, 6.283); c.fill(); }
        else if (f.t === 'anel') { c.arc(0, 0, s, 0, 6.283); c.stroke(); }
        else if (f.t === 'mais') { c.moveTo(-s, 0); c.lineTo(s, 0); c.moveTo(0, -s); c.lineTo(0, s); c.stroke(); }
        else if (f.t === 'tri') { c.moveTo(0, -s); c.lineTo(s * .87, s * .5); c.lineTo(-s * .87, s * .5); c.closePath(); c.stroke(); }
        else { c.rect(-s * .7, -s * .7, s * 1.4, s * 1.4); c.stroke(); }
        c.restore();
      }
    };
    // liga e desliga o laço conforme a abertura está à vista
    const confere = () => {
      const deve = naTela && !document.hidden && !raiz.classList.contains('trava');
      if (deve && !raf) { ult = 0; raf = requestAnimationFrame(quadro); }
      else if (!deve && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    medeTela();
    let tRed = 0; addEventListener('resize', () => { clearTimeout(tRed); tRed = setTimeout(medeTela, 150); }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { naTela = es[0].isIntersecting; confere(); }).observe(ab);
    document.addEventListener('visibilitychange', confere);
    new MutationObserver(confere).observe(raiz, { attributes: true, attributeFilter: ['class'] });
    ab.addEventListener('pointerdown', e => {
      if (e.button || e.target.closest('a, button, input, .mergulho, .frentes, .retrato') || pulsos.length > 3) return;
      const r = ab.getBoundingClientRect(); pulsos.push({ x: e.clientX - r.left, y: e.clientY - r.top - topo, r: 0 });
    }, { passive: true });
    if (fino) {
      let base = null;   // posição da abertura na tela: lida uma vez, refeita ao rolar ou redimensionar
      addEventListener('scroll', () => { base = null; }, { passive: true }); addEventListener('resize', () => { base = null; }, { passive: true });
      ab.addEventListener('pointermove', e => { if (!base) base = ab.getBoundingClientRect(); lx = e.clientX - base.left; ly = e.clientY - base.top; mx = lx; my = ly - topo; }, { passive: true });
      ab.addEventListener('pointerleave', () => { mx = my = -9999; });
    }
    confere();
  }

  // ---------- onda no clique dos botões ----------
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('.btn'); if (!b) return;
    const r = b.getBoundingClientRect(), o = cria('span', 'onda-clique'); o.style.left = (e.clientX - r.left) + 'px'; o.style.top = (e.clientY - r.top) + 'px';
    b.appendChild(o); setTimeout(() => o.remove(), 620);
  }, { passive: true });
})();
