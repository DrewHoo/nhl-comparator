// The query in the URL, one param per slot, so every board is a link.
// Pure: parseUrl reads a search string, toUrl writes one; the defaults are
// omitted. `t` is the open row (the panel), `vs` the peer it reads against.
import { DEFAULT_QUERY, normalize, type How, type Query, type Seq, type Test } from './query.ts'
import { STATS, type StatKey } from './stats.ts'
import { POSITIONS, type Pos } from './ledger.ts'

const HOWS: How[] = ['sum', 'count', 'every', 'streak', 'reach']
const SEQS: Seq[] = ['games', 'starts', 'seasons', 'teamGames']
const isStat = (s: string): s is StatKey => STATS.some((x) => x.key === s)

export interface UrlState { query: Query; open: string | null; vs?: string | null }

/** the state in a search string, over a base query (a landing's, or the default) */
export function parseUrl(search: string, base: Query = DEFAULT_QUERY): UrlState {
  const p = new URLSearchParams(search)
  const q: Query = { ...base, tests: [...base.tests] }
  const pos = p.get('pos'); if (pos && (POSITIONS as string[]).includes(pos)) q.pos = pos as Pos
  const stat = p.get('stat'); if (stat && isStat(stat)) q.stat = stat
  const how = p.get('how'); if (how && (HOWS as string[]).includes(how)) q.how = how as How
  const seq = p.get('seq'); if (seq && (SEQS as string[]).includes(seq)) q.seq = seq as Seq
  const n = Number(p.get('n')); if (Number.isInteger(n) && n > 0) q.n = n
  if (p.get('scope') === 'all') q.scope = 'all'
  if (p.get('scope') === 'reg') q.scope = 'reg'
  if (p.get('since') === '') q.since = null
  const since = Number(p.get('since')); if (Number.isInteger(since) && since > 1900) q.since = since
  if (p.get('dir') === 'fewest') q.dir = 'fewest'
  if (p.get('dir') === 'most') q.dir = 'most'
  const tests = p.get('tests')
  if (tests != null) {
    q.tests = tests.split(',').map((s): Test | null => {
      const m = /^([a-z]+):(-?\d+)(?:-(\d+))?$/.exec(s)
      if (!m || !isStat(m[1])) return null
      return m[3] == null ? { stat: m[1], min: Number(m[2]) } : { stat: m[1], min: Number(m[2]), max: Number(m[3]) }
    }).filter((t): t is Test => t != null)
  }
  const open = p.get('t')
  return { query: normalize(q), open, vs: open ? p.get('vs') : null }
}

export const testParam = (t: Test) => `${t.stat}:${t.min}${t.max != null ? `-${t.max}` : ''}`

export function toUrl(state: UrlState, base: Query = DEFAULT_QUERY): string {
  const q = normalize(state.query)
  const p = new URLSearchParams()
  if (q.pos !== base.pos) p.set('pos', q.pos)
  if (q.stat !== base.stat) p.set('stat', q.stat)
  if (q.how !== base.how) p.set('how', q.how)
  if (q.n !== base.n) p.set('n', String(q.n))
  if (q.seq !== base.seq) p.set('seq', q.seq)
  if (q.scope !== base.scope) p.set('scope', q.scope)
  if (q.since !== base.since) p.set('since', q.since == null ? '' : String(q.since))
  if (q.dir !== base.dir) p.set('dir', q.dir)
  const tests = q.tests.map(testParam).join(',')
  const baseTests = base.tests.map(testParam).join(',')
  if ((q.how === 'count' || q.how === 'every' || q.how === 'streak') && tests !== baseTests) p.set('tests', tests)
  if (state.open) p.set('t', state.open)
  if (state.open && state.vs) p.set('vs', state.vs)
  const s = p.toString()
  return s ? `?${s}` : ''
}
