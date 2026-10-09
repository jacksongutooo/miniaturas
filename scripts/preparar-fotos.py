#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PREPARAR FOTOS DOS PRODUTOS
============================================================================
Pega as fotos de  fotos-originais/<produto>/cena.jpeg  e gera, em public/images/,
as imagens padronizadas que o site usa (900×900, JPG leve, sem dados de localização):

    foto de estúdio   fundo removido, peça centralizada, sombra suave
    cena              a foto original, com o ambiente que ela tem (recortada em quadrado)
    medidas           altura/largura desenhadas sobre a peça

A CAPA (<produto>-1.jpg, a primeira foto da página) é a cena quando a foto original tem um
ambiente bonito (mesa, enfeites, luzes) e o estúdio quando o fundo é liso. Isso se escolhe por
produto em PRODUTOS ('capa': 'cena' ou 'estudio'). A ordem fica sempre:

    capa 'estudio':   -1 estúdio · -2 cena   · -3 medidas
    capa 'cena':      -1 cena    · -2 estúdio · -3 medidas

Capturas de tela de celular (com barra de status e faixas pretas) são recortadas
automaticamente para ficar só a foto.

COMO USAR
    python3 -m venv .venv-fotos
    .venv-fotos/bin/pip install -r scripts/requirements-fotos.txt
    .venv-fotos/bin/python scripts/preparar-fotos.py              # todos os produtos
    .venv-fotos/bin/python scripts/preparar-fotos.py jesus-sentado   # só um
    .venv-fotos/bin/python scripts/preparar-fotos.py --fundo branco  # fundo branco puro (só nas fotos de estúdio)
    .venv-fotos/bin/python scripts/preparar-fotos.py --capa estudio  # força a capa de estúdio em todos

(Na primeira execução o modelo de recorte, ~170 MB, é baixado automaticamente.)

PARA ADICIONAR UM PRODUTO
    1. Coloque a foto em  fotos-originais/<slug>/cena.jpeg  (jpg, png, webp ou heic).
    2. Acrescente uma linha em PRODUTOS abaixo (slug, medidas, capa).
    3. Rode o script e use  /images/<slug>-1.jpg, -2, -3  em src/products/data/products.js.

DICAS DE QUALIDADE
    • Quanto maior e mais nítida a foto original, melhor o resultado (idealmente 1500 px ou mais).
    • Peças com detalhes muito finos (auréola, coroa) podem exigir conferência do recorte.
    • Tudo aqui roda no seu computador/ambiente; nenhuma foto é enviada para serviços externos
      (só o modelo é baixado uma vez).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
from scipy import ndimage

try:  # fotos de iPhone (HEIC), se o pacote estiver instalado
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:
    pass

RAIZ = Path(__file__).resolve().parent.parent
ORIGINAIS = RAIZ / 'fotos-originais'
SAIDA = RAIZ / 'public' / 'images'

# ── PRODUTOS ────────────────────────────────────────────────────────────────
# slug → arquivo da foto, medidas (em cm) para a imagem de medidas e qual foto é a capa.
#   capa: 'cena'    → a foto original (com o ambiente dela) é a primeira da página
#         'estudio' → a primeira é a foto de estúdio (padrão; use quando o fundo da foto é liso/branco)
# TODO: confirmar tamanhos reais (os valores abaixo vieram dos anúncios).
PRODUTOS = {
    # Jesus, Maria e José: o fundo original é uma tela de computador branca → capa de estúdio.
    'jesus-sentado': {'foto': 'jesus-sentado/cena.jpeg', 'altura_cm': 5, 'capa': 'estudio'},
    'maria-sentada': {'foto': 'maria-sentada/cena.jpeg', 'altura_cm': 5, 'capa': 'estudio'},
    'sao-jose-sentado': {'foto': 'sao-jose-sentado/cena.jpeg', 'altura_cm': 5, 'capa': 'estudio'},
    # Estes três têm um ambiente de verdade (escritório, mesa com vela, enfeites de Natal) → ficam como capa.
    'sagrada-familia': {'foto': 'sagrada-familia/cena-escritorio.jpeg', 'altura_cm': 5, 'capa': 'cena'},
    'divino-espirito-santo': {'foto': 'espirito-santo/cena.jpeg', 'altura_cm': 10, 'largura_cm': 10, 'capa': 'cena'},
    'boneco-de-neve-articulado': {'foto': 'boneco-de-neve/cena.jpeg', 'altura_cm': 6, 'largura_cm': 4, 'capa': 'cena'},
}

# ── APARÊNCIA ───────────────────────────────────────────────────────────────
TAMANHO = 900  # lado da imagem final (px)
PREENCHIMENTO = 0.80  # quanto da imagem a peça ocupa
QUALIDADE_JPG = 88
FUNDOS = {
    # (cor no centro, cor nas bordas): um degradê suave dá cara de estúdio e destaca peças brancas
    'estudio': ((247, 244, 239), (233, 228, 220)),
    'branco': ((255, 255, 255), (255, 255, 255)),
}
TINTA = (31, 29, 27)  # cor do texto/linhas das medidas (mesma do site)
FONTES = [
    '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]


def fonte(tamanho: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for caminho in FONTES:
        if Path(caminho).exists():
            return ImageFont.truetype(caminho, tamanho)
    return ImageFont.load_default()


# ── ETAPAS ──────────────────────────────────────────────────────────────────


def abrir(caminho: Path) -> Image.Image:
    """Abre a imagem respeitando a rotação gravada pela câmera."""
    return ImageOps.exif_transpose(Image.open(caminho)).convert('RGB')


def extrair_foto_da_captura(img: Image.Image) -> Image.Image:
    """
    Capturas de tela têm barra de status em cima, faixas pretas e botões embaixo.
    Acha a maior faixa "não preta" entre o topo e o rodapé e recorta só ela.
    Se a imagem não tiver faixas pretas (foto normal), devolve como veio.
    """
    cinza = np.asarray(img.convert('L'), dtype=np.float32)
    altura = cinza.shape[0]
    linhas = cinza.mean(axis=1)
    escuras = linhas < 12
    if escuras.mean() < 0.15:  # quase sem preto: não é captura de tela
        return img
    melhor, inicio = (0, 0, 0), None
    for y in range(int(altura * 0.07), int(altura * 0.88)):
        if not escuras[y] and inicio is None:
            inicio = y
        if (escuras[y] or y == int(altura * 0.88) - 1) and inicio is not None:
            if y - inicio > melhor[0]:
                melhor = (y - inicio, inicio, y)
            inicio = None
    _, y0, y1 = melhor
    if y1 - y0 < altura * 0.25:
        return img
    return img.crop((0, y0, img.width, y1))


def recortar_fundo(img: Image.Image, sessao) -> Image.Image:
    """Remove o fundo (RGBA) e descarta manchas soltas que sobrarem."""
    from rembg import remove

    rgba = remove(img, session=sessao, post_process_mask=True)
    alfa = np.array(rgba.getchannel('A'))
    mascara = alfa > 40
    rotulos, n = ndimage.label(mascara)
    if n > 1:
        tamanhos = ndimage.sum(mascara, rotulos, range(1, n + 1))
        manter = np.zeros_like(mascara)
        for i, t in enumerate(tamanhos, start=1):
            if t >= 0.02 * tamanhos.max():
                manter |= rotulos == i
        alfa = np.where(ndimage.binary_dilation(manter, iterations=3), alfa, 0).astype(np.uint8)
    saida = rgba.copy()
    saida.putalpha(Image.fromarray(alfa))
    return saida


def aparar(recorte: Image.Image) -> Image.Image:
    caixa = recorte.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    return recorte.crop(caixa)


def encaixar(recorte: Image.Image, largura_max: float, altura_max: float) -> Image.Image:
    escala = min(largura_max / recorte.width, altura_max / recorte.height)
    novo = recorte.resize((max(1, round(recorte.width * escala)), max(1, round(recorte.height * escala))), Image.LANCZOS)
    # um toque de nitidez para compensar o aumento da foto (só nas cores, não na transparência)
    rgb = novo.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
    rgb.putalpha(novo.getchannel('A'))
    return rgb


def fundo_de_estudio(nome: str) -> Image.Image:
    centro, borda = FUNDOS[nome]
    y, x = np.mgrid[0:TAMANHO, 0:TAMANHO].astype(np.float32)
    r = np.sqrt(((x - TAMANHO / 2) / (TAMANHO * 0.72)) ** 2 + ((y - TAMANHO * 0.46) / (TAMANHO * 0.72)) ** 2)
    r = np.clip(r, 0, 1)[..., None]
    arr = np.array(centro, np.float32) * (1 - r) + np.array(borda, np.float32) * r
    return Image.fromarray(arr.astype(np.uint8))


def colar_com_sombra(tela: Image.Image, peca: Image.Image, x: int, y: int) -> None:
    """Cola a peça e uma sombra suave de contato embaixo dela."""
    sombra = Image.new('L', tela.size, 0)
    d = ImageDraw.Draw(sombra)
    largura = int(peca.width * 0.62)
    cx, base = x + peca.width // 2, y + peca.height
    d.ellipse([cx - largura // 2, base - int(TAMANHO * 0.012), cx + largura // 2, base + int(TAMANHO * 0.03)], fill=120)
    sombra = sombra.filter(ImageFilter.GaussianBlur(TAMANHO * 0.016))
    tela.paste(Image.new('RGB', tela.size, (92, 80, 68)), (0, 0), sombra)
    tela.paste(peca, (x, y), peca)


def imagem_estudio(recorte: Image.Image, fundo: str) -> Image.Image:
    peca = encaixar(aparar(recorte), TAMANHO * PREENCHIMENTO, TAMANHO * PREENCHIMENTO)
    tela = fundo_de_estudio(fundo)
    colar_com_sombra(tela, peca, (TAMANHO - peca.width) // 2, (TAMANHO - peca.height) // 2)
    return tela


def imagem_cena(foto: Image.Image) -> Image.Image:
    quadrada = ImageOps.fit(foto, (TAMANHO, TAMANHO), Image.LANCZOS)
    return quadrada.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2))


def etiqueta(d: ImageDraw.ImageDraw, cx: int, cy: int, texto: str, legenda: str) -> None:
    f, fs = fonte(46), fonte(25)
    larg_texto = d.textlength(texto, font=f)
    larg_leg = d.textlength(legenda, font=fs)
    w, h = int(max(larg_texto, larg_leg) + 60), 92
    d.rounded_rectangle([cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2], radius=h // 2, fill=(255, 255, 255), outline=(214, 207, 197), width=2)
    d.text((cx - larg_texto / 2, cy - h // 2 + 8), texto, font=f, fill=TINTA)
    d.text((cx - larg_leg / 2, cy + 14), legenda, font=fs, fill=(133, 128, 122))


def imagem_medidas(recorte: Image.Image, fundo: str, altura: float | None, largura: float | None) -> Image.Image:
    """A própria peça com cotas (linhas de medida) de altura e/ou largura."""
    tela = fundo_de_estudio(fundo)
    folga_h = 150 if altura else 0  # espaço à direita para a etiqueta de altura
    folga_v = 120 if largura else 0  # espaço embaixo para a etiqueta de largura
    margem = 70
    peca = encaixar(aparar(recorte), TAMANHO - 2 * margem - folga_h, TAMANHO - 2 * margem - folga_v)
    x = margem + (TAMANHO - 2 * margem - folga_h - peca.width) // 2
    y = margem + (TAMANHO - 2 * margem - folga_v - peca.height) // 2
    colar_com_sombra(tela, peca, x, y)
    d = ImageDraw.Draw(tela)
    if altura:
        lx = x + peca.width + 70
        d.line([lx, y, lx, y + peca.height], fill=TINTA, width=4)
        for yy in (y, y + peca.height):
            d.line([lx - 16, yy, lx + 16, yy], fill=TINTA, width=4)
        etiqueta(d, lx, y + peca.height // 2, f'{altura:g} cm', 'altura')
    if largura:
        ly = y + peca.height + 62
        d.line([x, ly, x + peca.width, ly], fill=TINTA, width=4)
        for xx in (x, x + peca.width):
            d.line([xx, ly - 16, xx, ly + 16], fill=TINTA, width=4)
        etiqueta(d, x + peca.width // 2, ly, f'{largura:g} cm', 'largura')
    return tela


def salvar(img: Image.Image, caminho: Path) -> None:
    caminho.parent.mkdir(parents=True, exist_ok=True)
    img.save(caminho, 'JPEG', quality=QUALIDADE_JPG, optimize=True, progressive=True)  # sem EXIF: não leva localização


# ── PRINCIPAL ───────────────────────────────────────────────────────────────


def main() -> int:
    ap = argparse.ArgumentParser(description='Padroniza as fotos dos produtos para o site.')
    ap.add_argument('produtos', nargs='*', help='slugs a processar (padrão: todos)')
    ap.add_argument('--fundo', choices=sorted(FUNDOS), default='estudio', help='cor do fundo (padrão: estudio = off-white com degradê)')
    ap.add_argument('--capa', choices=['estudio', 'cena'], help='força a capa de todos os produtos (padrão: a de cada um em PRODUTOS)')
    ap.add_argument('--modelo', default='u2net', help='modelo de recorte do rembg (padrão: u2net)')
    args = ap.parse_args()

    escolhidos = args.produtos or list(PRODUTOS)
    desconhecidos = [s for s in escolhidos if s not in PRODUTOS]
    if desconhecidos:
        print('Produto(s) não cadastrado(s) em PRODUTOS:', ', '.join(desconhecidos), file=sys.stderr)
        return 2

    from rembg import new_session

    sessao = new_session(args.modelo)
    for slug in escolhidos:
        cfg = PRODUTOS[slug]
        origem = ORIGINAIS / cfg['foto']
        if not origem.exists():
            print(f'[{slug}] foto não encontrada: {origem}', file=sys.stderr)
            continue
        foto = extrair_foto_da_captura(abrir(origem))
        recorte = recortar_fundo(foto, sessao)
        capa = args.capa or cfg.get('capa', 'estudio')
        estudio, cena = imagem_estudio(recorte, args.fundo), imagem_cena(foto)
        primeira, segunda = (cena, estudio) if capa == 'cena' else (estudio, cena)
        salvar(primeira, SAIDA / f'{slug}-1.jpg')
        salvar(segunda, SAIDA / f'{slug}-2.jpg')
        salvar(imagem_medidas(recorte, args.fundo, cfg.get('altura_cm'), cfg.get('largura_cm')), SAIDA / f'{slug}-3.jpg')
        tamanhos = ', '.join(f'{(SAIDA / f"{slug}-{n}.jpg").stat().st_size // 1024} KB' for n in (1, 2, 3))
        print(f'[{slug}] ok — {foto.width}×{foto.height}px de origem → 3 imagens, capa = {capa} ({tamanhos})')
    return 0


if __name__ == '__main__':
    sys.exit(main())
