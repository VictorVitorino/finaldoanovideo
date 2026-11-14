// Change Management World · downloads com cadastro e painel do autor.
// O registro vai para o Supabase (tabela downloads_modelos). Visitante só insere; ler exige login de administrador.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.CMW_CFG || {}, ligado = !!(CFG.url && CFG.chave);
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const api = (caminho, o = {}) => fetch(CFG.url + caminho, { ...o, headers: { apikey: CFG.chave, 'Content-Type': 'application/json', ...(o.headers || {}) } });
  const guarda = { ler(k) { try { return JSON.parse(localStorage.getItem('cmw-' + k)); } catch { return null; } }, por(k, v) { try { localStorage.setItem('cmw-' + k, JSON.stringify(v)); } catch { /* segue sem lembrar */ } } };
  const baixar = (href, nome) => { const a = document.createElement('a'); a.href = href; a.download = nome; document.body.appendChild(a); a.click(); a.remove(); };

  // ---------- página de modelos ----------
  const area = $('[data-modelos]');
  if (area) {
    const dlg = $('[data-portao]', area), form = $('[data-form]', dlg), erro = $('[data-erro]', dlg);
    let alvo = null;
    const registra = async (p, m) => {
      if (!ligado) return true;   // sem banco configurado: libera o arquivo, sem registro
      const r = await api('/rest/v1/downloads_modelos', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ nome: p.nome, email: p.email, empresa: p.empresa || null, modelo: m.id, aceite: true, origem: location.pathname.slice(0, 200) }) });
      return r.ok;
    };
    const entrega = async (botao, m, p) => {
      const rot = botao.querySelector('span'), antes = rot.textContent;
      botao.disabled = true; rot.textContent = 'Preparando…';
      let ok = false;
      try { ok = await registra(p, m); } catch { ok = false; }
      botao.disabled = false;
      if (!ok) { rot.textContent = antes; return false; }
      baixar('../assets/modelos/' + m.arquivo, m.arquivo);
      rot.textContent = 'Download iniciado'; setTimeout(() => { rot.textContent = antes; }, 2600);
      return true;
    };
    area.addEventListener('click', async e => {
      const b = e.target.closest('[data-baixar]');
      if (b) {
        alvo = { botao: b, m: { id: b.dataset.baixar, arquivo: b.dataset.arquivo, nome: b.dataset.nome } };
        const p = guarda.ler('pessoa');
        if (p && p.email && await entrega(b, alvo.m, p)) return;
        $('[data-titulo]', dlg).textContent = 'Baixar: ' + alvo.m.nome;
        if (p) for (const k of ['nome', 'email', 'empresa']) form.elements[k].value = p[k] || '';
        erro.hidden = true; dlg.showModal(); form.elements.nome.focus();
      } else if (e.target.closest('[data-fechar]')) dlg.close();
    });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const p = { nome: form.elements.nome.value.trim(), email: form.elements.email.value.trim().toLowerCase(), empresa: form.elements.empresa.value.trim() };
      const falha = t => { erro.textContent = t; erro.hidden = false; };
      if (p.nome.length < 2) return falha('Informe o seu nome.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return falha('Informe um e-mail válido.');
      if (!form.elements.aceite.checked) return falha('Marque a concordância para liberar o download.');
      erro.hidden = true;
      if (await entrega($('button[type="submit"]', form), alvo.m, p)) { guarda.por('pessoa', p); setTimeout(() => dlg.close(), 900); }
      else falha('Não foi possível registrar agora. Confira a conexão e tente de novo.');
    });
    // link vindo do Laboratório (#id): destaca o modelo
    const marca = () => { const el = location.hash && document.getElementById(location.hash.slice(1)); if (el && el.classList.contains('mod')) { el.classList.add('mod--alvo'); el.scrollIntoView({ block: 'center' }); } };
    marca(); addEventListener('hashchange', marca);
  }

  // ---------- painel do autor ----------
  const painel = $('[data-painel]');
  if (painel) {
    const login = $('[data-login]', painel), dados = $('[data-dados]', painel), erro = $('[data-erro]', painel);
    const falha = t => { erro.textContent = t; erro.hidden = false; };
    const nomeModelo = id => (CFG.modelos || []).find(m => m.id === id)?.nome || id;
    const sessao = { ler() { try { return JSON.parse(sessionStorage.getItem('cmw-painel')); } catch { return null; } }, por(v) { try { v ? sessionStorage.setItem('cmw-painel', JSON.stringify(v)) : sessionStorage.removeItem('cmw-painel'); } catch { /* sem sessão guardada */ } } };
    if (!ligado) { login.hidden = true; dados.hidden = false; dados.innerHTML = '<p class="lab-aviso">O registro de downloads ainda não está ligado a um banco de dados. Preencha "downloads" em _src/site.config.json e gere o site de novo.</p>'; return; }
    async function carrega(token) {
      const r = await api('/rest/v1/downloads_modelos?select=criado_em,nome,email,empresa,modelo&order=criado_em.desc&limit=5000', { headers: { Authorization: 'Bearer ' + token } });
      if (r.status === 401) { sessao.por(null); login.hidden = false; dados.hidden = true; return falha('Sessão expirada. Entre de novo.'); }
      if (!r.ok) return falha('Não foi possível ler os registros.');
      const L = await r.json();
      login.hidden = true; dados.hidden = false;
      if (!L.length) { dados.innerHTML = '<p class="lab-aviso">Nenhum download registrado ainda, ou este usuário não está na lista de administradores (tabela painel_admins).</p><p><button type="button" class="btn btn--s btn--peq" data-sair>Sair</button></p>'; return; }
      const porModelo = {}, porEmail = {};
      for (const d of L) { porModelo[d.modelo] = (porModelo[d.modelo] || 0) + 1; (porEmail[d.email] = porEmail[d.email] || { n: 0, nome: d.nome, empresa: d.empresa, ult: d.criado_em, modelos: new Set() }); porEmail[d.email].n++; porEmail[d.email].modelos.add(d.modelo); }
      const max = Math.max(...Object.values(porModelo)), dt = s => new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const emails = Object.entries(porEmail).sort((a, b) => b[1].n - a[1].n);
      dados.innerHTML = `<div class="painel-kpis"><div><strong>${L.length}</strong><span>downloads</span></div><div><strong>${emails.length}</strong><span>e-mails diferentes</span></div><div><strong>${Object.keys(porModelo).length}</strong><span>modelos baixados</span></div></div>
        <div class="lab-barra"><label class="busca"><span class="vis-oculto">Filtrar</span><input type="search" placeholder="Filtrar por e-mail, nome, empresa ou modelo" data-filtro style="padding-left:14px"></label><button type="button" class="btn btn--s btn--peq" data-csv>Baixar CSV</button><button type="button" class="btn btn--s btn--peq" data-sair>Sair</button></div>
        <h2 class="rel-tit">Por modelo</h2><div class="painel-barras">${Object.entries(porModelo).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="carga"><span>${esc(nomeModelo(k))} <b>${v}</b></span><div class="carga-barra"><i class="m-cel--R" style="width:${v / max * 100}%"></i></div></div>`).join('')}</div>
        <h2 class="rel-tit" style="margin-top:36px">Por e-mail</h2><div class="tabela-rolagem"><table class="matriz painel-tab"><thead><tr><th>E-mail</th><th>Nome</th><th>Empresa</th><th>Downloads</th><th>Modelos</th><th>Último</th></tr></thead><tbody data-emails>${emails.map(([e, v]) => `<tr><td>${esc(e)}</td><td>${esc(v.nome)}</td><td>${esc(v.empresa || '')}</td><td>${v.n}</td><td>${esc([...v.modelos].map(nomeModelo).join(', '))}</td><td>${dt(v.ult)}</td></tr>`).join('')}</tbody></table></div>
        <h2 class="rel-tit" style="margin-top:36px">Registro completo</h2><div class="tabela-rolagem"><table class="matriz painel-tab"><thead><tr><th>Data</th><th>E-mail</th><th>Nome</th><th>Empresa</th><th>Modelo</th></tr></thead><tbody data-linhas>${L.map(d => `<tr><td>${dt(d.criado_em)}</td><td>${esc(d.email)}</td><td>${esc(d.nome)}</td><td>${esc(d.empresa || '')}</td><td>${esc(nomeModelo(d.modelo))}</td></tr>`).join('')}</tbody></table></div>`;
      dados.oninput = e => { if (!e.target.matches('[data-filtro]')) return; const q = e.target.value.trim().toLowerCase(); $$('tbody tr', dados).forEach(tr => { tr.hidden = !!q && !tr.textContent.toLowerCase().includes(q); }); };
      dados.onclick = e => {
        if (e.target.closest('[data-csv]')) { const c = '﻿' + [['Data', 'E-mail', 'Nome', 'Empresa', 'Modelo'], ...L.map(d => [dt(d.criado_em), d.email, d.nome, d.empresa || '', nomeModelo(d.modelo)])].map(l => l.map(x => /[";\n]/.test(x) ? '"' + String(x).replace(/"/g, '""') + '"' : x).join(';')).join('\r\n'); baixar('data:text/csv;charset=utf-8,' + encodeURIComponent(c), 'downloads-modelos.csv'); }
      };
    }
    painel.addEventListener('click', e => { if (e.target.closest('[data-sair]')) { sessao.por(null); dados.hidden = true; dados.innerHTML = ''; login.hidden = false; } });
    login.addEventListener('submit', async e => {
      e.preventDefault(); erro.hidden = true;
      try {
        const r = await api('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: login.elements.email.value.trim(), password: login.elements.senha.value }) });
        if (!r.ok) return falha('E-mail ou senha incorretos.');
        const j = await r.json(); sessao.por({ t: j.access_token }); login.elements.senha.value = ''; await carrega(j.access_token);
      } catch { falha('Sem conexão com o banco de dados.'); }
    });
    const s = sessao.ler(); if (s && s.t) carrega(s.t);
  }
})();
