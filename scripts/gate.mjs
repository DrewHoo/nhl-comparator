// The known-answer gate: published factoids the ledger has to reproduce,
// through the site's own engine. Prints each with the numbers it found; the
// test in src/lib/query.test.ts pins the ones that pass. Run after `npm run ledger`.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { decodeLedger, mergeExtra, fmtSeason } from '../src/lib/ledger.ts'
import { evaluate, DEFAULT_QUERY } from '../src/lib/query.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const S = mergeExtra(decodeLedger(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/skaters.json'), 'utf8'))), JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/skaters-x.json'), 'utf8')))
const G = decodeLedger(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/goalies.json'), 'utf8')))
const Q = (patch) => ({ ...DEFAULT_QUERY, tests: [], ...patch })
const row = (board, name, season) => [...board.ranked, ...board.onTheWay].find((r) => r.player.name === name && (season == null || r.season === season))
const top = (b, k = 5) => b.ranked.slice(0, k).map((r) => `${r.tied ? 'T' : ''}${r.rank}. ${r.player.name}${r.season != null ? ` ${fmtSeason(r.season)}` : ''} ${r.value}`).join(' · ')

console.log('1. fastest to 50 goals from the start of a season (team games): Gretzky 39, Gretzky 42, Lemieux 46, Bossy 50, Richard 50')
{ const b = evaluate(S, Q({ how: 'reach', stat: 'g', n: 50, seq: 'teamGames', dir: 'fewest' })); console.log(`   ${top(b, 6)}`) }
console.log("2. fastest to 1,000 points: Gretzky 424, Lemieux 513, Bossy 656, McDavid 659, Stastny 682")
{ const b = evaluate(S, Q({ how: 'reach', n: 1000, dir: 'fewest' })); console.log(`   ${top(b, 6)}`) }
console.log('3. fastest to 100 points from the start of a season: Gretzky 34 (1981-82)')
{ const b = evaluate(S, Q({ how: 'reach', n: 100, seq: 'teamGames', dir: 'fewest' })); console.log(`   ${top(b, 4)}`) }
console.log("4. Makar's 100th point in his 108th game; fastest defensemen Cameron 88, M. Howe 94, Leetch 102")
{ const b = evaluate(S, Q({ pos: 'D', how: 'reach', n: 100, dir: 'fewest' })); const m = row(b, 'Cale Makar'); console.log(`   Makar ${m?.value} (rank ${m?.rank}) · ${top(b, 6)}`) }
console.log('5. most points in a rookie season: Selänne 132 (1992-93)')
{ const b = evaluate(S, Q({ seq: 'seasons', n: 1 })); console.log(`   ${top(b, 4)}`) }
console.log('6. Howe 1952-53, 95 points in 70 games; Esposito 76 goals in 1970-71')
{ const b = evaluate(S, Q({ seq: 'teamGames', n: 70 })); const h = row(b, 'Gordie Howe', 1952); console.log(`   Howe ${h?.value} through ${h?.reached}`); const e = evaluate(S, Q({ stat: 'g', seq: 'teamGames', n: 78 })); const x = row(e, 'Phil Esposito', 1970); console.log(`   Esposito ${x?.value} through ${x?.reached}`) }
console.log('7. most points through the first 500 games (the default board)')
{ const b = evaluate(S, DEFAULT_QUERY); console.log(`   ${top(b, 6)} · ${b.ranked.length} careers, ${b.onTheWay.length} on the way`) }
console.log('8. most wins through the first 100 starts (goalies)')
{ const b = evaluate(G, Q({ pos: 'G', stat: 'win', seq: 'starts', n: 100 })); console.log(`   ${top(b, 6)} · ${b.ranked.length} careers`) }
console.log('9. fastest goalie to 100 wins')
{ const b = evaluate(G, Q({ pos: 'G', how: 'reach', stat: 'win', n: 100, dir: 'fewest' })); console.log(`   ${top(b, 6)}`) }
console.log("10. Brodeur: 691 wins, 125 shutouts; Sawchuk 103 shutouts")
{ const b = evaluate(G, Q({ pos: 'G', stat: 'win', n: 1266 })); const m = row(b, 'Martin Brodeur'); const s = evaluate(G, Q({ pos: 'G', stat: 'so', n: 1266 })); console.log(`   Brodeur ${m?.value} wins through ${m?.reached}; shutouts: ${top(s, 3)}`) }
console.log('11. plus-minus through the first 500 games (since 1959-60): the gapped count says who sat out')
{ const b = evaluate(S, Q({ stat: 'pm' })); console.log(`   ${top(b, 4)} · since ${fmtSeason(b.since)}, ${b.gapped} careers sat out`) }
console.log('12. most hat tricks through the first 500 games')
{ const b = evaluate(S, Q({ stat: 'hat' })); console.log(`   ${top(b, 5)}`) }
