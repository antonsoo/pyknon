"""Independent integer/Fraction account; no product imports or JS root formatting."""
import json, math, sys
from fractions import Fraction as F
count=0; voices=0
ratios={'tone':(9,8),'fourth':(4,3),'fifth':(3,2),'octave':(2,1),'square':(9,4)}
for line in sys.stdin:
 r=json.loads(line);s=r['state'];a,b=(s['n']+1,s['n']) if s['interval']=='custom' else ratios[s['interval']]
 A,B=b*s['scale'],a*s['scale'];assert(A,B)==(r['A'],r['B']);assert r['ratio']=={'a':a,'b':b}
 method=s['method'];p=A*B
 if method=='integer': m=F(s['middle']);sq=m*m
 elif method=='frequency': m=F(A+B,2);sq=m*m
 elif method=='length': m=F(2*A*B,A+B);sq=m*m
 else: m=math.sqrt(p);sq=F(p)
 assert F(int(r['ms']['n']),int(r['ms']['d']))==sq
 cmp=(sq>p)-(sq<p);assert r['comparison']==cmp
 assert int(r['delta'])==sq.numerator-p*sq.denominator
 lower=math.isqrt(p);upper=lower+(lower*lower!=p);assert(int(r['lower']),int(r['upper']))==(lower,upper)
 if method=='ratio': assert cmp==0
 elif method=='frequency': assert cmp>0
 elif method=='length': assert cmp<0
 if s['interval']=='custom' and method=='integer':assert cmp!=0
 f=s['reference'];h1=f*float(m)/A;h2=h1 if cmp==0 else f*B/float(m)
 assert math.isclose(h1,r['firstHz'],rel_tol=2e-14) and math.isclose(h2,r['secondHz'],rel_tol=2e-14)
 if s['sound']=='halves': expected=[(.12,.8,f),(1.12,1,h1),(2.72,.8,f),(3.72,1,h2)]
 elif s['sound']=='path':expected=[(.12,.8,f),(1.12,.8,h1),(2.12,.8,f*a/b)]
 else:expected=[(.12,5.4,h1),(.12,5.4,h1 if s['sound']=='control' else h2)]
 tones=r['plan']['tones'];assert len(tones)==len(expected)
 for t,(start,duration,hz) in zip(tones,expected):
  assert t['start']==start and t['duration']==duration and math.isclose(t['hz'],hz,rel_tol=2e-14)
  assert 0<t['hz']<=990 and t['tuning']=='ratios';voices+=1
 assert math.isclose(r['plan']['duration'],max(t['start']+t['duration'] for t in tones)+.22)
 count+=1
assert count==83360,count
print(json.dumps({'cases':count,'scheduled_tones':voices,'arithmetic':'Python integers, Fraction and isqrt; approximate frequencies checked separately','scope':'All 64 superparticular families at all 256 scales, five middles each; named ratios, all sound modes and references'},indent=2))
