#!/usr/bin/env bash
# ============================================================================
#  Netlify build step
# ============================================================================
#  Rebuilds the photo list and the optimised WebP copies on Netlify's servers,
#  so pushing a photo is all you ever have to do.
#
#  This script NEVER fails the deploy. If Python or Pillow is unavailable, or
#  a photo cannot be read, it says so and exits 0 — the site then serves
#  whatever js/images.js and assets/images/_optimized/ were committed, which
#  is always a working state.
# ============================================================================

echo "─────────────────────────────────────────────"
echo " Rebuilding photo list and optimised copies"
echo "─────────────────────────────────────────────"

PY=""
for candidate in python3 python; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PY="$candidate"
    break
  fi
done

if [ -z "$PY" ]; then
  echo "! No Python found. Using the committed js/images.js instead."
  echo "  The site will work; photos added since the last local run of"
  echo "  scripts/generate-images.py will not appear."
  exit 0
fi

echo "Using $($PY --version 2>&1)"

# Pillow makes the WebP copies. Without it the script still writes the photo
# list, it just cannot resize anything.
if ! $PY -c "import PIL" >/dev/null 2>&1; then
  echo "Installing Pillow..."
  $PY -m pip install --quiet --disable-pip-version-check Pillow \
    || echo "! Pillow install failed — continuing without image optimisation."
fi

$PY scripts/generate-images.py || echo "! Image build failed — using committed files."

echo "─────────────────────────────────────────────"
echo " Build step done"
echo "─────────────────────────────────────────────"

# Always succeed. A photo problem must never take the website offline.
exit 0
