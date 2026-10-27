"""Measure browser PCM against independent mean formulas, including fades and silence."""
import hashlib,json,math,pathlib,sys,wave
import numpy as np
report_file=pathlib.Path(sys.argv[1]);report=json.loads(report_file.read_text());checks=[]
for c in report['configurations']:
 for r in c['sounds']:
  file=report_file.parent/r['file'];assert hashlib.sha256(file.read_bytes()).hexdigest()==r['sha256']
  with wave.open(str(file))as w:
   assert(w.getnchannels(),w.getsampwidth(),w.getframerate())==(1,2,48000);y=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32767
  s=r['state'];f=s['reference'];A,B=16,18;M=17;h1=f*M/A;h2=f*B/M
  if s['sound']=='halves':tones=[(.12,.8,f),(1.12,1,h1),(2.72,.8,f),(3.72,1,h2)]
  elif s['sound']=='path':tones=[(.12,.8,f),(1.12,.8,h1),(2.12,.8,f*9/8)]
  else:tones=[(.12,5.4,h1),(.12,5.4,h1 if s['sound']=='control' else h2)]
  assert s['interval']=='tone' and s['middle']==17 and s['method']=='integer' and s['scale']==2
  end=max(a+b for a,b,h in tones);assert len(y)==math.ceil((end+.22)*48000);assert np.max(abs(y))<.321
  t=np.arange(len(y))/48000;assert np.max(abs(y[t<.1]))==0 and np.max(abs(y[t>end+.01]))==0
  frequencies=[]
  if s['sound'] in ['halves','path','control']:
   for start,duration,hz in sorted(set(tones)):
    clip=y[math.ceil((start+.09)*48000):math.floor((start+duration-.09)*48000)];edges=np.flatnonzero((clip[:-1]<=0)&(clip[1:]>0));zeros=edges-clip[edges]/(clip[edges+1]-clip[edges]);observed=48000/np.polyfit(np.arange(len(zeros)),zeros,1)[0];err=1200*math.log2(observed/hz);assert abs(err)<.025,(file,hz,observed);frequencies.append({'expectedHz':hz,'observedHz':observed,'errorCents':err})
  predicted=np.zeros_like(y);groups={}
  for start,duration,hz in tones:groups.setdefault((start,duration),[]).append(hz)
  for(start,duration),hzs in groups.items():
   indices=np.flatnonzero((t>=start)&(t<start+duration));hzs=sorted(set(hzs))
   for offset in range(0,len(indices),4800):
    region=indices[offset:offset+4800];age=t[region]-start;env=np.minimum(np.minimum(age/.02,(duration-age)/.06),1).clip(0,1);basis=np.column_stack([v for hz in hzs for v in [env*np.sin(2*np.pi*hz*age),env*np.cos(2*np.pi*hz*age)]]);coef=np.linalg.lstsq(basis,y[region],rcond=None)[0];predicted[region]=basis@coef
  edges=np.zeros(len(y),dtype=bool);q=128/48000
  for a,b,h in tones:
   for event in[a,a+.02,a+b-.06,a+b]:edges|=abs(t-event)<=q
  error=y-predicted;rms=float(np.sqrt(np.mean(error[~edges]**2)));peak=float(np.max(abs(error[edges])));assert rms<.00006,(file,rms);assert peak<.16*len(tones)*q/.02+.0005,(file,peak)
  checks.append({'file':r['file'],'samples':len(y),'zeroCrossingMeasurements':frequencies,'pcmRmsOutside128FrameAutomationEdges':rms,'maximumEdgeDeviation':peak,'simultaneousExpectedHz':[hz for a,b,hz in tones] if s['sound']in['together','control']else None})
assert len(checks)==16;print(json.dumps({'files':16,'method':'Independent mean formulas; measured zero crossings; complete PCM phase/envelope fits at predicted frequencies; stereo or speakers not measured','checks':checks},indent=2))
