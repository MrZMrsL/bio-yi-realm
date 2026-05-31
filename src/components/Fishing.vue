<template>
  <div class="fishing-container">
    <div class="fishing-header">
      <div class="fishing-level">🎣 钓鱼等级 Lv.{{ store.fishingLevel }}</div>
      <div class="fishing-stats">已捕获 {{ store.recentCatches.length }} 条 | 图鉴 {{ fishCollectionPercent }}%</div>
    </div>

    <!-- 钓鱼区域 -->
    <div class="fishing-area">
      <div class="water-surface">
        <div class="ripple" v-if="fishingState === 'waiting'"></div>
        <div class="fish-icon" v-if="caughtFish">{{ caughtFish.icon }}</div>
        <div class="rod-icon" :class="{ casting: fishingState === 'casting', bite: fishingState === 'bite' }">🎣</div>
      </div>

      <div class="fishing-status">
        <span v-if="fishingState === 'idle'">水面平静，鱼儿在深处游动...</span>
        <span v-if="fishingState === 'casting'">鱼线已抛入水中，等待鱼儿上钩...</span>
        <span v-if="fishingState === 'bite'">🚨 有鱼咬钩！快收杆！</span>
        <span v-if="fishingState === 'caught' && caughtFish">
          钓到了 <span class="rarity-badge" :style="{ color: rarityConfig[caughtFish.rarity]?.color }">
            [{{ rarityConfig[caughtFish.rarity]?.label }}]
          </span>
          <strong>{{ caughtFish.name }}</strong>！
        </span>
      </div>

      <button
        class="fish-btn"
        :class="{ disabled: fishingState !== 'idle' && fishingState !== 'bite' }"
        @click="handleFishAction"
        :disabled="fishingState === 'casting' || fishingState === 'caught'"
      >
        <span v-if="fishingState === 'idle'">开始钓鱼</span>
        <span v-if="fishingState === 'casting'">等待中...</span>
        <span v-if="fishingState === 'bite'">🎣 收杆！</span>
        <span v-if="fishingState === 'caught'">已捕获</span>
      </button>
    </div>

    <!-- 捕获的鱼详情 -->
    <div class="caught-panel" v-if="fishingState === 'caught' && caughtFish">
      <div class="caught-card" :style="{ borderColor: rarityConfig[caughtFish.rarity]?.color }">
        <div class="caught-icon">{{ caughtFish.icon }}</div>
        <div class="caught-info">
          <div class="caught-name" :style="{ color: rarityConfig[caughtFish.rarity]?.color }">
            {{ caughtFish.name }}
          </div>
          <div class="caught-rarity">{{ rarityConfig[caughtFish.rarity]?.label }}</div>
          <div class="caught-knowledge">{{ caughtFish.knowledge }}</div>
          <div class="caught-heal">❤️ 恢复 {{ caughtFish.healHp }} 点生命</div>
        </div>
      </div>
      <div class="caught-actions">
        <button class="action-btn eat-btn" @click="eatFish">
          🍽️ 食用（恢复 {{ caughtFish.healHp }} HP）
        </button>
        <button class="action-btn release-btn" @click="releaseFish">
          🌊 放生
        </button>
      </div>
    </div>

    <!-- 最近捕获记录 -->
    <div class="recent-catches" v-if="store.recentCatches.length > 0">
      <div class="section-title">📋 最近捕获</div>
      <div class="catch-list">
        <div
          v-for="(f, i) in store.recentCatches.slice().reverse().slice(0, 8)"
          :key="i"
          class="catch-item"
        >
          <span class="catch-icon">{{ f.icon }}</span>
          <span class="catch-name">{{ f.name }}</span>
          <span class="catch-rarity" :style="{ color: rarityConfig[f.rarity]?.color }">
            {{ rarityConfig[f.rarity]?.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- 图鉴进度 -->
    <div class="collection-progress">
      <div class="section-title">📖 鱼类图鉴</div>
      <div class="rarity-bars">
        <div v-for="(config, rarity) in rarityConfig" :key="rarity" class="rarity-bar">
          <span class="bar-label">{{ config.label }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: collectionPercent(rarity) + '%', background: config.color }"
            ></div>
          </div>
          <span class="bar-count">{{ collectionCount(rarity) }} / {{ totalByRarity(rarity) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { RARITY_CONFIG, drawFish } from '../data/fishing.js'
import { sfxClick, sfxSplash, sfxItemGet } from '../utils/audio.js'

const store = useGameStore()
const fishingState = ref('idle') // idle, casting, bite, caught
const caughtFish = ref(null)
const rarityConfig = RARITY_CONFIG

// 钓鱼等级对应可钓稀有度
const fishCollectionPercent = computed(() => {
  const totalCaught = Object.values(store.fishCollection).reduce((a, b) => a + b, 0)
  return totalCaught
})

function collectionCount(rarity) {
  return store.fishCollection[rarity] || 0
}

function totalByRarity(rarity) {
  // 从 data/fishing.js 中读取（需要额外导入）
  // 这里用静态估算，实际应用时通过 props 或直接导入
  const counts = { common: 20, normal: 38, rare: 20, epic: 15, legendary: 6, mythic: 10, special: 40 }
  return counts[rarity] || 1
}

function collectionPercent(rarity) {
  const total = totalByRarity(rarity)
  const have = collectionCount(rarity)
  return Math.min(100, Math.floor((have / total) * 100))
}

function handleFishAction() {
  sfxClick()
  if (fishingState.value === 'idle') {
    startFishing()
  } else if (fishingState.value === 'bite') {
    reelIn()
  }
}

function startFishing() {
  fishingState.value = 'casting'
  caughtFish.value = null

  // 随机等待时间 1-3 秒
  const waitTime = 1000 + Math.random() * 2000

  setTimeout(() => {
    if (fishingState.value === 'casting') {
      fishingState.value = 'bite'

      // 咬钩后 2 秒内不收杆就会跑掉
      setTimeout(() => {
        if (fishingState.value === 'bite') {
          fishingState.value = 'idle'
          // 可以在这里提示鱼跑了
        }
      }, 2000)
    }
  }, waitTime)
}

function reelIn() {
  if (fishingState.value !== 'bite') return

  sfxSplash()
  // 抽鱼！
  const fish = drawFish(store.fishingLevel)
  caughtFish.value = fish
  fishingState.value = 'caught'

  // 记录捕获
  if (fish) {
    store.recordFishCatch(fish)
    sfxItemGet()
  }
}

function eatFish() {
  sfxClick()
  if (!caughtFish.value) return

  const heal = caughtFish.value.healHp
  store.hp = Math.min(store.maxHp, store.hp + heal)
  // 从记录中移除（因为吃掉了）
  store.removeFishFromRecent(caughtFish.value)

  caughtFish.value = null
  fishingState.value = 'idle'

  // 自动存档
  store.saveGame()
}

function releaseFish() {
  sfxClick()
  if (!caughtFish.value) return

  caughtFish.value = null
  fishingState.value = 'idle'

  // 自动存档
  store.saveGame()
}
</script>

<style scoped>
.fishing-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 4px;
}

.fishing-header {
  text-align: center;
  padding: 12px;
  background: rgba(15, 52, 96, 0.6);
  border-radius: 12px;
}

.fishing-level {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
}

.fishing-stats {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.fishing-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(15, 52, 96, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(212, 168, 83, 0.2);
}

.water-surface {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(180deg, #1a5f9e 0%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 3px solid rgba(212, 168, 83, 0.3);
  overflow: hidden;
}

.ripple {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: ripple 1.5s ease-out infinite;
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

.rod-icon {
  font-size: 40px;
  transition: transform 0.3s;
}

.rod-icon.casting {
  animation: cast 1s ease-in-out infinite;
}

.rod-icon.bite {
  animation: shake 0.2s ease-in-out infinite;
}

@keyframes cast {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0) rotate(-5deg); }
  25% { transform: translateX(-5px) rotate(5deg); }
  75% { transform: translateX(5px) rotate(-5deg); }
}

.fish-icon {
  font-size: 50px;
  animation: float 2s ease-in-out infinite;
  position: absolute;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.fishing-status {
  font-size: 14px;
  color: #a0a0a0;
  text-align: center;
  min-height: 20px;
}

.rarity-badge {
  font-weight: bold;
}

.fish-btn {
  padding: 12px 36px;
  font-size: 16px;
  font-weight: bold;
  color: #1a1a2e;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  border: none;
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(212, 168, 83, 0.4);
}

.fish-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 168, 83, 0.5);
}

.fish-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.caught-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.caught-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 52, 96, 0.6);
  border-radius: 12px;
  border: 2px solid;
}

.caught-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.caught-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.caught-name {
  font-size: 18px;
  font-weight: bold;
}

.caught-rarity {
  font-size: 12px;
  color: #888;
}

.caught-knowledge {
  font-size: 13px;
  color: #a0a0a0;
  line-height: 1.5;
}

.caught-heal {
  font-size: 13px;
  color: #2ecc71;
  font-weight: bold;
}

.caught-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.eat-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: #fff;
}

.release-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.recent-catches,
.collection-progress {
  padding: 12px;
  background: rgba(15, 52, 96, 0.4);
  border-radius: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 8px;
}

.catch-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.catch-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 12px;
}

.catch-icon {
  font-size: 14px;
}

.catch-name {
  color: #e0e0e0;
}

.catch-rarity {
  font-size: 10px;
}

.rarity-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rarity-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.bar-label {
  width: 40px;
  color: #a0a0a0;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-count {
  width: 50px;
  color: #888;
  text-align: right;
  font-size: 11px;
}
</style>
