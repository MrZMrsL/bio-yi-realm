import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEquipmentStore } from '../../src/stores/equipmentStore.ts'
import { usePlayerStore } from '../../src/stores/playerStore.ts'
import { useFarmStore } from '../../src/stores/farmStore.ts'
import { useCyclopediaStore } from '../../src/stores/cyclopediaStore.ts'
import { useLogStore } from '../../src/stores/logStore.ts'

vi.mock('../../src/platform/env.js', () => ({
  isH5: () => true,
  isMiniProgram: () => false,
  isApp: () => false,
}))

describe('Battle Cards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始时没有道具卡', () => {
    const store = useEquipmentStore()
    expect(store.battleCards.hint).toBe(0)
    expect(store.battleCards.shield).toBe(0)
    expect(store.battleCards.crit).toBe(0)
    expect(store.hasBattleCard('hint')).toBe(false)
  })

  it('添加道具卡后数量增加', () => {
    const store = useEquipmentStore()
    store.addBattleCard('hint', 3)
    expect(store.battleCards.hint).toBe(3)
    expect(store.hasBattleCard('hint')).toBe(true)
  })

  it('使用道具卡后数量减少', () => {
    const store = useEquipmentStore()
    store.addBattleCard('shield', 2)
    const result = store.useBattleCard('shield')
    expect(result).toBe(true)
    expect(store.battleCards.shield).toBe(1)
  })

  it('没有道具卡时使用返回 false', () => {
    const store = useEquipmentStore()
    const result = store.useBattleCard('crit')
    expect(result).toBe(false)
  })

  it('存档序列化包含道具卡', () => {
    const store = useEquipmentStore()
    store.addBattleCard('crit', 5)
    const data = store.serialize()
    expect(data.battleCards).toEqual({ hint: 0, shield: 0, crit: 5 })
  })
})
