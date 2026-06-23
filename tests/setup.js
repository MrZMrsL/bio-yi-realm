import { config } from '@vue/test-utils'

// 全局 mock uni-app 的 uni 对象
if (typeof globalThis.uni === 'undefined') {
  globalThis.uni = {
    getStorageSync: () => null,
    setStorageSync: () => {},
    removeStorageSync: () => {},
    setClipboardData: () => {},
    showToast: () => {},
    navigateTo: () => {},
    reLaunch: () => {},
    request: () => {},
    createInnerAudioContext: () => ({
      play: () => {},
      stop: () => {},
      destroy: () => {},
    }),
  }
}

// 全局 mock window.localStorage
if (typeof globalThis.localStorage === 'undefined') {
  const store = {}
  globalThis.localStorage = {
    getItem: key => store[key] || null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: key => { delete store[key] },
    clear: () => { Object.keys(store).forEach(key => delete store[key]) },
  }
}

// 全局 mock matchMedia
if (typeof globalThis.matchMedia === 'undefined') {
  globalThis.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  })
}

// 配置 Vue Test Utils 全局 stubs
config.global.stubs = {
  // 避免 uni-app 组件在测试中报错
  'uni-icons': true,
}
