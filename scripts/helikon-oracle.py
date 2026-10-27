"""Independent line-intersection and source-number oracle, using Fraction only."""
import sys,json,math
from fractions import Fraction as F
counts={'sourceBoards':0,'sourceSegments':0,'intervals':0,'retuningBoards':0,'notes':0,'exactFits':0}
def f(pair):return F(*pair)
def close(a,b):assert math.isclose(a,float(b),rel_tol=1e-12,abs_tol=1e-9),(a,b)
# Read directly from Wallis 1682 p.63; numbers are proportional string lengths.
numbers={'enharmonic':[2016,1944,1890,1512],'chromatic':[2016,1944,1792,1512],'diatonic':[2016,1944,1701,1512]}
# Solve two linear equations rather than using the production interpolation function.
def crossing(x,a,b):
 slope=(b[1]-a[1])/(b[0]-a[0]);return a[1]+slope*(x-a[0])
for raw in sys.stdin:
 c=json.loads(raw);s=c['state']
 if c['kind']=='source':
  h=F(s['bridge'],24);at_half=crossing(F(1,2),(F(0),F(0)),(F(1),h));at_third=crossing(F(2,3),(F(0),F(0)),(F(1),h))
  lengths={'AC':F(1),'HK':1-at_half,'GM':1-at_third,'FD':1-h,'BF':h,'LG':at_third,'EH':at_half}
  for p in c['segments']:
   l=lengths[p['id']];assert f(p['length'])==l and f(p['units'])==12*l and f(p['ratio'])==1/l;close(p['hz'],F(s['reference'])/l);counts['sourceSegments']+=1
  for p in c['pairs']:
   ratio=lengths[p['a']['id']]/lengths[p['b']['id']];assert f(p['actual'])==ratio;assert p['agrees']==(ratio==f(p['ratio']));close(p['cents'],1200*math.log2(ratio));counts['intervals']+=1
  if s['bridge']==12:assert [lengths[k]*12 for k in ['AC','HK','GM','FD','BF','LG','EH']]==[12,9,8,6,6,4,3]
  counts['sourceBoards']+=1
 else:
  q=F(s['scale'],12);targets=[F(2016,n) for n in numbers[s['target']]]
  for i,p in enumerate(c['rows']):
   x=F([0,s['x1'],s['x2'],504][i],504);y=crossing(x,(F(0),1-q),(F(1),1-F(3,4)*q));l=1-y
   actual=q/l;desired=targets[i];required=4*(1-1/desired)
   assert f(p['x'])==x and f(p['length'])==l and f(p['actual'])==actual and f(p['target'])==desired and f(p['targetLength'])==q/desired
   assert f(p['required'])==required and p['matches']==(actual==desired)
   close(p['hz'],F(s['reference'])/l);close(p['targetHz'],F(s['reference'])/q*desired);close(p['centsError'],1200*math.log2(actual/desired));counts['notes']+=1
  if c['kind']=='fit':
   assert all(p['matches'] for p in c['rows']);assert [F(n,504) for n in c['required']]==[4*(1-1/t) for t in targets];counts['exactFits']+=1
  counts['retuningBoards']+=1
print(json.dumps({'oracle':'Python fractions; independently intersected lines; primary p.63 length numbers','checked':counts},indent=2))
