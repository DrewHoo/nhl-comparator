// The known-answer gate: published factoids the ledger has to reproduce
// through the engine. Each pin says where the data's definition differs from
// the publisher's (data/gates/README.md has the units).
import { describe, expect, it } from 'vitest'
import { decodeLedger, mergeExtra, type LedgerExtraFile, type LedgerFile } from './ledger.ts'
import { crossings, curve, evaluate, toMatch, DEFAULT_QUERY, type Board, type Query } from './query.ts'
import skaters from '../data/skaters.json'
import skatersX from '../data/skaters-x.json'
import goalies from '../data/goalies.json'

const S = mergeExtra(decodeLedger(skaters as unknown as LedgerFile), skatersX as unknown as LedgerExtraFile)
const G = decodeLedger(goalies as unknown as LedgerFile)
const Q = (patch: Partial<Query>): Query => ({ ...DEFAULT_QUERY, tests: [], ...patch })
const row = (b: Board, name: string, season?: number) => [...b.ranked, ...b.onTheWay].find((r) => r.player.name === name && (season == null || r.season === season))
const player = (name: string) => S.players.find((p) => p.name === name)!

describe('the gate', () => {
  it("Gretzky's 50 goals in 39 games (1981-82), by the team's games, the record book's window", () => {
    const b = evaluate(S, Q({ how: 'reach', stat: 'g', n: 50, seq: 'teamGames', dir: 'fewest' }))
    const g = row(b, 'Wayne Gretzky', 1981)!
    expect(g.value).toBe(39)
    expect(g.rank).toBe(1)
  })
  it("Lemieux's 50th goal of 1988-89 came in Pittsburgh's 46th game (his own 44th: the popular framing counts his games)", () => {
    const b = evaluate(S, Q({ how: 'reach', stat: 'g', n: 50, seq: 'teamGames', dir: 'fewest' }))
    expect(row(b, 'Mario Lemieux', 1988)!.value).toBe(46)
  })
  it("Richard's 50 in 50 (1944-45) and Bossy's (1980-81)", () => {
    const b = evaluate(S, Q({ how: 'reach', stat: 'g', n: 50, seq: 'teamGames', dir: 'fewest' }))
    expect(row(b, 'Maurice Richard', 1944)!.value).toBe(50)
    expect(row(b, 'Mike Bossy', 1980)!.value).toBe(50)
  })
  it('fastest to 1,000 points: Gretzky 424, Lemieux 513, Bossy 656, McDavid 659 (Wikipedia, NHL.com)', () => {
    const b = evaluate(S, Q({ how: 'reach', n: 1000, dir: 'fewest' }))
    expect(b.ranked.slice(0, 4).map((r) => [r.player.name, r.value])).toEqual([['Wayne Gretzky', 424], ['Mario Lemieux', 513], ['Mike Bossy', 656], ['Connor McDavid', 659]])
  })
  it('Gretzky fastest to 100 points from the start of a season: 34 team games (1981-82)', () => {
    const b = evaluate(S, Q({ how: 'reach', n: 100, seq: 'teamGames', dir: 'fewest' }))
    expect(b.ranked[0].player.name).toBe('Wayne Gretzky')
    expect(b.ranked[0].value).toBe(34)
  })
  it("Makar's 100th point came in his 108th game (NHL.com)", () => {
    const b = evaluate(S, Q({ pos: 'D', how: 'reach', n: 100, dir: 'fewest' }))
    expect(row(b, 'Cale Makar')!.value).toBe(108)
  })
  it("Selänne's 132 points (1992-93) is the rookie record; Gretzky's 137 in his first NHL season outranks it here because the league's rookie rules exclude his WHA year, and a first season is not a rookie season", () => {
    const b = evaluate(S, Q({ seq: 'seasons', n: 1 }))
    expect(b.ranked.slice(0, 2).map((r) => [r.player.name, r.value])).toEqual([['Wayne Gretzky', 137], ['Teemu Selanne', 132]])
  })
  it('Howe had 95 points in 1952-53 and Esposito 76 goals in 1970-71, over whole seasons', () => {
    expect(row(evaluate(S, Q({ seq: 'teamGames', n: 70 })), 'Gordie Howe', 1952)!.value).toBe(95)
    expect(row(evaluate(S, Q({ stat: 'g', seq: 'teamGames', n: 78 })), 'Phil Esposito', 1970)!.value).toBe(76)
  })
  it('Brodeur: 691 regular-season wins, 125 shutouts; Sawchuk 103', () => {
    const w = row(evaluate(G, Q({ pos: 'G', stat: 'win', n: 1266 })), 'Martin Brodeur')!
    expect(w.value).toBe(691)
    const s = evaluate(G, Q({ pos: 'G', stat: 'so', n: 1266 }))
    expect(row(s, 'Martin Brodeur')!.value).toBe(125)
    expect(row(s, 'Terry Sawchuk')!.value).toBe(103)
  })
  it('plus-minus starts in 1959-60, so Howe and Richard sit out that board and the board says so', () => {
    const b = evaluate(S, Q({ stat: 'pm' }))
    expect(b.since).toBe(1959)
    expect(b.gapped).toBeGreaterThan(0)
    expect(row(b, 'Gordie Howe')).toBeUndefined()
  })
  it('the peer readings: curves, crossings and the to-match line', () => {
    const q = Q({ how: 'sum', stat: 'p', n: 500 })
    const g = curve(player('Wayne Gretzky'), q), m = curve(player('Mario Lemieux'), q)
    expect(g[423]).toBeGreaterThanOrEqual(1000)
    expect(crossings(m, g).length).toBeGreaterThan(0)
    expect(toMatch(m.slice(0, 100), g, 5)).toEqual({ need: g[104] - m[99], at: 105 })
  })
})
