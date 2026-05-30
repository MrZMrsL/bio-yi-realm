import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ALL_QUESTIONS, getQuestionsForFloor } from '../data/questions.js'
import { ENEMIES, getEnemyForFloor } from '../data/enemies.js'
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
import { getTitleData } from '../data/titles.js'
import { getTotalCount } from '../data/cyclopedia.js'

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
  const title = computed(() => getTitleData(level.value).title)

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

  // 捕捉状态（多题模式）
  const captureMonsterData = ref(null) // 待捕捉的怪物数据
  const captureQuestions = ref([]) // 捕捉题目数组（3题）
  const captureIndex = ref(0) // 当前答题索引
  const captureCorrectCount = ref(0) // 答对计数

  // 钓鱼系统
  const fishingLevel = ref(1)
  const recentCatches = ref([])
  const fishCollection = ref({}) // { common: 5, rare: 2, ... }

  // 战斗掉落
  const drop = ref(null) // { type: 'equipment' | 'consumable', item: object }

  // 连击系统
  const comboCount = ref(0)
  const comboActive = ref(false)
  const consecutiveCorrect = ref(0)

  // 图鉴系统
  const cyclopedia = ref({ monsters: {}, materials: {}, fishes: {}, books: {}, titles: {} })
  const newDiscoveries = ref([]) // 新发现通知队列

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
    // 初始材料归零，玩家自行积累
    inventory.value = {}
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

    // 伤害保底：即使防御极高，至少造成 atk 的 40% 伤害（3点起）
    let baseDmg = Math.floor((enemy.value.atk - totalDef.value) * multiplier)
    const minDmg = Math.max(3, Math.floor(enemy.value.atk * 0.4 * multiplier))
    const damage = Math.max(minDmg, baseDmg)
    hp.value -= damage
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
    comboActive.value = false
  }

  function triggerCriticalEffect() {
    // 屏幕震动效果标记
    comboActive.value = true
    setTimeout(() => { comboActive.value = false }, 1500)
  }

  // 答题攻击
  function answerAttack(correct) {
    if (!enemy.value) return

    if (correct) {
      // 连击逻辑：连续答对增加连击数
      consecutiveCorrect.value++
      comboCount.value = consecutiveCorrect.value

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
        // 三连暴击
        logMsg = `⚡ 知识连击x${consecutiveCorrect.value}！造成 ${damage} 点伤害！`
        triggerCriticalEffect()
        resetCombo()
      } else if (consecutiveCorrect.value === 2) {
        logMsg = `🔥 连击x2！造成 ${damage} 点伤害！`
      } else {
        logMsg = `🧠 知识攻击命中！造成 ${damage} 点伤害！`
      }

      if (elementEffect?.desc) logMsg += ` ${elementEffect.desc}`
      battleLog.value.push(logMsg)

      if (enemy.value.hp <= 0) {
        winBattle()
      } else {
        battleState.value = 'idle'
      }
    } else {
      // 答错重置连击
      resetCombo()
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
    const expGain = Math.floor(15 * (1 + floor.value * 0.1))
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

    // 装备/消耗品掉落
    const itemDrop = generateDrop()
    if (itemDrop) {
      drop.value = itemDrop
      if (itemDrop.type === 'equipment') {
        battleLog.value.push(`获得装备 ${itemDrop.item.name}！`)
      } else {
        battleLog.value.push(`获得 ${itemDrop.item.name} ×${itemDrop.item.count}！`)
      }
      battleState.value = 'drop' // 先展示掉落，再进入 won
      saveGame()
      return
    }
    
    // 记录图鉴和统计
    if (enemy.value?.name) {
      addToCyclopedia('monsters', enemy.value.name)
    }
    updateStats('totalWins', 1)
    if (floor.value > stats.value.maxFloor) {
      stats.value.maxFloor = floor.value
    }
    updateStats('totalBattles', 1)

    // 检查是否可以捕捉（概率触发，非100%）
    if (farm.value.length < FARM_MAX_CAPACITY) {
      const alreadyHas = farm.value.some(m => m.name === enemy.value.name)
      if (!alreadyHas) {
        // 概率触发：基础30% + 楼层×2%，上限60%
        const triggerChance = Math.min(0.6, 0.3 + floor.value * 0.02)
        if (Math.random() > triggerChance) {
          // 没触发，直接递增楼层
          floor.value++
          return
        }

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

        // 准备3道题（按怪物元素对应学科）
        const subject = ELEMENT_SUBJECT_MAP[captureMonsterData.value.element] || 'chem'
        const questions = ALL_QUESTIONS.filter(q => q.subject === subject && q.diff === 'medium')
        const qPool = questions.length > 0 ? questions : ALL_QUESTIONS
        captureQuestions.value = []
        const usedIndices = new Set()
        for (let i = 0; i < 3 && i < qPool.length; i++) {
          let idx
          do { idx = Math.floor(Math.random() * qPool.length) } while (usedIndices.has(idx))
          usedIndices.add(idx)
          captureQuestions.value.push(qPool[idx])
        }
        captureIndex.value = 0
        captureCorrectCount.value = 0

        // 楼层递增在捕捉完成后进行
        return
      }
    }

    // 不能捕捉，直接递增楼层
    floor.value++
  }

  // 生成战斗掉落（按楼层分难度掉落率）
  function generateDrop() {
    const roll = Math.random()

    // 掉落率按楼层递增：前期压低，后期放开
    let consumableRate, equipmentRate
    if (floor.value <= 5) {
      consumableRate = 0.15
      equipmentRate = 0.10
    } else if (floor.value <= 10) {
      consumableRate = 0.25
      equipmentRate = 0.20
    } else {
      consumableRate = 0.40
      equipmentRate = 0.30
    }

    // 先判定消耗品
    if (roll < consumableRate) {
      const pick = CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)]
      const count = Math.floor(1 + Math.random() * 2)
      const consumable = { ...pick, count, slot: Math.random() }
      consumables.value.push(consumable)
      return { type: 'consumable', item: consumable }
    }

    // 再判定装备
    if (roll < consumableRate + equipmentRate) {
      const type = Math.random() < 0.4 ? 'weapon' : Math.random() < 0.7 ? 'armor' : 'accessory'
      const candidates = EQUIPMENT.filter(e => e.type === type)
      if (candidates.length === 0) return null

      const pick = candidates[Math.floor(Math.random() * candidates.length)]
      const level = Math.floor(floor.value / 5) + 1
      const multiplier = 1 + (floor.value * 0.05)

      const gear = {
        ...pick,
        id: `${pick.id}_${floor.value}_${Math.floor(Math.random() * 10000)}`,
        level,
        atk: Math.floor((pick.atk || 0) * multiplier),
        def: Math.floor((pick.def || 0) * multiplier),
        desc: `${pick.desc} (Lv.${level})`,
        price: Math.floor(pick.price * multiplier)
      }

      equipment.value.push(gear)
      return { type: 'equipment', item: gear }
    }

    return null
  }

  // 领取掉落
  function claimDrop() {
    drop.value = null
    battleState.value = 'won'
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
    const correct = index === q.answer

    if (correct) {
      captureCorrectCount.value++
    }

    captureIndex.value++

    // 提前终止：如果剩余题数 + 已答对 < 3，不可能成功
    const remaining = captureQuestions.value.length - captureIndex.value
    if (captureCorrectCount.value + remaining < 3) {
      battleState.value = 'captureFail'
      captureMonsterData.value = null
      captureQuestions.value = []
      captureIndex.value = 0
      captureCorrectCount.value = 0
      floor.value++
      return
    }

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
      } else {
        battleState.value = 'captureFail'
      }
      captureMonsterData.value = null
      captureQuestions.value = []
      captureIndex.value = 0
      captureCorrectCount.value = 0
      floor.value++
    }
  }

  // 跳过捕捉
  function skipCapture() {
    captureMonsterData.value = null
    captureQuestions.value = []
    captureIndex.value = 0
    captureCorrectCount.value = 0
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
    captureQuestions.value = []
    captureIndex.value = 0
    captureCorrectCount.value = 0
    resetCombo()
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

  // 锻造（合成）
  function forgeItem(recipeId) {
    const recipe = FORGE_RECIPES.find(r => r.id === recipeId)
    if (!recipe) return false

    if (!canForge(recipe, inventory.value, gold.value)) {
      return false
    }

    // 扣除材料
    for (const [mat, need] of Object.entries(recipe.materials)) {
      inventory.value[mat] -= need
      if (inventory.value[mat] <= 0) delete inventory.value[mat]
    }

    // 扣除金币
    gold.value -= recipe.gold

    // 生成物品
    if (recipe.type === 'potion') {
      const item = {
        id: `${recipe.id}_${Math.floor(Math.random() * 10000)}`,
        name: recipe.name,
        type: recipe.type === 'potion' ? 'heal' : 'buff',
        ratio: recipe.ratio,
        bonusAtk: recipe.bonusAtk,
        desc: recipe.desc,
        count: 1,
        slot: Math.random()
      }
      consumables.value.push(item)
    } else {
      // 装备
      const gear = {
        id: `${recipe.id}_${Math.floor(Math.random() * 10000)}`,
        name: recipe.name,
        type: recipe.type,
        icon: recipe.icon,
        atk: recipe.atk || 0,
        def: recipe.def || 0,
        desc: recipe.desc,
        level: recipe.unlockLevel
      }
      equipment.value.push(gear)
    }

    saveGame()
    return true
  }

  // 商店购买
  function buyItem(shopItem) {
    if (gold.value < shopItem.price) return false

    gold.value -= shopItem.price

    if (shopItem.type === 'consumable') {
      const item = {
        id: `${shopItem.id}_${Math.floor(Math.random() * 10000)}`,
        name: shopItem.name,
        type: shopItem.subtype,
        count: 1,
        slot: Math.random(),
        desc: shopItem.desc
      }
      if (shopItem.subtype === 'heal') {
        item.value = shopItem.effect.hp
      } else if (shopItem.subtype === 'exp') {
        item.value = shopItem.effect.exp
      } else if (shopItem.subtype === 'buff') {
        item.bonusAtk = shopItem.effect.atk
      }
      consumables.value.push(item)
    } else if (shopItem.type === 'equipment') {
      const gear = {
        id: `${shopItem.id}_${Math.floor(Math.random() * 10000)}`,
        name: shopItem.name,
        type: shopItem.subtype,
        atk: shopItem.atk || 0,
        def: shopItem.def || 0,
        desc: shopItem.desc,
        price: shopItem.price
      }
      equipment.value.push(gear)
    } else if (shopItem.type === 'material') {
      const materialMap = {
        'shop_water_essence': '水之精华',
        'shop_fire_core': '火焰核心',
        'shop_acid_crystal': '酸液结晶',
        'shop_thunder_stone': '雷电石',
        'shop_ice_shard': '冰霜碎片',
        'shop_wind_feather': '风之羽毛'
      }
      const matName = materialMap[shopItem.id] || shopItem.name
      inventory.value[matName] = (inventory.value[matName] || 0) + 1
    }

    saveGame()
    return true
  }

  // 图鉴系统
  function addToCyclopedia(type, id) {
    if (!cyclopedia.value[type]) cyclopedia.value[type] = {}
    if (!cyclopedia.value[type][id]) {
      cyclopedia.value[type][id] = { found: true, count: 1 }
      showNewDiscovery(type, id)
    } else {
      cyclopedia.value[type][id].count++
    }
  }

  function showNewDiscovery(type, id) {
    const typeNames = { monsters: '怪物', materials: '材料', fishes: '鱼类', books: '古籍', titles: '人物' }
    const name = id
    newDiscoveries.value.push({ type: typeNames[type], name, time: Date.now() })
    // 3秒后自动移除通知
    setTimeout(() => {
      newDiscoveries.value.shift()
    }, 3000)
  }

  function getCyclopediaProgress(type) {
    const data = cyclopedia.value[type] || {}
    const found = Object.keys(data).filter(k => data[k].found).length
    const total = getTotalCount(type)
    return { found, total, pct: total > 0 ? Math.round(found / total * 100) : 0 }
  }

  function isDiscovered(type, id) {
    return cyclopedia.value[type]?.[id]?.found || false
  }

  function getDiscoveryCount(type, id) {
    return cyclopedia.value[type]?.[id]?.count || 0
  }

  // 统计系统
  const stats = ref({
    totalCorrect: 0,
    totalWrong: 0,
    maxCombo: 0,
    maxFloor: 1,
    totalBattles: 0,
    totalWins: 0,
    totalFishes: 0,
    totalForges: 0
  })

  function updateStats(key, value) {
    if (stats.value[key] !== undefined) {
      stats.value[key] += value
    }
  }

  // 钓鱼相关方法
  function recordFishCatch(fish) {
    if (!fish) return
    recentCatches.value.push(fish)
    // 只保留最近50条
    if (recentCatches.value.length > 50) {
      recentCatches.value = recentCatches.value.slice(-50)
    }
    // 更新图鉴计数
    fishCollection.value[fish.rarity] = (fishCollection.value[fish.rarity] || 0) + 1
    // 钓鱼经验（每10条升1级）
    const totalCatches = Object.values(fishCollection.value).reduce((a, b) => a + b, 0)
    fishingLevel.value = Math.floor(totalCatches / 10) + 1
    // 记录图鉴
    addToCyclopedia('fishes', fish.name)
    updateStats('totalFishes', 1)
    saveGame()
  }

  function removeFishFromRecent(fish) {
    const idx = recentCatches.value.findIndex(f => f.name === fish.name)
    if (idx !== -1) {
      recentCatches.value.splice(idx, 1)
    }
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
      captureMonsterData: captureMonsterData.value,
      captureQuestions: captureQuestions.value,
      captureIndex: captureIndex.value,
      captureCorrectCount: captureCorrectCount.value,
      drop: drop.value,
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
      // title 是 computed，不需要从存档加载
      equipment.value = saveData.equipment || []
      consumables.value = saveData.consumables || []
      equipped.value = saveData.equipped || { weapon: null, armor: null, accessory: null }
      inventory.value = saveData.inventory || {}
      farm.value = saveData.farm || []
      activeMonster.value = saveData.activeMonster || null
      fishingLevel.value = saveData.fishingLevel || 1
      recentCatches.value = saveData.recentCatches || []
      fishCollection.value = saveData.fishCollection || {}
      drop.value = saveData.drop || null
      captureMonsterData.value = saveData.captureMonsterData || null
      captureQuestions.value = saveData.captureQuestions || []
      captureIndex.value = saveData.captureIndex || 0
      captureCorrectCount.value = saveData.captureCorrectCount || 0

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

  const titleData = computed(() => getTitleData(level.value))
  const titleBio = computed(() => titleData.value.bio)
  const titleEra = computed(() => titleData.value.era)
  const titleField = computed(() => titleData.value.field)
  const titleAchievements = computed(() => titleData.value.achievements)

  return {
    gameStarted, activeTab, inBattle, battleState,
    level, exp, maxExp, hp, maxHp, atk, def, gold, floor, title, titleData, titleBio, titleEra, titleField, titleAchievements,
    enemy, question, battleLog,
    equipment, consumables, equipped, inventory,
    farm, activeMonster, captureMonsterData, captureQuestions, captureIndex, captureCorrectCount,
    drop,
    comboCount, comboActive, consecutiveCorrect,
    cyclopedia, newDiscoveries, stats,
    fishingLevel, recentCatches, fishCollection,
    expPercent, hpPercent, monsterBonus, totalAtk, totalDef,
    startGame, setTab,
    initBattle, attack, answerAttack, usePotion, winBattle, flee, exitBattle,
    startCapture, submitCaptureAnswer, skipCapture,
    setFollowMonster, unfollowMonster, upgradeMonster, releaseMonster,
    equip, addItem, addMaterial,
    forgeItem,
    buyItem,
    claimDrop,
    recordFishCatch, removeFishFromRecent,
    addToCyclopedia, getCyclopediaProgress, isDiscovered, getDiscoveryCount,
    updateStats,
    saveGame, loadGame, hasSave, deleteSave
  }
})
