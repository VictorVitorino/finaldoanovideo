// O filme "Projeto do Ano — Parceria A&M + TOTVS" no modelo do explainer SpecForge.
// Duas camadas SVG com a mesma câmera (os personagens vêm do Python, entre elas):
//   fundo   papel, blobs, chão e props
//   overlay balões de logo, nomes, cartões, adesivos, legendas, chrome e transições
// Roteiro: docs/roteiro-fy26.md (7 cenas) + três gags: o go-live que foge, a Operação NF à la
// missão impossível e o Antonialli que ajeita o cabelo toda vez que aparece um problema.
// Tempos: build/filme/timeline.json (producao/filme.py tempo).
// Personagens e câmera por quadro: build/filme/track.json (producao/filme.py rastro).
import { tr, g, op, clamp, ease, inv, n2, rng, text, measure } from '../core.js';
import { logo } from '../assets.js';
import * as A from './ambiente.js';
import * as G from './graficos.js';
import * as P from './props.js';
import * as GG from './gags.js';
import * as TL from './telas.js';

const CAPITULO = {
  1: ['00', 'ABERTURA', 'Portfólio TOTVS'], 2: ['00', 'PRÓLOGO', 'O desafio'], 3: ['01', 'PARTE 1', 'A parceria e a liderança'],
  4: ['02', 'PARTE 2', 'Seis projetos, seis resultados'], 5: ['03', 'PARTE 3', 'Framework integrado e ferramentas'],
  6: ['04', 'PARTE 4', 'Resultado no P&L e a NF'], 7: ['05', 'FECHAMENTO', 'Um time'],
};
const COR_FALA = { Giovanna: '#d94b4b', 'Nathalia Paladini': '#3aa6a0', Antonialli: '#1f2d4d', Bruno: '#2f7fd0', 'Giovanna e Bruno': '#d94b4b' };
const MASC = {
  modulo: ['Módulo', 'TOTVS', 'totvs'], cronos: ['Cronos', 'A&M', 'alvarez-marsal'], cuidado: ['Dra. Cuidado', 'Unimed', 'unimed'],
  frasco: ['Dr. Frasco', 'FUNED', 'funed'], acelerado: ['Acelerado', 'CAOA', 'caoa'], campo: ['Tio Campo', 'John Deere', 'john-deere'],
  conectado: ['Conectado', 'Hughes', 'hughes'], obrinha: ['Obrinha', 'Libercon', 'libercon'],
};
const LUGAR = { hospital: P.hospital, laboratorio: P.laboratorio, fabrica: P.fabrica, fazenda: P.fazenda, estacao: P.estacao, obra: P.obra };
const iniciais = nome => nome.split(' ').filter(w => w.length > 2 || w === nome).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const cam = c => `translate(960 540) scale(${n2(c[2])}) translate(${n2(-c[0])} ${n2(-c[1])})`;

// Destaques das legendas (o texto é o do roteiro; *...* acende em âmbar)
const DESTAQUE = {
  c2_n1: ['projeto de ERP'], c2_n2: ['quem você chama'], c2_n3: ['um projeto'], c3_n1: ['TOTVS'], c3_n2: ['A&M Performance'],
  c3_n3: ['fazedora', 'adaptável'], c3_n5: ['entende do jogo'], c3_n6: ['Unimed Brasil'], c4_n1: ['primeiro projeto'], c4_n2: ['FUNED'],
  c4_n3: ['CAOA'], c4_n4: ['John Deere'], c4_n5: ['Hughes'], c4_n6: ['Libercon'], c5_n1: ['método'], c5_n2: ['padrão'],
  c5_n3: ['previsibilidade'], c5_n4: ['framework integrado', 'Um time só'], c5_n5: ['cockpit executivo'], c5_n6: ['IA', 'dono e prazo'],
  c5_n7: ['qualidade das MITs'], c6_n2: ['de todo mundo'], c6_n3: ['longo prazo', 'abre portas'], c6_a3: ['Collection Zero Defect'],
  c7_n1: ['gera projetos'], c7_n2: ['pipeline está aquecido'],
};
// a pontuação colada ao destaque entra no destaque (a legenda separa por palavras)
const marcar = (f) => (DESTAQUE[f.id] ?? []).reduce((s, w) => s.replace(w, `*${w}*`), f.texto).replace(/\*([.,:;!?…]+)/g, '$1*');
const curto = nome => { const w = nome.split(' ').filter(x => x.length > 2); return w.length > 1 ? `${w[0]} ${w[w.length - 1]}` : nome; };

// Slide "Metodologia": as duas esteiras (A&M e TOTVS) ligadas fase a fase (placeholder do slide 8)
function slideMetodologia(x, y, w, h, idade) {
  if (idade < 0) return '';
  const k = ease.back(clamp(idade / 0.45));
  const X = -w / 2, Y = -h / 2;
  let s = `<rect x="${n2(X + 12)}" y="${n2(Y + 16)}" width="${w}" height="${h}" rx="22" fill="rgba(60,35,15,.18)"/><rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="22" fill="#fcf8ee" stroke="#2b2b36" stroke-width="3"/>`;
  s += `<rect x="${X + 40}" y="${Y + 40}" width="10" height="44" rx="5" fill="#0b5ed7"/>` + text('Metodologia integrada', X + 66, Y + 76, { size: 40, weight: 900, anchor: 'start', fill: '#2b2b36' });
  const fases = ['Planejamento', 'Desenho', 'Configuração', 'Testes', 'Cutover', 'Operação'];
  const fw = (w - 120) / 6;
  [['A&M', '#0c2f57', Y + 160], ['TOTVS', '#1f6fd6', Y + 330]].forEach(([nome, cor, yy], r) => {
    s += text(nome, X + 60, yy + 12, { size: 26, weight: 900, fill: cor, anchor: 'start' });
    fases.forEach((f, i) => {
      const kk = clamp((idade - 0.3 - i * 0.12 - r * 0.06) / 0.3);
      const bx = X + 60 + i * fw + 10;
      s += op(kk, `<path d="M${n2(bx)} ${yy + 30} h${n2(fw - 34)} l18 24 l-18 24 h${n2(-(fw - 34))} l18 -24 Z" fill="${cor}" stroke="#2b2b36" stroke-width="2.5" opacity=".92"/>` + text(f, bx + (fw - 34) / 2 + 4, yy + 61, { size: 17, weight: 800, fill: '#fff' }));
      if (r === 1) {
        const kc = clamp((idade - 1.2 - i * 0.12) / 0.3);
        s += op(kc, `<path d="M${n2(bx + (fw - 34) / 2 + 4)} ${Y + 238} v${n2(yy - Y - 238 - 8)}" stroke="#f2b84b" stroke-width="6" stroke-dasharray="10 8" stroke-linecap="round"/><circle cx="${n2(bx + (fw - 34) / 2 + 4)}" cy="${n2((Y + 238 + yy) / 2 - 4)}" r="14" fill="#f2b84b" stroke="#2b2b36" stroke-width="2.5"/>`);
      }
    });
  });
  s += text('fase a fase, um só propósito', X + 66, Y + h - 42, { size: 22, weight: 700, fill: '#6b6f7e', anchor: 'start', family: 'DM Sans' });
  return g(tr(x, y, Math.max(0.001, 0.9 + 0.1 * k)), op(clamp(k * 2), s));
}

export async function criarFilme({ layer = 'full' } = {}) {
  const tl = await (await fetch('./build/filme/timeline.json')).json();
  let tk = { quadros: [] };
  try { tk = await (await fetch('./build/filme/track.json')).json(); } catch (e) { /* sem rastro: só fundo */ }
  const Q = tk.quadros, fps = tl.fps;
  const quadro = t => Q[Math.max(0, Math.min(Q.length - 1, Math.round(t * fps)))] ?? { cam: [960, 540, 1], atores: [] };
  const plano = t => tl.planos.find(p => t >= p.de && t < p.ate) ?? tl.planos[tl.planos.length - 1];
  const ini = {};
  for (const p of tl.planos) if (ini[p.cena] == null) ini[p.cena] = p.de;
  const ator = (q, papel) => q.atores.find(a => a.papel === papel);
  const atrasado = (t, papel, d = 0.08) => ator(quadro(Math.max(0, t - d)), papel);
  const fundoOn = layer !== 'overlay', overOn = layer !== 'fundo';
  const DEFS = `<defs>${A.defs()}${G.defs()}${P.defs()}${GG.defs()}${TL.defs()}<filter id="fiBorra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter><radialGradient id="fiBarba"><stop offset=".55" stop-color="#3b2a21"/><stop offset="1" stop-color="#3b2a21" stop-opacity="0"/></radialGradient><linearGradient id="fiTriste" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f5fd8" stop-opacity=".75"/><stop offset="1" stop-color="#3f5fd8" stop-opacity="0"/></linearGradient><radialGradient id="fiFoco" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="#fff2c6" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c6" stop-opacity="0"/></radialGradient></defs>`;
  const MARCOS = await (await fetch('./producao/marcos_filme.json')).json();
  // ponto do recorte (px da folha recortada) → tela, com a mesma cabeça/escala/rotação do motor Python
  const pontoTela = (a, px, py) => {
    const m = MARCOS[a.spr];
    if (!m) return [a.x, a.y];
    let qx = px, qy = py;
    if (m.pescoco && py < m.pescoco[1] && a.st.cabeca) {
      const an = a.st.cabeca * Math.PI / 180, nx = m.pescoco[0], ny = m.pescoco[1];
      qx = nx + (px - nx) * Math.cos(an) - (py - ny) * Math.sin(an);
      qy = ny + (px - nx) * Math.sin(an) + (py - ny) * Math.cos(an);
    }
    const r = (a.st.rot ?? 0) * Math.PI / 180, vx = (qx - m.centro_x) * (a.st.sx ?? 1) * a.k, vy = (qy - m.pes_y) * (a.st.sy ?? 1) * a.k;
    return [a.x + Math.cos(r) * vx - Math.sin(r) * vy, a.y + Math.sin(r) * vx + Math.cos(r) * vy];
  };
  // testa do personagem (para a gota de suor): um pouco acima dos olhos, no recorte
  const testa = a => {
    const m = MARCOS[a.spr];
    if (!m || !m.olhos) return [a.topo[0], a.topo[1] + a.alt * 0.18];
    const [e1, e2] = m.olhos;
    return pontoTela(a, (e1[0] + e2[0]) / 2 + (e2[0] - e1[0]) * 0.9, Math.min(e1[1], e2[1]) - e1[3] * 2.2);
  };
  // legenda numa linha só: falas longas viram partes em sequência, cada uma no seu tempo
  const FONTE_LEG = '700 30px "DM Sans"', MAX_LEG = 1500;
  const partes = (txt, de, ate) => {
    const limpo = x => x.replace(/\*/g, '');
    if (measure(limpo(txt), FONTE_LEG) <= MAX_LEG) return [{ txt, de, ate }];
    const pal = txt.split(' ');
    const n = Math.ceil(measure(limpo(txt), FONTE_LEG) / MAX_LEG);
    const total = limpo(txt).length, out = [];
    let cur = [], acc = 0, dentro = false, t0 = de;
    pal.forEach((w, i) => {
      cur.push(w);
      acc += limpo(w).length + 1;
      if (w.startsWith('*')) dentro = true;
      if (w.replace(/[.,:;!?…]+$/, '').endsWith('*')) dentro = false;
      const alvo = (out.length + 1) * total / n;
      const pausa = /[.,:;!?…]\*?$/.test(w);
      if (!dentro && i < pal.length - 1 && out.length < n - 1 && (acc >= alvo || (pausa && acc >= alvo * 0.7))) {
        const t1 = de + (ate - de) * acc / total;
        out.push({ txt: cur.join(' '), de: t0, ate: t1 });
        cur = []; t0 = t1;
      }
    });
    out.push({ txt: cur.join(' '), de: t0, ate });
    return out;
  };
  // moedas caindo (os donos do dinheiro)
  const moedas = (x0, x1, idade, seed) => {
    if (idade < 0 || idade > 3.2) return '';
    const r = rng(seed);
    let s = '';
    for (let k = 0; k < 26; k++) {
      const x = x0 + r() * (x1 - x0), v = 520 + r() * 380, t0 = r() * 0.9, sp = r() * 6;
      const y = -60 + (idade - t0) * v + 300 * (idade - t0) ** 2;
      if (idade < t0 || y > 1120) continue;
      const w = Math.abs(Math.cos(idade * 6 + sp)) * 24 + 4;
      s += `<g transform="translate(${n2(x)} ${n2(y)})"><ellipse rx="${n2(w)}" ry="26" fill="#f2b84b" stroke="#a8761a" stroke-width="3"/>${w > 14 ? text('$', 0, 10, { size: 30, weight: 900, fill: '#a8761a' }) : ''}</g>`;
    }
    return s;
  };
  // foco de luz (spot) no palco escuro
  const foco = (x, y, w, k = 1) => op(k, `<path d="M${n2(x - 60)} -20 L${n2(x + 60)} -20 L${n2(x + w / 2)} ${n2(y)} L${n2(x - w / 2)} ${n2(y)}Z" fill="url(#fiFoco)"/><ellipse cx="${n2(x)}" cy="${n2(y)}" rx="${n2(w / 2)}" ry="${n2(w * 0.08)}" fill="#fff2c6" opacity=".18"/>`);
  // a NF gigante correndo pelos obstáculos (posição e altura por tempo, usadas pelo fundo e pelo carimbo)
  const NF_OBST = [[560, 'barreira', 'CONFERÊNCIA'], [900, 'muro', 'APROVAÇÃO'], [1240, 'abismo', 'FIM DO ANO FISCAL']];
  const nfPos = (t, mk) => {
    const u = clamp((t - mk.parte) / (mk.chega - mk.parte));
    const x = -200 + (1600 + 200) * u;
    let dy = 0;
    for (const tp of mk.pulos) { const v = (t - tp + 0.25) / 0.55; if (v > 0 && v < 1) dy = -170 * 4 * v * (1 - v); }
    return [x, dy, u];
  };

  // ---------------------------------------------------------- fundo por plano
  function fundo(t, p, q) {
    const lt = t - p.de, mk = p.marcas ?? {}, id = p.id;
    let s = '';
    let mundo = '';
    for (const a of q.atores) if (a.blob) mundo += A.blob(a.x, a.chao - a.alt * 0.42, a.blob.r * (a.alt / 420), a.blob.cor, t, a.papel.length * 7 + 3);
    if (id.endsWith('fase')) {
      const f = p.fase;
      return A.cartaoFase(f.num, f.parte, f.titulo, f.icone, lt, { total: 5, atual: +f.num, fim: p.ate - p.de - 0.35 }) + `<g transform="${cam(q.cam)}">${mundo}</g>`;
    }
    // ---- escuro: a crise (cena 2) e a missão (cena 6)
    if (p.tom === 'noite' || id === '2f') {
      s += A.papel(t, { tom: 'noite' });
      if (['2a', '2b', '2c', '2d', '2f'].includes(id)) {
        const r = rng(11);
        const n = id === '2a' ? Math.floor(clamp(lt / 1.5) * 9) : 9;
        const pos = Array.from({ length: 9 }, () => [r() * 1500 + 210, r() * 620 + 190]);
        let al = '';
        for (let k = 0; k < n; k++) al += P.alertaPopup(pos[k][0], pos[k][1], (id === '2a' ? lt - k * 0.17 : 3), { escala: 0.75 + (k % 3) * 0.12, rot: (k % 2 ? -4 : 5) });
        al += P.telefone(1560, 900, id === '2a' ? lt : 3, { toca: 1, escala: 0.9 });
        if (id === '2d') al += P.conectores(960, 560, 900, 480, lt);
        const fade = id === '2f' ? 1 - ease.inOut(clamp((lt - 0.3) / 0.5)) : 1;
        s += op((id === '2a' || id === '2f') ? fade : 0.55 * fade, al);
        if (id === '2f') s += op(ease.inOut(clamp((lt - 0.4) / 0.45)), A.papel(t, { tom: 'creme' }));
        return s;
      }
      if (id === '2e') {
        // o botão, a data que foge e o computador que fumega
        const corre = clamp((t - mk.foge) / 0.25);
        const cx = 1000 + Math.max(0, t - mk.foge) * 1100;
        mundo += A.chao(840, { noite: true });
        mundo += GG.botaoGoLive(640, 840, lt, { apertado: clamp((t - mk.aperta) / 0.12) });
        mundo += GG.monitorFumaca(1180, 840, lt, { erro: clamp((t - mk.fumaca + 0.3) / 0.3), tremor: clamp((t - mk.fumaca) / 0.5), fumaca: clamp((t - mk.fumaca) / 1.2) });
        if (cx < 2200) mundo += GG.calendario(cx, 840, lt, { vivo: clamp((t - mk.aperta + 0.05) / 0.3), corre, cara: t > mk.aperta ? 'susto' : 'normal' });
      }
      if (id === '6h') {
        mundo += A.chao(840, { noite: true });
        const a = ator(q, 'antonialli');
        if (a) s += foco(a.x, a.chao + 10, 520, clamp(lt / 0.5));
      }
      if (id === '6i') {
        mundo += A.chao(840, { noite: true });
        const a = ator(q, 'bruno');
        if (a) s += foco(a.x, a.chao + 10, 560, clamp((t - mk.bruno + 0.3) / 0.4)) + G.linhasVelocidade(a.x, a.y - a.alt * 0.5, t - mk.bruno - 0.05, { tipo: 'radial', r: 230, fim: 0.7 });
      }
      if (id === '6j') {
        mundo += GG.cofre(960, 840, lt, {}) + GG.lasers(lt, { area: [0, 120, 1920, 840], alarme: clamp((t - mk.alarme) / 0.2) });
        const b = ator(q, 'bruno');
        if (b) mundo += GG.cabo(b.topo[0], 0, b.topo[1] + 12, lt, { desce: 1, balanco: 0.6 });
      }
      s += `<g transform="${cam(q.cam)}">${mundo}</g>`;
      if (id === '6j' && t > mk.alarme) s += `<rect width="1920" height="1080" fill="#d9443f" opacity="${n2(0.22 * (0.5 + 0.5 * Math.sin((t - mk.alarme) * 14)))}"/>`;
      return s;
    }
    // ---- claro
    s += A.papel(t, { tom: p.tom ?? 'creme' });
    if (id.startsWith('4p')) {
      const pj = tl.projetos[p.projeto];
      mundo += LUGAR[pj.lugar](1560, 840, lt - 0.15, {});
    } else if (id === '3b') {
      mundo += P.escritorio(960, 700, lt, { itens: ['estante', 'planta', 'quadro', 'planta', 'estante'], escala: 0.9 });
    } else if (id === '5s1') {
      mundo += TL.slideReal('visao-integrada', 960, 460, 1100, lt, { id: 'vi1', foco: [0.42, 0.28, 0.22, 0.5], zoom: clamp((lt - 0.9) / 1.6) });
    } else if (id === '5s2') {
      mundo += slideMetodologia(960, 470, 1100, 620, lt);
    } else if (id === '5s3' || id === '5s4') {
      mundo += P.slide(p.slide, 960, 470, 1100, 620, lt, {});
    } else if (id === '5s5') {
      mundo += TL.slideReal('visao-integrada', 960, 500, 1000, lt, { id: 'vi2', foco: [0.42, 0.28, 0.22, 0.5], zoom: 1 - clamp(lt / 1.0) });
    } else if (id === '5u') {
      if (t < mk.fecha) mundo += P.pptParaDashboard(1200, 460, 980, 590, lt, { troca: 99 });
      else mundo += TL.laptop(1200, 880, 1040, t - mk.fecha, { tela: t < mk.tela2 ? 'cockpit-tela1' : 'cockpit-tela2', brilho: t - mk.fecha });
    } else if (id === '5v') {
      mundo += TL.slideReal('testes', 1240, 520, 1150, lt, { id: 'ts' });
    } else if (id === '5w') {
      mundo += P.slide('ia', 960, 470, 1100, 620, lt, {});
    } else if (id === '6a') {
      mundo += P.painelFinanceiro(960, 470, 1100, 560, lt, {});
    } else if (id === '6c') {
      mundo += GG.portas(1560, 840, t - mk.portas, {});
    } else if (id === '6e' || id === '6f') {
      mundo += P.escritorio(960, 820, 9, { itens: ['estante', 'mesa', 'planta', 'mesa', 'estante'], escala: 0.95 });
    } else if (id === '6g' && t < mk.scratch) {
      mundo += P.escritorio(960, 820, 9, { itens: ['estante', 'mesa', 'planta', 'mesa', 'estante'], escala: 0.95 });
    } else if (id === '6k') {
      s += G.telefonema('Giovanna Brandão', 'Bruno Moraes', lt, { ativo: 'ambos' });
    } else if (id === '6l') {
      const [x, dy] = nfPos(t, mk);
      mundo += GG.pista(-100, 2020, 840, lt, { lacunas: [[1150, 1330]] });
      NF_OBST.forEach(([ox, tipo, rot], k) => { mundo += GG.obstaculo(tipo, ox, 840, lt - 0.1 * k, { rotulo: rot, largura: 180 }); });
      mundo += GG.obstaculo('portal', 1600, 840, lt, { rotulo: 'FY26', rompe: clamp((t - mk.chega + 0.15) / 0.3) });
      const corre = t > mk.parte && t < mk.chega ? 1 : 0;
      mundo += GG.nfGigante(x, 840 + dy, lt, { corre, cara: dy < -20 ? 'susto' : (t > mk.chega ? 'feliz' : 'normal'), carimbo: clamp((t - mk.carimbo) / 0.25) });
    } else if (id === '7c') {
      mundo += GG.pipeline(1200, 820, t - mk.pipeline, {});
    } else if (id === '7d' || id === '7e') {
      s += A.palco(t, { papel: false, idade: id === '7d' ? lt : 9 });
    }
    const semChao = ['1t', '3d', '5t', '6b', '6d', '6k', '6l', '7e'].includes(id) || id.startsWith('1c') || (id === '6g' && t > mk.scratch) || id.startsWith('5s') || id === '5w';
    if (!semChao) mundo += A.chao(840, {});
    if (id === '6e') { const a = ator(q, 'giovanna'); if (a) mundo += G.linhasVelocidade(a.x + 140, a.y - a.alt * 0.5, lt, { tipo: 'horizontal', w: 360, h: a.alt * 0.8, dir: 1 }); }
    s += `<g transform="${cam(q.cam)}">${mundo}</g>`;
    s += A.brilhos(t, p.cena * 7 + 1, {});
    if (id === '7f') s += `<rect width="1920" height="1080" fill="#000" opacity="${n2(0.35 * clamp((lt) / 0.5) * (t < mk.corte ? 1 : 0))}"/>`;
    return s;
  }

  // ---------------------------------------------------------- sobreposição por plano
  function overlay(t, p, q) {
    const lt = t - p.de, mk = p.marcas ?? {}, id = p.id;
    let s = '';
    // gráficos ligados aos atores: balões de logo, plaquinhas, nomes, iniciais das silhuetas, reações
    for (const a0 of q.atores) {
      const a = atrasado(t, a0.papel) ?? a0;
      const m = MASC[a.papel];
      if (m && (id === '3a' || id.startsWith('4p') || a.logo)) {
        const chegou = id === '3a' ? (a.papel === 'modulo' ? mk.modulo + 0.9 : mk.cronos + 0.9) : p.de + 0.7;
        s += G.balaoLogo(m[2], a.topo[0], a.topo[1] - 16, t - chegou, { h: a.logo ? 34 : 46 });
        if (!a.logo) s += G.placaNome(m[0], m[1], a.x, a.chao + 46, t - chegou - 0.15, {});
      }
      if (a.spr === 'silhueta' && a.rotulo) s += text(iniciais(a.rotulo), a.x, a.y - a.alt * 0.33, { size: Math.round(a.alt * 0.16), weight: 900, fill: '#5d5a6e' });
      if (a.rotulo && a.nome) s += G.chip(id.startsWith('4p') ? a.rotulo.split(' ')[0] : curto(a.rotulo), a.topo[0], a.topo[1] - 26, t - p.de - 0.4, { icone: 'pessoa' });
      if (a.celular) s += P.celular(a.x + a.alt * 0.2, a.y - a.alt * 0.42, 9, { escala: a.alt / 1100, toca: 1 });
      if (a.reacao === '!') s += G.exclamacao(a.topo[0] + 60, a.topo[1] - 70, lt - 0.15) + G.gotaSuor(a.topo[0] - 70, a.topo[1] + 40, lt - 0.3);
      if (a.brilho != null) s += G.brilhoCabelo(a.topo[0] + 20, a.topo[1] + 30, t - a.brilho);
      if (a.lider) s += G.chip('LÍDER DO TIME', a.topo[0], a.topo[1] - 30, t - p.de - 1.8, { icone: 'check', solido: true, cor: '#0c2f57', h: 46 });
      if (a.donos) s += G.chip('DONO DO DINHEIRO', a.topo[0], a.topo[1] - 34, t - (mk.scratch ?? p.de) - 0.9, { icone: null, solido: true, cor: '#b8860b', h: 44 });
      if (a.agente != null) s += G.chip('AGENTE ESPECIAL', a.topo[0], a.topo[1] - 34, t - a.agente, { icone: null, solido: true, cor: '#20212b', h: 46 });
      if (a.suor != null) { const [fx, fy] = testa(a); s += G.gotaSuor(fx + 30, fy, (t - a.suor) % 0.9) + G.gotaSuor(fx - 40, fy + 10, (t - a.suor - 0.45) % 0.9); }
    }
    // efeitos presos ao rosto (pontos do recorte → tela, sem atraso)
    for (const a of q.atores) {
      if (a.desespero != null && t > a.desespero - 0.3) {
        const k = clamp((t - a.desespero + 0.3) / 0.25), z = a.k;
        const [mx, my] = pontoTela(a, 290, 432);
        const [fx, fy] = pontoTela(a, 300, 230);
        const tremor = Math.sin(t * 60) * 1.5;
        let f = `<ellipse cx="${n2(mx)}" cy="${n2(my + 2 * z)}" rx="${n2(112 * z)}" ry="${n2(42 * z)}" fill="url(#fiBarba)" filter="url(#fiBorra)"/>`;
        const ab = 0.85 + 0.15 * Math.sin(t * 14);
        f += `<ellipse cx="${n2(mx + tremor)}" cy="${n2(my + 6 * z)}" rx="${n2(40 * z)}" ry="${n2(32 * z * ab)}" fill="#5a1a1f" stroke="#24120e" stroke-width="${n2(6 * z)}"/>`;
        f += `<ellipse cx="${n2(mx + tremor)}" cy="${n2(my + (6 + 20 * ab) * z)}" rx="${n2(22 * z)}" ry="${n2(9 * z)}" fill="#c9575f"/>`;
        f += `<path d="M${n2(mx + tremor - 28 * z)} ${n2(my - 12 * z * ab)} q${n2(28 * z)} ${n2(-7 * z)} ${n2(56 * z)} 0" stroke="#fffdf8" stroke-width="${n2(9 * z)}" fill="none" stroke-linecap="round"/>`;
        let lin = '';
        for (let j = 0; j < 7; j++) {
          const lx = fx + (j - 3) * 34 * z;
          lin += `<line x1="${n2(lx)}" y1="${n2(fy - 70 * z)}" x2="${n2(lx)}" y2="${n2(fy + (30 + (j % 2) * 20) * z)}" stroke="url(#fiTriste)" stroke-width="${n2(9 * z)}" stroke-linecap="round"/>`;
        }
        s += op(k, f + lin);
        const [sx1, sy1] = pontoTela(a, 455, 300), [sx2, sy2] = pontoTela(a, 120, 330);
        s += G.gotaSuor(sx1, sy1, (t - a.desespero) % 1.1) + G.gotaSuor(sx2, sy2, (t - a.desespero - 0.5) % 1.1);
      }
      if (a.oculos != null && t > a.oculos - 0.4 && MARCOS[a.spr]?.olhos) {
        // óculos escuros que descem do alto e encaixam nos olhos (pose de bad boy / agente especial)
        const [[x1, y1, rx1, ry1], [x2, y2, rx2, ry2]] = MARCOS[a.spr].olhos;
        const u = clamp((t - a.oculos + 0.4) / 0.4), cai = (1 - ease.out(u)) * -380;
        const [p1x, p1y] = pontoTela(a, x1, y1), [p2x, p2y] = pontoTela(a, x2, y2);
        const z = a.k;
        const lente = (cx, cy, rx, ry) => `<rect x="${n2(cx - rx * 1.45 * z)}" y="${n2(cy - ry * 1.15 * z)}" width="${n2(rx * 2.9 * z)}" height="${n2(ry * 2.3 * z)}" rx="${n2(ry * 0.9 * z)}" fill="#14161c" stroke="#000" stroke-width="${n2(6 * z)}"/>`
          + `<path d="M${n2(cx - rx * 0.9 * z)} ${n2(cy - ry * 0.5 * z)} l${n2(rx * 0.7 * z)} ${n2(-ry * 0.3 * z)}" stroke="#fff" stroke-opacity=".7" stroke-width="${n2(7 * z)}" stroke-linecap="round"/>`;
        let o = lente(p1x, p1y + cai, rx1, ry1) + lente(p2x, p2y + cai, rx2, ry2);
        o += `<path d="M${n2(p1x + rx1 * 1.4 * z)} ${n2(p1y + cai - ry1 * 0.4 * z)} L${n2(p2x - rx2 * 1.4 * z)} ${n2(p2y + cai - ry2 * 0.4 * z)}" stroke="#000" stroke-width="${n2(10 * z)}"/>`;
        s += o + (u >= 1 ? G.brilhoCabelo(p2x + rx2 * 1.2 * z, p2y - ry2 * 0.8 * z, t - a.oculos - 0.1) : '');
      }
      // piada recorrente: a mão ajeita o cabelo e faz "ting"
      if (a.cabelo != null) s += GG.ajeitaCabelo(a.topo[0], a.topo[1], t - a.cabelo, { r: a.alt * 0.22 });
    }
    // ---- cena 1: abertura e cartelas
    if (id === '1t') {
      const k = ease.back(clamp((lt - 0.1) / 0.5)), sai = ease.inOut(clamp((lt - (p.ate - p.de - 0.35)) / 0.3));
      let tt = text('PROJETO DO ANO', 960, 470, { size: 118, weight: 900, fill: '#2b2b36', ls: '2' }) + `<rect x="840" y="500" width="240" height="8" rx="4" fill="#f2b84b"/>`;
      tt += text('PARCERIA A&M + TOTVS · FY26', 960, 575, { size: 34, weight: 800, fill: '#6b6f7e', ls: '4' });
      tt += g(tr(960, 690, ease.back(clamp((lt - 0.5) / 0.5))), A.marca(9, { x: -200, y: 0, h: 60 }));
      s += op(1 - sai, g(tr(960, 540, Math.max(0.001, 0.9 + 0.1 * k)), g(tr(-960, -540), tt)));
    }
    if (id.startsWith('1c')) s += GG.cartaoPortfolio(p.item, lt, { n: p.n, total: p.total, fim: p.ate - p.de - 0.32 });
    // ---- cena 2: a crise
    if (['2b', '2c', '2d'].includes(id)) s += G.textoCrise(p.texto, lt, {});
    if (id === '2e') {
      if (t > mk.texto) s += G.textoCrise(p.texto, t - mk.texto, { x: 960, y: 230, tam: 150, maxW: 1500 });
      if (t > mk.foge + 0.3) s += G.carimbo('ADIADO!', 390, 450, t - mk.foge - 0.3, { cor: 'vermelho', icone: 'x', tam: 54, rot: -8 });
      if (t > mk.aperta - 0.05 && t < mk.aperta + 0.5) s += G.impacto(640, 690, t - mk.aperta + 0.05, { tam: 0.7 });
    }
    if (id === '2g') {
      const ic = t - mk.claquete + 0.35;
      if (ic > 0 && t < mk.fita + 0.4) {
        const fecha = clamp((t - mk.claquete) / 0.12), sai = ease.inOut(clamp((t - mk.fita) / 0.4));
        const ang = -24 * (1 - fecha) + 4 * Math.exp(-Math.max(0, t - mk.claquete) * 10) * Math.sin((t - mk.claquete) * 40);
        let c = `<rect x="-230" y="-60" width="460" height="300" rx="14" fill="#20212b" stroke="#2b2b36" stroke-width="5"/>`;
        c += text('AÇÃO!', 0, 120, { size: 104, weight: 900, fill: '#fffdf8' }) + text('PROJETO ERP · CENA 1 · TOMADA 1', 0, 200, { size: 22, weight: 800, fill: '#f2b84b', ls: '2' });
        let barra = `<rect x="-230" y="-60" width="460" height="60" rx="8" fill="#fffdf8" stroke="#2b2b36" stroke-width="5"/>`;
        for (let j = 0; j < 6; j++) barra += `<path d="M${-210 + j * 80} -60 l40 0 l-30 60 l-40 0Z" fill="#20212b"/>`;
        c += `<g transform="translate(-230 -60) rotate(${n2(ang)}) translate(230 60)">${barra}</g>`;
        s += op(1 - sai, g(tr(960, 470 - 400 * sai, ease.back(clamp(ic / 0.35))), c));
      }
      if (t > mk.fita - 0.1) {
        const cenas = ['ESCOPO SUBDIMENSIONADO', 'RETRABALHO', 'PROCESSOS DESALINHADOS', 'GO-LIVE ADIADO'];
        const v = (t - mk.fita) * 260, y0 = 300, H = 300, fw = 420;
        let f = `<rect x="-20" y="${y0}" width="1960" height="${H}" fill="#1c1d24"/>`;
        for (let x = -60 - (v % 60); x < 1960; x += 60) f += `<rect x="${n2(x)}" y="${y0 + 14}" width="30" height="22" rx="5" fill="#f4ecdf"/><rect x="${n2(x)}" y="${y0 + H - 36}" width="30" height="22" rx="5" fill="#f4ecdf"/>`;
        cenas.forEach((c, k) => {
          const x = 1960 + k * (fw + 40) - v * 1.0 - 900;
          f += `<rect x="${n2(x)}" y="${y0 + 52}" width="${fw}" height="${H - 104}" rx="6" fill="#2a2c3a" stroke="#4b4f63" stroke-width="3"/>`;
          f += `<g transform="translate(${n2(x + fw / 2)} ${y0 + 112})">${P.alertaPopup(0, 0, 3, { escala: 0.55 })}</g>`;
          f += text(c, x + fw / 2, y0 + 205, { size: c.length > 16 ? 22 : 30, weight: 900, fill: '#fffdf8' });
        });
        s += op(clamp((t - mk.fita + 0.1) / 0.3) * (1 - ease.inOut(clamp((t - mk.pergunta + 0.2) / 0.4))), f);
      }
      if (t > mk.pergunta - 0.2) s += P.celular(960, 470, t - mk.pergunta, { nome: '?', status: 'chamando…', toca: 1, escala: 1.1 }) + G.interrogacao(1120, 260, t - mk.pergunta - 0.3);
    }
    if (id === '2h') {
      s += G.tipoSuave(p.texto, 960, 330, lt, { tam: 64 });
      if (lt > 1.4) {
        const k = clamp((t - mk.cresce) / 0.9);
        const n = 1 + Math.floor(k * 5.99);
        for (let j = 0; j < n; j++) s += G.chip('PROJETO', 960 + (j - (n - 1) / 2) * 230 * ease.inOut(k), 620, lt - 1.5 - j * 0.08, { icone: 'doc', h: 66 });
      }
    }
    // ---- cena 3: a parceria
    if (id === '3a' && t > mk.encontro - 0.1) {
      const a = ator(q, 'modulo'), b = ator(q, 'cronos');
      if (a && b) {
        const x = (a.x + b.x) / 2, y = (a.y - a.alt * 0.55);
        s += A.estouro(x, y, t - mk.encontro, 4, {}) + G.impacto(x, y, t - mk.encontro, { tam: 0.9 });
        const k = ease.back(clamp((t - mk.encontro) / 0.45));
        s += g(tr(x, y, Math.max(0.001, k)), `<circle r="70" fill="#0b5ed7" stroke="#2b2b36" stroke-width="5"/>` + A.icone('aperto', 0, 0, 80, '#fff', 2.6));
      }
    }
    if (id === '3b') {
      s += G.terceiroInferior('Guilherme Antonialli', 'Diretor Sênior · Liderança da parceria A&M + TOTVS', 70, 130, t - mk.cartao, { fim: 4.8 });
      s += G.adesivo('FAZEDORA', 900, 330, t - mk.fazedora, { cor: '#e8891a', rot: -6, fim: 4 }) + G.adesivo('ADAPTÁVEL', 1610, 240, t - mk.adaptavel, { cor: '#0b5ed7', rot: 5, fim: 3.4 });
      s += G.adesivo('ENTENDE DO JOGO!', 1250, 190, t - mk.jogo, { cor: '#1f9d57', rot: -3 });
    }
    if (id === '3d') s += G.palavrasValor(lt, { tempos: mk.palavras.map(x => x - p.de) });
    // ---- cena 4: seis projetos
    if (id.startsWith('4p')) {
      const pj = tl.projetos[p.projeto];
      const H = 388 + (pj.time.length > 2 ? 2 : 1) * 60 + 18;
      s += g(tr(330, 130 + H * 0.45, 0.9), G.cartaoProjeto({ n: pj.n, cliente: pj.cliente, frente: pj.frente, erp: pj.erp, logo: pj.logo, time: pj.time.map(x => tl.nomes[x]) }, 0, 0, t - mk.cartao, { w: 560, fim: p.ate - mk.cartao - 0.3 }));
      s += G.antesDepois(1450, 215, t - mk.antes, { w: 560, h: 200, tOrg: mk.depois - mk.antes, fim: p.ate - mk.antes - 0.3 });
      if (mk.pioneiro) s += G.adesivo('PROJETO PIONEIRO!', 880, 370, t - mk.pioneiro, { cor: '#1f9d57', rot: -5, tam: 52 });
    }
    if (id === '4g') {
      const quadros = tl.projetos.map(pj => `<rect width="1920" height="1080" fill="#efe2c8"/>${LUGAR[pj.lugar](1150, 900, 9, { escala: 1.35 })}${logo(pj.logo, 520, 300, 150, 640)}`);
      s += P.mosaico(lt, quadros, { rotulos: tl.projetos.map(pj => pj.cliente) });
    }
    if (id === '4h') {
      s += G.adesivo(p.texto, 960, 330, t - mk.selo, { cor: '#0c2f57', rot: -3, tam: 58 });
      const k = ease.back(clamp((t - mk.selo - 0.4) / 0.45));
      s += g(tr(960, 560, Math.max(0.001, k)), A.marca(9, { x: -230, y: 0, h: 70 }));
    }
    // ---- cena 5: framework e ferramentas
    if (id.startsWith('5s') && p.texto) s += G.chip(p.texto, 960, 118, lt - 0.5, { solido: true, cor: '#0c2f57', h: 64 });
    if (id === '5s5') {
      s += G.chip('TOTVS NA SOLUÇÃO', 330, 430, t - mk.totvs, { icone: 'check', h: 60 }) + G.chip('A&M NA GESTÃO DA TRANSFORMAÇÃO', 1540, 430, t - mk.am, { icone: 'check', h: 60 });
      s += G.adesivo('UM TIME SÓ!', 960, 880, t - mk.time, { cor: '#1f9d57', rot: -4, tam: 72 });
    }
    if (id === '5t') s += G.adesivo(p.texto[0], 960, 420, lt - 0.15, { cor: '#6b6f7e', rot: -4 }) + G.adesivo(p.texto[1], 960, 600, lt - 1.0, { cor: '#1f9d57', rot: 3 });
    if (id === '5u') s += G.terceiroInferior('Vinicius de Sousa', '', 70, 130, lt - 0.6, {}) + G.chip('COCKPIT EXECUTIVO DE GESTÃO DE PORTFÓLIO', 1200, 118, t - mk.fecha, { solido: true, cor: '#0c2f57', h: 60 });
    if (id === '5v') {
      s += G.chip(p.texto, 960, 110, t - mk.texto, { solido: true, cor: '#0c2f57', h: 60 });
      s += G.checklist('Testes integrados', ['ROTEIRO PADRONIZADO', 'RASTREABILIDADE PONTA A PONTA', 'EVIDÊNCIA NO LUGAR CERTO', 'STATUS EM TEMPO REAL', 'DEFEITO COM DONO E PRAZO', 'REUSO ENTRE CICLOS E FASES'], 330, 540, lt - 0.5, { w: 540, tempos: mk.itens.map(x => x - p.de - 0.5) });
    }
    if (id === '5w') s += G.chip(p.texto, 960, 118, lt - 0.4, { solido: true, cor: '#0c2f57', h: 64 });
    // ---- cena 6: P&L, cross-sell e a NF
    if (id === '6a') s += G.numeroHeroi('+ R$ 16 MILHÕES', 'EM COLLECTIONS', 960, 450, t - mk.numero, { tam: 104 });
    if (id === '6b') {
      s += GG.tileNumero(560, 500, 640, 330, t - mk.fy26, { prefixo: 'R$ ', numero: 7, sufixo: ' MILHÕES', rotulo: 'NO FY26', cor: '#1f9d57' });
      s += GG.tileNumero(1360, 500, 640, 330, t - mk.fy27, { prefixo: 'R$ ', numero: 9, sufixo: ' MILHÕES', rotulo: 'NO FY27', cor: '#0b5ed7' });
      s += g(tr(960, 500, ease.back(clamp((t - mk.fy27 - 0.1) / 0.4))), `<circle r="42" fill="#f2b84b" stroke="#2b2b36" stroke-width="4"/>` + text('+', 0, 18, { size: 60, weight: 900, fill: '#2b2b36' }));
      s += G.chip('= R$ 16 MILHÕES EM COLLECTIONS', 960, 790, t - mk.fy27 - 0.7, { icone: null, solido: true, cor: '#0c2f57', h: 60 });
    }
    if (id === '6c') {
      s += G.chip('PROJETOS DE LONGO PRAZO', 960, 118, t - mk.meses, { solido: true, cor: '#0c2f57', h: 60 });
      s += GG.barraMeses(900, 250, 900, t - mk.meses, {});
      s += G.chip('VALOR PARA O CLIENTE', 470, 560, t - mk.valor, { icone: 'check', h: 58 }) + G.chip('CRESCE O NOSSO NEGÓCIO', 1400, 560, t - mk.cresce, { icone: 'raio', h: 58 });
      s += G.chip('CROSS-SELL COM OUTRAS ESPECIALIZAÇÕES DA A&M', 1500, 400, t - mk.portas - 0.5, { solido: true, cor: '#1f9d57', h: 54 });
    }
    if (id === '6d') s += G.mas_detalhe(lt, {});
    if (id === '6g' && t > mk.scratch - 0.05) s += G.riscoDisco(t - mk.scratch, { dur: 0.6 }) + moedas(120, 1800, t - mk.scratch - 0.8, 21);
    if (id === '6h') {
      const gv = ator(q, 'giovanna');
      if (gv) s += GG.envelope(gv.x - 330, gv.y - gv.alt * 0.78, t - mk.envelope, { destroi: mk.destroi - mk.envelope });
    }
    if (id === '6j') {
      const b = ator(q, 'bruno');
      if (b && t > mk.gota) { const [fx, fy] = testa(b); s += GG.gotaCaindo(fx + 20, fy, 820, t - mk.gota, {}); }
      if (t > mk.alarme) s += GG.alarme(t - mk.alarme, { dur: p.ate - mk.alarme });
      s += G.chip('SALA DE CONTROLE · NOTAS FISCAIS', 330, 120, lt - 0.3, { solido: true, cor: '#20212b', h: 50 });
    }
    if (id === '6k') s += G.chip('FALA COM A TOTVS', 960, 110, lt - 0.3, { icone: 'telefone', solido: true, cor: '#0c2f57', h: 58 });
    if (id === '6l' && t > mk.carimbo) s += G.adesivo('NFs ANTECIPADAS!', 960, 200, t - mk.carimbo - 0.1, { cor: '#1f9d57', rot: -4 });
    if (id === '6m') s += A.confete(t - mk.comemora, 5, {}) + G.adesivo('NFs ANTECIPADAS!', 960, 260, t - mk.comemora - 0.1, { cor: '#1f9d57', rot: -4 });
    if (id === '6n') s += G.tituloMissao('OPERAÇÃO COLLECTION ZERO DEFECT', t - mk.missao, { y: 250 });
    // ---- cena 7: fechamento
    if (id === '7c') s += G.adesivo('PIPELINE AQUECIDO!', 1200, 300, t - mk.aquecido, { cor: '#e8891a', rot: -5 });
    if (id === '7d') s += A.confete(lt, 9, {});
    if (id === '7e') s += G.lockupFinal(lt, {}) + G.adesivo('E NÃO PARA POR AÍ.', 1560, 300, lt - 2.0, { cor: '#e8891a', rot: -6, tam: 50 });
    // legendas (numa linha só: as falas longas viram partes)
    for (const f of tl.falas) {
      if (t < f.de - 0.2 || t > f.ate + 0.6) continue;
      const narr = f.quem === 'Narrador';
      const ps = partes(marcar(f), f.de, f.ate);
      ps.forEach((pt, k) => {
        const ultimo = k === ps.length - 1;
        if (t < pt.de - 0.15 || t > pt.ate + (ultimo ? 0.5 : 0.05)) return;
        s += A.legenda(pt.txt, t, pt.de, pt.ate + (ultimo ? 0.35 : 0.02), { tam: 30, maxW: 1900, ...(narr ? {} : { quem: f.quem, cor: COR_FALA[f.quem] ?? '#2b2b36' }) });
      });
    }
    // chrome: marca, régua e capítulo (fora da abertura, do escuro, dos cartões de fase e do final)
    const chromeOn = p.cena > 1 && p.tom !== 'noite' && id !== '2f' && !id.endsWith('fase') && !['7e', '7f'].includes(id);
    if (chromeOn) {
      const c = CAPITULO[p.cena];
      s += A.regua(t, tl.dur, {}) + A.marca(9, {}) + A.pilulaCapitulo(c[0], c[1], c[2], t - ini[p.cena], {});
    }
    for (const c of [3, 4, 5, 6, 7]) s += A.transicao(t, ini[c] - 0.45, {});
    if (id === '7f' && t > mk.corte + 1.9) s += `<rect width="1920" height="1080" fill="#000" opacity="${n2(clamp((t - mk.corte - 1.9) / 0.3))}"/>`;
    return s;
  }

  return {
    duration: tl.dur,
    frame(t) {
      const p = plano(t), q = quadro(t);
      let s = DEFS;
      if (fundoOn) s += fundo(t, p, q);
      if (overOn) s += overlay(t, p, q);
      return s;
    },
  };
}
