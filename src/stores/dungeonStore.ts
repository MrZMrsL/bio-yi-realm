import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getEnemyForFloor, getBossForFloor, createEnemyInstance } from '../data/enemies.ts'
import { getQuestionsForFloor, ensureQuestionsForSpec } from '../data/questions.ts'
import { DUNGEON_ELEMENTS } from '../data/farm.ts'
import { FARM_CAPACITY } from '../config/balance.js'
import { saveNow } from '../services/saveService.js'
import { usePlayerStore } from './playerStore.ts'
import { useBattleStore } from './battleStore.ts'
import { useLogStore } from './logStore.ts'
import type { Enemy } from '../types.ts'

export type DungeonPhase = 'none' | 'prep' | 'battle' | 'rooms'

export interface Room {
  index: number
  enemyPreview: Enemy
  cleared: boolean
  isBoss: boolean
}

export const useDungeonStore = defineStore('dungeon', () => {
  // ===== 地牢系统 =====
  const dungeonPhase = ref<DungeonPhase>('none')
  const roomGrid = ref<Room[]>([])
  const bossRoomIndex = ref<number>(-1)
  const currentRoomIndex = ref<number>(-1)
  const allClearCount = ref<number>(0)
  const clearedRoomsThisFloor = ref<number>(0)
  const hasSkippedRoom = ref<boolean>(false)
  const currentFloorElement = ref<string>('water')
  const showTutorial = ref<boolean>(false)
  const firstVisit = ref<boolean>(true)

  function enterDungeonPrep() {
    actuallyEnterDungeonPrep()
  }

  function actuallyEnterDungeonPrep() {
    dungeonPhase.value = 'prep'
    currentFloorElement.value = (() => {
      const elements = Object.keys(DUNGEON_ELEMENTS)
      return elements[Math.floor(Math.random() * elements.length)]
    })()
    generateRoomPreviews()
    saveNow()
  }

  function enterRooms() {
    dungeonPhase.value = 'rooms'
  }

  function generateRoomPreviews() {
    const playerStore = usePlayerStore()
    const floorNum = playerStore.floor
    const element = currentFloorElement.value
    const enemyList = getEnemyForFloor(floorNum, element)
    const rooms: Room[] = []
    const used = new Set<string>()
    for (let i = 0; i < 9; i++) {
      let e: Enemy
      do {
        e = enemyList[Math.floor(Math.random() * enemyList.length)]
      } while (used.has(e.name) && used.size < enemyList.length)
      used.add(e.name)
      rooms.push({
        index: i,
        enemyPreview: e,
        cleared: false,
        isBoss: false,
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

  async function enterRoom(roomIndex: number) {
    const room = roomGrid.value[roomIndex]
    if (!room || room.cleared) return
    await actuallyEnterRoom(roomIndex)
  }

  async function actuallyEnterRoom(roomIndex: number) {
    const playerStore = usePlayerStore()
    const battleStore = useBattleStore()
    const room = roomGrid.value[roomIndex]
    if (!room || room.cleared) return

    await ensureQuestionsForSpec(playerStore.playerSpecialization)

    currentRoomIndex.value = roomIndex
    dungeonPhase.value = 'battle'

    const preview = room.enemyPreview
    const enemy = createEnemyInstance(preview, { isBoss: room.isBoss || false })
    const q = getQuestionsForFloor(playerStore.floor, 1, playerStore.playerSpecialization)[0]

    await battleStore.startBattle({
      enemy,
      question: q || null,
      logMessage: `${room.isBoss ? '👹 BOSS战！' : ''}遭遇 ${preview.name}！`,
      captureableHints: {
        full: `🐾 这只怪物可以收养，但你的农场已经满了（最多${FARM_CAPACITY}只）`,
        canCapture: '🐾 这只怪物可以收养！击败它后记得收下战利品，再点击"尝试收养"',
      },
      callbacks: {
        onCaptureSuccess: () => finishRoom(true),
        onCaptureFail: () => finishRoom(true),
        onExit: () => {
          dungeonPhase.value = 'rooms'
          currentRoomIndex.value = -1
        },
      },
    })
  }

  function finishRoom(cleared: boolean) {
    const battleStore = useBattleStore()
    const logStore = useLogStore()
    if (currentRoomIndex.value < 0) return

    const room = roomGrid.value[currentRoomIndex.value]
    if (room) {
      room.cleared = cleared
      if (cleared) clearedRoomsThisFloor.value++
    }

    const allCleared = roomGrid.value.every(r => r.cleared)
    if (allCleared) {
      allClearCount.value++
      if (allClearCount.value >= 10) {
        logStore.battleLog.push('🏆 解锁成就：我全都要！（累计10层清空所有房间）')
      }
    }

    currentRoomIndex.value = -1
    battleStore.finishRoomBattle()

    dungeonPhase.value = 'rooms'
    saveNow()
  }

  function nextFloor() {
    const playerStore = usePlayerStore()
    const bossRoom = roomGrid.value[bossRoomIndex.value]
    if (!bossRoom || !bossRoom.cleared) {
      return false
    }
    const allCleared = roomGrid.value.every(r => r.cleared)
    if (!allCleared) {
      hasSkippedRoom.value = true
    }
    playerStore.advanceFloor()
    dungeonPhase.value = 'prep'
    currentFloorElement.value = (() => {
      const elements = Object.keys(DUNGEON_ELEMENTS)
      return elements[Math.floor(Math.random() * elements.length)]
    })()
    generateRoomPreviews()
    return true
  }

  function exitDungeon() {
    const battleStore = useBattleStore()
    dungeonPhase.value = 'none'
    roomGrid.value = []
    bossRoomIndex.value = -1
    currentRoomIndex.value = -1
    battleStore.resetBattleState()
    saveNow()
  }

  function completeTutorial() {
    firstVisit.value = false
    saveNow()
  }

  function reset() {
    dungeonPhase.value = 'none'
    roomGrid.value = []
    bossRoomIndex.value = -1
    currentRoomIndex.value = -1
    allClearCount.value = 0
    clearedRoomsThisFloor.value = 0
    hasSkippedRoom.value = false
    currentFloorElement.value = 'water'
    showTutorial.value = false
    firstVisit.value = true
  }

  function serialize(): Record<string, unknown> {
    return {
      dungeonPhase: dungeonPhase.value,
      roomGrid: roomGrid.value,
      bossRoomIndex: bossRoomIndex.value,
      currentRoomIndex: currentRoomIndex.value,
      allClearCount: allClearCount.value,
      clearedRoomsThisFloor: clearedRoomsThisFloor.value,
      hasSkippedRoom: hasSkippedRoom.value,
      currentFloorElement: currentFloorElement.value,
      firstVisit: firstVisit.value,
      showTutorial: showTutorial.value,
    }
  }

  function deserialize(saveData: Record<string, unknown>) {
    reset()
    dungeonPhase.value = (saveData.dungeonPhase as DungeonPhase) || 'none'
    roomGrid.value = (saveData.roomGrid as Room[]) || []
    bossRoomIndex.value = (saveData.bossRoomIndex as number) || -1
    currentRoomIndex.value = (saveData.currentRoomIndex as number) || -1
    allClearCount.value = (saveData.allClearCount as number) || 0
    clearedRoomsThisFloor.value = (saveData.clearedRoomsThisFloor as number) || 0
    hasSkippedRoom.value = (saveData.hasSkippedRoom as boolean) || false
    currentFloorElement.value = (saveData.currentFloorElement as string) || 'water'
    firstVisit.value = saveData.firstVisit !== undefined ? (saveData.firstVisit as boolean) : true
    showTutorial.value = (saveData.showTutorial as boolean) || false
  }

  return {
    dungeonPhase,
    roomGrid,
    bossRoomIndex,
    currentRoomIndex,
    allClearCount,
    clearedRoomsThisFloor,
    hasSkippedRoom,
    currentFloorElement,
    showTutorial,
    firstVisit,
    enterDungeonPrep,
    actuallyEnterDungeonPrep,
    enterRooms,
    generateRoomPreviews,
    enterRoom,
    actuallyEnterRoom,
    finishRoom,
    nextFloor,
    exitDungeon,
    completeTutorial,
    reset,
    serialize,
    deserialize,
  }
})
