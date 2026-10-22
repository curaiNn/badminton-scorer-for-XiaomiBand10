// 启动手环10 模拟器，并保持运行（Ctrl+C 或关闭模拟器窗口退出）。
// 做法和 `aiot start` 内部一致（VvdManager.startVvd），但不编译、不装包，
// 这样可以把模拟器留在一个终端里常开，改完代码再用 `npm run emu:install` 重装。
// 用法：node tools/emulator/start.cjs [模拟器名=Vela_Band10]
// 前提：已经用 `npm run emu:create` 创建过模拟器。
// 终端里出现「已启动」一行就说明可以安装应用了；在这个终端按 Ctrl+C 会停掉模拟器。

// 工具包默认优先用 PATH 里的系统 adb（比如装过 Android platform-tools 的机器）；
// 这里强制只用 @miwt/adb 自带的那份，避免和系统 adb 的版本混用。必须在 require 工具包之前设置
process.env.PRIORITY_ADB_MODULE_TYPE = 'internal'

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
      // 正常关闭窗口是 0（被信号结束时是 null，也算正常）；其余退出码原样返回，方便发现启动失败
      process.exit(code || 0)
    },
  })
  .then((r) => {
    const grpc = { port: r.grpcConfig['grpc.port'], serial: r.grpcConfig['port.serial'] }
    console.log(`[emu:start] 已启动 coldBoot=${r.coldBoot} grpc=${JSON.stringify(grpc)}`)
  })
  .catch((e) => {
    console.error('[emu:start] 启动失败', e || '（没有错误信息，模拟器可能提前退出了）')
    process.exit(1)
  })
