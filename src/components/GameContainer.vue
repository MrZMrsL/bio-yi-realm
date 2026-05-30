<template>
  <div id="game-container">
    <!-- 状态栏 -->
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
        <div class="stat-title">❤️ 生命值</div>
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
    </div>

    <!-- 主内容 -->
    <div id="main-content">
      <!-- 地牢标签 -->
      <div v-if="store.activeTab === 'dungeon'">
        <div v-if="!store.inBattle" class="dungeon-intro">
          <div class="dungeon-title">🏰 第 {{ store.floor }} 层地牢</div>
          <p class="dungeon-desc">黑暗中的密室散发着危险的气息...</p>
          <button class="explore-btn" @click="store.initBattle">探索密室</button>
        </div>
        <Battle v-else />
      </div>

      <!-- 其他标签占位 -->
      <div v-if="store.activeTab === 'fishing'" class="placeholder">
        🎣 钓鱼系统待接入...
      </div>
      <div v-if="store.activeTab === 'inventory'">
        <Inventory />
      </div>
      <div v-if="store.activeTab === 'achievements'" class="placeholder">
        🏆 成就系统待接入...
      </div>
      <div v-if="store.activeTab === 'encyclopedia'" class="placeholder">
        📖 图鉴系统待接入...
      </div>
      <div v-if="store.activeTab === 'farm'">
        <Farm />
      </div>
      <div v-if="store.activeTab === 'review'" class="placeholder">
        📚 复习系统待接入...
      </div>
    </div>

    <!-- 底部菜单 -->
    <div id="bottom-menu">
      <button
        v-for="item in menuItems"
        :key="item.key"
        class="menu-btn"
        :class="{ active: store.activeTab === item.key }"
        @click="onMenuClick(item.key)"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/game.js'
import Battle from './Battle.vue'
import Inventory from './Inventory.vue'
import Farm from './Farm.vue'

const store = useGameStore()

const menuItems = [
  { key: 'dungeon', icon: '🏰', label: '地牢' },
  { key: 'fishing', icon: '🎣', label: '钓鱼' },
  { key: 'inventory', icon: '🎒', label: '背包' },
  { key: 'achievements', icon: '🏆', label: '成就' },
  { key: 'encyclopedia', icon: '📖', label: '图鉴' },
  { key: 'farm', icon: '🏡', label: '农场' },
  { key: 'review', icon: '📚', label: '复习' },
]

function onMenuClick(key) {
  if (store.inBattle && key !== 'dungeon') {
    // 战斗中只能留在地牢标签
    return
  }
  store.setTab(key)
}
</script>

<style scoped>
#game-container {
  width: 100%;
  max-width: 480px;
  height: 100vh;
  height: 100dvh;
  background: #16213e;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  #game-container {
    max-width: 520px;
    height: 90vh;
    height: 90dvh;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.08);
  }
}

#status-bar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #0f3460;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.stat-box {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 11px;
  color: #a0a0a0;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
}

.stat-bar {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  margin-top: 4px;
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
  font-size: 9px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.stat-label {
  margin-top: 4px;
  color: #a0a0a0;
  font-size: 11px;
}

#main-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  -webkit-overflow-scrolling: touch;
}

.dungeon-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 40px;
}

.dungeon-title {
  font-size: 22px;
  font-weight: bold;
  color: #d4a853;
}

.dungeon-desc {
  font-size: 14px;
  color: #888;
  text-align: center;
}

.explore-btn {
  padding: 14px 40px;
  font-size: 16px;
  font-weight: bold;
  color: #1a1a2e;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  border: none;
  border-radius: 28px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(212,168,83,0.4);
  transition: transform 0.2s;
}

.explore-btn:hover {
  transform: translateY(-2px);
}

.placeholder {
  color: #888;
  text-align: center;
  margin-top: 40px;
  font-size: 14px;
}

#bottom-menu {
  display: flex;
  gap: 2px;
  padding: 4px 6px 8px;
  background: #0f3460;
  border-top: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.menu-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 2px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #888;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-btn.active {
  background: rgba(212,168,83,0.15);
  color: #d4a853;
}

.menu-icon {
  font-size: 18px;
}
</style>
