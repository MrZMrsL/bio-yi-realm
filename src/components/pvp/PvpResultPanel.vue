<template>
  <div class="pvp-result" :class="resultClass">
    <div class="pvp-result-icon">{{ resultIcon }}</div>
    <div class="pvp-result-title">{{ resultTitle }}</div>
    <div class="pvp-result-scores">
      <div class="result-score-row">
        <span>你的得分</span>
        <span class="result-score-val">{{ playerScore }}</span>
      </div>
      <div class="result-score-row">
        <span>对手得分</span>
        <span class="result-score-val">{{ opponentScore }}</span>
      </div>
    </div>
    <div v-if="showReward" class="pvp-result-reward">
      <span>🎁 {{ rewardExp }} 经验</span>
      <span>💰 {{ rewardGold }} 金币</span>
    </div>
    <div class="pvp-result-actions">
      <button type="button" class="pvp-btn-rematch" @click="$emit('rematch')">🔄 再来一局</button>
      <button type="button" class="pvp-btn-exit" @click="$emit('exit')">🚪 返回</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  playerScore: { type: Number, default: 0 },
  opponentScore: { type: Number, default: 0 },
  won: { type: Boolean, default: false },
  isDraw: { type: Boolean, default: false },
  rewardExp: { type: Number, default: 0 },
  rewardGold: { type: Number, default: 0 },
})

defineEmits(['rematch', 'exit'])

const resultClass = computed(() => {
  if (props.isDraw) return 'pvp-draw'
  return props.won ? 'pvp-won' : 'pvp-lost'
})

const resultIcon = computed(() => {
  if (props.isDraw) return '🤝'
  return props.won ? '🎉' : '😢'
})

const resultTitle = computed(() => {
  if (props.isDraw) return '平局！'
  if (props.won) return 'PVP 胜利！'
  return 'PVP 败北'
})

const showReward = computed(() => props.won || props.isDraw)
</script>

<style scoped>
.pvp-result {
  text-align: center;
  padding: 24px 16px;
  border-radius: 14px;
}

.pvp-result.pvp-won {
  background: rgba(46, 204, 113, 0.12);
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.pvp-result.pvp-lost {
  background: rgba(231, 76, 60, 0.12);
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.pvp-result.pvp-draw {
  background: rgba(241, 196, 15, 0.1);
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.pvp-result-icon {
  font-size: 3em;
  margin-bottom: 8px;
}

.pvp-result-title {
  font-size: 20px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 16px;
}

.pvp-result-scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px 24px;
  margin-bottom: 16px;
}

.result-score-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #c0c0c0;
}

.result-score-val {
  font-weight: bold;
  color: #e0e0e0;
}

.pvp-result-reward {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 12px;
  background: rgba(212, 168, 83, 0.08);
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #f4d03f;
}

.pvp-result-actions {
  display: flex;
  gap: 10px;
}

.pvp-btn-rematch {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.pvp-btn-rematch:hover {
  transform: translateY(-2px);
}

.pvp-btn-exit {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #888;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.pvp-btn-exit:hover {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}
</style>
