// Throttled, cached HTTP GET for research probes. Every request any script or agent
// makes to an outside host goes through here. One request per GAP_MS per process
// (default 1500; floor 1000), exponential backoff on 429/5xx honouring Retry-After,
// a descriptive user agent, and a forever cache under data/raw/<host>/<sha1[0:2]>/<sha1>
// (body verbatim as .body, a sidecar .json with url, status, headers, bytes, fetchedAt).
// 404/403/410 are cached as misses. Run one process per host at a time.
//
//   import { get } from '../lib/fetch.mjs'
//   const r = await get(url)            // { url, status, text, cached, path }
//   const r = await get(url, { nocache: true })
//
//   node research/lib/fetch.mjs <url>   // prints the body (fetches if not cached)
import { createHash } from 'node:crypto'
import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const RAW = join(ROOT, 'data', 'raw')
const LOG = join(RAW, 'logs', 'fetch.log')
const GAP_MS = Math.max(1000, Number(process.env.GAP_MS || 1500))
const UA = 'nhl-comparator research (drewhoover.com; one request per 1.5 s; drewhoover@gmail.com)'

let last = 0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha1 = (s) => createHash('sha1').update(s).digest('hex')

function paths(url) {
  const host = new URL(url).host.replace(/[^a-z0-9.-]/gi, '_')
  const h = sha1(url)
  const dir = join(RAW, host, h.slice(0, 2))
  return { dir, body: join(dir, `${h}.body`), meta: join(dir, `${h}.json`) }
}

function log(line) {
  mkdirSync(dirname(LOG), { recursive: true })
  appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`)
}

export async function get(url, { nocache = false, headers = {} } = {}) {
  const p = paths(url)
  if (!nocache && existsSync(p.meta)) {
    const meta = JSON.parse(readFileSync(p.meta, 'utf8'))
    const text = existsSync(p.body) ? readFileSync(p.body, 'utf8') : ''
    return { url, status: meta.status, text, cached: true, path: p.body, meta }
  }
  if (process.env.OFFLINE) throw new Error(`offline: not cached ${url}`)
  let attempt = 0
  for (;;) {
    const wait = GAP_MS - (Date.now() - last)
    if (wait > 0) await sleep(wait)
    last = Date.now()
    let res
    try {
      res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json, text/html;q=0.9, */*;q=0.8', ...headers } })
    } catch (e) {
      attempt++
      log(`ERROR ${url} ${e.message} attempt=${attempt}`)
      if (attempt > 5) throw e
      await sleep(Math.min(300_000, 10_000 * 2 ** attempt))
      continue
    }
    if (res.status === 429 || res.status >= 500) {
      attempt++
      const ra = Number(res.headers.get('retry-after'))
      const backoff = ra ? ra * 1000 : Math.min(300_000, 10_000 * 2 ** attempt)
      log(`RETRY ${res.status} ${url} attempt=${attempt} backoff=${backoff}`)
      if (attempt > 6) throw new Error(`gave up on ${url} after ${attempt} attempts (${res.status})`)
      await sleep(backoff)
      continue
    }
    const text = await res.text()
    mkdirSync(p.dir, { recursive: true })
    const meta = { url, status: res.status, finalUrl: res.url, contentType: res.headers.get('content-type'), bytes: Buffer.byteLength(text), fetchedAt: new Date().toISOString() }
    writeFileSync(p.body, text)
    writeFileSync(p.meta, JSON.stringify(meta, null, 2))
    log(`${res.status} ${url} bytes=${meta.bytes}`)
    return { url, status: res.status, text, cached: false, path: p.body, meta }
  }
}

export async function getJson(url, opts) {
  const r = await get(url, opts)
  try { return { ...r, json: JSON.parse(r.text) } } catch { return { ...r, json: null } }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const url = process.argv[2]
  if (!url) { console.error('usage: node research/lib/fetch.mjs <url>'); process.exit(2) }
  const r = await get(url, { nocache: process.argv.includes('--nocache') })
  process.stderr.write(`${r.status} ${r.cached ? 'cached' : 'fetched'} ${r.path}\n`)
  process.stdout.write(r.text)
}
