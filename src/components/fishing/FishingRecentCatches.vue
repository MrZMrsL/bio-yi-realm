<template>
  <div v-if="store.recentCatches.length > 0" class="recent-catches">
    <div class="section-title">📋 最近捕获</div>
    <div class="catch-list">
      <div v-for="(f, i) in store.recentCatches.slice().reverse().slice(0, 8)" :key="i" class="catch-item">
        <span class="catch-icon">{{ f.icon }}</span>
        <span class="catch-name">{{ f.name }}</span>
        <span class="catch-rarity" :style="{ color: rarityConfig[f.rarity]?.color }">
          {{ rarityConfig[f.rarity]?.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../../stores/game.ts'
import { RARITY_CONFIG } from '../../data/fishingMeta.ts'

const store = useGameStore()
const rarityConfig = RARITY_CONFIG
</script>

<style scoped>
.recent-catches {
  padding: 12px;
  background: rgba(15, 52, 96, 0.4);
  border-radius: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 8px;
}

.catch-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.catch-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 12px;
}

.catch-icon {
  font-size: 14px;
}

.catch-name {
  color: #e0e0e0;
}

.catch-rarity {
  font-size: 10px;
}
</style>
