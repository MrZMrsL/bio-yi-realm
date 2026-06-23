<template>
  <div class="achievements-container">
    <!-- 渲染错误提示 -->
    <div v-if="renderError" class="achievements-error">
      <div class="error-title">⚠️ 成就加载出错</div>
      <div class="error-message">{{ renderError }}</div>
      <button type="button" class="error-retry" @click="renderError = ''; activeCategory = 'all'">重试</button>
    </div>

    <AchievementHeader
      :unlocked-count="unlockedCount"
      :total-count="totalCount"
      :progress-pct="progressPct"
    />

    <AchievementTabs
      v-model="activeCategory"
      :categories="categories"
      :category-count="categoryCount"
    />

    <div class="achievements-list">
      <AchievementCard
        v-for="ach in filteredAchievements"
        :key="ach.id"
        :achievement="ach"
        :is-unlocked="isUnlocked(ach.id)"
        :unlock-time="unlockTime(ach.id)"
        :progress-pct="progressPctFor(ach)"
        :progress-text="progressText(ach)"
      />
    </div>

    <AchievementFooter />
  </div>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue'
import { useGameStore } from '../stores/game.ts'
import { logger } from '../utils/logger.js'
import {
  ACHIEVEMENTS,
  CATEGORY_NAMES,
  getAchievementProgress,
} from '../data/achievements.ts'
import AchievementHeader from './achievements/AchievementHeader.vue'
import AchievementTabs from './achievements/AchievementTabs.vue'
import AchievementCard from './achievements/AchievementCard.vue'
import AchievementFooter from './achievements/AchievementFooter.vue'

const store = useGameStore()
const activeCategory = ref('all')
const renderError = ref('')

onErrorCaptured(err => {
  logger.error('[Achievements] 渲染错误:', err)
  renderError.value = err.message || '成就组件渲染出错'
  return false
})

const categories = [
  { key: 'all', label: '全部' },
  { key: 'combat', label: CATEGORY_NAMES.combat },
  { key: 'knowledge', label: CATEGORY_NAMES.knowledge },
  { key: 'collection', label: CATEGORY_NAMES.collection },
  { key: 'level', label: CATEGORY_NAMES.level },
  { key: 'limited', label: '限时' },
]

const gameState = computed(() => ({
  stats: store.stats,
  farm: store.farm,
  level: store.level,
  allClearCount: store.allClearCount,
  cyclopedia: store.cyclopedia,
  weeklyBossDefeated: store.weeklyBossDefeated,
}))

function isUnlocked(achId) {
  return !!store.unlockedAchievements?.[achId]
}

function unlockTime(achId) {
  return store.unlockedAchievements?.[achId]
}

function progressPctFor(ach) {
  try {
    const progress = getAchievementProgress(ach, gameState.value)
    if (typeof progress !== 'number' || Number.isNaN(progress)) return 0
    const max = ach.maxProgress || 1
    const pct = Math.floor((progress / max) * 100)
    return Math.min(100, Math.max(0, pct))
  } catch (e) {
    logger.error(`[Achievements] progressPctFor(${ach.id}) 出错:`, e)
    return 0
  }
}

function progressText(ach) {
  try {
    const progress = getAchievementProgress(ach, gameState.value)
    const safeProgress = typeof progress === 'number' && !Number.isNaN(progress) ? progress : 0
    const max = ach.maxProgress || 1
    return `${Math.min(safeProgress, max)} / ${max}`
  } catch (e) {
    logger.error(`[Achievements] progressText(${ach.id}) 出错:`, e)
    return `0 / ${ach.maxProgress || 1}`
  }
}

const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') return ACHIEVEMENTS
  return ACHIEVEMENTS.filter(a => a.category === activeCategory.value)
})

const unlockedCount = computed(() => {
  return ACHIEVEMENTS.filter(ach => isUnlocked(ach.id)).length
})

const totalCount = computed(() => ACHIEVEMENTS.length)
const progressPct = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.floor((unlockedCount.value / totalCount.value) * 100)
})

function categoryCount(cat) {
  const list = cat === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === cat)
  return list.filter(ach => isUnlocked(ach.id)).length + ' / ' + list.length
}
</script>

<style scoped>
.achievements-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievements-error {
  background: rgba(231, 76, 60, 0.12);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
}

.error-title {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 8px;
}

.error-message {
  color: #e0e0e0;
  font-size: 13px;
  word-break: break-all;
  margin-bottom: 12px;
}

.error-retry {
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #d4a853, #b8860b);
  color: #1a1a2e;
  font-weight: bold;
  cursor: pointer;
}
</style>