import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createStore, DEFAULT_SETTINGS } from '../src/common/store.js'

// 模拟 @system.storage：同步回调，数据存在 data 里
function fakeStorage(initial) {
  const data = Object.assign({}, initial)
  return {
    data,
    get(opts) {
      opts.success(opts.key in data ? data[opts.key] : '')
    },
    set(opts) {
      data[opts.key] = opts.value
      opts.success()
    },
  }
}

const record = { v: 1, rule: 21, pts: 'RRB', acked: 0 }

test('没有存储的比赛：返回 null，不算错误', async () => {
  const store = createStore(fakeStorage())
  assert.equal(await store.loadMatch(), null)
  assert.equal(store.lastError(), '')
})

test('保存后能读回比赛记录，存的是 JSON 字符串', async () => {
  const storage = fakeStorage()
  const store = createStore(storage)
  assert.equal(await store.saveMatch(record), true)
  assert.equal(typeof storage.data['bs.match'], 'string')
  assert.deepEqual(await store.loadMatch(), record)
})

test('success 回调给的是 { value } 对象时也能读', async () => {
  const storage = {
    get(opts) {
      opts.success({ value: JSON.stringify(record) })
    },
  }
  assert.deepEqual(await createStore(storage).loadMatch(), record)
})

test('损坏或不合法的比赛记录：返回 null', async () => {
  assert.equal(await createStore(fakeStorage({ 'bs.match': '{oops' })).loadMatch(), null)
  const v2 = JSON.stringify({ v: 2, rule: 21, pts: '', acked: 0 })
  assert.equal(await createStore(fakeStorage({ 'bs.match': v2 })).loadMatch(), null)
})

test('读取失败：返回 null，错误码 S1', async () => {
  const failing = createStore({ get: (opts) => opts.fail() })
  assert.equal(await failing.loadMatch(), null)
  assert.equal(failing.lastError(), 'S1')
  const throwing = createStore({
    get() {
      throw new Error('boom')
    },
  })
  assert.equal(await throwing.loadMatch(), null)
  assert.equal(throwing.lastError(), 'S1')
})

test('读取一直没有回调：超时后返回 null，错误码 S1', async () => {
  const store = createStore({ get() {} }, 10)
  assert.equal(await store.loadMatch(), null)
  assert.equal(store.lastError(), 'S1')
})

test('写入失败：返回 false，错误码 S2', async () => {
  const store = createStore({ set: (opts) => opts.fail() })
  assert.equal(await store.saveMatch(record), false)
  assert.equal(store.lastError(), 'S2')
})

test('没有设置：返回默认设置', async () => {
  const settings = await createStore(fakeStorage()).loadSettings()
  assert.deepEqual(settings, { v: 1, rule: 21, vibrate: true, keepOn: true })
  assert.deepEqual(DEFAULT_SETTINGS, { v: 1, rule: 21, vibrate: true, keepOn: true })
})

test('设置中不合法的字段用默认值补上', async () => {
  const raw = JSON.stringify({ v: 1, rule: 15, vibrate: 'yes', keepOn: false })
  const settings = await createStore(fakeStorage({ 'bs.settings': raw })).loadSettings()
  assert.deepEqual(settings, { v: 1, rule: 15, vibrate: true, keepOn: false })
})

test('设置能保存并读回', async () => {
  const store = createStore(fakeStorage())
  const settings = { v: 1, rule: 15, vibrate: false, keepOn: true }
  assert.equal(await store.saveSettings(settings), true)
  assert.deepEqual(await store.loadSettings(), settings)
})
