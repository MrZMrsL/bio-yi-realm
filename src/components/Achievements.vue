<template>
  <div class="achievements-container">
    <!-- 成就统计头部 -->
    <div class="achievements-header">
      <div class="achievements-title">
        <span class="title-icon">🏆</span>
        <span>成就殿堂</span>
      </div>
      <div class="achievements-summary">
        <div class="summary-item">
          <div class="summary-num">{{ unlockedCount }}</div>
          <div class="summary-label">已解锁</div>
        </div>
        <div class="summary-divider">/</div>
        <div class="summary-item">
          <div class="summary-num">{{ totalCount }}</div>
          <div class="summary-label">总数</div>
        </div>
        <div class="summary-progress">
          <div class="progress-ring" :style="{ '--pct': progressPct }">
            <svg viewBox="0 0 36 36" class="progress-ring-svg">
              <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="progress-ring-fill" :stroke-dasharray="`${progressPct}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div class="progress-ring-text">{{ progressPct }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="achievements-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="tab-btn"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }} ({{ categoryCount(cat.key) }})
      </button>
    </div>

    <!-- 成就列表 -->
    <div class="achievements-list">
      <div
        v-for="ach in filteredAchievements"
        :key="ach.id"
        class="achievement-card"
        :class="{
          unlocked: isUnlocked(ach.id),
          locked: !isUnlocked(ach.id),
          ['rarity-' + ach.rarity]: true
        }"
      >
        <!-- 左侧：图标和状态 -->
        <div class="achievement-left">
          <div class="achievement-icon" :style="{ background: rarityColors[ach.rarity].bg }">
            <span v-if="isUnlocked(ach.id)" class="icon-emoji">{{ ach.icon }}</span>
            <span v-else class="icon-locked">🔒</span>
          </div>
          <div class="achievement-status">
            <template v-if="isUnlocked(ach.id)">
              <div class="status-badge unlocked">✅ 已解锁</div>
              <div v-if="unlockTime(ach.id)" class="unlock-time">{{ formatUnlockTime(unlockTime(ach.id)) }}</div>
            </template>
            <div v-else class="status-badge locked">🔒 未解锁</div>
          </div>
        </div>

        <!-- 右侧：信息 -->
        <div class="achievement-right">
          <div class="achievement-title-row">
            <div class="achievement-name" :style="{ color: isUnlocked(ach.id) ? rarityColors[ach.rarity].color : '#888' }">
              {{ ach.title }}
            </div>
            <div class="achievement-rarity" :style="{ color: rarityColors[ach.rarity].color }">
              {{ rarityLabels[ach.rarity] }}
            </div>
          </div>
          <div class="achievement-desc">{{ ach.desc }}</div>

          <!-- 进度条 -->
          <div class="achievement-progress-bar">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: progressPctFor(ach) + '%', background: rarityColors[ach.rarity].color }"
              ></div>
            </div>
            <div class="progress-text">{{ progressText(ach) }}</div>
          </div>

          <!-- 奖励 -->
          <div class="achievement-reward" v-if="ach.reward">
            <span class="reward-label">奖励：</span>
            <span class="reward-value">🌟 {{ ach.reward.exp }} 经验</span>
          </div>
        </div>

        <!-- 解锁特效覆盖层（仅已解锁） -->
        <div v-if="isUnlocked(ach.id)" class="achievement-shine"></div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="achievements-footer">
      <p>💡 完成成就可以获得额外经验奖励</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import {
  ACHIEVEMENTS,
  RARITY_COLORS,
  CATEGORY_NAMES,
  checkAchievementUnlocked,
  getAchievementProgress
} from '../data/achievements.js'

const store = useGameStore()
const activeCategory = ref('all')

const categories = [
  { key: 'all', label: '全部' },
  { key: 'combat', label: CATEGORY_NAMES.combat },
  { key: 'knowledge', label: CATEGORY_NAMES.knowledge },
  { key: 'collection', label: CATEGORY_NAMES.collection },
  { key: 'level', label: CATEGORY_NAMES.level },
  { key: 'limited', label: '限时' },
]

const rarityColors = RARITY_COLORS
const rarityLabels = {
  normal: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

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

function formatUnlockTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function progressPctFor(ach) {
  const progress = getAchievementProgress(ach, gameState.value)
  if (typeof progress !== 'number' || Number.isNaN(progress)) return 0
  const pct = Math.floor((progress / ach.maxProgress) * 100)
  return Math.min(100, Math.max(0, pct))
}

function progressText(ach) {
  const progress = getAchievementProgress(ach, gameState.value)
  const safeProgress = typeof progress === 'number' && !Number.isNaN(progress) ? progress : 0
  return `${Math.min(safeProgress, ach.maxProgress)} / ${ach.maxProgress}`
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

/* 头部统计 */
.achievements-header {
  background: rgba(15, 52, 96, 0.6);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(212, 168, 83, 0.2);
  position: relative;
  overflow: hidden;
}

.achievements-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(212, 168, 83, 0.05) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.achievements-title {
  font-size: 22px;
  font-weight: bold;
  color: #d4a853;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.title-icon {
  font-size: 28px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.achievements-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.summary-item {
  text-align: center;
}

.summary-num {
  font-size: 28px;
  font-weight: bold;
  color: #d4a853;
  line-height: 1;
}

.summary-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.summary-divider {
  font-size: 20px;
  color: #666;
}

/* 进度圆环 */
.progress-ring {
  width: 60px;
  height: 60px;
  position: relative;
}

.progress-ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 2;
}

.progress-ring-fill {
  fill: none;
  stroke: #d4a853;
  stroke-width: 2;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #d4a853;
}

/* 分类标签 */
.achievements-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
}

.tab-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #a0a0a0;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: rgba(212, 168, 83, 0.2);
  border-color: rgba(212, 168, 83, 0.4);
  color: #d4a853;
  font-weight: bold;
}

/* 成就卡片 */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievement-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: rgba(15, 52, 96, 0.4);
  border-radius: 12px;
  border: 1.5px solid;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.achievement-card.locked {
  opacity: 0.45;
  filter: grayscale(0.7);
  border-color: rgba(80, 80, 80, 0.15);
  background: rgba(30, 30, 30, 0.3);
}

.achievement-card.unlocked.rarity-normal {
  border-color: rgba(160, 160, 160, 0.3);
  background: rgba(160, 160, 160, 0.05);
}

.achievement-card.unlocked.rarity-rare {
  border-color: rgba(52, 152, 219, 0.3);
  background: rgba(52, 152, 219, 0.05);
}

.achievement-card.unlocked.rarity-epic {
  border-color: rgba(155, 89, 182, 0.3);
  background: rgba(155, 89, 182, 0.05);
}

.achievement-card.unlocked.rarity-legendary {
  border-color: rgba(241, 196, 15, 0.3);
  background: rgba(241, 196, 15, 0.05);
}

/* 解锁闪光特效 */
.achievement-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 左侧图标 */
.achievement-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.achievement-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.icon-locked {
  font-size: 20px;
  opacity: 0.5;
}

.status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.status-badge.unlocked {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.status-badge.locked {
  background: rgba(100, 100, 100, 0.2);
  color: #888;
}

.unlock-time {
  font-size: 10px;
  color: #d4a853;
  white-space: nowrap;
}

/* 右侧信息 */
.achievement-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.achievement-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.achievement-name {
  font-size: 15px;
  font-weight: bold;
}

.achievement-rarity {
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
}

.achievement-desc {
  font-size: 12px;
  color: #a0a0a0;
  line-height: 1.4;
}

/* 进度条 */
.achievement-progress-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  width: 50px;
  text-align: right;
}

/* 奖励 */
.achievement-reward {
  font-size: 11px;
  color: #888;
}

.reward-label {
  color: #666;
}

.reward-value {
  color: #d4a853;
  font-weight: bold;
}

/* 底部 */
.achievements-footer {
  text-align: center;
  padding: 12px;
  color: #666;
  font-size: 12px;
}
</style>
