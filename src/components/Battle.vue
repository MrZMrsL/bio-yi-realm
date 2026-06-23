<template>
  <div
    ref="battleContainerRef"
    class="battle-container"
    :class="{
      'screen-shake': store.comboActive,
      'boss-warning': isBossWarning,
    }"
  >
    <!-- 连击计数器 -->
    <div v-if="store.comboCount > 0" class="combo-counter" :class="{ 'critical-flash': store.comboCount >= 3 }">
      <span v-if="store.comboCount >= 3" class="combo-icon critical">⚡</span>
      <span v-else-if="store.comboCount === 2" class="combo-icon">🔥</span>
      <span v-else class="combo-icon">🔥</span>
      <span v-if="store.comboCount >= 3" class="combo-text critical">CRITICAL!</span>
      <span v-else-if="store.comboCount === 2" class="combo-text">x2</span>
      <span v-else class="combo-text">x1</span>
    </div>

    <!-- 暴击特效覆盖层（Canvas 粒子驱动） -->
    <div v-if="store.comboActive" class="critical-overlay">
      <div class="critical-overlay-text">⚡ 知识三连击！伤害×3！</div>
    </div>

    <BattleHeader />
    <Battlefield
      ref="battlefieldRef"
      :player-ghost-hp-percent="playerGhostHpPercent"
      :enemy-ghost-hp-percent="enemyGhostHpPercent"
    />
    <BattleLogPanel />
    <BattleActionPanel
      @start-answer="startAnswer"
      @next-battle="nextBattle"
      @revive="revive"
      @start-legendary-boss="startLegendaryBoss"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '../stores/game.ts'
import { useGuideStore } from '../stores/guideStore.ts'
import { sfxClick } from '../utils/sfx.ts'
import { useParticleSystem } from '../composables/useParticleSystem.js'
import { showFloatingDamage, showHealNumber } from '../composables/useFloatingDamage.js'
import BattleHeader from './battle/BattleHeader.vue'
import Battlefield from './battle/Battlefield.vue'
import BattleLogPanel from './battle/BattleLogPanel.vue'
import BattleActionPanel from './battle/BattleActionPanel.vue'

const store = useGameStore()
const guideStore = useGuideStore()

// ===== 粒子系统 =====
const ps = useParticleSystem()
const battleContainerRef = ref(null)
const battlefieldRef = ref(null)

// ===== 幽灵血条追踪 =====
const playerGhostHpPercent = ref(100)
const enemyGhostHpPercent = ref(100)

// ===== 血条颜色 =====
const isBossWarning = computed(() => {
  return store.gameMode === 'weekly_boss' && store.weeklyBossTimeLeft !== null && store.weeklyBossTimeLeft <= 10
})

// ===== 幽灵血条 =====
// 玩家受伤时，幽灵血条保存旧值，2秒内缓慢追赶
watch(
  () => store.hp,
  (newHp, oldHp) => {
    if (oldHp === undefined || oldHp === null) {
      playerGhostHpPercent.value = store.hpPercent
      return
    }
    const bfEl = battlefieldRef.value?.$el
    if (newHp < oldHp) {
      // 受伤：幽灵血条停留在旧位置，实际血条跳变
      const damage = oldHp - newHp
      playerGhostHpPercent.value = (oldHp / store.maxHp) * 100
      // 幽灵血条在 1.5s 内追赶到新位置
      setTimeout(() => {
        playerGhostHpPercent.value = (newHp / store.maxHp) * 100
      }, 100)

      // 玩家受伤数字（红色）
      if (bfEl && damage > 0) {
        showFloatingDamage(bfEl, damage, {
          x: 25,
          y: 45,
          isCritical: false,
          color: '#e74c3c',
        })
      }
    } else if (newHp > oldHp) {
      // 回血：同时刷新
      const heal = newHp - oldHp
      playerGhostHpPercent.value = (newHp / store.maxHp) * 100
      if (bfEl && heal > 0) {
        showHealNumber(bfEl, heal, {
          x: 25,
          y: 45,
        })
      }
    }
  }
)

// 敌人受伤追踪 + 伤害数字显示
watch(
  () => store.enemy?.hp,
  (newHp, oldHp) => {
    if (newHp === undefined || oldHp === undefined || oldHp === null) return
    const bfEl = battlefieldRef.value?.$el
    if (newHp < oldHp) {
      const damage = oldHp - newHp
      enemyGhostHpPercent.value = (oldHp / store.enemy.maxHp) * 100
      setTimeout(() => {
        enemyGhostHpPercent.value = (newHp / store.enemy.maxHp) * 100
      }, 100)

      // 显示伤害数字
      if (bfEl && damage > 0) {
        const isCrit = store.comboActive
        const subjectColor =
          store.enemy?.subjectLabel === '化学'
            ? '#e74c3c'
            : store.enemy?.subjectLabel === '生物'
              ? '#2ecc71'
              : store.enemy?.subjectLabel === '易学'
                ? '#9b59b6'
                : '#f1c40f'
        showFloatingDamage(bfEl, damage, {
          x: 75,
          y: 35,
          isCritical: isCrit,
          label: isCrit ? '暴击！' : '',
          color: isCrit ? '#f1c40f' : subjectColor,
        })
      }
    } else if (newHp > oldHp) {
      // Boss回血
      const heal = newHp - oldHp
      enemyGhostHpPercent.value = (newHp / store.enemy.maxHp) * 100
      if (bfEl && heal > 0) {
        showHealNumber(bfEl, heal, {
          x: 75,
          y: 35,
        })
      }
    }
  }
)

// ===== 粒子 + 伤害数字触发 =====
// comboActive → 暴击粒子爆发 + 伤害数字
watch(
  () => store.comboActive,
  active => {
    if (!active || !battlefieldRef.value) return

    const bf = battlefieldRef.value.$el
    const cx = bf.clientWidth / 2
    const cy = bf.clientHeight / 2

    // 粒子爆发
    ps.emitBurst(cx, cy, 50, ['#f1c40f', '#e67e22', '#f39c12', '#fff'], {
      speedMin: 3,
      speedMax: 10,
      sizeMin: 3,
      sizeMax: 9,
      life: 1.0,
      gravity: 150,
    })

    // 飘浮粒子环绕
    nextTick(() => {
      ps.emitFloat(cx - 60, cy - 40, 8, ['#f1c40f', '#fff'], { life: 0.8 })
      ps.emitFloat(cx + 60, cy - 40, 8, ['#f1c40f', '#fff'], { life: 0.8 })
    })
  }
)

// 限时Boss倒计时 ≤ 10s → 屏幕火花
watch(
  () => store.weeklyBossTimeLeft,
  t => {
    if (t !== undefined && t <= 10 && t > 0 && ps) {
      ps.emitScreenSparks(['#e74c3c', '#f39c12'], 8)
    }
  }
)

// ===== 生命周期 =====
onMounted(() => {
  // 首次进入战斗时展示战斗基础引导与道具卡引导
  guideStore.showStep('battle-basics')
  guideStore.showStep('battle-cards')

  // #ifdef H5
  window.addEventListener('keydown', handleKeydown)
  // #endif
  nextTick(() => {
    if (battleContainerRef.value) {
      ps.init(battleContainerRef.value)
      // 初始化幽灵血条
      playerGhostHpPercent.value = store.hpPercent
      if (store.enemy) {
        enemyGhostHpPercent.value = (store.enemy.hp / store.enemy.maxHp) * 100
      }
    }
  })
})

onUnmounted(() => {
  ps.destroy()
  // #ifdef H5
  window.removeEventListener('keydown', handleKeydown)
  // #endif
})

function handleKeydown(e) {
  if (store.battleState === 'answering' && store.question?.options) {
    const key = e.key
    if (key >= '1' && key <= '4') {
      const idx = parseInt(key, 10) - 1
      if (idx < store.question.options.length) {
        e.preventDefault()
        submitAnswer(idx)
      }
    }
  } else if (store.battleState === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault()
    startAnswer()
  }
}

function startAnswer() {
  sfxClick()
  store.startAnswer()
}

function submitAnswer(index) {
  sfxClick()
  const correct = index === store.question?.answer
  if (store.gameMode === 'weekly_boss') {
    store.weeklyBossAnswerAttack(correct)
  } else {
    store.answerAttack(correct)
  }
}

function nextBattle() {
  sfxClick()
  // 限时Boss
  if (store.gameMode === 'weekly_boss') {
    store.exitWeeklyBoss()
    return
  }

  // 地牢模式：根据战斗结果返回房间
  if (store.dungeonPhase === 'battle' || store.dungeonPhase === 'rooms') {
    if (store.battleState === 'fled') {
      store.finishRoom(false)
    } else if (store.battleState === 'won') {
      store.finishRoom(true)
    } else {
      store.exitBattle()
    }
    return
  }
}

function revive() {
  sfxClick()
  store.revive()
}

function startLegendaryBoss() {
  sfxClick()
  store.setIdle()
}
</script>

<style scoped>
.combo-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
  animation: combo-pop 0.3s ease-out;
}

.combo-icon {
  font-size: 20px;
}

.combo-icon.critical {
  font-size: 28px;
  animation: flash 0.5s ease-in-out infinite;
}

.combo-text {
  font-size: 14px;
  font-weight: bold;
  color: #e74c3c;
}

.combo-text.critical {
  font-size: 18px;
  color: #f1c40f;
  text-shadow: 0 0 10px rgba(241, 196, 15, 0.6);
}

.combo-counter.critical-flash {
  animation: critical-flash 0.5s ease-in-out infinite;
}

.screen-shake {
  animation: screen-shake 0.5s ease-in-out;
}

.critical-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: fade-in-out 1.5s ease-in-out;
  pointer-events: none;
}

.critical-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 60%);
  animation: white-flash 0.4s ease-out;
  pointer-events: none;
}

.critical-overlay-text {
  font-size: 32px;
  font-weight: bold;
  color: #f1c40f;
  text-shadow:
    0 0 20px rgba(241, 196, 15, 0.8),
    0 0 40px rgba(241, 196, 15, 0.4);
  animation:
    critical-zoom 0.5s ease-out,
    critical-pulse 0.8s ease-in-out infinite 0.5s;
  position: relative;
  z-index: 1;
}

@keyframes combo-pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes critical-flash {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(241, 196, 15, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(241, 196, 15, 0.8);
  }
}

@keyframes screen-shake {
  0%,
  100% {
    transform: translateX(0) translateY(0);
  }
  10% {
    transform: translateX(-8px) translateY(2px);
  }
  20% {
    transform: translateX(8px) translateY(-2px);
  }
  30% {
    transform: translateX(-8px) translateY(1px);
  }
  40% {
    transform: translateX(8px) translateY(-1px);
  }
  50% {
    transform: translateX(-5px) translateY(2px);
  }
  60% {
    transform: translateX(5px) translateY(-2px);
  }
  70% {
    transform: translateX(-3px) translateY(1px);
  }
  80% {
    transform: translateX(3px) translateY(-1px);
  }
  90% {
    transform: translateX(-1px) translateY(0);
  }
}

@keyframes white-flash {
  0% {
    opacity: 1;
  }
  40% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
  }
}

@keyframes critical-zoom {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes critical-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes fade-in-out {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.battle-container {
  padding: 20px;
  background: #2a2a2a;
  border-radius: 12px;
  color: #fff;
}

@media (min-width: 768px) {
  .battle-container {
    background: rgba(42, 42, 42, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
}

.boss-warning {
  box-shadow: inset 0 0 0 0 rgba(231, 76, 60, 0);
  animation: boss-warning-glow 1s ease-in-out infinite;
}

@keyframes boss-warning-glow {
  0% {
    box-shadow:
      inset 0 0 0px rgba(231, 76, 60, 0.1),
      0 0 0px rgba(231, 76, 60, 0);
  }
  50% {
    box-shadow:
      inset 0 0 30px rgba(231, 76, 60, 0.15),
      0 0 15px rgba(231, 76, 60, 0.08);
  }
  100% {
    box-shadow:
      inset 0 0 0px rgba(231, 76, 60, 0.1),
      0 0 0px rgba(231, 76, 60, 0);
  }
}

.battle-container.boss-warning {
  border-color: rgba(231, 76, 60, 0.2);
  transition: border-color 0.3s ease;
}
</style>
