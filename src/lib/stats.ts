// The stat catalog: what a game can be counted by. Each stat reads one or
// two columns of a row. `noun` is how a total reads ("115 wins"), `pos`
// which fields offer it, `thresholds` the per-game tests the picker offers
// (at least N), `maxes` the "N or fewer" tests where those are the point
// (goals against). A stat's era floor is the later of its columns' floors
// (src/lib/ledger.ts: shots and plus-minus 1959-60, saves 1955-56).
import type { Game, Ledger, Player, Pos } from './ledger.ts'

export type StatKey = 'g' | 'a' | 'p' | 'pim' | 's' | 'pm' | 'ppg' | 'shg' | 'gwg' | 'hat' | 'win' | 'loss' | 'otl' | 'so' | 'ga' | 'sa' | 'sv'

export interface Stat {
  key: StatKey
  /** plural noun for a total: "goals" */
  noun: string
  /** singular for a count of 1: "goal" */
  one: string
  pos: Pos[]
  /** the columns it reads (the era floor comes from these) */
  cols: string[]
  /** the value of row i */
  read: (p: Player, i: number) => number
  /** the per-game "at least" thresholds the test picker offers */
  thresholds: number[]
  /** the per-game "at most" thresholds, for a stat where fewer is the point */
  maxes?: number[]
  /** a per-game 0/1 stat, so "a hat trick", never "1 hat trick" */
  isUnit?: boolean
}

const SK: Pos[] = ['ALL', 'F', 'D']
const col = (k: string) => (p: Player, i: number) => p.col[k][i]
const S = (key: StatKey, noun: string, one: string, pos: Pos[], cols: string[], read: (p: Player, i: number) => number, thresholds: number[], extra: Partial<Stat> = {}): Stat =>
  ({ key, noun, one, pos, cols, read, thresholds, ...extra })

export const STATS: Stat[] = [
  S('p', 'points', 'point', SK, ['g', 'a'], (p, i) => p.col.g[i] + p.col.a[i], [1, 2, 3, 4, 5]),
  S('g', 'goals', 'goal', SK, ['g'], col('g'), [1, 2, 3, 4]),
  S('a', 'assists', 'assist', SK, ['a'], col('a'), [1, 2, 3, 4]),
  S('hat', 'hat tricks', 'hat trick', SK, ['g'], (p, i) => (p.col.g[i] >= 3 ? 1 : 0), [1], { isUnit: true }),
  S('ppg', 'power-play goals', 'power-play goal', SK, ['ppg'], col('ppg'), [1, 2]),
  S('shg', 'shorthanded goals', 'shorthanded goal', SK, ['shg'], col('shg'), [1]),
  S('gwg', 'game-winning goals', 'game-winning goal', SK, ['gwg'], col('gwg'), [1]),
  S('s', 'shots on goal', 'shot on goal', SK, ['s'], col('s'), [5, 8, 10]),
  S('pm', 'plus-minus', 'plus-minus', SK, ['pm'], col('pm'), [1, 2, 3]),
  S('pim', 'penalty minutes', 'penalty minute', SK, ['pim'], col('pim'), [2, 5, 10], { maxes: [0] }),
  S('win', 'wins', 'win', ['G'], ['dec'], (p, i) => (p.col.dec[i] === 2 ? 1 : 0), [1]),
  S('loss', 'losses', 'loss', ['G'], ['dec'], (p, i) => (p.col.dec[i] === 0 ? 1 : 0), [1]),
  S('otl', 'overtime losses', 'overtime loss', ['G'], ['dec'], (p, i) => (p.col.dec[i] === 3 ? 1 : 0), [1]),
  S('so', 'shutouts', 'shutout', ['G'], ['so'], col('so'), [1], { isUnit: true }),
  S('ga', 'goals against', 'goal against', ['G'], ['ga'], col('ga'), [4, 5], { maxes: [0, 1, 2] }),
  S('sa', 'shots faced', 'shot faced', ['G'], ['sa'], col('sa'), [30, 40, 50]),
  S('sv', 'saves', 'save', ['G'], ['sv'], col('sv'), [30, 40, 50]),
]

export const statByKey = (key: StatKey): Stat => {
  const s = STATS.find((x) => x.key === key)
  if (!s) throw new Error(`no stat ${key}`)
  return s
}

export const statsFor = (pos: Pos): Stat[] => STATS.filter((s) => s.pos.includes(pos))

/** the stat's value on a materialized Game (the panel's ledger); the engine reads columns by index instead */
export function readGame(stat: Stat, g: Game): number {
  if (stat.key === 'hat') return g.g >= 3 ? 1 : 0
  if (stat.key === 'p') return g.g + g.a
  if (stat.key === 'win') return g.dec === 2 ? 1 : 0
  if (stat.key === 'loss') return g.dec === 0 ? 1 : 0
  if (stat.key === 'otl') return g.dec === 3 ? 1 : 0
  return (g as unknown as Record<string, number>)[stat.cols[0]]
}

/** the columns a query's stat and tests read */
export const colsOf = (keys: StatKey[]): Set<string> => new Set(keys.flatMap((k) => statByKey(k).cols))

/** the first season the stat's columns all have values; the ledger's own floor table decides */
export function statFloor(ledger: Ledger, key: StatKey): number {
  const s = statByKey(key)
  let f = ledger.firstSeason
  for (const c of s.cols) f = Math.max(f, ledger.floors[c] ?? ledger.firstSeason)
  // a goalie's overtime loss is a decision of its own only from 2005-06 (folded into losses before)
  if (key === 'otl') f = Math.max(f, ledger.floors.otl ?? f)
  return f
}

/** the words of a count: "1 win", "115 wins", "3,000 shots on goal", "a hat trick" */
export function countWords(n: number, stat: Stat): string {
  if (stat.isUnit && n === 1) return `a ${stat.one}`
  return `${n.toLocaleString('en-US')} ${n === 1 ? stat.one : stat.noun}`
}
