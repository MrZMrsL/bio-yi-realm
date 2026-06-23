// limited_bosses.ts - 限时挑战Boss系统（周常大魔王）
// 每周自动刷新一个限定Boss，限时挑战，击败解锁限定成就

import type { WeeklyBoss } from '../types.ts'

export const WEEKLY_BOSSES: WeeklyBoss[] = [
  {
    id: 'weekly_chem',
    name: '元素周期大魔王',
    icon: '⚛️',
    subject: 'chem',
    subjectLabel: '化学',
    element: 'metal',
    desc: '掌控118种元素的化学霸主，能操控化学反应改变战场',
    difficulty: 3,
    skills: [
      {
        name: '核聚变',
        effect: 'heal',
        value: 0.25,
        cooldown: 3,
        desc: '每3回合恢复25%最大生命',
      },
      {
        name: '催化剂',
        effect: 'speed',
        value: 0.8,
        cooldown: 0,
        desc: '答题时间缩短至24秒',
      },
    ],
    baseHp: 200,
    baseAtk: 25,
    baseDef: 10,
    timeLimit: 60, // 每题60秒
    achievement: {
      id: 'slay_element_king',
      title: '元素征服者',
      desc: '击败元素周期大魔王',
      icon: '⚛️',
      rarity: 'legendary',
    },
    reward: {
      exp: 200,
      gold: 100,
      material: { name: '汞精华', count: 3 },
    },
  },
  {
    id: 'weekly_bio',
    name: '基因编辑暴君',
    icon: '✂️',
    subject: 'bio',
    subjectLabel: '生物',
    element: 'nature',
    desc: 'CRISPR-Cas9的终极化身，能改写自身基因无限进化',
    difficulty: 3,
    skills: [
      {
        name: '基因突变',
        effect: 'buff',
        value: 0.3,
        cooldown: 5,
        desc: '每5回合攻击提升30%',
      },
      {
        name: '端粒修复',
        effect: 'heal',
        value: 0.15,
        cooldown: 4,
        desc: '每4回合恢复15%最大生命',
      },
    ],
    baseHp: 220,
    baseAtk: 20,
    baseDef: 10,
    timeLimit: 60,
    achievement: {
      id: 'slay_gene_tyrant',
      title: '基因猎手',
      desc: '击败基因编辑暴君',
      icon: '✂️',
      rarity: 'legendary',
    },
    reward: {
      exp: 200,
      gold: 100,
      material: { name: '基因片段', count: 3 },
    },
  },
  {
    id: 'weekly_yi',
    name: '六爻混沌主',
    icon: '☯️',
    subject: 'yi',
    subjectLabel: '易学',
    element: 'spirit',
    desc: '由六十四卦混沌聚合而成的古老存在，命运难测',
    difficulty: 4,
    skills: [
      {
        name: '天雷无妄',
        effect: 'counter',
        value: 0.25,
        cooldown: 3,
        desc: '每3回合反伤25%',
      },
      {
        name: '空亡',
        effect: 'dodge',
        value: 0.2,
        cooldown: 2,
        desc: '有20%概率闪避攻击',
      },
    ],
    baseHp: 220,
    baseAtk: 28,
    baseDef: 8,
    timeLimit: 60,
    achievement: {
      id: 'slay_chaos_lord',
      title: '破卦者',
      desc: '击败六爻混沌主',
      icon: '☯️',
      rarity: 'legendary',
    },
    reward: {
      exp: 200,
      gold: 100,
      material: { name: '阴阳珠', count: 3 },
    },
  },
]

// Boss属性缩放：根据玩家等级动态调整
export function scaleBossForLevel(boss: WeeklyBoss, playerLevel: number): WeeklyBoss & { hp: number; maxHp: number; atk: number; def: number } {
  const scale = 1 + (playerLevel - 1) * 0.05 // 每级提升5%（原为8%，太难打）
  return {
    ...boss,
    hp: Math.floor(boss.baseHp * scale),
    maxHp: Math.floor(boss.baseHp * scale),
    atk: Math.floor(boss.baseAtk * scale),
    def: Math.floor(boss.baseDef * scale),
  }
}

// 获取当前周的Boss索引
export function getWeeklyBossIndex(): number {
  const now = new Date()
  const weekStart = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.floor((now.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return weekNum % WEEKLY_BOSSES.length
}

// 获取当前周的Boss
export function getWeeklyBoss(): WeeklyBoss {
  return WEEKLY_BOSSES[getWeeklyBossIndex()]
}

// 生成本周的击败记录key
export function getWeeklyBossKey(bossId: string): string {
  const now = new Date()
  const weekStart = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.floor((now.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return `week_${weekNum}_${bossId}`
}

// 检查是否已击败本周Boss
export function isWeeklyBossDefeated(bossId: string, defeatedList: string[]): boolean {
  if (!defeatedList || !Array.isArray(defeatedList)) return false
  const key = getWeeklyBossKey(bossId)
  return defeatedList.includes(key)
}

// 获取本周剩余时间（秒）
export function getWeeklyTimeRemaining(): number {
  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(now.getDate() + (7 - now.getDay()))
  nextWeek.setHours(0, 0, 0, 0)
  return Math.floor((nextWeek.getTime() - now.getTime()) / 1000)
}

// 格式化剩余时间
export function formatTimeRemaining(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${mins}分`
  return `${mins}分钟`
}
