<template>
  <div class="dungeon-prep">
    <div class="prep-header">
      <div class="prep-title">⚔️ 第 {{ floor }} 层 - 战前准备</div>
      <div class="floor-element-badge" :style="{ background: floorElementColor }">
        {{ floorElementName }} 元素层
      </div>
      <div class="prep-hint">调整装备与宠物，确认后进入地牢</div>
    </div>

    <!-- 怪物预览 -->
    <div class="prep-preview">
      <div class="preview-title">🔮 本层怪物情报</div>
      <div class="preview-grid">
        <div
          v-for="room in previewRooms"
          :key="room.index"
          class="preview-card"
          :class="{ 'preview-boss': room.isBoss }"
        >
          <span class="preview-icon">{{ room.enemyPreview.icon }}</span>
          <span class="preview-name">{{ room.enemyPreview.name }}</span>
          <span class="preview-subject" :style="{ background: room.enemyPreview.elementColor }">{{
            room.enemyPreview.subjectLabel
          }}</span>
          <span class="preview-atk">⚔️{{ room.enemyPreview.atk }}</span>
        </div>
        <div v-if="roomGrid.length > 6" class="preview-more">+{{ roomGrid.length - 6 }} 更多...</div>
      </div>
    </div>

    <!-- 元素克制提示 -->
    <div class="element-hint">
      <div class="element-hint-title">💡 元素克制</div>
      <div class="element-hint-text">{{ floorElementHint }}</div>
    </div>

    <!-- 当前配置 -->
    <div class="prep-config">
      <div class="config-section">
        <div class="config-title">🗡️ 装备 <span class="config-sub">（点击更换）</span></div>
        <div class="config-slots">
          <div
            class="config-slot"
            :class="{ empty: !equipped.weapon, clickable: true }"
            @click="$emit('openEquipPicker', 'weapon')"
          >
            <span v-if="equipped.weapon">⚔️ {{ equipped.weapon.name }}</span>
            <span v-else>未装备武器</span>
          </div>
          <div
            class="config-slot"
            :class="{ empty: !equipped.armor, clickable: true }"
            @click="$emit('openEquipPicker', 'armor')"
          >
            <span v-if="equipped.armor">🛡️ {{ equipped.armor.name }}</span>
            <span v-else>未装备防具</span>
          </div>
          <div
            class="config-slot"
            :class="{ empty: !equipped.accessory, clickable: true }"
            @click="$emit('openEquipPicker', 'accessory')"
          >
            <span v-if="equipped.accessory">💍 {{ equipped.accessory.name }}</span>
            <span v-else>未装备饰品</span>
          </div>
        </div>
      </div>

      <div class="config-section">
        <div class="config-title">🐾 宠物 <span class="config-sub">（点击更换）</span></div>
        <div class="config-pet clickable" @click="$emit('openPetPicker')">
          <span v-if="activeMonster"
            >{{ activeMonster.icon }} {{ activeMonster.name }}
            {{ activeMonster.ability?.desc }}</span
          >
          <span v-else class="empty">未携带宠物</span>
        </div>
      </div>

      <div class="config-section">
        <div class="config-title">🧪 药水 ({{ consumables.length }})</div>
        <div class="config-potions">
          <span v-for="item in consumables.slice(0, 5)" :key="item.id" class="config-potion"
            >{{ item.icon }} {{ item.name }}</span
          >
          <span v-if="consumables.length === 0" class="empty">无药水</span>
        </div>
      </div>
    </div>

    <div class="prep-actions">
      <button type="button" class="btn-enter-dungeon" @click="$emit('enterRooms')">🏰 进入地牢</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  floor: { type: Number, required: true },
  floorElementName: { type: String, required: true },
  floorElementColor: { type: String, required: true },
  floorElementHint: { type: String, required: true },
  roomGrid: { type: Array, required: true },
  equipped: { type: Object, required: true },
  consumables: { type: Array, required: true },
  activeMonster: { type: Object, default: null },
})

defineEmits(['openEquipPicker', 'openPetPicker', 'enterRooms'])

const previewRooms = computed(() => props.roomGrid.slice(0, 6))
</script>

<style scoped>
.dungeon-prep {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prep-header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.prep-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 4px;
}

.prep-hint {
  font-size: 12px;
  color: #888;
}

.floor-element-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #fff;
  font-weight: bold;
  margin: 8px 0;
}

.prep-preview {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.preview-title {
  font-size: 14px;
  color: #e0e0e0;
  margin-bottom: 12px;
  font-weight: bold;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.preview-boss {
  border: 1px solid #e74c3c;
  background: rgba(231, 76, 60, 0.15);
}

.preview-icon {
  font-size: 18px;
}

.preview-name {
  color: #e0e0e0;
  font-weight: bold;
}

.preview-subject {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}

.preview-atk {
  color: #e74c3c;
  font-size: 11px;
}

.preview-more {
  grid-column: span 3;
  text-align: center;
  color: #666;
  font-size: 12px;
  padding: 4px;
}

.element-hint {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.element-hint-title {
  font-size: 12px;
  color: #d4a853;
  margin-bottom: 4px;
  font-weight: bold;
}

.element-hint-text {
  font-size: 12px;
  color: #a0a0a0;
}

.prep-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-title {
  font-size: 13px;
  color: #d4a853;
  font-weight: bold;
}

.config-slots {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.config-slot {
  background: rgba(255, 255, 255, 0.08);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #e0e0e0;
  flex: 1;
  min-width: 100px;
  text-align: center;
}

.config-slot.empty {
  color: #666;
}

.config-pet {
  background: rgba(255, 255, 255, 0.08);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #e0e0e0;
}

.config-pet .empty {
  color: #666;
}

.config-potions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.config-potion {
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #e0e0e0;
}

.prep-actions {
  display: flex;
  justify-content: center;
}

.btn-enter-dungeon {
  padding: 12px 32px;
  font-size: 16px;
  background: #d4a853;
  color: #1a1a2e;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.btn-enter-dungeon:hover {
  transform: scale(1.05);
}

/* 可点击配置槽 */
.config-slot.clickable,
.config-pet.clickable {
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;
}
.config-slot.clickable:hover,
.config-pet.clickable:hover {
  background: rgba(212, 168, 83, 0.15);
  transform: translateY(-1px);
}

.config-sub {
  font-size: 11px;
  color: #888;
  font-weight: normal;
  margin-left: 4px;
}
</style>
