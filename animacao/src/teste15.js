// Camada de textos do teste de 15 s (novo molde): legendas, etiqueta de quem é quem,
// cartão TOTVS + A&M onde o Victor aponta, brilho do joinha e título final.
// As posições da cabeça, do dedo e do polegar vêm de build/teste15/track.json
// (gerado por producao/teste15.py), para os elementos acompanharem o personagem.
import { caption } from './hud.js';
import { logo, logoSize } from './assets.js';
import { tr, g, op, clamp, n2, text, measure, ease, inv } from './core.js';

const SUBS = [
  { at: 0.4, end: 4.1, who: 'N', text: 'Um time de especialistas com mentalidade *fazedora* e *adaptável*.' },
  { at: 4.5, end: 7.85, who: 'N', text: 'Executivos que já viveram desafios reais. Gente que *entende do jogo*.' },
  { at: 8.25, end: 9.9, who: 'N', text: 'De um lado, a *TOTVS*.' },
  { at: 9.95, end: 11.65, who: 'N', text: 'Do outro, a *A&M Performance*.' },
  { at: 12.0, end: 14.2, who: 'N', text: 'Um projeto que *gera projetos*.' },
];

// Etiqueta de quem é quem: segue a cabeça com um pequeno atraso (parece presa por um fio).
function etiqueta(nome, x, y, age, end) {
  const a = clamp(Math.min(age / 0.25, (end - age) / 0.25));
  if (a <= 0) return '';
  const k = ease.back(clamp(age / 0.45));
  const font = '800 30px Outfit';
  const w = measure(nome, font) + 92, h = 58;
  const body = `<path d="M${n2(-w / 2 + 34)} ${h / 2 - 4} L${n2(-w / 2 + 6)} ${h / 2 + 22} L${n2(-w / 2 + 58)} ${h / 2 - 4}Z" fill="#fffdf8"/>`
    + `<rect x="${n2(-w / 2)}" y="${-h / 2}" width="${n2(w)}" height="${h}" rx="${h / 2}" fill="#fffdf8" filter="url(#dsSoft)"/>`
    + `<circle cx="${n2(-w / 2 + 30)}" cy="0" r="19" fill="#e8601c"/>` + text(nome[0], -w / 2 + 30, 9, { size: 24, weight: 900, fill: '#fff' })
    + text(nome, -w / 2 + 58 + measure(nome, font) / 2, 11, { size: 30, weight: 800, fill: '#20212b' });
  return op(a, g(tr(x, y, Math.max(0.001, k)), body));
}

// Cartão TOTVS + A&M que nasce onde ele aponta.
function cartao(x, y, t) {
  const age = t - 8.3;
  const a = clamp(Math.min(age / 0.2, (11.7 - t) / 0.2));
  if (a <= 0) return '';
  const k = ease.back(clamp(age / 0.45));
  const tv = logoSize('totvs', 62, 230), am = logoSize('alvarez-marsal', 96, 250);
  const w = 680, h = 200;
  let s = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="34" fill="#fffdf8" filter="url(#ds)"/>`;
  const kt = ease.back(clamp((t - 8.45) / 0.4)), ka = ease.back(clamp((t - 10.05) / 0.4));
  s += op(clamp(kt * 2), g(tr(-w / 4 + 6, 0, Math.max(0.001, kt)), logo('totvs', 0, 0, 62, 230)));
  s += op(clamp(ka * 2), text('+', 0, 16, { size: 54, weight: 800, fill: '#9a9aa6' }));
  s += op(clamp(ka * 2), g(tr(w / 4 - 4, 0, Math.max(0.001, ka)), logo('alvarez-marsal', 0, 0, 96, 250)));
  // traços de movimento saindo do dedo
  const lk = clamp((t - 8.3) / 0.35), lf = 1 - clamp((t - 8.75) / 0.3);
  let linhas = '';
  if (lf > 0) for (const dy of [-26, 0, 26]) linhas += `<path d="M${n2(-w / 2 - 150 + 60 * lk)} ${dy * 1.2} L${n2(-w / 2 - 60 + 40 * lk)} ${dy}" stroke="#fffdf8" stroke-width="7" stroke-linecap="round" opacity="${n2(0.85 * lf)}"/>`;
  return linhas + op(a, g(tr(x, y, Math.max(0.001, 0.6 + 0.4 * k)), s));
}

// Brilho no joinha.
function brilho(x, y, t) {
  const u = (t - 12.0) / 0.7;
  if (u <= 0 || u >= 1) return '';
  const star = (cx, cy, r, rot) => `<path transform="translate(${n2(cx)} ${n2(cy)}) rotate(${n2(rot)})" d="M0 ${-r} C${r * 0.12} ${-r * 0.12} ${r * 0.12} ${-r * 0.12} ${r} 0 C${r * 0.12} ${r * 0.12} ${r * 0.12} ${r * 0.12} 0 ${r} C${-r * 0.12} ${r * 0.12} ${-r * 0.12} ${r * 0.12} ${-r} 0 C${-r * 0.12} ${-r * 0.12} ${-r * 0.12} ${-r * 0.12} 0 ${-r}Z" fill="#fff7d6"/>`;
  const s1 = Math.sin(Math.PI * clamp(u / 0.8)), s2 = Math.sin(Math.PI * clamp((u - 0.15) / 0.7)), s3 = Math.sin(Math.PI * clamp((u - 0.3) / 0.7));
  return `<g filter="url(#dsSoft)">` + star(x + 6, y - 8, 46 * s1, u * 40) + star(x + 52, y + 26, 20 * s2, -u * 30) + star(x - 34, y + 34, 14 * s3, u * 50) + '</g>';
}

// Título final.
function titulo(t) {
  const age = t - 12.55;
  if (age <= 0) return '';
  const k = ease.out(clamp(age / 0.6));
  const x = 1390;
  let s = op(k, g(tr(0, (1 - k) * 30), text('PROJETO DO ANO', x, 470, { size: 96, weight: 900, fill: '#fffdf8', ls: '2', extra: 'filter="url(#dsSoft)"' })));
  s += op(k, `<rect x="${x - 120}" y="500" width="240" height="7" rx="3.5" fill="#f2b84b"/>`);
  const kl = ease.back(clamp((t - 12.95) / 0.5));
  const am = logoSize('alvarez-marsal', 64), tv = logoSize('totvs', 42);
  const w = am.w + tv.w + 120, h = 100;
  const pill = `<rect x="${n2(-w / 2)}" y="${-h / 2}" width="${n2(w)}" height="${h}" rx="${h / 2}" fill="#fffdf8" filter="url(#ds)"/>`
    + logo('alvarez-marsal', -w / 2 + 34 + am.w / 2, 0, 64) + text('+', -w / 2 + 34 + am.w + 26, 15, { size: 44, weight: 800, fill: '#9a9aa6' }) + logo('totvs', w / 2 - 34 - tv.w / 2, 0, 42);
  s += op(clamp(kl * 2), g(tr(x, 600, Math.max(0.001, kl)), pill));
  return s;
}

export async function buildTeste15() {
  const track = await (await fetch('./build/teste15/track.json')).json();
  const Q = track.quadros, fps = track.fps;
  const at = t => Q[Math.max(0, Math.min(Q.length - 1, Math.round(t * fps)))];
  return {
    duration: track.dur,
    frame(t) {
      let s = '';
      // etiqueta "Victor" no plano 1 (segue a cabeça com 0,12 s de atraso)
      if (t < track.cortes[1]) {
        const c = at(Math.max(0, t - 0.12)).cabeca;
        if (c) s += etiqueta('Victor', c[0] + 190, c[1] + 40, t - 0.9, track.cortes[1] - 0.15 - 0.9);
      }
      if (t >= track.cortes[2] && t < track.cortes[3]) {
        const d = at(Math.max(track.cortes[2], t - 0.08)).dedo;
        if (d) s += cartao(d[0] + 430, d[1] - 20, t);
      }
      if (t >= track.cortes[3]) {
        const p = at(t).polegar;
        if (p) s += brilho(p[0], p[1], t);
        s += titulo(t);
      }
      for (const sub of SUBS) s += caption(sub, t);
      const fade = 1 - inv(14.45, 14.95, t);
      return op(fade, s);
    },
  };
}
