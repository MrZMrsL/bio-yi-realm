<template>
  <div id="game-container">
    <DiscoveryNotifications />

    <!-- 称号展示弹窗（v9.0 - PVP系统） -->
    <TitleDisplay
      :level="store.titleDisplayLevel"
      :visible="store.showTitleDisplay"
      @close="store.closeTitleDisplay()"
    />

    <!-- PVP对战模式（v9.0） -->
    <div v-if="store.gameMode === GAME_MODE.PVP" class="panel-overlay">
      <PanelHeader title="⚔️ PVP对战" @back="store.exitPvp()" />
      <div class="panel-content">
        <PvpBattle @exit="store.exitPvp()" />
      </div>
    </div>

    <!-- 顶部状态栏 -->
    <StatusBar />

    <!-- 主界面 - 区域网格 -->
    <div v-if="!activePanel && store.gameMode !== GAME_MODE.PVP" id="main-content">
      <MainDashboard
        @open-panel="openPanel"
        @open-pvp="openPvp"
        @open-leaderboard="openLeaderboard"
        @open-weekly-boss="openWeeklyBoss"
        @enter-dungeon="openPanel('dungeon')"
      />
    </div>

    <!-- 面板覆盖层 -->
    <Transition name="panel-fade">
      <div v-if="activePanel" class="panel-overlay">
        <PanelHeader :title="panelTitle" @back="closePanel" />
        <div class="panel-content">
        <div v-if="activePanel === 'achievements'" class="panel-achievements">
          <Achievements />
        </div>

        <DungeonPanel v-if="activePanel === 'dungeon'" @close="closePanel" />

        <EncyclopediaPanel v-if="activePanel === 'encyclopedia'" />

        <div v-if="activePanel === 'character'" class="panel-character">
          <CharacterPanel />
        </div>

        <div v-if="activePanel === 'inventory'" class="panel-inventory">
          <Inventory />
        </div>

        <div v-if="activePanel === 'farm'" class="panel-farm">
          <Farm />
        </div>

        <div v-if="activePanel === 'fishing'" class="panel-fishing">
          <Fishing />
        </div>

        <div v-if="activePanel === 'study'" class="panel-study">
          <Review />
        </div>

        <div v-if="activePanel === 'shop'" class="panel-shop">
          <Shop />
        </div>

        <div v-if="activePanel === 'leaderboard'" class="panel-leaderboard">
          <Leaderboard />
        </div>

        <SettingsPanel
          v-if="activePanel === 'settings'"
          @save="saveGame"
          @export="exportSave"
          @import="importSave"
          @reset="resetGame"
        />

        <div v-if="activePanel === 'checkin'" class="panel-checkin">
          <CheckInPanel />
        </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useGameStore, GAME_MODE } from '../stores/game.ts'
import { useGuideStore } from '../stores/guideStore.ts'
import PvpBattle from './PvpBattle.vue'
import TitleDisplay from './TitleDisplay.vue'
import Leaderboard from './Leaderboard.vue'
import Achievements from './Achievements.vue'
import StatusBar from './StatusBar.vue'
import MainDashboard from './MainDashboard.vue'
import DungeonPanel from './DungeonPanel.vue'
import DiscoveryNotifications from './game/DiscoveryNotifications.vue'
import PanelHeader from './game/PanelHeader.vue'
import EncyclopediaPanel from './game/EncyclopediaPanel.vue'
import SettingsPanel from './game/SettingsPanel.vue'
import CheckInPanel from './checkin/CheckInPanel.vue'

// 异步组件通用 loading 提示
const AsyncLoading = {
  template: '<div style="padding:40px;text-align:center;color:#888;">⚡ 加载中...</div>',
}

function asyncComp(loader) {
  return defineAsyncComponent({
    loader,
    loadingComponent: AsyncLoading,
  })
}

const Inventory = asyncComp(() => import('./Inventory.vue'))
const Farm = asyncComp(() => import('./Farm.vue'))
const Fishing = asyncComp(() => import('./Fishing.vue'))
const Shop = asyncComp(() => import('./Shop.vue'))
const Review = asyncComp(() => import('./Review.vue'))
const CharacterPanel = asyncComp(() => import('./CharacterPanel.vue'))
import { sfxClick } from '../utils/sfx.ts'
import { useToast } from '../composables/useToast.js'
import { useDialog } from '../composables/useDialog.js'
import { getStorageItem, setStorageItem, removeStorageItem } from '../platform/storage.js'
import { isH5 } from '../platform/env.js'

const store = useGameStore()
const guideStore = useGuideStore()
const toast = useToast()
const dialog = useDialog()
const activePanel = ref(null)

onMounted(() => {
  // 首次进入主界面时展示 dashboard 引导
  guideStore.showStep('dashboard-overview')

  // 延迟自动弹出签到面板（避开新手引导弹窗）
  setTimeout(() => {
    if (store.canCheckInToday && !guideStore.currentStepId && !activePanel.value) {
      openPanel('checkin')
    }
  }, 900)
})

const panelTitle = computed(() => {
  const titles = {
    dungeon: '地牢探索',
    encyclopedia: '图鉴',
    inventory: '背包',
    character: '人物',
    farm: '怪物农场',
    fishing: '钓鱼塘',
    study: '自习室',
    shop: '杂货铺',
    achievements: '成就殿堂',
    settings: '设置',
    checkin: '每日签到',
  }
  return titles[activePanel.value] || ''
})

function openPanel(panel) {
  sfxClick()
  // 多模块互斥：战斗中不允许切换面板
  if (store.inBattle && panel !== 'dungeon') {
    toast.warning('当前正在战斗中，请先完成或退出战斗！')
    return
  }
  activePanel.value = panel
  // 同步 gameMode 到对应面板模式
  if (panel === 'dungeon') {
    // 地牢面板内容依赖 gameMode，需要根据当前地牢阶段恢复正确模式
    const phaseToMode = {
      none: GAME_MODE.IDLE,
      prep: GAME_MODE.DUNGEON_PREP,
      rooms: GAME_MODE.DUNGEON_ROOMS,
      battle: GAME_MODE.BATTLE,
    }
    const targetMode = phaseToMode[store.dungeonPhase] || GAME_MODE.IDLE
    if (!store.inBattle || targetMode === GAME_MODE.BATTLE) {
      store.enterMode(targetMode)
    }
  } else {
    const panelModeMap = {
      shop: GAME_MODE.SHOP,
      farm: GAME_MODE.FARM,
      inventory: GAME_MODE.INVENTORY,
      character: GAME_MODE.CHARACTER,
      fishing: GAME_MODE.FISHING,
      study: GAME_MODE.STUDY,
      achievements: GAME_MODE.ACHIEVEMENTS,
      settings: GAME_MODE.SETTINGS,
      encyclopedia: GAME_MODE.ENCYCLOPEDIA,
      leaderboard: GAME_MODE.LEADERBOARD,
      checkin: GAME_MODE.CHECK_IN,
    }
    if (panelModeMap[panel]) {
      store.enterMode(panelModeMap[panel])
    }
  }
  // 首次进入地牢时展示地牢引导
  if (panel === 'dungeon' && store.gameStarted) {
    guideStore.showStep('dungeon-prep')
  }
}

async function closePanel() {
  sfxClick()
  // 限时Boss战斗中关闭面板，直接退出战斗
  if (store.gameMode === GAME_MODE.WEEKLY_BOSS) {
    store.exitWeeklyBoss()
    activePanel.value = null
    return
  }
  // 只有从地牢面板退出时，才提示是否保存进度
  if (activePanel.value === 'dungeon' && store.dungeonPhase !== 'none') {
    const saveProgress = await dialog.confirm({
      title: '保存地牢进度',
      message: '是否保存当前地牢进度？\n保存后可在下次继续探索。\n不保存则本层进度将丢失，重进会刷新。',
      confirmText: '保存',
      cancelText: '不保存',
    })
    if (saveProgress) {
      store.saveGame()
    }
    // 保存后也退出地牢战斗状态，允许切换其他面板
    store.exitDungeon()
    // 首次完成地牢战斗回到主界面后，展示养成系统引导
    guideStore.showStep('post-battle-growth')
  }
  // 关闭面板时，如果当前是非战斗面板模式，回到 idle
  if (store.isPanelMode()) {
    store.enterMode(GAME_MODE.IDLE)
  }
  activePanel.value = null
}

// ===== 限时Boss =====
async function openWeeklyBoss() {
  sfxClick()
  const result = await store.enterWeeklyBoss()
  if (!result.success) {
    toast.warning('本周的周常大魔王已被击败！下周再来挑战吧。')
    return
  }
  // 进入限时Boss战斗
  activePanel.value = 'dungeon'
}

function openPvp() {
  sfxClick()
  // 战斗中不允许切换
  if (store.inBattle) {
    toast.warning('当前正在战斗中，请先完成或退出战斗！')
    return
  }
  store.enterPvp()
}

function openLeaderboard() {
  openPanel('leaderboard')
}

function saveGame() {
  store.saveGame()
  toast.success('存档已保存！')
}

async function exportSave() {
  const saveData = getStorageItem('bio_yi_realm_save')
  if (saveData) {
    try {
      // #ifdef H5
      await navigator.clipboard.writeText(saveData)
      // #endif
      // #ifndef H5
      uni.setClipboardData({ data: saveData })
      // #endif
      toast.success('存档已复制到剪贴板！')
    } catch (_e) {
      toast.error('复制失败，请手动复制存档数据')
    }
  } else {
    toast.warning('当前没有可导出的存档')
  }
}

async function importSave() {
  const data = await dialog.prompt({
    title: '导入存档',
    message: '请粘贴之前导出的存档数据：',
    placeholder: '粘贴存档数据...',
  })
  if (data) {
    try {
      JSON.parse(data)
      setStorageItem('bio_yi_realm_save', data)
      store.loadGame()
      toast.success('存档已恢复！')
    } catch (_e) {
      toast.error('存档数据无效！')
    }
  }
}

async function resetGame() {
  const confirmed = await dialog.confirm({
    title: '重置游戏',
    message: '确定要重置所有游戏数据吗？此操作不可恢复！',
    confirmText: '重置',
    cancelText: '取消',
  })
  if (confirmed) {
    store.deleteSave()
    toast.success('游戏数据已重置')
    setTimeout(() => {
      // #ifdef H5
      location.reload()
      // #endif
      // #ifndef H5
      uni.reLaunch({ url: '/pages/index/index' })
      // #endif
    }, 600)
  }
}
</script>

<style scoped>
#game-container {
  width: 100%;
  max-width: 480px;
  height: 100vh;
  height: 100dvh;
  background: #16213e;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  #game-container {
    max-width: 520px;
    height: 90vh;
    height: 90dvh;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}

#main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #16213e;
  display: flex;
  flex-direction: column;
  z-index: 50;
}

/* 面板滑入/滑出过渡 */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: all 0.3s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.panel-achievements,
.panel-character,
.panel-inventory,
.panel-farm,
.panel-fishing,
.panel-study,
.panel-shop,
.panel-leaderboard,
.panel-checkin {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}
</style>
