// questions.js - 生化易界题库（合并旧版全部数据）
import { CHEM_EASY } from './chem_easy.js'
import { CHEM_MEDIUM_1 } from './chem_medium_1.js'
import { CHEM_MEDIUM_2 } from './chem_medium_2.js'
import { CHEM_HARD } from './chem_hard.js'
import { CHEM_EXP_MEDIUM } from './chem_exp_medium.js'
import { CHEM_EXP_HARD } from './chem_exp_hard.js'
import { BIO_EASY } from './bio_easy.js'
import { BIO_MEDIUM } from './bio_medium.js'
import { BIO_HARD } from './bio_hard.js'
import { BIO_EXP_MEDIUM } from './bio_exp_medium.js'
import { BIO_EXP_HARD } from './bio_exp_hard.js'
import { YI_MEDIUM } from './yi_medium.js'

// 化学题库
export const CHEM_QUESTIONS = [
  ...CHEM_EASY,
  ...CHEM_MEDIUM_1,
  ...CHEM_MEDIUM_2,
  ...CHEM_HARD,
  ...CHEM_EXP_MEDIUM,
  ...CHEM_EXP_HARD
]

// 生物题库
export const BIO_QUESTIONS = [
  ...BIO_EASY,
  ...BIO_MEDIUM,
  ...BIO_HARD,
  ...BIO_EXP_MEDIUM,
  ...BIO_EXP_HARD
]

// 易学题库
export const YI_QUESTIONS = YI_MEDIUM

// 全部题目汇总
export const ALL_QUESTIONS = [
  ...CHEM_QUESTIONS,
  ...BIO_QUESTIONS,
  ...YI_QUESTIONS
]

// 为每道题添加唯一 id（基于题目文本的哈希，不依赖外部 id）
function getQuestionId(q) {
  // 用题目文本 + 答案选项拼接后的简单 hash
  const str = (q.q || '') + (q.options ? q.options.join('|') : '') + (q.answer ?? '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return 'q_' + Math.abs(h).toString(36)
}

// 给所有题目添加 id 和 _hash（一次性计算）
ALL_QUESTIONS.forEach(q => {
  q.id = getQuestionId(q)
})

// 已用题目记录：按 difficulty 维护已用 id 集合
// 注意：这是全局单例，游戏生命周期内持续有效，刷新页面重置
const usedQuestions = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
  all: new Set()  // 跨难度的全局已用记录（可选）
}

// 重置已用记录（如用户要求重新开始、或所有题目用完了）
export function resetUsedQuestions(difficulty = null) {
  if (difficulty) {
    usedQuestions[difficulty] = new Set()
  } else {
    usedQuestions.easy = new Set()
    usedQuestions.medium = new Set()
    usedQuestions.hard = new Set()
    usedQuestions.all = new Set()
  }
}

// 获取已用记录数量（调试）
export function getUsedCount() {
  return {
    easy: usedQuestions.easy.size,
    medium: usedQuestions.medium.size,
    hard: usedQuestions.hard.size,
    all: usedQuestions.all.size
  }
}

// 导出已用记录（用于存档持久化）
export function exportUsedQuestions() {
  return {
    easy: Array.from(usedQuestions.easy),
    medium: Array.from(usedQuestions.medium),
    hard: Array.from(usedQuestions.hard),
    all: Array.from(usedQuestions.all),
    lastResetFloor
  }
}

// 导入已用记录（从存档恢复）
export function importUsedQuestions(data) {
  if (!data) return
  usedQuestions.easy = new Set(data.easy || [])
  usedQuestions.medium = new Set(data.medium || [])
  usedQuestions.hard = new Set(data.hard || [])
  usedQuestions.all = new Set(data.all || [])
  lastResetFloor = data.lastResetFloor || 0
}

// 按难度和学科筛选题目，优先从未使用过的题目中抽取
export function getQuestions(subject, difficulty, count = 5) {
  let pool = ALL_QUESTIONS.filter(q => {
    const matchSubject = subject === 'all' || q.subject === subject
    const matchDiff = difficulty === 'all' || q.diff === difficulty
    return matchSubject && matchDiff
  })
  
  if (pool.length === 0) return []
  
  // 先筛选出未使用过的题目
  let usedSet = usedQuestions[difficulty] || usedQuestions.all
  let unusedPool = pool.filter(q => !usedSet.has(q.id))
  
  // 如果未使用的题目不够，且池子总数量 > count，则只从 unused 中抽取（宁可数量少也不重复）
  // 如果 unused 为空，说明全部用完了，重置该难度的已用记录
  if (unusedPool.length === 0) {
    // 全部用完了，清空记录重新来
    if (difficulty !== 'all') {
      usedQuestions[difficulty] = new Set()
      usedSet = usedQuestions[difficulty]
    } else {
      usedQuestions.all = new Set()
      usedSet = usedQuestions.all
    }
    unusedPool = pool
  }
  
  // Fisher-Yates 洗牌算法，比 sort(() => Math.random() - 0.5) 更均匀
  const shuffled = [...unusedPool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))
  
  // 记录已用
  selected.forEach(q => {
    usedSet.add(q.id)
    // 同时记录到对应难度的集合中
    if (q.diff && usedQuestions[q.diff]) {
      usedQuestions[q.diff].add(q.id)
    }
  })
  
  return selected
}

// 按楼层获取题目（难度递增）
export function getQuestionsForFloor(floor, count = 5) {
  let difficulty = 'easy'
  if (floor >= 10) difficulty = 'hard'
  else if (floor >= 5) difficulty = 'medium'
  
  return getQuestions('all', difficulty, count)
}
