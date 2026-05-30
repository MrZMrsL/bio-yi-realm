<template>
  <div class="farm-container">
    <div class="farm-header">
      <h2>🐾 怪物农场</h2>
      <div class="farm-active-box">
        <template v-if="store.activeMonster">
          <span class="farm-active-label">当前跟随：</span>
          <span class="farm-active-monster">{{ store.activeMonster.icon }}</span>
          <div class="farm-active-info">
            <div class="farm-active-name">
              {{ store.activeMonster.name }} Lv.{{ store.activeMonster.level }}
            </div>
            <div class="element-badge" :style="{ background: elementColor }">
              {{ elementInfo?.icon }} {{ elementInfo?.name }}
            </div>
            <div class="ability-desc">{{ store.activeMonster.ability?.desc }}</div>
          </div>
        </template>
        <span v-else class="farm-active-label">当前没有跟随的怪物</span>
      </div>
    </div>

    <!-- 材料库存 -->
    <div class="material-panel">
      <div class="material-title">💎 材料库存</div>
      <div class="material-list">
        <div v-for="mat in materialList" :key="mat.name" class="material-item">
          <span class="material-icon">{{ mat.icon }}</span>
          <span class="material-name">{{ mat.name }}</span>
          <span class="material-count">×{{ mat.count }}</span>
        </div>
        <div v-if="materialList.length === 0" class="material-empty">
          暂无材料，击败怪物掉落
        </div>
      </div>
    </div>

    <div v-if="store.farm.length === 0" class="empty-state">
      <div class="empty-state-icon">🏚️</div>
      <div class="empty-state-text">空空如也</div>
      <div class="empty-state-hint">在战斗中击败怪物后，答对题目即可收养它们</div>
    </div>

    <div v-else class="farm-grid">
      <div 
        v-for="(m, i) in store.farm" 
        :key="m.name + m.capturedAt"
        class="farm-card"
        :class="{ following: isFollowing(m) }"
      >
        <span class="farm-monster-icon">{{ m.icon }}</span>
        <div class="farm-monster-name">{{ m.name }}</div>
        <div class="farm-monster-lv">Lv.{{ m.level }}</div>
        <div class="element-badge" :style="{ background: getElementColor(m.element) }">
          {{ getElementInfo(m.element)?.icon }} {{ getElementInfo(m.element)?.name }}
        </div>
        <div class="exp-bar">
          <div class="exp-text">EXP {{ m.exp }}/{{ m.maxExp }}</div>
          <div class="exp-track">
            <div class="exp-fill" :style="{ width: (m.exp / m.maxExp * 100) + '%' }"></div>
          </div>
        </div>
        <div class="farm-ability-box">
          <div class="farm-ability-title">能力加成</div>
          <div class="farm-ability-item">{{ m.ability?.desc }}</div>
        </div>
        <div class="farm-btn-group">
          <button 
            class="farm-btn farm-btn-follow"
            :class="{ active: isFollowing(m) }"
            @click="toggleFollow(i)"
          >
            {{ isFollowing(m) ? '取消跟随' : '设为跟随' }}
          </button>
          <button class="farm-btn farm-btn-upgrade" @click="handleUpgrade(i)">升级</button>
          <button class="farm-btn farm-btn-release" @click="handleRelease(i)">放生</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { DUNGEON_ELEMENTS, getUpgradeMaterialName } from '../data/farm.js'

const store = useGameStore()

const elementInfo = computed(() => {
  if (!store.activeMonster) return null
  return DUNGEON_ELEMENTS[store.activeMonster.element]
})

const elementColor = computed(() => {
  return elementInfo.value?.color || '#3498db'
})

const materialList = computed(() => {
  const icons = { '水之精华': '💧', '火焰核心': '🔥', '酸液结晶': '🧪', '雷电石': '⚡', '冰霜碎片': '❄️', '风之羽毛': '🌪️' }
  return Object.entries(store.inventory || {})
    .filter(([name, count]) => count > 0)
    .map(([name, count]) => ({
      name,
      count,
      icon: icons[name] || '💎'
    }))
})

function getElementInfo(element) {
  return DUNGEON_ELEMENTS[element]
}

function getElementColor(element) {
  return DUNGEON_ELEMENTS[element]?.color || '#3498db'
}

function isFollowing(m) {
  return store.activeMonster?.name === m.name
}

function toggleFollow(idx) {
  if (isFollowing(store.farm[idx])) {
    store.unfollowMonster()
  } else {
    store.setFollowMonster(idx)
  }
}

function handleUpgrade(idx) {
  const m = store.farm[idx]
  const matName = getUpgradeMaterialName(m.element)
  const matCost = Math.floor(m.level * 2)
  const matCount = store.inventory[matName] || 0
  
  if (m.exp < m.maxExp && matCount < matCost) {
    alert(`${matName} 不足 (${matCount}/${matCost})，击败对应元素怪物可获得`)
    return
  }
  
  const success = store.upgradeMonster(idx)
  if (success) {
    alert(`${m.name} 升级到 Lv.${m.level}！`)
  }
}

function handleRelease(idx) {
  const m = store.farm[idx]
  if (confirm(`确定要放生 ${m.name} 吗？放生后无法找回。`)) {
    store.releaseMonster(idx)
  }
}
</script>

<style scoped>
.farm-container {
  padding: 16px;
  color: #e0e0e0;
}

.farm-header {
  margin-bottom: 20px;
}

.farm-header h2 {
  margin: 0 0 12px 0;
  font-size: 1.3em;
  color: #d4a853;
}

.farm-active-box {
  background: rgba(15, 52, 96, 0.5);
  border: 1px solid rgba(52, 152, 219, 0.2);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.farm-active-label {
  color: #888;
  font-size: 0.9em;
}

.farm-active-monster {
  font-size: 2em;
}

.farm-active-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.farm-active-name {
  font-size: 14px;
  font-weight: bold;
  color: #f1c40f;
}

.element-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #fff;
  width: fit-content;
}

.ability-desc {
  font-size: 12px;
  color: #888;
}

/* 材料面板 */
.material-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.material-title {
  font-size: 13px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 8px;
}

.material-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 11px;
}

.material-icon {
  font-size: 1.2em;
}

.material-name {
  color: #aaa;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-count {
  color: #d4a853;
  font-weight: bold;
}

.material-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #666;
  font-size: 12px;
  padding: 8px 0;
}

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

.farm-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.farm-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.farm-card.following {
  border-color: #d4a853;
  box-shadow: 0 0 12px rgba(212, 168, 83, 0.2);
}

.farm-monster-icon {
  font-size: 2.5em;
}

.farm-monster-name {
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
}

.farm-monster-lv {
  font-size: 12px;
  color: #d4a853;
}

.exp-bar {
  width: 100%;
}

.exp-text {
  font-size: 10px;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2px;
}

.exp-track {
  width: 100%;
  height: 3px;
  background: #1a1a2e;
  border-radius: 2px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: #3498db;
  border-radius: 2px;
  transition: width 0.3s;
}

.farm-ability-box {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 8px;
  width: 100%;
  text-align: center;
}

.farm-ability-title {
  font-size: 10px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.farm-ability-item {
  font-size: 11px;
  color: #d4a853;
}

.farm-btn-group {
  display: flex;
  gap: 4px;
  width: 100%;
}

.farm-btn {
  flex: 1;
  padding: 6px 4px;
  font-size: 11px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.farm-btn-follow {
  background: rgba(212, 168, 83, 0.2);
  color: #d4a853;
}

.farm-btn-follow.active {
  background: #d4a853;
  color: #1a1a2e;
}

.farm-btn-upgrade {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.farm-btn-release {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.farm-btn:hover {
  filter: brightness(1.3);
}

@media (max-width: 360px) {
  .farm-grid {
    grid-template-columns: 1fr;
  }
  .material-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
