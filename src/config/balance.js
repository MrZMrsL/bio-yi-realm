/**
 * 游戏平衡与数值配置中心
 *
 * 所有影响战斗、成长、掉落、钓鱼、农场的核心常数集中在这里，
 * 方便后期调整数值和做 A/B 测试。
 */

// ===== 玩家成长 =====
export const LEVEL_EXP_BASE = 80
export const LEVEL_EXP_GROWTH = 1.12
export const LEVEL_UP_HP_GROWTH = 1.15
export const LEVEL_UP_ATK_BONUS = 3
export const LEVEL_UP_DEF_BONUS = 2
export const LEVEL_UP_STAT_POINT_BONUS = 1
export const LEVEL_MILESTONE_EVERY = 10
export const LEVEL_MILESTONE_ATK_BONUS_PER_TEN = 2
export const LEVEL_MILESTONE_DEF_BONUS_PER_TEN = 2
export const LEVEL_MILESTONE_HP_BONUS_PER_TEN = 20

export const STAT_POINT_ATK_BONUS = 2
export const STAT_POINT_DEF_BONUS = 1
export const STAT_POINT_HP_BONUS = 10

// ===== 战斗伤害 =====
export const DAMAGE_BASE_RATIO = 0.3
export const DEF_DAMAGE_REDUCTION_RATIO = 0.5
export const ENEMY_DAMAGE_BASE_RATIO = 0.3
export const ELEMENT_COUNTER_WEAK_MULTIPLIER = 0.7
export const ELEMENT_COUNTER_STRONG_MULTIPLIER = 1.5
export const ELEMENT_COUNTER_NEUTRAL_MULTIPLIER = 1.0

// ===== 连击系统 =====
export const COMBO_BONUS_DEFAULT = 0.5
export const COMBO_BONUS_CHEM = 0.7
export const COMBO_BONUS_BIO = 0.5
export const COMBO_BONUS_YI = 0.4
export const BIO_HEAL_PER_STACK_RATIO = 0.02

// ===== 战斗奖励 =====
export const BATTLE_EXP_MAXHP_RATIO = 0.2
export const BATTLE_EXP_ATK_RATIO = 0.8
export const BATTLE_GOLD_ATK_RATIO = 1.5

// ===== 掉落系统 =====
export const DROP_EQUIPMENT_CHANCE = 0.3
export const DROP_CONSUMABLE_CHANCE = 0.6
export const DROP_BATTLE_CARD_CHANCE = 0.75

// ===== 农场与宠物 =====
export const FARM_CAPACITY = 12
export const FARM_UPGRADE_MAT_COST_PER_LEVEL = 2
export const FARM_PET_MAX_EXP_BASE = 50
export const FARM_PET_MAX_EXP_GROWTH = 1.25
export const FARM_PET_LEVEL_STAT_GROWTH = 0.15

// ===== 消耗品 =====
export const POTION_BUFF_DURATION = 3

// ===== 钓鱼 =====
export const FISHING_DAILY_LIMIT = 5
export const FISHING_BOOK_STUDY_EXP = 25
export const FISHING_BOOK_QUIZ_HIGH_THRESHOLD = 0.67
export const FISHING_BOOK_QUIZ_MID_THRESHOLD = 0.33
export const FISHING_BOOK_QUIZ_HIGH_EXP = 50
export const FISHING_BOOK_QUIZ_MID_EXP = 25
export const FISHING_BOOK_QUIZ_LOW_EXP = 10
export const FISHING_RELEASE_EXP_RATIO = 1.5

// ===== PVP =====
export const PVP_MAX_ROUNDS = 5
export const PVP_OPPONENT_DELAY_MS = 800
export const PVP_OPPONENT_WIN_CHANCE_BASE = 0.4
export const PVP_OPPONENT_WIN_CHANCE_RATIO = 0.2
export const PVP_PLAYER_DMG_ATK_RATIO = 0.3
export const PVP_PLAYER_DMG_LEVEL_BONUS = 1.5
export const PVP_OPPONENT_DMG_ATK_RATIO = 0.3
export const PVP_OPPONENT_DMG_LEVEL_BONUS = 1.2
export const PVP_REWARD_EXP_WIN_MULTIPLIER = 15
export const PVP_REWARD_EXP_LOSS_MULTIPLIER = 5
export const PVP_REWARD_GOLD_WIN_MULTIPLIER = 10
export const PVP_REWARD_GOLD_LOSS_MULTIPLIER = 3
export const PVP_OPPONENT_LEVEL_VARIANCE = 5
export const PVP_OPPONENT_LEVEL_VARIANCE_OFFSET = 2
export const PVP_OPPONENT_ATK_SCALE_MIN = 0.85
export const PVP_OPPONENT_ATK_SCALE_MAX = 1.15
export const PVP_OPPONENT_DEF_SCALE_RATIO = 0.8
export const PVP_OPPONENT_HP_SCALE_RATIO = 0.9
