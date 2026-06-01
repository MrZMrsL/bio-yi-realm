<template>
  <div class="character-select-overlay">
    <div class="character-select-panel">
      <div class="select-header">
        <h2>🎭 选择你的专精</h2>
        <p>选择后将影响游戏中的题目类型，不可更改</p>
      </div>
      <div class="select-options">
        <div
          v-for="opt in options"
          :key="opt.key"
          class="select-card"
          :class="{ selected: selected === opt.key }"
          @click="selected = opt.key"
        >
          <div class="select-icon">{{ opt.icon }}</div>
          <div class="select-name">{{ opt.name }}</div>
          <div class="select-desc">{{ opt.desc }}</div>
          <div class="select-subjects">
            <span v-for="s in opt.subjects" :key="s" class="subject-tag">{{ s }}</span>
          </div>
        </div>
      </div>
      <button
        class="btn-confirm"
        :disabled="!selected"
        @click="confirm"
      >
        {{ selected ? '确认选择' : '请先选择专精' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['select'])

const selected = ref(null)

const options = [
  {
    key: 'chem',
    name: '化学专精',
    icon: '⚗️',
    desc: '专注化学反应与物质变化，题目以化学为主',
    subjects: ['化学']
  },
  {
    key: 'bio',
    name: '生物专精',
    icon: '🧬',
    desc: '探索生命奥秘与基因密码，题目以生物为主',
    subjects: ['生物']
  },
  {
    key: 'yi',
    name: '易学专精',
    icon: '☯️',
    desc: '参悟阴阳五行与卦象变化，题目以易学为主',
    subjects: ['易学']
  },
  {
    key: 'biochem',
    name: '生化专精',
    icon: '🔬',
    desc: '兼顾化学与生物，双学科交叉，题目以化学+生物为主',
    subjects: ['化学', '生物']
  },
  {
    key: 'all',
    name: '全部专精',
    icon: '🌟',
    desc: '博学多才，三学科全部涉猎，题目涵盖全部内容',
    subjects: ['化学', '生物', '易学']
  }
]

function confirm() {
  if (selected.value) {
    emit('select', selected.value)
  }
}
</script>

<style scoped>
.character-select-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.character-select-panel {
  background: #0f172a;
  border: 2px solid rgba(212, 168, 83, 0.3);
  border-radius: 20px;
  padding: 32px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.select-header {
  text-align: center;
  margin-bottom: 24px;
}

.select-header h2 {
  color: #d4a853;
  font-size: 24px;
  margin-bottom: 8px;
}

.select-header p {
  color: #888;
  font-size: 13px;
}

.select-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.select-card {
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.select-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(212, 168, 83, 0.3);
  transform: translateY(-2px);
}

.select-card.selected {
  border-color: #d4a853;
  background: rgba(212, 168, 83, 0.1);
  box-shadow: 0 0 20px rgba(212, 168, 83, 0.15);
}

.select-card.selected::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 12px;
  color: #d4a853;
  font-size: 18px;
  font-weight: bold;
}

.select-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.select-name {
  font-size: 16px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 6px;
}

.select-desc {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
  margin-bottom: 10px;
}

.select-subjects {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.subject-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(212, 168, 83, 0.15);
  color: #d4a853;
}

.btn-confirm {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #d4a853, #b8860b);
  color: #0f172a;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  background: rgba(100, 100, 100, 0.2);
  color: #666;
  cursor: not-allowed;
}
</style>
