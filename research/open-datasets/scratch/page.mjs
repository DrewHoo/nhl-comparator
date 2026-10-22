// usage: node page.mjs <url> [regex]  -> fetch via helper, save text to pages/<sha1>.txt, print matching lines (or head)
import { get } from '../../lib/fetch.mjs'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
const [url, pat] = process.argv.slice(2)
const r = await get(url)
let t = r.text
if (/<html|<body|<div/i.test(t)) {
  t = t.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')
   .replace(/<(br|\/p|\/div|\/li|\/tr|\/h\d|p|li|tr|h\d)[^>]*>/gi,'\n').replace(/<[^>]+>/g,' ')
   .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;|&rsquo;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')
   .replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n')
}
const f = `research/open-datasets/pages/${createHash('sha1').update(url).digest('hex')}.txt`
writeFileSync(f, `URL: ${url}\nSTATUS: ${r.status}\nRETRIEVED: 2026-10-21\n\n` + t)
console.log('##', r.status, r.cached ? 'cached' : 'fetched', url, '->', f, t.length)
const lines = t.split('\n')
if (pat) { const re = new RegExp(pat, 'i'); lines.forEach((l, i) => re.test(l) && console.log(i + ':', l.trim().slice(0, 500))) }
else console.log(t.slice(0, Number(process.env.N || 2500)))
