// 读写比赛记录与设置。系统存储模块从参数传入（页面里传 @system.storage），便于在 Node 中测试。
// 读写都返回 Promise，失败不抛错：读失败返回 null 或默认设置，写失败返回 false，并记下错误码。
import { normalize } from './match.js'
import { isRule } from './rules.js'

const MATCH_KEY = 'bs.match'
const SETTINGS_KEY = 'bs.settings'

export const DEFAULT_SETTINGS = { v: 1, rule: 21, vibrate: true, keepOn: true }

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

// storage.get 的 success 可能直接给字符串，也可能给 { value: 字符串 }
function parseStored(d) {
  if (typeof d === 'string') {
    if (!d) return null
    try {
      return JSON.parse(d)
    } catch (e) {
      return null
    }
  }
  if (d && typeof d === 'object' && typeof d.value === 'string') return parseStored(d.value)
  return null
}

export function createStore(storage, timeoutMs = 1500) {
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

  function read(key) {
    return call('get', { key: key, default: '' }, parseStored, null, 'S1')
  }

  function write(key, value) {
    return call('set', { key: key, value: JSON.stringify(value) }, () => true, false, 'S2')
  }

  return {
    loadMatch: () => read(MATCH_KEY).then(normalize),
    saveMatch: (record) => write(MATCH_KEY, record),
    loadSettings: () => read(SETTINGS_KEY).then(normalizeSettings),
    saveSettings: (settings) => write(SETTINGS_KEY, settings),
    lastError: () => lastError,
  }
}
