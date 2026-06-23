<template>
  <div class="dashboard-header">
    <h2 class="dashboard-title">🏰 生化易界</h2>
    <p class="dashboard-subtitle">以知识为刃，斩破混沌迷雾</p>
  </div>

  <div class="area-grid">
    <!-- 地牢探索 -->
    <div class="area-card dungeon-card" @click="$emit('enter-dungeon')">
      <div class="area-icon">🏰</div>
      <div class="area-name">地牢探索</div>
      <div class="area-desc">第 {{ store.floor }} 层</div>
    </div>

    <!-- 图鉴 -->
    <div class="area-card encyclopedia-card" @click="$emit('open-panel', 'encyclopedia')">
      <div class="area-icon">📖</div>
      <div class="area-name">图鉴</div>
      <div class="area-desc">怪物 · 材料 · 鱼</div>
    </div>

    <!-- 人物 -->
    <div class="area-card character-card" @click="$emit('open-panel', 'character')">
      <div class="area-icon">👤</div>
      <div class="area-name">人物</div>
      <div class="area-desc">装备 · 属性点</div>
    </div>

    <!-- 背包 -->
    <div class="area-card inventory-card" @click="$emit('open-panel', 'inventory')">
      <div class="area-icon">🎒</div>
      <div class="area-name">背包</div>
      <div class="area-desc">装备 · 材料 · 药水</div>
    </div>

    <!-- 农场 -->
    <div class="area-card farm-card" @click="$emit('open-panel', 'farm')">
      <div class="area-icon">🏡</div>
      <div class="area-name">怪物农场</div>
      <div class="area-desc">伙伴: {{ store.farm.length }}/12</div>
    </div>

    <!-- 钓鱼塘 -->
    <div class="area-card fishing-card" @click="$emit('open-panel', 'fishing')">
      <div class="area-icon">🎣</div>
      <div class="area-name">钓鱼塘</div>
      <div class="area-desc">Lv.{{ store.fishingLevel }} 钓手</div>
    </div>

    <!-- 自习室 -->
    <div class="area-card study-card" @click="$emit('open-panel', 'study')">
      <div class="area-icon">📚</div>
      <div class="area-name">自习室</div>
      <div class="area-desc">错题回顾 · 知识巩固</div>
    </div>

    <!-- PVP对战 -->
    <div class="area-card pvp-card" @click="$emit('open-pvp')">
      <div class="area-icon">⚔️</div>
      <div class="area-name">对战</div>
      <div class="area-desc">PVP知识对决</div>
    </div>

    <!-- 商店 -->
    <div class="area-card shop-card" @click="$emit('open-panel', 'shop')">
      <div class="area-icon">🏪</div>
      <div class="area-name">杂货铺</div>
      <div class="area-desc">购买补给物资</div>
    </div>

    <!-- 设置 -->
    <div class="area-card settings-card" @click="$emit('open-panel', 'settings')">
      <div class="area-icon">⚙️</div>
      <div class="area-name">设置</div>
      <div class="area-desc">称号 · 存档</div>
    </div>

    <!-- 排行榜 -->
    <div class="area-card leaderboard-card" @click="$emit('open-leaderboard')">
      <div class="area-icon">🏆</div>
      <div class="area-name">排行榜</div>
      <div class="area-desc">PVP战绩排名</div>
    </div>

    <!-- 限时Boss -->
    <div class="area-card weekly-boss-card" @click="$emit('open-weekly-boss')">
      <div class="area-icon">🔥</div>
      <div class="area-name">周常大魔王</div>
      <div v-if="weeklyBossDefeated" class="area-desc">已击败</div>
      <div v-else class="area-desc">限时挑战 · 限定成就</div>
    </div>

    <!-- 成就 -->
    <div class="area-card achievements-card" @click="$emit('open-panel', 'achievements')">
      <div class="area-icon">🏆</div>
      <div class="area-name">成就殿堂</div>
      <div class="area-desc">
        {{ Object.keys(store.unlockedAchievements || {}).length || 0 }} / {{ totalAchievements }} 已解锁
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game.ts'
import { ACHIEVEMENTS } from '../data/achievements.ts'

const store = useGameStore()
const totalAchievements = ACHIEVEMENTS.length

const weeklyBossDefeated = computed(() => {
  if (!store.weeklyBossData) return false
  return store.weeklyBossDefeated.includes(store.weeklyBossData.id)
})

defineEmits(['open-panel', 'open-pvp', 'open-leaderboard', 'open-weekly-boss', 'enter-dungeon'])
</script>

<style scoped>
.dashboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.dashboard-header .dashboard-title {
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
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
.dungeon-card {
  border-top: 3px solid #e74c3c;
}
.encyclopedia-card {
  border-top: 3px solid #e67e22;
}
.inventory-card {
  border-top: 3px solid #3498db;
}
.character-card {
  border-top: 3px solid #e74c3c;
}
.farm-card {
  border-top: 3px solid #2ecc71;
}
.fishing-card {
  border-top: 3px solid #1abc9c;
}
.study-card {
  border-top: 3px solid #9b59b6;
}
.pvp-card {
  border-top: 3px solid #e74c3c;
}
.leaderboard-card {
  border-top: 3px solid #d4a853;
}
.shop-card {
  border-top: 3px solid #f1c40f;
}
.settings-card {
  border-top: 3px solid #95a5a6;
}

/* 限时Boss卡片 */
.weekly-boss-card {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(192, 57, 43, 0.1));
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.weekly-boss-card .area-icon {
  font-size: 32px;
}

.weekly-boss-card .area-name {
  color: #e74c3c;
}

.weekly-boss-card:hover {
  border-color: rgba(231, 76, 60, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
}
</style>
