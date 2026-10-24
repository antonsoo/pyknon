# /// script
# requires-python = ">=3.12,<3.15"
# dependencies = ["numpy==2.4.2", "scipy==1.17.1"]
# ///
"""Independent mass-lumped grid eigenproblem; no app imports or phase transfers."""
import csv
from functools import lru_cache
import io
import json
import math
from pathlib import Path
import sys

import numpy as np
from scipy.linalg import eigh_tridiagonal

PATTERNS = {
    "uniform": [0] * 8,
    "outer": [1, 1, 0, 0, 0, 0, 1, 1],
    "repeat": [0, 1, 1, 0, 0, 1, 1, 0],
    "left": [1, 1, 1, 1, 0, 0, 0, 0],
}
PAIRS = [((0, .5), (.5, 1)), ((.5, .75), (.75, 1)), ((.75, .875), (.875, 1))]


@lru_cache(maxsize=None)
def grid(kind, contrast, a, b, n):
    h = (b - a) / n
    mid = a + (np.arange(n) + .5) * h
    cells = np.minimum((mid * 8).astype(int), 7)
    rho = 1 + (contrast - 1) * np.asarray(PATTERNS[kind])[cells]
    # Half a control volume in each adjacent cell, including discontinuities.
    mass = (rho[:-1] + rho[1:]) / 2
    diagonal = 2 / (h * h * mass)
    off = -1 / (h * h * np.sqrt(mass[:-1] * mass[1:]))
    values, vectors = eigh_tridiagonal(diagonal, off, select="i", select_range=(0, 0))
    shape = np.r_[0., vectors[:, 0] / np.sqrt(mass), 0.]
    if shape[n // 2] < 0:
        shape = -shape
    return math.sqrt(values[0]) / (2 * math.pi), shape


def frequency(kind, contrast, a, b):
    coarse, _ = grid(kind, contrast, a, b, 1024)
    fine, _ = grid(kind, contrast, a, b, 2048)
    return (4 * fine - coarse) / 3


def check(cases):
    max_hz = 0.
    max_shape = 0.
    points = 0
    for c in cases:
        for name, (a, b) in zip(("a", "b"), PAIRS[int(c["test"])]):
            expected = 2 * c["root"] * frequency(c["string"], c["contrast"], a, b)
            error = abs(c[f"{name}Hz"] - expected)
            max_hz = max(max_hz, error)
            assert error < 2e-5, (c, name, expected, error)
            supplied = c.get(f"{name}Shape")
            if supplied:
                _, shape = grid(c["string"], c["contrast"], a, b, 2048)
                x = np.linspace(a, b, 2049)
                target = np.interp([p["x"] for p in supplied], x, shape)
                target /= np.max(np.abs(target))
                error = float(np.max(np.abs(target - [p["y"] for p in supplied])))
                max_shape = max(max_shape, error)
                assert error < 4e-6, (c["string"], c["contrast"], c["test"], name, error)
                points += len(supplied)
    return {"cases": len(cases), "frequencyComparisons": len(cases) * 2,
            "modePointsCompared": points, "maxAbsoluteHzError": max_hz,
            "maxNormalizedModeError": max_shape,
            "method": "Independent 1024/2048-interval mass-lumped finite-difference eigenproblem; Richardson-extrapolated frequency. Application uses exact cell phase transfers."}


def browser_cases(report):
    cases = []
    for config in report["configurations"]:
        for item in config["measurements"]:
            for row in csv.DictReader(io.StringIO(Path(item["csv"]).read_text())):
                cases.append({"string": row["string"], "contrast": float(row["relative_heavy_density"]),
                              "root": int(row["uniform_full_string_hz"]), "test": int(row["test"]),
                              "aHz": float(row["a_hz"]), "bHz": float(row["b_hz"])})
        for item in config["drawnModes"]:
            cases.append(item)
    return cases


if __name__ == "__main__":
    data = json.loads(Path(sys.argv[1]).read_text()) if len(sys.argv) > 1 else json.load(sys.stdin)
    if isinstance(data, dict):
        data = browser_cases(data)
    print(json.dumps(check(data), indent=2))
