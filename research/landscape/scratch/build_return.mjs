// Builds research/landscape/return.json and checks every receipt quote is a verbatim substring of its saved page.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
const D = '/Users/drewhoo/Projects/nhl-comparator/research/landscape'
const sha1 = (s) => createHash('sha1').update(s).digest('hex')
const page = (u) => { const f = `${D}/pages/${sha1(u)}.txt`; return existsSync(f) ? readFileSync(f, 'utf8') : null }
const T = '2026-10-21'
const W = (t) => `https://en.wikipedia.org/wiki/${t}`
const U = {
  seasons: W('List_of_NHL_seasons'), reloc: W('List_of_defunct_and_relocated_National_Hockey_League_teams'),
  pmAward: W('NHL_Plus-Minus_Award'), pmSports: W('Plus%E2%80%93minus_(sports)'), ot: W('Overtime_(ice_hockey)'),
  s1918: W('1918%E2%80%9319_NHL_season'), s1917: W('1917%E2%80%9318_NHL_season'), s2019: W('2019%E2%80%9320_NHL_season'), s2020: W('2020%E2%80%9321_NHL_season'),
  s1992: W('1992%E2%80%9393_NHL_season'), s1993: W('1993%E2%80%9394_NHL_season'),
  utah: W('Utah_Mammoth'), jets: W('Winnipeg_Jets'), barons: W('Cleveland_Barons_(NHL)'), ayres: W('David_Ayres'), gs: W('NHL_Global_Series'), outdoor: W('NHL_outdoor_games'),
  org: W('History_of_organizational_changes_in_the_NHL'), aho: W('Sebastian_Aho'),
  jetsNHL: 'https://www.nhl.com/news/jets-and-nhl-announce-consolidation-of-winnipeg-jets-history',
  utahNHL: 'https://www.nhl.com/news/board-approves-establishment-of-new-franchise-in-utah-2024',
  hr1918: 'https://www.hockey-reference.com/leagues/NHL_1918_skaters.html', hrGloss: 'https://www.hockey-reference.com/about/glossary.html',
  hrSV: 'https://www.hockey-reference.com/leaders/save_pct_career.html', srBlog: 'https://www.sports-reference.com/blog/2023/09/',
  dobber: 'https://dobberhockey.com/?p=29830', thw: 'https://thehockeywriters.com/nhl-highest-goal-to-assist-ratios/',
  espn: 'https://www.espn.com.au/nhl/columns/frei_terry/1435985.html', arxiv: 'https://arxiv.org/abs/1412.1035',
  dword: 'https://raw.githubusercontent.com/dword4/nhlapi/master/README.md',
  wd: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=P3522|P3567|P2481|P3598&format=json&props=labels|descriptions|claims&languages=en',
  cba: 'https://russianmachineneverbreaks.com/2025/07/08/nhl-nhlpa-ratify-cba-through-2029-30-season/',
  legends: readFileSync(`${D}/scratch/legends_url.txt`, 'utf8').split('\n')[1].trim(),
}
const r = (k, quote, note = '') => ({ url: U[k] ?? k, quote, note, retrieved: T })
const rows = []
const fact = (section, f, value, grade, receipts) => rows.push({ section, fact: f, value, grade, receipts })

// 1. Stat floors
fact('stat-floors', 'Goals, assists, points, PIM and GWG are carried for 1917-18 skaters on Hockey-Reference; no +/-, shots, PP/SH or TOI columns are populated for that season', 'G/A/PTS/PIM: 1917-18', 'V', [r('hr1918', 'Rk | Player | Age | Team | Pos | GP | G | A | PTS | PIM | GWG | TOI | ATOI | Awards |'), r('hr1918', '1 | Joe Malone | 27 | MTL | LW | 20 | 44 | 4 | 48 | 30 | 4 |', 'Malone 20 GP of a 22-game schedule; GWG populated (retroactively computed, a derived stat)')])
fact('stat-floors', 'Early assists were sparse and the per-goal maximum changed in the 1930s; the two secondary sources (both citing Total Hockey 1998, Ron Andrews) disagree on the year of the three-assist season', 'max 1 assist/goal before ~1936; up to 3 in 1935-36 or 1936-37; max 2 since', 'S', [r('thw', 'Prior to 1936, only one assist was recorded for each goal. If an assist was recorded at all. During the 1936-37 season, up to three assists per goal were awarded. Since then, a maximum of two assists per goal has been the standard.'), r('dobber', 'However, in 1935-36 for some inexplicable reason three assists could be awarded on a goal', 'quotes the same Total Hockey chapter but names 1935-36')])
fact('stat-floors', 'Plus-minus: the NHL started counting it in 1967(-68); the NHL has compiled it back to 1959(-60)', 'official 1967-68; compiled 1959-60+', 'V', [r('pmAward', 'The NHL started counting the statistics in 1967, while records have been compiled by the NHL for plus-minus back to 1959.'), r('pmAward', 'The plus/minus statistic was first established during the 1967–68 NHL season.')])
fact('stat-floors', 'Skater shots on goal were not officially recorded until 1967-68; Hockey-Reference underlines pre-1967-68 career totals as incomplete', 'skater shots official: 1967-68', 'V', [r('hrGloss', 'shots on goal were not officially recorded for skaters until the \n1967-68 NHL season')])
fact('stat-floors', 'Game-level time on ice was first recorded in 1997-98 (Hockey-Reference extended season TOI back to 1997-98 in Sept 2023; before that its floor was 1998-99)', 'TOI: 1997-98', 'V', [r('srBlog', 'Our season-level TOI now matches the sum of our game-level TOI, which was first recorded in 1997-98.'), r('srBlog', 'Before this update, our coverage went back to the 1998-99 season.')])
fact('stat-floors', 'Hits, blocked shots, giveaways and takeaways were distributed under the Real-Time Scoring System for two seasons around 2000-02 and then scrubbed from player summaries because of building-to-building subjectivity; the public series used today restarts later (2005-06 per common reference, not re-checked)', 'RTSS hits/blocks/GV/TK: early 2000s, dropped, return ~2005-06', 'V', [r('espn', 'Blocked shots, hits, giveways and takeaways, all part of the statistical package distributed the past two seasons under the league\'s generally well-received "Real-Time Scoring System," have been scrubbed on each player\'s summary line this season.'), r('espn', 'involved subjective judgments that could vary from building to building')])
fact('stat-floors', 'RTSS event counts (hits, shots, faceoffs) carry documented rink-to-rink recording bias', 'arena-scorer bias', 'V', [r('arxiv', 'Several previous studies have found that there are inconsistencies in the recording of these events from rink to rink.')])
fact('stat-floors', 'Goalie save percentage on Hockey-Reference reaches back into the 1950s (Johnny Bower 1953-70 ranks 2nd career), so HR carries shots against before any official floor; the NHL\'s own official floor for shots against is not verified here', 'goalie SA/SV%: HR has 1950s data; official floor unverified', 'V', [r('hrSV', 'Johnny Bower* | \n1953-70 | .9219 |')])
fact('stat-floors', 'Regular-season overtime: 10-minute non-sudden-death OT ended Nov 21, 1942; ties stood through 1982-83; 5-minute sudden-death OT from 1983-84', 'ties 1942-83; OT returns 1983-84', 'V', [r('ot', 'From November 21, 1942,[1] when overtime (a non-sudden death extra period of 10 minutes duration) was eliminated due to war time restrictions and continuing through the 1982–83 season, all NHL regular-season games tied after 60 minutes of play ended as ties. On June 23, 1983, the NHL introduced a regular-season sudden death overtime period of five minutes.')])
fact('stat-floors', 'Overtime-loss standings point since 1999-2000', 'OTL: 1999-00', 'V', [r('ot', 'Since 1999–00, the team losing in overtime in the NHL (and in most other leagues) receives one point in the standings.')])
fact('stat-floors', 'Shootout (and the end of ties) from 2005-06; 3-on-3 overtime from 2015-16', 'SO 2005-06; 3v3 2015-16', 'V', [r('ot', 'in the NHL\'s first post-lockout season of 2005–06, the league ends exhibition and regular season games still tied after a five-minute-length, three-skaters-per-side overtime period (as of the 2015–16 NHL season onwards) with a shootout.')])
fact('stat-floors', 'Shootout goals earn players no goals or points', 'SO goals excluded from player G/PTS', 'V', [r('dobber', 'a shootout goal earn a player no points')])

// 2. Season lengths
const sp = page(U.seasons)
const seasonQuote = (s) => { const line = sp.split('\n').find(l => l.includes(`| ${s} |`)); return line.split(' | ').slice(1, 6).join(' | ') }
const spans = [['1917–18', '22'], ['1918–19', '18'], ['1919–20', '24'], ['1924–25', '30'], ['1925–26', '36'], ['1926–27', '44'], ['1931–32', '48'], ['1942–43', '50'], ['1946–47', '60'], ['1949–50', '70'], ['1967–68', '74'], ['1968–69', '76'], ['1970–71', '78'], ['1974–75', '80'], ['1992–93', '84'], ['1994–95', '48'], ['1995–96', '82'], ['2012–13', '48'], ['2019–20', '68–71'], ['2020–21', '56'], ['2021–22', '82'], ['2026–27', '84']]
for (const [s, g] of spans) fact('season-lengths', `Regular-season games per team, ${s} (first season at this length unless noted)`, g, 'V', [r('seasons', seasonQuote(s))])
fact('season-lengths', '2004-05 season not played (lockout)', 'cancelled', 'V', [r('seasons', '2004–05 | Season not played due to lockout')])
fact('season-lengths', '1917-18: Wanderers withdrew after six games (four played, two defaulted); the two defaults stand as wins for the Canadiens and Toronto in the standings though never played', 'team W-L includes 2 unplayed games', 'V', [r('seasons', 'Wanderers withdrew after six games (four completed, two forfeited).'), r('s1917', 'these appear as losses in the standings, but the games were not played.')])
fact('season-lengths', '1918-19: scheduled 20 games, stopped at 18 when the Arenas withdrew; the Stanley Cup Final (Canadiens vs PCHA Seattle) was cancelled by influenza at 2–2–1', '18 games; Cup Final cancelled', 'V', [r('s1918', 'With the NHL reduced to two teams eighteen games into its 20-game season'), r('s1918', 'With the series tied after five games (with one tie), the sixth game was slated for April 1, 1919, when the Spanish Flu epidemic forced the cancellation of the series.')])
fact('season-lengths', '1992-93 and 1993-94: 84 games including two "home" games per team at neutral sites', '84 incl. 2 neutral-site', 'V', [r('s1992', 'each team began playing 84 games per season, including two home games at neutral sites.')])
fact('season-lengths', '2019-20 paused March 12, 2020; remaining regular season scrapped, teams finished on 68–71 games, standings by points percentage; 24-team return-to-play', 'unequal GP 68-71', 'V', [r('s2019', 'The seeds would be based on each club\'s points percentage when the season paused on March 12'), r('seasons', 'Due to the uneven schedule, the Boston Bruins were awarded the top record in the regular season by points percentage.')])
fact('season-lengths', '2020-21: 56 games, divisional-only realignment with an all-Canadian North Division', '56', 'V', [r('s2020', 'Due to the COVID-19 pandemic, the regular season was reduced to 56 games and began on January 13, 2021.')])
fact('season-lengths', '2026-27: 84-game regular season under the CBA ratified July 2025 (Wikipedia lists 84; the press report says "reportedly"; NHL primary not fetched)', '84', 'V', [r('seasons', seasonQuote('2026–27')), r('cba', 'the agreement reportedly includes a transition to an 84-game season.')])

// 3. Franchise identity
fact('franchise', 'Under the NHL constitution a franchise outlives its city; e.g. Kansas City Scouts, Colorado Rockies and New Jersey Devils are one franchise', 'franchise = entity across moves', 'V', [r('reloc', 'The franchise can out-live teams located in different cities. For example, the Kansas City Scouts, Colorado Rockies, and New Jersey Devils are one franchise.')])
fact('franchise', 'Sept 24, 2026: the NHL consolidated Winnipeg Jets statistical history: Jets 1.0 (1979-96) + Atlanta Thrashers (1999-2011) + Jets 2.0 (2011-); the inactive Coyotes franchise keeps only Arizona 1996-2024. Statistical franchise history is therefore an NHL ruling that can be revised, not a fixed legal fact', 'WPG = 1979-96 + ATL 1999-2011 + WPG 2011-; ARI = 1996-2024', 'V', [r('jetsNHL', 'the Jets’ history now encompasses their first stint in Winnipeg (1979-96) as well as their years as the Atlanta Thrashers (1999-2011) and their seasons in Winnipeg since 2011-12.'), r('jetsNHL', 'The statistical history of the inactive Coyotes franchise only will encompass its years in Arizona (1996-2024) and therefore will not be included in the Jets’ history.'), r('jetsNHL', 'These changes are reflected in the statistical sections of NHL.com, the NHL app and the Jets’ official website.')])
fact('franchise', 'Utah (2024) is a new franchise, not a relocation: the Coyotes were rendered inactive and transferred their hockey assets', 'UTA = expansion 2024-25; ARI inactive', 'V', [r('utahNHL', 'approved the establishment of a franchise beginning with the 2024-25 season in Utah'), r('utahNHL', 'the Board approved a plan that renders the Arizona Coyotes franchise inactive')])
fact('franchise', 'Utah Hockey Club renamed Utah Mammoth, unveiled May 7, 2025, for 2025-26', 'Utah Mammoth (2025-26-)', 'V', [r('org', 'The temporarily named Utah Hockey Club changed its name to the Utah Mammoth for the 2025–26 season.')])
const relocs = [
  ['Montreal Wanderers 1917-18, defunct', 'Montreal Wanderers^ | 1917 | 1918 [g] | Defunct'],
  ['Quebec Bulldogs (1919-20) -> Hamilton Tigers (1920-25), defunct', 'Quebec Bulldogs^ | 1919 | 1920 | Hamilton Tigers'],
  ['Hamilton Tigers defunct 1925; players bought by NY Americans', 'Ceased operations due to players\' strike; players were bought by the New York Americans.'],
  ['Pittsburgh Pirates -> Philadelphia Quakers 1930, defunct 1931', 'Pittsburgh Pirates^[a] | 1925 | 1930 | Philadelphia Quakers'],
  ['Ottawa Senators (original) -> St. Louis Eagles 1934, defunct 1935', 'Ottawa Senators^[b] | 1917 | 1934 | St. Louis Eagles'],
  ['New York/Brooklyn Americans 1925-42', 'Brooklyn Americans^[c] | 1925 | 1942 | Defunct'],
  ['Montreal Maroons 1924-38', 'Montreal Maroons | 1924 | 1938 | Defunct'],
  ['California (Golden) Seals -> Cleveland Barons 1976', 'California Golden Seals^[d] | 1967 | 1976 | Cleveland Barons'],
  ['Cleveland Barons merged with Minnesota North Stars 1978', 'Cleveland Barons | 1976 | 1978 | DefunctMerged with Minnesota North Stars'],
  ['Kansas City Scouts -> Colorado Rockies 1976', 'Kansas City Scouts | 1974 | 1976 | Colorado Rockies'],
  ['Colorado Rockies -> New Jersey Devils 1982', 'Colorado Rockies^[e] | 1976 | 1982 | New Jersey Devils*'],
  ['Atlanta Flames -> Calgary Flames 1980', 'Atlanta Flames^ | 1972 | 1980 | Calgary Flames*'],
  ['Minnesota North Stars -> Dallas Stars 1993', 'Minnesota North Stars^ | 1967 | 1993 | Dallas Stars*'],
  ['Quebec Nordiques -> Colorado Avalanche 1995', 'Quebec Nordiques | 1979 | 1995 | Colorado Avalanche*'],
  ['Winnipeg Jets (1.0) -> Phoenix Coyotes 1996', 'Winnipeg Jets^[f] | 1979 | 1996 | Phoenix Coyotes'],
  ['Hartford Whalers -> Carolina Hurricanes 1997', 'Hartford Whalers | 1979 | 1997 | Carolina Hurricanes*'],
  ['Atlanta Thrashers -> Winnipeg Jets 2011', 'Atlanta Thrashers[f] | 1999 | 2011 | Winnipeg Jets*'],
  ['Arizona Coyotes 1996-2024, suspended; assets to Utah', 'Arizona Coyotes[j] | 1996 | 2024 | SuspendedHockey assets transferred to Utah Mammoth'],
]
for (const [f, q] of relocs) fact('franchise', f, f, 'V', [r('reloc', q)])
const renames = [
  ['Toronto (Arenas) -> Toronto St. Patricks 1919-20', 'Toronto changed its name to Toronto St. Patricks.'],
  ['St. Patricks -> Maple Leafs mid-1926-27 (league made them finish as St. Patricks)', 'Midway through the 1926–27 season, the Toronto St. Patricks were sold and renamed the Toronto Maple Leafs, however the league ruled the team must use the St. Patricks name until season\'s end.'],
  ['Detroit Cougars -> Falcons 1930-31', 'Detroit was renamed the Detroit Falcons.'],
  ['Detroit Falcons -> Red Wings 1932-33', 'the Detroit Falcons were renamed the Detroit Red Wings.'],
  ['New York Americans -> Brooklyn Americans 1941-42', 'The New York Americans changed their name to the Brooklyn Americans for the 1941–42 season, their last.'],
  ['Oakland Seals -> Bay Area Seals -> California Golden Seals 1970-71', 'The Oakland Seals were renamed the Bay Area Seals for two games before changing their name to the California Golden Seals for their fourth season in 1970–71.'],
  ['Chicago Black Hawks -> Blackhawks 1986-87', 'The Chicago Black Hawks changed their name to Chicago Blackhawks for the 1986–87 season.'],
  ['Mighty Ducks of Anaheim -> Anaheim Ducks 2006-07', 'The Mighty Ducks of Anaheim changed their name to the Anaheim Ducks in the 2006–07 season.'],
  ['Phoenix Coyotes -> Arizona Coyotes 2014-15', 'The Phoenix Coyotes changed their name to Arizona Coyotes for the 2014–15 season.'],
]
for (const [f, q] of renames) fact('franchise', f, f, 'V', [r('org', q)])
fact('franchise', 'Seals/Barons franchise ended in the 1978 merger; the San Jose Sharks are officially a separate franchise', 'CGS/CLE != SJS', 'V', [r('barons', 'Although the Sharks are officially a separate franchise from the Seals/Golden Seals/Barons')])
fact('franchise', 'Hartford moved first to Greensboro (1997), then to Raleigh (1999)', 'CAR', 'V', [r('seasons', 'The Carolina Hurricanes moved to their intended home of Raleigh, North Carolina.')])

// 4. What the NHL counts
fact('counts', 'WHA statistics are kept separate from NHL statistics (Howe: 801 NHL goals, 174 WHA; 975 only as a combined figure). The NHL\'s Jets consolidation starts Jets history in 1979, excluding the WHA Jets 1972-79', 'WHA excluded', 'V', [r('legends', 'WHA totals\\n! 419 !! 174', 'Howe article: separate NHL / WHA / combined rows'), r('jetsNHL', 'their first stint in Winnipeg (1979-96)')])
fact('counts', 'NHA seasons (1910-17) are a predecessor league, listed separately from NHL seasons', 'NHA excluded', 'V', [r('seasons', 'The list also includes the seasons of the National Hockey Association (NHA), the predecessor organization of the NHL')])
fact('counts', 'All-Star games are their own game type (04) in the NHL game id, separate from regular season (02) and playoffs (03)', 'exclude type 04', 'V', [r('dword', 'The next 2 digits give the type of game, where 01 = preseason, 02 = regular season, 03 = playoffs, 04 = all-star.')])
fact('counts', 'Emergency backup goalie David Ayres (Feb 22, 2020) is credited with an NHL game and a win', 'EBUG counts as GP/W', 'V', [r('ayres', 'He is the first emergency backup goaltender to be credited with a win in the National Hockey League (NHL).')])
fact('counts', 'A suspended game can be replayed from scratch: Blues–Ducks Feb 11, 2020 suspended at 1–1 in the first period (Bouwmeester collapse) and made up March 11', 'suspended-game stats', 'V', [r('s2019', 'The game was made up on March 11.')])

// 5. Dates, venues, ids
fact('dates-venues', 'NHL game id = SSSS TT GGGG: 4-digit season start year, 2-digit game type, 4-digit game number; playoff GGGG encodes round / matchup / game', 'SSSSTTGGGG', 'V', [r('dword', 'The first 4 digits identify the season of the game (ie. 2017 for the 2017-2018 season).'), r('dword', 'For playoff games, the 2nd digit of the specific number gives the round of the playoffs, the 3rd digit specifies the matchup, and the 4th digit specifies the game (out of 7).')])
fact('dates-venues', 'First regular-season games outside North America: Anaheim vs Vancouver in Japan, Oct 3-4, 1997', 'Global Series 1997-', 'V', [r('gs', 'the first ones to count towards the league\'s regular seasons standings were held in October 3–4, 1997, when the Mighty Ducks of Anaheim and the Vancouver Canucks played a two-game series in Japan')])
fact('dates-venues', 'Outdoor regular-season games since 2003-04 (Heritage Classic), annually since 2007-08', 'outdoor games', 'V', [r('outdoor', 'The National Hockey League (NHL) first held an outdoor ice hockey game during the 2003–04 season, and has scheduled at least one such game per season since the 2007–08 season.')])
fact('dates-venues', '2020 playoffs in two hub cities, Toronto and Edmonton, at neutral sites; home ice given to the higher seed', 'bubble home/away by seed', 'V', [r('s2019', 'Toronto\'s Scotiabank Arena and Edmonton\'s Rogers Place'), r('s2019', 'The higher-seeded team is awarded home ice advantage.')])
fact('dates-venues', 'Neutral-site "home" games 1992-94 (e.g. Dallas played one in Minneapolis)', 'neutral sites 1992-94', 'V', [r('s1993', 'The Dallas Stars played a neutral-site game in their previous market of Minnesota at the Target Center in Minneapolis')])

// 6. People and ids
fact('ids', 'NHL.com player id (Wikidata P3522): 7 digits matching 84[4-9]\\d{4}', '84xxxxx', 'V', [r('wd', '84[4-9]\\\\d{4}')])
fact('ids', 'Hockey-Reference player id is Wikidata P3598, pattern letter/ + surname-prefix + firstname-prefix + 2 digits (e.g. m/malonjo01)', 'P3598', 'V', [r('wd', 'Hockey-Reference.com player ID')])
fact('ids', 'Wikidata P3567 is the HHOF.com NHL player id, not Hockey-Reference', 'P3567 = HHOF', 'V', [r('wd', 'HHOF.com NHL player ID')])
fact('ids', 'Elite Prospects player id is Wikidata P2481 (1-7 digit integer)', 'P2481', 'V', [r('wd', 'Elite Prospects player ID')])
fact('ids', 'Name collision: two Sebastian Ahos (Finnish forward b. 1997, Carolina; Swedish defenceman b. 1996)', 'disambiguate by id/DOB', 'V', [r('aho', 'For the Swedish ice hockey defenceman, see Sebastian Aho (ice hockey, born 1996).')])

// 7. Legends
const L = JSON.parse(readFileSync(`${D}/scratch/legends.json`, 'utf8'))
const floors = JSON.parse(readFileSync(`${D}/scratch/floors.json`, 'utf8'))
const lp = page(U.legends)
for (const p of L) {
  // verbatim quote: the NHL totals header and the following GP cell, taken from the saved API text after this title's page entry
  const ti = lp.indexOf(`"title":"${p.title}"`)
  const k = lp.indexOf('NHL totals', ti)
  const m = lp.slice(k, k + 80).match(/^NHL totals\\n!\s*'*[\d,]+/)
  const quote = m ? m[0] : 'NHL totals'
  const cls = Object.fromEntries(Object.entries(floors).map(([f, v]) => [f, v.full.includes(p.title.replace(' (ice hockey)', '')) ? 'full' : v.part.includes(p.title.replace(' (ice hockey)', '')) ? 'part' : 'none']))
  rows.push({ section: 'legends', fact: p.title.replace(' (ice hockey)', ''), value: { nhlFirst: p.nhlFirst, nhlLast: p.nhlLast, nhlGP: p.nhlGP, playoffOnlyDebut: p.playoffOnlyFirst, wha: p.whaFirst ? { first: p.whaFirst, last: p.whaLast, gp: p.whaGP } : null, floors: cls }, grade: 'V', receipts: [r('legends', quote, 'Wikipedia career-stats table via one batched MediaWiki API request; seasons parsed from the same table; active careers counted through 2025-26')] })
}

const rejections = [
  { claim: 'The NHL gave no assists in its first season (Total Hockey 1998, quoted by Dobber Hockey)', reason: 'Hockey-Reference carries 1917-18 assists: Malone 4, four players tied at 10. Assists were sparse, not absent.', receipts: [r('dobber', 'In the league\'s first season, no assists were given on goals.'), r('hr1918', 'Assists Leaders: Harry Cameron (10), Corb Denneny (10), Cy Denneny (10), Reg Noble (10)')] },
  { claim: 'Plus-minus became an official NHL statistic in 1959-60 (Wikipedia, Plus–minus (sports))', reason: 'The NHL started counting it in 1967(-68); 1959-on figures are a later NHL compilation. Treat 1959-66 +/- as reconstructed.', receipts: [r('pmSports', 'Plus-minus was hockey\'s first enhanced statistic, becoming an official NHL statistic in 1959-60.'), r('pmAward', 'The NHL started counting the statistics in 1967, while records have been compiled by the NHL for plus-minus back to 1959.')] },
  { claim: 'The NHL awarded the original Jets\' records from 1972 to 1996 to the present Jets (Wikipedia relocation list)', reason: 'NHL release says 1979-96 only; the WHA Jets years (1972-79) are not NHL history.', receipts: [r('reloc', 'On September 24, 2026, the NHL awarded the franchise records of the original Jets from 1972 to 1996 to the present-day Winnipeg Jets.'), r('jetsNHL', 'their first stint in Winnipeg (1979-96)')] },
  { claim: 'The Coyotes/Utah franchise history includes the original Winnipeg Jets', reason: 'Since Sept 24, 2026 the Coyotes franchise covers Arizona 1996-2024 only, and Utah is a 2024 expansion franchise with none of it.', receipts: [r('jetsNHL', 'The statistical history of the inactive Coyotes franchise only will encompass its years in Arizona (1996-2024)'), r('utahNHL', 'renders the Arizona Coyotes franchise inactive')] },
  { claim: 'Utah is the relocated Arizona Coyotes', reason: 'The NHL Board approved a new franchise; the Coyotes franchise was made inactive and transferred hockey assets.', receipts: [r('utahNHL', 'approved the establishment of a franchise beginning with the 2024-25 season in Utah')] },
  { claim: 'Wikidata P3567 is the Hockey-Reference id (brief guess)', reason: 'P3567 is the HHOF.com NHL player ID; Hockey-Reference is P3598.', receipts: [r('wd', 'HHOF.com NHL player ID'), r('wd', 'Hockey-Reference.com player ID')] },
  { claim: 'Hockey-Reference TOI starts in 1998-99', reason: 'HR extended season TOI to 1997-98 in Sept 2023 and reconciled 1998-99 to 2007-08 season totals to game totals.', receipts: [r('srBlog', 'Hockey Reference recently extended its season-level Time on Ice coverage back through the 1997-98 season.')] },
  { claim: 'Hits, blocks, giveaways and takeaways did not exist before 2005-06', reason: 'They were distributed under RTSS around 2000-02 and then scrubbed for subjectivity; the gap is a league choice, not a non-existence.', receipts: [r('espn', 'have been scrubbed on each player\'s summary line this season.')] },
  { claim: 'An NHL season is 82 games', reason: '84 in 1992-94 and again from 2026-27; 48 in 1994-95 and 2012-13; 68-71 in 2019-20; 56 in 2020-21.', receipts: [r('seasons', seasonQuote('2026–27')), r('seasons', seasonQuote('1992–93'))] },
  { claim: 'The 1918-19 NHL final was cancelled by influenza', reason: 'The NHL final was completed (Canadiens beat Ottawa); the cancelled series was the Stanley Cup Final against PCHA Seattle.', receipts: [r('s1918', 'Montreal won the fifth game in Montreal to take the series four games to one and the right to face Seattle Metropolitans for the Stanley Cup.')] },
  { claim: 'The 1917-18 Wanderers went 1-5 in six games', reason: 'They played four; two defaulted games are recorded as losses but were never played. Team GP from standings will not equal games actually played.', receipts: [r('reloc', 'The Wanderers played four games during the 1917–18 season before becoming defunct; a further two games were defaulted before the club folded.')] },
]
const tried = [
  { source: 'faq.stathead.com/knowledge/hockey-data (HR coverage note)', outcome: 'nothing usable (404 / portal unauthorized)' },
  { source: 'Wikipedia Assist (ice hockey)', outcome: 'nothing usable: no early-era crediting history' },
  { source: 'Hockey-Reference leaders pages (save_pct_career, goals_pp_career)', outcome: 'no coverage-floor statement; only leader tables' },
  { source: 'Zmalski NHL-API-Reference README', outcome: 'nothing usable for gameDate vs startTimeUTC semantics' },
  { source: 'WebSearch for an nhl.com statement that WHA stats are excluded', outcome: 'nothing usable (no nhl.com page found)' },
]
const leads = [
  { note: 'Confirm in the API: gameDate is local date and startTimeUTC is UTC (late Pacific games cross midnight UTC); confirm 1917-18 game numbering', why_out_of_scope: 'api-web.nhle.com belongs to the league-apis agent' },
  { note: 'Check whether the NHL API now returns Jets 1.0 seasons under WPG and ARI from 1996 (post Sept 24, 2026 consolidation), and the team abbreviations per era (WPG/ATL/PHX/ARI/UTA, QUE/COL, HFD/CAR, MNS/DAL, KCS/CLR/NJD, AFM/CGY, OAK/CGS/CLE)', why_out_of_scope: 'API host owned by league-apis' },
  { note: 'Check the API for 1959-60..1966-67 plusMinus and skater shots: present (NHL compilation) or null?', why_out_of_scope: 'API host owned by league-apis' },
  { note: 'Hockey Databank (Master table with birth dates, Coaches table) and Wikidata as birthdate sources for pre-2010 players', why_out_of_scope: 'open-datasets slice' },
  { note: 'Total Hockey (1998) ch. "The Evolution of NHL Statistics" by Ron Andrews is the primary for assist rules and stat floors', why_out_of_scope: 'print source; not fetched' },
]
const unverified = [
  { claim: 'Official first season for power-play and short-handed goals (commonly 1933-34)', what_i_tried: 'WebSearch; HR goals_pp_career page has no floor note; HR 1917-18 table has no PP/SH columns' },
  { claim: 'Faceoffs official from 1997-98; hits/blocks/GV/TK public series from 2005-06', what_i_tried: 'WebSearch; ESPN RTSS column confirms only early-2000s distribution and removal' },
  { claim: 'Empty-net goal flag start season; goalie games-started (GS) floor', what_i_tried: 'not found in saved pages' },
  { claim: '4-on-4 overtime introduced 1999-2000 together with the OTL point', what_i_tried: 'Overtime (ice hockey) page covers the OTL point but no NHL 4-on-4 date' },
  { claim: 'No NHL doubleheaders (a team playing twice in a day)', what_i_tried: 'not searched to a receipt' },
  { claim: '1919-20-era games-played quirks; whether a dressed skater without a shift is credited with GP', what_i_tried: 'not found' },
  { claim: 'Ovechkin/Crosby/Malkin/Kane/Stamkos activity in 2026-27 (table counts through 2025-26)', what_i_tried: 'Wikipedia rows end 2025-26; not cross-checked' },
  { claim: 'Wikipedia: 2019-20 was the first season with unequal games without a team folding', what_i_tried: 'not cross-checked against every 1920s-30s season' },
]
// verify
let bad = 0
const all = [...rows.flatMap(x => x.receipts), ...rejections.flatMap(x => x.receipts)]
for (const rc of all) { const p = page(rc.url); if (!p || !p.includes(rc.quote)) { bad++; console.log('MISS', rc.url.slice(0, 80), '|', rc.quote.slice(0, 90)) } }
console.log('receipts', all.length, 'missing', bad, 'rows', rows.length)
writeFileSync(`${D}/return.json`, JSON.stringify({ rows, rejections, tried, leads, unverified }, null, 1))
