import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { addRecord as addPvpRecord } from '../composables/useLeaderboard.js'
import { saveNow } from '../services/saveService.js'
import { usePlayerStore } from './playerStore.ts'
import { useEquipmentStore } from './equipmentStore.ts'
import { useLogStore } from './logStore.ts'
import { logger } from '../utils/logger.js'
import type { LevelUpResult } from './playerStore.ts'
import type { Question, PvpOpponent } from '../types.ts'
import {
  PVP_MAX_ROUNDS,
  PVP_OPPONENT_DELAY_MS,
  PVP_OPPONENT_WIN_CHANCE_BASE,
  PVP_OPPONENT_WIN_CHANCE_RATIO,
  PVP_PLAYER_DMG_ATK_RATIO,
  PVP_PLAYER_DMG_LEVEL_BONUS,
  PVP_OPPONENT_DMG_ATK_RATIO,
  PVP_OPPONENT_DMG_LEVEL_BONUS,
  PVP_REWARD_EXP_WIN_MULTIPLIER,
  PVP_REWARD_EXP_LOSS_MULTIPLIER,
  PVP_REWARD_GOLD_WIN_MULTIPLIER,
  PVP_REWARD_GOLD_LOSS_MULTIPLIER,
  PVP_OPPONENT_LEVEL_VARIANCE,
  PVP_OPPONENT_LEVEL_VARIANCE_OFFSET,
  PVP_OPPONENT_ATK_SCALE_MIN,
  PVP_OPPONENT_ATK_SCALE_MAX,
  PVP_OPPONENT_DEF_SCALE_RATIO,
  PVP_OPPONENT_HP_SCALE_RATIO,
} from '../config/balance.js'
import { getQuestionsForFloor, ensureQuestionsForSpec } from '../data/questions.ts'

export type PvpState = 'idle' | 'answering' | 'result'

export interface PvpResult {
  won: boolean
}

export const usePvpStore = defineStore('pvp', () => {
  // ===== PVP 对战状态 =====
  const pvpState = ref<PvpState>('idle')
  const currentRound = ref(0)
  const playerScore = ref(0)
  const opponentScore = ref(0)
  const pvpLog = ref<string[]>([])
  const currentQuestion = ref<Question | null>(null)
  const answerSubmitted = ref(false)
  const lastAnswerCorrect = ref(false)
  const won = ref(false)
  const opponent = ref<PvpOpponent | null>(null)

  // ===== 会话级 UI 状态（不持久化） =====
  const pvpResult = ref<PvpResult | null>(null)
  const showTitleDisplay = ref(false)
  const titleDisplayLevel = ref(1)

  // ===== 内部计时器 =====
  let opponentTimer: ReturnType<typeof setTimeout> | null = null

  // ===== 计算属性 =====
  const rewardExp = computed(() => {
    if (!opponent.value) return 0
    const multiplier = won.value ? PVP_REWARD_EXP_WIN_MULTIPLIER : PVP_REWARD_EXP_LOSS_MULTIPLIER
    return Math.floor(opponent.value.level * multiplier)
  })

  const rewardGold = computed(() => {
    if (!opponent.value) return 0
    const multiplier = won.value ? PVP_REWARD_GOLD_WIN_MULTIPLIER : PVP_REWARD_GOLD_LOSS_MULTIPLIER
    return Math.floor(opponent.value.level * multiplier)
  })

  const playerInfo = computed(() => {
    const playerStore = usePlayerStore()
    const equipmentStore = useEquipmentStore()
    return {
      title: playerStore.title,
      level: playerStore.level,
      hp: playerStore.hp,
      maxHp: playerStore.maxHp,
      totalAtk: equipmentStore.totalAtk,
      totalDef: equipmentStore.totalDef,
    }
  })

  // ===== 私有工具方法 =====
  function generateOpponent(): PvpOpponent {
    const playerStore = usePlayerStore()
    const equipmentStore = useEquipmentStore()

    const levelVariance = Math.floor(Math.random() * PVP_OPPONENT_LEVEL_VARIANCE) - PVP_OPPONENT_LEVEL_VARIANCE_OFFSET
    const opponentLevel = Math.max(1, playerStore.level + levelVariance)

    const scaleFactor = PVP_OPPONENT_ATK_SCALE_MIN + Math.random() * (PVP_OPPONENT_ATK_SCALE_MAX - PVP_OPPONENT_ATK_SCALE_MIN)
    const baseAtk = Math.floor(equipmentStore.totalAtk * scaleFactor)
    const baseDef = Math.floor(equipmentStore.totalDef * scaleFactor * PVP_OPPONENT_DEF_SCALE_RATIO)
    const baseMaxHp = Math.floor(playerStore.maxHp * scaleFactor * PVP_OPPONENT_HP_SCALE_RATIO)

    const subjects = ['化学', '生物', '易学']
    const subjectLabel = subjects[Math.floor(Math.random() * subjects.length)]

    return {
      name: `镜像勇士 Lv.${opponentLevel}`,
      icon: '⚔️',
      title: `PVP挑战者 Lv.${opponentLevel}`,
      level: opponentLevel,
      maxHp: Math.max(30, baseMaxHp),
      hp: Math.max(30, baseMaxHp),
      atk: Math.max(5, baseAtk),
      def: Math.max(1, baseDef),
      subjectLabel,
      isPvpOpponent: true,
    }
  }

  function addLog(msg: string): void {
    pvpLog.value.push(msg)
  }

  function clearOpponentTimer(): void {
    if (opponentTimer) {
      clearTimeout(opponentTimer)
      opponentTimer = null
    }
  }

  function calculateDamage(playerCorrect: boolean, opponentCorrect: boolean): void {
    const playerStore = usePlayerStore()
    const equipmentStore = useEquipmentStore()
    const opp = opponent.value
    if (!opp) return

    if (playerCorrect) {
      const dmg = Math.max(
        1,
        Math.floor(equipmentStore.totalAtk * PVP_PLAYER_DMG_ATK_RATIO + playerStore.level * PVP_PLAYER_DMG_LEVEL_BONUS)
      )
      opp.hp = Math.max(0, opp.hp - dmg)
      addLog(`⚔️ 你的知识攻击造成 ${dmg} 点伤害！`)
    }

    if (opponentCorrect) {
      const dmg = Math.max(1, Math.floor(opp.atk * PVP_OPPONENT_DMG_ATK_RATIO + opp.level * PVP_OPPONENT_DMG_LEVEL_BONUS))
      playerStore.takeDamage(dmg)
      addLog(`🛡️ 对手的知识攻击造成 ${dmg} 点伤害！`)
    }
  }

  // ===== 公共流程方法 =====
  function enterPvp(): void {
    const playerStore = usePlayerStore()
    const logStore = useLogStore()

    reset()
    playerStore.fullHeal()
    opponent.value = generateOpponent()

    logStore.set(['⚔️ PVP对战模式开启！准备寻找对手...'])
    addLog('⚔️ PVP对战模式开启！')
    addLog(`你的对手：${opponent.value.name}`)
    addLog(`规则：${PVP_MAX_ROUNDS} 回合答题对决，得分高者获胜！`)

    saveNow()
  }

  function exitPvp(): void {
    const playerStore = usePlayerStore()
    clearOpponentTimer()
    playerStore.setHp(Math.max(playerStore.hp, 1))
    saveNow()
  }

  async function startRound(): Promise<void> {
    const playerStore = usePlayerStore()
    clearOpponentTimer()

    currentRound.value++
    answerSubmitted.value = false
    lastAnswerCorrect.value = false
    pvpState.value = 'answering'

    await ensureQuestionsForSpec(playerStore.playerSpecialization)
    const qs = getQuestionsForFloor(playerStore.floor, 1, playerStore.playerSpecialization) as Question[]
    currentQuestion.value = qs[0] || null

    if (!currentQuestion.value) {
      addLog('题库加载异常，请重试...')
      pvpState.value = 'idle'
      return
    }

    addLog(`⚡ 第 ${currentRound.value} 回合开始！`)
  }

  function submitAnswer(index: number): void {
    if (answerSubmitted.value || !currentQuestion.value || !opponent.value) return

    answerSubmitted.value = true
    const correct = index === currentQuestion.value.answer
    lastAnswerCorrect.value = correct

    if (correct) {
      playerScore.value++
      addLog(`✅ 你答对了！得分 +1（当前 ${playerScore.value} 分）`)
    } else {
      addLog(`❌ 你答错了！（当前 ${playerScore.value} 分）`)
    }

    const playerStore = usePlayerStore()
    const opponentWinChance =
      PVP_OPPONENT_WIN_CHANCE_BASE +
      (opponent.value.level / (playerStore.level + opponent.value.level)) * PVP_OPPONENT_WIN_CHANCE_RATIO
    const opponentCorrect = Math.random() < opponentWinChance

    opponentTimer = setTimeout(() => {
      opponentTimer = null
      if (opponentCorrect) {
        opponentScore.value++
        addLog(`😈 对手答对了！得分 +1（当前 ${opponentScore.value} 分）`)
      } else {
        addLog(`💨 对手答错了！（当前 ${opponentScore.value} 分）`)
      }
      calculateDamage(correct, opponentCorrect)
    }, PVP_OPPONENT_DELAY_MS)
  }

  async function nextRound(): Promise<void> {
    clearOpponentTimer()
    if (currentRound.value >= PVP_MAX_ROUNDS) {
      await finishPvp()
    } else {
      await startRound()
    }
  }

  async function finishPvp(): Promise<LevelUpResult> {
    clearOpponentTimer()

    won.value = playerScore.value > opponentScore.value
    const isDraw = playerScore.value === opponentScore.value
    if (isDraw) {
      won.value = true
    }
    pvpState.value = 'result'

    const playerStore = usePlayerStore()
    const expGain = rewardExp.value
    const goldGain = rewardGold.value
    playerStore.addExp(expGain)
    playerStore.addGold(goldGain)

    if (won.value && !isDraw) {
      addLog(`🎉 PVP胜利！获得 ${expGain} 经验和 ${goldGain} 金币！`)
    } else if (isDraw) {
      addLog(`🤝 平局！获得 ${expGain} 经验和 ${goldGain} 金币。`)
    } else {
      addLog(`💀 PVP败北...获得 ${expGain} 经验和 ${goldGain} 金币。`)
    }

    const levelUpResult = await recordPvpResult({ won: won.value })
    return levelUpResult
  }

  async function recordPvpResult(result: PvpResult): Promise<LevelUpResult> {
    const playerStore = usePlayerStore()
    pvpResult.value = result

    try {
      await addPvpRecord({
        name: playerStore.playerName || playerStore.title,
        title: playerStore.title,
        level: playerStore.level,
        floor: playerStore.floor,
        specialization: playerStore.playerSpecialization,
        won: result.won,
      })
    } catch (e) {
      logger.error('[recordPvpResult] 保存PVP记录失败:', e)
    }

    const levelUpResult = playerStore.checkLevelUp({ showTitleDisplay: true })
    if (levelUpResult.titleChanged) {
      openTitleDisplay(levelUpResult.titleDisplayLevel)
    }

    saveNow()
    return levelUpResult
  }

  function rematch(): void {
    const playerStore = usePlayerStore()
    clearOpponentTimer()
    reset()

    playerStore.fullHeal()
    opponent.value = generateOpponent()

    addLog('🔄 新的PVP对战开始！')
    addLog(`你的对手：${opponent.value.name}`)
    addLog(`规则：${PVP_MAX_ROUNDS} 回合答题对决，得分高者获胜！`)
  }

  function reset(): void {
    clearOpponentTimer()
    pvpState.value = 'idle'
    currentRound.value = 0
    playerScore.value = 0
    opponentScore.value = 0
    pvpLog.value = []
    currentQuestion.value = null
    answerSubmitted.value = false
    lastAnswerCorrect.value = false
    won.value = false
    // opponent 不在此处重置，由 enterPvp / rematch 单独管理
    pvpResult.value = null
    showTitleDisplay.value = false
    titleDisplayLevel.value = 1
  }

  function openTitleDisplay(lv?: number): void {
    titleDisplayLevel.value = lv || usePlayerStore().level
    showTitleDisplay.value = true
  }

  function closeTitleDisplay(): void {
    showTitleDisplay.value = false
  }

  function serialize(): Record<string, unknown> {
    // 称号弹窗与 PVP 会话状态属于 UI 状态，不持久化
    return {}
  }

  function deserialize(_saveData: Record<string, unknown>): void {
    reset()
  }

  return {
    // 状态
    pvpState,
    currentRound,
    maxRounds: PVP_MAX_ROUNDS,
    playerScore,
    opponentScore,
    pvpLog,
    currentQuestion,
    answerSubmitted,
    lastAnswerCorrect,
    won,
    opponent,
    pvpResult,
    showTitleDisplay,
    titleDisplayLevel,
    // 计算属性
    playerInfo,
    rewardExp,
    rewardGold,
    // 方法
    enterPvp,
    exitPvp,
    startRound,
    submitAnswer,
    nextRound,
    finishPvp,
    rematch,
    reset,
    addLog,
    recordPvpResult,
    openTitleDisplay,
    closeTitleDisplay,
    serialize,
    deserialize,
  }
})
