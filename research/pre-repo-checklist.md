# Before the repo, before the deploy, before the share

Written 2026-10-22, the football comparator's checklist adapted. Three gates in order: the repo can be created once A is done, the site deployed privately once B is, the share goes out once C is.

## A. Before `git init`

1. **Drew's call on [beachhead.md](beachhead.md) open decision 1** (the pre-2009 layer published or private). Nothing from the NHL REST is harvested before that call; the open files (sportsdataverse 2009-10 on, the Databank v13 zip) can be fetched now.
2. The harvester written on `research/lib/fetch.mjs`: REST `skater/summary`, `goalie/summary` and `team/summary` with `isGame=true&limit=-1`, windowed by month so no query matches 10,000 rows, one process, resumable, logging to `data/raw/logs/`. Dry-run mode prints the request plan.
3. The ledger builder: NHL player id as the key; per row the local date, game id, type, team and opponent (franchise id through the ruling file), home/road, neutral flag, result, the stat line, the goalie starter flag and decision, and the ordinals (career game, career start for goalies, season number, the team's game number that season). `COLS` encoding as the siblings; `source` per row (`sdv` or `rest`).
4. Gates run before the write: every player-season summed from rows equals the Databank's row (1917-18 to 2017-18) and the API's season totals after; the `records.nhl.com` milestone fields for 1,000-point and 500-goal careers and 50-goal seasons; the corpus gates in `data/gates/factoids.json`.
5. A franchise ruling file (`data/ref/franchises.json`, versioned, with the 2026-09-24 NHL ruling as its first entry and receipts), a game-corrections file (1917-18's defaulted games and non-NHL Finals), and a leads file.
6. Birth dates from Wikidata (P3522 → P569) in one pull, the landing endpoint at reader pace for the remainder, both with receipts.
7. Repo shape decided before the first commit: public = code, the compact ledger, gates, ruling files, AGENTS.md, pipeline docs; private = `data/raw/` (the REST cache is small, a few hundred MB; the sportsdataverse files refetch). `.gitignore` before the first `git add`, and the add uses an explicit file list. LICENSE: code-only MIT plus `data/NOTICE`, or none like the siblings (Drew's call).
8. Credit lines written now: sportsdataverse (fastRhockey), MIT, from the NHL's public API; the Hockey Databank attribution line verbatim; the Hockey Summary Project line if its data is ever used; Wikidata CC0.

## B. Before a private deploy (show before ship)

9. Scaffold with the dataviz-pages-site skill, the canon chrome from Streak King, the engine from the newest comparator sibling (or the shared core if it has been extracted). Launch port: next free after 5176.
10. Hockey-specific engine changes: goalies as a position with starts and decisions; the team entity from day one with the four streak kinds; the by-age window; the team-games-of-a-season window from opening night; the per-stat era floors in the words; a lesser tier for RTSS stats; the clean-game played floor (a skater needs TOI where TOI exists; before 1997-98 "dressed").
11. Stats catalogue and thresholds (goals, assists, points, PIM, shots, plus-minus, PP goals, GWG, hat tricks as a 0/1, goalie wins, losses, shutouts, saves, GA) with the floors table from the beachhead.
12. Gates wired into `query.test.ts` and `scripts/gate.mjs`.
13. Words: the sentence module, the share text, Method with every publisher-definition difference (team games vs player games; regulation losses; WHA; early assists; OTL folding; non-NHL Finals; franchise rulings) and the credit lines.
14. Design takes as static HTML, desktop and 375px, on the phone.
15. Entity views (player, goalie, team, franchise), URL state, prerender, `document.title`.
16. Cards and the share worker from WNBA; deployed once by hand; Drew sets `CLOUDFLARE_API_TOKEN`.
17. Refresh: the running season from the sportsdataverse release on a daily cron in the runner, nothing committed back; no NHL host in the cron.
18. AGENTS.md and CLAUDE.md current.

## C. Before the public share

19. Mixpanel delivering; share-worker live checks; sample cards from prod.
20. Sitemap, IndexNow, the index-site card PR, sibling links on the other sites.
21. Known-answer spot checks on the live site (Gretzky 39, Lemieux 46/44, McDavid 659, Ovechkin 895 in 1,487) and the era-wall sentence visible on each.
22. Timing: a marquee night (an Oilers game, a milestone watch).
