"""Regenerate favicon + PWA icons from public/images/logo-mobile.png."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "images" / "logo-mobile.png"
ICON_REV = "v23"

PNG_EXPORTS: dict[str, int] = {
    f"favicon-32-{ICON_REV}.png": 32,
    f"apple-touch-icon-{ICON_REV}.png": 180,
    f"icon-192-{ICON_REV}.png": 192,
    f"icon-512-{ICON_REV}.png": 512,
}

PADDING_BY_FILE: dict[str, float] = {
    f"favicon-32-{ICON_REV}.png": 0.08,
    f"apple-touch-icon-{ICON_REV}.png": 0.1,
    f"icon-192-{ICON_REV}.png": 0.1,
    f"icon-512-{ICON_REV}.png": 0.1,
}

ICO_SIZES = (16, 32, 48, 64, 128, 256)


def trim_transparent_edges(img: Image.Image) -> Image.Image:
    """Trim transparent borders; ignore near-zero alpha noise from background-removal tools."""
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A")
    # Many remove-bg exports leave tiny alpha specks that make getbbox() too large.
    # Threshold alpha first so only visible pixels define the crop box.
    thresholded = alpha.point(lambda v: 255 if v >= 24 else 0)
    bbox = thresholded.getbbox()
    if not bbox:
        return rgba
    return rgba.crop(bbox)


def fit_on_square(img: Image.Image, size: int, padding: float = 0.0) -> Image.Image:
    """Scale source to target size with optional padding inside the square frame."""
    img = trim_transparent_edges(img)
    w, h = img.size
    inner_size = max(1, int(size * (1 - padding * 2)))
    scale = min(inner_size / w, inner_size / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source image: {SOURCE}")

    src = Image.open(SOURCE)
    for name, dim in PNG_EXPORTS.items():
        out = fit_on_square(src, dim, PADDING_BY_FILE.get(name, 0.0))
        out.save(PUBLIC / name, format="PNG", optimize=True)
        print(f"Wrote {name} ({dim}x{dim})")

    ico_frames = [fit_on_square(src, dim) for dim in ICO_SIZES]
    favicon_name = f"favicon-{ICON_REV}.ico"
    ico_frames[0].save(
        PUBLIC / favicon_name,
        format="ICO",
        sizes=[(dim, dim) for dim in ICO_SIZES],
        append_images=ico_frames[1:],
    )
    print(f"Wrote {favicon_name}")


if __name__ == "__main__":
    main()
