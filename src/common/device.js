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
