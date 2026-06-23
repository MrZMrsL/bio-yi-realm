import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TutorialModal from '../../src/components/TutorialModal.vue'
import { useGuideStore } from '../../src/stores/guideStore.ts'

describe('TutorialModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('未触发引导时不渲染弹窗', () => {
    const wrapper = mount(TutorialModal)
    expect(wrapper.find('.tutorial-overlay').exists()).toBe(false)
  })

  it('触发引导后渲染当前步骤标题和文本', () => {
    const guideStore = useGuideStore()
    guideStore.showStep('welcome')

    const wrapper = mount(TutorialModal)
    expect(wrapper.find('.tutorial-overlay').exists()).toBe(true)
    expect(wrapper.find('.tutorial-title').text()).toBe('欢迎来到生化易界！')
    expect(wrapper.find('.tutorial-text').text()).toContain('Roguelike')
  })

  it('点击下一步会进入下一个引导步骤', async () => {
    const guideStore = useGuideStore()
    guideStore.showStep('welcome')
    guideStore.showStep('choose-specialization')

    const wrapper = mount(TutorialModal)
    expect(wrapper.find('.tutorial-title').text()).toBe('欢迎来到生化易界！')

    await wrapper.find('.tutorial-btn').trigger('click')
    expect(wrapper.find('.tutorial-title').text()).toBe('选择你的知识专精')
  })

  it('点击跳过会关闭弹窗', async () => {
    const guideStore = useGuideStore()
    guideStore.showStep('welcome')

    const wrapper = mount(TutorialModal)
    expect(wrapper.find('.tutorial-overlay').exists()).toBe(true)

    await wrapper.find('.tutorial-skip').trigger('click')
    expect(wrapper.find('.tutorial-overlay').exists()).toBe(false)
    expect(guideStore.completed).toBe(true)
  })
})
