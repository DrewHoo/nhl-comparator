import sys,hashlib,json,re,html
from html.parser import HTMLParser
url=sys.argv[1]; h=hashlib.sha1(url.encode()).hexdigest(); host=url.split('/')[2]
raw=open(f'data/raw/{host}/{h[:2]}/{h}.body',encoding='utf-8',errors='replace').read()
class P(HTMLParser):
    def __init__(s): super().__init__(); s.out=[]; s.skip=0
    def handle_starttag(s,t,a):
        if t in('script','style','noscript'): s.skip+=1
        if t in('p','br','li','h1','h2','h3','h4','div','tr'): s.out.append('\n')
    def handle_endtag(s,t):
        if t in('script','style','noscript'): s.skip-=1
    def handle_data(s,d):
        if not s.skip: s.out.append(d)
p=P(); p.feed(raw); t=re.sub(r'[ \t]+',' ',''.join(p.out)); t=re.sub(r'\n\s*\n+','\n\n',t).strip()
out=f'research/league-apis/pages/{h}.txt'
open(out,'w').write(f'URL: {url}\nRetrieved: 2026-10-21 (fetch.mjs cache {h})\n\n'+t)
print(out, len(t))
