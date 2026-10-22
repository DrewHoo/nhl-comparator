import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const B='https://api-web.nhle.com/v1/'
const nz = (rows,f)=>rows.filter(r=>r[f]!==undefined && r[f]!==0 && r[f]!=='00:00' && r[f]!==null).length
for (const id of [1955020005,1958020005,1996020005,2001020005,1917020037,1959040013]) {
  const r = await getJson(`${B}gamecenter/${id}/boxscore`)
  if (r.status!==200) { console.log(id, r.status); continue }
  const p=r.json.playerByGameStats||{}; const sk=[], gl=[]
  for (const s of ['homeTeam','awayTeam']) { sk.push(...(p[s]?.forwards||[]),...(p[s]?.defense||[])); gl.push(...(p[s]?.goalies||[])) }
  console.log(id, r.json.gameDate, r.json.gameType, r.json.awayTeam.abbrev,'@',r.json.homeTeam.abbrev, 'sk',sk.length, ['sog','plusMinus','toi','hits','blockedShots','giveaways','takeaways','shifts','faceoffWinningPctg','powerPlayGoals'].map(f=>`${f}:${nz(sk,f)}`).join(' '), '| G', gl.map(g=>`${g.name.default} sa=${g.shotsAgainst} sv=${g.saves} dec=${g.decision} st=${g.starter}`).join('; '))
}
const q = (await getJson(`${B}club-schedule-season/MTL/20192020`)).json.games.filter(g=>g.gameType!==2)
console.log('MTL 2019-20 non-reg', q.map(g=>`${g.id}/t${g.gameType}/${g.gameDate}/${g.venue?.default}`).join(' '))
const ny = (await getJson(`${B}club-schedule-season/NYI/19931994`)).json.games.filter(g=>g.gameType===2)
const v={}; ny.forEach(g=>{ const k=`${g.homeTeam.abbrev}@${g.venue?.default}`; v[k]=(v[k]||0)+1 })
console.log('NYI 93-94 home@venue counts', JSON.stringify(v), 'neutralSite keys?', JSON.stringify(Object.keys(ny[0])))
const rr = await getJson(`${B}gamecenter/2024020006/right-rail`)
console.log('right-rail keys', Object.keys(rr.json||{}), JSON.stringify(rr.json?.gameInfo?.awayTeam?.scratches||rr.json?.gameInfo||'').slice(0,400))
const rr2 = await getJson(`${B}gamecenter/1950020005/right-rail`)
console.log('right-rail 1950', rr2.status, JSON.stringify(rr2.json?.gameInfo||'').slice(0,300))
const sd = await getJson(`${B}schedule/2024-10-10`)
console.log('schedule/date keys', Object.keys(sd.json), 'days', sd.json.gameWeek?.length, 'games', sd.json.gameWeek?.map(d=>d.numberOfGames).join(','), 'next', sd.json.nextStartDate)
const sd2 = await getJson(`${B}schedule/1950-10-15`)
console.log('schedule 1950', sd2.status, 'days', sd2.json?.gameWeek?.length, 'games', sd2.json?.gameWeek?.map(d=>d.numberOfGames).join(','), sd2.json?.nextStartDate)
