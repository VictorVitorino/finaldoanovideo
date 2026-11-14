// Change Management World · Laboratório: diagnóstico de nível, matriz RACI, mapa de influência e matriz de adoção.
// Sem dependências. Nada é enviado: o que a pessoa preenche fica só no navegador (localStorage, quando disponível).
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raiz = $('[data-ferramenta]');
  if (!raiz) return;
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const guarda = { ler(k) { try { return JSON.parse(localStorage.getItem('cmw-' + k)); } catch { return null; } }, por(k, v) { try { localStorage.setItem('cmw-' + k, JSON.stringify(v)); } catch { /* sem armazenamento: segue só em memória */ } } };
  const baixar = (nome, conteudo, tipo) => { const a = document.createElement('a'); a.href = conteudo instanceof Blob ? URL.createObjectURL(conteudo) : 'data:' + tipo + ';charset=utf-8,' + encodeURIComponent(conteudo); a.download = nome; document.body.appendChild(a); a.click(); a.remove(); };
  // CSV com ponto e vírgula e BOM, para abrir direto no Excel em português
  const csv = linhas => '﻿' + linhas.map(l => l.map(c => { const s = String(c ?? ''); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\r\n');
  const svgParaPng = (svg, nome, w, h) => new Promise(ok => {
    const img = new Image(), txt = new XMLSerializer().serializeToString(svg);
    img.onload = () => { const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); c.toBlob(b => { baixar(nome, b); ok(); }, 'image/png'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt);
  });
  const acao = (nome, fn) => $$(`[data-acao="${nome}"]`, raiz).forEach(b => b.addEventListener('click', e => fn(e, b)));
  const AZP = '#0A2463', AZ = '#2F6FED', CZ = '#667085', LIN = '#E0E5EC', TINTA = '#0B1530', FONTE = 'Inter, Arial, sans-serif';
  const NIVEIS = [['Resiste', '#98A2B3', 'Escuta', 'ouvir o motivo e ajustar a mensagem'], ['Observa', '#667085', 'Exemplo', 'mostrar funcionando, com gente parecida'], ['Experimenta', '#9DBDFF', 'Prática', 'tempo protegido e apoio por perto'], ['Adota', '#2F6FED', 'Reforço', 'reconhecer e tirar atritos da rotina'], ['Multiplica', '#0A2463', 'Palco', 'dar voz e formar a rede']];

  // ================= diagnóstico de nível =================
  function diagnostico() {
    const D = window.CMW_DIAG;
    if (!D || !D.dominios.length) return;
    const etapa = n => $$('[data-etapa]', raiz).forEach(e => { e.hidden = e.dataset.etapa !== n; });
    const embaralha = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
    let prova = [], pos = 0, modo = 'completo';
    const monta = m => {
      modo = m;
      const porDom = D.dominios.map(d => (m === 'rapido' ? embaralha(d.perguntas).slice(0, 2) : d.perguntas.slice()).map(q => ({ q, dom: d, ordem: embaralha([0, 1, 2, 3]), resp: null })));
      prova = [];
      for (let i = 0; porDom.some(l => l[i]); i++) porDom.forEach(l => { if (l[i]) prova.push(l[i]); });   // intercala os domínios
      pos = 0; etapa('prova'); pergunta(true);
    };
    $$('[data-modo]', raiz).forEach(b => b.addEventListener('click', () => monta(b.dataset.modo)));
    const caixa = $('[data-etapa="prova"]', raiz);
    function pergunta(foco) {
      const it = prova[pos], n = prova.length;
      caixa.innerHTML = `<div class="q-topo"><span class="q-dom">${esc(it.dom.nome)}</span><span class="q-num">Pergunta ${pos + 1} de ${n}</span></div>
        <div class="q-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${pos}" aria-label="Progresso"><i style="width:${(pos / n * 100).toFixed(1)}%"></i></div>
        <h2 class="q-enun" tabindex="-1">${esc(it.q.e)}</h2>
        <div class="q-alts" role="radiogroup" aria-label="Alternativas">${it.ordem.map((o, i) => `<button type="button" class="q-alt" role="radio" aria-checked="${it.resp === o}" data-o="${o}"><span class="q-letra">${'ABCD'[i]}</span><span>${esc(it.q.a[o])}</span></button>`).join('')}</div>
        <div class="q-acoes"><button type="button" class="btn btn--s" data-volta ${pos ? '' : 'disabled'}>Voltar</button><span class="q-dica">Teclas A a D escolhem. Enter confirma.</span><button type="button" class="btn btn--p" data-segue ${it.resp === null ? 'disabled' : ''}>${pos === n - 1 ? 'Ver o relatório' : 'Confirmar e seguir'}</button></div>`;
      if (foco) { const h = $('.q-enun', caixa); h.focus({ preventScroll: true }); raiz.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' }); }
    }
    const escolhe = o => { prova[pos].resp = o; $$('.q-alt', caixa).forEach(b => b.setAttribute('aria-checked', String(+b.dataset.o === o))); $('[data-segue]', caixa).disabled = false; };
    const segue = () => { if (prova[pos].resp === null) return; if (pos < prova.length - 1) { pos++; pergunta(true); } else relatorio(); };
    caixa.addEventListener('click', e => {
      const alt = e.target.closest('.q-alt');
      if (alt) return escolhe(+alt.dataset.o);
      if (e.target.closest('[data-segue]')) return segue();
      if (e.target.closest('[data-volta]') && pos) { pos--; pergunta(true); }
    });
    document.addEventListener('keydown', e => {
      if (caixa.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      const i = 'abcd'.indexOf(e.key.toLowerCase());
      if (i >= 0 && e.key.length === 1) { escolhe(prova[pos].ordem[i]); $$('.q-alt', caixa)[i].focus(); }
      else if (e.key === 'Enter' && prova[pos].resp !== null && !e.target.closest('[data-volta]')) { e.preventDefault(); segue(); }
    });

    function relatorio() {
      const doms = D.dominios.map(d => { const its = prova.filter(p => p.dom === d), ok = its.filter(p => p.resp === p.q.c).length; return { d, its, ok, n: its.length, pct: its.length ? Math.round(ok / its.length * 100) : 0 }; }).filter(x => x.n);
      const acertos = doms.reduce((a, x) => a + x.ok, 0), total = prova.length, pct = Math.round(acertos / total * 100);
      const nivel = D.niveis.filter(n => pct >= n.min).pop(), ordem = doms.slice().sort((a, b) => a.pct - b.pct);
      const estado = p => p >= 75 ? ['Ponto forte', 'forte'] : p >= 50 ? ['Reforçar', 'medio'] : ['Prioridade de estudo', 'fraco'];
      const fortes = doms.filter(x => x.pct >= 75), fracos = ordem.filter(x => x.pct < 75).slice(0, 2);
      // radar
      const N = doms.length, C = 190, R = 128, ang = i => -Math.PI / 2 + i * 2 * Math.PI / N, pt = (i, f) => [C + Math.cos(ang(i)) * R * f, C + Math.sin(ang(i)) * R * f];
      const poli = f => doms.map((_, i) => pt(i, f).map(v => v.toFixed(1)).join(' ')).join('L');
      const dados = doms.map((x, i) => pt(i, Math.max(0.06, x.pct / 100)).map(v => v.toFixed(1)).join(' ')).join('L');
      const radar = `<svg class="radar" viewBox="-78 -6 536 392" role="img" aria-label="Gráfico de radar com o resultado por domínio">${[0.25, 0.5, 0.75, 1].map(f => `<path d="M${poli(f)}Z" fill="none" stroke="${LIN}" stroke-width="1.2"/>`).join('')}${doms.map((_, i) => `<path d="M${C} ${C}L${pt(i, 1).map(v => v.toFixed(1)).join(' ')}" stroke="${LIN}" stroke-width="1.2"/>`).join('')}
        <path class="radar-area" d="M${dados}Z" fill="${AZ}" fill-opacity=".16"/><path class="radar-linha" pathLength="1" d="M${dados}Z" fill="none" stroke="${AZ}" stroke-width="2.6" stroke-linejoin="round"/>
        ${doms.map((x, i) => { const [px, py] = pt(i, Math.max(0.06, x.pct / 100)), [lx, ly] = pt(i, 1.2); return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="${AZP}"/><text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="${Math.abs(lx - C) < 12 ? 'middle' : lx > C ? 'start' : 'end'}" font-family="${FONTE}" font-size="12.5" font-weight="600" fill="${TINTA}">${esc(x.d.curto)} · ${x.pct}%</text>`; }).join('')}</svg>`;
      const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      const estudo = ordem.map(x => {
        const [rot, cls] = estado(x.pct), erradas = [...new Set(x.its.filter(p => p.resp !== p.q.c).map(p => p.q.s))];
        const temas = cls === 'forte' ? erradas : [...new Set([...erradas, ...x.d.estudar])].slice(0, 5);
        return `<article class="rel-dom rel-dom--${cls}"><header><h3>${esc(x.d.nome)}</h3><span class="rel-estado">${rot}</span><strong>${x.ok} de ${x.n}</strong></header><div class="rel-barra"><i style="width:${x.pct}%"></i></div>
          ${temas.length ? `<p class="rel-rot">${cls === 'forte' ? 'Para lapidar' : 'O que estudar'}</p><ul>${temas.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="rel-ok">Você acertou todas as perguntas deste domínio.</p>'}
          ${cls !== 'forte' && (x.d.ler.length || x.d.ferramenta) ? `<p class="rel-rot">No blog</p><ul class="rel-links">${x.d.ler.slice(0, 3).map(l => `<li><a href="${esc(l.u)}">${esc(l.t)}</a></li>`).join('')}${x.d.ferramenta ? `<li><a href="${esc(x.d.ferramenta.u)}">Ferramenta: ${esc(x.d.ferramenta.t)}</a></li>` : ''}</ul>` : ''}</article>`;
      }).join('');
      const plano = fracos.length ? [`Semanas 1 e 2: estude ${fracos.map(x => `"${x.d.estudar[0]}"`).join(' e ')}.`, fracos[0].d.ferramenta ? `Semana 3: aplique em um projeto real com a ferramenta ${fracos[0].d.ferramenta.t} do Laboratório.` : 'Semana 3: escolha um projeto em andamento e aplique um dos modelos estudados a um caso concreto.', 'Semana 4: refaça o diagnóstico completo e compare os domínios.']
        : ['Semanas 1 e 2: escolha um contexto em que você atua pouco (carve-out, due diligence ou IA) e estude um caso.', 'Semana 3: ensine um dos modelos a alguém da sua equipe. Explicar é a melhor forma de consolidar.', 'Semana 4: refaça o diagnóstico no modo completo para confirmar a consistência.'];
      const gabarito = prova.map((p, i) => { const ok = p.resp === p.q.c; return `<details class="gab ${ok ? 'gab--ok' : 'gab--erro'}"><summary><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(p.q.e.length > 120 ? p.q.e.slice(0, 118).replace(/\s+\S*$/, '') + '…' : p.q.e)}</b><i>${ok ? 'Acertou' : 'Rever'}</i></summary><div class="gab-corpo"><p>${esc(p.q.e)}</p>${ok ? '' : `<p><strong>Sua resposta:</strong> ${esc(p.q.a[p.resp])}</p>`}<p><strong>Resposta esperada:</strong> ${esc(p.q.a[p.q.c])}</p><p>${esc(p.q.x)}</p><p class="gab-ref">Referência: ${esc(p.q.r)}</p></div></details>`; }).join('');
      const resumo = `Diagnóstico de nível em Change Management (Change Management World)\nNível: ${nivel.nome} · ${pct}% (${acertos} de ${total})\n${doms.map(x => `- ${x.d.nome}: ${x.pct}%`).join('\n')}\n${fracos.length ? 'Para estudar: ' + fracos.map(x => x.d.nome).join(' e ') + '.' : 'Domínios consistentes em todas as frentes.'}\n${location.href.split('#')[0]}`;
      const rel = $('[data-etapa="relatorio"]', raiz);
      rel.innerHTML = `<header class="rel-cab"><div><span class="olho">Relatório de nível · ${modo === 'rapido' ? 'modo rápido' : 'modo completo'} · ${hoje}</span><h2>Seu nível: <em>${esc(nivel.nome)}</em></h2><p>${esc(nivel.resumo)}</p>
          <div class="rel-nota"><strong data-pct>${pct}%</strong><span>${acertos} de ${total} perguntas${fortes.length ? ` · ${fortes.length} ${fortes.length === 1 ? 'ponto forte' : 'pontos fortes'}` : ''}</span></div></div><div class="rel-radar">${radar}</div></header>
        <div class="rel-acoes nao-imprime"><button type="button" class="btn btn--p" data-r="pdf">Baixar o relatório em PDF</button><button type="button" class="btn btn--s" data-r="copiar"><span>Copiar o resumo</span></button><a class="btn btn--s" data-r="linkedin" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href.split('#')[0])}">Compartilhar no LinkedIn</a><button type="button" class="btn btn--s" data-r="refazer">Refazer</button></div>
        <section class="rel-sec"><h3 class="rel-tit">Resultado por domínio, do que mais pede estudo ao mais forte</h3><div class="rel-doms">${estudo}</div></section>
        <section class="rel-sec rel-duas"><div><h3 class="rel-tit">Desafios típicos do seu nível no dia a dia</h3><ul class="rel-lista">${nivel.desafios.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div><div><h3 class="rel-tit">Plano de 30 dias</h3><ol class="rel-lista rel-lista--n">${plano.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div></section>
        <section class="rel-sec"><h3 class="rel-tit">Gabarito comentado</h3><div class="gabs">${gabarito}</div></section>
        <p class="rel-fim">Diagnóstico formativo do blog Change Management World, de Victor Vitorino. Não é certificação. ${modo === 'rapido' ? 'No modo rápido, cada domínio é medido por duas perguntas: use o resultado como indicação e faça o modo completo para um retrato mais preciso.' : ''}</p>`;
      etapa('relatorio'); rel.setAttribute('tabindex', '-1'); rel.focus({ preventScroll: true }); raiz.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' });
      requestAnimationFrame(() => rel.classList.add('pronto'));
      rel.onclick = async e => {
        const b = e.target.closest('[data-r]'); if (!b) return;
        if (b.dataset.r === 'pdf') { $$('details', rel).forEach(d => { d.open = true; }); print(); }
        else if (b.dataset.r === 'refazer') { rel.classList.remove('pronto'); etapa('inicio'); raiz.scrollIntoView({ block: 'start' }); }
        else if (b.dataset.r === 'copiar') { const s = b.querySelector('span'); try { await navigator.clipboard.writeText(resumo); s.textContent = 'Resumo copiado'; } catch { s.textContent = 'Não foi possível copiar'; } setTimeout(() => { s.textContent = 'Copiar o resumo'; }, 2200); }
      };
    }
  }

  // ================= matriz RACI =================
  function raci() {
    const EX = { modo: 'RACI', papeis: ['Patrocinador', 'Líder do projeto', 'Gestão da mudança', 'Gestores diretos', 'RH', 'TI', 'Multiplicadores'], linhas: [['Definir a estratégia de mudança', 'A C R C C I I'], ['Mapear stakeholders e impactos', 'I A R C C C I'], ['Aprovar as mensagens-chave', 'A R R C I I I'], ['Executar o plano de comunicação', 'C C A R C I R'], ['Preparar e entregar a capacitação', 'I C A C R C R'], ['Preparar os gestores diretos', 'C C A R C I I'], ['Medir a adoção e reportar', 'I C A R I C C'], ['Sustentar e transferir para a operação', 'A R C R C C I']].map(([n, v]) => ({ n, v: v.split(' ') })) };
    const copia = o => JSON.parse(JSON.stringify(o));
    let E = guarda.ler('raci') || copia(EX);
    const LEG = { R: ['Responsável', 'executa a atividade'], A: ['Aprovador', 'responde pelo resultado; um por atividade'], S: ['Suporte', 'ajuda quem executa'], C: ['Consultado', 'opina antes da decisão'], I: ['Informado', 'é avisado depois'] };
    const letras = () => E.modo === 'RASCI' ? ['R', 'A', 'S', 'C', 'I'] : ['R', 'A', 'C', 'I'];
    const tab = $('[data-tabela]', raiz), salva = () => guarda.por('raci', E);
    const confere = l => { const a = l.v.filter(x => x === 'A').length, r = l.v.filter(x => x === 'R').length; return !l.n.trim() && !l.v.some(Boolean) ? null : a === 0 ? 'Falta definir o A' : a > 1 ? 'Mais de um A' : r === 0 ? 'Falta um R' : ''; };
    function desenha() {
      tab.innerHTML = `<table class="matriz matriz--raci"><thead><tr><th scope="col" class="m-ativ">Atividade</th>${E.papeis.map((p, j) => `<th scope="col"><div class="m-papel"><input type="text" value="${esc(p)}" data-papel="${j}" aria-label="Nome do papel ${j + 1}" maxlength="28"><button type="button" class="m-x" data-del-col="${j}" aria-label="Remover o papel ${esc(p)}">×</button></div></th>`).join('')}<th scope="col" class="m-conf">Conferência</th></tr></thead>
        <tbody>${E.linhas.map((l, i) => { const c = confere(l); return `<tr><th scope="row" class="m-ativ"><div class="m-linha"><input type="text" value="${esc(l.n)}" data-ativ="${i}" aria-label="Atividade ${i + 1}" maxlength="70" placeholder="Nova atividade"><button type="button" class="m-x" data-del-lin="${i}" aria-label="Remover a atividade ${esc(l.n)}">×</button></div></th>${E.papeis.map((p, j) => `<td><button type="button" class="m-cel m-cel--${l.v[j] || 'vazio'}" data-i="${i}" data-j="${j}" aria-label="${esc(l.n || 'Atividade ' + (i + 1))}, ${esc(p)}: ${l.v[j] ? LEG[l.v[j]][0] : 'vazio'}">${l.v[j] || ''}</button></td>`).join('')}<td class="m-conf ${c ? 'm-conf--erro' : c === '' ? 'm-conf--ok' : ''}">${c === null ? '' : c || 'OK'}</td></tr>`; }).join('')}</tbody></table>`;
      $('[data-legenda]', raiz).innerHTML = letras().map(k => `<li><span class="m-cel m-cel--${k}">${k}</span><span><b>${LEG[k][0]}</b><small>${LEG[k][1]}</small></span></li>`).join('');
      const prob = E.linhas.map(confere).filter(c => c), tot = E.linhas.filter(l => confere(l) !== null).length;
      $('[data-conferencia]', raiz).innerHTML = prob.length ? `<p class="conf-num"><strong>${prob.length}</strong> de ${tot} atividades pedem ajuste</p><ul class="conf-lista">${Object.entries(prob.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), {})).map(([k, v]) => `<li>${k}: ${v}</li>`).join('')}</ul>` : `<p class="conf-ok">Todas as ${tot} atividades têm um A e ao menos um R.</p>`;
      const max = Math.max(1, ...E.papeis.map((_, j) => E.linhas.filter(l => l.v[j]).length));
      $('[data-carga]', raiz).innerHTML = E.papeis.map((p, j) => { const q = k => E.linhas.filter(l => l.v[j] === k).length; return `<div class="carga"><span>${esc(p)}</span><div class="carga-barra" aria-hidden="true">${letras().map(k => q(k) ? `<i class="m-cel--${k}" style="width:${q(k) / max * 100}%"></i>` : '').join('')}</div><small>${letras().filter(q).map(k => q(k) + k).join(' · ') || 'sem papel'}</small></div>`; }).join('');
      const bm = $('[data-acao="modo"]', raiz); bm.setAttribute('aria-pressed', String(E.modo === 'RASCI')); bm.querySelector('span').textContent = E.modo === 'RASCI' ? 'Voltar para RACI' : 'Usar RASCI';
    }
    tab.addEventListener('click', e => {
      const c = e.target.closest('.m-cel'), dc = e.target.closest('[data-del-col]'), dl = e.target.closest('[data-del-lin]');
      if (c) { const i = +c.dataset.i, j = +c.dataset.j, ord = ['', ...letras()]; E.linhas[i].v[j] = ord[(ord.indexOf(E.linhas[i].v[j] || '') + 1) % ord.length]; salva(); desenha(); $(`.m-cel[data-i="${i}"][data-j="${j}"]`, tab).focus(); }
      else if (dc && E.papeis.length > 2) { const j = +dc.dataset.delCol; E.papeis.splice(j, 1); E.linhas.forEach(l => l.v.splice(j, 1)); salva(); desenha(); }
      else if (dl && E.linhas.length > 1) { E.linhas.splice(+dl.dataset.delLin, 1); salva(); desenha(); }
    });
    tab.addEventListener('keydown', e => {
      const c = e.target.closest('.m-cel'); if (!c) return;
      const i = +c.dataset.i, j = +c.dataset.j, k = e.key.toUpperCase();
      if (letras().includes(k) || e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); E.linhas[i].v[j] = letras().includes(k) ? k : ''; salva(); desenha(); $(`.m-cel[data-i="${i}"][data-j="${j}"]`, tab).focus(); }
      const mov = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key];
      if (mov) { const alvo = $(`.m-cel[data-i="${i + mov[0]}"][data-j="${j + mov[1]}"]`, tab); if (alvo) { e.preventDefault(); alvo.focus(); } }
    });
    tab.addEventListener('change', e => { const t = e.target; if (t.dataset.papel != null) E.papeis[+t.dataset.papel] = t.value.trim() || 'Papel'; else if (t.dataset.ativ != null) E.linhas[+t.dataset.ativ].n = t.value; else return; salva(); desenha(); });
    acao('add-linha', () => { E.linhas.push({ n: '', v: E.papeis.map(() => '') }); salva(); desenha(); $(`[data-ativ="${E.linhas.length - 1}"]`, tab).focus(); });
    acao('add-coluna', () => { if (E.papeis.length >= 10) return; E.papeis.push('Novo papel'); E.linhas.forEach(l => l.v.push('')); salva(); desenha(); const c = $(`[data-papel="${E.papeis.length - 1}"]`, tab); c.focus(); c.select(); });
    acao('modo', () => { E.modo = E.modo === 'RASCI' ? 'RACI' : 'RASCI'; if (E.modo === 'RACI') E.linhas.forEach(l => { l.v = l.v.map(x => x === 'S' ? '' : x); }); salva(); desenha(); });
    acao('exemplo', () => { E = copia(EX); salva(); desenha(); });
    acao('csv', () => baixar('matriz-raci.csv', csv([['Atividade', ...E.papeis, 'Conferência'], ...E.linhas.filter(l => confere(l) !== null).map(l => [l.n, ...l.v, confere(l) || 'OK'])]), 'text/csv'));
    acao('imprimir', () => print());
    desenha();
  }

  // ================= mapa de influência =================
  function influencia() {
    const EX = [['Patrocinador executivo', 0.9, 0.92], ['Diretor de operações', 0.24, 0.88], ['Gerente de TI', 0.55, 0.72], ['Gestores de linha', 0.3, 0.56], ['Usuários-chave', 0.78, 0.34], ['Equipe de atendimento', 0.22, 0.2]].map(([n, x, y], i) => ({ id: i + 1, n, x, y }));
    let L = guarda.ler('influencia') || EX.map(o => ({ ...o })), sel = L[0] ? L[0].id : null, prox = Math.max(0, ...L.map(o => o.id)) + 1;
    const QUAD = [['Conquistar', 'Muita influência, pouco apoio. Prioridade: entender o que a pessoa perde e envolver o patrocinador.', o => o.y >= 0.5 && o.x < 0.5], ['Mobilizar', 'Muita influência e apoio. Dar papel visível na coalizão de patrocínio.', o => o.y >= 0.5 && o.x >= 0.5], ['Ouvir', 'Pouca influência, pouco apoio. Escutar o motivo: pode ser informação sobre o desenho.', o => o.y < 0.5 && o.x < 0.5], ['Envolver', 'Pouca influência formal, apoio alto. Bons multiplicadores.', o => o.y < 0.5 && o.x >= 0.5]];
    const quad = o => QUAD.find(q => q[2](o))[0];
    const P0 = 70, P1 = 610, T = P1 - P0, px = v => P0 + v * T, py = v => P1 - v * T;
    const mapa = $('[data-mapa]', raiz), salva = () => guarda.por('influencia', L);
    const ini = n => n.trim().split(/\s+/).filter(w => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
    function svg(exporta) {
      const rot = (t, x, y, anc = 'start', o = {}) => `<text x="${x}" y="${y}" text-anchor="${anc}" font-family="${FONTE}" font-size="${o.s || 13}" font-weight="${o.w || 600}" fill="${o.c || CZ}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.rot ? ` transform="rotate(-90 ${x} ${y})"` : ''}>${esc(t)}</text>`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 680" ${exporta ? 'width="680" height="680"' : 'role="application" aria-label="Mapa de influência e apoio. Selecione um ponto e use as setas para mover."'}>
        <rect width="680" height="680" fill="#fff"/><rect x="${P0}" y="${P0}" width="${T}" height="${T}" fill="#F7F9FC" stroke="${LIN}" stroke-width="1.5"/>
        <rect x="${P0}" y="${P0}" width="${T / 2}" height="${T / 2}" fill="${AZP}" fill-opacity=".06"/><rect x="${P0 + T / 2}" y="${P0}" width="${T / 2}" height="${T / 2}" fill="${AZ}" fill-opacity=".08"/>
        <path d="M${P0 + T / 2} ${P0}V${P1}M${P0} ${P0 + T / 2}H${P1}" stroke="${LIN}" stroke-width="1.5" stroke-dasharray="4 6"/>
        ${rot('CONQUISTAR', P0 + 16, P0 + 28, 'start', { c: AZP, s: 12, w: 700, ls: 1.6 })}${rot('MOBILIZAR', P1 - 16, P0 + 28, 'end', { c: AZ, s: 12, w: 700, ls: 1.6 })}${rot('OUVIR', P0 + 16, P1 - 16, 'start', { s: 12, w: 700, ls: 1.6 })}${rot('ENVOLVER', P1 - 16, P1 - 16, 'end', { s: 12, w: 700, ls: 1.6 })}
        ${rot('Apoio à mudança', P0 + T / 2, P1 + 46, 'middle', { c: TINTA, s: 14 })}${rot('resiste', P0, P1 + 24)}${rot('apoia', P1, P1 + 24, 'end')}
        ${rot('Influência sobre o resultado', 26, P0 + T / 2, 'middle', { c: TINTA, s: 14, rot: 1 })}${rot('baixa', 50, P1, 'start', { rot: 1 })}${rot('alta', 50, P0, 'end', { rot: 1 })}
        ${L.map(o => { const x = px(o.x), y = py(o.y), s = o.id === sel && !exporta, dir = o.x > 0.72; return `<g class="st${s ? ' st--sel' : ''}" data-id="${o.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"${exporta ? '' : ` tabindex="0" role="button" aria-label="${esc(o.n)}: quadrante ${quad(o)}"`}>${s ? `<circle r="24" fill="none" stroke="${AZ}" stroke-width="2" stroke-dasharray="3 4"/>` : ''}<circle r="17" fill="${o.y >= 0.5 ? (o.x >= 0.5 ? AZ : AZP) : CZ}" stroke="#fff" stroke-width="2.5"/><text y="4.5" text-anchor="middle" font-family="${FONTE}" font-size="11.5" font-weight="700" fill="#fff">${esc(ini(o.n))}</text><text x="${dir ? -25 : 25}" y="4.5" text-anchor="${dir ? 'end' : 'start'}" font-family="${FONTE}" font-size="13" font-weight="600" fill="${TINTA}" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">${esc(o.n)}</text></g>`; }).join('')}</svg>`;
    }
    function lado() {
      const o = L.find(v => v.id === sel);
      $('[data-selecionado]', raiz).innerHTML = o ? `<label class="campo"><span>Nome</span><input type="text" value="${esc(o.n)}" data-c="n" maxlength="40"></label>
        <label class="campo"><span>Apoio à mudança <b>${Math.round(o.x * 100)}</b></span><input type="range" min="0" max="100" value="${Math.round(o.x * 100)}" data-c="x"></label>
        <label class="campo"><span>Influência <b>${Math.round(o.y * 100)}</b></span><input type="range" min="0" max="100" value="${Math.round(o.y * 100)}" data-c="y"></label>
        <p class="sel-quad">Quadrante: <strong>${quad(o)}</strong></p><button type="button" class="btn btn--s btn--peq" data-c="del">Remover</button>` : '<p class="lab-dica">Adicione um stakeholder ou selecione um ponto no mapa.</p>';
      $('[data-quadrantes]', raiz).innerHTML = QUAD.map(q => { const g = L.filter(q[2]); return `<div class="quad"><h3>${q[0]} <i>${g.length}</i></h3><p>${q[1]}</p>${g.length ? `<ul>${g.map(v => `<li>${esc(v.n)}</li>`).join('')}</ul>` : ''}</div>`; }).join('');
    }
    function desenha(soMapa) { const foco = document.activeElement && document.activeElement.closest && document.activeElement.closest('.st'); mapa.innerHTML = svg(false); if (foco) { const g = $(`.st[data-id="${sel}"]`, mapa); if (g) g.focus(); } if (!soMapa) lado(); }
    const ponto = e => { const s = $('svg', mapa), m = s.getScreenCTM().inverse(), p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m); return [Math.min(1, Math.max(0, (p.x - P0) / T)), Math.min(1, Math.max(0, (P1 - p.y) / T))]; };
    let arrasta = null;
    mapa.addEventListener('pointerdown', e => { const g = e.target.closest('.st'); if (!g) return; sel = +g.dataset.id; arrasta = L.find(o => o.id === sel); mapa.setPointerCapture(e.pointerId); e.preventDefault(); desenha(); });
    mapa.addEventListener('pointermove', e => { if (!arrasta) return; [arrasta.x, arrasta.y] = ponto(e); const g = $(`.st[data-id="${arrasta.id}"]`, mapa); g.setAttribute('transform', `translate(${px(arrasta.x).toFixed(1)} ${py(arrasta.y).toFixed(1)})`); });
    const solta = () => { if (!arrasta) return; arrasta = null; salva(); desenha(); };
    mapa.addEventListener('pointerup', solta); mapa.addEventListener('pointercancel', solta);
    mapa.addEventListener('focusin', e => { const g = e.target.closest('.st'); if (g && +g.dataset.id !== sel) { sel = +g.dataset.id; desenha(); } });
    mapa.addEventListener('keydown', e => { const g = e.target.closest('.st'); if (!g) return; const o = L.find(v => v.id === +g.dataset.id), d = { ArrowRight: [0.04, 0], ArrowLeft: [-0.04, 0], ArrowUp: [0, 0.04], ArrowDown: [0, -0.04] }[e.key]; if (d) { e.preventDefault(); o.x = Math.min(1, Math.max(0, o.x + d[0])); o.y = Math.min(1, Math.max(0, o.y + d[1])); salva(); desenha(); } else if (e.key === 'Delete') { L = L.filter(v => v !== o); sel = L[0] ? L[0].id : null; salva(); desenha(); } });
    $('[data-selecionado]', raiz).addEventListener('input', e => { const o = L.find(v => v.id === sel), c = e.target.dataset.c; if (!o || !c) return; if (c === 'n') o.n = e.target.value; else { o[c] = +e.target.value / 100; e.target.closest('label').querySelector('b').textContent = e.target.value; $('.sel-quad strong', raiz).textContent = quad(o); } salva(); desenha(true); });
    $('[data-selecionado]', raiz).addEventListener('change', () => lado());
    $('[data-selecionado]', raiz).addEventListener('click', e => { if (e.target.closest('[data-c="del"]')) { L = L.filter(v => v.id !== sel); sel = L[0] ? L[0].id : null; salva(); desenha(); } });
    $('[data-form]', raiz).addEventListener('submit', e => { e.preventDefault(); const c = $('input', e.target), n = c.value.trim(); if (!n || L.length >= 30) return; L.push({ id: prox, n, x: 0.5, y: 0.5 }); sel = prox++; c.value = ''; salva(); desenha(); });
    acao('exemplo', () => { L = EX.map(o => ({ ...o })); sel = L[0].id; prox = L.length + 1; salva(); desenha(); });
    acao('csv', () => baixar('mapa-de-influencia.csv', csv([['Stakeholder', 'Apoio (0 a 100)', 'Influência (0 a 100)', 'Quadrante'], ...L.map(o => [o.n, Math.round(o.x * 100), Math.round(o.y * 100), quad(o)])]), 'text/csv'));
    acao('png', () => { const t = document.createElement('div'); t.innerHTML = svg(true); svgParaPng(t.firstElementChild, 'mapa-de-influencia.png', 680, 680); });
    desenha();
  }

  // ================= matriz de adoção =================
  function adocao() {
    const EX = [['Financeiro', [1, 2, 2, 1, 0]], ['Operações', [2, 3, 1, 1, 0]], ['Comercial', [1, 1, 2, 1, 1]], ['Suprimentos', [2, 2, 1, 1, 0]]].map(([n, v]) => ({ n, v }));
    const copia = o => JSON.parse(JSON.stringify(o));
    let A = guarda.ler('adocao') || copia(EX);
    const tab = $('[data-tabela]', raiz), salva = () => guarda.por('adocao', A);
    const soma = v => v.reduce((a, b) => a + b, 0), indice = v => soma(v) ? Math.round((v[3] + v[4]) / soma(v) * 100) : 0;
    const totais = () => NIVEIS.map((_, k) => A.reduce((a, l) => a + l.v[k], 0));
    function grafico(exporta) {
      const linhas = A.filter(l => soma(l.v)), H = 34, G = 16, X0 = 170, W = 520, alt = 70 + linhas.length * (H + G) + 50;
      const rot = (t, x, y, anc = 'start', o = {}) => `<text x="${x}" y="${y}" text-anchor="${anc}" font-family="${FONTE}" font-size="${o.s || 13}" font-weight="${o.w || 500}" fill="${o.c || TINTA}">${esc(t)}</text>`;
      let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 ${alt}" ${exporta ? `width="760" height="${alt}"` : 'role="img" aria-label="Gráfico de barras empilhadas com a distribuição das pessoas de cada área pela régua de adoção"'}><rect width="760" height="${alt}" fill="#fff"/>${rot('Distribuição por área (% das pessoas)', 20, 30, 'start', { s: 15, w: 700 })}`;
      linhas.forEach((l, i) => { const y = 52 + i * (H + G), t = soma(l.v); let x = X0; s += rot(l.n.length > 20 ? l.n.slice(0, 19) + '…' : l.n, X0 - 14, y + H / 2 + 5, 'end', { w: 600 }); l.v.forEach((q, k) => { if (!q) return; const w = q / t * W; s += `<rect class="barra" x="${x.toFixed(1)}" y="${y}" width="${Math.max(0, w - 2).toFixed(1)}" height="${H}" fill="${NIVEIS[k][1]}"/>${w > 34 ? rot(Math.round(q / t * 100) + '%', (x + w / 2 - 1).toFixed(1), y + H / 2 + 4.5, 'middle', { s: 12, w: 700, c: k === 2 ? TINTA : '#fff' }) : ''}`; x += w; }); s += rot(indice(l.v) + '%', X0 + W + 14, y + H / 2 + 5, 'start', { w: 700, c: AZP }); });
      const yl = 52 + linhas.length * (H + G) + 22; let xl = X0;
      NIVEIS.forEach(n => { s += `<rect x="${xl}" y="${yl - 10}" width="12" height="12" fill="${n[1]}"/>${rot(n[0], xl + 18, yl + 1, 'start', { s: 12, c: CZ })}`; xl += 34 + n[0].length * 7.2; });
      return s + rot('índice', X0 + W + 14, 44, 'start', { s: 11, c: CZ }) + `</svg>`;
    }
    function desenha(foco) {
      const tt = totais(), geral = soma(tt), max = Math.max(1, ...A.flatMap(l => l.v));
      tab.innerHTML = `<table class="matriz matriz--adocao"><thead><tr><th scope="col" class="m-ativ">Área</th>${NIVEIS.map(n => `<th scope="col"><span class="m-nivel"><i style="background:${n[1]}"></i>${n[0]}</span></th>`).join('')}<th scope="col">Pessoas</th><th scope="col">Índice</th></tr></thead>
        <tbody>${A.map((l, i) => `<tr><th scope="row" class="m-ativ"><div class="m-linha"><input type="text" value="${esc(l.n)}" data-area="${i}" aria-label="Nome da área ${i + 1}" maxlength="30" placeholder="Nova área"><button type="button" class="m-x" data-del-lin="${i}" aria-label="Remover a área ${esc(l.n)}">×</button></div></th>${l.v.map((q, k) => `<td style="--calor:${(q / max).toFixed(2)}"><input class="m-num" type="number" inputmode="numeric" min="0" max="9999" value="${q}" data-i="${i}" data-k="${k}" aria-label="${esc(l.n || 'Área ' + (i + 1))}: pessoas em ${NIVEIS[k][0]}"></td>`).join('')}<td class="m-tot">${soma(l.v)}</td><td class="m-tot m-ind">${soma(l.v) ? indice(l.v) + '%' : ''}</td></tr>`).join('')}</tbody>
        <tfoot><tr><th scope="row" class="m-ativ">Total</th>${tt.map(q => `<td class="m-tot">${q}</td>`).join('')}<td class="m-tot">${geral}</td><td class="m-tot m-ind">${geral ? indice(tt) + '%' : ''}</td></tr></tfoot></table>`;
      $('[data-grafico]', raiz).innerHTML = geral ? grafico(false) : '<p class="lab-dica">Informe as pessoas de cada área para ver o gráfico.</p>';
      $('[data-indice]', raiz).innerHTML = `<p class="kpi"><strong>${geral ? indice(tt) : 0}%</strong><span>das ${geral} pessoas estão em Adota ou Multiplica</span></p><div class="kpi-barra" aria-hidden="true">${tt.map((q, k) => q ? `<i style="width:${q / geral * 100}%;background:${NIVEIS[k][1]}"></i>` : '').join('')}</div>`;
      $('[data-acoes]', raiz).innerHTML = A.filter(l => soma(l.v)).map(l => { const k = l.v.indexOf(Math.max(...l.v)); return `<div class="acao-area"><span>${esc(l.n || 'Área')}</span><b>${NIVEIS[k][2]}</b><small>Maior grupo em ${NIVEIS[k][0]} (${l.v[k]} de ${soma(l.v)}): ${NIVEIS[k][3]}.</small></div>`; }).join('') || '<p class="lab-dica">Sem dados ainda.</p>';
      if (foco) { const c = $(foco, tab); if (c) c.focus(); }
    }
    tab.addEventListener('change', e => { const t = e.target; if (t.dataset.area != null) A[+t.dataset.area].n = t.value; else if (t.dataset.k != null) A[+t.dataset.i].v[+t.dataset.k] = Math.min(9999, Math.max(0, Math.round(+t.value) || 0)); else return; salva(); desenha(t.dataset.k != null ? `.m-num[data-i="${t.dataset.i}"][data-k="${t.dataset.k}"]` : null); });
    tab.addEventListener('click', e => { const d = e.target.closest('[data-del-lin]'); if (d && A.length > 1) { A.splice(+d.dataset.delLin, 1); salva(); desenha(); } });
    acao('add-linha', () => { if (A.length >= 20) return; A.push({ n: '', v: [0, 0, 0, 0, 0] }); salva(); desenha(`[data-area="${A.length - 1}"]`); });
    acao('exemplo', () => { A = copia(EX); salva(); desenha(); });
    acao('csv', () => baixar('matriz-de-adocao.csv', csv([['Área', ...NIVEIS.map(n => n[0]), 'Pessoas', 'Índice de adoção'], ...A.filter(l => l.n.trim() || soma(l.v)).map(l => [l.n, ...l.v, soma(l.v), indice(l.v) + '%']), ['Total', ...totais(), soma(totais()), indice(totais()) + '%']]), 'text/csv'));
    acao('png', () => { if (!soma(totais())) return; const t = document.createElement('div'); t.innerHTML = grafico(true); const s = t.firstElementChild; svgParaPng(s, 'matriz-de-adocao.png', 760, +s.getAttribute('height')); });
    acao('imprimir', () => print());
    desenha();
  }

  ({ diagnostico, raci, influencia, adocao })[raiz.dataset.ferramenta]?.();
})();
