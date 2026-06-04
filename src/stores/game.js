import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ALL_QUESTIONS, getQuestionsForFloor, exportUsedQuestions, importUsedQuestions, preloadQuestions, ensureQuestionsForFloor, isQuestionsLoaded, isPreloadStarted, getLoadProgress } from '../data/questions.js'
import { SPECIALIZATIONS, getSpecialization, getUnlockedSkills, getNextSkill } from '../data/specialization.js'
import { ENEMIES, getEnemyForFloor, getBossForFloor } from '../data/enemies.js'
import { EQUIPMENT, CONSUMABLES } from '../data/items.js'
import {
  createFarmMonster,
  generateMonsterAbility,
  getUpgradeMaterialName,
  checkElementCounter,
  ELEMENT_SUBJECT_MAP,
  FARM_MAX_CAPACITY,
  DUNGEON_ELEMENTS
} from '../data/farm.js'
import { FORGE_RECIPES, canForge } from '../data/forge.js'
import { SHOP_ITEMS } from '../data/shop.js'
import { getWeeklyBoss, scaleBossForLevel, getWeeklyBossKey, isWeeklyBossDefeated, formatTimeRemaining } from '../data/limited_bosses.js'
import { getTotalCount } from '../data/cyclopedia.js'
import {
  ACHIEVEMENTS,
  checkAchievementUnlocked
} from '../data/achievements.js'
import {
  sfxClick,
  sfxCorrect,
  sfxWrong,
  sfxCritical,
  sfxLevelUp,
  sfxItemGet,
  sfxSplash,
  sfxHit,
  sfxCaptureSuccess,
  sfxCaptureFail,
  isSoundEnabled
} from '../utils/sfx.js'
import { getTitleForLevel } from '../utils/dungeon.js'
import { getAllMonsters, getAllMaterials, getAllFishes, getAllBooks } from '../data/encyclopedia.js'
import { getAllQuestions } from '../data/questions.js'
import { getAllFishes as getAllFishesFromData } from '../data/fishing.js'
import { getAllBooks as getAllBooksFromData } from '../data/fishing.js'
import { TITLE_TABLE } from '../data/title.js'
import { FEEDBACK_TYPES } from '../data/feedback.js'
import { getWrongQuestions, saveWrongQuestion, loadWrongQuestions, clearWrongQuestions } from '../data/wrong_book.js'

// ===== 状态机定义（v8.0）=====
export const GAME_MODE = {
  IDLE: 'idle',           // 主界面
  DUNGEON_PREP: 'dungeon_prep',   // 地牢准备
  DUNGEON_ROOMS: 'dungeon_rooms', // 地牢选房间
  BATTLE: 'battle',       // 普通战斗
  WEEKLY_BOSS: 'weekly_boss',     // 限时Boss
  FISHING: 'fishing',     // 钓鱼面板
  FISHING_QUIZ: 'fishing_quiz', // 钓鱼答题（解锁限制）
  FISHING_BOOK: 'fishing_book',   // 钓到古籍
  FISHING_BOOK_QUIZ: 'fishing_book_quiz', // 研读古籍答题
  FISHING_CAUGHT: 'fishing_caught', // 钓到鱼
  SHOP: 'shop',           // 商店
  FARM: 'farm',           // 农场
  INVENTORY: 'inventory', // 仓库
  STUDY: 'study',         // 自习室
  ENCYCLOPEDIA: 'encyclopedia', // 图鉴
  SETTINGS: 'settings',   // 设置
  CAPTURE_QUIZ: 'capture_quiz', // 捕捉答题
  DROP: 'drop',           // 掉落展示
  WON: 'won',             // 战斗胜利
  LOST: 'lost',           // 战斗失败
  FLED: 'fled',           // 逃跑
}

// 互斥组定义
const COMBAT_MODES = [GAME_MODE.BATTLE, GAME_MODE.WEEKLY_BOSS, GAME_MODE.CAPTURE_QUIZ]
const PANEL_MODES = [GAME_MODE.SHOP, GAME_MODE.FARM, GAME_MODE.INVENTORY, GAME_MODE.STUDY, GAME_MODE.ENCYCLOPEDIA, GAME_MODE.SETTINGS, GAME_MODE.FISHING]

export const useGameStore = defineStore('game', () => {
  // ===== 游戏状态 =====
  const gameStarted = ref(false)
  const activeTab = ref('dungeon')

  // ===== 开发者模式（测试密令）=====
  const devMode = ref(false)
  function toggleDevMode() {
    devMode.value = !devMode.value
    saveGame()
    return devMode.value
  }

  // 玩家专精选择
  const playerSpecialization = ref(null)

  // ===== 专精技能系统 =====
  const specializationSkills = ref([])    // 已解锁的专精技能列表 [{ skill, unlockedAt }]
  const newSkillUnlock = ref(null)        // 刚解锁的技能（用于提示）[{ skill, unlockedAt }]
  const skillUnlockQueue = ref([])        // 升级时可能一次解锁多个技能，排队展示

  // 应用专精初始属性加成
  function setSpecialization(spec) {
    playerSpecialization.value = spec
    const specData = getSpecialization(spec)
    if (specData) {
      // 应用初始属性
      const bonus = specData.initialBonus
      if (bonus.atk) atk.value += bonus.atk
      if (bonus.def) def.value += bonus.def
      if (bonus.hp) { maxHp.value += bonus.hp; hp.value += bonus.hp }
      // 暴击率/闪避率/经验加成存下来供战斗系统读取
      // 这些由战斗系统在合适的时机读取 playerSpecialization 查表
    }
    // 检查当前等级是否有已解锁技能
    checkSkillUnlocks()
  }

  // 检查并解锁可用技能
  function checkSkillUnlocks() {
    const spec = playerSpecialization.value
    if (!spec) return
    const unlocked = getUnlockedSkills(spec, level.value)
    const alreadyUnlocked = new Set(specializationSkills.value.map(s => s.skill.effect))
    const newlyUnlocked = unlocked.filter(s => !alreadyUnlocked.has(s.effect))

    for (const skill of newlyUnlocked) {
      specializationSkills.value.push({
        skill,
        unlockedAt: level.value
      })
      skillUnlockQueue.value.push({ skill, unlockedAt: level.value })
      battleLog.value.push(`🔓 专精技能解锁：${skill.icon} ${skill.name}（Lv.${skill.level}）`)
    }
  }

  // 消耗新技能解锁提示
  function consumeSkillUnlock() {
    if (skillUnlockQueue.value.length > 0) {
      newSkillUnlock.value = skillUnlockQueue.value.shift()
      return newSkillUnlock.value
    }
    newSkillUnlock.value = null
    return null
  }

  // 检查某专精技能是否已解锁
  function isSkillUnlocked(effectName) {
    return specializationSkills.value.some(s => s.skill.effect === effectName)
  }

  // ===== 状态机（v8.0）=====
  const gameMode = ref(GAME_MODE.IDLE)

  // 状态转移函数（铁律：所有状态变更必须走这里）
  function enterMode(newMode) {
    // 战斗中禁止进入非战斗模式
    if (COMBAT_MODES.includes(gameMode.value) && !COMBAT_MODES.includes(newMode)) {
      console.warn(`[StateMachine] 拒绝转移：${gameMode.value} → ${newMode}（战斗中）`)
      return false
    }
    const oldMode = gameMode.value
    gameMode.value = newMode
    console.log(`[StateMachine] ${oldMode} → ${newMode}`)
    return true
  }

  function isCombatMode() {
    return COMBAT_MODES.includes(gameMode.value)
  }

  function isPanelMode() {
    return PANEL_MODES.includes(gameMode.value)
  }

  // ===== 玩家状态 =====
  const level = ref(1)
  const exp = ref(0)
  const maxExp = computed(() => Math.floor(100 * Math.pow(1.15, level.value - 1)))
  const hp = ref(100)
  const maxHp = ref(100)
  const atk = ref(10)
  const def = ref(5)
  const gold = ref(0)
  const floor = ref(1)
  const title = ref('菜鸟学徒')
  const titleData = ref(getTitleForLevel(1))
  const titleBio = ref('刚踏入知识领域的初学者，对一切都充满好奇。')
  const titleEra = ref('远古')
  const titleField = ref('化学')
  const titleAchievements = ref([])

  // ===== 属性点系统 =====
  const statPoints = ref(0)
  const atkPoints = ref(0)
  const defPoints = ref(0)
  const hpPoints = ref(0)
  const activeBuffs = ref([]) // [{ effect, value, remaining }]


  // ===== 战斗状态 =====
  const inBattle = ref(false)
  const battleState = ref('')
  const enemy = ref(null)
  const question = ref(null)
  const battleLog = ref([])
  const drop = ref(null)

  // ===== 装备与物品 =====
  const equipment = ref([])
  const consumables = ref([])
  const equipped = ref({ weapon: null, armor: null, accessory: null })
  const inventory = ref({})

  // ===== 农场与宠物 =====
  const farm = ref([])
  const activeMonster = ref(null)
  const captureMonsterData = ref(null)
  const captureQuestions = ref([])
  const captureIndex = ref(0)
  const captureCorrectCount = ref(0)

  // ===== 连击系统 =====
  const comboCount = ref(0)
  const comboActive = ref(false)
  const consecutiveCorrect = ref(0)

  // ===== 图鉴系统 =====
  const cyclopedia = ref({})
  const newDiscoveries = ref([])
  const stats = ref({ totalCorrect: 0, totalWrong: 0, maxCombo: 0, maxFloor: 1, totalBattles: 0, totalWins: 0, totalFishes: 0, totalForges: 0 })

  // ===== 成就系统 =====
  const unlockedAchievements = ref({})
  const newAchievementUnlocks = ref([])

  // ===== 钓鱼系统 =====
  const fishingLevel = ref(1)
  const recentCatches = ref([])
  const fishCollection = ref({})
  const bookStudyQuestion = ref(null)
  const bookStudyMode = ref(false)
  const dailyFishCount = ref(0)
  const fishLimitUnlocked = ref(false)

  // ===== 错题本 =====
  const wrongQuestions = ref([])
  const wrongStats = computed(() => {
    const total = wrongQuestions.value.length
    const mastered = wrongQuestions.value.filter(wq => wq.mastered).length
    const pending = total - mastered
    const bySubject = {
      chem: wrongQuestions.value.filter(wq => wq.question?.subject === 'chem').length,
      bio: wrongQuestions.value.filter(wq => wq.question?.subject === 'bio').length,
      yi: wrongQuestions.value.filter(wq => wq.question?.subject === 'yi').length
    }
    return { total, mastered, pending, bySubject }
  })
  const reviewMode = ref(false)
  const reviewCurrent = ref(null)
  const reviewIndex = ref(0)
  const reviewPool = ref([])
  const reviewResults = ref([])

  // ===== 地牢系统 =====
  const dungeonPhase = ref('none')
  const roomGrid = ref([])
  const bossRoomIndex = ref(-1)
  const currentRoomIndex = ref(-1)
  const allClearCount = ref(0)
  const clearedRoomsThisFloor = ref(0)
  const hasSkippedRoom = ref(false)
  const currentFloorElement = ref('water')
  const showTutorial = ref(false)
  const firstVisit = ref(true)

  // ===== 限时Boss =====
  const inWeeklyBoss = ref(false)
  const weeklyBossData = ref(null)
  const weeklyBossTurn = ref(0)
  const weeklyBossTimeLeft = ref(0)
  const weeklyBossSkillUsed = ref([])
  const weeklyBossDefeated = ref([])
  const weeklyBossTimer = ref(null)

  // ===== 计算属性 =====
  const expPercent = computed(() => (exp.value / maxExp.value) * 100)
  const hpPercent = computed(() => (hp.value / maxHp.value) * 100)
  const monsterBonus = computed(() => {
    if (!activeMonster.value) return { atk: 0, def: 0, hp: 0 }
    return {
      atk: Math.floor(activeMonster.value.atk * 0.1),
      def: Math.floor(activeMonster.value.def * 0.1),
      hp: Math.floor(activeMonster.value.maxHp * 0.1)
    }
  })
  const totalAtk = computed(() => {
    let base = atk.value + monsterBonus.value.atk
    if (equipped.value.weapon) base += equipped.value.weapon.atk || 0
    if (equipped.value.accessory) base += equipped.value.accessory.atk || 0
    return base
  })
  const totalDef = computed(() => {
    let base = def.value + monsterBonus.value.def
    if (equipped.value.armor) base += equipped.value.armor.def || 0
    if (equipped.value.accessory) base += equipped.value.accessory.def || 0
    return base
  })

  // ===== 属性点分配 =====
  function allocateStat(type) {
    if (statPoints.value <= 0) return false
    statPoints.value--
    if (type === 'atk') {
      atkPoints.value++
      atk.value += 2
    } else if (type === 'def') {
      defPoints.value++
      def.value += 1
    } else if (type === 'hp') {
      hpPoints.value++
      maxHp.value += 10
      hp.value += 10
    }
    saveGame()
    return true
  }

  function resetStats() {
    statPoints.value += atkPoints.value + defPoints.value + hpPoints.value
    atk.value -= atkPoints.value * 2
    def.value -= defPoints.value
    maxHp.value -= hpPoints.value * 10
    hp.value = Math.min(hp.value, maxHp.value)
    atkPoints.value = 0
    defPoints.value = 0
    hpPoints.value = 0
    saveGame()
  }

  // ===== 游戏启动 =====
  // ===== 题库加载状态 =====
  const isLoadingQuestions = ref(false)
  const questionsLoaded = computed(() => isQuestionsLoaded())
  const loadProgress = computed(() => getLoadProgress())

  function startGame() {
    gameStarted.value = true
    firstVisit.value = false
    activeTab.value = 'dungeon'
    isLoadingQuestions.value = false
    // 后台渐进加载题库，不阻塞游戏启动
    preloadQuestions()
    saveGame()
  }

  function setTab(tab) {
    activeTab.value = tab
  }

  // ===== 战斗系统 =====
  function initBattle() {
    // 触发后台题库加载（不阻塞）
    ensureQuestionsForFloor(floor.value)
    actuallyInitBattle()
  }

  function actuallyInitBattle() {
    enterMode(GAME_MODE.BATTLE)
    const e = getEnemyForFloor(floor.value)[0] || getRandomEnemy()
    const q = getQuestionsForFloor(floor.value, 1, playerSpecialization.value)[0]
    if (!q) {
      console.error('[initBattle] 题目加载失败，无法初始化战斗')
      return
    }

    const el = DUNGEON_ELEMENTS[e.element] || DUNGEON_ELEMENTS.water
    enemy.value = {
      ...e,
      maxHp: e.hp,
      def: e.def || 0,
      subjectLabel: e.subject === 'chem' ? '化学' : e.subject === 'bio' ? '生物' : '易学',
      elementLabel: el.name
    }
    question.value = q
    battleLog.value = [`遭遇 ${e.name}！`]
    battleState.value = 'idle'
    inBattle.value = true
  }

  function enemyAttack() {
    // 开发者模式：无敌
    if (devMode.value) {
      battleLog.value.push('💠 [Dev] 开发者模式：免疫伤害')
      return
    }

    // 检查玩家元素是否克制敌人（减少伤害）
    const elementEffect = checkElementCounter(enemy.value.element, activeMonster.value?.element)
    let multiplier = elementEffect?.multiplier || 1.0
    // 如果敌人克制玩家，伤害增加；如果被克制，伤害减少
    if (elementEffect && elementEffect.desc === '被克制...') {
      multiplier = 0.7  // 敌人被克制，对玩家伤害减少
    } else if (elementEffect && elementEffect.desc === '克制！') {
      multiplier = 1.5  // 敌人克制玩家，伤害增加
    } else {
      multiplier = 1.0
    }

    // 伤害保底：即使防御极高，至少造成 atk 的 40% 伤害（3点起）
    let baseDmg = Math.floor((enemy.value.atk - totalDef.value) * multiplier)
    const minDmg = Math.max(3, Math.floor(enemy.value.atk * 0.4 * multiplier))
    const damage = Math.max(minDmg, baseDmg)
    hp.value -= damage
    sfxHit()
    battleLog.value.push(`${enemy.value.name} 对你造成 ${damage} 点伤害！`)

    if (hp.value <= 0) {
      hp.value = 0
      battleState.value = 'lost'
      battleLog.value.push('你倒下了...')
    }
  }

  // 连击系统
  function resetCombo() {
    consecutiveCorrect.value = 0
    comboCount.value = 0
    // 注意：不重置 comboActive，让 triggerCriticalEffect 的 setTimeout 控制特效时长
  }

  function triggerCriticalEffect() {
    // 屏幕震动效果标记
    comboActive.value = true
    setTimeout(() => { comboActive.value = false }, 1500)
  }

  // 记录错题
  function recordWrongQuestion(q, wrongAnswer) {
    if (!q) return
    const existing = wrongQuestions.value.find(wq => wq.id === q.id)
    if (existing) {
      existing.wrongCount++
      existing.wrongAnswer = wrongAnswer
      existing.lastWrongTime = Date.now()
      existing.mastered = false // 再次做错，取消掌握状态
    } else {
      wrongQuestions.value.push({
        id: q.id,
        question: q,
        wrongAnswer: wrongAnswer,
        wrongCount: 1,
        lastWrongTime: Date.now(),
        mastered: false
      })
    }
    saveWrongQuestion(wrongQuestions.value)
  }

  // 错题本操作
  function masterQuestion(id) {
    const wq = wrongQuestions.value.find(wq => wq.id === id)
    if (wq) {
      wq.mastered = true
      saveWrongQuestion(wrongQuestions.value)
    }
  }
  function removeWrongQuestion(id) {
    wrongQuestions.value = wrongQuestions.value.filter(wq => wq.id !== id)
    saveWrongQuestion(wrongQuestions.value)
  }
  function startReview(subjectFilter) {
    reviewMode.value = true
    reviewIndex.value = 0
    reviewResults.value = []
    let pool = wrongQuestions.value.filter(wq => !wq.mastered)
    if (subjectFilter) {
      pool = pool.filter(wq => wq.question?.subject === subjectFilter || wq.subject === subjectFilter)
    }
    reviewPool.value = pool.map(wq => ({
      id: wq.id,
      q: wq.question?.q || wq.q,
      options: wq.question?.options || wq.options,
      answer: wq.question?.answer ?? wq.answer,
      subject: wq.question?.subject || wq.subject,
      diff: wq.question?.diff || wq.diff,
      wrongCount: wq.wrongCount
    }))
    reviewCurrent.value = reviewPool.value[0] || null
  }
  function submitReviewAnswer(index) {
    if (!reviewCurrent.value) return
    const correct = index === reviewCurrent.value.answer
    reviewResults.value.push({
      id: reviewCurrent.value.id,
      correct,
      subject: reviewCurrent.value.subject,
      diff: reviewCurrent.value.diff
    })
    if (correct) {
      masterQuestion(reviewCurrent.value.id)
    }
    reviewIndex.value++
    reviewCurrent.value = reviewPool.value[reviewIndex.value] || null
    if (!reviewCurrent.value) {
      reviewMode.value = false
    }
  }
  function exitReview() {
    reviewMode.value = false
    reviewCurrent.value = null
    reviewIndex.value = 0
    reviewPool.value = []
    reviewResults.value = []
  }

  // 答题攻击
  function answerAttack(correct) {
    if (!enemy.value) return

    // 开发者模式：自动答对+秒杀
    if (devMode.value) {
      sfxCorrect()
      battleLog.value.push('💠 [Dev] 开发者模式：自动命中，秒杀！')
      enemy.value.hp = 0
      consecutiveCorrect.value++
      updateStats('totalCorrect', 1)
      winBattle()
      return
    }

    if (correct) {
      // 连击逻辑：连续答对增加连击数
      consecutiveCorrect.value++
      comboCount.value = consecutiveCorrect.value
      sfxCorrect()

      // 计算元素克制
      const elementEffect = checkElementCounter(activeMonster.value?.element, enemy.value.element)
      let multiplier = 1.5 * (elementEffect?.multiplier || 1.0)

      // 连击加成：每连击一次增加0.5倍伤害
      const comboMultiplier = 1 + consecutiveCorrect.value * 0.5
      multiplier *= comboMultiplier

      const damage = Math.max(1, Math.floor((totalAtk.value - enemy.value.def) * multiplier))
      enemy.value.hp -= damage

      let logMsg = ''
      if (consecutiveCorrect.value >= 3) {
        // 三连暴击：先更新 maxCombo 统计，再重置连击
        if (consecutiveCorrect.value > stats.value.maxCombo) {
          stats.value.maxCombo = consecutiveCorrect.value
        }
        logMsg = `⚡ 知识连击x${consecutiveCorrect.value}！造成 ${damage} 点伤害！`
        triggerCriticalEffect()
        sfxCritical()
        resetCombo()
      } else if (consecutiveCorrect.value === 2) {
        logMsg = `🔥 连击x2！造成 ${damage} 点伤害！`
      } else {
        logMsg = `🧠 知识攻击命中！造成 ${damage} 点伤害！`
      }

      if (elementEffect?.desc) logMsg += ` ${elementEffect.desc}`
      battleLog.value.push(logMsg)

      updateStats('totalCorrect', 1)
      if (consecutiveCorrect.value > stats.value.maxCombo) {
        stats.value.maxCombo = consecutiveCorrect.value
      }

      // 防止伤害溢出导致负血条和后续状态异常
      if (enemy.value.hp <= 0) {
        enemy.value.hp = 0
        winBattle()
      } else {
        battleState.value = 'idle'
        // 刷新题目，避免同一题反复出现
        const newQ = getQuestionsForFloor(floor.value, 1, playerSpecialization.value)[0]
        if (newQ) question.value = newQ
      }
    } else {
      // 答错重置连击，记录错题
      resetCombo()
      sfxWrong()
      battleLog.value.push('回答错误！受到反噬！')
      recordWrongQuestion(question.value, -1)
      enemyAttack()
    }
  }

  // 使用药水
  function usePotion(itemId) {
    const idx = consumables.value.findIndex(i => i.id === itemId)
    if (idx === -1) return false

    const item = consumables.value[idx]
    if (item.type === 'heal') {
      const heal = Math.floor(maxHp.value * item.ratio)
      hp.value = Math.min(maxHp.value, hp.value + heal)
      battleLog.value.push(`使用 ${item.name}，恢复 ${heal} 点生命！`)
    } else if (item.type === 'buff') {
      const val = item.value || 0
      if (item.effect === 'atk') {
        atk.value += val
        activeBuffs.value.push({ effect: 'atk', value: val, remaining: 3 })
        battleLog.value.push(`使用 ${item.name}，攻击+${val}（持续3场战斗）！`)
      } else if (item.effect === 'def') {
        def.value += val
        activeBuffs.value.push({ effect: 'def', value: val, remaining: 3 })
        battleLog.value.push(`使用 ${item.name}，防御+${val}（持续3场战斗）！`)
      } else if (item.effect === 'crit') {
        activeBuffs.value.push({ effect: 'crit', value: val, remaining: 3 })
        battleLog.value.push(`使用 ${item.name}，暴击率+${val}%（持续3场战斗）！`)
      }
    } else if (item.type === 'revive') {
      hp.value = maxHp.value
      battleLog.value.push(`使用 ${item.name}，满血复活！`)
    }

    consumables.value.splice(idx, 1)
    saveGame()
    return true
  }

  // 胜利
  function winBattle() {
    battleState.value = 'won'
    const e = enemy.value
    if (!e) return

    const expGain = Math.floor(e.hp * 0.5 + e.atk * 2)
    const goldGain = Math.floor(e.atk * 1.5)
    exp.value += expGain
    gold.value += goldGain
    battleLog.value.push(`🎉 战斗胜利！获得 ${expGain} 经验和 ${goldGain} 金币！`)

    // 掉落物品
    const dropItem = generateDrop(e)
    if (dropItem) {
      drop.value = dropItem
      battleState.value = 'drop'
      battleLog.value.push(`掉落 ${dropItem.item.name}！`)
    }

    // 捕捉数据（如果是可捕捉的怪物）
    if (e.captureable) {
      captureMonsterData.value = {
        name: e.name,
        icon: e.icon,
        element: e.element,
        baseHp: e.hp,
        baseAtk: e.atk,
        baseDef: e.def,
        captureFloor: floor.value
      }
      // 生成3道捕捉题目
      const qs = getQuestionsForFloor(floor.value, 3, playerSpecialization.value)
      captureQuestions.value = qs
      captureIndex.value = 0
      captureCorrectCount.value = 0
    }

    // 检查升级
    while (exp.value >= maxExp.value) {
      exp.value -= maxExp.value
      level.value++
      maxHp.value = Math.floor(maxHp.value * 1.2)
      hp.value = maxHp.value
      atk.value += 2
      def.value += 1
      statPoints.value++
      battleLog.value.push(`🎊 升级！到达 Lv.${level.value}！`)
      sfxLevelUp()

      // 检查是否有专精技能解锁
      checkSkillUnlocks()

      // 更新称号
      const newTitle = getTitleForLevel(level.value)
      if (newTitle.title !== title.value) {
        title.value = newTitle.title
        titleData.value = newTitle
        titleBio.value = newTitle.bio
        titleEra.value = newTitle.era
        titleField.value = newTitle.field
        titleAchievements.value = newTitle.achievements || []
      }
    }

    // 记录图鉴
    addToCyclopedia('monsters', e.name)
    updateStats('totalWins', 1)
    updateStats('totalBattles', 1)

    // 记录最高层
    if (floor.value > stats.value.maxFloor) {
      stats.value.maxFloor = floor.value
    }

    // 衰减 buff（每场胜利后减少1场剩余，归零时移除属性）
    activeBuffs.value = activeBuffs.value.filter(b => {
      b.remaining--
      if (b.remaining <= 0) {
        if (b.effect === 'atk') {
          atk.value -= b.value
          battleLog.value.push(`⚠️ 攻击增益效果结束！攻击-${b.value}`)
        } else if (b.effect === 'def') {
          def.value -= b.value
          battleLog.value.push(`⚠️ 防御增益效果结束！防御-${b.value}`)
        } else if (b.effect === 'crit') {
          battleLog.value.push(`⚠️ 暴击增益效果结束！`)
        }
        return false
      }
      return true
    })

    saveGame()
    checkAchievements()
  }

  // 生成掉落
  function generateDrop(e) {
    const rand = Math.random()
    if (rand < 0.3) {
      // 30% 掉落装备
      const item = EQUIPMENT[Math.floor(Math.random() * EQUIPMENT.length)]
      return { type: 'equipment', item }
    } else if (rand < 0.6) {
      // 30% 掉落消耗品
      const item = CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)]
      return { type: 'consumable', item }
    }
    return null
  }

  // 领取掉落
  function claimDrop() {
    if (!drop.value) return
    const item = drop.value
    if (item.type === 'equipment') {
      equipment.value.push(item.item)
      addToCyclopedia('materials', item.item.name)
    } else if (item.type === 'consumable') {
      consumables.value.push(item.item)
    }
    drop.value = null
    battleState.value = 'won'

    // 记录图鉴和统计
    if (enemy.value?.name) {
      addToCyclopedia('monsters', enemy.value.name)
    }

    saveGame()
    checkAchievements()
  }

  // 开始捕捉流程
  function startCapture() {
    if (!captureMonsterData.value || captureQuestions.value.length === 0) return
    captureIndex.value = 0
    captureCorrectCount.value = 0
    battleState.value = 'captureQuiz'
  }

  // 提交捕捉答题（多题模式）
  function submitCaptureAnswer(index) {
    if (captureIndex.value >= captureQuestions.value.length) return

    const q = captureQuestions.value[captureIndex.value]
    // 开发者模式：自动答对
    const correct = devMode.value ? true : (index === q.answer)

    if (!correct) {
      recordWrongQuestion(q, index)
      sfxWrong()
    } else {
      sfxCorrect()
    }

    if (correct) {
      captureCorrectCount.value++
    }

    // 计算当前题之后的剩余题数
    const remaining = captureQuestions.value.length - captureIndex.value - 1

    // 提前终止：如果剩余题数 + 已答对 < 3，不可能成功
    if (captureCorrectCount.value + remaining < 3) {
      battleState.value = 'captureFail'
      sfxCaptureFail()
      captureMonsterData.value = null
      captureQuestions.value = []
      captureIndex.value = 0
      captureCorrectCount.value = 0
      if (dungeonPhase.value === 'battle') {
        const room = roomGrid.value[currentRoomIndex.value]
        if (room) { room.cleared = true; clearedRoomsThisFloor.value++ }
        currentRoomIndex.value = -1
        inBattle.value = false
        enemy.value = null
        question.value = null
        resetCombo()
      } else {
        floor.value++
      }
      return
    }

    captureIndex.value++

    // 全部答完
    if (captureIndex.value >= captureQuestions.value.length) {
      if (captureCorrectCount.value >= 3) {
        const monster = createFarmMonster(
          captureMonsterData.value.name,
          captureMonsterData.value.icon,
          captureMonsterData.value.element,
          captureMonsterData.value.baseHp,
          captureMonsterData.value.baseAtk,
          captureMonsterData.value.baseDef,
          captureMonsterData.value.captureFloor
        )
        farm.value.push(monster)
        battleLog.value.push(`收养成功！${monster.name} 成为你的伙伴！`)
        battleState.value = 'captureSuccess'
        sfxCaptureSuccess()
      } else {
        battleState.value = 'captureFail'
        sfxCaptureFail()
      }
      captureMonsterData.value = null
      captureQuestions.value = []
      captureIndex.value = 0
      captureCorrectCount.value = 0
      if (dungeonPhase.value === 'battle') {
        finishRoom(true)
      } else {
        floor.value++
      }
    }
  }

  // 跳过捕捉
  function skipCapture() {
    captureMonsterData.value = null
    captureQuestions.value = []
    captureIndex.value = 0
    captureCorrectCount.value = 0
    battleState.value = 'idle'
    if (dungeonPhase.value === 'battle') {
      finishRoom(true)
    } else {
      floor.value++
      exitBattle()
    }
  }

  // 装备物品
  function equip(item) {
    if (item.type === 'weapon') {
      equipped.value.weapon = item
    } else if (item.type === 'armor') {
      equipped.value.armor = item
    } else if (item.type === 'accessory') {
      equipped.value.accessory = item
    }
    saveGame()
  }

  // 设置跟随怪物
  function setFollowMonster(idx) {
    if (!farm.value[idx]) return
    activeMonster.value = farm.value[idx]
  }

  // 取消跟随
  function unfollowMonster() {
    activeMonster.value = null
  }

  // 升级怪物
  function upgradeMonster(idx) {
    const m = farm.value[idx]
    if (!m) return false

    // 路径A：经验已满，直接消耗经验升级
    if (m.exp >= m.maxExp) {
      m.exp -= m.maxExp
    } else {
      // 路径B：经验不足，消耗材料填充经验
      const matCost = Math.floor(m.level * 2)
      const matName = getUpgradeMaterialName(m.element)
      const matCount = inventory.value[matName] || 0

      if (matCount < matCost) {
        battleLog.value.push(`${matName} 不足 (${matCount}/${matCost})`)
        return false
      }

      // 消耗材料
      inventory.value[matName] -= matCost
      if (inventory.value[matName] <= 0) {
        delete inventory.value[matName]
      }
    }

    // 升级
    m.level++
    m.maxExp = Math.floor(50 * Math.pow(1.3, m.level - 1))

    // 重新计算能力
    const newAbility = generateMonsterAbility(m.element, m.captureFloor)
    const levelMultiplier = 1 + (m.level - 1) * 0.2
    m.atk = Math.floor(newAbility.atk * levelMultiplier)
    m.def = Math.floor(newAbility.def * levelMultiplier)
    m.maxHp = Math.floor(newAbility.hp * levelMultiplier)
    m.hp = m.maxHp

    saveGame()
    return true
  }

  // 释放怪物
  function releaseMonster(idx) {
    if (!farm.value[idx]) return false
    farm.value.splice(idx, 1)
    if (activeMonster.value && !farm.value.includes(activeMonster.value)) {
      activeMonster.value = null
    }
    saveGame()
    return true
  }

  // 添加物品到背包
  function addItem(item) {
    if (item.type === 'equipment') {
      equipment.value.push(item)
    } else if (item.type === 'consumable') {
      consumables.value.push(item)
    }
    saveGame()
  }

  // 添加材料
  function addMaterial(name, count) {
    inventory.value[name] = (inventory.value[name] || 0) + count
    saveGame()
  }

  // 锻造物品
  function forgeItem(recipe) {
    if (!canForge(recipe, inventory.value, gold.value)) return false

    // 消耗金币
    gold.value -= recipe.gold

    // 消耗材料
    for (const [mat, count] of Object.entries(recipe.materials)) {
      inventory.value[mat] -= count
      if (inventory.value[mat] <= 0) {
        delete inventory.value[mat]
      }
    }

    // 生成装备
    const item = {
      ...recipe.result,
      id: Date.now() + Math.random()
    }
    equipment.value.push(item)
    updateStats('totalForges', 1)
    checkAchievements()
    saveGame()
    return true
  }

  // 商店购买
  function buyItem(item) {
    if (gold.value < item.price) return false
    gold.value -= item.price
    if (item.type === 'equipment') {
      equipment.value.push({ ...item, id: Date.now() + Math.random() })
    } else if (item.type === 'consumable') {
      consumables.value.push({ ...item, id: Date.now() + Math.random() })
    } else if (item.type === 'material') {
      inventory.value[item.name] = (inventory.value[item.name] || 0) + item.count
    }
    saveGame()
    return true
  }

  // 敌人名 → 图鉴名映射表（两个数据源的名字完全不匹配）
  const ENEMY_TO_ENCYCLOPEDIA_MAP = {
    // === 基础敌人（5个）===
    "混沌史莱姆": "酸液史莱姆",
    "有机幽灵": "蒸馏幽灵",
    "DNA螺旋怪": "DNA编织者",
    "细胞壁守卫": "抗体骑士",
    "八卦阵灵": "八卦守卫",
    // === bio 额外敌人（24个）===
    "病毒变异体": "病毒传播者",
    "耐药菌株": "抗体骑士",
    "线粒体损伤者": "线粒体狂战士",
    "癌细胞增殖体": "细胞吞噬者",
    "免疫逃逸者": "抗体骑士",
    "表观遗传沉默者": "DNA编织者",
    "蛋白错误折叠体": "基因窃取者",
    "基因重组突变体": "基因窃取者",
    "信号通路失控者": "细胞吞噬者",
    "端粒耗尽者": "生态主宰",
    "自噬缺陷体": "细胞吞噬者",
    "氧化应激体": "线粒体狂战士",
    "神经退行体": "生态主宰",
    "代谢综合征体": "生态主宰",
    "细胞凋亡逃避者": "细胞吞噬者",
    "CRISPR编辑体": "DNA编织者",
    "酶催化体": "蛋白酶猎手",
    "光敏色素体": "叶绿体精灵",
    "突触传导体": "生态主宰",
    "血红蛋白体": "生态主宰",
    "溶酶体消化体": "蛋白酶猎手",
    "光合作用体": "叶绿体精灵",
    "有丝分裂体": "细胞吞噬者",
    "转录因子体": "DNA编织者",
    // === chem 额外敌人（25个）===
    "自由基链反应体": "试剂融合怪",
    "配位饱和体": "结晶傀儡",
    "酸碱缓冲体": "碳酸蟹",
    "过电位体": "电解精灵",
    "晶格缺陷体": "合金巨人",
    "手性异构体": "毒理蛇",
    "胶体聚沉体": "硫磺蝎",
    "反应坐标能垒": "催化剂兽",
    "熵增混沌体": "汞妖",
    "共振杂化体": "硝石龙",
    "电负性差异体": "氧化守卫",
    "溶度积边界体": "结晶傀儡",
    "Markovnikov规则体": "试剂融合怪",
    "勒夏特列逆反体": "元素贤者",
    "轨道对称禁阻体": "元素贤者",
    "配位场体": "结晶傀儡",
    "氧化还原体": "氧化守卫",
    "表面活性体": "试剂融合怪",
    "sp3杂化体": "合金巨人",
    "π共轭体": "硝石龙",
    "质子酸体": "酸液史莱姆",
    "过渡金属体": "合金巨人",
    "氢键缔合体": "碳酸蟹",
    "同分异构体": "毒理蛇",
    "滴定终点体": "试剂融合怪",
    // === yi 额外敌人（25个）===
    "六冲煞": "卦象幻影",
    "六害劫": "卦象幻影",
    "三刑狱": "五行灵",
    "空亡虚": "爻变虫",
    "伏吟局": "太极兽",
    "反吟局": "太极兽",
    "太岁压": "河图守护者",
    "月破击": "洛书使者",
    "日辰克": "阴阳师",
    "动化退": "爻变虫",
    "动化绝": "爻变虫",
    "游魂卦": "卦象幻影",
    "归魂卦": "卦象幻影",
    "用神墓": "五行灵",
    "忌神旺": "五行灵",
    "青龙腾": "河图守护者",
    "白虎啸": "洛书使者",
    "朱雀鸣": "阴阳师",
    "玄武隐": "六爻术士",
    "勾陈滞": "六爻术士",
    "螣蛇缠": "六爻术士",
    "天乙贵": "乾坤主宰",
    "文昌星": "河图守护者",
    "桃花煞": "阴阳师",
    "驿马动": "六爻术士",
  }

  // 图鉴系统
  function addToCyclopedia(category, name) {
    // 如果是 monsters 分类，将敌人名转换成图鉴名
    let displayName = name
    if (category === 'monsters' && ENEMY_TO_ENCYCLOPEDIA_MAP[name]) {
      displayName = ENEMY_TO_ENCYCLOPEDIA_MAP[name]
    }
    if (!cyclopedia.value[category]) {
      cyclopedia.value[category] = []
    }
    if (!cyclopedia.value[category].includes(displayName)) {
      cyclopedia.value[category].push(displayName)
      const discovery = { type: category, name: displayName, time: Date.now(), id: Math.random() }
      newDiscoveries.value.push(discovery)
      // 3秒后自动移除新发现通知
      setTimeout(() => {
        newDiscoveries.value = newDiscoveries.value.filter(d => d.id !== discovery.id)
      }, 3000)
    }
    checkAchievements()
  }

  function getCyclopediaProgress(category) {
    const discovered = cyclopedia.value[category] || []
    let total = 0
    if (category === 'monsters') total = getAllMonsters().length
    else if (category === 'materials') total = getAllMaterials().length
    else if (category === 'fishes') total = getAllFishesFromData().length
    else if (category === 'books') total = getAllBooksFromData().length
    return { discovered: discovered.length, total }
  }

  function isDiscovered(category, name) {
    return cyclopedia.value[category]?.includes(name) || false
  }

  function getDiscoveryCount(category) {
    return cyclopedia.value[category]?.length || 0
  }

  // 统计更新
  function updateStats(key, delta) {
    stats.value[key] = (stats.value[key] || 0) + delta
    checkAchievements()
  }

  // 成就自动检查
  function checkAchievements() {
    const state = {
      stats: stats.value || {},
      farm: farm.value || [],
      level: level.value || 1,
      allClearCount: allClearCount.value || 0,
      cyclopedia: cyclopedia.value || {},
      weeklyBossDefeated: weeklyBossDefeated.value || []
    }

    for (const ach of ACHIEVEMENTS) {
      if (unlockedAchievements.value[ach.id]) continue
      let unlocked = false
      if (ach.category === 'limited') {
        unlocked = checkAchievementUnlocked(ach, state.weeklyBossDefeated)
      } else {
        unlocked = checkAchievementUnlocked(ach, state)
      }
      if (unlocked) {
        unlockedAchievements.value[ach.id] = Date.now()
        newAchievementUnlocks.value.push(ach.id)
        battleLog.value.push(`🏆 成就解锁：${ach.title}！获得 ${ach.reward?.exp || 0} 经验`)
        if (ach.reward?.exp) {
          exp.value += ach.reward.exp
          while (exp.value >= maxExp.value) {
            exp.value -= maxExp.value
            level.value++
            hp.value = maxHp.value
            atk.value += 2
            def.value += 1
            checkSkillUnlocks()
          }
        }
        saveGame()
      }
    }
  }

  // 逃跑
  function flee() {
    battleState.value = 'fled'
    battleLog.value.push('你逃跑了...')
    if (inWeeklyBoss.value) {
      // 限时Boss战斗中逃跑，直接退出
      setTimeout(() => {
        exitWeeklyBoss()
      }, 500)
      return
    }
    if (dungeonPhase.value === 'battle') {
      // 房间模式下，逃跑后房间标记为未清空，但返回房间界面
      setTimeout(() => finishRoom(false), 500)
    }
  }

  // 退出战斗
  function exitBattle() {
    inBattle.value = false
    enemy.value = null
    question.value = null
    battleLog.value = []
    battleState.value = ''
    captureMonsterData.value = null
    captureQuestions.value = []
    captureIndex.value = 0
    captureCorrectCount.value = 0
    resetCombo()
    // 清理限时Boss状态
    if (inWeeklyBoss.value) {
      inWeeklyBoss.value = false
      weeklyBossData.value = null
      weeklyBossTurn.value = 0
      if (weeklyBossTimer.value) {
        clearInterval(weeklyBossTimer.value)
        weeklyBossTimer.value = null
      }
      weeklyBossTimeLeft.value = 0
    }
    // 如果在房间模式下（战斗或已返回房间），返回房间界面
    if (dungeonPhase.value === 'battle' || dungeonPhase.value === 'rooms') {
      dungeonPhase.value = 'rooms'
      currentRoomIndex.value = -1
      enterMode(GAME_MODE.DUNGEON_ROOMS)
    } else {
      enterMode(GAME_MODE.IDLE)
    }
  }

  // 退出限时Boss战斗
  function exitWeeklyBoss() {
    inWeeklyBoss.value = false
    weeklyBossData.value = null
    weeklyBossTurn.value = 0
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
      weeklyBossTimer.value = null
    }
    weeklyBossTimeLeft.value = 0
    inBattle.value = false
    battleState.value = ''
    gameMode.value = GAME_MODE.IDLE
    return true
  }

  // 击败限时Boss
  function winWeeklyBoss() {
    battleState.value = 'won'
    inBattle.value = false
    gameMode.value = GAME_MODE.WON
    // 清除计时器
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
      weeklyBossTimer.value = null
    }
    weeklyBossTimeLeft.value = 0
    const boss = weeklyBossData.value
    if (!boss) return

    const expGain = boss.reward.exp
    const goldGain = boss.reward.gold
    exp.value += expGain
    gold.value += goldGain
    battleLog.value.push(`🎉 击败 ${boss.name}！获得 ${expGain} 经验和 ${goldGain} 金币！`)

    // 记录击败
    const key = getWeeklyBossKey(boss.id)
    if (!weeklyBossDefeated.value.includes(key)) {
      weeklyBossDefeated.value.push(key)
    }

    // 掉落材料
    if (boss.reward.material) {
      const mat = boss.reward.material
      inventory.value[mat.name] = (inventory.value[mat.name] || 0) + mat.count
      battleLog.value.push(`掉落 ${mat.count} 个 ${mat.name}！`)
    }

    // 检查升级
    while (exp.value >= maxExp.value) {
      exp.value -= maxExp.value
      level.value++
      hp.value = maxHp.value
      statPoints.value++
      if (level.value % 10 === 0) {
        const milestoneBonus = Math.floor(level.value / 10)
        atk.value += milestoneBonus
        def.value += milestoneBonus
        maxHp.value += milestoneBonus * 5
        hp.value = maxHp.value
      }
      checkSkillUnlocks()
    }

    // 记录图鉴
    if (enemy.value?.name) {
      addToCyclopedia('monsters', enemy.value.name)
    }
    updateStats('totalWins', 1)
    updateStats('totalBattles', 1)

    enterMode(GAME_MODE.WON)
    saveGame()
  }

  // ===== 限时Boss系统 =====
  function enterWeeklyBoss() {
    const boss = getWeeklyBoss()
    if (isWeeklyBossDefeated(boss.id, weeklyBossDefeated.value)) {
      return { success: false, reason: 'already_defeated' }
    }
    const scaledBoss = scaleBossForLevel(boss, level.value)
    weeklyBossData.value = scaledBoss
    weeklyBossTurn.value = 0
    inWeeklyBoss.value = true
    inBattle.value = true
    enemy.value = {
      name: scaledBoss.name,
      icon: scaledBoss.icon,
      hp: scaledBoss.hp,
      maxHp: scaledBoss.maxHp,
      atk: scaledBoss.atk,
      def: scaledBoss.def,
      subject: scaledBoss.subject,
      subjectLabel: scaledBoss.subjectLabel,
      element: scaledBoss.element,
      isBoss: true,
      skills: scaledBoss.skills
    }
    // 获取Boss专属题目
    const questions = ALL_QUESTIONS.filter(q => q.subject === scaledBoss.subject)
    const q = questions.length > 0 ? questions[Math.floor(Math.random() * questions.length)] : ALL_QUESTIONS[Math.floor(Math.random() * ALL_QUESTIONS.length)]
    question.value = q
    battleLog.value = [`👹 限时Boss「${scaledBoss.name}」出现！`, `⏱️ 每题限时 ${scaledBoss.timeLimit} 秒！`]
    battleState.value = 'idle'
    weeklyBossSkillUsed.value = []
    // 启动倒计时
    startWeeklyBossTimer()
    enterMode(GAME_MODE.WEEKLY_BOSS)
    return { success: true }
  }

  function weeklyBossAnswerAttack(correct) {
    if (!enemy.value) return
    // 清除计时器
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
      weeklyBossTimer.value = null
    }
    weeklyBossTurn.value++
    weeklyBossSkillUsed.value = []

    // 检查Boss技能触发
    const bossSkills = enemy.value.skills || []
    for (const skill of bossSkills) {
      if (skill.cooldown > 0 && weeklyBossTurn.value % skill.cooldown === 0) {
        weeklyBossSkillUsed.value.push(skill)
        applyBossSkill(skill)
      }
    }

    // 开发者模式：自动答对+秒杀
    if (devMode.value) {
      sfxCorrect()
      battleLog.value.push('💠 [Dev] 开发者模式：自动命中，秒杀Boss！')
      enemy.value.hp = 0
      consecutiveCorrect.value++
      updateStats('totalCorrect', 1)
      winWeeklyBoss()
      return
    }

    if (correct) {
      consecutiveCorrect.value++
      comboCount.value = consecutiveCorrect.value
      sfxCorrect()

      const elementEffect = checkElementCounter(activeMonster.value?.element, enemy.value.element)
      let multiplier = 1.5 * (elementEffect?.multiplier || 1.0)
      const comboMultiplier = 1 + consecutiveCorrect.value * 0.5
      multiplier *= comboMultiplier

      const damage = Math.max(1, Math.floor((totalAtk.value - enemy.value.def) * multiplier))
      enemy.value.hp -= damage

      let logMsg = ''
      if (consecutiveCorrect.value >= 3) {
        // 三连暴击：先更新 maxCombo 统计，再重置连击
        if (consecutiveCorrect.value > stats.value.maxCombo) {
          stats.value.maxCombo = consecutiveCorrect.value
        }
        logMsg = `⚡ 知识连击x${consecutiveCorrect.value}！造成 ${damage} 点伤害！`
        triggerCriticalEffect()
        sfxCritical()
        resetCombo()
      } else if (consecutiveCorrect.value === 2) {
        logMsg = `🔥 连击x2！造成 ${damage} 点伤害！`
      } else {
        logMsg = `🧠 知识攻击命中！造成 ${damage} 点伤害！`
      }
      if (elementEffect?.desc) logMsg += ` ${elementEffect.desc}`
      battleLog.value.push(logMsg)

      updateStats('totalCorrect', 1)
      if (consecutiveCorrect.value > stats.value.maxCombo) {
        stats.value.maxCombo = consecutiveCorrect.value
      }

      if (enemy.value.hp <= 0) {
        winWeeklyBoss()
      } else {
        battleState.value = 'idle'
        const questions = ALL_QUESTIONS.filter(q => q.subject === enemy.value.subject)
        let q = null
        if (questions.length > 0) {
          q = questions[Math.floor(Math.random() * questions.length)]
        } else if (ALL_QUESTIONS.length > 0) {
          q = ALL_QUESTIONS[Math.floor(Math.random() * ALL_QUESTIONS.length)]
        }
        if (q) {
          question.value = q
          // 重启倒计时给下一题
          startWeeklyBossTimer()
        }
      }
    } else {
      resetCombo()
      sfxWrong()
      battleLog.value.push('回答错误！受到反噬！')
      recordWrongQuestion(question.value, -1)
      // 限时Boss：答错Boss也会攻击
      enemyAttack()
      // 如果战斗未结束，继续下一题
      if (battleState.value !== 'lost' && enemy.value) {
        battleState.value = 'idle'
        const questions = ALL_QUESTIONS.filter(q => q.subject === enemy.value.subject)
        let q = null
        if (questions.length > 0) {
          q = questions[Math.floor(Math.random() * questions.length)]
        } else if (ALL_QUESTIONS.length > 0) {
          q = ALL_QUESTIONS[Math.floor(Math.random() * ALL_QUESTIONS.length)]
        }
        if (q) {
          question.value = q
          startWeeklyBossTimer()
        }
      }
    }
  }

  function startWeeklyBossTimer() {
    const boss = weeklyBossData.value
    if (!boss) return
    weeklyBossTimeLeft.value = boss.timeLimit
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
    }
    weeklyBossTimer.value = setInterval(() => {
      weeklyBossTimeLeft.value--
      if (weeklyBossTimeLeft.value <= 0) {
        clearInterval(weeklyBossTimer.value)
        weeklyBossTimer.value = null
        // 超时算答错
        weeklyBossAnswerAttack(false)
      }
    }, 1000)
  }

  function applyBossSkill(skill) {
    if (!skill) return
    battleLog.value.push(`👹 ${enemy.value.name} 使用 ${skill.name}！${skill.desc}`)
    // 应用技能效果
    if (skill.effect === 'heal') {
      enemy.value.hp = Math.min(enemy.value.maxHp, enemy.value.hp + skill.value)
      battleLog.value.push(`${enemy.value.name} 恢复了 ${skill.value} 点生命！`)
    } else if (skill.effect === 'buff') {
      enemy.value.atk += skill.value
      battleLog.value.push(`${enemy.value.name} 攻击力提升了 ${skill.value} 点！`)
    } else if (skill.effect === 'debuff') {
      atk.value -= skill.value
      battleLog.value.push(`你的攻击力降低了 ${skill.value} 点！`)
    } else if (skill.effect === 'shield') {
      enemy.value.def += skill.value
      battleLog.value.push(`${enemy.value.name} 防御力提升了 ${skill.value} 点！`)
    }
  }

  // ===== 地牢系统 =====
  // 进入地牢准备
  function enterDungeonPrep() {
    // 后台启动题库加载（不阻塞）
    ensureQuestionsForFloor(floor.value)
    actuallyEnterDungeonPrep()
  }

  function actuallyEnterDungeonPrep() {
    enterMode(GAME_MODE.DUNGEON_PREP)
    dungeonPhase.value = 'prep'
    currentFloorElement.value = (() => {
      const elements = Object.keys(DUNGEON_ELEMENTS)
      return elements[Math.floor(Math.random() * elements.length)]
    })()
    generateRoomPreviews()
    saveGame()
  }

  // 生成房间预览
  function generateRoomPreviews() {
    const floorNum = floor.value
    const element = currentFloorElement.value
    const enemyList = getEnemyForFloor(floorNum, element)
    const rooms = []
    const used = new Set()
    for (let i = 0; i < 9; i++) {
      let e
      do { e = enemyList[Math.floor(Math.random() * enemyList.length)] } while (used.has(e.name) && used.size < enemyList.length)
      used.add(e.name)
      rooms.push({
        index: i,
        enemyPreview: e,
        cleared: false,
        isBoss: false
      })
    }
    const bossIdx = Math.floor(Math.random() * 9)
    bossRoomIndex.value = bossIdx
    rooms[bossIdx].isBoss = true
    rooms[bossIdx].enemyPreview = getBossForFloor(floorNum, element)
    roomGrid.value = rooms
    clearedRoomsThisFloor.value = 0
    currentRoomIndex.value = -1
  }

  // 进入指定房间战斗
  // 进入指定房间战斗
  function enterRoom(roomIndex) {
    const room = roomGrid.value[roomIndex]
    if (!room || room.cleared) return

    // 触发后台题库加载（不阻塞进入房间）
    ensureQuestionsForFloor(floor.value)

    actuallyEnterRoom(roomIndex)
  }

  function actuallyEnterRoom(roomIndex) {
    const room = roomGrid.value[roomIndex]
    if (!room || room.cleared) return

    currentRoomIndex.value = roomIndex
    dungeonPhase.value = 'battle'

    const preview = room.enemyPreview
    const el = DUNGEON_ELEMENTS[preview.element] || DUNGEON_ELEMENTS.water
    // 生成实际的敌人实例
    enemy.value = {
      name: preview.name,
      icon: preview.icon,
      hp: preview.hp,
      maxHp: preview.hp,
      atk: preview.atk,
      def: preview.def || 0,
      subject: preview.subject,
      element: preview.element,
      subjectLabel: preview.subject === 'chem' ? '化学' : preview.subject === 'bio' ? '生物' : '易学',
      elementLabel: el.name
    }

    // 获取题目
    const q = getQuestionsForFloor(floor.value, 1, playerSpecialization.value)[0]
    question.value = q

    battleLog.value = [`${room.isBoss ? '👹 BOSS战！' : ''}遭遇 ${preview.name}！`]
    battleState.value = 'idle'
    inBattle.value = true
    enterMode(GAME_MODE.BATTLE)
  }

  // 完成房间战斗
  function finishRoom(cleared) {
    if (currentRoomIndex.value < 0) return

    const room = roomGrid.value[currentRoomIndex.value]
    if (room) {
      room.cleared = cleared
      if (cleared) clearedRoomsThisFloor.value++
    }

    // 检查"我全都要"成就
    const allCleared = roomGrid.value.every(r => r.cleared)
    if (allCleared) {
      allClearCount.value++
      if (allClearCount.value >= 10) {
        battleLog.value.push('🏆 解锁成就：我全都要！（连续10层清空所有房间）')
      }
    }

    currentRoomIndex.value = -1
    inBattle.value = false
    enemy.value = null
    question.value = null
    // 不覆盖 captureSuccess/captureFail 状态，让用户能看到结果面板
    if (battleState.value !== 'captureSuccess' && battleState.value !== 'captureFail') {
      battleState.value = ''
    }
    resetCombo()

    dungeonPhase.value = 'rooms'
    gameMode.value = GAME_MODE.DUNGEON_ROOMS
    saveGame()
  }

  // 进入下一层（必须击败 Boss）
  function nextFloor() {
    const bossRoom = roomGrid.value[bossRoomIndex.value]
    if (!bossRoom || !bossRoom.cleared) {
      return false
    }
    const allCleared = roomGrid.value.every(r => r.cleared)
    if (!allCleared) {
      hasSkippedRoom.value = true
    }
    floor.value++
    dungeonPhase.value = 'prep'
    enterMode(GAME_MODE.DUNGEON_PREP)
    currentFloorElement.value = (() => {
      const elements = Object.keys(DUNGEON_ELEMENTS)
      return elements[Math.floor(Math.random() * elements.length)]
    })()
    generateRoomPreviews()
    return true
  }

  // 退出地牢
  function exitDungeon() {
    dungeonPhase.value = 'none'
    roomGrid.value = []
    bossRoomIndex.value = -1
    currentRoomIndex.value = -1
    inBattle.value = false
    enemy.value = null
    question.value = null
    battleState.value = ''
    resetCombo()
    enterMode(GAME_MODE.IDLE)
    saveGame()
  }

  // ===== 钓鱼系统 =====
  // 记录捕获
  function recordFishCatch(fish) {
    if (!fish) return
    recentCatches.value.unshift(fish)
    if (recentCatches.value.length > 50) {
      recentCatches.value.pop()
    }
    fishCollection.value[fish.name] = (fishCollection.value[fish.name] || 0) + 1
    updateStats('totalFishes', 1)
    addToCyclopedia('fishes', fish.name)
  }

  // 从记录中移除鱼（吃掉了）
  function removeFishFromRecent(fish) {
    if (!fish) return
    const idx = recentCatches.value.findIndex(f => f.name === fish.name)
    if (idx !== -1) {
      recentCatches.value.splice(idx, 1)
    }
    if (fishCollection.value[fish.name]) {
      fishCollection.value[fish.name]--
      if (fishCollection.value[fish.name] <= 0) {
        delete fishCollection.value[fish.name]
      }
    }
  }

  // 开始研读
  function startBookStudy() {
    const q = getQuestionsForFloor(Math.max(1, floor.value - 2), 1, playerSpecialization.value)[0]
    if (!q) return false
    bookStudyQuestion.value = q
    bookStudyMode.value = true
    return true
  }

  // 提交研读答案
  function submitBookStudyAnswer(index) {
    if (!bookStudyQuestion.value) return { correct: false, error: 'no_question' }
    // 开发者模式：自动答对
    const correct = devMode.value ? true : (index === bookStudyQuestion.value.answer)
    bookStudyMode.value = false
    if (correct) {
      // 答对：加经验，古籍收入收藏
      const expGain = 25
      exp.value += expGain
      // 检查升级
      while (exp.value >= maxExp.value) {
        exp.value -= maxExp.value
        level.value++
        // maxExp 是 computed(level)，level++ 后自动重算，无需手动赋值
        hp.value = maxHp.value
        atk.value += 2
        def.value += 1
      }
      bookStudyQuestion.value = null
      saveGame()
      return { correct: true, expGain }
    } else {
      // 答错：古籍跑了，但没有任何限制，下次钓鱼还能再遇到
      bookStudyQuestion.value = null
      saveGame()
      return { correct: false }
    }
  }

  // 取消研读
  function cancelBookStudy() {
    bookStudyQuestion.value = null
    bookStudyMode.value = false
  }

  // 钓鱼次数检查 — 每5次需要答题一次（周期性，非永久解锁）
  function canFishToday() {
    if (dailyFishCount.value < 5) return { allowed: true, reason: null }
    return { allowed: false, reason: 'limit_reached' }
  }

  // 解锁钓鱼限制（答题通过）— 重置计数，开始新一轮5次
  function unlockFishLimit() {
    dailyFishCount.value = 0 // 重置计数，开始新一轮
    saveGame()
  }

  // ===== 存档系统 =====
  function saveGame() {
    const saveData = {
      gameStarted: gameStarted.value,
      activeTab: activeTab.value,
      level: level.value,
      exp: exp.value,
      maxExp: maxExp.value,
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
      equipment: equipment.value,
      consumables: consumables.value,
      equipped: equipped.value,
      inventory: inventory.value,
      farm: farm.value,
      activeMonster: activeMonster.value,
      cyclopedia: cyclopedia.value,
      stats: stats.value,
      unlockedAchievements: unlockedAchievements.value,
      fishingLevel: fishingLevel.value,
      recentCatches: recentCatches.value,
      fishCollection: fishCollection.value,
      bookStudyQuestion: bookStudyQuestion.value,
      bookStudyMode: bookStudyMode.value,
      dailyFishCount: dailyFishCount.value,
      fishLimitUnlocked: fishLimitUnlocked.value,
      wrongQuestions: wrongQuestions.value,
      reviewMode: reviewMode.value,
      reviewCurrent: reviewCurrent.value,
      reviewIndex: reviewIndex.value,
      reviewPool: reviewPool.value,
      reviewResults: reviewResults.value,
      // 地牢房间系统
      dungeonPhase: dungeonPhase.value,
      roomGrid: roomGrid.value,
      bossRoomIndex: bossRoomIndex.value,
      currentRoomIndex: currentRoomIndex.value,
      allClearCount: allClearCount.value,
      clearedRoomsThisFloor: clearedRoomsThisFloor.value,
      hasSkippedRoom: hasSkippedRoom.value,
      currentFloorElement: currentFloorElement.value,
      firstVisit: firstVisit.value,
      // 属性点系统
      statPoints: statPoints.value,
      atkPoints: atkPoints.value,
      defPoints: defPoints.value,
      hpPoints: hpPoints.value,
      activeBuffs: activeBuffs.value,
      // 限时Boss
      weeklyBossDefeated: weeklyBossDefeated.value,
      inBattle: inBattle.value,
      battleState: battleState.value,
      // 状态机（v8.0）
      gameMode: gameMode.value,
      // 开发者模式
      playerSpecialization: playerSpecialization.value,
      devMode: devMode.value,
      // 专精技能
      specializationSkills: specializationSkills.value,
      // 题目去重状态
      usedQuestions: exportUsedQuestions ? exportUsedQuestions() : [],
      timestamp: Date.now()
    }

    localStorage.setItem('bio_yi_realm_save', JSON.stringify(saveData))
    console.log('存档已保存')
  }

  function loadGame() {
    try {
      const saveStr = localStorage.getItem('bio_yi_realm_save')
      if (!saveStr) return false

      const saveData = JSON.parse(saveStr)

      // 加载玩家状态
      gameStarted.value = saveData.gameStarted || false
      activeTab.value = saveData.activeTab || 'dungeon'
      level.value = saveData.level || 1
      exp.value = saveData.exp || 0
      maxHp.value = saveData.maxHp || 100
      hp.value = saveData.hp || maxHp.value
      atk.value = saveData.atk || 10
      def.value = saveData.def || 5
      gold.value = saveData.gold || 0
      floor.value = saveData.floor || 1
      title.value = saveData.title || '菜鸟学徒'
      titleData.value = saveData.titleData || getTitleForLevel(1)
      titleBio.value = saveData.titleBio || '刚踏入知识领域的初学者，对一切都充满好奇。'
      titleEra.value = saveData.titleEra || '远古'
      titleField.value = saveData.titleField || '化学'
      titleAchievements.value = saveData.titleAchievements || []
      statPoints.value = saveData.statPoints || 0
      atkPoints.value = saveData.atkPoints || 0
      defPoints.value = saveData.defPoints || 0
      hpPoints.value = saveData.hpPoints || 0
      activeBuffs.value = saveData.activeBuffs || []

      // 加载装备和物品
      equipment.value = saveData.equipment || []
      consumables.value = saveData.consumables || []
      equipped.value = saveData.equipped || { weapon: null, armor: null, accessory: null }
      inventory.value = saveData.inventory || {}
      farm.value = saveData.farm || []
      activeMonster.value = saveData.activeMonster || null

      // 加载钓鱼系统
      fishingLevel.value = saveData.fishingLevel || 1
      recentCatches.value = saveData.recentCatches || []
      fishCollection.value = saveData.fishCollection || {}
      bookStudyQuestion.value = saveData.bookStudyQuestion || null
      bookStudyMode.value = saveData.bookStudyMode || false
      dailyFishCount.value = saveData.dailyFishCount || 0
      fishLimitUnlocked.value = saveData.fishLimitUnlocked || false

      // 加载地牢房间系统状态
      dungeonPhase.value = saveData.dungeonPhase || 'none'
      roomGrid.value = saveData.roomGrid || []
      bossRoomIndex.value = saveData.bossRoomIndex || -1
      currentRoomIndex.value = saveData.currentRoomIndex || -1
      allClearCount.value = saveData.allClearCount || 0
      clearedRoomsThisFloor.value = saveData.clearedRoomsThisFloor || 0
      hasSkippedRoom.value = saveData.hasSkippedRoom || false
      currentFloorElement.value = saveData.currentFloorElement || 'water'
      firstVisit.value = saveData.firstVisit !== undefined ? saveData.firstVisit : true
      cyclopedia.value = saveData.cyclopedia || {}
      stats.value = saveData.stats || { totalCorrect: 0, totalWrong: 0, maxCombo: 0, maxFloor: 1, totalBattles: 0, totalWins: 0, totalFishes: 0, totalForges: 0 }
      unlockedAchievements.value = typeof saveData.unlockedAchievements === 'object' && !Array.isArray(saveData.unlockedAchievements) ? saveData.unlockedAchievements : (Array.isArray(saveData.unlockedAchievements) ? Object.fromEntries(saveData.unlockedAchievements.map(id => [id, Date.now()])) : {})
      // 加载战斗状态（v8.0 兼容旧存档）
      inBattle.value = saveData.inBattle || false
      battleState.value = saveData.battleState || ''
      // 加载限时Boss记录
      weeklyBossDefeated.value = saveData.weeklyBossDefeated || []
      weeklyBossData.value = saveData.weeklyBossData || null
      weeklyBossTurn.value = saveData.weeklyBossTurn || 0
      weeklyBossTimeLeft.value = saveData.weeklyBossTimeLeft || 0

      playerSpecialization.value = saveData.playerSpecialization || null
      // 专精技能
      specializationSkills.value = saveData.specializationSkills || []
      // 开发者模式
      devMode.value = saveData.devMode || false

      // 状态机（v8.0）— 兼容旧存档
      gameMode.value = saveData.gameMode || GAME_MODE.IDLE
      // 旧存档兼容：根据旧状态推断 gameMode
      if (!saveData.gameMode) {
        if (inBattle.value) {
          if (weeklyBossData.value) gameMode.value = GAME_MODE.WEEKLY_BOSS
          else if (dungeonPhase.value === 'battle') gameMode.value = GAME_MODE.BATTLE
        } else if (dungeonPhase.value === 'prep') {
          gameMode.value = GAME_MODE.DUNGEON_PREP
        } else if (dungeonPhase.value === 'rooms') {
          gameMode.value = GAME_MODE.DUNGEON_ROOMS
        }
      }

      // 加载错题本
      loadWrongQuestions()
      // 加载题目去重状态
      importUsedQuestions(saveData.usedQuestions)

      // 恢复错题复习状态（会话级数据，仅当存档中存在时恢复）
      if (saveData.reviewMode !== undefined) {
        reviewMode.value = saveData.reviewMode
        reviewCurrent.value = saveData.reviewCurrent || null
        reviewIndex.value = saveData.reviewIndex || 0
        reviewPool.value = saveData.reviewPool || []
        reviewResults.value = saveData.reviewResults || []
      }

      return true
    } catch (e) {
      console.error('存档加载失败:', e)
      return false
    }
  }

  function hasSave() {
    return !!localStorage.getItem('bio_yi_realm_save')
  }

  function deleteSave() {
    localStorage.removeItem('bio_yi_realm_save')
    // 重置所有状态
    gameStarted.value = false
    level.value = 1
    exp.value = 0
    hp.value = 100
    maxHp.value = 100
    atk.value = 10
    def.value = 5
    gold.value = 0
    floor.value = 1
    title.value = '菜鸟学徒'
    equipment.value = []
    consumables.value = []
    equipped.value = { weapon: null, armor: null, accessory: null }
    inventory.value = {}
    farm.value = []
    activeMonster.value = null
    cyclopedia.value = {}
    stats.value = { totalCorrect: 0, totalWrong: 0, maxCombo: 0, maxFloor: 1, totalBattles: 0, totalWins: 0, totalFishes: 0, totalForges: 0 }
    unlockedAchievements.value = {}
    fishingLevel.value = 1
    recentCatches.value = []
    fishCollection.value = {}
    bookStudyQuestion.value = null
    bookStudyMode.value = false
    dailyFishCount.value = 0
    fishLimitUnlocked.value = false
    dungeonPhase.value = 'none'
    roomGrid.value = []
    bossRoomIndex.value = -1
    currentRoomIndex.value = -1
    allClearCount.value = 0
    clearedRoomsThisFloor.value = 0
    hasSkippedRoom.value = false
    currentFloorElement.value = 'water'
    firstVisit.value = true
    wrongQuestions.value = []
    reviewMode.value = false
    reviewCurrent.value = null
    reviewIndex.value = 0
    reviewPool.value = []
    reviewResults.value = []
    inBattle.value = false
    battleState.value = ''
    enemy.value = null
    question.value = null
    battleLog.value = []
    activeBuffs.value = []
    drop.value = null
    captureMonsterData.value = null
    captureQuestions.value = []
    captureIndex.value = 0
    captureCorrectCount.value = 0
    comboCount.value = 0
    comboActive.value = false
    consecutiveCorrect.value = 0
    weeklyBossDefeated.value = []
    weeklyBossData.value = null
    weeklyBossTurn.value = 0
    weeklyBossTimeLeft.value = 0
    weeklyBossSkillUsed.value = []
    if (weeklyBossTimer.value) {
      clearInterval(weeklyBossTimer.value)
      weeklyBossTimer.value = null
    }
    devMode.value = false
    gameMode.value = GAME_MODE.IDLE
    saveGame()
  }

  return {
    // 状态机（v8.0）
    gameMode, GAME_MODE, enterMode, isCombatMode, isPanelMode,
    // 开发者模式
    playerSpecialization, setSpecialization,
    isLoadingQuestions, questionsLoaded, loadProgress,
    devMode, toggleDevMode,
    // 专精技能系统
    specializationSkills, newSkillUnlock, skillUnlockQueue,
    checkSkillUnlocks, consumeSkillUnlock, isSkillUnlocked,
    gameStarted, activeTab, inBattle, battleState,
    level, exp, maxExp, hp, maxHp, atk, def, gold, floor, title, titleData, titleBio, titleEra, titleField, titleAchievements,
    enemy, question, battleLog,
    equipment, consumables, equipped, inventory,
    farm, activeMonster, captureMonsterData, captureQuestions, captureIndex, captureCorrectCount,
    drop,
    comboCount, comboActive, consecutiveCorrect,
    cyclopedia, newDiscoveries, stats,
    unlockedAchievements, newAchievementUnlocks,
    fishingLevel, recentCatches, fishCollection,
    bookStudyQuestion, bookStudyMode,
    dailyFishCount, fishLimitUnlocked,
    wrongQuestions, wrongStats, reviewMode, reviewCurrent, reviewIndex, reviewPool, reviewResults,
    dungeonPhase, roomGrid, bossRoomIndex, currentRoomIndex, allClearCount, clearedRoomsThisFloor, hasSkippedRoom,
    currentFloorElement, showTutorial, firstVisit,
    expPercent, hpPercent, monsterBonus, totalAtk, totalDef,
    // 属性点
    statPoints, atkPoints, defPoints, hpPoints, activeBuffs,
    // 限时Boss
    inWeeklyBoss, weeklyBossData, weeklyBossTurn, weeklyBossTimeLeft, weeklyBossSkillUsed, weeklyBossDefeated,
    startGame, setTab,
    initBattle, enemyAttack, answerAttack, usePotion, winBattle, flee, exitBattle,
    startCapture, submitCaptureAnswer, skipCapture,
    enterDungeonPrep, generateRoomPreviews, enterRoom, finishRoom, nextFloor, exitDungeon,
    setFollowMonster, unfollowMonster, upgradeMonster, releaseMonster,
    equip, addItem, addMaterial,
    forgeItem,
    buyItem,
    claimDrop,
    recordFishCatch, removeFishFromRecent,
    startBookStudy, submitBookStudyAnswer, cancelBookStudy,
    canFishToday, unlockFishLimit,
    addToCyclopedia, getCyclopediaProgress, isDiscovered, getDiscoveryCount,
    updateStats, checkAchievements,
    recordWrongQuestion, masterQuestion, removeWrongQuestion,
    startReview, submitReviewAnswer, exitReview,
    saveGame, loadGame, hasSave, deleteSave,
    // 属性点分配
    allocateStat, resetStats,
    // 限时Boss
    enterWeeklyBoss, weeklyBossAnswerAttack, winWeeklyBoss, exitWeeklyBoss, startWeeklyBossTimer
  }
})
