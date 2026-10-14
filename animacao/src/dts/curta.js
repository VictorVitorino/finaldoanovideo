// Curta DTS (~29 s): a trajetória do Victor na Alvarez & Marsal, de julho a outubro de 2026.
// Linguagem visual do vídeo de referência "Canteiro": papel creme quadriculado, manchas pastel,
// legenda em pílula navy com karaokê, chip de cena no canto e personagens chibi.
// Cores A&M / DTS: navy #002a46, laranja #f78c16, ardósia #39566d, azul claro #b8cce0.
//
// Tempos (cenas, palavras, produtos) vêm de src/dts/tempos.json, gerado por producao/dts_audio.py
// a partir da narração do ElevenLabs. Render: node render.mjs frames --test dts --out build/dts/frames
import { clamp, lerp, inv, ease, kf, n2, esc, measure } from '../core.js';
import { pessoa, INK } from './pessoas.js';
import { COR, txt, largura, cartao, pilula, icone, faiscas, marcaAM, predioAM, robo, cavalete } from './objetos.js';

const f = n2;
const W = 1920, H = 1080, CHAO = 840;
const back = (t, a, d = 0.42) => ease.back(inv(a, a + d, t));
const fin = (t, a, d = 0.25) => ease.out(inv(a, a + d, t));
const popG = (k, x, y, body) => (k <= 0.001 ? '' : `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})">${body}</g>`);

// ---------- legenda: frases (índices de palavra) e palavras em destaque ----------
const FRASES = [[0, 2], [3, 9], [10, 16], [17, 23], [24, 27], [28, 31], [32, 37], [38, 44], [45, 47], [48, 49], [50, 55], [56, 58], [59, 63]];
const DESTAQUE = new Set([2, 5, 6, 7, 9, 12, 13, 14, 16, 18, 23, 31, 32, 33, 34, 35, 36, 37, 42, 44, 45, 46, 47, 48, 49, 52, 53, 55, 58, 61, 62, 63]);
const limpa = w => w.replace(/^and$/, '&').replace('...', '…');

const CHIPS = {
  chegada: ['CENA 1 · A CHEGADA', 'Julho de 2026', 1],
  aula: ['CENA 2 · IA COMO MÉTODO', 'Aprender fazendo', 2],
  descoberta: ['CENA 2 · IA COMO MÉTODO', 'Ferramentas & métodos', 2],
  criacao: ['CENA 3 · MÃO NA MASSA', 'Ideia vira entrega', 3],
  lideranca: ['CENA 4 · LIDERANÇA POR PERTO', 'Troca bilateral', 4],
  jornada: ['CENA 5 · 4 MESES', 'Jul → Out 2026', 5],
  final: ['CENA 6 · DTS', 'Alvarez & Marsal', 6],
};

export function buildCurta(T) {
  const P = T.palavras;
  const C = T.cenas;
  const ORD = T.ordem;
  const TOTAL = T.duracao;
  const wa = i => P[i].a;
  const fimCena = id => { const i = ORD.indexOf(id); return i + 1 < ORD.length ? C[ORD[i + 1]] : TOTAL; };
  const cenaEm = t => { let c = ORD[0]; for (const id of ORD) if (t >= C[id]) c = id; return c; };

  // ---------- fundo ----------
  function fundo(t) {
    let s = `<rect width="${W}" height="${H}" fill="${COR.cream}"/>`;
    let g = '';
    for (let x = 0; x <= W; x += 48) g += `M${x},0 L${x},${H} `;
    for (let y = 0; y <= H; y += 48) g += `M0,${y} L${W},${y} `;
    s += `<path d="${g}" stroke="${COR.grid}" stroke-width="1.5"/>`;
    const blobs = [['#d7e4ee', 380, 380, 420, 300, 0], ['#f8e2c2', 1000, 700, 560, 280, 1.7], ['#f3dada', 1560, 360, 400, 320, 3.1]];
    for (const [c, x, y, rx, ry, ph] of blobs) {
      s += `<ellipse cx="${f(x + Math.sin(t * 0.35 + ph) * 40)}" cy="${f(y + Math.cos(t * 0.3 + ph) * 26)}" rx="${rx}" ry="${ry}" fill="${c}" opacity=".62"/>`;
    }
    const doodles = [[170, 160, 'x'], [1240, 120, 'tri'], [1790, 610, 'x'], [700, 120, 'o'], [1500, 760, 'o']];
    for (const [x, y, k] of doodles) {
      const yy = y + Math.sin(t * 0.8 + x) * 6;
      if (k === 'x') s += `<path d="M${x - 10},${f(yy - 10)} l20,20 M${x + 10},${f(yy - 10)} l-20,20" stroke="${COR.tan}" stroke-width="4" stroke-linecap="round"/>`;
      else if (k === 'tri') s += `<path d="M${x},${f(yy - 12)} l12,20 l-24,0Z" fill="none" stroke="${COR.tan}" stroke-width="3.5" stroke-linejoin="round"/>`;
      else s += `<circle cx="${x}" cy="${f(yy)}" r="9" fill="none" stroke="${COR.tan}" stroke-width="3"/>`;
    }
    return s;
  }
  const chao = (y = CHAO) => `<rect x="-200" y="${y}" width="${W + 400}" height="5" rx="2" fill="#d9ccb4"/>`;

  // ---------- interface fixa ----------
  function interfaceTopo(t, escuro) {
    const navy = escuro ? '#fff' : COR.navy;
    const cinza = escuro ? 'rgba(255,255,255,.6)' : COR.grey;
    let s = '';
    // barra de progresso com régua
    const px = W * clamp(t / TOTAL);
    s += `<rect x="0" y="0" width="${f(px)}" height="9" fill="${COR.orange}"/>`;
    let r = '';
    for (let x = Math.ceil(px / 14) * 14; x < W; x += 14) r += `M${x},0 L${x},${x % 70 === 0 ? 12 : 7} `;
    if (r) s += `<path d="${r}" stroke="${escuro ? 'rgba(255,255,255,.25)' : '#cdbf9f'}" stroke-width="1.6"/>`;
    // marca
    s += txt('DTS', 44, 82, { anchor: 'start', size: 46, weight: 900, fill: navy, ls: 1 })
      + `<rect x="${f(48 + largura('DTS', 46, 900) + 6)}" y="68" width="11" height="11" fill="${COR.orange}"/>`
      + `<path d="M${f(48 + largura('DTS', 46, 900) + 34)},54 L${f(48 + largura('DTS', 46, 900) + 34)},84" stroke="${cinza}" stroke-width="2"/>`
      + txt('ALVAREZ & MARSAL', 48 + largura('DTS', 46, 900) + 50, 76, { anchor: 'start', size: 17, weight: 700, family: 'DM Sans', fill: cinza, ls: 4 });
    // botão de som (como na referência)
    s += `<circle cx="78" cy="146" r="27" fill="${escuro ? 'rgba(255,255,255,.08)' : '#fff'}" stroke="${navy}" stroke-width="3"/>`
      + `<path d="M66,140 L72,140 L80,133 L80,159 L72,152 L66,152Z" fill="${navy}"/><path d="M85,140 Q90,146 85,152 M89,135 Q98,146 89,157" stroke="${navy}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    // chip da cena
    const id = cenaEm(t);
    const [sup, tit, num] = CHIPS[id];
    const k = back(t, C[id] + 0.05, 0.45);
    const wTit = largura(tit, 27, 800), wSup = largura(sup, 13, 700, 'DM Sans') + sup.length * 2;
    const w = Math.max(wTit, wSup) + 110;
    const x0 = W - 40 - w;
    const chip = pilula(0, 0, w, 76, '#fff', COR.navy, 3.5)
      + `<circle cx="40" cy="38" r="23" fill="${COR.orange}"/>` + txt(String(num), 40, 47, { size: 25, weight: 900, fill: '#fff' })
      + txt(sup, 78, 30, { anchor: 'start', size: 13, weight: 700, family: 'DM Sans', fill: COR.grey, ls: 2 })
      + txt(tit, 78, 60, { anchor: 'start', size: 27, weight: 800, fill: COR.navy });
    s += `<g transform="translate(${f(x0 + w / 2)} 70) scale(${f(Math.max(0.001, k))}) translate(${f(-w / 2)} -38)">${chip}</g>`;
    return s;
  }

  function legenda(t) {
    let fr = null;
    for (const [a, b] of FRASES) if (t >= wa(a) - 0.35) fr = [a, b];
    if (!fr) return '';
    const [a, b] = fr;
    const fimFrase = b + 1 < P.length ? wa(b + 1) - 0.35 : TOTAL + 1;
    if (t > fimFrase && b + 1 < P.length) return '';
    const size = 35, font = `700 ${size}px "DM Sans"`;
    const words = [];
    let wsum = 0;
    for (let i = a; i <= b; i++) {
      const w = limpa(P[i].w);
      const ww = measure(w, font);
      words.push({ i, w, ww });
      wsum += ww;
    }
    const sp = measure(' ', font);
    const total = wsum + sp * (words.length - 1);
    const pw = total + 130, ph = 70;
    const x0 = W / 2 - pw / 2, y0 = 968;
    const k = back(t, wa(a) - 0.35, 0.3);
    let s = pilula(x0, y0, pw, ph, '#0f2440', 'none', 0)
      + `<circle cx="${f(x0 + 40)}" cy="${f(y0 + 35)}" r="20" fill="#fff"/>`
      + `<rect x="${f(x0 + 35)}" y="${f(y0 + 23)}" width="10" height="16" rx="5" fill="#0f2440"/><path d="M${f(x0 + 31)},${f(y0 + 34)} q9,11 18,0 M${f(x0 + 40)},${f(y0 + 41)} l0,5" stroke="#0f2440" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    let x = x0 + 80;
    let spans = '';
    for (const wd of words) {
      const dita = t >= P[wd.i].a - 0.04;
      const col = dita ? (DESTAQUE.has(wd.i) ? COR.orange2 : '#ffffff') : '#5f7391';
      spans += txt(wd.w, x, y0 + 47, { anchor: 'start', size, weight: 700, family: 'DM Sans', fill: col });
      x += wd.ww + sp;
    }
    s += spans;
    return `<g transform="translate(960 ${f(y0 + 35)}) scale(${f(Math.max(0.001, 0.85 + 0.15 * k))}) translate(-960 ${f(-(y0 + 35))})" opacity="${f(clamp(k * 1.5))}">${s}</g>`;
  }

  // cortina diagonal entre cenas (faixas laranja / ardósia / navy, como o banner DTS)
  function cortina(t) {
    let s = '';
    for (const id of ORD.slice(1)) {
      const tc = C[id];
      const u = inv(tc - 0.24, tc + 0.24, t);
      if (u <= 0 || u >= 1) continue;
      const x = lerp(-900, W + 900, ease.inOut(u));
      const band = (dx, w, c) => `<path d="M${f(x + dx - w / 2 - 260)},${H + 20} L${f(x + dx - w / 2 + 260)},-20 L${f(x + dx + w / 2 + 260)},-20 L${f(x + dx + w / 2 - 260)},${H + 20}Z" fill="${c}"/>`;
      s += band(-610, 120, COR.lblue) + band(-470, 180, COR.slate) + band(0, 820, COR.navy) + band(470, 110, COR.orange);
    }
    return s;
  }

  // câmera suave por cena
  function camera(t, body, id, z0 = 1, z1 = 1.035, cx = 960, cy = 600) {
    const u = inv(C[id], fimCena(id), t);
    const z = lerp(z0, z1, ease.sine(u));
    return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(z)}) translate(${f(-cx)} ${f(-cy)})">${body}</g>`;
  }

  // ======================= CENA 1 · A CHEGADA =======================
  function cenaChegada(t) {
    const pan = kf(t, [[0, 0], [3.65, 0], [4.55, W, ease.inOut]]);
    let mundo = '';
    // --- fora: o prédio A&M ---
    const doorOpen = clamp(inv(3.0, 3.5, t));
    mundo += predioAM(980, CHAO, 1.08, t, doorOpen);
    // árvore e poste
    mundo += `<rect x="560" y="${CHAO - 150}" width="14" height="150" fill="#9b7b55" stroke="${INK}" stroke-width="3"/><circle cx="567" cy="${CHAO - 190}" r="62" fill="#9cc7a2" stroke="${INK}" stroke-width="3.5"/><circle cx="530" cy="${CHAO - 160}" r="34" fill="#86b98e" stroke="${INK}" stroke-width="3"/>`;
    // título "JULHO 2026"
    const kt = back(t, 0.35, 0.5);
    const tituloSai = 1 - fin(t, 3.2, 0.35);
    if (kt > 0 && tituloSai > 0) {
      const tl = `<g transform="rotate(-4)">${txt('JULHO 2026', 0, 0, { size: 112, weight: 900, fill: COR.orange, ls: 4, extra: `stroke="${COR.navy}" stroke-width="6" paint-order="stroke"` })}`
        + `<path d="M-300,30 Q0,52 300,26" stroke="${COR.orange}" stroke-width="9" fill="none" stroke-linecap="round"/></g>`
        + icone('calendar', -400, -36, 1.6);
      mundo += `<g opacity="${f(tituloSai)}">${popG(kt, 560, 330, tl)}</g>`;
    }
    // Victor caminha até a porta
    const vx = kf(t, [[0.5, -120], [3.75, 1660, ease.linear]]);
    const andando = t > 0.5 && t < 3.75;
    if (t < 3.9) {
      const entra = 1 - fin(t, 3.6, 0.25);
      mundo += pessoa('victor', { x: vx, y: CHAO, s: 1.05, t, walk: andando ? (vx / 150) : null, expr: t > 2.9 ? 'joy' : 'smile', gaze: [1, -0.2], alpha: entra });
    }
    // brilho de "Alvarez & Marsal" (palavra 5-7)
    const kb = back(t, wa(5) - 0.1, 0.5) * (1 - fin(t, 3.7, 0.3));
    if (kb > 0) {
      mundo += popG(kb, 1240, 200, `${pilula(-190, -34, 380, 68, '#fff', COR.navy, 3.5)}${txt('ALVAREZ & MARSAL', 0, 12, { size: 30, weight: 900, fill: COR.navy, ls: 3 })}`)
        + faiscas(1240, 200, t - wa(5), COR.orange, 10, 200, 250);
    }

    // --- dentro: recepção do DTS (x + W) ---
    let dentro = '';
    // painel DTS no estilo do banner da newsletter
    const kp = back(t, wa(9) - 0.2, 0.5);
    const banner = `<rect x="-420" y="-95" width="840" height="190" rx="18" fill="${COR.navy}" stroke="${INK}" stroke-width="4"/>`
      + `<path d="M180,95 L330,-95 M260,95 L380,-95" stroke="${COR.slate}" stroke-width="16"/><path d="M215,95 L355,-95" stroke="${COR.orange}" stroke-width="3"/>`
      + txt('DTS', -370, 38, { anchor: 'start', size: 120, weight: 900, fill: '#fff' })
      + `<rect x="-118" y="-46" width="6" height="84" fill="${COR.orange}"/>`
      + txt('Digital & Technology', -94, -4, { anchor: 'start', size: 40, weight: 600, family: 'DM Sans', fill: '#dbe6f2' })
      + txt('Services', -94, 40, { anchor: 'start', size: 40, weight: 600, family: 'DM Sans', fill: '#dbe6f2' })
      + `<rect x="-420" y="86" width="400" height="9" fill="${COR.orange}"/><rect x="-20" y="86" width="260" height="9" fill="${COR.slate}"/><rect x="240" y="86" width="180" height="9" fill="${COR.lblue}"/>`;
    dentro += popG(kp, 960, 245, banner);
    // plantas e balcão
    dentro += `<path d="M190,${CHAO} L210,${CHAO - 70} L270,${CHAO - 70} L290,${CHAO}Z" fill="#e08a4a" stroke="${INK}" stroke-width="3.5"/><path d="M240,${CHAO - 70} Q200,${CHAO - 150} 230,${CHAO - 190} Q250,${CHAO - 140} 240,${CHAO - 70} Q280,${CHAO - 160} 300,${CHAO - 170} Q290,${CHAO - 110} 240,${CHAO - 70}" fill="#7fb489" stroke="${INK}" stroke-width="3"/>`;
    // colegas
    const lt = t - 4.3;
    const acena1 = clamp(inv(4.55, 4.75, t)) * (1 - clamp(inv(6.3, 6.5, t)));
    dentro += pessoa('col1', { x: 1250, y: CHAO, s: 1.02, t, wave: acena1, expr: acena1 > 0.5 ? 'joy' : 'smile', gaze: [-1, 0] });
    const acena2 = clamp(inv(4.9, 5.1, t)) * (1 - clamp(inv(6.6, 6.8, t)));
    dentro += pessoa('col2', { x: 1530, y: CHAO, s: 1.02, t, wave: acena2 * 0.8, expr: 'joy', gaze: [-1, 0] });
    // balões de boas-vindas
    const kb1 = back(t, 4.75, 0.4) * (1 - fin(t, 6.4, 0.25));
    dentro += popG(kb1, 1250, 520, `${cartao(-118, -44, 236, 70, { r: 35 })}${txt('Bem-vindo!', 0, 2, { size: 30, weight: 800, fill: COR.navy })}<path d="M-14,26 L0,48 L12,26" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><rect x="-16" y="20" width="30" height="8" fill="#fff"/>`);
    const kb2 = back(t, 5.15, 0.4) * (1 - fin(t, 6.6, 0.25));
    dentro += popG(kb2, 1560, 500, icone('people', 0, 0, 1.6) + faiscas(0, 0, t - 5.2, COR.orange, 8, 40, 80));
    // Victor entra e cumprimenta
    if (t > 4.0) {
      const vx2 = kf(t, [[4.2, 120], [5.6, 760, ease.out]]);
      const and2 = t < 5.6;
      dentro += pessoa('victor', { x: vx2, y: CHAO, s: 1.05, t, walk: and2 ? vx2 / 150 : null, wave: t > 5.6 && t < 6.6 ? 1 : 0, expr: 'joy', gaze: [1, 0] });
      // crachá: Gestão de Mudanças em Tecnologia
      const kc = back(t, wa(12) - 0.15, 0.5);
      const card = cartao(-300, -62, 600, 124, { r: 22 })
        + `<rect x="-300" y="-62" width="14" height="124" rx="7" fill="${COR.orange}"/>`
        + icone('badge', -232, 0, 1.25)
        + txt('VICTOR · DTS', -184, -18, { anchor: 'start', size: 18, weight: 700, family: 'DM Sans', fill: COR.grey, ls: 3 })
        + txt('Gestão de Mudanças', -184, 18, { anchor: 'start', size: 34, weight: 800, fill: COR.navy })
        + txt('em Tecnologia', -184, 50, { anchor: 'start', size: 26, weight: 700, family: 'DM Sans', fill: COR.orange });
      dentro += popG(kc, 700, 495, card);
    }
    const body = `<g transform="translate(${f(-pan)} 0)">${chao()}${mundo}<g transform="translate(${W} 0)">${chao()}${dentro}</g></g>`;
    return body;
  }

  // ======================= CENA 2 · AULA DE IA + DESCOBERTA =======================
  function cenaAula(t) {
    const t0 = C.aula, td = C.descoberta;
    const sai = ease.inOut(inv(td - 0.05, td + 0.45, t));
    let s = chao();
    // quadro "Aula de IA" no cavalete
    const bx = 700 + sai * 900, by = 210;
    const kq = back(t, t0 + 0.05, 0.5);
    const itens = [['Prompts & contexto', 'chat'], ['Claude + Skills', 'sparkle'], ['Métodos & agentes', 'flow']];
    let q = cavalete(0, 0, 720, 380, 250)
      + `<rect x="-14" y="-14" width="748" height="408" rx="22" fill="${COR.orange}" opacity="${f(0.25 + 0.1 * Math.sin(t * 4))}"/>`
      + `<rect x="0" y="0" width="720" height="380" rx="18" fill="${COR.navy2}" stroke="${INK}" stroke-width="4"/>`
      + icone('sparkle', 52, 58, 0.9) + txt('Aula de IA', 88, 72, { anchor: 'start', size: 44, weight: 800, fill: '#fff' })
      + txt('DTS · TRILHA DE IA NA PRÁTICA', 90, 102, { anchor: 'start', size: 15, weight: 700, family: 'DM Sans', fill: '#8fa6c2', ls: 3 })
      + `<rect x="90" y="114" width="150" height="5" rx="2" fill="${COR.orange}"/>`;
    itens.forEach(([lab, ic], i) => {
      const ti = t0 + 0.35 + i * 0.32;
      const k = fin(t, ti, 0.3);
      const ativo = t > ti && (i === 2 || t < t0 + 0.35 + (i + 1) * 0.32 + 0.6) && t < wa(24) + 0.1;
      const feito = t >= wa(24) + i * 0.12;
      const y = 145 + i * 74;
      q += `<g opacity="${f(k)}" transform="translate(${f((1 - k) * 30)} 0)">`
        + `<rect x="44" y="${y}" width="420" height="60" rx="12" fill="${ativo ? '#183a62' : '#132f50'}" stroke="${ativo ? COR.orange : '#2a4a70'}" stroke-width="3"/>`
        + `<circle cx="80" cy="${y + 30}" r="17" fill="${feito ? COR.green : COR.orange}"/>`
        + (feito ? `<path d="M72,${y + 30} l6,7 l11,-12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : txt(String(i + 1), 80, y + 38, { size: 22, weight: 900, fill: '#fff' }))
        + icone(ic, 126, y + 30, 0.62, COR.orange, '#e6eef8')
        + txt(lab, 160, y + 40, { anchor: 'start', size: 27, weight: 700, family: 'DM Sans', fill: '#fff' })
        + '</g>';
    });
    // mini gráfico no quadro
    const kg = fin(t, t0 + 0.9, 0.5);
    q += `<rect x="500" y="145" width="180" height="208" rx="14" fill="#fff"/>`;
    [0.35, 0.55, 0.48, 0.8, 1].forEach((v, i) => {
      const hh = 130 * v * kg;
      q += `<rect x="${522 + i * 30}" y="${f(330 - hh)}" width="20" height="${f(hh)}" rx="4" fill="${i === 4 ? COR.orange : COR.blue2}"/>`;
    });
    q += `<circle cx="590" cy="190" r="26" fill="none" stroke="${COR.lblue}" stroke-width="9"/><circle cx="590" cy="190" r="26" fill="none" stroke="${COR.orange}" stroke-width="9" stroke-dasharray="${f(163 * 0.72 * kg)} 200" transform="rotate(-90 590 190)"/>`;
    s += `<g opacity="${f(1 - sai)}">${popG(kq, bx + 360, by + 190, `<g transform="translate(-360 -190)">${q}</g>`)}</g>`;
    // robô IA apontando o quadro
    const rx = 1600 + sai * 600;
    s += `<g opacity="${f(1 - sai)}">${robo(rx, CHAO, t, 1.05, clamp(inv(t0 + 0.3, t0 + 0.6, t)))}</g>`;
    // "moda" riscada -> carimbo MÉTODO
    const km = back(t, wa(21) - 0.1, 0.35) * (1 - fin(t, wa(22) + 0.25, 0.2));
    const risco = fin(t, wa(21) + 0.25, 0.2);
    s += popG(km, 1080, 160, `${pilula(-90, -32, 180, 64, '#e9e3d8', '#9aa3b2', 3)}${txt('MODA', 0, 12, { size: 32, weight: 900, fill: '#9aa3b2', ls: 3 })}<path d="M-80,4 L${f(-80 + 160 * risco)},${f(4 - 10 * risco)}" stroke="#e5484d" stroke-width="7" stroke-linecap="round"/>`);
    const kmt = back(t, wa(23) - 0.05, 0.45) * (1 - sai);
    s += popG(kmt, 1060, 160, `<g transform="rotate(-5)">${`<rect x="-176" y="-50" width="352" height="100" rx="14" fill="${COR.orange}" stroke="${COR.navy}" stroke-width="5"/>`}${txt('MÉTODO', 0, 22, { size: 62, weight: 900, fill: '#fff', ls: 4 })}</g>`);
    // Victor: anota (aula) -> centro com as ferramentas (descoberta)
    const vx = lerp(360, 960, ease.inOut(inv(td, td + 0.55, t)));
    const vs = lerp(1.05, 1.18, ease.inOut(inv(td, td + 0.55, t)));
    // brilho atrás na descoberta
    const kd = fin(t, td + 0.1, 0.5);
    if (kd > 0) {
      let raios = '';
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2 + t * 0.25;
        raios += `<path d="M960,560 L${f(960 + Math.cos(a - 0.08) * 900)},${f(560 + Math.sin(a - 0.08) * 900)} L${f(960 + Math.cos(a + 0.08) * 900)},${f(560 + Math.sin(a + 0.08) * 900)}Z" fill="${COR.orange}" opacity="${f(0.07 * kd)}"/>`;
      }
      s = raios + `<circle cx="960" cy="560" r="${f(260 * kd)}" fill="#fff3e2" opacity=".85"/>` + s;
    }
    const expr = t < wa(24) ? 'focus' : t < td + 0.3 ? 'joy' : t < wa(27) ? 'wow' : 'joy';
    // caderno na mão durante a aula
    const caderno = t < td + 0.1 ? 1 : 0;
    s += pessoa('victor', { x: vx, y: CHAO, s: vs, t, expr, gaze: t < td ? [1, -0.6] : [0, -0.3], armR: caderno ? -30 : (t > wa(27) ? 135 : 30), armL: t > wa(27) ? 135 : 10, hop: t > wa(27) ? Math.max(0, Math.sin((t - wa(27)) * 9)) * 14 : 0 });
    if (caderno) {
      s += `<g transform="translate(${f(vx + 6 * vs)} ${f(CHAO - 76 * vs)}) rotate(-8)"><rect x="-26" y="-34" width="52" height="66" rx="5" fill="#fff" stroke="${INK}" stroke-width="3.5"/><path d="M-16,-18 h30 M-16,-6 h30 M-16,6 h20" stroke="${COR.grey}" stroke-width="3" stroke-linecap="round"/>${t >= wa(24) ? `<path d="M-14,18 l7,7 l14,-14" stroke="${COR.green}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ''}</g>`;
      // lâmpadas de ideia
      const kl = back(t, wa(24), 0.4);
      s += popG(kl, vx - 20, CHAO - 330, icone('bulb', 0, 0, 1.3) + faiscas(0, 0, t - wa(24), COR.orange, 8, 34, 64));
    }
    // ferramentas orbitando
    const tools = [['Claude', 'sparkle'], ['Skills', 'flow'], ['Prompts', 'chat'], ['Agentes', 'app'], ['Automação', 'tool'], ['Gamificação', 'game'], ['Design', 'deck'], ['Dados', 'dash']];
    tools.forEach(([lab, ic], i) => {
      const ti = td + 0.15 + i * 0.09;
      const k = back(t, ti, 0.45);
      if (k <= 0) return;
      const a = -Math.PI / 2 + (i / tools.length) * Math.PI * 2 + (t - td) * 0.35;
      const rx = 560, ry = 300;
      const x = 960 + Math.cos(a) * rx * lerp(0.4, 1, Math.min(1, k)), y = 520 + Math.sin(a) * ry * lerp(0.4, 1, Math.min(1, k));
      const w = largura(lab, 26, 800) + 86;
      s += popG(k, x, y, `${pilula(-w / 2, -32, w, 64, '#fff', COR.navy, 3.5)}<circle cx="${f(-w / 2 + 32)}" cy="0" r="22" fill="#fff4e6"/>${icone(ic, -w / 2 + 32, 0, 0.62)}${txt(lab, -w / 2 + 62, 10, { anchor: 'start', size: 26, weight: 800, fill: COR.navy })}`);
    });
    return camera(t, s, 'aula', 1, 1.03);
  }

  // ======================= CENA 3 · CRIAÇÃO =======================
  function cenaCriacao(t) {
    const t0 = C.criacao;
    let s = chao();
    // janela de vidro ao fundo com os diretores observando de longe
    const jx = 110, jy = 205, jw = 450, jh = 285;
    s += `<rect x="${jx - 10}" y="${jy - 10}" width="${jw + 20}" height="${jh + 20}" rx="14" fill="#fff" stroke="${INK}" stroke-width="4"/>`
      + `<clipPath id="janela"><rect x="${jx}" y="${jy}" width="${jw}" height="${jh}" rx="8"/></clipPath>`
      + `<g clip-path="url(#janela)"><rect x="${jx}" y="${jy}" width="${jw}" height="${jh}" fill="#dceaf6"/>`
      + `<rect x="${jx}" y="${jy + jh - 60}" width="${jw}" height="60" fill="#c9dbec"/>`;
    const dirs = [['dir1', 160], ['dir2', 290], ['dir3', 420]];
    const joinha = t > wa(35) - 0.1;
    dirs.forEach(([id, x], i) => {
      const nod = id === 'dir3' && t > wa(34) ? Math.sin((t - wa(34)) * 10) * 5 * (1 - clamp(inv(wa(34) + 0.8, wa(34) + 1.2, t))) : null;
      s += pessoa(id, { x: x + 40, y: jy + jh + 40, s: 0.62, t: t + i, gaze: [1, -0.1], expr: joinha && id !== 'dir3' ? 'joy' : 'smile', armR: id === 'dir1' && joinha ? 120 : undefined, armL: id === 'dir2' && t > wa(33) ? -20 : undefined, tilt: nod ?? undefined });
    });
    s += `<path d="M${jx + 60},${jy + 20} l60,-40 M${jx + 90},${jy + 40} l90,-60" stroke="#fff" stroke-width="10" opacity=".55" stroke-linecap="round"/></g>`
      + `<path d="M${jx + jw / 2},${jy} L${jx + jw / 2},${jy + jh}" stroke="${INK}" stroke-width="4"/>`;
    // balão "de longe": olhos + coração/joinha
    const ko = back(t, t0 + 1.2, 0.4);
    s += popG(ko, jx + jw - 20, jy - 30, `${cartao(-50, -40, 100, 80, { r: 40 })}${icone('eye', 0, 0, 1)}`);
    const kj = back(t, wa(35) - 0.1, 0.4);
    s += popG(kj, jx + jw / 2, jy - 30, `${cartao(-50, -40, 100, 80, { r: 40 })}${icone('check', 0, 0, 1.05)}`) + faiscas(jx + jw / 2, jy - 30, t - wa(35), COR.orange, 8, 48, 80);
    // mesa + Victor digitando
    const vx = 600, vy = CHAO - 60;
    s += '<g transform="translate(70 0)">';
    s += pessoa('victor', { x: vx, y: vy, s: 1.15, t, typing: true, expr: t < t0 + 0.6 ? 'focus' : 'joy', gaze: [0.6, 0.2], tilt: Math.sin(t * 9) * 1.6 });
    s += `<rect x="330" y="${CHAO - 120}" width="540" height="22" rx="8" fill="#c99a5b" stroke="${INK}" stroke-width="4"/>`
      + `<rect x="360" y="${CHAO - 98}" width="480" height="98" fill="#e3c08a" stroke="${INK}" stroke-width="4"/>`
      + `<path d="M380,${CHAO - 70} h440" stroke="#c99a5b" stroke-width="4"/>`;
    // notebook (de costas) com adesivo DTS
    const glow = 0.5 + 0.5 * Math.sin(t * 12);
    s += `<path d="M470,${CHAO - 122} L486,${CHAO - 205} L714,${CHAO - 205} L730,${CHAO - 122}Z" fill="#b9c3d1" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
      + `<rect x="568" y="${CHAO - 182}" width="64" height="34" rx="8" fill="${COR.orange}" stroke="${INK}" stroke-width="3"/>` + txt('DTS', 600, CHAO - 157, { size: 20, weight: 900, fill: '#fff' })
      + `<path d="M486,${CHAO - 205} L714,${CHAO - 205}" stroke="#ffd29a" stroke-width="${f(6 + glow * 6)}" opacity="${f(0.5 + glow * 0.4)}" stroke-linecap="round"/>`;
    // símbolos de código saindo do teclado
    for (let i = 0; i < 6; i++) {
      const ph = ((t - t0) * 1.4 + i / 6) % 1;
      if (t < t0 + 0.1) break;
      const x = 520 + (i * 37) % 160 + Math.sin(i * 3 + t) * 10, y = CHAO - 215 - ph * 120;
      s += `<g opacity="${f(Math.sin(ph * Math.PI) * 0.8)}">${icone(i % 3 === 0 ? 'code' : i % 3 === 1 ? 'sparkle' : 'chat', x, y, 0.45, COR.orange)}</g>`;
    }
    s += '</g>';
    // prateleira de entregas
    const gx = 1010, gy = 215, cw = 196, ch = 176, gap = 26;
    const kpain = fin(t, t0 + 0.2, 0.4);
    s += `<g opacity="${f(kpain)}"><rect x="${gx - 30}" y="${gy - 80}" width="${4 * cw + 3 * gap + 60}" height="${2 * ch + gap + 120}" rx="24" fill="#fff" opacity=".5" stroke="${COR.tan}" stroke-width="3" stroke-dasharray="10 10"/>`
      + txt('ENTREGAS', gx, gy - 34, { anchor: 'start', size: 22, weight: 800, fill: COR.grey, ls: 5 }) + '</g>';
    const nPronto = T.produtos.filter(p => t >= p.t + 0.45).length;
    s += `<g opacity="${f(kpain)}">${pilula(gx + 4 * cw + 3 * gap - 110, gy - 66, 110, 46, COR.navy, 'none', 0)}${txt(String(nPronto).padStart(2, '0'), gx + 4 * cw + 3 * gap - 55, gy - 32, { size: 30, weight: 900, fill: COR.orange2 })}</g>`;
    T.produtos.forEach((p, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const tx = gx + col * (cw + gap) + cw / 2, ty = gy + row * (ch + gap) + ch / 2;
      const ox = 670, oy = CHAO - 220;
      const u = inv(p.t - 0.05, p.t + 0.45, t);
      if (u <= 0) return;
      const e = ease.out(u);
      const x = lerp(ox, tx, e), y = lerp(oy, ty, e) - Math.sin(e * Math.PI) * 260;
      const sc = u < 1 ? lerp(0.25, 1, e) : 1 + 0.08 * Math.sin(clamp((t - p.t - 0.45) / 0.25) * Math.PI);
      const rot = (1 - e) * (i % 2 ? 200 : -200);
      const cardS = `${cartao(-cw / 2, -ch / 2, cw, ch, { r: 18 })}<rect x="${-cw / 2 + 2}" y="${-ch / 2 + 2}" width="${cw - 4}" height="12" rx="6" fill="${COR.orange}"/>`
        + `<circle cx="0" cy="-16" r="44" fill="#f4f7fb"/>` + icone(p.icone, 0, -16, 1.3)
        + txt(p.rotulo, 0, 58, { size: p.rotulo.length > 12 ? 20 : 23, weight: 800, fill: COR.navy });
      s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(sc)})">${cardS}</g>`;
      if (u >= 1) s += faiscas(tx, ty, t - p.t - 0.45, COR.orange, 8, 100, 140);
      // rastro
      if (u < 1) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(30 * (1 - e))}" fill="${COR.orange}" opacity=".25"/>`;
    });
    // "criar!" estoura do notebook
    const kc = back(t, wa(31) - 0.05, 0.4) * (1 - fin(t, wa(32) + 0.3, 0.25));
    s += popG(kc, 670, CHAO - 380, `<g transform="rotate(-6)"><rect x="-130" y="-46" width="260" height="92" rx="16" fill="${COR.orange}" stroke="${COR.navy}" stroke-width="5"/>${txt('CRIAR!', 0, 20, { size: 58, weight: 900, fill: '#fff', ls: 4 })}</g>`)
      + faiscas(670, CHAO - 380, t - wa(31), COR.orange, 12, 150, 210);
    return camera(t, s, 'criacao', 1, 1.025, 960, 560);
  }

  // ======================= CENA 4 · LIDERANÇA =======================
  function cenaLideranca(t) {
    const t0 = C.lideranca;
    let s = chao();
    // tela/cavalete com o que o Victor apresenta
    const kq = back(t, t0 + 0.05, 0.5);
    let q = cavalete(0, 0, 520, 320, 230)
      + `<rect x="0" y="0" width="520" height="320" rx="18" fill="${COR.navy2}" stroke="${INK}" stroke-width="4"/>`
      + txt('Mapa de adoção', 34, 58, { anchor: 'start', size: 36, weight: 800, fill: '#fff' })
      + txt('CLIENTE · TECNOLOGIA', 36, 86, { anchor: 'start', size: 14, weight: 700, family: 'DM Sans', fill: '#8fa6c2', ls: 3 })
      + `<rect x="36" y="98" width="110" height="5" rx="2" fill="${COR.orange}"/>`;
    const kg = fin(t, t0 + 0.5, 0.8);
    [0.3, 0.45, 0.62, 0.78, 0.95].forEach((v, i) => {
      const hh = 150 * v * kg;
      q += `<rect x="${44 + i * 52}" y="${f(290 - hh)}" width="34" height="${f(hh)}" rx="6" fill="${i === 4 ? COR.orange : COR.blue2}"/>`;
    });
    q += `<path d="M44,${f(290 - 70 * kg)} L${44 + 4 * 52 + 17},${f(290 - 160 * kg)}" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/>`
      + `<circle cx="420" cy="200" r="54" fill="none" stroke="#284a70" stroke-width="18"/><circle cx="420" cy="200" r="54" fill="none" stroke="${COR.orange}" stroke-width="18" stroke-dasharray="${f(339 * 0.82 * kg)} 400" transform="rotate(-90 420 200)"/>`
      + txt(`${Math.round(82 * kg)}%`, 420, 212, { size: 32, weight: 900, fill: '#fff' });
    s += popG(kq, 720, 420, `<g transform="translate(-260 -160)">${q}</g>`);
    // Victor apresentando
    const fala = t < wa(45) || (t > wa(47) + 0.2);
    s += pessoa('victor', { x: 300, y: CHAO, s: 1.12, t, armR: 92 + Math.sin(t * 3) * 6, armL: 14, expr: 'joy', gaze: [1, -0.2], talk: false, hop: t > wa(47) ? Math.max(0, Math.sin((t - wa(47)) * 9)) * 10 * (1 - clamp(inv(wa(47) + 0.7, wa(47) + 1, t))) : 0 });
    // diretores chegam "por perto"
    const pos = [['dir1', 1290], ['dir2', 1510], ['dir3', 1730]];
    const gestos = [wa(45), wa(46), wa(47)];
    const icones = [['compass', 'Direciona'], ['eye', 'Acompanha'], ['swap', 'Troca']];
    pos.forEach(([id, x], i) => {
      const ent = kf(t, [[t0 + 0.1 + i * 0.12, x + 520], [t0 + 1.0 + i * 0.12, x, ease.out]]);
      const andando = t < t0 + 1.0 + i * 0.12;
      const g = gestos[i];
      const ativo = t > g - 0.1;
      const pose = {};
      if (id === 'dir1' && ativo) pose.armR = 95 + Math.sin(t * 6) * 5;
      if (id === 'dir2' && ativo) pose.armR = 70;
      if (id === 'dir3' && ativo) { pose.armR = 120; pose.armL = 120; }
      s += pessoa(id, { x: ent, y: CHAO, s: 1.06, t: t + i, flip: true, walk: andando ? ent / 150 : null, gaze: [1, -0.1], expr: ativo ? 'joy' : 'smile', ...pose });
      // balão com o gesto
      const kb = back(t, g - 0.08, 0.45);
      const [ic, lab] = icones[i];
      const w = largura(lab, 26, 800) + 84;
      s += popG(kb, x, 330 - (i % 2) * 40, `${cartao(-w / 2, -36, w, 72, { r: 36 })}<circle cx="${f(-w / 2 + 34)}" cy="0" r="24" fill="#fff4e6"/>${icone(ic, -w / 2 + 34, 0, 0.7)}${txt(lab, -w / 2 + 64, 10, { anchor: 'start', size: 26, weight: 800, fill: COR.navy })}<path d="M-12,34 L0,56 L12,34" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><rect x="-14" y="28" width="28" height="8" fill="#fff"/>`)
        + faiscas(x, 330 - (i % 2) * 40, t - g, COR.orange, 8, 70, 110);
    });
    // setas bilaterais: liderança -> Victor (laranja) e Victor -> liderança (azul)
    const ka = fin(t, wa(42) - 0.2, 0.6);
    if (ka > 0) {
      const arco1 = 'M1240,520 Q820,150 420,470';
      const arco2 = 'M420,590 Q820,800 1240,610';
      const L = 1100;
      s += `<path d="${arco1}" stroke="${COR.orange}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="${f(L * ka)} ${L}" opacity=".9"/>`
        + `<path d="${arco2}" stroke="${COR.blue}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="${f(L * ka)} ${L}" opacity=".9"/>`;
      // pontas
      if (ka > 0.95) s += `<path d="M436,446 L414,474 L448,480" stroke="${COR.orange}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M1216,594 L1244,612 L1214,630" stroke="${COR.blue}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      // fichas viajando
      const bez = (p0, p1, p2, u) => [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];
      for (let k = 0; k < 2; k++) {
        const u1 = ((t - wa(42)) * 0.55 + k * 0.5) % 1, u2 = ((t - wa(42)) * 0.55 + k * 0.5 + 0.25) % 1;
        if (t < wa(42) + 0.3) break;
        const [x1, y1] = bez([1240, 520], [820, 150], [420, 470], u1);
        const [x2, y2] = bez([420, 590], [820, 800], [1240, 610], u2);
        s += `<g transform="translate(${f(x1)} ${f(y1)})"><circle r="30" fill="#fff" stroke="${INK}" stroke-width="3"/>${icone(k ? 'compass' : 'chat', 0, 0, 0.75)}</g>`
          + `<g transform="translate(${f(x2)} ${f(y2)})"><circle r="30" fill="#fff" stroke="${INK}" stroke-width="3"/>${icone(k ? 'bulb' : 'dash', 0, 0, 0.75)}</g>`;
      }
    }
    return camera(t, s, 'lideranca', 1, 1.03, 960, 560);
  }

  // ======================= CENA 5 · 4 MESES =======================
  function cenaJornada(t) {
    const t0 = C.jornada;
    let s = chao();
    // "4 MESES"
    const k4 = back(t, wa(48) - 0.1, 0.5);
    s += popG(k4, 520, 300, `<g transform="rotate(-4)">${txt('4 MESES', 0, 0, { size: 150, weight: 900, fill: COR.orange, ls: 6, extra: `stroke="${COR.navy}" stroke-width="7" paint-order="stroke"` })}<path d="M-300,34 Q0,60 300,30" stroke="${COR.orange}" stroke-width="10" fill="none" stroke-linecap="round"/></g>`);
    // fita métrica (linha do tempo)
    const x0 = 140, x1 = 960, y = CHAO - 40;
    const prog = ease.inOut(inv(t0 + 0.15, wa(52), t));
    s += `<rect x="${x0 - 20}" y="${y - 24}" width="${x1 - x0 + 40}" height="48" rx="10" fill="#f4c64f" stroke="${INK}" stroke-width="4"/>`;
    let ticks = '';
    for (let x = x0; x <= x1; x += 20.5) ticks += `M${f(x)},${y - 24} L${f(x)},${y - (Math.round((x - x0) / 20.5) % 5 === 0 ? 4 : 12)} `;
    s += `<path d="${ticks}" stroke="${INK}" stroke-width="2.5"/>`
      + `<rect x="${x0 - 20}" y="${y + 6}" width="${f((x1 - x0 + 40) * prog)}" height="18" rx="6" fill="${COR.orange}" opacity=".9"/>`;
    const meses = [['JUL', 'badge'], ['AGO', 'sparkle'], ['SET', 'box'], ['OUT', 'people']];
    meses.forEach(([m, ic], i) => {
      const mx = lerp(x0 + 40, x1 - 40, i / 3);
      const km = back(t, t0 + 0.2 + i * 0.3, 0.4);
      s += popG(km, mx, y - 270, `${cartao(-52, -52, 104, 104, { r: 22 })}${icone(ic, 0, -8, 1.05)}${txt(m, 0, 40, { size: 20, weight: 900, fill: COR.navy, ls: 2 })}`)
        + `<path d="M${f(mx)},${y - 216} L${f(mx)},${y - 26}" stroke="${INK}" stroke-width="3" stroke-dasharray="5 5" opacity="${f(clamp(km))}"/>`;
    });
    // Victor percorre a fita
    const vx = lerp(x0 + 40, x1 + 90, prog);
    const anda = t > t0 + 0.15 && t < wa(52);
    s += pessoa('victor', { x: vx, y: y - 24, s: 0.78, t, walk: anda ? vx / 110 : null, expr: 'joy', gaze: [1, -0.3], armR: !anda && t > wa(52) ? 140 : undefined, armL: !anda && t > wa(52) ? 30 : undefined });
    // três barras A&M: entrega, performance, collection
    const barras = [['ENTREGA', 'box', 53 - 1, 0.55, COR.blue], ['PERFORMANCE', 'gauge', 53, 0.78, COR.blue2], ['COLLECTION', 'coin', 55, 1, COR.blue3]];
    barras.forEach(([lab, ic, wi, hh, col], i) => {
      const tb = wa(wi) - 0.1;
      const k = ease.back(inv(tb, tb + 0.55, t));
      const bx = 1120 + i * 230, bw = 160, H0 = 500 * hh * k;
      const slant = 34;
      if (k > 0.02) {
        const sl = slant * Math.min(1, k);
        s += `<path d="M${bx},${CHAO} L${bx},${f(CHAO - H0 + (i === 0 ? sl : 0))} L${bx + bw},${f(CHAO - H0 + (i === 0 ? 0 : sl))} L${bx + bw},${CHAO}Z" fill="${col}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
        for (let wy = CHAO - 40; wy > CHAO - H0 + 70; wy -= 44) s += `<rect x="${bx + 24}" y="${f(wy - 14)}" width="${bw - 48}" height="14" rx="4" fill="#fff" opacity=".3"/>`;
      }
      const kc = back(t, tb + 0.15, 0.45);
      const w = largura(lab, 24, 900) + 90;
      s += popG(kc, bx + bw / 2, CHAO - 500 * hh - 70, `${pilula(-w / 2, -34, w, 68, '#fff', COR.navy, 3.5)}<circle cx="${f(-w / 2 + 34)}" cy="0" r="24" fill="#fff4e6"/>${icone(ic, -w / 2 + 34, 0, 0.72)}${txt(lab, -w / 2 + 64, 9, { anchor: 'start', size: 24, weight: 900, fill: COR.navy, ls: 1 })}`)
        + faiscas(bx + bw / 2, CHAO - 500 * hh - 70, t - tb - 0.15, COR.orange, 10, 90, 140);
    });
    return camera(t, s, 'jornada', 1, 1.03, 960, 600);
  }

  // ======================= CENA 6 · FINAL (navy) =======================
  function cenaFinal(t) {
    const t0 = C.final;
    let s = `<rect width="${W}" height="${H}" fill="${COR.navy}"/>`;
    // linhas diagonais do banner
    const dr = (t - t0) * 30;
    s += `<path d="M${f(1180 - dr)},${H} L${f(1820 - dr)},-20" stroke="${COR.orange}" stroke-width="3"/>`
      + `<path d="M${f(1380 - dr * 0.6)},${H} L${f(1960 - dr * 0.6)},-20" stroke="${COR.slate}" stroke-width="14" opacity=".9"/>`
      + `<path d="M${f(1560 - dr * 0.4)},${H} L${f(2120 - dr * 0.4)},-20" stroke="${COR.slate}" stroke-width="40" opacity=".8"/>`
      + `<path d="M${f(1700 - dr * 0.8)},-20 L${f(1700 - dr * 0.8)},${H}" stroke="${COR.orange}" stroke-width="2.5" opacity=".7"/>`;
    // brilhos
    for (let i = 0; i < 14; i++) {
      const x = (i * 337) % 1800 + 60, y = (i * 211) % 700 + 120;
      const a = 0.25 + 0.25 * Math.sin(t * 2 + i);
      s += `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#fff" opacity="${f(a)}"/>`;
    }
    // título DTS
    const kd = back(t, t0 + 0.05, 0.55);
    const dts = txt('DTS', 0, 0, { anchor: 'start', size: 250, weight: 900, fill: '#fff', ls: 4 })
      + `<rect x="${f(largura('DTS', 250, 900) + 40)}" y="-170" width="12" height="170" fill="${COR.orange}"/>`
      + txt('Digital & Technology', largura('DTS', 250, 900) + 86, -96, { anchor: 'start', size: 66, weight: 600, family: 'DM Sans', fill: '#dbe6f2' })
      + txt('Services', largura('DTS', 250, 900) + 86, -18, { anchor: 'start', size: 66, weight: 600, family: 'DM Sans', fill: '#dbe6f2' });
    s += popG(kd, 140, 560, dts);
    // ENTREGA · PERFORMANCE · COLLECTION (letras espaçadas como "NEWSLETTER")
    const kp = fin(t, t0 + 0.35, 0.4);
    s += `<g opacity="${f(kp)}" transform="translate(${f(-30 * (1 - kp))} 0)">${txt('ENTREGA · PERFORMANCE · COLLECTION', 146, 650, { anchor: 'start', size: 44, weight: 800, fill: COR.orange, ls: 9 })}</g>`;
    const kl = fin(t, t0 + 0.55, 0.4);
    s += `<g opacity="${f(kl)}"><rect x="146" y="680" width="6" height="40" fill="${COR.lblue}"/>${txt('Jul → Out 2026 · IA na prática, com a liderança por perto', 170, 710, { anchor: 'start', size: 30, weight: 500, family: 'DM Sans', fill: '#b8cce0' })}</g>`;
    // lockup Alvarez & Marsal
    const ka = back(t, wa(59) - 0.05, 0.55);
    const lock = marcaAM(-150, 0, 0.42, { c1: '#ffffff', c2: COR.blue2, c3: COR.blue3, c4: COR.lblue })
      + txt('ALVAREZ & MARSAL', 160, -40, { anchor: 'start', size: 54, weight: 600, family: 'DM Sans', fill: '#fff', ls: 6 })
      + `<rect x="160" y="-22" width="${f(largura('ALVAREZ & MARSAL', 54, 600, 'DM Sans') + 6 * 16)}" height="5" fill="${COR.orange}"/>`;
    s += popG(ka, 210, 300, lock);
    // personagens: diretores atrás, Victor na frente
    const kpers = fin(t, t0 + 0.2, 0.5);
    const yb = 900;
    s += `<ellipse cx="1520" cy="${yb + 4}" rx="400" ry="26" fill="#000" opacity=".25"/>`;
    [['dir1', 1430, 0.86], ['dir2', 1610, 0.86], ['dir3', 1790, 0.86]].forEach(([id, x, sc], i) => {
      s += pessoa(id, { x, y: yb - 40 + (1 - kpers) * 300, s: sc, t: t + i, expr: 'joy', gaze: [-0.4, -0.2], wave: t > wa(59) + i * 0.12 ? 0.7 : 0, alpha: kpers });
    });
    s += pessoa('victor', { x: 1230, y: yb + 10 + (1 - kpers) * 300, s: 1.02, t, expr: 'joy', gaze: [0, -0.2], wave: t > t0 + 0.5 ? 1 : 0, armL: 30, alpha: kpers, hop: Math.max(0, Math.sin((t - t0 - 0.4) * 8)) * 12 * (1 - clamp(inv(t0 + 1.2, t0 + 1.5, t))) });
    // faixa tricolor de base
    s += `<rect x="0" y="${H - 12}" width="${W * 0.46}" height="12" fill="${COR.orange}"/><rect x="${W * 0.46}" y="${H - 12}" width="${W * 0.3}" height="12" fill="${COR.slate}"/><rect x="${W * 0.76}" y="${H - 12}" width="${W * 0.24}" height="12" fill="${COR.lblue}"/>`;
    // fade final
    const fo = inv(TOTAL - 0.5, TOTAL, t);
    if (fo > 0) s += `<rect width="${W}" height="${H}" fill="${COR.navy}" opacity="${f(fo * 0.0)}"/>`;
    return s;
  }

  const CENAS = { chegada: cenaChegada, aula: cenaAula, descoberta: cenaAula, criacao: cenaCriacao, lideranca: cenaLideranca, jornada: cenaJornada, final: cenaFinal };

  function frame(t) {
    const id = cenaEm(t);
    const escuro = id === 'final';
    let s = escuro ? '' : fundo(t);
    s += CENAS[id](t);
    s += interfaceTopo(t, escuro);
    s += legenda(t);
    s += cortina(t);
    // fade de entrada
    if (t < 0.35) s += `<rect width="${W}" height="${H}" fill="${COR.navy}" opacity="${f(1 - t / 0.35)}"/>`;
    return s;
  }

  return { duration: TOTAL, frame, audio: './build/dts/trilha.wav' };
}

export async function criar() {
  const r = await fetch('./src/dts/tempos.json');
  if (!r.ok) throw new Error('rode antes: python3 producao/dts_audio.py');
  return buildCurta(await r.json());
}
