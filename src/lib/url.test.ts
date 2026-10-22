import { describe, expect, it } from 'vitest'
import { parseUrl, toUrl } from './url.ts'
import { DEFAULT_QUERY, normalize, type Query } from './query.ts'
import { LANDINGS, landingFor, parseLocation, toAddress } from './landing.ts'

const Q = (patch: Partial<Query>): Query => normalize({ ...DEFAULT_QUERY, tests: [], ...patch })

describe('the url', () => {
  it('writes nothing for the default query and reads it back', () => {
    expect(toUrl({ query: DEFAULT_QUERY, open: null })).toBe('')
    expect(parseUrl('').query).toEqual(DEFAULT_QUERY)
  })
  it('round-trips every slot', () => {
    const q = Q({ pos: 'G', stat: 'win', how: 'sum', n: 100, seq: 'starts', scope: 'all', since: 2005, dir: 'fewest' })
    const s = toUrl({ query: q, open: '8455710', vs: '8450070' })
    const back = parseUrl(s)
    expect(back.query).toEqual(q)
    expect(back.open).toBe('8455710')
    expect(back.vs).toBe('8450070')
  })
  it('round-trips a test query with a max', () => {
    const q = Q({ pos: 'G', how: 'count', tests: [{ stat: 'ga', min: 0, max: 2 }, { stat: 'sv', min: 30 }], n: 50 })
    expect(parseUrl(toUrl({ query: q, open: null })).query).toEqual(q)
  })
  it('drops a starts sequence on skaters and a stat the field lacks', () => {
    expect(parseUrl('?seq=starts&stat=win').query).toEqual(Q({ seq: 'games', stat: 'p' }))
  })
})

describe('the landings', () => {
  it('none is the default query', () => {
    for (const l of LANDINGS) expect(landingFor(l.query)?.slug, l.slug).toBe(l.slug)
    expect(landingFor(DEFAULT_QUERY)).toBeNull()
  })
  it('a landing path is its own address, with only the open row riding along', () => {
    const l = LANDINGS[0]
    expect(toAddress({ query: l.query, open: '8447400' })).toBe(`${l.slug}/?t=8447400`)
    expect(parseLocation(`${l.slug}/`, '?t=8447400').query).toEqual(l.query)
  })
  it('slugs are unique', () => {
    expect(new Set(LANDINGS.map((l) => l.slug)).size).toBe(LANDINGS.length)
  })
})
