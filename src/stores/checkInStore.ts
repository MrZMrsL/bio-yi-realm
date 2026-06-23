import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getTodayString,
  isSameDay,
  isYesterday,
} from '../utils/date.ts'
import {
  CHECK_IN_REWARDS,
  getRewardByStreak,
  type CheckInRewardItem,
  type DailyRewardConfig,
} from '../data/checkInRewards.ts'
import { usePlayerStore } from './playerStore.ts'
import { useEquipmentStore } from './equipmentStore.ts'
import { useLogStore } from './logStore.ts'
import { saveNow } from '../services/saveService.js'
import { logger } from '../utils/logger.js'
import type { BattleCardType } from '../types.ts'

/**
 * 签到结果
 */
export interface CheckInResult {
  success: boolean
  streak: number
  reward: DailyRewardConfig | null
  messages: string[]
}

export const useCheckInStore = defineStore('checkIn', () => {
  // ===== 签到状态 =====
  /** 最近一次签到日期，格式 YYYY-MM-DD */
  const lastCheckInDate = ref<string | null>(null)
  /** 当前连续签到天数 */
  const currentStreak = ref<number>(0)
  /** 累计签到天数 */
  const totalCheckIns = ref<number>(0)
  /** 已签到日期记录，键为 YYYY-MM-DD */
  const checkedInDates = ref<Record<string, boolean>>({})

  // ===== 依赖 =====
  const playerStore = usePlayerStore()
  const equipmentStore = useEquipmentStore()

  // ===== 计算属性 =====
  /** 今天是否已经签到 */
  const hasCheckedInToday = computed<boolean>(() => {
    if (!lastCheckInDate.value) return false
    return isSameDay(lastCheckInDate.value, getTodayString())
  })

  /** 今天是否可以签到 */
  const canCheckInToday = computed<boolean>(() => !hasCheckedInToday.value)

  /** 下一个签到日对应的 7 天周期天数（1–7） */
  const nextCycleDay = computed<number>(() => {
    if (currentStreak.value <= 0) return 1
    return ((currentStreak.value - 1) % 7) + 1
  })

  /** 今天的奖励配置 */
  const todayReward = computed<DailyRewardConfig | null>(() => {
    return getRewardByStreak(Math.max(1, nextCycleDay.value))
  })

  /**
   * 发放单个奖励项
   */
  function grantRewardItem(item: CheckInRewardItem): string {
    switch (item.type) {
      case 'gold':
        playerStore.addGold(item.amount)
        return `💰 金币 +${item.amount}`
      case 'exp':
        playerStore.addExp(item.amount)
        return `✨ 经验 +${item.amount}`
      case 'spirit':
        playerStore.addSpirit(item.amount)
        return `🔮 灵气 +${item.amount}`
      case 'battleCard':
        if (item.cardType) {
          equipmentStore.addBattleCard(item.cardType as BattleCardType, item.amount)
          return `${item.icon || '🎴'} 道具卡 +${item.amount}`
        }
        break
      case 'material':
        if (item.materialName) {
          equipmentStore.addMaterial(item.materialName, item.amount)
          return `${item.icon || '🧪'} ${item.materialName} +${item.amount}`
        }
        break
    }
    return ''
  }

  /**
   * 执行今日签到
   * @returns 签到结果，包含发放的奖励摘要
   */
  function checkInToday(): CheckInResult {
    const result: CheckInResult = {
      success: false,
      streak: currentStreak.value,
      reward: null,
      messages: [],
    }

    if (hasCheckedInToday.value) {
      result.messages.push('今日已经签到过了，明天再来吧！')
      return result
    }

    const now = getTodayString()
    const prev = lastCheckInDate.value

    if (prev && isYesterday(prev, now)) {
      // 连续签到：连击 +1
      currentStreak.value++
    } else {
      // 断签或首次签到：连击重置为 1
      currentStreak.value = 1
    }

    lastCheckInDate.value = now
    totalCheckIns.value++
    checkedInDates.value[now] = true

    const reward = getRewardByStreak(currentStreak.value)
    result.success = true
    result.streak = currentStreak.value
    result.reward = reward || null

    const logStore = useLogStore()

    if (reward) {
      result.messages.push(`连续签到 ${currentStreak.value} 天，获得「${reward.title}」奖励：`)
      for (const item of reward.rewards) {
        const msg = grantRewardItem(item)
        if (msg) {
          result.messages.push(msg)
        }
      }
    } else {
      // 兜底：即使没有配置也发放少量金币
      playerStore.addGold(10)
      result.messages.push('签到成功，获得 💰 金币 +10')
    }

    logStore.push(`📅 每日签到成功！连续 ${currentStreak.value} 天`)
    logger.log(`签到成功：${now}，连击 ${currentStreak.value}`)

    saveNow()
    return result
  }

  /**
   * 重置签到状态（用于删档）
   */
  function reset(): void {
    lastCheckInDate.value = null
    currentStreak.value = 0
    totalCheckIns.value = 0
    checkedInDates.value = {}
  }

  /**
   * 序列化到存档
   */
  function serialize(): Record<string, unknown> {
    return {
      checkInLastDate: lastCheckInDate.value,
      checkInStreak: currentStreak.value,
      checkInTotal: totalCheckIns.value,
      checkInDates: { ...checkedInDates.value },
    }
  }

  /**
   * 从存档恢复
   */
  function deserialize(data: Record<string, unknown>): void {
    reset()
    const last = data.checkInLastDate as string | null
    const streak = (data.checkInStreak as number) || 0
    const total = (data.checkInTotal as number) || 0
    const dates = data.checkInDates as Record<string, boolean> | undefined

    lastCheckInDate.value = last
    currentStreak.value = streak
    totalCheckIns.value = total
    checkedInDates.value = dates ? { ...dates } : {}

    // 读档时做一次断签校验：如果上次签到早于昨天，则重置连击（但保留累计）
    const now = getTodayString()
    if (last && !isSameDay(last, now) && !isYesterday(last, now)) {
      currentStreak.value = 0
    }
  }

  return {
    lastCheckInDate,
    currentStreak,
    totalCheckIns,
    checkedInDates,
    hasCheckedInToday,
    canCheckInToday,
    nextCycleDay,
    todayReward,
    checkInToday,
    reset,
    serialize,
    deserialize,
  }
})
