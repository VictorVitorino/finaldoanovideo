// Gera as imagens de compartilhamento do LinkedIn (1200 x 627) em assets/img/og/: uma por post e uma do início.
// Uso: node blog/_src/og.mjs [slug ...]   (sem argumentos, gera todas). Precisa do Playwright (já instalado no ambiente).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { carrega } from './build.mjs';
import { cartaoOG } from './lib/modelos.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const SRC = dirname(fileURLToPath(import.meta.url)), BLOG = join(SRC, '..'), TMP = join(BLOG, '_og'), SAIDA = join(BLOG, 'assets', 'img', 'og');
const { cfg, posts } = carrega(), so = process.argv.slice(2);
mkdirSync(TMP, { recursive: true }); mkdirSync(SAIDA, { recursive: true });
const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1200, height: 627 }, deviceScaleFactor: 1 });
const itens = [{ slug: 'inicio', p: null }, ...posts.map(p => ({ slug: p.slug, p }))].filter(i => !so.length || so.includes(i.slug));
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
