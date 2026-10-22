import { getJson } from '../../lib/fetch.mjs'
for (const q of process.argv.slice(2)) {
  const r = await getJson('https://api.github.com/search/repositories?per_page=15&q=' + encodeURIComponent(q))
  console.log('##', r.status, q, r.json?.total_count)
  for (const x of r.json?.items || []) console.log('  ', x.full_name, '|', (x.description||'').slice(0,110), '|', x.license?.spdx_id, '|', x.pushed_at?.slice(0,10), '|', x.stargazers_count, '|', x.size)
}
