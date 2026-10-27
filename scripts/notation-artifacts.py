#!/usr/bin/env python3
"""Inspect actual desk downloads using independent fractions, PCM and HTML/XML.

python3 scripts/notation-artifacts.py BROWSER_OUTPUT [RECEIPT_JSON]
Standard-library Python and Poppler pdfinfo/pdfimages/pdftotext are required.
No app TypeScript or audio-plan output is used to calculate the expected notes.
"""

import base64
import csv
from collections import Counter
from fractions import Fraction
import hashlib
from html.parser import HTMLParser
import io
import json
import math
from pathlib import Path
import re
import struct
import subprocess
import sys
from urllib.parse import unquote_to_bytes
import wave
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / "public/sources/notation/manifest.json").read_text())
# Manual reference to the selected Jan p369 rows, with the declared modern
# interval model independently expressed as rational numbers and semitone steps.
ROWS = {
    "hypate-meson": (5, "sigma", "sigma", Fraction(3, 4), -5),
    "parhypate-meson": (6, "rho", "turned-sigma", Fraction(64, 81), -4),
    "diatonos-meson": (7, "mu", "pi", Fraction(8, 9), -2),
    "mese": (8, "iota", "side-lambda", Fraction(1), 0),
    "nete-synemmenon": (11, "square-u", "zeta", Fraction(4, 3), 5),
    "paramese": (12, "zeta", "bracket", Fraction(9, 8), 2),
    "trite-diezeugmenon": (13, "epsilon", "square-u", Fraction(32, 27), 3),
    "diatonos-diezeugmenon": (14, "square-u", "zeta", Fraction(4, 3), 5),
    "nete-diezeugmenon": (15, "side-phi", "slant-eta", Fraction(3, 2), 7),
}
EXERCISES = {
    "bridge": ["mese", "paramese", "nete-synemmenon", "mese"],
    "steps": ["hypate-meson", "parhypate-meson", "diatonos-meson", "mese"],
    "functions": ["nete-synemmenon", "diatonos-diezeugmenon", "paramese", "trite-diezeugmenon"],
}
FRAMES = {
    "sigma": ("sigma", [5], ["hypatē mesōn"], Fraction(3, 4), -5, [8], ["mesē"], Fraction(1), 0),
    "iota": ("side-lambda", [8], ["mesē"], Fraction(1), 0, [11, 14], ["nētē synēmmenōn", "diezeugmenōn diatonos"], Fraction(4, 3), 5),
    "zeta": ("bracket", [12], ["paramesē"], Fraction(9, 8), 2, [15], ["nētē diezeugmenōn"], Fraction(3, 2), 7),
    "square-u": ("zeta", [11, 14], ["nētē synēmmenōn", "diezeugmenōn diatonos"], Fraction(4, 3), 5, [17], ["hyperbolaiōn diatonos"], Fraction(16, 9), 10),
}


def frame_values(state):
    instrumental, lrows, lnames, lr, ls, hrows, hnames, hr, hs = FRAMES[state["frameSign"]]
    r = state["reference"]
    lratio, hratio = (float(lr), float(hr)) if state["tuning"] == "pythagorean" else (2 ** (ls / 12), 2 ** (hs / 12))
    hmese = r * (float(lr / hr) if state["tuning"] == "pythagorean" else 2 ** ((ls - hs) / 12)) if state["frameAnchor"] == "sign" else r
    return [
        {"table": "Lydian", "rows": lrows, "names": lnames, "page": "369", "mese": r, "sign": r * lratio, "ratio": f"{lr.numerator}/{lr.denominator}" if state["tuning"] == "pythagorean" else f"2^({ls}/12)"},
        {"table": "Hypolydian", "rows": hrows, "names": hnames, "page": "370", "mese": hmese, "sign": r * lratio if state["frameAnchor"] == "sign" else r * hratio, "ratio": f"{hr.numerator}/{hr.denominator}" if state["tuning"] == "pythagorean" else f"2^({hs}/12)"},
    ]


def check_frame_csv(data, state):
    rows = list(csv.DictReader(io.StringIO(data.decode())))
    assert len(rows) == 2
    for actual, expected in zip(rows, frame_values(state)):
        assert actual["table_context"] == expected["table"]
        assert actual["vocal_sign"] == state["frameSign"]
        assert actual["instrumental_sign"] == FRAMES[state["frameSign"]][0]
        assert actual["possible_functions"] == " | ".join(expected["names"])
        assert actual["printed_rows"] == " | ".join(map(str, expected["rows"]))
        assert actual["source_printed_page"] == expected["page"]
        assert actual["anchor_choice"] == state["frameAnchor"]
        assert actual["sign_ratio_to_context_mese"] == expected["ratio"]
        assert math.isclose(float(actual["context_mese_hz_approx"]), expected["mese"], abs_tol=1e-9)
        assert math.isclose(float(actual["sign_hz_approx"]), expected["sign"], abs_tol=1e-9)
    return rows


def sha(data):
    return hashlib.sha256(data).hexdigest()


def data_url(value):
    header, body = value.split(",", 1)
    assert header.startswith("data:")
    return base64.b64decode(body, validate=True) if ";base64" in header else unquote_to_bytes(body)


def frequency(name, state):
    row = ROWS[name]
    ratio = float(row[3]) if state["tuning"] == "pythagorean" else 2 ** (row[4] / 12)
    return state["reference"] * ratio


def written_candidates(sign, state):
    column = 2 if state["given"] == "vocal" else 1
    return [name for name, row in ROWS.items() if row[column] == sign] if sign else []


def check_csv(data, state):
    actual = list(csv.DictReader(io.StringIO(data.decode())))
    targets = EXERCISES[state["exercise"]]
    assert len(actual) == len(targets) == 4
    for i, (entry, name) in enumerate(zip(actual, targets)):
        row = ROWS[name]
        sign = state["answers"][i]
        candidates = written_candidates(sign, state)
        target = frequency(name, state)
        assert entry["target_function"] == name
        assert int(entry["target_printed_row"]) == row[0]
        assert entry["given_alphabet"] == state["given"]
        assert entry["given_sign"] == row[1 if state["given"] == "vocal" else 2]
        assert entry["written_sign"] == (sign or "")
        assert entry["possible_written_functions"] == " | ".join(candidates)
        assert math.isclose(float(entry["target_hz_approx"]), target, abs_tol=1e-9)
        assert entry["source"] == "Jan 1895 p369"
        if candidates:
            pitches = [frequency(c, state) for c in candidates]
            assert all(p == pitches[0] for p in pitches)
            expected = (ROWS[candidates[0]][3] == row[3]) if state["tuning"] == "pythagorean" else (ROWS[candidates[0]][4] == row[4])
            assert entry["pitch_preserved_in_model"] == str(expected).lower()
            assert math.isclose(float(entry["written_hz_approx"]), pitches[0], abs_tol=1e-9)
            assert math.isclose(float(entry["difference_cents_approx"]), 1200 * math.log2(pitches[0] / target), abs_tol=1e-9)
        else:
            assert entry["written_hz_approx"] == entry["difference_cents_approx"] == ""
            assert entry["pitch_preserved_in_model"] == "false"
    return actual


def check_wave(data, state):
    with wave.open(io.BytesIO(data)) as audio:
        assert (audio.getnchannels(), audio.getsampwidth(), audio.getframerate()) == (1, 2, 48000)
        samples = struct.unpack(f"<{audio.getnframes()}h", audio.readframes(audio.getnframes()))
    silent = []
    if state["sound"] == "frame":
        assert len(samples) == 81600
        expected = [(i * 0.9, context["sign"]) for i, context in enumerate(frame_values(state))]
    else:
        assert state["sound"] == "line" and len(samples) == 326400
        expected = [(i * 0.75, frequency(name, state)) for i, name in enumerate(EXERCISES[state["exercise"]])]
        for i, sign in enumerate(state["answers"]):
            candidates = written_candidates(sign, state)
            if candidates:
                expected.append((3.6 + i * 0.75, frequency(candidates[0], state)))
            else:
                silent.append(3.6 + i * 0.75)
    observed = []
    for start, hz in expected:
        low, high = round((start + 0.12) * 48000), round((start + 0.45) * 48000)
        crossings = []
        for i in range(low, high - 1):
            a, b = samples[i:i + 2]
            if a <= 0 < b:
                crossings.append(i + (-a) / (b - a))
        measured = 48000 * (len(crossings) - 1) / (crossings[-1] - crossings[0])
        assert abs(measured - hz) < 0.03, (start, hz, measured)
        rms = math.sqrt(sum((v / 32768) ** 2 for v in samples[low:high]) / (high - low))
        assert abs(rms - 0.16 / math.sqrt(2)) < 0.001
        observed.append({"startSeconds": start, "expectedHz": hz, "observedHz": measured})
    for start in silent:
        assert all(v == 0 for v in samples[round(start * 48000):round((start + 0.6) * 48000)])
    assert max(abs(v) for v in samples) <= 5243
    assert all(v == 0 for v in samples[-4800:])
    return {"samples": len(samples), "channels": 1, "sampleRate": 48000, "tones": observed, "timedSilentSlots": len(silent), "tailSilent": True}


class Reading(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.images, self.downloads, self.audio = [], {}, []
        self.scripts, self.handlers = 0, []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.handlers += [key for key in a if key.startswith("on")]
        if tag == "script":
            self.scripts += 1
        if tag == "img" and a.get("src", "").startswith("data:image/jpeg"):
            self.images.append(data_url(a["src"]))
        if tag == "a" and "download" in a:
            self.downloads[a["download"]] = data_url(a["href"])
        if tag == "audio":
            self.audio.append(data_url(a["src"]))
        if tag in ["img", "audio"]:
            assert a.get("src", "").startswith("data:")


def check_svg(data, native):
    svg = ET.fromstring(data)
    metadata = json.loads(svg.find("{http://www.w3.org/2000/svg}metadata").text)
    assert metadata["native"] == native
    assert metadata["codeLicense"].replace("\r\n", "\n") == (ROOT / "LICENSE").read_text()
    assert metadata["fontLicense"].replace("\r\n", "\n") == (ROOT / "public/fonts/IBMPlex-OFL.txt").read_text()
    font = re.search(rb"data:font/woff2;base64,([A-Za-z0-9+/=]+)", data)[1]
    assert base64.b64decode(font) == (ROOT / "public/fonts/IBMPlexSans-Regular.woff2").read_bytes()
    slots = svg.findall(".//*[@data-slot]")
    assert len(slots) == 4
    assert [n.attrib["data-written-sign"] for n in slots] == [s or "blank" for s in native["state"]["answers"]]
    assert [int(n.attrib["data-printed-row"]) for n in svg.findall(".//*[@data-printed-row]")] == [row[0] for row in ROWS.values()]
    assert not svg.findall(".//{http://www.w3.org/2000/svg}script")
    return {"slots": len(slots), "printedRows": len(ROWS), "fontByteIdentical": True, "fullNotices": True}


def check_frame_svg(data, state):
    svg = ET.fromstring(data)
    metadata = json.loads(svg.find("{http://www.w3.org/2000/svg}metadata").text)
    assert metadata["state"] == state
    assert metadata["codeLicense"].replace("\r\n", "\n") == (ROOT / "LICENSE").read_text()
    assert metadata["fontLicense"].replace("\r\n", "\n") == (ROOT / "public/fonts/IBMPlex-OFL.txt").read_text()
    font = re.search(rb"data:font/woff2;base64,([A-Za-z0-9+/=]+)", data)[1]
    assert base64.b64decode(font) == (ROOT / "public/fonts/IBMPlexSans-Regular.woff2").read_bytes()
    contexts = svg.findall(".//*[@data-table]")
    assert len(contexts) == 2
    for actual, expected in zip(contexts, frame_values(state)):
        assert actual.attrib["data-source-rows"] == " ".join(map(str, expected["rows"]))
        sign = actual.find(".//*[@data-frame-sign-hz]")
        mese = actual.find(".//*[@data-frame-mese-hz]")
        assert math.isclose(float(sign.attrib["data-frame-sign-hz"]), expected["sign"], abs_tol=1e-9)
        assert math.isclose(float(mese.attrib["data-frame-mese-hz"]), expected["mese"], abs_tol=1e-9)
    return {"tableContexts": 2, "sourceRowsPreserved": True, "fontByteIdentical": True, "referenceConstraintRetained": state["frameAnchor"]}


def check_reading(text, native, folder=None):
    reading = Reading(text)
    assert reading.scripts == 0 and reading.handlers == []
    assert "default-src 'none'" in text
    assert len(reading.images) == len(MANIFEST["pages"]) == 5
    for image, entry in zip(reading.images, MANIFEST["pages"]):
        assert image == (ROOT / "public" / entry["file"]).read_bytes()
        assert len(image) == entry["bytes"] and sha(image) == entry["sha256"]
    font_data = re.findall(r"data:font/(?:woff2|ttf);base64,([A-Za-z0-9+/=]+)", text)
    assert {sha(base64.b64decode(f)) for f in font_data} == {a["sha256"] for a in MANIFEST["assets"] if a["file"].endswith((".woff2", ".ttf"))}
    # Compare actual native browser downloads with the files offered by the
    # script-free reading, not just with a declared example or reconstructed state.
    if folder is not None:
        for suffix in ["json", "csv", "svg", "wav"]:
            assert reading.downloads[f"pyknon-notation.{suffix}"] == (folder / f"translation.{suffix}").read_bytes()
        for suffix in ["csv", "svg"]:
            assert reading.downloads[f"pyknon-notation-tables.{suffix}"] == (folder / f"tables.{suffix}").read_bytes()
    assert json.loads(reading.downloads["pyknon-notation-sources.json"]) == MANIFEST
    assert json.loads(reading.downloads["pyknon-notation.json"]) == native
    assert reading.audio == [reading.downloads["pyknon-notation.wav"]]
    for file in ["LICENSE", "public/fonts/IBMPlex-OFL.txt", "public/fonts/NotoSerif-OFL.txt"]:
        from html import unescape
        assert (ROOT / file).read_text() in unescape(text).replace("\r\n", "\n")
    return {"wholeSourceImagesByteIdentical": 5, "fontsVerified": 3, "fullLicensesVerified": 3, "nativeDownloads": len(reading.downloads), "scripts": 0}


def check_upgrade(output, receipt_file):
    records = []
    for file in sorted(output.glob("*-offline.html")):
        if not re.fullmatch(r"(?:chromium|firefox)-(?:hold|wrong)-offline.html", file.name):
            continue
        text = file.read_text()
        reading = Reading(text)
        native = json.loads(reading.downloads["pyknon-notation.json"])
        state = native["state"]
        assert state["answers"] == ["side-lambda", "bracket", "zeta", "side-lambda"]
        assert state["sound"] == "frame" and state["sourceContext"] == "frame" and state["page"] == "370"
        content = check_reading(text, native)
        check_csv(reading.downloads["pyknon-notation.csv"], state)
        check_svg(reading.downloads["pyknon-notation.svg"], native)
        check_frame_csv(reading.downloads["pyknon-notation-tables.csv"], state)
        check_frame_svg(reading.downloads["pyknon-notation-tables.svg"], state)
        sound = check_wave(reading.downloads["pyknon-notation.wav"], state)
        records.append({"file": file.name, "sha256": sha(file.read_bytes()), "reading": content, "audio": sound})
    assert len(records) == 4
    receipt = {"scope": "Actual illustrated HTML downloaded after the recorded held/substituted-source upgrades and origin outage; independent model, PCM and source/font/license checks", "records": records}
    receipt_file.write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt, indent=2))


def main():
    output = Path(sys.argv[1])
    records = []
    for folder in sorted(p for p in output.iterdir() if p.is_dir() and re.fullmatch(r"(?:chromium|firefox)-(?:1440|375)", p.name)):
        native = json.loads((folder / "translation.json").read_text())
        assert native["state"]["answers"] == ["side-lambda", "zeta", "square-u", "side-lambda"]
        csv_rows = check_csv((folder / "translation.csv").read_bytes(), native["state"])
        assert [r["pitch_preserved_in_model"] for r in csv_rows] == ["true", "false", "false", "true"]
        svg = check_svg((folder / "translation.svg").read_bytes(), native)
        corrected = {**native["state"], "answers": ["side-lambda", "bracket", "zeta", "side-lambda"]}
        assert all(r["pitch_preserved_in_model"] == "true" for r in check_csv((folder / "corrected.csv").read_bytes(), corrected))
        reading = check_reading((folder / "translation.html").read_text(), native, folder)
        check_reading((folder / "offline.html").read_text(), native, folder)
        assert json.loads((folder / "from-reading.json").read_text()) == native
        audio = {}
        for variant in ["translation", "equal", "blank"]:
            record = json.loads((folder / f"{variant}.json").read_text())
            assert record["format"] == "pyknon-notation" and record["version"] == 1
            assert record["state"]["sound"] == "line"
            if variant != "translation":
                assert (record["state"]["tuning"], record["state"]["reference"]) == ("equal", 440)
                assert record["state"]["answers"] == ([None] * 4 if variant == "blank" else corrected["answers"])
            check_csv((folder / f"{variant}.csv").read_bytes(), record["state"])
            audio[variant] = check_wave((folder / f"{variant}.wav").read_bytes(), record["state"])
        assert audio["blank"]["timedSilentSlots"] == 4
        frames = []
        check_frame_csv((folder / "tables.csv").read_bytes(), native["state"])
        check_frame_svg((folder / "tables.svg").read_bytes(), native["state"])
        for variant, anchor in [("held", "sign"), ("moved", "mese")]:
            record = json.loads((folder / f"{variant}.json").read_text())
            assert record["state"]["sound"] == "frame" and record["state"]["frameAnchor"] == anchor
            check_frame_csv((folder / f"{variant}.csv").read_bytes(), record["state"])
            plate = check_frame_svg((folder / f"{variant}.svg").read_bytes(), record["state"])
            sound = check_wave((folder / f"{variant}.wav").read_bytes(), record["state"])
            frames.append({"anchor": anchor, "pair": record["state"]["frameSign"], "svg": plate, "audio": sound})
        records.append({"case": folder.name, "actualSavedMistakes": 2, "svg": svg, "reading": reading, "offlineNativeEquivalent": True, "audio": audio, "twoTableComparisons": frames})
    assert len(records) == 4
    pdf = output / "chromium-1440/translation.pdf"
    info = subprocess.check_output(["pdfinfo", str(pdf)], text=True)
    images = subprocess.check_output(["pdfimages", "-list", str(pdf)], text=True)
    dimensions = [(int(p[3]), int(p[4])) for line in images.splitlines()[2:] if len(p := line.split()) > 5]
    expected = [(p["width"], p["height"]) for p in MANIFEST["pages"]]
    assert not (Counter(expected) - Counter(dimensions)), (expected, dimensions)
    text = subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"], text=True)
    assert "Change the signs." in text and "λέξεως" in text and "κρούσεως" in text
    assert "JavaScript:      no" in info
    receipt = {"scope": "Actual downloaded CSV, SVG, WAV, HTML and PDF; independent fractions, PCM zero-crossing measurements, native file and retained source/font/license identities. No physical sound output or printer claim.", "records": records, "pdf": {"pages": int(re.search(r"Pages:\s+(\d+)", info)[1]), "sourceImageDimensionsRetained": expected, "javascript": False, "sha256": sha(pdf.read_bytes())}}
    if len(sys.argv) > 2:
        Path(sys.argv[2]).write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    if sys.argv[1] == "--upgrade":
        check_upgrade(Path(sys.argv[2]), Path(sys.argv[3]))
    else:
        main()
