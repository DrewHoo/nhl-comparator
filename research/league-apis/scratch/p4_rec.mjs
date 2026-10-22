import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const R='https://records.nhl.com/site/api/'
for (const p of process.argv.slice(2)) {
  const r = await getJson(R+p)
  const d = r.json?.data
  console.log(r.status, p, 'total', r.json?.total, d?.[0] ? JSON.stringify(d[0]).slice(0,600) : r.text.slice(0,200))
}
