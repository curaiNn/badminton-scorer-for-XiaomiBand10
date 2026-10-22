// 羽毛球计分规则：纯函数，不依赖任何系统接口，可直接在 Node 中测试。
// 比赛记录只保存得分顺序 pts（'R' 红方得分，'B' 蓝方得分），
// 比分、局分、发球方、一局或整场是否结束都由回放 pts 推算得出。

export const RED = 'R'
export const BLUE = 'B'
export const GAMES_TO_WIN = 2

// target：每局目标分；cap：封顶分（先到即胜）；swapAt：决胜局换边分
export const RULES = {
  21: { target: 21, cap: 30, swapAt: 11 },
  15: { target: 15, cap: 21, swapAt: 8 },
}

export function isRule(rule) {
  return rule === 21 || rule === 15
}

export function isGameWon(own, other, rule) {
  const r = RULES[rule]
  return own === r.cap || (own >= r.target && own - other >= 2)
}

// 推算整场状态。record: { rule, pts, acked }，acked 是用户已点过「下一局」的已结束局数。
export function deriveMatch(record) {
  const games = [] // 已结束的局：{ red, blue, winner }
  const gamesWon = { red: 0, blue: 0 }
  let red = 0
  let blue = 0
  let last = null // 进行中的局里最后一分的得分方
  let matchWinner = null
  let valid = true

  for (let i = 0; i < record.pts.length; i++) {
    if (matchWinner) {
      valid = false // 比赛结束后还有得分，说明数据损坏
      break
    }
    const side = record.pts[i]
    if (side === RED) red++
    else blue++
    last = side
    const own = side === RED ? red : blue
    const other = side === RED ? blue : red
    if (isGameWon(own, other, record.rule)) {
      games.push({ red: red, blue: blue, winner: side })
      if (side === RED) gamesWon.red++
      else gamesWon.blue++
      if (gamesWon.red === GAMES_TO_WIN || gamesWon.blue === GAMES_TO_WIN) matchWinner = side
      red = 0
      blue = 0
      last = null
    }
  }

  const completed = games.length
  let phase = 'playing'
  if (matchWinner) phase = 'matchOver'
  else if (completed > record.acked) phase = 'gameOver'

  let current
  let server = null
  let court = null
  if (phase === 'playing') {
    current = { index: completed, red: red, blue: blue }
    server = last || (completed > 0 ? games[completed - 1].winner : null)
    if (server) {
      const serverScore = server === RED ? red : blue
      court = serverScore % 2 === 0 ? 'right' : 'left'
    }
  } else {
    const g = games[completed - 1]
    current = { index: completed - 1, red: g.red, blue: g.blue }
  }

  return { valid, phase, games, completed, gamesWon, current, server, court, matchWinner }
}
