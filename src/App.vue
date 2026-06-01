<script setup>
import { useGameStore } from './stores/game.js'
import TitleScreen from './components/TitleScreen.vue'
import GameContainer from './components/GameContainer.vue'

import CharacterSelect from './components/CharacterSelect.vue'

const store = useGameStore()
function handleStart() {
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
