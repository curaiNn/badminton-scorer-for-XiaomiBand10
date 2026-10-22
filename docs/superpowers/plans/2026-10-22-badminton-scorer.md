# 羽毛球计分（小米手环10）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 做一个装在小米手环10 上的羽毛球计分 Vela JS 应用（.rpk）：红蓝两方点击计分、撤销、发球提示、三局两胜、21/15 分制、振动与常亮、每分存盘。

**Architecture:**
- 计分规则和比赛记录操作是两个纯函数模块（`rules.js`、`match.js`），整场状态由「得分顺序」回放推算。
- 存储和设备接口各包一层（`store.js`、`device.js`），系统模块从参数传入，因此四个模块都能在 Node 里做单元测试。
- 界面是两个页面（计分页、更多页），用 `@system.router` 跳转，页面之间只通过存储共享数据。

**Tech Stack:** Xiaomi Vela JS 应用框架（.ux 页面）、aiot-toolkit 2.0.5、Node 22（`node --test`）、AstroBox（真机安装）。

**设计文档：** `docs/superpowers/specs/2026-10-22-badminton-scorer-design.md`（以下简称「设计」）。

---

## 环境约定（每个任务都适用）

- 项目根目录：`/Users/curain/code/badminton-scorer-for-XiaomiBand10`，所有命令都在这里执行。
- 这台 Mac 的 PATH 里，`/opt/homebrew/bin/npm` 是 2021 年残留的 npm 8.1.0 链接，排在 nvm 之前。**凡是用到 node / npm / npx 的命令块，第一行都要先执行：**

  ```bash
  export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
  ```

  执行后 `npm -v` 应输出 `10.9.4`。不要删除或修改 `/opt/homebrew` 下的文件，那是用户自己的环境。
- 提交信息末尾都要带一行：`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。下文的 `git commit` 用两个 `-m` 实现。
- Vela 框架要点（来自调研，写 .ux 时必须遵守）：
  - 页面数据放在 `private`；路由参数放在 `protected`，到达时都是字符串。不渲染的内部状态直接作为对象属性，例如 `record: null`。
  - 只用 flex 布局，选择器只用 class；每段 `text` 都要显式写 `color`。
  - 除 swipe 外，事件都会冒泡，所以可点击元素之间不要互相嵌套。
  - 不写 emoji 和特殊符号。
  - `z-index` 无效，切换界面用 `if`。
  - 凡是 import 的系统模块，都要写进 manifest 的 `features`，否则编译失败。

## 与设计文档的差异（实现层面的细化，不改变功能）

1. **`deriveMatch().games`：** 只含已结束的局，进行中的局放在 `current` 里；另外加了 `valid` 字段，用来识别损坏数据。
2. **系统模块改为注入：** `store.js`、`device.js` 改成工厂函数 `createStore(storage)`、`createDevice(vibrator, brightness)`，页面里传入系统模块，测试里传入假对象。
3. **错误码的传递：** 计分页的错误码通过路由参数 `err` 传给更多页显示。两页各自打包，模块里的变量不能跨页共享，所以不能直接读。
4. **圆角不加同色边框：** miSmash 已在手环10 上实测 `border-radius` 单独生效。若真机圆角显示成直角，再按设计第 2 节补同色边框。
5. **顶栏文字去掉数字两侧空格：** 写作「第2局 · 21分」，为了在 126px 宽的顶栏里和「更多」按钮放在一起。
6. **点击防抖：** 计分卡片加 250ms 防抖，防止真机上一次点击触发两次（做法来自 miSmash）。

## 文件结构

| 文件 | 职责 |
|---|---|
| `package.json` | 依赖（aiot-toolkit 2.0.5）和脚本：start / build / release / test / icon |
| `tools/gen-icon.mjs` | 用纯 Node 生成 192×192 的应用图标 |
| `src/manifest.json` | 包名、名称、设计宽度、系统接口声明、页面路由 |
| `src/app.ux` | 应用入口，空实现 |
| `src/images/icon.png` | 生成的图标 |
| `src/common/rules.js` | 赛制参数、单局胜负、由比赛记录推算整场状态 |
| `src/common/match.js` | 比赛记录的操作：得分、撤销、下一局、本局清零、新比赛、切换赛制、校验 |
| `src/common/store.js` | 读写比赛记录与设置，带超时、错误码和数据校验 |
| `src/common/device.js` | 振动模式与屏幕常亮 |
| `src/pages/score/score.ux` | 计分页，含局结束、比赛结束提示层 |
| `src/pages/more/more.ux` | 更多页 |
| `test/*.test.mjs` | 四个公共模块的单元测试 |
| `README.md` | 构建、测试、安装说明 |
| `docs/real-device-checklist.md` | 真机验收记录 |

---

### Task 1: 开发环境与 package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: 确认 Node 与 npm 版本**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
node -v && npm -v
```

Expected: `v22.21.1` 和 `10.9.4`。

- [ ] **Step 2: 写 package.json**

```json
{
  "name": "badminton-scorer",
  "version": "1.0.0",
  "private": true,
  "description": "小米手环10 羽毛球计分（Xiaomi Vela JS 应用）",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "start": "aiot start --watch",
    "build": "aiot build",
    "release": "aiot release",
    "test": "node --test --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \"test/*.test.mjs\"",
    "icon": "node tools/gen-icon.mjs"
  },
  "devDependencies": {
    "@aiot-toolkit/jsc": "^1.0.3",
    "aiot-toolkit": "2.0.5"
  }
}
```

说明：
- `test` 脚本里的 glob 必须加引号，交给 Node 自己展开。传目录 `test/` 会失败，这一点已在本机验证过。
- `src/common/*.js` 用 ES module 语法，而 package.json 没有声明 `"type": "module"`。Node 22 会自动识别，`--disable-warning` 用来关掉由此产生的提示。不加 `"type": "module"`，是为了不影响 aiot-toolkit 自己的加载方式。

- [ ] **Step 3: 安装依赖**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm install
```

Expected: 生成 `node_modules/` 和 `package-lock.json`，没有 `ERR!`。如果下载很慢或失败，改用 npmmirror 镜像重试：`npm install --registry=https://registry.npmmirror.com`。

- [ ] **Step 4: 确认 aiot 命令可用**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npx aiot --help
```

Expected: 列出 `build`、`release`、`start`、`createVVD`、`initEmulatorEnv` 等命令。

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: 添加 package.json 与 aiot-toolkit 依赖" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: 应用图标生成脚本

**Files:**
- Create: `tools/gen-icon.mjs`
- Create（生成）: `src/images/icon.png`

图标为圆形，上半红、下半蓝，中间一道黑缝，上面一个白色羽毛球（羽毛裙朝上、带三条灰色羽骨，半圆球头朝下），圆外透明。

- [ ] **Step 1: 写生成脚本**

`tools/gen-icon.mjs`：

```js
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
```

- [ ] **Step 2: 生成并检查图标**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm run icon && file src/images/icon.png
```

Expected: `icon written: src/images/icon.png`，以及 `PNG image data, 192 x 192, 8-bit/color RGBA, non-interlaced`。然后用图片查看工具打开（agent 用 Read 工具读 PNG），确认是上红下蓝的圆形、中间有一个看得出是羽毛球的白色图形（不像感叹号）、圆外透明。

- [ ] **Step 3: Commit**

```bash
git add tools/gen-icon.mjs src/images/icon.png
git commit -m "feat: 添加应用图标及生成脚本" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: manifest、入口与占位页面，跑通第一次构建

**Files:**
- Create: `src/manifest.json`
- Create: `src/app.ux`
- Create: `src/pages/score/score.ux`（占位，Task 8 整体替换）
- Create: `src/pages/more/more.ux`（占位，Task 9 整体替换）

- [ ] **Step 1: 写 manifest**

`src/manifest.json`：

```json
{
  "package": "com.curain.badminton",
  "name": "羽毛球计分",
  "versionName": "1.0.0",
  "versionCode": 1,
  "minPlatformVersion": 1200,
  "icon": "/images/icon.png",
  "deviceTypeList": [
    "watch"
  ],
  "features": [
    { "name": "system.router" },
    { "name": "system.storage" },
    { "name": "system.vibrator" },
    { "name": "system.brightness" },
    { "name": "system.app" }
  ],
  "config": {
    "logLevel": "log",
    "designWidth": 212
  },
  "display": {
    "backgroundColor": "#000000"
  },
  "router": {
    "entry": "pages/score",
    "pages": {
      "pages/score": {
        "component": "score"
      },
      "pages/more": {
        "component": "more"
      }
    }
  }
}
```

说明：
- `deviceTypeList` 必须是 `watch`（填 band 会装机失败）。
- `designWidth: 212` 让 1px 等于手环10 的 1 个物理像素。
- 不要加 `--enable-jsc` 等编译参数。

- [ ] **Step 2: 写入口文件**

`src/app.ux`：

```html
<script>
export default {
  onCreate() {},
  onDestroy() {}
}
</script>
```

- [ ] **Step 3: 写两个占位页面**

`src/pages/score/score.ux`：

```html
<template>
  <div class="page">
    <text class="hello">计分页</text>
  </div>
</template>

<script>
export default {
  private: {}
}
</script>

<style>
.page {
  width: 212px;
  height: 520px;
  justify-content: center;
  align-items: center;
  background-color: #000000;
}

.hello {
  font-size: 20px;
  color: #eeeeee;
}
</style>
```

`src/pages/more/more.ux`：与上面相同，只把文字「计分页」改为「更多」。完整内容：

```html
<template>
  <div class="page">
    <text class="hello">更多</text>
  </div>
</template>

<script>
export default {
  private: {}
}
</script>

<style>
.page {
  width: 212px;
  height: 520px;
  justify-content: center;
  align-items: center;
  background-color: #000000;
}

.hello {
  font-size: 20px;
  color: #eeeeee;
}
</style>
```

- [ ] **Step 4: 构建调试包**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm run build && ls dist/
```

Expected: 构建成功，`dist/` 下出现 `com.curain.badminton.debug.1.0.0.rpk`。如果报 `missing feature`，按提示把对应模块补进 manifest 的 `features`。

- [ ] **Step 5: Commit**

```bash
git add src/manifest.json src/app.ux src/pages
git commit -m "feat: 添加 manifest、入口与占位页面，构建可产出 rpk" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 计分规则模块 rules.js（TDD）

**Files:**
- Create: `test/rules.test.mjs`
- Create: `src/common/rules.js`

- [ ] **Step 1: 写失败的测试**

`test/rules.test.mjs`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { RED, BLUE, RULES, isRule, isGameWon, deriveMatch } from '../src/common/rules.js'

const R = (n) => 'R'.repeat(n)
const B = (n) => 'B'.repeat(n)
const rec = (rule, pts, acked) => ({ v: 1, rule: rule, pts: pts, acked: acked })

test('赛制参数', () => {
  assert.deepEqual(RULES[21], { target: 21, cap: 30, swapAt: 11 })
  assert.deepEqual(RULES[15], { target: 15, cap: 21, swapAt: 8 })
  assert.equal(RED, 'R')
  assert.equal(BLUE, 'B')
})

test('isRule 只接受数字 21 和 15', () => {
  assert.equal(isRule(21), true)
  assert.equal(isRule(15), true)
  assert.equal(isRule('21'), false)
  assert.equal(isRule(11), false)
})

test('21 分制单局胜负：领先 2 分或先到 30', () => {
  assert.equal(isGameWon(21, 19, 21), true)
  assert.equal(isGameWon(21, 20, 21), false)
  assert.equal(isGameWon(22, 20, 21), true)
  assert.equal(isGameWon(29, 28, 21), false)
  assert.equal(isGameWon(30, 29, 21), true)
  assert.equal(isGameWon(20, 0, 21), false)
})

test('15 分制单局胜负：领先 2 分或先到 21', () => {
  assert.equal(isGameWon(15, 13, 15), true)
  assert.equal(isGameWon(15, 14, 15), false)
  assert.equal(isGameWon(16, 14, 15), true)
  assert.equal(isGameWon(20, 19, 15), false)
  assert.equal(isGameWon(21, 20, 15), true)
})

test('空记录：第 1 局 0:0，不显示发球', () => {
  const s = deriveMatch(rec(21, '', 0))
  assert.equal(s.valid, true)
  assert.equal(s.phase, 'playing')
  assert.deepEqual(s.current, { index: 0, red: 0, blue: 0 })
  assert.deepEqual(s.gamesWon, { red: 0, blue: 0 })
  assert.deepEqual(s.games, [])
  assert.equal(s.completed, 0)
  assert.equal(s.server, null)
  assert.equal(s.court, null)
  assert.equal(s.matchWinner, null)
})

test('得分方发球，按其得分单双决定左右区', () => {
  let s = deriveMatch(rec(21, 'RR', 0))
  assert.equal(s.server, 'R')
  assert.equal(s.court, 'right')
  s = deriveMatch(rec(21, 'RRB', 0))
  assert.deepEqual(s.current, { index: 0, red: 2, blue: 1 })
  assert.equal(s.server, 'B')
  assert.equal(s.court, 'left')
})

test('一局结束、尚未点下一局：gameOver，显示刚结束的局', () => {
  const s = deriveMatch(rec(21, R(21), 0))
  assert.equal(s.phase, 'gameOver')
  assert.equal(s.completed, 1)
  assert.deepEqual(s.games, [{ red: 21, blue: 0, winner: 'R' }])
  assert.deepEqual(s.current, { index: 0, red: 21, blue: 0 })
  assert.deepEqual(s.gamesWon, { red: 1, blue: 0 })
  assert.equal(s.server, null)
})

test('点过下一局：第 2 局 0:0，上一局胜方在右区发球', () => {
  const s = deriveMatch(rec(21, R(21), 1))
  assert.equal(s.phase, 'playing')
  assert.deepEqual(s.current, { index: 1, red: 0, blue: 0 })
  assert.equal(s.server, 'R')
  assert.equal(s.court, 'right')
})

test('21 分制 20 平后须领先 2 分', () => {
  const deuce = 'RB'.repeat(20)
  assert.equal(deriveMatch(rec(21, deuce + 'R', 0)).phase, 'playing')
  const s = deriveMatch(rec(21, deuce + 'RR', 0))
  assert.equal(s.phase, 'gameOver')
  assert.deepEqual(s.games[0], { red: 22, blue: 20, winner: 'R' })
})

test('21 分制 29 平后先到 30 胜', () => {
  const s = deriveMatch(rec(21, 'RB'.repeat(29) + 'B', 0))
  assert.equal(s.phase, 'gameOver')
  assert.deepEqual(s.games[0], { red: 29, blue: 30, winner: 'B' })
})

test('15 分制：15 分胜、14 平须领先 2 分、先到 21 胜', () => {
  assert.equal(deriveMatch(rec(15, R(15), 0)).phase, 'gameOver')
  assert.equal(deriveMatch(rec(15, 'RB'.repeat(14) + 'R', 0)).phase, 'playing')
  const s = deriveMatch(rec(15, 'RB'.repeat(20) + 'R', 0))
  assert.equal(s.phase, 'gameOver')
  assert.deepEqual(s.games[0], { red: 21, blue: 20, winner: 'R' })
})

test('2:0 比赛结束', () => {
  const s = deriveMatch(rec(21, R(21) + R(21), 1))
  assert.equal(s.phase, 'matchOver')
  assert.equal(s.matchWinner, 'R')
  assert.deepEqual(s.gamesWon, { red: 2, blue: 0 })
  assert.equal(s.games.length, 2)
  assert.deepEqual(s.current, { index: 1, red: 21, blue: 0 })
  assert.equal(s.server, null)
})

test('1:1 进入第 3 局，第 2 局胜方发球', () => {
  const s = deriveMatch(rec(21, R(21) + B(21), 2))
  assert.equal(s.phase, 'playing')
  assert.deepEqual(s.current, { index: 2, red: 0, blue: 0 })
  assert.equal(s.server, 'B')
  assert.equal(s.court, 'right')
})

test('2:1 比赛结束，记录每局比分', () => {
  const s = deriveMatch(rec(21, R(21) + B(21) + 'B'.repeat(10) + R(21), 2))
  assert.equal(s.phase, 'matchOver')
  assert.equal(s.matchWinner, 'R')
  assert.deepEqual(s.games.map((g) => g.red + ':' + g.blue), ['21:0', '0:21', '21:10'])
})

test('比赛结束后还有得分：valid 为 false', () => {
  assert.equal(deriveMatch(rec(21, R(21) + R(21) + 'B', 1)).valid, false)
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test
```

Expected: FAIL，报错 `Cannot find module` 指向 `src/common/rules.js`。

- [ ] **Step 3: 实现 rules.js**

`src/common/rules.js`：

```js
// 羽毛球计分规则：纯函数，不依赖任何系统接口，可直接在 Node 中测试。
// 比赛记录只保存得分顺序 pts（'R' 红方得分，'B' 蓝方得分），
// 比分、局分、发球方、一局或整场是否结束都由回放 pts 推算得出。

export const RED = 'R'
export const BLUE = 'B'
export const GAMES_TO_WIN = 2

// target：每局目标分；cap：封顶分（先到即胜）；swapAt：决胜局换边分
export const RULES = {
  21: { target: 21, cap: 30, swapAt: 11 },
  15: { target: 15, cap: 21, swapAt: 8 },
}

export function isRule(rule) {
  return rule === 21 || rule === 15
}

export function isGameWon(own, other, rule) {
  const r = RULES[rule]
  return own === r.cap || (own >= r.target && own - other >= 2)
}

// 推算整场状态。record: { rule, pts, acked }，acked 是用户已点过「下一局」的已结束局数。
export function deriveMatch(record) {
  const games = [] // 已结束的局：{ red, blue, winner }
  const gamesWon = { red: 0, blue: 0 }
  let red = 0
  let blue = 0
  let last = null // 进行中的局里最后一分的得分方
  let matchWinner = null
  let valid = true

  for (let i = 0; i < record.pts.length; i++) {
    if (matchWinner) {
      valid = false // 比赛结束后还有得分，说明数据损坏
      break
    }
    const side = record.pts[i]
    if (side === RED) red++
    else blue++
    last = side
    const own = side === RED ? red : blue
    const other = side === RED ? blue : red
    if (isGameWon(own, other, record.rule)) {
      games.push({ red: red, blue: blue, winner: side })
      if (side === RED) gamesWon.red++
      else gamesWon.blue++
      if (gamesWon.red === GAMES_TO_WIN || gamesWon.blue === GAMES_TO_WIN) matchWinner = side
      red = 0
      blue = 0
      last = null
    }
  }

  const completed = games.length
  let phase = 'playing'
  if (matchWinner) phase = 'matchOver'
  else if (completed > record.acked) phase = 'gameOver'

  let current
  let server = null
  let court = null
  if (phase === 'playing') {
    current = { index: completed, red: red, blue: blue }
    server = last || (completed > 0 ? games[completed - 1].winner : null)
    if (server) {
      const serverScore = server === RED ? red : blue
      court = serverScore % 2 === 0 ? 'right' : 'left'
    }
  } else {
    const g = games[completed - 1]
    current = { index: completed - 1, red: g.red, blue: g.blue }
  }

  return { valid, phase, games, completed, gamesWon, current, server, court, matchWinner }
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test
```

Expected: `# pass 15`、`# fail 0`。

- [ ] **Step 5: Commit**

```bash
git add src/common/rules.js test/rules.test.mjs
git commit -m "feat: 计分规则模块，支持 21/15 分制与三局两胜" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: 比赛记录操作 match.js（TDD）

**Files:**
- Create: `test/match.test.mjs`
- Create: `src/common/match.js`

- [ ] **Step 1: 写失败的测试**

`test/match.test.mjs`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deriveMatch } from '../src/common/rules.js'
import { newMatch, addPoint, undo, nextGame, resetGame, setRule, normalize } from '../src/common/match.js'

const R = (n) => 'R'.repeat(n)
const B = (n) => 'B'.repeat(n)
const rec = (rule, pts, acked) => ({ v: 1, rule: rule, pts: pts, acked: acked })

// 依次得分，返回最后的记录和每一分的事件
function play(record, seq) {
  const events = []
  for (const side of seq) {
    const result = addPoint(record, side)
    record = result.record
    events.push(result.event)
  }
  return { record, events }
}

test('newMatch', () => {
  assert.deepEqual(newMatch(15), { v: 1, rule: 15, pts: '', acked: 0 })
})

test('普通得分：追加记录，不修改入参', () => {
  const start = newMatch(21)
  const result = addPoint(start, 'R')
  assert.equal(result.event, 'point')
  assert.equal(result.record.pts, 'R')
  assert.equal(start.pts, '')
})

test('无效的一方不得分', () => {
  const start = newMatch(21)
  assert.deepEqual(addPoint(start, 'X'), { record: start, event: null })
})

test('结束一局的那一分：event 为 game', () => {
  const { record, events } = play(rec(21, R(20), 0), 'R')
  assert.deepEqual(events, ['game'])
  assert.equal(deriveMatch(record).phase, 'gameOver')
})

test('gameOver 时得分无效', () => {
  const over = rec(21, R(21), 0)
  const result = addPoint(over, 'B')
  assert.equal(result.event, null)
  assert.equal(result.record, over)
})

test('nextGame 只在 gameOver 时生效', () => {
  const next = nextGame(rec(21, R(21), 0))
  assert.equal(next.acked, 1)
  assert.equal(deriveMatch(next).phase, 'playing')
  const playing = rec(21, 'RB', 0)
  assert.equal(nextGame(playing), playing)
})

test('结束比赛的那一分：event 为 match', () => {
  const { events } = play(rec(21, R(21) + R(20), 1), 'R')
  assert.deepEqual(events, ['match'])
})

test('21 分制决胜局首次到 11 分：event 为 swapEnds', () => {
  const base = rec(21, R(21) + B(21), 2)
  const { record, events } = play(base, R(11))
  assert.deepEqual(events, [...Array(10).fill('point'), 'swapEnds'])
  assert.deepEqual(play(record, 'B').events, ['point'])
})

test('11:10 时另一方追到 11 不再提醒换边', () => {
  const base = rec(21, R(21) + B(21), 2)
  const { events } = play(base, 'RB'.repeat(10) + 'RB')
  assert.equal(events[20], 'swapEnds')
  assert.equal(events[21], 'point')
})

test('15 分制决胜局首次到 8 分：event 为 swapEnds', () => {
  const base = rec(15, R(15) + B(15), 2)
  const { events } = play(base, R(8))
  assert.equal(events[7], 'swapEnds')
})

test('前两局到 11 分不提醒换边', () => {
  assert.equal(play(newMatch(21), R(11)).events.includes('swapEnds'), false)
})

test('撤销最近一分；空记录撤销无效', () => {
  assert.equal(undo(rec(21, 'RRB', 0)).pts, 'RR')
  const empty = newMatch(21)
  assert.equal(undo(empty), empty)
})

test('撤回结束一局的那一分：回到该局比赛中', () => {
  const back = undo(rec(21, R(21), 0))
  assert.deepEqual(back, rec(21, R(20), 0))
  assert.equal(deriveMatch(back).phase, 'playing')
})

test('新一局 0:0 时撤销：回到上一局结束前', () => {
  const back = undo(rec(21, R(21), 1))
  assert.deepEqual(back, rec(21, R(20), 0))
  assert.deepEqual(deriveMatch(back).current, { index: 0, red: 20, blue: 0 })
})

test('撤回结束比赛的那一分', () => {
  const back = undo(rec(21, R(21) + R(21), 1))
  const s = deriveMatch(back)
  assert.equal(s.phase, 'playing')
  assert.deepEqual(s.current, { index: 1, red: 20, blue: 0 })
})

test('本局清零：进行中的局回到 0:0，保留之前的局', () => {
  const reset = resetGame(rec(21, R(21) + 'RRB', 1))
  assert.deepEqual(reset, rec(21, R(21), 1))
  assert.deepEqual(deriveMatch(reset).current, { index: 1, red: 0, blue: 0 })
  assert.deepEqual(resetGame(rec(21, 'RRB', 0)), rec(21, '', 0))
})

test('本局清零：gameOver 时刚结束的局回到 0:0', () => {
  const reset = resetGame(rec(21, R(21) + B(21), 1))
  assert.deepEqual(reset, rec(21, R(21), 1))
  assert.equal(deriveMatch(reset).phase, 'playing')
})

test('本局清零：matchOver 时决胜局回到 0:0', () => {
  const reset = resetGame(rec(21, R(21) + B(21) + R(21), 2))
  assert.deepEqual(reset, rec(21, R(21) + B(21), 2))
  assert.deepEqual(deriveMatch(reset).current, { index: 2, red: 0, blue: 0 })
})

test('切换赛制：未开赛立即生效，开赛后不变', () => {
  assert.equal(setRule(newMatch(21), 15).rule, 15)
  const started = rec(21, 'R', 0)
  assert.equal(setRule(started, 15), started)
  const empty = newMatch(21)
  assert.equal(setRule(empty, 11), empty)
})

test('normalize 接受合法记录', () => {
  const good = rec(21, R(21) + 'RB', 1)
  assert.deepEqual(normalize(good), good)
})

test('normalize 拒绝坏数据', () => {
  const bad = [
    null,
    'x',
    { v: 2, rule: 21, pts: '', acked: 0 },
    { v: 1, rule: '21', pts: '', acked: 0 },
    { v: 1, rule: 11, pts: '', acked: 0 },
    { v: 1, rule: 21, pts: 'RXB', acked: 0 },
    { v: 1, rule: 21, pts: 'RB'.repeat(101), acked: 0 },
    { v: 1, rule: 21, pts: '', acked: -1 },
    { v: 1, rule: 21, pts: '', acked: 1.5 },
    { v: 1, rule: 21, pts: 'R', acked: 1 },
    { v: 1, rule: 21, pts: R(21) + R(21) + 'B', acked: 1 },
  ]
  for (const raw of bad) assert.equal(normalize(raw), null, JSON.stringify(raw))
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test
```

Expected: rules 的 15 个测试通过；match.test.mjs 因找不到 `src/common/match.js` 而 FAIL。

- [ ] **Step 3: 实现 match.js**

`src/common/match.js`：

```js
// 比赛记录的操作：纯函数，输入旧记录、返回新记录，不修改入参。
// 记录格式：{ v: 1, rule: 21 | 15, pts: 'RB…', acked: 已点过「下一局」的局数 }
import { RED, BLUE, RULES, isRule, isGameWon, deriveMatch } from './rules.js'

export const RECORD_VERSION = 1
const MAX_PTS = 200
const DECIDER_INDEX = 2 // 决胜局（第 3 局）的下标

function make(rule, pts, acked) {
  return { v: RECORD_VERSION, rule: rule, pts: pts, acked: acked }
}

export function newMatch(rule) {
  return make(rule, '', 0)
}

// 返回 { record, event }；event 为 'match' | 'game' | 'swapEnds' | 'point'，无效操作时为 null
export function addPoint(record, side) {
  const before = deriveMatch(record)
  if (before.phase !== 'playing' || (side !== RED && side !== BLUE)) {
    return { record: record, event: null }
  }
  const next = make(record.rule, record.pts + side, record.acked)
  const after = deriveMatch(next)
  let event = 'point'
  if (after.phase === 'matchOver') event = 'match'
  else if (after.completed > before.completed) event = 'game'
  else if (after.current.index === DECIDER_INDEX && reachedSwap(before.current, after.current, record.rule)) {
    event = 'swapEnds'
  }
  return { record: next, event: event }
}

// 决胜局里领先方的得分首次到达换边分
function reachedSwap(before, after, rule) {
  const swapAt = RULES[rule].swapAt
  return Math.max(before.red, before.blue) < swapAt && Math.max(after.red, after.blue) === swapAt
}

export function undo(record) {
  if (!record.pts) return record
  const pts = record.pts.slice(0, -1)
  const completed = deriveMatch(make(record.rule, pts, 0)).completed
  return make(record.rule, pts, Math.min(record.acked, completed))
}

export function nextGame(record) {
  const s = deriveMatch(record)
  if (s.phase !== 'gameOver') return record
  return make(record.rule, record.pts, s.completed)
}

// 只保留前 acked 局的得分：进行中的局，或刚结束、还没点「下一局」的局回到 0:0
export function resetGame(record) {
  const keep = lengthOfGames(record, record.acked)
  return make(record.rule, record.pts.slice(0, keep), record.acked)
}

// 前 n 个已结束的局在 pts 中占的长度
function lengthOfGames(record, n) {
  if (n === 0) return 0
  let red = 0
  let blue = 0
  let done = 0
  for (let i = 0; i < record.pts.length; i++) {
    const side = record.pts[i]
    if (side === RED) red++
    else blue++
    const own = side === RED ? red : blue
    const other = side === RED ? blue : red
    if (isGameWon(own, other, record.rule)) {
      done++
      if (done === n) return i + 1
      red = 0
      blue = 0
    }
  }
  return record.pts.length
}

// 只有还没开赛时才改本场赛制；否则原样返回，由设置在下一场生效
export function setRule(record, rule) {
  if (!isRule(rule) || record.pts) return record
  return newMatch(rule)
}

// 校验从存储读出的数据，不合法时返回 null
export function normalize(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (raw.v !== RECORD_VERSION || !isRule(raw.rule)) return null
  if (typeof raw.pts !== 'string' || raw.pts.length > MAX_PTS || !/^[RB]*$/.test(raw.pts)) return null
  if (!Number.isInteger(raw.acked) || raw.acked < 0) return null
  const record = make(raw.rule, raw.pts, raw.acked)
  const s = deriveMatch(record)
  if (!s.valid || raw.acked > s.completed) return null
  return record
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test
```

Expected: `# pass 36`（rules 15 个，match 21 个），`# fail 0`。

- [ ] **Step 5: Commit**

```bash
git add src/common/match.js test/match.test.mjs
git commit -m "feat: 比赛记录操作：得分、撤销、下一局、本局清零、切换赛制与校验" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: 存储模块 store.js（TDD）

**Files:**
- Create: `test/store.test.mjs`
- Create: `src/common/store.js`

- [ ] **Step 1: 写失败的测试**

`test/store.test.mjs`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createStore, DEFAULT_SETTINGS } from '../src/common/store.js'

// 模拟 @system.storage：同步回调，数据存在 data 里
function fakeStorage(initial) {
  const data = Object.assign({}, initial)
  return {
    data,
    get(opts) {
      opts.success(opts.key in data ? data[opts.key] : '')
    },
    set(opts) {
      data[opts.key] = opts.value
      opts.success()
    },
  }
}

const record = { v: 1, rule: 21, pts: 'RRB', acked: 0 }

test('没有存储的比赛：返回 null，不算错误', async () => {
  const store = createStore(fakeStorage())
  assert.equal(await store.loadMatch(), null)
  assert.equal(store.lastError(), '')
})

test('保存后能读回比赛记录，存的是 JSON 字符串', async () => {
  const storage = fakeStorage()
  const store = createStore(storage)
  assert.equal(await store.saveMatch(record), true)
  assert.equal(typeof storage.data['bs.match'], 'string')
  assert.deepEqual(await store.loadMatch(), record)
})

test('success 回调给的是 { value } 对象时也能读', async () => {
  const storage = {
    get(opts) {
      opts.success({ value: JSON.stringify(record) })
    },
  }
  assert.deepEqual(await createStore(storage).loadMatch(), record)
})

test('损坏或不合法的比赛记录：返回 null', async () => {
  assert.equal(await createStore(fakeStorage({ 'bs.match': '{oops' })).loadMatch(), null)
  const v2 = JSON.stringify({ v: 2, rule: 21, pts: '', acked: 0 })
  assert.equal(await createStore(fakeStorage({ 'bs.match': v2 })).loadMatch(), null)
})

test('读取失败：返回 null，错误码 S1', async () => {
  const failing = createStore({ get: (opts) => opts.fail() })
  assert.equal(await failing.loadMatch(), null)
  assert.equal(failing.lastError(), 'S1')
  const throwing = createStore({
    get() {
      throw new Error('boom')
    },
  })
  assert.equal(await throwing.loadMatch(), null)
  assert.equal(throwing.lastError(), 'S1')
})

test('读取一直没有回调：超时后返回 null，错误码 S1', async () => {
  const store = createStore({ get() {} }, 10)
  assert.equal(await store.loadMatch(), null)
  assert.equal(store.lastError(), 'S1')
})

test('写入失败：返回 false，错误码 S2', async () => {
  const store = createStore({ set: (opts) => opts.fail() })
  assert.equal(await store.saveMatch(record), false)
  assert.equal(store.lastError(), 'S2')
})

test('没有设置：返回默认设置', async () => {
  const settings = await createStore(fakeStorage()).loadSettings()
  assert.deepEqual(settings, { v: 1, rule: 21, vibrate: true, keepOn: true })
  assert.deepEqual(DEFAULT_SETTINGS, { v: 1, rule: 21, vibrate: true, keepOn: true })
})

test('设置中不合法的字段用默认值补上', async () => {
  const raw = JSON.stringify({ v: 1, rule: 15, vibrate: 'yes', keepOn: false })
  const settings = await createStore(fakeStorage({ 'bs.settings': raw })).loadSettings()
  assert.deepEqual(settings, { v: 1, rule: 15, vibrate: true, keepOn: false })
})

test('设置能保存并读回', async () => {
  const store = createStore(fakeStorage())
  const settings = { v: 1, rule: 15, vibrate: false, keepOn: true }
  assert.equal(await store.saveSettings(settings), true)
  assert.deepEqual(await store.loadSettings(), settings)
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test
```

Expected: store.test.mjs 因找不到 `src/common/store.js` 而 FAIL，其余测试通过。

- [ ] **Step 3: 实现 store.js**

`src/common/store.js`：

```js
// 读写比赛记录与设置。系统存储模块从参数传入（页面里传 @system.storage），便于在 Node 中测试。
// 读写都返回 Promise，失败不抛错：读失败返回 null 或默认设置，写失败返回 false，并记下错误码。
import { normalize } from './match.js'
import { isRule } from './rules.js'

const MATCH_KEY = 'bs.match'
const SETTINGS_KEY = 'bs.settings'

export const DEFAULT_SETTINGS = { v: 1, rule: 21, vibrate: true, keepOn: true }

export function normalizeSettings(raw) {
  const d = DEFAULT_SETTINGS
  const ok = raw && typeof raw === 'object' && raw.v === 1
  return {
    v: 1,
    rule: ok && isRule(raw.rule) ? raw.rule : d.rule,
    vibrate: ok && typeof raw.vibrate === 'boolean' ? raw.vibrate : d.vibrate,
    keepOn: ok && typeof raw.keepOn === 'boolean' ? raw.keepOn : d.keepOn,
  }
}

// storage.get 的 success 可能直接给字符串，也可能给 { value: 字符串 }
function parseStored(d) {
  if (typeof d === 'string') {
    if (!d) return null
    try {
      return JSON.parse(d)
    } catch (e) {
      return null
    }
  }
  if (d && typeof d === 'object' && typeof d.value === 'string') return parseStored(d.value)
  return null
}

export function createStore(storage, timeoutMs = 1500) {
  let lastError = ''

  // 统一处理：只结算一次、超时兜底、记录错误码
  function call(method, opts, onSuccess, failValue, errorCode) {
    return new Promise((resolve) => {
      let done = false
      const finish = (value, error) => {
        if (done) return
        done = true
        clearTimeout(timer)
        if (error) lastError = error
        resolve(value)
      }
      const timer = setTimeout(() => finish(failValue, errorCode), timeoutMs)
      try {
        storage[method](
          Object.assign({}, opts, {
            success: (d) => finish(onSuccess(d)),
            fail: () => finish(failValue, errorCode),
          })
        )
      } catch (e) {
        finish(failValue, errorCode)
      }
    })
  }

  function read(key) {
    return call('get', { key: key, default: '' }, parseStored, null, 'S1')
  }

  function write(key, value) {
    return call('set', { key: key, value: JSON.stringify(value) }, () => true, false, 'S2')
  }

  return {
    loadMatch: () => read(MATCH_KEY).then(normalize),
    saveMatch: (record) => write(MATCH_KEY, record),
    loadSettings: () => read(SETTINGS_KEY).then(normalizeSettings),
    saveSettings: (settings) => write(SETTINGS_KEY, settings),
    lastError: () => lastError,
  }
}
```

说明：`finish` 可能在 `storage.get` 内部同步调用。此时 `timer` 已经赋值（`setTimeout` 在调用之前执行），所以 `clearTimeout(timer)` 是安全的。

- [ ] **Step 4: 运行测试，确认通过**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test
```

Expected: `# pass 46`（加上 store 的 10 个），`# fail 0`，整体用时在 1 秒以内。如果用时接近 1.5 秒，说明有计时器没被清掉。

- [ ] **Step 5: Commit**

```bash
git add src/common/store.js test/store.test.mjs
git commit -m "feat: 存储模块，读写比赛记录与设置，带超时、校验和错误码" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: 设备模块 device.js（TDD）

**Files:**
- Create: `test/device.test.mjs`
- Create: `src/common/device.js`

- [ ] **Step 1: 写失败的测试**

`test/device.test.mjs`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createDevice } from '../src/common/device.js'

// 假的振动、亮度模块和计时器：计时器立即执行，并记下延迟
function setup(overrides) {
  const calls = []
  const delays = []
  const vibrator = { vibrate: (opts) => calls.push('vibrate:' + opts.mode) }
  const brightness = { setKeepScreenOn: (opts) => calls.push('keep:' + opts.keepScreenOn) }
  const timer = (fn, ms) => {
    delays.push(ms)
    fn()
  }
  const o = overrides || {}
  const device = createDevice(o.vibrator || vibrator, o.brightness || brightness, timer)
  return { calls, delays, device }
}

test('得分、撤销：短震一次', () => {
  for (const event of ['point', 'undo']) {
    const { calls, delays, device } = setup()
    device.buzz(event, true)
    assert.deepEqual(calls, ['vibrate:short'])
    assert.deepEqual(delays, [])
  }
})

test('一局结束：长震一次', () => {
  const { calls, device } = setup()
  device.buzz('game', true)
  assert.deepEqual(calls, ['vibrate:long'])
})

test('比赛结束：长震两次，间隔 800ms', () => {
  const { calls, delays, device } = setup()
  device.buzz('match', true)
  assert.deepEqual(calls, ['vibrate:long', 'vibrate:long'])
  assert.deepEqual(delays, [800])
})

test('决胜局换边：短震两次，间隔 300ms', () => {
  const { calls, delays, device } = setup()
  device.buzz('swapEnds', true)
  assert.deepEqual(calls, ['vibrate:short', 'vibrate:short'])
  assert.deepEqual(delays, [300])
})

test('振动关闭或未知事件：不震', () => {
  const { calls, device } = setup()
  device.buzz('point', false)
  device.buzz('nope', true)
  device.buzz(null, true)
  assert.deepEqual(calls, [])
})

test('屏幕常亮开关', () => {
  const { calls, device } = setup()
  device.keepScreenOn(true)
  device.keepScreenOn(false)
  assert.deepEqual(calls, ['keep:true', 'keep:false'])
})

test('振动接口出错：不抛错，错误码 V', () => {
  const vibrator = {
    vibrate() {
      throw new Error('boom')
    },
  }
  const { device } = setup({ vibrator })
  device.buzz('point', true)
  assert.equal(device.lastError(), 'V')
})

test('常亮接口失败回调：错误码 K', () => {
  const brightness = { setKeepScreenOn: (opts) => opts.fail() }
  const { device } = setup({ brightness })
  device.keepScreenOn(true)
  assert.equal(device.lastError(), 'K')
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test
```

Expected: device.test.mjs 因找不到 `src/common/device.js` 而 FAIL，其余测试通过。

- [ ] **Step 3: 实现 device.js**

`src/common/device.js`：

```js
// 振动与屏幕常亮。系统模块从参数传入（页面里传 @system.vibrator、@system.brightness），便于在 Node 中测试。
// 手环10 只支持 short / long 两档振动，用「次数 + 长短」区分事件；接口出错时不影响计分，只记错误码。

// 每个事件的振动序列：[档位, 距开始的毫秒数]
export const PATTERNS = {
  point: [['short', 0]],
  undo: [['short', 0]],
  game: [['long', 0]],
  match: [['long', 0], ['long', 800]],
  swapEnds: [['short', 0], ['short', 300]],
}

// timer 只供测试注入；默认包一层箭头函数，避免脱离全局对象调用 setTimeout 在某些引擎上报错
export function createDevice(vibrator, brightness, timer) {
  const schedule = timer || ((fn, ms) => setTimeout(fn, ms))
  let lastError = ''

  function vibrate(mode) {
    try {
      vibrator.vibrate({
        mode: mode,
        fail: () => {
          lastError = 'V'
        },
      })
    } catch (e) {
      lastError = 'V'
    }
  }

  return {
    buzz(event, enabled) {
      const steps = PATTERNS[event]
      if (!enabled || !steps) return
      for (const [mode, delay] of steps) {
        if (delay === 0) vibrate(mode)
        else schedule(() => vibrate(mode), delay)
      }
    },

    keepScreenOn(on) {
      try {
        brightness.setKeepScreenOn({
          keepScreenOn: on,
          fail: () => {
            lastError = 'K'
          },
        })
      } catch (e) {
        lastError = 'K'
      }
    },

    lastError: () => lastError,
  }
}
```

注意：`PATTERNS[null]` 与 `PATTERNS['nope']` 都是 `undefined`，所以未知事件不会振动。

- [ ] **Step 4: 运行测试，确认通过**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test
```

Expected: `# pass 54`（加上 device 的 8 个），`# fail 0`。

- [ ] **Step 5: Commit**

```bash
git add src/common/device.js test/device.test.mjs
git commit -m "feat: 设备模块，振动模式与屏幕常亮" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: 计分页 score.ux

**Files:**
- Modify（整体替换）: `src/pages/score/score.ux`

页面不在 Node 里测试，逻辑都在已测试的模块里。这一步的验证方式是构建通过，以及 Task 10 的模拟器检查。

- [ ] **Step 1: 用下面的完整内容替换 `src/pages/score/score.ux`**

```html
<template>
  <div class="page">
    <!-- 顶栏：与卡片平级，点它不会给任何一方加分 -->
    <div class="top">
      <div class="info" if="{{ !banner }}">
        <text class="info-line">{{ topLine }}</text>
        <div class="games">
          <text class="games-num text-red">{{ gamesRed }}</text>
          <text class="games-sep">:</text>
          <text class="games-num text-blue">{{ gamesBlue }}</text>
        </div>
      </div>
      <div class="info" if="{{ banner }}">
        <text class="{{ bannerCls }}">{{ banner }}</text>
      </div>
      <div class="more" onclick="openMore">
        <div class="more-dot"></div>
        <div class="more-dot more-dot-gap"></div>
        <div class="more-dot more-dot-gap"></div>
      </div>
    </div>

    <!-- 比赛中：红蓝两张卡片，整张卡片都是点击区域 -->
    <div class="cards" if="{{ phase === 'playing' }}">
      <div class="{{ redCls }}" ontouchstart="pressRed" ontouchend="releaseCards" onclick="tapRed">
        <div class="serve">
          <div class="serve-dot serve-dot-red" if="{{ serveRed }}"></div>
          <text class="serve-text serve-text-red">{{ serveRed }}</text>
        </div>
        <text class="score text-red">{{ red }}</text>
      </div>
      <div class="{{ blueCls }}" ontouchstart="pressBlue" ontouchend="releaseCards" onclick="tapBlue">
        <div class="serve">
          <div class="serve-dot serve-dot-blue" if="{{ serveBlue }}"></div>
          <text class="serve-text serve-text-blue">{{ serveBlue }}</text>
        </div>
        <text class="score text-blue">{{ blue }}</text>
      </div>
    </div>

    <!-- 一局结束 / 比赛结束：替换卡片区域，防止误触计分 -->
    <div class="over" if="{{ phase !== 'playing' }}">
      <text class="{{ overTitleCls }}">{{ overTitle }}</text>
      <div class="over-score">
        <text class="over-num text-red">{{ overRed }}</text>
        <text class="over-sep">:</text>
        <text class="over-num text-blue">{{ overBlue }}</text>
      </div>
      <text class="over-note">{{ overNote }}</text>
      <div class="over-btn" onclick="overAction">
        <text class="over-btn-text">{{ overBtn }}</text>
      </div>
    </div>

    <div class="undo" onclick="tapUndo">
      <text class="{{ undoCls }}">撤销</text>
    </div>
  </div>
</template>

<script>
import router from '@system.router'
import storage from '@system.storage'
import vibrator from '@system.vibrator'
import brightness from '@system.brightness'
import { RED, BLUE, deriveMatch } from '../../common/rules.js'
import { newMatch, addPoint, undo, nextGame } from '../../common/match.js'
import { createStore } from '../../common/store.js'
import { createDevice } from '../../common/device.js'

const RED_CARD = 'card card-red'
const BLUE_CARD = 'card card-blue card-gap'
const COURT_TEXT = { right: '右区发球', left: '左区发球' }
const SIDE_NAME = { R: '红方', B: '蓝方' }
const TAP_GUARD_MS = 250 // 防止真机一次点击触发两次
const EXIT_WINDOW_MS = 2000 // 两次右滑之间的间隔上限
const SWAP_BANNER_MS = 3000

export default {
  private: {
    phase: 'playing',
    topLine: '',
    banner: '',
    bannerCls: 'banner',
    gamesRed: '0',
    gamesBlue: '0',
    red: '0',
    blue: '0',
    redCls: RED_CARD,
    blueCls: BLUE_CARD,
    serveRed: '',
    serveBlue: '',
    undoCls: 'undo-text undo-off',
    overTitle: '',
    overTitleCls: 'over-title text-red',
    overRed: '0',
    overBlue: '0',
    overNote: '',
    overBtn: '',
  },

  // 不参与渲染的内部状态
  record: null,
  settings: null,
  store: null,
  device: null,
  loaded: false,
  tapAt: 0,
  backAt: 0,
  bannerTimer: 0,

  onInit() {
    this.store = createStore(storage)
    this.device = createDevice(vibrator, brightness)
  },

  // 首次显示和从更多页返回时都会触发：重新读取，更多页可能改过记录或设置
  onShow() {
    this.load()
  },

  onHide() {
    this.device.keepScreenOn(false)
  },

  onDestroy() {
    clearTimeout(this.bannerTimer)
    this.device.keepScreenOn(false)
  },

  // 第一次右滑只提示，2 秒内再滑一次才交给系统退出
  onBackPress() {
    const now = Date.now()
    if (now - this.backAt < EXIT_WINDOW_MS) return false
    this.backAt = now
    this.showBanner('再滑一次退出', 'banner', EXIT_WINDOW_MS)
    return true
  },

  load() {
    Promise.all([this.store.loadSettings(), this.store.loadMatch()]).then(([settings, record]) => {
      this.settings = settings
      this.record = record || newMatch(settings.rule)
      this.loaded = true
      this.render()
      this.device.keepScreenOn(settings.keepOn)
    })
  },

  render() {
    const s = deriveMatch(this.record)
    this.phase = s.phase
    this.topLine = '第' + (s.current.index + 1) + '局 · ' + this.record.rule + '分'
    this.gamesRed = String(s.gamesWon.red)
    this.gamesBlue = String(s.gamesWon.blue)
    this.red = String(s.current.red)
    this.blue = String(s.current.blue)
    const serve = s.server ? COURT_TEXT[s.court] : ''
    this.serveRed = s.server === RED ? serve : ''
    this.serveBlue = s.server === BLUE ? serve : ''
    this.undoCls = this.record.pts ? 'undo-text' : 'undo-text undo-off'

    if (s.phase === 'gameOver') {
      const g = s.games[s.completed - 1]
      this.overTitle = SIDE_NAME[g.winner] + '胜第' + s.completed + '局'
      this.overTitleCls = g.winner === RED ? 'over-title text-red' : 'over-title text-blue'
      this.overRed = String(g.red)
      this.overBlue = String(g.blue)
      this.overNote = '交换场地后开始下一局'
      this.overBtn = '下一局'
    } else if (s.phase === 'matchOver') {
      this.overTitle = SIDE_NAME[s.matchWinner] + '获胜'
      this.overTitleCls = s.matchWinner === RED ? 'over-title text-red' : 'over-title text-blue'
      this.overRed = String(s.gamesWon.red)
      this.overBlue = String(s.gamesWon.blue)
      this.overNote = s.games.map((g) => g.red + ':' + g.blue).join('  ')
      this.overBtn = '新比赛'
    }
  },

  pressRed() {
    this.redCls = RED_CARD + ' card-red-on'
  },

  pressBlue() {
    this.blueCls = BLUE_CARD + ' card-blue-on'
  },

  // 真机上 touchend 偶尔丢失，所以 click 里也恢复一次
  releaseCards() {
    this.redCls = RED_CARD
    this.blueCls = BLUE_CARD
  },

  tapRed() {
    this.releaseCards()
    this.score(RED)
  },

  tapBlue() {
    this.releaseCards()
    this.score(BLUE)
  },

  score(side) {
    if (!this.loaded) return
    const now = Date.now()
    if (now - this.tapAt < TAP_GUARD_MS) return
    this.tapAt = now
    const result = addPoint(this.record, side)
    if (!result.event) return
    this.commit(result.record, result.event)
    if (result.event === 'swapEnds') this.showBanner('换边', 'banner banner-swap', SWAP_BANNER_MS)
  },

  tapUndo() {
    if (!this.loaded || !this.record.pts) return
    this.commit(undo(this.record), 'undo')
  },

  // 提示层按钮：一局结束时进入下一局，比赛结束时开新比赛（新比赛按当前设置的赛制）
  overAction() {
    if (!this.loaded) return
    if (this.phase === 'gameOver') this.commit(nextGame(this.record), null)
    else if (this.phase === 'matchOver') this.commit(newMatch(this.settings.rule), null)
  },

  // 改记录 → 推算并刷新 → 存盘 → 振动
  commit(record, event) {
    this.record = record
    this.render()
    this.store.saveMatch(record)
    if (event) this.device.buzz(event, this.settings.vibrate)
  },

  showBanner(text, cls, ms) {
    clearTimeout(this.bannerTimer)
    this.banner = text
    this.bannerCls = cls
    this.bannerTimer = setTimeout(() => {
      this.banner = ''
    }, ms)
  },

  // 两页各自打包，不能共享模块变量，错误码通过路由参数带过去
  openMore() {
    router.push({
      uri: '/pages/more',
      params: { err: this.store.lastError() || this.device.lastError() },
    })
  },
}
</script>

<style>
.page {
  width: 212px;
  height: 520px;
  flex-direction: column;
  align-items: center;
  padding-top: 18px;
  padding-bottom: 22px;
  background-color: #000000;
}

/* 126px 宽、居中：左缘约 43、右缘约 169，避开胶囊顶端的圆弧 */
.top {
  width: 126px;
  height: 64px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.info {
  flex-direction: column;
  justify-content: center;
}

.info-line {
  font-size: 14px;
  color: #8a8a8a;
}

.games {
  flex-direction: row;
  align-items: center;
}

.games-num {
  font-size: 20px;
  font-weight: bold;
}

.games-sep {
  margin-left: 4px;
  margin-right: 4px;
  font-size: 20px;
  color: #8a8a8a;
}

.banner {
  font-size: 16px;
  color: #eeeeee;
}

.banner-swap {
  font-size: 20px;
  font-weight: bold;
  color: #ffd27a;
}

.more {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #262626;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.more-dot {
  width: 5px;
  height: 5px;
  border-radius: 3px;
  background-color: #dddddd;
}

.more-dot-gap {
  margin-left: 4px;
}

.cards {
  width: 188px;
  flex-grow: 1;
  flex-direction: column;
}

.card {
  flex-grow: 1;
  border-radius: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.card-red {
  background-color: #3a1215;
}

.card-red-on {
  background-color: #4a181c;
}

.card-blue {
  background-color: #0e1d3a;
}

.card-blue-on {
  background-color: #14284d;
}

.card-gap {
  margin-top: 8px;
}

/* 发球行固定高度：有没有发球提示，比分位置都不跳 */
.serve {
  height: 22px;
  flex-direction: row;
  align-items: center;
}

.serve-dot {
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 4px;
}

.serve-dot-red {
  background-color: #ff5c61;
}

.serve-dot-blue {
  background-color: #4f8fff;
}

.serve-text {
  font-size: 14px;
}

.serve-text-red {
  color: #ff9a9d;
}

.serve-text-blue {
  color: #9dbeff;
}

/* 行高不低于字号的约 1.15 倍，数字才不会被裁切（miSmash 在手环10 上实测） */
.score {
  width: 168px;
  height: 110px;
  line-height: 110px;
  font-size: 96px;
  font-weight: bold;
  text-align: center;
}

.text-red {
  color: #ff5c61;
}

.text-blue {
  color: #4f8fff;
}

.over {
  width: 188px;
  flex-grow: 1;
  border-radius: 20px;
  background-color: #141414;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.over-title {
  font-size: 18px;
  text-align: center;
}

.over-score {
  margin-top: 6px;
  flex-direction: row;
  align-items: center;
}

.over-num {
  height: 58px;
  line-height: 58px;
  font-size: 48px;
  font-weight: bold;
}

.over-sep {
  margin-left: 8px;
  margin-right: 8px;
  font-size: 40px;
  color: #777777;
}

.over-note {
  width: 168px;
  margin-top: 6px;
  font-size: 13px;
  color: #8a8a8a;
  text-align: center;
}

.over-btn {
  width: 140px;
  height: 48px;
  margin-top: 16px;
  border-radius: 24px;
  background-color: #eeeeee;
  justify-content: center;
  align-items: center;
}

.over-btn-text {
  font-size: 18px;
  color: #111111;
}

.undo {
  width: 112px;
  height: 44px;
  margin-top: 10px;
  border-radius: 22px;
  background-color: #1f1f1f;
  justify-content: center;
  align-items: center;
}

.undo-text {
  font-size: 16px;
  color: #d8d8d8;
}

.undo-off {
  color: #555555;
}
</style>
```

- [ ] **Step 2: 构建，确认编译通过**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm run build && npm test
```

Expected: 构建成功、生成 rpk；单元测试仍是 `# pass 54`。如果构建报 `missing feature`，把提示的模块加进 manifest。

- [ ] **Step 3: Commit**

```bash
git add src/pages/score/score.ux
git commit -m "feat: 计分页：红蓝卡片计分、撤销、发球提示与局/比赛结束提示层" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: 更多页 more.ux

**Files:**
- Modify（整体替换）: `src/pages/more/more.ux`

- [ ] **Step 1: 用下面的完整内容替换 `src/pages/more/more.ux`**

```html
<template>
  <div class="page">
    <text class="title">更多</text>

    <text class="label">计分规则</text>
    <div class="segs">
      <div class="{{ rule21Cls }}" onclick="pickRule(21)">
        <text class="{{ rule21TextCls }}">21 分</text>
      </div>
      <div class="{{ rule15Cls }}" onclick="pickRule(15)">
        <text class="{{ rule15TextCls }}">15 分</text>
      </div>
    </div>
    <text class="hint">{{ ruleHint }}</text>

    <div class="row" onclick="toggleVibrate">
      <text class="row-text">振动反馈</text>
      <div class="{{ vibrateCls }}">
        <div class="knob"></div>
      </div>
    </div>
    <div class="row" onclick="toggleKeepOn">
      <text class="row-text">屏幕常亮</text>
      <div class="{{ keepOnCls }}">
        <div class="knob"></div>
      </div>
    </div>

    <div class="{{ resetCls }}" onclick="tapReset">
      <text class="{{ resetTextCls }}">{{ resetText }}</text>
    </div>
    <div class="{{ newCls }}" onclick="tapNew">
      <text class="{{ newTextCls }}">{{ newText }}</text>
    </div>
    <div class="btn" onclick="goBack">
      <text class="btn-text">返回计分</text>
    </div>

    <text class="version">{{ versionText }}</text>
  </div>
</template>

<script>
import router from '@system.router'
import storage from '@system.storage'
import app from '@system.app'
import { isRule } from '../../common/rules.js'
import { newMatch, resetGame, setRule } from '../../common/match.js'
import { createStore } from '../../common/store.js'

const CONFIRM_MS = 3000 // 二次确认的等待时间

function withSetting(settings, key, value) {
  const next = { v: settings.v, rule: settings.rule, vibrate: settings.vibrate, keepOn: settings.keepOn }
  next[key] = value
  return next
}

export default {
  // 计分页通过路由参数传来的错误码（参数到达时都是字符串）
  protected: {
    err: '',
  },

  private: {
    rule21Cls: 'seg seg-on',
    rule21TextCls: 'seg-text seg-text-on',
    rule15Cls: 'seg',
    rule15TextCls: 'seg-text',
    ruleHint: '',
    vibrateCls: 'switch switch-on',
    keepOnCls: 'switch switch-on',
    resetCls: 'btn',
    resetTextCls: 'btn-text',
    resetText: '本局清零',
    newCls: 'btn',
    newTextCls: 'btn-text',
    newText: '新比赛',
    versionText: '',
  },

  // 不参与渲染的内部状态
  store: null,
  settings: null,
  record: null,
  loaded: false,
  armed: '', // 等待二次确认的按钮：'' | 'reset' | 'new'
  armTimer: 0,
  version: '',

  onInit() {
    this.store = createStore(storage)
    try {
      this.version = 'v' + app.getInfo().versionName
    } catch (e) {
      this.version = ''
    }
    Promise.all([this.store.loadSettings(), this.store.loadMatch()]).then(([settings, record]) => {
      this.settings = settings
      this.record = record || newMatch(settings.rule)
      this.loaded = true
      this.render()
    })
  },

  onDestroy() {
    clearTimeout(this.armTimer)
  },

  render() {
    const on21 = this.settings.rule === 21
    this.rule21Cls = on21 ? 'seg seg-on' : 'seg'
    this.rule21TextCls = on21 ? 'seg-text seg-text-on' : 'seg-text'
    this.rule15Cls = on21 ? 'seg' : 'seg seg-on'
    this.rule15TextCls = on21 ? 'seg-text' : 'seg-text seg-text-on'
    this.ruleHint = this.settings.rule !== this.record.rule ? '新比赛生效' : ''
    this.vibrateCls = this.settings.vibrate ? 'switch switch-on' : 'switch'
    this.keepOnCls = this.settings.keepOn ? 'switch switch-on' : 'switch'
    const resetArmed = this.armed === 'reset'
    this.resetCls = resetArmed ? 'btn btn-armed' : 'btn'
    this.resetTextCls = resetArmed ? 'btn-text btn-text-armed' : 'btn-text'
    this.resetText = resetArmed ? '再点一次确认' : '本局清零'
    const newArmed = this.armed === 'new'
    this.newCls = newArmed ? 'btn btn-armed' : 'btn'
    this.newTextCls = newArmed ? 'btn-text btn-text-armed' : 'btn-text'
    this.newText = newArmed ? '再点一次确认' : '新比赛'
    const code = this.err || this.store.lastError()
    this.versionText = code ? this.version + ' · ' + code : this.version
  },

  // 设置总是保存；本场比赛还没开始时，同时改本场的赛制
  pickRule(rule) {
    rule = Number(rule)
    if (!this.loaded || !isRule(rule) || rule === this.settings.rule) return
    this.settings = withSetting(this.settings, 'rule', rule)
    this.store.saveSettings(this.settings)
    const record = setRule(this.record, rule)
    if (record !== this.record) {
      this.record = record
      this.store.saveMatch(record)
    }
    this.render()
  },

  toggleVibrate() {
    if (!this.loaded) return
    this.settings = withSetting(this.settings, 'vibrate', !this.settings.vibrate)
    this.store.saveSettings(this.settings)
    this.render()
  },

  toggleKeepOn() {
    if (!this.loaded) return
    this.settings = withSetting(this.settings, 'keepOn', !this.settings.keepOn)
    this.store.saveSettings(this.settings)
    this.render()
  },

  tapReset() {
    this.confirm('reset')
  },

  tapNew() {
    this.confirm('new')
  },

  // 第一次点击进入待确认状态，3 秒内再点才执行；执行后存盘并回到计分页
  confirm(kind) {
    if (!this.loaded) return
    clearTimeout(this.armTimer)
    if (this.armed !== kind) {
      this.armed = kind
      this.armTimer = setTimeout(() => {
        this.armed = ''
        this.render()
      }, CONFIRM_MS)
      this.render()
      return
    }
    this.armed = ''
    const record = kind === 'reset' ? resetGame(this.record) : newMatch(this.settings.rule)
    this.store.saveMatch(record).then(() => router.back())
  },

  goBack() {
    router.back()
  },
}
</script>

<style>
.page {
  width: 212px;
  height: 520px;
  flex-direction: column;
  align-items: center;
  padding-top: 28px;
  padding-bottom: 20px;
  background-color: #000000;
}

.title {
  height: 28px;
  font-size: 18px;
  color: #eeeeee;
}

.label {
  width: 172px;
  margin-top: 12px;
  font-size: 13px;
  color: #8a8a8a;
}

.segs {
  width: 172px;
  height: 40px;
  margin-top: 6px;
  flex-direction: row;
  justify-content: space-between;
}

.seg {
  width: 82px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f1f1f;
  justify-content: center;
  align-items: center;
}

.seg-on {
  background-color: #eeeeee;
}

.seg-text {
  font-size: 15px;
  color: #aaaaaa;
}

.seg-text-on {
  color: #111111;
}

.hint {
  width: 172px;
  height: 18px;
  margin-top: 4px;
  font-size: 12px;
  color: #8a8a8a;
  text-align: center;
}

.row {
  width: 172px;
  height: 44px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.row-text {
  font-size: 15px;
  color: #eeeeee;
}

.switch {
  width: 44px;
  height: 24px;
  padding: 3px;
  border-radius: 12px;
  background-color: #333333;
  flex-direction: row;
  justify-content: flex-start;
}

.switch-on {
  background-color: #2f6feb;
  justify-content: flex-end;
}

.knob {
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #ffffff;
}

.btn {
  width: 172px;
  height: 44px;
  margin-top: 8px;
  border-radius: 22px;
  background-color: #1f1f1f;
  justify-content: center;
  align-items: center;
}

.btn-armed {
  background-color: #5a1d20;
}

.btn-text {
  font-size: 15px;
  color: #d8d8d8;
}

.btn-text-armed {
  color: #ffd5d6;
}

.version {
  margin-top: 10px;
  font-size: 12px;
  color: #666666;
}
</style>
```

- [ ] **Step 2: 构建，确认编译通过**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm run build && npm test
```

Expected: 构建成功；单元测试 `# pass 54`。

- [ ] **Step 3: Commit**

```bash
git add src/pages/more/more.ux
git commit -m "feat: 更多页：赛制切换、振动与常亮开关、本局清零与新比赛" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: 模拟器验证

**Files:** 无代码改动（发现问题时修改对应页面，并单独提交）。

模拟器需要首次下载约 0.7–1 GB。`createVVD` 是交互式命令，要在终端里按提示回答；agent 执行时用终端面板，或请用户在终端里操作。

- [ ] **Step 1: 初始化模拟器环境（后台运行，耗时较长）**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npx aiot initEmulatorEnv
```

Expected: 下载完成，文件位于 `~/.vela/sdk`，没有报错。

- [ ] **Step 2: 创建 212×520 的模拟器**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npx aiot createVVD
```

按提示回答：
- 名称：`Vela_Band10`
- 镜像：先选名称里不带 `miwear` 的开发镜像（带 miwear 的镜像只支持 466×466）
- need vvd skin：`n`
- 宽：`212`
- 高：`520`

Expected: 输出 `Create vvd succeed.`

- [ ] **Step 3: 启动、安装并热更新**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm start
```

Expected: 依次检查 SDK、编译、启动模拟器、安装并打开应用。

如果模拟器启动失败并提示屏幕密度问题：
1. 用 `grep -rn "hw.lcd.density" ~/.vela/vvd` 找到 `Vela_Band10` 的 `config.ini`。
2. 把 `hw.lcd.density` 改为 `320`。
3. 重新执行 `npm start`。

如果开发镜像不接受这个尺寸，删除后改用 miwear 镜像重建：`npx aiot deleteVVD`，再从 Step 2 重来。

- [ ] **Step 4: 按清单检查（两种赛制各打完一场）**

- [ ] 顶栏文字和「更多」按钮都在圆弧以内，没有被切掉
- [ ] 点红/蓝卡片各加 1 分，卡片按下时变亮；快速连点不会一下加 2 分
- [ ] 第一分之后，得分方卡片显示「右区发球」或「左区发球」，单双数正确
- [ ] 21 分制 20:20 后需要领先 2 分；打到 21:19 出现「红方胜第 1 局」提示层，卡片被挡住
- [ ] 提示层上点「撤销」回到 20:19；再赢一分后点「下一局」，进入第 2 局，上一局胜方在右区发球
- [ ] 第 3 局一方先到 11 分时，顶栏显示「换边」约 3 秒
- [ ] 一方先胜两局时显示「红方获胜」、局分和每局比分；点「新比赛」后回到 0:0
- [ ] 更多页：
  - [ ] 切到 15 分：开赛前立即生效，开赛后显示「新比赛生效」
  - [ ] 振动、常亮开关切换正常
  - [ ] 「本局清零」「新比赛」都需要点两次，执行后回到计分页并生效
  - [ ] 「返回计分」可用
- [ ] 15 分制：14:14 后需领先 2 分，20:20 时先到 21 胜，第 3 局到 8 分提示「换边」
- [ ] 退出应用再打开，比分、局分和赛制完整恢复
- [ ] 中文、数字没有缺字或被裁切（模拟器缺中文字形属已知问题，以真机为准）

- [ ] **Step 5: 修复发现的问题并提交**

每个问题单独修改、构建、复测，然后提交。示例：

```bash
git add src/pages/score/score.ux
git commit -m "fix: 调整顶栏宽度，避免文字被圆弧切掉" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: 调试包、使用说明与真机验收

**Files:**
- Create: `README.md`
- Create: `docs/real-device-checklist.md`

- [ ] **Step 1: 写 README.md**

```markdown
# 羽毛球计分（小米手环10）

装在小米手环10 上的羽毛球计分器（Xiaomi Vela JS 应用）。红蓝两方点击计分，底部撤销；自动提示发球方和发球区；三局两胜，21 分制和 15 分制可选；支持振动反馈和比赛时屏幕常亮；每得一分都存盘，退出后重新打开可以恢复。

## 开发环境

- Node 22（用 nvm 安装）。这台 Mac 的 PATH 里有旧版 npm，执行命令前先运行：
  `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`
- 安装依赖：`npm install`

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm test` | 运行规则、记录、存储、设备模块的单元测试 |
| `npm start` | 编译并在模拟器里运行，修改代码后热更新 |
| `npm run build` | 生成调试包 `dist/com.curain.badminton.debug.<版本>.rpk` |
| `npm run release` | 生成发布包（需要 `sign/` 下的证书，见下文） |
| `npm run icon` | 重新生成应用图标 |

## 安装到手环（AstroBox）

1. 从 https://github.com/AstralSightStudios/AstroBox-NG/releases 下载 Mac 版 AstroBox（Apple Silicon 选 `aarch64.dmg`）。
2. 在 AstroBox 里登录同一个小米账号，或者手动填入手环的 AuthKey。
3. 在手机上彻底关掉小米运动健康（iPhone 还要在「设置 → 蓝牙」里忽略手环）。
4. 在手环上进入「设置 → 我的设备 → 连接新手机」，然后在 AstroBox 里连接手环。
5. 把 `dist/` 下的 rpk 拖进 AstroBox 窗口，开始安装。
6. 装好后重新打开小米运动健康，让它接管连接。

每次重装前都把 `src/manifest.json` 里的 `versionCode` 加 1，包名和签名证书保持不变。

## 发布包签名（只在调试包装不上时需要）

    mkdir -p sign && cd sign
    openssl req -newkey rsa:2048 -nodes -keyout private.pem -x509 -days 3650 -out certificate.pem -subj "/CN=badminton"

`sign/` 已在 `.gitignore` 中，私钥要另外备份；以后所有发布包都必须用同一个证书。

## 文档

- 可行性调研：`reports/小米手环10 第三方应用开发可行性.md`
- 设计：`docs/superpowers/specs/2026-10-22-badminton-scorer-design.md`
- 真机验收：`docs/real-device-checklist.md`
```

- [ ] **Step 2: 写 docs/real-device-checklist.md**

```markdown
# 真机验收记录（小米手环10 NFC）

安装包：`dist/com.curain.badminton.debug.<版本>.rpk`
固件版本：（在手环「设置 → 关于」查看）
日期：

| # | 检查项 | 结果 | 备注 |
|---|---|---|---|
| 1 | 调试包能否安装（不能就改用发布包） | | |
| 2 | 息屏后再亮屏，回到计分器还是表盘；比分是否完整 | | |
| 3 | 屏幕常亮是否生效 | | |
| 4 | 常亮 1 小时耗电（开始/结束电量） | | |
| 5 | 短震、长震的手感；两次振动的间隔是否合适 | | |
| 6 | 中文、数字有无缺字或裁切；粗体是否清晰 | | |
| 7 | 圆角是否正常（不正常就补同色边框） | | |
| 8 | 点击是否灵敏，有无误加分或一次点击加两分 | | |
| 9 | 第一次右滑能否拦截，第二次能否退出 | | |
| 10 | 开着手环自带的羽毛球运动记录时能否打开本应用 | | |
| 11 | 升级安装（versionCode +1）后比分和设置是否保留 | | |
| 12 | 更多页版本号后面有无错误码（S1/S2/V/K） | | |
```

- [ ] **Step 3: 生成调试包**

```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm test && npm run build && ls -l dist/
```

Expected: 测试 `# pass 54`；`dist/com.curain.badminton.debug.1.0.0.rpk` 存在。

- [ ] **Step 4: Commit**

```bash
git add README.md docs/real-device-checklist.md
git commit -m "docs: 使用说明与真机验收记录模板" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: 真机安装与验收（由用户在手环上操作）**

按 README「安装到手环」一节安装调试包，逐项填写 `docs/real-device-checklist.md`。根据结果调整：
- 振动间隔：`src/common/device.js` 的 `PATTERNS`，同时改 `test/device.test.mjs` 里的期望值
- 布局尺寸：页面样式
- 圆角边框：页面样式

每轮修改后都要把 versionCode 加 1、跑测试、重新构建，再提交。
