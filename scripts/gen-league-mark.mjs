// The one-color league mark the index site's /sports rows paint (cfb-streak-king's ink-density pipeline, for one image): node scripts/gen-league-mark.mjs <src.png> <out.png>
import sharp from 'sharp'
const [src, out] = process.argv.slice(2)
const { data, info } = await sharp(src).raw().ensureAlpha().toBuffer({ resolveWithObject: true })
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255
  const ink = Math.min(1, Math.max((1 - lum) * 1.2, sat * 0.9))
  data[i] = 0; data[i + 1] = 0; data[i + 2] = 0
  data[i + 3] = Math.round(data[i + 3] * ink)
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 10 }).resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(out)
console.log('wrote', out)
