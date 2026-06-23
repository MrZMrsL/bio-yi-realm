import { logger } from '../../utils/logger.js'
import { getStorageItem, setStorageItem, removeStorageItem } from '../../platform/storage.js'

const STORAGE_KEY = 'bio_yi_realm_pvp_leaderboard'

function readBoard() {
  try {
    const raw = getStorageItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (e) {
    logger.error('[LocalLeaderboardBackend] 读取排行榜失败:', e)
    return []
  }
}

function writeBoard(board) {
  setStorageItem(STORAGE_KEY, JSON.stringify(board))
}

function sortBoard(board) {
  return board.sort((a, b) => b.wins - a.wins)
}

export function createLocalLeaderboardBackend() {
  return {
    async getLeaderboard() {
      return readBoard()
    },

    async addRecord(record) {
      const board = readBoard()
      let existing = board.find(r => r.name === record.name)

      if (!existing) {
        existing = board.find(r => !r.name && r.title === record.title && r.level === record.level)
        if (existing) {
          existing.name = record.name
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
          lastPlayed: Date.now(),
        })
      }

      writeBoard(sortBoard(board))
      return readBoard()
    },

    async getMyRank(name) {
      const board = readBoard()
      const idx = board.findIndex(r => r.name === name)
      return idx >= 0 ? idx + 1 : -1
    },

    async getTopN(n = 10) {
      return readBoard().slice(0, n)
    },

    async getTotalBattles() {
      const board = readBoard()
      return board.reduce((sum, r) => sum + (r.wins || 0) + (r.losses || 0), 0)
    },

    async clearLeaderboard() {
      removeStorageItem(STORAGE_KEY)
    },
  }
}
