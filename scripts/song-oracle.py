"""Check sign-derived plans against an independently authored LilyPond score.

The small reader covers the syntax of the retained, unmodified music block.
It does not import app data, pitch mappings, syllables or timing functions.
With a browser report argument, additionally measure exported native PCM.
"""
import array
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import wave

REFERENCE = Path(__file__).resolve().parents[1] / "tests/fixtures/seikilos-reference.ly"


def reference():
    text = REFERENCE.read_text()
    music = text.split("\\relative c''{")[1].split("}")[0]
    tokens = re.findall(r"[a-g](?:is|es)?[',]*(?:\d+)?\.?|[()]", music)
    # LilyPond relative mode chooses the nearest diatonic pitch, then applies
    # explicit octave marks. c'' starts at middle C's next octave (MIDI 72).
    previous = 35
    duration = 4
    syllable = 0
    slur = False
    elapsed = 0
    events = []
    natural = [0, 2, 4, 5, 7, 9, 11]
    for i, token in enumerate(tokens):
        if token == "(":
            slur = True
            continue
        if token == ")":
            slur = False
            syllable += 1
            continue
        match = re.fullmatch(r"([a-g])(is|es)?([',]*)(\d+)?(\.?)", token)
        assert match, token
        letter, accidental, octave_marks, written_duration, dot = match.groups()
        step = "cdefgab".index(letter)
        candidate = previous // 7 * 7 + step
        while candidate - previous > 3:
            candidate -= 7
        while previous - candidate > 3:
            candidate += 7
        candidate += 7 * (octave_marks.count("'") - octave_marks.count(","))
        previous = candidate
        midi = 12 * (candidate // 7 + 1) + natural[step] + (1 if accidental == "is" else -1 if accidental == "es" else 0)
        if written_duration:
            duration = int(written_duration)
        units = 8 / duration * (1.5 if dot else 1)
        events.append({"midi": midi, "units": units, "unit_start": elapsed, "syllable": syllable})
        elapsed += units
        opens_slur = i + 1 < len(tokens) and tokens[i + 1] == "("
        if not slur and not opens_slur:
            syllable += 1
    assert len(events) == 37 and elapsed == 48 and syllable == 29
    return events


def check_plans(cases, score):
    comparisons = 0
    for case in cases:
        assert len(case["events"]) == len(score)
        for actual, expected in zip(case["events"], score):
            hz = case["root"] * 2 ** ((expected["midi"] - 69) / 12)
            assert actual["syllable"] == expected["syllable"]
            assert actual["units"] == expected["units"]
            assert actual["unitStart"] == expected["unit_start"]
            assert abs(actual["tone"]["hz"] - hz) < 1e-10
            assert abs(actual["tone"]["start"] - (0.12 + expected["unit_start"] * 60 / case["pace"])) < 1e-10
            comparisons += 5
    return {"settings": len(cases), "comparisons": comparisons}


def check_audio(report_path, score):
    report = json.loads(report_path.read_text())
    results = []
    for item in report["audio"]:
        path = report_path.parent / item["file"]
        assert hashlib.sha256(path.read_bytes()).hexdigest() == item["sha256"]
        with wave.open(str(path), "rb") as wav:
            rate = wav.getframerate()
            assert (wav.getnchannels(), wav.getsampwidth(), rate) == (1, 2, 48000)
            data = array.array("h", wav.readframes(wav.getnframes()))
            if sys.byteorder != "little":
                data.byteswap()
        notes = [e for e in score if int(e["unit_start"] // 12) == item["verse"]]
        unit = 60 / item["pace"]
        expected_duration = 0.12 + 12 * unit - 0.025 + 0.2
        assert abs(len(data) / rate - expected_duration) <= 1 / rate
        peak = max(abs(s) for s in data) / 32767
        assert 0.159 < peak <= 0.1601
        errors = []
        for note in notes:
            start = 0.12 + (note["unit_start"] - item["verse"] * 12) * unit
            end = start + note["units"] * unit - 0.025
            lo, hi = round((start + 0.06) * rate), round((end - 0.08) * rate)
            crossings = [i - data[i] / (data[i+1] - data[i]) for i in range(lo, hi-1) if data[i] <= 0 < data[i+1]]
            assert len(crossings) > 15
            measured = (len(crossings)-1) * rate / (crossings[-1]-crossings[0])
            expected = item["root"] * 2 ** ((note["midi"] - 69) / 12)
            error = abs(1200 * math.log2(measured / expected))
            assert error < 0.02, (item["file"], note, expected, measured, error)
            errors.append(error)
            assert max(abs(v) for v in data[round(start*rate):round((start+0.005)*rate)]) < 0.05 * 32767
            assert max(abs(v) for v in data[round((end-0.005)*rate):round(end*rate)]) < 0.015 * 32767
            assert all(v == 0 for v in data[math.ceil(end*rate)+2:math.floor((end+0.02)*rate)-2])
        assert all(v == 0 for v in data[:math.floor(0.12*rate)])
        assert all(v == 0 for v in data[math.ceil((expected_duration-0.2)*rate)+2:])
        results.append({"file": item["file"], "tones": len(notes), "duration_seconds": len(data)/rate, "peak": peak, "maximum_error_cents": max(errors)})
    return {"files": len(results), "measured_tones": sum(r["tones"] for r in results), "maximum_error_cents": max(r["maximum_error_cents"] for r in results), "tolerance_cents": 0.02, "results": results}


if __name__ == "__main__":
    score = reference()
    result = {"source": "Chinasaur's public-domain LilyPond score, independently parsed; pitches and durations cross-checked visually with D'Angour's transcription", "reference_sha256": hashlib.sha256(REFERENCE.read_bytes()).hexdigest(), "notes": len(score), "syllables": 29, "short_units": 48}
    if len(sys.argv) > 1:
        result["audio"] = check_audio(Path(sys.argv[1]), score)
    else:
        result["plans"] = check_plans(json.load(sys.stdin), score)
    print(json.dumps(result, indent=2))
