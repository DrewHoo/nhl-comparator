import { getJson } from '/Users/drewhoo/Projects/nhl-comparator/research/lib/fetch.mjs'
const C='https://sports.core.api.espn.com/v2/sports/hockey/leagues/nhl'
const show = async (u, f) => { const r = await getJson(u); console.log(r.status, u.replace(C,''), r.json ? f(r.json) : r.text.slice(0,150)) ; return r.json }
await show(`${C}/athletes/4128`, j=>`${j.displayName} debut=${JSON.stringify(j.debutYear)} active=${j.active}`)
await show(`${C}/athletes/4128/statistics`, j=>JSON.stringify(j).slice(0,500))
await show(`${C}/seasons/1998/athletes/4128/eventlog`, j=>`count=${j.events?.count} ${JSON.stringify(j).slice(0,400)}`)
await show(`${C}/seasons/1986/athletes/4128/eventlog`, j=>`count=${j.events?.count} ${JSON.stringify(j).slice(0,300)}`)
await show(`${C}/athletes/405/statistics`, j=>JSON.stringify(j.splits?.categories?.map(c=>c.name+':'+c.stats.length)).slice(0,300))
await show(`${C}/seasons/2001/athletes/405/eventlog`, j=>`count=${j.events?.count} ${JSON.stringify(j.events?.items?.[0]).slice(0,400)}`)
await show(`${C}/seasons/2010/athletes/3114/eventlog`, j=>`count=${j.events?.count} ${JSON.stringify(j.events?.items?.[0]).slice(0,400)}`)
await show(`${C}/events?dates=1998&limit=1000`, j=>`count=${j.count} pageCount=${j.pageCount} pageSize=${j.pageSize}`)
await show(`${C}/events?dates=1994&limit=1000`, j=>`count=${j.count} pageCount=${j.pageCount} first=${j.items?.[0]?.$ref}`)
await show(`${C}/seasons/1995/types/3/events?limit=1000`, j=>`count=${j.count} first=${j.items?.[0]?.$ref}`)
await show(`${C}/seasons/1995/types/2/events?limit=1000`, j=>`count=${j.count} first=${j.items?.[0]?.$ref}`)
