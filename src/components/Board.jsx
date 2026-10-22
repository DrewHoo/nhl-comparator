// The board: every entity with the whole window, ranked, then the ones still
// inside it. One dense row each; a tap opens the panel under the row. Long
// lists page, and the open row is always on the page.
import { useState } from 'react'
import { rowName, seqWords, spanWords, testsWords } from '../lib/words.ts'
import { statByKey } from '../lib/stats.ts'
import { fmtSeason } from '../lib/ledger.ts'
import { ageAtWindow } from '../lib/query.ts'

const PAGE = 25

/** the DOM id of a row, for a deep link to land on it */
export const rowId = (key) => `row-${key}`

/** a fastest-to row's age at the game that got him there: career windows only, once the dates are loaded, where the birth date is known */
const ageOf = (ledger, r, q) => (q.how === 'reach' && q.seq !== 'teamGames' && r.value != null && ledger?.loaded.has('date') ? ageAtWindow(ledger, r, q) : null)

function ValueCell({ r, q, ledger }) {
  if (r.value == null) return <span className="bval soft">—<small>{r.reached} {seqWords(q.seq, r.reached)}</small></span>
  const n = r.value
  const age = ageOf(ledger, r, q)
  return (
    <span className={'bval' + (r.complete ? '' : ' otl')}>
      {n.toLocaleString('en-US')}
      <small>{q.how === 'reach' ? `${q.seq === 'teamGames' ? 'team games' : seqWords(q.seq, n)}${age != null ? ` · age ${age}` : ''}` : r.complete ? (q.how === 'every' ? `of ${q.n}` : '') : `thru ${r.reached}`}</small>
    </span>
  )
}

function Rows({ rows, q, ledger, open, onOpen, panel, start = 0 }) {
  return rows.map((r, i) => (
    <div key={r.key} id={rowId(r.key)} className={'brow-wrap' + (open === r.key ? ' open' : '')}>
      <button className={'brow' + (open === r.key ? ' hi' : '')} onClick={() => onOpen(r.key)} aria-pressed={open === r.key} aria-expanded={open === r.key}>
        <span className={'brank' + (r.rank === 1 ? ' one' : '')}>{r.complete ? `${r.tied ? 'T' : ''}${r.rank}` : start + i + 1}</span>
        <span className="bname">
          <b>{rowName(r)}</b>
          <small>{r.season != null ? `${r.team} · ${r.reached} of ${q.n} games` : spanWords(r.from, r.to)}</small>
        </span>
        <ValueCell r={r} q={q} ledger={ledger} />
      </button>
      {open === r.key && panel}
    </div>
  ))
}

export function Board({ board, query, ledger, open, onOpen, panel }) {
  const [shown, setShown] = useState(PAGE)
  const [shownWay, setShownWay] = useState(6)
  const q = query
  const openAt = open ? board.ranked.findIndex((r) => r.key === open) : -1
  const openWayAt = open && openAt < 0 ? board.onTheWay.findIndex((r) => r.key === open) : -1
  const showN = openAt >= shown ? openAt + 1 : shown
  const showWayN = openWayAt >= shownWay ? openWayAt + 1 : shownWay
  const stat = statByKey(q.stat)
  const ranked = board.ranked
  const way = board.onTheWay
  const unit = q.seq === 'teamGames' ? 'player-seasons' : 'careers'
  return (
    <section className="board" aria-label="The board">
      <div className="board-h">
        <span>{ranked.length.toLocaleString('en-US')} {unit} {q.how === 'reach' ? 'that got there' : 'with the whole window'}</span>
        <span>{q.how === 'reach' ? (q.seq === 'teamGames' ? 'team games' : seqWords(q.seq, 2)) : q.how === 'sum' ? stat.noun : q.how === 'streak' ? `straight games of ${testsWords(q.tests)}` : `games of ${testsWords(q.tests)}`}</span>
      </div>
      {board.gapped > 0 && <p className="gapped">{board.gapped.toLocaleString('en-US')} {board.gapped === 1 ? 'career that began' : 'careers that began'} before {fmtSeason(board.since)} {board.gapped === 1 ? 'sits' : 'sit'} out: the league recorded {q.how === 'sum' || q.how === 'reach' ? stat.noun : testsWords(q.tests).replace(/^(a |\d+\+ |no )/, '')} from then on.</p>}
      {ranked.length === 0 && <p className="empty">Nobody has {q.how === 'reach' ? 'got there' : 'the whole window'} yet. Shorten it.</p>}
      <Rows rows={ranked.slice(0, showN)} q={q} ledger={ledger} open={open} onOpen={onOpen} panel={panel} />
      {ranked.length > showN && <button className="morebtn" onClick={() => setShown(showN + PAGE * 2)}>see more · {ranked.length - showN} below</button>}
      {way.length > 0 && (
        <>
          <div className="board-h" style={{ marginTop: 18 }}>
            <span>{way.length.toLocaleString('en-US')} still inside the window</span>
            <span>so far</span>
          </div>
          <Rows rows={way.slice(0, showWayN)} q={q} ledger={ledger} open={open} onOpen={onOpen} panel={panel} />
          {way.length > showWayN && <button className="morebtn" onClick={() => setShownWay(showWayN + PAGE)}>see more · {way.length - showWayN} below</button>}
        </>
      )}
    </section>
  )
}
