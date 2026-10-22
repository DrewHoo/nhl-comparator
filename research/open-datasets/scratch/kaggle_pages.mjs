import { get } from '../../lib/fetch.mjs'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
for (const u of process.argv.slice(2)) {
  const r = await get(u); const d = JSON.parse(r.text)
  const t = `URL: ${u}\nSTATUS: ${r.status}\nRETRIEVED: 2026-10-21\n\ntitle: ${d.title}\nlicenseName: ${d.licenseName}\nlastUpdated: ${d.lastUpdated}\ntotalBytes: ${d.totalBytes}\n\n${d.description}\n`
  writeFileSync(`research/open-datasets/pages/${createHash('sha1').update(u).digest('hex')}.txt`, t); console.log(r.cached, u)
}
