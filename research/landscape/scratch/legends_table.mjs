import { readFileSync, writeFileSync } from 'node:fs'
const raw = readFileSync('pages/aed5f098e8903f3a2b0088e09cd01151ac9ae337.txt', 'utf8')
const j = JSON.parse(raw.slice(raw.indexOf('{')))
const num = (s) => { const m = (s ?? '').replace(/'/g, '').match(/^\s*([\d,]+)/); return m ? +m[1].replace(/,/g, '') : 0 }
const out = []
for (const p of j.query.pages) {
  const w = p.revisions[0].slots.main.content
  const end = w.indexOf('NHL totals')
  // walk back to the start of the career stats section
  const sec = w.lastIndexOf('==', w.lastIndexOf('{|', end))
  const tbl = w.slice(sec, end + 600)
  const rows = tbl.split(/\n\|-/)
  const seasons = { NHL: [], WHA: [] }
  for (const r of rows) {
    const s = r.match(/\|\s*\[\[(\d{4})[–-](\d{2,4})[^\]]*\|/) || r.match(/(\d{4})[–-](\d{2,4})/)
    if (!s) continue
    const cells = r.split('\n').map(x => x.replace(/^[|!]\s*/, '').trim())
    const li = cells.findIndex(c => /^(\[\[([^\]|]*\|)?)?(NHL|WHA)(\]\])?$/.test(c))
    if (li < 0) continue
    const L = cells[li].includes('WHA') ? 'WHA' : 'NHL'
    const gp = num(cells[li + 1]?.split('||')[0])
    seasons[L].push({ s: `${s[1]}-${String(s[2]).slice(-2)}`, gp })
  }
  const tot = (lab) => { const i = w.indexOf(lab); if (i < 0) return null; const m = w.slice(i, i + 200).match(/\n!\s*'*([\d,]+)/); return m ? +m[1].replace(/,/g, '') : null }
  const reg = (a) => a.filter(x => x.gp > 0)
  const n = reg(seasons.NHL), h = reg(seasons.WHA)
  const playoffOnlyFirst = seasons.NHL[0] && seasons.NHL[0].gp === 0 ? seasons.NHL[0].s : null
  const sumGP = n.reduce((a, b) => a + b.gp, 0)
  out.push({ title: p.title, nhlFirst: n[0]?.s, nhlLast: n.at(-1)?.s, nhlSeasons: new Set(n.map(x => x.s)).size, nhlGP: tot('NHL totals'), rowSumGP: sumGP, playoffOnlyFirst, whaFirst: h[0]?.s ?? null, whaLast: h.at(-1)?.s ?? null, whaGP: tot('WHA totals'), revid: p.revisions[0].revid ?? null })
}
writeFileSync('scratch/legends.json', JSON.stringify(out, null, 1))
for (const o of out) console.log([o.title, o.nhlFirst, o.nhlLast, o.nhlSeasons, o.nhlGP, o.rowSumGP, o.playoffOnlyFirst, o.whaFirst, o.whaLast, o.whaGP].join(' | '))
