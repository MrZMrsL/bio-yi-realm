<template>
  <div class="battle-log">
    <div v-for="(msg, i) in store.battleLog" :key="i" class="log-msg">{{ msg }}</div>
  </div>
</template>

<script setup>
import { useGameStore } from '../../stores/game.ts'

const store = useGameStore()
</script>

<style scoped>
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

@media (min-width: 768px) {
  .battle-log {
    background: rgba(26, 26, 26, 0.7) !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
}
</style>
