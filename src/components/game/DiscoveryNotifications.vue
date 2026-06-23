<template>
  <TransitionGroup
    v-if="store.newDiscoveries.length > 0"
    tag="div"
    name="discovery"
    class="discovery-notifications"
  >
    <div v-for="notif in store.newDiscoveries" :key="notif.id" class="discovery-notif">
      <div class="discovery-notif-title">📖 新发现！</div>
      <div class="discovery-notif-text">发现{{ notif.type }}"{{ notif.name }}"</div>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { useGameStore } from '../../stores/game.ts'

const store = useGameStore()
</script>

<style scoped>
.discovery-notifications {
  position: fixed;
  top: 60px;
  right: 12px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.discovery-notif {
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  animation: notif-pop 0.3s ease;
  max-width: 220px;
}

.discovery-notif-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.discovery-notif-text {
  font-size: 13px;
}

/* TransitionGroup 进出场动画 */
.discovery-enter-active,
.discovery-leave-active {
  transition: all 0.35s ease;
}

.discovery-enter-from {
  transform: translateX(100px);
  opacity: 0;
}

.discovery-leave-to {
  transform: translateX(100px) scale(0.9);
  opacity: 0;
}

.discovery-leave-active {
  position: absolute;
}

.discovery-move {
  transition: transform 0.35s ease;
}
</style>
