<template>
  <div class="pvp-battle-container" ref="pvpContainerRef">
    <!-- 头部 -->
    <div class="pvp-header">
      <span class="pvp-badge">⚔️ PVP对战</span>
      <div class="pvp-round-info" v-if="pvpState !== 'idle'">
        <span>回合 {{ currentRound }} / {{ maxRounds }}</span>
      </div>
    </div>

    <!-- 对战双方信息 -->
    <div class="pvp-battlefield" ref="battlefieldRef">
      <!-- 玩家侧 -->
      <div class="pvp-side player-side">
        <div class="pvp-avatar emoji-icon">🧙‍♂️</div>
        <div class="pvp-name">{{ store.title }}</div>
        <div class="pvp-level">Lv.{{ store.level }}</div>
        <div class="pvp-hp-bar">
          <div class="pvp-hp-fill hp-healthy" :style="{ width: playerHpPct + '%' }"></div>
        </div>
        <span class="pvp-hp-text">{{ store.hp }} / {{ store.maxHp }}</span>
        <div class="pvp-stats">
          <span>⚔️{{ store.totalAtk }}</span>
          <span>🛡️{{ store.totalDef }}</span>
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

    <!-- 回合得分 -->
    <div class="pvp-scoreboard" v-if="pvpState !== 'idle'">
      <div class="score-item player-score">
        <span class="score-label">你</span>
        <span class="score-value">{{ playerScore }}</span>
      </div>
      <div class="score-divider">:</div>
      <div class="score-item enemy-score">
        <span class="score-label">对手</span>
        <span class="score-value">{{ opponentScore }}</span>
      </div>
    </div>

    <!-- 战斗日志 -->
    <div class="pvp-battle-log" ref="logRef">
      <div v-for="(msg, i) in pvpLog" :key="i" class="pvp-log-msg">{{ msg }}</div>
    </div>

    <!-- 操作区：idle 状态 -->
    <div v-if="pvpState === 'idle'" class="pvp-actions">
      <p class="pvp-rules-hint">
        💡 PVP规则：与镜像玩家进行答题对战。每答对一题对你的回合得分+1，对手随机答题可能得分。{{ maxRounds }} 回合后得分高者获胜！
      </p>
      <button @click="startRound" class="pvp-btn-answer">📚 开始答题</button>
      <button @click="exitPvp" class="pvp-btn-exit">🚪 退出对战</button>
    </div>

    <!-- 答题面板 -->
    <div v-if="pvpState === 'answering'" class="pvp-quiz-panel">
      <div class="pvp-question">{{ currentQuestion?.q }}</div>
      <div class="pvp-options">
        <button
          v-for="(opt, i) in currentQuestion?.options"
          :key="i"
          @click="submitAnswer(i)"
          class="pvp-option-btn"
          :disabled="answerSubmitted"
        >
          {{ opt }}
        </button>
      </div>
      <div v-if="answerSubmitted" class="pvp-answer-feedback" :class="lastAnswerCorrect ? 'correct' : 'wrong'">
        {{ lastAnswerCorrect ? '✅ 回答正确！' : '❌ 回答错误！' }}
      </div>
      <button v-if="answerSubmitted" @click="nextRound" class="pvp-btn-next">
        {{ currentRound >= maxRounds ? '查看结果' : '下一回合 →' }}
      </button>
    </div>

    <!-- 结果面板 -->
    <div v-if="pvpState === 'result'" class="pvp-result" :class="pvpResultClass">
      <div class="pvp-result-icon">{{ resultIcon }}</div>
      <div class="pvp-result-title">{{ resultTitle }}</div>
      <div class="pvp-result-scores">
        <div class="result-score-row">
          <span>你的得分</span>
          <span class="result-score-val">{{ playerScore }}</span>
        </div>
        <div class="result-score-row">
          <span>对手得分</span>
          <span class="result-score-val">{{ opponentScore }}</span>
        </div>
      </div>
      <div class="pvp-result-reward" v-if="won">
        <span>🎁 {{ rewardExp }} 经验</span>
        <span>💰 {{ rewardGold }} 金币</span>
      </div>
      <div class="pvp-result-actions">
        <button @click="rematch" class="pvp-btn-rematch">🔄 再来一局</button>
        <button @click="exitPvp" class="pvp-btn-exit">🚪 返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '../stores/game.js'
import { getQuestionsForFloor } from '../data/questions.js'
import { generatePvpOpponent } from '../composables/useLeaderboard.js'
import { sfxClick, sfxCorrect, sfxWrong } from '../utils/audio.js'

const store = useGameStore()

const emit = defineEmits(['exit'])

// 对手答题计时器——避免竞态条件
let opponentTimer = null

// PVP 状态
const pvpState = ref('idle') // idle | answering | result
const currentRound = ref(0)
const maxRounds = 5
const playerScore = ref(0)
const opponentScore = ref(0)
const pvpLog = ref([])
const currentQuestion = ref(null)
const answerSubmitted = ref(false)
const lastAnswerCorrect = ref(false)
const won = ref(false)

const pvpContainerRef = ref(null)
const battlefieldRef = ref(null)
const logRef = ref(null)

// 生成对手
const opponent = ref(generateOpponent())

function generateOpponent() {
  return generatePvpOpponent({
    level: store.level,
    title: store.title,
    maxHp: store.maxHp,
    hp: store.hp,
    atk: store.atk,
    def: store.def,
    totalAtk: store.totalAtk,
    totalDef: store.totalDef,
    exp: store.exp,
    maxExp: store.maxExp
  })
}

// 血条百分比
const playerHpPct = computed(() => {
  return store.maxHp > 0 ? (store.hp / store.maxHp) * 100 : 0
})

const opponentHpPct = computed(() => {
  return opponent.value.maxHp > 0 ? (opponent.value.hp / opponent.value.maxHp) * 100 : 0
})

// 结果展示
const pvpResultClass = computed(() => {
  if (playerScore.value === opponentScore.value) return 'pvp-draw'
  return won.value ? 'pvp-won' : 'pvp-lost'
})
const resultIcon = computed(() => {
  if (playerScore.value === opponentScore.value) return '🤝'
  return won.value ? '🎉' : '😢'
})
const resultTitle = computed(() => {
  if (playerScore.value === opponentScore.value) return '平局！'
  if (won.value) return 'PVP 胜利！'
  return 'PVP 败北'
})
const rewardExp = computed(() => won.value ? Math.floor(opponent.value.level * 15) : Math.floor(opponent.value.level * 5))
const rewardGold = computed(() => won.value ? Math.floor(opponent.value.level * 10) : Math.floor(opponent.value.level * 3))

function addLog(msg) {
  pvpLog.value.push(msg)
  // 自动滚动到底部
  nextTick(() => {
    if (logRef.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight
    }
  })
}

function startRound() {
  sfxClick()
  currentRound.value++
  answerSubmitted.value = false
  lastAnswerCorrect.value = false
  pvpState.value = 'answering'

  // 获取一道题（根据玩家等级决定难度）
  const qs = getQuestionsForFloor(store.floor, 1, store.playerSpecialization)
  currentQuestion.value = qs[0]

  if (!currentQuestion.value) {
    // fallback: 从全部题库中随机取
    addLog('题库加载异常，请重试...')
    pvpState.value = 'idle'
    return
  }

  addLog(`⚡ 第 ${currentRound.value} 回合开始！`)
}

function submitAnswer(index) {
  if (answerSubmitted.value) return
  answerSubmitted.value = true

  const correct = index === currentQuestion.value?.answer
  lastAnswerCorrect.value = correct

  if (correct) {
    sfxCorrect()
    playerScore.value++
    addLog(`✅ 你答对了！得分 +1（当前 ${playerScore.value} 分）`)
  } else {
    sfxWrong()
    addLog(`❌ 你答错了！（当前 ${playerScore.value} 分）`)
  }

  // 模拟对手答题：基于对手等级计算胜率
  const opponentWinChance = 0.4 + (opponent.value.level / (store.level + opponent.value.level)) * 0.2
  const opponentCorrect = Math.random() < opponentWinChance

  opponentTimer = setTimeout(() => {
    opponentTimer = null
    if (opponentCorrect) {
      opponentScore.value++
      addLog(`😈 对手答对了！得分 +1（当前 ${opponentScore.value} 分）`)
    } else {
      addLog(`💨 对手答错了！（当前 ${opponentScore.value} 分）`)
    }

    // 计算伤害（基于答题结果）
    calculateDamage(correct, opponentCorrect)
  }, 800)
}

function calculateDamage(playerCorrect, opponentCorrect) {
  // 玩家答对 → 对对手造成伤害
  if (playerCorrect) {
    const dmg = Math.max(1, Math.floor(store.totalAtk * 0.3 + store.level * 1.5))
    opponent.value.hp = Math.max(0, opponent.value.hp - dmg)
    addLog(`⚔️ 你的知识攻击造成 ${dmg} 点伤害！`)
  }

  // 对手答对 → 对玩家造成伤害
  if (opponentCorrect) {
    const dmg = Math.max(1, Math.floor(opponent.value.atk * 0.3 + opponent.value.level * 1.2))
    store.hp = Math.max(0, store.hp - dmg)
    addLog(`🛡️ 对手的知识攻击造成 ${dmg} 点伤害！`)
  }
}

function nextRound() {
  sfxClick()
  if (opponentTimer) { clearTimeout(opponentTimer); opponentTimer = null }
  if (currentRound.value >= maxRounds) {
    finishPvp()
  } else {
    startRound()
  }
}

function finishPvp() {
  // 若还有未完成的对手计时器，先清理
  if (opponentTimer) { clearTimeout(opponentTimer); opponentTimer = null }

  won.value = playerScore.value > opponentScore.value
  const isDraw = playerScore.value === opponentScore.value

  pvpState.value = 'result'

  if (isDraw) {
    // 平局算玩家胜（鼓励），奖励按胜利计算
    won.value = true
  }

  // 发放奖励
  const expGain = rewardExp.value
  const goldGain = rewardGold.value
  store.exp += expGain
  store.gold += goldGain

  if (won.value && !isDraw) {
    addLog(`🎉 PVP胜利！获得 ${expGain} 经验和 ${goldGain} 金币！`)
  } else if (isDraw) {
    addLog(`🤝 平局！获得 ${expGain} 经验和 ${goldGain} 金币。`)
  } else {
    addLog(`💀 PVP败北...获得 ${expGain} 经验和 ${goldGain} 金币。`)
  }

  // 委托 store 处理升级、技能解锁、称号弹窗、排行榜记录、存档
  store.recordPvpResult({ won: won.value })
}

function rematch() {
  sfxClick()
  if (opponentTimer) { clearTimeout(opponentTimer); opponentTimer = null }
  // 重置状态
  pvpState.value = 'idle'
  currentRound.value = 0
  playerScore.value = 0
  opponentScore.value = 0
  pvpLog.value = []
  currentQuestion.value = null
  answerSubmitted.value = false
  lastAnswerCorrect.value = false

  // 生成新对手
  opponent.value = generateOpponent()
  store.hp = store.maxHp

  addLog('🔄 新的PVP对战开始！')
}

function exitPvp() {
  sfxClick()
  // 恢复满血
  store.hp = store.maxHp
  store.saveGame()
  emit('exit')
}

onMounted(() => {
  addLog('⚔️ PVP对战模式开启！')
  addLog(`你的对手：${opponent.value.name}`)
  addLog(`规则：${maxRounds} 回合答题对决，得分高者获胜！`)
})

onUnmounted(() => {
  // 清理定时器，避免组件卸载后回调执行
  if (opponentTimer) { clearTimeout(opponentTimer); opponentTimer = null }
  // 确保不残留状态
  store.hp = Math.max(store.hp, 1)
  store.saveGame()
})
</script>

<style scoped>
.pvp-battle-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pvp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pvp-badge {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  padding: 4px 14px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
}

.pvp-round-info {
  font-size: 13px;
  color: #d4a853;
  background: rgba(212, 168, 83, 0.1);
  padding: 4px 12px;
  border-radius: 6px;
}

/* 战场 */
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

/* 计分板 */
.pvp-scoreboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 10px 16px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.score-label {
  font-size: 11px;
  color: #888;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
}

.player-score .score-value {
  color: #4ecdc4;
}

.enemy-score .score-value {
  color: #e74c3c;
}

.score-divider {
  font-size: 20px;
  color: #555;
  font-weight: bold;
}

/* 战斗日志 */
.pvp-battle-log {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 12px;
  max-height: 120px;
  overflow-y: auto;
}

.pvp-log-msg {
  padding: 3px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-size: 12px;
  color: #aaa;
  line-height: 1.5;
}

/* 操作区 */
.pvp-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pvp-rules-hint {
  font-size: 12px;
  color: #888;
  line-height: 1.6;
  background: rgba(212, 168, 83, 0.08);
  border: 1px solid rgba(212, 168, 83, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
}

.pvp-btn-answer {
  padding: 14px 20px;
  background: linear-gradient(135deg, #4ecdc4, #2ecc71);
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pvp-btn-answer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
}

.pvp-btn-exit {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.08);
  color: #888;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.pvp-btn-exit:hover {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}

/* 答题面板 */
.pvp-quiz-panel {
  background: rgba(26, 26, 26, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
}

.pvp-question {
  font-size: 14px;
  color: #f4d03f;
  margin-bottom: 12px;
  line-height: 1.5;
}

.pvp-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pvp-option-btn {
  padding: 12px 16px;
  background: #333;
  color: #e0e0e0;
  border: 2px solid #444;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.pvp-option-btn:hover:not(:disabled) {
  background: #444;
  border-color: #d4a853;
}

.pvp-option-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pvp-answer-feedback {
  text-align: center;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  animation: feedback-pop 0.3s ease;
}

.pvp-answer-feedback.correct {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.pvp-answer-feedback.wrong {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

@keyframes feedback-pop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.pvp-btn-next {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  background: #4ecdc4;
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.pvp-btn-next:hover {
  transform: translateY(-2px);
}

/* 结果面板 */
.pvp-result {
  text-align: center;
  padding: 24px 16px;
  border-radius: 14px;
}

.pvp-result.pvp-won {
  background: rgba(46, 204, 113, 0.12);
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.pvp-result.pvp-lost {
  background: rgba(231, 76, 60, 0.12);
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.pvp-result.pvp-draw {
  background: rgba(241, 196, 15, 0.1);
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.pvp-result-icon {
  font-size: 3em;
  margin-bottom: 8px;
}

.pvp-result-title {
  font-size: 20px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 16px;
}

.pvp-result-scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px 24px;
  margin-bottom: 16px;
}

.result-score-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #c0c0c0;
}

.result-score-val {
  font-weight: bold;
  color: #e0e0e0;
}

.pvp-result-reward {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 12px;
  background: rgba(212, 168, 83, 0.08);
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #f4d03f;
}

.pvp-result-actions {
  display: flex;
  gap: 10px;
}

.pvp-btn-rematch {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.pvp-btn-rematch:hover {
  transform: translateY(-2px);
}
</style>
