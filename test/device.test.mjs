import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createDevice } from '../src/common/device.js'

// 假的振动、亮度模块和计时器：计时器立即执行，并记下延迟
function setup(overrides) {
  const calls = []
  const delays = []
  const vibrator = { vibrate: (opts) => calls.push('vibrate:' + opts.mode) }
  const brightness = { setKeepScreenOn: (opts) => calls.push('keep:' + opts.keepScreenOn) }
  const timer = (fn, ms) => {
    delays.push(ms)
    fn()
  }
  const o = overrides || {}
  const device = createDevice(o.vibrator || vibrator, o.brightness || brightness, timer)
  return { calls, delays, device }
}

test('得分、撤销：短震一次', () => {
  for (const event of ['point', 'undo']) {
    const { calls, delays, device } = setup()
    device.buzz(event, true)
    assert.deepEqual(calls, ['vibrate:short'])
    assert.deepEqual(delays, [])
  }
})

test('一局结束：长震一次', () => {
  const { calls, device } = setup()
  device.buzz('game', true)
  assert.deepEqual(calls, ['vibrate:long'])
})

test('比赛结束：长震两次，间隔 800ms', () => {
  const { calls, delays, device } = setup()
  device.buzz('match', true)
  assert.deepEqual(calls, ['vibrate:long', 'vibrate:long'])
  assert.deepEqual(delays, [800])
})

test('决胜局换边：短震两次，间隔 300ms', () => {
  const { calls, delays, device } = setup()
  device.buzz('swapEnds', true)
  assert.deepEqual(calls, ['vibrate:short', 'vibrate:short'])
  assert.deepEqual(delays, [300])
})

test('振动关闭或未知事件：不震', () => {
  const { calls, device } = setup()
  device.buzz('point', false)
  device.buzz('nope', true)
  device.buzz(null, true)
  assert.deepEqual(calls, [])
})

test('屏幕常亮开关', () => {
  const { calls, device } = setup()
  device.keepScreenOn(true)
  device.keepScreenOn(false)
  assert.deepEqual(calls, ['keep:true', 'keep:false'])
})

test('振动接口出错：不抛错，错误码 V', () => {
  const vibrator = {
    vibrate() {
      throw new Error('boom')
    },
  }
  const { device } = setup({ vibrator })
  device.buzz('point', true)
  assert.equal(device.lastError(), 'V')
})

test('常亮接口失败回调：错误码 K', () => {
  const brightness = { setKeepScreenOn: (opts) => opts.fail() }
  const { device } = setup({ brightness })
  device.keepScreenOn(true)
  assert.equal(device.lastError(), 'K')
})
