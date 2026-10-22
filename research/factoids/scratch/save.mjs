// usage: node save.mjs <urlsfile>  -- fetches each URL via the shared helper, saves stripped text to pages/<sha1(url)>.txt
import { get } from '../../lib/fetch.mjs'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const here = dirname(fileURLToPath(import.meta.url))
const pages = join(here, '..', 'pages')
const ent = { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', ndash:'–', mdash:'—', rsquo:'’', lsquo:'‘', rdquo:'”', ldquo:'“', hellip:'…', minus:'−', eacute:'é', auml:'ä', ouml:'ö' }
function strip(html) {
  return html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<sup[^>]*class="reference[\s\S]*?<\/sup>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6]|table|ul|ol|section|article)>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ent[n.toLowerCase()] ?? m)
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n[ \n]*/g, '\n')
    .trim()
}
const urls = readFileSync(process.argv[2], 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
for (const url of urls) {
  try {
    const r = await get(url)
    const h = createHash('sha1').update(url).digest('hex')
    const text = `URL: ${url}\nSTATUS: ${r.status}\nRETRIEVED: 2026-10-21\n\n` + strip(r.text)
    writeFileSync(join(pages, `${h}.txt`), text)
    appendFileSync(join(here, 'index.tsv'), `${h}\t${r.status}\t${text.length}\t${url}\n`)
    console.log(r.status, text.length, h, url)
  } catch (e) { console.log('ERR', url, e.message) }
}
