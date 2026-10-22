
## Rejections and corrections to the seed list

- **Kucherov 144 as a record**: not a record. The claim worth keeping is 100 assists (fifth player ever).
- **McDavid 1,000 points "2025"**: it was 2024-11-14, in his 659th game. "Fastest active" is [S] only.
- **"Penguins 17 straight losses, 2003-04"**: the Penguins streak was 18 (0-17-1). 17 belongs to the 1992-93 Sharks, counted under the pre-1999 definition; their Wikipedia season page still calls it the record.
- **The record-book list "39, 42, 46, 50, 50"**: 39 and 46 (team games) are confirmed. 42 is UNVERIFIED because records.nhl.com is a JS app and its API host belongs to the league-apis slice.
- **"Lemieux 50 in 44"**: true only in player GP. The official framing is team game 46.
- **Internal conflicts found**: Senators 1992-93 road losing streak, 38 (team-records list) vs 39 (season page). Crosby's 20th point-per-game season clinched on Mar. 27, 2025 (CBS) vs Mar. 28 (Wikipedia). Lemieux 1995-96 points, 161 (NHL English release) vs 162 (NHL.com Spanish, [S]).

## Could not verify

Cooper 600 wins in 1,005 games vs Bowman's 1,002 ([S]). McDavid "fastest active" ([S]). No asterisk on Brodeur's 48 (nysun 429, [S]). Any publisher list of goalie "wins through first 100 starts". Any ranked "fewest team wins through N games". Gretzky 42 in the fastest-50 list. The Sharks' 11-71-2 final line ([S]).

## Tried and dead ends

records.nhl.com (JS shell). QuantHockey points leaders (403). nysun (429). sportsnet.ca (refused for our agent, not fetched). Two Wikipedia titles that do not exist (404). nhl.com "historical stats now available" (JS shell). No Guinness NHL goals page. No Elias NHL attribution beyond the THW Jagr GWG story.

Request log: every page went through `research/lib/fetch.mjs` (see `data/raw/logs/fetch.log`). One Hockey-Reference page (`/leaders/points_career.html`) and one Sports Reference blog post. No calls to api-web.nhle.com or api.nhle.com.
