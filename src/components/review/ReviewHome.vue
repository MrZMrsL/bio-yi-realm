<template>
  <div class="review-home">
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
        <button type="button" class="btn-review" :disabled="store.wrongStats.pending === 0" @click="startReview()">
          📚 全部错题 ({{ store.wrongStats.pending }})
        </button>
        <button
          type="button"
          class="btn-review chem"
          :disabled="store.wrongStats.bySubject.chem === 0"
          @click="startReview('chem')"
        >
          🧪 化学 ({{ store.wrongStats.bySubject.chem }})
        </button>
        <button type="button" class="btn-review bio" :disabled="store.wrongStats.bySubject.bio === 0" @click="startReview('bio')">
          🧬 生物 ({{ store.wrongStats.bySubject.bio }})
        </button>
        <button type="button" class="btn-review yi" :disabled="store.wrongStats.bySubject.yi === 0" @click="startReview('yi')">
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
        <div v-for="wq in sortedWrongQuestions" :key="wq.id" class="wrong-item" :class="{ mastered: wq.mastered }">
          <div class="wrong-header">
            <span class="badge" :class="wq.subject">{{ subjectName(wq.subject) }}</span>
            <span class="badge" :class="wq.diff">{{ diffName(wq.diff) }}</span>
            <span class="wrong-count">做错 {{ wq.wrongCount }} 次</span>
            <button v-if="!wq.mastered" type="button" class="btn-master" @click="store.masterQuestion(wq.id)">✓ 标记掌握</button>
            <button type="button" class="btn-remove" @click="store.removeWrongQuestion(wq.id)">✕</button>
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
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../../stores/game.ts'

const store = useGameStore()
const emit = defineEmits(['start-review'])

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
  emit('start-review', subjectFilter)
}
</script>

<style scoped>
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

.bar-fill.chem {
  background: #e74c3c;
}

.bar-fill.bio {
  background: #2ecc71;
}

.bar-fill.yi {
  background: #9b59b6;
}

.bar-count {
  width: 30px;
  text-align: right;
  font-size: 13px;
  color: #bbb;
}

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

.btn-review.chem {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.4);
}

.btn-review.bio {
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid rgba(46, 204, 113, 0.4);
}

.btn-review.yi {
  background: rgba(155, 89, 182, 0.2);
  border: 1px solid rgba(155, 89, 182, 0.4);
}

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
</style>
