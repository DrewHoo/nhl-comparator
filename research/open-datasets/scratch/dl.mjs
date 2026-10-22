import { get } from '../../lib/fetch.mjs'
const B='https://github.com/sportsdataverse/sportsdataverse-data/releases/download/'
for (const p of process.argv.slice(2)) { const r=await get(B+p); console.log(r.status, r.cached?'cached':'fetched', p, r.text.length, r.path) }
