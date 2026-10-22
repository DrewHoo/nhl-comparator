// The comparison card's words: what a shared t=&vs= link draws, in the panel's words.
import { describe, expect, it } from 'vitest'
import { decodeLedger, type LedgerFile } from './ledger.ts'
import { evaluate, DEFAULT_QUERY, type Query } from './query.ts'
import { compareCard } from './share.ts'
import skaters from '../data/skaters.json'

const S = decodeLedger(skaters as unknown as LedgerFile)
const Q = (patch: Partial<Query>): Query => ({ ...DEFAULT_QUERY, tests: [], ...patch })

describe('compareCard', () => {
  it('McDavid against Gretzky through 500 games: both sides, the crossing line, both curves', () => {
    const q = Q({ n: 500 })
    const b = evaluate(S, q)
    const all = [...b.ranked, ...b.onTheWay]
    const mcd = all.find((r) => r.player.name === 'Connor McDavid')!
    const wg = all.find((r) => r.player.name === 'Wayne Gretzky')!
    const c = compareCard(q, b, mcd, wg)
    expect(c.heading).toBe('Connor McDavid vs Wayne Gretzky')
    expect(c.sides[1].claim).toMatch(/^1st of [\d,]+ · /)
    expect(c.sides[0].unit).toBe('points')
    expect(c.chart?.me.length).toBeGreaterThanOrEqual(500)
    expect(c.lines[0]).toMatch(/^Connor McDavid (tied|passed|fell behind) Wayne Gretzky at game \d+|^Their curves never met\./)
  })
  it('a player-season board has no curves: the two claims instead', () => {
    const q = Q({ how: 'reach', stat: 'g', n: 50, seq: 'teamGames', dir: 'fewest' })
    const b = evaluate(S, q)
    const c = compareCard(q, b, b.ranked[1], b.ranked[0])
    expect(c.chart).toBeNull()
    expect(c.lines).toHaveLength(2)
    expect(c.sides[0].unit).toBe('team games')
  })
})
