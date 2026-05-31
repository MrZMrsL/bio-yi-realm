<template>
  <div class="battle-container" :class="{ 'screen-shake': store.comboActive }">
    <div class="battle-header">
      <span class="floor-badge">第 {{ store.floor }} 层</span>
      <div class="enemy-info">
        <span class="enemy-name">{{ store.enemy?.name }}</span>
        <span class="enemy-subject">[{{ store.enemy?.subjectLabel }}]</span>
        <span class="enemy-element" :style="{ background: enemyElementColor }"
          v-if="store.enemy?.elementLabel">
          {{ store.enemy?.elementLabel }}
        </span>
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
    
    <!-- 暴击特效覆盖层 -->
    <div v-if="store.comboActive" class="critical-overlay">
      <div class="critical-particles">
        <div class="particle" style="--tx: -40; --ty: -60;"></div>
        <div class="particle" style="--tx: 50; --ty: -40;"></div>
        <div class="particle" style="--tx: -30; --ty: 50;"></div>
        <div class="particle" style="--tx: 60; --ty: 30;"></div>
        <div class="particle" style="--tx: 20; --ty: -70;"></div>
        <div class="particle" style="--tx: -50; --ty: 20;"></div>
        <div class="particle" style="--tx: 35; --ty: -50;"></div>
        <div class="particle" style="--tx: -25; --ty: 60;"></div>
      </div>
      <div class="critical-overlay-text">⚡ 知识三连击！伤害×3！</div>
    </div>
    
    <div class="battlefield">
      <div class="player-side">
        <div class="player-avatar">🧙‍♂️</div>
        <div class="health-bar">
          <div class="hp-fill" :style="{ width: store.hpPercent + '%' }"></div>
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
      
      <div class="vs">VS</div>
      
      <div class="enemy-side">
        <div class="enemy-avatar">{{ store.enemy?.icon || store.enemy?.name?.charAt(0) || '?' }}</div>
        <div class="health-bar enemy-hp">
          <div class="hp-fill" :style="{ width: (store.enemy?.hp / store.enemy?.maxHp * 100) + '%' }"></div>
        </div>
        <span class="hp-text">{{ store.enemy?.hp }} / {{ store.enemy?.maxHp }}</span>
      </div>
    </div>
    
    <div class="battle-log">
      <div v-for="(msg, i) in store.battleLog" :key="i" class="log-msg">{{ msg }}</div>
    </div>
    
    <!-- 战斗操作区 -->
    <div v-if="store.battleState === 'idle'" class="battle-actions">
      <button @click="store.attack" class="btn-attack">⚔️ 攻击</button>
      <button @click="startAnswer" class="btn-answer">📚 知识攻击</button>
      <button @click="showPotionMenu" class="btn-potion">🧪 药水</button>
      <button @click="store.flee" class="btn-flee">🏃 逃跑</button>
    </div>
    
    <!-- 答题面板 -->
    <div v-if="store.battleState === 'answering'" class="quiz-panel">
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
          <div class="capture-name">{{ store.captureMonsterData?.name }}</div>
          <div class="capture-hint">发现可收养的怪物！</div>
          <div class="capture-hint-small">答对3道题目即可收养</div>
        </div>
        <div class="capture-actions">
          <button @click="store.startCapture" class="btn-capture">🐾 尝试收养</button>
          <button @click="store.skipCapture" class="btn-skip">放弃</button>
        </div>
      </div>
      <div v-else class="no-capture">
        <button @click="nextBattle" class="btn-next">返回房间</button>
      </div>
    </div>
    
    <!-- 捕捉答题 -->
    <div v-if="store.battleState === 'captureQuiz'" class="quiz-panel capture-quiz">
      <div class="capture-title">🐾 收养考验（{{ store.captureIndex + 1 }} / 3）</div>
      <div class="capture-progress">
        <div
          v-for="i in 3"
          :key="i"
          class="progress-dot"
          :class="{
            correct: i <= store.captureCorrectCount,
            current: i === store.captureIndex + 1 && store.captureIndex < 3,
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
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { DUNGEON_ELEMENTS } from '../data/farm.js'

const store = useGameStore()
const showPotionPanel = ref(false)

const enemyElementColor = computed(() => {
  if (!store.enemy?.element) return '#666'
  return DUNGEON_ELEMENTS[store.enemy.element]?.color || '#666'
})

const canCapture = computed(() => {
  if (!store.captureMonsterData) return false
  return store.farm.length < 12
})

function startAnswer() {
  store.battleState = 'answering'
}

function submitAnswer(index) {
  const correct = index === store.question?.answer
  store.answerAttack(correct)
}

function showPotionMenu() {
  showPotionPanel.value = true
}

function usePotion(itemId) {
  store.usePotion(itemId)
  showPotionPanel.value = false
}

function submitCaptureAnswer(index) {
  store.submitCaptureAnswer(index)
}

function nextBattle() {
  // 房间系统下，战斗结束返回房间界面
  if (store.dungeonPhase === 'battle') {
    store.exitBattle()
  } else {
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

/* 暴击粒子效果 */
.critical-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 999;
}

.critical-particles .particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #f1c40f;
  border-radius: 50%;
  animation: particle-burst 1s ease-out forwards;
}

.critical-particles .particle:nth-child(1) { top: 40%; left: 45%; animation-delay: 0s; }
.critical-particles .particle:nth-child(2) { top: 35%; left: 55%; animation-delay: 0.1s; }
.critical-particles .particle:nth-child(3) { top: 50%; left: 40%; animation-delay: 0.05s; }
.critical-particles .particle:nth-child(4) { top: 45%; left: 60%; animation-delay: 0.15s; }
.critical-particles .particle:nth-child(5) { top: 30%; left: 50%; animation-delay: 0.08s; }
.critical-particles .particle:nth-child(6) { top: 55%; left: 48%; animation-delay: 0.12s; }
.critical-particles .particle:nth-child(7) { top: 38%; left: 42%; animation-delay: 0.2s; }
.critical-particles .particle:nth-child(8) { top: 42%; left: 58%; animation-delay: 0.18s; }

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

@keyframes particle-burst {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { 
    transform: translate(
      calc(var(--tx, 0) * 1px), 
      calc(var(--ty, 0) * 1px)
    ) scale(0);
    opacity: 0;
  }
}

@keyframes fade-in-out {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes critical-zoom {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.battle-container {
  padding: 20px;
  background: #2a2a2a;
  border-radius: 8px;
  color: #fff;
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

.health-bar {
  width: 150px;
  height: 12px;
  background: #333;
  border-radius: 6px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  background: #4ecdc4;
  transition: width 0.3s;
}

.enemy-hp .hp-fill {
  background: #ff6b6b;
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
</style>
