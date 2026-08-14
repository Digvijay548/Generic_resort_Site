#!/usr/bin/env python3
"""
Scan assets/images/<folder>/ and write js/images.js.

DROP-IN WORKFLOW
----------------
1. Put any .jpg / .jpeg / .png / .webp file into a folder inside assets/images/.
   Filenames do not matter. Counts do not matter. New folders do not matter.
2. Run this script (or double-click scripts/update-images.bat on Windows).
3. Refresh the page.

The site reads js/images.js and lays itself out around whatever it finds:
5 photos in a folder shows 5, add 3 more and it shows 8, add a brand-new
folder and it becomes a new gallery tab.

WHAT THIS SCRIPT DOES
---------------------
* Finds every photo, in any folder, under any filename.
* Builds small/medium/large WebP copies in assets/images/_optimized/ so pages
  load fast. Originals are never modified or moved.
* Records each image's real pixel size so the page reserves space and does not
  jump around while loading.
* Writes human-readable alt text (screen readers + Google). Filenames like
  "SaveClip.App_630009485_17909303118337753_n.jpg" carry no meaning, so a
  folder-based description is used instead. To set your own, drop an
  _alt.json file into the folder:  { "my-photo.jpg": "Sunset over the river" }

Usage:
    python scripts/generate-images.py
    python scripts/generate-images.py --force    # rebuild every derivative
    python scripts/generate-images.py --clean    # delete _optimized/ first
"""

import argparse
import json
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(ROOT, "assets", "images")
OUT_FILE = os.path.join(ROOT, "js", "images.js")

OPT_DIRNAME = "_optimized"
OPT_DIR = os.path.join(IMAGES_DIR, OPT_DIRNAME)
OPT_REL = "assets/images/" + OPT_DIRNAME

SOURCE_EXTS = (".jpg", ".jpeg", ".png", ".webp")

# Responsive widths generated for every photo. Widths wider than the original
# are skipped, so a small image never gets upscaled.
WIDTHS = [480, 960, 1440, 1920]

WEBP_QUALITY = 82
JPEG_QUALITY = 82
# Originals bigger than this get a slimmed-down JPEG fallback for the rare
# browser with no WebP support. Smaller files are already fine as-is.
FALLBACK_BYTES = 300 * 1024

# ---------------------------------------------------------------------------
#  FOLDER SETTINGS
#  These live in assets/images/folders.json, NOT here, so that this script and
#  js/autoscan.js (which reads the folders live in the browser) can never
#  disagree about a folder's tab name or whether it belongs in the gallery.
#
#  A folder NOT listed there still works: it joins the gallery with its own
#  name as the tab label. Nothing needs registering.
# ---------------------------------------------------------------------------
CONFIG_FILE = os.path.join(IMAGES_DIR, "folders.json")

DEFAULT_CONFIG = {
    "siteName": "the resort",
    "galleryOrder": [],
    "folders": {},
}


def load_config():
    if not os.path.isfile(CONFIG_FILE):
        print("Note: assets/images/folders.json not found — using defaults.\n")
        return dict(DEFAULT_CONFIG)
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as fh:
            loaded = json.load(fh)
    except (ValueError, OSError) as exc:
        raise SystemExit("Could not read %s\n  %s" % (CONFIG_FILE, exc))
    config = dict(DEFAULT_CONFIG)
    # Keys starting with _ are notes for whoever opens the file.
    config.update({k: v for k, v in loaded.items() if not k.startswith("_")})
    return config


CONFIG = load_config()
SITE_NAME = CONFIG.get("siteName") or "the resort"
GALLERY_ORDER = CONFIG.get("galleryOrder") or []

# Filename words that carry no meaning, used to decide whether a filename is
# descriptive enough to become alt text.
NOISE_WORDS = {
    "img", "image", "images", "photo", "photos", "pic", "pics", "picture",
    "dsc", "dscn", "pxl", "screenshot", "capture", "copy", "final", "new",
    "untitled", "download", "saveclip", "app", "whatsapp", "gemini",
    "generated", "unnamed", "resized", "edited", "export", "output",
}

try:
    from PIL import Image
    HAVE_PILLOW = True
except ImportError:  # pragma: no cover - depends on the machine
    HAVE_PILLOW = False


# ---------------------------------------------------------------------------
#  helpers
# ---------------------------------------------------------------------------
def is_source_image(filename):
    return filename.lower().endswith(SOURCE_EXTS) and not filename.startswith(".")


def hidden(name):
    """Folders starting with _ or . are ours (or the OS's), never user photos."""
    return name.startswith("_") or name.startswith(".")


def titleize(text):
    text = re.sub(r"[-_]+", " ", text).strip()
    words = [w[:1].upper() + w[1:] for w in text.split() if w]
    return " ".join(words)


def folder_settings(folder):
    entry = CONFIG.get("folders", {}).get(folder)
    if entry:
        label = entry.get("label", titleize(folder))
        in_gallery = entry.get("gallery", True) is not False and bool(label)
        alt = entry.get("alt") or (titleize(folder) + " at {site}")
        return (label, in_gallery, alt)
    # Unknown folder: show it, label it after itself, describe it generically.
    label = titleize(folder)
    return (label, True, label + " at {site}")


def is_descriptive(filename):
    """True when a filename reads like words rather than camera/export noise."""
    stem = os.path.splitext(filename)[0]
    tokens = [t for t in re.split(r"[-_\s.]+", stem.lower()) if t]
    for token in tokens:
        if token.isdigit() or len(token) < 3:
            continue
        if token in NOISE_WORDS:
            continue
        # A token of mostly digits (e.g. "17909303118337753") is not a word.
        digits = sum(c.isdigit() for c in token)
        if digits > len(token) / 2:
            continue
        # Real words contain vowels; "fxf8qvfxf8qvfxf8" and "xkcd" do not.
        if not re.search(r"[aeiou]", token):
            continue
        # Long letter+digit soup is an export id, not a description.
        if len(token) > 12 and digits:
            continue
        return True
    return False


def load_alt_overrides(folder_path):
    path = os.path.join(folder_path, "_alt.json")
    if not os.path.isfile(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        return {str(k): str(v) for k, v in data.items()} if isinstance(data, dict) else {}
    except (ValueError, OSError) as exc:
        print("  ! ignoring %s (%s)" % (path, exc))
        return {}


def build_alt(filename, folder, index, total, overrides):
    if filename in overrides:
        return overrides[filename]
    if is_descriptive(filename):
        return titleize(os.path.splitext(filename)[0])
    phrase = folder_settings(folder)[2].format(site=SITE_NAME)
    # Numbering only helps when there are several near-identical descriptions.
    return "%s (%d of %d)" % (phrase, index + 1, total) if total > 1 else phrase


def needs_rebuild(src, dest, force):
    if force or not os.path.isfile(dest):
        return True
    return os.path.getmtime(src) > os.path.getmtime(dest)


def to_rel(path):
    return os.path.relpath(path, ROOT).replace(os.sep, "/")


# ---------------------------------------------------------------------------
#  derivative generation
# ---------------------------------------------------------------------------
def make_derivatives(src_path, folder, stem, force, stats):
    """Return (width, height, srcset_webp, fallback_rel). Never raises."""
    if not HAVE_PILLOW:
        return (0, 0, "", "")

    try:
        with Image.open(src_path) as im:
            im.load()
            width, height = im.size
            has_alpha = im.mode in ("RGBA", "LA", "P") and "transparency" in im.info \
                or im.mode in ("RGBA", "LA")
            rgb = im.convert("RGBA") if has_alpha else im.convert("RGB")

            out_dir = os.path.join(OPT_DIR, folder)
            os.makedirs(out_dir, exist_ok=True)

            targets = [w for w in WIDTHS if w < width] + [width]
            targets = sorted(set(targets))

            entries = []
            for target in targets:
                dest = os.path.join(out_dir, "%s-%d.webp" % (stem, target))
                if needs_rebuild(src_path, dest, force):
                    resized = rgb if target == width else rgb.resize(
                        (target, max(1, round(height * target / width))),
                        Image.LANCZOS,
                    )
                    resized.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
                    stats["written"] += 1
                entries.append("%s/%s/%s-%d.webp %dw" % (OPT_REL, folder, stem, target, target))

            fallback_rel = ""
            if not has_alpha and os.path.getsize(src_path) > FALLBACK_BYTES:
                cap = min(width, 1920)
                dest = os.path.join(out_dir, "%s-%d.jpg" % (stem, cap))
                if needs_rebuild(src_path, dest, force):
                    resized = rgb if cap == width else rgb.resize(
                        (cap, max(1, round(height * cap / width))), Image.LANCZOS
                    )
                    resized.save(dest, "JPEG", quality=JPEG_QUALITY,
                                 optimize=True, progressive=True)
                    stats["written"] += 1
                fallback_rel = "%s/%s/%s-%d.jpg" % (OPT_REL, folder, stem, cap)

            return (width, height, ", ".join(entries), fallback_rel)
    except (OSError, ValueError) as exc:
        print("  ! could not process %s (%s)" % (to_rel(src_path), exc))
        stats["failed"] += 1
        return (0, 0, "", "")


# ---------------------------------------------------------------------------
#  scanning
# ---------------------------------------------------------------------------
def dedupe_by_stem(files):
    """A folder holding both photo.jpg and photo.webp holds ONE photo.

    Older versions of this project asked people to hand-place .webp copies next
    to each .jpg. Those pairs must not become two gallery entries. The richer
    original wins; the .webp sibling is ignored (we generate our own anyway).
    """
    chosen = {}
    for filename in files:
        stem, ext = os.path.splitext(filename)
        key = stem.lower()
        if key not in chosen or (ext.lower() == ".webp") < (
            os.path.splitext(chosen[key])[1].lower() == ".webp"
        ):
            chosen[key] = filename
    return sorted(chosen.values())


def scan_folder(folder, force, stats):
    folder_path = os.path.join(IMAGES_DIR, folder)
    files = dedupe_by_stem(
        [f for f in os.listdir(folder_path) if is_source_image(f)]
    )
    if not files:
        return []

    overrides = load_alt_overrides(folder_path)
    images = []
    for index, filename in enumerate(files):
        src_path = os.path.join(folder_path, filename)
        stem = os.path.splitext(filename)[0]
        width, height, srcset, fallback = make_derivatives(
            src_path, folder, stem, force, stats
        )
        src_rel = "assets/images/%s/%s" % (folder, filename)
        images.append({
            "src": fallback or src_rel,
            "original": src_rel,
            "srcset": srcset,
            "alt": build_alt(filename, folder, index, len(files), overrides),
            "w": width,
            "h": height,
        })
        stats["images"] += 1
    return images


def gallery_sort_key(folder):
    if folder in GALLERY_ORDER:
        return (0, GALLERY_ORDER.index(folder), folder)
    return (1, 0, folder)


def main():
    parser = argparse.ArgumentParser(description="Rebuild js/images.js from assets/images/.")
    parser.add_argument("--force", action="store_true",
                        help="rebuild every derivative even if it looks up to date")
    parser.add_argument("--clean", action="store_true",
                        help="delete assets/images/_optimized/ before running")
    args = parser.parse_args()

    if not os.path.isdir(IMAGES_DIR):
        raise SystemExit("Folder not found: %s" % IMAGES_DIR)

    if args.clean and os.path.isdir(OPT_DIR):
        shutil.rmtree(OPT_DIR)
        print("Removed %s" % to_rel(OPT_DIR))

    if not HAVE_PILLOW:
        print("NOTE: Pillow is not installed, so no WebP copies will be made.")
        print("      The site still works; pages will just be heavier.")
        print("      Install it with:  python -m pip install Pillow")
        print()

    stats = {"images": 0, "written": 0, "failed": 0}
    folders = {}

    names = sorted(
        name for name in os.listdir(IMAGES_DIR)
        if os.path.isdir(os.path.join(IMAGES_DIR, name)) and not hidden(name)
    )
    for name in names:
        images = scan_folder(name, args.force, stats)
        if not images:
            continue
        label, in_gallery, _ = folder_settings(name)
        folders[name] = {
            "label": label,
            "gallery": bool(in_gallery and label),
            "images": images,
        }

    order = sorted(
        (f for f in folders if folders[f]["gallery"]),
        key=gallery_sort_key,
    )

    manifest = {"version": 2, "order": order, "folders": folders}

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as fh:
        fh.write("/* AUTO-GENERATED by scripts/generate-images.py — do not edit by hand.\n")
        fh.write("   Add photos to assets/images/<folder>/ and re-run the script. */\n")
        fh.write("window.IMAGE_MANIFEST = ")
        fh.write(json.dumps(manifest, ensure_ascii=False, indent=2))
        fh.write(";\n")

    print("Wrote %s" % to_rel(OUT_FILE))
    print("  %d image(s) across %d folder(s)" % (stats["images"], len(folders)))
    if stats["written"]:
        print("  %d optimised file(s) created in %s" % (stats["written"], OPT_REL))
    if stats["failed"]:
        print("  %d file(s) could not be read and were skipped" % stats["failed"])
    print()
    for name in names:
        if name not in folders:
            continue
        info = folders[name]
        tab = info["label"] if info["gallery"] else "(not in gallery)"
        print("  %-14s %2d image(s)   %s" % (name, len(info["images"]), tab))

    if not folders:
        print("  No images found. Drop photos into assets/images/<folder>/ and re-run.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
