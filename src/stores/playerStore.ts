/**
 * 玩家核心进度 Store
 *
 * 管理等级、经验、属性、称号、专精、属性点等玩家成长数据。
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSpecialization, getUnlockedSkills } from '../data/specialization.ts'
import { getTitleData } from '../data/titles.ts'
import { getTitleForLevel } from '../utils/dungeon.js'
import { sfxLevelUp } from '../utils/sfx.ts'
import type { TitleData } from '../types.ts'
import {
  LEVEL_EXP_BASE,
  LEVEL_EXP_GROWTH,
  LEVEL_UP_HP_GROWTH,
  LEVEL_UP_ATK_BONUS,
  LEVEL_UP_DEF_BONUS,
  LEVEL_UP_STAT_POINT_BONUS,
  LEVEL_MILESTONE_EVERY,
  LEVEL_MILESTONE_ATK_BONUS_PER_TEN,
  LEVEL_MILESTONE_DEF_BONUS_PER_TEN,
  LEVEL_MILESTONE_HP_BONUS_PER_TEN,
  STAT_POINT_ATK_BONUS,
  STAT_POINT_DEF_BONUS,
  STAT_POINT_HP_BONUS,
} from '../config/balance.js'
import { useLogStore } from './logStore.ts'
import { saveNow } from '../services/saveService.js'

export type Specialization = 'chem' | 'bio' | 'yi' | 'biochem'

export interface UnlockedSkill {
  skill: {
    effect: string
    icon: string
    name: string
    level: number
  }
  unlockedAt: number
}

export interface SkillUnlockQueueItem extends UnlockedSkill {}

export interface LevelUpResult {
  leveled: boolean
  titleChanged: boolean
  titleDisplayLevel: number
}

export const usePlayerStore = defineStore('player', () => {
  // ===== 玩家核心状态 =====
  const level = ref<number>(1)
  const exp = ref<number>(0)
  const maxExp = computed(() => Math.floor(LEVEL_EXP_BASE * Math.pow(LEVEL_EXP_GROWTH, level.value - 1)))
  const hp = ref<number>(100)
  const maxHp = ref<number>(100)
  const atk = ref<number>(10)
  const def = ref<number>(5)
  const gold = ref<number>(0)
  const floor = ref<number>(1)
  const title = ref<string>('菜鸟学徒')
  const titleData = ref<TitleData | null>(getTitleData(1))
  const titleBio = ref<string>(getTitleData(1)?.bio || '刚踏入知识领域的初学者，对一切都充满好奇。')
  const titleEra = ref<string>(getTitleData(1)?.era || '远古')
  const titleField = ref<string>(getTitleData(1)?.field || '化学')
  const titleAchievements = ref<string[]>(getTitleData(1)?.achievements || [])

  // ===== 属性点系统 =====
  const statPoints = ref<number>(0)
  const atkPoints = ref<number>(0)
  const defPoints = ref<number>(0)
  const hpPoints = ref<number>(0)

  // ===== 玩家身份 =====
  const playerName = ref<string>('')
  const playerSpecialization = ref<Specialization | null>(null)

  // ===== 专精技能系统 =====
  const specializationSkills = ref<UnlockedSkill[]>([])
  const newSkillUnlock = ref<SkillUnlockQueueItem | null>(null)
  const skillUnlockQueue = ref<SkillUnlockQueueItem[]>([])

  // ===== 计算属性 =====
  const expPercent = computed(() => (exp.value / maxExp.value) * 100)
  const hpPercent = computed(() => (hp.value / maxHp.value) * 100)

  /**
   * 设置玩家专精并应用初始属性加成
   */
  function setSpecialization(spec: Specialization) {
    playerSpecialization.value = spec
    const specData = getSpecialization(spec)
    if (specData) {
      const bonus = specData.initialBonus
      if (bonus.atk) atk.value += bonus.atk
      if (bonus.def) def.value += bonus.def
      if (bonus.hp) {
        maxHp.value += bonus.hp
        hp.value += bonus.hp
      }
    }
    checkSkillUnlocks()
  }

  function checkSkillUnlocks() {
    const logStore = useLogStore()
    const spec = playerSpecialization.value
    if (!spec) return
    const unlocked = getUnlockedSkills(spec, level.value)
    const alreadyUnlocked = new Set(specializationSkills.value.map(s => s.skill.effect))
    const newlyUnlocked = unlocked.filter(s => !alreadyUnlocked.has(s.effect))

    for (const skill of newlyUnlocked) {
      specializationSkills.value.push({
        skill,
        unlockedAt: level.value,
      })
      skillUnlockQueue.value.push({ skill, unlockedAt: level.value })
      logStore.push(`🔓 专精技能解锁：${skill.icon} ${skill.name}（Lv.${skill.level}）`)
    }
  }

  /**
   * 通用状态修改方法，集中管理 hp / exp / gold 等核心属性的变更
   * 避免外部 store 直接赋值 playerStore.xxx = yyy
   */
  function takeDamage(damage: number): number {
    const actual = Math.min(damage, hp.value)
    hp.value = Math.max(0, hp.value - actual)
    return actual
  }

  function heal(amount: number): number {
    const actual = Math.min(amount, maxHp.value - hp.value)
    hp.value = Math.min(maxHp.value, hp.value + amount)
    return actual
  }

  function fullHeal(): void {
    hp.value = maxHp.value
  }

  function setHp(value: number): void {
    hp.value = Math.max(0, Math.min(maxHp.value, value))
  }

  function addExp(amount: number): LevelUpResult {
    exp.value += amount
    return checkLevelUp()
  }

  function addGold(amount: number): void {
    gold.value += amount
  }

  function spendGold(amount: number): boolean {
    if (gold.value < amount) return false
    gold.value -= amount
    return true
  }

  function buffAtk(amount: number): void {
    atk.value += amount
  }

  function buffDef(amount: number): void {
    def.value += amount
  }

  function advanceFloor(): void {
    floor.value++
  }

  function setFloor(value: number): void {
    floor.value = Math.max(1, value)
  }

  /**
   * 检查并处理升级，统一处理所有经验获取后的升级逻辑
   */
  function checkLevelUp(_options: { showTitleDisplay?: boolean } = {}): LevelUpResult {
    const logStore = useLogStore()
    let leveled = false
    let titleChanged = false
    let titleDisplayLevel = level.value
    while (exp.value >= maxExp.value) {
      exp.value -= maxExp.value
      level.value++
      maxHp.value = Math.floor(maxHp.value * LEVEL_UP_HP_GROWTH)
      hp.value = maxHp.value
      atk.value += LEVEL_UP_ATK_BONUS
      def.value += LEVEL_UP_DEF_BONUS
      statPoints.value += LEVEL_UP_STAT_POINT_BONUS

      if (level.value % LEVEL_MILESTONE_EVERY === 0) {
        const milestoneBonus = Math.floor(level.value / LEVEL_MILESTONE_EVERY)
        atk.value += milestoneBonus * LEVEL_MILESTONE_ATK_BONUS_PER_TEN
        def.value += milestoneBonus * LEVEL_MILESTONE_DEF_BONUS_PER_TEN
        maxHp.value += milestoneBonus * LEVEL_MILESTONE_HP_BONUS_PER_TEN
        hp.value = maxHp.value
      }

      logStore.push(`🎊 升级！到达 Lv.${level.value}！`)
      sfxLevelUp()
      leveled = true
      titleDisplayLevel = level.value

      checkSkillUnlocks()

      const newTitle = getTitleData(level.value)
      if (newTitle && newTitle.title !== title.value) {
        title.value = newTitle.title
        titleData.value = newTitle
        titleBio.value = newTitle.bio
        titleEra.value = newTitle.era
        titleField.value = newTitle.field
        titleAchievements.value = newTitle.achievements || []
        titleChanged = true
      }
    }
    return { leveled, titleChanged, titleDisplayLevel }
  }

  function consumeSkillUnlock(): SkillUnlockQueueItem | null {
    if (skillUnlockQueue.value.length > 0) {
      newSkillUnlock.value = skillUnlockQueue.value.shift() || null
      return newSkillUnlock.value
    }
    newSkillUnlock.value = null
    return null
  }

  function isSkillUnlocked(effectName: string): boolean {
    return specializationSkills.value.some(s => s.skill.effect === effectName)
  }

  /**
   * 分配属性点
   */
  function allocateStat(type: 'atk' | 'def' | 'hp'): boolean {
    if (statPoints.value <= 0) return false
    statPoints.value--
    if (type === 'atk') {
      atkPoints.value++
      atk.value += STAT_POINT_ATK_BONUS
    } else if (type === 'def') {
      defPoints.value++
      def.value += STAT_POINT_DEF_BONUS
    } else if (type === 'hp') {
      hpPoints.value++
      maxHp.value += STAT_POINT_HP_BONUS
      hp.value += STAT_POINT_HP_BONUS
    }
    saveNow()
    return true
  }

  /**
   * 重置已分配的属性点
   */
  function resetStats() {
    statPoints.value += atkPoints.value + defPoints.value + hpPoints.value
    atk.value -= atkPoints.value * STAT_POINT_ATK_BONUS
    def.value -= defPoints.value * STAT_POINT_DEF_BONUS
    maxHp.value -= hpPoints.value * STAT_POINT_HP_BONUS
    hp.value = Math.min(hp.value, maxHp.value)
    atkPoints.value = 0
    defPoints.value = 0
    hpPoints.value = 0
    saveNow()
  }

  function reset() {
    level.value = 1
    exp.value = 0
    hp.value = 100
    maxHp.value = 100
    atk.value = 10
    def.value = 5
    gold.value = 0
    floor.value = 1
    title.value = '菜鸟学徒'
    titleData.value = getTitleData(1)
    titleBio.value = '刚踏入知识领域的初学者，对一切都充满好奇。'
    titleEra.value = '远古'
    titleField.value = '化学'
    titleAchievements.value = []
    statPoints.value = 0
    atkPoints.value = 0
    defPoints.value = 0
    hpPoints.value = 0
    playerName.value = ''
    playerSpecialization.value = null
    specializationSkills.value = []
    newSkillUnlock.value = null
    skillUnlockQueue.value = []
  }

  function serialize(): Record<string, unknown> {
    return {
      level: level.value,
      exp: exp.value,
      hp: hp.value,
      maxHp: maxHp.value,
      atk: atk.value,
      def: def.value,
      gold: gold.value,
      floor: floor.value,
      title: title.value,
      titleData: titleData.value,
      titleBio: titleBio.value,
      titleEra: titleEra.value,
      titleField: titleField.value,
      titleAchievements: titleAchievements.value,
      statPoints: statPoints.value,
      atkPoints: atkPoints.value,
      defPoints: defPoints.value,
      hpPoints: hpPoints.value,
      playerName: playerName.value,
      playerSpecialization: playerSpecialization.value,
      specializationSkills: specializationSkills.value,
    }
  }

  function deserialize(saveData: Record<string, unknown>) {
    reset()
    level.value = (saveData.level as number) || 1
    exp.value = (saveData.exp as number) || 0
    maxHp.value = (saveData.maxHp as number) || 100
    hp.value = (saveData.hp as number) || maxHp.value
    atk.value = (saveData.atk as number) || 10
    def.value = (saveData.def as number) || 5
    gold.value = (saveData.gold as number) || 0
    floor.value = (saveData.floor as number) || 1
    title.value = (saveData.title as string) || '菜鸟学徒'
    titleData.value = (saveData.titleData as TitleData) || getTitleForLevel(1)
    titleBio.value = (saveData.titleBio as string) || '刚踏入知识领域的初学者，对一切都充满好奇。'
    titleEra.value = (saveData.titleEra as string) || '远古'
    titleField.value = (saveData.titleField as string) || '化学'
    titleAchievements.value = (saveData.titleAchievements as string[]) || []
    statPoints.value = (saveData.statPoints as number) || 0
    atkPoints.value = (saveData.atkPoints as number) || 0
    defPoints.value = (saveData.defPoints as number) || 0
    hpPoints.value = (saveData.hpPoints as number) || 0
    playerName.value = (saveData.playerName as string) || ''
    playerSpecialization.value = (saveData.playerSpecialization as Specialization) || null
    specializationSkills.value = (saveData.specializationSkills as UnlockedSkill[]) || []
  }

  return {
    level,
    exp,
    maxExp,
    hp,
    maxHp,
    atk,
    def,
    gold,
    floor,
    title,
    titleData,
    titleBio,
    titleEra,
    titleField,
    titleAchievements,
    statPoints,
    atkPoints,
    defPoints,
    hpPoints,
    playerName,
    playerSpecialization,
    specializationSkills,
    newSkillUnlock,
    skillUnlockQueue,
    expPercent,
    hpPercent,
    setSpecialization,
    checkSkillUnlocks,
    checkLevelUp,
    consumeSkillUnlock,
    isSkillUnlocked,
    allocateStat,
    resetStats,
    reset,
    serialize,
    deserialize,
    // 通用属性操作方法
    takeDamage,
    heal,
    fullHeal,
    setHp,
    addExp,
    addGold,
    spendGold,
    buffAtk,
    buffDef,
    advanceFloor,
    setFloor,
  }
})
