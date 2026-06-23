<template>
  <div class="farm-grid">
    <div
      v-for="(m, i) in farm"
      :key="m.name + m.capturedAt"
      class="farm-card"
      :class="{
        following: isFollowing(m),
        'fusion-selected': fusionMode && fusionSelected.includes(i),
        'fusion-valid': fusionMode && !fusionSelected.includes(i) && canSelectForFusion(i),
        'fusion-invalid': fusionMode && fusionSelected.length >= 2 && !fusionSelected.includes(i),
      }"
      @click="fusionMode && $emit('toggleFusionSelect', i)"
    >
      <span class="farm-monster-icon">{{ m.icon }}</span>
      <span v-if="m.rarity && m.rarity !== 'common'" :class="'rarity-tag ' + m.rarity">{{ rarityLabel(m.rarity) }}</span>
      <div class="farm-monster-name">{{ m.name }}</div>
      <div class="farm-monster-lv">Lv.{{ m.level }}</div>
      <div class="element-badge" :style="{ background: getElementColor(m.element) }">
        {{ getElementInfo(m.element)?.icon }} {{ getElementInfo(m.element)?.name }}
      </div>
      <div class="exp-bar">
        <div class="exp-text">EXP {{ m.exp }}/{{ m.maxExp }}</div>
        <div class="exp-track">
          <div class="exp-fill" :style="{ width: (m.exp / m.maxExp) * 100 + '%' }"></div>
        </div>
      </div>
      <div class="farm-ability-box">
        <div class="farm-ability-title">能力加成</div>
        <div class="farm-ability-item">{{ m.ability?.desc }}</div>
      </div>
      <div class="farm-btn-group">
        <button
          type="button"
          class="farm-btn farm-btn-follow"
          :class="{ active: isFollowing(m) }"
          @click="$emit('toggleFollow', i)"
        >
          {{ isFollowing(m) ? '取消跟随' : '设为跟随' }}
        </button>
        <button type="button" class="farm-btn farm-btn-upgrade" @click="$emit('upgrade', i)">升级</button>
        <button type="button" class="farm-btn farm-btn-release" @click="$emit('release', i)">放生</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DUNGEON_ELEMENTS, FUSE_RULES } from '../../data/farm.ts'

const props = defineProps({
  farm: { type: Array, required: true },
  fusionMode: { type: Boolean, default: false },
  fusionSelected: { type: Array, default: () => [] },
  activeMonsterName: { type: String, default: '' },
})

defineEmits(['toggleFollow', 'upgrade', 'release', 'toggleFusionSelect'])

function isFollowing(m) {
  return props.activeMonsterName === m.name
}

function getElementInfo(element) {
  return DUNGEON_ELEMENTS[element]
}

function getElementColor(element) {
  return DUNGEON_ELEMENTS[element]?.color || '#3498db'
}

function rarityLabel(r) {
  const map = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' }
  return map[r] || '普通'
}

function canSelectForFusion(idx) {
  if (!props.fusionMode || props.fusionSelected.includes(idx)) return false
  if (props.fusionSelected.length >= 2) return false
  const pet = props.farm[idx]
  if (!pet) return false
  const rule = FUSE_RULES[pet.rarity]
  if (!rule) return false
  if (props.fusionSelected.length === 1) {
    const first = props.farm[props.fusionSelected[0]]
    return first.rarity === pet.rarity && first.element === pet.element
  }
  return true
}
</script>

<style scoped>
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

.element-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #fff;
  width: fit-content;
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

.farm-card.fusion-selected {
  border-color: #9b59b6 !important;
  box-shadow: 0 0 12px rgba(155, 89, 182, 0.4);
  transform: scale(1.03);
}
.farm-card.fusion-valid {
  cursor: pointer;
  border-color: rgba(155, 89, 182, 0.3);
}
.farm-card.fusion-valid:hover {
  border-color: rgba(155, 89, 182, 0.6);
}
.farm-card.fusion-invalid {
  opacity: 0.4;
}

.rarity-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 4px;
  vertical-align: middle;
}
.rarity-tag.rare {
  background: rgba(52, 152, 219, 0.25);
  color: #5dade2;
}
.rarity-tag.epic {
  background: rgba(155, 89, 182, 0.25);
  color: #af7ac5;
}
.rarity-tag.legendary {
  background: rgba(241, 196, 15, 0.25);
  color: #f1c40f;
}

@media (max-width: 360px) {
  .farm-grid {
    grid-template-columns: 1fr;
  }
}
</style>
