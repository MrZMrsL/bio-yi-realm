/**
 * 游戏状态机
 *
 * 维护全局游戏模式（gameMode）与状态转移规则。
 */
import type { Ref } from 'vue'
import { logger } from '../../utils/logger.js'

export const GAME_MODE = {
  IDLE: 'idle',
  DUNGEON_PREP: 'dungeon_prep',
  DUNGEON_ROOMS: 'dungeon_rooms',
  BATTLE: 'battle',
  WEEKLY_BOSS: 'weekly_boss',
  PVP: 'pvp',
  PVP_RESULT: 'pvp_result',
  TITLE_DISPLAY: 'title_display',
  LEADERBOARD: 'leaderboard',
  FISHING: 'fishing',
  FISHING_QUIZ: 'fishing_quiz',
  FISHING_BOOK: 'fishing_book',
  FISHING_BOOK_QUIZ: 'fishing_book_quiz',
  FISHING_CAUGHT: 'fishing_caught',
  SHOP: 'shop',
  FARM: 'farm',
  INVENTORY: 'inventory',
  STUDY: 'study',
  ENCYCLOPEDIA: 'encyclopedia',
  CHARACTER: 'character',
  ACHIEVEMENTS: 'achievements',
  SETTINGS: 'settings',
  CAPTURE_QUIZ: 'capture_quiz',
  DROP: 'drop',
  WON: 'won',
  LOST: 'lost',
  FLED: 'fled',
} as const

export type GameMode = (typeof GAME_MODE)[keyof typeof GAME_MODE]

const COMBAT_MODES: GameMode[] = [GAME_MODE.BATTLE, GAME_MODE.WEEKLY_BOSS, GAME_MODE.CAPTURE_QUIZ, GAME_MODE.PVP]
const PANEL_MODES: GameMode[] = [
  GAME_MODE.SHOP,
  GAME_MODE.FARM,
  GAME_MODE.INVENTORY,
  GAME_MODE.STUDY,
  GAME_MODE.ENCYCLOPEDIA,
  GAME_MODE.SETTINGS,
  GAME_MODE.FISHING,
  GAME_MODE.LEADERBOARD,
]
const RESULT_MODES: GameMode[] = [GAME_MODE.WON, GAME_MODE.LOST, GAME_MODE.FLED, GAME_MODE.DROP]
const POST_COMBAT_MODES: GameMode[] = [GAME_MODE.IDLE, GAME_MODE.DUNGEON_PREP, GAME_MODE.DUNGEON_ROOMS]

export function useGameStateMachine(gameMode: Ref<GameMode>) {
  function enterMode(newMode: GameMode): boolean {
    if (
      COMBAT_MODES.includes(gameMode.value) &&
      !COMBAT_MODES.includes(newMode) &&
      !RESULT_MODES.includes(newMode) &&
      !POST_COMBAT_MODES.includes(newMode)
    ) {
      logger.warn(`[StateMachine] 拒绝转移：${gameMode.value} → ${newMode}（战斗中）`)
      return false
    }
    const oldMode = gameMode.value
    gameMode.value = newMode
    logger.log(`[StateMachine] ${oldMode} → ${newMode}`)
    return true
  }

  function isCombatMode(): boolean {
    return COMBAT_MODES.includes(gameMode.value)
  }

  function isPanelMode(): boolean {
    return PANEL_MODES.includes(gameMode.value)
  }

  return {
    enterMode,
    isCombatMode,
    isPanelMode,
  }
}
