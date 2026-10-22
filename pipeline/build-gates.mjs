// Turns the researched factoid corpus (research/factoids/return.json, rows of
// kind "factoid" with receipts) into data/gates/factoids.json: one gate per claim,
// in the shape the comparator siblings' known-answer tests read, with the
// publisher's numbers and scope kept verbatim and an engine `query` left null
// until the stat catalogue exists. Conventions (kind "convention") go to
// data/gates/conventions.json so the Method section can be written from them.
// The per-stat floors come from research/beachhead.md and are typed here once.
//   node pipeline/build-gates.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = JSON.parse(readFileSync(join(ROOT, 'research/factoids/return.json'), 'utf8'))
const OUT = join(ROOT, 'data/gates')
mkdirSync(OUT, { recursive: true })

// first season each stat is populated (research/data-sources-apis.md, per-stat floors table)
const LEDGER_FLOORS = {
  goals: '1917-18', assists: '1917-18', points: '1917-18', pim: '1917-18', gwg: '1917-18', otg: '1917-18',
  ppg: '1933-34', shg: '1933-34',
  goalie_decision: '1917-18', goalie_ga: '1917-18', goalie_toi: '1917-18', goalie_shutouts: '1917-18', goalie_starter: '1917-18',
  goalie_ties: '1921-22 to 2004-05', goalie_otl: '2005-06', goalie_shots_saves: '1955-56',
  shots: '1959-60', plus_minus: '1959-60 (official 1967-68)',
  toi: '1997-98', shifts: '1997-98', faceoffs: '1997-98',
  hits: '1997-98 boxscore / 2005-06 REST', blocks: '1997-98 boxscore / 2005-06 REST', giveaways: '1997-98 boxscore / 2005-06 REST', takeaways: '1997-98 boxscore / 2005-06 REST',
  assists_caveat: 'credited sparingly before the mid-1930s; secondary assists not full-time until 1945-46 (research/factoids-and-conventions.md Q7)',
}

const factoids = src.rows.filter((r) => r.kind === 'factoid')
const conventions = src.rows.filter((r) => r.kind === 'convention')

const gates = factoids.map((f) => ({
  id: f.id,
  section: f.section,
  corpus_ref: `research/factoids-and-conventions.md ${f.id}`,
  claim: f.claim,
  publisher: f.publisher,
  url: f.url,
  claim_date: f.claim_date ?? null,
  numbers: f.numbers ?? {},
  scope: f.scope ?? {},
  slots: f.slots ?? {},
  verification: f.verification ?? f.grade ?? null,
  note: f.note ?? '',
  // filled when the engine's stat catalogue and sequences exist (see data/gates/README.md)
  query: null,
  assertions: [],
  status: 'pending',
  receipts: f.receipts ?? [],
}))

const bySection = {}
for (const g of gates) bySection[g.section] = (bySection[g.section] ?? 0) + 1

writeFileSync(join(OUT, 'factoids.json'), JSON.stringify({
  schema: 'nhl-comparator/gates/v0',
  doc: 'data/gates/README.md',
  generated: new Date().toISOString().slice(0, 10),
  sources: ['research/factoids/return.json (70 claims, 68 verified on fetched pages)', 'research/data-sources-apis.md (per-stat floors)', 'research/beachhead.md'],
  ledger_floors: LEDGER_FLOORS,
  counts: bySection,
  gates,
}, null, 2) + '\n')

writeFileSync(join(OUT, 'conventions.json'), JSON.stringify({
  schema: 'nhl-comparator/conventions/v0',
  doc: 'data/gates/README.md',
  generated: new Date().toISOString().slice(0, 10),
  rows: conventions,
  rejections: src.rejections ?? [],
  unverified: src.unverified ?? [],
}, null, 2) + '\n')

console.log(`gates: ${gates.length} factoids (${Object.entries(bySection).map(([k, v]) => `${k} ${v}`).join(', ')}); conventions: ${conventions.length}`)
