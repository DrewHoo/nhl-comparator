# Known-answer gates

Every viral factoid the site is asked to reproduce, as a query the engine will run and the numbers the publisher printed. The rule from the comparator siblings: add a gate for every factoid the site is asked to reproduce, with the publisher's definition noted where it differs; a mismatch is information, not something to patch.

| File | What |
|---|---|
| `factoids.json` | 70 claims from `research/factoids-and-conventions.md` (player glory and futility, goalies, team glory and futility, coaches, rookies, playoffs), each with the publisher, the numbers, the scope (season type · league · games unit), the five slots in words, and its receipts. Built by `node pipeline/build-gates.mjs`; never edited by hand. |
| `conventions.json` | The 26 publisher-convention rows (which unit "games" is, playoffs never summed, WHA out, age as years and days, the appearance unit, regulation losses) plus the corpus rejections and the unverified list. The Method section's publisher-difference sentences come from here. |

## What still has to be filled

`query` is null and `status` is `pending` on every gate because the engine's stat catalogue, sequences and scopes don't exist yet. When they do, the builder maps each gate's `slots` onto `{ who, stat, how, window, field }` in engine terms and writes `assertions` (headline value, previous holder, runners-up, each with `checkable: full|partial|no`), and `status` becomes one of `reproducible-in-full`, `reproducible-partial`, `not-reproducible` or `publisher-definition-differs`, as the football comparator's gates do. The per-stat `ledger_floors` block is what decides `era_wall`.

## The units the gates assume

- **Career claims count the player's own games played** (any appearance; for goalies, appearances, with starts as a separate sequence). "Through N games" never includes games the player missed.
- **Season-start claims count the team's games** (50-in-50, fastest 50 or 100 points from opening night). Lemieux 1988-89 is team game 46 officially and his own 44th in the popular claim; the gate carries both.
- **Regular season only** unless the gate's scope says playoffs; the two are never summed.
- **NHL only.** WHA and NHA rows never count.
- **Ages** are years and days on the game date; "teenager" is before the 20th birthday.
- **Team losses** in NHL standings are regulation losses only; streak gates name the kind (winless, losing, unbeaten, points) and the points-rule era.
