/**
 * 农场（宠物）协调器
 *
 * 负责把宠物跟随、升级、释放、融合等操作暴露给 game facade。
 */
import type { useFarmStore } from '../farmStore.ts'

type FarmStore = ReturnType<typeof useFarmStore>

export interface FarmCoordinatorDependencies {
  farmStore: FarmStore
}

export function useGameFarmCoordinator(deps: FarmCoordinatorDependencies) {
  const { farmStore } = deps

  function setFollowMonster(...args: Parameters<FarmStore['setFollowMonster']>): ReturnType<FarmStore['setFollowMonster']> {
    return farmStore.setFollowMonster(...args)
  }

  function unfollowMonster(...args: Parameters<FarmStore['unfollowMonster']>): ReturnType<FarmStore['unfollowMonster']> {
    return farmStore.unfollowMonster(...args)
  }

  function upgradeMonster(...args: Parameters<FarmStore['upgradeMonster']>): ReturnType<FarmStore['upgradeMonster']> {
    return farmStore.upgradeMonster(...args)
  }

  function releaseMonster(...args: Parameters<FarmStore['releaseMonster']>): ReturnType<FarmStore['releaseMonster']> {
    return farmStore.releaseMonster(...args)
  }

  function executeFusion(...args: Parameters<FarmStore['executeFusion']>): ReturnType<FarmStore['executeFusion']> {
    return farmStore.executeFusion(...args)
  }

  return {
    setFollowMonster,
    unfollowMonster,
    upgradeMonster,
    releaseMonster,
    executeFusion,
  }
}
