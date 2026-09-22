#!/usr/bin/env python3
"""Generate logo derivatives, resized photos, montage crops, the Open Graph image
and src/_data/images.json.

Run from the repo root:  python3 tools/make-images.py
Source photos live one level above the repo in ../images (not committed).
Requires Pillow (pip3 install pillow).
"""
import json
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.normpath(os.path.join(ROOT, "..", "images"))
OUT = os.path.join(ROOT, "src", "images")
PHOTOS = os.path.join(OUT, "photos")
DATA = os.path.join(ROOT, "src", "_data", "images.json")
os.makedirs(PHOTOS, exist_ok=True)

BLUE = (0, 40, 152)
DEEP = (0, 28, 92)
YELLOW = (248, 216, 0)
WHITE = (255, 255, 255)


def font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                pass
    try:
        return ImageFont.load_default(size)
    except TypeError:
        return ImageFont.load_default()


SERIF = [
    "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/Library/Fonts/Times New Roman Bold.ttf",
]
SANS = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Helvetica.ttc",
]
SANS_BOLD = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]

# ---------------------------------------------------------------- logo
logo = Image.open(os.path.join(SRC, "logo.png")).convert("RGBA")
alpha = logo.getchannel("A").point(lambda v: 255 if v >= 240 else v)
logo.putalpha(alpha)
logo.save(os.path.join(OUT, "logo.png"), optimize=True)

for size, name in [(256, "logo-256.png"), (32, "favicon-32.png"), (192, "favicon-192.png"), (512, "favicon-512.png")]:
    im = logo.copy()
    im.thumbnail((size, size), Image.LANCZOS)
    im.save(os.path.join(OUT, name), optimize=True)

ati = Image.new("RGBA", (180, 180), WHITE + (255,))
small = logo.copy()
small.thumbnail((150, 150), Image.LANCZOS)
ati.alpha_composite(small, ((180 - small.width) // 2, (180 - small.height) // 2))
ati.convert("RGB").save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)

# ------------------------------------------------------------ og image
og = Image.new("RGB", (1200, 630), WHITE)
d = ImageDraw.Draw(og)
d.rectangle([0, 0, 1200, 16], fill=BLUE)
d.rectangle([0, 614, 1200, 630], fill=YELLOW)
mark = logo.copy()
mark.thumbnail((420, 420), Image.LANCZOS)
og.paste(mark, (80, 105), mark)
d.text((540, 150), "JaniCrew", font=font(SERIF, 124), fill=BLUE)
d.text((546, 300), "Your local crew.", font=font(SANS, 46), fill=DEEP)
d.text((546, 356), "Our standard of clean.", font=font(SANS, 46), fill=DEEP)
d.text((548, 455), "COMMERCIAL CLEANING  ·  INSURED  ·  BONDED  ·  LICENSED", font=font(SANS_BOLD, 22), fill=BLUE)
og.save(os.path.join(OUT, "og-image.png"), optimize=True)

# -------------------------------------------------------------- photos
slots = {}


def add(key, filename, im, alt, quality=74, maxpx=1600):
    im = im.convert("RGB")
    im.thumbnail((maxpx, maxpx), Image.LANCZOS)
    path = os.path.join(PHOTOS, filename)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    w, h = im.size
    slots[key] = {"src": f"photos/{filename}", "alt": alt, "width": w, "height": h, "ratio": f"{w}/{h}"}
    print(f"  {filename:28s} {w}x{h}  {os.path.getsize(path) // 1024} KB")


def src(name):
    return Image.open(os.path.join(SRC, name))


print("photos:")
add("lobbyMopping", "lobby-mopping-16x9.jpg", src("janicrew_lobby_mopping_16x9.jpg"),
    "A JaniCrew crew member mopping a polished lobby floor beside a wet-floor sign")
add("conferenceTable", "conference-4x3.jpg", src("janicrew_conference_cleaning_4x3.jpg"),
    "A JaniCrew crew member wiping down a long boardroom table")
add("janitorialCart", "janitorial-cart-4x5.jpg", src("janicrew_janitorial_cart_4x5.jpg"),
    "A JaniCrew crew member emptying office wastebaskets into a janitorial cart")
add("officeVacuuming", "office-vacuuming-1x1.jpg", src("janicrew_office_vacuuming_1x1.jpg"),
    "A JaniCrew crew member vacuuming carpet between office cubicles")

shower = src("janicrew_bathroom_cleaning_9x16.jpg")
add("showerScrubTall", "shower-scrub-9x16.jpg", shower,
    "A JaniCrew crew member in a logo polo scrubbing a tiled shower wall")
add("showerScrub", "shower-scrub-4x5.jpg", shower.crop((0, 200, 1440, 2000)),
    "A JaniCrew crew member in a logo polo scrubbing a tiled shower wall")

# Clean tiles cut from the montages (no baked-in text). Boxes come from gutter detection; inset 3px.
tiles = {
    "redPickup": ("red-pickup.jpg", "janicrew_montage_3.jpg", (454, 387, 1030, 729),
                  "A red JaniCrew pickup truck with the diamond logo on the door, parked outside a client building"),
    "floorBuffer": ("floor-buffer.jpg", "janicrew_montage_5.jpg", (465, 523, 1002, 1023),
                    "A JaniCrew crew member running a floor buffer across a marble lobby"),
    "restroomSink": ("restroom-sink.jpg", "janicrew_montage_5.jpg", (502, 0, 1047, 520),
                     "A JaniCrew crew member wiping a restroom counter and sink"),
    "windowCleaning": ("window-cleaning.jpg", "janicrew_montage_5.jpg", (1053, 0, 1535, 520),
                       "A JaniCrew crew member squeegeeing an office window"),
    "supplyCaddy": ("supply-caddy.jpg", "janicrew_montage_1.jpg", (0, 720, 388, 1022),
                    "A JaniCrew supply caddy with spray bottles and cloths"),
    "deskWipe": ("desk-wipe.jpg", "janicrew_montage_5.jpg", (0, 523, 459, 1023),
                 "A JaniCrew crew member wiping an office desk"),
    "poloLogo": ("polo-logo.jpg", "janicrew_montage_3.jpg", (1037, 797, 1535, 1023),
                 "The JaniCrew diamond logo on a navy crew polo"),
}
for key, (fname, source, (x0, y0, x1, y1), alt) in tiles.items():
    add(key, fname, src(source).crop((x0 + 3, y0 + 3, x1 - 3, y1 - 3)), alt, quality=82)

with open(DATA, "w") as f:
    json.dump(slots, f, indent=2)
    f.write("\n")
print(f"wrote {os.path.relpath(DATA, ROOT)} with {len(slots)} slots")
