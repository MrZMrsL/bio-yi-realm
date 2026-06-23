<template>
  <!-- 传说鱼答题失败 -->
  <div v-if="showFishFail" class="quiz-result fail">
    <div class="quiz-fail-title">😢 鱼跑了！</div>
    <div class="quiz-fail-text">答题失败，{{ caughtFish?.name || '传说鱼' }} 挣脱了鱼线...</div>
    <button type="button" class="btn-next" @click="emit('continue')">继续钓鱼</button>
  </div>

  <!-- 钓鱼次数锁定 -->
  <div v-if="fishingState === 'limitLocked'" class="quiz-result fail">
    <div class="result-icon">🔒</div>
    <div class="result-title">答题失败</div>
    <div class="result-text">今日钓鱼次数已用完，请明日再来</div>
    <button type="button" class="btn-next" @click="emit('continue')">返回</button>
  </div>
</template>

<script setup>
defineProps({
  showFishFail: { type: Boolean, default: false },
  fishingState: { type: String, default: 'idle' },
  caughtFish: { type: Object, default: null },
})

const emit = defineEmits(['continue'])
</script>

<style scoped>
.quiz-result {
  background: rgba(15, 52, 96, 0.6);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 12px;
}

.quiz-result.fail {
  border-color: rgba(231, 76, 60, 0.3);
}

.quiz-fail-title {
  font-size: 18px;
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 8px;
}

.quiz-fail-text {
  font-size: 14px;
  color: #a0a0a0;
  margin-bottom: 16px;
}

.result-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 8px;
}

.result-text {
  font-size: 14px;
  color: #a0a0a0;
  margin-bottom: 16px;
}

.btn-next {
  padding: 10px 24px;
  background: rgba(212, 168, 83, 0.2);
  border: 1px solid rgba(212, 168, 83, 0.4);
  border-radius: 8px;
  color: #d4a853;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-next:hover {
  background: rgba(212, 168, 83, 0.3);
}
</style>
