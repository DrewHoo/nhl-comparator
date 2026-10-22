// A column of small integers as a short string: each value zigzag-encoded and
// written in base-64 digits of five bits with a continuation bit, so a value
// under 32 is one character and a value under 1,024 two. Delta columns
// (date, season, team, the team's game number) are written as differences
// and summed back on decode. The builder (pipeline/build-ledger.mjs) and the
// client (ledger.ts) share this file so the two can't disagree.
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const VAL = new Int8Array(128).fill(-1)
for (let i = 0; i < 64; i++) VAL[ABC.charCodeAt(i)] = i

export function pack(values: ArrayLike<number>, delta = false): string {
  let out = ''
  let prev = 0
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    const d = delta ? v - prev : v
    if (delta) prev = v
    let z = d >= 0 ? d * 2 : -d * 2 - 1
    while (z >= 32) { out += ABC[(z & 31) | 32]; z = Math.floor(z / 32) }
    out += ABC[z]
  }
  return out
}

/** decodes into an Int16Array, or an Int32Array for a wide column (dates) */
export function unpack(s: string, n: number, delta = false, wide = false): Int16Array | Int32Array {
  const out = wide ? new Int32Array(n) : new Int16Array(n)
  let i = 0, k = 0, prev = 0
  while (k < s.length && i < n) {
    let z = 0, shift = 1
    for (;;) {
      const c = VAL[s.charCodeAt(k++)]
      if (c < 0) throw new Error(`pack: bad digit at ${k - 1}`)
      z += (c & 31) * shift
      if (c < 32) break
      shift *= 32
    }
    const d = z % 2 === 0 ? z / 2 : -(z + 1) / 2
    const v = delta ? prev + d : d
    if (delta) prev = v
    out[i++] = v
  }
  if (i !== n) throw new Error(`pack: expected ${n} values, got ${i}`)
  return out
}
