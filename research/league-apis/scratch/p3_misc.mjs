import { get } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
for (const u of process.argv.slice(2)) { const r = await get(u); console.log(r.status, r.cached?'cached':'', u, r.text.slice(0,200).replace(/\s+/g,' ')) }
