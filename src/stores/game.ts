/**
 * 游戏核心 facade Store
 *
 * 本文件是 `useGameStore()` 的唯一入口，负责：
 * 1. 维护全局导航状态（gameStarted / gameMode / activeTab 等）
 * 2. 聚合各领域 Store 的状态与方法，保持组件/测试的 API 不变
 * 3. 统一存档/读档/重置
 *
 * 具体业务逻辑已下沉到 playerStore / battleStore / dungeonStore 等领域 Store，
 * 本 facade 通过 src/stores/game/ 下的 coordinator 模块组合行为。
 */
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { isLoadingQuestions, getLoadProgress } from '../data/questions.ts'
import { getSubjectTheme } from '../data/subjectThemes.ts'
import { saveNow } from '../services/saveService.js'
import { usePlayerStore } from './playerStore.ts'
import { useEquipmentStore } from './equipmentStore.ts'
import { useBattleStore } from './battleStore.ts'
import { useDungeonStore } from './dungeonStore.ts'
import { useFarmStore } from './farmStore.ts'
import { useFishingStore } from './fishingStore.ts'
import { useCyclopediaStore } from './cyclopediaStore.ts'
import { useWeeklyBossStore } from './weeklyBossStore.ts'
import { usePvpStore } from './pvpStore.ts'
import { useReviewStore } from './reviewStore.ts'
import { useLogStore } from './logStore.ts'
import { useGuideStore } from './guideStore.ts'
import { useCheckInStore } from './checkInStore.ts'

// 内部 coordinator 模块
import { GAME_MODE, useGameStateMachine } from './game/useGameStateMachine.ts'
import { SAVE_VERSION, useGameSaveSystem } from './game/useGameSaveSystem.ts'
import { useGameDungeonCoordinator } from './game/useGameDungeonCoordinator.ts'
import { useGameCombatCoordinator } from './game/useGameCombatCoordinator.ts'
import { useGamePlayerCoordinator } from './game/useGamePlayerCoordinator.ts'
import { useGameEquipmentCoordinator } from './game/useGameEquipmentCoordinator.ts'
import { useGameFarmCoordinator } from './game/useGameFarmCoordinator.ts'
import { useGameFishingCoordinator } from './game/useGameFishingCoordinator.ts'
import { useGameCyclopediaCoordinator } from './game/useGameCyclopediaCoordinator.ts'
import { useGameReviewCoordinator } from './game/useGameReviewCoordinator.ts'

export { GAME_MODE }
export type { GameMode } from './game/useGameStateMachine.ts'
export { SAVE_VERSION }

export const useGameStore = defineStore('game', () => {
  // 子仓库实例
  const playerStore = usePlayerStore()
  const equipmentStore = useEquipmentStore()
  const battleStore = useBattleStore()
  const dungeonStore = useDungeonStore()
  const farmStore = useFarmStore()
  const fishingStore = useFishingStore()
  const cyclopediaStore = useCyclopediaStore()
  const weeklyBossStore = useWeeklyBossStore()
  const pvpStore = usePvpStore()
  const reviewStore = useReviewStore()
  const logStore = useLogStore()
  const guideStore = useGuideStore()
  const checkInStore = useCheckInStore()

  const playerRefs = storeToRefs(playerStore)
  const equipmentRefs = storeToRefs(equipmentStore)
  const battleRefs = storeToRefs(battleStore)
  const dungeonRefs = storeToRefs(dungeonStore)
  const farmRefs = storeToRefs(farmStore)
  const fishingRefs = storeToRefs(fishingStore)
  const cyclopediaRefs = storeToRefs(cyclopediaStore)
  const weeklyBossRefs = storeToRefs(weeklyBossStore)
  const pvpRefs = storeToRefs(pvpStore)
  const reviewRefs = storeToRefs(reviewStore)
  const logRefs = storeToRefs(logStore)
  const checkInRefs = storeToRefs(checkInStore)

  // ===== 核心导航状态 =====
  const gameStarted = ref<boolean>(false)
  const activeTab = ref<string>('dungeon')
  const gameMode = ref(GAME_MODE.IDLE)
  const devMode = ref<boolean>(false)

  // ===== 题库加载状态 =====
  // 从 data/questions.ts 透传，供 UI 显示加载中/失败提示
  const questionsLoaded = computed<boolean>(() => !isLoadingQuestions.value && getLoadProgress() === 100)
  const loadProgress = computed<number>(() => getLoadProgress())

  // ===== 状态机 =====
  const { enterMode, isCombatMode, isPanelMode } = useGameStateMachine(gameMode)

  // ===== 存档系统 =====
  const { saveGame, loadGame, hasSave, deleteSave, revive } = useGameSaveSystem(
    {
      playerStore,
      equipmentStore,
      battleStore,
      dungeonStore,
      farmStore,
      fishingStore,
      cyclopediaStore,
      weeklyBossStore,
      pvpStore,
      reviewStore,
      logStore,
      guideStore,
      checkInStore,
    },
    { gameStarted, activeTab, gameMode, devMode }
  )

  // ===== 地牢协调 =====
  const dungeonCoordinator = useGameDungeonCoordinator({
    dungeonStore,
    battleStore,
    enterMode,
  })

  // ===== 战斗/限时Boss/PVP协调 =====
  const combatCoordinator = useGameCombatCoordinator({
    battleStore,
    dungeonStore,
    weeklyBossStore,
    pvpStore,
    devMode,
    enterMode,
  })

  // ===== 各领域协调器 =====
  const playerCoordinator = useGamePlayerCoordinator({ playerStore })
  const equipmentCoordinator = useGameEquipmentCoordinator({ equipmentStore })
  const farmCoordinator = useGameFarmCoordinator({ farmStore })
  const fishingCoordinator = useGameFishingCoordinator({ fishingStore, devMode })
  const cyclopediaCoordinator = useGameCyclopediaCoordinator({ cyclopediaStore })
  const reviewCoordinator = useGameReviewCoordinator({ reviewStore })

  function toggleDevMode(): boolean {
    devMode.value = !devMode.value
    saveNow()
    return devMode.value
  }

  function startGame(): void {
    gameStarted.value = true
    dungeonCoordinator.completeTutorial()
    activeTab.value = 'dungeon'
    saveNow()
  }

  function setTab(tab: string): void {
    activeTab.value = tab
  }

  // ===== 计算属性 =====
  const currentSubjectTheme = computed(() => {
    const subj = battleStore.enemy?.subject
    return getSubjectTheme(subj)
  })

  return {
    // 状态机
    gameMode,
    GAME_MODE,
    enterMode,
    isCombatMode,
    isPanelMode,
    // 核心导航
    gameStarted,
    activeTab,
    devMode,
    isLoadingQuestions,
    questionsLoaded,
    loadProgress,
    toggleDevMode,
    startGame,
    setTab,
    // 子仓库状态（storeToRefs 保证响应性与赋值透传）
    ...playerRefs,
    ...equipmentRefs,
    ...battleRefs,
    ...dungeonRefs,
    ...farmRefs,
    ...fishingRefs,
    ...cyclopediaRefs,
    ...weeklyBossRefs,
    ...pvpRefs,
    ...reviewRefs,
    ...logRefs,
    ...checkInRefs,
    // 公共计算属性（覆盖或补充）
    currentSubjectTheme,
    monsterBonus: computed(() => equipmentStore.monsterBonus),
    totalAtk: computed(() => equipmentStore.totalAtk),
    totalDef: computed(() => equipmentStore.totalDef),
    // 各领域协调器
    ...playerCoordinator,
    ...equipmentCoordinator,
    ...farmCoordinator,
    ...fishingCoordinator,
    ...cyclopediaCoordinator,
    ...reviewCoordinator,
    // 地牢协调
    ...dungeonCoordinator,
    // 战斗/限时Boss/PVP协调
    ...combatCoordinator,
    // 存档与复活
    saveGame,
    loadGame,
    hasSave,
    deleteSave,
    revive,
  }
})
