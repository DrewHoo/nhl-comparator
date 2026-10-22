# Data sources: the league's and broadcasters' APIs (slice `league-apis`)

Probed 2026-10-21 (log timestamps read 2026-10-22 UTC). Every request went through `research/lib/fetch.mjs` at GAP_MS=1500. Probe scripts: `research/league-apis/scratch/`. Quoted pages: `research/league-apis/pages/<sha1(url)>.txt`. Raw responses: `data/raw/<host>/`. Tags: [V] verified today against the API or page, [R] recalled and not re-checked, [S] seen only in a search snippet.

## Headline

- **NHL api-web reaches 1917-18 for goals, assists, points, PIM, GWG, OT goals, and goalie decision, GA, TOI and shutouts.** Each other stat starts later, at a date set by when the league began recording it: PP and SH goals 1933-34, goalie shots against and saves 1955-56, skater shots and +/- 1959-60, TOI, shifts, faceoffs, hits, blocks, giveaways and takeaways 1997-98 (per-game boxscore), and goalie OT losses as a decision 2005-06. [V]
- **The stats REST serves per-game player rows in bulk, from 1917-18.** `isGame=true&limit=-1` returns every row a filter matches, up to a hard cap of 10,000 rows per query. Paging past 10,000 returns nothing, and `total` saturates at 10,000. Windowing by month gets a modern season in about 5–8 calls, and a full 1917–2026 per-game ledger in roughly 800 requests instead of roughly 70,000 boxscores. [V]
- **ESPN's earliest box score is the 1993-94 season** (first event 1993-10-05). ESPN's events list is empty for 1992 and earlier. On the core API, though, player stats sit one request per player per game. The one-request-per-game `site.api.espn.com` summary/scoreboard host returned **403 Access Denied (Akamai) to our research user agent** on every call, soccer included. [V]
- **Terms:** NHL.com forbids "unauthorized automated means to compile information" and entering NHL Content "into a database", and limits use to "non-commercial, informational, personal use". Neither api-web nor stats-REST responses carry any terms or copyright text; the old statsapi did. Disney's terms name "data set or database" compilation by "robot, spider, script, or other automated means" outright. [V]
- **Known answers all reproduce from api-web game logs, and records.nhl.com agrees game for game.** The brief got one wrong: McDavid's 1,000th point came on **2024-11-14 vs NSH**, his 659th game. The brief had "2025-03-?". [V]

## Part 1: NHL api-web (`https://api-web.nhle.com/v1/`)

### Sample: one regular-season boxscore, one playoff boxscore, and one skater and one goalie game log (types 2 and 3) per season

Game ids came from `club-schedule-season/MTL/{season}` (WSH for 2017-18). Every request returned 200. Raw dump: `scratch/p1_box.out.json`. Key: Y = populated (non-zero on at least one row), 0 = key present but always 0, – = key absent.

Skater boxscore fields (regular / playoff combined):

| season | G | A | P | PIM | +/- | SOG | PPG | TOI | hits | blk | GV | TK | FO% | shifts |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1917-18 | Y | Y | Y | Y | 0 | 0 | 0 | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1926-27 | Y | Y | Y | Y | 0 | 0 | 0 | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1933-34 | Y | Y | Y | Y | 0 | 0 | 0* | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1942-43 | Y | Y | Y | Y | 0 | 0 | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1950-51 | Y | Y | Y | Y | 0 | 0 | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1955-56 (extra) | Y | Y | Y | Y | 0 | 0 | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1958-59 (extra) | Y | Y | Y | Y | 0 | 0 | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1959-60 | Y | Y | Y | Y | Y | Y | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1967-68 | Y | Y | Y | Y | Y | Y | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1972-73 | Y | Y | Y | Y | Y | Y | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1979-80 | Y | Y | Y | Y | Y | Y | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1987-88 | Y | Y | Y | Y | Y | Y | Y | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1996-97 (extra) | Y | Y | Y | Y | Y | Y | 0* | – | 0 | 0 | 0 | 0 | 0 | 0 |
| 1997-98 | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 2001-02 (extra) | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 2005-06 → 2024-25 | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |

\*A 0 in a single game is sampling noise; the game log and the stats REST put the PPG floor at 1933-34. Before 1997-98, every pre-RTSS skater line has TOI "00:00" or no TOI key, so a 0 TOI is not evidence of a non-appearance. The boxscore has no SHG or GWG keys at all; those live in the game log and the stats REST.

Goalie boxscore: decision (W/L/T, and O from 2005-06), GA, TOI and `starter: true` are populated from 1917-18. Shots against and saves read "absent" or 0 through 1950-51 and are populated from 1955-56 (and in every later sample). The even-strength/PP/SH split of shots against starts in 1997-98 playoffs and 2005-06. Backup goalies appear with `starter: false` and no stat keys (1996-97, 1997-98), or with "00:00" TOI (2024-25 Primeau). [V]

Game logs (`player/{id}/game-log/{season}/{2|3}`):

- **Skater keys.** goals, assists, points, PPG, PPP, GWG, OT goals, SHG, SHP and PIM are present from 1917-18. GWG is populated for Malone in 1917-18; PPG for Joliat in 1933-34; SHG for Mosdell in 1950-51. `plusMinus` and `shots` keys first appear in 1959-60. `toi` and `shifts` keys first appear in 1997-98. The game log has **no** hits, blocks, giveaways, takeaways or faceoff keys in any season. [V]
- **Goalie keys.** gamesStarted, decision, goalsAgainst, shutouts, pim and toi are present from 1917-18. `shotsAgainst` and `savePctg` appear in the 1959-60 sample; the first sampled season after 1950-51 was 1959-60, and the stats REST says 1955-56. The goalie game log has no `saves` key; saves = shotsAgainst − goalsAgainst. [V]
- **Playoff logs** (`/3`) work in every sampled season back to 1917-18 (Malone, 2 games). [V]

### Per-stat floors (first season populated, NHL league sources)

| stat | api-web boxscore | api-web game log | stats REST (first season with a non-zero value, regular season) |
|---|---|---|---|
| goals, assists, points, PIM | 1917-18 | 1917-18 | 1917-18 |
| game-winning goals | — (no key) | 1917-18 | 1917-18 (Malone 4) |
| OT goals | — | 1917-18 | 1917-18 (Malone 1) |
| empty-net goals | — | — | 1931-32 (realtime report, Joliat 1) |
| PP goals / PP points | ≤1942-43 | 1933-34 | 1933-34 (Earl Robinson) |
| SH goals | — | ≤1950-51 | 1933-34 (Buzz Boll) |
| even-strength goals | — | — | 1933-34 |
| skater shots | 1959-60 | 1959-60 | 1959-60 (Billy McNeill 59) |
| plus/minus | 1959-60 | 1959-60 | 1959-60 (Harry Howell −16) |
| TOI, shifts | 1997-98 | 1997-98 | 1997-98 (Dan Plante; Joel Bouchard shifts) |
| faceoff win % | 1997-98 | — | 1997-98 (Michael Peca) |
| hits, blocks, giveaways, takeaways | **1997-98** | — | **2005-06** (Kilger hits, Aucoin blocks…) |
| missed shots | — | — | 2005-06 |
| goalie decision W/L | 1917-18 | 1917-18 | 1917-18 |
| goalie ties | 1917-18 key | — | 1921-22 (first T recorded; John Ross Roach) |
| goalie OT loss | 2005-06 ("O") | 2005-06 | 2005-06 (Hasek 4) |
| goalie shots against / saves | 1955-56 | ≤1959-60 | 1955-56 (Glenn Hall 1,952) |
| goalie shutouts | — | 1917-18 | 1917-18 (Benedict) |
| goalie games started / starter flag | 1917-18 | 1917-18 | 1917-18 |

All [V]; the stats-REST column comes from `cayenneExp=gameTypeId=2 and <stat>>0` sorted by seasonId ascending (`scratch/p2_floors2.mjs`).

Two inconsistencies matter:

- **Hits, blocks, giveaways and takeaways for 1997-98 → 2004-05 exist only in the api-web boxscore.** The stats REST realtime report returns null for them until 2005-06. [V]
- **Goalie OT losses before 2005-06 are folded into L.** Brodeur's 2003-04 log reads W 38, L 26, T 11 with no "O". The `season` table says `pointForOTLossInUse` began in 1999-2000. A goalie-OTL board therefore has a 2005-06 floor. [V]

### Appearance unit, scratches, zero-TOI rows

- The boxscore lists the dressed lineup: 8 skaters a side in 1917-18, 11 in 1926-27, 13–14 in the 1930s–40s, about 17 in 1950s–80s, 18 skaters plus 2 goalies from 1987-88. A skater with 0 points appears. In the stats REST, game 1981020001 has 34 skater rows and 14 have 0 points. [V]
- Before 1997-98 every skater has 0 or absent TOI, so "dressed" is the only appearance definition available. A backup goalie who never entered appears with TOI 00:00 (2024-25) or `starter: false` and no stats (1996-97). [V]
- **Scratches** are not in the boxscore. They are in `gamecenter/{id}/right-rail` → `gameInfo.{away,home}Team.scratches`. For 2024020006 the lists are 3 and 3, which is plausible. For 1950020005 MTL shows **15** "scratches", including Béliveau and Geoffrion, who were not yet NHL regulars. Old-era scratch lists look like "season roster minus dressed", not real scratches; don't trust them before the modern era. [V for the counts; the interpretation is mine]

### Game types and oddities

- gameType 1 = preseason (ids `{season}01xxxx`), 2 = regular, 3 = playoffs, 4 = All-Star. 1959040013 (1959-10-03, MTL vs ALL) is type 4 and has skater G/A/+/-/SOG. [V]
- **The 2019-20 qualifying round is type 3**: MTL–PIT were 2019030021–024, ids with round digit 0 and series 2. The July 2020 exhibition is type 1 (2019011002). [V]
- **1917-18 exists as 1917020001…1917020036.** The stats REST `game` endpoint lists 36 type-2 and 7 type-3 games for 1917-18, while the `season` table says `totalRegularSeasonGames: 34`. The 2 extra are presumably the Wanderers' defaulted games ([R]). The 7 playoff games include the five 1918 Stanley Cup Final games against team id 7288, a non-NHL (PCHA) opponent (1917030211–215). A "playoff" board must decide whether non-NHL opponents count. 1917020037 is a 404. [V]
- **Neutral sites (1992-94):** the club schedule carries `neutralSite: true` and the venue. 1993020248 NYI @ MTL is at Copps Coliseum and 1993020922 BUF @ NYI at Target Center. [V]
- **Playoff id pattern:** `{season}03{round}{series}{game}`, e.g. 1917030111, 1979030131, 2017030415. [V]

### Known answers (API value next to the published value)

| claim | published / brief | api-web | records.nhl.com |
|---|---|---|---|
| Gretzky's 50th of 1981-82 | EDM's 39th game, 1981-12-30 vs PHI, 5 goals that night | 39th GP, 1981-12-30, PHI, 5 goals, EDM game #39; season 92 G in 80 GP | skaterGamesPlayed 39, teamGamesPlayed 39 |
| Richard's 50th in 1944-45 | 50th and last game, 1945-03-18 at BOS | 50th GP, 1945-03-18, at BOS (R), MTL game 50 of 50 | gameId 1944020149, 1945-03-18, at BOS, skaterGamesPlayed 50 |
| Lemieux's 50th in 1988-89 | 44th GP, PIT's 46th | 44th GP, 1989-01-20 vs WIN, PIT game #46; 85 G in 76 GP | skaterGamesPlayed 44, teamGamesPlayed 46 |
| Howe 1952-53 | 49 G, 95 P in 70 GP | 70 GP, 49 G, 95 P | — |
| Orr 1970-71 | +124 | Σ game-log plusMinus = +124 over 78 GP, 139 P | — |
| Brodeur 2006-07 wins | 48 | W 48, L 23, O 7, SO 12 | — |
| Brodeur career wins | 691 | landing careerTotals.wins 691 (otLosses 49, ties 105) | — |
| McDavid's 1,000th point | brief: 659th game, "2025-03-?" | **2024-11-14 vs NSH (home), career game 659** (645 GP / 982 P before 2024-25) | 2024-11-14, gameId 2024020264, skaterGamesPlayed 659 |
| Ovechkin's 895th goal | 2025-04-06 at NYI, 1,487th game | 2025-04-06, at NYI, career game 1,487 | — |

All [V]. The brief's McDavid date is wrong. The Ovechkin career game count is computed as landing season totals through 2023-24 plus the 2024-25 game log.

### Enumeration routes and request counts (full 1917-18 → 2025-26 compile)

The `season` table (`api.nhle.com/stats/rest/en/season`, 1 request, 109 rows from 19171918 to 20262027) sums to 66,584 regular-season games (including the scheduled 1,344 of 2026-27, an 84-game season) and 5,110 playoff games. [V]

| route | what it lists | requests |
|---|---|---|
| stats REST `game?cayenneExp=season=…` | every game of a season, all types, with scores (43 rows for 1917-18) | ~109 (1/season) [V for one season] |
| api-web `schedule/{YYYY-MM-DD}` | a 7-day `gameWeek` (verified for 2024-10-10 and 1950-10-15) | ~30/season → ~3,300 |
| api-web `club-schedule-season/{team}/{season}` | one team's season, incl. playoffs and neutralSite | Σ teams × seasons → ~2,400 |
| stats REST `skater/summary` and `goalie/summary` (season aggregate, `limit=-1`) | every player who played | ~2/season → ~220 |

Full compile by route:

- **A. Per-game boxscores (api-web)**: about 65,240 regular games played through 2025-26 plus about 5,110 playoff games, roughly **70,350 requests**, plus about 109 for the list. At 1.5 s that is about 29 h. [V counts; arithmetic]
- **B. Per-player game logs (api-web)**: one request per player × season × game type. Player-seasons were not counted. On the brief's ~8,000 players at roughly 5–6 seasons each, that is about 45k × 2 types, so **~90k requests** [S/estimate]. It is worse than A and lacks hits, blocks and faceoffs.
- **C. Stats REST per-game rows (bulk)**: about **800 requests** for the whole ledger. See Part 2.

**Rate limits: none hit.** No 429, 5xx or retries across 136 api-web, 58 stats-REST and 9 records requests at 1.5 s. The API needs no key. [V]

## Part 2: NHL stats REST (`https://api.nhle.com/stats/rest/en/`)

**It serves per-game rows in bulk.** `skater/summary?isAggregate=false&isGame=true&limit=-1&cayenneExp=seasonId=19811982 and gameTypeId=2 and gameDate<="1981-10-31"` returned **4,074 player-game rows from 120 games in one 2.07 MB response**. That is about 509 bytes a row, carrying gameId, date, opponent, home/road, G, A, P, +/-, PIM, S, PPG, PPP, SHG, SHP, GWG, OTG and EV goals. [V]

**The cap.** Any query's result window is 10,000 rows. `total` reports 10000 when the true count is larger, `start=9998` returns 2 rows, and `start=10000` returns `[]`. So split by `gameDate` range, team, or gameId range so each query matches fewer than 10,000 rows. `limit=-1` returns the whole window in one call. [V]

Earliest season returning game rows (`isGame=true`, sample 1917-18 / 1950-51 / 1979-80 / 1997-98 / 2005-06 / 2010-11):

| report | game rows from | populated columns by era |
|---|---|---|
| skater/summary | **1917-18** (541 rows) | G/A/P/PIM/GWG from 1917-18; PP/SH/EV from 1933-34; shots, +/- 1959-60; TOI/game, FO% 1997-98 |
| goalie/summary | **1917-18** (69 rows) | W/L/GA/GAA/TOI/GS from 1917-18; ties 1921-22; SA/SV/SV% 1955-56; OTL 2005-06 |
| skater/realtime | 1917-18 (rows exist) | first goals 1917-18; empty-net 1931-32; hits/blk/GV/TK/missed 2005-06; shot-attempt detail 2010-11 |
| skater/timeonice | 1917-18 (rows exist, all null) | TOI, EV/PP/SH TOI, shifts from 1997-98 |
| team/summary | **1917-18** (72 rows = 36 games × 2) | GF/GA/W/L from 1917-18; ties 1950-51 sample; shots and PP% 1979-80 sample; FO% 1997-98; OTL and SO wins 2005-06 |

All [V].

**Bulk cost estimate** (rows per season scale with games × dressed skaters; measured points: 541 in 1917-18, 6,594 in 1950-51, about 28k in 1981-82 by projection from October's 4,074, about 47k now):

- skater/summary: about 2.3M rows in all, at most 10k per query, windowed by month → **~400 requests**
- goalie/summary: under 10k rows per season → **~110**
- timeonice, 1997-98+: **~170**
- realtime, 2005-06+: **~125**

About 800 requests (about 20 minutes at 1.5 s) against about 70,000 boxscores. One caveat: the REST misses 1997-98 → 2004-05 hits, blocks, giveaways and takeaways, which only the boxscore has. [estimate from V measurements]

**records.nhl.com** (`/site/api/`, 9 requests):

- `franchise` lists 40 franchises with first and last seasonId. [V]
- `milestone-1000-point-career` (103 rows), `milestone-500-goal-career` (50) and `milestone-50-goal-season` (212) carry the league's own "games to milestone" fields: `skaterGamesPlayed` (the player's game number at the milestone), `teamGamesPlayed`, `gameId`, date, opponent goalie and `typeOfPoint`. These are the league's own "fastest to" definitions, keyed to NHL game ids, and they agreed with every api-web computation above. [V]
- `record-detail` and `milestone-goalie-wins` are 404. [V]

This is a gate source: a ledger's computed "fastest to N" can be checked against it.

## Part 3: ESPN NHL

**`site.api.espn.com` is blocked to us.** `scoreboard?dates=…` returned 403 "Access Denied" (Akamai, `errors.edgesuite.net`) for all 10 dates from 1995 to 2025, for the bare NHL scoreboard, and for the soccer `eng.1` scoreboard. The cause is likely the helper's descriptive user agent or IP reputation. We did not try to evade it. So `summary?event=` (1 request per game) and `scoreboard?dates=YYYY&limit=1000` are untested. [V] This contradicts the brief's premise that ESPN's site API is the cheap precedent route, at least from this machine.

**`sports.core.api.espn.com` answers (200).** `seasons` lists 67 seasons, 1961 → 2027. Events, though, start in **1993-94**:

- `events?dates=1992` → 0; `dates=1993` → 492, first `131005003` = 1993-10-05; `dates=1994` → 690; `dates=1998` → 1,091 (2 pages of 1,000). [V]
- `seasons/1994/types/2/events` = 1,092 (the 1993-94 NHL schedule, [R]). `seasons/1995/types/2` = 624 (48 games × 26 / 2 ✓). `seasons/1995/types/3` = 81; **seasontype 3 = playoffs exists.** 1994-05-20 TOR @ VAN is type 3. [V]
- The whole-year listing works on core: `events?dates=YYYY&limit=1000` gives refs only. [V]

ESPN per-game box (one game per date; one skater's stat object sampled):

| date | box | skater fields seen | goalie | scratched flag |
|---|---|---|---|---|
| 1994-01-15 | yes (statsSource "official") | GP, G/A/PTS, +/-, S, PIM, PPG | — | 0 of 19 |
| 1995-02-15 | yes | G, +/-, S | — | 0 of 19 |
| 1998-01-15 | yes | G, +/-, S, PTS | — | 0 of 19 |
| 2001-01-15 | yes | — | SA 25, SV 23, GA 2, W, TOI 3600 | 0 of 19 |
| 2003-01-15 | yes | TOI, PP/SH/ES TOI, shifts, S, PIM, **hits, blocks** | — | 2 of 22 |
| 2006-01-15 | yes | TOI, shifts, **GV**, hits, blocks | — | 3 of 22 |
| 2008-01-15 | yes | +/-, TOI, hits, blocks, **TK**, GV | — | 1 of 21 |
| 2012-01-15 | yes | | — | 2 of 22 |
| 2020-01-15 / 2025-01-15 | yes | adds FO, FW/FL, PROD, SM | — | 3 of 23–32 |

[V, one athlete per game; "first seen" is a ceiling, not a floor.] The athlete id is ESPN's own (e.g. Gretzky 4128 [V via the `athletes/4128` displayName], Jagr 405 [S], Crosby 3114 [R]). It is not the NHL id. A 1990s ESPN roster has 19 entries and no scratches; from 2003 the roster carries `scratched` entries.

Athlete routes:

- `athletes/{id}/statistics` returns career splits (Gretzky, Jagr). [V]
- `seasons/1998/athletes/4128/eventlog` returns count 82, 25 per page, and only **refs** to per-game stats. `seasons/1986/athletes/4128/eventlog` returns an empty object, so there is nothing before 1993-94 even for Gretzky. Jagr 2001: 81 events; Crosby 2010: 82. [V]

**Cost on core:** player stats are one `$ref` per player per game. A box is 1 event + 2 rosters + about 38 stat calls, roughly 40 requests a game. That puts 1993-94 → 2025-26 at roughly 1.5M requests. **Core is a receipt source, not a compile route.** [V structure; arithmetic]

## Part 4: Terms, verbatim

**NHL.com Terms of Service**, https://www.nhl.com/info/terms-of-service, "Last Updated: October 29, 2025", retrieved 2026-10-21 (`pages/dc70bdd6632cad9d70cc39d47e6153ab1a9ce3c0.txt`) [V]:

- Scope: the Terms govern "the digital platforms, websites and online services that display or provide an authorized link to these Terms (collectively, the "Services"). The Services include, without limitation, nhl.com, and NHL mobile applications…"
- §2: "Engage in unauthorized spidering, scraping, or harvesting of content or information, or use any other unauthorized automated means to compile information;"
- §2: "Take any action that imposes an unreasonable or disproportionately large load on our network or infrastructure;"
- Content: "You may access, use, and display the Services, but only for non-commercial, informational, personal use, without modification or alteration in any way, and only so long as you comply with these Terms."
- Copyright: "Unless expressly permitted by an authorized person in writing or as permitted by applicable law, you may not copy, reproduce, distribute, publish, enter into a database, display, perform, modify, create derivative works from, transmit, or in any way use or exploit any part of the NHL Content or the Services."
- "…are provided for your private, non-commercial use, and you may not distribute, modify, translate, rebroadcast, transmit, perform, or create derivative works of them."

**api-web.nhle.com / api.nhle.com / records.nhl.com responses carry no terms, copyright or license text.** A grep for "terms" or "copyright" over every cached body from the three hosts finds nothing. The hosts publish no docs, and no request needed a key. [V] By contrast, the retired `statsapi.web.nhl.com` stamped every response with `"copyright" : "NHL and the NHL Shield are registered trademarks of the National Hockey League. NHL and NHL team marks are the property of the NHL and its teams. © NHL 201…"` (as documented in dword4/nhlapi README, `pages/` copy) [V of the README]. Whether api-web is a "Service" under the ToS is the open question: it neither displays nor links the Terms.

**NHL Edge / NHL "data" pages:** not checked; see `unverified`.

**Disney Terms of Use** (covers ESPN), https://disneytermsofuse.com/english/, "Last Updated: May 24, 2024", retrieved 2026-10-21 (`pages/634216260076b235798aec379e106fee05aec22a.txt`) [V]:

- Scope: "…which may be branded Disney, ABC, ESPN, Marvel, Pixar…"
- Prohibited: "access, monitor, copy or extract the Disney Products using a robot, spider, script, or other automated means, including, for the avoidance of doubt, for the purposes of creating or developing any AI Tool, data mining or web scraping or otherwise compiling, building, creating or contributing to any collection of data, data set or database (other than for a public search engine's use of spiders…)"
- License: "…for your personal, noncommercial use only…"
- "You understand that the Disney Products are for your personal, noncommercial use and are intended for informational and entertainment purposes only…"

## Precedent: who visibly builds on the NHL API

- **sportsdataverse / fastRhockey.** The `fastRhockey-nhl-raw` README reads "Raw NHL game JSON data scraped from the NHL API via fastRhockey". It runs a scheduled `scrape_nhl_raw.yml` daily through the season and republishes through the `sportsdataverse-data` releases (MIT producer / CC BY badge, per the shared brief). [V, page cached by a sibling agent and saved here]
- **hockeyR-data.** "A data repository for NHL play-by-play data scraped using hockeyR. Automatically updates each night…" [V]
- **Kaggle "NHL Game Data" (martinellis).** "Thanks to Kevin Sidwar who began documenting the still un-documented NHL stats API which was used to gather this data." License: "Other (specified in description)". [V]
- **MoneyPuck.** Its data page licenses its own files ("free to use for non-commercial purposes… Please clearly credit MoneyPuck.com"; "Non-approved scraping of the MoneyPuck website will be blocked"). A third-party package says MoneyPuck's shot data comes "from several sources including the NHL and ESPN". [V for the MoneyPuck quote; S for the sourcing]
- **Natural Stat Trick, Evolving-Hockey, HockeyViz.** A blog claim says they all build on the same NHL real-time feed. [S]
- **Unofficial docs**: dword4/nhlapi (old statsapi, 2018) and Zmalski/NHL-API-Reference ("an unofficial reference for the NHL APIs… two primary sources… api-web.nhle.com and api.nhle.com/stats/rest"). [V] Many CRAN, PyPI and Apify scrapers advertise "no API key". [S]
- **Blocks or takedowns: none found.**
  - No cease-and-desist and no report of the NHL blocking API scraping turned up. [S, absence]
  - The old statsapi host stopped resolving, with api-web replacing it around 2023; no official announcement was found. [S]
  - api-web has never needed a key as far as anything found shows. [V today, S historically]
  - ESPN's site API did block us today. [V]

## What "as far back as we can" means, per route

- **NHL api-web (boxscores or game logs) reaches 1917-18** for goals, assists, points, PIM, GWG, OT goals, and goalie decisions, GA, minutes and shutouts. It stretches the whole sentence back a century, at the cost of era-bounded words:
  - PP and SH from 1933-34
  - goalie saves from 1955-56
  - shots and +/- from 1959-60
  - TOI, shifts, faceoffs and hits/blocks/giveaways/takeaways from 1997-98
  - goalie OT losses from 2005-06
  - ties from 1921-22 to 2004-05

  The stats REST gets the same ledger (minus 1997-2005 hits, blocks, giveaways and takeaways) in about 800 calls instead of about 70,000. records.nhl.com is a free answer key for "fastest to" milestones. Both sit under NHL.com terms that bar "automated means to compile information" and entering content "into a database", although the API responses themselves carry no terms.
- **ESPN** has box scores from **1993-94** (G/A/+/-/S/PIM; TOI by 2000-01; hits and blocks by 2002-03; giveaways 2005-06; takeaways and faceoffs by 2007-08, all as sampled ceilings). Its cheap site API refused us, its core API costs about 40 requests a game, and Disney's terms name database compilation explicitly. It offers nothing the NHL route lacks.
- **The open third-party files start in 2010** (sportsdataverse, from the NHL API) or 2008 (MoneyPuck). They are the only route that is not a self-compiled crawl.

So "as far back as we can" is 1917-18 if Drew accepts a self-compiled NHL-API ledger on the fastRhockey/Kaggle precedent, and 2010 if he holds the sibling-site rule.

---

Request tally (my lines in `data/raw/logs/fetch.log`, by host): api-web.nhle.com 136 · api.nhle.com 58 · records.nhl.com 9 · site.api.espn.com 12 (all 403) · sports.core.api.espn.com 62 · www.nhl.com 1 · disneytermsofuse.com 1. **Total 279 of 450.** Not mine: the Gretzky landing line at 03:30, one records.nhl.com HTML page, and 11 www.nhl.com news pages fetched by sibling agents in the same window.
