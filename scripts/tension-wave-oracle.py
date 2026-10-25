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
        # Oscillator phase at a scheduled start is browser-dependent. Fit only
        # phase/amplitude; frequencies and the entire envelope remain fixed by
        # this independent model. Wrong pitches cannot fit the PCM samples.
        basis = np.column_stack(columns)
        coefficients = np.linalg.lstsq(basis, samples, rcond=None)[0]
        expected = basis @ coefficients
        error = float(np.sqrt(np.mean((samples-expected)**2)))
        assert error < .00012, (config['browser'],mode,error)
        amplitudes = np.sqrt(coefficients[::2]**2 + coefficients[1::2]**2)
        assert np.max(np.abs(amplitudes - .16)) < .0001, amplitudes
        assert abs(samples[t<.1]).max() == 0
        assert abs(samples[t>max(a+c for a,b,c in tones)+.01]).max() == 0
        observed = sorted(record.get('nodes',[]),key=lambda x:(x['start'],x['hz']))
        for node,(_,hz,_) in zip(observed,sorted(tones)):
            assert abs(node['hz']-hz) < 1e-8
        checks.append({'browser':config['browser'],'width':config['width'],'mode':mode,'file':record['file'],'sampleRate':rate,'samples':len(samples),'rmsResidual':error,'independentlyPredictedFrequencies':[b for a,b,c in sorted(tones)]})
print(json.dumps({'checkedFiles':len(checks),'checks':checks},indent=2))
