<template>
  <div class="title-screen">
    <div class="title-particles"></div>
    <div class="title-container">
      <h1 class="game-title">生化易界 · 肉鸽冒险</h1>
      <p class="game-subtitle">以知识为刃，斩破混沌迷雾</p>
    </div>

    <div class="title-desc-box">
      <p class="desc-paragraph">
        踏入「生化易界」，你将手持知识之刃，闯入由化学方程式、生命密码与古老卦象交织而成的无尽地牢。这里每一间密室都藏着一个智慧的试炼。
      </p>
      <p class="desc-paragraph">
        答对题目即可触发「知识暴击」重创敌人；钓鱼悟道可得天地灵气加持；收集奇材锻造专属神兵——三大知识体系相辅相成，助你层层突破。
      </p>
      <p class="desc-paragraph">从初入易门的懵懂学子，到贯通三界的生化至尊，这条知识朝圣之路，等待勇者来征服。</p>
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

    <button
v-if="hasSave && !wantsNewGame"
      type="button"
      class="continue-btn"
      :disabled="store.isLoadingQuestions"
      @click="onContinue"
    >
      继续冒险
    </button>

    <!-- 名字输入：新游戏时强制显示，有存档时点击"重新开始"后显示 -->
    <div v-if="!hasSave || wantsNewGame" class="name-section">
      <label class="name-label">输入你的游戏名</label>
      <input
        v-model="playerNameInput"
        class="name-input"
        :class="{ 'name-error': nameError }"
        type="text"
        placeholder="请取一个响亮的代号..."
        maxlength="12"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @focus="nameError = false"
        @keyup.enter="onStart"
      />
      <span v-if="nameError" class="name-error-text">名字不能为空</span>
    </div>

    <button
v-if="hasSave && !wantsNewGame"
      type="button"
      class="start-btn"
      :disabled="store.isLoadingQuestions"
      @click="onNewGameClick"
    >
      {{ store.isLoadingQuestions ? '📚 加载知识库中...' : '重新开始' }}
    </button>
    <button v-else type="button" class="start-btn" :disabled="store.isLoadingQuestions" @click="onStart">
      {{ store.isLoadingQuestions ? '📚 加载知识库中...' : '开始冒险' }}
    </button>
    <span class="version-text">v4.0 — 生化易界 · Vue 重构版</span>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useGameStore } from '../stores/game.ts'
import { useToast } from '../composables/useToast.js'
import { useDialog } from '../composables/useDialog.js'
import { useGuideStore } from '../stores/guideStore.ts'

const store = useGameStore()
const guideStore = useGuideStore()
const toast = useToast()
const dialog = useDialog()
const emit = defineEmits(['start', 'continue'])

onMounted(() => {
  // 新玩家首次进入标题页时展示欢迎引导
  if (!store.hasSave()) {
    guideStore.showStep('welcome')
  }
})

const playerNameInput = ref('')
const nameError = ref(false)
const wantsNewGame = ref(false)

const hasSave = computed(() => store.hasSave())

async function onStart() {
  const name = playerNameInput.value.trim()
  if (!name) {
    nameError.value = true
    return
  }
  if (hasSave.value) {
    const confirmed = await dialog.confirm({
      title: '覆盖存档确认',
      message: '已有存档，重新开始将覆盖原有进度，确认吗？',
      confirmText: '覆盖并开始',
      cancelText: '取消',
    })
    if (confirmed) {
      store.deleteSave()
      toast.success('旧存档已清除，开始新冒险！')
      emit('start', name)
    }
  } else {
    emit('start', name)
  }
}

function onNewGameClick() {
  // 有存档时点"重新开始"：先显示名字输入框
  wantsNewGame.value = true
}

function onContinue() {
  emit('continue')
}
</script>

<style scoped>
.title-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%);
  background-size: 200% 200%;
  z-index: 1;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  padding: 20px 16px 40px;
  gap: 12px;
}

/* 星空粒子层 — 简化版静态星星 */
.title-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.title-particles::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.25) 50%, transparent 50%),
    radial-gradient(1px 1px at 50% 20%, rgba(255, 255, 255, 0.2) 50%, transparent 50%),
    radial-gradient(1px 1px at 80% 40%, rgba(255, 255, 255, 0.25) 50%, transparent 50%),
    radial-gradient(2px 2px at 35% 70%, rgba(255, 255, 255, 0.3) 50%, transparent 50%),
    radial-gradient(1px 1px at 70% 80%, rgba(255, 255, 255, 0.2) 50%, transparent 50%);
  opacity: 0.4;
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
  text-shadow: 0 2px 10px rgba(212, 168, 83, 0.3);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.game-subtitle {
  font-size: 14px;
  color: #a0a0a0;
  letter-spacing: 4px;
}

.title-desc-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  max-width: 440px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.title-desc-box .desc-paragraph {
  font-size: 13px;
  line-height: 1.7;
  color: #b0b0b0;
  margin-bottom: 8px;
}

.title-desc-box .desc-paragraph:last-child {
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
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px 12px;
}

.feature-icon {
  font-size: 20px;
  filter: drop-shadow(0 1px 3px rgba(212, 168, 83, 0.3));
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
  box-shadow: 0 4px 15px rgba(212, 168, 83, 0.4);
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease;
  position: relative;
  z-index: 1;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 168, 83, 0.6);
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
  box-shadow: 0 4px 15px rgba(74, 144, 217, 0.4);
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease;
  position: relative;
  z-index: 1;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 217, 0.6);
}

.continue-btn:active {
  transform: translateY(0);
}

/* 名字输入 */
.name-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 300px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.name-label {
  font-size: 13px;
  color: #a0a0a0;
  letter-spacing: 1px;
}

.name-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  color: #e0e0e0;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(212, 168, 83, 0.3);
  border-radius: 10px;
  text-align: center;
  outline: none;
  cursor: text;
  pointer-events: auto;
  position: relative;
  z-index: 2;
  -webkit-user-select: text;
  user-select: text;
  -webkit-appearance: none;
  appearance: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.name-input::placeholder {
  color: #666;
  font-size: 14px;
}

.name-input:focus {
  border-color: rgba(212, 168, 83, 0.7);
  box-shadow: 0 0 12px rgba(212, 168, 83, 0.15);
}

.name-input.name-error {
  border-color: #e74c3c;
  box-shadow: 0 0 8px rgba(231, 76, 60, 0.2);
}

/* #ifdef H5 */
/* uni-app H5 会把 <input> 渲染成 <uni-input>，真正的 input 在内部。
   下面的样式穿透到内部 input，确保它占满容器、可以被点击聚焦。 */
:deep(.name-input) .uni-input-input {
  height: 100% !important;
  min-height: 100% !important;
  width: 100% !important;
  padding: 12px 16px !important;
  font-size: 16px !important;
  color: #e0e0e0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 10px !important;
  text-align: center !important;
  outline: none !important;
  -webkit-user-select: text !important;
  user-select: text !important;
}
/* #endif */

.name-error-text {
  font-size: 12px;
  color: #e74c3c;
}

.version-text {
  font-size: 11px;
  color: #666;
  margin-top: 8px;
}
</style>
