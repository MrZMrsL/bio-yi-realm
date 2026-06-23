/**
 * 新手引导状态管理
 *
 * 负责：
 * 1. 记录哪些引导步骤已展示
 * 2. 控制当前显示的引导弹窗
 * 3. 提供跳过/完成引导的能力
 * 4. 序列化到存档
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { GUIDE_STEPS, GUIDE_STEP_IDS, type GuideStep } from '../data/guideSteps.ts'
import { logger } from '../utils/logger.js'

export const GUIDE_SAVE_KEY = 'guide'

export const useGuideStore = defineStore('guide', () => {
  // 是否已经完成全部引导（点击跳过也会标记为完成）
  const completed = ref<boolean>(false)
  // 已经展示过的步骤 id
  const shownStepIds = ref<string[]>([])
  // 当前正在显示的步骤
  const currentStepId = ref<string | null>(null)
  // 等待展示的步骤队列（按触发顺序）
  const pendingStepIds = ref<string[]>([])

  const currentStep = computed<GuideStep | null>(() => {
    if (!currentStepId.value) return null
    return GUIDE_STEPS.find(s => s.id === currentStepId.value) || null
  })

  const totalSteps = computed(() => GUIDE_STEPS.length)
  const shownCount = computed(() => shownStepIds.value.length)

  /** 引导是否已经完全结束 */
  const isGuideFinished = computed(() => completed.value)

  /**
   * 尝试展示某个步骤
   * 如果当前已有步骤在展示，则加入待展示队列
   * @returns 是否成功加入队列或弹出
   */
  function showStep(stepId: string): boolean {
    if (completed.value) return false
    if (shownStepIds.value.includes(stepId)) return false
    if (!GUIDE_STEP_IDS.includes(stepId)) {
      logger.warn(`引导步骤 ${stepId} 不存在`)
      return false
    }
    if (pendingStepIds.value.includes(stepId)) return false

    if (currentStepId.value) {
      pendingStepIds.value.push(stepId)
    } else {
      currentStepId.value = stepId
    }
    return true
  }

  /**
   * 关闭当前步骤并记录为已展示
   * 如果队列有待展示步骤，自动展示下一个
   */
  function markCurrentStepShown(): void {
    if (!currentStepId.value) return
    if (!shownStepIds.value.includes(currentStepId.value)) {
      shownStepIds.value.push(currentStepId.value)
    }

    if (pendingStepIds.value.length > 0) {
      currentStepId.value = pendingStepIds.value.shift() || null
    } else {
      currentStepId.value = null
    }
  }

  /**
   * 进入下一步（如果有当前步骤则先标记为已展示）
   */
  function nextStep(): void {
    markCurrentStepShown()
  }

  /**
   * 跳过全部引导
   */
  function skipGuide(): void {
    markCurrentStepShown()
    completed.value = true
    currentStepId.value = null
    logger.log('新手引导已跳过')
  }

  /**
   * 完成全部引导
   */
  function completeGuide(): void {
    markCurrentStepShown()
    completed.value = true
    currentStepId.value = null
    logger.log('新手引导已完成')
  }

  /**
   * 重置引导状态（用于删档或重新体验）
   */
  function resetGuide(): void {
    completed.value = false
    shownStepIds.value = []
    pendingStepIds.value = []
    currentStepId.value = null
  }

  function serialize(): Record<string, unknown> {
    return {
      guideCompleted: completed.value,
      guideShownStepIds: [...shownStepIds.value],
      guidePendingStepIds: [...pendingStepIds.value],
    }
  }

  function deserialize(data: Record<string, unknown>): void {
    completed.value = (data.guideCompleted as boolean) || false
    shownStepIds.value = Array.isArray(data.guideShownStepIds)
      ? (data.guideShownStepIds as string[]).filter(id => GUIDE_STEP_IDS.includes(id))
      : []
    pendingStepIds.value = Array.isArray(data.guidePendingStepIds)
      ? (data.guidePendingStepIds as string[]).filter(id => GUIDE_STEP_IDS.includes(id))
      : []
  }

  return {
    completed,
    shownStepIds,
    pendingStepIds,
    currentStepId,
    currentStep,
    totalSteps,
    shownCount,
    isGuideFinished,
    showStep,
    markCurrentStepShown,
    nextStep,
    skipGuide,
    completeGuide,
    resetGuide,
    serialize,
    deserialize,
  }
})
