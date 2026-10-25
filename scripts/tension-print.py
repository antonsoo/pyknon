#!/usr/bin/env python3
"""Verify actual printed text and exact JPEG payloads in a saved-reading PDF."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

p = argparse.ArgumentParser()
p.add_argument('pdf',type=Path)
p.add_argument('--expect-pages',type=int,default=15)
a = p.parse_args()
info = subprocess.check_output(['pdfinfo',str(a.pdf)],text=True)
assert int(re.search(r'^Pages:\s+(\d+)',info,re.M)[1]) == a.expect_pages
text = subprocess.check_output(['pdftotext','-layout',str(a.pdf),'-'],text=True)
for expected in ['Double the weight.','Half the octave.','600 cents','32/3','27/2','equally twisted','aeque graves','Modern ideal comparison','not a fixture reconstruction','Jan 1895','Meibom 1652']:
    assert expected in text, expected
with tempfile.TemporaryDirectory(prefix='pyknon-print-') as tmp:
    subprocess.run(['pdfimages','-j',str(a.pdf),str(Path(tmp)/'image')],check=True)
    hashes={hashlib.sha256(f.read_bytes()).hexdigest() for f in Path(tmp).iterdir()}
    manifest=json.loads(Path('src/tension-sources.json').read_text())
    for image in manifest['pages']:
        assert image['sha256'] in hashes,image['id']
print(f'{a.expect_pages} actual PDF pages; eight original JPEGs recovered byte for byte; source/model text retained.')
