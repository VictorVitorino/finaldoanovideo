// Exporta do filme "Além do raso" o que o player interativo do blog precisa: duração, capítulos, legendas,
// o instante da pausa "toque no gelo", o início do quadro final e a posição de cada ponto clicável (em % do quadro).
// Os tempos e as posições saem do próprio filme (src/raso/filme.js): se o filme mudar, rode de novo.
//
//   node producao/raso_interativo.mjs            -> ../blog/_src/content/video-tempos.json
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SAIDA = path.join(ROOT, '..', 'blog', '_src', 'content', 'video-tempos.json');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };

async function playwright() {
  try { return await import('playwright'); } catch {}
  return await import(pathToFileURL('/opt/node22/lib/node_modules/playwright/index.mjs').href);
}
const srv = await new Promise(res => {
  const s = http.createServer((q, r) => {
    const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(ROOT)) { r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] ?? 'application/octet-stream' }); r.end(d); });
  }).listen(0, () => res(s));
});
const pw = await playwright();
const browser = await pw.chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log('[erro na página]', e.message));
  await page.goto(`http://localhost:${srv.address().port}/raso.html?mode=render`, { waitUntil: 'networkidle' });
  await page.waitForFunction('window.READY === true || window.FAILED', null, { timeout: 60000 });
  const falha = await page.evaluate('window.FAILED');
  if (falha) throw new Error(falha);
  const dados = await page.evaluate('window.INTERATIVO');
  fs.writeFileSync(SAIDA, JSON.stringify(dados, null, 1) + '\n');
  console.log(`${path.relative(ROOT, SAIDA)}: ${dados.duracao} s · ${dados.capitulos.length} capítulos · ${dados.legendas.length} legendas · ${dados.pontos.length} pontos · pausa em ${dados.pausa.t} s · quadro final em ${dados.final} s`);
} finally {
  await browser.close();
  srv.close();
}
