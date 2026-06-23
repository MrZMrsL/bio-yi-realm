<template>
  <div v-if="visible" class="prep-modal-overlay" @click.self="$emit('close')">
    <div class="prep-modal">
      <div class="prep-modal-header">
        <span class="prep-modal-title">{{ title }}</span>
        <button type="button" class="prep-modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="prep-modal-body">
        <!-- 装备选择 -->
        <template v-if="mode === 'equip'">
          <div v-if="equipItems.length === 0" class="prep-modal-empty">
            背包中没有{{ equipTypeLabel }}
          </div>
          <div
            v-for="item in equipItems"
            :key="item.id"
            class="prep-modal-item"
            :class="{ active: equippedItemId === item.id }"
            @click="$emit('select', item)"
          >
            <span class="prep-modal-icon">{{ item.icon || defaultEquipIcon }}</span>
            <span class="prep-modal-name">{{ item.name }}</span>
            <span class="prep-modal-stat">{{ equipStatText(item) }}</span>
          </div>
          <div class="prep-modal-item empty-item" @click="$emit('unequip')">
            <span class="prep-modal-icon">🚫</span>
            <span class="prep-modal-name">不装备</span>
            <span class="prep-modal-stat">-</span>
          </div>
        </template>

        <!-- 宠物选择 -->
        <template v-if="mode === 'pet'">
          <div v-if="farm.length === 0" class="prep-modal-empty">农场中没有怪物，先去捕捉吧！</div>
          <div
            v-for="(monster, idx) in farm"
            :key="idx"
            class="prep-modal-item"
            :class="{ active: activeMonsterName === monster.name }"
            @click="$emit('select', { index: idx, monster })"
          >
            <span class="prep-modal-icon">{{ monster.icon }}</span>
            <span class="prep-modal-name">{{ monster.name }}</span>
            <span class="prep-modal-stat">{{ monster.ability?.desc || '' }}</span>
          </div>
          <div class="prep-modal-item empty-item" @click="$emit('unequip')">
            <span class="prep-modal-icon">🚫</span>
            <span class="prep-modal-name">不携带宠物</span>
            <span class="prep-modal-stat">-</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
  mode: { type: String, required: true }, // 'equip' | 'pet'
  equipType: { type: String, default: '' },
  equipItems: { type: Array, default: () => [] },
  equippedItemId: { type: [String, Number], default: null },
  farm: { type: Array, default: () => [] },
  activeMonsterName: { type: String, default: '' },
})

defineEmits(['close', 'select', 'unequip'])

const title = computed(() => {
  if (props.mode === 'pet') return '🐾 选择宠物'
  const map = { weapon: '⚔️ 选择武器', armor: '🛡️ 选择防具', accessory: '💍 选择饰品' }
  return map[props.equipType] || '选择装备'
})

const equipTypeLabel = computed(() => {
  const map = { weapon: '武器', armor: '防具', accessory: '饰品' }
  return map[props.equipType] || '装备'
})

const defaultEquipIcon = computed(() => {
  const map = { weapon: '⚔️', armor: '🛡️', accessory: '💍' }
  return map[props.equipType] || '🔹'
})

function equipStatText(item) {
  if (props.equipType === 'weapon') return `攻+${item.atk}`
  if (props.equipType === 'armor') return `防+${item.def}`
  return `攻+${item.atk || 0} 防+${item.def || 0}`
}
</script>

<style scoped>
.prep-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.prep-modal {
  background: #1a1a2e;
  border: 1px solid rgba(212, 168, 83, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.prep-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.prep-modal-title {
  font-size: 16px;
  font-weight: bold;
  color: #d4a853;
}

.prep-modal-close {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.prep-modal-body {
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prep-modal-empty {
  text-align: center;
  padding: 24px;
  color: #666;
  font-size: 14px;
}

.prep-modal-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s;
}

.prep-modal-item:hover {
  background: rgba(212, 168, 83, 0.12);
  transform: translateX(4px);
}

.prep-modal-item.active {
  background: rgba(212, 168, 83, 0.2);
  border: 1px solid rgba(212, 168, 83, 0.4);
}

.prep-modal-item.empty-item {
  opacity: 0.7;
}

.prep-modal-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.prep-modal-name {
  font-size: 14px;
  color: #e0e0e0;
  flex: 1;
}

.prep-modal-stat {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
}
</style>
