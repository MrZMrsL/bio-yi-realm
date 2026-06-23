<template>
  <div class="fishing-header">
    <div class="fishing-level">🎣 钓鱼等级 Lv.{{ store.fishingLevel }}</div>
    <div class="fishing-count">
      <span v-if="store.dailyFishCount < FISHING_DAILY_LIMIT" class="count-normal">本轮剩余 {{ fishRemaining }} 次</span>
      <span v-else class="count-limited">⚠️ 本轮已达上限，需答题解锁</span>
    </div>
    <div class="fishing-stats">已捕获 {{ store.recentCatches.length }} 条 | 图鉴 {{ fishCollectionPercent }}%</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../../stores/game.ts'
import { useCyclopedia } from '../../composables/useCyclopedia.js'
import { FISHING_DAILY_LIMIT } from '../../config/balance.js'

const store = useGameStore()
const { fishCollectionPercent } = useCyclopedia()

const fishRemaining = computed(() => Math.max(0, FISHING_DAILY_LIMIT - store.dailyFishCount))
</script>

<style scoped>
.fishing-header {
  text-align: center;
  padding: 12px;
  background: rgba(15, 52, 96, 0.6);
  border-radius: 12px;
}

.fishing-level {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
}

.fishing-stats {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.fishing-count {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: bold;
}

.count-normal {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.15);
}

.count-limited {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.15);
  animation: pulse-warning 1.5s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
