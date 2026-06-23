<template>
  <div
    class="achievement-card"
    :class="{
      unlocked: isUnlocked,
      locked: !isUnlocked,
      ['rarity-' + achievement.rarity]: true,
    }"
  >
    <div class="achievement-left">
      <div class="achievement-icon" :style="{ background: rarityColor.bg }">
        <span v-if="isUnlocked" class="icon-emoji">{{ achievement.icon }}</span>
        <span v-else class="icon-locked">🔒</span>
      </div>
      <div class="achievement-status">
        <template v-if="isUnlocked">
          <div class="status-badge unlocked">✅ 已解锁</div>
          <div v-if="formattedUnlockTime" class="unlock-time">{{ formattedUnlockTime }}</div>
        </template>
        <div v-else class="status-badge locked">🔒 未解锁</div>
      </div>
    </div>

    <div class="achievement-right">
      <div class="achievement-title-row">
        <div
          class="achievement-name"
          :style="{ color: isUnlocked ? rarityColor.color : '#888' }"
        >
          {{ achievement.title }}
        </div>
        <div class="achievement-rarity" :style="{ color: rarityColor.color }">
          {{ rarityLabel }}
        </div>
      </div>
      <div class="achievement-desc">{{ achievement.desc }}</div>

      <div class="achievement-progress-bar">
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: progressPct + '%', background: rarityColor.color }"
          ></div>
        </div>
        <div class="progress-text">{{ progressText }}</div>
      </div>

      <div v-if="achievement.reward" class="achievement-reward">
        <span class="reward-label">奖励：</span>
        <span class="reward-value">🌟 {{ achievement.reward.exp }} 经验</span>
      </div>
    </div>

    <div v-if="isUnlocked" class="achievement-shine"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RARITY_COLORS } from '../../data/achievements.ts'

const props = defineProps({
  achievement: { type: Object, required: true },
  isUnlocked: { type: Boolean, required: true },
  unlockTime: { type: Number, default: null },
  progressPct: { type: Number, required: true },
  progressText: { type: String, required: true },
})

const RARITY_LABELS = {
  normal: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

const rarityColor = computed(() => RARITY_COLORS[props.achievement.rarity] || RARITY_COLORS.normal)
const rarityLabel = computed(() => RARITY_LABELS[props.achievement.rarity] || '普通')

const formattedUnlockTime = computed(() => {
  if (!props.unlockTime) return ''
  const d = new Date(props.unlockTime)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})
</script>

<style scoped>
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

.achievement-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

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
</style>