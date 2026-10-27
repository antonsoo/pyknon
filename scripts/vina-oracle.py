#!/usr/bin/env python3
"""Independent high precision ratio-chain oracle, including actual CSV/SVG data.
No application import. Pure intervals are explicit modern assumptions, not
integer ratios attributed to the ancient text.
"""
import argparse
import csv
from decimal import Decimal as D, localcontext
from functools import lru_cache
import json
import math
from pathlib import Path
import sys

parser=argparse.ArgumentParser();parser.add_argument('--browser',type=Path);args=parser.parse_args()
POSITIONS=[0,1,999,1000,1001,1999,2000,2001,2999,3000,3001,3999,4000]
NAMES=['Sa','Ri','Ga','Ma','Pa','Dha','Ni']; COUNTS=[4,3,2,4,4,3,2]
def close(a,b):
    assert math.isclose(float(a),float(b),abs_tol=2e-10,rel_tol=2e-12),(a,str(b))

@lru_cache(None)
def preparation(tuning,tenth,root):
    with localcontext() as ctx:
        ctx.prec=70
        cents=lambda r:1200*r.ln()/D(2).ln()
        tone=D(9)/8;limma=D(256)/243
        a=cents(tone);l=cents(limma)
        p={'comma':cents(D(81)/80),'quarter':a/4,'boundary':(a-l)/2,'zero':D(0),'free':D(tenth)/10}[tuning]
        # Derive the two fifth chains as frequency ratios, independent of
        # the application's additive-cent note construction.
        re=tone/(D(2).ln()*p/1200).exp()
        ratios=[D(1),re,D(32)/27,D(4)/3,D(3)/2,re*D(3)/2,D(16)/9]
        fixed=[cents(x) for x in ratios]
        two=cents(ratios[2]/ratios[1]);three=cents(re)
        lowerings=[D(0),p,two,three,a]
        valid=tuning not in ['boundary','zero'] and p>0 and two<three
        return fixed,[D(root)*r for r in ratios],lowerings,valid,p,[a,three,two,a,a,three,two]

def expected(s):
    with localcontext() as ctx:
        ctx.prec=70
        fixed,hz,lowerings,valid,p,gaps=preparation(s['tuning'],s['tenth'],s['root'])
        stage,fraction=divmod(s['position'],1000)
        shift=lowerings[stage]+(lowerings[stage+1]-lowerings[stage])*D(fraction)/1000 if stage<4 else lowerings[4]
        moving=[x-shift for x in fixed];moving_hz=[x/((D(2).ln()*shift/1200).exp()) for x in hz]
        matches=[]
        for i,x in enumerate(moving):
            for j,y in enumerate(fixed):
                octave=round((x-y)/1200)
                if abs(x-y-1200*octave)<D('1e-8'):matches.append([i,j,octave])
        return {'fixed':fixed,'fixedHz':hz,'moving':moving,'movingHz':moving_hz,'lowerings':lowerings,'valid':valid,'p':p,'gaps':gaps,'shift':shift,'matches':matches}

cases=rows=groups=0;coverage=set()
if not args.browser:
    for line in sys.stdin:
        d=json.loads(line);s=d['state'];m=d['model'];e=expected(s)
        key=(s['tuning'],s['tenth'],s['root'],s['position']);assert key not in coverage;coverage.add(key)
        for field in ['fixed','moving','fixedHz','movingHz','lowerings','gaps']:
            assert len(m[field])==len(e[field])
            for x,y in zip(m[field],e[field]):close(x,y)
        for field in ['p','shift']:close(m[field],e[field])
        assert m['valid']==e['valid']
        assert [[p['moving'],p['fixed'],p['octave']] for p in d['matches']]==e['matches']
        cases+=1
    wanted={(kind,t,root,pos) for kind,t in [('free',t) for t in range(701)]+[(k,215) for k in ['comma','quarter','boundary','zero']] for root in [110,220] for pos in POSITIONS}
    assert coverage==wanted and cases==18330,'Incomplete or repeated inventory'
else:
    report=json.loads(args.browser.read_text());assert not report.get('partial')
    assert {(c['engine'],c['width']) for c in report['configurations']}=={('chromium',1440),('chromium',375),('firefox',1440),('firefox',375)}
    for c in report['configurations']:
        assert len(c['samples'])>=10
        for sample in c['samples']:
            s=sample['state'];e=expected(s)
            with (args.browser.parent/sample['csv']).open(newline='') as f:actual=list(csv.DictReader(f))
            assert len(actual)==7
            for i,r in enumerate(actual):
                assert r['note']==NAMES[i] and int(r['count_below'])==COUNTS[i]
                for field,ef in [('fixed_cents','fixed'),('moving_cents','moving'),('fixed_hz','fixedHz'),('moving_hz','movingHz')]:close(r[field],e[ef][i])
                close(r['lowering_cents'],e['shift']);close(r['pramana_cents'],e['p']);assert r['ordered_matches_valid']==str(e['valid']).lower();rows+=1
            assert len(sample['geometry'])==14
            for g in sample['geometry']:
                i=g['note'];field='fixed' if g['row']=='fixed' else 'moving';close(g['cents'],e[field][i]);close(g['hz'],e[field+'Hz'][i])
                # The actual rendered coordinate must preserve the SAME cents
                # scale in both rulers. It is not enough to verify data-* values.
                projected=D('522')-(e[field][i]+250)*D('.29') if g['phone'] else D(64)+(e[field][i]+250)*D('.61')
                close(g['coordinate'],projected);groups+=1
            cases+=1
print(json.dumps({'status':'passed','method':'70-digit Python Decimal, independent frequency-ratio chains; no application imports','cases':cases,'downloadedCsvRows':rows,'actualSvgGroups':groups},indent=2))
