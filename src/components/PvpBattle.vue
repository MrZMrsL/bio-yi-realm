<template>
  <div ref="pvpContainerRef" class="pvp-battle-container">
    <PvpHeader
      :show-round-info="pvpStore.pvpState !== 'idle'"
      :current-round="pvpStore.currentRound"
      :max-rounds="pvpStore.maxRounds"
    />

    <PvpBattlefield :player="pvpStore.playerInfo" :opponent="pvpStore.opponent" />

    <PvpScoreboard
      v-if="pvpStore.pvpState !== 'idle'"
      :player-score="pvpStore.playerScore"
      :opponent-score="pvpStore.opponentScore"
    />

    <PvpLogPanel ref="logPanelRef" :log="pvpStore.pvpLog" />

    <PvpIdleActions
      v-if="pvpStore.pvpState === 'idle'"
      :max-rounds="pvpStore.maxRounds"
      @start="handleStart"
      @exit="handleExit"
    />

    <PvpQuizPanel
      v-if="pvpStore.pvpState === 'answering'"
      :question="pvpStore.currentQuestion"
      :answer-submitted="pvpStore.answerSubmitted"
      :last-answer-correct="pvpStore.lastAnswerCorrect"
      :is-last-round="pvpStore.currentRound >= pvpStore.maxRounds"
      @submit="handleSubmit"
      @next="handleNext"
    />

    <PvpResultPanel
      v-if="pvpStore.pvpState === 'result'"
      :player-score="pvpStore.playerScore"
      :opponent-score="pvpStore.opponentScore"
      :won="pvpStore.won"
      :is-draw="pvpStore.playerScore === pvpStore.opponentScore"
      :reward-exp="pvpStore.rewardExp"
      :reward-gold="pvpStore.rewardGold"
      @rematch="handleRematch"
      @exit="handleExit"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '../stores/game.ts'
import { usePvpStore } from '../stores/pvpStore.ts'
import { sfxClick, sfxCorrect, sfxWrong } from '../utils/sfx.ts'
import PvpHeader from './pvp/PvpHeader.vue'
import PvpBattlefield from './pvp/PvpBattlefield.vue'
import PvpScoreboard from './pvp/PvpScoreboard.vue'
import PvpLogPanel from './pvp/PvpLogPanel.vue'
import PvpIdleActions from './pvp/PvpIdleActions.vue'
import PvpQuizPanel from './pvp/PvpQuizPanel.vue'
import PvpResultPanel from './pvp/PvpResultPanel.vue'

const gameStore = useGameStore()
const pvpStore = usePvpStore()

const emit = defineEmits(['exit'])

const pvpContainerRef = ref(null)
const logPanelRef = ref(null)

// 日志更新时自动滚动到底部
watch(
  () => pvpStore.pvpLog.length,
  () => {
    nextTick(() => {
      if (logPanelRef.value?.logRef) {
        logPanelRef.value.logRef.scrollTop = logPanelRef.value.logRef.scrollHeight
      }
    })
  }
)

function handleStart() {
  sfxClick()
  pvpStore.startRound()
}

function handleSubmit(index) {
  pvpStore.submitAnswer(index)
  if (pvpStore.lastAnswerCorrect) {
    sfxCorrect()
  } else {
    sfxWrong()
  }
}

function handleNext() {
  sfxClick()
  pvpStore.nextRound()
}

function handleRematch() {
  sfxClick()
  pvpStore.rematch()
}

function handleExit() {
  sfxClick()
  gameStore.exitPvp()
  gameStore.saveGame()
  emit('exit')
}

onMounted(() => {
  pvpStore.enterPvp()
})

onUnmounted(() => {
  gameStore.exitPvp()
})
</script>

<style scoped>
.pvp-battle-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow-y: auto;
}
</style>
