<template>
  <div class="pvp-quiz-panel">
    <div class="pvp-question">{{ question?.q }}</div>
    <div class="pvp-options">
      <button
        v-for="(opt, i) in question?.options"
        :key="i"
        type="button"
        class="pvp-option-btn"
        :disabled="answerSubmitted"
        @click="$emit('submit', i)"
      >
        {{ opt }}
      </button>
    </div>
    <div v-if="answerSubmitted" class="pvp-answer-feedback" :class="lastAnswerCorrect ? 'correct' : 'wrong'">
      {{ lastAnswerCorrect ? '✅ 回答正确！' : '❌ 回答错误！' }}
    </div>
    <button v-if="answerSubmitted" type="button" class="pvp-btn-next" @click="$emit('next')">
      {{ isLastRound ? '查看结果' : '下一回合 →' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  question: { type: Object, default: null },
  answerSubmitted: { type: Boolean, default: false },
  lastAnswerCorrect: { type: Boolean, default: false },
  isLastRound: { type: Boolean, default: false },
})

defineEmits(['submit', 'next'])
</script>

<style scoped>
.pvp-quiz-panel {
  background: rgba(26, 26, 26, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
}

.pvp-question {
  font-size: 14px;
  color: #f4d03f;
  margin-bottom: 12px;
  line-height: 1.5;
}

.pvp-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pvp-option-btn {
  padding: 12px 16px;
  background: #333;
  color: #e0e0e0;
  border: 2px solid #444;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.pvp-option-btn:hover:not(:disabled) {
  background: #444;
  border-color: #d4a853;
}

.pvp-option-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pvp-answer-feedback {
  text-align: center;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  animation: feedback-pop 0.3s ease;
}

.pvp-answer-feedback.correct {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.pvp-answer-feedback.wrong {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

@keyframes feedback-pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.pvp-btn-next {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  background: #4ecdc4;
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.pvp-btn-next:hover {
  transform: translateY(-2px);
}
</style>
