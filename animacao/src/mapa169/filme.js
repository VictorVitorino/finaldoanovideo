// Vídeo "Mapa de Perfil Cognitivo · Mapa de Adoção" (LinkedIn, 16:9, 1920 x 1080, até 90 s).
// Monta as cenas de src/mapa/cenas/*.js e desenha por cima a interface comum: marca pessoal (Victor Vitorino · Change Management),
// etiqueta do capítulo, legenda karaokê (o vídeo toca mudo no feed) e o fio de progresso. Sem logos.
//
// Tempos: src/mapa/tempos.json (gerado por producao/mapa_audio.py a partir da narração do ElevenLabs).
// Render: node render.mjs frames --page mapa169.html --w 1920 --h 1080 --test filme --out build/mapa169/frames --workers 3
import { W, H, MG, Z, C, txt, larg, pilula, etiqueta, fin, back, clamp, inv, ease, n2, measure } from './base.js';
const f = n2;
export const IDS = ['gancho', 'porque', 'titulo', 'perfil', 'regua', 'mapa', 'acoes', 'vivo', 'pergunta', 'fecho'];
// cena provisória para quando só uma cena é carregada (teste uma-<id>)
const vazia = fundo => ({ FUNDO: fundo, LEGENDA: false, desenhar: () => `<rect width="${W}" height="${H}" fill="${fundo === 'navy' ? C.navy : C.white}"/>` });
const DIP = 0.22; // meia duração do mergulho de cor entre cenas

export function buildFilme(T, CENAS) {
  const P = T.palavras, CN = T.cenas, ORD = T.ordem, TOTAL = T.duracao;
  const DEST = new Set(T.destaque);
  const wa = i => P[i].a, wb = i => P[i].b;
  const m = nome => { if (!T.marcas[nome]) throw new Error('marca desconhecida: ' + nome); return T.marcas[nome].a; };
  const mb = nome => T.marcas[nome].b;
  const fim = id => { const i = ORD.indexOf(id); return i + 1 < ORD.length ? CN[ORD[i + 1]] : TOTAL; };
  const cenaEm = t => { let c = ORD[0]; for (const id of ORD) if (t >= CN[id]) c = id; return c; };
  const escuro = id => CENAS[id].FUNDO === 'navy';

  // ---------- interface (sem logo e sem logotipo: só as cores) ----------
  function topo(t, id) {
    const mod = CENAS[id], esc = escuro(id);
    // marca pessoal no topo esquerdo: pino laranja + nome + papel
    const nome = 'VICTOR VITORINO', wn = larg(nome, 26, { w: 700, ls: 2.8 });
    let s = `<g transform="translate(${MG} ${Z.topo}) scale(1.2)"><path d="M14,36 C9,27 0,21 0,12 A14,14 0 1 1 28,12 C28,21 19,27 14,36Z" fill="${C.orange}"/><circle cx="14" cy="13" r="5.500" fill="${esc ? C.navy : C.white}"/></g>`
      + txt(nome, MG + 50, Z.topo + 32, { w: 700, s: 26, ls: 2.8, c: esc ? C.white : C.navy })
      + `<rect x="${f(MG + 50 + wn + 12)}" y="${Z.topo + 10}" width="2" height="26" fill="${esc ? C.white : C.navy}" opacity=".4"/>`
      + txt('CHANGE MANAGEMENT', MG + 50 + wn + 28, Z.topo + 32, { w: 400, s: 26, ls: 2.8, c: esc ? C.navy20 : C.navy80 });
    if (mod.CHIP) {
      const e = etiqueta(mod.CHIP, 0, 0, { escuro: esc, s: 26 });
      const k = fin(t, CN[id] + 0.1, 0.45);
      s += `<g transform="translate(${f(W - MG - e.w + (1 - k) * 30)} ${Z.topo})" opacity="${f(k)}">${e.svg}</g>`;
    }
    return s;
  }
  function rodape(t, id) {
    const esc = escuro(id);
    // progresso do vídeo: fio laranja na base
    return `<rect x="0" y="${H - 10}" width="${W}" height="10" fill="${esc ? 'rgba(255,255,255,.12)' : C.gray40}"/>`
      + `<rect x="0" y="${H - 10}" width="${f(W * clamp(t / TOTAL))}" height="10" fill="${C.orange}"/>`;
  }
  function legenda(t, id) {
    let blk = null;
    for (const L of T.legendas) if (t >= wa(L.de) - 0.25) blk = L;
    if (!blk) return '';
    if (CENAS[cenaEm(wa(blk.de) + 0.01)].LEGENDA === false) return '';
    const idx = T.legendas.indexOf(blk), prox = T.legendas[idx + 1];
    const some = Math.min(prox ? wa(prox.de) - 0.25 : wb(blk.ate) + 1.2, wb(blk.ate) + 1.4);
    if (t > some) return '';
    const esc = escuro(id);
    const size = 42, font = `700 ${size}px "Roboto Condensed"`;
    const words = [];
    for (let i = blk.de; i <= blk.ate; i++) words.push({ i, w: P[i].w, ww: measure(P[i].w, font) });
    const sp = measure(' ', font);
    const total = words.reduce((a, w) => a + w.ww, 0) + sp * (words.length - 1);
    const pw = total + 76, ph = 80, x0 = W / 2 - pw / 2, y0 = Z.legenda;
    const k = back(t, wa(blk.de) - 0.25, 0.3), sai = 1 - fin(t, some - 0.2, 0.2);
    let s = pilula(x0, y0, pw, ph, esc ? '#0B3350' : C.navy, esc ? { stroke: 'rgba(255,255,255,.3)' } : {});
    let x = x0 + 38;
    for (const wd of words) {
      const dita = t >= P[wd.i].a - 0.04;
      const col = dita ? (DEST.has(wd.i) ? C.orange80 : C.white) : (esc ? 'rgba(255,255,255,.42)' : '#7F93A6');
      s += txt(wd.w, x, y0 + 55, { w: 700, s: size, c: col });
      x += wd.ww + sp;
    }
    const o = clamp(k * 1.5) * sai;
    return `<g transform="translate(${W / 2} ${f(y0 + ph / 2)}) scale(${f(Math.max(0.001, 0.9 + 0.1 * k))}) translate(${-W / 2} ${f(-(y0 + ph / 2))})" opacity="${f(o)}">${s}</g>`;
  }
  // mergulho de cor entre cenas: o quadro vai para a cor de fundo da cena que entra e volta
  function mergulho(t) {
    for (const id of ORD.slice(1)) {
      const tc = CN[id], d = Math.abs(t - tc);
      if (d >= DIP) continue;
      return { o: ease.inOut(1 - d / DIP), cor: escuro(t < tc ? id : id) ? C.navy : C.white };
    }
    return null;
  }

  function frame(t) {
    const id = cenaEm(t), mod = CENAS[id];
    const ctx = { T, P, id, t0: CN[id], t1: fim(id), TOTAL, wa, wb, m, mb };
    let s = mod.desenhar(t, ctx);
    const mg = mergulho(t);
    if (mg) s += `<rect width="${W}" height="${H}" fill="${mg.cor}" opacity="${f(mg.o)}"/>`;
    const oc = mg ? 1 - mg.o : 1;
    let ui = '';
    if (mod.INTERFACE !== false) ui += topo(t, id) + (mod.RODAPE !== false ? rodape(t, id) : '');
    if (mod.LEGENDA !== false) ui += legenda(t, id);
    if (ui) s += oc >= 0.999 ? ui : `<g opacity="${f(oc)}">${ui}</g>`;
    // sem fade de abertura: o quadro t = 0 é a miniatura do post no feed e já mostra o título
    return s;
  }
  return { duration: TOTAL, frame, audio: './build/mapa/trilha.wav' };
}

// so = id de uma única cena a carregar (as outras ficam vazias); sem `so`, carrega todas
export async function criar(so) {
  const r = await fetch('./src/mapa/tempos.json');
  if (!r.ok) throw new Error('rode antes: python3 producao/mapa_audio.py');
  const CENAS = {};
  for (const id of IDS) CENAS[id] = !so || so === id ? await import(`./cenas/${id}.js`) : vazia('claro');
  return buildFilme(await r.json(), CENAS);
}
