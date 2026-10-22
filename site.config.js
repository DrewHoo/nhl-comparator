// The one file to edit when you start a project from this template.
// The URL slug is NOT here: it is the "name" in package.json, and it has to
// equal the GitHub repo name, because the site serves at https://<domain>/<repo>/.
import { FIRST_SEASON, seasonLabel } from './scripts/lib/window.mjs'

export default {
  domain: 'drewhoover.com',
  title: 'NHL Comparator',
  // the root's <title> and og:title: the query the page can win, then the name
  pageTitle: 'Most points through the first 500 games, and every NHL player at the same point in his career · NHL Comparator',
  // the season is the ledger's first (scripts/lib/window.mjs), never typed here
  description:
    `Compare NHL players at the same point in their careers: points through the first 500 games, fastest to 500 goals, wins through a goalie's first 100 starts, 50 goals from the start of a season. Build the comparison, see who stacks up, every career since ${seasonLabel(FIRST_SEASON)}.`,
  ogSubtitle: 'Same point in the career. Who stacks up.',
  ogImageAlt: 'A ranked list of NHL players compared at the same point in their careers, on a dark background.',
  accent: '#c36c36',
}
