// The NHL stats REST (api.nhle.com/stats/rest/en), the ledger's source for every
// season since 1917-18. Per-game rows come back in bulk (`isGame=true&limit=-1`)
// but every query is capped at 10,000 rows, so the skater report is windowed by
// game id (at most WINDOW games a query; a modern game has ~40 skater rows). The
// harvester and the ledger builder share these URL makers so a cached response
// is found by the same URL it was fetched by.
import { get, getJson } from '../../research/lib/fetch.mjs'

export const REST = 'https://api.nhle.com/stats/rest/en'
export const RECORDS = 'https://records.nhl.com/site/api'
/** games per skater query: 180 × ~40 rows stays under the 10,000-row cap */
export const WINDOW = 180

const sortBy = (props) => encodeURIComponent(JSON.stringify(props.map((p) => ({ property: p, direction: 'ASC' }))))
const exp = (s) => encodeURIComponent(s)

export const seasonsUrl = () => `${REST}/season`
export const gamesUrl = (season) => `${REST}/game?cayenneExp=season=${season}`
export const teamsUrl = () => `${REST}/team`
export const franchisesUrl = () => `${RECORDS}/franchise`

/** every skater row of the games with ids in [lo, hi] */
export const skaterWindowUrl = (season, type, lo, hi) =>
  `${REST}/skater/summary?isAggregate=false&isGame=true&limit=-1&sort=${sortBy(['gameId', 'playerId'])}&cayenneExp=${exp(`seasonId=${season} and gameTypeId=${type} and gameId>=${lo} and gameId<=${hi}`)}`
/** every goalie row of a season and game type (well under the cap) */
export const goalieSeasonUrl = (season, type) =>
  `${REST}/goalie/summary?isAggregate=false&isGame=true&limit=-1&sort=${sortBy(['gameId', 'playerId'])}&cayenneExp=${exp(`seasonId=${season} and gameTypeId=${type}`)}`
/** every team-game row of a season and game type */
export const teamSeasonUrl = (season, type) =>
  `${REST}/team/summary?isAggregate=false&isGame=true&limit=-1&sort=${sortBy(['gameId', 'teamId'])}&cayenneExp=${exp(`seasonId=${season} and gameTypeId=${type}`)}`

/** the season ids the league lists, ascending (19171918 … ), with their rows */
export async function seasons() {
  const r = await getJson(seasonsUrl())
  return r.json.data.sort((a, b) => a.id - b.id)
}

/** a season's game list, final games only (gameStateId 7), regular season and playoffs */
export async function games(season) {
  const r = await getJson(gamesUrl(season))
  return r.json.data.filter((g) => g.gameStateId === 7 && (g.gameType === 2 || g.gameType === 3)).sort((a, b) => a.id - b.id)
}

/** the skater windows of a season: [type, lo, hi][] over the played game ids */
export function skaterWindows(gameList) {
  const out = []
  for (const type of [2, 3]) {
    const ids = gameList.filter((g) => g.gameType === type).map((g) => g.id)
    for (let i = 0; i < ids.length; i += WINDOW) out.push([type, ids[i], ids[Math.min(i + WINDOW, ids.length) - 1]])
  }
  return out
}

/** a bulk query's rows; throws if the cap was hit, so a window never silently drops rows */
export async function rows(url, opts) {
  const r = await getJson(url, opts)
  if (!r.json) throw new Error(`not JSON: ${url} (${r.status})`)
  const data = r.json.data ?? []
  if (data.length >= 10000 || r.json.total >= 10000) throw new Error(`10,000-row cap hit: ${url}`)
  return data
}
