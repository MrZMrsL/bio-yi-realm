<template>
  <div ref="logRef" class="pvp-battle-log">
    <div v-for="(msg, i) in log" :key="i" class="pvp-log-msg">{{ msg }}</div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  log: { type: Array, default: () => [] },
})

const logRef = ref(null)

watch(
  () => props.log.length,
  async () => {
    await nextTick()
    if (logRef.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight
    }
  }
)

defineExpose({ logRef })
</script>

<style scoped>
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
</style>
