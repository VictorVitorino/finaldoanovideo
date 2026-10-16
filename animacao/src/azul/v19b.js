// v19 · cenas 6 a 8: papéis complementares (Venn A&M × TOTVS), metodologia A&M · TMO (seis etapas) e TMO (três círculos).
// Os textos são os mesmos dos slides do v18; aqui viram frames desenhados e animados no padrão do cenário.
import { clamp, lerp, inv, ease, rng, tr, g, op, TAU } from '../core.js';
import { F, W, H, COR, T, OS, larg, logoImg, logoPilula, entra, sobe, quebra, fundo, vinheta, vidro, pilula, chipW, brilhoPonto, checkIco, pessoa, largPessoa, palavra, revela } from './base.js';

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
  const tAM = palavra('l16', 2), tProg = palavra('l16', 7), tMet = palavra('l16', 11), tCon = palavra('l16', 15), tTime = palavra('l16', -1);
  // mandala: dois anéis que se entrelaçam (TOTVS azul, A&M dourado), lente estreita só com o título da atuação conjunta,
  // itens de cada lado com folga das bordas, e os cinco itens da atuação conjunta numa fileira de chips embaixo
  const cxE = 770, cxD = 1150, cy = 520, R = 290, cxM = (cxE + cxD) / 2;
  const draw = ease.inOut(inv(0.15, 1.2, L));
  const lens = ease.out(inv(tMet - 0.2, tMet + 0.6, t));
  const time = ease.out(inv(tTime - 0.5, tTime + 0.2, t));
  const pulso = 0.5 + 0.5 * Math.sin(L * 2.2);
  let v = '';
  v += `<clipPath id="azLensE"><circle cx="${cxE}" cy="${cy}" r="${R}"/></clipPath><clipPath id="azLensD"><circle cx="${cxD}" cy="${cy}" r="${R}"/></clipPath>`;
  // discos suaves + anéis que se desenham
  v += op(draw, `<circle cx="${cxE}" cy="${cy}" r="${R}" fill="rgba(108,170,255,.10)"/><circle cx="${cxD}" cy="${cy}" r="${R}" fill="rgba(230,183,94,.08)"/>`);
  v += `<circle cx="${cxE}" cy="${cy}" r="${R}" fill="none" stroke="${COR.azulClaro}" stroke-width="3" opacity=".9" stroke-dasharray="${F(draw * TAU * R)} 3000" transform="rotate(-90 ${cxE} ${cy})"/>`;
  v += `<circle cx="${cxD}" cy="${cy}" r="${R}" fill="none" stroke="${COR.ouro2}" stroke-width="3" opacity=".9" stroke-dasharray="${F(draw * TAU * R)} 3000" transform="rotate(90 ${cxD} ${cy})"/>`;
  // entrelaçamento: o anel dourado passa por cima na metade de cima e por baixo na de baixo
  v += op(draw, `<g clip-path="url(#azLensE)"><circle cx="${cxD}" cy="${cy}" r="${R}" fill="rgba(90,130,210,${F(0.30 + 0.30 * lens + 0.12 * time * pulso)})"/></g>`);
  v += op(draw, `<path d="M${F(cxD - R)} ${cy} A${R} ${R} 0 0 1 ${F(cxD)} ${F(cy - R)}" fill="none" stroke="${COR.ouro2}" stroke-width="3" opacity=".9"/><path d="M${F(cxE)} ${F(cy + R)} A${R} ${R} 0 0 1 ${F(cxE + R)} ${cy}" fill="none" stroke="${COR.azulClaro}" stroke-width="3" opacity=".9"/>`);
  if (lens > 0) v += op(lens, `<g clip-path="url(#azLensE)"><circle cx="${cxD}" cy="${cy}" r="${R}" fill="none" stroke="${COR.ciano}" stroke-width="3"/></g><g clip-path="url(#azLensD)"><circle cx="${cxE}" cy="${cy}" r="${R}" fill="none" stroke="${COR.ciano}" stroke-width="3"/></g>`);
  // logos grandes nas laterais, fora dos anéis, com a descrição de cada lado
  const kl = sobe(L, 0.8, 0.5), kd = sobe(L, tProg - 0.2 - (t - L), 0.6);
  const LX = 290, RXl = 1630, LY = 290;
  v += op(kl, g(`translate(${LX} ${LY}) scale(${F(lerp(0.9, 1, kl))}) translate(${-LX} ${-LY})`, logoPilula('logo-totvs', LX, LY, 190, 64, 1)));
  v += op(kd, g(`translate(${RXl} ${LY}) scale(${F(lerp(0.9, 1, kd))}) translate(${-RXl} ${-LY})`, logoPilula('logo-alvarez-marsal', RXl, LY, 190, 64, 1)));
  v += revela(kl, 'C', 320, 54, T('Gestão Técnica, Funcional', LX, LY + 58, 14, { ...OS, w: 600, fill: COR.azulClaro }) + T('e AMS das Soluções', LX, LY + 77, 14, { ...OS, w: 600, fill: COR.azulClaro }), LX - 160, LY + 42);
  v += revela(kd, 'C', 320, 54, T('Gestão de Transformação', RXl, LY + 58, 14, { ...OS, w: 600, fill: COR.ouro2 }) + T('TMO (PMO + GMO)', RXl, LY + 77, 14, { ...OS, w: 600, fill: COR.ouro2 }), RXl - 160, LY + 42);
  v += op(kl * 0.6, `<line x1="${LX + 100}" y1="${LY}" x2="${F(cxE - R + 10)}" y2="${F(cy - 110)}" stroke="rgba(108,196,255,.35)" stroke-width="1.2" stroke-dasharray="3 6"/>`) + op(kd * 0.6, `<line x1="${RXl - 100}" y1="${LY}" x2="${F(cxD + R - 10)}" y2="${F(cy - 110)}" stroke="rgba(230,183,94,.35)" stroke-width="1.2" stroke-dasharray="3 6"/>`);
  // itens: ícone + até duas linhas (16 px); entram por máscara, cada lado do seu lado
  const item = (ico, l1, l2, x, y, k, lado, cor) => {
    const dx = lado < 0 ? 1 : -1, anchor = lado < 0 ? 'start' : 'end';
    const r = g(`translate(${F(x)} ${F(y)})`, `<circle r="17" fill="rgba(255,255,255,.08)" stroke="${cor}" stroke-width="1.5"/>` + glifo(ico, cor, 0.95))
      + T(l1, x + dx * 30, y + (l2 ? -3 : 6), 16, { ...OS, fill: '#fff', anchor }) + (l2 ? T(l2, x + dx * 30, y + 17, 16, { ...OS, fill: '#fff', anchor }) : '');
    return revela(k, lado < 0 ? 'E' : 'D', 300, 60, r, lado < 0 ? x - 24 : x - 276, y - 30);
  };
  const OFF = [48, 16, 0, 0, 16, 48];
  ESQ.forEach(([ico, l1, l2], i) => { const k = sobe(L, 0.55 + i * 0.12, 0.5); if (k > 0) v += item(ico, l1, l2, cxE - R + 74 + OFF[i], 355 + i * 66, k, -1, COR.azulClaro); });
  DIR.forEach(([ico, l1, l2], i) => { const k = sobe(L, tAM - 0.1 - (t - L) + i * 0.12, 0.5); if (k > 0) v += item(ico, l1, l2, cxD + R - 74 - OFF[i], 355 + i * 66, k, 1, COR.ouro2); });
  // lente: só o título da atuação conjunta (elo, duas linhas) e o subtítulo
  if (lens > 0) {
    const cab = g(`translate(${F(cxM)} ${F(cy - 78)}) scale(1.25)`, glifo('elo', '#fff', 1.1))
      + T('Atuação', cxM, cy - 30, 26, { w: 800, fill: '#fff' }) + T('Conjunta', cxM, cy + 2, 26, { w: 800, fill: '#fff' })
      + `<rect x="${F(cxM - 60)}" y="${F(cy + 20)}" width="120" height="1.5" fill="rgba(255,255,255,.4)"/>`
      + T('Refinamento', cxM, cy + 46, 14, { ...OS, w: 700, fill: COR.ciano }) + T('de Processos (MIT)', cxM, cy + 66, 14, { ...OS, w: 700, fill: COR.ciano });
    v += revela(lens, 'C', 220, 190, cab, cxM - 110, cy - 110);
  }
  // atuação conjunta: cinco chips numa fileira sob a mandala, ligados à lente
  const chipsY = cy + R + 44;
  const larguras = MEIO.map(tx => chipW(tx, 14) + 18), totalW = larguras.reduce((a, b) => a + b, 0) + 12 * 4;
  let cxC = 960 - totalW / 2;
  MEIO.forEach((tx, i) => {
    const k = ease.back(inv(tCon - 0.1 + i * 0.16, tCon + 0.3 + i * 0.16, t)); const w = larguras[i];
    if (k > 0) v += g(`translate(${F(cxC + w / 2)} ${F(chipsY)}) scale(${F(k)})`, `<rect x="${F(-w / 2)}" y="-17" width="${F(w)}" height="34" rx="17" fill="rgba(70,110,180,.35)" stroke="${COR.ciano}" stroke-width="1.3"/>` + checkIco(-w / 2 + 18, 0, 8, COR.ciano) + T(tx, -w / 2 + 34, 5, 14, { ...OS, fill: '#fff', anchor: 'start' }));
    cxC += w + 12;
  });
  const kc0 = ease.out(inv(tCon - 0.3, tCon + 0.1, t));
  if (kc0 > 0) v += `<line x1="${cxM}" y1="${F(cy + R - 12)}" x2="${cxM}" y2="${F(lerp(cy + R - 12, chipsY - 18, kc0))}" stroke="${COR.ciano}" stroke-width="2" stroke-dasharray="3 5"/>`;
  // partículas convergindo em "um único time"
  if (time > 0) { const r = rng(3); for (let j = 0; j < 40; j++) { const q = ((L * 0.6 + r()) % 1); const lado = j % 2 ? -1 : 1; const x0 = cxM + lado * (R + 160), y0 = cy + (r() - 0.5) * 2 * R; v += `<circle cx="${F(lerp(x0, cxM, q))}" cy="${F(lerp(y0, cy, q))}" r="${F(1.5 + 2 * (1 - q))}" fill="${lado < 0 ? COR.azulClaro : COR.ouro2}" opacity="${F(time * (1 - q) * 0.9)}"/>`; } }
  // título pequeno no topo + subtítulo do framework
  const kt = sobe(L, 0.1, 0.6);
  const titulo = g(`translate(960 76) scale(${F(0.66 * lerp(0.94, 1, kt))})`, vidro(-290, -48, 580, 96, { r: 20, brilho: 0.35 + 0.5 * time, corBrilho: COR.ouro }) + T('UM TIME', -256, -16, 13, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 4 }) + T('PAPÉIS COMPLEMENTARES', -256, 22, 32, { w: 900, fill: '#fff', anchor: 'start' }) + g('translate(250 0)', `<path d="M0 -14 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" fill="${COR.ouro}" opacity="${F(0.6 + 0.4 * pulso)}"/>`));
  v += op(kt, titulo);
  v += op(sobe(L, tMet - 0.2 - (t - L), 0.6), T('FRAMEWORK A&M × TOTVS · VISÃO INTEGRADA', 960, 130, 12, { w: 800, fill: COR.ouro2, ls: 5 }));
  s += v;
  const hm = 560;
  s += pessoa('totvs_boy', 136, 1120, hm, L, { halo: COR.azul, haloA: 0.1 });
  s += pessoa('am_boy', 1787, 1120, hm, L, { halo: COR.laranja, haloA: 0.1 });
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
  v += op(ks, `<rect x="36" y="260" width="156" height="92" rx="10" fill="rgba(24,52,104,.85)" stroke="rgba(255,255,255,.25)"/>` + g('translate(114 286)', glifo('grafico', '#fff', 1.1)) + T('METODOLOGIA', 114, 322, 12, { w: 800, fill: '#fff', ls: 1.5 }) + T('A&M', 114, 340, 12, { w: 800, fill: '#fff', ls: 1.5 }));
  v += op(ks, T('PRINCIPAIS', 36, 428, 13, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 2 }) + T('FOCOS A&M', 36, 448, 13, { w: 800, fill: COR.ouro2, anchor: 'start', ls: 2 }));
  v += op(ks, T('CONEXÃO E', 36, 686, 13, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 2 }) + T('ATUAÇÃO', 36, 706, 13, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 2 }) + T('CONJUNTA', 36, 726, 13, { w: 800, fill: COR.azulClaro, anchor: 'start', ls: 2 }));
  // linha pontilhada de conexão com fluxo
  const fluxo = ease.out(inv(tCond - 0.2, tCond + 0.6, t));
  v += op(ks, `<line x1="${ex(0)}" y1="610" x2="${F(ex(5) + MW + 20)}" y2="610" stroke="rgba(108,196,255,.55)" stroke-width="2" stroke-dasharray="2 7"/><path d="M${F(ex(5) + MW + 20)} 604 l10 6 l-10 6 Z" fill="${COR.azulClaro}"/>`);
  // energia correndo pela linha até a etapa ativa (antes do fluxo geral)
  if (ativo >= 0 && fluxo < 1) for (let j = 0; j < 6; j++) { const q = ((L * 0.35 + j / 6) % 1); v += `<circle cx="${F(lerp(ex(0), ex(ativo) + MW / 2, q))}" cy="610" r="2.5" fill="${COR.ciano}" opacity="${F(0.5 * (1 - fluxo))}"/>`; }
  if (fluxo > 0) for (let j = 0; j < 14; j++) { const q = ((L * 0.22 + j / 14) % 1); v += `<circle cx="${F(lerp(ex(0), ex(5) + MW, q))}" cy="610" r="3" fill="#fff" opacity="${F(fluxo * 0.9)}"/>`; }
  // varredura final "da definição dos processos à gestão da mudança"
  const var1 = inv(tDef - 0.1, tMud + 0.3, t);
  ETAPAS.forEach((e, i) => {
    const x = ex(i);
    const on = t >= ini[i] - 0.05, ac = ease.out(inv(ini[i] - 0.05, ini[i] + 0.4, t));
    const isAtivo = ativo === i && geral < 0.5;
    const varre = var1 > 0 && var1 < 1 ? Math.max(0, 1 - Math.abs(var1 * 6.5 - (i + 0.5)) * 1.2) : 0;
    const brilho = isAtivo ? 1 : varre;
    const ent = ease.out(inv(0.2 + i * 0.06, 0.7 + i * 0.06, L));
    // burst ao acender a etapa
    const ub = clamp(inv(ini[i] - 0.05, ini[i] + 0.55, t));
    if (ub > 0 && ub < 1) v += `<circle cx="${F(x + MW / 2)}" cy="306" r="${F(30 + 150 * ub)}" fill="none" stroke="${COR.ciano}" stroke-width="2.5" opacity="${F(0.7 * (1 - ub))}"/>`;
    // chevron
    const d = `M${x} 260 H${x + MW - 22} L${x + MW} 306 L${x + MW - 22} 352 H${x} ${i ? `L${x + 22} 306 Z` : 'Z'}`;
    v += op(ent, `<path d="${d}" fill="${on ? `rgba(31,72,150,${F(0.75 + 0.25 * ac)})` : 'rgba(18,42,88,.55)'}" stroke="${on ? COR.azulClaro : 'rgba(255,255,255,.22)'}" stroke-width="${on ? 2 : 1.2}"/>`);
    if (brilho > 0) v += `<path d="${d}" fill="${COR.ciano}" opacity="${F(0.22 * brilho)}" filter="url(#azBrilhoP)"/>`;
    v += op(ent, g(`translate(${F(x + 44)} 290) scale(${F(isAtivo ? 1 + 0.08 * Math.sin(L * 5) : 1)})`, glifo(e.ico, on ? '#fff' : 'rgba(255,255,255,.55)', 1.1)));
    v += op(ent, T(e.n + ' ' + e.t[0], x + 70, 303, 13, { w: 800, fill: on ? '#fff' : 'rgba(255,255,255,.6)', anchor: 'start', ls: 0.8 }) + T(e.t[1], x + 70 + larg(e.n + ' ', 13, 800), 320, 13, { w: 800, fill: on ? '#fff' : 'rgba(255,255,255,.6)', anchor: 'start', ls: 0.8 }));
    // focos
    let y = 428;
    e.focos.forEach((f, j) => {
      const k = on ? ease.out(inv(ini[i] + 0.15 + j * 0.13, ini[i] + 0.5 + j * 0.13, t)) : 0;
      const lins = quebra(f, 15, 'os', MW - 40, 400);
      if (k > 0) { v += op(k, g(tr(-6 * (1 - k), 0), `<circle cx="${x + 8}" cy="${y - 5}" r="3" fill="${COR.ouro}"/>` + lins.map((l, q) => T(l, x + 22, y + q * 19, 15, { ...OS, w: 400, fill: '#fff', anchor: 'start' })).join(''))); }
      else v += op(ent * 0.35, `<circle cx="${x + 8}" cy="${y - 5}" r="3" fill="rgba(255,255,255,.4)"/>` + lins.map((l, q) => `<rect x="${x + 22}" y="${F(y + q * 19 - 11)}" width="${F(larg(l, 15, 400, 'os'))}" height="9" rx="4" fill="rgba(255,255,255,.14)"/>`).join(''));
      y += 19 * lins.length + 7;
    });
    // elo e caixa da conexão
    const kc = on ? ease.back(inv(ini[i] + 0.3, ini[i] + 0.8, t)) : 0;
    v += op(ent, g(`translate(${F(x + MW / 2)} 610)`, (isAtivo ? `<circle r="21" fill="none" stroke="${COR.ciano}" stroke-width="1.5" stroke-dasharray="4 6" transform="rotate(${F((L * 90) % 360)})" opacity=".8"/>` : '') + `<circle r="13" fill="rgba(7,17,42,.9)" stroke="${on ? COR.azulClaro : 'rgba(108,196,255,.4)'}" stroke-width="2"/>` + glifo('elo', on ? COR.azulClaro : 'rgba(108,196,255,.5)', 0.7)));
    const lins = quebra(e.conj, 15, 'os', MW - 36, 600);
    const bo = on ? 1 : 0.4;
    v += op(ent * bo, `<rect x="${x}" y="650" width="${MW}" height="104" rx="10" fill="${on ? 'rgba(24,52,104,.85)' : 'rgba(18,42,88,.5)'}" stroke="${on ? `rgba(108,196,255,${F(0.5 + 0.5 * brilho)})` : 'rgba(255,255,255,.18)'}" stroke-width="${1.2 + brilho}"/>`
      + (on ? lins.map((l, q) => op(kc, T(l, x + MW / 2, 702 - (lins.length - 1) * 10 + q * 20, 15, { ...OS, w: 400, fill: '#fff' }))).join('') : ''));
    if (kc > 0 && kc < 1) v += `<line x1="${F(x + MW / 2)}" y1="623" x2="${F(x + MW / 2)}" y2="${F(lerp(623, 650, kc))}" stroke="${COR.azulClaro}" stroke-width="2"/>`;
    else if (on) v += `<line x1="${F(x + MW / 2)}" y1="623" x2="${F(x + MW / 2)}" y2="650" stroke="${COR.azulClaro}" stroke-width="2"/>`;
  });
  // faixa de luz da varredura
  if (var1 > 0 && var1 < 1) { const xx = lerp(ex(0), ex(5) + MW, var1); v += `<rect x="${F(xx - 30)}" y="250" width="60" height="530" fill="#fff" opacity=".07" filter="url(#azBrilho)"/>`; }
  // brilho geral em "metodologias integradas e papéis complementares"
  const int = Math.sin(clamp(inv(tInt, tInt + 1.6, t)) * Math.PI);
  if (int > 0) v += `<rect x="${ex(0) - 10}" y="250" width="${F(6 * (MW + MG) + 10)}" height="530" rx="16" fill="none" stroke="${COR.ciano}" stroke-width="2" opacity="${F(0.6 * int)}"/>`;
  s += g(`translate(960 470) scale(${F(cam[2])}) translate(${F(-cam[0])} ${F(-cam[1])})`, v);
  s += op(kt, T('METODOLOGIA INTEGRADA A&M E TOTVS', 960, 58 - 8 * (1 - kt), 22, { w: 800, fill: '#fff', ls: 5 }) + T('6 FASES, E UMA ÚNICA JORNADA', 960, 86 - 8 * (1 - kt), 14, { w: 800, fill: COR.ouro2, ls: 4 }));
  return s + vinheta(0.55);
}

// ------------------------------------------------------------------ CENA 8 · TMO (TRÊS CÍRCULOS)
export function tmo(L, t, dur) {
  let s = fundo(t);
  const tTudo = palavra('l19', 0), tQ = palavra('l19', 5), tP = palavra('l19', 6), tR = palavra('l19', 8), tNeg = palavra('l19', -1);
  const C = [[960, 400, '#3f6aa0', 'Mapeamento', 'de processos', 0.05], [800, 640, '#0f2d5a', 'Implantação', '', 0.3], [1120, 640, '#8ea2bd', 'Gestão de', 'Mudanças', 0.55]];
  const R = 232;
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
    v += op(clamp((k - 0.55) / 0.4), g(`translate(${cx} ${cy}) scale(${F(Math.min(k, 1.03))}) translate(${-cx} ${-cy}) translate(${F(tx)} ${F(ty)}) rotate(${ang})`, T(l1, 0, l2 ? -8 : 10, 30, { w: 800, fill: i === 2 ? '#0b1a38' : '#fff' }) + (l2 ? T(l2, 0, 26, 30, { w: 800, fill: i === 2 ? '#0b1a38' : '#fff' }) : '')));
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
  if (neg > 0) { const rp = lerp(130, 300, clamp(inv(tNeg - 0.3, tNeg + 1.2, t))); v += `<circle cx="960" cy="548" r="${F(rp)}" fill="none" stroke="${COR.ouro}" stroke-width="3" opacity="${F(0.55 * neg)}"/>`; }
  s += g(`translate(960 560) scale(${F(1 + 0.03 * ease.inOut(inv(0, dur, L)))}) translate(-960 -560)`, v);
  return s + vinheta(0.6);
}
