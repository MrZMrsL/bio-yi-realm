<template>
  <div class="tab-bar">
    <button type="button" class="tab-btn" :class="{ active: modelValue === 'review' }" @click="emit('update:modelValue', 'review')">
      📝 错题本 ({{ store.wrongStats.pending }})
    </button>
    <button type="button" class="tab-btn" :class="{ active: modelValue === 'knowledge' }" @click="emit('update:modelValue', 'knowledge')">
      📖 收藏知识 ({{ store.collectedKnowledge.length }})
    </button>
  </div>
</template>

<script setup>
import { useGameStore } from '../../stores/game.ts'

const store = useGameStore()

defineProps({
  modelValue: { type: String, default: 'review' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: #999;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(212, 168, 83, 0.12);
  border-color: rgba(212, 168, 83, 0.4);
  color: #d4a853;
}
</style>
