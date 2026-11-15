// Gera a capa do blog para o LinkedIn a partir do cenário do filme "Além do raso" (capa-blog.html).
//
//   node producao/capa_blog.mjs [endereço]
//
// Saída em ../blog/assets/img/linkedin/:
//   capa-blog-linkedin-paisagem.png   2400 x 1254 (1200 x 627 em dobro): para subir em um post com link
//   capa-blog-linkedin-retrato.png    2160 x 2700 (1080 x 1350 em dobro): para um post de imagem
//   capa-blog-1200x627.jpg            imagem de compartilhamento da página inicial (og:image)
// O endereço que aparece na capa vem do argumento ou de blog/_src/site.config.json (url), sem o https://.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BLOG = path.join(ROOT, '..', 'blog');
const SAIDA = path.join(BLOG, 'assets', 'img', 'linkedin');
const cfg = JSON.parse(fs.readFileSync(path.join(BLOG, '_src', 'site.config.json'), 'utf8'));
const endereco = (process.argv[2] || cfg.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
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
fs.mkdirSync(SAIDA, { recursive: true });
const pw = await playwright();
const browser = await (pw.chromium || pw.default.chromium).launch();
try {
  const foto = async (formato, escala, arquivo, opc = {}) => {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1500 }, deviceScaleFactor: escala });
    page.on('pageerror', e => console.log('[erro na página]', e.message));
    await page.goto(`http://localhost:${srv.address().port}/capa-blog.html?formato=${formato}&url=${encodeURIComponent(endereco)}`, { waitUntil: 'networkidle' });
    await page.waitForFunction('window.READY === true || window.FAILED', null, { timeout: 60000 });
    const falha = await page.evaluate('window.FAILED');
    if (falha) throw new Error(falha);
    const [w, h] = await page.evaluate('window.TAMANHO');
    await page.screenshot({ path: path.join(SAIDA, arquivo), clip: { x: 0, y: 0, width: w, height: h }, ...opc });
    await page.close();
    console.log(`${arquivo}: ${w * escala} x ${h * escala} px`);
  };
  await foto('paisagem', 2, 'capa-blog-linkedin-paisagem.png');
  await foto('retrato', 2, 'capa-blog-linkedin-retrato.png');
  await foto('paisagem', 1, 'capa-blog-1200x627.jpg', { type: 'jpeg', quality: 90 });
  console.log(`endereço na capa: ${endereco}`);
} finally {
  await browser.close();
  srv.close();
}
