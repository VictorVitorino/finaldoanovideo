#!/usr/bin/env node
// Lê uma página pública e devolve título, datas encontradas e o texto, para apurar e checar reportagens na fonte.
// Uso: node ler.mjs <url> [--de N] [--max N] [--busca "termo"]
// Só funciona nos sites liberados na rede do ambiente. Não disfarça o acesso: se o site recusar robôs (403/429), o
// script avisa e sai; nesse caso procure a mesma informação em outra página oficial permitida.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2), url = args[0];
const opt = (n, d) => { const i = args.indexOf('--' + n); return i > 0 ? args[i + 1] : d; };
if (!url) { console.error('uso: node ler.mjs <url> [--de N] [--max N] [--busca "termo"]'); process.exit(2); }
const de = Number(opt('de', 0)), max = Number(opt('max', 12000)), busca = opt('busca', '');
const dir = mkdtempSync(join(tmpdir(), 'ler-')), arq = join(dir, 'pagina');
let info;
try {
  info = execFileSync('curl', ['-sS', '-L', '--max-time', '40', '--compressed', '-o', arq, '-w', '%{http_code}|%{content_type}|%{url_effective}', url], { encoding: 'utf8' });
} catch (e) { console.log(`FALHA DE REDE: ${String(e.stderr || e.message).trim().slice(0, 300)}\nO site pode não estar liberado neste ambiente. Não insista: procure outra página oficial permitida.`); process.exit(1); }
const [status, tipo, final] = info.split('|');
console.log(`URL: ${final}\nHTTP: ${status} · ${tipo}`);
if (!/^2/.test(status)) { console.log(`O site recusou a leitura (HTTP ${status}). Não tente contornar: procure a mesma informação em outra página oficial permitida.`); process.exit(1); }
let txt = '';
if (/pdf/i.test(tipo) || /\.pdf($|\?)/i.test(final)) {
  try { txt = execFileSync('pdftotext', ['-layout', arq, '-'], { encoding: 'utf8', maxBuffer: 64e6 }); console.log('TIPO: PDF'); }
  catch { console.log('PDF: não foi possível extrair o texto (pdftotext ausente ou arquivo protegido).'); process.exit(1); }
} else {
  const html = readFileSync(arq, 'utf8');
  const pega = re => { const m = re.exec(html); return m ? m[1].replace(/\s+/g, ' ').trim() : ''; };
  const tit = pega(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const datas = new Set();
  for (const re of [/property=["']article:published_time["'][^>]*content=["']([^"']+)/i, /content=["']([^"']+)["'][^>]*property=["']article:published_time/i, /"datePublished"\s*:\s*"([^"]+)"/i, /"dateModified"\s*:\s*"([^"]+)"/i, /name=["'](?:date|pubdate|publish-date|dcterms\.date)["'][^>]*content=["']([^"']+)/i, /<time[^>]*datetime=["']([^"']+)/i]) { const v = pega(re); if (v) datas.add(v); }
  console.log(`TÍTULO: ${tit}\nDATAS NA PÁGINA (metadados): ${[...datas].join(' · ') || 'nenhuma encontrada nos metadados; procure no texto'}`);
  if (/just a moment|attention required|access denied|enable javascript and cookies/i.test(tit + html.slice(0, 3000)) && html.length < 30000) { console.log('A página devolveu uma barreira contra robôs em vez do conteúdo. Não tente contornar: procure outra página oficial permitida.'); process.exit(1); }
  txt = html.replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article)\b[^>]*>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"').replace(/&ndash;|&mdash;/g, '-').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/[ \t\r]+/g, ' ').replace(/\n\s*\n+/g, '\n').replace(/^ +| +$/gm, '');
}
console.log(`TAMANHO DO TEXTO: ${txt.length} caracteres (arquivo de ${statSync(arq).size} bytes)`);
if (busca) {
  const t = txt.toLowerCase(), q = busca.toLowerCase(); let i = -1, n = 0;
  console.log(`\nTRECHOS COM "${busca}":`);
  while ((i = t.indexOf(q, i + 1)) >= 0 && n < 12) { console.log(`[${i}] …${txt.slice(Math.max(0, i - 220), i + 320).replace(/\n/g, ' ')}…\n`); n++; }
  if (!n) console.log('(nenhum trecho encontrado)');
} else {
  console.log(`\nTEXTO [${de}–${Math.min(txt.length, de + max)}]:\n${txt.slice(de, de + max)}`);
  if (de + max < txt.length) console.log(`\n… continua: rode de novo com --de ${de + max}`);
}
