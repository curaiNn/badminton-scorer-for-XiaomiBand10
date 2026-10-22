import { test } from 'node:test'
import assert from 'node:assert/strict'
import { RED, BLUE, RULES, isRule, isGameWon, deriveMatch } from '../src/common/rules.js'

const R = (n) => 'R'.repeat(n)
const B = (n) => 'B'.repeat(n)
const rec = (rule, pts, acked) => ({ v: 1, rule: rule, pts: pts, acked: acked })

test('赛制参数', () => {
  assert.deepEqual(RULES[21], { target: 21, cap: 30, swapAt: 11 })
  assert.deepEqual(RULES[15], { target: 15, cap: 21, swapAt: 8 })
  assert.equal(RED, 'R')
  assert.equal(BLUE, 'B')
})

test('isRule 只接受数字 21 和 15', () => {
  assert.equal(isRule(21), true)
  assert.equal(isRule(15), true)
  assert.equal(isRule('21'), false)
  assert.equal(isRule(11), false)
})

test('21 分制单局胜负：领先 2 分或先到 30', () => {
  assert.equal(isGameWon(21, 19, 21), true)
  assert.equal(isGameWon(21, 20, 21), false)
  assert.equal(isGameWon(22, 20, 21), true)
  assert.equal(isGameWon(29, 28, 21), false)
  assert.equal(isGameWon(30, 29, 21), true)
  assert.equal(isGameWon(20, 0, 21), false)
})

test('15 分制单局胜负：领先 2 分或先到 21', () => {
  assert.equal(isGameWon(15, 13, 15), true)
  assert.equal(isGameWon(15, 14, 15), false)
  assert.equal(isGameWon(16, 14, 15), true)
  assert.equal(isGameWon(20, 19, 15), false)
  assert.equal(isGameWon(21, 20, 15), true)
})

test('空记录：第 1 局 0:0，不显示发球', () => {
  const s = deriveMatch(rec(21, '', 0))
  assert.equal(s.valid, true)
  assert.equal(s.phase, 'playing')
  assert.deepEqual(s.current, { index: 0, red: 0, blue: 0 })
  assert.deepEqual(s.gamesWon, { red: 0, blue: 0 })
  assert.deepEqual(s.games, [])
  assert.equal(s.completed, 0)
  assert.equal(s.server, null)
  assert.equal(s.court, null)
  assert.equal(s.matchWinner, null)
})

test('得分方发球，按其得分单双决定左右区', () => {
  let s = deriveMatch(rec(21, 'RR', 0))
  assert.equal(s.server, 'R')
  assert.equal(s.court, 'right')
  s = deriveMatch(rec(21, 'RRB', 0))
  assert.deepEqual(s.current, { index: 0, red: 2, blue: 1 })
  assert.equal(s.server, 'B')
  assert.equal(s.court, 'left')
})

test('一局结束、尚未点下一局：gameOver，显示刚结束的局', () => {
  const s = deriveMatch(rec(21, R(21), 0))
  assert.equal(s.phase, 'gameOver')
  assert.equal(s.completed, 1)
  assert.deepEqual(s.games, [{ red: 21, blue: 0, winner: 'R' }])
  assert.deepEqual(s.current, { index: 0, red: 21, blue: 0 })
  assert.deepEqual(s.gamesWon, { red: 1, blue: 0 })
  assert.equal(s.server, null)
})

test('点过下一局：第 2 局 0:0，上一局胜方在右区发球', () => {
  const s = deriveMatch(rec(21, R(21), 1))
  assert.equal(s.phase, 'playing')
  assert.deepEqual(s.current, { index: 1, red: 0, blue: 0 })
  assert.equal(s.server, 'R')
  assert.equal(s.court, 'right')
})

test('21 分制 20 平后须领先 2 分', () => {
  const deuce = 'RB'.repeat(20)
  assert.equal(deriveMatch(rec(21, deuce + 'R', 0)).phase, 'playing')
  const s = deriveMatch(rec(21, deuce + 'RR', 0))
  assert.equal(s.phase, 'gameOver')
  assert.deepEqual(s.games[0], { red: 22, blue: 20, winner: 'R' })
})

test('21 分制 29 平后先到 30 胜', () => {
  const s = deriveMatch(rec(21, 'RB'.repeat(29) + 'B', 0))
  assert.equal(s.phase, 'gameOver')
  assert.deepEqual(s.games[0], { red: 29, blue: 30, winner: 'B' })
})

test('15 分制：15 分胜、14 平须领先 2 分、先到 21 胜', () => {
  assert.equal(deriveMatch(rec(15, R(15), 0)).phase, 'gameOver')
  assert.equal(deriveMatch(rec(15, 'RB'.repeat(14) + 'R', 0)).phase, 'playing')
  const s = deriveMatch(rec(15, 'RB'.repeat(20) + 'R', 0))
  assert.equal(s.phase, 'gameOver')
  assert.deepEqual(s.games[0], { red: 21, blue: 20, winner: 'R' })
})

test('2:0 比赛结束', () => {
  const s = deriveMatch(rec(21, R(21) + R(21), 1))
  assert.equal(s.phase, 'matchOver')
  assert.equal(s.valid, true)
  assert.equal(s.matchWinner, 'R')
  assert.deepEqual(s.gamesWon, { red: 2, blue: 0 })
  assert.equal(s.games.length, 2)
  assert.deepEqual(s.current, { index: 1, red: 21, blue: 0 })
  assert.equal(s.server, null)
})

test('1:1 进入第 3 局，第 2 局胜方发球', () => {
  const s = deriveMatch(rec(21, R(21) + B(21), 2))
  assert.equal(s.phase, 'playing')
  assert.deepEqual(s.gamesWon, { red: 1, blue: 1 })
  assert.deepEqual(s.current, { index: 2, red: 0, blue: 0 })
  assert.equal(s.server, 'B')
  assert.equal(s.court, 'right')
})

test('2:1 比赛结束，记录每局比分', () => {
  const s = deriveMatch(rec(21, R(21) + B(21) + 'B'.repeat(10) + R(21), 2))
  assert.equal(s.phase, 'matchOver')
  assert.equal(s.matchWinner, 'R')
  assert.deepEqual(s.games.map((g) => g.red + ':' + g.blue), ['21:0', '0:21', '21:10'])
})

test('比赛结束后还有得分：valid 为 false', () => {
  assert.equal(deriveMatch(rec(21, R(21) + R(21) + 'B', 1)).valid, false)
})

test('蓝方 0:2 获胜', () => {
  const s = deriveMatch(rec(21, B(21) + B(21), 1))
  assert.equal(s.phase, 'matchOver')
  assert.equal(s.matchWinner, 'B')
  assert.deepEqual(s.gamesWon, { red: 0, blue: 2 })
  assert.equal(s.valid, true)
})

test('第 2 局蓝方胜、未点下一局：gameOver，局分 1:1', () => {
  const s = deriveMatch(rec(21, R(21) + B(21), 1))
  assert.equal(s.phase, 'gameOver')
  assert.deepEqual(s.current, { index: 1, red: 0, blue: 21 })
  assert.deepEqual(s.gamesWon, { red: 1, blue: 1 })
})

test('在还没开始的局里有得分：valid 为 false', () => {
  const bad = [R(21) + 'RR', R(21) + B(21), R(21) + B(21) + 'RRR']
  for (const pts of bad) {
    assert.equal(deriveMatch(rec(21, pts, 0)).valid, false)
  }
  assert.equal(deriveMatch(rec(21, R(21) + B(21) + R(21), 2)).valid, true)
})
