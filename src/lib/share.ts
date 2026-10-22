// The words a shared address carries: a board's title and description, a
// comparison's, the share button's text, the rows a card draws. Pure, so
// the share worker (workers/share), the share button, the tab title and the
// tests all say the same thing; the worker adds the data. The NFL and WNBA
// comparators have the same module under the same name.
import type { Board, Query, Row } from './query.ts'
import { DEFAULT_QUERY } from './query.ts'
import { compare, crossingWords, matchWords } from './compare.ts'
import { countWords, statByKey } from './stats.ts'
import { fmtSeason } from './ledger.ts'
import { queryWords, rowName, rowWords, rankWords, seqWords, sinceWords, testsWords } from './words.ts'

export const SITE = 'NHL Comparator'

const unitWords = (q: Query) => (q.seq === 'teamGames' ? 'player-seasons' : 'careers')
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** the row's claim as one sentence: "Wayne Gretzky has 1,337 points through his first 500 games, 1st of 4,112 careers since 1917-18." */
export function claimWords(q: Query, board: Board, row: Row): string {
  const tail = row.complete && row.value != null ? `, ${rankWords(row, board.ranked.length)} ${unitWords(q)} ${sinceWords(board.since)}` : row.value == null ? '' : ', still inside the window'
  return `${row.player.name} has ${rowWords(row, q)}${tail}.`
}

/** what the share button sends with the board's address: the open row's claim, else the sentence */
export const shareText = (q: Query, board: Board | null, row: Row | null) => (board && row ? claimWords(q, board, row) : `${cap(queryWords(q, board?.since ?? q.since))}.`)

/** whether the address says more than the root page does: any slot off its default, or a player open */
export function isShared(q: Query, open: string | null): boolean {
  if (open) return true
  const d = DEFAULT_QUERY
  return q.pos !== d.pos || q.stat !== d.stat || q.how !== d.how || q.n !== d.n || q.seq !== d.seq || q.scope !== d.scope || q.since !== d.since || q.dir !== d.dir || q.tests.length > 0
}

/** "Skaters with the most points through their first 500 games · NHL Comparator"; with a row open, "Connor McDavid vs Wayne Gretzky: most points through the first 500 games · NHL Comparator" */
export function shareTitle(q: Query, open: Row | null = null, peer: Row | null = null): string {
  if (open) return `${rowName(open)}${peer ? ` vs ${rowName(peer)}` : ''}: ${cardHeading(q)} · ${SITE}`
  return `${cap(queryWords(q))} · ${SITE}`
}

/** "Wayne Gretzky leads with 1,337 points through his first 500 games." (ties: "A and B lead with …"); empty when nobody has the window */
export function leaderWords(board: Board, q: Query): string {
  const top = board.ranked[0]
  if (!top || top.value == null) return ''
  const tied = board.ranked.filter((r) => r.value === top.value)
  const names = tied.slice(0, 3).map(rowName)
  const who = tied.length > 3 ? `${names.slice(0, 2).join(', ')} and ${tied.length - 2} others` : names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0]
  return `${who} ${tied.length > 1 ? 'lead' : 'leads'} with ${rowWords(top, q)}.`
}

/** the description: the leader when the board is known; the open player's claim, read against his peer, when one is */
export function shareDescription(q: Query, board: Board | null, open: Row | null, firstSeason: number, peer: Row | null = null): string {
  const since = board?.since ?? q.since ?? firstSeason
  const unit = q.seq === 'teamGames' ? 'player-season' : 'career'
  const parts: string[] = []
  if (open) {
    parts.push(board ? claimWords(q, board, open) : `${open.player.name} has ${rowWords(open, q)}.`)
    if (peer) {
      if (peer.value != null) parts.push(`${rowName(peer)}: ${rowWords(peer, q)}.`)
      const cmp = compare(open, peer, q)
      if (cmp) {
        parts.push(cmp.xs[0] ? `${open.player.name} ${crossingWords(cmp.xs[0], peer, q)}.` : 'Their curves never met.')
        const m = matchWords(open, peer, cmp, q)
        if (m) parts.push(m)
      }
    }
  } else if (board) { const w = leaderWords(board, q); if (w) parts.push(w) }
  parts.push(`Every NHL ${unit} ${sinceWords(since)} ranked at the same point: ${queryWords(q, null)}. Open a row to read it against a peer.`)
  return parts.join(' ')
}

/** what the card's heading says: "MOST POINTS THROUGH THE FIRST 500 GAMES" */
export function cardHeading(q: Query): string {
  const stat = statByKey(q.stat)
  const win = q.seq === 'teamGames' ? `a team's first ${q.n} games` : `the first ${q.n} ${seqWords(q.seq, q.n)}`
  if (q.how === 'sum') return `${q.dir} ${stat.noun} through ${win}`
  if (q.how === 'reach') return `${q.dir === 'fewest' ? 'fastest' : 'slowest'} to ${countWords(q.n, stat)}${q.seq === 'teamGames' ? ' from the start of a season' : ''}`
  const t = testsWords(q.tests)
  if (q.how === 'every') return `${t} in each of ${win}`
  if (q.how === 'streak') return `longest streak of ${t} in ${win}`
  return `${q.dir} games of ${t} in ${win}`
}

/** "1979–99", "2015–26", "1991–2015": a career's span, short */
export function shortSpan(from: number, to: number): string {
  if (from === to) return fmtSeason(from)
  const end = to + 1
  return Math.floor(from / 100) === Math.floor(end / 100) ? `${from}–${String(end).slice(2)}` : `${from}–${end}`
}

export interface CardRow {
  rank: string
  name: string
  /** "1979–99", or "thru 93" for a row still inside the window */
  span: string
  value: string
  /** the row still inside the window: the value in rust */
  live: boolean
  /** the open player's row */
  hi: boolean
}

/** the card's rows: the top of the board, with the open player's row in place of the last when he is further down */
export function cardRows(board: Board, q: Query, open: string | null, n = 6): CardRow[] {
  const all = [...board.ranked, ...board.onTheWay]
  const top = board.ranked.slice(0, n)
  const openRow = open ? all.find((r) => r.key === open) ?? null : null
  if (openRow && !top.includes(openRow)) top.splice(Math.max(0, Math.min(top.length, n - 1)), top.length >= n ? 1 : 0, openRow)
  const way = (r: Row) => r.season == null && !r.complete
  return top.map((r) => ({
    rank: r.complete && r.value != null ? `${r.tied ? 'T' : ''}${r.rank}` : '—',
    name: rowName(r),
    span: way(r) ? `thru ${r.reached}` : r.season != null ? `${r.reached} of ${q.n}` : shortSpan(r.from, r.to),
    value: r.value == null ? '—' : r.value.toLocaleString('en-US'),
    live: way(r),
    hi: r.key === open,
  }))
}

export interface CardSide {
  name: string
  value: string
  /** the unit beside the value: "points", "games" */
  unit: string
  /** the small print under it: "1st of 4,112 · through his first 500 games" */
  claim: string
}

export interface CardChart {
  me: number[]
  them: number[]
  /** the window the chart covers */
  n: number
  /** "game" or "start", for the labels */
  unit: string
}

export interface CompareCardData {
  /** "Connor McDavid vs Wayne Gretzky" */
  heading: string
  sides: [CardSide, CardSide]
  /** the panel's lines: where the curves met, what he needs to match */
  lines: string[]
  /** the two curves, when the board is a career window */
  chart: CardChart | null
}

/** a comparison's card, in the panel's words: both sides, where the curves met, the curves */
export function compareCard(q: Query, board: Board, row: Row, peer: Row): CompareCardData {
  const stat = statByKey(q.stat)
  const unit = q.how === 'reach' ? (q.seq === 'teamGames' ? 'team games' : seqWords(q.seq, 2)) : q.how === 'sum' ? stat.noun : 'games'
  const field = board.ranked.length
  const side = (r: Row): CardSide => ({
    name: rowName(r),
    value: r.value == null ? '—' : r.value.toLocaleString('en-US'),
    unit,
    claim: `${r.complete && r.value != null ? rankWords(r, field) : 'still inside the window'} · ${r.value == null ? `${r.reached} ${seqWords(q.seq, r.reached)} so far` : r.season != null ? `${r.team}'s first ${q.n} games of ${fmtSeason(r.season)}` : q.how === 'reach' ? `to ${countWords(q.n, stat)}` : `through his first ${r.reached} ${seqWords(q.seq, r.reached)}`}`,
  })
  const cmp = compare(row, peer, q)
  const lines: string[] = []
  if (cmp) {
    lines.push(cmp.xs[0] ? `${row.player.name} ${crossingWords(cmp.xs[0], peer, q)}.` : 'Their curves never met.')
    const m = matchWords(row, peer, cmp, q)
    if (m) lines.push(m)
  } else {
    lines.push(`${rowName(row)}: ${rowWords(row, q)}.`, `${rowName(peer)}: ${rowWords(peer, q)}.`)
  }
  return {
    heading: `${row.player.name} vs ${peer.player.name}`,
    sides: [side(row), side(peer)],
    lines,
    chart: cmp ? { me: cmp.me, them: cmp.them, n: cmp.n, unit: seqWords(q.seq, 1) } : null,
  }
}

// ---- a player's page (src/components/PlayerPage.jsx)

import type { RecordRow } from './records.ts'
import { placeWords, recordWords, POS_WORDS } from './words.ts'

/** the page's lead line, the share text: his best row, or what the page is */
export function playerLead(name: string, field: 'ALL' | 'G', face: RecordRow | null | undefined, firstSeason: number): string {
  return face ? `${name}: ${recordWords(face)}, ${placeWords(face)}.` : `Every comparison ${name} leads among NHL ${POS_WORDS[field]} at the same point in the career, ${sinceWords(firstSeason)}.`
}

/** a player page's head; the title is the fact people type: "Wayne Gretzky: every comparison he leads at the same point in a career · NHL Comparator" */
export function playerText(name: string, field: 'ALL' | 'G', face: RecordRow | null | undefined, firstSeason: number, site = SITE): { title: string; description: string } {
  const lead = playerLead(name, field, face, firstSeason)
  const rest = ` Every comparison he leads among NHL ${POS_WORDS[field]} at the same point in the career, ${sinceWords(firstSeason)}.`
  return { title: `${name}: every comparison he leads at the same point in a career · ${site}`, description: face ? `${lead}${rest}` : lead }
}
