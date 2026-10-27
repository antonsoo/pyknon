"""Reproduce whole source JPEGs from the identified Internet Archive PDF."""

import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile

m = json.loads(pathlib.Path("public/sources/helikon/manifest.json").read_text())
pdf = pathlib.Path(sys.argv[1])
b = pdf.read_bytes()


def sha(b):
    return hashlib.sha256(b).hexdigest()


assert len(b) == m["pdfBytes"] and sha(b) == m["pdfSha256"]
version = subprocess.run(
    ["pdftoppm", "-v"], capture_output=True, text=True
).stderr.splitlines()[0]
assert "24.02.0" in version
pages = []
with tempfile.TemporaryDirectory() as tmp:
    for p in m["pages"]:
        prefix = str(pathlib.Path(tmp) / "page")
        subprocess.run(
            [
                "pdftoppm",
                "-f",
                str(p["pdfPage"]),
                "-l",
                str(p["pdfPage"]),
                "-singlefile",
                "-scale-to",
                "2200",
                "-jpeg",
                "-jpegopt",
                "quality=88",
                str(pdf),
                prefix,
            ],
            check=True,
            capture_output=True,
        )
        actual = pathlib.Path(prefix + ".jpg").read_bytes()
        retained = pathlib.Path("public", p["file"]).read_bytes()
        assert (
            actual == retained
            and len(actual) == p["bytes"]
            and sha(actual) == p["sha256"]
        ), p["file"]
        pages.append(
            {
                "printedPage": p["id"],
                "pdfPage": p["pdfPage"],
                "bytes": len(actual),
                "sha256": sha(actual),
            }
        )
    for a in m["assets"]:
        actual = pathlib.Path("public", a["file"]).read_bytes()
        assert len(actual) == a["bytes"] and sha(actual) == a["sha256"]
print(
    json.dumps(
        {
            "sourcePDF": {"bytes": m["pdfBytes"], "sha256": m["pdfSha256"]},
            "renderer": version,
            "wholePagesReproducedByteForByte": pages,
            "verifiedFontsAndLicenses": len(m["assets"]),
        },
        indent=2,
    )
)
