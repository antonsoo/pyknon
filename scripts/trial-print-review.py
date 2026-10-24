# /// script
# requires-python = ">=3.12,<3.15"
# dependencies = ["pymupdf==1.28.2"]
# ///
"""Inspect an actual native saved-reading PDF, including unchanged JPEGs."""
import hashlib
import json
from pathlib import Path
import sys

import pymupdf

pdf = Path(sys.argv[1])
document = pymupdf.open(pdf)
manifest = json.loads(Path("public/sources/trial/manifest.json").read_text())
by_hash = {f["sha256"]: f for f in manifest["files"]}
text = "\n".join(p.get_text() for p in document)
for word in ["δοκιμασίαν", "ἰσότονον", "ἰσομήκεσι", "probationem", "aequitona"]:
    assert word in text, word
images = []
for number, page in enumerate(document, 1):
    assert len(page.get_text().strip()) > 30, (number, "Empty or stranded page")
    for image in page.get_images():
        data = document.extract_image(image[0])["image"]
        identity = hashlib.sha256(data).hexdigest()
        assert identity in by_hash, (number, identity)
        source = by_hash[identity]
        assert str(source["printedPage"]) in page.get_text()
        assert identity in page.get_text().replace("\n", "")
        rects = page.get_image_rects(image[0])
        assert len(rects) == 1 and page.rect.contains(rects[0])
        images.append({"pdfSheet": number, "printedPage": source["printedPage"], "sha256": identity})
assert len(images) == 6
assert len({i["sha256"] for i in images}) == 6
print(json.dumps({"pdfSha256": hashlib.sha256(pdf.read_bytes()).hexdigest(), "sheets": len(document),
                  "unchangedSourceJpegs": images, "greekAndLatinExtractable": True,
                  "sourceCaptionsAndHashesOnTheirImageSheet": True, "noEmptySheets": True,
                  "limit": "Browser print, not a separately typeset or tagged critical edition"}, indent=2))
