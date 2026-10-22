// The seasons the ledger covers, as start years. The NHL's records begin with
// its first season, 1917-18, and the stats REST serves every game since. The
// running season is the one whose rows change nightly; the builder reads it
// from the season table rather than trusting this number.
export const FIRST_SEASON = 1917
export const CURRENT_SEASON = 2026
/** "1917-18" */
export const seasonLabel = (y) => `${y}-${String(y + 1).slice(2)}`
