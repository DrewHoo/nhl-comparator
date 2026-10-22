# NHL factoids and publisher conventions (slice `factoids`, 2026-10-21)

Every quote below is in a saved page under `research/factoids/pages/<sha1(url)>.txt`. `research/factoids/scratch/build.py` re-checks every quote against those files (70 factoids and 26 convention rows, 0 misses). Tags: [V] verified today on a fetched page, [S] search snippet only, derived = arithmetic of mine, UNVERIFIED = I could not open a source. Structured return: `research/factoids/return.json`.

## Summary (10 lines)

1. **Scope.** 64 of 70 claims are regular season only. The 4 playoff claims sit on separate lists, and no publisher sums regular season and playoffs except under an explicit label ("including playoffs", or NHL.com's "professional" for NHL + WHA). **Default: regular season, NHL only.**
2. **Unit.** Career "fastest to N", "through N games" and pace claims count the **player's own GP**: McDavid 1,000 points in 659, Makar 100 points in 108, Lundqvist 400 wins in 727. Season-start claims count **team games**: 50-in-50, fastest 50 or 100 from the start of a season, Jets fastest to 15 wins.
3. Lemieux 1988-89 has both units in one sentence: team game 46, his own 44th game. The official list uses team games and the popular "50 in 44" uses his GP. The comparator needs both windows and has to label which one it uses.
4. **WHA.** The NHL does not recognize WHA records. Hockey-Reference prints NHL and WHA as separate tables (Howe 1,850 NHL, 508 WHA). Wikipedia mentions combined totals only as an aside. NHL.com combines them only as "professional" goals. **No WHA on the board.**
5. **Default board.** Careers, regular season, NHL only, x = the player's own GP (goalie appearances for goalies, games coached for coaches, team games for team-seasons). Add a team-game window for season-start claims.
6. The sentence needs a **"by age" window** (youngest/oldest to M, "as a teenager" = before the 20th birthday; NHL.com gives years + days) and a **streak agg** (point streaks, winning/unbeaten/winless/losing streaks).
7. **Team results words differ by era.** NHL standings call only regulation defeats losses. "Winless", "losing", "unbeaten" and "points streak" are four different streaks. Point totals before and after 1983, 1999 and 2005 are not strictly comparable, so team futility needs those era words.
8. **Era bounds publishers already print:** "salary cap era" (Matthews 69), "since 1995-96" (McDavid 153), "since 1943-44" (AP/CP on Makar), "shootout era" (ESPN on the Sabres), "with one point awarded for an overtime or shootout loss" (Sharks 47 points).
9. **Early assists are soft.** The NHL fixed 6,000+ items for 1917-87, and some years awarded up to four assists per goal. Secondary assists were not full-time until 1945-46. AP/CP floors some lists at 1943-44, while NHL.com does not.
10. **Corpus.** 70 claims: 68 [V], 2 UNVERIFIED with no publisher list ("wins through first 100 starts", "fewest wins through N"). Five corrections to the seed list are under Rejections.

## Part A: the corpus

Slots follow the brief: who and population; stat; agg; window; field. "Scope" is season type · league · games unit. 23 rows are measured in team games: 18 team, coach or goalie season rows, plus 5 player rows (PG01-04, PG16) where the official window is the team's games. 39 rows use the player's own GP. The rest are goalie appearances, games coached or seasons.
