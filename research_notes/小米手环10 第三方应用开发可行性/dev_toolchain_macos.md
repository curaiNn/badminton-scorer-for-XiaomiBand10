# Dev toolchain on macOS for Xiaomi Vela JS apps (.rpk) targeting Xiaomi Smart Band 10: IDE, CLI, emulator, packaging (state as of 2026-10-21)

Method note: Most facts below come from primary sources fetched on 2026-10-21:
- the official docs at iot.mi.com/vela/quickapp/
- the JS bundle behind the official download button
- HTTP HEAD checks against Xiaomi's download CDN, used to read file sizes and upload dates without downloading anything
- npm registry metadata, plus the published package source read through jsDelivr
- VS Code Marketplace metadata and changelogs

Community sources (bandbbs, CSDN, cnblogs, GitHub) are marked as such. Nothing was installed or run on the Mac, so every runtime claim is documented behaviour, not something tested here.

## 1. Official IDE: name, download, latest version, standalone vs extension, Apple Silicon, Node.js, login

### Takeaway
The official tool is still called **AIoT-IDE**. It is a standalone IDE built on VS Code. The official download page lists **v1.7.0** with separate **native macOS arm64 (".arm") and x64 zips**; the binaries were uploaded on 2025-06-20 and the page still serves them in Oct 2026. The IDE's Vela features ship as VS Code Marketplace extensions (publisher `vela`). These kept updating through 2026: `aiot-core`/`aiot-emulator` reached 1.7.22 on 2026-07-21. Since `aiot-core` 1.7.19 (2026-05-28) they also run in **stock VS Code** and in VS Code-based editors. The docs require macOS 14+ for the IDE. No account or login requirement is documented. The CLI toolkit the IDE drives enforces **Node.js ≥ 18**.

### Cited Findings
- AIoT-IDE is described as the official IDE for Xiaomi Vela JS apps. It is built on VS Code, inherits all VS Code features, and adds smart code hints, Vela JS debugging, live compile preview, package/release, and real-device debugging. — [关于AIoT-IDE (official)](https://iot.mi.com/vela/quickapp/zh/tools/)
- The download page says the IDE supports macOS, Windows and Ubuntu. Minimum versions: **macOS 14 (Sonoma)+**, Windows 10+, Ubuntu 20.04 LTS+. — [使用 AIoT-IDE 来开发 JS 应用 (official)](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html)
- The download buttons are built from data hard-coded in the page's JS bundle:
  - version `"1.7.0"`, base URL `https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/ide`
  - files `AIoT_IDE_mac_arm.zip`, `AIoT_IDE_mac_x64.zip`, `AIoT_IDE_ubuntu.deb`, `AIoT_IDE_windows.exe`
  - SHA-256 values in the bundle: mac arm `09ada3041798302f0407bd7c60627a120b16c0369f4e7cc33917c3aeca3316ce`, mac x64 `a38a423448e9ad3ca680718c34ce23b10586b47e7b6c6d4d4ac32aa9efce781a`
  - The page's Mac section shows two buttons, ".arm" and ".x64".
  - Sources: [download-page bundle 29.247e232e.js](https://iot.mi.com/vela/quickapp/assets/js/29.247e232e.js) and [official page](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html). The English page's bundle carries the same 1.7.0 data: [EN page](https://iot.mi.com/vela/quickapp/en/guide/start/use-ide.html).
- Direct download URLs, checked by HTTP HEAD on 2026-10-21:
  - `.../ide/v1.7.0/AIoT_IDE_mac_arm.zip`: 135,099,838 bytes, Last-Modified 2025-06-20 — [CDN](https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/ide/v1.7.0/AIoT_IDE_mac_arm.zip)
  - `AIoT_IDE_mac_x64.zip`: 136,036,985 bytes, same date — [CDN](https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/ide/v1.7.0/AIoT_IDE_mac_x64.zip)
  - Ubuntu .deb is 94.8 MB and the Windows .exe is 104.0 MB, both dated 2025-06-20.
- Older builds are on a Xiaomi enterprise net-disk link with password `99E6`. — [official page](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html)
- Some docs are stale. The toolkit page still calls "AIoT-IDE 1.6.0" the latest version. — [AIoT-toolkit (official)](https://iot.mi.com/vela/quickapp/zh/tools/toolkit/start.html)
- History of platform support:
  - In Nov 2023 Aiot-IDE supported only Ubuntu 20.04 and needed Node ≥ 14.0.0. — [IT之家, 2023-11-16](https://www.ithome.com/0/732/945.htm)
  - In early 2024 community developers ran it in Hyper-V Ubuntu VMs, because WSL could not start the emulator. — [米坛社区 thread 10226, 2024-03](https://www.bandbbs.cn/threads/10226/)
- VS Code Marketplace extensions from publisher `vela`, as of 2026-10-21:
  - `vela.aiot-core` 1.7.22 (2026-07-21). Engine `^1.99.0`; depends on `vela.aiot-emulator`; about 12.8k installs. — [Marketplace](https://marketplace.visualstudio.com/items?itemName=vela.aiot-core)
  - `vela.aiot-emulator` 1.7.22 (2026-07-21), described as "vela and android emulator support". Engine `^1.99.3`. — [Marketplace](https://marketplace.visualstudio.com/items?itemName=vela.aiot-emulator)
  - `vela.aiot-project` 1.7.13 (2026-05-08) — [Marketplace](https://marketplace.visualstudio.com/items?itemName=vela.aiot-project)
  - `vela.aiot-devtools` 1.7.12 (2026-02-14) — [Marketplace](https://marketplace.visualstudio.com/items?itemName=vela.aiot-devtools)
  - `vela.aiot-ux` 1.7.10 and `vela.aiot-manifest-visualization` 1.7.0 (both 2025-07-23).
  - The older generation of extensions stopped updating in 2022–2024: `donglin.aiot-ide-banner` 1.2.3 (2024-03-01), `donglin.aiot-ide-devtools` 1.2.4, `zhaoying.aiot-ide-project` 1.2.3, `zhaoying.aiot-ide-avd-tool` 1.0.0 (2022-12-27).
- `aiot-core` changelog highlights. Source: [aiot-core CHANGELOG](https://vela.gallerycdn.vsassets.io/extensions/vela/aiot-core/1.7.22/1784640272242/Microsoft.VisualStudio.Services.Content.Changelog)
  - **1.7.19 (2026-05-28):**
    - Adds VS Code support: `aiot-emulator` and `aiot-core` now work in VS Code or other VS Code-based AI editors.
    - Adds `velajs-mcp` support and writes an MCP config into Vela projects automatically. This can be turned off with `aiot.core.autoWriteMcpConfig`.
  - **1.7.22 (2026-07-21):** "上架开发者大赛专供镜像" (adds an image made for a developer contest), plus debugging performance fixes.
  - **1.7.0 (2025-07-22):**
    - Real-device debugging.
    - Hot reload without page refresh (works with the 5.0 image + aiot-toolkit 2.0).
    - The emulator SDK moves to `~/.vela/sdk`; old `~/.export_dev` and `~/.export` can be deleted.
    - New sensor-simulation page in the emulator.
  - **1.6.0 (2024-12-18):** new `aiot-emulator` module, a skin system with built-in `xiaomi_band` and `xiaomi_band_pro` skins (among others), and Vela 5.0 emulator images.
- In plain VS Code the banner toolbar cannot sit at the top of the window. It is registered in the left sidebar under a "vela" icon instead. — [aiot-core README](https://vela.gallerycdn.vsassets.io/extensions/vela/aiot-core/1.7.22/1784640272242/Microsoft.VisualStudio.Services.Content.Details)
- `vela.vs-aiot-ide-vela` ("vela", 0.0.5, 2026-05-28) depends on `ms-vscode.cpptools-extension-pack` and links to openvela docs. It targets openvela native (C) development, not JS apps. — [Marketplace](https://marketplace.visualstudio.com/items?itemName=vela.vs-aiot-ide-vela)
- Node.js requirements:
  - The official install page names no Node version. It relies on `npm i` for project dependencies and suggests adding `registry="https://registry.npmmirror.com/"` to `.npmrc` if `npm i` fails. — [official page](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html)
  - The `aiot` CLI in `aiot-toolkit` 2.0.5 hard-codes `NODE_MINIMUM_VERSION = '18.0.0'` and exits on older Node. — [aiot-toolkit@2.0.5 lib/bin.js](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/lib/bin.js)
  - The scaffold template's package.json still declares `"node": ">=8.10"`, which is stale. — [create-aiot template package.json](https://cdn.jsdelivr.net/npm/create-aiot@2.0.5/lib/template/ux/vela-demo/package.json)
  - Community guides say to install Node separately, v16+ with LTS v18/v20 acceptable — [CSDN 小米AIoT IDE安装教程](https://blog.csdn.net/Krisotopher/article/details/147383410); another recommends v18+ — [KaiTeeDreamChai/xiaomi-band-dev-guide](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide). An aggregated "related article" snippet on the same CSDN page claims v18.x is required and v20+ may break builds. It is unverified and conflicts with the other guides.
- Login or account:
  - None of the official pages fetched mention a login or account step. Checked: install page, tools overview, interface, project creation, emulator management, toolkit, packaging/release, FAQ.
  - The CLI packages are public on registry.npmjs.org. — [npm aiot-toolkit](https://www.npmjs.com/package/aiot-toolkit)
  - Accounts only appear for real-device debugging, which supports only Xiaomi Watch S4, is open only to specific partners, and needs a test build of Mi Fitness. — [真机调试 (official)](https://iot.mi.com/vela/quickapp/zh/tools/devicedebug/start.html)

### Inferences
- Apple Silicon is natively supported for the IDE: Xiaomi publishes a separate ".arm" Mac build next to ".x64", so Rosetta should not be needed.
- The standalone IDE 1.7.0 dates from June 2025, but features effectively arrive through Marketplace extension auto-updates (1.7.22 in July 2026). For a developer who lives in VS Code or Claude Code, **stock VS Code + `vela.aiot-core` + `vela.aiot-emulator`** is now an officially supported alternative to the standalone app.
- Because the official fix for the "damaged app" error is quarantine removal, the macOS zip is most likely not notarized by Apple.

### Gaps
- I could not determine whether a standalone IDE newer than 1.7.0 exists. The official page says 1.7.0; HEAD probes of other version paths timed out or returned 404 (v1.6.0); the net-disk history folder is password-protected and was not inspected.
- The VS Code version that AIoT-IDE 1.7.0 is built on is not documented. The extensions need ≥1.99.
- No source confirms or denies that AIoT-IDE 1.7.0 runs on macOS 26 (Darwin 25).
- "No login required" is inferred from silence in the docs; it was not confirmed by installing.

## 2. CLI (aiot-toolkit): create, dev server, debug and release builds; full command-line builds on macOS; templates

### Takeaway
`aiot-toolkit` 2.x is the same build engine the IDE uses. The latest stable release is **2.0.5 (2025-07-23)**; beta and "prender" pre-release tags were still being published up to 2026-10-14. It can do the whole job from a terminal:
- scaffold with `npm create aiot`
- download the emulator SDK with `aiot initEmulatorEnv` and create an emulator with `aiot createVVD`
- build + boot the emulator + install + hot reload with `aiot start --watch`
- build a debug rpk with `aiot build` and a release rpk with `aiot release`

The official docs explicitly say development can be done fully without the IDE, and the FAQ says Mac can package rpk. There is **no official band-specific template**: the scaffold is a watch demo with `designWidth: 480`.

### Cited Findings
- The IDE builds projects through the AIoT-toolkit embedded in the project template and produces `.rpk` files. The toolkit "提供了脱离AIoT-IDE，独立开发 Xiaomi Vela JS 应用的能力" (it can be used to develop entirely without the IDE).
  - The docs list these commands: `npm create aiot`, `aiot start` (prompts to create an emulator on first run), `aiot build`, `aiot release`, `aiot getConnectedDevices`, `aiot getPlatforms`, `aiot crateVelaAvd`, `aiot deleteVelafangAvd`. — [AIoT-toolkit (official)](https://iot.mi.com/vela/quickapp/zh/tools/toolkit/start.html)
  - The real 2.0.5 CLI registers: `build`, `release`, `start`, `getConnectedDevices`, `getPlatforms`, `installDbgAndMkp`, `createVVD`, `deleteVVD`, `initEmulatorEnv`, `resign`. — [aiot-toolkit@2.0.5 lib/bin.js](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/lib/bin.js) and [README](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/README.md)
  - So the documented `crateVelaAvd`/`deleteVelafangAvd` are typos or outdated names for **`createVVD`/`deleteVVD`**.
- Install and run steps from the package README: `npm i aiot-toolkit -g`, `npm i create-aiot -g`, then `create-aiot ux`, `npm i`, `aiot start` (starts the emulator and runs the project), and `aiot release`. — [aiot-toolkit README](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/README.md)
- npm release history. Sources: [npm aiot-toolkit](https://www.npmjs.com/package/aiot-toolkit), [create-aiot](https://www.npmjs.com/package/create-aiot), [@aiot-toolkit/emulator](https://www.npmjs.com/package/@aiot-toolkit/emulator), [@aiot-toolkit/jsc](https://www.npmjs.com/package/@aiot-toolkit/jsc)
  - `aiot-toolkit` stable: 2.0.2 (2024-09-25), 2.0.3 (2024-12-17), 2.0.4 (2025-03-03), **2.0.5 (2025-07-23)**.
  - The 1.x line ended at 1.1.4 (2024-08-30).
  - dist-tags: `beta` = 2.0.6-beta.28 (2026-07-22), `prender` = 2.1.0-prender.17 (2026-10-14).
  - `create-aiot`, `@aiot-toolkit/emulator` ("vela emulator tool") and `@aiot-toolkit/aiotpack` are all latest 2.0.5.
  - `@aiot-toolkit/jsc` latest is 1.0.10 (2026-10-20).
- The IDE supports toolkit 1.0 (≥1.0.18) and 2.0, and recommends 2.0 for faster compiles and hot update. — [AIoT-toolkit (official)](https://iot.mi.com/vela/quickapp/zh/tools/toolkit/start.html)
  - Moving from 1.0 to 2.0 has breaking changes: no nested `{{}}` inside `{{}}`, unsupported selectors such as pseudo-classes now raise errors, dynamic paths must be absolute (`/common/...`), and dynamic `transform`/`background`/`filter` values must be JSON strings. — [升级迁移 (official)](https://iot.mi.com/vela/quickapp/zh/tools/toolkit/update.html)
- `create-aiot` usage. — [create-aiot README](https://cdn.jsdelivr.net/npm/create-aiot@2.0.5/README.md)
  - `npm create aiot` prompts for everything; `npm create aiot --name my-project` skips the prompts.
  - Parameters: `name`, `v`, `template`, `eslint`.
  - Bundled templates are only `ux/vela-demo` and `ux/android-demo`. — [template.json](https://cdn.jsdelivr.net/npm/create-aiot@2.0.5/lib/template/template.json)
- The `vela-demo` scaffold:
  - scripts: `"start": "aiot start --watch"`, `"build": "aiot build"`, `"release": "aiot release"`
  - devDeps: `aiot-toolkit` and `@aiot-toolkit/jsc ^1.0.3`
  - manifest values: `package: com.application.watch.demo`, `versionName: 1.0.0`, `versionCode: 1`, `minPlatformVersion: 1200`, `deviceTypeList: ["watch"]`, `config.designWidth: 480`, features `system.router` and `system.configuration`
  - Sources: [template package.json](https://cdn.jsdelivr.net/npm/create-aiot@2.0.5/lib/template/ux/vela-demo/package.json), [template manifest](https://cdn.jsdelivr.net/npm/create-aiot@2.0.5/lib/template/ux/vela-demo/src/manifest.json)
- The IDE's "新建项目" (new project) dialog offers 8 generic templates: basic, calendar, chart, list, music player, development samples, calculator, settings panel. None is band-specific. — [新建项目 (official)](https://iot.mi.com/vela/quickapp/zh/tools/project/creat-project.html)
  - The IDE recognises a Vela project by `src/manifest.json` and reads `deviceTypeList` to decide the project type. — [关于AIoT-IDE](https://iot.mi.com/vela/quickapp/zh/tools/)
- Build flags work on `build`, `server` and `release`, either on the command line (e.g. `aiot build --devtool=source-map`) or in `quickapp.config.js` → `cli`.
  - Documented flags: `--devtool`, `--enable-jsc`, `--enable-protobuf`, `--enable-custom-component`. `npx aiot build -h` lists all. — [编译参数 (official)](https://iot.mi.com/vela/quickapp/zh/guide/start/toolkit-params.html)
  - The 2.0.5 README adds `--enable-e2e`, `--e2e-config-path`, `--enable-stats`, `--optimize-css-attr`, `--complete-feature`, `--start-page`, `--enable-image-png8`, `--drop-console`. It marks `--enable-custom-component` as deprecated. — [README](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/README.md)
- How `aiot start` works. — [VelaUxStarter.js](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/lib/starter/VelaUxStarter.js)
  1. Checks the emulator SDK. If it is missing it stops and says: run `npx aiot initEmulatorEnv`.
  2. If no emulator exists, it launches interactive creation.
  3. Builds the project.
  4. Boots the selected emulator.
  5. Pushes, installs and starts the rpk.
  6. With `--watch`, pushes changed-file diffs and reloads the app.
  - Flags: `--watch`, `--openVNC`, `--disableNSH`, plus the build flags.
- How `aiot createVVD` works. — [VelaAvdUtils.js](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/lib/utils/VelaAvdUtils.js)
  - It is interactive, and the emulator name must start with `Vela` (default `Vela_Virtual_Device`).
  - You pick a system image. Skin selection or custom width/height is offered only for "miwear" images; other images silently get 466×466.
  - It downloads any missing SDK parts.
- When the toolkit runs outside the IDE (`TERM_PROGRAM !== 'aiot-ide'`), a build prints a warning pointing to AIoT-IDE. It does not stop the build. — [bin.js](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/lib/bin.js)
- Official FAQ: "Windows和Mac可以打包rpk" (Windows and Mac can package rpk). — [常见问题 (official)](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
- Per-device builds can use `conditional-compilation-webpack-plugin` with env vars such as `cross-env DEVICE_TYPE=WATCH SHAPE=RECT aiot build`, and `<!-- if true: process.env.SHAPE === 'RECT' -->` blocks in .ux/CSS/JS. — [条件编译 (official)](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/conditional-compilation.html)
- `velajs-mcp` 0.0.13 (2026-07-21), an MCP server for Vela apps. — [npm velajs-mcp](https://www.npmjs.com/package/velajs-mcp)
  - CLI mode `start_debug_cli` builds the project, starts an MQTT broker, launches the emulator and pushes the app with hot reload. No IDE is required.
  - Tools include `list_emulators`, `take_screenshot`, `tap`, `swipe`, `get_snapshot`, `get_emulator_logs`, `stop_debug`.
  - Prerequisites: `aiot-toolkit` installed in the project, and at least one emulator created "via AIoT IDE".
  - Claude Code setup: `claude mcp add --scope user velajs -- npx -y velajs-mcp`.
- `create-vela-workflow` (latest 1.2.0, last published 2026-06-09, Node ≥ 16) is an official AI-workflow scaffold for GitHub Copilot or Kiro: `npx create-vela-workflow my-app`. — [AI 自动化生成 (official)](https://iot.mi.com/vela/quickapp/zh/tools/dev/official-site-tutorial.html), [npm](https://www.npmjs.com/package/create-vela-workflow)
- Community projects ship IDE-free command-line flows:
  - npm scripts `build`/`release` that call `aiot` — [KaiTeeDreamChai guide](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide)
  - shell scripts `emu-deploy.sh` and `emulator-grpc.js` ("no IDE required") — [mhdbaselar/xiaomi-band-development, 2026-10](https://github.com/mhdbaselar/xiaomi-band-development)

### Inferences
- Likely IDE-free setup on Apple Silicon, assembled from the sources above but **not executed**:
  1. Install a native arm64 Node LTS, version 18 or later; `node -p process.arch` should print `arm64`.
  2. Run `npm create aiot` and pick `ux`/vela-demo, or `npx create-aiot ux`. Then `cd <proj> && npm i`; if npm is slow from China, use `.npmrc` with npmmirror.
  3. Edit `src/manifest.json` for Band 10: package name, `designWidth`, features such as `system.vibrator`/`system.storage`.
  4. Run `npx aiot initEmulatorEnv`. This downloads about 0.7–1.0 GB of emulator core, system image, skins and qa from Xiaomi's CDN; see section 3.
  5. Run `npx aiot createVVD` with a name starting `Vela`.
  6. Run `npx aiot start --watch` for a live emulator preview.
  7. Run `npx aiot build` for `dist/<pkg>.debug.<ver>.rpk` and `npx aiot release` for `dist/<pkg>.release.<ver>.rpk` once `sign/` exists; see section 4.
- The IDE-oriented emulator UI (device presets such as "xiaomi10Band") may be easier than the CLI prompts, which only offer skins or sizes on miwear images. Stock VS Code with the `vela.*` extensions gives the same UI without the standalone IDE.
- The official e2e test feature (section 3) needs `aiot-toolkit` ≥ 2.0.6-beta.17. That only exists on the `beta`/`prender` tags, not the 2.0.5 `latest`, so anyone wanting it must pin a pre-release.

### Gaps
- Nothing was run on this Mac. Building with Node 22 or 24 on macOS 26 is untested; one community repo ran the emulator package with Node v24, but on Linux.
- What changed in 2.0.6-beta.x and 2.1.0-prender.x is not documented publicly.
- No official band-specific template or scaffold was found.

## 3. Emulator/simulator: Band 9/10 profile, macOS/Apple Silicon support, fidelity, browser preview

### Takeaway
The IDE and `aiot-toolkit` ship a QEMU-based "Vela emulator". It is an Android-emulator-derived `emulator -vela` binary that boots NuttX-based Vela system images, and it is downloaded on demand from Xiaomi's CDN. **Native `darwin-aarch64` builds exist**: v0.1.0 uploaded 2024-12-27 and v0.2.0 uploaded 2025-09-10. The official FAQ lists Mac as supported (macOS 12+).

The IDE's multi-screen device list includes **"xiaomi10Band"**, and the official device table gives Band 10 as 212×520 pill-shaped. However:
- there is **no Band 10-specific system image**;
- per the docs, band-size presets work only with the dev image without a watchface or launcher, while the "miwear" images with a launcher are fixed at 466×466 in the IDE.

Fidelity is limited:
- performance differs from the real device;
- there is no phone or Bluetooth link without an external adapter;
- community users report missing glyphs (including many CJK), unreliable scroll and back-swipe gestures, and apps that work in the emulator but fail on a device.

No browser or web previewer exists.

### Cited Findings
- The IDE can initialise the emulator environment automatically and create, delete and list emulators. Creating one downloads a Vela image first. — [use-ide (official)](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html), [设备管理 (official)](https://iot.mi.com/vela/quickapp/zh/tools/emulator/create-emulator.html)
  - The device page also manages emulator "kernel" and image versions and checks for updates at every IDE start.
  - Per-emulator shortcuts: copy the launch command (for command-line launching and troubleshooting), open the emulator or image folder, install an rpk, use a custom image directory.
  - Setting "Hide Qt Window": embed the emulator in the IDE through gRPC, or show it as a separate window. Setting "Adb Mode": use the built-in adb or the host's adb.
- Images:
  - The docs list `vela-miwear-watch-5.0` (default, 5.0 stable), `vela-miwear-watch-4.0`, and `vela-watch-4.0` (dev build). — [多屏适配 tools page (official)](https://iot.mi.com/vela/quickapp/zh/tools/debug/multi-screens.html)
  - Toolkit 2.0.5's built-in list adds `vela-watch-5.0`, described as a 5.0 image without a watchface whose size can be customised. — [emulator constants.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/emulatorutil/constants.js)
- Device presets in the IDE: xiaomiWatch 466×466, redmiWatch, xiaomiBand, xiaomiBandpro, **xiaomi10Band**, xiaomiSoundMini. — [多屏适配 tools page (official)](https://iot.mi.com/vela/quickapp/zh/tools/debug/multi-screens.html)
  - The miwear 5.0 and 4.0 images support **only** xiaomiWatch 466×466. `vela-watch-4.0` supports all presets plus custom ones.
  - Custom emulators: width and height 100–800, round or rectangular shape (rectangles can have rounded corners), type watch/band/smartspeaker, custom dpi.
  - Skin layout `props` support `shape pill-shaped` (capsule screen, "全面屏手环"), a fixed density list (…320, 340, 360…) and `flavor band`.
  - The page notes that the emulator and real devices differ in performance.
- When run from the device page, the miwear 5.0 and 4.0 images show a watchface, while **`vela-watch-4.0` shows a black screen**, i.e. it has no launcher. — [运行模拟器 (official)](https://iot.mi.com/vela/quickapp/zh/tools/emulator/emulator-run.html)
- Official Band 10 screen data: pill-shaped, 1.725″, **212×520**, 326 PPI, width 106 dp, aspect ratio 0.4. Band 9 is 192×490. — [多屏适配 guide (official)](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/)
- The official FAQ says the emulator supports Windows (Win10+), **Mac (macOS 12+)** and Ubuntu. — [常见问题 (official)](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
- Emulator core packages for every host OS/arch, checked by HTTP HEAD on 2026-10-21 against `https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/emulator/...`:
  - v0.1.0 (Last-Modified 2024-12-27): `darwin-aarch64.zip` 261.6 MB, `darwin-x86_64.zip` 215.5 MB, plus linux-x86_64, linux-aarch64 and windows-x86_64. — [CDN darwin-aarch64 v0.1.0](https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/emulator/v0.1.0/darwin-aarch64.zip)
  - v0.2.0 (2025-09-10): `darwin-aarch64.zip` 497.6 MB, `darwin-x86_64.zip` 427.4 MB. — [CDN darwin-aarch64 v0.2.0](https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/emulator/v0.2.0/darwin-aarch64.zip)
  - The toolkit maps Node's `os.arch()` `arm64`→`aarch64` and `x64`→`x86_64`, rejects any other arch, and downloads `${emulatorBaseUrl}/v${ver}/${os}-${arch}.zip`. — [emulator utils/index.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/utils/index.js), [constants.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/emulatorutil/constants.js)
- Other SDK downloads, HEAD-checked:
  - `vela-miwear-watch-5.0`: build 20250716 is 383.3 MB; build 20260130 is 414.1 MB.
  - `vela-watch-5.0`: 20250716 is 220.5 MB; 20260422 is 230.9 MB.
  - `vela-release-4.0` (= miwear-4.0): 285.9 MB. `vela-pre-4.0` (= vela-watch-4.0): 221.5 MB.
  - skins: v0.0.10 is 0.94 MB; v0.0.12 is 1.76 MB (2025-08-21).
  - qa: 28.2 MB. tools v0.0.3: 13.8 MB.
  - Sources: [CDN image example](https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/system-images/vela-miwear-watch-5.0/20250716/vela-miwear-watch-5.0.zip), [constants.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/emulatorutil/constants.js)
  - Toolkit 2.0.5 pins emulator 0.1.0, skins 0.0.10 and images 20250716. The pre-release 2.1.0-prender.17 pins emulator **0.2.0**, skins 0.0.12, tools 0.0.3 and images 20260130/20260422, and tries an internal Xiaomi mirror before falling back to the public CDN. — [prender.17 constants.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.1.0-prender.17/lib/emulatorutil/constants.js)
- Locations on disk: the SDK lives in `~/.vela/sdk/` (`emulator/`, `system-images/`, `skins/`, `qa/`, `tools/`) and emulators in `~/.vela/vvd/`. — [emulator typing/Vvd.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/typing/Vvd.js), [constants.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/emulatorutil/constants.js)
  - Custom skins go in `skins/user` inside this dot-directory. — [多屏适配 tools page](https://iot.mi.com/vela/quickapp/zh/tools/debug/multi-screens.html)
- Launch command and defaults. — [emulator vvd/index.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/vvd/index.js), [constants.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/emulatorutil/constants.js)
  - Command: `<sdk>/emulator/<os>-<arch>/emulator -vela -avd <name> -show-kernel -network-user-mode-options hostfwd=tcp:127.0.0.1:<debugPort>-10.0.2.15:101 [-qt-hide-window|-no-window] -grpc <port> -qemu -device virtio-snd,... -allow-host-audio -semihosting`
  - `-no-window` is used only on Docker, WSL, Linux without a display, or CI; on macOS the Qt window is hidden or embedded instead.
  - Default ports: adb 5555, VNC 5900, debug 10055.
- Default emulator hardware config: 32-bit ARM (`armeabi-v7a`), 4 cores, `hw.ramSize` 1024, density 420, 466×466. It declares battery, GPS, audio input, accelerometer, gyroscope, proximity, magnetic, temperature, light, humidity and **heart-rate** sensors. — [avdConfigIni.json](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/static/avdConfigIni.json)
  - A sensor-simulation page was added in IDE extension 1.7.0. — [aiot-core CHANGELOG](https://vela.gallerycdn.vsassets.io/extensions/vela/aiot-core/1.7.22/1784640272242/Microsoft.VisualStudio.Services.Content.Changelog)
- Emulator controls in the IDE: power off, home, NSH terminal, log viewer, menu, screenshot (with or without skin), resize, install rpk, switch or uninstall installed rpks, several emulators side by side. — [功能按钮 (official)](https://iot.mi.com/vela/quickapp/zh/tools/debug/toolbar.html)
  - Hot reload on file change. — [应用热更新 (official)](https://iot.mi.com/vela/quickapp/zh/tools/dev/build.html)
  - The IDE can also preview an existing rpk by opening its unzipped folder. — [了解界面 (official)](https://iot.mi.com/vela/quickapp/zh/tools/start/project.html)
- Official limits:
  - Emulator-to-phone communication needs an external Bluetooth adapter, is complex to set up, and the FAQ recommends a real device instead. — [FAQ](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
  - JS heap snapshots in the IDE only work for apps that don't use low-level device capabilities; others need special firmware on the device. — [内存分析 (official)](https://iot.mi.com/vela/quickapp/zh/tools/debug/memory.html)
  - Real-device debugging supports only Xiaomi Watch S4, for partners. — [真机调试](https://iot.mi.com/vela/quickapp/zh/tools/devicedebug/start.html)
- Official automated testing in the emulator. — [自动化测试 (official)](https://iot.mi.com/vela/quickapp/zh/guide/other/automated-test/)
  - Mocha-style `describe`/`it`/`assert` test cases live under `src/test`, with a `TestRunner` page and `autoTestConfig.json`.
  - Run with `aiot start --enable-e2e --e2e-config-path ./autoTestConfig.json --watch`. Results are printed to the console and can be POSTed by `fetch`.
  - Requires `aiot-toolkit` ≥ **2.0.6-beta.17**. The page calls it an internal beta and says to update the aiot-core, aiot-emulator and aiot-project plugins (.vsix).
- Community Band 10 emulator work: [dargon682/xiaomi-band10-vela-emulator](https://github.com/dargon682/xiaomi-band10-vela-emulator) (created 2026-10-17; **tested on Linux x86_64, not macOS**).
  - The repo states plainly that there is **no official Band 10 image** and treats Band 10 as just a 212×520 rounded screen.
  - It created a 212×520 emulator (corner radius 90) on `vela-miwear-watch-5.0` through the `@aiot-toolkit/emulator` API.
  - `hw.lcd.density=326` fails with "Bad LCD density: 326"; **320 works**.
  - `vela-watch-5.0` boots to a black screen with no launcher; the miwear image includes a launcher.
  - First boot can fail with `Could not open userdata-qemu.img`; copying `vela_data.bin` fixes it.
  - It ran headless with `-no-window -grpc 8556`, took screenshots and sent input over gRPC, and installed and ran rpks with `adb shell pm install` / `am start`.
  - It also swapped in partitions from real Band 10 firmware to get the real resources and watchfaces. This is unofficial and comes with risk and copyright caveats.
- Community fidelity notes: [mhdbaselar/xiaomi-band-development, 2026-10](https://github.com/mhdbaselar/xiaomi-band-development).
  - The emulator runs NuttX with ADB. Apps can be deployed by pushing and unzipping the rpk and starting `vapp`.
  - UI should be driven with mouse events (`sendMouse`) rather than touch events.
  - **Missing fonts: Hebrew, Arabic and many CJK glyphs.**
  - `<scroll>` finger-scrolling may not work, and the swipe-right back gesture does not work.
- Another developer: "在模拟器上能正常运行，在实机上则不一定" (it runs fine in the emulator, but not necessarily on the real device). — [cnblogs 快乐的乙炔, 2025-12-18](https://www.cnblogs.com/HPC2H2/p/19504076)
- In early 2024 an IDE plugin update brought in a "ux preview". In the same period, updates broke emulator discovery, and `storage.get`/`storage.set` failed with "No such file or directory" until the plugin was downgraded. — [米坛社区 thread 10226, 2024-03](https://www.bandbbs.cn/threads/10226/)
- Browser or web preview: neither the official docs nor community searches turned one up. Official preview options are the QEMU emulator (IDE, VS Code extension or CLI) and real-device debugging for Watch S4 partners only. — [编译预览 (official)](https://iot.mi.com/vela/quickapp/zh/tools/debug/start.html)

### Inferences
- On an Apple Silicon Mac with arm64 Node, the toolchain fetches the native `darwin-aarch64` emulator, so **Rosetta should not be needed**. An x64 Node running under Rosetta would make the toolkit fetch `darwin-x86_64` instead, since it trusts `os.arch()` on Node ≥ 15.
- Practical routes to a Band 10-sized preview:
  - (a) the IDE's xiaomi10Band preset on the no-launcher image;
  - (b) a custom 212×520 pill or rounded-rectangle emulator on `vela-watch-5.0`/`4.0` with density 320;
  - (c) like dargon682, calling the emulator API to put 212×520 on the miwear image, which the IDE does not officially allow.
  - None of these reproduces Band 10 firmware, fonts, API level, memory or performance.
- The emulator's default 4 cores and `hw.ramSize=1024` are probably far more generous than the band. Memory and performance problems will likely show up only on the real device.
- For a Chinese-UI scorer app, the community report of missing CJK glyphs means Chinese text should be checked on the band early. That report comes from a single source and is unverified.
- The emulator VVD declares sensors and audio, but nothing documents whether `@system.vibrator` gives any visible or audible feedback in the emulator.

### Gaps
- No first-hand report, positive or negative, of the Vela emulator running on an Apple Silicon Mac or on macOS 26 was found. Native arm64 support rests on the CDN artefacts and toolkit code.
- Vibration behaviour in the emulator and whether app storage survives emulator restarts are undocumented. The default config forces a cold boot.
- Which emulator core (0.1.0 or 0.2.0) and image builds the current IDE extensions (1.7.22) download on macOS was not determined.
- What the "developer contest" image added in aiot-core 1.7.22 contains, and whether it covers band form factors, is unknown; searches found nothing.
- The contents of the skins package (e.g. whether there is a dedicated Band 10 skin file) were not inspected, to avoid downloading files.

## 4. Packaging and signing: debug vs release rpk, certificates, package name, versioning

### Takeaway
There are two build types:
- **Debug** (IDE "打包" or `aiot build`) writes `dist/<package>.debug.<versionName>.rpk`. It is signed automatically, with the toolkit's built-in development certificate as a last resort.
- **Release** (IDE "发布" or `aiot release`) writes `dist/<package>.release.<versionName>.rpk`. It **requires** `private.pem` + `certificate.pem` in `sign/` (or `sign/release/`). The IDE can generate them, or you run `openssl req -newkey rsa:2048 -nodes -keyout private.pem -x509 -days 3650 -out certificate.pem`.

The same certificate must be reused for every release. `manifest.json` carries the `package` name (recommended `com.company.module`, different from native app names), an integer `versionCode` that increases on every upload, a `versionName` string, and `minAPILevel`.

### Cited Findings
- IDE packaging. — [use-ide (official)](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html)
  - "打包" creates `dist/` (a `.debug.rpk`) and `build/` (the compiled JS).
  - "发布" needs signing files. The IDE generates `sign/private.pem` and `sign/certificate.pem`, then outputs an rpk with a `release` suffix.
  - Auto-generation needs `openssl` installed. Manual command: `openssl req -newkey rsa:2048 -nodes -keyout private.pem -x509 -days 3650 -out certificate.pem`, with both files placed in a new `sign/` folder in the project.
  - The openssl-missing troubleshooting on that page is aimed at Windows.
- Debug packages keep debugging information and are not heavily optimised. Release packages strip debug info, comments and unused code. Before a release build the IDE checks for signing files and opens a certificate-creation page if they are missing. — [打包应用](https://iot.mi.com/vela/quickapp/zh/tools/release/start.html), [发布应用 (official)](https://iot.mi.com/vela/quickapp/zh/tools/release/release.html)
- How the toolkit chooses certificates. — [aiotpack SignUtil.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/aiotpack@2.0.5/lib/compiler/javascript/vela/utils/signature/SignUtil.js)
  - Debug: `sign/debug/*.pem`, then `sign/*.pem`, then the **toolkit's bundled default certificate**.
  - Release: `sign/release/*.pem`, then `sign/*.pem`. If neither exists it throws "there is a problem with the certification path".
  - In production mode, the zip step appears to filter source-map files out of the rpk (a `mapReg` test applied only when mode is PRODUCTION). — [ZipUtil.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/aiotpack@2.0.5/lib/compiler/javascript/vela/utils/ZipUtil.js)
- File naming. — [ZipUtil.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/aiotpack@2.0.5/lib/compiler/javascript/vela/utils/ZipUtil.js), [BuildNameFormatType.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/aiotpack@2.0.5/lib/compiler/javascript/vela/enum/BuildNameFormatType.js)
  - The default format is `packageName.signatureType.versionName.rpk`, e.g. `com.example.app.debug.1.0.0.rpk`.
  - The "original" format omits the version.
  - The docs' example name `com.application.demo.rpk` is simplified.
- `aiot resign` rebuilds an rpk from an existing `build/` folder. You can drop your own `sign/` alongside it, and the output goes to `dist/`. — [aiot-toolkit README](https://cdn.jsdelivr.net/npm/aiot-toolkit@2.0.5/README.md)
- Project layout: `build/` holds intermediates, `dist/` the final rpk, `sign/` the `certificate.pem` + `private.pem`, `src/` the code (name fixed), plus `package.json`. — [项目概览 (official)](https://iot.mi.com/vela/quickapp/zh/guide/start/project-overview.html)
- Manifest rules. — [项目配置 manifest (official)](https://iot.mi.com/vela/quickapp/zh/guide/framework/manifest.html)
  - `package` (required): must differ from native app package names; `com.company.module` format recommended.
  - `name` (required): at most 6 Chinese characters.
  - `icon` (required): 192×192.
  - `versionName`: optional string, e.g. "1.0".
  - `versionCode` (required): integer starting at 1, recommended +1 on every upload.
  - `minAPILevel`: default 1.
  - `features`: most APIs must be declared here.
  - `config.designWidth`.
  - `router.entry`/`router.pages` (required).
  - `deviceTypeList`: values watch/tv/car/phone, but "现只支持watch" (currently only watch).
  - `permissions`.
- Template and docs disagree on field names. The scaffold manifest uses `minPlatformVersion: 1200` and an undocumented `simulationVersion: "default"`, while the manifest docs describe `minAPILevel`. The docs' own sample also uses `minPlatformVersion: 1000`. — [template manifest](https://cdn.jsdelivr.net/npm/create-aiot@2.0.5/lib/template/ux/vela-demo/src/manifest.json), [manifest docs](https://iot.mi.com/vela/quickapp/zh/guide/framework/manifest.html)
- Certificates, per the FAQ:
  - If the band app talks to a phone app, the rpk must be signed with the same certificate as the phone app, otherwise communication is refused.
  - Keep the certificate safe and use the same one for every release build; a changed certificate may block store listing.
  - The default framework resolution is 480×480; set `designWidth` to match the design draft.
  - Source: [常见问题 (official)](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
- An rpk is a zip containing `manifest.json`, `pages/`, `app.jsc` (compiled bytecode), resources and `META-INF/` (signature). A community Band app manifest uses `deviceTypeList: ["watch"]` and `designWidth: 212`. — [dargon682 repo README](https://github.com/dargon682/xiaomi-band10-vela-emulator)
  - Official data for comparison: Band 10 is 212 px wide = 106 dp. — [multi-screens guide](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/)
- An unverified community claim, with sideloading itself out of scope: retail bands accept the **debug** rpk from `npm run build` and typically reject self-signed release packages. — [KaiTeeDreamChai guide](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide)

### Inferences
- macOS ships `/usr/bin/openssl` (LibreSSL), so the official `openssl req ... -x509 -days 3650` command and the IDE's auto-generation should work without Homebrew OpenSSL. This was not checked against LibreSSL.
- `sign/private.pem` is a long-lived private key. Keep it out of public git and back it up, since the FAQ requires the same certificate for future releases.
- For a Band 10 app the scaffold manifest needs editing: package name, `designWidth` (212 per the community, or the 106-dp guidance; see the API/component notes), features (`system.vibrator`, `system.storage`, etc.), and `minAPILevel`/`minPlatformVersion` matched to the Band 10 firmware.

### Gaps
- The exact `minAPILevel` or `minPlatformVersion` of Band 10 firmware is not stated in the tool docs; another researcher covers APIs.
- The signing scheme and acceptance rules for store distribution versus sideloading are not fully documented; sideloading is out of scope here.

## 5. Known macOS problems (Gatekeeper, emulator crashes, network, Rosetta, etc.)

### Takeaway
Only one macOS-specific problem is officially documented: **Gatekeeper reports "Aiot IDE.app 已损坏，无法打开" (the app is damaged)**, fixed by removing the quarantine flag. Other recurring issues apply to every OS:
- **npm registry access**: switch to npmmirror;
- **large downloads from Xiaomi's Beijing CDN**: about 0.7–1 GB for emulator plus image;
- **IDE extension auto-update regressions**;
- emulator gRPC, launch and multi-instance bugs, which the 2025 extension releases fixed.

Apple Silicon is supported natively, and Rosetta is not needed as long as Node is arm64. The docs disagree on the minimum macOS (14 for the IDE, 12 for the emulator). No reports specific to macOS 26 were found.

### Cited Findings
- Official macOS install note: if macOS refuses to open the app, run `sudo xattr -r -d com.apple.quarantine`, drag the app into the terminal, press Enter and give the password. — [use-ide (official)](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html)
  - A 2025-08-18 guide names the error "Aiot IDE.app 已损坏，无法打开". — [CSDN openvela之AIoT-IDE 全流程使用指南](https://blog.csdn.net/RIVOTEK_OPENVELA/article/details/149577996)
- Conflicting minimum macOS: the IDE install page says macOS 14+, while the FAQ says the emulator supports macOS 12+. — [use-ide](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html), [FAQ](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
- If `npm i` fails, add `registry="https://registry.npmmirror.com/"` to `.npmrc` and rerun. — [use-ide](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html)
- Network: the emulator SDK and images come from `vela-ide.cnbj3-fusion.mi-fds.com`. Sizes are in section 3, e.g. darwin-aarch64 core 261.6–497.6 MB plus a 383–414 MB miwear image. — [CDN](https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/emulator/v0.2.0/darwin-aarch64.zip)
  - The IDE checks for emulator kernel and image updates at every start. — [设备管理](https://iot.mi.com/vela/quickapp/zh/tools/emulator/create-emulator.html)
- Host-architecture choice: the toolkit uses `os.arch()` (`arm64`→`darwin-aarch64`, `x64`→`darwin-x86_64`) and only uses `sysctl.proc_translated` on Node < 15. — [emulator utils/index.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/utils/index.js)
- Emulator and IDE bugs fixed in 2025, which show which failure modes exist. — [aiot-core CHANGELOG](https://vela.gallerycdn.vsassets.io/extensions/vela/aiot-core/1.7.22/1784640272242/Microsoft.VisualStudio.Services.Content.Changelog)
  - Installing the app failed in some cases (1.7.13).
  - The screenshot button did not work (1.7.13).
  - gRPC connections failed, and running several emulators crashed them (1.7.14).
  - The toolkit build process kept running after the IDE quit (1.7.14).
  - Custom emulators could not be created, and custom round emulators had no rounded corners (1.7.15).
  - "startapp timeout" with toolkit 1 + Vela 5 (1.7.15).
  - The emulator did not exit when the IDE quit (1.7.17).
  - Emulators without a skin failed to start (1.7.18).
  - Some Windows UI controls did not display (1.7.22).
- In 2024, on Linux, plugin auto-updates (`aiot-ide-banner` 1.2.3) broke emulator discovery and the storage APIs, and a downgrade to 1.2.0 fixed it. WSL could not run the emulator, and a Debian install hit errors. — [米坛社区 thread 10226](https://www.bandbbs.cn/threads/10226/)
- The emulator wrapper only drops its Qt window (`-no-window`) on Docker, WSL, Linux without a display, or CI. On macOS it uses `-qt-hide-window`, embedding the emulator in the IDE through gRPC, when the hide-window setting is on. — [emulator vvd/index.js](https://cdn.jsdelivr.net/npm/@aiot-toolkit/emulator@2.0.5/lib/vvd/index.js)
  - `aiot.emulator.hideQtWindow` defaults to `true`. — [aiot-emulator manifest](https://vela.gallerycdn.vsassets.io/extensions/vela/aiot-emulator/1.7.22/1784640239015/Microsoft.VisualStudio.Code.Manifest)
- Emulator platforms historically: Ubuntu-only in 2023. — [IT之家](https://www.ithome.com/0/732/945.htm)
  - Darwin emulator builds date from at least the v0.1.0 upload of 2024-12-27, matching aiot-core 1.6.0 (2024-12-18), which introduced the new `aiot-emulator` module. — [CDN](https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/emulator/v0.1.0/darwin-aarch64.zip), [CHANGELOG](https://vela.gallerycdn.vsassets.io/extensions/vela/aiot-core/1.7.22/1784640272242/Microsoft.VisualStudio.Services.Content.Changelog)
- Windows-only problems do not apply on a Mac: the PowerShell execution policy blocking `npm.ps1`, and openssl missing from PATH. — [CSDN Krisotopher](https://blog.csdn.net/Krisotopher/article/details/147383410), [use-ide](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html)

### Inferences
- Expected first-run friction on this Mac:
  1. the quarantine step if the standalone IDE is used; it is avoided entirely by using stock VS Code + `vela.*` extensions;
  2. installing an arm64 Node LTS;
  3. roughly 1 GB of SDK downloads from a CN-hosted CDN, which may be slow outside China;
  4. possibly npm mirror configuration.
- Native arm64 binaries exist for both the IDE and the emulator, so Rosetta should not be needed.
- The emulator listens on local ports (adb 5555/5554, gRPC, VNC 5900, debug 10055). macOS may show a firewall prompt on first launch. This is unverified.
- Toolkit regressions after extension auto-updates have happened before (2024). Pinning `aiot-toolkit` in `package.json` and noting the working extension versions is a sensible precaution.

### Gaps
- None of the 2024–2026 sources found contains a first-hand macOS or Apple Silicon report: no crash logs, no confirmation that the darwin-aarch64 emulator works on macOS 26, and nothing on whether it needs Hypervisor or other entitlements or prompts.
- Whether the IDE zip is code-signed or notarized was not checked, since the file was not downloaded. The quarantine workaround suggests it is not notarized.
- I did not find any macOS-specific trouble with file permissions in `~/.vela`, with spaces in project paths, or with the Gatekeeper status of the emulator binaries the toolkit downloads.
