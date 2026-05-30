import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ALL_QUESTIONS, getQuestionsForFloor } from '../data/questions.js'
import { ENEMIES, getEnemyForFloor } from '../data/enemies.js'
import { 
  createFarmMonster, 
  generateMonsterAbility, 
  getUpgradeMaterialName, 
  checkElementCounter,
  ELEMENT_SUBJECT_MAP,
  FARM_MAX_CAPACITY,
  DUNGEON_ELEMENTS
} from '../data/farm.js'

const SAVE_KEY = 'bioyi_realm_save'

export const useGameStore = defineStore('game', () => {
  // 游戏状态
  const gameStarted = ref(false)
  const activeTab = ref('dungeon')

  // 玩家属性
  const level = ref(1)
  const exp = ref(0)
  const maxExp = ref(100)
  const hp = ref(100)
  const maxHp = ref(100)
  const atk = ref(15)
  const def = ref(8)
  const gold = ref(0)
  const floor = ref(1)
  const title = ref('初入易门')

  // 战斗状态
  const inBattle = ref(false)
  const enemy = ref(null)
  const question = ref(null)
  const battleLog = ref([])
  const battleState = ref('') // 'idle', 'answering', 'won', 'lost', 'fled', 'capture', 'captureQuiz'

  // 背包
  const equipment = ref([])
  const consumables = ref([])
  const equipped = ref({ weapon: null, armor: null, accessory: null })
  
  // 材料背包
  const inventory = ref({}) // { '水之精华': 5, '火焰核心': 3, ... }

  // 农场系统
  const farm = ref([])
  const activeMonster = ref(null)
  
  // 捕捉状态
  const captureMonsterData = ref(null) // 待捕捉的怪物数据
  const captureQuestion = ref(null) // 捕捉答题题目

  // 计算属性
  const expPercent = computed(() => (exp.value / maxExp.value) * 100)
  const hpPercent = computed(() => (hp.value / maxHp.value) * 100)
  const monsterBonus = computed(() => {
    if (!activeMonster.value) return { atkBonus: 0, defBonus: 0 }
    return activeMonster.value.ability || { atkBonus: 0, defBonus: 0 }
  })
  const totalAtk = computed(() => {
    let base = atk.value + (equipped.value.weapon?.atk || 0)
    base += monsterBonus.value.atkBonus || 0
    return base
  })
  const totalDef = computed(() => {
    let base = def.value + (equipped.value.armor?.def || 0) + (equipped.value.accessory?.def || 0)
    base += monsterBonus.value.defBonus || 0
    return base
  })

  // 开始游戏
  function startGame() {
    gameStarted.value = true
    // 初始测试材料（方便体验）
    inventory.value = {
      '水之精华': 5,
      '火焰核心': 3,
      '酸液结晶': 2,
      '雷电石': 4,
      '冰霜碎片': 3,
      '风之羽毛': 2
    }
    saveGame()
  }

  // 切换标签页
  function setTab(tab) {
    activeTab.value = tab
  }

  // 初始化战斗
  function initBattle() {
    const e = getEnemyForFloor(floor.value)
    const q = getQuestionsForFloor(floor.value, 1)[0]
    
    const el = DUNGEON_ELEMENTS[e.element] || DUNGEON_ELEMENTS.water
    enemy.value = { 
      ...e, 
      maxHp: e.hp, 
      subjectLabel: e.subject === 'chem' ? '化学' : e.subject === 'bio' ? '生物' : '易学',
      elementLabel: el.name
    }
    question.value = q
    battleLog.value = [`遭遇 ${e.name}！`]
    battleState.value = 'idle'
    inBattle.value = true
  }

  // 攻击
  function attack() {
    if (!enemy.value || battleState.value !== 'idle') return
    
    // 计算元素克制
    const elementEffect = checkElementCounter(activeMonster.value?.element, enemy.value.element)
    let multiplier = elementEffect?.multiplier || 1.0
    
    const damage = Math.max(1, Math.floor((totalAtk.value - enemy.value.def) * multiplier))
    enemy.value.hp -= damage
    
    let logMsg = `你对 ${enemy.value.name} 造成 ${damage} 点伤害！`
    if (elementEffect?.desc) logMsg += ` ${elementEffect.desc}`
    battleLog.value.push(logMsg)
    
    if (enemy.value.hp <= 0) {
      winBattle()
    } else {
      enemyAttack()
    }
  }

  // 敌人攻击
  function enemyAttack() {
    // 检查玩家元素是否克制敌人（减少伤害）
    const elementEffect = checkElementCounter(enemy.value.element, activeMonster.value?.element)
    let multiplier = elementEffect?.multiplier || 1.0
    // 如果敌人克制玩家，伤害增加；如果被克制，伤害减少
    if (elementEffect && elementEffect.desc === '被克制...') {
      multiplier = 0.7  // 敌人被克制，对玩家伤害减少
    } else if (elementEffect && elementEffect.desc === '克制！') {
      multiplier = 1.5  // 敌人克制玩家，对玩家伤害增加
    } else {
      multiplier = 1.0
    }
    
    const damage = Math.max(1, Math.floor((enemy.value.atk - totalDef.value) * multiplier))
    hp.value -= damage
    battleLog.value.push(`${enemy.value.name} 对你造成 ${damage} 点伤害！`)
    
    if (hp.value <= 0) {
      hp.value = 0
      battleState.value = 'lost'
      battleLog.value.push('你倒下了...')
    }
  }

  // 答题攻击
  function answerAttack(correct) {
    if (!enemy.value) return
    
    if (correct) {
      // 计算元素克制
      const elementEffect = checkElementCounter(activeMonster.value?.element, enemy.value.element)
      let multiplier = 1.5 * (elementEffect?.multiplier || 1.0)
      
      const damage = Math.max(1, Math.floor((totalAtk.value - enemy.value.def) * multiplier))
      enemy.value.hp -= damage
      
      let logMsg = `回答正确！造成 ${damage} 点暴击伤害！`
      if (elementEffect?.desc) logMsg += ` ${elementEffect.desc}`
      battleLog.value.push(logMsg)
      
      if (enemy.value.hp <= 0) {
        winBattle()
      } else {
        battleState.value = 'idle'
      }
    } else {
      battleLog.value.push('回答错误！受到反噬！')
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
      atk.value += item.bonusAtk
      battleLog.value.push(`使用 ${item.name}，攻击力提升 ${item.bonusAtk} 点！`)
    }
    
    consumables.value.splice(idx, 1)
    saveGame()
    return true
  }

  // 胜利（触发捕捉流程）
  function winBattle() {
    battleState.value = 'won'
    const expGain = Math.floor(20 * (1 + floor.value * 0.1))
    const goldGain = Math.floor(10 * (1 + floor.value * 0.1))
    
    exp.value += expGain
    gold.value += goldGain
    battleLog.value.push(`击败 ${enemy.value.name}！获得 ${expGain} 经验和 ${goldGain} 金币！`)
    
    // 检查升级
    while (exp.value >= maxExp.value) {
      exp.value -= maxExp.value
      level.value++
      maxExp.value = Math.floor(maxExp.value * 1.2)
      hp.value = maxHp.value
      atk.value += 2
      def.value += 1
      battleLog.value.push(`升级了！到达 ${level.value} 级！`)
    }
    
    // 材料掉落（根据敌人元素）
    const matName = getUpgradeMaterialName(enemy.value.element)
    const matDrop = Math.floor(1 + floor.value * 0.3)
    inventory.value[matName] = (inventory.value[matName] || 0) + matDrop
    battleLog.value.push(`掉落 ${matDrop} 个 ${matName}！`)
    
    // 自动存档
    saveGame()
    
    // 检查是否可以捕捉
    if (farm.value.length < FARM_MAX_CAPACITY) {
      const alreadyHas = farm.value.some(m => m.name === enemy.value.name)
      if (!alreadyHas) {
        // 准备捕捉数据
        captureMonsterData.value = {
          name: enemy.value.name,
          icon: enemy.value.icon || enemy.value.name.charAt(0),
          element: enemy.value.element,
          baseHp: enemy.value.maxHp,
          baseAtk: enemy.value.atk,
          baseDef: enemy.value.def,
          captureFloor: floor.value
        }
        // 楼层递增在捕捉完成后进行
        return
      }
    }
    
    // 不能捕捉，直接递增楼层
    floor.value++
  }

  // 开始捕捉流程
  function startCapture() {
    if (!captureMonsterData.value) return
    
    // 获取捕捉题目（按怪物元素对应的学科）
    const subject = ELEMENT_SUBJECT_MAP[captureMonsterData.value.element] || 'chem'
    const questions = ALL_QUESTIONS.filter(q => q.subject === subject && q.diff === 'medium')
    if (questions.length > 0) {
      captureQuestion.value = questions[Math.floor(Math.random() * questions.length)]
    } else {
      captureQuestion.value = ALL_QUESTIONS[Math.floor(Math.random() * ALL_QUESTIONS.length)]
    }
    
    battleState.value = 'captureQuiz'
  }

  // 提交捕捉答题
  function submitCaptureAnswer(index) {
    if (!captureQuestion.value || !captureMonsterData.value) return
    
    const correct = index === captureQuestion.value.answer
    if (correct) {
      // 捕捉成功
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
    } else {
      battleLog.value.push('答题失败，怪物逃跑了...')
      battleState.value = 'captureFail'
    }
    
    // 递增楼层
    floor.value++
    captureMonsterData.value = null
    captureQuestion.value = null
  }

  // 跳过捕捉
  function skipCapture() {
    captureMonsterData.value = null
    captureQuestion.value = null
    battleState.value = 'idle'
    floor.value++
    exitBattle()
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
    if (!m) return
    
    // 检查经验是否足够
    if (m.exp < m.maxExp) {
      // 检查材料
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
    } else {
      // 经验足够，消耗经验升级
      m.exp -= m.maxExp
    }
    
    // 升级
    m.level++
    m.maxExp = Math.floor(50 * Math.pow(1.3, m.level - 1))
    
    // 重新计算能力
    const newAbility = generateMonsterAbility(m.element, m.captureFloor)
    const levelMultiplier = 1 + (m.level - 1) * 0.2
    newAbility.atkBonus = Math.floor(newAbility.atkBonus * levelMultiplier)
    newAbility.defBonus = Math.floor(newAbility.defBonus * levelMultiplier)
    newAbility.desc = `攻击+${newAbility.atkBonus} 防御+${newAbility.defBonus}`
    m.ability = newAbility
    
    saveGame()
    return true
  }

  // 放生怪物
  function releaseMonster(idx) {
    const m = farm.value[idx]
    if (!m) return
    
    // 如果放生的是当前跟随的怪物，取消跟随
    if (activeMonster.value && activeMonster.value.name === m.name) {
      activeMonster.value = null
    }
    
    // 获得材料回报
    const returnMat = getUpgradeMaterialName(m.element)
    inventory.value[returnMat] = (inventory.value[returnMat] || 0) + Math.floor(m.level)
    
    farm.value.splice(idx, 1)
    saveGame()
  }

  // 逃跑
  function flee() {
    battleState.value = 'fled'
    battleLog.value.push('你逃跑了...')
  }

  // 退出战斗
  function exitBattle() {
    inBattle.value = false
    enemy.value = null
    question.value = null
    battleLog.value = []
    battleState.value = ''
    captureMonsterData.value = null
    captureQuestion.value = null
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
  }

  // 获取物品
  function addItem(item) {
    if (item.type === 'potion') {
      consumables.value.push(item)
    } else {
      equipment.value.push(item)
    }
  }

  // 添加材料
  function addMaterial(name, count) {
    inventory.value[name] = (inventory.value[name] || 0) + count
  }

  // 保存游戏
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
      equipment: equipment.value,
      consumables: consumables.value,
      equipped: equipped.value,
      inventory: inventory.value,
      farm: farm.value,
      activeMonster: activeMonster.value,
      timestamp: Date.now()
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    return true
  }

  // 加载游戏
  function loadGame() {
    const saveStr = localStorage.getItem(SAVE_KEY)
    if (!saveStr) return false
    
    try {
      const saveData = JSON.parse(saveStr)
      
      gameStarted.value = saveData.gameStarted || false
      activeTab.value = saveData.activeTab || 'dungeon'
      level.value = saveData.level || 1
      exp.value = saveData.exp || 0
      maxExp.value = saveData.maxExp || 100
      hp.value = saveData.hp || 100
      maxHp.value = saveData.maxHp || 100
      atk.value = saveData.atk || 15
      def.value = saveData.def || 8
      gold.value = saveData.gold || 0
      floor.value = saveData.floor || 1
      title.value = saveData.title || '初入易门'
      equipment.value = saveData.equipment || []
      consumables.value = saveData.consumables || []
      equipped.value = saveData.equipped || { weapon: null, armor: null, accessory: null }
      inventory.value = saveData.inventory || {}
      farm.value = saveData.farm || []
      activeMonster.value = saveData.activeMonster || null
      
      return true
    } catch (e) {
      console.error('存档加载失败:', e)
      return false
    }
  }

  // 检查是否有存档
  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY)
  }

  // 删除存档
  function deleteSave() {
    localStorage.removeItem(SAVE_KEY)
  }

  return {
    gameStarted, activeTab, inBattle, battleState,
    level, exp, maxExp, hp, maxHp, atk, def, gold, floor, title,
    enemy, question, battleLog,
    equipment, consumables, equipped, inventory,
    farm, activeMonster, captureMonsterData, captureQuestion,
    expPercent, hpPercent, monsterBonus, totalAtk, totalDef,
    startGame, setTab,
    initBattle, attack, answerAttack, usePotion, winBattle, flee, exitBattle,
    startCapture, submitCaptureAnswer, skipCapture,
    setFollowMonster, unfollowMonster, upgradeMonster, releaseMonster,
    equip, addItem, addMaterial,
    saveGame, loadGame, hasSave, deleteSave
  }
})
