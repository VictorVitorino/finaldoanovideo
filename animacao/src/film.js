// O filme: um desenho por plano do roteiro. Cada função recebe o tempo local do
// plano (lt) e o tempo global (t) e devolve { bg, world, cam, hud, chrome }.
import { tr, g, op, clamp, lerp, inv, seg, win, bump, kf, ease, rng, TAU, C, n2, text, measure } from './core.js';
import { drawChar } from './chars.js';
import { linhaDoTempo, PROJETOS, VALORES, QUADRO_FINAL, ELENCO } from './roteiro.js';
import { logo, logoSize } from './assets.js';
import {
  mix, bloom, blob, blobPath, paperBg, doodles, groundLine, tag, stamp, bubble, burst, confetti, desk, deskPhone, monitor,
  paperSheet, plant, windowPane, calendar, seedling, logoCard, easel, rainCloud, sun, checkBadge, placeClinic, placeLab,
  placeTrack, placeFarm, placeSpace, placeSite, road, pin, robot, dashCard, vinyl, nfDoc,
} from './scenery.js';
import { caption, chrome, wipe, iris, lowerThird, projectCard, typewriter } from './hud.js';

const GY = 880;
const camStr = ([cx, cy, z, r = 0]) => `translate(960 540) rotate(${n2(r)}) scale(${n2(z)}) translate(${n2(-cx)} ${n2(-cy)})`;
const W = (t, hz = 1.8) => t * hz * TAU; // fase de caminhada
const shake = (t, a) => [Math.sin(t * 91) * a, Math.cos(t * 77) * a];
const ch = drawChar;

// ============================================================
// Cenário 1: sala de crise
// ============================================================
const PHONES = [[455, '#e74c3c'], [1180, '#f1c40f'], [1300, '#3498db'], [1420, '#2ecc71']];
function crisisRoom(t, o = {}) {
  const chaos = o.chaos ?? 0, warm = o.warm ?? 0;
  let s = '';
  s += blob(560, 380, 420, mix('#ff4d5e', '#ffd6a5', warm), 0.1 + 0.08 * chaos, 3) + blob(1420, 340, 460, mix('#6a5acd', '#a0c4ff', warm), 0.14, 5);
  s += windowPane(150, 150, 500, 330, { night: warm < 0.6, city: true, frame: mix('#3a4160', '#ffffff', warm) });
  // relógio que gira
  const spin = o.freeze != null ? o.freeze : t;
  s += g(tr(1180, 250), `<circle r="64" fill="${mix('#2f3550', '#fffdf6', warm)}" stroke="${mix('#4a5275', '#2b2b36', warm)}" stroke-width="8"/><path d="M0 0 V-44" stroke="${mix('#e8ecff', '#2b2b36', warm)}" stroke-width="7" stroke-linecap="round" transform="rotate(${n2(spin * 720 * chaos + 30)})"/><path d="M0 0 V-30" stroke="${C.red}" stroke-width="7" stroke-linecap="round" transform="rotate(${n2(spin * 120 * chaos + 140)})"/><circle r="7" fill="${C.red}"/>`);
  s += calendar(1590, 430, o.stampK ?? 0, { s: 0.95 });
  // Dra. Cuidado atrás da mesa
  s += ch('cuidado', { x: 1000, y: 842, t, s: 1.8, ...(o.doc ?? {}) });
  s += desk(960, 770, 1080, { top: mix('#6b5644', '#c9a477', warm), front: mix('#544334', '#b48c5f', warm), h: 92 });
  s += monitor(600, 768, 180, 128, chaos > 0.2 ? 'alert' : 'off', t, { label: 'ERRO' });
  s += monitor(785, 768, 180, 128, chaos > 0.2 ? 'sad' : 'off', t, { label: 'REWORK' });
  PHONES.forEach(([x, c], i) => (s += deskPhone(x, 770, c, chaos, t + i * 0.37, { picked: o.picked === i, face: true })));
  // papéis voando
  const pf = o.papers ?? chaos;
  if (pf > 0) {
    const R = rng(4);
    for (let i = 0; i < 12; i++) {
      const a0 = R() * TAU, r0 = 220 + R() * 260, sp = 0.6 + R() * 0.8;
      const tt = (o.freeze != null ? o.freeze : t) * sp + a0;
      s += op(pf, paperSheet(960 + Math.cos(tt) * r0 * 1.6, 420 + Math.sin(tt * 1.3) * r0 * 0.5, tt * 90, 1.1));
    }
  }
  if (o.lastPaper != null) s += paperSheet(1000 + Math.sin(o.lastPaper * 3) * 60, lerp(260, 760, ease.sine(clamp(o.lastPaper / 1.0))), Math.sin(o.lastPaper * 4) * 30, 1.1);
  return s;
}
function crisisBg(warm = 0, chaos = 0) {
  return paperBg({ base: mix('#20243a', C.bg, warm), base2: mix('#171a2b', C.bg2, warm), floorY: GY, dark: warm < 0.5 })
    + doodles(11, warm < 0.5 ? '#ffffff' : C.ink, 0.06);
}
const alarmOverlay = (t, chaos) => (chaos > 0 ? `<rect width="1920" height="1080" fill="${C.red}" opacity="${n2(chaos * (0.05 + 0.05 * Math.sin(t * 9)))}"/>` : '');

// ============================================================
// Cenário 2: palco claro
// ============================================================
function stageBg(o = {}) {
  let s = paperBg({ floorY: GY, base: o.base, base2: o.base2 });
  s += doodles(o.seed ?? 21);
  for (const b of o.blobs ?? []) s += blob(...b);
  return s;
}

// ============================================================
// Cenário 3: escritório (vista lateral, mundo largo)
// ============================================================
function officeWorld(t, o = {}) {
  let s = `<rect x="-1200" y="-200" width="7000" height="${GY + 200}" fill="${o.wall ?? '#f1e7d6'}"/>`;
  s += `<rect x="-1200" y="${GY - 150}" width="7000" height="18" fill="#e3d2b4"/>`;
  for (let x = -600; x < 5200; x += 640) {
    s += windowPane(x, 120, 400, 300, { city: true, frame: '#fffdf8' });
    s += `<rect x="${x + 450}" y="200" width="120" height="150" rx="10" fill="${['#ffd6a5', '#bde0fe', '#caffbf', '#ffc6ff'][((x / 640) | 0) & 3]}" opacity=".9"/><rect x="${x + 468}" y="222" width="84" height="12" rx="6" fill="rgba(0,0,0,.15)"/><rect x="${x + 468}" y="246" width="60" height="12" rx="6" fill="rgba(0,0,0,.1)"/>`;
  }
  s += `<rect x="-1200" y="${GY}" width="7000" height="400" fill="#e6d6b8"/>`;
  for (let x = -460; x < 5200; x += 640) {
    if (o.skipDesk && Math.abs(x + 200 - o.skipDesk) < 300) continue;
    s += monitor(x + 200, 762, 150, 104, ['chart', 'code', 'chart'][((x / 640) | 0) % 3 & 3] ?? 'chart', t);
    s += desk(x + 200, 760, 330, { h: 120 });
    s += plant(x + 430, GY, 0.85, ['#d9784a', '#5b8def', '#e0a93b'][((x / 640) | 0) % 3 & 3] ?? '#d9784a');
  }
  return s;
}

// ============================================================
// Cenário 4: mapa dos projetos
// ============================================================
const PX = [800, 2000, 3200, 4400, 5600, 6800];
const PLACE_COL = ['#cdeedd', '#d3e9ff', '#dfe3f5', '#f9e3c4', '#dcd6ff', '#ffe1cc'];
const MASCOT = ['cuidado', 'frasco', 'acelerado', 'campo', 'astro', 'obrinha'];
const TEAM = [['bruno'], ['jose', 'nara'], ['marcos', 'thauany'], ['joao', 'mancini', 'jaqueline'], ['giovanna', 'pedro'], ['monica']];
const PLACES = [placeClinic, placeLab, placeTrack, placeFarm, placeSpace, placeSite];

function roadPath(x0, x1) {
  let d = '';
  for (let x = x0; x <= x1; x += 150) {
    const y = 905 + 22 * Math.sin(x / 520);
    d += (x === x0 ? 'M' : 'L') + x + ' ' + n2(y);
  }
  return d;
}

function mapWorld(t, o = {}) {
  const fix = o.fix ?? [0, 0, 0, 0, 0, 0], fixAge = o.fixAge ?? [-1, -1, -1, -1, -1, -1];
  let s = `<rect x="-2000" y="${GY - 20}" width="14000" height="600" fill="#eadcc0"/>`;
  // Argentina
  s += `<path d="${blobPath(4400, 640, 760, 99, 0.1)}" fill="#74acdf" opacity=".12"/>`;
  for (const [x, a, b] of [[3800, 'BRASIL', 'ARGENTINA'], [5000, 'ARGENTINA', 'BRASIL']]) {
    s += `<path d="M${x} 120 V1060" stroke="#4f7fb8" stroke-width="5" stroke-dasharray="18 14" opacity=".55"/>`;
    s += text(a, x - 24, 150, { size: 26, weight: 900, fill: '#4f7fb8', anchor: 'end', ls: '2' }) + text(b, x + 24, 150, { size: 26, weight: 900, fill: '#4f7fb8', anchor: 'start', ls: '2' });
  }
  PX.forEach((x, i) => (s += blob(x, 560, 400, PLACE_COL[i], 0.55, 30 + i)));
  PX.forEach((x, i) => (s += PLACES[i](x + 60, 790, fix[i], t, fixAge[i])));
  s += road(roadPath(-600, o.roadEnd ?? 7600));
  if (o.newRoad) s += op(o.newRoad, `<path d="${roadPath(7500, 9300)}" stroke="#d9c49a" stroke-width="12" fill="none" stroke-dasharray="30 24" stroke-linecap="round"/>`);
  PX.forEach((x, i) => (s += pin(x + 430, 905 + 22 * Math.sin((x + 430) / 520), PROJETOS[i].n, C.blue, o.pins ?? 1)));
  [7800, 8350, 8900].forEach((x, i) => {
    const k = clamp(((o.newPins ?? 0) - i * 0.25) / 0.4);
    if (k > 0) s += pin(x, 905 + 22 * Math.sin(x / 520), 'FY27', C.green, k) + op(k, g(tr(x, 700, ease.back(k)), `<rect x="-80" y="-40" width="160" height="80" rx="20" fill="#fffdf8" stroke="${C.green}" stroke-width="4" stroke-dasharray="12 9"/>` + text('?', 0, 22, { size: 60, weight: 900, fill: C.green })));
  });
  // nuvens, sóis e personagens
  PX.forEach((x, i) => {
    s += rainCloud(x + 60, 300, 1 - fix[i], t + i);
    s += sun(x + 330, 230, clamp((fixAge[i] - 0.1) / 0.5), t);
    const mx = x - 400;
    const after = fix[i] > 0.5;
    const ma = fixAge[i];
    const mascotSt = { x: mx, y: i === 4 ? 860 - 30 - Math.sin(t * 2) * 10 : 885, t: t + i, expr: after ? (ma < 1.4 ? 'joy' : 'happy') : 'worried', gaze: after ? [0.3, 0] : [0.4, -0.8] };
    if (after) { mascotSt.armL = ma < 1.6 ? 110 + Math.sin(t * 9) * 12 : 30; mascotSt.armR = ma < 1.6 ? 110 + Math.sin(t * 9 + 1) * 12 : -10; mascotSt.hop = ma > 0 && ma < 0.5 ? Math.sin((ma / 0.5) * Math.PI) * 40 : 0; }
    else { mascotSt.armL = -20 + Math.sin(t * 2) * 4; mascotSt.armR = -20; mascotSt.sweat = 0.8; }
    if (i === 2) mascotSt.propR = 'wrench';
    if (i === 5) mascotSt.propR = 'blueprint';
    s += ch(MASCOT[i], mascotSt);
    if (o.showTeam !== false) TEAM[i].forEach((id, j) => {
      const k = clamp((ma - 0.05 - j * 0.12) / 0.4);
      if (k <= 0) return;
      const tx = mx + 175 + j * 130;
      const hop = Math.sin(clamp(k) * Math.PI) * 60;
      s += ch(id, { x: tx, y: 885, s: 1.25, t: t + j, expr: 'happy', hop, alpha: clamp(k * 3), armR: ma > 0.6 && ma < 2 ? 100 + Math.sin(t * 9 + j) * 12 : -20 });
    });
    if (fixAge[i] > 0.15) s += checkBadge(mx, 560, clamp((fixAge[i] - 0.15) / 0.4), 0.9);
    s += burst(mx, 600, fixAge[i] - 0.1, { r: 170, n: 12 });
  });
  return s;
}
const mapBg = () => paperBg({ floorY: 2000 }) + doodles(31, C.ink, 0.06, [0, 0, 1920, 1080]);

// ============================================================
// Cenário 5: quadro do framework (cena 4)
// ============================================================
function frameworkBoard(t, lt) {
  let s = `<rect x="150" y="60" width="1620" height="960" rx="30" fill="#fffdf6" filter="url(#ds)"/>`;
  s += text('Framework A&M × TOTVS', 960, 140, { size: 52, weight: 900 });
  s += text('ilustrativo · substituir pelos slides 7, 9, 10 e 11', 960, 178, { size: 22, weight: 700, fill: C.soft, family: 'DM Sans' });
  const panel = (x, y, title, n) => `<rect x="${x}" y="${y}" width="740" height="380" rx="22" fill="#f6efe2"/>` + text(title, x + 30, y + 50, { size: 30, weight: 900, anchor: 'start' }) + text(`slide ${n}`, x + 710, y + 48, { size: 18, weight: 800, fill: C.soft, anchor: 'end', ls: '1' });
  s += panel(200, 210, 'Visão integrada', 7) + panel(980, 210, 'Ciclo de vida das MITs', 9) + panel(200, 620, 'Remediação', 10) + panel(980, 620, 'Ferramentas + IA', 11);
  // (a) Venn
  const pa = clamp(lt / 0.8), pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const vx = lerp(130, 100, ease.out(pa));
  s += `<clipPath id="vennL"><circle cx="${n2(570 - vx)}" cy="420" r="130"/></clipPath>`;
  s += `<circle cx="${n2(570 - vx)}" cy="420" r="130" fill="${C.navy}" opacity=".9"/><circle cx="${n2(570 + vx)}" cy="420" r="130" fill="${C.blue}" opacity=".9"/>`;
  s += `<circle cx="${n2(570 + vx)}" cy="420" r="130" fill="${mix('#ffb020', '#ffd76a', pulse)}" clip-path="url(#vennL)"/>`;
  s += text('A&M', 570 - vx - 50, 430, { size: 34, weight: 900, fill: '#fff' }) + text('TOTVS', 570 + vx + 50, 430, { size: 34, weight: 900, fill: '#fff' }) + text('1 TIME', 570, 432, { size: 26, weight: 900, fill: C.ink });
  // (b) MITs
  const stages = ['Abertura', 'Análise', 'Desenv.', 'Testes', 'Entrega'];
  const tok = ((t * 0.6) % 1) * 4;
  stages.forEach((nm, i) => {
    const x = 1030 + i * 132, on = tok >= i;
    s += `<rect x="${x}" y="300" width="116" height="62" rx="14" fill="${on ? C.blue : '#e3dccd'}"/>` + text(nm, x + 58, 338, { size: 20, weight: 800, fill: on ? '#fff' : C.soft });
    if (i < 4) s += `<path d="M${x + 118} 331 h12" stroke="${C.soft}" stroke-width="4"/>`;
  });
  [['Baixa', 0.35, C.green], ['Média', 0.6, C.amber], ['Alta', 0.85, C.red]].forEach(([nm, w, c], i) => {
    const y = 410 + i * 54, k = clamp((lt - 2.6 - i * 0.15) / 0.6);
    s += text(nm, 1030, y + 24, { size: 22, weight: 800, anchor: 'start' }) + `<rect x="1120" y="${y}" width="560" height="34" rx="17" fill="#e8e0d0"/><rect x="1120" y="${y}" width="${n2(560 * w * ease.out(k))}" height="34" rx="17" fill="${c}"/>`;
  });
  s += text('SLA por complexidade', 1690, 400, { size: 18, weight: 800, fill: C.soft, anchor: 'end' });
  // (c) Remediação
  const pr = clamp((lt - 4.9) / 1.8);
  s += `<rect x="290" y="830" width="560" height="16" rx="8" fill="#e3dccd"/><rect x="290" y="830" width="${n2(560 * ease.inOut(pr))}" height="16" rx="8" fill="${C.green}"/>`;
  s += g(tr(270, 838), `<path d="M-30 -12 l12 -18 h36 l12 18 v24 l-12 18 h-36 l-12 -18z" fill="${C.red}"/>${text('PARE', 0, 8, { size: 16, weight: 900, fill: '#fff' })}`) + text('PROJETO PARADO', 270, 920, { size: 20, weight: 900, fill: C.red });
  s += g(tr(870, 838), `<rect x="-4" y="-60" width="7" height="70" fill="${C.ink}"/><path d="M3 -60 h46 l-10 16 l10 16 h-46z" fill="${C.green}"/>`) + text('GO-LIVE', 880, 920, { size: 20, weight: 900, fill: C.green });
  [0.25, 0.5, 0.75].forEach(m => (s += `<circle cx="${n2(290 + 560 * m)}" cy="838" r="14" fill="${pr >= m ? C.green : '#fff'}" stroke="${pr >= m ? C.green : '#cfc6b4'}" stroke-width="4"/>`));
  s += g(tr(290 + 560 * ease.inOut(pr), 800), `<rect x="-34" y="-30" width="68" height="34" rx="10" fill="${C.blue}"/><circle cx="-18" cy="6" r="9" fill="${C.ink}"/><circle cx="18" cy="6" r="9" fill="${C.ink}"/>`);
  // (d) Ferramentas + IA
  const ia = clamp((lt - 7.3) / 0.5);
  s += g(tr(1350, 840, ease.back(Math.max(0.001, ia))), `<circle r="66" fill="${C.purple}"/>${text('IA', 0, 16, { size: 50, weight: 900, fill: '#fff' })}`);
  ['Claude', 'Luria', 'Xray', 'DataHub'].forEach((nm, i) => {
    const a = (i / 4) * TAU + t * 0.5 - 0.8, k = clamp((lt - 7.5 - i * 0.12) / 0.4);
    const x = 1350 + Math.cos(a) * 230, y = 840 + Math.sin(a) * 110;
    const w = measure(nm, '800 26px Outfit') + 40;
    s += op(k, `<path d="M1350 840 L${n2(x)} ${n2(y)}" stroke="#c9b8f5" stroke-width="4" stroke-dasharray="8 8"/>` + g(tr(x, y, ease.back(Math.max(0.001, k))), `<rect x="${n2(-w / 2)}" y="-24" width="${n2(w)}" height="48" rx="24" fill="#fff" stroke="${C.purple}" stroke-width="3"/>${text(nm, 0, 9, { size: 26, weight: 800, fill: C.purple })}`));
  });
  return s;
}

// ============================================================
// Planos
// ============================================================
const P = {};

// ---------- CENA 1 ----------
P.c1_black = lt => {
  let hud = `<rect width="1920" height="1080" fill="#0b0c10"/>`;
  const pings = [[0.05, 300, 260, '1'], [0.25, 1500, 330, '3'], [0.42, 760, 760, '7'], [0.56, 1240, 180, '12'], [0.66, 420, 600, '!'], [0.74, 1620, 720, '9+'], [0.81, 980, 470, '28'], [0.87, 200, 880, '!'], [0.92, 1400, 900, '99+']];
  for (const [at, x, y, n] of pings) {
    const k = clamp((lt - at) / 0.18);
    if (k <= 0) continue;
    const w = 46 + n.length * 16;
    hud += g(tr(x, y, ease.bounce(k)), `<rect x="-90" y="-36" width="150" height="72" rx="20" fill="#2a2d38"/><rect x="-74" y="-16" width="90" height="10" rx="5" fill="#4a4f60"/><rect x="-74" y="4" width="60" height="10" rx="5" fill="#4a4f60"/><rect x="${n2(60 - w / 2)}" y="-56" width="${w}" height="44" rx="22" fill="${C.red}"/>${text(n, 60, -25, { size: 26, weight: 900, fill: '#fff' })}`);
  }
  return { hud, chrome: false, bg: '' };
};

const SLAMS = {
  c1_wide: ['ESCOPO SUBDIMENSIONADO.', C.red],
  c1_monitors: ['REWORK.', C.amber],
  c1_stress: ['MAPEAMENTO DE PROCESSOS DESALINHADO', '#7c3aed'],
  c1_calendar: ['GO-LIVE ADIADO.', C.red],
};
function slamHud(id, lt, t) {
  const [str, col] = SLAMS[id];
  const k = clamp((lt - 0.08) / 0.22);
  const sh = (1 - k) * 0;
  return tag(str, 960 + sh, 210, { bg: col, size: str.length > 24 ? 50 : 70, k, rot: -3 + Math.sin(t * 3) * 0.5 });
}
const docPanic = (t, lt) => ({ expr: 'panic', armL: 118 + Math.sin(t * 7) * 6, armR: 118 + Math.sin(t * 7 + 1) * 6, lenL: 30, lenR: 30, sweat: 1, gaze: [Math.sin(t * 5) * 0.8, -0.2], hop: Math.abs(Math.sin(t * 6)) * 6 });

P.c1_wide = (lt, t) => {
  const [sx, sy] = shake(t, 4);
  return { bg: crisisBg(0, 1), world: crisisRoom(t, { chaos: 1, doc: docPanic(t, lt) }) + alarmOverlay(t, 1), cam: [960 + sx, 640 + sy, lerp(1.22, 1.3, lt / 1.8), Math.sin(t * 2) * 0.6], hud: slamHud('c1_wide', lt, t) };
};
P.c1_monitors = (lt, t) => {
  const [sx, sy] = shake(t, 3);
  return { bg: crisisBg(0, 1), world: crisisRoom(t, { chaos: 1, doc: docPanic(t, lt) }) + alarmOverlay(t, 1), cam: [700 + sx, 700 + sy, lerp(2.1, 2.25, lt / 1.6), -2], hud: slamHud('c1_monitors', lt, t) };
};
P.c1_stress = (lt, t) => {
  const [sx, sy] = shake(t, 3);
  return { bg: crisisBg(0, 1), world: crisisRoom(t, { chaos: 1, doc: docPanic(t, lt) }) + alarmOverlay(t, 1), cam: [1010 + sx, 640 + sy, lerp(1.9, 2.05, lt / 2), 4], hud: slamHud('c1_stress', lt, t) };
};
P.c1_calendar = (lt, t) => {
  const [sx, sy] = shake(t, lt > 0.9 && lt < 1.1 ? 10 : 2);
  return { bg: crisisBg(0, 1), world: crisisRoom(t, { chaos: 1, doc: docPanic(t, lt), stampK: clamp((lt - 0.9) / 0.2) }) + alarmOverlay(t, 1), cam: [1590 + sx, 460 + sy, lerp(1.7, 1.8, lt / 2), -3], hud: slamHud('c1_calendar', lt, t) };
};
P.c1_silence = (lt, t, p) => {
  const T0 = p.t0; // congela tudo no início do plano
  const world = crisisRoom(T0, { chaos: 0, freeze: T0, papers: 0, stampK: 1, lastPaper: lt, doc: { expr: 'surprised', armL: -10, armR: -10, gaze: [0, -0.6], blink: 0 } });
  return { bg: crisisBg(0, 0), world, cam: [960, 640, 1.22], hud: `<rect width="1920" height="1080" fill="#000" opacity=".18"/>` };
};
P.c1_call = (lt, t) => {
  const warm = seg(lt, 3.3, 6.0) * 0.75;
  const reach = seg(lt, 2.6, 3.2), picked = lt >= 3.3;
  const doc = { expr: lt < 1.6 ? ['surprised', 'worried', seg(lt, 0, 1.2)] : picked ? ['worried', 'happy', seg(lt, 3.3, 4.2)] : 'thinking', gaze: picked ? [-0.3, 0] : [0.7, 0.5], armL: -20, armR: picked ? 81 : lerp(-20, -5, reach), lenR: picked ? 31 : lerp(24, 50, reach), propR: picked ? 'phone' : null, talk: lt > 4.2 && lt < 6 ? 0.5 : 0, headTilt: picked ? 8 : 0 };
  const z = lerp(1.22, 1.75, ease.inOut(clamp(lt / 6.2)));
  return { bg: crisisBg(warm, 0), world: crisisRoom(t, { chaos: 0, warm, picked: picked ? 1 : -1, papers: 0, doc }), cam: [lerp(960, 1060, ease.inOut(clamp(lt / 6.2))), lerp(640, 660, ease.inOut(clamp(lt / 6.2))), z] };
};
P.c1_seed = (lt, t) => {
  let world = blob(960, 520, 520, '#caffbf', 0.45, 7) + blob(600, 420, 300, '#ffd6a5', 0.35, 8) + blob(1380, 440, 320, '#bde0fe', 0.4, 9);
  world += desk(960, 820, 520, { h: 60 });
  world += seedling(960, 820, seg(lt, 0.4, 3.0, ease.out), t, { s: 1.15 });
  world += burst(960, 560, lt - 2.4, { r: 200 });
  const words = ['Toda', 'parceria', 'tem', 'um', 'começo.'];
  const font = '900 76px Outfit';
  const widths = words.map(w => measure(w, font));
  const total = widths.reduce((a, b) => a + b, 0) + 22 * (words.length - 1);
  let x = 960 - total / 2, hud = '';
  words.forEach((w, i) => {
    const k = clamp((lt - 0.15 - i * 0.16) / 0.3);
    if (k > 0) hud += op(clamp(k * 2), g(tr(x + widths[i] / 2, 250 + (1 - ease.back(k)) * 30), text(w, 0, 0, { size: 76, weight: 900, fill: i === 4 ? C.blue : C.ink })));
    if (i === 4) { const u = clamp((lt - 1.1) / 0.5); hud += `<path d="M${n2(x)} 272 q${n2(widths[i] / 2)} 16 ${n2(widths[i] * u)} ${n2(-4 * u)}" stroke="${C.amber}" stroke-width="9" fill="none" stroke-linecap="round"/>`; }
    x += widths[i] + 22;
  });
  return { bg: stageBg({ seed: 41 }), world, cam: [960, 560, lerp(1.0, 1.05, lt / 3.8)], hud };
};

// ---------- CENA 2 ----------
P.c2_handshake = (lt, t) => {
  let world = blob(520, 460, 380, '#cfe3ff', 0.7, 12) + blob(1400, 460, 380, '#d6dcff', 0.7, 13);
  world += easel(520, GY, 300) + logoCard('totvs', 520, 470, 440, 240, { k: clamp((lt - 0.1) / 0.5) });
  world += easel(1400, GY, 300) + logoCard('alvarez-marsal', 1400, 470, 440, 240, { k: clamp((lt - 3.9) / 0.5) });
  const walkK = seg(lt, 6.2, 7.1, ease.inOut);
  const walking = lt > 6.2 && lt < 7.1;
  const mx = lerp(760, 872, walkK), cx = lerp(1180, 1050, walkK);
  const shakeA = lt > 7.1 ? Math.sin(t * 14) * 6 : 0;
  const hs = seg(lt, 6.9, 7.2);
  world += ch('modulo', { x: mx, y: GY, t, walk: walking ? W(t, 2.2) : null, expr: lt > 7.1 ? 'joy' : lt < 4 ? 'happy' : 'neutral', armL: lt < 3.6 && lt > 0.6 ? 100 + Math.sin(t * 8) * 14 : -20, armR: lerp(-20, 4 + shakeA, hs), lenR: lerp(24, 40, hs), gaze: lt > 4 ? [0.8, 0] : [0, 0], front: 'tablet' });
  world += ch('cronos', { x: cx, y: GY, t, dir: -1, walk: walking ? W(t, 2.2) : null, expr: lt > 7.1 ? 'proud' : lt > 4 ? 'sly' : 'neutral', armR: lerp(-25, 4 - shakeA, hs), lenR: lerp(24, 40, hs), armL: lt > 4.2 && lt < 6 ? 30 : -25, propL: 'clipboard', gaze: lt < 4 ? [0.6, 0] : [0, 0] });
  world += burst(962, 760, lt - 7.15, { r: 200, n: 14 });
  const cam = lt < 4.0 ? [kf(lt, [[0, 600], [4, 680]]), 560, 1.25] : lt < 6.1 ? [kf(lt, [[4.0, 680], [4.6, 1290], [6.1, 1320]]), 560, 1.25] : [kf(lt, [[6.1, 1320], [7.0, 960]]), kf(lt, [[6.1, 560], [7.0, 600]]), kf(lt, [[6.1, 1.25], [7.0, 1.15]])];
  // etiquetas de identidade no mundo
  world += tag('TOTVS · tecnologia', 520, 230, { k: clamp((lt - 0.9) / 0.35), bg: C.blue, size: 34, rot: -3 });
  world += tag('A&M Performance', 1400, 230, { k: clamp((lt - 4.5) / 0.35), bg: C.navy, size: 34, rot: 3 });
  return { bg: stageBg({ seed: 51 }), world, cam };
};

P.c2_leader = (lt, t) => {
  const ax = 700 + lt * 210;
  let world = officeWorld(t);
  const team = [['bruno', 170, 'happy'], ['monica', 300, 'proud'], ['pedro', 430, 'happy'], ['thauany', 560, 'happy']];
  team.slice().reverse().forEach(([id, d, e], i) => (world += ch(id, { x: ax - d, y: GY + 12, t: t + i, walk: W(t + i * 0.13, 1.8), expr: e, s: 1.35 })));
  world += ch('antonialli', { x: ax, y: GY + 14, t, walk: W(t, 1.8), expr: 'determined', s: 1.45, gaze: [0.6, 0] });
  const hud = lowerThird('Guilherme Antonialli', 'Liderança da parceria A&M + TOTVS · Diretor Sênior', lt - 0.4, 6.4, { y: 140, color: C.navy });
  return { bg: paperBg({ floorY: 2000 }), world, cam: [ax + 160, 560, 1.0], hud };
};

P.c2_values = (lt, t) => {
  const blocks = [['TECNOLOGIA', C.blue, 520], ['GESTÃO', C.navy, 960], ['TRANSFORMAÇÃO', '#14a3a0', 1400]];
  let world = blob(960, 520, 520, '#ffe7b8', 0.5, 14);
  blocks.forEach(([nm, col, x], i) => {
    const t0 = 0.15 + i * 0.55, u = clamp((lt - t0) / 0.45);
    if (u <= 0) return;
    const y = lerp(-200, GY, ease.in(Math.min(1, u * 1.15)));
    const sq = u > 0.85 ? 1 + 0.18 * Math.sin(clamp((u - 0.85) / 0.15) * Math.PI) : 1;
    const hop = lt > 2.1 ? Math.max(0, Math.sin((lt - 2.1 - i * 0.08) * 9)) * 30 * clamp(1 - (lt - 2.1)) : 0;
    world += g(tr(x, y - hop, 1, 0, sq, 1 / sq), `<ellipse cx="0" cy="0" rx="190" ry="10" fill="${C.shadow}"/><rect x="-190" y="-140" width="380" height="140" rx="28" fill="${col}" filter="url(#dsSoft)"/>` + `<path d="M-160 -112 q8 -16 30 -18" stroke="rgba(255,255,255,.4)" stroke-width="6" fill="none" stroke-linecap="round"/>` + text(nm, 0, -55, { size: nm.length > 10 ? 40 : 48, weight: 900, fill: '#fff' }));
    if (i < 2) world += op(clamp((lt - t0 - 0.3) / 0.2), text('+', x + 220, GY - 50, { size: 70, weight: 900, fill: C.soft }));
  });
  const vk = clamp((lt - 1.95) / 0.4);
  world += tag('= VALOR', 960, 430, { k: vk, bg: 'url(#gold)', fg: C.ink, size: 96, rot: -4 });
  world += burst(960, 430, lt - 2.0, { r: 260, n: 14 });
  world += ch('modulo', { x: 170, y: GY, t, expr: lt > 2 ? 'joy' : 'happy', armL: lt > 2 ? 110 + Math.sin(t * 9) * 10 : -20, armR: lt > 2 ? 110 : -20, s: 1.2 });
  world += ch('cronos', { x: 1750, y: GY, t, dir: -1, expr: lt > 2 ? 'proud' : 'neutral', armR: lt > 2 ? 110 + Math.sin(t * 9) * 10 : -25, propL: 'clipboard', s: 1.2 });
  return { bg: stageBg({ seed: 61 }), world, cam: [960, 560, 1.0] };
};

P.c2_unimed = (lt, t) => {
  const u = seg(lt, 0.2, 2.7, ease.inOut);
  const z = Math.exp(lerp(Math.log(0.27), Math.log(1.0), u));
  const cam = [lerp(3800, PX[0] - 250, u), lerp(560, 560, u), z];
  const world = mapWorld(t, { pins: clamp(lt / 0.8) });
  const hud = tag('PROJETO PIONEIRO', 960, 190, { k: clamp((lt - 1.4) / 0.35), bg: C.green, size: 44, rot: -3 });
  return { bg: mapBg(), world, cam, hud };
};

// ---------- CENA 3 ----------
function projectShot(i) {
  return (lt, t) => {
    const fix = [0, 0, 0, 0, 0, 0], fixAge = [-1, -1, -1, -1, -1, -1];
    for (let j = 0; j < i; j++) { fix[j] = 1; fixAge[j] = 99; }
    const FIX = 3.1;
    fix[i] = seg(lt, FIX, FIX + 0.5);
    fixAge[i] = lt - FIX;
    const from = i === 0 ? PX[0] - 250 : PX[i - 1] - 250;
    const cx = lt < 0.9 ? lerp(from, PX[i] - 250, ease.inOut(clamp(lt / 0.9))) : PX[i] - 250 + (lt - 0.9) * 8;
    const zz = 1 + 0.06 * bump(lt, 0, 0.9) * -1;
    const world = mapWorld(t, { fix, fixAge });
    const hud = projectCard(PROJETOS[i], lt - 0.25, lt - FIX - 0.2, 5.95);
    return { bg: mapBg(), world, cam: [cx, 560, zz], hud };
  };
}
PROJETOS.forEach((_, i) => (P[`c3_p${i + 1}`] = projectShot(i)));

P.c3_summary = (lt, t) => {
  const u = seg(lt, 0.0, 1.6, ease.inOut);
  const z = Math.exp(lerp(Math.log(1.0), Math.log(0.255), u));
  const cam = [lerp(PX[5] - 250, 3800, u), lerp(560, 640, u), z];
  const world = mapWorld(t, { fix: [1, 1, 1, 1, 1, 1], fixAge: [99, 99, 99, 99, 99, 99] });
  let hud = '';
  ['unimed', 'funed', 'caoa', 'john-deere', 'hughes', 'libercon'].forEach((n, i) => (hud += logoCard(n, 310 + i * 260, 205, 220, 110, { k: clamp((lt - 0.3 - i * 0.08) / 0.4), r: 18 })));
  [['6 PROJETOS', C.blue, 1.0], ['2 PAÍSES', '#4f7fb8', 1.8], ['13 PESSOAS', '#14a3a0', 2.6], ['UMA PARCERIA', C.amber, 3.4]].forEach(([s2, col, at], i) => {
    hud += tag(s2, 360 + i * 400, 390, { k: clamp((lt - at) / 0.35), bg: col, size: 50, rot: i % 2 ? 3 : -3 });
  });
  return { bg: mapBg(), world, cam, hud };
};

// ---------- CENA 4 ----------
P.c4_method = (lt, t) => {
  const steps = ['APRENDIZADO', 'MÉTODO', 'PADRÃO', 'PREVISIBILIDADE'];
  const cols = [C.blue, '#3d7bff', '#14a3a0', C.amber];
  const appear = [0.4, 1.5, 2.7, 3.9];
  let world = blob(960, 520, 560, '#d6e6ff', 0.55, 15);
  steps.forEach((nm, i) => {
    const u = clamp((lt - appear[i]) / 0.45);
    if (u <= 0) return;
    const h = 110 * (i + 1) * ease.bounce(u);
    const x = 560 + i * 300;
    world += `<rect x="${x - 140}" y="${n2(GY - h)}" width="280" height="${n2(h)}" rx="22" fill="${cols[i]}" filter="url(#dsSoft)"/>` + op(clamp(u * 2), text(nm, x, GY - h + 62, { size: nm.length > 10 ? 27 : 34, weight: 900, fill: i === 3 ? C.ink : '#fff' }));
  });
  // Cronos sobe a escada aos pulinhos
  const tops = [GY, GY - 110, GY - 220, GY - 330, GY - 440];
  const xs = [300, 560, 860, 1160, 1460];
  let k = 0;
  for (let i = 0; i < 4; i++) if (lt > appear[i] + 0.5) k = i + 1;
  const hopStart = k > 0 ? appear[k - 1] + 0.5 : 0;
  const hu = clamp((lt - hopStart) / 0.45);
  const x = k > 0 ? lerp(xs[k - 1], xs[k], ease.inOut(hu)) : xs[0];
  const y = k > 0 ? lerp(tops[k - 1], tops[k], hu) - Math.sin(hu * Math.PI) * 90 : tops[0];
  world += ch('cronos', { x, y, t, expr: k === 4 && hu > 0.9 ? 'proud' : 'determined', propL: 'clipboard', armR: k === 4 && hu > 0.9 ? 100 : -25, sx: hu < 1 && k > 0 ? 0.95 : 1, sy: hu < 1 && k > 0 ? 1.06 : 1 });
  world += ch('modulo', { x: 180, y: GY, t, expr: 'happy', armL: 100 + Math.sin(t * 8) * 12, front: 'tablet', gaze: [0.8, -0.6] });
  return { bg: stageBg({ seed: 71 }), world, cam: [960, 560, 1.0] };
};

P.c4_slides = (lt, t) => {
  const spots = [[570, 400], [1350, 400], [570, 810], [1350, 810]];
  const idx = Math.min(3, Math.floor(lt / 2.4));
  const lt2 = lt - idx * 2.4;
  const prev = spots[Math.max(0, idx - 1)], cur = spots[idx];
  const u = idx === 0 ? seg(lt, 0, 0.6) : ease.inOut(clamp(lt2 / 0.45));
  const cam = idx === 0 ? [lerp(960, cur[0], u), lerp(540, cur[1], u), lerp(1.0, 1.95, u)] : [lerp(prev[0], cur[0], u), lerp(prev[1], cur[1], u), 1.95 - 0.2 * bump(lt2, 0, 0.45)];
  const lines = ['UM TIME. PAPÉIS COMPLEMENTARES.', 'CADA MIT COM PRAZO, DONO E RASTREABILIDADE.', 'DO PROJETO PARADO AO GO-LIVE.', 'IA EM CADA FASE DO PROJETO.'];
  const hud = tag(lines[idx], 960, 150, { k: clamp((lt2 - 0.25) / 0.3), bg: C.ink, size: lines[idx].length > 34 ? 40 : 48, rot: -2 });
  return { bg: stageBg({ seed: 81, blobs: [[960, 540, 700, '#e3dcff', 0.4, 16]] }), world: frameworkBoard(t, lt), cam, hud };
};

P.c4_vinicius = (lt, t) => {
  let world = blob(700, 420, 420, '#e3dcff', 0.5, 17) + blob(1420, 480, 360, '#d3f1e6', 0.5, 18);
  // tela de apresentação
  const fly = clamp((lt - 2.0) / 0.75);
  world += `<rect x="330" y="200" width="620" height="380" rx="22" fill="#262a33"/><rect x="618" y="580" width="24" height="300" fill="#262a33"/><rect x="540" y="${GY - 10}" width="180" height="14" rx="7" fill="#262a33"/>`;
  const slide = `<rect x="-290" y="-170" width="580" height="340" rx="10" fill="#fff"/><rect x="-290" y="-170" width="580" height="58" rx="10" fill="#1f3b70"/>` + text('Status Report — Semana 37', -266, -131, { size: 26, weight: 800, fill: '#fff', anchor: 'start', family: 'DM Sans' }) + [0, 1, 2, 3, 4].map(i => `<circle cx="-256" cy="${-70 + i * 44}" r="6" fill="#9aa3b2"/><rect x="-236" y="${-78 + i * 44}" width="${300 + ((i * 53) % 140)}" height="14" rx="7" fill="#c9ced8"/>`).join('') + text('Slide 47 de 212', 270, 152, { size: 20, weight: 700, fill: '#6b7280', anchor: 'end', family: 'DM Sans' });
  if (fly <= 0) world += g(tr(640, 390), slide);
  // mesa com gaveta
  const open = seg(lt, 1.9, 2.25) * (1 - seg(lt, 2.7, 2.85));
  world += desk(1420, 740, 460, { h: 140 });
  world += `<rect x="${n2(1300 + open * 0)}" y="${n2(790 + open * 30)}" width="240" height="${n2(60 + open * 20)}" rx="8" fill="#a07a50"/><rect x="1395" y="${n2(812 + open * 40)}" width="50" height="10" rx="5" fill="#5b5f6a"/>`;
  if (fly > 0 && fly < 1) {
    const x = lerp(640, 1420, ease.inOut(fly)), y = lerp(390, 790, fly) - Math.sin(fly * Math.PI) * 260;
    world += g(tr(x, y, lerp(1, 0.12, fly), fly * 300), slide);
  }
  if (lt > 2.75 && lt < 3.4) for (let i = 0; i < 5; i++) { const u = (lt - 2.75) / 0.65; world += `<circle cx="${n2(1420 + (i - 2) * 50 * (0.5 + u))}" cy="${n2(780 - u * 40)}" r="${n2(26 * (1 - u))}" fill="#e2d2b2" opacity="${n2(0.9 * (1 - u))}"/>`; }
  // painéis e robôs
  const dashes = [['bars', 520, 300], ['line', 860, 250], ['donut', 1180, 330], ['kpi', 1500, 230]];
  dashes.forEach(([k2, x, y], i) => (world += dashCard(x, y, 270, 190, k2, clamp((lt - 3.1 - i * 0.2) / 0.4), t)));
  for (let i = 0; i < 3; i++) {
    const k = clamp((lt - 4.0 - i * 0.2) / 0.5);
    if (k > 0) world += op(clamp(k * 2), robot(lerp(2100, 400 + i * 520, ease.out(k)) + Math.sin(t * 1.3 + i) * 40, 560 + i * 40 + Math.sin(t * 2 + i) * 20, t, i, 0.9));
  }
  const pose = lt < 1.7 ? { armR: 40 + Math.sin(t * 3) * 6, expr: 'neutral', talk: 0.6, gaze: [-0.8, -0.2] } : lt < 3.0 ? { armR: 70, lenR: 30, expr: 'determined', gaze: [0.6, 0.4] } : { armR: 95 + Math.sin(t * 8) * 10, armL: 95, expr: 'joy', gaze: [0, -0.5] };
  world += ch('vinicius', { x: 1040, y: GY, t, ...pose });
  let hud = lowerThird('Vinicius de Sousa', 'Delivery Center', lt - 0.3, 2.9, { y: 140, color: C.blue });
  hud += tag('MENOS PPT NA GAVETA.', 700, 760, { k: clamp((lt - 2.4) / 0.3), bg: C.red, size: 46, rot: -4 });
  hud += tag('MAIS RESULTADO NO P&L.', 1280, 760, { k: clamp((lt - 3.2) / 0.3), bg: C.green, size: 46, rot: 3 });
  if (lt > 4.6) hud = tag('MENOS PPT NA GAVETA.', 700, 140, { bg: C.red, size: 40, rot: -4, alpha: 1 }) + tag('MAIS RESULTADO NO P&L.', 1260, 140, { bg: C.green, size: 40, rot: 3 });
  return { bg: stageBg({ seed: 91 }), world, cam: [960, 560, 1.0], hud };
};

// ---------- CENA 5 ----------
const ALL8 = ['modulo', 'cuidado', 'frasco', 'acelerado', 'campo', 'astro', 'obrinha', 'cronos'];
P.c5_pl = (lt, t) => {
  let world = blob(960, 420, 600, '#fff1c9', 0.6, 19);
  const letters = ['P', '&', 'L'];
  letters.forEach((L, i) => {
    const k = clamp((lt - 0.1 - i * 0.15) / 0.4);
    world += op(clamp(k * 2), g(tr(760 + i * 200, 360 - (1 - ease.bounce(k)) * 80), `<rect x="-85" y="-110" width="170" height="200" rx="30" fill="url(#gold)" filter="url(#dsSoft)"/>` + text(L, 0, 50, { size: 150, weight: 900, fill: C.ink })));
  });
  ALL8.forEach((id, i) => {
    const hopT = lt - 2.25 - i * 0.07;
    const hop = hopT > 0 && hopT < 0.5 ? Math.sin((hopT / 0.5) * Math.PI) * 70 : 0;
    world += ch(id, { x: 200 + i * 217, y: GY, t: t + i, s: 1.15, expr: lt > 2.2 ? 'joy' : 'happy', hop, armL: hop > 5 ? 110 : -20, armR: hop > 5 ? 110 : -20, propR: id === 'obrinha' ? 'blueprint' : undefined, propL: id === 'cronos' ? 'clipboard' : undefined });
  });
  return { bg: stageBg({ seed: 101 }), world, cam: [960, 560, 1.0] };
};

function barsWorld(t, lt, o = {}) {
  let s = blob(960, 500, 600, '#fff1c9', 0.55, 20);
  s += `<rect x="460" y="${GY}" width="1000" height="6" rx="3" fill="${C.ink}" opacity=".7"/>`;
  const h26 = 430 * ease.bounce(clamp((o.b26 ?? 0)));
  const h27 = 560 * ease.bounce(clamp((o.b27 ?? 0)));
  s += `<rect x="620" y="${n2(GY - h26)}" width="240" height="${n2(h26)}" rx="20" fill="url(#gold)" filter="url(#dsSoft)"/>`;
  if (h26 > 40) s += `<path d="M650 ${n2(GY - h26 + 40)} q10 -18 34 -20" stroke="rgba(255,255,255,.5)" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  s += `<rect x="1060" y="${n2(GY - h27)}" width="240" height="${n2(h27)}" rx="20" fill="rgba(74,163,255,.22)" stroke="${C.blue}" stroke-width="6" stroke-dasharray="20 14"/>`;
  if (h27 > 80) s += text('previsto', 1180, GY - h27 + 56, { size: 30, weight: 800, fill: C.blue });
  s += text('FY26', 740, GY + 56, { size: 40, weight: 900 }) + text('FY27', 1180, GY + 56, { size: 40, weight: 900, fill: C.blue });
  if (o.coins) {
    const R = rng(9);
    for (let i = 0; i < 26; i++) {
      const x = 480 + R() * 960, sp = 300 + R() * 300, ph = R();
      const y = ((o.coins * sp + ph * 900) % 1000) - 100;
      s += g(tr(x, y, 1, o.coins * 200 + i * 30, Math.cos(o.coins * 6 + i), 1), `<circle r="26" fill="url(#gold)" stroke="#c88a10" stroke-width="3"/>` + text('R$', 0, 8, { size: 18, weight: 900, fill: '#8a5a00' }));
    }
  }
  return s;
}

P.c5_numbers = (lt, t) => {
  let world = barsWorld(t, lt, { b26: (lt - 0.2) / 1.2, b27: (lt - 2.6) / 1.2 });
  world += ch('modulo', { x: 280, y: GY, t, s: 1.2, expr: lt > 1 ? 'excited' : 'surprised', gaze: [0.8, -0.8], front: 'tablet' });
  world += ch('cronos', { x: 1660, y: GY, t, s: 1.2, dir: -1, expr: lt > 3.2 ? 'excited' : 'surprised', gaze: [0.8, -0.8], propL: 'clipboard' });
  let hud = tag(VALORES.fy26 + ' NO FY26', 740, 170, { k: clamp((lt - 0.9) / 0.35), bg: 'url(#gold)', fg: C.ink, size: 58, rot: -3 });
  hud += tag(VALORES.fy27 + ' JÁ PREVISTOS PARA O FY27', 1180, 290, { k: clamp((lt - 3.1) / 0.35), bg: C.blue, size: 40, rot: 2 });
  world += burst(740, GY - 440, lt - 1.3, { r: 200 });
  return { bg: stageBg({ seed: 111 }), world, cam: [960, 560, 1.0], hud };
};

P.c5_growth = (lt, t) => {
  let world = barsWorld(t, lt, { b26: 1, b27: 1, coins: lt + 0.2 });
  const u = clamp((lt - 0.3) / 1.5);
  world += `<path d="M420 820 Q900 760 1520 260" stroke="${C.green}" stroke-width="18" fill="none" stroke-linecap="round" stroke-dasharray="1600" stroke-dashoffset="${n2(1600 * (1 - ease.out(u)))}"/>`;
  if (u > 0.95) world += `<path d="M1520 260 l-70 10 l40 50z" fill="${C.green}"/>`;
  const hf = seg(lt, 2.3, 2.6);
  world += ch('modulo', { x: lerp(280, 820, seg(lt, 1.4, 2.3)), y: GY, t, s: 1.2, walk: lt > 1.4 && lt < 2.3 ? W(t, 2.4) : null, expr: 'joy', armR: lerp(-20, 120, hf), hop: bump(lt, 2.5, 0.5) * 60 });
  world += ch('cronos', { x: lerp(1660, 1110, seg(lt, 1.4, 2.3)), y: GY, t, s: 1.2, dir: -1, walk: lt > 1.4 && lt < 2.3 ? W(t, 2.4) : null, expr: 'joy', armR: lerp(-20, 120, hf), propL: 'clipboard', hop: bump(lt, 2.5, 0.5) * 60 });
  world += burst(965, 560, lt - 2.6, { r: 220, n: 14 });
  return { bg: stageBg({ seed: 111 }), world, cam: [960, 560, lerp(1.0, 1.04, lt / 4.2)] };
};

P.c5_detail = (lt, t, p) => {
  const world = barsWorld(p.t0, 0, { b26: 1, b27: 1 });
  const hud = `<rect width="1920" height="1080" fill="#0b0c10" opacity="${n2(0.78 * clamp(lt / 0.25))}"/>` + typewriter('MAS TEM UM DETALHE…', 960, 570, lt - 0.1, { dur: 0.8 });
  return { bg: stageBg({ seed: 111 }), world, cam: [960, 560, 1.04], hud };
};

// ---------- escritório: comédia ----------
function paladiniDesk(t, o = {}) {
  let s = '';
  s += ch('paladini', { x: 1290, y: 828, t, ...(o.pal ?? {}) });
  s += monitor(1180, 760, 150, 104, 'chart', t);
  s += desk(1290, 760, 360, { h: 120 });
  const pa = o.paperAge ?? -1;
  if (pa >= 0) {
    const R = rng(12);
    for (let i = 0; i < 9; i++) {
      const vx = (R() - 0.5) * 700, vy = -500 - R() * 400, rot = R() * 600;
      const u = Math.min(pa, 1.6);
      const y = 740 + vy * u + 700 * u * u;
      if (y < 980) s += paperSheet(1290 + vx * u, y, rot * u, 1.2);
    }
  }
  return s;
}
P.c5_giovanna = (lt, t) => {
  const gx = -50 + lt * 360;
  let world = officeWorld(t, { skipDesk: 1290 }) + paladiniDesk(t, { pal: { expr: 'calm', gaze: [0.5, 0.4], armL: -10, armR: -10 } });
  world += ch('giovanna', { x: gx, y: GY + 10, t, walk: W(t, 3.2), expr: lt > 1.8 ? 'excited' : 'determined', propR: 'phone', armR: 10, lean: 6, talk: lt > 1.8 ? 1 : 0 });
  world += `<path d="M${gx - 110} 700 h-90 M${gx - 120} 760 h-130 M${gx - 100} 820 h-70" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" opacity=".25"/>`;
  if (lt > 1.8) world += bubble('Paladini!', gx + 60, GY - 270, { k: clamp((lt - 1.8) / 0.25), size: 40, tail: -1 });
  return { bg: paperBg({ floorY: 2000 }), world, cam: [Math.min(gx + 200, 1000), 650, 1.3] };
};
P.c5_paladini = (lt, t) => {
  const gx = lerp(830, 1000, seg(lt, 0, 0.5));
  const startle = lt < 1.0;
  const pal = startle ? { expr: 'surprised', hop: bump(lt, 0.05, 0.55) * 90, armL: 120, armR: 120, alarm: clamp(1 - (lt - 0.6) / 0.4), gaze: [-0.8, 0] } : { expr: lt > 2.4 ? ['surprised', 'neutral', seg(lt, 2.4, 3.2) * 0.6] : 'surprised', gaze: [-0.9, 0], armL: -10, armR: -10, talk: lt > 2.5 && lt < 3.2 ? 0.8 : 0, sweat: 0.7 };
  let world = officeWorld(t, { skipDesk: 1290 }) + paladiniDesk(t, { pal, paperAge: lt - 0.08 });
  world += ch('giovanna', { x: gx, y: GY + 10, t, walk: lt < 0.5 ? W(t, 3) : null, expr: lt > 0.6 && lt < 2.4 ? 'determined' : 'sly', propR: 'phone', armR: 10, talk: lt > 0.7 && lt < 2.3 ? 1 : 0, gaze: [0.9, 0] });
  if (lt > 2.5) world += bubble('Pagou.', 1330, 560, { k: clamp((lt - 2.5) / 0.25), size: 40, tail: -1 });
  return { bg: paperBg({ floorY: 2000 }), world, cam: [1140, 660, 1.5] };
};

function trio(t, o = {}) {
  let s = blob(960, 500, 600, '#ffe1cc', 0.6, 21);
  s += `<rect x="300" y="160" width="1320" height="560" rx="26" fill="#d9ecff" opacity=".55"/><rect x="300" y="160" width="1320" height="560" rx="26" fill="none" stroke="#9cc0e6" stroke-width="10"/><path d="M960 160 V720" stroke="#9cc0e6" stroke-width="10"/>`;
  s += plant(240, GY, 1.2) + plant(1690, GY, 1.1, '#5b8def');
  s += ch('quintao', { x: 700, y: GY, t, expr: 'joy', ...(o.q ?? {}) });
  s += ch('sampaio', { x: 1220, y: GY, t: t + 0.5, expr: 'joy', ...(o.s ?? {}) });
  s += ch('antonialli', { x: 960, y: GY + 6, t: t + 0.2, s: 1.55, expr: 'happy', ...(o.a ?? {}) });
  return s;
}
P.c5_scratch = (lt, t, p) => {
  if (lt < 0.38) {
    const pp = P.c5_paladini(3.4, p.t0);
    const rot = -lt * 900;
    const hud = `<rect width="1920" height="1080" fill="#f4ecdf" opacity=".35"/>` + vinyl(960, 540, rot) + `<path d="M760 420 l60 30 l-60 30 l60 30 M1160 420 l-60 30 l60 30 l-60 30" stroke="${C.red}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    return { ...pp, hud, cam: [1140, 660, 1.5 + lt * 0.5, -lt * 8] };
  }
  const u = clamp((lt - 0.38) / 0.82);
  const names = op(clamp((lt - 0.5) / 0.3), ['Fabio Quintão', 'Guilherme Antonialli', 'Sampaio'].map((n, i) => { const x = [700, 960, 1220][i]; const w = measure(n, '800 24px Outfit') + 30; return `<rect x="${n2(x - w / 2)}" y="${GY + 22}" width="${n2(w)}" height="40" rx="20" fill="#fffdf8" filter="url(#dsSoft)"/>` + text(n, x, GY + 50, { size: 24, weight: 800 }); }).join(''));
  return { bg: stageBg({ seed: 121 }), world: trio(t, { q: { hop: bump(lt, 0.4, 0.4) * 30 }, s: { hop: bump(lt, 0.46, 0.4) * 30 } }) + names, cam: [960, 690, lerp(1.7, 1.55, ease.out(u))] };
};
P.c5_antecipar = (lt, t) => {
  let world = trio(t, { a: { talk: (lt > 0.1 && lt < 2.3) || (lt > 2.4 && lt < 3.5) ? 1 : 0, expr: 'sly', armR: lt > 2.4 ? 40 : 20, lenR: lt > 2.4 ? 34 : 24 }, q: { expr: 'happy', headTilt: Math.sin(t * 6) * 4 }, s: { expr: 'happy', headTilt: Math.sin(t * 6 + 1) * 4 } });
  const k = clamp((lt - 0.9) / 0.4);
  if (k > 0) {
    world += g(tr(1420, 540, ease.back(k)), `<rect x="-110" y="-70" width="220" height="140" rx="20" fill="${C.blue}" filter="url(#dsSoft)"/>` + text('FY26', 0, 22, { size: 64, weight: 900, fill: '#fff' }));
    for (let i = 0; i < 3; i++) { const f = clamp((lt - 1.3 - i * 0.25) / 0.6); if (f > 0 && f < 1) world += nfDoc(lerp(1800, 1420, ease.inOut(f)), lerp(380, 540, f) - Math.sin(f * Math.PI) * 120, lerp(0.6, 0.2, f), f * 200); }
  }
  return { bg: stageBg({ seed: 121 }), world, cam: [lerp(960, 1040, seg(lt, 0.8, 1.6)), 690, 1.5] };
};
P.c5_phones = (lt, t) => {
  const left = `<clipPath id="spL"><path d="M0 0 H1010 L910 1080 H0Z"/></clipPath><clipPath id="spR"><path d="M1010 0 H1920 V1080 H910Z"/></clipPath>`;
  const sideA = g(camStr([780, 700, 1.7]), officeWorld(t) + ch('giovanna', { x: 760, y: GY + 10, t, expr: 'excited', armR: 81, lenR: 31, propR: 'phone', talk: 1, headTilt: 8, armL: 30 + Math.sin(t * 10) * 15 }));
  const sideB = g(camStr([2400, 700, 1.7]), officeWorld(t + 3) + ch('bruno', { x: 2420, y: GY + 10, t, expr: 'determined', armR: 81, lenR: 31, propR: 'phone', talk: 1, headTilt: 8, dir: -1 }));
  const hud = left + `<g clip-path="url(#spL)"><rect width="1920" height="1080" fill="${C.bg}"/>${sideA}</g><g clip-path="url(#spR)"><rect width="1920" height="1080" fill="${C.bg}"/>${sideB}</g><path d="M1010 0 L910 1080" stroke="#fff" stroke-width="14"/>`;
  return { bg: '', world: '', cam: [960, 540, 1], hud };
};
P.c5_celebrate = (lt, t) => {
  let world = officeWorld(t);
  const hop = i => Math.abs(Math.sin((lt + i * 0.18) * 6.5)) * 70;
  world += ch('giovanna', { x: 860, y: GY + 10, t, expr: 'joy', hop: hop(0), armL: 115 + Math.sin(t * 10) * 10, armR: 115, propR: 'phone' });
  world += ch('bruno', { x: 1080, y: GY + 10, t: t + 0.3, expr: 'joy', hop: hop(1), armL: 115, armR: 115 + Math.sin(t * 10) * 10, propL: 'phone' });
  world += confetti(970, 200, lt, { n: 90, w: 1400, seed: 7 });
  return { bg: paperBg({ floorY: 2000 }), world, cam: [970, 620, 1.3] };
};
function spyBg() {
  return `<rect width="1920" height="1080" fill="#121a30"/><rect width="1920" height="1080" fill="url(#spot)"/>` + doodles(131, '#ffffff', 0.05);
}
P.c5_operacao = (lt, t) => {
  let world = `<ellipse cx="960" cy="${GY + 6}" rx="300" ry="40" fill="#fff6d6" opacity=".18"/>`;
  world += ch('antonialli', { x: 960, y: GY, t, s: 1.6, expr: lt < 1.9 ? 'sly' : 'determined', talk: lt > 0.1 && lt < 1.9 ? 1 : 0, gaze: [0, 0], armR: lt > 1.9 ? -10 : 30 });
  const [sx, sy] = lt > 1.85 && lt < 2.1 ? shake(t, 10) : [0, 0];
  const hud = stamp(['OPERAÇÃO COLLECTION', 'ZERO DEFECT'], 960, 300, { k: clamp((lt - 1.85) / 0.18), color: C.red, size: 70, rot: -7, fill: 'rgba(255,255,255,.92)' }) + (lt > 1.85 && lt < 2.0 ? `<rect width="1920" height="1080" fill="#fff" opacity="${n2(0.6 * (1 - (lt - 1.85) / 0.15))}"/>` : '');
  return { bg: spyBg(), world, cam: [960 + sx, 700 + sy, lerp(1.45, 1.6, lt / 3.2)], hud };
};
function hairGag(lt, t, o = {}) {
  const fall = seg(lt, o.fall ?? 0.15, (o.fall ?? 0.15) + 0.15);
  const raise = seg(lt, o.raise ?? 0.45, (o.raise ?? 0.45) + 0.3);
  const fix = seg(lt, o.fix ?? 0.85, (o.fix ?? 0.85) + 0.35);
  const lower = seg(lt, (o.fix ?? 0.85) + 0.45, (o.fix ?? 0.85) + 0.75);
  const lock = fall * (1 - fix);
  const up = raise * (1 - lower);
  const arm = lerp(-20, 97 + 9 * fix, up);
  return ch('antonialli', { x: 960, y: GY, t, s: 1.6, expr: fix > 0.9 ? 'proud' : 'calm', lock, armR: arm, lenR: lerp(24, 76, up), behindR: up > 0.25, gaze: fix > 0.9 ? [0, 0] : [-0.4, -0.7], ting: lt - ((o.fix ?? 0.85) + 0.4), headTilt: lerp(0, -6, raise * (1 - lower)) });
}
P.c5_hair = (lt, t) => ({ bg: spyBg(), world: hairGag(lt, t), cam: [960, 690, 2.6] });

// ---------- CENA 6 ----------
P.c6_montage = (lt, t) => {
  const i = Math.min(5, Math.floor(lt / 0.65));
  const l2 = lt - i * 0.65;
  const world = mapWorld(t, { fix: [1, 1, 1, 1, 1, 1], fixAge: [99, 99, 99, 99, 99, 99] });
  const names = ['unimed', 'funed', 'caoa', 'john-deere', 'hughes', 'libercon'];
  const hud = logoCard(names[i], 960, 300, 560, 230, { k: clamp(l2 / 0.25), rot: i % 2 ? 2 : -2 });
  return { bg: mapBg(), world, cam: [PX[i] - 100 + l2 * 60, 580, 1.05] , hud };
};
P.c6_monologue = (lt, t) => {
  let world = blob(960, 520, 640, '#ffe7c4', 0.6, 22) + blob(500, 380, 300, '#d6e6ff', 0.5, 23) + blob(1460, 420, 320, '#d3f1e6', 0.5, 24);
  const talking = [[0.2, 3.4], [3.4, 5.6], [5.8, 9.1]].some(([a, b]) => lt > a && lt < b - 0.1);
  world += ch('antonialli', { x: 960, y: GY, t, s: 1.6, expr: lt > 5.8 ? 'determined' : 'serious', talk: talking ? 0.9 : 0, armR: lt > 3.4 && lt < 5.6 ? 50 : -20, armL: lt > 6 && lt < 8 ? 30 : -20 });
  return { bg: stageBg({ seed: 141 }), world, cam: [960, 680, lerp(2.0, 2.35, ease.inOut(lt / 9.2))] };
};
P.c6_narr = (lt, t) => {
  const u = seg(lt, 0, 1.2);
  const z = lerp(0.3, 0.235, u);
  const world = mapWorld(t, { fix: [1, 1, 1, 1, 1, 1], fixAge: [99, 99, 99, 99, 99, 99], newRoad: clamp((lt - 1.8) / 0.6), newPins: clamp((lt - 2.2) / 1.2), roadEnd: 7600 });
  return { bg: mapBg(), world, cam: [lerp(3800, 4950, u), 640, z] };
};
P.c6_group = (lt, t) => {
  let world = blob(960, 420, 700, '#ffe7c4', 0.55, 25);
  const am = logoSize('alvarez-marsal', 120), tv = logoSize('totvs', 80);
  const bw = am.w + tv.w + 200;
  world += op(clamp((lt - 0.1) / 0.3), `<rect x="${n2(960 - bw / 2)}" y="120" width="${n2(bw)}" height="190" rx="30" fill="#fffdf8" filter="url(#ds)"/>` + logo('alvarez-marsal', 960 - bw / 2 + 60 + am.w / 2, 210, 120) + text('+', 960 - bw / 2 + 60 + am.w + 40, 236, { size: 70, weight: 900, fill: C.soft }) + logo('totvs', 960 - bw / 2 + 60 + am.w + 80 + tv.w / 2, 210, 80) + text('FRAMEWORK A&M × TOTVS', 960, 292, { size: 20, weight: 800, fill: C.soft, ls: '3' }));
  QUADRO_FINAL.forEach((id, i) => {
    const center = id === 'antonialli';
    const x = 120 + i * 140, k = clamp((lt - 0.05 * Math.abs(i - 6)) / 0.4);
    const hop = Math.sin(clamp(k) * Math.PI) * 50 + (lt > 1.0 && lt < 1.6 ? Math.abs(Math.sin((lt - 1 + i * 0.05) * 10)) * 20 : 0);
    world += op(clamp(k * 3), ch(id, { x, y: GY + (center ? 12 : 0), t: t + i * 0.3, s: center ? 1.25 : 1.08, expr: center ? 'proud' : 'happy', hop, armR: lt > 1 && lt < 2.2 ? 110 + Math.sin(t * 9 + i) * 10 : -25 }));
    const nm = ELENCO[id].nome.split(' ');
    world += op(clamp((lt - 0.8) / 0.3), text(nm[0], x, GY + 44, { size: 22, weight: 800 }) + text(nm.slice(1).join(' '), x, GY + 70, { size: 17, weight: 700, fill: C.soft, family: 'DM Sans' }));
  });
  world += confetti(960, 120, lt - 1.0, { n: 80, w: 1800, seed: 9 });
  const words = [['UM TIME.', C.blue], ['METODOLOGIAS INTEGRADAS.', C.navy], ['VALOR SUSTENTÁVEL.', C.amber]];
  let hud = '';
  words.forEach(([w2, col], i) => (hud += tag(w2, [330, 870, 1520][i], [430, 410, 430][i], { k: clamp((lt - 1.4 - i * 0.45) / 0.35), bg: col, size: 40, rot: [-3, 2, -2][i] })));
  return { bg: stageBg({ seed: 151 }), world, cam: [960, 560, 1.0], hud };
};
P.c6_fade = (lt, t, p) => {
  const r = P.c6_group(6.0 + lt, t);
  r.hud = (r.hud ?? '') + iris(960, 700, lerp(1400, 0, ease.in(clamp(lt / 1.2))));
  r.chrome = lt < 0.6;
  return r;
};
function spotBlack() { return `<rect width="1920" height="1080" fill="#0b0c10"/><ellipse cx="960" cy="${GY + 8}" rx="260" ry="34" fill="#fff6d6" opacity=".14"/><path d="M820 -40 L1100 -40 L1260 ${GY} L660 ${GY}Z" fill="#fff6d6" opacity=".06"/>`; }
P.c6_gente = (lt, t) => {
  const gx = lerp(-150, 940, seg(lt, 0, 0.6));
  let world = ch('giovanna', { x: gx, y: GY, t, s: 1.5, walk: lt < 0.6 ? W(t, 3) : null, expr: lt < 2.2 ? 'thinking' : 'worried', talk: (lt > 0.6 && lt < 1.6) || (lt > 2.3 && lt < 3.4) ? 1 : 0, gaze: lt < 2.2 ? [Math.sin(t * 2) * 0.8, 0] : [0, 0], propR: lt > 2.2 ? 'nf' : null, armR: lt > 2.2 ? 40 : -20 });
  if (lt > 0.6) world += bubble('Gente…', gx + 90, GY - 330, { k: clamp((lt - 0.6) / 0.25), size: 38 });
  if (lt > 2.3) world += bubble('Mas pagou a NF?', gx + 120, GY - 420, { k: clamp((lt - 2.3) / 0.25), size: 38 });
  return { bg: spotBlack(), world, cam: [960, 640, 1.25], chrome: false };
};
P.c6_hair = (lt, t) => ({ bg: spotBlack(), world: hairGag(lt, t, { fall: 0.2, raise: 0.5, fix: 0.85 }), cam: [960, 690, 2.5], chrome: false });
P.c6_fim = (lt, t) => {
  let hud = '';
  const k = clamp((lt - 0.1) / 0.5);
  hud += op(clamp(k * 2), g(tr(960, 470, ease.bounce(k)), text('FIM.', 0, 70, { size: 240, weight: 900, fill: C.ink })));
  const a = clamp((lt - 0.6) / 0.4);
  const am = logoSize('alvarez-marsal', 70), tv = logoSize('totvs', 46);
  hud += op(a, text('PROJETO DO ANO · PARCERIA A&M + TOTVS', 960, 650, { size: 28, weight: 800, fill: C.soft, ls: '3' }) + logo('alvarez-marsal', 960 - 30 - am.w / 2, 760, 70) + text('+', 960, 776, { size: 44, weight: 900, fill: C.soft }) + logo('totvs', 960 + 30 + tv.w / 2, 760, 46));
  hud += seedling(1500, 980, 1, t, { s: 0.8 }) + ch('modulo', { x: 330, y: 990, t, s: 1.1, expr: 'happy', armL: 100 + Math.sin(t * 8) * 12 }) + ch('cronos', { x: 480, y: 990, t, s: 1.1, expr: 'proud', propL: 'clipboard' });
  return { bg: stageBg({ seed: 161, blobs: [[960, 520, 560, '#ffe7c4', 0.6, 26]] }), world: '', cam: [960, 540, 1], hud, chrome: false };
};

// ============================================================
export function buildFilm() {
  const { planos, total } = linhaDoTempo();
  const cenaStart = {};
  for (const p of planos) if (cenaStart[p.cena] == null) cenaStart[p.cena] = p.t0;
  const bounds = Object.entries(cenaStart).filter(([c]) => +c > 1).map(([, v]) => v);
  return {
    duration: total,
    frame(t) {
      const p = planos.find(x => t >= x.t0 && t < x.t1) ?? planos[planos.length - 1];
      const lt = t - p.t0;
      const fn = P[p.id];
      const r = fn ? fn(lt, t, p) : { bg: paperBg(), world: text(p.id, 960, 540, { size: 60 }) };
      let s = r.bg ?? paperBg();
      if (r.world) s += `<g transform="${camStr(r.cam ?? [960, 540, 1])}">${r.world}</g>`;
      s += `<rect width="1920" height="1080" fill="url(#grain)" opacity=".35"/><rect width="1920" height="1080" fill="url(#vig)"/>`;
      s += r.hud ?? '';
      for (const sub of p.subs ?? []) s += caption(sub, lt);
      if (r.chrome !== false) s += chrome(t, total, p.cena, t - cenaStart[p.cena]);
      for (const b of bounds) s += wipe(t, b);
      return s;
    },
  };
}
