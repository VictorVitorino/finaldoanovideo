// Change Management World · apresentações em HTML (motor de slides, sem dependências).
// Um arquivo só: navegação por teclado, toque e clique, etapas por slide, três modos (apresentar, leitura e grade),
// edição do texto na própria tela (fica salva neste navegador), campos que se preenchem uma vez e valem para todos os slides,
// agenda que recalcula os horários, mapa de calor clicável, barras que acompanham os números, notas, cronômetro,
// impressão em PDF (uma página por slide) e download de uma cópia autônoma, com as fontes embutidas.
(() => {
  const raiz = document.documentElement, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const slides = $$('.slide'); if (!slides.length) return;
  raiz.classList.add('js');
  const N = slides.length, ID = raiz.dataset.deck || 'apresentacao', ARQUIVO = raiz.dataset.arquivo === '1';
  const CHAVE = `cmw-deck:${ID}:${raiz.dataset.ver || '1'}${ARQUIVO ? ':arquivo' : ''}`;
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bt = a => $(`[data-acao="${a}"]`), esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = t => { const v = parseFloat(String(t).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')); return isFinite(v) ? v : null; };

  // ---------- o que a pessoa mudou (fica neste navegador) ----------
  let dados = {}; try { dados = JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) {}
  for (const k of ['textos', 'campos', 'graus']) dados[k] = dados[k] || {};
  let gravaEm = 0;
  const grava = () => { clearTimeout(gravaEm); gravaEm = setTimeout(() => { try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) {} }, 250); };
  // só texto e ênfase: nada do que foi colado ou digitado vira marcação solta
  const limpa = html => { const t = document.createElement('template'); t.innerHTML = html; const sai = no => [...no.childNodes].map(n => n.nodeType === 3 ? esc(n.nodeValue) : n.nodeType !== 1 ? '' : /^(EM|STRONG|B|I)$/.test(n.nodeName) ? `<${n.nodeName.toLowerCase()}>${sai(n)}</${n.nodeName.toLowerCase()}>` : n.nodeName === 'BR' ? ' ' : sai(n)).join(''); return sai(t.content); };

  // ---------- campos: preenchidos uma vez, valem para a apresentação inteira ----------
  const campos = $$('[data-campo]');
  // num arquivo baixado, o valor já vem escrito no slide: ele passa a ser o valor do campo
  campos.forEach(e => { const k = e.dataset.campo; if (dados.campos[k] == null && !e.classList.contains('vazio') && e.textContent !== e.dataset.vazio) dados.campos[k] = e.textContent; });
  const poeCampos =() => campos.forEach(e => { const v = (dados.campos[e.dataset.campo] || '').trim(); e.textContent = v || e.dataset.vazio; e.classList.toggle('vazio', !v); });

  // ---------- agenda: horários a partir do início e das durações ----------
  const hm = t => { const m = /^(\d{1,2})\s*[:h]\s*(\d{2})?$/.exec(String(t).trim()); return m ? Math.min(23, +m[1]) * 60 + Math.min(59, +(m[2] || 0)) : null; };
  const hora = min => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  const duracao = min => min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ' ' + String(min % 60).padStart(2, '0') + ' min' : ''}`;
  const calcAgenda = ag => {
    const ini = hm($('.ag-inicio', ag).textContent); let t = ini == null ? +(ag.dataset.ini || 540) : ini; ag.dataset.ini = t; const t0 = t;
    $$('.ag-item', ag).forEach(li => { $('.ag-hora', li).textContent = hora(t); const d = parseInt($('.ag-min', li).textContent, 10); t += d > 0 ? d : 0; });
    $('.ag-total', ag).textContent = `${duracao(t - t0)} de encontro · término às ${hora(t)}`;
  };

  // ---------- mapa de calor: o grau geral da linha é o maior grau entre as dimensões ----------
  const GRAUS = ['Sem impacto', 'Baixo', 'Médio', 'Alto'];
  const poeGrau = (c, g) => { c.dataset.g = g; $('span', c).textContent = g ? GRAUS[g] : '–'; if (c.dataset.th) c.setAttribute('aria-label', `${c.dataset.th}: ${GRAUS[g].toLowerCase()}`); };
  const calcMatriz = m => $$('.mz-l', m).forEach(l => { const g = Math.max(0, ...$$('.mz-c', l).map(c => +c.dataset.g)); poeGrau($('.mz-geral', l), g); });

  // ---------- barras: largura e situação seguem os números (na meta, em atenção, crítico) ----------
  const calcBarras = b => { const max = +b.dataset.max || 100; $$('.br-l', b).forEach(l => {
    const v = num($('.br-v [data-e]', l).textContent), me = $('.br-m [data-e]', l), m = me ? num(me.textContent) : null, inv = l.hasAttribute('data-inv');
    l.style.setProperty('--v', Math.max(0, Math.min(100, (v || 0) / max * 100)).toFixed(1)); if (m != null) l.style.setProperty('--m', Math.max(0, Math.min(100, m / max * 100)).toFixed(1));
    l.dataset.s = m == null || v == null ? 2 : (inv ? v <= m : v >= m) ? 1 : (inv ? v <= m * 1.25 : v >= m * .8) ? 2 : 3;
  }); };
  const recalcula = () => { $$('[data-agenda]').forEach(calcAgenda); $$('[data-matriz]').forEach(calcMatriz); $$('[data-barras]').forEach(calcBarras); };

  // restaura o que estava salvo
  const editaveis = $$('[data-e]');
  editaveis.forEach(e => { const v = dados.textos[e.dataset.e]; if (typeof v === 'string') e.innerHTML = limpa(v); });
  $$('.mz-c[data-k]').forEach(c => { const g = dados.graus[c.dataset.k]; if (g != null) poeGrau(c, Math.max(0, Math.min(3, +g || 0))); });
  poeCampos(); recalcula();

  // ---------- navegação ----------
  const conta = $('.barra-conta'), prog = $('.barra-prog i'), vivo = $('[data-vivo]'), notasP = $('.notas-painel p');
  let i = Math.max(0, Math.min(N - 1, (parseInt(location.hash.replace(/\D/g, ''), 10) || 1) - 1)), passo = 0, modo = 'leitura';
  const maxPasso = s => Math.max(0, ...$$('[data-p]', s).map(e => +e.dataset.p));
  const titulo = s => { const t = $('.sl-tit, .capa-tit, .secao-tit, .msg, .fecho-msg', s); return t ? t.textContent.replace(/\s+/g, ' ').trim() : ''; };
  const contagem = s => { if (calmo) return; $$('[data-conta]', s).forEach(e => { const alvo = num(e.textContent); if (alvo == null) return; const casas = (String(e.textContent).split(',')[1] || '').length, t0 = performance.now(), dur = 900;
    const anda = t => { const k = Math.min(1, (t - t0) / dur), v = alvo * (1 - Math.pow(1 - k, 3)); e.textContent = v.toFixed(casas).replace('.', ','); if (k < 1 && modo === 'apresenta' && slides[i] === s) requestAnimationFrame(anda); else e.textContent = alvo.toFixed(casas).replace('.', ','); };
    requestAnimationFrame(anda); }); };
  const pinta = (anuncia = true) => {
    slides.forEach((s, k) => { const at = k === i, esconde = modo === 'apresenta' && !at; s.classList.toggle('atual', at); s.inert = esconde; if (esconde) s.setAttribute('aria-hidden', 'true'); else s.removeAttribute('aria-hidden');
      if (at || modo !== 'apresenta') $$('[data-p]', s).forEach(e => e.classList.toggle('on', modo !== 'apresenta' || +e.dataset.p <= passo)); });
    conta.textContent = `${i + 1} / ${N}`; prog.style.width = `${(i + (modo === 'apresenta' ? Math.min(1, (passo + 1) / (maxPasso(slides[i]) + 1)) : 1)) / N * 100}%`;
    bt('ant').disabled = modo === 'apresenta' && i === 0 && passo === 0; bt('prox').disabled = modo === 'apresenta' && i === N - 1 && passo >= maxPasso(slides[i]);
    const nt = $('.sl-notas', slides[i]); notasP.textContent = nt ? nt.textContent.trim() : 'Este slide não tem notas.';
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
    if (anuncia) vivo.textContent = `Slide ${i + 1} de ${N}: ${titulo(slides[i])}`;
  };
  const vai = (k, p = 0) => { const novo = Math.max(0, Math.min(N - 1, k)), mudou = novo !== i; i = novo; passo = p === 'fim' ? maxPasso(slides[i]) : p; pinta(); if (mudou && modo === 'apresenta') contagem(slides[i]);
    if (modo === 'leitura') slides[i].scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' }); };
  const proximo = () => { if (modo !== 'apresenta') return vai(i + 1); if (passo < maxPasso(slides[i])) { passo++; pinta(false); } else if (i < N - 1) vai(i + 1); };
  const anterior = () => { if (modo !== 'apresenta') return vai(i - 1); if (passo > 0) { passo--; pinta(false); } else if (i > 0) vai(i - 1, 'fim'); };

  // ---------- modos ----------
  const poeModo = m => {
    modo = m; raiz.classList.remove('m-apresenta', 'm-leitura', 'm-grade'); raiz.classList.add('m-' + m);
    if (m !== 'apresenta' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    slides.forEach(s => m === 'grade' ? s.setAttribute('tabindex', '0') : s.removeAttribute('tabindex'));
    bt('grade').setAttribute('aria-pressed', m === 'grade'); passo = m === 'apresenta' ? 0 : passo; pinta(false);
    if (m !== 'apresenta') slides[i].scrollIntoView({ block: m === 'grade' ? 'center' : 'start' }); else { scrollTo(0, 0); contagem(slides[i]); }
  };
  // na leitura, o slide "atual" é o que está mais perto do meio da tela
  let rolando = false;
  addEventListener('scroll', () => { if (modo !== 'leitura' || rolando) return; rolando = true; requestAnimationFrame(() => { rolando = false; const meio = innerHeight / 2; let melhor = i, dist = Infinity;
    slides.forEach((s, k) => { const r = s.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - meio); if (d < dist) { dist = d; melhor = k; } }); if (melhor !== i) { i = melhor; pinta(false); } }); }, { passive: true });

  // ---------- tela cheia e barra que se recolhe ----------
  let somaEm = 0;
  const acorda = () => { raiz.classList.add('barra-viva'); clearTimeout(somaEm); somaEm = setTimeout(() => raiz.classList.remove('barra-viva'), 2600); };
  const cheia = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else if (raiz.requestFullscreen) { if (modo !== 'apresenta') poeModo('apresenta'); raiz.requestFullscreen().catch(() => aviso('Este navegador não permitiu a tela cheia.')); } };
  document.addEventListener('fullscreenchange', () => { const on = !!document.fullscreenElement; raiz.classList.toggle('cheia', on); bt('cheia').setAttribute('aria-pressed', on); if (on) acorda(); });
  for (const ev of ['mousemove', 'touchstart', 'keydown']) addEventListener(ev, () => { if (raiz.classList.contains('cheia')) acorda(); }, { passive: true });

  // ---------- avisos rápidos ----------
  const cx = $('.aviso'); let avisoEm = 0;
  const aviso = (t, ms = 2600) => { cx.textContent = t; cx.classList.add('on'); clearTimeout(avisoEm); avisoEm = setTimeout(() => cx.classList.remove('on'), ms); };

  // ---------- edição na tela ----------
  const editar = on => { raiz.classList.toggle('editando', on); editaveis.forEach(e => on ? e.setAttribute('contenteditable', 'true') : e.removeAttribute('contenteditable')); bt('editar').setAttribute('aria-pressed', on);
    if (on && modo === 'apresenta') { passo = maxPasso(slides[i]); pinta(false); } if (on) aviso('Clique em um texto para mudar. Fica salvo neste navegador.', 4200); if (!on && document.activeElement && document.activeElement.blur) document.activeElement.blur(); };
  document.addEventListener('input', e => { const el = e.target.closest ? e.target.closest('[data-e]') : null; if (!el) return; dados.textos[el.dataset.e] = limpa(el.innerHTML); grava();
    const ag = el.closest('[data-agenda]'), br = el.closest('[data-barras]'); if (ag) calcAgenda(ag); if (br) calcBarras(br); });
  document.addEventListener('paste', e => { if (!(e.target.closest && e.target.closest('[data-e]'))) return; e.preventDefault(); const t = ((e.clipboardData || window.clipboardData).getData('text/plain') || '').replace(/\s*\n\s*/g, ' ');
    if (!document.execCommand || !document.execCommand('insertText', false, t)) { const sel = getSelection(); if (sel.rangeCount) { sel.deleteFromDocument(); sel.getRangeAt(0).insertNode(document.createTextNode(t)); sel.collapseToEnd(); e.target.dispatchEvent(new Event('input', { bubbles: true })); } } });
  const restaura = () => { if (!confirm('Voltar ao texto original desta apresentação? As suas alterações neste navegador serão apagadas.')) return; try { localStorage.removeItem(CHAVE); } catch (e) {} location.reload(); };

  // ---------- painéis (personalizar e atalhos) ----------
  const painel = n => $(`dialog[data-painel="${n}"]`);
  const abre = (n, foco) => { const d = painel(n); if (!d || !d.showModal) return; if (n === 'campos') $$('input[name]', d).forEach(inp => { inp.value = dados.campos[inp.name] || ''; }); d.showModal(); const alvo = foco && $(`input[name="${foco}"]`, d); if (alvo) alvo.focus(); };
  const fCampos = $('dialog[data-painel="campos"] form');
  if (fCampos) fCampos.addEventListener('submit', () => { $$('input[name]', fCampos).forEach(inp => { dados.campos[inp.name] = inp.value.trim(); }); poeCampos(); grava(); aviso('Campos aplicados em todos os slides.'); });
  $$('dialog [data-fechar]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('dialog.painel').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  // ---------- cronômetro ----------
  const cron = $('.cron'), mostrador = $('output', cron); let resto = 300, total = 300, fimEm = 0, tique = 0;
  const pintaCron = () => { const s = Math.max(0, Math.ceil(resto)); mostrador.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; cron.classList.toggle('fim', s === 0); $('[data-cron="tocar"] span', cron).textContent = tique ? 'Pausar' : 'Iniciar'; };
  const paraCron = () => { clearInterval(tique); tique = 0; pintaCron(); };
  const tocaCron = () => { if (tique) return paraCron(); if (resto <= 0) resto = total; fimEm = Date.now() + resto * 1000; tique = setInterval(() => { resto = (fimEm - Date.now()) / 1000; if (resto <= 0) { resto = 0; paraCron(); aviso('Tempo encerrado.', 5000); } else pintaCron(); }, 250); pintaCron(); };
  const poeCron = min => { paraCron(); total = resto = Math.max(1, min) * 60; cron.classList.add('on'); bt('cron').setAttribute('aria-pressed', 'true'); pintaCron(); };
  cron.addEventListener('click', e => { const b = e.target.closest('[data-cron]'); if (!b) return; const a = b.dataset.cron;
    if (a === 'tocar') tocaCron(); if (a === 'mais') { resto += 60; total = Math.max(total, resto); if (tique) fimEm += 60000; pintaCron(); } if (a === 'zerar') { paraCron(); resto = total; pintaCron(); }
    if (a === 'fechar') { paraCron(); cron.classList.remove('on'); bt('cron').setAttribute('aria-pressed', 'false'); } });

  // ---------- baixar uma cópia autônoma (com as fontes embutidas) ----------
  const base64 = buf => { let s = ''; const b = new Uint8Array(buf); for (let k = 0; k < b.length; k += 0x8000) s += String.fromCharCode.apply(null, b.subarray(k, k + 0x8000)); return btoa(s); };
  const embute = async css => { const urls = [...new Set([...css.matchAll(/url\(['"]?([^'")]+\.woff2)['"]?\)/g)].map(m => m[1]))];
    for (const u of urls) { const r = await fetch(new URL(u, document.baseURI)); if (!r.ok) throw new Error(u); css = css.split(u).join(`data:font/woff2;base64,${base64(await r.arrayBuffer())}`); } return css; };
  const baixar = async () => {
    aviso('Preparando o arquivo…', 8000);
    const c = raiz.cloneNode(true);
    c.className = ''; c.removeAttribute('style'); c.dataset.arquivo = '1';
    $$('[contenteditable]', c).forEach(e => e.removeAttribute('contenteditable'));
    $$('.on, .atual, .agora, .feito, .fim', c).forEach(e => e.classList.remove('on', 'atual', 'agora', 'feito', 'fim'));
    $$('[inert], [aria-hidden="true"].slide, [tabindex].slide', c).forEach(e => { e.removeAttribute('inert'); e.removeAttribute('aria-hidden'); e.removeAttribute('tabindex'); });
    $$('dialog[open]', c).forEach(d => d.removeAttribute('open'));
    $$('[aria-pressed]', c).forEach(e => e.setAttribute('aria-pressed', 'false'));
    const st = $('#dk-fontes', c);
    if (st && !/base64,/.test(st.textContent)) { try { st.textContent = await embute(st.textContent); } catch (e) { st.textContent = ''; } }
    const nome = (dados.campos.projeto || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '-').slice(0, 40);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['<!doctype html>\n' + c.outerHTML], { type: 'text/html;charset=utf-8' })); a.download = `${ID}${nome ? '-' + nome : ''}.html`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 6000);
    aviso('Arquivo baixado: abre em qualquer navegador, mesmo sem internet.', 5000);
  };

  // ---------- comandos da barra ----------
  const ACOES = { ant: anterior, prox: proximo, apresentar: () => poeModo('apresenta'), leitura: () => poeModo('leitura'), grade: () => poeModo(modo === 'grade' ? 'apresenta' : 'grade'),
    notas: () => { const on = raiz.classList.toggle('com-notas'); bt('notas').setAttribute('aria-pressed', on); }, editar: () => editar(!raiz.classList.contains('editando')), campos: () => abre('campos'), ajuda: () => abre('ajuda'),
    cron: () => { if (cron.classList.contains('on')) { paraCron(); cron.classList.remove('on'); bt('cron').setAttribute('aria-pressed', 'false'); } else poeCron(5); }, cheia, pdf: () => { editar(false); print(); }, baixar, restaurar: restaura, concluir: () => editar(false) };
  document.addEventListener('click', e => {
    const b = e.target.closest ? e.target.closest('[data-acao]') : null; if (b) { const f = ACOES[b.dataset.acao]; if (f) { e.preventDefault(); f(); } return; }
    const s = e.target.closest('.slide'); if (!s) return;
    if (modo === 'grade') { i = slides.indexOf(s); poeModo('apresenta'); return; }
    const edita = raiz.classList.contains('editando');
    const cp = e.target.closest('[data-campo]'); if (cp && edita) { abre('campos', cp.dataset.campo); return; }
    const cel = e.target.closest('.mz-c'); if (cel) { if (edita) { const g = (+cel.dataset.g + 1) % 4; poeGrau(cel, g); dados.graus[cel.dataset.k] = g; grava(); calcMatriz(cel.closest('[data-matriz]')); } return; }
    if (edita || modo !== 'apresenta') return;
    const item = e.target.closest('.ag-item'); if (item) { const era = item.classList.contains('agora'), todos = $$('.ag-item', item.closest('.ag-lista')); todos.forEach(x => x.classList.remove('agora', 'feito'));
      if (!era) { item.classList.add('agora'); todos.slice(0, todos.indexOf(item)).forEach(x => x.classList.add('feito')); if (item.classList.contains('ag-item--pausa')) { poeCron(parseInt($('.ag-min', item).textContent, 10) || 10); tocaCron(); } } return; }
    if (e.target.closest('a, button, summary, input, label') || String(getSelection()).length) return;
    proximo();
  });

  // ---------- teclado e toque ----------
  addEventListener('keydown', e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target, digitando = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    if (digitando) { if (t.isContentEditable && (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey))) { e.preventDefault(); t.blur(); } return; }
    if ($('dialog[open]')) return;
    const k = e.key, noBotao = t.closest && t.closest('button, a, summary');
    if (modo === 'grade' && (k === 'Enter' || k === ' ') && t.classList && t.classList.contains('slide')) { e.preventDefault(); i = slides.indexOf(t); poeModo('apresenta'); return; }
    if (modo === 'apresenta') {
      if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(k) || ((k === ' ' || k === 'Enter') && !noBotao)) { e.preventDefault(); return proximo(); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); return anterior(); }
      if (k === 'Home') { e.preventDefault(); return vai(0); } if (k === 'End') { e.preventDefault(); return vai(N - 1); }
    }
    const a = { f: 'cheia', g: 'grade', n: 'notas', e: 'editar', p: 'campos', t: 'cron', l: 'leitura', a: 'apresentar', '?': 'ajuda' }[k.toLowerCase()];
    if (a) { e.preventDefault(); ACOES[a](); }
    if (k === 'Escape') { if (raiz.classList.contains('editando')) editar(false); else if (modo === 'grade') poeModo('apresenta'); }
  });
  let tx = 0, ty = 0;
  const palco = $('.slides');
  palco.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  palco.addEventListener('touchend', e => { if (modo !== 'apresenta' || raiz.classList.contains('editando')) return; const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) { e.preventDefault(); dx < 0 ? proximo() : anterior(); } });
  addEventListener('hashchange', () => { const k = (parseInt(location.hash.replace(/\D/g, ''), 10) || 1) - 1; if (k !== i && k >= 0 && k < N) vai(k); });

  // começa apresentando em telas largas e em leitura nas estreitas (ou conforme ?modo=)
  const pedido = new URLSearchParams(location.search).get('modo');
  poeModo(pedido === 'leitura' || pedido === 'grade' ? pedido : pedido === 'apresentar' || matchMedia('(min-width: 861px)').matches ? 'apresenta' : 'leitura');
  pintaCron();
  // na primeira visita, uma dica de como conduzir
  try { if (modo === 'apresenta' && !localStorage.getItem('cmw-deck:dica')) { localStorage.setItem('cmw-deck:dica', '1'); setTimeout(() => aviso('Setas ou clique para avançar · E edita o texto · F abre em tela cheia', 5200), 1400); } } catch (e) {}
})();
