<template>
  <div class="leaderboard-header">
    <div class="leaderboard-title-area">
      <span class="leaderboard-icon">🏆</span>
      <span class="leaderboard-title">PVP 排行榜</span>
    </div>
    <p class="leaderboard-desc">知识对决，谁主沉浮</p>
  </div>
</template>

<style scoped>
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
</style>