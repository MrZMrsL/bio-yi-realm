import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { getWeeklyBoss, scaleBossForLevel, getWeeklyBossKey, isWeeklyBossDefeated } from '../data/limited_bosses.ts'
import { createEnemyInstance } from '../data/enemies.ts'
import { ALL_QUESTIONS, ensureQuestions } from '../data/questions.ts'
import { checkElementCounter } from '../data/farm.ts'
import { sfxCorrect, sfxWrong, sfxCritical } from '../utils/sfx.ts'
import { saveNow } from '../services/saveService.js'
import { usePlayerStore } from './playerStore.ts'
import { useEquipmentStore } from './equipmentStore.ts'
import { useFarmStore } from './farmStore.ts'
import { useCyclopediaStore } from './cyclopediaStore.ts'
import { useLogStore } from './logStore.ts'
import type { Question, Enemy } from '../types.ts'
import type { BattleSession, BattleCallbacks } from './battleStore.ts'
import type { useBattleStore } from './battleStore.ts'
import type { LevelUpResult } from './playerStore.ts'

export interface BossSkill {
  name: string
  effect: 'heal' | 'buff' | 'debuff' | 'shield' | 'speed' | string
  value: number
  cooldown: number
  desc: string
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
  skills: BossSkill[]
  baseHp: number
  baseAtk: number
  baseDef: number
  timeLimit: number
  achievement: {
    id: string
    title: string
    desc: string
    icon: string
    rarity: string
  }
  reward: {
    exp: number
    gold: number
    material?: { name: string; count: number }
  }
  hp?: number
  maxHp?: number
  atk?: number
  def?: number
}

export interface WeeklyBossResult {
  success: boolean
  reason?: string
}

type BattleStore = ReturnType<typeof useBattleStore>

export const useWeeklyBossStore = defineStore('weeklyBoss', () => {
  // ===== 限时Boss =====
  const inWeeklyBoss = ref<boolean>(false)
  const weeklyBossData = shallowRef<WeeklyBoss | null>(null)
  const weeklyBossTurn = ref<number>(0)
  const weeklyBossTimeLeft = ref<number>(0)
  const weeklyBossSkillUsed = ref<BossSkill[]>([])
  const weeklyBossDefeated = ref<string[]>([])
  const weeklyBossTimer = ref<ReturnType<typeof setInterval> | null>(null)

  async function getRandomQuestionForBoss(subject: string): Promise<Question | null> {
    await ensureQuestions(subject)
    const questions = ALL_QUESTIONS.filter((q: Question) => q.subject === subject)
    if (questions.length > 0) {
      return questions[Math.floor(Math.random() * questions.length)]
    }
    if (ALL_QUESTIONS.length > 0) {
      return ALL_QUESTIONS[Math.floor(Math.random() * ALL_QUESTIONS.length)]
    }
    return null
  }

  async function prepareWeeklyBoss(): Promise<
    | { success: false; reason: string }
    | { success: true; sessionData: Omit<BattleSession, 'callbacks'> }
  > {
    const playerStore = usePlayerStore()

    const boss = getWeeklyBoss() as WeeklyBoss
    if (isWeeklyBossDefeated(boss.id, weeklyBossDefeated.value)) {
      return { success: false, reason: 'already_defeated' }
    }
    const scaledBoss = scaleBossForLevel(boss, playerStore.level) as WeeklyBoss
    weeklyBossData.value = scaledBoss
    weeklyBossTurn.value = 0
    inWeeklyBoss.value = true
    weeklyBossSkillUsed.value = []

    const enemyInstance = createEnemyInstance(scaledBoss, {
      isBoss: true,
      overrides: {
        subjectLabel: scaledBoss.subjectLabel,
        skills: scaledBoss.skills,
        timeLimit: scaledBoss.timeLimit,
      },
    }) as Enemy

    const q = await getRandomQuestionForBoss(scaledBoss.subject)

    return {
      success: true,
      sessionData: {
        enemy: enemyInstance,
        question: q,
        logMessage: `👹 限时Boss「${scaledBoss.name}」出现！`,
      },
    }
  }

  function createWeeklyBossCallbacks(battleStore: BattleStore): BattleCallbacks {
    return {
      onFlee: () => {
        exitWeeklyBoss(battleStore)
      },
      onExit: () => {
        exitWeeklyBoss(battleStore)
      },
      onAnswerCorrect: async () => {
        await weeklyBossAnswerAttack(true, false, battleStore)
        return true
      },
      onAnswerWrong: async () => {
        await weeklyBossAnswerAttack(false, false, battleStore)
        return true
      },
    }
  }

  async function weeklyBossAnswerAttack(correct: boolean, devHit = false, battleStore: BattleStore) {
    const logStore = useLogStore()
    const farmStore = useFarmStore()
    const equipmentStore = useEquipmentStore()
    const cyclopediaStore = useCyclopediaStore()

    if (!battleStore.enemy) return
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
      weeklyBossTimer.value = null
    }
    weeklyBossTurn.value++
    weeklyBossSkillUsed.value = []

    const bossSkills = ((battleStore.enemy.skills || []) as BossSkill[])
    for (const skill of bossSkills) {
      if (skill.cooldown > 0 && weeklyBossTurn.value % skill.cooldown === 0) {
        weeklyBossSkillUsed.value.push(skill)
        applyBossSkill(skill, battleStore)
      }
    }

    if (devHit) {
      sfxCorrect()
      logStore.push('💠 [Dev] 开发者模式：自动命中，秒杀Boss！')
      battleStore.damageEnemy(battleStore.enemy.hp)
      battleStore.incrementConsecutiveCorrect()
      cyclopediaStore.updateStats('totalCorrect', 1)
      winWeeklyBoss(battleStore)
      return
    }

    if (correct) {
      battleStore.incrementConsecutiveCorrect()
      sfxCorrect()

      const activeMonster = farmStore.activeMonster as { element?: string } | null
      const elementEffect = checkElementCounter(activeMonster?.element, battleStore.enemy.element)
      let multiplier = 1.0 * (elementEffect?.multiplier || 1.0)
      const comboMultiplier = 1 + battleStore.consecutiveCorrect * 0.5
      multiplier *= comboMultiplier

      const totalAtk = equipmentStore.totalAtk
      const damage = Math.max(
        Math.floor(totalAtk * 0.3),
        Math.floor(totalAtk * multiplier - battleStore.enemy.def * 0.5)
      )
      battleStore.damageEnemy(damage)

      let logMsg = ''
      if (battleStore.consecutiveCorrect >= 3) {
        cyclopediaStore.updateMaxCombo(battleStore.consecutiveCorrect)
        logMsg = `⚡ 知识连击x${battleStore.consecutiveCorrect}！造成 ${damage} 点伤害！`
        battleStore.triggerCriticalEffect()
        sfxCritical()
        battleStore.resetCombo()
      } else if (battleStore.consecutiveCorrect === 2) {
        logMsg = `🔥 连击x2！造成 ${damage} 点伤害！`
      } else {
        logMsg = `🧠 知识攻击命中！造成 ${damage} 点伤害！`
      }
      if (elementEffect?.desc) logMsg += ` ${elementEffect.desc}`
      logStore.push(logMsg)

      cyclopediaStore.updateStats('totalCorrect', 1)
      cyclopediaStore.updateMaxCombo(battleStore.consecutiveCorrect)

      if (battleStore.enemy.hp <= 0) {
        winWeeklyBoss(battleStore)
      } else {
        battleStore.setIdle()
        const q = await getRandomQuestionForBoss(battleStore.enemy.subject)
        if (q) {
          battleStore.setQuestion(q)
          startWeeklyBossTimer(() => weeklyBossAnswerAttack(false, false, battleStore))
        }
      }
    } else {
      battleStore.resetCombo()
      sfxWrong()
      logStore.push('回答错误！受到反噬！')
      battleStore.recordWrongQuestion(battleStore.question, -1)
      battleStore.enemyAttack()
      if (battleStore.battleState !== 'lost' && battleStore.enemy) {
        battleStore.setIdle()
        const q = await getRandomQuestionForBoss(battleStore.enemy.subject)
        if (q) {
          battleStore.setQuestion(q)
          startWeeklyBossTimer(() => weeklyBossAnswerAttack(false, false, battleStore))
        }
      }
    }
  }

  function startWeeklyBossTimer(onTimeout?: () => void) {
    const boss = weeklyBossData.value
    if (!boss) return
    weeklyBossTimeLeft.value = boss.timeLimit
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
    }
    weeklyBossTimer.value = setInterval(() => {
      weeklyBossTimeLeft.value--
      if (weeklyBossTimeLeft.value <= 0) {
        clearInterval(weeklyBossTimer.value as ReturnType<typeof setInterval>)
        weeklyBossTimer.value = null
        onTimeout?.()
      }
    }, 1000)
  }

  function applyBossSkill(skill: BossSkill, battleStore: BattleStore) {
    const logStore = useLogStore()
    if (!skill) return
    logStore.push(`👹 ${battleStore.enemy?.name} 使用 ${skill.name}！${skill.desc}`)
    if (skill.effect === 'heal') {
      const healed = battleStore.healEnemy(skill.value)
      logStore.push(`${battleStore.enemy?.name} 恢复了 ${healed} 点生命！`)
    } else if (skill.effect === 'buff') {
      battleStore.buffEnemyAtk(skill.value)
      logStore.push(`${battleStore.enemy?.name} 攻击力提升了 ${skill.value} 点！`)
    } else if (skill.effect === 'debuff') {
      battleStore.debuffPlayerAtk(skill.value)
      logStore.push(`你的攻击力降低了 ${skill.value} 点！`)
    } else if (skill.effect === 'shield') {
      battleStore.buffEnemyDef(skill.value)
      logStore.push(`${battleStore.enemy?.name} 防御力提升了 ${skill.value} 点！`)
    }
  }

  function winWeeklyBoss(battleStore: BattleStore): LevelUpResult {
    const playerStore = usePlayerStore()
    const equipmentStore = useEquipmentStore()
    const logStore = useLogStore()
    const cyclopediaStore = useCyclopediaStore()

    battleStore.setBattleState('won')
    battleStore.setInBattle(false)
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
      weeklyBossTimer.value = null
    }
    weeklyBossTimeLeft.value = 0
    const boss = weeklyBossData.value
    if (!boss) {
      return { leveled: false, titleChanged: false, titleDisplayLevel: playerStore.level }
    }

    const expGain = boss.reward.exp
    const goldGain = boss.reward.gold
    const levelUpResult = playerStore.addExp(expGain)
    playerStore.addGold(goldGain)
    logStore.push(`🎉 击败 ${boss.name}！获得 ${expGain} 经验和 ${goldGain} 金币！`)

    const key = getWeeklyBossKey(boss.id)
    if (!weeklyBossDefeated.value.includes(key)) {
      weeklyBossDefeated.value.push(key)
    }

    if (boss.reward.material) {
      const mat = boss.reward.material
      equipmentStore.inventory[mat.name] = (equipmentStore.inventory[mat.name] || 0) + mat.count
      logStore.push(`掉落 ${mat.count} 个 ${mat.name}！`)
    }

    if (battleStore.enemy?.name) {
      cyclopediaStore.addToCyclopedia('monsters', battleStore.enemy.name)
    }
    cyclopediaStore.updateStats('totalWins', 1)
    cyclopediaStore.updateStats('totalBattles', 1)

    cyclopediaStore.checkAchievements()
    saveNow()

    return levelUpResult
  }

  function exitWeeklyBoss(battleStore: BattleStore) {
    inWeeklyBoss.value = false
    weeklyBossData.value = null
    weeklyBossTurn.value = 0
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
      weeklyBossTimer.value = null
    }
    weeklyBossTimeLeft.value = 0
    battleStore.setInBattle(false)
    battleStore.setBattleState('')
    return true
  }

  function reset() {
    inWeeklyBoss.value = false
    weeklyBossData.value = null
    weeklyBossTurn.value = 0
    weeklyBossTimeLeft.value = 0
    weeklyBossSkillUsed.value = []
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
      weeklyBossTimer.value = null
    }
  }

  function serialize(): Record<string, unknown> {
    return {
      weeklyBossDefeated: weeklyBossDefeated.value,
    }
  }

  function deserialize(saveData: Record<string, unknown>) {
    reset()
    weeklyBossDefeated.value = (saveData.weeklyBossDefeated as string[]) || []
    weeklyBossData.value = (saveData.weeklyBossData as WeeklyBoss) || null
    weeklyBossTurn.value = (saveData.weeklyBossTurn as number) || 0
    weeklyBossTimeLeft.value = (saveData.weeklyBossTimeLeft as number) || 0
  }

  return {
    inWeeklyBoss,
    weeklyBossData,
    weeklyBossTurn,
    weeklyBossTimeLeft,
    weeklyBossSkillUsed,
    weeklyBossDefeated,
    weeklyBossTimer,
    prepareWeeklyBoss,
    createWeeklyBossCallbacks,
    weeklyBossAnswerAttack,
    winWeeklyBoss,
    exitWeeklyBoss,
    startWeeklyBossTimer,
    reset,
    serialize,
    deserialize,
  }
})
