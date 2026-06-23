<template>
  <div v-if="caughtFish" class="caught-panel">
    <div class="caught-card" :style="{ borderColor: rarityConfig[caughtFish.rarity]?.color }">
      <div class="caught-icon">{{ caughtFish.icon }}</div>
      <div class="caught-info">
        <div class="caught-name" :style="{ color: rarityConfig[caughtFish.rarity]?.color }">
          {{ caughtFish.name }}
        </div>
        <div class="caught-rarity">{{ rarityConfig[caughtFish.rarity]?.label }}</div>
        <div class="caught-knowledge">{{ caughtFish.knowledge }}</div>
        <div class="caught-heal">❤️ 恢复 {{ caughtFish.healHp }} 点生命</div>
      </div>
    </div>
    <div class="caught-actions">
      <button type="button" class="action-btn eat-btn" @click="emit('eat')">🍽️ 食用（恢复 {{ caughtFish.healHp }} HP）</button>
      <button type="button" class="action-btn release-btn" @click="emit('release')">
        🌊 放生（+{{ Math.floor(caughtFish.healHp * 0.5) }} 经验）
      </button>
    </div>
  </div>
</template>

<script setup>
import { RARITY_CONFIG } from '../../data/fishingMeta.ts'

defineProps({
  caughtFish: { type: Object, default: null },
})

const emit = defineEmits(['eat', 'release'])

const rarityConfig = RARITY_CONFIG
</script>

<style scoped>
.caught-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.caught-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 52, 96, 0.6);
  border-radius: 12px;
  border: 2px solid;
}

.caught-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.caught-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.caught-name {
  font-size: 18px;
  font-weight: bold;
}

.caught-rarity {
  font-size: 12px;
  color: #888;
}

.caught-knowledge {
  font-size: 13px;
  color: #a0a0a0;
  line-height: 1.5;
}

.caught-heal {
  font-size: 13px;
  color: #2ecc71;
  font-weight: bold;
}

.caught-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.eat-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: #fff;
}

.release-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
}

.action-btn:hover {
  transform: translateY(-1px);
}
</style>
