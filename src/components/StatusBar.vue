<template>
  <div id="status-bar">
    <div class="stat-box">
      <div class="stat-title" title="点击查看人物简史">{{ store.title }}</div>
      <div class="stat-value">Lv.{{ store.level }}</div>
      <div class="stat-bar">
        <div class="stat-bar-fill" :style="{ width: store.expPercent + '%' }"></div>
        <span class="stat-bar-text">{{ store.exp }}/{{ store.maxExp }}</span>
      </div>
    </div>
    <div class="stat-box">
      <div class="stat-title">❤️ 生命</div>
      <div class="stat-value">{{ store.hp }}/{{ store.maxHp }}</div>
      <div class="stat-bar">
        <div class="stat-bar-fill hp" :style="{ width: store.hpPercent + '%' }"></div>
        <span class="stat-bar-text">{{ store.hpPercent.toFixed(0) }}%</span>
      </div>
    </div>
    <div class="stat-box">
      <div class="stat-title">💰 金币</div>
      <div class="stat-value">{{ store.gold }}</div>
      <div class="stat-label">🏠 第{{ store.floor }}层</div>
    </div>
    <div class="stat-box">
      <div class="stat-title">🔮 灵气</div>
      <div class="stat-value">{{ store.spirit }}</div>
      <div class="stat-label">天地精华</div>
    </div>
    <div v-if="store.statPoints > 0" class="stat-box">
      <div class="stat-title">✨ 属性点</div>
      <div class="stat-value stat-points">{{ store.statPoints }}</div>
      <div class="stat-label">可分配</div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/game.ts'

const store = useGameStore()
</script>

<style scoped>
#status-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  padding: 8px 10px;
  padding-top: calc(8px + env(safe-area-inset-top, 0px));
  background: #0f3460;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.stat-box {
  min-width: 0;
  text-align: center;
}

.stat-title {
  font-size: 10px;
  color: #a0a0a0;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 13px;
  font-weight: bold;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-bar {
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 3px;
  position: relative;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4a853, #f4d03f);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stat-bar-fill.hp {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
}

.stat-bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.stat-label {
  margin-top: 3px;
  color: #a0a0a0;
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-points {
  color: #d4a853;
  font-weight: bold;
}

@media (max-width: 400px) {
  #status-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 6px;
    padding: 8px;
    padding-top: calc(8px + env(safe-area-inset-top, 0px));
  }

  .stat-box {
    flex: 0 0 30%;
    min-width: 0;
  }
}
</style>
