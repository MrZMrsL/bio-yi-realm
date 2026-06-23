<template>
  <div class="pvp-scoreboard">
    <div class="score-item player-score">
      <span class="score-label">你</span>
      <span class="score-value">{{ playerScore }}</span>
    </div>
    <div class="score-divider">:</div>
    <div class="score-item enemy-score">
      <span class="score-label">对手</span>
      <span class="score-value">{{ opponentScore }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  playerScore: { type: Number, default: 0 },
  opponentScore: { type: Number, default: 0 },
})
</script>

<style scoped>
.pvp-scoreboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 10px 16px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.score-label {
  font-size: 11px;
  color: #888;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
}

.player-score .score-value {
  color: #4ecdc4;
}

.enemy-score .score-value {
  color: #e74c3c;
}

.score-divider {
  font-size: 20px;
  color: #555;
  font-weight: bold;
}
</style>
