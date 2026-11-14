// Fotografa uma página do blog para conferência. Uso: node foto.mjs <arquivo.html|url> <saida.png> [largura] [altura] [--inteira] [--y N]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');   // Playwright já vem instalado no ambiente
import { resolve } from 'node:path';
const [alvo, saida, w = '1440', h = '900', ...resto] = process.argv.slice(2);
const inteira = resto.includes('--inteira'), yi = resto.indexOf('--y'), y = yi >= 0 ? Number(resto[yi + 1]) : 0;
const url = /^https?:|^file:/.test(alvo) ? alvo : 'file://' + resolve(alvo);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const erros = [];
p.on('pageerror', e => erros.push(String(e)));
p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
await p.goto(url, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
// rola a página inteira para disparar as entradas, depois volta
let alt = 0, yy = 0;
do { await p.evaluate(v => scrollTo(0, v), yy); await p.waitForTimeout(160); yy += +h * 0.6; alt = await p.evaluate(() => document.documentElement.scrollHeight); } while (yy < alt);
await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(300);
await p.evaluate(v => scrollTo(0, v), y);
await p.waitForTimeout(2600);
await p.screenshot({ path: saida, fullPage: inteira });
console.log(`${saida} · altura da página ${alt}px${erros.length ? ' · ERROS: ' + erros.join(' | ') : ''}`);
await b.close();
