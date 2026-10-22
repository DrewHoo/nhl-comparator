import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const dates = process.argv.slice(2)
for (const d of dates) {
  const r = await getJson(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${d}`)
  const ev = r.json?.events || []
  console.log(d, r.status, ev.length, ev.slice(0,3).map(e=>`${e.id}:${e.shortName}:${e.season?.type}`).join(' '))
}
