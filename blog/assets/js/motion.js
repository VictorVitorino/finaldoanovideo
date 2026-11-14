// Change Management World · camada de motion (sem dependências).
// Vinheta de abertura, formas em movimento, tipografia cinética, inclinação dos cartões e formas que seguem a rolagem.
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
    setTimeout(() => raiz.classList.remove('vinheta'), 1080);   // a abertura começa quando as faixas sobem
    setTimeout(() => tela.remove(), 2300);
  }

  // ---------- barra de progresso ----------
  const barra = cria('div', 'progresso'); barra.setAttribute('aria-hidden', 'true'); document.body.appendChild(barra);
  const enfeites = [];
  let marcado = false;
  const aoRolar = () => {
    marcado = false;
    const max = raiz.scrollHeight - innerHeight;
    barra.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    for (const e of enfeites) {
      const r = e.pai.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) continue;
      e.el.style.setProperty('--r', (((innerHeight - r.top) / (innerHeight + r.height)) - 0.5).toFixed(3));
    }
  };
  addEventListener('scroll', () => { if (!marcado) { marcado = true; requestAnimationFrame(aoRolar); } }, { passive: true });
  addEventListener('resize', aoRolar);

  // ---------- formas soltas nas seções (seguem a rolagem) ----------
  const FORMAS = {
    anel: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="4" r="5" fill="currentColor"/></svg>',
    mais: '<svg viewBox="0 0 100 100"><path d="M50 8v84M8 50h84" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>',
    pontos: `<svg viewBox="0 0 100 100">${[0, 1, 2, 3, 4].map(i => [0, 1, 2, 3, 4].map(j => `<circle cx="${10 + i * 20}" cy="${10 + j * 20}" r="2.6" fill="currentColor"/>`).join('')).join('')}</svg>`,
    arco: '<svg viewBox="0 0 100 100"><path d="M6 94A88 88 0 0 1 94 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 9"/></svg>',
    tri: '<svg viewBox="0 0 100 100"><path d="M50 8l44 80H6z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>',
  };
  const PLANO = [['anel', 96, '2.5%', '8%', '70px', '120deg'], ['pontos', 110, '3%', '74%', '-50px', '0deg'], ['mais', 34, '6%', '12%', '90px', '180deg'], ['arco', 150, '3%', '60%', '-70px', '40deg'], ['tri', 46, '4%', '80%', '80px', '-140deg']];
  $$('section.sec').forEach((sec, i) => {
    if (sec.classList.contains('sec--atalhos')) return;
    const [tipo, tam, lado, topo, v, g] = PLANO[i % PLANO.length];
    const el = cria('span', 'enfeite', FORMAS[tipo]); el.setAttribute('aria-hidden', 'true');
    el.style.cssText = `width:${tam}px;height:${tam}px;${i % 2 ? 'left' : 'right'}:${lado};top:${topo};--v:${v};--g:${g}`;
    sec.appendChild(el); enfeites.push({ el, pai: sec });
  });
  aoRolar();

  // ---------- tipografia cinética ----------
  // títulos de seção: cada palavra sobe de trás de uma máscara
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
  $$('.sec-cab h2, .lab-cab h1, .pg-cab h1').forEach(h => fatia(h, { n: 0 }));
  // títulos fora de um bloco .revela aparecem quando entram na tela
  const soltos = $$('.pal').filter(p => !p.closest('.revela'));
  if (soltos.length) { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); o.unobserve(e.target); } }), { threshold: 0.2 }); soltos.forEach(p => o.observe(p)); }

  // título da abertura: grifo desenhado e última linha em onda
  const em = $('.mega em');
  if (em) em.insertAdjacentHTML('beforeend', '<svg class="grifo-mao" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 13C48 4 92 17 142 9s96-7 155 3"/></svg>');
  const ultima = $('.mega .mega-l:last-child > span');
  if (ultima && !ultima.children.length) {
    const txt = ultima.textContent; ultima.setAttribute('aria-label', txt);
    ultima.innerHTML = [...txt].map((c, i) => c === ' ' ? ' ' : `<span class="letra" aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
  }

  // ---------- abertura: formas em movimento (canvas) ----------
  const ab = $('.abertura');
  if (ab) {
    const luz = cria('div', 'abertura-luz'), cv = cria('canvas', 'formas'); cv.setAttribute('aria-hidden', 'true');
    ab.prepend(cv); ab.prepend(luz);
    const c = cv.getContext('2d'), CORES = ['157,189,255', '47,111,237', '255,255,255'];
    let W = 0, H = 0, dpr = 1, F = [], visivel = true, mx = -9999, my = -9999, t0 = performance.now();
    const semeia = () => {
      const n = Math.round(Math.min(46, Math.max(16, W * H / 26000)));
      F = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        t: ['ponto', 'ponto', 'ponto', 'anel', 'mais', 'tri', 'quad'][i % 7], s: 3 + Math.random() * 9, a: Math.random() * 6.28, va: (Math.random() - .5) * .012,
        cor: CORES[i % 3], o: .16 + Math.random() * .3, f: Math.random() * 6.28, ex: 0, ey: 0,
      }));
    };
    const mede = () => { dpr = Math.min(2, devicePixelRatio || 1); W = ab.clientWidth; H = ab.clientHeight; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); semeia(); };
    const quadro = agora => {
      if (visivel && !document.hidden) {
        const t = (agora - t0) / 1000;
        c.clearRect(0, 0, W, H);
        for (const f of F) {
          // empurrão suave para longe do ponteiro
          const dx = f.x - mx, dy = f.y - my, d = Math.hypot(dx, dy);
          if (d < 150 && d > 0) { const k = (1 - d / 150) * 1.6; f.ex += dx / d * k; f.ey += dy / d * k; }
          f.ex *= .92; f.ey *= .92;
          f.x += f.vx + f.ex * .12; f.y += f.vy + f.ey * .12 + Math.sin(t * .6 + f.f) * .08; f.a += f.va;
          if (f.x < -20) f.x = W + 20; else if (f.x > W + 20) f.x = -20;
          if (f.y < -20) f.y = H + 20; else if (f.y > H + 20) f.y = -20;
        }
        // linhas entre pontos próximos
        c.lineWidth = 1;
        for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) {
          const a = F[i], b = F[j]; if (a.t !== 'ponto' || b.t !== 'ponto') continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y); if (d > 170) continue;
          c.strokeStyle = `rgba(157,189,255,${(1 - d / 170) * .22})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        }
        for (const f of F) {
          const pulso = 1 + Math.sin(t * 1.3 + f.f) * .12, s = f.s * pulso;
          c.save(); c.translate(f.x, f.y); c.rotate(f.a); c.strokeStyle = c.fillStyle = `rgba(${f.cor},${f.o})`; c.lineWidth = 1.5; c.lineCap = 'round'; c.beginPath();
          if (f.t === 'ponto') { c.arc(0, 0, Math.max(1.4, s * .28), 0, 6.283); c.fill(); }
          else if (f.t === 'anel') { c.arc(0, 0, s, 0, 6.283); c.stroke(); }
          else if (f.t === 'mais') { c.moveTo(-s, 0); c.lineTo(s, 0); c.moveTo(0, -s); c.lineTo(0, s); c.stroke(); }
          else if (f.t === 'tri') { c.moveTo(0, -s); c.lineTo(s * .87, s * .5); c.lineTo(-s * .87, s * .5); c.closePath(); c.stroke(); }
          else { c.rect(-s * .7, -s * .7, s * 1.4, s * 1.4); c.stroke(); }
          c.restore();
        }
      }
      requestAnimationFrame(quadro);
    };
    mede(); addEventListener('resize', mede);
    new IntersectionObserver(es => { visivel = es[0].isIntersecting; }).observe(ab);
    if (fino) {
      ab.addEventListener('pointermove', e => { const r = ab.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; luz.style.setProperty('--lx', mx + 'px'); luz.style.setProperty('--ly', my + 'px'); }, { passive: true });
      ab.addEventListener('pointerleave', () => { mx = my = -9999; });
    }
    requestAnimationFrame(quadro);
  }

  // ---------- cartões: inclinação 3D e brilho sob o ponteiro ----------
  if (fino) {
    $$('.cartao, .guia, .lab-cartao, .mod').forEach(el => {
      el.classList.add('inclina');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add('sobre');
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        el.style.transform = `perspective(900px) translateY(-4px) rotateX(${((.5 - y) * 5).toFixed(2)}deg) rotateY(${((x - .5) * 6).toFixed(2)}deg)`;
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.classList.remove('sobre'); el.style.transform = ''; });
    });
    // botões principais puxam de leve para o ponteiro
    $$('.btn--p, .btn--claro').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left) / r.width - .5) * 8}px ${((e.clientY - r.top) / r.height - .5) * 6}px`; }, { passive: true });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }
  // onda no clique dos botões
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn'); if (!b) return;
    const r = b.getBoundingClientRect(), o = cria('span', 'onda-clique'); o.style.left = (e.clientX - r.left) + 'px'; o.style.top = (e.clientY - r.top) + 'px';
    b.appendChild(o); setTimeout(() => o.remove(), 720);
  }, { passive: true });
})();
