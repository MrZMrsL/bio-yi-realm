import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { canForge } from '../data/forge.ts'
import { POTION_BUFF_DURATION } from '../config/balance.js'
import { usePlayerStore } from './playerStore.ts'
import { useFarmStore } from './farmStore.ts'
import { useCyclopediaStore } from './cyclopediaStore.ts'
import { useLogStore } from './logStore.ts'
import { saveNow } from '../services/saveService.js'
import type { Equipment, Consumable, Monster, ShopItem, ForgeRecipe, BattleCard, BattleCardType } from '../types.ts'

export interface Buff {
  effect: 'atk' | 'def' | 'crit'
  value: number
  remaining: number
}

export interface DropItem {
  type: 'equipment' | 'consumable' | 'battleCard'
  item: Equipment | Consumable | BattleCard
}

export const useEquipmentStore = defineStore('equipment', () => {
  // ===== 装备与物品 =====
  const equipment = ref<Equipment[]>([])
  const consumables = ref<Consumable[]>([])
  const battleCards = ref<Record<BattleCardType, number>>({ hint: 0, shield: 0, crit: 0 })
  const equipped = ref<{ weapon: Equipment | null; armor: Equipment | null; accessory: Equipment | null }>({
    weapon: null,
    armor: null,
    accessory: null,
  })
  const inventory = ref<Record<string, number>>({})
  const activeBuffs = ref<Buff[]>([])

  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()

  // ===== 战斗属性聚合（原在 game.js，下沉到装备/农场相关 store） =====
  const monsterBonus = computed(() => {
    if (!farmStore.activeMonster) return { atk: 0, def: 0, hp: 0 }
    const pet = farmStore.activeMonster as Monster
    return {
      atk: Math.floor((pet.atk || 0) * 0.25),
      def: Math.floor((pet.def || 0) * 0.25),
      hp: Math.floor((pet.maxHp || 0) * 0.15),
    }
  })

  const totalAtk = computed(() => {
    let base = playerStore.atk + monsterBonus.value.atk
    if (equipped.value.weapon) base += equipped.value.weapon.atk || 0
    if (equipped.value.accessory) base += equipped.value.accessory.atk || 0
    return base
  })

  const totalDef = computed(() => {
    let base = playerStore.def + monsterBonus.value.def
    if (equipped.value.armor) base += equipped.value.armor.def || 0
    if (equipped.value.accessory) base += equipped.value.accessory.def || 0
    return base
  })

  function equip(item: Equipment) {
    if (item.type === 'weapon') {
      equipped.value.weapon = item
    } else if (item.type === 'armor') {
      equipped.value.armor = item
    } else if (item.type === 'accessory') {
      equipped.value.accessory = item
    }
    saveNow()
  }

  function unequip(type: 'weapon' | 'armor' | 'accessory') {
    if (type === 'weapon' || type === 'armor' || type === 'accessory') {
      equipped.value[type] = null
      saveNow()
    }
  }

  function addItem(drop: DropItem) {
    if (drop.type === 'equipment') {
      equipment.value.push(drop.item as Equipment)
    } else if (drop.type === 'consumable') {
      consumables.value.push(drop.item as Consumable)
    } else if (drop.type === 'battleCard') {
      addBattleCard((drop.item as BattleCard).id)
    }
    saveNow()
  }

  function addBattleCard(type: BattleCardType, count = 1) {
    battleCards.value[type] = (battleCards.value[type] || 0) + count
    saveNow()
  }

  function useBattleCard(type: BattleCardType): boolean {
    if (!battleCards.value[type]) return false
    battleCards.value[type] = Math.max(0, battleCards.value[type] - 1)
    saveNow()
    return true
  }

  function hasBattleCard(type: BattleCardType): boolean {
    return (battleCards.value[type] || 0) > 0
  }

  function addMaterial(name: string, count: number) {
    inventory.value[name] = (inventory.value[name] || 0) + count
    saveNow()
  }

  function usePotion(itemId: string): boolean {
    const logStore = useLogStore()
    const idx = consumables.value.findIndex(i => i.id === itemId)
    if (idx === -1) return false

    const item = consumables.value[idx]
    if (item.type === 'potion' || item.type === 'heal') {
      const healAmount = item.value ? item.value : Math.floor(playerStore.maxHp * (item.ratio || 0.3))
      playerStore.heal(healAmount)
      logStore.push(`使用 ${item.name}，恢复 ${healAmount} 点生命！`)
    } else if (item.type === 'buff') {
      const val = item.value || item.bonusAtk || item.bonusDef || 0
      if (item.effect === 'atk' || item.bonusAtk) {
        playerStore.buffAtk(val)
        activeBuffs.value.push({ effect: 'atk', value: val, remaining: POTION_BUFF_DURATION })
        logStore.push(`使用 ${item.name}，攻击+${val}（持续${POTION_BUFF_DURATION}场战斗）！`)
      } else if (item.effect === 'def' || item.bonusDef) {
        playerStore.buffDef(val)
        activeBuffs.value.push({ effect: 'def', value: val, remaining: POTION_BUFF_DURATION })
        logStore.push(`使用 ${item.name}，防御+${val}（持续${POTION_BUFF_DURATION}场战斗）！`)
      } else if (item.effect === 'crit') {
        activeBuffs.value.push({ effect: 'crit', value: val, remaining: POTION_BUFF_DURATION })
        logStore.push(`使用 ${item.name}，暴击率+${val}%（持续3场战斗）！`)
      }
    } else if (item.type === 'revive') {
      playerStore.fullHeal()
      logStore.push(`使用 ${item.name}，满血复活！`)
    } else if (
      (item.type === 'scroll' && item.effect === 'exp') ||
      (item.type === 'consumable' && item.subtype === 'exp')
    ) {
      const effectExp = item.effect?.exp
      const expVal = item.value || effectExp || 0
      playerStore.addExp(expVal)
      logStore.push(`使用 ${item.name}，获得 ${expVal} 点经验！`)
    }

    consumables.value.splice(idx, 1)
    saveNow()
    return true
  }

  function buyItem(item: ShopItem): boolean {
    if (!playerStore.spendGold(item.price)) return false
    if (item.type === 'equipment') {
      equipment.value.push({ ...item, id: Date.now() + Math.random() })
    } else if (item.type === 'consumable') {
      consumables.value.push({ ...item, id: Date.now() + Math.random() } as Consumable)
    } else if (item.type === 'material' && item.name && item.count) {
      inventory.value[item.name] = (inventory.value[item.name] || 0) + item.count
    } else if (item.type === 'battleCard' && item.subtype) {
      addBattleCard(item.subtype as BattleCardType, item.count || 1)
    }
    saveNow()
    return true
  }

  function forgeItem(recipe: ForgeRecipe): boolean {
    const cyclopediaStore = useCyclopediaStore()
    if (!canForge(recipe, inventory.value, playerStore.gold)) return false

    if (!playerStore.spendGold(recipe.gold)) return false

    for (const [mat, count] of Object.entries(recipe.materials)) {
      inventory.value[mat] -= count
      if (inventory.value[mat] <= 0) {
        delete inventory.value[mat]
      }
    }

    // 排除配方元数据，只保留装备/消耗品字段
    const item = {
      id: `${Date.now()}_${Math.random()}`,
      name: recipe.name,
      type: recipe.type,
      icon: recipe.icon,
      desc: recipe.desc,
      atk: recipe.atk,
      def: recipe.def,
      effect: recipe.effect,
      ratio: recipe.ratio,
      bonusAtk: recipe.bonusAtk,
      bonusDef: recipe.bonusDef,
    } as Equipment
    equipment.value.push(item)
    cyclopediaStore.updateStats('totalForges', 1)
    cyclopediaStore.checkAchievements()
    saveNow()
    return true
  }

  function decayBuffs() {
    const logStore = useLogStore()
    activeBuffs.value = activeBuffs.value.filter(b => {
      b.remaining--
      if (b.remaining <= 0) {
        if (b.effect === 'atk') {
          playerStore.buffAtk(-b.value)
          logStore.push(`⚠️ 攻击增益效果结束！攻击-${b.value}`)
        } else if (b.effect === 'def') {
          playerStore.buffDef(-b.value)
          logStore.push(`⚠️ 防御增益效果结束！防御-${b.value}`)
        } else if (b.effect === 'crit') {
          logStore.push(`⚠️ 暴击增益效果结束！`)
        }
        return false
      }
      return true
    })
  }

  function reset() {
    equipment.value = []
    consumables.value = []
    battleCards.value = { hint: 0, shield: 0, crit: 0 }
    equipped.value = { weapon: null, armor: null, accessory: null }
    inventory.value = {}
    activeBuffs.value = []
  }

  function serialize(): Record<string, unknown> {
    return {
      equipment: equipment.value,
      consumables: consumables.value,
      battleCards: battleCards.value,
      equipped: equipped.value,
      inventory: inventory.value,
      activeBuffs: activeBuffs.value,
    }
  }

  function deserialize(saveData: Record<string, unknown>) {
    reset()
    equipment.value = (saveData.equipment as Equipment[]) || []
    consumables.value = (saveData.consumables as Consumable[]) || []
    battleCards.value = (saveData.battleCards as Record<BattleCardType, number>) || { hint: 0, shield: 0, crit: 0 }
    equipped.value = (saveData.equipped as { weapon: Equipment | null; armor: Equipment | null; accessory: Equipment | null }) || {
      weapon: null,
      armor: null,
      accessory: null,
    }
    inventory.value = (saveData.inventory as Record<string, number>) || {}
    activeBuffs.value = (saveData.activeBuffs as Buff[]) || []
  }

  return {
    equipment,
    consumables,
    battleCards,
    equipped,
    inventory,
    activeBuffs,
    monsterBonus,
    totalAtk,
    totalDef,
    equip,
    unequip,
    addItem,
    addMaterial,
    addBattleCard,
    useBattleCard,
    hasBattleCard,
    usePotion,
    buyItem,
    forgeItem,
    decayBuffs,
    reset,
    serialize,
    deserialize,
  }
})
