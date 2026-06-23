<template>
  <div class="achievements-header">
    <div class="achievements-title">
      <span class="title-icon">🏆</span>
      <span>成就殿堂</span>
    </div>
    <div class="achievements-summary">
      <div class="summary-item">
        <div class="summary-num">{{ unlockedCount }}</div>
        <div class="summary-label">已解锁</div>
      </div>
      <div class="summary-divider">/</div>
      <div class="summary-item">
        <div class="summary-num">{{ totalCount }}</div>
        <div class="summary-label">总数</div>
      </div>
      <div class="summary-progress">
        <div class="progress-ring" :style="{ '--pct': progressPct }">
          <svg viewBox="0 0 36 36" class="progress-ring-svg">
            <path
              class="progress-ring-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="progress-ring-fill"
              :stroke-dasharray="`${progressPct}, 100`"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div class="progress-ring-text">{{ progressPct }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  unlockedCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  progressPct: { type: Number, required: true },
})
</script>

<style scoped>
.achievements-header {
  background: rgba(15, 52, 96, 0.6);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(212, 168, 83, 0.2);
  position: relative;
  overflow: hidden;
}

.achievements-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(212, 168, 83, 0.05) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.achievements-title {
  font-size: 22px;
  font-weight: bold;
  color: #d4a853;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.title-icon {
  font-size: 28px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.achievements-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.summary-item {
  text-align: center;
}

.summary-num {
  font-size: 28px;
  font-weight: bold;
  color: #d4a853;
  line-height: 1;
}

.summary-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.summary-divider {
  font-size: 20px;
  color: #666;
}

.progress-ring {
  width: 60px;
  height: 60px;
  position: relative;
}

.progress-ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 2;
}

.progress-ring-fill {
  fill: none;
  stroke: #d4a853;
  stroke-width: 2;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #d4a853;
}
</style>