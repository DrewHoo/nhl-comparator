// Fills the raw cache with every per-game row the ledger needs, from the NHL
// stats REST, 1917-18 to the running season: the season table, each season's
// game list, the skater summary windowed by game id, the goalie summary and
// the team summary per season and game type, plus the team and franchise
// tables. Every request goes through research/lib/fetch.mjs (one per 1.5 s,
// cached forever). It builds no ledger; pipeline/build-ledger.mjs reads the
// cache by the same URLs.
//
//   node pipeline/harvest-rest.mjs --dry-run            # the request plan
//   node pipeline/harvest-rest.mjs                      # the full run, resumable
//   node pipeline/harvest-rest.mjs --refresh-season 20262027   # refetch the running season's list and windows
import { get } from '../research/lib/fetch.mjs'
import { seasons, games, gamesUrl, skaterWindows, skaterWindowUrl, goalieSeasonUrl, teamSeasonUrl, teamsUrl, franchisesUrl, rows } from './lib/rest.mjs'

const args = process.argv.slice(2)
const dry = args.includes('--dry-run')
const refreshArg = args.includes('--refresh-season') ? args[args.indexOf('--refresh-season') + 1] : null
const only = args.includes('--seasons') ? args[args.indexOf('--seasons') + 1].split('-').map(Number) : null

const t0 = Date.now()
const log = (s) => console.log(`${new Date().toISOString()} ${s}`)
let planned = 0, fetched = 0
const want = async (url, nocache = false) => {
  planned++
  if (dry) return null
  const r = await get(url, { nocache })
  if (!r.cached) fetched++
  return r
}

const all = await seasons()
const refresh = refreshArg == null ? null : refreshArg === 'current' ? all[all.length - 1].id : Number(refreshArg)
const list = all.map((s) => s.id).filter((id) => id !== 20042005 && (!only || (id >= only[0] * 10000 + only[0] + 1 && id <= only[1] * 10000 + only[1] + 1)))
log(`${list.length} seasons ${list[0]}..${list[list.length - 1]}${dry ? ' (dry run)' : ''}`)
await want(teamsUrl()); await want(franchisesUrl())

for (const season of list) {
  const fresh = refresh === season
  if (fresh) await get(gamesUrl(season), { nocache: true })
  const gl = dry ? await games(season).catch(() => []) : await games(season)
  const wins = skaterWindows(gl)
  const urls = [...wins.map(([t, lo, hi]) => skaterWindowUrl(season, t, lo, hi)), goalieSeasonUrl(season, 2), goalieSeasonUrl(season, 3), teamSeasonUrl(season, 2), teamSeasonUrl(season, 3)]
  for (const u of urls) {
    const r = await want(u, fresh)
    if (r && !dry) {
      const data = JSON.parse(r.text)
      if ((data.data?.length ?? 0) >= 10000) log(`STOP cap hit ${u}`)
    }
  }
  log(`${season}: ${gl.length} games, ${wins.length} skater windows, ${urls.length} requests${dry ? '' : ` (fetched so far ${fetched})`}`)
}
log(`end: ${planned} requests planned, ${fetched} fetched, ${((Date.now() - t0) / 60000).toFixed(1)} min`)
