import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { saveWrongQuestion, loadWrongQuestions } from '../data/wrong_book.ts'
import type { Question } from '../types.ts'

interface WrongQuestion {
  id: string
  question?: Question
  q?: string
  options?: string[]
  answer?: number
  subject?: 'chem' | 'bio' | 'yi'
  diff?: 'easy' | 'medium' | 'hard'
  wrongAnswer: number
  wrongCount: number
  lastWrongTime: number
  mastered: boolean
}

interface ReviewItem {
  id: string
  q: string
  options: string[]
  answer: number
  subject: 'chem' | 'bio' | 'yi'
  diff: 'easy' | 'medium' | 'hard'
  wrongCount: number
}

interface ReviewResult {
  id: string
  correct: boolean
  subject: 'chem' | 'bio' | 'yi'
  diff: 'easy' | 'medium' | 'hard'
}

export const useReviewStore = defineStore('review', () => {
  // ===== 错题本 =====
  const wrongQuestions = ref<WrongQuestion[]>([])
  const wrongStats = computed(() => {
    const total = wrongQuestions.value.length
    const mastered = wrongQuestions.value.filter(wq => wq.mastered).length
    const pending = total - mastered
    const bySubject = {
      chem: wrongQuestions.value.filter(wq => wq.question?.subject === 'chem').length,
      bio: wrongQuestions.value.filter(wq => wq.question?.subject === 'bio').length,
      yi: wrongQuestions.value.filter(wq => wq.question?.subject === 'yi').length,
    }
    return { total, mastered, pending, bySubject }
  })
  const reviewMode = ref(false)
  const reviewCurrent = ref<ReviewItem | null>(null)
  const reviewIndex = ref(0)
  const reviewPool = shallowRef<ReviewItem[]>([])
  const reviewResults = ref<ReviewResult[]>([])

  function recordWrongQuestion(q: Question, wrongAnswer: number) {
    if (!q) return
    const existing = wrongQuestions.value.find(wq => wq.id === q.id)
    if (existing) {
      existing.wrongCount++
      existing.wrongAnswer = wrongAnswer
      existing.lastWrongTime = Date.now()
      existing.mastered = false
    } else {
      wrongQuestions.value.push({
        id: q.id,
        question: q,
        wrongAnswer: wrongAnswer,
        wrongCount: 1,
        lastWrongTime: Date.now(),
        mastered: false,
      })
    }
    saveWrongQuestion(wrongQuestions.value)
  }

  function masterQuestion(id: string) {
    const wq = wrongQuestions.value.find(wq => wq.id === id)
    if (wq) {
      wq.mastered = true
      saveWrongQuestion(wrongQuestions.value)
    }
  }

  function removeWrongQuestion(id: string) {
    wrongQuestions.value = wrongQuestions.value.filter(wq => wq.id !== id)
    saveWrongQuestion(wrongQuestions.value)
  }

  function startReview(subjectFilter?: 'chem' | 'bio' | 'yi') {
    reviewMode.value = true
    reviewIndex.value = 0
    reviewResults.value = []
    let pool = wrongQuestions.value.filter(wq => !wq.mastered)
    if (subjectFilter) {
      pool = pool.filter(wq => wq.question?.subject === subjectFilter || wq.subject === subjectFilter)
    }
    reviewPool.value = pool.map(wq => ({
      id: wq.id,
      q: wq.question?.q || wq.q || '',
      options: wq.question?.options || wq.options || [],
      answer: wq.question?.answer ?? wq.answer ?? 0,
      subject: (wq.question?.subject || wq.subject || 'chem') as 'chem' | 'bio' | 'yi',
      diff: (wq.question?.diff || wq.diff || 'easy') as 'easy' | 'medium' | 'hard',
      wrongCount: wq.wrongCount,
    }))
    reviewCurrent.value = reviewPool.value[0] || null
  }

  function submitReviewAnswer(index: number) {
    if (!reviewCurrent.value) return
    const correct = index === reviewCurrent.value.answer
    reviewResults.value.push({
      id: reviewCurrent.value.id,
      correct,
      subject: reviewCurrent.value.subject,
      diff: reviewCurrent.value.diff,
    })
    if (correct) {
      masterQuestion(reviewCurrent.value.id)
    }
    reviewIndex.value++
    reviewCurrent.value = reviewPool.value[reviewIndex.value] || null
    if (!reviewCurrent.value) {
      reviewMode.value = false
    }
  }

  function exitReview() {
    reviewMode.value = false
    reviewCurrent.value = null
    reviewIndex.value = 0
    reviewPool.value = []
    reviewResults.value = []
  }

  function serialize() {
    // 错题本数据单独持久化（见 recordWrongQuestion/masterQuestion），复习会话状态不保存
    return {}
  }

  function reset() {
    wrongQuestions.value = []
    reviewMode.value = false
    reviewCurrent.value = null
    reviewIndex.value = 0
    reviewPool.value = []
    reviewResults.value = []
  }

  function deserialize(_saveData: Record<string, unknown>) {
    loadWrongQuestions()
    reset()
  }

  return {
    wrongQuestions,
    wrongStats,
    reviewMode,
    reviewCurrent,
    reviewIndex,
    reviewPool,
    reviewResults,
    recordWrongQuestion,
    masterQuestion,
    removeWrongQuestion,
    startReview,
    submitReviewAnswer,
    exitReview,
    reset,
    serialize,
    deserialize,
  }
})
