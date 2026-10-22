import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deriveMatch } from '../src/common/rules.js'
import { newMatch, addPoint, undo, nextGame, resetGame, setRule, normalize } from '../src/common/match.js'

const R = (n) => 'R'.repeat(n)
const B = (n) => 'B'.repeat(n)
const rec = (rule, pts, acked) => ({ v: 1, rule: rule, pts: pts, acked: acked })

// 依次得分，返回最后的记录和每一分的事件
function play(record, seq) {
  const events = []
  for (const side of seq) {
    const result = addPoint(record, side)
    record = result.record
    events.push(result.event)
  }
  return { record, events }
}

test('newMatch', () => {
  assert.deepEqual(newMatch(15), { v: 1, rule: 15, pts: '', acked: 0 })
})

test('普通得分：追加记录，不修改入参', () => {
  const start = newMatch(21)
  const result = addPoint(start, 'R')
  assert.equal(result.event, 'point')
  assert.equal(result.record.pts, 'R')
  assert.equal(start.pts, '')
})

test('无效的一方不得分', () => {
  const start = newMatch(21)
  assert.deepEqual(addPoint(start, 'X'), { record: start, event: null })
})

test('结束一局的那一分：event 为 game', () => {
  const { record, events } = play(rec(21, R(20), 0), 'R')
  assert.deepEqual(events, ['game'])
  assert.equal(deriveMatch(record).phase, 'gameOver')
})

test('gameOver 时得分无效', () => {
  const over = rec(21, R(21), 0)
  const result = addPoint(over, 'B')
  assert.equal(result.event, null)
  assert.equal(result.record, over)
})

test('nextGame 只在 gameOver 时生效', () => {
  const next = nextGame(rec(21, R(21), 0))
  assert.equal(next.acked, 1)
  assert.equal(deriveMatch(next).phase, 'playing')
  const playing = rec(21, 'RB', 0)
  assert.equal(nextGame(playing), playing)
})

test('结束比赛的那一分：event 为 match', () => {
  const { events } = play(rec(21, R(21) + R(20), 1), 'R')
  assert.deepEqual(events, ['match'])
})

test('21 分制决胜局首次到 11 分：event 为 swapEnds', () => {
  const base = rec(21, R(21) + B(21), 2)
  const { record, events } = play(base, R(11))
  assert.deepEqual(events, [...Array(10).fill('point'), 'swapEnds'])
  assert.deepEqual(play(record, 'B').events, ['point'])
})

test('11:10 时另一方追到 11 不再提醒换边', () => {
  const base = rec(21, R(21) + B(21), 2)
  const { events } = play(base, 'RB'.repeat(10) + 'RB')
  assert.equal(events[20], 'swapEnds')
  assert.equal(events[21], 'point')
})

test('15 分制决胜局首次到 8 分：event 为 swapEnds', () => {
  const base = rec(15, R(15) + B(15), 2)
  const { events } = play(base, R(8))
  assert.equal(events[7], 'swapEnds')
})

test('前两局到 11 分不提醒换边', () => {
  assert.equal(play(newMatch(21), R(11)).events.includes('swapEnds'), false)
})

test('撤销最近一分；空记录撤销无效', () => {
  assert.equal(undo(rec(21, 'RRB', 0)).pts, 'RR')
  const empty = newMatch(21)
  assert.equal(undo(empty), empty)
})

test('撤回结束一局的那一分：回到该局比赛中', () => {
  const back = undo(rec(21, R(21), 0))
  assert.deepEqual(back, rec(21, R(20), 0))
  assert.equal(deriveMatch(back).phase, 'playing')
})

test('新一局 0:0 时撤销：回到上一局结束前', () => {
  const back = undo(rec(21, R(21), 1))
  assert.deepEqual(back, rec(21, R(20), 0))
  assert.deepEqual(deriveMatch(back).current, { index: 0, red: 20, blue: 0 })
})

test('撤回结束比赛的那一分', () => {
  const back = undo(rec(21, R(21) + R(21), 1))
  const s = deriveMatch(back)
  assert.equal(s.phase, 'playing')
  assert.deepEqual(s.current, { index: 1, red: 20, blue: 0 })
})

test('决胜局中撤销：acked 保持 2', () => {
  const back = undo(rec(21, R(21) + B(21) + R(5), 2))
  assert.deepEqual(back, rec(21, R(21) + B(21) + R(4), 2))
  assert.equal(deriveMatch(back).phase, 'playing')
})

test('本局清零：进行中的局回到 0:0，保留之前的局', () => {
  const reset = resetGame(rec(21, R(21) + 'RRB', 1))
  assert.deepEqual(reset, rec(21, R(21), 1))
  assert.deepEqual(deriveMatch(reset).current, { index: 1, red: 0, blue: 0 })
  assert.deepEqual(resetGame(rec(21, 'RRB', 0)), rec(21, '', 0))
})

test('本局清零：gameOver 时刚结束的局回到 0:0', () => {
  const reset = resetGame(rec(21, R(21) + B(21), 1))
  assert.deepEqual(reset, rec(21, R(21), 1))
  assert.equal(deriveMatch(reset).phase, 'playing')
})

test('本局清零：matchOver 时决胜局回到 0:0', () => {
  const reset = resetGame(rec(21, R(21) + B(21) + R(21), 2))
  assert.deepEqual(reset, rec(21, R(21) + B(21), 2))
  assert.deepEqual(deriveMatch(reset).current, { index: 2, red: 0, blue: 0 })
})

test('切换赛制：未开赛立即生效，开赛后不变', () => {
  assert.equal(setRule(newMatch(21), 15).rule, 15)
  const started = rec(21, 'R', 0)
  assert.equal(setRule(started, 15), started)
  const empty = newMatch(21)
  assert.equal(setRule(empty, 11), empty)
})

test('normalize 接受合法记录', () => {
  const good = rec(21, R(21) + 'RB', 1)
  assert.deepEqual(normalize(good), good)
})

test('normalize 拒绝坏数据', () => {
  const bad = [
    null,
    'x',
    { v: 2, rule: 21, pts: '', acked: 0 },
    { v: 1, rule: '21', pts: '', acked: 0 },
    { v: 1, rule: 11, pts: '', acked: 0 },
    { v: 1, rule: 21, pts: 'RXB', acked: 0 },
    { v: 1, rule: 21, pts: 'RB'.repeat(101), acked: 0 },
    { v: 1, rule: 21, pts: '', acked: -1 },
    { v: 1, rule: 21, pts: '', acked: 1.5 },
    { v: 1, rule: 21, pts: 'R', acked: 1 },
    { v: 1, rule: 21, pts: R(21) + R(21) + 'B', acked: 1 },
    { v: 1, rule: 21, pts: R(21) + 'RR', acked: 0 },
  ]
  for (const raw of bad) assert.equal(normalize(raw), null, JSON.stringify(raw))
})
