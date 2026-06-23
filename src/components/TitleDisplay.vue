<template>
  <div v-if="visible" class="title-display-overlay" @click.self="close">
    <div class="title-display-panel" :class="{ 'title-enter': animating }">
      <!-- 顶部装饰 -->
      <div class="title-decorative-bar"></div>

      <!-- 标题区 -->
      <div class="title-badge-area">
        <span class="title-badge-icon">🏆</span>
        <span class="title-badge-text">称号晋升</span>
      </div>

      <!-- 称号名大字 -->
      <div class="title-name-large">
        <span class="title-name-text">{{ titleInfo.title }}</span>
      </div>

      <!-- 时代 & 领域标签 -->
      <div class="title-tags">
        <span class="title-tag era-tag">📅 {{ titleInfo.era }}</span>
        <span class="title-tag field-tag">📚 {{ titleInfo.field }}</span>
      </div>

      <!-- 分隔线 -->
      <div class="title-divider">
        <span class="divider-line"></span>
        <span class="divider-icon">⭐</span>
        <span class="divider-line"></span>
      </div>

      <!-- 人物简介 -->
      <div class="title-bio-section">
        <div class="title-section-label">📖 人物简介</div>
        <p class="title-bio-text">{{ titleInfo.bio }}</p>
      </div>

      <!-- 成就列表 -->
      <div v-if="titleInfo.achievements && titleInfo.achievements.length > 0" class="title-achievements-section">
        <div class="title-section-label">🏅 主要成就</div>
        <ul class="title-achievements-list">
          <li v-for="(ach, idx) in titleInfo.achievements" :key="idx" class="title-achievement-item">
            <span class="ach-marker">✦</span>
            <span class="ach-text">{{ ach }}</span>
          </li>
        </ul>
      </div>

      <!-- 升级提示 -->
      <div class="title-levelup-info">
        <span class="levelup-text">🎊 恭喜达到 Lv.{{ level }}，解锁新称号！</span>
      </div>

      <!-- 关闭按钮 -->
      <button type="button" class="title-close-btn" @click="close">继续冒险 →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getTitleData } from '../data/titles.ts'

const props = defineProps({
  level: { type: Number, default: 1 },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const animating = ref(false)

const titleInfo = computed(() => {
  const data = getTitleData(props.level)
  return (
    data || {
      title: '未知称号',
      era: '未知',
      field: '未知',
      bio: '称号数据加载失败...',
      achievements: [],
    }
  )
})

// 每次 visible 变为 true 时触发入场动画
watch(
  () => props.visible,
  val => {
    if (val) {
      animating.value = false
      // 下一帧触发动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animating.value = true
        })
      })
    }
  }
)

function close() {
  animating.value = false
  emit('close')
}
</script>

<style scoped>
.title-display-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 20px;
  animation: overlay-fade-in 0.3s ease;
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.title-display-panel {
  background: linear-gradient(160deg, #1a1a2e, #16213e, #0f3460);
  border: 2px solid rgba(212, 168, 83, 0.3);
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 0;
  transform: scale(0.8);
  opacity: 0;
  transition:
    transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity 0.4s ease;
}

.title-display-panel.title-enter {
  transform: scale(1);
  opacity: 1;
}

.title-decorative-bar {
  height: 4px;
  background: linear-gradient(90deg, #d4a853, #f4d03f, #e8c67a, #d4a853);
  border-radius: 20px 20px 0 0;
}

/* 称号徽章 */
.title-badge-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 20px 8px;
}

.title-badge-icon {
  font-size: 28px;
  animation: badge-float 2s ease-in-out infinite;
}

@keyframes badge-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.title-badge-text {
  font-size: 14px;
  color: #d4a853;
  font-weight: bold;
  letter-spacing: 2px;
}

/* 称号名 */
.title-name-large {
  text-align: center;
  padding: 8px 20px 16px;
}

.title-name-text {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #f4d03f, #d4a853, #f4d03f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 2px 6px rgba(212, 168, 83, 0.4));
}

/* 标签 */
.title-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 0 20px 20px;
}

.title-tag {
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
}

.era-tag {
  background: rgba(52, 152, 219, 0.15);
  color: #5dade2;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.field-tag {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

/* 分隔线 */
.title-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 24px 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.3), transparent);
}

.divider-icon {
  font-size: 14px;
  color: #d4a853;
}

/* 简介 */
.title-bio-section {
  padding: 0 24px 16px;
}

.title-section-label {
  font-size: 12px;
  color: #d4a853;
  font-weight: bold;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.title-bio-text {
  font-size: 13px;
  color: #b0b0b0;
  line-height: 1.7;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* 成就 */
.title-achievements-section {
  padding: 0 24px 16px;
}

.title-achievements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-achievement-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;
  color: #c0c0c0;
}

.ach-marker {
  color: #d4a853;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 1px;
}

.ach-text {
  line-height: 1.5;
}

/* 升级提示 */
.title-levelup-info {
  padding: 0 24px 16px;
  text-align: center;
}

.levelup-text {
  font-size: 15px;
  color: #f4d03f;
  font-weight: bold;
}

/* 关闭按钮 */
.title-close-btn {
  display: block;
  width: calc(100% - 48px);
  margin: 0 auto 24px;
  padding: 14px 0;
  background: linear-gradient(135deg, #d4a853, #e8c67a);
  color: #1a1a2e;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.title-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 168, 83, 0.4);
}
</style>
