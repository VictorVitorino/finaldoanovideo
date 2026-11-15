// Gera as imagens de compartilhamento do LinkedIn (1200 x 627) em assets/img/og/: uma por post e uma do início.
// Uso: node blog/_src/og.mjs [slug ...]   (sem argumentos, gera todas). Precisa do Playwright (já instalado no ambiente).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { carrega } from './build.mjs';
import { cartaoOG } from './lib/modelos.mjs';
import { PREVIAS } from './lib/lab.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const SRC = dirname(fileURLToPath(import.meta.url)), BLOG = join(SRC, '..'), TMP = join(BLOG, '_og'), SAIDA = join(BLOG, 'assets', 'img', 'og');
const { cfg, posts } = carrega(), so = process.argv.slice(2);
mkdirSync(TMP, { recursive: true }); mkdirSync(SAIDA, { recursive: true });
const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1200, height: 627 }, deviceScaleFactor: 1 });
const LAB = [['lab', 'Laboratório: teste, monte e baixe', 'diagnostico'], ['lab-diagnostico', 'Em que nível de Change Management você está?', 'diagnostico'], ['lab-raci', 'Matriz RACI da mudança', 'raci'], ['lab-influencia', 'Mapa de influência de stakeholders', 'influencia'], ['lab-adocao', 'Matriz de adoção', 'adocao']];
// apresentações em HTML: uma imagem para a página que lista e uma para cada apresentação
const DECKS = readdirSync(join(SRC, 'content', 'apresentacoes')).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(join(SRC, 'content', 'apresentacoes', f), 'utf8')));
const ARTE_DECK = { 'gestao-da-mudanca': 'diagnostico', 'plano-de-comunicacao': 'influencia', 'cultura-e-engajamento': 'adocao', 'impactos-da-mudanca': 'raci', 'kickoff-e-treinamento': 'diagnostico' };
const PAGINAS = [['servicos', 'Change Management Advisory e IA aplicada, com apoio de perto', 'influencia', 'Serviços'], ['sobre', `Sobre ${cfg.autor}`, 'adocao', 'Quem escreve'],
  ['apresentacoes', 'Apresentações em HTML para abrir, adaptar e apresentar no navegador', 'adocao', 'Apresentações em HTML'], ...DECKS.map(d => [`apresentacao-${d.id}`, d.nome, ARTE_DECK[d.id] || 'diagnostico', 'Apresentação em HTML'])];
const itens = [{ slug: 'inicio', p: null }, ...posts.map(p => ({ slug: p.slug, p })), ...LAB.map(([slug, titulo, arte]) => ({ slug, p: { titulo, tipo: 'lab', tema: 'mundo', slug, arte: PREVIAS[arte]('a') } })), ...PAGINAS.map(([slug, titulo, arte, rotulo]) => ({ slug, p: { titulo, tipo: 'pagina', rotulo, tema: 'mundo', slug, arte: PREVIAS[arte]('a') } }))].filter(i => !so.length || so.includes(i.slug));
for (const { slug, p } of itens) {
  const html = join(TMP, slug + '.html');
  writeFileSync(html, cartaoOG({ cfg, p }));
  await pg.goto('file://' + html, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: join(SAIDA, slug + '.jpg'), type: 'jpeg', quality: 88 });
}
await b.close();
rmSync(TMP, { recursive: true, force: true });
console.log(`imagens de compartilhamento: ${itens.length} em assets/img/og/`);
