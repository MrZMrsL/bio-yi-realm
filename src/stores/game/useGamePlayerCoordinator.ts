/**
 * 玩家成长协调器
 *
 * 负责把玩家升级、技能、加点等成长相关操作暴露给 game facade。
 */
import type { usePlayerStore } from '../playerStore.ts'

type PlayerStore = ReturnType<typeof usePlayerStore>

export interface PlayerCoordinatorDependencies {
  playerStore: PlayerStore
}

export function useGamePlayerCoordinator(deps: PlayerCoordinatorDependencies) {
  const { playerStore } = deps

  function setSpecialization(...args: Parameters<PlayerStore['setSpecialization']>): ReturnType<PlayerStore['setSpecialization']> {
    return playerStore.setSpecialization(...args)
  }

  function checkSkillUnlocks(): ReturnType<PlayerStore['checkSkillUnlocks']> {
    return playerStore.checkSkillUnlocks()
  }

  function consumeSkillUnlock(...args: Parameters<PlayerStore['consumeSkillUnlock']>): ReturnType<PlayerStore['consumeSkillUnlock']> {
    return playerStore.consumeSkillUnlock(...args)
  }

  function isSkillUnlocked(...args: Parameters<PlayerStore['isSkillUnlocked']>): ReturnType<PlayerStore['isSkillUnlocked']> {
    return playerStore.isSkillUnlocked(...args)
  }

  function allocateStat(...args: Parameters<PlayerStore['allocateStat']>): ReturnType<PlayerStore['allocateStat']> {
    return playerStore.allocateStat(...args)
  }

  function resetStats(): ReturnType<PlayerStore['resetStats']> {
    return playerStore.resetStats()
  }

  return {
    setSpecialization,
    checkSkillUnlocks,
    consumeSkillUnlock,
    isSkillUnlocked,
    allocateStat,
    resetStats,
  }
}
