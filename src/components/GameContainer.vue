<template>
  <div id="game-container">
    <!-- 顶部状态栏 -->
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
    </div>

    <!-- 主界面 - 区域网格 -->
    <div id="main-content" v-if="!activePanel">
      <div class="dashboard-header">
        <h2>🏰 生化易界</h2>
        <p class="dashboard-subtitle">以知识为刃，斩破混沌迷雾</p>
      </div>
      
      <div class="area-grid">
        <!-- 地牢探索 -->
        <div class="area-card dungeon-card" @click="openPanel('dungeon')">
          <div class="area-icon">🏰</div>
          <div class="area-name">地牢探索</div>
          <div class="area-desc">第 {{ store.floor }} 层</div>
          <div class="area-badge" v-if="store.inBattle">战斗中!</div>
        </div>
        
        <!-- 锻造店 -->
        <div class="area-card forge-card" @click="openPanel('forge')">
          <div class="area-icon">🔨</div>
          <div class="area-name">锻造店</div>
          <div class="area-desc">合成装备与药水</div>
        </div>
        
        <!-- 仓库 -->
        <div class="area-card inventory-card" @click="openPanel('inventory')">
          <div class="area-icon">🎒</div>
          <div class="area-name">仓库</div>
          <div class="area-desc">装备 · 材料 · 药水</div>
          <div class="area-badge" v-if="store.equipment.length > 0">{{ store.equipment.length }}</div>
        </div>
        
        <!-- 农场 -->
        <div class="area-card farm-card" @click="openPanel('farm')">
          <div class="area-icon">🏡</div>
          <div class="area-name">怪物农场</div>
          <div class="area-desc">伙伴: {{ store.farm.length }}/12</div>
          <div class="area-badge" v-if="store.activeMonster">🐾</div>
        </div>
        
        <!-- 钓鱼塘 -->
        <div class="area-card fishing-card" @click="openPanel('fishing')">
          <div class="area-icon">🎣</div>
          <div class="area-name">钓鱼塘</div>
          <div class="area-desc">Lv.{{ store.fishingLevel }} 钓手</div>
          <div class="area-badge" v-if="store.recentCatches.length > 0">{{ store.recentCatches.length }}</div>
        </div>
        
        <!-- 自习室 -->
        <div class="area-card study-card" @click="openPanel('study')">
          <div class="area-icon">📚</div>
          <div class="area-name">自习室</div>
          <div class="area-desc">错题回顾 · 知识巩固</div>
        </div>
        
        <!-- 商店 -->
        <div class="area-card shop-card" @click="openPanel('shop')">
          <div class="area-icon">🏪</div>
          <div class="area-name">杂货铺</div>
          <div class="area-desc">购买补给物资</div>
        </div>
        
        <!-- 设置 -->
        <div class="area-card settings-card" @click="openPanel('settings')">
          <div class="area-icon">⚙️</div>
          <div class="area-name">设置</div>
          <div class="area-desc">成就 · 图鉴 · 存档</div>
        </div>
      </div>
    </div>

    <!-- 面板覆盖层 -->
    <div v-if="activePanel" class="panel-overlay">
      <div class="panel-header">
        <button class="btn-back" @click="closePanel">← 返回</button>
        <span class="panel-title">{{ panelTitle }}</span>
      </div>
      <div class="panel-content">
        <!-- 地牢面板 -->
        <div v-if="activePanel === 'dungeon'" class="panel-dungeon">
          <div v-if="!store.inBattle" class="dungeon-intro">
            <div class="dungeon-title">🏰 第 {{ store.floor }} 层地牢</div>
            <p class="dungeon-desc">黑暗中的密室散发着危险的气息...</p>
            <button class="explore-btn" @click="store.initBattle">探索密室</button>
          </div>
          <Battle v-else />
        </div>
        
        <!-- 锻造面板 -->
        <div v-if="activePanel === 'forge'" class="panel-forge">
          <div class="forge-placeholder">
            <div class="forge-icon">🔨</div>
            <h3>锻造店</h3>
            <p>合成装备与药水</p>
            <div class="forge-recipes">
              <div v-for="recipe in forgeRecipes" :key="recipe.id" class="recipe-card">
                <div class="recipe-name">{{ recipe.name }}</div>
                <div class="recipe-materials">
                  <span v-for="(count, mat) in recipe.materials" :key="mat">
                    {{ mat }} ×{{ count }}
                  </span>
                </div>
                <button 
                  @click="store.forgeItem(recipe.id)" 
                  :disabled="!canForgeRecipe(recipe)"
                  class="btn-forge"
                >
                  锻造 ({{ recipe.gold }}💰)
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 仓库面板 -->
        <div v-if="activePanel === 'inventory'" class="panel-inventory">
          <Inventory />
        </div>
        
        <!-- 农场面板 -->
        <div v-if="activePanel === 'farm'" class="panel-farm">
          <Farm />
        </div>
        
        <!-- 钓鱼面板 -->
        <div v-if="activePanel === 'fishing'" class="panel-fishing">
          <Fishing />
        </div>
        
        <!-- 自习室面板 -->
        <div v-if="activePanel === 'study'" class="panel-study">
          <div class="study-placeholder">
            <div class="study-icon">📚</div>
            <h3>自习室</h3>
            <p>知识回顾与错题本</p>
            <div class="study-stats">
              <div class="stat-item">
                <span class="stat-num">{{ store.stats?.totalCorrect || 0 }}</span>
                <span class="stat-label">答对</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ store.stats?.totalWrong || 0 }}</span>
                <span class="stat-label">答错</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ store.stats?.maxCombo || 0 }}</span>
                <span class="stat-label">最高连击</span>
              </div>
            </div>
            <div class="study-section">
              <h4>📝 错题本</h4>
              <p class="study-hint">功能开发中...</p>
            </div>
          </div>
        </div>
        
        <!-- 商店面板 -->
        <div v-if="activePanel === 'shop'" class="panel-shop">
          <Shop />
        </div>
        
        <!-- 设置面板 -->
        <div v-if="activePanel === 'settings'" class="panel-settings">
          <div class="settings-grid">
            <div class="settings-card" @click="openSubPanel('achievements')">
              <div class="settings-icon">🏆</div>
              <div class="settings-name">成就</div>
              <div class="settings-desc">查看已获得成就</div>
            </div>
            <div class="settings-card" @click="openSubPanel('encyclopedia')">
              <div class="settings-icon">📖</div>
              <div class="settings-name">图鉴</div>
              <div class="settings-desc">怪物 · 装备 · 材料</div>
            </div>
            <div class="settings-card" @click="saveGame">
              <div class="settings-icon">💾</div>
              <div class="settings-name">保存存档</div>
              <div class="settings-desc">手动保存进度</div>
            </div>
            <div class="settings-card" @click="exportSave">
              <div class="settings-icon">📤</div>
              <div class="settings-name">导出存档</div>
              <div class="settings-desc">备份到剪贴板</div>
            </div>
            <div class="settings-card" @click="importSave">
              <div class="settings-icon">📥</div>
              <div class="settings-name">导入存档</div>
              <div class="settings-desc">从剪贴板恢复</div>
            </div>
            <div class="settings-card danger" @click="resetGame">
              <div class="settings-icon">🗑️</div>
              <div class="settings-name">重置游戏</div>
              <div class="settings-desc">清除所有数据</div>
            </div>
          </div>
          
          <!-- 子面板 -->
          <div v-if="subPanel" class="sub-panel">
            <div class="sub-panel-header">
              <button class="btn-back" @click="subPanel = null">← 返回</button>
              <span>{{ subPanelTitle }}</span>
            </div>
            <div class="sub-panel-content">
              <div v-if="subPanel === 'achievements'" class="placeholder-content">
                🏆 成就系统开发中...
              </div>
              <div v-if="subPanel === 'encyclopedia'" class="placeholder-content">
                📖 图鉴系统开发中...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import Battle from './Battle.vue'
import Inventory from './Inventory.vue'
import Farm from './Farm.vue'
import Fishing from './Fishing.vue'
import Shop from './Shop.vue'
import { FORGE_RECIPES, canForge } from '../data/forge.js'

const store = useGameStore()
const activePanel = ref(null)
const subPanel = ref(null)

const panelTitle = computed(() => {
  const titles = {
    dungeon: '地牢探索',
    forge: '锻造店',
    inventory: '仓库',
    farm: '怪物农场',
    fishing: '钓鱼塘',
    study: '自习室',
    shop: '杂货铺',
    settings: '设置'
  }
  return titles[activePanel.value] || ''
})

const subPanelTitle = computed(() => {
  const titles = {
    achievements: '成就',
    encyclopedia: '图鉴'
  }
  return titles[subPanel.value] || ''
})

const forgeRecipes = computed(() => FORGE_RECIPES)

function openPanel(panel) {
  activePanel.value = panel
  subPanel.value = null
}

function closePanel() {
  activePanel.value = null
  subPanel.value = null
}

function openSubPanel(panel) {
  subPanel.value = panel
}

function canForgeRecipe(recipe) {
  return canForge(recipe, store.inventory, store.gold)
}

function saveGame() {
  store.saveGame()
  alert('存档已保存！')
}

function exportSave() {
  const saveData = localStorage.getItem('bioyi_realm_save')
  if (saveData) {
    navigator.clipboard.writeText(saveData)
    alert('存档已复制到剪贴板！')
  }
}

function importSave() {
  const data = prompt('请粘贴存档数据：')
  if (data) {
    try {
      JSON.parse(data)
      localStorage.setItem('bioyi_realm_save', data)
      store.loadGame()
      alert('存档已恢复！')
    } catch (e) {
      alert('存档数据无效！')
    }
  }
}

function resetGame() {
  if (confirm('确定要重置所有游戏数据吗？此操作不可恢复！')) {
    store.deleteSave()
    location.reload()
  }
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
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  color: #d4a853;
  font-size: 24px;
  margin-bottom: 4px;
}

.dashboard-subtitle {
  color: #888;
  font-size: 13px;
}

/* 区域网格 */
.area-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.area-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.area-card:hover {
  transform: translateY(-4px);
  border-color: rgba(212, 168, 83, 0.4);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.area-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #d4a853, #e8c67a);
  opacity: 0;
  transition: opacity 0.3s;
}

.area-card:hover::before {
  opacity: 1;
}

.area-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.area-name {
  font-size: 15px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.area-desc {
  font-size: 12px;
  color: #888;
}

.area-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

/* 各卡片颜色主题 */
.dungeon-card { border-top: 3px solid #e74c3c; }
.forge-card { border-top: 3px solid #e67e22; }
.inventory-card { border-top: 3px solid #3498db; }
.farm-card { border-top: 3px solid #2ecc71; }
.fishing-card { border-top: 3px solid #1abc9c; }
.study-card { border-top: 3px solid #9b59b6; }
.shop-card { border-top: 3px solid #f1c40f; }
.settings-card { border-top: 3px solid #95a5a6; }

/* 面板覆盖层 */
.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #16213e;
  display: flex;
  flex-direction: column;
  z-index: 50;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #0f3460;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.btn-back {
  background: rgba(255,255,255,0.1);
  border: none;
  color: #d4a853;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(212,168,83,0.2);
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  color: #e0e0e0;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 地牢 */
.panel-dungeon .dungeon-intro {
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

/* 锻造 */
.panel-forge {
  padding: 20px;
}

.forge-placeholder {
  text-align: center;
}

.forge-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.forge-recipes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.recipe-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}

.recipe-name {
  font-size: 16px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 8px;
}

.recipe-materials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #888;
}

.btn-forge {
  width: 100%;
  padding: 10px;
  background: #e67e22;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-forge:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-forge:hover:not(:disabled) {
  background: #d35400;
}

/* 自习室 */
.panel-study {
  padding: 20px;
}

.study-placeholder {
  text-align: center;
}

.study-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.study-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #d4a853;
}

.stat-label {
  font-size: 12px;
  color: #888;
}

.study-section {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
}

.study-section h4 {
  color: #e0e0e0;
  margin-bottom: 8px;
}

.study-hint {
  color: #888;
  font-size: 13px;
}

/* 设置 */
.panel-settings {
  padding: 16px;
  position: relative;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.settings-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(212,168,83,0.3);
}

.settings-card.danger:hover {
  border-color: #e74c3c;
}

.settings-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.settings-name {
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.settings-desc {
  font-size: 11px;
  color: #888;
}

/* 子面板 */
.sub-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #16213e;
  display: flex;
  flex-direction: column;
  z-index: 60;
  animation: slideIn 0.3s ease;
}

.sub-panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #0f3460;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.sub-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.placeholder-content {
  text-align: center;
  color: #888;
  font-size: 16px;
  padding-top: 40px;
}
</style>
