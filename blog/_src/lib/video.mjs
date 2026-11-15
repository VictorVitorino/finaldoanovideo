// Vídeo interativo da página inicial ("Além do raso"): um filme de 1 min 28 s com capítulos, legendas, pontos clicáveis,
// um momento em que o vídeo espera o toque de quem assiste e uma tela final de escolha.
// Conteúdo editorial: content/video.json. Tempos e posições: content/video-tempos.json, exportado do próprio filme
// (animacao/producao/raso_interativo.mjs). O comportamento fica em assets/js/video.js.
// Sem JavaScript, o vídeo toca com os controles do navegador e a faixa de legendas; a transcrição e os pontos ficam em texto.
import { esc } from './md.mjs';
import { icone } from './ilustra.mjs';
import { titSecao, frases } from './modelos.mjs';

const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const hms = s => { const m = Math.floor(s / 60), r = s - m * 60; return `00:${String(m).padStart(2, '0')}:${r.toFixed(3).padStart(6, '0')}`; };
const falado = s => { const m = Math.floor(s / 60), r = Math.round(s % 60); return `${m} min ${r} s`; };
// ícones dos controles (traço, 24 x 24)
const IC = {
  som: '<path d="M4 9.5v5h3.5L12 18V6L7.5 9.500z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.500 7.500 0 010 11"/>',
  legendas: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M7 10.500h4M7 14h7M14 10.500h3"/>',
  cheia: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

// legendas em WebVTT, sem sobreposição entre os blocos
export function legendasVTT(tempos) {
  const L = tempos.legendas;
  return 'WEBVTT\n\n' + L.map((l, i) => `${i + 1}\n${hms(Math.max(0, l.a))} --> ${hms(Math.min(l.b, i + 1 < L.length ? L[i + 1].a - 0.02 : l.b))}\n${l.texto}`).join('\n\n') + '\n';
}

export function blocoVideo({ v, tempos, raiz = '', cfg }) {
  if (!v || !tempos) return '';
  const dur = tempos.duracao;
  for (const p of tempos.pontos) if (!v.pontos[p.id]) throw new Error(`video.json: falta o texto do ponto "${p.id}"`);
  const pontos = tempos.pontos.map(p => { const c = v.pontos[p.id]; return { id: p.id, g: v.grupos[p.grupo] || '', e: p.grupo === 'fatores' && p.x + p.w / 2 < 50, de: p.de, ate: p.ate, x: p.x, y: p.y, w: p.w, h: p.h, t: c.titulo, tx: c.texto, fz: c.fazemos, l: c.link ? [c.link[0], raiz + c.link[1]] : null }; });
  const base = String(cfg.url || '').replace(/\/$/, '') + '/', iso = `PT${Math.floor(dur / 60)}M${Math.round(dur % 60)}S`;
  const ld = cfg.url ? { '@context': 'https://schema.org', '@type': 'VideoObject', name: v.titulo, description: v.nota.replace(/\s*\n\s*/g, ' '), thumbnailUrl: base + v.capa, contentUrl: base + v.hd, uploadDate: v.data, duration: iso, inLanguage: cfg.idioma || 'pt-BR', transcript: tempos.legendas.map(l => l.texto).join(' ') } : null;
  const dados = { dur, hd: raiz + v.hd, sd: raiz + v.sd, caps: tempos.capitulos, leg: tempos.legendas.map(l => [l.a, l.b, l.texto]), pausa: tempos.pausa, fim: tempos.final, pontos: pontos.map(({ e, ...p }) => p) };
  const grupos = Object.keys(v.grupos).map(g => ({ nome: v.grupos[g], itens: tempos.pontos.filter(p => p.grupo === g) }));
  // transcrição: um parágrafo por capítulo
  const trans = tempos.capitulos.map((c, i) => { const fim = i + 1 < tempos.capitulos.length ? tempos.capitulos[i + 1].t : dur; return { nome: c.nome, t: c.t, texto: tempos.legendas.filter(l => l.a + 0.2 >= c.t && l.a + 0.2 < fim).map(l => l.texto).join(' ') }; });
  return `<section class="sec sec--video" id="video" aria-labelledby="video-t">
  <div class="sec-in">
    ${titSecao('video', esc(v.olho), esc(v.titulo), frases(v.nota))}
    <div class="vi revela" data-vi>
      <div class="vi-tela" data-vi-tela>
        <div class="vi-palco" data-vi-palco style="--tx:${tempos.pausa.x}%;--ty:${tempos.pausa.y}%">
          <video class="vi-video" data-vi-video controls playsinline preload="none" poster="${raiz}${esc(v.capa)}" width="1920" height="1080" aria-label="Vídeo: ${esc(v.titulo)}">
            <source src="${raiz}${esc(v.sd)}" type="video/mp4">
            <track kind="captions" srclang="pt-BR" label="Português" src="${raiz}${esc(v.legendas)}" default>
            <a href="${raiz}${esc(v.sd)}">Baixar o vídeo (MP4)</a>
          </video>
          <button type="button" class="vi-play so-js" data-vi-play><span class="vi-play-ic">${icone('play')}</span><span class="vi-play-txt"><b>${esc(v.botao)}</b><small>${falado(dur)} · com narração e legendas</small></span></button>
          <div class="vi-pontos so-js" data-vi-pontos>${pontos.map(p => `<button type="button" class="vi-ponto${p.e ? ' vi-ponto--e' : ''}" data-vi-ponto="${esc(p.id)}" style="left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%" aria-label="Abrir: ${esc(p.t)}" hidden><i></i></button>`).join('')}</div>
          <p class="vi-legenda so-js" data-vi-legenda hidden></p>
          <p class="vi-dica so-js" data-vi-dica hidden><i class="vi-mais"></i>${esc(v.dica)}</p>
          <div class="vi-toque so-js" data-vi-toque hidden>
            <button type="button" class="vi-toque-alvo" data-vi-quebrar aria-label="${esc(v.pausa.titulo)}"><b></b><i></i></button>
            <p class="vi-toque-txt"><b>${esc(v.pausa.titulo)}</b><span>${esc(v.pausa.sub)}</span><button type="button" data-vi-seguir>${esc(v.pausa.seguir)}${icone('seta')}</button></p>
          </div>
          <span class="vi-roda so-js" aria-hidden="true"></span>
          <p class="vi-aviso so-js" data-vi-erro hidden>${esc(v.erro || 'Não foi possível carregar o vídeo.')} <a href="${raiz}${esc(v.sd)}">Abrir o arquivo</a></p>
        </div>
        <aside class="vi-cartao so-js" data-vi-cartao hidden aria-label="Ponto do vídeo">
          <small data-vi-c-grupo></small><h3 data-vi-c-tit tabindex="-1"></h3><p data-vi-c-texto></p>
          <p class="vi-cartao-fz"><b>O que a gente faz</b><span data-vi-c-fz></span></p>
          <a class="link-seta" data-vi-c-link href="#"><span></span>${icone('seta')}</a>
          <button type="button" class="btn btn--claro btn--peq" data-vi-continuar>${icone('play')}Continuar o vídeo</button>
        </aside>
        <div class="vi-fim so-js" data-vi-fim hidden>
          <h3 tabindex="-1" data-vi-fim-tit>${esc(v.fim.titulo)}</h3>
          <ul class="vi-fim-opcoes" aria-label="${esc(v.fim.nota)}">${v.fim.opcoes.map(([t, h]) => `<li><a class="vi-opcao" href="${raiz}${esc(h)}">${esc(t)}</a></li>`).join('')}</ul>
        </div>
        <div class="vi-barra so-js" data-vi-barra>
          <button type="button" class="vi-bt vi-bt--p" data-vi-tocar aria-label="Reproduzir">${icone('play')}</button>
          <span class="vi-tempo"><b data-vi-t>0:00</b><i>/</i>${mmss(dur)}</span>
          <span class="vi-trilho"><input type="range" data-vi-prog min="0" max="${dur}" step="0.05" value="0" aria-label="Posição no vídeo" aria-valuetext="0:00 de ${mmss(dur)}"><span class="vi-marcos" aria-hidden="true">${tempos.capitulos.slice(1).map(c => `<i style="left:${(c.t / dur * 100).toFixed(2)}%"></i>`).join('')}</span></span>
          <button type="button" class="vi-bt" data-vi-leg aria-pressed="true" aria-label="Legendas" data-dica="Legendas · C">${ic('legendas')}</button>
          <button type="button" class="vi-bt" data-vi-som aria-pressed="true" aria-label="Som" data-dica="Som · M">${ic('som')}</button>
          <button type="button" class="vi-bt" data-vi-cheia aria-label="Tela cheia" data-dica="Tela cheia · F">${ic('cheia')}</button>
        </div>
      </div>
      <ol class="vi-caps" aria-label="Capítulos do vídeo">${tempos.capitulos.map((c, i) => `<li data-vi-cap="${i}" data-t="${c.t}"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(c.nome)}</b><small>${mmss(c.t)}</small></li>`).join('')}</ol>
      <div class="vi-explora so-js">
        <div class="vi-explora-cab"><h3>Explore os ${pontos.length} pontos</h3><span class="vi-conta" data-vi-conta data-total="${pontos.length}" aria-live="polite"></span></div>
        ${grupos.map((g, i) => `<div class="vi-grupo"><h4 id="vi-g${i}">${esc(g.nome)}</h4><ul aria-labelledby="vi-g${i}">${g.itens.map(p => `<li><button type="button" class="vi-chip" data-vi-chip="${esc(p.id)}">${esc(v.pontos[p.id].titulo)}</button></li>`).join('')}</ul></div>`).join('')}
      </div>
      <details class="vi-texto">
        <summary>${icone('lista')}Ler a transcrição e os pontos do vídeo</summary>
        <div class="vi-texto-in">
          <section><h3>Transcrição</h3>${trans.map(x => `<p><b>${esc(x.nome)} (${mmss(x.t)}).</b> ${esc(x.texto)}</p>`).join('')}</section>
          <section><h3>Pontos do vídeo</h3><dl>${pontos.map(p => `<div><dt>${esc(p.t)}</dt><dd>${esc(p.tx)} <i>O que a gente faz: ${esc(p.fz)}</i>${p.l ? ` <a href="${esc(p.l[1])}">${esc(p.l[0])}</a>` : ''}</dd></div>`).join('')}</dl></section>
        </div>
      </details>
      <p class="vi-creditos">${esc(v.creditos)}</p>
      <script type="application/json" data-vi-dados>${JSON.stringify(dados).replace(/</g, '\\u003c')}</script>${ld ? `
      <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : ''}
    </div>
  </div>
</section>`;
}
