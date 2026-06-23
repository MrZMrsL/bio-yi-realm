/**
 * 地牢流程协调器
 *
 * 负责把地牢相关操作与全局状态机串联。
 */
import type { useDungeonStore } from '../dungeonStore.ts'
import { GAME_MODE } from './useGameStateMachine.ts'
import type { GameMode } from './useGameStateMachine.ts'

type DungeonStore = ReturnType<typeof useDungeonStore>

export interface DungeonCoordinatorDependencies {
  dungeonStore: DungeonStore
  enterMode: (_mode: GameMode) => boolean
}

export function useGameDungeonCoordinator(deps: DungeonCoordinatorDependencies) {
  const { dungeonStore, enterMode } = deps

  function enterDungeonPrep() {
    enterMode(GAME_MODE.DUNGEON_PREP)
    dungeonStore.enterDungeonPrep()
  }

  function actuallyEnterDungeonPrep() {
    enterMode(GAME_MODE.DUNGEON_PREP)
    dungeonStore.actuallyEnterDungeonPrep()
  }

  function generateRoomPreviews() {
    dungeonStore.generateRoomPreviews()
  }

  async function enterRoom(roomIndex: number) {
    await dungeonStore.enterRoom(roomIndex)
    if (dungeonStore.dungeonPhase === 'battle') {
      enterMode(GAME_MODE.BATTLE)
    }
  }

  async function actuallyEnterRoom(roomIndex: number) {
    await dungeonStore.actuallyEnterRoom(roomIndex)
    if (dungeonStore.dungeonPhase === 'battle') {
      enterMode(GAME_MODE.BATTLE)
    }
  }

  function finishRoom(cleared: boolean) {
    dungeonStore.finishRoom(cleared)
    enterMode(GAME_MODE.DUNGEON_ROOMS)
  }

  function nextFloor() {
    const ok = dungeonStore.nextFloor()
    if (ok) {
      enterMode(GAME_MODE.DUNGEON_PREP)
    }
    return ok
  }

  function exitDungeon() {
    dungeonStore.exitDungeon()
    enterMode(GAME_MODE.IDLE)
  }

  function completeTutorial() {
    dungeonStore.completeTutorial()
  }

  return {
    enterDungeonPrep,
    actuallyEnterDungeonPrep,
    generateRoomPreviews,
    enterRoom,
    actuallyEnterRoom,
    finishRoom,
    nextFloor,
    exitDungeon,
    completeTutorial,
  }
}
