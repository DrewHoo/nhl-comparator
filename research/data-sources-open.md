# Open datasets and community projects (slice `open-datasets`, 2026-10-21)

Structured return: `research/open-datasets/return.json`. Saved page text for every quote: `research/open-datasets/pages/<sha1(url)>.txt`. Spot checks are recomputed from the `data/raw` cache by `research/open-datasets/scratch/spotchecks.py` (output in `spotchecks.out.json`); the receipt quotes in return.json are string-checked by `scratch/build_return.py` (0 missing). I made about 117 helper requests out of 150. The 16 Chadwick register shards were the biggest single cost.

Tags: [V] verified today against the page, file or API, [R] recalled, [S] search snippet only.

## The answer in five lines

1. **There is an open, maintained per-game player file from 2009-10** (sportsdataverse `nhl_skater_boxscores` / `nhl_goalie_boxscores`, MIT, NHL API lineage) [V]. Watch out: `player_box` and `team_box` have no game key, and their 2018 file is a copy of 2019, so 2017-18 is missing from them [V].
2. **MoneyPuck reaches one season further, to 2008-09,** but only for non-commercial use, with credit [V].
3. **The only Retrosheet-like source is the Hockey Summary Project (HSP).** It has game summaries 1917-18 to 2016-17, with gaps, under terms that explicitly allow commercial use with an attribution line. But it is not downloadable today: there's a POST-only web form, and the Yahoo group files are gone. It also has no dressed rosters outside 1993-95 [V].
4. **For season totals, the floor is 1917-18 (1909-10 counting the NHA).** That's the Hockey Databank, under the same free-commercial-with-attribution terms. The public mirror runs through 2017-18, and the group (now on groups.io) posted a 2024 file [V].
5. **The lineage hypothesis is only partly true.** Before 1987 there are two independent lineages: the NHL's own league-office archive (digitized 2017, served by the API) and HSP. Hockey-Reference is not just HSP downstream [V].

## Sources

### 1. sportsdataverse-data `nhl_*` (producer `fastRhockey-nhl-data`, raw `fastRhockey-nhl-raw`)

- **Tags [V].** I listed all 382 releases. There are 23 NHL/hockey tags: `nhl_groups`, `espn_nhl_injuries`, `nhl_xg_models`, plus 20 game-level tags (`nhl_skater_boxscores`, `nhl_goalie_boxscores`, `nhl_player_boxscores`, `nhl_team_boxscores`, `nhl_schedules`, `nhl_rosters`, `nhl_game_rosters`, `nhl_game_info`, `nhl_pbp_full`, `nhl_pbp_lite`, `nhl_shifts`, `nhl_scratches`, `nhl_scoring`, `nhl_penalties`, `nhl_linescore`, `nhl_three_stars`, `nhl_officials`, `nhl_shots_by_period`, `nhl_shootout`). The only `espn_nhl_*` tag is `espn_nhl_injuries` (2026, 2027), so there are no ESPN NHL box scores.
- **Span [V].** Asset years run 2010–2027, and the year in a file name is the season's end year. `player_box_2010.csv` is 2009-10, and `nhl_schedule_master.csv` starts on 2009-10-01 with 22,002 games. **The floor is 2009-10**, not 2010-11. The 2026-27 files were updated 2026-10-21, so the producer is live in season. This corrects the "Apr–May 2026" note in the shared context. One inconsistency: the per-season schedule files label the season by its start year (`nhl_schedule_2011.csv` has `season=2010, season_full=20102011`), while the master file uses the end year.
- **Grain and columns [V].**
  - `skater_box` columns: `home_away, team_id, team_abbrev, player_id, player_name, sweater_number, position, goals, assists, points, plus_minus, pim, hits, power_play_goals, shots_on_goal, faceoff_winning_pctg, toi, blocked_shots, shifts, giveaways, takeaways, game_id, season, game_date`.
  - `goalie_box` has the same identity columns plus the saves fields, `starter` (true/false) and `decision`.
  - Rows per team-game in 2010-11 run 15–18 skaters plus 2 goalies, so the files include every dressed player, and backups appear with 0 TOI. Luongo has 107 rows but 84 starts in 2010-11.
  - Regular season and playoffs sit in the same file; the type is in the `game_id` digits.
  - `rosters` has id, name, position, number and season. `game_rosters` adds game_id, date and shoots_catches. **No DOB anywhere.** The only starter flag is for goalies.
- **Defects [V].**
  - `player_box_2018.csv` and `player_box_2019.csv` are byte-identical and both hold 2018-19 (McDavid: 78 rows, 41 G, 116 P). The same is true of `team_box_2018/2019`. **2017-18 is missing from `player_box` and `team_box`**, but `skater_box_2018` is correct (McDavid: 82 rows, 41 G, 108 P).
  - `player_box` and `team_box` have **no `game_id`, season or date column**.
  - In `nhl_schedule_2011.csv`, every 2010-11 playoff game has venue "Honda Center".
  - Use `skater_box` + `goalie_box` + `schedule_master`.
- **Spot checks [V], against official totals [R]:**
  - Crosby 2009-10 in `player_box_2010`: 94 rows, 57 G, 128 P (81+13 GP, 51+6 G, 109+19 P).
  - Ovechkin 2010-11 in `skater_box_2011`: 88 rows, 37 G, 95 P.
  - McDavid 2017-18 in `skater_box_2018`: 82 rows, 41 G, 108 P.
- **License lineage [V].**
  - `fastRhockey-nhl-data/LICENSE.md` is MIT ("Copyright (c) 2026 fastRhockey.nhl.data authors"), but GitHub's detector reports it as `Other/NOASSERTION`.
  - The `sportsdataverse-data` repo LICENSE is MIT. Its README carries a "CC BY 4.0" badge.
  - `fastRhockey-nhl-raw` has no LICENSE (404). Its README says "Raw NHL game JSON data scraped from the NHL API".
  - So: NHL API → raw JSON (no license) → processed release (MIT on the code repo, CC BY badge on the store). Either license is the compiler's claim over NHL data, the same posture as the WNBA site's ESPN-via-sportsdataverse spine.
- **`nhl_groups` [V].** Division membership by season, 1918–2027, updated 2026-10-12, with lineage notes in the file.
- **sdv-reference-data / NHL player crosswalk.** I found no NHL crosswalk tag among the releases. There are `nba_crosswalk`, `wnba_crosswalk` and others, but no `nhl_crosswalk` [V].

### 2. Hockey Summary Project (`hsp.flyershistory.com`)

- **What it is [V].** A volunteer project started January 10, 2001 ("By researchers. For researchers."). Sports Reference's data-use page lists it next to Retrosheet and Lahman as "Game level accounts of hockey seasons." [V]
- **Terms, verbatim [V].** "The Hockey Summary Project allows for free usage of its data including the production of a commercial product based upon the data, subject to the terms outlined below." There are two conditions:
  1. Display "prominently and in its entirety" the statement "The information used herein was obtained free of charge from and is copyrighted by The Hockey Summary Project. For more information about the Hockey Summary Project please visit: http://hsp.flyershistory.com or http://sports.groups.yahoo.com/group/hockey_summary_project/".
  2. A no-accuracy-guarantee clause.
- **Span [V], from the inventory page.**
  - Complete: 1917-18 to 1926-27, 1929-30, 1938-39, 1942-43, 1952-53 to 1987-88, 1989-90, 1990-91, and 1992-93 to 2016-17.
  - Missing: 1927-28, 1928-29, 1931-38, 1939-42, 1943-52.
  - Partial: 1930-31 (Philadelphia Quakers games only), 1988-89 and 1991-92 (Flyers games only).
  - The last changelog entry is June 18, 2017 (2016-17 playoffs added), so the project is **unmaintained**.
- **Grain.** Game summaries: score, scoring plays, penalties, shots, goalies [S, from HSP-credited mirror pages; I could not render one]. The changelog says "Game rosters added for 1993-94 and 1994-95". So **who dressed is not recorded for other seasons** [V that the line exists; inference that rosters are absent elsewhere]. That makes it a team-game and scoring-event source, not a games-played source.
- **Distribution [V].** A POST-only CGI form, one team-season per request (`hspgames.cgi`; GET returns the empty form). The home page points to the Yahoo group's "Files" section, but Yahoo Groups is gone [R], and I found no groups.io successor (`groups.io/g/hockey_summary_project` returns 404) [V]. No membership is needed to view, but no bulk files are available today.
- **Lineage [V].** Hockey-Reference's sources page credits HSP for "Some game scores and many sweater numbers", and Dan Diamond and Associates (licensed) for "much of the data". The Hockey Databank lists HSP as a source.

### 3. Hockey Databank (Lahman-style)

- **Home [V].** Originally the Yahoo group `hockey-databank`. It is now `groups.io/g/hockey-databank`: 98 members, recent topics "season 2025-2026" and "Change in 2023-24 release", and a "File /hdb-2024-08-19.zip uploaded". The files are behind a login. Public copies:
  - GitHub `rippinrobr/hockey-databank`, v13.0 dated July 10, 2018, covering through 2017-18 (last push 2019-02).
  - Kaggle `open-source-sports/professional-hockey-database` (v1, 2019).
  - A CTU relational mirror through 2011-12.
- **Terms, verbatim [V].** "The Hockey Databank project allows for free usage of its data, including the production of a commercial product based upon the data, subject to the terms outlined below." The terms require the attribution statement "...obtained free of charge from and is copyrighted by the Hockey Databank project..." plus a no-warranty clause.
- **Span and leagues [V].** Scoring has `lgID` NHA 1909–1916, NHL 1917–2017, PCHA 1911–1923, WCHL 1921–1925 and WHA 1972–1978 as separate leagues ("year" = start year). There are **no per-game rows**. The tables are Scoring/Goalies (regular season plus Post* columns), Teams, TeamVsTeam, SeriesPost and others. Master has 8,670 people, 8,543 with full DOB, 8,355 with `hrefID`, and also `ihdbID` and `legendsID`. There is **no NHL.com id**.
- **Spot checks [V]:**
  - Howe NHL: 1767 GP, 801 G, 1850 Pts, with WHA rows separate (419 GP, 174 G).
  - Richard: 978 GP, 544 G, 966 Pts.
  - Gretzky: 1487 GP, 894 G, 2857 Pts.
  - Malone 1917-18: MTL, 20 GP, 44 G, 4 A.
- **Lineage [V], README 1.1.** NHL Guides and Record Books, Total Hockey, Hockey-Reference, HSP, hockeydb, SIHR, NHL.com and others, plus corrections confirmed by Ralph Dinger of Dan Diamond and Associates.

### 4. Kaggle

- **"NHL Game Data" (Martin Ellis) [V].**
  - License field: "Other (specified in description)". The description specifies no license.
  - lastUpdated 2020-12-11, which makes it stale.
  - Files include `game_skater_stats.csv` (71.5 MB) and `game_goalie_stats.csv`.
  - Lineage: the old NHL stats API, per its acknowledgement.
  - Span: about 2000-01 to 2019-20 [R]. The description still says "the past 6 years". I couldn't download it without a login.
- **Other Kaggle NHL datasets [V]:**
  - `kapastor/nhl-data`: CC0, events 2015–2019.
  - `s903124/nhl-playbyplay-data-from-2007`: play-by-play 2007+ via hockey_scraper, LGPL tag.
  - `mattop` draft and playoff tables: CC0, season grain.
  - None reaches before 2007 at player-game grain.
- **How defensible a compiler's license is:** a CC0 or "Other" label over an NHL API pull is the compiler's claim. It gives no more cover than self-compiling, and here there isn't even a claim.

### 5. MoneyPuck

- **Terms, verbatim [V].** "The data below is free to use for non-commercial purposes and by journalists for ad-hoc use. Please clearly credit MoneyPuck.com in all cases where you are showing anything using our data as an input. For other purposes please inquire by messaging..." and "Non-approved scraping of the MoneyPuck website will be blocked."
- **Files [V]:**
  - Season summaries 2008-09 to 2026-27 (skaters/goalies/lines/teams, "regular" paths).
  - Game-by-game per season, 2008–2026 zips, and per player (`careers/gameByGame/regular/skaters/<id>.csv`).
  - `all_teams.csv` game-level.
  - Shots 2007-08 to 2025-26 (2,079,359 shots).
  - `allPlayersLookup.csv`, "List of all NHL players from 2007 onwards with birthdate".
- **Playoffs:** I saw no playoff game-file links (unverified).

### 6. Natural Stat Trick, Evolving-Hockey, QuantHockey, hockeydb, Elite Prospects, NHL Edge

- **Natural Stat Trick [V].** Bots are allowed only on `data.naturalstattrick.com` with an access key, at "80 page loads in 5 minutes, and 180 page loads in 1 hour". There are no bulk files, and it is a mirror of the HTML site.
- **Evolving-Hockey [V].** "You agree you will not use... any bot, spider, or other automatic method or means, nor any manual processes to copy any part of this Site." Data is "only for your personal use". It is paid.
- **hockeydb [V].** "Access to hockeydb.com by a web crawler or 'bot with the purpose of capturing the content is expressly prohibited." It also names "releasing the data into the 'public domain'" as an example of competing use.
- **QuantHockey and Elite Prospects [V].** Both returned 403 to the helper. Elite Prospects sells an API [R].
- **NHL Edge.** NHL.com terms, tracking era only [R].

### 7. Community code and data (hockeyR, fastRhockey, nhlscraper, Hockey-Scraper, API docs)

- **hockeyR-data [V].** Play-by-play 2010-11 to 2023-24, no license, last push 2024-06-25.
- **Hockey-Scraper (Shomer) [V].** GPL-3.0 code, no data release (the Kaggle copy covers 2007+).
- **nhlscraper [V].** GPL ≥ 3, CRAN 0.7.0 (2026-06-28), wrapping NHL and ESPN APIs. Code only.
- **API docs [V].** Zmalski/NHL-API-Reference describes itself as an "unofficial reference". The dword4/nhlapi responses quote the NHL copyright string. Neither documents terms or rate limits.
- **NHL_DB (Hugging Face `RentoSaijo/NHL_DB`, the nhlscraper author) [V].** This is the find of the sweep. It has per-season parquet for **game rosters 1917-18 to 2026-27** and **raw GameCenter and WSC play-by-play 1917-18 to 2026-27** (109 files each). Cleaned play-by-play and shift charts start in 2010-11.
  - It updates daily: a GitHub Action cron, lastModified 2026-10-21.
  - It has no license tag, no card and no README.
  - Lineage: `nhlscraper::game_roster` and `gc_play_by_play_raw`, so the NHL API.
  - I could not read the contents: the helper caches text, which corrupts binary parquet, and no parquet reader is installed. I logged it under `unverified` and `leads`.

### 8. SIHR

Members-only player database with season totals across many leagues [S + V that there is a membership gate]. I saw no game data, and no public terms were found. The membership page returned 404 [V].

### 9. Wikipedia / Wikidata / Chadwick

- **Wikidata [V], via SPARQL:**
  - 14,040 items carry P3522 (NHL.com player ID).
  - 14,012 of them have a DOB (P569), and 12,496 have team stints (P54).
  - 8,828 items carry P3598 (Hockey-Reference id), and 8,523 have both.
  - That makes it the join between the Hockey Databank (`hrefID`) and NHL API ids. CC0 [R].
- **Wikipedia per-game logs:** I expect none; the career tables are CC BY-SA [R, not checked].
- **Chadwick register [V].** `key_sr_nhl` is filled on **9 of 526,894 rows**, all baseball people who also played hockey. It is useless as an NHL crosswalk.

### 10. GitHub and Hugging Face sweep

- **GitHub repo search** ("hockey databank", "nhl boxscores", "nhl game logs", "nhl stats api dump", "hockey summary project") found no pre-2010 box-score dumps except the Databank mirror [V]. Three further queries hit the search API's 403 rate limit.
- **Hugging Face "nhl"/"hockey"** found NHL_DB (1917+). The rest are 2010+ or betting data.
- **Also found:**
  - The FRDR SFU "Computational Logic Lab NHL Data": play-by-play 2001–2014, CC BY-NC-ND 4.0, so the license forbids derivatives.
  - CRAN `NHLData`: CC0, team-game scores 1917+, "Source www.hockey-reference.com", 2017. A CC0 label over Sports Reference data.

### 11. Anything Retrosheet-like

HSP (game level) and the Hockey Databank (season level) are the hockey analogues of Retrosheet and Lahman: volunteer projects with explicit free-use terms that permit commercial use with an attribution line. Two differences from Retrosheet:

- HSP has no current bulk-download channel and no rosters, so it can't count games played.
- The Databank's newest files sit behind a group login.

## Lineage (the hypothesis)

*Hypothesis: every per-game source before 2007-08 descends from the NHL API or from Hockey-Reference (← HSP).* **Partly rejected.**

- **Two independent pre-1987 lineages exist [V].**
  1. The NHL league-office archive. The NHL "digitized its statistics archive. Everything back to 1917", in a process that "took six years", adding "more than 24,000 games from 1917 through 1987" (NHL.com via infoDOCKET, 2017-09-28). That's what api-web.nhle.com serves, and NHL_DB is a pull of it.
  2. HSP, a volunteer compilation since 2001.
- **Hockey-Reference is a blend, not HSP downstream [V].** "Dan Diamond and Associates licensed much of the data used to create this site", HSP supplies "Some game scores and many sweater numbers", and current seasons use "Official NHL data". Its player game logs reportedly begin 1987-88 [R], which matches NHL.com's own pre-2017 floor [V, same article], so it has no pre-1987 player-game rows to compare.
- **The hypothesis holds for 1987-88 to 2009-10:** every third-party per-game file found (Kaggle Ellis, s903124, SFU, MoneyPuck 2008+, hockeyR) is an NHL API or NHL report pull. It also holds for `NHLData` (HR).
- **So "two sources agreeing":**
  - NHL API vs HSP before 1987 is a genuine independent check, at least at team-game and scoring-event grain.
  - Any two 1987+ third-party files agreeing is one source twice.
  - The Databank cross-checks season totals, but it lists HR, HSP and NHL guides as inputs, so it isn't independent of them.

## Feasibility table

| Source | Span | Grain | License | Hosted | Ledger can start |
|---|---|---|---|---|---|
| sportsdataverse `nhl_skater/goalie_boxscores` | 2009-10 → 2026-27 (live) | player-game (+ team-game, schedule, rosters, pbp) | MIT (producer and store); CC BY 4.0 badge; raw JSON unlicensed; NHL API upstream | GitHub Releases | **2009-10** player-game (avoid `player_box`/`team_box`: no game_id, 2017-18 missing) |
| MoneyPuck | 2008-09 → live (shots 2007-08) | player-game (regular), player-season, shots, bios | non-commercial, credit required; scraping blocked without approval | moneypuck.com | **2008-09** (non-commercial) |
| Kaggle NHL Game Data (Ellis) | ~2000-01 → 2019-20 [R] | player-game, team-game, pbp | "Other" with none specified | Kaggle (login) | ~2000-01 [R], stale, unlicensed |
| NHL_DB (HF, RentoSaijo) | 1917-18 → live | game rosters, raw pbp (box stats derivable, unverified) | none stated; NHL API upstream | Hugging Face | 1917-18 *if* contents check out; same terms problem as self-compiling |
| Self-compiled NHL API | 1917-18 → live | player-game | NHL.com terms forbid compiling | n/a | 1917-18 (terms say no) |
| Hockey Summary Project | 1917-18 → 2016-17, gaps (1927-29, 1930-38, 1939-42, 1943-52, 1988-89, 1991-92) | game summaries (team-game, scoring events); rosters only 1993-95 | free incl. commercial, mandatory attribution | web form only (POST); Yahoo files gone | **team-game 1952-53** (unbroken to 1987-88); no player games-played |
| Hockey Databank | 1909-10 (NHA) / 1917-18 (NHL) → 2017-18 public, 2023-24 in group | player-season, team-season | free incl. commercial, mandatory attribution | GitHub mirror, groups.io (login), Kaggle | **seasons sequence 1917-18** (with WHA separate) |
| NHLData (CRAN) | 1917-18 → ~2016 | team-game scores | CC0 over Hockey-Reference data | CRAN | team-game 1917-18, but SR lineage |
| hockeyR-data | 2010-11 → 2023-24 | pbp | none | GitHub | 2010-11, stale |
| SFU CLL (FRDR) | 2001 → 2014 | pbp | CC BY-NC-ND 4.0 | FRDR | no (no derivatives) |
| Wikidata | all | person crosswalk, DOB | CC0 [R] | SPARQL | n/a (join key) |
| Hockey-Reference / hockeydb / Evolving / NST | various | various | forbid, paid or keyed | n/a | no |

## Defensibility ranking of routes to a pre-2010 ledger

1. **Volunteer project with explicit free-use terms that allow commercial use.**
   - The Hockey Databank for the seasons sequence (1917-18; public file through 2017-18; join to NHL ids via Wikidata).
   - HSP for team-game and scoring events (1917-2017 with gaps).
   - This is the Retrosheet tier. Its weak points: HSP must be obtained from the maintainer, since the only open channel is a POST form on a volunteer site and walking it would be a crawl. HSP also has no who-dressed data, so it can't index "through N games" for players.
2. **An open-licensed third-party release of a league API pull (the compiler's claim):** sportsdataverse, MIT/CC BY. This is the sibling-site precedent, but it only reaches 2009-10.
3. **First-party non-commercial permission:** MoneyPuck, 2008-09. The permission is explicit, but Ko-fi donations may make the site not "non-commercial". A written OK would settle it.
4. **An unlicensed or CC0 compiler dump of the league API:** NHL_DB (1917+), Kaggle Ellis (~2000+), hockeyR-data. The compiler's claim adds nothing, because there's no claim to add.
5. **Self-compiled from the league API.** The terms say no. It's keyless, and nobody has been blocked.
6. **A CC0 label over Sports Reference data (NHLData), or Sports Reference / hockeydb directly.** Forbidden.

In this order, a defensible pre-2010 player ledger currently exists only at season grain (Databank). Player-game rows before 2009-10 exist only on the NHL API lineage (ranks 3–5), and before 2008-09 only at ranks 4–5.

## Leads (out of scope here)

1. **HSP bulk files and terms confirmation** from the maintainer (Peter Anson, flyershistory.com). This is the only independent per-game lineage before 1987, and the cross-check gate against the NHL API.
2. **The Hockey Databank groups.io file `hdb-2024-08-19.zip`.** Season totals through 2023-24 under free-commercial terms. Getting it requires joining, which is Drew's decision.
3. **NHL_DB parquet.** Read `NHL_ROSTERS_19171918` and `NHL_PBPS_GC_Raw_*` with a binary-safe fetch to confirm 1917+ who-dressed rows, and ask the author for a license.
4. **For the league-apis slice:** compare NHL API vs HSP on a few 1950s games.
5. **MoneyPuck approval email** for a donation-supported site.
