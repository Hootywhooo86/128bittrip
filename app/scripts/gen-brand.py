#!/usr/bin/env python3
"""Generate 128bit Trips brand PNGs from src/brand/pixel-hotel.json.

Run from app/:  python3 scripts/gen-brand.py   (needs Pillow)

Outputs app icon, Android adaptive layers, splash, favicon, the web
landing-page logo, and pixel tab-bar icons. Everything is drawn with
nearest-neighbour squares so pixels stay crisp at every size.
"""
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "images")
BG = "#0b0b16"

with open(os.path.join(ROOT, "src", "brand", "pixel-hotel.json")) as f:
    brand = json.load(f)
PALETTE = brand["palette"]
GRID = brand["grid"]


def hex_rgba(h, a=255):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4)) + (a,)


def draw_grid(img, grid, cell, ox, oy, color_for):
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch == ".":
                continue
            img.paste(color_for(ch), (ox + x * cell, oy + y * cell, ox + (x + 1) * cell, oy + (y + 1) * cell))


def logo(size, art_px, bg=None, mono=None):
    """Square image with the hotel centred, art_px wide (rounded to the grid)."""
    img = Image.new("RGBA", (size, size), hex_rgba(bg) if bg else (0, 0, 0, 0))
    n = len(GRID)
    cell = max(1, art_px // n)
    off = (size - cell * n) // 2
    color_for = (lambda ch: mono) if mono else (lambda ch: hex_rgba(PALETTE[ch]))
    draw_grid(img, GRID, cell, off, off, color_for)
    return img


def save(img, name):
    path = os.path.join(IMG, name)
    img.save(path)
    print("wrote", os.path.relpath(path, ROOT))


save(logo(1024, 704, bg=BG), "icon.png")
# Adaptive icons: keep the art inside the central safe zone (~66%).
save(logo(1024, 576), "android-icon-foreground.png")
save(Image.new("RGBA", (1024, 1024), hex_rgba(BG)), "android-icon-background.png")
save(logo(1024, 576, mono=(255, 255, 255, 255)), "android-icon-monochrome.png")
save(logo(512, 512), "splash-icon.png")
save(logo(48, 48, bg=BG), "favicon.png")
save(logo(256, 256), "logo-hotel.png")

# Pixel tab icons (white on transparent, tinted by the tab bar).
TAB_ICONS = {
    "quests": [  # sword
        "..........WW",
        ".........WWW",
        "........WWW.",
        ".......WWW..",
        "......WWW...",
        ".W...WWW....",
        ".WW.WWW.....",
        "..WWWW......",
        "...WW.......",
        "..WWWW......",
        ".WW..WW.....",
        "WW..........",
    ],
    "trips": [  # map pin
        "...WWWWWW...",
        "..WWWWWWWW..",
        ".WWW....WWW.",
        ".WW......WW.",
        ".WW......WW.",
        ".WWW....WWW.",
        "..WWWWWWWW..",
        "...WWWWWW...",
        "....WWWW....",
        ".....WW.....",
        ".....WW.....",
        "............",
    ],
    "book": [  # hotel
        "....WWWW....",
        "....W..W....",
        "....WWWW....",
        "WWWWWWWWWWWW",
        "W..W.WW.W..W",
        "WWWWWWWWWWWW",
        "W..W.WW.W..W",
        "WWWWWWWWWWWW",
        "W..WW..WW..W",
        "WWWWW..WWWWW",
        "WWWWW..WWWWW",
        "............",
    ],
    "ai": [  # sparkle
        ".....W......",
        ".....W......",
        "....WWW.....",
        "...WWWWW....",
        "WWWWWWWWWWW.",
        "...WWWWW....",
        "....WWW.....",
        ".....W....W.",
        ".....W...WWW",
        "..........W.",
        "............",
        "............",
    ],
    "passport": [  # passport book with globe
        ".WWWWWWWWW..",
        ".W.......WW.",
        ".W..WWW..WW.",
        ".W.W.W.W.WW.",
        ".W.WWWWW.WW.",
        ".W.W.W.W.WW.",
        ".W..WWW..WW.",
        ".W.......WW.",
        ".W.WWWWW.WW.",
        ".W.......WW.",
        ".WWWWWWWWWW.",
        "............",
    ],
}
for name, grid in TAB_ICONS.items():
    img = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    draw_grid(img, grid, 8, 0, 0, lambda ch: (255, 255, 255, 255))
    save(img, os.path.join("tabIcons", f"{name}.png"))
