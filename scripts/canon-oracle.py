"""Independent exact progression and event oracle; no imports from the app.

Source control: Menge 1916, printed p. 171, visually read from the full scan.
The progression is computed independently as 9**n * 8**(6-n), then compared
with both the printed integers and the app's reduced frequency fractions.
"""
from decimal import Decimal, localcontext
from fractions import Fraction
import json
import math
import sys

data = json.load(sys.stdin)
printed = [262144, 294912, 331776, 373248, 419904, 472392, 531441]
checks = 0
maximum_hz_error = 0.0
for record in data:
    root = record["root"]
    for n, row in enumerate(record["steps"]):
        integer = 9**n * 8**(6-n)
        assert integer == printed[n] == row["source"]
        ratio = Fraction(integer, printed[0])
        assert Fraction(*row["ratio"]) == ratio
        expected = root * float(ratio)
        with localcontext() as ctx:
            ctx.prec = 60
            equal = float(Decimal(root) * (Decimal(2).ln() * Decimal(n) / 6).exp())
        maximum_hz_error = max(maximum_hz_error, abs(row["ratioHz"] - expected), abs(row["equalHz"] - equal))
        assert abs(row["ratioHz"] - expected) < 1e-10
        assert abs(row["equalHz"] - equal) < 1e-10
        assert abs(row["ratioCents"] - 1200 * math.log2(float(ratio))) < 1e-10
        assert row["equalCents"] == n * 200
        checks += 1
    end = record["comparison"]
    comma = Fraction(9, 8)**6 / 2
    assert Fraction(*end["comma"]) == comma == Fraction(3, 2)**12 / 2**7
    assert end["octaveInteger"] == 2 * printed[0]
    assert end["excessInteger"] == printed[-1] - 2 * printed[0] == 7153
    for plan in record["plans"]:
        n, mode = plan["step"], plan["sound"]
        expected_notes = list(range(n+1))*2 if mode == "walk" else [n,n]
        assert [t["note"] for t in plan["tones"]] == expected_notes
        for i, tone in enumerate(plan["tones"]):
            tuning = "ratios" if ((mode == "walk" and i <= n) or (mode != "walk" and i == 1)) else "keyboard"
            assert tone["tuning"] == tuning
            r = Fraction(printed[tone["note"]], printed[0])
            frequency = root * (float(r) if tuning == "ratios" and mode != "control" else 2**(tone["note"]/6))
            assert abs(tone["hz"]-frequency) < 1e-10
            assert 0 < tone["duration"] and tone["start"]+tone["duration"] <= plan["duration"]
        if mode in ("beat","control"):
            assert plan["tones"][0]["start"] == plan["tones"][1]["start"]
            assert plan["tones"][0]["duration"] == plan["tones"][1]["duration"]
            assert plan["duration"] < 5
        checks += 1
print(json.dumps({"method":"Python Fraction integer powers plus 60-digit Decimal octave roots, independently transcribed printed integers", "references":len(data), "progression_rows":21, "sound_plans":84, "checks":checks, "maximum_frequency_error_hz":maximum_hz_error, "comma":"531441/524288", "excess_integer":7153},indent=2))
