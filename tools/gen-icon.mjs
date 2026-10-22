// 生成 src/images/icon.png（192×192）：上红下蓝的圆形，中间一个白色羽毛球。
// 纯 Node 实现，不依赖第三方库：4×4 超采样抗锯齿，输出 RGBA PNG。
import zlib from 'zlib'
import fs from 'fs'

const SIZE = 192
const SS = 4
const RED = [255, 92, 97] // #ff5c61
const BLUE = [79, 143, 255] // #4f8fff
const WHITE = [255, 255, 255]
const BLACK = [0, 0, 0]
const GREY = [200, 200, 200]

// 返回 (x, y) 处的颜色；圆外返回 null（透明）
function colorAt(x, y) {
  const c = SIZE / 2
  if ((x - c) ** 2 + (y - c) ** 2 > 92 ** 2) return null
  // 羽毛球：上宽下窄的羽毛裙（带三条羽骨）+ 灰色箍 + 底部半圆球头
  if (y >= 40 && y <= 110) {
    const t = (y - 40) / 70
    const half = 42 - t * 24
    if (Math.abs(x - c) <= half) {
      for (const top of [-22, 0, 22]) {
        const ribX = c + top * (1 - t * 0.6)
        if (Math.abs(x - ribX) <= 1.6) return GREY
      }
      return WHITE
    }
  }
  if (y > 110 && y <= 116 && Math.abs(x - c) <= 19) return GREY
  if (y > 116 && (x - c) ** 2 + (y - 116) ** 2 <= 19 ** 2) return WHITE
  if (Math.abs(y - c) <= 3) return BLACK
  return y < c ? RED : BLUE
}

function render() {
  const rows = []
  for (let py = 0; py < SIZE; py++) {
    const row = Buffer.alloc(1 + SIZE * 4) // 每行开头 1 字节过滤类型 0
    for (let px = 0; px < SIZE; px++) {
      let r = 0
      let g = 0
      let b = 0
      let n = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const color = colorAt(px + (sx + 0.5) / SS, py + (sy + 0.5) / SS)
          if (!color) continue
          r += color[0]
          g += color[1]
          b += color[2]
          n++
        }
      }
      const o = 1 + px * 4
      if (n > 0) {
        row[o] = Math.round(r / n)
        row[o + 1] = Math.round(g / n)
        row[o + 2] = Math.round(b / n)
        row[o + 3] = Math.round((n / (SS * SS)) * 255)
      }
    }
    rows.push(row)
  }
  return Buffer.concat(rows)
}

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // 位深
ihdr[9] = 6 // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(render())),
  chunk('IEND', Buffer.alloc(0)),
])

fs.mkdirSync('src/images', { recursive: true })
fs.writeFileSync('src/images/icon.png', png)
console.log('icon written: src/images/icon.png')
