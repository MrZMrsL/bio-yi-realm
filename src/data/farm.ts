// farm.ts - 农场/宠物系统数据

import type { Monster, MonsterAbility, ElementInfo, FuseRule } from '../types.ts'
import { FARM_PET_LEVEL_STAT_GROWTH, FARM_PET_MAX_EXP_BASE } from '../config/balance.js'

// 地牢元素定义
export const DUNGEON_ELEMENTS: Record<string, ElementInfo> = {
  water: { name: '水', icon: '💧', color: '#3498db', desc: '水元素：克制火与酸' },
  fire: { name: '火', icon: '🔥', color: '#e74c3c', desc: '火元素：克制冰与风' },
  acid: { name: '酸', icon: '🧪', color: '#27ae60', desc: '酸元素：克制水与电' },
  electric: { name: '电', icon: '⚡', color: '#f1c40f', desc: '电元素：克制水与风' },
  ice: { name: '冰', icon: '❄️', color: '#aed6f1', desc: '冰元素：克制火与风' },
  wind: { name: '风', icon: '🌪️', color: '#aeb6bf', desc: '风元素：克制火与冰' },
}

// 元素克制关系：key克制的元素列表
export const ELEMENT_COUNTER: Record<string, string[]> = {
  water: ['fire', 'acid'],
  fire: ['ice', 'wind'],
  acid: ['water', 'electric'],
  electric: ['water', 'wind'],
  ice: ['fire', 'wind'],
  wind: ['fire', 'ice'],
}

// 元素名称映射
export const ELEMENT_NAME_MAP: Record<string, string> = {
  水: 'water',
  火: 'fire',
  酸: 'acid',
  电: 'electric',
  冰: 'ice',
  风: 'wind',
}

// 稀有度对基础属性的加成倍率
export const RARITY_MULTIPLIERS: Record<string, number> = {
  common: 1.0,
  rare: 1.2,
  epic: 1.5,
  legendary: 2.0,
}

// 升级材料映射
export const UPGRADE_MATERIALS: Record<string, string> = {
  water: '水之精华',
  fire: '火焰核心',
  acid: '酸液结晶',
  electric: '雷电石',
  ice: '冰霜碎片',
  wind: '风之羽毛',
  earth: '大地岩晶',
  light: '光之棱镜',
  dark: '暗物质微粒',
  metal: '金属合金',
  nature: '自然精华',
  spirit: '灵气结晶',
  // 新增材料用于更高级的锻造
  mercury_essence: '汞精华',
  sulfur_crystal: '硫晶体',
  salt_essence: '盐精华',
  bio_cell: '细胞样本',
  enzyme_extract: '酶提取物',
  gene_fragment: '基因片段',
  hexagram_powder: '六爻粉末',
  yin_yang_orb: '阴阳珠',
  trigram_stone: '卦石',
}

// 元素学科映射（捕捉时出题用）
export const ELEMENT_SUBJECT_MAP: Record<string, string> = {
  water: 'chem',
  fire: 'chem',
  acid: 'chem',
  electric: 'bio',
  ice: 'bio',
  wind: 'bio',
}

// 给敌人分配元素（按学科循环）
const ELEMENT_KEYS = ['water', 'fire', 'acid', 'electric', 'ice', 'wind']
export function assignElementToEnemies<T extends { element?: string }>(enemies: T[]): (T & { element: string })[] {
  return enemies.map((e, i) => ({
    ...e,
    element: ELEMENT_KEYS[i % ELEMENT_KEYS.length],
  }))
}

// 生成怪物能力加成
export function generateMonsterAbility(element: string, captureFloor: number): MonsterAbility {
  const baseBonus = Math.max(3, Math.floor(captureFloor * 0.8))
  const hpBonus = Math.max(5, Math.floor(captureFloor * 1.5))
  const abilities = {
    water: { atkBonus: 0, defBonus: baseBonus, hpBonus, element: 'water', desc: `防御+${baseBonus} 生命+${hpBonus}` },
    fire: { atkBonus: baseBonus, defBonus: 0, hpBonus, element: 'fire', desc: `攻击+${baseBonus} 生命+${hpBonus}` },
    acid: {
      atkBonus: Math.floor(baseBonus * 0.6),
      defBonus: Math.floor(baseBonus * 0.6),
      hpBonus,
      element: 'acid',
      desc: `攻击+${Math.floor(baseBonus * 0.6)} 防御+${Math.floor(baseBonus * 0.6)} 生命+${hpBonus}`,
    },
    electric: {
      atkBonus: Math.floor(baseBonus * 1.2),
      defBonus: 0,
      hpBonus,
      element: 'electric',
      desc: `攻击+${Math.floor(baseBonus * 1.2)} 生命+${hpBonus}`,
    },
    ice: {
      atkBonus: 0,
      defBonus: Math.floor(baseBonus * 1.2),
      hpBonus,
      element: 'ice',
      desc: `防御+${Math.floor(baseBonus * 1.2)} 生命+${hpBonus}`,
    },
    wind: {
      atkBonus: Math.floor(baseBonus * 0.4),
      defBonus: Math.floor(baseBonus * 0.4),
      hpBonus,
      element: 'wind',
      desc: `攻击+${Math.floor(baseBonus * 0.4)} 防御+${Math.floor(baseBonus * 0.4)} 生命+${hpBonus} 先手优势`,
    },
  }
  return abilities[element] || abilities.water
}

// 根据等级与稀有度重新计算宠物实际属性
export function recalcMonsterStats(m: Monster): void {
  const rarityMult = RARITY_MULTIPLIERS[m.rarity] || 1
  const levelMult = 1 + (m.level - 1) * FARM_PET_LEVEL_STAT_GROWTH
  const totalMult = rarityMult * levelMult
  m.maxHp = Math.floor(m.baseHp * totalMult)
  m.atk = Math.floor(m.baseAtk * totalMult)
  m.def = Math.floor(m.baseDef * totalMult)
  m.hp = Math.min(m.hp || m.maxHp, m.maxHp)
  m.ability = generateMonsterAbility(m.element, m.captureFloor)
}

// 创建农场怪物对象
export function createFarmMonster(
  name: string,
  icon: string,
  element: string,
  baseHp: number,
  baseAtk: number,
  baseDef: number,
  captureFloor: number,
  rarity: string = 'common'
): Monster {
  const rarityMult = RARITY_MULTIPLIERS[rarity] || 1
  const ability = generateMonsterAbility(element, captureFloor)
  const m = {
    name,
    icon: icon || '👾',
    element,
    rarity,
    level: 1,
    exp: 0,
    maxExp: FARM_PET_MAX_EXP_BASE,
    baseHp: Math.floor(baseHp * rarityMult),
    baseAtk: Math.floor(baseAtk * rarityMult),
    baseDef: Math.floor(baseDef * rarityMult),
    hp: 0,
    maxHp: 0,
    atk: 0,
    def: 0,
    captureFloor,
    ability,
    capturedAt: Date.now(),
  }
  recalcMonsterStats(m)
  return m
}

// ===== 宠物融合进化系统 =====

// 融合规则
export const FUSE_RULES: Record<string, FuseRule> = {
  common: { targetRarity: 'rare', cost: 300, statMult: 1.6, iconUpgrade: '⭐' },
  rare: { targetRarity: 'epic', cost: 1000, statMult: 2.0, iconUpgrade: '🌟' },
  epic: { targetRarity: 'legendary', cost: 2500, statMult: 2.6, iconUpgrade: '💫', grantSkill: true },
}

// 进化称号前缀
export const EVOLUTION_PREFIX: Record<string, string> = {
  common: '精英',
  rare: '史诗',
  epic: '传说',
}

export interface FusionResult {
  success?: boolean
  result?: Monster
  error?: string
}

// 融合进化宠物
export function fusePets(pet1: Monster | null, pet2: Monster | null): FusionResult | null {
  if (!pet1 || !pet2) return null
  if (pet1.element !== pet2.element) return { error: '元素不同，无法融合' }
  if (pet1.rarity !== pet2.rarity) return { error: '稀有度不同，无法融合' }
  const rarity = pet1.rarity
  const rule = FUSE_RULES[rarity]
  if (!rule) return { error: '传说级无法再融合' }

  const targetFloor = Math.max(pet1.captureFloor || 1, pet2.captureFloor || 1)
  const newAbility = generateMonsterAbility(pet1.element, targetFloor)

  // 融合后的属性取两只中较高者乘以倍率
  const newHp = Math.floor(Math.max(pet1.baseHp || 50, pet2.baseHp || 50) * rule.statMult)
  const newAtk = Math.floor(Math.max(pet1.baseAtk || 10, pet2.baseAtk || 10) * rule.statMult)
  const newDef = Math.floor(Math.max(pet1.baseDef || 3, pet2.baseDef || 3) * rule.statMult)

  // 如果传说级，给予特殊被动
  let passiveSkill = null
  if (rule.grantSkill) {
    passiveSkill = {
      name: `${pet1.element}之魂`,
      desc: `${
        pet1.element === 'fire'
          ? '火焰'
          : pet1.element === 'water'
            ? '流水'
            : pet1.element === 'acid'
              ? '酸蚀'
              : pet1.element === 'electric'
                ? '雷电'
                : pet1.element === 'ice'
                  ? '冰霜'
                  : '疾风'
      }之力觉醒，全属性额外+20%`,
    }
  }

  const prefix = EVOLUTION_PREFIX[rarity] || ''
  const newName = `${prefix}·${pet1.name}`

  const fused = {
    name: newName,
    icon: pet1.icon,
    element: pet1.element,
    rarity: rule.targetRarity,
    level: 1,
    exp: 0,
    maxExp: 80,
    baseHp: newHp,
    baseAtk: newAtk,
    baseDef: newDef,
    hp: 0,
    maxHp: 0,
    atk: 0,
    def: 0,
    captureFloor: targetFloor,
    ability: newAbility,
    passiveSkill,
    fusedAt: Date.now(),
    parents: [pet1.name, pet2.name],
  }
  recalcMonsterStats(fused)
  return fused
}

// 获取升级材料名称
export function getUpgradeMaterialName(element: string): string {
  return UPGRADE_MATERIALS[element] || '怪物精华'
}

export interface ElementCounterResult {
  multiplier: number
  desc: string
}

// 检查元素克制
export function checkElementCounter(attackerElement: string, defenderElement: string): ElementCounterResult | null {
  if (!attackerElement || !defenderElement) return null
  const counters = ELEMENT_COUNTER[attackerElement]
  if (counters && counters.includes(defenderElement)) {
    return { multiplier: 1.5, desc: '克制！' }
  }
  // 检查是否被克制
  const defenderCounters = ELEMENT_COUNTER[defenderElement]
  if (defenderCounters && defenderCounters.includes(attackerElement)) {
    return { multiplier: 0.7, desc: '被克制...' }
  }
  return { multiplier: 1.0, desc: '' }
}

// 农场容量上限
export const FARM_MAX_CAPACITY = 12
