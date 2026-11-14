// Gera o blog estático a partir de _src/content. Uso: node blog/_src/build.mjs
// Saída (na pasta blog/): index.html, posts/<slug>/index.html, mes/<aaaa-mm>/index.html, 404.html, sitemap.xml.
// Para as imagens de compartilhamento do LinkedIn (assets/img/og/*.png), rode depois: node blog/_src/og.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { frontMatter, markdown, minutos } from './lib/md.mjs';
import { marca } from './lib/ilustra.mjs';
import { inicio, post, mes, naoAchou, TEMAS } from './lib/modelos.mjs';
import { secaoLab, labInicio, labDiagnostico, labRaci, labInfluencia, labAdocao, FERRAMENTAS, paginaModelos, paginaPainel } from './lib/lab.mjs';

const SRC = dirname(fileURLToPath(import.meta.url)), SAIDA = join(SRC, '..'), CONT = join(SRC, 'content');
const json = f => JSON.parse(readFileSync(join(CONT, f), 'utf8'));
const grava = (rel, txt) => { const p = join(SAIDA, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, txt); };

export function carrega() {
  const cfg = JSON.parse(readFileSync(join(SRC, 'site.config.json'), 'utf8'));
  const posts = readdirSync(join(CONT, 'posts')).filter(f => f.endsWith('.md')).map(f => {
    const { meta, corpo } = frontMatter(readFileSync(join(CONT, 'posts', f), 'utf8'));
    const p = { ...meta, slug: meta.slug || f.replace(/\.md$/, ''), corpo, html: markdown(corpo), min: minutos(corpo), ordem: Number(meta.ordem ?? 500) };
    for (const k of ['titulo', 'data', 'tipo', 'tema', 'resumo']) if (!p[k]) throw new Error(`${f}: falta "${k}" no cabeçalho`);
    if (!TEMAS[p.tema]) throw new Error(`${f}: tema desconhecido "${p.tema}" (use: ${Object.keys(TEMAS).join(', ')})`);
    return p;
  }).sort((a, b) => (b.data.localeCompare(a.data)) || (a.ordem - b.ordem) || a.titulo.localeCompare(b.titulo));
  const slugs = new Set();
  for (const p of posts) { if (slugs.has(p.slug)) throw new Error('slug repetido: ' + p.slug); slugs.add(p.slug); }
  // diagnóstico: um arquivo por domínio em content/diagnostico, na ordem abaixo
  const ORDEM = ['modelos', 'estrategia', 'pessoas', 'execucao', 'medicao', 'contextos'];
  const dominios = ORDEM.filter(d => existsSync(join(CONT, 'diagnostico', d + '.json'))).map(d => ({ id: d, ...json(`diagnostico/${d}.json`) }));
  return { cfg, posts, eventos: json('eventos.json'), videos: json('videos.json'), perfil: json('perfil.json'), home: json('home.json'), dominios, relatorio: json('diagnostico-relatorio.json') };
}

function gera() {
  const d = carrega(), { cfg, posts } = d;
  const capaPost = posts.find(p => p.slug === cfg.edicao.capa);
  if (capaPost) cfg.capaMenu = { slug: capaPost.slug, titulo: capaPost.titulo };
  for (const dir of ['posts', 'mes', 'lab', 'modelos', 'painel']) rmSync(join(SAIDA, dir), { recursive: true, force: true });
  const nPerguntas = d.dominios.reduce((a, x) => a + x.perguntas.length, 0);
  grava('index.html', inicio({ ...d, lab: secaoLab('', nPerguntas), estante: existsSync(join(CONT, 'estante.json')) ? json('estante.json') : null }));
  // Laboratório
  grava('lab/index.html', labInicio({ cfg, nPerguntas }));
  grava('modelos/index.html', paginaModelos({ cfg, modelos: json('modelos.json') }));
  grava('painel/index.html', paginaPainel({ cfg }));
  const dl = cfg.downloads || {};
  grava('assets/js/cfg.js', `// Gerado por blog/_src/build.mjs a partir de site.config.json ("downloads"). A chave é a publicável do Supabase: pode ficar no site.\nwindow.CMW_CFG = ${JSON.stringify({ url: dl.supabase_url || '', chave: dl.supabase_chave || '', modelos: json('modelos.json').map(m => ({ id: m.id, nome: m.nome })) })};\n`);
  if (!dl.supabase_url) console.log('aviso: "downloads" sem Supabase em site.config.json (os downloads funcionam, mas não são registrados)');
  grava('lab/matriz-raci/index.html', labRaci({ cfg }));
  grava('lab/mapa-de-influencia/index.html', labInfluencia({ cfg }));
  grava('lab/matriz-de-adocao/index.html', labAdocao({ cfg }));
  if (d.dominios.length) {
    grava('lab/diagnostico/index.html', labDiagnostico({ cfg, dominios: d.dominios, relatorio: d.relatorio }));
    const link = sl => { const p = posts.find(x => x.slug === sl); if (!p) console.log('aviso: diagnostico-relatorio.json cita um post que não existe: ' + sl); return p ? { t: p.titulo, u: `../../posts/${p.slug}/` } : null; };
    const dados = { niveis: d.relatorio.niveis, dominios: d.dominios.map(x => { const r = d.relatorio.dominios[x.id], f = FERRAMENTAS.find(t => t.slug === r.ferramenta); return { id: x.id, nome: r.nome, curto: r.curto, estudar: r.estudar, ler: (r.ler || []).map(link).filter(Boolean), ferramenta: f ? { t: f.nome, u: `../${f.slug}/` } : null, perguntas: x.perguntas.map(q => ({ id: q.id, e: q.enunciado, a: q.alternativas, c: q.correta, x: q.explicacao, r: q.referencia, s: q.estudar })) }; }) };
    grava('assets/js/diagnostico-dados.js', `// Gerado por blog/_src/build.mjs a partir de _src/content/diagnostico. Não edite à mão.\nwindow.CMW_DIAG = ${JSON.stringify(dados)};\n`);
  }
  for (const p of posts) grava(`posts/${p.slug}/index.html`, post({ cfg, p, posts }));
  // dados para a busca do site, a lista de salvos e a leitura rápida (assets/js/ux.js)
  const curto = (s, n = 150) => s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
  const dados = {
    posts: posts.map(p => ({ s: p.slug, t: p.titulo, r: curto(p.resumo), tp: p.tipo, tm: p.tema, tn: TEMAS[p.tema].nome, f: String(p.fonte_nome || '').split(/[,(|]/)[0].trim(), g: p.regiao || '', m: p.min })),
    lab: FERRAMENTAS.map(f => ({ t: f.nome, d: curto(f.frase, 110), u: `lab/${f.slug}/` })),
    modelos: json('modelos.json').map(m => ({ t: m.nome, d: curto(m.frase, 110), u: `modelos/#${m.id}`, f: m.formato })),
    secoes: [['Radar mundial', '#radar'], ['IA & Mudança', '#ia'], ['Guias de campo', '#guias'], ['Laboratório', 'lab/'], ['Modelos para baixar', 'modelos/'], ['Vídeos', '#videos'], ['Eventos', '#eventos'], ['Posts do mês', '#mes'], ['Sugestões de leitura', '#estante'], ['Quem escreve', '#sobre']].map(([t, u]) => ({ t, u: u[0] === '#' ? 'index.html' + u : u })),
  };
  grava('assets/js/dados.js', `// Gerado por blog/_src/build.mjs. Não edite à mão.\nwindow.CMW_DADOS = ${JSON.stringify(dados)};\n`);
  const porMes = {};
  for (const p of posts) (porMes[p.data.slice(0, 7)] = porMes[p.data.slice(0, 7)] || []).push(p);
  for (const [chave, lista] of Object.entries(porMes)) grava(`mes/${chave}/index.html`, mes({ cfg, chave, lista }));
  grava('404.html', naoAchou({ cfg }));
  grava('assets/img/favicon.svg', marca().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/var\(--azul-p\)/g, '#0A2463').replace(/var\(--azul\)/g, '#2F6FED'));
  if (cfg.url) {
    const base = cfg.url.replace(/\/$/, '');
    const urls = ['', ...posts.map(p => `posts/${p.slug}/`), ...Object.keys(porMes).map(m => `mes/${m}/`), 'lab/', ...FERRAMENTAS.map(f => `lab/${f.slug}/`), 'modelos/'];
    grava('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${base}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
    grava('robots.txt', `User-agent: *\nAllow: /\nDisallow: /_src/\nDisallow: /painel/\nSitemap: ${base}/sitemap.xml\n`);
  }
  // referências a posts que não existem (início e "para ler junto")
  const existe = s => posts.some(p => p.slug === s);
  for (const s of [...(d.home.destaques || []), ...(d.home.praticas || []), ...(d.home.numeros || []).map(n => n.slug), ...((d.home.iceberg || {}).fundo || []).map(h => h.slug), cfg.edicao.capa]) if (!existe(s)) console.log('aviso: home.json ou site.config.json cita um post que não existe: ' + s);
  for (const p of posts) for (const s of p.relacionados || []) if (!existe(s)) console.log(`aviso: ${p.slug} cita em "relacionados" um post que não existe: ${s}`);
  const tipos = posts.reduce((a, p) => (a[p.tipo] = (a[p.tipo] || 0) + 1, a), {});
  console.log(`blog gerado: ${posts.length} posts (${Object.entries(tipos).map(([k, v]) => `${v} ${k}`).join(', ')}), ${d.eventos.length} eventos, ${d.videos.length} vídeos, laboratório com ${nPerguntas} perguntas`);
  if (!cfg.url) console.log('aviso: "url" vazio em site.config.json (sem sitemap e sem og:url absoluto)');
  if (!cfg.linkedin) console.log('aviso: "linkedin" vazio em site.config.json (botões de seguir ficam ocultos)');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) gera();
