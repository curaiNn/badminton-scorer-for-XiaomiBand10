// 非交互创建手环10 尺寸的模拟器（VVD）。
// 为什么需要它：`aiot createVVD` 只有选 miwear 镜像时才会询问宽高，
// 选 vela-watch-5.0 这类非 miwear 镜像时固定是 466x466，没法得到手环10 的 212x520。
// 所以这里绕过命令行，直接调用 @aiot-toolkit/emulator 的 VvdManager。
// 用法：node tools/emulator/create-vvd.cjs [镜像名=vela-watch-5.0] [模拟器名=Vela_Band10]
// 前提：已经执行过一次 `npx aiot initEmulatorEnv` 下载了模拟器 SDK 与系统镜像。
const fs = require('fs')
const path = require('path')

const repo = path.resolve(__dirname, '..', '..')
const emu = require(require.resolve('@aiot-toolkit/emulator', { paths: [repo] }))

const imageType = process.argv[2] || 'vela-watch-5.0'
const name = process.argv[3] || 'Vela_Band10'
const sdkHome = emu.defaultSDKHome
const vvdHome = emu.defaultVvdHome

// 已经有同名模拟器就不覆盖，避免丢掉里面装好的应用和数据
if (fs.existsSync(path.resolve(vvdHome, `${name}.vvd`))) {
  console.log(`模拟器 ${name} 已存在（${vvdHome}），跳过创建。要重建请先执行 npx aiot deleteVVD`)
  process.exit(0)
}

const imageDir = path.resolve(sdkHome, emu.SDKParts.SYSTEM_IMAGES, imageType)
if (!fs.existsSync(imageDir)) {
  console.error(`找不到系统镜像 ${imageDir}，请先执行 npx aiot initEmulatorEnv`)
  process.exit(1)
}

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

const manager = new emu.VvdManager({ sdkHome, vvdHome })
manager.createVvd(params)
console.log('Create vvd succeed.', JSON.stringify(params))
