<template>
  <div class="pvp-battlefield">
    <!-- 玩家侧 -->
    <div class="pvp-side player-side">
      <div class="pvp-avatar emoji-icon">🧙‍♂️</div>
      <div class="pvp-name">{{ player.title }}</div>
      <div class="pvp-level">Lv.{{ player.level }}</div>
      <div class="pvp-hp-bar">
        <div class="pvp-hp-fill hp-healthy" :style="{ width: playerHpPct + '%' }"></div>
      </div>
      <span class="pvp-hp-text">{{ player.hp }} / {{ player.maxHp }}</span>
      <div class="pvp-stats">
        <span>⚔️{{ player.totalAtk }}</span>
        <span>🛡️{{ player.totalDef }}</span>
      </div>
    </div>

    <!-- VS -->
    <div class="pvp-vs">VS</div>

    <!-- 对手侧 -->
    <div class="pvp-side enemy-side">
      <div class="pvp-avatar emoji-icon opponent">⚔️</div>
      <div class="pvp-name">{{ opponent.name }}</div>
      <div class="pvp-level">Lv.{{ opponent.level }}</div>
      <div class="pvp-hp-bar">
        <div class="pvp-hp-fill enemy-hp" :style="{ width: opponentHpPct + '%' }"></div>
      </div>
      <span class="pvp-hp-text">{{ opponent.hp }} / {{ opponent.maxHp }}</span>
      <div class="pvp-stats">
        <span>⚔️{{ opponent.atk }}</span>
        <span>🛡️{{ opponent.def }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
  opponent: { type: Object, required: true },
})

const playerHpPct = computed(() => {
  return props.player.maxHp > 0 ? (props.player.hp / props.player.maxHp) * 100 : 0
})

const opponentHpPct = computed(() => {
  return props.opponent.maxHp > 0 ? (props.opponent.hp / props.opponent.maxHp) * 100 : 0
})
</script>

<style scoped>
.pvp-battlefield {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 12px;
  background: rgba(26, 26, 26, 0.8);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.pvp-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.pvp-avatar {
  font-size: 2.8em;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #222;
  border-radius: 50%;
  border: 3px solid #4ecdc4;
}

.pvp-avatar.opponent {
  border-color: #e74c3c;
}

.pvp-name {
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
  text-align: center;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pvp-level {
  font-size: 11px;
  color: #888;
}

.pvp-hp-bar {
  width: 100px;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.pvp-hp-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.pvp-hp-fill.hp-healthy {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
}

.pvp-hp-fill.enemy-hp {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.pvp-hp-text {
  font-size: 11px;
  color: #aaa;
}

.pvp-stats {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #c0c0c0;
}

.pvp-vs {
  font-size: 1.6em;
  font-weight: bold;
  color: #e74c3c;
  padding: 0 8px;
}
</style>
