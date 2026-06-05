<template>
  <div class="farm-container">
    <div class="farm-header">
      <h2>🐾 怪物农场</h2>
      <div class="farm-header-actions">
        <button v-if="!fusionMode" @click="enterFusionMode" class="farm-btn farm-btn-fuse">🔀 融合进化</button>
        <button v-else @click="exitFusionMode" class="farm-btn farm-btn-cancel">取消融合</button>
      </div>
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
        :class="{ 
          following: isFollowing(m),
          'fusion-selected': fusionMode && fusionSelected.includes(i),
          'fusion-valid': fusionMode && !fusionSelected.includes(i) && canSelectForFusion(i),
          'fusion-invalid': fusionMode && fusionSelected.length >= 2 && !fusionSelected.includes(i)
        }"
        @click="fusionMode && toggleFusionSelect(i)"
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

    <!-- 融合面板 -->
    <div v-if="fusionMode && fusionSelected.length === 2" class="fusion-panel">
      <div class="fusion-title">🔀 融合预览</div>
      <div class="fusion-preview">
        <div class="fusion-parents">
          <div class="fusion-pet-card">
            <span class="fusion-pet-icon">{{ store.farm[fusionSelected[0]]?.icon }}</span>
            <div class="fusion-pet-name">{{ store.farm[fusionSelected[0]]?.name }}</div>
            <div class="fusion-pet-rarity">{{ rarityLabel(store.farm[fusionSelected[0]]?.rarity) }}</div>
          </div>
          <span class="fusion-plus">+</span>
          <div class="fusion-pet-card">
            <span class="fusion-pet-icon">{{ store.farm[fusionSelected[1]]?.icon }}</span>
            <div class="fusion-pet-name">{{ store.farm[fusionSelected[1]]?.name }}</div>
            <div class="fusion-pet-rarity">{{ rarityLabel(store.farm[fusionSelected[1]]?.rarity) }}</div>
          </div>
        </div>
        <div class="fusion-arrow">⬇</div>
        <div class="fusion-result-card">
          <span class="fusion-result-icon">{{ fusionPreview?.icon }}</span>
          <div class="fusion-result-name">{{ fusionPreview?.name }}</div>
          <div class="fusion-result-rarity">{{ rarityLabel(fusionPreview?.rarity) }}</div>
          <div class="fusion-result-stats">HP+{{ fusionPreview?.baseHp }} 攻+{{ fusionPreview?.baseAtk }} 防+{{ fusionPreview?.baseDef }}</div>
          <div v-if="fusionPreview?.passiveSkill" class="fusion-skill">✨ {{ fusionPreview.passiveSkill.name }}：{{ fusionPreview.passiveSkill.desc }}</div>
        </div>
      </div>
      <div class="fusion-cost">💰 需要 {{ fuseCost }} 金币（当前 {{ store.gold }}）</div>
      <div class="fusion-actions">
        <button @click="doFusion" class="farm-btn farm-btn-fuse-confirm" :disabled="store.gold < fuseCost">
          ✅ 确认融合
        </button>
        <button @click="resetFusion" class="farm-btn farm-btn-cancel">重新选择</button>
      </div>
    </div>

    <!-- 融合成功弹窗 -->
    <div v-if="fusionResult" class="fusion-result-overlay" @click.self="closeFusionResult">
      <div class="fusion-result-modal">
        <div class="fusion-result-title">🎉 融合成功！</div>
        <div class="fusion-result-display">
          <span class="fusion-result-big-icon">{{ fusionResult.icon }}</span>
          <div class="fusion-result-big-name">{{ fusionResult.name }}</div>
          <div :class="'rarity-tag big ' + fusionResult.rarity">{{ rarityLabel(fusionResult.rarity) }}</div>
          <div class="fusion-result-stats-big">生命 {{ fusionResult.baseHp }} 攻击 {{ fusionResult.baseAtk }} 防御 {{ fusionResult.baseDef }}</div>
          <div class="fusion-result-ability">{{ fusionResult.ability?.desc }}</div>
          <div v-if="fusionResult.passiveSkill" class="fusion-result-skill">✨ {{ fusionResult.passiveSkill.desc }}</div>
        </div>
        <button @click="closeFusionResult" class="farm-btn farm-btn-ok">太好了！</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { DUNGEON_ELEMENTS, FUSE_RULES, fusePets } from '../data/farm.js'

const store = useGameStore()

const fusionMode = ref(false)
const fusionSelected = ref([])
const fusionResult = ref(null)

const fuseCost = computed(() => {
  if (fusionSelected.value.length < 2) return 0
  const pet = store.farm[fusionSelected.value[0]]
  if (!pet) return 0
  const rule = FUSE_RULES[pet.rarity]
  return rule?.cost || 0
})

const fusionPreview = computed(() => {
  if (fusionSelected.value.length < 2) return null
  const pet1 = store.farm[fusionSelected.value[0]]
  const pet2 = store.farm[fusionSelected.value[1]]
  if (!pet1 || !pet2) return null
  const result = fusePets(pet1, pet2)
  return result?.error ? null : result
})

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

// ===== 融合进化 =====
function rarityLabel(r) {
  const map = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' }
  return map[r] || '普通'
}

function canSelectForFusion(idx) {
  if (!fusionMode.value || fusionSelected.value.includes(idx)) return false
  if (fusionSelected.value.length >= 2) return false
  const pet = store.farm[idx]
  if (!pet) return false
  const rule = FUSE_RULES[pet.rarity]
  if (!rule) return false
  // 如果已经选了一个，第二个必须同稀有度和同元素
  if (fusionSelected.value.length === 1) {
    const first = store.farm[fusionSelected.value[0]]
    return first.rarity === pet.rarity && first.element === pet.element
  }
  return true
}

function toggleFusionSelect(idx) {
  if (fusionSelected.value.includes(idx)) {
    fusionSelected.value = fusionSelected.value.filter(i => i !== idx)
  } else if (fusionSelected.value.length < 2) {
    fusionSelected.value.push(idx)
  }
}

function enterFusionMode() {
  fusionMode.value = true
  fusionSelected.value = []
  fusionResult.value = null
}

function exitFusionMode() {
  fusionMode.value = false
  fusionSelected.value = []
  fusionResult.value = null
}

function resetFusion() {
  fusionSelected.value = []
}

function doFusion() {
  if (fusionSelected.value.length < 2) return
  const result = store.executeFusion(fusionSelected.value[0], fusionSelected.value[1])
  if (result.error) {
    alert(result.error)
    return
  }
  if (result.success) {
    fusionResult.value = result.result
    fusionSelected.value = []
  }
}

function closeFusionResult() {
  fusionResult.value = null
  fusionMode.value = false
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

/* ===== 融合进化样式 ===== */
.farm-header-actions {
  margin-top: 8px;
}

.farm-btn-fuse {
  background: linear-gradient(135deg, rgba(155,89,182,0.3), rgba(142,68,173,0.3));
  color: #af7ac5;
  border: 1px solid rgba(155,89,182,0.3);
  width: 100%;
}
.farm-btn-fuse:hover {
  background: linear-gradient(135deg, rgba(155,89,182,0.5), rgba(142,68,173,0.5));
}

.farm-card.fusion-selected {
  border-color: #9b59b6 !important;
  box-shadow: 0 0 12px rgba(155,89,182,0.4);
  transform: scale(1.03);
}
.farm-card.fusion-valid {
  cursor: pointer;
  border-color: rgba(155,89,182,0.3);
}
.farm-card.fusion-valid:hover {
  border-color: rgba(155,89,182,0.6);
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
.rarity-tag.rare { background: rgba(52,152,219,0.25); color: #5dade2; }
.rarity-tag.epic { background: rgba(155,89,182,0.25); color: #af7ac5; }
.rarity-tag.legendary { background: rgba(241,196,15,0.25); color: #f1c40f; }
.rarity-tag.big { padding: 3px 12px; font-size: 13px; }

.fusion-panel {
  margin-top: 16px;
  background: rgba(15,52,96,0.4);
  border: 1px solid rgba(155,89,182,0.3);
  border-radius: 14px;
  padding: 16px;
}
.fusion-title {
  text-align: center;
  font-size: 15px;
  font-weight: bold;
  color: #af7ac5;
  margin-bottom: 12px;
}
.fusion-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.fusion-parents {
  display: flex;
  align-items: center;
  gap: 12px;
}
.fusion-pet-card {
  text-align: center;
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 100px;
}
.fusion-pet-icon { font-size: 28px; display: block; }
.fusion-pet-name { font-size: 12px; color: #ccc; margin-top: 4px; }
.fusion-pet-rarity { font-size: 10px; color: #888; }
.fusion-plus { font-size: 22px; color: #9b59b6; font-weight: bold; }
.fusion-arrow { font-size: 20px; color: #9b59b6; }
.fusion-result-card {
  text-align: center;
  background: linear-gradient(135deg, rgba(155,89,182,0.15), rgba(142,68,173,0.15));
  border: 1px solid rgba(155,89,182,0.3);
  border-radius: 12px;
  padding: 14px 20px;
  min-width: 160px;
}
.fusion-result-icon { font-size: 32px; display: block; }
.fusion-result-name { font-size: 14px; font-weight: bold; color: #d4a853; margin-top: 4px; }
.fusion-result-rarity { font-size: 11px; }
.fusion-result-stats { font-size: 11px; color: #aaa; margin-top: 2px; }
.fusion-skill { font-size: 11px; color: #f1c40f; margin-top: 4px; }

.fusion-cost {
  text-align: center;
  font-size: 13px;
  color: #d4a853;
  margin: 10px 0;
}
.fusion-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.farm-btn-fuse-confirm {
  background: linear-gradient(135deg, rgba(155,89,182,0.4), rgba(142,68,173,0.4));
  color: #c39bd3;
  border: 1px solid rgba(155,89,182,0.4);
  font-weight: bold;
}
.farm-btn-fuse-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.farm-btn-cancel {
  background: rgba(102,102,102,0.3);
  color: #999;
  border: 1px solid rgba(102,102,102,0.2);
}

/* 融合结果弹窗 */
.fusion-result-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.fusion-result-modal {
  background: #1a1a2e;
  border: 2px solid rgba(212,168,83,0.4);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  animation: fusion-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes fusion-pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.fusion-result-title {
  font-size: 22px;
  font-weight: bold;
  color: #f1c40f;
  margin-bottom: 16px;
}
.fusion-result-big-icon { font-size: 48px; display: block; margin-bottom: 8px; }
.fusion-result-big-name { font-size: 18px; font-weight: bold; color: #d4a853; }
.fusion-result-stats-big { font-size: 13px; color: #ccc; margin: 6px 0; }
.fusion-result-ability { font-size: 12px; color: #4ecdc4; margin: 4px 0; }
.fusion-result-skill { font-size: 12px; color: #f1c40f; margin: 4px 0; }
.farm-btn-ok {
  margin-top: 16px;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  font-weight: bold;
  border: none;
  padding: 10px 30px;
  border-radius: 20px;
  cursor: pointer;
}
</style>
