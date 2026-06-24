<script setup>
import { watch, onMounted } from 'vue'
import { useGameStore } from '@/stores/game.ts'
import { ensureQuestionsForSpec, loadError } from '@/data/questions.ts'
import { useToast } from '@/composables/useToast.js'
import { attachAudioUnlockListeners } from '@/platform/audio.js'
import TitleScreen from '@/components/TitleScreen.vue'
import GameContainer from '@/components/GameContainer.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import DialogModal from '@/components/DialogModal.vue'
import CharacterSelect from '@/components/CharacterSelect.vue'
import TutorialModal from '@/components/TutorialModal.vue'
import { useGuideStore } from '@/stores/guideStore.ts'

const store = useGameStore()
const guideStore = useGuideStore()
const toast = useToast()

// 浏览器自动播放策略：首次用户交互后解锁音频上下文
onMounted(() => {
  attachAudioUnlockListeners()
})

// 题库加载失败时提示用户
watch(loadError, err => {
  if (err) {
    toast.error(err)
  }
})

// 仅当玩家选择/加载了具体专精后再预加载对应学科题库
watch(
  () => store.playerSpecialization,
  spec => {
    if (spec) {
      ensureQuestionsForSpec(spec)
    }
  },
  { immediate: true }
)

function handleStart(playerName) {
  store.playerName = playerName
  store.startGame()
}
function handleContinue() {
  store.loadGame()
}
function handleSelect(spec) {
  store.setSpecialization(spec)
}
</script>

<template>
  <TitleScreen v-if="!store.gameStarted" @start="handleStart" @continue="handleContinue" />
  <CharacterSelect v-else-if="!store.playerSpecialization" @select="handleSelect" />
  <GameContainer v-else />
  <TutorialModal />
  <ToastContainer />
  <DialogModal />
</template>
