// Grava um passeio pela página (rolagem suave) para mostrar as animações. Uso: node grava.mjs <url> <saida.webm> [largura] [altura] [segundos]
import { createRequire } from 'node:module';
import { mkdtempSync, readdirSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const [url, saida, w = '1440', h = '900', seg = '36'] = process.argv.slice(2);
const dir = mkdtempSync(join(tmpdir(), 'grava-'));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, recordVideo: { dir, size: { width: +w, height: +h } } });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(2600);
const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const passos = Math.round(+seg * 30);
for (let i = 1; i <= passos; i++) {
  const u = i / passos, e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), total * e);
  await p.waitForTimeout(33);
}
await p.waitForTimeout(1200);
await ctx.close(); await b.close();
renameSync(join(dir, readdirSync(dir)[0]), saida);
console.log(saida);
