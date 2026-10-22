// The query as a sentence: who · did what · how much · over which games ·
// against whom, every word that can change a Picker. The shape of the
// sentence follows `how`; src/lib/words.ts says the same sentence in prose.
// A stat's era floor rides as the picker's hint ("since 1959-60").
import { useEffect, useRef, useState } from 'react'
import { Picker } from './Picker.jsx'
import { Chevron } from './Icons.jsx'
import { POSITIONS, fmtSeason } from '../lib/ledger.ts'
import { statsFor, statByKey, statFloor } from '../lib/stats.ts'
import { POS_WORDS, testWords, seqWords } from '../lib/words.ts'

const POS_OPTIONS = POSITIONS.map((p) => ({ value: p, label: POS_WORDS[p] }))

const HOW_OPTIONS = [
  { value: 'sum:most', label: 'with the most' },
  { value: 'sum:fewest', label: 'with the fewest' },
  { value: 'count:most', label: 'with the most games of' },
  { value: 'count:fewest', label: 'with the fewest games of' },
  { value: 'every:most', label: 'with every game at' },
  { value: 'streak:most', label: 'with the longest streak of' },
  { value: 'reach:fewest', label: 'fastest to' },
  { value: 'reach:most', label: 'slowest to' },
]

const SCOPE_OPTIONS = [
  { value: 'reg', label: 'regular season' },
  { value: 'all', label: 'playoffs included' },
]

// the eras: the whole league, then the league's own turning points
const ERAS = [[1942, 'the Original Six'], [1967, 'expansion'], [1979, 'the WHA merger'], [1992, '84-game seasons'], [2005, 'the salary cap'], [2015, '3-on-3 overtime']]
const eraOptions = (ledger) => [
  { value: 0, label: `since ${fmtSeason(ledger.firstSeason)}`, hint: 'the whole league' },
  ...ERAS.filter(([y]) => y > ledger.firstSeason && y < ledger.currentSeason).map(([y, hint]) => ({ value: y, label: `since ${fmtSeason(y)}`, hint })),
]

const floorHint = (ledger, key) => { const f = statFloor(ledger, key); return f > ledger.firstSeason ? `since ${fmtSeason(f)}` : undefined }
const statOptions = (ledger, pos) => statsFor(pos).map((s) => ({ value: s.key, label: s.noun, hint: floorHint(ledger, s.key) }))

/** every threshold of every stat the field has, as one test each: "3+ points", "a hat trick", "no goals against" */
function testOptions(ledger, pos) {
  const out = []
  for (const s of statsFor(pos)) {
    const hint = floorHint(ledger, s.key)
    for (const m of s.maxes ?? []) out.push({ value: `${s.key}:0-${m}`, label: testWords({ stat: s.key, min: 0, max: m }), hint })
    for (const t of s.thresholds) out.push({ value: `${s.key}:${t}`, label: testWords({ stat: s.key, min: t }), hint })
  }
  return out
}
const testValue = (t) => `${t.stat}:${t.min}${t.max != null ? `-${t.max}` : ''}`
const parseTest = (v) => { const m = /^([a-z]+):(\d+)(?:-(\d+))?$/.exec(v); return m[3] == null ? { stat: m[1], min: Number(m[2]) } : { stat: m[1], min: Number(m[2]), max: Number(m[3]) } }

// the number in the sentence: a text box that holds what is typed (an empty box while retyping included) and
// commits every whole number above zero as it is typed, so the board stays live; focus selects the number so
// typing replaces it; leaving the box empty puts the value back. Typing commits without tracking; the `query`
// event fires once, on blur, when the number differs from the one the box had on focus. The steppers and the
// arrow keys track per step, as a picker does.
function NumberWord({ value, onChange, onSettle, step = 1, wide, label }) {
  const [draft, setDraft] = useState(String(value))
  const [editing, setEditing] = useState(false)
  const atFocus = useRef(value)
  useEffect(() => { if (!editing) setDraft(String(value)) }, [value, editing])
  const valid = (s) => { const v = Number(s); return s !== '' && Number.isInteger(v) && v > 0 ? v : null }
  const commit = (s, opts) => { const v = valid(s); if (v != null && v !== value) onChange(v, opts) }
  const stepTo = (v) => { setDraft(String(v)); onChange(v) }
  const shown = editing ? draft : String(value)
  return (
    <span className="nwrap">
      <button className="nstep" onClick={() => stepTo(Math.max(1, value - step))} aria-label={`${label} down`}><Chevron left /></button>
      <input className={'nin' + (wide ? ' wide' : '')} type="text" inputMode="numeric" pattern="[0-9]*" value={shown} aria-label={label}
        style={{ width: `${Math.max(wide ? 5 : 3, shown.length + 1)}ch` }}
        onFocus={(e) => { setEditing(true); setDraft(String(value)); atFocus.current = value; e.target.select() }}
        onChange={(e) => { const s = e.target.value.replace(/[^0-9]/g, ''); setDraft(s); commit(s, { track: false }) }}
        onBlur={() => { setEditing(false); commit(draft, { track: false }); const final = valid(draft) ?? value; if (final !== atFocus.current) onSettle(final) }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); else if (e.key === 'ArrowUp') { e.preventDefault(); stepTo(value + step) } else if (e.key === 'ArrowDown') { e.preventDefault(); stepTo(Math.max(1, value - step)) } }} />
      <button className="nstep" onClick={() => stepTo(value + step)} aria-label={`${label} up`}><Chevron /></button>
    </span>
  )
}

/** `onChange(q, { track })` changes the query (tracked unless told not to); `onSettle(q)` tracks a query the number box settled on */
export function Sentence({ query, ledger, onChange, onSettle }) {
  const set = (patch, opts) => onChange({ ...query, ...patch }, opts)
  const settle = (n) => onSettle({ ...query, n })
  const stats = statsFor(query.pos)
  const seqOptions = [
    { value: 'games', label: seqWords('games', query.n) },
    ...(query.pos === 'G' ? [{ value: 'starts', label: seqWords('starts', query.n) }] : []),
    { value: 'seasons', label: seqWords('seasons', query.n) },
    { value: 'teamGames', label: `team ${seqWords('teamGames', query.n)}` },
  ]
  const isTest = query.how === 'count' || query.how === 'every' || query.how === 'streak'
  const tests = testOptions(ledger, query.pos)
  const setTest = (i, v) => set({ tests: query.tests.map((t, k) => (k === i ? parseTest(v) : t)) })
  const addTest = () => {
    const used = new Set(query.tests.map((t) => t.stat))
    const next = stats.find((s) => !used.has(s.key)) ?? stats[0]
    set({ tests: [...query.tests, next.thresholds.length ? { stat: next.key, min: next.thresholds[Math.min(1, next.thresholds.length - 1)] } : { stat: next.key, min: 0, max: next.maxes[0] }] })
  }
  const stat = statByKey(query.stat)
  const reachSeq = seqOptions.filter((o) => o.value !== 'seasons')

  return (
    <div className="sentence" role="group" aria-label="The comparison">
      <Picker value={query.pos} options={POS_OPTIONS} onChange={(pos) => set({ pos })} ariaLabel="Position" />
      <Picker value={`${query.how}:${query.dir}`} options={HOW_OPTIONS} onChange={(v) => { const [how, dir] = v.split(':'); set({ how, dir }) }} ariaLabel="How the games count" />
      {query.how === 'reach' && (
        <>
          <NumberWord value={query.n} onChange={(n, opts) => set({ n }, opts)} onSettle={settle} step={stat.thresholds[0] >= 10 ? 100 : query.n >= 100 ? 50 : 10} wide label="The target" />
          <Picker value={query.stat} options={statOptions(ledger, query.pos)} onChange={(stat) => set({ stat })} ariaLabel="The stat" />
          <span>by</span>
          <Picker value={query.seq} options={reachSeq} onChange={(seq) => set({ seq })} ariaLabel="Counting what" />
        </>
      )}
      {query.how === 'sum' && (
        <>
          <Picker value={query.stat} options={statOptions(ledger, query.pos)} onChange={(stat) => set({ stat })} ariaLabel="The stat" />
          <span>through their first</span>
        </>
      )}
      {isTest && (
        <>
          {query.tests.map((t, i) => (
            <span key={i} className="nwrap">
              {i > 0 && <span>and&nbsp;</span>}
              <Picker value={testValue(t)} options={tests} onChange={(v) => setTest(i, v)} ariaLabel={`Test ${i + 1}`} />
              {query.tests.length > 1 && <button className="xbtn" onClick={() => set({ tests: query.tests.filter((_, k) => k !== i) })} aria-label="Remove this test">×</button>}
            </span>
          ))}
          {query.tests.length < 3 && <button className="addbtn" onClick={addTest} aria-label="Add a test">+</button>}
          <span>in their first</span>
        </>
      )}
      {query.how !== 'reach' && (
        <>
          <NumberWord value={query.n} onChange={(n, opts) => set({ n }, opts)} onSettle={settle} step={query.seq === 'seasons' ? 1 : query.n >= 100 ? 50 : 10} label="The window" />
          <Picker value={query.seq} options={seqOptions} onChange={(seq) => set({ seq })} ariaLabel="Counting what" />
        </>
      )}
      <span>·</span>
      <Picker value={query.scope} options={SCOPE_OPTIONS} onChange={(scope) => set({ scope })} ariaLabel="Playoffs" />
      <span>·</span>
      <Picker value={query.since ?? 0} options={eraOptions(ledger)} onChange={(v) => set({ since: v || null })} ariaLabel="Era" />
    </div>
  )
}
