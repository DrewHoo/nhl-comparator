import json, hashlib, os, sys
here=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,here)
from rows import F, C, REJ, TRIED, LEADS, UNV
pages=os.path.join(here,'..','pages')
def text(url):
    p=os.path.join(pages, hashlib.sha1(url.encode()).hexdigest()+'.txt')
    return open(p).read() if os.path.exists(p) else None
bad=0
def check(rs, label):
    global bad
    for x in rs:
        t=text(x['url'])
        if t is None: print('NOPAGE',label,x['url']); bad+=1
        elif x['quote'] not in t: print('MISS',label,x['url'][:70],'|',x['quote'][:90]); bad+=1
for f in F: check(f['receipts'], f['id'])
for c in C: check(c['receipts'], c['publisher'][:20])
for j in REJ: check(j['receipts'], 'rej')
print('factoids',len(F),'V',sum(f['verification']=='V' for f in F),'conventions',len(C),'bad',bad)
rows=[dict(kind='factoid',grade=f['verification'],**f) for f in F]+[dict(kind='convention',grade='V',**c) for c in C]
json.dump(dict(rows=rows,rejections=REJ,tried=TRIED,leads=LEADS,unverified=UNV), open(os.path.join(here,'..','return.json'),'w'), indent=1, ensure_ascii=False)
