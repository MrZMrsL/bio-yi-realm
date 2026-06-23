/**
 * 图鉴与成就协调器
 *
 * 负责把图鉴、成就、统计等操作暴露给 game facade。
 */
import type { useCyclopediaStore } from '../cyclopediaStore.ts'

type CyclopediaStore = ReturnType<typeof useCyclopediaStore>

export interface CyclopediaCoordinatorDependencies {
  cyclopediaStore: CyclopediaStore
}

export function useGameCyclopediaCoordinator(deps: CyclopediaCoordinatorDependencies) {
  const { cyclopediaStore } = deps

  function addToCyclopedia(...args: Parameters<CyclopediaStore['addToCyclopedia']>): ReturnType<CyclopediaStore['addToCyclopedia']> {
    return cyclopediaStore.addToCyclopedia(...args)
  }

  function getCyclopediaProgress(...args: Parameters<CyclopediaStore['getCyclopediaProgress']>): ReturnType<CyclopediaStore['getCyclopediaProgress']> {
    return cyclopediaStore.getCyclopediaProgress(...args)
  }

  function isDiscovered(...args: Parameters<CyclopediaStore['isDiscovered']>): ReturnType<CyclopediaStore['isDiscovered']> {
    return cyclopediaStore.isDiscovered(...args)
  }

  function getDiscoveryCount(): ReturnType<CyclopediaStore['getDiscoveryCount']> {
    return cyclopediaStore.getDiscoveryCount()
  }

  function updateStats(...args: Parameters<CyclopediaStore['updateStats']>): ReturnType<CyclopediaStore['updateStats']> {
    return cyclopediaStore.updateStats(...args)
  }

  function checkAchievements(): ReturnType<CyclopediaStore['checkAchievements']> {
    return cyclopediaStore.checkAchievements()
  }

  return {
    addToCyclopedia,
    getCyclopediaProgress,
    isDiscovered,
    getDiscoveryCount,
    updateStats,
    checkAchievements,
  }
}
