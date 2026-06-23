<template>
  <!-- 传说鱼答题面板 -->
  <div v-if="fishingState === 'quiz' && quizQuestion" class="quiz-panel">
    <div class="quiz-title">🎣 传说鱼正在挣扎！</div>
    <div class="quiz-hint">答对题目才能成功钓起 {{ caughtFish?.name }}</div>
    <div class="question">{{ quizQuestion.q }}</div>
    <div class="options">
      <button v-for="(opt, i) in quizQuestion.options" :key="i" type="button" class="option-btn" @click="submitAnswer(i)">
        {{ opt }}
      </button>
    </div>
  </div>

  <!-- 钓鱼次数限制答题面板 -->
  <div v-if="fishingState === 'limitQuiz' && quizQuestion" class="quiz-panel">
    <div class="quiz-title">🔒 钓鱼次数已达上限</div>
    <div class="quiz-hint">答对此题可继续无限钓鱼</div>
    <div class="question">{{ quizQuestion.q }}</div>
    <div class="options">
      <button v-for="(opt, i) in quizQuestion.options" :key="i" type="button" class="option-btn" @click="submitAnswer(i)">
        {{ opt }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { sfxClick } from '../../utils/sfx.ts'

defineProps({
  fishingState: { type: String, default: 'idle' },
  quizQuestion: { type: Object, default: null },
  caughtFish: { type: Object, default: null },
})

const emit = defineEmits(['submit-answer'])

function submitAnswer(index) {
  sfxClick()
  emit('submit-answer', index)
}
</script>

<style scoped>
.quiz-panel {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #d4a853;
  animation: fadeIn 0.5s ease;
}

.quiz-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
  text-align: center;
  margin-bottom: 8px;
}

.quiz-hint {
  font-size: 13px;
  color: #888;
  text-align: center;
  margin-bottom: 16px;
}

.question {
  font-size: 15px;
  color: #ffd93d;
  margin-bottom: 12px;
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-btn {
  padding: 10px 14px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.option-btn:hover {
  background: #444;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
