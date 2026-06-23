<template>
  <div class="knowledge-home">
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
          <div v-if="getPoints(k.name).length === 0" class="points-empty">暂无详细知识点内容</div>
          <!-- 古籍测验按钮 -->
          <div v-if="!store.bookQuizActive && !store.bookQuizDone" style="margin-top: 12px; text-align: center">
            <button type="button" class="quiz-start-btn" @click="startBookQuiz(k.name)">📝 古籍测验</button>
            <div style="font-size: 11px; color: #666; margin-top: 6px">从该古籍学科题库中抽取3道题，答对获得经验奖励</div>
          </div>

          <!-- 古籍测验进行中 -->
          <BookQuiz v-if="store.bookQuizActive" />

          <!-- 古籍测验结果 -->
          <div v-if="store.bookQuizDone" class="book-quiz-result">
            <div style="font-size: 24px; margin-bottom: 8px">
              {{ store.bookQuizCorrectCount >= 2 ? '🎉' : store.bookQuizCorrectCount >= 1 ? '👍' : '💪' }}
            </div>
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px">测验完成！</div>
            <div style="color: #ddd; margin-bottom: 6px">答对 {{ store.bookQuizCorrectCount }}/{{ store.bookQuizTotalCount }} 题</div>
            <div v-if="store.bookQuizRewardExp > 0" style="color: #f1c40f; margin-bottom: 12px">✨ 获得 {{ store.bookQuizRewardExp }} 经验！</div>
            <div v-else style="color: #888; margin-bottom: 12px; font-size: 12px">下次加油！</div>
            <button type="button" class="quiz-start-btn" @click="exitBookQuiz">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../../stores/game.ts'
import BookQuiz from './BookQuiz.vue'

const store = useGameStore()
const expandedIndex = ref(-1)
const knowledgePoints = ref({})

const sortedKnowledge = computed(() => {
  return [...store.collectedKnowledge].sort((a, b) => (b.learnedAt || 0) - (a.learnedAt || 0))
})

async function loadKnowledgePoints() {
  const { getBookKnowledgePoints } = await import('../../data/fishing.ts')
  const points = {}
  for (const book of sortedKnowledge.value) {
    points[book.name] = await getBookKnowledgePoints(book.name)
  }
  knowledgePoints.value = points
}

watch(sortedKnowledge, loadKnowledgePoints, { immediate: true })

function getPoints(bookName) {
  return knowledgePoints.value[bookName] || []
}

function toggleExpand(i) {
  expandedIndex.value = expandedIndex.value === i ? -1 : i
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

async function startBookQuiz(bookName) {
  await store.startBookQuiz(bookName, 3)
}

function exitBookQuiz() {
  store.exitBookQuiz()
}
</script>

<style scoped>
.knowledge-home {
  max-height: 65vh;
  overflow-y: auto;
}

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
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.2s;
}

.knowledge-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(212, 168, 83, 0.2);
}

.knowledge-icon {
  font-size: 28px;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 168, 83, 0.1);
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
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

.quiz-start-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quiz-start-btn:hover {
  background: rgba(52, 152, 219, 0.3);
}

.book-quiz-result {
  background: rgba(46, 204, 113, 0.08);
  border: 1px solid rgba(46, 204, 113, 0.2);
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  margin: 8px 0;
}
</style>
