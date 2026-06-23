<template>
  <div class="skill-tree-panel">
    <!-- 专精标题 -->
    <div class="spec-header">
      <span class="spec-icon">{{ specData?.icon }}</span>
      <span class="spec-name">{{ specData?.name }}</span>
      <span class="spec-level">Lv.{{ store.level }}</span>
    </div>

    <!-- 技能列表 -->
    <div class="skills-container">
      <div
        v-for="skill in specData?.skills"
        :key="skill.level"
        class="skill-card"
        :class="{ unlocked: isUnlocked(skill), locked: !isUnlocked(skill), 'next-milestone': isNextMilestone(skill) }"
      >
        <!-- 解锁状态图标 -->
        <div class="skill-status-badge">
          <span v-if="isUnlocked(skill)" class="unlocked-icon">✓</span>
          <span v-else-if="isNextMilestone(skill)" class="pending-icon">🔒</span>
          <span v-else class="locked-icon">🔒</span>
        </div>

        <!-- 技能信息 -->
        <div class="skill-info">
          <div class="skill-header">
            <span class="skill-icon">{{ skill.icon }}</span>
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-level-tag">Lv.{{ skill.level }}</span>
          </div>
          <div class="skill-desc">{{ skill.desc }}</div>
        </div>

        <!-- 解锁状态标签 -->
        <div class="skill-status-tag">
          <span v-if="isUnlocked(skill)" class="tag-unlocked">已解锁</span>
          <span v-else-if="isNextMilestone(skill)" class="tag-pending">待解锁</span>
          <span v-else class="tag-locked">未达到</span>
        </div>
      </div>
    </div>

    <!-- 无技能提示 -->
    <div v-if="!specData?.skills?.length" class="no-skills">当前专精暂无技能数据</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game.ts'
import { getSpecialization } from '../data/specialization.ts'

const store = useGameStore()

const specData = computed(() => {
  return getSpecialization(store.playerSpecialization)
})

function isUnlocked(skill) {
  return store.specializationSkills?.some(s => s.skill.effect === skill.effect)
}

function isNextMilestone(skill) {
  return !isUnlocked(skill) && store.level >= skill.level
}
</script>

<style scoped>
.skill-tree-panel {
  padding: 16px;
  color: #e0e0e0;
}

.spec-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(212, 168, 83, 0.08);
  border: 1px solid rgba(212, 168, 83, 0.2);
  border-radius: 12px;
}

.spec-icon {
  font-size: 28px;
}

.spec-name {
  font-size: 18px;
  font-weight: bold;
  color: #e8e8e8;
  flex: 1;
}

.spec-level {
  font-size: 13px;
  color: #d4a853;
  background: rgba(212, 168, 83, 0.15);
  padding: 4px 10px;
  border-radius: 8px;
}

.skills-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s ease;
  position: relative;
}

.skill-card.unlocked {
  background: rgba(46, 204, 113, 0.08);
  border-color: rgba(46, 204, 113, 0.25);
}

.skill-card.next-milestone {
  background: rgba(212, 168, 83, 0.08);
  border-color: rgba(212, 168, 83, 0.25);
  animation: pulse-milestone 2s ease-in-out infinite;
}

@keyframes pulse-milestone {
  0%,
  100% {
    border-color: rgba(212, 168, 83, 0.25);
  }
  50% {
    border-color: rgba(212, 168, 83, 0.5);
  }
}

.skill-card.locked {
  opacity: 0.5;
}

.skill-status-badge {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.skill-card.unlocked .skill-status-badge {
  background: rgba(46, 204, 113, 0.2);
}

.skill-card.next-milestone .skill-status-badge {
  background: rgba(212, 168, 83, 0.15);
}

.skill-card.locked .skill-status-badge {
  background: rgba(100, 100, 100, 0.15);
}

.unlocked-icon {
  color: #2ecc71;
  font-weight: bold;
}
.pending-icon {
  color: #d4a853;
}
.locked-icon {
  color: #666;
}

.skill-info {
  flex: 1;
  min-width: 0;
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.skill-icon {
  font-size: 16px;
}

.skill-name {
  font-size: 14px;
  font-weight: bold;
  color: #e0e0e0;
}

.skill-level-tag {
  font-size: 10px;
  color: #888;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
}

.skill-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.skill-status-tag {
  flex-shrink: 0;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
}

.tag-unlocked {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.tag-pending {
  background: rgba(212, 168, 83, 0.15);
  color: #d4a853;
}

.tag-locked {
  background: rgba(100, 100, 100, 0.1);
  color: #666;
}

.no-skills {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
}
</style>
