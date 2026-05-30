<script setup>
import { useGameStore } from './stores/game.js'
import TitleScreen from './components/TitleScreen.vue'
import GameContainer from './components/GameContainer.vue'

const store = useGameStore()
</script>

<template>
  <TitleScreen v-if="!store.gameStarted" @start="store.startGame" @continue="store.loadGame" />
  <GameContainer v-else />
</template>
