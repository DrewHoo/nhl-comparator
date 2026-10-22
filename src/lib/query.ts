// The query engine. A query is the five slots of the sentence (who · did
// what · how much · over which games · against whom), and evaluating it over
// a ledger gives every entity a value at the window, ranked. Entities are
// careers (one row per player) unless the sequence is the team's games of a
// season, where they are player-seasons. The ledger is columnar
// (src/lib/ledger.ts), so the engine reads rows by index and never builds a
// Game object; the panel asks for a row's games afterwards (rowGames).
//
// Rulings carried from the NFL and WNBA comparators: games, starts (goalies)
// and seasons are three sequences; "team games of a season" count the team's
// schedule; a seasons window is complete only when the Nth season is over;
// `every` ranks by the count; the era bound is the later of what the reader
// asked for and the stat's floor, and the board says how many careers sat
// out because they began before it (`gapped`); ranks are competition ranks.
import { gameAt, groupOf, type Game, type Ledger, type Player, type Pos } from './ledger.ts'
import { ageAt } from './ledger.ts'
import { colsOf, readGame, statByKey, statFloor, type Stat, type StatKey } from './stats.ts'

/** which games are counted, in order: a career's games, its starts (goalies), its seasons, or a season's games counted by the team's schedule */
export type Seq = 'games' | 'starts' | 'seasons' | 'teamGames'
/** how the per-game numbers add up over the window */
export type How = 'sum' | 'count' | 'every' | 'streak' | 'reach'
export type Scope = 'reg' | 'all'
export type Dir = 'most' | 'fewest'

/** a per-game test: the stat is at least `min` (and at most `max` when set; `min: 0, max: 0` reads "no goals against") */
export interface Test { stat: StatKey; min: number; max?: number }

export interface Query {
  pos: Pos
  stat: StatKey
  tests: Test[]
  how: How
  /** the window: the first n of the sequence; for `reach`, the target */
  n: number
  seq: Seq
  scope: Scope
  /** the era: careers that began, or seasons played, in this season (start year) or later; null for the whole ledger */
  since: number | null
  dir: Dir
}

export const DEFAULT_QUERY: Query = { pos: 'ALL', stat: 'p', tests: [], how: 'sum', n: 500, seq: 'games', scope: 'reg', since: null, dir: 'most' }

export interface Row {
  key: string
  player: Player
  /** the season, for a player-season entity */
  season: number | null
  value: number | null
  /** how far along the sequence the entity is (its games or starts so far, up to the window) */
  reached: number
  complete: boolean
  /** every: the test held in every game of the window */
  all: boolean
  /** the first and last season of the window */
  from: number
  to: number
  /** the team of a player-season */
  team: string | null
  rank: number
  tied: boolean
}

export interface Board {
  ranked: Row[]
  onTheWay: Row[]
  /** the era the board covers: the later of the query's and the stat's floor */
  since: number
  /** careers that sat out because they began before the stat's floor */
  gapped: number
}

const fallbackStat = (pos: Pos): StatKey => (pos === 'G' ? 'win' : 'p')

/** fixes a query the pickers can't make */
export function normalize(q: Query): Query {
  const out = { ...q, tests: [...q.tests] }
  if (!statByKey(out.stat).pos.includes(out.pos)) out.stat = fallbackStat(out.pos)
  out.tests = out.tests.filter((t) => statByKey(t.stat).pos.includes(out.pos))
  if (out.seq === 'starts' && out.pos !== 'G') out.seq = 'games'
  if (out.how === 'reach' && out.seq === 'seasons') out.seq = 'games'
  if ((out.how === 'count' || out.how === 'every' || out.how === 'streak') && out.tests.length === 0) {
    const s = statByKey(out.stat)
    out.tests = s.maxes && s.thresholds.length === 0 ? [{ stat: s.key, min: 0, max: s.maxes[0] }] : [{ stat: s.key, min: s.thresholds[Math.min(1, s.thresholds.length - 1)] }]
  }
  if (out.n < 1) out.n = 1
  return out
}

/** the row counts for a clean line: a goalie who played half the game; a skater always (there is no TOI before 1997-98) */
export const played = (p: Player, i: number): boolean => (p.pos === 'G' ? p.col.toi[i] >= 1800 : true)

/** the per-game tests all hold at row i; a test with a max also needs the game played */
export function holds(p: Player, i: number, tests: Test[]): boolean {
  for (const t of tests) {
    const v = statByKey(t.stat).read(p, i)
    if (v < t.min) return false
    if (t.max != null && (v > t.max || !played(p, i))) return false
  }
  return true
}

/** the same tests over a materialized Game (the panel's ledger) */
export function holdsGame(g: Game, tests: Test[]): boolean {
  for (const t of tests) {
    const v = readGame(statByKey(t.stat), g)
    if (v < t.min) return false
    if (t.max != null && (v > t.max || (g.dec >= 0 && g.toi < 1800))) return false
  }
  return true
}

const inScope = (p: Player, i: number, scope: Scope) => scope === 'all' || p.col.post[i] === 0

/** the sequence items of a career as row indices: one game, one start, or one season each */
export function items(p: Player, q: Pick<Query, 'seq' | 'scope'>): number[][] {
  const out: number[][] = []
  if (q.seq === 'seasons') {
    let cur: number[] | null = null, season = -1
    for (let i = 0; i < p.n; i++) {
      if (!inScope(p, i, q.scope)) continue
      if (p.col.season[i] !== season) { season = p.col.season[i]; cur = []; out.push(cur) }
      cur!.push(i)
    }
    return out
  }
  for (let i = 0; i < p.n; i++) {
    if (!inScope(p, i, q.scope)) continue
    if (q.seq === 'starts' && p.col.started[i] !== 1) continue
    out.push([i])
  }
  return out
}

function longestRun(flags: boolean[]): number {
  let best = 0, run = 0
  for (const f of flags) { run = f ? run + 1 : 0; if (run > best) best = run }
  return best
}

interface Measure { value: number | null; reached: number; complete: boolean; all: boolean; last: number }

function measure(p: Player, seqItems: number[][], q: Query, stat: Stat, ledger: Ledger): Measure {
  const lastOf = (k: number) => (k > 0 ? seqItems[k - 1][seqItems[k - 1].length - 1] : -1)
  if (q.how === 'reach') {
    let cum = 0
    for (let k = 0; k < seqItems.length; k++) {
      for (const i of seqItems[k]) cum += stat.read(p, i)
      if (cum >= q.n) return { value: k + 1, reached: k + 1, complete: true, all: false, last: lastOf(k + 1) }
    }
    return { value: null, reached: seqItems.length, complete: false, all: false, last: lastOf(seqItems.length) }
  }
  const reached = Math.min(seqItems.length, q.n)
  const last = lastOf(reached)
  const hasWindow = seqItems.length >= q.n
  // a season window is complete once the season is over
  const done = hasWindow && (q.seq !== 'seasons' || p.col.season[seqItems[q.n - 1][0]] < ledger.currentSeason)
  if (q.how === 'sum') {
    let v = 0
    for (let k = 0; k < reached; k++) for (const i of seqItems[k]) v += stat.read(p, i)
    return { value: v, reached, complete: done, all: false, last }
  }
  const flags: boolean[] = []
  for (let k = 0; k < reached; k++) flags.push(seqItems[k].some((i) => holds(p, i, q.tests)))
  const count = flags.filter(Boolean).length
  if (q.how === 'count') return { value: count, reached, complete: done, all: count === q.n, last }
  if (q.how === 'every') return { value: count, reached, complete: done, all: done && count === q.n, last }
  return { value: longestRun(flags), reached, complete: done, all: false, last }
}

function rankRows(rows: Row[], dir: Dir): Row[] {
  const sign = dir === 'most' ? -1 : 1
  rows.sort((a, b) => sign * ((a.value ?? 0) - (b.value ?? 0)) || a.player.name.localeCompare(b.player.name))
  let rank = 0
  for (let i = 0; i < rows.length; i++) {
    if (i === 0 || rows[i].value !== rows[i - 1].value) rank = i + 1
    rows[i].rank = rank
  }
  for (let i = 0; i < rows.length; i++) rows[i].tied = (i > 0 && rows[i - 1].value === rows[i].value) || (i + 1 < rows.length && rows[i + 1].value === rows[i].value)
  return rows
}

/** the era a query's stat and tests force: the latest floor among them */
export function floorOf(ledger: Ledger, q: Query): number {
  let f = statFloor(ledger, q.stat)
  for (const t of q.tests) f = Math.max(f, statFloor(ledger, t.stat))
  return f
}

const inField = (p: Player, pos: Pos) => pos === 'ALL' ? p.pos !== 'G' : groupOf(p.pos) === pos

/** every entity's row at the window, ranked */
export function evaluate(ledger: Ledger, raw: Query): Board {
  const q = normalize(raw)
  for (const c of colsNeeded(q)) if (!ledger.loaded.has(c)) throw new Error(`ledger: column ${c} not loaded`)
  const stat = statByKey(q.stat)
  const floor = floorOf(ledger, q)
  const since = Math.max(floor, q.since ?? ledger.firstSeason)
  const ranked: Row[] = []
  const onTheWay: Row[] = []
  let gapped = 0
  const push = (r: Row) => (r.complete && r.value != null ? ranked : onTheWay).push(r)
  const blank = { rank: 0, tied: false }

  for (const p of ledger.players) {
    if (!inField(p, q.pos)) continue
    if (q.seq === 'teamGames') {
      // player-seasons: the window is the team's first n games of the season
      let start = 0
      while (start < p.n) {
        const season = p.col.season[start]
        let end = start
        while (end < p.n && p.col.season[end] === season) end++
        const s0 = start; start = end
        if (season < since) continue
        const idx: number[] = []
        for (let i = s0; i < end; i++) if (inScope(p, i, q.scope)) idx.push(i)
        if (idx.length === 0) continue
        const teamIx = p.col.team[idx[0]]
        const own = idx.filter((i) => p.col.team[i] === teamIx && p.col.tgn[i] <= q.n)
        const team = ledger.teams[teamIx]
        const playedN = ledger.teamGames[team]?.[season]?.[q.scope === 'reg' ? 0 : 1] ?? 0
        const complete = playedN >= q.n
        const reachedN = Math.min(playedN, q.n)
        const base = { key: `${p.id}:${season}`, player: p, season, from: season, to: season, team, ...blank }
        if (q.how === 'reach') {
          let cum = 0, at: number | null = null
          for (const i of own) { cum += stat.read(p, i); if (cum >= q.n) { at = p.col.tgn[i]; break } }
          push({ ...base, value: at, reached: reachedN, complete: at != null, all: false })
          continue
        }
        const flagsByTgn = new Array<boolean>(reachedN).fill(false)
        for (const i of own) { const t = p.col.tgn[i]; if (t >= 1 && t <= reachedN) flagsByTgn[t - 1] = holds(p, i, q.tests) }
        const count = flagsByTgn.filter(Boolean).length
        const value = q.how === 'sum' ? own.reduce((s, i) => s + stat.read(p, i), 0) : q.how === 'streak' ? longestRun(flagsByTgn) : count
        push({ ...base, value, reached: reachedN, complete, all: (q.how === 'every' || q.how === 'count') && complete && count === q.n })
      }
      continue
    }
    // a career that began before the stat's floor has no first N for it
    if (p.debut < since) { if (p.debut < floor) gapped++; continue }
    const seqItems = items(p, q)
    if (seqItems.length === 0) continue
    const m = measure(p, seqItems, q, stat, ledger)
    const firstI = seqItems[0][0]
    const lastI = m.last >= 0 ? m.last : firstI
    push({ key: String(p.id), player: p, season: null, value: m.value, reached: m.reached, complete: m.complete, all: m.all, from: p.col.season[firstI], to: p.col.season[lastI], team: null, ...blank })
  }
  return { ranked: rankRows(ranked, q.dir), onTheWay: rankRows(onTheWay, q.dir), since, gapped }
}

/** the window's games of a row, materialized for the panel */
export function rowGames(ledger: Ledger, r: Row, q: Query): Game[] {
  const p = r.player
  if (q.seq === 'teamGames') {
    const out: Game[] = []
    for (let i = 0; i < p.n; i++) if (p.col.season[i] === r.season && inScope(p, i, q.scope)) { const g = gameAt(ledger, p, i); if (g.team === r.team && g.tgn <= q.n) out.push(g) }
    return out
  }
  const seqItems = items(p, q)
  const upto = q.how === 'reach' ? (r.value ?? seqItems.length) : Math.min(seqItems.length, q.n)
  return seqItems.slice(0, upto).flat().map((i) => gameAt(ledger, p, i))
}

/** a career's cumulative curve of a stat over the sequence: cum[k] is the total through item k+1 */
export function curve(p: Player, q: Query): number[] {
  const stat = statByKey(q.stat)
  const out: number[] = []
  let cum = 0
  for (const it of items(p, q)) { for (const i of it) cum += stat.read(p, i); out.push(cum) }
  return out
}

export interface Crossing { n: number; kind: 'tied' | 'passed' | 'fell behind'; value: number }

/** where a's curve meets b's: the ordinals where a ties b (entering a tie) or passes b */
export function crossings(a: number[], b: number[]): Crossing[] {
  const out: Crossing[] = []
  const len = Math.min(a.length, b.length)
  let prev = 0
  for (let i = 0; i < len; i++) {
    const d = Math.sign(a[i] - b[i])
    if (d === 0 && prev !== 0) out.push({ n: i + 1, kind: 'tied', value: a[i] })
    else if (d > 0 && prev <= 0 && i > 0) out.push({ n: i + 1, kind: 'passed', value: a[i] })
    else if (d < 0 && prev >= 0 && i > 0) out.push({ n: i + 1, kind: 'fell behind', value: a[i] })
    prev = d
  }
  return out
}

/** what `a` needs over its next k items to match b's total at that ordinal; null when b's curve doesn't reach it */
export function toMatch(a: number[], b: number[], k: number): { need: number; at: number } | null {
  const at = a.length + k
  if (at > b.length) return null
  return { need: b[at - 1] - (a[a.length - 1] ?? 0), at }
}

/** the columns a query reads: its stat's, its tests', and the core */
export const colsNeeded = (q: Query): Set<string> => { const s = colsOf([q.stat, ...q.tests.map((t) => t.stat)]); for (const c of ['season', 'post', 'tgn', 'team']) s.add(c); return s }

/** the player's age at the last game of a window (needs the extra columns) */
export const ageAtWindow = (ledger: Ledger, r: Row, q: Query): number | null => { const gs = rowGames(ledger, r, q); return gs.length ? ageAt(r.player.born, gs[gs.length - 1].date) : null }
