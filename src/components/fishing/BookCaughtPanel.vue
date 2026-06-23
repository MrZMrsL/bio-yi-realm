<template>
  <!-- 古籍发现面板 -->
  <div v-if="fishingState === 'book' && caughtBook" class="caught-panel">
    <div class="caught-card" style="border-color: #d4a853">
      <div class="caught-icon">📖</div>
      <div class="caught-info">
        <div class="caught-name" style="color: #d4a853">
          {{ caughtBook.name }}
        </div>
        <div class="caught-rarity">
          [古籍] {{ caughtBook.rarity === 'epic' ? '史诗' : caughtBook.rarity === 'rare' ? '稀有' : '普通' }}
        </div>
        <div class="caught-knowledge">{{ caughtBook.desc }}</div>
      </div>
    </div>
    <div class="caught-actions">
      <button type="button" class="action-btn eat-btn" @click="emit('start-study')">📚 研读古籍（答题+经验）</button>
      <button type="button" class="action-btn release-btn" @click="emit('collect')">📖 直接收下</button>
    </div>
  </div>

  <!-- 古籍研读答题面板 -->
  <div v-if="fishingState === 'bookStudyQuiz' && store.bookStudyQuestion" class="quiz-panel">
    <div class="quiz-title">📚 研读古籍</div>
    <div class="quiz-hint">答对题目获得经验奖励，答错古籍消失</div>
    <div class="question">{{ store.bookStudyQuestion.q }}</div>
    <div class="options">
      <button
        v-for="(opt, i) in store.bookStudyQuestion.options"
        :key="i"
        type="button"
        class="option-btn"
        @click="submitBookStudyAnswer(i)"
      >
        {{ opt }}
      </button>
    </div>
    <button type="button" class="btn-cancel" @click="emit('cancel-study')">取消研读</button>
  </div>

  <!-- 研读成功 -->
  <div v-if="fishingState === 'bookStudySuccess' && caughtBook" class="quiz-result success">
    <div class="result-icon">🎉</div>
    <div class="result-title">研读《{{ caughtBook.name }}》成功！</div>
    <div class="knowledge-box">
      <div class="knowledge-caption">📖 知识点</div>
      <div class="knowledge-text">{{ caughtBook.desc }}</div>
    </div>
    <div class="result-text">获得 25 经验值，古籍已收藏至自习室</div>
    <button type="button" class="btn-next" @click="emit('continue')">继续钓鱼</button>
  </div>

  <!-- 研读失败 -->
  <div v-if="fishingState === 'bookStudyFail'" class="quiz-result fail">
    <div class="result-icon">😢</div>
    <div class="result-title">研读失败</div>
    <div class="result-text">古籍在你手中化为灰烬...</div>
    <button type="button" class="btn-next" @click="emit('continue')">继续钓鱼</button>
  </div>
</template>

<script setup>
import { useGameStore } from '../../stores/game.ts'
import { sfxClick } from '../../utils/sfx.ts'

const store = useGameStore()

defineProps({
  fishingState: { type: String, default: 'idle' },
  caughtBook: { type: Object, default: null },
})

const emit = defineEmits(['start-study', 'collect', 'submit-study-answer', 'cancel-study', 'continue'])

function submitBookStudyAnswer(index) {
  sfxClick()
  emit('submit-study-answer', index)
}
</script>

<style scoped>
.caught-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.caught-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 52, 96, 0.6);
  border-radius: 12px;
  border: 2px solid;
}

.caught-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.caught-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.caught-name {
  font-size: 18px;
  font-weight: bold;
}

.caught-rarity {
  font-size: 12px;
  color: #888;
}

.caught-knowledge {
  font-size: 13px;
  color: #a0a0a0;
  line-height: 1.5;
}

.caught-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.eat-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: #fff;
}

.release-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.quiz-panel {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #d4a853;
  animation: fadeIn 0.5s ease;
}

.quiz-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a853;
  text-align: center;
  margin-bottom: 8px;
}

.quiz-hint {
  font-size: 13px;
  color: #888;
  text-align: center;
  margin-bottom: 16px;
}

.question {
  font-size: 15px;
  color: #ffd93d;
  margin-bottom: 12px;
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-btn {
  padding: 10px 14px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.option-btn:hover {
  background: #444;
}

.btn-cancel {
  padding: 8px 16px;
  background: rgba(100, 100, 100, 0.2);
  border: 1px solid rgba(100, 100, 100, 0.3);
  border-radius: 8px;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  margin-top: 12px;
}

.btn-cancel:hover {
  background: rgba(100, 100, 100, 0.3);
}

.quiz-result {
  background: rgba(15, 52, 96, 0.6);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 12px;
}

.quiz-result.success {
  border-color: rgba(46, 204, 113, 0.3);
}

.quiz-result.fail {
  border-color: rgba(231, 76, 60, 0.3);
}

.result-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 8px;
}

.result-text {
  font-size: 14px;
  color: #a0a0a0;
  margin-bottom: 16px;
}

.knowledge-box {
  background: rgba(212, 168, 83, 0.08);
  border: 1px solid rgba(212, 168, 83, 0.2);
  border-radius: 10px;
  padding: 14px;
  margin: 12px 0;
  text-align: left;
}

.knowledge-caption {
  font-size: 11px;
  color: #d4a853;
  font-weight: bold;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.knowledge-text {
  font-size: 13px;
  color: #ddd;
  line-height: 1.6;
}

.btn-next {
  padding: 10px 24px;
  background: rgba(212, 168, 83, 0.2);
  border: 1px solid rgba(212, 168, 83, 0.4);
  border-radius: 8px;
  color: #d4a853;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-next:hover {
  background: rgba(212, 168, 83, 0.3);
}
</style>
