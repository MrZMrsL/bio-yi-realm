<template>
  <div class="battle-header">
    <span class="floor-badge">
      <span v-if="store.gameMode === 'weekly_boss'">🔥 限时Boss</span>
      <span v-else>第 {{ store.floor }} 层</span>
    </span>
    <div class="enemy-info">
      <span class="enemy-name" :style="{ color: store.currentSubjectTheme?.light }">{{ store.enemy?.name }}</span>
      <span
        v-if="store.enemy?.captureable"
        class="captureable-badge"
        :class="{ 'farm-full': store.farm.length >= 12 }"
      >
        {{ store.farm.length >= 12 ? '🚫 农场已满' : '🐾 可收养' }}
      </span>
      <span class="enemy-subject" :style="{ color: store.currentSubjectTheme?.primary }"
        >[{{ store.enemy?.subjectLabel }}]</span
      >
      <span v-if="store.enemy?.elementLabel" class="enemy-element" :style="{ background: enemyElementColor }">
        {{ store.enemy?.elementLabel }}
      </span>
      <span v-if="store.gameMode === 'weekly_boss'" class="weekly-boss-tag">限时</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../../stores/game.ts'
import { DUNGEON_ELEMENTS } from '../../data/farm.ts'

const store = useGameStore()

const enemyElementColor = computed(() => {
  if (!store.enemy?.element) return '#666'
  return DUNGEON_ELEMENTS[store.enemy.element]?.color || '#666'
})
</script>

<style scoped>
.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.floor-badge {
  background: #ff6b6b;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: bold;
}

.enemy-info {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.enemy-name {
  font-size: 1.2em;
  font-weight: bold;
}

.captureable-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid rgba(46, 204, 113, 0.4);
  color: #2ecc71;
  font-weight: bold;
  animation: pulse-capture 1.5s ease-in-out infinite;
}

.captureable-badge.farm-full {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  animation: none;
}

@keyframes pulse-capture {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.enemy-subject {
  color: #ffd93d;
}

.enemy-element {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #fff;
}

.weekly-boss-tag {
  background: #e74c3c;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: bold;
}
</style>
