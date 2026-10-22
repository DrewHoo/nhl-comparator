// What to read next, the citing ask and Ko-fi, and the Method notes: where
// the games come from and the rulings the words rest on, in folded sections
// (a reader opens the one they came to argue about; a crawler reads them all).
import { track } from '../lib/analytics.ts'
import { fmtSeason } from '../lib/ledger.ts'
import floors from '../data/floors.json'

/** "1959-60": the first season a column has values, from the floors table build-index.mjs writes (the goalies' included) */
const floor = (col) => fmtSeason(floors.skaters[col] ?? floors.goalies[col])

export const KOFI_URL = 'https://ko-fi.com/drewhooverdotcom'

/** the other sports sites, in the order every one of them lists them; the prerender writes the same list into llms.txt */
export const SIBLINGS = [
  ['NFL Comparator', 'https://drewhoover.com/nfl-comparator/', 'the same comparator over every NFL career since 1999, with a page for every player and what he leads.'],
  ['NBA Comparator', 'https://drewhoover.com/nba-comparator/', 'the same comparator over every NBA career since 1946-47, Wilt and Jordan included, with a page for every player and what he leads.'],
  ['WNBA Comparator', 'https://drewhoover.com/wnba-comparator/', 'the same comparator over every WNBA career since 1997.'],
  ['College Football Comparator', 'https://drewhoover.com/cfb-comparator/', 'every coach, team and player at the same point in their careers, since 1869, with the best players of each position at every school and conference.'],
  ['College Football Streak King', 'https://drewhoover.com/cfb-streak-king/', 'the longest active and all-time winning and losing streaks in college football, under any definition, every FBS game since 1936.'],
  ['Hostile Territory', 'https://drewhoover.com/hostile-territory/', "every head coach's true road record against AP top-10 teams since 1936."],
  ['How Many Rings?', 'https://drewhoover.com/how-many-rings/', 'every person on a national-championship staff since 1990, ranked by the number of rings they can claim.'],
  ['Collegiate Championships', 'https://drewhoover.com/collegiate-championships/', 'which schools have won the most NCAA championships, across 33 sports.'],
  ['CFB All-Time Records', 'https://drewhoover.com/cfb-all-time-records/', 'all-time win-loss, bowl and national-title records for every FBS program.'],
]

export function Notes({ ledger }) {
  const first = fmtSeason(ledger.firstSeason), current = fmtSeason(ledger.currentSeason)
  return (
    <>
      <h2 className="notes-h">What to read next</h2>
      <div className="notes">
        {SIBLINGS.map(([name, href, words]) => (
          <p key={href}><a href={href}>{name}</a> — {words}</p>
        ))}
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
          so a career claim here holds for the whole league. Birth dates are Wikidata's (CC0). The sections below say
          where the games come from, what the box score records and since when, what the words mean, why the old
          names sit where they do, and what we corrected and couldn't.
        </p>

        <details>
          <summary>Where the games come from</summary>
          <p>
            The NHL's public stats API (api.nhle.com) serves a line for every player in every game the league lists,
            from {first} on; the ledger reads it for every season, and the running season is refetched daily. Birth
            dates are Wikidata's (CC0), joined through the NHL's own player ids. The NHL's own milestone records
            (Gretzky's 50th goal in Edmonton's 39th game, Lemieux's in his 44th and Pittsburgh's 46th, McDavid's
            1,000th point in his 659th game) are the gates the build has to pass before it ships.
          </p>
          <p>
            What is not here: WHA games (the NHL does not count them, so Howe's, Hull's and Gretzky's WHA years are out),
            All-Star games, and the 1918 to 1926 Stanley Cup Finals against the PCHA and WCHL champions, which the league
            lists as playoff games against a team that was never in the NHL. The 2020 qualifying round counts as playoff
            games, as the league counts it. Team codes are the codes of the day (the Hartford Whalers are HFD, not CAR).
          </p>
        </details>

        <details>
          <summary>What the box score records, and since when</summary>
          <p>
            Each stat starts when the league started recording it, and the sentence says so: goals, assists, points and
            penalty minutes from {floor('g')}; power-play and shorthanded goals from {floor('ppg')}; a goalie's saves from{' '}
            {floor('sv')}; shots and plus-minus from {floor('s')} (official from 1967-68); a goalie's overtime losses as
            their own decision from {floor('otl')}. A career that began before a stat's first season sits out that stat's
            career fields, and the board says how many did. Assists were credited more sparingly before the mid-1930s, so
            a points board across that line compares two scoring rules. Before 1997-98 the league recorded no ice time.
          </p>
        </details>

        <details>
          <summary>What the words mean</summary>
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
            Ranks are competition ranks, ties included. "Still inside the window" lists the players who haven't played the
            whole window yet, with their total so far. The panel reads a row against a peer: where their curves met, and
            what the player needs over the next five games to match the peer there; the peer rides in the url, so a shared
            link opens the same comparison.
          </p>
        </details>

        <details>
          <summary>Why the old names sit where they do, and the eras</summary>
          <p>
            A career window favors the game as it was scored in the 1980s: a regular-season game had nearly eight goals
            in it, where today's have about six, and the 1940s credited fewer assists per goal than any decade since. So
            "most points through the first 500 games" reads Gretzky, Lemieux, Stastny, Bossy and Kurri before McDavid, the
            first name on it who debuted after 1990, and the modern names on these boards are the ones who were great from
            game one. The birth year is in the panel.
          </p>
          <p>
            The era word in the sentence is how to ask the fair question. Its cuts are the league's own: 1942-43, the
            Original Six, when the Brooklyn Americans folded and six teams played 25 seasons alone; 1967-68, expansion,
            when six teams became twelve; 1979-80, the WHA merger, which brought Edmonton, Quebec, Winnipeg and Hartford
            and Gretzky with them; 1992-93, the 84-game seasons and the next wave of expansion; 2005-06, the salary cap
            and the shootout, after the lost season; 2015-16, 3-on-3 overtime. A stat's own wall (shots and plus-minus
            from {floor('s')}, saves from {floor('sv')}) is the first choice when it is later than the ledger's start.
          </p>
        </details>

        <details>
          <summary>What we corrected, and what we couldn't</summary>
          <p>
            The ledger is the league's book, and the league re-audited its early seasons in 2017, so a 1920s line here can
            differ from an old encyclopedia's. Against the Hockey Databank (through 2017-18, joined through Wikidata),
            98 of 100 skater seasons match exactly on games, goals and assists, 99 or better from the 1970s on, 61 in the
            1910s and 74 in the 1920s, where the re-audit moved assists and a few games; goalie seasons match 97 in 100,
            with a dip in the 1960s on wins and games played that nobody has explained yet. The 1917-18 schedule lists two
            games the Montreal Wanderers defaulted; they have no lines and are dropped before the schedule is numbered, so
            Montreal's and Toronto's game numbers match the season table. A goalie's shots against from before {floor('sv')}{' '}
            are a placeholder, not a number, and read as missing.
          </p>
        </details>

        <p>
          A sibling of <a href="https://drewhoover.com/nfl-comparator/">NFL Comparator</a>, <a href="https://drewhoover.com/wnba-comparator/">WNBA Comparator</a> and{' '}
          <a href="https://drewhoover.com/cfb-streak-king/">College Football Streak King</a>.
        </p>
      </section>
    </>
  )
}
