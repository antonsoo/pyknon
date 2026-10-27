#!/usr/bin/env python3
"""Retain complete Alypius pages, not reconstructed musical glyphs.

python3 scripts/notation-sources.py ORIGINAL_JAN_1895_PDF
Original: https://archive.org/download/musiciscriptoresjank/musiciscriptoresjank.pdf
Requires Poppler pdftoppm and Pillow. Normal builds need neither.
"""

from pathlib import Path
import hashlib
import json
import subprocess
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = "a442b3d4bbcf3ab6a8a0872f68ebc8a90e891985bf3fa40f4716767c02fb58e8"


def identity(file):
    data = file.read_bytes()
    return {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def main():
    original = Path(sys.argv[1])
    assert identity(original)["sha256"] == EXPECTED, "Wrong source PDF"
    dest = ROOT / "public/sources/notation"
    dest.mkdir(exist_ok=True)
    pages = []
    for pdf, printed, note in [
        (7, "title", "Title, editor and MDCCCXCV (1895)."),
        (469, "367", "Introduction; bracketed upper/lower notation heading and editorial apparatus."),
        (470, "368", "Fixed and movable notes; the complete paired Lydian diatonic table."),
        (471, "369", "Names, Greek shape descriptions, sign pairs and the editor’s modern staff."),
        (472, "370", "Hypolydian diatonic names and pairs; compare the functions of sigma and iota."),
    ]:
        stem = dest / f"jan-{printed}"
        subprocess.run(["pdftoppm", "-f", str(pdf), "-l", str(pdf), "-singlefile", "-scale-to", "2200", "-jpeg", "-jpegopt", "quality=88", str(original), str(stem)], check=True)
        file = stem.with_suffix(".jpg")
        width, height = Image.open(file).size
        pages.append({"id": printed, "pdfPage": pdf, "printedPage": printed, "file": f"sources/notation/{file.name}", "width": width, "height": height, "note": note, **identity(file)})
    assets = []
    for name in ["IBMPlexSans-Regular.woff2", "IBMPlexSans-SemiBold.woff2", "NotoSerif-Regular.ttf", "IBMPlex-OFL.txt", "NotoSerif-OFL.txt"]:
        file = ROOT / "public/fonts" / name
        assets.append({"file": f"fonts/{name}", **identity(file)})
    manifest = {
        "edition": "Karl von Jan, Musici scriptores graeci, Teubner, Leipzig, 1895; Alypius, Eisagoge mousike, pp367–370.",
        "original": {"url": "https://archive.org/download/musiciscriptoresjank/musiciscriptoresjank.pdf", "catalogue": "https://archive.org/details/musiciscriptoresjank", **identity(original)},
        "rights": "Public-domain 1895 edition. Whole scanned pages retained; no manuscript facsimile or ancient absolute-pitch claim.",
        "derivation": "Poppler pdftoppm; complete pages, longest side 2200 px, JPEG quality 88; no cropping, recolouring or reconstruction.",
        "pages": pages,
        "assets": assets,
    }
    (dest / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(f"Retained {len(pages)} whole pages and {len(assets)} font/license identities.")


if __name__ == "__main__":
    main()
