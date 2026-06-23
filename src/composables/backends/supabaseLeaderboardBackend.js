import { logger } from '../../utils/logger.js'

export async function createSupabaseLeaderboardBackend(supabaseUrl, supabaseKey, tableName) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey)

  return {
    async getLeaderboard() {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('wins', { ascending: false })
        .order('last_played', { ascending: false })

      if (error) {
        logger.error('[SupabaseLeaderboardBackend] 获取排行榜失败:', error)
        throw error
      }

      return (data || []).map(normalizeRow)
    },

    async addRecord(record) {
      // 先查询是否已有记录
      const { data: existingRows, error: selectError } = await supabase
        .from(tableName)
        .select('*')
        .eq('name', record.name)
        .limit(1)

      if (selectError) {
        logger.error('[SupabaseLeaderboardBackend] 查询记录失败:', selectError)
        throw selectError
      }

      const existing = existingRows && existingRows[0]
      const now = Date.now()

      const payload = existing
        ? {
            wins: existing.wins + (record.won ? 1 : 0),
            losses: existing.losses + (record.won ? 0 : 1),
            streak: record.won ? (existing.streak || 0) + 1 : 0,
            last_played: now,
            title: record.title,
            level: record.level,
            floor: Math.max(existing.floor || 0, record.floor || 0),
            specialization: record.specialization || existing.specialization,
          }
        : {
            name: record.name,
            title: record.title,
            level: record.level,
            floor: record.floor || 1,
            specialization: record.specialization || null,
            wins: record.won ? 1 : 0,
            losses: record.won ? 0 : 1,
            streak: record.won ? 1 : 0,
            last_played: now,
          }

      const { error } = existing
        ? await supabase.from(tableName).update(payload).eq('name', record.name)
        : await supabase.from(tableName).insert(payload)

      if (error) {
        logger.error('[SupabaseLeaderboardBackend] 保存记录失败:', error)
        throw error
      }

      // 返回更新后的排行榜
      return this.getLeaderboard()
    },

    async getMyRank(name) {
      if (!name) return -1

      // Supabase 不直接支持排名函数，先取全表再计算
      const board = await this.getLeaderboard()
      const idx = board.findIndex(r => r.name === name)
      return idx >= 0 ? idx + 1 : -1
    },

    async getTopN(n = 10) {
      const board = await this.getLeaderboard()
      return board.slice(0, n)
    },

    async getTotalBattles() {
      const { data, error } = await supabase.from(tableName).select('wins, losses')

      if (error) {
        logger.error('[SupabaseLeaderboardBackend] 统计对战场次失败:', error)
        throw error
      }

      return (data || []).reduce((sum, r) => sum + (r.wins || 0) + (r.losses || 0), 0)
    },

    async clearLeaderboard() {
      // 远程排行榜通常不提供清空接口，这里仅作占位
      logger.warn('[SupabaseLeaderboardBackend] 远程排行榜不支持客户端清空')
    },
  }
}

/**
 * 将 Supabase 数据库行转换为前端统一格式
 */
function normalizeRow(row) {
  return {
    name: row.name,
    title: row.title,
    level: row.level,
    floor: row.floor,
    specialization: row.specialization,
    wins: row.wins || 0,
    losses: row.losses || 0,
    streak: row.streak || 0,
    lastPlayed: row.last_played || row.lastPlayed || 0,
  }
}
