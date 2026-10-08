// O filme "Projeto do Ano — Parceria A&M + TOTVS" no modelo do explainer SpecForge.
// Duas camadas SVG com a mesma câmera (os personagens vêm do Python, entre elas):
//   fundo   papel, blobs, chão e props
//   overlay balões de logo, nomes, cartões, adesivos, legendas, chrome e transições
// Tempos: build/filme/timeline.json (producao/filme.py tempo).
// Personagens e câmera por quadro: build/filme/track.json (producao/filme.py rastro).
import { tr, g, op, clamp, ease, inv, n2, rng, text } from '../core.js';
import { logo } from '../assets.js';
import * as A from './ambiente.js';
import * as G from './graficos.js';
import * as P from './props.js';

const CAPITULO = {
  1: ['00', 'PRÓLOGO', 'O desafio'], 2: ['01', 'PARTE 1', 'A parceria e a liderança'], 3: ['02', 'PARTE 2', 'Seis projetos, seis resultados'],
  4: ['03', 'PARTE 3', 'O método e a IA'], 5: ['04', 'PARTE 4', 'Resultado no P&L e a NF'], 6: ['05', 'FECHAMENTO', 'Um time'],
};
const COR_FALA = { Giovanna: '#d94b4b', Paladini: '#3aa6a0', Antonialli: '#1f2d4d', Bruno: '#2f7fd0', 'Giovanna e Bruno': '#d94b4b' };
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
  c1_n1: ['projeto de ERP'], c1_n2: ['quem você chama'], c1_n3: ['um projeto'], c2_n1: ['TOTVS'], c2_n2: ['A&M Performance'],
  c2_n3: ['fazedora', 'adaptável'], c2_n5: ['entende do jogo'], c2_n6: ['Unimed Brasil'], c3_n2: ['FUNED'], c3_n3: ['CAOA'],
  c3_n4: ['John Deere'], c3_n5: ['Hughes'], c3_n6: ['Libercon'], c4_n1: ['método'], c4_n2: ['padrão'], c4_n3: ['previsibilidade'],
  c4_n4: ['cockpits de dashboards'], c5_n2: ['de todo mundo'], c5_n4: ['cresce o nosso negócio'], c5_a3: ['Collection Zero Defect'],
  c6_a2: ['R$ 7 milhões'], c6_a3: ['método e confiança'], c6_n1: ['gera projetos'],
};
// a pontuação colada ao destaque entra no destaque (a legenda separa por palavras)
const marcar = (f) => (DESTAQUE[f.id] ?? []).reduce((s, w) => s.replace(w, `*${w}*`), f.texto).replace(/\*([.,:;!?…]+)/g, '$1*');
const curto = nome => { const w = nome.split(' ').filter(x => x.length > 2); return w.length > 1 ? `${w[0]} ${w[w.length - 1]}` : nome; };

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
  const DEFS = `<defs>${A.defs()}${G.defs()}${P.defs()}</defs>`;

  // ---------------------------------------------------------- fundo por plano
  function fundo(t, p, q) {
    const lt = t - p.de, mk = p.marcas ?? {};
    let s = '';
    let mundo = '';
    // blobs atrás dos personagens que pedem
    for (const a of q.atores) if (a.blob) mundo += A.blob(a.x, a.chao - a.alt * 0.42, a.blob.r * (a.alt / 420), a.blob.cor, t, a.papel.length * 7 + 3);
    const id = p.id;
    if (p.tom === 'noite' || id === '1f') {
      const r = rng(11);
      const n = id === '1a' ? Math.floor(clamp(lt / 1.7) * 9) : 9;
      const pos = Array.from({ length: 9 }, () => [r() * 1500 + 210, r() * 620 + 190]);
      let al = '';
      for (let k = 0; k < n; k++) al += P.alertaPopup(pos[k][0], pos[k][1], (id === '1a' ? lt - k * 0.19 : 3), { escala: 0.75 + (k % 3) * 0.12, rot: (k % 2 ? -4 : 5) });
      al += P.telefone(1560, 900, id === '1a' ? lt : 3, { toca: 1, escala: 0.9 });
      if (id === '1d') al += P.conectores(960, 560, 900, 480, lt);
      if (id === '1e') al += P.janelaERP(960, 560, 760, 460, lt);
      const fade = id === '1f' ? 1 - ease.inOut(clamp((lt - 0.35) / 0.6)) : 1;
      s += A.papel(t, { tom: 'noite' }) + op((id === '1a' || id === '1f') ? fade : 0.55 * fade, al);
      if (id === '1f') s += op(ease.inOut(clamp((lt - 0.45) / 0.55)), A.papel(t, { tom: 'creme' }));
      return s;
    }
    s += A.papel(t, { tom: p.tom ?? 'creme' });
    if (id.startsWith('3p')) {
      const pj = tl.projetos[p.projeto];
      mundo += LUGAR[pj.lugar](1420, 840, lt - 0.15, {});
    } else if (id === '2b') {
      mundo += P.escritorio(960, 700, lt, { itens: ['estante', 'planta', 'quadro', 'planta', 'estante'], escala: 0.9 });
    } else if (id.startsWith('4s')) {
      mundo += P.slide(p.slide, 960, 470, 1100, 620, lt, {});
    } else if (id === '4f') {
      mundo += P.pptParaDashboard(1200, 460, 980, 590, lt, { troca: 1.0 });
      for (let k = 0; k < 3; k++) mundo += P.robo(1500 + k * 150, 860, t - mk.robos - k * 0.2, { acao: k === 1 ? 'acena' : 'trabalha', escala: 0.8 });
    } else if (id === '5a' || id === '5b') {
      mundo += P.painelFinanceiro(960, 470, 1100, 560, id === '5a' ? lt : 9, {});
    } else if (id === '5e' || id === '5f' || id === '5h') {
      mundo += P.escritorio(960, 820, 9, { itens: ['estante', 'mesa', 'planta', 'mesa', 'estante'], escala: 0.95 });
    } else if (id === '5i' && t < mk.comemora) {
      s += G.telefonema('Giovanna Brandão', 'Bruno Moraes', lt, { ativo: 'ambos' });
    } else if (id === '6d' || id === '6e') {
      s += A.palco(t, { papel: false, idade: id === '6d' ? lt : 9 });
    }
    if (!['2d', '4e', '5d', '5i'].includes(id) && !(id === '5g' && t > mk.scratch) && !id.endsWith('fase')) mundo += A.chao(840, {});
    // linhas de velocidade atrás de quem corre
    if (id === '5e') { const a = ator(q, 'giovanna'); if (a) mundo += G.linhasVelocidade(a.x + 140, a.y - a.alt * 0.5, lt, { tipo: 'horizontal', w: 360, h: a.alt * 0.8, dir: 1 }); }
    s += `<g transform="${cam(q.cam)}">${mundo}</g>`;
    s += A.brilhos(t, p.cena * 7 + 1, {});
    if (id === '6f') s += `<rect width="1920" height="1080" fill="#000" opacity="${n2(0.35 * clamp((lt) / 0.5) * (t < mk.corte ? 1 : 0))}"/>`;
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
      if (m && (id === '2a' || id === '2e' || id.startsWith('3p') || a.logo)) {
        const chegou = id === '2a' ? (a.papel === 'modulo' ? mk.modulo + 0.9 : mk.cronos + 0.9) : p.de + 0.7;
        s += G.balaoLogo(m[2], a.topo[0], a.topo[1] - 16, t - chegou, { h: a.logo ? 34 : 46 });
        if (!a.logo) s += G.placaNome(m[0], m[1], a.x, a.chao + 46, t - chegou - 0.15, {});
      }
      if (a.spr === 'silhueta' && a.rotulo) s += text(iniciais(a.rotulo), a.x, a.y - a.alt * 0.33, { size: Math.round(a.alt * 0.16), weight: 900, fill: '#5d5a6e' });
      if (a.rotulo && a.nome) s += G.chip(curto(a.rotulo), a.topo[0], a.topo[1] - 26, t - p.de - 0.4, { icone: 'pessoa' });
      if (a.celular) s += P.celular(a.x + a.alt * 0.2, a.y - a.alt * 0.42, 9, { escala: a.alt / 1100, toca: 1 });
      if (a.reacao === '!') s += G.exclamacao(a.topo[0] + 60, a.topo[1] - 70, lt - 0.15) + G.gotaSuor(a.topo[0] - 70, a.topo[1] + 40, lt - 0.3);
      if (a.brilho != null) s += G.brilhoCabelo(a.topo[0] + 20, a.topo[1] + 30, t - a.brilho);
    }
    // plano a plano
    if (['1b', '1c', '1d', '1e'].includes(id)) s += G.textoCrise(p.texto, lt, {});
    if (id === '1g') {
      const fita = ['ESCOPO SUBDIMENSIONADO.', 'REWORK.', 'PROCESSOS DESALINHADOS', 'GO-LIVE ADIADO.'];
      const u = clamp((t - p.de) / (mk.pergunta - p.de));
      let f = '';
      fita.forEach((x, k) => { f += G.cartao(300 + k * 440 - 260 * u, 300, 400, 220, lt - 0.2 - k * 0.12, { cabecalho: 'ERP', conteudo: text(x, 200, 122, { size: 23, weight: 900, fill: '#2b2b36' }) }); });
      s += op(1 - ease.inOut(clamp((t - mk.pergunta + 0.2) / 0.4)), f);
      if (t > mk.pergunta - 0.2) s += P.celular(960, 470, t - mk.pergunta, { nome: '?', status: 'chamando…', toca: 1, escala: 1.1 }) + G.interrogacao(1120, 260, t - mk.pergunta - 0.3);
    }
    if (id === '1h') {
      s += G.tipoSuave(p.texto, 960, 330, lt, { tam: 64 });
      if (lt > 2.2) {
        const k = clamp((t - mk.cresce) / 0.9);
        const n = 1 + Math.floor(k * 5.99);
        for (let j = 0; j < n; j++) s += G.chip('PROJETO', 960 + (j - (n - 1) / 2) * 230 * ease.inOut(k), 620, lt - 2.3 - j * 0.08, { icone: 'doc', h: 66 });
      }
    }
    if (id.endsWith('fase')) { const f = p.fase; s += A.cartaoFase(f.num, f.parte, f.titulo, f.icone, lt, { total: 5, atual: +f.num, fim: p.ate - p.de - 0.35 }); }
    if (id === '2a' && t > mk.encontro - 0.1) {
      const a = ator(q, 'modulo'), b = ator(q, 'cronos');
      if (a && b) {
        const x = (a.x + b.x) / 2, y = (a.y - a.alt * 0.55);
        s += A.estouro(x, y, t - mk.encontro, 4, {}) + G.impacto(x, y, t - mk.encontro, { tam: 0.9 });
        const k = ease.back(clamp((t - mk.encontro) / 0.45));
        s += g(tr(x, y, Math.max(0.001, k)), `<circle r="70" fill="#0b5ed7" stroke="#2b2b36" stroke-width="5"/>` + A.icone('aperto', 0, 0, 80, '#fff', 2.6));
      }
    }
    if (id === '2b') {
      s += G.terceiroInferior('Guilherme Antonialli', 'Diretor Sênior · Liderança da parceria A&M + TOTVS', 70, 130, t - mk.cartao, { fim: 4.8 });
      s += G.adesivo('FAZEDORA', 900, 330, t - mk.fazedora, { cor: '#e8891a', rot: -6, fim: 4 }) + G.adesivo('ADAPTÁVEL', 1530, 300, t - mk.adaptavel, { cor: '#0b5ed7', rot: 5, fim: 3.4 });
      s += G.adesivo('ENTENDE DO JOGO!', 1250, 190, t - mk.jogo, { cor: '#1f9d57', rot: -3 });
    }
    if (id === '2d') s += G.palavrasValor(lt, { tempos: mk.palavras.map(x => x - p.de) });
    if (id === '2e') s += G.adesivo('PIONEIRO!', 620, 430, lt - 2.0, { cor: '#1f9d57', rot: -5 });
    if (id.startsWith('3p')) {
      const pj = tl.projetos[p.projeto];
      s += G.cartaoProjeto({ n: pj.n, cliente: pj.cliente, frente: pj.frente, erp: pj.erp, logo: pj.logo, time: pj.time.map(x => tl.nomes[x]) }, 390, 290, t - mk.cartao, { fim: p.ate - mk.cartao - 0.3 });
      s += G.antesDepois(1480, 240, t - mk.antes, { w: 600, h: 217, tOrg: mk.depois - mk.antes, fim: p.ate - mk.antes - 0.3 });
    }
    if (id === '3g') {
      const quadros = tl.projetos.map(pj => `<rect width="1920" height="1080" fill="#efe2c8"/>${LUGAR[pj.lugar](1150, 900, 9, { escala: 1.35 })}${logo(pj.logo, 520, 300, 150, 640)}`);
      s += P.mosaico(lt, quadros, { rotulos: tl.projetos.map(pj => pj.cliente) });
    }
    if (id === '3h') s += G.totais(lt, { tempos: mk.itens.map(x => x - p.de) });
    if (id.startsWith('4s')) s += G.chip(p.texto, 960, 118, lt - 0.5, { solido: true, cor: '#0c2f57', h: 64 });
    if (id === '4e') s += G.adesivo(p.texto[0], 960, 420, lt - 0.2, { cor: '#6b6f7e', rot: -4 }) + G.adesivo(p.texto[1], 960, 600, lt - 1.3, { cor: '#1f9d57', rot: 3 });
    if (id === '4f') { const a = ator(q, 'vinicius'); if (a) s += G.terceiroInferior('Vinicius de Sousa', '', 70, 130, lt - 0.6, {}); }
    if (id === '5a') s += G.numeroHeroi('R$ 7 MILHÕES', 'NO FY26', 960, 450, t - mk.numero, { tam: 112 });
    if (id === '5b') s += G.numeroHeroi('R$ [X] MILHÕES', 'JÁ PREVISTOS PARA O FY27', 960, 450, lt, { tam: 84 });
    if (id === '5c') s += G.chip('VALOR PARA O CLIENTE', 480, 200, lt - 0.3, { icone: 'check', h: 60 }) + G.chip('CRESCIMENTO DO NOSSO NEGÓCIO', 1420, 200, t - mk.cresce, { icone: 'raio', h: 60 });
    if (id === '5d') s += G.mas_detalhe(lt, {});
    if (id === '5g' && t > mk.scratch - 0.05) s += G.riscoDisco(t - mk.scratch, { dur: 0.6 });
    if (id === '5h') s += G.bilhete('FY26', 'Antecipar algumas notas. Fala com a TOTVS.', 1380, 300, lt - 1.2, { rot: 3 });
    if (id === '5i' && t > mk.comemora) s += A.confete(t - mk.comemora, 5, {}) + G.adesivo('NFs ANTECIPADAS!', 960, 260, t - mk.comemora - 0.4, { cor: '#1f9d57', rot: -4 });
    if (id === '5j') s += G.tituloMissao('OPERAÇÃO COLLECTION ZERO DEFECT', t - mk.missao, {});
    if (id === '6c') {
      const tn = mk.numeros;
      s += G.chip('1 projeto na Unimed', 1360, 260, lt - 0.6, { icone: 'doc', h: 56 });
      s += G.chip('6 projetos', 1360, 360, t - tn, { icone: 'doc', h: 56 }) + G.chip('2 países', 1360, 450, t - tn - 0.5, { icone: 'globo', h: 56 });
      s += G.chip('R$ 7 milhões no FY26', 1360, 540, t - tn - 1.2, { icone: null, h: 56, solido: true, cor: '#1f9d57' });
      const f3 = tl.falas.find(f => f.id === 'c6_a3');
      if (f3) s += G.carimbo('MÉTODO E CONFIANÇA', 1360, 700, t - f3.de - 1.0, { cor: 'verde', icone: 'check' });
    }
    if (id === '6d') s += A.confete(lt, 9, {});
    if (id === '6e') s += G.lockupFinal(lt, {});
    // legendas
    for (const f of tl.falas) {
      if (t < f.de - 0.2 || t > f.ate + 0.6) continue;
      const narr = f.quem === 'Narrador';
      s += A.legenda(marcar(f), t, f.de, f.ate + 0.35, narr ? {} : { quem: f.quem, cor: COR_FALA[f.quem] ?? '#2b2b36' });
    }
    // chrome: marca, régua e capítulo (fora da crise, dos cartões de fase e do final)
    const chromeOn = !(p.cena === 1 && t < ini[1] + 8.4) && !id.endsWith('fase') && !['6e', '6f'].includes(id);
    if (chromeOn) {
      const c = CAPITULO[p.cena];
      s += A.regua(t, tl.dur, {}) + A.marca(9, {}) + A.pilulaCapitulo(c[0], c[1], c[2], t - ini[p.cena], {});
    }
    for (const c of [2, 3, 4, 5, 6]) s += A.transicao(t, ini[c] - 0.45, {});
    if (id === '6f' && t > mk.corte + 1.2) s += `<rect width="1920" height="1080" fill="#000" opacity="${n2(clamp((t - mk.corte - 1.2) / 0.3))}"/>`;
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
