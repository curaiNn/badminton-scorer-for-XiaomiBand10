# Xiaomi Smart Band 10 (小米手环10, China NFC): third-party app platform (Xiaomi Vela JS 应用 / 快应用 .rpk) and runtime capabilities for a badminton scorer

Research date: 2026-10-21. Evidence labels used below: **[OFFICIAL]** = Xiaomi Vela JS docs (iot.mi.com/vela/quickapp, 159 zh + 159 en pages fully downloaded and text-searched) or mi.com; **[COMMUNITY-B10]** = community source that targets Band 10 itself; **[OTHER-DEVICE]** = observed only on Band 8 Pro / 9 / 9 Pro / Redmi Watch / Band 10 Pro / emulator, so **not yet confirmed for Band 10**. Build/sign/install procedures are out of scope (covered by other notes).

## 1. Can Band 10 run self-developed third-party apps? Which OS and app framework, since which band model, and do NFC/non-NFC or China/global builds differ?

### Takeaway
Yes. Band 10 runs Xiaomi Vela (NuttX-based, sold under the Xiaomi HyperOS brand). Xiaomi's official "Xiaomi Vela JS 应用" docs list 小米手环 10 by name in their device tables and in each API's 支持明细 table. Many community .rpk apps target the 212×520 Band 10, including a pickleball scorer. Among bands, official support starts with Band 8 Pro (2023), then Band 9/9 Pro and Band 10. The NFC and non-NFC models differ only in hardware: the NFC chip, the buckle and, according to the community, storage size. For the user's **China** NFC model, support is the most solid. Questions about global firmware relate to the Band 10 **Pro**.

### Cited Findings
- [OFFICIAL] Definition: "Xiaomi Vela JS 应用是小米公司开发的一种应用类型，它是基于小米的物联网嵌入式软件平台 Xiaomi Vela OS 开发的". Apps are written in JavaScript with an MVVM, declarative-UI style. A project consists of manifest.json, .ux files, css, js and resources. The AIoT-IDE runs on Ubuntu, Windows and macOS and packages the app into an installable package. — [Vela JS 概述](https://iot.mi.com/vela/quickapp/zh/guide/index.html)
- [OFFICIAL] The table "搭载 Vela OS 的设备屏幕详细信息" contains the row `手环 | 小米手环10 | 胶囊形 | 1.725英寸 | 212x520 | 326 | 106 | 0.4`. The same table lists Watch S1 Pro, H1, S3, S4 sport, S4, REDMI Watch 5, Band 8 Pro, Band 9, Band 9 Pro and Watch S5. — [多屏适配](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/index.html); the English version names it "Xiaomi Smart Band 10" — [Multi-screen (EN)](https://iot.mi.com/vela/quickapp/en/guide/multi-screens/index.html)
- [OFFICIAL] Per-API support tables list these devices: 小米 S1 Pro 运动健康手表, 小米手环 8 Pro, 小米手环 9 / 9 Pro, Xiaomi Watch S3, Redmi Watch 4, 小米腕部心电血压记录仪, **小米手环 10**, Xiaomi Watch S4, REDMI Watch 5, REDMI Watch 6, Xiaomi Watch S5. — [事件 event](https://iot.mi.com/vela/quickapp/zh/features/system/event.html)
- [OFFICIAL] Band 10 rows in the 支持明细 tables:
  - **Supported:** `vibrator.vibrate` ([vibrator](https://iot.mi.com/vela/quickapp/zh/features/system/vibrator.html)), `@system.event` ([event](https://iot.mi.com/vela/quickapp/zh/features/system/event.html)), battery ([battery](https://iot.mi.com/vela/quickapp/zh/features/system/battery.html)), media queries ([媒体查询](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/media-query.html)), background-image styles ([背景图样式](https://iot.mi.com/vela/quickapp/zh/components/general/background-img-styles.html)), and the sensor's subscribePressure/subscribeAccelerometer ([sensor](https://iot.mi.com/vela/quickapp/zh/features/system/sensor.html)).
  - **Not supported:** fetch ([fetch](https://iot.mi.com/vela/quickapp/zh/features/network/fetch.html)), request, uploadtask, network, crypto, bluetooth, geolocation and record (same 支持明细 tables on the respective pages under iot.mi.com/vela/quickapp/zh/features/).
- [COMMUNITY] "2023年8月14日，小米首次将 Vela 引入到穿戴设备领域，发布了搭载 VelaOS 的小米手环8 Pro。此后推出的小米手环9、小米手环9 Pro、红米手表4、红米手表5、小米手环10等产品也都搭载了 VelaOS". The same article says "红米手环3 虽然搭载了 Vela 系统，但其并未搭载快应用引擎". — [路明笔记, 2025-08-31](https://www.luming.cool/posts/2025/08/build-a-quick-app-for-vela-devices/)
  - Conflict note: the official tables also list the earlier "小米 S1 Pro 运动健康手表" (a watch), so "first wearable" is doubtful. Band 8 Pro is the earliest **band** in the official tables ([event](https://iot.mi.com/vela/quickapp/zh/features/system/event.html)).
- [COMMUNITY-B10] Firmware and hardware:
  - "The stock Mi Band runs a Vela/NuttX-based image". SoC: BES2700iMP (BEST1503), Cortex-M33, "1.4 MB (0x160000) of contiguous on-chip SRAM", 4 MB flash. Display: RM690B0/C0 AMOLED, "≈212 × 520 visible". The repo says Band 9 and Band 10 share the SoC. — [atc1441/MiBand10-BES2700iMP-BEST1503-Hacking](https://github.com/atc1441/MiBand10-BES2700iMP-BEST1503-Hacking)
  - Band 10 firmware (codename `o66`, v3.1.16) is an OTA package of romfs partitions (misc / **quickapp** / vendor / i18n / font / system / app / watchface). Boot goes NuttX kernel → LVGL framebuffer. In the emulator, installed RPKs land in `/data/app/<package>/` and are registered in `/data/quickapp/apps.json`. — [dargon682/xiaomi-band10-vela-emulator](https://github.com/dargon682/xiaomi-band10-vela-emulator)
- [OFFICIAL] Distribution: "目前需要联系工作人员zhangyuanpu@xiaomi.com进行合作发布" — [发布](https://iot.mi.com/vela/quickapp/zh/guide/publish/index.html). Real-device installs go through 小米运动健康 →【我的】→【关于】→【Debug】→【第三方应用】. That debug-capable app is "通过商务拉群对接的方式提供". — [常见问题](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
- [COMMUNITY-B10] Examples of Band 10 apps that exist:
  - [band10-poem](https://github.com/dargon682/band10-poem) (designWidth 212)
  - [vela-band-chat](https://github.com/dargon682/vela-band-chat)
  - [MiBand10-Daily-Word-Practice](https://github.com/Bingak/MiBand10-Daily-Word-Practice) ("小米手环 10 标准版 212×520")
  - [QRWallet](https://github.com/mastermaiolo/QRWallet) (GIF "running live on Xiaomi Smart Band 10")
  - [pickleball-band](https://github.com/mahmoodw/pickleball-band), "Pickleball scoring for Xiaomi Smart Band 10", with tap scoring, long-press undo and storage plus vibration.
- [OFFICIAL] NFC vs non-NFC: "Xiaomi 手環 10 NFC內含NFC晶片，Xiaomi 手環 10沒有該晶片" and "Xiaomi 手環 10採用CD紋塑膠扣，Xiaomi 手環 10 NFC採用噴砂金屬扣". The Ceramic edition alone has a microphone hole. The FAQ mentions no app-platform difference. — [Mi HK Band 10 FAQ](https://www.mi.com/hk/support/faq/details/KA-580855/)
- [COMMUNITY-B10] Storage differs by model. The standard Band 10 has 256 MB, and "小米手环10NFC/陶瓷/耀影金可用是323M". The guide says to keep about 2× the firmware-package size free for OTA updates. — [米坛知识库](https://www.bandbbs.cn/threads/22175/). Also "标准版 256 MB / NFC 版 512 MB" — [vela-band-chat README](https://github.com/dargon682/vela-band-chat)
- [OTHER-DEVICE: Band 10 Pro] China vs global:
  - A 2026-08-07 issue reports that Smart Band 10 **Pro** (M2552B1) global firmware 3.201.016 "never answers the `THIRDPARTY_APP` (Xiaomi protobuf command type 20) service". The quick-app runtime is present ("QuickJS version 2020-11-08", `install_quickapp`) but cannot be reached. China firmware 3.101.042 "**does** ship the service" (266 vs 4 `quickapp` strings). — [atc1441 issue #3](https://github.com/atc1441/MiBand10-BES2700iMP-BEST1503-Hacking/issues/3)
  - In the same thread, a 2026-08-27 commenter disagrees: "Use astrobox can install quick app and watch face,global version is also available".
- [COMMUNITY-B10] The English-language pickleball project installs its band app "through Notify's custom-app installation flow". It reports "the Notify connection and announcements working" (firmware region not stated). — [pickleball-band](https://github.com/mahmoodw/pickleball-band)
- [OTHER-DEVICE: Band 10 Pro] "由于该设备不支持fetch…由于Vela5 特性，部分快应用使用protobuf+jsc打包将不可用" (2026-05). — [米坛: 正确使用小米手环10 Pro设备教程](https://www.bandbbs.cn/threads/25977/)

### Inferences
- For a China NFC Band 10, the platform clearly supports self-developed JS apps. The official docs cover Band 10 explicitly per API. No source suggests the NFC model behaves differently for apps; it only has more storage.
- "Official support" here means a documented framework and toolchain. There is no open store for individual developers, since publishing requires a partnership. Personal apps are therefore sideloaded (covered by other notes).
- The global-firmware problem is reported for Band 10 **Pro** only and is disputed. It does not affect the user's China device.

### Gaps
- No official page states which Vela/HyperOS version Band 10 runs (for example Vela 4.x vs 5.x). The community emulator used the `vela-miwear-watch-5.0` image as the closest base, which proves nothing about the device.
- I found no official statement on quick-app differences between the NFC and non-NFC models. The storage figures come only from the community.
- The availability of the third-party service on **global Band 10 (non-Pro)** firmware is not verified.

## 2. Band 10 display (size, resolution, shape) and how the framework handles resolution adaptation

### Takeaway
Band 10 has a 1.72-inch AMOLED (Vela docs say 1.725") at 212×520 px and 326 PPI. With DPR 2.0 that is **106 dp** wide. The screen is "pill-shaped / 胶囊形 / 跑道式" and runs at 60 Hz. CSS `px` scales relative to `manifest.config.designWidth`, which defaults to 480. Set designWidth to 212 (or the IDE-template value `"device-width"`) so that 1 px equals 1 physical pixel. `dp`, `%`, media queries (`shape: pill-shaped`, `device-type: band`, width in dp) and `device.getInfo()` give the remaining adaptation tools. The corner radius is not officially published.

### Cited Findings
- [OFFICIAL] Global spec page: "1.72-inch AMOLED Touch Display", "212 x 520 pixels", "HBM 1500 nits with auto brightness adjustment", "Haptic Motor: Linear motor", Bluetooth 5.4. — [mi.com Band 10 specs](https://www.mi.com/global/product/xiaomi-smart-band-10/specs/)
- [OFFICIAL] HK FAQ: "1.72 吋AMOLED跑道式顯示幕", 2.0 mm bezels, 73% screen-to-body ratio, 1500 nits, 60 Hz, AOD down to 5 Hz. — [Mi HK Band 10 FAQ](https://www.mi.com/hk/support/faq/details/KA-580855/)
- [OFFICIAL] Vela docs data:
  - Shape and size: 胶囊形, 1.725英寸, 212x520, PPI 326, DPR 2.0, 水平DP值 106.
  - Formulas: "DPR = 设备 PPI / 160" and "dp 数值 = 物理分辨率 / 设备像素比".
  - Sources: [媒体查询](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/media-query.html); 长宽比 0.4 in [多屏适配](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/index.html); [多屏设计](https://iot.mi.com/vela/quickapp/zh/guide/design/multi-screens.html) ("手环产品为矩形和胶囊型屏幕为主").
- [COMMUNITY] Corner radius has no official value:
  - A design-canvas guide gives "小米手环10 999px", i.e. fully rounded ends, versus 48px for Band 9 Pro. — [路明笔记](https://www.luming.cool/posts/2025/08/build-a-quick-app-for-vela-devices/)
  - The Band 10 emulator VVD uses `customLcdRadius: '90'` / `ide.lcd.radius=90`. — [xiaomi-band10-vela-emulator](https://github.com/dargon682/xiaomi-band10-vela-emulator)
  - Pickleball secondary pages "use 448 pixels of centered content height with text inset from the rounded ends". — [pickleball-band](https://github.com/mahmoodw/pickleball-band)
- [OFFICIAL] How `px` scales:
  - "px 在 Vela 应用中不表示屏幕的物理像素，而是相对于项目配置基准宽度的单位，其原理类似于rem". Set `"config": {"designWidth": N}` and write design-pixel values; for example, 168px at designWidth 336 renders as 96 physical px on a 192-wide screen. — [适配规范](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/specs.html)
  - The default designWidth is 480 when not set ("默认不填则为 480"); the docs give the conversion formula. — [页面样式与布局](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/page-style-and-layout.html)
  - "所有与大小相关的样式（例如 width、font-size）均以基准宽度（默认 480px）为基础" — [style 样式](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/index.html)
- [OFFICIAL] The manifest table types `config.designWidth` as Integer: "页面设计基准宽度，根据实际设备宽度来缩放元素大小". — [项目配置 manifest](https://iot.mi.com/vela/quickapp/zh/guide/framework/manifest.html)
- [COMMUNITY] designWidth values in practice:
  - The AIoT-IDE default template generates `"designWidth": "device-width"`. — [路明笔记](https://www.luming.cool/posts/2025/08/build-a-quick-app-for-vela-devices/)
  - A Band 10 app uses `designWidth: "device-width"` with "px 与物理像素 1:1 映射". — [MiBand10-Daily-Word-Practice](https://github.com/Bingak/MiBand10-Daily-Word-Practice)
  - The emulator README advises "`designWidth: 212` … 与手环 212px 宽度一致，布局才不错位". — [xiaomi-band10-vela-emulator](https://github.com/dargon682/xiaomi-band10-vela-emulator)
  - Band 10 projects using 212: [band10-poem manifest](https://github.com/dargon682/band10-poem/blob/HEAD/src/manifest.json), [pickleball manifest](https://github.com/mahmoodw/pickleball-band/blob/HEAD/band/src/manifest.json), [abyss-walker](https://github.com/YuanNeoMax/mi-band-vela-abyss-walker), [Senren-Banka](https://github.com/hrk666666/Senren-Banka-MiBand-10).
  - Projects using 480 (scaled down by 212/480): [vela-band-chat](https://github.com/dargon682/vela-band-chat), [habit-tracker-miband](https://github.com/paraflu/habit-tracker-miband).
- [OFFICIAL] Other units: `%` (relative to parent) and `dp` (API Level 3+), described as "固定长度单位…近似物理尺寸". — [适配规范](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/specs.html)
- [OFFICIAL] Media queries (2+, extended in 3+):
  - Syntax: `@media [type] [and|not|only] (feature)` or `@import './x.css' (feature)` (3+).
  - Features: `width/height/min-*/max-*` in dp written without units; `aspect-ratio`; `device-type` (watch | band | smartspeaker); `shape` (circle | rect | pill-shaped 3+). Operators: and / not / only / or / comma / <= >= < >.
  - Support: **小米手环 10 = 支持** (full), while Band 9 / 9 Pro = "支持2+特性".
  - Example: `@media screen and (shape: pill-shaped) {...}`.
  - Sources: [媒体查询](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/media-query.html), [适配规范](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/specs.html)
- [OFFICIAL] `device.getInfo({success(ret){…}})` returns `screenWidth`, `screenHeight`, `screenDensity` (3+, = DPR), `screenShape` (`rect` | `circle` | `pill-shaped` 3+), `deviceType` (2+: `watch` | `band` | `smartspeaker`), `APILevel` (2+), `platformVersionName/Code`, `osVersionName/Code`, `brand`, `model`, `product`, `language` and `region`. It requires `{ "name": "system.device" }`. — [设备信息 device](https://iot.mi.com/vela/quickapp/zh/features/basic/device.html)
- [OFFICIAL] The AIoT-IDE multi-screen simulator offers a "xiaomi10Band" size. However, the vela-miwear-watch-5.0/4.0 images "只支持xiaomiWatch(466*466)" and only the vela-watch-4.0 development image supports all device types. The docs warn "模拟器与真实设备之间是有性能差异的". — [IDE 多屏适配](https://iot.mi.com/vela/quickapp/zh/tools/debug/multi-screens.html)

### Inferences
- For a scorer, `designWidth: 212` (or `"device-width"`) lets CSS use physical pixels directly.
- A red/blue top-and-bottom split of roughly 212×260 px per team mirrors the pickleball app's "212 × 260 pixels" rally buttons ([pickleball-band](https://github.com/mahmoodw/pickleball-band)). Keep text away from the rounded ends; the community insets about 36 px at top and bottom.
- Leaving designWidth unset (480) silently shrinks everything to about 44% on Band 10. This explains the advice to always set it.

### Gaps
- Xiaomi publishes no official corner radius or safe-area insets for the capsule screen.
- The values `device.getInfo()` actually returns on Band 10 (APILevel, platformVersionCode) are not published anywhere I found.

## 3. Framework fundamentals: .ux structure, manifest.json, components, CSS subset, events, routing and lifecycle

### Takeaway
A Vela JS app has the layout `src/manifest.json` + `src/app.ux` + `src/pages/<name>/<name>.ux` (template, style and script in one file) + `common/` + `i18n/`. The UI is a small, Native-rendered component set: div, stack, scroll, swiper, list, text, image and form controls. The CSS dialect is flexbox-only with position relative/absolute, units px/%/dp, and only `.class`, `#id`, tag and comma selectors. Events are click, longpress, touchstart/move/end and swipe. Routing uses `@system.router` and the lifecycle uses onInit/onReady/onShow/onHide/onDestroy/onBackPress. The docs list `minAPILevel` in the manifest table, but real projects and the IDE template use `minPlatformVersion`.

### Cited Findings
- [OFFICIAL] Project structure:
  - `src/manifest.json`, `src/app.ux`, `pages/index/index.ux`, `pages/detail/detail.ux`, `i18n/*.json`, `common/` — [项目结构](https://iot.mi.com/vela/quickapp/zh/guide/framework/project-structure.html)
  - `build/`, `dist/` (rpk output) and `sign/` (certificate.pem, private.pem) — [项目概览](https://iot.mi.com/vela/quickapp/zh/guide/start/project-overview.html)
- [OFFICIAL] A page is `<template>` + `<style>` + `<script>` in one .ux file, or split into .ux/.css/.js — [项目结构](https://iot.mi.com/vela/quickapp/zh/guide/framework/project-structure.html). Coding rules from [注意事项](https://iot.mi.com/vela/quickapp/zh/guide/other/tips.html):
  - "template节点只能有一个根节点"
  - "app.ux文件中的代码，必须写到`<script></script>`中"
  - "image的src属性不要使用变量拼接"
- [OFFICIAL] Script data model: `data` or `public` / `protected` / `private` (these cannot be combined with `data`) and `computed`. Property names cannot start with `$` or `_`. — [页面数据对象](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/page-data.html)
- [OFFICIAL] manifest.json fields, all from [项目配置 manifest](https://iot.mi.com/vela/quickapp/zh/guide/framework/manifest.html):

  | Field | Doc notes |
  | --- | --- |
  | `package` | required; com.company.module |
  | `name` | required; "6 个汉字以内" |
  | `icon` | required; 192x192 |
  | `versionName` | optional |
  | `versionCode` | required integer; increment for each upload |
  | `minAPILevel` | optional, default 1 |
  | `features` | "绝大部分接口都需要在这里声明，否则不能调用" |
  | `config` | required: `logLevel`, `designWidth`, `background.features` for background running |
  | `router` | required: `entry` and `pages{ key: {component, path?, launchMode: standard\|singleTask} }` |
  | `display` | `backgroundColor`, default #ffffff |
  | `deviceTypeList` | "可选值有：watch、tv、car、phone，现只支持watch" |
  | `permissions` | e.g. `hapjs.permission.DEVICE_INFO` |

  The same page's sample manifest uses `"minPlatformVersion": 1000` instead of `minAPILevel`, an internal inconsistency in the docs.
- [COMMUNITY-B10] Real Band 10 manifests:
  - band10-poem: `"minPlatformVersion": 1000`, `"deviceTypeList": ["watch"]`, `features` system.router/app/storage/file/device/vibrator, `"designWidth": 212`, router keys like `"pages/index": {"component": "index"}`. — [band10-poem manifest](https://github.com/dargon682/band10-poem/blob/HEAD/src/manifest.json)
  - pickleball: `"minPlatformVersion": 1200`, features system.storage / system.interconnect / system.vibrator, `"designWidth": 212`, `"display": {"backgroundColor": "#071510"}`, built with `aiot-toolkit` 2.0.5. — [pickleball manifest](https://github.com/mahmoodw/pickleball-band/blob/HEAD/band/src/manifest.json)
- [COMMUNITY, unverified] Toolchain behaviour reported by a community skill guide:
  - `"deviceTypeList": ["band"]` "RPK build succeeds, but installation on device fails with `miwear_install failed: undefined`".
  - aiot-toolkit "statically scans imports. Any missing entry fails the build: `missing feature: [{ "name": "system.router" }]`… even to modules the web docs mark 'No declaration required'".
  - "aiot-toolkit 2.0.5 compiles `<style src="./index.css">` to `var $app_style$ = []`", meaning styles are silently dropped. This contradicts the official docs, which document `<style src>`.
  - Source: [paraflu/hermes-skill-xiaomi-miband10-vela-js, development-pitfalls-and-tips.md](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/HEAD/references/development-pitfalls-and-tips.md). Caution: the same guide wrongly calls bands "212dp wide", while the official figure is 106 dp, so treat it as low reliability.
- [OFFICIAL] Components ([组件](https://iot.mi.com/vela/quickapp/zh/components/index.html)):
  - Containers: div, list, list-item, scroll (2+), stack, swiper — [容器组件](https://iot.mi.com/vela/quickapp/zh/components/container/index.html)
  - Basic: text, span, a, image, image-animator (2+), progress, marquee, chart, qrcode (2+), barcode (2+) — [基础组件](https://iot.mi.com/vela/quickapp/zh/components/basic/index.html)
  - Form: input, picker, switch, slider — [表单组件](https://iot.mi.com/vela/quickapp/zh/components/form/index.html)
- [OFFICIAL] Component details:
  - `stack`: "子组件排列方式为层叠排列" — [stack](https://iot.mi.com/vela/quickapp/zh/components/container/stack.html)
  - `swiper`: attributes `index`, `indicator`, `loop`, `vertical`, `enableswipe`; events `change`, `swipestart` / `swipeend` (2+); method `swipeTo` — [swiper](https://iot.mi.com/vela/quickapp/zh/components/container/swiper.html)
  - `scroll`: `scroll-x` / `scroll-y`; vertical scrolling needs a fixed height — [scroll](https://iot.mi.com/vela/quickapp/zh/components/container/scroll.html)
  - `switch`: `checked` attribute, `change` event `{checked}`, styles `thumb-color` / `track-color` — [switch](https://iot.mi.com/vela/quickapp/zh/components/form/switch.html)
  - `input`: `type` limited to `button | checkbox | radio`, so there is no text entry — [input](https://iot.mi.com/vela/quickapp/zh/components/form/input.html)
- [OFFICIAL] Custom components: "由于自定义组件拥有独立的ViewModel，因此存在一定内存开销，在手表手环等轻量级设备上不建议使用" — [自定义组件](https://iot.mi.com/vela/quickapp/zh/guide/framework/template/component.html). The build flag `--enable-custom-component` defaults to false — [编译参数](https://iot.mi.com/vela/quickapp/zh/guide/start/toolkit-params.html)
- [OFFICIAL] CSS subset, from [通用样式](https://iot.mi.com/vela/quickapp/zh/components/general/style.html):
  - `display: flex | none` only ("JS 应用只支持 flex 布局").
  - flex / flex-grow / shrink / basis / direction (default `row`) / align-items / justify-content, effective when the parent is div or list-item.
  - `position: absolute | relative` (default relative; "父容器为<list>、<swiper>时不生效"); `left/top/right/bottom` support px but "暂不支持百分比".
  - width/height/min/max, padding, margin, border (style solid only), `border-radius`, background-color, color, background-image / size / position, `background-repeat` "[暂不支持]", `box-shadow` (3+), opacity, visibility.
  - **`border-radius`** "设置时需要同时设置 border-width、border-color".
- [OFFICIAL] Further CSS rules:
  - Box model is border-box only; units are px, %, dp (3+) — [页面样式与布局](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/page-style-and-layout.html)
  - Selectors: `.class`, `#id`, `tag` and `,` only. Descendant, child, sibling, pseudo-class (:active etc.), pseudo-element, attribute, `*` and `.a.b` are all unsupported. Priority is inline > #id > .class > tag. less/sass precompilation and `<style src>` / `@import` are supported. — [style 样式](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/index.html)
- [OFFICIAL] `text` styles: `font-size` default 30px; `color` default `rgba(0, 0, 0, 0.54)`; `font-weight` "当前平台仅支持normal与bold两种效果…低于550为前者"; `lines`, `text-overflow`, `text-align`, `line-height`, `text-decoration`, `font-style`. Child components: only `<span>`. — [text](https://iot.mi.com/vela/quickapp/zh/components/basic/text.html)
  - A full-text search of all zh and en doc pages found **no** `font-family` / `@font-face`, so custom fonts are undocumented.
- [COMMUNITY] Real-device lessons:
  - "渐变不支持". "交互元素一律 flex 流式布局 + 每个元素独立原生 `onclick`；不要绝对定位放按钮、不要自己算触摸坐标". "文字必须包在 `<text>` 里". "滚动用 `<scroll scroll-y="true">` + 显式高度". These come from Band 9 Pro testing [OTHER-DEVICE]. — [band-metronome](https://github.com/q879604/band-metronome)
  - Gradient `background` from design tools may be unsupported; use `background-color`. — [路明笔记](https://www.luming.cool/posts/2025/08/build-a-quick-app-for-vela-devices/)
- [OFFICIAL] Events, all bound with `onxxx` or `@xxx` — [通用事件](https://iot.mi.com/vela/quickapp/zh/components/general/events.html):
  - `touchstart` / `touchmove` / `touchend` (TouchEvent with `touches` / `changedTouches` holding identifier, clientX/Y, pageX/Y, offsetX/Y)
  - `click` and `longpress` (MouseEvent with the same coordinates)
  - `swipe` (`{direction: left|right|up|down}`, "滑动方向有滚动条时不触发该事件", **does not bubble**). The others bubble.
- [OFFICIAL] Handlers can take template arguments, e.g. `onclick="handle($idx,$item)"`, and "回调函数被调用时，会在参数列表末尾自动添加一个evt参数". — [事件绑定](https://iot.mi.com/vela/quickapp/zh/guide/framework/template/event.html)
- [COMMUNITY-B10] Code comment from the Band 10 scorer: "Native longpress may be followed by click on release. Consume this entire touch until the next touchstart". It uses `onclick="badgeSpeak" onlongpress="badgeUndo"` on the same element. — [pickleball game.ux](https://github.com/mahmoodw/pickleball-band/blob/HEAD/band/src/pages/game/game.ux)
- [OFFICIAL] Routing with `import router from '@system.router'` — [页面路由](https://iot.mi.com/vela/quickapp/zh/features/basic/router.html):
  - `router.push({uri, params})`: uri is a "/path", a page name, a full schema uri, or "/" for the home page. Params arrive as strings on `protected` / `public` props, and `params.___PARAM_LAUNCH_FLAG___: 'clearTask'` is supported.
  - `router.replace({uri, params})`, `router.back({path?})`, `router.clear()`, `router.getLength()`, `router.getState()` → `{index, name, path}`, `router.getPages()`.
  - The doc header says "接口声明: 无需声明", but the official tutorial declares `{ "name": "system.router" }` in features — [添加交互](https://iot.mi.com/vela/quickapp/zh/guide/start/add-interactivity.html)
- [OFFICIAL] Lifecycle — [生命周期](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/lifecycle.html):
  - Page hooks: `onInit` (data ready), `onReady` (template compiled; `this.$element(id)` usable), `onShow`, `onHide`, `onDestroy` ("用户从当前页面返回到上一页，或者用户打开了太多的页面，框架自动销毁掉部分页面"), `onBackPress`, `onRefresh(query)` (singleTask / clearTask), `onConfigurationChanged(evt)` (type `locale`).
  - App hooks in app.ux: `onCreate`, `onShow`, `onHide`, `onDestroy`, `onError(e)`. Pages reach app data and methods via `this.$app.$def`.
  - "setTimeout之类的异步操作绑定在了当前页面上，因此当页面销毁之后异步调用不会执行". `this.$valid` reports whether the page is alive.
- [OFFICIAL] Global helpers: `this.$app.exit()` ("退出 JS 应用"), `this.$page` {name, path, component}, `this.$element(id)`, `this.$watch(data, handler)`, `this.$nextTick(fn)`, and `this.$canIUse('@system.x.method' | 'component.attr.name')` (3+). — [全局属性和方法](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/global-data-method.html)
- [OFFICIAL] File URIs: `/path` for read-only app resources, `internal://cache/`, `internal://files/` ("用于存储较小的永久文件"), `internal://mass/` and `internal://tmp/` (read-only). — [项目结构](https://iot.mi.com/vela/quickapp/zh/guide/framework/project-structure.html)

### Inferences
- Everything the scorer needs fits the documented subset:
  - Score page: a flex column of two big `div`s (red and blue) with `onclick`, plus a large `<text>` for each score.
  - Undo: a `longpress` or a small undo button, wrapped in a guard against the longpress-then-click double fire.
  - Settings page: `switch` controls for vibration, and either `input type="radio"`, a `switch` or two tappable `div`s for the 21 vs 15 rule.
  - Navigation: `router.push` to settings and `router.back` to return.
- Explicitly set `color` on every text. The default text color is dark gray (`rgba(0,0,0,0.54)`), which is nearly invisible on a black AMOLED background.
- Big digits use the system font in bold. Custom typefaces are not documented, so pre-rendered PNG digits are the only reliable route to a custom digit style.

### Gaps
- There is no official changelog that maps device firmware to API Level, and none states which `minPlatformVersion` values each device accepts.
- The exact longpress threshold and click timing on Band 10 are undocumented.

## 4. Screen-off / wrist-down behaviour, keep-screen-on API, and the system swipe-right-back gesture

### Takeaway
Officially, apps stop running in the background unless they use audio, request or geolocation, and none of these are usable for a scorer on Band 10. The docs say that re-waking the screen re-fires `onShow`, which implies the page instance survives screen-off. Community reports say JS timers and execution pause while the screen is off. Whether Band 10 shows the watch face or the app on re-wake is **not documented** for third-party apps.

`@system.brightness.setKeepScreenOn({keepScreenOn:true})` exists without a per-device table, and a Band 10 app uses it. The system also offers a user setting "持续亮屏" (5–20 min) and a screen timeout of 5 s–5 min. The system back gesture (swipe right from the left edge) is delivered to the page's `onBackPress`, and returning `true` intercepts it.

### Cited Findings
- [OFFICIAL] "为了节省系统资源，通常情况下，应用切换到后台后将会停止运行，等到再次切换回前台时重新运行". Background running works only if declared under `config.background.features` and only for `system.audio`, `system.request` or `system.geolocation`. — [后台运行](https://iot.mi.com/vela/quickapp/zh/guide/framework/other/background-running.html). On Band 10, request and geolocation are "不支持" — [request](https://iot.mi.com/vela/quickapp/zh/features/network/request.html), [geolocation](https://iot.mi.com/vela/quickapp/zh/features/system/geolocation.html)
- [OFFICIAL] "息屏后重新亮屏会重新触发onShow生命周期函数，此生命周期函数中如果有fetch请求，亮屏时会再次发起请求，需谨慎使用" — [注意事项](https://iot.mi.com/vela/quickapp/zh/guide/other/tips.html)
- [COMMUNITY] On bandbbs (2025-11), one user wrote "从表面上看，熄屏时程序是会暂停执行的". They later added "最近发现其实是有后台能力的 参见环10的腕管Pro 离腕锁定即可触发… 但目前只见过这一个有后台能力". — [米坛: 关于vela快应用是否有后台能力？](https://www.bandbbs.cn/threads/9878/)
- [OTHER-DEVICE: Band 9 Pro] "快应用退到后台 / 息屏后 JS 计时器会被系统挂起 → 息屏后节拍基本不会继续". Their workaround: "最低亮度：启动即 `setValue(1)` + `setMode(0)` + `setKeepScreenOn(true)`", plus "离开页面 / 停止 / 页面销毁一律还原亮度与常亮状态". — [band-metronome](https://github.com/q879604/band-metronome)
- [OFFICIAL] Band 10 system settings, from the [Mi HK Band 10 FAQ](https://www.mi.com/hk/support/faq/details/KA-580855/):
  - Auto-lock (待機時間) "默認自動鎖定時間為5秒", selectable 5 s / 10 s / 20 s / 30 s / 1 min / 5 min under [設定] >> [顯示與亮度] >> [待機時間].
  - "持續亮熒幕" offers 5 / 10 / 15 / 20 min, with "啟用此功能會顯著增加功耗".
  - Wake methods: "點擊螢幕和向上滑動", plus raise-to-wake (抬腕點亮熒幕) and 遮蓋待機 (cover to turn off).
- [OFFICIAL] The same FAQ describes the photo watch face changing "從其他介面返回主介面（息屏進入主介面，抬腕進入主介面）". This suggests the system UI returns to the main screen after screen-off, but it does not discuss third-party apps. — [Mi HK Band 10 FAQ](https://www.mi.com/hk/support/faq/details/KA-580855/)
- [OFFICIAL] `@system.brightness` (declare `{ "name": "system.brightness" }`) — [屏幕亮度 brightness](https://iot.mi.com/vela/quickapp/zh/features/system/brightness.html):
  - `getValue({success({value 0-255})})`, `setValue({value: 0-255})`, `getMode` / `setMode({mode: 0 manual | 1 auto})`.
  - **`setKeepScreenOn({keepScreenOn: Boolean, success, fail, complete})`** "设置是否保持常亮状态".
  - The page has **no** 支持明细 table (en page identical: [brightness EN](https://iot.mi.com/vela/quickapp/en/features/system/brightness.html)).
- [COMMUNITY-B10] The Band 10 standard word app restores and toggles keep-screen-on. It calls `brightness.setKeepScreenOn({keepScreenOn: this.keepScreenOn, fail: …})` in `onInit` from a stored flag and also from a settings `switch`, with a fail toast "设置失败，请重试". The README says "屏幕常亮：设置页可开启，刷词时不怕中途熄屏". — [MiBand10-Daily-Word-Practice](https://github.com/Bingak/MiBand10-Daily-Word-Practice)
- [OTHER-DEVICE] Keep-screen-on is also used in a Band 9 Pro game's settings ("屏幕常亮") ([tinyshadows-band](https://github.com/mcpotato1123/tinyshadows-band)) and in a watch app, "前台运行时保持屏幕常亮…切到后台会停定时器和定位订阅" ([Hrt-for-Vela](https://github.com/HaohanHe/Hrt-for-Vela)).
- [OFFICIAL] Band 10 gestures: "從主螢幕底部向上滑動打開應用列表", "在主螢幕上向右滑動打開控制中心", "在任何其他頁面從左邊緣向右滑動返回上一螢幕". — [Mi HK Band 10 FAQ](https://www.mi.com/hk/support/faq/details/KA-580855/)
- [OFFICIAL] `onBackPress()` "当用户右滑返回或点击返回实体按键时触发该事件。如果事件响应方法最后返回true表示不返回，自己处理业务逻辑（完毕后开发者自行调用 API 返回）；否则…遵循系统逻辑：返回到上一页". — [生命周期](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/lifecycle.html)
- [COMMUNITY-B10] QRWallet (Band 9 & 10) intercepts back with `onBackPress() { this.routeBack(); return true }`, where `routeBack()` calls `vibrator.vibrate({ mode: "short" })` and then `router.back()`. — [QRWallet qrcode.ux](https://github.com/mastermaiolo/QRWallet/blob/HEAD/src/pages/qrcode/qrcode.ux)
- [OFFICIAL] `swiper` has `enableswipe` ("是否支持手势滑动swiper"). The general `swipe` event fires on fast swipes and does not bubble. — [swiper](https://iot.mi.com/vela/quickapp/zh/components/container/swiper.html), [通用事件](https://iot.mi.com/vela/quickapp/zh/components/general/events.html)
- [COMMUNITY-B10] "A native band workout still prevents opening Pickleball". The authors also note "real-device touch behavior and Bluetooth latency still need checking". — [pickleball-band](https://github.com/mahmoodw/pickleball-band)

### Inferences
- Do not rely on in-app timers or background execution. Persist the full match state, including the undo stack, with `storage.set` on every point, as the Band 10 pickleball scorer does ("Each update is saved on the band before transmission"). Restore it in `onInit`/`onShow`, so a relaunch or a return from the watch face resumes the match.
- Call `brightness.setKeepScreenOn({keepScreenOn: true})` in the score page's `onShow` when the setting is enabled, and `false` in `onHide`/`onDestroy`. Handle `fail` gracefully. The user's system-level "持续亮熒幕" (≤20 min) and longer 待機時間 (≤5 min) are fallbacks.
- On the score page, intercept `onBackPress` (return `true`) to ask for confirmation or to route explicitly. Avoid horizontal `swipe` gestures that compete with the left-edge back swipe.
- Users who start the band's built-in badminton workout may be unable to open a third-party scorer at the same time. This is a single Band 10 report.

### Gaps
- It is undocumented whether, on Band 10, a foreground third-party app is still displayed after the screen times out and is woken again, or whether the band returns to the watch face. Any time threshold is also unknown. This needs a real-device test.
- No official per-device confirmation exists that `setKeepScreenOn` is honored on Band 10. Only community usage is known, and none of it states the success callback was actually observed.
- It is unknown whether returning `true` from `onBackPress` on the **entry** page blocks app exit on Band 10, and whether the left-edge gesture can be fully intercepted. Also unknown is what happens to keep-screen-on when the app is backgrounded.

## 5. APIs needed for the scorer (haptics, persistence, toast, exit, etc.), with exact signatures and Band 10 availability

### Takeaway
All required capabilities exist and are documented:
- **Haptics:** `@system.vibrator.vibrate({mode:'short'|'long'})`, officially supported on Band 10. `start`/`stop`/`getSystemDefaultMode` are **not** available on Band 10, and there is no intensity or duration control.
- **Persistence:** `@system.storage` (async string key-value: get/set/delete/clear), with `@system.file` as an alternative.
- **Toast:** `@system.prompt.showToast`.
- **Exit:** `@system.app.terminate()` or `this.$app.exit()`.
- **Device info:** `@system.device.getInfo`.
- **Keep screen on:** `@system.brightness.setKeepScreenOn`.
- **Feature detection:** `$canIUse` at runtime.

### Cited Findings
- [OFFICIAL] Vibrator (declare `{ "name": "system.vibrator" }`; `import vibrator from '@system.vibrator'`) — [振动 vibrator](https://iot.mi.com/vela/quickapp/zh/features/system/vibrator.html):
  - `vibrator.vibrate({mode})`: "mode | String | 否 | 振动模式，"long"表示长振动，"short"表示短振动。默认为 long".
  - `vibrator.start({duration, interval, count, success({id}), fail, complete})` with error codes 205 任务已存在 and 202 参数错误; `vibrator.stop(id)` → Boolean; `vibrator.getSystemDefaultMode()` → 0 关闭 / 1 标准 / 2 加强.
  - **Support table:** `vibrate` is supported on 小米手环 10 (and on 8 Pro, 9/9 Pro, Redmi Watch 4, Watch H1/S3/S4/S5, REDMI Watch 5/6, S1 Pro). `start`, `stop` and `getSystemDefaultMode` are supported only on Xiaomi Watch S5; 小米手环 10 is listed under 不支持设备产品.
- [OFFICIAL] Band 10 hardware: "Haptic Motor: Linear motor". — [mi.com Band 10 specs](https://www.mi.com/global/product/xiaomi-smart-band-10/specs/)
- [OTHER-DEVICE: Band 9 Pro] "Vela 的 `@system.vibrator` 只开放系统级强度：`getSystemDefaultMode()` …只读不能写，没有 per-app 强度或振幅参数". "手环 9 Pro 只有这一条路（系统长/短两档）". — [band-metronome](https://github.com/q879604/band-metronome)
- [COMMUNITY-B10] Band 10 apps use tap haptics, e.g. `try { vibrator.vibrate({mode: 'short'}); } catch (_) {}` after a successful save in the pickleball scorer ([game.ux](https://github.com/mahmoodw/pickleball-band/blob/HEAD/band/src/pages/game/game.ux)) and `vibrator.vibrate({ mode: 'short' })` in a habit tracker ([habit-tracker-miband](https://github.com/paraflu/habit-tracker-miband)). One Band 10 game passes an undocumented `vibrator.vibrate({ duration: … })` ([abyss-walker](https://github.com/YuanNeoMax/mi-band-vela-abyss-walker)); that parameter is not in the docs.
- [OFFICIAL] Storage (declare `{ "name": "system.storage" }`; `import storage from '@system.storage'`) — [数据存储 storage](https://iot.mi.com/vela/quickapp/zh/features/data/storage.html):
  - `storage.get({key, default?, success, fail, complete})`: "如果 key 不存在，返回 default。如果 default 未指定，返回长度为 0 的空字符串"; "success 返回值：key 对应的存储内容".
  - `storage.set({key, value?, success, fail, complete})`: "如果新值是长度为 0 的空字符串，会删除以 key 为索引的数据项".
  - `storage.clear({success, fail, complete})` and `storage.delete({key, success, fail, complete})`.
  - The page has no per-device table and no size limits.
- [COMMUNITY-B10] The Band 10 scorer stores JSON: `storage.get({key: 'pickleball.game.v1', default: '', success: value => {…}})` and `storage.set({key: 'pickleball.game.v1', value: JSON.stringify(next), success: …, fail: …})`. It also keeps "Up to 100 changes" of undo history. — [pickleball-band](https://github.com/mahmoodw/pickleball-band)
- [COMMUNITY] "`storage.get` success receives the value string directly". Defensive read: `(data && typeof data === 'object') ? data.value : data`. — [hermes skill guide](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/HEAD/references/development-pitfalls-and-tips.md)
- [OFFICIAL] The file API is an alternative store for larger data: `file.writeText({uri: 'internal://files/…', text, success, fail})`, `readText`, `writeArrayBuffer`, `readArrayBuffer`, `list`, `get`, `delete`, `access`, `mkdir`, `rmdir`, `move`, `copy`. It warns "请务必注意及时清理无用的文件，特别是在 IoT 设备内存较小的情况下". — [文件存储 file](https://iot.mi.com/vela/quickapp/zh/features/data/file.html)
- [OFFICIAL] Prompt (declare `{ "name": "system.prompt" }`): `prompt.showToast({message: String (必填), duration?: Number})`, "默认值1500，建议区间：1500-10000". This is the **only** documented method. — [弹窗 prompt](https://iot.mi.com/vela/quickapp/zh/features/other/prompt.html). A Band 10 community app calls `prompt.showDialog(...)` ([MiBand10-Daily-Word-Practice](https://github.com/Bingak/MiBand10-Daily-Word-Practice)), but showDialog appears nowhere in the zh or en docs.
- [OFFICIAL] App (no declaration needed; `import app from '@system.app'`) — [应用上下文 app](https://iot.mi.com/vela/quickapp/zh/features/basic/app.html):
  - `app.getInfo()` → {packageName, icon, name, versionName, versionCode, logLevel, source}.
  - `app.terminate()` "退出当前应用".
  - `app.canIUse('@system.router.push')` (3+). `app.loadLibrary(name)` requires a vendor partnership.
- [OFFICIAL] Equivalent in-page exit: `this.$app.exit()`. — [全局属性和方法](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/global-data-method.html)
- [OFFICIAL] Device: `device.getInfo({success, fail, complete})` (fields in Q2). `getDeviceId` and `getSerial` need permission `hapjs.permission.DEVICE_INFO`. `getTotalStorage` and `getAvailableStorage` return bytes. — [设备信息 device](https://iot.mi.com/vela/quickapp/zh/features/basic/device.html)
- [OFFICIAL] `@system.event` (APILevel 4, **supported on Band 10**) offers `event.subscribe({eventName, callback})` for `usual.event.BATTERY_CHANGED`, `DISCHARGING` and `CHARGING`. — [事件 event](https://iot.mi.com/vela/quickapp/zh/features/system/event.html)
- [OFFICIAL] Runtime capability check: `this.$canIUse('@system.vibrator.vibrate')` (3+). — [全局属性和方法](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/global-data-method.html). Community note: "`$canIUse` / `app.canIUse` require the `@` prefix… Without `@` the check returns false" — [hermes skill guide](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/HEAD/references/development-pitfalls-and-tips.md)
- [OFFICIAL] Not available on Band 10 (支持明细 = 不支持): `@system.fetch`, request, uploadtask, network, crypto, bluetooth, geolocation, record. — [fetch](https://iot.mi.com/vela/quickapp/zh/features/network/fetch.html), [network](https://iot.mi.com/vela/quickapp/zh/features/system/network.html), [crypto](https://iot.mi.com/vela/quickapp/zh/features/security/crypto.html), [bluetooth](https://iot.mi.com/vela/quickapp/zh/features/system/bluetooth.html), [record](https://iot.mi.com/vela/quickapp/zh/features/system/record.html)

### Inferences
- The tap feedback is `vibrator.vibrate({mode: 'short'})`, wrapped in `try/catch` and gated by an app-level "震动开关" stored in `@system.storage`. The system vibration-strength setting cannot be read on Band 10, because `getSystemDefaultMode` is unsupported.
- Store settings and match state as JSON strings under one or two keys, for example `settings.v1` = {rule: 21|15, vibrate: bool} and `match.v1` = {red, blue, history[], …}. Writes are async, so serialise them; the pickleball scorer uses a `busy` flag.
- No network or crypto APIs are needed, so Band 10's unsupported APIs do not matter for this app.

### Gaps
- The real duration and strength of `'short'` vs `'long'` on Band 10 are undocumented. So is the behaviour when `vibrate` is called rapidly (queued, dropped or overlapping).
- No storage quota, maximum key or value length, or write-durability guarantee is documented.
- It is not documented whether `app.terminate()` and `this.$app.exit()` behave differently on Band 10.

## 6. Platform limits: rpk size, JS memory, max pages, image formats, performance guidance, and the API level / minPlatformVersion to target

### Takeaway
Xiaomi publishes **no** hard limits for rpk size, JS heap or page count. It publishes guidance instead: memory hygiene, first-page render (FMP) ≤ 2000 ms, few pages, small PNG/JPG images, and no custom components. Community data points: an ~8 MB rpk ran on Band 9 Pro; very large embedded data rebooted Band 10 during install; jsc bytecode builds black-screen on Band 10. `minPlatformVersion` values of 1000, 1100 and 1200 all appear in working Band 10 projects. Band 10 supports API Level 4 features. A badminton scorer is orders of magnitude below any reported limit.

### Cited Findings
- [OFFICIAL] A text search of all 159 zh doc pages for MB/KB/上限/大小限制/最多 found only protobuf limits ("单个 .desc 文件大小 64KB", "单次 decode/encode 数据大小 128KB"). There are no rpk, heap or page limits. — [protobuf](https://iot.mi.com/vela/quickapp/zh/features/other/protobuf.html)
- [OFFICIAL] Memory guidance ("由于运动手表整体内存较小，对于三方应用内存占用量要求比较高") — [内存优化](https://iot.mi.com/vela/quickapp/zh/guide/best-practice/memory.html):
  - Keep non-UI data out of the ViewModel, update objects in place, and do not cache page methods globally.
  - Clear timers in `onDestroy`, null out file and storage data after use, and call `global.runGC()` (not too often).
  - Use the `static` / `attr.static` template attributes and `<block static>`.
  - Reduce dependencies, use low-resolution images, and "尽可能减少页面数量".
  - Example (QQ音乐): "最大内存" went from 4842844 to 3295928 to 1872528 after optimisation (unit not stated; most plausibly bytes, i.e. about 4.8 MB to 1.9 MB).
- [OFFICIAL] Acceptance: "快应用首页渲染完成时间（FMP）≤2000ms". — [验收标准](https://iot.mi.com/vela/quickapp/zh/guide/publish/acceptance-criteria.html)
- [OFFICIAL] Page lifecycle: "用户打开了太多的页面，框架自动销毁掉部分页面" (no number given). — [生命周期](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/lifecycle.html). "列表使用分页，每一页保持在20个item以内比较好" — [注意事项](https://iot.mi.com/vela/quickapp/zh/guide/other/tips.html)
- [OFFICIAL] Images: "支持的图片格式包括png，jpg" — [image](https://iot.mi.com/vela/quickapp/zh/components/basic/image.html). For large (>100kb) dynamic images, cache them to `internal://files/` and keep image dimensions within the screen size — [启动时延优化](https://iot.mi.com/vela/quickapp/zh/guide/best-practice/start.html). Xiaomi's AI code-generation workflow enforces "图片仅 PNG，禁止 SVG" — [AI 自动化生成](https://iot.mi.com/vela/quickapp/zh/tools/dev/official-site-tutorial.html)
- [OFFICIAL] Build flags `--enable-jsc` ("将 js 文件将转换为 jsc 文件"), `--enable-protobuf` and `--enable-custom-component` all default to `false`. — [编译参数](https://iot.mi.com/vela/quickapp/zh/guide/start/toolkit-params.html)
- [COMMUNITY-B10] "Bypasses the `--enable-jsc` bytecode compiler flag that causes black-screen crashes on HyperOS 2 / Band 10". Troubleshooting entry: "Black screen on launch | Bytecode compilation enabled". — [QRWallet README](https://github.com/mastermaiolo/QRWallet)
- [OTHER-DEVICE: Band 10 Pro] "由于Vela5 特性，部分快应用使用protobuf+jsc打包将不可用". — [米坛 10 Pro 教程](https://www.bandbbs.cn/threads/25977/)
- [COMMUNITY-B10] Size limits observed on Band 10 by the word-practice app — [MiBand10-Daily-Word-Practice](https://github.com/Bingak/MiBand10-Daily-Word-Practice):
  - "修复内置 6000 词库时**安装导致设备重启**的问题（分片 + 字符串化 + 惰性加载）".
  - 5809 words measured at "常驻约 382 KB 字符串".
  - "20000 词以上：受 rpk 包体与安装期解压内存限制，不建议".
- [OTHER-DEVICE: Band 9 Pro] A Band 9 Pro game reports its product as `dist/com.tinyshadows.band.debug.2.5.2.rpk 8.04 MB`. — [tinyshadows-band](https://github.com/mcpotato1123/tinyshadows-band)
- [COMMUNITY, unverified and conflicting] Memory and partition figures:
  - "内存 约 16 MB … 快应用分区约 8 MB" — [vela-band-chat README](https://github.com/dargon682/vela-band-chat)
  - "CPU/RAM | ARM low-power, ~64 MB RAM" — [hermes SKILL.md](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/HEAD/SKILL.md)
  - Neither gives a measurement method.
  - Hardware fact: the SoC has "1.4 MB (0x160000) of contiguous on-chip SRAM" plus PSRAM clocks; the PSRAM size was not stated in the section read. — [atc1441 SDK](https://github.com/atc1441/MiBand10-BES2700iMP-BEST1503-Hacking)
- [OFFICIAL] API levels, from [APILevel](https://iot.mi.com/vela/quickapp/zh/guide/version/index.html) ("文档中所有接口是默认属于 APILevel 1"):
  - **APILevel2:** media query `shape`, barcode, qrcode, image-animator, scroll, `getBoundingClientRect`, swiper swipestart/swipeend, device `deviceType` / `APILevel` — [APILevel2](https://iot.mi.com/vela/quickapp/zh/guide/version/APILevel2.html)
  - **APILevel3:** box-shadow, `$canIUse`, scroll snap, `@system.uploadtask`, `app.canIUse`, device `screenDensity`, `pill-shaped`, extended media queries, `dp` unit — [APILevel3](https://iot.mi.com/vela/quickapp/zh/guide/version/APILevel3.html)
  - **APILevel4:** `@system.event` — [APILevel4](https://iot.mi.com/vela/quickapp/zh/guide/version/APILevel4.html)
- [OFFICIAL] Band 10 is marked 支持 for `@system.event` (APILevel 4) and for media queries without the "2+ only" restriction that applies to Band 9. — [event](https://iot.mi.com/vela/quickapp/zh/features/system/event.html), [媒体查询](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/media-query.html)
- [OFFICIAL] The manifest table documents `minAPILevel` (default 1; "如果不填按照内测版本处理"), while the same page's sample uses `"minPlatformVersion": 1000`. — [项目配置](https://iot.mi.com/vela/quickapp/zh/guide/framework/manifest.html)
- [COMMUNITY] The IDE template uses `"minPlatformVersion": 1000` — [路明笔记](https://www.luming.cool/posts/2025/08/build-a-quick-app-for-vela-devices/). Values observed in Band 10 projects:
  - 1000: [band10-poem](https://github.com/dargon682/band10-poem/blob/HEAD/src/manifest.json), [Senren-Banka](https://github.com/hrk666666/Senren-Banka-MiBand-10)
  - 1100: a bandbbs e-book rpk run in the Band 10 emulator ([emulator README](https://github.com/dargon682/xiaomi-band10-vela-emulator)) and [abyss-walker](https://github.com/YuanNeoMax/mi-band-vela-abyss-walker)
  - 1200: [pickleball](https://github.com/mahmoodw/pickleball-band/blob/HEAD/band/src/manifest.json), [Daily-Word-Practice](https://github.com/Bingak/MiBand10-Daily-Word-Practice), [habit-tracker](https://github.com/paraflu/habit-tracker-miband)
  - A community guide recommends "`1100` for band devices" and "Do not write [minAPILevel]; let aiot-toolkit handle it" — [hermes guide](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/HEAD/references/development-pitfalls-and-tips.md)
- [COMMUNITY-B10] Usable storage: "小米手环10NFC/陶瓷/耀影金可用是323M", and keep about 2× the firmware-package size (Band 10 NFC firmware package ≈48 MB) free for updates. — [米坛知识库](https://www.bandbbs.cn/threads/22175/)

### Inferences
- The target is Band 10 with features up to API Level 4. A scorer needs nothing beyond API Level 1–3 (flex, text, div, swiper/scroll optional, storage, vibrator, brightness, router). Use `minPlatformVersion` 1000–1200 as in working Band 10 projects, omit `minAPILevel`, and keep `deviceTypeList: ["watch"]`.
- Expected footprint: 2 pages (score and settings) and a few KB of JS. Images are optional; use PNG digits only if the system font is inadequate. This is far below every reported failure point (multi-MB packages, hundreds of KB of resident strings).
- Build without `--enable-jsc` / `--enable-protobuf`, given the reported Band 10 black screens.

### Gaps
- There is no official rpk size limit, JS heap or RAM figure, per-app storage quota, maximum page-stack depth or maximum number of installed apps for Band 10. The community figures (16 MB vs 64 MB RAM; an 8 MB quick-app partition) conflict and are unverified.
- The bandbbs thread titled "快应用可能最多安装20个" (Band 8 Pro era, 2023) was seen only as a related-thread title, and its content was not verified.
- Which `minPlatformVersion` values Band 10 firmware rejects, if any, is untested in any source.
