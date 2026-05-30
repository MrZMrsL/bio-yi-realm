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

    <button v-if="hasSave" class="continue-btn" @click="onContinue">继续冒险</button>
    <button class="start-btn" @click="onStart">{{ hasSave ? '重新开始' : '开始冒险' }}</button>
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
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  padding: 20px 16px 40px;
  gap: 12px;
}

.title-container {
  text-align: center;
  margin-top: 10vh;
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
  transition: transform 0.2s, box-shadow 0.2s;
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
  transition: transform 0.2s, box-shadow 0.2s;
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
