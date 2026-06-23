/**
 * 装备与消耗品协调器
 *
 * 负责把装备、物品、锻造、药水等系统操作暴露给 game facade。
 */
import type { useEquipmentStore } from '../equipmentStore.ts'

type EquipmentStore = ReturnType<typeof useEquipmentStore>

export interface EquipmentCoordinatorDependencies {
  equipmentStore: EquipmentStore
}

export function useGameEquipmentCoordinator(deps: EquipmentCoordinatorDependencies) {
  const { equipmentStore } = deps

  function equip(...args: Parameters<EquipmentStore['equip']>): ReturnType<EquipmentStore['equip']> {
    return equipmentStore.equip(...args)
  }

  function unequip(...args: Parameters<EquipmentStore['unequip']>): ReturnType<EquipmentStore['unequip']> {
    return equipmentStore.unequip(...args)
  }

  function addItem(...args: Parameters<EquipmentStore['addItem']>): ReturnType<EquipmentStore['addItem']> {
    return equipmentStore.addItem(...args)
  }

  function addMaterial(...args: Parameters<EquipmentStore['addMaterial']>): ReturnType<EquipmentStore['addMaterial']> {
    return equipmentStore.addMaterial(...args)
  }

  function usePotion(...args: Parameters<EquipmentStore['usePotion']>): ReturnType<EquipmentStore['usePotion']> {
    return equipmentStore.usePotion(...args)
  }

  function buyItem(...args: Parameters<EquipmentStore['buyItem']>): ReturnType<EquipmentStore['buyItem']> {
    return equipmentStore.buyItem(...args)
  }

  function forgeItem(...args: Parameters<EquipmentStore['forgeItem']>): ReturnType<EquipmentStore['forgeItem']> {
    return equipmentStore.forgeItem(...args)
  }

  function decayBuffs(): ReturnType<EquipmentStore['decayBuffs']> {
    return equipmentStore.decayBuffs()
  }

  function addBattleCard(...args: Parameters<EquipmentStore['addBattleCard']>): ReturnType<EquipmentStore['addBattleCard']> {
    return equipmentStore.addBattleCard(...args)
  }

  function useBattleCard(...args: Parameters<EquipmentStore['useBattleCard']>): ReturnType<EquipmentStore['useBattleCard']> {
    return equipmentStore.useBattleCard(...args)
  }

  function hasBattleCard(...args: Parameters<EquipmentStore['hasBattleCard']>): ReturnType<EquipmentStore['hasBattleCard']> {
    return equipmentStore.hasBattleCard(...args)
  }

  return {
    equip,
    unequip,
    addItem,
    addMaterial,
    usePotion,
    buyItem,
    forgeItem,
    decayBuffs,
    addBattleCard,
    useBattleCard,
    hasBattleCard,
  }
}
