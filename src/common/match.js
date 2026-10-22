// 比赛记录的操作：纯函数，输入旧记录、返回新记录，不修改入参。
// 记录格式：{ v: 1, rule: 21 | 15, pts: 'RB…', acked: 已点过「下一局」的局数 }
import { RED, BLUE, RULES, isRule, isGameWon, deriveMatch } from './rules.js'

export const RECORD_VERSION = 1
const MAX_PTS = 200
const DECIDER_INDEX = 2 // 决胜局（第 3 局）的下标

function make(rule, pts, acked) {
  return { v: RECORD_VERSION, rule: rule, pts: pts, acked: acked }
}

export function newMatch(rule) {
  return make(rule, '', 0)
}

// 返回 { record, event }；event 为 'match' | 'game' | 'swapEnds' | 'point'，无效操作时为 null
export function addPoint(record, side) {
  const before = deriveMatch(record)
  if (before.phase !== 'playing' || (side !== RED && side !== BLUE)) {
    return { record: record, event: null }
  }
  const next = make(record.rule, record.pts + side, record.acked)
  const after = deriveMatch(next)
  let event = 'point'
  if (after.phase === 'matchOver') event = 'match'
  else if (after.completed > before.completed) event = 'game'
  else if (after.current.index === DECIDER_INDEX && reachedSwap(before.current, after.current, record.rule)) {
    event = 'swapEnds'
  }
  return { record: next, event: event }
}

// 决胜局里领先方的得分首次到达换边分
function reachedSwap(before, after, rule) {
  const swapAt = RULES[rule].swapAt
  return Math.max(before.red, before.blue) < swapAt && Math.max(after.red, after.blue) === swapAt
}

export function undo(record) {
  if (!record.pts) return record
  const pts = record.pts.slice(0, -1)
  // 用原来的 acked 推算：rules 会把「还没开始的局里有得分」判为无效并停止回放，传 0 会少算已结束的局
  const completed = deriveMatch(make(record.rule, pts, record.acked)).completed
  return make(record.rule, pts, Math.min(record.acked, completed))
}

export function nextGame(record) {
  const s = deriveMatch(record)
  if (s.phase !== 'gameOver') return record
  return make(record.rule, record.pts, s.completed)
}

// 只保留前 acked 局的得分：进行中的局，或刚结束、还没点「下一局」的局回到 0:0
export function resetGame(record) {
  const keep = lengthOfGames(record, record.acked)
  return make(record.rule, record.pts.slice(0, keep), record.acked)
}

// 前 n 个已结束的局在 pts 中占的长度
function lengthOfGames(record, n) {
  if (n === 0) return 0
  let red = 0
  let blue = 0
  let done = 0
  for (let i = 0; i < record.pts.length; i++) {
    const side = record.pts[i]
    if (side === RED) red++
    else blue++
    const own = side === RED ? red : blue
    const other = side === RED ? blue : red
    if (isGameWon(own, other, record.rule)) {
      done++
      if (done === n) return i + 1
      red = 0
      blue = 0
    }
  }
  return record.pts.length
}

// 只有还没开赛时才改本场赛制；否则原样返回，由设置在下一场生效
export function setRule(record, rule) {
  if (!isRule(rule) || record.pts) return record
  return newMatch(rule)
}

// 校验从存储读出的数据，不合法时返回 null
export function normalize(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (raw.v !== RECORD_VERSION || !isRule(raw.rule)) return null
  if (typeof raw.pts !== 'string' || raw.pts.length > MAX_PTS || !/^[RB]*$/.test(raw.pts)) return null
  if (!Number.isInteger(raw.acked) || raw.acked < 0) return null
  const record = make(raw.rule, raw.pts, raw.acked)
  const s = deriveMatch(record)
  if (!s.valid || raw.acked > s.completed) return null
  return record
}
