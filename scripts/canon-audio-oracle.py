"""Measure browser-generated PCM against the printed progression, independently.

Requires NumPy only for signal analysis. Pure tones use interpolated positive
zero crossings. Simultaneous tones use a source-frequency sinusoidal fit;
an analytic envelope supplies an independently measured final-step beat rate.
No app code, event plan or exported numerical CSV is imported.
"""
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import sys
import wave

import numpy as np

report_path = Path(sys.argv[1])
report = json.loads(report_path.read_text())
printed = [262144, 294912, 331776, 373248, 419904, 472392, 531441]
rate = 48000
results = []
maximum_cents = 0.0
maximum_residual = 0.0
maximum_beat_error = 0.0
measured_tones = 0
pure_references = {}

def frequency(signal, start, duration, expected):
    global maximum_cents, measured_tones
    lo, hi = round((start+.08)*rate), round((start+duration-.1)*rate)
    x = signal[lo:hi]
    indices = np.flatnonzero((x[:-1] <= 0) & (x[1:] > 0))
    crossings = indices - x[indices]/(x[indices+1]-x[indices])
    assert len(crossings) > 20
    actual = (len(crossings)-1)*rate/(crossings[-1]-crossings[0])
    error = abs(1200*math.log2(actual/expected))
    assert error < .02, (actual, expected, error)
    maximum_cents = max(maximum_cents, error)
    measured_tones += 1
    return {"expected_hz":expected,"measured_hz":float(actual),"error_cents":error}

for item in report["audio"]:
    file = report_path.parent/item["file"]
    assert hashlib.sha256(file.read_bytes()).hexdigest() == item["sha256"]
    with wave.open(str(file),"rb") as wav:
        assert (wav.getnchannels(),wav.getsampwidth(),wav.getframerate()) == (1,2,rate)
        x = np.frombuffer(wav.readframes(wav.getnframes()),dtype="<i2").astype(float)/32767
    root,n,mode = item["root"],item["step"],item["sound"]
    ratio = root*float(Fraction(printed[n],printed[0]))
    equal = root*2**(n/6)
    measurements = []
    peak = float(np.max(np.abs(x)))
    assert peak < .321, "No clipping, including simultaneous voices"
    intervals = []
    if mode == "walk":
        for group in range(2):
            for k in range(n+1):
                start = .12+group*((n+1)*.65+.6)+k*.65
                expected = root*(float(Fraction(printed[k],printed[0])) if group == 0 else 2**(k/6))
                measurements.append(frequency(x,start,.48,expected))
                intervals.append((start,start+.48))
        duration = intervals[-1][1]+.2
    elif mode == "compare":
        for start,expected in [(.12,equal),(2.12,ratio)]:
            measurements.append(frequency(x,start,1.6,expected))
            intervals.append((start,start+1.6))
        duration = 3.92
        pure_references[(item["browser"],root,n)] = [m["measured_hz"] for m in measurements]
    else:
        duration = 4.32
        intervals = [(.12,4.12)]
        lo,hi = round(.3*rate),round(3.95*rate)
        # Both expected frequency components must have amplitude 0.16. A
        # single mistuned tone or an added artificial tremolo will not fit.
        t = np.arange(lo,hi,3)/rate
        sample = x[lo:hi:3]
        # Use frequencies independently measured in this browser's successive
        # pure-tone export, after checking each against the source. Firefox's
        # oscillator has a small measurable frequency offset; fitting ideal
        # frequencies over several seconds would turn that into a false
        # waveform error. The reference is PCM, not the app's scheduled value.
        reference = pure_references[(item["browser"],root,n)]
        if mode == "control":
            control_frequency = frequency(x,.12,4,equal)
            freqs = [control_frequency["measured_hz"]]
        else:
            freqs = reference[:1] if n == 0 else reference
        design = np.column_stack([f(t) for hz in freqs for f in (lambda t,hz=hz: np.sin(2*np.pi*hz*t),lambda t,hz=hz: np.cos(2*np.pi*hz*t))])
        coef = np.linalg.lstsq(design,sample,rcond=None)[0]
        amplitudes = [float(np.hypot(*coef[i:i+2])) for i in range(0,len(coef),2)]
        expected_amplitude = .32 if len(freqs) == 1 else .16
        assert all(abs(a-expected_amplitude) < .0002 for a in amplitudes), (file,amplitudes)
        residual = float(np.sqrt(np.mean((sample-design@coef)**2)))
        assert residual < .0001, (file,residual)
        maximum_residual = max(maximum_residual,residual)
        measurements.append({"source_hz":[equal] if len(freqs) == 1 else [equal,ratio],"pcm_reference_hz":freqs,"fitted_amplitudes":amplitudes,"signal_residual_rms":residual})
        if n == 6 and mode == "beat":
            # Hilbert transform via the standard analytic-signal FFT mask.
            spectrum = np.fft.fft(x)
            mask = np.zeros(len(x)); mask[0] = 1
            mask[1:(len(x)+1)//2] = 2
            if len(x)%2 == 0: mask[len(x)//2] = 1
            envelope = np.abs(np.fft.ifft(spectrum*mask))
            # Read envelope maxima, avoiding the attack/release boundaries.
            env = envelope[round(.45*rate):round(3.8*rate):48]
            maxima = np.flatnonzero((env[1:-1] > env[:-2]) & (env[1:-1] >= env[2:]))+1
            # Small FFT boundary ripple cannot count as a full amplitude beat.
            maxima = maxima[env[maxima] > .31]
            chosen = []
            for i in maxima:
                if not chosen or i-chosen[-1] > 1000/(ratio-equal)*.7: chosen.append(int(i))
            assert len(chosen) >= 8
            actual = (len(chosen)-1)*1000/(chosen[-1]-chosen[0])
            expected = ratio-equal
            error = abs(actual-expected)
            assert error < .02, (file,actual,expected)
            maximum_beat_error = max(maximum_beat_error,error)
            measurements.append({"measured_beats_per_second":actual,"source_frequency_difference_hz":expected,"error_hz":error,"envelope_maxima":len(chosen)})
    assert abs(len(x)-duration*rate) <= 1.000001, (file,len(x),duration*rate)
    active = np.zeros(len(x),dtype=bool)
    for start,end in intervals:
        active[max(0,math.floor(start*rate)-2):min(len(x),math.ceil(end*rate)+2)] = True
    assert np.all(x[~active] == 0), (file,"Sound outside intended finite intervals")
    results.append({**item,"duration_seconds":len(x)/rate,"peak":peak,"measurements":measurements})
print(json.dumps({"method":"Independent printed integers; interpolated PCM zero crossings; source-frequency sinusoidal fitting; analytic-envelope maxima for final-step beats", "wav_files":len(results),"measured_pure_tones":measured_tones,"maximum_pure_tone_error_cents":maximum_cents,"maximum_simultaneous_signal_residual_rms":maximum_residual,"maximum_final_beat_error_hz":maximum_beat_error,"silence_and_finite_duration_checked":True,"results":results},indent=2))
