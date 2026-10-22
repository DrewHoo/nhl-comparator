// The ledger: per player, every game he dressed for, in order, from the NHL's
// own game records (api.nhle.com/stats/rest) since 1917-18. Written by
// pipeline/build-ledger.mjs with each player's columns packed as strings
// (pack.ts); this decodes them into typed arrays the engine reads by index,
// and materializes a Game row only when the panel needs one. Seasons are
// their start year (1981 is 1981-82).
//
// The skaters' columns ship in two files: the core (season, post, the team's
// game number, the team, goals, assists, penalty minutes) with the page, and
// the rest (date, home, opponent, result, shots, plus-minus, power-play,
// shorthanded and game-winning goals) when a query or the panel needs them
// (mergeExtra). The goalies are one small file.
import { unpack } from './pack.ts'

/** the field: every skater, forwards, defensemen, or goalies */
export type Pos = 'ALL' | 'F' | 'D' | 'G'
export const POSITIONS: Pos[] = ['ALL', 'F', 'D', 'G']
/** a player's own position: C, L, R, D or G */
export type PlayerPos = 'C' | 'L' | 'R' | 'D' | 'G'
export const groupOf = (p: PlayerPos): Exclude<Pos, 'ALL'> => (p === 'G' ? 'G' : p === 'D' ? 'D' : 'F')

/** the columns every board reads */
export const CORE = ['season', 'post', 'tgn', 'team'] as const
/** the columns the panel and the rarer stats read */
export const EXTRA = ['date', 'home', 'opp', 'result'] as const
export const SKATER_CORE = ['g', 'a', 'pim'] as const
export const SKATER_EXTRA = ['s', 'pm', 'ppg', 'shg', 'gwg'] as const
export const GOALIE_COLS = ['started', 'dec', 'ga', 'sa', 'sv', 'so', 'toi'] as const
export const DELTA = new Set(['season', 'date', 'tgn', 'team'])
export const WIDE = new Set(['date'])

export interface Game {
  /** start year of the season */
  season: number
  post: boolean
  /** YYYYMMDD, the game's local date */
  date: number
  home: boolean
  team: string
  opp: string
  /** the team's result: 2 won, 1 tied, 0 lost in regulation, 3 lost in overtime or a shootout */
  result: number
  /** the team's game number that season, regular season then playoffs */
  tgn: number
  g: number; a: number; p: number; pim: number; s: number; pm: number; ppg: number; shg: number; gwg: number
  /** goalies: started the game; the decision (2 W, 1 T, 0 L, 3 OTL, -1 none); goals against; shots against and saves (-1 before 1955-56); shutout; seconds */
  started: number; dec: number; ga: number; sa: number; sv: number; so: number; toi: number
}

export type Column = Int16Array | Int32Array

export interface Player {
  id: number
  name: string
  /** YYYY-MM-DD or null */
  born: string | null
  pos: PlayerPos
  /** the season of his first NHL game */
  debut: number
  /** games in the ledger */
  n: number
  /** one typed array per column loaded, n long */
  col: Record<string, Column>
}

export interface Ledger {
  builtAt: string
  firstSeason: number
  currentSeason: number
  kind: 'skaters' | 'goalies'
  players: Player[]
  teams: string[]
  /** team code of the day -> season -> [regular-season games played, all games played] */
  teamGames: Record<string, Record<string, [number, number]>>
  /** the first season each column has real values; a stat's board starts here */
  floors: Record<string, number>
  /** the columns every player carries so far */
  loaded: Set<string>
}

export interface LedgerFile {
  v: number
  builtAt: string
  firstSeason: number
  currentSeason: number
  kind: 'skaters' | 'goalies'
  cols: string[]
  teams: string[]
  teamGames: Record<string, Record<string, [number, number]>>
  floors: Record<string, number>
  players: { id: number; name: string; born: string | null; pos: PlayerPos; debut: number; n: number; c: Record<string, string> }[]
}

/** the second skater file: more columns for the same players, in the same order */
export interface LedgerExtraFile {
  v: number
  kind: 'skaters' | 'goalies'
  cols: string[]
  players: { id: number; c: Record<string, string> }[]
}

const decodeCols = (c: Record<string, string>, cols: string[], n: number): Record<string, Column> => {
  const col: Record<string, Column> = {}
  for (const k of cols) col[k] = unpack(c[k], n, DELTA.has(k), WIDE.has(k))
  return col
}

export function decodeLedger(file: LedgerFile): Ledger {
  if (file.v !== 3) throw new Error(`ledger: version ${file.v}`)
  const players: Player[] = file.players.map((p) => ({ id: p.id, name: p.name, born: p.born, pos: p.pos, debut: p.debut, n: p.n, col: decodeCols(p.c, file.cols, p.n) }))
  return { builtAt: file.builtAt, firstSeason: file.firstSeason, currentSeason: file.currentSeason, kind: file.kind, players, teams: file.teams, teamGames: file.teamGames, floors: file.floors, loaded: new Set(file.cols) }
}

/** adds the extra file's columns to a decoded ledger (in place) */
export function mergeExtra(ledger: Ledger, file: LedgerExtraFile): Ledger {
  if (file.v !== 3 || file.kind !== ledger.kind) throw new Error('ledger: extra file mismatch')
  if (file.players.length !== ledger.players.length) throw new Error('ledger: extra file has a different roster')
  file.players.forEach((e, i) => {
    const p = ledger.players[i]
    if (p.id !== e.id) throw new Error(`ledger: extra file out of order at ${i}`)
    Object.assign(p.col, decodeCols(e.c, file.cols, p.n))
  })
  for (const k of file.cols) ledger.loaded.add(k)
  return ledger
}

export const hasCols = (ledger: Ledger, cols: Iterable<string>): boolean => { for (const c of cols) if (!ledger.loaded.has(c)) return false; return true }

/** one row as an object, for the panel and the words; needs the extra columns */
export function gameAt(ledger: Ledger, p: Player, i: number): Game {
  const c = p.col
  if (!c.date) throw new Error('ledger: the extra columns are not loaded')
  const v = (k: string) => (c[k] ? c[k][i] : -1)
  const g = v('g'), a = v('a')
  return {
    season: c.season[i], post: c.post[i] === 1, date: c.date[i], home: c.home[i] === 1,
    team: ledger.teams[c.team[i]] ?? '?', opp: ledger.teams[c.opp[i]] ?? '?', result: c.result[i], tgn: c.tgn[i],
    g, a, p: g >= 0 && a >= 0 ? g + a : -1, pim: v('pim'), s: v('s'), pm: v('pm'), ppg: v('ppg'), shg: v('shg'), gwg: v('gwg'),
    started: v('started'), dec: v('dec'), ga: v('ga'), sa: v('sa'), sv: v('sv'), so: v('so'), toi: v('toi'),
  }
}

/** "1981-82" from a start year */
export const fmtSeason = (y: number): string => `${y}-${String(y + 1).slice(2)}`

/** whole years between a birth date and a YYYYMMDD game date; null without a birth date */
export function ageAt(born: string | null, date: number): number | null {
  if (!born) return null
  const by = Number(born.slice(0, 4)), bm = Number(born.slice(5, 7)), bd = Number(born.slice(8, 10))
  const y = Math.floor(date / 10000), m = Math.floor(date / 100) % 100, d = date % 100
  let age = y - by
  if (m < bm || (m === bm && d < bd)) age--
  return age
}

/** "Dec 30, 1981" from a YYYYMMDD */
export function fmtDate(date: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[Math.floor(date / 100) % 100 - 1]} ${date % 100}, ${Math.floor(date / 10000)}`
}
