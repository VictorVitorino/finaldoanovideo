// Laboratório: páginas das ferramentas interativas (diagnóstico de nível, matriz RACI, mapa de influência e matriz de adoção).
// O comportamento fica em assets/js/lab.js; aqui só a estrutura das páginas e as prévias em traço fino.
import { esc } from './md.mjs';
import { icone } from './ilustra.mjs';
import { pagina, titSecao } from './modelos.mjs';

const L = 'fill="none" stroke="var(--l)" stroke-width="1.3"';
const K = 'fill="none" stroke="var(--f1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const moldura = (v, corpo) => `<svg class="capa capa--${v}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="240" fill="var(--bg)"/>${[48, 96, 144, 192].map(y => `<path d="M0 ${y}H400" stroke="var(--l)" stroke-width=".6" opacity=".35"/>`).join('')}${corpo}</svg>`;
const hex = (cx, cy, r, f = 1) => [0, 1, 2, 3, 4, 5].map(i => { const a = -Math.PI / 2 + i * Math.PI / 3; return `${(cx + Math.cos(a) * r * f).toFixed(1)} ${(cy + Math.sin(a) * r * f).toFixed(1)}`; });
export const PREVIAS = {
  diagnostico(v = 'a') {
    const cx = 200, cy = 122, R = 86, val = [0.9, 0.62, 0.78, 0.5, 0.84, 0.66];
    const pts = val.map((f, i) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f]; });
    return moldura(v, [1, 0.66, 0.33].map(f => `<path d="M${hex(cx, cy, R, f).join('L')}Z" ${L}/>`).join('') + hex(cx, cy, R).map(p => `<path d="M${cx} ${cy}L${p}" ${L}/>`).join('')
      + `<path d="M${pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join('L')}Z" fill="var(--f2)" fill-opacity=".28"/><path class="c-desenha" pathLength="1" d="M${pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join('L')}Z" ${K} stroke="var(--f2)" stroke-width="2.4"/>`
      + pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="var(--f1)"/>`).join('') + `<circle class="c-halo" cx="${pts[0][0].toFixed(1)}" cy="${pts[0][1].toFixed(1)}" r="5" fill="none" stroke="var(--f2)" stroke-width="1.6"/>`);
  },
  raci(v = 'b') {
    const letras = ['A', 'R', 'C', 'I', 'C', 'A', 'R', 'I', 'I', 'C', 'A', 'R', 'R', 'I', 'C', 'A'];
    let s = '';
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const x = 150 + i * 50, y = 44 + j * 40, l = letras[j * 4 + i], forte = l === 'A' || l === 'R';
      s += `<rect x="${x}" y="${y}" width="44" height="34" fill="${l === 'A' ? 'var(--f1)' : l === 'R' ? 'var(--f2)' : 'var(--f3)'}" stroke="var(--l)" stroke-width="1"/><text x="${x + 22}" y="${y + 23}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="15" fill="${forte ? 'var(--bg)' : 'var(--f1)'}">${l}</text>`;
    }
    for (let j = 0; j < 4; j++) s += `<path d="M52 ${61 + j * 40}H${116 - (j % 2) * 18}" ${K} stroke-width="5" opacity=".${j === 1 ? 9 : 5}"/>`;
    return moldura(v, s);
  },
  influencia(v = 'c') {
    const p = [[286, 76, 1], [330, 110, 0], [124, 84, 1], [170, 168, 0], [262, 178, 0], [96, 150, 0]];
    return moldura(v, `<rect x="60" y="36" width="280" height="172" fill="var(--f3)" stroke="var(--l)" stroke-width="1.3"/><path d="M200 36V208M60 122H340" ${L} stroke-dasharray="3 5"/>`
      + `<path class="c-desenha" pathLength="1" d="M124 84Q200 40 286 76" ${K} stroke="var(--f2)"/>`
      + p.map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="${f ? 11 : 8}" fill="var(--${f ? 'f2' : 'f1'})"/>`).join('') + `<circle class="c-halo" cx="124" cy="84" r="5" fill="none" stroke="var(--f2)" stroke-width="1.6"/>`);
  },
  adocao(v = 'b') {
    const linhas = [[0.14, 0.26, 0.28, 0.2, 0.12], [0.24, 0.34, 0.2, 0.16, 0.06], [0.1, 0.2, 0.3, 0.26, 0.14], [0.28, 0.3, 0.2, 0.16, 0.06]];
    const cores = ['var(--l)', 'var(--f3)', 'var(--f2)', 'var(--f2)', 'var(--f1)'], op = [0.7, 1, 0.45, 1, 1];
    let s = '';
    linhas.forEach((l, j) => { let x = 96; l.forEach((f, i) => { const w = f * 250; s += `<rect class="c-sobe" style="--d:${(j * 0.1).toFixed(1)}s" x="${x.toFixed(1)}" y="${52 + j * 40}" width="${(w - 2).toFixed(1)}" height="26" fill="${cores[i]}" opacity="${op[i]}"/>`; x += w; }); s += `<path d="M48 ${65 + j * 40}H${82 - (j % 2) * 12}" ${K} stroke-width="5" opacity=".5"/>`; });
    return moldura(v, s);
  },
};

export const FERRAMENTAS = [
  { id: 'diagnostico', slug: 'diagnostico', nome: 'Diagnóstico de nível', olho: 'Diagnóstico', frase: 'Perguntas difíceis sobre modelos, patrocínio, resistência, medição e contextos como IA e carve-out. No fim, um relatório com o seu nível e o que estudar.', acao: 'Fazer o diagnóstico' },
  { id: 'raci', slug: 'matriz-raci', nome: 'Matriz RACI', olho: 'Papéis', frase: 'Monte a matriz de responsabilidades da mudança, com conferência automática de quem aprova e quem executa.', acao: 'Montar a matriz' },
  { id: 'influencia', slug: 'mapa-de-influencia', nome: 'Mapa de influência', olho: 'Stakeholders', frase: 'Arraste cada stakeholder no mapa de influência e apoio e veja a estratégia de engajamento para cada quadrante.', acao: 'Abrir o mapa' },
  { id: 'adocao', slug: 'matriz-de-adocao', nome: 'Matriz de adoção', olho: 'Adoção', frase: 'Distribua as pessoas de cada área pela régua de adoção e veja o índice, o gráfico e a ação prioritária.', acao: 'Montar a matriz' },
];
const MODELOS = [['matriz-raci.xlsx', 'Matriz RACI da mudança', 'Com conferência automática do A e carga por papel'], ['mapa-de-influencia.xlsx', 'Mapa de influência de stakeholders', 'Com estratégia sugerida e gráfico de dispersão'], ['matriz-de-adocao.xlsx', 'Matriz de adoção', 'Com índice de adoção e gráfico por área']];

// bloco do Laboratório na página inicial
export function secaoLab(raiz, nPerguntas) {
  const [d, ...resto] = FERRAMENTAS;
  return `<section class="sec sec--lab" id="lab" aria-labelledby="lab-t">
  <div class="sec-in">
    ${titSecao('lab', 'Laboratório', 'Teste, monte e baixe', 'Ferramentas interativas para medir o seu nível e montar os instrumentos do dia a dia da gestão da mudança.', `<span class="sec-links revela"><a class="link-seta" href="${raiz}modelos/">Baixar modelos${icone('seta')}</a><a class="link-seta" href="${raiz}lab/">Abrir o Laboratório${icone('seta')}</a></span>`)}
    <div class="lab-grade">
      <a class="lab-destaque revela" href="${raiz}lab/${d.slug}/">
        <div class="lab-destaque-arte">${PREVIAS.diagnostico('a')}</div>
        <div class="lab-destaque-txt"><span class="chip chip--claro">${icone('bussola')}${nPerguntas ? nPerguntas + ' perguntas · ' : ''}6 domínios</span><h3>Em que nível de Change Management você está?</h3><p>${esc(d.frase)}</p><span class="btn btn--claro">${esc(d.acao)}${icone('seta')}</span></div>
      </a>
      <div class="lab-lista">${resto.map((f, i) => `<a class="lab-item revela" style="--i:${i + 1}" href="${raiz}lab/${f.slug}/"><span class="lab-item-arte">${PREVIAS[f.id]()}</span><span class="lab-item-txt"><small>${esc(f.olho)}</small><b>${esc(f.nome)}</b><em>${esc(f.frase)}</em></span>${icone('seta')}</a>`).join('')}</div>
    </div>
  </div>
</section>`;
}

const cab = (raiz, f, extra = '') => `<header class="lab-cab"><div class="sec-in">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<a href="${raiz}lab/">Laboratório</a>${icone('seta')}<span>${esc(f.nome)}</span></nav>
  <span class="olho">${esc(f.olho)}</span><h1>${esc(f.titulo || f.nome)}</h1><p class="lab-lead">${esc(f.lead || f.frase)}</p>${extra}</div></header>`;
const semJs = `<noscript><p class="lab-aviso">Esta ferramenta precisa de JavaScript ligado no navegador. Os modelos em Excel podem ser baixados sem ele, na página do Laboratório.</p></noscript>`;
const barra = (botoes, modelo, raiz) => `<div class="lab-barra" role="toolbar" aria-label="Ações">${botoes}${modelo ? `<a class="btn btn--s btn--peq" href="${raiz}modelos/#${modelo.replace('.xlsx', '')}">${icone('copia')}Baixar modelo em Excel</a>` : ''}</div>`;
const bt = (acao, ic, txt, cls = 'btn--s') => `<button type="button" class="btn ${cls} btn--peq" data-acao="${acao}">${icone(ic)}<span>${txt}</span></button>`;
const privacidade = `<p class="lab-nota">${icone('escudo')}Tudo o que você preenche fica só no seu navegador. Nada é enviado nem guardado pelo blog.</p>`;
const outras = (raiz, atual) => `<section class="sec sec--rel"><div class="sec-in"><header class="sec-cab"><div><span class="olho">Laboratório</span><h2>Outras ferramentas</h2></div><a class="link-seta" href="${raiz}lab/">Ver todas${icone('seta')}</a></header>
  <div class="lab-lista lab-lista--3">${FERRAMENTAS.filter(f => f.id !== atual).map(f => `<a class="lab-item" href="${raiz}lab/${f.slug}/"><span class="lab-item-arte">${PREVIAS[f.id]()}</span><span class="lab-item-txt"><small>${esc(f.olho)}</small><b>${esc(f.nome)}</b></span>${icone('seta')}</a>`).join('')}</div></div></section>`;
const pg = (cfg, f, corpo, scripts = ['assets/js/lab.js']) => pagina({ cfg, raiz: '../../', titulo: f.nome, descricao: f.frase, corpo, caminho: `lab/${f.slug}/`, imagem: `assets/img/og/lab-${f.id}.jpg`, classe: 'pg-lab', scripts, ativo: 'lab' });

export function labInicio({ cfg, nPerguntas }) {
  const raiz = '../';
  const corpo = `<header class="lab-cab"><div class="sec-in">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<span>Laboratório</span></nav>
  <span class="olho">Laboratório</span><h1>Teste, monte e baixe</h1><p class="lab-lead">Um diagnóstico para saber em que nível de Change Management você está e três instrumentos para montar no navegador e levar para o projeto.</p></div></header>
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="lab-cartoes">${FERRAMENTAS.map((f, i) => `<a class="lab-cartao revela" style="--i:${i}" href="${f.slug}/"><span class="lab-cartao-arte">${PREVIAS[f.id](['a', 'b', 'c', 'b'][i])}</span><span class="lab-cartao-txt"><small>${esc(f.olho)}${f.id === 'diagnostico' && nPerguntas ? ' · ' + nPerguntas + ' perguntas' : ''}</small><b>${esc(f.nome)}</b><em>${esc(f.frase)}</em><span class="link-seta">${esc(f.acao)}${icone('seta')}</span></span></a>`).join('')}</div>
  <div class="lab-modelos revela"><h2>Modelos para baixar</h2><p>Mapa de adoção, formulário de diagnóstico, mapa de riscos, plano de treinamentos, matriz RACI e mapa de influência, em Excel.</p>
    <a class="btn btn--p" href="${raiz}modelos/">Ver os modelos${icone('seta')}</a></div>
</div></section>`;
  return pagina({ cfg, raiz, titulo: 'Laboratório', descricao: 'Diagnóstico de nível em Change Management e ferramentas interativas: matriz RACI, mapa de influência e matriz de adoção.', corpo, caminho: 'lab/', imagem: 'assets/img/og/lab.jpg', classe: 'pg-lab', ativo: 'lab' });
}

export function labDiagnostico({ cfg, dominios, relatorio }) {
  const f = { ...FERRAMENTAS[0], titulo: 'Em que nível de Change Management você está?', lead: 'Um diagnóstico formativo, com casos e perguntas de precisão sobre os principais modelos. Sem cadastro. No fim, você recebe um relatório com o seu nível, os domínios a reforçar e o que estudar.' };
  const total = dominios.reduce((a, d) => a + d.perguntas.length, 0), rapido = dominios.length * 2;
  const corpo = `${cab('../../', f)}
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="diag" data-ferramenta="diagnostico">
    <div class="diag-inicio" data-etapa="inicio">
      <div class="diag-dominios">${dominios.map((d, i) => `<div class="diag-dom"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(relatorio.dominios[d.id].nome)}</b><small>${esc(relatorio.dominios[d.id].descricao)}</small></div>`).join('')}</div>
      <div class="diag-escolha">
        <button type="button" class="diag-modo" data-modo="completo"><b>Completo</b><span>${total} perguntas · cerca de ${Math.round(total * 0.6)} minutos</span><em>Relatório mais preciso, com todos os domínios em profundidade.</em><i>${icone('seta')}</i></button>
        <button type="button" class="diag-modo" data-modo="rapido"><b>Rápido</b><span>${rapido} perguntas · cerca de ${Math.round(rapido * 0.6)} minutos</span><em>Duas perguntas por domínio, sorteadas a cada tentativa.</em><i>${icone('seta')}</i></button>
      </div>
      ${privacidade}
    </div>
    <div class="diag-prova" data-etapa="prova" hidden></div>
    <div class="relatorio" data-etapa="relatorio" hidden></div>
  </div>
  ${semJs}
  <p class="lab-rodape">Diagnóstico formativo, sem valor de certificação. Os modelos citados pertencem aos seus autores e instituições. ADKAR é marca registrada da Prosci.</p>
</div></section>${outras('../../', 'diagnostico')}`;
  return pg(cfg, f, corpo, ['assets/js/diagnostico-dados.js', 'assets/js/lab.js']);
}

export function labRaci({ cfg }) {
  const f = { ...FERRAMENTAS[1], titulo: 'Matriz RACI da mudança', lead: 'Clique em cada célula para alternar entre R, A, C e I. Edite atividades e papéis, e a conferência avisa quando falta ou sobra quem responde.' };
  const corpo = `${cab('../../', f)}
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="ferr" data-ferramenta="raci">
    ${barra(bt('add-linha', 'lista', 'Nova atividade') + bt('add-coluna', 'pessoa', 'Novo papel') + `<button type="button" class="btn btn--s btn--peq" data-acao="modo" aria-pressed="false">${icone('grade')}<span>Usar RASCI</span></button>` + bt('exemplo', 'ciclo', 'Recarregar exemplo') + bt('csv', 'setaBaixo', 'Baixar CSV') + bt('imprimir', 'copia', 'Imprimir ou PDF'), 'matriz-raci.xlsx', '../../')}
    <div class="ferr-grade"><div class="ferr-principal"><div class="tabela-rolagem" data-tabela></div></div>
      <aside class="ferr-lado"><div class="lado-caixa"><h2>Legenda</h2><ul class="legenda" data-legenda></ul></div><div class="lado-caixa"><h2>Conferência</h2><div data-conferencia></div></div><div class="lado-caixa"><h2>Carga por papel</h2><div data-carga></div></div></aside></div>
    ${privacidade}
  </div>${semJs}
  <div class="lab-como"><h2>Como ler a sua matriz</h2><ul><li><b>Um único A por atividade.</b> Quem aprova responde pelo resultado. Dois aprovadores é o mesmo que nenhum.</li><li><b>R sem A não fecha.</b> Alguém executa, mas ninguém decide quando está bom.</li><li><b>Muitos C deixam a decisão lenta.</b> Veja quem pode passar a I.</li><li><b>Valide com as pessoas.</b> A matriz que ninguém reconhece não muda comportamento.</li></ul></div>
</div></section>${outras('../../', 'raci')}`;
  return pg(cfg, f, corpo);
}

export function labInfluencia({ cfg }) {
  const f = { ...FERRAMENTAS[2], titulo: 'Mapa de influência de stakeholders', lead: 'Arraste cada pessoa ou grupo para a posição que ocupa hoje: quanta influência tem sobre o resultado e quanto apoia a mudança. A estratégia aparece ao lado.' };
  const corpo = `${cab('../../', f)}
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="ferr" data-ferramenta="influencia">
    ${barra(`<form class="ferr-add" data-form><label class="vis-oculto" for="inf-nome">Nome do stakeholder</label><input id="inf-nome" type="text" maxlength="40" placeholder="Nome ou grupo" autocomplete="off"><button type="submit" class="btn btn--p btn--peq">${icone('pessoa')}Adicionar</button></form>` + bt('exemplo', 'ciclo', 'Recarregar exemplo') + bt('png', 'setaBaixo', 'Baixar imagem') + bt('csv', 'setaBaixo', 'Baixar CSV'), 'mapa-de-influencia.xlsx', '../../')}
    <div class="ferr-grade"><div class="ferr-principal"><div class="mapa" data-mapa></div><p class="lab-dica">Arraste os pontos, ou selecione um e use as setas do teclado.</p></div>
      <aside class="ferr-lado"><div class="lado-caixa"><h2>Selecionado</h2><div data-selecionado></div></div><div class="lado-caixa"><h2>Estratégia por quadrante</h2><div data-quadrantes></div></div></aside></div>
    ${privacidade}
  </div>${semJs}
  <div class="lab-como"><h2>Como usar o mapa</h2><ul><li><b>Conquistar:</b> muita influência e pouco apoio. É a prioridade: entenda o que a pessoa perde e envolva o patrocinador.</li><li><b>Mobilizar:</b> muita influência e apoio. Dê papel visível na coalizão de patrocínio.</li><li><b>Envolver:</b> pouca influência formal e apoio alto. Bons multiplicadores.</li><li><b>Ouvir:</b> pouca influência e pouco apoio. Resistência costuma ser informação sobre o desenho da mudança.</li><li><b>Material sensível:</b> é retrato do momento. Atualize a cada fase e restrinja o acesso.</li></ul></div>
</div></section>${outras('../../', 'influencia')}`;
  return pg(cfg, f, corpo);
}

export function labAdocao({ cfg }) {
  const f = { ...FERRAMENTAS[3], titulo: 'Matriz de adoção', lead: 'Informe quantas pessoas de cada área estão hoje em cada marca da régua de adoção. O índice, o gráfico e a ação prioritária se atualizam na hora.' };
  const corpo = `${cab('../../', f)}
<section class="sec sec--lab-pg"><div class="sec-in">
  <div class="ferr" data-ferramenta="adocao">
    ${barra(bt('add-linha', 'lista', 'Nova área') + bt('exemplo', 'ciclo', 'Recarregar exemplo') + bt('png', 'setaBaixo', 'Baixar gráfico') + bt('csv', 'setaBaixo', 'Baixar CSV') + bt('imprimir', 'copia', 'Imprimir ou PDF'), 'matriz-de-adocao.xlsx', '../../')}
    <div class="ferr-grade"><div class="ferr-principal"><div class="tabela-rolagem" data-tabela></div><div class="grafico" data-grafico></div></div>
      <aside class="ferr-lado"><div class="lado-caixa lado-caixa--kpi"><h2>Índice de adoção</h2><div data-indice></div></div><div class="lado-caixa"><h2>Onde agir primeiro</h2><div data-acoes></div></div></aside></div>
    ${privacidade}
  </div>${semJs}
  <div class="lab-como"><h2>A régua e a ação de cada marca</h2><ul><li><b>Resiste → Escuta:</b> ouvir o motivo e ajustar a mensagem.</li><li><b>Observa → Exemplo:</b> mostrar funcionando, com gente parecida.</li><li><b>Experimenta → Prática:</b> tempo protegido e apoio por perto.</li><li><b>Adota → Reforço:</b> reconhecer e tirar atritos da rotina.</li><li><b>Multiplica → Palco:</b> dar voz e formar a rede.</li><li><b>Leitura agregada:</b> retrato do momento por área, não avaliação de desempenho. Veja a <a href="../../posts/mapa-de-perfil-cognitivo/">capa sobre o Mapa de Perfil Cognitivo</a>.</li></ul></div>
</div></section>${outras('../../', 'adocao')}`;
  return pg(cfg, f, corpo);
}

// ---------- modelos para baixar (com cadastro) e painel do autor ----------
export function paginaModelos({ cfg, modelos }) {
  const raiz = '../';
  const corpo = `<header class="lab-cab"><div class="sec-in">
  <nav class="migalhas" aria-label="Você está em"><a href="${raiz}index.html">Início</a>${icone('seta')}<span>Modelos</span></nav>
  <span class="olho">Modelos para baixar</span><h1>Instrumentos prontos para o seu projeto</h1><p class="lab-lead">Planilhas em Excel com fórmulas, conferências e instruções de uso. Para baixar, informe nome e e-mail uma única vez.</p></div></header>
<section class="sec sec--lab-pg"><div class="sec-in" data-modelos>
  <div class="mod-grade">${modelos.map((m, i) => `<article class="mod revela" style="--i:${i}" id="${esc(m.id)}"><div class="mod-arte">${PREVIAS[m.previa](['a', 'b', 'c'][i % 3])}</div><div class="mod-txt"><small>${esc(m.olho)} · Excel</small><h2>${esc(m.nome)}</h2><p>${esc(m.frase)}</p><button type="button" class="btn btn--p btn--peq" data-baixar="${esc(m.id)}" data-arquivo="${esc(m.arquivo)}" data-nome="${esc(m.nome)}">${icone('setaBaixo')}<span>Baixar modelo</span></button></div></article>`).join('')}</div>
  <p class="lab-nota">${icone('escudo')}Seu nome e e-mail são usados só para registrar o download. Não são repassados a terceiros.</p>
  <dialog class="portao" data-portao aria-labelledby="portao-t">
    <form method="dialog" class="portao-in" data-form novalidate>
      <button type="button" class="m-x portao-x" data-fechar aria-label="Fechar">×</button>
      <span class="olho">Download</span><h2 id="portao-t" data-titulo>Baixar modelo</h2><p>Informe seus dados uma vez. Nos próximos downloads, basta um clique.</p>
      <label class="campo"><span>Nome</span><input type="text" name="nome" required minlength="2" maxlength="120" autocomplete="name"></label>
      <label class="campo"><span>E-mail</span><input type="email" name="email" required maxlength="254" autocomplete="email" inputmode="email"></label>
      <label class="campo"><span>Empresa (opcional)</span><input type="text" name="empresa" maxlength="120" autocomplete="organization"></label>
      <label class="aceite"><input type="checkbox" name="aceite" required><span>Concordo com o registro do meu nome e e-mail para liberar o download.</span></label>
      <p class="portao-erro" data-erro role="alert" hidden></p>
      <button type="submit" class="btn btn--p">${icone('setaBaixo')}<span>Baixar agora</span></button>
    </form>
  </dialog>
</div>
<noscript><div class="sec-in"><p class="lab-aviso">O download com cadastro precisa de JavaScript ligado no navegador.</p></div></noscript></section>`;
  return pagina({ cfg, raiz, titulo: 'Modelos para baixar', descricao: 'Modelos em Excel para gestão da mudança: mapa de adoção, formulário de diagnóstico, mapa de riscos, plano de treinamentos, matriz RACI e mapa de influência.', corpo, caminho: 'modelos/', imagem: 'assets/img/og/lab.jpg', classe: 'pg-lab', scripts: ['assets/js/cfg.js', 'assets/js/modelos.js'], ativo: 'lab' });
}

export function paginaPainel({ cfg }) {
  const raiz = '../';
  const corpo = `<section class="sec sec--lab-pg"><div class="sec-in" data-painel>
  <span class="olho">Painel do autor</span><h1 class="arq-tit" style="text-transform:none">Downloads dos modelos</h1>
  <form class="painel-login" data-login><p class="arq-sub">Área restrita. Entre com o e-mail e a senha de administrador.</p>
    <label class="campo"><span>E-mail</span><input type="email" name="email" required autocomplete="username"></label>
    <label class="campo"><span>Senha</span><input type="password" name="senha" required autocomplete="current-password"></label>
    <p class="portao-erro" data-erro role="alert" hidden></p><button type="submit" class="btn btn--p">Entrar</button></form>
  <div data-dados hidden></div>
</div></section>`;
  return pagina({ cfg, raiz, titulo: 'Painel', descricao: 'Área restrita.', corpo, caminho: 'painel/', classe: 'pg-lab', scripts: ['assets/js/cfg.js', 'assets/js/modelos.js'] }).replace('<meta name="author"', '<meta name="robots" content="noindex, nofollow">\n<meta name="author"');
}
