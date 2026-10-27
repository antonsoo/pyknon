"""Audit actual saved files, original image/font identity, PCM and printed content."""

import base64
import csv
import hashlib
import io
import json
import math
import pathlib
import struct
import subprocess
import sys
import tempfile
import unicodedata
import urllib.parse
import wave
import xml.etree.ElementTree as ET
from fractions import Fraction as F
from html.parser import HTMLParser

ROOT = pathlib.Path.cwd()
OUT = pathlib.Path(sys.argv[1])
m = json.loads((ROOT / "public/sources/helikon/manifest.json").read_text())
review = json.loads((OUT / "review.json").read_text())


def data_url(s):
    head, body = s.split(",", 1)
    return (
        base64.b64decode(body)
        if ";base64" in head
        else urllib.parse.unquote_to_bytes(body)
    )


class Reading(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.images = []
        self.audio = []
        self.downloads = {}
        self.scripts = []
        self.handlers = []
        self.remote = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.handlers.extend(k for k in a if k.startswith("on"))
        if tag == "script":
            self.scripts.append(a)
        if tag == "img":
            self.images.append(data_url(a["src"]))
        if tag == "audio":
            self.audio.append(data_url(a["src"]))
        if tag == "a" and "download" in a:
            self.downloads[a["download"]] = data_url(a["href"])
        if tag in ["img", "audio", "source", "iframe", "script", "link"]:
            for k in ["src", "href"]:
                if k in a and a[k].startswith(("http:", "https:", "//")):
                    self.remote.append(a[k])


def signature(b):
    return {"bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}


def audio(b, groups):
    with wave.open(io.BytesIO(b), "rb") as w:
        assert w.getparams()[:3] == (1, 2, 48000)
        samples = struct.unpack(
            "<" + "h" * w.getnframes(), w.readframes(w.getnframes())
        )
    t = 0.12
    observed = []
    silence = []
    for group in groups:
        for hz in group:
            lo, hi = round((t + 0.1) * 48000), round((t + 0.4) * 48000)
            cross = []
            for i in range(lo, hi - 1):
                a, b = samples[i : i + 2]
                if a <= 0 < b:
                    cross.append(i + (-a) / (b - a))
            measured = 48000 * (len(cross) - 1) / (cross[-1] - cross[0])
            error = 1200 * math.log2(measured / float(hz))
            assert abs(error) < 0.03, (float(hz), measured, error)
            rms = math.sqrt(sum((x / 32768) ** 2 for x in samples[lo:hi]) / (hi - lo))
            assert abs(rms - 0.16 / math.sqrt(2)) < 0.001
            assert all(
                x == 0
                for x in samples[round((t + 0.58) * 48000) : round((t + 0.7) * 48000)]
            )
            observed.append(
                {
                    "start": round(t, 2),
                    "expectedHz": float(hz),
                    "measuredHz": measured,
                    "errorCents": error,
                }
            )
            t += 0.74
        silence.append([t - 0.18, t + 0.48])
        t += 0.5
    expected_duration = (
        sum(len(g) for g in groups) * 0.74 + (len(groups) - 1) * 0.5 + 0.24
    )
    assert abs(len(samples) / 48000 - expected_duration) < 1 / 48000 + 0.00001
    assert max(map(abs, samples)) <= 5243 and all(x == 0 for x in samples[-4800:])
    return {
        "duration": len(samples) / 48000,
        "sampleRate": 48000,
        "tones": observed,
        "maxAmplitude": max(map(abs, samples)),
        "silentTail": True,
    }


def targets(g):
    return [
        F(2016, n)
        for n in {
            "enharmonic": [2016, 1944, 1890, 1512],
            "chromatic": [2016, 1944, 1792, 1512],
            "diatonic": [2016, 1944, 1701, 1512],
        }[g]
    ]


def groups(s):
    q = F(s["scale"], 12)
    actual = [
        F(s["reference"]) / (q * (1 - F(x, 2016))) for x in [0, s["x1"], s["x2"], 504]
    ]
    target = [F(s["reference"]) / q * r for r in targets(s["target"])]
    return [actual, target]


def normalized(s):
    return "".join(unicodedata.normalize("NFKC", s).split())


if "--upgrade" in sys.argv:
    upgraded = []
    for record in review["records"]:
        file = OUT / f"{record['engine']}-{record['mode']}-offline.html"
        html = file.read_text()
        parsed = Reading(html)
        assert parsed.scripts == [] and parsed.handlers == [] and parsed.remote == []
        assert len(parsed.images) == len(m["pages"]) and len(parsed.audio) == 2
        for actual, page in zip(parsed.images, m["pages"]):
            assert actual == (ROOT / "public" / page["file"]).read_bytes()
        for asset in m["assets"]:
            actual = (ROOT / "public" / asset["file"]).read_bytes()
            if asset["file"].endswith((".woff2", ".ttf")):
                assert base64.b64encode(actual).decode() in html
            else:
                from html import unescape

                assert actual.decode().replace("\r\n", "\n") in unescape(html), asset[
                    "file"
                ]
        native = json.loads(parsed.downloads["pyknon-helikon.json"])
        settings = native["state"]
        assert settings["x1"] == 72 and settings["x2"] == 126
        assert parsed.audio[1] == parsed.downloads["pyknon-helikon.wav"]
        sounds = [
            audio(
                parsed.audio[0],
                [
                    [
                        F(settings["reference"]) * F(4, 3),
                        F(settings["reference"]) * F(3, 2),
                    ]
                ],
            ),
            audio(parsed.audio[1], groups(settings)),
        ]
        upgraded.append(
            {
                "engine": record["engine"],
                "fault": record["mode"],
                "sourceImagesIdentical": len(parsed.images),
                "nativeDownloads": len(parsed.downloads),
                "sounds": sounds,
                "file": signature(file.read_bytes()),
            }
        )
    (OUT / "artifacts.json").write_text(
        json.dumps({"upgradedReadings": upgraded}, indent=2) + "\n"
    )
    print(
        json.dumps(
            {
                "actualOfflineReadings": len(upgraded),
                "sourceImagesIdenticalPerReading": 8,
                "nativeDownloadsPerReading": 5,
                "measuredTones": sum(
                    len(a["tones"]) for r in upgraded for a in r["sounds"]
                ),
            },
            indent=2,
        )
    )
    sys.exit(0)


records = []
for record in review["records"]:
    d = OUT / f"{record['engine']}-{record['width']}"
    native = json.loads((d / "study.json").read_text())
    s = native["state"]
    html = (d / "study.html").read_text()
    parsed = Reading(html)
    assert parsed.scripts == [] and parsed.handlers == [] and parsed.remote == []
    assert len(parsed.images) == len(m["pages"]) and len(parsed.audio) == 2
    for actual, p in zip(parsed.images, m["pages"]):
        assert actual == (ROOT / "public" / p["file"]).read_bytes()
    for font in [
        "IBMPlexSans-Regular.woff2",
        "IBMPlexSans-SemiBold.woff2",
        "NotoSerif-Regular.ttf",
    ]:
        b = (ROOT / "public/fonts" / font).read_bytes()
        assert base64.b64encode(b).decode() in html
    for file in [
        "public/fonts/IBMPlex-OFL.txt",
        "public/fonts/NotoSerif-OFL.txt",
        "LICENSE",
    ]:
        # Parsed text unescapes the complete preserved licenses.
        import html as htmlmodule

        assert (ROOT / file).read_text() in htmlmodule.unescape(html)
    assert json.loads(parsed.downloads["pyknon-helikon.json"]) == native
    assert parsed.downloads["pyknon-helikon.csv"] == (d / "study.csv").read_bytes()
    assert parsed.downloads["pyknon-helikon.wav"] == (d / "study.wav").read_bytes()
    assert (
        parsed.downloads["pyknon-helikon-interval.wav"]
        == (d / "interval.wav").read_bytes()
    )
    assert parsed.downloads["pyknon-helikon.svg"] == (d / "reopened.svg").read_bytes()
    svg = ET.fromstring(parsed.downloads["pyknon-helikon.svg"])
    assert not svg.findall(".//{http://www.w3.org/2000/svg}script")
    assert (
        base64.b64encode(
            (ROOT / "public/fonts/IBMPlexSans-Regular.woff2").read_bytes()
        ).decode()
        in parsed.downloads["pyknon-helikon.svg"].decode()
    )
    rows = list(csv.DictReader(io.StringIO((d / "study.csv").read_text())))
    assert len(rows) == 11
    for i, row in enumerate(rows[7:]):
        x = F([0, s["x1"], s["x2"], 504][i], 504)
        length = F(s["scale"], 12) * (1 - x / 4)
        assert (
            F(row["lateral_position"]) == x
            and F(row["sounding_length_fraction"]) == length
            and F(row["actual_frequency_ratio"]) == F(s["scale"], 12) / length
            and F(row["target_frequency_ratio"]) == targets(s["target"])[i]
        )
    sounds = [{"file": "study.wav", **audio((d / "study.wav").read_bytes(), groups(s))}]
    # The retained selected pair is HK -> GM at the original bridge.
    assert s["bridge"] == 12 and s["pair"] == 3
    sounds.append(
        {
            "file": "interval.wav",
            **audio(
                (d / "interval.wav").read_bytes(),
                [[F(s["reference"]) * F(4, 3), F(s["reference"]) * F(3, 2)]],
            ),
        }
    )
    for w in record["waves"]:
        sounds.append(
            {
                "file": w["file"],
                **audio((d / w["file"]).read_bytes(), groups({**s, **w})),
            }
        )
    cached = set(record["cache"]["files"])
    expected = {
        "/pyknon/" + str(p.relative_to(ROOT / "dist"))
        for p in (ROOT / "dist").rglob("*")
        if p.is_file() and p.name != "sw.js"
    }
    assert cached == expected, (expected - cached, cached - expected)
    records.append(
        {
            "engine": record["engine"],
            "width": record["width"],
            "sourceImagesIdentical": len(parsed.images),
            "fontsIdentical": 3,
            "completeLicenses": 3,
            "scriptFreeNativeDownloads": len(parsed.downloads),
            "cacheFiles": len(cached),
            "sounds": sounds,
            "savedFiles": {
                p.name: signature(p.read_bytes())
                for p in d.iterdir()
                if p.is_file()
                and p.suffix in [".html", ".json", ".svg", ".csv", ".wav", ".pdf"]
            },
        }
    )
pdf = OUT / "chromium-1440/reading.pdf"
text = subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"]).decode()
pdf_info = subprocess.check_output(["pdfinfo", str(pdf)], text=True)
tagged = any(line.split(":", 1)[1].strip() == "yes" for line in pdf_info.splitlines() if line.startswith("Tagged:"))
assert tagged, "The retained PDF must contain document tags."
for path in ["LICENSE", "public/fonts/IBMPlex-OFL.txt", "public/fonts/NotoSerif-OFL.txt"]:
    assert normalized((ROOT / path).read_text()) in normalized(text), path
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(["pdfimages", "-j", str(pdf), str(pathlib.Path(tmp) / "source")], check=True)
    source_images = list(pathlib.Path(tmp).glob("*.jpg"))
    assert len(source_images) == len(m["pages"])
    assert {hashlib.sha256(p.read_bytes()).hexdigest() for p in source_images} == {p["sha256"] for p in m["pages"]}
bbox = subprocess.check_output(["pdftotext", "-bbox", str(pdf), "-"])
doc = ET.fromstring(bbox)
pages = doc.findall(".//{http://www.w3.org/1999/xhtml}page")
words = doc.findall(".//{http://www.w3.org/1999/xhtml}word")
for p in pages:
    width = float(p.attrib["width"])
    height = float(p.attrib["height"])
    for w in p:
        if w.tag.endswith("word"):
            assert (
                float(w.attrib["xMin"]) >= 20
                and float(w.attrib["xMax"]) <= width - 20
                and float(w.attrib["yMin"]) >= 20
                and float(w.attrib["yMax"]) <= height - 20
            ), w.attrib
# All source captions and every complete instructional language field must survive print.
content = json.loads(
    subprocess.check_output(
        [
            "node",
            "--import",
            "tsx",
            "-e",
            "import('./src/helikon-content.ts').then(m=>console.log(JSON.stringify(m.HELIKON_READINGS)))",
        ]
    ).decode()
)
fields = []
for p in content:
    for key in ["title", "greek", "latin", "english", "note"]:
        fields.append(p[key])
    for word in p["words"]:
        fields.extend(word)
for field in fields:
    assert normalized(field) in normalized(text), field
for p in m["pages"]:
    assert normalized(
        f"Wallis, 1682 · {'title' if p['id'] == 'title' else 'printed p.' + p['id']} · PDF p.{p['pdfPage']} · complete page"
    ) in normalized(text), p["id"]
result = {
    "browserArtifacts": records,
    "pdf": {
        "pages": len(pages),
        "completeLanguageFields": len(fields),
        "sourceCaptions": len(m["pages"]),
        "wordsWithinMargins": len(words),
        "tagged": tagged,
        "completeLicenses": 3,
        "originalJpegStreamsIdentical": len(m["pages"]),
        "physicalPrintingVerified": False,
    },
}
(OUT / "artifacts.json").write_text(json.dumps(result, indent=2) + "\n")
print(
    json.dumps(
        {
            "browserJourneys": len(records),
            "pdf": result["pdf"],
            "wavFiles": sum(len(r["sounds"]) for r in records),
            "measuredTones": sum(len(a["tones"]) for r in records for a in r["sounds"]),
        },
        indent=2,
    )
)
