<template>
  <div class="fishing-area">
    <div class="water-surface">
      <div v-if="fishingState === 'waiting'" class="ripple"></div>
      <div v-if="caughtFish" class="fish-icon">{{ caughtFish.icon }}</div>
      <div class="rod-icon" :class="{ casting: fishingState === 'casting', bite: fishingState === 'bite' }">🎣</div>
    </div>

    <div class="fishing-status">
      <span v-if="fishingState === 'idle'">水面平静，鱼儿在深处游动...</span>
      <span v-if="fishingState === 'casting'">鱼线已抛入水中，等待鱼儿上钩...</span>
      <span v-if="fishingState === 'bite'">🚨 有鱼咬钩！快收杆！</span>
      <span v-if="fishingState === 'caught' && caughtFish">
        钓到了
        <span class="rarity-badge" :style="{ color: rarityConfig[caughtFish.rarity]?.color }"> [{{ rarityConfig[caughtFish.rarity]?.label }}] </span>
        <strong>{{ caughtFish.name }}</strong>
        ！
      </span>
      <span v-if="fishingState === 'book' && caughtBook">
        钓到了 <span class="rarity-badge" style="color: #d4a853">[古籍]</span> <strong>{{ caughtBook.name }}</strong>
        ！
      </span>
      <span v-if="fishingState === 'bookStudyQuiz'">📚 正在研读古籍，请答题...</span>
      <span v-if="fishingState === 'bookStudySuccess'">🎉 研读成功！获得经验！</span>
      <span v-if="fishingState === 'bookStudyFail'">😢 研读失败，古籍化为灰烬...</span>
      <span v-if="fishingState === 'limitQuiz'">🔒 钓鱼次数已达上限，请答题解锁...</span>
      <span v-if="fishingState === 'limitLocked'">🔒 答题失败，今日无法继续钓鱼...</span>
    </div>

    <button
      type="button"
      class="fish-btn"
      :class="{ disabled: fishingState !== 'idle' && fishingState !== 'bite' }"
      :disabled="
        fishingState === 'casting' ||
        fishingState === 'caught' ||
        fishingState === 'book' ||
        fishingState === 'bookStudyQuiz' ||
        fishingState === 'bookStudySuccess' ||
        fishingState === 'bookStudyFail' ||
        fishingState === 'limitQuiz' ||
        fishingState === 'limitLocked'
      "
      @click="emit('action')"
    >
      <span v-if="fishingState === 'idle'">开始钓鱼</span>
      <span v-if="fishingState === 'casting'">等待中...</span>
      <span v-if="fishingState === 'bite'">🎣 收杆！</span>
      <span v-if="fishingState === 'caught'">已捕获</span>
      <span v-if="fishingState === 'book'">已发现</span>
      <span v-if="fishingState === 'bookStudyQuiz'">研读中...</span>
      <span v-if="fishingState === 'bookStudySuccess'">研读完成</span>
      <span v-if="fishingState === 'bookStudyFail'">研读失败</span>
      <span v-if="fishingState === 'limitQuiz'">答题解锁</span>
      <span v-if="fishingState === 'limitLocked'">已锁定</span>
    </button>
  </div>
</template>

<script setup>
import { RARITY_CONFIG } from '../../data/fishingMeta.ts'

defineProps({
  fishingState: { type: String, default: 'idle' },
  caughtFish: { type: Object, default: null },
  caughtBook: { type: Object, default: null },
})

const emit = defineEmits(['action'])

const rarityConfig = RARITY_CONFIG
</script>

<style scoped>
.fishing-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(15, 52, 96, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(212, 168, 83, 0.2);
}

.water-surface {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(180deg, #1a5f9e 0%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 3px solid rgba(212, 168, 83, 0.3);
  overflow: hidden;
}

.ripple {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: ripple 1.5s ease-out infinite;
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.rod-icon {
  font-size: 40px;
  transition: transform 0.3s;
}

.rod-icon.casting {
  animation: cast 1s ease-in-out infinite;
}

.rod-icon.bite {
  animation: shake 0.2s ease-in-out infinite;
}

@keyframes cast {
  0%,
  100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0) rotate(-5deg);
  }
  25% {
    transform: translateX(-5px) rotate(5deg);
  }
  75% {
    transform: translateX(5px) rotate(-5deg);
  }
}

.fish-icon {
  font-size: 50px;
  animation: float 2s ease-in-out infinite;
  position: absolute;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.fishing-status {
  font-size: 14px;
  color: #a0a0a0;
  text-align: center;
  min-height: 20px;
}

.rarity-badge {
  font-weight: bold;
}

.fish-btn {
  padding: 12px 36px;
  font-size: 16px;
  font-weight: bold;
  color: #1a1a2e;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  border: none;
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(212, 168, 83, 0.4);
}

.fish-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 168, 83, 0.5);
}

.fish-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
