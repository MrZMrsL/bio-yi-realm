<template>
  <div class="dungeon-rooms">
    <div class="rooms-header">
      <div class="rooms-title">🏰 第 {{ floor }} 层 - 选择房间</div>
      <div class="rooms-progress">{{ clearedRoomsThisFloor }} / 9 已清空</div>
      <div v-if="allClearCount > 0" class="rooms-achievement">🏆 我全都要：{{ allClearCount }}/10</div>
    </div>
    <div class="rooms-grid">
      <div
        v-for="room in roomGrid"
        :key="room.index"
        class="room-card"
        :class="{
          cleared: room.cleared,
          boss: room.isBoss,
          clickable: !room.cleared && !inBattle,
        }"
        @click="!room.cleared && !inBattle && $emit('enterRoom', room.index)"
      >
        <div class="room-number">{{ room.index + 1 }}</div>
        <div v-if="!room.cleared" class="room-enemy">
          <span class="room-icon">{{ room.isBoss ? '👹' : room.enemyPreview.icon }}</span>
          <span class="room-name">{{ room.enemyPreview.name }}</span>
          <span class="room-subject" :style="{ background: room.enemyPreview.elementColor }">{{
            room.enemyPreview.subjectLabel
          }}</span>
          <span class="room-stats">⚔️{{ room.enemyPreview.atk }} 🛡️{{ room.enemyPreview.def }}</span>
        </div>
        <div v-else class="room-cleared">
          <span class="cleared-icon">✅</span>
          <span>已清空</span>
        </div>
        <div v-if="room.isBoss" class="room-boss-tag">BOSS</div>
      </div>
    </div>
    <div class="rooms-actions">
      <button
        type="button"
        class="btn-next-floor"
        :class="{ 'all-clear': clearedRoomsThisFloor === 9 }"
        @click="$emit('nextFloor')"
      >
        {{ clearedRoomsThisFloor === 9 ? '🏆 全部清空！进入下一层' : '⬇️ 进入下一层' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  floor: { type: Number, required: true },
  roomGrid: { type: Array, required: true },
  clearedRoomsThisFloor: { type: Number, required: true },
  inBattle: { type: Boolean, default: false },
  allClearCount: { type: Number, default: 0 },
})

defineEmits(['enterRoom', 'nextFloor'])
</script>

<style scoped>
.dungeon-rooms {
  padding: 20px;
}

.rooms-header {
  text-align: center;
  margin-bottom: 16px;
}

.rooms-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
  margin-bottom: 4px;
}

.rooms-progress {
  font-size: 13px;
  color: #888;
}

.rooms-achievement {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 4px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.room-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.room-card.clickable {
  cursor: pointer;
}

.room-card.clickable:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.room-card.cleared {
  background: rgba(46, 204, 113, 0.15);
  border-color: rgba(46, 204, 113, 0.3);
  opacity: 0.7;
}

.room-card.boss {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.3);
}

.room-card.boss.clickable:hover {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.5);
}

.room-number {
  position: absolute;
  top: 4px;
  left: 8px;
  font-size: 11px;
  color: #666;
}

.room-icon {
  font-size: 28px;
  margin-top: 4px;
}

.room-name {
  font-size: 12px;
  font-weight: bold;
  color: #e0e0e0;
  text-align: center;
}

.room-subject {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}

.room-stats {
  font-size: 11px;
  color: #888;
}

.room-cleared {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #2ecc71;
  font-size: 12px;
}

.cleared-icon {
  font-size: 24px;
}

.room-boss-tag {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 9px;
  background: #e74c3c;
  color: #fff;
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: bold;
}

.rooms-actions {
  display: flex;
  justify-content: center;
}

.btn-next-floor {
  padding: 12px 24px;
  font-size: 14px;
  background: #444;
  color: #ccc;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-next-floor:hover {
  background: #555;
}

.btn-next-floor.all-clear {
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  animation: pulse-gold 1.5s infinite;
}

@keyframes pulse-gold {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(212, 168, 83, 0);
  }
}
</style>
