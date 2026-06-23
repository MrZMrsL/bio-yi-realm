/**
 * useLeaderboard.js - PVP排行榜数据管理 composable
 *
 * 当前支持两种后端：
 * 1. localStorage 本地模式（默认，无需配置）
 * 2. Supabase 远程模式（全球排行榜，需配置）
 *
 * 后端切换只需修改 src/composables/backends/leaderboardConfig.js
 * 业务组件（Leaderboard.vue / game.js）无需改动。
 *
 * 工厂函数按需动态导入，默认 local 模式下 @supabase 依赖不会进入首屏 vendor。
 */

let backendPromise = null

async function getBackend() {
  if (!backendPromise) {
    const { createLeaderboardBackend } = await import('./backends/leaderboardBackendFactory.js')
    backendPromise = createLeaderboardBackend()
  }
  return backendPromise
}

/**
 * 获取完整排行榜数据
 * @returns {Promise<Array>}
 */
export async function getLeaderboard() {
  const backend = await getBackend()
  return backend.getLeaderboard()
}

/**
 * 添加或更新一条PVP战绩
 * @param {{name: string, title: string, level: number, floor: number, specialization: string, won: boolean}} record
 * @returns {Promise<Array>}
 */
export async function addRecord(record) {
  const backend = await getBackend()
  return backend.addRecord(record)
}

/**
 * 获取指定玩家的排名（1-based）
 * @param {string} name - 玩家名
 * @returns {Promise<number>} 排名（未上榜返回 -1）
 */
export async function getMyRank(name) {
  const backend = await getBackend()
  return backend.getMyRank(name)
}

/**
 * 获取排行榜前N名
 * @param {number} n - 数量，默认10
 * @returns {Promise<Array>}
 */
export async function getTopN(n = 10) {
  const backend = await getBackend()
  return backend.getTopN(n)
}

/**
 * 获取总对战场次
 * @returns {Promise<number>}
 */
export async function getTotalBattles() {
  const backend = await getBackend()
  return backend.getTotalBattles()
}

/**
 * 清空排行榜
 * @returns {Promise<void>}
 */
export async function clearLeaderboard() {
  const backend = await getBackend()
  return backend.clearLeaderboard()
}
