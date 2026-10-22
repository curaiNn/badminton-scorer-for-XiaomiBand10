# Installing a self-built Vela JS app (.rpk) on a Xiaomi Smart Band 10 NFC (China version): real-device install routes (as of October 2026)

Scope note: this file covers how to get an already-built `.rpk` onto a real Band 10 NFC that is currently paired with 小米运动健康 (Mi Fitness China, package `com.mi.health`). It does not cover how to write or build the app. Research date: 2026-10-21. Each finding says whether it is confirmed for **Band 10 (non-Pro)** or comes only from Band 8/9 or Band 10 Pro.

Main sources:
- Official Xiaomi Vela docs on iot.mi.com
- Xiaomi HyperOS developer platform (dev.mi.com)
- AstroBox-NG GitHub repo, releases and issues, and its App Store listing
- 米坛社区 (bandbbs.cn) forum threads and its knowledge-base wiki (wiki.bandbbs.cn)
- Gadgetbridge docs, source and Codeberg issues
- Assorted GitHub community projects

---

## 1. Official developer routes: can a developer push or install a debug build on a real band?

### Takeaway
No. A developer without a business relationship with Xiaomi has no official way to install a self-built .rpk on a retail Band 10.
- **AIoT-IDE real-device debugging** works only on the Xiaomi Watch S4, is open only to specific partners, and needs special debug firmware.
- **The "Debug → 第三方应用 → Install third app" page in 小米运动健康** exists only in a test build of the app, which Xiaomi hands out through business contact (商务对接).
- No QR-code flow, public developer mode, or "register a developer device" program was found.

### Cited Findings
- The official real-device debugging page says "目前真机调试只支持 `Xiaomi Watch S4` 设备" and "目前真机调试仅对特定合作方开放". — [Vela docs: 真机调试 功能介绍](https://iot.mi.com/vela/quickapp/zh/tools/devicedebug/start.html)
- The prerequisites on that page are:
  - Ask Xiaomi staff for the 《小米Vela设备真机调试全流程指南》 document.
  - Flash the watch with a debug-capable OTA firmware. The page warns "升级固件存在一定风险".
  - "请使用测试版小米运动健康，连接测试用机".
  - Keep the PC and the phone on the same LAN.
  
  — [Vela docs: 真机调试](https://iot.mi.com/vela/quickapp/zh/tools/devicedebug/start.html)
- The documented flow:
  1. Open a "debug-app" on the watch; it shows "等待IDE连接".
  2. Enter the device ID in AIoT-IDE's real-device panel and connect.
  3. Click debug; the app opens on the watch.
  4. Use "获取日志" to pull logs, or push another rpk.
  
  Hot reload is not supported ("不支持热更新"). The page does not mention iOS, the transport used, or any band models. — [Vela docs: 真机调试](https://iot.mi.com/vela/quickapp/zh/tools/devicedebug/start.html)
- The official FAQ answers "如何将rpk上传到手表真机运行?" with this path: 小米运动健康 → 我的 → 关于 → Debug → 第三方应用 → (输入包名) → Install third app → pick the local rpk, followed by a success toast. It adds that this 小米运动健康 build "目前是通过商务拉群对接的方式提供", and that Vela third-party development requests go by email to 常健 (changjian@xiaomi.com). — [Vela docs: 常见问题](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
- The same FAQ covers signing and logs:
  - Release rpks should keep one certificate ("如果证书改变，可能无法上架").
  - If the band app talks to a phone app, both must be signed with the same certificate, or the band rejects the communication.
  - Firmware logs can be pulled through Debug → 拉取固件日志 into `/sdcard/Android/data/com.mi.health/files/log`.
  
  — [Vela docs: 常见问题](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
- The Vela guide's table of contents covers the simulator ("AIoT-IDE提供内置的模拟器"), packaging, and a 发布 section. Its sidebar has no self-service real-device or developer-device-registration section. — [Vela docs: 教程 index](https://iot.mi.com/vela/quickapp/zh/guide/)
- Two community Band 10 projects (Oct 2026) describe the official situation the same way: real-device debugging "仅支持 Xiaomi Watch S4，需联系小米工作人员获取调试设备". — [dargon682/vela-band-chat README](https://github.com/dargon682/vela-band-chat); [dargon682/xiaomi-band10-vela-emulator](https://github.com/dargon682/xiaomi-band10-vela-emulator)
- A community dev guide says "小米官方未对个人开发者完全开放免审核真机无线推包入口". The guide calls itself a "Vibe Coding / 实战经验驱动" product, so treat it as low authority. — [KaiTeeDreamChai/xiaomi-band-dev-guide, doc 05](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/HEAD/docs/05-sideload-and-deployment.md)
- The public retail 小米运动健康 has a hidden **log export**: tap the app icon on 我的 → 关于 roughly 6–10 times, then confirm. Community tools use the exported logs (in `Download/wearablelog/*.zip`) to pull out the device AuthKey. This is a log dump, not an install entry point. — [bandbbs: AstroBox V2快速上手](https://www.bandbbs.cn/threads/24538/); [minstall README](https://github.com/uybixd/minstall)

### Inferences
- The test build of 小米运动健康 with the Debug menu is the only official install path that would cover a Band 10. Xiaomi gives it out case by case (by email or business WeChat group), and nothing documents individual hobbyists receiving it.
- AIoT-IDE real-device debugging cannot be used with a Band 10 at all as of the docs read today (Watch S4 only).
- Official route confidence for this user: **effectively unavailable**. High confidence, since this comes from the official docs.

### Gaps
- It is unclear whether 常健 / changjian@xiaomi.com would give an individual developer the test build of 小米运动健康, and how long that would take. No public reports of individuals doing so were found.
- The debug page carries no last-updated date, so it may lag behind any newer device support (for example the Band 10). No later official announcement was found.
- No source says whether the test 小米运动健康 build exists for iOS. The FAQ paths, such as `/sdcard/Android/...`, imply Android.

---

## 2. Official distribution: can an individual publish to the band app store inside 小米运动健康?

### Takeaway
Wearable apps reach the store only through a partnership. The Vela docs say publishing "currently requires contacting Xiaomi staff (zhangyuanpu@xiaomi.com) for 合作发布".
- No self-service portal for wearable apps, no individual-developer path, and no private or test distribution channel is documented.
- Xiaomi's general HyperOS app platform requires a 软件著作权 certificate and APP备案 for any listing.
- For a personal badminton scorer, official publishing is impractical. Review time is undocumented.

### Cited Findings
- The Vela 发布 page says: "目前需要联系工作人员zhangyuanpu@xiaomi.com进行合作发布。" A sub-page covers 验收标准 (acceptance criteria). The page lists no submission URL, qualification rules, review time, or test channel. — [Vela docs: 发布](https://iot.mi.com/vela/quickapp/zh/guide/publish/)
- Xiaomi's HyperOS quick-app platform page says "小米快应用开发平台支持Android 和 Vela 两种开发平台" and describes a self-service flow: register a Xiaomi developer account, create the app, upload the RPK, and "审核通过后即可发布上架". The page never mentions wearables (手表/手环/穿戴), so it is unclear whether band apps can be published this way. — [dev.mi.com 快应用开发](https://dev.mi.com/xiaomihyperos/quickapp-develop)
- The HyperOS platform's 应用资质FAQ (updated 2026-01-30) says:
  - "所有应用上架均需要提供《计算机软件著作权登记证书》、《APP电子版权证书》或《软件著作权认证证书》（三选一）"
  - "软著是上架必备资质之一，需提交资质后提审"
  - APP备案 is required for all listings.
  
  The FAQ does not say whether individuals can publish, and it does not address quick apps specifically. — [dev.mi.com 应用资质FAQ](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=2251)
- Xiaomi's 2023 "IoT opens to individual developers" announcement (16 Nov 2023) covered modules, extension programs, interconnectivity, Xiaoai voice, the developer community, and open-sourcing Vela under Apache 2.0. It did **not** mention wearable quick apps or a wearable app store. — [IT之家](https://www.ithome.com/0/732/900.htm)
- A CSDN post (around late 2024) claims Xiaomi's app store stopped accepting individual developers (individuals must register a company). It concerns the Android app store, not wearables. This was seen only as a search result and not verified. — [CSDN](https://blog.csdn.net/emprere/article/details/144813648)
- A store for band apps does exist inside 小米运动健康. The 米坛 knowledge base answers "小米运动健康APP内下载应用提示「系统出现错误，请稍后重试」": too many quick apps are installed on the band. — [bandbbs 米坛知识库 Vela可穿戴设备教程](https://www.bandbbs.cn/threads/22175/)
- One community Band 10 repo claims that installing on Band 10 "需走官方发布流程 … 提交审核，审核通过后在手环「应用商店」中下载安装". The community tools in sections 3 and 5 contradict this as the *only* route. — [dargon682/vela-band-chat](https://github.com/dargon682/vela-band-chat)

### Inferences
- Official store distribution is a business-development (BD) process, not a developer-console process. An individual would have to email Xiaomi, and would likely need a 软著 certificate and possibly a company entity. Not worth pursuing for a personal app.
- Confidence that individuals cannot self-publish wearable apps as of Oct 2026: **medium-high**. The Vela docs say partnership-only, but the dev.mi.com page loosely mentions "Vela" and self-service upload without saying which devices it covers.

### Gaps
- No official statement was found on individual versus enterprise eligibility for Vela wearable apps, review duration, or whether private/test (whitelist) distribution exists.
- It is not confirmed whether the dev.mi.com quick-app console can target Band 10 or other wearables.

---

## 3. AstroBox (AstralSightStudios): Band 10 support, platforms, connection, AuthKey, coexistence, steps, license and version

### Takeaway
AstroBox is the main practical route, and it is **confirmed to support the "小米手环 10 系列"** (Band 10 series), which includes the NFC version.
- It runs on Android, iOS (App Store), Windows, macOS (Apple Silicon and Intel) and Linux.
- It talks to the band directly over Bluetooth: Classic SPP/RFCOMM on desktop and Android.
- It needs the device AuthKey, which it fetches automatically when you log in with your Xiaomi account (or you enter the key by hand).
- The band does **not** need to be unbound from 小米运动健康. Only one app can hold the connection at a time, so you switch: kill 小米运动健康, put the band in "连接新手机" mode, then connect from AstroBox.
- The latest release is **v2.2.0 (2026-10-03)**; the iOS build is 2.2.2. It is free with in-app purchases, AGPL-3.0, and only partly open source.

### Cited Findings
**Identity, license, version**
- Repo [AstralSightStudios/AstroBox-NG](https://github.com/AstralSightStudios/AstroBox-NG):
  - Description: "A Rust-powered, highly extensible and portable toolbox for wearables, focused on installing and managing third-party apps"
  - License AGPL-3.0 with an extra attribution clause; homepage astrobox.online
  - Created 2025-09-27; last push 2026-10-17
- The README says the project is built with ABTools multi-repo tooling, "其中部分仓库开源，部分闭源". The build instructions label the Tauri app "（闭源）". — [AstroBox-NG README](https://github.com/AstralSightStudios/AstroBox-NG)
- The legacy 1.x repo is archived and states "⚠ 不完整开源 … 完整的设备通信结构定义文件和部分数据包构建逻辑 … 并未开源，因此该仓库提供的代码无法正常编译". — [AstroBox-Public](https://github.com/AstralSightStudios/AstroBox-Public)
- Releases (via the GitHub API):
  - **v2.2.0 published 2026-10-03.** Assets: `AstroBox_2.2.0.apk`, `AstroBox_2.2.0_with_webview.apk`, `AstroBox_2.2.0_aarch64.dmg`, `AstroBox_2.2.0_x64.dmg`, `AstroBox_2.2.0_x64_zh-CN.msi`, `.deb`, `.rpm`, `.pkg.tar.zst`, `AstroBox_2.2.2.ipa`. Notes: "iOS版2.2.2对应其它平台2.2.0".
  - Earlier: v2.1.0 (2026-08-18), v2.0.2 (2026-07-12), v2.0.1 (2026-07-03), 2.0.0 (2026-06-28).
  
  — [AstroBox-NG releases](https://github.com/AstralSightStudios/AstroBox-NG/releases)
- The README claims these firsts:
  - Rust classic Bluetooth SPP on "Windows、macOS、Linux、Android"
  - "全球首个在 PC 与 iOS 平台上成功实现小米穿戴设备连接及第三方资源安装"
  - App runs "在Windows、macOS、Linux、Android、iOS五大平台上"
  
  — [AstroBox-NG README](https://github.com/AstralSightStudios/AstroBox-NG)
- App Store listings:
  - China store: "AstroBox - 次世代穿戴设备工具箱", "免费 · App 内购买".
  - US store: "AstroBox - Wearable Toolkit", Free with In-App Purchases, **"Requires iOS 26.1 or later"**, 131.4 MB, category Utilities.
  
  — [App Store CN](https://apps.apple.com/cn/app/id6785374105); [App Store US](https://apps.apple.com/us/app/astrobox-wearable-toolkit/id6785374105)
- **Conflict on the iOS minimum.** The 米坛 wiki says "iOS 版最低要求系统版本必须在 16.5 以上 … 建议达到 26.5 以上". The current App Store listing says iOS 26.1+. — [wiki: 适用条件与安装](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-install.html) vs [App Store US](https://apps.apple.com/us/app/astrobox-wearable-toolkit/id6785374105)
- v2.1.0 release notes:
  - "小米账号联动：登录小米账号后自动导入设备；支持启动时自动同步、AuthKey 自动覆盖"
  - "未登录时引导登录以解锁付费资源下载" (an AstroBox account is needed for paid resources)
  - iOS is on the App Store
  
  — [Release v2.1.0](https://github.com/AstralSightStudios/AstroBox-NG/releases)

**Band 10 support**
- The 米坛 knowledge-base support matrix for AstroBox (page edited about a month before 2026-10-21) lists:
  - "小米手环 10 系列 ✔️ 完整支持"
  - "小米手环 10 Pro ✔️ 完整支持"; "小米手环 11 系列 ✔️"; "小米手环 9 / 9 Pro ✔️"
  - "小米手环 8 系列 ❌ 不支持 过时设备"
  
  — [wiki: AstroBox 从此开始](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-start.html); same table on [wiki: 资源安装](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-resource.html)
- System requirements in the same table: Windows 10 20H2+, **macOS Sonoma (14)+**, Linux (Debian/RedHat, x86_64 only), iOS/iPadOS 16.5+, Android 10+. A "Chromium 117+" web build is listed as "暂不可下载". The macOS row there still says V1.5.91, but GitHub already ships 2.2.0 dmgs. — [wiki: AstroBox 从此开始](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-start.html); [releases](https://github.com/AstralSightStudios/AstroBox-NG/releases)
- A Band 10 third-party app vendor (腕管Pro, which supports "Xiaomi Band 10 基础版/NFC版") lists AstroBox as method 1 for installing its RPK: Device → 安装应用 → choose RPK. — [腕管Pro docs](https://wgpro.typheye.cn/docs/)

**Connection and AuthKey**
- There are two connection methods. "从小米账号开始" logs in to your Xiaomi account and syncs the bound devices. "手动输入 AuthKey 连接" is "仅支持部分小米穿戴设备". — [wiki: 设备连接](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-connect.html)
- Pairing steps on the band and phone:
  1. On the band, open Settings → 「我的设备」 (older devices: 「系统操作」) → 「连接新手机」, then tap the blue check.
  2. In AstroBox, tap the device in the list.
  3. The band vibrates; tap the check on the band.
  4. Accept the OS pairing prompt ("绑定"; on Android it may be a notification "配对与连接").
  5. On iOS, if you get **TargetRejected**, go to iOS Settings → 蓝牙, forget the band, and retry.
  
  — [wiki: 设备连接](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-connect.html)
- The V2 tutorial (edited 2026-07-11) covers login and permissions:
  - After AstroBox OOBE and Xiaomi login, tap "导入在小米运动健康绑定的设备" to avoid needing an AuthKey or adding the device by hand.
  - Android permissions needed: 附近的设备, Bluetooth, and **precise** location.
  - Oddly, "若你是小米手机 则需要关闭手机当中的"开发者模式"即可扫描到你的手环".
  - On iOS, "每次从小米运动健康连接到ab都要在手机系统设置中忽略设备", because iOS Bluetooth binds the accessory to 小米运动健康.
  
  — [bandbbs: AstroBox V2快速上手](https://www.bandbbs.cn/threads/24538/)
- Ways to get the AuthKey by hand:
  - **Android:** sync in 小米运动健康 → 我的 → 关于 → tap the icon about 10 times → confirm the log export. Then read the key with 表盘自定义工具's "AuthKey读取工具" (needs donor status), or from the exported zip in `Download/wearablelog`.
  - **iOS:** in the Files app, open the 小米运动健康 folder → `MHWCahe/<数字id>/VirtualDevice_registerList/manifest.sqlite`, and search for `encrypt_key`.
  - If you get a key error, the "AuthKey刷新了"; read it again.
  
  — [bandbbs: AstroBox V2快速上手](https://www.bandbbs.cn/threads/24538/)
- The wiki warns that the AuthKey is a device-connection credential: do not share it, and if it leaks, unbind and rebind in the official app to reset it. — [wiki: 设备连接](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-connect.html)
- Transport: AstroBox's error reference lists SPP-layer errors per platform, for example `btclassic-spp/macos … RFCOMM channel disconnected` (fix: forget the device and re-pair, or restart AstroBox), plus Windows and Linux (BlueZ) SPP errors, and "Auth HMAC mismatch … AuthKey is wrong". — [wiki: AstroBox 报错参考](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-errors.html)

**Installing a local .rpk**
- AstroBox "支持完全离线使用 … 直接在应用内安装本地下载好的资源". There are three ways:
  1. **Device page:** open a resource-type card, tap "+", pick the file.
  2. **Queue:** tap "+" at the top right, choose the resource type, pick the file.
  3. **Drag and drop** onto the window (desktop only).
  
  If local auto-install is turned off, press Start in the queue. — [wiki: 资源安装](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-resource.html)
- The V2 tutorial confirms local rpk installs ("自备资源，如米坛社区下载的rpk … 找到队列 … 选择要安装的资源类型"). — [bandbbs: AstroBox V2快速上手](https://www.bandbbs.cn/threads/24538/)

**Coexistence with 小米运动健康**
- The wiki's whole flow assumes the band stays bound to the Xiaomi account. AstroBox reuses that binding: it imports devices "在小米运动健康绑定" and pulls the AuthKey from the account. — [wiki: 设备连接](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-connect.html)
- Forum users report "杀了小米运动健康的后台" (killing 小米运动健康's background process) fixes AstroBox failing to find or connect to the band; one replied "这个方法有效". — [bandbbs thread 26473](https://www.bandbbs.cn/threads/26473/)
- GitHub issue #18 (open, 2026-08-15): V2 always unpairs the system Bluetooth bond before pairing ("不强制 配对前取消配对" was a V1 option). The user says "我每次从 AstroBox 连接我的手环后都要重新配置解锁手机功能". — [AstroBox-NG #18](https://github.com/AstralSightStudios/AstroBox-NG/issues/18)

**Known issues relevant to this user**
- Xiaomi-account login in AstroBox can hit an endless 2FA loop: issue #4, which the developer said "将在2.0.0修复". In Feb 2026, forum replies on the V2 tutorial still reported "已触发风控", and the tutorial suggested turning off Xiaomi 2FA at account.xiaomi.com as a workaround. — [AstroBox-NG #4](https://github.com/AstralSightStudios/AstroBox-NG/issues/4); [bandbbs 24538](https://www.bandbbs.cn/threads/24538/)
- In May 2026, a **Band 10 (non-Pro)** owner on a vivo phone reported repeated 2FA (风控) when logging in through AstroBox on that phone, while login worked from a different phone. — [bandbbs thread 26473](https://www.bandbbs.cn/threads/26473/)
- macOS: issue #28 (open, 2026-09-26) reports "开始任务队列中的项目时 整个应用的前端变得非常卡顿", and issue #14 ("macOS aarch64 build 签名问题") was closed 2026-07-16. The wiki tells Mac users to run `sudo xattr -r -d com.apple.quarantine /Applications/AstroBox.app` and to pick the ARM or x86 dmg. — [AstroBox-NG #28](https://github.com/AstralSightStudios/AstroBox-NG/issues/28); [issues list](https://github.com/AstralSightStudios/AstroBox-NG/issues?q=is%3Aissue); [wiki: 适用条件与安装](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-install.html)
- Content gate: issue #30 (open, 2026-10-17). AstroBox 2.2.0 refused a self-made **watchface** for Band 9 Pro with "为遵守相关法律法规，受小米有关部门要求，禁止安装疑似来自官方表盘商城的表盘", and the reporter asked how private self-made packages get verified. No similar block on rpk apps has been reported. — [AstroBox-NG #30](https://github.com/AstralSightStudios/AstroBox-NG/issues/30)
- Band 10 **Pro** (not the user's model):
  - Issue #26 (open, 2026-09-22): the international Band 10 Pro NFC on firmware 3.210.016 with AstroBox 2.1.0 fails quick-app installs with "timed out waiting for install prepare response", while watchfaces install fine.
  - A May 2026 thread claimed new Band 10 Pro firmware hides Bluetooth advertising while bound; other users replied that killing 小米运动健康 fixed it.
  
  — [AstroBox-NG #26](https://github.com/AstralSightStudios/AstroBox-NG/issues/26); [bandbbs 26473](https://www.bandbbs.cn/threads/26473/)

### Inferences
- **Steps for Band 10 NFC (China) with AstroBox**, compiled from the wiki and tutorial above:
  1. Make sure the band is bound and synced in 小米运动健康, and **do not unbind it**.
  2. Install AstroBox: Mac dmg from GitHub, or iOS App Store, or Android apk.
  3. Log in to the same Xiaomi account and import the device; or enter the AuthKey by hand.
  4. Force-stop or kill 小米运动健康. On iOS, forget the band in Settings → 蓝牙.
  5. On the band: 设置 → 系统操作 (or 我的设备) → 连接新手机 → ✓.
  6. In AstroBox, tap the band, confirm on the band, and accept the OS pairing prompt.
  7. Drag the `.rpk` in (desktop), or use Queue/Device page → "+" → choose the 快应用 type → Start.
  8. Afterwards, reopen 小米运动健康 so it reconnects for health sync.
- Time: likely about 15–45 min the first time (install, login or AuthKey, pairing), then about 1–2 min per later install, since rpks are KB-sized. This estimate is not from a source. Cost: free.
- Confidence that AstroBox can install a self-built rpk on Band 10 NFC (China): **high** for the mechanism, since Band 10 is listed as fully supported and the wiki documents local rpk install. **Medium-high** for any particular firmware version, because no source names the Band 10 firmware versions it was tested on, and AstroBox has shown it applies content checks at Xiaomi's request (issue #30, watchfaces only).
- On a Mac, AstroBox is the most direct route (laptop to band over Classic Bluetooth). The macOS-specific RFCOMM errors and the open performance issue mean you should expect some retries.

### Gaps
- astrobox.online could not be fetched (TLS or domain block), so official AstroBox docs and terms were not read directly. The 米坛 wiki and GitHub were used instead.
- No source states the Band 10 firmware versions AstroBox was validated against, or whether a specific firmware (for example 3.2.x) changed quick-app install behavior on the **non-Pro** Band 10.
- Whether iOS AstroBox uses BLE (iOS cannot normally do SPP) or another mechanism is undocumented, as is whether iOS installs are as reliable as desktop or Android.
- No explicit documented procedure covers handing the connection back to 小米运动健康 after AstroBox. For example: does 小米运动健康 reconnect automatically, or does the band need re-pairing at the Bluetooth level? Issue #18 suggests some re-setup is needed.

---

## 4. Gadgetbridge: Band 10 support and whether it can install Vela .rpk apps

### Takeaway
Gadgetbridge (Android only) supports the Band 10 as "Mostly supported" and experimental. It can install **watchfaces and firmware but not rpk apps**: app management is not available for Xiaomi protobuf devices.
- It needs the auth key.
- It cannot run alongside 小米运动健康: you have to strip the vendor app's permissions or uninstall it, but must not unbind the band.

It is therefore **not a route** for installing a self-built rpk.

### Cited Findings
- On the Gadgetbridge Xiaomi device page, the Band 10 is "Mostly supported", experimental, "Missing a few features, but it should be enough to cover essential daily tasks". The Band 9 is "Unknown support"; the Band 8 is "Highly supported". All three need a Xiaomi token: "You need to pair with vendor (Xiaomi Wear, Mi Fit, Mi Fitness) app first, then obtain the authentication key". — [gadgetbridge.org Xiaomi](https://gadgetbridge.org/gadgets/wearables/xiaomi/)
- Issue #5323, "[Mi Smart Band 10] My Experience" (opened 2025-08-31 on FW 1.1.155 and GB 0.86.1), says "Watchface management supported; app management not available". Later comments mention firmware 2.1.77, 3.2.1 (pairing still worked) and 3.2.7 with GB 0.93.0 (2026-08-18). — [Codeberg #5323](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/5323)
- The changelog has "Xiaomi Protobuf: Enable watchface upload for all devices" and no rpk/app-install entry. — [Gadgetbridge CHANGELOG](https://github.com/Freeyourgadget/Gadgetbridge/blob/master/CHANGELOG.md)
- In the current source, `XiaomiInstallHandler` only handles `helper.isWatchface()` and `helper.isFirmware()`; there is no app/rpk branch. — [XiaomiInstallHandler.java](https://github.com/Freeyourgadget/Gadgetbridge/blob/master/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/devices/xiaomi/XiaomiInstallHandler.java)
- Getting the auth key for Mi Fitness / Mi Health (`com.mi.health`) / Xiaomi Wear:
  - The key appears in app logs under `/sdcard/Android/data/<package>/files/log/`, in fields `encryptKey`, `token`, `authKey` or `huamiAuthKey`.
  - Alternatively, "Xiaomi Cloud Tokens Extractor" can fetch it from the Xiaomi cloud.
  - On rooted phones it can be read from `device_db`.
  
  — [Gadgetbridge server pairing guide](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/)
- Coexistence rules in the same guide:
  - "Don't unpair from vendor app … the pairing key will be invalidated … Just uninstall the vendor app."
  - "Hard resetting the gadget invalidates the key."
  - "remove all permissions from the vendor app or uninstall it, since it can conflict with Gadgetbridge."
  
  — [Gadgetbridge server pairing guide](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/)
- Band 10 users in #5323 found the key in `XiaomiFit.main.log` under "encryptKey". One user who changed phones couldn't find it, and a contributor suggested a rooted phone or an Android Studio emulator. — [Codeberg #5323](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/5323)
- Seen only as a search-result summary, not fetched: issue #5537 says Band 10 firmware 3.2.1 changed GNSS handling. Band 10 uses SPP (Bluetooth Classic) for bulk data, while Gadgetbridge's protobuf code handles only BLE. — [Codeberg #5537](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/5537)

### Inferences
- Gadgetbridge is irrelevant for installing the app. It might matter only if the user later wants to drop 小米运动健康 entirely, and then Xiaomi-side features such as phone↔band messaging through 小米运动健康 would be lost.
- Confidence that Gadgetbridge cannot install rpk on Band 8/9/10 as of Oct 2026: **high**, from the source code, the changelog and the user report.

### Gaps
- No Gadgetbridge roadmap item or PR for Xiaomi app (rpk) installation was found. The linked "app management" issue #3786 could not be fetched.

---

## 5. Other routes: 表盘自定义工具, BandBurg, OronBox, minstall, rooted 小米运动健康 with Xposed, iPhone-only, Mac-only

### Takeaway
Besides AstroBox, the 米坛 community documents three more tools that list Band 10 and need the same AuthKey:
- **表盘自定义工具** (Android app)
- **BandBurg** (web page in Chrome or Edge, so it works on a Mac or Android but not iOS)
- **OronBox**

For rooted Android there is the **Wearable Debug** Xposed module, which unlocks the hidden "Install third app" page inside 小米运动健康. It is the only route that installs through the official app's own channel, but its support for current app versions is unverified.

**minstall** is open source (MIT) but verified only on Band 10 Pro, and runs on Linux and Android only.

For an iPhone-only user, the routes are AstroBox iOS, or AstroBox or BandBurg on the Mac. For a Mac, the routes are AstroBox macOS and BandBurg in Chrome or Edge.

### Cited Findings
**米坛 overview**
- The knowledge base (first post last edited 2026-08-23) lists four common tools:
  - 表盘自定义工具: "想直接在手机上下载并安装表盘的用户，步骤最直观"
  - AstroBox: "连接和管理设备更稳定"
  - Band Burg: "快速在浏览器完成安装步骤"
  - OronBox: "快速在支持Zeep和Vela设备进行连接安装操作"
  
  — [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/)

**表盘自定义工具 (Android, package `tech.pingx.watchface`)**
- The wiki lists version 6.5.5. Supported devices include "Xiaomi Smart Band 10（小米手环10）", Band 10 Pro and Band 11. Owners of "NFC、陶瓷版、41mm版等" must pick the matching device prefix. — [wiki: 表盘自定义工具](https://wiki.bandbbs.cn/Guides/watchface_custom_tool/watchface_custom_tool-install.html)
- Install flow ("蓝牙一键安装"): put the band in 连接新手机 mode, paste the AuthKey, confirm pairing on the band, then start the install.
  - The "AuthKey读取工具" needs donor status; there is a 48-hour donor trial, and apps already installed stay after the trial ends.
  - Quick apps are managed or uninstalled under 工具 → 快应用管理.
  
  — [wiki: 表盘自定义工具](https://wiki.bandbbs.cn/Guides/watchface_custom_tool/watchface_custom_tool-install.html); [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/)
- The same wiki notes that phone-side sync for quick apps (for example e-book syncers) depends on 小米运动健康: "请连接"小米运动健康"进行连接操作！同步依赖"小米运动健康"！" — [wiki: 表盘自定义工具](https://wiki.bandbbs.cn/Guides/watchface_custom_tool/watchface_custom_tool-install.html)
- 腕管Pro lists 表盘自定义工具 as method 2 for installing an RPK on its supported devices, which include Band 10 基础版/NFC版. — [腕管Pro docs](https://wgpro.typheye.cn/docs/)

**BandBurg (browser)**
- Minimum compatible devices: "小米手环：9/9Pro/10 及更新产品". Requirements: "一台安装了Edge/Chrome的电脑（支持蓝牙功能）" or "一部安装了Edge/Chrome的非IOS手机".
  - The wiki says "此方法仅为应急，工具本身无法获取Authkey", so you need a key from AstroBox or the log methods.
  - Steps: bandbbs.cn → 实用工具 → BandBurg → 添加新设备 → band in 连接新手机 mode → 扫描附近设备 → 绑定 → enter AuthKey → 保存设备 → 连接. First-time users "需要先前往设备蓝牙连接此设备".
  - It can then install and manage "表盘、应用、固件".
  
  — [wiki: BandBurg使用教程](https://wiki.bandbbs.cn/Guides/BandBurg/bandburg-question.html)
- The same page warns not to upload logs to web pages unless you trust them, because logs contain the AuthKey, device IDs and account information. — [wiki: BandBurg](https://wiki.bandbbs.cn/Guides/BandBurg/bandburg-question.html)

**OronBox**
- Download at https://oronbox.zxor.org/. Its Vela device list includes "Xiaomi Smart Band 10（小米手环10）", alongside Zepp OS devices.
  - It can log in to a Xiaomi account, or import a device from the exported 小米运动健康 log ("读取运动健康日志").
  - It connects in 连接新手机 mode.
  
  — [wiki: OronBox](https://wiki.bandbbs.cn/Guides/oronbox/oronbox-install.html)

**minstall (open source)**
- README: "小米手环 10 Pro 表盘直装工具 — 蓝牙直连安装 `.bin` / `.face` 表盘 … 不经过官方 App". It supports Linux (Tauri) and Android and also installs ".rpk Vela 快应用".
  - authkey is read from the 小米运动健康 log export (`Download/wearablelog/*.zip`, field `"encryptKey"`).
  - "使用前请关闭/退出官方 App（它会占用手环的蓝牙 RFCOMM 通道）"
  - "手环必须处于已绑定状态 … 否则认证返回 NO_BOUND"; "重新绑定后需重新提取 authkey"
  - Limits: "当前只支持 Linux 桌面和 Android；macOS、Windows 尚未实现蓝牙连接层"; "仅针对小米手环 10 Pro 的已验证协议流程".
  - Protocol: "Band 10 Pro 的 V2 协议走经典蓝牙 SPP 通道（RFCOMM ch5）".
  
  — [uybixd/minstall](https://github.com/uybixd/minstall)
- The fork (MIT, created 2026-09-30, pre-release `v0.2.0-fork.1` Android arm64 APK) says "手环11没有问题". — [uybixd/minstall](https://github.com/uybixd/minstall)

**Rooted Android: 小米运动健康 with the Wearable Debug Xposed module (the "modified Mi Fitness" route)**
- Wearable Debug: "Xposed插件启用Mi Fitness第三方小程序安装卸载，表盘安装，固件安装". Activating it replaces the About → User Agreement page with the hidden installer.
  - Choose "App", enter any package name (the full name is needed only to uninstall), tap "install third app" and pick the rpk.
  - It can also dump the EncryptKey.
  - "当前代码仅**8Pro**在**Mi Fitness 3.43.0i**版本和**小米运动健康3.44.0**测试正常." Last push 2025-09-23.
  
  — [A5245/Wearable-Debug](https://github.com/A5245/Wearable-Debug)
- 腕管Pro's docs list it as method 3 ("该方法是专为已解锁Bootloader锁的安卓手机而准备的"):
  1. Install Root + LSPosed and Wearable Debug.
  2. In 小米运动健康 go to 我的 → 关于 → 用户协议 → App.
  3. Tap "click to input package name", then "install third app", and wait for "安装成功".
  
  — [腕管Pro docs](https://wgpro.typheye.cn/docs/)
- Earlier history: the 2023 bandbbs thread for the original module ("米环8P工具") notes that uninstalling needs the rpk's signature SHA1, so the rpk must have been installed once by that tool first. — [bandbbs thread 7923](https://www.bandbbs.cn/threads/7923/)
- 小米运动健康 on 应用宝 shows version 3.59.1, updated 2026-09-12. This was seen only as a search-result summary. — [应用宝 小米运动健康](https://sj.qq.com/appdetail/com.mi.health)

**iPhone and Mac**
- iPhone: AstroBox is on the CN App Store. iOS AuthKey can be read from `manifest.sqlite` via the Files app. BandBurg and minstall do not support iOS, and 表盘自定义工具 is Android-only. The 米坛 KB tells iOS users who hit 2FA problems to "借Android设备" and use 表盘自定义工具. — [App Store CN](https://apps.apple.com/cn/app/id6785374105); [bandbbs 24538](https://www.bandbbs.cn/threads/24538/); [wiki: BandBurg](https://wiki.bandbbs.cn/Guides/BandBurg/bandburg-question.html); [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/)
- Mac: AstroBox ships `aarch64.dmg` and `x64.dmg` (v2.2.0) and uses macOS Classic Bluetooth RFCOMM. BandBurg needs "电脑（支持蓝牙功能）" with Chrome or Edge. The KB also says AstroBox is "无ROOT设备、苹果手机、电脑可用", for example when flashing firmware from a PC over Bluetooth. — [releases](https://github.com/AstralSightStudios/AstroBox-NG/releases); [wiki: AstroBox 报错参考](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-errors.html); [wiki: BandBurg](https://wiki.bandbbs.cn/Guides/BandBurg/bandburg-question.html); [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/)

**Signing nuance (conflicting claims)**
- A community dev guide says that for sideloading via AstroBox "必须使用 `npm run build` 生成的 Debug 包，手环固件通常禁止未授权的自签名 Release 包". It describes the error as "证书校验失败 / 非法安装包". — [KaiTeeDreamChai guide, doc 05](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/HEAD/docs/05-sideload-and-deployment.md)
- This conflicts with community distribution practice. 米坛 apps circulate as release builds (for example `com.bandbbs.ebook.release.3.1.rpk`, used in a Band 10 test write-up) and are installed through AstroBox or 表盘自定义工具. — [dargon682/xiaomi-band10-vela-emulator](https://github.com/dargon682/xiaomi-band10-vela-emulator); [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/)
- Separately, the official FAQ requires the rpk and the phone app to share a certificate if they communicate. — [Vela FAQ](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)

### Inferences
- For an **Android** user, ranked:
  1. AstroBox (Android)
  2. 表盘自定义工具 (needs donor status for the AuthKey reader, or a key from elsewhere)
  3. BandBurg (browser)
  4. Rooted Xposed route, only if the phone is already rooted. It keeps 小米运动健康 connected, but compatibility with 小米运动健康 3.59.x on Band 10 is unverified.
- For an **iPhone** user:
  1. AstroBox iOS, which needs iOS 26.1+ per the App Store listing and means forgetting the band in iOS Bluetooth on each switch.
  2. AstroBox on the Mac, with the Xiaomi-account login supplying the AuthKey; this avoids the iOS AuthKey extraction.
  3. BandBurg in Chrome or Edge on the Mac, which needs an AuthKey obtained another way.
- For the **Mac** specifically, AstroBox macOS is the native route. BandBurg is a fallback; it most likely uses Chrome's Web Serial/Bluetooth APIs (inferred, not documented).
- minstall is not a good fit: it is verified only on Band 10 Pro, and has no macOS support.
- Self-built rpks should be tested with both a debug build and a release build. If one fails with a certificate error, try the other. Evidence on whether retail firmware rejects self-signed release builds conflicts, and the KaiTee claim comes from a weaker source.
- Confidence for Band 10 NFC specifically:
  - AstroBox: high
  - 表盘自定义工具: high (Android)
  - BandBurg: medium (listed, few reports)
  - OronBox: medium-low (listed, little detail)
  - Wearable Debug: low-medium (old, last tested on Band 8 Pro)
  - minstall: low (Band 10 Pro only)

### Gaps
- OronBox's supported phone and desktop platforms, its license, and its pricing were not established; its site was not fetched.
- BandBurg's exact web API (Web Bluetooth or Web Serial over RFCOMM), whether it works on macOS Chrome with Band 10, and its operator or privacy terms were not documented.
- Wearable Debug's compatibility with 小米运动健康 3.5x on Band 10 is untested in any found source.
- "Notify for Xiaomi" is mentioned by 米坛 for firmware downgrade. Whether it can install rpk on Band 10 was not established.
- No source covered a "modified 小米运动健康 APK" that exposes Install third app without root. The only such route found needs Xposed and root.

---

## 6. Risks and limits

### Takeaway
Installing an rpk over Bluetooth is low-risk to the hardware: it does not flash firmware. The real risks are:
- Exposure of the Xiaomi account and the AuthKey (third-party logins, risk-control 2FA loops)
- Connection juggling with 小米运动健康
- A 20-quick-app cap on the non-Pro Band 10
- Storage headroom needed for firmware updates (OTA)
- Possible future policy or firmware changes

Unbinding or factory-resetting the band invalidates the AuthKey. No authoritative source covers warranty impact or whether sideloaded apps survive OTA updates.

### Cited Findings
**Account and AuthKey**
- The AuthKey is a sensitive credential. If it leaks, delete saved devices from third-party tools and unbind and rebind in the official app to reset it. — [wiki: 设备连接](https://wiki.bandbbs.cn/Guides/astrobox/astrobox-connect.html); [wiki: BandBurg](https://wiki.bandbbs.cn/Guides/BandBurg/bandburg-question.html)
- Logging in to a Xiaomi account through third-party tools can trigger risk control or 2FA loops: "已触发风控", "反复要求二次验证". One tutorial even suggests turning off Xiaomi 2FA as a workaround, which lowers account security. — [bandbbs 24538](https://www.bandbbs.cn/threads/24538/); [bandbbs 26473](https://www.bandbbs.cn/threads/26473/); [AstroBox-NG #4](https://github.com/AstralSightStudios/AstroBox-NG/issues/4)
- minstall's disclaimer says this kind of protocol-level direct connection may violate the vendor's terms of service, and misuse may cause abnormal band behavior: "可能违反厂商服务条款；操作不当可能导致手环异常". — [minstall](https://github.com/uybixd/minstall)
- Unpairing in the vendor app or hard-resetting the band invalidates the key. A hard reset also changes the Bluetooth MAC. — [Gadgetbridge pairing guide](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/); [minstall](https://github.com/uybixd/minstall)

**Connection conflicts**
- Only one host can hold the band's link (RFCOMM or GATT), so 小米运动健康 must be killed or stopped before using the third-party tool. — [minstall](https://github.com/uybixd/minstall); [KaiTeeDreamChai doc 05](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/HEAD/docs/05-sideload-and-deployment.md); [bandbbs 26473](https://www.bandbbs.cn/threads/26473/)
- AstroBox V2 removes the OS-level Bluetooth bond before pairing, so phone features such as smart unlock must be set up again. — [AstroBox-NG #18](https://github.com/AstralSightStudios/AstroBox-NG/issues/18)
- On iOS, forget the band in Settings before each switch from 小米运动健康 to AstroBox. — [bandbbs 24538](https://www.bandbbs.cn/threads/24538/)

**Device limits (Band 10 specific)**
- "小米手环10 Pro以及小米手表S5系列无快应用上限 其他设备只能安装20个快应用！若出现预安失败请不要继续安装！" The cap is by **count**, not storage. — [wiki: 表盘自定义工具](https://wiki.bandbbs.cn/Guides/watchface_custom_tool/watchface_custom_tool-install.html); [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/)
- Storage:
  - The Band 10 NFC/陶瓷/耀影金 firmware package is about 48 MB, and "小米手环10NFC/陶瓷/耀影金可用是323M".
  - Keep free space of about 2× the firmware package size, or the next OTA cannot install.
  - "如果变砖请尝试平刷固件或者恢复出厂设置"; "环10用户可以尝试多次一直插拔显示系统还原".
  
  — [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/)
- Networking: "对于小米手环9、小米手环10需要同步器" (sync app). Third-party apps on Band 9/10 need a phone-side companion "同步器" to get network data. — [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/); [腕管Pro docs](https://wgpro.typheye.cn/docs/)
- The official FAQ adds that phone↔band messaging needs matching certificates. — [Vela FAQ](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
- Firmware identifiers seen for Band 10:
  - Codename `o66`, firmware 3.1.16 (used in an emulator write-up)
  - Gadgetbridge user reports: 1.1.155 (2025-08), 2.1.77 (2025-10), 3.2.1 (2025-12), 3.2.7 (2026-08)
  
  — [dargon682 emulator](https://github.com/dargon682/xiaomi-band10-vela-emulator); [Codeberg #5323](https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/5323)

**Firmware and policy changes**
- No report was found of a **Band 10 (non-Pro)** firmware update blocking rpk sideloading.
- On the adjacent **Band 10 Pro**:
  - International NFC on FW 3.210.016: quick-app install times out while watchfaces work (issue #26, open).
  - May 2026 claims that new firmware hid Bluetooth advertising while bound; others disputed this.
  
  — [AstroBox-NG #26](https://github.com/AstralSightStudios/AstroBox-NG/issues/26); [bandbbs 26473](https://www.bandbbs.cn/threads/26473/)
- AstroBox now blocks watchfaces "疑似来自官方表盘商城" because of "受小米有关部门要求" (at the request of relevant Xiaomi departments). This shows the tool's install policy can change under vendor pressure; so far it applies to watchfaces only. — [AstroBox-NG #30](https://github.com/AstralSightStudios/AstroBox-NG/issues/30)
- Firmware flashing and downgrading through these tools carries bricking risk ("刷写失败等导致死机变砖等后果 … 不负任何责任"). That applies to firmware, not to rpk installs. — [bandbbs 米坛知识库](https://www.bandbbs.cn/threads/22175/)

### Inferences
- **Route summary for a Band 10 NFC (China) bound to 小米运动健康, from the user's Mac with an unknown phone:**

  | Route | Platforms | Prerequisites | Cost | Works on Band 10? | Confidence |
  |---|---|---|---|---|---|
  | AstroBox 2.2.x | macOS 14+ (arm64 or x64), Windows, Linux x86_64, Android 10+, iOS (App Store; 26.1+ per listing) | Xiaomi account login or AuthKey; kill 小米运动健康; band in 连接新手机 mode | Free (optional in-app purchases) | Listed "完整支持" for the 10 series | High |
  | 表盘自定义工具 6.5.5 | Android only | AuthKey (reader needs donor status, 48 h trial); choose the NFC variant | Free plus donation-gated features | Band 10 listed | High (Android) |
  | BandBurg | Chrome/Edge on a computer with Bluetooth, or non-iOS phone | AuthKey from elsewhere; pair in OS first | Free web tool (not verified) | "9/9Pro/10 及更新" | Medium |
  | OronBox | Unclear | Xiaomi login or log import | Unclear | Band 10 listed | Medium-low |
  | Rooted 小米运动健康 + Wearable Debug | Rooted Android with LSPosed | Unlocked bootloader | Free | Listed by 腕管Pro; module tested only on 8 Pro and old app versions | Low-medium |
  | minstall | Linux, Android | AuthKey from logs | Free (MIT) | Verified on 10 Pro (and 11 per the fork), not the 10 | Low |
  | Gadgetbridge | Android | AuthKey; vendor app removed | Free | Watchfaces only, **no rpk** | Not a route |
  | Official AIoT-IDE real-device debugging | Windows, macOS, Ubuntu with LAN | Partner status, Watch S4 only | — | No | Not available |
  | Official 小米运动健康 Debug → Install third app | Test build of the app | 商务对接 (changjian@xiaomi.com) | — | Unknown | Not available to individuals |
  | Official store publishing | — | 合作发布 (zhangyuanpu@xiaomi.com); likely 软著 | — | — | Not practical |

- Sideloaded rpks probably persist across reboots, because the 20-app cap and the uninstall tooling imply persistent installs. Persistence across OTA updates is **unverified**. Keep the .rpk and re-install if an update removes it.
- Re-pairing or unbinding the band, for example to fix connection problems, regenerates the AuthKey. Unbinding also typically resets the band (unverified for Band 10), which would remove sideloaded apps and require extracting the key again.

### Gaps
- No authoritative Xiaomi statement was found on whether installing third-party rpks or watchfaces affects warranty (三包). Searches returned only low-quality Q&A sites.
- No source confirms whether third-party quick apps survive a Band 10 OTA firmware update, or whether Xiaomi has blocked sideloading on any Band 10 (non-Pro) firmware as of Oct 2026.
- No authoritative source says whether unbinding the Band 10 in 小米运动健康 automatically factory-resets it, or exactly which on-band data is lost on re-pairing.
- It is unconfirmed whether retail Band 10 firmware rejects self-signed *release* rpks; sources conflict.
