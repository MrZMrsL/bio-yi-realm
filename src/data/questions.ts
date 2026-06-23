// questions.ts - 生化易界题库（按学科动态加载版）
// 各学科题目拆分为独立 chunk，按需要加载

import { ref } from 'vue'
import { logger } from '../utils/logger.js'
import type { Question, UsedQuestionsData } from '../types.ts'

export const ALL_QUESTIONS: Question[] = []
export const CHEM_QUESTIONS: Question[] = []
export const BIO_QUESTIONS: Question[] = []
export const YI_QUESTIONS: Question[] = []

let _loadProgress = 0
let _preloadStarted = false

// #ifndef H5
// 小程序/App 不支持动态 import，静态导入所有题库
import { CHEM_QUESTIONS as STATIC_CHEM } from './questions/chemQuestions.ts'
import { BIO_QUESTIONS as STATIC_BIO } from './questions/bioQuestions.ts'
import { YI_QUESTIONS as STATIC_YI } from './questions/yiQuestions.ts'

function initStaticQuestions() {
  if (loadedSubjects.size > 0) return
  CHEM_QUESTIONS.push(...STATIC_CHEM)
  BIO_QUESTIONS.push(...STATIC_BIO)
  YI_QUESTIONS.push(...STATIC_YI)

  ALL_QUESTIONS.length = 0
  ALL_QUESTIONS.push(...CHEM_QUESTIONS, ...BIO_QUESTIONS, ...YI_QUESTIONS)

  for (const q of ALL_QUESTIONS) {
    if (!q.id) q.id = getQuestionId(q)
  }

  loadedSubjects.add('chem')
  loadedSubjects.add('bio')
  loadedSubjects.add('yi')
  _loadProgress = 100
}
// #endif

/** 题库加载错误信息（用于 UI 提示重试） */
export const loadError = ref<string | null>(null)
/** 是否正在加载题库 */
export const isLoadingQuestions = ref(false)

const loadedSubjects = new Set<string>()
const loadingPromises = new Map<string, Promise<void>>()

async function loadSubject(subject: string) {
  if (loadedSubjects.has(subject)) return
  if (loadingPromises.has(subject)) {
    await loadingPromises.get(subject)
    return
  }

  const promise = (async () => {
    isLoadingQuestions.value = true
    loadError.value = null
    try {
      // #ifdef H5
      let mod
      if (subject === 'chem') mod = await import('./questions/chemQuestions.ts')
      else if (subject === 'bio') mod = await import('./questions/bioQuestions.ts')
      else if (subject === 'yi') mod = await import('./questions/yiQuestions.ts')
      else return

      if (subject === 'chem') {
        CHEM_QUESTIONS.push(...mod.CHEM_QUESTIONS)
      } else if (subject === 'bio') {
        BIO_QUESTIONS.push(...mod.BIO_QUESTIONS)
      } else if (subject === 'yi') {
        YI_QUESTIONS.push(...mod.YI_QUESTIONS)
      }

      ALL_QUESTIONS.length = 0
      ALL_QUESTIONS.push(...CHEM_QUESTIONS, ...BIO_QUESTIONS, ...YI_QUESTIONS)

      for (const q of ALL_QUESTIONS) {
        if (!q.id) q.id = getQuestionId(q)
      }

      loadedSubjects.add(subject)
      _loadProgress = Math.round((loadedSubjects.size / 3) * 100)
      // #endif

      // #ifndef H5
      initStaticQuestions()
      // #endif
    } catch (err) {
      loadError.value = `加载「${subject}」题库失败：${err?.message || '未知错误'}`
      logger.error('[questions] 加载学科题库失败:', subject, err)
    }
  })()

  loadingPromises.set(subject, promise)
  await promise
  loadingPromises.delete(subject)
  if (loadingPromises.size === 0) {
    isLoadingQuestions.value = false
  }
}

/**
 * 重试加载指定学科题库
 */
export async function retryLoadSubject(subject: string) {
  loadError.value = null
  await ensureQuestionsForSpec(subject)
}

export async function ensureQuestions(subject: string) {
  await loadSubject(subject)
}

export async function ensureAllQuestions() {
  _preloadStarted = true
  await ensureQuestions('chem')
  await ensureQuestions('bio')
  await ensureQuestions('yi')
}

export async function preloadQuestions() {
  await ensureAllQuestions()
}

export async function ensureQuestionsForSpec(spec: string) {
  if (spec === 'chem') await ensureQuestions('chem')
  else if (spec === 'bio') await ensureQuestions('bio')
  else if (spec === 'yi') await ensureQuestions('yi')
  else await ensureAllQuestions()
}

export function isQuestionsLoadedForSpec(spec: string): boolean {
  if (spec === 'chem') return loadedSubjects.has('chem')
  if (spec === 'bio') return loadedSubjects.has('bio')
  if (spec === 'yi') return loadedSubjects.has('yi')
  return loadedSubjects.has('chem') && loadedSubjects.has('bio') && loadedSubjects.has('yi')
}

export function getLoadProgress(): number {
  return _loadProgress
}

export function isQuestionsLoaded(): boolean {
  return loadedSubjects.has('chem') && loadedSubjects.has('bio') && loadedSubjects.has('yi')
}

export function isPreloadStarted(): boolean {
  return _preloadStarted
}

export function getLoadedDifficulty() {
  return { easy: true, medium: true, hard: true }
}

// 为每道题添加唯一 id
function getQuestionId(q: Question): string {
  const str = (q.q || '') + (q.options ? q.options.join('|') : '') + (q.answer ?? '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return 'q_' + Math.abs(h).toString(36)
}

// 已用题目记录
const usedQuestions: Record<'easy' | 'medium' | 'hard' | 'all', Set<string>> = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
  all: new Set(),
}

let lastResetFloor = 0

export function resetUsedQuestions(difficulty: 'easy' | 'medium' | 'hard' | 'all' | null = null) {
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
    all: usedQuestions.all.size,
  }
}

export function exportUsedQuestions(): UsedQuestionsData {
  return {
    easy: Array.from(usedQuestions.easy),
    medium: Array.from(usedQuestions.medium),
    hard: Array.from(usedQuestions.hard),
    all: Array.from(usedQuestions.all),
    lastResetFloor,
  }
}

export function importUsedQuestions(data: UsedQuestionsData | null) {
  if (!data) return
  usedQuestions.easy = new Set(data.easy || [])
  usedQuestions.medium = new Set(data.medium || [])
  usedQuestions.hard = new Set(data.hard || [])
  usedQuestions.all = new Set(data.all || [])
  lastResetFloor = data.lastResetFloor || 0
}

// 按难度和学科筛选题目
export function getQuestions(subject: string, difficulty: string, count: number = 5): Question[] {
  if (ALL_QUESTIONS.length === 0) {
    logger.warn('[questions] 题库未初始化')
    return []
  }

  const pool = ALL_QUESTIONS.filter(q => {
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

export function getAllQuestions(): Question[] {
  return [...ALL_QUESTIONS]
}

export function getQuestionsForFloor(floor: number, count: number = 5, spec: string = 'all'): Question[] {
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
