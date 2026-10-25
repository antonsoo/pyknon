#!/usr/bin/env python3
"""Independent Fraction/Decimal check; imports no application code."""
import json
import math
import sys
from decimal import Decimal, localcontext
from fractions import Fraction as F

def d(x):
    x = F(*x) if isinstance(x, list) else F(x)
    return Decimal(x.numerator) / Decimal(x.denominator)

def near(actual, expected, tolerance=2e-9):
    assert abs(float(actual) - float(expected)) < tolerance, (actual, expected)

checks = 0
cases = 0
for line in sys.stdin:
    c = json.loads(line)
    cases += 1
    s, rows = c["state"], c["rows"]
    with localcontext() as ctx:
        ctx.prec = 60
        for i, source in enumerate([6, 8, 9, 12]):
            row, chosen = rows[i], F(*s["weights"][i])
            target, squared, repair = F(source, 6), chosen / 6, F(source * source, 6)
            assert F(*row["claimed"]) == target
            assert F(*row["chosenSquared"]) == squared
            assert F(*row["repaired"]) == repair
            assert row["exact"] == (chosen == repair)
            target_hz, chosen_hz = s["root"] * d(target), s["root"] * d(squared).sqrt()
            near(row["claimHz"], target_hz)
            near(row["originalHz"], s["root"] * d(target).sqrt())
            near(row["yoursHz"], chosen_hz)
            cents = 1200 * (d(squared).sqrt().ln() / Decimal(2).ln())
            near(row["yoursCents"], cents)
            near(row["originalCents"], 600 * d(target).ln() / Decimal(2).ln())
            near(row["claimCents"], 1200 * d(target).ln() / Decimal(2).ln())
            checks += 10
        for sound, plan in c["plans"].items():
            assert len(plan["tones"]) == (6 if sound == "compare" else 2 if sound == "together" else 4)
            for tone in plan["tones"]:
                i, role = tone["note"], tone["role"]
                frequency = s["root"] * (d(F([6,8,9,12][i], 6)) if role == "claim" else d(F([6,8,9,12][i], 6)).sqrt() if role == "original" else d(F(*s["weights"][i]) / 6).sqrt())
                near(tone["hz"], frequency)
                assert tone["duration"] >= .75 and tone["start"] + tone["duration"] < plan["duration"]
                checks += 2
        # Rayleigh quotient of a separately assembled 256-cell uniform string.
        # Equal endpoints, length and density; load sets tension, not frequency.
        n = 256
        y = [0] + [math.sin(math.pi * j / n) for j in range(1, n)] + [0]
        stiffness = sum((y[j+1] - y[j]) ** 2 for j in range(n))
        inertia = sum(v*v for v in y[1:-1])
        for i in range(4):
            omega = math.sqrt(float(F(*s["weights"][i])) * stiffness / inertia)
            base = math.sqrt(6 * stiffness / inertia)
            near(omega/base, rows[i]["yoursHz"]/s["root"])
            checks += 1
assert cases == 250, f"Expected 250 complete cases, received {cases}"
print(f"Independent exact/60-digit/finite-chain oracle: {cases} cases / {checks} checks passed.")
