// Birth dates and the Hockey-Reference id for every person Wikidata lists
// with an NHL.com player id (P3522), in one SPARQL pull through the helper
// (CC0). Writes data/ref/people.json: { nhlId: { born, hr, qid } }. The
// builder applies it; a player Wikidata lacks keeps born: null, and the
// coverage report names him.
//   node pipeline/fetch-people.mjs
import { writeFileSync } from 'node:fs'
import { get } from '../research/lib/fetch.mjs'

const Q = `SELECT ?item ?nhl ?born ?hr WHERE {
  ?item wdt:P3522 ?nhl .
  OPTIONAL { ?item wdt:P569 ?born . }
  OPTIONAL { ?item wdt:P3598 ?hr . }
}`
const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(Q)}`
const r = await get(url, { nocache: process.argv.includes('--refresh'), headers: { accept: 'application/sparql-results+json' } })
if (r.status !== 200) throw new Error(`wikidata ${r.status}`)
const rows = JSON.parse(r.text).results.bindings
const out = {}
let withDob = 0
for (const b of rows) {
  const id = b.nhl.value
  if (!/^\d{7}$/.test(id)) continue
  const born = b.born?.value?.slice(0, 10) ?? null
  const cur = out[id] ?? (out[id] = { born: null, hr: null, qid: b.item.value.split('/').pop() })
  // a person with two birth-date claims keeps the first seen; the coverage report can list these
  if (born && !cur.born && /^\d{4}-\d{2}-\d{2}$/.test(born)) { cur.born = born; withDob++ }
  if (b.hr?.value && !cur.hr) cur.hr = b.hr.value
}
writeFileSync('data/ref/people.json', JSON.stringify({ version: 1, updated: new Date().toISOString().slice(0, 10), note: 'Wikidata (CC0): NHL.com id (P3522) -> birth date (P569) and Hockey-Reference id (P3598). Built by pipeline/fetch-people.mjs; never edited by hand.', source: url, people: out }, null, 0))
console.log(`${Object.keys(out).length} people with an NHL id, ${withDob} with a birth date, ${Object.values(out).filter((p) => p.hr).length} with a Hockey-Reference id`)
