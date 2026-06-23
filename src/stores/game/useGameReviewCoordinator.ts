/**
 * 复习（错题本）协调器
 *
 * 负责把错题记录、掌握、复习答题等操作暴露给 game facade。
 */
import type { useReviewStore } from '../reviewStore.ts'

type ReviewStore = ReturnType<typeof useReviewStore>

export interface ReviewCoordinatorDependencies {
  reviewStore: ReviewStore
}

export function useGameReviewCoordinator(deps: ReviewCoordinatorDependencies) {
  const { reviewStore } = deps

  function recordWrongQuestion(...args: Parameters<ReviewStore['recordWrongQuestion']>): ReturnType<ReviewStore['recordWrongQuestion']> {
    return reviewStore.recordWrongQuestion(...args)
  }

  function masterQuestion(...args: Parameters<ReviewStore['masterQuestion']>): ReturnType<ReviewStore['masterQuestion']> {
    return reviewStore.masterQuestion(...args)
  }

  function removeWrongQuestion(...args: Parameters<ReviewStore['removeWrongQuestion']>): ReturnType<ReviewStore['removeWrongQuestion']> {
    return reviewStore.removeWrongQuestion(...args)
  }

  function startReview(...args: Parameters<ReviewStore['startReview']>): ReturnType<ReviewStore['startReview']> {
    return reviewStore.startReview(...args)
  }

  function submitReviewAnswer(...args: Parameters<ReviewStore['submitReviewAnswer']>): ReturnType<ReviewStore['submitReviewAnswer']> {
    return reviewStore.submitReviewAnswer(...args)
  }

  function exitReview(): ReturnType<ReviewStore['exitReview']> {
    return reviewStore.exitReview()
  }

  return {
    recordWrongQuestion,
    masterQuestion,
    removeWrongQuestion,
    startReview,
    submitReviewAnswer,
    exitReview,
  }
}
