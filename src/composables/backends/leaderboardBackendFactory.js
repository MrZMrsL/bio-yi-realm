import { LEADERBOARD_CONFIG } from './leaderboardConfig.js'
import { createLocalLeaderboardBackend } from './localLeaderboardBackend.js'
import { logger } from '../../utils/logger.js'

/**
 * 排行榜后端接口规范
 *
 * 所有后端实现都必须提供以下方法：
 *
 * - getLeaderboard(): Promise<LeaderboardEntry[]>
 * - addRecord(record): Promise<LeaderboardEntry[]>
 * - getMyRank(name): Promise<number>
 * - getTopN(n): Promise<LeaderboardEntry[]>
 * - getTotalBattles(): Promise<number>
 * - clearLeaderboard(): Promise<void>
 *
 * 未来切换到 Firebase / Cloudflare / 自建后端时，
 * 只需新增一个 createXxxBackend 并在这里返回即可。
 */

let cachedBackend = null

export async function createLeaderboardBackend() {
  if (cachedBackend) return cachedBackend

  const { backend, supabaseUrl, supabaseKey, tableName } = LEADERBOARD_CONFIG

  if (backend === 'supabase' && supabaseUrl && supabaseKey) {
    try {
      const { createSupabaseLeaderboardBackend } = await import('./supabaseLeaderboardBackend.js')
      cachedBackend = await createSupabaseLeaderboardBackend(supabaseUrl, supabaseKey, tableName)
      logger.log('[LeaderboardBackend] 使用 Supabase 远程排行榜')
      return cachedBackend
    } catch (e) {
      logger.warn('[LeaderboardBackend] Supabase 初始化失败，回退到本地模式:', e)
    }
  }

  cachedBackend = createLocalLeaderboardBackend()
  logger.log('[LeaderboardBackend] 使用 localStorage 本地排行榜')
  return cachedBackend
}

export function resetBackendCache() {
  cachedBackend = null
}
