// Runs after `vite build`. Bakes the rendered app into dist/index.html and
// one page per named definition (src/lib/landing.ts) at dist/<slug>/index.html,
// each with its own <head> from site.config.js and the landing table; a page
// per player with a records file (dist/player/<id>/index.html, the file
// embedded so the hydrate matches, and dist/player/<id>/og.png, his own
// social card); writes the sitemap, llms.txt, and the ledger copies the share
// worker reads.
//
// Without this the deployed page is `<div id="root"></div>` and every word on
// it exists only after React runs. Google usually renders JS in a deferred
// second pass; Bing, DuckDuckGo, social unfurlers, and the LLM crawlers
// largely don't. Prerendering makes the content plain HTML.
import { createServer } from 'vite'
import { renderToString } from 'react-dom/server'
import React from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import config from '../site.config.js'
import pkg from '../package.json' with { type: 'json' }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SLUG = pkg.name
const ORIGIN = `https://${config.domain}`
const SITE = `${ORIGIN}/${SLUG}/`
const OUT = path.join(ROOT, 'dist/index.html')

const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: 'custom', logLevel: 'warn' })
const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
const { SIBLINGS } = await vite.ssrLoadModule('/src/components/Notes.jsx')
const { LANDINGS } = await vite.ssrLoadModule('/src/lib/landing.ts')
const { decodeLedger, mergeExtra, fmtSeason } = await vite.ssrLoadModule('/src/lib/ledger.ts')
const { evaluate, DEFAULT_QUERY } = await vite.ssrLoadModule('/src/lib/query.ts')
const { toUrl } = await vite.ssrLoadModule('/src/lib/url.ts')
const { rowName, rowWords } = await vite.ssrLoadModule('/src/lib/words.ts')
const { leaderWords, shareDescription, playerText } = await vite.ssrLoadModule('/src/lib/share.ts')
const { PlayerPage } = await vite.ssrLoadModule('/src/components/PlayerPage.jsx')
const { decodePlayer, page: recordPage } = await vite.ssrLoadModule('/src/lib/records.ts')
const { recordWords, placeWords } = await vite.ssrLoadModule('/src/lib/words.ts')
const { playerCard } = await import('./lib/og-player.mjs')
const { toPng } = await import('./lib/og.mjs')
const S = mergeExtra(decodeLedger(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/skaters.json'), 'utf8'))), JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/skaters-x.json'), 'utf8')))
const G = decodeLedger(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/goalies.json'), 'utf8')))
const ledgerFor = (q) => (q.pos === 'G' ? G : S)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const webPage = (url, name, description) => ({ '@type': 'WebPage', '@id': url, url, name, description, isPartOf: { '@type': 'WebSite', url: `${ORIGIN}/`, name: config.domain } })
const breadcrumb = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) })
const itemList = (name, url, board, q) => ({
  '@type': 'ItemList', name, itemListOrder: 'https://schema.org/ItemListOrderAscending', numberOfItems: Math.min(10, board.ranked.length),
  itemListElement: board.ranked.slice(0, 10).map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `${rowName(r)}: ${rowWords(r, q)}`, url: `${url}?t=${encodeURIComponent(r.key)}` })),
})

const template = fs.readFileSync(OUT, 'utf8')
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: could not find an empty #root in dist/index.html')
if (!/<title>[^<]*<\/title>/.test(template)) throw new Error('prerender: could not find <title> in dist/index.html')

function page({ initial, url, title, description, image, imageAlt, jsonLd, appHtml = renderToString(React.createElement(App, { initial, preloadGoalies: G })), embed = null }) {
  const head = `
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(config.domain)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(imageAlt)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />

    <!-- Cross-site chrome served by the index site: back bar, comments, analytics. -->
    <script src="${ORIGIN}/embed/back-bar.js" data-section="sports" async></script>
    <script src="${ORIGIN}/embed/giscus.js" async></script>
    <script src="${ORIGIN}/embed/analytics.js" async></script>

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head>`
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = html.replace('</head>', head)
  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  if (embed) html = html.replace('<script type="module"', `<script id="player-data" type="application/json">${JSON.stringify(embed).replace(/</g, '\\u003c')}</script>\n    <script type="module"`)
  return { html, words: appHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length }
}

const urls = []
const llms = []

{
  const board = evaluate(S, DEFAULT_QUERY)
  const description = shareDescription(DEFAULT_QUERY, board, null, S.firstSeason)
  const { html, words } = page({
    initial: null, url: SITE, title: config.pageTitle ?? config.title, description,
    image: `${SITE}og.png`, imageAlt: config.ogImageAlt,
    jsonLd: { '@context': 'https://schema.org', '@graph': [webPage(SITE, config.pageTitle ?? config.title, description), breadcrumb([[config.domain, `${ORIGIN}/`], [config.title, SITE]]), itemList(config.title, SITE, board, DEFAULT_QUERY)] },
  })
  fs.writeFileSync(OUT, html)
  urls.push(SITE)
  console.log(`prerendered the root, ${(html.length / 1024).toFixed(0)}KB (~${words} words)`)
}

for (const l of LANDINGS) {
  const board = evaluate(ledgerFor(l.query), l.query)
  const url = `${SITE}${l.slug}/`
  const title = `${l.title} · ${config.title}`
  const lead = leaderWords(board, l.query)
  const description = shareDescription(l.query, board, null, S.firstSeason)
  const { html } = page({
    initial: { query: l.query }, url, title, description,
    image: `${SITE}share/og.png${toUrl({ query: l.query, open: null })}`, imageAlt: `${l.h1}, on a dark leaderboard.`,
    jsonLd: { '@context': 'https://schema.org', '@graph': [webPage(url, title, description), breadcrumb([[config.domain, `${ORIGIN}/`], [config.title, SITE], [l.h1, url]]), itemList(l.h1, url, board, l.query)] },
  })
  if (!html.includes(esc(l.h1).replace(/&quot;/g, '"').replace(/'/g, '&#x27;')) && !html.includes(l.h1)) throw new Error(`prerender: ${l.slug} does not carry its h1`)
  const dir = path.join(ROOT, 'dist', l.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
  urls.push(url)
  llms.push({ l, url, lead })
}
console.log(`prerendered ${LANDINGS.length} named definition pages`)

// a page per player with a records file (scripts/build-records.mjs), and his own card
const playersDir = path.join(ROOT, 'dist/players')
const players = fs.existsSync(path.join(playersDir, 'index.json')) ? JSON.parse(fs.readFileSync(path.join(playersDir, 'index.json'), 'utf8')).filter((p) => p.n > 0) : []
const SEASONS = `${fmtSeason(S.firstSeason)} to ${fmtSeason(S.currentSeason)}`
const llmsPlayers = []
{
  const t0 = Date.now()
  for (const entry of players) {
    const file = JSON.parse(fs.readFileSync(path.join(playersDir, `${entry.id}.json`), 'utf8'))
    const url = `${SITE}player/${entry.id}/`
    const fams = recordPage(decodePlayer(file), file.id)
    const face = fams[0]?.best ?? null
    const { title, description } = playerText(file.name, file.field, face, file.first, config.title)
    const person = { '@type': 'Person', name: file.name, ...(file.born ? { birthDate: file.born } : {}) }
    const { html } = page({
      url, title, description, image: `${url}og.png`, imageAlt: face ? `${file.name}: ${recordWords(face)}.` : `${file.name} on NHL Comparator.`,
      appHtml: renderToString(React.createElement(PlayerPage, { id: file.id, preload: file })), embed: file,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          { ...webPage(url, title, description), about: person },
          breadcrumb([[config.domain, `${ORIGIN}/`], [config.title, SITE], [file.name, url]]),
          { '@type': 'ItemList', name: `What ${file.name} leads`, numberOfItems: Math.min(10, fams.length), itemListElement: fams.slice(0, 10).map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: `${recordWords(f.best)}, ${placeWords(f.best)}` })) },
        ],
      },
    })
    const dir = path.join(ROOT, 'dist/player', String(entry.id))
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
    await toPng(playerCard(file, fams, { seasons: SEASONS }), path.join(dir, 'og.png'))
    urls.push(url)
    if (llmsPlayers.length < 8 && face) llmsPlayers.push({ name: file.name, url, lead: `${recordWords(face)}, ${placeWords(face)}` })
  }
  console.log(`prerendered ${players.length} player pages, each with its card, in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

const lastmod = new Date().toISOString().slice(0, 10)
fs.writeFileSync(path.join(ROOT, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join('\n')}
</urlset>
`)

fs.writeFileSync(path.join(ROOT, 'dist/llms.txt'), `# ${config.title}

> ${config.description}

Every row is a player's games in order from the NHL's own game records, ${fmtSeason(S.firstSeason)} to ${fmtSeason(S.currentSeason)}, every regular-season and playoff game the league lists. A query is a sentence (who · which stat or per-game test · how it adds up · through how many games, starts, seasons or team games of a season · regular season or playoffs · since when), and the board at ${SITE} ranks every career, or every player-season, at that window; the pages below are the questions people ask. Ranks are competition ranks, ties included. Each stat begins the season the league began recording it, and the sentence says so. Credit as "per NHL Comparator" with the page's link.

## Questions

${llms.map(({ l, url, lead }) => `- [${l.h1}](${url})${lead ? `: ${lead}` : ''}`).join('\n')}

## Players

Every player who leads a comparison at some point in his career has a page at ${SITE}player/<id>/ (${players.length.toLocaleString('en-US')} pages; the id is the NHL's own): every comparison he leads among NHL skaters (or goalies), the best first. The pages with the most:

${llmsPlayers.map((p) => `- [${p.name}](${p.url}): ${p.lead}`).join('\n')}

## Method

- [The method](${SITE}#method): what a game, a start and a win are here, where the records come from, what sits out (WHA, All-Star games, the 1918-26 Finals against non-NHL teams), and each stat's first season.

## What to read next

${SIBLINGS.map(([name, href, words]) => `- [${name}](${href}) — ${words}`).join('\n')}
`)

fs.mkdirSync(path.join(ROOT, 'dist/share'), { recursive: true })
for (const f of ['skaters', 'skaters-x', 'goalies']) fs.copyFileSync(path.join(ROOT, `src/data/${f}.json`), path.join(ROOT, `dist/share/${f}.json`))

await vite.close()
console.log(`sitemap: ${urls.length} URLs; llms.txt: ${llms.length} questions; head written for ${SITE}`)
