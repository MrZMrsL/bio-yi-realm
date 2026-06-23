<template>
  <div class="leaderboard-empty">
    <span class="empty-icon">{{ icon }}</span>
    <p class="empty-text">{{ text }}</p>
    <p v-if="hint" class="empty-hint">{{ hint }}</p>
    <button
      v-if="showRetry"
      type="button"
      class="retry-btn"
      @click="$emit('retry')"
    >
      重新加载
    </button>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  text: { type: String, required: true },
  hint: { type: String, default: '' },
  showRetry: { type: Boolean, default: false },
})

defineEmits(['retry'])
</script>

<style scoped>
.leaderboard-empty {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #888;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #d4a853, #b8860b);
  color: #1a1a2e;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.retry-btn:hover {
  opacity: 0.85;
}
</style>