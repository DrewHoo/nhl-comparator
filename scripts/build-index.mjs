// The finder's index: every player in both ledgers with his id, name,
// position and span, written to public/players/index.json so the dateline's
// finder can fetch it lazily (PlayerFinder.jsx). Runs before `vite build` so
// the file ships with the site, and on its own (`npm run index`) for the dev
// server. Not committed; the ledgers in src/data are the source. Also writes
// src/data/floors.json (committed, tiny): each ledger's stat floors, so the
// Method can say each stat's first season without loading the goalies.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { unpack } from '../src/lib/pack.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public/players')
fs.mkdirSync(OUT, { recursive: true })

const index = []
const floors = {}
for (const kind of ['skaters', 'goalies']) {
  const file = JSON.parse(fs.readFileSync(path.join(ROOT, `src/data/${kind}.json`), 'utf8'))
  floors[kind] = file.floors
  for (const p of file.players) {
    const seasons = unpack(p.c.season, p.n, true)
    index.push({ id: p.id, name: p.name, pos: p.pos, from: seasons[0], to: seasons[p.n - 1], games: p.n })
  }
}
// the biggest careers first: what the finder lists before anything is typed
index.sort((a, b) => b.games - a.games || a.name.localeCompare(b.name))
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index))
fs.writeFileSync(path.join(ROOT, 'src/data/floors.json'), JSON.stringify(floors, null, 2) + '\n')
console.log(`${index.length} players in public/players/index.json; the floors in src/data/floors.json`)
