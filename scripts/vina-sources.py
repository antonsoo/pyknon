#!/usr/bin/env python3
"""Reproduce all retained whole pages from the identified 1888 original PDF."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--pdf', type=Path, help='Previously downloaded original; otherwise fetch its recorded URL')
args = parser.parse_args()
manifest = json.loads(Path('public/sources/vina/manifest.json').read_text())
source = manifest['sourcePdf']
with tempfile.TemporaryDirectory(prefix='pyknon-vina-pages-') as tmp:
    pdf = args.pdf
    if pdf is None:
        pdf = Path(tmp) / 'grosset.pdf'
        with urllib.request.urlopen(source['url'], timeout=60) as response, pdf.open('wb') as target:
            while chunk := response.read(1024 * 1024):
                target.write(chunk)
    original = pdf.read_bytes()
    assert len(original) == source['bytes'], 'Original PDF length differs'
    assert hashlib.sha256(original).hexdigest() == source['sha256'], 'Wrong original PDF'
    assert hashlib.md5(original).hexdigest() == source['md5'], 'Original Archive MD5 differs'
    pages = []
    for page in manifest['pages']:
        prefix = Path(tmp) / page['id']
        subprocess.run(['pdftoppm', '-f', str(page['pdfPage']), '-l', str(page['pdfPage']),
                        '-singlefile', '-scale-to', '2200', '-jpeg', '-jpegopt', 'quality=88',
                        str(pdf), str(prefix)], check=True)
        rendered = prefix.with_suffix('.jpg').read_bytes()
        retained = (Path('public') / page['file']).read_bytes()
        assert rendered == retained, f"Whole original page differs: {page['id']}"
        assert len(rendered) == page['bytes']
        assert hashlib.sha256(rendered).hexdigest() == page['sha256']
        pages.append({'id': page['id'], 'pdfPage': page['pdfPage'], 'bytes': len(rendered),
                      'sha256': page['sha256'], 'wholeRenderedPageMatches': True})
    assert len(pages) == 8
    version = subprocess.run(['pdftoppm', '-v'], capture_output=True, text=True, check=True)
    print(json.dumps({'status': 'passed', 'sourcePdf': source,
                      'renderer': version.stderr.splitlines()[0], 'pages': pages}, indent=2))
