import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
for (const u of process.argv.slice(2)) {
  const r = await getJson(u)
  const d = r.json?.data
  console.log(r.status, r.cached?'C':'', u)
  if (!r.json) { console.log('  ', r.text.slice(0,300)); continue }
  console.log('   total=', r.json.total, 'rows=', d?.length, d?.[0] ? JSON.stringify(d[0]).slice(0,900) : JSON.stringify(r.json).slice(0,300))
}
