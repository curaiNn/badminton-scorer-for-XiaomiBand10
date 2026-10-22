// 读写比赛记录与设置。系统存储模块从参数传入（页面里传 @system.storage），便于在 Node 中测试。
// 读写都返回 Promise，失败不抛错：读失败返回 null 或默认设置，写失败返回 false，并记下错误码。
import { normalize } from './match.js'
import { isRule } from './rules.js'

const MATCH_KEY = 'bs.match'
const SETTINGS_KEY = 'bs.settings'

export const DEFAULT_SETTINGS = Object.freeze({ v: 1, rule: 21, vibrate: true, keepOn: true })

export function normalizeSettings(raw) {
  const d = DEFAULT_SETTINGS
  const ok = raw && typeof raw === 'object' && raw.v === 1
  return {
    v: 1,
    rule: ok && isRule(raw.rule) ? raw.rule : d.rule,
    vibrate: ok && typeof raw.vibrate === 'boolean' ? raw.vibrate : d.vibrate,
    keepOn: ok && typeof raw.keepOn === 'boolean' ? raw.keepOn : d.keepOn,
  }
}

// storage.get 的 success 可能直接给字符串，也可能给 { value: 字符串 }；取不到字符串时当作空串
function storedText(d) {
  if (typeof d === 'string') return d
  if (d && typeof d === 'object' && typeof d.value === 'string') return d.value
  return ''
}

function parseJson(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (e) {
    return null
  }
}

export function createStore(storage, timeoutMs = 1500) {
  // 最近一次错误码，成功后不清除：零售手环没有控制台，偶发故障也要在版本号后面留下痕迹
  let lastError = ''

  // 统一处理：只结算一次、超时兜底、记录错误码
  function call(method, opts, onSuccess, failValue, errorCode) {
    return new Promise((resolve) => {
      let done = false
      const finish = (value, error) => {
        if (done) return
        done = true
        clearTimeout(timer)
        if (error) lastError = error
        resolve(value)
      }
      const timer = setTimeout(() => finish(failValue, errorCode), timeoutMs)
      try {
        storage[method](
          Object.assign({}, opts, {
            success: (d) => finish(onSuccess(d)),
            fail: () => finish(failValue, errorCode),
          })
        )
      } catch (e) {
        finish(failValue, errorCode)
      }
    })
  }

  // ok 为 false 表示这次读失败或超时，调用方应保留内存里的状态，不能当成「没有记录」
  function read(key) {
    return call(
      'get',
      { key: key, default: '' },
      (d) => {
        const text = storedText(d)
        return { ok: true, text: text, value: parseJson(text) }
      },
      { ok: false, text: '', value: null },
      'S1'
    )
  }

  function write(key, value) {
    let text
    try {
      text = JSON.stringify(value)
    } catch (e) {
      text = undefined
    }
    if (typeof text !== 'string') {
      lastError = 'S2'
      return Promise.resolve(false)
    }
    return call('set', { key: key, value: text }, () => true, false, 'S2')
  }

  return {
    // { ok, record }：record 为 null 表示没有记录或数据不合法。
    // 存储里有数据但解析或校验不通过时按没有记录处理（读取本身成功，ok 仍为 true），记错误码 S3
    loadMatch: () =>
      read(MATCH_KEY).then((r) => {
        const record = normalize(r.value)
        if (r.text && !record) lastError = 'S3'
        return { ok: r.ok, record: record }
      }),
    saveMatch: (record) => write(MATCH_KEY, record),
    // { ok, settings }：settings 一定是完整的设置，读失败时是默认值
    loadSettings: () => read(SETTINGS_KEY).then((r) => ({ ok: r.ok, settings: normalizeSettings(r.value) })),
    saveSettings: (settings) => write(SETTINGS_KEY, settings),
    lastError: () => lastError,
  }
}
