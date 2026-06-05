<template>
  <div class="title-screen">
    <div class="title-particles"></div>
    <div class="title-container">
      <h1 class="game-title">生化易界 · 肉鸽冒险</h1>
      <p class="game-subtitle">以知识为刃，斩破混沌迷雾</p>
    </div>

    <div class="title-desc-box">
      <p>踏入「生化易界」，你将手持知识之刃，闯入由化学方程式、生命密码与古老卦象交织而成的无尽地牢。这里每一间密室都藏着一个智慧的试炼。</p>
      <p>答对题目即可触发「知识暴击」重创敌人；钓鱼悟道可得天地灵气加持；收集奇材锻造专属神兵——三大知识体系相辅相成，助你层层突破。</p>
      <p>从初入易门的懵懂学子，到贯通三界的生化至尊，这条知识朝圣之路，等待勇者来征服。</p>
    </div>

    <div class="title-features">
      <div class="feature-row">
        <span class="feature-icon">🧪</span>
        <span class="feature-text"><strong>化学领域</strong> — 分子为刃，元素为盾，破解反应之谜</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">🧬</span>
        <span class="feature-text"><strong>生物领域</strong> — 洞察生命密码，驾驭基因之力</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">☯️</span>
        <span class="feature-text"><strong>易学领域</strong> — 通晓阴阳变化，掌握天地玄机</span>
      </div>
    </div>

    <button v-if="hasSave" class="continue-btn" @click="onContinue" :disabled="store.isLoadingQuestions">继续冒险</button>
    <button class="start-btn" @click="onStart" :disabled="store.isLoadingQuestions">
      {{ store.isLoadingQuestions ? '📚 加载知识库中...' : (hasSave ? '重新开始' : '开始冒险') }}
    </button>
    <span class="version-text">v4.0 — 生化易界 · Vue 重构版</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game.js'

const store = useGameStore()
const emit = defineEmits(['start', 'continue'])

const hasSave = computed(() => store.hasSave())

function onStart() {
  if (hasSave.value) {
    // 有存档，确认是否重新开始
    if (confirm('已有存档，重新开始将覆盖原有进度，确认吗？')) {
      store.deleteSave()
      emit('start')
    }
  } else {
    emit('start')
  }
}

function onContinue() {
  emit('continue')
}
</script>

<style scoped>
.title-screen {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%);
  background-size: 200% 200%;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  padding: 20px 16px 40px;
  gap: 12px;
  animation: title-bg-drift 20s ease-in-out infinite;
}

@keyframes title-bg-drift {
  0%   { background-position: 0% 0%; }
  25%  { background-position: 100% 0%; }
  50%  { background-position: 100% 100%; }
  75%  { background-position: 0% 100%; }
  100% { background-position: 0% 0%; }
}

/* 星空粒子层 — CSS radial-gradient 模拟星星 */
.title-particles {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.title-particles::before,
.title-particles::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 200%;
  height: 200%;
  background-repeat: repeat;
  opacity: 0.5;
}

/* 暗星层 — 小点，慢速旋转 */
.title-particles::before {
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.25) 50%, transparent 50%),
    radial-gradient(1px 1px at 40% 10%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 55% 70%, rgba(255,255,255,0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,0.25) 50%, transparent 50%),
    radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 35% 55%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 50% 35%, rgba(255,255,255,0.25) 50%, transparent 50%),
    radial-gradient(1px 1px at 65% 85%, rgba(255,255,255,0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 95% 50%, rgba(255,255,255,0.25) 50%, transparent 50%),
    radial-gradient(1px 1px at 5% 65%, rgba(255,255,255,0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 22% 38%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 45% 75%, rgba(255,255,255,0.25) 50%, transparent 50%),
    radial-gradient(1px 1px at 60% 12%, rgba(255,255,255,0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 75% 92%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.25) 50%, transparent 50%),
    radial-gradient(1px 1px at 12% 50%, rgba(255,255,255,0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 48% 8%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 68% 72%, rgba(255,255,255,0.25) 50%, transparent 50%),
    radial-gradient(1px 1px at 30% 88%, rgba(255,255,255,0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 78% 22%, rgba(255,255,255,0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 42% 62%, rgba(255,255,255,0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 88% 78%, rgba(255,255,255,0.25) 50%, transparent 50%);
  animation: star-drift 60s linear infinite;
}

/* 明星层 — 大一点，反向闪烁 */
.title-particles::after {
  background-image:
    radial-gradient(2px 2px at 15% 25%, rgba(255,255,255,0.5) 50%, transparent 50%),
    radial-gradient(2px 2px at 35% 50%, rgba(255,255,255,0.4) 50%, transparent 50%),
    radial-gradient(2px 2px at 52% 15%, rgba(255,255,255,0.5) 50%, transparent 50%),
    radial-gradient(2px 2px at 68% 65%, rgba(255,255,255,0.45) 50%, transparent 50%),
    radial-gradient(2px 2px at 82% 35%, rgba(255,255,255,0.5) 50%, transparent 50%),
    radial-gradient(2px 2px at 45% 80%, rgba(255,255,255,0.4) 50%, transparent 50%),
    radial-gradient(2px 2px at 72% 10%, rgba(255,255,255,0.5) 50%, transparent 50%),
    radial-gradient(2px 2px at 20% 70%, rgba(255,255,255,0.45) 50%, transparent 50%),
    radial-gradient(2px 2px at 60% 40%, rgba(255,255,255,0.4) 50%, transparent 50%),
    radial-gradient(2px 2px at 90% 55%, rgba(255,255,255,0.45) 50%, transparent 50%);
  opacity: 0.6;
  animation: star-twinkle 4s ease-in-out infinite alternate;
}

@keyframes star-drift {
  from { transform: translate(0, 0); }
  to   { transform: translate(-5%, -5%); }
}

@keyframes star-twinkle {
  0%   { opacity: 0.3; }
  50%  { opacity: 0.7; }
  100% { opacity: 0.4; }
}

.title-container {
  text-align: center;
  margin-top: 10vh;
  position: relative;
  z-index: 1;
}

.game-title {
  font-size: 32px;
  font-weight: bold;
  color: #d4a853;
  text-shadow: 0 2px 10px rgba(212,168,83,0.3);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.game-subtitle {
  font-size: 14px;
  color: #a0a0a0;
  letter-spacing: 4px;
}

.title-desc-box {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  max-width: 440px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.title-desc-box p {
  font-size: 13px;
  line-height: 1.7;
  color: #b0b0b0;
  margin-bottom: 8px;
}

.title-desc-box p:last-child {
  margin-bottom: 0;
}

.title-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 440px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  padding: 10px 12px;
}

.feature-icon {
  font-size: 20px;
  filter: drop-shadow(0 1px 3px rgba(212,168,83,0.3));
}

.feature-text {
  font-size: 13px;
  color: #c0c0c0;
}

.feature-text strong {
  color: #e0e0e0;
}

.start-btn {
  margin-top: 16px;
  padding: 14px 48px;
  font-size: 18px;
  font-weight: bold;
  color: #1a1a2e;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(212,168,83,0.4);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.25s ease;
  position: relative;
  z-index: 1;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212,168,83,0.6);
}

.start-btn:active {
  transform: translateY(0);
}

.continue-btn {
  margin-top: 12px;
  padding: 14px 48px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #4a90d9, #6ba5e7);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(74,144,217,0.4);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.25s ease;
  position: relative;
  z-index: 1;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74,144,217,0.6);
}

.continue-btn:active {
  transform: translateY(0);
}

.version-text {
  font-size: 11px;
  color: #666;
  margin-top: 8px;
}
</style>
