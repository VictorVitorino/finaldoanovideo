// v19 · cenas 6 a 8: papéis complementares (Venn A&M × TOTVS), metodologia A&M · TMO (seis etapas) e TMO (três círculos).
// Os textos são os mesmos dos slides do v18; aqui viram frames desenhados e animados no padrão do cenário.
import { clamp, lerp, inv, ease, rng, tr, g, op, TAU } from '../core.js';
import { F, W, H, COR, T, OS, larg, logoImg, logoPilula, entra, sobe, quebra, fundo, vinheta, vidro, pilula, brilhoPonto, checkIco, pessoa, largPessoa, palavra } from './base.js';

// glifos simples (traço branco) para listas
function glifo(n, cor = '#fff', s = 1) {
  const st = `stroke="${cor}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const m = {
    config: `<path d="M-9 -6 h18 M-9 0 h18 M-9 6 h18" ${st}/><circle cx="-3" cy="-6" r="2.5" fill="${cor}"/><circle cx="4" cy="0" r="2.5" fill="${cor}"/><circle cx="-1" cy="6" r="2.5" fill="${cor}"/>`,
    code: `<path d="M-5 -7 l-7 7 l7 7 M5 -7 l7 7 l-7 7 M2 -10 l-4 20" ${st}/>`,
    teste: `<rect x="-8" y="-9" width="16" height="19" rx="3" ${st}/><path d="M-4 -9 v-2 h8 v2 M-4 1 l3 3 l6 -6" ${st}/>`,
    doc: `<path d="M-7 -10 h9 l5 5 v15 h-14 Z M2 -10 v5 h5 M-3 0 h7 M-3 5 h7" ${st}/>`,
    suporte: `<path d="M-9 2 a9 9 0 0 1 18 0 M-9 2 v5 h3 v-6 h-3 M9 2 v5 h-3 v-6 h3 M6 8 q-2 4 -6 4" ${st}/>`,
    ia: `<rect x="-8" y="-6" width="16" height="13" rx="3" ${st}/><path d="M0 -6 v-4 M-4 -1 h0 M4 -1 h0 M-3 3 h6" ${st}/><circle cx="-4" cy="-1" r="1.3" fill="${cor}"/><circle cx="4" cy="-1" r="1.3" fill="${cor}"/>`,
    pessoas: `<circle cx="-5" cy="-5" r="4" ${st}/><circle cx="6" cy="-3" r="3.5" ${st}/><path d="M-13 9 q8 -10 16 0 M2 8 q5 -6 10 0" ${st}/>`,
    mudanca: `<path d="M-10 -3 h16 l-4 -4 M10 3 h-16 l4 4" ${st}/>`,
    parceiro: `<circle cx="0" cy="-6" r="4" ${st}/><path d="M-9 10 q9 -12 18 0" ${st}/><path d="M6 -10 l3 3" ${st}/>`,
    alvo: `<circle r="9" ${st}/><circle r="4.5" ${st}/><circle r="1.2" fill="${cor}"/>`,
    grafico: `<path d="M-9 9 h18 M-6 9 v-6 M0 9 v-11 M6 9 v-15" ${st}/>`,
    governanca: `<circle cx="-5" cy="-5" r="4" ${st}/><circle cx="6" cy="-3" r="3.5" ${st}/><path d="M-13 9 q8 -10 16 0 M2 8 q5 -6 10 0" ${st}/>`,
    mapa: `<path d="M-10 -7 l7 -3 l6 3 l7 -3 v17 l-7 3 l-6 -3 l-7 3 Z M-3 -10 v17 M3 -7 v17" ${st}/>`,
    foguete: `<path d="M0 -11 q6 6 3 15 h-6 q-3 -9 3 -15 Z M-3 4 l-4 4 M3 4 l4 4" ${st}/><circle r="2" cy="-2" fill="${cor}"/>`,
    monitor: `<rect x="-10" y="-8" width="20" height="13" rx="2" ${st}/><path d="M-4 9 h8 M0 5 v4 M-6 1 l3 -3 l3 3 l4 -5" ${st}/>`,
    elo: `<path d="M-2 -2 a5 5 0 0 0 -7 0 l-3 3 a5 5 0 0 0 7 7 l2 -2 M2 2 a5 5 0 0 0 7 0 l3 -3 a5 5 0 0 0 -7 -7 l-2 2 M-3 3 l6 -6" ${st}/>`,
  };
  return g(`scale(${F(s)})`, m[n] ?? m.alvo);
}

// ------------------------------------------------------------------ CENA 6 · PAPÉIS COMPLEMENTARES
const ESQ = [['config', 'Configuração', 'da Solução'], ['code', 'Desenvolvimento', 'e Customizações'], ['teste', 'Testes Técnicos', 'e Funcionais'], ['doc', 'Documentação', 'Funcional e Técnica'], ['suporte', 'Suporte e Operação', 'da Solução'], ['ia', 'Aceleradores, IA', 'e Automação']];
const DIR = [['governanca', 'Governança e Gestão', 'Integrada (TMO)'], ['mudanca', 'Gestão de Mudança', 'e Adoção (GMO)'], ['parceiro', 'IT Business Partner', ''], ['alvo', 'Gestão de Riscos e', 'Qualidade'], ['grafico', 'Metodologias, Processos', 'e Melhores Práticas'], ['ia', 'Aceleradores, IA', 'e Automação']];
const MEIO = ['Planejamento e Priorização', 'Testes Integrados e Aceites', 'Preparação para Cutover', 'Estabilização e Ondas Futuras', 'Tomada de Decisão e Priorização'];

export function papeis(L, t, dur) {
  let s = fundo(t);
  const tAM = palavra('l16', 2), tProg = palavra('l16', 7), tMet = palavra('l16', 11), tTMO = palavra('l16', 14), tCon = palavra('l16', 15), tTime = palavra('l16', -1);
  const cxE = 800, cxD = 1120, cy = 556, R = 300;   // lente com 280 px de largura: os itens da atuação conjunta cabem dentro dela
  const draw = ease.inOut(inv(0.15, 1.2, L));
  const lens = ease.out(inv(tMet - 0.2, tMet + 0.6, t));
  const time = ease.out(inv(tTime - 0.5, tTime + 0.2, t));
  const pulso = 0.5 + 0.5 * Math.sin(L * 2.2);
  let v = '';
  // discos
  v += `<clipPath id="azLensE"><circle cx="${cxE}" cy="${cy}" r="${R}"/></clipPath>`;
  v += `<circle cx="${cxE}" cy="${cy}" r="${R}" fill="rgba(176,204,240,.14)" stroke="rgba(214,226,247,.85)" stroke-width="2.5" stroke-dasharray="${F(draw * TAU * R)} 3000" transform="rotate(-90 ${cxE} ${cy})"/>`;
  v += `<circle cx="${cxD}" cy="${cy}" r="${R}" fill="rgba(17,46,100,.55)" stroke="rgba(214,226,247,.85)" stroke-width="2.5" stroke-dasharray="${F(draw * TAU * R)} 3000" transform="rotate(90 ${cxD} ${cy})"/>`;
  v += op(draw, `<g clip-path="url(#azLensE)"><circle cx="${cxD}" cy="${cy}" r="${R}" fill="rgba(70,110,180,${F(0.35 + 0.35 * lens + 0.15 * time * pulso)})"/></g>`);
  if (lens > 0) v += op(lens, `<g clip-path="url(#azLensE)"><circle cx="${cxD}" cy="${cy}" r="${R}" fill="none" stroke="${COR.ciano}" stroke-width="3"/></g>` + `<circle cx="${cxE}" cy="${cy}" r="${R}" fill="none" stroke="${COR.ciano}" stroke-width="3" clip-path="url(#azLensD)"/>` + `<clipPath id="azLensD"><circle cx="${cxD}" cy="${cy}" r="${R}"/></clipPath>`);
  // logos nos topos
  const kl = entra(L, 0.9, 0.5);
  v += op(clamp(kl * 2), logoPilula('logo-totvs', cxE - 40, cy - R + 22, 120, 46, kl) + logoPilula('logo-alvarez-marsal', cxD + 40, cy - R + 22, 120, 46, kl));
  // itens da esquerda (TOTVS) e da direita (A&M)
  const item = (ico, l1, l2, x, y, k, lado, cor) => {
    const dx = lado < 0 ? 1 : -1, anchor = lado < 0 ? 'start' : 'end';
    let r = g(`translate(${F(x)} ${F(y)}) scale(${F(k)})`, `<circle r="17" fill="rgba(255,255,255,.08)" stroke="${cor}" stroke-width="1.5"/>` + glifo(ico, cor, 0.95));
    r += op(clamp(k * 1.4), T(l1, x + dx * 30, y + (l2 ? -2 : 6), 18, { ...OS, fill: '#fff', anchor }) + (l2 ? T(l2, x + dx * 30, y + 19, 18, { ...OS, fill: '#fff', anchor }) : ''));
    return r;
  };
  const OFF = [46, 12, 0, 0, 12, 46];
  ESQ.forEach(([ico, l1, l2], i) => { const k = entra(L, 0.6 + i * 0.14, 0.5); if (k > 0) v += item(ico, l1, l2, cxE - R + 75 + OFF[i], 372 + i * 74, k, -1, COR.azulClaro); });
  DIR.forEach(([ico, l1, l2], i) => { const k = entra(L, tAM - 0.1 - (t - L) + i * 0.14, 0.5); if (k > 0) v += item(ico, l1, l2, cxD + R - 75 - OFF[i], 372 + i * 74, k, 1, COR.ouro2); });
  // arcos com rótulos
  const arcE = op(sobe(L, 0.9, 0.6), `<path id="azArcE" d="M${F(cxE - R - 38)} ${cy} A${R + 38} ${R + 38} 0 0 0 ${F(cxE)} ${F(cy + R + 38)}" fill="none"/><text font-family="Outfit" font-weight="800" font-size="20" fill="${COR.ouro2}" letter-spacing="1"><textPath href="#azArcE" startOffset="2%">Gestão Técnica, Funcional e AMS das Soluções</textPath></text>`);
  const arcD = op(sobe(L, tProg - 0.2 - (t - L), 0.6), `<path id="azArcD" d="M${F(cxD)} ${F(cy - R - 38)} A${R + 38} ${R + 38} 0 0 1 ${F(cxD)} ${F(cy + R + 38)}" fill="none"/><text font-family="Outfit" font-weight="800" font-size="20" fill="${COR.ouro2}" letter-spacing="1"><textPath href="#azArcD" startOffset="22%">Gestão de Transformação TMO (PMO + GMO)</textPath></text>`);
  v += arcE + arcD;
  // atuação conjunta (lente)
  const cxM = (cxE + cxD) / 2;
  if (lens > 0) {
    v += op(lens, g(tr(0, 10 * (1 - lens)), g(`translate(${F(cxM - 12)} 421)`, glifo('elo', '#fff', 1.1)) + T('Atuação', cxM + 16, 428, 22, { w: 800, fill: '#fff', anchor: 'start' }) + T('Conjunta', cxM, 458, 22, { w: 800, fill: '#fff' })
      + T('Refinamento de', cxM, 496, 17, { ...OS, w: 700, fill: '#fff' }) + T('Processos (MIT)', cxM, 518, 17, { ...OS, w: 700, fill: '#fff' })));
    MEIO.forEach((tx, i) => { const k = entra(L, tCon - 0.1 - (t - L) + i * 0.22, 0.45); if (k > 0) v += g(`translate(${F(cxM - 114)} ${F(538 + i * 27)}) scale(${F(k)})`, checkIco(0, 0, 8, COR.ciano)) + op(clamp(k * 1.4), T(tx, cxM - 100, 543 + i * 27, 13, { ...OS, fill: '#fff', anchor: 'start' })); });
  }
  // partículas convergindo em "um único time"
  if (time > 0) { const r = rng(3); for (let j = 0; j < 40; j++) { const q = ((L * 0.6 + r()) % 1); const lado = j % 2 ? -1 : 1; const x0 = cxM + lado * (R + 160), y0 = cy + (r() - 0.5) * 2 * R; v += `<circle cx="${F(lerp(x0, cxM, q))}" cy="${F(lerp(y0, cy, q))}" r="${F(1.5 + 2 * (1 - q))}" fill="${lado < 0 ? COR.azulClaro : COR.ouro2}" opacity="${F(time * (1 - q) * 0.9)}"/>`; } }
  // título e rodapé
  const kt = entra(L, 0.1, 0.6);
  const titulo = g(`translate(960 128) scale(${F(lerp(0.9, 1 + 0.03 * time * pulso, kt))})`, vidro(-290, -48, 580, 96, { r: 20, brilho: 0.35 + 0.5 * time, corBrilho: COR.ouro }) + T('UM TIME', -256, -16, 13, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 4 }) + T('PAPÉIS COMPLEMENTARES', -256, 22, 32, { w: 900, fill: '#fff', anchor: 'start' }) + g('translate(250 0)', `<path d="M0 -14 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" fill="${COR.ouro}" opacity="${F(0.6 + 0.4 * pulso)}"/>`));
  v += op(clamp(kt * 2), titulo);
  v += op(sobe(L, tTime - 0.3 - (t - L), 0.6), T('FRAMEWORK A&M × TOTVS · VISÃO INTEGRADA', 960, 912, 15, { w: 800, fill: COR.ouro2, ls: 6 }));
  // câmera: leve aproximação na lente durante "metodologia ... conecta"
  const z = lens * (1 - ease.inOut(inv(tTime - 0.2, tTime + 0.6, t)));
  s += g(`translate(960 560) scale(${F(1 + 0.06 * z)}) translate(${F(-960)} ${F(-560)})`, v);
  // mascotes nas laterais
  const hm = 520, em = entra(L, 0.2, 0.7), ea = entra(L, 0.35, 0.7);
  s += g(tr(-330 * (1 - em), 0), pessoa('totvs_boy', 20 + largPessoa('totvs_boy', hm) / 2, 1120, hm, L, { halo: COR.azul, haloA: 0.1 }));
  s += g(tr(330 * (1 - ea), 0), pessoa('am_boy', 1900 - largPessoa('am_boy', hm) / 2, 1115, hm, L, { halo: COR.laranja, haloA: 0.1, fase: 1.7 }));
  return s + vinheta(0.6);
}

// ------------------------------------------------------------------ CENA 7 · METODOLOGIA A&M · TMO
const ETAPAS = [
  { n: '1.', t: ['PLANEJAMENTO E', 'MOBILIZAÇÃO'], ico: 'pessoas', focos: ['Governança do projeto', 'Planejamento integrado', 'Riscos e comunicação', 'Estruturação de recursos'], conj: 'Alinhamento de objetivos, governança e plano integrado do projeto' },
  { n: '2.', t: ['DESENHO E', 'PREPARAÇÃO'], ico: 'mapa', focos: ['Mapeamento e processos', 'Requisitos (MIT)', 'Governança da solução', 'Priorização e escopo', 'Plano de testes'], conj: 'Refinamento de processos e requisitos com validação conjunta' },
  { n: '3.', t: ['DESENVOLVIMENTO E', 'CONFIGURAÇÃO'], ico: 'code', focos: ['Acompanhamento dos recursos', 'Gestão de backlog', 'Qualidade e aderência', 'Riscos e issues', 'Integração de frentes'], conj: 'Acompanhamento da construção e aderência à solução' },
  { n: '4.', t: ['TESTES E', 'VALIDAÇÕES'], ico: 'teste', focos: ['Estratégia de testes', 'Preparação de cenários e massa de testes', 'Execução e evidências', 'Gestão de defeitos', 'Critérios de aceite'], conj: 'Execução conjunta de testes integrados e aceite' },
  { n: '5.', t: ['CUTOVER E', 'PRONTIDÃO'], ico: 'foguete', focos: ['Planejamento de cutover', 'Prontidão e treinamentos', 'Comunicação e transição', 'Critérios de go/no-go', 'Coordenação geral'], conj: 'Preparação conjunta para a entrada em operação' },
  { n: '6.', t: ['ESTABILIZAÇÃO E', 'OPERAÇÃO ASSISTIDA'], ico: 'monitor', focos: ['Operação assistida', 'Gestão de incidentes', 'Correções e melhorias', 'Monitoramento e KPIs', 'Lições aprendidas'], conj: 'Estabilização, suporte e evolução contínua da solução' },
];
const MX0 = 206, MW = 276, MG = 8;   // chevrons
const ex = i => MX0 + i * (MW + MG);

export function metodologia(L, t, dur) {
  let s = fundo(t, { bokeh: 0.9 });
  const ini = [0, 3, 6, 9, 12, 15].map(i => palavra('l17', i));
  const tInt = palavra('l18', 0), tCond = palavra('l18', 6), tDef = palavra('l18', 16), tMud = palavra('l18', -1);
  let ativo = -1; for (let i = 0; i < 6; i++) if (t >= ini[i] - 0.2) ativo = i;
  const geral = ease.inOut(inv(tInt - 0.4, tInt + 0.5, t));   // volta à visão geral
  // câmera: acompanha a etapa narrada (as outras saem de quadro) e volta à visão geral em "metodologias integradas"
  let cam = [960, 470, 1];
  if (ativo >= 0) {
    const a0 = ini[ativo] - 0.2, u = ease.inOut(inv(a0, a0 + 0.7, t));
    const foco = i => 960 + (ex(i) + MW / 2 - 960) * 0.78;
    const px = ativo > 0 ? foco(ativo - 1) : 960, cx = foco(ativo);
    const sx = ativo > 0 ? 1.18 : 1;
    const c = [lerp(px, cx, u), 470, lerp(sx, 1.18, u)];
    cam = [lerp(c[0], 960, geral), 470, lerp(c[2], 1, geral)];
  }
  let v = '';
  const kt = sobe(L, 0.05, 0.5);
  // selo METODOLOGIA A&M
  const ks = sobe(L, 0.2, 0.5);
  v += op(ks, `<rect x="36" y="150" width="156" height="92" rx="10" fill="rgba(24,52,104,.85)" stroke="rgba(255,255,255,.25)"/>` + g('translate(114 176)', glifo('grafico', '#fff', 1.1)) + T('METODOLOGIA', 114, 212, 12, { w: 800, fill: '#fff', ls: 1.5 }) + T('A&M', 114, 230, 12, { w: 800, fill: '#fff', ls: 1.5 }));
  v += op(ks, T('PRINCIPAIS', 36, 318, 13, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 2 }) + T('FOCOS A&M', 36, 338, 13, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 2 }));
  v += op(ks, T('CONEXÃO E', 36, 672, 13, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 2 }) + T('ATUAÇÃO', 36, 692, 13, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 2 }) + T('CONJUNTA', 36, 712, 13, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 2 }));
  // linha pontilhada de conexão com fluxo
  const fluxo = ease.out(inv(tCond - 0.2, tCond + 0.6, t));
  v += op(ks, `<line x1="${ex(0)}" y1="596" x2="${F(ex(5) + MW + 20)}" y2="596" stroke="rgba(108,196,255,.55)" stroke-width="2" stroke-dasharray="2 7"/><path d="M${F(ex(5) + MW + 20)} 590 l10 6 l-10 6 Z" fill="${COR.azulClaro}"/>`);
  if (fluxo > 0) for (let j = 0; j < 14; j++) { const q = ((L * 0.22 + j / 14) % 1); v += `<circle cx="${F(lerp(ex(0), ex(5) + MW, q))}" cy="596" r="3" fill="#fff" opacity="${F(fluxo * 0.9)}"/>`; }
  // varredura final "da definição dos processos à gestão da mudança"
  const var1 = inv(tDef - 0.1, tMud + 0.3, t);
  ETAPAS.forEach((e, i) => {
    const x = ex(i);
    const on = t >= ini[i] - 0.05, ac = ease.out(inv(ini[i] - 0.05, ini[i] + 0.4, t));
    const isAtivo = ativo === i && geral < 0.5;
    const varre = var1 > 0 && var1 < 1 ? Math.max(0, 1 - Math.abs(var1 * 6.5 - (i + 0.5)) * 1.2) : 0;
    const brilho = isAtivo ? 1 : varre;
    const ent = ease.out(inv(0.2 + i * 0.06, 0.7 + i * 0.06, L));
    // chevron
    const d = `M${x} 150 H${x + MW - 22} L${x + MW} 196 L${x + MW - 22} 242 H${x} ${i ? `L${x + 22} 196 Z` : 'Z'}`;
    v += op(ent, `<path d="${d}" fill="${on ? `rgba(31,72,150,${F(0.75 + 0.25 * ac)})` : 'rgba(18,42,88,.55)'}" stroke="${on ? COR.azulClaro : 'rgba(255,255,255,.22)'}" stroke-width="${on ? 2 : 1.2}"/>`);
    if (brilho > 0) v += `<path d="${d}" fill="${COR.ciano}" opacity="${F(0.22 * brilho)}" filter="url(#azBrilhoP)"/>`;
    v += op(ent, g(`translate(${F(x + 44)} 180)`, glifo(e.ico, on ? '#fff' : 'rgba(255,255,255,.55)', 1.1)));
    v += op(ent, T(e.n + ' ' + e.t[0], x + 70, 193, 13, { w: 800, fill: on ? '#fff' : 'rgba(255,255,255,.6)', anchor: 'start', ls: 0.8 }) + T(e.t[1], x + 70 + larg(e.n + ' ', 13, 800), 210, 13, { w: 800, fill: on ? '#fff' : 'rgba(255,255,255,.6)', anchor: 'start', ls: 0.8 }));
    // focos
    let y = 318;
    e.focos.forEach((f, j) => {
      const k = on ? ease.out(inv(ini[i] + 0.15 + j * 0.13, ini[i] + 0.5 + j * 0.13, t)) : 0;
      const lins = quebra(f, 15, 'os', MW - 40, 400);
      if (k > 0) { v += op(k, g(tr(-6 * (1 - k), 0), `<circle cx="${x + 8}" cy="${y - 5}" r="3" fill="${COR.ouro}"/>` + lins.map((l, q) => T(l, x + 22, y + q * 19, 15, { ...OS, w: 400, fill: '#fff', anchor: 'start' })).join(''))); }
      else v += op(ent * 0.35, `<circle cx="${x + 8}" cy="${y - 5}" r="3" fill="rgba(255,255,255,.4)"/>` + lins.map((l, q) => `<rect x="${x + 22}" y="${F(y + q * 19 - 11)}" width="${F(larg(l, 15, 400, 'os'))}" height="9" rx="4" fill="rgba(255,255,255,.14)"/>`).join(''));
      y += 19 * lins.length + 7;
    });
    // elo e caixa da conexão
    const kc = on ? ease.back(inv(ini[i] + 0.3, ini[i] + 0.8, t)) : 0;
    v += op(ent, g(`translate(${F(x + MW / 2)} 596)`, `<circle r="13" fill="rgba(7,17,42,.9)" stroke="${on ? COR.azulClaro : 'rgba(108,196,255,.4)'}" stroke-width="2"/>` + glifo('elo', on ? COR.azulClaro : 'rgba(108,196,255,.5)', 0.7)));
    const lins = quebra(e.conj, 15, 'os', MW - 36, 600);
    const bo = on ? 1 : 0.4;
    v += op(ent * bo, `<rect x="${x}" y="640" width="${MW}" height="104" rx="10" fill="${on ? 'rgba(24,52,104,.85)' : 'rgba(18,42,88,.5)'}" stroke="${on ? `rgba(108,196,255,${F(0.5 + 0.5 * brilho)})` : 'rgba(255,255,255,.18)'}" stroke-width="${1.2 + brilho}"/>`
      + (on ? lins.map((l, q) => op(kc, T(l, x + MW / 2, 692 - (lins.length - 1) * 10 + q * 20, 15, { ...OS, w: 400, fill: '#fff' }))).join('') : ''));
    if (kc > 0 && kc < 1) v += `<line x1="${F(x + MW / 2)}" y1="609" x2="${F(x + MW / 2)}" y2="${F(lerp(609, 640, kc))}" stroke="${COR.azulClaro}" stroke-width="2"/>`;
    else if (on) v += `<line x1="${F(x + MW / 2)}" y1="609" x2="${F(x + MW / 2)}" y2="640" stroke="${COR.azulClaro}" stroke-width="2"/>`;
  });
  // faixa de luz da varredura
  if (var1 > 0 && var1 < 1) { const xx = lerp(ex(0), ex(5) + MW, var1); v += `<rect x="${F(xx - 30)}" y="140" width="60" height="620" fill="#fff" opacity=".07" filter="url(#azBrilho)"/>`; }
  // brilho geral em "metodologias integradas e papéis complementares"
  const int = Math.sin(clamp(inv(tInt, tInt + 1.6, t)) * Math.PI);
  if (int > 0) v += `<rect x="${ex(0) - 10}" y="140" width="${F(6 * (MW + MG) + 10)}" height="620" rx="16" fill="none" stroke="${COR.ciano}" stroke-width="2" opacity="${F(0.6 * int)}"/>`;
  s += g(`translate(960 470) scale(${F(cam[2])}) translate(${F(-cam[0])} ${F(-cam[1])})`, v);
  s += op(kt, T('METODOLOGIA A&M  ·  TMO  ·  SEIS ETAPAS, UM SÓ TIME', 960, 70 - 8 * (1 - kt), 22, { w: 800, fill: '#fff', ls: 5 }));
  return s + vinheta(0.55);
}

// ------------------------------------------------------------------ CENA 8 · TMO (TRÊS CÍRCULOS)
export function tmo(L, t, dur) {
  let s = fundo(t);
  const tTudo = palavra('l19', 0), tQ = palavra('l19', 5), tP = palavra('l19', 6), tR = palavra('l19', 8), tNeg = palavra('l19', -1);
  const C = [[960, 400, '#3f6aa0', 'Mapeamento', 'de processos', 0.05], [800, 640, '#0f2d5a', 'Implantação', '', 0.3], [1120, 640, '#8ea2bd', 'Gestão de', 'Mudanças', 0.55]];
  const R = 232;
  const kl = sobe(L, 0.1, 0.5);
  s += op(kl, logoImg('alvarez-marsal-branco', 880, 96, 60, 110) + `<rect x="958" y="72" width="1.5" height="48" fill="rgba(255,255,255,.4)"/>` + logoImg('totvs-branco', 1050, 97, 34, 120));
  let v = '';
  // anel pontilhado girando
  v += `<circle cx="960" cy="560" r="${F(R * 1.9)}" fill="none" stroke="rgba(108,196,255,.18)" stroke-width="1.5" stroke-dasharray="4 14" transform="rotate(${F(L * 6)} 960 560)"/>`;
  C.forEach(([cx, cy, cor, l1, l2, t0], i) => {
    const k = ease.back(inv(t0, t0 + 0.7, L));
    if (k <= 0) return;
    const a = ((i * 120) + L * 20) * Math.PI / 180;
    v += g(`translate(${cx} ${cy}) scale(${F(k)})`, `<circle r="${R}" fill="${cor}" opacity=".78"/><circle r="${R}" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2.5"/>`
      + `<circle r="${F(R - 10)}" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="1"/>`
      + `<circle cx="${F(Math.cos(a) * R)}" cy="${F(Math.sin(a) * R)}" r="4" fill="#fff" opacity=".8"/>`);
    const ang = i === 0 ? -28 : i === 1 ? 62 : -62;
    const tx = i === 0 ? cx - 20 : i === 1 ? cx - 110 : cx + 110, ty = i === 0 ? cy - 120 : cy + 90;
    v += op(clamp(k * 1.3), g(`translate(${F(tx)} ${F(ty)}) rotate(${ang})`, T(l1, 0, l2 ? -8 : 10, 30, { w: 800, fill: i === 2 ? '#0b1a38' : '#fff' }) + (l2 ? T(l2, 0, 26, 30, { w: 800, fill: i === 2 ? '#0b1a38' : '#fff' }) : '')));
  });
  const kc = ease.back(inv(0.95, 1.55, L)), pul = 1 + 0.02 * Math.sin(L * 3);
  v += g(`translate(960 548) scale(${F(kc * pul)})`, `<circle r="130" fill="#fff" opacity=".25" filter="url(#azBrilho)"/><circle r="118" fill="#eef3fb"/><circle r="118" fill="none" stroke="#fff" stroke-width="3"/>` + T('TMO', 0, 22, 62, { w: 900, fill: '#0b2a5c', ls: 2 }));
  // rodapé que acende com a narração
  const pal = [['QUALIDADE', tQ], ['PREVISIBILIDADE', tP], ['RESULTADOS REAIS', tR]];
  const sizes = pal.map(([p]) => larg(p, 17, 800) + 17 * 5), total = sizes.reduce((a, b) => a + b, 0) + 2 * 70;
  let x = 960 - total / 2;
  pal.forEach(([p, t0], i) => {
    const k = ease.out(inv(t0 - 0.1, t0 + 0.4, t));
    v += op(0.25 + 0.75 * k, T(p, x + sizes[i] / 2, 930, 17, { w: 800, fill: COR.ouro2, ls: 5 }));
    if (k > 0 && k < 1) v += `<rect x="${F(x)}" y="910" width="${F(sizes[i])}" height="28" rx="6" fill="${COR.ouro}" opacity="${F(0.25 * Math.sin(k * Math.PI))}"/>`;
    x += sizes[i];
    if (i < 2) { v += op(0.25 + 0.75 * k, `<circle cx="${F(x + 35)}" cy="925" r="3" fill="${COR.ouro2}"/>`); x += 70; }
  });
  const neg = Math.sin(clamp(inv(tNeg - 0.3, tNeg + 1.2, t)) * Math.PI);
  if (neg > 0) v += `<circle cx="960" cy="560" r="${F(R * 1.85)}" fill="none" stroke="${COR.ouro}" stroke-width="3" opacity="${F(0.5 * neg)}"/>`;
  s += g(`translate(960 560) scale(${F(1 + 0.03 * ease.inOut(inv(0, dur, L)))}) translate(-960 -560)`, v);
  return s + vinheta(0.6);
}
