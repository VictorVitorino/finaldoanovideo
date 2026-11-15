// Página de Serviços (serviços particulares de gestão da mudança e IA aplicada) e o convite dela na página inicial.
// Os efeitos (galeria que desliza, ficha em foco, cartões que viram, fluxos por tipo de projeto, narrativa fixa e gráfico que se constrói)
// ficam em assets/js/efeitos.js; aqui só a estrutura. Sem JavaScript, tudo aparece como texto e listas.
import { esc } from './md.mjs';
import { icone, iceberg } from './ilustra.mjs';
import { iconeVivo } from './vivo.mjs';
import { pagina, titSecao, navGaleria, botoesContato, contato, frases, corrido } from './modelos.mjs';
import { foto, papeis } from './sobre.mjs';
import { secaoFluxos } from './fluxos.mjs';

const tit = l => esc(l).replace(/\*(.+?)\*/g, '<em>$1</em>');
const lista = (itens, cls = '') => `<ul class="checks${cls ? ' ' + cls : ''}">${itens.map(e => `<li>${icone('check')}<span>${esc(e)}</span></li>`).join('')}</ul>`;

// ---------- gráfico que se constrói: barras, linha de tendência e pontos ----------
function graficoSVG(g) {
  const W = 520, H = 300, X0 = 56, Y0 = 244, AL = 190, max = 60, n = g.ondas.length, passo = (W - X0 - 30) / n, LB = 64;
  const y = v => Y0 - v / max * AL, cx = i => X0 + passo * i + passo / 2;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Índice de adoção por onda: ${esc(g.ondas.map(o => `${o.rotulo}, ${o.valor}%`).join('; '))}">
  <g class="gr-eixos">${[0, 20, 40, 60].map(v => `<path d="M${X0} ${y(v)}H${W - 20}"/><text x="${X0 - 10}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`).join('')}${g.ondas.map((o, i) => `<text x="${cx(i)}" y="${Y0 + 24}" text-anchor="middle">${esc(o.rotulo)}</text>`).join('')}</g>
  ${g.ondas.map((o, i) => `<rect class="gr-barra" style="--i:${i}" x="${cx(i) - LB / 2}" y="${y(o.valor)}" width="${LB}" height="${Y0 - y(o.valor)}" rx="6"/>`).join('')}
  <path class="gr-linha" d="M${g.ondas.map((o, i) => `${cx(i)} ${y(o.valor)}`).join('L')}" pathLength="1"/>
  ${g.ondas.map((o, i) => `<g class="gr-ponto" style="--i:${i}"><circle cx="${cx(i)}" cy="${y(o.valor)}" r="6"/><text x="${cx(i)}" y="${y(o.valor) - 14}" text-anchor="middle">${o.valor}%</text></g>`).join('')}
  </svg>`;
}

// ---------- convite na página inicial ----------
export const blocoServicos = (c, raiz) => !c ? '' : `<section class="sec sec--servicos" id="servicos" aria-labelledby="servicos-t">
  <div class="sec-in">
    <a class="convite holo holo--auto revela" href="${raiz}servicos/">
      <div class="convite-txt"><span class="olho">${esc(c.olho)}</span><h2 id="servicos-t">Change Management Advisory e IA aplicada, com apoio de perto</h2><p>${esc(c.resumo_inicio)}</p></div>
      <ul class="convite-lista">${c.servicos.map(s => `<li>${icone('check')}<span>${esc(s.nome)}</span></li>`).join('')}</ul>
      <span class="btn btn--claro">Ver os serviços${icone('seta')}</span>
    </a>
  </div>
</section>`;

// ---------- página ----------
export function paginaServicos({ cfg, c, perfil, fluxos }) {
  const raiz = '../', j = c.jornada, g = c.grafico, v = c.viradas, ac = c.acompanhamento, ct = contato(cfg), q = c.quem;
  const acoes = botoesContato(cfg, { principal: 'btn--p', apoio: 'btn--s' });
  // quem conduz: apresentação pessoal logo depois da abertura. Com o arquivo da foto (perfil.foto), o cartão mostra o retrato em círculo; sem ele, o iceberg da marca.
  const papel1 = perfil ? (perfil.papel_linhas || [perfil.papel])[0] : '';
  const quem = !(q && perfil) ? '' : `<section class="sec sec--quem" id="quem" aria-labelledby="quem-t">
  <div class="sec-in">
    <div class="quem${perfil.temFoto ? ' quem--foto' : ''}">
      <figure class="quem-retrato${perfil.temFoto ? ' quem-retrato--foto' : ' quem-retrato--arte'} revela">${perfil.temFoto ? `<span class="quem-rosto">${foto(perfil, raiz, '')}</span>` : iceberg({ recorte: [66, 40, 440, 550], id: 'quem' })}${perfil.chamada ? `<figcaption>${perfil.chamada.map(l => `<span>${tit(l)}</span>`).join('')}</figcaption>` : ''}</figure>
      <div class="quem-txt">
        <div class="quem-cab revela"><span class="olho">${esc(q.olho)}</span><h2 id="quem-t">${esc(perfil.nome)}</h2><p class="sobre-papel">${papeis(perfil)}</p></div>
        <div class="quem-bio revela" style="--i:1">${perfil.bio.slice(0, 2).map(p => `<p>${frases(p)}</p>`).join('')}</div>
        <ul class="quem-frentes revela" style="--i:2" aria-label="Frentes de atuação">${perfil.pilares.map((x, i) => `<li class="vivo" style="--i:${i}"><span class="quem-ic">${iconeVivo(x.icone || 'orbita')}</span><b>${esc(x.frente)}</b></li>`).join('')}</ul>
        <p class="quem-nota revela" style="--i:3">${frases(q.frase)}</p>
        <div class="sobre-acoes revela" style="--i:3">${ct.zap ? `<a class="btn btn--p" href="${esc(ct.zap)}" target="_blank" rel="noopener">${icone('conversa')}Chamar no WhatsApp</a>` : ''}<a class="btn btn--s" href="${raiz}sobre/">${esc(q.link)}${icone('seta')}</a><button type="button" class="link-seta so-js" data-salvar-contato data-nome="${esc(perfil.nome)}" data-papel="${esc(papel1)}" data-tel="${esc(ct.hrefTel.replace('tel:', ''))}" data-linkedin="${esc(cfg.linkedin || '')}" data-site="${esc(cfg.url || '')}">${icone('marcador')}Salvar contato</button></div>
      </div>
    </div>
  </div>
</section>
`;
  const rosto = perfil && perfil.temFoto ? `<span class="fecho-rosto">${foto(perfil, raiz, '')}<span><b>${esc(perfil.nome)}</b><i>${esc(papel1)}</i></span></span>` : '';
  const ficha = s => `<article class="ficha" id="servico-${esc(s.id)}" data-det="${esc(s.id)}">
        <header class="ficha-cab"><small>${esc(s.olho)}</small><h3>${esc(s.nome)}</h3><p>${esc(s.frase)}</p></header>
        <div class="ficha-grade">
          <section><h4>Para quem</h4><p>${esc(s.para_quem)}</p><h4>O que inclui</h4>${lista(s.inclui)}</section>
          <section><h4>Como funciona</h4><ol class="ficha-etapas">${s.como.map((e, i) => `<li><span>${i + 1}</span><b>${esc(e.t)}</b><em>${esc(e.d)}</em></li>`).join('')}</ol><h4>Acompanhamento</h4><p>${esc(s.acompanhamento)}</p><h4>O que você recebe</h4><p class="ficha-entregas">${s.entregas.map(e => `<span>${esc(e)}</span>`).join('')}</p><h4>Formato</h4><p>${esc(s.formato)}</p></section>
        </div>
        ${acoes ? `<footer class="ficha-pe">${acoes}</footer>` : ''}
      </article>`;
  const corpo = `<section class="abertura abertura--pg" aria-labelledby="ab-t">
  <div class="abertura-in">
    <div class="abertura-txt">
      <span class="selo revela">${esc(c.olho)} <i></i> ${esc(cfg.autor)}</span>
      <h1 id="ab-t" class="mega">${c.titulo.map(l => `<span class="mega-l"><span>${tit(l)}</span></span>`).join('')}</h1>
      <p class="abertura-lead revela">${frases(c.lead)}</p>
      <div class="abertura-acoes revela">${ct.zap ? `<a class="btn btn--p" href="${esc(ct.zap)}" target="_blank" rel="noopener">${icone('conversa')}Chamar no WhatsApp</a>` : ''}<a class="btn btn--s" href="#servicos">Ver os serviços${icone('setaBaixo')}</a></div>
    </div>
    <ul class="frentes revela" aria-label="Duas frentes de trabalho">${c.frentes.map(x => `<li class="frente holo vivo"><span class="frente-ic">${iconeVivo(x.icone || 'orbita')}</span><b>${esc(x.nome)}</b><p>${esc(x.frase)}</p>${lista(x.itens)}</li>`).join('')}</ul>
  </div>
</section>

${quem}<section class="sec sec--servicos-pg" id="servicos" aria-labelledby="servicos-t">
  <div class="sec-in">
    ${titSecao('servicos', 'Serviços', esc(c.servicos_titulo), esc(c.servicos_nota))}
    <div class="galeria galeria--servicos galeria--centro revela" data-galeria data-inicio="${Math.floor(c.servicos.length / 2)}">
      <ol class="galeria-trilho" data-cursor="Arraste" tabindex="0" aria-label="Serviços">${c.servicos.map((s, i) => `<li class="galeria-item"><a class="servico holo vivo" href="#servico-${esc(s.id)}" data-foco="${esc(s.id)}"><span class="servico-ic">${iconeVivo(s.icone || 'orbita')}</span><span class="servico-n">${String(i + 1).padStart(2, '0')}</span><small>${esc(s.olho)}</small><b>${esc(s.nome)}</b><span class="servico-frase">${esc(s.frase)}</span>${lista(s.inclui.slice(0, 4), 'checks--p')}<em>Abrir a ficha completa${icone('seta')}</em></a></li>`).join('')}</ol>
      ${navGaleria('Serviços')}
    </div>
    <div class="fichas">${c.servicos.map(ficha).join('\n')}</div>
  </div>
</section>

<section class="sec sec--viradas" aria-labelledby="viradas-t">
  <div class="sec-in">
    ${titSecao('viradas', esc(v.olho), esc(v.titulo), esc(v.nota), `<button type="button" class="btn btn--s btn--peq so-js" data-virar-todos aria-pressed="false">${icone('ciclo')}<span>Virar todos</span></button>`)}
    <div class="viradas revela" data-viradas>${v.itens.map((x, i) => `<button type="button" class="virada vivo" style="--i:${i}" aria-pressed="false"><span class="virada-face virada-frente"><span class="virada-ic">${iconeVivo(x.icone || 'orbita')}</span><small>O que aparece</small><b>${esc(x.frente)}</b><em>${icone('ciclo')}Virar</em></span><span class="virada-face virada-verso"><small>Como eu ajudo</small><b>${esc(x.verso)}</b></span></button>`).join('')}</div>
  </div>
</section>

${secaoFluxos(fluxos, raiz)}

<section class="sec sec--acomp" id="acompanhamento" aria-labelledby="acomp-t">
  <div class="sec-in">
    ${titSecao('acomp', esc(ac.olho), esc(ac.titulo), esc(ac.nota))}
    <ol class="momentos">${ac.momentos.map((m, i) => `<li class="momento revela" style="--i:${i}"><span class="momento-q">${esc(m.quando)}</span><h3>${esc(m.titulo)}</h3><p>${esc(m.texto)}</p>${lista(m.itens, 'checks--p')}</li>`).join('')}</ol>
    <div class="ritos revela"><h3>${esc(ac.ritos_titulo)}</h3><dl>${ac.ritos.map(r => `<div><dt>${esc(r.t)}</dt><dd>${esc(r.d)}</dd></div>`).join('')}</dl></div>
  </div>
</section>

<section class="sec sec--jornada" aria-labelledby="jornada-t">
  <div class="sec-in">
    ${titSecao('jornada', esc(j.olho), esc(j.titulo), '')}
    <div class="historia" data-historia>
      <div class="historia-fixo"><div class="historia-painel">
        <svg class="historia-trilha" viewBox="0 0 320 190" aria-hidden="true"><path class="trilha-base" d="M22 160C92 160 84 58 160 98S250 30 298 30"/><path class="trilha-feita" d="M22 160C92 160 84 58 160 98S250 30 298 30" pathLength="1"/>${j.fases.map((_, i) => `<circle class="trilha-parada" data-parada="${i}" r="5"/>`).join('')}<g class="trilha-marca"><circle r="15" class="trilha-halo"/><circle r="8" class="trilha-centro"/></g></svg>
        <p class="historia-fase"><small>Fase <b data-h-n>1</b> de ${j.fases.length}</small><strong data-h-nome>${esc(j.fases[0].nome)}</strong><span data-h-frase>${esc(j.fases[0].frase)}</span></p>
        <ul class="checks checks--p historia-entregas" data-h-entregas>${j.fases[0].entregas.map(e => `<li>${icone('check')}<span>${esc(e)}</span></li>`).join('')}</ul>
        <div class="historia-barra" aria-hidden="true"><i></i></div>
        <div class="historia-botoes so-js" role="group" aria-label="Ir para a fase">${j.fases.map((x, i) => `<button type="button" data-h-ir="${i}"${i ? '' : ' aria-current="true"'}>${esc(x.nome)}</button>`).join('')}</div>
      </div></div>
      <ol class="historia-passos">${j.fases.map((x, i) => `<li class="historia-passo" data-i="${i}" data-nome="${esc(x.nome)}" data-frase="${esc(x.frase)}" data-entregas="${esc(JSON.stringify(x.entregas))}"><span class="historia-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(x.nome)}</h3><p class="historia-frase">${esc(x.frase)}</p><p>${esc(x.texto)}</p>${lista(x.entregas, 'checks--p')}</li>`).join('')}</ol>
    </div>
  </div>
</section>

<section class="sec sec--grafico" aria-labelledby="grafico-t">
  <div class="sec-in">
    <div class="grafico-grade">
      <div class="grafico-txt">${titSecao('grafico', esc(g.olho), esc(g.titulo), '')}<p class="grafico-nota">${esc(g.nota)}</p><div class="grafico-acoes"><button type="button" class="btn btn--s btn--peq so-js" data-gr-repetir>${icone('ciclo')}Montar de novo</button><a class="link-seta" href="${raiz}posts/mapa-de-perfil-cognitivo/">Ver o vídeo da capa${icone('seta')}</a></div></div>
      <figure class="grafico" data-grafico>${graficoSVG(g)}</figure>
    </div>
  </div>
</section>

<section class="sec sec--fecho" id="contato" aria-labelledby="fecho-t">
  <div class="sec-in"><div class="convite convite--fecho holo holo--auto revela"><div class="convite-txt">${rosto}<span class="olho">${esc(c.fecho.olho)}</span><h2 id="fecho-t">${esc(c.fecho.titulo)}</h2><p>${frases(c.fecho.texto)}</p></div><div class="convite-acoes">${botoesContato(cfg, { principal: 'btn--claro', apoio: 'btn--vidro', telefone: true })}</div></div></div>
</section>`;
  return pagina({ cfg, raiz, titulo: 'Serviços', descricao: corrido(c.lead), corpo, caminho: 'servicos/', imagem: 'assets/img/og/servicos.jpg', classe: 'pg-servicos pg-escura', ativo: 'servicos' });
}
