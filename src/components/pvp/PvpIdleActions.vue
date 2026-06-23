<template>
  <div class="pvp-actions">
    <p class="pvp-rules-hint">
      💡 PVP规则：与镜像玩家进行答题对战。每答对一题对你的回合得分+1，对手随机答题可能得分。{{ maxRounds }}
      回合后得分高者获胜！
    </p>
    <button type="button" class="pvp-btn-answer" @click="$emit('start')">📚 开始答题</button>
    <button type="button" class="pvp-btn-exit" @click="$emit('exit')">🚪 退出对战</button>
  </div>
</template>

<script setup>
defineProps({
  maxRounds: { type: Number, default: 5 },
})

defineEmits(['start', 'exit'])
</script>

<style scoped>
.pvp-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pvp-rules-hint {
  font-size: 12px;
  color: #888;
  line-height: 1.6;
  background: rgba(212, 168, 83, 0.08);
  border: 1px solid rgba(212, 168, 83, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
}

.pvp-btn-answer {
  padding: 14px 20px;
  background: linear-gradient(135deg, #4ecdc4, #2ecc71);
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.pvp-btn-answer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
}

.pvp-btn-exit {
  padding: 10px 20px;
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
