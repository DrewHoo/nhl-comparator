# Builds research/open-datasets/return.json and string-checks every receipt quote against
# research/open-datasets/pages/<sha1(url)>.txt, falling back to the data/raw cache body.
import json, hashlib, os, html, sys
HERE=os.path.dirname(os.path.abspath(__file__)); SLICE=os.path.dirname(HERE); ROOT=os.path.dirname(os.path.dirname(SLICE))
D='2026-10-21'
def sha(u): return hashlib.sha1(u.encode()).hexdigest()
def text_for(u):
    p=os.path.join(SLICE,'pages',sha(u)+'.txt')
    t=open(p,encoding='utf-8',errors='replace').read() if os.path.exists(p) else ''
    host=u.split('/')[2].replace(':','_'); b=os.path.join(ROOT,'data','raw',host,sha(u)[:2],sha(u)+'.body')
    if os.path.exists(b): t+='\n'+open(b,encoding='utf-8',errors='replace').read()
    return t
def norm(s): return ' '.join(html.unescape(s).split())
def R(url,quote,note=None):
    r={'url':url,'quote':quote,'retrieved':D}
    if note: r['note']=note
    return r
SDV='https://github.com/sportsdataverse/sportsdataverse-data/releases/download/'
REL4='https://api.github.com/repos/sportsdataverse/sportsdataverse-data/releases?per_page=100&page=4'
REL3='https://api.github.com/repos/sportsdataverse/sportsdataverse-data/releases?per_page=100&page=3'
HSP='http://hsp.flyershistory.com/'; INV='http://www.flyershistory.com/cgi-bin/hsp-inventory.cgi'
DB='https://raw.githubusercontent.com/rippinrobr/hockey-databank/master/README.md'
MP='https://moneypuck.com/data.htm'
KE='https://www.kaggle.com/api/v1/datasets/view/martinellis/nhl-game-data'
KO='https://www.kaggle.com/api/v1/datasets/view/open-source-sports/professional-hockey-database'
HRS='https://www.hockey-reference.com/about/sources.html'; SRU='https://www.sports-reference.com/data_use.html'
NDB='https://huggingface.co/api/datasets/RentoSaijo/NHL_DB'; NDBG='https://huggingface.co/datasets/RentoSaijo/NHL_DB/raw/main/R/Game.R'
INFO='https://www.infodocket.com/2017/09/28/reference-hockey-nhl-releases-massive-online-database-of-historical-statistics-100-years-of-player-team-and-game-data/'
SPOT='research/open-datasets/scratch/spotchecks.py (recomputes from the data/raw cache)'
rows=[
 {'name':'sportsdataverse-data nhl_* releases (producer fastRhockey-nhl-data, raw fastRhockey-nhl-raw)','url':'https://github.com/sportsdataverse/sportsdataverse-data/releases',
  'span_first':'2009-10 (file *_2010 = season 2009-10; schedule_master first game 2009-10-01)','span_last':'2026-27 in progress (assets updated 2026-10-21)',
  'grain':'player-game (skater_box, goalie_box, player_box), team-game (team_box), game (schedule, game_info), game-roster, play-by-play, shifts',
  'ids':'NHL.com player_id and game_id (skater_box/goalie_box/game_rosters/schedule); player_box and team_box carry NO game_id/season/date column',
  'license':'MIT (fastRhockey-nhl-data LICENSE.md and sportsdataverse-data LICENSE); umbrella README carries a CC BY 4.0 badge; fastRhockey-nhl-raw has no LICENSE (404); GitHub detects fastRhockey-nhl-data as Other/NOASSERTION',
  'license_url':'https://raw.githubusercontent.com/sportsdataverse/fastRhockey-nhl-data/main/LICENSE.md','hosting':'GitHub Releases (csv, parquet, rds)','maintained':'yes: nightly in season; player_box_2027.csv updated 2026-10-21','keyless':True,
  'lineage':'NHL API (api-web.nhle.com) via fastRhockey-nhl-raw JSON, per the raw repo README','grade':'V',
  'three_spot_checks':[
    {'what':'player_box_2010.csv: Crosby rows/goals/points (2009-10 incl. playoffs)','value':'94 rows, 57 G, 128 P (= 81+13 GP, 51+6 G, 109+19 P; regular+playoff mixed, no game_type column)','receipt':SPOT},
    {'what':'skater_box_2011.csv: Ovechkin 2010-11','value':'88 rows, 37 G, 95 P; 1318 games, 2010-10-07..2011-06-15','receipt':SPOT},
    {'what':'skater_box_2018.csv vs player_box_2018.csv: McDavid','value':'skater_box_2018: 82 rows 41 G 108 P (2017-18). player_box_2018: 78 rows 41 G 116 P (2018-19) and byte-identical to player_box_2019; team_box_2018 also identical to team_box_2019','receipt':SPOT}],
  'generalizes':'Start any per-game ledger at 2009-10 from skater_box/goalie_box (game_id present); avoid player_box/team_box (no game key, 2017-18 missing). No DOB; join birth dates elsewhere (Wikidata, MoneyPuck bios, NHL landing).',
  'receipts':[R(REL4,'player_box_2010.csv 4477618','asset listing (NHL extract of the GitHub releases API)'),
              R(REL4,'player_box_2018.csv 4575149'),R(REL4,'player_box_2019.csv 4575149','same byte size as 2018; files compared byte-identical by spotchecks.py'),
              R(SDV+'nhl_player_boxscores/player_box_2011.csv','home_away,team_id,team_abbrev,player_id,player_name,sweater_number,position,goals,assists,points','header; no game_id column'),
              R(SDV+'nhl_skater_boxscores/skater_box_2011.csv','shifts,giveaways,takeaways,game_id,season,game_date'),
              R('https://raw.githubusercontent.com/sportsdataverse/fastRhockey-nhl-raw/main/README.md','Raw NHL game JSON data scraped from the NHL API via'),
              R('https://raw.githubusercontent.com/sportsdataverse/fastRhockey-nhl-data/main/LICENSE.md','Copyright (c) 2026 fastRhockey.nhl.data authors'),
              R('https://raw.githubusercontent.com/sportsdataverse/sportsdataverse-data/main/README.md','BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-blue.svg?style=flat-square)'),
              R(SDV+'nhl_schedules/nhl_schedule_2011.csv','2010030417,20102011,P,2011-06-15,2011-06-16T00:00:00Z,VAN,BOS,Vancouver Canucks,Boston Bruins,1,4,OFF,Honda Center,2010','Game 7 of the 2011 final shown at Honda Center (Anaheim); every 2010-11 playoff row has this venue')]},
 {'name':'sportsdataverse-data nhl_groups','url':'https://github.com/sportsdataverse/sportsdataverse-data/releases/tag/nhl_groups','span_first':'1918 (asset years)','span_last':'2027','grain':'division/conference membership by season','ids':'group_id, team abbreviation','license':'MIT (repo LICENSE) / CC BY 4.0 badge','license_url':'https://raw.githubusercontent.com/sportsdataverse/sportsdataverse-data/main/LICENSE','hosting':'GitHub Releases','maintained':'updated 2026-10-12','keyless':True,'lineage':'hand-curated reference data (notes cite lineage of each division)','grade':'V',
  'three_spot_checks':[{'what':'nhl_groups.csv row','value':'nhl:american division 1927-1938','receipt':SDV+'nhl_groups/nhl_groups.csv'}],'generalizes':'Reference join for era/division filters back to 1918.',
  'receipts':[R(SDV+'nhl_groups/nhl_groups.csv','nhl,nhl:american,division,1927,1938,"1926-27 to 1937-38, with no conferences"')]},
 {'name':'Hockey Summary Project (HSP)','url':HSP,'span_first':'1917-18','span_last':'2016-17 (last site update June 18, 2017)','grain':'game summaries (score, scoring with assists, penalties, goalies); game rosters only for 1993-94 and 1994-95 per changelog',
  'ids':'none public (team names, dates)','license':'"The Hockey Summary Project allows for free usage of its data including the production of a commercial product based upon the data, subject to the terms outlined below." + mandatory attribution statement',
  'license_url':HSP,'hosting':'flyershistory.com CGI (POST form, one team-season at a time); Yahoo group "Files" (Yahoo Groups is gone; no groups.io successor found)','maintained':'no: last changelog entry June 18, 2017','keyless':True,
  'lineage':'volunteer compilation since 2001 ("By researchers. For researchers."); Hockey-Reference credits it for some game scores and sweater numbers; Hockey Databank lists it as a source','grade':'V',
  'three_spot_checks':[{'what':'inventory 1917-18','value':'36 of 36 Complete','receipt':INV},{'what':'inventory 1950-51','value':'210 games, none in inventory','receipt':INV},{'what':'inventory 1988-89','value':'840 games, 80 in inventory (All Philadelphia Flyer games)','receipt':INV}],
  'generalizes':'Complete seasons: 1917-27, 1929-30, 1938-39, 1942-43, 1952-53..1987-88, 1989-91, 1992-2017 (no 2004-05). Missing/partial: 1927-29, 1930-38, 1939-42, 1943-52, 1988-89, 1991-92. Team-game ledger possible from it; player "through N games" needs who-dressed, which it lacks outside 1993-95.',
  'receipts':[R(HSP,'The Hockey Summary Project allows for free usage of its data including the production of a commercial product based upon the data, subject to the terms outlined below.'),
              R(HSP,'"The information used herein was obtained free of charge from and is copyrighted by The Hockey Summary Project.'),
              R(HSP,'Apr 27, 2009 - Game rosters added for 1993-94 and 1994-95 regular season and playoffs'),
              R(HSP,'June 18, 2017 - 2016-17 playoffs added'),
              R(INV,'1950-51 210'),R(INV,'1988-89 840 80 All Philadelphia Flyer games'),R(INV,'1917-18 36 36 Complete')]},
 {'name':'Hockey Databank (Lahman-style; public mirror rippinrobr/hockey-databank)','url':'https://github.com/rippinrobr/hockey-databank','span_first':'1909-10 (NHA); NHL 1917-18','span_last':'2017-18 public (v13.0, July 10, 2018); groups.io lists a hdb-2024-08-19.zip (members only)',
  'grain':'player-season (Scoring, Goalies with Post* columns), team-season, team-vs-team, series; no per-game rows','ids':'playerID (Hockey-Reference style), hrefID, ihdbID (hockeydb), legendsID; Master has birthYear/Mon/Day; no NHL.com id',
  'license':'"The Hockey Databank project allows for free usage of its data, including the production of a commercial product based upon the data" + mandatory attribution statement','license_url':DB,
  'hosting':'GitHub (CSV, public mirror); groups.io files behind login; Kaggle v1 copy (2019)','maintained':'group alive on groups.io (98 members, topic "season 2025-2026"); public mirror last pushed 2019-02',
  'keyless':True,'lineage':'NHL Guides/Record Books, Total Hockey, Hockey-Reference, HSP, hockeydb, SIHR, NHL.com and others (README 1.1)','grade':'V',
  'three_spot_checks':[{'what':'Gordie Howe NHL career','value':'1767 GP, 801 G, 1850 Pts (plus WHA rows lgID=WHA 419 GP 174 G)','receipt':SPOT},{'what':'Maurice Richard NHL career','value':'978 GP, 544 G, 966 Pts','receipt':SPOT},{'what':'Joe Malone 1917-18','value':'MTL 20 GP 44 G 4 A','receipt':SPOT}],
  'generalizes':'Season-total floor 1917-18 for NHL (1909-10 with NHA/PCHA/WCHL as separate lgID; WHA 1972-79 separate). Through-N-seasons boards for Howe/Richard are possible from this alone. Join to NHL.com ids via Wikidata (8,523 people carry both P3598 and P3522).',
  'receipts':[R(DB,'The Hockey Databank project allows for free usage of its data, including the'),R(DB,'production of a commercial product based upon the data, subject to the terms'),R(DB,'Hockey Database version 13.0, July 10, 2018'),
              R(DB,'- World Hockey Association (WHA), 1972-73 through 1978-79'),R(DB,'An acknowledgement is also given to the team led by Sean Forman and Sean Lahman'),
              R('https://groups.io/g/hockey-databank','File /hdb-2024-08-19.zip uploaded'),R('https://groups.io/g/hockey-databank/files','Please Log In'),
              R('https://relational.fel.cvut.cz/dataset/Hockey','It contains individual and team statistics from 1909-10 through the 2011-12 season.','older CTU mirror; superseded by v13.0')]},
 {'name':'MoneyPuck data page','url':MP,'span_first':'2008-09 (season and game-by-game); shots 2007-08','span_last':'2026-27 (nightly)','grain':'player-game (per-player files under careers/gameByGame/regular/...), player-season, team-game (all_teams.csv), shot; bios lookup',
  'ids':'NHL.com playerId','license':'"The data below is free to use for non-commercial purposes and by journalists for ad-hoc use. Please clearly credit MoneyPuck.com in all cases where you are showing anything using our data as an input."','license_url':MP,'hosting':'moneypuck.com + peter-tanner.com zips','maintained':'yes','keyless':True,'lineage':'NHL play-by-play/API (shot data, xG models are MoneyPuck\'s own)','grade':'V',
  'three_spot_checks':[{'what':'season list','value':'2008-2009 .. 2026-2027','receipt':MP},{'what':'shot count all seasons','value':'2,079,359 shots 2007-08..2025-26','receipt':MP},{'what':'bios file','value':'allPlayersLookup.csv, players from 2007 onwards with birthdate','receipt':MP}],
  'generalizes':'Per-game ledger could start 2008-09 under non-commercial terms; one season earlier than sportsdataverse. Playoff game files not visibly linked (unverified).',
  'receipts':[R(MP,'The data below is free to use for non-commercial purposes and by journalists for ad-hoc use.'),R(MP,'Non-approved scraping of the MoneyPuck website will be blocked.'),R(MP,'List of all NHL players from 2007 onwards with birthdate, height, etc'),R(MP,"moneypuck/playerData/careers/gameByGame/regular/skaters/' + foundPlayerId + '.csv'")]},
 {'name':'NHL_DB (Hugging Face dataset RentoSaijo/NHL_DB, built with nhlscraper)','url':'https://huggingface.co/datasets/RentoSaijo/NHL_DB','span_first':'1917-18 (game rosters, raw GC and WSC play-by-play)','span_last':'2026-27 (daily cron)',
  'grain':'game-roster (who dressed), play-by-play raw 1917+; cleaned pbp, shift charts 2010-11+','ids':'NHL.com gameId/playerId (via NHL API)','license':'none stated (no license tag, no dataset card/README)','license_url':NDB,'hosting':'Hugging Face (parquet)','maintained':'yes: lastModified 2026-10-21; GitHub Action cron daily',
  'keyless':True,'lineage':'NHL API (nhlscraper::game_roster, gc_play_by_play_raw)','grade':'V (listing) / unverified (contents)',
  'three_spot_checks':[{'what':'NHL_ROSTERS_19171918.parquet size','value':'7953 bytes','receipt':'https://huggingface.co/api/datasets/RentoSaijo/NHL_DB/tree/main/data/game/rosters'},{'what':'NHL_PBPS_GC_Raw_19501951.parquet size','value':'69852 bytes','receipt':'https://huggingface.co/api/datasets/RentoSaijo/NHL_DB/tree/main/data/game/pbps/gc'},{'what':'109 season files per raw dataset','value':'19171918..20262027','receipt':NDB}],
  'generalizes':'Only third-party-hosted file found with per-game rosters back to 1917; same lineage and same terms problem as a self-compiled NHL API pull. Contents not read (parquet is binary; the fetch helper caches text).',
  'receipts':[R(NDB,'data/game/rosters/NHL_ROSTERS_19171918.parquet'),R(NDB,'data/game/pbps/gc/NHL_PBPS_GC_Raw_19171918.parquet'),R(NDBG,'fetch_fun = nhlscraper::game_roster'),R(NDBG,'fetch_fun = nhlscraper::gc_play_by_play_raw')]},
 {'name':'Kaggle: NHL Game Data (Martin Ellis)','url':'https://www.kaggle.com/datasets/martinellis/nhl-game-data','span_first':'2000-01 [R]','span_last':'2019-20 [R]; lastUpdated 2020-12-11','grain':'player-game (game_skater_stats, game_goalie_stats), team-game, plays, shifts','ids':'NHL.com game_id/player_id',
  'license':'"Other (specified in description)" but the description specifies none','license_url':KE,'hosting':'Kaggle (login to download)','maintained':'no (2020-12-11)','keyless':False,'lineage':'old NHL stats API (statsapi.web.nhl.com), per its acknowledgements','grade':'V (metadata) / R (span)',
  'three_spot_checks':[{'what':'license field','value':'Other (specified in description)','receipt':KE},{'what':'lastUpdated','value':'2020-12-11','receipt':KE},{'what':'file list','value':'game_skater_stats.csv 71,503,207 bytes; game_goalie_stats.csv','receipt':'https://www.kaggle.com/api/v1/datasets/list/martinellis/nhl-game-data'}],
  'generalizes':'At best a compiler\'s claim over an NHL API pull; here not even a claim. Stale.',
  'receipts':[R(KE,'licenseName: Other (specified in description)'),R(KE,'which was used to gather this data'),R(KE,'lastUpdated: 2020-12-11')]},
 {'name':'NHLData (CRAN R package)','url':'https://cran.r-project.org/web/packages/NHLData/index.html','span_first':'1917-18','span_last':'~2015-16 [R] (published 2017-03-08)','grain':'team-game scores','ids':'team names (renamed to latest franchise name)','license':'CC0 (package field)','license_url':'https://cran.r-project.org/web/packages/NHLData/index.html','hosting':'CRAN','maintained':'no (1.0.0, 2017)','keyless':True,'lineage':'Hockey-Reference (stated Source)','grade':'V',
  'three_spot_checks':[{'what':'License','value':'CC0','receipt':'https://cran.r-project.org/web/packages/NHLData/index.html'},{'what':'Source','value':'www.hockey-reference.com','receipt':'https://cran.r-project.org/web/packages/NHLData/refman/NHLData.html'},{'what':'team names','value':'Toronto Maple Leafs refers to Arenas/St. Patricks too','receipt':'https://cran.r-project.org/web/packages/NHLData/refman/NHLData.html'}],
  'generalizes':'CC0 over Sports Reference data: the compiler cannot grant what SR terms withhold. Team-game only.',
  'receipts':[R('https://cran.r-project.org/web/packages/NHLData/index.html','NHLData: Scores for Every Season Since the Founding of the NHL in 1917'),R('https://cran.r-project.org/web/packages/NHLData/refman/NHLData.html','www.hockey-reference.com')]},
 {'name':'Wikidata NHL.com player id (P3522) and Hockey-Reference id (P3598)','url':'https://query.wikidata.org/','span_first':'all eras','span_last':'live','grain':'person crosswalk + DOB + team stints','ids':'P3522 NHL.com, P3598 Hockey-Reference','license':'CC0 (Wikidata) [R]','license_url':'https://www.wikidata.org/wiki/Wikidata:Licensing','hosting':'SPARQL endpoint','maintained':'yes','keyless':True,'lineage':'volunteer-entered ids','grade':'V',
  'three_spot_checks':[{'what':'items with P3522','value':'14,040 (14,012 with P569 DOB; 12,496 with P54 team)','receipt':'research/open-datasets/pages (SPARQL result, see report)'},{'what':'items with P3598','value':'8,828','receipt':'SPARQL'},{'what':'items with both P3598 and P3522','value':'8,523','receipt':'SPARQL'}],
  'generalizes':'The HR-id <-> NHL.com-id crosswalk that joins Hockey Databank (hrefID) to NHL API ids.','receipts':[]},
 {'name':'Chadwick register key_sr_nhl','url':'https://github.com/chadwickbureau/register','span_first':'n/a','span_last':'n/a','grain':'person crosswalk','ids':'key_sr_nhl','license':'ODC-By [R]','license_url':'https://github.com/chadwickbureau/register','hosting':'GitHub','maintained':'yes','keyless':True,'lineage':'baseball register','grade':'V',
  'three_spot_checks':[{'what':'rows with key_sr_nhl filled','value':'9 of 526,894 (multi-sport baseball people: Kane, Oliver, Dubé, Dion...)','receipt':'research/open-datasets/scratch/chadwick.mjs over people-0..f.csv'}],'generalizes':'Useless as an NHL crosswalk.','receipts':[]},
]
rejections=[
 {'claim':'Shared context: the Chadwick register carries key_sr_nhl (implying a usable NHL crosswalk)','reason':'Only 9 of 526,894 rows have it filled, all baseball people who also played hockey.','receipts':[{'url':'https://raw.githubusercontent.com/chadwickbureau/register/master/data/people-0.csv','quote':'key_sr_nhl'}]},
 {'claim':'Shared context: sportsdataverse NHL assets "last updated Apr-May 2026"','reason':'Assets are being updated in season: player_box_2027.csv, skater/goalie/schedule timestamps 2026-10-21.','receipts':[{'url':REL4,'quote':'player_box_2027.csv 707335 2026-10-21'}]},
 {'claim':'Shared context: sportsdataverse spans "2010–2027" read as 2010-11 onward','reason':'File years are end years: player_box_2010 is 2009-10 (Crosby 57 G incl. playoffs) and schedule_master starts 2009-10-01. Floor is 2009-10. Caveat: per-season schedule files label season by start year (nhl_schedule_2011 has season=2010, season_full=20102011).','receipts':[{'url':SDV+'nhl_schedules/nhl_schedule_2011.csv','quote':'2010030417,20102011,P,2011-06-15'}]},
 {'claim':'sportsdataverse nhl_player_boxscores covers every season 2009-10..2026-27','reason':'player_box_2018.csv is byte-identical to player_box_2019.csv and holds 2018-19 (McDavid 78 rows 116 P); 2017-18 is absent from player_box and team_box. skater_box_2018 is correct (McDavid 82/41/108). player_box and team_box also lack game_id.','receipts':[{'url':REL4,'quote':'player_box_2019.csv 4575149'}]},
 {'claim':'Hockey Databank stops at 2011-12 (CTU mirror) / is dead with Yahoo Groups','reason':'Public GitHub mirror is v13.0 through 2017-18; the group lives on groups.io with a 2024-08-19 file and a 2025-26 topic.','receipts':[{'url':DB,'quote':'13.0  Jul. 10, 2018   2017-18 update'},{'url':'https://groups.io/g/hockey-databank','quote':'File /hdb-2024-08-19.zip uploaded'}]},
 {'claim':'HYPOTHESIS: every per-game source before 2007-08 descends from the NHL API or Hockey-Reference (itself from HSP), so two sources agreeing is one source twice','reason':'Partly rejected. Two independent lineages exist for pre-1987 games: (1) the NHL\'s own league-office archive, digitized for the 2017 centennial and served by the NHL API (NHL_DB, any self-pull); (2) the volunteer HSP. Hockey-Reference is not simply HSP downstream: it credits Dan Diamond and Associates (licensed) for much data and HSP only for some game scores and sweater numbers. The hypothesis holds for 1987-88..2009-10 third-party per-game files (all NHL API pulls) and for NHLData (HR).','receipts':[{'url':INFO,'quote':'As the NHL celebrates its centennial, it has digitized its statistics archive.'},{'url':HRS,'quote':'licensed much of the data used to create this'},{'url':HRS,'quote':'Some game scores and many sweater numbers come courtesy of research done'}]},
]
tried=[
 {'source':'sportsdataverse-data espn_nhl_* tags','outcome':'only espn_nhl_injuries (2026, 2027); no ESPN NHL box scores'},
 {'source':'sportsdataverse/fastRhockey-data (legacy)','outcome':'archived; PHF data; nothing usable for NHL pre-2010'},
 {'source':'hockeyR-data (danmorse314)','outcome':'play-by-play 2010-11..2023-24, no license, last push 2024-06-25; no coverage before 2010'},
 {'source':'Kaggle s903124/nhl-playbyplay-data-from-2007','outcome':'pbp/shifts 2007+ via hockey_scraper, LGPL-3.0 tag, 2023-01; no coverage before 2007'},
 {'source':'Kaggle kapastor/nhl-data','outcome':'CC0, events 2015-2019 only'},
 {'source':'Kaggle open-source-sports/professional-hockey-database','outcome':'Hockey Databank v1 copy (2019), same terms; superseded by GitHub mirror v13'},
 {'source':'SFU Computational Logic Lab NHL Data (FRDR)','outcome':'pbp 2001-2014, CC BY-NC-ND 4.0 (no derivatives): license forbids'},
 {'source':'Natural Stat Trick','outcome':'scraping only via keyed data.naturalstattrick.com (80 pages/5 min); no bulk files; 2007-08+ [R]'},
 {'source':'Evolving-Hockey','outcome':'terms forbid bots and limit to personal use; paid'},
 {'source':'hockeydb.com','outcome':'license forbids: crawling prohibited, no public-domain re-release'},
 {'source':'QuantHockey','outcome':'blocked (403)'},
 {'source':'Elite Prospects','outcome':'blocked (403) on terms page; paid API'},
 {'source':'SIHR','outcome':'member-only player database (season totals, many leagues); no game data seen'},
 {'source':'Hugging Face search nhl/hockey','outcome':'only NHL_DB reaches before 2010; others 2010+ or betting'},
 {'source':'GitHub repo search (nhl boxscores, nhl game logs, hockey summary project, hockey databank)','outcome':'nothing usable before 2010 except rippinrobr/hockey-databank (season totals)'},
 {'source':'groups.io hockey_summary_project / hockeysummaryproject','outcome':'nothing usable (404)'},
 {'source':'HSP hspgames.cgi via GET','outcome':'nothing usable (form is POST-only; not pursued)'},
 {'source':'ultimate70s.com nhlbox (HSP-credited mirror)','outcome':'nothing usable (content rendered by script)'},
 {'source':'Chadwick register key_sr_nhl','outcome':'nothing usable (9 rows)'},
 {'source':'nhlscraper, Hockey-Scraper, dword4/nhlapi, Zmalski/NHL-API-Reference','outcome':'code/docs only, no data releases; no rate-limit or terms guidance found beyond "unofficial reference"'},
]
leads=[
 {'note':'Ask the HSP maintainer (Peter Anson, flyershistory.com) for the bulk summary files and confirm the stated terms cover a web comparator; it is the only Retrosheet-like per-game source 1917-2017','why_out_of_scope':'contacting people and bulk retrieval are Drew\'s decisions'},
 {'note':'Join groups.io/g/hockey-databank to get hdb-2024-08-19.zip (season totals through 2023-24 under free-commercial terms)','why_out_of_scope':'brief says do not join'},
 {'note':'Read NHL_DB parquet (NHL_ROSTERS_19171918, NHL_PBPS_GC_Raw_*) with a binary-safe fetch to confirm 1917+ who-dressed rows; ask the author for a license','why_out_of_scope':'fetch helper caches text and corrupts binary; no parquet reader installed'},
 {'note':'records.nhl.com / NHL stats game logs 1917-1987 came from the league-office archive (2017): the league-apis slice should test NHL API vs HSP agreement on a few 1950s games as the independent cross-check','why_out_of_scope':'NHL API is the league-apis slice'},
 {'note':'MoneyPuck says to message for approval; a written OK for a donation-supported site would settle 2008-09','why_out_of_scope':'sending messages needs Drew'},
]
unverified=[
 {'claim':'Kaggle Ellis NHL Game Data spans 2000-01..2019-20','what_i_tried':'Kaggle metadata API (no file download without login); description says "past 6 years"'},
 {'claim':'MoneyPuck game-by-game files include playoffs','what_i_tried':'data.htm links show only careers/gameByGame/regular/... paths'},
 {'claim':'NHL_DB 1917 rosters list every dressed player','what_i_tried':'listing and sizes only; parquet not readable'},
 {'claim':'HSP summaries list assists and goalie minutes for every game','what_i_tried':'CGI is POST-only; ultimate70s mirror renders by script'},
 {'claim':'Hockey-Reference player game logs begin 1987-88','what_i_tried':'not checked (one-page rule); the 2017 NHL article says NHL.com game logs did'},
 {'claim':'Wikipedia has no per-game logs, only CC BY-SA season tables','what_i_tried':'not checked'},
 {'claim':'NHL Edge is NHL.com-terms tracking data 2021+','what_i_tried':'not checked'},
]
out={'rows':rows,'rejections':rejections,'tried':tried,'leads':leads,'unverified':unverified}
# quote check
bad=0
def chk(rs):
    global bad
    for r in rs:
        u=r['url']
        if not u.startswith('http'): continue
        if norm(r['quote']) not in norm(text_for(u)): bad+=1; print('MISSING', u, '|', r['quote'][:90])
for x in rows: chk(x['receipts'])
for x in rejections: chk(x['receipts'])
json.dump(out,open(os.path.join(SLICE,'return.json'),'w'),indent=1,ensure_ascii=False)
print('wrote return.json; missing quotes:',bad)
