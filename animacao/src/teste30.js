// Camada de textos e motion graphics do teste de 30 s: legendas em karaokê (o trecho falado
// acende), balões de logo que seguem os mascotes, plaquinhas de nome, título cinético,
// linha do tempo dos projetos, contadores e o painel de indicadores do cockpit.
// Tempos em build/teste30/timeline.json (producao/teste30.py tempo) e posições dos
// personagens em build/teste30/track.json (producao/teste30.py quadros).
import { tr, g, op, clamp, n2, measure, esc, ease, inv } from './core.js';
import * as MG from './mograph.js';

// Frases da legenda, montadas a partir dos trechos da narração (*destaque*).
const FRASES = [
  { ids: ['n1a', 'n1b'], txt: { n1a: 'De um lado, a *TOTVS*.', n1b: 'Do outro, a *A&M Performance*.' } },
  { ids: ['n2'], txt: { n2: 'Um time de especialistas, com mentalidade *fazedora* e *adaptável*.' } },
  { ids: ['n3a', 'n3b', 'n3c', 'n3d', 'n3e', 'n3f'], txt: { n3a: 'Tudo começou na *Unimed*.', n3b: 'Depois vieram *FUNED*,', n3c: '*CAOA*,', n3d: '*John Deere*, na Argentina,', n3e: '*Hughes*', n3f: 'e *Libercon*.' } },
  { ids: ['n4a', 'n4b', 'n4c'], txt: { n4a: 'Hoje são *seis projetos*,', n4b: 'em *dois países*,', n4c: 'e *R$ 7 milhões* só neste ano fiscal.' } },
  { ids: ['n5'], txt: { n5: 'Um projeto que *gera projetos*.' } },
];

const MASCOTES = {
  modulo: { nome: 'Módulo', empresa: 'TOTVS', logo: 'totvs' },
  cronos: { nome: 'Cronos', empresa: 'A&M', logo: 'alvarez-marsal' },
  cuidado: { nome: 'Dra. Cuidado', empresa: 'Unimed', logo: 'unimed' },
  frasco: { nome: 'Dr. Frasco', empresa: 'FUNED', logo: 'funed' },
  acelerado: { nome: 'Acelerado', empresa: 'CAOA', logo: 'caoa' },
  campo: { nome: 'Tio Campo', empresa: 'John Deere Argentina', logo: 'john-deere' },
  astro: { nome: 'Astro', empresa: 'Hughes', logo: 'hughes' },
  obrinha: { nome: 'Obrinha', empresa: 'Libercon', logo: 'libercon' },
};
const CLIENTES = ['cuidado', 'frasco', 'acelerado', 'campo', 'astro', 'obrinha'];

// Legenda em pílula escura (estilo de hud.caption) com o trecho falado aceso.
function legenda(frase, falas, t) {
  const fs = frase.ids.map(id => falas[id]).filter(Boolean);
  if (!fs.length) return '';
  const de = fs[0].de - 0.15, ate = fs[fs.length - 1].ate + 0.35;
  const a = clamp(Math.min((t - de) / 0.25, (ate - t) / 0.25));
  if (a <= 0) return '';
  const font = '700 36px "DM Sans"';
  // palavras com estado: dito, falando, a dizer
  const palavras = [];
  for (const id of frase.ids) {
    const f = falas[id];
    const estado = !f ? 0 : t < f.de - 0.05 ? 0 : t < f.ate ? 2 : 1;
    let hi = false;
    for (const w of frase.txt[id].split(' ')) {
      const ab = w.startsWith('*'), fe = w.replace(/[.,]$/, '').endsWith('*');
      const limpo = w.replace(/\*/g, '');
      palavras.push({ w: limpo, hi: hi || ab, estado });
      if (ab && !fe) hi = true;
      if (fe) hi = false;
    }
  }
  // quebra em linhas de até 1300 px
  const sp = measure(' ', font), linhas = [[]];
  let lw = 0;
  for (const p of palavras) {
    p.wd = measure(p.w, font);
    if (lw + p.wd > 1300 && linhas[linhas.length - 1].length) { linhas.push([]); lw = 0; }
    linhas[linhas.length - 1].push(p);
    lw += p.wd + sp;
  }
  const larg = linhas.map(l => l.reduce((s, p) => s + p.wd + sp, -sp));
  const w = Math.max(...larg) + 130, lh = 46, h = 34 + linhas.length * lh;
  const y1 = 1040, y0 = y1 - h;
  const dy = (1 - ease.out(clamp((t - de) / 0.3))) * 12;
  let s = `<rect x="${n2(960 - w / 2)}" y="${n2(y0)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(Math.min(30, h / 2))}" fill="#20212b" opacity=".9"/>`;
  const ix = 960 - w / 2 + 44, iy = y0 + h / 2;
  s += `<circle cx="${n2(ix)}" cy="${n2(iy)}" r="22" fill="#fff"/><rect x="${n2(ix - 6)}" y="${n2(iy - 13)}" width="12" height="19" rx="6" fill="#20212b"/><path d="M${n2(ix - 10)} ${n2(iy)} a10 10 0 0 0 20 0 M${n2(ix)} ${n2(iy + 10)} v5" stroke="#20212b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  linhas.forEach((l, k) => {
    let x = 960 + 26 - larg[k] / 2;
    const y = y0 + 17 + lh * (k + 0.72);
    for (const p of l) {
      const cor = p.hi ? (p.estado === 0 ? '#c9a868' : '#ffc04a') : '#ffffff';
      const o = p.estado === 0 ? 0.55 : 1;
      s += `<text x="${n2(x)}" y="${n2(y)}" font-family="DM Sans" font-weight="700" font-size="36" fill="${cor}" opacity="${o}">${esc(p.w)}</text>`;
      x += p.wd + sp;
    }
  });
  return op(a, g(tr(0, dy), s));
}

export async function buildTeste30() {
  const tl = await (await fetch('./build/teste30/timeline.json')).json();
  const tk = await (await fetch('./build/teste30/track.json')).json();
  const Q = tk.quadros, fps = tk.fps;
  const at = t => Q[Math.max(0, Math.min(Q.length - 1, Math.round(t * fps)))];
  const falas = Object.fromEntries(tl.falas.map(f => [f.id, f]));
  const sec = Object.fromEntries(tl.secoes.map(s => [s.id, s]));
  const mk = tl.marcas;
  // posição atrasada (o balão "segue" o personagem como se estivesse preso por um fio)
  const ator = (t, id, atraso = 0.08) => (at(Math.max(0, t - atraso)).atores ?? {})[id];

  return {
    duration: tl.dur,
    frame(t) {
      let s = MG.mographDefs ? MG.mographDefs() : '';
      const q = at(t);
      const S = q.secao;

      if (S === 'parceria') {
        const lt = t - sec.parceria.de;
        const an = q.ancoras?.titulo;
        if (an) s += MG.tituloCinetico('PROJETO DO ANO', an[0], an[1], lt - 0.35, { tamanho: 120 });
        if (an) s += MG.seloParceria(an[0], an[1] + 95, lt - 1.0, {});
        for (const [id, chega] of [['modulo', mk.modulo_chega + 0.9], ['cronos', mk.cronos_chega + 0.9]]) {
          const p = ator(t, id);
          if (!p || t < chega) continue;
          const M = MASCOTES[id];
          s += MG.balaoLogo(M.logo, p[0], p[1] - 18, t - chega, {});
          s += MG.placaNome(M.nome, M.empresa, p[2], p[3] + 46, t - chega - 0.15, {});
        }
        const a = ator(t, 'modulo', 0), b = ator(t, 'cronos', 0);
        if (a && b && t > mk.encontro - 0.1) s += MG.explosao((a[2] + b[2]) / 2, (a[1] + a[3]) / 2, t - mk.encontro, 3, {});
      }

      if (S === 'jornada') {
        const lt = t - sec.jornada.de;
        const ativos = mk.clientes.reduce((n, c) => n + clamp((t - c) / 0.35), 0);
        s += MG.linhaDoTempo(560, 92, 800, lt, ativos, {});
        const kp = mk.clientes.filter(c => t >= c).length;
        const paises = t >= mk.clientes[3] ? 2 : 1;
        s += MG.kpiTile(1490, 50, 190, 112, lt - 0.2, { rotulo: 'PROJETOS', valor: Math.max(1, kp), icone: 'projeto' });
        s += MG.kpiTile(1700, 50, 180, 112, lt - 0.3, { rotulo: 'PAÍSES', valor: paises, icone: 'globo' });
        CLIENTES.forEach((id, k) => {
          const p = ator(t, id);
          const c = mk.clientes[k] + 0.25;
          if (!p || t < c) return;
          const M = MASCOTES[id];
          s += MG.balaoLogo(M.logo, p[0], p[1] - 14, t - c, {});
          s += MG.placaNome(M.nome, M.empresa, p[2], p[3] + 40, t - c - 0.12, {});
        });
      }

      if (S === 'cockpit') {
        const lt = t - sec.cockpit.de;
        const r = q.painel;
        if (r) s += MG.painelDashboard(r[0], r[1], r[2], r[3], lt, { tempos: { projetos: mk.kpi_projetos - sec.cockpit.de, paises: mk.kpi_paises - sec.cockpit.de, valor: mk.kpi_valor - sec.cockpit.de } });
        if (r && t > mk.kpi_valor) s += MG.flare((r[0] + r[2]) / 2, (r[1] + r[3]) / 2 + 40, t - mk.kpi_valor, {});
      }

      if (S === 'fechamento') {
        const lt = t - sec.fechamento.de;
        s += MG.confete(lt - 0.1, 11, {});
        for (const id of Object.keys(MASCOTES)) {
          const p = ator(t, id);
          if (p) s += MG.balaoLogo(MASCOTES[id].logo, p[0], p[1] - 10, lt - 0.6 - 0.06 * Object.keys(MASCOTES).indexOf(id), { escala: 0.62 });
        }
        s += MG.tituloCinetico('PROJETO DO ANO', 960, 190, lt - 0.5, { tamanho: 104 });
        s += MG.seloParceria(960, 290, lt - 1.0, {});
      }

      for (const f of FRASES) s += legenda(f, falas, t);
      // transição gráfica só quando muda o cenário (terraço → jornada → cockpit → terraço)
      for (const id of ['jornada', 'cockpit', 'fechamento']) s += MG.transicao(t, sec[id].de, {});
      return op(1 - inv(tl.dur - 0.6, tl.dur - 0.05, t), s);
    },
  };
}
