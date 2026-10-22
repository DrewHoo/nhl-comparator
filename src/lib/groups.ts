// The team pages: the best forwards, defensemen or goalies in one
// franchise's history ("the Canadiens' best forwards"), from the ledgers. A
// franchise is a current team, and which team codes of the day belong to it
// is the ruling in data/ref/franchises.json (the NHL's 2026-09-24 ruling:
// the Jets include the first Jets and the Thrashers; the Coyotes are
// inactive), read here and nowhere else, so a new ruling is an edit to that
// file and a rebuild. A page is the position's metrics, every qualifying
// player's regular-season totals in his games for the franchise, ranked by
// the first metric, and the cumulative curve of each metric for the top
// few. Pure: the prerender computes it once and embeds the result in the
// page, so the client needs no ledger. The College Football Comparator's
// group pages, ported.
import type { Ledger, Player } from './ledger.ts'
import { groupOf } from './ledger.ts'
import { statByKey, statFloor, type StatKey } from './stats.ts'
import rulingFile from '../../data/ref/franchises.json' with { type: 'json' }

export type GroupPos = 'F' | 'D' | 'G'
export const GROUP_POS: GroupPos[] = ['F', 'D', 'G']

interface Ruling { version: string; franchises: Record<string, string>; codes: Record<string, string | null>; ranges: { code: string; from: number; to: number; franchise: string | null }[] }
const RULING = rulingFile as Ruling

/** the ruling's date, for the Method and the page's small print */
export const RULING_VERSION = RULING.version
/** the current franchises, by abbreviation, with their names */
export const FRANCHISES: { id: string; name: string }[] = Object.entries(RULING.franchises).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
export const franchiseName = (id: string): string | null => RULING.franchises[id] ?? null

/** the franchise a team code of the day played for in a season, or null (defunct, inactive, or not in the ruling) */
export function franchiseOf(code: string, season: number): string | null {
  for (const r of RULING.ranges) if (r.code === code && season >= r.from && season <= r.to) return r.franchise
  return RULING.codes[code] ?? null
}

/** the position's metrics, the first the one the page ranks by */
export const GROUP_METRICS: Record<GroupPos, StatKey[]> = {
  F: ['p', 'g', 'a'],
  D: ['p', 'a', 'g'],
  G: ['win', 'so'],
}

/** the position's slug in a page's address */
export const POS_SLUG: Record<GroupPos, string> = { F: 'forwards', D: 'defensemen', G: 'goalies' }
export const posFromSlug = (slug: string): GroupPos | null => (Object.entries(POS_SLUG).find(([, s]) => s === slug)?.[0] as GroupPos | undefined) ?? null
const POS_NOUN: Record<GroupPos, string> = { F: 'forwards', D: 'defensemen', G: 'goalies' }
const POS_ONE: Record<GroupPos, string> = { F: 'forward', D: 'defenseman', G: 'goalie' }

/** how many curves a chart draws */
export const CURVES = 8
/** games a player needs for the franchise to be listed: half a season */
export const MIN_GAMES = 41
/** the table lists this many at most */
export const TABLE_MAX = 200
/** a curve is sampled to this many points at most: the chart is 560 wide */
export const CURVE_POINTS = 160

export interface GroupRow {
  id: string
  name: string
  from: number
  to: number
  games: number
  /** per metric, the total over his games for the franchise; null when he played before the stat was recorded */
  totals: (number | null)[]
  /** per metric, the cumulative value at evenly spaced games (the last game always), for the top rows only */
  curves?: (number[] | null)[]
}

export interface GroupData {
  id: string
  name: string
  pos: GroupPos
  metrics: StatKey[]
  /** the franchise's first season in the ledger */
  since: number
  currentSeason: number
  /** every player with MIN_GAMES for the franchise */
  count: number
  /** the top TABLE_MAX of them, ranked by the first metric */
  rows: GroupRow[]
  ruling: string
}

const fmt = (n: number) => n.toLocaleString('en-US')
/** "the Canadiens'", "the Mammoth's" */
export const possessive = (name: string) => (name.endsWith('s') ? `${name}'` : `${name}'s`)
const season = (y: number) => `${y}-${String(y + 1).slice(2)}`

/** his regular-season games for the franchise */
function gamesFor(L: Ledger, p: Player, id: string): number[] {
  const out: number[] = []
  for (let i = 0; i < p.n; i++) if (p.col.post[i] === 0 && franchiseOf(L.teams[p.col.team[i]], p.col.season[i]) === id) out.push(i)
  return out
}

/** evenly spaced samples of a cumulative series, the last always kept */
const sample = (c: number[], n = CURVE_POINTS): number[] => (c.length <= n ? c : Array.from({ length: n }, (_, j) => c[Math.round((j * (c.length - 1)) / (n - 1))]))

/** the page's data for one franchise and position: skaters from the skaters' ledger, goalies from theirs */
export function groupData(L: Ledger, id: string, pos: GroupPos, { top = CURVES, minGames = MIN_GAMES } = {}): GroupData {
  if ((pos === 'G') !== (L.kind === 'goalies')) throw new Error(`groupData: ${pos} reads the ${pos === 'G' ? 'goalies' : 'skaters'}' ledger`)
  const name = franchiseName(id)
  if (!name) throw new Error(`groupData: no franchise ${id} in the ruling`)
  const metrics = GROUP_METRICS[pos]
  const stats = metrics.map((k) => statByKey(k))
  const floors = metrics.map((k) => statFloor(L, k))
  let since = L.currentSeason
  const rows: (GroupRow & { gs: number[]; p: Player })[] = []
  for (const p of L.players) {
    if (groupOf(p.pos) !== pos) continue
    const gs = gamesFor(L, p, id)
    if (!gs.length) continue
    since = Math.min(since, p.col.season[gs[0]])
    if (gs.length < minGames) continue
    const totals = stats.map((s, m) => { if (p.debut < floors[m]) return null; let t = 0; for (const i of gs) t += s.read(p, i); return t })
    rows.push({ id: String(p.id), name: p.name, from: p.col.season[gs[0]], to: p.col.season[gs[gs.length - 1]], games: gs.length, totals, gs, p })
  }
  rows.sort((a, b) => (b.totals[0] ?? -Infinity) - (a.totals[0] ?? -Infinity) || b.games - a.games || a.name.localeCompare(b.name))
  for (const r of rows.slice(0, top)) {
    r.curves = stats.map((s, m) => { if (r.totals[m] == null) return null; let cum = 0; return sample(r.gs.map((i) => (cum += s.read(r.p, i)))) })
  }
  return { id, name, pos, metrics, since, currentSeason: L.currentSeason, count: rows.length, rows: rows.slice(0, TABLE_MAX).map(({ gs, p, ...r }) => r), ruling: RULING.version }
}

export const groupPath = (id: string, pos: GroupPos): string => `/team/${id.toLowerCase()}/${POS_SLUG[pos]}/`

/** "The Montreal Canadiens' best forwards" */
export const groupH1 = (d: Pick<GroupData, 'name' | 'pos'>): string => `The ${possessive(d.name)} best ${POS_NOUN[d.pos]}`
/** "Best Montreal Canadiens forwards of all time (since 1917-18) · NHL Comparator" */
export const groupTitle = (d: Pick<GroupData, 'name' | 'pos' | 'since'>, site: string): string => `Best ${d.name} ${POS_NOUN[d.pos]} of all time (since ${season(d.since)}) · ${site}`

/** "Jean Beliveau leads with 1,219 points in 1,125 games for the Canadiens; Guy Lafleur had 1,246." */
export function groupLead(d: GroupData): string {
  const stat = statByKey(d.metrics[0])
  const [a, b] = d.rows
  if (!a || a.totals[0] == null) return ''
  return `${a.name} leads with ${fmt(a.totals[0])} ${stat.noun} in ${fmt(a.games)} games for the ${d.name}${b && b.totals[0] != null ? `; ${b.name} had ${fmt(b.totals[0])}` : ''}.`
}

export function groupDescription(d: GroupData): string {
  const stat = statByKey(d.metrics[0])
  return `${groupLead(d)} Every ${POS_ONE[d.pos]} with ${MIN_GAMES} or more regular-season games for the ${d.name} since ${season(d.since)}, ranked by ${stat.noun}, with each one's ${stat.noun} drawn game by game.`.replace(/\s+/g, ' ').trim()
}
