<template>
  <div class="feedback-panel">
    <div class="feedback-header">
      <h3 class="feedback-title">💬 反馈与留言</h3>
      <p class="feedback-subtitle">你的反馈是我们优化的动力！</p>
    </div>
    <div class="feedback-form">
      <div class="feedback-row">
        <label class="feedback-label">反馈类型</label>
        <div class="feedback-type-list">
          <button
            v-for="t in FEEDBACK_TYPES"
            :key="t.value"
            type="button"
            class="feedback-type-btn"
            :class="{ active: feedbackType === t.value }"
            @click="feedbackType = t.value"
          >
            {{ t.label }}
          </button>
        </div>
      </div>
      <div class="feedback-row">
        <label class="feedback-label">标题</label>
        <input v-model="feedbackTitle" type="text" class="feedback-input" placeholder="一句话概括你的反馈" />
      </div>
      <div class="feedback-row">
        <label class="feedback-label">详细内容</label>
        <textarea
          v-model="feedbackBody"
          class="feedback-textarea"
          :placeholder="currentFeedbackPlaceholder"
          rows="6"
        ></textarea>
      </div>
      <div class="feedback-row">
        <label class="feedback-label">游戏信息（自动附带）</label>
        <div class="feedback-meta">
          <span>等级: {{ store.level }}</span>
          <span>楼层: {{ store.floor }}</span>
          <span>版本: v7.0</span>
        </div>
      </div>
      <div class="feedback-actions">
        <button
          type="button"
          class="btn-feedback-submit"
          :disabled="!feedbackTitle.trim() || !feedbackBody.trim()"
          @click="submitFeedback"
        >
          🚀 提交到 GitHub Issues
        </button>
        <button type="button" class="btn-feedback-chat" @click="submitFeedbackViaChat">📨 直接发给老郑</button>
      </div>
      <div class="feedback-hint">
        <p class="feedback-hint-text">💡 提示：提交到 GitHub Issues 需要你有 GitHub 账号，提交后开发团队会收到邮件通知。</p>
        <p class="feedback-hint-text">💡 或者直接点击「发给老郑」，通过 Kimi 助手实时送达。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/game.ts'
import { FEEDBACK_TYPES } from '../../data/help.ts'
import { useToast } from '../../composables/useToast.js'
import { openExternalLink } from '../../platform/link.js'

const store = useGameStore()
const toast = useToast()

const feedbackType = ref('bug')
const feedbackTitle = ref('')
const feedbackBody = ref('')

const currentFeedbackPlaceholder = computed(() => {
  const t = FEEDBACK_TYPES.find(x => x.value === feedbackType.value)
  return t?.placeholder || '请输入反馈内容...'
})

function submitFeedback() {
  const meta = `\n\n---\n**游戏信息**\n- 等级: ${store.level}\n- 楼层: ${store.floor}\n- 版本: v7.0\n- 时间: ${new Date().toLocaleString()}`
  const fullBody = feedbackBody.value + meta
  const url = `https://github.com/MrZMrsL/bio-yi-realm/issues/new?title=${encodeURIComponent(feedbackTitle.value)}&body=${encodeURIComponent(fullBody)}`
  openExternalLink(url, { target: '_blank' })
}

function submitFeedbackViaChat() {
  const text =
    '反馈已准备发送！请复制以下内容发给老郑：\n\n【类型】' +
    FEEDBACK_TYPES.find(t => t.value === feedbackType.value)?.label +
    '\n【标题】' +
    feedbackTitle.value +
    '\n【内容】' +
    feedbackBody.value
  toast.info(text, 5000)
}
</script>

<style scoped>
.feedback-panel {
  padding: 16px;
}

.feedback-header {
  text-align: center;
  margin-bottom: 16px;
}

.feedback-header .feedback-title {
  color: #e0e0e0;
  margin-bottom: 4px;
}

.feedback-header .feedback-subtitle {
  color: #888;
  font-size: 13px;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feedback-row .feedback-label {
  font-size: 13px;
  color: #888;
  font-weight: bold;
}

.feedback-select,
.feedback-input,
.feedback-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
  color: #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.feedback-select:focus,
.feedback-input:focus,
.feedback-textarea:focus {
  border-color: rgba(212, 168, 83, 0.5);
}

.feedback-select {
  cursor: pointer;
}

.feedback-type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feedback-type-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: #e0e0e0;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.feedback-type-btn.active {
  background: rgba(212, 168, 83, 0.2);
  border-color: #d4a853;
  color: #d4a853;
}

.feedback-textarea {
  resize: vertical;
  min-height: 100px;
}

.feedback-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.feedback-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-feedback-submit {
  background: #d4a853;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-feedback-submit:hover:not(:disabled) {
  background: #e8c67a;
  transform: translateY(-1px);
}

.btn-feedback-submit:disabled {
  background: rgba(212, 168, 83, 0.3);
  color: #888;
  cursor: not-allowed;
}

.btn-feedback-chat {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.3);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-feedback-chat:hover {
  background: rgba(52, 152, 219, 0.3);
}

.feedback-hint {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.feedback-hint .feedback-hint-text {
  margin: 4px 0;
}
</style>
