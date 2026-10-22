import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const S='https://api.nhle.com/stats/rest/en'
const SORT='sort=%5B%7B%22property%22:%22seasonId%22,%22direction%22:%22ASC%22%7D%5D'
const q = [
 ['skater/summary','shGoals>0'],['skater/summary','shots>0'],['skater/summary','plusMinus<0'],['skater/summary','gameWinningGoals>0'],['skater/summary','otGoals>0'],['skater/summary','faceoffWinPct>0'],['skater/summary','timeOnIcePerGame>0'],['skater/summary','evGoals>0'],
 ['skater/realtime','hits>0'],['skater/realtime','blockedShots>0'],['skater/realtime','giveaways>0'],['skater/realtime','takeaways>0'],['skater/realtime','missedShots>0'],['skater/realtime','emptyNetGoals>0'],
 ['skater/timeonice','shifts>0'],
 ['goalie/summary','shotsAgainst>0'],['goalie/summary','shutouts>0'],['goalie/summary','otLosses>0'],['goalie/summary','ties>0'],['goalie/summary','gamesStarted>0'],
]
for (const [rep, ex] of q) {
  const u = `${S}/${rep}?isAggregate=false&isGame=false&limit=1&${SORT}&cayenneExp=gameTypeId=2%20and%20${encodeURIComponent(ex)}`
  const r = await getJson(u)
  const d = r.json?.data?.[0]
  console.log(rep, ex, r.status, d ? `${d.seasonId} ${d.skaterFullName||d.goalieFullName} ${ex.split(/[<>]/)[0]}=${d[ex.split(/[<>]/)[0]]}` : JSON.stringify(r.json).slice(0,200))
}
