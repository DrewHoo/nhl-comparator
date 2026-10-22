import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
import { writeFileSync } from 'node:fs'
const seasons = [[1917,'MTL'],[1926,'MTL'],[1933,'MTL'],[1942,'MTL'],[1950,'MTL'],[1959,'MTL'],[1967,'MTL'],[1972,'MTL'],[1979,'MTL'],[1987,'MTL'],[1997,'MTL'],[2005,'MTL'],[2010,'MTL'],[2017,'WSH'],[2024,'MTL']]
const B = 'https://api-web.nhle.com/v1/'
const toiSec = (t) => { if (!t) return 0; const [m,s]=t.split(':').map(Number); return m*60+s }
function pop(rows, fields) {
  const o = {}
  for (const f of fields) {
    const vals = rows.map(r => r[f])
    const present = vals.filter(v => v !== undefined)
    if (!present.length) { o[f] = 'absent'; continue }
    const nz = present.filter(v => v !== null && v !== 0 && v !== '0/0' && v !== '00:00' && v !== '' && v !== 0.0 && v !== false)
    o[f] = nz.length ? `pop(${nz.length}/${present.length})` : (present.every(v=>v===null)?'null':'zero')
  }
  return o
}
const SK = ['goals','assists','points','plusMinus','pim','hits','powerPlayGoals','sog','faceoffWinningPctg','toi','blockedShots','shifts','giveaways','takeaways']
const GO = ['evenStrengthShotsAgainst','saveShotsAgainst','goalsAgainst','toi','starter','shotsAgainst','saves','savePctg','decision','pim']
const out = {}
for (const [y,t] of seasons) {
  const s = `${y}${y+1}`
  const sch = (await getJson(`${B}club-schedule-season/${t}/${s}`)).json.games
  const reg = sch.find(g=>g.gameType===2), po = sch.find(g=>g.gameType===3)
  const rec = { season: s, team: t }
  for (const [lbl, g] of [['reg',reg],['po',po]]) {
    const r = await getJson(`${B}gamecenter/${g.id}/boxscore`)
    const d = r.json, p = d.playerByGameStats || {}
    const sk = [], gl = []
    let teamRows = {}
    for (const side of ['homeTeam','awayTeam']) {
      const T = p[side] || {}
      const skaters = [...(T.forwards||[]),...(T.defense||[])]
      sk.push(...skaters); gl.push(...(T.goalies||[]))
      teamRows[d[side].abbrev] = { skaters: skaters.length, goalies: (T.goalies||[]).length, zeroToi: skaters.filter(x=>toiSec(x.toi)===0).length, score: d[side].score, sog: d[side].sog }
    }
    rec[lbl] = { id: g.id, date: d.gameDate, venue: d.venue?.default, status: r.status, teams: teamRows, skaterFields: pop(sk, SK), goalieFields: pop(gl, GO), goalieSample: gl.map(x=>({n:x.name?.default,toi:x.toi,starter:x.starter,sa:x.shotsAgainst,sv:x.saves,ga:x.goalsAgainst,dec:x.decision})), outcome: d.gameOutcome, keys: Object.keys(d) }
    if (lbl==='reg') {
      const mine = p[d.homeTeam.abbrev===t?'homeTeam':'awayTeam']
      const sks = [...mine.forwards,...mine.defense].sort((a,b)=>b.points-a.points || toiSec(b.toi)-toiSec(a.toi))
      rec.skater = { id: sks[0].playerId, name: sks[0].name.default }
      const gs = [...mine.goalies].sort((a,b)=>toiSec(b.toi)-toiSec(a.toi))
      rec.goalie = gs[0] ? { id: gs[0].playerId, name: gs[0].name.default } : null
    }
  }
  for (const who of ['skater','goalie']) {
    if (!rec[who]) continue
    for (const gt of [2,3]) {
      const r = await getJson(`${B}player/${rec[who].id}/game-log/${s}/${gt}`)
      const gl = r.json?.gameLog || []
      const fields = gl[0] ? Object.keys(gl[0]) : []
      rec[who][`log${gt}`] = { status: r.status, games: gl.length, fields: pop(gl, fields.filter(f=>!['gameId','teamAbbrev','homeRoadFlag','gameDate','commonName','opponentCommonName','opponentAbbrev'].includes(f))) }
    }
  }
  out[s] = rec
  console.log(JSON.stringify(rec))
}
writeFileSync('/Users/drewhoo/Projects/nhl-comparator/research/league-apis/scratch/p1_box.out.json', JSON.stringify(out, null, 1))
