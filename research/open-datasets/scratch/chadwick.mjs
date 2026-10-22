import { get } from '../../lib/fetch.mjs'
let tot=0, nhl=0, both=0, cols
for (const c of '0123456789abcdef') {
  const r = await get(`https://raw.githubusercontent.com/chadwickbureau/register/master/data/people-${c}.csv`)
  const lines = r.text.split('\n').filter(Boolean)
  const hdr = lines[0].split(','); cols = hdr
  const i = hdr.indexOf('key_sr_nhl'), j = hdr.indexOf('key_bbref'), k=hdr.indexOf('birth_year')
  for (const l of lines.slice(1)) { const f = l.split(','); tot++; if (f[i]) { nhl++; if (f[k]) both++ } }
  process.stderr.write(c + ' ' + r.status + '\n')
}
console.log({ tot, nhl, nhlWithBirthYear: both, keyCols: cols.filter(c => c.startsWith('key_')) })
