<template>
  <div class="review-result">
    <div class="result-header">
      <div class="result-icon">🎓</div>
      <h3 class="result-title">复习完成</h3>
    </div>
    <div class="result-summary">
      <div class="result-item">
        <span class="result-num">{{ correctCount }}</span>
        <span class="result-label">答对</span>
      </div>
      <div class="result-item">
        <span class="result-num wrong">{{ wrongCount }}</span>
        <span class="result-label">答错</span>
      </div>
      <div class="result-item">
        <span class="result-num">{{ masteredCount }}</span>
        <span class="result-label">新掌握</span>
      </div>
    </div>
    <div class="result-detail">
      <div v-for="(r, idx) in store.reviewResults" :key="idx" class="result-row" :class="{ correct: r.correct }">
        <span class="result-dot">{{ r.correct ? '✅' : '❌' }}</span>
        <span class="result-subject" :class="r.subject">{{ r.subject }}</span>
        <span class="result-diff" :class="r.diff">{{ r.diff }}</span>
      </div>
    </div>
    <button type="button" class="btn-back" @click="store.exitReview">返回错题本</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../../stores/game.ts'

const store = useGameStore()

const correctCount = computed(() => store.reviewResults.filter(r => r.correct).length)
const wrongCount = computed(() => store.reviewResults.filter(r => !r.correct).length)
const masteredCount = computed(() => store.reviewResults.filter(r => r.correct).length)
</script>

<style scoped>
.review-result {
  text-align: center;
  padding: 20px;
}

.result-header {
  margin-bottom: 20px;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.result-header .result-title {
  font-size: 20px;
  color: #fff;
  margin: 0;
}

.result-summary {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-num {
  font-size: 32px;
  font-weight: bold;
  color: #2ecc71;
}

.result-num.wrong {
  color: #e74c3c;
}

.result-label {
  font-size: 12px;
  color: #aaa;
  margin-top: 4px;
}

.result-detail {
  max-width: 400px;
  margin: 0 auto 24px;
  text-align: left;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
}

.result-row.correct {
  background: rgba(46, 204, 113, 0.1);
}

.result-dot {
  font-size: 14px;
}

.result-subject {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.result-subject.chem {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.result-subject.bio {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.result-subject.yi {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
}

.result-diff {
  font-size: 12px;
  color: #888;
}

.btn-back {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #444;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #555;
}
</style>
