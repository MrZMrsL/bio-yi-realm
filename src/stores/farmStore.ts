import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import {
  recalcMonsterStats,
  getUpgradeMaterialName,
  RARITY_MULTIPLIERS,
  fusePets,
  FUSE_RULES,
} from '../data/farm.ts'
import {
  FARM_UPGRADE_MAT_COST_PER_LEVEL,
  FARM_PET_MAX_EXP_BASE,
  FARM_PET_MAX_EXP_GROWTH,
} from '../config/balance.js'
import { usePlayerStore } from './playerStore.ts'
import { useEquipmentStore } from './equipmentStore.ts'
import { useLogStore } from './logStore.ts'
import { saveNow } from '../services/saveService.js'
import type { Monster } from '../types.ts'

export interface FusionResult {
  success?: boolean
  result?: Monster
  error?: string
}

export interface FuseRule {
  targetRarity: string
  cost: number
  statMult: number
  iconUpgrade: string
  grantSkill?: boolean
}

export const useFarmStore = defineStore('farm', () => {
  // ===== 农场与宠物 =====
  const farm = ref<Monster[]>([])
  const activeMonster = shallowRef<Monster | null>(null)
  const logStore = useLogStore()

  function setFollowMonster(idx: number) {
    if (!farm.value[idx]) return
    activeMonster.value = farm.value[idx]
  }

  function unfollowMonster() {
    activeMonster.value = null
  }

  function upgradeMonster(idx: number): boolean {
    const equipmentStore = useEquipmentStore()
    const m = farm.value[idx]
    if (!m) return false

    if (m.exp >= m.maxExp) {
      m.exp -= m.maxExp
    } else {
      const matCost = Math.floor(m.level * FARM_UPGRADE_MAT_COST_PER_LEVEL)
      const matName = getUpgradeMaterialName(m.element)
      const matCount = equipmentStore.inventory[matName] || 0

      if (matCount < matCost) {
        logStore.push(`${matName} 不足 (${matCount}/${matCost})`)
        return false
      }

      equipmentStore.inventory[matName] -= matCost
      if (equipmentStore.inventory[matName] <= 0) {
        delete equipmentStore.inventory[matName]
      }
    }

    m.level++
    m.maxExp = Math.floor(FARM_PET_MAX_EXP_BASE * Math.pow(FARM_PET_MAX_EXP_GROWTH, m.level - 1))
    recalcMonsterStats(m)

    saveNow()
    return true
  }

  function releaseMonster(idx: number): boolean {
    if (!farm.value[idx]) return false
    farm.value.splice(idx, 1)
    if (activeMonster.value && !farm.value.includes(activeMonster.value)) {
      activeMonster.value = null
    }
    saveNow()
    return true
  }

  function executeFusion(idx1: number, idx2: number): FusionResult {
    const playerStore = usePlayerStore()
    if (idx1 === idx2) return { error: '不能选择同一只怪物' }
    const pet1 = farm.value[idx1]
    const pet2 = farm.value[idx2]
    if (!pet1 || !pet2) return { error: '怪物不存在' }

    const result = fusePets(pet1, pet2) as FusionResult | null
    if (result?.error) return result
    if (!result || !result.result) return { error: '融合失败' }

    const rule = FUSE_RULES[pet1.rarity as keyof typeof FUSE_RULES] as FuseRule | undefined
    if (!rule) return { error: '传说级无法再融合' }
    if (!playerStore.spendGold(rule.cost)) return { error: `金币不足，需要 ${rule.cost} 金币` }

    const i1 = Math.min(idx1, idx2)
    const i2 = Math.max(idx1, idx2)
    farm.value.splice(i2, 1)
    farm.value.splice(i1, 1)

    farm.value.push(result.result)

    logStore.push(`🔀 融合成功！${pet1.name} + ${pet2.name} → ${result.result.name}！（消耗 ${rule.cost} 金币）`)
    saveNow()
    return { success: true, result: result.result }
  }

  function reset() {
    farm.value = []
    activeMonster.value = null
  }

  function serialize(): Record<string, unknown> {
    return {
      farm: farm.value,
      activeMonster: activeMonster.value,
    }
  }

  function deserialize(saveData: Record<string, unknown>) {
    reset()
    farm.value = (saveData.farm as Monster[]) || []
    activeMonster.value = (saveData.activeMonster as Monster) || null

    for (const pet of farm.value) {
      if (!pet || typeof pet !== 'object') continue
      if (!pet.baseHp || !pet.baseAtk || !pet.baseDef) {
        const rarityMult = (pet.rarity && RARITY_MULTIPLIERS[pet.rarity as keyof typeof RARITY_MULTIPLIERS]) || 1
        const levelMult = 1 + (pet.level - 1) * 0.15
        const mult = (rarityMult as number) * levelMult
        pet.baseHp = Math.floor((pet.maxHp || pet.hp || 50) / mult) || 50
        pet.baseAtk = Math.floor((pet.atk || 10) / mult) || 10
        pet.baseDef = Math.floor((pet.def || 5) / mult) || 5
      }
      recalcMonsterStats(pet)
    }
    if (activeMonster.value && !farm.value.includes(activeMonster.value)) {
      activeMonster.value = null
    }
  }

  return {
    farm,
    activeMonster,
    setFollowMonster,
    unfollowMonster,
    upgradeMonster,
    releaseMonster,
    executeFusion,
    reset,
    serialize,
    deserialize,
  }
})
