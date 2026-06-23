// 钓鱼工具函数（不依赖大鱼数据，避免 fishingStore 等核心模块静态引入 fishing.js）

import type { Book } from '../types.ts'

// 推断古籍的学科归属（兼容无subject字段的老书）
export function getBookSubject(book: Book): Book['subject'] | 'all' {
  if (book.subject) return book.subject
  const name = book.name || ''
  // 化学关键词
  const chemKeys = [
    '化学',
    '元素',
    '分子',
    '原子',
    '试剂',
    '热力学',
    '电化',
    '催化',
    '高分子',
    '药物',
    '环境',
    '量子',
    '无机',
    '分析',
    '有机',
    '物理化',
  ]
  // 生物关键词
  const bioKeys = [
    '生物',
    '基因',
    '细胞',
    '遗传',
    '免疫',
    '生态',
    '进化',
    '发育',
    '植物',
    '动物',
    '生理',
    '病理',
    '药理',
    '病毒',
    '微生物',
    '神经',
    '干细胞',
    '蛋白',
    '古生',
  ]
  // 易学关键词
  const yiKeys = ['易', '卦', '爻', '阴阳', '五行', '河图', '洛书', '梅花', '六爻', '皇极', '参同', '抱朴']

  if (chemKeys.some(k => name.includes(k))) return 'chem'
  if (bioKeys.some(k => name.includes(k))) return 'bio'
  if (yiKeys.some(k => name.includes(k))) return 'yi'
  return 'all'
}
