# /// script
# requires-python = ">=3.12,<3.15"
# dependencies = ["numpy==2.4.2", "scipy==1.17.1"]
# ///
"""Measure downloaded PCM against independent string eigenvalues."""
import hashlib
import json
import math
from pathlib import Path
import runpy
import sys
import wave

import numpy as np

physics = runpy.run_path(str(Path(__file__).with_name("trial-oracle.py")))
independent_frequency = physics["frequency"]
pairs = physics["PAIRS"]
report_file = Path(sys.argv[1])
report = json.loads(report_file.read_text())
rate = 48000
maximum_cents = 0.
maximum_residual = 0.
results = []


def measure(x, start, expected, duration=1.4):
    global maximum_cents
    signal = x[round((start + .08) * rate):round((start + duration - .1) * rate)]
    indices = np.flatnonzero((signal[:-1] <= 0) & (signal[1:] > 0))
    crossing = indices - signal[indices] / (signal[indices + 1] - signal[indices])
    assert len(crossing) > 25
    measured = (len(crossing) - 1) * rate / (crossing[-1] - crossing[0])
    error = abs(1200 * math.log2(measured / expected))
    maximum_cents = max(maximum_cents, error)
    assert error < .025, (measured, expected, error)
    return float(measured)


for config in report["configurations"]:
    references = {}
    for item in config["waves"]:
        file = report_file.parent / item["file"]
        assert hashlib.sha256(file.read_bytes()).hexdigest() == item["sha256"]
        with wave.open(str(file), "rb") as wav:
            assert (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) == (1, 2, rate)
            x = np.frombuffer(wav.readframes(wav.getnframes()), dtype="<i2").astype(float) / 32767
        expected = [2 * item["root"] * independent_frequency(item["string"], item["contrast"], a, b)
                    for a, b in pairs[item["test"]]]
        key = item["string"], item["test"], item["root"]
        peak = float(np.max(np.abs(x)))
        assert peak < .321
        mode = item["sound"]
        if mode == "compare":
            references[key] = [measure(x, .12, expected[0]), measure(x, 1.92, expected[1])]
            duration = 3.52
            active = [(.12, 1.52), (1.92, 3.32)]
            detail = {"expectedHz": expected, "measuredHz": references[key]}
        else:
            duration = 4.32
            active = [(.12, 4.12)]
            if mode == "control" or abs(expected[0] - expected[1]) < 1e-6:
                freqs = [measure(x, .12, expected[0], 4)]
            else:
                freqs = references[key]
            lo, hi = round(.3 * rate), round(3.95 * rate)
            t = np.arange(lo, hi, 3) / rate
            sample = x[lo:hi:3]
            design = np.column_stack([f(2 * np.pi * hz * t) for hz in freqs for f in (np.sin, np.cos)])
            coefficients = np.linalg.lstsq(design, sample, rcond=None)[0]
            amplitudes = [float(np.hypot(*coefficients[i:i + 2])) for i in range(0, len(coefficients), 2)]
            amplitude = .32 if len(freqs) == 1 else .16
            assert all(abs(a - amplitude) < .0002 for a in amplitudes), (file, amplitudes)
            residual = float(np.sqrt(np.mean((sample - design @ coefficients) ** 2)))
            assert residual < .0001, (file, residual)
            maximum_residual = max(maximum_residual, residual)
            detail = {"pcmReferenceHz": freqs, "fittedAmplitudes": amplitudes, "residualRms": residual}
        assert abs(len(x) - rate * duration) <= 1.000001
        mask = np.zeros(len(x), dtype=bool)
        for start, end in active:
            mask[max(0, math.floor(start * rate) - 2):min(len(x), math.ceil(end * rate) + 2)] = True
        assert np.all(x[~mask] == 0), (file, "Sound outside the finite intervals")
        results.append({"browser": config["browser"], "width": config["width"],
                        "file": item["file"], "sha256": item["sha256"], "peak": peak, **detail})
print(json.dumps({"method": "Independent grid eigenvalues; interpolated PCM zero crossings; sinusoidal fitting of simultaneous voices, with PCM reference frequencies; finite-duration and silence checks",
                  "wavFiles": len(results), "maximumFrequencyErrorCents": maximum_cents,
                  "maximumSimultaneousResidualRms": maximum_residual, "results": results}, indent=2))
