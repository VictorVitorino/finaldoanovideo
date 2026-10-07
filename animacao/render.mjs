// Renderiza a animação quadro a quadro (Chromium headless) e monta o MP4.
//
//   node render.mjs cues                               -> build/cues.json (deixas da trilha e legendas)
//   node render.mjs stills --t 1.5,12 [--test lineup]  -> build/stills/*.jpg
//   node render.mjs frames [--workers 3] [--from N] [--to N]
//   node render.mjs encode [--audio build/trilha.wav] [--out build/projeto-do-ano.mp4]
//
// Requer playwright (Chromium) e ffmpeg.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(ROOT, 'build');
const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
fs.mkdirSync(BUILD, { recursive: true });

async function loadPlaywright() {
  try { return await import('playwright'); } catch {}
  return await import(pathToFileURL('/opt/node22/lib/node_modules/playwright/index.mjs').href);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.wav': 'audio/wav' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((q, s) => {
      const p = decodeURIComponent(q.url.split('?')[0]);
      const f = path.join(ROOT, p === '/' ? 'index.html' : p);
      if (!f.startsWith(ROOT)) { s.writeHead(403); s.end(); return; }
      fs.readFile(f, (e, d) => {
        if (e) { s.writeHead(404); s.end(); return; }
        s.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
        s.end(d);
      });
    }).listen(0, () => res(srv));
  });
}

async function openPage(pw, url) {
  // Decodificação de imagem síncrona: sem isso os logos podem sair em branco em alguns quadros.
  const browser = await pw.chromium.launch({ args: ['--disable-checker-imaging', '--run-all-compositor-stages-before-draw', '--disable-gpu-rasterization'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[página]', m.text()); });
  page.on('pageerror', e => console.log('[erro na página]', e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction('window.READY === true || window.FAILED', null, { timeout: 120000 });
  const failed = await page.evaluate('window.FAILED');
  if (failed) throw new Error('falha ao iniciar a página: ' + failed);
  const cdp = await page.context().newCDPSession(page);
  if (/layer=(overlay|etiquetas)/.test(url)) await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  return { browser, page, cdp };
}

async function shot({ page, cdp }, t, quality = 92, png = false) {
  await page.evaluate(t => new Promise(r => { window.renderAt(t); requestAnimationFrame(() => requestAnimationFrame(r)); }), t);
  const r = await cdp.send('Page.captureScreenshot', png ? { format: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } } : { format: 'jpeg', quality, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
  return Buffer.from(r.data, 'base64');
}

async function cues() {
  const r = await import(pathToFileURL(path.join(ROOT, 'src/roteiro.js')).href);
  const { planos, total } = r.linhaDoTempo();
  const sfx = [];
  for (const p of planos) for (const s of p.sfx ?? []) sfx.push({ t: +(p.t0 + s.at).toFixed(3), s: s.s, plano: p.id });
  const musica = r.MUSICA.map(m => ({ estilo: m.estilo, de: r.tempoDe(planos, m.de[0], m.de[1]), ate: r.tempoDe(planos, m.ate[0], m.ate[1]) }));
  const subs = [];
  for (const p of planos) for (const s of p.subs ?? []) subs.push({ de: +(p.t0 + s.at).toFixed(2), ate: +(p.t0 + s.end).toFixed(2), quem: s.who === 'N' ? 'Narrador' : s.who, texto: s.text.replace(/\*/g, '') });
  const planosOut = planos.map(p => ({ id: p.id, cena: p.cena, de: +p.t0.toFixed(3), ate: +p.t1.toFixed(3) }));
  fs.writeFileSync(path.join(BUILD, 'cues.json'), JSON.stringify({ total, fps: r.FPS, sfx, musica, subs, planos: planosOut }, null, 1));
  console.log(`cues.json: ${total.toFixed(2)} s, ${sfx.length} efeitos, ${subs.length} falas`);
}

async function main() {
  if (cmd === 'cues') return cues();
  if (cmd === 'encode') {
    const fps = +opt('fps', 30);
    const dir = opt('frames', path.join(BUILD, 'frames'));
    const audio = opt('audio', path.join(BUILD, 'trilha.wav'));
    const out = opt('out', path.join(BUILD, 'projeto-do-ano.mp4'));
    const a = ['-y', '-framerate', String(fps), '-i', path.join(dir, 'f%05d.jpg')];
    if (fs.existsSync(audio)) a.push('-i', audio);
    a.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
    if (fs.existsSync(audio)) a.push('-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest');
    a.push(out);
    const r = spawnSync('ffmpeg', a, { stdio: 'inherit' });
    process.exit(r.status ?? 1);
  }

  const srv = await serve();
  const port = srv.address().port;
  const pw = await loadPlaywright();
  const test = opt('test', '');
  const layer = opt('layer', 'full');
  const transparent = layer === 'overlay' || layer === 'etiquetas';
  const url = `http://localhost:${port}/index.html?mode=render&layer=${layer}${test ? '&test=' + test : ''}`;
  try {
    if (cmd === 'stills') {
      const times = opt('t', '0').split(',').map(Number);
      const out = opt('out', path.join(BUILD, 'stills'));
      fs.mkdirSync(out, { recursive: true });
      const P = await openPage(pw, url);
      for (const t of times) {
        const f = path.join(out, `${test || (layer === 'full' ? 'quadro' : layer)}_${t.toFixed(2).replace('.', '_')}.${transparent ? 'png' : 'jpg'}`);
        fs.writeFileSync(f, await shot(P, t, 88, transparent));
        console.log(f);
      }
      await P.browser.close();
    } else if (cmd === 'frames') {
      const r = await import(pathToFileURL(path.join(ROOT, 'src/roteiro.js')).href);
      const fps = r.FPS;
      const nWorkers = +opt('workers', 3);
      const dir = opt('out', path.join(BUILD, layer === 'full' ? 'frames' : `frames_${layer}`));
      const ext = transparent ? 'png' : 'jpg';
      fs.mkdirSync(dir, { recursive: true });
      let total = r.linhaDoTempo().total;
      if (test) { const P = await openPage(pw, url); total = await P.page.evaluate('window.DURATION'); await P.browser.close(); }
      const nFrames = Math.ceil(total * fps);
      const from = +opt('from', 0), to = Math.min(nFrames, +opt('to', nFrames));
      const todo = [];
      for (let i = from; i < to; i++) if (!fs.existsSync(path.join(dir, `f${String(i).padStart(5, '0')}.${ext}`))) todo.push(i);
      console.log(`${nFrames} quadros (${total.toFixed(1)} s a ${fps} fps); faltam ${todo.length}; ${nWorkers} processos`);
      let done = 0;
      const t0 = Date.now();
      await Promise.all(Array.from({ length: nWorkers }, async (_, k) => {
        const P = await openPage(pw, url);
        for (let j = k; j < todo.length; j += nWorkers) {
          const i = todo[j];
          fs.writeFileSync(path.join(dir, `f${String(i).padStart(5, '0')}.${ext}`), await shot(P, i / fps, 93, transparent));
          done++;
          if (done % 150 === 0 || done === todo.length) {
            const el = (Date.now() - t0) / 1000;
            console.log(`${done}/${todo.length} quadros · ${(el / done).toFixed(3)} s/quadro · faltam ~${(((todo.length - done) * el) / done / 60).toFixed(1)} min`);
          }
        }
        await P.browser.close();
      }));
    } else console.log('comando desconhecido:', cmd);
  } finally {
    srv.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
