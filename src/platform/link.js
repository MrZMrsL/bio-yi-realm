/**
 * 跨平台外部链接打开适配器
 */

import { isH5 } from './env.js'

/**
 * 打开外部链接
 * @param {string} url
 * @param {object} options
 */
export function openExternalLink(url, options = {}) {
  // #ifdef H5
  window.open(url, options.target || '_blank')
  // #endif

  // #ifndef H5
  // 非 H5 平台：复制链接到剪贴板并提示用户
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success',
      })
    },
    fail: () => {
      uni.showToast({
        title: '链接复制失败',
        icon: 'none',
      })
    },
  })
  // #endif
}
