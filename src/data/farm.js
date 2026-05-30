// farm.js - 农场/宠物系统数据

// 地牢元素定义
export const DUNGEON_ELEMENTS = {
  water:    { name: '水', icon: '💧', color: '#3498db', desc: '水元素：克制火与酸' },
  fire:     { name: '火', icon: '🔥', color: '#e74c3c', desc: '火元素：克制冰与风' },
  acid:     { name: '酸', icon: '🧪', color: '#27ae60', desc: '酸元素：克制水与电' },
  electric: { name: '电', icon: '⚡', color: '#f1c40f', desc: '电元素：克制水与风' },
  ice:      { name: '冰', icon: '❄️', color: '#aed6f1', desc: '冰元素：克制火与风' },
  wind:     { name: '风', icon: '🌪️', color: '#aeb6bf', desc: '风元素：克制火与冰' }
}

// 元素克制关系：key克制的元素列表
export const ELEMENT_COUNTER = {
  water:    ['fire', 'acid'],
  fire:     ['ice', 'wind'],
  acid:     ['water', 'electric'],
  electric: ['water', 'wind'],
  ice:      ['fire', 'wind'],
  wind:     ['fire', 'ice']
}

// 元素名称映射
export const ELEMENT_NAME_MAP = {
  '水': 'water', '火': 'fire', '酸': 'acid',
  '电': 'electric', '冰': 'ice', '风': 'wind'
}

// 升级材料映射
export const UPGRADE_MATERIALS = {
  water: '水之精华', fire: '火焰核心', acid: '酸液结晶',
  electric: '雷电石', ice: '冰霜碎片', wind: '风之羽毛'
}

// 元素学科映射（捕捉时出题用）
export const ELEMENT_SUBJECT_MAP = {
  water: 'chem', fire: 'chem', acid: 'chem',
  electric: 'bio', ice: 'bio', wind: 'bio'
}

// 给敌人分配元素（按学科循环）
const ELEMENT_KEYS = ['water', 'fire', 'acid', 'electric', 'ice', 'wind']
export function assignElementToEnemies(enemies) {
  return enemies.map((e, i) => ({
    ...e,
    element: ELEMENT_KEYS[i % ELEMENT_KEYS.length]
  }))
}

// 生成怪物能力加成
export function generateMonsterAbility(element, captureFloor) {
  const baseBonus = Math.max(3, Math.floor(captureFloor * 0.8))
  const abilities = {
    water:   { atkBonus: 0, defBonus: baseBonus, element: 'water', desc: `防御+${baseBonus}` },
    fire:    { atkBonus: baseBonus, defBonus: 0, element: 'fire', desc: `攻击+${baseBonus}` },
    acid:    { atkBonus: Math.floor(baseBonus * 0.6), defBonus: Math.floor(baseBonus * 0.6), element: 'acid', desc: `攻击+${Math.floor(baseBonus * 0.6)} 防御+${Math.floor(baseBonus * 0.6)}` },
    electric:{ atkBonus: Math.floor(baseBonus * 1.2), defBonus: 0, element: 'electric', desc: `攻击+${Math.floor(baseBonus * 1.2)}` },
    ice:     { atkBonus: 0, defBonus: Math.floor(baseBonus * 1.2), element: 'ice', desc: `防御+${Math.floor(baseBonus * 1.2)}` },
    wind:    { atkBonus: Math.floor(baseBonus * 0.4), defBonus: Math.floor(baseBonus * 0.4), element: 'wind', desc: `攻击+${Math.floor(baseBonus * 0.4)} 防御+${Math.floor(baseBonus * 0.4)} 先手优势` }
  }
  return abilities[element] || abilities.water
}

// 创建农场怪物对象
export function createFarmMonster(name, icon, element, baseHp, baseAtk, baseDef, captureFloor) {
  const ability = generateMonsterAbility(element, captureFloor)
  return {
    name,
    icon: icon || '👾',
    element,
    level: 1,
    exp: 0,
    maxExp: 50,
    baseHp,
    baseAtk,
    baseDef,
    captureFloor,
    ability,
    capturedAt: Date.now()
  }
}

// 获取升级材料名称
export function getUpgradeMaterialName(element) {
  return UPGRADE_MATERIALS[element] || '怪物精华'
}

// 检查元素克制
export function checkElementCounter(attackerElement, defenderElement) {
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
