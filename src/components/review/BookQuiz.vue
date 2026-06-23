<template>
  <div class="book-quiz-panel">
    <div class="book-quiz-header">
      📚 《{{ store.bookQuizBookName }}》测验
      <span style="font-size: 12px; color: #888"> 第 {{ store.bookQuizIndex + 1 }}/{{ store.bookQuizTotalCount }} 题 </span>
    </div>
    <div class="progress-bar" style="margin-bottom: 12px">
      <div class="progress-fill" :style="{ width: (store.bookQuizIndex / store.bookQuizTotalCount) * 100 + '%' }"></div>
    </div>

    <div v-if="store.bookQuizCurrentQuestion" class="book-quiz-question">
      <div class="question-text" style="font-size: 14px; font-weight: bold; margin-bottom: 12px">
        {{ store.bookQuizCurrentQuestion.q }}
      </div>
      <div class="options" style="display: flex; flex-direction: column; gap: 8px">
        <button
          v-for="(opt, oi) in store.bookQuizCurrentQuestion.options"
          :key="oi"
          type="button"
          class="option-btn"
          :disabled="quizAnswered"
          :class="{
            correct: quizAnswered && oi === store.bookQuizCurrentQuestion.answer,
            wrong: quizAnswered && oi === quizSelected && oi !== store.bookQuizCurrentQuestion.answer,
          }"
          @click="submitBookQuizAnswer(oi)"
        >
          {{ opt }}
        </button>
      </div>
      <div
        v-if="quizFeedback"
        class="quiz-feedback"
        :class="{ correct: quizLastCorrect }"
        style="margin-top: 10px; text-align: center; font-weight: bold; font-size: 14px"
      >
        {{ quizFeedback }}
      </div>
      <button v-if="quizAnswered && !isQuizDone" type="button" class="quiz-next-btn" @click="nextBookQuiz">下一题</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../../stores/game.ts'

const store = useGameStore()

const quizAnswered = ref(false)
const quizSelected = ref(-1)
const quizFeedback = ref('')
const quizLastCorrect = ref(false)
const isQuizDone = ref(false)

function submitBookQuizAnswer(index) {
  if (quizAnswered.value) return
  quizAnswered.value = true
  quizSelected.value = index

  const q = store.bookQuizQuestions[store.bookQuizIndex]
  const correct = index === q.answer
  quizLastCorrect.value = correct

  if (correct) {
    quizFeedback.value = '✅ 回答正确！'
  } else {
    quizFeedback.value = `❌ 正确答案：${q.options[q.answer]}`
  }

  store.submitBookQuizAnswer(index)
}

function nextBookQuiz() {
  quizAnswered.value = false
  quizSelected.value = -1
  quizFeedback.value = ''
  quizLastCorrect.value = false

  if (store.bookQuizDone) {
    isQuizDone.value = true
  }
}
</script>

<style scoped>
.book-quiz-panel {
  background: rgba(52, 152, 219, 0.08);
  border: 1px solid rgba(52, 152, 219, 0.2);
  border-radius: 10px;
  padding: 14px;
  margin: 8px 0;
}

.book-quiz-header {
  font-size: 13px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-bar {
  height: 6px;
  background: #444;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.book-quiz-question .option-btn {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #555;
  border-radius: 8px;
  background: #444;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.book-quiz-question .option-btn:hover:not(:disabled) {
  background: #555;
  border-color: #666;
}

.book-quiz-question .option-btn.correct {
  background: rgba(46, 204, 113, 0.2);
  border-color: #2ecc71;
  color: #2ecc71;
}

.book-quiz-question .option-btn.wrong {
  background: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
  color: #e74c3c;
}

.book-quiz-question .option-btn:disabled {
  cursor: default;
}

.quiz-feedback {
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
}

.quiz-feedback.correct {
  color: #2ecc71;
}

.quiz-feedback:not(.correct) {
  color: #e74c3c;
}

.quiz-next-btn {
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
</style>
