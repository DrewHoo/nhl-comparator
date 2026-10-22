// usage: node save.mjs <url> [<url>...]  -> fetch via research/lib/fetch.mjs, strip HTML, save pages/<sha1(url)>.txt
import { get } from '../../lib/fetch.mjs'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const PAGES = join(dirname(fileURLToPath(import.meta.url)), '..', 'pages')
const sha1 = (s) => createHash('sha1').update(s).digest('hex')
const ent = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', minus: '−' }
function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|tr|li|h[1-6]|table|caption|dd|dt)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ent[n] ?? m)
    .replace(/[ \t ]+/g, ' ').replace(/\n\s*\n+/g, '\n')
}
for (const url of process.argv.slice(2)) {
  const r = await get(url)
  const isHtml = /<html|<body|<div/i.test(r.text.slice(0, 5000))
  const out = `URL: ${url}\nSTATUS: ${r.status}\nRETRIEVED: 2026-10-21\n\n` + (isHtml ? strip(r.text) : r.text)
  const f = join(PAGES, sha1(url) + '.txt')
  writeFileSync(f, out)
  console.log(r.status, r.cached ? 'cached' : 'fetched', sha1(url), url, out.length)
}
