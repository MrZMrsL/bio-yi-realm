<template>
  <div v-if="result" class="fusion-result-overlay" @click.self="$emit('close')">
    <div class="fusion-result-modal">
      <div class="fusion-result-title">🎉 融合成功！</div>
      <div class="fusion-result-display">
        <span class="fusion-result-big-icon">{{ result.icon }}</span>
        <div class="fusion-result-big-name">{{ result.name }}</div>
        <div :class="'rarity-tag big ' + result.rarity">{{ rarityLabel(result.rarity) }}</div>
        <div class="fusion-result-stats-big">
          生命 {{ result.baseHp }} 攻击 {{ result.baseAtk }} 防御 {{ result.baseDef }}
        </div>
        <div class="fusion-result-ability">{{ result.ability?.desc }}</div>
        <div v-if="result.passiveSkill" class="fusion-result-skill">
          ✨ {{ result.passiveSkill.desc }}
        </div>
      </div>
      <button type="button" class="farm-btn-ok" @click="$emit('close')">太好了！</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  result: { type: Object, default: null },
})

defineEmits(['close'])

function rarityLabel(r) {
  const map = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' }
  return map[r] || '普通'
}
</script>

<style scoped>
.fusion-result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.fusion-result-modal {
  background: #1a1a2e;
  border: 2px solid rgba(212, 168, 83, 0.4);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  animation: fusion-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes fusion-pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.fusion-result-title {
  font-size: 22px;
  font-weight: bold;
  color: #f1c40f;
  margin-bottom: 16px;
}
.fusion-result-big-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}
.fusion-result-big-name {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
}
.fusion-result-stats-big {
  font-size: 13px;
  color: #ccc;
  margin: 6px 0;
}
.fusion-result-ability {
  font-size: 12px;
  color: #4ecdc4;
  margin: 4px 0;
}
.fusion-result-skill {
  font-size: 12px;
  color: #f1c40f;
  margin: 4px 0;
}
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
.rarity-tag.big {
  padding: 3px 12px;
  font-size: 13px;
}
</style>
