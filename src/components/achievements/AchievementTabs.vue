<template>
  <div class="achievements-tabs">
    <button
      v-for="cat in categories"
      :key="cat.key"
      type="button"
      class="tab-btn"
      :class="{ active: modelValue === cat.key }"
      @click="$emit('update:modelValue', cat.key)"
    >
      {{ cat.label }} ({{ categoryCount(cat.key) }})
    </button>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, required: true },
  categoryCount: { type: Function, required: true },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
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
</style>