/**
 * 钓鱼协调器
 *
 * 负责把钓鱼、读书、答题等操作暴露给 game facade。
 */
import type { Ref } from 'vue'
import type { useFishingStore } from '../fishingStore.ts'

type FishingStore = ReturnType<typeof useFishingStore>

export interface FishingCoordinatorDependencies {
  fishingStore: FishingStore
  devMode: Ref<boolean>
}

export function useGameFishingCoordinator(deps: FishingCoordinatorDependencies) {
  const { fishingStore, devMode } = deps

  function recordFishCatch(...args: Parameters<FishingStore['recordFishCatch']>): ReturnType<FishingStore['recordFishCatch']> {
    return fishingStore.recordFishCatch(...args)
  }

  function removeFishFromRecent(...args: Parameters<FishingStore['removeFishFromRecent']>): ReturnType<FishingStore['removeFishFromRecent']> {
    return fishingStore.removeFishFromRecent(...args)
  }

  function eatFish(...args: Parameters<FishingStore['eatFish']>): ReturnType<FishingStore['eatFish']> {
    return fishingStore.eatFish(...args)
  }

  function releaseFish(...args: Parameters<FishingStore['releaseFish']>): ReturnType<FishingStore['releaseFish']> {
    return fishingStore.releaseFish(...args)
  }

  function startBookStudy(...args: Parameters<FishingStore['startBookStudy']>): ReturnType<FishingStore['startBookStudy']> {
    return fishingStore.startBookStudy(...args)
  }

  function submitBookStudyAnswer(index: number): ReturnType<FishingStore['submitBookStudyAnswer']> {
    return fishingStore.submitBookStudyAnswer(index, devMode.value)
  }

  function cancelBookStudy(): ReturnType<FishingStore['cancelBookStudy']> {
    return fishingStore.cancelBookStudy()
  }

  function canFishToday(): ReturnType<FishingStore['canFishToday']> {
    return fishingStore.canFishToday()
  }

  function unlockFishLimit(): ReturnType<FishingStore['unlockFishLimit']> {
    return fishingStore.unlockFishLimit()
  }

  function startBookQuiz(...args: Parameters<FishingStore['startBookQuiz']>): ReturnType<FishingStore['startBookQuiz']> {
    return fishingStore.startBookQuiz(...args)
  }

  function submitBookQuizAnswer(...args: Parameters<FishingStore['submitBookQuizAnswer']>): ReturnType<FishingStore['submitBookQuizAnswer']> {
    return fishingStore.submitBookQuizAnswer(...args)
  }

  function exitBookQuiz(): ReturnType<FishingStore['exitBookQuiz']> {
    return fishingStore.exitBookQuiz()
  }

  return {
    recordFishCatch,
    removeFishFromRecent,
    eatFish,
    releaseFish,
    startBookStudy,
    submitBookStudyAnswer,
    cancelBookStudy,
    canFishToday,
    unlockFishLimit,
    startBookQuiz,
    submitBookQuizAnswer,
    exitBookQuiz,
  }
}
