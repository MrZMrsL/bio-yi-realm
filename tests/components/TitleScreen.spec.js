import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TitleScreen from '../../src/components/TitleScreen.vue'

// 模拟 uni-app 平台判断
vi.mock('../../src/platform/env.js', () => ({
  isH5: () => true,
  isMiniProgram: () => false,
  isApp: () => false,
}))

describe('TitleScreen', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('渲染标题和输入框', () => {
    const wrapper = mount(TitleScreen)
    expect(wrapper.find('.game-title').exists()).toBe(true)
    expect(wrapper.find('.name-input').exists()).toBe(true)
    expect(wrapper.find('.start-btn').exists()).toBe(true)
  })

  it('输入框可以输入文字', async () => {
    const wrapper = mount(TitleScreen)
    const input = wrapper.find('.name-input')
    await input.setValue('测试玩家')
    expect(input.element.value).toBe('测试玩家')
  })

  it('空名字点击开始会显示错误', async () => {
    const wrapper = mount(TitleScreen)
    await wrapper.find('.start-btn').trigger('click')
    expect(wrapper.find('.name-error').exists()).toBe(true)
    expect(wrapper.find('.name-error-text').text()).toBe('名字不能为空')
  })

  it('输入名字后点击开始会触发 start 事件', async () => {
    const wrapper = mount(TitleScreen)
    const input = wrapper.find('.name-input')
    await input.setValue('勇者')
    await wrapper.find('.start-btn').trigger('click')
    expect(wrapper.emitted('start')).toBeTruthy()
    expect(wrapper.emitted('start')[0]).toEqual(['勇者'])
  })

  it('输入框可以原生聚焦', async () => {
    const wrapper = mount(TitleScreen, { attachTo: document.body })
    const input = wrapper.find('.name-input')
    input.element.focus()
    expect(document.activeElement).toBe(input.element)
    wrapper.unmount()
  })
})
