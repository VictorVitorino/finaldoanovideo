// Vídeo do carrossel: abertura (gancho) + 3 páginas animadas, com cortina diagonal entre elas.
// Tempos em tempos.json (mesma fonte que a trilha usa em producao/carrossel_audio.py).
import { W, H, C, defs, cabecalho, rodape, t, tRico, op, fin, clamp, inv, ease, n2 } from './base.js';
import { cortina } from './componentes.js';
import { PAGINAS } from './paginas3.js';
import { CAB, ABERTURA } from './dados.js';

const f = n2;
const HEAD = 134, PE = H - 118;

export async function carregarTempos() {
  const T = await (await fetch('./src/carrossel/tempos.json')).json();
  let acc = 0;
  T.paginas.forEach(p => { p.ini = acc; acc += p.dur; });
  T.total = acc;
  return T;
}

// gancho em tela cheia navy, antes de o painel subir e virar o cabeçalho da página 1
function abertura(tt, B) {
  const fimSobe = B.sobe + 0.75;
  if (tt >= fimSobe) return '';
  const u = ease.inOut(inv(B.sobe, fimSobe, tt));
  const hp = H + (HEAD - 6 - H) * u;
  let s = `<rect x="0" y="0" width="${W}" height="${f(hp)}" fill="url(#gNavy)"/>`;
  // grade de pontos + curva exponencial ao fundo (a adoção que só sobe)
  const kTxt = 1 - ease.out(inv(B.sobe - 0.05, B.sobe + 0.3, tt));
  if (kTxt > 0) {
    let fundo = '';
    for (let gx = 0; gx <= W; gx += 54) for (let gy = 180; gy <= H; gy += 54) fundo += `<circle cx="${gx}" cy="${gy}" r="1.6" fill="#fff" opacity=".09"/>`;
    const uc = ease.inOut(inv(0.1, 3.2, tt));
    const pts = [];
    for (let i = 0; i <= 60 * uc; i++) { const x = i / 60; pts.push([60 + x * (W - 120), H - 170 - Math.pow(x, 4.5) * (H - 520)]); }
    if (pts.length > 1) {
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join(' ');
      fundo += `<path d="${d} L${f(pts[pts.length - 1][0])},${H - 170} L60,${H - 170}Z" fill="${C.orange}" opacity=".07"/>`;
      fundo += `<path d="${d}" fill="none" stroke="${C.orange}" stroke-width="4" opacity=".55" stroke-linecap="round"/>`;
      const pp = pts[pts.length - 1];
      fundo += `<circle cx="${f(pp[0])}" cy="${f(pp[1])}" r="9" fill="${C.orange}"/><circle cx="${f(pp[0])}" cy="${f(pp[1])}" r="${f(16 + 6 * Math.sin(tt * 6))}" fill="none" stroke="${C.orange}" stroke-width="2" opacity=".5"/>`;
    }
    s += op(kTxt, fundo);
    // selo e linhas do gancho
    let txt = op(fin(tt, -0.5, 0.5), `<rect x="72" y="452" width="34" height="5" fill="${C.orange}"/>` + t(ABERTURA.selo, 120, 460, { f: 'M', w: 600, s: 17, c: C.blueL, ls: 3 }));
    // 4 linhas: as duas últimas (laranja) entram juntas no hook3, com 0,2 s de defasagem
    // a 1ª linha já está na tela no quadro 0 (miniatura do feed antes do autoplay)
    const ks = [B.hook1 - 0.5, B.hook2, B.hook3, B.hook3 + 0.2];
    const ys = [584, 692, 802, 894], tams = [110, 84, 84, 84];
    ABERTURA.linhas.forEach((l, i) => {
      const k = fin(tt, ks[i], 0.45);
      if (k <= 0) return;
      txt += `<g opacity="${f(clamp(k))}" transform="translate(${f((1 - k) * -40)} 0)">${tRico(l, 70, ys[i], { f: 'H', w: 800, s: tams[i], c: '#fff', hi: C.orange, ls: 0.5 })}</g>`;
    });
    s += op(kTxt, `<g transform="translate(0 ${f(-(1 - kTxt) * 120)})">${txt}</g>`);
  }
  return s;
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
