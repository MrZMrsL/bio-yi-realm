import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import { useToast } from './useToast.js'
import { logger } from '../utils/logger.js'

/**
 * PWA Service Worker 更新管理
 *
 * 使用 autoUpdate 模式：检测到新版本后自动提示并强制刷新，
 * 避免用户长期停留在旧版本导致缓存不一致。
 * 同时提供手动检查入口，供设置面板调用。
 *
 * 注意：组件中应通过 inject('pwaUpdate') 获取 App.vue 提供的实例，
 * 避免重复注册 Service Worker。
 */
export function usePwaUpdate() {
  const toast = useToast()

  const needRefresh = ref(false)
  let updateSW = null
  let swRegistration = null
  let isManualChecking = false

  function applyUpdate() {
    if (updateSW) {
      updateSW(true)
    } else {
      toast.error('更新失败，请刷新页面重试')
    }
  }

  async function checkForUpdate(options = {}) {
    if (!swRegistration) {
      toast.info('Service Worker 尚未就绪，请稍后再试')
      return { hasUpdate: false }
    }

    const waitMs = options.waitMs ?? 2000
    isManualChecking = true
    needRefresh.value = false
    toast.info('正在检查更新...')

    try {
      await swRegistration.update()
      // update() 是异步触发，给 SW 一点时间去下载并触发 onNeedRefresh
      await new Promise(resolve => setTimeout(resolve, waitMs))
    } catch (e) {
      logger.error('[PWA] 检查更新失败:', e)
      toast.error('检查更新失败')
      isManualChecking = false
      return { hasUpdate: false }
    }

    isManualChecking = false

    if (needRefresh.value) {
      return { hasUpdate: true }
    }

    toast.success('当前已是最新版本')
    return { hasUpdate: false }
  }

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      needRefresh.value = true
      if (isManualChecking) {
        // 手动检查时由设置面板控制是否刷新，这里不自动执行
        return
      }
      // 非手动场景（页面刚加载时发现新版本）：自动提示并刷新
      toast.info('发现新版本，正在自动刷新...', 2000)
      setTimeout(() => {
        applyUpdate()
      }, 800)
    },
    onOfflineReady() {
      // 可选：提示已可离线游玩。当前保持静默，避免打扰。
    },
    onRegistered(r) {
      if (r) {
        swRegistration = r
        logger.log('[PWA] Service Worker 已注册')
      }
    },
    onRegisterError(error) {
      logger.error('[PWA] Service Worker 注册失败:', error)
    },
  })

  return {
    needRefresh,
    checkForUpdate,
    applyUpdate,
  }
}
