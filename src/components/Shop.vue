<template>
  <div class="shop-panel">
    <div class="shop-header">
      <div class="shop-title">🏪 神秘商店</div>
      <div class="shop-gold">💰 {{ store.gold }}</div>
    </div>

    <div class="shop-tabs">
      <button class="shop-tab" :class="{ active: tab === 'consumable' }" @click="tab = 'consumable'">🧪 消耗品</button>
      <button class="shop-tab" :class="{ active: tab === 'equipment' }" @click="tab = 'equipment'">⚔️ 装备</button>
      <button class="shop-tab" :class="{ active: tab === 'material' }" @click="tab = 'material'">💎 材料</button>
    </div>

    <div class="shop-list">
      <div v-if="availableItems.length === 0" class="empty-msg">
        暂无解锁商品，提升等级后会有更多选择！
      </div>
      <div v-for="item in availableItems" :key="item.id" class="shop-item">
        <div class="shop-item-header">
          <span class="item-icon">{{ item.icon }}</span>
          <span class="item-name">{{ item.name }}</span>
          <span class="item-price" :class="{ enough: store.gold >= item.price }">
            💰 {{ item.price }}
          </span>
        </div>
        <div class="item-stats" v-if="item.type === 'equipment'">
          <span v-if="item.atk">⚔️ +{{ item.atk }}</span>
          <span v-if="item.def">🛡️ +{{ item.def }}</span>
        </div>
        <div class="item-desc">{{ item.desc }}</div>
        <div class="item-actions">
          <button class="buy-btn" :disabled="store.gold < item.price" @click="buy(item)">
            {{ store.gold >= item.price ? '购买' : '金币不足' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { SHOP_ITEMS } from '../data/shop.js'

const store = useGameStore()
const tab = ref('consumable')

const availableItems = computed(() => {
  return SHOP_ITEMS.filter(item => {
    if (item.type !== tab.value) return false
    if (item.unlockLevel && item.unlockLevel > store.level) return false
    return true
  })
})

function buy(item) {
  if (store.gold < item.price) return
  store.buyItem(item)
}
</script>

<style scoped>
.shop-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.shop-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
}

.shop-gold {
  font-size: 14px;
  color: #f4d03f;
  font-weight: bold;
}

.shop-tabs {
  display: flex;
  gap: 8px;
}

.shop-tab {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.shop-tab.active {
  background: rgba(212, 168, 83, 0.15);
  border-color: rgba(212, 168, 83, 0.4);
  color: #d4a853;
}

.shop-list {
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

.shop-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shop-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon {
  font-size: 20px;
}

.item-name {
  font-size: 15px;
  font-weight: bold;
  color: #e0e0e0;
  flex: 1;
}

.item-price {
  font-size: 13px;
  color: #e74c3c;
  font-weight: bold;
}

.item-price.enough {
  color: #2ecc71;
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

.buy-btn {
  padding: 6px 20px;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  font-weight: bold;
}

.buy-btn:hover:not(:disabled) {
  background: rgba(46, 204, 113, 0.3);
  transform: translateY(-1px);
}

.buy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  color: #666;
}
</style>
