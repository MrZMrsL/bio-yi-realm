/**
 * 跨平台存储适配器
 * H5 使用 localStorage，小程序/App 使用 uni.storage
 */

export function getStorageItem(key) {
  // #ifdef H5
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
  // #endif

  // #ifndef H5
  try {
    return uni.getStorageSync(key)
  } catch {
    return null
  }
  // #endif
}

export function setStorageItem(key, value) {
  // #ifdef H5
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
  // #endif

  // #ifndef H5
  try {
    uni.setStorageSync(key, value)
    return true
  } catch {
    return false
  }
  // #endif
}

export function removeStorageItem(key) {
  // #ifdef H5
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
  // #endif

  // #ifndef H5
  try {
    uni.removeStorageSync(key)
    return true
  } catch {
    return false
  }
  // #endif
}
