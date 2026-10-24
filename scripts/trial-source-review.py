"""Re-render the identified 1682 PDF and compare every complete bundled page."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

p = argparse.ArgumentParser()
p.add_argument("--pdf", type=Path, required=True)
args = p.parse_args()
manifest = json.loads(Path("public/sources/trial/manifest.json").read_text())
digest = lambda b: hashlib.sha256(b).hexdigest()
assert digest(args.pdf.read_bytes()) == manifest["originalPdfSha256"]
files = []
with tempfile.TemporaryDirectory() as folder:
    prefix = Path(folder) / "wallis"
    subprocess.run(["pdftoppm", "-f", "55", "-l", "60", "-scale-to", "1800", "-jpeg", "-jpegopt", "quality=82", str(args.pdf), str(prefix)], check=True)
    for f in manifest["files"]:
        actual = digest(prefix.with_name(f"wallis-{f['pdfPage']:03}.jpg").read_bytes())
        assert actual == f["sha256"] == digest((Path("public") / f["file"]).read_bytes())
        files.append(f)
print(json.dumps({"edition": manifest["edition"], "originalPdfSha256": manifest["originalPdfSha256"],
                  "fullPagesReproduced": files, "render": manifest["render"],
                  "visualReview": "All six complete bundled pages and the selected Greek/Latin excerpts were inspected against this print. Diagram and bridge-surface editorial note retained."}, indent=2))
