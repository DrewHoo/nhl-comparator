import sys,re,glob
pre,pat=sys.argv[1],sys.argv[2]; n=int(sys.argv[3]) if len(sys.argv)>3 else 4; w=int(sys.argv[4]) if len(sys.argv)>4 else 200
f=glob.glob(f'pages/{pre}*.txt')[0]; t=open(f).read()
print('==',t.splitlines()[0][5:])
for i,m in enumerate(re.finditer(pat,t,re.I)):
    if i>=n: break
    s=t[max(0,m.start()-w):m.end()+w].replace('\n',' ¶ ')
    print('  -',s)
