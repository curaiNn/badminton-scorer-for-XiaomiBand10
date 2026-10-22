# Prior Art, Open-Source References and Developer Pitfalls: Badminton Scorer for Xiaomi Smart Band 10 (小米手环10)

Research date: 2026-10-21. I searched GitHub through its public API (repository and issue search, then READMEs and source files), crawled the titles and taglines of 3,982 米坛社区 (bandbbs.cn) resources in the Band 9, 9 Pro, 10, 10 Pro and 11 categories (the site's own search returns HTTP 403 without login), checked the AstroBox resource index, read the official Xiaomi Vela JS docs (iot.mi.com, fetched with curl), and read BWF law texts hosted by member associations, because bwfbadminton.com returns 403. Most community sources are single-developer READMEs, often AI-assisted. I treat their claims as self-reported unless they are corroborated, and I say so where they conflict.

## Q1. Do badminton or general sports scorer apps already exist for Xiaomi Band 8/9/10?

### Takeaway
Yes. The niche is already occupied, but thinly. At least five distinct badminton-specific scorers target Band 9 Pro/10/10 Pro:
- 羽记: free, closed, bandbbs.
- 羽球助手: paid ¥1, closed, bandbbs.
- 羽毛球计分器: free on bandbbs, source on GitHub as j-iNFINITE/Badminton_score_app.
- zhangchi1997/badminton_scoring: GitHub only.
- Godminton: GitHub only.

There is also a generic table-tennis/badminton scorer for Band 8/9/10, and scorers for tennis, padel and pickleball. None of them is all of the following at once: badminton-complete (games, serve and court, both 21- and 15-point systems), persistent across app kills, and open source under a clear license. The AstroBox catalog has no scorer at all.

### Cited Findings

#### Badminton scorers for Band 10 / 10 Pro
- **小米手环10-羽记 羽毛球计分** (bandbbs #5807, author 一角钱onedime). Published 2026-03-31, v1.0.0, free, 283 downloads, 1,000 views, 4.67★ from 3 ratings. It scores singles and doubles and tracks player positions (站位) and the serving side. The UX is gesture-only: swipe up gives your side +1, swipe down gives the opponent +1, swipe left undoes the last step, long-press restarts, tapping a name edits the player code and tapping a score edits it. No source code is published, and downloading requires a forum login. — [bandbbs #5807](https://www.bandbbs.cn/resources/5807/)
- **羽球助手** (author 酥酥小黑). Published 2026-07-12, v1.0.1, paid ¥1.00. Separate listings exist for Band 10 (#6912), Band 10 Pro (#6913) and Band 9 Pro (#6914). Listed features: counting hits, recording and tallying shot types, estimating shuttle speed and keeping the match's top speed, a post-game summary, a "scoreboard with multiple scoring methods" (计分板，多种计分方式), adjustable sensitivity, and a history of top speed, game score, shots, hit count and date. Closed source. — [bandbbs #6912](https://www.bandbbs.cn/resources/6912/); [#6913](https://www.bandbbs.cn/resources/6913/); [#6914](https://www.bandbbs.cn/resources/6914/)
- **zhangchi1997/badminton_scoring** ("羽球计分"), for Band 10 (212×520) and Band 10 Pro (336×480). Created and pushed 2026-09-29, manifest v1.3.0, no license file.
  - Layout: the screen is split top (opponent) and bottom (self). A single tap adds 1 with vibration and a double tap subtracts 1, using a 200 ms window.
  - Screen handling: the screen is kept on and dims after 3 s idle. An accelerometer "wrist-raise" detector restores brightness.
  - Rules and end of game: one 21-point game, win by 2, capped at 30. A win popup auto-resets after 10 s.
  - Not implemented: no best-of-3 match, no serve tracking. The manifest declares only vibrator, brightness and sensor, so the score is not persisted (no `system.storage`).
  - — [GitHub README](https://github.com/zhangchi1997/badminton_scoring); [manifest](https://github.com/zhangchi1997/badminton_scoring/blob/main/src/manifest.json)
- **Godminton** (jinergenkai/badminton-system, `watch/`). A Mi Band 10 badminton score counter (Vela quick app) paired with a Flutter Android app that provides a scoreboard, voice announcer, "hype sounds" and match recording, syncing to a backend. The band app has 10 pages (settings, match history, players, lineup and others) and uses `system.interconnect`. No license. Last pushed 2026-10-20. The docs are in Vietnamese. — [repo README](https://github.com/jinergenkai/badminton-system); [watch/README.md](https://github.com/jinergenkai/badminton-system/blob/main/watch/README.md); [band manifest](https://github.com/jinergenkai/badminton-system/blob/main/watch/band/src/manifest.json)

#### Badminton scorer for Band 9 Pro
- **羽毛球计分器**, released on bandbbs as #6167 (author wateregg, 2026-05-09, v1.0.0, 92 downloads, 5.0★ from 2 ratings) with source at **j-iNFINITE/Badminton_score_app**. Features:
  - Modes: a casual (unlimited) mode and a 21-point best-of-3 match mode.
  - Serving: the first tap of a game picks the server.
  - Court indicator: coloured court strips show the serving court (even score → right, odd → left).
  - Input: tap the red or blue half for +1 with vibration. Swipe left undoes, but only once. Double-tap the "NET" bar to reset. Swipe right to exit.
  - Feedback: a score-difference bar, gold digits at game point, and a "请换边" (change ends) prompt at 11 in game 3.
  - The README says MIT, but the GitHub API reports no license file.
  - It targets only the 336×480 rectangle: fixed `width: 336px` styles and designWidth 336.
  - — [bandbbs #6167](https://www.bandbbs.cn/resources/6167/); [GitHub](https://github.com/j-iNFINITE/Badminton_score_app)

#### Other-sport and general scorers on Xiaomi Vela bands
- **乒乓球计分** (bandbbs #4747, 随心fuys, 2025-11-23, v1.0.0.1, 122 downloads). One press per point, made for table tennis and badminton on Band 8/9/10. The author planned bigger buttons, vibration on scoring, and server/receiver tracking. — [bandbbs #4747](https://www.bandbbs.cn/resources/4747/)
- **网球记分 v1.7.0** (bandbbs #8644, LiangHuangb, posted 2026-10-15, Band 9 category, 4 downloads). — [bandbbs #8644](https://www.bandbbs.cn/resources/8644/)
- **loStefa/miSmash**: padel and tennis scorekeeper, MIT, v1.3.1, pushed 2026-10-19. "Tested on the Smart Band 10." It has layouts for pill, rectangular and round screens.
  - Input: tap a team panel to score and press-and-hold to undo.
  - Match logic: serve and side indicator, tie-break 1-2-2 service, golden point.
  - Persistence: the match is "saved on every point… if you leave the app or the band closes it, open it again and carry on." It keeps the last 30 matches with stats.
  - Screen: "During the match the screen stays on; it turns off again as soon as you leave the app."
  - Distribution: free, released as .rpk on GitHub Releases.
  - — [README.en.md](https://github.com/loStefa/miSmash/blob/main/README.en.md)
- **mahmoodw/pickleball-band**: pickleball scoring for Band 10 with an Android voice announcer (via the "Notify for Xiaomi" interconnect). Created 2026-10-02, pushed 2026-10-13, no license.
  - Layout: two 212×260 px "We won / They won" buttons with a serve and score badge at the seam.
  - Undo: long-press undo with up to 100 retained changes.
  - Navigation: a swiper pager (Settings ↔ Live score ↔ Play ↔ Music).
  - Settings: 11, 15 or 21 points, singles or doubles.
  - Persistence: the game is saved on the band before each transmission.
  - — [README](https://github.com/mahmoodw/pickleball-band)
- Tap counters (dhikr/tasbih) for Band 9/10 contain reusable counter-and-vibration patterns: **ashafizullah/klikband** (MIT, Band 9 192×490, "Band 10 may work but untested") and **haithamassoli/mi-band-10-dhikr** (Band 10, no license). — [klikband](https://github.com/ashafizullah/klikband); [mi-band-10-dhikr](https://github.com/haithamassoli/mi-band-10-dhikr)

#### Badminton-themed but not scorers
- 腕上羽毛球 (#7578, a ¥1.5 game, V1.6, 2026-08-18) and 环上羽球 v1.1 (#6986 Band 10, #6985 Band 9) are badminton *games*. **BMT Smash** (#6850, Band 10 Pro) is a swing-training tool that estimates swing intensity, effective swing count and predicted shuttle speed from the accelerometer. — [bandbbs #7578](https://www.bandbbs.cn/resources/7578/); [#6986](https://www.bandbbs.cn/resources/6986/); [#6850](https://www.bandbbs.cn/resources/6850/)

#### Channels checked with no scorer found
- The **AstroBox** official resource index (`index_v2.csv`, fetched 2026-10-21) lists 191 quick apps, 111 of which list Band 10 NFC (`xmb10nfc`). A keyword scan (羽毛球/计分/记分/比分/score/tennis/计数…) found no scorer. The only ball-related entries are games (愤怒的小球, 口袋台球). — [AstroBox-Repo](https://github.com/AstralSightStudios/AstroBox-Repo)
- Searching app stores for "Mi Band 10 badminton score" returned only Apple Watch and iPhone apps. — [Badminton Score (App Store)](https://apps.apple.com/app/id6746103852); [Badminton: Score Counter](https://apps.apple.com/us/app/-/id6760511627)

### Inferences
- The competition is small and mostly closed-source. 羽记 (free, gesture UX, doubles positions) and 羽球助手 (paid, adds swing analytics) are the direct competitors on Band 10.
- None of the scorers above advertises the BWF 3×15 system, which takes effect 2027-01-04 (see Q4). Only miSmash and pickleball-band clearly persist state across app kills, and neither is a badminton app.
- The open-source badminton projects either have no license (zhangchi1997, Godminton), or claim MIT in the README without a LICENSE file (j-iNFINITE). Under default copyright, their code should be used as reference only. miSmash (MIT, tested on Band 10) is the cleanest reusable reference.
- A differentiated app would offer:
  - selectable 21-point and 15-point rules with best-of-3 and change-ends prompts;
  - a serve-court indicator for singles and doubles;
  - multi-level undo;
  - per-point persistence;
  - keep-screen-on with auto-dim;
  - large digits;
  - a gesture set that avoids the system right-swipe.

### Gaps
- I could not inspect the **official in-app store in 小米运动健康 (Mi Fitness)**: it is only browsable from the phone app, and web searches found nothing.
- The bandbbs crawl covered only titles and taglines in five device categories. Resources with non-descriptive titles, or posted in other categories (测试区, HyperOS穿戴系列), may have been missed. Download-gated resources (羽记, 羽球助手) could not be inspected beyond their descriptions.
- **Gitee** could not be searched: its public search API returned empty results and the web search page is script-rendered. **B站/知乎/CSDN/掘金** posts did not surface through the (US-only) web search tool. Both remain unchecked.

## Q2. Open-source Vela JS projects for Band 9/10 usable as scaffolds or references

### Takeaway
Dozens of Band 9/10 Vela JS projects were pushed to GitHub in 2026; most have 0–15 stars and a single author. The best starting reference for a Band 10 scorer is **loStefa/miSmash**: MIT-licensed, tested on Band 10, with per-point storage, keep-screen-on, `onBackPress` handling, multi-shape layouts and unit-tested pure scoring logic. Supplement it with ideas from zhangchi1997 (tap/double-tap, auto-dim, wrist-raise), j-iNFINITE (serve-court logic) and pickleball-band (undo history, swipe/tap isolation). The official npm sample is old (2022) and predates Band 9/10.

### Cited Findings

Scaffold candidates. "Last push" is the GitHub `pushed_at` value as of 2026-10-21.

| Repo | What it is | Target | License | Last push | Value as template |
|---|---|---|---|---|---|
| [loStefa/miSmash](https://github.com/loStefa/miSmash) | Padel/tennis scorer | Band 10 (tested); pill/rect/circle layouts | MIT | 2026-10-19 | Single `pages/index` state machine. `common/score.js` holds pure logic with `npm test`. Saves on every point plus `onHide`/`onDestroy`. Keep-screen-on only in match. `onBackPress` returns true for in-app back. Long-press undo. Page height from `device.getInfo`. `@media (shape: rect)`/`(shape: circle)` variants. i18n. — [README](https://github.com/loStefa/miSmash/blob/main/README.en.md) |
| [zhangchi1997/badminton_scoring](https://github.com/zhangchi1997/badminton_scoring) | Badminton 21-pt single game | Band 10 / 10 Pro | none | 2026-09-29 | `designWidth: 212` with `flex: 1` halves, which works on 212×520 and 336×480 without separate builds. Tap/double-tap handler. Dimming via `@system.brightness`. Wrist-raise detection from the accelerometer. Node tests for logic. No persistence. — [README](https://github.com/zhangchi1997/badminton_scoring) |
| [j-iNFINITE/Badminton_score_app](https://github.com/j-iNFINITE/Badminton_score_app) | Badminton best-of-3 | Band 9 Pro (336×480 only) | README says MIT; no LICENSE file | 2026-05-08 | Serve-court parity logic and change-ends prompt. Hard-coded 336 px layout. Calls `vibrator.vibrate({duration: 30})`, which is not in the official API. — [repo](https://github.com/j-iNFINITE/Badminton_score_app) |
| [mahmoodw/pickleball-band](https://github.com/mahmoodw/pickleball-band) | Pickleball + Android voice companion | Band 10 | none | 2026-10-13 | Swiper pager with a "drag guard" so swipes don't register taps. Long-press undo of 100 steps. Save-before-send persistence. 30 band-controller tests. Playwright browser layout preview (explicitly "not … Vela rendering"). — [README](https://github.com/mahmoodw/pickleball-band) |
| [jinergenkai/badminton-system](https://github.com/jinergenkai/badminton-system) (`watch/`) | Badminton counter + Flutter companion | Band 10 | none | 2026-10-20 | Device-verified UI gotchas doc. Notes on interconnect signing and pairing. — [watch-ui-gotchas.md](https://github.com/jinergenkai/badminton-system/blob/main/watch/docs/watch-ui-gotchas.md) |
| [Bingak/MiBand10-Daily-Word-Practice](https://github.com/Bingak/MiBand10-Daily-Word-Practice) | Vocabulary app ported 9 Pro → Band 10 | Band 10 (212×520) | none | 2026-09-15 | Concrete port notes: `designWidth: "device-width"` (px = physical 1:1), removed 336 px fixed widths, smaller fonts, storage writes throttled to 400 ms, optional keep-screen-on. — [README](https://github.com/Bingak/MiBand10-Daily-Word-Practice) |
| [mastermaiolo/QRWallet](https://github.com/mastermaiolo/QRWallet) | QR card wallet | Band 9 & 10 | MIT | 2026-10-08 | One `designWidth: 192` build for both bands. 160 px cards so about three fit on a 490/520 px capsule screen. Builds without `--enable-jsc`. — [README](https://github.com/mastermaiolo/QRWallet) |
| [ashafizullah/klikband](https://github.com/ashafizullah/klikband) | Prayer times + tasbih counter | Band 9 (Band 10 untested) | MIT | 2026-10-20 | Counter with vibration. — [repo](https://github.com/ashafizullah/klikband) |
| [q879604/band-metronome](https://github.com/q879604/band-metronome) | Vibration metronome | Band 9 Pro | none | 2026-09-18 | Real-device notes on vibration and screen-off, plus a min-brightness + keep-screen-on strategy. — [README](https://github.com/q879604/band-metronome) |

Docs and tooling references:
- [KaiTeeDreamChai/xiaomi-band-dev-guide](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide): MIT, 2026-10-01, a Chinese pitfall handbook focused on Band 9 Pro and Band 9. — [04-pitfalls](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/04-pitfalls-and-solutions.md); [03-ui](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/03-ui-and-interaction.md)
- [paraflu/hermes-skill-xiaomi-miband10-vela-js](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js): MIT, 2026-09-04, an agent "skill" and guide for Band 10 Vela JS. Some of its claims conflict with tested apps (see Q3). — [development-pitfalls-and-tips.md](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md)
- [sohamashodiya/miband-dev](https://github.com/sohamashodiya/miband-dev): MIT, 2026-09-30, a Claude Code plugin with a quick-app "calibration kit". It holds a **photographically measured** profile of a Band 11, whose 212×520 capsule is the same panel as the Band 10. — [KNOWN_DEVICES.md](https://github.com/sohamashodiya/miband-dev/blob/main/plugins/miband-dev/data/KNOWN_DEVICES.md); [band11 CALIBRATION.md](https://github.com/sohamashodiya/miband-dev/blob/main/plugins/miband-dev/data/profiles/band11/CALIBRATION.md)
- [dargon682/xiaomi-band10-vela-emulator](https://github.com/dargon682/xiaomi-band10-vela-emulator): MIT, 2026-10-17, a write-up on building a 212×520 Band 10 virtual device. — [README](https://github.com/dargon682/xiaomi-band10-vela-emulator)
- [hefeishui0829/xiaomi-vela-docs](https://github.com/hefeishui0829/xiaomi-vela-docs): no license, 2026-10-03, an offline copy of the official Vela docs (148 JS quick-app pages) plus community docs.
- The official sample npm package `@aiot-project/vela-official-demo` is at v1.0.8, published 2022-08-19, with no license or repository metadata. It predates Band 9/10. — [npm registry](https://registry.npmjs.org/@aiot-project%2fvela-official-demo)
- The community projects above build with `aiot-toolkit` 2.0.5, which is the current npm `latest`. Pre-release lines exist: 2.0.6-beta.28 and 2.1.0-prender.17, the latter published 2026-10-14. — [npm registry](https://registry.npmjs.org/aiot-toolkit); [zhangchi1997 package.json](https://github.com/zhangchi1997/badminton_scoring/blob/main/package.json)

How the scaffolds handle multiple resolutions:
- miSmash and zhangchi1997 use `designWidth: 212`. miSmash computes page height as `screenHeight × 212 / screenWidth` from `device.getInfo`. — [miSmash README](https://github.com/loStefa/miSmash/blob/main/README.en.md)
- BandQQ ships build-time branches: band 192, bandpro 336, round watches 466, REDMI watch 432. A single `designWidth=192` build was "放大 2.25 倍" on a 432-wide screen. — [BandQQ README](https://github.com/Gsjsjzhznsz/BandQQ)

### Inferences
- For a Band 10 badminton scorer, a sensible base is miSmash's architecture, which is MIT and can be adapted with attribution: single page, pure rules module with tests, per-point `storage.set`, keep-screen-on in match. Add a badminton rules module covering 21/15 rules, serve court and doubles rotation.
- The other projects are useful as references for interaction ideas. Because they have no license, their code should not be copied.

### Gaps
- I did not compile or run any of these projects, and I could not verify the "tested on Band 10" statements beyond the authors' READMEs.
- Several popular community apps (e.g. 羽记) are closed source, so their implementation choices are unknown.

## Q3. Concrete developer pitfalls for Vela JS apps on Xiaomi bands

### Takeaway
The main risks, in rough order of how much they affect a scorer:
1. The app can be suspended or closed when the screen times out, so persist every point and keep the screen on during play.
2. The system owns the right-swipe "back" gesture, and narrow capsule ends eat the corners.
3. Band 10 supports only `vibrate({mode:'short'|'long'})`.
4. Large digits clip unless their box is at least about 1.33× the font size, and bold digits are proportional (width changes with the digits).
5. Several CSS and rendering behaviours differ between the emulator or browser previews and the real device.

### Cited Findings

#### Screen geometry and Band 9 ↔ Band 10 adaptation
- Official screen data:
  - **Band 9**: capsule, 1.62″, 192×490, 325 PPI, 96 dp wide, aspect ratio 0.4.
  - **Band 10**: capsule, 1.725″, 212×520, 326 PPI, 106 dp wide, aspect ratio 0.4.
  - Band 8 Pro and Band 9 Pro: rectangle 336×480.
  - DPR is 2.0 for both capsule bands.
  - — [Vela 多屏适配](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/); [媒体查询 device table](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/media-query.html)
- Xiaomi's recommended *design* resolution for capsule screens is **192×490** (ratio 0.39), not Band 10's 212×520. Xiaomi tells designers to keep main functions inside the safe area of the rounded ends. — [多屏设计](https://iot.mi.com/vela/quickapp/zh/guide/design/multi-screens.html)
- `px` is not physical: it scales against `designWidth`, "类似于rem". `dp` is a fixed unit (DPR = PPI/160). Media queries support `shape: circle | rect | pill-shaped`, and `device.getInfo()` returns `screenWidth`, `screenHeight` and `screenShape` (`pill-shaped`). — [适配规范](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/specs.html); [media-query](https://iot.mi.com/vela/quickapp/zh/guide/framework/style/media-query.html); [device](https://iot.mi.com/vela/quickapp/zh/features/basic/device.html)
- The capsule ends are large semicircles:
  - A calibration of a Band 11, which has the same 212×520 panel, measured an end radius of about **103.3 px** and confirmed that `designWidth 212` maps 1:1 to panel pixels (`design_scale` 1.025). — [miband-dev band11 CALIBRATION.md](https://github.com/sohamashodiya/miband-dev/blob/main/plugins/miband-dev/data/profiles/band11/CALIBRATION.md)
  - miSmash (Band 10) says to "count on a radius of about 90 px (on a 212 px width)" and uses 40 px top and 24 px bottom margins. — [miSmash README](https://github.com/loStefa/miSmash/blob/main/README.en.md)
  - Godminton (Band 10) says don't put buttons in the four corners, leave about 30 px top padding for headers, and make buttons full-width. — [watch-ui-gotchas](https://github.com/jinergenkai/badminton-system/blob/main/watch/docs/watch-ui-gotchas.md)
- Band 9 guidance (community): leave at least 24 px at the top and bottom because of the arcs, use about 8 px side padding, use a single-column layout only, and `designWidth: 192`. — [KaiTee 03-ui](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/03-ui-and-interaction.md)
- Real 192 → 212 porting bugs:
  - An input-method component laid out for 192 px "会整体偏左" (sits shifted left) on Band 10 and had to be re-laid out. Without `flex-shrink:0`, "10 个 60px 的键被挤成 21px" (ten 60 px keys get squeezed to 21 px). — [byxz-toolbox README](https://github.com/zhonglisycn/byxz-toolbox)
  - A Band 9 Pro → Band 10 port had to remove 336 px fixed container widths and shrink fonts and controls. — [Bingak README](https://github.com/Bingak/MiBand10-Daily-Word-Practice)
  - klikband's 192×490 layout is "untested" on Band 10. — [klikband](https://github.com/ashafizullah/klikband)

#### Touch targets and gestures (taps vs system swipe-back)
- Official events are `touchstart`, `touchmove`, `touchend`, `click`, `longpress` and `swipe` (left/right/up/down). There is **no `dblclick`**. `swipe` does not bubble, and it does not fire in a direction that has a scrollbar. — [通用事件](https://iot.mi.com/vela/quickapp/zh/components/general/events.html)
- `onBackPress` fires "当用户右滑返回或点击返回实体按键时" (when the user swipes right to go back or presses a physical back key). Returning `true` keeps the page and lets the app handle it. — [生命周期](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/lifecycle.html)
  - miSmash uses this to step back through its setup screens. — [miSmash index.ux](https://github.com/loStefa/miSmash/blob/main/src/pages/index/index.ux)
- Community findings on the swipe-back gesture:
  - "Right-swipe is reserved by the system as 'back' (`onBackPress`). Set-entry gestures must be vertical." This is a docs-based analysis for a Band 10 app. — [gym_log #5 comment](https://github.com/alikulovuzz/gym_log/issues/5#issuecomment-4968415100)
  - The system right-swipe captures swipes starting about 0–20 px from the left edge, so keep at least 14 px horizontal margins and prefer explicit buttons over horizontal swipes (Band 9 Pro experience). — [KaiTee 04-pitfalls](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/04-pitfalls-and-solutions.md)
  - On Band 9 Pro, an app's own "swipe right on page 1 → `router.back()`" exit did not work on the real device; the original author's comment says "pro/9：系统右滑返回不可用". — [dsband-vela-9pro-patch](https://github.com/shixun926-dotcom/dsband-vela-9pro-patch)
  - Whether the system back-swipe exits a single-page app on the Band 10/11 capsule is still recorded as "unknown" in the calibration profile. — [band11 CALIBRATION.md](https://github.com/sohamashodiya/miband-dev/blob/main/plugins/miband-dev/data/profiles/band11/CALIBRATION.md)
- Gesture designs used by existing scorers:
  - 羽记: vertical swipes to score, left swipe to undo. — [bandbbs #5807](https://www.bandbbs.cn/resources/5807/)
  - miSmash: tap to score, long-press to undo. — [miSmash README](https://github.com/loStefa/miSmash/blob/main/README.en.md)
  - pickleball-band: 212×260 px half-screen buttons with long-press undo, where "a long press consumes the release click". It also has a drag guard so swiping across the rally buttons records nothing. — [pickleball-band README](https://github.com/mahmoodw/pickleball-band)
- Double-tap has to be built by hand. zhangchi1997 waits 200 ms after a tap before applying +1, to see whether a second tap makes it a −1. Its code also notes "真机 touchend 偶发丢失" (on the real device `touchend` is occasionally lost), so it also resets the pressed style in `click`. — [score.ux](https://github.com/zhangchi1997/badminton_scoring/blob/main/src/pages/score/score.ux); [tapScore.js](https://github.com/zhangchi1997/badminton_scoring/blob/main/src/common/tapScore.js)
- Suggested target sizes (community, for 336-wide Band 9 Pro): primary buttons 44–48 px tall, gaps of at least 6 px between opposite actions, and icon hit areas of at least 28×32. — [KaiTee 03-ui](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/03-ui-and-interaction.md)
- Use flex layout with native `onclick` on each element. Don't position buttons absolutely or compute touch coordinates yourself ("真机踩出来的", learned on the real device). — [band-metronome](https://github.com/q879604/band-metronome)

#### Screen timeout, lifecycle and what happens to the app
- Official: an app that goes to the background "将会停止运行" (stops running) unless a whitelisted background feature (`system.audio`, `system.request` or `system.geolocation`) is declared and actively running. — [后台运行](https://iot.mi.com/vela/quickapp/zh/guide/framework/other/background-running.html)
- Official: "息屏后重新亮屏会重新触发onShow生命周期函数" (re-lighting the screen re-triggers `onShow`). — [注意事项](https://iot.mi.com/vela/quickapp/zh/guide/other/tips.html)
- Official: timers are bound to the page and do not run after the page is destroyed. — [生命周期](https://iot.mi.com/vela/quickapp/zh/guide/framework/script/lifecycle.html)
- Real-device experience on Band 9 Pro: after the screen goes off or the app is backgrounded, "JS 计时器会被系统挂起 → 息屏后节拍基本不会继续" (JS timers are suspended, so the metronome effectively stops). The author's workaround is minimum brightness (`setValue(1)` + `setMode(0)`) plus `setKeepScreenOn(true)`, restoring the user's settings on exit. — [band-metronome](https://github.com/q879604/band-metronome)
- Community advice: the band "在息屏或退回表盘时可能随时挂起或销毁应用" (may suspend or destroy the app when the screen goes off or the user returns to the watch face), so persist on every change and again in `onHide`/`onDestroy`. — [band-notepad](https://github.com/KaiTeeDreamChai/band-notepad); [KaiTee 04-pitfalls](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/04-pitfalls-and-solutions.md)
- Band 10 apps that keep the screen on:
  - miSmash (tested on Band 10) keeps the screen on only during a match via `brightness.setKeepScreenOn` and turns it off when leaving. It saves on every point; its Italian code comment explains why: "Il bracciale può chiudere l'app in qualsiasi momento" (the band can close the app at any moment). — [miSmash README](https://github.com/loStefa/miSmash/blob/main/README.en.md); [index.ux](https://github.com/loStefa/miSmash/blob/main/src/pages/index/index.ux)
  - zhangchi1997 keeps the screen on and dims to 30/255 after 3 s idle. It restores brightness on touch or on wrist-raise detected with `sensor.subscribeAccelerometer` (`interval: 'ui'`, about 60 ms), and restores mode and brightness in `onHide`. — [README](https://github.com/zhangchi1997/badminton_scoring)
  - Bingak (Band 10) offers an optional keep-screen-on setting. — [README](https://github.com/Bingak/MiBand10-Daily-Word-Practice)
- The official `brightness` page documents `setKeepScreenOn` but has no device-support table. — [brightness](https://iot.mi.com/vela/quickapp/zh/features/system/brightness.html)
- The accelerometer is officially supported on Band 9, 9 Pro and 10. — [sensor](https://iot.mi.com/vela/quickapp/zh/features/system/sensor.html)
- Still untested on hardware: a Band 10 project's on-device lifecycle test plan (does `setInterval` survive screen-off? warm or cold re-entry? `setKeepScreenOn` on Band 10? effect of a Mi Fitness workout?) is still open and blocked. Its docs-based inference is that the app is "frozen, not killed". — [gym_log #16](https://github.com/alikulovuzz/gym_log/issues/16); [gym_log #5 comment](https://github.com/alikulovuzz/gym_log/issues/5#issuecomment-4968415100)
- Single-source claim: "A native band workout still prevents opening Pickleball". In other words, while a built-in workout session is running, the third-party app cannot be opened. — [pickleball-band README](https://github.com/mahmoodw/pickleball-band)
- An alarm app found that the system alarm callback "快应用被杀后台时它不一定回调" (doesn't necessarily fire once the quick app has been killed in the background), so it added a once-per-second `setInterval` check. This is further evidence that apps do get killed (Band 9 Pro). — [Clock-Pro](https://github.com/WolfySpike/Clock-Pro)

#### Vibration behaviour
- Official: `vibrator.vibrate({mode})` with `"long"` or `"short"`, default long, is supported on Band 10. `vibrator.start/stop` (custom duration, interval and count) and `getSystemDefaultMode` are **not supported on Band 10**; only Xiaomi Watch S5 has them. — [振动 vibrator](https://iot.mi.com/vela/quickapp/zh/features/system/vibrator.html)
- Vibration intensity is system-level only ("设置 → 振动强度"), and only the two long/short levels are available on Band 9 Pro. — [band-metronome](https://github.com/q879604/band-metronome)
- j-iNFINITE calls `vibrator.vibrate({duration: 30})` and `({duration: 200})`, parameters the official API does not define. — [index.ux](https://github.com/j-iNFINITE/Badminton_score_app/blob/master/src/pages/index/index.ux); [official API](https://iot.mi.com/vela/quickapp/zh/features/system/vibrator.html)
- Wrap vibration calls in try/catch, because emulators may not support them. A claim that vibration may be disabled at very low battery or in power saving is unverified. — [hermes pitfalls §8](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md); [KaiTee 03-ui](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/03-ui-and-interaction.md)

#### Storage persistence and updates
- Official `@system.storage` is an asynchronous string key-value store (`get`/`set`/`clear`/`delete`). Setting a key to an empty string **deletes** it. — [storage](https://iot.mi.com/vela/quickapp/zh/features/data/storage.html)
- No storage quota is documented. Only `internal://files/` is described as permanent; `cache` "may be deleted by the system". — [gym_log #5 comment](https://github.com/alikulovuzz/gym_log/issues/5#issuecomment-4968415100)
- Reading storage defensively:
  - The `storage.get` success callback receives the value string directly, so read defensively. — [hermes pitfalls §5.3/§12](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md)
  - miSmash parses either a string or a `{value}` object, and falls back to an empty state if no callback arrives within 1.5 s. — [index.ux](https://github.com/loStefa/miSmash/blob/main/src/pages/index/index.ux)
  - Treating `storage.get` as synchronous causes "读档偶发状态错乱" (occasional corrupted state on load). — [Senren-Banka README](https://github.com/hrk666666/Senren-Banka-MiBand-10)
- Write patterns:
  - Throttle writes, e.g. a 400 ms merge. — [Bingak](https://github.com/Bingak/MiBand10-Daily-Word-Practice)
  - Save before any other side effect. — [pickleball-band](https://github.com/mahmoodw/pickleball-band)
- Update and uninstall pitfalls:
  - "With the same `versionCode` the band keeps the old version." Changing the package id installs a second app. — [miSmash README](https://github.com/loStefa/miSmash/blob/main/README.en.md)
  - "Uninstallation may erase the saved game", so keep the package name and signing key when updating. — [pickleball-band README](https://github.com/mahmoodw/pickleball-band)
  - Old icons can stay cached after reflashing; uninstall first or rename the icon folder. — [QRWallet README](https://github.com/mastermaiolo/QRWallet)

#### Large-number font rendering and text
- Official: `font-weight` supports only normal and bold (numeric values below 550 render normal, otherwise bold). The default `font-size` is 30px. — [text](https://iot.mi.com/vela/quickapp/zh/components/basic/text.html)
- Measured on the 212×520 panel (Band 11, firmware 4.100.139):
  - The text line box is **1.33 em**.
  - If a `<text>` box is shorter than its line box, the text is **top-aligned and clipped**; if taller, it is centred and not clipped.
  - Digit ink spans about 0.25–1.06 em.
  - Bold digits are **proportional**: "1111" is 1.79 em wide while "0000" is 2.61 em.
  - — [band11 profile.json](https://github.com/sohamashodiya/miband-dev/blob/main/plugins/miband-dev/data/profiles/band11/profile.json)
- Working big-digit settings on Band 10:
  - miSmash uses `font-size: 96px; font-weight: bold` in a 110 px-high box with `line-height: 110px` (design width 212). — [index.ux](https://github.com/loStefa/miSmash/blob/main/src/pages/index/index.ux)
  - zhangchi1997 uses 88px bold. — [score.ux](https://github.com/zhangchi1997/badminton_scoring/blob/main/src/pages/score/score.ux)
  - j-iNFINITE shrinks from 130 → 90 → 62 px as the score reaches 10 or 22 (336 design). — [index.ux](https://github.com/j-iNFINITE/Badminton_score_app/blob/master/src/pages/index/index.ux)
- Use `text-align: center` with a fixed `width` on `<text>`. Per Godminton, this is "the only way to keep text steady when the character count changes (x1 vs x12)". — [watch-ui-gotchas](https://github.com/jinergenkai/badminton-system/blob/main/watch/docs/watch-ui-gotchas.md)
- **Conflict:** QRWallet says "Never use `font-weight: bold` with MiSans on Vela" because faux-bold looks pixelated or blurry. — [QRWallet](https://github.com/mastermaiolo/QRWallet); **contradicted by** miSmash's Band 10-tested bold 96px digits ([miSmash](https://github.com/loStefa/miSmash/blob/main/src/pages/index/index.ux)). The calibration profile records whether normal differs from bold as "unknown". — [profile.json](https://github.com/sohamashodiya/miband-dev/blob/main/plugins/miband-dev/data/profiles/band11/profile.json)
- Other text pitfalls:
  - Nested styled `<span>` inside `<text>` renders badly. — [KaiTee 04-pitfalls](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/04-pitfalls-and-solutions.md)
  - Emoji show as boxes or garbled text. — [Senren-Banka README](https://github.com/hrk666666/Senren-Banka-MiBand-10)

#### CSS and rendering quirks seen on real devices
- miSmash, from the real Band 10:
  - A full-screen coloured background stayed black whether set by a dynamic class or inline style; an inner card with a template class and a fixed height worked.
  - "Animations shorter than half a second can't be seen."
  - — [miSmash README](https://github.com/loStefa/miSmash/blob/main/README.en.md)
- Calibration, measured on Band 11:
  - Ignored: `z-index`, per-corner `border-radius` and per-side borders.
  - `overflow: visible` still clips.
  - Swapping a class restarts animations.
  - — [band11 profile.json](https://github.com/sohamashodiya/miband-dev/blob/main/plugins/miband-dev/data/profiles/band11/profile.json)
- Godminton, verified on Band 10:
  - `<list-item>` without an explicit `height` renders nothing.
  - `right:` is ignored for absolute children of `<stack>`.
  - `prompt.showToast` always draws in the centre "đè lên đúng chỗ điểm số" (right on top of the score) and cannot be moved, so make a custom toast.
  - Undeclared page properties can be dropped, so declare working state in `private` and reassign arrays.
  - — [watch-ui-gotchas](https://github.com/jinergenkai/badminton-system/blob/main/watch/docs/watch-ui-gotchas.md)
- Unsupported CSS:
  - No `:active` or other pseudo-classes, so use dynamic classes for pressed states. — [hermes pitfalls §3](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md)
  - Only class selectors and no gradients. — [band-metronome](https://github.com/q879604/band-metronome)
- `<style src="…">` is silently dropped by aiot-toolkit 2.0.5, so use inline `<style>`. — [hermes pitfalls §11](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md)

#### Memory and performance
- Official memory checklist: keep non-UI data out of the ViewModel, update objects in place, clear timers in `onDestroy`, release file and storage data after use, use `static` for non-changing nodes, and call `global.runGC()` sparingly. — [内存优化](https://iot.mi.com/vela/quickapp/zh/guide/best-practice/memory.html)
- Official acceptance criterion: home-page first meaningful paint must be at most 2000 ms. — [验收标准](https://iot.mi.com/vela/quickapp/zh/guide/publish/acceptance-criteria.html)
- Reboots and crashes:
  - Building a 10k-object word array at import time spiked memory and caused "安装或启动时设备重启" (the device rebooted at install or launch) on a band. — [Bingak README](https://github.com/Bingak/MiBand10-Daily-Word-Practice)
  - On Band 9 and 9 Pro, a top-level load of `@app-module/system.audio` (a module that firmware lacks) triggered a system reboot. — [Senren-Banka README](https://github.com/hrk666666/Senren-Banka-MiBand-10)
  - On Band 10, a game page reboot was suspected to come from a changed system-module import path or the `--enable-jsc` release build. The fix was never verified. — [Sanoba-Witch PR #2](https://github.com/hrk666666/Sanoba-Witch-MiBand-10/pull/2)
  - QRWallet says `--enable-jsc` bytecode "causes black-screen crashes on HyperOS 2 / Band 10" (single source). — [QRWallet](https://github.com/mastermaiolo/QRWallet)
- Unverified community numbers:
  - Single-page apps over many `router.push` pages to avoid memory exhaustion; keep the RPK under 50 KB. — [KaiTee 04-pitfalls](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/04-pitfalls-and-solutions.md)
  - About 16 MB RAM and a quick-app partition of about 8 MB on Band 10. — [vela-band-chat](https://github.com/dargon682/vela-band-chat)
  - The 50 KB figure is contradicted by working larger apps, e.g. a billiards game "不到 150 KB" (under 150 KB). — [bandbbs #8272](https://www.bandbbs.cn/resources/8272/)

#### Emulator or preview vs real device
- There is no official Band 10 emulator image:
  - The community uses the generic `vela-miwear-watch-5.0` image with a custom 212×520 VVD, and `hw.lcd.density=326` is rejected (use 320). — [dargon682 emulator README](https://github.com/dargon682/xiaomi-band10-vela-emulator)
  - Another project reports the IDE emulator ships a `xiaomi_band_10` 212×520 profile. On Windows its window showed black (gRPC screenshots worked), "emulator touch coords are mis-scaled", and `adb push` was flaky. — [gym_log #1](https://github.com/alikulovuzz/gym_log/issues/1)
- The IDE does not kill the old process on relaunch, so stale code can appear; reboot the emulator. Band 10's per-device tables forbid `fetch` and geolocation, so such features cannot be validated there. — [hermes pitfalls §13](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md); [official fetch support table: 小米手环 10 不支持](https://iot.mi.com/vela/quickapp/zh/features/network/fetch.html)
- There is no live console on a retail band:
  - Officially, logs are pulled via 小米运动健康 → 我的 → 关于 → Debug → 拉取固件日志, using a debug-capable Mi Fitness build that Xiaomi distributes through business contact. — [官方常见问题](https://iot.mi.com/vela/quickapp/zh/guide/other/faq.html)
  - Community advice is to wrap every API call in try/catch and print errors into an on-screen debug `<text>`. — [KaiTee 04-pitfalls](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/04-pitfalls-and-solutions.md)
  - Show a build label in the UI, because every flash is a full reinstall. — [watch-ui-gotchas](https://github.com/jinergenkai/badminton-system/blob/main/watch/docs/watch-ui-gotchas.md)
- Browser previews are not Vela rendering:
  - miSmash's preview images "may differ slightly", and corners, backgrounds and animations behaved differently on Band 10. — [miSmash README](https://github.com/loStefa/miSmash/blob/main/README.en.md)
  - pickleball-band's Playwright preview "does not emulate Vela rendering". — [pickleball-band README](https://github.com/mahmoodw/pickleball-band)

#### Band-10 API availability and build/manifest gotchas
- API availability on Band 10, from the official per-device tables:
  - Not supported: `@system.fetch` ([fetch](https://iot.mi.com/vela/quickapp/zh/features/network/fetch.html)); `vibrator.start/stop` ([vibrator](https://iot.mi.com/vela/quickapp/zh/features/system/vibrator.html)).
  - Supported: accelerometer and pressure ([sensor](https://iot.mi.com/vela/quickapp/zh/features/system/sensor.html)).
  - Also reported not supported on Band 10, citing Xiaomi's tables: `@system.network` and `@system.bluetooth`. There is no heart-rate API anywhere in the framework. — [gym_log #5 comment](https://github.com/alikulovuzz/gym_log/issues/5#issuecomment-4968415100)
- Band 11 (212×520) shares the Band 10 panel, so a Band 10 build is likely portable to it. bandbbs already has a 小米手环11 category. — [KNOWN_DEVICES.md](https://github.com/sohamashodiya/miband-dev/blob/main/plugins/miband-dev/data/KNOWN_DEVICES.md); [bandbbs category 113](https://www.bandbbs.cn/resources/categories/113/)
- Every imported `@system.*` must be declared in manifest `features`. Sources disagree on what happens if one is missing:
  - The build fails with "missing feature" (even for `@system.router`). — [hermes §11.2](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md)
  - `@system.app` is needed despite the docs. — [miSmash](https://github.com/loStefa/miSmash/blob/main/README.en.md)
  - Contrasting report: the build only warns, then the app dies at runtime. — [watch-ui-gotchas](https://github.com/jinergenkai/badminton-system/blob/main/watch/docs/watch-ui-gotchas.md)
- Manifest claims from one guide:
  - `deviceTypeList` must be `["watch"]`; `"band"` builds but fails to install with `miwear_install failed: undefined`. — [hermes §1.1](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md)
  - The same guide's claims that `simulationVersion` is mandatory and that "units must use dp" are **contradicted**: miSmash omits `simulationVersion`, uses `px` and is tested on Band 10 ([manifest](https://github.com/loStefa/miSmash/blob/main/src/manifest.json)). Xiaomi's docs define `px` as the primary adaptive unit ([specs](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/specs.html)).
- Page data property names must not start with `$` or `_` (official page-data rule, as reported). — [hermes §12](https://github.com/paraflu/hermes-skill-xiaomi-miband10-vela-js/blob/main/references/development-pitfalls-and-tips.md)
- Sideload-related (installation is out of scope):
  - Tools such as AstroBox accept the debug-signed build; use `npm run build`, not `release`. — [miSmash](https://github.com/loStefa/miSmash/blob/main/README.en.md); [KaiTee 04-pitfalls](https://github.com/KaiTeeDreamChai/xiaomi-band-dev-guide/blob/main/docs/04-pitfalls-and-solutions.md)
  - "Notify for Xiaomi" and Mi Fitness compete for the band's BLE link. — [Godminton watch/README](https://github.com/jinergenkai/badminton-system/blob/main/watch/README.md)

### Inferences
- **Persistence and keep-awake.**
  - Assume the scorer can be suspended or closed at any screen-off. Write the full match state to storage after every point, and restore it in `onInit` and `onShow`. Keep `onShow` idempotent, because it fires on every wake.
  - During a match, call `setKeepScreenOn(true)` with an auto-dim (the zhangchi1997 pattern). Release it in `onHide`/`onDestroy`.
  - Never rely on timers while the screen is off.
- **Layout across Band 9 and Band 10.** `px` scales by width only, and the aspect ratios differ (192/490 = 0.392 vs 212/520 = 0.408). So a fixed-height layout designed for one capsule will not fit the other exactly:
  - With `designWidth 192`, 490 design px of height becomes about 541 physical px on Band 10, which exceeds 520.
  - With `designWidth 212` on Band 9, 520 design px becomes about 471 px of 490.
  - Use `flex: 1` or percentage halves, or compute page height from `device.getInfo` as miSmash does.
- **Safe area and digit boxes.**
  - Keep tappable controls and score digits in the straight middle of the capsule, roughly y ≈ 106–414 on Band 10 given the ~103 px end radius. Alternatively give at least 30–40 px top and bottom margins to full-width halves.
  - Size digit boxes at about 1.33× the font size or more. Two bold digits need about 1.31 em of width, so a single two-digit score on a 212 px width tops out around 150 px font-size. Two scores side by side need roughly half that.
- **Gestures.** Prefer taps on large top/bottom halves plus long-press undo. Avoid right swipes and left-edge interactions. If you use swipes (like 羽记), keep them vertical and outside scroll containers.
- **Vibration.** Only short and long buzzes exist on Band 10. Distinguish events by pattern (e.g. a double short via `setTimeout`) rather than by duration.

### Gaps
- No hardware test results were found for:
  - whether `setInterval` keeps running with the screen off on Band 10;
  - whether re-entry after a long screen-off is warm or cold;
  - how long `setKeepScreenOn` holds against system policy;
  - how much battery an hour of keep-screen-on costs on Band 10.
- The "native workout blocks third-party apps" claim has one source. Whether a scorer can run alongside the built-in 羽毛球 workout is unverified.
- No official minimum touch-target guideline for Vela was found.
- The official capsule safe-area figure is an image without numbers.
- Real-device behaviour of the system back-swipe on a single-page Band 10 app is recorded as "unknown" in the calibration data.
- RAM, partition-size and RPK-size limits for Band 10 are not documented officially. The community numbers above are unverified.

## Q4. (Lower priority) Badminton scoring rules the app must implement

### Takeaway
Implement both systems:
- **3×21**: rally scoring, best of 3, game to 21. At 20-all a 2-point lead is needed, and at 29-all the 30th point wins. Change ends in game 3 at 11.
- **3×15**: best of 3, game to 15. At 14-all a 2-point lead is needed, and at 20-all the 21st point wins (cap 21). Change ends in game 3 at 8, and the interval is at 8.

BWF members approved 3×15 on 25 April 2026, and it becomes the main Laws on **4 January 2027**. 3×21 remains an approved alternative.

### Cited Findings
- **3×15 law text** (BWF "Laws of Badminton for 3 x 15", April 2025 member-association update, hosted by the Croatian association):
  - 7.1: best of three games.
  - 7.2: "A game shall be won by the side which first scores 15 points".
  - 7.3: the side winning a rally adds a point.
  - 7.4: "If the score becomes 14-all, the side which gains a two point lead first, shall win that game".
  - 7.5: "If the score becomes 20-all, the side scoring the 21st point shall win that game".
  - 7.6: the game winner serves first in the next game.
  - 8.1: change ends after game 1, after game 2 if there is a third, and "in the third game when a side first scores 8 points".
  - 16.2: intervals of ≤60 s "when the leading score reaches 8 points" and ≤120 s between games.
  - — [BWF 3×15 Laws PDF (cba.hr)](https://www.cba.hr/storage/reports/U-svibnju-zapoinje-novi-testni-sustav-bodovanja-20250404071756/files/3%20x%2015%20Scoring%20System%20Test%20-%20Laws%20-%20April%202025%20-%20MA%20Update.pdf)
- **Adoption timeline:**
  - The BWF Council endorsed "3×15 (setting to 21)" on 9 Nov 2024, and the system was trialled at selected tournaments from April 2025. — [BadmintonPlanet](https://www.badmintonplanet.com/?p=24061)
  - It was put to a vote at the 25 April 2026 AGM. — [NST](https://www.nst.com.my/amp/sports/badminton/2026/02/1376963/bwf-puts-15-point-scoring-voting-another-shake)
  - Members approved it at the 87th AGM in Horsens by the required two-thirds majority; it replaces 3×21 and takes effect 4 Jan 2027. — [Bernama](https://bernama.com/en/news.php?id=2549450); [Malay Mail](https://www.malaymail.com/news/sports/2026/04/27/less-is-more-shuttlers-divided-over-badmintons-shift-to-15-point-scoring-format/217841); [USA Badminton](https://usabadminton.org/bwf-approves-3x15-scoring-system/)
- **Alternative Laws** (BWF Statutes Section 4.1.4, "In Force: 04 January 2027, Version 2.0") allow, by prior arrangement:
  - one game of 21 (change ends at 11);
  - **best of 3 games of 21**, with 20-all → two-point lead, 29-all → 30th point wins, change ends in game 3 at 11;
  - **best of 5 games of 11**, with change ends in game 5 at 6.
  - — [Alternative Laws PDF (ghanabadminton.org)](https://ghanabadminton.org/wp-content/uploads/Section-4.1.4-Alternative-Laws-of-Badminton-04-January-2027-V2.0.pdf)
- **3×21 summary**, consistent with the above: play to 21, 20–20 needs a two-point lead, 29–29 goes to a golden point of 30. Players change ends at the start of games 2 and 3 and at 11 points in game 3. The winner of a game serves first in the next. — [Wikipedia: Badminton](https://en.wikipedia.org/wiki/Badminton)
- **Serving rules** (rally scoring):
  - When the serving side loses a rally, service passes to the opponents.
  - In singles, the server serves from the right court when their score is even and from the left when odd.
  - In doubles:
    - If the serving side wins the rally, the same server continues, switching service courts.
    - If the receiving side wins, the player in the right court serves when their new score is even, and the left when odd.
    - Players' courts are determined by positions at the start of the previous rally.
    - For the first rally of any doubles game, the serving pair chooses the server and the receiving pair chooses the receiver.
  - — [Wikipedia: Badminton](https://en.wikipedia.org/wiki/Badminton)
- Existing band apps implement the 21-point rules as described: zhangchi1997's `isGameWon` uses 21, win-by-2 and cap 30. j-iNFINITE adds best-of-3 and the change-ends prompt at 11 in game 3. — [badminton.js](https://github.com/zhangchi1997/badminton_scoring/blob/main/src/common/badminton.js); [j-iNFINITE index.ux](https://github.com/j-iNFINITE/Badminton_score_app/blob/master/src/pages/index/index.ux)

### Inferences
- A single rules engine parameterised by (points-to-win, deuce-at, cap, ends-switch point, interval point) covers both systems:
  - 3×21 = (21, 20, 30, 11, 11)
  - 3×15 = (15, 14, 21, 8, 8)
- Serve-court parity (even = right, odd = left) and doubles server rotation are the same in both systems.
- A China-version user playing recreationally will likely keep 21-point games for some time. Offer both systems, with 21 as the default until 2027 and a one-tap switch.

### Gaps
- The Alternative Laws V2.0 PDF text, under the 3×21 option, lists the mid-game interval "when the leading score reaches 8 points". This looks like a drafting carry-over: the pre-2027 3×21 Laws used 11. I could not confirm against the BWF original, because bwfbadminton.com and corporate.bwfbadminton.com return 403 to automated fetches.
- The BWF "Key Changes Under the 3×15 Scoring System" page (26 Apr 2026) could not be fetched directly.
- I did not research whether the Chinese Badminton Association (中国羽协) will adopt 3×15 for domestic events.
