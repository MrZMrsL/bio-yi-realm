import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { ALL_QUESTIONS, getQuestionsForFloor, ensureQuestionsForSpec } from '../data/questions.ts'
import { getBookSubject } from '../data/fishingUtils.ts'
import { sfxCorrect, sfxWrong } from '../utils/sfx.ts'
import { shuffle } from '../utils/array.js'
import { usePlayerStore } from './playerStore.ts'
import type { LevelUpResult } from './playerStore.ts'
import { useCyclopediaStore } from './cyclopediaStore.ts'
import { saveNow } from '../services/saveService.js'
import {
  FISHING_DAILY_LIMIT,
  FISHING_BOOK_STUDY_EXP,
  FISHING_BOOK_QUIZ_HIGH_THRESHOLD,
  FISHING_BOOK_QUIZ_MID_THRESHOLD,
  FISHING_BOOK_QUIZ_HIGH_EXP,
  FISHING_BOOK_QUIZ_MID_EXP,
  FISHING_BOOK_QUIZ_LOW_EXP,
  FISHING_RELEASE_EXP_RATIO,
} from '../config/balance.js'
import { logger } from '../utils/logger.js'
import type { Fish, Book } from '../types.ts'

interface Question {
  id?: string | number
  subject?: string
  answer: number
  [key: string]: unknown
}

interface CollectedKnowledge extends Book {
  learnedAt: number
}

interface StudyAnswerResult {
  correct: boolean
  expGain?: number
  book?: Book | null
  error?: string
}

interface QuizAnswerResult {
  done: boolean
  current?: Question
  correctCount?: number
  totalCount?: number
  expGain?: number
}

interface FishPermission {
  allowed: boolean
  reason: string | null
}

export const useFishingStore = defineStore('fishing', () => {
  // ===== 钓鱼系统 =====
  const fishingLevel = ref<number>(1)
  const recentCatches = ref<Fish[]>([])
  const fishCollection = ref<Record<string, number>>({})
  const bookStudyQuestion = shallowRef<Question | null>(null)
  const bookStudyMode = ref<boolean>(false)
  const bookStudyCurrent = shallowRef<Book | null>(null)
  const dailyFishCount = ref<number>(0)
  const fishLimitUnlocked = ref<boolean>(false)

  // ===== 知识点收藏 =====
  const collectedKnowledge = ref<CollectedKnowledge[]>([])

  // ===== 古籍测验系统（自习室）=====
  const bookQuizActive = ref<boolean>(false)
  const bookQuizQuestions = shallowRef<Question[]>([])
  const bookQuizIndex = ref<number>(0)
  const bookQuizCorrectCount = ref<number>(0)
  const bookQuizTotalCount = ref<number>(0)
  const bookQuizDone = ref<boolean>(false)
  const bookQuizResults = ref<{ correct: boolean; question: Question }[]>([])
  const bookQuizBookName = ref<string>('')
  const bookQuizRewardExp = ref<number>(0)

  const bookQuizCurrentQuestion = computed<Question | null>(() => {
    if (bookQuizIndex.value < bookQuizQuestions.value.length) {
      return bookQuizQuestions.value[bookQuizIndex.value]
    }
    return null
  })

  function recordFishCatch(fish: Fish) {
    const cyclopediaStore = useCyclopediaStore()
    if (!fish) return
    recentCatches.value.unshift(fish)
    if (recentCatches.value.length > 50) {
      recentCatches.value.pop()
    }
    fishCollection.value[fish.name] = (fishCollection.value[fish.name] || 0) + 1
    cyclopediaStore.updateStats('totalFishes', 1)
    cyclopediaStore.addToCyclopedia('fishes', fish.name)
    cyclopediaStore.checkAchievements()
  }

  function removeFishFromRecent(fish: Fish) {
    if (!fish) return
    const idx = recentCatches.value.findIndex(f => f.name === fish.name)
    if (idx !== -1) {
      recentCatches.value.splice(idx, 1)
    }
    if (fishCollection.value[fish.name]) {
      fishCollection.value[fish.name]--
      if (fishCollection.value[fish.name] <= 0) {
        delete fishCollection.value[fish.name]
      }
    }
  }

  function eatFish(fish: Fish): void {
    const playerStore = usePlayerStore()
    if (!fish) return
    playerStore.heal(fish.healHp)
    removeFishFromRecent(fish)
    saveNow()
  }

  function releaseFish(fish: Fish): LevelUpResult {
    const playerStore = usePlayerStore()
    if (!fish) {
      return { leveled: false, titleChanged: false, titleDisplayLevel: playerStore.level }
    }
    const expGain = Math.floor(fish.healHp * FISHING_RELEASE_EXP_RATIO)
    const levelUpResult = playerStore.addExp(expGain)
    removeFishFromRecent(fish)
    saveNow()
    return levelUpResult
  }

  async function startBookStudy(book: Book): Promise<boolean> {
    const playerStore = usePlayerStore()
    if (!book) return false
    const bookSubject = getBookSubject(book)
    const subject = bookSubject && bookSubject !== 'all' ? bookSubject : playerStore.playerSpecialization || 'all'
    await ensureQuestionsForSpec(subject)
    const q = getQuestionsForFloor(Math.max(1, playerStore.floor - 2), 1, subject)[0]
    if (!q) {
      logger.warn('[bookStudy] 无法为 ' + subject + ' 加载题目')
      return false
    }
    bookStudyCurrent.value = book
    bookStudyQuestion.value = q as Question
    bookStudyMode.value = true
    return true
  }

  function submitBookStudyAnswer(index: number, devCorrect = false): StudyAnswerResult {
    const playerStore = usePlayerStore()
    const cyclopediaStore = useCyclopediaStore()
    if (!bookStudyQuestion.value) return { correct: false, error: 'no_question' }
    const correct = devCorrect ? true : index === bookStudyQuestion.value.answer
    bookStudyMode.value = false
    if (correct) {
      const book = bookStudyCurrent.value
      if (book && !collectedKnowledge.value.some(k => k.name === book.name)) {
        collectedKnowledge.value.push({ ...book, learnedAt: Date.now() })
      }
      const expGain = FISHING_BOOK_STUDY_EXP
      playerStore.addExp(expGain)
      cyclopediaStore.addToCyclopedia('books', book?.name || '古籍')
      cyclopediaStore.checkAchievements()
      bookStudyQuestion.value = null
      bookStudyCurrent.value = null
      saveNow()
      return { correct: true, expGain, book }
    } else {
      bookStudyQuestion.value = null
      bookStudyCurrent.value = null
      saveNow()
      return { correct: false }
    }
  }

  function cancelBookStudy() {
    bookStudyQuestion.value = null
    bookStudyCurrent.value = null
    bookStudyMode.value = false
  }

  async function startBookQuiz(bookName: string, count = 3) {
    const subject = getBookSubject({ name: bookName })
    await ensureQuestionsForSpec(subject)
    const pool = ALL_QUESTIONS.filter((q: Question) => {
      if (subject === 'all') return true
      return q.subject === subject
    })
    const shuffled = shuffle(pool)
    const questions = shuffled.slice(0, count)

    bookQuizQuestions.value = questions as Question[]
    bookQuizIndex.value = 0
    bookQuizCorrectCount.value = 0
    bookQuizTotalCount.value = questions.length
    bookQuizActive.value = true
    bookQuizDone.value = false
    bookQuizResults.value = []
    bookQuizBookName.value = bookName
    bookQuizRewardExp.value = 0
  }

  function submitBookQuizAnswer(index: number): QuizAnswerResult {
    const playerStore = usePlayerStore()
    const cyclopediaStore = useCyclopediaStore()
    const q = bookQuizQuestions.value[bookQuizIndex.value]
    if (!q) return { done: true }

    const correct = index === q.answer
    if (correct) {
      bookQuizCorrectCount.value++
      sfxCorrect()
    } else {
      sfxWrong()
    }

    bookQuizResults.value.push({ correct, question: q })
    bookQuizIndex.value++

    if (bookQuizIndex.value >= bookQuizQuestions.value.length) {
      const pct = bookQuizCorrectCount.value / bookQuizTotalCount.value
      let expGain = 0
      if (pct >= FISHING_BOOK_QUIZ_HIGH_THRESHOLD) expGain = FISHING_BOOK_QUIZ_HIGH_EXP
      else if (pct >= FISHING_BOOK_QUIZ_MID_THRESHOLD) expGain = FISHING_BOOK_QUIZ_MID_EXP
      else expGain = FISHING_BOOK_QUIZ_LOW_EXP

      if (expGain > 0) {
        bookQuizRewardExp.value = expGain
        playerStore.addExp(expGain)
      }

      bookQuizActive.value = false
      bookQuizDone.value = true
      cyclopediaStore.checkAchievements()
      saveNow()
      return { done: true, correctCount: bookQuizCorrectCount.value, totalCount: bookQuizTotalCount.value, expGain }
    }

    return { done: false, current: bookQuizQuestions.value[bookQuizIndex.value] }
  }

  function exitBookQuiz() {
    bookQuizActive.value = false
    bookQuizDone.value = false
    bookQuizQuestions.value = []
    bookQuizResults.value = []
    bookQuizRewardExp.value = 0
  }

  function canFishToday(): FishPermission {
    if (dailyFishCount.value < FISHING_DAILY_LIMIT) return { allowed: true, reason: null }
    return { allowed: false, reason: 'limit_reached' }
  }

  function unlockFishLimit() {
    dailyFishCount.value = 0
    saveNow()
  }

  function reset() {
    fishingLevel.value = 1
    recentCatches.value = []
    fishCollection.value = {}
    bookStudyQuestion.value = null
    bookStudyMode.value = false
    bookStudyCurrent.value = null
    dailyFishCount.value = 0
    fishLimitUnlocked.value = false
    collectedKnowledge.value = []
    bookQuizActive.value = false
    bookQuizQuestions.value = []
    bookQuizIndex.value = 0
    bookQuizCorrectCount.value = 0
    bookQuizTotalCount.value = 0
    bookQuizDone.value = false
    bookQuizResults.value = []
    bookQuizBookName.value = ''
    bookQuizRewardExp.value = 0
  }

  function serialize(): Record<string, unknown> {
    return {
      fishingLevel: fishingLevel.value,
      recentCatches: recentCatches.value,
      fishCollection: fishCollection.value,
      collectedKnowledge: collectedKnowledge.value,
      dailyFishCount: dailyFishCount.value,
      fishLimitUnlocked: fishLimitUnlocked.value,
    }
  }

  function deserialize(saveData: Record<string, unknown>) {
    reset()
    fishingLevel.value = (saveData.fishingLevel as number) || 1
    recentCatches.value = (saveData.recentCatches as Fish[]) || []
    fishCollection.value = (saveData.fishCollection as Record<string, number>) || {}
    collectedKnowledge.value = (saveData.collectedKnowledge as CollectedKnowledge[]) || []
    dailyFishCount.value = (saveData.dailyFishCount as number) || 0
    fishLimitUnlocked.value = (saveData.fishLimitUnlocked as boolean) || false
  }

  return {
    fishingLevel,
    recentCatches,
    fishCollection,
    bookStudyQuestion,
    bookStudyMode,
    bookStudyCurrent,
    dailyFishCount,
    fishLimitUnlocked,
    collectedKnowledge,
    bookQuizActive,
    bookQuizQuestions,
    bookQuizIndex,
    bookQuizCorrectCount,
    bookQuizTotalCount,
    bookQuizDone,
    bookQuizResults,
    bookQuizBookName,
    bookQuizRewardExp,
    bookQuizCurrentQuestion,
    recordFishCatch,
    removeFishFromRecent,
    eatFish,
    releaseFish,
    startBookStudy,
    submitBookStudyAnswer,
    cancelBookStudy,
    startBookQuiz,
    submitBookQuizAnswer,
    exitBookQuiz,
    canFishToday,
    unlockFishLimit,
    reset,
    serialize,
    deserialize,
  }
})
