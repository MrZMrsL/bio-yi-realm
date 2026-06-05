<template>
  <div class="review-container">
    <!-- 标签页切换 -->
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'review' }" @click="activeTab = 'review'">
        📝 错题本 ({{ store.wrongStats.pending }})
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'knowledge' }" @click="activeTab = 'knowledge'">
        📖 收藏知识 ({{ store.collectedKnowledge.length }})
      </button>
    </div>

    <!-- 收藏知识页 -->
    <div v-if="activeTab === 'knowledge'" class="knowledge-home">
      <div class="knowledge-header">
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-num">{{ store.collectedKnowledge.length }}</div>
            <div class="stat-label">已收藏</div>
          </div>
        </div>
      </div>

      <div v-if="store.collectedKnowledge.length === 0" class="empty-hint">
        <div class="empty-icon">🎣</div>
        <p>还没有收藏知识点</p>
        <p class="empty-sub">钓鱼钓到古籍后，成功研读即可收藏</p>
      </div>

      <div v-else class="knowledge-list">
        <div v-for="(k, i) in sortedKnowledge" :key="i" class="knowledge-card-wrapper">
          <div class="knowledge-card" @click="toggleExpand(i)">
            <div class="knowledge-icon">{{ k.icon || '📖' }}</div>
            <div class="knowledge-body">
              <div class="knowledge-name">{{ k.name }}</div>
              <div class="knowledge-desc">{{ k.desc }}</div>
              <div class="knowledge-time">收藏于 {{ formatDate(k.learnedAt) }}</div>
            </div>
            <div class="knowledge-expand-icon">{{ expandedIndex === i ? '▲' : '▼' }}</div>
          </div>
          <!-- 展开的知识点 -->
          <div v-if="expandedIndex === i" class="knowledge-points">
            <div class="points-title">📌 知识要点</div>
            <div v-for="(pt, pi) in getPoints(k.name)" :key="pi" class="point-item">
              <span class="point-num">{{ pi + 1 }}.</span>
              <span class="point-text">{{ pt }}</span>
            </div>
            <div v-if="getPoints(k.name).length === 0" class="points-empty">
              暂无详细知识点内容
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 复习模式：答题界面 -->
    <div v-if="activeTab === 'review'">
    <div v-if="store.reviewMode && store.reviewCurrent" class="review-quiz">
      <div class="review-progress">
        <span>第 {{ store.reviewIndex + 1 }} 题 / 共 {{ store.reviewPool.length }} 题</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: ((store.reviewIndex / store.reviewPool.length) * 100) + '%' }"></div>
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
            @click="submitAnswer(i)"
            class="option-btn"
            :disabled="answered"
            :class="{
              correct: answered && i === store.reviewCurrent.answer,
              wrong: answered && i === selectedAnswer && i !== store.reviewCurrent.answer
            }"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <div v-if="answered" class="answer-feedback">
        <div v-if="isCorrect" class="feedback correct">
          ✅ 回答正确！已标记为掌握
        </div>
        <div v-else class="feedback wrong">
          ❌ 回答错误！正确答案：{{ store.reviewCurrent.options[store.reviewCurrent.answer] }}
        </div>
        <button class="btn-next" @click="nextQuestion">{{ isLast ? '完成复习' : '下一题' }}</button>
      </div>
    </div>

    <!-- 复习结果页 -->
    <div v-else-if="store.reviewResults.length > 0 && !store.reviewMode" class="review-result">
      <div class="result-header">
        <div class="result-icon">🎓</div>
        <h3>复习完成</h3>
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
      <button class="btn-back" @click="clearResults">返回错题本</button>
    </div>

    <!-- 错题本主界面 -->
    <div v-else class="review-home">
      <!-- 统计概览 -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-num">{{ store.wrongStats.pending }}</div>
          <div class="stat-label">待复习</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ store.wrongStats.mastered }}</div>
          <div class="stat-label">已掌握</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ store.wrongStats.total }}</div>
          <div class="stat-label">总错题</div>
        </div>
      </div>

      <!-- 按学科分布 -->
      <div class="subject-breakdown">
        <div class="breakdown-title">📊 错题分布</div>
        <div class="breakdown-bars">
          <div class="bar-item">
            <span class="bar-label">🧪 化学</span>
            <div class="bar-track">
              <div class="bar-fill chem" :style="{ width: chemPct + '%' }"></div>
            </div>
            <span class="bar-count">{{ store.wrongStats.bySubject.chem }}</span>
          </div>
          <div class="bar-item">
            <span class="bar-label">🧬 生物</span>
            <div class="bar-track">
              <div class="bar-fill bio" :style="{ width: bioPct + '%' }"></div>
            </div>
            <span class="bar-count">{{ store.wrongStats.bySubject.bio }}</span>
          </div>
          <div class="bar-item">
            <span class="bar-label">☯️ 易学</span>
            <div class="bar-track">
              <div class="bar-fill yi" :style="{ width: yiPct + '%' }"></div>
            </div>
            <span class="bar-count">{{ store.wrongStats.bySubject.yi }}</span>
          </div>
        </div>
      </div>

      <!-- 快速复习按钮 -->
      <div class="quick-review">
        <div class="quick-title">🚀 开始复习</div>
        <div class="quick-buttons">
          <button
            class="btn-review"
            @click="startReview()"
            :disabled="store.wrongStats.pending === 0"
          >
            📚 全部错题 ({{ store.wrongStats.pending }})
          </button>
          <button
            class="btn-review chem"
            @click="startReview('chem')"
            :disabled="store.wrongStats.bySubject.chem === 0"
          >
            🧪 化学 ({{ store.wrongStats.bySubject.chem }})
          </button>
          <button
            class="btn-review bio"
            @click="startReview('bio')"
            :disabled="store.wrongStats.bySubject.bio === 0"
          >
            🧬 生物 ({{ store.wrongStats.bySubject.bio }})
          </button>
          <button
            class="btn-review yi"
            @click="startReview('yi')"
            :disabled="store.wrongStats.bySubject.yi === 0"
          >
            ☯️ 易学 ({{ store.wrongStats.bySubject.yi }})
          </button>
        </div>
      </div>

      <!-- 错题列表 -->
      <div class="wrong-list">
        <div class="list-title">📝 错题列表</div>
        <div v-if="store.wrongQuestions.length === 0" class="empty-hint">
          <div class="empty-icon">🎉</div>
          <p>还没有错题，太棒了！</p>
          <p class="empty-sub">去地牢探索，答错的题目会记录在这里</p>
        </div>
        <div v-else class="wrong-items">
          <div
            v-for="wq in sortedWrongQuestions"
            :key="wq.id"
            class="wrong-item"
            :class="{ mastered: wq.mastered }"
          >
            <div class="wrong-header">
              <span class="badge" :class="wq.subject">{{ subjectName(wq.subject) }}</span>
              <span class="badge" :class="wq.diff">{{ diffName(wq.diff) }}</span>
              <span class="wrong-count">做错 {{ wq.wrongCount }} 次</span>
              <button
                v-if="!wq.mastered"
                class="btn-master"
                @click="store.masterQuestion(wq.id)"
              >
                ✓ 标记掌握
              </button>
              <button
                class="btn-remove"
                @click="store.removeWrongQuestion(wq.id)"
              >
                ✕
              </button>
            </div>
            <div class="wrong-question">{{ wq.q }}</div>
            <div class="wrong-answer">
              <span class="correct-ans">正确答案：{{ wq.options[wq.answer] }}</span>
              <span v-if="wq.wrongAnswer >= 0" class="wrong-ans">你选了：{{ wq.options[wq.wrongAnswer] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { getBookKnowledgePoints } from '../data/fishing.js'

const store = useGameStore()
const answered = ref(false)
const selectedAnswer = ref(-1)
const isCorrect = ref(false)
const activeTab = ref('review')
const expandedIndex = ref(-1)

const sortedKnowledge = computed(() => {
  return [...store.collectedKnowledge].sort((a, b) => (b.learnedAt || 0) - (a.learnedAt || 0))
})

function getPoints(bookName) {
  return getBookKnowledgePoints(bookName)
}

function toggleExpand(i) {
  expandedIndex.value = expandedIndex.value === i ? -1 : i
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const subjectLabel = computed(() => {
  const s = store.reviewCurrent?.subject
  return s === 'chem' ? '化学' : s === 'bio' ? '生物' : '易学'
})

const diffLabel = computed(() => {
  const d = store.reviewCurrent?.diff
  return d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'
})

const isLast = computed(() => store.reviewIndex >= store.reviewPool.length - 1)

const correctCount = computed(() => store.reviewResults.filter(r => r.correct).length)
const wrongCount = computed(() => store.reviewResults.filter(r => !r.correct).length)
const masteredCount = computed(() => store.reviewResults.filter(r => r.correct).length)

const maxSubjectCount = computed(() => {
  return Math.max(
    store.wrongStats.bySubject.chem || 1,
    store.wrongStats.bySubject.bio || 1,
    store.wrongStats.bySubject.yi || 1
  )
})

const chemPct = computed(() => {
  const max = maxSubjectCount.value
  return max > 0 ? Math.round((store.wrongStats.bySubject.chem / max) * 100) : 0
})
const bioPct = computed(() => {
  const max = maxSubjectCount.value
  return max > 0 ? Math.round((store.wrongStats.bySubject.bio / max) * 100) : 0
})
const yiPct = computed(() => {
  const max = maxSubjectCount.value
  return max > 0 ? Math.round((store.wrongStats.bySubject.yi / max) * 100) : 0
})

const sortedWrongQuestions = computed(() => {
  // 未掌握的在前，按做错次数降序
  return [...store.wrongQuestions].sort((a, b) => {
    if (a.mastered !== b.mastered) return a.mastered ? 1 : -1
    return b.wrongCount - a.wrongCount
  })
})

function subjectName(s) {
  return s === 'chem' ? '化学' : s === 'bio' ? '生物' : '易学'
}

function diffName(d) {
  return d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'
}

function startReview(subjectFilter) {
  answered.value = false
  selectedAnswer.value = -1
  isCorrect.value = false
  store.startReview(subjectFilter)
}

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

function clearResults() {
  store.exitReview()
}
</script>

<style scoped>
.review-container {
  padding: 16px;
  color: #fff;
  max-height: 70vh;
  overflow-y: auto;
}

/* 统计概览 */
.stats-overview {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: #333;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-num {
  font-size: 28px;
  font-weight: bold;
  color: #f1c40f;
}

.stat-label {
  font-size: 12px;
  color: #aaa;
  margin-top: 4px;
}

/* 学科分布 */
.subject-breakdown {
  background: #333;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.breakdown-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #ddd;
}

.breakdown-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  width: 60px;
  font-size: 13px;
  color: #bbb;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #444;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-fill.chem { background: #e74c3c; }
.bar-fill.bio { background: #2ecc71; }
.bar-fill.yi { background: #9b59b6; }

.bar-count {
  width: 30px;
  text-align: right;
  font-size: 13px;
  color: #bbb;
}

/* 快速复习 */
.quick-review {
  background: #333;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.quick-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #ddd;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-review {
  flex: 1;
  min-width: 120px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #444;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-review:hover:not(:disabled) {
  background: #555;
  transform: translateY(-1px);
}

.btn-review:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-review.chem { background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.4); }
.btn-review.bio { background: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.4); }
.btn-review.yi { background: rgba(155, 89, 182, 0.2); border: 1px solid rgba(155, 89, 182, 0.4); }

/* 错题列表 */
.wrong-list {
  background: #333;
  border-radius: 12px;
  padding: 16px;
}

.list-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #ddd;
}

.empty-hint {
  text-align: center;
  padding: 30px 20px;
  color: #888;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-sub {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.wrong-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wrong-item {
  background: #3a3a3a;
  border-radius: 10px;
  padding: 12px;
  border-left: 3px solid #e74c3c;
  transition: all 0.2s;
}

.wrong-item.mastered {
  border-left-color: #2ecc71;
  opacity: 0.7;
}

.wrong-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
}

.badge.chem { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
.badge.bio { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
.badge.yi { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }
.badge.easy { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
.badge.medium { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
.badge.hard { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
.badge.wrong-count { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }

.wrong-count {
  font-size: 12px;
  color: #e74c3c;
  margin-left: auto;
}

.btn-master {
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  font-size: 11px;
  cursor: pointer;
}

.btn-remove {
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  font-size: 11px;
  cursor: pointer;
}

.wrong-question {
  font-size: 14px;
  color: #ddd;
  line-height: 1.5;
  margin-bottom: 6px;
}

.wrong-answer {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.correct-ans {
  color: #2ecc71;
}

.wrong-ans {
  color: #e74c3c;
}

/* 复习答题界面 */
.review-quiz {
  max-width: 600px;
  margin: 0 auto;
}

.review-progress {
  margin-bottom: 16px;
}

.review-progress span {
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

/* 复习结果页 */
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

.result-header h3 {
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

.result-subject.chem { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
.result-subject.bio { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
.result-subject.yi { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }

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
}/* 标签页切换 */
.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.tab-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  color: #999;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: rgba(212,168,83,0.12);
  border-color: rgba(212,168,83,0.4);
  color: #d4a853;
}

/* 收藏知识页 */
.knowledge-home {
  max-height: 65vh;
  overflow-y: auto;
}
.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.knowledge-card-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.knowledge-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  transition: all 0.2s;
}
.knowledge-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(212,168,83,0.2);
}
.knowledge-icon {
  font-size: 28px;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212,168,83,0.1);
  border-radius: 10px;
}
.knowledge-body {
  flex: 1;
  min-width: 0;
}
.knowledge-name {
  font-size: 14px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 4px;
}
.knowledge-desc {
  font-size: 12px;
  color: #bbb;
  line-height: 1.5;
  margin-bottom: 4px;
}
.knowledge-time {
  font-size: 11px;
  color: #666;
}

.knowledge-expand-icon {
  font-size: 11px;
  color: #888;
  flex-shrink: 0;
  align-self: center;
  padding: 4px;
}

.knowledge-points {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 14px 18px;
  margin-top: -6px;
  margin-bottom: 4px;
}
.points-title {
  font-size: 12px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 10px;
}
.point-item {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 13px;
  line-height: 1.5;
}
.point-item:last-child {
  border-bottom: none;
}
.point-num {
  flex-shrink: 0;
  color: #d4a853;
  font-weight: bold;
  width: 20px;
  text-align: right;
}
.point-text {
  color: #ccc;
  flex: 1;
}
.points-empty {
  text-align: center;
  padding: 16px;
  color: #666;
  font-size: 13px;
}

/* 研读知识点弹窗 */
.knowledge-box {
  background: rgba(212,168,83,0.08);
  border: 1px solid rgba(212,168,83,0.2);
  border-radius: 10px;
  padding: 14px;
  margin: 12px 0;
  text-align: left;
}
.knowledge-caption {
  font-size: 11px;
  color: #d4a853;
  font-weight: bold;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.knowledge-text {
  font-size: 13px;
  color: #ddd;
  line-height: 1.6;
}
</style>
