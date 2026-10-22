# NHL comparator: the landscape, in one read

Written 2026-10-22 from four research passes in this folder, each an Opus agent with a brief under `briefs/`, a report here, and a structured return with receipts under its own slice directory:

- [data-sources-apis.md](data-sources-apis.md): the NHL's two APIs and ESPN's, probed per stat per era with known answers, the terms verbatim, and the precedent list. 279 requests.
- [data-sources-open.md](data-sources-open.md): every downloadable NHL dataset and community project, with license, span, grain and lineage. 117 requests.
- [factoids-and-conventions.md](factoids-and-conventions.md): 70 viral claims taken apart into the comparator's slots, and how nine publishers define the units. 68 verified on fetched pages.
- [league-landscape.md](league-landscape.md): stat floors by era, season lengths, franchise identity, what the NHL counts, dates, ids, and where 48 legends sit against each candidate floor. 137 facts, 169 receipts.
- [beachhead.md](beachhead.md): the decision document. Where the ledger starts, on what, and the open calls.

Every quote in the four `return.json` files was string-checked against the saved pages (`<slice>/pages/<sha1(url)>.txt`) with the receipts-research checker after the agents reported, not on their say-so: factoids 172 of 172, landscape 169 of 169, open-datasets 46 of 47, league-apis 17 of 44. The receipts that fail are readings of API JSON (a sum, a count, a field), not lines on a page; `lib/relabel-receipts.mjs` rewrote them into the no-quote "named source" form the method allows, with the cached response under `data/raw/` as the thing to check against.

## The short version

**The data goes back to the league's first season.** The NHL's stats REST serves per-game player rows from 1917-18 in bulk, about 800 requests for everything, and the league's own records site agrees with it game for game on every milestone we checked: Gretzky's 50th goal in Edmonton's 39th game, Richard's 50th in game 50 of 50, Lemieux's in his 44th and Pittsburgh's 46th, McDavid's 1,000th point in his 659th. Goals, assists, points, penalty minutes, game-winning goals and every goalie decision reach 1917-18. Every other stat starts when the league started recording it: power-play and shorthanded goals 1933-34, goalie saves 1955-56, shots and plus-minus 1959-60, time on ice 1997-98, hits and blocks 1997-98 (2005-06 in the REST), goalie overtime losses 2005-06.

**The license is the wall, not the data.** NHL.com's terms bar automated compiling, databases and non-personal use. The open release the sibling sites would build on (sportsdataverse, MIT) is a daily scrape of that same API, republished, and starts in 2009-10. Season totals reach 1917-18 under terms that allow commercial use with an attribution line (the Hockey Databank). The Hockey Summary Project is hockey's Retrosheet (game summaries 1917–2017, same free terms) but has no download channel today and no who-dressed data outside 1993-95. ESPN starts in 1993-94, refuses our honest user agent, and names databases in its terms.

**What the sport counts.** Career claims count the player's own games; season-start claims ("50 in 50", "fastest to 100 points from opening night") count the team's games, and Lemieux's 1988-89 is both in one sentence (team game 46, his own 44th). Regular season is the default everywhere and playoffs are never summed in without a label. WHA years are not NHL stats. "Games played" is any appearance, a 7.6-second goalie career included; goalies have starts as a separate sequence. Ages are years and days on the game date, and "teenager" means before the 20th birthday. NHL standings count only regulation defeats as losses, so "winless", "losing", "unbeaten" and "points streak" are four different streaks and team futility carries its era in the words.

**What the league does to the ledger.** Season length is a variable (22 games in 1917-18, 84 in 1992-94 and again from 2026-27, 48 in the lockout years, unequal in 2019-20). Franchise history is whatever the NHL last ruled, and on 2026-09-24 it re-ruled: Winnipeg now inherits the 1979-96 Jets and the Thrashers, Utah inherits nothing. The 2019-20 qualifying round is a playoff game type; All-Star games are their own type; 1917-18 has two defaulted games and a Stanley Cup Final against a non-NHL team. Store the local game date.

## What the discourse scopes to

Of 70 viral claims, 64 are regular season only and 4 playoffs only. 39 count the player's own games (every career "fastest to" and "through N games"), 23 count team games (the 18 team-season rows plus 5 season-start player claims), the rest goalie appearances, games coached or seasons. About five carry their era in their own words ("salary cap era", "since 1995-96", "since 1943-44", "shootout era"). Futility is team-level and era-sensitive (the Sabres' 18 straight defeats were officially a "winless" streak, which ESPN disputed in print). Goalies and coaches have their own lists. Nobody publishes "goalie wins through first 100 starts" or "fewest team wins through N games", so those boards would be new.

## So, what the site should do

1. **Default board: careers, regular season, NHL only, x = the player's own games played.** Goalies by appearances with starts as a second sequence; coaches by games coached; team-seasons by team games.
2. **A team-games-of-a-season window from opening night** for the 50-in-50 family and "fastest to 100 points from the start of a season", labelled as the team's games, because the official list ranks Lemieux at 46 and the popular claim says 44.
3. **A playoffs board of its own**, never a summed scope, with the 1918–1926 Finals against non-NHL opponents excluded and the exclusion stated.
4. **By-age windows** (youngest to M; before the 20th birthday), which needs a date of birth for everyone: Wikidata has one for 14,012 of the 14,040 people with an NHL.com id.
5. **Team boards from day one** with the four streak kinds named and the points-rule era in the words.
6. **Era floors per stat in the sentence**, the way the NFL site says "flagged since 2003": points boards reach 1917-18 with a note that assists were credited differently before the mid-1930s; shots and plus-minus say "since 1959-60"; hits say "since 1997-98" and sit in a lesser tier.
7. **A seasons sequence back to 1917-18 on the Databank's terms**, so "through the first N seasons" is a licensed board whatever is decided about per-game rows before 2009-10.

## The data reality, and where it landed

See [beachhead.md](beachhead.md). The call I recommend: build the per-game ledger to 1917-18 from the NHL's stats REST in two layers kept apart by a `source` column (2009-10 on from the sportsdataverse release, credited; earlier seasons compiled once from the REST, cached privately, shipped as the compact ledger), gated at scale against the Databank's season totals and the league's own milestone fields. The alternative if Drew holds the sibling-site rule: per-game boards since 2009-10, seasons boards since 1917-18, and the pre-2009 layer kept as a private gate. The engine, words and gates are the same either way; the difference is one filter and where the era wall sits in the sentence.

## On the name

"NHL Comparator", matching NFL Comparator and WNBA Comparator. Nothing in the research argues for another.
