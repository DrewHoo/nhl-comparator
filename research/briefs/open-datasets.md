# Brief: open datasets and community projects (slice `open-datasets`)

Read `research/briefs/_shared.md` first. Report: `research/data-sources-open.md`. Return: `research/open-datasets/return.json`. Request budget through the helper: 150 (release listings, raw files, license files). WebFetch/WebSearch unlimited within reason.

## The question

Which **third-party, downloadable** NHL datasets carry per-game player rows (or per-game team rows, or season totals) and from what season, under what license, and are they maintained? The sibling sites are built on exactly this kind of release (nflverse, sportsdataverse). The goal is the earliest season a ledger can start without crawling the league. Season-total datasets matter too: the engine has a "seasons" sequence, so a licensed season-level file back to 1917 would let "through first N seasons" boards reach Howe and Richard even if per-game rows stop later.

## Sources to check (and anything else you find)

1. **sportsdataverse-data** (`https://github.com/sportsdataverse/sportsdataverse-data/releases`): list every NHL tag and asset; confirm the 2010 floor by listing assets, not by the README; check whether any `espn_nhl_*` tags exist; download one early file per grain (2011 player box, schedule, roster) and record the columns, row counts, whether a starter flag or DOB exists, whether the game rows include every dressed player. Settle the license lineage: `fastRhockey-nhl-data` LICENSE.md (MIT) vs the umbrella README's CC BY badge, and what the file's upstream is (NHL API). Also check `sdv-reference-data` for `nhl_groups` span and any NHL player crosswalk.
2. **Hockey Summary Project** (what Sports Reference points students to): what it is, where its data lives, what span and grain (game summaries 1917+?), how it's distributed (a Yahoo/Groups.io group? downloadable files? a request to the maintainers?), what license or terms it states, and whether Hockey-Reference's pre-1987 game data descends from it (lineage). Quote the terms verbatim. If membership is required, say what joining involves; do not join.
3. **Hockey Databank / Open Source Sports hockey database** (the Lahman-style NHL database: season totals 1909–?, with Master/Scoring/Goalies/Teams tables): current home, last update, span, license verbatim, whether per-game rows exist (they don't, I expect; confirm), and whether it includes WHA and pre-NHL leagues as separate `lgID`.
4. **Kaggle**: "NHL Game Data" (Martin Ellis, ~2000-2020, from the NHL API): the license field, the span and grain (game_skater_stats, game_goalie_stats), last update; any other Kaggle NHL per-game datasets (search). Note that a CC0 claim over an NHL-API pull is the compiler's claim, like transfermarkt-datasets; rank its defensibility.
5. **MoneyPuck** (`moneypuck.com/data.htm`): quote the terms verbatim, record the file list, span per file (skaters game-by-game 2008?), whether playoffs are separate files, and the bios file.
6. **Natural Stat Trick, Evolving-Hockey, QuantHockey, hockeydb.com, Elite Prospects, NHL Edge**: terms verbatim, span, whether bulk download exists. Expected: all forbid, or paywalled; confirm quickly and move on.
7. **hockeyR / hockeyR-data, fastRhockey, nhlscrapr / nhlscraper (Python), the `nhl-api` community docs (Zmalski/NHL-API-Reference, dword4/nhlapi)**: what spans they cover, what they publish as data (not code), and what they say about the API's terms and rate limits.
8. **Society for International Hockey Research (SIHR)** database: span, access (members only?), terms.
9. **Wikipedia / Wikidata**: do per-player per-game logs exist anywhere on Wikipedia? (I expect no; season-by-season career tables yes, CC BY-SA.) Wikidata: P3522 coverage (how many NHL players carry an NHL.com id; a SPARQL count through the helper is fine), P54 team stints, DOB coverage. The Chadwick register's `key_sr_nhl` column: how many rows filled.
10. **GitHub and Hugging Face**: search for repos or datasets that have already dumped NHL box scores or game logs before 2010 (search terms: "nhl boxscores 1990", "nhl game logs dataset", "nhl play-by-play 2007 csv", "hockey summary project csv", "nhl stats api dump"). For each hit: span, grain, source lineage, license, last commit. Expected base rate: most are NHL-API pulls from 2007+ with no license.
11. **Anything Retrosheet-like for hockey**: a volunteer project with explicit free-use terms. If none exists, say so.

## Hypothesis to test (marked as one)

We suspect every per-game source before 2007-08 descends from either the NHL API or Hockey-Reference (which itself descends from the Hockey Summary Project), so that "two sources agreeing" would be one source twice. Trace the lineage of each source and say which.

## Return

Rows are **sources**, not facts: `{ name, url, span_first, span_last, grain: "player-game|team-game|player-season|...", ids, license: "<verbatim or 'none stated'>", license_url, hosting, maintained: "...", keyless: true|false, lineage: "...", three_spot_checks: [ { what, value, receipt } ], generalizes: "..." }`, each with receipts. Plus the required `rejections`, `tried`, `leads`, `unverified`. The report ends with a feasibility table (source × span × grain × license × hosted × "ledger can start") and a **defensibility ranking** of the routes to a pre-2010 ledger, in the style of: "Retrosheet-like free terms > CC0 compilation of an API pull (compiler's claim) > self-compiled from the league API (terms say no, keyless, nobody blocked) > Sports Reference (forbidden)".
