<template>
  <!-- 战斗操作区 -->
  <div v-if="store.battleState === 'idle'" class="battle-actions">
    <button type="button" class="btn-answer" @click="emit('start-answer')">📚 知识攻击</button>
    <div class="action-subrow">
      <button type="button" class="btn-potion" @click="showPotionPanel = true">🧪 药水</button>
      <button type="button" class="btn-card" @click="showCardPanel = true">🃏 道具卡</button>
      <button type="button" class="btn-flee" @click="store.flee">🏃 逃跑</button>
    </div>
  </div>

  <!-- 答题面板 -->
  <div v-if="store.battleState === 'answering'" class="quiz-panel">
    <div v-if="store.gameMode === 'weekly_boss'" class="time-limit-hint">
      ⏱️ 限时 {{ store.weeklyBossData?.timeLimit || 30 }} 秒
    </div>
    <div class="active-card-badges">
      <span v-if="store.activeCardEffects.shield" class="card-badge shield">🛡️ 护盾生效中</span>
      <span v-if="store.activeCardEffects.crit" class="card-badge crit">⚔️ 暴击生效中</span>
    </div>
    <div class="question">{{ store.question?.q }}</div>
    <div class="options">
      <button
        v-for="(opt, i) in store.question?.options"
        :key="i"
        type="button"
        class="option-btn"
        :class="{ 'hint-removed': store.activeCardEffects.hintedOptions.includes(i) }"
        :disabled="store.activeCardEffects.hintedOptions.includes(i)"
        @click="submitAnswer(i)"
      >
        <span v-if="store.activeCardEffects.hintedOptions.includes(i)" class="hint-mark">❌</span>
        <span v-else>{{ opt }}</span>
      </button>
    </div>
  </div>

  <!-- 药水面板 -->
  <div v-if="showPotionPanel && store.battleState === 'idle'" class="potion-panel">
    <div class="potion-list">
      <button v-for="item in store.consumables" :key="item.id" type="button" class="potion-btn" @click="usePotion(item.id)">
        {{ item.icon }} {{ item.name }}
      </button>
      <button v-if="store.consumables.length === 0" type="button" disabled class="potion-btn empty">无药水</button>
    </div>
    <button type="button" class="btn-cancel" @click="showPotionPanel = false">取消</button>
  </div>

  <!-- 道具卡面板 -->
  <div v-if="showCardPanel && store.battleState === 'idle'" class="card-panel">
    <div class="card-list">
      <button
        v-for="card in BATTLE_CARDS"
        :key="card.id"
        type="button"
        class="card-btn"
        :disabled="(store.battleCards[card.id] || 0) <= 0"
        @click="useCard(card.id)"
      >
        <span class="card-icon">{{ card.icon }}</span>
        <span class="card-name">{{ card.name }}</span>
        <span class="card-count">×{{ store.battleCards[card.id] || 0 }}</span>
      </button>
      <button v-if="totalCards === 0" type="button" disabled class="card-btn empty">无道具卡</button>
    </div>
    <div class="card-hint">💡 提示卡只能在答题时使用</div>
    <button type="button" class="btn-cancel" @click="showCardPanel = false">取消</button>
  </div>

  <!-- 掉落展示 -->
  <div v-if="store.battleState === 'drop'" class="result drop">
    <div class="result-title">🎁 发现战利品！</div>
    <div v-if="store.drop" class="drop-card">
      <div v-if="store.drop.type === 'equipment'" class="drop-icon" :class="store.drop.item.type">
        {{ store.drop.item.type === 'weapon' ? '⚔️' : store.drop.item.type === 'armor' ? '🛡️' : '💍' }}
      </div>
      <div v-else-if="store.drop.type === 'battleCard'" class="drop-icon">{{ store.drop.item.icon }}</div>
      <div v-else class="drop-icon">🧪</div>
      <div class="drop-info">
        <div
          v-if="store.drop.type === 'equipment'"
          class="drop-name"
          :style="{ color: qualityColor(store.drop.item.level) }"
        >
          {{ store.drop.item.name }} <span class="drop-level">Lv.{{ store.drop.item.level }}</span>
        </div>
        <div v-else-if="store.drop.type === 'battleCard'" class="drop-name">{{ store.drop.item.name }}</div>
        <div v-else class="drop-name">{{ store.drop.item.name }} ×{{ store.drop.item.count }}</div>
        <div v-if="store.drop.type === 'equipment'" class="drop-stats">
          <span v-if="store.drop.item.atk">⚔️ {{ store.drop.item.atk }}</span>
          <span v-if="store.drop.item.def">🛡️ {{ store.drop.item.def }}</span>
        </div>
        <div class="drop-desc">{{ store.drop.item.desc }}</div>
      </div>
    </div>
    <div v-if="store.captureMonsterData" class="drop-capture-hint">
      🐾 收下战利品后，可以收养 <strong>{{ store.captureMonsterData.name }}</strong>
    </div>
    <button type="button" class="btn-next" @click="store.claimDrop">收下</button>
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
        <button type="button" class="btn-capture" @click="store.startCapture">🐾 尝试收养</button>
        <button type="button" class="btn-skip" @click="store.skipCapture">放弃</button>
      </div>
    </div>
    <div v-else>
      <button type="button" class="btn-next" @click="emit('next-battle')">继续探索</button>
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
          wrong: i <= store.captureIndex && i > store.captureCorrectCount,
        }"
      ></div>
    </div>
    <div class="question">{{ store.captureQuestions[store.captureIndex]?.q }}</div>
    <div class="options">
      <button
        v-for="(opt, i) in store.captureQuestions[store.captureIndex]?.options"
        :key="i"
        type="button"
        class="option-btn"
        @click="submitCaptureAnswer(i)"
      >
        {{ opt }}
      </button>
    </div>
  </div>

  <!-- 传说Boss战过渡 -->
  <div v-if="store.battleState === 'legendaryBossFight'" class="result legendary-boss">
    <div class="result-title">⭐ 传说试炼</div>
    <div class="legendary-boss-intro">
      <div class="legendary-icon">{{ store.enemy?.icon }}</div>
      <div class="legendary-name">{{ store.enemy?.name }}</div>
      <div class="legendary-desc">传说级怪物的最终试炼！击败守护者才能真正收服它。</div>
      <div class="legendary-stats">
        <span>❤️ {{ store.enemy?.hp }} / {{ store.enemy?.maxHp }}</span>
        <span>⚔️ {{ store.enemy?.atk }}</span>
        <span>🛡️ {{ store.enemy?.def }}</span>
      </div>
    </div>
    <button type="button" class="btn-legendary" @click="emit('start-legendary-boss')">🔥 接受挑战</button>
  </div>

  <!-- 捕捉成功 -->
  <div v-if="store.battleState === 'captureSuccess'" class="result capture-result success">
    <div class="result-title">🎉 收养成功！</div>
    <div class="capture-result-icon">{{ store.farm[store.farm.length - 1]?.icon }}</div>
    <div class="capture-result-name">{{ store.farm[store.farm.length - 1]?.name }}</div>
    <div class="capture-result-desc">已成为你的伙伴！</div>
    <button type="button" class="btn-next" @click="emit('next-battle')">返回房间</button>
  </div>

  <!-- 捕捉失败 -->
  <div v-if="store.battleState === 'captureFail'" class="result capture-result fail">
    <div class="result-title">😢 怪物逃跑了</div>
    <div class="capture-result-desc">答题失败，怪物消失在黑暗中...</div>
    <button type="button" class="btn-next" @click="emit('next-battle')">返回房间</button>
  </div>

  <!-- 战败 -->
  <div v-if="store.battleState === 'lost'" class="result lost">
    <div class="result-title">💀 战败</div>
    <button type="button" class="btn-revive" @click="emit('revive')">复活（回到第1层）</button>
  </div>

  <!-- 逃跑 -->
  <div v-if="store.battleState === 'fled'" class="result fled">
    <div class="result-title">已逃跑</div>
    <button type="button" class="btn-back" @click="store.exitBattle">返回</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/game.ts'
import { BATTLE_CARDS } from '../../data/battleCards.ts'
import { sfxClick } from '../../utils/sfx.ts'

const store = useGameStore()
const showPotionPanel = ref(false)
const showCardPanel = ref(false)

const totalCards = computed(() => {
  return Object.values(store.battleCards || {}).reduce((sum, count) => sum + count, 0)
})

const emit = defineEmits(['start-answer', 'next-battle', 'revive', 'start-legendary-boss'])

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

function submitAnswer(index) {
  sfxClick()
  const correct = index === store.question?.answer
  if (store.gameMode === 'weekly_boss') {
    store.weeklyBossAnswerAttack(correct)
  } else {
    store.answerAttack(correct)
  }
}

function usePotion(itemId) {
  sfxClick()
  store.usePotion(itemId)
  showPotionPanel.value = false
}

function useCard(cardId) {
  sfxClick()
  store.useBattleCard(cardId)
  showCardPanel.value = false
}

function submitCaptureAnswer(index) {
  sfxClick()
  store.submitCaptureAnswer(index)
}

function qualityColor(level) {
  if (level >= 5) return '#9b59b6'
  if (level >= 4) return '#3498db'
  if (level >= 3) return '#2ecc71'
  return '#e0e0e0'
}
</script>

<style scoped>
.battle-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-subrow {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.battle-actions button,
.option-btn,
.potion-btn,
.btn-cancel,
.btn-next,
.btn-revive,
.btn-back,
.btn-capture,
.btn-skip {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s;
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
  color: #1a1a2a;
}

.btn-card {
  background: #9b59b6;
  color: white;
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
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
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

.card-panel {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.card-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #333;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.card-btn:hover:not(:disabled) {
  background: #444;
}

.card-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.card-icon {
  font-size: 20px;
}

.card-name {
  flex: 1;
  font-size: 14px;
}

.card-count {
  font-size: 13px;
  color: #d4a853;
  font-weight: bold;
}

.card-hint {
  font-size: 12px;
  color: #888;
  text-align: center;
  margin-bottom: 10px;
}

.active-card-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.card-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: bold;
}

.card-badge.shield {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.card-badge.crit {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.option-btn.hint-removed {
  opacity: 0.35;
  text-decoration: line-through;
  cursor: not-allowed;
}

.hint-mark {
  color: #e74c3c;
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

.drop-capture-hint {
  margin: 12px 0 4px;
  padding: 10px 14px;
  background: rgba(46, 204, 113, 0.12);
  border: 1px solid rgba(46, 204, 113, 0.25);
  border-radius: 10px;
  font-size: 13px;
  color: #2ecc71;
}

.drop-capture-hint strong {
  color: #d4a853;
}

.result.lost {
  background: rgba(255, 107, 107, 0.2);
}

.result.fled {
  background: rgba(102, 102, 102, 0.2);
}

.result.capture-result.success {
  background: rgba(46, 204, 204, 0.2);
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

.rarity-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  margin-right: 6px;
}

.rarity-badge.common {
  background: rgba(136, 136, 136, 0.2);
  color: #aaa;
}

.rarity-badge.rare {
  background: rgba(52, 152, 219, 0.25);
  color: #5dade2;
}

.rarity-badge.epic {
  background: rgba(155, 89, 182, 0.25);
  color: #af7ac5;
}

.rarity-badge.legendary {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.3), rgba(212, 168, 83, 0.3));
  color: #f1c40f;
  text-shadow: 0 0 6px rgba(241, 196, 15, 0.3);
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

.btn-next,
.btn-revive,
.btn-back {
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

.legendary-boss {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(241, 196, 15, 0.15));
  border: 2px solid rgba(241, 196, 15, 0.3);
  animation: legendary-glow 2s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(241, 196, 15, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(241, 196, 15, 0.5);
  }
}

.legendary-boss-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.legendary-icon {
  font-size: 4em;
  animation: legendary-bounce 1.5s ease-in-out infinite;
}

@keyframes legendary-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.legendary-name {
  font-size: 1.4em;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 0 0 10px rgba(241, 196, 15, 0.4);
}

.legendary-desc {
  font-size: 0.9em;
  color: #c0c0c0;
  text-align: center;
  max-width: 300px;
}

.legendary-stats {
  display: flex;
  gap: 16px;
  font-size: 0.9em;
  color: #e0e0e0;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
}

.btn-legendary {
  background: linear-gradient(135deg, #9b59b6, #f1c40f);
  color: #1a1a2e;
  font-size: 1.1em;
  font-weight: bold;
  padding: 14px 36px;
  border: none;
  border-radius: 28px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(241, 196, 15, 0.4);
  transition: transform 0.2s;
}

.btn-legendary:hover {
  transform: scale(1.05);
}

@media (min-width: 768px) {
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
</style>
