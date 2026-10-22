import { useEffect, useMemo, useRef, useState } from 'react'
import { Sentence } from './components/Sentence.jsx'
import { Board, rowId } from './components/Board.jsx'
import { Panel } from './components/Panel.jsx'
import { Notes, KOFI_URL } from './components/Notes.jsx'
import { PlayerFinder } from './components/PlayerFinder.jsx'
import { CoffeeIcon, ShareIcon } from './components/Icons.jsx'
import { useShare } from './hooks/useShare.ts'
import { decodeLedger, hasCols, mergeExtra, fmtSeason } from './lib/ledger.ts'
import { colsNeeded, evaluate, normalize, DEFAULT_QUERY } from './lib/query.ts'
import { toUrl } from './lib/url.ts'
import { landingFor, parseLocation, toAddress } from './lib/landing.ts'
import { Landings } from './components/Landings.jsx'
import { queryWords, sinceWords } from './lib/words.ts'
import { peerOf } from './lib/compare.ts'
import { shareText, shareTitle } from './lib/share.ts'
import { track } from './lib/analytics.ts'
import { writeUrl } from './urlState.js'
import skatersFile from './data/skaters.json'

// the skaters' core columns ship with the page (the default board is every
// skater by points); their extra columns (dates, opponents, results, shots,
// plus-minus, the special-teams goals) load the first time a query or the
// panel needs them, and the goalies load the first time the field is goalies
const SKATERS = decodeLedger(skatersFile)
const files = import.meta.glob(['./data/goalies.json', './data/skaters-x.json'])
let goaliesCache = null
const loadGoalies = async () => goaliesCache ?? (goaliesCache = decodeLedger((await files['./data/goalies.json']()).default))
let extraLoading = null
const loadExtra = () => extraLoading ?? (extraLoading = files['./data/skaters-x.json']().then((m) => mergeExtra(SKATERS, m.default)))
const PANEL_COLS = ['date', 'home', 'opp', 'result']
const ready = (ledger, query, open) => hasCols(ledger, colsNeeded(query)) && (!open || hasCols(ledger, PANEL_COLS))

/** the open row's top, clear of the index site's sticky back bar */
const BACK_BAR = 64
const BASE = import.meta.env.BASE_URL
const relPath = (pathname) => (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, ''))

/** `initial` is the page's own query (a landing's, from its path; the prerender and main.jsx pass the same one, so the hydrate matches); `preloadGoalies` lets the prerender hand the goalie ledger in */
export default function App({ initial = null, preloadGoalies = null }) {
  if (preloadGoalies && !goaliesCache) goaliesCache = preloadGoalies
  const [query, setQuery] = useState(initial?.query ?? DEFAULT_QUERY)
  const [open, setOpen] = useState(null)
  const [vs, setVs] = useState(null)
  const [goalies, setGoalies] = useState(goaliesCache)
  // bumps when the extra columns land, so the board re-evaluates
  const [loadedAt, setLoadedAt] = useState(0)
  const { copied, share } = useShare()
  const landOn = useRef(null)
  const booted = useRef(false)
  const rootTitle = useRef(null)

  // URL state after mount, never during render: the prerender has no window
  useEffect(() => {
    const s = parseLocation(relPath(window.location.pathname), window.location.search)
    setQuery(s.query)
    setOpen(s.open)
    setVs(s.vs)
    landOn.current = s.open
    rootTitle.current = document.title
    booted.current = true
    track('query', { words: queryWords(s.query) })
  }, [])

  // the goalie ledger, when the field is goalies
  useEffect(() => {
    if (query.pos !== 'G' || goalies) return
    let live = true
    loadGoalies().then((g) => { if (live) setGoalies(g) })
    return () => { live = false }
  }, [query.pos, goalies])

  const ledger = query.pos === 'G' ? goalies : SKATERS
  const isReady = !!ledger && ready(ledger, query, open)
  // the extra columns, when the query or the open row reads them; a fastest-to board fetches them behind the board for the ages
  const wantsAges = query.how === 'reach' && query.seq !== 'teamGames'
  useEffect(() => {
    if (!ledger || ledger.kind !== 'skaters' || (isReady && !(wantsAges && !ledger.loaded.has('date')))) return
    let live = true
    loadExtra().then(() => { if (live) setLoadedAt((n) => n + 1) })
    return () => { live = false }
  }, [ledger, isReady, wantsAges])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const board = useMemo(() => (ledger && hasCols(ledger, colsNeeded(query)) ? evaluate(ledger, query) : null), [ledger, query, loadedAt])
  const row = useMemo(() => (board && open ? [...board.ranked, ...board.onTheWay].find((r) => r.key === open) ?? null : null), [board, open])
  const peer = useMemo(() => (board && row ? peerOf(board, row, vs) : null), [board, row, vs])

  useEffect(() => {
    if (!landOn.current || !row) return
    landOn.current = null
    const el = document.getElementById(rowId(row.key))
    if (el) requestAnimationFrame(() => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - BACK_BAR }))
  }, [row])

  // the tab says what the share worker would: the open comparison, a landing's own title, the sentence; the page's own title at the bare address
  useEffect(() => {
    if (!booted.current) return
    const l = landingFor(query)
    document.title = row ? shareTitle(query, row, peer) : l ? `${l.title} · NHL Comparator` : toUrl({ query, open: null }) ? shareTitle(query) : rootTitle.current
  }, [query, row, peer, vs])

  /** changes the query; `track: false` leaves the `query` event to the caller (the number box tracks once, on blur) */
  const change = (q, { track: tracked = true } = {}) => {
    const next = normalize(q)
    // a field change that drops the open player out of it closes him
    const drops = row != null && (next.pos === 'G') !== (query.pos === 'G') || (row != null && next.pos !== 'ALL' && next.pos !== 'G' && (row.player.pos === 'D' ? 'D' : 'F') !== next.pos)
    setQuery(next)
    if (drops) { setOpen(null); setVs(null) }
    writeUrl(toAddress({ query: next, open: drops ? null : open, vs: drops ? null : vs }), 'replace')
    if (tracked) track('query', { words: queryWords(next) })
  }
  const settle = (q) => track('query', { words: queryWords(normalize(q)) })
  const openRow = (key) => {
    const next = open === key ? null : key
    setOpen(next)
    setVs(null)
    writeUrl(toAddress({ query, open: next }), 'replace')
    if (next) track('open', { player: next })
  }
  // the finder: open his row and land on it, wherever it is on the board; a goalie moves the field to goalies first
  const findPlayer = (p) => {
    let q = query
    if ((p.pos === 'G') !== (query.pos === 'G')) { q = normalize({ ...query, pos: p.pos === 'G' ? 'G' : 'ALL' }); setQuery(q) }
    else if (query.pos !== 'ALL' && query.pos !== 'G' && (p.pos === 'D' ? 'D' : 'F') !== query.pos) { q = normalize({ ...query, pos: 'ALL' }); setQuery(q) }
    const key = q.seq === 'teamGames' && board ? [...board.ranked, ...board.onTheWay].filter((r) => r.player.id === p.id).sort((a, b) => b.season - a.season)[0]?.key ?? `${p.id}:${p.to}` : String(p.id)
    landOn.current = key
    setOpen(key)
    setVs(null)
    writeUrl(toAddress({ query: q, open: key }), 'replace')
    track('open', { player: key, from: 'finder' })
  }
  const setPeer = (key) => {
    setVs(key)
    writeUrl(toAddress({ query, open, vs: key }), 'replace')
    track('peer', { player: open, vs: key })
  }
  const onShare = () => {
    share(shareText(query, board, row), window.location.href)
    track('share', { words: queryWords(query), player: open, vs: peer?.key ?? null })
  }

  const landing = landingFor(query)

  return (
    <main>
      <div className="dateline">
        <span>{`drewhoover.com · ${fmtSeason(SKATERS.firstSeason)} to ${fmtSeason(SKATERS.currentSeason)}`}<span className="dateline-upd"> · updated {String(SKATERS.builtAt).slice(0, 10)}</span></span>
        <span className="dateline-acts">
          <PlayerFinder current={row?.player.id ?? null} onPick={findPlayer} />
          <a className="ico" href={KOFI_URL} onClick={() => track('kofi', { from: 'icons board' })} aria-label="Buy me a coffee"><CoffeeIcon /></a>
          <button className="ico" onClick={onShare} aria-label="Share this board"><ShareIcon /></button>
          {copied && <span className="toast">copied</span>}
        </span>
      </div>
      {landing ? <><p className="kicker"><a href={BASE}>NHL Comparator</a></p><h1 className="h1-q">{landing.h1}</h1></> : <h1>NHL Comparator</h1>}
      <Sentence query={query} ledger={SKATERS} onChange={change} onSettle={settle} />
      <p className="baserate">
        <span className="sr-only">{queryWords(query, board?.since ?? query.since)}. </span>
        Same point in the career, every {query.seq === 'teamGames' ? 'season' : 'career'} {sinceWords(board?.since ?? query.since ?? SKATERS.firstSeason)}.
        {board && board.ranked[0] && board.ranked[0].value != null && <> The leader: <b>{board.ranked[0].player.name}</b>, {board.ranked[0].value.toLocaleString('en-US')}.</>}
      </p>
      {board ? <Board board={board} query={query} ledger={ledger} open={open} onOpen={openRow} panel={row && (hasCols(ledger, PANEL_COLS) ? <Panel key={row.key} row={row} board={board} query={query} ledger={ledger} peerKey={vs} onPeer={setPeer} onClose={() => openRow(row.key)} /> : <p className="loading">loading his games…</p>)} /> : <p className="loading">{query.pos === 'G' ? 'loading the goalies…' : 'loading the rest of the ledger…'}</p>}
      <Landings current={landing?.slug ?? null} />
      <Notes ledger={SKATERS} />
      <footer>
        <a href="https://drewhoover.com/">drewhoover.com</a> · data rebuilt daily in season ·{' '}
        <a href="https://github.com/DrewHoo/nhl-comparator">source & receipts</a> ·{' '}
        <a href={KOFI_URL} onClick={() => track('kofi', { from: 'footer' })}>buy me a coffee</a>
      </footer>
    </main>
  )
}
