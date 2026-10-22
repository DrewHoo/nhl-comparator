import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const seasons = [[1917,'MTL'],[1926,'MTL'],[1933,'MTL'],[1942,'MTL'],[1950,'MTL'],[1959,'MTL'],[1967,'MTL'],[1972,'MTL'],[1979,'MTL'],[1987,'MTL'],[1997,'MTL'],[2005,'MTL'],[2010,'MTL'],[2017,'WSH'],[2024,'MTL']]
for (const [y,t] of seasons) {
  const s = `${y}${y+1}`
  const r = await getJson(`https://api-web.nhle.com/v1/club-schedule-season/${t}/${s}`)
  const g = r.json?.games || []
  const byType = {}
  for (const x of g) (byType[x.gameType] ||= []).push(x.id)
  console.log(s, t, r.status, Object.entries(byType).map(([k,v])=>`type${k}:${v.length} first=${v[0]} last=${v[v.length-1]}`).join(' | '))
}
