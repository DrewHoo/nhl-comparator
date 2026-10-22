# Factoid + convention rows. build.py checks every quote against pages/<sha1(url)>.txt
W='https://en.wikipedia.org/wiki/'
IND=W+'List_of_NHL_records_(individual)'; TEAM=W+'List_of_NHL_records_(team)'; F50=W+'50_goals_in_50_games'
K1=W+'List_of_NHL_players_with_1,000_points'; G500=W+'List_of_NHL_players_with_500_goals'; W300=W+'List_of_NHL_goaltenders_with_300_wins'
LEAD=W+'List_of_NHL_statistical_leaders'; DRO=W+'List_of_NHL_franchise_post-season_droughts'
HR='https://www.hockey-reference.com/leaders/points_career.html'
NHL_MCD='https://www.nhl.com/news/oilers-connor-mcdavid-scores-1000th-nhl-point'
NHL_MCD_PRE='https://www.nhl.com/news/connor-mcdavid-closing-in-on-1000-nhl-points'
NHL_OV='https://www.nhl.com/news/alex-ovechkin-wayne-gretzky-nhl-goals-record-chase'
NHL_Q='https://www.nhl.com/news/numbers-at-quarter-mark-of-2024-25-nhl-season'
NHL_MAK='https://www.nhl.com/news/makar-records-100th-career-point-327355166'
TSN_MAK='https://www.tsn.ca/nhl/colorado-avalanche-s-cale-makar-becomes-fifth-fastest-defensemen-to-reach-100-goals-in-nhl-history-1.2238676'
TSN_900='https://www.tsn.ca/nhl/by-the-numbers-mcdavid-chasing-history-in-pursuit-of-1-000-points-1.2056657'
OIL='https://nhl.com/oilers/news/release-mcdavid-wins-art-ross-rocket-richard-trophies-343565052'
ESPN='https://www.espn.com/nhl/story/_/id/31166656/the-buffalo-sabres-epic-winless-streak-continues-most-fault-how-do-get-back-track'
NBC='https://www.nbcsportsbayarea.com/nhl/san-jose-sharks/macklin-celebrini-las-vegas-golden-knights/1798168'
CBS_C='https://www.cbssports.com/nhl/news/sidney-crosby-breaks-wayne-gretzkys-longstanding-record-with-20th-season-averaging-a-point-per-game'
CBS_M='https://www.cbssports.com/nhl/news/maple-leafs-auston-matthews-breaks-a-record-set-by-wayne-gretzky-with-scorching-start'
CBS_B='https://www.cbssports.com/nhl/news/blackhawks-connor-bedard-makes-nhl-history-with-four-points-against-lightning/'
SI_B='https://www.si.com/nhl/2024/01/05/blackhawks-connor-bedard-makes-nhl-history-with-all-star-selection'
NHL_TDIH='https://www.nhl.com/news/this-date-in-nhl-history-april-17-280320680'
SJS='https://www.nhl.com/sharks/news/sharks-sign-forward-macklin-celebrini-to-a-five-year-contract-extension'
THN_COOP='https://thehockeynews.com/nhl/tampa-bay-lightning/latest-news/jon-cooper-records-600th-nhl-win'
THN_HEL='https://thehockeynews.com/news/latest-news/connor-hellebuyck-becomes-fifth-nhl-goalie-to-win-vezina-and-hart-trophies-in-same-season'
GWR_L='https://guinnessworldrecords.com/world-records/most-consecutive-30-win-seasons-to-start-an-nhl-goaltender-career'
GWR_Y='https://guinnessworldrecords.com/world-records/youngest-player-to-play-in-nhl'
GWR_W='https://www.guinnessworldrecords.com/world-records/most-individual-wins-in-an-nhl-season'
GWR_D='https://www.guinnessworldrecords.com/world-records/fastest-goal-scored-in-an-nhl-debut'
LAINE='https://nhl.com/news/jets-patrik-laine-turns-20-happy-with-numbers-298130784'
THN_BED='https://thehockeynews.com/nhl/chicago-blackhawks/latest-news/connor-bedard-had-very-impressive-pre-20s-nhl-showing'
EXP=W+'1979_NHL_expansion'
SI_AP='https://www.si.com/nhl/2017/09/26/ap-hkn-canadiens-rocket-assist'
DFO='https://www.dailyfaceoff.com/news/the-10-greatest-cy-young-seasons-in-nhl-history'
SRB='https://sports-reference.com/blog/2021/07/hockey-reference-adds-nhl-game-logs-back-to-1917-18-2'
QH='https://www.quanthockey.com/nhl/records/nhl-players-all-time-goals-per-game-leaders.html'
THW='https://thehockeywriters.com/jagr-breaks-nhl-gwg-record/'
SCORE='https://thescore.com/news/3127526'
NHL_ERA='https://www.nhl.com/news/alex-ovechkin-closer-to-wayne-gretzky-s-goal-record-296902302'
COACH=W+'List_of_NHL_head_coaches'

def r(url, quote, note=''): return {'url':url,'quote':quote,'note':note,'retrieved':'2026-10-21'}
def S(rs='regular season only', lg='NHL only', unit='player GP'): return {'season':rs,'league':lg,'games_unit':unit}
def SL(who, pop, stat, agg, window, field): return {'who':who,'population':pop,'stat':stat,'agg':agg,'window':window,'field':field}

F=[]
def f(id, sec, claim, pub, url, date, nums, scope, slots, ver, rec, note=''):
    F.append(dict(id=id, section=sec, claim=claim, publisher=pub, url=url, claim_date=date, numbers=nums, scope=scope, slots=slots, verification=ver, receipts=rec, note=note))

# ---------------- player glory
f('PG01','player glory','Gretzky scored 50 goals in 39 games (1981-82)','Wikipedia (50 goals in 50 games; List of NHL records)',F50,'1981-12-30',
  {'headline':'50 G in 39 games','previous':'Bossy/Richard 50 in 50'},S(unit='team games (Gretzky played every team game, so equal)'),
  SL('player','player-seasons','goals','fastest-to-M (M=50)','team games of a season from opening night','all-time'),'V',
  [r(F50,"to give him the record of 50 goals in 39 games"), r(IND,"Fastest 50 goals from start of season: Wayne Gretzky (December 30, 1981), 39 games")])
f('PG02','player glory','Maurice Richard: first player to score 50 goals in 50 games (1944-45)','Wikipedia (50 goals in 50 games)',F50,'1945-03-18',
  {'headline':'50 G in 50 GP (team\'s 50-game season)'},S(unit='team games'),SL('player','player-seasons','goals','count >= M within window','team\'s first 50 games','all-time'),'V',
  [r(F50,"recognizing Richard as the first, and to that point only, player to score 50 goals in 50 games"),
   r(F50,"By definition, the 50-in-50 is an official achievement only because a player completes it within their team's first 50 games","the defining convention: team games, not player GP")])
f('PG03','player glory','Lemieux 50 goals in 1988-89: team game 46, his 44th game played','Wikipedia (50 goals in 50 games)',F50,'1989-01-20',
  {'team_game':46,'player_gp':44,'season_total':'85 G in 76 GP'},S(unit='BOTH quoted: team game 46 / player GP 44'),SL('player','player-seasons','goals','fastest-to-M (M=50)','team games of a season (official) vs player GP (popular)','all-time'),'V',
  [r(F50,"Lemieux's 50th goal came in game 46 of the team's schedule against the Winnipeg Jets and goaltender Pokey Reddick, which was Lemieux's 44th game of the season.")],
  'The unit split in one sentence: the official record book ranks him by team games (46), the popular "50 in 44" counts his own GP.')
f('PG04','player glory','Bossy scored 50 in 50 (1980-81); Brett Hull twice (1990-91 in the Blues\' 49th game; 1991-92)','Wikipedia (50 goals in 50 games)',F50,'1981-01-24',
  {'official_50in50_seasons':8,'players':5},S(unit='team games'),SL('player','player-seasons','goals','count >= M within window','team\'s first 50 games','all-time'),'V',
  [r(F50,"In the 1980–81 season, Mike Bossy of the New York Islanders became only the second player to score 50 goals in 50 games, 36 years after Richard had done so."),
   r(F50,"in the Blues' 49th game"),
   r(F50,"the NHL has officially deemed only five players in eight different seasons to have reached the mark")])
f('PG05','player glory','Gretzky fastest to 1,000 points (424 games) and only player to 2,000; Lemieux second (513)','Wikipedia (List of NHL players with 1,000 points)',K1,'1984-12-19',
  {'headline':424,'second':'Lemieux 513','second_1000_for_Gretzky':'433 games'},S(),SL('player','careers','points','fastest-to-M (M=1000, 2000)','first N career games','all-time'),'V',
  [r(K1,"The fewest NHL games required to reach the mark was 424, set by Wayne Gretzky. Second quickest was Mario Lemieux, achieving the mark in his 513th game."),
   r(K1,"the NHL's only player ever to score 2,000 points in regular-season play")])
f('PG06','player glory','McDavid reached 1,000 points in 659 games, fourth-fastest ever (Nov. 14, 2024)','NHL.com',NHL_MCD,'2024-11-14',
  {'headline':659,'ahead':'Gretzky 424, Lemieux 513, Bossy 656','next':'Stastny 682'},S(),SL('player','careers','points','fastest-to-M (M=1000)','first N career games','all-time'),'V',
  [r(NHL_MCD,"the fourth-fastest to get there, accomplishing the feat in 659 games (341 goals, 660 assists). Only Wayne Gretzky (424 games), Mario Lemieux (513), and Mike Bossy (656) did it faster."),
   r(K1,"Game No. – Number of career games played when 1,000th point was scored","Wikipedia's column definition: the player's own career GP")],
  'Brief said "2025"; the milestone was 2024-11-14. "Fastest active" (vs Crosby 757) is [S] only (Daily Hive snippet).')
f('PG07','player glory','McDavid 153 points in 2022-23, most since Lemieux\'s 161 in 1995-96','NHL / Oilers release',OIL,'2023-04-14',
  {'headline':'153 (64 G, 89 A)','previous_higher':'Lemieux 161 (1995-96)'},S(),SL('player','player-seasons','points','sum','a season','since 1995-96 (era-bounded "most since")'),'V',
  [r(OIL,"the most by any NHL player since 1995-96 when Mario Lemieux recorded 161 points with the Pittsburgh Penguins")],
  'NHL.com Spanish profile gives Lemieux 162 [S]; 161 is the English release.')
f('PG08','player glory','Kucherov 144 points and 100 assists in 2023-24 (fifth player with a 100-assist season)','Wikipedia (Nikita Kucherov)',W+'Nikita_Kucherov','2024-04-18',
  {'headline':'44 G, 100 A, 144 P in 81 GP'},S(),SL('player','player-seasons','assists / points','sum','a season','all-time'),'V',
  [r(W+'Nikita_Kucherov',"Kucherov ended the season with a career high in goals (44), assists (100), and points (144) in 81 games played.")],
  '144 is not a record; the viral hook is 100 assists (club of five).')
f('PG09','player glory','Ovechkin passed Gretzky with goal 895 (Apr. 6, 2025) in his 1,487th game, Gretzky\'s career GP total','NHL.com; Wikipedia',NHL_OV,'2025-04-06',
  {'headline':895,'previous':'Gretzky 894','games':1487,'current_total_per_wikipedia':929},S(),SL('player','careers','goals','sum (and pace: through N games)','career / first N games','all-time'),'V',
  [r(NHL_OV,"Alex Ovechkin of the Washington Capitals scored his 895th NHL goal on Sunday against the New York Islanders, passing Wayne Gretzky for the all-time record."),
   r(W+'Alex_Ovechkin',"Ovechkin's record-breaking 895th goal came in his 1,487th career game, the same number of games as Gretzky's career total."),
   r(IND,"Most career goals (regular season): Alexander Ovechkin, 929")])
f('PG10','player glory','Ovechkin shares the record of nine 50-goal seasons with Bossy and Gretzky; Bossy\'s nine were consecutive','Wikipedia (List of NHL records)',IND,'2026',
  {'headline':9,'tied':'Bossy, Gretzky'},S(),SL('player','careers','count of seasons with goals>=50','count','seasons','all-time'),'V',
  [r(IND,"Most 50-or-more goal seasons: Mike Bossy, Wayne Gretzky, and Alexander Ovechkin 9"), r(IND,"Most consecutive 50-or-more goal seasons: Mike Bossy (1977–1986), 9")])
f('PG11','player glory','Matthews 69 goals (2023-24), the salary-cap-era record, passing Ovechkin\'s 65','Wikipedia (Auston Matthews)',W+'Auston_Matthews','2024-04-17',
  {'headline':69,'previous':'Ovechkin 65 (2007-08)'},S(),SL('player','player-seasons','goals','sum','a season','since 2005-06 (salary cap era)'),'V',
  [r(W+'Auston_Matthews',"In 2024, Matthews set the single-season goal record of the salary cap era with a total of 69 goals, surpassing Alexander Ovechkin's 65 in 2007–08")],
  'Era-bounded record: the words carry the bound ("salary cap era").')
f('PG12','player glory','Matthews 60 goals in 2021-22: first Maple Leaf, third 60-goal scorer after the 2004-05 lockout','Wikipedia (Auston Matthews)',W+'Auston_Matthews','2022-04-26',
  {'headline':'60 G in 73 GP'},S(),SL('player','player-seasons','goals','count >= M','a season','one franchise / since 2005-06'),'V',
  [r(W+'Auston_Matthews',"becoming the first player in Maple Leafs history to score 60 goals in a season, and only the third in the post-2004–05 lockout NHL to score 60 or more")])
f('PG13','player glory','Crosby: 20 straight point-per-game seasons, breaking Gretzky\'s 19','CBS Sports; Wikipedia',CBS_C,'2025-03-27',
  {'headline':20,'previous':'Gretzky 19 (of 20 seasons)'},S(),SL('player','careers','seasons with points/GP >= 1','streak','seasons','all-time'),'V',
  [r(CBS_C,"Gretzky was a point-per-game player in 19 of his 20 seasons."), r(W+'Sidney_Crosby',"On March 28, 2025 Crosby became the only player in NHL history to average over a point-per-game over 20 seasons.")],
  'Date conflict: CBS reports the clinching goal on Thursday (Mar. 27, 2025); Wikipedia says March 28.')
f('PG14','player glory','Gretzky single-season records: 92 goals (1981-82), 163 assists and 215 points (1985-86)','Wikipedia (List of NHL records)',IND,'1986',
  {'goals':92,'assists':163,'points':215,'incl_playoffs_points':'255 (1984-85)'},S(),SL('player','player-seasons','goals / assists / points','sum','a season','all-time'),'V',
  [r(IND,"Most goals, single season: Wayne Gretzky (1981–82), 92"), r(IND,"Most points, one season: Wayne Gretzky (1985–86), 215"),
   r(IND,"Most points, one season, including playoffs: Wayne Gretzky (1984–85), 255","the combined framing exists only as a separately labeled record")])
f('PG15','player glory','Gretzky\'s 51-game point streak (1983-84), also the longest from the start of a season','Wikipedia (List of NHL records)',IND,'1984',
  {'headline':51},S(),SL('player','player-seasons','games with a point','streak','a run (from season start)','all-time'),'V',
  [r(IND,"Longest consecutive point-scoring streak: Wayne Gretzky (1983–84), 51 games")])
f('PG16','player glory','Gretzky fastest to 100 points from the start of a season: 34 games (Dec. 27, 1981)','Wikipedia (List of NHL records)',IND,'1981-12-27',
  {'headline':34},S(unit='team games of a season'),SL('player','player-seasons','points','fastest-to-M (M=100)','team games of a season','all-time'),'V',
  [r(IND,"Fastest 100 points from the start of a season: Wayne Gretzky (December 27, 1981), 34 games")])
f('PG17','player glory','Gordie Howe: 1,850 NHL points (WHA\'s 508 kept separate); oldest forward at 52','Hockey-Reference; Wikipedia',HR,'1980',
  {'nhl_points':1850,'wha_points':508,'oldest_game':'52 years, 11 days'},S(lg='NHL only (WHA listed in a separate table)'),SL('player','careers','points','sum','career','all-time'),'V',
  [r(HR,"1946-80 | 1850 |"), r(HR,"1973-79 | 508 |"), r(IND,"Oldest forward: Gordie Howe, April 11, 1980, 52 years, 11 days")])
f('PG18','player glory','Jagr: second in career points (1,921); oldest NHL hat trick at 42 years, 322 days','Wikipedia; Hockey-Reference',W+'Jaromír_Jágr','2015-01-03',
  {'points':1921,'age':'42y 322d'},S(),SL('player','careers','points / hat tricks','sum / oldest-to-M','career / by age','all-time'),'V',
  [r(IND,"Most points by a right wing, career: Jaromir Jagr, 1,921"), r(W+'Jaromír_Jágr',"Jágr became the oldest player in NHL history to score a hat-trick at 42 years and 322 days.")])
f('PG19','player glory','Esposito 76 goals in 78 games (1970-71), the record until Gretzky','Wikipedia (Phil Esposito)',W+'Phil_Esposito','1971',
  {'headline':76,'gp':78},S(),SL('player','player-seasons','goals','sum','a season','all-time'),'V',
  [r(W+'Phil_Esposito',"in 78 games he averaged nearly a goal a game, scoring 76 goals")])
f('PG20','player glory','Bobby Orr +124 in 1970-71, the best plus-minus season','Wikipedia (List of NHL records)',IND,'1971',
  {'headline':'+124','career_record':'Larry Robinson +722'},S(),SL('player','player-seasons','plus-minus','sum','a season','all-time'),'V',
  [r(IND,"Best ± rating one season: Bobby Orr (1970–71), +124"), r(IND,"Best ± rating, regular season career: Larry Robinson, +722")])
f('PG21','player glory','Makar reached 100 points in his 108th game, tied for sixth-fewest by a defenseman','NHL.com (Avalanche)',NHL_MAK,'2021-10-28',
  {'headline':108,'ahead':'Cameron 88, M. Howe 94, Leetch 102, Murphy 105, Housley 106'},S(),SL('player (defense)','careers','points','fastest-to-M (M=100)','first N career games','all-time (includes 1921-22)'),'V',
  [r(NHL_MAK,"He tied Sergei Zubov (108 games in 1993-94) for the sixth-fewest games by a defenseman in NHL history to record 100 career points.")])
f('PG22','player glory','Makar: 100 goals in 362 games, fifth-fastest defenseman since 1943-44','TSN / The Canadian Press (AP)',TSN_MAK,'2025-01-18',
  {'headline':362,'ahead':'Orr 299, Coffey 300, Bourque 329, Potvin 348'},S(),SL('player (defense)','careers','goals','fastest-to-M (M=100)','first N career games','since 1943-44'),'V',
  [r(TSN_MAK,"he became the fifth-fastest defenseman since 1943-44 to reach that particular mark. The only blue liners speedier are Hall of Famers: Bobby Orr (299 games), Paul Coffey (300), Ray Bourque (329) and Denis Potvin (348).")],
  'Publishers disagree on the era floor: NHL.com\'s Makar points list reaches back to 1921-22; the AP/CP goals list stops at 1943-44.')
f('PG23','player glory','Lemieux scored on his first shift, first shot, first game (Oct. 11, 1984)','Wikipedia (Mario Lemieux)',W+'Mario_Lemieux','1984-10-11',
  {},S(),SL('player','careers','goals','first-event','first game','all-time'),'V',
  [r(W+'Mario_Lemieux',"on his first shift, he stole the puck from Hall of Fame defenceman Ray Bourque and scored a goal with his first NHL shot against Pete Peeters")],
  'Not a comparator query (shift-level); keep out of scope.')
f('PG24','player glory','McDavid 900 points in 602 games, fifth-fastest (Gretzky 385, Lemieux 463, Bossy 582, Stastny 599)','TSN',TSN_900,'2024-01-02',
  {'headline':602,'ahead':'Gretzky 385, Lemieux 463, Bossy 582, Stastny 599'},S(),SL('player','careers','points','fastest-to-M (M=900)','first N career games','all-time'),'V',
  [r(TSN_900,"becoming the fifth-fastest player in NHL history to reach 900 points after scoring a goal and four assists in his 602nd game")])

# ---------------- player futility
f('PF01','player futility','Worst career plus-minus: Bob Stewart, -257; worst game: Greg Joly, -9','Wikipedia (List of NHL records)',IND,'',
  {'career':-257,'game':-9},S(),SL('player','careers','plus-minus','sum (min)','career','all-time'),'V',
  [r(IND,"Worst ± rating, regular season career: Bob Stewart, -257"), r(IND,"Worst ± rating, regular season game: Greg Joly (March 15, 1977), -9")])
f('PF02','player futility','Most games before a first playoff game: Jeff Skinner, 1,078; most GP without ever reaching the playoffs: Guy Charron, 734','Wikipedia (List of NHL records)',IND,'',
  {'skinner':1078,'charron':734},S(),SL('player','careers','games played','count before first playoff game','career','all-time'),'V',
  [r(IND,"Most games played before playing in a playoff game: Jeff Skinner, 1078"), r(IND,"Most games played without playing in the playoffs (retired): Guy Charron, 734")])
f('PF03','player futility','Goalie losses: Brodeur most career (397); Gary Smith most in a season (48, 1970-71)','Wikipedia (List of NHL records)',IND,'',
  {'career':397,'season':48},S(),SL('goalie','careers / player-seasons','losses','sum','career / a season','all-time'),'V',
  [r(IND,"Most losses by a goaltender regular season career: Martin Brodeur, 397"), r(IND,"Most losses by a goaltender, one season: Gary Smith (1970–71), 48")])

# ---------------- goalies
f('GO01','goalies','Brodeur: 691 wins, 125 shutouts, 1,265 games (regular season); 804 wins with playoffs','Wikipedia (List of NHL records; 300-win list)',W300,'2015',
  {'wins':691,'shutouts':125,'gp':1265,'wins_incl_playoffs':804,'runner_up_shutouts':'Sawchuk 103'},S(unit='goalie appearances (GP), not starts'),SL('goalie','careers','wins / shutouts','sum','career','all-time'),'V',
  [r(W300,"Martin Brodeur is the all-time leader with 691 career regular season victories."), r(IND,"Most shutouts regular season career: Martin Brodeur 125"),
   r(IND,"Most games appeared in by a goaltender, career regular season: Martin Brodeur, 1,265"), r(LEAD,"Terry Sawchuk, 103")])
f('GO02','goalies','Most wins in a season: 48, Brodeur (2006-07) and Holtby (2015-16)','Wikipedia; Guinness',IND,'2007-04-05',
  {'headline':48,'previous':'Parent 47 (1973-74) [S]'},S(),SL('goalie','player-seasons','wins','sum','a season','all-time'),'V',
  [r(IND,"Most wins by a goaltender, one season: Martin Brodeur (2006–07) and Braden Holtby (2015–16), 48"),
   r(GWR_W,"Martin Brodeur (Canada) of the New Jersey Devils (USA) broke the NHL record for most wins in a season with 48 during the 2006-07 season."),
   r(IND,"Most shootout wins by a goaltender in a season: Ryan Miller and Martin Brodeur (2006–07), Mathieu Garon (2007–08), and Jonathan Quick (2010–11), 10","so the 48 includes shootout wins (derived)")],
  'No asterisk for shootout wins: the NY Sun report was 429-blocked, so that ruling is [S].')
f('GO03','goalies','Lundqvist: 30+ wins in each of his first seven seasons (2005-06 to 2011-12); quickest to 400 wins (727 games)','Guinness; Wikipedia',GWR_L,'2012',
  {'streak':7,'fastest_400':727},S(),SL('goalie','careers','seasons with wins>=30 / wins','streak from career start / fastest-to-M','seasons / first N games','all-time'),'V',
  [r(GWR_L,"has become the only player in his position to record seven straight regular seasons with 30-plus wins"),
   r(IND,"Quickest goaltender to win 400 regular-season games: Henrik Lundqvist 727")])
f('GO04','goalies','Youngest goalie to each wins milestone: Roy to 50 and 100; Brodeur to 200 through 600','Wikipedia (List of NHL records)',IND,'',
  {'roy_100':'23 yrs','brodeur_600':'37 yrs., 11 mos.'},S(),SL('goalie','careers','wins','youngest-to-M','by age','all-time'),'V',
  [r(IND,"Youngest goaltender to win 100 regular-season games: Patrick Roy 23 yrs"), r(IND,"Youngest goaltender to win 600 regular-season games: Martin Brodeur 37 yrs., 11 mos.")],
  'Age precision here is years/months, not the years+days NHL.com uses.')
f('GO05','goalies','Grant Fuhr: 79 games in a season (1995-96), 76 consecutive','Wikipedia (List of NHL records)',IND,'1996',
  {'headline':79},S(unit='goalie appearances'),SL('goalie','player-seasons','games played','count','a season','all-time'),'V',
  [r(IND,"Most games appeared in by a goaltender, one regular season: Grant Fuhr, 79 (1995–96)")])
f('GO06','goalies','David Ayres, a 42-year-old emergency backup, credited with a win in his debut (Feb. 22, 2020)','Wikipedia (David Ayres; List of NHL records)',W+'David_Ayres','2020-02-22',
  {'age':'42 years, 194 days'},S(),SL('goalie','careers','wins','oldest-to-M (M=1)','by age','all-time'),'V',
  [r(W+'David_Ayres',"He is the first emergency backup goaltender to be credited with a win in the National Hockey League (NHL)."),
   r(IND,"Oldest goaltender to win his regular-season debut: David Ayres, February 22, 2020, 42 years, 194 days")])
f('GO07','goalies','Hellebuyck 47-12-3 in 2024-25, Hart and Vezina; seventh goalie with 45+ wins','The Hockey News',THN_HEL,'2025-06-12',
  {'record':'47-12-3','gp':63},S(),SL('goalie','player-seasons','wins','sum','a season','all-time'),'V',
  [r(THN_HEL,"Hellebuyck put up a 47-12-3 record this season, becoming the seventh NHL goalie in league history")])
f('GO08','goalies','Season goalie records: Hainsworth 22 shutouts (1928-29); Gilles Gilbert 17-game win streak (1975-76)','Wikipedia (List of NHL records)',IND,'',
  {'shutouts':22,'win_streak':17},S(),SL('goalie','player-seasons','shutouts / wins','sum / streak','a season / a run','all-time'),'V',
  [r(IND,"Most shutouts, one regular season: George Hainsworth (1928–29), 22"), r(IND,"Longest winning streak by a goaltender, one season: Gilles Gilbert (1975–76), 17 games")])
f('GO09','goalies','"Most wins by a goalie through his first 100 starts"','(none found)','', '',
  {},S(unit='goalie starts'),SL('goalie','careers','wins','sum','first N starts','all-time'),'UNVERIFIED',[],
  'No publisher list found; the comparator would be first to rank it. Needs a GS column, which old box scores may not carry.')

# ---------------- team glory
f('TG01','team glory','2022-23 Bruins: 65 wins, 135 points, fastest to 100 points (61 games), 5 regulation losses','Wikipedia (List of NHL records (team))',TEAM,'2023-04-13',
  {'wins':65,'points':135,'to_100_pts':'61 GP','previous':'1976-77 Canadiens 132 pts; 1995-96 Red Wings / 2018-19 Lightning 62 W'},S(unit='team games'),SL('team','team-seasons','wins / points','sum / fastest-to-M','a season / team games','all-time'),'V',
  [r(TEAM,"Most points: 135, by the 2022–23 Boston Bruins"), r(TEAM,"Most wins: 65, by the 2022–23 Boston Bruins"),
   r(TEAM,"Fewest games to reach 100 points: 61, by the 2022–23 Boston Bruins"), r(TEAM,"Fewest regulation losses: 5, by the 2022–23 Boston Bruins")])
f('TG02','team glory','1976-77 Canadiens: 60-8-12, 132 points, only 8 losses','Wikipedia (1976-77 Montreal Canadiens season)',W+'1976–77_Montreal_Canadiens_season','1977',
  {'record':'60-8-12','points':132,'to_100_pts':'62nd game'},S(unit='team games'),SL('team','team-seasons','losses (min) / points','sum','a season','all-time'),'V',
  [r(TEAM,"Fewest losses (including overtime and shootout): 8, by the 1976–77 Montreal Canadiens"),
   r(W+'1976–77_Montreal_Canadiens_season',"Montreal set new records for most wins (60) and points (132) in a season."),
   r(W+'1976–77_Montreal_Canadiens_season',"The Canadiens earned their 100th point in the 62nd game of the season")])
f('TG03','team glory','1992-93 Penguins: 17 straight wins; 14 straight playoff wins across 1992-93','Wikipedia (List of NHL records (team))',TEAM,'1993',
  {'headline':17,'playoff':14},S(rs='regular season (17); playoffs separately (14)',unit='team games'),SL('team','team-seasons','wins','streak','a run','all-time'),'V',
  [r(TEAM,"Overall: 17 games, by 1992–93 Pittsburgh Penguins"), r(TEAM,"Most consecutive playoff games won: 14, by Pittsburgh Penguins")])
f('TG04','team glory','1979-80 Flyers: 35-game unbeaten streak (25 wins, 10 ties)','Wikipedia (List of NHL records (team); Flyers season)',TEAM,'1980-01-06',
  {'headline':35,'w':25,'t':10},S(unit='team games'),SL('team','team-seasons','games without a loss','streak','a run','all-time'),'V',
  [r(TEAM,"Overall: 35 games, by 1979–80 Philadelphia Flyers (25 wins, 10 ties)")])
f('TG05','team glory','2024-25 Jets: best 15-game start (14-1-0), fastest to 15 wins (16 GP); 16 straight wins spanning seasons','NHL.com (quarter-mark release)',NHL_Q,'2024-11-09',
  {'record_15':'14-1-0','to_15_wins':16},S(unit='team games'),SL('team','team-seasons','wins','sum / fastest-to-M','first N team games of a season','all-time'),'V',
  [r(NHL_Q,"post the best 15-game start to a season in League history (14-1-0) and become the fastest team ever to 15 wins (16 GP)"),
   r(NHL_Q,"to match the second longest winning streak in NHL history (spanning seasons or single season; behind the Penguins: 17-0-0 in 1992-93)")],
  'A ready-made "wins through first N team games" gate. Note NHL.com lets a streak span seasons; the Wikipedia team list is single-season.')
f('TG06','team glory','2017-18 Golden Knights: most wins and points by a first-year expansion team','Wikipedia (2017-18 Vegas Golden Knights season)',W+'2017–18_Vegas_Golden_Knights_season','2018',
  {'points_pct':'.665','fleury_wins':28},S(unit='team games'),SL('team','team-seasons (inaugural)','wins / points','sum','a season','expansion teams'),'V',
  [r(W+'2017–18_Vegas_Golden_Knights_season',"they broke the record for most wins by an expansion team in their first season when they earned their 34th win of the season"),
   r(IND,"Most wins by a goaltender, expansion team season: Marc-Andre Fleury (2017–18 Vegas Golden Knights), 28")])
f('TG07','team glory','62-win seasons: 1995-96 Red Wings (record, 131 pts) and 2018-19 Lightning (62-16-4, 128 pts)','Wikipedia (season pages)',W+'1995–96_Detroit_Red_Wings_season','1996',
  {'wings':'62 W, 131 pts','lightning':'62-16-4, 128 pts'},S(unit='team games'),SL('team','team-seasons','wins','sum','a season','all-time'),'V',
  [r(W+'1995–96_Detroit_Red_Wings_season',"the Red Wings eclipsed the all-time record of most regular-season wins with 62, a record previously set at 60 by the 1976–77 Montreal Canadiens"),
   r(W+'2018–19_Tampa_Bay_Lightning_season',"2018–19 record | 62–16–4 |")])
f('TG08','team glory','2012-13 Blackhawks: 24-game points streak to start a season (21 W, 3 SO losses)','Wikipedia (List of NHL records (team))',TEAM,'2013-03-06',
  {'headline':24},S(unit='team games'),SL('team','team-seasons','games with a standings point','streak from season start','first N team games','all-time'),'V',
  [r(TEAM,"Overall: 24 games, by 2012–13 Chicago Blackhawks[3] (21 wins, 3 shootout losses)")],
  'A "points streak" counts OT/SO losses; distinct from "unbeaten" (W+T) and "winning".')
f('TG09','team glory','Best points percentage in a season: .875, 1929-30 Bruins','Wikipedia (List of NHL records (team))',TEAM,'1930',
  {'headline':'.875'},S(unit='team games'),SL('team','team-seasons','points percentage','rate','a season','all-time'),'V',
  [r(TEAM,"Greatest points percentage: .875, by the 1929–30 Boston Bruins")])

# ---------------- team futility
f('TF01','team futility','1974-75 Capitals: 8-67-5, 21 points, .131, the worst season ever','Wikipedia (List of NHL records (team); Capitals season)',TEAM,'1975',
  {'record':'8-67-5','points':21,'pct':'.131'},S(unit='team games'),SL('team','team-seasons','wins (min) / points pct (min)','sum / rate','a season','all-time'),'V',
  [r(TEAM,"Fewest wins: 8, by the 1974–75 Washington Capitals"), r(TEAM,"Lowest points percentage: .131, by the 1974–75 Washington Capitals"),
   r(W+'1974–75_Washington_Capitals_season',"They finished 8–67–5, which is the worst record in NHL history.")])
f('TF02','team futility','1992-93 Sharks: 71 losses, the most ever','Wikipedia (List of NHL records (team); Sharks season)',TEAM,'1993',
  {'headline':71,'record':'11-71-2 [S]'},S(unit='team games (84-game season)'),SL('team','team-seasons','losses','sum','a season','all-time'),'V',
  [r(TEAM,"Most losses: 71, by the 1992–93 San Jose Sharks"),
   r(W+'1992–93_San_Jose_Sharks_season',"most consecutive losses, with 17 in a row","conflicts with 18 (2003-04 Penguins); definitional, see TF04")])
f('TF03','team futility','1992-93 Senators: 1-41-0 on the road; 38-game road losing streak','Wikipedia (List of NHL records (team); Senators season)',TEAM,'1993',
  {'road':'1-41-0','road_streak':'38 (team list) vs 39 (season page)'},S(unit='team road games'),SL('team','team-seasons','road losses','streak','a run','all-time'),'V',
  [r(TEAM,"Worst away record: 1–41–0, by the 1992–93 Ottawa Senators"), r(TEAM,"Away: 38 games, by 1992–93 Ottawa Senators"),
   r(W+'1992–93_Ottawa_Senators_season',"the longest road losing streak with a total of 39, from October 10 to April 3")],
  'Two Wikipedia pages disagree (38 vs 39).')
f('TF04','team futility','18-game losing streak: 2003-04 Penguins (0-17-1) and 2020-21 Sabres (0-15-3)','Wikipedia; ESPN',TEAM,'2021-03-29',
  {'headline':18,'pit':'0-17-1','buf':'0-15-3'},S(unit='team games'),SL('team','team-seasons','losses (any kind)','streak','a run','all-time'),'V',
  [r(TEAM,"Overall: 18 games, by 2003–04 Pittsburgh Penguins and by 2020–21 Buffalo Sabres"),
   r(W+'2003–04_Pittsburgh_Penguins_season',"In an 18-game losing streak, they went 0–17–1 (one overtime loss)."),
   r(W+'2020–21_Buffalo_Sabres_season',"In the Sabres' 18-game losing streak, they were 0–15–3 (two overtime losses and one shootout loss)."),
   r(ESPN,"The NHL is insistent that the Sabres are on an 18-game \"winless streak\" rather than a \"losing streak.\"")])
f('TF05','team futility','1980-81 Jets: 30-game winless streak (23 losses, 7 ties)','Wikipedia (List of NHL records (team))',TEAM,'1980',
  {'headline':30},S(unit='team games'),SL('team','team-seasons','games without a win','streak','a run','all-time'),'V',
  [r(TEAM,"Overall: 30 games, by 1980–81 Winnipeg Jets (23 losses, 7 ties)")])
f('TF06','team futility','Worst starts: 1943-44 Rangers 15 winless; 11 straight losses to open by 1943-44 Rangers, 2017-18 and 2021-22 Coyotes, 2023-24 Sharks','Wikipedia (List of NHL records (team))',TEAM,'2023-11',
  {'winless_start':15,'losing_start':11},S(unit='team games'),SL('team','team-seasons','losses','streak from season start','first N team games','all-time'),'V',
  [r(TEAM,"Overall: 11 games, by 1943–44 New York Rangers, 2017–18 Arizona Coyotes, 2021–22 Arizona Coyotes and 2023–24 San Jose Sharks"),
   r(TEAM,"Overall: 15 games, by 1943–44 New York Rangers (14 losses, 1 tie)")])
f('TF07','team futility','2023-24 Sharks: 47 points, the fewest in an 82-game season since OT/SO losses earned a point','Wikipedia (2023-24 San Jose Sharks season)',W+'2023–24_San_Jose_Sharks_season','2024-04-18',
  {'headline':47},S(unit='team games'),SL('team','team-seasons','points','sum (min)','a season','since 1999-2000 (OTL point era), 82-game seasons'),'V',
  [r(W+'2023–24_San_Jose_Sharks_season',"The Sharks finished with a total of 47 points, the lowest ever total for an 82-game season with one point awarded for an overtime or shootout loss.")],
  'Era-bounded futility record: the bound is in the words.')
f('TF08','team futility','2024-25 Sharks: first team to lose nine straight to open consecutive seasons','NBC Sports Bay Area',NBC,'2024-10-26',
  {'headline':9},S(unit='team games'),SL('team','team-seasons (consecutive)','losses','streak from season start','first N team games, two seasons','all-time'),'V',
  [r(NBC,"made the Sharks the first team in NHL history to lose nine consecutive games to begin consecutive seasons.")])
f('TF09','team futility','Sabres: 14-season playoff drought (2011-12 to 2024-25), the longest ever, ended in 2025-26','Wikipedia (List of NHL franchise post-season droughts)',DRO,'2026',
  {'headline':'14 seasons','next':'Panthers, Oilers, Red Wings 10'},S(rs='seasons (playoff appearance)',unit='seasons'),SL('team','franchise','playoff appearances (none)','streak','seasons','all-time'),'V',
  [r(DRO,"Buffalo Sabres | 2010–11 | 2025–26 | 14 seasons |")])
f('TF10','team futility','Fewest wins through a team\'s first N games of a season (publisher lists)','(none found)','', '',
  {},S(unit='team games'),SL('team','team-seasons','wins','sum (min)','first N team games','all-time'),'UNVERIFIED',[],
  'Publishers give record-at-game-N lines (Sharks 0-10-1, Jets 14-1-0) but no ranked "fewest through N" list was found.')

# ---------------- coaches
f('CO01','coaches','Scotty Bowman: 1,244 regular-season wins in 2,141 games; Quenneville second (1,012)','Wikipedia (List of NHL statistical leaders)',LEAD,'2002',
  {'headline':1244,'games':2141,'second':'Quenneville 1,012'},S(unit='games coached'),SL('coach','careers','wins','sum','career','all-time'),'V',
  [r(LEAD,"Scotty Bowman, 1,244"), r(LEAD,"Scotty Bowman, 2,141"), r(LEAD,"Joel Quenneville, 1,012")])
f('CO02','coaches','Jon Cooper second-fastest coach to 600 wins, behind Bowman (Jan. 12, 2026)','The Hockey News',THN_COOP,'2026-01-12',
  {'games':'1,005 [S]','bowman':'1,002 [S]'},S(unit='games coached'),SL('coach','careers','wins','fastest-to-M (M=600)','first N games coached','all-time'),'V',
  [r(THN_COOP,"he's become the second-fastest coach to reach the 600 win plateau, behind only the legendary Scotty Bowman")],
  'Game counts 1,005 vs 1,002 are from a search snippet only.')
f('CO03','coaches','Worst start to a coaching career: Andre Tourigny 0-10-1 (Coyotes, 2021-22)','NBC Sports Bay Area (quoting Sheng Peng)',NBC,'2024-10-26',
  {'headline':'0-10-1'},S(unit='games coached'),SL('coach','careers','losses','streak from career start','first N games coached','all-time'),'V',
  [r(NBC,"Andre Tourigny lost his first 11 games (0-10-1) with the Arizona Coyotes in 2021-22")])
f('CO04','coaches','Barry Trotz: 1,196 games as the first coach of an expansion franchise (Nashville)','Wikipedia (List of NHL records)',IND,'2014',
  {'headline':1196},S(unit='games coached'),SL('coach','careers (one franchise)','games coached','count','career','one franchise'),'V',
  [r(IND,"Most games coached by the first coach of an expansion franchise: Barry Trotz (Nashville Predators), 1,196")])

# ---------------- rookies
f('RO01','rookies','Selanne\'s 76 goals and 132 points (1992-93) remain the rookie records','Wikipedia',IND,'1993',
  {'goals':76,'points':132,'previous_points':'Peter Stastny'},S(),SL('player (rookie)','player-seasons','goals / points','sum','a season (rookie)','all-time'),'V',
  [r(IND,"Most goals by a rookie, one season: Teemu Selanne (1992–93), 76"), r(IND,"Most points by a rookie, one season: Teemu Selanne (1992–93), 132")])
f('RO02','rookies','Auston Matthews: four goals in his NHL debut (Oct. 12, 2016)','Wikipedia (List of NHL records)',IND,'2016-10-12',
  {'headline':4},S(),SL('player (rookie)','careers','goals','sum','first game','all-time'),'V',
  [r(IND,"Most goals by a rookie, first game: Auston Matthews (October 12, 2016), 4")])
f('RO03','rookies','Crosby: youngest 100-point season, 18 years 253 days (Apr. 17, 2006)','NHL.com (This Date in History)',NHL_TDIH,'2006-04-17',
  {'age':'18 years, 253 days','other':'Hawerchuk 18 years, 354 days'},S(),SL('player','player-seasons','points','youngest-to-M (M=100)','by age','all-time'),'V',
  [r(NHL_TDIH,"(18 years, 253 days) becomes the youngest NHL player to reach 100 points in a season.")])
f('RO04','rookies','Bedard: youngest All-Star (18 years, 171 days); third-youngest four-point game (18 years, 115 days)','SI; CBS Sports',SI_B,'2024-01-04',
  {'all_star_age':'18y 171d','four_point_age':'18y 115d'},S(),SL('player','careers','points in a game','youngest-to-M','by age','all-time'),'V',
  [r(SI_B,"becomes the youngest player in league history to be selected to the All-Star team"), r(CBS_B,"At the age of 18 years and 115 days")])
f('RO05','rookies','Teen career leaders before the 20th birthday: Carson 92 goals; Crosby 222 points (Laine 134, Bedard 128)','NHL.com; The Hockey News',LAINE,'2018-04-19',
  {'goals':'Carson 92, Hawerchuk 85, Laine 80','points':'Crosby 222'},S(),SL('player','careers','goals / points','sum','by age (before 20th birthday)','all-time'),'V',
  [r(LAINE,"has scored 80 goals, the third-most by an NHL teenager; Jimmy Carson scored 92 for the Los Angeles Kings (1986-88), and Dale Hawerchuk of the original Jets scored 85 (1981-83)."),
   r(THN_BED,"He recorded 128 points as a teenager in the NHL, Laine recorded 134, and Crosby had 222.")])
f('RO06','rookies','Celebrini (2025-26): factored into 46.2% of Sharks goals, best ever by an NHL teenager','NHL.com (Sharks)',SJS,'2026',
  {'headline':'46.2%'},S(),SL('player','player-seasons','share of team goals','rate','a season, by age (teenager)','all-time'),'V',
  [r(SJS,"He completed the campaign factoring into 46.2-percent of all Sharks goals, the second-best such mark in the league this season and best ever by an NHL teenager or any San Jose skater.")])
f('RO07','rookies','Youngest NHL player: Bep Guidolin, 16 years 337 days (Nov. 12, 1942)','Wikipedia; Guinness',IND,'1942-11-12',
  {'age':'16y 337d'},S(),SL('player','careers','games played','youngest-to-M (M=1)','by age','all-time'),'V',
  [r(IND,"Youngest player to play his first game: Bep Guidolin, November 12, 1942, 16 years, 337 days"),
   r(GWR_Y,"At 16 years 11 months, Armand \"Bep\" Guidolin (Canada, b. 9 December 1925) became the youngest player to skate in an NHL game")])

# ---------------- playoffs
f('PO01','playoffs','Gretzky 47 points in the 1985 playoffs; 382 career playoff points','Wikipedia (List of NHL records)',IND,'1985',
  {'headline':47,'career':382},S(rs='playoffs only'),SL('player','player-seasons (postseason)','points','sum','a postseason','all-time'),'V',
  [r(IND,"Most points, one playoff season: Wayne Gretzky (1985), 47"), r(IND,"Most points playoff career: Wayne Gretzky, 382")])
f('PO02','playoffs','McDavid 34 assists in the 2024 playoffs, a record; Conn Smythe on a losing finalist','Wikipedia (List of NHL records; Connor McDavid)',IND,'2024-06',
  {'headline':34},S(rs='playoffs only'),SL('player','player-seasons (postseason)','assists','sum','a postseason','all-time'),'V',
  [r(IND,"Most assists, one playoff season: Connor McDavid (2024), 34"),
   r(W+'Connor_McDavid',"McDavid won the Conn Smythe Trophy as the most valuable player in the 2024 Stanley Cup playoffs")])
f('PO03','playoffs','Patrick Roy: 151 playoff wins; Binnington 16 as a rookie (2019)','Wikipedia (List of NHL records)',IND,'2019',
  {'roy':151,'binnington':16},S(rs='playoffs only'),SL('goalie','careers / postseason','wins','sum','career / a postseason','all-time'),'V',
  [r(IND,"Most wins by a goaltender playoffs career: Patrick Roy, 151"), r(IND,"Most wins by a rookie goaltender, single playoffs season: Jordan Binnington (2018–19 St. Louis Blues), 16")])
f('PO04','playoffs','Most goals in one playoffs: 19, Reggie Leach (1976) and Jari Kurri (1985)','Wikipedia (List of NHL records)',IND,'1985',
  {'headline':19},S(rs='playoffs only'),SL('player','player-seasons (postseason)','goals','sum','a postseason','all-time'),'V',
  [r(IND,"Most goals, in single playoffs season: Reggie Leach (1976) and Jari Kurri (1985), 19")])

C=[]
def c(pub, q, ans, rec): C.append(dict(publisher=pub, question=q, answer=ans, receipts=rec))
Q1='1 games unit'; Q2='2 regular season vs playoffs'; Q3='3 WHA'; Q4='4 age'; Q5='5 appearance unit'; Q6='6 season bound for fastest-from-start'; Q7='7 early assists'; Q8='8 ties/OTL/SO'; Q9='9 through-N counts own GP'
c('NHL.com / NHL PR',Q1,'Career "fastest to" uses the player\'s own games played.',[r(NHL_MCD_PRE,"with 995 career points (339 goals, 656 assists) in 657 NHL games")])
c('NHL.com / NHL PR',Q9,'Points "through N games" count only games the player played; missed team games are not in N.',[r(NHL_MCD,"accomplishing the feat in 659 games (341 goals, 660 assists)")])
c('NHL Records (as carried by Wikipedia; records.nhl.com is a JS app and its API host is off-limits)',Q6,'"Fastest 50/100 from start of season" and "50 in 50" are counted in team games; the 50-in-50 is official only inside the team\'s first 50 games.',
  [r(F50,"By definition, the 50-in-50 is an official achievement only because a player completes it within their team's first 50 games"),
   r(F50,"While not an official record, the following players scored fifty goals in or before the 50th game they played in a single season, but outside of their team's first 50 games"),
   r(IND,"Most goals, 50 games from start of season: Wayne Gretzky (1981–82 and 1983–84), 61")])
c('NHL Records (via Wikipedia)',Q2,'Regular season is the default; playoff records are separate lists; "including playoffs" exists only as its own labeled record.',
  [r(IND,"Most points regular season career: Wayne Gretzky, 2,857"), r(IND,"Most points career, including playoffs: Wayne Gretzky, 3,239")])
c('NHL.com / NHL PR',Q3,'NHL-only. When NHL.com combines leagues it says so and calls it "professional" (NHL + WHA, regular season + playoffs).',
  [r(NHL_OV,"his 1,071st professional goal (NHL and World Hockey Association, regular season and playoffs), tying Gordie Howe’s record")])
c('NHL (league stance, via Wikipedia)',Q3,'The NHL does not recognize WHA records; the 1979 arrivals were treated as expansion.',
  [r(EXP,"Although popularly called a merger, the NHL did not and does not recognize the WHA's records or history as being any part of its own.")])
c('NHL.com / NHL PR',Q4,'Age is given as years + days on the game date; "teenager" means before the 20th birthday.',
  [r(NHL_TDIH,"(18 years, 253 days) becomes the youngest NHL player to reach 100 points in a season."),
   r(LAINE,"I'm happy what I was able to do before my 20th birthday")])
c('NHL Records (via Wikipedia)',Q5,'A goalie appearance of any length is a game played (7.6 seconds is the record low); goalie records count appearances, not starts. An emergency backup gets a game and a win.',
  [r(IND,"Least time played by a goaltender, career Jorge Alves Dec 31, 2016, 7.6 sec"), r(IND,"Most games appeared in by a goaltender, career regular season: Martin Brodeur, 1,265"),
   r(W+'David_Ayres',"He is the first emergency backup goaltender to be credited with a win in the National Hockey League (NHL).")])
c('NHL.com / NHL PR',Q5,'NHL.com distinguishes goalie games from starts when it matters.',[r(NHL_OV,"It was Ovechkin's 28th goal in 47 games (46 starts) against Fleury")])
c('NHL (via AP/SI)',Q7,'The NHL itself says its 1917-1987 records needed 6,000+ fixes, and that in some years up to four assists were awarded on a goal.',
  [r(SI_AP,"Six years of poring over scoresheets and summaries of games between 1917 and 1987 by an NHL statistics team has found and fixed more than 6,000 bits of information that were overlooked or miscounted in the league's early eras."),
   r(SI_AP,"There were years when up to four assists were awarded on a goal.")])
c('Daily Faceoff',Q7,'Early assists were scarce and rules-dependent: offensive-zone only, secondary assists not full-time until 1945-46.',
  [r(DFO,"Assists were also originally awarded only on passes within the offensive zone, and, after some on and off experimenting, secondary assists weren’t handed out full-time until the 1945-46 season onward.")])
c('TSN / The Canadian Press (AP)',Q7,'AP/CP bound some "fastest" lists at 1943-44; NHL.com does not (its Makar list includes Harry Cameron, 1921-22).',
  [r(TSN_MAK,"he became the fifth-fastest defenseman since 1943-44 to reach that particular mark"), r(NHL_MAK,"Harry Cameron (88 games in 1921-22)")])
c('NHL standings / ESPN',Q8,'NHL standings count only regulation defeats as losses, so an OT/SO run is a "winless streak"; ESPN pushes back and counts all defeats.',
  [r(ESPN,"because the NHL only considers it a loss when the defeat occurs in regulation"), r(ESPN,"I know this is a real wacky concept, but a loss is a loss, and the Sabres have 18 of them in a row.")])
c('Wikipedia (List of NHL records (team))',Q8,'Streak definitions: undefeated = wins + ties; winless = regulation, OT, SO losses and ties; losing = regulation losses (plus OT losses 1983-99). Point totals are not comparable across 1983, 1999 and 2005.',
  [r(TEAM,"A winless streak includes losses in regulation, overtime, shootouts, or ties."),
   r(TEAM,"These changes in points awarded therefore make strict comparisons in wins, losses, and ties (after overtime, 1983–99, and in regulation, 1999–present) before and after these dates slightly problematic.")])
c('Wikipedia (List of NHL statistical leaders / head coaches)',Q8,'Points percentage = (2W + T + OTL) / 2GP; a 0-0 game decided by shootout gives both goalies a shutout; a shootout win counts as a goalie win (Brodeur\'s 48 included 10 SO wins).',
  [r(LEAD,"Points percentage is determined by the number of points a team earns (equal to the number of ties and overtime losses, plus twice the number of wins) divided by the total possible points (equal to twice the number of games)."),
   r(LEAD,"Since 2005-06, if the game ends in a shootout after a 0-0 scoreless tie, both teams' goaltenders are credited with a shutout, regardless of how many shots are conceded during the shootout."),
   r(IND,"Most ties, career: Terry Sawchuk, 172")])
c('Hockey-Reference',Q3,'Leader pages print NHL and WHA as separate tables under one "NHL & WHA" title; Howe is 1,850 in the NHL table and 508 in the WHA table, never summed.',
  [r(HR,"NHL & WHA Career Leaders and Records for Points"), r(HR,"WHA Leaders Table")])
c('Hockey-Reference (Sports Reference blog)',Q5,'H-R game logs (the GP basis for any "through N games" count) cover every regular-season game back to 1917-18 since July 2021.',
  [r(SRB,"we now have all NHL regular season box scores available back to the beginning of the NHL, the 1917-18 season")])
c('Wikipedia (List of NHL records; 300-win list)',Q3,'NHL-only; WHA totals appear only as a combined aside.',
  [r(W300,"If one combines both their NHL and World Hockey Association (WHA) statistics, Gerry Cheevers (329), Mike Liut (325), and Bernie Parent (304) would have at least 300 wins as well."),
   r(F50,"Bobby Hull recorded 50 goals in the first 50 games of the 1974–75 WHA season")])
c('Wikipedia (1,000-point list)',Q1,'The "fastest" column is the player\'s career game number.',[r(K1,"Game No. – Number of career games played when 1,000th point was scored")])
c('ESPN Stats & Info',Q8,'ESPN bounds a winless record at the shootout era when the definition changed.',[r(ESPN,"They own the record for the longest winless streak of the shootout era (since 2005-06)")])
c('TSN',Q1,'TSN counts "fastest to" in the player\'s games.',[r(TSN_900,"after scoring a goal and four assists in his 602nd game")])
c('Sportsnet',Q1,'Not checked: sportsnet.ca refuses our search agent. theScore (a Sportsnet peer) uses the player\'s games and years + days ages.',
  [r(SCORE,"He's the fourth-fastest player to get there, doing so in his 659th game"), r(SCORE,"McDavid is also the fourth-youngest player to hit 1,000 points at 27 years, 306 days.")])
c('QuantHockey',Q2,'Regular season by default, with playoffs, Final and Game 7 on separate tabs; rate leaders need a minimum (200 goals).',
  [r(QH,"Regular SeasonPlayoffsStanley Cup FinalsGame SevenAll PositionsForwardsDefensemenGoaliesAll PlayersActive Players"), r(QH,"-At least 200 career goals")])
c('Guinness World Records',Q4,'Age is given in years + months, a coarser grain than the NHL\'s years + days.',
  [r(GWR_Y,"At 16 years 11 months, Armand \"Bep\" Guidolin (Canada, b. 9 December 1925) became the youngest player to skate in an NHL game")])
c('Guinness World Records',Q2,'Regular season only for goalie win records.',[r(GWR_L,"seven straight regular seasons with 30-plus wins")])
c('Elias Sports Bureau (as cited)',Q2,'Elias appears as an outside fact-checker, not as the NHL\'s record keeper: it caught a Jagr GWG error because NHL.com only tracks game-winners from 1967-68.',
  [r(THW,"Multiple news outlets ran stories about Jagr’s new record before Bob Waterman of the Elias Sports Bureau discovered a critical error."),
   r(THW,"The NHL’s website only has GWG info dating back to the 1967-68 season")])

REJ=[
 dict(claim='Kucherov\'s 144 points (2023-24) is a record',reason='Not a record of any kind; the viral hook is his 100 assists (fifth player ever). Seeded as glory in the brief; keep only as the 100-assist claim.',
      receipts=[dict(url=W+'Nikita_Kucherov',quote="Kucherov ended the season with a career high in goals (44), assists (100), and points (144) in 81 games played.")]),
 dict(claim='McDavid became fastest active player to 1,000 points in 2025',reason='Wrong year: the 1,000th point was Nov. 14, 2024 (659th game).',receipts=[dict(url=NHL_MCD,quote="accomplishing the feat in 659 games (341 goals, 660 assists)")]),
 dict(claim='Penguins 17 straight losses (2003-04)',reason='The Penguins\' streak was 18 (0-17-1); the 17-loss figure belongs to the 1992-93 Sharks under the pre-1999 definition.',
      receipts=[dict(url=W+'2003–04_Pittsburgh_Penguins_season',quote="In an 18-game losing streak, they went 0–17–1 (one overtime loss)."),dict(url=W+'1992–93_San_Jose_Sharks_season',quote="most consecutive losses, with 17 in a row")]),
 dict(claim='The NHL record book lists "fastest 50 from start of season" as Gretzky 39, Gretzky 42, Lemieux 46, Bossy 50, Richard 50',reason='Partly confirmed: Gretzky 39 and Lemieux team game 46 confirmed; the full NHL list could not be opened (records.nhl.com renders client-side; its API host is off-limits to this slice). Gretzky 42 is UNVERIFIED.',
      receipts=[dict(url=IND,quote="Fastest 50 goals from start of season: Wayne Gretzky (December 30, 1981), 39 games")]),
 dict(claim='Lemieux was second-fastest to 1,000 points in 513 games, and the brief\'s seed "Lemieux 50 in 44 games played" is the official framing',reason='513 confirmed. "50 in 44" is the player-GP framing; the official record book counts team game 46.',
      receipts=[dict(url=F50,quote="which was Lemieux's 44th game of the season")]),
]
TRIED=[
 dict(source='records.nhl.com (fastest-50 page)',outcome='nothing usable: the HTML is a JS shell ("NHL Records", 142 bytes of text); its data comes from api.nhle.com/records, which belongs to the league-apis slice'),
 dict(source='quanthockey.com all-time points leaders',outcome='blocked (403); the goals-per-game page loaded (200)'),
 dict(source='nysun.com Brodeur shootout-asterisk article',outcome='blocked (429 with long Retry-After); abandoned'),
 dict(source='sportsnet.ca',outcome='blocked: the search tool refuses the domain for our agent; not fetched to respect the site\'s signal'),
 dict(source='Wikipedia "List of NHL players who have scored 50 goals in a season" and "Stanley Cup playoff records"',outcome='nothing usable (404; titles do not exist)'),
 dict(source='nhl.com/news/nhl-historical-stats-now-available/c-291389804',outcome='nothing usable (JS shell, 108 bytes of text)'),
 dict(source='Guinness World Records search for NHL career goals',outcome='nothing usable (no Ovechkin/Gretzky goals record page found)'),
 dict(source='Elias Sports Bureau as an NHL source',outcome='nothing usable: no NHL record attributed to Elias beyond the THW Jagr GWG correction'),
]
LEADS=[
 dict(note='NHL.com media stats packs (PDF) such as NHLStatsPackMcDavid1000Points_111124.pdf and the 2024-25 Approaching Milestones PDF list "fastest to N" tables with GP counts.',why_out_of_scope='PDF parsing not set up in this pass; strong candidate for known-answer gates.'),
 dict(note='NHL.com Spanish McDavid profile gives Lemieux 162 points in 1995-96 against 161 in the English release.',why_out_of_scope='An NHL.com translation inconsistency; note only.'),
 dict(note='The NHL\'s 2017 historical-stats correction (6,000+ fixes, 1917-1987) means any pre-1987 number can differ between the NHL\'s current database and older publisher pages.',why_out_of_scope='Belongs to the beachhead decision on how far back to go.'),
 dict(note='Hockey-Reference game logs to 1917-18 make "through N games" computable for every era, but SR terms forbid building on scraped data.',why_out_of_scope='Licensing; landscape slice.'),
 dict(note='Celebrini 2025-26: 115 points, third-best teen season (Crosby 120, Gretzky 137) per a search snippet.',why_out_of_scope='Snippet-only; worth one NHL.com receipt.'),
]
UNV=[
 dict(claim='Jon Cooper reached 600 wins in 1,005 games against Bowman\'s 1,002',what_i_tried='THN article saved (no game counts in it); counts seen only in a search snippet (wearegreenbay).'),
 dict(claim='McDavid fastest active player to 1,000 points (ahead of Crosby\'s 757)',what_i_tried='Daily Hive snippet only; NHL.com article does not say "active".'),
 dict(claim='NHL ruled no asterisk for Brodeur\'s 48 wins (shootout wins included)',what_i_tried='nysun.com returned 429; search snippet only.'),
 dict(claim='Most wins by a goalie through first 100 starts (any publisher list)',what_i_tried='Searches found no list.'),
 dict(claim='Fewest wins through first N games of a season (ranked publisher list)',what_i_tried='Searches found game-N records only (Sharks 0-10-1), no ranked list.'),
 dict(claim='Gretzky 42 games in the NHL "fastest 50 from start of season" list',what_i_tried='records.nhl.com is a JS app; its API host is off-limits to this slice.'),
 dict(claim='1992-93 Sharks final record 11-71-2',what_i_tried='Seen only in a search snippet (sanjosehockeynow).'),
]
