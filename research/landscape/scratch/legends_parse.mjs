import { readFileSync } from 'node:fs'
const raw = readFileSync(process.argv[2], 'utf8')
const j = JSON.parse(raw.slice(raw.indexOf('{')))
for (const p of j.query.pages) {
  const w = p.revisions?.[0]?.slots?.main?.content ?? ''
  const cs = (w.match(/\|\s*career_start\s*=\s*([^\n|]*)/) || [])[1]
  const ce = (w.match(/\|\s*career_end\s*=\s*([^\n|]*)/) || [])[1]
  const lines = w.split('\n').filter(l => /NHL totals/.test(l)).slice(0, 3)
  const wha = w.split('\n').filter(l => /WHA totals/.test(l)).slice(0, 1)
  console.log('##', p.title, '| start', cs?.trim(), '| end', ce?.trim(), '| len', w.length)
  for (const l of lines) console.log('  NHL:', l.slice(0, 260))
  for (const l of wha) console.log('  WHA:', l.slice(0, 200))
}
