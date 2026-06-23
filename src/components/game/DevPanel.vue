<template>
  <div v-if="!devUnlocked" class="dev-lock-panel">
    <div class="dev-lock-icon">🔐</div>
    <div class="dev-lock-title">开发者选项</div>
    <div class="dev-lock-desc">请输入开发者密令以解锁</div>
    <input
      v-model="devPassphrase"
      type="password"
      class="dev-passphrase-input"
      placeholder="输入密令..."
      @keyup.enter="unlockDev"
    />
    <button type="button" class="btn-dev-unlock" @click="unlockDev">解锁</button>
  </div>
  <div v-else class="dev-panel">
    <div class="dev-header">
      <h3 class="dev-title">🛠️ 开发者选项</h3>
      <button type="button" class="btn-dev-lock" @click="devUnlocked = false">重新锁定</button>
    </div>
    <div class="dev-options">
      <div class="dev-option">
        <span class="dev-label">开发者模式（秒杀）</span>
        <button type="button" class="btn-dev-toggle" :class="{ active: store.devMode }" @click="store.toggleDevMode">
          {{ store.devMode ? '✅ 开启' : '❌ 关闭' }}
        </button>
      </div>
      <div class="dev-option">
        <span class="dev-label">当前 gameMode</span>
        <span class="dev-value">{{ store.gameMode }}</span>
      </div>
      <div class="dev-option">
        <span class="dev-label">重置本地存储</span>
        <button type="button" class="btn-dev-danger" @click="resetLocalStorage">🗑️ 清除所有数据</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../../stores/game.ts'
import { useToast } from '../../composables/useToast.js'
import { useDialog } from '../../composables/useDialog.js'
import { removeStorageItem } from '../../platform/storage.js'

const store = useGameStore()
const toast = useToast()
const dialog = useDialog()

const DEV_SECRET = 'laozheng666'
const devPassphrase = ref('')
const devUnlocked = ref(false)

function unlockDev() {
  if (devPassphrase.value === DEV_SECRET) {
    devUnlocked.value = true
    devPassphrase.value = ''
    toast.success('开发者选项已解锁')
  } else {
    toast.error('密令错误！')
  }
}

async function resetLocalStorage() {
  const confirmed = await dialog.confirm({
    title: '⚠️ 清除本地存档',
    message: '确定要清除所有本地存档数据吗？此操作不可恢复！',
    confirmText: '清除',
    cancelText: '取消',
  })
  if (confirmed) {
    removeStorageItem('bio_yi_realm_save')
    removeStorageItem('bio_yi_realm_pvp_leaderboard')
    removeStorageItem('bio_yi_wrong_book')
    toast.success('本地存储已清除，页面将刷新。')
    setTimeout(() => {
      // #ifdef H5
      location.reload()
      // #endif
      // #ifndef H5
      uni.reLaunch({ url: '/pages/index/index' })
      // #endif
    }, 800)
  }
}
</script>

<style scoped>
.dev-lock-panel {
  text-align: center;
  padding: 40px 20px;
}

.dev-lock-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.dev-lock-title {
  font-size: 18px;
  color: #e0e0e0;
  font-weight: bold;
  margin-bottom: 8px;
}

.dev-lock-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 20px;
}

.dev-passphrase-input {
  width: 100%;
  max-width: 280px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
  outline: none;
}

.dev-passphrase-input:focus {
  border-color: rgba(212, 168, 83, 0.5);
}

.btn-dev-unlock {
  padding: 10px 32px;
  background: #d4a853;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.dev-panel {
  padding: 16px;
}

.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dev-header .dev-title {
  color: #e0e0e0;
  margin: 0;
}

.dev-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dev-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.dev-label {
  font-size: 14px;
  color: #e0e0e0;
}

.dev-value {
  font-size: 13px;
  color: #888;
}

.btn-dev-toggle {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  font-size: 13px;
}

.btn-dev-toggle.active {
  background: rgba(46, 204, 113, 0.2);
  border-color: rgba(46, 204, 113, 0.3);
  color: #2ecc71;
}

.btn-dev-lock {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #888;
  font-size: 12px;
  cursor: pointer;
}

.btn-dev-danger {
  padding: 8px 16px;
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 6px;
  color: #e74c3c;
  cursor: pointer;
  font-size: 13px;
}
</style>
