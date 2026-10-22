# Brief: the league's and broadcasters' APIs, probed, and their terms (slice `league-apis`)

Read `research/briefs/_shared.md` first. Report: `research/data-sources-apis.md`. Return: `research/league-apis/return.json`. Request budget through the helper: **450** (NHL api-web ≤ 250, NHL stats REST ≤ 60, ESPN ≤ 120, records.nhl.com ≤ 20). Set `GAP_MS=1500`. One process per host. Save every page you quote under `research/league-apis/pages/`.

## The question

If the ledger were compiled from a live API, how far back does each one reach *per stat*, what does a full compile cost in requests, and what do the terms say, verbatim? This brief produces the floors table and the terms quotes that `research/beachhead.md` will be decided on. It does not harvest.

## Part 1: NHL api-web (`https://api-web.nhle.com/v1/`)

Stratified sample of seasons: 1917-18, 1926-27, 1933-34, 1942-43, 1950-51, 1959-60, 1967-68, 1972-73, 1979-80, 1987-88, 1997-98, 2005-06, 2010-11, 2017-18, 2024-25. For each season, fetch **one** regular-season boxscore (`gamecenter/{gameId}/boxscore`; ids are `{season4}{02}{gameNo4}`, e.g. `1981020001`), **one** playoff boxscore (`{season4}03xxxx`; work out the id pattern from `club-schedule-season` or `schedule/{date}`), one skater game-log (`player/{id}/game-log/{season8}/2` and `/3` for playoffs) and one goalie game-log. Record, per season, which fields are populated vs always 0 or null: goals, assists, points, PIM, +/-, shots, TOI, PP goals, SH goals, GWG, hits, blocks, giveaways, takeaways, faceoffs, shifts; for goalies: decision (W/L/OTL/T), saves, shots against, GA, TOI, starter flag (`starter: true`?), shutout. Use a per-season table. Also record whether the boxscore lists every dressed player (the appearance unit), whether scratches appear, and whether a player with 0 TOI appears.

Known answers to verify the floors against (quote the API value next to the published one): Gretzky's 50th goal of 1981-82 came in Edmonton's 39th game, 1981-12-30 vs Philadelphia, five goals that night; Maurice Richard's 50th in 1944-45 came in the 50th and last game, 1945-03-18 at Boston; Lemieux's 1988-89 50th came in his 44th game played, Pittsburgh's 46th; Howe's 1952-53 was 49 goals and 95 points in 70 games; Orr's 1970-71 +124; Brodeur's 691st win (2015-ish final total) and his 2006-07 48 wins; McDavid's 1,000th point in his 659th game (2025-03-?); Ovechkin's 895th goal 2025-04-06 at NYI (his 1,487th game). If an answer you're given looks wrong, say so; briefs have been wrong before.

Enumeration cost: how to list every game of a season (`schedule/{YYYY-MM-DD}` walks a week at a time? `club-schedule-season/{team}/{season}` per team? a `season` endpoint?), every player who played (`api.nhle.com/stats/rest/en/skater/summary?limit=-1&cayenneExp=seasonId=...` and `goalie/summary`), and estimate requests for a full compile 1917–2026 by the two routes (per game boxscores: ~60,000 regular + ~6,000 playoff games; per player game-logs: ~8,000 players × seasons). Note rate limits or blocks you hit (none expected; say so if none).

Game types: confirm gameType 1 preseason, 2 regular, 3 playoffs; whether the 2019-20 qualifying round is type 3; whether All-Star games appear anywhere; whether 1917-18's games exist as 1917020001… and how many; whether neutral-site games (1992-94) carry a venue.

## Part 2: NHL stats REST (`https://api.nhle.com/stats/rest/en/`)

Does it serve **per-game rows in bulk**? Try `skater/summary?isAggregate=false&isGame=true&limit=100&cayenneExp=seasonId=19811982` (and `gameTypeId=2`), `goalie/summary` likewise, `skater/realtime`, `skater/timeonice`, `team/summary?isGame=true`. If a season of player-game rows comes back in a few paged requests, that changes the compile cost by two orders of magnitude; measure page size, `total`, and the earliest season that returns game rows for each report (sample 1917-18, 1950-51, 1979-80, 1997-98, 2005-06, 2010-11). Also `https://records.nhl.com/site/api/` (franchise, record-detail, milestone endpoints): what it has and whether it carries "fastest to" records with the league's own definitions.

## Part 3: ESPN NHL (`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/`)

The WNBA site's data is ESPN's (through sportsdataverse) and the football comparator compiles ESPN directly, so ESPN is the precedent route. Find the **earliest season with box scores**: `scoreboard?dates=YYYYMMDD` for a mid-season date in 1995, 1998, 2001, 2003, 2005, 2008, 2012, 2020, 2025, then `summary?event={id}` for one game each; record whether `boxscore.players` has skater and goalie lines (G, A, +/-, SOG, PIM, TOI, hits, blocks; goalie SA/SV/GA/decision), whether the roster lists scratches, and the athlete id. Also probe `scoreboard?dates=YYYY&limit=1000` (a whole year in one call, as soccer allows) and `sports.core.api.espn.com/v2/sports/hockey/leagues/nhl/seasons/{Y}/athletes/{id}/eventlog` and `.../statistics` for one star per decade (Gretzky, Jagr, Crosby). Playoffs: is there a `seasontype=3`? Record coverage holes.

## Part 4: terms, verbatim

Fetch and quote (save the page): NHL.com Terms of Service (the clauses on scraping, automated means, databases, and any "personal, non-commercial" clause; note the URL and date); any terms on `api-web.nhle.com` or `api.nhle.com` responses or docs (there are none that I know of; confirm); NHL Edge / NHL "data" pages; Disney/ESPN Terms of Use (the automated-extraction and non-personal-use clauses). Then a short, factual section on **precedent**: which public sites and open projects visibly build on the NHL API (MoneyPuck says its data is from the NHL; Natural Stat Trick; hockeyR; the Kaggle dump; fastRhockey/sportsdataverse itself, which republishes NHL-API pulls under CC BY/MIT), whether any has been blocked or asked to stop (search; [S] is fine), and whether the API has ever required a key. This is for Drew's decision, not a legal opinion; state facts, quote text, and mark anything you only recall.

## Return

Rows are **endpoint findings**: `{ api, endpoint, season, field_floors: {...}, appearance_unit: "...", request_cost: "...", receipts: [...] }`, and **terms findings**: `{ site, url, clause: "<verbatim>", retrieved }`. The report has: a per-stat floors table for NHL api-web (stat × first season populated), the enumeration routes with request counts, the stats-REST bulk-rows finding, the ESPN floors table, the terms quotes, the precedent list, and a closing paragraph on what "as far back as we can" means for each route (1917 via NHL api-web; ESPN from YYYY; open files 2010).
