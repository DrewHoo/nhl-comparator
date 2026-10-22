// Builds the ledgers the site reads from the raw cache the harvester filled:
// per player, every game he dressed for, in order, with the result, the
// team's game number that season and his line. Two files under src/data/
// (committed; the site builds without the cache): skaters.json and
// goalies.json, each player's columns packed as strings (src/lib/pack.ts;
// src/lib/ledger.ts decodes them). Known-answer gates run before the write.
//
//   OFFLINE=1 node pipeline/build-ledger.mjs                 # the whole ledger from the cache
//   OFFLINE=1 node pipeline/build-ledger.mjs --seasons 1917-1930   # a slice, for a check (writes nothing)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getJson } from '../research/lib/fetch.mjs'
import { seasons as seasonTable, gamesUrl, teamsUrl, skaterWindows, skaterWindowUrl, goalieSeasonUrl, teamSeasonUrl, rows } from './lib/rest.mjs'
import { pack } from '../src/lib/pack.ts'
import { CORE, EXTRA, SKATER_CORE, SKATER_EXTRA, GOALIE_COLS, DELTA } from '../src/lib/ledger.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src/data')
const args = process.argv.slice(2)
const only = args.includes('--seasons') ? args[args.indexOf('--seasons') + 1].split('-').map(Number) : null
const ymd = (s) => Number(s.slice(0, 10).replace(/-/g, ''))
const startYear = (seasonId) => Math.floor(seasonId / 10000)
const num = (v) => (v == null ? 0 : Number(v))

// --- teams: the league's team id -> the code of the day
const teamRows = (await getJson(teamsUrl())).json.data
const triOf = new Map(teamRows.map((t) => [t.id, t.triCode]))
const teams = [] // index -> code
const teamIdx = new Map()
const tix = (code) => { if (!teamIdx.has(code)) { teamIdx.set(code, teams.length); teams.push(code) } return teamIdx.get(code) }

// --- people: birth dates from Wikidata (data/ref/people.json)
const people = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ref/people.json'), 'utf8')).people

const table = await seasonTable()
const list = table.map((s) => s.id).filter((id) => id !== 20042005 && (!only || (startYear(id) >= only[0] && startYear(id) <= only[1])))
const firstSeason = startYear(list[0]), currentSeason = startYear(list[list.length - 1])

const skaters = new Map() // pid -> { name, pos: Map, rows: [] }
const goalies = new Map()
const teamGames = {} // code -> startYear -> [reg, all]
const resultCode = (w, l, t, otl) => (num(w) ? 2 : num(otl) ? 3 : num(t) ? 1 : num(l) ? 0 : -1)
const warn = []
const excluded = [] // games against a team the NHL's team table doesn't list (non-NHL Stanley Cup opponents)
const defaulted = [] // listed games with no player rows (defaults and forfeits)
let nGames = 0

for (const seasonId of list) {
  const sy = startYear(seasonId)
  const srow = table.find((s) => s.id === seasonId)
  const listed = (await getJson(gamesUrl(seasonId))).json.data
    .filter((g) => (g.gameStateId === 7 || g.gameStateId === 6) && (g.gameType === 2 || g.gameType === 3))
    .sort((a, b) => a.id - b.id)
  // the skater rows first: a listed game nobody played (the 1917-18 Wanderers defaults) is not a game
  const skaterRows = []
  for (const [type, lo, hi] of skaterWindows(listed)) skaterRows.push(...await rows(skaterWindowUrl(seasonId, type, lo, hi)))
  const played = new Set(skaterRows.map((r) => r.gameId))
  const glist = listed.filter((g) => { if (played.has(g.id)) return true; defaulted.push({ id: g.id, season: sy, date: g.gameDate }); return false })
  const reg = glist.filter((g) => g.gameType === 2).length
  if (srow && srow.totalRegularSeasonGames && reg !== srow.totalRegularSeasonGames && seasonId !== list[list.length - 1]) warn.push(`${sy}: ${reg} regular-season games in the list, season table says ${srow.totalRegularSeasonGames}`)
  // the game: date, type, both codes
  const game = new Map()
  const perTeam = new Map() // code -> [{ id, date, post }]
  for (const g of glist) {
    const home = triOf.get(g.homeTeamId), away = triOf.get(g.visitingTeamId)
    // the early Stanley Cup Finals against the PCHA and WCHL (1918-1926) are in the list with a non-NHL opponent; they sit out, and the Method says so
    if (!home || !away) { excluded.push({ id: g.id, season: sy, date: g.gameDate, homeTeamId: g.homeTeamId, visitingTeamId: g.visitingTeamId }); continue }
    const rec = { id: g.id, date: ymd(g.gameDate), post: g.gameType === 3 ? 1 : 0, home, away, hs: g.homeScore, vs: g.visitingScore, result: {} }
    game.set(g.id, rec)
    for (const code of [home, away]) (perTeam.get(code) ?? perTeam.set(code, []).get(code)).push(rec)
  }
  nGames += glist.length
  // the team's game number that season: regular season by date, then the playoffs
  const tgnOf = new Map() // `${gameId}|${code}` -> n
  for (const [code, gs] of perTeam) {
    gs.sort((a, b) => a.post - b.post || a.date - b.date || a.id - b.id)
    gs.forEach((g, i) => tgnOf.set(`${g.id}|${code}`, i + 1))
    ;(teamGames[code] ??= {})[sy] = [gs.filter((g) => !g.post).length, gs.length]
  }
  // results from the team rows (W / T / L / OTL), scores as the fallback
  for (const type of [2, 3]) for (const r of await rows(teamSeasonUrl(seasonId, type))) {
    const g = game.get(r.gameId); if (!g) continue
    const code = r.homeRoad === 'H' ? g.home : g.away
    g.result[code] = resultCode(r.wins, r.losses, r.ties, r.otLosses)
  }
  for (const g of game.values()) for (const code of [g.home, g.away]) {
    if (g.result[code] == null || g.result[code] < 0) {
      const mine = code === g.home ? g.hs : g.vs, theirs = code === g.home ? g.vs : g.hs
      g.result[code] = mine > theirs ? 2 : mine < theirs ? 0 : 1
    }
  }
  // a row's common fields, in ROW order (season, post, date, home, team, opp, result, tgn), then its stats
  const common = (r, g) => {
    const code = r.teamAbbrev, opp = r.opponentTeamAbbrev
    const expect = r.homeRoad === 'H' ? g.home : g.away
    if (code !== expect) warn.push(`${sy}: row says ${code} ${r.homeRoad} in ${r.gameId}, the game list says ${expect}`)
    return [sy, g.post, g.date, r.homeRoad === 'H' ? 1 : 0, tix(code), tix(opp), g.result[code] ?? -1, tgnOf.get(`${r.gameId}|${code}`) ?? 0]
  }
  const ROW = ['season', 'post', 'date', 'home', 'team', 'opp', 'result', 'tgn']
  // skaters
  for (const r of skaterRows) {
    const g = game.get(r.gameId); if (!g) continue
    if (r.positionCode === 'G') continue
    const p = skaters.get(r.playerId) ?? skaters.set(r.playerId, { name: r.skaterFullName, pos: new Map(), rows: [] }).get(r.playerId)
    p.name = r.skaterFullName
    p.pos.set(r.positionCode, (p.pos.get(r.positionCode) ?? 0) + 1)
    p.rows.push([r.gameId, ...common(r, g), num(r.goals), num(r.assists), num(r.penaltyMinutes), num(r.shots), num(r.plusMinus), num(r.ppGoals), num(r.shGoals), num(r.gameWinningGoals)])
  }
  // goalies
  for (const type of [2, 3]) for (const r of await rows(goalieSeasonUrl(seasonId, type))) {
    const g = game.get(r.gameId); if (!g) continue
    const p = goalies.get(r.playerId) ?? goalies.set(r.playerId, { name: r.goalieFullName, pos: new Map([['G', 1]]), rows: [] }).get(r.playerId)
    p.name = r.goalieFullName
    // a shots-against of 0 against a goal is a placeholder (the league recorded saves from 1955-56), not a value
    const sa = r.shotsAgainst == null || (num(r.shotsAgainst) === 0 && num(r.goalsAgainst) > 0) ? -1 : num(r.shotsAgainst)
    const sv = sa < 0 ? -1 : r.saves == null ? sa - num(r.goalsAgainst) : num(r.saves)
    p.rows.push([r.gameId, ...common(r, g), num(r.gamesStarted), resultCode(r.wins, r.losses, r.ties, r.otLosses), num(r.goalsAgainst), sa, sv, num(r.shutouts), num(r.timeOnIce)])
  }
  console.log(`${sy}: ${glist.length} games (${reg} regular), ${skaters.size} skaters so far, ${goalies.size} goalies`)
}
if (defaulted.length) console.log(`\n${defaulted.length} listed games with no player rows dropped: ${defaulted.map((g) => `${g.id} (${g.date})`).join(', ')}`)
if (excluded.length) console.log(`\n${excluded.length} games against non-NHL opponents excluded (${excluded.map((g) => g.season).filter((v, i, a) => a.indexOf(v) === i).join(', ')})`)
if (warn.length) { console.log(`\n${warn.length} warnings:`); for (const w of warn.slice(0, 40)) console.log('  ' + w) }

// --- the files
const sortRows = (rows) => rows.sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[0] - b[0]) // season, post, date, gameId
function build(kind, map, coreCols, extraCols) {
  const cols = [...CORE, ...coreCols, ...EXTRA, ...extraCols]
  const coreSet = new Set([...CORE, ...coreCols])
  const statCols = [...coreCols, ...extraCols]
  const players = []
  for (const [id, p] of map) {
    sortRows(p.rows)
    const pos = [...p.pos].sort((a, b) => b[1] - a[1])[0][0]
    const rowIx = (k) => { const i = ['season', 'post', 'date', 'home', 'team', 'opp', 'result', 'tgn', ...statCols].indexOf(k); if (i < 0) throw new Error(`no column ${k}`); return i + 1 }
    const c = {}
    for (const k of cols) c[k] = pack(p.rows.map((r) => r[rowIx(k)]), DELTA.has(k))
    players.push({ id, name: p.name, born: people[String(id)]?.born ?? null, pos, debut: p.rows[0][1], n: p.rows.length, c, _rows: p.rows })
  }
  players.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
  // floors: the first regular season a column has a value (a few early playoff rows carry stats the regular season lacks)
  const floors = {}
  const floorOf = (k, test) => { let first = Infinity; const i = ['season', 'post', 'date', 'home', 'team', 'opp', 'result', 'tgn', ...statCols].indexOf(k) + 1; for (const p of players) for (const r of p._rows) { if (r[2] !== 0) continue; if (test(r[i])) { if (r[1] < first) first = r[1]; break } }; return first === Infinity ? firstSeason : first }
  for (const k of statCols) floors[k] = floorOf(k, (k === 'sa' || k === 'sv') ? (v) => v > 0 : k === 'dec' ? (v) => v >= 0 : (v) => v !== 0)
  if (statCols.includes('dec')) floors.otl = floorOf('dec', (v) => v === 3)
  return { v: 3, builtAt: new Date().toISOString(), firstSeason, currentSeason, kind, cols, coreCols: cols.filter((c) => coreSet.has(c)), extraCols: cols.filter((c) => !coreSet.has(c)), teams, teamGames, floors, players }
}
const S = build('skaters', skaters, SKATER_CORE, SKATER_EXTRA)
const G = build('goalies', goalies, GOALIE_COLS, [])
console.log('\nfloors', S.floors, G.floors)

/** the core file, and the extra file when the ledger splits (skaters) */
function writeFiles(f) {
  const pick = (c, keys) => Object.fromEntries(keys.map((k) => [k, c[k]]))
  const split = f.kind === 'skaters'
  const coreCols = split ? f.coreCols : f.cols
  const { coreCols: _c, extraCols: _e, ...meta } = f
  const core = { ...meta, cols: coreCols, players: f.players.map(({ _rows, c, ...p }) => ({ ...p, c: pick(c, coreCols) })) }
  const file = path.join(OUT, `${f.kind}.json`)
  fs.writeFileSync(file, JSON.stringify(core))
  console.log(`${file}: ${f.players.length} players, ${f.players.reduce((s, p) => s + p.n, 0).toLocaleString()} rows, ${(fs.statSync(file).size / 1048576).toFixed(1)} MB`)
  if (split) {
    const extra = { v: 3, kind: f.kind, cols: f.extraCols, players: f.players.map(({ id, c }) => ({ id, c: pick(c, f.extraCols) })) }
    const xfile = path.join(OUT, `${f.kind}-x.json`)
    fs.writeFileSync(xfile, JSON.stringify(extra))
    console.log(`${xfile}: ${(fs.statSync(xfile).size / 1048576).toFixed(1)} MB`)
  }
}

// --- the gates: the league's own milestones, from research/factoids-and-conventions.md and the API probes
const at = (file, id) => file.players.find((p) => p.id === id)
const ci = (file, k) => ['season', 'post', 'date', 'home', 'team', 'opp', 'result', 'tgn', ...(file.kind === 'skaters' ? [...SKATER_CORE, ...SKATER_EXTRA] : GOALIE_COLS)].indexOf(k) + 1
const pts = (file, r) => r[ci(file, 'g')] + r[ci(file, 'a')]
const reach = (p, file, col, target, { season = null } = {}) => {
  let cum = 0, n = 0
  for (const r of p._rows) {
    if (r[2] !== 0) continue // regular season
    if (season != null && r[1] !== season) continue
    n++; cum += col === 'p' ? pts(file, r) : r[ci(file, col)]
    if (cum >= target) return { n, date: r[3], tgn: r[8] }
  }
  return null
}
const sum = (p, file, col, season) => p._rows.filter((r) => r[2] === 0 && r[1] === season).reduce((s, r) => s + (col === 'p' ? pts(file, r) : r[ci(file, col)]), 0)
const gp = (p, season) => p._rows.filter((r) => r[2] === 0 && r[1] === season).length
const gates = []
const gate = (name, ok, got) => { gates.push([name, ok, got]); if (!ok) console.error(`GATE FAILED: ${name}: got ${JSON.stringify(got)}`) }
if (!only) {
  const gretzky = at(S, 8447400), richard = at(S, 8448321), lemieux = at(S, 8448782), howe = at(S, 8448000), orr = at(S, 8450070), mcdavid = at(S, 8478402), ovechkin = at(S, 8471214), brodeur = at(G, 8455710)
  let r
  r = reach(gretzky, S, 'g', 50, { season: 1981 }); gate("Gretzky's 50th goal of 1981-82 in his and EDM's 39th game, 1981-12-30", r && r.n === 39 && r.tgn === 39 && r.date === 19811230, r)
  r = reach(richard, S, 'g', 50, { season: 1944 }); gate("Richard's 50th goal of 1944-45 in game 50, 1945-03-18", r && r.n === 50 && r.tgn === 50 && r.date === 19450318, r)
  r = reach(lemieux, S, 'g', 50, { season: 1988 }); gate("Lemieux's 50th goal of 1988-89 in his 44th game, PIT's 46th", r && r.n === 44 && r.tgn === 46, r)
  gate('Howe 1952-53: 70 GP, 49 G, 95 P', gp(howe, 1952) === 70 && sum(howe, S, 'g', 1952) === 49 && sum(howe, S, 'p', 1952) === 95, [gp(howe, 1952), sum(howe, S, 'g', 1952), sum(howe, S, 'p', 1952)])
  gate('Orr 1970-71: +124', sum(orr, S, 'pm', 1970) === 124, sum(orr, S, 'pm', 1970))
  r = reach(mcdavid, S, 'p', 1000); gate("McDavid's 1,000th point in his 659th game, 2024-11-14", r && r.n === 659 && r.date === 20241114, r)
  r = reach(ovechkin, S, 'g', 895); gate("Ovechkin's 895th goal in his 1,487th game, 2025-04-06", r && r.n === 1487 && r.date === 20250406, r)
  const gReg = gretzky._rows.filter((x) => x[2] === 0)
  gate('Gretzky career: 1,487 GP, 894 G, 2,857 P (Hockey Databank)', gReg.length === 1487 && gReg.reduce((s, x) => s + x[ci(S, 'g')], 0) === 894 && gReg.reduce((s, x) => s + pts(S, x), 0) === 2857, [gReg.length, gReg.reduce((s, x) => s + x[ci(S, 'g')], 0), gReg.reduce((s, x) => s + pts(S, x), 0)])
  const bw = brodeur._rows.filter((x) => x[2] === 0 && x[ci(G, 'dec')] === 2).length
  gate('Brodeur: 691 regular-season wins', bw === 691, bw)
  gate('floors: shots and plus-minus 1959-60, PP and SH goals 1933-34, saves 1955-56, OT losses 2005-06, decisions 1917-18', S.floors.s === 1959 && S.floors.pm === 1959 && S.floors.ppg === 1933 && S.floors.shg === 1933 && G.floors.sa === 1955 && G.floors.otl === 2005 && G.floors.dec === 1917, [S.floors, G.floors])
  const failed = gates.filter((g) => !g[1])
  console.log(`\ngates: ${gates.length - failed.length} of ${gates.length} pass`)
  if (failed.length) { process.exitCode = 1; console.error('ledger not written'); process.exit(1) }
  fs.mkdirSync(OUT, { recursive: true })
  writeFiles(S); writeFiles(G)
} else {
  console.log(`slice: ${nGames} games, ${S.players.length} skaters, ${G.players.length} goalies; ${args.includes('--write') ? 'written for a smoke test (NOT the real ledger)' : 'nothing written'}`)
  if (args.includes('--write')) {
    fs.mkdirSync(OUT, { recursive: true })
    writeFiles(S); writeFiles(G)
  }
  const top = S.players.slice(0, 3).map((p) => `${p.name} ${p.n} GP ${p._rows.reduce((s, r) => s + r[ci(S, 'g')], 0)} G`)
  console.log(top.join(' · '))
}
