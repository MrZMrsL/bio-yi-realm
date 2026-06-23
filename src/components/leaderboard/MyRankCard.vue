<template>
  <div v-if="myRank > 0" class="my-rank-card">
    <div class="my-rank-badge">
      <span class="my-rank-label">我的排名</span>
      <span class="my-rank-number">#{{ myRank }}</span>
    </div>
    <div v-if="myName" class="my-rank-name">{{ myName }}</div>
    <div class="my-rank-stats">
      <span class="my-rank-stat">🏆 {{ myRecord.wins }}胜</span>
      <span class="my-rank-stat">💀 {{ myRecord.losses }}负</span>
      <span class="my-rank-stat">🔥 {{ myRecord.streak }}连胜</span>
    </div>
  </div>
  <div v-else class="my-rank-card no-rank">
    <div class="my-rank-badge">
      <span class="my-rank-label">我的排名</span>
      <span class="my-rank-number unranked">未上榜</span>
    </div>
    <p class="no-rank-hint">进行PVP对战来上榜吧！</p>
  </div>
</template>

<script setup>
defineProps({
  myRank: { type: Number, required: true },
  myName: { type: String, default: '' },
  myRecord: {
    type: Object,
    default: () => ({ wins: 0, losses: 0, streak: 0 }),
  },
})
</script>

<style scoped>
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
</style>