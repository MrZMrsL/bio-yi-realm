<template>
  <div ref="fieldRef" class="battlefield">
    <div class="player-side">
      <div class="player-avatar emoji-icon">🧙‍♂️</div>
      <div class="health-bar">
        <div class="hp-ghost" :style="{ width: playerGhostHpPercent + '%' }"></div>
        <div class="hp-fill" :class="hpColorClass" :style="{ width: store.hpPercent + '%' }"></div>
      </div>
      <span class="hp-text">{{ store.hp }} / {{ store.maxHp }}</span>
      <div class="stats">
        <span>⚔️{{ store.totalAtk }}</span>
        <span>🛡️{{ store.totalDef }}</span>
      </div>
      <div v-if="store.activeMonster" class="pet-info">
        <span>{{ store.activeMonster.icon }} {{ store.activeMonster.name }}</span>
        <span class="pet-bonus">{{ store.activeMonster.ability?.desc }}</span>
      </div>
    </div>

    <div class="vs" :style="{ color: store.currentSubjectTheme?.primary }">VS</div>

    <div class="enemy-side">
      <div class="enemy-avatar emoji-icon" :style="{ borderColor: store.currentSubjectTheme?.primary }">
        {{ store.enemy?.icon || store.enemy?.name?.charAt(0) || '?' }}
      </div>
      <div class="health-bar enemy-hp">
        <div
          class="hp-ghost"
          :style="{ width: enemyGhostHpPercent + '%', background: store.currentSubjectTheme?.glow }"
        ></div>
        <div
          class="hp-fill enemy-hp-fill"
          :class="enemyHpColorClass"
          :style="{
            width: (store.enemy?.hp / store.enemy?.maxHp) * 100 + '%',
            background: enemyHpGradient,
          }"
        ></div>
      </div>
      <span class="hp-text">{{ store.enemy?.hp }} / {{ store.enemy?.maxHp }}</span>
    </div>
  </div>

  <!-- 限时Boss倒计时进度条 -->
  <div v-if="store.gameMode === 'weekly_boss' && store.weeklyBossTimeLeft > 0" class="timer-bar-container">
    <div class="timer-bar-label">⏱️ {{ store.weeklyBossTimeLeft }} 秒</div>
    <div class="timer-bar-track">
      <div
        class="timer-bar-fill"
        :style="{ width: (store.weeklyBossTimeLeft / (store.weeklyBossData?.timeLimit || 60)) * 100 + '%' }"
        :class="{ danger: store.weeklyBossTimeLeft <= 10 }"
      ></div>
    </div>
  </div>

  <!-- Boss技能显示 -->
  <div
    v-if="store.enemy?.skills && store.enemy.skills.length > 0 && store.gameMode === 'weekly_boss'"
    class="boss-skills"
  >
    <div v-for="skill in store.enemy.skills" :key="skill.name" class="boss-skill-tag">
      ⚡ {{ skill.name }}：{{ skill.desc }}
    </div>
    <div v-if="store.weeklyBossSkillUsed.length > 0" class="boss-skill-active">
      <div v-for="skill in store.weeklyBossSkillUsed" :key="skill.name" class="skill-activated">
        🔥 {{ skill.name }} 已激活！
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '../../stores/game.ts'

const store = useGameStore()
const fieldRef = ref(null)

defineProps({
  playerGhostHpPercent: { type: Number, default: 100 },
  enemyGhostHpPercent: { type: Number, default: 100 },
})

defineExpose({
  fieldRef,
})

const hpColorClass = computed(() => {
  const pct = store.hpPercent
  if (pct <= 20) return 'hp-danger'
  if (pct <= 50) return 'hp-warning'
  return 'hp-healthy'
})

const enemyHpColorClass = computed(() => {
  if (!store.enemy) return ''
  const pct = (store.enemy.hp / store.enemy.maxHp) * 100
  if (pct <= 20) return 'hp-danger'
  if (pct <= 50) return 'hp-warning'
  return 'hp-healthy'
})

const enemyHpGradient = computed(() => {
  if (!store.currentSubjectTheme) return 'linear-gradient(90deg, #ff6b6b, #c0392b)'
  const t = store.currentSubjectTheme
  return `linear-gradient(90deg, ${t.hp}, ${t.hpDark})`
})
</script>

<style scoped>
.battlefield {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #1a1a1a;
  border-radius: 8px;
  margin-bottom: 20px;
}

.player-side,
.enemy-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.player-avatar,
.enemy-avatar {
  font-size: 3em;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333;
  border-radius: 50%;
  border: 3px solid #4ecdc4;
}

.enemy-avatar {
  border-color: #ff6b6b;
}

.vs {
  font-size: 2em;
  font-weight: bold;
  color: #ff6b6b;
}

.health-bar {
  width: 150px;
  height: 12px;
  background: #333;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.hp-ghost {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(78, 205, 196, 0.2);
  border-radius: 6px;
  transition: width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  pointer-events: none;
}

.enemy-hp .hp-ghost {
  background: rgba(255, 107, 107, 0.2);
}

.hp-fill {
  position: relative;
  height: 100%;
  border-radius: 6px;
  transition:
    width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    background 0.5s ease;
  z-index: 1;
}

.hp-healthy {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
}

.hp-warning {
  background: linear-gradient(90deg, #f39c12, #e67e22);
}

.hp-danger {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
  animation: hp-danger-pulse 0.8s ease-in-out infinite;
}

.enemy-hp-fill.hp-warning {
  background: linear-gradient(90deg, #f39c12, #e67e22) !important;
}

.enemy-hp-fill.hp-danger {
  background: linear-gradient(90deg, #e74c3c, #c0392b) !important;
  animation: hp-danger-pulse 0.8s ease-in-out infinite;
}

@keyframes hp-danger-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.hp-text {
  font-size: 0.8em;
  color: #aaa;
}

.stats {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
}

.pet-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75em;
  color: #d4a853;
  margin-top: 4px;
}

.pet-bonus {
  color: #888;
  font-size: 0.85em;
}

.timer-bar-container {
  margin-bottom: 16px;
}

.timer-bar-label {
  text-align: center;
  font-size: 14px;
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 6px;
}

.timer-bar-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.timer-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2ecc71, #f1c40f);
  border-radius: 4px;
  transition: width 0.3s linear;
}

.timer-bar-fill.danger {
  background: linear-gradient(90deg, #f39c12, #e74c3c);
  animation: pulse-danger 0.5s ease-in-out infinite;
}

@keyframes pulse-danger {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.boss-skills {
  background: rgba(231, 76, 60, 0.15);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.boss-skill-tag {
  font-size: 12px;
  color: #e74c3c;
}

.boss-skill-active {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px dashed rgba(231, 76, 60, 0.3);
}

.skill-activated {
  font-size: 13px;
  color: #f39c12;
  font-weight: bold;
  animation: pulse 0.8s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
