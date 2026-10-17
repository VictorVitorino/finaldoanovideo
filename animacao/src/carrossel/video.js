// Vídeo do carrossel: abertura (gancho) + 3 páginas animadas, com cortina diagonal entre elas.
// Tempos em tempos.json (mesma fonte que a trilha usa em producao/carrossel_audio.py).
import { W, H, C, defs, cabecalho, rodape, t, tRico, op, fin, clamp, inv, ease, n2, lockupAM, lockupPerformance, contaNum } from './base.js';
import { cortina } from './componentes.js';
import { PAGINAS } from './paginas3.js';
import { CAB, ABERTURA } from './dados.js';

const f = n2;
const HEAD = 128, PE = H - 118;

export async function carregarTempos() {
  const T = await (await fetch('./src/carrossel/tempos.json')).json();
  let acc = 0;
  T.paginas.forEach(p => { p.ini = acc; acc += p.dur; });
  T.total = acc;
  return T;
}

// capa / gancho em tela cheia navy, antes de o painel subir e virar o cabeçalho da página 1:
// diagonais da marca, as 4 linhas, o teaser "15 de cada 100" (grade que se preenche) e a assinatura.
function abertura(tt, B) {
  const fimSobe = B.sobe + 0.75;
  if (tt >= fimSobe) return '';
  const u = ease.inOut(inv(B.sobe, fimSobe, tt));
  const hp = H + (HEAD - H) * u;
  let s = `<clipPath id="capaClip"><rect x="0" y="0" width="${W}" height="${f(hp)}"/></clipPath><g clip-path="url(#capaClip)">`
    + `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#gNavy)"/>`;
  const kTxt = 1 - ease.out(inv(B.sobe - 0.05, B.sobe + 0.3, tt));
  if (kTxt > 0) {
    // diagonais grandes da marca (ardósia) e a linha laranja, à direita
    let fundo = `<radialGradient id="gCapa" cx="0.85" cy="0.78" r="0.55"><stop offset="0" stop-color="${C.orange}" stop-opacity=".22"/><stop offset="1" stop-color="${C.orange}" stop-opacity="0"/></radialGradient>`
      + `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#gCapa)"/>`
      + `<path d="M760,${H} L1060,134" stroke="${C.slate}" stroke-width="110" opacity=".35"/><path d="M900,${H} L1200,134" stroke="${C.slate}" stroke-width="60" opacity=".3"/>`
      + `<path d="M830,${H} L1130,134" stroke="${C.orange}" stroke-width="2.5" opacity=".8"/>`;
    s += op(kTxt, fundo);
    // selo
    let txt = op(fin(tt, -0.5, 0.5), `<rect x="72" y="296" width="34" height="5" fill="${C.orange}"/>` + t(ABERTURA.selo, 120, 305, { f: 'M', w: 600, s: 19, c: C.blueL, ls: 3 }));
    // 4 linhas: a 1ª já está na tela no quadro 0 (miniatura do feed antes do autoplay)
    const ks = [B.hook1 - 0.5, B.hook2, B.hook3, B.hook3 + 0.2];
    const ys = [410, 510, 626, 716], tams = [96, 96, 80, 80];
    ABERTURA.linhas.forEach((l, i) => {
      const k = fin(tt, ks[i], 0.45);
      if (k <= 0) return;
      txt += `<g opacity="${f(clamp(k))}" transform="translate(${f((1 - k) * -40)} 0)">${tRico(l, 70, ys[i], { f: 'H', w: 800, s: tams[i], c: '#fff', hi: C.orange, ls: 0.5 })}</g>`;
    });
    // teaser: grade de 100 que se preenche até 15 + o número grande
    const T = ABERTURA.teaser, gx = 72, gy = 830, dot = 21, gap = 6;
    const ug = ease.out(inv(B.hook2 + 0.2, B.hook3 + 1.4, tt));
    const cheios = Math.round(T.num * ug);
    let grade = '';
    for (let k = 0; k < 100; k++) {
      const col = k % 10, row = 9 - Math.floor(k / 10), on = k < cheios;
      grade += `<rect x="${f(gx + col * (dot + gap))}" y="${f(gy + row * (dot + gap))}" width="${dot}" height="${dot}" rx="4" fill="${on ? C.orange : '#fff'}" opacity="${on ? 1 : 0.13}"/>`;
    }
    const gw = 10 * dot + 9 * gap, tx = gx + gw + 44;
    let teaser = grade + op(fin(tt, B.hook2 + 0.3, 0.4), t(contaNum(T.num, ug), tx, gy + 128, { f: 'H', w: 800, s: 150, c: C.orange }));
    const kt = fin(tt, B.hook2 + 0.8, 0.5);
    let tl = '';
    T.linhas.forEach((l, i) => { tl += t(l, tx + 4, gy + 170 + i * 32, { f: 'B', w: 700, s: 26, c: '#fff' }); });
    tl += t(T.sub, tx + 4, gy + 240, { f: 'B', w: 500, s: 17, c: C.blueL });
    tl += t(T.fonte, tx + 4, gy + 268, { f: 'M', w: 500, s: 13, c: C.blueL, ls: 1.5 });
    teaser += op(kt, tl);
    txt += op(fin(tt, B.hook2 + 0.1, 0.5), teaser);
    // assinatura
    const kr = fin(tt, B.hook3 + 0.4, 0.5);
    const Lk = lockupAM(72, 1262, 22, '#fff');
    const Pk = lockupPerformance(72 + Lk.w + 28, 1262, 24, '#fff');
    txt += op(kr, `<path d="M72,1216 L${W - 72},1216" stroke="#fff" stroke-opacity=".2" stroke-width="1.5"/>` + Lk.svg + Pk.svg
      + t('· DTS', 72 + Lk.w + 28 + Pk.w + 14, 1262, { f: 'B', w: 600, s: 22, c: '#fff', ls: 1 })
      + t(ABERTURA.rodape.direita, W - 72, 1262, { f: 'M', w: 600, s: 15, c: C.blueL, a: 'end', ls: 2 }));
    s += op(kTxt, `<g transform="translate(0 ${f(-(1 - kTxt) * 120)})">${txt}</g>`);
  }
  return s + '</g>';
}

export async function criar() {
  const T = await carregarTempos();
  const n = T.paginas.length, dc = T.cortina;
  return {
    duration: T.total,
    tempos: T,
    frame(tm) {
      // página ativa: troca no meio da cortina centrada em cada fronteira
      let i = 0;
      for (let k = 1; k < n; k++) if (tm >= T.paginas[k].ini) i = k;
      const P = T.paginas[i], tt = tm - P.ini;
      let s = defs() + `<rect width="${W}" height="${H}" fill="#fff"/>`;
      s += PAGINAS[i].desenha(tt, P.beats, {});
      s += rodape(i + 1, n, PAGINAS[i].fontes(), { prog: clamp(tt / P.dur), arraste: false });
      // abertura sobre a página 1 (cobre miolo e rodapé), por baixo do cabeçalho
      if (i === 0) s += abertura(tt, P.beats);
      s += cabecalho(i + 1, n, CAB.titulo, CAB.sub);
      // cortinas perto das fronteiras
      for (let k = 1; k < n; k++) {
        const u = (tm - (T.paginas[k].ini - dc / 2)) / dc;
        if (u > 0 && u < 1) s += cortina(u, 0, HEAD, W, PE - HEAD);
      }
      return s;
    },
  };
}
