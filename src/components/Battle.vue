<template>
  <div class="battle-container" ref="battleContainerRef" 
    :class="{ 
      'screen-shake': store.comboActive,
      'boss-warning': isBossWarning
    }">
    <div class="battle-header">
      <span class="floor-badge">
        <span v-if="store.gameMode === 'weekly_boss'">🔥 限时Boss</span>
        <span v-else>第 {{ store.floor }} 层</span>
      </span>
      <div class="enemy-info">
        <span class="enemy-name" :style="{ color: store.currentSubjectTheme?.light }">{{ store.enemy?.name }}</span>
        <span class="enemy-subject" :style="{ color: store.currentSubjectTheme?.primary }">[{{ store.enemy?.subjectLabel }}]</span>
        <span class="enemy-element" :style="{ background: enemyElementColor }"
          v-if="store.enemy?.elementLabel">
          {{ store.enemy?.elementLabel }}
        </span>
        <span v-if="store.gameMode === 'weekly_boss'" class="weekly-boss-tag">限时</span>
      </div>
    </div>
    
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
    
    <div class="battlefield" ref="battlefieldRef">
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
        <div class="enemy-avatar emoji-icon"
          :style="{ borderColor: store.currentSubjectTheme?.primary }"
        >{{ store.enemy?.icon || store.enemy?.name?.charAt(0) || '?' }}</div>
        <div class="health-bar enemy-hp">
          <div class="hp-ghost" :style="{ width: enemyGhostHpPercent + '%', background: store.currentSubjectTheme?.glow }"></div>
          <div class="hp-fill enemy-hp-fill" :class="enemyHpColorClass" 
            :style="{ 
              width: (store.enemy?.hp / store.enemy?.maxHp * 100) + '%',
              background: enemyHpGradient
            }"></div>
        </div>
        <span class="hp-text">{{ store.enemy?.hp }} / {{ store.enemy?.maxHp }}</span>
      </div>
    </div>
    
    <!-- 限时Boss倒计时进度条 -->
    <div v-if="store.gameMode === 'weekly_boss' && store.weeklyBossTimeLeft > 0" class="timer-bar-container">
      <div class="timer-bar-label">
        ⏱️ {{ store.weeklyBossTimeLeft }} 秒
      </div>
      <div class="timer-bar-track">
        <div 
          class="timer-bar-fill" 
          :style="{ width: ((store.weeklyBossTimeLeft / (store.weeklyBossData?.timeLimit || 60)) * 100) + '%' }"
          :class="{ danger: store.weeklyBossTimeLeft <= 10 }"
        ></div>
      </div>
    </div>

    <!-- Boss技能显示 -->
    <div v-if="store.enemy?.skills && store.enemy.skills.length > 0 && store.gameMode === 'weekly_boss'" class="boss-skills">
      <div v-for="skill in store.enemy.skills" :key="skill.name" class="boss-skill-tag">
        ⚡ {{ skill.name }}：{{ skill.desc }}
      </div>
      <div v-if="store.weeklyBossSkillUsed.length > 0" class="boss-skill-active">
        <div v-for="skill in store.weeklyBossSkillUsed" :key="skill.name" class="skill-activated">
          🔥 {{ skill.name }} 已激活！
        </div>
      </div>
    </div>

    <div class="battle-log">
      <div v-for="(msg, i) in store.battleLog" :key="i" class="log-msg">{{ msg }}</div>
    </div>
    
    <!-- 战斗操作区 -->
    <div v-if="store.battleState === 'idle'" class="battle-actions">
      <button @click="startAnswer" class="btn-answer">📚 知识攻击</button>
      <div class="action-subrow">
        <button @click="showPotionMenu" class="btn-potion">🧪 药水</button>
        <button @click="store.flee" class="btn-flee">🏃 逃跑</button>
      </div>
    </div>
    
    <!-- 答题面板 -->
    <div v-if="store.battleState === 'answering'" class="quiz-panel">
      <div v-if="store.gameMode === 'weekly_boss'" class="time-limit-hint">
        ⏱️ 限时 {{ store.weeklyBossData?.timeLimit || 30 }} 秒
      </div>
      <div class="question">{{ store.question?.q }}</div>
      <div class="options">
        <button 
          v-for="(opt, i) in store.question?.options" 
          :key="i" 
          @click="submitAnswer(i)"
          class="option-btn"
        >
          {{ opt }}
        </button>
      </div>
    </div>
    
    <!-- 药水面板 -->
    <div v-if="showPotionPanel && store.battleState === 'idle'" class="potion-panel">
      <div class="potion-list">
        <button 
          v-for="item in store.consumables" 
          :key="item.id"
          @click="usePotion(item.id)"
          class="potion-btn"
        >
          {{ item.icon }} {{ item.name }}
        </button>
        <button v-if="store.consumables.length === 0" disabled class="potion-btn empty">无药水</button>
      </div>
      <button @click="showPotionPanel = false" class="btn-cancel">取消</button>
    </div>
    
    <!-- 掉落展示 -->
    <div v-if="store.battleState === 'drop'" class="result drop">
      <div class="result-title">🎁 发现战利品！</div>
      <div class="drop-card" v-if="store.drop">
        <div class="drop-icon" v-if="store.drop.type === 'equipment'"
          :class="store.drop.item.type"
        >
          {{ store.drop.item.type === 'weapon' ? '⚔️' : store.drop.item.type === 'armor' ? '🛡️' : '💍' }}
        </div>
        <div class="drop-icon" v-else>🧪</div>
        <div class="drop-info">
          <div class="drop-name" v-if="store.drop.type === 'equipment'"
            :style="{ color: qualityColor(store.drop.item.level) }"
          >
            {{ store.drop.item.name }} <span class="drop-level">Lv.{{ store.drop.item.level }}</span>
          </div>
          <div class="drop-name" v-else>{{ store.drop.item.name }} ×{{ store.drop.item.count }}</div>
          <div class="drop-stats" v-if="store.drop.type === 'equipment'">
            <span v-if="store.drop.item.atk">⚔️ {{ store.drop.item.atk }}</span>
            <span v-if="store.drop.item.def">🛡️ {{ store.drop.item.def }}</span>
          </div>
          <div class="drop-desc">{{ store.drop.item.desc }}</div>
        </div>
      </div>
      <button @click="store.claimDrop" class="btn-next">收下</button>
    </div>

    <!-- 胜利 - 捕捉选项 -->
    <div v-if="store.battleState === 'won'" class="result won">
      <div class="result-title">🎉 胜利！</div>
      <div v-if="canCapture" class="capture-offer">
        <div class="capture-info">
          <span class="capture-icon">{{ store.captureMonsterData?.icon }}</span>
          <div class="capture-name">
            <span :class="'rarity-badge ' + (store.captureRarity || 'common')">{{ rarityLabel }}</span>
            {{ store.captureMonsterData?.name }}
          </div>
          <div class="capture-hint">发现{{ rarityLabel }}怪物！</div>
          <div class="capture-hint-small">{{ captureHintText }}</div>
        </div>
        <div class="capture-actions">
          <button @click="store.startCapture" class="btn-capture">🐾 尝试收养</button>
          <button @click="store.skipCapture" class="btn-skip">放弃</button>
        </div>
      </div>
      <div v-else>
        <button @click="nextBattle" class="btn-next">继续探索</button>
      </div>
    </div>
    
    <!-- 捕捉答题 -->
    <div v-if="store.battleState === 'captureQuiz'" class="quiz-panel capture-quiz">
      <div class="capture-title">
        🐾 收养考验（{{ store.captureIndex + 1 }} / {{ store.captureQuestions.length }}）
        <span :class="'rarity-badge ' + store.captureRarity">{{ rarityLabel }}</span>
      </div>
      <div class="capture-progress">
        <div
          v-for="i in store.captureQuestions.length"
          :key="i"
          class="progress-dot"
          :class="{
            correct: i <= store.captureCorrectCount,
            current: i === store.captureIndex + 1 && store.captureIndex < store.captureQuestions.length,
            wrong: i <= store.captureIndex && i > store.captureCorrectCount
          }"
        ></div>
      </div>
      <div class="question">{{ store.captureQuestions[store.captureIndex]?.q }}</div>
      <div class="options">
        <button
          v-for="(opt, i) in store.captureQuestions[store.captureIndex]?.options"
          :key="i"
          @click="submitCaptureAnswer(i)"
          class="option-btn"
        >
          {{ opt }}
        </button>
      </div>
    </div>
    
    <!-- 捕捉成功 -->
    <div v-if="store.battleState === 'captureSuccess'" class="result capture-result success">
      <div class="result-title">🎉 收养成功！</div>
      <div class="capture-result-icon">{{ store.farm[store.farm.length - 1]?.icon }}</div>
      <div class="capture-result-name">{{ store.farm[store.farm.length - 1]?.name }}</div>
      <div class="capture-result-desc">已成为你的伙伴！</div>
      <button @click="nextBattle" class="btn-next">返回房间</button>
    </div>
    
    <!-- 捕捉失败 -->
    <div v-if="store.battleState === 'captureFail'" class="result capture-result fail">
      <div class="result-title">😢 怪物逃跑了</div>
      <div class="capture-result-desc">答题失败，怪物消失在黑暗中...</div>
      <button @click="nextBattle" class="btn-next">返回房间</button>
    </div>
    
    <!-- 战败 -->
    <div v-if="store.battleState === 'lost'" class="result lost">
      <div class="result-title">💀 战败</div>
      <button @click="revive" class="btn-revive">复活（回到第1层）</button>
    </div>
    
    <!-- 逃跑 -->
    <div v-if="store.battleState === 'fled'" class="result fled">
      <div class="result-title">已逃跑</div>
      <button @click="store.exitBattle" class="btn-back">返回</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '../stores/game.js'
import { DUNGEON_ELEMENTS } from '../data/farm.js'
import { sfxClick } from '../utils/audio.js'
import { useParticleSystem } from '../composables/useParticleSystem.js'
import { showFloatingDamage, showHealNumber } from '../composables/useFloatingDamage.js'

const store = useGameStore()
const showPotionPanel = ref(false)

// ===== 粒子系统 =====
const ps = useParticleSystem()
const battleContainerRef = ref(null)
const battlefieldRef = ref(null)

// ===== 幽灵血条追踪 =====
const playerPrevHp = ref(0)
const enemyPrevHp = ref(0)
const playerGhostHpPercent = ref(100)
const enemyGhostHpPercent = ref(100)

// ===== 血条颜色 =====
const isBossWarning = computed(() => {
  return store.gameMode === 'weekly_boss' && store.weeklyBossTimeLeft !== null && store.weeklyBossTimeLeft <= 10
})
const hpColorClass = computed(() => {
  const pct = store.hpPercent
  if (pct <= 20) return 'hp-danger'
  if (pct <= 50) return 'hp-warning'
  return 'hp-healthy'
})

const enemyHpColorClass = computed(() => {
  if (!store.enemy) return ''
  const pct = store.enemy.hp / store.enemy.maxHp * 100
  if (pct <= 20) return 'hp-danger'
  if (pct <= 50) return 'hp-warning'
  return 'hp-healthy'
})

// 敌人血条颜色渐变 — 健康时使用学科主题色，低血量时由 CSS class 覆盖
const enemyHpGradient = computed(() => {
  if (!store.currentSubjectTheme) return 'linear-gradient(90deg, #ff6b6b, #c0392b)'
  const t = store.currentSubjectTheme
  return `linear-gradient(90deg, ${t.hp}, ${t.hpDark})`
})

const enemyElementColor = computed(() => {
  if (!store.enemy?.element) return '#666'
  return DUNGEON_ELEMENTS[store.enemy.element]?.color || '#666'
})

const canCapture = computed(() => {
  if (!store.captureMonsterData) return false
  return store.farm.length < 12
})

const rarityLabel = computed(() => {
  const map = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' }
  return map[store.captureRarity] || '普通'
})

const captureHintText = computed(() => {
  const r = store.captureRarity
  if (r === 'common') return '答对2题即可收养'
  if (r === 'rare') return '答对3题可收养（可错1题）'
  if (r === 'epic') return '3题全部答对才能收养'
  if (r === 'legendary') return '3题全对并通过传说Boss试炼！'
  return '答对题目即可收养'
})

// ===== 幽灵血条 =====
// 玩家受伤时，幽灵血条保存旧值，2秒内缓慢追赶
watch(() => store.hp, (newHp, oldHp) => {
  if (oldHp === undefined || oldHp === null) {
    playerPrevHp.value = newHp
    return
  }
  if (newHp < oldHp) {
    // 受伤：幽灵血条停留在旧位置，实际血条跳变
    const damage = oldHp - newHp
    playerPrevHp.value = oldHp
    playerGhostHpPercent.value = (oldHp / store.maxHp) * 100
    // 幽灵血条在 1.5s 内追赶到新位置
    setTimeout(() => {
      playerGhostHpPercent.value = (newHp / store.maxHp) * 100
    }, 100)

    // 玩家受伤数字（红色）
    if (battlefieldRef.value && damage > 0) {
      showFloatingDamage(battlefieldRef.value, damage, {
        x: 25, y: 45,
        isCritical: false,
        color: '#e74c3c'
      })
    }
  } else if (newHp > oldHp) {
    // 回血：同时刷新
    const heal = newHp - oldHp
    playerPrevHp.value = newHp
    playerGhostHpPercent.value = (newHp / store.maxHp) * 100
    if (battlefieldRef.value && heal > 0) {
      showHealNumber(battlefieldRef.value, heal, {
        x: 25, y: 45
      })
    }
  }
})

// 敌人受伤追踪 + 伤害数字显示
watch(() => store.enemy?.hp, (newHp, oldHp) => {
  if (newHp === undefined || oldHp === undefined || oldHp === null) return
  if (newHp < oldHp) {
    const damage = oldHp - newHp
    enemyPrevHp.value = oldHp
    enemyGhostHpPercent.value = (oldHp / store.enemy.maxHp) * 100
    setTimeout(() => {
      enemyGhostHpPercent.value = (newHp / store.enemy.maxHp) * 100
    }, 100)

    // 显示伤害数字
    if (battlefieldRef.value && damage > 0) {
      const isCrit = store.comboActive
      const subjectColor = store.enemy?.subjectLabel === '化学' ? '#e74c3c' :
                           store.enemy?.subjectLabel === '生物' ? '#2ecc71' :
                           store.enemy?.subjectLabel === '易学' ? '#9b59b6' : '#f1c40f'
      showFloatingDamage(battlefieldRef.value, damage, {
        x: 75, y: 35,
        isCritical: isCrit,
        label: isCrit ? '暴击！' : '',
        color: isCrit ? '#f1c40f' : subjectColor
      })
    }
  } else if (newHp > oldHp) {
    // Boss回血
    const heal = newHp - oldHp
    enemyPrevHp.value = newHp
    enemyGhostHpPercent.value = (newHp / store.enemy.maxHp) * 100
    if (battlefieldRef.value && heal > 0) {
      showHealNumber(battlefieldRef.value, heal, {
        x: 75, y: 35
      })
    }
  }
})

// ===== 粒子 + 伤害数字触发 =====
// comboActive → 暴击粒子爆发 + 伤害数字
watch(() => store.comboActive, (active) => {
  if (!active || !battlefieldRef.value) return

  const bf = battlefieldRef.value
  const rect = bf.getBoundingClientRect()
  const cx = bf.clientWidth / 2
  const cy = bf.clientHeight / 2

  // 粒子爆发
  ps.emitBurst(cx, cy, 50, ['#f1c40f', '#e67e22', '#f39c12', '#fff'], {
    speedMin: 3, speedMax: 10, sizeMin: 3, sizeMax: 9, life: 1.0, gravity: 150
  })

  // 飘浮粒子环绕
  nextTick(() => {
    ps.emitFloat(cx - 60, cy - 40, 8, ['#f1c40f', '#fff'], { life: 0.8 })
    ps.emitFloat(cx + 60, cy - 40, 8, ['#f1c40f', '#fff'], { life: 0.8 })
  })
})

// 限时Boss倒计时 ≤ 10s → 屏幕火花
watch(() => store.weeklyBossTimeLeft, (t) => {
  if (t !== undefined && t <= 10 && t > 0 && ps) {
    ps.emitScreenSparks(['#e74c3c', '#f39c12'], 8)
  }
})

// ===== 生命周期 =====
onMounted(() => {
  nextTick(() => {
    if (battleContainerRef.value) {
      ps.init(battleContainerRef.value)
      // 初始化幽灵血条
      playerPrevHp.value = store.hp
      playerGhostHpPercent.value = store.hpPercent
      if (store.enemy) {
        enemyPrevHp.value = store.enemy.hp
        enemyGhostHpPercent.value = (store.enemy.hp / store.enemy.maxHp) * 100
      }
    }
  })
})

onUnmounted(() => {
  ps.destroy()
})

function startAnswer() {
  sfxClick()
  store.battleState = 'answering'
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

function showPotionMenu() {
  sfxClick()
  showPotionPanel.value = true
}

function usePotion(itemId) {
  sfxClick()
  store.usePotion(itemId)
  showPotionPanel.value = false
}

function submitCaptureAnswer(index) {
  sfxClick()
  store.submitCaptureAnswer(index)
}

function nextBattle() {
  sfxClick()
  // 限时Boss
  if (store.gameMode === 'weekly_boss') {
    store.exitWeeklyBoss()
    return
  }
  
  // 地牢战斗中胜利 → 完成房间后直接返回，不再继续
  if (store.battleState === 'won' && store.dungeonPhase === 'battle') {
    store.finishRoom(true)
    return
  }
  
  // 地牢战斗中失败/逃跑 → 完成房间后返回
  if (store.dungeonPhase === 'battle') {
    if (store.battleState === 'fled') {
      store.finishRoom(false)
    } else {
      store.exitBattle()
    }
    return
  }
  
  // 非地牢模式（独立战斗）
  if (store.battleState === 'captureSuccess' || store.battleState === 'captureFail') {
    store.exitBattle()
  } else if (store.battleState === 'won') {
    // 独立战斗胜利：退出后新开一场
    store.exitBattle()
    store.initBattle()
  } else {
    // 独立战斗失败/逃跑：退出后新开一场
    store.exitBattle()
    store.initBattle()
  }
}

function qualityColor(level) {
  if (level >= 5) return '#9b59b6' // 史诗
  if (level >= 4) return '#3498db' // 稀有
  if (level >= 3) return '#2ecc71' // 绿色
  return '#e0e0e0' // 白色
}

function revive() {
  store.floor = 1
  store.hp = store.maxHp
  store.exitBattle()
}
</script>

<style scoped>
/* 连击系统 */
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

/* 屏幕震动 */
.screen-shake {
  animation: screen-shake 0.5s ease-in-out;
}

/* 暴击闪光覆盖层 - 增强版 */
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
  background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%);
  animation: white-flash 0.4s ease-out;
  pointer-events: none;
}

.critical-overlay-text {
  font-size: 32px;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 0 0 20px rgba(241, 196, 15, 0.8), 0 0 40px rgba(241, 196, 15, 0.4);
  animation: critical-zoom 0.5s ease-out, critical-pulse 0.8s ease-in-out infinite 0.5s;
  position: relative;
  z-index: 1;
}

/* 暴击粒子效果（由 Canvas 驱动，保留覆盖层视觉样式） */

@keyframes combo-pop {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes critical-flash {
  0%, 100% { box-shadow: 0 0 10px rgba(241, 196, 15, 0.3); }
  50% { box-shadow: 0 0 30px rgba(241, 196, 15, 0.8); }
}

@keyframes screen-shake {
  0%, 100% { transform: translateX(0) translateY(0); }
  10% { transform: translateX(-8px) translateY(2px); }
  20% { transform: translateX(8px) translateY(-2px); }
  30% { transform: translateX(-8px) translateY(1px); }
  40% { transform: translateX(8px) translateY(-1px); }
  50% { transform: translateX(-5px) translateY(2px); }
  60% { transform: translateX(5px) translateY(-2px); }
  70% { transform: translateX(-3px) translateY(1px); }
  80% { transform: translateX(3px) translateY(-1px); }
  90% { transform: translateX(-1px) translateY(0); }
}

@keyframes white-flash {
  0% { opacity: 1; }
  40% { opacity: 0.6; }
  100% { opacity: 0; }
}

@keyframes critical-zoom {
  0% { transform: scale(0.3); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes critical-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* @keyframes particle-burst removed — handled by Canvas useParticleSystem */

@keyframes fade-in-out {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.battle-container {
  padding: 20px;
  background: #2a2a2a;
  border-radius: 12px;
  color: #fff;
}

/* PC端：玻璃质感 */
@media (min-width: 768px) {
  .battle-container {
    background: rgba(42, 42, 42, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .battle-log {
    background: rgba(26, 26, 26, 0.7) !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .quiz-panel {
    background: rgba(26, 26, 26, 0.75) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .result {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}

/* ===== 限时Boss预警 ===== */
.boss-warning {
  box-shadow: inset 0 0 0 0 rgba(231, 76, 60, 0);
  animation: boss-warning-glow 1s ease-in-out infinite;
}

@keyframes boss-warning-glow {
  0%   { box-shadow: inset 0 0 0px rgba(231, 76, 60, 0.1), 0 0 0px rgba(231, 76, 60, 0); }
  50%  { box-shadow: inset 0 0 30px rgba(231, 76, 60, 0.15), 0 0 15px rgba(231, 76, 60, 0.08); }
  100% { box-shadow: inset 0 0 0px rgba(231, 76, 60, 0.1), 0 0 0px rgba(231, 76, 60, 0); }
}

.battle-container.boss-warning {
  border-color: rgba(231, 76, 60, 0.2);
  transition: border-color 0.3s ease;
}

/* 倒计时 ≤5s 加速闪烁 */
.boss-warning .timer-bar-fill.danger {
  animation: pulse-danger 0.3s ease-in-out infinite !important;
}

.boss-warning .timer-bar-label {
  animation: timer-label-panic 0.5s ease-in-out infinite;
  color: #e74c3c;
  font-size: 16px;
}

@keyframes timer-label-panic {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.floor-badge {
  background: #ff6b6b;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: bold;
}

.enemy-info {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.enemy-name {
  font-size: 1.2em;
  font-weight: bold;
}

.enemy-subject {
  color: #ffd93d;
}

.enemy-element {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #fff;
}

.battlefield {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #1a1a1a;
  border-radius: 8px;
  margin-bottom: 20px;
}

.player-side, .enemy-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.player-avatar, .enemy-avatar {
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

.enemy-subject {
  color: #ffd93d;
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
  top: 0; left: 0;
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
  transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              background 0.5s ease;
  z-index: 1;
}

/* HP 颜色渐变 */
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

.enemy-hp-fill {
  /* 基线值由 inline style 提供（学科主题色），此处不设 !important
     以便 .hp-warning / .hp-danger 在低血量时覆盖 */
}

.enemy-hp-fill.hp-warning {
  background: linear-gradient(90deg, #f39c12, #e67e22) !important;
}

.enemy-hp-fill.hp-danger {
  background: linear-gradient(90deg, #e74c3c, #c0392b) !important;
  animation: hp-danger-pulse 0.8s ease-in-out infinite;
}

@keyframes hp-danger-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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

.battle-log {
  background: #1a1a1a;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-height: 150px;
  overflow-y: auto;
}

.log-msg {
  padding: 4px 0;
  border-bottom: 1px solid #333;
  font-size: 0.9em;
}

.battle-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-subrow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.battle-actions button, .option-btn, .potion-btn, .btn-cancel, .btn-next, .btn-revive, .btn-back, .btn-capture, .btn-skip {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s;
}

.btn-attack {
  background: #ff6b6b;
  color: white;
}

.btn-answer {
  background: #4ecdc4;
  color: #1a1a1a;
  font-size: 1.15em;
  padding: 16px 24px;
  font-weight: bold;
}

.btn-potion {
  background: #ffd93d;
  color: #1a1a1a;
}

.btn-flee {
  background: #666;
  color: white;
}

.battle-actions button:hover {
  transform: translateY(-2px);
  filter: brightness(1.2);
}

.quiz-panel {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.capture-quiz .capture-title {
  text-align: center;
  font-size: 1.2em;
  color: #d4a853;
  margin-bottom: 8px;
}

.capture-progress {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #333;
  border: 2px solid #555;
  transition: all 0.3s;
}

.progress-dot.correct {
  background: #2ecc71;
  border-color: #2ecc71;
}

.progress-dot.wrong {
  background: #e74c3c;
  border-color: #e74c3c;
}

.progress-dot.current {
  background: #d4a853;
  border-color: #d4a853;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.question {
  font-size: 1.1em;
  margin-bottom: 15px;
  color: #ffd93d;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-btn {
  background: #333;
  color: white;
  text-align: left;
}

.option-btn:hover {
  background: #444;
}

.potion-panel {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.potion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.potion-btn {
  background: #333;
  color: white;
  text-align: left;
}

.potion-btn:hover {
  background: #444;
}

.potion-btn.empty {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: #666;
  color: white;
  width: 100%;
}

.result {
  text-align: center;
  padding: 30px;
  border-radius: 8px;
}

.result.won {
  background: rgba(78, 205, 196, 0.2);
}

.result.drop {
  background: rgba(212, 168, 83, 0.2);
  padding: 20px;
}

.drop-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 52, 96, 0.6);
  border-radius: 12px;
  border: 2px solid rgba(212, 168, 83, 0.4);
  margin-bottom: 16px;
  align-items: center;
}

.drop-icon {
  font-size: 40px;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.drop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.drop-name {
  font-size: 16px;
  font-weight: bold;
}

.drop-level {
  font-size: 12px;
  color: #888;
  font-weight: normal;
  margin-left: 4px;
}

.drop-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #d4a853;
}

.drop-desc {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}

.result.lost {
  background: rgba(255, 107, 107, 0.2);
}

.result.fled {
  background: rgba(102, 102, 102, 0.2);
}

.result.capture-result.success {
  background: rgba(46, 204, 113, 0.2);
}

.result.capture-result.fail {
  background: rgba(231, 76, 60, 0.2);
}

.result-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
}

.capture-offer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.capture-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.capture-icon {
  font-size: 3em;
}

.capture-name {
  font-size: 1.2em;
  font-weight: bold;
  color: #e0e0e0;
}

.capture-hint {
  color: #d4a853;
  font-size: 1em;
}

.capture-hint-small {
  color: #888;
  font-size: 0.85em;
}

/* 稀有度标签 */
.rarity-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  margin-right: 6px;
}
.rarity-badge.common    { background: rgba(136,136,136,0.2); color: #aaa; }
.rarity-badge.rare      { background: rgba(52,152,219,0.25); color: #5dade2; }
.rarity-badge.epic      { background: rgba(155,89,182,0.25); color: #af7ac5; }
.rarity-badge.legendary { 
  background: linear-gradient(135deg, rgba(241,196,15,0.3), rgba(212,168,83,0.3));
  color: #f1c40f;
  text-shadow: 0 0 6px rgba(241,196,15,0.3);
}

.capture-actions {
  display: flex;
  gap: 10px;
}

.btn-capture {
  background: #d4a853;
  color: #1a1a2e;
  font-weight: bold;
}

.btn-skip {
  background: #666;
  color: white;
}

.capture-result-icon {
  font-size: 3em;
  margin-bottom: 8px;
}

.capture-result-name {
  font-size: 1.2em;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.capture-result-desc {
  color: #888;
  font-size: 0.9em;
  margin-bottom: 16px;
}

.btn-next, .btn-revive, .btn-back {
  padding: 15px 30px;
  font-size: 1.1em;
}

.btn-next {
  background: #4ecdc4;
  color: #1a1a2e;
}

.btn-revive {
  background: #ff6b6b;
  color: white;
}

.btn-back {
  background: #666;
  color: white;
}

/* 倒计时进度条 */
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
  background: rgba(255,255,255,0.1);
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 限时Boss样式 */
.weekly-boss-tag {
  background: #e74c3c;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: bold;
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

.time-limit-hint {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  font-size: 14px;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  text-align: center;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
