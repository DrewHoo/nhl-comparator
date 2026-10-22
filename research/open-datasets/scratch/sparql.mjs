import { getJson } from '../../lib/fetch.mjs'
const q = process.argv[2]
const r = await getJson('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers: { accept: 'application/sparql-results+json' } })
console.log(r.status, r.cached ? 'cached' : 'fetched', JSON.stringify(r.json?.results?.bindings?.map(b => Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value]))) ?? r.text.slice(0, 500)))
