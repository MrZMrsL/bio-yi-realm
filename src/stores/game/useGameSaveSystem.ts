/**
 * 游戏存档系统
 *
 * 统一负责存档、读档、删档、复活。
 */
import type { Ref } from 'vue'
import { exportUsedQuestions, importUsedQuestions } from '../../data/questions.ts'
import { registerSaveCallback } from '../../services/saveService.js'
import { getStorageItem, setStorageItem, removeStorageItem } from '../../platform/storage.js'
import { logger } from '../../utils/logger.js'
import type { usePlayerStore } from '../playerStore.ts'
import type { useEquipmentStore } from '../equipmentStore.ts'
import type { useBattleStore } from '../battleStore.ts'
import type { useDungeonStore } from '../dungeonStore.ts'
import type { useFarmStore } from '../farmStore.ts'
import type { useFishingStore } from '../fishingStore.ts'
import type { useCyclopediaStore } from '../cyclopediaStore.ts'
import type { useWeeklyBossStore } from '../weeklyBossStore.ts'
import type { usePvpStore } from '../pvpStore.ts'
import type { useReviewStore } from '../reviewStore.ts'
import type { useLogStore } from '../logStore.ts'
import type { useGuideStore } from '../guideStore.ts'
import type { useCheckInStore } from '../checkInStore.ts'
import type { GameMode } from './useGameStateMachine.ts'

export const SAVE_VERSION = 1

type PlayerStore = ReturnType<typeof usePlayerStore>
type EquipmentStore = ReturnType<typeof useEquipmentStore>
type BattleStore = ReturnType<typeof useBattleStore>
type DungeonStore = ReturnType<typeof useDungeonStore>
type FarmStore = ReturnType<typeof useFarmStore>
type FishingStore = ReturnType<typeof useFishingStore>
type CyclopediaStore = ReturnType<typeof useCyclopediaStore>
type WeeklyBossStore = ReturnType<typeof useWeeklyBossStore>
type PvpStore = ReturnType<typeof usePvpStore>
type ReviewStore = ReturnType<typeof useReviewStore>
type LogStore = ReturnType<typeof useLogStore>
type GuideStore = ReturnType<typeof useGuideStore>
type CheckInStore = ReturnType<typeof useCheckInStore>

export interface GameSaveDependencies {
  playerStore: PlayerStore
  equipmentStore: EquipmentStore
  battleStore: BattleStore
  dungeonStore: DungeonStore
  farmStore: FarmStore
  fishingStore: FishingStore
  cyclopediaStore: CyclopediaStore
  weeklyBossStore: WeeklyBossStore
  pvpStore: PvpStore
  reviewStore: ReviewStore
  logStore: LogStore
  guideStore: GuideStore
  checkInStore: CheckInStore
}

export interface GameSaveState {
  gameStarted: Ref<boolean>
  activeTab: Ref<string>
  gameMode: Ref<GameMode>
  devMode: Ref<boolean>
}

export function useGameSaveSystem(deps: GameSaveDependencies, state: GameSaveState) {
  const {
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
  } = deps

  const { gameStarted, activeTab, gameMode, devMode } = state

  function saveGame(): void {
    const saveData: Record<string, unknown> = {
      ...playerStore.serialize(),
      ...equipmentStore.serialize(),
      ...battleStore.serialize(),
      ...dungeonStore.serialize(),
      ...farmStore.serialize(),
      ...fishingStore.serialize(),
      ...cyclopediaStore.serialize(),
      ...weeklyBossStore.serialize(),
      ...pvpStore.serialize(),
      ...reviewStore.serialize(),
      ...logStore.serialize(),
      ...guideStore.serialize(),
      ...checkInStore.serialize(),
      gameStarted: gameStarted.value,
      activeTab: activeTab.value,
      gameMode: gameMode.value,
      devMode: devMode.value,
      usedQuestions: exportUsedQuestions ? exportUsedQuestions() : [],
      saveVersion: SAVE_VERSION,
      timestamp: Date.now(),
    }
    setStorageItem('bio_yi_realm_save', JSON.stringify(saveData))
    logger.log('存档已保存')
  }

  // 将 saveGame 注册为存档服务的实际执行回调
  registerSaveCallback(saveGame)

  function loadGame(): boolean {
    try {
      const saveStr = getStorageItem('bio_yi_realm_save')
      if (!saveStr) return false

      const saveData: Record<string, unknown> = JSON.parse(saveStr)

      // 存档版本检查，便于未来做迁移
      if (saveData.saveVersion && (saveData.saveVersion as number) > SAVE_VERSION) {
        logger.warn(`存档版本 ${saveData.saveVersion} 高于当前版本 ${SAVE_VERSION}，可能不兼容`)
      }

      playerStore.deserialize(saveData)
      equipmentStore.deserialize(saveData)
      battleStore.deserialize(saveData)
      dungeonStore.deserialize(saveData)
      farmStore.deserialize(saveData)
      fishingStore.deserialize(saveData)
      cyclopediaStore.deserialize(saveData)
      weeklyBossStore.deserialize(saveData)
      pvpStore.deserialize(saveData)
      reviewStore.deserialize(saveData)
      logStore.deserialize(saveData)
      guideStore.deserialize(saveData)
      checkInStore.deserialize(saveData)

      gameStarted.value = (saveData.gameStarted as boolean) || false
      activeTab.value = (saveData.activeTab as string) || 'dungeon'
      devMode.value = (saveData.devMode as boolean) || false
      gameMode.value = (saveData.gameMode as GameMode) || 'idle'

      if (!saveData.gameMode) {
        if (battleStore.inBattle) {
          if (weeklyBossStore.weeklyBossData) gameMode.value = 'weekly_boss'
          else if (dungeonStore.dungeonPhase === 'battle') gameMode.value = 'battle'
        } else if (dungeonStore.dungeonPhase === 'prep') {
          gameMode.value = 'dungeon_prep'
        } else if (dungeonStore.dungeonPhase === 'rooms') {
          gameMode.value = 'dungeon_rooms'
        }
      }

      importUsedQuestions(saveData.usedQuestions)

      return true
    } catch (e) {
      logger.error('存档加载失败:', e)
      return false
    }
  }

  function hasSave(): boolean {
    return !!getStorageItem('bio_yi_realm_save')
  }

  function deleteSave(): void {
    removeStorageItem('bio_yi_realm_save')
    gameStarted.value = false
    activeTab.value = 'dungeon'
    gameMode.value = 'idle'
    devMode.value = false

    playerStore.reset()
    equipmentStore.reset()
    battleStore.reset()
    dungeonStore.reset()
    farmStore.reset()
    fishingStore.reset()
    cyclopediaStore.reset()
    weeklyBossStore.reset()
    pvpStore.reset()
    reviewStore.reset()
    logStore.reset()
    guideStore.resetGuide()
    checkInStore.reset()

    // 触发一次保存以清空本地缓存状态
    saveGame()
  }

  function revive(): void {
    playerStore.fullHeal()
    playerStore.setFloor(1)

    if (weeklyBossStore.inWeeklyBoss) {
      weeklyBossStore.exitWeeklyBoss(battleStore)
    } else if (dungeonStore.dungeonPhase === 'battle' || dungeonStore.dungeonPhase === 'rooms') {
      dungeonStore.exitDungeon()
    } else {
      battleStore.exitBattle()
    }

    saveGame()
  }

  return {
    saveGame,
    loadGame,
    hasSave,
    deleteSave,
    revive,
  }
}
