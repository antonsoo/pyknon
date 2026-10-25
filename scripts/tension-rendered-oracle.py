#!/usr/bin/env python3
import json
from fractions import Fraction as F
import math
from pathlib import Path
import sys

report=json.loads(Path(sys.argv[1]).read_text())
checks=0
assert len(report['cases'])==20
for c in report['cases']:
    for m in c['masses']:
        assert abs(m['height']-4*float(F(c['weights'][m['index']])))<1e-4
        assert m['y']==218
        checks+=2
    for p in c['pitch']:
        row,i=map(int,p['id'].split('-'))
        v=([6,8,9,12][i]/6 if row in [0,1] else float(F(c['weights'][i]))/6)
        cents=(1200 if row==0 else 600)*math.log2(v)
        assert abs(p['x']-(18+(c['rulerWidth']-36)*cents/1500))<1e-4
        checks+=1
    for wire in c['wires']:
        assert ' 42 H' in wire and ' 42 V202 M' in wire
        checks+=1
print(f"{len(report['cases'])} actual browser SVG views / {checks} independent load, pitch and fixed-length checks passed.")
