<template>
  <div class="material-panel">
    <div class="material-title">💎 材料库存</div>
    <div class="material-list">
      <div v-for="mat in materialList" :key="mat.name" class="material-item">
        <span class="material-icon">{{ mat.icon }}</span>
        <span class="material-name">{{ mat.name }}</span>
        <span class="material-count">×{{ mat.count }}</span>
      </div>
      <div v-if="materialList.length === 0" class="material-empty">暂无材料，击败怪物掉落</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  inventory: { type: Object, default: () => ({}) },
})

const MATERIAL_ICONS = {
  水之精华: '💧',
  火焰核心: '🔥',
  酸液结晶: '🧪',
  雷电石: '⚡',
  冰霜碎片: '❄️',
  风之羽毛: '🌪️',
}

const materialList = computed(() =>
  Object.entries(props.inventory || {})
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({
      name,
      count,
      icon: MATERIAL_ICONS[name] || '💎',
    }))
)
</script>

<style scoped>
.material-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.material-title {
  font-size: 13px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 8px;
}

.material-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 11px;
}

.material-icon {
  font-size: 1.2em;
}

.material-name {
  color: #aaa;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-count {
  color: #d4a853;
  font-weight: bold;
}

.material-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #666;
  font-size: 12px;
  padding: 8px 0;
}

@media (max-width: 360px) {
  .material-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
