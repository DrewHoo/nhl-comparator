// What to read next, the citing ask and Ko-fi, and the Method notes: where
// the games come from and the rulings the words rest on.
import { track } from '../lib/analytics.ts'
import { fmtSeason } from '../lib/ledger.ts'

export const KOFI_URL = 'https://ko-fi.com/drewhooverdotcom'

export function Notes({ ledger }) {
  const first = fmtSeason(ledger.firstSeason), current = fmtSeason(ledger.currentSeason)
  return (
    <>
      <h2 className="notes-h">What to read next</h2>
      <div className="notes">
        <p>
          <a href="https://drewhoover.com/nfl-comparator/">NFL Comparator</a> — the same comparator over every NFL
          career since 1999, with a page for every player and what he leads.
        </p>
        <p>
          <a href="https://drewhoover.com/wnba-comparator/">WNBA Comparator</a> — the same comparator over every WNBA
          career since 1997, the league's first season.
        </p>
        <p>
          <a href="https://drewhoover.com/cfb-streak-king/">College Football Streak King</a> — the longest active and
          all-time win streaks and losing streaks in college football, under any definition, every FBS team since 1936.
        </p>
        <p>
          <a href="https://drewhoover.com/hostile-territory/">Hostile Territory</a> — every head coach's true road
          record against AP top-10 teams since 1936.
        </p>
        <p>
          <a href="https://drewhoover.com/how-many-rings/">How Many Rings?</a> — every person on a
          national-championship staff since 1990, ranked by the rings they can claim.
        </p>
      </div>

      <h2 className="notes-h">Using a comparison from here</h2>
      <div className="notes">
        <p>
          If a comparison from this page ends up in your article, broadcast, podcast or thread, please cite it: name
          the site and link to the board; the url encodes the comparison.
        </p>
        <p>
          The site is free and serves no ads. If you enjoyed using it, consider{' '}
          <a href={KOFI_URL} onClick={() => track('kofi', { from: 'notes' })}>buying me some server compute</a> or
          donating to The Internet Archive's <a href="https://archive.org/donate">Wayback Machine</a> (I am a monthly
          donor, FTR).
        </p>
      </div>

      <section className="notes" id="method" aria-label="Method">
        <h2>Method</h2>
        <p>
          Every row is a player's games in order, with his line and the result, from the NHL's own game records,
          read through the league's public stats API ({first} to {current}, every regular-season and playoff game
          the league lists), rebuilt on {String(ledger.builtAt).slice(0, 10)}. The league's first season is {first},
          so a career claim here holds for the whole league. Birth dates are Wikidata's (CC0). The NHL's own
          milestone records (Gretzky's 50th goal in Edmonton's 39th game, Lemieux's in his 44th and Pittsburgh's 46th,
          McDavid's 1,000th point in his 659th game) are the gates the build has to pass before it ships.
        </p>
        <p>
          A <b>game</b> is one the player dressed for and the league lists him in, 0-point games included; before
          1997-98 the league recorded no ice time, so dressing is the only test there is. A <b>start</b> exists for goalies
          only, from the league's own flag. A <b>win</b> is a goalie's decision; for a team game it is the team's result,
          and a loss in overtime or a shootout is its own result, not a loss, the way the standings count it. "Team games
          of a season" count the team's schedule from opening night, so a player who sat one has a gap the window still
          counts; that is the window the record book uses for "50 goals in 50 games", which is why Lemieux's 1988-89 reads
          46 here and 44 by his own games. The regular season is the default; the word beside it switches the playoffs in,
          and the two are never summed without saying so. "Seasons" are NHL seasons, so a first season is not always a
          rookie season: Gretzky's 137 points in 1979-80 came after a WHA year, and the league's rookie records skip him.
        </p>
        <p>
          Each stat starts when the league started recording it, and the sentence says so: goals, assists, points and
          penalty minutes from {first}; power-play and shorthanded goals from 1933-34; a goalie's saves from 1955-56; shots
          and plus-minus from 1959-60 (official from 1967-68); a goalie's overtime losses as their own decision from
          2005-06. A career that began before a stat's first season sits out that stat's career fields, and the board says
          how many did. Assists were credited more sparingly before the mid-1930s, so a points board across that line
          compares two scoring rules.
        </p>
        <p>
          What is not here: WHA games (the NHL does not count them, so Howe's, Hull's and Gretzky's WHA years are out),
          All-Star games, and the 1918 to 1926 Stanley Cup Finals against the PCHA and WCHL champions, which the league
          lists as playoff games against a team that was never in the NHL. The 2020 qualifying round counts as playoff
          games, as the league counts it. Team codes are the codes of the day (the Hartford Whalers are HFD, not CAR).
        </p>
        <p>
          Ranks are competition ranks, ties included. "Still inside the window" lists the players who haven't played the
          whole window yet, with their total so far. The panel reads a row against a peer: where their curves met, and
          what the player needs over the next five games to match the peer there; the peer rides in the url, so a shared
          link opens the same comparison.
        </p>
        <p>
          A sibling of <a href="https://drewhoover.com/nfl-comparator/">NFL Comparator</a>, <a href="https://drewhoover.com/wnba-comparator/">WNBA Comparator</a> and{' '}
          <a href="https://drewhoover.com/cfb-streak-king/">College Football Streak King</a>.
        </p>
      </section>
    </>
  )
}
