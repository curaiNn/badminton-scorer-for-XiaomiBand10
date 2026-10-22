// 启动手环10 模拟器，并保持运行（Ctrl+C 或关闭模拟器窗口退出）。
// 做法和 `aiot start` 内部一致（VvdManager.startVvd），但不编译、不装包，
// 这样可以把模拟器留在一个终端里常开，改完代码再用 `npm run emu:install` 重装。
// 用法：node tools/emulator/start.cjs [模拟器名=Vela_Band10]
// 前提：已经用 `npm run emu:create` 创建过模拟器。
const path = require('path')

const repo = path.resolve(__dirname, '..', '..')
const emu = require(require.resolve('@aiot-toolkit/emulator', { paths: [repo] }))

const name = process.argv[2] || 'Vela_Band10'
const manager = new emu.VvdManager({ sdkHome: emu.defaultSDKHome, vvdHome: emu.defaultVvdHome })

manager
  .startVvd({
    vvdName: name,
    exitCallback: (code) => {
      console.log('[emu:start] 模拟器已退出', code)
      process.exit(0)
    },
  })
  .then((r) => {
    const grpc = { port: r.grpcConfig['grpc.port'], serial: r.grpcConfig['port.serial'] }
    console.log(`[emu:start] 已启动 coldBoot=${r.coldBoot} grpc=${JSON.stringify(grpc)}`)
  })
  .catch((e) => {
    console.error('[emu:start] 启动失败', e)
    process.exit(1)
  })
