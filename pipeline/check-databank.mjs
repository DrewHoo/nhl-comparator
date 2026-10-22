// The at-scale gate: every player-season summed from the ledger against the
// Hockey Databank's season totals (a volunteer compilation from the NHL
// guides and record books, free to use with attribution; the v13 mirror
// runs 1917-18 to 2017-18). The join is Databank hrefID -> Wikidata's
// Hockey-Reference id -> NHL id (data/ref/people.json). Prints the match
// rate by decade and the first mismatches; exits 1 when the rate falls
// under the floor. Runs offline from the research cache.
//   OFFLINE=1 node pipeline/check-databank.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { get } from '../research/lib/fetch.mjs'
import { unpack } from '../src/lib/pack.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// the two lineages (the league's 2017 re-audit behind the API; the guides and record books behind the Databank) differ by an assist or a game in the early eras, so the floor is loose; the report is the point
const FLOOR = 0.85
const csv = (text) => { const [h, ...rows] = text.trim().split('\n'); const cols = h.split(','); return rows.map((r) => { const v = r.split(','); return Object.fromEntries(cols.map((c, i) => [c, v[i] ?? ''])) }) }
const DB = 'https://raw.githubusercontent.com/rippinrobr/hockey-databank/master'
const master = csv((await get(`${DB}/Master.csv`)).text)
const scoring = csv((await get(`${DB}/Scoring.csv`)).text)
const goalies = csv((await get(`${DB}/Goalies.csv`)).text)
const people = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ref/people.json'), 'utf8')).people
const hrToNhl = new Map()
// Wikidata's Hockey-Reference id carries the letter directory ("h/howego01"); the Databank's doesn't
for (const [id, p] of Object.entries(people)) if (p.hr) hrToNhl.set(p.hr.split('/').pop(), Number(id))
const dbToNhl = new Map()
for (const m of master) if (m.hrefID && hrToNhl.has(m.hrefID)) dbToNhl.set(m.playerID, hrToNhl.get(m.hrefID))

const ledger = (kind) => {
  const f = JSON.parse(fs.readFileSync(path.join(ROOT, `src/data/${kind}.json`), 'utf8'))
  const out = new Map() // nhlId -> season -> { gp, g, a } (regular season)
  for (const p of f.players) {
    const season = unpack(p.c.season, p.n, true), post = unpack(p.c.post, p.n)
    const g = kind === 'skaters' ? unpack(p.c.g, p.n) : null, a = kind === 'skaters' ? unpack(p.c.a, p.n) : null
    const dec = kind === 'goalies' ? unpack(p.c.dec, p.n) : null
    const by = new Map()
    for (let i = 0; i < p.n; i++) {
      if (post[i]) continue
      const s = by.get(season[i]) ?? by.set(season[i], { gp: 0, g: 0, a: 0, w: 0 }).get(season[i])
      s.gp++
      if (g) { s.g += g[i]; s.a += a[i] } else s.w += dec[i] === 2 ? 1 : 0
    }
    out.set(p.id, by)
  }
  return out
}

function compare(label, rows, L, fields) {
  const byKey = new Map() // `${nhl}|${year}` -> summed databank
  let unjoined = 0
  for (const r of rows) {
    if (r.lgID !== 'NHL') continue
    if (!Number(r.GP)) continue // a roster row with no games is not a season
    if (r.pos === 'G') continue // the Scoring table lists goalies too; they are the goalie file's
    const nhl = dbToNhl.get(r.playerID)
    if (!nhl) { unjoined++; continue }
    const k = `${nhl}|${r.year}`
    const s = byKey.get(k) ?? byKey.set(k, Object.fromEntries(fields.map((f) => [f[0], 0]))).get(k)
    for (const [name, col] of fields) s[name] += Number(r[col] || 0)
  }
  const decades = new Map()
  const misses = []
  let n = 0, ok = 0, missing = 0
  for (const [k, db] of byKey) {
    const [nhl, year] = k.split('|').map(Number)
    const mine = L.get(nhl)?.get(year)
    n++
    const d = Math.floor(year / 10) * 10
    const dec = decades.get(d) ?? decades.set(d, { n: 0, ok: 0 }).get(d)
    dec.n++
    if (!mine) { missing++; misses.push(`${k}: not in the ledger (databank ${JSON.stringify(db)})`); continue }
    const same = fields.every(([f]) => mine[f] === db[f])
    if (same) { ok++; dec.ok++ } else misses.push(`${k}: ledger ${JSON.stringify(Object.fromEntries(fields.map(([f]) => [f, mine[f]])))} databank ${JSON.stringify(db)}`)
  }
  console.log(`\n${label}: ${ok} of ${n} player-seasons match exactly on ${fields.map((f) => f[0]).join('/')} (${(100 * ok / n).toFixed(2)}%); ${missing} not in the ledger; ${unjoined} databank rows with no NHL id`)
  for (const [d, v] of [...decades].sort((a, b) => a[0] - b[0])) console.log(`  ${d}s: ${v.ok}/${v.n} (${(100 * v.ok / v.n).toFixed(1)}%)`)
  console.log('  first mismatches:'); for (const m of misses.slice(0, 15)) console.log('   ', m)
  console.log('  2010s mismatches:'); for (const m of misses.filter((x) => /\|201\d:/.test(x)).slice(0, 12)) console.log('   ', m)
  return ok / n
}
const r1 = compare('skaters', scoring, ledger('skaters'), [['gp', 'GP'], ['g', 'G'], ['a', 'A']])
const r2 = compare('goalies', goalies, ledger('goalies'), [['gp', 'GP'], ['w', 'W']])
if (r1 < FLOOR || r2 < FLOOR) { console.error(`\nunder the ${FLOOR} floor`); process.exit(1) }
