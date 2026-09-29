#!/usr/bin/env python3
"""Generate DSP Trainer placeholder app icons and splash assets.

Requires: pip install pillow
Outputs under assets/images/ (referenced by app.json) and assets/store/.
"""

from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw

OUT = "assets/images"
STORE = "assets/store"

BG = (11, 58, 92)
ACCENT = (78, 197, 241)
WAVE = (47, 149, 220)


def draw_waveform(
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    width: float,
    height: float,
    color: tuple[int, ...],
    amp_scale: float = 1.0,
    cycles: float = 2.5,
    stroke: int = 18,
) -> None:
    pts: list[tuple[float, float]] = []
    n = 120
    for i in range(n + 1):
        t = i / n
        x = cx - width / 2 + t * width
        y = cy + math.sin(t * math.pi * 2 * cycles) * (height / 2) * amp_scale
        pts.append((x, y))
    draw.line(pts, fill=color, width=stroke, joint="curve")


def make_icon(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)
    margin = int(size * 0.12)
    draw.ellipse([margin, margin, size - margin, size - margin], fill=(14, 72, 112))
    draw_waveform(
        draw,
        size / 2,
        size / 2,
        size * 0.62,
        size * 0.28,
        ACCENT,
        stroke=max(4, size // 48),
    )
    draw_waveform(
        draw,
        size / 2,
        size / 2 + size * 0.08,
        size * 0.5,
        size * 0.14,
        WAVE,
        amp_scale=0.7,
        cycles=3.5,
        stroke=max(2, size // 80),
    )
    return img


def make_splash_icon(size: int = 1024) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    margin = int(size * 0.08)
    draw.ellipse([margin, margin, size - margin, size - margin], fill=(*BG, 255))
    draw_waveform(
        draw,
        size / 2,
        size / 2,
        size * 0.58,
        size * 0.26,
        (*ACCENT, 255),
        stroke=max(8, size // 40),
    )
    return img


def make_adaptive_fg(size: int = 512) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_waveform(
        draw,
        size / 2,
        size / 2,
        size * 0.52,
        size * 0.22,
        (*ACCENT, 255),
        stroke=max(6, size // 36),
    )
    draw_waveform(
        draw,
        size / 2,
        size / 2 + size * 0.06,
        size * 0.42,
        size * 0.12,
        (*WAVE, 220),
        amp_scale=0.75,
        cycles=3.2,
        stroke=max(3, size // 64),
    )
    return img


def make_adaptive_bg(size: int = 512) -> Image.Image:
    return Image.new("RGBA", (size, size), (*BG, 255))


def make_mono(size: int = 432) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_waveform(
        draw,
        size / 2,
        size / 2,
        size * 0.55,
        size * 0.24,
        (0, 0, 0, 255),
        stroke=max(5, size // 36),
    )
    return img


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(STORE, exist_ok=True)

    make_icon(1024).save(f"{OUT}/icon.png", "PNG")
    make_splash_icon(1024).save(f"{OUT}/splash-icon.png", "PNG")
    make_adaptive_fg(512).save(f"{OUT}/android-icon-foreground.png", "PNG")
    make_adaptive_bg(512).save(f"{OUT}/android-icon-background.png", "PNG")
    make_mono(432).save(f"{OUT}/android-icon-monochrome.png", "PNG")
    make_icon(48).convert("RGBA").save(f"{OUT}/favicon.png", "PNG")
    make_icon(512).save(f"{STORE}/icon-512.png", "PNG")
    make_icon(1024).save(f"{STORE}/icon-1024.png", "PNG")
    print(f"Wrote Expo assets to {OUT}/ and listing helpers to {STORE}/")


if __name__ == "__main__":
    main()
