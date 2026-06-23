/**
 * 战斗流程协调器
 *
 * 负责战斗、捕捉、限时 Boss、PVP 等战斗相关流程与全局状态机的串联。
 */
import type { Ref } from 'vue'
import type { useBattleStore } from '../battleStore.ts'
import type { useDungeonStore } from '../dungeonStore.ts'
import type { useWeeklyBossStore } from '../weeklyBossStore.ts'
import type { usePvpStore } from '../pvpStore.ts'
import type { PvpResult } from '../pvpStore.ts'
import { GAME_MODE } from './useGameStateMachine.ts'
import type { GameMode } from './useGameStateMachine.ts'

type BattleStore = ReturnType<typeof useBattleStore>
type DungeonStore = ReturnType<typeof useDungeonStore>
type WeeklyBossStore = ReturnType<typeof useWeeklyBossStore>
type PvpStore = ReturnType<typeof usePvpStore>

export interface CombatCoordinatorDependencies {
  battleStore: BattleStore
  dungeonStore: DungeonStore
  weeklyBossStore: WeeklyBossStore
  pvpStore: PvpStore
  devMode: Ref<boolean>
  enterMode: (_mode: GameMode) => boolean
}

export function useGameCombatCoordinator(deps: CombatCoordinatorDependencies) {
  const { battleStore, dungeonStore, weeklyBossStore, pvpStore, devMode, enterMode } = deps

  // ===== 通用战斗 =====
  function winBattle() {
    battleStore.winBattle()
  }

  function exitBattle() {
    battleStore.exitBattle()
    if (dungeonStore.dungeonPhase === 'rooms') {
      enterMode(GAME_MODE.DUNGEON_ROOMS)
    } else {
      enterMode(GAME_MODE.IDLE)
    }
  }

  function enemyAttack() {
    if (devMode.value) {
      battleStore.enemyAttack(true)
    } else {
      battleStore.enemyAttack()
    }
  }

  function answerAttack(correct: boolean) {
    battleStore.answerAttack(correct, devMode.value)
  }

  function startAnswer() {
    battleStore.startAnswer()
  }

  function setIdle() {
    battleStore.setIdle()
  }

  function loseBattle() {
    battleStore.loseBattle()
  }

  function flee() {
    battleStore.flee()
  }

  function resetCombo() {
    battleStore.resetCombo()
  }

  function triggerCriticalEffect() {
    battleStore.triggerCriticalEffect()
  }

  function startCapture() {
    battleStore.startCapture()
  }

  function submitCaptureAnswer(index: number) {
    battleStore.submitCaptureAnswer(index, devMode.value)
  }

  function skipCapture() {
    battleStore.skipCapture()
  }

  function clearCaptureData() {
    battleStore.clearCaptureData()
  }

  function initLegendaryCaptureBoss() {
    battleStore.initLegendaryCaptureBoss()
  }

  function generateDrop() {
    battleStore.generateDrop()
  }

  function claimDrop() {
    battleStore.claimDrop()
  }

  // ===== 限时 Boss =====
  async function enterWeeklyBoss() {
    const prepared = await weeklyBossStore.prepareWeeklyBoss()
    if (!prepared.success) return prepared
    await battleStore.startBattle({
      ...prepared.sessionData,
      callbacks: weeklyBossStore.createWeeklyBossCallbacks(battleStore),
    })
    enterMode(GAME_MODE.WEEKLY_BOSS)
    weeklyBossStore.startWeeklyBossTimer(() => weeklyBossAnswerAttack(false))
    return { success: true }
  }

  function winWeeklyBoss() {
    const levelUpResult = weeklyBossStore.winWeeklyBoss(battleStore)
    if (levelUpResult.titleChanged) {
      pvpStore.openTitleDisplay(levelUpResult.titleDisplayLevel)
    }
    enterMode(GAME_MODE.WON)
  }

  function exitWeeklyBoss() {
    weeklyBossStore.exitWeeklyBoss(battleStore)
    battleStore.exitBattle()
    enterMode(GAME_MODE.IDLE)
  }

  function weeklyBossAnswerAttack(correct: boolean) {
    weeklyBossStore.weeklyBossAnswerAttack(correct, devMode.value, battleStore)
  }

  function startWeeklyBossTimer() {
    weeklyBossStore.startWeeklyBossTimer(() => weeklyBossAnswerAttack(false))
  }

  // ===== PVP =====
  function enterPvp() {
    pvpStore.enterPvp()
    enterMode(GAME_MODE.PVP)
  }

  function exitPvp() {
    pvpStore.exitPvp()
    enterMode(GAME_MODE.IDLE)
  }

  async function recordPvpResult(result: PvpResult) {
    // pvpStore.recordPvpResult 内部已处理称号弹窗与存档
    return await pvpStore.recordPvpResult(result)
  }

  function openTitleDisplay(lv?: number) {
    pvpStore.openTitleDisplay(lv)
  }

  function closeTitleDisplay() {
    pvpStore.closeTitleDisplay()
  }

  return {
    // 通用战斗
    winBattle,
    exitBattle,
    enemyAttack,
    answerAttack,
    startAnswer,
    setIdle,
    loseBattle,
    flee,
    resetCombo,
    triggerCriticalEffect,
    startCapture,
    submitCaptureAnswer,
    skipCapture,
    clearCaptureData,
    initLegendaryCaptureBoss,
    generateDrop,
    claimDrop,
    // 限时 Boss
    enterWeeklyBoss,
    winWeeklyBoss,
    exitWeeklyBoss,
    weeklyBossAnswerAttack,
    startWeeklyBossTimer,
    // PVP
    enterPvp,
    exitPvp,
    recordPvpResult,
    openTitleDisplay,
    closeTitleDisplay,
  }
}
