// Gera o blog estático a partir de _src/content. Uso: node blog/_src/build.mjs
// Saída (na pasta blog/): index.html, posts/<slug>/index.html, mes/<aaaa-mm>/index.html, 404.html, sitemap.xml.
// Para as imagens de compartilhamento do LinkedIn (assets/img/og/*.png), rode depois: node blog/_src/og.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { frontMatter, markdown, minutos } from './lib/md.mjs';
import { marca } from './lib/ilustra.mjs';
import { inicio, post, mes, naoAchou, TEMAS } from './lib/modelos.mjs';

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
  return { cfg, posts, eventos: json('eventos.json'), videos: json('videos.json'), perfil: json('perfil.json'), home: json('home.json') };
}

function gera() {
  const d = carrega(), { cfg, posts } = d;
  for (const dir of ['posts', 'mes']) rmSync(join(SAIDA, dir), { recursive: true, force: true });
  grava('index.html', inicio(d));
  for (const p of posts) grava(`posts/${p.slug}/index.html`, post({ cfg, p, posts }));
  const porMes = {};
  for (const p of posts) (porMes[p.data.slice(0, 7)] = porMes[p.data.slice(0, 7)] || []).push(p);
  for (const [chave, lista] of Object.entries(porMes)) grava(`mes/${chave}/index.html`, mes({ cfg, chave, lista }));
  grava('404.html', naoAchou({ cfg }));
  grava('assets/img/favicon.svg', marca().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/var\(--azul\)/g, '#2450E6').replace(/var\(--ceu\)/g, '#8EC5FF'));
  if (cfg.url) {
    const base = cfg.url.replace(/\/$/, '');
    const urls = ['', ...posts.map(p => `posts/${p.slug}/`), ...Object.keys(porMes).map(m => `mes/${m}/`)];
    grava('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${base}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
    grava('robots.txt', `User-agent: *\nAllow: /\nDisallow: /_src/\nSitemap: ${base}/sitemap.xml\n`);
  }
  const tipos = posts.reduce((a, p) => (a[p.tipo] = (a[p.tipo] || 0) + 1, a), {});
  console.log(`blog gerado: ${posts.length} posts (${Object.entries(tipos).map(([k, v]) => `${v} ${k}`).join(', ')}), ${d.eventos.length} eventos, ${d.videos.length} vídeos`);
  if (!cfg.url) console.log('aviso: "url" vazio em site.config.json (sem sitemap e sem og:url absoluto)');
  if (!cfg.linkedin) console.log('aviso: "linkedin" vazio em site.config.json (botões de seguir ficam ocultos)');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) gera();
