import { get } from '../../lib/fetch.mjs'
for (const u of process.argv.slice(2)) { const r=await get(u); console.log('#####',r.status,r.cached?'cached':'fetched',u,r.text.length); console.log(r.text.slice(0, Number(process.env.N||3000))) }
