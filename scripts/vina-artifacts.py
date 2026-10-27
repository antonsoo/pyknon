#!/usr/bin/env python3
"""Inspect actual native HTML/SVG/WAV and the printed PDF, without app imports."""
import base64
import csv
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.parse import unquote_to_bytes
import xml.etree.ElementTree as ET

root=Path(sys.argv[1]);manifest=json.loads(Path('public/sources/vina/manifest.json').read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
def decode(uri):
    head,body=uri.split(',',1)
    return base64.b64decode(body,validate=True) if ';base64' in head else unquote_to_bytes(body)
class Reading(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True);self.images=[];self.downloads={};self.scripts=0;self.audio=[];self.text=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='img':self.images.append(a['src'])
        if tag=='audio':self.audio.append(a['src'])
        if tag=='script':self.scripts+=1
        if tag=='a' and 'download' in a:self.downloads[a['download']]=a['href']
    def handle_data(self,data):self.text.append(data)

expected_images={p['sha256'] for p in manifest['pages']}
font_files=['IBMPlexSans-Regular.woff2','IBMPlexSans-SemiBold.woff2','NotoSerif-Regular.ttf']
expected_fonts={sha((Path('public/fonts')/f).read_bytes()) for f in font_files}
notices=[Path('LICENSE'),Path('public/fonts/IBMPlex-OFL.txt'),Path('public/fonts/NotoSerif-OFL.txt')]
normalized=lambda s:s.replace('\r\n','\n').lstrip('\ufeff')
checks=[]
for folder in sorted(p for p in root.iterdir() if p.is_dir() and (p/'reading.html').exists()):
    raw=(folder/'reading.html').read_bytes();text=raw.decode('utf-8');h=Reading();h.feed(text)
    assert h.scripts==0 and len(h.images)==8 and len(h.audio)==1
    assert all(u.startswith('data:') for u in h.images+h.audio)
    assert {sha(decode(u)) for u in h.images}==expected_images
    fonts=re.findall(r'data:font/(?:woff2|ttf);base64,[A-Za-z0-9+/=]+',text)
    assert {sha(decode(u)) for u in fonts}==expected_fonts
    assert decode(h.downloads['pyknon-two-vinas.json'])==(folder/'record.json').read_bytes()
    assert decode(h.downloads['pyknon-two-vinas.csv'])==(folder/'final.csv').read_bytes()
    assert decode(h.downloads['pyknon-two-vinas.wav'])==(folder/'compare.wav').read_bytes()
    assert decode(h.audio[0])==(folder/'compare.wav').read_bytes()
    assert re.search(r'p,dd\{font-family:Noto,Plex,serif\}',text),'Whole Sanskrit words must not depend on mixed host-font glyph fallback'
    joined=normalized(''.join(h.text))
    for notice in notices:assert normalized(notice.read_bytes().decode('utf-8-sig')) in joined
    svg=(folder/'plate.svg').read_bytes();tree=ET.fromstring(svg);ns={'s':'http://www.w3.org/2000/svg'}
    groups=tree.findall('.//s:g[@data-vn-note]',ns);assert len(groups)==14
    svg_fonts=re.findall(r'data:font/woff2;base64,[A-Za-z0-9+/=]+',svg.decode('utf8'))
    assert len(svg_fonts)==1 and sha(decode(svg_fonts[0]))==sha((Path('public/fonts')/font_files[0]).read_bytes())
    assert 'script' not in [e.tag.split('}')[-1] for e in tree.iter()]
    meta=tree.find('s:metadata',ns).text
    for notice in notices[:2]:assert normalized(notice.read_bytes().decode('utf-8-sig')) in normalized(meta)
    csv_rows=list(csv.DictReader((folder/'final.csv').read_text().splitlines()));assert len(csv_rows)==7
    for g in groups:
        kind,n=g.attrib['data-vn-note'].split('-');r=csv_rows[int(n)]
        assert abs(float(g.attrib['data-cents'])-float(r[kind+'_cents']))<1e-10
        assert abs(float(g.attrib['data-hz'])-float(r[kind+'_hz']))<1e-10
    checks.append({'context':folder.name,'htmlBytes':len(raw),'htmlSha256':sha(raw),'sourceJpegs':8,'fonts':3,'svgGroupsMatchActualCsv':14,'embeddedAudioMatchesNativeWav':True,'nativeRecordsMatchEmbeddedDownloads':True,'fullCodeAndFontNotices':True,'scripts':0})
assert len(checks)==4
pdf=root/'chromium-1440/reading.pdf'
info=subprocess.check_output(['pdfinfo',str(pdf)],text=True);plain=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True)
assert 'two-vīṇā' in plain and 'Nāṭyaśāstra' in plain and 'ṣaḍja-grāma' in plain,'Whole searchable Sanskrit words'
last=-1
for p in manifest['pages']:
    caption=f"Grosset 1888 · {'music study title' if p['printedPage']=='title' else 'printed p.'+str(p['printedPage'])}"
    current=plain.find(caption,last+1);assert current>last,(p['id'],caption);last=current
for word in ['dve vīṇe','pramāṇa','niṣāda','dhaivata','gāndhāra','praviśato']:assert word in plain,word
bbox=ET.fromstring(subprocess.check_output(['pdftotext','-bbox',str(pdf),'-']));words=0
for page in bbox.findall('.//{http://www.w3.org/1999/xhtml}page'):
    width=float(page.attrib['width']);height=float(page.attrib['height'])
    for w in page.findall('.//{http://www.w3.org/1999/xhtml}word'):
        x1,y1,x2,y2=(float(w.attrib[k]) for k in ['xMin','yMin','xMax','yMax']);assert x1>=25 and y1>=25 and x2<=width-25 and y2<=height-25,(w.text,w.attrib);words+=1
fonts=subprocess.check_output(['pdffonts',str(pdf)],text=True).splitlines()[2:];assert fonts and all(' yes ' in line for line in fonts)
assert b'/JavaScript' not in pdf.read_bytes()
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(['pdfimages','-j',str(pdf),str(Path(tmp)/'scan')],check=True)
    recovered={sha(p.read_bytes()) for p in Path(tmp).glob('*.jpg')}
    assert expected_images.issubset(recovered),'All eight original JPEGs must survive the printed PDF'
print(json.dumps({'status':'passed','contexts':checks,'print':{'pages':int(re.search(r'^Pages:\s+(\d+)',info,re.M).group(1)),'originalSourceJpegsRecoverableByteForByte':8,'orderedSourceCaptions':8,'embeddedFontInstances':len(fonts),'wordsInside25ptMargins':words,'wholeSanskritWordsSearchable':True,'javaScript':False,'physicalPrinting':'not tested','taggedPdfAccessibility':'not established'}},indent=2))
