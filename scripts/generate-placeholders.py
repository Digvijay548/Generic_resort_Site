#!/usr/bin/env python3
"""
OPTIONAL — generates simple illustrated stand-in photos.

Only useful when starting a brand-new site with no real photos yet. Once you
have real photos in assets/images/ you never need this again.

It will NOT overwrite anything: any file that already exists is skipped, so
running it by accident cannot destroy your photos. Use --overwrite if you
really do want to replace the generated placeholders.

Usage:
    python scripts/generate-placeholders.py
    python scripts/generate-placeholders.py --overwrite

Afterwards, rebuild the image list:
    python scripts/generate-images.py
"""

import argparse
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Resolved from this file's location, so the script works on any machine.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, "assets", "images")

# Falls back to Pillow's built-in font wherever Arial is not installed.
FONT_LIGHT = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts", "arial.ttf")

OVERWRITE = False

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def vgrad(size, top, bottom):
    w, h = size
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        c = lerp(top, bottom, y / max(h - 1, 1))
        for x in range(w):
            px[x, y] = c
    return img

def scene(top, bottom, sun, hill1, hill2, river, variant):
    w, h = 1600, 900
    img = vgrad((w, h), top, bottom)
    d = ImageDraw.Draw(img, "RGBA")

    sun_x = 1180 + variant * 60
    sun_y = 180 + variant * 30
    sun_r = 90
    d.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r], fill=sun + (70,))

    # distant hills
    d.pieslice([-300, 250 - variant * 20, 900, 950], 180, 360, fill=hill1 + (255,))
    d.pieslice([600, 320, 2000, 1100], 180, 360, fill=hill2 + (255,))

    # river
    d.polygon([(0, 640), (0, 705), (400, 745), (900, 800), (1300, 840), (1600, 870), (1600, 940), (0, 940)], fill=river + (255,))

    # trees
    trees = [(180, 560), (420, 600), (1120, 620), (1380, 660), (1500, 700)]
    for i, (tx, ty) in enumerate(trees):
        tr = 46 + (i % 3) * 14
        trunk_c = (92, 64, 51)
        d.rectangle([tx - 10, ty + 8, tx + 10, ty + 46], fill=trunk_c)
        d.polygon([(tx - tr, ty + 20), (tx + tr, ty + 20), (tx, ty - tr - 40)], fill=(40 + i * 6, 105 + i * 8, 52))
        d.polygon([(tx - tr + 14, ty + 2), (tx + tr - 14, ty + 2), (tx, ty - tr - 22)], fill=(56, 132, 64))

    img = img.filter(ImageFilter.SMOOTH_MORE)
    return img

def label(img, text):
    d = ImageDraw.Draw(img)
    try:
        f = ImageFont.truetype(FONT_LIGHT, 26)
    except Exception:
        f = ImageFont.load_default()
    tw, th = d.textbbox((0, 0), text, font=f)[2:4]
    x, y = 28, img.height - th - 30
    d.rectangle([x - 12, y - 10, x + tw + 12, y + th + 10], fill=(0, 0, 0, 150))
    d.text((x, y), text, fill=(255, 255, 255), font=f)
    return img

def save_photo(rel, label_text, top, bottom, sun, hill1, hill2, river, variant=0, sizes=None):
    path = os.path.join(BASE, *rel.split("\\"))
    if os.path.exists(path) and not OVERWRITE:
        print("skipped (already exists)", rel)
        return
    img = scene(top, bottom, sun, hill1, hill2, river, variant)
    img = label(img, label_text)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "JPEG", quality=86, optimize=True, progressive=True)
    print("saved", rel)

_parser = argparse.ArgumentParser(description="Generate stand-in photos for a new site.")
_parser.add_argument("--overwrite", action="store_true",
                     help="replace files that already exist (default: skip them)")
OVERWRITE = _parser.parse_args().overwrite

if not OVERWRITE:
    print("Existing files will be skipped. Pass --overwrite to replace them.\n")

GREEN = (56, 122, 74)
DEEP_TEAL = (18, 74, 84)
BEIGE = (226, 205, 170)
SKY = (124, 181, 214)
AMBER = (238, 178, 92)
DUSK = (222, 122, 74)

# hero
save_photo(r"hero\hero-main.jpg", "hero / hero-main.jpg (16:9)", (66, 138, 92), DEEP_TEAL, AMBER, GREEN, (44, 96, 72), (70, 140, 160), variant=0)
save_photo(r"hero\hero-mobile.jpg", "hero / hero-mobile.jpg (9:16)", (66, 138, 92), DEEP_TEAL, AMBER, GREEN, (44, 96, 72), (70, 140, 160), variant=1)

# resort
save_photo(r"resort\resort-exterior-01.jpg", "resort / resort-exterior-01.jpg", BEIGE, (150, 160, 120), AMBER, GREEN, (120, 140, 96), (86, 150, 166), variant=0)
save_photo(r"resort\resort-exterior-02.jpg", "resort / resort-exterior-02.jpg", (196, 216, 190), (90, 150, 140), AMBER, (70, 128, 88), (56, 108, 96), (74, 152, 172), variant=1)
save_photo(r"resort\resort-riverfront-01.jpg", "resort / resort-riverfront-01.jpg", (180, 208, 214), (62, 118, 132), AMBER, GREEN, (40, 96, 84), (64, 138, 166), variant=2)

# rooms
for i, name in enumerate(["room-01", "room-02", "room-03"]):
    save_photo(rf"rooms\{name}.jpg", f"rooms / {name}.jpg", (240, 228, 206), (186, 160, 126), AMBER, (168, 150, 118), (140, 160, 120), (120, 150, 140), variant=i)
save_photo(r"rooms\room-bathroom-01.jpg", "rooms / room-bathroom-01.jpg", (226, 240, 240), (150, 186, 192), SKY, (166, 200, 202), (140, 176, 184), (110, 158, 168), variant=0)

# camping
save_photo(r"camping\camping-01.jpg", "camping / camping-01.jpg", (176, 214, 168), (70, 122, 84), AMBER, (52, 108, 66), (40, 92, 70), (80, 150, 170), variant=0)
save_photo(r"camping\camping-02.jpg", "camping / camping-02.jpg", (188, 216, 184), (80, 132, 92), AMBER, (56, 116, 72), (48, 100, 76), (86, 156, 176), variant=1)
save_photo(r"camping\camping-night-01.jpg", "camping / camping-night-01.jpg", (26, 40, 66), (6, 16, 30), (255, 232, 160), (20, 52, 48), (14, 40, 40), (30, 70, 90), variant=2)

# pool
save_photo(r"pool\swimming-pool-01.jpg", "pool / swimming-pool-01.jpg", (168, 214, 236), (84, 150, 196), AMBER, (120, 180, 180), (96, 164, 190), (70, 160, 200), variant=0)
save_photo(r"pool\swimming-pool-02.jpg", "pool / swimming-pool-02.jpg", (178, 222, 240), (96, 158, 200), AMBER, (130, 188, 186), (104, 172, 196), (80, 168, 206), variant=1)

# food
save_photo(r"food\food-breakfast-01.jpg", "food / food-breakfast-01.jpg", (244, 222, 196), (214, 172, 128), (255, 214, 130), (206, 160, 116), (196, 170, 132), (180, 140, 110), variant=0)
save_photo(r"food\food-buffet-01.jpg", "food / food-buffet-01.jpg", (248, 228, 200), (222, 182, 138), (255, 214, 130), (214, 172, 130), (204, 178, 140), (188, 150, 118), variant=1)
save_photo(r"food\food-dinner-01.jpg", "food / food-dinner-01.jpg", (238, 214, 190), (206, 164, 124), DUSK, (198, 156, 116), (188, 162, 128), (172, 134, 106), variant=2)

# activities
save_photo(r"activities\activity-family-01.jpg", "activities / activity-family-01.jpg", (206, 224, 188), (116, 158, 104), AMBER, (96, 140, 88), (84, 132, 92), (96, 156, 164), variant=0)
save_photo(r"activities\activity-group-01.jpg", "activities / activity-group-01.jpg", (210, 228, 194), (122, 164, 108), AMBER, (100, 144, 92), (90, 138, 96), (100, 160, 168), variant=1)

# surroundings
save_photo(r"surroundings\surroundings-01.jpg", "surroundings / surroundings-01.jpg", (200, 222, 218), (96, 150, 152), AMBER, (110, 160, 132), (76, 132, 128), (84, 160, 178), variant=0)
save_photo(r"surroundings\surroundings-02.jpg", "surroundings / surroundings-02.jpg", (204, 226, 222), (102, 156, 158), AMBER, (116, 166, 138), (82, 138, 134), (90, 166, 184), variant=1)

# gallery
g_top = [(66, 138, 92), (240, 228, 206), (176, 214, 168), (168, 214, 236)]
g_bot = [DEEP_TEAL, (186, 160, 126), (70, 122, 84), (84, 150, 196)]
for i, name in enumerate(["gallery-01", "gallery-02", "gallery-03", "gallery-04"]):
    save_photo(rf"gallery\{name}.jpg", f"gallery / {name}.jpg", g_top[i], g_bot[i], AMBER, GREEN, (44, 96, 72), (70, 140, 160), variant=i)

# ---- logo (PNG, transparent) ----
def make_logo(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = int(size * 0.06)
    cx, cy = size // 2, size // 2
    r = size // 2 - pad

    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(20, 90, 92, 255))

    # river wave at bottom
    d.arc([cx - int(r * 0.62), cy + int(r * 0.18), cx + int(r * 0.62), cy + int(r * 0.62)], 20, 160, fill=(120, 190, 210, 255), width=int(size * 0.055))
    d.arc([cx - int(r * 0.72), cy + int(r * 0.10), cx + int(r * 0.72), cy + int(r * 0.62)], 20, 160, fill=(220, 240, 240, 220), width=int(size * 0.045))

    # tree
    tx = cx
    ty = cy - int(r * 0.30)
    th_ = int(r * 0.85)
    tw_ = int(r * 0.52)
    trunk = int(r * 0.10)
    d.rectangle([tx - trunk // 2, ty + int(th_ * 0.32), tx + trunk // 2, ty + int(th_ * 0.72)], fill=(200, 214, 160, 255))
    d.polygon([(tx - tw_ // 2, ty + int(th_ * 0.30)), (tx + tw_ // 2, ty + int(th_ * 0.30)), (tx, ty - int(th_ * 0.62))], fill=(140, 200, 120, 255))
    d.polygon([(tx - tw_ // 2 + int(tw_ * 0.22), ty + int(th_ * 0.08)), (tx + tw_ // 2 - int(tw_ * 0.22), ty + int(th_ * 0.08)), (tx, ty - int(th_ * 0.42))], fill=(168, 216, 140, 255))

    # sun dot
    d.ellipse([cx + int(r * 0.42), cy - int(r * 0.52), cx + int(r * 0.62), cy - int(r * 0.32)], fill=(245, 200, 120, 255))

    return img

logo_path = os.path.join(BASE, "branding", "resort-logo.png")
if os.path.exists(logo_path) and not OVERWRITE:
    print("skipped (already exists) branding/resort-logo.png")
else:
    os.makedirs(os.path.dirname(logo_path), exist_ok=True)
    make_logo(512).save(logo_path)
    print("saved branding/resort-logo.png")

print("\nALL DONE — now run:  python scripts/generate-images.py")
