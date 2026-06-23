import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { getQuestionsForFloor, ensureQuestionsForSpec } from '../data/questions.ts'
import { getEnemyForFloor, getRandomEnemy, createEnemyInstance } from '../data/enemies.ts'
import { EQUIPMENT, CONSUMABLES } from '../data/items.ts'
import { BATTLE_CARDS, getBattleCard } from '../data/battleCards.ts'
import { createFarmMonster, checkElementCounter } from '../data/farm.ts'
import {
  sfxCorrect,
  sfxWrong,
  sfxCritical,
  sfxHit,
  sfxCaptureSuccess,
  sfxCaptureFail,
} from '../utils/sfx.ts'
import { saveNow } from '../services/saveService.js'
import { usePlayerStore } from './playerStore.ts'
import { useEquipmentStore } from './equipmentStore.ts'
import { useFarmStore } from './farmStore.ts'
import { useCyclopediaStore } from './cyclopediaStore.ts'
import { useReviewStore } from './reviewStore.ts'
import { useLogStore } from './logStore.ts'
import { logger } from '../utils/logger.js'
import type { Question, Enemy, Monster, BattleCardType } from '../types.ts'
import type { DropItem } from './equipmentStore.ts'
import {
  DAMAGE_BASE_RATIO,
  DEF_DAMAGE_REDUCTION_RATIO,
  ENEMY_DAMAGE_BASE_RATIO,
  ELEMENT_COUNTER_WEAK_MULTIPLIER,
  ELEMENT_COUNTER_STRONG_MULTIPLIER,
  ELEMENT_COUNTER_NEUTRAL_MULTIPLIER,
  COMBO_BONUS_DEFAULT,
  COMBO_BONUS_CHEM,
  COMBO_BONUS_BIO,
  COMBO_BONUS_YI,
  BIO_HEAL_PER_STACK_RATIO,
  BATTLE_EXP_MAXHP_RATIO,
  BATTLE_EXP_ATK_RATIO,
  BATTLE_GOLD_ATK_RATIO,
  DROP_EQUIPMENT_CHANCE,
  DROP_CONSUMABLE_CHANCE,
  DROP_BATTLE_CARD_CHANCE,
  FARM_CAPACITY,
} from '../config/balance.js'

export interface CaptureMonsterData {
  name: string
  icon: string
  element: string
  baseHp: number
  baseAtk: number
  baseDef: number
  captureFloor: number
  rarity: string
}

export interface BattleCallbacks {
  onWin?: () => void
  onLose?: () => void
  onFlee?: () => void
  onCaptureSuccess?: () => void
  onCaptureFail?: () => void
  onExit?: () => void
  onAnswerCorrect?: () => boolean | Promise<boolean>
  onAnswerWrong?: () => boolean | Promise<boolean>
}

export interface BattleSession {
  enemy: Enemy
  question: Question
  logMessage?: string
  captureableHints?: {
    full?: string
    canCapture?: string
  }
  callbacks?: BattleCallbacks
}

export const useBattleStore = defineStore('battle', () => {
  // ===== 战斗状态 =====
  const inBattle = ref<boolean>(false)
  const battleState = ref<string>('')
  const enemy = ref<Enemy | null>(null)
  const question = shallowRef<Question | null>(null)
  const drop = shallowRef<DropItem | null>(null)
  const logStore = useLogStore()

  // ===== 连击系统 =====
  const comboCount = ref<number>(0)
  const comboActive = ref<boolean>(false)
  const consecutiveCorrect = ref<number>(0)

  // ===== 战斗道具卡效果 =====
  const activeCardEffects = ref({
    shield: false,
    crit: false,
    hintedOptions: [] as number[],
  })

  // ===== 捕捉相关数据 =====
  const captureMonsterData = shallowRef<CaptureMonsterData | null>(null)
  const captureQuestions = shallowRef<Question[]>([])
  const captureIndex = ref<number>(0)
  const captureCorrectCount = ref<number>(0)
  const captureRarity = ref<string>('common')
  const captureTotalNeeded = ref<number>(2)
  const captureMaxWrong = ref<number>(0)
  const captureNeedsBoss = ref<boolean>(false)
  const currentCallbacks = ref<BattleCallbacks>({})

  async function startBattle(session: BattleSession) {
    const farmStore = useFarmStore()
    const playerStore = usePlayerStore()

    await ensureQuestionsForSpec(playerStore.playerSpecialization)

    enemy.value = session.enemy
    question.value = session.question
    drop.value = null
    resetCombo()
    resetCardEffects()
    logStore.set(session.logMessage ? [session.logMessage] : [`遭遇 ${session.enemy.name}！`])

    if (enemy.value?.captureable) {
      const hints = session.captureableHints
      if (farmStore.farm.length >= FARM_CAPACITY) {
        if (hints?.full) logStore.push(hints.full)
      } else {
        if (hints?.canCapture) logStore.push(hints.canCapture)
      }
    }

    currentCallbacks.value = session.callbacks || {}
    battleState.value = 'idle'
    inBattle.value = true
  }

  async function initBattle() {
    await actuallyInitBattle()
  }

  async function actuallyInitBattle() {
    const playerStore = usePlayerStore()
    await ensureQuestionsForSpec(playerStore.playerSpecialization)

    const e = getEnemyForFloor(playerStore.floor)[0] || getRandomEnemy()
    const q = getQuestionsForFloor(playerStore.floor, 1, playerStore.playerSpecialization)[0]
    if (!q) {
      logger.error('[initBattle] 题目加载失败，无法初始化战斗')
      return
    }

    await startBattle({
      enemy: createEnemyInstance(e),
      question: q,
      captureableHints: {
        full: `🐾 这只怪物可以收养，但你的农场已经满了（最多${FARM_CAPACITY}只）`,
        canCapture: '🐾 这只怪物可以收养！击败它后记得收下战利品，再点击"尝试收养"',
      },
    })
  }

  function enemyAttack(devImmune = false) {
    const playerStore = usePlayerStore()
    const farmStore = useFarmStore()
    const equipmentStore = useEquipmentStore()
    if (devImmune) {
      logStore.push('💠 [Dev] 开发者模式：免疫伤害')
      return
    }

    const currentEnemy = enemy.value
    if (!currentEnemy) return

    const activeMonster = farmStore.activeMonster as { element?: string } | null
    const elementEffect = checkElementCounter(currentEnemy.element, activeMonster?.element)
    let multiplier = elementEffect?.multiplier || ELEMENT_COUNTER_NEUTRAL_MULTIPLIER
    if (elementEffect && elementEffect.desc === '被克制...') {
      multiplier = ELEMENT_COUNTER_WEAK_MULTIPLIER
    } else if (elementEffect && elementEffect.desc === '克制！') {
      multiplier = ELEMENT_COUNTER_STRONG_MULTIPLIER
    } else {
      multiplier = ELEMENT_COUNTER_NEUTRAL_MULTIPLIER
    }

    const damage = Math.max(
      Math.floor(currentEnemy.atk * ENEMY_DAMAGE_BASE_RATIO),
      Math.floor(currentEnemy.atk * multiplier - equipmentStore.totalDef * DEF_DAMAGE_REDUCTION_RATIO)
    )
    playerStore.takeDamage(damage)
    sfxHit()
    logStore.push(`${currentEnemy.name} 对你造成 ${damage} 点伤害！`)

    if (playerStore.hp <= 0) {
      loseBattle()
    }
  }

  function loseBattle() {
    const playerStore = usePlayerStore()
    const cyclopediaStore = useCyclopediaStore()
    playerStore.setHp(0)
    battleState.value = 'lost'
    logStore.push('你倒下了...')
    inBattle.value = false
    cyclopediaStore.updateStats('totalBattles', 1)
    saveNow()
  }

  function resetCombo() {
    consecutiveCorrect.value = 0
    comboCount.value = 0
  }

  function resetCardEffects() {
    activeCardEffects.value = {
      shield: false,
      crit: false,
      hintedOptions: [],
    }
  }

  function useBattleCard(cardType: BattleCardType, equipmentStore: ReturnType<typeof useEquipmentStore>): boolean {
    const card = getBattleCard(cardType)
    if (!card) return false
    if (!equipmentStore.useBattleCard(cardType)) {
      logStore.push(`❌ ${card.name} 数量不足！`)
      return false
    }

    if (cardType === 'hint') {
      const q = question.value
      if (!q || battleState.value !== 'answering') {
        logStore.push('❌ 只能在答题时使用提示卡！')
        return false
      }
      const wrongOptions = q.options
        .map((_, idx) => idx)
        .filter(idx => idx !== q.answer)
        .filter(idx => !activeCardEffects.value.hintedOptions.includes(idx))
      if (wrongOptions.length === 0) {
        logStore.push('💡 已经没有可排除的错误选项了')
        return true
      }
      const removed = wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
      activeCardEffects.value.hintedOptions.push(removed)
      logStore.push(`💡 提示卡生效！已排除一个错误选项`)
    } else if (cardType === 'shield') {
      activeCardEffects.value.shield = true
      logStore.push('🛡️ 护盾卡生效！下一题答错不扣血')
    } else if (cardType === 'crit') {
      activeCardEffects.value.crit = true
      logStore.push('⚔️ 暴击卡生效！下一题答对伤害翻倍')
    }

    return true
  }

  function triggerCriticalEffect() {
    comboActive.value = true
    setTimeout(() => {
      comboActive.value = false
    }, 1500)
  }

  function recordWrongQuestion(q: Question, wrongAnswer: number) {
    useReviewStore().recordWrongQuestion(q, wrongAnswer)
  }

  async function answerAttack(correct: boolean, devHit = false) {
    const playerStore = usePlayerStore()
    const farmStore = useFarmStore()
    const equipmentStore = useEquipmentStore()
    const cyclopediaStore = useCyclopediaStore()
    const currentEnemy = enemy.value
    if (!currentEnemy) return

    if (devHit) {
      sfxCorrect()
      logStore.push('💠 [Dev] 开发者模式：自动命中，秒杀！')
      currentEnemy.hp = 0
      consecutiveCorrect.value++
      cyclopediaStore.updateStats('totalCorrect', 1)
      winBattle()
      return
    }

    if (correct) {
      const handled = await currentCallbacks.value.onAnswerCorrect?.()
      if (handled) return

      consecutiveCorrect.value++
      comboCount.value = consecutiveCorrect.value
      sfxCorrect()

      const subject = question.value?.subject || 'all'
      const activeMonster = farmStore.activeMonster as { element?: string } | null
      const elementEffect = checkElementCounter(activeMonster?.element, currentEnemy.element)
      let multiplier = 1.0 * (elementEffect?.multiplier || 1.0)

      let comboBonusPerStack = COMBO_BONUS_DEFAULT
      let healOnHit = 0

      if (subject === 'chem') {
        comboBonusPerStack = COMBO_BONUS_CHEM
      } else if (subject === 'bio') {
        comboBonusPerStack = COMBO_BONUS_BIO
        healOnHit = Math.floor(playerStore.maxHp * BIO_HEAL_PER_STACK_RATIO * consecutiveCorrect.value)
      } else if (subject === 'yi') {
        comboBonusPerStack = COMBO_BONUS_YI
      }

      const comboMultiplier = 1 + consecutiveCorrect.value * comboBonusPerStack
      multiplier *= comboMultiplier

      const totalAtk = equipmentStore.totalAtk
      let damage = Math.max(
        Math.floor(totalAtk * DAMAGE_BASE_RATIO),
        Math.floor(totalAtk * multiplier - currentEnemy.def * DEF_DAMAGE_REDUCTION_RATIO)
      )

      // 暴击卡效果：下一题答对造成 2 倍伤害
      if (activeCardEffects.value.crit) {
        damage = Math.floor(damage * 2)
        activeCardEffects.value.crit = false
        logStore.push('⚔️ 暴击卡生效！伤害翻倍！')
      }

      currentEnemy.hp -= damage

      if (healOnHit > 0) {
        playerStore.heal(healOnHit)
      }

      let logMsg = ''
      if (consecutiveCorrect.value >= 3) {
        cyclopediaStore.updateMaxCombo(consecutiveCorrect.value)
        logMsg = `⚡ 知识连击x${consecutiveCorrect.value}！造成 ${damage} 点伤害！`
        if (healOnHit > 0) logMsg += ` 回复 ${healOnHit} 生命！`
        triggerCriticalEffect()
        sfxCritical()
        resetCombo()
      } else if (consecutiveCorrect.value === 2) {
        logMsg = `🔥 连击x2！造成 ${damage} 点伤害！`
        if (healOnHit > 0) logMsg += ` 回复 ${healOnHit} 生命！`
      } else {
        logMsg = `🧠 知识攻击命中！造成 ${damage} 点伤害！`
        if (healOnHit > 0) logMsg += ` 回复 ${healOnHit} 生命！`
      }

      if (elementEffect?.desc) logMsg += ` ${elementEffect.desc}`
      logStore.push(logMsg)

      cyclopediaStore.updateStats('totalCorrect', 1)
      if (subject) {
        cyclopediaStore.recordSubjectCorrect(subject)
      }
      cyclopediaStore.updateMaxCombo(consecutiveCorrect.value)

      if (currentEnemy.hp <= 0) {
        currentEnemy.hp = 0
        winBattle()
      } else {
        battleState.value = 'idle'
        activeCardEffects.value.hintedOptions = []
        await ensureQuestionsForSpec(playerStore.playerSpecialization)
        const newQ = getQuestionsForFloor(playerStore.floor, 1, playerStore.playerSpecialization)[0]
        if (newQ) question.value = newQ
      }
    } else {
      const handled = await currentCallbacks.value.onAnswerWrong?.()
      if (handled) return

      const subject = question.value?.subject || 'all'
      sfxWrong()
      logStore.push('回答错误！')
      recordWrongQuestion(question.value as Question, -1)

      if (subject === 'yi' && consecutiveCorrect.value > 1) {
        consecutiveCorrect.value = Math.floor(consecutiveCorrect.value / 2)
        comboCount.value = consecutiveCorrect.value
        logStore.push(`☯️ 易学护体！连击降至 ${consecutiveCorrect.value} 连`)
      } else {
        resetCombo()
      }

      // 护盾卡效果：下一题答错不受到敌人反击
      if (activeCardEffects.value.shield) {
        activeCardEffects.value.shield = false
        logStore.push('🛡️ 护盾卡生效！抵挡了敌人的反击！')
      } else {
        enemyAttack()
      }
    }
  }

  function winBattle() {
    const playerStore = usePlayerStore()
    const farmStore = useFarmStore()
    const equipmentStore = useEquipmentStore()
    const cyclopediaStore = useCyclopediaStore()

    const e = enemy.value
    if (!e) return

    if (e.isCaptureBoss && e.captureMonster) {
      farmStore.farm.push(e.captureMonster)
      logStore.push(`🏆 击败传说守护者！${e.captureMonster.name} 正式成为你的伙伴！`)
      battleState.value = 'captureSuccess'
      sfxCaptureSuccess()
      inBattle.value = false
      currentCallbacks.value.onCaptureSuccess?.()
      return
    }

    battleState.value = 'won'

    const expGain = Math.floor(e.maxHp * BATTLE_EXP_MAXHP_RATIO + e.atk * BATTLE_EXP_ATK_RATIO)
    const goldGain = Math.floor(e.atk * BATTLE_GOLD_ATK_RATIO)
    playerStore.addExp(expGain)
    playerStore.addGold(goldGain)
    logStore.push(`🎉 战斗胜利！获得 ${expGain} 经验和 ${goldGain} 金币！`)

    const dropItem = generateDrop(e)
    if (dropItem) {
      drop.value = dropItem
      battleState.value = 'drop'
      logStore.push(`掉落 ${dropItem.item.name}！`)
    }

    if (e.captureable) {
      const rarity = e.rarity || 'common'
      let qCount = 2,
        needCorrect = 2,
        maxWrong = 0,
        needsBoss = false
      if (rarity === 'rare') {
        qCount = 3
        needCorrect = 2
        maxWrong = 1
      } else if (rarity === 'epic') {
        qCount = 3
        needCorrect = 3
        maxWrong = 0
      } else if (rarity === 'legendary') {
        qCount = 3
        needCorrect = 3
        maxWrong = 0
        needsBoss = true
      }

      captureMonsterData.value = {
        name: e.name,
        icon: e.icon,
        element: e.element,
        baseHp: e.maxHp || e.hp,
        baseAtk: e.atk,
        baseDef: e.def,
        captureFloor: playerStore.floor,
        rarity: rarity,
      }
      captureRarity.value = rarity
      captureTotalNeeded.value = needCorrect
      captureMaxWrong.value = maxWrong
      captureNeedsBoss.value = needsBoss
      const qs = getQuestionsForFloor(playerStore.floor, qCount, playerStore.playerSpecialization)
      captureQuestions.value = qs
      captureIndex.value = 0
      captureCorrectCount.value = 0
    }

    cyclopediaStore.addToCyclopedia('monsters', e.name)
    cyclopediaStore.updateStats('totalWins', 1)
    cyclopediaStore.updateStats('totalBattles', 1)
    cyclopediaStore.updateMaxFloor(playerStore.floor)

    equipmentStore.decayBuffs()

    saveNow()
    cyclopediaStore.checkAchievements()
  }

  function generateDrop(_e: Enemy): DropItem | null {
    const rand = Math.random()
    if (rand < DROP_EQUIPMENT_CHANCE) {
      const item = EQUIPMENT[Math.floor(Math.random() * EQUIPMENT.length)]
      return { type: 'equipment', item }
    } else if (rand < DROP_CONSUMABLE_CHANCE) {
      const item = CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)]
      return { type: 'consumable', item }
    } else if (rand < DROP_BATTLE_CARD_CHANCE) {
      const card = BATTLE_CARDS[Math.floor(Math.random() * BATTLE_CARDS.length)]
      return { type: 'battleCard', item: card }
    }
    return null
  }

  function claimDrop() {
    const equipmentStore = useEquipmentStore()
    const cyclopediaStore = useCyclopediaStore()
    const item = drop.value
    if (!item) return

    equipmentStore.addItem(item)
    if (item.type === 'equipment') {
      cyclopediaStore.addToCyclopedia('materials', item.item.name)
    }

    drop.value = null
    battleState.value = 'won'

    if (enemy.value?.name) {
      cyclopediaStore.addToCyclopedia('monsters', enemy.value.name)
    }

    saveNow()
    cyclopediaStore.checkAchievements()
  }

  function startCapture() {
    if (!captureMonsterData.value || captureQuestions.value.length === 0) return
    captureIndex.value = 0
    captureCorrectCount.value = 0
    battleState.value = 'captureQuiz'
  }

  async function submitCaptureAnswer(index: number, devCorrect = false) {
    const farmStore = useFarmStore()

    if (captureIndex.value >= captureQuestions.value.length) return
    const q = captureQuestions.value[captureIndex.value]
    const correct = devCorrect ? true : index === q.answer

    if (!correct) {
      recordWrongQuestion(q, index)
      sfxWrong()
    } else {
      sfxCorrect()
    }

    if (correct) {
      captureCorrectCount.value++
    }

    const wrongCount = captureIndex.value - captureCorrectCount.value + (correct ? 0 : 1)

    if (wrongCount > captureMaxWrong.value) {
      battleState.value = 'captureFail'
      sfxCaptureFail()
      clearCaptureData()
      currentCallbacks.value.onCaptureFail?.()
      return
    }

    captureIndex.value++

    if (captureIndex.value >= captureQuestions.value.length) {
      if (captureCorrectCount.value >= captureTotalNeeded.value) {
        const monster = createFarmMonster(
          captureMonsterData.value.name,
          captureMonsterData.value.icon,
          captureMonsterData.value.element,
          captureMonsterData.value.baseHp,
          captureMonsterData.value.baseAtk,
          captureMonsterData.value.baseDef,
          captureMonsterData.value.captureFloor,
          captureMonsterData.value.rarity
        )
        if (captureNeedsBoss.value) {
          logStore.push(`⭐ 传说级怪物 ${monster.name} 认可你的实力，但还要最后一战！`)
          battleState.value = 'legendaryBossFight'
          await initLegendaryCaptureBoss(monster)
          return
        }
        farmStore.farm.push(monster)
        logStore.push(`收养成功！${monster.name} 成为你的伙伴！`)
        battleState.value = 'captureSuccess'
        sfxCaptureSuccess()
        useCyclopediaStore().checkAchievements()
        clearCaptureData()
        currentCallbacks.value.onCaptureSuccess?.()
      } else {
        battleState.value = 'captureFail'
        sfxCaptureFail()
        clearCaptureData()
        currentCallbacks.value.onCaptureFail?.()
      }
    }
  }

  function clearCaptureData() {
    captureMonsterData.value = null
    captureQuestions.value = []
    captureIndex.value = 0
    captureCorrectCount.value = 0
  }

  async function initLegendaryCaptureBoss(monster: Monster) {
    const playerStore = usePlayerStore()
    await ensureQuestionsForSpec(playerStore.playerSpecialization)
    const boss = createEnemyInstance(monster, {
      hpScale: 1.5,
      atkScale: 1.5,
      defScale: 1.5,
      isCaptureBoss: true,
      captureMonster: monster,
      overrides: {
        name: `传说·${monster.name}`,
      },
    })
    enemy.value = boss
    inBattle.value = true
    logStore.set([`传说中的 ${boss.name} 出现了！击败它才能真正收服！`])
    const q = getQuestionsForFloor(playerStore.floor, 1, playerStore.playerSpecialization)[0]
    if (q) question.value = q
  }

  function skipCapture() {
    clearCaptureData()
    battleState.value = 'idle'
    currentCallbacks.value.onCaptureSuccess?.()
  }

  function flee() {
    battleState.value = 'fled'
    logStore.push('你逃跑了...')
    currentCallbacks.value.onFlee?.()
  }

  /**
   * 仅重置战斗核心状态，不触发回调、不清理捕捉数据
   * 供 dungeonStore 在退出地牢或完成房间时调用
   */
  function resetBattleState() {
    inBattle.value = false
    enemy.value = null
    question.value = null
    battleState.value = ''
    resetCombo()
  }

  /**
   * 完成一个地牢房间后的战斗状态清理
   * 保留 captureSuccess / captureFail 状态供 UI 展示
   */
  function finishRoomBattle() {
    inBattle.value = false
    enemy.value = null
    question.value = null
    if (battleState.value !== 'captureSuccess' && battleState.value !== 'captureFail') {
      battleState.value = ''
    }
    resetCombo()
  }

  function exitBattle() {
    resetBattleState()
    logStore.clear()
    captureMonsterData.value = null
    captureQuestions.value = []
    captureIndex.value = 0
    captureCorrectCount.value = 0

    currentCallbacks.value.onExit?.()
    currentCallbacks.value = {}
  }

  function reset() {
    inBattle.value = false
    battleState.value = ''
    enemy.value = null
    question.value = null
    logStore.clear()
    drop.value = null
    comboCount.value = 0
    comboActive.value = false
    consecutiveCorrect.value = 0
    captureMonsterData.value = null
    captureQuestions.value = []
    captureIndex.value = 0
    captureCorrectCount.value = 0
    captureRarity.value = 'common'
    captureTotalNeeded.value = 2
    captureMaxWrong.value = 0
    captureNeedsBoss.value = false
    currentCallbacks.value = {}
  }

  // ===== 供外部（如 weeklyBossStore）使用的显式战斗操作接口 =====
  function setQuestion(q: Question | null) {
    question.value = q
  }

  function setBattleState(state: string) {
    battleState.value = state
  }

  function setInBattle(value: boolean) {
    inBattle.value = value
  }

  function setIdle() {
    battleState.value = 'idle'
  }

  function setAnswering() {
    battleState.value = 'answering'
  }

  function startAnswer() {
    battleState.value = 'answering'
  }

  function damageEnemy(damage: number): number {
    const currentEnemy = enemy.value
    if (!currentEnemy || damage <= 0) return 0
    const actual = Math.min(damage, currentEnemy.hp)
    currentEnemy.hp -= actual
    return actual
  }

  function healEnemy(amount: number): number {
    const currentEnemy = enemy.value
    if (!currentEnemy || amount <= 0) return 0
    const actual = Math.min(amount, currentEnemy.maxHp - currentEnemy.hp)
    currentEnemy.hp += actual
    return actual
  }

  function buffEnemyAtk(amount: number) {
    const currentEnemy = enemy.value
    if (!currentEnemy) return
    currentEnemy.atk += amount
  }

  function buffEnemyDef(amount: number) {
    const currentEnemy = enemy.value
    if (!currentEnemy) return
    currentEnemy.def += amount
  }

  function debuffPlayerAtk(amount: number) {
    const playerStore = usePlayerStore()
    playerStore.buffAtk(-amount)
  }

  function incrementConsecutiveCorrect(): number {
    consecutiveCorrect.value++
    comboCount.value = consecutiveCorrect.value
    return consecutiveCorrect.value
  }

  function serialize(): Record<string, unknown> {
    // 战斗状态属于会话级 UI 状态，不持久化
    return {}
  }

  function deserialize(_saveData: Record<string, unknown>) {
    // 进入游戏时重置战斗状态
    reset()
  }

  return {
    inBattle,
    battleState,
    enemy,
    question,
    drop,
    comboCount,
    comboActive,
    consecutiveCorrect,
    activeCardEffects,
    captureMonsterData,
    captureQuestions,
    captureIndex,
    captureCorrectCount,
    captureRarity,
    captureTotalNeeded,
    captureMaxWrong,
    captureNeedsBoss,
    initBattle,
    actuallyInitBattle,
    startBattle,
    enemyAttack,
    answerAttack,
    winBattle,
    loseBattle,
    flee,
    resetCombo,
    resetCardEffects,
    useBattleCard,
    triggerCriticalEffect,
    recordWrongQuestion,
    startCapture,
    submitCaptureAnswer,
    skipCapture,
    clearCaptureData,
    initLegendaryCaptureBoss,
    generateDrop,
    claimDrop,
    exitBattle,
    resetBattleState,
    finishRoomBattle,
    reset,
    setQuestion,
    setBattleState,
    setInBattle,
    setIdle,
    setAnswering,
    startAnswer,
    damageEnemy,
    healEnemy,
    buffEnemyAtk,
    buffEnemyDef,
    debuffPlayerAtk,
    incrementConsecutiveCorrect,
    serialize,
    deserialize,
  }
})
