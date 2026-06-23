<template>
  <div class="farm-header">
    <h2 class="farm-title">🐾 怪物农场</h2>
    <div class="farm-header-actions">
      <button v-if="!fusionMode" type="button" class="farm-btn farm-btn-fuse" @click="$emit('enterFusion')">
        🔀 融合进化
      </button>
      <button v-else type="button" class="farm-btn farm-btn-cancel" @click="$emit('exitFusion')">取消融合</button>
    </div>
    <div class="farm-active-box">
      <template v-if="activeMonster">
        <span class="farm-active-label">当前跟随：</span>
        <span class="farm-active-monster">{{ activeMonster.icon }}</span>
        <div class="farm-active-info">
          <div class="farm-active-name">{{ activeMonster.name }} Lv.{{ activeMonster.level }}</div>
          <div class="element-badge" :style="{ background: elementColor }">
            {{ elementInfo?.icon }} {{ elementInfo?.name }}
          </div>
          <div class="ability-desc">{{ activeMonster.ability?.desc }}</div>
        </div>
      </template>
      <span v-else class="farm-active-label">当前没有跟随的怪物</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DUNGEON_ELEMENTS } from '../../data/farm.ts'

const props = defineProps({
  activeMonster: { type: Object, default: null },
  fusionMode: { type: Boolean, default: false },
})

defineEmits(['enterFusion', 'exitFusion'])

const elementInfo = computed(() => {
  if (!props.activeMonster) return null
  return DUNGEON_ELEMENTS[props.activeMonster.element]
})

const elementColor = computed(() => elementInfo.value?.color || '#3498db')
</script>

<style scoped>
.farm-header {
  margin-bottom: 20px;
}

.farm-header .farm-title {
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

.farm-header-actions {
  margin-top: 8px;
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

.farm-btn-fuse {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.3), rgba(142, 68, 173, 0.3));
  color: #af7ac5;
  border: 1px solid rgba(155, 89, 182, 0.3);
  width: 100%;
}
.farm-btn-fuse:hover {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.5), rgba(142, 68, 173, 0.5));
}

.farm-btn-cancel {
  background: rgba(102, 102, 102, 0.3);
  color: #999;
  border: 1px solid rgba(102, 102, 102, 0.2);
  width: 100%;
}
</style>
