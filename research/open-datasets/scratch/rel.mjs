import { getJson } from '../../lib/fetch.mjs'
const out=[]
for (let p=1;p<=4;p++){
  const r=await getJson(`https://api.github.com/repos/sportsdataverse/sportsdataverse-data/releases?per_page=100&page=${p}`)
  if(!r.json||!r.json.length) {console.error('stop',p,r.status);break}
  for(const x of r.json) out.push({tag:x.tag_name, n:x.assets.length, pub:x.published_at, assets:x.assets.map(a=>[a.name,a.size,a.updated_at])})
  if(r.json.length<100)break
}
import {writeFileSync} from 'node:fs'
writeFileSync(new URL('./releases.json',import.meta.url),JSON.stringify(out,null,1))
console.log(out.length, out.map(x=>x.tag).join(' '))
