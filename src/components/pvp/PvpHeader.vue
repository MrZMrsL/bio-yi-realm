<template>
  <div class="pvp-header">
    <span class="pvp-badge">⚔️ PVP对战</span>
    <div v-if="showRoundInfo" class="pvp-round-info">
      <span>回合 {{ currentRound }} / {{ maxRounds }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showRoundInfo: { type: Boolean, default: false },
  currentRound: { type: Number, default: 0 },
  maxRounds: { type: Number, default: 5 },
})
</script>

<style scoped>
.pvp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pvp-badge {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  padding: 4px 14px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
}

.pvp-round-info {
  font-size: 13px;
  color: #d4a853;
  background: rgba(212, 168, 83, 0.1);
  padding: 4px 12px;
  border-radius: 6px;
}
</style>
