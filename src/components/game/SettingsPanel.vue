<template>
  <div class="panel-settings">
    <div class="settings-sound-card">
      <span class="sound-label">🔊 音效</span>
      <button
        type="button"
        class="sound-toggle"
        :class="{ on: soundOn }"
        @click="toggleSound"
      >
        {{ soundOn ? '开启' : '关闭' }}
      </button>
    </div>

    <div v-if="pwaUpdate" class="settings-update-card">
      <span class="update-label">🔄 版本更新</span>
      <div class="update-actions">
        <span v-if="needRefresh" class="update-hint">发现新版本</span>
        <button
          v-if="needRefresh"
          type="button"
          class="update-btn update-confirm"
          @click="applyUpdate"
        >
          立即更新
        </button>
        <button
          v-else
          type="button"
          class="update-btn"
          :disabled="checking"
          @click="handleCheckUpdate"
        >
          {{ checking ? '检查中...' : '检查更新' }}
        </button>
      </div>
    </div>

    <div class="settings-tabs">
      <button
        v-for="tab in settingsTabs"
        :key="tab.key"
        type="button"
        class="settings-tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="settings-content">
      <TitleCard v-if="activeTab === 'title'" />
      <EncyclopediaPanel v-if="activeTab === 'encyclopedia'" />
      <HelpPanel v-if="activeTab === 'help'" />
      <FeedbackPanel v-if="activeTab === 'feedback'" />
      <DevPanel v-if="activeTab === 'dev'" />
      <SavePanel v-if="activeTab === 'save'" @save="emit('save')" @export="emit('export')" @import="emit('import')" @reset="emit('reset')" />
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { isSoundEnabled, setSoundEnabled } from '../../platform/audio.js'
import TitleCard from './TitleCard.vue'
import EncyclopediaPanel from './EncyclopediaPanel.vue'
import HelpPanel from './HelpPanel.vue'
import FeedbackPanel from './FeedbackPanel.vue'
import DevPanel from './DevPanel.vue'
import SavePanel from './SavePanel.vue'

const activeTab = ref('title')
const soundOn = ref(isSoundEnabled())
const checking = ref(false)

const pwaUpdate = inject('pwaUpdate', null)
const needRefresh = pwaUpdate?.needRefresh ?? ref(false)
const checkForUpdate = pwaUpdate?.checkForUpdate
const applyUpdate = pwaUpdate?.applyUpdate

function toggleSound() {
  soundOn.value = !soundOn.value
  setSoundEnabled(soundOn.value)
}

async function handleCheckUpdate() {
  if (checking.value || !checkForUpdate) return
  checking.value = true
  try {
    const { hasUpdate } = await checkForUpdate()
    if (hasUpdate) {
      // 发现新版本时保持 needRefresh 状态，由按钮触发更新
    }
  } finally {
    checking.value = false
  }
}

const settingsTabs = [
  { key: 'title', label: '称号' },
  { key: 'help', label: '帮助' },
  { key: 'feedback', label: '反馈' },
  { key: 'save', label: '存档' },
  { key: 'dev', label: '开发' },
  { key: 'encyclopedia', label: '图鉴' },
]

const emit = defineEmits(['save', 'export', 'import', 'reset'])
</script>

<style scoped>
.panel-settings {
  padding: 0;
  position: relative;
}

.settings-sound-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 12px 0;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.sound-label {
  font-size: 14px;
  color: #e0e0e0;
  font-weight: bold;
}

.sound-toggle {
  padding: 6px 14px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sound-toggle.on {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.settings-update-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 12px 0;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.update-label {
  font-size: 14px;
  color: #e0e0e0;
  font-weight: bold;
}

.update-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.update-hint {
  font-size: 12px;
  color: #f39c12;
}

.update-btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.update-confirm {
  background: rgba(212, 168, 83, 0.2);
  color: #d4a853;
}

.settings-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 12px 0;
  background: #0f3460;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.settings-tab-btn {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px 8px 0 0;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-tab-btn.active {
  background: rgba(212, 168, 83, 0.15);
  color: #d4a853;
}

.settings-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
}
</style>
