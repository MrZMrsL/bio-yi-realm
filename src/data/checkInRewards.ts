import type { BattleCardType } from '../types.ts'

/**
 * 每日签到奖励类型
 */
export type CheckInRewardType = 'gold' | 'exp' | 'spirit' | 'battleCard' | 'material'

/**
 * 单日奖励项
 */
export interface CheckInRewardItem {
  type: CheckInRewardType
  amount: number
  /** 道具卡类型，仅 type 为 battleCard 时使用 */
  cardType?: BattleCardType
  /** 材料名称，仅 type 为 material 时使用 */
  materialName?: string
  /** 自定义图标，未提供时按类型默认 */
  icon?: string
}

/**
 * 每日签到奖励配置
 */
export interface DailyRewardConfig {
  day: number
  title: string
  rewards: CheckInRewardItem[]
}

/**
 * 7 天签到奖励周期
 *
 * 第 1–6 天递增，第 7 天为周期大奖。
 * 第 8 天起按 (day - 1) % 7 + 1 循环领取对应天数奖励，
 * 但连续签到天数（连击）会继续累加。
 */
export const CHECK_IN_REWARDS: DailyRewardConfig[] = [
  {
    day: 1,
    title: '初登易门',
    rewards: [
      { type: 'gold', amount: 30, icon: '💰' },
      { type: 'exp', amount: 20, icon: '✨' },
    ],
  },
  {
    day: 2,
    title: '勤学不辍',
    rewards: [
      { type: 'gold', amount: 50, icon: '💰' },
      { type: 'spirit', amount: 10, icon: '🔮' },
    ],
  },
  {
    day: 3,
    title: '三日小成',
    rewards: [
      { type: 'gold', amount: 70, icon: '💰' },
      { type: 'exp', amount: 40, icon: '✨' },
      { type: 'battleCard', cardType: 'hint', amount: 1, icon: '💡' },
    ],
  },
  {
    day: 4,
    title: '四象通明',
    rewards: [
      { type: 'gold', amount: 90, icon: '💰' },
      { type: 'spirit', amount: 20, icon: '🔮' },
      { type: 'material', materialName: '水之精华', amount: 1, icon: '💧' },
    ],
  },
  {
    day: 5,
    title: '五行俱备',
    rewards: [
      { type: 'gold', amount: 120, icon: '💰' },
      { type: 'exp', amount: 60, icon: '✨' },
      { type: 'battleCard', cardType: 'shield', amount: 1, icon: '🛡️' },
    ],
  },
  {
    day: 6,
    title: '六合同风',
    rewards: [
      { type: 'gold', amount: 150, icon: '💰' },
      { type: 'spirit', amount: 30, icon: '🔮' },
      { type: 'material', materialName: '火焰核心', amount: 1, icon: '🔥' },
    ],
  },
  {
    day: 7,
    title: '周天圆满',
    rewards: [
      { type: 'gold', amount: 300, icon: '💰' },
      { type: 'exp', amount: 150, icon: '✨' },
      { type: 'spirit', amount: 80, icon: '🔮' },
      { type: 'battleCard', cardType: 'crit', amount: 2, icon: '⚔️' },
      { type: 'material', materialName: '雷电石', amount: 2, icon: '⚡' },
    ],
  },
]

/**
 * 默认图标映射
 */
export const REWARD_TYPE_ICONS: Record<CheckInRewardType, string> = {
  gold: '💰',
  exp: '✨',
  spirit: '🔮',
  battleCard: '🎴',
  material: '🧪',
}

/**
 * 奖励类型显示名称
 */
export const REWARD_TYPE_NAMES: Record<CheckInRewardType, string> = {
  gold: '金币',
  exp: '经验',
  spirit: '灵气',
  battleCard: '道具卡',
  material: '材料',
}

/**
 * 根据周期天数获取奖励配置
 * @param day 1–7 的周期天数
 */
export function getRewardByDay(day: number): DailyRewardConfig | undefined {
  return CHECK_IN_REWARDS.find(r => r.day === ((day - 1) % 7) + 1)
}

/**
 * 根据连续签到天数获取当天奖励配置
 * @param streak 当前连续签到天数（从 1 开始）
 */
export function getRewardByStreak(streak: number): DailyRewardConfig | undefined {
  return getRewardByDay(streak)
}
