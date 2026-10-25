#!/usr/bin/env python3
"""Check actual browser-produced WAV samples against independently derived tones.
Run with numpy from scripts/requirements-audio.txt, passing the browser report.
"""
import hashlib
import json
import math
from pathlib import Path
import sys
import wave
import numpy as np

report_path = Path(sys.argv[1])
report = json.loads(report_path.read_text())
checks = []
for config in report['configurations']:
    directory = report_path.parent / f"{config['browser']}-{config['width']}"
    for record in config['sounds']:
        data = (directory / record['file']).read_bytes()
        assert hashlib.sha256(data).hexdigest() == record['sha256']
        with wave.open(str(directory / record['file']), 'rb') as wav:
            assert wav.getnchannels() == 1 and wav.getsampwidth() == 2
            rate, frames = wav.getframerate(), wav.readframes(wav.getnframes())
        samples = np.frombuffer(frames, dtype='<i2').astype(float) / 32767
        assert rate == 48000 and np.isfinite(samples).all() and abs(samples).max() < .34
        weights, root, selected, mode = record['weights'], record['root'], record['selected'], record['mode']
        claim = [root * w / 6 for w in [6,8,9,12]]
        original = [root * math.sqrt(w/6) for w in [6,8,9,12]]
        yours = [root * math.sqrt(w/6) for w in weights]
        groups = {'claim': claim, 'original': original, 'yours': yours}
        if mode == 'compare':
            tones = [(0.12+2.1*j, root, .75) for j in range(3)] + [(1.02+2.1*j, group[selected], .75) for j,group in enumerate([claim,original,yours])]
        elif mode == 'together':
            tones = [(.12, claim[selected], 2.5), (.12, yours[selected], 2.5)]
        else:
            tones = [(.12+.9*j,hz,.75) for j,hz in enumerate(groups[mode])]
        # Reconstruct the declared additive sine fundamentals and envelope from
        # independently derived frequencies, then compare every PCM sample.
        t = np.arange(len(samples)) / rate
        columns = []
        for start,hz,duration in tones:
            age = t-start
            envelope = np.minimum(np.minimum(age/.02,(duration-age)/.06),1).clip(0,1)
            columns.extend([envelope*np.sin(2*math.pi*hz*age), envelope*np.cos(2*math.pi*hz*age)])
        # Phase and finite phase-accumulator precision differ between browser
        # engines. Fit phase in 100 ms windows, retaining the independently fixed
        # frequencies and full attack/release envelope. Then measure phase drift:
        # a wrong pitch cannot pass merely by restarting its fitted phase.
        basis = np.column_stack(columns)
        predicted = np.zeros_like(samples)
        phases = [[] for _ in tones]
        max_amplitude_error = 0
        for left in range(0, len(samples), 4800):
            right = min(left+4800, len(samples))
            block = basis[left:right]
            coefficients = np.linalg.lstsq(block, samples[left:right], rcond=None)[0]
            predicted[left:right] = block @ coefficients
            middle = (left+right)/(2*rate)
            for i,(start,hz,duration) in enumerate(tones):
                if left/rate > start+.03 and right/rate < start+duration-.07:
                    a,b = coefficients[2*i:2*i+2]
                    amplitude = math.hypot(a,b)
                    max_amplitude_error = max(max_amplitude_error,abs(amplitude-.16))
                    phases[i].append((middle,math.atan2(b,a)))
        error = float(np.sqrt(np.mean((samples-predicted)**2)))
        assert error < .00006, (config['browser'],mode,error)
        assert max_amplitude_error < .0001, max_amplitude_error
        offsets = []
        for observations in phases:
            assert len(observations) >= 4
            times,angles = np.array(observations).T
            offset = float(np.polyfit(times,np.unwrap(angles),1)[0]/(2*math.pi))
            assert abs(offset) < .005, (config['browser'],mode,offset)
            offsets.append(offset)
        assert abs(samples[t<.1]).max() == 0
        assert abs(samples[t>max(a+c for a,b,c in tones)+.01]).max() == 0
        observed = sorted(record.get('nodes',[]),key=lambda x:(x['start'],x['hz']))
        for node,(_,hz,_) in zip(observed,sorted(tones)):
            assert abs(node['hz']-hz) < 1e-8
        checks.append({'browser':config['browser'],'width':config['width'],'mode':mode,'file':record['file'],'sampleRate':rate,'samples':len(samples),'rmsResidual':error,'frequencyOffsetsHz':offsets,'maximumAmplitudeError':max_amplitude_error,'independentlyPredictedFrequencies':[b for a,b,c in sorted(tones)]})
print(json.dumps({'checkedFiles':len(checks),'checks':checks},indent=2))
