import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const S='https://api.nhle.com/stats/rest/en'
const SORT='sort=%5B%7B%22property%22:%22gameId%22,%22direction%22:%22ASC%22%7D%5D'
const out = []
for (const rep of ['skater/summary','goalie/summary','skater/realtime','skater/timeonice','team/summary']) {
  for (const s of ['19171918','19501951','19791980','19971998','20052006','20102011']) {
    const u = `${S}/${rep}?isAggregate=false&isGame=true&limit=50&start=0&${SORT}&cayenneExp=seasonId=${s}%20and%20gameTypeId=2`
    const r = await getJson(u)
    const d = r.json?.data || []
    const keys = d[0] ? Object.keys(d[0]) : []
    const nn = keys.filter(k => d.some(x => x[k] !== null && x[k] !== 0)).join(',')
    const allnull = keys.filter(k => d.every(x => x[k] === null)).join(',')
    console.log(rep, s, r.status, 'total', r.json?.total, 'rows', d.length, '| nonzero:', nn, '| allnull:', allnull)
  }
}
