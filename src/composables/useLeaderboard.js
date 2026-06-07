/**
 * useLeaderboard.js - PVP排行榜数据管理 composable
 * 数据存储在 localStorage，键名: bio_yi_realm_pvp_leaderboard
 */

const STORAGE_KEY = 'bio_yi_realm_pvp_leaderboard'

/**
 * 获取完整排行榜数据
 * @returns {Array<{name: string, title: string, level: number, floor: number, specialization: string, wins: number, losses: number, streak: number, lastPlayed: number}>}
 */
export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data
  } catch (e) {
    console.error('[useLeaderboard] 读取排行榜失败:', e)
    return []
  }
}

/**
 * 添加或更新一条PVP战绩
 * @param {{name: string, title: string, level: number, floor: number, specialization: string, won: boolean}} record
 */
export function addRecord(record) {
  const board = getLeaderboard()
  // 按玩家名匹配
  let existing = board.find(r => r.name === record.name)

  // 兼容旧数据：如果没有 name 匹配，尝试按 title+level 匹配并补上 name
  if (!existing) {
    existing = board.find(r => !r.name && r.title === record.title && r.level === record.level)
    if (existing) {
      existing.name = record.name  // 旧记录补上名字
    }
  }

  if (existing) {
    if (record.won) {
      existing.wins++
      existing.streak++
    } else {
      existing.losses++
      existing.streak = 0
    }
    existing.lastPlayed = Date.now()
    // 更新最新数据
    existing.title = record.title
    existing.level = record.level
    existing.floor = Math.max(existing.floor || 0, record.floor || 0)
    existing.specialization = record.specialization || existing.specialization
  } else {
    board.push({
      name: record.name,
      title: record.title,
      level: record.level,
      floor: record.floor || 1,
      specialization: record.specialization || null,
      wins: record.won ? 1 : 0,
      losses: record.won ? 0 : 1,
      streak: record.won ? 1 : 0,
      lastPlayed: Date.now()
    })
  }

  // 按胜场降序排列
  board.sort((a, b) => b.wins - a.wins)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  return board
}

/**
 * 获取指定玩家的排名（1-based）
 * @param {string} name - 玩家名
 * @returns {number} 排名（未上榜返回 -1）
 */
export function getMyRank(name) {
  const board = getLeaderboard()
  const idx = board.findIndex(r => r.name === name)
  return idx >= 0 ? idx + 1 : -1
}

/**
 * 获取排行榜前N名
 * @param {number} n - 数量，默认10
 * @returns {Array}
 */
export function getTopN(n = 10) {
  return getLeaderboard().slice(0, n)
}

/**
 * 获取总对战场次
 * @returns {number}
 */
export function getTotalBattles() {
  const board = getLeaderboard()
  let total = 0
  for (const r of board) {
    total += r.wins + r.losses
  }
  return total
}

/**
 * 清空排行榜
 */
export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 生成模拟PVP对手数据（镜像玩家+随机化）
 * @param {{level: number, title: string, maxHp: number, hp: number, atk: number, def: number, totalAtk: number, totalDef: number, exp: number, maxExp: number}} playerData - 玩家数据
 * @returns {{name: string, icon: string, title: string, level: number, maxHp: number, hp: number, atk: number, def: number, subjectLabel: string, isPvpOpponent: boolean}}
 */
export function generatePvpOpponent(playerData) {
  // 基于玩家数据镜像 + 随机化
  const levelVariance = Math.floor(Math.random() * 5) - 2 // ±2级
  const opponentLevel = Math.max(1, playerData.level + levelVariance)

  // 对手属性：基于玩家等级缩放，加一定随机性
  const scaleFactor = 0.85 + Math.random() * 0.3 // 0.85~1.15
  const baseAtk = Math.floor(playerData.totalAtk * scaleFactor)
  const baseDef = Math.floor(playerData.totalDef * scaleFactor * 0.8)
  const baseMaxHp = Math.floor(playerData.maxHp * scaleFactor * 0.9)

  // 随机选择学科标签
  const subjects = ['化学', '生物', '易学']
  const subjectLabel = subjects[Math.floor(Math.random() * subjects.length)]

  return {
    name: `镜像勇士 Lv.${opponentLevel}`,
    icon: '⚔️',
    title: `PVP挑战者 Lv.${opponentLevel}`,
    level: opponentLevel,
    maxHp: Math.max(30, baseMaxHp),
    hp: Math.max(30, baseMaxHp),
    atk: Math.max(5, baseAtk),
    def: Math.max(1, baseDef),
    subjectLabel: subjectLabel,
    isPvpOpponent: true
  }
}
