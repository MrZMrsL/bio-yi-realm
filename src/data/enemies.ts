// enemies.ts - 生化易界敌人数据（合并旧版全部数据，含元素属性）
import type { Enemy } from '../types.ts'
import { EXTRA_ENEMIES } from './enemies_extra.ts'
import { assignElementToEnemies, ELEMENT_SUBJECT_MAP, DUNGEON_ELEMENTS } from './farm.js'
import { logger } from '../utils/logger.js'

type RawEnemy = Omit<Enemy, 'subjectLabel' | 'elementLabel' | 'maxHp' | 'baseHp' | 'baseAtk' | 'baseDef'> & {
  desc?: string
}

const RAW_ENEMIES: RawEnemy[] = [
  // 基础敌人（1-5层）
  {
    name: '混沌史莱姆',
    icon: '🧪',
    hp: 45,
    atk: 12,
    def: 4,
    subject: 'chem',
    desc: '一团不稳定的化学混合物，似乎随时会爆炸',
    captureable: true,
    rarity: 'common',
  },
  {
    name: 'DNA螺旋怪',
    icon: '🧬',
    hp: 48,
    atk: 14,
    def: 3,
    subject: 'bio',
    desc: '由错乱DNA链构成的生物，能修复自身损伤',
    captureable: true,
    rarity: 'common',
  },
  {
    name: '八卦阵灵',
    icon: '☯️',
    hp: 52,
    atk: 15,
    def: 5,
    subject: 'yi',
    desc: '守护着易学知识的阵灵，会出题考验入侵者',
    captureable: true,
    rarity: 'epic',
  },
  {
    name: '有机幽灵',
    icon: '👻',
    hp: 40,
    atk: 18,
    def: 2,
    subject: 'chem',
    desc: '失去电子的有机分子，攻击带有腐蚀性',
    captureable: true,
    rarity: 'rare',
  },
  {
    name: '细胞壁守卫',
    icon: '🛡️',
    hp: 60,
    atk: 10,
    def: 8,
    subject: 'bio',
    desc: '拥有厚实细胞壁的防御型生物，难以击破',
    captureable: true,
    rarity: 'rare',
  },

  // 新增敌人（10-30层）
  ...EXTRA_ENEMIES.bio,
  ...EXTRA_ENEMIES.chem,
  ...EXTRA_ENEMIES.yi,
]

// 给所有敌人分配元素属性，同时添加基础属性字段（用于楼层过滤）
export const ENEMIES = assignElementToEnemies(RAW_ENEMIES).map(e => ({
  ...e,
  baseHp: e.hp,
  baseAtk: e.atk,
  baseDef: e.def || 0,
}))

// 按学科筛选敌人
export function getEnemiesBySubject(subject: string): Enemy[] {
  return ENEMIES.filter(e => e.subject === subject)
}

// 随机获取敌人
export function getRandomEnemy(subject: string = 'all'): Enemy {
  const pool = subject === 'all' ? ENEMIES : getEnemiesBySubject(subject)
  return pool[Math.floor(Math.random() * pool.length)]
}

// === 平滑成长曲线公式（替代硬编码楼层筛选）===
// 敌人属性按楼层指数增长，每层都有细微的压迫感提升

// 成长参数
const GROWTH_BASE = 1.08 // 每层基础属性提升8%
const GROWTH_ATK = 1.06 // 攻击成长系数
const GROWTH_DEF = 1.04 // 防御成长系数
const FLOOR_MULTIPLIER = 0.12 // 楼层额外加成系数

// 计算敌人实际属性（基于楼层）
export function calculateEnemyStats(baseEnemy: Enemy, floor: number): Enemy {
  const scale = Math.pow(GROWTH_BASE, floor - 1) * (1 + floor * FLOOR_MULTIPLIER)
  return {
    ...baseEnemy,
    hp: Math.floor(baseEnemy.hp * scale),
    atk: Math.floor(baseEnemy.atk * Math.pow(GROWTH_ATK, floor - 1)),
    def: Math.floor((baseEnemy.def || 0) * Math.pow(GROWTH_DEF, floor - 1)),
    // 保留原始基础值用于显示
    baseHp: baseEnemy.hp,
    baseAtk: baseEnemy.atk,
    baseDef: baseEnemy.def || 0,
  }
}

export interface CreateEnemyInstanceOptions {
  hpScale?: number
  atkScale?: number
  defScale?: number
  isBoss?: boolean
  isCaptureBoss?: boolean
  captureMonster?: Enemy['captureMonster']
  overrides?: Partial<Enemy>
}

/**
 * 统一创建战斗用敌人实例
 * 所有 enemy.value 的赋值都应经过此工厂，避免字段遗漏（如 captureable / rarity）
 */
export function createEnemyInstance(baseEnemy: Enemy | null, options: CreateEnemyInstanceOptions = {}): Enemy | null {
  if (!baseEnemy) {
    logger.error('[createEnemyInstance] baseEnemy 为空')
    return null
  }

  const {
    hpScale = 1,
    atkScale = 1,
    defScale = 1,
    isBoss = false,
    isCaptureBoss = false,
    captureMonster = null,
    overrides = {},
  } = options

  const subject = baseEnemy.subject || 'chem'
  const el = DUNGEON_ELEMENTS[baseEnemy.element] || DUNGEON_ELEMENTS.water

  const scaledHp = Math.floor((baseEnemy.hp ?? baseEnemy.maxHp ?? 1) * hpScale)
  const scaledAtk = Math.floor((baseEnemy.atk || 0) * atkScale)
  const scaledDef = Math.floor((baseEnemy.def || 0) * defScale)

  return {
    ...baseEnemy,
    hp: scaledHp,
    maxHp: scaledHp,
    atk: scaledAtk,
    def: scaledDef,
    subjectLabel: baseEnemy.subjectLabel || (subject === 'chem' ? '化学' : subject === 'bio' ? '生物' : '易学'),
    elementLabel: baseEnemy.elementLabel || el.name,
    isBoss: isBoss || baseEnemy.isBoss || false,
    isCaptureBoss: isCaptureBoss || baseEnemy.isCaptureBoss || false,
    captureMonster: captureMonster || baseEnemy.captureMonster || null,
    ...overrides,
  }
}

// 按楼层获取敌人（平滑成长版）
export function getEnemyForFloor(floor: number, element?: string): Enemy[] {
  let pool = ENEMIES

  // 1-5层：基础敌人池（baseHp 为原始未缩放血量）
  if (floor <= 5) {
    pool = ENEMIES.filter(e => e.baseHp <= 55)
  }
  // 6-15层：中等敌人池
  else if (floor <= 15) {
    pool = ENEMIES.filter(e => e.baseHp > 30 && e.baseHp <= 80)
  }
  // 16-30层：高级敌人
  else if (floor <= 30) {
    pool = ENEMIES.filter(e => e.baseHp > 60)
  }
  // 30层以上：全部敌人（属性已平滑缩放）
  else {
    pool = ENEMIES
  }

  // 防御性 fallback：如果过滤后 pool 为空，返回全部敌人
  if (pool.length === 0) pool = ENEMIES

  // 如果指定了元素，按元素对应的学科过滤
  if (element && ELEMENT_SUBJECT_MAP[element]) {
    const subject = ELEMENT_SUBJECT_MAP[element]
    const filtered = pool.filter(e => e.subject === subject)
    if (filtered.length > 0) pool = filtered
  }

  return pool.map(e => calculateEnemyStats(e, floor))
}

// 获取Boss级敌人（用于Boss房间）
export function getBossForFloor(floor: number, element?: string): Enemy {
  let bossPool = ENEMIES.filter(e => e.hp > 80 || e.baseHp > 80 || e.atk > 20)
  // 如果指定了元素，按学科过滤
  if (element && ELEMENT_SUBJECT_MAP[element]) {
    const subject = ELEMENT_SUBJECT_MAP[element]
    const filtered = bossPool.filter(e => e.subject === subject)
    if (filtered.length > 0) bossPool = filtered
  }
  const pool = bossPool.length > 0 ? bossPool : ENEMIES
  const baseEnemy = pool[Math.floor(Math.random() * pool.length)]
  // Boss额外1.5倍属性
  const scaled = calculateEnemyStats(baseEnemy, floor)
  return createEnemyInstance(scaled, {
    hpScale: 1.5,
    atkScale: 1.3,
    defScale: 1.2,
    isBoss: true,
  })
}
