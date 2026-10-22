// The records gate: golden lines written as the complaints they guard
// against, over the committed ledgers. The whole catalog takes ~35 s to
// mine, so this mines a handful of shapes (points and goals over games,
// both scopes; goals over a team's games; fastest to a points milestone;
// 5-point games; goalie wins over starts) once at load, plus the file round
// trip and the nesting of a page in the mine.
import { describe, expect, it } from 'vitest'
import { decodeLedger, mergeExtra, type Ledger, type LedgerExtraFile, type LedgerFile } from './ledger.ts'
import { evaluate, DEFAULT_QUERY, type Query } from './query.ts'
import { RECORDS, decodePlayer, encodePlayer, milestones, mineShape, page, shapesFor, type RecordRow, type Shape } from './records.ts'
import skaters from '../data/skaters.json'
import skatersX from '../data/skaters-x.json'
import goalies from '../data/goalies.json'

const L: Ledger = mergeExtra(decodeLedger(skaters as unknown as LedgerFile), skatersX as unknown as LedgerExtraFile)
const G: Ledger = decodeLedger(goalies as unknown as LedgerFile)
const S = (patch: Partial<Shape>): Shape => ({ pos: 'ALL', stat: 'p', tests: [], how: 'sum', seq: 'games', scope: 'reg', since: null, dir: 'most', ...patch })
const SHAPES = {
  pts: S({}),
  ptsAll: S({ scope: 'all' }),
  goals: S({ stat: 'g' }),
  goalsSeason: S({ stat: 'g', seq: 'teamGames' }),
  reach: S({ how: 'reach', dir: 'fewest' }),
  five: S({ how: 'count', tests: [{ stat: 'p', min: 5 }] }),
}
const mined = Object.fromEntries(Object.entries(SHAPES).map(([k, s]) => [k, mineShape(L, s)])) as Record<keyof typeof SHAPES, RecordRow[]>
const wins = mineShape(G, { ...S({ pos: 'G', stat: 'win', seq: 'starts' }) })
const kept = Object.values(mined).flat().filter((r) => r.score >= RECORDS.keepFloor)
const player = (name: string) => L.players.find((p) => p.name === name)!
const board = (patch: Partial<Query>) => evaluate(L, { ...DEFAULT_QUERY, ...patch })
const allRows = (fams: ReturnType<typeof page>) => fams.flatMap((f) => [f.best, ...f.rest])

describe('the shapes', () => {
  it('skaters walk the skater stats, goalies theirs; no count of a 0/1 stat; seasons take sums; a fewest total only over starts', () => {
    const sk = shapesFor('ALL'), gk = shapesFor('G')
    expect(sk.some((s) => ['win', 'so', 'ga', 'sv'].includes(s.stat))).toBe(false)
    expect(gk.some((s) => ['p', 'g', 'a'].includes(s.stat))).toBe(false)
    expect([...sk, ...gk].some((s) => s.how === 'count' && ['win', 'so', 'hat'].includes(s.stat))).toBe(false)
    expect([...sk, ...gk].some((s) => s.seq === 'seasons' && s.how !== 'sum')).toBe(false)
    expect([...sk, ...gk].some((s) => s.dir === 'fewest' && s.how === 'sum' && s.seq !== 'starts')).toBe(false)
    expect(sk.some((s) => s.seq === 'starts')).toBe(false)
    expect([...gk.flatMap((s) => s.tests.filter((t) => t.max != null).map((t) => `${t.stat}${t.max}`))].sort()).not.toContain('ga0')
  })
})

describe('golden rows', () => {
  it('Wayne Gretzky leads points through 500 games (1,186), and the mine agrees with the board', () => {
    const r = mined.pts.find((x) => x.player.name === 'Wayne Gretzky' && x.kind === 'held' && x.lo <= 500 && x.hi >= 500)!
    expect(r).toBeTruthy()
    const b = board({ n: 500 })
    expect(b.ranked[0].player.name).toBe('Wayne Gretzky')
    expect(b.ranked[0].value).toBe(1186)
    const at = board({ n: r.at }).ranked.find((x) => x.player.id === Number(r.player.id))!
    expect(at.rank).toBe(1)
    expect(r.value).toBe(at.value)
  })

  it("a held row's value is the board's at its worded N, and a career's is first there", () => {
    const boards = new Map<string, ReturnType<typeof board>>()
    const rows = Object.entries(mined).filter(([k]) => k !== 'reach').flatMap(([, rs]) => rs.filter((r) => r.kind === 'held').sort((a, b) => b.score - a.score).slice(0, 8))
    for (const r of rows) {
      const key = `${JSON.stringify(r.shape)}|${r.at}`
      const b = boards.get(key) ?? boards.set(key, board({ ...r.shape, n: r.at })).get(key)!
      const x = [...b.ranked, ...b.onTheWay].find((y) => y.key === r.key)!
      expect(x.value, `${r.key} ${r.shape.stat} ${r.shape.how} ${r.shape.seq} @${r.at}`).toBe(r.value)
      if (r.season == null) expect(x.rank).toBe(1)
    }
  })

  it("Gretzky's 92 goals in Edmonton's 80 games of 1981-82 is a held row", () => {
    const r = mined.goalsSeason.find((x) => x.player.name === 'Wayne Gretzky' && x.kind === 'held' && x.season === 1981 && x.at === 80)
    expect(r?.value).toBe(92)
    expect(r?.team).toBe('EDM')
  })

  it('Alex Ovechkin leads goals through his games so far, live, past Gretzky', () => {
    const r = mined.goals.find((x) => x.player.name === 'Alex Ovechkin' && x.kind === 'held' && x.live)
    expect(r).toBeTruthy()
    expect(r!.lo).toBeGreaterThan(1480)
  })

  it('Gretzky is fastest to 1,000 points in 424 games, and the row is worded on the milestone grid', () => {
    const r = mined.reach.find((x) => x.player.name === 'Wayne Gretzky' && x.kind === 'held' && x.lo <= 1000 && x.hi >= 1000)!
    expect(r).toBeTruthy()
    expect(board({ how: 'reach', n: 1000, dir: 'fewest' }).ranked[0].value).toBe(424)
    for (const x of mined.reach) {
      expect(milestones(x.shape.stat, x.at)).toContain(x.at)
      expect(milestones(x.shape.stat, x.at)).toContain(x.from)
    }
  })

  it("Patrick Roy set the wins record through his starts, and Martin Brodeur broke it", () => {
    const r = wins.find((x) => x.player.name === 'Patrick Roy' && x.kind === 'set')
    expect(r?.breaker?.name).toBe('Martin Brodeur')
  })

  it('no row starts under the noise floor, and a set row was set in a field of at least fieldFloor', () => {
    for (const r of [...Object.values(mined).flat(), ...wins]) {
      if (r.shape.how !== 'reach') expect(r.lo).toBeGreaterThanOrEqual(RECORDS.minN[r.shape.seq])
      if (r.kind === 'set') expect(r.field).toBeGreaterThanOrEqual(RECORDS.fieldFloor)
    }
  })
})

describe('the file and the page', () => {
  it('a player file round-trips to the same scores', () => {
    const p = player('Wayne Gretzky')
    const own = kept.filter((r) => r.player.id === String(p.id))
    expect(own.length).toBeGreaterThan(0)
    const file = encodePlayer(L, p, own)
    expect(file.games).toBe(p.n)
    expect(file.teams).toEqual(['EDM', 'LAK', 'STL', 'NYR'])
    const back = decodePlayer(JSON.parse(JSON.stringify(file)))
    expect(back.map((r) => Math.round(r.score * 1000))).toEqual(own.map((r) => Math.round(r.score * 1000)))
    expect(back.map((r) => r.breaker?.name ?? '')).toEqual(own.map((r) => r.breaker?.name ?? ''))
    expect(back.map((r) => `${r.lo}-${r.hi}@${r.at}`)).toEqual(own.map((r) => `${r.lo}-${r.hi}@${r.at}`))
  })

  it("a page's rows nest in the mine: every mined row is shown or folded, nothing is added", () => {
    for (const name of ['Wayne Gretzky', 'Mario Lemieux']) {
      const id = String(player(name).id)
      const own = kept.filter((r) => r.player.id === id)
      const fams = page(kept, id)
      const seen = new Set<RecordRow>()
      const walk = (r: RecordRow) => { seen.add(r); r.folded.forEach(walk) }
      allRows(fams).forEach(walk)
      expect(seen.size).toBe(own.length)
      for (const r of seen) expect(own).toContain(r)
      for (const f of fams) for (const r of f.rest) expect(r.score).toBeLessThanOrEqual(f.best.score)
      for (const r of kept) r.folded = []
    }
  })
})
