<template>
  <div class="panel-header">
    <button type="button" class="btn-back" @click="emit('back')">← 返回</button>
    <span class="panel-title">{{ title }}</span>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
})

const emit = defineEmits(['back'])
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  background: #0f3460;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #d4a853;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  flex-shrink: 0;
  min-height: 36px;
}

.btn-back:hover {
  background: rgba(212, 168, 83, 0.2);
}

.panel-title {
  font-size: 15px;
  font-weight: bold;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
