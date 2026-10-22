# Recompute every spot check quoted in the report from the cached files (data/raw). Run: python3 -I research/open-datasets/scratch/spotchecks.py
import csv, hashlib, json, collections, os
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..'))
def body(url):
    h=hashlib.sha1(url.encode()).hexdigest(); host=url.split('/')[2]
    return os.path.join(ROOT,'data','raw',host,h[:2],h+'.body')
B='https://github.com/sportsdataverse/sportsdataverse-data/releases/download/'
out={}
def agg(url, names, starter=False):
    rows=list(csv.DictReader(open(body(url))))
    res={'rows':len(rows),'cols':list(rows[0].keys())}
    if 'game_id' in rows[0]: res['games']=len(set(r['game_id'] for r in rows)); res['dates']=[min(r['game_date'] for r in rows),max(r['game_date'] for r in rows)]
    for n in names:
        rr=[r for r in rows if r['player_name']==n]
        res[n]={'rows':len(rr),'goals':sum(int(r.get('goals') or 0) for r in rr),'points':sum(int(r.get('points') or 0) for r in rr)}
    return res
for y in ['2010','2011','2018','2019']:
    out['player_box_'+y]=agg(B+f'nhl_player_boxscores/player_box_{y}.csv',['S. Crosby','A. Ovechkin','C. McDavid'])
for y in ['2011','2018']:
    out['skater_box_'+y]=agg(B+f'nhl_skater_boxscores/skater_box_{y}.csv',['S. Crosby','A. Ovechkin','C. McDavid'])
out['identical_player_box_2018_2019']=open(body(B+'nhl_player_boxscores/player_box_2018.csv'),'rb').read()==open(body(B+'nhl_player_boxscores/player_box_2019.csv'),'rb').read()
out['identical_team_box_2018_2019']=open(body(B+'nhl_team_boxscores/team_box_2018.csv'),'rb').read()==open(body(B+'nhl_team_boxscores/team_box_2019.csv'),'rb').read()
g=list(csv.DictReader(open(body(B+'nhl_goalie_boxscores/goalie_box_2011.csv'))))
out['goalie_box_2011']={'rows':len(g),'starter_values':dict(collections.Counter(r['starter'] for r in g)),'R. Luongo rows':sum(r['player_name']=='R. Luongo' for r in g),'R. Luongo starts':sum(r['player_name']=='R. Luongo' and r['starter']=='true' for r in g)}
m=list(csv.DictReader(open(body(B+'nhl_schedules/nhl_schedule_master.csv'))))
out['schedule_master']={'rows':len(m),'first_date':min(r['game_date'] for r in m),'season_labels':sorted(collections.Counter((r['season'],r['season_full']) for r in m).items())[:3]}
s=list(csv.DictReader(open(body(B+'nhl_schedules/nhl_schedule_2011.csv'))))
out['schedule_2011']={'rows':len(s),'season_labels':{f"{a}|{b}":c for (a,b),c in collections.Counter((r['season'],r['season_full']) for r in s).items()},'playoff_venues':dict(collections.Counter(r['venue'] for r in s if r['game_type']=='P'))}
ro=list(csv.DictReader(open(body(B+'nhl_rosters/rosters_2011.csv')))); out['rosters_2011_cols']=list(ro[0].keys())
gr=list(csv.DictReader(open(body(B+'nhl_game_rosters/game_rosters_2011.csv')))); out['game_rosters_2011']={'rows':len(gr),'cols':list(gr[0].keys())}
# Hockey Databank
D='https://raw.githubusercontent.com/rippinrobr/hockey-databank/master/'
S=list(csv.DictReader(open(body(D+'Scoring.csv'),encoding='latin-1'))); M=list(csv.DictReader(open(body(D+'Master.csv'),encoding='latin-1')))
lg=collections.defaultdict(list)
for r in S: lg[r['lgID']].append(int(r['year']))
out['databank_scoring_leagues']={k:[min(v),max(v),len(v)] for k,v in lg.items()}
out['databank_master']={'rows':len(M),'cols':list(M[0].keys()),'with_full_dob':sum(1 for r in M if r['birthYear'] and r['birthMon'] and r['birthDay']),'with_hrefID':sum(1 for r in M if r['hrefID'])}
def car(pid,lgid='NHL'):
    rr=[r for r in S if r['playerID']==pid and r['lgID']==lgid]
    return {'GP':sum(int(r['GP'] or 0) for r in rr),'G':sum(int(r['G'] or 0) for r in rr),'Pts':sum(int(r['Pts'] or 0) for r in rr),'PostGP':sum(int(r['PostGP'] or 0) for r in rr),'PostG':sum(int(r['PostG'] or 0) for r in rr)}
for pid in ['howego01','richama01','gretzwa01','malonjo01']: out['databank_'+pid]=car(pid)
out['databank_howego01_WHA']=car('howego01','WHA')
out['databank_malonjo01_1917']=[{k:r[k] for k in ['year','tmID','GP','G','A','Pts']} for r in S if r['playerID']=='malonjo01' and r['year']=='1917']
print(json.dumps(out,indent=1,default=str))
