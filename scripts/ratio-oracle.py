"""Independent source-number oracle; does not import the TS interval definitions."""
from fractions import Fraction
import json
import math
import sys

# Visually transcribed from Wallis 1682, printed p. 63, prose and table.
LENGTHS = {
    "enharmonic": (2016, 1944, 1890, 1512),
    "chromatic": (2016, 1944, 1792, 1512),
    "diatonic": (2016, 1944, 1701, 1512),
}
errors = []
cases = 0
for line in sys.stdin:
    item = json.loads(line)
    state = item["state"]
    pitches = [Fraction(2016, n) * state["root"] for n in LENGTHS[state["genus"]]]
    for i, result in enumerate(item["notes"]):
        exact_ratio = pitches[i] / state["root"]
        assert result["ratio"] == [exact_ratio.numerator, exact_ratio.denominator]
        c = 1200 * math.log(float(exact_ratio), 2)
        key = math.floor(c / 100 + 0.5)
        assert result["key"] == key
        expected = {"hz": float(pitches[i]), "cents": c,
                    "keyboardHz": state["root"] * 2 ** (key / 12), "error": 100 * key - c}
        for field, value in expected.items():
            error = abs(result[field] - value)
            assert error < 1e-10, (state, i, field, error)
            errors.append(error)
    tones = item["plan"]["tones"]
    assert len(tones) == 8
    order = range(4) if state["direction"] == "up" else range(3, -1, -1)
    for group in range(2):
        for position, note in enumerate(order):
            tone = tones[group * 4 + position]
            assert tone["note"] == note
            assert tone["hz"] == item["notes"][note]["hz" if group == 0 else "keyboardHz"]
            assert abs(tone["start"] - (0.12 + 3.2 * group + 0.65 * position)) < 1e-12
            assert tone["duration"] == 0.48
    assert abs(item["plan"]["duration"] - 5.95) < 1e-12
    cases += 1
assert cases == 18
print(json.dumps({"source": "Wallis 1682 p. 63 source integers; Python Fraction and log", "cases": cases,
                  "numeric_comparisons": len(errors), "maximum_absolute_error": max(errors),
                  "tolerance": 1e-10, "exact_ratios_and_order": True}, indent=2))
