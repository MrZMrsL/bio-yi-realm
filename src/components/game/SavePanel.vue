<template>
  <div class="save-actions">
    <button type="button" class="save-btn" @click="emit('save')">
      <span class="save-icon">💾</span>
      <span>保存存档</span>
    </button>
    <button type="button" class="save-btn" @click="emit('export')">
      <span class="save-icon">📤</span>
      <span>导出存档</span>
    </button>
    <button type="button" class="save-btn" @click="emit('import')">
      <span class="save-icon">📥</span>
      <span>导入存档</span>
    </button>
    <button type="button" class="save-btn danger" @click="emit('reset')">
      <span class="save-icon">🗑️</span>
      <span>重置游戏</span>
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['save', 'export', 'import', 'reset'])
</script>

<style scoped>
.save-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  background: rgba(212, 168, 83, 0.1);
  border-color: rgba(212, 168, 83, 0.3);
}

.save-btn.danger:hover {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.save-icon {
  font-size: 24px;
}
</style>
