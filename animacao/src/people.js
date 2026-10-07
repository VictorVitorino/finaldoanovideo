// Pessoas no estilo "mini Disney 2D": cabeça grande, olhos com íris e dois brilhos,
// pálpebra marcada, nariz, sorriso com dentes, barba, óculos e cabelos variados.
// Coordenadas da cabeça centradas em (0, 0); o rosto tem raio ~30.
import { clamp, lerp, n2, C } from './core.js';

const INK = C.ink;

function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function mixc(a, b, k) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
}

const FACE = 'M0 -30 C17 -30 29.5 -17 29.5 0 C29.5 18 18 31.5 0 31.5 C-18 31.5 -29.5 18 -29.5 0 C-29.5 -17 -17 -30 0 -30Z';

// ---------- cabelo (atrás do corpo) ----------
export function hairBehind(S) {
  const c = S.hairColor ?? '#2a1d16';
  const c2 = S.hairColor2;
  switch (S.hair) {
    case 'longStraight': {
      let s = `<path d="M-35 -6 C-37 -36 -14 -43 0 -43 C14 -43 37 -36 35 -6 L37 62 Q37 74 26 74 L-26 74 Q-37 74 -37 62Z" fill="${c}"/>`;
      if (c2) s += `<path d="M-36.6 40 L36.6 40 L37 62 Q37 74 26 74 L-26 74 Q-37 74 -37 62Z" fill="${c2}" opacity=".75"/>`;
      return s;
    }
    case 'longWavy':
      return `<path d="M-35 -6 C-37 -36 -14 -43 0 -43 C14 -43 37 -36 35 -6 C40 14 33 26 39 40 C44 52 36 62 40 74 Q30 80 22 72 L-22 72 Q-30 80 -40 74 C-36 62 -44 52 -39 40 C-33 26 -40 14 -35 -6Z" fill="${c}"/>`;
    case 'shoulder':
      return `<path d="M-34 -6 C-36 -35 -14 -42 0 -42 C14 -42 36 -35 34 -6 L35 40 Q35 46 29 46 L-29 46 Q-35 46 -35 40Z" fill="${c}"/>`;
    case 'wavy':
      return `<path d="M-34 -6 C-36 -35 -14 -42 0 -42 C14 -42 36 -35 34 -6 C39 10 32 22 38 34 Q34 46 24 44 Q18 50 10 44 L-10 44 Q-18 50 -24 44 Q-34 46 -38 34 C-32 22 -39 10 -34 -6Z" fill="${c}"/>`;
    case 'bigCurly': {
      let s = `<path d="M-40 -4 C-44 -40 -16 -50 0 -50 C16 -50 44 -40 40 -4 L42 36 Q30 50 0 50 Q-30 50 -42 36Z" fill="${c}"/>`;
      const pts = [[-42, -10, 13], [-44, 8, 13], [-40, 26, 12], [-30, 40, 12], [42, -10, 13], [44, 8, 13], [40, 26, 12], [30, 40, 12], [-34, -30, 13], [34, -30, 13], [-18, -44, 13], [0, -48, 13], [18, -44, 13]];
      for (const [x, y, r] of pts) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
      for (const [x, y] of [[-36, 2], [38, 14], [-24, 34], [22, -40], [-8, -42]]) s += `<path d="M${x} ${y} q4 -5 8 0" stroke="${mixc(c, '#000000', 0.35)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      return s;
    }
    case 'long':
      return `<path d="M-31 -6 q-2 -26 31 -30 q33 4 31 30 v34 q0 8 -8 8 h-46 q-8 0 -8 -8z" fill="${c}"/>`;
    default:
      return '';
  }
}

// ---------- cabelo (na frente da cabeça) ----------
function hairOver(S, lock = 0) {
  const c = S.hairColor ?? '#2a1d16';
  const dk = mixc(c, '#000000', 0.3), lt = S.hairColor2 ?? mixc(c, '#ffffff', 0.25);
  switch (S.hair) {
    case 'side':
      return `<path d="M-30.5 -1 C-33 -27 -14 -41 4 -39 C23 -38 34 -26 30.5 -3 C28 -14 23 -20 14 -21 C5 -14 -10 -16 -19 -20 C-24 -16 -28 -9 -30.5 -1Z" fill="${c}"/>`
        + `<path d="M-20 -31 C-8 -46 19 -45 27 -30 C17 -37 0 -37 -20 -31Z" fill="${c}"/><path d="M-12 -33 q12 -9 28 -3" stroke="${lt}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>`
        + `<rect x="-30" y="-8" width="5" height="12" rx="2" fill="${c}"/><rect x="25" y="-8" width="5" height="12" rx="2" fill="${c}"/>`;
    case 'grayUp':
      return `<path d="M-30.5 -1 C-33 -28 -16 -42 2 -41 C22 -41 34 -28 30.5 -3 C28 -14 22 -20 12 -21 C2 -18 -12 -18 -19 -20 C-24 -16 -28 -9 -30.5 -1Z" fill="${c}"/>`
        + `<path d="M-22 -30 l4 -12 l5 9 l5 -12 l5 10 l6 -11 l4 11 l6 -8 l2 13 C10 -36 -8 -36 -22 -30Z" fill="${c}"/>`
        + `<path d="M-16 -32 q8 -8 18 -6 M4 -36 q8 -2 14 4 M-24 -18 q4 -8 12 -10" stroke="${lt}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>`
        + `<rect x="-30" y="-8" width="5" height="10" rx="2" fill="${c}"/><rect x="25" y="-8" width="5" height="10" rx="2" fill="${c}"/>`;
    case 'slick':
      return `<path d="M-30.5 -3 C-32 -29 -13 -40 2 -40 C21 -40 33 -29 30.5 -3 C28.5 -16 19 -25 1 -25 C-16 -25 -27 -16 -30.5 -3Z" fill="${c}"/>`
        + `<path d="M-18 -30 q14 -8 32 -3 M-12 -35 q12 -5 24 -1 M-24 -22 q6 -6 12 -8" stroke="${lt}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".55"/>`
        + `<rect x="-30" y="-8" width="5" height="12" rx="2" fill="${c}"/><rect x="25" y="-8" width="5" height="12" rx="2" fill="${c}"/>`;
    case 'curlyTop': {
      let s = `<path d="M-30 -2 C-32 -26 -15 -36 0 -36 C15 -36 32 -26 30 -2 C28 -12 20 -18 0 -19 C-20 -18 -28 -12 -30 -2Z" fill="${c}"/>`;
      const pts = [[-26, -16, 8], [-22, -27, 9], [-12, -35, 9.5], [0, -38, 10], [12, -35, 9.5], [22, -27, 9], [26, -16, 8], [-6, -44, 8], [8, -44, 8]];
      for (const [x, y, r] of pts) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
      for (const [x, y] of [[-14, -38], [4, -42], [18, -30], [-24, -22]]) s += `<path d="M${x} ${y} q3 -4 6 0" stroke="${lt}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`;
      return s + `<rect x="-30" y="-6" width="5" height="12" rx="2" fill="${c}"/><rect x="25" y="-6" width="5" height="12" rx="2" fill="${c}"/>`;
    }
    case 'bald':
      return `<ellipse cx="-11" cy="-20" rx="9" ry="5" fill="#ffffff" opacity=".28" transform="rotate(-25 -11 -20)"/><path d="M-30 -2 q-1 -8 2 -12 l3 3 v11z M30 -2 q1 -8 -2 -12 l-3 3 v11z" fill="${c}" opacity=".85"/>`;
    case 'longStraight':
    case 'longWavy':
      return `<path d="M-31 12 C-34 -22 -18 -38 0 -38 C18 -38 34 -22 31 12 C29 -8 20 -22 4 -27 C-6 -22 -21 -14 -31 12Z" fill="${c}"/>`
        + `<path d="M-31 -2 Q-36 26 -30 48 Q-24 30 -25 6Z M31 -2 Q36 26 30 48 Q24 30 25 6Z" fill="${c}"/>`
        + `<path d="M-10 -32 q-8 6 -14 18 M10 -32 q8 6 14 18" stroke="${lt}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>`;
    case 'shoulder':
      return `<path d="M-31.5 8 C-34 -24 -16 -37 0 -37 C16 -37 34 -24 31.5 8 C29.5 -8 21 -21 0.5 -29 C-20 -21 -29.5 -8 -31.5 8Z" fill="${c}"/>`
        + `<path d="M-31 -2 Q-34 22 -30 40 Q-25 26 -25.5 4Z M31 -2 Q34 22 30 40 Q25 26 25.5 4Z" fill="${c}"/>`;
    case 'wavy':
      return `<path d="M-31.5 6 C-35 -24 -16 -37 2 -37 C20 -37 35 -24 31.5 6 C29 -10 22 -20 10 -26 C0 -18 -16 -16 -24 -14 C-28 -8 -30 -2 -31.5 6Z" fill="${c}"/>`
        + `<path d="M-31 -2 Q-37 14 -31 26 Q-36 34 -30 42 Q-24 30 -25 6Z M31 -2 Q37 14 31 26 Q36 34 30 42 Q24 30 25 6Z" fill="${c}"/>`;
    case 'bigCurly': {
      let s = '';
      for (const [x, y, r] of [[-24, -30, 10], [-10, -36, 10], [6, -37, 10], [20, -32, 10], [29, -20, 8], [-30, -18, 8]]) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
      s += `<path d="M-31 -6 Q-36 16 -32 30 Q-26 14 -26 -2Z M31 -6 Q36 16 32 30 Q26 14 26 -2Z" fill="${c}"/>`;
      return s + `<path d="M-16 -34 q4 -5 8 0 M8 -36 q4 -5 8 0" stroke="${dk}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    }
    // estilos simples (compatibilidade com a primeira versão)
    case 'swoop': {
      const lk = clamp(lock);
      const mecha = `<g transform="translate(-8 -27) rotate(${n2(lerp(165, 15, lk))})"><path d="M0 0 q-9 5 -6 15 q2 4 5 2" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
      return `<path d="M-30.5 -2 q-1 -31 27 -34 q31 -2 34 28 q-8 -13 -25 -13 q-19 0 -36 19z" fill="${c}"/><path d="M-23 -24 q17 -26 49 -11 q-6 -2 -15 2 q-15 -11 -34 9z" fill="${c}"/>` + mecha;
    }
    case 'short':
      return `<path d="M-30.5 -3 q-2 -31 29.5 -33 q32.5 0 31.5 32 q-6 -14 -19 -16 q-6 7 -17 5 q-8 -3 -12.5 -6 q-8.5 6 -12.5 18z" fill="${c}"/>`;
    case 'buzz':
      return `<path d="M-29.5 -6 q0 -27 29.5 -28.5 q29.5 1.5 29.5 28.5 q-6 -15 -29.5 -17 q-23.5 2 -29.5 17z" fill="${c}"/>`;
    case 'long':
      return `<path d="M-31.5 4 q-4 -36 31.5 -38 q35.5 2 31.5 38 q-4 -15 -12.5 -21 q-15 8 -40 2 q-6 6 -10.5 19z" fill="${c}"/>`;
    case 'bun':
      return `<circle cx="0" cy="-37" r="11.5" fill="${c}"/><path d="M-30.5 -2 q-2 -31.5 30.5 -32.5 q32.5 1 30.5 32.5 q-8.5 -17 -30.5 -18 q-22 1 -30.5 18z" fill="${c}"/>`;
    case 'ponytail':
      return `<path d="M25 -19 q21 6 17 36 q-6 -10 -15 -15z" fill="${c}"/><path d="M-30.5 -2 q-2 -31.5 30.5 -32.5 q32.5 1 30.5 32.5 q-10.5 -16 -30.5 -17 q-20 1 -30.5 17z" fill="${c}"/>`;
    case 'curly': {
      let s = '';
      for (let i = 0; i < 11; i++) { const a = Math.PI * (1.05 + (i / 10) * 0.9); s += `<circle cx="${n2(Math.cos(a) * 27.5)}" cy="${n2(Math.sin(a) * 27.5 - 2)}" r="10" fill="${c}"/>`; }
      return s + `<path d="M-27.5 -8 q0 -23 27.5 -23 q27.5 0 27.5 23 q-10.5 -10.5 -27.5 -10.5 q-17 0 -27.5 10.5z" fill="${c}"/>`;
    }
    case 'wild':
      return [[-25, -15, 8.5], [-31.5, -2, 7.5], [25, -15, 8.5], [31.5, -2, 7.5], [-15, -27, 7.5], [15, -27, 7.5], [0, -31.5, 6.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('');
    default:
      return '';
  }
}

function beardShape(kind, c) {
  const full = `M-29 -4 C-28.5 14 -18 35 0 36 C18 35 28.5 14 29 -4 L24.5 -2 C23 8 19 12.5 12 13.5 C6 10 -6 10 -12 13.5 C-19 12.5 -23 8 -24.5 -2Z`;
  const mus = `M-12 12.2 Q-6 7.6 0 9.6 Q6 7.6 12 12.2 Q6 13.6 0 12.2 Q-6 13.6 -12 12.2Z`;
  if (kind === 'full') return `<path d="${full}" fill="${c}"/><path d="${mus}" fill="${c}"/>`;
  if (kind === 'short') return `<path d="${full}" fill="${c}" opacity=".28"/><path d="M-27 0 C-26 14 -17 32 0 33 C17 32 26 14 27 0" stroke="${c}" stroke-width="3" fill="none" opacity=".35"/>`;
  if (kind === 'goatee') return `<path d="M-9 21 Q0 19 9 21 Q8.5 33 0 35 Q-8.5 33 -9 21Z" fill="${c}"/><path d="${mus}" fill="${c}" opacity=".75"/>`;
  return '';
}

function glassesShape(kind, col) {
  const w = kind === 'geo' ? 2.2 : 3;
  if (kind === 'rect') return `<g stroke="${col}" stroke-width="${w}" fill="rgba(255,255,255,.12)"><rect x="-21.5" y="-7.5" width="20" height="15" rx="4"/><rect x="1.5" y="-7.5" width="20" height="15" rx="4"/></g><path d="M-1.5 -2 h3 M-21.5 -3 h-7 M21.5 -3 h7" stroke="${col}" stroke-width="${w}"/>`;
  if (kind === 'geo') return `<g stroke="${col}" stroke-width="${w}" fill="rgba(255,255,255,.12)" stroke-linejoin="round"><path d="M-20 -6 L-15 -10 L-5 -10 L-1 -5 L-2 5 L-7 9 L-16 9 L-21 4Z"/><path d="M20 -6 L15 -10 L5 -10 L1 -5 L2 5 L7 9 L16 9 L21 4Z"/></g><path d="M-1 -4 q1 -2 2 0 M-21 -4 h-7 M21 -4 h7" stroke="${col}" stroke-width="${w}" fill="none"/>`;
  // redondo
  return `<g stroke="${col}" stroke-width="${w}" fill="rgba(255,255,255,.12)"><circle cx="-11" cy="0" r="10.5"/><circle cx="11" cy="0" r="10.5"/></g><path d="M-1 -1 h2 M-21.5 -2 h-7 M21.5 -2 h7" stroke="${col}" stroke-width="${w}"/>`;
}

// ---------- rosto ----------
// E: expressão já resolvida (brow, tilt, k, w, eye, blush, o, open)
export function personHead(S, st, E, seed, t, blink, talkOpen) {
  const skin = S.skin, shade = mixc(skin, '#5a2a14', 0.2);
  const hc = S.hairColor ?? '#2a1d16';
  let s = '';
  // orelhas
  for (const sx of [-1, 1]) s += `<ellipse cx="${28 * sx}" cy="3" rx="6.5" ry="8.5" fill="${skin}"/><ellipse cx="${28.6 * sx}" cy="3.5" rx="3" ry="4.6" fill="${shade}" opacity=".5"/>`;
  s += `<path d="${FACE}" fill="${skin}"/>`;
  // bochechas
  for (const sx of [-1, 1]) s += `<ellipse cx="${18 * sx}" cy="10" rx="6" ry="3.6" fill="${C.pink}" opacity="${n2(0.18 + E.blush * 0.5)}"/>`;
  if (S.freckles) for (const [x, y] of [[-17, 5], [-14, 8], [-20, 9], [-11, 6], [17, 5], [14, 8], [20, 9], [11, 6]]) s += `<circle cx="${x}" cy="${y}" r="0.9" fill="${shade}" opacity=".8"/>`;
  if (S.beard) s += beardShape(S.beard, S.beardColor ?? hc);
  // nariz
  s += `<path d="M-3.6 8.2 Q0 11.6 3.6 8.2" stroke="${shade}" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="-1" cy="4.5" rx="1.6" ry="2.4" fill="#ffffff" opacity=".22"/>`;
  // olhos
  const [gx, gy] = st.gaze ?? [0, 0];
  const lid = S.lidColor ?? INK;
  for (const sx of [-1, 1]) {
    const ex = 10.8 * sx;
    if (blink < 0.3) {
      s += `<path d="M${n2(ex - 7)} 0 q7 ${n2(4)} 14 0" stroke="${lid}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      if (S.lashes) s += `<path d="M${n2(ex + 7 * sx)} 0 l${n2(3 * sx)} -2" stroke="${lid}" stroke-width="2.2" stroke-linecap="round"/>`;
      continue;
    }
    const k = E.eye;
    s += `<g transform="translate(${n2(ex)} 0) scale(${n2(k)} ${n2(k * blink)})">`
      + `<ellipse rx="7.2" ry="8.4" fill="#fff"/>`
      + `<g transform="translate(${n2(gx * 2.2)} ${n2(gy * 2 + 0.6)})"><circle r="5.2" fill="${S.iris ?? '#6b4426'}"/><circle r="2.8" fill="#16121a"/><circle cx="1.9" cy="-2.2" r="1.75" fill="#fff"/><circle cx="-1.7" cy="1.9" r=".85" fill="#fff"/></g>`
      + `<path d="M-7.8 -1.5 Q0 -11.8 7.8 -1.5" stroke="${lid}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      + (S.lashes ? `<path d="M${n2(7 * sx)} -3 l${n2(3.6 * sx)} -3.2 M${n2(5 * sx)} -6.2 l${n2(2.6 * sx)} -3.4" stroke="${lid}" stroke-width="2" stroke-linecap="round"/>` : '')
      + `</g>`;
  }
  // sobrancelhas
  const bys = Array.isArray(E.brow) ? E.brow : [E.brow, E.brow];
  const tls = Array.isArray(E.tilt) ? E.tilt : [E.tilt, E.tilt];
  const browC = S.browColor ?? mixc(hc === '#f4f4f4' ? '#9a9a9a' : hc, '#000000', 0.15);
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const bx = 11 * sx, by = -13.5;
    const rot = sx < 0 ? -tls[0] : tls[1];
    s += `<path d="M${n2(bx - 7.5)} ${by + 1.5} q7.5 -5.5 15 -1.2" stroke="${browC}" stroke-width="${S.thinBrows ? 2.6 : 3.6}" fill="none" stroke-linecap="round" transform="translate(0 ${n2(bys[i])}) rotate(${n2(rot)} ${n2(bx)} ${by})"/>`;
  }
  // boca
  const mx = 0, my = 16, mw = 17 * E.w;
  const x0 = mx - mw / 2, x1 = mx + mw / 2;
  const open = Math.max(E.open ?? 0, talkOpen);
  const grin = S.grin && E.k >= 1.05 && open < 0.1 && E.o < 0.05;
  if (E.o > 0.05 && open < 0.2) {
    s += `<ellipse cx="0" cy="${my + 2}" rx="${n2(4.4 * (0.6 + 0.4 * E.o))}" ry="${n2(5.8 * E.o)}" fill="#4a1d24"/>`;
  } else if (grin || open > 0.06) {
    const H = grin ? 9 : 3 + 11 * open, k = E.k;
    s += `<path d="M${n2(x0)} ${my} Q${mx} ${n2(my + k * 3)} ${n2(x1)} ${my} Q${mx} ${n2(my + k * 3 + H * 1.7)} ${n2(x0)} ${my}Z" fill="#4a1d24"/>`;
    s += `<path d="M${n2(x0 + 1.5)} ${n2(my + 0.6)} Q${mx} ${n2(my + k * 3 + 0.8)} ${n2(x1 - 1.5)} ${n2(my + 0.6)} L${n2(x1 - 3)} ${n2(my + 3.6)} Q${mx} ${n2(my + k * 3 + 4.4)} ${n2(x0 + 3)} ${n2(my + 3.6)}Z" fill="#fff"/>`;
    s += `<ellipse cx="0" cy="${n2(my + k * 2 + H * 1.05)}" rx="${n2(mw * 0.2)}" ry="${n2(H * 0.2)}" fill="#e46b7b"/>`;
  } else {
    s += `<path d="M${n2(x0)} ${my} q${n2(mw / 2)} ${n2(E.k * 9)} ${n2(mw)} 0" stroke="${mixc(skin, '#5a1a1a', 0.55)}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  }
  if (S.beard === 'full' || S.beard === 'short' || S.beard === 'goatee') s += `<path d="M-12 12.2 Q-6 7.6 0 9.6 Q6 7.6 12 12.2 Q6 13.6 0 12.2 Q-6 13.6 -12 12.2Z" fill="${S.beardColor ?? hc}" opacity="${S.beard === 'full' ? 1 : S.beard === 'short' ? 0.5 : 0.75}"/>`;
  if (S.glasses) s += glassesShape(S.glasses, S.glassesColor ?? INK);
  s += hairOver(S, st.lock ?? 0);
  if (S.earrings) for (const sx of [-1, 1]) s += S.earrings === 'drop' ? `<path d="M${28 * sx} 10 v3" stroke="#c9a24a" stroke-width="1.5"/><ellipse cx="${28 * sx}" cy="16.5" rx="2.6" ry="3.6" fill="${S.earringColor ?? '#1f8a5a'}"/>` : `<circle cx="${28.5 * sx}" cy="11.5" r="2.6" fill="${S.earringColor ?? '#d8a93b'}"/>`;
  return s;
}

// ---------- roupas novas ----------
export function personTorso(S, W = 60, top = -88, bot = -22) {
  const x = -W / 2, h = bot - top, col = S.top;
  const sheen = `<path d="M${x + 9} ${top + 20} q4 -12 16 -15" stroke="rgba(255,255,255,.3)" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  let s = '';
  switch (S.outfit) {
    case 'polo':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      s += `<path d="M-15 ${top + 1} l9 11 l6 -9 l6 9 l9 -11 l-6 -2 l-9 6 l-9 -6z" fill="${mixc(col, '#ffffff', 0.12)}"/><path d="M0 ${top + 4} v16" stroke="${mixc(col, '#ffffff', 0.18)}" stroke-width="2"/><circle cx="0" cy="${top + 10}" r="1.6" fill="#7a8494"/><circle cx="0" cy="${top + 17}" r="1.6" fill="#7a8494"/>`;
      break;
    case 'vestShirt': {
      const shirt = S.inner ?? '#5c6068';
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${shirt}"/>`;
      s += `<path d="M${x + 6} ${top + 8} q0 -6 8 -8 L-2 ${top + 30} V${bot} H${x + 10} q-4 0 -4 -6z M${-x - 6} ${top + 8} q0 -6 -8 -8 L2 ${top + 30} V${bot} H${-x - 10} q4 0 4 -6z" fill="${col}"/>`;
      s += `<path d="M-12 ${top + 1} l12 8 l12 -8" stroke="${mixc(shirt, '#ffffff', 0.15)}" stroke-width="3.5" fill="none" stroke-linejoin="round"/><circle cx="-6" cy="${top + 36}" r="1.8" fill="#d0d4da"/><circle cx="-6" cy="${top + 48}" r="1.8" fill="#d0d4da"/>`;
      break;
    }
    case 'blazer':
    case 'plaid': {
      const inner = S.inner ?? '#f7f3ea';
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${inner}"/>`;
      const panels = `M${x} ${top + 18} q0 -18 18 -18 h2 L-4 ${top + 30} L-6 ${bot} H${x + 8} q-8 0 -8 -8z M${-x} ${top + 18} q0 -18 -18 -18 h-2 L4 ${top + 30} L6 ${bot} H${-x - 8} q8 0 8 -8z`;
      s += `<path d="${panels}" fill="${col}"/>`;
      if (S.outfit === 'plaid') {
        const pc = S.plaidColor ?? '#3a3530';
        s += `<clipPath id="pl${Math.round(Math.abs(W * 7 + top))}${S.top.slice(1)}"><path d="${panels}"/></clipPath>`;
        let lines = '';
        for (let yy = top + 6; yy < bot; yy += 9) lines += `<path d="M${x} ${yy} H${-x}" stroke="${pc}" stroke-width="${yy % 18 ? 1.4 : 2.6}" opacity=".7"/>`;
        for (let xx = x + 4; xx < -x; xx += 9) lines += `<path d="M${xx} ${top} V${bot}" stroke="${pc}" stroke-width="${(xx - x) % 18 ? 1.4 : 2.6}" opacity=".7"/>`;
        s += `<g clip-path="url(#pl${Math.round(Math.abs(W * 7 + top))}${S.top.slice(1)})">${lines}</g>`;
      }
      s += `<path d="M-18 ${top + 1} L-4 ${top + 30} M18 ${top + 1} L4 ${top + 30}" stroke="rgba(0,0,0,.18)" stroke-width="2.5" stroke-linecap="round"/>`;
      if (S.turtleneck) s += `<rect x="-11" y="${top - 4}" width="22" height="12" rx="5" fill="${inner}"/><path d="M-9 ${top - 1} h18 M-9 ${top + 3} h18" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/>`;
      if (S.buttons) s += `<circle cx="-14" cy="${top + 40}" r="2.6" fill="#d8a93b"/><circle cx="14" cy="${top + 40}" r="2.6" fill="#d8a93b"/>`;
      break;
    }
    case 'dotted':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      for (let yy = top + 8; yy < bot - 4; yy += 7) for (let xx = x + 6 + ((yy / 7) % 2) * 3; xx < -x - 4; xx += 7) s += `<circle cx="${n2(xx)}" cy="${yy}" r=".9" fill="#6b7a90" opacity=".7"/>`;
      s += `<path d="M-14 ${top + 1} l14 12 l14 -12" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linejoin="round"/><path d="M0 ${top + 13} V${bot}" stroke="rgba(0,0,0,.1)" stroke-width="2"/>`;
      break;
    case 'blouseCollar':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/>`;
      s += `<path d="M-6 ${top} L0 ${top + 12} L6 ${top}z" fill="${S.skin}"/><path d="M-15 ${top} L-2 ${top + 12} L-10 ${top + 16}z M15 ${top} L2 ${top + 12} L10 ${top + 16}z" fill="${mixc(col, '#000000', 0.06)}"/><path d="M0 ${top + 12} V${bot}" stroke="rgba(0,0,0,.08)" stroke-width="2"/>`;
      break;
    case 'top':
      s += `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="24" fill="${col}"/><path d="M-13 ${top + 1} q13 14 26 0z" fill="${S.skin}"/>`;
      if (S.knit) for (let yy = top + 16; yy < bot; yy += 7) s += `<path d="M${x + 4} ${yy} H${-x - 4}" stroke="rgba(0,0,0,.07)" stroke-width="2"/>`;
      break;
    default:
      return null;
  }
  if (S.necklace) s += `<path d="M-10 ${top + 2} q10 12 20 0" stroke="#d8a93b" stroke-width="1.3" fill="none"/><circle cx="0" cy="${top + 9}" r="1.8" fill="${S.necklaceColor ?? '#d8a93b'}"/>`;
  return s + sheen;
}
