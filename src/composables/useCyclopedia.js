import { computed } from 'vue'
import { useCyclopediaStore } from '../stores/cyclopediaStore.ts'
import { RARITY_CONFIG, FISH_RARITY_COUNTS, TOTAL_FISH_COUNT } from '../data/fishingMeta.ts'

/**
 * 图鉴相关查询的通用 composable。
 * 将散落在各组件中的 isDiscovered / getDiscoveryCount / getEncProgress
 * 等重复逻辑收敛到一处，避免多处直接访问 store.cyclopedia 的细节。
 */
export function useCyclopedia() {
  const store = useCyclopediaStore()

  const cyclopedia = computed(() => store.cyclopedia)

  function isDiscovered(type, name) {
    return store.isDiscovered(type, name)
  }

  function getDiscoveryCount(type, name) {
    return store.getDiscoveryCount(type, name)
  }

  function getEncProgress(type) {
    const progress = store.getCyclopediaProgress(type)
    return `${progress.discovered}/${progress.total}`
  }

  const fishCollectionPercent = computed(() => {
    const discovered = store.cyclopedia?.fishes?.length || 0
    return TOTAL_FISH_COUNT > 0 ? Math.floor((discovered / TOTAL_FISH_COUNT) * 100) : 0
  })

  function fishCollectionByRarity(allFish) {
    const discovered = store.cyclopedia?.fishes || []
    return Object.entries(RARITY_CONFIG).reduce((acc, [rarity, config]) => {
      const total = FISH_RARITY_COUNTS[rarity] || 0
      const have = discovered.reduce((count, fishName) => {
        const fishData = allFish.find(f => f.name === fishName)
        return fishData && fishData.rarity === rarity ? count + 1 : count
      }, 0)
      acc[rarity] = {
        ...config,
        total,
        have,
        percent: total > 0 ? Math.min(100, Math.floor((have / total) * 100)) : 0,
      }
      return acc
    }, {})
  }

  return {
    cyclopedia,
    isDiscovered,
    getDiscoveryCount,
    getEncProgress,
    fishCollectionPercent,
    fishCollectionByRarity,
  }
}
