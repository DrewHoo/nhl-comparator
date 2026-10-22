# Shared context for every NHL research brief (2026-10-21)

## Purpose

Drew (drewhoover.com) is building **NHL Comparator**, the hockey sibling of NFL Comparator and WNBA Comparator: a career-point query engine. A reader sets a five-slot sentence, "who · did what · how much · over which games · against whom" ("Connor McDavid has N points through his first 500 games"; "fastest to 500 goals"; "most wins by a goalie through 100 starts"; "fewest wins by a team through its first 40 games") and the board ranks every career, every player-season, or every team-season by its value at that window. The product rule from the siblings: start from the sport's viral factoids, not a stat catalog; futility ranks as high as glory; the words carry the era bound the data forces ("since 2010" when the data stops there).

Drew's instruction for this project: **"Let's go back as far as we can."** The NHL's own API serves box scores to 1917-18, but NHL.com's terms forbid compiling them into a database; the open, third-party-released files start in 2010. The research phase decides how far back a *defensible* ledger can reach, what the sport counts and how its publishers count, and what the league's eras do to the stats. The deliverable of this phase is a decision document (`research/beachhead.md`), not a dataset. Nothing is harvested until that decision is made.

## Already ruled in / out (checked 2026-10-20 by an earlier agent; do not re-research, but correct it if a source contradicts it)

- `https://api-web.nhle.com/v1/` needs no key. `player/{id}/game-log/{season}/2` returned Gretzky 1981-82 (80 games), Howe 1946-47 (58) and 1950-51 (70), and a 1917-18 player (17 games). `gamecenter/{gameId}/boxscore` has `playerByGameStats` for 1917020001 (7–4) and 1950020001; old games carry G/A/PIM and read 0 for hits, blocks and TOI. `club-schedule-season/MTL/19501951` returned 81 games. `player/{id}/landing` has birthDate, position, shootsCatches. `api.nhle.com/stats/rest/en/skater/summary?cayenneExp=seasonId=19171918` returns season summaries.
- NHL.com's terms prohibit "unauthorized spidering, scraping, or harvesting", "automated means to compile information", and entering NHL content into "a database".
- sportsdataverse-data releases `nhl_player_boxscores`, `nhl_skater_boxscores`, `nhl_goalie_boxscores`, `nhl_schedules`, `nhl_game_rosters`, `nhl_rosters`, `nhl_pbp_full`: 2010–2027. Columns include goals, assists, toi, shifts, hits, blocks. Rosters have position, no DOB. The producer repo `fastRhockey-nhl-data` LICENSE.md is MIT; the sportsdataverse README badge says CC BY 4.0. Assets last updated Apr–May 2026; the producer window opens Oct 7.
- MoneyPuck: skater/goalie/line game files 2008–2026, shots 2007+, a bios lookup with birthdates. Free for non-commercial use, credit required, "non-approved scraping will be blocked".
- hockeyR-data (danmorse314): play-by-play, last push 2024-06, stale. Evolving-Hockey: paid. Hockey-Reference: Sports Reference terms forbid building tools on scraped data; its data-use page points students to the **Hockey Summary Project** instead (a lead, not yet checked).
- Reference data: sportsdataverse `nhl_groups` (division membership by season, 1918+); the Chadwick register carries `key_sr_nhl`; Wikidata P3522 is the NHL.com player id.
- The working rule the sibling sites follow: build on a release a third party publishes under an open license, credit it and the upstream in Method, and treat a direct crawl of a league site or Sports Reference as off-limits except as a single receipt page at reader pace. The football comparator (soccer) stretched this: its spine is ESPN's undocumented JSON API, self-compiled, under Disney terms that say no, on the precedent that the WNBA site's data is ESPN's via sportsdataverse. A defensibility ranking of sources is part of what we want from you.

## Working rules

- **Every outside request goes through `research/lib/fetch.mjs`** (`import { get, getJson } from '<repo>/research/lib/fetch.mjs'`, or `node research/lib/fetch.mjs <url>`). It throttles to one request per 1.5 s per process, caches forever under `data/raw/<host>/`, and logs to `data/raw/logs/fetch.log`. Never call `fetch` directly, never run two processes against one host. WebFetch and WebSearch (your own tools) are fine for reading articles and terms pages; for any API probe, use the helper. Your request budget is in your brief. Your fetch.log lines will be checked.
- A probe characterizes a source; it does not harvest. Three spot checks from different decades beat a hundred from one.
- Sports Reference pages (Hockey-Reference) are receipts only: at most one page per lead, never a sweep. The Wayback Machine when the live site blocks.
- Namespace everything you write under `research/<your-slice>/` (scratch scripts under `scratch/`, saved page text under `pages/<sha1-of-url>.txt` for every page you quote, so quotes can be string-checked later). Your report is `research/<report-name>.md`; your structured return is `research/<your-slice>/return.json`.
- Tag every claim [V] (you verified it today against the page, file, API or release listing), [R] (recalled, not re-checked) or [S] (seen only in a search snippet). Quotes are verbatim.
- Rejections and uncertainty are useful. Don't guess. A source that turns out useless is a finding; put it in `tried` so the next fleet skips it.
- Do not `git init`, commit, or create a repo. Do not edit files outside `research/<your-slice>/` and your report file.
- You may spawn your own sub-agents for parallel slices; give each the same rules, a namespace, and a request budget, and merge their results yourself.

## The return schema (`research/<your-slice>/return.json`, every section required even when empty)

```json
{
  "rows": [ { "...": "the row's own fields", "grade": "...", "receipts": [ { "url": "…", "quote": "…", "note": "…", "retrieved": "2026-10-21" } ] } ],
  "rejections": [ { "claim": "…", "reason": "…", "receipts": [ { "url": "…", "quote": "…" } ] } ],
  "tried": [ { "source": "…", "outcome": "nothing usable | blocked (403) | paywalled | no coverage before YYYY | license forbids" } ],
  "leads": [ { "note": "…", "why_out_of_scope": "…" } ],
  "unverified": [ { "claim": "…", "what_i_tried": "…" } ]
}
```
