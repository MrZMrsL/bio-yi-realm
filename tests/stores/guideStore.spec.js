import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGuideStore } from '../../src/stores/guideStore.ts'
import { GUIDE_STEPS } from '../../src/data/guideSteps.ts'

describe('guideStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态为未完成，没有展示过任何步骤', () => {
    const store = useGuideStore()
    expect(store.completed).toBe(false)
    expect(store.shownStepIds).toEqual([])
    expect(store.currentStep).toBeNull()
  })

  it('showStep 会展示未完成的步骤', () => {
    const store = useGuideStore()
    const ok = store.showStep('welcome')
    expect(ok).toBe(true)
    expect(store.currentStep.id).toBe('welcome')
  })

  it('已展示过的步骤不会重复展示', () => {
    const store = useGuideStore()
    store.showStep('welcome')
    store.nextStep()
    const ok = store.showStep('welcome')
    expect(ok).toBe(false)
  })

  it('完成后不再展示任何步骤', () => {
    const store = useGuideStore()
    store.completeGuide()
    expect(store.completed).toBe(true)
    const ok = store.showStep('welcome')
    expect(ok).toBe(false)
  })

  it('nextStep 会记录当前步骤并展示队列中的下一个', () => {
    const store = useGuideStore()
    store.showStep('welcome')
    store.showStep('choose-specialization')
    expect(store.currentStep.id).toBe('welcome')

    store.nextStep()
    expect(store.shownStepIds).toContain('welcome')
    expect(store.currentStep.id).toBe('choose-specialization')
  })

  it('skipGuide 会标记完成', () => {
    const store = useGuideStore()
    store.showStep('welcome')
    store.skipGuide()
    expect(store.completed).toBe(true)
    expect(store.currentStep).toBeNull()
  })

  it('serialize/deserialize 能正确保存和恢复进度', () => {
    const store = useGuideStore()
    store.showStep('welcome')
    store.nextStep()
    store.showStep('choose-specialization')

    const data = store.serialize()
    expect(data.guideCompleted).toBe(false)
    expect(data.guideShownStepIds).toContain('welcome')

    const newStore = useGuideStore()
    newStore.deserialize(data)
    expect(newStore.completed).toBe(false)
    expect(newStore.shownStepIds).toContain('welcome')
    expect(newStore.shownStepIds).not.toContain('choose-specialization')
  })

  it('resetGuide 会清空所有进度', () => {
    const store = useGuideStore()
    store.showStep('welcome')
    store.nextStep()
    store.completeGuide()
    store.resetGuide()
    expect(store.completed).toBe(false)
    expect(store.shownStepIds).toEqual([])
    expect(store.currentStep).toBeNull()
  })
})
