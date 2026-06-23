<template>
  <div class="character-panel">
    <!-- 人物形象区域 -->
    <div class="character-avatar-section">
      <div class="avatar-ring">
        <div class="avatar-inner">👤</div>
      </div>
      <div class="character-name">Lv.{{ store.level }} {{ store.title || '冒险者' }}</div>
      <div v-if="store.playerSpecialization" class="character-spec">
        <span class="spec-tag">{{ specLabel }}</span>
      </div>
    </div>

    <!-- 人物称号 -->
    <div class="title-section">
      <div class="title-card">
        <div class="title-row">
          <span class="title-era">{{ store.titleEra }}</span>
          <span class="title-dot">·</span>
          <span class="title-field-name">{{ store.titleField }}</span>
          <span class="title-star">⭐</span>
          <span class="title-name">{{ store.title }}</span>
        </div>
        <p class="title-bio">{{ store.titleBio }}</p>
        <div v-if="store.titleAchievements?.length" class="title-achievements">
          <div v-for="(ach, idx) in store.titleAchievements" :key="idx" class="title-ach-item">✓ {{ ach }}</div>
        </div>
      </div>
    </div>

    <!-- 装备栏 -->
    <div class="equip-section">
      <div class="section-title">⚔️ 装备栏</div>
      <div class="equip-slots">
        <div class="equip-slot" :class="{ filled: store.equipped.weapon }" @click="openEquipList('weapon')">
          <div class="slot-icon">⚔️</div>
          <div class="slot-name">{{ store.equipped.weapon?.name || '武器' }}</div>
          <div v-if="store.equipped.weapon" class="slot-stat">+{{ store.equipped.weapon.atk }} 攻</div>
        </div>
        <div class="equip-slot" :class="{ filled: store.equipped.armor }" @click="openEquipList('armor')">
          <div class="slot-icon">🛡️</div>
          <div class="slot-name">{{ store.equipped.armor?.name || '防具' }}</div>
          <div v-if="store.equipped.armor" class="slot-stat">+{{ store.equipped.armor.def }} 防</div>
        </div>
        <div class="equip-slot" :class="{ filled: store.equipped.accessory }" @click="openEquipList('accessory')">
          <div class="slot-icon">💍</div>
          <div class="slot-name">{{ store.equipped.accessory?.name || '饰品' }}</div>
          <div v-if="store.equipped.accessory" class="slot-stat">
            {{ store.equipped.accessory.atk ? '+' + store.equipped.accessory.atk + ' 攻' : '' }}
            {{ store.equipped.accessory.def ? '+' + store.equipped.accessory.def + ' 防' : '' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 属性点分配 -->
    <div class="stats-section">
      <div class="stats-header">
        <span class="section-title">✨ 属性点</span>
        <span class="stats-available"
          >可用: <b>{{ store.statPoints }}</b></span
        >
      </div>
      <div class="stats-list">
        <div class="stat-row">
          <span class="stat-label">⚔️ 攻击力</span>
          <span class="stat-value">{{ store.atk }} (已分配{{ store.atkPoints }}点)</span>
          <button v-if="store.statPoints > 0" type="button" class="btn-allocate" @click="store.allocateStat('atk')">+2</button>
        </div>
        <div class="stat-row">
          <span class="stat-label">🛡️ 防御力</span>
          <span class="stat-value">{{ store.def }} (已分配{{ store.defPoints }}点)</span>
          <button v-if="store.statPoints > 0" type="button" class="btn-allocate" @click="store.allocateStat('def')">+2</button>
        </div>
        <div class="stat-row">
          <span class="stat-label">❤️ 生命值</span>
          <span class="stat-value">{{ store.maxHp }} (已分配{{ store.hpPoints }}点)</span>
          <button v-if="store.statPoints > 0" type="button" class="btn-allocate" @click="store.allocateStat('hp')">+10</button>
        </div>
      </div>
      <div v-if="store.atkPoints + store.defPoints + store.hpPoints > 0" class="stats-reset">
        <button type="button" class="btn-reset" @click="store.resetStats">
          重置属性点 (消耗 {{ Math.floor(store.level * 50) }} 金币)
        </button>
      </div>
      <div v-if="store.statPoints === 0" class="stats-hint">升级后获得属性点，可自由分配到攻击/防御/生命。</div>
    </div>

    <!-- 专精技能树 -->
    <div class="skill-section">
      <div class="section-title">🎯 专精技能（{{ unlockedCount }}/{{ totalSkills }}）</div>
      <SkillTree />
    </div>

    <!-- 装备选择弹窗 -->
    <div v-if="equipPickerOpen" class="equip-picker-overlay" @click.self="equipPickerOpen = false">
      <div class="equip-picker">
        <div class="picker-header">
          <span>选择{{ pickerTypeLabel }}</span>
          <button type="button" class="picker-close" @click="equipPickerOpen = false">×</button>
        </div>
        <div class="picker-list">
          <div v-for="item in availableEquips" :key="item.id" class="picker-item" @click="equip(item)">
            <div class="picker-name">{{ item.name }}</div>
            <div class="picker-stat">
              <span v-if="item.atk">⚔️ {{ item.atk }}</span>
              <span v-if="item.def">🛡️ {{ item.def }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.ts'
import SkillTree from './SkillTree.vue'
import { getSpecialization } from '../data/specialization.ts'

const store = useGameStore()
const equipPickerOpen = ref(false)
const pickerType = ref('')

const specLabel = computed(() => {
  const map = { chem: '化学专精', bio: '生物专精', yi: '易学专精', biochem: '生化专精', all: '全部专精' }
  return map[store.playerSpecialization] || ''
})

const unlockedCount = computed(() => store.specializationSkills?.length || 0)
const totalSkills = computed(() => {
  const spec = getSpecialization(store.playerSpecialization)
  return spec?.skills?.length || 0
})

const pickerTypeLabel = computed(() => {
  const map = { weapon: '武器', armor: '防具', accessory: '饰品' }
  return map[pickerType.value] || ''
})

const availableEquips = computed(() => {
  return store.equipment.filter(e => e.type === pickerType.value)
})

function openEquipList(type) {
  pickerType.value = type
  equipPickerOpen.value = true
}

function equip(item) {
  store.equipped[item.type] = item
  equipPickerOpen.value = false
}
</script>

<style scoped>
.character-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

/* 头像区 */
.character-avatar-section {
  text-align: center;
  padding: 20px;
  background: rgba(15, 52, 96, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(212, 168, 83, 0.2);
}

.avatar-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4a853, #b8860b);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 0 20px rgba(212, 168, 83, 0.3);
}

.avatar-inner {
  font-size: 40px;
}

.character-name {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 6px;
}

.spec-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  background: rgba(212, 168, 83, 0.15);
  color: #d4a853;
}

/* 装备区 */
.equip-section {
  background: rgba(15, 52, 96, 0.3);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 12px;
}

.equip-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.equip-slot {
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.equip-slot:hover {
  border-color: rgba(212, 168, 83, 0.3);
  background: rgba(255, 255, 255, 0.06);
}

.equip-slot.filled {
  border-color: rgba(212, 168, 83, 0.3);
  background: rgba(212, 168, 83, 0.08);
}

.slot-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.slot-name {
  font-size: 13px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.slot-stat {
  font-size: 11px;
  color: #d4a853;
}

/* 属性点区 */
.stats-section {
  background: rgba(15, 52, 96, 0.3);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(155, 89, 182, 0.2);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stats-available b {
  color: #d4a853;
  font-size: 16px;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.stat-label {
  font-size: 14px;
  font-weight: bold;
  color: #ccc;
  width: 80px;
  flex-shrink: 0;
}

.stat-value {
  flex: 1;
  font-size: 13px;
  color: #888;
}

.btn-allocate {
  padding: 5px 14px;
  border-radius: 6px;
  border: none;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-allocate:hover {
  background: rgba(46, 204, 113, 0.3);
}

.btn-reset {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.3);
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  font-size: 13px;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: rgba(231, 76, 60, 0.2);
}

.stats-hint {
  text-align: center;
  color: #666;
  font-size: 12px;
  margin-top: 10px;
}

/* 装备选择弹窗 */
.equip-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.equip-picker {
  background: #0f172a;
  border: 1px solid rgba(212, 168, 83, 0.3);
  border-radius: 16px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  max-height: 70vh;
  overflow-y: auto;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #d4a853;
}

.picker-close {
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
}

.picker-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.picker-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(212, 168, 83, 0.2);
}

.picker-name {
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.picker-stat {
  font-size: 12px;
  color: #d4a853;
}

/* 专精技能区 */
.skill-section {
  background: rgba(15, 52, 96, 0.3);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(46, 204, 113, 0.2);
}

/* 称号卡片 */
.title-section {
  margin-top: 8px;
}

.title-card {
  background: linear-gradient(135deg, rgba(212, 168, 83, 0.08), rgba(212, 168, 83, 0.02));
  border: 1px solid rgba(212, 168, 83, 0.15);
  border-radius: 12px;
  padding: 12px 14px;
}

.title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.title-era {
  font-size: 12px;
  color: #888;
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 4px;
}

.title-field-name {
  font-size: 12px;
  color: #d4a853;
}

.title-dot {
  color: #555;
}

.title-star {
  font-size: 14px;
}

.title-name {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
  text-shadow: 0 0 8px rgba(212, 168, 83, 0.3);
}

.title-bio {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
  margin-bottom: 8px;
}

.title-achievements {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.title-ach-item {
  font-size: 11px;
  color: #7d7d7d;
  padding-left: 4px;
}
</style>
