<template>
  <div class="empty-state">
    <div class="empty-state-icon">🏚️</div>
    <div class="empty-state-text">空空如也</div>
    <div class="empty-state-hint">在战斗中击败怪物后，答对题目即可收养它们</div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state-icon {
  font-size: 3em;
  margin-bottom: 8px;
}

.empty-state-text {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 8px;
}

.empty-state-hint {
  font-size: 0.85em;
  color: #555;
}
</style>
