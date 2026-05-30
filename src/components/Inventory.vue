<template>
  <div class="inventory-panel">
    <div class="inv-tabs">
      <button class="inv-tab" :class="{ active: tab === 'equip' }" @click="tab = 'equip'">⚔️ 装备</button>
      <button class="inv-tab" :class="{ active: tab === 'item' }" @click="tab = 'item'">🧪 消耗品</button>
      <button class="inv-tab" :class="{ active: tab === 'mat' }" @click="tab = 'mat'">💎 材料</button>
      <button class="inv-tab" :class="{ active: tab === 'forge' }" @click="tab = 'forge'">🔨 锻造</button>
    </div>

    <div class="inv-list" v-if="tab === 'equip'">
      <div v-if="store.equipment.length === 0" class="empty-msg">
        背包空空如也，去地牢探索获取装备吧！
      </div>
      <div v-for="item in store.equipment" :key="item.id" class="inv-item">
        <div class="item-name">{{ item.name }}</div>
        <div class="item-stats">
          <span v-if="item.atk">⚔️ {{ item.atk }}</span>
          <span v-if="item.def">🛡️ {{ item.def }}</span>
        </div>
        <div class="item-desc">{{ item.desc }}</div>
        <div class="item-actions">
          <button class="equip-btn" @click="equip(item)">{{ isEquipped(item) ? '已装备' : '装备' }}</button>
        </div>
      </div>
    </div>

    <div class="inv-list" v-if="tab === 'item'">
      <div v-if="store.consumables.length === 0" class="empty-msg">
        没有消耗品，击败敌人可能获得药水哦！
      </div>
      <div v-for="item in store.consumables" :key="item.id + item.slot" class="inv-item">
        <div class="item-name">{{ item.name }} ×{{ item.count }}</div>
        <div class="item-desc">{{ item.desc }}</div>
        <div class="item-actions">
          <button class="use-btn" @click="useItem(item)">使用</button>
        </div>
      </div>
    </div>

    <div class="inv-list" v-if="tab === 'mat'">
      <div v-if="materialList.length === 0" class="empty-msg">
        没有材料，击败怪物会掉落对应元素的材料。
      </div>
      <div v-for="mat in materialList" :key="mat.name" class="inv-item">
        <div class="item-name">{{ mat.icon }} {{ mat.name }} ×{{ mat.count }}</div>
        <div class="item-desc">{{ mat.desc }}</div>
      </div>
    </div>

    <div class="inv-list" v-if="tab === 'forge'">
      <div v-if="availableRecipes.length === 0" class="empty-msg">
        暂无可用配方，提升等级解锁更多锻造配方。
      </div>
      <div v-for="recipe in availableRecipes" :key="recipe.id" class="inv-item">
        <div class="item-name">{{ recipe.icon }} {{ recipe.name }} <span class="recipe-level">Lv.{{ recipe.unlockLevel }}</span></div>
        <div class="item-stats">
          <span v-if="recipe.atk">⚔️ {{ recipe.atk }}</span>
          <span v-if="recipe.def">🛡️ {{ recipe.def }}</span>
          <span>💰 {{ recipe.gold }}</span>
        </div>
        <div class="materials-list">
          <span v-for="(need, mat) in recipe.materials" :key="mat" class="mat-tag" :class="{ enough: (store.inventory[mat] || 0) >= need }">
            {{ mat }} {{ store.inventory[mat] || 0 }}/{{ need }}
          </span>
        </div>
        <div class="item-desc">{{ recipe.desc }}</div>
        <div class="item-actions">
          <button class="forge-btn" :disabled="!canForgeRecipe(recipe)" @click="doForge(recipe.id)">
            {{ canForgeRecipe(recipe) ? '🔨 锻造' : '材料不足' }}
          </button>
        </div>
      </div>
    </div>

    <div class="equip-summary" v-if="store.equipped.weapon || store.equipped.armor || store.equipped.accessory">
      <div class="summary-title">当前装备</div>
      <div class="summary-row">
        <span v-if="store.equipped.weapon">⚔️ {{ store.equipped.weapon.name }} (+{{ store.equipped.weapon.atk }})</span>
        <span v-else class="empty-slot">⚔️ 空</span>
      </div>
      <div class="summary-row">
        <span v-if="store.equipped.armor">🛡️ {{ store.equipped.armor.name }} (+{{ store.equipped.armor.def }})</span>
        <span v-else class="empty-slot">🛡️ 空</span>
      </div>
      <div class="summary-row">
        <span v-if="store.equipped.accessory">💍 {{ store.equipped.accessory.name }} (+{{ store.equipped.accessory.atk || 0 }}/+{{ store.equipped.accessory.def || 0 }})</span>
        <span v-else class="empty-slot">💍 空</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { DUNGEON_ELEMENTS } from '../data/farm.js'
import { FORGE_RECIPES, canForge } from '../data/forge.js'

const store = useGameStore()
const tab = ref('equip')

const availableRecipes = computed(() => {
  return FORGE_RECIPES.filter(r => r.unlockLevel <= store.level)
})

function canForgeRecipe(recipe) {
  return canForge(recipe, store.inventory, store.gold)
}

function doForge(recipeId) {
  const ok = store.forgeItem(recipeId)
  if (ok) {
    // 成功提示
  }
}

const materialList = computed(() => {
  const icons = { '水之精华': '💧', '火焰核心': '🔥', '酸液结晶': '🧪', '雷电石': '⚡', '冰霜碎片': '❄️', '风之羽毛': '🌪️' }
  const descs = { '水之精华': '水属性怪物掉落，用于升级水元素宠物', '火焰核心': '火属性怪物掉落，用于升级火元素宠物', '酸液结晶': '酸属性怪物掉落，用于升级酸元素宠物', '雷电石': '电属性怪物掉落，用于升级电元素宠物', '冰霜碎片': '冰属性怪物掉落，用于升级冰元素宠物', '风之羽毛': '风属性怪物掉落，用于升级风元素宠物' }
  return Object.entries(store.inventory || {})
    .filter(([name, count]) => count > 0)
    .map(([name, count]) => ({
      name,
      count,
      icon: icons[name] || '💎',
      desc: descs[name] || '通用材料'
    }))
})

function isEquipped(item) {
  return store.equipped[item.type]?.id === item.id
}

function equip(item) {
  if (isEquipped(item)) {
    store.equipped[item.type] = null
  } else {
    store.equipped[item.type] = item
  }
}

function useItem(item) {
  if (item.effect === 'hp') {
    store.hp = Math.min(store.maxHp, store.hp + item.value)
  } else if (item.effect === 'exp') {
    store.exp += item.value
    if (store.exp >= store.maxExp) {
      store.level++
      store.exp -= store.maxExp
      store.maxExp = Math.floor(store.maxExp * 1.2)
      store.maxHp += 10
      store.hp = store.maxHp
    }
  }
  item.count--
  if (item.count <= 0) {
    store.consumables = store.consumables.filter(i => i !== item)
  }
}
</script>

<style scoped>
.inventory-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inv-tabs {
  display: flex;
  gap: 8px;
}

.inv-tab {
  flex: 1;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.inv-tab.active {
  background: rgba(212,168,83,0.15);
  border-color: rgba(212,168,83,0.4);
  color: #d4a853;
}

.inv-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-msg {
  color: #666;
  text-align: center;
  padding: 30px 0;
  font-size: 13px;
}

.inv-item {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-name {
  font-size: 15px;
  font-weight: bold;
  color: #e0e0e0;
}

.item-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #d4a853;
}

.item-desc {
  font-size: 12px;
  color: #888;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
}

.equip-btn, .use-btn {
  padding: 6px 16px;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.equip-btn {
  background: rgba(212,168,83,0.2);
  color: #d4a853;
}

.equip-btn:hover {
  background: rgba(212,168,83,0.3);
}

.use-btn {
  background: rgba(39,174,96,0.2);
  color: #2ecc71;
}

.use-btn:hover {
  background: rgba(39,174,96,0.3);
}

.materials-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.mat-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.mat-tag.enough {
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.3);
}

.recipe-level {
  font-size: 11px;
  color: #888;
  font-weight: normal;
  margin-left: 4px;
}

.forge-btn {
  padding: 6px 16px;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(212, 168, 83, 0.2);
  color: #d4a853;
}

.forge-btn:hover:not(:disabled) {
  background: rgba(212, 168, 83, 0.3);
}

.forge-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  color: #666;
}

.equip-summary {
  background: rgba(15,52,96,0.5);
  border: 1px solid rgba(52,152,219,0.2);
  border-radius: 10px;
  padding: 12px;
}

.summary-title {
  font-size: 14px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 8px;
}

.summary-row {
  font-size: 13px;
  color: #ccc;
  margin-bottom: 4px;
}

.empty-slot {
  color: #555;
}
</style>
