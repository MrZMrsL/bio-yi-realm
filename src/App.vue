<script setup>
import { onMounted } from 'vue'
import { useGameStore } from './stores/game.js'
import { preloadQuestions } from './data/questions.js'
import TitleScreen from './components/TitleScreen.vue'
import GameContainer from './components/GameContainer.vue'

import CharacterSelect from './components/CharacterSelect.vue'

const store = useGameStore()

// 页面加载后立即提前加载题库，让用户在标题页时题库就已就绪
onMounted(() => {
  preloadQuestions()
})

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
</template>
