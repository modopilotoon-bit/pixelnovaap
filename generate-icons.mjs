/**
 * PixelNova PWA Icon Generator
 * Generates icon-192.png and icon-512.png in public/icons/
 * No external dependencies — uses only Node.js built-ins (zlib, fs, crypto).
 *
 * Usage:
 *   node generate-icons.mjs
 */

import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import zlib from 'zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// PixelNova brand colors
const BG     = { r: 10,  g: 10,  b: 15  }   // #0A0A0F
const CIRCLE = { r: 59,  g: 158, b: 255 }   // #3B9EFF
const TEXT   = { r: 255, g: 255, b: 255 }   // #FFFFFF

function generatePNG(size) {
  const pixels = new Uint8Array(size * size * 4)

  // Background + blue circle
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.45

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const col = dist <= radius ? CIRCLE : BG
      pixels[idx]     = col.r
      pixels[idx + 1] = col.g
      pixels[idx + 2] = col.b
      pixels[idx + 3] = 255
    }
  }

  // Draw "PN" text using filled rectangles
  const textSize = Math.floor(size * 0.32)
  const textY    = Math.floor(size * 0.35)
  const totalW   = Math.floor(textSize * 1.1)
  const startX   = Math.floor((size - totalW) / 2) - Math.floor(textSize * 0.1)
  const barW     = Math.max(2, Math.floor(textSize * 0.12))

  function drawRect(x1, y1, w, h) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const px = x1 + dx
        const py = y1 + dy
        if (px >= 0 && py >= 0 && px < size && py < size) {
          const idx = (py * size + px) * 4
          pixels[idx]     = TEXT.r
          pixels[idx + 1] = TEXT.g
          pixels[idx + 2] = TEXT.b
          pixels[idx + 3] = 255
        }
      }
    }
  }

  // Letter "P"
  const pW = Math.floor(textSize * 0.45)
  drawRect(startX, textY, barW, textSize)                          // left vertical
  drawRect(startX, textY, pW, barW)                               // top horizontal
  drawRect(startX, textY + Math.floor(textSize * 0.45), pW, barW) // mid horizontal
  drawRect(startX + pW - barW, textY, barW, Math.floor(textSize * 0.45) + barW) // right curve

  // Letter "N"
  const nX = startX + Math.floor(textSize * 0.6)
  const nW = Math.floor(textSize * 0.45)
  drawRect(nX,          textY, barW, textSize) // left vertical
  drawRect(nX + nW,     textY, barW, textSize) // right vertical
  for (let step = 0; step < textSize; step++) { // diagonal
    const dx = nX + barW + Math.floor(step * (nW - barW) / textSize)
    drawRect(dx, textY + step, barW, 1)
  }

  // ---- PNG encoding ----
  const crcTable = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    crcTable[i] = c
  }
  function crc32(buf) {
    let crc = 0xFFFFFFFF
    for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  function makeChunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii')
    const lenBuf    = Buffer.alloc(4)
    lenBuf.writeUInt32BE(data.length)
    const crcBuf    = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))
    return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8]  = 8  // 8-bit depth
  ihdr[9]  = 6  // RGBA color type
  ihdr[10] = 0  // deflate compression
  ihdr[11] = 0  // adaptive filtering
  ihdr[12] = 0  // no interlace

  // IDAT chunk — one filter-None byte per row, then RGBA pixels
  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4)
    row[0] = 0  // filter type: None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4
      row[1 + x * 4]     = pixels[src]
      row[1 + x * 4 + 1] = pixels[src + 1]
      row[1 + x * 4 + 2] = pixels[src + 2]
      row[1 + x * 4 + 3] = pixels[src + 3]
    }
    rows.push(row)
  }
  const compressed = zlib.deflateSync(Buffer.concat(rows), { level: 6 })

  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    PNG_SIG,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const png  = generatePNG(size)
  const dest = join(outDir, `icon-${size}.png`)
  writeFileSync(dest, png)
  console.log(`Generated ${dest} (${png.length} bytes)`)
}
