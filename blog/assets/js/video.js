// Change Management World · vídeo interativo da página inicial ("Além do raso").
// O filme é um MP4 comum; por cima dele, esta camada cuida de: capítulos, legendas próprias, pontos clicáveis que pausam e
// abrem um cartão, o momento em que o vídeo espera um toque no gelo e a tela final de escolha. Os tempos e as posições vêm
// do próprio filme (data-vi-dados). Sem este script, o vídeo toca com os controles do navegador.
(() => {
  const vi = document.querySelector('[data-vi]');
  if (!vi) return;
  const $ = (s, r = vi) => r.querySelector(s), $$ = (s, r = vi) => [...r.querySelectorAll(s)];
  let D;
  try { D = JSON.parse($('[data-vi-dados]').textContent); } catch { return; }
  const video = $('[data-vi-video]'), tela = $('[data-vi-tela]'), palco = $('[data-vi-palco]');
  const bPlay = $('[data-vi-play]'), bTocar = $('[data-vi-tocar]'), bLeg = $('[data-vi-leg]'), bSom = $('[data-vi-som]'), bCheia = $('[data-vi-cheia]');
  const prog = $('[data-vi-prog]'), elT = $('[data-vi-t]'), elLeg = $('[data-vi-legenda]'), elDica = $('[data-vi-dica]');
  const toque = $('[data-vi-toque]'), cartao = $('[data-vi-cartao]'), fim = $('[data-vi-fim]');
  const pontos = $$('[data-vi-ponto]'), chips = $$('[data-vi-chip]'), elErro = $('[data-vi-erro]'), elConta = $('[data-vi-conta]');
  const porId = Object.fromEntries(D.pontos.map(p => [p.id, p]));
  const IC = {
    play: '<path d="M8 5.5v13l11-6.500z" fill="currentColor"/>', pausa: '<path d="M8.5 6v12M15.500 6v12" stroke-width="2.6"/>',
    som: '<path d="M4 9.5v5h3.500L12 18V6L7.500 9.500z"/><path d="M15.500 9a4 4 0 010 6M18 6.500a7.500 7.500 0 010 11"/>', mudo: '<path d="M4 9.500v5h3.500L12 18V6L7.500 9.500z"/><path d="M16 9.500l5 5M21 9.500l-5 5"/>',
  };
  const ic = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const guarda = { le: k => { try { return localStorage.getItem(k); } catch { return null; } }, poe: (k, v) => { try { localStorage.setItem(k, v); } catch { /* sem armazenamento: vale só nesta visita */ } } };

  // a partir daqui os controles são os da página
  video.removeAttribute('controls');
  vi.classList.add('vi--vivo');
  for (const tr of video.textTracks) tr.mode = 'disabled';   // as legendas são desenhadas aqui, com o mesmo texto da faixa
  // capítulos viram botões
  const caps = $$('[data-vi-cap]').map(li => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = li.innerHTML; li.innerHTML = ''; li.appendChild(b); return b; });

  let carregado = false, comLegenda = guarda.le('cmw-video-legendas') !== '0', arrastando = false, raf = 0;
  let legAtual = -2, capAtual = -1, tocouGelo = false, emToque = false, tToque = 0, aberto = null, voltaTocando = false, mostrouDica = false, noFim = false;
  // pontos já abertos: ficam marcados na lista, e a contagem aparece no título dela
  let vistos = new Set();
  try { vistos = new Set(JSON.parse(guarda.le('cmw-video-pontos') || '[]').filter(id => porId[id])); } catch { /* lista inválida: começa do zero */ }
  const conta = () => {
    chips.forEach(b => b.classList.toggle('visto', vistos.has(b.dataset.viChip)));
    const n = vistos.size, tot = D.pontos.length;
    elConta.textContent = n === 0 ? '' : n >= tot ? `Os ${tot} explorados: você foi além do raso` : `${n} de ${tot} explorados`;
    elConta.classList.toggle('cheio', n >= tot);
  };

  // 1080p em tela larga; 720p em tela pequena ou com economia de dados
  const carrega = () => {
    if (carregado) return;
    carregado = true;
    const economia = navigator.connection && navigator.connection.saveData;
    video.src = innerWidth >= 1100 && !economia ? D.hd : D.sd;
    video.load();
  };
  const tocar = () => { carrega(); const p = video.play(); if (p && p.catch) p.catch(() => { /* o navegador negou: o botão continua disponível */ }); };
  const vai = t => {
    carrega();
    const alvo = Math.max(0, Math.min(D.dur - 0.05, t));
    if (video.readyState >= 1) video.currentTime = alvo;
    else video.addEventListener('loadedmetadata', () => { video.currentTime = alvo; }, { once: true });
    if (alvo < D.pausa.t - 0.6) tocouGelo = false;   // voltou para antes do toque: o momento vale de novo
    if (alvo < D.fim - 0.3) escondeFim();
    fechaToque();
    pinta(alvo);
  };

  // ---------- o que muda com o tempo ----------
  function pinta(t) {
    if (!arrastando) prog.value = t;
    prog.style.setProperty('--p', (t / D.dur * 100).toFixed(2) + '%');
    const txt = mmss(t);
    if (elT.textContent !== txt) { elT.textContent = txt; prog.setAttribute('aria-valuetext', `${txt} de ${mmss(D.dur)}`); }
    // capítulo
    let c = 0; for (let i = 0; i < D.caps.length; i++) if (t >= D.caps[i].t - 0.05) c = i;
    if (c !== capAtual) {
      capAtual = c; caps.forEach((b, i) => { if (i === c) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); b.classList.toggle('feito', i < c); });
      // no celular os capítulos rolam de lado: a lista acompanha o filme (só a lista se mexe, a página não)
      const lista = caps[c].closest('ol');
      if (lista.scrollWidth > lista.clientWidth + 4) lista.scrollTo({ left: lista.scrollLeft + caps[c].getBoundingClientRect().left - lista.getBoundingClientRect().left - parseFloat(getComputedStyle(lista).paddingLeft || 0), behavior: 'smooth' });
    }
    // legenda: o último bloco que já começou e ainda não terminou
    let l = -1; for (let i = 0; i < D.leg.length; i++) if (t >= D.leg[i][0] && t <= D.leg[i][1]) l = i;
    if (!comLegenda) l = -1;
    if (l !== legAtual) { legAtual = l; elLeg.hidden = l < 0; if (l >= 0) elLeg.textContent = D.leg[l][2]; }
    // pontos clicáveis
    let algum = false;
    for (const b of pontos) { const p = porId[b.dataset.viPonto], v = t >= p.de && t <= p.ate && !noFim; if (b.hidden === v) b.hidden = !v; algum = algum || v; }
    if (algum && !mostrouDica && !video.paused) { mostrouDica = true; elDica.hidden = false; setTimeout(() => { elDica.hidden = true; }, 4200); }
    if (!algum && !elDica.hidden) elDica.hidden = true;
    // o momento do toque: o vídeo para e espera
    if (!tocouGelo && !video.paused && !video.seeking && !video.webkitDisplayingFullscreen && t >= D.pausa.t && t < D.pausa.t + 0.6) pedeToque();
    // tela final
    if (t >= D.fim - 0.02 && !noFim) mostraFim();
  }
  const passo = () => { pinta(video.currentTime); raf = video.paused || video.ended ? 0 : requestAnimationFrame(passo); };
  const botoes = () => {
    const toca = !video.paused && !video.ended;
    bTocar.innerHTML = ic(toca ? 'pausa' : 'play'); bTocar.setAttribute('aria-label', toca ? 'Pausar' : video.ended ? 'Ver de novo' : 'Reproduzir');
    vi.classList.toggle('vi--tocando', toca);
    vi.classList.toggle('vi--comecou', carregado && (video.currentTime > 0.05 || toca));
    // pausado no meio do filme, sem cartão, toque ou quadro final: o botão do centro volta, só o ícone
    vi.classList.toggle('vi--pausado', carregado && !toca && !video.ended && video.currentTime > 0.05 && !emToque && !aberto && !noFim);
  };

  // ---------- toque no gelo ----------
  function pedeToque() {
    tocouGelo = true; emToque = true;
    video.pause();
    toque.hidden = false; vi.classList.add('vi--toque'); botoes();
    if (vi.contains(document.activeElement)) $('[data-vi-quebrar]').focus({ preventScroll: true });
    clearTimeout(tToque); tToque = setTimeout(segue, 9000);   // se ninguém tocar, o filme segue sozinho
  }
  function fechaToque() { if (!emToque) return; emToque = false; clearTimeout(tToque); toque.hidden = true; vi.classList.remove('vi--toque'); botoes(); }
  function segue() { if (!emToque) return; fechaToque(); tocar(); }
  $('[data-vi-quebrar]').addEventListener('click', () => { vi.classList.add('vi--quebrou'); setTimeout(() => vi.classList.remove('vi--quebrou'), 700); segue(); });
  $('[data-vi-seguir]').addEventListener('click', segue);

  // ---------- cartão de um ponto ----------
  function abre(id, foco = true) {
    const p = porId[id]; if (!p) return;
    if (!aberto) voltaTocando = !video.paused && !video.ended;
    fechaToque();
    video.pause();
    elDica.hidden = true;
    aberto = id;
    if (!vistos.has(id)) { vistos.add(id); guarda.poe('cmw-video-pontos', JSON.stringify([...vistos])); conta(); }
    $('[data-vi-c-grupo]').textContent = p.g; $('[data-vi-c-tit]').textContent = p.t; $('[data-vi-c-texto]').textContent = p.tx; $('[data-vi-c-fz]').textContent = p.fz;
    const a = $('[data-vi-c-link]'); a.hidden = !p.l; if (p.l) { a.href = p.l[1]; a.firstElementChild.textContent = p.l[0]; }
    cartao.classList.toggle('vi-cartao--e', p.x + p.w / 2 > 50);   // o cartão abre do lado oposto ao ponto
    cartao.hidden = false; vi.classList.add('vi--cartao'); botoes();
    pontos.forEach(b => b.classList.toggle('aberto', b.dataset.viPonto === id));
    chips.forEach(b => { if (b.dataset.viChip === id) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    if (foco) $('[data-vi-c-tit]').focus({ preventScroll: true });
    const q = cartao.getBoundingClientRect();   // em tela pequena o cartão fica abaixo do vídeo: traz para a vista
    if (q.bottom > innerHeight || q.top < 60) cartao.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function fecha(continua) {
    if (!aberto) return;
    const id = aberto; aberto = null;
    cartao.hidden = true; vi.classList.remove('vi--cartao'); botoes();
    pontos.forEach(b => b.classList.remove('aberto')); chips.forEach(b => b.removeAttribute('aria-current'));
    if (continua) tocar();
    else { const b = pontos.find(x => x.dataset.viPonto === id && !x.hidden) || chips.find(x => x.dataset.viChip === id); if (b && vi.contains(document.activeElement)) b.focus({ preventScroll: true }); }
  }
  pontos.forEach(b => b.addEventListener('click', () => abre(b.dataset.viPonto)));
  // pela lista: leva o vídeo até um quadro em que o ponto está na tela e abre o cartão
  chips.forEach(b => b.addEventListener('click', () => { const p = porId[b.dataset.viChip]; vai(Math.max(p.de + 0.2, p.ate - 0.3)); video.pause(); abre(p.id); palco.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }));
  $('[data-vi-continuar]').addEventListener('click', () => fecha(true));

  // ---------- tela final ----------
  function mostraFim() { noFim = true; fim.hidden = false; vi.classList.add('vi--fim'); pontos.forEach(b => { b.hidden = true; }); botoes(); }
  function escondeFim() { if (!noFim) return; noFim = false; fim.hidden = true; vi.classList.remove('vi--fim'); botoes(); }
  $('[data-vi-denovo]').addEventListener('click', () => { vai(0); tocar(); bTocar.focus({ preventScroll: true }); });

  // ---------- controles ----------
  const alterna = () => { if (emToque) return segue(); if (aberto) return fecha(true); if (video.ended) { vai(0); return tocar(); } if (video.paused) tocar(); else video.pause(); };
  bPlay.addEventListener('click', () => { tocar(); bTocar.focus({ preventScroll: true }); });
  bTocar.addEventListener('click', alterna);
  video.addEventListener('click', alterna);
  const poeLegenda = v => { comLegenda = v; bLeg.setAttribute('aria-pressed', String(v)); guarda.poe('cmw-video-legendas', v ? '1' : '0'); legAtual = -2; pinta(video.currentTime); };
  bLeg.addEventListener('click', () => poeLegenda(!comLegenda));
  const poeSom = () => { const on = !video.muted; bSom.setAttribute('aria-pressed', String(on)); bSom.innerHTML = ic(on ? 'som' : 'mudo'); bSom.setAttribute('aria-label', on ? 'Som ligado' : 'Som desligado'); };
  bSom.addEventListener('click', () => { video.muted = !video.muted; poeSom(); });
  const cheia = () => {
    const el = document.fullscreenElement || document.webkitFullscreenElement;
    if (el) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else if (tela.requestFullscreen) tela.requestFullscreen().catch(() => {});
    else if (tela.webkitRequestFullscreen) tela.webkitRequestFullscreen();
    else if (video.webkitEnterFullscreen) { carrega(); for (const tr of video.textTracks) tr.mode = comLegenda ? 'showing' : 'disabled'; video.webkitEnterFullscreen(); }   // iPhone: só o vídeo vai para a tela cheia, com a legenda do navegador
  };
  bCheia.addEventListener('click', cheia);
  video.addEventListener('webkitendfullscreen', () => { for (const tr of video.textTracks) tr.mode = 'disabled'; });
  prog.addEventListener('pointerdown', () => { arrastando = true; });
  prog.addEventListener('input', () => { arrastando = true; fecha(false); vai(+prog.value); });
  const solta = () => { arrastando = false; };
  prog.addEventListener('change', solta); addEventListener('pointerup', solta);
  caps.forEach((b, i) => b.addEventListener('click', () => { fecha(false); vai(D.caps[i].t + 0.02); tocar(); palco.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }));

  // teclado, com o foco dentro do player
  vi.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target, botao = el.closest('button, a, summary');
    if (e.key === 'Escape') { if (aberto) { e.preventDefault(); fecha(false); } return; }
    if ((e.key === ' ' || e.key === 'k' || e.key === 'K') && (!botao || e.key !== ' ')) { e.preventDefault(); alterna(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); fecha(false); vai(video.currentTime + 5); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); fecha(false); vai(video.currentTime - 5); }
    else if (e.key === 'Home' && !botao) { e.preventDefault(); fecha(false); vai(0); }
    else if (e.key === 'm' || e.key === 'M') { video.muted = !video.muted; poeSom(); }
    else if (e.key === 'c' || e.key === 'C') poeLegenda(!comLegenda);
    else if (e.key === 'f' || e.key === 'F') cheia();
  });

  // ---------- eventos do vídeo ----------
  video.addEventListener('play', () => { fechaToque(); if (aberto) fecha(false); botoes(); if (!raf) raf = requestAnimationFrame(passo); });
  video.addEventListener('pause', () => { botoes(); pinta(video.currentTime); });
  video.addEventListener('ended', () => { botoes(); pinta(D.dur); });
  video.addEventListener('seeked', () => { botoes(); pinta(video.currentTime); });
  video.addEventListener('timeupdate', () => { if (!raf) pinta(video.currentTime); });
  video.addEventListener('waiting', () => vi.classList.add('vi--espera'));
  for (const ev of ['playing', 'canplay', 'pause', 'seeked']) video.addEventListener(ev, () => vi.classList.remove('vi--espera'));
  video.addEventListener('error', () => { if (!carregado) return; vi.classList.add('vi--erro'); elErro.hidden = false; });
  video.addEventListener('volumechange', poeSom);
  // fora da tela, o vídeo descansa (não fica só o som tocando)
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (!es[0].isIntersecting && !video.paused && !(document.fullscreenElement || document.webkitFullscreenElement)) video.pause(); }, { threshold: 0.12 }).observe(palco);

  bLeg.setAttribute('aria-pressed', String(comLegenda));
  poeSom(); botoes(); conta(); pinta(0);
  // atalho da abertura: "Ver o vídeo" traz o player para a tela e começa a tocar
  document.querySelectorAll('[data-vi-abrir]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); palco.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); tocar(); bTocar.focus({ preventScroll: true }); }));
})();
