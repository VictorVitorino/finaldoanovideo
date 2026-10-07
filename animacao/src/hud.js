// Camada de interface (coordenadas de tela 1920x1080).
import { tr, g, op, clamp, lerp, inv, C, n2, esc, text, measure, wrap, richText, ease, seg } from './core.js';
import { logo, logoSize } from './assets.js';

const INK = C.ink;

export const CENAS = {
  1: 'O desafio',
  2: 'A parceria e a liderança',
  3: 'Seis projetos, seis resultados',
  4: 'O método e a IA',
  5: 'Resultado no P&L e a NF',
  6: 'Fechamento',
};

const SPEAKER_COLOR = { Giovanna: '#d94b4b', Paladini: '#3aa6a0', Antonialli: '#1f2d4d', 'Giovanna e Bruno': '#d94b4b', Bruno: '#7fb3e6' };

// Legenda em pílula escura, com ícone de microfone (narrador) ou inicial de quem fala.
export function caption(sub, lt) {
  const a = clamp(Math.min((lt - sub.at) / 0.25, (sub.end - lt) / 0.2));
  if (a <= 0) return '';
  const font = '700 36px "DM Sans"';
  const lines = wrap(sub.text, font, 1250);
  // destaque (*...*) que atravessa a quebra de linha
  for (let i = 0; i < lines.length - 1; i++) if ((lines[i].match(/\*/g) || []).length % 2) { lines[i] += '*'; lines[i + 1] = '*' + lines[i + 1]; }
  const lw = Math.max(...lines.map(l => measure(l.replace(/\*/g, ''), font)));
  const w = lw + 130, lh = 46, h = 34 + lines.length * lh;
  const y1 = 1040, y0 = y1 - h;
  const dy = (1 - ease.out(clamp((lt - sub.at) / 0.3))) * 12;
  let s = `<rect x="${n2(960 - w / 2)}" y="${n2(y0)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(Math.min(30, h / 2))}" fill="#20212b" opacity=".93"/>`;
  const ix = 960 - w / 2 + 44, iy = y0 + h / 2;
  if (sub.who === 'N') {
    s += `<circle cx="${n2(ix)}" cy="${n2(iy)}" r="22" fill="#fff"/><rect x="${n2(ix - 6)}" y="${n2(iy - 13)}" width="12" height="19" rx="6" fill="${INK}"/><path d="M${n2(ix - 10)} ${n2(iy)} a10 10 0 0 0 20 0 M${n2(ix)} ${n2(iy + 10)} v5" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    const col = SPEAKER_COLOR[sub.who] ?? C.blue;
    s += `<circle cx="${n2(ix)}" cy="${n2(iy)}" r="22" fill="${col}"/>` + text(sub.who[0], ix, iy + 9, { size: 26, weight: 900, fill: '#fff' });
    const nf = '800 22px Outfit';
    const nw = measure(sub.who.toUpperCase(), nf) + 28;
    s += `<rect x="${n2(960 - w / 2 + 20)}" y="${n2(y0 - 22)}" width="${n2(nw)}" height="34" rx="17" fill="${col}"/>` + text(sub.who.toUpperCase(), 960 - w / 2 + 20 + nw / 2, y0 + 3, { size: 22, weight: 800, fill: '#fff', ls: '1' });
  }
  lines.forEach((l, i) => (s += richText(l, 960 + 26, y0 + 17 + lh * (i + 0.72), { family: 'DM Sans', weight: 700, size: 36, fill: '#fff', hi: '#ffc04a' })));
  return op(a, g(tr(0, dy), s));
}

// Selo A&M + TOTVS (canto superior esquerdo), capítulo (direito) e régua de progresso.
export function chrome(t, total, cena, sceneAge, o = {}) {
  let s = '';
  // régua
  s += `<rect x="0" y="0" width="1920" height="7" fill="rgba(43,30,10,.12)"/><rect x="0" y="0" width="${n2(1920 * clamp(t / total))}" height="7" fill="${C.amber}"/>`;
  for (let x = 0; x < 1920; x += 48) s += `<rect x="${x}" y="7" width="2" height="${x % 192 === 0 ? 9 : 5}" fill="rgba(43,30,10,.18)"/>`;
  // selo
  const am = logoSize('alvarez-marsal', 46), tv = logoSize('totvs', 30);
  const lw = am.w + tv.w + 76;
  s += `<rect x="36" y="30" width="${n2(lw)}" height="66" rx="33" fill="#fffdf8" opacity=".95" filter="url(#dsSoft)"/>`;
  s += logo('alvarez-marsal', 60 + am.w / 2, 63, 46) + text('+', 60 + am.w + 18, 75, { size: 34, weight: 800, fill: C.soft }) + logo('totvs', 60 + am.w + 36 + tv.w / 2, 63, 30);
  // capítulo
  if (cena) {
    const k = ease.back(clamp(sceneAge / 0.45));
    const title = CENAS[cena];
    const tf = '800 28px Outfit';
    const w = Math.max(measure(title, tf), measure(`CENA ${cena} DE 6 · PROJETO DO ANO`, '800 13px Outfit') * 1.15) + 120;
    const x1 = 1884, x0 = x1 - w;
    const body = `<rect x="${n2(x0)}" y="30" width="${n2(w)}" height="66" rx="33" fill="#fffdf8" filter="url(#dsSoft)"/><rect x="${n2(x0)}" y="30" width="${n2(w)}" height="66" rx="33" fill="none" stroke="${INK}" stroke-width="2.5"/>`
      + `<circle cx="${n2(x0 + 36)}" cy="63" r="22" fill="${C.amber}"/>` + text(String(cena), x0 + 36, 72, { size: 26, weight: 900, fill: '#fff' })
      + text(`CENA ${cena} DE 6 · PROJETO DO ANO`, x0 + 70, 55, { size: 13, weight: 800, fill: C.soft, anchor: 'start', ls: '1.2' })
      + text(title, x0 + 70, 84, { size: 28, weight: 800, anchor: 'start' });
    s += op(clamp(sceneAge / 0.2), g(tr(0, (1 - k) * -30), body));
  }
  return s;
}

// Transição em diagonal (gradiente azul A&M → TOTVS), centrada no tempo tb.
export function wipe(t, tb, d = 0.7) {
  const u = (t - (tb - d / 2)) / d;
  if (u <= 0 || u >= 1) return '';
  const L = -2800 + 6400 * ease.inOut(u);
  const band = (dx, w, fill) => `<path d="M${n2(L + dx)} 0 L${n2(L + dx + w)} 0 L${n2(L + dx + w - 420)} 1080 L${n2(L + dx - 420)} 1080Z" fill="${fill}"/>`;
  return band(-120, 140, C.amber) + band(0, 2400, 'url(#wipe)');
}

// Íris que fecha (ou abre) num ponto.
export function iris(cx, cy, r) {
  return `<path d="M0 0H1920V1080H0Z M${n2(cx - r)} ${n2(cy)} a${n2(r)} ${n2(r)} 0 1 0 ${n2(2 * r)} 0 a${n2(r)} ${n2(r)} 0 1 0 ${n2(-2 * r)} 0Z" fill="#0b0c10" fill-rule="evenodd"/>`;
}

export function lowerThird(title, sub, age, end, o = {}) {
  const a = clamp(Math.min(age / 0.35, (end - age) / 0.3));
  if (a <= 0) return '';
  const k = ease.out(clamp(age / 0.5));
  const tf = '800 40px Outfit', sf = '700 24px "DM Sans"';
  const w = Math.max(measure(title, tf), measure(sub, sf)) + 80;
  const x = 60 - (1 - k) * 80, y = o.y ?? 770;
  const body = `<rect x="${n2(x)}" y="${y}" width="${n2(w)}" height="112" rx="20" fill="#fffdf8" filter="url(#ds)"/><rect x="${n2(x)}" y="${y}" width="14" height="112" rx="7" fill="${o.color ?? C.blue}"/>`
    + text(sub.toUpperCase(), x + 40, y + 42, { size: 20, weight: 800, fill: C.soft, anchor: 'start', ls: '1.5', family: 'Outfit' })
    + text(title, x + 40, y + 88, { size: 40, weight: 800, anchor: 'start' });
  return op(a, body);
}

// Cartão do projeto (cena 3).
export function projectCard(P, age, fixAge, end) {
  const a = clamp(Math.min(age / 0.3, (end - age) / 0.25));
  if (a <= 0) return '';
  const k = ease.back(clamp(age / 0.55));
  const x = 50 - (1 - k) * 120, y = 128, w = 620;
  const nameSize = P.cliente.length > 16 ? 40 : 50;
  const nf = '700 22px "DM Sans"';
  const rows = [];
  { let cx = x + 100, row = 0; P.time.forEach(nm => { const tw = measure(nm, nf) + 28; if (cx + tw > x + w - 24) { row++; cx = x + 100; } rows.push({ nm, tw, cx, row }); cx += tw + 10; }); }
  const extra = Math.max(...rows.map(r => r.row)) * 48;
  let s = `<rect x="${n2(x)}" y="${y}" width="${w}" height="${372 + extra}" rx="26" fill="#fffdf8" filter="url(#ds)"/>`;
  s += `<rect x="${n2(x + 30)}" y="${y + 30}" width="78" height="44" rx="22" fill="${C.blue}"/>` + text(P.n, x + 69, y + 62, { size: 28, weight: 900, fill: '#fff' });
  s += logo(P.logo, x + w - 120, y + 54, 56, 170);
  s += text(P.cliente, x + 30, y + 130, { size: nameSize, weight: 900, anchor: 'start' });
  s += text(`${P.frente}  ·  ${P.erp}`, x + 30, y + 172, { size: 26, weight: 700, fill: C.soft, anchor: 'start', family: 'DM Sans' });
  s += `<rect x="${n2(x + 30)}" y="${y + 196}" width="${w - 60}" height="2" fill="rgba(43,30,10,.1)"/>`;
  s += text('TIME', x + 30, y + 236, { size: 18, weight: 800, fill: C.soft, anchor: 'start', ls: '1.5' });
  rows.forEach(({ nm, tw, cx, row }, i) => {
    const kk = ease.back(clamp((age - 0.35 - i * 0.12) / 0.35));
    s += op(clamp(kk * 2), g(tr(cx + tw / 2, y + 229 + row * 48, Math.max(0.001, kk)), `<rect x="${n2(-tw / 2)}" y="-19" width="${n2(tw)}" height="38" rx="19" fill="#e9f1ff"/>` + text(nm, 0, 8, { size: 22, weight: 700, fill: C.blue2, family: 'DM Sans' })));
  });
  // antes → depois
  const chip = (label, val, col, bg, X, kk) => op(clamp(kk * 2), g(tr(X, y + 312 + extra, Math.max(0.001, ease.back(clamp(kk)))), `<rect x="-130" y="-34" width="260" height="68" rx="16" fill="${bg}" stroke="${col}" stroke-width="3"/>` + text(label, 0, -8, { size: 16, weight: 900, fill: col, ls: '1.5' }) + text(val, 0, 20, { size: 21, weight: 700, fill: INK, family: 'DM Sans' })));
  s += chip('ANTES', P.antes, C.red, '#fff1f1', x + 165, clamp((age - 0.7) / 0.35));
  s += text('→', x + 310, y + 322 + extra, { size: 34, weight: 900, fill: C.soft });
  s += chip('DEPOIS', P.depois, C.green, '#eefaf2', x + 455, clamp(fixAge / 0.35));
  return op(a, s);
}

// Texto com efeito de máquina de escrever.
export function typewriter(str, x, y, age, o = {}) {
  const n = Math.floor(clamp(age / (o.dur ?? 0.9)) * str.length);
  const shown = str.slice(0, n);
  const cursor = Math.floor(age * 3) % 2 === 0 ? '|' : '';
  return text(shown + cursor, x, y, { size: o.size ?? 84, weight: 900, fill: o.fill ?? '#fff' });
}
