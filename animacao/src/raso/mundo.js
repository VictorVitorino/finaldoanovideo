// O mundo do vídeo "Além do raso": uma sala de reunião à noite em que o tampo da mesa é a linha d'água.
// Acima da mesa, o que cabe no slide. Abaixo, o iceberg: oito pedaços que se encaixam como um bloco só e que depois
// racham, sobem e viram caminho. Coordenadas de mundo (px): x de 0 a 1920, y cresce para baixo, linha d'água em WL.
import { C, W, clamp, lerp, inv, ease, n2, rng, TAU, mix, txt, olho, larg, poli, caminho, tracar, anel, icone, opa, mover, fin, fout, back, janela } from './base.js';
const f = n2;

export const WL = 760;   // linha d'água (tampo da mesa)

// ---------- definições fixas (gradientes e filtros) ----------
export function instalarDefs(defs) {
  defs.innerHTML = `
  <linearGradient id="g-agua" gradientUnits="userSpaceOnUse" x1="0" y1="${WL}" x2="0" y2="3300">
    <stop offset="0" stop-color="#2A62E0"/><stop offset=".1" stop-color="${C.navy3}"/><stop offset=".36" stop-color="${C.navy2}"/><stop offset=".66" stop-color="${C.navy}"/><stop offset="1" stop-color="${C.fundo}"/></linearGradient>
  <linearGradient id="g-tona" gradientUnits="userSpaceOnUse" x1="0" y1="${WL}" x2="0" y2="${WL + 300}"><stop offset="0" stop-color="${C.suave}" stop-opacity=".42"/><stop offset="1" stop-color="${C.suave}" stop-opacity="0"/></linearGradient>
  <linearGradient id="g-parede" gradientUnits="userSpaceOnUse" x1="0" y1="-260" x2="0" y2="${WL}"><stop offset="0" stop-color="#050F30"/><stop offset=".55" stop-color="${C.noite}"/><stop offset="1" stop-color="#0D2A72"/></linearGradient>
  <linearGradient id="g-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030B24"/><stop offset=".7" stop-color="#0B2566"/><stop offset="1" stop-color="#1A4BB5"/></linearGradient>
  <linearGradient id="g-raio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="g-feixe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".6" stop-color="${C.suave}" stop-opacity=".4"/><stop offset="1" stop-color="${C.suave}" stop-opacity="0"/></linearGradient>
  <linearGradient id="g-mesa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D7BF2"/><stop offset=".22" stop-color="${C.navy3}"/><stop offset="1" stop-color="${C.navy2}"/></linearGradient>
  <linearGradient id="g-veu" gradientUnits="userSpaceOnUse" x1="0" y1="${WL}" x2="0" y2="${WL + 520}"><stop offset="0" stop-color="#0A2260"/><stop offset=".3" stop-color="#061640"/><stop offset="1" stop-color="#030B24"/></linearGradient>
  <linearGradient id="g-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.suave}" stop-opacity=".2"/><stop offset="1" stop-color="${C.suave}" stop-opacity="0"/></linearGradient>
  <linearGradient id="g-painel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCE8FE"/></linearGradient>
  <radialGradient id="g-halo"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="${C.suave}" stop-opacity=".45"/><stop offset="1" stop-color="${C.azul}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-vinheta" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#020817" stop-opacity="0"/><stop offset="1" stop-color="#020817" stop-opacity=".62"/></radialGradient>
  <clipPath id="cl-bloco"><path d="${caminho(CONTORNO)}Z"/></clipPath>
  <linearGradient id="g-varre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="f-b4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="f-b10" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="f-b22" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="f-b40" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"/></filter>`;
}

// ---------- sala de reunião (acima da linha d'água) ----------
// Prédios da janela: duas camadas de silhuetas com janelas acesas, sempre iguais (semente fixa).
function cidade(x0, x1, y0, y1, seed) {
  const r = rng(seed);
  let s = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#g-ceu)"/>`;
  for (const [cor, hMin, hMax, luz] of [['#0A2260', 0.28, 0.62, 0.16], ['#061640', 0.16, 0.44, 0.3]]) {
    let x = x0 - 20;
    while (x < x1) {
      const w = 46 + r() * 70, h = (hMin + r() * (hMax - hMin)) * (y1 - y0), yt = y1 - h;
      s += `<rect x="${f(x)}" y="${f(yt)}" width="${f(w)}" height="${f(h)}" fill="${cor}"/>`;
      for (let wy = yt + 14; wy < y1 - 12; wy += 22) for (let wx = x + 9; wx < x + w - 10; wx += 16) if (r() < luz) s += `<rect x="${f(wx)}" y="${f(wy)}" width="7" height="9" fill="${r() < 0.3 ? '#FFFFFF' : C.suave}" opacity="${f(0.35 + r() * 0.5)}"/>`;
      x += w + 4 + r() * 10;
    }
  }
  return s;
}
const CIDADE_E = cidade(70, 560, 70, 690, 11), CIDADE_D = cidade(1360, 1850, 70, 690, 29);
function janelaSala(x0, x1, arte, id) {
  let s = `<clipPath id="cl-${id}"><rect x="${x0}" y="70" width="${x1 - x0}" height="620" rx="6"/></clipPath><g clip-path="url(#cl-${id})">${arte}`;
  s += `<rect x="${x0}" y="70" width="${x1 - x0}" height="620" fill="${C.azul}" opacity=".07"/></g>`;
  for (let i = 1; i < 3; i++) s += `<rect x="${f(x0 + (x1 - x0) * i / 3 - 3)}" y="70" width="6" height="620" fill="${C.noite}"/>`;
  return s + `<rect x="${x0}" y="70" width="${x1 - x0}" height="620" rx="6" fill="none" stroke="${C.navy2}" stroke-width="5"/>`;
}
const CADEIRAS = [250, 470, 690, 1230, 1450, 1670];
const PISCA = (() => { const r = rng(91), out = []; for (let i = 0; i < 44; i++) { const esq = i % 2 === 0; out.push([(esq ? 80 : 1370) + r() * 460, 250 + r() * 420, 0.5 + r() * 1.2, r() * 6.28]); } return out; })();
function pisca(t) {
  let s = '';
  for (const [x, y, w, fase] of PISCA) { const o = Math.max(0, Math.sin(t * w + fase)); if (o > 0.02) s += `<rect x="${f(x)}" y="${f(y)}" width="7" height="9" fill="#fff" opacity="${f(0.75 * o * o)}"/>`; }
  return s;
}
// cadeiras da sala: vazias (o filme não tem personagens). A luz da tela, que vem do centro, acende a borda de dentro.
function cadeiras(t = 0) {
  let s = '';
  CADEIRAS.forEach((x, i) => {
    const lado = x < 960 ? 1 : -1, luz = 0.5 + 0.12 * Math.sin(t * 0.8 + i * 1.3);
    s += `<rect x="${x - 76}" y="592" width="152" height="210" rx="34" fill="#0C2769" stroke="${C.navy3}" stroke-width="2" opacity=".96"/>`
      + `<path d="M${x - 50} 664H${x + 50}" stroke="${C.navy3}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`
      + `<path d="M${x + lado * 74} 634V770" stroke="${C.azul}" stroke-width="4" stroke-linecap="round" opacity="${f(luz * 0.55)}"/>`;
  });
  return s;
}
// conteúdo da tela da sala: 'status' (o que cabe no slide) ou 'adocao' (a curva que sobe no fim)
function tela(t, T, modo, apaga = 0) {
  const X = 650, Y = 150, L = 620, A = 370, ev = T.eventos, m = n => T.marcas[n].a;
  const liga = fin(t, ev.tela, 0.5);
  let s = `<rect x="${X - 30}" y="${Y - 30}" width="${L + 60}" height="${A + 60}" rx="30" fill="${C.azul}" opacity="${f(0.3 * liga)}" filter="url(#f-b40)"/>`
    + `<rect x="${X - 10}" y="${Y - 10}" width="${L + 20}" height="${A + 20}" rx="14" fill="#030B24"/>`
    + `<rect x="${X}" y="${Y}" width="${L}" height="${A}" rx="6" fill="#0B2A6B"/>`;
  if (liga <= 0.001) return s;
  let c = `<rect x="${X}" y="${Y}" width="${L}" height="${A}" rx="6" fill="url(#g-painel)"/>`;
  if (modo === 'status') {
    const k1 = fin(t, ev.tela + 0.25, 0.5), k2 = fin(t, ev.tela + 0.45, 0.6);
    c += opa(k1, olho('Status do projeto', X + 44, Y + 62, { s: 19, c: C.cinza, ls: 3 })) + (k2 > 0.001 ? `<g opacity="${f(k2)}" transform="translate(0 ${f((1 - k2) * 18)})">${txt('Tudo dentro do plano', X + 44, Y + 112, { f: 'N', s: 40, c: C.navy })}</g>` : '');
    // ponteiro: passeia pelo título e para em cada linha no instante em que a fala a nomeia
    const P = [[ev.tela + 0.9, [X + 420, Y + 104]], [m('slide') - 0.3, [X + 470, Y + 98]], [m('prazo') - 0.05, [X + 248, Y + 170]], [m('sistema') - 0.05, [X + 262, Y + 232]], [m('treinamento') - 0.05, [X + 318, Y + 294]], [m('treinamento') + 1.0, [X + 318, Y + 294]], [m('treinamento') + 1.7, [X + 560, Y + 330]]];
    let pp = P[0][1];
    for (let i = 0; i < P.length - 1; i++) if (t >= P[i][0]) { const u = ease.inOut(inv(P[i][0], Math.min(P[i + 1][0], P[i][0] + 0.55), t)); pp = [lerp(P[i][1][0], P[i + 1][1][0], t >= P[i + 1][0] ? 1 : (P[i + 1][0] - P[i][0] > 0.6 ? ease.inOut(inv(P[i + 1][0] - 0.55, P[i + 1][0], t)) : u)), lerp(P[i][1][1], P[i + 1][1][1], t >= P[i + 1][0] ? 1 : (P[i + 1][0] - P[i][0] > 0.6 ? ease.inOut(inv(P[i + 1][0] - 0.55, P[i + 1][0], t)) : u))]; }
    const kp = janela(t, ev.tela + 0.9, m('treinamento') + 1.9, 0.3);
    if (kp > 0.001) c += opa(kp, `<circle cx="${f(pp[0])}" cy="${f(pp[1])}" r="22" fill="${C.azul}" opacity=".18"/><circle cx="${f(pp[0])}" cy="${f(pp[1])}" r="8" fill="${C.azul}"/>`);
    ['Prazo', 'Sistema', 'Treinamento'].forEach((nome, i) => {
      const t0 = m(['prazo', 'sistema', 'treinamento'][i]) - 0.08, k = back(t, t0, 0.45), y = Y + 178 + i * 62;
      if (k <= 0.001) return;
      const barra = ease.out(inv(t0 + 0.05, t0 + 0.7, t));
      c += opa(clamp(k * 1.4), `<circle cx="${X + 66}" cy="${y - 10}" r="${f(20 * k)}" fill="${C.azul}"/>${icone('check', X + 66, y - 10, 24, { c: '#fff', sw: 4.5, u: inv(t0 + 0.12, t0 + 0.45, t) })}`
        + txt(nome, X + 104, y, { w: 600, s: 30, c: C.tinta })
        + `<rect x="${X + 330}" y="${y - 20}" width="246" height="14" rx="7" fill="#DCE8FE"/><rect x="${X + 330}" y="${y - 20}" width="${f(246 * barra)}" height="14" rx="7" fill="${C.azul}"/>`);
    });
  } else {
    const t0 = ev.encaixe + 0.4;
    c += olho('Adoção', X + 44, Y + 62, { s: 19, c: C.cinza, ls: 3 }) + txt('Uso de verdade, semana a semana', X + 44, Y + 112, { f: 'N', s: 36, c: C.navy });
    const pts = [[0, 0.12], [0.2, 0.2], [0.4, 0.38], [0.6, 0.55], [0.8, 0.74], [1, 0.9]].map(([a, b]) => [X + 60 + a * (L - 120), Y + A - 46 - b * 190]);
    for (let i = 0; i < 4; i++) c += `<path d="M${X + 44} ${Y + A - 46 - i * 60}H${X + L - 44}" stroke="#DCE8FE" stroke-width="2"/>`;
    const u = ease.inOut(inv(t0, ev.chegada + 0.3, t));
    c += tracar(caminho(pts), u, { c: C.azul, sw: 6 });
    pts.forEach((p, i) => { const k = back(t, t0 + (ev.chegada + 0.3 - t0) * i / 5 - 0.05, 0.4); if (k > 0.001) c += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(9 * k)}" fill="#fff" stroke="${C.navy}" stroke-width="4"/>`; });
    c += txt('ilustrativo', X + L - 44, Y + A - 16, { s: 15, c: C.cinza, a: 'end' });
  }
  // moldura: "uma parte que cabe no slide"
  const km = modo === 'status' ? janela(t, m('slide') - 0.5, m('ponta') - 0.2, 0.4) : 0;
  const moldura = km > 0.001 ? opa(km, tracar(`M${X - 26} ${Y - 26}h${L + 52}v${A + 52}h${-(L + 52)}z`, ease.inOut(inv(m('slide') - 0.5, m('slide') + 0.5, t)), { c: C.suave, sw: 5 })) : '';
  return s + opa(liga * (1 - apaga), c) + moldura;
}
export function sala(t, T, o = {}) {
  const ev = T.eventos, luz = clamp(fin(t, ev.luzes, 0.25) * (0.82 + 0.18 * Math.sign(Math.sin((t - ev.luzes) * 60)) * (t < ev.luzes + 0.3 ? 1 : 0)) + (t >= ev.luzes + 0.3 ? 0.0 : 0));
  const L = t >= ev.luzes + 0.3 ? 1 : luz;
  let s = `<rect x="-3200" y="-1200" width="8320" height="${WL + 1200}" fill="url(#g-parede)"/>`;
  s += janelaSala(70, 560, CIDADE_E, 'je') + janelaSala(1360, 1850, CIDADE_D, 'jd') + pisca(t);
  // luminárias: duas barras de luz com um cone suave
  for (const [x0, x1] of [[560, 900], [1020, 1360]]) {
    s += `<path d="M${x0} 70L${x0 - 190} ${WL}H${x1 + 190}L${x1} 70z" fill="url(#g-cone)" opacity="${f(0.75 * L)}"/>`
      + `<rect x="${x0}" y="58" width="${x1 - x0}" height="10" rx="5" fill="${mix(C.navy2, '#FFFFFF', L)}"/>`
      + `<rect x="${x0}" y="54" width="${x1 - x0}" height="18" rx="9" fill="#fff" opacity="${f(0.5 * L)}" filter="url(#f-b10)"/>`
      + `<path d="M${(x0 + x1) / 2 - 110} -400V58M${(x0 + x1) / 2 + 110} -400V58" stroke="${C.navy2}" stroke-width="3"/>`;
  }
  s += tela(t, T, o.tela ?? 'status', o.apaga ?? 0) + cadeiras(t);
  return s + `<rect x="-3200" y="-1200" width="8320" height="${WL + 1200}" fill="#020817" opacity="${f(0.55 * (1 - L))}"/>`;
}
// o que fica sob a mesa enquanto ninguém mergulha: a frente do móvel, no escuro (k = 1 cobre a água, 0 revela)
export function veu(k) {
  if (k <= 0.001) return '';
  let s = `<rect x="-3200" y="${WL}" width="8320" height="2900" fill="url(#g-veu)"/>`;
  for (let x = -200; x < 2200; x += 340) s += `<path d="M${x} ${WL + 30}V${WL + 430}" stroke="#0E2C78" stroke-width="2" opacity=".5"/>`;
  s += `<rect x="-3200" y="${WL + 26}" width="8320" height="5" fill="#0E2C78" opacity=".7"/>`;
  return opa(k, s);
}

// ---------- água ----------
export function agua() {
  return `<rect x="-3200" y="${WL}" width="8320" height="3600" fill="url(#g-agua)"/><rect x="-3200" y="${WL}" width="8320" height="300" fill="url(#g-tona)"/>`;
}
export function raios(t) {
  let s = '';
  [[-1500, 130], [-950, 100], [-420, 140], [140, 120], [470, 90], [790, 150], [1130, 110], [1480, 140], [1790, 100], [2350, 130], [2900, 110], [3400, 140]].forEach(([x, w], i) => {
    const ang = 11 + 3 * Math.sin(t * 0.28 + i * 1.7), o = 0.55 + 0.3 * Math.sin(t * 0.45 + i * 2.3);
    s += `<path d="M${-w / 2} 0H${w / 2}L${w * 1.5} 1500H${-w * 1.5}z" fill="url(#g-raio)" opacity="${f(o)}" transform="translate(${x} ${WL}) rotate(${f(ang)})"/>`;
  });
  return `<g filter="url(#f-b22)">${s}</g>`;
}
// partículas em suspensão: sobem devagar e balançam; camada 0 = longe (miúdas), 1 = perto (maiores e desfocadas)
export function particulas(t, camada = 0) {
  const r = rng(camada ? 733 : 277), n = camada ? 30 : 260, y0 = WL + 30, alt = 2700;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = (camada ? -300 : -1700) + r() * (camada ? 2520 : 5320), yb = r() * alt, v = 6 + r() * 16, fase = r() * TAU, raio = camada ? 7 + r() * 13 : 1.4 + r() * 2.8, op = camada ? 0.05 + r() * 0.09 : 0.14 + r() * 0.4;
    const y = y0 + ((yb - t * v) % alt + alt) % alt, xx = x + Math.sin(t * 0.4 + fase) * 16;
    s += `<circle cx="${f(xx)}" cy="${f(y)}" r="${f(raio)}" fill="#fff" opacity="${f(op)}"/>`;
  }
  return camada ? `<g filter="url(#f-b4)">${s}</g>` : s;
}
// bolhas que sobem de um ponto a partir de t0 (n bolhas, espalhadas em `larg` px)
export function bolhas(t, t0, x, y, o = {}) {
  const n = o.n ?? 14, r = rng(o.seed ?? 5), d = o.d ?? 2.4;
  let s = '';
  for (let i = 0; i < n; i++) {
    const atraso = r() * (o.janela ?? 0.7), vx = (r() - 0.5) * (o.larg ?? 160), vel = 150 + r() * 220, raio = 3 + r() * 9, fase = r() * TAU;
    const idade = t - t0 - atraso;
    if (idade <= 0 || idade >= d) continue;
    const yy = y - idade * vel, xx = x + vx * (0.3 + idade) + Math.sin(idade * 5 + fase) * 7;
    if (yy < WL + 6) continue;
    s += `<circle cx="${f(xx)}" cy="${f(yy)}" r="${f(raio * (0.6 + 0.4 * idade / d))}" fill="none" stroke="#fff" stroke-width="2" opacity="${f(0.6 * (1 - idade / d))}"/>`;
  }
  return s;
}
// linha d'água: reta enquanto é mesa (k = 0) e ondulada quando é mar (k = 1)
export function superficie(t, k) {
  const pts = [];
  for (let x = -3200; x <= 5120; x += 40) pts.push([x, WL + k * (Math.sin((x / 270 + t * 0.32) * TAU) * 5 + Math.sin((x / 97 - t * 0.5) * TAU) * 2)]);
  const d = caminho(pts);
  return `<rect x="-3200" y="${WL}" width="8320" height="26" fill="url(#g-mesa)" opacity="${f(1 - 0.9 * k)}"/>`
    + `<path d="${d}" fill="none" stroke="#fff" stroke-width="7" opacity=".28" filter="url(#f-b4)"/><path d="${d}" fill="none" stroke="${C.suave}" stroke-width="3"/>`;
}

// ---------- iceberg: oito pedaços que formam um bloco só ----------
const V = {
  P0: [880, WL], P1: [1062, WL], TA: [962, 596], TB: [1012, 668], TC: [918, 690],
  N1: [780, 790], R1: [1180, 790], R2: [1420, 860], R3: [1530, 1080], R4: [1490, 1380], R5: [1560, 1640], R6: [1440, 1960], R7: [1300, 2260], R8: [1180, 2420],
  B1: [1040, 2640], L8: [900, 2470], L7: [700, 2330], L6: [560, 2040], L5: [430, 1760], L4: [500, 1460], L3: [400, 1180], L2: [470, 900], L1: [640, 800],
  I1: [960, 1000], I2: [760, 1150], I3: [1180, 1120], I4: [980, 1500], I5: [720, 1650], I6: [1260, 1600], I7: [1000, 2050],
};
const DEF = [
  ['A', ['N1', 'P0', 'P1', 'R1', 'I3', 'I1', 'I2']],
  ['B', ['L1', 'N1', 'I2', 'L3', 'L2']],
  ['C', ['R1', 'R2', 'R3', 'R4', 'I3']],
  ['D', ['L3', 'I2', 'I1', 'I4', 'I5', 'L5', 'L4']],
  ['E', ['I1', 'I3', 'R4', 'R5', 'I6', 'I4']],
  ['F', ['L5', 'I5', 'I4', 'I7', 'L7', 'L6']],
  ['G', ['I4', 'I6', 'R5', 'R6', 'R7', 'I7']],
  ['H', ['L7', 'I7', 'R7', 'R8', 'B1', 'L8']],
];
export const CENTRO = [985, 1560];   // centro de massa aproximado do bloco submerso
const LUZ = [-0.62, -0.78];          // de onde vem a luz (do alto, à esquerda)
// cor de uma faceta: mais clara se olha para a luz, mais azul e escura quanto mais fundo
function corFaceta(cx, cy, ox, oy, jit) {
  const dx = cx - ox, dy = cy - oy, n = Math.hypot(dx, dy) || 1;
  const lum = clamp(0.5 + 0.5 * (dx / n * LUZ[0] + dy / n * LUZ[1]) + jit);
  const fundo = clamp((cy - WL) / 1900);
  return mix(mix('#5E8FF2', '#F4F8FF', lum), '#1B49B3', 0.62 * fundo);
}
export const PEDACOS = DEF.map(([id, nomes], k) => {
  const pts = nomes.map(n => V[n]), c = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
  const r = rng(101 + k * 17), n = pts.length, w = pts.map(p => { const u = 0.46 + r() * 0.16; return [lerp(c[0], p[0], u), lerp(c[1], p[1], u)]; });
  const tri = [];
  const poe = (a, b, d) => { const m = [(a[0] + b[0] + d[0]) / 3, (a[1] + b[1] + d[1]) / 3]; tri.push({ pts: [a, b, d], cor: corFaceta(m[0], m[1], c[0], c[1], (r() - 0.5) * 0.22) }); };
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; poe(pts[i], pts[j], w[i]); poe(pts[j], w[j], w[i]); poe(c, w[i], w[j]); }
  return { id, pts, c, tri, nomes };
});
// a ponta, acima da água: faz parte do pedaço A
const PONTA = [
  { pts: [V.P0, V.TC, V.TA], cor: '#FFFFFF' }, { pts: [V.P0, V.TA, [962, WL]], cor: '#E6EFFF' }, { pts: [V.TA, V.TB, [962, WL]], cor: '#C9DBFF' },
  { pts: [V.TB, V.P1, [962, WL]], cor: '#B4CCFA' }, { pts: [V.TA, V.TC, V.P0], cor: '#F4F8FF' },
];
// arestas compartilhadas: cada rachadura percorre uma lista de vértices
export const RACHAS = [
  ['L3', 'I2', 'I1', 'I3', 'R4'],                 // 1: separa o topo (A, B, C) do meio
  ['N1', 'I2'], ['R1', 'I3'],                     // 1: separa B e C de A
  ['L5', 'I5', 'I4', 'I6', 'R5'],                 // 2: separa o meio (D, E) da base
  ['I1', 'I4'],                                   // 2: separa D de E
  ['L7', 'I7', 'R7'], ['I4', 'I7'],               // 3: separa F, G e H
].map((nomes, i) => {
  const r = rng(900 + i * 13), pts = [];
  for (let k = 0; k < nomes.length - 1; k++) {
    const a = V[nomes[k]], b = V[nomes[k + 1]], n = Math.max(3, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 46)), nx = -(b[1] - a[1]), ny = b[0] - a[0], nn = Math.hypot(nx, ny);
    for (let j = k ? 1 : 0; j <= n; j++) { const u = j / n, jit = j === 0 || j === n ? 0 : (r() - 0.5) * 22; pts.push([lerp(a[0], b[0], u) + nx / nn * jit, lerp(a[1], b[1], u) + ny / nn * jit]); }
  }
  return { pts, d: caminho(pts), grupo: i < 3 ? 0 : i < 5 ? 1 : 2 };
});
const CONTORNO = ['P0', 'TC', 'TA', 'TB', 'P1', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'B1', 'L8', 'L7', 'L6', 'L5', 'L4', 'L3', 'L2', 'L1', 'N1'].map(n => V[n]);
// deslocamento de cada pedaço em cada golpe (px), no sentido de se afastar
const GOLPES = {
  A: [[0, -30], [0, -8], [0, -6]], B: [[-34, -18], [-10, -6], [-6, -4]], C: [[36, -16], [10, -6], [6, -4]],
  D: [[0, 6], [-40, -4], [-10, -8]], E: [[0, 6], [42, -2], [10, -8]],
  F: [[0, 8], [-8, 16], [-34, 22]], G: [[0, 8], [8, 16], [36, 20]], H: [[0, 8], [0, 20], [0, 46]],
};
// u = [u1, u2, u3]: quanto de cada golpe já aconteceu (0..1, pode passar de 1 no repique)
export const deslocamento = (id, u) => GOLPES[id].reduce((a, g, i) => [a[0] + g[0] * u[i], a[1] + g[1] * u[i]], [0, 0]);

// desenha um pedaço. e: { dx, dy, rot, esc (em torno do centro), brilho (0..1, branco por cima), o (opacidade), borda }
export function pedaco(p, e = {}) {
  const tr = `translate(${f(p.c[0] + (e.dx ?? 0))} ${f(p.c[1] + (e.dy ?? 0))})${e.rot ? ` rotate(${f(e.rot)})` : ''}${e.esc != null && e.esc !== 1 ? ` scale(${f(e.esc)})` : ''} translate(${f(-p.c[0])} ${f(-p.c[1])})`;
  let s = p.tri.map(q => poli(q.pts, { fill: q.cor, stroke: q.cor, sw: 0.8 })).join('');
  if (p.id === 'A') s += PONTA.map(q => poli(q.pts, { fill: q.cor, stroke: q.cor, sw: 0.8 })).join('');
  if (e.brilho > 0.005) s += poli(p.pts, { fill: '#fff', o: e.brilho });
  if (e.borda > 0.005) s += poli(p.pts, { fill: 'none', stroke: '#fff', sw: 2.5 / (e.esc ?? 1), o: e.borda });
  return `<g transform="${tr}"${e.o != null && e.o < 0.999 ? ` opacity="${f(e.o)}"` : ''}>${s}</g>`;
}
// contorno do bloco inteiro e brilho por trás
export function contornoBloco(o = 0.5) {
  return `<path d="${caminho(CONTORNO)}Z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" opacity="${f(o)}"/>`;
}
export function haloBloco(o = 1) {
  return `<path d="${caminho(CONTORNO)}Z" fill="${C.suave}" opacity="${f(0.3 * o)}" filter="url(#f-b40)"/>`;
}
// reflexo que atravessa o bloco de tempos em tempos (u = 0..1 dentro de uma passada)
export function reflexo(u, o = 1) {
  if (u <= 0 || u >= 1 || o <= 0.001) return '';
  const x = lerp(-300, 2200, u);
  return `<g clip-path="url(#cl-bloco)" opacity="${f(o * Math.sin(u * Math.PI))}"><rect x="${f(x)}" y="400" width="360" height="2500" fill="url(#g-varre)" transform="rotate(18 ${f(x + 180)} 1600)"/></g>`;
}
// divisas entre os pedaços, tracejadas (o que o sonar revela)
export function divisas(u, o = 1) {
  if (u <= 0 || o <= 0.001) return '';
  return opa(o, RACHAS.map((r, i) => tracar(r.d, clamp(u * 1.4 - i * 0.06), { c: '#fff', sw: 3, extra: 'stroke-dasharray="0.012 0.02"', o: 0.9 })).join(''));
}
// rachadura do grupo g: risca a divisa com luz (u = 0..1)
export function rachadura(g, u, forca = 1) {
  if (u <= 0) return '';
  let s = '';
  for (const r of RACHAS) if (r.grupo === g) s += tracar(r.d, u, { c: C.suave, sw: 16, o: 0.55 * forca, extra: 'filter="url(#f-b10)"' }) + tracar(r.d, u, { c: '#fff', sw: 4.5, o: forca });
  return s;
}
// lascas de gelo que saltam de uma rachadura (idade em s)
export function lascas(g, idade) {
  if (idade <= 0 || idade >= 1.5) return '';
  const r = rng(400 + g * 7);
  let s = '';
  for (const rc of RACHAS) if (rc.grupo === g) for (let i = 0; i < rc.pts.length; i += 2) {
    const [x, y] = rc.pts[i], a = r() * TAU, v = 60 + r() * 150, tam = 5 + r() * 9, rot = r() * 360;
    const xx = x + Math.cos(a) * v * idade, yy = y + Math.sin(a) * v * idade - 40 * idade + 90 * idade * idade;
    s += `<path d="M0 ${f(-tam)}L${f(tam * 0.8)} ${f(tam * 0.6)}L${f(-tam * 0.7)} ${f(tam * 0.5)}z" fill="#fff" opacity="${f(0.9 * (1 - idade / 1.5))}" transform="translate(${f(xx)} ${f(yy)}) rotate(${f(rot + idade * 240)})"/>`;
  }
  return s;
}

// ---------- pedra de gelo na superfície (o pedaço depois de subir) ----------
const PEDRA = [[-66, -14], [-34, -24], [30, -22], [66, -12], [74, 12], [44, 50], [-8, 60], [-58, 38]];
export function pedra(x, y, k = 1, v = 0) {
  const s = 1 + ((v * 37) % 5 - 2) * 0.04, P = PEDRA.map(([a, b]) => [a * s, b]);
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})">${poli(P, { fill: '#7FA8F6' })}${poli([P[0], P[1], P[2], P[3], [40 * s, 2], [-40 * s, 4]], { fill: '#FFFFFF' })}${poli([P[0], [-40 * s, 4], [40 * s, 2], P[3], P[4], [20 * s, 26], [-30 * s, 24]], { fill: '#C9DBFF' })}${poli(P, { fill: 'none', stroke: '#fff', sw: 2, o: 0.7 })}</g>`;
}

// ---------- ponto de luz: quem usa o sistema, sem figura nenhuma ----------
// (x, y) é a base: o ponto fica apoiado nela. brilho: 0..1, halo em volta. tom: 'luz' (disco branco, para fundo escuro e água)
// ou 'gelo' (disco azul de borda branca, para aparecer em cima do gelo, como os pontos do mapa).
export function ponto(x, y, k = 1, brilho = 0.7, tom = 'luz') {
  const r = 11 * k, cy = y - r - 1.5 * k;
  return (brilho > 0.001 ? `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(r * 2.9)}" fill="url(#g-halo)" opacity="${f(0.7 * brilho)}"/>` : '')
    + (tom === 'gelo' ? `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(r)}" fill="${C.azul}" stroke="#fff" stroke-width="${f(3.5 * k)}"/>`
      : `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(r)}" fill="#fff" stroke="${C.azul}" stroke-width="${f(2.5 * k)}"/>`);
}

// ---------- barco de papel (o projeto) ----------
// bandeira: 'projeto' ou 'no-ar' (kb = quanto a segunda já subiu)
export function barco(x, y, rot = 0, kb = 0) {
  const casco = [[-86, 0], [86, 0], [56, 38], [-56, 38]];
  let s = poli(casco, { fill: '#FFFFFF' }) + poli([[0, 0], [86, 0], [56, 38], [0, 38]], { fill: '#D6E4FE' })
    + poli([[-34, 0], [0, -62], [0, 0]], { fill: '#FFFFFF' }) + poli([[0, -62], [34, 0], [0, 0]], { fill: '#C9DBFF' });
  // o cronograma impresso no papel
  for (const [bx, by, bw] of [[-62, 9, 34], [-50, 19, 46], [-40, 29, 26], [12, 9, 30], [20, 19, 22]]) s += `<rect x="${bx}" y="${by}" width="${bw}" height="5" rx="2.5" fill="${C.azul}" opacity=".5"/>`;
  s += `<path d="M0 -62V-128" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
  // a bandeira fica para trás do mastro: o barco navega para a direita
  const bandeira = (texto, cor, o, dy) => opa(o, `<g transform="translate(0 ${f(dy)})"><path d="M-2 -128h-118l16 17-16 17H-2z" fill="${cor}"/>${txt(texto, -56, -103, { w: 700, s: 21, c: cor === '#FFFFFF' ? C.navy : '#fff', a: 'middle', ls: 1.2 })}</g>`);
  s += bandeira('PROJETO', C.azul, 1 - kb, 0) + bandeira('NO AR', '#FFFFFF', kb, (1 - kb) * 26);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">${s}</g>`;
}
// planilha que boia: para onde o uso volta
export function planilha(x, y, rot = 0, k = 1) {
  let s = `<rect x="-52" y="-34" width="104" height="68" rx="7" fill="#fff"/><rect x="-52" y="-34" width="104" height="17" rx="7" fill="${C.suave}"/>`;
  for (let i = 1; i < 4; i++) s += `<path d="M-52 ${-34 + i * 17}H52" stroke="${C.gelo2}" stroke-width="2"/>`;
  for (let i = 1; i < 4; i++) s += `<path d="M${-52 + i * 26} -34V34" stroke="${C.gelo2}" stroke-width="2"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(k)})">${s}</g>`;
}

// ---------- sonda e sonar ----------
export function sonda(x, y, t, o = 1) {
  const p = 0.5 + 0.5 * Math.sin(t * 4);
  return opa(o, `<path d="M${f(x)} ${WL}V${f(y - 26)}" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 10" opacity=".55"/>`
    + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(64 + 10 * p)}" fill="url(#g-halo)" opacity=".8"/>`
    + `<path d="M${f(x - 20)} ${f(y - 26)}h40l12 26-12 26h-40l-12-26z" fill="#fff"/><circle cx="${f(x)}" cy="${f(y)}" r="11" fill="${C.azul}"/><circle cx="${f(x)}" cy="${f(y)}" r="4.5" fill="#fff"/>`);
}
export const pulso = (x, y, idade, r1 = 1500, d = 2.6) => anel(x, y, idade, { d, r0: 30, r1, c: '#fff', sw: 7, o: 0.7 }) + anel(x, y, idade - 0.22, { d, r0: 30, r1, c: C.suave, sw: 4, o: 0.5 });

// ---------- feixe de luz que desce da superfície ----------
export function feixe(x, y1, k, t) {
  if (k <= 0.001) return '';
  const tremor = 1 + 0.06 * Math.sin(t * 23);
  return `<g opacity="${f(k)}"><path d="M${x - 130} ${WL}H${x + 130}L${x + 520 * tremor} ${y1}H${x - 520 * tremor}z" fill="url(#g-feixe)" filter="url(#f-b22)"/><path d="M${x - 40} ${WL}H${x + 40}L${x + 170} ${y1}H${x - 170}z" fill="url(#g-feixe)"/><path d="M${x - 260} ${WL + 4}H${x + 260}" stroke="#fff" stroke-width="14" opacity=".8" filter="url(#f-b10)"/></g>`;
}
