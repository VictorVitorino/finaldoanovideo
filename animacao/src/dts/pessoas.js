// Personagens da curta DTS, no estilo chibi chapado do vídeo de referência (Canteiro):
// cabeça grande, olhos de ponto com brilho, bochecha rosada, contorno navy.
// pessoa(id, st) -> SVG com os pés em (st.x, st.y). Altura ~250 px na escala 1.
//
// st: { x, y, s, flip, t, walk, hop, tilt, lean, armL, armR, expr, blink, alpha, typing, wave }
// armL / armR: graus a partir do braço caído (0). 90 = horizontal para fora, 160 = para cima,
// negativo = para dentro (na frente do corpo).
import { n2, clamp } from '../core.js';

export const INK = '#16233b';
const SHOE = '#1b2236';

// Aparência. Os diretores seguem as fotos enviadas; os nomes não aparecem no vídeo.
export const ELENCO_DTS = {
  // Victor: careca (informado por ele); o resto do visual segue provisório até chegar uma foto.
  victor: { skin: '#e9b892', hair: 'bald', hairColor: '#2a1d16', outfit: 'blazer', top: '#2c4a6e', shirt: '#dbe9f7', pants: '#1f2b40', badge: true },
  // Foto 1: cabelo escuro penteado de lado, barba curta, terno azul, gravata roxa.
  dir1: { skin: '#eebd9a', hair: 'side', hairColor: '#231812', beard: 'short', beardColor: '#2a1d16', outfit: 'suit', top: '#2d4a7a', shirt: '#ffffff', tie: '#6b2f8a', pants: '#24385e' },
  // Foto 2: cabelo longo ondulado castanho com luzes caramelo, blusa preta de renda, brincos.
  dir2: { skin: '#eec3a2', hair: 'long', hairColor: '#4a2c1c', hairColor2: '#b9853f', outfit: 'lace', top: '#1b1b20', pants: '#23232b', earrings: true, lashes: true },
  // Foto 3: entradas na testa, óculos retangulares finos, barba cheia, terno escuro.
  dir3: { skin: '#e2ae88', hair: 'receding', hairColor: '#211812', beard: 'full', beardColor: '#231a14', glasses: true, outfit: 'suit', top: '#2a3242', shirt: '#ffffff', tie: null, pants: '#252c3a' },
  // colegas genéricos da recepção
  col1: { skin: '#c98d66', hair: 'bun', hairColor: '#1d1410', outfit: 'blouse', top: '#2a9d8f', pants: '#2b3448', lashes: true },
  col2: { skin: '#f0c8a8', hair: 'curly', hairColor: '#6b4226', outfit: 'shirt', top: '#f2a65a', shirt: '#f2a65a', pants: '#3a4256', glasses: true },
};

const f = n2;

function blush(cx, cy) {
  return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="10" ry="5.5" fill="#f2919a" opacity=".5"/>`;
}

function hairBack(S) {
  if (S.hair === 'long') {
    return `<path d="M-66,-196 Q-76,-150 -70,-118 Q-76,-96 -62,-84 Q-50,-78 -40,-92 L40,-92 Q50,-78 62,-84 Q76,-96 70,-118 Q76,-150 66,-196 Q40,-246 0,-244 Q-40,-246 -66,-196Z" fill="${S.hairColor}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
      + `<path d="M-64,-150 Q-70,-120 -62,-92 M64,-150 Q70,-120 62,-92" stroke="${S.hairColor2}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>`;
  }
  if (S.hair === 'bun') return `<circle cx="0" cy="-244" r="22" fill="${S.hairColor}" stroke="${INK}" stroke-width="3.5"/>`;
  return '';
}

function hairFront(S) {
  const c = S.hairColor, st = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  switch (S.hair) {
    case 'quiff':
      return `<path d="M-60,-180 Q-66,-222 -40,-236 Q-20,-252 6,-246 Q24,-258 44,-242 Q66,-226 62,-182 Q54,-206 30,-210 Q8,-200 -14,-208 Q-40,-212 -52,-196 Q-58,-190 -60,-180Z" fill="${c}" ${st}/>`
        + `<path d="M-6,-240 Q14,-246 30,-232" stroke="#4a372a" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case 'bald': {
      // careca: laterais raspadas bem curtas + brilho no topo da cabeça
      const lado = `stroke="${c}" stroke-width="7" opacity=".22" fill="none" stroke-linecap="round"`;
      return `<path d="M-61,-168 Q-63,-190 -55,-206" ${lado}/><path d="M61,-168 Q63,-190 55,-206" ${lado}/>`
        + `<path d="M-30,-224 Q-8,-236 18,-231" stroke="#fff" stroke-width="7" opacity=".5" fill="none" stroke-linecap="round"/>`
        + `<ellipse cx="30" cy="-225" rx="5" ry="3.2" fill="#fff" opacity=".45"/>`;
    }
    case 'side':
      return `<path d="M-61,-176 Q-68,-226 -30,-240 Q10,-252 44,-236 Q66,-222 62,-180 Q56,-200 40,-208 Q12,-222 -18,-210 Q-44,-204 -56,-188 Q-60,-182 -61,-176Z" fill="${c}" ${st}/>`
        + `<path d="M-20,-210 Q-8,-230 30,-232" stroke="#3b2a20" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case 'receding':
      return `<path d="M-61,-170 Q-66,-206 -50,-222 Q-44,-208 -46,-196 Q-54,-186 -56,-170Z M61,-170 Q66,-206 50,-222 Q44,-208 46,-196 Q54,-186 56,-170Z" fill="${c}" ${st}/>`
        + `<path d="M-48,-222 Q-24,-240 0,-239 Q24,-240 48,-222 Q30,-226 14,-222 Q0,-230 -14,-222 Q-30,-226 -48,-222Z" fill="${c}" ${st}/>`;
    case 'long':
      return `<path d="M-64,-176 Q-70,-226 -34,-242 Q0,-254 34,-242 Q70,-226 64,-176 Q60,-204 40,-216 Q16,-226 2,-214 Q-14,-226 -40,-216 Q-60,-204 -64,-176Z" fill="${c}" ${st}/>`
        + `<path d="M-30,-232 Q-46,-214 -52,-188 M30,-232 Q46,-214 52,-188 M8,-236 Q22,-226 28,-214" stroke="${S.hairColor2}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/>`;
    case 'bun':
      return `<path d="M-61,-178 Q-66,-226 -30,-238 Q0,-246 30,-238 Q66,-226 61,-178 Q54,-206 26,-214 Q0,-218 -26,-214 Q-54,-206 -61,-178Z" fill="${c}" ${st}/>`;
    case 'curly': {
      let s = '';
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.98 + i * 0.13);
        s += `<circle cx="${f(Math.cos(a) * 54)}" cy="${f(-186 + Math.sin(a) * 50)}" r="17" fill="${c}" stroke="${INK}" stroke-width="3"/>`;
      }
      return s;
    }
    default: return '';
  }
}

function beard(S) {
  const c = S.beardColor ?? S.hairColor;
  if (S.beard === 'full') {
    return `<path d="M-60,-178 Q-62,-130 -30,-116 Q0,-104 30,-116 Q62,-130 60,-178 Q54,-150 34,-146 Q16,-152 0,-150 Q-16,-152 -34,-146 Q-54,-150 -60,-178Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M-18,-152 Q0,-160 18,-152 Q8,-148 0,-149 Q-8,-148 -18,-152Z" fill="${c}"/>`;
  }
  if (S.beard === 'short') {
    return `<path d="M-57,-168 Q-56,-132 -28,-121 Q0,-114 28,-121 Q56,-132 57,-168 Q50,-146 32,-141 Q16,-146 0,-144 Q-16,-146 -32,-141 Q-50,-146 -57,-168Z" fill="${c}" opacity=".78" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="M-16,-152 Q0,-158 16,-152 Q8,-149 0,-150 Q-8,-149 -16,-152Z" fill="${c}"/>`;
  }
  return '';
}

const EXPR = {
  smile: { mouth: 'smile', eye: 1, brow: 0 },
  joy: { mouth: 'open', eye: 1, brow: -3 },
  wow: { mouth: 'o', eye: 1.2, brow: -6 },
  focus: { mouth: 'flat', eye: 0.9, brow: 3 },
  proud: { mouth: 'smile', eye: 0.75, brow: -2 },
};

function face(S, st) {
  const E = EXPR[st.expr ?? 'smile'] ?? EXPR.smile;
  const t = st.t ?? 0;
  let bl = 1;
  if (st.blink != null) bl = 1 - st.blink;
  else {
    const ph = (t + (S.skin.charCodeAt(3) % 7) * 0.53) % 3.7;
    if (ph < 0.14) bl = Math.abs(ph - 0.07) / 0.07;
  }
  bl = Math.max(0.1, bl);
  const [gx, gy] = st.gaze ?? [0, 0];
  let s = '';
  for (const side of [-1, 1]) {
    const ex = side * 21 + gx * 3, ey = -170 + gy * 3;
    s += `<g transform="translate(${f(ex)} ${f(ey)}) scale(${f(E.eye)} ${f(E.eye * bl)})"><ellipse rx="6.8" ry="8.4" fill="${INK}"/><circle cx="2.2" cy="-3" r="2.5" fill="#fff"/></g>`;
    if (S.lashes && bl > 0.5) s += `<path d="M${f(ex + side * 5)},${f(ey - 6)} l${f(side * 5)},-4" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    const by = -189 + E.brow;
    s += `<path d="M${f(side * 13)},${f(by + (E.brow > 0 ? side * 0 : 0))} Q${f(side * 21)},${f(by - 4)} ${f(side * 29)},${f(by + (E.brow > 0 ? -2 : 1))}" stroke="${S.beardColor ?? S.hairColor}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  }
  s += blush(-36, -152) + blush(36, -152);
  if (S.glasses) {
    s += `<g fill="none" stroke="#1d2433" stroke-width="3"><rect x="-36" y="-182" width="29" height="22" rx="6"/><rect x="7" y="-182" width="29" height="22" rx="6"/><path d="M-7,-172 Q0,-176 7,-172 M-36,-174 L-56,-178 M36,-174 L56,-178"/></g>`
      + `<path d="M-32,-178 l8,-2 M11,-178 l8,-2" stroke="#fff" stroke-width="2.5" opacity=".7" stroke-linecap="round"/>`;
  }
  // boca (por cima da barba)
  const talk = st.talk ? 0.5 + 0.5 * Math.sin(t * 22) : 0;
  if (E.mouth === 'open' || talk > 0.25) {
    const h = E.mouth === 'open' ? 11 : 4 + talk * 7;
    s += `<path d="M-13,-147 Q0,${f(-147 + h * 1.6)} 13,-147 Z" fill="#7a2230" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M-6,${f(-147 + h * 0.9)} Q0,${f(-147 + h * 0.55)} 6,${f(-147 + h * 0.9)}" fill="#f07f86"/>`;
  } else if (E.mouth === 'o') {
    s += `<ellipse cx="0" cy="-143" rx="6" ry="7.5" fill="#7a2230" stroke="${INK}" stroke-width="3"/>`;
  } else if (E.mouth === 'flat') {
    s += `<path d="M-8,-146 L8,-146" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  } else {
    s += `<path d="M-12,-149 Q0,-138 12,-149" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

function head(S, st) {
  let s = '';
  s += `<ellipse cx="-59" cy="-168" rx="10" ry="12" fill="${S.skin}" stroke="${INK}" stroke-width="3.5"/><ellipse cx="59" cy="-168" rx="10" ry="12" fill="${S.skin}" stroke="${INK}" stroke-width="3.5"/>`;
  if (S.earrings) s += `<circle cx="-60" cy="-150" r="4.5" fill="#e8b84a" stroke="${INK}" stroke-width="2"/><circle cx="60" cy="-150" r="4.5" fill="#e8b84a" stroke="${INK}" stroke-width="2"/>`;
  s += `<path d="M0,-238 C38,-238 62,-214 62,-178 C62,-140 38,-118 0,-118 C-38,-118 -62,-140 -62,-178 C-62,-214 -38,-238 0,-238Z" fill="${S.skin}" stroke="${INK}" stroke-width="3.5"/>`;
  s += beard(S);
  s += face(S, st);
  s += hairFront(S);
  return s;
}

function arm(S, side, ang, sleeve) {
  const a = ang * Math.PI / 180;
  const sx = side * 34, sy = -110;
  const L = 50;
  const ex = sx + side * Math.sin(a) * L, ey = sy + Math.cos(a) * L;
  return `<path d="M${f(sx)},${f(sy)} L${f(ex)},${f(ey)}" stroke="${INK}" stroke-width="23" stroke-linecap="round"/>`
    + `<path d="M${f(sx)},${f(sy)} L${f(ex)},${f(ey)}" stroke="${sleeve}" stroke-width="16" stroke-linecap="round"/>`
    + `<circle cx="${f(ex + side * Math.sin(a) * 6)}" cy="${f(ey + Math.cos(a) * 6)}" r="10" fill="${S.skin}" stroke="${INK}" stroke-width="3"/>`;
}

function torso(S) {
  const outline = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  const body = 'M-35,-44 L-39,-104 Q-40,-122 -20,-124 L20,-124 Q40,-122 39,-104 L35,-44 Q0,-38 -35,-44Z';
  let s = `<path d="${body}" fill="${S.top}" ${outline}/>`;
  if (S.outfit === 'suit' || S.outfit === 'blazer') {
    s += `<path d="M-15,-124 L0,-86 L15,-124Z" fill="${S.shirt}"/>`;
    if (S.tie) s += `<path d="M-4,-121 L4,-121 L7,-98 L0,-86 L-7,-98Z" fill="${S.tie}" stroke="${INK}" stroke-width="2"/>`;
    s += `<path d="M-17,-124 L-4,-90 M17,-124 L4,-90" stroke="${INK}" stroke-width="3" fill="none"/>`
      + `<path d="M-18,-124 L-24,-100 L-10,-104 M18,-124 L24,-100 L10,-104" stroke="rgba(0,0,0,.25)" stroke-width="2.5" fill="none"/>`;
    if (S.outfit === 'suit') s += `<circle cx="0" cy="-66" r="3" fill="${INK}" opacity=".6"/>`;
  } else if (S.outfit === 'lace') {
    s += `<path d="M-16,-124 Q0,-104 16,-124Z" fill="${S.skin}" stroke="${INK}" stroke-width="2.5"/>`;
    let sc = '';
    for (let i = 0; i < 6; i++) sc += `<path d="M${-30 + i * 10},-100 a5,5 0 0 0 10,0" fill="none" stroke="#6a6a78" stroke-width="2"/>`;
    s += sc + `<path d="M-34,-74 Q-24,-80 -14,-74 Q-4,-68 6,-74 Q16,-80 26,-74 Q32,-70 35,-72" stroke="#5a5a66" stroke-width="2.5" fill="none"/>`;
  } else if (S.outfit === 'blouse') {
    s += `<path d="M-14,-124 Q0,-108 14,-124Z" fill="${S.skin}" stroke="${INK}" stroke-width="2.5"/>`;
  } else {
    s += `<path d="M-14,-124 L0,-110 L14,-124" fill="none" stroke="${INK}" stroke-width="3"/><path d="M0,-108 L0,-50" stroke="rgba(0,0,0,.18)" stroke-width="2.5"/>`;
  }
  if (S.badge) {
    s += `<path d="M-14,-122 L-20,-82 M14,-122 L20,-82" stroke="#f78c16" stroke-width="3" fill="none"/>`
      + `<rect x="10" y="-86" width="22" height="26" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.5"/><rect x="13" y="-83" width="16" height="6" rx="2" fill="#f78c16"/><path d="M15,-71 h12 M15,-66 h8" stroke="#8a95a8" stroke-width="2"/>`;
  }
  return s;
}

function legs(S, st) {
  const ph = (st.walk ?? 0) * Math.PI * 2;
  const w = st.walk != null ? 1 : 0;
  let s = '';
  for (const side of [-1, 1]) {
    const sw = w * Math.sin(ph + (side > 0 ? Math.PI : 0));
    const dx = sw * 10, lift = Math.max(0, w * -Math.cos(ph + (side > 0 ? Math.PI : 0))) * 8;
    const x = side * 15 + dx;
    s += `<path d="M${f(side * 15)},-48 L${f(x)},${f(-12 - lift)}" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>`
      + `<path d="M${f(side * 15)},-48 L${f(x)},${f(-12 - lift)}" stroke="${S.pants}" stroke-width="17" stroke-linecap="round"/>`
      + `<ellipse cx="${f(x + side * 4)}" cy="${f(-7 - lift)}" rx="16" ry="8.5" fill="${SHOE}"/>`;
  }
  return s;
}

export function pessoa(id, st = {}) {
  const S = ELENCO_DTS[id];
  const t = st.t ?? 0;
  const a = st.alpha ?? 1;
  if (a <= 0.001) return '';
  const breathe = Math.sin(t * 2.4 + id.length) * 0.012;
  const hop = st.hop ?? 0;
  const bob = st.walk != null ? Math.abs(Math.sin((st.walk) * Math.PI * 2)) * -5 : 0;
  let armL = st.armL ?? 8, armR = st.armR ?? 8;
  if (st.wave) armR = 128 + Math.sin(t * 13) * 16 * st.wave;
  if (st.typing) {
    armL = -38 + Math.sin(t * 26) * 7;
    armR = -38 + Math.sin(t * 26 + 1.7) * 7;
  }
  if (st.walk != null && st.armL == null) { armL = 14 + Math.sin(st.walk * Math.PI * 2) * 16; armR = 14 - Math.sin(st.walk * Math.PI * 2) * 16; }
  const sleeve = S.outfit === 'lace' ? S.top : S.top;
  const tilt = st.tilt ?? Math.sin(t * 1.3 + id.length) * 2;
  const shadow = `<ellipse cx="0" cy="0" rx="${f(48 - hop * 0.2)}" ry="9" fill="rgba(22,35,59,.16)"/>`;
  const body = `<g transform="translate(0 ${f(-hop + bob)}) rotate(${f(st.lean ?? 0)} 0 -40) scale(1 ${f(1 + breathe)})">`
    + legs(S, st)
    + `<g transform="rotate(${f(tilt)} 0 -124)">${hairBack(S)}</g>`
    + torso(S)
    + (armL <= 100 ? arm(S, -1, armL, sleeve) : '') + (armR <= 100 ? arm(S, 1, armR, sleeve) : '')
    + `<g transform="rotate(${f(tilt)} 0 -124)">${head(S, st)}</g>`
    + (armL > 100 ? arm(S, -1, armL, sleeve) : '') + (armR > 100 ? arm(S, 1, armR, sleeve) : '')
    + '</g>';
  const sc = st.s ?? 1;
  const tf = `translate(${f(st.x ?? 0)} ${f(st.y ?? 0)}) scale(${f(sc * (st.flip ? -1 : 1))} ${f(sc)})`;
  return `<g transform="${tf}"${a < 0.999 ? ` opacity="${f(clamp(a))}"` : ''}>${shadow}${body}</g>`;
}
