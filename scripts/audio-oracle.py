"""Measure browser-exported PCM without using the app's tone plan or DSP code."""
import array
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import sys
import wave

report_path = Path(sys.argv[1])
report = json.loads(report_path.read_text())
lengths = {"enharmonic": (2016, 1944, 1890, 1512), "chromatic": (2016, 1944, 1792, 1512), "diatonic": (2016, 1944, 1701, 1512)}
results = []
for item in report["audio"]:
    path = report_path.parent / item["file"]
    assert hashlib.sha256(path.read_bytes()).hexdigest() == item["sha256"]
    with wave.open(str(path), "rb") as wav:
        assert (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) == (1, 2, 48000)
        data = array.array("h", wav.readframes(wav.getnframes()))
        if sys.byteorder != "little": data.byteswap()
    rate = 48000
    assert abs(len(data) / rate - 5.95) < 1 / rate
    peak = max(abs(s) for s in data) / 32767
    assert 0.159 < peak <= 0.1601
    root = item["root"]
    ratios = [Fraction(2016, n) for n in lengths[item["genus"]]]
    original = [float(r * root) for r in ratios]
    rounded = [root * 2 ** (math.floor(12 * math.log2(float(r)) + 0.5) / 12) for r in ratios]
    if item["direction"] == "down": original.reverse(); rounded.reverse()
    measured = []
    active = [False] * len(data)
    for index, expected in enumerate(original + rounded):
        group, note = divmod(index, 4)
        start = 0.12 + group * 3.2 + note * 0.65
        # Positive zero-crossing interpolation in the steady middle of each tone.
        lo, hi = round((start + 0.08) * rate), round((start + 0.38) * rate)
        crossings = [i + (-data[i]) / (data[i+1] - data[i]) for i in range(lo, hi-1) if data[i] <= 0 < data[i+1]]
        assert len(crossings) > 25
        actual = (len(crossings)-1) * rate / (crossings[-1]-crossings[0])
        error = abs(1200 * math.log2(actual / expected))
        assert error < 0.02, (item["file"], index, actual, expected, error)
        measured.append({"note":index+1,"expected_hz":expected,"measured_hz":actual,"error_cents":error})
        for i in range(max(0,math.floor(start*rate)-2),min(len(data),math.ceil((start+0.48)*rate)+2)): active[i] = True
        # Both attack and release begin/end near zero; the envelope is not a hard cut.
        assert max(abs(data[i]) for i in range(round(start*rate),round((start+0.005)*rate))) < 0.05 * 32767
        assert max(abs(data[i]) for i in range(round((start+0.475)*rate),round((start+0.48)*rate))) < 0.015 * 32767
    assert all(sample == 0 for sample, sounding in zip(data,active) if not sounding), 'Silent gaps contain sound'
    results.append({**item,"peak":peak,"measurements":measured})
summary = {"method":"Python wave + interpolated positive zero crossings, independent source-number frequencies", "files":len(results),"measured_tones":sum(len(r['measurements']) for r in results),"maximum_error_cents":max(m['error_cents'] for r in results for m in r['measurements']),"tolerance_cents":0.02,"finite_duration_seconds":5.95,"silent_gaps_and_envelopes_checked":True,"results":results}
print(json.dumps(summary,indent=2))
