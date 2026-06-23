<template>
  <div class="collection-progress">
    <div class="section-title">📖 鱼类图鉴</div>
    <div class="rarity-bars">
      <div v-for="(config, rarity) in rarityStats" :key="rarity" class="rarity-bar">
        <span class="bar-label">{{ config.label }}</span>
        <div class="bar-track">
          <div class="bar-fill" :style="{ width: collectionPercent(rarity) + '%', background: config.color }"></div>
        </div>
        <span class="bar-count">{{ collectionCount(rarity) }} / {{ totalByRarity(rarity) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCyclopedia } from '../../composables/useCyclopedia.js'

const { fishCollectionByRarity } = useCyclopedia()

const props = defineProps({
  allFish: { type: Array, default: () => [] },
})

const rarityStats = computed(() => fishCollectionByRarity(props.allFish))

function collectionPercent(rarity) {
  return rarityStats.value[rarity]?.percent || 0
}

function collectionCount(rarity) {
  return rarityStats.value[rarity]?.have || 0
}

function totalByRarity(rarity) {
  return rarityStats.value[rarity]?.total || 0
}
</script>

<style scoped>
.collection-progress {
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

.rarity-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rarity-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.bar-label {
  width: 40px;
  color: #a0a0a0;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-count {
  width: 50px;
  color: #888;
  text-align: right;
  font-size: 11px;
}
</style>
