// The team pages: the franchise ruling (data/ref/franchises.json) and a few
// franchise totals a fan can check against NHL.com's franchise records.
import { describe, expect, it } from 'vitest'
import { decodeLedger, type LedgerFile } from './ledger.ts'
import { FRANCHISES, franchiseOf, groupData, groupH1, groupPath } from './groups.ts'
import skaters from '../data/skaters.json'
import goalies from '../data/goalies.json'

const S = decodeLedger(skaters as unknown as LedgerFile)
const G = decodeLedger(goalies as unknown as LedgerFile)

describe('the franchise ruling', () => {
  it('maps every team code in the ledger, to one of the 32 current franchises or to none', () => {
    expect(FRANCHISES).toHaveLength(32)
    const ids = new Set(FRANCHISES.map((f) => f.id))
    for (const code of [...S.teams, ...G.teams]) { const f = franchiseOf(code, 2000); if (f) expect(ids.has(f)).toBe(true) }
  })
  it('follows the 2026-09-24 ruling: the Jets are the first Jets and the Thrashers; the Coyotes and the first Senators have no franchise', () => {
    expect(franchiseOf('WIN', 1985)).toBe('WPG')
    expect(franchiseOf('ATL', 2005)).toBe('WPG')
    expect(franchiseOf('PHX', 2005)).toBeNull()
    expect(franchiseOf('ARI', 2020)).toBeNull()
    expect(franchiseOf('SEN', 1925)).toBeNull()
    expect(franchiseOf('HFD', 1990)).toBe('CAR')
    expect(franchiseOf('KCS', 1975)).toBe('NJD')
    expect(franchiseOf('TSP', 1920)).toBe('TOR')
  })
})

describe('team pages', () => {
  it("Gretzky leads the Oilers' forwards with 1,669 points in 696 games", () => {
    const d = groupData(S, 'EDM', 'F')
    expect(groupH1(d)).toBe("The Edmonton Oilers' best forwards")
    expect([d.rows[0].name, d.rows[0].totals[0], d.rows[0].games]).toEqual(['Wayne Gretzky', 1669, 696])
    expect(d.rows[0].curves?.[0]?.at(-1)).toBe(1669)
    expect(groupPath('EDM', 'F')).toBe('/team/edm/forwards/')
  })
  it("Brodeur leads the Devils' goalies with 688 wins; Bourque the Bruins' defensemen with 1,506 points", () => {
    expect([groupData(G, 'NJD', 'G').rows[0].name, groupData(G, 'NJD', 'G').rows[0].totals[0]]).toEqual(['Martin Brodeur', 688])
    expect([groupData(S, 'BOS', 'D').rows[0].name, groupData(S, 'BOS', 'D').rows[0].totals[0]]).toEqual(['Ray Bourque', 1506])
  })
  it("the Jets' page counts a Thrasher's games: Ilya Kovalchuk is on the forwards' list", () => {
    expect(groupData(S, 'WPG', 'F').rows.some((r) => r.name === 'Ilya Kovalchuk')).toBe(true)
  })
})
