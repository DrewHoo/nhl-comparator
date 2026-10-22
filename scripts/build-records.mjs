// Mines what every player leads (src/lib/records.ts), the skaters over the
// skaters' ledger (the field `ALL`) and the goalies over theirs (`G`), and
// writes one file per player with a row to public/players/<id>.json. Then
// it marks public/players/index.json (build-index.mjs writes it: every
// player, the finder's list) with `n`, his rows, and `top`, his best score
// (0 and null without a page), and sorts it the best pages first. Runs after
// build-index.mjs and before `vite build`, so the files ship with the site,
// and on its own (`npm run records`) for the dev server. Nothing here is
// committed; the ledgers in src/data are the source.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { decodeLedger, mergeExtra } from '../src/lib/ledger.ts'
import { encodePlayer, mine, shapesFor } from '../src/lib/records.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public/players')
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, `src/data/${f}.json`), 'utf8'))
const indexFile = path.join(OUT, 'index.json')
if (!fs.existsSync(indexFile)) throw new Error('build-records: run build-index.mjs first (npm run index)')
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
for (const f of fs.readdirSync(OUT)) if (f !== 'index.json') fs.rmSync(path.join(OUT, f))

const t0 = Date.now()
const ledgers = [mergeExtra(decodeLedger(read('skaters')), read('skaters-x')), decodeLedger(read('goalies'))]
const t1 = Date.now()
console.log(`ledgers loaded in ${((t1 - t0) / 1000).toFixed(1)}s`)

const marks = new Map()
let pages = 0, bytes = 0, gz = 0, biggest = { name: '', bytes: 0, gz: 0 }
for (const L of ledgers) {
  const t = Date.now()
  const shapes = shapesFor(L.kind === 'goalies' ? 'G' : 'ALL')
  const rows = mine(L, shapes)
  const by = new Map()
  for (const r of rows) (by.get(r.player.id) ?? by.set(r.player.id, []).get(r.player.id)).push(r)
  for (const p of L.players) {
    const own = by.get(String(p.id))
    if (!own) continue
    // a skater who once went in goal is in both ledgers; his page is the one he played (the skaters', mined first)
    if (marks.has(p.id)) { console.warn(`build-records: ${p.name} (${p.id}) leads in both ledgers; the ${L.kind}' rows are left out`); continue }
    const json = JSON.stringify(encodePlayer(L, p, own))
    fs.writeFileSync(path.join(OUT, `${p.id}.json`), json)
    const z = zlib.gzipSync(json).length
    pages++; bytes += json.length; gz += z
    if (json.length > biggest.bytes) biggest = { name: p.name, bytes: json.length, gz: z }
    marks.set(p.id, { kind: L.kind, n: own.length, top: Math.round(Math.max(...own.map((r) => r.score)) * 10) / 10 })
  }
  console.log(`${L.kind}: ${shapes.length} shapes, ${rows.length} rows, ${by.size} of ${L.players.length} players with a page, mined in ${((Date.now() - t) / 1000).toFixed(1)}s`)
}

// the index lists such a player once per ledger; only the entry of the ledger his page came from points at it
for (const p of index) { const m = marks.get(p.id); const his = m && (m.kind === 'goalies') === (p.pos === 'G'); p.n = his ? m.n : 0; p.top = his ? m.top : null }
// the best pages first, then the biggest careers (what the finder lists before anything is typed)
index.sort((a, b) => (b.top ?? -Infinity) - (a.top ?? -Infinity) || b.games - a.games || a.name.localeCompare(b.name))
fs.writeFileSync(indexFile, JSON.stringify(index))
const kb = (n) => `${(n / 1024).toFixed(0)} KB`
console.log(`${pages} player pages: ${kb(bytes)} raw, ${kb(gz)} gzipped; the biggest ${biggest.name}, ${kb(biggest.bytes)} (${kb(biggest.gz)} gzipped); ${((Date.now() - t0) / 1000).toFixed(1)}s in all`)
