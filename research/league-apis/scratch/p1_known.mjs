import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const B='https://api-web.nhle.com/v1/'
const log = async (id,s,gt=2) => (await getJson(`${B}player/${id}/game-log/${s}/${gt}`)).json.gameLog.slice().sort((a,b)=>a.gameDate.localeCompare(b.gameDate))
const sched = async (t,s) => (await getJson(`${B}club-schedule-season/${t}/${s}`)).json.games.filter(g=>g.gameType===2)
function nth(gl, stat, n) { let c=0; for (let i=0;i<gl.length;i++){ c+=gl[i][stat]; if (c>=n) return {gp:i+1, g:gl[i], cum:c} } return {total:c, gp:gl.length} }
// Gretzky 81-82
let gl = await log(8447400,'19811982'); let x = nth(gl,'goals',50); let sc = await sched('EDM','19811982')
console.log('Gretzky', x.gp, x.g.gameDate, x.g.opponentAbbrev, 'goals that night', x.g.goals, 'EDM game#', sc.findIndex(g=>g.id===x.g.gameId)+1, 'season goals', gl.reduce((a,b)=>a+b.goals,0), 'gp', gl.length)
gl = await log(8448321,'19441945'); x = nth(gl,'goals',50); sc = await sched('MTL','19441945')
console.log('Richard', x.gp, x.g?.gameDate, x.g?.opponentAbbrev, x.g?.homeRoadFlag, 'MTL game#', sc.findIndex(g=>g.id===x.g?.gameId)+1, 'of', sc.length, 'season goals', gl.reduce((a,b)=>a+b.goals,0), 'gp', gl.length)
gl = await log(8448782,'19881989'); x = nth(gl,'goals',50); sc = await sched('PIT','19881989')
console.log('Lemieux', x.gp, x.g.gameDate, x.g.opponentAbbrev, 'PIT game#', sc.findIndex(g=>g.id===x.g.gameId)+1, 'season goals', gl.reduce((a,b)=>a+b.goals,0), 'gp', gl.length)
gl = await log(8448000,'19521953')
console.log('Howe 52-53', 'gp', gl.length, 'g', gl.reduce((a,b)=>a+b.goals,0), 'pts', gl.reduce((a,b)=>a+b.points,0))
gl = await log(8450070,'19701971')
console.log('Orr 70-71', 'gp', gl.length, 'pm', gl.reduce((a,b)=>a+(b.plusMinus??0),0), 'pts', gl.reduce((a,b)=>a+b.points,0), 'pm keys present', gl.filter(g=>'plusMinus' in g).length)
gl = await log(8455710,'20062007')
const dec = {}; gl.forEach(g=>dec[g.decision]=(dec[g.decision]||0)+1)
console.log('Brodeur 06-07', 'gp', gl.length, 'decisions', JSON.stringify(dec), 'SO', gl.reduce((a,b)=>a+b.shutouts,0))
gl = await log(8455710,'20032004'); const d2={}; gl.forEach(g=>d2[g.decision]=(d2[g.decision]||0)+1)
console.log('Brodeur 03-04 decisions', JSON.stringify(d2), 'keys', Object.keys(gl[0]).join(','))
const bl = (await getJson(`${B}player/8455710/landing`)).json
console.log('Brodeur career', JSON.stringify(bl.careerTotals?.regularSeason))
for (const [nm,id,stat,n] of [['McDavid',8478402,'points',1000],['Ovechkin',8471214,'goals',895]]) {
  const L = (await getJson(`${B}player/${id}/landing`)).json
  const nhl = L.seasonTotals.filter(s=>s.leagueAbbrev==='NHL' && s.gameTypeId===2 && s.season<20242025)
  const gp0 = nhl.reduce((a,b)=>a+b.gamesPlayed,0), s0 = nhl.reduce((a,b)=>a+b[stat],0)
  const g = await log(id,'20242025'); let c=s0, k=gp0, hit=null
  for (const r of g) { k++; c+=r[stat]; if (c>=n && !hit) { hit={date:r.gameDate,opp:r.opponentAbbrev,home:r.homeRoadFlag,careerGame:k,cum:c,that:r[stat]} } }
  console.log(nm, 'pre-2024-25 gp', gp0, stat, s0, 'hit', JSON.stringify(hit), 'career', JSON.stringify(L.careerTotals?.regularSeason))
}
