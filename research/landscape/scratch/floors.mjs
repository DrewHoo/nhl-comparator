import { readFileSync, writeFileSync } from 'node:fs'
const L = JSON.parse(readFileSync('scratch/legends.json', 'utf8'))
const goalies = new Set(['Patrick Roy','Dominik Hašek','Martin Brodeur','Terry Sawchuk','Jacques Plante','Ken Dryden','Grant Fuhr','Roberto Luongo','Henrik Lundqvist','Connor Hellebuyck'])
const floors = ['1917-18','1967-68','1987-88','1997-98','2005-06','2007-08','2010-11']
const y = (s) => +s.slice(0, 4)
const cls = (p, f) => y(p.nhlFirst) >= y(f) ? 'full' : y(p.nhlLast) >= y(f) ? 'part' : 'none'
let md = '| Player | Pos | First NHL season (reg.) | Last NHL season in table | NHL GP | WHA seasons (GP) | Note | ' + floors.join(' | ') + ' |\n|' + '---|'.repeat(7 + floors.length) + '\n'
const sum = Object.fromEntries(floors.map(f => [f, { full: [], part: [], none: [] }]))
for (const p of L) {
  const name = p.title.replace(' (ice hockey)', '')
  const note = [p.playoffOnlyFirst ? `playoff-only debut ${p.playoffOnlyFirst}` : '', ['2025-26'].includes(p.nhlLast) ? 'active; GP through 2025-26' : ''].filter(Boolean).join('; ')
  const wha = p.whaFirst ? `${p.whaFirst}${p.whaLast !== p.whaFirst ? '–' + p.whaLast : ''} (${p.whaGP})` : '—'
  const c = floors.map(f => { const k = cls(p, f); sum[f][k].push(name); return k })
  md += `| ${name} | ${goalies.has(p.title) ? 'G' : 'S'} | ${p.nhlFirst} | ${p.nhlLast} | ${p.nhlGP} | ${wha} | ${note} | ${c.join(' | ')} |\n`
}
let reading = ''
for (const f of floors) reading += `- **${f} floor**: full ${sum[f].full.length}, part ${sum[f].part.length}, none ${sum[f].none.length}.\n  - Full: ${sum[f].full.join(', ') || '—'}\n  - Part: ${sum[f].part.join(', ') || '—'}\n  - None: ${sum[f].none.join(', ') || '—'}\n`
writeFileSync('scratch/legends_table.md', md + '\n' + reading)
writeFileSync('scratch/floors.json', JSON.stringify(sum, null, 1))
console.log(reading)
