// The named definition pages: a curated set of queries, each at its own
// path (/fastest-to-1000-points/), prerendered as the board on that query
// with an h1 worded the way people ask it. The board is the same board; the
// path is the query's canonical address. The default query is the root page
// and must not appear here (landing.test pins it). Pure: strings and
// queries, no ledger, so the worker and the prerender can import it.
import { DEFAULT_QUERY, normalize, type Query } from './query.ts'
import { parseUrl, toUrl, type UrlState } from './url.ts'
import { cardHeading } from './share.ts'

export interface Landing {
  slug: string
  query: Query
  /** the h1, a question */
  h1: string
  /** the <title> before the site's name */
  title: string
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const Q = (patch: Partial<Query>): Query => normalize({ ...DEFAULT_QUERY, tests: [], ...patch })

// the slug, the query, the question; the title comes from the card heading
type R = [slug: string, query: Query, h1: string]
const ROWS: R[] = [
  // career windows: the root is points through 500 games
  ['most-points-in-first-100-games', Q({ n: 100 }), 'Who has the most points through his first 100 NHL games?'],
  ['most-points-in-first-1000-games', Q({ n: 1000 }), 'Who has the most points through his first 1,000 NHL games?'],
  ['most-goals-in-first-100-games', Q({ stat: 'g', n: 100 }), 'Who has the most goals through his first 100 NHL games?'],
  ['most-goals-in-first-500-games', Q({ stat: 'g', n: 500 }), 'Who has the most goals through his first 500 NHL games?'],
  ['most-assists-in-first-500-games', Q({ stat: 'a', n: 500 }), 'Who has the most assists through his first 500 NHL games?'],
  ['most-hat-tricks-in-first-500-games', Q({ stat: 'hat', n: 500 }), 'Who has the most hat tricks through his first 500 NHL games?'],
  ['most-points-by-a-defenseman-in-first-500-games', Q({ pos: 'D', n: 500 }), 'Which defenseman has the most points through his first 500 NHL games?'],
  ['most-wins-in-first-100-starts', Q({ pos: 'G', stat: 'win', seq: 'starts', n: 100 }), 'Which goalie has the most wins through his first 100 NHL starts?'],
  ['most-shutouts-in-first-200-games', Q({ pos: 'G', stat: 'so', n: 200 }), 'Which goalie has the most shutouts through his first 200 NHL games?'],
  // races
  ['fastest-to-1000-points', Q({ how: 'reach', n: 1000, dir: 'fewest' }), 'Who was the fastest to 1,000 NHL points?'],
  ['fastest-to-500-goals', Q({ how: 'reach', stat: 'g', n: 500, dir: 'fewest' }), 'Who was the fastest to 500 NHL goals?'],
  ['fastest-to-100-goals', Q({ how: 'reach', stat: 'g', n: 100, dir: 'fewest' }), 'Who was the fastest to 100 NHL goals?'],
  ['fastest-to-500-assists', Q({ how: 'reach', stat: 'a', n: 500, dir: 'fewest' }), 'Who was the fastest to 500 NHL assists?'],
  ['fastest-defenseman-to-100-points', Q({ pos: 'D', how: 'reach', n: 100, dir: 'fewest' }), 'Which defenseman was the fastest to 100 NHL points?'],
  ['fastest-goalie-to-100-wins', Q({ pos: 'G', how: 'reach', stat: 'win', n: 100, dir: 'fewest' }), 'Which goalie was the fastest to 100 NHL wins?'],
  // first seasons (not rookie seasons: Gretzky's first NHL season follows a WHA year, so the league's rookie records skip him)
  ['most-points-in-a-first-nhl-season', Q({ seq: 'seasons', n: 1 }), 'Who scored the most points in his first NHL season?'],
  ['most-goals-in-a-first-nhl-season', Q({ stat: 'g', seq: 'seasons', n: 1 }), 'Who scored the most goals in his first NHL season?'],
  ['most-points-in-first-3-seasons', Q({ seq: 'seasons', n: 3 }), 'Who scored the most points in his first three NHL seasons?'],
  // season starts: the 50-in-50 family
  ['fastest-to-50-goals-from-the-start-of-a-season', Q({ how: 'reach', stat: 'g', n: 50, seq: 'teamGames', dir: 'fewest' }), 'Who scored 50 goals in the fewest games from the start of an NHL season?'],
  ['fastest-to-100-points-from-the-start-of-a-season', Q({ how: 'reach', n: 100, seq: 'teamGames', dir: 'fewest' }), 'Who reached 100 points in the fewest games from the start of an NHL season?'],
  ['most-goals-in-first-50-games-of-a-season', Q({ stat: 'g', seq: 'teamGames', n: 50 }), "Who scored the most goals in a team's first 50 games of an NHL season?"],
  ['most-points-in-first-41-games-of-a-season', Q({ seq: 'teamGames', n: 41 }), "Who had the most points at the halfway mark of an NHL season (a team's first 41 games)?"],
  ['most-hat-tricks-in-first-41-games-of-a-season', Q({ stat: 'hat', seq: 'teamGames', n: 41 }), "Who had the most hat tricks in a team's first 41 games of an NHL season?"],
]

export const LANDINGS: Landing[] = ROWS.map(([slug, query, h1]) => ({ slug, query, h1, title: `${cap(cardHeading(query))} in NHL history (since 1917-18)` }))

/** the query's canonical spelling, the one toUrl writes; two queries are the same when these match */
export const queryKey = (q: Query) => toUrl({ query: q, open: null })

const bySlug = new Map(LANDINGS.map((l) => [l.slug, l]))
const byKey = new Map(LANDINGS.map((l) => [queryKey(l.query), l]))

/** the landing at a path relative to the site's base; null for the root and everything else */
export const landingFromPath = (rel: string): Landing | null => bySlug.get(rel.replace(/^\/+|\/+$/g, '')) ?? null

/** the landing a board is on, when its query has one */
export const landingFor = (q: Query): Landing | null => byKey.get(queryKey(q)) ?? null

export interface Location extends UrlState { landing: Landing | null }

/** the state of an address: the landing's query when the path names one (the search can still move slots and open a player), else the search alone */
export function parseLocation(rel: string, search: string): Location {
  const landing = landingFromPath(rel)
  const s = parseUrl(search, landing?.query ?? DEFAULT_QUERY)
  return { ...s, landing: landingFor(s.query) }
}

/** the address of a state, relative to the site's base: the landing's path when the query has one (only `t` and `vs` ride along), else the root with the query's params */
export function toAddress(state: UrlState): string {
  const l = landingFor(state.query)
  if (!l) return toUrl(state)
  const p = new URLSearchParams()
  if (state.open) p.set('t', state.open)
  if (state.open && state.vs) p.set('vs', state.vs)
  const s = p.toString()
  return `${l.slug}/${s ? `?${s}` : ''}`
}
