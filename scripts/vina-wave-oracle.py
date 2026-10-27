#!/usr/bin/env python3
"""Measure actual browser-exported PCM against independent ratio-chain pitches.
Requires numpy; use the existing scripts/requirements-audio.txt environment.
"""
import hashlib
import json
import math
from pathlib import Path
import sys
import wave
import numpy as np

report_file=Path(sys.argv[1]);report=json.loads(report_file.read_text());assert not report.get('partial')
def pitches(s,tuning=None):
    kind=tuning or s['tuning'];a=1200*math.log2(9/8);l=1200*math.log2(256/243)
    p={'comma':1200*math.log2(81/80),'quarter':a/4,'boundary':(a-l)/2,'zero':0,'free':s['tenth']/10}[kind]
    r=(9/8)/2**(p/1200)
    fixed=np.array([1,r,32/27,4/3,3/2,3*r/2,16/9])*s['root']
    stages=[0,p,1200*math.log2((32/27)/r),1200*math.log2(r),a]
    i,f=divmod(s['position'],1000);shift=stages[i]+(stages[i+1]-stages[i])*f/1000 if i<4 else stages[4]
    return fixed,fixed/2**(shift/1200)

checks=[]
for c in report['configurations']:
    assert {x['mode'] for x in c['sounds']}=={'pair','fixed','moving','compare'}
    for record in c['sounds']:
        file=report_file.parent/record['file'];raw=file.read_bytes();assert hashlib.sha256(raw).hexdigest()==record['sha256']
        with wave.open(str(file),'rb') as wav:
            assert (wav.getnchannels(),wav.getsampwidth(),wav.getframerate())==(1,2,48000)
            y=np.frombuffer(wav.readframes(wav.getnframes()),dtype='<i2').astype(float)/32767
        s=record['state'];fixed,moving=pitches(s);tones=[]
        if s['sound']=='pair':
            selected=moving[s['selected']]
            candidates=[(abs(1200*math.log2(selected/(f*2**round(math.log2(selected/f))))),f*2**round(math.log2(selected/f))) for f in fixed]
            reference=min(candidates)[1]
            tones=[(.12,1.1,reference),(1.52,1.1,selected),(3,2,reference),(3,2,selected)]
        else:
            groups=[pitches(s,'comma')[0],fixed] if s['sound']=='compare' else [fixed if s['sound']=='fixed' else moving]
            tones=[(.12+g*5.8+i*.65,.48,(notes[0]*2 if i==7 else notes[i])) for g,notes in enumerate(groups) for i in range(8)]
        assert len(y)==math.ceil((max(start+duration for start,duration,hz in tones)+.2)*48000)
        assert np.isfinite(y).all() and abs(y).max()<.321
        t=np.arange(len(y))/48000
        # Non-overlapping tones and the simultaneous exact pair can be measured
        # directly by interpolated positive zero-crossings, independently of
        # any Web Audio oscillator settings or exported schedule.
        unique=[]
        for start,duration,hz in tones:
            if not any(a==start and b==duration and abs(f-hz)<1e-8 for a,b,f in unique):unique.append((start,duration,hz))
        errors=[];amplitudes=[]
        for start,duration,hz in unique:
            lo=math.ceil((start+.09)*48000);hi=math.floor((start+duration-.09)*48000);clip=y[lo:hi]
            edges=np.flatnonzero((clip[:-1]<=0)&(clip[1:]>0));assert len(edges)>20
            zeros=edges-clip[edges]/(clip[edges+1]-clip[edges])
            slope=np.polyfit(np.arange(len(zeros)),zeros,1)[0];observed=48000/slope
            cents=1200*math.log2(observed/hz);assert abs(cents)<.025,(c['engine'],record['mode'],hz,observed,cents)
            errors.append(cents)
            amplitude=float(np.max(np.abs(clip)));copies=sum(1 for a,b,f in tones if a==start and b==duration and abs(f-hz)<1e-8)
            assert abs(amplitude-.16*copies)<.0002
            amplitudes.append(amplitude)
        # Full PCM including fades/gaps: fit only phase in each active region,
        # with frequencies fixed by the independent mathematical predictions.
        predicted=np.zeros_like(y)
        for start,duration,hz in unique:
            active=(t>=start)&(t<start+duration);age=t[active]-start
            envelope=np.minimum(np.minimum(age/.02,(duration-age)/.06),1).clip(0,1)
            basis=np.column_stack([envelope*np.sin(2*math.pi*hz*age),envelope*np.cos(2*math.pi*hz*age)])
            coefficient=np.linalg.lstsq(basis,y[active],rcond=None)[0];predicted[active]+=basis@coefficient
        whole_tone_residual=float(np.sqrt(np.mean((y-predicted)**2)))
        # Firefox's finite oscillator phase accumulation drifts slightly over
        # a long tone. Frequency is independently constrained above; fit phase
        # in 100 ms blocks to test every attack/release sample without mistaking
        # that bounded drift for an incorrect amplitude envelope.
        predicted[:]=0
        for start,duration,hz in unique:
            indices=np.flatnonzero((t>=start)&(t<start+duration))
            for offset in range(0,len(indices),4800):
                region=indices[offset:offset+4800];age=t[region]-start
                envelope=np.minimum(np.minimum(age/.02,(duration-age)/.06),1).clip(0,1)
                basis=np.column_stack([envelope*np.sin(2*math.pi*hz*age),envelope*np.cos(2*math.pi*hz*age)])
                coefficient=np.linalg.lstsq(basis,y[region],rcond=None)[0];predicted[region]+=basis@coefficient
        # Distinguish steady waveform fidelity from automation at render-block
        # boundaries. Constrain edge disagreement to one 128-frame quantum's
        # maximum attack slope, rather than claiming sample-exact automation
        # across engines. No onset or release may escape this bounded region.
        edges=np.zeros(len(y),dtype=bool)
        quantum=128/48000
        for start,duration,hz in unique:
            for event in [start,start+.02,start+duration-.06,start+duration]:edges|=abs(t-event)<=quantum
        error=y-predicted
        residual=float(np.sqrt(np.mean(error[~edges]**2)))
        edge_deviation=float(np.max(abs(error[edges])))
        assert residual<.00006,(record['mode'],residual)
        simultaneous=max(sum(a==start for a,b,f in tones) for start,duration,hz in tones)
        assert edge_deviation<.16*simultaneous*quantum/.02+.0005,(record['mode'],edge_deviation)
        assert abs(y[t<.1]).max()==0 and abs(y[t>max(a+b for a,b,f in tones)+.01]).max()==0
        checks.append({'engine':c['engine'],'width':c['width'],'file':record['file'],'sampleRate':48000,'samples':len(y),'measuredSegments':len(unique),'maximumAbsoluteFrequencyErrorCents':max(map(abs,errors)),'pcmRmsOutsideAutomationEdges':residual,'maximumAutomationEdgeSampleDeviation':edge_deviation,'automationEdgeWindowFrames':128,'wholeToneConstantPhaseRmsDiagnostic':whole_tone_residual,'frequenciesHz':[f for a,b,f in unique],'amplitudes':amplitudes})
assert len(checks)==16
print(json.dumps({'status':'passed','files':len(checks),'method':'Independent frequency-ratio predictions; interpolated zero crossings and full-PCM phase/envelope fit; no application imports','physicalSpeakers':'not measured','checks':checks},indent=2))
