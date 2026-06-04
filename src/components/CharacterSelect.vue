<template>
  <div class="character-select-overlay">
    <div class="character-select-panel">
      <div class="select-header">
        <h2>🎭 选择你的专精</h2>
        <p>选择后将决定你的初始属性、技能树和出题范围，一经确认不可更改</p>
      </div>

      <!-- 专精卡片网格 -->
      <div class="select-options">
        <div
          v-for="opt in options"
          :key="opt.key"
          class="select-card"
          :class="{ selected: selected === opt.key }"
          :style="{ borderColor: selected === opt.key ? opt.themeColor : undefined }"
          @click="selected = opt.key"
        >
          <!-- 选中标记 -->
          <div v-if="selected === opt.key" class="selected-badge">✓</div>

          <!-- 图标+名称行 -->
          <div class="card-header">
            <span class="card-icon">{{ opt.icon }}</span>
            <span class="card-name">{{ opt.name }}</span>
          </div>

          <!-- 简介 -->
          <div class="card-desc">{{ opt.shortDesc }}</div>

          <!-- 战斗风格标签 -->
          <div class="playstyle-tag" :style="{ background: opt.themeColor + '22', color: opt.themeColor, borderColor: opt.themeColor + '44' }">
            {{ opt.playstyleLabel }}：{{ opt.playstyleDesc }}
          </div>

          <!-- 学科标签 -->
          <div class="card-subjects">
            <span v-for="s in opt.subjects" :key="s" class="subject-tag">{{ s }}</span>
          </div>

          <!-- 初始属性加成 -->
          <div class="stat-section">
            <div class="section-title">初始属性</div>
            <div class="stat-row">
              <span v-if="opt.initialBonus.atk > 0" class="stat-item atk">⚔️ 攻击+{{ opt.initialBonus.atk }}</span>
              <span v-if="opt.initialBonus.def > 0" class="stat-item def">🛡️ 防御+{{ opt.initialBonus.def }}</span>
              <span v-if="opt.initialBonus.hp > 0" class="stat-item hp">❤️ 生命+{{ opt.initialBonus.hp }}</span>
              <span v-if="opt.initialBonus.critRate > 0" class="stat-item crit">💥 暴击+{{ (opt.initialBonus.critRate * 100).toFixed(0) }}%</span>
              <span v-if="opt.initialBonus.dodgeRate > 0" class="stat-item dodge">🌀 闪避+{{ (opt.initialBonus.dodgeRate * 100).toFixed(0) }}%</span>
              <span v-if="opt.initialBonus.expBonus > 0" class="stat-item exp">✨ 经验+{{ (opt.initialBonus.expBonus * 100).toFixed(0) }}%</span>
              <span v-if="!hasInitialBonus(opt.initialBonus)" class="stat-item none">无初始加成</span>
            </div>
          </div>

          <!-- 成长倾向 -->
          <div class="growth-section">
            <div class="section-title">成长倾向（每3级）</div>
            <div class="growth-text">{{ opt.growthDesc }}</div>
          </div>

          <!-- 技能树预览 -->
          <div class="skills-section">
            <div class="section-title">技能树</div>
            <div v-for="skill in opt.skills" :key="skill.level" class="skill-preview">
              <span class="skill-level-badge">Lv.{{ skill.level }}</span>
              <span class="skill-icon">{{ skill.icon }}</span>
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-desc">{{ skill.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 确认按钮 -->
      <button
        class="btn-confirm"
        :disabled="!selected"
        @click="confirm"
      >
        {{ selected ? '✓ 确认选择「' + getSelectedName() + '」' : '请先选择一个专精' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SPECIALIZATIONS } from '../data/specialization.js'

const emit = defineEmits(['select'])

const selected = ref(null)

// 格式化专精数据以供展示
const options = SPECIALIZATIONS.map(spec => ({
  key: spec.key,
  name: spec.name,
  icon: spec.icon,
  themeColor: spec.color,
  shortDesc: spec.shortDesc,
  playstyleLabel: spec.playstyleLabel,
  playstyleDesc: spec.playstyleDesc,
  subjects: spec.subjects,
  initialBonus: spec.initialBonus,
  growthDesc: spec.growthPer3Levels.desc,
  skills: spec.skills.map(skill => ({
    level: skill.level,
    icon: skill.icon,
    name: skill.name,
    desc: skill.desc
  }))
}))

function hasInitialBonus(bonus) {
  return bonus.atk > 0 || bonus.def > 0 || bonus.hp > 0
    || bonus.critRate > 0 || bonus.dodgeRate > 0 || bonus.expBonus > 0
}

function getSelectedName() {
  const opt = options.find(o => o.key === selected.value)
  return opt ? opt.name : ''
}

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
  background: rgba(0, 0, 0, 0.88);
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
  padding: 28px;
  max-width: 1080px;
  width: 94%;
  max-height: 92vh;
  overflow-y: auto;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.select-header {
  text-align: center;
  margin-bottom: 20px;
}

.select-header h2 {
  color: #d4a853;
  font-size: 24px;
  margin-bottom: 6px;
}

.select-header p {
  color: #888;
  font-size: 13px;
}

/* 卡片网格 */
.select-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

/* 单张卡片 */
.select-card {
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.select-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(212, 168, 83, 0.25);
  transform: translateY(-2px);
}

.select-card.selected {
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 24px rgba(212, 168, 83, 0.12), inset 0 0 0 1px rgba(212, 168, 83, 0.15);
}

.selected-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #d4a853;
  color: #0f172a;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* 头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  font-size: 32px;
  line-height: 1;
}

.card-name {
  font-size: 17px;
  font-weight: bold;
  color: #e8e8e8;
}

/* 简介 */
.card-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

/* 战斗风格 */
.playstyle-tag {
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid;
  line-height: 1.4;
}

/* 学科标签 */
.card-subjects {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.subject-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  background: rgba(212, 168, 83, 0.15);
  color: #d4a853;
}

/* 通用 section 标题 */
.section-title {
  font-size: 11px;
  font-weight: bold;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

/* 属性区域 */
.stat-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 10px;
}

.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.stat-item {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.stat-item.atk { color: #e74c3c; }
.stat-item.def { color: #3498db; }
.stat-item.hp { color: #2ecc71; }
.stat-item.crit { color: #f39c12; }
.stat-item.dodge { color: #9b59b6; }
.stat-item.exp { color: #1abc9c; }
.stat-item.none { color: #666; font-style: italic; }

/* 成长区域 */
.growth-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 10px;
}

.growth-text {
  font-size: 12px;
  color: #bbb;
}

/* 技能区域 */
.skills-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 10px;
}

.skill-preview {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;
}

.skill-preview:last-child {
  border-bottom: none;
}

.skill-level-badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: bold;
  color: #d4a853;
  background: rgba(212, 168, 83, 0.12);
  padding: 1px 6px;
  border-radius: 4px;
  margin-top: 1px;
}

.skill-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.skill-name {
  flex-shrink: 0;
  font-weight: bold;
  color: #d4d4d4;
  white-space: nowrap;
}

.skill-desc {
  color: #999;
  line-height: 1.4;
}

/* 确认按钮 */
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
