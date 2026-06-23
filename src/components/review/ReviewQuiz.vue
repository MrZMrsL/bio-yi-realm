<template>
  <div class="review-quiz">
    <div class="review-progress">
      <span class="progress-text">第 {{ store.reviewIndex + 1 }} 题 / 共 {{ store.reviewPool.length }} 题</span>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (store.reviewIndex / store.reviewPool.length) * 100 + '%' }"></div>
      </div>
    </div>

    <div class="review-stats-inline">
      <span class="badge" :class="store.reviewCurrent.subject">{{ subjectLabel }}</span>
      <span class="badge" :class="store.reviewCurrent.diff">{{ diffLabel }}</span>
      <span class="badge wrong-count">做错 {{ store.reviewCurrent.wrongCount }} 次</span>
    </div>

    <div class="question-box">
      <div class="question-text">{{ store.reviewCurrent.q }}</div>
      <div class="options">
        <button
          v-for="(opt, i) in store.reviewCurrent.options"
          :key="i"
          type="button"
          class="option-btn"
          :disabled="answered"
          :class="{
            correct: answered && i === store.reviewCurrent.answer,
            wrong: answered && i === selectedAnswer && i !== store.reviewCurrent.answer,
          }"
          @click="submitAnswer(i)"
        >
          {{ opt }}
        </button>
      </div>
    </div>

    <div v-if="answered" class="answer-feedback">
      <div v-if="isCorrect" class="feedback correct">✅ 回答正确！已标记为掌握</div>
      <div v-else class="feedback wrong">
        ❌ 回答错误！正确答案：{{ store.reviewCurrent.options[store.reviewCurrent.answer] }}
      </div>
      <button type="button" class="btn-next" @click="nextQuestion">{{ isLast ? '完成复习' : '下一题' }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/game.ts'

const store = useGameStore()
const answered = ref(false)
const selectedAnswer = ref(-1)
const isCorrect = ref(false)

const subjectLabel = computed(() => {
  const s = store.reviewCurrent?.subject
  return s === 'chem' ? '化学' : s === 'bio' ? '生物' : '易学'
})

const diffLabel = computed(() => {
  const d = store.reviewCurrent?.diff
  return d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'
})

const isLast = computed(() => store.reviewIndex >= store.reviewPool.length - 1)

function submitAnswer(index) {
  if (answered.value) return
  selectedAnswer.value = index
  answered.value = true
  isCorrect.value = index === store.reviewCurrent.answer
  store.submitReviewAnswer(index)
}

function nextQuestion() {
  answered.value = false
  selectedAnswer.value = -1
  isCorrect.value = false
  // reviewCurrent 会自动更新，如果是最后一题会变成 null
}
</script>

<style scoped>
.review-quiz {
  max-width: 600px;
  margin: 0 auto;
}

.review-progress {
  margin-bottom: 16px;
}

.review-progress .progress-text {
  font-size: 13px;
  color: #aaa;
  display: block;
  margin-bottom: 6px;
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

.review-stats-inline {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.question-box {
  background: #3a3a3a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.question-text {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16px;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  padding: 12px 16px;
  border: 1px solid #555;
  border-radius: 8px;
  background: #444;
  color: #ddd;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover:not(:disabled) {
  background: #555;
  border-color: #666;
}

.option-btn.correct {
  background: rgba(46, 204, 113, 0.2);
  border-color: #2ecc71;
  color: #2ecc71;
}

.option-btn.wrong {
  background: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
  color: #e74c3c;
}

.option-btn:disabled {
  cursor: default;
}

.answer-feedback {
  text-align: center;
  padding: 16px;
  background: #3a3a3a;
  border-radius: 12px;
}

.feedback {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.feedback.correct {
  color: #2ecc71;
}

.feedback.wrong {
  color: #e74c3c;
}

.btn-next {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-next:hover {
  background: #2980b9;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
}

.badge.chem {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.badge.bio {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.badge.yi {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
}

.badge.easy {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.badge.medium {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
}

.badge.hard {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.badge.wrong-count {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}
</style>
