/**
 * 核心数据类型定义（TypeScript）
 *
 * 本文件仅包含类型定义，运行时不会输出任何内容。
 */

export interface Question {
  id: string
  q: string
  options: string[]
  answer: number
  subject: 'chem' | 'bio' | 'yi'
  diff: 'easy' | 'medium' | 'hard'
}

export interface EnemySkill {
  name: string
  effect: string
  value?: number
  cooldown?: number
  desc?: string
}

export interface Enemy {
  name: string
  icon: string
  subject: 'chem' | 'bio' | 'yi'
  subjectLabel: string
  element: string
  elementLabel: string
  hp: number
  maxHp: number
  atk: number
  def: number
  captureable?: boolean
  rarity?: string
  isBoss?: boolean
  isCaptureBoss?: boolean
  captureMonster?: Monster
  skills?: EnemySkill[]
}

export interface MonsterAbility {
  atkBonus: number
  defBonus: number
  hpBonus: number
  element: string
  desc: string
}

export interface Monster {
  name: string
  icon: string
  element: string
  rarity?: string
  level: number
  exp: number
  maxExp: number
  baseHp: number
  baseAtk: number
  baseDef: number
  hp: number
  maxHp: number
  atk: number
  def: number
  captureFloor: number
  ability?: MonsterAbility
  passiveSkill?: Record<string, unknown>
  capturedAt?: number
  fusedAt?: number
  parents?: string[]
}

export interface ElementInfo {
  name: string
  icon: string
  color: string
  desc: string
}

export interface FuseRule {
  targetRarity: string
  cost: number
  statMult: number
  iconUpgrade: string
  grantSkill?: boolean
}

export interface Equipment {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'accessory'
  atk?: number
  def?: number
  level?: number
  icon?: string
  desc?: string
  price?: number
}

export interface Consumable {
  id: string
  name: string
  type: 'potion' | 'heal' | 'buff' | 'revive' | 'scroll' | 'consumable'
  value?: number
  ratio?: number
  effect?: string
  bonusAtk?: number
  bonusDef?: number
  icon?: string
  desc?: string
  price?: number
}

import type { Rarity } from './data/fishingMeta.ts'

export interface Fish {
  name: string
  icon: string
  rarity: Rarity
  knowledge: string
  healHp: number
}

export interface Book {
  name: string
  icon: string
  rarity: Rarity
  desc: string
  subject?: 'chem' | 'bio' | 'yi' | 'all'
}

export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  category: string
  rarity: string
  condition: (_state: Record<string, unknown> | number) => boolean
  progress?: (_state: Record<string, unknown> | number) => number
  maxProgress?: number
  reward?: { exp?: number }
}

export interface TitleData {
  title: string
  bio: string
  era: string
  field: string
  achievements?: string[]
  min?: number
  max?: number
}

export interface SpecializationSkill {
  level: number
  name: string
  icon: string
  desc: string
  effect: string
  state?: Record<string, unknown>
}

export interface SpecializationBonus {
  atk?: number
  def?: number
  hp?: number
  critRate?: number
  dodgeRate?: number
  expBonus?: number
}

export interface Specialization {
  key: string
  name: string
  icon: string
  color: string
  shortDesc: string
  playstyleLabel: string
  playstyleDesc: string
  subjects: string[]
  initialBonus: SpecializationBonus
  growthPer3Levels: SpecializationBonus & { desc: string }
  skills: SpecializationSkill[]
}

export interface WeeklyBossSkill {
  name: string
  effect: string
  value: number
  cooldown: number
  desc: string
}

export interface WeeklyBossAchievement {
  id: string
  title: string
  desc: string
  icon: string
  rarity: string
}

export interface WeeklyBossReward {
  exp: number
  gold: number
  material?: { name: string; count: number }
}

export interface WeeklyBoss {
  id: string
  name: string
  icon: string
  subject: string
  subjectLabel: string
  element: string
  desc: string
  difficulty: number
  skills: WeeklyBossSkill[]
  baseHp: number
  baseAtk: number
  baseDef: number
  timeLimit: number
  achievement: WeeklyBossAchievement
  reward: WeeklyBossReward
}

export interface PvpOpponent {
  name: string
  icon: string
  title: string
  level: number
  maxHp: number
  hp: number
  atk: number
  def: number
  subjectLabel: string
  isPvpOpponent: boolean
}

export interface ForgeRecipe {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'accessory' | 'potion'
  icon?: string
  desc?: string
  materials: Record<string, number>
  gold: number
  unlockLevel: number
  atk?: number
  def?: number
  effect?: string
  ratio?: number
  bonusAtk?: number
  bonusDef?: number
}

export interface SubjectTheme {
  key: string
  name: string
  icon: string
  primary: string
  accent: string
  dark: string
  light: string
  glow: string
  bg: string
  hp: string
  hpDark: string
}

export interface ShopItem {
  id: string
  name: string
  type: 'consumable' | 'equipment' | 'material' | 'battleCard'
  subtype?: string
  price: number
  effect?: Record<string, number>
  desc: string
  icon: string
  unlockLevel: number
  atk?: number
  def?: number
  count?: number
}

export interface UsedQuestionsData {
  easy: string[]
  medium: string[]
  hard: string[]
  all: string[]
  lastResetFloor: number
}

export type BattleCardType = 'hint' | 'shield' | 'crit'

export interface BattleCard {
  id: BattleCardType
  name: string
  icon: string
  type: BattleCardType
  desc: string
  price: number
  unlockLevel: number
}

export interface ActiveCardEffects {
  shield: boolean
  crit: boolean
  hintedOptions: number[]
}
