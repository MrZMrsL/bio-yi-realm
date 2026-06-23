<template>
  <div v-if="guideStore.currentStep" class="tutorial-overlay" @click.self="onOverlayClick">
    <div class="tutorial-modal">
      <div class="tutorial-header">
        <span class="tutorial-step">{{ progressText }}</span>
        <button type="button" class="tutorial-skip" @click="skip">跳过</button>
      </div>
      <div class="tutorial-content">
        <h3 class="tutorial-title">{{ guideStore.currentStep.title }}</h3>
        <p class="tutorial-text">{{ guideStore.currentStep.text }}</p>
      </div>
      <div class="tutorial-actions">
        <button type="button" class="tutorial-btn" @click="next">
          {{ isLastStep ? '开始冒险！' : '下一步 →' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGuideStore } from '../stores/guideStore.ts'
import { GUIDE_STEPS } from '../data/guideSteps.ts'

const guideStore = useGuideStore()

const LAST_STEP_ID = GUIDE_STEPS[GUIDE_STEPS.length - 1].id

const progressText = computed(() => {
  if (!guideStore.currentStep) return ''
  const index = guideStore.shownCount + 1
  return `${index} / ${guideStore.totalSteps}`
})

const isLastStep = computed(() => {
  return guideStore.currentStep?.id === LAST_STEP_ID
})

function next() {
  if (isLastStep.value) {
    guideStore.completeGuide()
  } else {
    guideStore.nextStep()
  }
}

function skip() {
  guideStore.skipGuide()
}

function onOverlayClick() {
  // 点击遮罩不关闭，避免误触
}
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 20px;
}

.tutorial-modal {
  background: #1a1a2e;
  border: 2px solid rgba(212, 168, 83, 0.4);
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  animation: tutorial-pop 0.4s ease;
}

@keyframes tutorial-pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tutorial-step {
  font-size: 13px;
  color: #d4a853;
  font-weight: bold;
}

.tutorial-skip {
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
}

.tutorial-skip:hover {
  color: #e74c3c;
}

.tutorial-content {
  text-align: center;
  margin-bottom: 24px;
}

.tutorial-title {
  font-size: 20px;
  color: #e0e0e0;
  margin-bottom: 12px;
}

.tutorial-text {
  font-size: 14px;
  color: #a0a0a0;
  line-height: 1.6;
}

.tutorial-actions {
  display: flex;
  justify-content: center;
}

.tutorial-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.tutorial-btn:hover {
  transform: scale(1.05);
}
</style>
