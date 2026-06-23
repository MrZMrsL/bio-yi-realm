<template>
  <div class="fusion-panel">
    <div class="fusion-title">🔀 融合预览</div>
    <div class="fusion-preview">
      <div class="fusion-parents">
        <div class="fusion-pet-card">
          <span class="fusion-pet-icon">{{ parent1?.icon }}</span>
          <div class="fusion-pet-name">{{ parent1?.name }}</div>
          <div class="fusion-pet-rarity">{{ rarityLabel(parent1?.rarity) }}</div>
        </div>
        <span class="fusion-plus">+</span>
        <div class="fusion-pet-card">
          <span class="fusion-pet-icon">{{ parent2?.icon }}</span>
          <div class="fusion-pet-name">{{ parent2?.name }}</div>
          <div class="fusion-pet-rarity">{{ rarityLabel(parent2?.rarity) }}</div>
        </div>
      </div>
      <div class="fusion-arrow">⬇</div>
      <div class="fusion-result-card">
        <span class="fusion-result-icon">{{ fusionPreview?.icon }}</span>
        <div class="fusion-result-name">{{ fusionPreview?.name }}</div>
        <div class="fusion-result-rarity">{{ rarityLabel(fusionPreview?.rarity) }}</div>
        <div class="fusion-result-stats">
          HP+{{ fusionPreview?.baseHp }} 攻+{{ fusionPreview?.baseAtk }} 防+{{ fusionPreview?.baseDef }}
        </div>
        <div v-if="fusionPreview?.passiveSkill" class="fusion-skill">
          ✨ {{ fusionPreview.passiveSkill.name }}：{{ fusionPreview.passiveSkill.desc }}
        </div>
      </div>
    </div>
    <div class="fusion-cost">💰 需要 {{ fuseCost }} 金币（当前 {{ gold }}）</div>
    <div class="fusion-actions">
      <button
        type="button"
        class="farm-btn farm-btn-fuse-confirm"
        :disabled="gold < fuseCost"
        @click="$emit('confirm')"
      >
        ✅ 确认融合
      </button>
      <button type="button" class="farm-btn farm-btn-cancel" @click="$emit('reset')">重新选择</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  parent1: { type: Object, default: null },
  parent2: { type: Object, default: null },
  fusionPreview: { type: Object, default: null },
  fuseCost: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
})

defineEmits(['confirm', 'reset'])

function rarityLabel(r) {
  const map = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' }
  return map[r] || '普通'
}
</script>

<style scoped>
.fusion-panel {
  margin-top: 16px;
  background: rgba(15, 52, 96, 0.4);
  border: 1px solid rgba(155, 89, 182, 0.3);
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
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 100px;
}
.fusion-pet-icon {
  font-size: 28px;
  display: block;
}
.fusion-pet-name {
  font-size: 12px;
  color: #ccc;
  margin-top: 4px;
}
.fusion-pet-rarity {
  font-size: 10px;
  color: #888;
}
.fusion-plus {
  font-size: 22px;
  color: #9b59b6;
  font-weight: bold;
}
.fusion-arrow {
  font-size: 20px;
  color: #9b59b6;
}
.fusion-result-card {
  text-align: center;
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.15), rgba(142, 68, 173, 0.15));
  border: 1px solid rgba(155, 89, 182, 0.3);
  border-radius: 12px;
  padding: 14px 20px;
  min-width: 160px;
}
.fusion-result-icon {
  font-size: 32px;
  display: block;
}
.fusion-result-name {
  font-size: 14px;
  font-weight: bold;
  color: #d4a853;
  margin-top: 4px;
}
.fusion-result-rarity {
  font-size: 11px;
}
.fusion-result-stats {
  font-size: 11px;
  color: #aaa;
  margin-top: 2px;
}
.fusion-skill {
  font-size: 11px;
  color: #f1c40f;
  margin-top: 4px;
}

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
.farm-btn {
  flex: 1;
  padding: 6px 4px;
  font-size: 11px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.farm-btn-fuse-confirm {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.4), rgba(142, 68, 173, 0.4));
  color: #c39bd3;
  border: 1px solid rgba(155, 89, 182, 0.4);
  font-weight: bold;
}
.farm-btn-fuse-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.farm-btn-cancel {
  background: rgba(102, 102, 102, 0.3);
  color: #999;
  border: 1px solid rgba(102, 102, 102, 0.2);
}
</style>
