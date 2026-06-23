<template>
  <div class="dungeon-intro">
    <div class="dungeon-title">🏰 第 {{ floor }} 层地牢</div>
    <p class="dungeon-desc">黑暗中的密室散发着危险的气息...</p>
    <div class="dungeon-stats-hint">
      <span>⚔️{{ totalAtk }}</span>
      <span>🛡️{{ totalDef }}</span>
      <span>❤️{{ hp }}/{{ maxHp }}</span>
    </div>
    <button type="button" class="explore-btn" @click="$emit('enter')">进入地牢</button>
  </div>
</template>

<script setup>
defineProps({
  floor: { type: Number, required: true },
  totalAtk: { type: Number, required: true },
  totalDef: { type: Number, required: true },
  hp: { type: Number, required: true },
  maxHp: { type: Number, required: true },
})

defineEmits(['enter'])
</script>

<style scoped>
.dungeon-intro {
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

.dungeon-stats-hint {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 12px 0;
  font-size: 13px;
  color: #ccc;
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
  box-shadow: 0 4px 15px rgba(212, 168, 83, 0.4);
  transition: transform 0.2s;
}

.explore-btn:hover {
  transform: translateY(-2px);
}
</style>
