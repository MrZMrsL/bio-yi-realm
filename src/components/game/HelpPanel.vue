<template>
  <div class="help-panel">
    <div class="help-header">
      <h3 class="help-title-main">📖 帮助文档</h3>
      <p class="help-subtitle">了解各模块的玩法和规则</p>
    </div>
    <div class="help-list">
      <div
        v-for="doc in HELP_DOCUMENTATION"
        :key="doc.id"
        class="help-item"
        :class="{ expanded: expandedHelp === doc.id }"
        @click="toggleHelp(doc.id)"
      >
        <div class="help-item-header">
          <span class="help-icon">{{ doc.icon }}</span>
          <span class="help-title">{{ doc.title }}</span>
          <span class="help-toggle">{{ expandedHelp === doc.id ? '▼' : '▶' }}</span>
        </div>
        <div v-if="expandedHelp === doc.id" class="help-content">
          <pre class="help-text">{{ doc.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { HELP_DOCUMENTATION } from '../../data/help.ts'

const expandedHelp = ref(null)

function toggleHelp(id) {
  expandedHelp.value = expandedHelp.value === id ? null : id
}
</script>

<style scoped>
.help-panel {
  padding: 16px;
}

.help-header {
  text-align: center;
  margin-bottom: 16px;
}

.help-header .help-title-main {
  color: #e0e0e0;
  margin-bottom: 4px;
}

.help-header .help-subtitle {
  color: #888;
  font-size: 13px;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.help-item:hover {
  border-color: rgba(212, 168, 83, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.help-item.expanded {
  border-color: rgba(212, 168, 83, 0.4);
}

.help-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}

.help-icon {
  font-size: 20px;
}

.help-title {
  flex: 1;
  font-size: 14px;
  color: #e0e0e0;
  font-weight: bold;
}

.help-toggle {
  font-size: 12px;
  color: #888;
}

.help-content {
  padding: 0 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.help-text {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.8;
  color: #a0a0a0;
  margin: 0;
  padding: 12px 0;
}
</style>
