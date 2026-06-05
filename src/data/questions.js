// questions.js - 生化易界题库（单文件静态加载版）
// 所有题目统一打包，零网络请求等待

// 静态加载全部题目（Vite自动合并为少数chunk，比14个动态import快数倍）
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
import { YI_EASY } from './yi_easy.js'
import { YI_MEDIUM } from './yi_medium.js'
import { YI_HARD } from './yi_hard.js'

export const ALL_QUESTIONS = []
export const CHEM_QUESTIONS = []
export const BIO_QUESTIONS = []
export const YI_QUESTIONS = []

let _loaded = false
let _loadProgress = 100

// 同步初始化（模块加载时一次性完成）
;(function init() {
  CHEM_QUESTIONS.length = 0
  CHEM_QUESTIONS.push(
    ...CHEM_EASY, ...CHEM_MEDIUM_1, ...CHEM_MEDIUM_2,
    ...CHEM_HARD, ...CHEM_EXP_MEDIUM, ...CHEM_EXP_HARD
  )

  BIO_QUESTIONS.length = 0
  BIO_QUESTIONS.push(
    ...BIO_EASY, ...BIO_MEDIUM, ...BIO_HARD,
    ...BIO_EXP_MEDIUM, ...BIO_EXP_HARD
  )

  YI_QUESTIONS.length = 0
  YI_QUESTIONS.push(...YI_EASY, ...YI_MEDIUM, ...YI_HARD)

  ALL_QUESTIONS.length = 0
  ALL_QUESTIONS.push(...CHEM_QUESTIONS, ...BIO_QUESTIONS, ...YI_QUESTIONS)

  for (const q of ALL_QUESTIONS) {
    q.id = getQuestionId(q)
  }

  _loaded = true
})()

export function getLoadProgress() { return _loadProgress }

// preloadQuestions 现在是一个空操作（数据已同步就绪）
export async function preloadQuestions() {
  return Promise.resolve()
}

export function ensureQuestionsForFloor(floor) {
  return Promise.resolve()
}

export function isQuestionsLoaded() {
  return _loaded
}

export function isPreloadStarted() {
  return true
}

export function getLoadedDifficulty() {
  return { easy: true, medium: true, hard: true }
}

// 为每道题添加唯一 id
function getQuestionId(q) {
  const str = (q.q || '') + (q.options ? q.options.join('|') : '') + (q.answer ?? '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return 'q_' + Math.abs(h).toString(36)
}

// 已用题目记录
const usedQuestions = {
  easy: new Set(), medium: new Set(), hard: new Set(), all: new Set()
}

let lastResetFloor = 0

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

export function getUsedCount() {
  return {
    easy: usedQuestions.easy.size,
    medium: usedQuestions.medium.size,
    hard: usedQuestions.hard.size,
    all: usedQuestions.all.size
  }
}

export function exportUsedQuestions() {
  return {
    easy: Array.from(usedQuestions.easy),
    medium: Array.from(usedQuestions.medium),
    hard: Array.from(usedQuestions.hard),
    all: Array.from(usedQuestions.all),
    lastResetFloor
  }
}

export function importUsedQuestions(data) {
  if (!data) return
  usedQuestions.easy = new Set(data.easy || [])
  usedQuestions.medium = new Set(data.medium || [])
  usedQuestions.hard = new Set(data.hard || [])
  usedQuestions.all = new Set(data.all || [])
  lastResetFloor = data.lastResetFloor || 0
}

// 按难度和学科筛选题目
export function getQuestions(subject, difficulty, count = 5) {
  if (ALL_QUESTIONS.length === 0) {
    console.warn('[questions] 题库未初始化')
    return []
  }

  let pool = ALL_QUESTIONS.filter(q => {
    const matchSubject = subject === 'all' || q.subject === subject
    const matchDiff = difficulty === 'all' || q.diff === difficulty
    return matchSubject && matchDiff
  })

  if (pool.length === 0) return []

  let usedSet = usedQuestions[difficulty] || usedQuestions.all
  let unusedPool = pool.filter(q => !usedSet.has(q.id))

  if (unusedPool.length === 0) {
    if (difficulty !== 'all') {
      usedQuestions[difficulty] = new Set()
      usedSet = usedQuestions[difficulty]
    } else {
      usedQuestions.all = new Set()
      usedSet = usedQuestions.all
    }
    unusedPool = pool
  }

  const shuffled = [...unusedPool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  selected.forEach(q => {
    usedSet.add(q.id)
    if (q.diff && usedQuestions[q.diff]) {
      usedQuestions[q.diff].add(q.id)
    }
  })

  return selected
}

export function getAllQuestions() {
  return [...ALL_QUESTIONS, ...CHEM_QUESTIONS, ...BIO_QUESTIONS, ...YI_QUESTIONS]
}

export function getQuestionsForFloor(floor, count = 5, spec = 'all') {
  let difficulty = 'easy'
  if (floor >= 10) difficulty = 'hard'
  else if (floor >= 5) difficulty = 'medium'

  let subject = 'all'
  if (spec === 'chem') subject = 'chem'
  else if (spec === 'bio') subject = 'bio'
  else if (spec === 'yi') subject = 'yi'
  else if (spec === 'biochem') {
    subject = Math.random() < 0.5 ? 'chem' : 'bio'
  }

  return getQuestions(subject, difficulty, count)
}
