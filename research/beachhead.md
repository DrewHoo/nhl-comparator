# Beachhead: how far back the ledger goes, and on what

Drafted 2026-10-22 from four probes: [data-sources-apis.md](data-sources-apis.md) (279 requests against the NHL and ESPN APIs), [data-sources-open.md](data-sources-open.md) (117 requests over releases, mirrors and terms pages), [league-landscape.md](league-landscape.md) (137 facts, 169 receipts) and [factoids-and-conventions.md](factoids-and-conventions.md). Every response is cached under `data/raw/`, so re-running any probe costs nothing. The decision in "The call" is my recommendation; the choice between the options is Drew's.

## The short version

- **The data reaches 1917-18.** The NHL's stats REST (`api.nhle.com/stats/rest/en/skater/summary?isGame=true`) returns per-game player rows for every season since the league's first, up to 10,000 rows a query. The whole 1917–2026 player-game ledger is about 800 requests, 20 minutes at one request per 1.5 s. Gretzky's 50th goal lands in Edmonton's 39th game, Richard's 50th in game 50 of 50, Lemieux's in his 44th and Pittsburgh's 46th, McDavid's 1,000th point in his 659th game, and `records.nhl.com` agrees with every one, game id for game id.
- **The license doesn't.** NHL.com's terms (updated 2025-10-29) bar "unauthorized automated means to compile information", entering NHL content "into a database", and anything but "non-commercial, informational, personal use". The API responses carry no terms, need no key, and nobody has been blocked for compiling them: sportsdataverse's own NHL release is a daily scrape of this API republished under MIT, and so are hockeyR-data and the Kaggle dump.
- **The open files start in 2009-10** (sportsdataverse `nhl_skater_boxscores` and `nhl_goalie_boxscores`, MIT, updated the day we looked). That is one season earlier than the sports-site skill says. MoneyPuck reaches 2008-09 for non-commercial use only.
- **Season totals reach 1917-18 under terms that allow commercial use with an attribution line** (the Hockey Databank, Lahman's hockey cousin; public mirror through 2017-18, a 2024 file behind a groups.io login). The Hockey Summary Project is the Retrosheet cousin (game summaries 1917–2017 with gaps, same free terms), but it has no bulk download today and records who dressed only for 1993-95, so it is a team-game and cross-check source, not a player-game one.
- **ESPN adds nothing.** Its box scores start in 1993-94, its cheap site API refuses our honest user agent (a browser agent gets 200), and Disney's terms name "data set or database" compilation outright.

## What each route gives

| Route | Player-game rows from | License posture | Cost | Who it covers in full |
|---|---|---|---|---|
| sportsdataverse releases | 2009-10 | MIT on the producer, CC BY badge on the store; the compiler's claim over an NHL API pull. The sibling-site precedent (WNBA on ESPN via sportsdataverse). | a few file downloads | McDavid, Matthews, MacKinnon, Makar, Hughes, Bedard, Celebrini, Hellebuyck. Ovechkin, Crosby, Malkin, Stamkos and Kane join the ledger mid-career. |
| MoneyPuck | 2008-09 | explicit non-commercial permission with credit; a Ko-fi link is arguable | downloads | the same set, one season earlier |
| NHL stats REST, self-compiled | 1917-18 | terms say no; keyless; broad public precedent; no blocks found | ~800 requests once | everyone: Howe, Richard, Orr, Gretzky, Lemieux, Jagr, Brodeur, Ovechkin, Crosby |
| NHL_DB (Hugging Face, daily) | 1917-18 | no license stated; an NHL API pull by a third party | downloads, unverified contents | everyone, if the parquet checks out |
| Hockey Databank | seasons only, 1917-18 | free use including commercial, attribution line required | one zip | everyone, at season grain |
| Hockey Summary Project | team-games 1952-53 unbroken, 1917-18 with gaps | free use including commercial, attribution line required | a request to the maintainer | team boards; a pre-1987 cross-check |

## The call

**Build the ledger to 1917-18 from the NHL's stats REST, in two layers that the words and the Method keep apart, and ship the seasons sequence on the Databank's terms from day one.** Specifically:

1. **2009-10 to the running season: sportsdataverse releases.** The licensed release the siblings already build on, credited as "sportsdataverse (fastRhockey), MIT, from the NHL's public API". The daily refresh pulls GitHub release files and never touches an NHL host, which is what makes a cron safe to leave running.
2. **1917-18 to 2008-09: the stats REST, compiled once, cached privately, published as the compact ledger the site reads.** About 400 of the 800 requests. The Method says in one sentence where the era comes from: "games before 2009-10 come from the NHL's own records, through the public stats API, the same source the release files are built from." Raw responses stay out of the public repo; the site ships cumulative rows in the `COLS` encoding, which is how the football comparator reduced its exposure under every source.
3. **Seasons back to 1917-18 from the Hockey Databank** (the public v13 mirror through 2017-18, then the per-game ledger summed), with the attribution line it requires. This makes "through the first N seasons" a licensed board whatever Drew decides about layer 2, and it is the at-scale gate for layer 2: every player-season summed from REST rows must equal the Databank's row, the way transfermarkt gated the ESPN ledger.
4. **Known-answer gates from the league itself:** `records.nhl.com`'s milestone endpoints carry the NHL's own games-to-milestone fields (1,000-point careers, 500-goal careers, 50-goal seasons), keyed to game ids. A "fastest to" board that disagrees with them is wrong or has a definition difference to print.

Why this and not the open-only floor: Drew's instruction was to go back as far as we can, and the data goes back to the founding. The only thing between 2009 and 1917 is a terms clause that the open release itself violates daily on our behalf; building on that release and refusing to run the same script once for the earlier seasons is a distinction without a difference in what the NHL sees, and a large difference in what the site can say. Gretzky, Howe, Orr and Lemieux are the sport's comparison set the way Montana and Rice were for the NFL, and the NFL site had no route to them. This one does.

Why the two layers anyway: the posture of the running season matters more than the posture of a one-time compile. A cron that scrapes the league nightly is the thing that gets noticed; a cron that downloads a GitHub release is not. And the layer boundary is a `source` column, so if Drew later wants the open-only site, the pre-2009 layer comes out with one filter and the words move the era wall to 2009-10 by themselves.

### The alternative, if Drew holds the sibling-site rule

Ship layer 1 and layer 3 only: per-game boards since 2009-10, seasons boards since 1917-18, and layer 2 kept as a private known-answer gate (fetched in CI, never committed), the way StatsBomb's Messi set gates the football ledger. The marquee queries then read "since 2009-10", Ovechkin and Crosby sit out career fields, and the seasons boards are where the legends live. The engine, the words and the gates are the same either way.

### What I would not do

- Not NHL_DB as the spine. Its contents are unverified and its license posture is the same as self-compiling, with a stranger's script in between.
- Not MoneyPuck. One season for a non-commercial clause the Ko-fi line arguably breaks.
- Not ESPN. A worse floor, a terms clause that names databases, and a 403 that only a disguised user agent gets past.
- Not a browser user agent on any host. The helper says who we are; if a host refuses that, the answer is no, not a different hat.

## What the board defaults to (from the factoid corpus)

70 viral claims: 64 regular season only, 4 playoffs only; 39 count the player's own games, 23 the team's, the rest goalie appearances, games coached or seasons. So: careers · regular season · NHL only · x = the player's own games played, with a team-games-of-a-season window from opening night for the 50-in-50 family (the official list ranks Lemieux by team game 46; the popular claim counts his 44th game), a separate playoffs board, by-age windows (years and days on the game date; "teenager" is before the 20th birthday), and team boards with the four streak kinds named (winless, losing, unbeaten, points) because NHL standings count only regulation defeats as losses. WHA years never fold in. The corpus is `data/gates/factoids.json`, built from `research/factoids/return.json` by `pipeline/build-gates.mjs`.

## The floors the words must carry

Whatever the era wall, each stat has its own, and the sentence says it ("since 1959-60" for shots and plus-minus even when the reader left "ever").

| Stat | First season | Note |
|---|---|---|
| goals, assists, points, PIM, GWG, OT goals | 1917-18 | assists were credited sparingly before the mid-1930s; a points board across that line compares two scoring rules, and the Method says so |
| goalie decisions, GA, minutes, shutouts, starter flag | 1917-18 | OT losses are folded into losses before 2005-06; ties 1921-22 to 2004-05 |
| power-play and shorthanded goals | 1933-34 | |
| goalie shots against and saves | 1955-56 | |
| skater shots, plus-minus | 1959-60 | plus-minus is official from 1967-68; 1959-66 is the league's later compilation |
| TOI, shifts, faceoff % | 1997-98 | |
| hits, blocks, giveaways, takeaways | 1997-98 in the api-web boxscore, 2005-06 in the stats REST | rink-scorer bias is documented; treat as a lesser stat tier |
| goalie OT losses as a decision | 2005-06 | |

Appearance unit: a row is a dressed player in a game; a skater with no points and a backup goalie with 00:00 both appear, and before 1997-98 TOI is zero for everyone, so "dressed" is the only definition available. Scratch lists before the modern era are unreliable (1950 Montreal lists 15, including Béliveau).

## Anomalies the builder carries (from the probes; AGENTS.md has the full list)

- 1917-18 has 36 regular-season game ids and 34 games in the season table (the Wanderers' two defaulted games), and its playoffs include five Stanley Cup Final games against a non-NHL opponent. A playoff board decides whether non-NHL opponents count; the Method says what it chose.
- The 2019-20 qualifying round is game type 3 (playoffs). All-Star games are type 4 and stay out. Preseason is type 1 and stays out.
- Neutral-site games from 1993-94 carry `neutralSite: true` and a venue; the 1992-94 seasons were 84 games with two neutral "home" games a team; the 2020 hubs gave home ice to the higher seed.
- The REST caps every query at 10,000 rows and `total` saturates there; window by month (or by team early) so no query matches more.
- The NHL re-ruled franchise history on 2026-09-24 (Winnipeg inherits the 1979-96 Jets and the Thrashers; Utah inherits nothing; the Coyotes keep 1996-2024). Franchise identity is a versioned ruling file, not a relocation chain.
- sportsdataverse: use `skater_box`, `goalie_box` and `schedule_master`; `player_box` and `team_box` have no game id and their 2018 file is a copy of 2019.
- Season length is a variable (22 → 84, 48 in the lockout years, 68–71 unequal in 2019-20, 56 in 2020-21, 84 again from 2026-27), so "the team's first N games" windows leave most seasons "on the way" at N > 48 and the picker should say so.
- Store the local game date, never the UTC date of the start time.

## The harvest, sized

- Layer 2: `skater/summary` and `goalie/summary` with `isGame=true&limit=-1`, one query per month per game type from 1917-18 to 2008-09, plus `team/summary` for team boards; about 400 requests, 10 minutes at 1.5 s, cached forever under `data/raw/api.nhle.com/`. One process, one host, the helper's log checked afterwards.
- Layer 1: the sportsdataverse `nhl_skater_boxscores`, `nhl_goalie_boxscores` and `nhl_schedules` assets, 2010 → current, refetched by the runner on a cron.
- Layer 3: `rippinrobr/hockey-databank` v13 (one zip); the groups.io 2024 file only if Drew joins.
- Birth dates: the api-web `player/{id}/landing` has them, but that is one request per player (~8,000). Wikidata has a DOB for 14,012 of the 14,040 people with an NHL.com id (CC0), which covers the ledger in one SPARQL pull; the landing endpoint fills the remainder at reader pace.

## Open decisions for Drew

1. Layer 2 as a published era (the call) or a private gate (the alternative).
2. Whether to ask the Hockey Summary Project maintainer for the bulk files (the only independent pre-1987 cross-check) and whether to join the Databank group for the 2024 totals.
3. Whether playoffs against non-NHL opponents (1918–1926 Stanley Cup Finals) count in "playoffs included" boards. I'd exclude them and say so.
4. Repo shape before the first commit: code-only MIT plus a `data/NOTICE`, or no LICENSE like the siblings; raw caches to a private repo or an R2 bucket.
