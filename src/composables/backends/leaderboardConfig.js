/**
 * 排行榜后端配置
 *
 * 默认使用 localStorage 本地模式，无需任何外部服务即可运行。
 * 如需启用全球排行榜，请在项目根目录创建 `.env.local` 并配置：
 *   VITE_SUPABASE_URL=https://your-project.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 * 然后将 backend 改为 'supabase'。
 *
 * Supabase 免费注册：https://supabase.com
 */

// 硬编码 Supabase 配置（anon key 是公开密钥，可安全嵌入客户端）
// 如需切换回本地模式，将 backend 改为 'local' 即可
const HARDCODED_SUPABASE_URL = 'https://orwlfxaprnetndbhnocx.supabase.co'
const HARDCODED_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yd2xmeGFwcm5ldG5kYmhub2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODA1MjIsImV4cCI6MjA5NzE1NjUyMn0.Io0z6GUjWq4P0HA63JkX8XFXbwzZPcsDD2nuGuPJ62c'

// 同时支持环境变量（本地开发用 .env.local）
let envUrl = import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined
let envKey = import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined

// 防御性校验：环境变量可能被误填成 key，只有合法的 https URL 才使用
if (envUrl && !String(envUrl).startsWith('https://')) {
  // eslint-disable-next-line no-console
  console.warn('[LeaderboardConfig] VITE_SUPABASE_URL 不是合法的 https URL，忽略环境变量')
  envUrl = undefined
}
if (envKey && !String(envKey).startsWith('eyJ')) {
  // eslint-disable-next-line no-console
  console.warn('[LeaderboardConfig] VITE_SUPABASE_ANON_KEY 不是合法的 JWT 格式，忽略环境变量')
  envKey = undefined
}

const supabaseUrl = envUrl || HARDCODED_SUPABASE_URL
const supabaseKey = envKey || HARDCODED_SUPABASE_KEY

export const LEADERBOARD_CONFIG = {
  // 可选值: 'local' | 'supabase'
  // 当环境变量缺失时自动回退到 local，避免构建/部署时因 key 缺失而报错
  backend: supabaseUrl && supabaseKey ? 'supabase' : 'local',

  // Supabase 项目 URL（Project Settings -> API -> Project URL）
  supabaseUrl: supabaseUrl || '',

  // Supabase anon public key（Project Settings -> API -> Project API keys -> anon public）
  supabaseKey: supabaseKey || '',

  // Supabase 表名，可保持默认
  tableName: 'pvp_leaderboard',
}

/**
 * 排行榜条目结构（前后端统一）
 * @typedef {Object} LeaderboardEntry
 * @property {string} name - 玩家名
 * @property {string} title - 称号
 * @property {number} level - 等级
 * @property {number} floor - 最高楼层
 * @property {string} specialization - 专精
 * @property {number} wins - 胜场
 * @property {number} losses - 负场
 * @property {number} streak - 当前连胜
 * @property {number} lastPlayed - 最后对战时间戳
 */
