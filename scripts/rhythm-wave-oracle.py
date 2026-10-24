"""Inspect actual browser-exported WAVs against independent literal schedules."""
import array
import json
import math
from pathlib import Path
import statistics
import sys
import wave

folder = Path(sys.argv[1])
results = []
for filename, centiseconds, pitches in [
    ("comparison.wav", [12, 102, 192, 282, 417, 477, 597, 657], [720, 480] * 4),
    ("between.wav", [12, 72, 117, 177], [480, 720] * 2),
]:
    with wave.open(str(folder / filename), "rb") as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2 and w.getframerate() == 48000
        rate = w.getframerate()
        data = array.array("h", w.readframes(w.getnframes()))
        if sys.byteorder != "little":
            data.byteswap()
    assert max(abs(v) for v in data) <= 5244
    active = [i for i, value in enumerate(data) if abs(value) > 8]
    starts = []
    previous = -10**9
    for sample in active:
        if sample - previous > rate * .03:
            starts.append(sample)
        previous = sample
    assert len(starts) == len(centiseconds), (filename, len(starts))
    measurements = []
    for index, (centisecond, expected_hz) in enumerate(zip(centiseconds, pitches, strict=True)):
        expected_start = centisecond / 100
        actual_start = starts[index] / rate
        # Audible threshold follows the scheduled start by a few ramp samples.
        assert 0 <= actual_start - expected_start < .0005, (filename, index, actual_start, expected_start)
        lo, hi = math.ceil((expected_start + .026) * rate), math.floor((expected_start + .052) * rate)
        crosses = []
        for sample in range(lo, hi - 1):
            if data[sample] <= 0 < data[sample + 1]:
                crosses.append(sample + (-data[sample]) / (data[sample + 1] - data[sample]))
        measured_hz = rate / statistics.mean(b-a for a,b in zip(crosses,crosses[1:]))
        assert abs(measured_hz - expected_hz) < .01, (filename, index, measured_hz, expected_hz)
        measurements.append({"marker": index+1, "expectedStartSeconds": expected_start, "thresholdOnsetSeconds": actual_start, "onsetDifferenceSeconds": actual_start-expected_start, "expectedHz": expected_hz, "measuredHz": measured_hz, "frequencyErrorHz": abs(measured_hz-expected_hz)})
    results.append({"file": filename,"sampleRate":rate,"frames":len(data),"markers":measurements})
print(json.dumps({"method":"Independent literal default joined-portion schedules; 16-bit PCM onset threshold >8 and interpolated positive zero crossings within the flat envelope", "scope":"Synthetic browser WAV samples, not device latency, ancient performance or listener perception", "results":results},indent=2))
