// Transforma a apuração verificada (_src/pesquisa/*.json) em posts (_src/content/posts/*.md), eventos e vídeos.
// Uso: node blog/_src/importa.mjs [AAAA-MM-DD]   (a data é a da publicação no blog; padrão: hoje)
// Só mexe nos posts marcados com "origem: apuracao"; os escritos à mão ficam como estão.
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url)), PESQ = join(SRC, 'pesquisa'), POSTS = join(SRC, 'content', 'posts');
const DATA = process.argv[2] || new Date().toISOString().slice(0, 10);
const TEMA = { 'ia-adocao': 'ia', 'ia-pratica': 'ia', 'mundo-cm': 'mundo', transformacao: 'transformacao', 'carve-out': 'carve-out', 'due-diligence': 'due-diligence', 'governanca-ti': 'governanca-ti', 'brasil-latam': 'brasil' };
const ORDEM = ['ia-adocao', 'transformacao', 'governanca-ti', 'carve-out', 'ia-pratica', 'due-diligence', 'mundo-cm', 'brasil-latam'];
// endereço curto, sem cortar palavra no meio (até 60 caracteres)
const slug = s => { const t = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); return t.length <= 60 ? t : t.slice(0, 60).replace(/-[^-]*$/, ''); };
const linha = s => String(s ?? '').replace(/\s+/g, ' ').trim();
// primeira informação de um campo (corta observações entre parênteses e frases seguintes)
const curto = s => linha(s).split(/\s*[.;(]/)[0].trim();
// a data da fonte só entra quando começa por AAAA-MM ou AAAA-MM-DD; observações ficam de fora
const dataFonte = s => { const m = /^(\d{4}-\d{2}(?:-\d{2})?)/.exec(linha(s)); return m ? m[1] : ''; };

for (const f of readdirSync(POSTS)) if (f.endsWith('.md') && /\norigem: apuracao\n/.test(readFileSync(join(POSTS, f), 'utf8'))) unlinkSync(join(POSTS, f));
const usados = new Set(readdirSync(POSTS).map(f => f.replace(/\.md$/, '')));
let n = 0; const eventos = [], videos = JSON.parse(readFileSync(join(SRC, 'content', 'videos.json'), 'utf8')).filter(v => v.arquivo);
for (const arq of readdirSync(PESQ).filter(f => f.endsWith('.json'))) {
  const { tema, itens = [] } = JSON.parse(readFileSync(join(PESQ, arq), 'utf8'));
  itens.forEach((it, i) => {
    if (tema === 'eventos-videos') {
      const d0 = (it.dados || [])[0] || {};
      if (/v[ií]deo/i.test(it.olho)) videos.push({ titulo: linha(it.titulo), canal: linha(it.fonte_nome), data: dataFonte(it.data_publicacao), url: it.fonte_url, resumo: linha(it.resumo) });
      else eventos.push({ titulo: linha(it.titulo), inicio: dataFonte(it.data_publicacao), quando: curto(d0.valor), local: curto(d0.descricao), url: it.fonte_url, resumo: linha(it.resumo), regiao: linha(it.regiao) });
      return;
    }
    if (!TEMA[tema]) return;
    let s = slug(it.titulo); while (usados.has(s)) s += '-2'; usados.add(s);
    const dados = (it.dados || []).filter(d => d.valor && d.descricao).slice(0, 3).map(d => `  - ${linha(d.valor)} | ${linha(d.descricao).replace(/\|/g, '/')}${d.fonte_url ? ' | ' + d.fonte_url : ''}`);
    const md = `---\ntitulo: ${linha(it.titulo)}\nslug: ${s}\ndata: ${DATA}\ntipo: reportagem\ntema: ${TEMA[tema]}\nordem: ${100 + i * 10 + ORDEM.indexOf(tema)}\nolho: ${linha(it.olho)}\nresumo: ${linha(it.resumo)}\nregiao: ${linha(it.regiao)}\nfonte_nome: ${linha(it.fonte_nome)}\nfonte_url: ${it.fonte_url}\nfonte_data: ${dataFonte(it.data_publicacao)}\nfonte_tipo: ${linha(it.tipo_fonte)}\nverificacao: ${linha(it.verificacao)}\nchecagem: ${linha(it.checagem)}\npor_que_importa: ${linha(it.por_que_importa)}\norigem: apuracao\n${dados.length ? 'dados:\n' + dados.join('\n') + '\n' : ''}---\n${String(it.corpo).trim()}\n`;
    writeFileSync(join(POSTS, s + '.md'), md); n++;
  });
}
const manuais = join(SRC, 'content', 'eventos-manuais.json');
if (existsSync(manuais)) eventos.push(...JSON.parse(readFileSync(manuais, 'utf8')));
const hoje = DATA;
eventos.sort((a, b) => a.inicio.localeCompare(b.inicio));
writeFileSync(join(SRC, 'content', 'eventos.json'), JSON.stringify(eventos.filter(e => e.inicio >= hoje), null, 2) + '\n');
writeFileSync(join(SRC, 'content', 'videos.json'), JSON.stringify(videos, null, 2) + '\n');
console.log(`importado: ${n} reportagens, ${eventos.length} eventos, ${videos.filter(v => !v.arquivo).length} vídeos externos (data do blog: ${DATA})`);
