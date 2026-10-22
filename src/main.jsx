import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { landingFromPath } from './lib/landing.ts'
import './styles.css'

// the page's own query, from its path: a landing's, or none at the root. The
// prerender passed the same to the markup it baked, so the hydrate matches;
// the search params (a slot moved, a player open) apply in App's first effect.
const BASE = import.meta.env.BASE_URL
const rel = window.location.pathname.startsWith(BASE) ? window.location.pathname.slice(BASE.length) : ''
const landing = landingFromPath(rel)
const initial = landing ? { query: landing.query } : null

// The markup is already in the HTML: scripts/prerender.mjs bakes it in at
// build time so crawlers get the whole page without running anything.
// Hydrate onto it rather than throwing it away. The dev server has no baked
// markup, so fall back to a plain render there. A player page carries its
// records file in the HTML and loads no ledger, so it imports only its page.
const root = document.getElementById('root')
const mount = (node) => {
  const app = <React.StrictMode>{node}</React.StrictMode>
  if (root.firstChild) hydrateRoot(root, app)
  else createRoot(root).render(app)
}
const player = /^player\/(\d+)\/?$/.exec(rel)
const embedded = (id) => { try { return JSON.parse(document.getElementById(id)?.textContent ?? 'null') } catch { return null } }
if (/^team(\/[a-z]+\/[a-z]+)?\/?$/.test(rel)) {
  // a team page or the index: the data is in the HTML (the prerender's); the dev server has none and says so
  const preload = embedded('group-data')
  import('./components/GroupPage.jsx').then(({ GroupPage, GroupIndex }) => mount(/^team\/?$/.test(rel) ? <GroupIndex preload={preload} /> : <GroupPage preload={preload} />))
} else if (player) {
  let preload = null
  try { preload = JSON.parse(document.getElementById('player-data')?.textContent ?? 'null') } catch {}
  import('./components/PlayerPage.jsx').then(({ PlayerPage }) => mount(<PlayerPage id={player[1]} preload={preload} />))
} else {
  import('./App.jsx').then(({ default: App }) => mount(<App initial={initial} />))
}
