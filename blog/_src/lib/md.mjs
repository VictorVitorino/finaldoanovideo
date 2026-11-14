// Utilitários de conteúdo: escape de HTML, front matter simples e um Markdown mínimo (títulos, listas, citações,
// negrito, itálico, links e código). Sem dependências.
export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---\nchave: valor\ndados:\n  - valor | descrição | url\n---\ncorpo
export function frontMatter(src) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src.replace(/\r\n/g, '\n'));
  if (!m) return { meta: {}, corpo: src };
  const meta = {};
  let lista = null;
  for (const linha of m[1].split('\n')) {
    if (!linha.trim()) continue;
    const item = /^\s+-\s+(.*)$/.exec(linha);
    if (item && lista) { meta[lista].push(item[1].trim()); continue; }
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(linha);
    if (!kv) continue;
    const [, k, v] = kv;
    if (v === '') { meta[k] = []; lista = k; } else { meta[k] = v.replace(/^"(.*)"$/, '$1'); lista = null; }
  }
  return { meta, corpo: m[2].trim() };
}

const inline = s => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

export function markdown(src) {
  const blocos = src.replace(/\r\n/g, '\n').split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return blocos.map(b => {
    if (/^### /.test(b)) return `<h3>${inline(b.slice(4))}</h3>`;
    if (/^## /.test(b)) return `<h2>${inline(b.slice(3))}</h2>`;
    const linhas = b.split('\n');
    if (linhas.every(l => /^- /.test(l))) return `<ul>${linhas.map(l => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
    if (linhas.every(l => /^\d+\. /.test(l))) return `<ol>${linhas.map(l => `<li>${inline(l.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`;
    if (linhas.every(l => /^> ?/.test(l))) return `<blockquote><p>${inline(linhas.map(l => l.replace(/^> ?/, '')).join(' '))}</p></blockquote>`;
    return `<p>${inline(linhas.join(' '))}</p>`;
  }).join('\n');
}

export const texto = src => src.replace(/[#>*`\[\]]/g, ' ').replace(/\(https?:[^)]+\)/g, ' ');
export const minutos = src => Math.max(1, Math.round(texto(src).split(/\s+/).filter(Boolean).length / 200));

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MES3 = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
// aceita AAAA-MM-DD ou AAAA-MM; devolve { dia, mes, ano, longa, curta, mes3 }
export function data(str) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(str || ''));
  if (!m) return { longa: String(str || ''), curta: String(str || ''), valida: false };
  const ano = +m[1], mes = +m[2], dia = m[3] ? +m[3] : null;
  return {
    valida: true, ano, mes, dia, mes3: MES3[mes - 1], mesNome: MESES[mes - 1],
    longa: dia ? `${dia} de ${MESES[mes - 1]} de ${ano}` : `${MESES[mes - 1]} de ${ano}`,
    curta: dia ? `${dia} ${MES3[mes - 1]} ${ano}` : `${MES3[mes - 1]} ${ano}`,
    iso: `${m[1]}-${m[2]}${m[3] ? '-' + m[3] : ''}`,
  };
}
export const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
