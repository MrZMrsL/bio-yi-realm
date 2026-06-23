/**
 * 成就系统数据
 * 设计理念：覆盖游戏全生命周期，从新手到大师的成长路径
 */

import type { Achievement } from '../types.ts'

export const ACHIEVEMENTS: Achievement[] = [
  // === 战斗成就 ===
  {
    id: 'first_blood',
    title: '初出茅庐',
    desc: '完成首次战斗',
    icon: '⚔️',
    category: 'combat',
    rarity: 'normal',
    condition: stats => stats.totalBattles >= 1,
    progress: stats => Math.min(1, stats.totalBattles),
    maxProgress: 1,
    reward: { exp: 10 },
  },
  {
    id: 'veteran',
    title: '身经百战',
    desc: '累计完成 100 场战斗',
    icon: '🛡️',
    category: 'combat',
    rarity: 'rare',
    condition: stats => stats.totalBattles >= 100,
    progress: stats => Math.min(100, stats.totalBattles),
    maxProgress: 100,
    reward: { exp: 50 },
  },
  {
    id: 'warlord',
    title: '百战不殆',
    desc: '累计完成 500 场战斗',
    icon: '👑',
    category: 'combat',
    rarity: 'epic',
    condition: stats => stats.totalBattles >= 500,
    progress: stats => Math.min(500, stats.totalBattles),
    maxProgress: 500,
    reward: { exp: 200 },
  },
  {
    id: 'combo_master',
    title: '三连暴击',
    desc: '单场战斗达成 3 连击',
    icon: '⚡',
    category: 'combat',
    rarity: 'rare',
    condition: stats => stats.maxCombo >= 3,
    progress: stats => Math.min(3, stats.maxCombo),
    maxProgress: 3,
    reward: { exp: 30 },
  },
  {
    id: 'combo_god',
    title: '知识之神',
    desc: '单场战斗达成 5 连击',
    icon: '🔥',
    category: 'combat',
    rarity: 'epic',
    condition: stats => stats.maxCombo >= 5,
    progress: stats => Math.min(5, stats.maxCombo),
    maxProgress: 5,
    reward: { exp: 100 },
  },
  {
    id: 'all_clear',
    title: '我全都要',
    desc: '累计 10 层清空所有房间',
    icon: '🏆',
    category: 'combat',
    rarity: 'legendary',
    condition: allClearCount => allClearCount >= 10,
    progress: allClearCount => Math.min(10, allClearCount),
    maxProgress: 10,
    reward: { exp: 300 },
  },
  {
    id: 'floor_50',
    title: '深渊行者',
    desc: '到达第 50 层',
    icon: '🏰',
    category: 'combat',
    rarity: 'epic',
    condition: stats => stats.maxFloor >= 50,
    progress: stats => Math.min(50, stats.maxFloor),
    maxProgress: 50,
    reward: { exp: 150 },
  },
  {
    id: 'floor_100',
    title: '混沌征服者',
    desc: '到达第 100 层',
    icon: '👑',
    category: 'combat',
    rarity: 'legendary',
    condition: stats => stats.maxFloor >= 100,
    progress: stats => Math.min(100, stats.maxFloor),
    maxProgress: 100,
    reward: { exp: 500 },
  },

  // ===== 新增战斗成就 =====
  {
    id: 'floor_10',
    title: '十层通关',
    desc: '到达第 10 层',
    icon: '🏗️',
    category: 'combat',
    rarity: 'normal',
    condition: stats => stats.maxFloor >= 10,
    progress: stats => Math.min(10, stats.maxFloor),
    maxProgress: 10,
    reward: { exp: 30 },
  },
  {
    id: 'floor_30',
    title: '踏平深渊',
    desc: '到达第 30 层',
    icon: '🏔️',
    category: 'combat',
    rarity: 'rare',
    condition: stats => stats.maxFloor >= 30,
    progress: stats => Math.min(30, stats.maxFloor),
    maxProgress: 30,
    reward: { exp: 80 },
  },
  {
    id: 'first_win',
    title: '首战告捷',
    desc: '取得首次战斗胜利',
    icon: '🥇',
    category: 'combat',
    rarity: 'normal',
    condition: stats => stats.totalWins >= 1,
    progress: stats => Math.min(1, stats.totalWins),
    maxProgress: 1,
    reward: { exp: 10 },
  },
  {
    id: 'win_50',
    title: '常胜将军',
    desc: '累计 50 场战斗胜利',
    icon: '🏅',
    category: 'combat',
    rarity: 'rare',
    condition: stats => stats.totalWins >= 50,
    progress: stats => Math.min(50, stats.totalWins),
    maxProgress: 50,
    reward: { exp: 60 },
  },
  {
    id: 'win_200',
    title: '战神降临',
    desc: '累计 200 场战斗胜利',
    icon: '⚔️',
    category: 'combat',
    rarity: 'epic',
    condition: stats => stats.totalWins >= 200,
    progress: stats => Math.min(200, stats.totalWins),
    maxProgress: 200,
    reward: { exp: 200 },
  },
  {
    id: 'all_clear_50',
    title: '清场专业户',
    desc: '累计 50 层清空所有房间',
    icon: '🧹',
    category: 'combat',
    rarity: 'legendary',
    condition: allClearCount => allClearCount >= 50,
    progress: allClearCount => Math.min(50, allClearCount),
    maxProgress: 50,
    reward: { exp: 500 },
  },

  // === 知识成就 ===
  {
    id: 'first_correct',
    title: '学有所成',
    desc: '累计答对 10 题',
    icon: '📚',
    category: 'knowledge',
    rarity: 'normal',
    condition: stats => stats.totalCorrect >= 10,
    progress: stats => Math.min(10, stats.totalCorrect),
    maxProgress: 10,
    reward: { exp: 15 },
  },
  {
    id: 'scholar',
    title: '博学之士',
    desc: '累计答对 100 题',
    icon: '🎓',
    category: 'knowledge',
    rarity: 'rare',
    condition: stats => stats.totalCorrect >= 100,
    progress: stats => Math.min(100, stats.totalCorrect),
    maxProgress: 100,
    reward: { exp: 50 },
  },
  {
    id: 'sage',
    title: '一代宗师',
    desc: '累计答对 1000 题',
    icon: '📜',
    category: 'knowledge',
    rarity: 'legendary',
    condition: stats => stats.totalCorrect >= 1000,
    progress: stats => Math.min(1000, stats.totalCorrect),
    maxProgress: 1000,
    reward: { exp: 500 },
  },
  {
    id: 'wrong_collector',
    title: '知错能改',
    desc: '累计答错 50 题',
    icon: '❌',
    category: 'knowledge',
    rarity: 'normal',
    condition: stats => stats.totalWrong >= 50,
    progress: stats => Math.min(50, stats.totalWrong),
    maxProgress: 50,
    reward: { exp: 20 },
  },
  {
    id: 'accuracy_master',
    title: '精准打击',
    desc: '累计答对率 ≥ 80%（答对 ≥ 100 题时）',
    icon: '🎯',
    category: 'knowledge',
    rarity: 'epic',
    condition: stats =>
      stats.totalCorrect >= 100 && stats.totalCorrect / (stats.totalCorrect + stats.totalWrong) >= 0.8,
    progress: stats => Math.min(100, stats.totalCorrect),
    maxProgress: 100,
    reward: { exp: 200 },
  },
  {
    id: 'chem_master',
    title: '化学大师',
    desc: '答对 200 道化学题',
    icon: '🧪',
    category: 'knowledge',
    rarity: 'epic',
    condition: allStats => ((allStats.subjectCorrect || {}).chem || 0) >= 200,
    progress: allStats => (allStats.subjectCorrect || {}).chem || 0,
    maxProgress: 200,
    reward: { exp: 150 },
  },
  {
    id: 'bio_master',
    title: '生物大师',
    desc: '答对 200 道生物题',
    icon: '🧬',
    category: 'knowledge',
    rarity: 'epic',
    condition: allStats => ((allStats.subjectCorrect || {}).bio || 0) >= 200,
    progress: allStats => (allStats.subjectCorrect || {}).bio || 0,
    maxProgress: 200,
    reward: { exp: 150 },
  },
  {
    id: 'yi_master',
    title: '易学大师',
    desc: '答对 200 道易学题',
    icon: '☯',
    category: 'knowledge',
    rarity: 'epic',
    condition: allStats => ((allStats.subjectCorrect || {}).yi || 0) >= 200,
    progress: allStats => (allStats.subjectCorrect || {}).yi || 0,
    maxProgress: 200,
    reward: { exp: 150 },
  },

  // === 收集成就 ===
  {
    id: 'first_fish',
    title: '初钓者',
    desc: '钓到第一条鱼',
    icon: '🎣',
    category: 'collection',
    rarity: 'normal',
    condition: stats => stats.totalFishes >= 1,
    progress: stats => Math.min(1, stats.totalFishes),
    maxProgress: 1,
    reward: { exp: 10 },
  },
  {
    id: 'fishing_master',
    title: '垂钓大师',
    desc: '累计钓到 100 条鱼',
    icon: '🐟',
    category: 'collection',
    rarity: 'rare',
    condition: stats => stats.totalFishes >= 100,
    progress: stats => Math.min(100, stats.totalFishes),
    maxProgress: 100,
    reward: { exp: 50 },
  },
  {
    id: 'first_pet',
    title: '驯兽师',
    desc: '收养第一只怪物',
    icon: '🐾',
    category: 'collection',
    rarity: 'normal',
    condition: farm => farm.length >= 1,
    progress: farm => Math.min(1, farm.length),
    maxProgress: 1,
    reward: { exp: 20 },
  },
  {
    id: 'pet_collector',
    title: '怪物收藏家',
    desc: '收养 10 只不同的怪物',
    icon: '🏡',
    category: 'collection',
    rarity: 'epic',
    condition: farm => farm.length >= 10,
    progress: farm => Math.min(10, farm.length),
    maxProgress: 10,
    reward: { exp: 100 },
  },
  {
    id: 'first_forge',
    title: '铁匠学徒',
    desc: '首次锻造物品',
    icon: '🔨',
    category: 'collection',
    rarity: 'normal',
    condition: stats => stats.totalForges >= 1,
    progress: stats => Math.min(1, stats.totalForges),
    maxProgress: 1,
    reward: { exp: 15 },
  },
  {
    id: 'forge_master',
    title: '锻造大师',
    desc: '累计锻造 50 次',
    icon: '⚒️',
    category: 'collection',
    rarity: 'rare',
    condition: stats => stats.totalForges >= 50,
    progress: stats => Math.min(50, stats.totalForges),
    maxProgress: 50,
    reward: { exp: 80 },
  },
  {
    id: 'first_book',
    title: '书虫',
    desc: '钓到第一本古籍',
    icon: '📖',
    category: 'collection',
    rarity: 'normal',
    condition: cyclopedia => cyclopedia.books && Object.keys(cyclopedia.books).length >= 1,
    progress: cyclopedia => Math.min(1, Object.keys(cyclopedia.books || {}).length),
    maxProgress: 1,
    reward: { exp: 20 },
  },
  {
    id: 'book_collector',
    title: '藏书家',
    desc: '收集 20 本古籍',
    icon: '📚',
    category: 'collection',
    rarity: 'epic',
    condition: cyclopedia => cyclopedia.books && Object.keys(cyclopedia.books).length >= 20,
    progress: cyclopedia => Math.min(20, Object.keys(cyclopedia.books || {}).length),
    maxProgress: 20,
    reward: { exp: 150 },
  },
  {
    id: 'fishing_500',
    title: '江河霸主',
    desc: '累计钓到 500 条鱼',
    icon: '🐋',
    category: 'collection',
    rarity: 'legendary',
    condition: stats => stats.totalFishes >= 500,
    progress: stats => Math.min(500, stats.totalFishes),
    maxProgress: 500,
    reward: { exp: 300 },
  },
  {
    id: 'monster_all',
    title: '万物图鉴',
    desc: '解锁全部怪物图鉴',
    icon: '📖',
    category: 'collection',
    rarity: 'legendary',
    condition: cyclopedia => {
      const monsters = cyclopedia.monsters || []
      return monsters.length >= 38
    },
    progress: cyclopedia => Math.min(38, (cyclopedia.monsters || []).length),
    maxProgress: 38,
    reward: { exp: 500 },
  },
  {
    id: 'forge_10',
    title: '资深铁匠',
    desc: '累计锻造 10 次',
    icon: '🔨',
    category: 'collection',
    rarity: 'normal',
    condition: stats => stats.totalForges >= 10,
    progress: stats => Math.min(10, stats.totalForges),
    maxProgress: 10,
    reward: { exp: 30 },
  },
  {
    id: 'pet_5',
    title: '动物园主',
    desc: '收养 5 只不同的怪物',
    icon: '🏠',
    category: 'collection',
    rarity: 'rare',
    condition: farm => farm.length >= 5,
    progress: farm => Math.min(5, farm.length),
    maxProgress: 5,
    reward: { exp: 50 },
  },

  // === 限定成就（限时Boss专属）===
  {
    id: 'slay_element_king',
    title: '元素征服者',
    desc: '击败元素周期大魔王（限定成就）',
    icon: '⚛️',
    category: 'limited',
    rarity: 'legendary',
    condition: weeklyDefeated => (weeklyDefeated || []).some(k => k.includes('weekly_chem')),
    progress: weeklyDefeated => ((weeklyDefeated || []).some(k => k.includes('weekly_chem')) ? 1 : 0),
    maxProgress: 1,
    reward: { exp: 300 },
  },
  {
    id: 'slay_gene_tyrant',
    title: '基因猎手',
    desc: '击败基因编辑暴君（限定成就）',
    icon: '✂️',
    category: 'limited',
    rarity: 'legendary',
    condition: weeklyDefeated => (weeklyDefeated || []).some(k => k.includes('weekly_bio')),
    progress: weeklyDefeated => ((weeklyDefeated || []).some(k => k.includes('weekly_bio')) ? 1 : 0),
    maxProgress: 1,
    reward: { exp: 300 },
  },
  {
    id: 'slay_chaos_lord',
    title: '破卦者',
    desc: '击败六爻混沌主（限定成就）',
    icon: '☯️',
    category: 'limited',
    rarity: 'legendary',
    condition: weeklyDefeated => (weeklyDefeated || []).some(k => k.includes('weekly_yi')),
    progress: weeklyDefeated => ((weeklyDefeated || []).some(k => k.includes('weekly_yi')) ? 1 : 0),
    maxProgress: 1,
    reward: { exp: 300 },
  },
  {
    id: 'weekly_hunter',
    title: '周常猎手',
    desc: '累计击败 5 次周常大魔王',
    icon: '🏹',
    category: 'limited',
    rarity: 'epic',
    condition: weeklyDefeated => (weeklyDefeated || []).length >= 5,
    progress: weeklyDefeated => Math.min(5, (weeklyDefeated || []).length),
    maxProgress: 5,
    reward: { exp: 150 },
  },
  {
    id: 'weekly_master',
    title: '周常大师',
    desc: '累计击败 10 次周常大魔王',
    icon: '👑',
    category: 'limited',
    rarity: 'legendary',
    condition: weeklyDefeated => (weeklyDefeated || []).length >= 10,
    progress: weeklyDefeated => Math.min(10, (weeklyDefeated || []).length),
    maxProgress: 10,
    reward: { exp: 500 },
  },

  // === 等级成就 ===
  {
    id: 'level_5',
    title: '小试牛刀',
    desc: '达到 5 级',
    icon: '🌱',
    category: 'level',
    rarity: 'normal',
    condition: level => level >= 5,
    progress: level => Math.min(5, level),
    maxProgress: 5,
    reward: { exp: 15 },
  },
  {
    id: 'level_10',
    title: '崭露头角',
    desc: '达到 10 级',
    icon: '⭐',
    category: 'level',
    rarity: 'normal',
    condition: level => level >= 10,
    progress: level => Math.min(10, level),
    maxProgress: 10,
    reward: { exp: 30 },
  },
  {
    id: 'level_25',
    title: '小有名气',
    desc: '达到 25 级',
    icon: '🌟',
    category: 'level',
    rarity: 'rare',
    condition: level => level >= 25,
    progress: level => Math.min(25, level),
    maxProgress: 25,
    reward: { exp: 80 },
  },
  {
    id: 'level_50',
    title: '名震一方',
    desc: '达到 50 级',
    icon: '💫',
    category: 'level',
    rarity: 'epic',
    condition: level => level >= 50,
    progress: level => Math.min(50, level),
    maxProgress: 50,
    reward: { exp: 200 },
  },
  {
    id: 'level_75',
    title: '隐世高手',
    desc: '达到 75 级',
    icon: '🔥',
    category: 'level',
    rarity: 'epic',
    condition: level => level >= 75,
    progress: level => Math.min(75, level),
    maxProgress: 75,
    reward: { exp: 350 },
  },
  {
    id: 'level_100',
    title: '传说之人',
    desc: '达到 100 级',
    icon: '✨',
    category: 'level',
    rarity: 'legendary',
    condition: level => level >= 100,
    progress: level => Math.min(100, level),
    maxProgress: 100,
    reward: { exp: 500 },
  },
]

/**
 * 成就稀有度配色
 */
export const RARITY_COLORS = {
  normal: { color: '#a0a0a0', bg: 'rgba(160, 160, 160, 0.1)', border: 'rgba(160, 160, 160, 0.3)', label: '普通' },
  rare: { color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)', border: 'rgba(52, 152, 219, 0.3)', label: '稀有' },
  epic: { color: '#9b59b6', bg: 'rgba(155, 89, 182, 0.1)', border: 'rgba(155, 89, 182, 0.3)', label: '史诗' },
  legendary: { color: '#f1c40f', bg: 'rgba(241, 196, 15, 0.1)', border: 'rgba(241, 196, 15, 0.3)', label: '传说' },
}

/**
 * 成就分类名称
 */
export const CATEGORY_NAMES = {
  combat: '战斗',
  knowledge: '知识',
  collection: '收集',
  level: '等级',
}

export interface AchievementState {
  stats?: Record<string, unknown>
  farm?: unknown[]
  level?: number
  allClearCount?: number
  cyclopedia?: Record<string, unknown>
  weeklyBossDefeated?: string[]
}

/**
 * 检查成就解锁状态
 */
export function checkAchievementUnlocked(achievement: Achievement, state: AchievementState | string[]): boolean {
  const { stats, farm, level, allClearCount, cyclopedia } = state as AchievementState
  switch (achievement.category) {
    case 'combat':
      if (achievement.id === 'all_clear') return achievement.condition(allClearCount || 0)
      if (achievement.id === 'all_clear_50') return achievement.condition(allClearCount || 0)
      return achievement.condition(stats || {})
    case 'knowledge':
      return achievement.condition(stats || {})
    case 'collection':
      if (achievement.id === 'first_pet' || achievement.id === 'pet_collector') {
        return achievement.condition(farm || [])
      }
      if (achievement.id === 'first_book' || achievement.id === 'book_collector') {
        return achievement.condition(cyclopedia || {})
      }
      return achievement.condition(stats || {})
    case 'level':
      return achievement.condition(level || 1)
    case 'limited': {
      const bossData = Array.isArray(state) ? state : state.weeklyBossDefeated || []
      return achievement.condition(bossData)
    }
    default:
      return false
  }
}

/**
 * 获取成就进度
 */
export function getAchievementProgress(achievement: Achievement, state: AchievementState | string[]): number {
  const { stats, farm, level, allClearCount, cyclopedia } = state as AchievementState
  switch (achievement.category) {
    case 'combat':
      if (achievement.id === 'all_clear') return achievement.progress(allClearCount || 0)
      if (achievement.id === 'all_clear_50') return achievement.progress(allClearCount || 0)
      return achievement.progress(stats || {})
    case 'knowledge':
      return achievement.progress(stats || {})
    case 'collection':
      if (achievement.id === 'first_pet' || achievement.id === 'pet_collector') {
        return achievement.progress(farm || [])
      }
      if (achievement.id === 'first_book' || achievement.id === 'book_collector') {
        return achievement.progress(cyclopedia || {})
      }
      return achievement.progress(stats || {})
    case 'level':
      return achievement.progress(level || 1)
    case 'limited': {
      const bossData = Array.isArray(state) ? state : state.weeklyBossDefeated || []
      return achievement.progress(bossData)
    }
    default:
      return 0
  }
}

/**
 * 成就解锁动画配置
 */
export const ACHIEVEMENT_UNLOCK_ANIMATION = {
  duration: 3000,
  entrance: 'slideInUp',
  exit: 'slideOutUp',
  particleCount: 30,
}
