"""Trilha e montagem dos créditos, sem alterar a timeline do filme.

    python3 producao/creditos.py trilha
    node render.mjs frames --test creditos --out build/creditos/frames
    node render.mjs encode --frames build/creditos/frames \
        --audio build/creditos/trilha.wav --out build/creditos/creditos.mp4
    python3 producao/creditos.py montar --entrada caminho/do/filme.mp4

As cartelas de producao/creditos.json determinam a duração. A montagem
normaliza os dois segmentos e concatena vídeo e áudio; entradas sem áudio
recebem silêncio e áudio curto é preenchido até o fim do respectivo vídeo.
Se o áudio durar mais que o vídeo, o último quadro é mantido até seu fim.
A duração de cada segmento é arredondada para cima ao quadro de 30 fps.
"""
import argparse
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import wave


ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / 'build' / 'creditos'
CONFIG = Path(__file__).with_suffix('.json')
FPS = 30
SAMPLE_RATE = 48000


def duracao_cartelas(caminho):
    config = json.loads(Path(caminho).read_text(encoding='utf-8'))
    cartelas = config.get('cartelas')
    if not isinstance(cartelas, list) or not cartelas:
        raise ValueError('A configuração precisa de uma lista não vazia de cartelas.')
    duracoes = []
    for cartela in cartelas:
        duracao = float(cartela['duracao'])
        if not math.isfinite(duracao) or duracao <= 0:
            raise ValueError('Cada cartela precisa de uma duração positiva e finita.')
        duracoes.append(duracao)
    return math.fsum(duracoes)


def trilha(args):
    import numpy as np

    sys.path.insert(0, str(ROOT / 'audio'))
    import gerar_trilha as T

    duracao = duracao_cartelas(args.config)
    mix = T.Mix(duracao)
    T.music(mix, {'musica': [{'estilo': 'final', 'de': 0, 'ate': duracao}]})
    n = round(duracao * T.SR)
    audio = np.stack([mix.L[:n], mix.R[:n]], axis=1)
    pico = max(float(np.max(np.abs(audio))), 1e-9)
    audio *= 0.65 / pico
    entrada = min(n, round(min(0.3, duracao / 4) * T.SR))
    saida = min(n, round(min(1.2, duracao / 4) * T.SR))
    audio[:entrada] *= np.linspace(0, 1, entrada)[:, None]
    audio[-saida:] *= np.linspace(1, 0, saida)[:, None]
    BUILD.mkdir(parents=True, exist_ok=True)
    caminho = BUILD / 'trilha.wav'
    with wave.open(str(caminho), 'wb') as arquivo:
        arquivo.setnchannels(2)
        arquivo.setsampwidth(2)
        arquivo.setframerate(T.SR)
        arquivo.writeframes(np.round(audio * 32767).astype('<i2').tobytes())
    with wave.open(str(caminho), 'rb') as arquivo:
        real = arquivo.getnframes() / arquivo.getframerate()
        if abs(real - duracao) > 1 / T.SR:
            raise ValueError('A duração da trilha não corresponde às cartelas.')
    print(f'{caminho} — {real:.3f} s, estéreo, {T.SR} Hz')


def positivo(valor):
    try:
        numero = float(valor)
    except (ValueError, TypeError):
        return 0.0
    return numero if math.isfinite(numero) and numero > 0 else 0.0


def inspecionar(caminho):
    if not caminho.is_file():
        raise FileNotFoundError(f'Arquivo não encontrado: {caminho}')
    resultado = subprocess.run([
        'ffprobe', '-v', 'error', '-show_entries',
        'stream=index,codec_type,codec_name,width,height,pix_fmt,duration,avg_frame_rate,'
        'sample_rate,channels,channel_layout,nb_frames:format=duration',
        '-of', 'json', str(caminho),
    ], check=True, capture_output=True, text=True)
    dados = json.loads(resultado.stdout)
    streams = dados.get('streams', [])
    videos = [s for s in streams if s.get('codec_type') == 'video']
    audios = [s for s in streams if s.get('codec_type') == 'audio']
    if not videos:
        raise ValueError(f'A entrada não contém vídeo: {caminho}')
    duracao = max([positivo(dados.get('format', {}).get('duration'))]
                  + [positivo(s.get('duration')) for s in videos[:1] + audios[:1]])
    if not duracao:
        raise ValueError(f'Não foi possível determinar a duração: {caminho}')
    return {'duracao': duracao, 'video': videos[0], 'audio': audios[0] if audios else None}


def filtros_segmento(indice, info):
    # Arredondar para cima preserva o fim do segmento na conversão para 30 fps.
    quadros = math.ceil(info['duracao'] * FPS - 1e-6)
    duracao = quadros / FPS
    tempo = f'{duracao:.9f}'
    video = (f'[{indice}:v:0]setpts=PTS-STARTPTS,fps={FPS},'
             'scale=1920:1080:force_original_aspect_ratio=decrease:out_range=tv,'
             'pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p,'
             'setparams=range=limited,'
             f'tpad=stop_mode=clone:stop_duration={tempo},trim=end_frame={quadros},'
             f'setpts=N/({FPS}*TB)[v{indice}]')
    if info['audio']:
        audio = (f'[{indice}:a:0]asetpts=PTS-STARTPTS,aresample={SAMPLE_RATE},'
                 'aformat=sample_fmts=fltp:channel_layouts=stereo,apad,')
    else:
        audio = f'anullsrc=r={SAMPLE_RATE}:cl=stereo,'
    audio += f'atrim=duration={tempo},asetpts=PTS-STARTPTS[a{indice}]'
    return [video, audio], duracao


def montar(args):
    entrada = Path(args.entrada).expanduser().resolve()
    creditos = Path(args.creditos).expanduser().resolve()
    saida = Path(args.saida).expanduser().resolve()
    if saida in (entrada, creditos):
        raise ValueError('A saída precisa ser diferente do filme e do segmento de créditos.')
    if saida.exists() and not args.overwrite:
        raise FileExistsError(f'A saída já existe: {saida}. Use --overwrite para substituí-la.')
    infos = [inspecionar(entrada), inspecionar(creditos)]
    filtros, duracao = [], 0.0
    for indice, info in enumerate(infos):
        segmento, tempo = filtros_segmento(indice, info)
        filtros.extend(segmento)
        duracao += tempo
        print(f'{[entrada, creditos][indice]} — {info["duracao"]:.3f} s, '
              f'{"com áudio" if info["audio"] else "sem áudio; será adicionado silêncio"}', flush=True)
    filtros.append('[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]')
    saida.parent.mkdir(parents=True, exist_ok=True)
    # Somente publicar o arquivo após a montagem e a validação terminarem.
    with tempfile.TemporaryDirectory(prefix='.creditos-', dir=saida.parent) as pasta:
        temporario = Path(pasta) / 'montagem.mp4'
        subprocess.run([
            'ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
            '-i', str(entrada), '-i', str(creditos),
            '-filter_complex_threads', str(args.threads), '-filter_complex', ';'.join(filtros),
            '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium',
            '-crf', '18', '-threads', str(args.threads), '-pix_fmt', 'yuv420p',
            '-r', str(FPS), '-fps_mode', 'cfr',
            '-c:a', 'aac', '-b:a', '192k', '-ar', str(SAMPLE_RATE), '-ac', '2',
            '-movflags', '+faststart', str(temporario),
        ], check=True)
        resultado = inspecionar(temporario)
        if abs(resultado['duracao'] - duracao) > 0.15:
            raise ValueError(f'Duração inesperada: {resultado["duracao"]:.3f} s; '
                             f'esperado {duracao:.3f} s.')
        video, audio = resultado['video'], resultado['audio']
        if (video.get('codec_name') != 'h264' or video.get('width') != 1920
                or video.get('height') != 1080 or video.get('pix_fmt') != 'yuv420p'
                or video.get('avg_frame_rate') != '30/1'
                or not audio or audio.get('codec_name') != 'aac'
                or audio.get('sample_rate') != str(SAMPLE_RATE) or audio.get('channels') != 2):
            raise ValueError('A saída não corresponde ao formato 1080p30 / H.264 / AAC estéreo 48 kHz.')
        if (int(video.get('nb_frames', 0)) != round(duracao * FPS)
                or abs(positivo(video.get('duration')) - duracao) > 1 / FPS
                or abs(positivo(audio.get('duration')) - duracao) > 0.1):
            raise ValueError('O vídeo ou o áudio não preservou toda a duração dos dois segmentos.')
        if saida.exists() and not args.overwrite:
            raise FileExistsError(f'A saída passou a existir durante a montagem: {saida}')
        os.replace(temporario, saida)
    print(f'{saida} — {resultado["duracao"]:.3f} s; duração e formato validados')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    comandos = parser.add_subparsers(dest='comando', required=True)
    audio = comandos.add_parser('trilha', help='Gerar a música com a duração das cartelas.')
    audio.add_argument('--config', type=Path, default=CONFIG)
    audio.set_defaults(executar=trilha)
    montagem = comandos.add_parser('montar', help='Anexar os créditos ao filme já montado.')
    montagem.add_argument('--entrada', required=True)
    montagem.add_argument('--creditos', default=str(BUILD / 'creditos.mp4'))
    montagem.add_argument('--saida', default=str(BUILD / 'video-com-creditos.mp4'))
    montagem.add_argument('--overwrite', action='store_true')
    montagem.add_argument('--threads', type=int, choices=range(1, 17), default=2)
    montagem.set_defaults(executar=montar)
    args = parser.parse_args()
    try:
        args.executar(args)
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as erro:
        detalhe = erro.stderr.strip() if isinstance(erro, subprocess.CalledProcessError) and erro.stderr else str(erro)
        parser.exit(1, f'Erro: {detalhe}\n')


if __name__ == '__main__':
    main()
