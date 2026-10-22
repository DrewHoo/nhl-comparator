import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const fix = u => u.replace('http://','https://')
const C='https://sports.core.api.espn.com/v2/sports/hockey/leagues/nhl'
for (const d of process.argv.slice(2)) {
  const ev = (await getJson(`${C}/events?dates=${d}&limit=50`)).json
  if (!ev?.items?.length) { console.log(d, 'no events', JSON.stringify(ev).slice(0,200)); continue }
  const e = (await getJson(fix(ev.items[0].$ref))).json
  const comp = e.competitions[0]
  console.log('==', d, 'events', ev.count, e.id, e.name, 'seasonType', e.seasonType?.$ref?.match(/types\/(\d)/)?.[1], 'comp keys', Object.keys(comp).join(','))
  const c0 = comp.competitors[0]
  console.log('  competitor keys', Object.keys(c0).join(','))
  if (!c0.roster) { console.log('  no roster ref'); continue }
  const ro = (await getJson(fix(c0.roster.$ref))).json
  const ents = ro.entries || []
  console.log('  roster entries', ents.length, 'keys', ents[0] ? Object.keys(ents[0]).join(',') : '', 'didNotPlay', ents.filter(x=>x.didNotPlay).length, 'starters', ents.filter(x=>x.starter).length)
  const sk = ents.find(x=>x.position?.$ref && x.statistics) || ents[0]
  if (sk?.statistics) {
    const st = (await getJson(fix(sk.statistics.$ref))).json
    const cats = st.splits?.categories || []
    console.log('  athlete', sk.playerId, 'stat cats', cats.map(c=>`${c.name}[${c.stats.filter(s=>s.value!==0&&s.value!=null).map(s=>s.abbreviation+'='+s.value).join(' ')}]`).join(' ').slice(0,900))
  }
}
