<template>
  <div class="check-in-panel">
    <!-- 顶部统计 -->
    <div class="check-in-header">
      <div class="streak-card">
        <div class="streak-icon">🔥</div>
        <div class="streak-info">
          <div class="streak-value">{{ store.currentStreak }}</div>
          <div class="streak-label">连续签到</div>
        </div>
      </div>
      <div class="total-card">
        <div class="total-icon">📅</div>
        <div class="total-info">
          <div class="total-value">{{ store.totalCheckIns }}</div>
          <div class="total-label">累计签到</div>
        </div>
      </div>
    </div>

    <!-- 今日奖励 -->
    <div class="today-section">
      <div class="today-title">今日奖励</div>
      <div v-if="todayReward" class="today-reward">
        <div class="today-reward-title">{{ todayReward.title }}</div>
        <div class="today-reward-items">
          <div v-for="(item, idx) in todayReward.rewards" :key="idx" class="reward-chip">
            <span class="reward-icon">{{ item.icon || getDefaultIcon(item.type) }}</span>
            <span class="reward-text">{{ formatReward(item) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 7 天奖励网格 -->
    <div class="reward-calendar">
      <div
        v-for="config in CHECK_IN_REWARDS"
        :key="config.day"
        class="reward-day"
        :class="{
          'is-today': config.day === store.nextCycleDay && store.canCheckInToday,
          'is-checked': config.day < store.nextCycleDay || (config.day === store.nextCycleDay && !store.canCheckInToday),
          'is-future': config.day > store.nextCycleDay,
        }"
      >
        <div class="day-number">第 {{ config.day }} 天</div>
        <div class="day-rewards">
          <span
            v-for="(item, idx) in config.rewards"
            :key="idx"
            class="day-reward-icon"
            :title="formatReward(item)"
          >
            {{ item.icon || getDefaultIcon(item.type) }}
          </span>
        </div>
        <div class="day-status">
          <span v-if="config.day === store.nextCycleDay && !store.canCheckInToday" class="status-checked">✓ 已领</span>
          <span v-else-if="config.day === store.nextCycleDay" class="status-today">今日</span>
          <span v-else class="status-placeholder">&nbsp;</span>
        </div>
      </div>
    </div>

    <!-- 签到按钮 -->
    <div class="action-section">
      <button
        type="button"
        class="check-in-btn"
        :disabled="!store.canCheckInToday"
        @click="handleCheckIn"
      >
        {{ store.canCheckInToday ? '今日签到' : '今日已签到' }}
      </button>
      <p class="check-in-tip">
        {{ store.canCheckInToday ? '连续签到可获得更丰厚的奖励，断签后连击将重置' : '明日再来继续领取奖励吧！' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../../stores/game.ts'
import { CHECK_IN_REWARDS, REWARD_TYPE_ICONS, REWARD_TYPE_NAMES } from '../../data/checkInRewards.ts'
import { useToast } from '../../composables/useToast.js'

const store = useGameStore()
const toast = useToast()

const todayReward = computed(() => store.todayReward)

function getDefaultIcon(type) {
  return REWARD_TYPE_ICONS[type] || '🎁'
}

function formatReward(item) {
  const name = REWARD_TYPE_NAMES[item.type] || '奖励'
  let suffix = `+${item.amount}`
  if (item.type === 'battleCard' && item.cardType) {
    const cardNames = { hint: '提示卡', shield: '护盾卡', crit: '暴击卡' }
    suffix = `${cardNames[item.cardType] || item.cardType} +${item.amount}`
    return suffix
  }
  if (item.type === 'material' && item.materialName) {
    suffix = `${item.materialName} +${item.amount}`
    return suffix
  }
  return `${name} ${suffix}`
}

function handleCheckIn() {
  const result = store.checkInToday()
  if (result.success) {
    toast.success(`签到成功！连续 ${result.streak} 天`)
    if (result.messages.length > 1) {
      // 显示具体奖励（跳过第一条标题）
      const rewards = result.messages.slice(1).join('，')
      setTimeout(() => toast.success(`获得：${rewards}`), 400)
    }
  } else {
    toast.warning(result.messages[0] || '今日已签到')
  }
}
</script>

<style scoped>
.check-in-panel {
  padding: 16px;
  min-height: 100%;
}

.check-in-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.streak-card,
.total-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.streak-card {
  border-top: 3px solid #e74c3c;
}

.total-card {
  border-top: 3px solid #3498db;
}

.streak-icon,
.total-icon {
  font-size: 32px;
}

.streak-value,
.total-value {
  font-size: 24px;
  font-weight: bold;
  color: #e0e0e0;
}

.streak-label,
.total-label {
  font-size: 12px;
  color: #888;
}

/* 今日奖励 */
.today-section {
  background: linear-gradient(135deg, rgba(212, 168, 83, 0.15), rgba(212, 168, 83, 0.05));
  border: 1px solid rgba(212, 168, 83, 0.3);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.today-title {
  font-size: 14px;
  color: #d4a853;
  margin-bottom: 10px;
  font-weight: bold;
}

.today-reward-title {
  font-size: 18px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 10px;
}

.today-reward-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reward-chip {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #e0e0e0;
}

.reward-icon {
  font-size: 16px;
}

/* 7 天奖励网格 */
.reward-calendar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

@media (min-width: 480px) {
  .reward-calendar {
    grid-template-columns: repeat(4, 1fr);
  }
}

.reward-day {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 6px;
  text-align: center;
  transition: all 0.25s ease;
  min-height: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.reward-day.is-today {
  border-color: #d4a853;
  box-shadow: 0 0 12px rgba(212, 168, 83, 0.25);
  transform: translateY(-2px);
}

.reward-day.is-checked {
  opacity: 0.6;
  border-color: rgba(46, 204, 113, 0.4);
}

.reward-day.is-future {
  opacity: 0.45;
}

.day-number {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.day-rewards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 3px;
  min-height: 22px;
  margin-bottom: 4px;
}

.day-reward-icon {
  font-size: 15px;
}

.day-status {
  font-size: 10px;
  min-height: 14px;
}

.status-checked {
  color: #2ecc71;
  font-weight: bold;
}

.status-today {
  color: #d4a853;
  font-weight: bold;
}

/* 操作区 */
.action-section {
  text-align: center;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

.check-in-btn {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: bold;
  color: #1a1a2e;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(212, 168, 83, 0.4);
  transition: all 0.25s ease;
  min-height: 48px;
}

.check-in-btn:active:not(:disabled) {
  transform: scale(0.98);
}

@media (hover: hover) {
  .check-in-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 168, 83, 0.6);
  }
}

.check-in-btn:disabled {
  background: linear-gradient(135deg, #5a5a6a, #4a4a5a);
  color: #888;
  cursor: not-allowed;
  box-shadow: none;
}

.check-in-tip {
  margin-top: 12px;
  font-size: 12px;
  color: #888;
}

@media (max-width: 360px) {
  .reward-calendar {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .reward-day {
    padding: 8px 4px;
    min-height: 70px;
  }

  .day-reward-icon {
    font-size: 13px;
  }
}
</style>
