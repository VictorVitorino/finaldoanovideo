// Change Management World · iceberg da abertura.
// A cena é mais alta que a janela: mergulhar é deslocar a câmera para baixo. Dá para arrastar a cena (mouse),
// arrastar a sonda (mouse ou dedo), usar o botão ou o teclado. Os pontos abaixo d'água abrem reportagens (ux.js).
(() => {
  const caixa = document.querySelector('[data-mergulho]');
  if (!caixa) return;
  const $ = s => caixa.querySelector(s);
  const janela = $('.cena-janela'), mundo = $('.cena-mundo'), sonda = $('[data-sonda]'), pega = $('.sonda-pega'), metros = $('.sonda-m'), zona = $('[data-zona]'), botao = $('[data-mergulhar]');
  if (!janela || !mundo || !sonda) return;
  caixa.classList.add('vivo');   // a partir daqui o CSS troca a cena rolável pela cena com mergulho
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LARGURA = 560, AGUA = 300, POR_METRO = 16;   // medidas do desenho (ilustra.mjs)
  let zonas = [];
  try { zonas = JSON.parse(caixa.dataset.zonas || '[]'); } catch { /* sem zonas: só a profundidade */ }
  let p = 0, curso = 0, zonaAtual = -1, usou = false, inercia = 0, suprime = false;

  const aplica = (v, suave) => {
    p = Math.min(1, Math.max(0, v));
    mundo.classList.toggle('suave', !!suave && !calmo); sonda.classList.toggle('suave', !!suave && !calmo);
    mundo.style.setProperty('--y', (p * curso).toFixed(1));
    sonda.style.setProperty('--p', p.toFixed(4));
    const escala = mundo.offsetWidth / LARGURA || 1, centro = (p * curso + janela.clientHeight / 2) / escala, m = Math.max(0, Math.round((centro - AGUA) / POR_METRO));
    metros.textContent = m + ' m';
    const i = Math.max(0, zonas.findIndex(z => p <= z.ate + 1e-6)), z = zonas[i];
    pega.setAttribute('aria-valuenow', Math.round(p * 100));
    pega.setAttribute('aria-valuetext', (z ? z.nome + ', ' : '') + m + ' metros');
    if (z && i !== zonaAtual) {
      zonaAtual = i; zona.querySelector('b').textContent = z.nome; zona.querySelector('span').textContent = z.frase;
      zona.classList.remove('troca'); void zona.offsetWidth; zona.classList.add('troca');
    }
    const fundo = p > 0.97;
    sonda.classList.toggle('fundo', fundo); botao.classList.toggle('subir', fundo);
    botao.querySelector('span').textContent = fundo ? 'Voltar à superfície' : p > 0.05 ? 'Descer mais' : 'Mergulhar';
  };
  const mede = () => { curso = Math.max(0, mundo.offsetHeight - janela.clientHeight); aplica(p, false); };
  const marcaUso = () => { usou = true; cancelAnimationFrame(inercia); };

  // arrastar a cena (mouse e caneta; no toque, o gesto vertical continua rolando a página)
  let arr = null;
  janela.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || e.button || e.target.closest('.sonda, .cena-botao')) return;
    marcaUso(); arr = { y: e.clientY, p0: p, moveu: false, v: 0, t: e.timeStamp, uy: e.clientY };
  });
  addEventListener('pointermove', e => {
    if (!arr || !curso) return;
    const dy = e.clientY - arr.y;
    if (!arr.moveu) { if (Math.abs(dy) < 5) return; arr.moveu = true; janela.classList.add('pegando'); }
    aplica(arr.p0 - dy / curso, false);
    const dt = e.timeStamp - arr.t;
    if (dt > 0) { arr.v = (e.clientY - arr.uy) / dt; arr.uy = e.clientY; arr.t = e.timeStamp; }
  });
  addEventListener('pointerup', () => {
    if (!arr) return;
    const a = arr; arr = null; janela.classList.remove('pegando');
    if (!a.moveu) return;
    suprime = true; setTimeout(() => { suprime = false; }, 60);
    let v = -a.v / curso;   // continua um pouco depois de soltar
    const passo = () => { if (Math.abs(v) < 0.00003 || calmo) return; aplica(p + v * 16, false); v *= 0.93; inercia = requestAnimationFrame(passo); };
    passo();
  });
  janela.addEventListener('click', e => { if (suprime) { e.preventDefault(); e.stopPropagation(); } }, true);
  // um clique na água solta bolhas
  janela.addEventListener('click', e => {
    if (calmo || e.target.closest('a, button, .sonda')) return;
    const r = janela.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, escala = mundo.offsetWidth / LARGURA || 1;
    if ((y + p * curso) / escala < AGUA + 8) return;   // acima da linha d'água não há bolha
    for (let i = 0; i < 7; i++) {
      const b = document.createElement('i'), t = 4 + Math.random() * 10;
      b.className = 'borbulha';
      b.style.cssText = `left:${x}px;top:${y}px;width:${t}px;height:${t}px;--dx:${((Math.random() - 0.5) * 70).toFixed(0)}px;--dy:${(-50 - Math.random() * 110).toFixed(0)}px;--t:${(0.7 + Math.random() * 0.8).toFixed(2)}s`;
      janela.appendChild(b); setTimeout(() => b.remove(), 1600);
    }
  });
  janela.addEventListener('dragstart', e => e.preventDefault());
  janela.addEventListener('scroll', () => { janela.scrollTop = 0; });   // o foco em um ponto não pode rolar a janela por conta própria

  // sonda: arrastar a alça, clicar no trilho e teclado
  const deSonda = (y, folga = 22) => { const r = sonda.getBoundingClientRect(); return (y - r.top - folga) / (r.height - 72); };
  sonda.addEventListener('pointerdown', e => {
    if (e.button) return;
    e.preventDefault(); marcaUso();
    const naAlca = e.target.closest('.sonda-pega'), folga = naAlca ? e.clientY - pega.getBoundingClientRect().top : 22;
    if (!naAlca) aplica(deSonda(e.clientY), true);
    pega.classList.add('pegando');
    try { pega.setPointerCapture(e.pointerId); } catch { /* segue sem captura */ }
    const move = ev => aplica(deSonda(ev.clientY, folga), false);
    const solta = () => { pega.classList.remove('pegando'); pega.removeEventListener('pointermove', move); pega.removeEventListener('pointerup', solta); pega.removeEventListener('pointercancel', solta); };
    pega.addEventListener('pointermove', move); pega.addEventListener('pointerup', solta); pega.addEventListener('pointercancel', solta);
  });
  pega.addEventListener('keydown', e => {
    const d = { ArrowDown: 0.06, ArrowRight: 0.06, ArrowUp: -0.06, ArrowLeft: -0.06, PageDown: 0.25, PageUp: -0.25 }[e.key];
    if (d) { e.preventDefault(); marcaUso(); aplica(p + d, true); }
    else if (e.key === 'Home') { e.preventDefault(); marcaUso(); aplica(0, true); }
    else if (e.key === 'End') { e.preventDefault(); marcaUso(); aplica(1, true); }
  });
  botao.addEventListener('click', () => { marcaUso(); aplica(p > 0.97 ? 0 : [0.3, 0.62, 1].find(a => a > p + 0.04) || 1, true); });

  // um ponto que recebe foco pelo teclado vem para o meio da janela
  mundo.addEventListener('focusin', e => {
    const a = e.target.closest('.ponto'); if (!a || !curso || a.matches(':hover')) return;
    marcaUso(); aplica((a.parentElement.offsetTop - janela.clientHeight / 2) / curso, true); janela.scrollTop = 0;
  });

  // os pontos surgem quando entram na janela; fora da tela, a animação da cena descansa
  if ('IntersectionObserver' in window) {
    const ve = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visto'); ve.unobserve(en.target); } }), { root: janela, threshold: 0.6 });
    caixa.querySelectorAll('.cena-fundo li').forEach(li => ve.observe(li));
    new IntersectionObserver(es => {
      caixa.classList.toggle('fora', !es[0].isIntersecting);
      // convite: na primeira vez em que a cena aparece, a câmera desce um pouco e volta
      if (es[0].isIntersecting && !usou && !calmo && !caixa.dataset.convite) {
        caixa.dataset.convite = '1';
        const espera = document.documentElement.classList.contains('vinheta') ? 3400 : 1800;
        setTimeout(() => { if (!usou) { aplica(0.11, true); setTimeout(() => { if (!usou) aplica(0, true); }, 1250); } }, espera);
      }
    }, { threshold: 0.3 }).observe(caixa);
  } else caixa.querySelectorAll('.cena-fundo li').forEach(li => li.classList.add('visto'));

  if ('ResizeObserver' in window) new ResizeObserver(mede).observe(janela); else addEventListener('resize', mede);
  mede();
})();
