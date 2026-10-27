"""Reproduce complete JPEGs from the identified original PDF using pinned Poppler."""
import hashlib,json,pathlib,subprocess,sys,tempfile
m=json.loads(pathlib.Path('public/sources/halves/manifest.json').read_text());pdf=pathlib.Path(sys.argv[1]);b=pdf.read_bytes();sha=lambda x:hashlib.sha256(x).hexdigest()
assert len(b)==m['pdfBytes'] and sha(b)==m['pdfSha256']
version=subprocess.run(['pdftoppm','-v'],capture_output=True,text=True).stderr.splitlines()[0];assert '24.02.0' in version,version
checked=[]
with tempfile.TemporaryDirectory() as tmp:
 for p in m['pages']:
  prefix=str(pathlib.Path(tmp)/'page');subprocess.run(['pdftoppm','-f',str(p['pdfPage']),'-l',str(p['pdfPage']),'-singlefile','-scale-to','2200','-jpeg','-jpegopt','quality=88',str(pdf),prefix],check=True,capture_output=True)
  actual=pathlib.Path(prefix+'.jpg').read_bytes();retained=pathlib.Path('public',p['file']).read_bytes();assert actual==retained;assert len(actual)==p['bytes'] and sha(actual)==p['sha256'];checked.append({'pdfPage':p['pdfPage'],'printedPage':p['printedPage'],'bytes':len(actual),'sha256':sha(actual)})
 for a in m['assets']:
  b=pathlib.Path('public',a['file']).read_bytes();assert len(b)==a['bytes'] and sha(b)==a['sha256']
print(json.dumps({'pdfBytes':m['pdfBytes'],'pdfSha256':m['pdfSha256'],'renderer':version,'wholePagesReproducedByteForByte':checked,'fontsAndLicenses':len(m['assets'])},indent=2))
