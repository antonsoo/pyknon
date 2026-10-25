#!/usr/bin/env python3
"""Re-render the full original pages and verify their exact retained identities."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--jan', type=Path)
parser.add_argument('--meibom', type=Path)
args = parser.parse_args()
manifest = json.loads(Path('src/tension-sources.json').read_text())
with tempfile.TemporaryDirectory(prefix='pyknon-sources-') as tmp:
    for edition in manifest['editions']:
        pdf = getattr(args, edition['id'])
        if pdf is None:
            pdf = Path(tmp) / edition['pdf']
            url = f"https://archive.org/download/{edition['archive']}/{edition['pdf']}"
            with urllib.request.urlopen(url, timeout=180) as source, pdf.open('wb') as target:
                while chunk := source.read(1024*1024):
                    target.write(chunk)
        data = pdf.read_bytes()
        assert len(data) == edition['bytes']
        assert hashlib.sha256(data).hexdigest() == edition['sha256'], f"Wrong original PDF: {pdf}"
        for p in manifest['pages']:
            if p['edition'] != edition['id']:
                continue
            prefix = Path(tmp) / p['id']
            subprocess.run(['pdftoppm', '-f', str(p['pdfPage']), '-l', str(p['pdfPage']), '-singlefile', '-scale-to', '2200', '-jpeg', '-jpegopt', 'quality=90', str(pdf), str(prefix)], check=True)
            rendered = prefix.with_suffix('.jpg').read_bytes()
            retained = (Path('public') / p['file']).read_bytes()
            assert rendered == retained and len(rendered) == p['bytes']
            assert hashlib.sha256(rendered).hexdigest() == p['sha256']
            print(f"{p['id']}: original PDF identity and complete rendered page match")
