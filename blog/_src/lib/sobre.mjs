// Página "Sobre" (quem escreve, como pensa e o que recomenda) e o resumo dela na página inicial.
// Efeitos (assets/js/efeitos.js e jornada.css): cartão de contato na abertura, pilares em cartões que inclinam com o cursor
// e têm ícones que se desenham, estante em carrossel 3D num palco com foco de luz. Sem JavaScript, tudo aparece aberto.
import { esc } from './md.mjs';
import { icone, iceberg } from './ilustra.mjs';
import { iconeVivo, motivoLivro } from './vivo.mjs';
import { pagina, titSecao, contato, frases, corrido } from './modelos.mjs';

const tit = l => esc(l).replace(/\*(.+?)\*/g, '<em>$1</em>');
export const foto = (perfil, raiz, cls) => `<img${cls ? ` class="${cls}"` : ''} src="${raiz}${esc(perfil.foto)}" alt="${esc(perfil.nome)}" width="480" height="600" loading="lazy" decoding="async">`;

export const papeis = perfil => (perfil.papel_linhas || [perfil.papel]).map(l => `<span>${esc(l)}</span>`).join('');
// cartão de contato: o iceberg da marca (ou a foto), nome, cargo em linhas e os canais; "Salvar contato" baixa um .vcf
export const cartaoVisita = (cfg, perfil, raiz) => {
  const ct = contato(cfg);
  return `<aside class="cv" data-inclina aria-label="Cartão de contato de ${esc(perfil.nome)}">
      <div class="cv-topo">${perfil.temFoto ? foto(perfil, raiz, 'cv-foto') : `<div class="cv-cena">${iceberg({ recorte: [20, 100, 520, 280], id: 'cv' })}</div>`}</div>
      <div class="cv-corpo">
        <b class="cv-nome">${esc(perfil.nome)}</b>
        <p class="cv-papel">${papeis(perfil)}</p>
        <ul class="cv-linhas">${ct.zap ? `<li><a href="${esc(ct.zap)}" target="_blank" rel="noopener">${icone('conversa')}<span>WhatsApp</span><b>${esc(ct.tel)}</b></a></li>` : ct.tel ? `<li><a href="${esc(ct.hrefTel)}">${icone('telefone')}<span>Telefone</span><b>${esc(ct.tel)}</b></a></li>` : ''}${cfg.linkedin ? `<li><a href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}<span>LinkedIn</span><b>Ver o perfil</b></a></li>` : ''}</ul>
        <button type="button" class="btn btn--claro so-js" data-salvar-contato data-nome="${esc(perfil.nome)}" data-papel="${esc((perfil.papel_linhas || [perfil.papel])[0])}" data-tel="${esc(ct.hrefTel.replace('tel:', ''))}" data-linkedin="${esc(cfg.linkedin || '')}" data-site="${esc(cfg.url || '')}">${icone('marcador')}Salvar contato</button>
      </div>
    </aside>`;
};

// ---------- resumo na página inicial: só texto (e a foto, quando o arquivo existe) ----------
export const blocoSobre = ({ cfg, perfil, raiz }) => `<section class="sec sec--sobre" id="sobre" aria-labelledby="sobre-t">
  <div class="sec-in">
    <div class="autor${perfil.temFoto ? ' autor--foto' : ''}">
      ${perfil.temFoto ? `<div class="autor-foto revela">${foto(perfil, raiz, '')}</div>` : ''}
      <div class="autor-nome revela">
        <span class="olho">Quem escreve</span>
        <h2 id="sobre-t">${esc(perfil.nome)}</h2>
        <p class="sobre-papel">${papeis(perfil)}</p>
      </div>
      <div class="autor-txt revela" style="--i:1">
        <p>${frases(perfil.bio_curta || perfil.bio[0])}</p>
        <div class="sobre-acoes"><a class="btn btn--p" href="${raiz}sobre/">Conhecer o Victor${icone('seta')}</a>${cfg.linkedin ? `<a class="btn btn--s" href="${esc(cfg.linkedin)}" target="_blank" rel="noopener">${icone('linkedin')}LinkedIn</a>` : ''}</div>
      </div>
    </div>
  </div>
</section>`;

// ---------- página ----------
export function paginaSobre({ cfg, perfil, estante, convite = '' }) {
  const raiz = '../', chamada = [].concat(perfil.chamada || perfil.nome), livros = estante ? estante.itens : [], n = livros.length;
  const nn = i => String(i + 1).padStart(2, '0'), curto = b => b.titulo.split(':')[0];
  // capa do livro: a imagem real quando existe; senão, uma capa desenhada com o motivo da ideia
  const capaLivro = (b, i) => `<button class="capa-livro${b.capa ? '' : ' capa-livro--desenho'}" type="button" style="--v:${i % 4}" aria-label="Livro ${i + 1} de ${n}: ${esc(curto(b))}, de ${esc(b.autor)}. Ver o resumo">${b.capa ? `<img src="${raiz}${esc(b.capa)}" alt="" width="${b.capa_l || 300}" height="${b.capa_a || 450}" loading="lazy" decoding="async" draggable="false">` : `<small>${esc(b.tipo)}</small>${motivoLivro(b.motivo)}<b>${esc(curto(b))}</b><i>${esc(b.autor)}</i>`}</button>`;
  const corpo = `<section class="abertura abertura--pg abertura--sobre" aria-labelledby="ab-t">
  <div class="abertura-in">
    <div class="abertura-txt">
      <span class="selo revela">Sobre <i></i> ${esc(perfil.nome)}</span>
      <h1 id="ab-t" class="mega">${chamada.map(l => `<span class="mega-l"><span>${tit(l)}</span></span>`).join('')}</h1>
      <p class="abertura-lead revela">${frases(perfil.bio[0])}</p>
      <div class="abertura-acoes revela"><a class="btn btn--p" href="${raiz}servicos/">Ver os serviços${icone('seta')}</a><a class="btn btn--s" href="#estante">O que eu recomendo${icone('setaBaixo')}</a></div>
    </div>
    <div class="retrato revela">${cartaoVisita(cfg, perfil, raiz)}</div>
  </div>
</section>

<section class="sec sec--pilares" aria-labelledby="pilares-t">
  <div class="sec-in">
    <div class="pilares-cab">
      <div><span class="olho revela">Como eu trabalho</span><h2 id="pilares-t" class="revela">Quatro ideias que guiam o meu trabalho</h2></div>
      <div class="pilares-txt">${perfil.bio.slice(1).map(b => `<p class="revela">${frases(b)}</p>`).join('')}<a class="link-seta revela" href="${raiz}servicos/">Ver os serviços${icone('seta')}</a></div>
    </div>
    <ol class="pilares">${(perfil.pilares || []).map((x, i) => `<li class="revela" style="--i:${i}"><article class="pilar holo vivo" data-inclina><span class="pilar-ic">${iconeVivo(x.icone || 'orbita')}</span><small>Pilar ${nn(i)}</small><h3>${esc(x.frente)}</h3><p>${esc(x.verso)}</p></article></li>`).join('')}</ol>
  </div>
</section>
${n ? `
<section class="sec sec--estante palco" id="estante" aria-labelledby="estante-t">
  <div class="sec-in">
    ${titSecao('estante', 'Sugestões', esc(estante.titulo), esc(estante.nota))}
    <div class="livros revela" data-livros>
      <div class="livros-in">
        <div class="livros-face livros-frente">
          <div class="pilha"><ol class="pilha-lista" data-cursor="Arraste">${livros.map((b, i) => `<li class="pilha-item" style="--k:${i}">${capaLivro(b, i)}</li>`).join('')}</ol></div>
          <div class="livros-txt">
            <div class="estante-fala" aria-live="polite">
              <small class="estante-conta"><b data-l-n>01</b> de ${nn(n - 1)}</small>
              <span class="estante-rot">A pergunta</span>
              <p class="estante-pergunta" data-l-pergunta>${esc(livros[0].pergunta || '')}</p>
              <p class="estante-livro"><b data-l-titulo>${esc(curto(livros[0]))}</b><span data-l-autor>${esc(livros[0].autor)}</span></p>
            </div>
            <div class="livros-acoes"><button type="button" class="btn btn--claro" data-l-abrir>${icone('ciclo')}Ver o resumo</button>
              <div class="estante-nav"><button type="button" data-l-ant aria-label="Livro anterior">${icone('setaEsq')}</button><ol class="estante-marcos" aria-label="Ir para o livro">${livros.map((b, i) => `<li><button type="button" data-l-ir="${i}" aria-label="Livro ${i + 1}: ${esc(curto(b))}"></button></li>`).join('')}</ol><button type="button" data-l-prox aria-label="Próximo livro">${icone('seta')}</button></div></div>
            <p class="livros-dica">${icone('mao')}Arraste o livro da frente para o lado, ou toque nele para ver o resumo.</p>
          </div>
        </div>
        <div class="livros-face livros-verso" aria-hidden="true" inert>
          <header class="contexto-cab"><span class="contexto-capa" data-l-capa></span><div><small>Página de contexto · <span data-l-conta2></span></small><h3 data-l-titulo2></h3><p data-l-autor2></p></div><button type="button" class="btn btn--s btn--peq" data-l-voltar>${icone('setaEsq')}Voltar à pilha</button></header>
          <div class="contexto">
            <section><h4>O livro em três ideias</h4><ol class="contexto-ideias" data-l-ideias></ol></section>
            <section class="contexto-leitura"><h4>Minha leitura para a gestão da mudança</h4><p data-l-leitura></p><a class="link-seta" data-l-fonte href="#" target="_blank" rel="noopener">Ver o livro${icone('setaFora')}</a></section>
          </div>
          <div class="contexto-pe"><button type="button" data-l-ant2>${icone('setaEsq')}Livro anterior</button><button type="button" data-l-prox2>Próximo livro${icone('seta')}</button></div>
        </div>
      </div>
      <script type="application/json" data-livros-dados>${JSON.stringify(livros.map(b => ({ t: curto(b), a: b.autor, p: b.pergunta || '', i: b.ideias || [], l: b.leitura || b.porque, c: b.capa ? raiz + b.capa : '', f: b.fonte || '' }))).replace(/</g, '\\u003c')}</script>
    </div>
    <ol class="livros-lista">${livros.map((b, i) => `<li>${b.capa ? `<img src="${raiz}${esc(b.capa)}" alt="Capa do livro ${esc(curto(b))}" width="${b.capa_l || 300}" height="${b.capa_a || 450}" loading="lazy" decoding="async">` : ''}<div><small>${nn(i)} · ${esc(b.autor)}</small><h3>${esc(curto(b))}</h3><p class="livro-pergunta">${esc(b.pergunta || '')}</p>${(b.ideias || []).length ? `<ul>${b.ideias.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}<p><b>Minha leitura.</b> ${esc(b.leitura || b.porque)}</p></div></li>`).join('')}</ol>
    <p class="livros-credito">Capas: Google Books. Os resumos e as leituras são do autor do blog.</p>
  </div>
</section>` : ''}

<section class="sec sec--gosto" aria-labelledby="gosto-t">
  <div class="sec-in">
    <h2 class="vis-oculto" id="gosto-t">Fora do roteiro</h2>
    <div class="sobre-cols sobre-cols--pg">
      <div class="revela"><h3>${icone('coracao')}O que eu gosto</h3><ul class="gostos">${perfil.gosto.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div>
      <div class="revela" style="--i:1"><h3>${icone('lampada')}Fun fact</h3><p class="fato">${esc(perfil.fun_fact)}</p></div>
    </div>
  </div>
</section>
${convite}`;
  return pagina({ cfg, raiz, titulo: `Sobre ${perfil.nome}`, descricao: corrido(perfil.bio_curta || perfil.bio[0]), corpo, caminho: 'sobre/', imagem: 'assets/img/og/sobre.jpg', classe: 'pg-sobre pg-escura', ativo: 'sobre' });
}
