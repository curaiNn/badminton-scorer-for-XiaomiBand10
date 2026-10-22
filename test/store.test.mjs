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

test('没有存储的比赛：ok 为 true、record 为 null，不算错误', async () => {
  const store = createStore(fakeStorage())
  assert.deepEqual(await store.loadMatch(), { ok: true, record: null })
  assert.equal(store.lastError(), '')
})

test('保存后能读回比赛记录，存的是 JSON 字符串', async () => {
  const storage = fakeStorage()
  const store = createStore(storage)
  assert.equal(await store.saveMatch(record), true)
  assert.equal(typeof storage.data['bs.match'], 'string')
  const loaded = await store.loadMatch()
  assert.equal(loaded.ok, true)
  assert.deepEqual(loaded.record, record)
})

test('success 回调给的是 { value } 对象时也能读', async () => {
  const storage = {
    get(opts) {
      opts.success({ value: JSON.stringify(record) })
    },
  }
  const loaded = await createStore(storage).loadMatch()
  assert.equal(loaded.ok, true)
  assert.deepEqual(loaded.record, record)
})

test('比赛记录不是合法 JSON：ok 为 true、record 为 null，错误码 S3', async () => {
  const store = createStore(fakeStorage({ 'bs.match': '{oops' }))
  assert.deepEqual(await store.loadMatch(), { ok: true, record: null })
  assert.equal(store.lastError(), 'S3')
})

test('比赛记录校验不通过（版本号不认识）：ok 为 true、record 为 null，错误码 S3', async () => {
  const v2 = JSON.stringify({ v: 2, rule: 21, pts: '', acked: 0 })
  const store = createStore(fakeStorage({ 'bs.match': v2 }))
  assert.deepEqual(await store.loadMatch(), { ok: true, record: null })
  assert.equal(store.lastError(), 'S3')
})

test('没有存储的比赛（{ value: 空串 }）：不算错误', async () => {
  const store = createStore({
    get(opts) {
      opts.success({ value: '' })
    },
  })
  assert.deepEqual(await store.loadMatch(), { ok: true, record: null })
  assert.equal(store.lastError(), '')
})

test('读取失败：ok 为 false、record 为 null，错误码 S1', async () => {
  const failing = createStore({ get: (opts) => opts.fail() })
  assert.deepEqual(await failing.loadMatch(), { ok: false, record: null })
  assert.equal(failing.lastError(), 'S1')
  const throwing = createStore({
    get() {
      throw new Error('boom')
    },
  })
  assert.deepEqual(await throwing.loadMatch(), { ok: false, record: null })
  assert.equal(throwing.lastError(), 'S1')
})

test('读取一直没有回调：超时后 ok 为 false，错误码 S1', async () => {
  const store = createStore({ get() {} }, 10)
  assert.deepEqual(await store.loadMatch(), { ok: false, record: null })
  assert.equal(store.lastError(), 'S1')
})

test('写入失败：返回 false，错误码 S2', async () => {
  const store = createStore({ set: (opts) => opts.fail() })
  assert.equal(await store.saveMatch(record), false)
  assert.equal(store.lastError(), 'S2')
})

test('没有设置：返回默认设置，ok 为 true', async () => {
  const loaded = await createStore(fakeStorage()).loadSettings()
  assert.equal(loaded.ok, true)
  assert.deepEqual(loaded.settings, { v: 1, rule: 21, vibrate: true, keepOn: true })
  assert.deepEqual(DEFAULT_SETTINGS, { v: 1, rule: 21, vibrate: true, keepOn: true })
})

test('设置中不合法的字段用默认值补上', async () => {
  const raw = JSON.stringify({ v: 1, rule: 15, vibrate: 'yes', keepOn: false })
  const loaded = await createStore(fakeStorage({ 'bs.settings': raw })).loadSettings()
  assert.equal(loaded.ok, true)
  assert.deepEqual(loaded.settings, { v: 1, rule: 15, vibrate: true, keepOn: false })
})

test('设置能保存并读回', async () => {
  const store = createStore(fakeStorage())
  const settings = { v: 1, rule: 15, vibrate: false, keepOn: true }
  assert.equal(await store.saveSettings(settings), true)
  const loaded = await store.loadSettings()
  assert.equal(loaded.ok, true)
  assert.deepEqual(loaded.settings, settings)
})

test('loadSettings 读取失败：默认设置，ok 为 false，错误码 S1', async () => {
  const store = createStore({ get: (opts) => opts.fail() })
  const loaded = await store.loadSettings()
  assert.equal(loaded.ok, false)
  assert.deepEqual(loaded.settings, { v: 1, rule: 21, vibrate: true, keepOn: true })
  assert.equal(store.lastError(), 'S1')
})

test('超时之后才到的回调被忽略', async () => {
  let savedOpts = null
  const store = createStore(
    {
      get(opts) {
        savedOpts = opts
      },
    },
    10
  )
  assert.deepEqual(await store.loadMatch(), { ok: false, record: null })
  assert.doesNotThrow(() => {
    savedOpts.success(JSON.stringify(record))
    savedOpts.fail()
  })
  assert.equal(store.lastError(), 'S1')
})

test('异步回调也能读到', async () => {
  const store = createStore({
    get(opts) {
      setTimeout(() => opts.success(JSON.stringify(record)), 0)
    },
  })
  const loaded = await store.loadMatch()
  assert.equal(loaded.ok, true)
  assert.deepEqual(loaded.record, record)
})

test('错误码在之后成功时不清除', async () => {
  let n = 0
  const store = createStore({
    get(opts) {
      n += 1
      if (n === 1) opts.fail()
      else opts.success('')
    },
  })
  assert.equal((await store.loadMatch()).ok, false)
  assert.equal((await store.loadMatch()).ok, true)
  assert.equal(store.lastError(), 'S1')
})

test('序列化失败：返回 false，错误码 S2，不调用存储', async () => {
  let calls = 0
  const store = createStore({
    set(opts) {
      calls += 1
      opts.success()
    },
  })
  const circ = {}
  circ.self = circ
  assert.equal(await store.saveMatch(circ), false)
  assert.equal(store.lastError(), 'S2')
  assert.equal(await store.saveMatch(undefined), false)
  assert.equal(calls, 0)
})

test('写入抛错：返回 false，错误码 S2', async () => {
  const store = createStore({
    set() {
      throw new Error('boom')
    },
  })
  assert.equal(await store.saveMatch(record), false)
  assert.equal(store.lastError(), 'S2')
})

test('DEFAULT_SETTINGS 不可修改', () => {
  assert.equal(Object.isFrozen(DEFAULT_SETTINGS), true)
})
