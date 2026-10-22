# Brief: the viral factoid corpus and how hockey's publishers count (slice `factoids`)

Read `research/briefs/_shared.md` first. Report: `research/factoids-and-conventions.md`. Return: `research/factoids/return.json`. No NHL API calls (the `league-apis` agent owns that host); use WebFetch/WebSearch, and the helper for any page you save. Hockey-Reference: one page per lead, never a sweep. Save every page you quote under `research/factoids/pages/`.

## The question

What are the 35-or-so viral NHL career-point claims (the posts that go round r/hockey, @PR_NHL, NHL.com, Sportsnet, TSN, ESPN Stats & Info, The Athletic), taken apart into the comparator's slots, and how do the publishers define the units: is "games" the player's games played or the team's games, is the regular season alone or with playoffs, do WHA years count, what does "fastest to" count, how is age framed? These become the known-answer gates the site must reproduce, and the Method section's list of publisher-definition differences. Futility counts as much as glory; team claims count as much as player claims; goalies and coaches have their own.

## Part A: the corpus

A table with, per claim: #, the claim as published, publisher + URL, the numbers (headline, previous holder, runners-up), **scope** (regular season only / playoffs included; NHL only / with WHA; player GP or team games), the five slots (who: player|goalie|team|coach, careers|player-seasons|team-seasons; stat; agg: sum|count|streak|fastest-to-M|youngest-to-M|rate; window: first N games|starts|seasons|team games of a season|by age|a season|a run; field: all-time|since YYYY|one franchise), and whether the number is [V] on a fetched page, derived, or UNVERIFIED.

Seed list (verify each; replace any that turn out not to be viral; add what you find, aiming for 35–45):

Player glory: Gretzky's 50 goals in 39 games (1981-82; Edmonton's 39th game); Richard's 50 in 50 (1944-45); Lemieux 50 in 44 games played (1988-89); Bossy 50 in 50; Gretzky fastest to 1,000 points (424 games) and 2,000; Lemieux second-fastest (513); McDavid fastest active to 1,000 (659 games, 2025); McDavid 100 assists in a season / 153 points (2022-23); Kucherov 144 points (2023-24); Ovechkin 895 goals (2025-04-06) and the goals-through-N-games race vs Gretzky; Ovechkin nine 50-goal seasons; Matthews 69 goals (2023-24) and 60 in 2021-22; Crosby's 20 straight point-per-game seasons (2024-25); Jagr's longevity claims; Selänne's 76 rookie goals (1992-93); Bedard youngest to N points / youngest All-Star; Celebrini / Hughes / Makar (fastest defenseman to 100 points, N goals); Lidström; Orr +124; Hull; Howe 1,850 points / "Mr. Hockey" longevity; Esposito 76 goals (1970-71); Lemieux's first shift goal; Bure; Stamkos 60; Draisaitl.

Goalies: Brodeur 691 wins and the fastest-to-N wins claims; Roy; Hasek; Lundqvist's 30-win streak of seasons; Hellebuyck; Shesterkin; Vasilevskiy; Bobrovsky; "wins through first 100 starts"; shutouts (Brodeur 125, Sawchuk 103); a rookie goalie's win record; Grant Fuhr / Martin Brodeur games played in a season.

Team glory: 1976-77 Canadiens 60-8-12 / 132 points; 2022-23 Bruins 65 wins / 135 points; 1992-93 Penguins 17 straight wins; 1979-80 Flyers 35-game unbeaten streak; 2024-25 Jets start; Vegas 2017-18 inaugural season; the 2019-20 Avalanche?; Tampa 2018-19 62 wins; Red Wings 1995-96 62 wins; most wins through the first 20/40 games (publisher lists).

Team futility: 1974-75 Capitals 8-67-5; 1992-93 Senators / 1992-93 Sharks 71 losses; 2023-24 Sharks start (worst start claims); 2024-25 Blackhawks / Sharks; Sabres 2021 18-game winless streak; the longest playoff droughts (Sabres 14 seasons); the Panthers / Islanders droughts; fewest wins through first N games; most consecutive losses (Penguins 17, 2003-04? verify); 1980-81 Jets 30-game winless.

Coaches: Bowman 1,244 wins; fastest coach to N wins; Jon Cooper; a rookie coach record; Barry Trotz; Joel Quenneville.

Rookies: Teemu 132 points; Bedard; Makar; the rookie points race framings ("most points through first 50 games as a teenager").

Playoffs (the discourse keeps these separate): Gretzky 47 points in one playoff; Leon Draisaitl 2024; Roy 16-win runs; "first to N points in a single playoffs".

## Part B: publisher conventions

For each of these publishers, with a quote per answer: **NHL PR / NHL.com (and NHL Records at records.nhl.com, which uses the Official Guide & Record Book's categories)**, **Elias Sports Bureau** (as cited by publishers), **Hockey-Reference** (how its game logs define GP and "fastest to"; one page), **ESPN Stats & Info**, **Sportsnet / TSN**, **Wikipedia** (its List of NHL records pages), **QuantHockey**, **Guinness**. Answer: (1) "games" = player games played, team games, or both, and which is used for "fastest to" and "50 in 50"; (2) regular season by default, playoffs never combined (any "regular season and playoffs combined" framing?); (3) WHA stats excluded from NHL records (quote the NHL's stance) and how Gretzky's/Howe's/Hull's WHA years are handled by each publisher; (4) age conventions ("before his 21st birthday", "as a teenager" = before the 20th birthday on game day); (5) the appearance unit: a player who dressed and took one shift counts a GP; emergency backup goalies (David Ayres) credited with a game and a win; a goalie start vs an appearance (relief); (6) how "a season" is bounded for a "fastest 50 from the start of a season" claim (team games vs player games; the NHL record book lists "fastest 50 goals from start of season" by team games: Gretzky 39, Gretzky 42, Lemieux 46, Bossy 50, Richard 50; confirm); (7) pre-1920s assist reliability caveats publishers attach; (8) ties, OTL and shootout wins in "wins" and "points" for teams and goalies (a shootout win is a goalie win; team points percentage vs points); (9) whether points "through N games" claims include the games a player missed (they count the player's own GP).

## Return

Rows are **factoids** (`{ id, claim, publisher, url, claim_date, numbers: {...}, scope: {...}, slots: {...}, verification: "V|derived|UNVERIFIED", receipts }`) and **conventions** (`{ publisher, question, answer, receipts }`). The report has a 10-line summary (what the discourse scopes to, what the default board should be, the unit), Part A's table split into player glory / player futility / goalies / team glory / team futility / coaches / rookies / playoffs, and Part B. Mark derived arithmetic as derived and anything you couldn't open as UNVERIFIED.
