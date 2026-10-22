# NHL league landscape: eras, stat floors, franchises, counting rules

Slice `landscape`, 2026-10-21. Every claim is tagged [V] (checked today against a saved page), [R] (recalled, not re-checked) or [S] (search snippet / secondary source only). Saved page text: `research/landscape/pages/<sha1(url)>.txt`. Structured return: `research/landscape/return.json` (137 fact rows, 11 rejections; a script, `landscape/scratch/build_return.mjs`, string-checks all 169 receipt quotes against the saved pages and found 0 misses). I made 39 network fetches through `research/lib/fetch.mjs` (2 more pages were already cached). I made no NHL API calls. I fetched four Hockey-Reference pages, one per lead.

## The short version: what a comparator engine has to know before counting

1. **Goals, assists and points go back to 1917-18. Almost nothing else does.** The 1917-18 Hockey-Reference table has GP, G, A, PTS, PIM and GWG and no other populated columns [V]. Assists were credited sparingly at first, with at most one per goal until about 1936 [S]. A "points through N games" comparison that crosses the 1930s compares different scoring rules.
2. **Plus-minus and skater shots both start officially in 1967-68.** The NHL also compiled plus-minus back to 1959 [V]. TOI is game-level from 1997-98 [V]. Hits, blocks, giveaways and takeaways are subjective, rink-biased RTSS counts [V].
3. **Season length is a variable, not 82.** It ran 22 → 18 → 24 → 30 → 36 → 44 → 48 → 50 → 60 → 70 → 74 → 76 → 78 → 80 → **84** (1992-94) → 48 (1994-95) → 82, with 2004-05 cancelled, 48 in 2012-13, **68–71 (unequal)** in 2019-20, 56 in 2020-21, 82, and **84 again from 2026-27** [V].
4. **The franchise identity is whatever the NHL last ruled. On Sept 24, 2026 it changed.** The Winnipeg Jets' statistical history is now Jets 1.0 (1979-96) + Atlanta Thrashers (1999-2011) + Jets 2.0. The inactive Coyotes keep only Arizona, 1996-2024. Utah (2024) is a new franchise with no inherited history [V, NHL.com]. The ledger needs a franchise-id table it can re-map, not a key derived from relocation chains.
5. **The appearance unit.** One row is one player in one game; regular season (type 02) and playoffs (03) are never summed; All-Star (04) is excluded [V]. A goalie credited with a GP and a win can be an emergency backup (Ayres, 2020) [V]. In 1917-18, the team standings include two Wanderers "games" that were never played [V].
6. **The date trap.** Store the game's local date (the NHL's own "game date"), never the UTC date of the start time. A 7:00 pm Pacific puck drop is 02:00 or 03:00 UTC the next day. That is the bug that put the WNBA and CFB sites a day off [R; the API field semantics are the league-apis agent's to confirm]. Neutral sites need a `neutral` flag, with home/away kept as designated: in 1992-94 each team played two "home" games at neutral sites, and in the 2020 hubs home ice went to the higher seed [V].

## 1. Eras and stat floors

| Stat | First season (league-wide) | Caveat | Grade / receipt |
|---|---|---|---|
| Goals, assists, points | 1917-18 | Hockey-Reference has them for 1917-18 (Malone 44-4-48 in 20 GP). Assists were sparse early: Total Hockey says "no assists were given" in 1917-18, which HR contradicts (see rejections). | [V] HR NHL_1918_skaters |
| Assists per goal | max 1 until ~1936; up to 3 in one mid-1930s season; max 2 since | The two secondary sources quote the same Total Hockey chapter but disagree on the year: 1935-36 (Dobber) or 1936-37 (HockeyWriters). | [S] thehockeywriters, dobberhockey |
| PIM | 1917-18 | Populated on HR 1917-18 | [V] HR 1917-18 |
| Game-winning goals | 1917-18 on HR | A derived stat that HR computes back to 1917-18. Not an official recording floor. | [V] HR 1917-18 (GWG column populated) |
| Plus-minus | official 1967-68; NHL-compiled back to 1959-60 | Wikipedia's Plus–minus (sports) article says it became official in 1959-60. Its NHL Plus-Minus Award article says the NHL "started counting" in 1967 and compiled back to 1959. Treat 1959-66 as reconstructed. | [V] Wikipedia NHL Plus-Minus Award |
| Skater shots on goal | 1967-68 official | HR underlines earlier career totals as incomplete (Bobby Hull's career shots, for example). | [V] HR glossary |
| Goalie shots against / SV% | HR carries it into the 1950s (Bower 1953-70 is 2nd in career SV%) | Official floor not verified. 1983-84 is often cited. | [V] HR save_pct_career; official floor unverified |
| PP / SH goals | commonly 1933-34 | Not verified. HR's 1917-18 table has no PP/SH columns. | unverified |
| TOI (and shifts) | 1997-98 game-level | HR extended season TOI from 1998-99 back to 1997-98 in Sept 2023 and reconciled 1998-2008 season totals to game totals. | [V] sports-reference blog 2023/09 |
| Faceoffs | 1997-98 (RTSS) | not verified | [R] |
| Hits, blocks, giveaways, takeaways | RTSS distributed them for two seasons around 2000-02, then scrubbed them; the public series runs from ~2005-06 | Scrubbed because they "could vary from building to building". Rink effects are documented in the RTSS literature. | [V] ESPN (Frei) column; [V] arXiv 1412.1035; 2005-06 restart [R] |
| Ties | ended after 2004-05 | A shootout decides every tied game from 2005-06 | [V] Wikipedia Overtime |
| Regular-season OT | 10-min non-sudden-death until Nov 21, 1942; none 1942-83; 5-min sudden death from 1983-84 | | [V] Wikipedia Overtime |
| OT-loss point | 1999-2000 | 4-on-4 OT in the same year [R] | [V] Wikipedia Overtime |
| Shootout | 2005-06 | Shootout goals give a player no goals or points | [V] Overtime; [V] Dobber |
| 3-on-3 OT | 2015-16 | | [V] Wikipedia Overtime |
| Empty-net goals, goalie GS | not verified | | unverified |

## 2. Season lengths and interruptions

| Seasons | Games per team | Notes | Receipt |
|---|---|---|---|
| 1917-18 | 22 | Wanderers withdrew after 6 (4 played, 2 defaulted; the defaults count as wins for MTL and TOR but were never played). Four teams, then three. | [V] List of NHL seasons; 1917-18 season |
| 1918-19 | 18 | 20 scheduled; stopped at 18 when the Arenas withdrew. The NHL final was completed; the **Stanley Cup Final** vs Seattle was cancelled by influenza at 2–2–1. | [V] 1918-19 season |
| 1919-20 – 1923-24 | 24 | Quebec joined 1919-20 | [V] |
| 1924-25 | 30 | | [V] |
| 1925-26 | 36 | | [V] |
| 1926-27 – 1930-31 | 44 | | [V] |
| 1931-32 – 1941-42 | 48 | Ottawa and Philadelphia sat out 1931-32 | [V] |
| 1942-43 – 1945-46 | 50 | Original Six begins | [V] |
| 1946-47 – 1948-49 | 60 | | [V] |
| 1949-50 – 1966-67 | 70 | | [V] |
| 1967-68 | 74 | 12 teams | [V] |
| 1968-69 – 1969-70 | 76 | | [V] |
| 1970-71 – 1973-74 | 78 | | [V] |
| 1974-75 – 1991-92 | 80 | | [V] |
| 1992-93 – 1993-94 | 84 | Includes two "home" games per team at neutral sites | [V] 1992-93 season |
| 1994-95 | 48 | Lockout | [V] |
| 1995-96 – 2003-04 | 82 | | [V] |
| 2004-05 | 0 | Season cancelled (lockout) | [V] |
| 2005-06 – 2011-12 | 82 | | [V] |
| 2012-13 | 48 | Lockout | [V] |
| 2013-14 – 2018-19 | 82 | | [V] |
| 2019-20 | 68–71 (unequal) | Paused March 12, 2020; the rest was scrapped and standings went by points percentage. A 24-team return in the Toronto and Edmonton hubs. | [V] 2019-20 season |
| 2020-21 | 56 | Divisional-only schedule, all-Canadian North Division | [V] 2020-21 season |
| 2021-22 – 2025-26 | 82 | | [V] |
| 2026-27 – | **84** | CBA ratified July 2025 | [V] List of NHL seasons; [S-grade] press report says "reportedly" |

Engine consequence: "through N games" windows work, but season-level ranks ("most goals in a season") need a per-season games-available denominator, and 2019-20 needs per-team GP.

## 3. League structure and franchise identity

**The rule.** Under the NHL constitution a franchise outlives its city. Wikipedia gives the example "the Kansas City Scouts, Colorado Rockies, and New Jersey Devils are one franchise" [V]. Statistical history, though, is an NHL ruling and can be revised. On **September 24, 2026** the NHL and the Jets announced that the Jets' history "now encompasses their first stint in Winnipeg (1979-96) as well as their years as the Atlanta Thrashers (1999-2011) and their seasons in Winnipeg since 2011-12", and that the Coyotes' history covers "only ... its years in Arizona (1996-2024)". The change is "reflected in the statistical sections of NHL.com, the NHL app" [V, NHL.com]. The **Utah** franchise was established April 18, 2024 as a new franchise. The Coyotes franchise became **inactive** and transferred "the totality of its existing hockey assets" [V, NHL.com]. Utah Hockey Club was renamed **Utah Mammoth** for 2025-26 [V].

So: `franchise_id` is a table keyed by (team-season) → franchise. The 2026 ruling means the NHL now has a franchise (ARI) whose first season is 1996-97, and Winnipeg's franchise has a gap from 1996 to 1999.

| Team | NHL years | Became | Receipt |
|---|---|---|---|
| Montreal Wanderers | 1917-18 | defunct (arena fire; 4 GP + 2 defaults) | [V] relocation list |
| Quebec Bulldogs/Athletics | 1919-20 | Hamilton Tigers 1920 | [V] |
| Hamilton Tigers | 1920-25 | defunct (players' strike; players bought by the NY Americans, not the franchise) | [V] |
| Pittsburgh Pirates | 1925-30 | Philadelphia Quakers 1930-31, defunct | [V] |
| Ottawa Senators (original) | 1917-34 (out 1931-32) | St. Louis Eagles 1934-35, defunct | [V] |
| New York → Brooklyn Americans | 1925-42 | renamed 1941-42; defunct | [V] |
| Montreal Maroons | 1924-38 | defunct | [V] |
| California/Oakland/Bay Area/California Golden Seals | 1967-76 | Cleveland Barons 1976-78 → merged into Minnesota North Stars (approved June 14, 1978). The Sharks are officially a separate franchise. | [V] |
| Kansas City Scouts | 1974-76 | Colorado Rockies 1976-82 → New Jersey Devils | [V] |
| Atlanta Flames | 1972-80 | Calgary Flames | [V] |
| Minnesota North Stars | 1967-93 | Dallas Stars | [V] |
| Quebec Nordiques | 1979-95 | Colorado Avalanche | [V] |
| Winnipeg Jets (1.0) | 1979-96 | players to Phoenix; **history now Winnipeg's** (2026 ruling) | [V] |
| Hartford Whalers | 1979-97 | Carolina Hurricanes (Greensboro, then Raleigh 1999) | [V] |
| Atlanta Thrashers | 1999-2011 | Winnipeg Jets (2.0) | [V] |
| Phoenix → Arizona Coyotes | 1996-2024 | renamed 2014-15; inactive 2024; assets to Utah | [V] |
| Renames | Toronto (Arenas) → St. Patricks 1919-20 → Maple Leafs mid-1926-27; Detroit Cougars → Falcons 1930-31 → Red Wings 1932-33; Black Hawks → Blackhawks 1986-87; Mighty Ducks of Anaheim → Anaheim Ducks 2006-07 | | [V] History of organizational changes |
| Expansion/merger milestones | NHA → NHL 1917; Original Six 1942-67; six-team expansion 1967; WHA merger 1979 (EDM, HFD, QUE, WPG) | | [V] List of NHL seasons notes 15, 21 |

Team abbreviations per era (WPG/ATL/PHX/ARI/UTA, QUE/COL, HFD/CAR, MNS/DAL, KCS/CLR/NJD, AFM/CGY) are left as a lead for the league-apis agent, who can read what the API actually emits.

## 4. What the NHL counts

- **WHA ≠ NHL.** Statistics are shown as separate NHL, WHA and combined rows. Howe: 1,767 NHL GP, 801 goals; WHA 419 GP, 174 goals; 975 exists only as a combined figure [V, Wikipedia stats table]. The NHL's 2026 Jets consolidation starts at 1979 and excludes the WHA Jets (1972-79) [V]. I did not find an nhl.com sentence that states the exclusion in general [unverified].
- **NHA (1910-17)** is a predecessor league, listed separately [V].
- **Regular season and playoffs are never combined.** The game-type digits separate preseason 01, regular season 02, playoffs 03 and All-Star 04 [V].
- **Games played.** Emergency backup goalie David Ayres (Feb 22, 2020) was "credited with a win", along with a GP [V]. Whether a dressed skater with no shift gets a GP, and the 1919-20 GP quirks, are unverified.
- **Suspended games.** Blues–Ducks (Feb 11, 2020) was suspended at 1–1 in the 1st after Bouwmeester collapsed and was "made up on March 11" [V]. Stats from a suspended-and-replayed game may not stand. Check this in the box scores.
- **Headline stats.** Skaters: points (G+A). Goalies: W, GAA, SV%, SO. +/- carries its 1967-68 floor. Shootout goals are not goals [V].

## 5. Dates, time zones, venues

- **Game id `SSSSTTGGGG`.** Season start year, then type (01 pre, 02 reg, 03 playoffs, 04 All-Star), then game number. In playoff ids, GGGG encodes round, matchup and game [V, dword4/nhlapi README]. The 1917-18 numbering (1917020001 exists per the earlier agent) and the per-era gaps belong to league-apis.
- **Local date vs UTC.** Use the local game date [R]. See the lead in return.json.
- **Neutral sites.** 1992-94 neutral-site "home" games [V]. Regular-season games abroad since Oct 3-4, 1997 (Anaheim–Vancouver, Japan) [V]. Outdoor games since 2003-04, annual since 2007-08 [V]. 2020 hubs in Toronto and Edmonton, with home ice to the higher seed [V]. A `neutral_site` flag is needed; "home/road splits" must say how they treat them.
- **Doubleheaders.** None known in the NHL [unverified]. Keying a game by (team, date) is probably safe, but key by game id anyway.

## 6. People and ids

- **NHL.com player id** (Wikidata **P3522**) matches `84[4-9]\d{4}`: 7 digits starting 84 [V].
- **Hockey-Reference id** is Wikidata **P3598**, like `m/malonjo01` [V]. **P3567 is the HHOF.com id, not HR** [V]. **Elite Prospects** is **P2481**, an integer [V].
- **Name collisions.** Two Sebastian Ahos: the Finnish forward born 1997 (Carolina) and the Swedish defenceman born 1996 [V]. Always key on id. Tkachuks and multiple Mike Smiths [R].
- **Birthdates.** NHL `landing` has them (earlier agent). For an open pre-2010 source, Hockey Databank Master or Wikidata are leads for the open-datasets slice. Coach-per-game: lead (Hockey Databank Coaches; HR coach pages are receipts only).

## 7. Where the legends sit

Source: one batched MediaWiki API request for 48 Wikipedia articles (saved as `landscape/pages/aed5f098….txt`). I parsed the career-stats table: the first and last regular-season NHL season with GP > 0, and GP from the "NHL totals" row. Active careers run through 2025-26, the last row in the articles. "Full" means the first NHL regular season ≥ floor; "part" means the career straddles the floor; "none" means the career ended before it. A playoff-only debut (Brett Hull, Iginla, Makar) does not count as the first season. The parsed rows match the totals row for 45 of 48 players. For Messier, Luongo and Bourque, traded-season rows didn't parse; their GP comes from the totals row, and I checked their first and last seasons by eye.

| Player | Pos | First NHL season (reg.) | Last NHL season in table | NHL GP | WHA seasons (GP) | Note | 1917-18 | 1967-68 | 1987-88 | 1997-98 | 2005-06 | 2007-08 | 2010-11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Wayne Gretzky | S | 1979-80 | 1998-99 | 1487 | 1978-79 (80) |  | full | full | part | part | none | none | none |
| Maurice Richard | S | 1942-43 | 1959-60 | 978 | — |  | full | none | none | none | none | none | none |
| Bobby Orr | S | 1966-67 | 1978-79 | 657 | — |  | full | part | none | none | none | none | none |
| Bobby Hull | S | 1957-58 | 1979-80 | 1063 | 1972-73–1978-79 (411) |  | full | part | none | none | none | none | none |
| Gordie Howe | S | 1946-47 | 1979-80 | 1767 | 1973-74–1978-79 (419) |  | full | part | none | none | none | none | none |
| Mario Lemieux | S | 1984-85 | 2005-06 | 915 | — |  | full | full | part | part | part | none | none |
| Steve Yzerman | S | 1983-84 | 2005-06 | 1514 | — |  | full | full | part | part | part | none | none |
| Jacques Plante | G | 1952-53 | 1972-73 | 837 | 1974-75 (31) |  | full | part | none | none | none | none | none |
| Jaromír Jágr | S | 1990-91 | 2017-18 | 1733 | — |  | full | full | full | part | part | part | part |
| Teemu Selänne | S | 1992-93 | 2013-14 | 1451 | — |  | full | full | full | part | part | part | part |
| Ken Dryden | G | 1970-71 | 1978-79 | 397 | — |  | full | full | none | none | none | none | none |
| Phil Esposito | S | 1963-64 | 1980-81 | 1282 | — |  | full | part | none | none | none | none | none |
| Martin Brodeur | G | 1991-92 | 2014-15 | 1266 | — |  | full | full | full | part | part | part | part |
| Guy Lafleur | S | 1971-72 | 1990-91 | 1126 | — |  | full | full | part | none | none | none | none |
| Patrick Roy | G | 1984-85 | 2002-03 | 1029 | — |  | full | full | part | part | none | none | none |
| Jean Béliveau | S | 1950-51 | 1970-71 | 1125 | — |  | full | part | none | none | none | none | none |
| Stan Mikita | S | 1958-59 | 1979-80 | 1394 | — |  | full | part | none | none | none | none | none |
| Dominik Hašek | G | 1990-91 | 2007-08 | 735 | — |  | full | full | full | part | part | part | none |
| Doug Harvey | S | 1947-48 | 1968-69 | 1113 | — |  | full | part | none | none | none | none | none |
| Terry Sawchuk | G | 1949-50 | 1969-70 | 971 | — |  | full | part | none | none | none | none | none |
| Brett Hull | S | 1986-87 | 2005-06 | 1269 | — | playoff-only debut 1985-86 | full | full | part | part | part | none | none |
| Joe Sakic | S | 1988-89 | 2008-09 | 1378 | — |  | full | full | full | part | part | part | none |
| Joe Thornton | S | 1997-98 | 2021-22 | 1714 | — |  | full | full | full | full | part | part | part |
| Mark Messier | S | 1979-80 | 2003-04 | 1756 | 1978-79 (52) |  | full | full | part | part | none | none | none |
| Jarome Iginla | S | 1996-97 | 2016-17 | 1554 | — | playoff-only debut 1995-96 | full | full | full | part | part | part | part |
| Roberto Luongo | G | 1999-00 | 2018-19 | 1044 | — |  | full | full | full | full | part | part | part |
| Nicklas Lidström | S | 1991-92 | 2011-12 | 1564 | — |  | full | full | full | part | part | part | part |
| Grant Fuhr | G | 1981-82 | 1999-00 | 868 | — |  | full | full | part | part | none | none | none |
| Ray Bourque | S | 1979-80 | 2000-01 | 1612 | — |  | full | full | part | part | none | none | none |
| Mike Bossy | S | 1977-78 | 1986-87 | 752 | — |  | full | full | none | none | none | none | none |
| Marcel Dionne | S | 1971-72 | 1988-89 | 1348 | — |  | full | full | part | none | none | none | none |
| Paul Coffey | S | 1980-81 | 2000-01 | 1409 | — |  | full | full | part | part | none | none | none |
| Bryan Trottier | S | 1975-76 | 1993-94 | 1279 | — |  | full | full | part | none | none | none | none |
| Alexander Ovechkin | S | 2005-06 | 2025-26 | 1573 | — | active; GP through 2025-26 | full | full | full | full | full | part | part |
| Sidney Crosby | S | 2005-06 | 2025-26 | 1420 | — | active; GP through 2025-26 | full | full | full | full | full | part | part |
| Henrik Lundqvist | G | 2005-06 | 2019-20 | 887 | — |  | full | full | full | full | full | part | part |
| Evgeni Malkin | S | 2006-07 | 2025-26 | 1269 | — | active; GP through 2025-26 | full | full | full | full | full | part | part |
| Patrick Kane | S | 2007-08 | 2025-26 | 1369 | — | active; GP through 2025-26 | full | full | full | full | full | full | part |
| Steven Stamkos | S | 2008-09 | 2025-26 | 1246 | — | active; GP through 2025-26 | full | full | full | full | full | full | part |
| Nathan MacKinnon | S | 2013-14 | 2025-26 | 950 | — | active; GP through 2025-26 | full | full | full | full | full | full | full |
| Connor McDavid | S | 2015-16 | 2025-26 | 794 | — | active; GP through 2025-26 | full | full | full | full | full | full | full |
| Connor Hellebuyck | G | 2015-16 | 2025-26 | 625 | — | active; GP through 2025-26 | full | full | full | full | full | full | full |
| Auston Matthews | S | 2016-17 | 2025-26 | 689 | — | active; GP through 2025-26 | full | full | full | full | full | full | full |
| Cale Makar | S | 2019-20 | 2025-26 | 470 | — | playoff-only debut 2018-19; active; GP through 2025-26 | full | full | full | full | full | full | full |
| Quinn Hughes | S | 2018-19 | 2025-26 | 507 | — | active; GP through 2025-26 | full | full | full | full | full | full | full |
| Jack Hughes | S | 2019-20 | 2025-26 | 429 | — | active; GP through 2025-26 | full | full | full | full | full | full | full |
| Connor Bedard | S | 2023-24 | 2025-26 | 219 | — | active; GP through 2025-26 | full | full | full | full | full | full | full |
| Macklin Celebrini | S | 2024-25 | 2025-26 | 152 | — | active; GP through 2025-26 | full | full | full | full | full | full | full |

- **1917-18 floor**: full 48, part 0, none 0.
  - Full: Wayne Gretzky, Maurice Richard, Bobby Orr, Bobby Hull, Gordie Howe, Mario Lemieux, Steve Yzerman, Jacques Plante, Jaromír Jágr, Teemu Selänne, Ken Dryden, Phil Esposito, Martin Brodeur, Guy Lafleur, Patrick Roy, Jean Béliveau, Stan Mikita, Dominik Hašek, Doug Harvey, Terry Sawchuk, Brett Hull, Joe Sakic, Joe Thornton, Mark Messier, Jarome Iginla, Roberto Luongo, Nicklas Lidström, Grant Fuhr, Ray Bourque, Mike Bossy, Marcel Dionne, Paul Coffey, Bryan Trottier, Alexander Ovechkin, Sidney Crosby, Henrik Lundqvist, Evgeni Malkin, Patrick Kane, Steven Stamkos, Nathan MacKinnon, Connor McDavid, Connor Hellebuyck, Auston Matthews, Cale Makar, Quinn Hughes, Jack Hughes, Connor Bedard, Macklin Celebrini
  - Part: —
  - None: —
- **1967-68 floor**: full 38, part 9, none 1.
  - Full: Wayne Gretzky, Mario Lemieux, Steve Yzerman, Jaromír Jágr, Teemu Selänne, Ken Dryden, Martin Brodeur, Guy Lafleur, Patrick Roy, Dominik Hašek, Brett Hull, Joe Sakic, Joe Thornton, Mark Messier, Jarome Iginla, Roberto Luongo, Nicklas Lidström, Grant Fuhr, Ray Bourque, Mike Bossy, Marcel Dionne, Paul Coffey, Bryan Trottier, Alexander Ovechkin, Sidney Crosby, Henrik Lundqvist, Evgeni Malkin, Patrick Kane, Steven Stamkos, Nathan MacKinnon, Connor McDavid, Connor Hellebuyck, Auston Matthews, Cale Makar, Quinn Hughes, Jack Hughes, Connor Bedard, Macklin Celebrini
  - Part: Bobby Orr, Bobby Hull, Gordie Howe, Jacques Plante, Phil Esposito, Jean Béliveau, Stan Mikita, Doug Harvey, Terry Sawchuk
  - None: Maurice Richard
- **1987-88 floor**: full 24, part 12, none 12.
  - Full: Jaromír Jágr, Teemu Selänne, Martin Brodeur, Dominik Hašek, Joe Sakic, Joe Thornton, Jarome Iginla, Roberto Luongo, Nicklas Lidström, Alexander Ovechkin, Sidney Crosby, Henrik Lundqvist, Evgeni Malkin, Patrick Kane, Steven Stamkos, Nathan MacKinnon, Connor McDavid, Connor Hellebuyck, Auston Matthews, Cale Makar, Quinn Hughes, Jack Hughes, Connor Bedard, Macklin Celebrini
  - Part: Wayne Gretzky, Mario Lemieux, Steve Yzerman, Guy Lafleur, Patrick Roy, Brett Hull, Mark Messier, Grant Fuhr, Ray Bourque, Marcel Dionne, Paul Coffey, Bryan Trottier
  - None: Maurice Richard, Bobby Orr, Bobby Hull, Gordie Howe, Jacques Plante, Ken Dryden, Phil Esposito, Jean Béliveau, Stan Mikita, Doug Harvey, Terry Sawchuk, Mike Bossy
- **1997-98 floor**: full 17, part 16, none 15.
  - Full: Joe Thornton, Roberto Luongo, Alexander Ovechkin, Sidney Crosby, Henrik Lundqvist, Evgeni Malkin, Patrick Kane, Steven Stamkos, Nathan MacKinnon, Connor McDavid, Connor Hellebuyck, Auston Matthews, Cale Makar, Quinn Hughes, Jack Hughes, Connor Bedard, Macklin Celebrini
  - Part: Wayne Gretzky, Mario Lemieux, Steve Yzerman, Jaromír Jágr, Teemu Selänne, Martin Brodeur, Patrick Roy, Dominik Hašek, Brett Hull, Joe Sakic, Mark Messier, Jarome Iginla, Nicklas Lidström, Grant Fuhr, Ray Bourque, Paul Coffey
  - None: Maurice Richard, Bobby Orr, Bobby Hull, Gordie Howe, Jacques Plante, Ken Dryden, Phil Esposito, Guy Lafleur, Jean Béliveau, Stan Mikita, Doug Harvey, Terry Sawchuk, Mike Bossy, Marcel Dionne, Bryan Trottier
- **2005-06 floor**: full 15, part 12, none 21.
  - Full: Alexander Ovechkin, Sidney Crosby, Henrik Lundqvist, Evgeni Malkin, Patrick Kane, Steven Stamkos, Nathan MacKinnon, Connor McDavid, Connor Hellebuyck, Auston Matthews, Cale Makar, Quinn Hughes, Jack Hughes, Connor Bedard, Macklin Celebrini
  - Part: Mario Lemieux, Steve Yzerman, Jaromír Jágr, Teemu Selänne, Martin Brodeur, Dominik Hašek, Brett Hull, Joe Sakic, Joe Thornton, Jarome Iginla, Roberto Luongo, Nicklas Lidström
  - None: Wayne Gretzky, Maurice Richard, Bobby Orr, Bobby Hull, Gordie Howe, Jacques Plante, Ken Dryden, Phil Esposito, Guy Lafleur, Patrick Roy, Jean Béliveau, Stan Mikita, Doug Harvey, Terry Sawchuk, Mark Messier, Grant Fuhr, Ray Bourque, Mike Bossy, Marcel Dionne, Paul Coffey, Bryan Trottier
- **2007-08 floor**: full 11, part 13, none 24.
  - Full: Patrick Kane, Steven Stamkos, Nathan MacKinnon, Connor McDavid, Connor Hellebuyck, Auston Matthews, Cale Makar, Quinn Hughes, Jack Hughes, Connor Bedard, Macklin Celebrini
  - Part: Jaromír Jágr, Teemu Selänne, Martin Brodeur, Dominik Hašek, Joe Sakic, Joe Thornton, Jarome Iginla, Roberto Luongo, Nicklas Lidström, Alexander Ovechkin, Sidney Crosby, Henrik Lundqvist, Evgeni Malkin
  - None: Wayne Gretzky, Maurice Richard, Bobby Orr, Bobby Hull, Gordie Howe, Mario Lemieux, Steve Yzerman, Jacques Plante, Ken Dryden, Phil Esposito, Guy Lafleur, Patrick Roy, Jean Béliveau, Stan Mikita, Doug Harvey, Terry Sawchuk, Brett Hull, Mark Messier, Grant Fuhr, Ray Bourque, Mike Bossy, Marcel Dionne, Paul Coffey, Bryan Trottier
- **2010-11 floor**: full 9, part 13, none 26.
  - Full: Nathan MacKinnon, Connor McDavid, Connor Hellebuyck, Auston Matthews, Cale Makar, Quinn Hughes, Jack Hughes, Connor Bedard, Macklin Celebrini
  - Part: Jaromír Jágr, Teemu Selänne, Martin Brodeur, Joe Thornton, Jarome Iginla, Roberto Luongo, Nicklas Lidström, Alexander Ovechkin, Sidney Crosby, Henrik Lundqvist, Evgeni Malkin, Patrick Kane, Steven Stamkos
  - None: Wayne Gretzky, Maurice Richard, Bobby Orr, Bobby Hull, Gordie Howe, Mario Lemieux, Steve Yzerman, Jacques Plante, Ken Dryden, Phil Esposito, Guy Lafleur, Patrick Roy, Jean Béliveau, Stan Mikita, Dominik Hašek, Doug Harvey, Terry Sawchuk, Brett Hull, Joe Sakic, Mark Messier, Grant Fuhr, Ray Bourque, Mike Bossy, Marcel Dionne, Paul Coffey, Bryan Trottier

### Reading the floors

- **1917-18** covers all 48 in full, for G/A/PTS/PIM only. It is the only floor that holds Richard, Howe, Orr, Harvey, Béliveau, Hull, Plante and Sawchuk whole.
- **1967-68** (+/-, skater shots): 38 full. It splits nine Original Six-era careers (Howe, Bobby Hull, Orr, Esposito, Béliveau, Mikita, Harvey, Plante, Sawchuk) and drops Richard entirely.
- **1987-88**: half the list. It cuts Gretzky, Lemieux, Messier, Bourque, Coffey, Yzerman, Roy and Fuhr mid-career, and loses all of the 1970s.
- **1997-98** (TOI): 17 full, the modern players plus Thornton and Luongo. Gretzky, Lemieux, Jagr, Sakic, Lidström, Hasek, Brodeur and Roy are cut.
- **2005-06** (shootout, RTSS): Ovechkin and Crosby are complete. That is the earliest floor where "the Ovechkin/Crosby generation" is whole.
- **2007-08** (MoneyPuck shots): Ovechkin, Crosby, Malkin and Lundqvist become partial.
- **2010-11** (sportsdataverse): only nine of 48 are complete (MacKinnon onward plus Hellebuyck). Every career-record conversation (Gretzky's 894, Ovechkin's chase) sits outside it.

Product reading: a career-point engine that can't show Gretzky, Howe and Ovechkin whole isn't the sibling of the NFL and WNBA sites. G/A/PTS from 1917-18 is the only floor that covers the factoids. Every other stat needs its own era bound in the sentence ("+/- since 1967-68", "TOI since 1997-98").

## Rejections (commonly believed, wrong or stale)

1. "No assists were given in the NHL's first season." HR shows 1917-18 assists (four players with 10).
2. "+/- has been official since 1959-60." It was counted from 1967; 1959-on figures are a later NHL compilation.
3. "The Jets' 1972-96 records went to Winnipeg" (Wikipedia). The NHL release says 1979-96; WHA years are excluded.
4. "Arizona/Utah carries the Jets 1.0 history." Since 2026-09-24, ARI covers 1996-2024 only; Utah has none.
5. "Utah is the relocated Coyotes." It is a new franchise; the Coyotes are inactive.
6. "Wikidata P3567 is the HR id." It is HHOF; HR is P3598.
7. "HR TOI starts 1998-99." It starts 1997-98 since Sept 2023.
8. "Hits, blocks and takeaways didn't exist before 2005-06." RTSS distributed them around 2000-02 and then scrubbed them.
9. "An NHL season is 82 games." 84 in 1992-94 and from 2026-27; plus the lockout and COVID seasons.
10. "The 1918-19 NHL final was cancelled by flu." The Stanley Cup Final vs Seattle was cancelled; the NHL final was played.
11. "The Wanderers went 1-5 in six games." They played four; two defaults count as losses.

## Unverified (see return.json for what I tried)

PP/SH goal floor; faceoffs 1997-98; hits etc. public from 2005-06; empty-net and GS floors; 4-on-4 OT 1999-2000; no doubleheaders; GP for a dressed skater with no shift; 1919-20 GP quirks; 2026-27 activity of Ovechkin, Crosby, Malkin, Kane and Stamkos; Wikipedia's claim that 2019-20 was the first unequal-GP season without a fold.
