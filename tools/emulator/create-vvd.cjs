// 非交互创建手环10 尺寸的模拟器（VVD）。
// 为什么需要它：`aiot createVVD` 只有选 miwear 镜像时才会询问宽高，
// 选 vela-watch-5.0 这类非 miwear 镜像时固定是 466x466，没法得到手环10 的 212x520。
// 所以这里绕过命令行，直接调用 @aiot-toolkit/emulator 的 VvdManager。
// 另外 `npx aiot initEmulatorEnv` 只下载默认的 vela-miwear-watch-5.0 镜像，
// vela-watch-5.0 不在其中，所以本脚本发现本地缺这个镜像时会自己下载（只下载这一个镜像，约 210 MB）。
// 用法：node tools/emulator/create-vvd.cjs [镜像名=vela-watch-5.0] [模拟器名=Vela_Band10]
// 前提：已经执行过一次 `npx aiot initEmulatorEnv`（下载模拟器内核等其余资源）。
const fs = require('fs')
const path = require('path')

const repo = path.resolve(__dirname, '..', '..')
const emu = require(require.resolve('@aiot-toolkit/emulator', { paths: [repo] }))

const imageType = process.argv[2] || 'vela-watch-5.0'
const name = process.argv[3] || 'Vela_Band10'
const sdkHome = emu.defaultSDKHome
const vvdHome = emu.defaultVvdHome
const imageDir = path.resolve(sdkHome, emu.SDKParts.SYSTEM_IMAGES, imageType)

// 默认下载主机在部分网络上会在 TLS 握手时被断开；同样的文件在这个备用主机上，路径一致
const FALLBACK_BASE = 'https://cnbj3-fusion.fds.api.xiaomi.com/vela-ide'

function fail(message) {
  console.error(message)
  process.exit(1)
}

// 本地没有该系统镜像时，只下载这一个镜像并解压到 ~/.vela/sdk/system-images/<镜像名>/
async function ensureImage(manager) {
  if (manager.hasLocaleImage(imageType)) return

  const url = emu.getImageDownloadUrl()[imageType]
  const manualHelp = [
    '如果是网络问题（默认主机 vela-ide.cnbj3-fusion.mi-fds.com 在有些网络上会被断开 TLS），可以手动处理：',
    `  1. 下载 ${url.replace(emu.baseUrl, FALLBACK_BASE)}`,
    `  2. 解压到 ${imageDir}（解压后这个目录下应直接有 nuttx、vela_system.bin 等文件）`,
    '  3. 重新运行本命令',
  ].join('\n')

  console.log(`本地没有系统镜像 ${imageType}，开始下载（约 210 MB）...`)
  // 先探测下载地址：默认主机被断开 TLS 时，下载库只会一直转圈不报错，这里几秒内就能给出明确结果
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (e) {
    const reason = (e && e.cause && e.cause.code) || (e && e.message) || e
    fail(`连不上 ${url}：${reason}\n${manualHelp}`)
  }
  fs.mkdirSync(path.resolve(sdkHome, emu.SDKParts.SYSTEM_IMAGES), { recursive: true })
  try {
    const downloader = await manager.downloadImage(imageType, { cliProgress: true })
    await downloader.downlodPromise
  } catch (e) {
    fail(`下载系统镜像 ${imageType} 失败：${e && e.message ? e.message : e}\n${manualHelp}`)
  }
  // 下载被取消或出错时 downloadImage 不会抛异常，这里再确认一次镜像是否真的就位
  if (!manager.hasLocaleImage(imageType)) {
    fail(`系统镜像 ${imageType} 没有下载完整。\n${manualHelp}`)
  }
  console.log(`系统镜像 ${imageType} 已就位：${imageDir}`)
}

const manager = new emu.VvdManager({ sdkHome, vvdHome })

async function main() {
  // 已经有同名模拟器就不覆盖，避免丢掉里面装好的应用和数据
  if (fs.existsSync(path.resolve(vvdHome, `${name}.vvd`))) {
    console.log(`模拟器 ${name} 已存在（${vvdHome}），跳过创建。要重建请先执行 npx aiot deleteVVD`)
    return
  }

  // 镜像名不在工具包已知列表里，不去下载，直接报错
  const known = emu.VelaImageVersionList.map((item) => item.value)
  if (!known.includes(imageType)) {
    fail(`未知的系统镜像 ${imageType}，可选：${known.join('、')}`)
  }

  await ensureImage(manager)

  const params = {
    name,
    width: '212',
    height: '520',
    density: 320,
    shape: 'pill-shaped',
    flavor: 'band',
    arch: emu.IVvdArchType.arm,
    imageDir,
    imageType,
    customLcdRadius: '',
  }
  manager.createVvd(params)
  console.log('Create vvd succeed.', JSON.stringify(params))
}

main().catch((e) => fail(`创建模拟器失败：${e && e.message ? e.message : e}`))
