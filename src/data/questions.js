// questions.js - 生化易界题库（合并旧版全部数据）
import { CHEM_EASY } from './chem_easy.js'
import { CHEM_MEDIUM_1 } from './chem_medium_1.js'
import { CHEM_MEDIUM_2 } from './chem_medium_2.js'
import { CHEM_HARD } from './chem_hard.js'
import { BIO_EASY } from './bio_easy.js'
import { BIO_MEDIUM } from './bio_medium.js'
import { BIO_HARD } from './bio_hard.js'
import { YI_MEDIUM } from './yi_medium.js'

// 化学题库
export const CHEM_QUESTIONS = [
  ...CHEM_EASY,
  ...CHEM_MEDIUM_1,
  ...CHEM_MEDIUM_2,
  ...CHEM_HARD
]

// 生物题库
export const BIO_QUESTIONS = [
  ...BIO_EASY,
  ...BIO_MEDIUM,
  ...BIO_HARD
]

// 易学题库
export const YI_QUESTIONS = YI_MEDIUM

// 全部题目汇总
export const ALL_QUESTIONS = [
  ...CHEM_QUESTIONS,
  ...BIO_QUESTIONS,
  ...YI_QUESTIONS
]

// 按难度和学科筛选题目
export function getQuestions(subject, difficulty, count = 5) {
  let pool = ALL_QUESTIONS.filter(q => {
    const matchSubject = subject === 'all' || q.subject === subject
    const matchDiff = difficulty === 'all' || q.diff === difficulty
    return matchSubject && matchDiff
  })
  
  // 随机抽取
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 按楼层获取题目（难度递增）
export function getQuestionsForFloor(floor, count = 5) {
  let difficulty = 'easy'
  if (floor >= 10) difficulty = 'hard'
  else if (floor >= 5) difficulty = 'medium'
  
  return getQuestions('all', difficulty, count)
}
