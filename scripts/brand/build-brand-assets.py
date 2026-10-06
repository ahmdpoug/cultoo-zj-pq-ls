"""Builds the CULT brand assets from the source logo.

The logo is a two-colour wordmark (cream on black), so palette PNG with alpha
compresses far better than WebP here. Run with the throwaway venv:
  /tmp/imgenv/bin/python scripts/brand/build-brand-assets.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "scripts" / "brand" / "cult-logo-source.png"
BRAND = ROOT / "public" / "brand"
CREAM = (240, 238, 224)
BLACK = (0, 0, 0)
# Alpha ramp: below LO is background, above HI is solid ink. The band between
# keeps the soft smudge where the letters overlap.
LO, HI = 40, 200


def cutout() -> Image.Image:
    """Crops the wordmark and returns it as cream RGBA on transparency."""
    src = Image.open(SRC).convert("RGB")
    lum = np.asarray(src).astype(float).mean(axis=2)
    ys, xs = np.where(lum > 40)
    pad = 6
    box = (
        max(0, xs.min() - pad),
        max(0, ys.min() - pad),
        min(src.width, xs.max() + pad),
        min(src.height, ys.max() + pad),
    )
    crop = np.asarray(src.crop(box)).astype(float).mean(axis=2)
    alpha = np.clip((crop - LO) / (HI - LO), 0, 1)
    rgba = np.zeros((*crop.shape, 4), dtype=np.uint8)
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = CREAM
    rgba[..., 3] = (alpha * 255).round().astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def save_png8(image: Image.Image, path: Path) -> None:
    """Palette PNG with alpha — smallest encoding for a flat two-colour mark."""
    image.quantize(colors=32, method=Image.FASTOCTREE).save(path, optimize=True)
    print(f"{path.relative_to(ROOT)}  {image.width}x{image.height}  {path.stat().st_size / 1024:.1f} KB")


def scaled(image: Image.Image, width: int) -> Image.Image:
    return image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    wordmark = cutout()

    for width in (240, 480):
        save_png8(scaled(wordmark, width), BRAND / f"cult-wordmark-{width}.png")

    # The "C" doubles as the app mark and favicon.
    mark = wordmark.crop((0, 0, round(wordmark.width * 0.30), wordmark.height))
    save_png8(scaled(mark, 128), BRAND / "cult-mark.png")

    icon = Image.new("RGBA", (512, 512), (*BLACK, 255))
    glyph = scaled(mark, 300)
    icon.paste(glyph, ((512 - glyph.width) // 2, (512 - glyph.height) // 2), glyph)
    icon.convert("RGB").save(ROOT / "app" / "icon.png", optimize=True)
    print(f"app/icon.png  {(ROOT / 'app' / 'icon.png').stat().st_size / 1024:.1f} KB")

    apple = icon.resize((180, 180), Image.LANCZOS)
    apple.convert("RGB").save(ROOT / "app" / "apple-icon.png", optimize=True)
    print(f"app/apple-icon.png  {(ROOT / 'app' / 'apple-icon.png').stat().st_size / 1024:.1f} KB")

    # Social card: the wordmark alone on black, matching the logo's own framing.
    og = Image.new("RGB", (1200, 630), BLACK)
    hero = scaled(wordmark, 720)
    og.paste(hero, ((1200 - hero.width) // 2, (630 - hero.height) // 2), hero)
    og.save(ROOT / "app" / "opengraph-image.png", optimize=True)
    og.save(ROOT / "app" / "twitter-image.png", optimize=True)
    print(f"app/opengraph-image.png  {(ROOT / 'app' / 'opengraph-image.png').stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
