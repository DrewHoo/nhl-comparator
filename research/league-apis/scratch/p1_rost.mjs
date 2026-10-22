import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const B='https://api-web.nhle.com/v1/'
for (const [t,s,names] of [['MTL','19441945',['Richard']],['PIT','19881989',['Lemieux']],['DET','19521953',['Howe']],['BOS','19701971',['Orr']]]) {
  const r = await getJson(`${B}roster/${t}/${s}`)
  const all = [...(r.json?.forwards||[]),...(r.json?.defensemen||[]),...(r.json?.goalies||[])]
  console.log(t,s,r.status, all.filter(p=>names.includes(p.lastName.default)).map(p=>`${p.firstName.default} ${p.lastName.default} ${p.id}`).join('; '))
}
