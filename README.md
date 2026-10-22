# 羽毛球计分（小米手环10）

装在小米手环10 上的羽毛球计分器（Xiaomi Vela JS 应用）。红蓝两方点击计分，底部撤销；自动提示发球方和发球区；三局两胜，21 分制和 15 分制可选；支持振动反馈和比赛时屏幕常亮；每得一分都存盘，退出后重新打开可以恢复。

## 模拟器效果

![模拟器截图](docs/images/emulator-screens.png)

模拟器截图：计分页、决胜局换边、局结束、比赛结束、更多页、待确认。

## 开发环境

- Node 22（用 nvm 安装）。这台 Mac 的 PATH 里有旧版 npm，执行命令前先运行：
  `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`
- 安装依赖：`npm install`

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm test` | 运行规则、记录、存储、设备模块的单元测试 |
| `npm run build` | 生成调试包 `dist/com.curain.badminton.debug.<版本>.rpk` |
| `npm run release` | 生成发布包（需要 `sign/` 下的证书，见下文） |
| `npm run icon` | 重新生成应用图标 |
| `npm run emu:create` | 创建手环10 尺寸（212×520）的模拟器，只需一次 |
| `npm run emu:start` | 启动模拟器并保持运行，放在单独一个终端里 |
| `npm run emu:install` | 重新构建并把调试包装进正在运行的模拟器、重启应用，每次改完代码都执行 |
| `npm start` | 官方的 `aiot start --watch`，在这个模拟器镜像上不稳定，见下文，不推荐 |

## 在模拟器里运行

模拟器只用来检查布局和逻辑，振动、常亮、耗电、圆角等仍然要以真机为准。

1. 下载模拟器 SDK 和系统镜像（只需一次）：`npx aiot initEmulatorEnv`，选 `vela-watch-5.0`。
2. 创建手环10 尺寸的模拟器（只需一次）：`npm run emu:create`，会得到名为 `Vela_Band10` 的 212×520 模拟器。已经存在时会直接跳过，不会覆盖。
3. 在一个单独的终端里运行 `npm run emu:start`，等模拟器窗口出现并进入表盘，这个终端保持开着。
4. 在另一个终端里运行 `npm run emu:install`，它会构建、安装并启动应用。之后每次改完代码重新执行这条命令即可。

说明与排错：

- **为什么不用 `aiot createVVD`：** 它只有选 miwear 镜像时才会问宽高，选 `vela-watch-5.0` 时固定是 466×466，得不到手环10 的尺寸。`emu:create` 直接调用工具包的接口，参数是 212×520、密度 320、`pill-shaped`、`band`、`arm`。
- **为什么不用 `npm start`：** 它会编译、安装并启动应用，然后因为工具包只等 8 秒，而这个镜像（`vela-watch-5.0`）启动应用要约 10.5 秒，进程报错退出，热更新撑不住。所以改成构建后用工具包自带的 adb 重装。
- **`initEmulatorEnv` 卡住不动：** 这台网络上 SDK 的下载主机 `vela-ide.cnbj3-fusion.mi-fds.com` 会在 TLS 握手时被断开。同样的文件在 `https://cnbj3-fusion.fds.api.xiaomi.com/vela-ide/` 下面，路径和原主机一致（先看 `versions.json` 里的版本号），可以手动下载 zip，解压到 `~/.vela/sdk` 下对应的子目录（`emulator/`、`system-images/vela-watch-5.0/`、`skins/`、`qa/`、`modem_simulator/`）。
- **更多页版本号显示 `v1.0.0 · K`：** 模拟器镜像里没有 `system.brightness`，所以屏幕常亮开关读取失败，错误码 K 是预期现象。真机上不应该出现。

## 安装到手环（AstroBox）

1. 从 https://github.com/AstralSightStudios/AstroBox-NG/releases 下载 Mac 版 AstroBox（Apple Silicon 选 `aarch64.dmg`）。
2. 在 AstroBox 里登录同一个小米账号，或者手动填入手环的 AuthKey。
3. 在手机上彻底关掉小米运动健康（iPhone 还要在「设置 → 蓝牙」里忽略手环）。
4. 在手环上进入「设置 → 我的设备 → 连接新手机」，然后在 AstroBox 里连接手环。
5. 把 `dist/` 下的 rpk 拖进 AstroBox 窗口，开始安装。
6. 装好后重新打开小米运动健康，让它接管连接。

每次重装前都把 `src/manifest.json` 里的 `versionCode` 加 1，包名和签名证书保持不变。

如果手环拒绝安装，先把 `src/manifest.json` 里的 `minPlatformVersion` 从 1200 改成 1000 再试一次，仍然装不上再看下一节的发布包签名。

## 发布包签名（只在调试包装不上时需要）

    mkdir -p sign && cd sign
    openssl req -newkey rsa:2048 -nodes -keyout private.pem -x509 -days 3650 -out certificate.pem -subj "/CN=badminton"

`sign/` 已在 `.gitignore` 中，私钥要另外备份；以后所有发布包都必须用同一个证书。

## 依赖安全提示

`npm audit` 会报出一批漏洞，全部来自 aiot-toolkit 的开发期依赖树，这些包只在你电脑上构建时用，不会进入手环上的应用。`npm audit --omit=dev` 的结果是 0 个漏洞。不要执行 `npm audit fix --force`，它会把 aiot-toolkit 降级到旧版本，构建会坏。

## 文档

- 可行性调研：`reports/小米手环10 第三方应用开发可行性.md`
- 设计：`docs/superpowers/specs/2026-10-22-badminton-scorer-design.md`
- 真机验收：`docs/real-device-checklist.md`
