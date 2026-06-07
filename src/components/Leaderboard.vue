<template>
  <div class="leaderboard-container">
    <!-- 头部 -->
    <div class="leaderboard-header">
      <div class="leaderboard-title-area">
        <span class="leaderboard-icon">🏆</span>
        <span class="leaderboard-title">PVP 排行榜</span>
      </div>
      <p class="leaderboard-desc">知识对决，谁主沉浮</p>
    </div>

    <!-- 我的排名 -->
    <div class="my-rank-card" v-if="myRank > 0">
      <div class="my-rank-badge">
        <span class="my-rank-label">我的排名</span>
        <span class="my-rank-number">#{{ myRank }}</span>
      </div>
      <div class="my-rank-name" v-if="myName">{{ myName }}</div>
      <div class="my-rank-stats">
        <span class="my-rank-stat">🏆 {{ myRecord.wins }}胜</span>
        <span class="my-rank-stat">💀 {{ myRecord.losses }}负</span>
        <span class="my-rank-stat">🔥 {{ myRecord.streak }}连胜</span>
      </div>
    </div>
    <div class="my-rank-card no-rank" v-else>
      <div class="my-rank-badge">
        <span class="my-rank-label">我的排名</span>
        <span class="my-rank-number unranked">未上榜</span>
      </div>
      <p class="no-rank-hint">进行PVP对战来上榜吧！</p>
    </div>

    <!-- 排行榜列表 -->
    <div class="leaderboard-list-section">
      <div class="list-header">
        <span class="list-title">📋 排行榜 TOP {{ topN }}</span>
        <span class="list-total" v-if="totalBattles > 0">共 {{ totalBattles }} 场对决</span>
      </div>

      <!-- 空状态 -->
      <div v-if="leaderboard.length === 0" class="leaderboard-empty">
        <span class="empty-icon">📭</span>
        <p class="empty-text">暂无排名数据</p>
        <p class="empty-hint">快去PVP对战，成为第一个上榜的勇士！</p>
      </div>

      <!-- 排行列表 -->
      <div v-else class="leaderboard-list">
        <!-- 表头 -->
        <div class="leaderboard-thead">
          <span class="col-rank">排名</span>
          <span class="col-name">玩家</span>
          <span class="col-title">称号</span>
          <span class="col-level">等级</span>
          <span class="col-record">战绩</span>
          <span class="col-rate">胜率</span>
        </div>

        <!-- 行 -->
        <template v-for="(entry, idx) in leaderboard" :key="idx">
          <div
            class="leaderboard-row"
            :class="{
              'top-1': idx === 0,
              'top-2': idx === 1,
              'top-3': idx === 2,
              'is-me': entry.name === myName,
              'expanded': expandedRow === idx
            }"
            @click="toggleExpand(idx)"
          >
            <!-- 排名 -->
            <span class="col-rank">
              <span v-if="idx === 0" class="rank-medal">🥇</span>
              <span v-else-if="idx === 1" class="rank-medal">🥈</span>
              <span v-else-if="idx === 2" class="rank-medal">🥉</span>
              <span v-else class="rank-number">#{{ idx + 1 }}</span>
            </span>

            <!-- 玩家名 -->
            <span class="col-name">
              <span class="entry-name">{{ entry.name }}</span>
              <span v-if="entry.name === myName" class="me-tag">我</span>
            </span>

            <!-- 称号 -->
            <span class="col-title">
              <span class="entry-title-name">{{ entry.title }}</span>
            </span>

            <!-- 等级 -->
            <span class="col-level">Lv.{{ entry.level }}</span>

            <!-- 战绩 -->
            <span class="col-record">
              <span class="record-win">🏆{{ entry.wins }}</span>
              <span class="record-divider">/</span>
              <span class="record-total">{{ entry.wins + entry.losses }}</span>
              <span v-if="entry.streak >= 3" class="streak-badge">🔥×{{ entry.streak }}</span>
            </span>

            <!-- 胜率 -->
            <span class="col-rate" :class="getRateClass(entry)">
              {{ getWinRate(entry) }}%
            </span>
          </div>

          <!-- 展开详情行 -->
          <div v-if="expandedRow === idx" class="leaderboard-detail">
            <div class="detail-row">
              <span class="detail-label">🏰 最高楼层</span>
              <span class="detail-value">第 {{ entry.floor || 1 }} 层</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🎖️ 当前称号</span>
              <span class="detail-value">{{ entry.title }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📚 专精</span>
              <span class="detail-value">{{ specLabel(entry.specialization) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📊 等级</span>
              <span class="detail-value">Lv.{{ entry.level }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 最近对战</span>
              <span class="detail-value">{{ formatTime(entry.lastPlayed) }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game.js'
import { getLeaderboard, getMyRank, getTotalBattles, getTopN } from '../composables/useLeaderboard.js'

const store = useGameStore()

const props = defineProps({
  topN: { type: Number, default: 20 }
})

const leaderboard = ref([])
const myRank = ref(-1)
const myRecord = ref({ wins: 0, losses: 0, streak: 0 })
const totalBattles = ref(0)
const expandedRow = ref(-1)

const myName = computed(() => store.playerName || '')
const myLevel = computed(() => store.level)

const SPEC_LABELS = {
  chem: '🧪 化学大师',
  bio: '🧬 生物大师',
  yi: '☯️ 易学大师',
  biochem: '🔬 生化全才',
  all: '🌟 全能学者'
}

function specLabel(spec) {
  return SPEC_LABELS[spec] || '未选择'
}

function loadLeaderboard() {
  leaderboard.value = getTopN(props.topN)
  myRank.value = myName.value ? getMyRank(myName.value) : -1
  totalBattles.value = getTotalBattles()

  // 找自己的记录
  if (myName.value) {
    const all = getLeaderboard()
    const me = all.find(r => r.name === myName.value)
    if (me) {
      myRecord.value = { wins: me.wins, losses: me.losses, streak: me.streak }
    } else {
      myRecord.value = { wins: 0, losses: 0, streak: 0 }
    }
  }
}

function toggleExpand(idx) {
  expandedRow.value = expandedRow.value === idx ? -1 : idx
}

function getWinRate(entry) {
  const total = entry.wins + entry.losses
  if (total === 0) return 0
  return Math.round((entry.wins / total) * 100)
}

function getRateClass(entry) {
  const rate = getWinRate(entry)
  if (rate >= 70) return 'rate-high'
  if (rate >= 40) return 'rate-mid'
  return 'rate-low'
}

function formatTime(ts) {
  if (!ts) return '未知'
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  loadLeaderboard()
})
</script>

<style scoped>
.leaderboard-container {
  padding: 16px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.leaderboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.leaderboard-title-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.leaderboard-icon {
  font-size: 32px;
}

.leaderboard-title {
  font-size: 22px;
  font-weight: bold;
  color: #d4a853;
}

.leaderboard-desc {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}

/* 我的排名卡片 */
.my-rank-card {
  background: linear-gradient(135deg, rgba(212, 168, 83, 0.12), rgba(212, 168, 83, 0.04));
  border: 1px solid rgba(212, 168, 83, 0.25);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}

.my-rank-card.no-rank {
  opacity: 0.7;
}

.my-rank-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.my-rank-label {
  font-size: 13px;
  color: #888;
}

.my-rank-number {
  font-size: 24px;
  font-weight: bold;
  color: #d4a853;
}

.my-rank-number.unranked {
  font-size: 16px;
  color: #666;
}

.my-rank-name {
  font-size: 14px;
  color: #e0e0e0;
  font-weight: bold;
  margin-bottom: 8px;
}

.my-rank-stats {
  display: flex;
  gap: 16px;
}

.my-rank-stat {
  font-size: 13px;
  color: #c0c0c0;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 8px;
}

.no-rank-hint {
  font-size: 13px;
  color: #666;
  text-align: center;
  margin: 0;
}

/* 列表 */
.leaderboard-list-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.list-title {
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
}

.list-total {
  font-size: 11px;
  color: #888;
}

/* 空状态 */
.leaderboard-empty {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #888;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* 表头 */
.leaderboard-thead {
  display: grid;
  grid-template-columns: 44px 1fr 1fr 44px 85px 48px;
  gap: 4px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
  color: #888;
  font-weight: bold;
}

/* 行 */
.leaderboard-row {
  display: grid;
  grid-template-columns: 44px 1fr 1fr 44px 85px 48px;
  gap: 4px;
  padding: 10px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  align-items: center;
  font-size: 13px;
  color: #c0c0c0;
  transition: background 0.2s;
  cursor: pointer;
}

.leaderboard-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.leaderboard-row.is-me {
  background: rgba(212, 168, 83, 0.08);
}

.leaderboard-row.expanded {
  background: rgba(255, 255, 255, 0.06);
  border-bottom: none;
}

/* 前三名高亮 */
.leaderboard-row.top-1 {
  background: linear-gradient(90deg, rgba(241, 196, 15, 0.12), transparent);
}

.leaderboard-row.top-2 {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), transparent);
}

.leaderboard-row.top-3 {
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), transparent);
}

.col-rank {
  text-align: center;
}

.rank-medal {
  font-size: 18px;
}

.rank-number {
  font-size: 11px;
  color: #888;
}

.col-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.entry-name {
  color: #e0e0e0;
  font-weight: bold;
}

.me-tag {
  font-size: 10px;
  color: #d4a853;
  background: rgba(212, 168, 83, 0.15);
  padding: 1px 5px;
  border-radius: 4px;
}

.col-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.entry-title-name {
  color: #888;
}

.col-level {
  text-align: center;
  font-size: 12px;
  color: #a0a0a0;
}

.col-record {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  flex-wrap: wrap;
}

.record-win {
  color: #2ecc71;
}

.record-divider {
  color: #555;
}

.record-total {
  color: #888;
}

.streak-badge {
  font-size: 11px;
  color: #f39c12;
  background: rgba(243, 156, 18, 0.15);
  padding: 1px 6px;
  border-radius: 6px;
  margin-left: 4px;
}

.col-rate {
  text-align: center;
  font-size: 12px;
  font-weight: bold;
}

.rate-high {
  color: #2ecc71;
}

.rate-mid {
  color: #f39c12;
}

.rate-low {
  color: #e74c3c;
}

/* 展开详情 */
.leaderboard-detail {
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 10px 14px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: detail-expand 0.25s ease;
}

@keyframes detail-expand {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 200px; }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 12px;
  color: #888;
}

.detail-value {
  font-size: 13px;
  color: #e0e0e0;
  font-weight: bold;
}
</style>
