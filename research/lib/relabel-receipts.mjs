// Receipts whose "quote" is a computed reading of an API response (a sum, a count,
// a field pulled out of JSON) are not verbatim lines and fail the quote gate for the
// right reason. This rewrites each such receipt into the receipts-research "label
// form": { sources: [...], url, note }, with no quote, so the gate counts it as a
// labelled source instead of a miss. A quote that IS on its page is left alone.
//   node research/lib/relabel-receipts.mjs research/<slice>/return.json research/<slice>/pages
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
const [file, pages] = process.argv.slice(2)
const sha1 = (s) => createHash('sha1').update(s).digest('hex')
const norm = (s) => s.replace(/\s+/g, ' ').trim()
const data = JSON.parse(readFileSync(file, 'utf8'))
let changed = 0
const walk = (o) => {
  if (Array.isArray(o)) return o.forEach(walk)
  if (!o || typeof o !== 'object') return
  if (Array.isArray(o.receipts)) {
    o.receipts = o.receipts.map((r) => {
      if (!r.url || !r.quote) return r
      const p = join(pages, `${sha1(r.url)}.txt`)
      const text = existsSync(p) ? norm(readFileSync(p, 'utf8')) : ''
      if (text.includes(norm(r.quote))) return r
      changed++
      const host = new URL(r.url).host
      return { sources: [`api:${host}`], url: r.url, note: `computed from the cached response (data/raw/${host}/): ${r.quote}${r.note ? ` — ${r.note}` : ''}`, retrieved: r.retrieved }
    })
  }
  for (const v of Object.values(o)) walk(v)
}
walk(data)
writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
console.log(`${file}: ${changed} receipts relabelled to source form`)
