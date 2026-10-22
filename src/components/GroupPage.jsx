// A team page: the best forwards, defensemen or goalies in one franchise's
// history (src/lib/groups.ts), ranked by the position's first metric, with
// one cumulative line per player for each metric and the table. The data is
// computed by the prerender and embedded in the page (#group-data), so the
// client needs no ledger. The College Football Comparator's group page,
// ported; GroupIndex is the /team/ page that reaches them all.
import { useEffect, useState } from 'react'
import { CoffeeIcon, ShareIcon } from './Icons.jsx'
import { PlayerFinder } from './PlayerFinder.jsx'
import { KOFI_URL } from './Notes.jsx'
import { useShare } from '../hooks/useShare.ts'
import { track } from '../lib/analytics.ts'
import { statByKey } from '../lib/stats.ts'
import { spanWords } from '../lib/words.ts'
import { fmtSeason } from '../lib/ledger.ts'
import { groupH1, groupLead, groupPath, groupTitle, CURVES, MIN_GAMES, GROUP_POS } from '../lib/groups.ts'
import { SITE } from '../lib/share.ts'

const BASE = import.meta.env.BASE_URL
const fmt = (n) => (n == null ? '—' : n.toLocaleString('en-US'))
const short = (name) => { const parts = name.split(' '); return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : name }
const POS_NOUN = { F: 'forwards', D: 'defensemen', G: 'goalies' }
const POS_ONE = { F: 'forward', D: 'defenseman', G: 'goalie' }

/** one cumulative line per player over his games for the franchise, the leader in cream, the rest faint; a hover lifts a line */
function Curves({ rows, m, stat }) {
  const lines = rows.filter((r) => r.curves?.[m]).slice(0, CURVES)
  if (!lines.length) return null
  // a curve is sampled; its points sit at evenly spaced games of his own, so x is his game, not the sample's index
  const len = Math.max(...lines.map((r) => r.games))
  const top = Math.max(1, ...lines.map((r) => r.curves[m][r.curves[m].length - 1]))
  const W = 560, H = 220, L = 42, R = 110, T = 12, B = 24
  const xg = (g) => L + (g / Math.max(1, len - 1)) * (W - L - R)
  const at = (r, j) => xg((j * (r.games - 1)) / Math.max(1, r.curves[m].length - 1))
  const y = (v) => T + (1 - v / top) * (H - T - B)
  const path = (r) => r.curves[m].map((v, j) => `${j ? 'L' : 'M'}${at(r, j).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const ticks = [0, Math.round(top / 2), top]
  // the names in a column at the right edge, in the order the lines end, nudged apart
  const ends = lines.map((r, k) => ({ k, y: y(r.curves[m][r.curves[m].length - 1]) })).sort((a, b) => a.y - b.y)
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 11) ends[i].y = ends[i - 1].y + 11
  for (let i = ends.length - 1; i >= 0; i--) if (ends[i].y > H - B) ends[i].y = H - B - (ends.length - 1 - i) * 11
  const labelY = new Map(ends.map((e) => [e.k, e.y]))
  return (
    <figure className="gchart">
      <figcaption>{stat.noun} · by game</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${stat.noun}, cumulative by game, ${lines.map((r) => r.name).join(', ')}`}>
        <line className="axis" x1={L} y1={y(0)} x2={W - R} y2={y(0)} />
        {ticks.map((t) => <text key={t} className="tick" x={L - 6} y={y(t) + 3} textAnchor="end">{fmt(t)}</text>)}
        <text className="tick" x={xg(0)} y={H - 6} textAnchor="start">1</text>
        <text className="tick" x={xg(len - 1)} y={H - 6} textAnchor="end">{fmt(len)}</text>
        {lines.map((r, k) => (
          <g key={r.id} className={'gl' + (k === 0 ? ' lead' : '')}>
            <path d={path(r)} />
            <line className="lead-line" x1={at(r, r.curves[m].length - 1)} y1={y(r.curves[m][r.curves[m].length - 1])} x2={W - R + 4} y2={labelY.get(k)} />
            <text x={W - R + 7} y={labelY.get(k) + 3}>{short(r.name)}</text>
          </g>
        )).reverse()}
      </svg>
    </figure>
  )
}

/** a row's link: his page where he has one (`pages`, the ids with one, which the prerender adds), else his row on the board */
const rowHref = (r, pos, pages) => (pages?.includes(r.id) ? `${BASE}player/${r.id}/` : `${BASE}?${pos === 'G' ? 'pos=G&' : ''}t=${r.id}`)

export function GroupPage({ preload }) {
  const [data] = useState(preload ?? null)
  const { copied, share: send } = useShare()
  useEffect(() => { if (data) track('team page', { team: data.id, pos: data.pos }) }, [data])
  useEffect(() => { if (data) document.title = groupTitle(data, SITE) }, [data])
  const share = () => {
    send(data ? groupLead(data) || groupH1(data) : window.location.href, window.location.href)
    track('share team', { team: data?.id ?? null, pos: data?.pos ?? null })
  }
  if (!data) return <main><h1>No page here</h1><p className="baserate">No team page at this address. Every team: <a href={`${BASE}team/`}>the team pages</a>.</p></main>
  const metrics = data.metrics.map((k) => statByKey(k))
  const others = GROUP_POS.filter((p) => p !== data.pos)
  return (
    <main>
      <div className="dateline">
        <span><a href={data.pos === 'G' ? `${BASE}?pos=G` : BASE}>← the board</a> · drewhoover.com · {spanWords(data.since, data.currentSeason)}</span>
        <span className="dateline-acts">
          <PlayerFinder />
          <a className="ico" href={KOFI_URL} onClick={() => track('kofi', { from: 'icons team' })} aria-label="Buy me a coffee"><CoffeeIcon /></a>
          <button className="ico" onClick={share} aria-label="Share this page"><ShareIcon /></button>
          {copied && <span className="toast">copied</span>}
        </span>
      </div>
      <p className="kicker"><a href={`${BASE}team/`}>NHL Comparator · every team</a></p>
      <h1 className="h1-q">{groupH1(data)}</h1>
      <p className="landing-line">{groupLead(data)}</p>
      <p className="baserate">
        Every {POS_ONE[data.pos]} with {MIN_GAMES} or more regular-season games for the {data.name} since {fmtSeason(data.since)}, ranked by {metrics[0].noun}; the lines are each one's {metrics[0].noun} game by game, the top {Math.min(CURVES, data.rows.length)} drawn.
        A name opens his page, where he has one, or his row on the board.
      </p>
      <div className="gcharts">
        {metrics.slice(0, 3).map((s, m) => <Curves key={s.key} rows={data.rows} m={m} stat={s} />)}
      </div>
      <section className="board" aria-label="The ranking">
        <div className="board-h"><span>{fmt(data.count)} {POS_NOUN[data.pos]} with {MIN_GAMES}+ games{data.count > data.rows.length ? `, the top ${data.rows.length}` : ''}</span><span>{metrics[0].noun}</span></div>
        <table className="gtable">
          <thead><tr><th>#</th><th>player</th><th>seasons</th><th>games</th>{metrics.map((s) => <th key={s.key} className="num">{s.noun}</th>)}</tr></thead>
          <tbody>
            {data.rows.map((r, i) => (
              <tr key={r.id}>
                <td className="xn">{i + 1}</td>
                <td className="gname"><a href={rowHref(r, data.pos, data.pages)}>{r.name}</a></td>
                <td className="xd">{spanWords(r.from, r.to)}</td>
                <td className="num xd">{fmt(r.games)}</td>
                {r.totals.map((v, m) => <td key={m} className={'num' + (m === 0 ? ' lead' : '')}>{fmt(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="notes" style={{ marginTop: 24 }}>
        Also for the {data.name}: {others.map((p, i) => <span key={p}>{i > 0 && ', '}<a href={`${BASE}${groupPath(data.id, p).slice(1)}`}>{POS_NOUN[p]}</a></span>)}. <a href={`${BASE}team/`}>Every team</a>.
        A franchise is a current team and every team it has been, as the NHL ruled on {data.ruling} (the Jets include the first Jets, 1979-96, and the Atlanta Thrashers; the inactive Coyotes and the defunct teams have no page). The games are the NHL's own; the <a href={`${BASE}#method`}>Method</a> says what is in them.
      </p>
      <footer>
        <a href="https://drewhoover.com/">drewhoover.com</a> · <a href="https://github.com/DrewHoo/nhl-comparator">source & receipts</a> ·{' '}
        <a href={KOFI_URL} onClick={() => track('kofi', { from: 'footer team' })}>buy me a coffee</a>
      </footer>
    </main>
  )
}

/** /team/: every franchise with its three pages */
export function GroupIndex({ preload }) {
  const items = preload?.items ?? []
  return (
    <main>
      <div className="dateline"><span><a href={BASE}>← the board</a> · drewhoover.com</span><span className="dateline-acts"><PlayerFinder /></span></div>
      <p className="kicker"><a href={BASE}>NHL Comparator</a></p>
      <h1 className="h1-q">Every NHL team's best players, by position</h1>
      <p className="baserate">The best forwards, defensemen and goalies in each of the 32 franchises' history, every one with {MIN_GAMES} or more regular-season games for the team, with their numbers drawn game by game.</p>
      <ul className="gindex">
        {items.map((it) => (
          <li key={it.id}><b>{it.name}</b> {it.pos.map((p) => <a key={p} href={`${BASE}${groupPath(it.id, p).slice(1)}`}>{POS_NOUN[p]}</a>)}</li>
        ))}
      </ul>
      <footer>
        <a href="https://drewhoover.com/">drewhoover.com</a> · <a href="https://github.com/DrewHoo/nhl-comparator">source & receipts</a> ·{' '}
        <a href={KOFI_URL} onClick={() => track('kofi', { from: 'footer team index' })}>buy me a coffee</a>
      </footer>
    </main>
  )
}
