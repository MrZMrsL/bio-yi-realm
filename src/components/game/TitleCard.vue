<template>
  <div class="title-card">
    <div class="title-header">
      <span class="title-badge">{{ store.titleEra }}</span>
      <div class="title-name">{{ store.title }}</div>
      <div class="title-field">{{ store.titleField }}</div>
    </div>
    <div class="title-bio">{{ store.titleBio }}</div>
    <div v-if="store.titleAchievements && store.titleAchievements.length > 0" class="title-achievements">
      <h4 class="section-title">🏅 主要成就</h4>
      <div v-for="(ach, idx) in store.titleAchievements" :key="idx" class="achievement-item">
        <span class="achievement-check">✦</span>
        <span>{{ ach }}</span>
      </div>
    </div>
  </div>
  <div class="title-progress">
    <h4 class="section-title">📋 称号进度</h4>
    <div
      v-for="t in TITLE_TABLE"
      :key="t.title"
      class="progress-item"
      :class="{ current: store.level >= t.min && store.level <= t.max }"
    >
      <span class="progress-level">Lv.{{ t.min }}-{{ t.max }}</span>
      <span class="progress-name">{{ t.title }}</span>
      <span class="progress-field">{{ t.field }}</span>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../../stores/game.ts'
import { TITLE_TABLE } from '../../data/titles.ts'

const store = useGameStore()
</script>

<style scoped>
.title-card {
  background: linear-gradient(135deg, rgba(212, 168, 83, 0.1), rgba(212, 168, 83, 0.02));
  border: 1px solid rgba(212, 168, 83, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.title-header {
  text-align: center;
  margin-bottom: 16px;
}

.title-badge {
  display: inline-block;
  background: #d4a853;
  color: #1a1a2e;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.title-name {
  font-size: 22px;
  color: #e0e0e0;
  margin: 8px 0;
}

.title-field {
  font-size: 12px;
  color: #a0a0a0;
}

.title-bio {
  font-size: 13px;
  line-height: 1.6;
  color: #b0b0b0;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.title-achievements .section-title {
  color: #d4a853;
  margin-bottom: 12px;
  font-size: 14px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;
  color: #c0c0c0;
}

.achievement-check {
  color: #2ecc71;
  font-weight: bold;
}

.title-progress .section-title {
  color: #d4a853;
  margin-bottom: 12px;
  font-size: 14px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  transition: all 0.2s;
}

.progress-item.current {
  background: rgba(212, 168, 83, 0.15);
  border: 1px solid rgba(212, 168, 83, 0.3);
}

.progress-item:not(.current) {
  opacity: 0.6;
}

.progress-level {
  color: #888;
  font-size: 11px;
  min-width: 50px;
}

.progress-name {
  flex: 1;
  color: #e0e0e0;
  font-weight: bold;
}

.progress-field {
  color: #888;
  font-size: 11px;
}
</style>
