<script setup>
import { useToast } from '../composables/useToast.js'

const { toasts, remove } = useToast()

function icon(type) {
  const map = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return map[type] || 'ℹ️'
}
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="'toast-' + toast.type"
        @click="remove(toast.id)"
      >
        <span class="toast-icon">{{ icon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  min-width: 220px;
  max-width: 360px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #fff;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.toast-success {
  border-left: 4px solid #4caf50;
}
.toast-error {
  border-left: 4px solid #f44336;
}
.toast-warning {
  border-left: 4px solid #ff9800;
}
.toast-info {
  border-left: 4px solid #2196f3;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
