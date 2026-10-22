# NHL Comparator

Compare NHL players at the same point in their careers, every career since 1917-18. Live at https://drewhoover.com/nhl-comparator/.

A reader sets a sentence (skaters · with the most · points · through their first 500 games · regular season · since 1917-18) and the board ranks every career, or every player-season, at that window; a row opens against a peer, with where their curves met and what it would take to catch up.

- `research/` — how the era wall was decided (`README.md`, then `beachhead.md`), four research reports with every quote string-checked against saved pages, and the briefs the agents ran on.
- `pipeline/` — the harvester (the NHL's public stats REST, throttled and cached) and the ledger builder with its known-answer gates.
- `src/` — the engine (`lib/`), the page (`components/`) and the committed ledgers (`data/`).
- `workers/share/` — the Cloudflare worker that makes every shared board unfurl as itself.
- `data/gates/` — the 70 viral claims the site is asked to reproduce, each with its receipts.

Data: the National Hockey League's own game records, read through its public stats API; birth dates from Wikidata (CC0). See `data/NOTICE`. Code is MIT.
