<script setup>
import { useDialog } from '../composables/useDialog.js'

const { state, onConfirm, onCancel } = useDialog()

function onKeydown(e) {
  if (e.key === 'Escape') onCancel()
  if (e.key === 'Enter' && state.type === 'prompt') onConfirm()
}
</script>

<template>
  <Transition name="dialog">
    <div v-if="state.visible" class="dialog-overlay" @click.self="onCancel">
      <div ref="modalEl" class="dialog-modal" tabindex="-1" @keydown="onKeydown">
      <h3 class="dialog-title">{{ state.title }}</h3>
      <p v-if="state.message" class="dialog-message">{{ state.message }}</p>

      <div v-if="state.type === 'prompt'" class="dialog-input-wrap">
        <input
          v-model="state.inputValue"
          type="text"
          class="dialog-input"
          :placeholder="state.placeholder"
          autofocus
          @keydown.enter.stop="onConfirm"
        />
      </div>

      <div class="dialog-actions">
        <button type="button" class="dialog-btn dialog-cancel" @click="onCancel">
          {{ state.cancelText }}
        </button>
        <button type="button" class="dialog-btn dialog-confirm" @click="onConfirm">
          {{ state.confirmText }}
        </button>
      </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}

.dialog-modal {
  width: 100%;
  max-width: 400px;
  background: #1a1a2e;
  border: 2px solid rgba(212, 168, 83, 0.4);
  border-radius: 20px;
  padding: 24px;
  color: #eee;
  outline: none;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.25s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .dialog-modal,
.dialog-leave-active .dialog-modal {
  transition: all 0.25s ease;
}

.dialog-enter-from .dialog-modal,
.dialog-leave-to .dialog-modal {
  opacity: 0;
  transform: scale(0.92);
}

.dialog-title {
  margin: 0 0 12px;
  font-size: 18px;
  color: #d4a853;
}

.dialog-message {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #ccc;
  white-space: pre-line;
}

.dialog-input-wrap {
  margin-bottom: 20px;
}

.dialog-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(212, 168, 83, 0.3);
  background: #0f0f1a;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.dialog-input:focus {
  border-color: #d4a853;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-btn {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.dialog-btn:hover {
  opacity: 0.85;
}

.dialog-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
}

.dialog-confirm {
  background: linear-gradient(135deg, #d4a853, #b8860b);
  color: #1a1a2e;
  font-weight: bold;
}
</style>
