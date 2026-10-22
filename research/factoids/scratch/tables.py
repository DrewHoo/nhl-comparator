import os,sys; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from rows import F, C
order=['player glory','player futility','goalies','team glory','team futility','coaches','rookies','playoffs']
out=[]
esc=lambda s: str(s).replace('|','\\|').replace('\n',' ')
for sec in order:
    out.append(f'\n### {sec.capitalize()}\n')
    out.append('| # | Claim | Publisher | Numbers | Scope (season · league · unit) | Who / pop. | Stat | Agg | Window | Field | Grade |')
    out.append('|---|---|---|---|---|---|---|---|---|---|---|')
    for f in F:
        if f['section']!=sec: continue
        nums='; '.join(f'{k}: {v}' for k,v in f['numbers'].items())
        s=f['scope']; sl=f['slots']
        pub=f"[{esc(f['publisher'])}]({f['url']})" if f['url'] else esc(f['publisher'])
        claim=esc(f['claim'])+ (f" *({esc(f['note'])})*" if f.get('note') else '')
        out.append(f"| {f['id']} | {claim} | {pub} | {esc(nums)} | {esc(s['season'])} · {esc(s['league'])} · {esc(s['games_unit'])} | {esc(sl['who'])} / {esc(sl['population'])} | {esc(sl['stat'])} | {esc(sl['agg'])} | {esc(sl['window'])} | {esc(sl['field'])} | {f['verification']} |")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'tables.md'),'w').write('\n'.join(out))
qs={}
for c in C: qs.setdefault(c['question'],[]).append(c)
o=[]
for q in sorted(qs):
    o.append(f'\n### Q{q}\n')
    for c in qs[q]:
        quotes=' · '.join(f'“{x["quote"]}” ([src]({x["url"]}))' for x in c['receipts'])
        o.append(f"- **{c['publisher']}**: {c['answer']} [V] {quotes}")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'conv.md'),'w').write('\n'.join(o))
