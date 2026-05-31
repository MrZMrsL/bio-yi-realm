import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore, GAME_MODE } from '../src/stores/game.js'

// 注意：需要先在项目里安装 vitest 和 @vitejs/plugin-vue
// npm install -D vitest @vitejs/plugin-vue
// 然后在 package.json 的 scripts 里加: "test": "vitest"

describe('状态机核心规则', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
    store.gameStarted = true
    store.level = 1
    store.floor = 1
  })

  // ===== 基础状态转移 =====

  it('初始状态为 idle', () => {
    expect(store.gameMode).toBe(GAME_MODE.IDLE)
  })

  it('进入地牢准备后状态为 dungeon_prep', () => {
    store.enterDungeonPrep()
    expect(store.gameMode).toBe(GAME_MODE.DUNGEON_PREP)
  })

  it('进入房间后状态为 battle', () => {
    store.enterDungeonPrep()
    store.enterRoom(0)
    expect(store.gameMode).toBe(GAME_MODE.BATTLE)
  })

  it('完成房间后状态回到 dungeon_rooms', () => {
    store.enterDungeonPrep()
    store.enterRoom(0)
    store.finishRoom(true)
    expect(store.gameMode).toBe(GAME_MODE.DUNGEON_ROOMS)
  })

  it('进入下一层后状态为 dungeon_prep', () => {
    store.enterDungeonPrep()
    store.roomGrid = Array(9).fill(null).map((_, i) => ({
      index: i, cleared: true, isBoss: i === 0,
      enemyPreview: { name: 'Test', hp: 10, atk: 1, def: 0, subject: 'chem', element: 'water', subjectLabel: '化学', elementLabel: '水' }
    }))
    store.bossRoomIndex = 0
    store.nextFloor()
    expect(store.gameMode).toBe(GAME_MODE.DUNGEON_PREP)
    expect(store.floor).toBe(2)
  })

  it('退出地牢后状态为 idle', () => {
    store.enterDungeonPrep()
    store.exitDungeon()
    expect(store.gameMode).toBe(GAME_MODE.IDLE)
    expect(store.dungeonPhase).toBe('none')
  })

  // ===== 战斗互斥规则（核心铁律） =====

  it('战斗中禁止进入商店', () => {
    store.enterMode(GAME_MODE.BATTLE)
    const result = store.enterMode(GAME_MODE.SHOP)
    expect(result).toBe(false)
    expect(store.gameMode).toBe(GAME_MODE.BATTLE)
  })

  it('战斗中禁止进入钓鱼', () => {
    store.enterMode(GAME_MODE.BATTLE)
    const result = store.enterMode(GAME_MODE.FISHING)
    expect(result).toBe(false)
    expect(store.gameMode).toBe(GAME_MODE.BATTLE)
  })

  it('战斗中禁止进入仓库', () => {
    store.enterMode(GAME_MODE.BATTLE)
    const result = store.enterMode(GAME_MODE.INVENTORY)
    expect(result).toBe(false)
    expect(store.gameMode).toBe(GAME_MODE.BATTLE)
  })

  it('战斗中禁止进入农场', () => {
    store.enterMode(GAME_MODE.BATTLE)
    const result = store.enterMode(GAME_MODE.FARM)
    expect(result).toBe(false)
    expect(store.gameMode).toBe(GAME_MODE.BATTLE)
  })

  it('限时Boss战斗中禁止切换面板', () => {
    store.enterMode(GAME_MODE.WEEKLY_BOSS)
    const result = store.enterMode(GAME_MODE.SHOP)
    expect(result).toBe(false)
    expect(store.gameMode).toBe(GAME_MODE.WEEKLY_BOSS)
  })

  it('捕捉答题中禁止切换面板', () => {
    store.enterMode(GAME_MODE.CAPTURE_QUIZ)
    const result = store.enterMode(GAME_MODE.FISHING)
    expect(result).toBe(false)
    expect(store.gameMode).toBe(GAME_MODE.CAPTURE_QUIZ)
  })

  // ===== 非战斗状态允许切换 =====

  it('idle 允许进入商店', () => {
    store.enterMode(GAME_MODE.IDLE)
    const result = store.enterMode(GAME_MODE.SHOP)
    expect(result).toBe(true)
    expect(store.gameMode).toBe(GAME_MODE.SHOP)
  })

  it('idle 允许进入钓鱼', () => {
    store.enterMode(GAME_MODE.IDLE)
    const result = store.enterMode(GAME_MODE.FISHING)
    expect(result).toBe(true)
    expect(store.gameMode).toBe(GAME_MODE.FISHING)
  })

  // ===== 限时Boss规则 =====

  it('进入限时Boss后状态为 weekly_boss', () => {
    // 模拟 enterWeeklyBoss 的部分逻辑（避免依赖外部数据）
    store.enterMode(GAME_MODE.WEEKLY_BOSS)
    store.inBattle = true
    store.inWeeklyBoss = true
    expect(store.gameMode).toBe(GAME_MODE.WEEKLY_BOSS)
    expect(store.isCombatMode()).toBe(true)
  })

  it('限时Boss逃跑后状态为 idle', () => {
    store.enterMode(GAME_MODE.WEEKLY_BOSS)
    store.inWeeklyBoss = true
    store.inBattle = true
    store.exitWeeklyBoss()
    expect(store.gameMode).toBe(GAME_MODE.IDLE)
    expect(store.inWeeklyBoss).toBe(false)
    expect(store.inBattle).toBe(false)
  })

  it('限时Boss击败后状态为 won', () => {
    store.enterMode(GAME_MODE.WEEKLY_BOSS)
    store.inWeeklyBoss = true
    store.inBattle = true
    store.enemy = { name: 'TestBoss', hp: 0, maxHp: 100, atk: 10, def: 5, subject: 'chem', element: 'water' }
    store.weeklyBossData = { id: 'test', name: 'TestBoss', reward: { exp: 100, gold: 50 } }
    store.weeklyBossDefeated = []
    store.winWeeklyBoss()
    expect(store.gameMode).toBe(GAME_MODE.WON)
  })

  // ===== 辅助函数 =====

  it('isCombatMode 正确识别战斗状态', () => {
    store.enterMode(GAME_MODE.BATTLE)
    expect(store.isCombatMode()).toBe(true)

    store.enterMode(GAME_MODE.WEEKLY_BOSS)
    expect(store.isCombatMode()).toBe(true)

    store.enterMode(GAME_MODE.CAPTURE_QUIZ)
    expect(store.isCombatMode()).toBe(true)
  })

  it('isCombatMode 正确识别非战斗状态', () => {
    store.enterMode(GAME_MODE.IDLE)
    expect(store.isCombatMode()).toBe(false)

    store.enterMode(GAME_MODE.FISHING)
    expect(store.isCombatMode()).toBe(false)

    store.enterMode(GAME_MODE.SHOP)
    expect(store.isCombatMode()).toBe(false)
  })

  it('isPanelMode 正确识别面板状态', () => {
    store.enterMode(GAME_MODE.SHOP)
    expect(store.isPanelMode()).toBe(true)

    store.enterMode(GAME_MODE.FISHING)
    expect(store.isPanelMode()).toBe(true)

    store.enterMode(GAME_MODE.BATTLE)
    expect(store.isPanelMode()).toBe(false)
  })
})

describe('开发者模式', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
    store.gameStarted = true
    store.level = 1
    store.floor = 1
  })

  it('初始 devMode 为 false', () => {
    expect(store.devMode).toBe(false)
  })

  it('开启 devMode 后 answerAttack 直接秒杀', () => {
    store.devMode = true
    store.enemy = { name: 'Test', hp: 100, maxHp: 100, def: 5, atk: 10, subject: 'chem', element: 'water' }
    store.initBattle()
    store.answerAttack(true)  // 参数传什么都行，devMode 下强制秒杀
    expect(store.enemy.hp).toBe(0)
  })

  it('devMode 下 enemyAttack 不掉血', () => {
    store.devMode = true
    store.hp = 100
    store.maxHp = 100
    store.enemy = { name: 'Test', hp: 100, atk: 50, def: 5, subject: 'chem', element: 'water' }
    store.enemyAttack()
    expect(store.hp).toBe(100)  // 不掉血
  })
})

describe('状态机兼容旧存档', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
  })

  it('旧存档无 gameMode 时推断为 idle', () => {
    store.dungeonPhase = 'none'
    store.inBattle = false
    store.weeklyBossData = null
    // 模拟 loadGame 的兼容逻辑
    if (!store.gameMode) {
      if (store.inBattle) {
        if (store.weeklyBossData) store.gameMode = GAME_MODE.WEEKLY_BOSS
        else if (store.dungeonPhase === 'battle') store.gameMode = GAME_MODE.BATTLE
      } else if (store.dungeonPhase === 'prep') {
        store.gameMode = GAME_MODE.DUNGEON_PREP
      } else if (store.dungeonPhase === 'rooms') {
        store.gameMode = GAME_MODE.DUNGEON_ROOMS
      }
    }
    expect(store.gameMode).toBe(GAME_MODE.IDLE)
  })

  it('旧存档 dungeonPhase=battle 时推断为 battle', () => {
    store.dungeonPhase = 'battle'
    store.inBattle = true
    store.weeklyBossData = null
    if (!store.gameMode) {
      if (store.inBattle) {
        if (store.weeklyBossData) store.gameMode = GAME_MODE.WEEKLY_BOSS
        else if (store.dungeonPhase === 'battle') store.gameMode = GAME_MODE.BATTLE
      }
    }
    expect(store.gameMode).toBe(GAME_MODE.BATTLE)
  })
})
