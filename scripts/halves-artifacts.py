"""Audit actual browser downloads, embedded source bytes and printed reading."""
import base64,csv,hashlib,json,math,pathlib,re,subprocess,sys,tempfile,unicodedata,xml.etree.ElementTree as ET
from fractions import Fraction as F
from html.parser import HTMLParser
from urllib.parse import unquote_to_bytes
root=pathlib.Path(sys.argv[1]);m=json.loads(pathlib.Path('public/sources/halves/manifest.json').read_text());expected=json.loads(subprocess.check_output(['node','--import','tsx','--input-type=module','-e','import {HALF_PASSAGES} from "./src/halves-content.ts";console.log(JSON.stringify(HALF_PASSAGES));'],text=True));sha=lambda b:hashlib.sha256(b).hexdigest()
def decode(u):
 head,body=u.split(',',1);return base64.b64decode(body,validate=True) if ';base64' in head else unquote_to_bytes(body)
class Reading(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.images=[];self.audio=[];self.downloads={};self.scripts=0;self.text=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='img':self.images.append(a['src'])
  if t=='audio':self.audio.append(a['src'])
  if t=='script':self.scripts+=1
  if t=='a' and 'download'in a:self.downloads[a['download']]=a['href']
 def handle_data(self,d):self.text.append(d)
def flat(s):return re.sub(r'\s+','',unicodedata.normalize('NFC',s)).replace('\u00ad','')
images={p['sha256'] for p in m['pages']};fonts={a['sha256'] for a in m['assets'] if a['file'].endswith(('.ttf','.woff2'))};checks=[]
report=json.loads((root/'review.json').read_text())
for c in report['configurations']:
 folder=root/f"{c['engine']}-{c['width']}";raw=(folder/'reading.html').read_bytes();text=raw.decode();h=Reading();h.feed(text);joined=''.join(h.text).replace('\r\n','\n')
 assert h.scripts==0 and len(h.images)==9 and len(h.audio)==1
 assert {sha(decode(u)) for u in h.images}==images
 assert {sha(decode(u)) for u in re.findall(r'data:font/(?:woff2|ttf);base64,[A-Za-z0-9+/=]+',text)}==fonts
 for p in expected:
  for k in ['greek','latin','english']:assert flat(p[k]) in flat(joined),(k,p['title'])
  for w in p['words']:
   for k in ['greek','latin','meaning','job']:assert flat(w[k]) in flat(joined),(k,w)
 for notice in ['halves-LICENSE.txt','fonts/IBMPlex-OFL.txt','fonts/NotoSerif-OFL.txt']:assert pathlib.Path('public',notice).read_text(encoding='utf-8-sig').strip() in joined
 for ext,original in [('json','record.json'),('csv','final.csv'),('svg','plate.svg'),('wav','halves.wav')]:
  assert decode(h.downloads['pyknon-halves.'+ext])==(folder/original).read_bytes();assert(folder/('native.'+ext)).read_bytes()==(folder/original).read_bytes()
 assert decode(h.audio[0])==(folder/'halves.wav').read_bytes()
 tree=ET.fromstring((folder/'plate.svg').read_bytes());assert all(e.tag.split('}')[-1]!='script' for e in tree.iter())
 for sample in c['samples']:
  s=sample['state'];a,b=(s['n']+1,s['n']) if s['interval']=='custom' else {'tone':(9,8),'fourth':(4,3),'fifth':(3,2),'octave':(2,1),'square':(9,4)}[s['interval']];A,B=b*s['scale'],a*s['scale'];method=s['method'];ms=F(s['middle'])**2 if method=='integer' else F(A+B,2)**2 if method=='frequency' else F(2*A*B,A+B)**2 if method=='length' else F(A*B)
  rows=list(csv.DictReader((root/sample['csv']).read_text().splitlines()));assert len(rows)==3
  for row,sq in zip(rows,[F(A*A),ms,F(B*B)]):
   assert F(int(row['number_squared_numerator']),int(row['number_squared_denominator']))==sq;assert F(int(row['frequency_ratio_squared_numerator']),int(row['frequency_ratio_squared_denominator']))==sq/(A*A)
   assert row['scope']=='numerical-mean-and-modern-sound' and row['method']==method and int(row['chosen_integer'])==s['middle'];assert math.isclose(float(row['approx_frequency_hz']),s['reference']*math.sqrt(float(sq))/A,abs_tol=1e-8)
 checks.append({'context':folder.name,'htmlBytes':len(raw),'wholePageImages':9,'embeddedFonts':3,'completeTrilingualReadings':7,'completeWordNotes':sum(len(p['words'])for p in expected),'actualNativeDownloadsMatchEmbedded':4,'exactCsvExperiments':len(c['samples'])})
assert len(checks)==4
pdf=root/'chromium-1440/reading.pdf';plain=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True)
for p in expected:
 for k in ['greek','latin','english']:assert flat(p[k]) in flat(plain),('PDF',k,p['title'])
 for w in p['words']:
  for k in ['greek','latin','meaning','job']:assert flat(w[k]) in flat(plain),('PDF',k,w)
bbox=ET.fromstring(subprocess.check_output(['pdftotext','-bbox',str(pdf),'-']));words=0
for p in bbox.findall('.//{http://www.w3.org/1999/xhtml}page'):
 for w in p.findall('.//{http://www.w3.org/1999/xhtml}word'):
  x1,y1,x2,y2=[float(w.attrib[k])for k in ['xMin','yMin','xMax','yMax']];assert x1>=25 and y1>=25 and x2<=float(p.attrib['width'])-25 and y2<=float(p.attrib['height'])-25,(w.text,w.attrib);words+=1
with tempfile.TemporaryDirectory() as tmp:
 subprocess.run(['pdfimages','-j',str(pdf),str(pathlib.Path(tmp)/'scan')],check=True);assert images.issubset({sha(p.read_bytes())for p in pathlib.Path(tmp).glob('*.jpg')})
info=subprocess.check_output(['pdfinfo',str(pdf)],text=True);print(json.dumps({'contexts':checks,'print':{'pages':int(re.search(r'^Pages:\s+(\d+)',info,re.M)[1]),'completeTrilingualReadings':7,'completeWordNotes':sum(len(p['words'])for p in expected),'wholeSourceJpegsRecoverableByteForByte':9,'wordsWithin25ptMargins':words,'physicalPrinting':'not measured','taggedAccessibility':'not established'}},indent=2))
