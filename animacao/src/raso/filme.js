// Vídeo "Além do raso" (página inicial do blog Change Management World): 16:9, 1920 x 1080, 30 fps, até 1:30.
// Um mundo só, visto por uma câmera: a sala de reunião à noite, a mesa que é a linha d'água e o iceberg embaixo dela.
// A câmera mergulha, recua para mostrar o bloco inteiro, volta à tona para o choque do projeto, mergulha de novo para
// mapear e quebrar o gelo e sobe com os pedaços, que viram caminho.
//
// Tempos: src/raso/tempos.json (gerado por producao/raso_audio.py a partir da narração do ElevenLabs, voz Dani).
// Render: node render.mjs frames --page raso.html --w 1920 --h 1080 --test filme --out build/raso/frames --workers 3
import { W, H, C, clamp, lerp, inv, ease, kf, n2, rng, TAU, txt, tRico, olho, larg, tracar, anel, icone, marca, opa, mover, sobe, desliza, fin, fout, janela, back, mix } from './base.js';
import { WL, sala, veu, agua, raios, particulas, bolhas, superficie, PEDACOS, CENTRO, RACHAS, deslocamento, pedaco, contornoBloco, haloBloco, rachadura, lascas, pedra, ponto, barco, planilha, sonda, pulso, feixe, reflexo } from './mundo.js';
const f = n2;

// ---------- o que aparece escrito na tela (em px de tela) ----------
export const FATORES = [
  { id: 'sentido', marca: 'entende', n: '01', titulo: 'Sentido', sub: 'o que cada pessoa entende', lado: 'e', x: 640, y: 330, anc: [690, 1010] },
  { id: 'crencas', marca: 'acredita', n: '02', titulo: 'Crenças', sub: 'no que ela acredita', lado: 'd', x: 1290, y: 470, anc: [1260, 1180] },
  { id: 'perdas', marca: 'medo', n: '03', titulo: 'Perdas', sub: 'o que tem medo de perder', lado: 'e', x: 640, y: 560, anc: [640, 1560] },
  { id: 'habitos', marca: 'habitos', n: '04', titulo: 'Hábitos', sub: 'o jeito de anos', lado: 'd', x: 1290, y: 700, anc: [1330, 1800] },
  { id: 'confianca', marca: 'confianca', n: '05', titulo: 'Confiança', sub: 'em quem lidera', lado: 'e', x: 640, y: 800, anc: [860, 2260] },
];
export const MAPEAR = [
  { id: 'impactados', marca: 'quem', ic: 'pontos', titulo: 'Quem é impactado', y: 500 },
  { id: 'impactos', marca: 'muda', ic: 'troca', titulo: 'O que muda para cada um', y: 590 },
  { id: 'resistencia', marca: 'onde', ic: 'alvo', titulo: 'Onde está a resistência', y: 680 },
];
export const QUEBRAR = [
  { id: 'q-sentido', ev: 'racha1', marca: 'sentido', ic: 'megafone', titulo: 'Sentido', sub: 'o porquê, na voz de quem lidera', y: 490 },
  { id: 'q-pratica', ev: 'racha2', marca: 'pratica', ic: 'ciclo', titulo: 'Prática', sub: 'aprender no trabalho real', y: 630 },
  { id: 'q-medida', ev: 'racha3', marca: 'medida', ic: 'grafico', titulo: 'Medida', sub: 'uso de verdade, semana a semana', y: 770 },
];
const COL = 110;   // margem esquerda da coluna de texto
const CAPS = { sala: '01 · A ponta', mergulho: '02 · Abaixo da linha', fatores: '02 · Abaixo da linha', choque: '03 · Onde o projeto bate', mapear: '04 · Como a gente trabalha', quebrar: '04 · Como a gente trabalha', caminho: '05 · O gelo vira caminho', fecho: '' };
// ordem dos pedaços da esquerda para a direita: é a ordem das pedras na superfície
const ORD_X = PEDACOS.map((p, i) => [p.c[0], i]).sort((a, b) => a[0] - b[0]).map(q => q[1]);
const POS_X = i => 428 + ORD_X.indexOf(i) * 152;

export function buildFilme(T) {
  const ev = T.eventos, cn = T.cenas, TOTAL = T.duracao;
  const m = nome => { if (!T.marcas[nome]) throw new Error('marca desconhecida: ' + nome); return T.marcas[nome].a; };
  const mb = nome => T.marcas[nome].b;
  const cenaEm = t => { let c = T.ordem[0]; for (const id of T.ordem) if (t >= cn[id]) c = id; return c; };

  // ---------- câmera: [instante, [cx, cy, zoom], curva do trecho que termina ali] ----------
  const CAM = [
    [0, [960, 520, 1.0]],
    [cn.mergulho + 0.35, [960, 536, 1.06], ease.sine],
    [cn.mergulho + 2.6, [960, 1210, 0.92], ease.inOut],
    [ev.recuo, [960, 1232, 0.9], ease.linear],
    [ev.recuo + 1.35, [960, 1650, 0.4], ease.inOut],
    [cn.choque, [960, 1668, 0.415], ease.linear],
    [cn.choque + 1.5, [800, 830, 0.95], ease.inOut],
    [ev.descida, [826, 836, 0.965], ease.linear],
    [ev.descida + 1.7, [960, 1620, 0.46], ease.inOut],
    [ev.subida, [960, 1600, 0.48], ease.linear],
    [ev.subida + 3.0, [960, 690, 0.92], ease.inOut],
    [cn.fecho, [960, 684, 0.93], ease.linear],
    [cn.fecho + 2.4, [960, 560, 1.0], ease.inOut],
    [TOTAL, [960, 552, 1.02], ease.linear],
  ];
  const tremor = (t, t0, amp) => { const a = t - t0; return a <= 0 || a > 0.7 ? 0 : amp * Math.exp(-a * 7) * Math.sin(a * 62); };
  function camera(t) {
    const [cx, cy, z] = kf(t, CAM);
    const tx = tremor(t, ev.batida, 9) + tremor(t, ev.racha1, 7) + tremor(t, ev.racha2, 8) + tremor(t, ev.racha3, 9);
    return { cx: cx + tx, cy: cy + tx * 0.6, z };
  }
  const tela = (cam, wx, wy) => [960 + (wx - cam.cx) * cam.z, 540 + (wy - cam.cy) * cam.z];

  // ---------- estado do gelo ----------
  const golpes = t => [0, 1, 2].map(g => { const t0 = ev['racha' + (g + 1)]; return t < t0 ? 0 : back(t, t0, 0.6); });
  const subidaDe = (t, i) => ease.inOut(inv(ev.subida + 0.1 * (7 - ORD_X.indexOf(i)) * 0.5 + PEDACOS[i].c[1] / 9000, ev.subida + 2.5 + PEDACOS[i].c[1] / 9000, t));

  function gelo(t) {
    const u = golpes(t), quebrado = u[0] > 0;
    // clarão do feixe (sentido) nos pedaços de cima, do toque das pessoas (prática) no meio e da leitura (medida) embaixo
    const brilhoDe = id => {
      let b = 0;
      if ('ABC'.includes(id)) b += 0.55 * janela(t, ev.racha1 - 0.5, ev.racha1 + 0.9, 0.3);
      if ('DE'.includes(id)) b += 0.4 * janela(t, ev.racha2 - 0.35, ev.racha2 + 0.7, 0.25);
      if ('FGH'.includes(id)) b += 0.4 * janela(t, ev.racha3 - 0.35, ev.racha3 + 0.7, 0.25);
      if (id === 'B') b += 0.5 * janela(t, ev.batida - 0.02, ev.batida + 0.8, 0.05);                         // o barco bate aqui
      if (id === 'E') b += 0.32 * (0.6 + 0.4 * Math.sin((t - m('onde')) * 5)) * janela(t, m('onde') - 0.1, cn.quebrar + 0.4, 0.4);   // onde está a resistência
      return b;
    };
    let s = '', pedras = '';
    PEDACOS.forEach((p, i) => {
      const d0 = deslocamento(p.id, u), solto = Math.min(1, u['ABC'.includes(p.id) ? 0 : 'DE'.includes(p.id) ? 1 : 2]), us = subidaDe(t, i);
      const d = [d0[0] + Math.cos(t * 0.7 + i * 2.1) * 4 * solto, d0[1] + Math.sin(t * 0.9 + i * 1.3) * 6 * solto];   // solto, o pedaço boia
      if (us <= 0) { s += pedaco(p, { dx: d[0], dy: d[1], brilho: brilhoDe(p.id), borda: quebrado ? 0.5 : 0 }); return; }
      // sobe: do lugar no bloco até a superfície, encolhendo; perto do fim, troca de forma e vira pedra
      const xa = p.c[0] + d[0], ya = p.c[1] + d[1], xb = POS_X(i), yb = WL + 10;
      const x = lerp(xa, xb, ease.inOut(inv(0.15, 1, us))), y = lerp(ya, yb, us), esc = lerp(1, 0.2, us);
      const troca = inv(0.62, 0.9, us);
      if (troca < 1) s += pedaco(p, { dx: x - p.c[0], dy: y - p.c[1], esc, rot: (ORD_X.indexOf(i) % 2 ? 1 : -1) * 14 * us, o: 1 - troca, borda: 0.5 });
      if (troca > 0) {
        const o = ORD_X.indexOf(i), clique = Math.sin(clamp((t - (ev.encaixe + 0.11 * o)) / 0.3) * Math.PI) * 12;
        const boia = Math.sin(t * 1.5 + o * 1.3) * 3 * inv(0.9, 1, us);
        pedras += opa(troca, pedra(x, y - clique + boia, 0.75 + 0.25 * troca, o));
      }
      if (us < 1) s += bolhas(t, ev.subida + 0.2 + i * 0.13, xa, ya, { n: 6, seed: 60 + i, larg: 120, d: 1.8, janela: 1.4 });
    });
    return { s, pedras, u, quebrado };
  }

  // ---------- cenas (em coordenadas de mundo) ----------
  // sonar e marcações do mapeamento
  const SONDA = [1790, 1250];
  const GENTE = (() => { const r = rng(55), out = []; PEDACOS.forEach((p, i) => { const n = 'BDF'.includes(p.id) ? 7 : p.id === 'A' || p.id === 'H' ? 3 : 5; for (let k = 0; k < n; k++) { const a = r() * TAU, d = 30 + r() * 105; out.push({ x: p.c[0] + Math.cos(a) * d * 1.2, y: p.c[1] + Math.sin(a) * d, i, peso: 0.6 + r() * 1.1, ordem: r() }); } }); return out; })();
  function mapeamento(t) {
    if (t < ev.descida || t > ev.subida + 0.4) return '';
    const sai = fout(t, cn.quebrar - 0.25, 0.5), u = golpes(t);
    let s = '';
    // divisas tracejadas: aparecem com o primeiro pulso e ficam até a rachadura de cada grupo
    const ud = inv(m('mapeia') + 0.25, m('mapeia') + 1.9, t);
    RACHAS.forEach((r, i) => { const o = 1 - inv(ev['racha' + (r.grupo + 1)] - 0.25, ev['racha' + (r.grupo + 1)], t); const pede = inv(m('quebra') - 0.1, m('partes') + 0.3, t), bate = 0.5 + 0.5 * Math.sin((t - m('quebra')) * 9 - i); if (ud > 0 && o > 0) s += tracar(r.d, clamp(ud * 1.4 - i * 0.07), { c: '#fff', sw: 3.5 + 3.5 * pede * bate, o: (0.85 + 0.15 * pede) * o, extra: 'stroke-dasharray="0.014 0.022"' }) + (pede > 0 ? tracar(r.d, 1, { c: C.suave, sw: 14, o: 0.35 * pede * bate * o, extra: 'filter="url(#f-b10)"' }) : ''); });
    // pessoas impactadas: pontos que nascem em cada pedaço; com "o que muda", cada ponto ganha o tamanho do seu impacto
    const tq = m('quem'), tm = m('muda');
    for (const g of GENTE) {
      const k = back(t, tq + 0.08 + g.ordem * 0.9, 0.4) * sai;
      if (k <= 0.001) continue;
      const d = deslocamento(PEDACOS[g.i].id, u), peso = lerp(1, g.peso, ease.out(inv(tm + g.ordem * 0.6, tm + g.ordem * 0.6 + 0.5, t)));
      s += `<circle cx="${f(g.x + d[0])}" cy="${f(g.y + d[1])}" r="${f(9 * k * peso)}" fill="${C.navy}" stroke="#fff" stroke-width="3"/>`;
    }
    // onde está a resistência: alvo sobre o pedaço mais duro
    const to = m('onde'), ko = back(t, to, 0.5) * sai, pe = PEDACOS[4];
    if (ko > 0.001) s += anel(pe.c[0], pe.c[1], (t - to) % 1.6, { d: 1.6, r0: 40, r1: 190, c: '#fff', sw: 6, o: 0.8 * sai })
      + `<circle cx="${f(pe.c[0])}" cy="${f(pe.c[1])}" r="${f(74 * ko)}" fill="none" stroke="#fff" stroke-width="6"/><circle cx="${f(pe.c[0])}" cy="${f(pe.c[1])}" r="${f(16 * ko)}" fill="#fff"/>`;
    // sonda e pulsos
    const ks = fin(t, ev.descida + 0.9, 0.6) * sai;
    if (ks > 0.001) {
      const ys = lerp(WL + 60, SONDA[1], ease.out(inv(ev.descida + 0.7, ev.descida + 2.0, t)));
      s += sonda(SONDA[0], ys, t, ks);
      for (const nome of ['mapeia', 'quem', 'muda', 'onde']) s += pulso(SONDA[0], ys, t - (m(nome) - 0.05));
    }
    return s;
  }
  // os três golpes: sentido (feixe do alto), prática (pontos que tocam o gelo) e medida (régua que sobe)
  function golpesFx(t) {
    if (t < cn.quebrar || t > ev.subida + 1.2) return '';
    let s = '';
    // alvo que pulsa no centro do bloco enquanto a fala pede para quebrar (no site, é aqui que o player espera o toque)
    const ka = janela(t, m('quebra'), ev.racha1 - 0.1, 0.3);
    if (ka > 0.001) for (let i = 0; i < 2; i++) s += anel(CENTRO[0], 1250, (t - m('quebra') + i * 0.7) % 1.4, { d: 1.4, r0: 30, r1: 210, c: '#fff', sw: 7, o: 0.75 * ka });
    s += feixe(960, 1420, janela(t, ev.racha1 - 0.55, ev.racha1 + 1.3, 0.35), t);
    // prática: pontos em volta do meio do bloco, cada um dá o seu toque
    const r = rng(77), t2 = ev.racha2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + r() * 0.3, x = 985 + Math.cos(a) * 560, y = 1330 + Math.sin(a) * 300, tt = t2 - 0.75 + i * 0.07;
      const k = back(t, tt, 0.35) * fout(t, t2 + 1.1, 0.5);
      if (k <= 0.001) continue;
      const vai = Math.sin(clamp((t - (t2 - 0.12 + (i % 4) * 0.03)) / 0.3) * Math.PI) * 46;
      s += ponto(x - Math.cos(a) * vai, y - Math.sin(a) * vai + 30, 2.5 * k, 0.9, 'gelo') + anel(x - Math.cos(a) * 60, y - Math.sin(a) * 60, t - t2 - (i % 4) * 0.03, { d: 0.7, r0: 6, r1: 60, c: '#fff', sw: 4 });
    }
    // medida: uma régua com marcas sobe pela base do bloco
    const t3 = ev.racha3, km = janela(t, t3 - 0.7, t3 + 1.2, 0.3);
    if (km > 0.001) {
      const y = lerp(2720, 1960, ease.inOut(inv(t3 - 0.7, t3 + 0.35, t)));
      let marcas = '';
      for (let x = 380; x <= 1600; x += 61) marcas += `<path d="M${x} ${f(y)}v${(x - 380) % 244 === 0 ? -34 : -18}" stroke="#fff" stroke-width="4"/>`;
      s += opa(km, `<path d="M340 ${f(y)}H1640" stroke="#fff" stroke-width="5"/>${marcas}<path d="M340 ${f(y)}H1640" stroke="${C.suave}" stroke-width="18" opacity=".5" filter="url(#f-b10)"/>`);
    }
    for (let g = 0; g < 3; g++) { const t0 = ev['racha' + (g + 1)]; s += rachadura(g, ease.out(inv(t0 - 0.05, t0 + 0.45, t)), fout(t, t0 + 0.9, 1.2)) + lascas(g, t - t0) + bolhas(t, t0 + 0.1, CENTRO[0], [1100, 1560, 2100][g], { n: 12, seed: 20 + g, larg: 700, d: 2.2 }); }
    return s;
  }
  // o choque: o barco de papel navega, bate no gelo raso e os pontos (quem usa) voltam para as planilhas
  const XB0 = 150, XB1 = 552;
  function barcoEm(t) {
    if (t < cn.choque + 0.2) return { x: XB0, rot: Math.sin(t * 1.1) * 1.8, y: WL - 12 + Math.sin(t * 0.9 + 1) * 1.6 };
    if (t < ev.batida) return { x: lerp(XB0, XB1, inv(cn.choque + 0.2, ev.batida, t)), rot: -1.5 + Math.sin(t * 3) * 1.5, y: WL - 12 + Math.sin(t * 2.6) * 3 };
    if (t < ev.encaixe + 0.5) { const a = t - ev.batida; return { x: XB1 - 16 * Math.exp(-a * 3) * Math.abs(Math.sin(a * 6)), rot: -5 - 9 * Math.exp(-a * 2.4) * Math.cos(a * 8), y: WL - 12 + 4 * Math.exp(-a * 2) }; }
    const u = ease.inOut(inv(ev.encaixe + 0.5, ev.chegada + 2.2, t));   // gelo quebrado: o projeto segue viagem
    return { x: lerp(XB1, 1500, u), rot: lerp(-5, 0, clamp(u * 4)) + Math.sin(t * 2.4) * 1.4, y: WL - 12 + Math.sin(t * 2.2) * 3 };
  }
  const JANG = [[396, 0], [262, 1], [128, 2]], LUGAR = [[42, 0], [61, 1], [80, 2]];
  function tona(t, cam) {
    let s = '';
    const b = barcoEm(t), kj = fout(t, ev.racha3 + 0.5, 2.2);
    // planilhas que boiam atrás do barco
    const deriva = Math.min(26, Math.max(0, t - ev.pulo - 1)) * 9;
    if (kj > 0.001 && t > ev.pulo - 0.6) JANG.forEach(([x, j]) => { const k = back(t, ev.pulo - 0.55 + j * 0.12, 0.5); s += opa(kj, planilha(x - deriva, WL - 4 + Math.sin(t * 2 + j) * 3 + (1 - k) * 60, -7 + j * 5 + Math.sin(t * 1.3 + j) * 2, 0.9 * clamp(k))); });
    {
      s += barco(b.x, b.y, b.rot, fin(t, ev.no_ar, 0.5));
      if (t > ev.batida && t < ev.batida + 1.2) s += anel(b.x + 70, WL + 18, t - ev.batida, { d: 1.1, r0: 10, r1: 150, c: '#fff', sw: 6 });
      // quem usa: pontos no convés até o pulo; depois, cada um na sua planilha
      if (kj > 0.001) LUGAR.forEach(([dx, j], i) => {
        const tp = ev.pulo + i * 0.16, u = inv(tp, tp + 0.5, t), x0 = b.x + dx, y0 = b.y - 2;
        const x1 = JANG[j][0] - deriva, y1 = WL - 38;
        if (u <= 0) s += ponto(x0, y0, 0.75);
        else s += opa(kj, ponto(lerp(x0, x1, ease.inOut(u)), lerp(y0, y1, u) - Math.sin(u * Math.PI) * 70, 0.75, 0.7 + 0.3 * Math.sin(clamp(u) * Math.PI)));
      });
    }
    return s;
  }
  // o caminho: as pedras alinhadas, os cais e a travessia
  function caminhoFx(t) {
    if (t < ev.subida + 1.2) return '';
    const k = fin(t, ev.subida + 1.6, 0.9);
    let s = '';
    const cais = (x0, x1) => `<rect x="${x0}" y="${WL - 20}" width="${x1 - x0}" height="24" rx="4" fill="${C.navy3}" stroke="${C.suave}" stroke-width="2.5"/>` + [0.25, 0.75].map(u => `<rect x="${f(lerp(x0, x1, u) - 7)}" y="${WL + 4}" width="14" height="150" fill="${C.navy2}"/>`).join('');
    s += opa(k, cais(-300, 330) + cais(1596, 2300));
    // bandeira da chegada
    const kb = back(t, ev.chegada, 0.6);
    s += opa(k, `<path d="M1700 ${WL - 20}V${WL - 190}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`)
      + (kb > 0.001 ? `<g transform="translate(1702 ${WL - 188}) scale(${f(kb)} 1)"><path d="M0 0h168l-22 26 22 26H0z" fill="#fff"/>${txt('ROTINA', 74, 36, { w: 700, s: 27, c: C.navy, a: 'middle', ls: 2 })}</g>` : '');
    // travessia: seis pontos pulam de pedra em pedra; cada pouso deixa um anel na pedra
    const paradas = [250, ...ORD_X.map((_, o) => 428 + o * 152), 1640];
    for (let j = 0; j < 6; j++) {
      const t0 = ev.travessia2 + j * 0.3, passo = 0.22, n = paradas.length - 1, x0 = 300 - j * 34, xf = 1626 + j * 36;
      const u = clamp((t - t0) / (passo * n)) * n, i = Math.min(n - 1, Math.floor(u)), fr = u - i;
      const xa = i === 0 ? x0 : paradas[i], xb = i === n - 1 ? xf : paradas[i + 1];
      const x = t < t0 ? x0 : u >= n ? xf : lerp(xa, xb, ease.inOut(fr)), salto = t < t0 || u >= n ? 0 : Math.sin(fr * Math.PI) * 54;
      s += opa(k, (t >= t0 && u < n && i >= 1 ? anel(xa, WL - 18, fr * passo, { d: 0.22, r0: 6, r1: 40, c: '#fff', sw: 3.5, o: 0.9 }) : '') + ponto(x, WL - 22 - salto, 1.3));
    }
    return s;
  }

  // ---------- textos em px de tela ----------
  function rotulo(q, k, cam, t, t0) {
    if (k <= 0.001) return '';
    const e = q.lado === 'e', a = e ? 'end' : 'start', [ax, ay] = tela(cam, q.anc[0], q.anc[1]);
    const xl = q.x + (e ? 18 : -18), yl = q.y - 16;
    let s = tracar(`M${f(xl)} ${f(yl)}L${f(ax)} ${f(ay)}`, ease.inOut(inv(t0 + 0.05, t0 + 0.5, t)), { c: '#fff', sw: 2.5, o: 0.7 })
      + anel(ax, ay, (t - t0) % 2, { d: 2, r0: 8, r1: 44, c: '#fff', sw: 4, o: 0.8 }) + `<circle cx="${f(ax)}" cy="${f(ay)}" r="${f(9 * back(t, t0, 0.4))}" fill="#fff" stroke="${C.azul}" stroke-width="4"/>`;
    s += sobe(k, olho(q.n, q.x, q.y - 54, { s: 21, a, ls: 3 }) + txt(q.titulo, q.x, q.y, { f: 'N', w: 500, s: 54, a }) + txt(q.sub, q.x, q.y + 40, { s: 26, c: '#C9D7F5', a }), 24);
    return s;
  }
  function textos(t, cam, id) {
    let s = '';
    // sala: a ponta e a superfície
    if (t < cn.mergulho + 1.2) {
      const kp = janela(t, m('ponta') - 0.1, cn.mergulho + 0.9, 0.4), [px, py] = tela(cam, 962, 596);
      if (kp > 0.001) s += opa(kp, tracar(`M${f(px - 6)} ${f(py - 4)}L${f(px - 118)} ${f(py - 44)}`, inv(m('ponta') - 0.1, m('ponta') + 0.3, t), { c: '#fff', sw: 2.5 }) + txt('a ponta do iceberg', px - 130, py - 40, { f: 'N', it: true, s: 36, a: 'end' }));
      const ks = janela(t, m('superficie') - 0.3, cn.mergulho + 0.9, 0.4), [, sy] = tela(cam, 0, WL);
      if (ks > 0.001) s += opa(ks, olho('Superfície', COL, sy + 62, { s: 22 }) + tracar(`M${COL} ${f(sy + 78)}h220`, inv(m('superficie') - 0.3, m('superficie') + 0.3, t), { c: C.suave, sw: 3 }));
    }
    // mergulho: a frase da virada
    const kd = janela(t, m('abaixo') - 0.15, ev.recuo + 0.25, 0.4);
    if (kd > 0.001) s += opa(kd, sobe(fin(t, m('abaixo') - 0.15, 0.6), txt('abaixo', COL, 720, { f: 'N', it: true, s: 92 }) + txt('da linha', COL, 818, { f: 'N', it: true, s: 92 }) + txt('d’água', COL, 916, { f: 'N', it: true, s: 92 }), 40));
    // fatores invisíveis
    if (t > cn.fatores - 0.2 && t < cn.choque + 0.6) {
      const sai = fout(t, cn.choque - 0.25, 0.5), t0 = cn.fatores + 0.15;
      s += opa(sai, sobe(fin(t, t0, 0.6), olho('Abaixo da linha d’água', 1290, 250, { s: 21 }) + txt('Fatores invisíveis', 1290, 322, { f: 'N', w: 500, s: 64 }), 26));
      for (const q of FATORES) { const tq = m(q.marca) - 0.12; s += opa(sai, rotulo(q, fin(t, tq, 0.5), cam, t, tq)); }
    }
    // mapear e quebrar: coluna da esquerda
    if (t > ev.descida + 1.0 && t < ev.subida + 0.6) {
      const emQuebra = t >= cn.quebrar - 0.1, sai = fout(t, ev.subida - 0.1, 0.5);
      const cab = (n, tit, t0, t1) => opa(janela(t, t0, t1, 0.4), sobe(fin(t, t0, 0.6), olho('Como a gente trabalha', COL, 300, { s: 21 }) + txt(n, COL, 368, { f: 'N', it: true, s: 52, c: C.suave }) + txt(tit, COL + 54, 368, { f: 'N', w: 500, s: 52 }), 26));
      s += cab('1.', 'Mapear o gelo', m('mapeia') - 0.4, cn.quebrar + 0.1) + cab('2.', 'Quebrar em partes', cn.quebrar + 0.25, ev.subida + 0.4);
      if (!emQuebra || t < cn.quebrar + 0.5) for (const q of MAPEAR) {
        const tq = m(q.marca) - 0.1, k = fin(t, tq, 0.5) * fout(t, cn.quebrar - 0.15, 0.4);
        if (k > 0.001) s += desliza(k, `<circle cx="${COL + 30}" cy="${q.y - 11}" r="30" fill="rgba(255,255,255,.1)" stroke="${C.suave}" stroke-width="2"/>${icone(q.ic, COL + 30, q.y - 11, 34, { u: inv(tq, tq + 0.6, t), sw: 3 })}` + txt(q.titulo, COL + 80, q.y, { w: 500, s: 34 }), -30);
      }
      for (const q of QUEBRAR) {
        const tq = m(q.marca) - 0.15, k = fin(t, tq, 0.5) * sai;
        if (k > 0.001) s += desliza(k, `<circle cx="${COL + 36}" cy="${q.y - 4}" r="36" fill="#fff"/>${icone(q.ic, COL + 36, q.y - 4, 40, { u: inv(tq, tq + 0.6, t), c: C.navy, sw: 3.4 })}` + txt(q.titulo, COL + 96, q.y, { f: 'N', w: 500, s: 50 }) + txt(q.sub, COL + 96, q.y + 38, { s: 25, c: '#C9D7F5' }), -30);
      }
    }
    return s;
  }
  // marca no canto, etiqueta do capítulo e o cartão final
  function interface_(t, id) {
    const kf_ = fin(t, ev.assinatura - 0.35, 0.8);
    let s = `<rect width="${W}" height="${H}" fill="url(#g-vinheta)"/>`;
    const topo = marca(84, 76, 28);
    s += opa((1 - kf_) * fin(t, 0.5, 0.8), topo);
    const cap = CAPS[id];
    if (cap) {
      const t0 = Object.entries(CAPS).find(([, v]) => v === cap)[0], k = fin(t, cn[t0] + 0.3, 0.5) * (1 - kf_), w = larg(cap, 20, { w: 600, ls: 1.2 }) + 44;
      s += opa(k, `<rect x="${f(W - 70 - w)}" y="52" width="${f(w)}" height="44" rx="22" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>` + txt(cap, W - 70 - w / 2, 81, { w: 600, s: 20, a: 'middle', ls: 1.2 }));
    }
    if (kf_ > 0.001) {
      const t0 = ev.assinatura;
      s += `<rect width="${W}" height="${H}" fill="${C.fundo}" opacity="${f(0.84 * kf_)}"/>`
        + opa(fin(t, t0 - 0.2, 0.6), marca(960, 318, 44))
        + sobe(fin(t, t0 - 0.1, 0.6), olho('Change Management World', 960, 412, { s: 22, a: 'middle', ls: 5 }), 20)
        + sobe(fin(t, t0, 0.7), txt('Gestão da mudança,', 960, 530, { f: 'N', s: 104, a: 'middle' }), 34)
        + sobe(fin(t, m('alem') - 0.05, 0.7), tRico('*além do raso*.', 960, 650, { f: 'N', s: 104, a: 'middle', hi: C.suave }), 34)
        + sobe(fin(t, ev.final - 0.5, 0.7), txt('Victor Vitorino · Change Management Advisor', 960, 762, { s: 27, c: '#C9D7F5', a: 'middle' }), 18)
        + tracar('M' + Array.from({ length: 41 }, (_, i) => `${f(700 + i * 13)} ${f(694 + Math.sin(i * 0.62 + t * 2.2) * 5)}`).join('L'), ease.inOut(inv(m('alem') + 0.3, ev.final + 0.2, t)), { c: C.suave, sw: 4 });
    }
    return s;
  }

  // o mundo no instante t, visto pela câmera cam, em um quadro de Wv x Hv, sem textos nem interface
  // (o filme usa 1920 x 1080; a capa do blog usa o mesmo cenário em outros formatos)
  function mundoEm(t, cam, Wv = W, Hv = H) {
    const mx = Wv / 2, my = Hv / 2;
    const topoMundo = cam.cy - my / cam.z, baseMundo = cam.cy + my / cam.z;
    const kv = 1 - ease.inOut(inv(cn.mergulho + 0.15, cn.mergulho + 1.5, t));          // véu sob a mesa
    const km = ease.inOut(inv(cn.mergulho + 0.3, cn.mergulho + 1.8, t));               // a mesa vira mar
    const G = gelo(t);
    let mundo = '';
    if (topoMundo < WL) mundo += sala(t, T, { tela: t >= ev.subida ? 'adocao' : 'status', apaga: fin(t, ev.assinatura - 0.5, 0.8) });
    if (baseMundo > WL) {
      mundo += agua();
      if (kv < 0.999) mundo += raios(t) + particulas(t, 0) + haloBloco(1 - inv(0, 1, G.u[2]) * 0.6);
    }
    mundo += G.s;
    if (!G.quebrado && kv < 0.999) mundo += contornoBloco(0.45) + [ev.recuo + 0.9, cn.fatores + 4.6, cn.fatores + 8.6, m('mapeia') + 2.6, m('onde') + 1.2].map(t0 => reflexo((t - t0) / 2.6, 0.55)).join('');
    if (baseMundo > WL && kv < 0.999) mundo += mapeamento(t) + golpesFx(t) + bolhas(t, ev.travessia - 0.05, 960, WL + 420, { n: 26, seed: 8, larg: 1500, d: 2.6, janela: 0.5 }) + bolhas(t, ev.descida + 0.5, 880, WL + 380, { n: 16, seed: 9, larg: 900, d: 2.2, janela: 0.5 });
    mundo += veu(kv) + superficie(t, km) + caminhoFx(t) + tona(t, cam) + G.pedras;
    let s = `<rect width="${Wv}" height="${Hv}" fill="${C.fundo}"/><g transform="translate(${mx} ${my}) scale(${f(cam.z)}) translate(${f(-cam.cx)} ${f(-cam.cy)})">${mundo}</g>`;
    // partículas próximas, com paralaxe (só abaixo da linha d'água)
    const yTona = my + (WL - cam.cy) * cam.z;
    if (kv < 0.999 && yTona < Hv) s += `<clipPath id="cl-perto"><rect x="0" y="${f(Math.max(0, yTona + 8))}" width="${Wv}" height="${Hv}"/></clipPath><g clip-path="url(#cl-perto)" opacity="${f(1 - kv)}"><g transform="translate(${mx} ${my}) scale(${f(cam.z * 1.15)}) translate(${f(-cam.cx)} ${f(-(WL + (cam.cy - WL) * 1.3))})">${particulas(t, 1)}</g></g>`;
    // clarão da travessia da linha d'água
    const kc = Math.max(0, 1 - Math.abs(t - ev.travessia) / 0.32);
    if (kc > 0) s += `<rect width="${Wv}" height="${Hv}" fill="${C.suave}" opacity="${f(0.3 * kc)}"/>`;
    return s;
  }
  function frame(t) {
    const cam = camera(t), id = cenaEm(t);
    let s = mundoEm(t, cam);
    s += textos(t, cam, id) + interface_(t, id);
    if (t < 0.5) s += `<rect width="${W}" height="${H}" fill="#020817" opacity="${f(1 - t / 0.5)}"/>`;
    return s;
  }

  // ---------- dados para o player interativo do site (tempos em s, posições em % do quadro) ----------
  function interativo() {
    const pc = (x, y, w, h) => ({ x: +(x / W * 100).toFixed(2), y: +(y / H * 100).toFixed(2), w: +(w / W * 100).toFixed(2), h: +(h / H * 100).toFixed(2) });
    const pontos = [], FOLGA = 24;   // espaço a mais do lado de fora de cada área, para o selo de "mais" do player não encostar no texto
    for (const q of FATORES) {
      const lw = Math.max(larg(q.titulo, 54, { f: 'N', w: 500 }), larg(q.sub, 26)) + 36, e = q.lado === 'e';
      pontos.push({ id: q.id, grupo: 'fatores', de: +(m(q.marca) + 0.35).toFixed(2), ate: +(cn.choque - 0.35).toFixed(2), ...pc(e ? q.x - lw + 12 - FOLGA : q.x - 24, q.y - 84, lw + 12 + FOLGA, 142) });
    }
    for (const q of MAPEAR) pontos.push({ id: q.id, grupo: 'mapear', de: +(m(q.marca) + 0.4).toFixed(2), ate: +(cn.quebrar - 0.3).toFixed(2), ...pc(COL - 12, q.y - 50, larg(q.titulo, 34, { w: 500 }) + 116 + FOLGA, 80) });
    for (const q of QUEBRAR) pontos.push({ id: q.id, grupo: 'quebrar', de: +(m(q.marca) + 0.45).toFixed(2), ate: +(ev.subida - 0.2).toFixed(2), ...pc(COL - 12, q.y - 52, Math.max(larg(q.titulo, 50, { f: 'N', w: 500 }), larg(q.sub, 25)) + 132 + FOLGA, 112) });
    const camP = camera(ev.pausa), [gx, gy] = tela(camP, CENTRO[0], 1250);
    return {
      duracao: TOTAL, fps: 30,
      capitulos: T.capitulos.map(c => ({ nome: c.nome, t: +c.t.toFixed(2) })),
      legendas: T.legendas.map(l => ({ a: +(l.a - 0.12).toFixed(2), b: +(l.b + 0.25).toFixed(2), texto: l.texto })),
      pausa: { t: ev.pausa, x: +(gx / W * 100).toFixed(2), y: +(gy / H * 100).toFixed(2) },
      final: ev.final, capa: +(cn.choque - 0.9).toFixed(2), pontos,   // capa: os cinco fatores na tela
    };
  }
  return { duration: TOTAL, frame, interativo, cenario: mundoEm, audio: './build/raso/trilha.wav' };
}

export async function criar() {
  const r = await fetch('./src/raso/tempos.json');
  if (!r.ok) throw new Error('rode antes: python3 producao/raso_audio.py');
  return buildFilme(await r.json());
}
